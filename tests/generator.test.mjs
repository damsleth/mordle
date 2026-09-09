import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lagSak,
  lagSakIntern,
  antallLosninger,
  alleKandidater,
  permutasjoner,
  dagensSeed,
  NIVAAER,
} from '../public/game.js';

const SEEDS = { lett: 2000, middels: 2000, vanskelig: 500 };
const MAKS_LEDETRAADER = { lett: 10, middels: 10, vanskelig: 16 };

test('permutasjoner(n) gir n! unike permutasjoner', () => {
  assert.equal(permutasjoner(3).length, 6);
  assert.equal(permutasjoner(4).length, 24);
  assert.equal(new Set(permutasjoner(4).map((p) => p.join())).size, 24);
  assert.equal(alleKandidater(4).length, 24 * 24 * 4);
});

for (const [niva, N] of Object.entries(SEEDS)) {
  test(`${niva}: hver sak har nøyaktig én løsning, og den er fasiten (${N} seeds)`, () => {
    const n = NIVAAER[niva].n;
    for (let seed = 1; seed <= N; seed++) {
      const sak = lagSakIntern(seed, niva);
      assert.equal(sak.n, n);
      let kandidater = alleKandidater(n);
      for (const c of sak.valgte) kandidater = kandidater.filter(c.test);
      assert.equal(kandidater.length, 1, `seed ${seed}: ikke unik`);
      const k = kandidater[0];
      assert.equal(k.sLoc.join(), sak.losning.sLoc.join(), `seed ${seed}: sLoc avviker`);
      assert.equal(k.wLoc.join(), sak.losning.wLoc.join(), `seed ${seed}: wLoc avviker`);
      assert.equal(k.m, sak.losning.m, `seed ${seed}: åsted avviker`);
    }
  });

  test(`${niva}: ledetrådene er minimale og i et rimelig antall`, () => {
    let min = Infinity, max = 0, sum = 0;
    const antall = Math.min(N, 500);
    const n = NIVAAER[niva].n;
    for (let seed = 1; seed <= antall; seed++) {
      const sak = lagSakIntern(seed, niva);
      for (let i = 0; i < sak.valgte.length; i++) {
        const uten = sak.valgte.filter((_, idx) => idx !== i);
        assert.ok(antallLosninger(uten, n) > 1, `seed ${seed}: ledetråd ${i} er overflødig`);
      }
      min = Math.min(min, sak.valgte.length);
      max = Math.max(max, sak.valgte.length);
      sum += sak.valgte.length;
    }
    console.log(`${niva}: ledetråder min=${min} max=${max} snitt=${(sum / antall).toFixed(2)}`);
    assert.ok(min >= 3, 'for få ledetråder til å være interessant');
    assert.ok(max <= MAKS_LEDETRAADER[niva], 'for mange ledetråder');
  });
}

test('samme seed og nivå gir samme sak (delbare lenker)', () => {
  for (const niva of Object.keys(NIVAAER)) {
    assert.deepEqual(lagSak(12345, niva), lagSak(12345, niva));
  }
  assert.deepEqual(lagSak(12345), lagSak(12345, 'middels'));
  assert.notDeepEqual(lagSak(12345, 'lett'), lagSak(12345, 'middels'));
});

test('ukjent nivå faller tilbake til middels', () => {
  assert.equal(lagSak(7, 'tull').niva, 'middels');
});

test('aktørene er unike innen hver sak', () => {
  for (const niva of Object.keys(NIVAAER)) {
    for (let seed = 1; seed <= 200; seed++) {
      const sak = lagSak(seed, niva);
      for (const liste of [sak.mistenkte, sak.vaapen, sak.steder]) {
        assert.equal(new Set(liste.map((x) => x.navn)).size, sak.n);
      }
    }
  }
});

test('vanskelig bruker indirekte ledetråder, og trekk-ledetråder deles av ≥2 mistenkte', () => {
  const typer = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const sak = lagSakIntern(seed, 'vanskelig');
    for (const c of sak.valgte) {
      typer.add(c.type);
      if (c.type === 'trekk' || c.type === 'morder-trekk') {
        const t = c.tekst.match(/(bruker briller|er venstrehendt|har rødt hår|har skjegg|går alltid med hatt|røyker pipe)/)[1];
        const antall = sak.mistenkte.filter((s) => s.trekk.includes(t)).length;
        assert.ok(antall >= 2, `seed ${seed}: trekket «${t}» er unikt – forkledd direkte ledetråd`);
      }
    }
  }
  for (const t of ['enten-eller-sted', 'enten-eller-vaapen', 'trekk']) {
    assert.ok(typer.has(t), `ledetrådtypen ${t} dukket aldri opp`);
  }
  const lett = new Set();
  for (let seed = 1; seed <= 300; seed++) lagSakIntern(seed, 'lett').valgte.forEach((c) => lett.add(c.type));
  assert.ok(!lett.has('enten-eller-sted') && !lett.has('trekk'), 'lett skal ikke ha indirekte ledetråder');
});

test('dagensSeed er YYYYMMDD fra lokal dato', () => {
  assert.equal(dagensSeed(new Date(2026, 8, 9)), 20260909);
  assert.equal(dagensSeed(new Date(2026, 0, 1)), 20260101);
});
