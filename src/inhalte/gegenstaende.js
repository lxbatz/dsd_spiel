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
  trinkgeld: {
    name: "Wilmas Trinkgeld",
    icon: "🪙",
    text: "Die Kunden am Marktstand waren so zufrieden, dass sie dir Trinkgeld gegeben haben. Stimmt so!",
  },
  lesezeichen_finn: {
    name: "Finns Lesezeichen",
    icon: "🔖",
    text: "Finns Lieblingslesezeichen mit einer kleinen Katze darauf. Es soll Glück bringen.",
  },
  schmiedehammer: {
    name: "Borins kleiner Hammer",
    icon: "🔨",
    text: "Ein Geschenk von Borin für deine Hilfe beim Gartentor. „Damit schlägt man auf das Eisen.“",
  },
  katzenbild: {
    name: "Finns Bild von Mimis Kätzchen",
    icon: "🐱",
    text: "Mimi und ihre drei Kätzchen im Heukorb, gemalt von Finn. Ein Dank von Wilma fürs Suchen und gute Zuhören.",
  },
  ton_hafen: {
    name: "Der Ton des Hafens",
    icon: "🔔",
    text: "Der erste von fünf Tönen der großen Glocke von Aurelia. Du kannst Durchsagen verstehen: Zeiten, Orte, Zahlen und Änderungen.",
  },
  ton_markt: {
    name: "Der Ton des Markts",
    icon: "🎶",
    text: "Der zweite von fünf Tönen der großen Glocke von Aurelia. Du verstehst Gespräche im Alltag: Wer will was? Wo sind die Leute? Wie geht das Gespräch aus?",
  },
  ton_leuchtturm: {
    name: "Der Ton des Leuchtturms",
    icon: "🗼",
    text: "Der dritte von fünf Tönen der großen Glocke von Aurelia. Du verstehst Nachrichten am Telefon: Wer ruft an, was will die Person, was muss man tun – und du schreibst dir Zeiten und Nummern auf.",
  },
  ton_werft: {
    name: "Der Ton der Werft",
    icon: "⚓",
    text: "Der vierte von fünf Tönen der großen Glocke von Aurelia. Du verstehst Gespräche am Arbeitsplatz, Interviews und Berichte – und du hörst bis zum Ende zu.",
  },
  ton_turm: {
    name: "Der Ton des Turms",
    icon: "🔔",
    text: "Der fünfte und letzte Ton der großen Glocke. Du verstehst, was Menschen meinen – auch wenn du es nur einmal hörst.",
  },
  seite_briefe: {
    name: "Leuchtende Seite der Briefe",
    icon: "📜",
    text: "Eine Seite aus dem Großen Buch von Scriptoria. Du kannst Lücken in Briefen ergänzen und den passenden Betreff finden.",
  },
  seite_berichte: {
    name: "Leuchtende Seite der Berichte",
    icon: "📜",
    text: "Eine Seite aus dem Großen Buch von Scriptoria. Du findest in kurzen Berichten genau die Information, die du suchst.",
  },
  seite_regeln: {
    name: "Leuchtende Seite der Regeln",
    icon: "📜",
    text: "Eine Seite aus dem Großen Buch von Scriptoria. Du liest Regeln und Hinweise genau – auch die kleinen Wörter wie „nur“, „unter“ und „auch“.",
  },
  seite_hinweise: {
    name: "Leuchtende Seite der Hinweise",
    icon: "📜",
    text: "Eine Seite aus dem Großen Buch von Scriptoria. Du findest in langen Informationstexten die richtige Stelle – und lässt dich von „alle“ und „die meisten“ nicht täuschen.",
  },
  gold_abzeichen: {
    name: "Gold-Abzeichen",
    icon: "🥇",
    text: "Du hast das Reich Aurelia gerettet. Du verstehst Durchsagen, Gespräche, Nachrichten, Interviews, Berichte und Meinungen – so wie in der DSD-Prüfung.",
  },
};
