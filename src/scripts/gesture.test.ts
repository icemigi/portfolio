import assert from 'node:assert/strict';
import { test } from 'node:test';
import { wheelGesture } from './gesture.ts';

// rejoue des événements espacés de `dt` ms à partir de `t0`, et renvoie les passages demandés
const play = (feed: (now: number, d: number) => number, deltas: number[], t0 = 1000, dt = 30) =>
  deltas.map((d, i) => feed(t0 + i * dt, d)).filter(Boolean);

test("l'inertie qui décroît ne fait passer qu'un écran", () => {
  assert.deepEqual(play(wheelGesture(() => true), [60, 80, 70, 50, 35, 22, 14, 8, 4, 2]), [1]);
});

test("un sursaut isolé de l'élan n'est pas un nouveau geste", () => {
  assert.deepEqual(play(wheelGesture(() => true), [80, 70, 60, 50, 40, 30, 20, 40, 25, 10]), [1]);
});

test('un vrai nouveau coup de doigt relance après 200 ms', () => {
  assert.deepEqual(play(wheelGesture(() => true), [60, 50, 40, 30, 20, 28, 40, 60]), [1, 1]);
});

test('deux crans rapprochés ne font pas sauter deux écrans', () => {
  const feed = wheelGesture(() => true);
  assert.equal(feed(1000, 100), 1);
  assert.equal(feed(1300, 100), 0);
  assert.equal(feed(1800, 100), 1);
});

test('le changement de sens passe tout de suite', () => {
  assert.deepEqual(play(wheelGesture(() => true), [60, 40, -60]), [1, -1]);
});

test("un écran qui défile encore garde le geste", () => {
  assert.deepEqual(play(wheelGesture(() => false), [60, 80, 70]), []);
});
