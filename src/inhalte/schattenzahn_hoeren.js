// Feste Schattenzahn – Probeprüfung Hörverstehen (Dungeon des Hörens)
// Genau nach DSD I PRO Hörverstehen (docs/dsd_pruefung.md): 5 Teile, 24 Items.
//   Teil 1  Alltagsszenen am Arbeitsplatz     Items 1–5    A/B/C, ein Item pro Szene, 2× hören
//   Teil 2  Durchsagen und Telefonansagen     Items 6–9    A/B/C, ein Item pro Text, 2× hören
//   Teil 3  Interview                         Items 10–14  Richtig/Falsch, 2× hören
//   Teil 4  Bericht                           Items 15–20  A/B/C, 2× hören
//   Teil 5  Meinungen                         Items 21–24  Aussagen zuordnen, 4 bleiben übrig, nur 1× hören
// Muster: Lösung am Ende oder durch Korrektur, Verneinung im Aufgabenstamm, Zahlen als Ablenker,
// Umschreibungen statt wörtlicher Wiederholung. Alle Texte sind eigene Texte.

const S = {
  frau1: { tonhoehe: 1.2, tempo: 0.92 },
  frau2: { tonhoehe: 1.35, tempo: 0.95 },
  frau3: { tonhoehe: 1.08, tempo: 0.9 },
  mann1: { tonhoehe: 0.85, tempo: 0.9 },
  mann2: { tonhoehe: 0.95, tempo: 0.88 },
  mann3: { tonhoehe: 0.72, tempo: 0.86 },
  ansage: { tonhoehe: 1.0, tempo: 0.85 },
};

const zweimal = (sprecher, teile, extra = {}) => ({ sprecher, teile, pruefung: true, maxHoeren: 2, ...extra });

const T1 = "Teil 1 – Alltagsszenen";
const T2 = "Teil 2 – Durchsagen und Telefonansagen";
const T3 = "Teil 3 – Interview";
const T4 = "Teil 4 – Bericht";
const T5 = "Teil 5 – Meinungen";

// ---------- Teil 1: Alltagsszenen ----------

const TEIL1 = [
  {
    teil: T1, typ: "auswahl", mischen: false,
    hoertext: zweimal("Szene 1 – An der Hotelrezeption", [
      { sprecher: "Lena", stimme: S.frau2, text: "Herr Sommer, soll ich die frischen Handtücher jetzt in Zimmer zwölf bringen?" },
      { sprecher: "Herr Sommer", stimme: S.mann1, text: "Nein, lass mal, das macht Frau Kaya nachher. Bring bitte zuerst die Post ins Büro. Da liegt ein Paket für den Chef." },
      { sprecher: "Lena", stimme: S.frau2, text: "Okay, mache ich sofort." },
    ]),
    frage: "1  Was soll Lena tun?",
    optionen: ["die Handtücher in Zimmer 12 bringen", "die Post ins Büro bringen", "Frau Kaya Bescheid sagen"], richtig: 1,
  },
  {
    teil: T1, typ: "auswahl", mischen: false,
    hoertext: zweimal("Szene 2 – In der Autowerkstatt", [
      { sprecher: "Meisterin", stimme: S.frau3, text: "Can, ist der blaue Kombi fertig? Die Kundin kommt um vier." },
      { sprecher: "Can", stimme: S.mann2, text: "Fast. Die vorderen Reifen habe ich schon gewechselt. Bei den hinteren fehlt mir noch der richtige Schlüssel." },
      { sprecher: "Meisterin", stimme: S.frau3, text: "Der liegt im grauen Schrank neben der Tür. Mach das bitte jetzt gleich." },
    ]),
    frage: "2  Can hat … noch nicht gewechselt.",
    optionen: ["die vorderen Reifen", "alle vier Reifen", "die hinteren Reifen"], richtig: 2,
  },
  {
    teil: T1, typ: "auswahl", mischen: false,
    hoertext: zweimal("Szene 3 – Im Friseursalon", [
      { sprecher: "Azubi", stimme: S.frau1, text: "Chefin, Frau Weber ist am Telefon. Sie möchte heute um drei Uhr zum Schneiden kommen." },
      { sprecher: "Chefin", stimme: S.frau3, text: "Heute um drei? Da sind wir voll. Und später geht es auch nicht mehr, wir schließen heute früher. Gib ihr bitte einen Termin für morgen, am besten am Vormittag." },
    ]),
    frage: "3  Was soll die Auszubildende tun?",
    optionen: ["Frau Weber einen Termin für morgen geben", "Frau Weber für heute um drei Uhr eintragen", "Frau Weber später zurückrufen"], richtig: 0,
  },
  {
    teil: T1, typ: "auswahl", mischen: false,
    hoertext: zweimal("Szene 4 – Im Büro", [
      { sprecher: "Mia", stimme: S.frau2, text: "Jonas, weißt du, wo die Liste mit den neuen Kundenadressen ist? Ich finde sie nicht. Soll ich sie noch einmal ausdrucken?" },
      { sprecher: "Jonas", stimme: S.mann1, text: "Nicht nötig. Die habe ich mir gestern genommen. Sie liegt bei mir auf dem Schreibtisch, unter dem Ordner." },
      { sprecher: "Mia", stimme: S.frau2, text: "Super, dann hole ich sie gleich bei dir." },
    ]),
    frage: "4  Was macht Mia?",
    optionen: ["Sie druckt die Liste neu aus.", "Sie holt die Liste bei Jonas.", "Sie schreibt die Adressen neu."], richtig: 1,
  },
  {
    teil: T1, typ: "auswahl", mischen: false,
    hoertext: zweimal("Szene 5 – In der Großküche", [
      { sprecher: "Koch", stimme: S.mann3, text: "Heute Mittag kommt eine Gruppe mit dreißig Personen. Mach bitte zwanzig Portionen Suppe … nein, warte. Die Gruppe hat gerade angerufen, es kommen noch zehn Leute mehr. Mach lieber gleich vierzig." },
      { sprecher: "Azubi", stimme: S.frau1, text: "Alles klar, vierzig Portionen." },
    ]),
    frage: "5  Wie viele Portionen Suppe soll die Auszubildende machen?",
    optionen: ["20", "30", "40"], richtig: 2,
  },
];

// ---------- Teil 2: Durchsagen und Telefonansagen ----------

const mailbox = (sprecher, stimme, text) => ({ sprecher: `Mailbox – ${sprecher}`, teile: [{ sprecher, stimme, text }], piep: true, pruefung: true, maxHoeren: 2 });

const TEIL2 = [
  {
    teil: T2, typ: "auswahl", mischen: false,
    hoertext: mailbox("Frau Brandt", S.frau3, "Guten Tag, Herr Kowalski, hier spricht Brandt von der Firma Elektro Schulz. Es geht um Ihr Vorstellungsgespräch am Montag. Leider muss ich den Termin verschieben: Können Sie stattdessen am Mittwoch um zehn Uhr kommen? Bitte bringen Sie Ihr letztes Schulzeugnis mit. Sie müssen nicht zurückrufen – nur wenn es am Mittwoch bei Ihnen nicht geht. Vielen Dank und bis Mittwoch!"),
    frage: "6  Was soll Herr Kowalski tun?",
    optionen: ["am Montag zum Gespräch kommen", "Frau Brandt sofort zurückrufen", "am Mittwoch mit seinem Zeugnis kommen"], richtig: 2,
  },
  {
    teil: T2, typ: "auswahl", mischen: false,
    hoertext: mailbox("Sekretariat der Berufsschule", S.frau1, "Hallo, hier ist das Sekretariat der Berufsschule am Hafen. Eine Information für alle Auszubildenden der Klasse E zwei: Am Freitag haben die Lehrkräfte eine Fortbildung. Darum findet an diesem Tag kein Unterricht statt. Sie gehen bitte ganz normal in Ihren Betrieb. Die Klassenfahrt im Mai ist davon nicht betroffen. Vielen Dank."),
    frage: "7  Was teilt die Schule mit?",
    optionen: ["Am Freitag gibt es keinen Unterricht.", "Die Klassenfahrt im Mai fällt aus.", "Am Freitag haben die Auszubildenden frei."], richtig: 0,
  },
  {
    teil: T2, typ: "auswahl", mischen: false,
    hoertext: mailbox("Sandra", S.frau2, "Hi, ich bin's, Sandra. Du, ich liege mit Fieber im Bett und kann morgen nicht arbeiten. Könntest du vielleicht meine Frühschicht übernehmen? Dann müsstest du schon um sechs da sein, tut mir leid. Ich übernehme dafür gern mal deine Samstagsschicht. Ruf mich nicht an, ich schlafe wahrscheinlich – schreib mir einfach eine Nachricht. Danke!"),
    frage: "8  Was möchte Sandra?",
    optionen: ["Sie möchte am Samstag frei haben.", "Jemand soll morgen für sie arbeiten.", "Jemand soll sie um sechs Uhr anrufen."], richtig: 1,
  },
  {
    teil: T2, typ: "auswahl", mischen: false,
    hoertext: { sprecher: "Durchsage auf der Ausbildungsmesse", teile: [{ sprecher: "Durchsage", stimme: S.ansage, text: "Liebe Besucherinnen und Besucher der Ausbildungsmesse, bitte beachten Sie: Der Vortrag „Bewerben ohne Stress“ findet heute nicht in Halle zwei statt, sondern in Halle vier, im ersten Stock. Der Vortrag beginnt wie geplant um vierzehn Uhr. Der Eintritt ist frei." }], gong: true, pruefung: true, maxHoeren: 2 },
    frage: "9  Wo findet der Vortrag statt?",
    optionen: ["in Halle 2", "in Halle 4", "im Erdgeschoss von Halle 4"], richtig: 1,
  },
];

// ---------- Teil 3: Interview ----------

const INTERVIEW = zweimal("Radiointerview: Sofia, Auszubildende zur Mechatronikerin", [
  { sprecher: "Moderator", stimme: S.mann1, text: "Willkommen zu „Ausbildung heute“. Bei mir im Studio ist Sofia. Sie ist neunzehn und lernt Mechatronikerin bei einer Firma, die Windräder baut und repariert. Sofia, erzähl doch mal: Wie war dein erster Tag?" },
  { sprecher: "Sofia", stimme: S.frau2, text: "Ehrlich gesagt ziemlich chaotisch! Das Firmengelände ist riesig, und ich habe mich am Morgen total verlaufen. Ich bin zehn Minuten herumgeirrt. Zum Glück war ich sehr früh losgefahren, deshalb war ich trotzdem pünktlich um sieben bei meinem Ausbilder." },
  { sprecher: "Moderator", stimme: S.mann1, text: "Und jetzt, im zweiten Lehrjahr – kletterst du schon auf die Windräder?" },
  { sprecher: "Sofia", stimme: S.frau2, text: "Das fragen alle! Normalerweise arbeiten die Azubis im zweiten Jahr auch oben auf den Anlagen. Aber dafür braucht man einen speziellen Kletterkurs, und der ist erst im Herbst. Bis dahin arbeite ich in der Werkstatt am Boden. Das ist auch spannend: Wir reparieren Motoren und prüfen die Elektronik." },
  { sprecher: "Moderator", stimme: S.mann1, text: "Wie läuft es in der Berufsschule?" },
  { sprecher: "Sofia", stimme: S.frau2, text: "Gemischt. Elektrotechnik mag ich sehr. Aber mit Mathe tue ich mich schwer, das war schon in der Schule so. Deshalb lerne ich jeden Dienstag mit einer Kollegin aus dem dritten Lehrjahr. Das hilft wirklich." },
  { sprecher: "Moderator", stimme: S.mann1, text: "Du bist eine der wenigen Frauen in deinem Jahrgang. Ist das ein Problem?" },
  { sprecher: "Sofia", stimme: S.frau2, text: "Gar nicht. Am Anfang haben mich ein paar Kunden komisch angeschaut. Aber die Firmen suchen dringend Leute – Frauen und Männer. Ich glaube, gerade in technischen Berufen haben Frauen heute richtig gute Möglichkeiten." },
  { sprecher: "Moderator", stimme: S.mann1, text: "Und nach der Ausbildung?" },
  { sprecher: "Sofia", stimme: S.frau2, text: "Mein großer Traum ist, irgendwann in Dänemark zu arbeiten, auf Windparks im Meer. Aber erst mal bleibe ich hier. Mein Betrieb hat mir schon gesagt, dass er mich nach der Prüfung übernimmt, und das finde ich super." },
]);

const TEIL3 = [
  {
    teil: T3, typ: "richtigfalsch", hoertext: INTERVIEW,
    frage: "10–14  Sie hören ein Interview. Entscheiden Sie: Richtig oder falsch?",
    aussagen: [
      ["10  Sofia ist an ihrem ersten Arbeitstag zu spät gekommen.", false],
      ["11  Sofia arbeitet zurzeit noch nicht oben auf den Windrädern.", true],
      ["12  Mathematik fällt Sofia leicht.", false],
      ["13  Sofia glaubt, dass Frauen in technischen Berufen gute Chancen haben.", true],
      ["14  Sofia wird nach der Ausbildung in Dänemark arbeiten.", false],
    ],
  },
];

// ---------- Teil 4: Bericht ----------

const BERICHT = zweimal("Radiobericht: Emre, Fachkraft für Lagerlogistik", [
  { sprecher: "Emre", stimme: S.mann2, text: "Hallo, ich heiße Emre und bin im dritten Lehrjahr als Fachkraft für Lagerlogistik bei einem großen Versandhandel. Zu meiner Ausbildung bin ich eigentlich durch Zufall gekommen. In der neunten Klasse habe ich hier ein Schulpraktikum gemacht. Am letzten Tag hat mich der Lagerleiter gefragt, ob ich nicht nach der Schule bei ihnen anfangen will. Eine richtige Bewerbung habe ich deshalb nie geschrieben, nur einen Lebenslauf geschickt." },
  { sprecher: "Emre", stimme: S.mann2, text: "Die ersten Wochen waren hart. Nicht wegen der Arbeit – die Kisten sind meistens gar nicht so schwer, dafür haben wir Maschinen. Aber die Frühschicht beginnt um sechs Uhr. Ich musste jeden Tag um halb fünf aufstehen, und daran habe ich mich lange nicht gewöhnt." },
  { sprecher: "Emre", stimme: S.mann2, text: "Ein wichtiges Thema ist der Gabelstapler. Den Staplerschein darf man erst mit achtzehn machen. Ich war am Anfang siebzehn und musste ein halbes Jahr warten. Den Kurs hat dann die Firma bezahlt, das war super, denn er kostet mehrere hundert Euro." },
  { sprecher: "Emre", stimme: S.mann2, text: "Zur Berufsschule gehe ich nicht jede Woche, sondern im Block: Dreimal im Jahr habe ich drei Wochen am Stück Unterricht. Das finde ich besser, weil ich mich dann ganz auf die Schule konzentrieren kann. Wir lernen nicht nur Lagertechnik, sondern auch Deutsch, Englisch und Wirtschaft." },
  { sprecher: "Emre", stimme: S.mann2, text: "Was mir am meisten gefällt? Kurz vor Weihnachten haben wir manchmal doppelt so viele Bestellungen wie sonst. Dann arbeitet das ganze Team zusammen, und wenn am Abend alle Pakete pünktlich auf dem Lkw sind, sind wir richtig stolz. Dieses Gefühl ist für mich das Beste an meinem Beruf." },
  { sprecher: "Emre", stimme: S.mann2, text: "Mein Tipp für alle, die noch keinen Ausbildungsplatz haben: Schreibt nicht hundert Bewerbungen ins Blaue. Macht lieber ein Praktikum und schaut euch den Beruf vorher genau an. So merkt ihr schnell, ob er zu euch passt – und der Betrieb lernt euch kennen." },
]);

const TEIL4 = [
  {
    teil: T4, typ: "block", nummer: 15, hoertext: BERICHT,
    frage: "15–20  Sie hören einen Bericht. Wählen Sie bei jeder Aufgabe die richtige Lösung: A, B oder C.",
    aufgaben: [
      { typ: "auswahl", mischen: false, frage: "Emre hat seinen Ausbildungsplatz bekommen, …", optionen: ["weil er eine sehr gute Bewerbung geschrieben hat.", "weil er vorher im Betrieb ein Praktikum gemacht hat.", "weil er auf einer Messe den Lagerleiter getroffen hat."], richtig: 1 },
      { typ: "auswahl", mischen: false, frage: "Am Anfang der Ausbildung war für Emre schwierig, …", optionen: ["dass er sehr früh aufstehen musste.", "dass er schwere Kisten tragen musste.", "dass er mit Maschinen arbeiten musste."], richtig: 0 },
      { typ: "auswahl", mischen: false, frage: "Den Staplerschein …", optionen: ["hat Emre mit siebzehn gemacht.", "musste Emre selbst bezahlen.", "hat Emres Firma bezahlt."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "In der Berufsschule …", optionen: ["hat Emre einmal pro Woche Unterricht.", "lernt Emre mehrere Wochen ohne Unterbrechung.", "lernt Emre nur Lagertechnik."], richtig: 1 },
      { typ: "auswahl", mischen: false, frage: "Am meisten gefällt Emre, …", optionen: ["wenn es vor Weihnachten weniger Arbeit gibt.", "wenn er allein arbeiten kann.", "wenn das Team gemeinsam ein Ziel erreicht."], richtig: 2 },
      { typ: "auswahl", mischen: false, frage: "Emre empfiehlt, …", optionen: ["einen Beruf vorher auszuprobieren.", "möglichst viele Bewerbungen zu schreiben.", "sich nur bei großen Firmen zu bewerben."], richtig: 0 },
    ],
  },
];

// ---------- Teil 5: Meinungen (nur einmal hören) ----------

const MEINUNGEN = {
  sprecher: "Umfrage: Sollte das Handy bei der Arbeit verboten sein?",
  pruefung: true, maxHoeren: 1,
  teile: [
    { sprecher: "Beispiel – Nummer 0 (Paul)", stimme: S.mann1, text: "Nummer 0. In meinem Betrieb darf man das Handy nur in der Pause benutzen. Am Anfang fand ich das blöd. Aber jetzt merke ich: Ich arbeite konzentrierter und mache weniger Fehler." },
    { sprecher: "Nummer 21 (Leonie)", stimme: S.frau2, text: "Nummer 21. Ich bin Azubi im Hotel, und ich brauche mein Handy ständig: Gäste schicken Nachrichten, Kollegen fragen etwas. Ohne Handy könnte ich meine Arbeit gar nicht richtig machen." },
    { sprecher: "Nummer 22 (Murat)", stimme: S.mann2, text: "Nummer 22. Ein Verbot finde ich übertrieben. Wir sind doch erwachsen! Jeder sollte selbst merken, wann das Handy stört. Wer immer nur auf den Bildschirm schaut, bekommt eben Ärger mit dem Chef." },
    { sprecher: "Nummer 23 (Clara)", stimme: S.frau3, text: "Nummer 23. Ich arbeite in einer Werkstatt mit großen Maschinen. Da ist ein Handy einfach gefährlich. Wenn man kurz nicht aufpasst, kann ein schlimmer Unfall passieren. Bei uns bleibt das Handy deshalb im Spind." },
    { sprecher: "Nummer 24 (Jan)", stimme: S.mann3, text: "Nummer 24. Meine Mutter ist krank, und ich muss für sie erreichbar sein. Mein Chef weiß das und hat nichts dagegen, wenn ich kurz telefoniere. Ich finde, Betriebe sollten bei solchen Situationen eine Ausnahme machen." },
  ],
};

const TEIL5 = [
  {
    teil: T5, typ: "zuordnen", hoertext: MEINUNGEN,
    frage: "21–24  Sie hören Meinungen zum Thema „Handy bei der Arbeit“. Sie hören die Meinungen nur EINMAL. Welche Aussage (A–H) passt zu welcher Person? Vier Aussagen bleiben übrig.",
    beispiel: ["0 – Paul", "Ohne Handy arbeitet man besser."],
    paare: [
      ["21 – Leonie", "Für manche Berufe ist das Handy ein wichtiges Werkzeug."],
      ["22 – Murat", "Jeder sollte selbst verantwortlich mit dem Handy umgehen."],
      ["23 – Clara", "An manchen Arbeitsplätzen ist ein Handy ein Risiko."],
      ["24 – Jan", "In besonderen Fällen sollte das Handy erlaubt sein."],
    ],
    ablenker: [
      "Im Hotel sind Handys für Gäste verboten.",
      "Wer sein Handy benutzt, sollte weniger Geld bekommen.",
      "Handys sollten nur in der Pause erlaubt sein.",
      "Chefs sollten ihren Mitarbeitern das Handy wegnehmen.",
    ],
  },
];

export const HOEREN = [...TEIL1, ...TEIL2, ...TEIL3, ...TEIL4, ...TEIL5];

export const HOEREN_HINWEIS = "Probeprüfung Hörverstehen: 5 Teile, 24 Punkte. Lies vor jedem Text zuerst die Aufgabe. Die Texte in Teil 1 bis 4 kannst du zweimal hören, die Meinungen in Teil 5 nur einmal. Es gibt keinen Text zum Mitlesen und keine Rückmeldung während der Prüfung. Bestanden ab 12 Punkten.";
