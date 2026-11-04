import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HistoryStore } from './store';
import { accountHistory, guestHistory } from './persistence';
const Context=createContext<HistoryStore|null>(null);
export function HistoryProvider({scope,client,children}:{scope:string|null;client?:SupabaseClient|null;children:ReactNode}) {
  const store=useMemo(()=>scope==='guest'?new HistoryStore(null,guestHistory()):scope&&client?new HistoryStore(scope,accountHistory(client,scope)):null,[scope,client]);
  useEffect(()=>store?.connect(),[store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
const empty={entries:[],seen:[],ready:false,busy:false,error:false};
const emptySnapshot=()=>empty, emptySubscribe=()=>()=>{};
export function useHistory() {
  const store=useContext(Context);
  const state=useSyncExternalStore(store?.subscribe??emptySubscribe,store?.getSnapshot??emptySnapshot);
  return {store,...state};
}
