// Stellen zum Ansehen: kurze Texte an Dingen der Spielwelt (Brunnen, Bäume, Säulen …).
// Sie bringen die Quests nicht weiter, erzählen aber von der Welt und sind kleine Leseanlässe.
//
// betrachten(name, texte): Aktion für ein Objekt. texte ist ein Text, eine Liste oder eine Funktion
//   des Spielstands, die eins von beidem liefert. Bei jedem Besuch kommt der nächste Text der Liste.
// stelle({ id, name, x, y, breite?, hoehe?, hinweis?, texte, kopfY?, weit? }): unsichtbares Objekt
//   auf vorhandener Deko (z. B. dem Baum im Raster). Nur in der 3D-Version; es blockiert seine Kacheln,
//   darum nur auf Kacheln legen, die schon gesperrt sind.

import { dialog } from "../ui/fenster.js";
import { zustand } from "../zustand.js";

const besuche = new Map();

export function betrachten(name, texte, schluessel = name) {
  return async () => {
    const roh = typeof texte === "function" ? texte(zustand) : texte;
    const liste = Array.isArray(roh) ? roh : [roh];
    const n = besuche.get(schluessel) ?? 0;
    besuche.set(schluessel, n + 1);
    await dialog(name, liste[n % liste.length]);
  };
}

export function stelle({ id, name, x, y, breite, hoehe, hinweis, texte, kopfY, weit }) {
  return {
    id, art: "objekt", unsichtbar: true, name, x, y, breite, hoehe, kopfY, weit,
    hinweis: hinweis ?? `${name} ansehen`,
    aktion: betrachten(name, texte, id),
  };
}

/** Zwei Fassungen eines Textes: vorher (z. B. verflucht) und nachher (gerettet). */
export const jeNach = (flag, vorher, nachher) => (z) => (z.erledigt[flag] ? nachher : vorher);
