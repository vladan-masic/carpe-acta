import { useEffect, useRef, useState } from 'react';
import { AppToolbar } from '../../components/AppToolbar';
import { AppFooter } from '../../components/AppFooter';
import { LanguageSelector } from '../../components/LanguageSelector';
import { getInitialLocale } from '../../i18n/locales';
import { messages } from '../../i18n/messages';
import hero from '../../assets/illustrations/hero-path-1200.webp';
import notebook from '../../assets/illustrations/action-notebook.webp';
import { taskCopy } from './copy';
import { bilingual, dateKey, filterTasks, moveItem, sampleTasks, type Task, type View } from './model';
import { OrderControls, Properties } from './TaskControls';
import { TaskDetail } from './TaskDetail';
import './tasks.css';
const draftTask = ():Task => ({id:'draft',title:bilingual('',''),notes:bilingual('',''),difficulty:1,urgency:0,importance:1,deadline:'',minutes:'',done:false,subtasks:[]});
export function TasksPreview() {
 const [locale,setLocale]=useState(getInitialLocale);
 const [theme,setTheme]=useState(()=>window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light');
 const [tasks,setTasks]=useState(sampleTasks);
 const [selected,setSelected]=useState<string|null>(()=>window.matchMedia?.('(min-width: 1100px)').matches?'sample-0':null);
 const [view,setView]=useState<View>('all');
 const [sort,setSort]=useState('manual');
 const [title,setTitle]=useState('');
 const [draft,setDraft]=useState(draftTask);
 const [startRequested,setStartRequested]=useState(false);
 const [status,setStatus]=useState('');
 const quickInput=useRef<HTMLInputElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 const c=taskCopy[locale];
 useEffect(()=>{document.documentElement.dataset.theme=theme;},[theme]);
 useEffect(()=>{document.documentElement.lang=locale;document.title=`${c.title} · Carpe Acta`;},[locale,c.title]);
 const visible=filterTasks(tasks,view);
 if(sort==='date')visible.sort((a,b)=>(a.deadline||'9999').localeCompare(b.deadline||'9999'));
 const task=tasks.find(t=>t.id===selected);
 function update(patch:Partial<Task>) {setTasks(items=>items.map(t=>t.id===selected?{...t,...patch}:t));}
 function close(){setSelected(null);requestAnimationFrame(()=>{if(opener.current?.isConnected)opener.current.focus();else quickInput.current?.focus();});}
 function open(id:string,button:HTMLButtonElement,start=false){setStartRequested(start);opener.current=button;setSelected(id);requestAnimationFrame(()=>document.getElementById('task-detail-heading')?.focus());}
 const formatDate=(value:string)=>value===dateKey()?c.today:new Intl.DateTimeFormat(locale==='en'?'en-GB':'sr-Latn',{month:'short',day:'numeric'}).format(new Date(`${value}T12:00:00`));
 return <div className="tasks-preview" data-detail-open={Boolean(task)}>
 <div className="tasks-shell" id="page-top" tabIndex={-1}>
 <AppToolbar label={c.menu} navigation={<nav className="section-navigation" aria-label={c.menu}><a href="/">⌂ {c.home}</a><a href="/__tasks-preview" aria-current="page">☷ {c.title}</a></nav>}><label className="tasks-theme">{c.theme}<select aria-label={c.theme} value={theme} onChange={e=>setTheme(e.target.value)}><option value="light">{c.light}</option><option value="dark">{c.dark}</option></select></label><LanguageSelector ariaLabel={c.language} locale={locale} onSelectLocale={setLocale}/></AppToolbar>
 <main>
 <header className="tasks-hero"><div className="tasks-hero-copy"><h1>{c.title}</h1><p className="tasks-promise">{c.line1}<br/><em>{c.line2}</em></p><p>{c.subtitle}</p></div><div className="tasks-art" aria-hidden="true"><img src={hero} alt=""/><img className="tasks-notebook" src={notebook} alt=""/></div><p className="tasks-handwritten">{c.note}<span aria-hidden="true"> ♥</span></p></header>
 <div className="tasks-workspace">
 <section className="tasks-list-area" aria-label={c.title}>
 <form className="tasks-quick" onSubmit={e=>{e.preventDefault();if(!title.trim()){setStatus(c.blank);return;}const id=crypto.randomUUID();setTasks(items=>[{...draft,id,title:bilingual(title.trim(),title.trim())},...items]);setTitle('');setDraft(draftTask());setView('all');setStatus(c.added);quickInput.current?.focus();}}>
 <div className="tasks-quick-row"><span aria-hidden="true">＋</span><input ref={quickInput} aria-label={c.placeholder} placeholder={c.placeholder} value={title} onChange={e=>setTitle(e.target.value)} maxLength={200}/><button className="tasks-primary" type="submit">{c.add}</button></div>
 <details className="tasks-quick-details"><summary>{c.advanced}</summary><Properties task={draft} update={patch=>setDraft(t=>({...t,...patch}))} copy={c}/><label>{c.notes}<textarea value={draft.notes[locale]} onChange={e=>setDraft(t=>({...t,notes:bilingual(e.target.value,e.target.value)}))}/></label></details><p>{c.hint}</p>
 </form>
 <div className="tasks-filters" role="group" aria-label={c.title}>{(['all','today','upcoming','someday','completed'] as View[]).map(v=><button key={v} aria-pressed={view===v} onClick={()=>{setView(v);setSelected(null);}}>{c[v]} <span>{filterTasks(tasks,v).length}</span></button>)}</div>
 <div className="tasks-list-heading"><span>{c.taskList} <span className="tasks-count">{visible.length}</span></span><label>{c.sort}<select value={sort} onChange={e=>setSort(e.target.value)}><option value="manual">{c.manual}</option><option value="date">{c.byDate}</option></select></label></div>
 <ul className="tasks-list">{visible.map((t)=>{const index=tasks.findIndex(item=>item.id===t.id);return <li key={t.id} data-selected={selected===t.id} data-complete={t.done}>
 {sort==='manual'&&view==='all'?<OrderControls label={t.title[locale]} first={index===0} last={index===tasks.length-1} copy={c} move={n=>{setTasks(items=>moveItem(items,t.id,n));setStatus(c.moved);}}/>:<span className="tasks-order-placeholder"/>}
 <input type="checkbox" aria-label={`${t.done?c.reopen:c.complete}: ${t.title[locale]}`} checked={t.done} onChange={e=>{setTasks(items=>items.map(item=>item.id===t.id?{...item,done:e.target.checked}:item));setStatus(c.saved);}}/>
 <button className="tasks-row-main" aria-label={`${c.open}: ${t.title[locale]}`} onClick={e=>open(t.id,e.currentTarget)}><span className="tasks-row-title">{t.title[locale]}</span><span className="tasks-row-meta">{t.subtasks.length>0&&<span>{c.progress(t.subtasks.filter(s=>s.done).length,t.subtasks.length)}<progress max={t.subtasks.length} value={t.subtasks.filter(s=>s.done).length}/></span>}<span className="tasks-stars" aria-label={`${c.difficulty}: ${t.difficulty} — ${c.ratings[t.difficulty-1]}`}>{'★'.repeat(t.difficulty)}<span>{'☆'.repeat(5-t.difficulty)}</span></span><span className="tasks-badge" data-urgency={t.urgency}>{c.urgencies[t.urgency]}</span>{t.deadline&&<span>▦ {formatDate(t.deadline)}</span>}</span></button><button className="tasks-row-start" aria-label={`${c.start}: ${t.title[locale]}`} onClick={e=>open(t.id,e.currentTarget,true)}>▷<span>{c.start}</span></button>
 </li>;})}</ul>
 {visible.length===0&&<div className="tasks-empty"><img src={notebook} alt=""/><h2>{c.empty}</h2><p>{c.emptyCopy}</p><button className="tasks-primary" onClick={()=>quickInput.current?.focus()}>{c.add}</button>{view!=='all'&&<button onClick={()=>setView('all')}>{c.allBack}</button>}</div>}
 <p className="tasks-order-hint">{c.orderHint}</p>
 </section>
 {task?<TaskDetail key={`${task.id}:${startRequested}`} startRequested={startRequested} task={task} locale={locale} copy={c} update={update} close={close} announce={setStatus}/>:<aside className="tasks-unselected"><img src={notebook} alt=""/><p>{c.choose}</p></aside>}
 </div>
 <div className="tasks-preview-bar"><span>{c.preview}</span><div><button onClick={()=>{setTasks([]);setSelected(null);setStatus('');}}>{c.emptyDemo}</button><button onClick={()=>{setTasks(sampleTasks());setView('all');setSelected(null);setStatus('');}}>{c.reset}</button></div></div>
 <p className="tasks-live" role="status" aria-live="polite">{status}</p>
 </main></div>
 <AppFooter locale={locale} createdByLabel={messages[locale].footer.createdBy} motto={messages[locale].footer.motto}/>
 </div>;
}
