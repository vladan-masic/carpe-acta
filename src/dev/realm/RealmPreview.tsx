import { useEffect, useRef, useState } from 'react';
import { AppToolbar } from '../../components/AppToolbar';
import { AppFooter } from '../../components/AppFooter';
import { LanguageSelector } from '../../components/LanguageSelector';
import { getInitialLocale } from '../../i18n/locales';
import { messages } from '../../i18n/messages';
import landscape from '../../assets/illustrations/hero-path-1200.webp';
import botanical from '../../assets/illustrations/botanical-details.webp';
import { buildings, buildReason, construct, cost, expeditionCost, expeditionReward, explore, exploreReason, hero, initialRealm, MAX_LEVEL, resources, reward, buySupply, supplyAmount, supplyReason, materialBuildings, type Building, type Route, type Stock, type Material } from './model';
import { realmCopy, type RealmCopy } from './copy';
import { RewardSimulator } from './RewardSimulator';
import './realm.css';

// Temporary symbols retained until a matched terrain/building asset set is supplied.
const symbols = { hall: '♜', farm: '🌾', sawmill: '🌲', quarry: '⛰', mine: '⛏', workshop: '⚒' };
const resourceSymbols = { wood: '▤', stone: '◆', food: '♧', coins: '◉', iron: '⬡' };
const materials: Material[] = ['wood', 'stone', 'food', 'iron'];
function ResourceLine({ stock, copy }: { stock: Stock; copy: RealmCopy }) {
  return <ul className="realm-resource-line">{resources.filter(key => stock[key] > 0).map(key => <li key={key}><span aria-hidden="true">{resourceSymbols[key]}</span> {stock[key]} {copy.resources[key]}</li>)}</ul>;
}
export function RealmPreview() {
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [state, setState] = useState(initialRealm);
  const [selected, setSelected] = useState<Building | null>('hall');
  const [route, setRoute] = useState<Route>('gather');
  const [feedback, setFeedback] = useState('');
  const resetDialog = useRef<HTMLDialogElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const c = realmCopy[locale], profile = hero(state.xp), village = state.village;
  const target = selected ? village.levels[selected] + 1 : 0;
  const reason = selected ? buildReason(state, selected) : 'ready';
  const expeditionReason = exploreReason(state);
  const selectedMaterial = materials.find(material => materialBuildings[material] === selected);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.lang = locale; document.title = `${c.realm} · Carpe Acta`; setFeedback(''); }, [locale, c.realm]);
  function selectBuilding(building: Building) {
    setSelected(building);
    requestAnimationFrame(() => {
      detailHeading.current?.focus({ preventScroll: true });
      detailHeading.current?.scrollIntoView({ block: window.matchMedia('(max-width: 900px)').matches ? 'start' : 'nearest' });
    });
  }
  return <div className="realm-preview" id="page-top" tabIndex={-1}>
    <div className="realm-shell">
      <AppToolbar label={c.menu} navigation={<nav className="section-navigation" aria-label={c.menu}>
        <a href="/">{c.home}</a><a href="/__tasks-kanban-preview">{c.tasks}</a><a href="/__realm-preview" aria-current="page">{c.realm}</a>
      </nav>}>
        <label className="realm-theme">{c.theme}<select value={theme} onChange={e => setTheme(e.target.value)}><option value="light">{c.light}</option><option value="dark">{c.dark}</option></select></label>
        <LanguageSelector ariaLabel={c.language} locale={locale} onSelectLocale={setLocale}/>
      </AppToolbar>
      <main>
        <header className="realm-intro"><div><p className="realm-eyebrow">{c.realm}</p><h1>{c.lead}<br/><em>{c.accent}</em></h1><p>{c.intro}</p></div>
          <section className="realm-balances" aria-label={c.village}>{resources.map(key => <div className={`realm-balance realm-${key}`} key={key}>
            <span aria-hidden="true">{resourceSymbols[key]}</span><div><span>{c.resources[key]}</span><strong>{village.stock[key]}</strong></div>
          </div>)}</section>
          <p className="realm-note">{c.note}<span aria-hidden="true"> ♥</span><img src={botanical} alt=""/></p>
        </header>
        <RewardSimulator state={state} copy={c} onEvent={event => {
          const next = reward(state, event);
          setState(next); setFeedback(c.outcomes[next === state ? 'duplicate' : next.rewards.history[0].outcome]);
        }}/>
        <p className="realm-feedback" role="status">{feedback}</p>
        <div className="realm-workspace" data-selected={Boolean(selected)}>
          <section className="realm-village" aria-label={c.village}>
            <img className="realm-landscape" src={landscape} alt=""/>
            <div className="realm-map-label"><h2>{c.village}</h2><span>{c.artwork}</span></div>
            <div className="realm-plots">{buildings.map(building => <button id={`plot-${building}`} key={building} className={`realm-plot realm-plot-${building}`}
              aria-label={`${c.buildings[building]}, ${village.levels[building] ? `${c.level} ${village.levels[building]}` : c.plot}`} aria-pressed={selected === building} onClick={() => selectBuilding(building)}>
              <span className="realm-building-symbol" aria-hidden="true">{symbols[building]}</span><strong>{c.buildings[building]}</strong>
              <span>{village.levels[building] ? `${c.level} ${village.levels[building]}` : c.plot}</span>
              {buildReason(state, building) === 'ready' && <small title={village.levels[building] ? c.upgrade : c.construct} aria-hidden="true">＋</small>}
            </button>)}</div>
            <div className="realm-map-caption">{c.choose}</div>
          </section>
          {selected && <aside className="realm-detail realm-paper" aria-labelledby="realm-detail-heading">
            <div className="realm-detail-header"><span aria-hidden="true">{symbols[selected]}</span><div><p className="realm-eyebrow">{c.overview}</p>
              <h2 id="realm-detail-heading" ref={detailHeading} tabIndex={-1}>{c.buildings[selected]}</h2><p>{village.levels[selected] ? `${c.level} ${village.levels[selected]} / ${MAX_LEVEL}` : c.plot}</p></div>
              <button className="realm-close" aria-label={c.close} onClick={() => { const previous = selected; setSelected(null); requestAnimationFrame(() => document.getElementById(`plot-${previous}`)?.focus()); }}>×</button></div>
            <p>{c.functions[selected]}</p>
            {target <= MAX_LEVEL && <>
              <h3>{c.benefits}</h3><div className="realm-benefit">
                {selected === 'hall' ? <><strong>{c.hallBenefit}: {Math.min(MAX_LEVEL, village.levels.hall + 1)} → {Math.min(MAX_LEVEL, target + 1)}</strong><p>{c.hallSupply}: +{village.levels.hall - 1} → +{target - 1}</p><p>{c.hallUnlock}</p></> :
                  selected === 'workshop' ? <><strong>{c.workshopBenefit}: +{village.levels.workshop * 2} → +{target * 2}</strong><p>{c.workshopUnlock}: {Math.min(MAX_LEVEL, target + 2)}</p></> :
                  selectedMaterial && <strong>{c.bundleBenefit}: {selected === 'mine' && village.levels.mine === 0 ? '—' : supplyAmount(village, selectedMaterial)} → {supplyAmount({ ...village, levels: { ...village.levels, [selected]: target } }, selectedMaterial)}</strong>}
              </div>
              <h3>{c.requirements} <span>· {c.level} {target}</span></h3>
              <ul className="realm-cost">{resources.filter(key => cost(selected, target)[key] > 0).map(key => <li key={key}><span>{c.resources[key]}</span><strong>{cost(selected, target)[key]}</strong><small data-enough={village.stock[key] >= cost(selected, target)[key]}>{village.stock[key]} / {cost(selected, target)[key]} {village.stock[key] >= cost(selected, target)[key] ? '✓' : '−'}</small></li>)}</ul>
            </>}
            <p className="realm-duration">{c.instant}</p>
            <button className="realm-primary realm-build" disabled={reason !== 'ready'} aria-describedby="realm-build-reason" onClick={() => { setState(current => construct(current, selected)); setFeedback(c.built); requestAnimationFrame(() => detailHeading.current?.focus({ preventScroll: true })); }}>{village.levels[selected] ? `${c.upgrade} ${Math.min(target, MAX_LEVEL)}` : c.construct}</button>
            <p id="realm-build-reason" className="realm-hint">{c.reasons[reason]}</p>
          </aside>}
        </div>
        <details className="realm-artwork-note"><summary>{c.artwork}</summary><p>{c.artworkHelp}</p></details>
        <section className="realm-supplies realm-paper" aria-labelledby="realm-supply-heading">
          <h2 id="realm-supply-heading">{c.supplies}</h2><p>{c.suppliesHelp}</p>
          <div className="realm-supply-grid">{materials.map(material => <div key={material}>
            <strong>{c.resources[material]}</strong><p>+{supplyAmount(village, material)} {c.forCoins}</p>
            <button aria-describedby={`supply-${material}`} disabled={supplyReason(state, material) !== 'ready'} onClick={() => { setState(current => buySupply(current, material)); setFeedback(c.bought); }}>{c.buyResource[material]}</button>
            <small id={`supply-${material}`}>{c.reasons[supplyReason(state, material)]}</small>
          </div>)}</div>
        </section>
        <div className="realm-summary">
          <section className="realm-paper"><h2>{c.hero}</h2><div className="realm-hero-profile"><span aria-hidden="true">☼</span><div><strong>{c.heroName}</strong><p>{c.level} {profile.level} · {profile.progress} / {profile.next} {c.xp}</p></div></div>
            <progress aria-label={c.xp} value={profile.progress} max={profile.next}/><p>{c.scouting}: {Math.min(3, profile.level - 1)} / 3 {c.stages}</p><p>{c.heroHelp}</p></section>
          <section className="realm-paper"><h2>{c.goals}</h2><ul className="realm-goals">{[[c.goalHall, village.levels.hall >= 2], [c.goalMine, village.levels.mine >= 1], [c.goalForest, village.explored === 3]].map(([label, complete]) => <li key={String(label)}><span role="img" aria-label={complete ? c.complete : c.pending}>{complete ? '✓' : '○'}</span>{label}</li>)}</ul></section>
          <section className="realm-paper"><h2>{c.events}</h2>{state.journal.length ? <ol className="realm-journal">{state.journal.map(event => <li key={event.id}>{event.kind === 'built' ? `${c.eventBuilt}: ${c.buildings[event.building!]}` : `${c.returned}: ${event.stage}`}</li>)}</ol> : <p>{c.emptyJournal}</p>}</section>
        </div>
        <section className="realm-exploration realm-paper" aria-labelledby="realm-explore"><div><p className="realm-eyebrow">{c.region} · {c.stage} {Math.min(3, village.explored + 1)} / 3</p>
          <h2 id="realm-explore">{c.explore}</h2><p>{c.explorationHelp}</p><progress aria-label={c.region} value={village.explored} max={3}/><p id="expedition-reason">{c.reasons[expeditionReason]}</p></div>
          {village.explored < 3 && <div><fieldset><legend>{c.reward}</legend>{(['gather', 'survey'] as Route[]).map(choice => <label className="realm-route" key={choice}><input type="radio" name="route" checked={route === choice} onChange={() => setRoute(choice)}/><span><strong>{c[choice]}</strong><small>{choice === 'gather' ? c.gatherHelp : c.surveyHelp}</small></span></label>)}</fieldset>
            <ResourceLine stock={expeditionReward(village.explored, route)} copy={c}/><h3>{c.price}</h3><ResourceLine stock={expeditionCost(village.explored)} copy={c}/>
            <button className="realm-primary" aria-describedby="expedition-reason" disabled={expeditionReason !== 'ready'} onClick={() => { setState(current => explore(current, route)); setFeedback(c.departed); }}>{c.depart}</button></div>}
        </section>
        <details className="realm-rules"><summary>{c.rules}</summary><p>{c.rulesText}</p><p>{c.undoPolicy}</p></details>
        <div className="realm-isolation"><p>{c.isolated}</p><button onClick={() => resetDialog.current?.showModal()}>{c.reset}</button></div>
      </main>
    </div>
    <AppFooter locale={locale} createdByLabel={messages[locale].footer.createdBy} motto={messages[locale].footer.motto}/>
    <dialog className="realm-reset" ref={resetDialog} aria-labelledby="realm-reset-heading"><h2 id="realm-reset-heading">{c.resetConfirm}</h2><form method="dialog"><button autoFocus>{c.cancel}</button><button onClick={() => { setState(initialRealm()); setSelected('hall'); setRoute('gather'); setFeedback(c.restored); }}>{c.confirm}</button></form></dialog>
  </div>;
}
