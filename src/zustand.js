// Spielstand: wird automatisch im Browser (localStorage) gespeichert.
// Export/Import als Text-Code, damit man das Gerät wechseln kann.

import { GEGENSTAENDE } from "./inhalte/gegenstaende.js";

const SPEICHER_SCHLUESSEL = "eldoria-spielstand-v1";
const VERSION = 1;

// Stufen: benötigte Gesamt-XP und Titel.
export const STUFEN = [
  { xp: 0, titel: "Ankömmling" },
  { xp: 100, titel: "Wanderer" },
  { xp: 250, titel: "Lehrling der Worte" },
  { xp: 450, titel: "Pfadfinder" },
  { xp: 700, titel: "Sprachwächter" },
  { xp: 1000, titel: "Hüter der Schrift" },
  { xp: 1400, titel: "Veteran von Eldoria" },
  { xp: 1900, titel: "Meister der Worte" },
  { xp: 2500, titel: "Held von Eldoria" },
];

function neu() {
  return {
    version: VERSION,
    held: null,          // Heldenpass (Name, Klasse, ...)
    xp: 0,
    gegenstaende: [],    // IDs aus GEGENSTAENDE
    erledigt: {},        // Quest-/Aufgaben-IDs -> true
    texte: {},           // selbst geschriebene Texte: id -> { text, datum }
    codes: [],           // eingelöste Lehrercodes (Hash)
    ort: { karte: "dorf", spawn: "start" },
    protokoll: [],       // XP-Verlauf: { xp, grund, datum }
  };
}

function laden() {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!roh) return neu();
    return { ...neu(), ...JSON.parse(roh) };
  } catch {
    return neu();
  }
}

export const zustand = laden();
const beobachter = new Set();

export function beobachten(fn) {
  beobachter.add(fn);
  return () => beobachter.delete(fn);
}

export function speichern() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(zustand));
  } catch {
    // Speichern nicht möglich (z. B. privater Modus) – Spiel läuft trotzdem weiter.
  }
  beobachter.forEach((fn) => fn(zustand));
}

export function stufeVon(xp) {
  let index = 0;
  STUFEN.forEach((s, i) => { if (xp >= s.xp) index = i; });
  const aktuell = STUFEN[index];
  const naechste = STUFEN[index + 1] ?? null;
  return { stufe: index + 1, titel: aktuell.titel, ab: aktuell.xp, bis: naechste ? naechste.xp : null };
}

/** Gibt XP und meldet, ob eine neue Stufe erreicht wurde. */
export function xpGeben(menge, grund) {
  const vorher = stufeVon(zustand.xp).stufe;
  zustand.xp += menge;
  zustand.protokoll.push({ xp: menge, grund, datum: new Date().toISOString() });
  speichern();
  const nachher = stufeVon(zustand.xp);
  return { aufgestiegen: nachher.stufe > vorher, stufe: nachher };
}

export function hat(gegenstandId) {
  return zustand.gegenstaende.includes(gegenstandId);
}

/** Prüft, ob irgendein Gegenstand im Inventar diesen Effekt hat. */
export function hatEffekt(effekt) {
  return zustand.gegenstaende.some((id) => GEGENSTAENDE[id]?.effekt === effekt);
}

export function geben(gegenstandId) {
  if (!hat(gegenstandId)) {
    zustand.gegenstaende.push(gegenstandId);
    speichern();
    return true;
  }
  return false;
}

export function istErledigt(id) {
  return Boolean(zustand.erledigt[id]);
}

export function erledigen(id) {
  zustand.erledigt[id] = true;
  speichern();
}

export function textSpeichern(id, text) {
  zustand.texte[id] = { text, datum: new Date().toISOString() };
  speichern();
}

export function ortSetzen(karte, spawn) {
  zustand.ort = { karte, spawn };
  speichern();
}

export function heldSetzen(held) {
  zustand.held = held;
  speichern();
}

export function exportieren() {
  const json = JSON.stringify(zustand);
  return "ELDORIA1:" + btoa(unescape(encodeURIComponent(json)));
}

export function importieren(code) {
  const sauber = code.trim();
  if (!sauber.startsWith("ELDORIA1:")) throw new Error("Das ist kein gültiger Spielstand-Code.");
  const json = decodeURIComponent(escape(atob(sauber.slice(9))));
  const daten = JSON.parse(json);
  if (typeof daten !== "object" || daten === null || typeof daten.xp !== "number") {
    throw new Error("Der Spielstand-Code ist beschädigt.");
  }
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, neu(), daten);
  speichern();
}

export function zuruecksetzen() {
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, neu());
  speichern();
}
