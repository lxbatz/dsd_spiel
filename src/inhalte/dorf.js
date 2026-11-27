// Aufgaben im Dorf der Ankömmlinge (Level 1: Grundfertigkeiten).
// Format der Aufgaben: siehe src/ui/aufgaben.js

import { sauber, grossAnfang, ortMit, teileListe, aufzaehlen, alterAlsZahl } from "./sprachhilfen.js";

// Die Vorstellungs-Quest benutzt die Angaben aus dem Heldenpass.
// Fehlt eine Angabe oder ist sie unbrauchbar, fällt der passende Satz weg
// bzw. die Aufgabe nimmt das Beispiel von Mira.

const zuLang = (text, maxWoerter) => text.split(/\s+/).length > maxWoerter;

/** Der Traumberuf aus dem Heldenpass, wenn er brauchbar ist (sonst null). */
function berufAusPass(z) {
  const b = sauber(z.held?.beruf);
  if (!b || zuLang(b, 4) || /\b(möchte|werden|ich)\b/i.test(b)) return null;
  return grossAnfang(b);
}

function traumberuf(z) {
  return berufAusPass(z) ?? "Krankenpfleger";
}

function vorstellungsLuecke(z) {
  const h = z.held ?? {};
  const name = sauber(h.name);
  const alter = alterAlsZahl(h.alter);
  const land = sauber(h.land);
  const ort = sauber(h.wohnort);
  const sprachen = teileListe(h.sprachen ?? "");

  const zeilen = [];
  if (name && !zuLang(name, 3)) zeilen.push(`Hallo! Ich {heiße} ${name}.`);
  if (alter) zeilen.push(`Ich {bin} ${alter} Jahre alt.`);
  if (land && !zuLang(land, 4) && ort && !zuLang(ort, 4)) {
    zeilen.push(`Ich {komme} ${ortMit("aus", land)} und {wohne} jetzt ${ortMit("in", ort)}.`);
  } else if (land && !zuLang(land, 4)) {
    zeilen.push(`Ich {komme} ${ortMit("aus", land)}.`);
  } else if (ort && !zuLang(ort, 4)) {
    zeilen.push(`Ich {wohne} ${ortMit("in", ort)}.`);
  }
  if (sprachen.length && !sprachen.some((s) => zuLang(s, 2))) zeilen.push(`Ich {spreche} ${aufzaehlen(sprachen)}.`);

  const luecken = zeilen.join(" ").match(/\{/g)?.length ?? 0;
  if (luecken >= 3) {
    return {
      typ: "luecke",
      frage: "So stellst du dich dem Rat vor. Ergänze die Verben.",
      text: zeilen.join("\n"),
      auswahl: true,
      ablenker: ["habe", "gehe", "heißt", "bist"].filter((w) => !zeilen.join(" ").includes(`{${w}}`)),
      erklaerung: "ich heiße … · ich bin … Jahre alt · ich komme aus … · ich wohne in … · ich spreche …",
    };
  }
  return {
    typ: "luecke",
    frage: "Mira stellt sich dem Rat vor. Ergänze die Verben.",
    text: "Hallo! Ich {heiße} Mira. Ich {bin} 16 Jahre alt.\nIch {komme} aus Polen und {wohne} jetzt in Köln.\nIch {spreche} Polnisch, Englisch und ein bisschen Deutsch.",
    auswahl: true,
    ablenker: ["habe", "gehe"],
    erklaerung: "ich heiße … · ich bin … Jahre alt · ich komme aus … · ich wohne in … · ich spreche …",
  };
}

function hobbySatz(z) {
  const hobbys = teileListe(z.held?.hobbys ?? "").slice(0, 3);
  if (hobbys.length && !hobbys.some((x) => zuLang(x, 2))) {
    const liste = aufzaehlen(hobbys);
    return {
      typ: "ordnen",
      frage: "Erzähl dem Rat von deinen Hobbys. Bau den Satz richtig zusammen.",
      teile: ["In meiner Freizeit", "mag", "ich", "am liebsten", `${liste}.`],
      loesungen: [`Ich mag in meiner Freizeit am liebsten ${liste}.`, `Am liebsten mag ich in meiner Freizeit ${liste}.`],
      erklaerung: "Im Aussagesatz steht das Verb (mag) immer auf Position 2.",
    };
  }
  return {
    typ: "ordnen",
    frage: "Bau den Satz richtig zusammen.",
    teile: ["In meiner Freizeit", "spiele", "ich", "gern", "Gitarre."],
    loesungen: ["Ich spiele in meiner Freizeit gern Gitarre."],
    erklaerung: "Im Aussagesatz steht das Verb immer auf Position 2.",
  };
}

export const VORSTELLEN = [
  vorstellungsLuecke,
  hobbySatz,
  (z) => {
    const beruf = traumberuf(z);
    return {
      typ: "auswahl",
      frage: `Du möchtest dem Rat deinen Traumberuf nennen: ${beruf}. Welcher Satz ist richtig?`,
      optionen: [`Ich möchte ${beruf} werden.`, `Ich werde möchte ${beruf}.`, `Ich möchte werden ${beruf}.`],
      richtig: 0,
      erklaerung: "möchte + Infinitiv: Der Infinitiv (werden) steht am Ende.",
    };
  },
  {
    typ: "freitext",
    id: "dorf_vorstellung",
    frage: "Jetzt du! Stell dich dem Rat vor. Schreibe mindestens 30 Wörter.",
    minWoerter: 30,
    stichpunkte: (z) => {
      const h = z.held ?? {};
      const teile = [
        h.name && `Name: ${h.name}`, h.alter && `Alter: ${h.alter}`, h.land && `Land: ${h.land}`,
        h.wohnort && `Wohnort: ${h.wohnort}`, h.sprachen && `Sprachen: ${h.sprachen}`,
        h.hobbys && `Hobbys: ${h.hobbys}`, h.beruf && `Traumberuf: ${h.beruf}`,
      ].filter(Boolean);
      return "Deine Stichpunkte aus dem Heldenpass: " + (teile.join(" · ") || "–");
    },
    muster: [
      { such: "ich heiße|ich heisse|mein name ist", wert: (z) => grossAnfang(sauber(z.held?.name ?? "")), ok: "Du nennst deinen Namen.", fehlt: "Nenne deinen Namen: Ich heiße …" },
      { such: "jahre alt", wert: (z) => alterAlsZahl(z.held?.alter), ok: "Du nennst dein Alter.", fehlt: "Nenne dein Alter: Ich bin … Jahre alt." },
      { such: "\\bkomme\\b[^.!?]*\\baus", wert: (z) => grossAnfang(sauber(z.held?.land ?? "")), ok: "Du sagst, woher du kommst.", fehlt: "Woher kommst du? Ich komme aus …" },
      { such: "\\bwohne\\b", wert: (z) => grossAnfang(sauber(z.held?.wohnort ?? "")), ok: "Du sagst, wo du wohnst.", fehlt: "Wo wohnst du? Ich wohne in …" },
      { such: "spreche\\b", wert: (z) => teileListe(z.held?.sprachen ?? ""), ok: "Du nennst deine Sprachen.", fehlt: "Welche Sprachen sprichst du? Ich spreche …" },
      { such: "hobby|gern|freizeit", ok: "Du erzählst von deinen Hobbys.", fehlt: "Was machst du gern? In meiner Freizeit …" },
      { such: "möchte.*werden|traumberuf", wert: berufAusPass, ok: "Du nennst deinen Traumberuf.", fehlt: "Was möchtest du werden? Ich möchte … werden." },
    ],
    checkliste: [
      "Ich habe in ganzen Sätzen geschrieben.",
      "Das Verb steht auf Position 2.",
      "Ich habe meinen Text noch einmal gelesen.",
    ],
  },
];

export const FRAGEN_STELLEN = [
  {
    typ: "zuordnen",
    frage: "Wilma hat Fragen und Antworten aufgeschrieben, aber alles ist durcheinander. Welche Antwort passt?",
    paare: [
      ["Wie heißt du?", "Ich heiße Wilma."],
      ["Woher kommst du?", "Ich komme aus dem Norden von Eldoria."],
      ["Wo wohnst du?", "Ich wohne hier im Dorf."],
      ["Wie alt bist du?", "Ich bin 42 Jahre alt."],
      ["Was machst du gern?", "Ich backe gern Kuchen."],
    ],
  },
  {
    typ: "luecke",
    frage: "Welches Fragewort passt?",
    text: "{Wie} heißt du?\n{Woher} kommst du?\n{Wo} wohnst du?\n{Was} ist dein Traumberuf?\n{Wann} hast du Geburtstag?",
    auswahl: true,
    ablenker: ["Wer", "Wohin"],
    erklaerung: "Wie? (Name, Alter) · Woher? (Herkunft) · Wo? (Ort) · Was? (Sache) · Wann? (Zeit)",
  },
  {
    typ: "ordnen",
    frage: "Ein Kunde fragt Wilma nach dem Preis. Bau die Frage.",
    teile: ["Was", "kostet", "ein Brot", "?"],
    erklaerung: "W-Frage: Das W-Wort steht auf Position 1, das Verb auf Position 2.",
  },
  {
    typ: "ordnen",
    frage: "Wilma möchte wissen, ob du Deutsch sprichst. Bau die Frage.",
    teile: ["Sprichst", "du", "Deutsch", "?"],
    erklaerung: "Ja/Nein-Frage: Das Verb steht auf Position 1.",
  },
  {
    typ: "auswahl",
    frage: "Du möchtest wissen, wie viel die Äpfel kosten. Was fragst du?",
    optionen: ["Wie viel kosten die Äpfel?", "Wie viel die Äpfel kosten?", "Kosten wie viel die Äpfel?"],
    richtig: 0,
    erklaerung: "W-Wort – Verb – Rest: Wie viel kosten die Äpfel?",
  },
];

export const PERSONEN_BESCHREIBEN = [
  {
    typ: "richtigfalsch",
    lesetext: "steckbrief_finn",
    frage: "Lies Borins Steckbrief. Richtig oder falsch?",
    aussagen: [
      ["Finn ist 15 Jahre alt.", true],
      ["Finn hat lange, rote Haare.", false],
      ["Finn hat grüne Augen.", true],
      ["Finn ist klein und dick.", false],
      ["Finn mag Katzen.", true],
    ],
  },
  {
    typ: "zuordnen",
    frage: "Finde das Gegenteil.",
    paare: [
      ["groß", "klein"],
      ["kurz", "lang"],
      ["schlank", "dick"],
      ["freundlich", "unfreundlich"],
      ["jung", "alt"],
      ["schüchtern", "offen"],
    ],
  },
  {
    typ: "luecke",
    frage: "Borin beschreibt seine Tochter Lina. Ergänze.",
    text: "Das ist Lina. Sie {hat} lange, blonde Haare. Sie {ist} klein und sportlich.\nSie {trägt} ein rotes Kleid. Ihre Augen {sind} blau.",
    auswahl: true,
    ablenker: ["haben", "trägst"],
    erklaerung: "Haare/Augen: Sie hat … · Aussehen: Sie ist … · Kleidung: Sie trägt …",
  },
  {
    typ: "auswahl",
    lesetext: "steckbrief_finn",
    frage: "Ein Händler sagt: „Ich habe einen Jungen gesehen. Er hatte rote Haare und eine braune Jacke. Er hat mit einer Katze gespielt.“ War das Finn?",
    optionen: ["Ja, wahrscheinlich. Die Beschreibung passt.", "Nein, Finn hat schwarze Haare.", "Nein, Finn mag keine Tiere."],
    richtig: 0,
  },
];

export const AUSHANG = [
  {
    typ: "auswahl",
    lesetext: "aushang_fest",
    frage: "Wann beginnt das Fest?",
    optionen: ["am Samstag um 14 Uhr", "am Donnerstag um 14 Uhr", "am Samstagmorgen"],
    richtig: 0,
  },
  {
    typ: "auswahl",
    lesetext: "aushang_fest",
    frage: "Was passiert, wenn es regnet?",
    optionen: ["Das Fest findet im Rathaus statt.", "Das Fest fällt aus.", "Das Fest ist dann am Sonntag."],
    richtig: 0,
  },
  {
    typ: "richtigfalsch",
    lesetext: "aushang_fest",
    frage: "Richtig oder falsch?",
    aussagen: [
      ["Man muss für das Fest bezahlen.", false],
      ["Es gibt Musik und Essen.", true],
      ["Helfer melden sich beim Schmied.", false],
      ["Für Kinder gibt es ein Theater.", true],
    ],
  },
  {
    typ: "auswahl",
    lesetext: "aushang_fest",
    frage: "Du möchtest beim Aufbau helfen. Was machst du?",
    optionen: ["Ich gehe bis Donnerstag zu Wilma.", "Ich gehe am Samstag um 14 Uhr ins Rathaus.", "Ich frage den Schmied Borin."],
    richtig: 0,
  },
];
