// Pied de page (Footer.astro) : heure de Paris (minute près) et humeur du moment selon l'heure.
import { onPage } from '../page';

onPage('[data-clock]', (ctx) => {
  const tick = () => document.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
    const hm = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const h = parseInt(hm, 10);
    const moods = JSON.parse(el.dataset.moods || '[]') as [number, string][];
    const mood = moods.filter(([s]) => h >= s).pop();
    el.querySelector('[data-time]')!.textContent = `Paris, ${hm}`;
    el.querySelector('[data-mood]')!.textContent = mood ? mood[1] : '';
  });
  tick(); ctx.interval(tick, 20000);
});
