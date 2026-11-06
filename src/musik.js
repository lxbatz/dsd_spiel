// Hintergrundmusik und Jingles.
// Die Dateien liegen im Ordner Sound/. Welche Musik wo läuft:
//   - Intro-Text (Prolog):           MUSIK.intro
//   - Karten: Feld "musik" in der Kartendefinition (src/welt/*.js)
//   - Quest abgeschlossen:           JINGLES.fanfare (über belohnung({ fanfare: true }))

export const MUSIK = {
  intro: "Sound/opening_03.mp3",
  dorf: "Sound/town_03.mp3",
};

export const JINGLES = {
  fanfare: "Sound/fanfare_01.mp3",
};

const LAUTSTAERKE = 0.45;
const EINSTELLUNG = "eldoria-ton-aus";

let stumm = false;
try { stumm = localStorage.getItem(EINSTELLUNG) === "1"; } catch { /* egal */ }

let aktuell = null;   // { id, audio }
let jingle = null;
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

/** Startet die Hintergrundmusik mit dieser ID (oder stoppt sie bei null). */
export function musik(id) {
  if (aktuell?.id === id) return;
  if (aktuell) ausblenden(aktuell.audio);
  aktuell = null;
  if (!id || !MUSIK[id]) return;
  const audio = new Audio(MUSIK[id]);
  audio.loop = true;
  audio.volume = LAUTSTAERKE;
  aktuell = { id, audio };
  if (!stumm && !jingle) abspielen(audio);
}

/** Spielt einen kurzen Jingle; die Hintergrundmusik pausiert so lange. */
export function spieleJingle(id) {
  if (stumm || !JINGLES[id]) return;
  jingle?.pause();
  const audio = new Audio(JINGLES[id]);
  audio.volume = Math.min(1, LAUTSTAERKE + 0.2);
  jingle = audio;
  aktuell?.audio.pause();
  const weiter = () => {
    if (jingle !== audio) return;
    jingle = null;
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
  } else if (aktuell) {
    abspielen(aktuell.audio);
  }
  beobachter.forEach((fn) => fn(stumm));
}

export function beimStummschalten(fn) {
  beobachter.add(fn);
}
