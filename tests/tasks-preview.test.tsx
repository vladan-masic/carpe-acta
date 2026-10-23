// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { TasksPreview } from '../src/dev/tasks/TasksPreview';
import { filterTasks, moveItem, sampleTasks } from '../src/dev/tasks/model';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
function setup(){vi.stubGlobal('matchMedia', (query:string)=>({matches:query.includes('min-width'),addEventListener:()=>{},removeEventListener:()=>{}}));render(<TasksPreview/>);}
it('adds title-only tasks, completes and reopens them, and keeps every interaction ephemeral',()=>{
 const write=vi.spyOn(Storage.prototype,'setItem');const fetch=vi.spyOn(globalThis,'fetch');setup();
 fireEvent.change(screen.getByRole('textbox',{name:'What do you want to accomplish?'}),{target:{value:'Write one paragraph'}});
 fireEvent.click(screen.getByRole('button',{name:'Add task',exact:true}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete: Write one paragraph'}));
 fireEvent.click(screen.getByRole('button',{name:/^Completed 2/}));
 expect(screen.getByRole('button',{name:'Open task: Write one paragraph'})).toBeTruthy();
 fireEvent.click(screen.getByRole('checkbox',{name:'Reopen: Write one paragraph'}));
 expect(screen.queryByRole('button',{name:'Open task: Write one paragraph'})).toBeNull();
 fireEvent.change(screen.getByRole('combobox',{name:'Theme'}),{target:{value:'dark'}});
 expect(document.documentElement.dataset.theme).toBe('dark');
 expect(write).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});
it('edits independent properties and subtasks without changing task completion',()=>{
 setup();fireEvent.click(screen.getByRole('button',{name:/Edit properties/}));
 fireEvent.change(screen.getByRole('textbox',{name:'Task title',exact:true}),{target:{value:'My new portfolio'}});
 const panel=within(screen.getByRole('region',{name:'Details: My new portfolio'}));
 fireEvent.click(panel.getByRole('radio',{name:'1 — Very easy'}));
 fireEvent.change(panel.getByRole('combobox',{name:'Urgency',exact:true}),{target:{value:'3'}});
 expect((panel.getByRole('radio',{name:'1 — Very easy'}) as HTMLInputElement).checked).toBe(true);
 expect((panel.getByRole('combobox',{name:'Importance'}) as HTMLSelectElement).value).toBe('1');
 fireEvent.click(screen.getByRole('button',{name:/☷ Subtasks/}));
 fireEvent.change(screen.getByRole('textbox',{name:'Add a subtask'}),{target:{value:'Open my editor'}});
 fireEvent.click(screen.getByRole('button',{name:'Add a subtask',exact:true}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete: Open my editor'}));
 expect(screen.getAllByText('3 of 6 completed').length).toBeGreaterThan(0);
 expect((screen.getByRole('checkbox',{name:'Complete: My new portfolio'}) as HTMLInputElement).checked).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Remove: Open my editor'}));
 expect(screen.queryByRole('checkbox',{name:'Reopen: Open my editor'})).toBeNull();
});
it('moves tasks through semantic controls and disables manual ordering in sorted views',()=>{
 setup();const handle=screen.getByLabelText('Reorder: Build my portfolio website');fireEvent.click(handle);
 fireEvent.click(within(handle.parentElement!).getByRole('button',{name:'Move down ↓'}));
 expect(screen.getAllByRole('button',{name:/^Open task:/})[0].textContent).toContain('Apply for three');
 fireEvent.change(screen.getByRole('combobox',{name:'Sort'}),{target:{value:'date'}});
 expect(screen.queryByLabelText('Reorder: Build my portfolio website')).toBeNull();
 fireEvent.change(screen.getByRole('combobox',{name:'Sort'}),{target:{value:'manual'}});
 expect(screen.getAllByRole('button',{name:/^Open task:/})[0].textContent).toContain('Apply for three');
});
it('demonstrates action support, localized samples, and a recoverable empty state',()=>{
 setup();fireEvent.click(screen.getByRole('button',{name:'I’m stuck'}));fireEvent.click(screen.getByRole('button',{name:'The task feels overwhelming'}));
 expect(screen.getByText('Choose one small, visible part. The rest can wait.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Make it smaller'}));
 expect(screen.getByText(/What’s one small action you could take/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Start',exact:true}));
 expect(screen.getByText(/What will you work on/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Select language: English'}));
 fireEvent.click(screen.getByRole('option',{name:'Srpski'}));
 expect(screen.getByRole('heading',{name:'Moji zadaci'})).toBeTruthy();
 expect(screen.getByRole('button',{name:'Otvori zadatak: Pročitaj 15 stranica knjige'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Isprobaj prazan prikaz'}));
 expect(screen.getByRole('heading',{name:'Malo prostora za početak.'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Vrati primere'}));
 expect(screen.getAllByRole('button',{name:/^Otvori zadatak:/})).toHaveLength(7);
});
it('keeps view semantics and boundary moves predictable',()=>{
 const tasks=sampleTasks();expect(filterTasks(tasks,'all')).toHaveLength(7);expect(filterTasks(tasks,'today')).toHaveLength(2);expect(filterTasks(tasks,'upcoming')).toHaveLength(3);expect(filterTasks(tasks,'someday')).toHaveLength(1);expect(filterTasks(tasks,'completed')).toHaveLength(1);
 expect(moveItem(tasks,tasks[0].id,-1)).toBe(tasks);expect(moveItem(tasks,'missing',1)).toBe(tasks);
});
