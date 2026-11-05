// Lythara – Quest 1: Die Schriftrolle des Beobachters (Lernziel: Einleitung schreiben)
// Dungeon: Die Halle der Tausend Tore · Bosskampf: Der Torwächter der Quellen
// Grundlage: Jonas' Forumsbeitrag (texte.js → nachricht_reisender)

const TEXT = "nachricht_reisender";

export const TORE = {
  tor1: {
    name: "Das Tor des Themas",
    inschrift: "Nenne das Thema, und ich öffne mich.",
    aufgaben: [
      {
        typ: "auswahl", lesetext: TEXT,
        frage: "Worum geht es in dem Text von Jonas?",
        optionen: ["um ein Praktikum im Ausland", "um eine Reise nach Hamburg", "um neue Rezepte aus Wien"],
        richtig: 0,
        erklaerung: "Das Thema ist das Praktikum im Ausland. Rezepte und Wien sind nur Details.",
      },
      {
        typ: "luecke",
        frage: "Ergänze das Redemittel.",
        text: "In dem Beitrag {geht} es {um} ein Praktikum im Ausland.",
        auswahl: true,
        ablenker: ["ist", "über", "von", "gibt"],
        erklaerung: "Redemittel: In dem Text / Beitrag geht es um …",
      },
      {
        typ: "auswahl",
        frage: "Welcher Satz nennt das Thema?",
        optionen: ["Der Text handelt von einem Praktikum im Ausland.", "Jonas ist 17 Jahre alt.", "Ich finde Praktika gut."],
        richtig: 0,
        erklaerung: "Redemittel: Der Text handelt von … · Das Thema des Textes ist …",
      },
    ],
  },

  tor2: {
    name: "Das Tor der Quellen",
    inschrift: "Sag mir, woher dein Wissen kommt.",
    aufgaben: [
      {
        typ: "auswahl", lesetext: TEXT,
        frage: "Welcher Satz nennt die Quelle?",
        optionen: [
          "Ich habe im Forum des Jugendmagazins „Startklar“ einen Beitrag gelesen.",
          "Ich finde das Thema sehr interessant.",
          "Hallo zusammen, wie geht es euch?",
        ],
        richtig: 0,
        erklaerung: "Die Quelle sagt, wo du den Text gefunden hast: in einer Zeitung, einem Magazin, einem Forum …",
      },
      {
        typ: "ordnen",
        frage: "Bau den Satz.",
        teile: ["Ich", "habe", "im Forum von „Startklar“", "einen Beitrag", "gelesen."],
        loesungen: ["Im Forum von „Startklar“ habe ich einen Beitrag gelesen."],
        erklaerung: "Perfekt: ich habe … gelesen. Das Partizip (gelesen) steht am Ende.",
      },
      {
        typ: "luecke",
        frage: "Schreib die fehlenden Wörter.",
        text: "Vor kurzem habe ich im Internet einen interessanten Text {gelesen}.\nDer Beitrag {stammt|kommt|ist} aus dem Magazin „Startklar“.",
        erklaerung: "lesen → gelesen · Der Text stammt aus … / kommt aus …",
      },
    ],
  },

  tor3: {
    name: "Das Tor des Interesses",
    inschrift: "Warum kümmert dich dieses Thema?",
    aufgaben: [
      {
        typ: "auswahl",
        frage: "Welcher Satz sagt, warum dich das Thema interessiert?",
        optionen: [
          "Das Thema interessiert mich, weil ich bald selbst ein Praktikum mache.",
          "Jonas arbeitet in einem Hotel in Wien.",
          "Der Text ist im Magazin „Startklar“ erschienen.",
        ],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "Welcher Satz ist grammatisch richtig?",
        optionen: [
          "Das Thema ist wichtig für mich, weil ich im Ausland arbeiten möchte.",
          "Das Thema ist wichtig für mich, weil ich möchte im Ausland arbeiten.",
          "Das Thema ist wichtig für mich, weil möchte ich im Ausland arbeiten.",
        ],
        richtig: 0,
        erklaerung: "Nach „weil“ steht das konjugierte Verb (möchte) am Ende.",
      },
      {
        typ: "ordnen",
        frage: "Bau den Satz.",
        teile: ["Ich", "finde", "das Thema", "spannend,", "weil", "ich", "eine Ausbildung", "mache."],
        erklaerung: "Hauptsatz + Nebensatz mit „weil“: Das Verb (mache) steht am Ende.",
      },
    ],
  },

  tor4: {
    name: "Das Tor der Leser",
    inschrift: "Sprich zu denen, die dich lesen.",
    aufgaben: [
      {
        typ: "auswahl",
        frage: "Du schreibst einen Beitrag im Forum. Wie beginnst du?",
        optionen: ["Hallo zusammen,", "Sehr geehrte Damen und Herren,", "Lieber Herr Jonas,"],
        richtig: 0,
        erklaerung: "Im Forum schreibt man informell: Hallo zusammen, · Hallo Jonas, · Liebe Forumsmitglieder,",
      },
      {
        typ: "zuordnen",
        frage: "Welche Anrede passt?",
        paare: [
          ["Beitrag in einem Forum für Jugendliche", "Hallo zusammen,"],
          ["Bewerbung bei einer Firma", "Sehr geehrte Damen und Herren,"],
          ["E-Mail an eine Freundin", "Liebe Anna,"],
          ["Brief an deinen Lehrer", "Sehr geehrter Herr Kaya,"],
        ],
      },
      {
        typ: "auswahl",
        frage: "Welcher Satz macht Lust zum Weiterlesen?",
        optionen: ["Habt ihr schon einmal im Ausland gearbeitet? Dann lest weiter!", "Das ist mein Text.", "Jetzt kommt die Einleitung."],
        richtig: 0,
        erklaerung: "Eine Frage an die Leser macht neugierig.",
      },
    ],
  },

  tor5: {
    name: "Das Tor der Überschrift",
    inschrift: "Gib deinem Text einen Namen.",
    aufgaben: [
      {
        typ: "auswahl",
        frage: "Welche Überschrift passt am besten zu deinem Forumsbeitrag?",
        optionen: ["Praktikum im Ausland: Chance oder Stress?", "Mein Text", "Jonas, 17 Jahre, Hamburg, Koch, Wien, Hotel"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch",
        frage: "Was stimmt? Eine gute Überschrift …",
        aussagen: [
          ["… ist kurz.", true],
          ["… nennt das Thema.", true],
          ["… ist ein langer Satz mit 30 Wörtern.", false],
          ["… kann auch eine Frage sein.", true],
          ["… steht am Ende des Textes.", false],
        ],
      },
    ],
  },
};

export const EINLEITUNG = {
  typ: "freitext",
  id: "lythara_einleitung",
  lesetext: TEXT,
  frage: "Schreibe jetzt deine eigene Einleitung für einen Forumsbeitrag zu Jonas' Text: eine Überschrift (erste Zeile), eine Anrede und 3–4 Sätze.",
  minWoerter: 35,
  stichpunkte: "Redemittel: Hallo zusammen, … · Ich habe im Forum von „Startklar“ einen Beitrag von Jonas gelesen. · In dem Beitrag geht es um … · Das Thema interessiert mich, weil … · Habt ihr …? Dann lest weiter!",
  muster: [
    { such: "^\\s*[^\\n]{3,80}\\n", ok: "Du hast eine Überschrift (erste Zeile).", fehlt: "Schreibe in die erste Zeile eine Überschrift." },
    { such: "hallo|liebe|hi\\b", ok: "Du sprichst die Leser an.", fehlt: "Sprich die Leser an: Hallo zusammen, …" },
    { such: "geht es um|handelt von|thema", ok: "Du nennst das Thema.", fehlt: "Nenne das Thema: In dem Beitrag geht es um …" },
    { such: "gelesen|startklar|forum|magazin", ok: "Du nennst die Quelle.", fehlt: "Nenne die Quelle: Ich habe im Forum … gelesen." },
    { such: "weil|denn|interessiert mich|wichtig für mich", ok: "Du begründest dein Interesse.", fehlt: "Sag, warum dich das Thema interessiert: … weil …" },
    { such: "\\?", ok: "Du stellst den Lesern eine Frage.", fehlt: "Tipp: Eine Frage an die Leser macht Lust zum Weiterlesen." },
  ],
  checkliste: [
    "Meine Einleitung hat eine Überschrift.",
    "Ich spreche die Leserinnen und Leser an.",
    "Ich nenne das Thema und die Quelle.",
    "Ich sage, warum mich das Thema interessiert.",
    "Nach „weil“ steht das Verb am Ende.",
  ],
};

export const TORWAECHTER = {
  name: "Der Torwächter der Quellen",
  lp: 100,
  schaden: 20,
  einleitung: "Halt! Ich bin der Torwächter der Quellen. Niemand kommt an mir vorbei, der nicht weiß, wie man einen Text vorstellt. Beantworte meine Fragen!",
  spott: [
    "Woher kommt dein Wissen?",
    "Ohne Quelle bist du nichts!",
    "Meine Fragen sind älter als die Bibliothek!",
    "Warum sollte dir jemand zuhören?",
    "Zeig mir, was du gelernt hast!",
  ],
  sieg: [
    "Der Torwächter senkt seinen Stab.",
    "„Du kennst die Kunst der Einleitung. Nimm die Rolle des Beobachters – sie gehört dir.“",
  ],
  niederlage: [
    "„Du bist noch nicht bereit.“",
    "Der Torwächter schickt dich zurück. Lies Jonas' Text noch einmal und versuch es dann wieder!",
  ],
  fragen: [
    {
      typ: "auswahl",
      frage: "„Wo hast du den Text gefunden?“",
      optionen: [
        "Ich habe den Beitrag im Forum des Magazins „Startklar“ gelesen.",
        "Ich habe den Text gut gefunden.",
        "Ich finde, der Text ist lang.",
      ],
      richtig: 0,
      erklaerung: "Er fragt nach der Quelle: Wo hast du den Text gelesen?",
    },
    {
      typ: "auswahl",
      frage: "„Warum interessiert dich das Thema?“",
      optionen: ["Weil ich nächstes Jahr selbst ein Praktikum mache.", "Weil ich mache nächstes Jahr ein Praktikum.", "Weil Jonas Koch ist."],
      richtig: 0,
      erklaerung: "Persönliches Interesse + Verb am Ende nach „weil“.",
    },
    {
      typ: "auswahl",
      frage: "„Warum sollen andere deinen Beitrag lesen?“",
      optionen: ["Weil das Thema für alle Azubis wichtig ist.", "Weil mein Text sehr lang ist.", "Weil ich keine Zeit habe."],
      richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Mit welchen Worten beginnst du einen Forumsbeitrag?“",
      optionen: ["Hallo zusammen,", "Sehr geehrte Damen und Herren,", "Tschüss und bis bald!"],
      richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Worum geht es in Jonas' Beitrag?“",
      optionen: [
        "Um die Frage, ob ein Praktikum im Ausland sinnvoll ist.",
        "Um das Wetter in Wien.",
        "Um die Geschichte von Hamburg.",
      ],
      richtig: 0,
    },
    {
      typ: "luecke",
      frage: "„Vervollständige meinen Spruch!“",
      text: "In dem Beitrag {geht} es um ein Praktikum im Ausland.",
      auswahl: true,
      ablenker: ["gibt", "ist", "macht"],
    },
    {
      typ: "auswahl",
      frage: "„Welche Überschrift würdest du wählen?“",
      optionen: ["Ins Ausland – ja oder nein?", "Text", "Ein sehr langer Satz über ein Praktikum, das Jonas in Wien gemacht hat"],
      richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Welcher Satz ist richtig?“",
      optionen: ["Ich habe einen Artikel gelesen.", "Ich habe einen Artikel gelest.", "Ich bin einen Artikel gelesen."],
      richtig: 0,
      erklaerung: "lesen → ich habe gelesen",
    },
    {
      typ: "auswahl",
      frage: "„Was gehört NICHT in eine Einleitung?“",
      optionen: ["eine lange Geschichte über deinen Urlaub", "das Thema", "die Quelle"],
      richtig: 0,
    },
    {
      typ: "ordnen",
      frage: "„Bau diesen Satz, wenn du kannst!“",
      teile: ["Das Thema", "interessiert", "mich,", "weil", "ich", "Koch", "werden", "möchte."],
      erklaerung: "Nach „weil“: … werden möchte. Das konjugierte Verb steht ganz am Ende.",
    },
  ],
};
