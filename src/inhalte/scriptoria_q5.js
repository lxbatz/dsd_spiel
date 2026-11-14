// Scriptoria – Quest 5: Die Wegweiser (Leseverstehen Teil 5: Überschriften zuordnen) und der Endkampf
// gegen den Bibliothekar der Schatten.
// Teil 5 wie im Modellsatz: vier kurze Texte (21–24), acht Überschriften A–H, Beispiel Z, vier bleiben übrig.
// Die falschen Überschriften nehmen Lockwörter aus den Texten auf (Notfall → Erste Hilfe, Aurelia → Reise …).
// Der Endkampf kombiniert kurze Lesetexte aus allen fünf Prüfungsteilen. Alle Texte sind eigene Texte.

// ---------- Wegweiser 1: Wohin führt welcher Weg? ----------

export const WEGWEISER = [
  {
    typ: "zuordnen",
    frage: "Die Schilder sind von den Wegweisern gefallen. Lies die Texte 21–24 und die Überschriften A–H. Welche Überschrift passt zu welchem Weg? Vier Überschriften bleiben übrig.",
    beispiel: ["0  Hier finden Sie alte Karten von ganz Eldoria. Manche sind über tausend Jahre alt. Fotografieren ist erlaubt, aber nur ohne Blitz.", "Alte Karten ansehen"],
    paare: [
      ["21  Dieser Weg führt zu einem ruhigen Saal mit großen Tischen. Hier darf man nicht sprechen, nicht essen und nicht telefonieren. Wer konzentriert arbeiten möchte, ist hier genau richtig.", "In Ruhe lernen und arbeiten"],
      ["22  Ihr Buch ist kaputt oder eine Seite fehlt? Bringen Sie es hierher. Unsere Fachleute kümmern sich darum. Kleine Arbeiten sind in einer Woche fertig, größere dauern länger.", "Bücher reparieren lassen"],
      ["23  Hier steht der große Katalog. Er zeigt Ihnen, in welchem Regal ein Buch steht und ob es gerade ausgeliehen ist. Unsere Mitarbeiterinnen helfen Ihnen gern bei der Suche.", "Ein bestimmtes Buch finden"],
      ["24  Diese steile Treppe führt hinunter zur unterirdischen Bibliothek. Zurzeit ist sie geschlossen. Nur wer alle Aufgaben des Waldes gelöst hat, darf hinuntergehen.", "Nur für Mutige: der Weg in die Tiefe"],
    ],
    ablenker: [
      "Eine Pause mit Essen und Trinken",
      "Selbst ein Buch binden lernen",
      "Bücher günstig kaufen",
      "Führungen für Schulklassen",
    ],
    erklaerung: "21: ruhiger Saal, konzentriert arbeiten (Essen ist dort gerade verboten!). 22: Fachleute reparieren – man lernt es nicht selbst. 23: Katalog = ein Buch finden. 24: Treppe zur unterirdischen Bibliothek.",
  },
];

// ---------- Wegweiser 2: Die Kurse der Bibliothek ----------

export const KURSE = [
  {
    typ: "zuordnen",
    frage: "An der Kreuzung hängt auch die Tafel mit den Kursen für Lehrlinge – aber die Überschriften sind durcheinander. Lies die Texte 21–24 und die Überschriften A–H. Was passt zusammen? Vier Überschriften bleiben übrig.",
    beispiel: ["0  In diesem Kurs lernen Sie, wie man freundlich mit Besuchern spricht, ihre Fragen beantwortet und auch bei Beschwerden ruhig bleibt.", "Gut mit Kunden umgehen"],
    paare: [
      ["21  Schreiben Sie gern schöne Buchstaben? In unserem Kurs üben Sie alte Schriften mit Feder und Tinte. Am Ende gestalten Sie Ihre eigene Urkunde.", "Mit der Hand schön schreiben"],
      ["22  Viele Besucher kommen aus anderen Reichen. In diesem Kurs lernen Sie die wichtigsten Sätze in der Sprache von Aurelia, damit Sie den Gästen helfen können. Vorkenntnisse brauchen Sie nicht.", "Eine Fremdsprache für den Beruf"],
      ["23  Feuer, Wasser, Schimmel: Alte Bücher sind in Gefahr. Wir zeigen Ihnen, wie man Bücher richtig lagert und was man im Notfall tun muss.", "Bücher schützen und sicher aufbewahren"],
      ["24  Sie möchten nach der Ausbildung weiterlernen? Hier erfahren Sie, welche Weiterbildungen es gibt, wie lange sie dauern und wer sie bezahlt.", "Nach der Ausbildung weiterkommen"],
    ],
    ablenker: [
      "Briefe richtig formulieren",
      "Eine Reise nach Aurelia planen",
      "Erste Hilfe bei Unfällen",
      "Tipps für die Abschlussprüfung",
    ],
    erklaerung: "Die falschen Überschriften nehmen Wörter aus den Texten auf: Aurelia (aber es geht um die Sprache, nicht um eine Reise), Notfall (aber es geht um Bücher, nicht um Menschen), Ausbildung (aber es geht um die Zeit danach).",
  },
];

// ---------- Der Bibliothekar der Schatten ----------

export const BIBLIOTHEKAR = {
  name: "Der Bibliothekar der Schatten",
  bild: "boss_bibliothekar",
  lp: 200,
  schaden: 20,
  einleitung: "GRRRR … Wer stört meine Ruhe? Ich war einmal der Hüter dieser Bibliothek. Dann las ich das Buch des Vergessens – Morgraths Buch. Jetzt weiß ich: Niemand liest mehr richtig! Ihr überfliegt alles und versteht nichts! Beweise mir das Gegenteil – oder verschwinde im Nebel!",
  spott: [
    "Hast du das wirklich gelesen – oder nur geraten?",
    "Lies genau! Jedes Wort zählt!",
    "Grrr … „die meisten“ ist nicht „alle“!",
    "Der Nebel frisst alle, die nur überfliegen!",
    "Ich rieche ungenaues Lesen auf hundert Schritte!",
  ],
  sieg: [
    "Der Werwolf heult auf – dann wird es still. Ein goldenes Licht wirbelt um ihn herum.",
    "Das Fell verschwindet, die Krallen werden zu Händen. Vor dir steht ein alter Mann mit weißem Bart und einer zerbrochenen Brille.",
    "„Danke … Du hast mich erinnert, wer ich bin. Ich bin Ambros, der Bibliothekar. Und du liest besser als jeder, den ich kenne.“",
  ],
  niederlage: [
    "„Hah! Überflogen, nicht gelesen!“",
    "Der Bibliothekar der Schatten verschwindet im Nebel. Übe noch einmal an den Wegweisern und komm zurück!",
  ],
  fragen: [
    {
      typ: "auswahl",
      lesetext: { titel: "Notiz am Tor", text: "Das Tor öffnet sich nur für Leserinnen und Leser, die alle fünf leuchtenden Seiten gefunden haben. Wer erst vier Seiten hat, muss noch warten." },
      frage: "„Wer darf durch das Tor?“",
      optionen: ["wer alle fünf Seiten hat", "wer vier Seiten hat", "alle Leser"], richtig: 0,
    },
    {
      typ: "luecke",
      frage: "„Füll die Lücken – wenn du kannst!“",
      text: "Liebe Leserinnen und Leser,\ndie Bibliothek {bleibt} morgen geschlossen. Bitte {geben} Sie Ihre Bücher erst am Montag zurück.",
      auswahl: true,
      ablenker: ["kauft", "lesen", "öffnet"],
    },
    {
      typ: "richtigfalsch",
      lesetext: { titel: "Ausleihe", text: "Bücher dürfen Sie drei Wochen behalten. Wenn kein anderer Leser das Buch bestellt hat, können Sie die Zeit einmal um zwei Wochen verlängern. Für Bücher, die Sie zu spät zurückgeben, zahlen Sie pro Tag 20 Cent." },
      frage: "„Richtig oder falsch? Alle drei müssen stimmen!“",
      aussagen: [
        ["Man kann ein Buch fünf Wochen behalten, wenn es niemand bestellt hat.", true],
        ["Man kann die Zeit so oft verlängern, wie man will.", false],
        ["Wer ein Buch zu spät zurückgibt, muss nichts bezahlen.", false],
      ],
    },
    {
      typ: "auswahl",
      lesetext: { titel: "Aus dem Gästebuch", text: "Eigentlich wollten wir nur eine Stunde bleiben. Aber die Führung war so spannend, dass wir den ganzen Nachmittag in der Bibliothek waren." },
      frage: "„Wie lange waren die Besucher da?“",
      optionen: ["länger als geplant", "genau eine Stunde", "nur kurz"], richtig: 0,
    },
    {
      typ: "zuordnen",
      frage: "„Welche Überschrift passt? Zwei bleiben übrig!“",
      paare: [
        ["Hier können Sie Bücher bis 22 Uhr zurückgeben – auch wenn die Bibliothek schon geschlossen ist.", "Bücher auch abends abgeben"],
        ["Jeden Freitag lesen unsere Erzählerinnen Kindern spannende Geschichten vor.", "Vorlesen für Kinder"],
      ],
      ablenker: ["Bücher günstig kaufen", "Kurse für Erwachsene"],
    },
    {
      typ: "auswahl",
      frage: "„Im Text steht: ‚Die meisten Bücher dürfen Sie ausleihen, alte Handschriften aber nicht.‘ Was stimmt?“",
      optionen: ["Alte Handschriften kann man nicht mit nach Hause nehmen.", "Man darf alle Bücher ausleihen.", "Man darf gar keine Bücher ausleihen."], richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„‚Das Lesecafé ist nur am Wochenende geöffnet.‘ Was bedeutet das?“",
      optionen: ["Von Montag bis Freitag ist das Café geschlossen.", "Das Café ist jeden Tag geöffnet.", "Am Wochenende ist das Café geschlossen."], richtig: 0,
    },
    {
      typ: "auswahl",
      lesetext: { titel: "E-Mail", text: "Sehr geehrter Herr Ambros,\nleider kann ich am Donnerstag nicht zum Vorstellungsgespräch kommen, weil ich krank bin. Ist vielleicht ein anderer Termin in der nächsten Woche möglich?\nMit freundlichen Grüßen\nLena Wirth" },
      frage: "„Welche Betreffzeile passt zu dieser E-Mail?“",
      optionen: ["Bitte um einen neuen Termin", "Bewerbung um eine Stelle", "Absage meiner Bewerbung"], richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Beim Zuordnen bleiben vier Antworten übrig. Wie gehst du vor?“",
      optionen: ["Ich ordne zuerst die sicheren Antworten zu und prüfe dann den Rest genau.", "Ich nehme immer die Antwort mit den meisten gleichen Wörtern.", "Ich rate einfach schnell."], richtig: 0,
    },
    {
      typ: "auswahl",
      frage: "„Was hilft dir bei einem langen Text am meisten?“",
      optionen: ["Zuerst die Aufgaben lesen und dann die passende Stelle im Text suchen.", "Den Text dreimal ganz langsam vorlesen.", "Nur den ersten und den letzten Satz lesen."], richtig: 0,
    },
  ],
};
