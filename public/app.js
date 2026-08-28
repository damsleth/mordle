// Mordle – UI og spilltilstand
import { lagSak } from '/game.js';

const $ = (sel) => document.querySelector(sel);

const LAGRING_SPILL = 'mordle-spill';
const LAGRING_STATS = 'mordle-stats';
const LAGRING_HJELP = 'mordle-hjelp-vist';

const TILSTAAELSER = [
  '«Det var jo bare et uhell … åtte ganger på rad!»',
  '«Ingen skulle få vite om testamentet. INGEN!»',
  '«Jeg angrer ingenting – bortsett fra å bli tatt.»',
  '«Hen hadde det komme til hen!»',
  '«Alt var perfekt planlagt. Bortsett fra deg, detektiv.»',
  '«Brunosten var min. MIN, hører du!»',
];

let sak = null;
let marks = {};        // "r,c" -> 'x' | 'ok' (kun det brukeren selv har satt)
let strek = new Set(); // ledetråd-indekser som er streket over
let bom = 0;           // feilanklager i denne saken
let loest = false;
let valgtAnklage = { hvem: null, hva: null, hvor: null };

// ---------- Oppstart ----------

function nyttSeed() {
  return (crypto.getRandomValues(new Uint32Array(1))[0] % 900000000) + 1;
}

function seedFraHash() {
  const m = location.hash.match(/sak=(\d+)/);
  return m ? Number(m[1]) : null;
}

function start() {
  const hashSeed = seedFraHash();
  const lagret = lesJson(LAGRING_SPILL);

  let seed;
  if (hashSeed) {
    seed = hashSeed;
  } else if (lagret && !lagret.loest) {
    seed = lagret.seed;
  } else {
    seed = nyttSeed();
  }

  lastSak(seed, lagret && lagret.seed === seed ? lagret : null);

  if (!localStorage.getItem(LAGRING_HJELP)) {
    $('#dialogHjelp').showModal();
    localStorage.setItem(LAGRING_HJELP, '1');
  }
}

function lastSak(seed, lagret) {
  sak = lagSak(seed);
  marks = lagret?.marks ?? {};
  strek = new Set(lagret?.strek ?? []);
  bom = lagret?.bom ?? 0;
  loest = lagret?.loest ?? false;
  valgtAnklage = { hvem: null, hva: null, hvor: null };
  history.replaceState(null, '', `#sak=${seed}`);
  renderAlt();
}

function nySak() {
  lastSak(nyttSeed(), null);
  lagreSpill();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Lagring ----------

function lesJson(nokkel) {
  try { return JSON.parse(localStorage.getItem(nokkel)); } catch { return null; }
}

function lagreSpill() {
  try {
    localStorage.setItem(LAGRING_SPILL, JSON.stringify({
      seed: sak.seed, marks, strek: [...strek], bom, loest,
    }));
  } catch { /* privat modus e.l. – spillet funker fint uten lagring */ }
}

function hentStats() {
  return lesJson(LAGRING_STATS) ?? { loeste: 0, perfekte: 0, bom: 0 };
}

function lagreStats(s) {
  try { localStorage.setItem(LAGRING_STATS, JSON.stringify(s)); } catch { /* ok */ }
}

// ---------- Rendering ----------

function renderAlt() {
  renderIntro();
  renderAktorer();
  renderGrid();
  renderLedetraader();
  renderAnklage();
}

function renderIntro() {
  $('#intro').innerHTML =
    `💀 <strong>${storBokstav(sak.offer)}</strong> er funnet død på <strong>${sak.aasted}</strong>. ` +
    `Tre personer var til stede den kvelden – én av dem er morderen. ` +
    `Finn ut <strong>hvem</strong> som gjorde det, <strong>hva</strong> som ble brukt, og <strong>hvor</strong> det skjedde.`;
}

function renderAktorer() {
  const lag = (liste) => liste.map((a) =>
    `<li><span class="emoji">${a.emoji}</span> ${storBokstav(a.navn)}</li>`).join('');
  $('#listeMistenkte').innerHTML = lag(sak.mistenkte);
  $('#listeVaapen').innerHTML = lag(sak.vaapen);
  $('#listeSteder').innerHTML = lag(sak.steder);
}

// Rutenett: rader = mistenkte (0-2) + steder (3-5), kolonner = våpen (0-2) + steder (3-5).
// Blokken steder×steder (nede til høyre) brukes ikke.
function renderGrid() {
  const t = $('#grid');
  let html = '<tr><th></th>';
  for (let c = 0; c < 6; c++) {
    const a = c < 3 ? sak.vaapen[c] : sak.steder[c - 3];
    html += `<th class="${c === 2 ? 'blokk-hoyre' : ''}" title="${a.navn}">${a.emoji}</th>`;
  }
  html += '</tr>';

  for (let r = 0; r < 6; r++) {
    const radAktor = r < 3 ? sak.mistenkte[r] : sak.steder[r - 3];
    html += `<tr><th class="rad-hode ${r === 2 ? 'blokk-bunn' : ''}" title="${radAktor.navn}">${radAktor.emoji}</th>`;
    for (let c = 0; c < 6; c++) {
      const klasser = [];
      if (c === 2) klasser.push('blokk-hoyre');
      if (r === 2) klasser.push('blokk-bunn');
      if (r >= 3 && c >= 3) {
        html += `<td class="tom ${klasser.join(' ')}"></td>`;
        continue;
      }
      const vist = visningsTilstand(r, c);
      if (vist === 'ok') klasser.push('celle', 'ok');
      else if (vist === 'x') klasser.push('celle', 'x');
      else if (vist === 'auto-x') klasser.push('celle', 'x', 'auto');
      else klasser.push('celle');
      const symbol = vist === 'ok' ? '✓' : vist ? '✗' : '';
      html += `<td class="${klasser.join(' ')}" data-r="${r}" data-c="${c}" ` +
        `role="button" aria-label="${cellebeskrivelse(r, c)}">${symbol}</td>`;
    }
    html += '</tr>';
  }
  t.innerHTML = html;
}

function cellebeskrivelse(r, c) {
  const rad = r < 3 ? sak.mistenkte[r].navn : sak.steder[r - 3].navn;
  const kol = c < 3 ? sak.vaapen[c].navn : sak.steder[c - 3].navn;
  return `${storBokstav(rad)} / ${kol}`;
}

// Hva vises i cellen: brukerens merke, ellers automatisk ✗ hvis en ✓
// i samme blokk deler rad eller kolonne.
function visningsTilstand(r, c) {
  const egen = marks[`${r},${c}`];
  if (egen) return egen;
  const br = r < 3 ? 0 : 1;
  const bc = c < 3 ? 0 : 1;
  for (const [key, val] of Object.entries(marks)) {
    if (val !== 'ok') continue;
    const [mr, mc] = key.split(',').map(Number);
    if ((mr < 3 ? 0 : 1) !== br || (mc < 3 ? 0 : 1) !== bc) continue;
    if ((mr === r) !== (mc === c)) return 'auto-x'; // samme rad ELLER samme kolonne
  }
  return null;
}

function trykkCelle(r, c) {
  const key = `${r},${c}`;
  const vist = visningsTilstand(r, c);
  if (!vist) marks[key] = 'x';
  else if (vist === 'x' || vist === 'auto-x') marks[key] = 'ok';
  else delete marks[key];
  lagreSpill();
  renderGrid();
}

function renderLedetraader() {
  $('#ledetraader').innerHTML = sak.ledetraader.map((tekst, i) =>
    `<li data-i="${i}" class="${strek.has(i) ? 'strek' : ''}">${tekst}</li>`).join('');
}

function renderAnklage() {
  const lagChips = (el, liste, felt) => {
    el.innerHTML = liste.map((a, i) =>
      `<button class="chip ${valgtAnklage[felt] === i ? 'valgt' : ''}" data-felt="${felt}" data-i="${i}">` +
      `${a.emoji} ${storBokstav(a.navn)}</button>`).join('');
  };
  lagChips($('#chipsHvem'), sak.mistenkte, 'hvem');
  lagChips($('#chipsHva'), sak.vaapen, 'hva');
  lagChips($('#chipsHvor'), sak.steder, 'hvor');
  $('#knappAnklag').disabled =
    valgtAnklage.hvem === null || valgtAnklage.hva === null || valgtAnklage.hvor === null || loest;
}

// ---------- Anklage ----------

function anklag() {
  const { losning } = sak;
  const riktig =
    valgtAnklage.hvem === losning.morder &&
    valgtAnklage.hva === losning.mordvaapen &&
    valgtAnklage.hvor === losning.m;

  const stats = hentStats();
  const el = $('#resultatInnhold');

  if (riktig) {
    loest = true;
    stats.loeste++;
    if (bom === 0) stats.perfekte++;
    lagreStats(stats);
    lagreSpill();

    const m = sak.mistenkte[losning.morder];
    const v = sak.vaapen[losning.mordvaapen];
    const s = sak.steder[losning.m];
    const sitat = TILSTAAELSER[sak.seed % TILSTAAELSER.length];
    el.innerHTML = `
      <div class="resultat-emoji">⚖️🎉</div>
      <h2>Sak oppklart!</h2>
      <p class="resultat-tekst">${m.emoji} <strong>${m.navn}</strong> tok livet av ${sak.offer}
      med ${v.navn} ${v.emoji} ${s.prep} ${s.navn} ${s.emoji}.</p>
      <p class="resultat-tekst">Under pågripelsen ropte ${m.navn}: ${sitat}</p>
      ${bom > 0 ? `<p class="hint">Oppklart med ${bom} feilanklage${bom === 1 ? '' : 'r'}.</p>` : '<p class="hint">Perfekt etterforskning – ingen feilanklager! 🌟</p>'}
      <button class="primaer" id="knappNesteSak">🔎 Ny sak</button>
      <button class="sekundaer" data-lukk>Lukk</button>`;
    $('#knappNesteSak').onclick = () => { $('#dialogResultat').close(); nySak(); };
  } else {
    bom++;
    stats.bom++;
    lagreStats(stats);
    lagreSpill();
    el.innerHTML = `
      <div class="resultat-emoji">🚔❌</div>
      <h2>Feil spor!</h2>
      <p class="resultat-tekst">Den anklagede har vanntett alibi og slippes fri.
      Politimesteren ser strengt på deg. Tilbake til tavla, detektiv!</p>
      <button class="primaer" data-lukk>Fortsett etterforskningen</button>`;
  }

  koblLukkeknapper($('#dialogResultat'));
  $('#dialogResultat').showModal();
  renderAnklage();
}

// ---------- Diverse ----------

function storBokstav(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function visStats() {
  const s = hentStats();
  $('#statsInnhold').innerHTML = `
    <div><div class="stats-tall">${s.loeste}</div><div class="stats-navn">Oppklarte saker</div></div>
    <div><div class="stats-tall">${s.perfekte}</div><div class="stats-navn">Uten feil</div></div>
    <div><div class="stats-tall">${s.bom}</div><div class="stats-navn">Feilanklager</div></div>`;
  $('#dialogStats').showModal();
}

async function delSak() {
  const url = `${location.origin}/#sak=${sak.seed}`;
  const data = { title: 'Mordle', text: `Klarer du å oppklare sak #${sak.seed}? 🔎`, url };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch { /* avbrutt */ }
  }
  try {
    await navigator.clipboard.writeText(url);
    const knapp = $('#knappDel');
    knapp.textContent = '✅ Lenke kopiert!';
    setTimeout(() => { knapp.textContent = '🔗 Del denne saken'; }, 2000);
  } catch { prompt('Kopier lenken:', url); }
}

function koblLukkeknapper(dialog) {
  dialog.querySelectorAll('[data-lukk]').forEach((b) => {
    b.onclick = () => dialog.close();
  });
}

// ---------- Hendelser ----------

$('#grid').addEventListener('click', (e) => {
  const td = e.target.closest('td.celle');
  if (td && !td.classList.contains('tom')) trykkCelle(Number(td.dataset.r), Number(td.dataset.c));
});

$('#ledetraader').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const i = Number(li.dataset.i);
  strek.has(i) ? strek.delete(i) : strek.add(i);
  lagreSpill();
  renderLedetraader();
});

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const { felt, i } = chip.dataset;
  valgtAnklage[felt] = valgtAnklage[felt] === Number(i) ? null : Number(i);
  renderAnklage();
});

$('#knappAnklag').addEventListener('click', anklag);
$('#knappNy').addEventListener('click', nySak);
$('#knappHjelp').addEventListener('click', () => $('#dialogHjelp').showModal());
$('#knappStats').addEventListener('click', visStats);
$('#knappDel').addEventListener('click', delSak);

koblLukkeknapper($('#dialogHjelp'));
koblLukkeknapper($('#dialogStats'));

window.addEventListener('hashchange', () => {
  const s = seedFraHash();
  if (s && sak && s !== sak.seed) lastSak(s, null);
});

// Service worker for offline/PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* ikke kritisk */ });
  });
}

start();
