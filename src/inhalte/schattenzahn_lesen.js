// Feste Schattenzahn – Probeprüfung Leseverstehen (Katakomben des Lesens)
// Genau nach DSD I PRO Leseverstehen (docs/dsd_pruefung.md): 5 Teile, 24 Items.
//   Teil 1  formelle E-Mail mit 4 Lücken (Wortliste) + Betreffzeile   Items 1–5
//   Teil 2  Abschnitte aus Berichten zuordnen, 4 bleiben übrig         Items 6–9
//   Teil 3  Regeln/Hinweise, Richtig/Falsch                           Items 10–14
//   Teil 4  Informationstext, A/B/C                                   Items 15–20
//   Teil 5  Anzeigen, Überschriften zuordnen, 4 bleiben übrig          Items 21–24
// Muster: Umschreibungen, Umkehrungen, Mengenwörter, Ablenker mit Lockwörtern. Alle Texte sind eigene Texte.

const T1 = "Teil 1 – E-Mail";
const T2 = "Teil 2 – Berichte";
const T3 = "Teil 3 – Regeln";
const T4 = "Teil 4 – Informationstext";
const T5 = "Teil 5 – Anzeigen";

// ---------- Teil 1: E-Mail mit Lücken und Betreffzeile ----------

const EMAIL_TEXT = `Von: personal@mueller-sanitaer.de
An: Aylin Demir

Sehr geehrte Frau Demir,

wir freuen uns, Sie am 1. September als neue Auszubildende in unserem Betrieb zu (0) begrüßen.

Ihr erster Arbeitstag beginnt um 7:30 Uhr. Bitte {melden} Sie sich zuerst am Empfang im Erdgeschoss. Dort bekommen Sie Ihren Mitarbeiterausweis.

Ihre Arbeitskleidung und Ihre Sicherheitsschuhe {erhalten} Sie am ersten Tag von uns. Sie müssen also nichts kaufen. Bitte {bringen} Sie aber Ihre Steuer-ID und die Bescheinigung Ihrer Krankenkasse mit, falls Sie uns diese noch nicht geschickt haben.

Am ersten Tag wird Sie Herr Lang, Ihr Ausbilder, durch den Betrieb führen. Wenn Sie vorher noch Fragen haben, {rufen} Sie uns gern unter 0421 55 67 80 an.

Mit freundlichen Grüßen
Petra Krüger
Personalabteilung, Müller Sanitär GmbH`;

const TEIL1 = [
  {
    teil: T1, typ: "block", nummer: 1,
    frage: "1–5  Lesen Sie die E-Mail. Welches Wort passt in die Lücke? Einige Wörter bleiben übrig. Wählen Sie dann die passende Betreffzeile.",
    aufgaben: [
      {
        typ: "luecke", auswahl: true,
        frage: "Ergänzen Sie die Lücken 1–4. Beispiel (0): begrüßen",
        text: EMAIL_TEXT,
        ablenker: ["bezahlen", "verschieben", "schicken"],
      },
      {
        typ: "auswahl", mischen: false,
        frage: "Welche Betreffzeile passt zu der E-Mail?",
        optionen: ["Ihre Bewerbung bei Müller Sanitär", "Informationen zu Ihrem ersten Ausbildungstag", "Bestellung Ihrer Arbeitskleidung"], richtig: 1,
      },
    ],
  },
];

// ---------- Teil 2: Berichte über den ersten Arbeitstag ----------

const TEIL2 = [
  {
    teil: T2, typ: "zuordnen",
    frage: "6–9  Auf der Webseite einer Berufsschule berichten Auszubildende von ihrem ersten Arbeitstag. Lesen Sie die Situationen 6–9 und die Abschnitte A–H. Welcher Abschnitt passt zu welcher Situation? Vier Abschnitte bleiben übrig.",
    beispiel: ["0  Jemand hat am ersten Tag gleich mit Kunden gesprochen.", "Ich habe gedacht, ich räume nur Regale ein. Aber schon nach einer Stunde hat mich eine Kundin nach Gartenmöbeln gefragt – und ich konnte ihr sogar helfen! (Tim, Verkäufer)"],
    paare: [
      ["6  Jemand musste am ersten Tag noch nicht richtig arbeiten.", "Arbeiten durfte ich am ersten Tag eigentlich noch gar nicht. Wir neuen Azubis haben Vorträge gehört, Formulare ausgefüllt und mit dem Chef zu Mittag gegessen. (Hanna, Bankkauffrau)"],
      ["7  Jemand hatte am ersten Tag ein technisches Problem.", "Mein Computer wollte am Morgen einfach nicht starten. Zwei Stunden lang habe ich nur zugeschaut, bis jemand von der IT gekommen ist. (Lukas, Kaufmann für Büromanagement)"],
      ["8  Jemand war am Anfang unsicher, hat sich dann aber gut gefühlt.", "Vor Aufregung konnte ich in der Nacht kaum schlafen. Aber das Team hat mich so herzlich begrüßt, dass ich mittags schon ganz entspannt war. (Ivana, Pflegefachfrau)"],
      ["9  Jemand hat am ersten Tag etwas über Sicherheit gelernt.", "Bevor ich die Werkstatt betreten durfte, hat mir mein Ausbilder eine Stunde lang erklärt, wie man sich bei einem Unfall verhält und wo der Feuerlöscher hängt. (Ole, Tischler)"],
    ],
    ablenker: [
      "Am ersten Tag war mein Ausbilder krank. Seine Kollegin hat mich durch den Betrieb geführt und mir alles gezeigt. Morgen lerne ich ihn dann kennen. (Sara, Köchin)",
      "Ich hatte Angst, zu spät zu kommen, und war deshalb schon eine Stunde vorher da. Die Tür war noch zu, und ich habe draußen gewartet. (Ben, Mechatroniker)",
      "An meinem ersten Tag habe ich gleich einen Computerkurs gemacht, weil wir mit einem neuen Programm arbeiten. Das war spannend. (Nora, Industriekauffrau)",
      "Meine Sicherheitsschuhe waren zu klein, deshalb hatte ich am Abend Schmerzen. Am nächsten Tag habe ich größere bekommen. (Ali, Elektroniker)",
    ],
  },
];

// ---------- Teil 3: Regeln für Praktikanten in der Großküche ----------

const KUECHE = {
  titel: "Hinweise für Praktikantinnen und Praktikanten in der Kantine „Mittagstisch“",
  text:
`• Hygiene geht vor: Waschen Sie vor Arbeitsbeginn und nach jeder Pause gründlich Ihre Hände. Lange Haare müssen zusammengebunden werden, eine Kopfbedeckung bekommen Sie von uns.
• Schmuck: Ringe und Uhren legen Sie bitte vor der Arbeit ab. Ohrringe sind erlaubt, wenn sie klein sind.
• Kleidung: Kochjacke und Schürze stellen wir. Ihre eigenen Schuhe dürfen Sie nicht tragen – in der Küche sind rutschfeste Arbeitsschuhe Pflicht. Diese können Sie bei uns ausleihen.
• Messer und Maschinen: Benutzen Sie die großen Küchenmaschinen nur, wenn eine Köchin oder ein Koch dabei ist. Kleine Messer dürfen Sie von Anfang an benutzen.
• Pausen: Ihre Mittagspause ist erst nach der Essensausgabe, also ab 14 Uhr. Sie dürfen kostenlos in der Kantine essen.
• Krankheit: Wenn Sie krank sind, rufen Sie bitte bis 7 Uhr in der Küche an. Eine E-Mail reicht nicht.`,
  quelle: "Kantine „Mittagstisch“, Küchenleitung",
};

const TEIL3 = [
  {
    teil: T3, typ: "richtigfalsch", lesetext: KUECHE,
    frage: "10–14  Lesen Sie die Hinweise. Sind die Aussagen richtig oder falsch?",
    aussagen: [
      ["10  Praktikanten müssen ihre Kopfbedeckung selbst mitbringen.", false],
      ["11  Kleine Ohrringe dürfen Praktikanten bei der Arbeit tragen.", true],
      ["12  Praktikanten können in der Küche ihre eigenen Turnschuhe tragen.", false],
      ["13  Mit den großen Maschinen dürfen Praktikanten nicht allein arbeiten.", true],
      ["14  Wer krank ist, kann der Küche eine E-Mail schreiben.", false],
    ],
  },
];

// ---------- Teil 4: Informationstext für Azubis im Autohaus ----------

const AUTOHAUS = {
  titel: "Willkommen im Autohaus Becker – Informationen für unsere neuen Auszubildenden",
  text:
`Liebe neue Auszubildende,

in den nächsten drei bis dreieinhalb Jahren lernen Sie bei uns alles, was eine gute Kfz-Mechatronikerin oder ein guter Kfz-Mechatroniker können muss. Hier finden Sie die wichtigsten Informationen.

Arbeitszeit: Ihre Arbeitszeit beträgt 39 Stunden pro Woche. In der Werkstatt beginnt der Tag um 7 Uhr. Freitags endet die Arbeit schon um 13 Uhr. An Berufsschultagen kommen Sie nach der Schule nicht mehr in den Betrieb.

Erste Wochen: In den ersten zwei Monaten arbeiten Sie noch nicht selbstständig an Kundenfahrzeugen. Sie lernen zuerst in unserer Lehrwerkstatt, wo jede und jeder einen eigenen Übungsmotor bekommt. Erst danach arbeiten Sie im Team mit einem erfahrenen Gesellen.

Werkzeug und Kleidung: Arbeitskleidung und Sicherheitsschuhe stellen wir Ihnen. Die Kleidung wird jede Woche von einer Firma gewaschen. Ein eigenes Werkzeugset bekommen Sie zum Beginn des zweiten Lehrjahres – bis dahin benutzen Sie das Werkzeug der Lehrwerkstatt.

Lernen: Jeden Mittwochnachmittag gibt es bei uns zusätzlichen Unterricht für alle Azubis. Dort bereiten wir Sie auf die Prüfungen vor. Wer möchte, kann außerdem einen Englischkurs an der Volkshochschule besuchen; die Kosten übernimmt das Autohaus.

Ausflug: Einmal im Jahr besuchen alle Auszubildenden gemeinsam ein Autowerk. Die Fahrt dauert einen ganzen Tag und gilt als Arbeitszeit.

Übernahme: Die meisten unserer Auszubildenden arbeiten nach der Abschlussprüfung weiter bei uns. Eine Garantie gibt es dafür aber nicht – entscheidend sind Ihre Leistungen und Ihr Einsatz.

Bei Fragen wenden Sie sich jederzeit an Ihre Ausbildungsleiterin, Frau Arslan.`,
  quelle: "Autohaus Becker, Ausbildungsleitung",
};

const TEIL4 = [
  {
    teil: T4, typ: "block", nummer: 15, lesetext: AUTOHAUS,
    frage: "15–20  Lesen Sie den Text. Wählen Sie bei jeder Aufgabe die richtige Lösung: A, B oder C.",
    aufgaben: [
      { typ: "auswahl", mischen: false, frage: "An Berufsschultagen …", optionen: ["arbeiten die Azubis nach der Schule im Betrieb.", "gehen die Azubis nach der Schule nicht mehr zur Arbeit.", "beginnt die Arbeit um 13 Uhr."], richtig: 1 },
      { typ: "auswahl", mischen: false, frage: "In den ersten zwei Monaten …", optionen: ["üben die Azubis an einem eigenen Motor.", "reparieren die Azubis Kundenautos.", "arbeiten die Azubis allein im Team."], richtig: 0 },
      { typ: "auswahl", mischen: false, frage: "Ein eigenes Werkzeugset …", optionen: ["müssen die Azubis selbst kaufen.", "bekommen die Azubis am ersten Tag.", "bekommen die Azubis im zweiten Lehrjahr."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "Der Englischkurs …", optionen: ["ist für alle Azubis Pflicht.", "findet am Mittwochnachmittag im Betrieb statt.", "kostet die Azubis nichts."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "Der Ausflug zum Autowerk …", optionen: ["zählt als Arbeitstag.", "findet zweimal im Jahr statt.", "ist nur für Azubis im letzten Lehrjahr."], richtig: 0 },
      { typ: "auswahl", mischen: false, frage: "Nach der Ausbildung …", optionen: ["bekommen alle Azubis sicher eine feste Stelle.", "bleiben viele Azubis im Autohaus.", "müssen die Azubis das Autohaus verlassen."], richtig: 1 },
    ],
  },
];

// ---------- Teil 5: Anzeigen mit Weiterbildungsangeboten ----------

const TEIL5 = [
  {
    teil: T5, typ: "zuordnen",
    frage: "21–24  Lesen Sie die Anzeigen 21–24 und die Überschriften A–H. Welche Überschrift passt zu welcher Anzeige? Vier Überschriften bleiben übrig.",
    beispiel: ["0  Sie arbeiten bald mit Kunden aus aller Welt? In acht Abenden lernen Sie, auf Englisch Termine zu vereinbaren, Beschwerden anzunehmen und Rechnungen zu erklären. Mittwochs, 18–20 Uhr.", "Englisch für den Kundenkontakt"],
    paare: [
      ["21  Schluss mit dem Papierchaos! Wir zeigen Ihnen, wie Sie Rechnungen, Lieferscheine und Verträge am Computer ablegen, damit Sie alles in Sekunden wiederfinden. Ein Samstag, 9–16 Uhr, Laptop bitte mitbringen.", "Digitale Ordnung im Büro"],
      ["22  Sie haben zum ersten Mal einen Azubi im Team? In diesem Seminar lernen Gesellinnen und Gesellen, wie man gut erklärt, Feedback gibt und junge Leute motiviert. Zwei Tage, mit Zertifikat.", "Fit für die Rolle als Ausbilder"],
      ["23  Nur noch drei Monate bis zur Abschlussprüfung? Wir wiederholen mit Ihnen den wichtigsten Stoff, schreiben Probeprüfungen und üben die mündliche Prüfung. Jeden Samstagvormittag, kleine Gruppen.", "Gut vorbereitet in die Prüfung"],
      ["24  Rücken, Schultern, Knie: Wer den ganzen Tag schwer hebt, sollte sich schützen. Eine Physiotherapeutin zeigt Ihnen Übungen und die richtige Technik beim Heben und Tragen. Vier Termine, auch für Azubis.", "Gesund arbeiten im Lager und in der Werkstatt"],
    ],
    ablenker: [
      "Kundenbeschwerden richtig beantworten",
      "Computerkurs für Anfänger ohne Vorkenntnisse",
      "Sport am Samstag für das ganze Team",
      "Deutschkurs für die mündliche Prüfung",
    ],
  },
];

export const LESEN = [...TEIL1, ...TEIL2, ...TEIL3, ...TEIL4, ...TEIL5];

export const LESEN_HINWEIS = "Probeprüfung Leseverstehen: 5 Teile, 24 Punkte. Lies zuerst die Aufgabe, dann den Text. Die Lösungen stehen fast nie wörtlich im Text. Achte auf kleine Wörter wie „nur“, „alle“, „die meisten“ und „noch nicht“. Es gibt keine Rückmeldung während der Prüfung. Bestanden ab 12 Punkten.";
