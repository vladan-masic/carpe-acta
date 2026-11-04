import type { Locale } from '../../i18n/locales';
export const historyCopy = {
  en: {
    title:'My Focus',intro:'A record of the time you chose to give your tasks.',time:'Recorded focus time',sessions:'Focus sessions',days:'Active focus days',
    week:'This week',month:'Last 30 days',all:'All time',period:'Focus period',chart:'This week · recorded focus time',recent:'Recent sessions',
    empty:'No focus sessions recorded yet. A small beginning is enough.',noPeriod:'No sessions recorded in this period.',more:'Show more',
    unavailable:'Task unavailable',stepUnavailable:'Subtask unavailable',remove:'Delete session',deleteTitle:'Delete this history entry?',
    deleteHint:'Task and subtask completion will stay unchanged.',cancel:'Cancel',confirmDelete:'Delete entry',loading:'Loading focus history…',
    error:'Focus history could not be loaded or updated. Your saved data is kept. Please retry.',retry:'Retry history',
    importTitle:'Guest focus history',importHint:'Add this browser’s guest sessions to your account. Existing records stay unchanged; guest history is kept.',
    import:'Import guest history',importError:'Guest history could not be read. It has been kept in browser storage.',importDone:'Guest history is already in this account.',
    review:'Review focus session',task:'Task',subtask:'Subtask',action:'Chosen action',elapsed:'Timer-based elapsed time',actual:'Actual focused duration',
    minutes:'Minutes',seconds:'Seconds',durationHint:'Confirm only the time you actually focused. Pauses are excluded; elapsed time may include time away from the browser.',
    limit:'Enter at least 1 second, no more than the elapsed time or 12 hours.',outcome:'Outcome (optional)',none:'No outcome selected',
    progress:'Made progress',subtaskOutcome:'Completed a subtask',taskOutcome:'Completed the task',stopped:'Stopped without completion',
    outcomeHint:'This describes the session. It does not change task completion.',save:'Save session',discard:'Discard session',continue:'Continue working',
    saving:'Saving session…',saveError:'The session could not be saved. Keep this page open if browser storage is unavailable, and retry. Your session is retained.',
    pending:'This confirmed session is waiting for a save acknowledgement. Retry to finish saving the same record.',close:'Close review',
    summary:'Focus on this task',latest:'Most recent',noTask:'No recorded sessions for this task yet.',dayHint:'Days with recorded sessions, not a streak. Sessions are grouped by their end date in your local timezone.',
    saved:'Session saved.',discarded:'Session discarded.',max:'Maximum',
  },
  'sr-Latn': {
    title:'Moj fokus',intro:'Zabeleženo vreme koje si odvojio za svoje zadatke.',time:'Zabeleženo vreme fokusa',sessions:'Sesije fokusa',days:'Aktivni dani fokusa',
    week:'Ove nedelje',month:'Poslednjih 30 dana',all:'Sve vreme',period:'Period fokusa',chart:'Ova nedelja · zabeleženo vreme fokusa',recent:'Nedavne sesije',
    empty:'Još nema zabeleženih sesija fokusa. Mali početak je dovoljan.',noPeriod:'Nema zabeleženih sesija u ovom periodu.',more:'Prikaži još',
    unavailable:'Zadatak nije dostupan',stepUnavailable:'Podzadatak nije dostupan',remove:'Obriši sesiju',deleteTitle:'Obrisati ovaj zapis?',
    deleteHint:'Završetak zadatka i podzadatka ostaje nepromenjen.',cancel:'Otkaži',confirmDelete:'Obriši zapis',loading:'Učitavanje istorije fokusa…',
    error:'Istorija fokusa nije mogla da se učita ili izmeni. Sačuvani podaci su zadržani. Pokušaj ponovo.',retry:'Ponovo učitaj istoriju',
    importTitle:'Istorija fokusa gosta',importHint:'Dodaj sesije gosta iz ovog pregledača na svoj nalog. Postojeći zapisi se ne menjaju; istorija gosta ostaje sačuvana.',
    import:'Uvezi istoriju gosta',importError:'Istorija gosta nije mogla da se pročita. Zadržana je u memoriji pregledača.',importDone:'Istorija gosta je već na ovom nalogu.',
    review:'Pregled sesije fokusa',task:'Zadatak',subtask:'Podzadatak',action:'Izabrani korak',elapsed:'Proteklo vreme prema tajmeru',actual:'Stvarno vreme fokusa',
    minutes:'Minuti',seconds:'Sekunde',durationHint:'Potvrdi samo vreme tokom kog si zaista bio usredsređen. Pauze su izuzete; proteklo vreme može da obuhvati i vreme van pregledača.',
    limit:'Unesi najmanje 1 sekundu, najviše koliko je proteklo ili 12 sati.',outcome:'Ishod (opciono)',none:'Bez izabranog ishoda',
    progress:'Ostvaren napredak',subtaskOutcome:'Završen podzadatak',taskOutcome:'Završen zadatak',stopped:'Prekinuto bez završetka',
    outcomeHint:'Ovo opisuje sesiju. Ne menja završetak zadatka.',save:'Sačuvaj sesiju',discard:'Odbaci sesiju',continue:'Nastavi rad',
    saving:'Čuvanje sesije…',saveError:'Sesija nije sačuvana. Ako memorija pregledača nije dostupna, ostavi stranicu otvorenu i pokušaj ponovo. Sesija je zadržana.',
    pending:'Potvrđena sesija čeka potvrdu čuvanja. Pokušaj ponovo da dovršiš čuvanje istog zapisa.',close:'Zatvori pregled',
    summary:'Fokus na ovom zadatku',latest:'Najskorija sesija',noTask:'Još nema zabeleženih sesija za ovaj zadatak.',dayHint:'Dani sa zabeleženim sesijama, bez niza. Sesije se grupišu prema datumu završetka u tvojoj lokalnoj vremenskoj zoni.',
    saved:'Sesija je sačuvana.',discarded:'Sesija je odbačena.',max:'Najviše',
  },
};
export const outcomeLabel = (outcome: string | null, locale: Locale) => {
  const c=historyCopy[locale];return outcome === 'subtask'?c.subtaskOutcome:outcome === 'task'?c.taskOutcome:outcome === 'progress'?c.progress:outcome === 'stopped'?c.stopped:c.none;
};
export function duration(seconds: number, locale: Locale) {
  const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=Math.floor(seconds%60);
  const number=new Intl.NumberFormat(locale);
  return `${number.format(h)} ${locale==='en'?'h':'č'} ${number.format(m)} min${s?` ${number.format(s)} s`:''}`;
}
export const sessionDate=(value: string,locale: Locale)=>new Intl.DateTimeFormat(locale==='en'?'en-GB':locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
