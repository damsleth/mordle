// Mordle – UI og spilltilstand
import { lagSak, dagensSeed, NIVAAER } from '/game.js';

const $ = (sel) => document.querySelector(sel);

// v3: saker har nivå og N kan være 4, så gamle lagrede merker passer ikke.
const LAGRING_SPILL = 'mordle-spill-v3';
const LAGRING_STATS = 'mordle-stats';
const LAGRING_HJELP = 'mordle-hjelp-vist';
const LAGRING_NIVA = 'mordle-niva';

const TILSTAAELSER = [
  '«Det var jo bare et uhell … åtte ganger på rad!»',
  '«Ingen skulle få vite om testamentet. INGEN!»',
  '«Jeg angrer ingenting – bortsett fra å bli tatt.»',
  '«Hen hadde det komme til hen!»',
  '«Alt var perfekt planlagt. Bortsett fra deg, detektiv.»',
  '«Brunosten var min. MIN, hører du!»',
  '«Dere skulle sett hva hen gjorde med hagen min!»',
  '«Jeg ville bare låne den. Så gikk det galt.»',
  '«Det var ikke jeg! … Ok, det var jeg.»',
  '«Ingen jury i Norge vil dømme meg. Ingen!»',
  '«Hen jukset i Ludo. I LUDO!»',
  '«Alt hadde gått bra om det ikke var for den fordømte katten.»',
];

const INTROER = [
  (offer, aasted) => `💀 <strong>${offer}</strong> er funnet død på <strong>${aasted}</strong>. `,
  (offer, aasted) => `🌩️ En stormfull natt på <strong>${aasted}</strong>: <strong>${offer}</strong> ligger livløs på gulvet. `,
  (offer, aasted) => `🔔 Klokka slo tolv på <strong>${aasted}</strong> da skriket kom. <strong>${offer}</strong> var død. `,
  (offer, aasted) => `🕯️ Middagen på <strong>${aasted}</strong> tok en brå slutt: <strong>${offer}</strong> reiste seg aldri fra bordet. `,
];

let sak = null;
let marks = {};        // "r,c" -> 'x' | 'ok' (kun det brukeren selv har satt)
let strek = new Set(); // ledetråd-indekser som er streket over
let bom = 0;           // feilanklager i denne saken
let loest = false;
let dagens = null;     // 'YYYY-MM-DD' når saken er dagens sak
let valgtAnklage = { hvem: null, hva: null, hvor: null };
let valgtNiva = localStorage.getItem(LAGRING_NIVA) || 'middels';

// ---------- Oppstart ----------

function nyttSeed() {
  return (crypto.getRandomValues(new Uint32Array(1))[0] % 900000000) + 1;
}

function idag() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sakFraHash() {
  if (/sak=dagens/.test(location.hash)) return { seed: dagensSeed(), niva: 'middels', dagens: idag() };
  const m = location.hash.match(/sak=(\d+)/);
  if (!m) return null;
  const niva = location.hash.match(/niva=(\w+)/)?.[1];
  return { seed: Number(m[1]), niva: NIVAAER[niva] ? niva : 'middels', dagens: null };
}

function start() {
  const fraHash = sakFraHash();
  const lagret = lesJson(LAGRING_SPILL);

  // Hashen vinner bare når den peker på en annen sak enn den lagrede (= delt lenke).
  // Ellers styrer lagret tilstand – og en løst sak gir ny sak, ikke reprise.
  const erDelt = fraHash && !(lagret && lagret.seed === fraHash.seed && lagret.niva === fraHash.niva);
  if (erDelt) {
    lastSak(fraHash.seed, fraHash.niva, null, fraHash.dagens);
  } else if (lagret && !lagret.loest) {
    lastSak(lagret.seed, lagret.niva, lagret, lagret.dagens);
  } else {
    lastSak(nyttSeed(), valgtNiva, null);
  }

  if (!localStorage.getItem(LAGRING_HJELP)) {
    $('#dialogHjelp').showModal();
    localStorage.setItem(LAGRING_HJELP, '1');
  }
}

function lastSak(seed, niva, lagret, dagensDato = null) {
  sak = lagSak(seed, niva);
  marks = lagret?.marks ?? {};
  strek = new Set(lagret?.strek ?? []);
  bom = lagret?.bom ?? 0;
  loest = lagret?.loest ?? false;
  dagens = dagensDato;
  valgtAnklage = { hvem: null, hva: null, hvor: null };
  history.replaceState(null, '', sakUrl(sak, dagens).replace(location.origin, ''));
  lagreSpill();
  renderAlt();
}

function sakUrl(s, erDagens = false) {
  if (erDagens) return `${location.origin}/#sak=dagens`;
  return `${location.origin}/#sak=${s.seed}${s.niva === 'middels' ? '' : `&niva=${s.niva}`}`;
}

function dagensSak() {
  const lagret = lesJson(LAGRING_SPILL);
  const dato = idag();
  const fortsett = lagret?.dagens === dato ? lagret : null;
  lastSak(dagensSeed(), 'middels', fortsett, dato);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function penDato(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}.${m}.${y}`;
}

function nySak(niva = valgtNiva) {
  valgtNiva = niva;
  try { localStorage.setItem(LAGRING_NIVA, niva); } catch { /* ok */ }
  lastSak(nyttSeed(), niva, null);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Lagring ----------

function lesJson(nokkel) {
  try { return JSON.parse(localStorage.getItem(nokkel)); } catch { return null; }
}

function lagreSpill() {
  try {
    localStorage.setItem(LAGRING_SPILL, JSON.stringify({
      seed: sak.seed, niva: sak.niva, dagens, marks, strek: [...strek], bom, loest,
    }));
  } catch { /* privat modus e.l. – spillet funker fint uten lagring */ }
}

function hentStats() {
  return { loeste: 0, perfekte: 0, bom: 0, dagensStreak: 0, sisteDagens: null, ...lesJson(LAGRING_STATS) };
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
  const intro = INTROER[sak.seed % INTROER.length](storBokstav(sak.offer), sak.aasted);
  const antall = ['', '', '', 'Tre', 'Fire'][sak.n];
  $('#intro').innerHTML =
    `<span class="sak-badge">${dagens ? `🗓️ Dagens sak ${penDato(dagens)}` : `Sak #${sak.seed} · ${NIVAAER[sak.niva].navn}`}</span>` +
    intro +
    `${antall} personer var til stede den kvelden – én av dem er morderen. ` +
    `Finn ut <strong>hvem</strong> som gjorde det, <strong>hva</strong> som ble brukt, og <strong>hvor</strong> det skjedde.`;
}

function renderAktorer() {
  const lag = (liste) => liste.map((a) =>
    `<li><span class="emoji">${a.emoji}</span> ${storBokstav(a.navn)}</li>`).join('');
  $('#listeMistenkte').innerHTML = lag(sak.mistenkte);
  $('#listeVaapen').innerHTML = lag(sak.vaapen);
  $('#listeSteder').innerHTML = lag(sak.steder);
}

// Rutenett som i boken: mistenkte øverst.
// Kolonner = mistenkte (0..n-1) + steder (n..2n-1), rader = våpen (0..n-1) + steder (n..2n-1).
// Blokken steder×steder (nede til høyre) brukes ikke.
function renderGrid() {
  const n = sak.n;
  const t = $('#grid');
  t.dataset.n = n;
  let html = '<tr><th></th>';
  for (let c = 0; c < 2 * n; c++) {
    const a = c < n ? sak.mistenkte[c] : sak.steder[c - n];
    html += `<th class="${c === n - 1 ? 'blokk-hoyre' : ''}" title="${a.navn}">${a.emoji}</th>`;
  }
  html += '</tr>';

  for (let r = 0; r < 2 * n; r++) {
    const radAktor = r < n ? sak.vaapen[r] : sak.steder[r - n];
    html += `<tr><th class="rad-hode ${r === n - 1 ? 'blokk-bunn' : ''}" title="${radAktor.navn}">${radAktor.emoji}</th>`;
    for (let c = 0; c < 2 * n; c++) {
      const klasser = [];
      if (c === n - 1) klasser.push('blokk-hoyre');
      if (r === n - 1) klasser.push('blokk-bunn');
      if (r >= n && c >= n) {
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
  const n = sak.n;
  const rad = r < n ? sak.vaapen[r].navn : sak.steder[r - n].navn;
  const kol = c < n ? sak.mistenkte[c].navn : sak.steder[c - n].navn;
  return `${storBokstav(rad)} / ${kol}`;
}

// Hva vises i cellen: brukerens merke, ellers automatisk ✗ hvis en ✓
// i samme blokk deler rad eller kolonne.
function visningsTilstand(r, c) {
  const egen = marks[`${r},${c}`];
  if (egen) return egen;
  const n = sak.n;
  const br = r < n ? 0 : 1;
  const bc = c < n ? 0 : 1;
  for (const [key, val] of Object.entries(marks)) {
    if (val !== 'ok') continue;
    const [mr, mc] = key.split(',').map(Number);
    if ((mr < n ? 0 : 1) !== br || (mc < n ? 0 : 1) !== bc) continue;
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

function renderNivaValg() {
  $('#nivaChips').innerHTML = Object.entries(NIVAAER).map(([id, n]) =>
    `<button class="chip ${valgtNiva === id ? 'valgt' : ''}" data-niva="${id}">` +
    `${n.navn} <small>${n.n}×${n.n}</small></button>`).join('');
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
    if (dagens && stats.sisteDagens !== dagens) {
      const igaar = new Date(dagens);
      igaar.setDate(igaar.getDate() - 1);
      stats.dagensStreak = stats.sisteDagens === igaar.toISOString().slice(0, 10) ? stats.dagensStreak + 1 : 1;
      stats.sisteDagens = dagens;
    }
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
      ${dagens
        ? `<button class="primaer" id="knappDelResultat">📤 Del resultatet</button>`
        : `<button class="primaer" id="knappNesteSak">🔎 Ny sak (${NIVAAER[sak.niva].navn.toLowerCase()})</button>`}
      <button class="sekundaer" data-lukk>Lukk</button>`;
    if (dagens) {
      $('#knappDelResultat').onclick = () => del(
        `Mordle ${penDato(dagens)} – oppklart ${bom === 0 ? 'uten feil 🌟' : `med ${bom} feilanklage${bom === 1 ? '' : 'r'} 🔎`}`,
        sakUrl(sak, true), $('#knappDelResultat'));
    } else {
      $('#knappNesteSak').onclick = () => { $('#dialogResultat').close(); nySak(sak.niva); };
    }
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
    <div><div class="stats-tall">${s.bom}</div><div class="stats-navn">Feilanklager</div></div>
    <div><div class="stats-tall">${s.dagensStreak} 🔥</div><div class="stats-navn">Dagens-streak</div></div>`;
  $('#dialogStats').showModal();
}

async function del(tekst, url, knapp) {
  if (navigator.share) {
    try { await navigator.share({ title: 'Mordle', text: tekst, url }); return; } catch { /* avbrutt */ }
  }
  try {
    await navigator.clipboard.writeText(`${tekst}\n${url}`);
    const opprinnelig = knapp.textContent;
    knapp.textContent = '✅ Kopiert!';
    setTimeout(() => { knapp.textContent = opprinnelig; }, 2000);
  } catch { prompt('Kopier lenken:', url); }
}

function delSak() {
  const tekst = dagens
    ? `Klarer du dagens Mordle-sak? 🔎`
    : `Klarer du å oppklare sak #${sak.seed} (${NIVAAER[sak.niva].navn.toLowerCase()})? 🔎`;
  del(tekst, sakUrl(sak, dagens), $('#knappDel'));
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
  if (chip.dataset.niva) {
    valgtNiva = chip.dataset.niva;
    renderNivaValg();
    return;
  }
  const { felt, i } = chip.dataset;
  valgtAnklage[felt] = valgtAnklage[felt] === Number(i) ? null : Number(i);
  renderAnklage();
});

$('#knappAnklag').addEventListener('click', anklag);
$('#knappNy').addEventListener('click', () => { renderNivaValg(); $('#dialogNy').showModal(); });
$('#knappStartNy').addEventListener('click', () => { $('#dialogNy').close(); nySak(valgtNiva); });
$('#knappDagens').addEventListener('click', () => { $('#dialogNy').close(); dagensSak(); });
$('#knappHjelp').addEventListener('click', () => $('#dialogHjelp').showModal());
$('#knappStats').addEventListener('click', visStats);
$('#knappDel').addEventListener('click', delSak);

koblLukkeknapper($('#dialogHjelp'));
koblLukkeknapper($('#dialogStats'));
koblLukkeknapper($('#dialogNy'));

window.addEventListener('hashchange', () => {
  const s = sakFraHash();
  if (s && sak && (s.seed !== sak.seed || s.niva !== sak.niva)) lastSak(s.seed, s.niva, null);
});

// Service worker for offline/PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* ikke kritisk */ });
  });
}

start();
