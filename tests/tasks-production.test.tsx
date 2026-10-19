// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { completeTask, emptySnapshot, manual, moveTask, newTask, parseSnapshot, visibleTasks, type Snapshot } from '../src/tasks/domain';
import { TaskStore } from '../src/tasks/store';
import { accountAdapter, guestAdapter, GUEST_KEY, readGuest, TaskError, type TaskAdapter } from '../src/tasks/persistence';
import { fromEditor, toEditor } from '../src/tasks/viewAdapter';
import { TasksPage } from '../src/tasks/TasksPage';
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({client:null,session:null,loading:false,recovering:false,error:null})}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
const owner='a1000000-0000-4000-8000-000000000001';
function memory(initial=emptySnapshot()) {
 let saved=structuredClone(initial);
 const adapter:TaskAdapter={load:vi.fn(async()=>structuredClone(saved)),save:vi.fn(async change=>{
  if(saved.mutationId===change.mutationId)return structuredClone(saved);
  if(change.base!==saved.revision)throw new TaskError('conflict');
  saved=structuredClone({revision:change.base+1,tasks:change.tasks,importedIds:change.importedIds,mutationId:change.mutationId});return structuredClone(saved);
 })};
 return {adapter,get:()=>saved,set:(snapshot:Snapshot)=>{saved=snapshot;}};
}
beforeEach(()=>{
 localStorage.clear();
 vi.stubGlobal('matchMedia',(query:string)=>({matches:false,media:query,addEventListener(){},removeEventListener(){}}));
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:vi.fn(async(_name:string,fn:()=>unknown)=>fn())}});
 HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});

describe('canonical collection',()=>{
 it('preserves properties, remembers reopened status, and keeps per-column order',()=>{
  const a=newTask('A',null,'doing',[]),b=newTask('B',null,'doing',[a]),c=newTask('C',null,'later',[a,b]);
  const done=completeTask([a,b,c],a.id,true);expect(done.find(t=>t.id===a.id)?.completedAt).toBeTruthy();
  const reopened=completeTask(done,a.id,false);expect(reopened.find(t=>t.id===a.id)).toMatchObject({status:'doing',completedAt:null,previousStatus:'doing'});
  const moved=moveTask(reopened,a.id,'doing',b.id);expect(manual(moved).filter(t=>t.status==='doing').map(t=>t.title)).toEqual(['A','B']);
  expect(moved.find(t=>t.id===c.id)).toEqual(c);
 });
 it('does not mutate manual order when filtering/sorting and keeps difficulty independent',()=>{
  const a={...newTask('A',null,'next',[]),difficulty:5 as const,deadline:'2026-10-22'},b={...newTask('B',null,'next',[]),rank:1,deadline:'2026-10-20'};
  expect(visibleTasks([a,b],'all','deadline','2026-10-20').map(t=>t.title)).toEqual(['B','A']);
  expect(visibleTasks([a,b],'today','manual','2026-10-20')).toEqual([b]);
  expect(visibleTasks([a,b],'upcoming','manual','2026-10-20')).toEqual([a]);
  expect(manual([a,b]).map(t=>t.title)).toEqual(['A','B']);expect(a.urgency).toBe(0);
 });
 it('uses the same user-authored text in either language and persists subtask metadata',()=>{
  const a=newTask('Prvi zadatak',null,'next',[]),id=crypto.randomUUID();
  const updated=fromEditor([a],a.id,{title:{en:'New title','sr-Latn':a.title},subtasks:[{id,title:{en:'Step','sr-Latn':'Korak'},done:true}]},'en');
  expect(toEditor(updated[0]).title['sr-Latn']).toBe('New title');expect(updated[0].subtasks[0]).toMatchObject({id,rank:0,title:'Step'});
  expect(updated[0].subtasks[0].completedAt).toBeTruthy();expect(updated[0].status).toBe('next');
 });
 it('rejects corrupt ownership, impossible dates and inconsistent completion',()=>{
  const task=newTask('A',null,'next',[]);
  for(const patch of [{ownerId:owner},{deadline:'2026-02-30'},{status:'done'},{difficulty:6},{minutes:0}])expect(()=>parseSnapshot({...emptySnapshot(),tasks:[{...task,...patch}]},null)).toThrow();
 });
});

describe('persistence coordinator',()=>{
 it('saves optimistically and reloads an account collection with no fixtures',async()=>{
  const {adapter}=memory();const store=new TaskStore(owner,adapter);await store.refresh();
  const task=newTask('Account task',owner,'next',[]);store.edit(()=>[task]);expect(store.getSnapshot().tasks).toEqual([task]);expect(store.getSnapshot().dirty).toBe(true);
  await store.flush();expect(store.getSnapshot().dirty).toBe(false);
  const second=new TaskStore(owner,adapter);await second.refresh();expect(second.getSnapshot().tasks).toEqual([task]);
 });
 it('retains failed edits and retries the exact mutation without duplicates after a lost response',async()=>{
  const {adapter}=memory();const save=adapter.save;let fail=true;
  adapter.save=vi.fn(async change=>{const result=await save(change);if(fail){fail=false;throw new TaskError('network');}return result;});
  const store=new TaskStore(null,adapter);await store.refresh();store.edit(()=>[newTask('A',null,'next',[])]);await store.flush();
  expect(store.getSnapshot()).toMatchObject({dirty:true,error:'network'});const id=store.getSnapshot().tasks[0].id;
  await store.flush();expect(store.getSnapshot()).toMatchObject({dirty:false,error:null});expect(store.getSnapshot().tasks.map(t=>t.id)).toEqual([id]);
  expect(vi.mocked(adapter.save).mock.calls[0][0].mutationId).toBe(vi.mocked(adapter.save).mock.calls[1][0].mutationId);
 });
 it('serializes edits made while saving',async()=>{
  const {adapter}=memory();const save=adapter.save;let resolve!:()=>void;const gate=new Promise<void>(r=>resolve=r);let first=true;
  adapter.save=async change=>{if(first){first=false;await gate;}return save(change);};
  const store=new TaskStore(null,adapter);await store.refresh();const task=newTask('A',null,'next',[]);store.edit(()=>[task]);const saving=store.flush();store.edit(tasks=>fromEditor(tasks,task.id,{notes:{en:'New','sr-Latn':'New'}},'en'));resolve();await saving;
  await waitFor(()=>expect(store.getSnapshot().dirty).toBe(false));expect((await adapter.load()).tasks[0].notes).toBe('New');
 });
 it('preserves unsaved edits on conflict or failed reload; explicit reload retrieves newer data',async()=>{
  const m=memory();const a=new TaskStore(null,m.adapter),b=new TaskStore(null,m.adapter);await a.refresh();await b.refresh();
  a.edit(()=>[newTask('Remote',null,'next',[])]);await a.flush();b.edit(()=>[newTask('Local',null,'next',[])]);await b.flush();
  expect(b.getSnapshot()).toMatchObject({dirty:true,error:'conflict'});await b.refresh();expect(b.getSnapshot().tasks[0].title).toBe('Local');
  const load=m.adapter.load;m.adapter.load=async()=>{throw new Error('offline');};await b.reloadServer();expect(b.getSnapshot().tasks[0].title).toBe('Local');
  m.adapter.load=load;await b.reloadServer();expect(b.getSnapshot().tasks[0].title).toBe('Remote');expect(b.getSnapshot().dirty).toBe(false);
 });
 it('refreshes saved data from a second device and never replaces an edit with a stale load',async()=>{
  const m=memory();const store=new TaskStore(null,m.adapter);await store.refresh();
  m.set({...emptySnapshot(),revision:2,tasks:[newTask('Other device',null,'later',[])]});await store.refresh();expect(store.getSnapshot().tasks[0].title).toBe('Other device');
  let resolve!:(s:Snapshot)=>void;m.adapter.load=()=>new Promise(r=>resolve=r);const loading=store.refresh();store.edit(tasks=>[...tasks,newTask('Pending',null,'next',tasks)]);resolve(emptySnapshot());await loading;
  expect(store.getSnapshot().tasks).toHaveLength(2);await store.flush();
 });
 it('imports explicitly, preserves relationships, retries failures and retains import receipts after deletion',async()=>{
  const m=memory(),store=new TaskStore(owner,m.adapter);await store.refresh();const task=newTask('Guest',null,'later',[]);task.subtasks=[{id:crypto.randomUUID(),title:'Step',rank:0,completedAt:null}];const guest={...emptySnapshot(),tasks:[task]};
  expect(store.getSnapshot().tasks).toHaveLength(0);store.importGuest(guest);await store.flush();store.importGuest(guest);expect(store.getSnapshot().tasks).toHaveLength(1);expect(store.getSnapshot().tasks[0]).toMatchObject({...task,ownerId:owner});
  store.edit(()=>[]);await store.flush();store.importGuest(guest);expect(store.getSnapshot().tasks).toHaveLength(0);expect(guest.tasks).toHaveLength(1);
 });
 it('keeps account scopes separate even when an old load resolves late',async()=>{
  const m=memory({...emptySnapshot(),tasks:[newTask('Private A',owner,'next',[])]});let resolve!:(s:Snapshot)=>void;m.adapter.load=()=>new Promise(r=>resolve=r);
  const a=new TaskStore(owner,m.adapter);const pending=a.refresh();const b=new TaskStore('b1000000-0000-4000-8000-000000000001',memory().adapter);await b.refresh();resolve(m.get());await pending;
  expect(b.getSnapshot().tasks).toEqual([]);expect(a.getSnapshot().tasks[0].title).toBe('Private A');
 });
});

describe('storage adapters',()=>{
 it('persists guests across reloads, rejects stale tabs and notifies on storage events',async()=>{
  const adapter=guestAdapter(),initial=await adapter.load(),task=newTask('Reload',null,'next',[]);
  await adapter.save({base:initial.revision,mutationId:crypto.randomUUID(),tasks:[task],importedIds:[]});expect(readGuest().tasks).toEqual([task]);
  await expect(adapter.save({base:0,mutationId:crypto.randomUUID(),tasks:[],importedIds:[]})).rejects.toMatchObject({code:'conflict'});
  const refresh=vi.fn(),off=adapter.subscribe!(refresh);window.dispatchEvent(new StorageEvent('storage',{key:GUEST_KEY}));expect(refresh).toHaveBeenCalledOnce();off();
 });
 it('never overwrites corrupt browser storage and retains edits when writes fail',async()=>{
  localStorage.setItem(GUEST_KEY,'broken');expect(()=>readGuest()).toThrow();expect(localStorage.getItem(GUEST_KEY)).toBe('broken');localStorage.clear();
  const store=new TaskStore(null,guestAdapter());await store.refresh();vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});store.edit(()=>[newTask('Keep me',null,'next',[])]);await store.flush();expect(store.getSnapshot()).toMatchObject({dirty:true,error:'storage'});expect(store.getSnapshot().tasks[0].title).toBe('Keep me');
 });
 it('guards account identity before RPC and maps conflict responses',async()=>{
  const client={auth:{getSession:vi.fn(async()=>({data:{session:{user:{id:'someone-else'}}}}))},rpc:vi.fn()};
  const adapter=accountAdapter(client as never,owner);await expect(adapter.load()).rejects.toMatchObject({code:'account'});expect(client.rpc).not.toHaveBeenCalled();
  client.auth.getSession.mockResolvedValue({data:{session:{user:{id:owner}}}});client.rpc.mockResolvedValue({error:{code:'PT409'},data:null});await expect(adapter.save({base:1,mutationId:crypto.randomUUID(),tasks:[],importedIds:[]})).rejects.toMatchObject({code:'conflict'});
 });
});

it('Board and List share task edits, subtasks, completion, status, and reload persistence',async()=>{
 render(<TasksPage/>);await screen.findByText('Saved');
 const input=screen.getByRole('textbox',{name:'What do you want to accomplish?'});fireEvent.change(input,{target:{value:'Production task'}});fireEvent.click(screen.getByRole('button',{name:'Add task',exact:true}));
 expect(screen.getByRole('button',{name:'Board',exact:true}).getAttribute('aria-pressed')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'Open task: Production task'}));
 fireEvent.change(screen.getByRole('textbox',{name:'Task title'}),{target:{value:'Edited task'}});
 fireEvent.click(screen.getAllByRole('radio',{name:'4 — Difficult'}).at(-1)!);
 fireEvent.change(screen.getAllByRole('combobox',{name:'Urgency'}).at(-1)!,{target:{value:'2'}});
 fireEvent.change(screen.getByRole('textbox',{name:'Add a subtask'}),{target:{value:'A small step'}});fireEvent.click(screen.getByRole('button',{name:'Add a subtask',exact:true}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete: A small step'}));
 fireEvent.click(screen.getByRole('button',{name:'Back to tasks'}));
 fireEvent.click(screen.getByRole('button',{name:'List',exact:true}));expect(screen.getByRole('button',{name:'Open task: Edited task'})).toBeTruthy();
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete: Edited task'}));fireEvent.click(screen.getByRole('button',{name:'Board',exact:true}));
 expect(within(screen.getByRole('region',{name:/^Done 1/})).getByRole('article',{name:'Edited task'})).toBeTruthy();
 fireEvent.click(screen.getByRole('checkbox',{name:'Reopen: Edited task'}));await waitFor(()=>expect(readGuest().tasks[0]?.status).toBe('next'));
 expect(readGuest().tasks[0]).toMatchObject({title:'Edited task',difficulty:4,urgency:2});expect(readGuest().tasks[0].subtasks[0].completedAt).toBeTruthy();
 cleanup();render(<TasksPage/>);await screen.findByRole('article',{name:'Edited task'});expect(readGuest().tasks).toHaveLength(1);
});

it('a failed import keeps guest data, preserves existing account tasks, and retries without duplicates',async()=>{
 const existing=newTask('Account',owner,'doing',[]),m=memory({...emptySnapshot(),tasks:[existing]});const store=new TaskStore(owner,m.adapter);await store.refresh();
 const guestTask=newTask('Guest',null,'doing',[]),guest={...emptySnapshot(),tasks:[guestTask]};localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:guest}));
 const original=m.adapter.save;m.adapter.save=async()=>{throw new TaskError('network');};store.importGuest(readGuest());await store.flush();expect(readGuest().tasks).toEqual([guestTask]);expect(store.getSnapshot().tasks).toHaveLength(2);
 m.adapter.save=original;await store.flush();store.importGuest(readGuest());expect(store.getSnapshot().tasks).toHaveLength(2);expect(store.getSnapshot().tasks.find(t=>t.id===guestTask.id)?.rank).toBe(1);expect(m.get().importedIds).toEqual([guestTask.id]);
});
it('focus and tab visibility refresh only a clean collection',async()=>{
 const m=memory(),store=new TaskStore(null,m.adapter),off=store.connect();await waitFor(()=>expect(store.getSnapshot().ready).toBe(true));
 m.set({...emptySnapshot(),revision:1,tasks:[newTask('Remote',null,'next',[])]});window.dispatchEvent(new Event('focus'));await waitFor(()=>expect(store.getSnapshot().tasks[0]?.title).toBe('Remote'));
 store.edit(tasks=>fromEditor(tasks,tasks[0].id,{title:{en:'Local','sr-Latn':'Local'}},'en'));window.dispatchEvent(new Event('focus'));expect(store.getSnapshot().tasks[0].title).toBe('Local');await store.flush();off();
});
it('keeps edits usable in memory when storage cannot be read',async()=>{
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});const store=new TaskStore(null,guestAdapter());await store.refresh();expect(store.getSnapshot()).toMatchObject({ready:true,error:'storage'});store.edit(()=>[newTask('Keep',null,'next',[])]);await store.flush();expect(store.getSnapshot()).toMatchObject({dirty:true,error:'storage'});expect(store.getSnapshot().tasks[0].title).toBe('Keep');
});
