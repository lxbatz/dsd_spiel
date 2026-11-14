// Scriptoria – Quest 4: Das Lehrlingshaus (Leseverstehen Teil 4: Informationstext, A/B/C)
// Zwei Informationstexte für den Start in Ausbildung und Praktikum, je sechs Aufgaben (15–20) auf einem Blatt:
// Satzanfang + drei Fortsetzungen. Muster aus dem Modellsatz: Lösung umschrieben („erfolgreich abgeschlossen“ →
// „bestanden“), Mengenwörter (die meisten / alle / einige), Umkehrungen („dürfen nicht“ → „nur kleine Werkzeuge“),
// zeitliche Einschränkungen („erst im zweiten Jahr“, „am Freitag nur bis …“). Alle Texte sind eigene Texte.

export const TEXT_LEHRLINGSHAUS = {
  titel: "Willkommen im Lehrlingshaus – Informationen für neue Lehrlinge",
  text:
`Liebe neue Lehrlinge,

herzlich willkommen in Scriptoria! In den ersten drei Monaten wohnen Sie im Lehrlingshaus. Danach können Sie selbst entscheiden, ob Sie bleiben oder eine eigene Wohnung im Dorf suchen. Die meisten Lehrlinge bleiben, denn die Miete ist niedrig und der Weg zur Arbeit ist sehr kurz.

In jedem Zimmer wohnen zwei Personen. Bettwäsche und Handtücher bekommen Sie von uns. Bitte bringen Sie aber eine eigene Lampe zum Lesen mit, denn das Licht der Pilze reicht abends oft nicht aus.

Frühstück und Abendessen gibt es in der großen Küche im Erdgeschoss. Mittags essen Sie in der Kantine der Bibliothek. Wer selbst kochen möchte, darf die Küche ab 19 Uhr benutzen, muss sie danach aber sauber machen.

Ihre Ausbildung dauert drei Jahre. Jede Woche arbeiten Sie vier Tage in der Bibliothek, an einem Tag besuchen Sie die Schreibschule im Dorf. In den ersten Wochen arbeiten Sie vor allem in der Ausleihe. In die alten Archive dürfen Sie erst im zweiten Lehrjahr.

Jeder Lehrling bekommt eine erfahrene Kollegin oder einen erfahrenen Kollegen als Paten. Mit dieser Person können Sie über alle Fragen und Probleme sprechen – auch über private.

Nach der Abschlussprüfung haben die meisten Lehrlinge eine feste Stelle bei uns bekommen. Einige arbeiten heute in anderen Bibliotheken von Eldoria.

Wir freuen uns auf Sie!`,
  quelle: "Corvin, Ausbilder der Bibliothek von Scriptoria",
};

export const TEXT_PRAKTIKUM = {
  titel: "Ihr Praktikum in der Buchbinderei",
  text:
`Liebe Praktikantin, lieber Praktikant,

Ihr Praktikum dauert zwei Wochen. Sie arbeiten jeden Tag von 8 bis 15 Uhr, am Freitag nur bis 12 Uhr. Bitte seien Sie pünktlich, denn wir beginnen jeden Morgen mit einer kurzen Besprechung.

Am ersten Tag zeigt Ihnen Meisterin Hedda die Werkstatt und die Maschinen. Mit der großen Schneidemaschine dürfen Praktikanten aus Sicherheitsgründen nicht arbeiten. Kleine Werkzeuge wie Falzbein, Nadel und Leimpinsel dürfen Sie aber vom ersten Tag an benutzen.

In der ersten Woche lernen Sie, wie man Papier faltet und einfache Hefte bindet. In der zweiten Woche binden Sie ein ganzes Buch – und dieses Buch dürfen Sie am Ende mit nach Hause nehmen.

Tragen Sie bitte alte Kleidung, denn Leim lässt sich nur schwer auswaschen. Eine Schürze bekommen Sie von uns.

Am letzten Tag führen wir mit Ihnen ein Abschlussgespräch. Dabei bekommen Sie auch eine Bescheinigung über Ihr Praktikum. Wenn Ihnen die Arbeit gefallen hat, können Sie sich danach für einen Ausbildungsplatz bewerben. Praktikantinnen und Praktikanten laden wir immer zu einem Vorstellungsgespräch ein.`,
  quelle: "Buchbinderei der Bibliothek von Scriptoria",
};

const A = (frage, optionen, richtig) => ({ typ: "auswahl", mischen: false, frage, optionen, richtig });

export const BRETT = [
  {
    typ: "block", lesetext: TEXT_LEHRLINGSHAUS, nummer: 15,
    frage: "Lies Corvins Text für neue Lehrlinge und die Aufgaben 15–20. Wähle bei jeder Aufgabe die richtige Lösung.",
    aufgaben: [
      A("Im Lehrlingshaus", ["müssen alle Lehrlinge drei Jahre wohnen.", "wohnen die Lehrlinge am Anfang ihrer Ausbildung.", "ist die Miete sehr hoch."], 1),
      A("Die Lehrlinge sollen", ["eine eigene Lampe mitbringen.", "Bettwäsche und Handtücher mitbringen.", "ein Zimmer allein bekommen."], 0),
      A("Beim Essen gilt:", ["Mittags essen die Lehrlinge in der großen Küche.", "Die Küche dürfen die Lehrlinge nicht benutzen.", "Am Abend dürfen die Lehrlinge selbst kochen."], 2),
      A("In den ersten Wochen", ["arbeiten die Lehrlinge meistens in der Ausleihe.", "arbeiten die Lehrlinge im alten Archiv.", "gehen die Lehrlinge jeden Tag in die Schreibschule."], 0),
      A("Der Pate oder die Patin", ["ist ein anderer neuer Lehrling.", "hilft nur bei Fragen zur Arbeit.", "hilft auch bei persönlichen Problemen."], 2),
      A("Nach der Ausbildung", ["haben alle Lehrlinge eine Stelle in Scriptoria bekommen.", "sind viele Lehrlinge in Scriptoria geblieben.", "müssen die Lehrlinge in andere Bibliotheken gehen."], 1),
    ],
    erklaerung: "15: „In den ersten drei Monaten“. 16: Bettwäsche bekommen sie, die Lampe nicht. 17: „ab 19 Uhr“ selbst kochen; mittags Kantine. 18: „vor allem in der Ausleihe“, ins Archiv erst im 2. Jahr. 19: „auch über private“ Probleme. 20: „die meisten“ – also viele, aber nicht alle.",
  },
];

export const PRAKTIKUM = [
  {
    typ: "block", lesetext: TEXT_PRAKTIKUM, nummer: 15,
    frage: "Lies Ilkas Praktikumsunterlagen und die Aufgaben 15–20. Wähle bei jeder Aufgabe die richtige Lösung.",
    aufgaben: [
      A("Am Freitag", ["ist der Arbeitstag kürzer.", "gibt es keine Besprechung.", "beginnt das Praktikum."], 0),
      A("Die Praktikanten", ["dürfen mit allen Maschinen arbeiten.", "dürfen kleine Werkzeuge sofort benutzen.", "müssen eigene Werkzeuge mitbringen."], 1),
      A("In der zweiten Woche", ["falten die Praktikanten vor allem Papier.", "binden die Praktikanten einfache Hefte.", "stellen die Praktikanten ein Buch für sich selbst her."], 2),
      A("Zum Praktikum soll man", ["eine Schürze mitbringen.", "Kleidung tragen, die schmutzig werden darf.", "neue Arbeitskleidung kaufen."], 1),
      A("Am Ende des Praktikums", ["bekommen die Praktikanten ein Dokument.", "müssen die Praktikanten eine Prüfung machen.", "bekommen die Praktikanten sofort einen Ausbildungsplatz."], 0),
      A("Wer sich danach für eine Ausbildung bewirbt,", ["muss zuerst einen Test machen.", "wird zu einem Gespräch eingeladen.", "bekommt die Stelle ohne Gespräch."], 1),
    ],
    erklaerung: "15: „am Freitag nur bis 12 Uhr“. 16: Nicht mit der großen Maschine, aber kleine Werkzeuge vom ersten Tag an. 17: Das Buch darf man mit nach Hause nehmen. 18: „alte Kleidung“ – Leim geht schwer raus; die Schürze bekommt man. 19: Bescheinigung = Dokument. 20: „laden wir immer zu einem Vorstellungsgespräch ein“.",
  },
];
