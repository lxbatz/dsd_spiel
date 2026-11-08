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
  rolle_chronist: {
    name: "Rolle des Chronisten",
    icon: "📜",
    text: "Die zweite Schriftrolle. Du kannst einen Text mit eigenen Worten wiedergeben: Verfasser, Situation, Meinung, Appell.",
  },
  rolle_erzaehler: {
    name: "Rolle des Erzählers",
    icon: "📜",
    text: "Die dritte Schriftrolle. Du kannst von Erfahrungen berichten: mit Überleitung, Details und Verknüpfungen.",
  },
  rolle_fuersprecher: {
    name: "Rolle des Fürsprechers",
    icon: "📜",
    text: "Die vierte Schriftrolle. Du kannst deine Meinung deutlich sagen und mit Argumenten und Beispielen begründen.",
  },
  rolle_vollendung: {
    name: "Rolle der Vollendung",
    icon: "📜",
    text: "Die fünfte Schriftrolle. Du kannst einen Text gut beenden: Zusammenfassung, Leser ansprechen, Gruß und Name.",
  },
  buch_der_stimmen: {
    name: "Das Buch der Stimmen",
    icon: "📖",
    text: "Das Buch ist wieder ganz. Darin steht dein eigener Forumsbeitrag – du findest ihn im Heldenpass unter „Meine Texte“.",
  },
  silber_abzeichen: {
    name: "Silber-Abzeichen",
    icon: "🥈",
    text: "Du hast das Reich Lythara gerettet und kannst einen ganzen Forumsbeitrag schreiben – so wie in der DSD-Prüfung.",
  },
};
