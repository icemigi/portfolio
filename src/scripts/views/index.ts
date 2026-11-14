// Scripts des pages et des composants. Le menu, le pied de page et la liste des projets (partout ou presque, légers) sont
// inscrits d'emblée ; les autres sont des morceaux chargés à la demande, seulement sur les pages qui les contiennent (page.ts).
import { onDemand } from '../page';
import './header';
import './footer';
import './rows';

onDemand('#name', () => import('./home'));
onDemand('[data-p3d]', () => import('./portrait'));
onDemand('[data-projects]', () => import('./stage'));
onDemand('.last .mail', () => import('./contact'));
onDemand('[data-cf]', () => import('./lab'));
onDemand('.room', () => import('./labroom'));
onDemand('canvas.type-canvas', () => import('./typecanvas'));
onDemand('[data-track]', () => import('./archive'));
onDemand('[data-fanions]', () => import('./banners'));
onDemand('[data-likes]', () => import('./likes'));
onDemand('[data-term]', () => import('./cv'));
onDemand('.screens-host.case', () => import('./case'));
onDemand('[data-reel]', () => import('./kern'));
