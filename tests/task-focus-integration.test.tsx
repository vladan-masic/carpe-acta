// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { TasksPage } from '../src/tasks/TasksPage';
import { FocusProvider } from '../src/tasks/focus/FocusProvider';
import { FocusBar } from '../src/tasks/focus/FocusBar';
import { FocusController, focusKey } from '../src/tasks/focus/controller';
import { newTask, emptySnapshot } from '../src/tasks/domain';
import { GUEST_KEY, readGuest } from '../src/tasks/persistence';
const auth=vi.hoisted(()=>({client:null as any,session:null as any,loading:false,recovering:false,error:null as string|null}));
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>auth}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
const bar=()=>screen.getByRole('complementary',{name:'Task focus session'});
const support=()=>screen.getByRole('region',{name:'One achievable next action'});
async function click(name:string,root?:HTMLElement){await act(async()=>{fireEvent.click((root?within(root):screen).getByRole('button',{name,exact:true}));});}
function fixture(){const a=newTask('Write a report',null,'next',[]),b=newTask('Read a book',null,'later',[]);a.subtasks=[{id:crypto.randomUUID(),title:'Open the notes',rank:0,completedAt:null}];localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks:[a,b]}}));return a;}
beforeEach(()=>{
 localStorage.clear();auth.session=null;auth.loading=false;auth.error=null;window.history.replaceState(null,'','/tasks');
 vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:vi.fn(async(_key:string,fn:()=>unknown)=>fn())}});
 HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('keeps one session through minimizing, Board/List, other tasks, page roots and reload',async()=>{
 const task=fixture();let page=render(<TasksPage/>);await screen.findByRole('article',{name:task.title});
 await click(`Open task: ${task.title}`);await click('Start');await click('Start focus');const id=JSON.parse(localStorage.getItem(focusKey('guest'))!).id;
 await click('Minimize session');expect(within(bar()).getByText('Open the notes')).toBeTruthy();await click('Back to tasks');await click('List');await click('Board');
 await click('Open task: Read a book');await click('Start');await click('Start focus');expect(screen.getByText('End existing session and start this action')).toBeTruthy();
 expect(JSON.parse(localStorage.getItem(focusKey('guest'))!).id).toBe(id);await click('Return to existing session');expect(within(support()).getByText('Open the notes')).toBeTruthy();
 page.unmount();page=render(<FocusProvider scope="guest"><FocusBar locale="en"/></FocusProvider>);expect(within(bar()).getByText('Open the notes')).toBeTruthy();expect(screen.getByRole('link',{name:'Open session'}).getAttribute('href')).toBe('/tasks#task-focus');
 await click('Pause',bar());page.unmount();window.history.replaceState(null,'','/tasks#task-focus');page=render(<TasksPage/>);
 await screen.findByRole('timer');expect(within(bar()).getByText('Paused')).toBeTruthy();expect(within(support()).getByText('Open the notes')).toBeTruthy();
 expect(readGuest().tasks.find(t=>t.id===task.id)?.status).toBe('next');
 await click('Finish session',support());await click('I made some progress');expect(screen.queryByRole('complementary',{name:'Task focus session'})).toBeNull();expect(readGuest().tasks[0].completedAt).toBeNull();
});
it('restores expiry without completion, and persists an explicit subtask completion once',async()=>{
 const task=fixture(),controller=new FocusController('guest',()=>localStorage,()=>Date.now()-180000);
 await controller.start({taskId:task.id,subtaskId:task.subtasks[0].id,text:'Open the notes',minutes:2});window.history.replaceState(null,'','/tasks#task-focus');
 render(<TasksPage/>);await screen.findByRole('timer');expect(screen.getByRole('timer').textContent).toBe('0:00');expect(readGuest().tasks[0].subtasks[0].completedAt).toBeNull();
 await click('I completed this subtask');await waitFor(()=>expect(readGuest().tasks[0].subtasks[0].completedAt).toBeTruthy());const saved=readGuest().tasks[0].subtasks[0].completedAt;
 expect(readGuest().tasks[0].completedAt).toBeNull();cleanup();render(<TasksPage/>);await screen.findByText(/The task or subtask is completed/);expect(screen.queryByRole('button',{name:'I completed this subtask'})).toBeNull();expect(readGuest().tasks[0].subtasks[0].completedAt).toBe(saved);
});
it('requires confirmation to end and handles missing references without stale writes',async()=>{
 fixture();const controller=new FocusController('guest');await controller.start({taskId:'deleted-task',subtaskId:null,text:'Missing action',minutes:0});
 render(<TasksPage/>);await screen.findByText(/The task or subtask is completed/);await click('End session',bar());expect(screen.getByRole('dialog',{name:'End session'})).toBeTruthy();await click('Keep session');expect(bar()).toBeTruthy();await click('End session',bar());await click('End session without completing');expect(screen.queryByRole('complementary',{name:'Task focus session'})).toBeNull();expect(readGuest().tasks).toHaveLength(2);
});
it('never shows another owner during auth transitions and restores local account sessions',async()=>{
 await new FocusController('alice').start({taskId:'alice-task',subtaskId:null,text:'Private Alice action',minutes:5});
 await new FocusController('guest').start({taskId:'guest-task',subtaskId:null,text:'Guest action',minutes:2});
 const page=render(<FocusProvider scope="alice"><FocusBar locale="en"/></FocusProvider>);expect(screen.getByText('Private Alice action')).toBeTruthy();
 page.rerender(<FocusProvider scope={null}><FocusBar locale="en"/></FocusProvider>);expect(screen.queryByText('Private Alice action')).toBeNull();
 page.rerender(<FocusProvider scope="bob"><FocusBar locale="en"/></FocusProvider>);expect(screen.queryByRole('complementary')).toBeNull();
 page.rerender(<FocusProvider scope="guest"><FocusBar locale="en"/></FocusProvider>);expect(screen.getByText('Guest action')).toBeTruthy();
 page.rerender(<FocusProvider scope="alice"><FocusBar locale="en"/></FocusProvider>);expect(screen.getByText('Private Alice action')).toBeTruthy();
});
it('observes another tab pausing and ending without contradictory sessions',async()=>{
 const task=fixture(),other=new FocusController('guest');await other.start({taskId:task.id,subtaskId:null,text:task.title,minutes:2});render(<TasksPage/>);await screen.findByText('In focus');
 await act(async()=>{await other.command('pause',other.getSnapshot().session!.id);window.dispatchEvent(new StorageEvent('storage',{key:focusKey('guest')}));});expect(within(bar()).getByText('Paused')).toBeTruthy();
 await act(async()=>{await other.command('end',other.getSnapshot().session!.id);window.dispatchEvent(new StorageEvent('storage',{key:focusKey('guest')}));});expect(screen.queryByRole('complementary',{name:'Task focus session'})).toBeNull();
});
it('retains session and completion edits when task persistence fails, then retries normally',async()=>{
 const task=fixture();render(<TasksPage/>);await screen.findByRole('article',{name:task.title});await click(`Open task: ${task.title}`);await click('Start');await click('Start focus');await click('Finish session',support());
 const original=Storage.prototype.setItem;const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value){if(key===GUEST_KEY)throw Error('quota');original.call(this,key,value);});
 await click('I completed the task');await screen.findByText(/Browser storage is unavailable/);expect(bar()).toBeTruthy();expect(readGuest().tasks[0].completedAt).toBeNull();
 fail.mockRestore();await click('Retry save');await waitFor(()=>expect(readGuest().tasks[0].completedAt).toBeTruthy());expect(JSON.parse(localStorage.getItem(focusKey('guest'))!).phase).toBe('review');
});
it('preserves the session and blocks completion during a task conflict',async()=>{
 const task=fixture();render(<TasksPage/>);await screen.findByRole('article',{name:task.title});await click(`Open task: ${task.title}`);await click('Start');await click('Start focus');await click('Finish session',support());
 const remote=readGuest();localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...remote,revision:1}}));
 fireEvent.change(screen.getByRole('textbox',{name:'Notes'}),{target:{value:'My pending note'}});
 await screen.findByText(/Saved tasks changed elsewhere/);
 expect((within(support()).getByRole('button',{name:'I completed this subtask'}) as HTMLButtonElement).disabled).toBe(true);
 expect(bar()).toBeTruthy();expect(readGuest().tasks[0].subtasks[0].completedAt).toBeNull();expect(JSON.parse(localStorage.getItem(focusKey('guest'))!).phase).toBe('review');
});
