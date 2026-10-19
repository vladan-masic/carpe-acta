import { bilingual, dateKey, type Task, type View } from '../../tasks/presentation/model';
export * from '../../tasks/presentation/model';
export function sampleTasks(): Task[] {
  const day = (offset: number) => { const date = new Date(); date.setDate(date.getDate()+offset); return dateKey(date); };
  const titles = [bilingual('Build my portfolio website', 'Napravi svoj portfolio sajt'), bilingual('Apply for three frontend positions', 'Prijavi se za tri frontend pozicije'), bilingual('Read 15 pages of a book', 'Pročitaj 15 stranica knjige'), bilingual('Plan next week', 'Isplaniraj sledeću nedelju'), bilingual('Go for a short walk', 'Prošetaj nakratko'), bilingual('Send project update', 'Pošalji izveštaj o projektu'), bilingual('Organize my workspace', 'Uredi svoj radni prostor')];
  const steps = [bilingual('Create the project folder', 'Napravi fasciklu projekta'), bilingual('Set up the development environment', 'Podesi razvojno okruženje'), bilingual('Sketch the homepage layout', 'Skiciraj početnu stranicu'), bilingual('Add projects and a short introduction', 'Dodaj projekte i kratak uvod'), bilingual('Check the mobile layout', 'Proveri prikaz na telefonu')];
  return titles.map((title, i) => ({ id: `sample-${i}`, title, notes: i === 0 ? bilingual('A little home for my work. Keep it simple: a few projects, a short introduction, and a way to get in touch.', 'Mali kutak za moj rad. Neka bude jednostavno: nekoliko projekata, kratak uvod i način da me kontaktiraju.') : bilingual('', ''), difficulty: [4,2,1,3,1,2,2][i], urgency: [2,1,0,1,0,2,0][i], importance: 1, deadline: i === 6 ? '' : day([3,2,0,5,0,0][i]), minutes: ['120','60','25','30','15','20','30'][i], done: i === 5, subtasks: i === 0 ? steps.map((title,j) => ({id:`step-${j}`,title,done:j<2})) : [] }));
}
export function filterTasks(tasks: Task[], view: View, today = dateKey()) {
  return tasks.filter(t => view === 'all' || (view === 'completed' ? t.done : !t.done && (view === 'today' ? t.deadline === today : view === 'upcoming' ? t.deadline > today : !t.deadline)));
}
