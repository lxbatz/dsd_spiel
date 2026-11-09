// Nebenquests im Dorf der Ankömmlinge (freiwillig, nach Lythara Quest 1).
// Sie erzählen mehr über die Menschen im Dorf und üben Lesen und Sprechen im Alltag und im Beruf.
//   dorf_finn       Finns Geheimnis       – einen persönlichen Brief verstehen, einen Rat geben
//   dorf_markt      Ein Tag am Marktstand – Verkaufsgespräche, Preise, höflich sein
//   dorf_werkstatt  Borins Werkstatt      – eine Bestellung und eine Arbeitsanleitung verstehen

// ---------- Finns Geheimnis ----------

export const FINNS_BRIEF = {
  titel: "Ein Brief, der nie abgeschickt wurde",
  text:
`Liebe Tante Rosa,

wie geht es dir? Mir geht es gut, aber ich habe ein Problem.

Seit dem Frühling bin ich Lehrling bei Borin, dem Schmied. Borin ist sehr nett und er erklärt mir alles. Aber die Arbeit ist schwer. In der Schmiede ist es immer heiß, und gestern habe ich mir wieder die Finger verbrannt.

Am Abend lese ich. Ich lese jeden Abend, manchmal bis Mitternacht. Am liebsten lese ich Abenteuerbücher und Bücher über fremde Länder. Mein Traum ist eine Arbeit mit Büchern – so wie du in deiner Buchhandlung in Lumen.

Aber ich habe Angst, mit Borin darüber zu sprechen. Er hat keine Kinder, und er sagt oft: „Eines Tages gehört die Schmiede dir, Finn.“ Ich will ihn nicht traurig machen.

Darf ich in den Sommerferien zwei Wochen bei dir in der Buchhandlung ein Praktikum machen? Dann weiß ich, ob der Beruf wirklich zu mir passt.

Viele Grüße
dein Finn

PS: Mimi, die Katze von Wilma, schläft jeden Tag auf meinen Büchern!`,
  quelle: "Finn, Lehrling in der Schmiede",
};

export const FINN_AUFGABEN = [
  {
    typ: "richtigfalsch", lesetext: FINNS_BRIEF,
    frage: "Was steht im Brief? Richtig oder falsch?",
    aussagen: [
      ["Finn ist seit dem Frühling Lehrling bei Borin.", true],
      ["Borin erklärt Finn nicht viel.", false],
      ["In der Schmiede ist es oft kalt.", false],
      ["Finn liest jeden Abend.", true],
      ["Tante Rosa hat eine Buchhandlung.", true],
    ],
  },
  {
    typ: "auswahl", lesetext: FINNS_BRIEF,
    frage: "Warum hat Finn Angst, mit Borin zu sprechen?",
    optionen: [
      "Er will Borin nicht traurig machen, denn Borin möchte ihm später die Schmiede geben.",
      "Borin ist oft wütend und schreit.",
      "Borin mag keine Bücher.",
    ],
    richtig: 0,
  },
  {
    typ: "auswahl", lesetext: FINNS_BRIEF,
    frage: "Was möchte Finn von Tante Rosa?",
    optionen: [
      "ein Praktikum in ihrer Buchhandlung in den Sommerferien",
      "neue Bücher über fremde Länder",
      "Geld für eine Reise nach Lumen",
    ],
    richtig: 0,
  },
  {
    typ: "zuordnen",
    frage: "Was bedeuten die Wörter aus dem Brief?",
    paare: [
      ["der Lehrling", "jemand, der einen Beruf lernt"],
      ["das Praktikum", "eine kurze Zeit, in der man in einem Beruf mitarbeitet"],
      ["die Buchhandlung", "ein Geschäft, in dem man Bücher kauft"],
      ["Angst haben", "sich nicht trauen, etwas zu tun"],
    ],
  },
  {
    typ: "luecke",
    frage: "Fasse den Brief zusammen. Wähle die passenden Wörter.",
    text: "Finn macht eine {Ausbildung} als Schmied. Aber sein {Traum} ist eine Arbeit mit Büchern. Deshalb möchte er ein {Praktikum} bei seiner Tante machen.",
    auswahl: true,
    ablenker: ["Urlaub", "Problem", "Reise"],
  },
  {
    typ: "auswahl",
    frage: "Finn fragt dich: „Soll ich mit Borin sprechen?“ Was ist ein guter Rat?",
    optionen: [
      "Ja, du solltest ehrlich mit Borin sprechen. Er ist nett und hört dir sicher zu.",
      "Nein, sag nichts. Schick den Brief einfach heimlich ab.",
      "Lauf weg und komm erst im Winter zurück.",
    ],
    richtig: 0,
    erklaerung: "Einen Rat gibt man oft mit „sollte“: Du solltest … · An deiner Stelle würde ich …",
  },
  {
    typ: "ordnen",
    frage: "Gib Finn noch einen Rat. Bau den Satz.",
    teile: ["Du", "solltest", "zuerst", "ein Praktikum", "machen."],
    loesungen: ["Zuerst solltest du ein Praktikum machen."],
    erklaerung: "Ratschläge mit „sollte“: Du solltest … machen. Der Infinitiv steht am Ende.",
  },
];

// ---------- Ein Tag am Marktstand ----------

export const PREISLISTE = {
  titel: "Wilmas Preisliste",
  text:
`Äpfel ............ 1 kg   2,00 €
Birnen ........... 1 kg   2,50 €
Tomaten ........... 1 kg   2,40 €
Kartoffeln ....... 1 kg   1,50 €
Brot ............. 1 Stück 3,20 €
Eier ............. 6 Stück 1,80 €
Honig ............ 1 Glas 4,50 €

Heute leider keine Bananen und keine Erdbeeren!`,
  quelle: "Händlerin Wilma",
};

export const MARKT_AUFGABEN = [
  {
    typ: "auswahl",
    frage: "Ein Kunde sagt: „Guten Morgen! Ich hätte gern ein Kilo Äpfel.“ Was antwortest du?",
    optionen: ["Guten Morgen! Gern, hier bitte. Sonst noch etwas?", "Was willst du?", "Äpfel sind rot."],
    richtig: 0,
    erklaerung: "Am Marktstand: Gern. · Hier bitte. · Sonst noch etwas? · Darf es noch etwas sein?",
  },
  {
    typ: "auswahl", lesetext: PREISLISTE,
    frage: "Eine Frau fragt: „Was kosten die Tomaten?“",
    optionen: ["Ein Kilo kostet 2,40 Euro.", "Die Tomaten sind sehr frisch.", "Ein Kilo kostet 2,00 Euro."],
    richtig: 0,
  },
  {
    typ: "luecke", lesetext: PREISLISTE,
    frage: "Ein Mann sagt: „Ich nehme zwei Kilo Kartoffeln und ein Brot.“ Rechne mit der Preisliste.",
    text: "Zwei Kilo Kartoffeln kosten {3,00} Euro. Mit dem Brot macht das {6,20} Euro.",
    auswahl: true,
    ablenker: ["1,50", "4,70", "5,20"],
    erklaerung: "2 × 1,50 € = 3,00 € · 3,00 € + 3,20 € = 6,20 €. So sagt man es: „Das macht sechs Euro zwanzig.“",
  },
  {
    typ: "auswahl", lesetext: PREISLISTE,
    frage: "Ein Junge fragt: „Haben Sie auch Bananen?“",
    optionen: ["Nein, leider nicht. Aber wir haben frische Birnen.", "Nein.", "Bananen? Die sind doof."],
    richtig: 0,
    erklaerung: "Höflich Nein sagen: Leider nicht. · Das haben wir heute leider nicht. Aber … (eine Alternative anbieten)",
  },
  {
    typ: "zuordnen",
    frage: "Was passt zusammen?",
    paare: [
      ["Kann ich mit Karte bezahlen?", "Leider nein, nur bar."],
      ["Möchten Sie eine Tüte?", "Ja, gern. Vielen Dank."],
      ["Das macht 4,50 Euro.", "Hier sind 5 Euro. Stimmt so!"],
      ["Vielen Dank und einen schönen Tag!", "Danke, Ihnen auch!"],
    ],
    erklaerung: "„Stimmt so!“ heißt: Das Wechselgeld ist Trinkgeld.",
  },
  {
    typ: "richtigfalsch",
    frage: "Höflich oder unhöflich? (Richtig = höflich)",
    aussagen: [
      ["Was möchten Sie, bitte?", true],
      ["Schnell, ich habe keine Zeit!", false],
      ["Darf es noch etwas sein?", true],
      ["Hier ist Ihr Wechselgeld. Einen schönen Tag noch!", true],
      ["Nimm das und geh.", false],
    ],
  },
  {
    typ: "ordnen",
    frage: "Eine Kundin bestellt höflich. Bau ihren Satz.",
    teile: ["Ich", "hätte", "gern", "sechs Eier", "und", "ein Glas Honig."],
    erklaerung: "Höflich bestellen: Ich hätte gern … · Ich möchte bitte …",
  },
  {
    typ: "luecke", lesetext: PREISLISTE,
    frage: "Die Kundin bezahlt mit einem 10-Euro-Schein. Rechne.",
    text: "Sechs Eier und ein Glas Honig kosten {6,30} Euro. Die Kundin bekommt {3,70} Euro zurück.",
    auswahl: true,
    ablenker: ["6,00", "4,00", "3,30"],
    erklaerung: "1,80 € + 4,50 € = 6,30 € · 10,00 € − 6,30 € = 3,70 € Wechselgeld",
  },
];

// ---------- Borins Werkstatt ----------

export const BESTELLUNG = {
  titel: "Bestellung: Ein Gartentor",
  text:
`An: Schmied Borin, Schmiede am Dorfplatz
Von: Rat der Weisen, Rathaus
Datum: 3. Oktober

Sehr geehrter Herr Borin,

der Rat bestellt bei Ihnen ein neues Tor für den Kräutergarten am Zaun.

Breite: 1,20 Meter
Höhe: 1 Meter
Material: Eisen
Farbe: schwarz

Das Tor soll ein Schloss haben. Bitte liefern Sie das Tor bis Freitag, den 10. Oktober.
Preis: 80 Euro. Der Rat bezahlt nach der Lieferung.

Mit freundlichen Grüßen
Aldric, Ratsältester`,
  quelle: "Rat der Weisen",
};

export const ANLEITUNG = {
  titel: "Arbeitsanleitung: So schmiedest du einen Gitterstab",
  text:
`1. Zieh Schutzbrille, Lederschürze und Handschuhe an.
2. Leg das Eisen in die Esse und mach es heiß, bis es rot glüht.
3. Nimm das heiße Eisen mit der Zange aus dem Feuer.
4. Leg es auf den Amboss und schlag es mit dem Hammer in Form.
5. Kühl das Eisen im Wassereimer ab.
6. Mach die Kanten mit der Feile glatt.

Achtung: Fass heißes Eisen nie mit der Hand an!`,
  quelle: "Aus Borins Werkstattbuch",
};

export const WERKSTATT_AUFGABEN = [
  {
    typ: "richtigfalsch", lesetext: BESTELLUNG,
    frage: "Lies die Bestellung. Richtig oder falsch?",
    aussagen: [
      ["Das Tor ist für den Kräutergarten.", true],
      ["Das Tor soll 2 Meter breit sein.", false],
      ["Das Tor soll schwarz sein.", true],
      ["Borin muss das Tor bis Montag liefern.", false],
      ["Der Rat bezahlt vor der Lieferung.", false],
    ],
  },
  {
    typ: "auswahl", lesetext: BESTELLUNG,
    frage: "Was soll das Tor außerdem haben?",
    optionen: ["ein Schloss", "eine Glocke", "ein kleines Fenster"],
    richtig: 0,
  },
  {
    typ: "zuordnen",
    frage: "Borin zeigt dir seine Werkzeuge. Was macht man damit?",
    paare: [
      ["die Esse", "Darin macht man das Eisen heiß."],
      ["die Zange", "Damit hält man das heiße Eisen."],
      ["der Amboss", "Darauf legt man das Eisen zum Schmieden."],
      ["der Hammer", "Damit schlägt man auf das Eisen."],
      ["die Feile", "Damit macht man Kanten glatt."],
    ],
    erklaerung: "Werkzeuge beschreiben: Damit … man … · Darin/Darauf … man …",
  },
  {
    typ: "auswahl", lesetext: ANLEITUNG,
    frage: "Was macht man zuerst?",
    optionen: ["Schutzbrille, Lederschürze und Handschuhe anziehen", "das Eisen in die Esse legen", "die Kanten glatt machen"],
    richtig: 0,
  },
  {
    typ: "ordnen", lesetext: ANLEITUNG,
    frage: "Bring die Arbeitsschritte in die richtige Reihenfolge.",
    teile: ["das Eisen heiß machen", "das Eisen mit der Zange nehmen", "das Eisen mit dem Hammer formen", "das Eisen abkühlen", "die Kanten glatt machen"],
    erklaerung: "Die Reihenfolge steht in der Anleitung: 2 → 3 → 4 → 5 → 6.",
  },
  {
    typ: "luecke", lesetext: ANLEITUNG,
    frage: "In Anleitungen steht oft der Imperativ. Wähle die richtige Form.",
    text: "{Leg} das Eisen in die Esse. {Nimm} es mit der Zange heraus. {Schlag} es mit dem Hammer in Form.",
    auswahl: true,
    ablenker: ["Legst", "Nehmt", "Schlägt"],
    erklaerung: "Imperativ (du): du legst → Leg! · du nimmst → Nimm! · du schlägst → Schlag!",
  },
  {
    typ: "auswahl", lesetext: ANLEITUNG,
    frage: "Warum trägt man in der Schmiede Handschuhe?",
    optionen: ["damit man sich nicht die Hände verbrennt", "damit die Hände sauber bleiben", "weil es in der Schmiede kalt ist"],
    richtig: 0,
    erklaerung: "„damit“ nennt einen Zweck: Man trägt Handschuhe, damit man sich nicht verbrennt.",
  },
];
