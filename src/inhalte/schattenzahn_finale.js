// Feste Schattenzahn – Probeprüfung Schriftliche und Mündliche Kommunikation, Morgraths Worte und der Endkampf.
// Schreiben: wie DSD I PRO SK (docs/dsd_pruefung.md) – Forumstext lesen, Beitrag für den Schüler-Blog schreiben:
//   Wiedergabe mit eigenen Worten, eigene Erfahrungen, begründete Meinung; Selbstcheck nach der Handreichung.
// Sprechen: wie DSD I PRO Mündlich – Teil 1 Gespräch, Teil 2 Präsentation mit Nachfragen.
// Alle Texte sind eigene Texte.

// ---------- Grotte der Schreiber: Schriftliche Kommunikation ----------

export const FORUMSTEXT = {
  titel: "Forum „Startklar – Ausbildung und Beruf“",
  text:
`Thema: Ausbildung in der Heimatstadt oder woanders?

Nadia, 18, Auszubildende zur Hotelfachfrau, schreibt:

Ich habe meine Ausbildung in einem Hotel in Hamburg angefangen – 400 Kilometer von meiner Familie entfernt. In meiner kleinen Heimatstadt gab es leider keinen passenden Ausbildungsplatz. Die ersten Monate waren schwer: Ich musste allein eine Wohnung finden, selbst kochen und mit wenig Geld auskommen. Oft hatte ich Heimweh.

Heute bin ich aber froh über meine Entscheidung. Ich bin viel selbstständiger geworden und habe in der großen Stadt Menschen aus der ganzen Welt kennengelernt. Außerdem lerne ich in einem großen Hotel mehr als in einer kleinen Pension.

Ich finde, junge Leute sollten keine Angst haben, für die Ausbildung umzuziehen. Wer nur in seiner Heimatstadt sucht, verpasst vielleicht seine besten Chancen. Was meint ihr?`,
  quelle: "Nadia, Beitrag im Forum „Startklar“",
};

export const SCHREIBEN = [
  {
    typ: "freitext",
    id: "pruefung_schreiben",
    lesetext: FORUMSTEXT,
    frage: "Schreiben Sie einen zusammenhängenden Beitrag für den Schüler-Blog Ihrer Berufsschule zum Thema „Ausbildung in der Heimatstadt oder woanders?“.\n• Geben Sie die wichtigsten Aussagen von Nadia mit eigenen Worten wieder.\n• Berichten Sie ausführlich: Wie ist das bei Ihnen und Ihren Mitschülerinnen und Mitschülern? Wo machen Sie Ihre Ausbildung, und warum?\n• Sagen Sie Ihre Meinung: Sollte man für eine Ausbildung umziehen? Begründen Sie Ihre Meinung ausführlich.\nDie Reihenfolge der Teile ist frei. (In der echten Prüfung gibt es keine Wortzahl. Hier: mindestens 150 Wörter.)",
    minWoerter: 150,
    muster: [
      { such: "hallo|liebe|forum|blog|beitrag|thema", ok: "Dein Text ist in die Textsorte eingebettet (Anrede, Thema, Bezug auf das Forum).", fehlt: "Bette deinen Text ein: Anrede, Thema und woher der Text kommt (Forum „Startklar“)." },
      { such: "nadia", ok: "Du nennst die Person, deren Text du wiedergibst.", fehlt: "Nenne die Person: Wer hat den Forumsbeitrag geschrieben?" },
      { such: "berichtet|erzählt|schreibt|meint|ist der meinung|findet|laut|ihrer meinung nach", ok: "Du markierst Nadias Aussagen als fremde Aussagen.", fehlt: "Markiere Nadias Aussagen: „Nadia berichtet, dass …“, „Sie ist der Meinung, dass …“." },
      { such: "ich habe|ich mache|bei mir|in meiner|meine ausbildung|mein praktikum|meine mitschüler|in unserer klasse", ok: "Du berichtest von deinen eigenen Erfahrungen.", fehlt: "Berichte von dir und deinen Mitschülern: Wo macht ihr eure Ausbildung? Warum?" },
      { such: "meiner meinung nach|ich finde|ich bin der meinung|ich denke|ich glaube", ok: "Deine Meinung ist klar erkennbar.", fehlt: "Sag deutlich deine Meinung: „Meiner Meinung nach …“" },
      { such: "weil|denn|deshalb|darum|aus diesem grund", ok: "Du begründest.", fehlt: "Begründe deine Meinung: weil … / denn … / deshalb …" },
      { such: "grüße|bis bald|tschüss|was meint ihr|schreibt mir", ok: "Dein Text hat einen Schluss.", fehlt: "Schließe deinen Text ab: Leser ansprechen und grüßen." },
    ],
    checkliste: [
      "Ich habe Nadias wichtigste Aussagen mit eigenen Worten wiedergegeben (nicht abgeschrieben).",
      "Ich habe ausführlich von meinen Erfahrungen und denen meiner Mitschüler berichtet – mit Details.",
      "Ich habe meine Meinung gesagt und sie mit mehreren Gründen erklärt.",
      "Mein Text hat eine Einleitung, einen Hauptteil und einen Schluss.",
      "Ich habe auch längere Sätze benutzt (weil, dass, obwohl, wenn …).",
    ],
  },
];

export const SCHREIBEN_HINWEIS = "Probeprüfung Schriftliche Kommunikation: In der Prüfung hast du 75 Minuten. Lies zuerst den Forumstext genau. Plane deinen Text: Einleitung – Wiedergabe – Erfahrungen – Meinung – Schluss. Mutige, ausführliche Texte werden belohnt, auch wenn Fehler darin sind. Deine Lehrkraft bewertet deinen Text nach den Kriterien der Prüfung.";

// ---------- Kaverne der Stimmen: Mündliche Kommunikation ----------

const PRUEFER = "Die Prüferin oder der Prüfer";
const kurz = (frage, hilfen, dauer = 45) => ({
  typ: "sprechen", frage, dauer, hilfen,
  partner: { a: `${PRUEFER}: Lies die Frage vor (oder drück auf „Anhören“) und hör gut zu. Wenn die Antwort sehr kurz ist, frag nach: „Warum?“, „Kannst du ein Beispiel geben?“`, b: "Prüfling: Antworte ausführlich, mit Beispielen und Begründungen. Danach tauscht ihr die Rollen." },
  checkliste: ["Ich habe ausführlich geantwortet (mehrere Sätze, Beispiele).", "Ich habe meine Antworten begründet."],
});

export const SPRECHEN = [
  kurz("Teil 1 – Gespräch: Erzählen Sie von Ihrem Praktikum oder Ihrem Ausbildungsbetrieb. Was machen Sie dort? Was gefällt Ihnen, was nicht?",
    "In meinem Praktikum / In meinem Betrieb … · Meine Aufgaben sind … · Besonders gut gefällt mir …, weil … · Weniger gut finde ich …"),
  kurz("Teil 1 – Gespräch: Warum haben Sie diesen Beruf gewählt? Wer hat Ihnen bei der Berufswahl geholfen?",
    "Ich habe mich für … entschieden, weil … · Mir hat … geholfen. · Wichtig war für mich, dass …"),
  kurz("Teil 1 – Gespräch: Wie ist eine Ausbildung in Ihrem Herkunftsland organisiert? Was ist anders als in Deutschland?",
    "In meinem Herkunftsland … · Anders als in Deutschland … · Ein großer Unterschied ist, dass … · Ich finde das System hier …"),
  kurz("Teil 1 – Gespräch: Wo sehen Sie sich in fünf Jahren? Was möchten Sie beruflich erreichen?",
    "In fünf Jahren möchte ich … · Dafür muss ich … · Mein Ziel ist es, … zu … · Ich könnte mir auch vorstellen, …"),
  {
    typ: "freitext",
    id: "pruefung_stichworte",
    frage: "Teil 2 – Präsentation: Bereiten Sie eine Präsentation vor (ca. 3 Minuten). Thema: „Mein Ausbildungsberuf“ (oder Ihr Wunschberuf). Schreiben Sie Stichpunkte – keine ganzen Sätze! Gliederung: Thema – Aufgaben und Arbeitsort – Ausbildung (Dauer, Schule, Betrieb) – Vorteile und Nachteile – eigene Meinung – Schluss.",
    minWoerter: 30,
    muster: [
      { such: "beruf|ausbildung|praktikum", ok: "Du nennst dein Thema.", fehlt: "Nenne dein Thema: Welcher Beruf?" },
      { such: "aufgabe|arbeit|tätig|macht", ok: "Du hast Stichpunkte zu den Aufgaben.", fehlt: "Stichpunkte zu den Aufgaben im Beruf fehlen." },
      { such: "vorteil|nachteil|gut|schlecht|schwierig", ok: "Du planst Vor- und Nachteile ein.", fehlt: "Plane Vor- und Nachteile ein." },
      { such: "meinung|finde|gefällt|weil", ok: "Du planst deine Meinung ein.", fehlt: "Plane deine eigene Meinung ein." },
    ],
    checkliste: ["Meine Stichpunkte folgen einer klaren Gliederung.", "Ich habe nur Stichpunkte geschrieben, keine langen Sätze."],
  },
  {
    typ: "sprechen",
    frage: "Teil 2 – Präsentation: Halten Sie jetzt Ihre Präsentation „Mein Ausbildungsberuf“. Sprechen Sie frei mit Ihren Stichpunkten (mindestens 2 Minuten).",
    dauer: 120,
    hilfen: "Ich möchte heute über … sprechen. · Zuerst …, dann …, zum Schluss … · Ein Vorteil ist … · Ein Nachteil ist allerdings … · Meiner Meinung nach … · Zusammenfassend kann ich sagen … · Vielen Dank für Ihre Aufmerksamkeit! Haben Sie Fragen?",
    partner: { a: `${PRUEFER}: Hör gut zu und notiere dir eine Frage zur Präsentation.`, b: "Prüfling: Halte deine Präsentation frei, mit Blick zum Publikum." },
    checkliste: ["Ich habe das Thema und die Gliederung genannt.", "Ich habe frei gesprochen und meine Stichpunkte nur als Hilfe benutzt.", "Ich habe meine Meinung gesagt und einen Schluss gemacht."],
  },
  kurz("Teil 2 – Nachfragen: „Was war in Ihrer Ausbildung bisher am schwierigsten? Wie haben Sie das gelöst?“",
    "Am schwierigsten war für mich … · Ich habe das gelöst, indem … · Heute weiß ich, dass …", 30),
  kurz("Teil 2 – Nachfragen: „Würden Sie diesen Beruf einer Freundin oder einem Freund empfehlen? Warum (nicht)?“",
    "Ich würde den Beruf (nicht) empfehlen, weil … · Man sollte aber wissen, dass … · Für Leute, die …, ist er ideal.", 30),
];

export const SPRECHEN_HINWEIS = "Probeprüfung Mündliche Kommunikation: Teil 1 ist ein Gespräch, Teil 2 eine Präsentation mit Nachfragen. Am besten übst du zu zweit: Eine Person ist Prüferin oder Prüfer, die andere ist der Prüfling. Antworte immer ausführlich und begründe. Die Bewertung macht in der echten Prüfung die Prüfungskommission – hier hakst du die Checkliste ehrlich ab.";

// ---------- Morgrath ----------

export const MORGRATH_NAME = "Morgrath, der Verschleierer";

/** Was Morgrath in den vier Dungeons sagt, bevor die Prüfung beginnt, und wenn er flieht */
export const MORGRATH_WORTE = {
  hoeren: {
    vorher: [
      "„So. Der kleine Held aus dem Dorf der Ankömmlinge. Du hast meine Glocke befreit, meinen Bibliothekar verdorben und meinen Troll auf den Berg gejagt.“",
      "„Aber hier unten gelten MEINE Regeln. Hier gibt es keine zweite Chance, keine Hilfe, keinen Text zum Mitlesen. Hier gibt es nur – die Prüfung.“",
      "„Hör zu, wenn du kannst! Jedes Wort, das du falsch verstehst, nährt meine Schatten.“",
    ],
    sieg: [
      "Morgrath taumelt zurück. Sein Umhang zerfasert zu Rauch.",
      "„Du … hast zugehört. Unmöglich!“ Er hebt die Hand – und versinkt in einem Riss im Boden. Aus der Tiefe hallt sein Lachen: „Komm nur weiter herunter. Die Katakomben warten!“",
    ],
    niederlage: "„Hah! Du hörst, aber du verstehst nicht. Übe in Aurelia und komm wieder – wenn du dich traust!“",
  },
  lesen: {
    vorher: [
      "„Willkommen in den Katakomben. Hier liegen die Bücher, die ich verschlungen habe. Tausend Seiten, tausend Lügen.“",
      "„Lies, kleiner Held. Aber lies genau. Ein ‚nur‘, ein ‚alle‘, ein ‚noch nicht‘ – und du gehörst mir.“",
    ],
    sieg: [
      "Die Schriftrollen an den Wänden leuchten auf. Morgrath schreit und hält sich die Augen zu.",
      "„Genug!“ Ein Strom aus Schatten reißt ihn in die Tiefe. „In der Grotte der Schreiber wirst du verstummen!“",
    ],
    niederlage: "„Du liest wie ein Blinder! Geh zurück nach Scriptoria und lerne erst lesen.“",
  },
  schreiben: {
    vorher: [
      "„Die Grotte der Schreiber. Hier mussten meine Gefangenen schreiben – Tag und Nacht, ohne zu wissen, was sie schreiben.“",
      "„Und du? Kannst du einen Text schreiben, der wirklich etwas sagt? Zeig es mir. Wiedergabe, Erfahrung, Meinung. Ich warte.“",
    ],
    sieg: [
      "Die Worte deines Textes glühen auf wie Funken und fliegen auf Morgrath zu. Er weicht zurück, Schritt für Schritt.",
      "„Deine Worte … brennen!“ Er springt in einen Lavaschacht und verschwindet. Tief unten grollt es: „Die Kaverne der Stimmen wird dein Grab!“",
    ],
    niederlage: "„Leere Seiten! Nichts als leere Seiten! Komm wieder, wenn du etwas zu sagen hast.“",
  },
  sprechen: {
    vorher: [
      "„Die Kaverne der Stimmen. Hier endet jeder Held. Hier unten hört dich niemand schreien.“",
      "„Sprich, wenn du kannst. Erzähl mir von dir, von deinem Beruf, von deinen Träumen. Und dann – kämpfe!“",
    ],
    niederlage: "„Deine Stimme ist schwach. Geh nach Vocantia und lerne sprechen!“",
  },
};

// ---------- Der Endkampf ----------

const hoer = (sprecher, teile) => ({ sprecher, teile, pruefung: true, maxHoeren: 2 });
const SM = { tonhoehe: 0.55, tempo: 0.8 };
const SF = { tonhoehe: 1.25, tempo: 0.92 };

export const MORGRATH = {
  name: MORGRATH_NAME,
  bild: "boss_morgrath",
  lp: 240,
  schaden: 20,
  einleitung: "„GENUG!“ Morgrath richtet sich zu voller Größe auf, die Krone aus Dornen glüht. „Du hast meine Schatten aus allen vier Reichen vertrieben. Aber hier, am Rand der Lava, endet deine Reise. Hören, Lesen, Schreiben, Sprechen – ich nehme dir alles. Komm!“",
  spott: [
    "Deine Worte sind Asche!",
    "Niemand versteht dich!",
    "Ich bin der Verschleierer – ich verdrehe jede Bedeutung!",
    "Hörst du die Lava? Sie wartet auf dich!",
    "Vier Reiche? Ich zerschlage sie alle wieder!",
  ],
  sieg: [
    "Mit deiner letzten Antwort zerbricht die Krone aus Dornen. Ein Riss läuft durch Morgraths Rüstung, und aus jedem Spalt strömt Licht.",
    "Er taumelt rückwärts, an den Rand der Klippe. Unter ihm brodelt die Lava.",
    "„Nein … NEIN! Verständigung … kann man nicht …“ – dann stürzt er in die Tiefe. Die Lava schließt sich über ihm, und für einen Moment ist es ganz still.",
  ],
  niederlage: [
    "Morgrath lacht, dass die Kaverne bebt.",
    "„Noch bist du nicht stark genug. Komm wieder, wenn du alles beherrschst!“",
  ],
  fragen: [
    { typ: "auswahl", hoertext: hoer("Mailbox", [{ sprecher: "Ausbilderin", stimme: SF, text: "Hallo Tom, hier ist Frau Klein. Morgen beginnen wir nicht um acht, sondern erst um zehn Uhr, weil die Maschine repariert wird. Bitte bring deine Schutzbrille mit." }]), frage: "„Wann beginnt Tom morgen?“", optionen: ["um 10 Uhr", "um 8 Uhr", "nach der Reparatur am Abend"], richtig: 0 },
    { typ: "auswahl", hoertext: hoer("Gespräch", [{ sprecher: "Kollege", stimme: SM, text: "Soll ich die Kisten ins Lager bringen?" }, { sprecher: "Chefin", stimme: SF, text: "Nein, lass sie hier. Bring lieber die Rechnungen ins Büro." }]), frage: "„Was soll der Kollege tun?“", optionen: ["die Rechnungen ins Büro bringen", "die Kisten ins Lager bringen", "die Kisten ins Büro bringen"], richtig: 0 },
    { typ: "auswahl", frage: "„Im Text steht: ‚Die meisten Azubis werden übernommen.‘ Was bedeutet das?“", optionen: ["Viele, aber nicht alle bekommen eine Stelle.", "Alle Azubis bekommen sicher eine Stelle.", "Kein Azubi bleibt im Betrieb."], richtig: 0 },
    { typ: "auswahl", frage: "„Im Text steht: ‚Offene Schuhe sind in der Werkstatt verboten.‘ Was stimmt?“", optionen: ["Man muss geschlossene Schuhe tragen.", "Man darf Sandalen tragen.", "Schuhe sind in der Werkstatt egal."], richtig: 0 },
    { typ: "richtigfalsch", lesetext: { titel: "Aushang im Betrieb", text: "Die Kantine ist ab Montag wegen Umbau geschlossen. Bis Ende des Monats bekommen alle Mitarbeitenden einen Essensgutschein für die Bäckerei gegenüber. Kaffee gibt es weiterhin im Aufenthaltsraum." }, frage: "„Richtig oder falsch? Beide müssen stimmen!“", aussagen: [["Ab Montag kann man nicht in der Kantine essen.", true], ["Im Aufenthaltsraum gibt es keinen Kaffee mehr.", false]] },
    { typ: "auswahl", frage: "„Welcher Satz gibt eine fremde Meinung mit eigenen Worten wieder?“", optionen: ["Nadia ist der Meinung, dass junge Leute für eine Ausbildung umziehen sollten.", "„Ich finde, junge Leute sollten umziehen.“", "Ich ziehe auch um."], richtig: 0 },
    { typ: "auswahl", frage: "„Was fehlt dieser Meinung? ‚Ich finde Praktika gut.‘“", optionen: ["eine Begründung", "eine Anrede", "ein Gruß"], richtig: 0 },
    { typ: "luecke", frage: "„Verbinde die Gedanken – oder verliere!“", text: "Ich bin für ein Praktikum im Ausland, {weil} man dort viel lernt. {Außerdem} wird man selbstständiger. {Trotzdem} sollte man vorher gut planen.", auswahl: true, ablenker: ["obwohl", "denn"] },
    { typ: "auswahl", frage: "„Du verstehst eine Frage in der mündlichen Prüfung nicht. Was sagst du?“", optionen: ["Entschuldigung, können Sie die Frage bitte wiederholen?", "Ich sage gar nichts.", "Ich antworte einfach auf eine andere Frage."], richtig: 0 },
    { typ: "sprechen", frage: "„Sag mir ins Gesicht: Warum ist Verständigung wichtig? Antworte in ganzen Sätzen und begründe!“", dauer: 20, hilfen: "Verständigung ist wichtig, weil … · Ohne Verständigung … · Zum Beispiel …", checkliste: ["Ich habe in ganzen Sätzen gesprochen und begründet."] },
    { typ: "sprechen", frage: "„Erzähl mir, was du in Eldoria gelernt hast. Wenn du dich traust!“", dauer: 20, hilfen: "In Eldoria habe ich gelernt, … · Am schwierigsten war … · Am meisten hat mir … geholfen.", checkliste: ["Ich habe ausführlich und in ganzen Sätzen gesprochen."] },
    { typ: "auswahl", frage: "„In Hören Teil 5 – den Meinungen – wie oft hörst du die Texte?“", optionen: ["nur einmal", "zweimal", "dreimal"], richtig: 0 },
    { typ: "auswahl", frage: "„Was machst du, wenn du bei einer Aufgabe die Antwort nicht weißt?“", optionen: ["Ich rate – eine leere Antwort bringt keinen Punkt.", "Ich lasse sie leer.", "Ich gebe die Prüfung ab."], richtig: 0 },
    { typ: "auswahl", frage: "„Was gehört in einen Forumsbeitrag?“", optionen: ["Wiedergabe, eigene Erfahrungen und begründete Meinung", "nur meine Meinung", "nur eine Zusammenfassung des Textes"], richtig: 0 },
  ],
};
