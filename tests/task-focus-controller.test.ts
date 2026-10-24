import { describe, expect, it, vi } from 'vitest';
import { FocusController, focusAt, focusKey, focusSeconds, parseFocus } from '../src/tasks/focus/controller';
function fixture(){
 let now=1_000_000;
 const values=new Map<string,string>();
 const storage={getItem:(key:string)=>values.get(key)??null,setItem:vi.fn((key:string,value:string)=>{values.set(key,value);}),removeItem:(key:string)=>{values.delete(key);}};
 const create=(scope='guest')=>new FocusController(scope,()=>storage,()=>now);
 return {create,storage,values,advance:(ms:number)=>{now+=ms;},now:()=>now};
}
const input={taskId:'task-a',subtaskId:'step-a',text:'Read one paragraph',minutes:2};
describe('owner-scoped persistent focus controller',()=>{
 it('restores running timestamps after suspension without ticking writes',async()=>{
  const f=fixture(),c=f.create();await c.start(input);f.advance(45000);
  expect(focusSeconds(focusAt(c.getSnapshot().session!,f.now()))).toBe(75);
  expect(f.storage.setItem).toHaveBeenCalledTimes(1);
  expect(focusSeconds(f.create().getSnapshot().session!)).toBe(75);
 });
 it('restores pause without resuming, and resumes/reset/finishes explicitly',async()=>{
  const f=fixture(),c=f.create();await c.start(input);const id=c.getSnapshot().session!.id;
  f.advance(30000);await c.command('pause',id);f.advance(3600000);
  const restored=f.create();expect(restored.getSnapshot().session).toMatchObject({phase:'paused',elapsedMs:30000});
  await restored.command('resume',id);f.advance(10000);await restored.command('pause',id);
  expect(restored.getSnapshot().session!.elapsedMs).toBe(40000);
  await restored.command('reset',id);expect(restored.getSnapshot().session).toMatchObject({phase:'paused',elapsedMs:0});
  await restored.command('finish',id);expect(f.create().getSnapshot().session?.phase).toBe('review');
 });
 it('restores expiry while closed and only continues on request',async()=>{
  const f=fixture(),c=f.create();await c.start(input);f.advance(900000);
  const restored=f.create(),s=restored.getSnapshot().session!;expect(s.phase).toBe('expired');expect(focusSeconds(s)).toBe(0);
  await restored.command('continue',s.id);f.advance(1000);expect(focusSeconds(focusAt(restored.getSnapshot().session!,f.now()))).toBe(1);
  expect(restored.getSnapshot().session!.overtime).toBe(true);
 });
 it('counts untimed focus across reload and ends without a task mutation',async()=>{
  const f=fixture(),c=f.create();await c.start({...input,minutes:0});f.advance(75000);
  const restored=f.create();expect(focusSeconds(restored.getSnapshot().session!)).toBe(75);
  await restored.command('end',restored.getSnapshot().session!.id);expect(f.create().getSnapshot().session).toBeNull();
 });
 it('requires a matching explicit replacement and rejects stale commands across tabs',async()=>{
  const f=fixture(),a=f.create(),b=f.create();await a.start(input);const old=a.getSnapshot().session!.id;
  expect(await b.start({...input,taskId:'other'})).toBe(false);
  expect(await b.start({...input,taskId:'other'},old)).toBe(true);
  expect(await a.command('end',old)).toBe(false);expect(await a.start(input,old)).toBe(false);
  expect(a.getSnapshot().session!.taskId).toBe('other');
 });
 it('separates guest and accounts and restores the same owner',async()=>{
  const f=fixture();await f.create().start(input);await f.create('alice').start({...input,text:'Alice action'});
  expect(f.create('bob').getSnapshot().session).toBeNull();expect(f.create().getSnapshot().session!.text).toBe(input.text);
  expect(f.create('alice').getSnapshot().session!.text).toBe('Alice action');
  expect(()=>parseFocus(f.values.get(focusKey('alice'))!,'bob')).toThrow();
 });
 it('handles corrupt, unsupported, invalid timing and excessive records',async()=>{
  const f=fixture(),c=f.create();await c.start(input);const valid=c.getSnapshot().session!;
  for(const patch of [{version:2},{phase:'bogus'},{minutes:3},{text:' '},{text:'x'.repeat(201)},{elapsedMs:-1},{anchorMs:null},{elapsedMs:Infinity}])expect(()=>parseFocus(JSON.stringify({...valid,...patch}),'guest')).toThrow();
  f.values.set(focusKey('guest'),'{broken');expect(f.create().getSnapshot()).toEqual({session:null,error:'corrupt'});
 });
 it('retains memory edits when storage fails and retries',async()=>{
  const f=fixture(),c=f.create();f.storage.setItem.mockImplementationOnce(()=>{throw Error('quota');});
  await c.start(input);expect(c.getSnapshot().error).toBe('storage');const id=c.getSnapshot().session!.id;
  c.restore();expect(c.getSnapshot().session!.id).toBe(id);await c.retry();expect(c.getSnapshot().error).toBeNull();expect(f.create().getSnapshot().session!.id).toBe(id);
 });
 it('survives a blocked storage getter with usable in-memory focus',async()=>{
  const c=new FocusController('guest',()=>{throw Error('denied');});await c.start(input);
  expect(c.getSnapshot()).toMatchObject({error:'storage',session:{text:input.text}});
 });
 it('pauses defensively after a backward clock change and caps large forward jumps',async()=>{
  const f=fixture(),c=f.create();await c.start(input);f.advance(-5000);expect(f.create().getSnapshot().session?.phase).toBe('paused');
  f.advance(1e12);expect(f.create().getSnapshot().session?.phase).toBe('paused');
  const fresh=f.create('forward');await fresh.start(input);f.advance(1e12);expect(f.create('forward').getSnapshot().session?.phase).toBe('expired');
 });
});
it('does not overwrite a newer tab session when retrying a failed write',async()=>{
 const f=fixture(),a=f.create(),b=f.create();f.storage.setItem.mockImplementationOnce(()=>{throw Error('quota');});
 await a.start(input);const local=a.getSnapshot().session!.id;
 await b.start({...input,text:'Other tab'});const remote=b.getSnapshot().session!.id;
 await a.retry();expect(a.getSnapshot()).toMatchObject({error:'conflict',session:{id:local}});expect(f.create().getSnapshot().session!.id).toBe(remote);
 a.useSaved();expect(a.getSnapshot()).toMatchObject({error:null,session:{id:remote}});
});
