import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lagSak,
  lagSakIntern,
  antallLosninger,
} from '../public/game.js';

test('hver sak har nøyaktig én løsning, og den er fasiten (2000 seeds)', () => {
  for (let seed = 1; seed <= 2000; seed++) {
    const sak = lagSakIntern(seed);
    assert.equal(antallLosninger(sak.valgte), 1, `seed ${seed}: ikke unik`);

    // Den gjenværende kandidaten skal være fasiten.
    let kandidater = [];
    for (const perm of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
      for (const perm2 of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
        for (let m = 0; m < 3; m++) kandidater.push({ sLoc: perm, wLoc: perm2, m });
    for (const c of sak.valgte) kandidater = kandidater.filter(c.test);
    assert.equal(kandidater.length, 1);
    const k = kandidater[0];
    assert.equal(k.sLoc.join(), sak.losning.sLoc.join(), `seed ${seed}: sLoc avviker`);
    assert.equal(k.wLoc.join(), sak.losning.wLoc.join(), `seed ${seed}: wLoc avviker`);
    assert.equal(k.m, sak.losning.m, `seed ${seed}: åsted avviker`);
  }
});

test('ledetrådene er minimale og i et rimelig antall', () => {
  let min = Infinity, max = 0, sum = 0;
  const N = 500;
  for (let seed = 1; seed <= N; seed++) {
    const sak = lagSakIntern(seed);
    // Minimalitet: å fjerne én hvilken som helst ledetråd gir flere løsninger.
    for (let i = 0; i < sak.valgte.length; i++) {
      const uten = sak.valgte.filter((_, idx) => idx !== i);
      assert.ok(antallLosninger(uten) > 1, `seed ${seed}: ledetråd ${i} er overflødig`);
    }
    min = Math.min(min, sak.valgte.length);
    max = Math.max(max, sak.valgte.length);
    sum += sak.valgte.length;
  }
  console.log(`ledetråder: min=${min} max=${max} snitt=${(sum / N).toFixed(2)}`);
  assert.ok(min >= 3, 'for få ledetråder til å være interessant');
  assert.ok(max <= 10, 'for mange ledetråder');
});

test('samme seed gir samme sak (delbare lenker)', () => {
  const a = lagSak(12345);
  const b = lagSak(12345);
  assert.deepEqual(a, b);
});

test('aktørene er unike innen hver sak', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const sak = lagSak(seed);
    for (const liste of [sak.mistenkte, sak.vaapen, sak.steder]) {
      assert.equal(new Set(liste.map((x) => x.navn)).size, 3);
    }
  }
});
