// Vocantia – Reich des Sprechens: Inhalte der fünf Quests und des Schweigekönigs.
// Grundlage: DSD I PRO Mündliche Kommunikation (docs/dsd_pruefung.md):
//   Teil 1 Gespräch zu Themen wie Praktikum, Berufswahl, Familie, Jobs, Berufsschule, Interkulturelles, Zukunft
//   Teil 2 Präsentation aus dem berufsbildenden Bereich mit Nachfragen
// Jede Quest mischt Übungen ohne Mikrofon (Redemittel, Struktur) mit Sprechaufgaben (typ "sprechen":
// Sprechuhr oder Stimmkristall) und einer Partnerübung. Alle Texte sind eigene Texte.

const CHECK_GANZ = "Ich habe in ganzen Sätzen gesprochen.";
const CHECK_WEIL = "Ich habe mindestens einmal etwas begründet (weil, denn, deshalb …).";
const CHECK_BEISPIEL = "Ich habe ein Beispiel oder ein Detail genannt.";

// ---------- Quest 1: Erste Worte (über sich sprechen) ----------

export const ERSTE_WORTE = [
  {
    typ: "auswahl",
    frage: "Die Prüferin sagt: „Erzählen Sie doch mal etwas über Ihre Familie.“ Welche Antwort ist am besten?",
    optionen: [
      "Ich habe eine große Familie. Ich wohne mit meinen Eltern und zwei Brüdern zusammen. Mein älterer Bruder macht eine Ausbildung als Elektriker, deshalb hilft er mir oft bei Fragen zum Beruf.",
      "Meine Familie ist gut.",
      "Ja.",
    ],
    richtig: 0,
    erklaerung: "In der Prüfung zählt: ausführlich antworten. Sag mehr als einen Satz, nenne Details und begründe etwas.",
  },
  {
    typ: "luecke",
    frage: "So wird aus einer kurzen Antwort eine gute Antwort. Ergänze die Verbindungswörter.",
    text: "Ich spreche drei Sprachen: Arabisch, Englisch {und} Deutsch. Deutsch lerne ich seit zwei Jahren, {weil} ich hier eine Ausbildung machen möchte. {Außerdem} sehe ich gern deutsche Serien, {denn} so lerne ich viele neue Wörter.",
    auswahl: true,
    ablenker: ["aber", "obwohl"],
  },
  {
    typ: "sprechen",
    frage: "Stell dich vor: Wie heißt du, wie alt bist du, woher kommst du, wo wohnst du und welche Sprachen sprichst du?",
    dauer: 30,
    hilfen: "Ich heiße … · Ich bin … Jahre alt. · Ich komme aus … und wohne seit … in … · Ich spreche … Am besten spreche ich …, weil …",
    checkliste: [CHECK_GANZ, "Ich habe mindestens vier Informationen über mich genannt."],
  },
  {
    typ: "sprechen",
    frage: "Erzähl von deiner Familie.",
    laut: "Erzähl mir bitte etwas über deine Familie.",
    partner: { a: "Lies die Frage vor (oder drück auf „Anhören“) und hör gut zu. Danach hakst du den Partnercheck ab.", b: "Antworte ausführlich. Danach tauscht ihr die Rollen und sprecht noch einmal." },
    dauer: 30,
    hilfen: "In meiner Familie sind wir … Personen. · Mein Vater / Meine Mutter arbeitet als … · Ich habe … Geschwister. · Am meisten mag ich …, weil …",
    checkliste: ["B hat mindestens drei Personen beschrieben.", "B hat in ganzen Sätzen gesprochen.", "Wir haben danach die Rollen getauscht."],
  },
  {
    typ: "sprechen",
    frage: "Was machst du in deiner Freizeit? Erzähl ausführlich und begründe, warum dir das gefällt.",
    dauer: 30,
    hilfen: "In meiner Freizeit … gern … · Am Wochenende … · Das macht mir Spaß, weil … · Früher habe ich …, aber jetzt …",
    checkliste: [CHECK_GANZ, CHECK_WEIL],
  },
];

// ---------- Quest 2: Der Markt der Rollen (Gespräche, Rollenspiele, Nachfragen) ----------

export const MARKT = [
  {
    typ: "zuordnen",
    frage: "Im Gespräch brauchst du Redemittel. Wofür benutzt du sie? Zwei Funktionen bleiben übrig.",
    paare: [
      ["Können Sie die Frage bitte wiederholen?", "nachfragen"],
      ["Wie meinen Sie das genau?", "um eine Erklärung bitten"],
      ["Moment, da muss ich kurz überlegen.", "Zeit gewinnen"],
      ["Da bin ich anderer Meinung.", "widersprechen"],
    ],
    ablenker: ["sich verabschieden", "sich entschuldigen"],
  },
  {
    typ: "auswahl",
    frage: "In der Prüfung kennst du ein Wort in der Frage nicht. Was sagst du?",
    optionen: ["Entschuldigung, was bedeutet das Wort „…“?", "Ich sage nichts und warte.", "Ich antworte einfach irgendetwas."],
    richtig: 0,
    erklaerung: "Nachfragen ist erlaubt und gehört zu einem guten Gespräch!",
  },
  {
    typ: "auswahl",
    frage: "Die Prüferin fragt: „Wo haben Sie Ihr Praktikum gemacht?“ Du hast noch kein Praktikum gemacht. Was antwortest du?",
    optionen: [
      "Ich habe noch kein Praktikum gemacht. Aber im Frühling möchte ich ein Praktikum in einer Autowerkstatt machen, weil mich Technik interessiert.",
      "Nein.",
      "Das weiß ich nicht.",
    ],
    richtig: 0,
    erklaerung: "Auch wenn du etwas noch nicht gemacht hast: Erzähl, was du planst oder dir wünschst – und warum.",
  },
  {
    typ: "sprechen",
    frage: "Rollenspiel: Ein Anruf bei einer Firma. B möchte ein Praktikum machen.",
    laut: "Guten Tag, Firma Berger, was kann ich für Sie tun?",
    partner: {
      a: "Du arbeitest bei der Firma Berger. Beginne mit „Guten Tag, Firma Berger …“. Frag nach: Name? Wann? Wie lange? Welche Erfahrung?",
      b: "Du rufst an und fragst nach einem Praktikumsplatz. Stell dich vor, sag, wann und wie lange du ein Praktikum machen möchtest, und frag nach den Arbeitszeiten.",
    },
    dauer: 45,
    hilfen: "Guten Tag, mein Name ist … · Ich interessiere mich für ein Praktikum als … · Hätten Sie im … einen Platz frei? · Wie sind die Arbeitszeiten? · Vielen Dank für die Information!",
    checkliste: ["B hat sich vorgestellt und gesagt, was B möchte.", "A und B haben mindestens zwei Fragen gestellt.", "Das Gespräch hatte einen höflichen Anfang und ein höfliches Ende."],
  },
  {
    typ: "sprechen",
    frage: "Erzähl von einem Job, einem Praktikum oder einer Arbeit zu Hause, die du schon gemacht hast. Was hast du gemacht? Wie war es?",
    dauer: 45,
    hilfen: "Letzten Sommer habe ich … gearbeitet. · Ich musste … · Am Anfang war es …, aber später … · Am besten hat mir gefallen, dass …",
    checkliste: [CHECK_GANZ, CHECK_BEISPIEL, "Ich habe erzählt, wie es mir gefallen hat."],
  },
];

// ---------- Quest 3: Die Halle der Dinge (Gegenstände präsentieren, beschreiben) ----------

export const HALLE = [
  {
    typ: "zuordnen",
    frage: "So präsentierst du einen Gegenstand. Welches Redemittel passt zu welchem Schritt? Ein Redemittel bleibt übrig.",
    paare: [
      ["Was ist das?", "Das ist ein … / Das hier nennt man …"],
      ["Wofür braucht man es?", "Man braucht es, um … zu …"],
      ["Woraus ist es?", "Es ist aus Metall / Holz / Kunststoff."],
      ["Wie benutzt man es?", "Zuerst … , dann … , zum Schluss …"],
      ["Deine Meinung", "Ich finde es sehr praktisch, weil …"],
    ],
    ablenker: ["Sehr geehrte Damen und Herren, …"],
  },
  {
    typ: "luecke",
    frage: "Ergänze die Sätze mit „um … zu“.",
    text: "Eine Säge braucht man, {um} Holz {zu} schneiden.\nEin Messgerät braucht man, {um} die Länge genau {zu} messen.",
    auswahl: true,
    ablenker: ["damit", "für", "dass"],
  },
  {
    typ: "auswahl",
    frage: "Du beschreibst einen Gegenstand, bist dir aber nicht sicher, wofür man ihn braucht. Was sagst du?",
    optionen: ["Ich vermute, dass man es zum … braucht.", "Das ist bestimmt ein … , ganz sicher!", "Keine Ahnung."],
    richtig: 0,
    erklaerung: "Vermutungen: Ich vermute, dass … · Vielleicht … · Es sieht so aus, als ob …",
  },
  {
    typ: "sprechen",
    frage: "Präsentiere einen Gegenstand aus deinem (Wunsch-)Beruf oder deinem Praktikum – zum Beispiel ein Werkzeug, ein Gerät oder ein Computerprogramm. Was ist das? Wofür braucht man es? Wie benutzt man es?",
    dauer: 45,
    hilfen: "Ich möchte euch heute … zeigen. · Das ist ein … · Man braucht es, um … zu … · Es ist aus … · Zuerst … , dann … · Ich finde es …, weil …",
    checkliste: ["Ich habe gesagt, was das ist und wofür man es braucht.", "Ich habe erklärt, wie man es benutzt.", "Ich habe meine Meinung gesagt und begründet."],
  },
  {
    typ: "sprechen",
    frage: "Ratespiel: Beschreibe einen Gegenstand im Raum, ohne seinen Namen zu sagen.",
    laut: "Beschreibe einen Gegenstand im Raum, ohne seinen Namen zu sagen.",
    partner: { a: "Hör zu und rate, welcher Gegenstand gemeint ist. Danach tauscht ihr.", b: "Such dir heimlich einen Gegenstand im Raum aus. Beschreibe Form, Farbe, Material und wofür man ihn braucht – aber sag nicht den Namen!" },
    dauer: 30,
    hilfen: "Er/Sie/Es ist … (groß, klein, rund, eckig) · Er ist aus … · Man braucht ihn, um … zu … · Er steht/liegt/hängt … (links, neben, auf …)",
    checkliste: ["B hat Form, Farbe oder Material beschrieben.", "B hat gesagt, wofür man den Gegenstand braucht.", "A hat den Gegenstand erraten (oder fast!)."],
  },
];

// ---------- Quest 4: Die Ratsrunde (Meinung sagen und begründen, diskutieren) ----------

export const RAT = [
  {
    typ: "ordnen",
    frage: "Bau eine begründete Meinung.",
    teile: ["Ich bin der Meinung,", "dass ein Praktikum wichtig ist,", "weil man", "den Beruf", "von innen", "kennenlernt."],
  },
  {
    typ: "auswahl",
    frage: "Welche Antwort ist im Gespräch am überzeugendsten?",
    optionen: [
      "Ich finde Teamarbeit wichtig, weil man voneinander lernt. In meinem Praktikum hat mir zum Beispiel eine Kollegin gezeigt, wie man schneller arbeitet.",
      "Ich finde Teamarbeit wichtig.",
      "Teamarbeit ist wichtig, weil sie wichtig ist.",
    ],
    richtig: 0,
    erklaerung: "Meinung + Begründung + Beispiel: So überzeugst du.",
  },
  {
    typ: "zuordnen",
    frage: "Diese Wörter gehören zusammen. Welcher zweite Teil passt? Ein Teil bleibt übrig.",
    paare: [
      ["Einerseits …", "… andererseits …"],
      ["Zwar …", "… aber …"],
      ["Nicht nur …", "… sondern auch …"],
      ["Entweder …", "… oder …"],
    ],
    ablenker: ["… weil …"],
  },
  {
    typ: "sprechen",
    frage: "Was ist dir bei deinem zukünftigen Beruf am wichtigsten: ein gutes Gehalt, Spaß an der Arbeit oder ein sicherer Arbeitsplatz? Begründe deine Meinung.",
    dauer: 45,
    hilfen: "Für mich ist … am wichtigsten, weil … · Zwar ist … wichtig, aber … · Zum Beispiel … · Deshalb …",
    checkliste: [CHECK_WEIL, CHECK_BEISPIEL, "Ich habe auch die andere Seite kurz erwähnt (zwar …, aber …)."],
  },
  {
    typ: "sprechen",
    frage: "Diskussion: Sollten alle Azubis eine Zeit lang im Ausland arbeiten?",
    laut: "Sollten alle Auszubildenden eine Zeit lang im Ausland arbeiten?",
    partner: { a: "Du bist DAFÜR. Nenne zwei Gründe.", b: "Du bist DAGEGEN. Nenne zwei Gründe und reagiere auf A („Das stimmt, aber …“)." },
    dauer: 60,
    hilfen: "Ich bin dafür/dagegen, weil … · Da hast du recht, aber … · Das sehe ich anders: … · Ein weiterer Grund ist …",
    checkliste: ["A und B haben je zwei Gründe genannt.", "Wir haben aufeinander reagiert.", "Wir haben einander ausreden lassen."],
  },
];

// ---------- Quest 5: Die Bühne am See (Präsentation, Teil 2) ----------

export const BUEHNE = [
  {
    typ: "ordnen",
    frage: "In welcher Reihenfolge baust du eine Präsentation auf?",
    teile: ["Begrüßung und Thema", "→ Gliederung", "→ Hauptteil mit Beispielen", "→ eigene Erfahrung oder Meinung", "→ Zusammenfassung", "→ Dank und Fragen"],
  },
  {
    typ: "zuordnen",
    frage: "Welches Redemittel passt zu welchem Teil der Präsentation? Eins bleibt übrig.",
    paare: [
      ["Einstieg", "Heute möchte ich euch meinen Ausbildungsberuf vorstellen."],
      ["Gliederung", "Zuerst erzähle ich …, danach … und zum Schluss …"],
      ["Überleitung", "Damit komme ich zum nächsten Punkt."],
      ["Schluss", "Zusammenfassend kann ich sagen, dass …"],
      ["Ende", "Vielen Dank für eure Aufmerksamkeit! Habt ihr Fragen?"],
    ],
    ablenker: ["Mit freundlichen Grüßen"],
  },
  {
    typ: "freitext",
    id: "vocantia_stichworte",
    frage: "Schreib deinen Stichwortzettel für eine Präsentation über deinen Ausbildungsberuf, deinen Wunschberuf oder deinen Praktikumsbetrieb. Nur Stichpunkte – keine ganzen Sätze! Du findest ihn später im Heldenpass.",
    minWoerter: 25,
    stichpunkte: "Vorschlag: 1. Thema · 2. Gliederung · 3. Was macht man in dem Beruf? (Aufgaben, Arbeitsort, Arbeitszeiten) · 4. Ausbildung (Dauer, Schule, Betrieb) · 5. Eigene Erfahrung/Meinung · 6. Schluss",
    muster: [
      { such: "beruf|ausbildung|praktikum|betrieb|firma", ok: "Du nennst dein Thema.", fehlt: "Nenne das Thema: Welcher Beruf / welcher Betrieb?" },
      { such: "aufgabe|arbeit|macht|tätig", ok: "Du hast Stichpunkte zu den Aufgaben.", fehlt: "Was macht man in dem Beruf? Schreib Stichpunkte zu den Aufgaben." },
      { such: "meinung|finde|gefällt|erfahrung|warum|weil", ok: "Du planst deine Meinung oder Erfahrung ein.", fehlt: "Plane einen Punkt für deine Meinung oder Erfahrung ein." },
    ],
    checkliste: ["Mein Zettel hat eine klare Reihenfolge.", "Ich habe nur Stichpunkte geschrieben, keine langen Sätze."],
  },
  {
    typ: "sprechen",
    frage: "Halte deine Präsentation mit deinem Stichwortzettel. Sprich frei – lies nicht ab!",
    dauer: 90,
    hilfen: "Heute möchte ich euch … vorstellen. · Zuerst … , danach … , zum Schluss … · Damit komme ich zu … · Zum Beispiel … · Zusammenfassend … · Vielen Dank! Habt ihr Fragen?",
    checkliste: ["Ich habe mit Begrüßung und Thema angefangen.", "Ich habe die Gliederung genannt und Überleitungen benutzt.", "Ich habe frei gesprochen und nur ab und zu auf den Zettel geschaut.", "Ich habe einen Schluss gemacht und für Fragen gedankt."],
  },
  {
    typ: "sprechen",
    frage: "Nachfragen nach der Präsentation: A stellt zwei Fragen, B antwortet.",
    laut: "Ich habe noch eine Frage zu deiner Präsentation.",
    partner: { a: "Stell B zwei Fragen zur Präsentation, z. B.: „Was gefällt dir an dem Beruf nicht so gut?“ oder „Wie lange dauert die Ausbildung?“", b: "Antworte ausführlich. Wenn du etwas nicht weißt, sag es ehrlich und erzähl, was du vermutest." },
    dauer: 45,
    hilfen: "Das ist eine gute Frage. · Soweit ich weiß, … · Ich bin nicht ganz sicher, aber ich vermute, dass … · Das habe ich in meiner Präsentation nicht gesagt, aber …",
    checkliste: ["A hat zwei Fragen gestellt.", "B hat ausführlich geantwortet.", "B hat bei einer schwierigen Frage ein Redemittel benutzt."],
  },
];

// ---------- Der Schweigekönig ----------

const kurz = (frage, hilfen) => ({
  typ: "sprechen", frage, dauer: 20, hilfen,
  checkliste: ["Ich habe in ganzen Sätzen geantwortet und etwas begründet."],
});

export const SCHWEIGEKOENIG = {
  name: "Der Schweigekönig",
  bild: "boss_schweigekoenig",
  lp: 200,
  schaden: 20,
  einleitung: "…… STILLE. Ich bin der Schweigekönig. Seit hundert Wintern herrsche ich über Vocantia. Wörter sind Lärm, Gespräche sind Streit. Ich habe alle Stimmen eingefroren. Und deine? Sprich – wenn du dich traust! Jedes Wort, das du sagst, ist ein Schlag gegen mein Eis.",
  spott: [
    "Psssst …",
    "Schweigen ist Gold!",
    "Deine Stimme zittert ja vor Kälte!",
    "Ein Wort? Zwei? Das schmilzt kein Eis!",
    "Sprich lauter – wenn du kannst!",
  ],
  sieg: [
    "Das Eis auf der Rüstung des Trolls bekommt Risse. Mit lautem Krachen zerspringen seine Ketten.",
    "Die gefrorene Krone tropft. Der Schweigekönig taumelt zurück, hebt die Hand vor die Augen – die Sonne blendet ihn.",
    "„Zu laut … zu warm …“, brummt er. Dann stapft er schwerfällig den Berg hinauf, bis zum Gipfel, und lässt sich dort in den letzten Schnee fallen.",
  ],
  niederlage: [
    "„Hah! Schweigen siegt!“",
    "Eisiger Wind wirft dich zurück. Übe noch einmal bei den Bewohnern und komm mit lauter Stimme wieder!",
  ],
  fragen: [
    kurz("„Erzähl mir von deiner Berufsschule oder deiner Schule. Was gefällt dir dort?“", "An meiner Schule … · Am besten gefällt mir …, weil …"),
    kurz("„Was möchtest du in fünf Jahren machen?“", "In fünf Jahren möchte ich … · Dafür muss ich …"),
    kurz("„Welche Feste feiert man in deinem Herkunftsland? Wie feiert man sie?“", "In meinem Land feiert man … · Dann … · Das gefällt mir, weil …"),
    kurz("„Erzähl mir von einem Praktikum oder Job, den du gern machen würdest.“", "Ich würde gern … · Das finde ich interessant, weil …"),
    kurz("„Was ist für dich ein guter Arbeitsplatz?“", "Für mich ist ein guter Arbeitsplatz … · Wichtig ist mir …, denn …"),
    kurz("„Wer in deiner Familie hat dir bei der Berufswahl geholfen?“", "Mir hat … geholfen. · Sie/Er hat mir gesagt, dass …"),
    {
      typ: "auswahl", frage: "„Was sagst du, wenn du meine Frage nicht verstanden hast?“",
      optionen: ["Können Sie die Frage bitte wiederholen?", "Ich sage gar nichts.", "Das ist egal."], richtig: 0,
    },
    {
      typ: "auswahl", frage: "„Wie machst du eine kurze Antwort länger?“",
      optionen: ["Ich nenne Details, Beispiele und eine Begründung.", "Ich sage denselben Satz zweimal.", "Ich spreche sehr langsam."], richtig: 0,
    },
    {
      typ: "auswahl", frage: "„Was gehört an den Anfang einer Präsentation?“",
      optionen: ["Begrüßung, Thema und Gliederung", "Die Zusammenfassung", "Die Fragen an das Publikum"], richtig: 0,
    },
    {
      typ: "auswahl", frage: "„Du brauchst einen Moment zum Nachdenken. Was sagst du?“",
      optionen: ["Moment, da muss ich kurz überlegen.", "Nächste Frage!", "Keine Ahnung."], richtig: 0,
    },
  ],
};

/** Die fünf Quests (Reihenfolge frei, nach dem Gespräch mit Runa) */
export const QUESTS = [
  {
    id: "vocantia_q1", npc: "npc_eik", name: "Hirte Eik", titel: "Erste Worte", untertitel: "Über sich sprechen · wie DSD Mündlich Teil 1",
    aufgaben: ERSTE_WORTE, gegenstand: "stimme_worte",
    auftrag: "Eik hat zu lange geschwiegen und weiß nicht mehr, wie man sich vorstellt. Zeig ihm, wie man über sich selbst, die Familie und die Freizeit spricht – ausführlich und in ganzen Sätzen.",
    gefroren: "Ein Junge, ganz in Eis erstarrt. Seine Lippen sind blau. Wenn du für ihn sprichst, taut vielleicht das Eis …",
    danach: ["Hhh… ich kann wieder sprechen! Ich bin Eik, der Hirte. Danke, dass du deine Stimme mit mir geteilt hast!", "Hörst du? Im Dorf tropfen die ersten Eiszapfen."],
  },
  {
    id: "vocantia_q2", npc: "npc_brynja", name: "Händlerin Brynja", titel: "Der Markt der Rollen", untertitel: "Gespräche und Rollenspiele · wie DSD Mündlich Teil 1",
    aufgaben: MARKT, gegenstand: "stimme_gespraech",
    auftrag: "Am Markt wurde früher gehandelt, gefragt und gelacht. Spiel mit Brynja kleine Gespräche: nachfragen, reagieren, Zeit gewinnen – wie im Prüfungsgespräch.",
    gefroren: "Eine Händlerin hinter ihrem Stand, mitten im Satz erstarrt. Vor ihr ein Becher heißer Tee – zu Eis gefroren.",
    danach: ["… und deshalb sind meine Wollsocken die wärmsten im ganzen Tal! Oh – wer bist du denn? Danke, du hast mir die Stimme zurückgegeben!"],
  },
  {
    id: "vocantia_q3", npc: "npc_torvald", name: "Schmied Torvald", titel: "Die Halle der Dinge", untertitel: "Gegenstände präsentieren und beschreiben",
    aufgaben: HALLE, gegenstand: "stimme_dinge",
    auftrag: "In der Langhalle liegen Werkzeuge, die niemand mehr erklären kann. Beschreibe Dinge und Arbeitsschritte so genau, dass jeder sie versteht.",
    gefroren: "Ein Schmied mit erhobenem Hammer, steif wie eine Statue. Um ihn herum liegen Werkzeuge, die niemand mehr erklären kann.",
    danach: ["Ha! Mein Hammer! Und meine Stimme! Ich bin Torvald. Du erklärst Werkzeuge besser als mein bester Lehrling!"],
  },
  {
    id: "vocantia_q4", npc: "npc_halvar", name: "Ratsältester Halvar", titel: "Die Ratsrunde", untertitel: "Meinungen sagen, begründen und diskutieren",
    aufgaben: RAT, gegenstand: "stimme_meinung",
    auftrag: "Im Rat wird über das Dorf entschieden – aber nur, wenn jemand seine Meinung sagt. Sag deine Meinung, begründe sie und reagiere auf andere.",
    gefroren: "Ein alter Mann am Ratsfeuer. Das Feuer ist zu Eis erstarrt, und er auch. Im Rat wurde schon lange nicht mehr diskutiert.",
    danach: ["Endlich wieder eine Diskussion! Ich bin Halvar, der Älteste im Rat. Eine gute Meinung braucht gute Gründe – und die hast du."],
  },
  {
    id: "vocantia_q5", npc: "npc_sigrun", name: "Spielleiterin Sigrun", titel: "Die Bühne am See", untertitel: "Präsentation vorbereiten und halten · wie DSD Mündlich Teil 2",
    aufgaben: BUEHNE, gegenstand: "stimme_buehne",
    auftrag: "Bald ist das Frühlingsfest, und Sigrun wollte eine Präsentation halten. Bereite eine kurze Präsentation vor und halte sie auf der Bühne – wie im Prüfungsteil 2.",
    gefroren: "Auf der Bühne am gefrorenen See steht eine Frau mit ausgebreiteten Armen, als wollte sie gerade etwas ankündigen. Doch kein Ton kommt heraus.",
    danach: ["Meine Damen und Herren … Bühne frei! Ich bin Sigrun. Danke! Deine Präsentation hat sogar das Eis zum Klingen gebracht."],
  },
];
