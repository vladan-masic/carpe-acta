// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TasksPage } from '../src/tasks/TasksPage';
import { FocusController, focusKey } from '../src/tasks/focus/controller';
import { newTask, emptySnapshot } from '../src/tasks/domain';
import { GUEST_KEY, readGuest } from '../src/tasks/persistence';
import { HISTORY_KEY, readHistory } from '../src/tasks/history/persistence';
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({client:null,session:null,loading:false,error:null})}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
beforeEach(()=>{
 localStorage.clear();window.history.replaceState(null,'','/tasks');
 vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async(_key:string,fn:()=>unknown)=>fn()}});
 HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function seed(){const task=newTask('Review a short chapter',null,'next',[]);task.subtasks=[{id:crypto.randomUUID(),title:'Read the opening',rank:0,completedAt:null}];localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks:[task]}}));const c=new FocusController('guest',()=>localStorage,()=>Date.now()-120000);await c.start({taskId:task.id,subtaskId:task.subtasks[0].id,text:'Read the opening',minutes:2});return task;}
async function click(name:string,root?:HTMLElement){await act(async()=>{fireEvent.click((root?within(root):screen).getByRole('button',{name,exact:true}));});}
async function review(){await click('End session');return screen.getByRole('dialog',{name:'Review focus session'});}
function duration(root:HTMLElement){fireEvent.change(within(root).getByRole('spinbutton',{name:'Minutes'}),{target:{value:'1'}});fireEvent.change(within(root).getByRole('spinbutton',{name:'Seconds'}),{target:{value:'15'}});}
it('requires explicit time confirmation and saves without completing; updates both views and survives reload',async()=>{
 const task=await seed();let page=render(<TasksPage/>);await screen.findByRole('article',{name:task.title});const dialog=await review();
 expect((within(dialog).getByRole('button',{name:'Save session'}) as HTMLButtonElement).disabled).toBe(true);duration(dialog);
 fireEvent.change(within(dialog).getByRole('combobox',{name:'Outcome (optional)'}),{target:{value:'progress'}});await click('Save session',dialog);
 expect(readHistory().entries).toHaveLength(1);expect(readHistory().entries[0]).toMatchObject({focusedSeconds:75,outcome:'progress'});expect(readGuest().tasks[0].completedAt).toBeNull();expect(localStorage.getItem(focusKey('guest'))).toBeNull();
 await click(`Open task: ${task.title}`);expect(within(screen.getByRole('region',{name:'Focus on this task'})).getByText('0 h 1 min 15 s')).toBeTruthy();await click('Back to tasks');await click('List');await click(`Open task: ${task.title}`);expect(screen.getByRole('region',{name:'Focus on this task'})).toBeTruthy();
 page.unmount();page=render(<TasksPage/>);await screen.findByRole('region',{name:'My Focus'});await waitFor(()=>expect(screen.getByText(/· Made progress/)).toBeTruthy());expect(readHistory().entries).toHaveLength(1);
});
it('retains failed save for reload/retry, shows an alert, and does not count unsaved work',async()=>{
 await seed();let page=render(<TasksPage/>);await screen.findByRole('article');let dialog=await review();duration(dialog);
 const original=Storage.prototype.setItem;const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value){if(key===HISTORY_KEY)throw Error('quota');original.call(this,key,value);});
 await click('Save session',dialog);expect(within(dialog).getByRole('alert').textContent).toContain('could not be saved');expect(readHistory().entries).toHaveLength(0);expect(JSON.parse(localStorage.getItem(focusKey('guest'))!).recording.focusedSeconds).toBe(75);
 fail.mockRestore();page.unmount();page=render(<TasksPage/>);await screen.findByRole('article');dialog=await review();expect(within(dialog).getByRole('group').hasAttribute('disabled')).toBe(true);await click('Save session',dialog);expect(readHistory().entries).toHaveLength(1);
});
it('completes a subtask through the task store, then deletes history without reversing completion',async()=>{
 await seed();render(<TasksPage/>);await screen.findByRole('article');const dialog=await review();await click('I completed this subtask',dialog);duration(dialog);await click('Save session',dialog);
 await waitFor(()=>expect(readGuest().tasks[0].subtasks[0].completedAt).toBeTruthy());expect(readGuest().tasks[0].completedAt).toBeNull();
 const section=screen.getByRole('region',{name:'My Focus'});await act(async()=>fireEvent.click(within(section).getByRole('button',{name:/Delete session:/})));const confirmation=screen.getByRole('dialog',{name:'Delete this history entry?'});await click('Delete entry',confirmation);
 expect(readHistory().entries).toHaveLength(0);expect(readGuest().tasks[0].subtasks[0].completedAt).toBeTruthy();expect(readHistory().seen).toHaveLength(1);
});
it('discards without recording and keeps a deleted parent reference meaningful',async()=>{
 await seed();render(<TasksPage/>);await screen.findByRole('article');let dialog=await review();await click('Discard session',dialog);expect(readHistory().entries).toHaveLength(0);cleanup();
 await seed();render(<TasksPage/>);await screen.findByRole('article');dialog=await review();duration(dialog);await click('Save session',dialog);cleanup();localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:emptySnapshot()}));render(<TasksPage/>);await screen.findByText('Task unavailable');expect(readHistory().entries).toHaveLength(1);expect(screen.queryByRole('button',{name:'Review a short chapter',exact:true})).toBeNull();
});
