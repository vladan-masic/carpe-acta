import { useState, type ReactNode } from 'react';
import { ResourceIcon } from './ResourceArtwork';
import { contracts, destinations, researchCatalog, tradeRate } from './catalog';
import { completeContract, contractReason, destinationCost, destinationReason, research, researchReason, resources, trade, tradeQuote, visitDestination, type Building, type Material, type Realm, type Reason, type Stock } from './model';
import type { RealmCopy } from './copy';
import type { ExpansionCopy } from './expansionCopy';
export function StockLine({ stock, copy: c }: { stock: Stock; copy: RealmCopy }) {
  return <span className="realm-stock-line">{resources.map(key => <span key={key}><ResourceIcon resource={key}/> {c.resources[key]}: {stock[key]}</span>)}</span>;
}
export function BuildingActivities({ building, state, copy: c, expansion: e, onAction }: { building: Building; state: Realm; copy: RealmCopy; expansion: ExpansionCopy; onAction: (action: (current: Realm) => Realm) => void }) {
  const [from, setFrom] = useState<Material>('wood'), [to, setTo] = useState<Material>('stone');
  const materials: Material[] = ['wood', 'stone', 'food', 'iron'];
  function card(id: string, title: string, reason: Reason, price: Stock, outcome: Stock | null, detail: ReactNode, label: string, action: (current: Realm) => Realm) {
    return <article className="realm-activity" key={id}><h4>{title}</h4>{detail}<p><b>{e.cost}: </b><StockLine stock={price} copy={c}/></p>{outcome && <p><b>{e.outcome}: </b><StockLine stock={outcome} copy={c}/></p>}
      <button disabled={reason !== 'ready'} aria-describedby={`activity-${id}`} onClick={() => onAction(action)}>{label}: {title}</button><p id={`activity-${id}`}>{c.reasons[reason]}</p></article>;
  }
  if (building === 'marketplace') {
    const quote = tradeQuote(state, from, to), rate = tradeRate(state.village.levels.marketplace);
    return <section className="realm-building-activities"><h3>{c.buildings.marketplace}</h3><p>{e.marketHelp}</p><div className="realm-trade-selectors">{(['from', 'to'] as const).map(direction => <label key={direction}>{e[direction]}<select value={direction === 'from' ? from : to} onChange={event => (direction === 'from' ? setFrom : setTo)(event.target.value as Material)}>{materials.map(key => <option key={key} value={key}>{c.resources[key]}</option>)}</select></label>)}</div>
      <p>{e.rate}: <ResourceIcon resource={from}/> {rate.pay} {c.resources[from]} → <ResourceIcon resource={to}/> {rate.receive} {c.resources[to]}</p>
      {quote.balance && <p><b>{e.after}: </b><StockLine stock={quote.balance} copy={c}/></p>}
      <button disabled={quote.reason !== 'ready'} aria-describedby="trade-reason" onClick={() => onAction(current => trade(current, from, to))}>{e.trade}</button><p id="trade-reason">{c.reasons[quote.reason]}</p></section>;
  }
  if (building === 'academy') return <section className="realm-building-activities"><h3>{e.research}</h3><p>{e.researchHelp}</p>{researchCatalog.map(item => card(item.id, e.researchNames[item.id], researchReason(state, item.id), item.cost, null,
    <><p>{e.requires}: {c.buildings.academy} {item.tier}{item.requires ? ` · ${e.researchNames[item.requires]}` : ''}</p><p>{e[item.branch]}: {item.benefit}{item.branch === 'construction' ? '%' : ''}</p></>, e.doResearch, current => research(current, item.id)))}</section>;
  if (building === 'guild') return <section className="realm-building-activities"><h3>{e.guild}</h3><p>{e.guildHelp}</p>{destinations.map(item => card(item.id, e.destinations[item.id], destinationReason(state, item.id), destinationCost(state, item.id), item.reward,
    <p>{e.requires}: {c.buildings.guild} {item.level} · {c.hero} {item.hero} · {c.region}: {item.forest}/3</p>, e.visit, current => visitDestination(current, item.id)))}</section>;
  if (building === 'tavern') return <section className="realm-building-activities"><h3>{e.tavern}</h3><p>{e.tavernHelp}</p>{contracts.map(item => card(item.id, e.travelers[item.id], contractReason(state, item.id), item.cost, item.reward,
    <><p>{e.requires}: {c.buildings.tavern} {item.level}{item.destination ? ` · ${e.destinations[item.destination]}` : ''}</p><p>{e.stories[item.id]}</p>{state.village.contracts.includes(item.id) && <strong>{e.done}</strong>}</>, e.contract, current => completeContract(current, item.id)))}</section>;
  return null;
}
