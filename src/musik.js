// Hintergrundmusik und Jingles.
// Die Dateien liegen im Ordner Sound/. Welche Musik wo läuft:
//   - Intro-Text (Prolog):           MUSIK.intro
//   - Karten: Feld "musik" in der Kartendefinition (src/welt/*.js)
//   - Bosskampf:                     MUSIK.kampf (oder gegner.musik), Sieg: JINGLES.sieg (src/ui/kampf.js)
//   - Große Glocke von Aurelia:      JINGLES.glocke (nach dem Sieg über den Drachenrichter)
//   - Quest abgeschlossen:           JINGLES.fanfare  (fanfare_01, über belohnung({ fanfare: true }))
//   - Neue Stufe (Levelaufstieg):    JINGLES.stufe    (fanfare_02, in belohnung() und beim Lehrercode)
//   - Bossgegner besiegt:            JINGLES.sieg     (fanfare_03, src/ui/kampf.js)
//   Läuft schon ein Jingle (z. B. die Siegesfanfare oder die Glocke), warten Quest- und Stufen-Fanfare, bis er zu Ende ist.

export const MUSIK = {
  intro: "Sound/opening_03.mp3",
  dorf: "Sound/town_03.mp3",
  halle: "Sound/castle_01.mp3",
  inseln: "Sound/plains_01.mp3",
  aurelia: "Sound/aurelia.mp3",
  aurelia_frei: "Sound/beach_01.mp3",
  scriptoria: "Sound/forest_02.mp3",
  vocantia: "Sound/vocantia_snow_02.mp3",
  vocantia_fruehling: "Sound/vocantia_town_02.mp3",
  schattenzahn: "Sound/dungeon_schattenzahn.mp3",
  sprachsiegel: "Sound/opening_03.mp3",
  schattenzahn_sieg: "Sound/opening_02_spielsieg.mp3",
  kampf: "Sound/battle_02.mp3",
  kampf_morgrath: "Sound/boss_morgrath.mp3",
};

export const JINGLES = {
  fanfare: "Sound/fanfare_01.mp3",
  stufe: "Sound/fanfare_02.mp3",
  sieg: "Sound/fanfare_03.mp3",
  glocke: "Sound/glocke_aurelia.mp3",
};

const LAUTSTAERKE = 0.45;
const EINSTELLUNG = "eldoria-ton-aus";

let stumm = false;
try { stumm = localStorage.getItem(EINSTELLUNG) === "1"; } catch { /* egal */ }

let aktuell = null;   // { id, audio }
let jingle = null;
let warteschlange = []; // Jingles, die nach dem laufenden gespielt werden
const beobachter = new Set();

function ausblenden(audio, dauer = 600) {
  const start = audio.volume;
  const t0 = performance.now();
  const schritt = (t) => {
    const anteil = Math.min(1, (t - t0) / dauer);
    audio.volume = start * (1 - anteil);
    if (anteil < 1) requestAnimationFrame(schritt);
    else { audio.pause(); audio.currentTime = 0; }
  };
  requestAnimationFrame(schritt);
}

function abspielen(audio) {
  audio.play().catch(() => { /* Browser erlaubt noch keinen Ton oder Datei fehlt */ });
}

/** ID der laufenden Hintergrundmusik (oder null). */
export function aktuelleMusik() {
  return aktuell?.id ?? null;
}

/**
 * Startet die Hintergrundmusik mit dieser ID (oder stoppt sie bei null).
 * sofort: true stoppt die alte Musik ohne Ausblenden.
 */
export function musik(id, { sofort = false } = {}) {
  if (aktuell?.id === id) return;
  if (aktuell && sofort) { aktuell.audio.pause(); }
  else if (aktuell) ausblenden(aktuell.audio);
  aktuell = null;
  if (!id || !MUSIK[id]) return;
  const audio = new Audio(MUSIK[id]);
  audio.loop = true;
  audio.volume = lautstaerke();
  aktuell = { id, audio };
  if (!stumm && !jingle) abspielen(audio);
}

/**
 * Spielt einen kurzen Jingle; die Hintergrundmusik pausiert so lange.
 * danach: true – läuft gerade ein Jingle, wird dieser erst zu Ende gespielt.
 * vorziehen: true – unterbricht den laufenden Jingle, aber wartende Jingles bleiben in der Schlange.
 */
export function spieleJingle(id, { danach = false, vorziehen = false } = {}) {
  if (stumm || !JINGLES[id]) return;
  if (danach && jingle) { if (!warteschlange.includes(id)) warteschlange.push(id); return; }
  jingle?.pause();
  if (!danach && !vorziehen) warteschlange = [];
  const audio = new Audio(JINGLES[id]);
  audio.volume = Math.min(1, LAUTSTAERKE + 0.2);
  jingle = audio;
  aktuell?.audio.pause();
  const weiter = () => {
    if (jingle !== audio) return;
    jingle = null;
    if (warteschlange.length) { spieleJingle(warteschlange.shift(), { danach: true }); return; }
    if (aktuell && !stumm) abspielen(aktuell.audio);
  };
  audio.addEventListener("ended", weiter);
  audio.addEventListener("error", weiter);
  abspielen(audio);
}

let stilleBeimHoeren = false, hoertextLaeuft = false, mikrofonAn = false;

/** Lautstärke der Hintergrundmusik aus allen Gründen zusammen (Hörtext, Mikrofon) */
function lautstaerke() {
  if (mikrofonAn) return 0;
  if (hoertextLaeuft) return stilleBeimHoeren ? 0 : LAUTSTAERKE * 0.15;
  return LAUTSTAERKE;
}

/** Musik leiser stellen, solange ein Hörtext läuft (in der Probeprüfung ganz still). */
export function leiser(an) {
  hoertextLaeuft = Boolean(an);
  if (aktuell) aktuell.audio.volume = lautstaerke();
}

/** Solange das Mikrofon (Stimmkristall) an ist, schweigt die Musik, damit sie nicht mitgemessen oder mit aufgenommen wird. */
export function mikrofonStille(an) {
  mikrofonAn = Boolean(an);
  if (aktuell) aktuell.audio.volume = lautstaerke();
}

/** In der Probeprüfung Hören: Während ein Hörtext läuft, schweigt die Musik ganz. */
export function stilleBeiHoertexten(an) {
  stilleBeimHoeren = Boolean(an);
}

export function istStumm() {
  return stumm;
}

export function stummSchalten(wert = !stumm) {
  stumm = wert;
  try { localStorage.setItem(EINSTELLUNG, stumm ? "1" : "0"); } catch { /* egal */ }
  if (stumm) {
    aktuell?.audio.pause();
    jingle?.pause();
    jingle = null;
    warteschlange = [];
  } else if (aktuell) {
    abspielen(aktuell.audio);
  }
  beobachter.forEach((fn) => fn(stumm));
}

export function beimStummschalten(fn) {
  beobachter.add(fn);
}

// ---------- Grollen (Erdbeben) ----------
// Tiefes Rauschen aus der Web-Audio-API (ohne Datei). Die Stärke 0–1 wird jedes Bild gesetzt.
let grollKontext = null, grollGain = null, grollStaerke = 0;

function grollenBauen() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false;
  grollKontext = new Ctx();
  const laenge = grollKontext.sampleRate * 3;
  const puffer = grollKontext.createBuffer(1, laenge, grollKontext.sampleRate);
  const d = puffer.getChannelData(0);
  let letzter = 0;
  for (let i = 0; i < laenge; i++) {
    // braunes Rauschen: tief und dumpf
    letzter = (letzter + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = letzter * 3.5;
  }
  const quelle = grollKontext.createBufferSource();
  quelle.buffer = puffer;
  quelle.loop = true;
  const filter = grollKontext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 140;
  grollGain = grollKontext.createGain();
  grollGain.gain.value = 0;
  quelle.connect(filter).connect(grollGain).connect(grollKontext.destination);
  quelle.start();
  return true;
}

/** Stärke des Grollens (0 = still). Wird jedes Bild aufgerufen; schweigt, wenn der Ton aus ist. */
export function grollen(staerke) {
  const ziel = stumm ? 0 : Math.max(0, Math.min(1, staerke));
  if (Math.abs(ziel - grollStaerke) < 0.01) return;
  grollStaerke = ziel;
  if (!grollKontext) {
    if (ziel <= 0.01 || !grollenBauen()) return;
  }
  if (grollKontext.state === "suspended") grollKontext.resume().catch(() => { /* egal */ });
  grollGain.gain.setTargetAtTime(ziel * 0.9, grollKontext.currentTime, 0.15);
}
