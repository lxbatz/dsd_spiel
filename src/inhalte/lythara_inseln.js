// Lythara – Quests 2 bis 5 und das Finale: Die Inseln der Stimmen
//
// Aufbau nach dem Reader „Prüfungsteil Schriftliche Kommunikation“, Teil B (Aufgaben B15–B64):
//   Quest 2  Insel der Echos         → Den Text wiedergeben (Wiedergabe)         → Rolle des Chronisten
//   Quest 3  Insel der Erinnerungen  → Von eigenen Erfahrungen berichten         → Rolle des Erzählers
//   Quest 4  Insel der Waage         → Die eigene Meinung sagen und begründen    → Rolle des Fürsprechers
//   Quest 5  Insel des Siegels       → Einen Schluss schreiben                   → Rolle der Vollendung
//   Finale   Das Buch der Stimmen     → Den ganzen Forumsbeitrag schreiben
//
// Alle Übungen sind eigene Texte (keine Abschriften aus dem Buch). Grundlage ist wie in
// Quest 1 der Forumsbeitrag von Jonas (texte.js → nachricht_reisender) und die Frage:
// „Sollten alle Auszubildenden ein Praktikum im Ausland machen?“
//
// Jede Insel: drei Echo-Kristalle (Übungen), ein Pult (freier Text) und ein Wächter (Bosskampf).
//
// Abgeglichen mit dem Modellsatz und der Handreichung zur Schriftlichen Kommunikation (docs/dsd_pruefung.md):
// Wiedergabe mit eigenen Worten (nur „er sagt, dass“ + Originalsatz = wenig, Abschreiben/Zitate = nichts),
// Erfahrungen ausführlich (auch die eigene Situation im Präsens), Meinung begründet (auch „unentschieden“ zählt),
// komplexe Strukturen lohnen sich, Reihenfolge der Teilaufgaben ist in der Prüfung frei.

const TEXT = "nachricht_reisender";

// Prüfmuster für den Zauberspiegel (nur Hinweise, keine Bewertung)
/** Typische Sätze aus Jonas' Text, die man nicht abschreiben soll */
const ABGESCHRIEBEN = "^(?![\\s\\S]*(ich kannte niemanden|der dialekt war neu für mich|die arbeit in der großen küche war sehr anstrengend|hatte ich nette kollegen und neue freunde|wie man in einem internationalen team arbeitet|man wird selbstständiger, lernt eine andere kultur|hat später bessere chancen im beruf))";
/** Lange wörtliche Zitate (kurze Namen in Anführungszeichen wie „Startklar“ sind erlaubt) */
const KEIN_ZITAT = "^(?![\\s\\S]*[„\"»][^“\"«\\n]{30,}[“\"«])";
/** Meinung, auch unentschieden */
const MEINUNG = "meiner meinung|der meinung|ich finde|finde ich|ich denke|ich glaube|bin ich (da)?(für|gegen)|ich bin (da)?(für|gegen)|unentschieden|einerseits|bin mir nicht sicher";
/** Komplexe Strukturen auf B1 (Handreichung): Nebensätze, Relativsätze, Konjunktiv II, zu-Infinitiv, Passiv … */
const STRUKTUREN = "\\b(obwohl|wenn|nachdem|bevor|während|damit|ob|seitdem|sodass)\\b|,\\s*(der|die|das|dem|den|deren|dessen|in dem|in der|mit dem|mit der)\\s|\\b(würde|würden|hätte|hätten|wäre|wären|könnte|könnten)\\b|\\b(um|ohne)\\b[^.!?]*\\bzu\\s+\\w+en\\b|\\b(wird|werden|wurde|wurden|worden)\\b[^.!?]*\\b\\w{3,}(t|en)\\s*[.!?,]";

export const FRAGE = "Sollten alle Auszubildenden ein Praktikum im Ausland machen?";

// ---------------------------------------------------------------------------
// Quest 2: Die Insel der Echos – Wiedergabe
// ---------------------------------------------------------------------------

const Q2 = {
  id: "q2",
  insel: "Die Insel der Echos",
  lernziel: "Den Text wiedergeben",
  rolle: "rolle_chronist",
  rollenName: "Rolle des Chronisten",
  farbe: "#58d8f0",
  lyra: [
    "Das ist die Insel der Echos. Hier lernst du, einen Text wiederzugeben.",
    "Wiedergeben heißt: Du erzählst deinen Lesern, was Jonas geschrieben hat – kurz, richtig und mit deinen eigenen Worten.",
    "Die drei Echo-Kristalle zeigen dir, wie das geht: Wer hat geschrieben? Was hat er erlebt? Was meint er und was möchte er von den Lesern?",
    "Aber Vorsicht: Der Wächter dieser Insel ist der Kopist. Er schreibt alles nur ab …",
  ],
  stationen: [
    {
      id: "lythara_q2_s1",
      name: "Echo des Verfassers",
      inschrift: "Wer hat geschrieben? Stell ihn kurz vor – nur das Wichtige.",
      aufgaben: [
        {
          typ: "auswahl", lesetext: TEXT,
          frage: "Welcher Satz stellt den Verfasser am besten vor?",
          optionen: [
            "Der Beitrag stammt von Jonas, einem 17-jährigen Auszubildenden, der Koch wird.",
            "Ich heiße Jonas, bin 17 Jahre alt und mache eine Ausbildung als Koch.",
            "Jonas. 17. Koch. Hamburg. Wien. Hotel.",
          ],
          richtig: 0,
          erklaerung: "Schreib über Jonas in der 3. Person (er) und verbinde die Informationen in einem Satz. Den ersten Satz hat Jonas selbst so geschrieben – den darfst du nicht abschreiben.",
        },
        {
          typ: "richtigfalsch", lesetext: TEXT,
          frage: "Ist diese Information für die Vorstellung von Jonas wichtig? (Richtig = wichtig)",
          aussagen: [
            ["Er heißt Jonas.", true],
            ["Er ist 17 Jahre alt.", true],
            ["Er macht eine Ausbildung als Koch.", true],
            ["Er schreibt seinen Namen unter den Beitrag.", false],
            ["Er hat ein Praktikum im Ausland gemacht.", true],
          ],
          erklaerung: "Wichtig sind: Name, Alter und was die Person macht. Kleine Details lässt du weg.",
        },
        {
          typ: "luecke",
          frage: "So kündigst du die Wiedergabe an. Wähle die passenden Wörter.",
          text: "Nun möchte ich den Beitrag kurz {zusammenfassen}.\nDer Text {stammt} von Jonas.",
          auswahl: true,
          ablenker: ["abschreiben", "wiederholen", "liest", "gibt"],
          erklaerung: "Redemittel: Ich möchte den Beitrag kurz zusammenfassen / wiedergeben. · Der Text stammt von …",
        },
        {
          typ: "luecke",
          frage: "Jonas schreibt „ich“. Du schreibst „er“. Ergänze die Verben.",
          text: "Jonas: „Ich mache eine Ausbildung.“ → Jonas {macht} eine Ausbildung.\nJonas: „Ich bin 17.“ → Er {ist} 17 Jahre alt.\nJonas: „Ich habe ein Praktikum gemacht.“ → Er {hat} ein Praktikum gemacht.",
          erklaerung: "ich mache → er macht · ich bin → er ist · ich habe → er hat. Achtung: Das ist nur der erste Schritt! Wer in der Prüfung nur Jonas' Sätze in die er-Form setzt, bekommt wenig Punkte. Besser: mit eigenen Worten zusammenfassen.",
        },
      ],
    },
    {
      id: "lythara_q2_s2",
      name: "Echo der Erlebnisse",
      inschrift: "Was hat er erlebt? Sag es richtig – und mit deinen Worten.",
      aufgaben: [
        {
          typ: "auswahl", lesetext: TEXT,
          frage: "Welche Wiedergabe des zweiten Abschnitts ist am besten?",
          optionen: [
            "Jonas berichtet, dass ihm der Start in Wien schwergefallen ist, weil alles fremd und die Arbeit hart war. Mit der Zeit hat er aber Anschluss gefunden und viel gelernt.",
            "Am Anfang war es nicht leicht. Ich kannte niemanden und die Arbeit in der großen Küche war sehr anstrengend.",
            "Jonas hatte in Wien nur Probleme und hat nichts gelernt.",
          ],
          richtig: 0,
          erklaerung: "Die zweite Antwort ist abgeschrieben (ich-Form!). Die dritte ist falsch: Jonas hat viel gelernt.",
        },
        {
          typ: "zuordnen", lesetext: TEXT,
          frage: "Vier Mitschüler haben Jonas' Erlebnisse wiedergegeben. Wie gut ist das? Ordne zu. (Eine Bewertung bleibt übrig.)",
          paare: [
            ["„Am Anfang war es nicht leicht. Ich kannte niemanden.“", "abgeschrieben – zählt nicht"],
            ["„Jonas sagt, dass es am Anfang nicht leicht war und dass er niemanden kannte.“", "nur in die er-Form gesetzt – zählt wenig"],
            ["„Laut Jonas war der Start in Wien schwierig, weil ihm alles fremd war.“", "mit eigenen Worten zusammengefasst – sehr gut"],
            ["„Jonas war in Wien.“", "zu knapp – man erkennt Jonas' Aussage nicht"],
          ],
          ablenker: ["falsch – das steht nicht im Text"],
          erklaerung: "So bewertet die Prüfung die Wiedergabe: Eigene Worte und Zusammenfassen bringen die meisten Punkte. Abschreiben und Zitate zählen nicht, ein einziger knapper Satz reicht nicht.",
        },
        {
          typ: "richtigfalsch", lesetext: TEXT,
          frage: "Ein Mitschüler hat Jonas' Text wiedergegeben. Sind seine Sätze richtig?",
          aussagen: [
            ["Jonas hat ein Jahr lang in Wien gearbeitet.", false],
            ["Am Anfang kannte Jonas in Wien niemanden.", true],
            ["Jonas hat nur neue Rezepte gelernt.", false],
            ["Er hat auch gelernt, in einem internationalen Team zu arbeiten.", true],
          ],
          erklaerung: "Jonas war vier Wochen in Wien. Er hat Rezepte gelernt UND wie man im Team arbeitet. Eine Wiedergabe muss richtig sein!",
        },
        {
          typ: "zuordnen",
          frage: "Eigene Worte finden: Welche Wörter bedeuten (fast) dasselbe?",
          paare: [
            ["nicht leicht", "schwierig"],
            ["sehr anstrengend", "ziemlich stressig"],
            ["nach ein paar Tagen", "schon bald"],
            ["nette Kollegen", "freundliche Mitarbeiter"],
          ],
          erklaerung: "Wörter mit gleicher Bedeutung heißen Synonyme. Mit ihnen schreibst du den Text in deinen eigenen Worten.",
        },
        {
          typ: "luecke",
          frage: "Wähle das passende Verb.",
          text: "Jonas {berichtet|erzählt} von seinem Praktikum in einem Hotel.\nEr {erzählt|berichtet|schreibt}, dass er viel gelernt hat.",
          auswahl: true,
          ablenker: ["fragt", "liest", "antwortet", "schreibt"],
          erklaerung: "Verben für die Wiedergabe: berichten (von), erzählen, schreiben, sagen, erklären",
        },
      ],
    },
    {
      id: "lythara_q2_s3",
      name: "Echo der Meinung",
      inschrift: "Was denkt er – und was wünscht er sich von seinen Lesern?",
      aufgaben: [
        {
          typ: "auswahl", lesetext: TEXT,
          frage: "Was ist Jonas' Meinung?",
          optionen: [
            "Er findet, dass alle Auszubildenden ein Praktikum im Ausland machen sollten.",
            "Er findet, dass ein Praktikum im Ausland zu anstrengend ist.",
            "Er findet, dass man lieber in Hamburg bleiben sollte.",
          ],
          richtig: 0,
        },
        {
          typ: "auswahl", lesetext: TEXT,
          frage: "Welcher Satz gibt Jonas' Gründe mit eigenen Worten wieder?",
          optionen: [
            "Jonas meint, dass man im Ausland unabhängiger wird, ein fremdes Land kennenlernt und später leichter eine gute Stelle findet.",
            "Man wird selbstständiger, lernt eine andere Kultur kennen und hat später bessere Chancen im Beruf.",
            "Jonas sagt: „Alle Auszubildenden sollten ein Praktikum im Ausland machen!“",
          ],
          richtig: 0,
          erklaerung: "Die zweite Antwort ist abgeschrieben, die dritte ist nur ein Zitat. In der Wiedergabe benutzt du eigene Wörter.",
        },
        {
          typ: "zuordnen",
          frage: "Verbinde die Satzteile.",
          paare: [
            ["Jonas ist der Meinung,", "dass ein Praktikum im Ausland wichtig ist."],
            ["Er begründet das damit,", "dass man selbstständiger wird."],
            ["Am Ende bittet er die Leser,", "ihre Meinung zu schreiben."],
            ["Er möchte wissen,", "ob die Leser schon Erfahrungen gemacht haben."],
          ],
          erklaerung: "Redemittel: … ist der Meinung, dass … · Er begründet das damit, dass … · Er bittet die Leser, … zu …",
        },
        {
          typ: "ordnen",
          frage: "Bau den Satz über Jonas' Appell an die Leser.",
          teile: ["Zum Schluss", "fordert", "Jonas", "die Leser", "auf,", "ihre Meinung", "zu schreiben."],
          loesungen: ["Jonas fordert die Leser zum Schluss auf, ihre Meinung zu schreiben."],
          erklaerung: "auffordern: Jonas fordert die Leser auf, … zu schreiben. Das „auf“ steht am Ende des Hauptsatzes.",
        },
      ],
    },
  ],
  pult: "Pult des Chronisten",
  text: {
    typ: "freitext",
    id: "lythara_q2_text",
    lesetext: TEXT,
    frage: "Schreibe jetzt deine Wiedergabe von Jonas' Beitrag (4–6 Sätze). Stell Jonas vor, erzähle kurz, was er erlebt hat, und gib seine Meinung und seine Bitte an die Leser wieder.",
    minWoerter: 50,
    stichpunkte: "Redemittel: Nun möchte ich den Beitrag kurz zusammenfassen. · Der Text stammt von Jonas, einem … · Er berichtet, dass … · Am Anfang … Später … · Jonas ist der Meinung, dass … · Zum Schluss bittet er die Leser, … ★ Prüfungstipp: Fasse mit eigenen Worten zusammen. Nur „Er sagt, dass …“ vor Jonas' Originalsatz zählt in der Prüfung wenig, abgeschriebene Sätze zählen gar nicht.",
    muster: [
      { such: "zusammenfass|wiedergeb|stammt von|geschrieben", ok: "Du kündigst die Wiedergabe an.", fehlt: "Kündige die Wiedergabe an: Nun möchte ich den Beitrag kurz zusammenfassen." },
      { such: "jonas[\\s\\S]*(17|koch|ausbildung|azubi|auszubildend)", ok: "Du stellst Jonas vor.", fehlt: "Stell Jonas vor: Name, Alter, Ausbildung." },
      { such: "anfang|schwer|schwierig|niemand|anstreng|stress|kollegen|freunde|gelernt", ok: "Du beschreibst, was Jonas erlebt hat.", fehlt: "Erzähle kurz, was Jonas in Wien erlebt hat." },
      { such: "meinung|meint|findet|denkt|sollten|sollte", ok: "Du gibst Jonas' Meinung wieder.", fehlt: "Gib Jonas' Meinung wieder: Jonas ist der Meinung, dass …" },
      { such: "fordert|bittet|möchte wissen|will wissen|fragt|wünscht", ok: "Du nennst Jonas' Bitte an die Leser.", fehlt: "Was möchte Jonas von den Lesern? Er bittet die Leser, …" },
      { such: ABGESCHRIEBEN, ok: "Du schreibst nicht einfach ab.", fehlt: "Du hast Sätze von Jonas abgeschrieben. Benutze eigene Worte!" },
      { such: KEIN_ZITAT, ok: "Du benutzt keine langen Zitate.", fehlt: "Wörtliche Rede („…“) zählt in der Prüfung nicht als eigene Leistung. Gib Jonas' Aussagen mit eigenen Worten wieder." },
    ],
    checkliste: [
      "Ich schreibe über Jonas in der 3. Person (er).",
      "Ich nenne nur die wichtigen Informationen.",
      "Meine Wiedergabe ist richtig: Alles steht so auch in Jonas' Text.",
      "Ich benutze eigene Wörter, schreibe nicht ab und zitiere nicht.",
      "Man erkennt Jonas' wichtigste Aussagen: Erlebnisse, Meinung, Bitte an die Leser.",
    ],
  },
  waechter: {
    name: "Der Kopist",
    bild: "boss_kopist",
    lp: 100,
    schaden: 20,
    einleitung: "Hehehe … Ich bin der Kopist! Warum eigene Worte suchen? Ich schreibe einfach alles ab – Wort für Wort, Fehler für Fehler. Zeig mir, dass du es besser kannst!",
    spott: [
      "Abschreiben ist so viel leichter!",
      "Ich kopiere dich gleich mit!",
      "Wer braucht schon eigene Worte?",
      "Ich habe tausend Texte kopiert – und keinen verstanden!",
    ],
    sieg: [
      "Die Feder des Kopisten zerbricht.",
      "„Eigene Worte … sie sind stärker als meine Kopien. Nimm die Rolle des Chronisten.“",
    ],
    niederlage: [
      "„Hehe, kopiert und gewonnen!“",
      "Der Kopist lacht. Übe an den Echo-Kristallen und versuch es dann noch einmal!",
    ],
    fragen: [
      {
        typ: "auswahl",
        frage: "„Was ist eine Wiedergabe?“",
        optionen: ["Ich erzähle mit eigenen Worten, was im Text steht.", "Ich schreibe den Text Wort für Wort ab.", "Ich schreibe nur meine eigene Meinung."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Jonas schreibt: ‚Ich bin 17 Jahre alt.‘ Und du?“",
        optionen: ["Jonas ist 17 Jahre alt.", "Ich bin 17 Jahre alt.", "Jonas bin 17 Jahre alt."],
        richtig: 0,
        erklaerung: "Du schreibst über Jonas: er ist …",
      },
      {
        typ: "auswahl",
        frage: "„Welche Information ist für die Vorstellung NICHT so wichtig?“",
        optionen: ["dass Jonas seinen Namen unter den Text schreibt", "dass Jonas eine Ausbildung als Koch macht", "dass Jonas 17 Jahre alt ist"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Wie lange war Jonas im Ausland?“",
        optionen: ["vier Wochen", "ein Jahr", "vier Tage"],
        richtig: 0,
        erklaerung: "Eine Wiedergabe muss richtig sein. Lies genau!",
      },
      {
        typ: "auswahl",
        frage: "„Welches Wort bedeutet dasselbe wie ‚anstrengend‘?“",
        optionen: ["stressig", "langweilig", "billig"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz gibt Jonas' Meinung wieder?“",
        optionen: [
          "Jonas ist der Meinung, dass alle Azubis ins Ausland gehen sollten.",
          "Jonas ist der Meinung, dass alle Azubis sollten ins Ausland gehen.",
          "Jonas Meinung ist, Azubis Ausland.",
        ],
        richtig: 0,
        erklaerung: "Nach „dass“ steht das konjugierte Verb (sollten) am Ende.",
      },
      {
        typ: "auswahl",
        frage: "„Was möchte Jonas am Ende von seinen Lesern?“",
        optionen: ["Sie sollen ihre Meinung und ihre Erfahrungen schreiben.", "Sie sollen ein Hotel in Wien buchen.", "Sie sollen Koch werden."],
        richtig: 0,
      },
      {
        typ: "luecke",
        frage: "„Ergänze meinen Satz – aber richtig!“",
        text: "Jonas {berichtet} von seinem Praktikum in Wien.",
        auswahl: true,
        ablenker: ["fragt", "kopiert", "liest"],
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist KEINE gute Wiedergabe?“",
        optionen: [
          "Am Anfang war es nicht leicht. Ich kannte niemanden.",
          "Jonas erzählt, dass der Anfang schwierig für ihn war.",
          "Zuerst hatte Jonas in Wien keine Freunde.",
        ],
        richtig: 0,
        erklaerung: "Der erste Satz ist von Jonas abgeschrieben (ich-Form).",
      },
      {
        typ: "auswahl",
        frage: "„Welche Wiedergabe bringt in der Prüfung die meisten Punkte?“",
        optionen: [
          "Laut Jonas lohnt sich ein Auslandspraktikum, weil man unabhängiger wird und später bessere Chancen hat.",
          "Jonas sagt, dass alle Auszubildenden ein Praktikum im Ausland machen sollten.",
          "Jonas: „Alle Auszubildenden sollten ein Praktikum im Ausland machen!“",
        ],
        richtig: 0,
        erklaerung: "Zusammenfassen mit eigenen Worten ist am besten. Nur „Er sagt, dass …“ + Originalsatz zählt wenig, ein Zitat gar nicht.",
      },
      {
        typ: "ordnen",
        frage: "„Bau den Satz, wenn du kannst!“",
        teile: ["Der Beitrag", "stammt", "von", "Jonas,", "der", "Koch", "wird."],
        erklaerung: "Relativsatz: …, der Koch wird. Das Verb steht am Ende.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Quest 3: Die Insel der Erinnerungen – Erfahrungsbericht
// ---------------------------------------------------------------------------

const Q3 = {
  id: "q3",
  insel: "Die Insel der Erinnerungen",
  lernziel: "Von eigenen Erfahrungen berichten",
  rolle: "rolle_erzaehler",
  rollenName: "Rolle des Erzählers",
  farbe: "#ffb347",
  lyra: [
    "Willkommen auf der Insel der Erinnerungen. Hier geht es um DICH.",
    "Nach der Wiedergabe erzählst du von deinen eigenen Erfahrungen zum Thema: Arbeit, Praktikum, Ausbildung, Ausland.",
    "Du hast noch kein Praktikum gemacht? Kein Problem! Du kannst auch von Freunden oder deiner Familie erzählen – oder beschreiben, wie es bei dir und in deiner Klasse ist.",
    "Wichtig ist: Dein Bericht passt zum Thema, er hat Details und die Sätze sind gut verbunden. Der Wächter hier hat alles vergessen – zeig ihm, wie man erzählt!",
  ],
  stationen: [
    {
      id: "lythara_q3_s1",
      name: "Brücke der Worte",
      inschrift: "Baue eine Brücke vom Text zu deinem Leben.",
      aufgaben: [
        {
          typ: "auswahl",
          frage: "Du hast Jonas' Text wiedergegeben. Wie kommst du gut zu deinen eigenen Erfahrungen?",
          optionen: [
            "Nachdem ich Jonas' Beitrag zusammengefasst habe, möchte ich jetzt von meinen eigenen Erfahrungen berichten.",
            "Jetzt kommt Teil drei.",
            "Ich mag Pizza und Fußball.",
          ],
          richtig: 0,
          erklaerung: "Eine Überleitung verbindet die Wiedergabe mit deinem Bericht.",
        },
        {
          typ: "ordnen",
          frage: "Bau die Überleitung.",
          teile: ["Jetzt", "möchte", "ich", "von meinen eigenen Erfahrungen", "erzählen."],
          loesungen: ["Ich möchte jetzt von meinen eigenen Erfahrungen erzählen."],
          erklaerung: "Modalverb (möchte) auf Position 2, Infinitiv (erzählen) am Ende.",
        },
        {
          typ: "luecke",
          frage: "Verbinde deine Erfahrung mit Jonas' Text. Wähle das passende Wort.",
          text: "Jonas hatte am Anfang Probleme. Bei mir war es {genauso}: Ich war auch sehr nervös.\nJonas hat schnell Freunde gefunden. {Anders} als Jonas war ich zuerst ziemlich allein.",
          auswahl: true,
          ablenker: ["deshalb", "weil", "trotzdem"],
          erklaerung: "Vergleichen: genauso wie … · auch so · anders als … · nicht so wie …",
        },
      ],
    },
    {
      id: "lythara_q3_s2",
      name: "Spiegel der Erinnerung",
      inschrift: "Welche Erinnerung passt zum Thema? Wer, wann, wo, was, warum, wie?",
      aufgaben: [
        {
          typ: "richtigfalsch",
          frage: "Thema: Praktikum, Arbeit und Ausland. Passt diese Erfahrung zum Thema? (Richtig = passt)",
          aussagen: [
            ["Ich habe zwei Wochen in einer Bäckerei in Polen gearbeitet.", true],
            ["Mein Cousin hat ein Praktikum in Spanien gemacht und mir viel davon erzählt.", true],
            ["Ich spiele am Wochenende gern Fußball.", false],
            ["Im Urlaub bin ich jeden Tag im Meer geschwommen.", false],
            ["Bei meinem Schulpraktikum in Dortmund habe ich gelernt, im Team zu arbeiten.", true],
          ],
          erklaerung: "Deine Erfahrung muss zum Thema passen. Auch Erfahrungen von Freunden und Familie zählen!",
        },
        {
          typ: "zuordnen",
          frage: "Mit den W-Fragen wird dein Bericht genau. Was passt?",
          paare: [
            ["Wer?", "meine Schwester Lina"],
            ["Wann?", "letzten Sommer"],
            ["Wo?", "in einem Hotel in Antalya"],
            ["Was?", "Sie hat an der Rezeption gearbeitet."],
            ["Warum?", "weil sie besser Englisch lernen wollte"],
          ],
          erklaerung: "Wer? Wann? Wo? Was? Warum? Wie? – So sammelst du Stichpunkte für deinen Bericht.",
        },
        {
          typ: "auswahl",
          frage: "Du hast noch nie im Ausland gearbeitet. Was ist eine gute Idee?",
          optionen: [
            "Ich erzähle von den Erfahrungen einer Freundin oder von meinem Praktikum hier.",
            "Ich lasse den Bericht einfach weg.",
            "Ich schreibe nur: „Dazu habe ich keine Erfahrungen.“",
          ],
          richtig: 0,
          erklaerung: "Du kannst auch über Erfahrungen von anderen berichten – oder beschreiben, wie es bei dir und deinen Mitschülern ist.",
        },
        {
          typ: "auswahl",
          frage: "In der Prüfung steht zum Beispiel: „Wie lernen Sie und Ihre Mitschüler für Prüfungen? Berichten Sie ausführlich.“ Welche Antwort passt am besten?",
          optionen: [
            "In meiner Klasse lernen die meisten am Abend vor der Prüfung. Ich mache das anders: Ich lerne schon eine Woche vorher jeden Tag eine halbe Stunde. Meistens lerne ich mit meiner Freundin Sara, weil wir uns gegenseitig abfragen können. Letztes Jahr habe ich so meine Mathe-Prüfung gut bestanden.",
            "Ich lerne für Prüfungen.",
            "Ich finde, man sollte früh lernen, weil man dann weniger Stress hat.",
          ],
          richtig: 0,
          erklaerung: "Berichten heißt: konkret und ausführlich erzählen, wie es bei dir (und deinen Mitschülern) ist oder war – im Präsens oder im Perfekt. Ein einziger Satz bringt 0 Punkte. Die dritte Antwort ist eine Meinung, kein Bericht.",
        },
      ],
    },
    {
      id: "lythara_q3_s3",
      name: "Faden der Zeit",
      inschrift: "Verbinde deine Erinnerungen zu einem Faden.",
      aufgaben: [
        {
          typ: "luecke",
          frage: "Ergänze die Verknüpfungen.",
          text: "{Zuerst} möchte ich sagen, dass ich noch kein Praktikum im Ausland gemacht habe. {Aber} mein Bruder war letztes Jahr in Italien. {Dort} hat er in einer Autowerkstatt gearbeitet. {Am Anfang} war es schwer für ihn, {weil} er kein Italienisch sprach. {Schließlich} hat er aber viel gelernt.",
          auswahl: true,
          ablenker: ["obwohl", "denn"],
          erklaerung: "Verknüpfungen machen deinen Text leicht lesbar: zuerst, am Anfang, dann, danach, außerdem, schließlich …",
        },
        {
          typ: "luecke",
          frage: "Erfahrungen stehen meistens im Perfekt. Ergänze „haben“ oder „sein“.",
          text: "Ich {habe} drei Wochen in einer Küche gearbeitet.\nWir {sind} jeden Morgen um sechs Uhr aufgestanden.\nMeine Kollegen {haben} mir viel gezeigt.\nIch {bin} am Wochenende nach Hause gefahren.",
          auswahl: true,
          ablenker: ["hat", "ist", "bist"],
          erklaerung: "Perfekt mit „sein“ bei Bewegung und Veränderung: fahren, gehen, aufstehen … Sonst meistens mit „haben“.",
        },
        {
          typ: "auswahl",
          frage: "Welcher Bericht ist besser?",
          optionen: [
            "Letzten Sommer habe ich zwei Wochen in einem Café gearbeitet. Am Anfang war ich nervös, weil ich die Kasse nicht kannte. Aber meine Chefin hat mir alles erklärt. Danach hat mir die Arbeit viel Spaß gemacht.",
            "Ich habe in einem Café gearbeitet. Es war gut.",
            "Café. Kasse. Chefin. Spaß.",
          ],
          richtig: 0,
          erklaerung: "Ein guter Bericht ist ausführlich: Er nennt Details (wann, wo, was) und sagt, wie es war.",
        },
        {
          typ: "ordnen",
          frage: "Bau den Satz.",
          teile: ["Letzten Sommer", "habe", "ich", "drei Wochen", "in einem Hotel", "gearbeitet."],
          loesungen: ["Ich habe letzten Sommer drei Wochen in einem Hotel gearbeitet."],
          erklaerung: "Perfekt: habe … gearbeitet. Das Partizip steht am Ende.",
        },
      ],
    },
  ],
  pult: "Pult des Erzählers",
  text: {
    typ: "freitext",
    id: "lythara_q3_text",
    frage: "Schreibe jetzt deinen Erfahrungsbericht (5–7 Sätze). Beginne mit einer Überleitung. Erzähle dann von deinen Erfahrungen (oder von den Erfahrungen einer Person, die du kennst) mit Praktikum, Arbeit oder Ausland.",
    minWoerter: 60,
    stichpunkte: "Redemittel: Jetzt möchte ich von meinen eigenen Erfahrungen berichten. · Genauso wie Jonas … / Anders als Jonas … · Letztes Jahr / Letzten Sommer habe ich … · Am Anfang … Dann … Danach … Schließlich … · Es hat mir (nicht) gefallen, weil … ★ Prüfungstipp: Ein einziger Satz reicht nicht. Erzähle ausführlich mit Details: Wo? Wann? Was hast du gemacht? Wie war es?",
    muster: [
      { such: "erfahrung|erlebt|berichten|erzählen", ok: "Du leitest zu deinen Erfahrungen über.", fehlt: "Beginne mit einer Überleitung: Jetzt möchte ich von meinen Erfahrungen berichten." },
      { such: "jonas|genauso|auch so|anders als|wie bei", ok: "Du verbindest deinen Bericht mit Jonas' Text.", fehlt: "Vergleiche mit Jonas: Genauso wie Jonas … / Anders als Jonas …" },
      { such: "letzte[nms]?|vor (einem|zwei|drei|einer)|im (sommer|winter|frühling|herbst)|gestern|früher|\\b(19|20)\\d\\d\\b", ok: "Du sagst, wann es war.", fehlt: "Sag, wann es war: letzten Sommer, letztes Jahr, vor zwei Monaten …" },
      { such: "\\b(habe|hat|haben|bin|ist|sind|war|waren)\\b[\\s\\S]*\\b(ge\\w+t|ge\\w+en|\\w+iert)\\b|normalerweise|meistens|jeden (tag|morgen|abend)|bei uns|in meiner (klasse|schule|firma)", ok: "Du erzählst konkret, was war oder wie es bei dir ist.", fehlt: "Erzähle konkret: Was hast du erlebt (Perfekt: Ich habe … gearbeitet) oder wie ist es bei dir (Präsens: Bei uns … meistens …)?" },
      { such: "zuerst|am anfang|dann|danach|außerdem|schließlich|später|zum schluss", ok: "Du verknüpfst deine Sätze.", fehlt: "Verknüpfe deine Sätze: zuerst, am Anfang, dann, danach, schließlich …" },
      { such: "gefallen|spaß|schwer|schwierig|stress|nervös|toll|interessant|gelernt", ok: "Du sagst, wie es war.", fehlt: "Sag auch, wie es war: Es hat mir gefallen, weil … / Am Anfang war es schwer …" },
    ],
    checkliste: [
      "Meine Erfahrung passt zum Thema.",
      "Ich erzähle mit Details: wer, wann, wo, was, wie.",
      "Ich verbinde meine Sätze mit Wörtern wie „zuerst“, „dann“, „danach“.",
      "Mein Bericht ist ausführlich – nicht nur ein Satz.",
      "Ich benutze das Perfekt richtig (haben oder sein + Partizip).",
    ],
  },
  waechter: {
    name: "Der Wächter des Vergessens",
    bild: "boss_vergessen",
    lp: 100,
    schaden: 20,
    einleitung: "Erinnerungen? … Ich habe keine. Alles ist grau und leer. Wenn du mir nicht erzählen kannst, was du erlebt hast, nehme ich dir deine Erinnerungen auch!",
    spott: [
      "Was war gestern? Ich weiß es nicht …",
      "Wann? Wo? Wer? Alles vergessen!",
      "Deine Sätze zerfallen wie Staub!",
      "Erzähl mir etwas – wenn du kannst!",
    ],
    sieg: [
      "Ein warmes Licht füllt die Augen des Wächters.",
      "„Ich … erinnere mich wieder! Danke. Nimm die Rolle des Erzählers.“",
    ],
    niederlage: [
      "„Vergessen … alles vergessen …“",
      "Der Nebel wird dichter. Übe noch einmal an den Kristallen!",
    ],
    fragen: [
      {
        typ: "auswahl",
        frage: "„Was erzählst du in einem Erfahrungsbericht?“",
        optionen: ["was ich selbst oder Menschen um mich herum erlebt haben", "was Jonas geschrieben hat", "eine erfundene Geschichte über Drachen"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist richtig?“",
        optionen: ["Ich bin um sechs Uhr aufgestanden.", "Ich habe um sechs Uhr aufgestanden.", "Ich bin um sechs Uhr aufgestehen."],
        richtig: 0,
        erklaerung: "aufstehen → ich bin aufgestanden",
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist richtig?“",
        optionen: ["Letzten Sommer habe ich in einem Hotel gearbeitet.", "Letzten Sommer ich habe in einem Hotel gearbeitet.", "Letzten Sommer habe ich in einem Hotel arbeiten."],
        richtig: 0,
        erklaerung: "Das Verb (habe) steht auf Position 2, das Partizip (gearbeitet) am Ende.",
      },
      {
        typ: "auswahl",
        frage: "„Welche Frage beantwortet ‚in einer Bäckerei in Köln‘?“",
        optionen: ["Wo?", "Wann?", "Warum?"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welche Erfahrung passt NICHT zum Thema ‚Praktikum im Ausland‘?“",
        optionen: ["Mein Lieblingsessen ist Pizza.", "Meine Tante hat ein Jahr in London gearbeitet.", "Bei meinem Praktikum musste ich viel Englisch sprechen."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Du hast keine eigene Erfahrung. Was schreibst du?“",
        optionen: ["Ich erzähle, was eine Freundin erlebt hat.", "Ich schreibe gar nichts.", "Ich schreibe Jonas' Text noch einmal ab."],
        richtig: 0,
      },
      {
        typ: "luecke",
        frage: "„Welches Wort verbindet meine Sätze?“",
        text: "Am Anfang war es schwer. {Danach} hat mir die Arbeit Spaß gemacht.",
        auswahl: true,
        ablenker: ["Weil", "Dass", "Ob"],
      },
      {
        typ: "auswahl",
        frage: "„Welche Überleitung ist gut?“",
        optionen: [
          "Genauso wie Jonas habe ich auch schon im Ausland gearbeitet.",
          "Ende. Neuer Teil.",
          "Jonas ist 17 Jahre alt.",
        ],
        richtig: 0,
      },
      {
        typ: "ordnen",
        frage: "„Ordne meine Erinnerung!“",
        teile: ["Am Anfang", "war", "ich", "sehr nervös."],
        loesungen: ["Ich war am Anfang sehr nervös."],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Quest 4: Die Insel der Waage – Meinung sagen und begründen
// ---------------------------------------------------------------------------

const Q4 = {
  id: "q4",
  insel: "Die Insel der Waage",
  lernziel: "Die eigene Meinung sagen und begründen",
  rolle: "rolle_fuersprecher",
  rollenName: "Rolle des Fürsprechers",
  farbe: "#7aff9a",
  lyra: [
    "Dies ist die Insel der Waage. Hier wiegst du Argumente ab.",
    `Die Frage lautet: „${FRAGE}“`,
    "Du sagst deine Meinung deutlich, nennst Argumente und begründest sie mit Erklärungen und Beispielen.",
    "Übrigens: Du darfst auch unentschieden sein – aber dann musst du sagen, warum. Eine Meinung ohne Gründe zählt in der Prüfung fast nichts.",
    "Hüte dich vor dem Zauderer, dem Wächter der Insel. Er sagt nie, was er denkt – und nie, warum.",
  ],
  stationen: [
    {
      id: "lythara_q4_s1",
      name: "Stimme der Klarheit",
      inschrift: "Sag klar, was du denkst.",
      aufgaben: [
        {
          typ: "richtigfalsch",
          frage: `Frage: „${FRAGE}“ – Sagt die Person ihre Meinung deutlich? (Richtig = deutlich)`,
          aussagen: [
            ["Ich finde, ein Praktikum im Ausland ist für alle Azubis eine große Chance.", true],
            ["Das Thema ist sehr interessant.", false],
            ["Vielleicht. Mal sehen.", false],
            ["Ich bin unentschieden: Einerseits lernt man viel, andererseits ist es sehr teuer.", true],
            ["Meiner Meinung nach sollte niemand ins Ausland gehen müssen.", true],
          ],
          erklaerung: "Sag klar, ob du dafür, dagegen oder unentschieden bist – und warum. „Das ist interessant“ oder „Mal sehen“ ist keine Meinung.",
        },
        {
          typ: "zuordnen",
          frage: "Wie geht der Satz weiter? Achte auf die Stellung des Verbs.",
          paare: [
            ["Meiner Meinung nach", "ist ein Praktikum im Ausland sinnvoll."],
            ["Ich bin der Meinung,", "dass ein Praktikum im Ausland sinnvoll ist."],
            ["Meine Meinung ist:", "Ein Praktikum im Ausland ist sinnvoll."],
          ],
          erklaerung: "Meiner Meinung nach + Verb · Ich bin der Meinung, dass … + Verb am Ende",
        },
        {
          typ: "ordnen",
          frage: "Bau den Satz.",
          teile: ["Meiner Meinung nach", "sollte", "jeder Azubi", "ein Praktikum", "im Ausland", "machen."],
          loesungen: ["Meiner Meinung nach sollte jeder Azubi im Ausland ein Praktikum machen."],
          erklaerung: "Nach „Meiner Meinung nach“ kommt gleich das Verb (sollte).",
        },
      ],
    },
    {
      id: "lythara_q4_s2",
      name: "Stimme der Gründe",
      inschrift: "Ein Argument ohne Grund ist eine Feder ohne Tinte.",
      aufgaben: [
        {
          typ: "auswahl",
          frage: "Welche Begründung ist eine echte Begründung?",
          optionen: [
            "Ich bin dafür, weil man im Ausland lernt, Probleme allein zu lösen.",
            "Ich bin dafür, weil es gut ist.",
            "Ich bin dafür, weil das alle sagen.",
          ],
          richtig: 0,
          erklaerung: "Eine echte Begründung sagt konkret, WARUM. „Weil es gut ist“ sagt nichts Neues.",
        },
        {
          typ: "richtigfalsch",
          frage: "Ist das ein Argument FÜR ein Praktikum im Ausland? (Richtig = dafür, Falsch = dagegen)",
          aussagen: [
            ["Man spricht jeden Tag eine Fremdsprache.", true],
            ["Reise und Wohnung kosten viel Geld.", false],
            ["Viele Firmen suchen Mitarbeiter mit Auslandserfahrung.", true],
            ["Man ist lange weg von Familie und Freunden.", false],
            ["Man lernt neue Arbeitsmethoden kennen.", true],
          ],
          erklaerung: "Sammle Argumente dafür (pro) und dagegen (kontra). So kannst du deine Meinung besser begründen.",
        },
        {
          typ: "zuordnen",
          frage: "Argumente nach Kriterien sortieren: Was passt zusammen?",
          paare: [
            ["Sprache", "Man spricht jeden Tag Englisch oder Spanisch."],
            ["Geld", "Die Reise ist teuer."],
            ["Beruf und Chancen", "Man findet später leichter eine Stelle."],
            ["Familie und Freunde", "Man vermisst seine Familie."],
          ],
          erklaerung: "Kriterien helfen beim Sammeln: Sprache, Geld, Beruf, Familie, Persönlichkeit, Sicherheit …",
        },
        {
          typ: "auswahl",
          frage: "Welcher Satz ist richtig?",
          optionen: [
            "Ich bin dafür, denn man lernt eine neue Sprache.",
            "Ich bin dafür, denn man eine neue Sprache lernt.",
            "Ich bin dafür, weil man lernt eine neue Sprache.",
          ],
          richtig: 0,
          erklaerung: "Nach „denn“ bleibt das Verb auf Position 2. Nach „weil“ steht es am Ende: …, weil man eine neue Sprache lernt.",
        },
      ],
    },
    {
      id: "lythara_q4_s3",
      name: "Stimme der Beispiele",
      inschrift: "Zeig, was du meinst – mit einem Beispiel.",
      aufgaben: [
        {
          typ: "auswahl",
          frage: "Welches Argument ist am besten ausgearbeitet?",
          optionen: [
            "Im Ausland wird man selbstständiger. Man muss zum Beispiel allein einkaufen, kochen und mit dem Chef sprechen. Das hilft später auch in der Ausbildung zu Hause.",
            "Im Ausland wird man selbstständiger.",
            "Selbstständig. Ausland. Gut.",
          ],
          richtig: 0,
          erklaerung: "Argument + Erklärung + Beispiel: So überzeugst du deine Leser.",
        },
        {
          typ: "luecke",
          frage: "Verknüpfe die Argumente.",
          text: "{Zuerst} ist wichtig, dass man eine neue Sprache lernt. {Außerdem|Schließlich} wird man selbstständiger. {Zum Beispiel} muss man allein einkaufen. {Ein weiterer Punkt} ist, dass Firmen Auslandserfahrung gut finden. {Schließlich|Außerdem} lernt man viele neue Menschen kennen.",
          auswahl: true,
          ablenker: ["Obwohl", "Trotzdem"],
          erklaerung: "Verknüpfungen für Argumente: zuerst, außerdem, ein weiterer Punkt ist, zum Beispiel, schließlich …",
        },
        {
          typ: "ordnen",
          frage: "Bau das Gegenargument.",
          teile: ["Ein Praktikum im Ausland", "ist", "zwar", "teuer,", "aber", "es", "lohnt sich."],
          erklaerung: "zwar …, aber …: So nennst du ein Gegenargument und bleibst bei deiner Meinung.",
        },
      ],
    },
  ],
  pult: "Pult des Fürsprechers",
  text: {
    typ: "freitext",
    id: "lythara_q4_text",
    frage: `Schreibe jetzt deine Meinung zur Frage: „${FRAGE}“ (6–8 Sätze). Sag deine Meinung deutlich, nenne mindestens zwei Argumente und begründe sie mit Erklärungen oder Beispielen.`,
    minWoerter: 70,
    stichpunkte: "Redemittel: Nach meinen Erfahrungen bin ich der Meinung, dass … · Meiner Meinung nach … · Zuerst … , weil … · Zum Beispiel … · Außerdem … · Ein weiterer Punkt ist … · Zwar …, aber … · Aus diesen Gründen … ★ Prüfungstipp: Eine Meinung ohne Begründung bringt höchstens 1 von 3 Punkten. Welche Meinung du hast, ist egal – wichtig sind die Gründe.",
    muster: [
      { such: MEINUNG, ok: "Du sagst deine Meinung.", fehlt: "Sag deine Meinung deutlich: Meiner Meinung nach … / Ich bin der Meinung, dass … / Ich bin unentschieden, weil …" },
      { such: "weil|denn|deshalb|deswegen|darum|da\\s", ok: "Du begründest deine Meinung.", fehlt: "Begründe deine Meinung: …, weil … / …, denn …" },
      { such: "zum beispiel|z\\. ?b\\.|beispielsweise|zum anderen", ok: "Du nennst ein Beispiel.", fehlt: "Nenne ein Beispiel: Zum Beispiel …" },
      { such: "zuerst|erstens|außerdem|ein weiterer|zweitens|schließlich|auch", ok: "Du verknüpfst deine Argumente.", fehlt: "Verknüpfe deine Argumente: zuerst, außerdem, ein weiterer Punkt ist, schließlich …" },
      { such: "praktikum|ausland|azubi|ausbildung", ok: "Du bleibst beim Thema.", fehlt: "Schreib über das Thema: Praktikum im Ausland." },
      { such: STRUKTUREN, ok: "Du wagst längere Sätze – das gibt Punkte.", fehlt: "Tipp: Wag auch einen längeren Satz: obwohl …, wenn …, …, der/die …, würde …, um … zu … Das gibt Punkte, auch mit kleinen Fehlern." },
    ],
    checkliste: [
      "Meine Meinung ist deutlich: dafür, dagegen oder unentschieden – und ich sage, warum.",
      "Ich nenne mindestens zwei Argumente.",
      "Meine Begründungen sind echt (nicht nur „weil es gut ist“).",
      "Ich erkläre meine Argumente oder gebe Beispiele.",
      "Nach „weil“ und „dass“ steht das Verb am Ende.",
    ],
  },
  waechter: {
    name: "Der Zauderer",
    bild: "boss_zauderer",
    lp: 100,
    schaden: 20,
    einleitung: "Kämpfen? Hm … vielleicht. Oder doch nicht? Warum? Darum! … Ich bin der Zauderer. Ich sage nie, was ich denke – und schon gar nicht, warum!",
    spott: [
      "Vielleicht … vielleicht auch nicht …",
      "Es kommt darauf an …",
      "Warum? Darum!",
      "Meinung? Was ist das?",
    ],
    sieg: [
      "Die Waage in der Hand des Zauderers kommt endlich zur Ruhe.",
      "„Du … sagst klar, was du denkst. Und du hast gute Gründe. Nimm die Rolle des Fürsprechers.“",
    ],
    niederlage: [
      "„Siehst du? Man kann sich eben nicht entscheiden …“",
      "Übe an den Kristallen und komm mit klaren Argumenten zurück!",
    ],
    fragen: [
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist eine klare Meinung?“",
        optionen: ["Ich bin dafür, dass jeder Azubi ins Ausland geht.", "Das Thema ist interessant.", "Vielleicht, vielleicht auch nicht."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Ha! Wer unentschieden ist, hat verloren! … Oder?“",
        optionen: [
          "Nein. Auch „Ich bin unentschieden“ ist eine Meinung – wenn ich sage, warum.",
          "Ja. Man muss immer dafür oder dagegen sein.",
          "Ja. Dann schreibt man lieber gar nichts.",
        ],
        richtig: 0,
        erklaerung: "In der Prüfung zählt auch eine unentschiedene Meinung. Wichtig sind die Gründe: Einerseits …, andererseits …",
      },
      {
        typ: "auswahl",
        frage: "„Welche Begründung ist echt?“",
        optionen: ["…, weil man im Ausland jeden Tag eine Fremdsprache spricht.", "…, weil es eben so ist.", "…, weil ich das sage."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist richtig?“",
        optionen: ["Meiner Meinung nach ist das wichtig.", "Meiner Meinung nach das ist wichtig.", "Meiner Meinung nach wichtig ist das."],
        richtig: 0,
        erklaerung: "Nach „Meiner Meinung nach“ kommt gleich das Verb.",
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist richtig?“",
        optionen: ["Ich bin dagegen, weil ein Praktikum im Ausland teuer ist.", "Ich bin dagegen, weil ein Praktikum im Ausland ist teuer.", "Ich bin dagegen, denn ein Praktikum im Ausland teuer ist."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Was ist ein Argument GEGEN ein Praktikum im Ausland?“",
        optionen: ["Man ist lange weg von seiner Familie.", "Man lernt eine neue Sprache.", "Man wird selbstständiger."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Womit machst du ein Argument deutlicher?“",
        optionen: ["mit einem Beispiel", "mit einem Ausrufezeichen", "mit einem sehr langen Wort"],
        richtig: 0,
      },
      {
        typ: "luecke",
        frage: "„Ergänze – wenn du dich entscheiden kannst!“",
        text: "Man lernt eine neue Sprache. {Außerdem} findet man neue Freunde.",
        auswahl: true,
        ablenker: ["Weil", "Obwohl", "Dass"],
      },
      {
        typ: "auswahl",
        frage: "„Wie nennst du ein Gegenargument?“",
        optionen: ["Ein Praktikum ist zwar teuer, aber es lohnt sich.", "Ein Praktikum ist teuer, deshalb weiß ich nicht.", "Teuer, billig, egal."],
        richtig: 0,
      },
      {
        typ: "ordnen",
        frage: "„Bau einen klaren Satz!“",
        teile: ["Ich", "bin", "der Meinung,", "dass", "ein Praktikum im Ausland", "sinnvoll", "ist."],
        erklaerung: "Nach „dass“ steht das Verb (ist) am Ende.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Quest 5: Die Insel des Siegels – Schluss
// ---------------------------------------------------------------------------

const Q5 = {
  id: "q5",
  insel: "Die Insel des Siegels",
  lernziel: "Einen Schluss schreiben",
  rolle: "rolle_vollendung",
  rollenName: "Rolle der Vollendung",
  farbe: "#b48aff",
  lyra: [
    "Die letzte Insel: die Insel des Siegels. Jeder gute Text braucht ein Ende.",
    "Im Schluss fasst du deine Meinung kurz zusammen und verabschiedest dich von deinen Lesern.",
    "Neue Argumente gehören nicht mehr hierher!",
    "Der Wächter dieser Insel ist das Endlose Echo. Sein Text hört nie auf … Setz ihm ein Ende!",
  ],
  stationen: [
    {
      id: "lythara_q5_s1",
      name: "Siegel der Meinung",
      inschrift: "Fasse zusammen, was du gesagt hast.",
      aufgaben: [
        {
          typ: "zuordnen",
          frage: "Mit diesen Ausdrücken fasst du deine Meinung zusammen. Verbinde.",
          paare: [
            ["Aus diesen Gründen", "finde ich ein Praktikum im Ausland sinnvoll."],
            ["Zusammenfassend kann ich sagen,", "dass sich ein Praktikum im Ausland lohnt."],
            ["Deshalb", "bin ich für ein Praktikum im Ausland."],
          ],
          erklaerung: "Nach „Aus diesen Gründen“ und „Deshalb“ steht gleich das Verb. Nach „dass“ steht es am Ende.",
        },
        {
          typ: "auswahl",
          frage: "Welcher Satz ist ein guter Schluss für die Stellungnahme?",
          optionen: [
            "Aus den genannten Gründen bin ich der Meinung, dass alle Azubis diese Chance nutzen sollten.",
            "Ein weiteres Argument ist, dass man in Spanien gut essen kann.",
            "Ich habe keine Meinung.",
          ],
          richtig: 0,
          erklaerung: "Im Schluss wiederholst du deine Meinung kurz. Ein neues Argument passt hier nicht mehr. Und „Ich habe keine Meinung“ ohne Grund ist kein guter Schluss.",
        },
        {
          typ: "ordnen",
          frage: "Bau den Schlusssatz.",
          teile: ["Aus diesen Gründen", "bin", "ich", "für", "ein Praktikum", "im Ausland."],
          loesungen: ["Ich bin aus diesen Gründen für ein Praktikum im Ausland."],
        },
      ],
    },
    {
      id: "lythara_q5_s2",
      name: "Siegel der Leser",
      inschrift: "Verabschiede dich von denen, die dich lesen.",
      aufgaben: [
        (z) => ({
          typ: "zuordnen",
          frage: "Was macht die Schreiberin in ihrem Briefschluss? Verbinde.",
          paare: [
            ["Ich hoffe, euch hat mein Beitrag gefallen.", "Sie wünscht sich etwas."],
            ["Was meint ihr? Schreibt mir!", "Sie fordert die Leser zu etwas auf."],
            ["Ich bin gespannt auf eure Antworten.", "Sie freut sich auf etwas."],
            ["Viele Grüße", "Sie grüßt die Leser."],
            [z.held?.name || "Mira", "Sie schreibt ihren Namen."],
          ],
        }),
        {
          typ: "richtigfalsch",
          frage: "Was gehört in einen guten Schluss?",
          aussagen: [
            ["Ich fasse meine Meinung kurz zusammen.", true],
            ["Ich nenne drei neue Argumente.", false],
            ["Ich grüße meine Leser.", true],
            ["Ich erzähle eine lange neue Geschichte.", false],
            ["Ich schreibe meinen Namen unter den Text.", true],
          ],
        },
        {
          typ: "luecke",
          frage: "Ergänze den Briefschluss.",
          text: "Das war meine Meinung zum Thema. Ich {hoffe}, euch hat mein Beitrag gefallen. Ich bin schon {gespannt} auf eure Antworten!\n{Viele} Grüße",
          auswahl: true,
          ablenker: ["hoffen", "langweilig", "Freundlich"],
        },
      ],
    },
    {
      id: "lythara_q5_s3",
      name: "Siegel der Form",
      inschrift: "Jeder Text hat seinen eigenen Gruß.",
      aufgaben: [
        {
          typ: "zuordnen",
          frage: "Welcher Gruß passt zu welchem Text?",
          paare: [
            ["Beitrag in einem Forum für Jugendliche", "Viele Grüße / Bis bald"],
            ["Bewerbung bei einer Firma", "Mit freundlichen Grüßen"],
            ["Nachricht an deine beste Freundin", "Hab dich lieb! / Liebe Grüße"],
          ],
          ablenker: ["Hochachtungsvoll"],
        },
        {
          typ: "auswahl",
          frage: "Wie beginnt man einen Satz im Schluss am besten?",
          optionen: ["Abschließend möchte ich sagen, dass …", "Am Anfang möchte ich sagen, dass …", "Ein weiteres Argument ist, dass …"],
          richtig: 0,
        },
        {
          typ: "auswahl",
          frage: "Ein Text in einem Forum für Jugendliche. Welcher Schluss passt?",
          optionen: [
            "Ich hoffe, ihr schreibt mir eure Meinung! Viele Grüße Sami",
            "Mit freundlichen Grüßen Sami Yilmaz",
            "Tschüss!!!!!!!!",
          ],
          richtig: 0,
          erklaerung: "Im Forum duzt man sich: ihr, euch. „Mit freundlichen Grüßen“ passt zu Briefen an Firmen oder Ämter.",
        },
      ],
    },
  ],
  pult: "Pult der Vollendung",
  text: {
    typ: "freitext",
    id: "lythara_q5_text",
    frage: "Schreibe jetzt den Schluss deines Forumsbeitrags (3–4 Sätze): Fasse deine Meinung kurz zusammen, sprich die Leser an und verabschiede dich mit Gruß und Namen.",
    minWoerter: 25,
    stichpunkte: (z) => `Redemittel: Aus diesen Gründen bin ich der Meinung, dass … · Zusammenfassend kann ich sagen, dass … · Ich hoffe, euch hat mein Beitrag gefallen. · Was meint ihr? · Ich bin gespannt auf eure Antworten. · Viele Grüße ${z.held?.name || "…"} (nach dem Gruß kein Komma)`,
    muster: [
      { such: "aus diesen gründen|zusammenfassend|deshalb|deswegen|zum schluss|insgesamt|also", ok: "Du fasst deine Meinung zusammen.", fehlt: "Fasse deine Meinung zusammen: Aus diesen Gründen … / Zusammenfassend …" },
      { such: "ihr|euch|eure", ok: "Du sprichst die Leser an.", fehlt: "Sprich die Leser an: Was meint ihr? / Ich hoffe, euch …" },
      { such: "grüße|gruß|bis bald|ciao|tschüss", ok: "Du verabschiedest dich.", fehlt: "Verabschiede dich: Viele Grüße / Bis bald" },
      { such: "\\n\\s*\\S+(\\s+\\S+){0,2}\\s*$", ok: "Dein Name steht in der letzten Zeile.", fehlt: "Schreib deinen Namen allein in die letzte Zeile." },
    ],
    checkliste: [
      "Ich fasse meine Meinung kurz zusammen.",
      "Ich nenne keine neuen Argumente.",
      "Ich spreche die Leser an.",
      "Am Ende stehen ein Gruß und mein Name.",
    ],
  },
  waechter: {
    name: "Das Endlose Echo",
    bild: "boss_echo",
    lp: 100,
    schaden: 20,
    einleitung: "… und dann … und dann … und noch ein Argument … und noch eins … Ich bin das Endlose Echo! Mein Text hört NIE auf. Und deiner auch nicht … und dann … und dann …",
    spott: [
      "… und noch ein Punkt … und noch einer …",
      "Ein Ende? Nie!",
      "Ich habe noch tausend Sätze!",
      "… und außerdem … und außerdem …",
    ],
    sieg: [
      "Das Echo wird leiser … und leiser … und verstummt.",
      "„Endlich … ein Ende. Ein gutes Ende. Nimm die Rolle der Vollendung.“",
    ],
    niederlage: [
      "„… und dann … und dann … hehe …“",
      "Das Echo hallt weiter. Übe an den Kristallen und komm zurück!",
    ],
    fragen: [
      {
        typ: "auswahl",
        frage: "„Was gehört NICHT in den Schluss?“",
        optionen: ["ein ganz neues Argument", "eine kurze Zusammenfassung", "ein Gruß"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz fasst die Meinung zusammen?“",
        optionen: ["Aus diesen Gründen bin ich für ein Praktikum im Ausland.", "Zuerst möchte ich sagen, dass …", "Mein Bruder war in Italien."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Gruß passt in ein Forum?“",
        optionen: ["Viele Grüße", "Mit freundlichen Grüßen", "Hochachtungsvoll"],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz spricht die Leser an?“",
        optionen: ["Was meint ihr dazu?", "Das Thema ist wichtig.", "Jonas ist Koch."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Welcher Satz ist richtig?“",
        optionen: ["Aus diesen Gründen finde ich das sinnvoll.", "Aus diesen Gründen ich finde das sinnvoll.", "Aus diesen Gründen finde das ich sinnvoll."],
        richtig: 0,
      },
      {
        typ: "auswahl",
        frage: "„Was steht ganz am Ende des Forumsbeitrags?“",
        optionen: ["dein Name", "die Überschrift", "die Quelle"],
        richtig: 0,
      },
      {
        typ: "luecke",
        frage: "„Vervollständige meinen Satz … wenn du kannst …“",
        text: "Ich bin schon {gespannt} auf eure Antworten.",
        auswahl: true,
        ablenker: ["spannend", "spannen", "gespannen"],
      },
      {
        typ: "ordnen",
        frage: "„Setz meinem Text ein Ende!“",
        teile: ["Ich", "hoffe,", "euch", "hat", "mein Beitrag", "gefallen."],
      },
    ],
  },
};

export const INSELN = [Q2, Q3, Q4, Q5];

// ---------------------------------------------------------------------------
// Finale: Das Buch der Stimmen – der ganze Forumsbeitrag
// ---------------------------------------------------------------------------

/** Setzt die gespeicherten Teiltexte zu einem Entwurf zusammen. */
function entwurf(z) {
  const teile = ["lythara_einleitung", "lythara_q2_text", "lythara_q3_text", "lythara_q4_text", "lythara_q5_text"]
    .map((id) => z.texte?.[id]?.text?.trim())
    .filter(Boolean);
  return teile.join("\n\n");
}

export const BUCH = {
  typ: "freitext",
  id: "lythara_buch",
  lesetext: TEXT,
  vorlage: entwurf,
  frage: `Schreibe jetzt deinen ganzen Forumsbeitrag zu Jonas' Text und zur Frage „${FRAGE}“. Deine fünf Texte aus dem Turm und von den Inseln stehen schon da. Lies alles noch einmal, verbinde die Teile mit Überleitungen und verbessere deinen Text.`,
  minWoerter: 180,
  stichpunkte: "So ist dein Beitrag aufgebaut: 1. Überschrift und Einleitung · 2. Wiedergabe von Jonas' Text · 3. Deine Erfahrungen · 4. Deine Meinung mit Begründungen · 5. Schluss mit Gruß und Namen. Diese Reihenfolge ist ein guter Plan – in der Prüfung darfst du die drei Punkte (Wiedergabe, Erfahrungen, Meinung) aber auch anders ordnen. In der echten Prüfung hast du dafür 75 Minuten Zeit. Niemand zählt dort die Wörter – wichtig ist, dass du alle Punkte ausführlich bearbeitest. Trau dich auch an längere Sätze (weil, obwohl, Relativsätze, würde …): Das gibt Punkte, auch wenn noch Fehler drin sind.",
  muster: [
    { such: "^\\s*[^\\n]{3,80}\\n", ok: "Überschrift", fehlt: "Schreib eine Überschrift in die erste Zeile." },
    { such: "hallo|liebe", ok: "Anrede", fehlt: "Sprich die Leser am Anfang an: Hallo zusammen, …" },
    { such: "geht es um|handelt von|thema", ok: "Thema genannt", fehlt: "Nenne in der Einleitung das Thema: In dem Beitrag geht es um …" },
    { such: "gelesen|forum|startklar|beitrag", ok: "Einleitung mit Quelle", fehlt: "Nenne in der Einleitung die Quelle: Ich habe im Forum … gelesen." },
    { such: "jonas[\\s\\S]*(berichtet|erzählt|schreibt|meint|ist der meinung|findet|laut|nach meinung)|laut jonas", ok: "Wiedergabe von Jonas' Text", fehlt: "Gib wieder, was Jonas schreibt: Jonas berichtet, dass … / Laut Jonas …" },
    { such: ABGESCHRIEBEN, ok: "Nicht abgeschrieben", fehlt: "Du hast Sätze von Jonas abgeschrieben. Benutze eigene Worte!" },
    { such: KEIN_ZITAT, ok: "Keine langen Zitate", fehlt: "Wörtliche Rede („…“) zählt nicht als eigene Leistung. Gib Jonas' Aussagen mit eigenen Worten wieder." },
    { such: "erfahrung|erlebt|letzte[nms]? (jahr|sommer|woche|monat)|bei uns|in meiner (klasse|schule|firma)", ok: "Eigene Erfahrungen", fehlt: "Erzähle ausführlich von deinen Erfahrungen." },
    { such: MEINUNG, ok: "Deine Meinung", fehlt: "Sag deine Meinung deutlich (dafür, dagegen oder unentschieden)." },
    { such: "weil|denn|deshalb", ok: "Begründungen", fehlt: "Begründe deine Meinung: weil … / denn …" },
    { such: STRUKTUREN, ok: "Längere Satzstrukturen", fehlt: "Tipp: Wag auch längere Sätze (obwohl, wenn, Relativsatz, würde, um … zu …). Das gibt Punkte, auch mit kleinen Fehlern." },
    { such: "grüße|gruß|bis bald", ok: "Schluss mit Gruß", fehlt: "Beende deinen Beitrag mit einem Gruß und deinem Namen." },
  ],
  // Selbstcheck nach den Kriterien der Prüfung (Handreichung Schriftliche Kommunikation)
  checkliste: [
    "Textsorte: Überschrift, Anrede, Thema und Quelle stehen am Anfang.",
    "Wiedergabe: Man erkennt Jonas' wichtigste Aussagen – mit meinen eigenen Worten, ohne Abschreiben und ohne Zitate.",
    "Erfahrungen: Ich berichte ausführlich und mit Details.",
    "Meinung: Man versteht meine Meinung, und ich begründe sie.",
    "Zusammenhang: Die Teile sind mit Überleitungen verbunden.",
    "Sprache: Ich habe meinen Text noch einmal gelesen und Fehler verbessert.",
  ],
};
