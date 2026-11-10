// Hörtexte für Aufgaben: { sprecher, text, datei?, stimme?: { tonhoehe, tempo } }
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

/** Spielt den Hörtext. fertig() wird am Ende aufgerufen. Liefert false, wenn nichts abgespielt werden kann. */
function abspielen(h, fertig) {
  hoerenStoppen();
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
  const u = new SpeechSynthesisUtterance(h.text);
  u.lang = "de-DE";
  const stimme = deutscheStimme();
  if (stimme) u.voice = stimme;
  u.rate = h.stimme?.tempo ?? 0.88;
  u.pitch = h.stimme?.tonhoehe ?? 1;
  u.onend = fertig;
  u.onerror = fertig;
  synth.speak(u);
  laufend = { stopp: () => { synth.cancel(); fertig(); } };
  return true;
}

// Mehrere Aufgaben zum selben Hörtext: Anzahl gehört wird pro Text gemerkt
const gehoert = new WeakMap();

export function hoertextElement(h) {
  if (!h) return null;
  const zaehler = el("span", { class: "hoer-zaehler" });
  const transkript = el("div", { class: "lesetext hoer-text", hidden: true }, h.text);
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
