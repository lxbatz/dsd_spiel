// Aurelia – Quest 5: Der Glockenturm (Hören: Meinungen zuordnen) und der Endkampf gegen den Drachenrichter
// Nach DSD I PRO Hören Teil 5 (siehe docs/dsd_pruefung.md): ein Thema, ein Beispiel (Nummer 0, Lösung Z),
// vier Meinungen (21–24), acht Aussagen – vier bleiben übrig. Die Aussagen fassen die Meinungen mit
// anderen Worten zusammen, die Ablenker nehmen Wörter aus den Meinungen auf.
//   Stimmenstein des Westens → Übung (beliebig oft hören)
//   Stimmenstein des Ostens  → Generalprobe wie in der Prüfung: nur EINMAL hören, kein Text
//   Der Drachenrichter       → Bosskampf mit kurzen Hörtexten aus allen fünf Prüfungsteilen
// Alle Texte sind eigene Texte.

const S = {
  a: { tonhoehe: 1.2, tempo: 0.92 },
  b: { tonhoehe: 0.85, tempo: 0.9 },
  c: { tonhoehe: 1.35, tempo: 0.95 },
  d: { tonhoehe: 0.95, tempo: 0.88 },
  e: { tonhoehe: 1.05, tempo: 0.9 },
};

const meinungen = (titel, liste, extra = {}) => ({
  sprecher: titel,
  teile: liste.map(([nr, name, stimme, text]) => ({ sprecher: `Nummer ${nr} (${name})`, stimme, text: `Nummer ${nr}. ${text}` })),
  ...extra,
});

// ---------- Stimmenstein 1: Ein Nebenjob neben der Ausbildung? ----------

export const NEBENJOB = meinungen("Stimmen der Stadt: Ein Nebenjob neben der Ausbildung?", [
  [0, "Marco", S.b, "Ich hatte einen Nebenjob in einem Café, aber nach drei Wochen habe ich aufgehört. Ich war immer müde, und in der Berufsschule habe ich kaum noch etwas verstanden. Also: Nebenjob neben der Ausbildung – nein danke."],
  [21, "Lukas", S.d, "Mit meinem Azubi-Gehalt komme ich gerade so aus. Am Samstag helfe ich deshalb auf dem Markt. Das Geld spare ich für meinen Führerschein. Ohne den Job würde das noch Jahre dauern."],
  [22, "Selin", S.a, "In unserer Firma muss man den Chef fragen, bevor man einen Nebenjob annimmt. Das finde ich richtig. Der Chef muss ja wissen, ob man am Montag fit zur Arbeit kommt."],
  [23, "Jana", S.c, "Ich mache eine Ausbildung zur Mechanikerin und jobbe abends im Hotel. Dort lerne ich, wie man freundlich mit Gästen spricht. Das hilft mir jetzt auch in der Werkstatt, wenn Kunden kommen."],
  [24, "Amir", S.e, "Ich hätte gern einen Nebenjob, aber meine Ausbildung ist im Schichtdienst. Jede Woche habe ich andere Arbeitszeiten. Da kann ich einfach nichts planen."],
]);

export const STEIN_WEST = [
  {
    typ: "zuordnen", hoertext: NEBENJOB,
    frage: "Lies zuerst die Aussagen. Hör dann die Meinungen 21–24. Welche Aussage passt zu welcher Person? Vier Aussagen bleiben übrig.",
    beispiel: ["0 – Marco", "Ein Nebenjob macht die Ausbildung schwerer."],
    paare: [
      ["21 – Lukas", "Mit einem Nebenjob kann man sich einen großen Wunsch erfüllen."],
      ["22 – Selin", "Der Betrieb sollte von einem Nebenjob wissen."],
      ["23 – Jana", "Ein Nebenjob kann auch für den eigenen Beruf nützlich sein."],
      ["24 – Amir", "Für manche Azubis passt ein Nebenjob nicht in den Zeitplan."],
    ],
    ablenker: [
      "Ein Nebenjob bringt mehr Geld als die Ausbildung.",
      "Man sollte nur am Wochenende arbeiten.",
      "Im Hotel verdient man besonders gut.",
      "Azubis dürfen keinen Nebenjob haben.",
    ],
    erklaerung: "21: Führerschein = großer Wunsch. 22: „den Chef fragen“ = der Betrieb soll Bescheid wissen. 23: Gespräche mit Gästen helfen in der Werkstatt. 24: Schichtdienst, immer andere Zeiten. Die übrigen Aussagen nehmen nur Wörter aus den Texten auf (Geld, Samstag, Hotel, Chef).",
  },
];

// ---------- Stimmenstein 2: Teamarbeit oder allein? (Generalprobe: nur einmal hören) ----------

export const TEAM = meinungen("Stimmen der Stadt: Lieber im Team oder allein arbeiten?", [
  [0, "Paula", S.c, "Im Team ist es immer laut, alle reden durcheinander. Ich arbeite viel lieber allein, dann bin ich schneller fertig."],
  [21, "Ben", S.d, "Am Anfang mochte ich Gruppenarbeit gar nicht. Aber bei unserem Projekt in der Berufsschule habe ich gemerkt: Wenn jeder das macht, was er gut kann, wird das Ergebnis viel besser."],
  [22, "Hanna", S.a, "Ich arbeite gern im Team, aber nur mit klaren Regeln. Wer macht was, und bis wann? Sonst arbeiten am Ende zwei Leute, und die anderen schauen nur zu."],
  [23, "Elif", S.e, "In meiner Ausbildung zur Pflegefachfrau geht es gar nicht ohne Team. Wir geben jeden Tag Informationen an die nächste Schicht weiter. Wenn da etwas fehlt, kann das für die Patienten gefährlich sein."],
  [24, "Tom", S.b, "Ich finde beides wichtig. Für schwierige Rechnungen brauche ich Ruhe, da arbeite ich lieber allein. Aber Ideen sammeln wir immer zusammen."],
], { pruefung: true, maxHoeren: 1 });

export const STEIN_OST = [
  {
    typ: "zuordnen", hoertext: TEAM,
    frage: "Generalprobe wie in der Prüfung: Du hörst die Meinungen nur EINMAL. Lies zuerst die Aussagen (30 Sekunden), dann hör zu und ordne zu. Vier Aussagen bleiben übrig.",
    beispiel: ["0 – Paula", "Allein kommt man schneller voran."],
    paare: [
      ["21 – Ben", "Im Team kann jeder seine Stärken einbringen."],
      ["22 – Hanna", "Ein Team braucht eine klare Aufgabenverteilung."],
      ["23 – Elif", "In manchen Berufen ist Teamarbeit lebenswichtig."],
      ["24 – Tom", "Es hängt von der Aufgabe ab."],
    ],
    ablenker: [
      "Gruppenarbeit macht immer Spaß.",
      "Im Krankenhaus arbeitet man meistens allein.",
      "Der Chef muss im Team alle Regeln machen.",
      "In der Berufsschule ist Teamarbeit verboten.",
    ],
    erklaerung: "21: „jeder macht, was er gut kann“ = Stärken. 22: „Wer macht was, bis wann?“ = Aufgabenverteilung. 23: gefährlich für Patienten = lebenswichtig. 24: „beides wichtig“ – je nach Aufgabe.",
  },
];

// ---------- Der Drachenrichter ----------

const hoer = (sprecher, teile) => ({ sprecher, teile, pruefung: true, maxHoeren: Infinity });
const P = S;

export const DRACHENRICHTER = {
  name: "Der Drachenrichter",
  bild: "boss_drachenrichter",
  lp: 200,
  schaden: 20,
  einleitung: "WER WAGT ES? … Ich bin der Drachenrichter. Seit tausend Jahren höre ich den Menschen von Aurelia zu – und was höre ich? Niemand hört mehr zu! Darum habe ich die Glocke zum Schweigen gebracht. Beweise mir, dass du zuhören kannst. Ich spreche jeden Satz nur für dich – aber ohne Text zum Nachlesen!",
  spott: [
    "Hörst du überhaupt zu?",
    "Ihr Menschen hört nur, was ihr hören wollt!",
    "Achte auf das Ende, Kleines!",
    "Meine Ohren sind älter als diese Stadt!",
    "Noch einmal? Nein. Hör beim ersten Mal richtig zu!",
  ],
  sieg: [
    "Der Drachenrichter senkt den mächtigen Kopf und lässt sich auf die Knie sinken.",
    "„Du … hast wirklich zugehört. Jedes Wort, bis zum Ende. Vielleicht habe ich mich geirrt. Die Menschen können noch zuhören – wenn man es ihnen zeigt.“",
    "„Die Glocke soll wieder klingen. Ich gebe sie frei.“",
  ],
  niederlage: [
    "„Siehst du? Auch du hörst nicht zu!“",
    "Der Drachenrichter breitet die Flügel aus. Übe noch einmal an den Stimmensteinen und komm wieder!",
  ],
  fragen: [
    {
      typ: "auswahl",
      hoertext: hoer("Durchsage", [{ sprecher: "Rufmuschel", stimme: P.d, text: "Achtung: Die Fähre nach Kalmos fährt heute nicht um sechzehn Uhr, sondern erst um siebzehn Uhr dreißig. Abfahrt ist an Steg zwei." }]),
      frage: "„Wann fährt die Fähre?“",
      optionen: ["um 17:30 Uhr", "um 16:00 Uhr", "um 2 Uhr"], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Gespräch", [
        { sprecher: "Chefin", stimme: P.a, text: "Kannst du morgen um acht anfangen?" },
        { sprecher: "Azubi", stimme: P.b, text: "Um acht? Da bringe ich meine kleine Schwester zur Schule. Aber um neun kann ich da sein." },
        { sprecher: "Chefin", stimme: P.a, text: "Gut, dann um neun." },
      ]),
      frage: "„Wann fängt der Azubi morgen an?“",
      optionen: ["um neun Uhr", "um acht Uhr", "nach der Schule"], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Anrufbeantworter", [{ sprecher: "Herr Vogt", stimme: P.b, text: "Hallo Mira, hier ist Herr Vogt von der Werft. Ihr Praktikumsvertrag ist fertig. Bitte unterschreiben Sie ihn nicht zu Hause, sondern kommen Sie am Freitag zu mir ins Büro." }]),
      frage: "„Was soll Mira tun?“",
      optionen: ["am Freitag ins Büro kommen", "den Vertrag zu Hause unterschreiben", "Herrn Vogt zurückrufen"], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Gespräch", [
        { sprecher: "Daria", stimme: P.c, text: "Hast du die Kisten, die Seile und die Lampen aufs Schiff gebracht?" },
        { sprecher: "Timon", stimme: P.e, text: "Die Kisten und die Seile ja. Die Lampen hole ich gleich noch." },
      ]),
      frage: "„Was ist NOCH NICHT auf dem Schiff?“",
      optionen: ["die Lampen", "die Seile", "die Kisten"], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Radiointerview", [
        { sprecher: "Moderatorin", stimme: P.a, text: "Warst du am Anfang nervös?" },
        { sprecher: "Azubi", stimme: P.d, text: "Am ersten Tag schon, sehr sogar. Aber jetzt, nach drei Monaten, kenne ich alle und weiß, was ich tun muss." },
      ]),
      frage: "„Was stimmt?“",
      optionen: ["Der Azubi ist heute nicht mehr nervös.", "Der Azubi ist seit drei Monaten nervös.", "Der Azubi kennt noch niemanden."], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Bericht", [{ sprecher: "Glockengießerin", stimme: P.c, text: "Viele denken, eine Glockengießerin arbeitet nur mit Metall. Aber zuerst bauen wir eine Form aus Lehm. Das dauert oft mehrere Wochen. Erst dann gießen wir das heiße Metall hinein." }]),
      frage: "„Was stimmt?“",
      optionen: ["Am Anfang arbeitet man mit Lehm.", "Man arbeitet nur mit Metall.", "Eine Glocke ist in einem Tag fertig."], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Meinung", [{ sprecher: "Nummer 21", stimme: P.e, text: "Ich lese Bewerbungstipps im Internet und übe mit meiner Schwester. Ein teurer Kurs ist für mich nicht nötig." }]),
      frage: "„Welche Aussage passt zu dieser Meinung?“",
      optionen: ["Man kann sich auch ohne Kurs gut vorbereiten.", "Bewerbungskurse sind immer zu teuer.", "Im Internet gibt es keine guten Tipps."], richtig: 0,
    },
    {
      typ: "auswahl",
      hoertext: hoer("Meinung", [{ sprecher: "Nummer 22", stimme: P.a, text: "Ich arbeite gern am Wochenende. Dann ist es ruhig in der Werkstatt. Dafür habe ich unter der Woche einen Tag frei. Das ist sehr praktisch." }]),
      frage: "„Welche Aussage passt zu dieser Meinung?“",
      optionen: ["Arbeit am Wochenende hat auch Vorteile.", "Am Wochenende ist die Arbeit zu anstrengend.", "In der Werkstatt ist es immer laut."], richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Was tust du in der Prüfung, BEVOR du einen Text hörst?“",
      optionen: ["Ich lese die Aufgaben genau.", "Ich schreibe schon die Lösungen auf.", "Ich warte einfach ab."], richtig: 0,
      erklaerung: "Vor jedem Teil hast du Lesezeit. Nutze sie: Dann weißt du, worauf du hören musst.",
    },
    {
      typ: "auswahl",
      frage: "„Wie oft hörst du in Teil 5 die Meinungen?“",
      optionen: ["nur einmal", "zweimal", "so oft ich will"], richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„In einem Gespräch sagt jemand zuerst Ja und am Ende Nein. Was gilt?“",
      optionen: ["das, was am Ende gesagt wird", "das, was zuerst gesagt wird", "beides"], richtig: 0,
    },
  ],
};
