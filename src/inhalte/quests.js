// Übersicht aller Quests mit Lernbereich – für die Statistik im Spiel und das Lehrer-Dashboard.
// Neue Quests hier eintragen (id = Schlüssel in zustand.erledigt und in der Statistik).

export const FERTIGKEITEN = {
  hoeren: { name: "Hören", reich: "Aurelia" },
  lesen: { name: "Lesen", reich: "Scriptoria" },
  schreiben: { name: "Schreiben", reich: "Lythara" },
  sprechen: { name: "Sprechen", reich: "Vocantia" },
};

export const QUESTS = [
  { id: "dorf_heldenpass", titel: "Stell dich vor", ort: "Dorf", fertigkeit: "sprechen", thema: "Sich vorstellen" },
  { id: "dorf_wilma", titel: "Wilmas Fragen", ort: "Dorf", fertigkeit: "sprechen", thema: "Fragen stellen" },
  { id: "dorf_borin", titel: "Wo ist Finn?", ort: "Dorf", fertigkeit: "lesen", thema: "Personen beschreiben" },
  { id: "dorf_brett", titel: "Der Aushang", ort: "Dorf", fertigkeit: "lesen", thema: "Einfache Texte verstehen" },
  { id: "lythara_tor1", titel: "Tor des Themas", ort: "Lythara", fertigkeit: "schreiben", thema: "Einleitung: Thema nennen" },
  { id: "lythara_tor2", titel: "Tor der Quellen", ort: "Lythara", fertigkeit: "schreiben", thema: "Einleitung: Quelle nennen" },
  { id: "lythara_tor3", titel: "Tor des Interesses", ort: "Lythara", fertigkeit: "schreiben", thema: "Einleitung: Interesse wecken" },
  { id: "lythara_tor4", titel: "Tor der Leser", ort: "Lythara", fertigkeit: "schreiben", thema: "Einleitung: Leser ansprechen" },
  { id: "lythara_tor5", titel: "Tor der Überschrift", ort: "Lythara", fertigkeit: "schreiben", thema: "Einleitung: Überschrift" },
  { id: "lythara_einleitung", titel: "Eigene Einleitung", ort: "Lythara", fertigkeit: "schreiben", thema: "Freier Text: Einleitung" },
  { id: "lythara_q1_boss", titel: "Torwächter", ort: "Lythara", fertigkeit: "schreiben", thema: "Bosskampf: Einleitung", kampf: true },
];

export const TEXT_NAMEN = {
  dorf_vorstellung: "Meine Vorstellung",
  lythara_einleitung: "Meine Einleitung (Schriftrolle des Beobachters)",
};
