import type { Locale } from '../i18n/locales';
import { completeTask, editTask, type Task } from './domain';
import type { BoardTask } from './presentation/boardModel';
import type { Task as EditorTask } from './presentation/model';
const text=(value:string)=>({en:value,'sr-Latn':value});
/** Legacy visual controls are bilingual; user-authored data is a single string. */
export function toEditor(task:Task):BoardTask {
  return {...task,title:text(task.title),notes:text(task.notes),deadline:task.deadline??'',minutes:task.minutes?.toString()??'',done:task.status==='done',
    subtasks:[...task.subtasks].sort((a,b)=>a.rank-b.rank).map(s=>({id:s.id,title:text(s.title),done:!!s.completedAt}))};
}
export function fromEditor(tasks:Task[],id:string,patch:Partial<EditorTask>,locale:Locale):Task[] {
  const task=tasks.find(t=>t.id===id); if(!task)return tasks;
  const now=new Date().toISOString();
  const fields:Partial<Task>={};
  if(patch.title)fields.title=patch.title[locale];
  if(patch.notes)fields.notes=patch.notes[locale];
  if(patch.deadline!==undefined)fields.deadline=patch.deadline||null;
  if(patch.minutes!==undefined)fields.minutes=patch.minutes?Number(patch.minutes):null;
  if(patch.difficulty!==undefined)fields.difficulty=patch.difficulty as Task['difficulty'];
  if(patch.urgency!==undefined)fields.urgency=patch.urgency as Task['urgency'];
  if(patch.importance!==undefined)fields.importance=patch.importance as Task['importance'];
  if(patch.subtasks)fields.subtasks=patch.subtasks.map((s,rank)=>({id:s.id,title:s.title[locale],rank,completedAt:s.done?task.subtasks.find(old=>old.id===s.id)?.completedAt??now:null}));
  const result=editTask(tasks,id,fields,now);
  return patch.done===undefined?result:completeTask(result,id,patch.done);
}
