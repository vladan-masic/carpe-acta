// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FocusController, focusAt, focusKey, parseFocus } from '../src/tasks/focus/controller';
import { MAX_FOCUSED_SECONDS, parseEntry, statistics, weeklyBars, type FocusEntry } from '../src/tasks/history/domain';
import { guestHistory, readHistory, HISTORY_KEY, accountHistory } from '../src/tasks/history/persistence';
import { HistoryStore } from '../src/tasks/history/store';
const id=()=>crypto.randomUUID();
function entry(patch:Partial<FocusEntry>={}):FocusEntry {const sid=id();return {id:sid,sessionId:sid,ownerId:null,taskId:id(),subtaskId:null,startedAt:null,endedAt:new Date().toISOString(),createdAt:new Date().toISOString(),focusedSeconds:120,chosenMinutes:2,outcome:'progress',...patch};}
function fixture() {
 let now=Date.parse('2026-11-04T10:00:00Z');
 const input={taskId:id(),subtaskId:null,text:'One small step',minutes:2};
 const create=()=>new FocusController('guest',()=>localStorage,()=>now);
 return {input,create,advance:(ms:number)=>{now+=ms;},now:()=>now};
}
beforeEach(()=>{localStorage.clear();const locks=new Map<string,Promise<unknown>>();Object.defineProperty(navigator,'locks',{configurable:true,value:{request:(key:string,work:()=>unknown)=>{const next=(locks.get(key)??Promise.resolve()).catch(()=>{}).then(work);locks.set(key,next);return next;}}});});
afterEach(()=>vi.restoreAllMocks());
describe('confirmed recording',()=>{
 it('keeps cumulative time across pauses, reset, expiry, overtime and restoration',async()=>{
  const f=fixture(),c=f.create();await c.start(f.input);const sid=c.getSnapshot().session!.id;
  f.advance(30000);await c.command('pause',sid);f.advance(3600000);await c.command('resume',sid);f.advance(15000);await c.command('reset',sid);
  expect(c.getSnapshot().session).toMatchObject({elapsedMs:0,totalMs:45000,phase:'paused'});
  await c.command('resume',sid);f.advance(600000);const restored=f.create();await Promise.resolve();
  expect(restored.getSnapshot().session).toMatchObject({phase:'expired',totalMs:165000});
  await restored.command('continue',sid);f.advance(20000);await restored.command('finish',sid);
  expect(restored.getSnapshot().session).toMatchObject({totalMs:185000,elapsedMs:20000});
  await restored.record(sid,150,'progress',async e=>{await guestHistory().save(e);});
  expect(readHistory().entries[0].focusedSeconds).toBe(150);expect(f.create().getSnapshot().session).toBeNull();
 });
 it('does not record timer expiry, completion-independent discard, or browser restoration',async()=>{
  const f=fixture(),c=f.create();await c.start(f.input);f.advance(600000);const restored=f.create();
  expect(readHistory().entries).toEqual([]);await restored.command('end',restored.getSnapshot().session!.id);expect(readHistory().entries).toEqual([]);
 });
 it('extends legacy v1 without erasing active state or inventing lost reset time',async()=>{
  const f=fixture(),c=f.create();await c.start(f.input);const original=c.getSnapshot().session!;
  const {totalMs,startedAtMs,reviewedAtMs,recording,...legacy}=original;void totalMs;void startedAtMs;void reviewedAtMs;void recording;
  localStorage.setItem(focusKey('guest'),JSON.stringify({...legacy,phase:'paused',anchorMs:null,elapsedMs:45000}));
  const restored=f.create().getSnapshot().session!;expect(restored).toMatchObject({id:original.id,totalMs:45000,elapsedMs:45000,startedAtMs:null,phase:'paused'});
  expect(parseFocus(JSON.stringify(legacy),'guest')?.id).toBe(original.id);
 });
 it('retains the exact confirmation after ambiguous failure and reload; retry and simultaneous tabs produce one record',async()=>{
  const f=fixture(),a=f.create();await a.start(f.input);const sid=a.getSnapshot().session!.id;f.advance(60000);await a.command('finish',sid);
  const adapter=guestHistory();await expect(a.record(sid,45,'progress',async e=>{await adapter.save(e);throw Error('response lost');})).rejects.toThrow();
  expect(f.create().getSnapshot().session?.recording?.focusedSeconds).toBe(45);
  const b=f.create();expect(await b.command('continue',sid)).toBe(false);expect(await b.start(f.input,sid)).toBe(false);
  const results=await Promise.all([a.record(sid,1,'stopped',async e=>{await adapter.save(e);}),b.record(sid,20,'task',async e=>{await adapter.save(e);})]);
  expect(results.sort()).toEqual([false,true]);expect(readHistory().entries).toHaveLength(1);expect(readHistory().entries[0]).toMatchObject({focusedSeconds:45,outcome:'progress'});
 });
 it('requires a valid user-confirmed duration, caps closed-browser time, and rejects storage failure before network',async()=>{
  const f=fixture(),c=f.create();await c.start({...f.input,minutes:0});const sid=c.getSnapshot().session!.id;f.advance(3*86400000);await c.command('finish',sid);const save=vi.fn();
  for(const seconds of [0,-1,1.2,NaN,MAX_FOCUSED_SECONDS+1])await expect(c.record(sid,seconds,null,save)).rejects.toThrow();
  expect(save).not.toHaveBeenCalled();const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('full');});
  await expect(c.record(sid,60,null,save)).rejects.toThrow();expect(save).not.toHaveBeenCalled();expect(c.getSnapshot().session?.recording?.focusedSeconds).toBe(60);spy.mockRestore();await c.retry();
  await c.record(sid,60,null,async e=>{await guestHistory().save(e);});expect(readHistory().entries[0].focusedSeconds).toBe(60);
 });
 it('rejects confirmed duration above cumulative elapsed',async()=>{const f=fixture(),c=f.create();await c.start(f.input);const sid=c.getSnapshot().session!.id;f.advance(10000);await c.command('finish',sid);await expect(c.record(sid,11,null,async()=>{})).rejects.toThrow();});
});
describe('guest history and import',()=>{
 it('serializes different sessions across tabs, retains delete receipts and never resurrects duplicates',async()=>{
  const a=guestHistory(),b=guestHistory(),first=entry(),second=entry();await Promise.all([a.save(first),b.save(second),a.save(first)]);
  expect(readHistory().entries).toHaveLength(2);await b.remove(first.id);expect(await a.save(first)).toBeNull();expect(readHistory().entries).toHaveLength(1);expect(readHistory().seen).toContain(first.id);
 });
 it('does not overwrite corrupt, full, or unavailable storage',async()=>{
  localStorage.setItem(HISTORY_KEY,'{broken');await expect(guestHistory().save(entry())).rejects.toThrow();expect(localStorage.getItem(HISTORY_KEY)).toBe('{broken');localStorage.clear();
  const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('full');});await expect(guestHistory().save(entry())).rejects.toThrow();spy.mockRestore();expect(readHistory().entries).toEqual([]);
  Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});await expect(guestHistory().save(entry())).rejects.toThrow();
 });
 it('imports explicitly, preserves guests on partial failure, retries safely, and isolates owners',async()=>{
  const a=entry(),b=entry();await guestHistory().save(a);await guestHistory().save(b);const saved=new Map<string,FocusEntry>();let fail=true;
  const adapter={load:async()=>({entries:[...saved.values()],seen:[...saved.keys()]}),save:vi.fn(async(e:FocusEntry)=>{if(e.id===b.id&&fail)throw Error('offline');if(!saved.has(e.id))saved.set(e.id,e);return saved.get(e.id)!;}),remove:async()=>{}};
  const store=new HistoryStore('account-a',adapter);await store.refresh();expect(adapter.save).not.toHaveBeenCalled();await store.importGuest();expect(store.getSnapshot().error).toBe(true);expect(readHistory().entries).toHaveLength(2);
  fail=false;await store.importGuest();await store.importGuest();expect(saved.size).toBe(2);expect([...saved.values()].every(e=>e.ownerId==='account-a')).toBe(true);expect(readHistory().entries.every(e=>e.ownerId===null)).toBe(true);
 });
});
describe('calendar statistics',()=>{
 it('uses Monday local weeks and inclusive local last-30-day boundaries, excluding future records',()=>{
  const now=new Date(2026,10,4,12),make=(d:Date)=>entry({endedAt:d.toISOString()});
  const monday=new Date(2026,10,2),sunday=new Date(2026,10,1,23,59,59),start30=new Date(2026,9,6);
  const records=[make(monday),make(sunday),make(start30),make(new Date(2026,9,5,23,59,59)),make(new Date(2026,10,5))];
  expect(statistics(records,'week',now)).toMatchObject({sessions:1,days:1,seconds:120});expect(statistics(records,'month',now).sessions).toBe(3);expect(statistics(records,'all',now).sessions).toBe(4);
  expect(weeklyBars(records,now).map(b=>b.seconds)).toEqual([120,0,0,0,0,0,0]);
 });
 it('groups the repeated autumn hour into one active day, and handles DST week length',()=>{
  const now=new Date('2026-10-25T23:30:00+01:00');
  const entries=[entry({endedAt:'2026-10-25T02:15:00+02:00'}),entry({endedAt:'2026-10-25T02:15:00+01:00'})];
  expect(statistics(entries,'week',now)).toMatchObject({sessions:2,days:1,seconds:240});expect(weeklyBars(entries,now).reduce((s,b)=>s+b.seconds,0)).toBe(240);
 });
 it('validates identifiers, ownership, timestamps, bounds and nullable outcomes',()=>{
  const valid=entry();expect(parseEntry(valid,null)).toEqual(valid);
  for(const patch of [{ownerId:'other'},{id:id()},{focusedSeconds:43201},{focusedSeconds:0},{chosenMinutes:1},{outcome:'score'},{endedAt:'invalid'}])expect(()=>parseEntry({...valid,...patch},null)).toThrow();
 });
});
it('account adapter checks the live owner and paginates beyond the default response cap',async()=>{
 const owner=id();let user=owner;const all=Array.from({length:503},()=>entry({ownerId:owner})).sort((a,b)=>a.id.localeCompare(b.id));
 const raw=(e:FocusEntry)=>({id:e.id,session_id:e.sessionId,user_id:owner,task_id:e.taskId,subtask_id:null,started_at:null,ended_at:e.endedAt,focused_seconds:e.focusedSeconds,chosen_minutes:e.chosenMinutes,outcome:e.outcome,created_at:e.createdAt});
 const rpc=vi.fn(async()=>({data:raw(all[0]),error:null}));const ranges:number[]=[];
 const client={auth:{getSession:async()=>({data:{session:{user:{id:user}}},error:null})},rpc,from:(table:string)=>({select:()=>({eq:(_key:string,value:string)=>{expect(value).toBe(owner);return {order:()=>({limit:()=>{
   let after:string|null=null;
   return {gt:(_key:string,id:string)=>{after=id;return {then:(resolve:(result:unknown)=>void)=>resolve(result())};},then:(resolve:(result:unknown)=>void)=>resolve(result())};
   function result(){const start=after?all.findIndex(e=>e.id===after)+1:0;ranges.push(start);return {data:all.slice(start,start+500).map(e=>table==='focus_history'?raw(e):{session_id:e.id}),error:null};}
 }})};}})})};
 const adapter=accountHistory(client as never,owner);expect((await adapter.load()).entries).toHaveLength(503);expect(ranges.sort()).toEqual([0,0,500,500]);await adapter.save(all[0]);expect(rpc).toHaveBeenCalledTimes(1);user=id();await expect(adapter.save(all[0])).rejects.toThrow('Account changed');expect(rpc).toHaveBeenCalledTimes(1);
});
it('dates a restored expiry and paused session at the last timed work, not the later review',async()=>{
 const f=fixture(),c=f.create();await c.start(f.input);const sid=c.getSnapshot().session!.id,expected=f.now()+120000;
 f.advance(2*86400000);const restored=f.create();await restored.command('finish',sid);await restored.record(sid,60,'progress',async e=>{await guestHistory().save(e);});
 expect(Date.parse(readHistory().entries[0].endedAt)).toBe(expected);
 await restored.start({...f.input,minutes:0});const second=restored.getSnapshot().session!.id;f.advance(30000);await restored.command('pause',second);const pausedAt=f.now();f.advance(86400000);
 await restored.command('finish',second);await restored.record(second,20,null,async e=>{await guestHistory().save(e);});expect(Date.parse(readHistory().entries[1].endedAt)).toBe(pausedAt);
});
