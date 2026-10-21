import { useId } from 'react';
import type { TaskCopy } from './copy';
import type { DragBindings } from './useBoardDrag';
import type { Task } from './model';
export function Difficulty({value,onChange,copy}:{value:number;onChange:(n:number)=>void;copy:TaskCopy}) {
 const id=useId();
 return <fieldset className="tasks-difficulty"><legend>{copy.difficulty} <span>· {copy.ratings[value-1]}</span></legend><div>{copy.ratings.map((label,i)=><label key={label} title={label}><input type="radio" name={id} value={i+1} checked={value===i+1} onChange={()=>onChange(i+1)} aria-label={`${i+1} — ${label}`} /><span aria-hidden="true" data-filled={i<value}>★</span></label>)}</div></fieldset>;
}
export function Properties({task,update,copy}:{task:Task;update:(patch:Partial<Task>)=>void;copy:TaskCopy}) {
 return <div className="tasks-properties"><Difficulty value={task.difficulty} onChange={difficulty=>update({difficulty})} copy={copy}/><div className="tasks-fields">
 <label>{copy.urgency}<select value={task.urgency} onChange={e=>update({urgency:Number(e.target.value)})}>{copy.urgencies.map((s,i)=><option key={s} value={i}>{s}</option>)}</select></label>
 <label>{copy.importance}<select value={task.importance} onChange={e=>update({importance:Number(e.target.value)})}>{copy.priorities.map((s,i)=><option key={s} value={i}>{s}</option>)}</select></label>
 <label>{copy.deadline}<input type="date" value={task.deadline} onChange={e=>update({deadline:e.target.value})}/></label>
 <label>{copy.minutes}<input type="number" min="1" max="10000" value={task.minutes} onChange={e=>update({minutes:e.target.value})}/></label>
 </div></div>;
}
export function OrderControls({label,first,last,move,copy,handle,id}:{label:string;first:boolean;last:boolean;move:(n:number)=>void;copy:TaskCopy;handle?:DragBindings;id?:string}) {
 return <details className="tasks-order"><summary {...handle} data-handle-id={id} data-drag-handle={Boolean(handle)} aria-label={`${copy.reorder}: ${label}`} title={copy.reorder}>⠿</summary><div><button type="button" disabled={first} onClick={()=>move(-1)}>{copy.up} ↑</button><button type="button" disabled={last} onClick={()=>move(1)}>{copy.down} ↓</button></div></details>;
}
