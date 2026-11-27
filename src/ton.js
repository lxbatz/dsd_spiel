// Kurze Soundeffekte, direkt im Browser erzeugt (Web Audio API, ohne Dateien).
// ton("klick") spielt einen Effekt. Ist der Ton im Menü ausgeschaltet, bleibt alles still.
//
//   klick      Knöpfe in Fenstern und Menüs
//   richtig    Aufgabe richtig gelöst          falsch   Aufgabe falsch
//   schwert    Angriff Krieger                  zauber   Angriff Magier
//   pfeil      Angriff Waldläufer               leier    Angriff Barde
//   treffer    ein Gegner wird getroffen        besiegt  ein Gegner ist besiegt
//   schaden    man wird selbst getroffen        herz     Herz oder Gegenstand aufgesammelt
//   portal     magisches Klingeln beim Reisen   katze    Miau (Mimi streicheln)
//   gameover   alle Herzen verloren

import { istStumm } from "./musik.js";

const LAUT = 0.75;
let kontext = null, ausgang = null;

function audio() {
  if (istStumm()) return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!kontext) {
    kontext = new Ctx();
    const kompressor = kontext.createDynamicsCompressor();
    ausgang = kontext.createGain();
    ausgang.gain.value = LAUT;
    ausgang.connect(kompressor).connect(kontext.destination);
  }
  if (kontext.state === "suspended") kontext.resume().catch(() => { /* erst nach einer Eingabe erlaubt */ });
  return kontext;
}

// ---------- Bausteine ----------

/** Ein Ton mit Hüllkurve. frequenz kann [start, ende] sein (Gleiten). */
function ton1(c, { typ = "sine", frequenz = 440, start = 0, dauer = 0.15, laut = 0.5, angriff = 0.005, ziel = ausgang, filter = null }) {
  const t = c.currentTime + start;
  const o = c.createOscillator();
  o.type = typ;
  const [f0, f1] = Array.isArray(frequenz) ? frequenz : [frequenz, frequenz];
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dauer);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(laut, t + angriff);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  let kette = o.connect(g);
  if (filter) { const f = c.createBiquadFilter(); Object.assign(f, { type: filter.typ }); f.frequency.value = filter.frequenz; f.Q.value = filter.q ?? 1; kette = kette.connect(f); }
  kette.connect(ziel);
  o.start(t);
  o.stop(t + dauer + 0.05);
  return o;
}

let rauschPuffer = null;
/** Gefiltertes Rauschen (Wusch, Schlag). frequenz kann [start, ende] sein. */
function rauschen(c, { start = 0, dauer = 0.2, laut = 0.5, typ = "bandpass", frequenz = 1200, q = 1, angriff = 0.01 }) {
  if (!rauschPuffer) {
    rauschPuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = rauschPuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + start;
  const q1 = c.createBufferSource();
  q1.buffer = rauschPuffer;
  const f = c.createBiquadFilter();
  f.type = typ;
  f.Q.value = q;
  const [f0, f1] = Array.isArray(frequenz) ? frequenz : [frequenz, frequenz];
  f.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dauer);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(laut, t + angriff);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  q1.connect(f).connect(g).connect(ausgang);
  q1.start(t, Math.random() * 0.5);
  q1.stop(t + dauer + 0.05);
}

/** Gezupfte Saite (Karplus-Strong, vorab berechnet). */
const saiten = new Map();
function saite(c, frequenz, start = 0, laut = 0.5) {
  const schluessel = Math.round(frequenz);
  let puffer = saiten.get(schluessel);
  if (!puffer) {
    const n = Math.round(c.sampleRate * 1.2);
    puffer = c.createBuffer(1, n, c.sampleRate);
    const d = puffer.getChannelData(0);
    const periode = Math.max(2, Math.round(c.sampleRate / frequenz));
    for (let i = 0; i < periode; i++) d[i] = Math.random() * 2 - 1;
    for (let i = periode; i < n; i++) d[i] = 0.497 * (d[i - periode] + d[i - periode + 1]);
    saiten.set(schluessel, puffer);
  }
  const t = c.currentTime + start;
  const q = c.createBufferSource();
  q.buffer = puffer;
  const g = c.createGain();
  g.gain.value = laut;
  q.connect(g).connect(ausgang);
  q.start(t);
}

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

// ---------- Die Effekte ----------

const EFFEKTE = {
  klick(c) {
    ton1(c, { typ: "triangle", frequenz: [1400, 900], dauer: 0.05, laut: 0.14 });
  },
  richtig(c) {
    [76, 83].forEach((n, i) => ton1(c, { typ: "triangle", frequenz: NOTE(n), start: i * 0.09, dauer: 0.35, laut: 0.35 }));
  },
  falsch(c) {
    ton1(c, { typ: "square", frequenz: [220, 150], dauer: 0.28, laut: 0.3, filter: { typ: "lowpass", frequenz: 900 } });
  },
  schwert(c) {
    rauschen(c, { dauer: 0.25, laut: 1.4, frequenz: [500, 3200], q: 1.2, angriff: 0.03 });
    ton1(c, { typ: "sawtooth", frequenz: [2600, 1800], start: 0.04, dauer: 0.18, laut: 0.05, filter: { typ: "bandpass", frequenz: 2600, q: 8 } });
  },
  zauber(c) {
    [79, 84, 88, 91].forEach((n, i) => ton1(c, { typ: "sine", frequenz: NOTE(n), start: i * 0.045, dauer: 0.4, laut: 0.22 }));
    rauschen(c, { dauer: 0.45, laut: 0.12, typ: "highpass", frequenz: 6000 });
  },
  pfeil(c) {
    ton1(c, { typ: "triangle", frequenz: [180, 90], dauer: 0.12, laut: 0.4 });            // Sehne
    rauschen(c, { start: 0.03, dauer: 0.3, laut: 0.35, frequenz: [3000, 900], q: 4 });  // Flug
  },
  leier(c) {
    [62, 66, 69, 74].forEach((n, i) => saite(c, NOTE(n), i * 0.06, 0.45));
  },
  treffer(c) {
    ton1(c, { typ: "sine", frequenz: [180, 60], dauer: 0.16, laut: 0.8 });
    rauschen(c, { dauer: 0.08, laut: 0.4, typ: "lowpass", frequenz: 2500 });
  },
  besiegt(c) {
    ton1(c, { typ: "square", frequenz: [600, 120], dauer: 0.3, laut: 0.12, filter: { typ: "lowpass", frequenz: 1800 } });
    [72, 76, 79].forEach((n, i) => ton1(c, { typ: "triangle", frequenz: NOTE(n), start: 0.18 + i * 0.07, dauer: 0.2, laut: 0.22 }));
  },
  schaden(c) {
    ton1(c, { typ: "sawtooth", frequenz: [320, 90], dauer: 0.3, laut: 0.25, filter: { typ: "lowpass", frequenz: 1200 } });
    ton1(c, { typ: "sine", frequenz: [120, 50], dauer: 0.25, laut: 0.7 });
  },
  herz(c) {
    [84, 88, 91, 96].forEach((n, i) => ton1(c, { typ: "square", frequenz: NOTE(n), start: i * 0.05, dauer: 0.12, laut: 0.2, filter: { typ: "lowpass", frequenz: 4000 } }));
  },
  portal(c) {
    // Glockenspiel mit Obertönen, darunter ein schimmernder Klangteppich
    [72, 79, 84, 88, 91, 96].forEach((n, i) => {
      ton1(c, { typ: "sine", frequenz: NOTE(n), start: i * 0.08, dauer: 1.4, laut: 0.18 });
      ton1(c, { typ: "sine", frequenz: NOTE(n) * 2.76, start: i * 0.08, dauer: 0.6, laut: 0.04 });
    });
    ton1(c, { typ: "sine", frequenz: [NOTE(48), NOTE(60)], dauer: 1.6, laut: 0.15, angriff: 0.4 });
    rauschen(c, { dauer: 1.5, laut: 0.06, typ: "highpass", frequenz: [3000, 9000], angriff: 0.5 });
  },
  katze(c) {
    // Miau: ein nasaler Ton, der erst steigt und dann fällt, mit zwei Formant-Filtern
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(560, t);
    o.frequency.linearRampToValueAtTime(820, t + 0.18);
    o.frequency.linearRampToValueAtTime(520, t + 0.6);
    const vib = c.createOscillator(); const vg = c.createGain();
    vib.frequency.value = 7; vg.gain.value = 12; vib.connect(vg).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.06);
    g.gain.setValueAtTime(0.6, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    const f1 = c.createBiquadFilter(); f1.type = "bandpass"; f1.Q.value = 6;
    f1.frequency.setValueAtTime(700, t); f1.frequency.linearRampToValueAtTime(1500, t + 0.2); f1.frequency.linearRampToValueAtTime(900, t + 0.6);
    const f2 = c.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 8; f2.frequency.value = 2800;
    const mix = c.createGain(); mix.gain.value = 1.6;
    o.connect(g);
    g.connect(f1).connect(mix);
    g.connect(f2).connect(mix);
    mix.connect(ausgang);
    o.start(t); vib.start(t);
    o.stop(t + 0.7); vib.stop(t + 0.7);
  },
  gameover(c) {
    [67, 66, 65, 64].forEach((n, i) => ton1(c, { typ: "triangle", frequenz: NOTE(n), start: i * 0.28, dauer: i === 3 ? 1.0 : 0.3, laut: 0.3 }));
  },
};

const zuletzt = new Map();
/** Spielt einen Effekt. Derselbe Effekt höchstens alle 40 ms (sonst klingt es übersteuert). */
export function ton(name) {
  const fx = EFFEKTE[name];
  if (!fx) return;
  const jetzt = performance.now();
  if (jetzt - (zuletzt.get(name) ?? 0) < 40) return;
  zuletzt.set(name, jetzt);
  const c = audio();
  if (!c) return;
  try { fx(c); } catch { /* Ton ist nicht wichtig */ }
}

export const TOENE = Object.keys(EFFEKTE);

/** Für Tests und die Vorschau: rendert einen Effekt ohne Lautsprecher. Liefert Float32Array (Mono). */
export async function tonRendern(name, rate = 44100) {
  const off = new OfflineAudioContext(1, rate * 2, rate);
  const alt = ausgang;
  ausgang = off.createGain();
  ausgang.gain.value = LAUT;
  ausgang.connect(off.destination);
  const altPuffer = rauschPuffer; rauschPuffer = null; const altSaiten = new Map(saiten); saiten.clear();
  try { EFFEKTE[name](off); } finally { ausgang = alt; rauschPuffer = altPuffer; saiten.clear(); altSaiten.forEach((v, k) => saiten.set(k, v)); }
  return (await off.startRendering()).getChannelData(0);
}

// Klick bei allen Knöpfen in Fenstern, Menüs und der Kopfleiste
document.addEventListener("click", (e) => {
  const k = e.target.closest?.("button, .knopf, .option");
  if (k && !k.disabled && !k.dataset.stumm) ton("klick");
}, true);
