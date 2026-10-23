type Icon = 'all'|'today'|'upcoming'|'someday'|'completed'|'start'|'smaller'|'stuck'|'subtasks';
/** Decorative icons; the adjacent localized label provides the accessible name. */
export function TaskIcon({name}:{name:Icon}) {
 return <svg className="task-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {name==='subtasks'&&<><path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/></>}
  {name==='all'&&<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}
  {name==='today'&&<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 11h16m-11 5h2"/></>}
  {name==='upcoming'&&<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>}
  {name==='someday'&&<><path d="M20 3C8 2 2 8 5 16c8 5 16-2 15-13ZM4 21 15 10"/></>}
  {name==='completed'&&<><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></>}
  {name==='start'&&<path d="m7 4 13 8-13 8Z" fill="currentColor" stroke="none"/>}
  {name==='smaller'&&<><path d="M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8ZM9 20h6m-5 3h4"/></>}
  {name==='stuck'&&<><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01"/></>}
 </svg>;
}
