// Scriptoria – Quest 1 und 2 (Leseverstehen), aufgebaut nach dem DSD-I-PRO-Modellsatz (docs/dsd_pruefung.md):
//   Quest 1 „Die verlorenen Wörter“  → Lesen Teil 1: kurzer Brief/E-Mail mit 4 Lücken, Wortliste mit Beispiel (0)
//                                      und Wörtern, die übrig bleiben, dazu die passende Betreffzeile (A/B/C)
//   Quest 2 „Der Lesekreis“          → Lesen Teil 2: Situationen den passenden Berichtabschnitten A–H zuordnen,
//                                      Beispiel Z, vier Abschnitte bleiben übrig
// Muster: Lösungen umschrieben, Ablenker mit Lockwörtern. Alle Texte sind eigene Texte.

// ---------- Quest 1: Die verlorenen Wörter (Briefe am Briefbaum) ----------

const brief = ({ titel, text, ablenker, betreff, richtig }) => ({
  typ: "block",
  frage: `${titel} – Der Schwarze Nebel hat Wörter aus dem Brief gestohlen. Setze die richtigen Wörter ein. Einige Wörter bleiben übrig. Wähle dann die passende Betreffzeile.`,
  aufgaben: [
    { typ: "luecke", frage: "Ergänze die Lücken 1–4.", text, auswahl: true, ablenker },
    { typ: "auswahl", frage: "Welche Betreffzeile passt am besten zum Brief?", optionen: betreff, richtig },
  ],
});

export const BRIEFE = [
  brief({
    titel: "Brief 1",
    text: "Liebe Frau Amani,\nherzlich willkommen in der Bibliothek von Scriptoria! Ihre Ausbildung (0) beginnt am Montag um acht Uhr.\n"
      + "Bitte (1) {bringen} Sie Ihren Ausweis und ein Foto mit. Am ersten Tag (2) {zeigen} wir Ihnen alle Lesesäle und das Archiv.\n"
      + "Die Arbeitskleidung (3) {bekommen} Sie von uns. Wenn Sie vorher noch Fragen haben, können Sie mich gern (4) {anrufen}.\n"
      + "Viele Grüße\nLirien, Leiterin der Bibliothek",
    ablenker: ["vergessen", "bezahlen", "schließen", "verkaufen"],
    betreff: ["Ihr Start bei uns", "Ihre Bewerbung ist angekommen", "Ihr Termin fällt aus"],
    richtig: 0,
  }),
  brief({
    titel: "Brief 2",
    text: "Sehr geehrte Damen und Herren,\nvor zwei Wochen habe ich bei Ihnen ein altes Buch zur Reparatur (0) gebracht.\n"
      + "Sie haben mir gesagt, dass es am Freitag fertig (1) {ist}. Leider konnte ich am Freitag nicht zu Ihnen (2) {kommen}, weil ich krank war.\n"
      + "Können Sie das Buch bitte bis Mittwoch für mich (3) {aufbewahren}? Ich (4) {bezahle} natürlich bei der Abholung.\n"
      + "Mit freundlichen Grüßen\nTomas Berg",
    ablenker: ["verkauft", "schreibe", "gefunden", "öffnet"],
    betreff: ["Bestellung eines neuen Buches", "Abholung meines Buches", "Beschwerde über die Reparatur"],
    richtig: 1,
  }),
  brief({
    titel: "Brief 3",
    text: "Liebe Mitglieder des Lesekreises,\nunser nächstes Treffen (0) findet am Donnerstag um 18 Uhr statt.\n"
      + "Diesmal (1) {lesen} wir Geschichten aus dem Nordwald. Bitte (2) {melden} Sie sich bis Dienstag bei mir an, denn es gibt nur zwanzig Plätze.\n"
      + "Wer nicht kommen kann, (3) {bekommt} die Texte per Brieftaube. Tee und Kekse (4) {gibt} es wie immer kostenlos.\n"
      + "Bis bald!\nMara",
    ablenker: ["kostet", "schläft", "verliert", "wohnen"],
    betreff: ["Neue Öffnungszeiten", "Absage des Treffens", "Einladung zum Lesekreis"],
    richtig: 2,
  }),
];

// ---------- Quest 2: Der Lesekreis (Berichte zuordnen) ----------

export const BERICHTE_FRAGE = "Besucher haben in das Gästebuch geschrieben, wie ihr Tag „Berufe rund ums Buch“ in der Bibliothek war. "
  + "Lies die Situationen 6–9 und die Abschnitte A–H. Welcher Abschnitt passt? Vier Abschnitte bleiben übrig.";

export const LESEKREIS = [
  {
    typ: "zuordnen",
    frage: BERICHTE_FRAGE,
    beispiel: ["0  Die Besucher lernten, wie man ein Buch findet.",
      "Zuerst bekamen wir eine Führung durch die alten Lesesäle. Die Bibliothekarin erklärte uns, wie man in den Katalogen ein bestimmtes Buch sucht."],
    paare: [
      ["6  Die Besucher stellten selbst etwas her.",
        "In der Buchbinderei durften wir selbst ein kleines Notizbuch binden. Das war schwieriger als gedacht, aber am Ende hatte jeder ein eigenes Heft."],
      ["7  Die Besucher hörten von den Erfahrungen eines Auszubildenden.",
        "Ein Lehrling im zweiten Jahr erzählte uns, warum er diesen Beruf gewählt hat – und auch, was ihm an seiner Ausbildung nicht so gut gefällt."],
      ["8  Die Besucher hatten sich schon vorher verabredet.",
        "Wir hatten uns eine Woche vorher für ein Gespräch mit der Leiterin angemeldet. So hatten wir eine ganze halbe Stunde Zeit für unsere Fragen."],
      ["9  Die Besucher konnten sich für einen Platz bewerben.",
        "Am Ende des Tages konnte man sich direkt für ein Praktikum im Sommer melden. Dafür musste man nur einen kurzen Fragebogen ausfüllen."],
    ],
    ablenker: [
      "Ein Restaurator zeigte uns, wie man alte, kaputte Bücher repariert. Selbst arbeiten durften wir dabei aber nicht, nur zusehen.",
      "Im Café der Bibliothek gab es Kuchen für alle. Leider war es sehr voll, und wir mussten lange auf einen Platz warten.",
      "Für unsere Gruppe gab es einen Gutschein: Den Bibliotheksausweis bekamen wir an diesem Tag kostenlos.",
      "Die Bibliothek hat jetzt auch Hörbücher. Ein Mitarbeiter zeigte uns, wie man sie am Automaten ausleiht.",
    ],
    erklaerung: "6: Notizbuch binden = selbst etwas herstellen (beim Restaurator durfte man nur zusehen!). 7: Lehrling erzählt. 8: eine Woche vorher angemeldet = verabredet. 9: für ein Praktikum melden = sich bewerben.",
  },
];
