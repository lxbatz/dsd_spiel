import dorf from "./dorf.js";
import halle from "./halle.js";
import turm from "./turm.js";
import nichts from "./nichts.js";
import aurelia from "./aurelia.js";
import scriptoria from "./scriptoria.js";
import vocantia from "./vocantia.js";
import treppenturm from "./treppenturm.js";
import schattenzahn from "./schattenzahn.js";
import { STELLEN, TEXTE_OBJEKTE } from "../inhalte/stellen.js";
import { betrachten } from "./stellen.js";

export const KARTEN = { dorf, halle, turm, nichts, aurelia, scriptoria, vocantia, treppenturm, schattenzahn };

// Stellen zum Ansehen (inhalte/stellen.js): Texte für Objekte ohne eigene Aufgabe und unsichtbare Stellen auf der Deko
for (const [id, karte] of Object.entries(KARTEN)) {
  const texte = TEXTE_OBJEKTE[id] ?? {};
  karte.objekte = [
    ...karte.objekte.map((o) => {
      const t = texte[o.id];
      return t && !o.aktion ? { ...o, name: o.name ?? t.name, hinweis: t.hinweis, aktion: betrachten(t.name, t.texte, `${id}_${o.id}`) } : o;
    }),
    ...(STELLEN[id] ?? []),
  ];
}
