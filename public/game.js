// Mordle – spillmotor
// Genererer N×N-logikkgåter (N mistenkte, N våpen, N åsteder) med garantert unik løsning.
// N = 3 for lett/middels, 4 for vanskelig. Brukes både i nettleseren (app.js) og i tester (Node).

// ---------- Innhold ----------

// trekk brukes i indirekte ledetråder («Den som var i biblioteket bruker briller»).
export const MISTENKTE = [
  { navn: 'Baronesse Berg', emoji: '👑', trekk: ['bruker briller', 'har rødt hår'] },
  { navn: 'Doktor Dahl', emoji: '🩺', trekk: ['bruker briller', 'er venstrehendt'] },
  { navn: 'Kaptein Kystvik', emoji: '⚓', trekk: ['har skjegg', 'røyker pipe'] },
  { navn: 'Fru Fjellheim', emoji: '🧣', trekk: ['går alltid med hatt', 'har rødt hår'] },
  { navn: 'Herr Holm', emoji: '🎩', trekk: ['går alltid med hatt', 'røyker pipe'] },
  { navn: 'Prost Piil', emoji: '📿', trekk: ['bruker briller', 'har skjegg'] },
  { navn: 'Frøken Fossum', emoji: '🎻', trekk: ['er venstrehendt', 'har rødt hår'] },
  { navn: 'Ordfører Onsum', emoji: '🎖️', trekk: ['har skjegg', 'går alltid med hatt'] },
  { navn: 'Kokk Krydder', emoji: '🍳', trekk: ['er venstrehendt', 'har skjegg'] },
  { navn: 'Gartner Grønlie', emoji: '🌱', trekk: ['røyker pipe', 'går alltid med hatt'] },
  { navn: 'Advokat Aske', emoji: '⚖️', trekk: ['bruker briller', 'er venstrehendt'] },
  { navn: 'Student Strand', emoji: '🎒', trekk: ['har rødt hår', 'bruker briller'] },
  { navn: 'Sykepleier Solheim', emoji: '💉', trekk: ['er venstrehendt', 'går alltid med hatt'] },
  { navn: 'Bonde Bakke', emoji: '🚜', trekk: ['har skjegg', 'røyker pipe'] },
  { navn: 'Frisør Frydenlund', emoji: '💈', trekk: ['har rødt hår', 'er venstrehendt'] },
  { navn: 'Lærer Lund', emoji: '📐', trekk: ['bruker briller', 'går alltid med hatt'] },
  { navn: 'Journalist Juul', emoji: '📰', trekk: ['røyker pipe', 'har rødt hår'] },
  { navn: 'Fisker Furuset', emoji: '🐟', trekk: ['har skjegg', 'er venstrehendt'] },
  { navn: 'Pianist Paulsen', emoji: '🎹', trekk: ['går alltid med hatt', 'bruker briller'] },
  { navn: 'Brannmann Brekke', emoji: '🧯', trekk: ['røyker pipe', 'har skjegg'] },
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
  { navn: 'ljåen', ub: 'en ljå', emoji: '🌾' },
  { navn: 'harpunen', ub: 'en harpun', emoji: '🔱' },
  { navn: 'skøyten', ub: 'ei skøyte', emoji: '⛸️' },
  { navn: 'kaffekjelen', ub: 'en kaffekjele', emoji: '☕' },
  { navn: 'hammeren', ub: 'en hammer', emoji: '🔨' },
  { navn: 'lutefisken', ub: 'en frossen lutefisk', emoji: '🧊' },
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
  { navn: 'naustet', prep: 'i', emoji: '🛥️' },
  { navn: 'fjøset', prep: 'i', emoji: '🐄' },
  { navn: 'tårnrommet', prep: 'i', emoji: '🏰' },
  { navn: 'garasjen', prep: 'i', emoji: '🚗' },
  { navn: 'utedoen', prep: 'på', emoji: '🚽' },
  { navn: 'kapellet', prep: 'i', emoji: '⛪' },
  { navn: 'peisestua', prep: 'i', emoji: '🔥' },
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
  'skiløper Signe Skar',
  'kunstmaler Konrad Kleven',
  'bankier Bjarne Bratt',
  'skuespiller Synnøve Sæther',
  'oljemilliardær Odd Onarheim',
  'oldemor Oline Ottesen',
];

export const AASTEDER_NAVN = [
  'Villa Vestland',
  'Gods Granheim',
  'Hotell Havblikk',
  'Fjellstua Falkeredet',
  'Herregården Måneskinn',
  'Pensjonat Perleporten',
  'Sanatoriet Solgløtt',
  'Slottet Skoddebakken',
  'Kroa Kvernhuset',
  'Rederiet Ravnkloa',
];

// ---------- Nivåer ----------
// vekter styrer hvor ofte hver ledetrådtype prioriteres i trekningen.
// indirekte slår på enten/eller- og trekk-ledetråder.

export const NIVAAER = {
  lett: {
    navn: 'Lett', n: 3, indirekte: false,
    vekter: {
      'mistenkt-sted': 3, 'mistenkt-ikke-sted': 1,
      'vaapen-sted': 3, 'vaapen-ikke-sted': 1,
      'mistenkt-med-vaapen': 2, 'mistenkt-uten-vaapen': 1,
      uskyldig: 3, 'ikke-mordvaapen': 3, 'ikke-aasted': 2, aasted: 2,
    },
  },
  middels: {
    navn: 'Middels', n: 3, indirekte: false,
    vekter: {
      'mistenkt-sted': 1, 'mistenkt-ikke-sted': 3,
      'vaapen-sted': 1, 'vaapen-ikke-sted': 3,
      'mistenkt-med-vaapen': 2, 'mistenkt-uten-vaapen': 2,
      uskyldig: 2, 'ikke-mordvaapen': 2, 'ikke-aasted': 2, aasted: 0.5,
    },
  },
  vanskelig: {
    navn: 'Vanskelig', n: 4, indirekte: true,
    vekter: {
      'mistenkt-sted': 0.5, 'mistenkt-ikke-sted': 3,
      'vaapen-sted': 0.5, 'vaapen-ikke-sted': 3,
      'mistenkt-med-vaapen': 2, 'mistenkt-uten-vaapen': 3,
      uskyldig: 1, 'ikke-mordvaapen': 1, 'ikke-aasted': 2, aasted: 0.2,
      'enten-eller-sted': 3, 'enten-eller-vaapen': 3, trekk: 3, 'morder-trekk': 2,
    },
  },
};

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

function ett(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

// Dagens sak: alle får samme seed fra lokal dato (YYYYMMDD).
export function dagensSeed(dato = new Date()) {
  const y = dato.getFullYear();
  const m = String(dato.getMonth() + 1).padStart(2, '0');
  const d = String(dato.getDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

// ---------- Løsningsrom ----------
// En kandidat er { sLoc: [...], wLoc: [...], m: åstedsindeks }.
// sLoc[i] = stedet mistenkt i var på, wLoc[j] = stedet våpen j lå.
// Morderen er den mistenkte som befinner seg på åstedet m,
// og mordvåpenet er våpenet som ligger der.

export function permutasjoner(n) {
  if (n === 1) return [[0]];
  const ut = [];
  for (const p of permutasjoner(n - 1)) {
    for (let i = 0; i <= p.length; i++) {
      ut.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
    }
  }
  return ut.sort((a, b) => a.join() < b.join() ? -1 : 1);
}

export function alleKandidater(n) {
  const perms = permutasjoner(n);
  const ut = [];
  for (const sLoc of perms)
    for (const wLoc of perms)
      for (let m = 0; m < n; m++) ut.push({ sLoc, wLoc, m });
  return ut;
}

export function morderAv(k) {
  return k.sLoc.indexOf(k.m);
}
export function vaapenAv(k) {
  return k.wLoc.indexOf(k.m);
}

// ---------- Ledetrådtyper ----------
// Hver type har en predikatfunksjon (gjelder kandidat?) og flere tekstmaler;
// én mal trekkes per ledetråd så sakene ikke leses likt.

function lagLedetraadPool(losning, aktorer, niva, rnd) {
  const { mistenkte, vaapen, steder } = aktorer;
  const n = mistenkte.length;
  const pool = [];
  const push = (type, test, tekster) =>
    pool.push({ type, vekt: niva.vekter[type], test, tekst: ett(tekster, rnd) });
  const hos = (st) => `${st.prep} ${st.navn} ${st.emoji}`;
  const Stor = storFørsteBokstav;

  for (let i = 0; i < n; i++) {
    for (let l = 0; l < n; l++) {
      const s = mistenkte[i];
      const st = steder[l];
      if (losning.sLoc[i] === l) {
        push('mistenkt-sted', (k) => k.sLoc[i] === l, [
          `${s.emoji} ${s.navn} ble sett ${hos(st)}.`,
          `${s.emoji} Et vitne så ${s.navn} ${hos(st)}.`,
          `${s.emoji} ${s.navn} innrømmer å ha vært ${hos(st)} hele kvelden.`,
        ]);
      } else {
        push('mistenkt-ikke-sted', (k) => k.sLoc[i] !== l, [
          `${s.emoji} ${s.navn} var ikke ${hos(st)}.`,
          `${s.emoji} ${s.navn} har aldri satt sin fot ${hos(st)}.`,
          `${s.emoji} Ingen så ${s.navn} ${hos(st)} den kvelden.`,
        ]);
      }
    }
  }

  for (let j = 0; j < n; j++) {
    for (let l = 0; l < n; l++) {
      const w = vaapen[j];
      const st = steder[l];
      if (losning.wLoc[j] === l) {
        push('vaapen-sted', (k) => k.wLoc[j] === l, [
          `${w.emoji} Noen la igjen ${w.ub} ${hos(st)}.`,
          `${w.emoji} ${Stor(w.navn)} ble funnet ${hos(st)}.`,
          `${w.emoji} Det lå ${w.ub} ${hos(st)}.`,
        ]);
      } else {
        push('vaapen-ikke-sted', (k) => k.wLoc[j] !== l, [
          `${w.emoji} ${Stor(w.navn)} var ikke ${hos(st)}.`,
          `${w.emoji} Det lå ingen ${w.ub.replace(/^(en|et|ei) /, '')} ${hos(st)}.`,
          `${w.emoji} Ransakingen ${hos(st)} avdekket ikke ${w.navn}.`,
        ]);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const s = mistenkte[i];
      const w = vaapen[j];
      if (losning.sLoc[i] === losning.wLoc[j]) {
        push('mistenkt-med-vaapen', (k) => k.sLoc[i] === k.wLoc[j], [
          `${s.emoji} ${s.navn} befant seg på samme sted som ${w.navn} ${w.emoji}.`,
          `${s.emoji} ${s.navn} hadde ${w.navn} ${w.emoji} innen rekkevidde.`,
        ]);
      } else {
        push('mistenkt-uten-vaapen', (k) => k.sLoc[i] !== k.wLoc[j], [
          `${s.emoji} ${s.navn} var ikke i nærheten av ${w.navn} ${w.emoji}.`,
          `${s.emoji} ${s.navn} var ikke på samme sted som ${w.navn} ${w.emoji}.`,
          `${s.emoji} ${s.navn} nekter for å ha sett ${w.navn} ${w.emoji} – og det stemmer.`,
        ]);
      }
    }
  }

  const morder = morderAv(losning);
  const mordvaapen = vaapenAv(losning);

  for (let i = 0; i < n; i++) {
    if (i !== morder) {
      const s = mistenkte[i];
      push('uskyldig', (k) => morderAv(k) !== i, [
        `🕊️ ${s.navn} har vanntett alibi og er uskyldig.`,
        `🕊️ ${s.navn} er renvasket av etterforskerne.`,
        `🕊️ ${s.navn} kan umulig være morderen.`,
      ]);
    }
  }
  for (let j = 0; j < n; j++) {
    if (j !== mordvaapen) {
      const w = vaapen[j];
      push('ikke-mordvaapen', (k) => vaapenAv(k) !== j, [
        `🔬 Teknikerne har utelukket ${w.navn} ${w.emoji} som mordvåpen.`,
        `🔬 Skadene stemmer ikke med ${w.navn} ${w.emoji}.`,
        `🔬 Rettsmedisineren avviser ${w.navn} ${w.emoji} som drapsvåpen.`,
      ]);
    }
  }
  for (let l = 0; l < n; l++) {
    const st = steder[l];
    if (l !== losning.m) {
      push('ikke-aasted', (k) => k.m !== l, [
        `🚪 Ingen spor etter basketak ${hos(st)}.`,
        `🚪 Alt sto urørt ${hos(st)}.`,
        `🚪 Politihunden fant ingenting ${hos(st)}.`,
      ]);
    } else {
      push('aasted', (k) => k.m === l, [
        `🩸 Det ble funnet blodspor ${hos(st)}.`,
        `🩸 Åstedsgranskerne sperret av ${st.navn} ${st.emoji}.`,
      ]);
    }
  }

  if (niva.indirekte) {
    // Enten A eller B var på stedet (nøyaktig én av dem var det).
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        for (let l = 0; l < n; l++) {
          if (losning.sLoc[a] !== l && losning.sLoc[b] !== l) continue;
          const sa = mistenkte[a];
          const sb = mistenkte[b];
          const st = steder[l];
          push('enten-eller-sted', (k) => k.sLoc[a] === l || k.sLoc[b] === l, [
            `🔀 Enten ${sa.navn} ${sa.emoji} eller ${sb.navn} ${sb.emoji} var ${hos(st)}.`,
            `🔀 Én av ${sa.navn} ${sa.emoji} og ${sb.navn} ${sb.emoji} befant seg ${hos(st)}.`,
          ]);
        }
      }
    }
    // Våpenet lå på ett av to steder.
    for (let j = 0; j < n; j++) {
      for (let l1 = 0; l1 < n; l1++) {
        for (let l2 = l1 + 1; l2 < n; l2++) {
          if (losning.wLoc[j] !== l1 && losning.wLoc[j] !== l2) continue;
          const w = vaapen[j];
          push('enten-eller-vaapen', (k) => k.wLoc[j] === l1 || k.wLoc[j] === l2, [
            `🔀 ${Stor(w.navn)} ${w.emoji} lå enten ${hos(steder[l1])} eller ${hos(steder[l2])}.`,
            `🔀 ${Stor(w.navn)} ${w.emoji} ble sist sett ${hos(steder[l1])} eller ${hos(steder[l2])}.`,
          ]);
        }
      }
    }
    // Trekk: bare når ≥2 av de valgte mistenkte deler trekket, ellers er det en forkledd
    // direkte ledetråd.
    const deles = (t) => mistenkte.filter((s) => s.trekk.includes(t)).length >= 2;
    for (let l = 0; l < n; l++) {
      const s = mistenkte[losning.sLoc.indexOf(l)];
      const st = steder[l];
      for (const t of s.trekk) {
        if (!deles(t)) continue;
        push('trekk', (k) => mistenkte[k.sLoc.indexOf(l)].trekk.includes(t), [
          `👁️ Den som befant seg ${hos(st)} ${t}.`,
          `👁️ Personen ${hos(st)} ${t}, ifølge et vitne.`,
        ]);
      }
    }
    for (const t of mistenkte[morder].trekk) {
      if (!deles(t)) continue;
      push('morder-trekk', (k) => mistenkte[morderAv(k)].trekk.includes(t), [
        `🕵️ Morderen ${t}.`,
        `🕵️ Etterforskerne er sikre på én ting: morderen ${t}.`,
      ]);
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

export function antallLosninger(ledetraader, n = 3) {
  let kandidater = alleKandidater(n);
  for (const c of ledetraader) kandidater = kandidater.filter(c.test);
  return kandidater.length;
}

// Full generering, inkludert predikatene (brukes av tester).
export function lagSakIntern(seed, nivaNavn = 'middels') {
  const niva = NIVAAER[nivaNavn] ?? NIVAAER.middels;
  const n = niva.n;
  const rnd = mulberry32(seed);
  const perms = permutasjoner(n);

  const mistenkte = velg(MISTENKTE, rnd, n);
  const vaapen = velg(VAAPEN, rnd, n);
  const steder = velg(STEDER, rnd, n);
  const offer = ett(OFRE, rnd);
  const aasted = ett(AASTEDER_NAVN, rnd);

  const losning = {
    sLoc: ett(perms, rnd),
    wLoc: ett(perms, rnd),
    m: Math.floor(rnd() * n),
  };

  const pool = lagLedetraadPool(losning, { mistenkte, vaapen, steder }, niva, rnd);

  // Grådig utvalg: legg til ledetråder som krymper løsningsrommet til én kandidat.
  let kandidater = alleKandidater(n);
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
    if (antallLosninger(uten, n) === 1) valgte.splice(i, 1);
  }

  return {
    seed,
    niva: NIVAAER[nivaNavn] ? nivaNavn : 'middels',
    n,
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
export function lagSak(seed, niva = 'middels') {
  const sak = lagSakIntern(seed, niva);
  const { valgte, ...rest } = sak;
  return { ...rest, ledetraader: valgte.map((c) => c.tekst) };
}
