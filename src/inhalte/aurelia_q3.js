// Aurelia – Quest 3: Das Licht des Leuchtturms (Hören: Nachrichten auf dem Anrufbeantworter)
// Der Sturm hat die Klangperlen aus dem Muschelfon von Leuchtturmwärter Talos geweht.
// Auf jeder Perle sind zwei Nachrichten. Danach hilft man Talos mit seinem Notizbuch:
// Telefonnotizen ergänzen, entscheiden, was zuerst zu tun ist und wen er zurückrufen muss.
// Lernziel: Telefonnachrichten verstehen – Wer ruft an? Was will die Person? Was soll man tun?
//           Zahlen, Uhrzeiten, Tage und Telefonnummern heraushören.
// Alle Texte sind eigene Texte. Für eigene Aufnahmen: datei: "Sound/hoeren/<name>.mp3" ergänzen.

const FRAU = { tonhoehe: 1.2, tempo: 0.88 };
const FRAU2 = { tonhoehe: 1.05, tempo: 0.86 };
const MAEDCHEN = { tonhoehe: 1.4, tempo: 0.95 };
const MANN = { tonhoehe: 0.8, tempo: 0.88 };
const MANN2 = { tonhoehe: 0.95, tempo: 0.86 };

const nachricht = (nr, stimme, text) => ({ sprecher: `Muschelfon – Nachricht ${nr}`, piep: true, stimme, text });

export const N_NEREA = nachricht(1, FRAU,
  "Hallo Talos, hier ist Nerea vom Hafen. Es ist Montag, kurz nach zwölf. Ich habe eine wichtige Nachricht: Heute Nacht kommt ein starker Sturm. Die Boote bleiben im Hafen. Bitte mach das Licht heute schon um sechs Uhr an, nicht erst um acht. Danke! Du musst mich nicht zurückrufen, ich bin den ganzen Nachmittag auf der Fähre.");

export const N_KOSTA = nachricht(2, MANN2,
  "Guten Tag, Herr Talos, hier ist Kosta von der Lampenwerkstatt. Die neue Lampe für Ihren Leuchtturm ist fertig. Sie können sie ab Donnerstag abholen. Wir haben von acht bis dreizehn Uhr geöffnet. Am Freitag ist die Werkstatt geschlossen. Die Lampe kostet hundertzwanzig Euro. Auf Wiederhören!");

export const N_ILIAS = nachricht(3, MANN,
  "Talos, hier ist Ilias. Ich bin noch mit meinem Boot draußen bei der Insel Kalmos. Der Motor ist kaputt, ich kann nur ganz langsam fahren. Ich bin erst um neun Uhr im Hafen, vielleicht auch später. Bitte lass das Licht an, bis ich da bin! Ich habe hier keinen Empfang, du kannst mich nicht anrufen.");

export const N_LENI = nachricht(4, MAEDCHEN,
  "Hallo Onkel Talos, hier ist Leni! Ich komme dich am Samstag besuchen. Ich nehme die Fähre um elf Uhr vierzig, dann bin ich um halb eins in Aurelia. Kannst du mich am Steg abholen? Ach ja, ich bringe meinen Hund Pippo mit. Ist das okay? Ruf mich bitte zurück. Meine Nummer ist null eins sieben eins, vier fünf, sechs zwei, acht drei. Tschüss!");

export const N_PRAXIS = nachricht(5, FRAU2,
  "Guten Tag, hier ist die Praxis Doktor Andreou. Wir müssen Ihren Termin am Dienstag um Viertel nach neun leider absagen. Die Ärztin ist krank. Wir haben einen neuen Termin für Sie: am Mittwoch um halb elf. Wenn das nicht passt, rufen Sie uns bitte an. Unsere Nummer ist zwei, drei, vier, fünf, sechs. Vielen Dank.");

export const N_PETROU = nachricht(6, FRAU,
  "Guten Morgen, mein Name ist Petrou. Ich bin Lehrerin an der Hafenschule. Meine Klasse möchte gern den Leuchtturm besichtigen. Wir sind vierundzwanzig Schülerinnen und Schüler. Geht das am nächsten Montag um zehn Uhr? Und kostet die Führung etwas? Bitte rufen Sie mich zurück, am besten nach vierzehn Uhr. Vielen Dank!");

/** Die drei Klangperlen (je zwei Nachrichten) */
export const PERLEN = [
  {
    id: "aurelia_q3_p1",
    name: "Klangperle am Leuchtturm",
    fundort: "Die Perle liegt zwischen den Felsen an der Spitze der Landzunge.",
    aufgaben: [
      {
        typ: "auswahl", hoertext: N_NEREA,
        frage: "Warum ruft Nerea an?",
        optionen: ["Heute Nacht kommt ein Sturm.", "Die Fähre hat Verspätung.", "Sie möchte den Leuchtturm besichtigen."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_NEREA,
        frage: "Wann soll Talos heute das Licht anmachen?",
        optionen: ["um 18 Uhr", "um 20 Uhr", "um 12 Uhr"],
        richtig: 0,
        erklaerung: "„schon um sechs Uhr, nicht erst um acht“ – am Abend ist sechs Uhr = 18 Uhr.",
      },
      {
        typ: "auswahl", hoertext: N_NEREA,
        frage: "Muss Talos Nerea zurückrufen?",
        optionen: ["Nein, sie ist am Nachmittag auf der Fähre.", "Ja, sofort.", "Ja, nach sechs Uhr."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_KOSTA,
        frage: "Wer ruft an?",
        optionen: ["ein Mann von der Lampenwerkstatt", "ein Fischer", "ein Arzt"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch", hoertext: N_KOSTA,
        frage: "Richtig oder falsch?",
        aussagen: [
          ["Die neue Lampe ist fertig.", true],
          ["Talos kann die Lampe schon am Montag abholen.", false],
          ["Die Werkstatt ist am Vormittag geöffnet.", true],
          ["Am Freitag kann Talos die Lampe abholen.", false],
        ],
      },
    ],
  },
  {
    id: "aurelia_q3_p2",
    name: "Klangperle am Kai",
    fundort: "Die Perle liegt am Kai, ganz nah bei Steg 5.",
    aufgaben: [
      {
        typ: "auswahl", hoertext: N_ILIAS,
        frage: "Was ist das Problem von Ilias?",
        optionen: ["Der Motor von seinem Boot ist kaputt.", "Er hat keinen Fisch gefangen.", "Er hat sein Handy verloren."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_ILIAS,
        frage: "Was soll Talos für Ilias tun?",
        optionen: ["das Licht anlassen, bis Ilias im Hafen ist", "ihn sofort anrufen", "mit einem Boot zur Insel fahren"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_ILIAS,
        frage: "Wann kommt Ilias ungefähr im Hafen an?",
        optionen: ["um 21 Uhr oder später", "um 19 Uhr", "erst morgen früh"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_LENI,
        frage: "Wann kommt Leni in Aurelia an?",
        optionen: ["am Samstag um 12:30 Uhr", "am Samstag um 11:40 Uhr", "am Sonntag um 12:30 Uhr"],
        richtig: 0,
        erklaerung: "Um 11:40 Uhr fährt die Fähre ab. In Aurelia ist Leni um halb eins (12:30 Uhr).",
      },
      {
        typ: "auswahl", hoertext: N_LENI,
        frage: "Wie ist Lenis Telefonnummer?",
        optionen: ["0171 45 62 83", "0171 54 26 38", "0117 45 62 83"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_LENI,
        frage: "Was bringt Leni mit?",
        optionen: ["ihren Hund", "ihre Katze", "ihre Freundin"],
        richtig: 0,
      },
    ],
  },
  {
    id: "aurelia_q3_p3",
    name: "Klangperle unter den Zypressen",
    fundort: "Die Perle liegt unter einer Zypresse bei der Stadtmauer im Nordosten.",
    aufgaben: [
      {
        typ: "auswahl", hoertext: N_PRAXIS,
        frage: "Warum ruft die Praxis an?",
        optionen: ["Der Termin am Dienstag fällt aus.", "Talos hat seinen Termin vergessen.", "Die Praxis hat neue Öffnungszeiten."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_PRAXIS,
        frage: "Wann ist der neue Termin?",
        optionen: ["Mittwoch, 10:30 Uhr", "Dienstag, 9:15 Uhr", "Mittwoch, 9:30 Uhr"],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: N_PRAXIS,
        frage: "Wann soll Talos die Praxis anrufen?",
        optionen: ["nur wenn der neue Termin nicht passt", "auf jeden Fall heute", "am Dienstag um 9:15 Uhr"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch", hoertext: N_PETROU,
        frage: "Richtig oder falsch?",
        aussagen: [
          ["Frau Petrou ist Lehrerin.", true],
          ["Die Klasse möchte den Leuchtturm besichtigen.", true],
          ["Die Klasse hat 34 Schülerinnen und Schüler.", false],
          ["Frau Petrou möchte wissen, ob die Führung etwas kostet.", true],
        ],
      },
      {
        typ: "auswahl", hoertext: N_PETROU,
        frage: "Wann soll Talos Frau Petrou zurückrufen?",
        optionen: ["nach 14 Uhr", "vor 10 Uhr", "am Montag um 10 Uhr"],
        richtig: 0,
      },
    ],
  },
];

/** Talos' Notizbuch: das Gehörte ordnen und entscheiden */
export const NOTIZBUCH = [
  {
    typ: "luecke", hoertext: N_LENI,
    frage: "Talos schreibt eine Telefonnotiz. Ergänze sie.",
    text: "Anruf von: {Leni}\nSie kommt am {Samstag} mit der Fähre.\nAnkunft: {12:30} Uhr am Steg\nSie bringt ihren {Hund} mit.\nRückruf: 0171 45 62 83",
    auswahl: true,
    ablenker: ["Nerea", "Sonntag", "11:40", "Katze"],
  },
  {
    typ: "luecke", hoertext: N_KOSTA,
    frage: "Noch eine Telefonnotiz. Ergänze sie.",
    text: "Lampenwerkstatt (Kosta): Lampe ist fertig.\nAbholen ab {Donnerstag}, von 8 bis {13} Uhr.\nNicht am {Freitag}!\nPreis: {120} Euro",
    auswahl: true,
    ablenker: ["Montag", "18", "Samstag", "220"],
  },
  {
    typ: "auswahl",
    frage: "Es ist Montagnachmittag. Was muss Talos heute als Erstes tun?",
    optionen: [
      "Um 18 Uhr das Licht anmachen und anlassen, bis Ilias im Hafen ist.",
      "Die neue Lampe in der Werkstatt abholen.",
      "Leni am Steg abholen.",
    ],
    richtig: 0,
    erklaerung: "Der Sturm kommt heute Nacht, und Ilias ist noch auf dem Meer. Die Lampe gibt es erst ab Donnerstag, Leni kommt am Samstag.",
  },
  {
    typ: "zuordnen",
    frage: "Wer hat angerufen? Was möchte die Person?",
    paare: [
      ["Nerea", "Das Licht soll früher an sein."],
      ["Kosta", "Die Lampe kann abgeholt werden."],
      ["Ilias", "Das Licht soll lange an bleiben."],
      ["Leni", "Sie möchte abgeholt werden."],
      ["Frau Petrou", "Ihre Klasse möchte eine Führung."],
    ],
  },
  {
    typ: "richtigfalsch",
    frage: "Wen muss Talos zurückrufen? Richtig = Rückruf nötig.",
    aussagen: [
      ["Nerea", false],
      ["Ilias", false],
      ["Leni", true],
      ["Frau Petrou", true],
    ],
    erklaerung: "Nerea ist auf der Fähre, Ilias hat keinen Empfang. Leni und Frau Petrou warten auf eine Antwort.",
  },
];
