// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { TaskDetail } from '../src/tasks/presentation/TaskDetail';
import { taskCopy } from '../src/tasks/presentation/copy';
import { bilingual, type Task } from '../src/tasks/presentation/model';
const patch=vi.fn();
const base=():Task=>({id:'task-a',title:bilingual('Write the report','Napiši izveštaj'),notes:bilingual('Keep my notes','Sačuvaj beleške'),difficulty:4,urgency:2,importance:2,deadline:'2026-12-20',minutes:'25',done:false,subtasks:[{id:'s1',title:bilingual('Open the notes','Otvori beleške'),done:false},{id:'s2',title:bilingual('Write an outline','Napiši skicu'),done:false}]});
function Harness({initial=base(),enabled=true,locale='en'}:{initial?:Task;enabled?:boolean;locale?:'en'|'sr-Latn'}){const [task,setTask]=useState(initial);return <TaskDetail expanded task={task} locale={locale} dragEnabled={enabled} copy={taskCopy[locale]} update={p=>{patch(p);setTask(t=>({...t,...p}));}} close={()=>{}} announce={()=>{}}/>;}
const click=async(name:string)=>{await act(async()=>{fireEvent.click(screen.getByRole('button',{name,exact:true}));});};
const support=()=>screen.getByRole('region',{name:'One achievable next action'});
const focus=()=>click('Start');
beforeEach(()=>{vi.useFakeTimers();patch.mockClear();HTMLElement.prototype.scrollIntoView=vi.fn();});
afterEach(()=>{cleanup();vi.useRealTimers();});
it('offers unfinished subtasks, supports selection, pauses, resumes, resets, and never completes on expiry',async()=>{
 render(<Harness/>);await focus();expect((screen.getByRole('combobox',{name:'What will you work on?'}) as HTMLSelectElement).value).toBe('s1');
 fireEvent.change(screen.getByRole('combobox',{name:'What will you work on?'}),{target:{value:'s2'}});await click('Start focus');expect(within(support()).getByText('Write an outline')).toBeTruthy();
 act(()=>vi.advanceTimersByTime(30000));expect(screen.getByRole('timer').textContent).toBe('1:30');await click('Pause');act(()=>vi.advanceTimersByTime(30000));expect(screen.getByRole('timer').textContent).toBe('1:30');await click('Resume');act(()=>vi.advanceTimersByTime(1000));expect(screen.getByRole('timer').textContent).toBe('1:29');await click('Reset');expect(screen.getByRole('timer').textContent).toBe('2:00');await click('Resume');act(()=>vi.advanceTimersByTime(120000));expect(within(support()).getByText('Time is up. You decide what happens next.')).toBeTruthy();expect(patch).not.toHaveBeenCalled();await click('Continue working');act(()=>vi.advanceTimersByTime(1000));expect(screen.getByRole('timer').textContent).toBe('+0:01');await click('Finish session');await click('I completed this subtask');expect(patch).toHaveBeenCalledTimes(1);expect(patch.mock.calls[0][0].subtasks.map((s:{done:boolean})=>s.done)).toEqual([false,true]);
});
it('starts a parent without subtasks and permits untimed progress without fake completion',async()=>{
 render(<Harness initial={{...base(),subtasks:[]}}/>);await focus();fireEvent.change(screen.getByRole('combobox',{name:'Focus time'}),{target:{value:'0'}});await click('Start focus');expect(screen.getByRole('timer').textContent).toBe('0:00');await click('Pause');await click('Resume');await click('Finish session');await click('I made some progress');expect(patch).not.toHaveBeenCalled();expect(screen.getByText('A little progress counts. You can return whenever you are ready.')).toBeTruthy();
 await click('Start focus');await click('Finish session');await click('I completed the task');expect(patch).toHaveBeenCalledWith({done:true});
});
it('keeps drafts and continues a minimized session, restoring focus',async()=>{
 render(<Harness/>);await click('Make it smaller');fireEvent.change(screen.getByRole('textbox',{name:'Your next action'}),{target:{value:'Open one document'}});await click('Minimize session');act(()=>vi.advanceTimersByTime(20));expect(document.activeElement).toBe(screen.getByRole('button',{name:'Make it smaller',exact:true}));await click('Make it smaller');expect((screen.getByRole('textbox',{name:'Your next action'}) as HTMLTextAreaElement).value).toBe('Open one document');
 await click('Save and start');act(()=>vi.advanceTimersByTime(1000));await click('Minimize session');act(()=>vi.advanceTimersByTime(60000));await focus();expect(screen.getByRole('timer').textContent).toBe('0:59');expect(screen.getByRole('button',{name:'Pause'})).toBeTruthy();
});
it('saves one concrete subtask, guards repeated submissions, and preserves unrelated fields',async()=>{
 render(<Harness/>);await click('Make it smaller');fireEvent.change(screen.getByRole('textbox',{name:'Your next action'}),{target:{value:'Find one source'}});await click('Save as subtask');await click('Save as subtask');expect(patch).toHaveBeenCalledTimes(1);expect(Object.keys(patch.mock.calls[0][0])).toEqual(['subtasks']);expect(patch.mock.calls[0][0].subtasks).toHaveLength(3);await click('Save and start');expect(patch).toHaveBeenCalledTimes(1);expect(within(support()).getByText('Find one source')).toBeTruthy();await click('Finish session');await click('I completed this subtask');expect(patch.mock.calls[1][0].subtasks[2].done).toBe(true);
});
it('offers six curated obstacles, alternative suggestions, a budget and an editable small session',async()=>{
 render(<Harness/>);await click('I’m stuck');const choices=screen.getByRole('group',{name:'What is getting in the way?'});expect(within(choices).getAllByRole('button')).toHaveLength(6);await click('I don’t have enough time');const field=screen.getByRole('textbox',{name:'Your next action'}) as HTMLTextAreaElement;const first=field.value;await click('Try a different suggestion');expect(field.value).not.toBe(first);fireEvent.change(field,{target:{value:'Read one paragraph'}});fireEvent.change(screen.getByRole('combobox',{name:'Available time'}),{target:{value:'5'}});await click('Start a small session');expect(screen.getByRole('timer').textContent).toBe('5:00');expect(patch).not.toHaveBeenCalled();await click('Finish session');expect(screen.queryByRole('button',{name:'I completed this subtask'})).toBeNull();
});
it('respects the limit and blocks task writes during conflict',async()=>{
 const task={...base(),subtasks:Array.from({length:100},(_,i)=>({id:`s${i}`,title:bilingual(`Step ${i}`,`Korak ${i}`),done:false}))};const view=render(<Harness initial={task}/>);await click('Make it smaller');fireEvent.change(screen.getByRole('textbox',{name:'Your next action'}),{target:{value:'Extra'}});expect((screen.getByRole('button',{name:'Save as subtask'}) as HTMLButtonElement).disabled).toBe(true);view.unmount();render(<Harness enabled={false}/>);await click('Make it smaller');fireEvent.change(screen.getByRole('textbox',{name:'Your next action'}),{target:{value:'Blocked'}});expect((screen.getByRole('button',{name:'Save and start'}) as HTMLButtonElement).disabled).toBe(true);expect(patch).not.toHaveBeenCalled();
});
it('supports Serbian labels and safely invalidates a remotely completed action',async()=>{
 const task=base();const view=render(<TaskDetail expanded task={task} locale="sr-Latn" copy={taskCopy['sr-Latn']} update={patch} close={()=>{}} announce={()=>{}}/>);await click('Počni');await click('Započni fokus');view.rerender(<TaskDetail expanded task={{...task,done:true}} locale="sr-Latn" copy={taskCopy['sr-Latn']} update={patch} close={()=>{}} announce={()=>{}}/>);expect(screen.getByText('Zadatak ili izabrani podzadatak je završen ili uklonjen. Izaberi drugi korak.')).toBeTruthy();expect(screen.queryByRole('button',{name:'Završio/la sam zadatak'})).toBeNull();expect(patch).not.toHaveBeenCalled();
});
