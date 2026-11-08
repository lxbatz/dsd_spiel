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
  { id: "lythara_tor1", titel: "Tor des Themas", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Einleitung: Thema nennen" },
  { id: "lythara_tor2", titel: "Tor der Quellen", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Einleitung: Quelle nennen" },
  { id: "lythara_tor3", titel: "Tor des Interesses", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Einleitung: Interesse wecken" },
  { id: "lythara_tor4", titel: "Tor der Leser", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Einleitung: Leser ansprechen" },
  { id: "lythara_tor5", titel: "Tor der Überschrift", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Einleitung: Überschrift" },
  { id: "lythara_einleitung", titel: "Eigene Einleitung", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Freier Text: Einleitung" },
  { id: "lythara_q1_boss", titel: "Torwächter", ort: "Lythara: Halle", fertigkeit: "schreiben", thema: "Bosskampf: Einleitung", kampf: true },
  { id: "lythara_q2_s1", titel: "Echo des Verfassers", ort: "Kammer der Echos", fertigkeit: "schreiben", thema: "Wiedergabe: Verfasser vorstellen" },
  { id: "lythara_q2_s2", titel: "Echo der Erlebnisse", ort: "Kammer der Echos", fertigkeit: "schreiben", thema: "Wiedergabe: Situation, eigene Worte" },
  { id: "lythara_q2_s3", titel: "Echo der Meinung", ort: "Kammer der Echos", fertigkeit: "schreiben", thema: "Wiedergabe: Meinung und Appell" },
  { id: "lythara_q2_text", titel: "Eigene Wiedergabe", ort: "Kammer der Echos", fertigkeit: "schreiben", thema: "Freier Text: Wiedergabe" },
  { id: "lythara_q2_boss", titel: "Der Kopist", ort: "Kammer der Echos", fertigkeit: "schreiben", thema: "Bosskampf: Wiedergabe", kampf: true },
  { id: "lythara_q3_s1", titel: "Brücke der Worte", ort: "Kammer der Erinnerungen", fertigkeit: "schreiben", thema: "Erfahrungsbericht: Überleitung" },
  { id: "lythara_q3_s2", titel: "Spiegel der Erinnerung", ort: "Kammer der Erinnerungen", fertigkeit: "schreiben", thema: "Erfahrungsbericht: Thema, W-Fragen" },
  { id: "lythara_q3_s3", titel: "Faden der Zeit", ort: "Kammer der Erinnerungen", fertigkeit: "schreiben", thema: "Erfahrungsbericht: Verknüpfungen, Perfekt" },
  { id: "lythara_q3_text", titel: "Eigener Bericht", ort: "Kammer der Erinnerungen", fertigkeit: "schreiben", thema: "Freier Text: Erfahrungsbericht" },
  { id: "lythara_q3_boss", titel: "Wächter des Vergessens", ort: "Kammer der Erinnerungen", fertigkeit: "schreiben", thema: "Bosskampf: Erfahrungsbericht", kampf: true },
  { id: "lythara_q4_s1", titel: "Stimme der Klarheit", ort: "Kammer der Waage", fertigkeit: "schreiben", thema: "Meinung: deutlich sagen" },
  { id: "lythara_q4_s2", titel: "Stimme der Gründe", ort: "Kammer der Waage", fertigkeit: "schreiben", thema: "Meinung: Argumente, echte Begründungen" },
  { id: "lythara_q4_s3", titel: "Stimme der Beispiele", ort: "Kammer der Waage", fertigkeit: "schreiben", thema: "Meinung: Beispiele, Verknüpfungen" },
  { id: "lythara_q4_text", titel: "Eigene Meinung", ort: "Kammer der Waage", fertigkeit: "schreiben", thema: "Freier Text: Stellungnahme" },
  { id: "lythara_q4_boss", titel: "Der Zauderer", ort: "Kammer der Waage", fertigkeit: "schreiben", thema: "Bosskampf: Meinung", kampf: true },
  { id: "lythara_q5_s1", titel: "Siegel der Meinung", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Schluss: Meinung zusammenfassen" },
  { id: "lythara_q5_s2", titel: "Siegel der Leser", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Schluss: Briefschluss" },
  { id: "lythara_q5_s3", titel: "Siegel der Form", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Schluss: Grußformeln" },
  { id: "lythara_q5_text", titel: "Eigener Schluss", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Freier Text: Schluss" },
  { id: "lythara_q5_boss", titel: "Das Endlose Echo", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Bosskampf: Schluss", kampf: true },
  { id: "lythara_buch", titel: "Buch der Stimmen", ort: "Kammer des Siegels", fertigkeit: "schreiben", thema: "Freier Text: ganzer Forumsbeitrag" },
];

export const TEXT_NAMEN = {
  dorf_vorstellung: "Meine Vorstellung",
  lythara_einleitung: "Meine Einleitung (Schriftrolle des Beobachters)",
  lythara_q2_text: "Meine Wiedergabe (Rolle des Chronisten)",
  lythara_q3_text: "Mein Erfahrungsbericht (Rolle des Erzählers)",
  lythara_q4_text: "Meine Meinung (Rolle des Fürsprechers)",
  lythara_q5_text: "Mein Schluss (Rolle der Vollendung)",
  lythara_buch: "Mein ganzer Forumsbeitrag (Buch der Stimmen)",
};
