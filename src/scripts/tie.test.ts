import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tie } from './tie.ts';

const N = ' ';
test('un petit mot français reste avec le suivant', () => {
  assert.equal(tie("j'écris du code. Le reste vient", 'fr'), `j'écris du${N}code. Le${N}reste vient`);
});
test('« à la » : les deux petits mots sont liés', () => {
  assert.equal(tie('du logotype à la lettre', 'fr'), `du${N}logotype à${N}la${N}lettre`);
});
test('les mots longs gardent une espace normale', () => {
  assert.equal(tie('Designer graphique toujours', 'fr'), 'Designer graphique toujours');
});
test('en anglais : a, I, of, the', () => {
  assert.equal(tie('I draw a lot of the letters', 'en'), `I${N}draw a${N}lot of${N}the${N}letters`);
});
test("l'espace en fin de texte après un petit mot devient insécable (le mot suivant est dans l'élément d'après)", () => {
  assert.equal(tie('Designer et directeur artistique à ', 'fr'), `Designer et${N}directeur artistique à${N}`);
});
test('en français, « : ; ! ? » ne commencent jamais une ligne', () => {
  assert.equal(tie('trois éléments : une base', 'fr'), `trois éléments${N}: une${N}base`);
});
