// Alle Gegenstände des Spiels.
// effekt: optionale Spielwirkung (wird im Code ausgewertet):
//   "hinweis_buchstabe" – zeigt in Lückentexten den ersten Buchstaben
//   "extra_herz"        – +1 Herz in Bosskämpfen
// lesen: optionaler Text, der im Inventar gelesen werden kann.

export const GEGENSTAENDE = {
  heldenpass: {
    name: "Heldenpass",
    icon: "🪪",
    text: "Dein Ausweis als Sprachwächterin oder Sprachwächter.",
  },
  amulett_wortschaetze: {
    name: "Amulett der Wortschätze",
    icon: "🧿",
    text: "Das erste legendäre Artefakt. Es flüstert dir in Lückentexten den ersten Buchstaben zu.",
    effekt: "hinweis_buchstabe",
  },
  bronze_abzeichen: {
    name: "Bronze-Abzeichen",
    icon: "🥉",
    text: "Du hast das Dorf der Ankömmlinge gemeistert. Es schützt dich: +1 Herz in Bosskämpfen.",
    effekt: "extra_herz",
  },
  spiegel_nachricht: {
    name: "Nachricht des Reisenden",
    icon: "🪞",
    text: "Der magische Spiegel hat dir diesen Text gezeigt. Du brauchst ihn für die Tore.",
    lesen: "nachricht_reisender",
  },
  rolle_beobachter: {
    name: "Rolle des Beobachters",
    icon: "📜",
    text: "Die erste von fünf Schriftrollen. Du kannst eine Einleitung schreiben: Thema, Quelle, Interesse, Leser, Überschrift.",
  },
};
