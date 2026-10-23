// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TasksPage } from '../src/tasks/TasksPage';
import { emptySnapshot, newTask } from '../src/tasks/domain';
import { GUEST_KEY, readGuest } from '../src/tasks/persistence';
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({client:null,session:null,loading:false})}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
class TestPointerEvent extends MouseEvent {
 pointerId:number;isPrimary:boolean;pointerType:string;
 constructor(type:string,init:PointerEventInit){super(type,init);this.pointerId=init.pointerId??1;this.isPrimary=init.isPrimary??true;this.pointerType=init.pointerType??'mouse';}
}
const longTitle='Prepare a thoughtful first draft with the main ideas, supporting examples, and a small next action that is easy to begin tomorrow.';
beforeEach(()=>{
 localStorage.clear();vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));vi.stubGlobal('PointerEvent',TestPointerEvent);
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async(_name:string,fn:()=>unknown)=>fn()}});
 HTMLElement.prototype.setPointerCapture=vi.fn();HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();window.scrollBy=vi.fn();
 const task=newTask('Writing project',null,'next',[]);task.subtasks=['Gather notes',longTitle,'Review the outline'].map((title,rank)=>({id:crypto.randomUUID(),title,rank,completedAt:null}));
 localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks:[task,newTask('A second task',null,'later',[])]}}));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
async function setup(){render(<TasksPage/>);await screen.findByText('Saved');}
function pointer(element:Element,type:'Down'|'Move'|'Up',x=10,y=10,pointerType='mouse'){fireEvent[`pointer${type}`](element,{pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,pointerType});}
function click(element:Element){pointer(element,'Down');pointer(element,'Up');fireEvent.click(element,{detail:1});}
function editors(){return screen.getAllByRole('textbox',{name:/^Subtask title/}) as HTMLTextAreaElement[];}

it('dismisses Quick Add outside and on Escape, preserving fields and native select interaction',async()=>{
 await setup();expect(screen.queryByRole('button',{name:'Add details'})).toBeNull();expect(screen.queryByRole('combobox',{name:'Add to'})).toBeNull();fireEvent.focus(screen.getByRole('textbox',{name:'What do you want to accomplish?'}));const toggle=screen.getByRole('button',{name:'Add details'});click(toggle);
 const notes=screen.getByRole('textbox',{name:'Notes'});fireEvent.change(notes,{target:{value:'Keep this draft'}});click(notes);expect(toggle.getAttribute('aria-expanded')).toBe('true');
 const status=screen.getByRole('combobox',{name:'Add to'});click(status);fireEvent.keyDown(status,{key:'Escape'});expect(toggle.getAttribute('aria-expanded')).toBe('true');
 click(screen.getByRole('heading',{name:'My Tasks'}));expect(toggle.getAttribute('aria-expanded')).toBe('false');expect(screen.queryByRole('button',{name:'Add details'})).toBeNull();expect(screen.queryByRole('combobox',{name:'Add to'})).toBeNull();fireEvent.focus(screen.getByRole('textbox',{name:'What do you want to accomplish?'}));click(toggle);expect((screen.getByRole('textbox',{name:'Notes'}) as HTMLTextAreaElement).value).toBe('Keep this draft');
 fireEvent.keyDown(notes,{key:'Escape'});expect(toggle.getAttribute('aria-expanded')).toBe('false');expect(document.activeElement).toBe(toggle);
});
it('closes the task panel outside without losing pending edits, switches tasks directly and ignores selection drags',async()=>{
 await setup();click(screen.getByRole('button',{name:'Open task: Writing project'}));const notes=screen.getByRole('textbox',{name:'Notes'});fireEvent.change(notes,{target:{value:'Pending notes'}});
 pointer(notes,'Down');pointer(document.body,'Move',80,80);pointer(document.body,'Up',80,80);expect(screen.getByRole('textbox',{name:'Task title'})).toBeTruthy();
 click(screen.getByRole('button',{name:'Open task: A second task'}));expect((screen.getByRole('textbox',{name:'Task title'}) as HTMLTextAreaElement).value).toBe('A second task');
 click(screen.getByRole('heading',{name:'My Tasks'}));expect(screen.queryByRole('textbox',{name:'Task title'})).toBeNull();await waitFor(()=>expect(readGuest().tasks[0].notes).toBe('Pending notes'));
});
it('drags subtasks in both directions, persists the order and preserves text and completion',async()=>{
 await setup();click(screen.getByRole('button',{name:'Open task: Writing project'}));vi.useFakeTimers();
 let rows=editors().map(e=>e.closest('li')!);const handle=within(rows[0]).getByLabelText('Reorder: Gather notes');
 vi.spyOn(rows[2],'getBoundingClientRect').mockReturnValue({top:100,height:60} as DOMRect);Object.defineProperty(document,'elementFromPoint',{configurable:true,value:vi.fn(()=>rows[2])});
 pointer(handle,'Down',10,10);pointer(handle,'Move',10,170);act(()=>vi.advanceTimersByTime(500));expect(document.querySelector('.tasks-subtask-ghost')).toBeTruthy();expect(rows[2].getAttribute('data-insert-end')).toBe('true');expect(readGuest().revision).toBe(0);
 pointer(handle,'Up',10,170);fireEvent.click(handle,{detail:1});await act(async()=>{await vi.advanceTimersByTimeAsync(450);});expect(editors().map(e=>e.value)).toEqual([longTitle,'Review the outline','Gather notes']);expect(readGuest().tasks[0].subtasks.every(s=>s.completedAt===null)).toBe(true);
 rows=editors().map(e=>e.closest('li')!);const lastHandle=within(rows[2]).getByLabelText('Reorder: Gather notes');vi.spyOn(rows[1],'getBoundingClientRect').mockReturnValue({top:100,height:60} as DOMRect);vi.spyOn(rows[0],'getBoundingClientRect').mockReturnValue({top:0,height:60} as DOMRect);Object.defineProperty(document,'elementFromPoint',{configurable:true,value:vi.fn(()=>rows[1])});
 pointer(lastHandle,'Down',10,200,'touch');pointer(lastHandle,'Move',10,105,'touch');act(()=>vi.advanceTimersByTime(20));pointer(lastHandle,'Up',10,105,'touch');await act(async()=>{await vi.advanceTimersByTimeAsync(450);});expect(editors().map(e=>e.value)).toEqual([longTitle,'Gather notes','Review the outline']);
 vi.useRealTimers();click(screen.getByRole('button',{name:'Back to tasks'}));click(screen.getByRole('button',{name:'List',exact:true}));click(screen.getByRole('button',{name:'Open task: Writing project'}));expect(editors().map(e=>e.value)).toEqual([longTitle,'Gather notes','Review the outline']);
 cleanup();render(<TasksPage/>);await screen.findByText('Saved');click(screen.getByRole('button',{name:'Open task: Writing project'}));expect(editors().map(e=>e.value)).toEqual([longTitle,'Gather notes','Review the outline']);
});
it('cancels a subtask drag with Escape without closing its editor, and keeps multiline editing and keyboard ordering',async()=>{
 await setup();click(screen.getByRole('button',{name:'Open task: Writing project'}));vi.useFakeTimers();const row=editors()[0].closest('li')!,handle=within(row).getByLabelText('Reorder: Gather notes');Object.defineProperty(document,'elementFromPoint',{configurable:true,value:vi.fn(()=>row)});
 pointer(handle,'Down');pointer(handle,'Move',30,30);act(()=>vi.advanceTimersByTime(20));fireEvent.keyDown(handle,{key:'Escape'});expect(document.querySelector('.tasks-subtask-ghost')).toBeNull();expect(screen.getByRole('textbox',{name:'Task title'})).toBeTruthy();expect(readGuest().revision).toBe(0);
 fireEvent.change(editors()[0],{target:{value:'First line\nSecond line'}});expect(editors()[0].tagName).toBe('TEXTAREA');expect(editors()[0].maxLength).toBe(200);fireEvent.keyDown(editors()[0],{key:'Enter'});fireEvent.keyDown(editors()[0],{key:'Enter',shiftKey:true});expect(editors()).toHaveLength(3);
 fireEvent.click(within(row).getByLabelText(/Reorder: First line/));fireEvent.click(within(row).getByRole('button',{name:'Move down ↓'}));await act(async()=>{await vi.advanceTimersByTimeAsync(450);});expect(editors()[1].value).toBe('First line\nSecond line');
});
it.each([0,2,3,4])('uses all actual Doing tasks for the soft recommendation (%i)',async count=>{
 const tasks=Array.from({length:count},(_,i)=>newTask(`Doing ${i}`,null,'doing',[]));localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks}}));await setup();
 const reminder=document.querySelector('.task-doing-reminder')!;expect(Boolean(reminder.textContent)).toBe(count>=3);expect(reminder.closest('[data-column]')?.getAttribute('data-column')).toBe('doing');expect(reminder.parentElement?.getAttribute('data-column')).toBe('doing');expect(reminder.previousElementSibling?.querySelector('p')?.textContent).toBe('One step at a time.');
 if(count>=3){expect(reminder.textContent).toContain(count===3?'Consider finishing one':'One step at a time');click(within(screen.getByRole('group',{name:'Filter tasks'})).getByRole('button',{name:'Completed'}));expect(reminder.textContent).toContain(`${count}`);click(screen.getByRole('button',{name:'List',exact:true}));expect(document.querySelectorAll('.task-doing-reminder')).toHaveLength(1);expect(document.querySelector('.task-doing-reminder')!.textContent).toContain(`${count}`);}
});
it('updates the Doing suggestion on status changes without blocking a fourth task',async()=>{
 const tasks=Array.from({length:3},(_,i)=>newTask(`Doing ${i}`,null,'doing',[]));tasks.push(newTask('Next task',null,'next',[]));localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks}}));await setup();click(screen.getByRole('button',{name:'Open task: Next task'}));fireEvent.change(screen.getByRole('combobox',{name:'Status',exact:true}),{target:{value:'doing'}});expect(document.querySelector('.task-doing-reminder')!.textContent).toContain('Doing · 4');fireEvent.change(screen.getByRole('combobox',{name:'Status',exact:true}),{target:{value:'done'}});expect(document.querySelector('.task-doing-reminder')!.textContent).toContain('Doing · 3');await waitFor(()=>expect(readGuest().tasks.find(t=>t.title==='Next task')?.status).toBe('done'));
});

it('persists a guided subtask and explicit completion through Board, List and guest reload',async()=>{
 await setup();click(screen.getByRole('button',{name:'Open task: Writing project'}));click(screen.getByRole('button',{name:'Make it smaller',exact:true}));fireEvent.change(screen.getByRole('textbox',{name:'Your next action'}),{target:{value:'Find one relevant example'}});click(screen.getByRole('button',{name:'Save and start'}));click(screen.getByRole('button',{name:'Finish session'}));click(screen.getByRole('button',{name:'I completed this subtask'}));
 await waitFor(()=>expect(readGuest().tasks.find(t=>t.title==='Writing project')?.subtasks.find(s=>s.title==='Find one relevant example')?.completedAt).toBeTruthy());
 const saved=readGuest().tasks.find(t=>t.title==='Writing project')!;expect(saved.status).toBe('next');expect(saved.subtasks).toHaveLength(4);
 click(screen.getByRole('button',{name:'List',exact:true}));click(screen.getByRole('button',{name:'Open task: Writing project'}));expect((screen.getByRole('textbox',{name:'Subtask title 4'}) as HTMLTextAreaElement).value).toBe('Find one relevant example');cleanup();await setup();click(screen.getByRole('button',{name:'Open task: Writing project'}));expect((screen.getByRole('checkbox',{name:'Reopen: Find one relevant example'}) as HTMLInputElement).checked).toBe(true);
});
