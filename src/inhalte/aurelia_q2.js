// Aurelia – Quest 2: Gespräche am Markt (Hören: Alltagsgespräche mit zwei Personen)
// Drei Gespräche an den Ständen der Agora, danach die „Ohrenprobe“ bei Marktaufseherin Ione:
// kurze Szenen hören und erkennen, wo die Personen sind.
// Lernziel: Wer will was? Situation, Wünsche, Preise, Mengen, Zeiten und Lösungen verstehen.
// Alle Texte sind eigene Texte. Gespräche: teile = [{ sprecher, text, stimme }] (siehe src/ui/hoeren.js).

const FRAU = { tonhoehe: 1.25, tempo: 0.88 };
const FRAU2 = { tonhoehe: 1.05, tempo: 0.9 };
const MANN = { tonhoehe: 0.8, tempo: 0.88 };
const MANN2 = { tonhoehe: 0.95, tempo: 0.92 };

export const G_OBST = {
  sprecher: "Am Obststand von Daphne",
  teile: [
    { sprecher: "Kunde", stimme: MANN, text: "Guten Morgen! Was kosten die Feigen?" },
    { sprecher: "Daphne", stimme: FRAU, text: "Ein Kilo kostet vier Euro. Aber heute gibt es ein Angebot: zwei Kilo für sieben Euro." },
    { sprecher: "Kunde", stimme: MANN, text: "Hm, zwei Kilo sind zu viel. Ich nehme ein halbes Kilo Feigen und ein Kilo Tomaten." },
    { sprecher: "Daphne", stimme: FRAU, text: "Gern. Die Tomaten kosten zwei Euro fünfzig. Zusammen macht das vier Euro fünfzig." },
    { sprecher: "Kunde", stimme: MANN, text: "Hier sind fünf Euro. Ach, haben Sie auch Basilikum?" },
    { sprecher: "Daphne", stimme: FRAU, text: "Nein, leider nicht mehr. Aber morgen früh bekomme ich frischen." },
  ],
};

export const G_FISCH = {
  sprecher: "Am Fischstand von Ilias",
  teile: [
    { sprecher: "Köchin", stimme: FRAU2, text: "Hallo Ilias! Ich brauche für heute Abend Fisch für mein Restaurant. Wir haben eine große Gruppe, dreißig Gäste." },
    { sprecher: "Ilias", stimme: MANN, text: "Dreißig Gäste! Wie viel Fisch brauchst du denn?" },
    { sprecher: "Köchin", stimme: FRAU2, text: "Ungefähr acht Kilo. Am liebsten Dorade." },
    { sprecher: "Ilias", stimme: MANN, text: "Dorade habe ich heute nur fünf Kilo. Aber ich habe sehr guten Thunfisch." },
    { sprecher: "Köchin", stimme: FRAU2, text: "Gut, dann nehme ich fünf Kilo Dorade und drei Kilo Thunfisch. Kannst du alles um vier Uhr ins Restaurant bringen?" },
    { sprecher: "Ilias", stimme: MANN, text: "Um vier geht es nicht, da bin ich noch mit dem Boot draußen. Geht es um halb sechs?" },
    { sprecher: "Köchin", stimme: FRAU2, text: "Das ist knapp, aber okay. Bis später!" },
  ],
};

export const G_VASE = {
  sprecher: "Am Stand von Töpfer Kleon",
  teile: [
    { sprecher: "Touristin", stimme: FRAU, text: "Entschuldigung, ich habe gestern diese Vase bei Ihnen gekauft. Aber sehen Sie, hier unten ist ein Riss." },
    { sprecher: "Kleon", stimme: MANN2, text: "Oh, das tut mir leid. Haben Sie den Kassenzettel?" },
    { sprecher: "Touristin", stimme: FRAU, text: "Ja, hier ist er." },
    { sprecher: "Kleon", stimme: MANN2, text: "Sie können eine neue Vase bekommen oder Ihr Geld zurück." },
    { sprecher: "Touristin", stimme: FRAU, text: "Ich möchte lieber eine neue, aber in Blau, nicht in Rot." },
    { sprecher: "Kleon", stimme: MANN2, text: "Blaue Vasen habe ich leider erst wieder am Samstag. Kommen Sie am Samstag vorbei?" },
    { sprecher: "Touristin", stimme: FRAU, text: "Am Samstag fliege ich nach Hause. Dann nehme ich doch das Geld zurück." },
  ],
};

/** Die drei Gespräche an den Ständen */
export const GESPRAECHE = [
  {
    id: "aurelia_q2_g1", haendler: "npc_daphne", name: "Händlerin Daphne", titel: "Am Obststand",
    einleitung: "Kalimera! Ich bin Daphne. Hör mal, was mein Kunde gerade gesagt hat – ich habe es selbst nicht richtig verstanden!",
    danach: "Genau so war es! Danke. Jetzt weiß ich wieder, was ich verkauft habe.",
    aufgaben: [
      {
        typ: "auswahl", hoertext: G_OBST,
        frage: "Was kauft der Kunde?",
        optionen: ["ein halbes Kilo Feigen und ein Kilo Tomaten", "zwei Kilo Feigen", "ein Kilo Feigen und Basilikum"],
        richtig: 0,
        erklaerung: "Das Angebot (zwei Kilo für sieben Euro) ist ihm zu viel.",
      },
      {
        typ: "auswahl", hoertext: G_OBST,
        frage: "Wie viel muss der Kunde bezahlen?",
        optionen: ["4,50 €", "5,00 €", "7,00 €"],
        richtig: 0,
        erklaerung: "Er gibt fünf Euro, aber er muss nur vier Euro fünfzig bezahlen.",
      },
      {
        typ: "richtigfalsch", hoertext: G_OBST,
        frage: "Was hast du gehört? Richtig oder falsch?",
        aussagen: [
          ["Ein Kilo Feigen kostet vier Euro.", true],
          ["Heute gibt es ein Angebot für Feigen.", true],
          ["Daphne hat noch Basilikum.", false],
          ["Morgen früh gibt es wieder frischen Basilikum.", true],
        ],
      },
    ],
  },
  {
    id: "aurelia_q2_g2", haendler: "npc_ilias", name: "Fischer Ilias", titel: "Am Fischstand",
    einleitung: "Ahoi! Ich bin Ilias. Eben war eine Köchin hier und hat eine große Bestellung gemacht. Hast du zugehört?",
    danach: "Fünf Kilo Dorade, drei Kilo Thunfisch, halb sechs. Richtig! Jetzt muss ich mich beeilen.",
    aufgaben: [
      {
        typ: "auswahl", hoertext: G_FISCH,
        frage: "Warum braucht die Köchin so viel Fisch?",
        optionen: ["Heute Abend kommt eine Gruppe mit dreißig Gästen.", "Sie macht ein Fest für ihre Familie.", "Ihr Restaurant ist neu."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: G_FISCH,
        frage: "Was bestellt sie am Ende?",
        optionen: ["fünf Kilo Dorade und drei Kilo Thunfisch", "acht Kilo Dorade", "acht Kilo Thunfisch"],
        richtig: 0,
        erklaerung: "Sie wollte acht Kilo Dorade, aber Ilias hat nur fünf Kilo. Darum nimmt sie noch Thunfisch dazu.",
      },
      {
        typ: "auswahl", hoertext: G_FISCH,
        frage: "Wann bringt Ilias den Fisch ins Restaurant?",
        optionen: ["um 17:30 Uhr", "um 16:00 Uhr", "um 15:30 Uhr"],
        richtig: 0,
        erklaerung: "„um halb sechs“ = 17:30 Uhr. Um vier Uhr ist er noch mit dem Boot draußen.",
      },
      {
        typ: "auswahl", hoertext: G_FISCH,
        frage: "Warum kann Ilias nicht um vier Uhr kommen?",
        optionen: ["Er ist noch mit dem Boot auf dem Meer.", "Er hat keinen Thunfisch mehr.", "Das Restaurant ist dann geschlossen."],
        richtig: 0,
      },
    ],
  },
  {
    id: "aurelia_q2_g3", haendler: "npc_kleon", name: "Töpfer Kleon", titel: "Am Töpferstand",
    einleitung: "Guten Tag, ich bin Kleon, der Töpfer. Eine Touristin hatte eine Reklamation. Was wollte sie eigentlich?",
    danach: "Ja, so war es. Schade, dass sie am Samstag schon abreist. Danke fürs Zuhören!",
    aufgaben: [
      {
        typ: "auswahl", hoertext: G_VASE,
        frage: "Was ist das Problem mit der Vase?",
        optionen: ["Sie hat unten einen Riss.", "Sie hat die falsche Farbe.", "Sie war zu teuer."],
        richtig: 0,
      },
      {
        typ: "auswahl", hoertext: G_VASE,
        frage: "Was möchte die Touristin zuerst?",
        optionen: ["eine neue Vase in Blau", "eine neue Vase in Rot", "ihr Geld zurück"],
        richtig: 0,
      },
      {
        typ: "richtigfalsch", hoertext: G_VASE,
        frage: "Richtig oder falsch?",
        aussagen: [
          ["Die Touristin hat die Vase gestern gekauft.", true],
          ["Sie hat keinen Kassenzettel.", false],
          ["Kleon hat heute blaue Vasen.", false],
          ["Am Samstag fliegt die Touristin nach Hause.", true],
        ],
      },
      {
        typ: "auswahl", hoertext: G_VASE,
        frage: "Wie endet das Gespräch?",
        optionen: ["Die Touristin bekommt ihr Geld zurück.", "Sie kommt am Samstag wieder.", "Sie nimmt die rote Vase."],
        richtig: 0,
        erklaerung: "Achte auf das Ende eines Gesprächs: „Dann nehme ich doch das Geld zurück.“ Die Meinung kann sich im Gespräch ändern!",
      },
    ],
  },
];

// ---------- Ohrenprobe bei Ione: Wo sind die Personen? ----------

const szene = (sprecherA, a, sprecherB, b) => ({
  sprecher: "Kurzes Gespräch",
  teile: [{ sprecher: sprecherA, stimme: FRAU2, text: a }, { sprecher: sprecherB, stimme: MANN2, text: b }],
});

export const OHRENPROBE = [
  {
    typ: "auswahl", hoertext: szene("Frau", "Zwei Kugeln Zitrone und eine Kugel Vanille, bitte.", "Verkäufer", "Gern. In der Waffel oder im Becher?"),
    frage: "Wo sind die Personen?",
    optionen: ["an einem Eisstand", "in einer Bäckerei", "in einem Restaurant"],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: szene("Kontrolleurin", "Guten Tag, Ihr Ticket bitte.", "Mann", "Moment, ich habe es auf dem Handy. Hier, bitte. Wann kommen wir in Kalmos an?"),
    frage: "Wo sind die Personen?",
    optionen: ["auf der Fähre", "im Kino", "am Marktstand"],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: szene("Kundin", "Haben Sie diese Sandalen auch in Größe neununddreißig?", "Verkäufer", "Einen Moment, ich schaue im Lager nach."),
    frage: "Wo sind die Personen?",
    optionen: ["in einem Schuhgeschäft", "in einer Apotheke", "in einem Hotel"],
    richtig: 0,
  },
  {
    typ: "auswahl", hoertext: szene("Ärztin", "Wo tut es denn weh?", "Junge", "Hier, am Knie. Ich bin heute Morgen auf der Treppe gefallen."),
    frage: "Wo sind die Personen?",
    optionen: ["in einer Arztpraxis", "in einer Schule", "auf dem Sportplatz"],
    richtig: 0,
  },
  {
    typ: "zuordnen",
    frage: "Wer wollte was? Erinnere dich an die Gespräche am Markt.",
    paare: [
      ["der Kunde von Daphne", "Feigen und Tomaten"],
      ["die Köchin bei Ilias", "Fisch für dreißig Gäste"],
      ["die Touristin bei Kleon", "eine blaue Vase oder ihr Geld"],
    ],
  },
];
