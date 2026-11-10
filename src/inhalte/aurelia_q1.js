// Aurelia – Quest 1: Die Stimmen des Hafens (Hören: Durchsagen)
// Drei Rufmuscheln am Kai spielen Durchsagen ab. Danach hilft man bei Hafenmeisterin Nerea
// den Reisenden, die die Durchsagen nicht verstanden haben.
// Lernziel: Einzelinformationen aus Durchsagen heraushören (Zeit, Ort, Zahl, Grund, Änderung).
// Alle Texte sind eigene Texte. Für eigene Aufnahmen: datei: "Sound/hoeren/<name>.mp3" ergänzen.

const DURCHSAGE = { tonhoehe: 1.0, tempo: 0.86 };

export const D_FAEHRE = {
  sprecher: "Rufmuschel am Steg", gong: true, stimme: DURCHSAGE,
  text: "Achtung, eine Durchsage für alle Reisenden nach Kalmos! Die Fähre um zehn Uhr fünfzehn hat heute etwa zwanzig Minuten Verspätung. Der Grund ist starker Wind. Die Fähre fährt heute nicht von Steg drei, sondern von Steg fünf. Wir bitten um Ihr Verständnis.",
};

export const D_RUNDFAHRT = {
  sprecher: "Rufmuschel am Steg", gong: true, stimme: DURCHSAGE,
  text: "Eine Information für Schülergruppen: Die Hafenrundfahrt beginnt heute schon um vierzehn Uhr dreißig, nicht um fünfzehn Uhr. Treffpunkt ist der Leuchtturm. Tickets gibt es nur noch im Hafenbüro. Bitte seien Sie zehn Minuten vorher da.",
};

export const D_FUNDSACHE = {
  sprecher: "Rufmuschel am Kiosk", gong: true, stimme: DURCHSAGE,
  text: "Liebe Gäste, am Kiosk neben dem Fischmarkt wurde ein blauer Rucksack gefunden. Im Rucksack sind eine Kamera und ein Buch. Der Besitzer kann den Rucksack bis achtzehn Uhr am Kiosk abholen. Danach ist er im Hafenbüro.",
};

export const D_SPERRUNG = {
  sprecher: "Rufmuschel am Kai", gong: true, stimme: DURCHSAGE,
  text: "Eine Sicherheitsdurchsage: Wegen Bauarbeiten ist der Weg am Nordkai bis Freitag gesperrt. Fußgänger benutzen bitte die Brücke beim Fischmarkt. Fahrräder müssen geschoben werden. Vielen Dank.",
};

export const D_WETTER = {
  sprecher: "Rufmuschel am Kai", gong: true, stimme: DURCHSAGE,
  text: "Das Wetter für heute: Am Vormittag ist es sonnig bei vierundzwanzig Grad. Am Nachmittag kommt Wind aus dem Norden, und es kann regnen. Am Abend wird es wieder ruhig und trocken.",
};

/** Die drei Rufmuscheln (Stationen) */
export const MUSCHELN = [
  {
    id: "aurelia_q1_m1",
    name: "Rufmuschel der Fähren",
    inschrift: "Hör genau hin: Wann? Wohin? Von wo?",
    aufgaben: [
      {
        typ: "auswahl", hoertext: D_FAEHRE,
        frage: "Für wen ist die Durchsage?",
        optionen: ["für Reisende nach Kalmos", "für Reisende nach Lythara", "für alle Fischer"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: D_FAEHRE,
        frage: "Wie viel Verspätung hat die Fähre?",
        optionen: ["etwa 20 Minuten", "etwa 15 Minuten", "etwa 10 Minuten"],
        richtig: 0,
        erklaerung: "„zehn Uhr fünfzehn“ ist die Abfahrtszeit. Die Verspätung ist „etwa zwanzig Minuten“. Achte darauf, welche Zahl wozu gehört!",
      },
      {
        typ: "auswahl", hoertext: D_FAEHRE,
        frage: "Von welchem Steg fährt die Fähre heute?",
        optionen: ["von Steg 5", "von Steg 3", "von Steg 1"],
        richtig: 0,
        erklaerung: "„nicht von Steg drei, sondern von Steg fünf“ – bei Änderungen zählt die neue Information nach „sondern“.",
      },
      {
        typ: "auswahl", hoertext: D_FAEHRE,
        frage: "Warum hat die Fähre Verspätung?",
        optionen: ["wegen starkem Wind", "wegen eines Motorschadens", "wegen vieler Passagiere"],
        richtig: 0,
      },
    ],
  },
  {
    id: "aurelia_q1_m2",
    name: "Rufmuschel der Ausflüge",
    inschrift: "Uhrzeiten, Treffpunkte, Tickets – merk dir alles!",
    aufgaben: [
      {
        typ: "auswahl", hoertext: D_RUNDFAHRT,
        frage: "Wann beginnt die Hafenrundfahrt heute?",
        optionen: ["um 14:30 Uhr", "um 15:00 Uhr", "um 13:30 Uhr"],
        richtig: 0,
        erklaerung: "„schon um vierzehn Uhr dreißig, nicht um fünfzehn Uhr“",
      },
      {
        typ: "richtigfalsch", hoertext: D_RUNDFAHRT,
        frage: "Was stimmt? Richtig oder falsch?",
        aussagen: [
          ["Der Treffpunkt ist der Leuchtturm.", true],
          ["Tickets kann man online kaufen.", false],
          ["Tickets gibt es im Hafenbüro.", true],
          ["Man soll zehn Minuten vorher da sein.", true],
        ],
      },
      {
        typ: "auswahl", hoertext: D_RUNDFAHRT,
        frage: "Wann solltest du also spätestens am Treffpunkt sein?",
        optionen: ["um 14:20 Uhr", "um 14:30 Uhr", "um 14:50 Uhr"],
        richtig: 0,
        erklaerung: "14:30 Uhr minus zehn Minuten = 14:20 Uhr",
      },
      {
        typ: "auswahl", hoertext: D_FUNDSACHE,
        frage: "Was wurde am Kiosk gefunden?",
        optionen: ["ein blauer Rucksack", "eine blaue Jacke", "ein schwarzer Koffer"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch", hoertext: D_FUNDSACHE,
        frage: "Was hast du gehört? Richtig oder falsch?",
        aussagen: [
          ["Im Rucksack sind eine Kamera und ein Buch.", true],
          ["Im Rucksack ist ein Handy.", false],
          ["Bis 18 Uhr ist der Rucksack am Kiosk.", true],
          ["Danach ist der Rucksack beim Fischmarkt.", false],
        ],
      },
    ],
  },
  {
    id: "aurelia_q1_m3",
    name: "Rufmuschel des Kais",
    inschrift: "Was ist gesperrt? Was wird das Wetter? Hör auf die Details!",
    aufgaben: [
      {
        typ: "auswahl", hoertext: D_SPERRUNG,
        frage: "Was ist gesperrt?",
        optionen: ["der Weg am Nordkai", "die Brücke beim Fischmarkt", "der ganze Hafen"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: D_SPERRUNG,
        frage: "Wie lange ist der Weg gesperrt?",
        optionen: ["bis Freitag", "bis Montag", "nur heute"],
        richtig: 0,
      },
      {
        typ: "luecke", hoertext: D_SPERRUNG,
        frage: "Ergänze die Durchsage.",
        text: "Fußgänger benutzen bitte die {Brücke} beim Fischmarkt. Fahrräder müssen {geschoben} werden.",
        auswahl: true,
        ablenker: ["Straße", "gefahren", "geparkt"],
      },
      {
        typ: "auswahl", hoertext: D_WETTER,
        frage: "Wann kann es regnen?",
        optionen: ["am Nachmittag", "am Vormittag", "am Abend"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch", hoertext: D_WETTER,
        frage: "Das Wetter heute: Richtig oder falsch?",
        aussagen: [
          ["Am Vormittag ist es sonnig.", true],
          ["Es wird 14 Grad warm.", false],
          ["Der Wind kommt aus dem Norden.", true],
          ["Am Abend regnet es stark.", false],
        ],
      },
    ],
  },
];

/** Bei Nerea: Reisende beraten (die Durchsagen noch einmal anhören und Fragen beantworten) */
export const REISENDE = [
  {
    typ: "auswahl", hoertext: D_FAEHRE,
    frage: "Ein Mann mit Koffer: „Ich will mit der Fähre um 10:15 nach Kalmos. Muss ich zu Steg 3?“",
    optionen: [
      "Nein, die Fähre fährt heute von Steg 5. Und sie hat etwa 20 Minuten Verspätung.",
      "Ja, genau, Steg 3. Die Fähre ist pünktlich.",
      "Nein, die Fähre fällt heute aus.",
    ],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: D_FUNDSACHE,
    frage: "Ein Mädchen weint: „Ich habe meinen blauen Rucksack verloren! Es ist schon 19 Uhr …“",
    optionen: [
      "Keine Sorge! Er wurde gefunden. Jetzt ist er im Hafenbüro.",
      "Geh schnell zum Kiosk, dort ist er bis 20 Uhr.",
      "Ein Rucksack wurde leider nicht gefunden.",
    ],
    richtig: 0,
    erklaerung: "Bis 18 Uhr ist der Rucksack am Kiosk, danach im Hafenbüro. Um 19 Uhr also: Hafenbüro!",
  },
  {
    typ: "auswahl", hoertext: D_SPERRUNG,
    frage: "Eine Frau mit Fahrrad: „Wie komme ich zum Nordkai?“",
    optionen: [
      "Der Weg am Nordkai ist gesperrt. Nehmen Sie die Brücke beim Fischmarkt und schieben Sie Ihr Fahrrad.",
      "Fahren Sie einfach geradeaus über den Nordkai.",
      "Der Nordkai ist heute geschlossen, kommen Sie morgen wieder.",
    ],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: D_RUNDFAHRT,
    frage: "Ein Lehrer mit seiner Klasse: „Wir haben noch keine Tickets für die Rundfahrt. Können wir sie online kaufen?“",
    optionen: [
      "Nein, Tickets gibt es nur noch im Hafenbüro. Und die Rundfahrt beginnt schon um 14:30 Uhr am Leuchtturm.",
      "Ja, online ist kein Problem. Die Fahrt beginnt um 15 Uhr.",
      "Tickets gibt es am Kiosk beim Fischmarkt.",
    ],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: D_WETTER,
    frage: "Ein Fischer fragt: „Soll ich heute Nachmittag mit meinem kleinen Boot rausfahren?“",
    optionen: [
      "Lieber nicht: Am Nachmittag kommt Wind aus dem Norden und es kann regnen.",
      "Ja, am Nachmittag ist es sonnig und ruhig.",
      "Nur am Abend gibt es Wind.",
    ],
    richtig: 0,
  },
];
