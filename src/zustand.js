// Spielstand: wird automatisch im Browser (localStorage) gespeichert.
// Sichern und Laden als Datei (.sav), damit man das Gerät wechseln kann.

import { GEGENSTAENDE } from "./inhalte/gegenstaende.js";
import { STUFEN_GESCHENK } from "./inhalte/hilfsmittel.js";
import { STUFEN, stufeVon, spielstandLesen, dateiErzeugen } from "./spielstand.js";

export { STUFEN, stufeVon, spielstandLesen };

const SPEICHER_SCHLUESSEL = "eldoria-spielstand-v1";
const VERSION = 1;

function neueId() {
  try { return crypto.randomUUID(); } catch { return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
}

function neueStatistik() {
  return {
    quests: {},     // Quest-ID -> { durchgaenge, abgebrochen, erster, letzter } (je mit Ergebnis pro Aufgabe)
    kaempfe: [],    // { gegner, quest, datum, sieg, richtig, falsch, fragen: [{ frage, ok }] }
    spielzeit: 0,   // Sekunden
    tage: {},       // "2026-11-07" -> Sekunden
  };
}

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
    spielerId: neueId(), // zufällige Kennung, damit das Dashboard Dateien derselben Person erkennt
    statistik: neueStatistik(),
    pruefung: {},        // Probeprüfung in der Feste Schattenzahn: teil -> { punkte, max, bestanden, versuche, datum }
    herzen: null,        // Lebensenergie in der Welt (null = voll)
    vorrat: {},          // Hilfsmittel: id aus HILFSMITTEL -> Anzahl
    besiegt: 0,          // besiegte kleine Gegner (für die Statistik)
  };
}

function laden() {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!roh) return neu();
    return ergaenzen(JSON.parse(roh));
  } catch {
    return neu();
  }
}

/** Ältere Spielstände um neue Felder ergänzen. */
function ergaenzen(daten) {
  const z = { ...neu(), ...daten };
  z.statistik = { ...neueStatistik(), ...(daten.statistik ?? {}) };
  z.vorrat = { ...(daten.vorrat ?? {}) };
  if (!daten.spielerId) z.spielerId = neueId();
  return z;
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


/** Gibt XP und meldet, ob eine neue Stufe erreicht wurde. */
export function xpGeben(menge, grund) {
  const vorher = stufeVon(zustand.xp).stufe;
  const herzenVorher = herzenMax();
  zustand.xp += menge;
  zustand.protokoll.push({ xp: menge, grund, datum: new Date().toISOString() });
  const nachher = stufeVon(zustand.xp);
  const aufgestiegen = nachher.stufe > vorher;
  let geschenk = null, mehrHerzen = 0;
  if (aufgestiegen) {
    // Neue Stufe: Herzen wieder voll, ein Hilfsmittel als Geschenk, ab und zu ein Herz mehr
    mehrHerzen = herzenMax() - herzenVorher;
    zustand.herzen = null;
    geschenk = STUFEN_GESCHENK[(nachher.stufe - 2) % STUFEN_GESCHENK.length];
    zustand.vorrat ??= {};
    zustand.vorrat[geschenk] = (zustand.vorrat[geschenk] ?? 0) + 1;
  }
  speichern();
  return { aufgestiegen, stufe: nachher, geschenk, mehrHerzen };
}

export function hat(gegenstandId) {
  return zustand.gegenstaende.includes(gegenstandId);
}

/** Prüft, ob irgendein Gegenstand im Inventar diesen Effekt hat. */
// ---------- Herzen und Hilfsmittel (Action) ----------

/** Herzen: 3 zu Beginn, +1 auf Stufe 3, 6, 9, 12 und 15, +1 durch das Bronze-Abzeichen. */
export function herzenMax() {
  const stufe = stufeVon(zustand.xp).stufe;
  return 3 + [3, 6, 9, 12, 15].filter((s) => stufe >= s).length + (hatEffekt("extra_herz") ? 1 : 0);
}
export function herzenJetzt() {
  const max = herzenMax();
  return zustand.herzen == null ? max : Math.max(0, Math.min(max, zustand.herzen));
}
export function herzenSetzen(n) {
  const max = herzenMax();
  zustand.herzen = Math.max(0, Math.min(max, n));
  if (zustand.herzen === max) zustand.herzen = null;
  speichern();
}
/** Wie viele Hilfsmittel einer Art man hat. */
export function vorrat(id) { return zustand.vorrat?.[id] ?? 0; }
export function vorratAendern(id, n) {
  zustand.vorrat ??= {};
  zustand.vorrat[id] = Math.max(0, (zustand.vorrat[id] ?? 0) + n);
  speichern();
}

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

/** Erzeugt den Inhalt einer Spielstand-Datei (JSON mit Prüfsumme) und einen Dateinamen. */
export function spielstandDatei(endung = "sav") {
  return dateiErzeugen(zustand, endung);
}

/** Übernimmt gelesene Spielstand-Daten. */
export function spielstandUebernehmen(daten) {
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, ergaenzen(daten));
  speichern();
}

export function zuruecksetzen() {
  Object.keys(zustand).forEach((k) => delete zustand[k]);
  Object.assign(zustand, neu());
  speichern();
}

// ---------- Statistik für die Lehrkraft ----------

const kurz = (t) => String(t ?? "").replace(/\s+/g, " ").trim().slice(0, 160);

/**
 * Speichert das Ergebnis eines Quest-Durchgangs.
 * aufgaben: [{ frage, typ, fehler, ersterVersuch, loesungGezeigt, sekunden }]
 */
export function questErgebnis(questId, aufgaben, { abgebrochen = false } = {}) {
  if (!questId) return;
  const q = zustand.statistik.quests[questId] ??= { durchgaenge: 0, abgebrochen: 0, erster: null, letzter: null };
  if (abgebrochen) { q.abgebrochen++; speichern(); return; }
  const lauf = {
    datum: new Date().toISOString(),
    aufgaben: aufgaben.map((a) => ({ ...a, frage: kurz(a.frage) })),
  };
  q.durchgaenge++;
  if (!q.erster) q.erster = lauf;
  q.letzter = lauf;
  speichern();
}

export function kampfErgebnis(eintrag) {
  zustand.statistik.kaempfe.push({ ...eintrag, datum: new Date().toISOString(), fragen: eintrag.fragen.map((f) => ({ ...f, frage: kurz(f.frage) })) });
  speichern();
}

/** Zählt die Spielzeit mit (wird regelmäßig aufgerufen, solange gespielt wird). */
export function spielzeitZaehlen(sekunden) {
  const st = zustand.statistik;
  st.spielzeit += sekunden;
  const tag = new Date().toLocaleDateString("sv-SE");
  st.tage[tag] = (st.tage[tag] ?? 0) + sekunden;
}
