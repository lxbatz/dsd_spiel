// Spielstand: wird automatisch im Browser (localStorage) gespeichert.
// Sichern und Laden als Datei (.sav), damit man das Gerät wechseln kann.

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

// ---------- Spielstand als Datei ----------

function pruefsumme(text) {
  // cyrb53 – kleine, schnelle Prüfsumme gegen versehentliche oder neugierige Änderungen
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/** Erzeugt den Inhalt einer Spielstand-Datei (JSON mit Prüfsumme) und einen Dateinamen. */
export function spielstandDatei(endung = "sav") {
  const daten = btoa(unescape(encodeURIComponent(JSON.stringify(zustand))));
  const name = (zustand.held?.name ?? "Spielstand").replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 30) || "Spielstand";
  const datum = new Date().toISOString().slice(0, 10);
  const inhalt = JSON.stringify({
    spiel: "Die Chroniken von Eldoria",
    art: "Spielstand",
    format: 2,
    held: zustand.held?.name ?? null,
    xp: zustand.xp,
    gespeichert: new Date().toISOString(),
    daten,
    pruefsumme: pruefsumme("eldoria|" + daten),
  }, null, 2);
  return { name: `Eldoria_${name}_${datum}.${endung}`, inhalt };
}

/** Liest eine Spielstand-Datei (oder einen alten Spielstand-Code). Liefert die Daten, ohne sie zu übernehmen. */
export function spielstandLesen(text) {
  const roh = String(text ?? "").trim();
  let daten;
  if (roh.startsWith("ELDORIA1:")) {
    daten = JSON.parse(decodeURIComponent(escape(atob(roh.slice(9)))));
  } else {
    let datei;
    try { datei = JSON.parse(roh); } catch { throw new Error("Das ist keine Spielstand-Datei von Eldoria."); }
    if (datei?.spiel !== "Die Chroniken von Eldoria" || typeof datei.daten !== "string") throw new Error("Das ist keine Spielstand-Datei von Eldoria.");
    if (pruefsumme("eldoria|" + datei.daten) !== datei.pruefsumme) throw new Error("Die Datei ist beschädigt oder wurde verändert.");
    daten = JSON.parse(decodeURIComponent(escape(atob(datei.daten))));
  }
  if (typeof daten !== "object" || daten === null || typeof daten.xp !== "number") throw new Error("Der Spielstand ist beschädigt.");
  return daten;
}

/** Übernimmt gelesene Spielstand-Daten. */
export function spielstandUebernehmen(daten) {
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, neu(), daten);
  speichern();
}

export function zuruecksetzen() {
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, neu());
  speichern();
}
