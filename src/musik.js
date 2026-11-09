// Hintergrundmusik und Jingles.
// Die Dateien liegen im Ordner Sound/. Welche Musik wo läuft:
//   - Intro-Text (Prolog):           MUSIK.intro
//   - Karten: Feld "musik" in der Kartendefinition (src/welt/*.js)
//   - Bosskampf:                     MUSIK.kampf, Sieg: JINGLES.sieg (src/ui/kampf.js)
//   - Quest abgeschlossen:           JINGLES.fanfare  (fanfare_01, über belohnung({ fanfare: true }))
//   - Neue Stufe (Levelaufstieg):    JINGLES.stufe    (fanfare_02, in belohnung() und beim Lehrercode)
//   - Bossgegner besiegt:            JINGLES.sieg     (fanfare_03, src/ui/kampf.js)
//   Läuft schon ein Jingle (z. B. die Siegesfanfare), wartet die Stufen-Fanfare, bis er zu Ende ist.

export const MUSIK = {
  intro: "Sound/opening_03.mp3",
  dorf: "Sound/town_03.mp3",
  halle: "Sound/castle_01.mp3",
  inseln: "Sound/plains_01.mp3",
  kampf: "Sound/battle_02.mp3",
};

export const JINGLES = {
  fanfare: "Sound/fanfare_01.mp3",
  stufe: "Sound/fanfare_02.mp3",
  sieg: "Sound/fanfare_03.mp3",
};

const LAUTSTAERKE = 0.45;
const EINSTELLUNG = "eldoria-ton-aus";

let stumm = false;
try { stumm = localStorage.getItem(EINSTELLUNG) === "1"; } catch { /* egal */ }

let aktuell = null;   // { id, audio }
let jingle = null;
let naechster = null; // Jingle, der nach dem laufenden gespielt wird
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
  audio.volume = LAUTSTAERKE;
  aktuell = { id, audio };
  if (!stumm && !jingle) abspielen(audio);
}

/**
 * Spielt einen kurzen Jingle; die Hintergrundmusik pausiert so lange.
 * danach: true – läuft gerade ein Jingle, wird dieser erst zu Ende gespielt.
 */
export function spieleJingle(id, { danach = false } = {}) {
  if (stumm || !JINGLES[id]) return;
  if (danach && jingle) { naechster = id; return; }
  jingle?.pause();
  naechster = null;
  const audio = new Audio(JINGLES[id]);
  audio.volume = Math.min(1, LAUTSTAERKE + 0.2);
  jingle = audio;
  aktuell?.audio.pause();
  const weiter = () => {
    if (jingle !== audio) return;
    jingle = null;
    if (naechster) { const n = naechster; naechster = null; spieleJingle(n); return; }
    if (aktuell && !stumm) abspielen(aktuell.audio);
  };
  audio.addEventListener("ended", weiter);
  audio.addEventListener("error", weiter);
  abspielen(audio);
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
    naechster = null;
  } else if (aktuell) {
    abspielen(aktuell.audio);
  }
  beobachter.forEach((fn) => fn(stumm));
}

export function beimStummschalten(fn) {
  beobachter.add(fn);
}
