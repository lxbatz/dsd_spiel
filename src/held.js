// Aussehen der eigenen Heldenfigur. Jede Klasse hat ein Grundaussehen (AUSSEHEN in grafik16/figuren.js).
// Im Heldenpass kann man es ändern: Heldin oder Held, Haut, Haare, Frisur, Bart, Augen, Kleidung.
// Gespeichert werden nur die geänderten Werte in zustand.held.aussehen, z. B. { form: "m", frisur: "kurz" }.
// 3D-Figur, 16-Bit-Figur und Porträt entstehen daraus (heldAussehen, heldPortraitAngaben, heldBild).

import { AUSSEHEN } from "./grafik16/figuren.js";
import { PORTRAITS, portraitBild } from "./grafik16/portraits.js";
import { mische } from "./grafik16/pinsel.js";
import { KLASSEN } from "./inhalte/klassen.js";
import { bild } from "./ui/bilder.js";

export const HAUTFARBEN = ["#f6d4b4", "#f0c49a", "#e2b48c", "#c98b5e", "#a87050", "#7a4e34"];
export const HAARFARBEN = [
  ["#1e1a1e", "schwarz"], ["#3a2214", "dunkelbraun"], ["#6b4a2e", "braun"], ["#9a4a1e", "rotbraun"],
  ["#c4472a", "rot"], ["#e6be5a", "blond"], ["#f0e4b0", "hellblond"], ["#e6e2d8", "weiß"],
  ["#3a5aa8", "blau"], ["#7a4aa8", "lila"],
];
export const AUGENFARBEN = [
  ["#5a3a1a", "braun"], ["#2e1e12", "dunkelbraun"], ["#3a7a5a", "grün"], ["#3a6a9a", "blau"], ["#6a7a8a", "grau"], ["#6a3a9a", "violett"],
];
export const KLEIDFARBEN = [
  ["#b83838", "rot"], ["#3654b8", "blau"], ["#4f9a4a", "grün"], ["#e0a030", "gelb"], ["#7a3a9a", "lila"],
  ["#2a8a8a", "türkis"], ["#d06a8a", "rosa"], ["#7a5230", "braun"], ["#3a3a48", "schwarz"], ["#e8e2d4", "weiß"],
];
export const FRISUREN = [
  ["kurz", "kurze Haare"], ["lockig", "Locken"], ["lang", "lange Haare"], ["zopf", "Zopf"], ["dutt", "Dutt"],
  ["glatze", "Glatze"], ["kapuze", "Kapuze"], ["spitzhut", "Zauberhut"],
];
export const BAERTE = [["", "kein Bart"], ["kurz", "kurzer Bart"], ["lang", "langer Bart"]];

// Frisur, die zur Form passt, wenn man sie nicht selbst gewählt hat (nur die Kriegerin hat einen Zopf)
const FORM_FRISUR = { kriegerin: { w: "zopf", m: "kurz" } };

export function klassenTextur(klasse) {
  return KLASSEN[klasse]?.textur ?? "held_neu";
}

/** Name der Klasse passend zur gewählten Form: „Krieger“, „Kriegerin“ oder „Kriegerin / Krieger“. */
export function klassenName(held) {
  const k = KLASSEN[held?.klasse];
  if (!k) return "";
  const form = held?.aussehen?.form;
  return (form && k[form]) || k.name;
}

/** Vollständiges Aussehen für Klasse und Wahl (w = held.aussehen). */
export function aussehenFuer(klasse, w) {
  const basis = AUSSEHEN[klassenTextur(klasse)];
  if (!w || !Object.keys(w).length) return basis;
  const d = { ...basis };
  if (w.haut) d.haut = w.haut;
  if (w.haare) d.haare = w.haare;
  const frisur = w.frisur ?? (w.form && FORM_FRISUR[klasse]?.[w.form]);
  if (frisur) d.frisur = frisur;
  if (w.bart !== undefined) d.bart = w.bart || undefined;
  if (d.bart) d.bartfarbe = d.haare;
  if (w.kleid) d.kleid = w.kleid;
  if (d.frisur === "kapuze") d.kapuze = w.kleid || !basis.kapuze ? mische(d.kleid, "#000000", 0.22) : basis.kapuze;
  if (d.frisur === "spitzhut") {
    d.hut = w.kleid || !basis.hut ? d.kleid : basis.hut;
    d.hutband = basis.hutband ?? "#e0b040";
  }
  return d;
}

/** Porträt-Angaben (Augen, Ausdruck, Hintergrund) für Klasse und Wahl. */
export function portraitFuer(klasse, w) {
  const basis = PORTRAITS[klassenTextur(klasse)] ?? {};
  return w?.augen ? { ...basis, augen: w.augen } : basis;
}

export function heldAussehen(held) {
  return held ? aussehenFuer(held.klasse, held.aussehen) : AUSSEHEN.held_neu;
}

export function heldPortraitAngaben(held) {
  return held ? portraitFuer(held.klasse, held.aussehen) : PORTRAITS.held_neu;
}

function kurzHash(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Eindeutiger Schlüssel für Texturen/Figuren: die Klassentextur, mit eigenem Aussehen ergänzt um einen Hash. */
export function heldSchluessel(held) {
  if (!held) return "held_neu";
  const textur = klassenTextur(held.klasse);
  const w = held.aussehen;
  return w && Object.keys(w).length ? `${textur}~${kurzHash(JSON.stringify(w))}` : textur;
}

const bildCache = new Map();
/** Porträt als Data-URL für Klasse und Wahl (für Vorschau, Kopfleiste, Heldenpass). */
export function portraitUrl(klasse, w) {
  if (!w || !Object.keys(w).length) {
    const fertig = bild(klassenTextur(klasse));
    if (fertig) return fertig;
  }
  const key = `${klasse}|${JSON.stringify(w ?? {})}`;
  if (!bildCache.has(key)) {
    bildCache.set(key, portraitBild(null, { aussehen: aussehenFuer(klasse, w), portrait: portraitFuer(klasse, w) }).alsCanvas(1).toDataURL());
  }
  return bildCache.get(key);
}

/** Porträt der eigenen Heldin / des eigenen Helden. */
export function heldBild(held) {
  return held ? portraitUrl(held.klasse, held.aussehen) : bild("held_neu");
}
