import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { FocusController, focusAt } from './controller';

function useController(controller:FocusController|null) {
 const state=useSyncExternalStore(controller?.subscribe??emptySubscribe,controller?.getSnapshot??emptySnapshot);
 const [now,setNow]=useState(Date.now);
 const [openRequest,setOpenRequest]=useState(0);
 useEffect(()=>controller?.connect(),[controller]);
 useEffect(()=>{
  const tick=()=>{
   const time=Date.now();setNow(time);
   if(state.session?.phase==='running'&&focusAt(state.session,time).phase!=='running')controller?.restore();
  };tick();
  if(state.session?.phase!=='running')return;
  const interval=window.setInterval(tick,1000);
  window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);
  return()=>{clearInterval(interval);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick);};
 },[state.session,controller]);
 return {controller,session:state.session?focusAt(state.session,now):null,error:state.error,openRequest,requestOpen:()=>setOpenRequest(n=>n+1)};
}
const empty={session:null,error:null};
const emptySnapshot=()=>empty;
const emptySubscribe=()=>()=>{};
type FocusContextValue=ReturnType<typeof useController>;
const Context=createContext<FocusContextValue|null>(null);
export function FocusProvider({scope,children}:{scope:string|null;children:ReactNode}) {
 const controllers=useRef(new Map<string,FocusController>());
 if(scope&&!controllers.current.has(scope))controllers.current.set(scope,new FocusController(scope));
 const controller=scope?controllers.current.get(scope)!:null;
 const value=useController(controller);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
/** Development previews can use the same UI with an isolated, memory-only controller. */
export function useFocusSession() {
 const shared=useContext(Context);
 const fallback=useMemo(()=>shared?null:new FocusController('preview',()=>null),[Boolean(shared)]);
 const isolated=useController(fallback);
 return shared??isolated;
}
