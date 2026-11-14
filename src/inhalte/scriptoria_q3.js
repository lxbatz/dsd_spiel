// Scriptoria – Quest 3: Der Nachtpfad (Leseverstehen Teil 3: Regeln und Hinweise, richtig/falsch)
// Zwei Aushänge am Nachtpfad (Regeln für Besucher, Hinweise für Lehrlinge im Archiv), danach die
// Laternenprobe bei Laternenwärterin Vesna zu Signalwörtern (unter, nur, auch wenn, nicht …).
// Muster aus dem Modellsatz: Aussagen umschreiben den Text, Fallen bei Mengen- und Altersangaben,
// „kostenlos“ ↔ „bezahlen“, „bekommen“ ↔ „mitbringen“, Ausnahmen („nur mit Erlaubnis“).
// Alle Texte sind eigene Texte.

export const AUSHANG_PFAD = {
  titel: "Regeln für den Nachtpfad",
  text:
`Liebe Besucherinnen und Besucher,
der Nachtpfad führt durch den ältesten Teil des Waldes. Damit Sie sicher am Lehrlingshaus ankommen, beachten Sie bitte diese Regeln:

• Betreten Sie den Pfad nur mit einer Laterne. Laternen können Sie kostenlos bei der Laternenwärterin ausleihen. Bitte geben Sie sie am Ende des Pfades wieder ab.
• Bleiben Sie immer auf dem Weg. Zwischen den Bäumen ist der Boden weich, und man bleibt leicht stecken.
• Die leuchtenden Pilze dürfen Sie gern ansehen, aber nicht pflücken. Die Tiere des Waldes brauchen sie.
• Kinder unter zwölf Jahren dürfen den Pfad nur mit einem Erwachsenen gehen.
• Lautes Rufen und Musik sind zurzeit nicht erlaubt, denn die Eulen brüten.
• Haben Sie sich verlaufen? Dann bleiben Sie stehen und schwenken Sie Ihre Laterne. Die Laternenwärterin findet Sie.

Vielen Dank für Ihr Verständnis!`,
  quelle: "Die Bibliothek von Scriptoria",
};

export const AUSHANG_ARCHIV = {
  titel: "Hinweise für Lehrlinge: Arbeit im Archiv",
  text:
`Liebe Lehrlinge,
für die Arbeit im Archiv gelten besondere Regeln. Bitte lesen Sie sie vor Ihrem ersten Arbeitstag.

• Alte Bücher dürfen Sie nur mit Handschuhen anfassen. Handschuhe liegen an jedem Arbeitstisch für Sie bereit.
• Essen und Trinken sind im Archiv verboten. Für Ihre Pause gibt es einen eigenen Raum neben der Treppe.
• Bevor Sie ein Buch aus dem Archiv mitnehmen, tragen Sie es in die Liste am Eingang ein. Das gilt auch, wenn Sie das Buch nur für eine Stunde brauchen.
• Kaputte Seiten dürfen Sie nicht selbst reparieren. Legen Sie das Buch in die rote Kiste. Unsere Restauratorin kümmert sich darum.
• Das Archiv ist von 8 bis 16 Uhr geöffnet. Später dürfen Sie das Archiv nur mit Erlaubnis der Leiterin betreten.

Bei Fragen wenden Sie sich bitte an Lirien.`,
  quelle: "Leitung der Bibliothek",
};

export const AUSHAENGE = [
  {
    id: "scriptoria_q3_a1",
    name: "Aushang am Nachtpfad",
    aufgaben: [
      {
        typ: "richtigfalsch", lesetext: AUSHANG_PFAD,
        frage: "Lies den Aushang und die Aussagen 10–14. Richtig oder falsch?",
        aussagen: [
          ["10  Die Regeln sollen die Besucher schützen.", true],
          ["11  Für die Laterne muss man etwas bezahlen.", false],
          ["12  Man darf keine Pilze mitnehmen.", true],
          ["13  Ein Kind mit zwölf Jahren darf den Pfad nicht allein gehen.", false],
          ["14  Wer sich verlaufen hat, soll zum Eingang zurückgehen.", false],
        ],
        erklaerung: "10: „Damit Sie sicher ankommen“. 11: kostenlos. 12: nicht pflücken = nicht mitnehmen. 13: Nur Kinder UNTER zwölf brauchen einen Erwachsenen – mit zwölf darf man allein gehen. 14: stehen bleiben und die Laterne schwenken.",
      },
    ],
  },
  {
    id: "scriptoria_q3_a2",
    name: "Tafel am Archiv",
    aufgaben: [
      {
        typ: "richtigfalsch", lesetext: AUSHANG_ARCHIV,
        frage: "Lies die Hinweise und die Aussagen 10–14. Richtig oder falsch?",
        aussagen: [
          ["10  Die Lehrlinge müssen eigene Handschuhe mitbringen.", false],
          ["11  Im Archiv darf man nichts essen.", true],
          ["12  Braucht man ein Buch nur kurz, muss man es nicht eintragen.", false],
          ["13  Um beschädigte Bücher kümmert sich eine Kollegin.", true],
          ["14  Nach 16 Uhr kann man mit Erlaubnis ins Archiv.", true],
        ],
        erklaerung: "10: Die Handschuhe liegen bereit. 11: Essen ist verboten. 12: „Das gilt AUCH, wenn Sie das Buch nur für eine Stunde brauchen.“ 13: die Restauratorin. 14: „nur mit Erlaubnis der Leiterin“ – also mit Erlaubnis ja.",
      },
    ],
  },
];

/** Laternenprobe bei Vesna: Signalwörter genau lesen */
export const LATERNENPROBE = [
  {
    typ: "auswahl",
    frage: "Im Aushang steht: „Kinder unter zwölf Jahren dürfen den Pfad nur mit einem Erwachsenen gehen.“ Was gilt für Lio? Er ist genau zwölf.",
    optionen: ["Lio darf allein gehen.", "Lio braucht einen Erwachsenen.", "Lio darf den Pfad gar nicht gehen."],
    richtig: 0,
    erklaerung: "„unter zwölf“ heißt: 11, 10, 9 … Jahre. Mit zwölf gehört man nicht mehr dazu.",
  },
  {
    typ: "auswahl",
    frage: "„Das gilt auch, wenn Sie das Buch nur für eine Stunde brauchen.“ Was bedeutet das?",
    optionen: ["Man muss jedes Buch eintragen, ohne Ausnahme.", "Kurze Ausleihen muss man nicht eintragen.", "Man darf Bücher nur eine Stunde behalten."],
    richtig: 0,
  },
  {
    typ: "auswahl",
    frage: "„Später dürfen Sie das Archiv nur mit Erlaubnis der Leiterin betreten.“ Welche Aussage ist richtig?",
    optionen: ["Mit Erlaubnis darf man auch abends ins Archiv.", "Abends ist das Archiv immer geschlossen.", "Abends dürfen alle ins Archiv."],
    richtig: 0,
  },
  {
    typ: "zuordnen",
    frage: "Im Text steht es anders als in der Aussage. Welche Wörter bedeuten (fast) dasselbe? Ein Wort bleibt übrig.",
    paare: [
      ["kostenlos", "Man muss nichts bezahlen."],
      ["nicht pflücken", "nicht mitnehmen"],
      ["verboten", "nicht erlaubt"],
      ["bereitliegen", "schon da sein"],
    ],
    ablenker: ["selbst mitbringen"],
    erklaerung: "In Richtig/Falsch-Aufgaben stehen die Aussagen fast nie wörtlich im Text. Such die Stelle mit derselben Bedeutung!",
  },
  {
    typ: "auswahl",
    frage: "Wie gehst du bei Richtig/Falsch-Aufgaben am besten vor?",
    optionen: [
      "Ich lese eine Aussage, suche die passende Stelle im Text und vergleiche genau.",
      "Ich lese nur die Aussagen und rate.",
      "Ich suche im Text genau die gleichen Wörter wie in der Aussage.",
    ],
    richtig: 0,
  },
];
