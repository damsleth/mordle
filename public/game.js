// Mordle – spillmotor
// Genererer 3×3-logikkgåter (3 mistenkte, 3 våpen, 3 åsteder) med garantert unik løsning.
// Brukes både i nettleseren (app.js) og i tester (Node).

// ---------- Innhold ----------

export const MISTENKTE = [
  { navn: 'Baronesse Berg', emoji: '👑' },
  { navn: 'Doktor Dahl', emoji: '🩺' },
  { navn: 'Kaptein Kystvik', emoji: '⚓' },
  { navn: 'Fru Fjellheim', emoji: '🧣' },
  { navn: 'Herr Holm', emoji: '🎩' },
  { navn: 'Prost Piil', emoji: '📿' },
  { navn: 'Frøken Fossum', emoji: '🎻' },
  { navn: 'Ordfører Onsum', emoji: '🎖️' },
  { navn: 'Kokk Krydder', emoji: '🍳' },
  { navn: 'Gartner Grønlie', emoji: '🌱' },
  { navn: 'Advokat Aske', emoji: '⚖️' },
  { navn: 'Student Strand', emoji: '🎒' },
];

// navn = bestemt form («kniven»), ub = ubestemt («en kniv»)
export const VAAPEN = [
  { navn: 'kniven', ub: 'en kniv', emoji: '🔪' },
  { navn: 'tauet', ub: 'et tau', emoji: '🪢' },
  { navn: 'giften', ub: 'en flaske gift', emoji: '🧪' },
  { navn: 'lysestaken', ub: 'en lysestake', emoji: '🕯️' },
  { navn: 'øksa', ub: 'ei øks', emoji: '🪓' },
  { navn: 'brunosthøvelen', ub: 'en brunosthøvel', emoji: '🧀' },
  { navn: 'fiskestanga', ub: 'ei fiskestang', emoji: '🎣' },
  { navn: 'strikkepinnen', ub: 'en strikkepinne', emoji: '🧶' },
  { navn: 'isøksa', ub: 'ei isøks', emoji: '⛏️' },
  { navn: 'skistaven', ub: 'en skistav', emoji: '🎿' },
];

// prep = preposisjonen som brukes med stedet («i biblioteket», «på loftet»)
export const STEDER = [
  { navn: 'biblioteket', prep: 'i', emoji: '📚' },
  { navn: 'fyrtårnet', prep: 'i', emoji: '🗼' },
  { navn: 'badstuen', prep: 'i', emoji: '🧖' },
  { navn: 'vinkjelleren', prep: 'i', emoji: '🍷' },
  { navn: 'drivhuset', prep: 'i', emoji: '🪴' },
  { navn: 'brygga', prep: 'på', emoji: '🛶' },
  { navn: 'stabburet', prep: 'i', emoji: '🏚️' },
  { navn: 'kjøkkenet', prep: 'på', emoji: '🥘' },
  { navn: 'loftet', prep: 'på', emoji: '🕸️' },
  { navn: 'hagestua', prep: 'i', emoji: '🌷' },
];

export const OFRE = [
  'godseier Gustav Gran',
  'operasangerinne Olga Opsahl',
  'skipsreder Sigurd Sund',
  'arving Amalie Ask',
  'antikvitetshandler Anton Alm',
  'hoffotograf Hulda Hagen',
  'polfarer Peder Polden',
  'sjakkmester Sverre Sletten',
];

export const AASTEDER_NAVN = [
  'Villa Vestland',
  'Gods Granheim',
  'Hotell Havblikk',
  'Fjellstua Falkeredet',
  'Herregården Måneskinn',
  'Pensjonat Perleporten',
];

// ---------- Slumptall (seedbar, så saker kan deles) ----------

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stokk(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function velg(arr, rnd, antall) {
  return stokk(arr, rnd).slice(0, antall);
}

// ---------- Løsningsrom ----------
// En kandidat er { sLoc: [l0,l1,l2], wLoc: [l0,l1,l2], m: åstedsindeks }.
// Morderen er den mistenkte som befinner seg på åstedet m,
// og mordvåpenet er våpenet som ligger der.

const PERMS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

function alleKandidater() {
  const ut = [];
  for (const sLoc of PERMS)
    for (const wLoc of PERMS)
      for (let m = 0; m < 3; m++) ut.push({ sLoc, wLoc, m });
  return ut;
}

export function morderAv(k) {
  return k.sLoc.indexOf(k.m);
}
export function vaapenAv(k) {
  return k.wLoc.indexOf(k.m);
}

// ---------- Ledetrådtyper ----------
// Hver type har en predikatfunksjon (gjelder kandidat?) og en tekstmal.
// vekt styrer hvor ofte typen prioriteres i trekningen.

function lagLedetraadPool(losning, aktorer, rnd) {
  const { mistenkte, vaapen, steder } = aktorer;
  const pool = [];
  const push = (type, vekt, test, tekst) => pool.push({ type, vekt, test, tekst });

  for (let i = 0; i < 3; i++) {
    for (let l = 0; l < 3; l++) {
      const s = mistenkte[i];
      const st = steder[l];
      if (losning.sLoc[i] === l) {
        push('mistenkt-sted', 1, (k) => k.sLoc[i] === l,
          `${s.emoji} ${s.navn} ble sett ${st.prep} ${st.navn} ${st.emoji}.`);
      } else {
        push('mistenkt-ikke-sted', 3, (k) => k.sLoc[i] !== l,
          `${s.emoji} ${s.navn} var ikke ${st.prep} ${st.navn} ${st.emoji}.`);
      }
    }
  }

  for (let j = 0; j < 3; j++) {
    for (let l = 0; l < 3; l++) {
      const w = vaapen[j];
      const st = steder[l];
      if (losning.wLoc[j] === l) {
        push('vaapen-sted', 1, (k) => k.wLoc[j] === l,
          `${w.emoji} Noen la igjen ${w.ub} ${st.prep} ${st.navn} ${st.emoji}.`);
      } else {
        push('vaapen-ikke-sted', 3, (k) => k.wLoc[j] !== l,
          `${w.emoji} ${storFørsteBokstav(w.navn)} var ikke ${st.prep} ${st.navn} ${st.emoji}.`);
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const s = mistenkte[i];
      const w = vaapen[j];
      if (losning.sLoc[i] === losning.wLoc[j]) {
        push('mistenkt-med-vaapen', 2, (k) => k.sLoc[i] === k.wLoc[j],
          `${s.emoji} ${s.navn} befant seg på samme sted som ${w.navn} ${w.emoji}.`);
      } else {
        push('mistenkt-uten-vaapen', 2, (k) => k.sLoc[i] !== k.wLoc[j],
          `${s.emoji} ${s.navn} var ikke i nærheten av ${w.navn} ${w.emoji}.`);
      }
    }
  }

  const morder = morderAv(losning);
  const mordvaapen = vaapenAv(losning);

  for (let i = 0; i < 3; i++) {
    if (i !== morder) {
      const s = mistenkte[i];
      push('uskyldig', 2, (k) => morderAv(k) !== i,
        `🕊️ ${s.navn} har vanntett alibi og er uskyldig.`);
    }
  }
  for (let j = 0; j < 3; j++) {
    if (j !== mordvaapen) {
      const w = vaapen[j];
      push('ikke-mordvaapen', 2, (k) => vaapenAv(k) !== j,
        `🔬 Teknikerne har utelukket ${w.navn} ${w.emoji} som mordvåpen.`);
    }
  }
  for (let l = 0; l < 3; l++) {
    const st = steder[l];
    if (l !== losning.m) {
      push('ikke-aasted', 2, (k) => k.m !== l,
        `🚪 Ingen spor etter basketak ${st.prep} ${st.navn} ${st.emoji}.`);
    } else {
      push('aasted', 0.5, (k) => k.m === l,
        `🩸 Det ble funnet blodspor ${st.prep} ${st.navn} ${st.emoji}.`);
    }
  }

  // Vektet stokking: trekk uten tilbakelegging med vekt som sannsynlighet.
  const rest = pool.slice();
  const ut = [];
  while (rest.length) {
    let sum = 0;
    for (const c of rest) sum += c.vekt;
    let r = rnd() * sum;
    let idx = 0;
    for (; idx < rest.length - 1; idx++) {
      r -= rest[idx].vekt;
      if (r <= 0) break;
    }
    ut.push(rest.splice(idx, 1)[0]);
  }
  return ut;
}

function storFørsteBokstav(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- Generator ----------

export function antallLosninger(ledetraader) {
  let kandidater = alleKandidater();
  for (const c of ledetraader) kandidater = kandidater.filter(c.test);
  return kandidater.length;
}

// Full generering, inkludert predikatene (brukes av tester).
export function lagSakIntern(seed) {
  const rnd = mulberry32(seed);

  const mistenkte = velg(MISTENKTE, rnd, 3);
  const vaapen = velg(VAAPEN, rnd, 3);
  const steder = velg(STEDER, rnd, 3);
  const offer = OFRE[Math.floor(rnd() * OFRE.length)];
  const aasted = AASTEDER_NAVN[Math.floor(rnd() * AASTEDER_NAVN.length)];

  const losning = {
    sLoc: PERMS[Math.floor(rnd() * 6)],
    wLoc: PERMS[Math.floor(rnd() * 6)],
    m: Math.floor(rnd() * 3),
  };

  const pool = lagLedetraadPool(losning, { mistenkte, vaapen, steder }, rnd);

  // Grådig utvalg: legg til ledetråder som krymper løsningsrommet til én kandidat.
  let kandidater = alleKandidater();
  const valgte = [];
  for (const c of pool) {
    if (kandidater.length === 1) break;
    const etter = kandidater.filter(c.test);
    if (etter.length < kandidater.length) {
      valgte.push(c);
      kandidater = etter;
    }
  }

  // Minimer: fjern ledetråder som er overflødige for entydighet.
  for (let i = valgte.length - 1; i >= 0; i--) {
    const uten = valgte.filter((_, idx) => idx !== i);
    if (antallLosninger(uten) === 1) valgte.splice(i, 1);
  }

  return {
    seed,
    mistenkte,
    vaapen,
    steder,
    offer,
    aasted,
    losning: {
      sLoc: losning.sLoc,
      wLoc: losning.wLoc,
      m: losning.m,
      morder: morderAv(losning),
      mordvaapen: vaapenAv(losning),
    },
    valgte: stokk(valgte, rnd),
  };
}

// Det spillet bruker: som lagSakIntern, men med ledetrådene som ren tekst.
export function lagSak(seed) {
  const sak = lagSakIntern(seed);
  const { valgte, ...rest } = sak;
  return { ...rest, ledetraader: valgte.map((c) => c.tekst) };
}
