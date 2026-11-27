// Hilfsmittel: verbrauchbare Gegenstände, die man im Kampf gegen kleine Gegner, in Nebenquests
// und beim Stufenaufstieg bekommt. Man hat sie im Vorrat (zustand.vorrat: id -> Anzahl).
//
//   wo:  "welt"    – im Inventar oder mit Taste H benutzen
//        "aufgabe" – während einer Aufgabe über „Hilfsmittel einsetzen“ (höchstens eines pro Aufgabe)
//        "kampf"   – im Bosskampf
// In der Probeprüfung (Feste Schattenzahn) sind keine Hilfsmittel erlaubt – wie in der echten Prüfung.

export const HILFSMITTEL = {
  heiltrank: {
    name: "Heiltrank",
    icon: "🧪",
    text: "Füllt zwei Herzen auf. Im Bosskampf: ein Herz zurück.",
    wo: ["welt", "kampf"],
  },
  feder: {
    name: "Feder der Klarheit",
    icon: "🪶",
    text: "In einer Aufgabe: streicht eine falsche Antwort oder löst eine Lücke, eine Aussage oder ein Paar für dich.",
    wo: ["aufgabe", "kampf"],
  },
  lupe: {
    name: "Lupe der Buchstaben",
    icon: "🔍",
    text: "Im Lückentext: zeigt den ersten Buchstaben jeder Lücke. Beim Satzbauen: legt den ersten Baustein fest.",
    wo: ["aufgabe", "kampf"],
  },
};

/** Was ein besiegter Gegner fallen lässt (Wahrscheinlichkeiten). Herzen gibt es nur, wenn welche fehlen. */
export const BEUTE = { herz: 0.45, heiltrank: 0.06, feder: 0.1, lupe: 0.08 };

/** Geschenk beim Stufenaufstieg (abwechselnd). */
export const STUFEN_GESCHENK = ["heiltrank", "feder", "lupe"];
