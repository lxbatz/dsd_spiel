// Hörtexte für Aufgaben: { sprecher, text, datei?, stimme?: { tonhoehe, tempo }, gong?: true }
//   gong: vor dem Text erklingt ein Gong (Durchsagen)
//   teile: [{ sprecher, text, stimme }] statt text – Gespräche mit mehreren Stimmen nacheinander
// Ist eine Audiodatei angegeben (z. B. "Sound/hoeren/mimi_wilma.mp3"), wird sie abgespielt –
// so können später eigene Aufnahmen eingesetzt werden. Sonst liest die Sprachausgabe
// des Browsers den Text auf Deutsch vor (Web Speech API, ohne Internet auf den meisten Geräten).
// Nach zweimal Hören kann man den Text als Hilfe einblenden (wie in der DSD-Prüfung: zweimal hören).

import { el } from "./fenster.js";
import { leiser } from "../musik.js";

let laufend = null;

function deutscheStimme() {
  const stimmen = window.speechSynthesis?.getVoices?.() ?? [];
  return stimmen.find((v) => /^de(-|_)DE/i.test(v.lang) && /google|microsoft|natural/i.test(v.name))
    ?? stimmen.find((v) => /^de/i.test(v.lang)) ?? null;
}

export function hoerenStoppen() {
  laufend?.stopp();
  laufend = null;
}

let audioKontext = null;
/** Zweitoniger Gong wie bei einer Durchsage (Web Audio, ohne Datei). */
function gong(danach) {
  try {
    audioKontext ??= new (window.AudioContext || window.webkitAudioContext)();
    const k = audioKontext, t0 = k.currentTime + 0.05;
    for (const [f, t] of [[784, 0], [523, 0.55]]) {
      for (const [mult, laut] of [[1, 0.35], [2.01, 0.08], [3.02, 0.04]]) {
        const o = k.createOscillator(), g = k.createGain();
        o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, t0 + t);
        g.gain.linearRampToValueAtTime(laut, t0 + t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 1.4);
        o.connect(g).connect(k.destination);
        o.start(t0 + t); o.stop(t0 + t + 1.5);
      }
    }
    const id = setTimeout(danach, 1500);
    return () => clearTimeout(id);
  } catch {
    danach();
    return () => {};
  }
}

/** Spielt den Hörtext. fertig() wird am Ende aufgerufen. Liefert false, wenn nichts abgespielt werden kann. */
function abspielen(h, fertig) {
  hoerenStoppen();
  if (h.gong && !h._ohneGong) {
    if (!h.datei && !window.speechSynthesis) return false;
    let gestoppt = false;
    const abbrechen = gong(() => {
      if (gestoppt) return;
      laufend = null;   // sonst würde abspielen() den Gong-Teil „stoppen“ und fertig() zu früh melden
      abspielen({ ...h, _ohneGong: true }, fertig);
    });
    laufend = { stopp: () => { gestoppt = true; abbrechen(); window.speechSynthesis?.cancel(); fertig(); } };
    return true;
  }
  if (h.datei) {
    const a = new Audio(h.datei);
    a.addEventListener("ended", fertig);
    a.addEventListener("error", fertig);
    a.play().catch(fertig);
    laufend = { stopp: () => { a.pause(); fertig(); } };
    return true;
  }
  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return false;
  synth.cancel();
  const teile = h.teile ?? [{ text: h.text, stimme: h.stimme }];
  const stimme = deutscheStimme();
  teile.forEach((teil, i) => {
    const u = new SpeechSynthesisUtterance(teil.text);
    u.lang = "de-DE";
    if (stimme) u.voice = stimme;
    u.rate = teil.stimme?.tempo ?? 0.88;
    u.pitch = teil.stimme?.tonhoehe ?? 1;
    if (i === teile.length - 1) { u.onend = fertig; u.onerror = fertig; }
    synth.speak(u);
  });
  laufend = { stopp: () => { synth.cancel(); fertig(); } };
  return true;
}

// Mehrere Aufgaben zum selben Hörtext: Anzahl gehört wird pro Text gemerkt
const gehoert = new WeakMap();

export function hoertextElement(h) {
  if (!h) return null;
  const zaehler = el("span", { class: "hoer-zaehler" });
  const transkript = el("div", { class: "lesetext hoer-text", hidden: true },
    h.teile ? h.teile.map((t) => `${t.sprecher}: ${t.text}`).join("\n") : h.text);
  const zeigen = el("button", { type: "button", class: "knopf zweitrangig", hidden: true, onclick: () => { transkript.hidden = !transkript.hidden; zeigen.textContent = transkript.hidden ? "📄 Text zeigen" : "📄 Text verstecken"; } }, "📄 Text zeigen");
  const knopf = el("button", { type: "button", class: "knopf hoer-knopf" }, "🔊 Anhören");
  let spielt = false;
  const aktualisieren = () => {
    const n = gehoert.get(h) ?? 0;
    zaehler.textContent = n ? `${n}× gehört` : "Hör gut zu!";
    zeigen.hidden = n < 2;
    knopf.textContent = spielt ? "⏹ Stopp" : n ? "🔊 Noch einmal hören" : "🔊 Anhören";
  };
  knopf.addEventListener("click", () => {
    if (spielt) { hoerenStoppen(); return; }
    spielt = true;
    leiser(true);
    const ok = abspielen(h, () => {
      if (!spielt) return;
      spielt = false;
      leiser(false);
      gehoert.set(h, (gehoert.get(h) ?? 0) + 1);
      aktualisieren();
    });
    if (!ok) {
      spielt = false;
      leiser(false);
      // Ohne Sprachausgabe: Text gleich anzeigen
      transkript.hidden = false;
      zaehler.textContent = "Dein Browser kann nicht vorlesen. Lies den Text.";
      return;
    }
    aktualisieren();
  });
  aktualisieren();
  return el("div", { class: "hoertext" },
    el("div", { class: "hoer-kopf" }, el("b", {}, `🎧 ${h.sprecher ?? "Hörtext"}`), zaehler),
    el("div", { class: "knopfleiste hoer-knoepfe" }, knopf, zeigen),
    transkript);
}
