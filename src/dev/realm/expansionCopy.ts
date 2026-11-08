const en = {
  selector: 'Choose a village location', pan: 'Scroll horizontally or use the building selector. Select a building or an empty plot to view its requirements.',
  locked: 'Locked plot', available: 'Available plot', terrain: 'Approved village artwork. Town Hall and Farm artwork changes at levels 1, 3 and 5; other buildings retain one illustration.',
  hall: 'Town Hall', workshop: 'Workshop', requires: 'Requires', none: 'None', cost: 'Cost', outcome: 'Guaranteed outcome', after: 'Balance after trade', trade: 'Exchange materials', from: 'Give', to: 'Receive', rate: 'Exact exchange',
  marketHelp: 'Level 1: wood and stone; 2: food; 3: iron. Give 6, receive 3. Level 4 receives 4; level 5 receives 5. No coins or XP.',
  research: 'Research', researchHelp: 'Five permanent, one-time improvements. Each Academy level unlocks the corresponding tier. No coins or XP are awarded.',
  construction: 'Material construction cost reduction (rounded up)', logistics: 'Extra materials per paid supply bundle', exploration: 'Less food for each new regional expedition',
  guild: 'Regional expeditions', guildHelp: 'Five places, each visited once. Every Guild level opens one destination. Forest progress remains separate. No coins, XP, timers or random outcomes.',
  tavern: 'Visiting travelers', tavernHelp: 'Five optional contracts, one per Tavern level. Visitors stay until you choose to help; there are no deadlines. Completion is permanent.',
  doResearch: 'Unlock research', visit: 'Visit destination', contract: 'Complete contract', done: 'Recorded as complete', changed: 'Village updated. Costs and outcomes applied once.',
  researchNames: { foundations: 'Careful foundations', packing: 'Thoughtful packing', trailcraft: 'Trailcraft', masonry: 'Measured masonry', caravans: 'Shared caravans' },
  destinations: { meadow: 'Quiet meadow', river: 'River landing', ridge: 'Slate ridge', orchard: 'Old orchard', pass: 'Mountain pass' },
  travelers: { potter: 'The potter · clay exchange', gardener: 'The gardener · a shared garden', cartographer: 'The cartographer · river notes', storyteller: 'The storyteller · an evening together', bridgewright: 'The bridgewright · a safe crossing' },
  stories: { potter: 'Local clay becomes useful stoneware for the settlement.', gardener: 'A village garden takes root beside the paths.', cartographer: 'Your river notes help the visitor finish a map.', storyteller: 'Neighbors gather to share stories. This memory is the reward.', bridgewright: 'With the pass surveyed, the village repairs its crossing.' },
  districts: { hall: 'Central elevated clearing', sawmill: 'Western forest', quarry: 'Lower rocky district', farm: 'Eastern fields', mine: 'Rocky hillside', workshop: 'River workshop bank', marketplace: 'Central crossroads', academy: 'Upper terrace', guild: 'Forest boundary', tavern: 'Bridge and village entrance' },
};
type Localized<T> = T extends string ? string : { [K in keyof T]: Localized<T[K]> };
export type ExpansionCopy = Localized<typeof en>;
const sr: ExpansionCopy = {
  selector: 'Izaberi mesto u selu', pan: 'Pomeraj prikaz vodoravno ili koristi izbor zgrade. Izaberi zgradu ili prazno mesto da vidiš uslove gradnje.',
  locked: 'Zaključeno mesto', available: 'Dostupno mesto', terrain: 'Odobrene ilustracije sela. Gradska kuća i farma menjaju ilustraciju na nivoima 1, 3 i 5; ostale zgrade zadržavaju jednu ilustraciju.',
  hall: 'Gradska kuća', workshop: 'Radionica', requires: 'Potrebno', none: 'Nema', cost: 'Trošak', outcome: 'Zagarantovani ishod', after: 'Stanje posle razmene', trade: 'Razmeni materijale', from: 'Daješ', to: 'Dobijaš', rate: 'Tačna razmena',
  marketHelp: 'Nivo 1: drvo i kamen; 2: hrana; 3: gvožđe. Daješ 6, dobijaš 3. Nivo 4 daje 4; nivo 5 daje 5. Bez novčića i XP.',
  research: 'Istraživanje', researchHelp: 'Pet trajnih, jednokratnih poboljšanja. Svaki nivo akademije otključava odgovarajući stepen. Nema nagrada u novčićima ili XP.',
  construction: 'Smanjenje materijalnog troška gradnje (zaokruženo naviše)', logistics: 'Dodatni materijali po kupljenom paketu', exploration: 'Manje hrane za svaku novu regionalnu ekspediciju',
  guild: 'Regionalne ekspedicije', guildHelp: 'Pet mesta, svako se posećuje jednom. Svaki nivo esnafa otvara jedno odredište. Napredak u šumi ostaje zaseban. Bez novčića, XP, tajmera i nasumičnih ishoda.',
  tavern: 'Putnici u poseti', tavernHelp: 'Pet opcionih dogovora, po jedan za svaki nivo krčme. Putnici ostaju dok ne odlučiš da pomogneš; nema rokova. Završetak se trajno beleži.',
  doResearch: 'Otključaj istraživanje', visit: 'Poseti odredište', contract: 'Ispuni dogovor', done: 'Zabeleženo kao završeno', changed: 'Selo je ažurirano. Troškovi i ishodi primenjeni su jednom.',
  researchNames: { foundations: 'Pažljivi temelji', packing: 'Promišljeno pakovanje', trailcraft: 'Veština putovanja', masonry: 'Odmereno zidanje', caravans: 'Zajednički karavani' },
  destinations: { meadow: 'Tiha livada', river: 'Rečno pristanište', ridge: 'Škriljački greben', orchard: 'Stari voćnjak', pass: 'Planinski prevoj' },
  travelers: { potter: 'Grnčar · razmena gline', gardener: 'Baštovan · zajednička bašta', cartographer: 'Kartograf · beleške sa reke', storyteller: 'Pripovedač · zajedničko veče', bridgewright: 'Graditelj mostova · bezbedan prelaz' },
  stories: { potter: 'Domaća glina postaje korisna grnčarija za naselje.', gardener: 'Seoska bašta niče pored staza.', cartographer: 'Tvoje beleške sa reke pomažu putniku da završi mapu.', storyteller: 'Komšije se okupljaju da podele priče. Ova uspomena je nagrada.', bridgewright: 'Posle istraživanja prevoja, selo obnavlja svoj prelaz.' },
  districts: { hall: 'Središnja uzvišena čistina', sawmill: 'Zapadna šuma', quarry: 'Donji kameniti kraj', farm: 'Istočna polja', mine: 'Kamenita padina', workshop: 'Radionica uz reku', marketplace: 'Središnje raskršće', academy: 'Gornja terasa', guild: 'Rub šume', tavern: 'Most i ulaz u selo' },
};
export const expansionCopy = { en, 'sr-Latn': sr };
