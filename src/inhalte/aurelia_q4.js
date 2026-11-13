// Aurelia – Quest 4: Die Werft (Hören: Gespräche am Arbeitsplatz, Interview, Bericht)
// Aufgebaut genau nach dem DSD-I-PRO-Hörverstehen (siehe docs/dsd_pruefung.md):
//   Werkbank        → Teil 1 Alltagsszenen: 5 kurze Dialoge, je EINE Aufgabe A/B/C
//   Azubi Timon     → Teil 3 Interview im Radio: 5 Aussagen richtig/falsch auf einem Blatt
//   Bootsbauerin Daria → Teil 4 Bericht im Radio: 6 Aufgaben A/B/C auf einem Blatt
//   Werftmeisterin Kassia → Die Abnahme im Prüfungsmodus (jeder Text nur zweimal, kein Text zum Einblenden)
// Muster aus dem Modellsatz: Lösung oft am Ende oder nach einer Korrektur, Verneinung im Aufgabenstamm,
// richtige Lösungen umschrieben, Ablenker mit Wörtern aus dem Text.
// Alle Texte sind eigene Texte.

const KASSIA = { tonhoehe: 1.0, tempo: 0.9 };
const TIMON = { tonhoehe: 1.15, tempo: 0.95 };
const DARIA = { tonhoehe: 1.3, tempo: 0.9 };
const NIKO = { tonhoehe: 0.8, tempo: 0.92 };
const KUNDE = { tonhoehe: 0.7, tempo: 0.88 };
const RADIO = { tonhoehe: 1.2, tempo: 0.92 };

const szene = (nr, teile) => ({ sprecher: `Szene ${nr}`, teile });

// ---------- Teil 1: Alltagsszenen an der Werkbank ----------

export const SZENEN = [
  szene(1, [
    { sprecher: "Kassia", stimme: KASSIA, text: "Timon, bring bitte die Schleifmaschine in die Halle." },
    { sprecher: "Timon", stimme: TIMON, text: "Die große aus dem Lager?" },
    { sprecher: "Kassia", stimme: KASSIA, text: "Nein, die kleine aus dem Schrank. Die große ist kaputt. Und vergiss die Schutzbrille nicht!" },
    { sprecher: "Timon", stimme: TIMON, text: "Die habe ich schon auf." },
  ]),
  szene(2, [
    { sprecher: "Timon", stimme: TIMON, text: "Niko, kannst du mir morgen früh zeigen, wie man das Segel näht?" },
    { sprecher: "Niko", stimme: NIKO, text: "Morgen bin ich nicht da, da habe ich Berufsschule. Aber Daria kann das sehr gut. Frag sie doch heute in der Mittagspause." },
    { sprecher: "Timon", stimme: TIMON, text: "Gute Idee, danke!" },
  ]),
  szene(3, [
    { sprecher: "Daria", stimme: DARIA, text: "Kassia, das Holz für den Mast ist immer noch nicht da." },
    { sprecher: "Kassia", stimme: KASSIA, text: "Wirklich? Der Lieferant hat es mir für heute versprochen. Moment … Ach, hier ist eine Nachricht von ihm: Die Lieferung kommt erst am Donnerstag." },
    { sprecher: "Daria", stimme: DARIA, text: "Na gut, dann arbeite ich heute am Deck weiter." },
  ]),
  szene(4, [
    { sprecher: "Timon", stimme: TIMON, text: "Kassia, muss ich am Samstag arbeiten?" },
    { sprecher: "Kassia", stimme: KASSIA, text: "Normalerweise nicht. Aber diesen Samstag ist das Glockenfest, und das Festschiff muss fertig sein. Dafür kannst du am Montag freinehmen." },
    { sprecher: "Timon", stimme: TIMON, text: "Okay, das ist fair." },
  ]),
  szene(5, [
    { sprecher: "Niko", stimme: NIKO, text: "Timon, hast du das Werkzeug schon aufgeräumt?" },
    { sprecher: "Timon", stimme: TIMON, text: "Die Hammer und die Sägen ja. Die Pinsel noch nicht, die muss ich zuerst waschen." },
    { sprecher: "Niko", stimme: NIKO, text: "Aber nicht mit kaltem Wasser, nimm das Mittel aus der grünen Flasche." },
  ]),
];

export const WERKBANK = [
  {
    typ: "auswahl", hoertext: SZENEN[0], frage: "1  Timon soll",
    optionen: ["die kleine Schleifmaschine in die Halle bringen.", "die große Schleifmaschine reparieren.", "eine Schutzbrille aus dem Lager holen."],
    richtig: 0, mischen: false,
    erklaerung: "Timon fragt nach der großen Maschine, aber Kassia korrigiert: „Nein, die kleine.“ Achte auf das Ende!",
  },
  {
    typ: "auswahl", hoertext: SZENEN[1], frage: "2  Timon soll",
    optionen: ["morgen früh mit Niko das Segel nähen.", "heute Daria um Hilfe bitten.", "morgen in die Berufsschule gehen."],
    richtig: 1, mischen: false,
    erklaerung: "Niko hat morgen Berufsschule. Timon soll Daria heute in der Mittagspause fragen.",
  },
  {
    typ: "auswahl", hoertext: SZENEN[2], frage: "3  Das Holz für den Mast",
    optionen: ["ist heute angekommen.", "muss Daria selbst abholen.", "wird später geliefert als geplant."],
    richtig: 2, mischen: false,
    erklaerung: "Es war für heute versprochen, kommt aber erst am Donnerstag – also später als geplant.",
  },
  {
    typ: "auswahl", hoertext: SZENEN[3], frage: "4  Timon",
    optionen: ["hat diesen Samstag frei.", "bekommt am Montag einen freien Tag.", "arbeitet am Montag länger."],
    richtig: 1, mischen: false,
    erklaerung: "„Normalerweise nicht“ – aber diesen Samstag muss er arbeiten. Dafür darf er am Montag freinehmen.",
  },
  {
    typ: "auswahl", hoertext: SZENEN[4], frage: "5  Timon hat … noch nicht aufgeräumt.",
    optionen: ["die Hammer", "die Sägen", "die Pinsel"],
    richtig: 2, mischen: false,
    erklaerung: "Achtung, Verneinung in der Aufgabe! Hammer und Sägen sind aufgeräumt, die Pinsel noch nicht.",
  },
];

// ---------- Teil 3: Interview im Radio (richtig/falsch) ----------

export const INTERVIEW = {
  sprecher: "Radio Muschelwelle: Erste Woche auf der Werft",
  teile: [
    { sprecher: "Moderatorin", stimme: RADIO, text: "Hallo und willkommen bei Radio Muschelwelle! Heute ist Timon bei uns. Er macht seit einer Woche eine Ausbildung zum Bootsbauer auf der Werft von Aurelia. Timon, wolltest du schon immer Bootsbauer werden?" },
    { sprecher: "Timon", stimme: TIMON, text: "Nein, gar nicht. Als Kind wollte ich Fischer werden, wie mein Opa. Auf die Werft bin ich erst durch ein Schulpraktikum gekommen. Da habe ich gemerkt, wie gern ich mit Holz arbeite." },
    { sprecher: "Moderatorin", stimme: RADIO, text: "Und wie war der erste Tag?" },
    { sprecher: "Timon", stimme: TIMON, text: "Ein bisschen leer. Viele Kollegen waren auf einem Kurs in der Nachbarstadt. Ich habe zuerst nur die Meisterin und zwei Kollegen kennengelernt. Die anderen habe ich erst am Mittwoch getroffen." },
    { sprecher: "Moderatorin", stimme: RADIO, text: "Durftest du schon richtig mitarbeiten?" },
    { sprecher: "Timon", stimme: TIMON, text: "Ja, ich habe viel geschliffen und gestrichen. Mit den großen Sägen darf ich aber noch nicht arbeiten. Das geht erst nach dem Sicherheitskurs, und der ist nächsten Monat." },
    { sprecher: "Moderatorin", stimme: RADIO, text: "Musstest du dir besondere Kleidung kaufen?" },
    { sprecher: "Timon", stimme: TIMON, text: "Die Arbeitskleidung bekommen wir von der Werft. Nur die Sicherheitsschuhe musste ich selbst kaufen. Aber die Werft hat mir die Hälfte vom Geld zurückgegeben." },
    { sprecher: "Moderatorin", stimme: RADIO, text: "Und worauf bist du nach dieser Woche stolz?" },
    { sprecher: "Timon", stimme: TIMON, text: "Am Freitag habe ich meinen ersten Hocker aus Holz fertig gebaut. Er wackelt noch ein bisschen, aber er steht jetzt in meinem Zimmer!" },
    { sprecher: "Moderatorin", stimme: RADIO, text: "Super! Viel Erfolg weiterhin, Timon." },
  ],
};

export const INTERVIEW_AUFGABEN = [
  {
    typ: "richtigfalsch", hoertext: INTERVIEW,
    frage: "Lies zuerst die Sätze 10–14. Hör dann das Interview. Richtig oder falsch?",
    aussagen: [
      ["10  Timon wollte schon als Kind auf einer Werft arbeiten.", false],
      ["11  Am ersten Tag hat Timon alle Kollegen kennengelernt.", false],
      ["12  Mit manchen Maschinen darf Timon noch nicht arbeiten.", true],
      ["13  Die Arbeitskleidung musste Timon selbst bezahlen.", false],
      ["14  Timon hat in der ersten Woche schon etwas Eigenes hergestellt.", true],
    ],
    erklaerung: "10: Er wollte Fischer werden. 11: Viele waren auf einem Kurs. 12: Große Sägen erst nach dem Sicherheitskurs. 13: Die Kleidung bekommt er von der Werft, nur die Schuhe hat er (zur Hälfte) selbst bezahlt. 14: Er hat einen Hocker gebaut.",
  },
];

// ---------- Teil 4: Bericht im Radio (A/B/C) ----------

export const BERICHT = {
  sprecher: "Radio Muschelwelle: Daria, Bootsbauerin im dritten Lehrjahr",
  teile: [
    { sprecher: "Moderatorin", stimme: RADIO, text: "Schiffe bauen – das klingt nach Abenteuer. Daria ist im dritten Lehrjahr auf der Werft von Aurelia. Hier erzählt sie von ihrer Ausbildung zur Bootsbauerin." },
    { sprecher: "Daria", stimme: DARIA, text: "Nach der Schule wusste ich lange nicht, was ich machen will. Ich habe erst ein Jahr in einem Café gejobbt. Dann hat mir eine Freundin von der Werft erzählt. Bei uns braucht man keinen bestimmten Schulabschluss. Aber man sollte gut rechnen können, denn wir messen und rechnen den ganzen Tag." },
    { sprecher: "Daria", stimme: DARIA, text: "Viele denken, man geht jede Woche einen Tag in die Berufsschule. Bei uns ist das anders: Wir haben Blockunterricht. Das heißt, wir sind drei Wochen am Stück in der Schule und dann wieder neun Wochen auf der Werft." },
    { sprecher: "Daria", stimme: DARIA, text: "Natürlich arbeiten wir viel mit Holz. Aber die meisten neuen Boote sind heute aus Kunststoff, und das lernen wir auch. Alte Schiffe reparieren wir manchmal, aber das ist eher selten." },
    { sprecher: "Daria", stimme: DARIA, text: "Im Winter arbeiten wir oft draußen am Kai. Da wird es richtig kalt, und manche Kollegen beschweren sich. Mir macht das nichts aus. Ich bin lieber an der frischen Luft als in der Halle." },
    { sprecher: "Daria", stimme: DARIA, text: "Das Beste war bisher mein zweites Lehrjahr. Da war ich zwei Monate auf einer Werft auf der Insel Skarvik, ganz im Norden. Eigentlich wollte ich vorher einen Sprachkurs machen, aber dafür war keine Zeit. Zum Glück haben alle sehr langsam mit mir gesprochen." },
    { sprecher: "Daria", stimme: DARIA, text: "Und nach der Ausbildung? Viele aus meiner Klasse gehen gleich auf die Meisterschule. Ich möchte zuerst ein paar Jahre arbeiten und Erfahrung sammeln. Vielleicht habe ich später einmal eine eigene Werkstatt – aber das ist noch ein Traum." },
  ],
};

export const BERICHT_AUFGABEN = [
  {
    typ: "block", hoertext: BERICHT, nummer: 15,
    frage: "Lies zuerst die Aufgaben 15–20. Hör dann den Bericht. Wähle bei jeder Aufgabe die richtige Lösung.",
    aufgaben: [
      { typ: "auswahl", mischen: false, frage: "Daria", optionen: ["hat direkt nach der Schule mit der Ausbildung angefangen.", "brauchte für die Ausbildung keinen bestimmten Abschluss.", "findet Mathematik in ihrem Beruf nicht so wichtig."], richtig: 1 },
      { typ: "auswahl", mischen: false, frage: "Die Berufsschule", optionen: ["besucht Daria einmal pro Woche.", "ist direkt auf der Werft.", "findet mehrere Wochen ohne Unterbrechung statt."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "Auf der Werft", optionen: ["lernt Daria auch moderne Materialien kennen.", "arbeitet Daria nur mit Holz.", "werden vor allem alte Schiffe repariert."], richtig: 0 },
      { typ: "auswahl", mischen: false, frage: "Die Arbeit im Winter", optionen: ["gefällt Daria trotz der Kälte.", "findet nur in der Halle statt.", "ist für Daria zu anstrengend."], richtig: 0 },
      { typ: "auswahl", mischen: false, frage: "Im zweiten Lehrjahr", optionen: ["hat Daria einen Sprachkurs gemacht.", "hat Daria die Werft gewechselt.", "hat Daria eine Zeit lang woanders gearbeitet."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "Nach der Ausbildung möchte Daria", optionen: ["sofort die Meisterschule besuchen.", "zuerst Berufserfahrung sammeln.", "eine eigene Werkstatt eröffnen."], richtig: 1 },
    ],
    erklaerung: "15: „keinen bestimmten Schulabschluss“. 16: „drei Wochen am Stück“ = ohne Unterbrechung. 17: Kunststoff = modernes Material. 18: „Mir macht das nichts aus.“ 19: zwei Monate auf Skarvik (der Sprachkurs hat nicht geklappt). 20: „zuerst ein paar Jahre arbeiten“ – die Werkstatt ist nur ein Traum.",
  },
];

// ---------- Die Abnahme bei Kassia (Prüfungsmodus) ----------

const P = (nr, teile) => ({ ...szene(nr, teile), pruefung: true });

export const ABNAHME_SZENEN = [
  P(1, [
    { sprecher: "Kassia", stimme: KASSIA, text: "Daria, kannst du heute bis sechs Uhr bleiben?" },
    { sprecher: "Daria", stimme: DARIA, text: "Heute leider nicht, ich habe um fünf einen Termin beim Zahnarzt. Aber morgen bleibe ich gern länger." },
    { sprecher: "Kassia", stimme: KASSIA, text: "Gut, dann morgen. Danke!" },
  ]),
  P(2, [
    { sprecher: "Timon", stimme: TIMON, text: "Niko, wo ist denn der Plan für das Deck? Der war doch in der blauen Mappe." },
    { sprecher: "Niko", stimme: NIKO, text: "Kassia hat ihn mitgenommen, sie wollte ihn kopieren. Jetzt liegt er im Büro auf ihrem Tisch." },
  ]),
  P(3, [
    { sprecher: "Kunde", stimme: KUNDE, text: "Guten Tag. Ich möchte mein Fischerboot streichen lassen. Geht das bis Freitag?" },
    { sprecher: "Kassia", stimme: KASSIA, text: "Bis Freitag schaffen wir das leider nicht, wir bauen gerade das Festschiff. Aber bis nächsten Mittwoch wäre Ihr Boot fertig." },
    { sprecher: "Kunde", stimme: KUNDE, text: "Hm. Na gut, dann eben Mittwoch." },
  ]),
  P(4, [
    { sprecher: "Daria", stimme: DARIA, text: "Timon, du hast ja keine Handschuhe an!" },
    { sprecher: "Timon", stimme: TIMON, text: "Ich streiche doch nur. Brauche ich da wirklich welche?" },
    { sprecher: "Daria", stimme: DARIA, text: "Bei dieser Farbe schon, die ist schlecht für die Haut. Eine Maske brauchst du draußen aber nicht." },
  ]),
];

export const ABNAHME = [
  {
    typ: "auswahl", hoertext: ABNAHME_SZENEN[0], frage: "1  Daria",
    optionen: ["arbeitet morgen länger.", "bleibt heute bis 18 Uhr.", "geht heute um 18 Uhr zum Zahnarzt."], richtig: 0, mischen: false,
  },
  {
    typ: "auswahl", hoertext: ABNAHME_SZENEN[1], frage: "2  Der Plan für das Deck ist",
    optionen: ["in der blauen Mappe.", "bei Niko.", "im Büro."], richtig: 2, mischen: false,
  },
  {
    typ: "auswahl", hoertext: ABNAHME_SZENEN[2], frage: "3  Das Boot des Kunden",
    optionen: ["ist am Freitag fertig.", "wird nächste Woche fertig.", "wird nicht gestrichen."], richtig: 1, mischen: false,
  },
  {
    typ: "auswahl", hoertext: ABNAHME_SZENEN[3], frage: "4  Timon muss beim Streichen",
    optionen: ["Handschuhe tragen.", "eine Maske tragen.", "nichts Besonderes tragen."], richtig: 0, mischen: false,
  },
];
