// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TasksPage } from '../src/tasks/TasksPage';
import { emptySnapshot, newTask, type Snapshot } from '../src/tasks/domain';
import { GUEST_KEY, readGuest } from '../src/tasks/persistence';
const auth=vi.hoisted(()=>({client:null as any,session:null as any,loading:false,recovering:false,error:null}));
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>auth}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
const alice='a1000000-0000-4000-8000-000000000001',bob='b1000000-0000-4000-8000-000000000001';
let records:Map<string,Snapshot>;
beforeEach(()=>{
 localStorage.clear();auth.session=null;auth.client=null;records=new Map();
 vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));
 HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();
 auth.client={auth:{getSession:async()=>({data:{session:auth.session}})},rpc:vi.fn(async(name:string,args:any)=>{
  if(auth.session?.user.id!==args.p_owner)return {data:null,error:{code:'42501'}};
  const snapshot=records.get(args.p_owner)??emptySnapshot();
  if(name==='read_tasks')return {data:structuredClone(snapshot),error:null};
  if(snapshot.mutationId===args.p_mutation)return {data:structuredClone(snapshot),error:null};
  if(snapshot.revision!==args.p_expected)return {data:null,error:{code:'40001'}};
  const next={revision:snapshot.revision+1,mutationId:args.p_mutation,tasks:args.p_tasks,importedIds:args.p_import_ids};records.set(args.p_owner,structuredClone(next));return {data:structuredClone(next),error:null};
 })};
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('imports only on request, reloads account data, and isolates another signed-in account',async()=>{
 const guest=newTask('Guest draft',null,'next',[]);localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks:[guest]}}));
 records.set(alice,{...emptySnapshot(),tasks:[newTask('Alice private',alice,'later',[])]});auth.session={user:{id:alice}};
 const {rerender}=render(<TasksPage/>);await screen.findByRole('article',{name:'Alice private'});expect(screen.queryByRole('article',{name:'Guest draft'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Import browser tasks'}));await screen.findByRole('article',{name:'Guest draft'});await waitFor(()=>expect(records.get(alice)?.tasks).toHaveLength(2));expect(readGuest().tasks).toEqual([guest]);
 fireEvent.click(screen.getByRole('button',{name:'Import browser tasks'}));expect(records.get(alice)?.tasks).toHaveLength(2);
 auth.session={user:{id:bob}};rerender(<TasksPage/>);await screen.findByText('Saved');expect(screen.queryByRole('article',{name:'Alice private'})).toBeNull();expect(screen.queryByRole('article',{name:'Guest draft'})).toBeNull();
 auth.session={user:{id:alice}};cleanup();render(<TasksPage/>);await screen.findByRole('article',{name:'Alice private'});await screen.findByRole('article',{name:'Guest draft'});
 expect(records.get(bob)).toBeUndefined();
});
it('does not expose a stale response after account switching',async()=>{
 let finish!:(result:any)=>void;const rpc=auth.client.rpc;
 auth.client.rpc=vi.fn((name:string,args:any)=>args.p_owner===alice?new Promise(resolve=>finish=resolve):rpc(name,args));
 auth.session={user:{id:alice}};const {rerender}=render(<TasksPage/>);await waitFor(()=>expect(finish).toBeTypeOf('function'));
 auth.session={user:{id:bob}};rerender(<TasksPage/>);await screen.findByText('Saved');finish({data:{...emptySnapshot(),tasks:[newTask('Private late response',alice,'next',[])]},error:null});
 await waitFor(()=>expect(screen.queryByText('Private late response')).toBeNull());expect(screen.queryByRole('article')).toBeNull();
});
