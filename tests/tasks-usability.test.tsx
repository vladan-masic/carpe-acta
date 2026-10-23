// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TasksPage } from '../src/tasks/TasksPage';
import { emptySnapshot, newTask, manual } from '../src/tasks/domain';
import { GUEST_KEY, readGuest } from '../src/tasks/persistence';
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({client:null,session:null,loading:false})}));
vi.mock('../src/components/AuthPanel',()=>({AuthPanel:()=>null}));
class TestPointerEvent extends MouseEvent {
 pointerId:number; isPrimary:boolean; pointerType:string;
 constructor(type:string,init:PointerEventInit) {super(type,init);this.pointerId=init.pointerId??1;this.isPrimary=init.isPrimary??true;this.pointerType=init.pointerType??'mouse';}
}
beforeEach(()=>{
 localStorage.clear();
 vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));
 vi.stubGlobal('PointerEvent',TestPointerEvent);
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async(_name:string,fn:()=>unknown)=>fn()}});
 HTMLElement.prototype.setPointerCapture=vi.fn();HTMLElement.prototype.scrollIntoView=vi.fn();HTMLElement.prototype.scrollTo=vi.fn();
 window.scrollBy=vi.fn();
 const tasks=[newTask('First step',null,'next',[]),newTask('Second step',null,'next',[])];tasks[1].rank=1;
 tasks.push(newTask('Later idea',null,'later',[]));
 localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:{...emptySnapshot(),tasks}}));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
async function setup(){render(<TasksPage/>);await screen.findByText('Saved');}
function target(element:Element){Object.defineProperty(document,'elementFromPoint',{configurable:true,value:vi.fn(()=>element)});}
const pointer=(element:Element,kind:'Down'|'Move'|'Up',x:number,y:number,pointerType='mouse')=>fireEvent[`pointer${kind}`](element,{pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,pointerType});

it('drags board surfaces only after the threshold, saves only on drop, and suppresses the drag click',async()=>{
 await setup();vi.useFakeTimers();
 const card=screen.getByRole('article',{name:'First step'}),done=screen.getByRole('region',{name:'Done 0'});
 const write=vi.spyOn(Storage.prototype,'setItem');target(done);
 pointer(card,'Down',10,10);pointer(card,'Move',12,12);act(()=>vi.advanceTimersByTime(20));expect(document.querySelector('.kb-drag-ghost')).toBeNull();
 pointer(card,'Move',90,90);act(()=>vi.advanceTimersByTime(500));expect(document.querySelector('.kb-drag-ghost')).toBeTruthy();expect(write).not.toHaveBeenCalled();
 pointer(card,'Up',90,90);fireEvent.click(card,{detail:1});expect(screen.queryByRole('textbox',{name:'Task title'})).toBeNull();
 await act(async()=>{await vi.advanceTimersByTimeAsync(450);});expect(readGuest().tasks.find(t=>t.title==='First step')?.status).toBe('done');expect(write).toHaveBeenCalledTimes(1);
 const moved=screen.getByRole('article',{name:'First step'});pointer(moved,'Down',10,10);pointer(moved,'Up',10,10);fireEvent.click(moved,{detail:1});expect(screen.getByRole('textbox',{name:'Task title'})).toBeTruthy();
});
it('leaves touch surfaces and interactive controls alone; handles still drag and Escape cancels',async()=>{
 await setup();vi.useFakeTimers();const card=screen.getByRole('article',{name:'First step'});target(screen.getByRole('region',{name:'Done 0'}));
 for(const element of [within(card).getByRole('button',{name:'Open task: First step'}),within(card).getByRole('checkbox')]){
  pointer(element,'Down',10,10);pointer(element,'Move',90,90);pointer(element,'Up',90,90);act(()=>vi.advanceTimersByTime(20));expect(document.querySelector('.kb-drag-ghost')).toBeNull();
 }
 pointer(card,'Down',10,10,'touch');pointer(card,'Move',90,90,'touch');act(()=>vi.advanceTimersByTime(20));expect(document.querySelector('.kb-drag-ghost')).toBeNull();
 const handle=within(card).getByRole('button',{name:'Drag task: First step'});pointer(handle,'Down',10,10,'touch');pointer(handle,'Move',90,90,'touch');act(()=>vi.advanceTimersByTime(20));expect(document.querySelector('.kb-drag-ghost')).toBeTruthy();
 fireEvent.keyDown(window,{key:'Escape'});expect(document.querySelector('.kb-drag-ghost')).toBeNull();expect(readGuest().tasks.find(t=>t.title==='First step')?.status).toBe('next');
 fireEvent.click(within(card).getByRole('checkbox'));await act(async()=>{await vi.advanceTimersByTimeAsync(450);});expect(readGuest().tasks.find(t=>t.title==='First step')?.status).toBe('done');
});
it('reorders list rows within their status, persists across reload, and disables dragging for sorting/filtering',async()=>{
 await setup();fireEvent.click(screen.getByRole('button',{name:'List',exact:true}));
 const first=screen.getByRole('button',{name:'Open task: First step'}).closest('li')!,second=screen.getByRole('button',{name:'Open task: Second step'}).closest('li')!;
 vi.spyOn(first,'getBoundingClientRect').mockReturnValue({top:100,height:60} as DOMRect);target(first);
 pointer(second,'Down',10,170);pointer(second,'Move',10,110);pointer(second,'Up',10,110);
 await waitFor(()=>expect(manual(readGuest().tasks).filter(t=>t.status==='next').map(t=>t.title)).toEqual(['Second step','First step']));
 const later=screen.getByRole('button',{name:'Open task: Later idea'}).closest('li')!;target(later);
 pointer(first,'Down',10,100);pointer(first,'Move',10,30);pointer(first,'Up',10,30);expect(readGuest().tasks.find(t=>t.title==='First step')?.status).toBe('next');
 cleanup();render(<TasksPage/>);await screen.findByText('Saved');expect(screen.getAllByRole('button',{name:/Open task:/}).map(e=>e.textContent)).toEqual(['Later idea','Second step','First step']);
 fireEvent.change(screen.getByRole('combobox',{name:'Sort'}),{target:{value:'deadline'}});expect(document.querySelector('[data-draggable=true]')).toBeNull();
 fireEvent.change(screen.getByRole('combobox',{name:'Sort'}),{target:{value:'manual'}});fireEvent.click(within(screen.getByRole('group',{name:'Filter tasks'})).getByRole('button',{name:'Someday'}));expect(document.querySelector('[data-draggable=true]')).toBeNull();
});
it('keeps advanced fields mounted below the toggle, preserving values and editable difficulty after creation',async()=>{
 await setup();fireEvent.focus(screen.getByRole('textbox',{name:'What do you want to accomplish?'}));const toggle=screen.getByRole('button',{name:'Add details'}),parent=toggle.parentElement;
 fireEvent.click(toggle);expect(toggle.parentElement).toBe(parent);expect(toggle.getAttribute('aria-expanded')).toBe('true');
 fireEvent.click(screen.getByRole('radio',{name:'4 — Difficult'}));fireEvent.click(toggle);expect(toggle.getAttribute('aria-expanded')).toBe('false');fireEvent.click(toggle);expect((screen.getByRole('radio',{name:'4 — Difficult'}) as HTMLInputElement).checked).toBe(true);
 fireEvent.click(toggle);fireEvent.click(screen.getByRole('button',{name:'Open task: First step'}));fireEvent.click(screen.getByRole('radio',{name:'3 — Moderate'}));
 await waitFor(()=>expect(readGuest().tasks.find(t=>t.title==='First step')?.difficulty).toBe(3));cleanup();render(<TasksPage/>);await screen.findByText('Saved');fireEvent.click(screen.getByRole('button',{name:'Open task: First step'}));expect((screen.getByRole('radio',{name:'3 — Moderate'}) as HTMLInputElement).checked).toBe(true);
});
it('shows an insertion target, cancels on pointer cancellation, and never reorders while filtered',async()=>{
 await setup();vi.useFakeTimers();const card=screen.getByRole('article',{name:'First step'}),other=screen.getByRole('article',{name:'Second step'});
 vi.spyOn(other,'getBoundingClientRect').mockReturnValue({top:100,height:60} as DOMRect);target(other);
 pointer(card,'Down',10,200);pointer(card,'Move',10,105);act(()=>vi.advanceTimersByTime(20));expect(other.getAttribute('data-insert')).toBe('true');
 fireEvent.pointerCancel(card,{pointerId:1});expect(document.querySelector('.kb-drag-ghost')).toBeNull();expect(other.getAttribute('data-insert')).toBe('false');
 fireEvent.click(within(screen.getByRole('group',{name:'Filter tasks'})).getByRole('button',{name:'Someday'}));pointer(card,'Down',10,200);pointer(card,'Move',10,105);pointer(card,'Up',10,105);act(()=>vi.advanceTimersByTime(450));expect(readGuest().revision).toBe(0);
});

it('dismisses the handle menu outside while preserving interaction inside',async()=>{
 await setup();const card=screen.getByRole('article',{name:'First step'});const menu=card.querySelector('details')!;
 fireEvent.click(within(card).getByRole('button',{name:'Drag task: First step'}));
 await waitFor(()=>expect(menu.open).toBe(true));
 const select=within(card).getByRole('combobox',{name:'Move to column'});
 pointer(select,'Down');pointer(select,'Up');expect(menu.open).toBe(true);
 pointer(document.body,'Down');pointer(document.body,'Up');expect(menu.open).toBe(false);
 expect(card.querySelector('.kb-card-tools')).toBeNull();
});
