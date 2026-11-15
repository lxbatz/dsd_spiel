// Vocantia – das Bergdorf im Schweigen (Reich des Sprechens, nur 3D)
// Der Schweigekönig, ein Eistroll mit gefrorener Krone, hat alle Stimmen im Dorf eingefroren.
// Großmutter Runa am gefrorenen Brunnen spricht als Einzige noch – ganz leise.
// Fünf Bewohner stehen in Eis erstarrt. Wer für sie spricht, taut sie auf (Reihenfolge frei):
//   Hirte Eik (Weide) · Händlerin Brynja (Markt) · Schmied Torvald (Langhalle)
//   Ratsältester Halvar (Ratshaus) · Spielleiterin Sigrun (Bühne am See)
// Sind alle fünf frei, schmilzt die Eiswand am Bergpfad. Oben wartet der Schweigekönig.
// Zum Kampf braucht man zusätzlich das Sprechsiegel: einen Lehrercode für eine echte mündliche Leistung im Unterricht.
// Nach dem Sieg zieht sich der König geschlagen auf den Gipfel zurück, und das ganze Tal taut auf und blüht.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { kampf } from "../ui/kampf.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { musik } from "../musik.js";
import { zustand, istErledigt, erledigen, hat } from "../zustand.js";
import { QUESTS, SCHWEIGEKOENIG } from "../inhalte/vocantia.js";
import { RASTER } from "./vocantia_layout.js";

const RUNA = "Großmutter Runa";
const KOENIG = SCHWEIGEKOENIG.name;
const alleFrei = (z = zustand) => QUESTS.every((q) => z.erledigt[q.id]);
const anzahlFrei = (z = zustand) => QUESTS.filter((q) => z.erledigt[q.id]).length;

/** Wo die fünf Bewohner stehen */
const ORTE = {
  vocantia_q1: [7, 38],
  vocantia_q2: [21, 21],
  vocantia_q3: [9, 19],
  vocantia_q4: [35, 19],
  vocantia_q5: [27, 35],
};

async function runa() {
  const B = bild("npc_runa");
  const name = zustand.held?.name ?? "Wanderer";
  if (!istErledigt("vocantia_intro")) {
    await dialog(RUNA, [
      `…… Pssst. Komm näher, ${name}. Ich kann nur noch flüstern.`,
      "Willkommen in Vocantia. Früher war das das lauteste Dorf in ganz Eldoria. Auf dem Markt wurde gehandelt, im Rat wurde gestritten, und am See haben wir Theater gespielt.",
      "Dann kam der Schweigekönig vom Berg herunter – ein Eistroll mit einer Krone aus Eis. Er hasst Wörter. Mit seinem Atem hat er alle Stimmen eingefroren. Und die Menschen gleich mit.",
      "Nur ich bin noch frei, weil ich so alt und so leise bin, dass er mich übersehen hat.",
      "Fünf Menschen im Dorf brauchen deine Stimme: Eik auf der Weide, Brynja am Markt, Torvald vor der Langhalle, Halvar am Ratshaus und Sigrun an der Bühne am See. Du kannst beginnen, wo du willst.",
      "Wenn du für sie sprichst – laut und in ganzen Sätzen –, schmilzt ihr Eis.",
    ], B);
    await dialog(RUNA, [
      "Noch etwas: In Vocantia musst du wirklich sprechen. Du kannst allein üben oder mit einer Partnerin oder einem Partner.",
      "Ohne Mikrofon misst eine Sprechuhr, wie lange du sprichst. Mit Mikrofon zeigt dir der Stimmkristall, ob man dich hört. Deine Stimme wird dabei nicht gespeichert und verlässt das Gerät nicht.",
      "Und wenn du nicht weiterweißt: Unter jeder Aufgabe stehen Redemittel. Benutze sie!",
    ], B);
    erledigen("vocantia_intro");
    return;
  }
  if (istErledigt("vocantia_finale")) {
    await dialog(RUNA, [
      `Hörst du das, ${name}? Vögel! Kinder! Brynja, die über den Preis von Socken streitet! Vocantia ist wieder laut.`,
      "Und der alte Troll sitzt oben auf dem Gipfel und hält sich die Ohren zu. Soll er nur. Wir singen trotzdem.",
    ], B);
    return;
  }
  if (istErledigt("vocantia_boss")) return;
  if (alleFrei()) {
    await dialog(RUNA, [
      "Alle fünf sind frei! Hörst du, wie das Eis am Bergpfad knackt? Die Eiswand ist geschmolzen.",
      "Oben auf dem Plateau sitzt der Schweigekönig auf seinem Eisthron. Gegen ihn hilft nur eine starke Stimme.",
      hat("sprechsiegel")
        ? "Ich sehe, du trägst das Sprechsiegel. Deine Lehrkraft hat deine Stimme schon gehört. Dann geh – und sprich!"
        : "Aber Vorsicht: Der König lässt nur Menschen vor, die schon einmal vor echten Menschen gesprochen haben. Dafür brauchst du das Sprechsiegel. Deine Lehrkraft gibt es dir für eine mündliche Leistung im Unterricht – als Code. Den gibst du im Menü (☰) unter „Lehrercode einlösen“ ein.",
    ], B);
    return;
  }
  const n = anzahlFrei();
  const offen = QUESTS.filter((q) => !istErledigt(q.id)).map((q) => q.name);
  await dialog(RUNA, [
    n === 0 ? "Du kannst beginnen, wo du willst. Jeder der fünf braucht deine Stimme." : `Schon ${n} von 5 sind frei! Spürst du, wie es ein bisschen wärmer wird?`,
    `Noch im Eis: ${offen.join(", ")}.`,
  ], B);
}

/** Aktion für eine der fünf eingefrorenen Figuren */
function bewohner(q) {
  const folge = { id: q.id, titel: q.titel, untertitel: q.untertitel, aufgaben: q.aufgaben };
  return async (welt) => {
    const B = bild(q.npc);
    if (istErledigt(q.id)) {
      const [erst] = q.danach;
      const nochmal = await frage(q.name, `${erst}\n\nMöchtest du noch einmal üben?`, ["Ja, noch einmal", "Nein"], B);
      if (nochmal === 0) await aufgabenFolge(folge);
      return;
    }
    if (!istErledigt("vocantia_intro")) {
      await dialog("Eisfigur", `${q.gefroren}\n\nVielleicht weiß die alte Frau am Brunnen, was hier passiert ist.`);
      return;
    }
    const geschafft = await questStarten({
      sprecher: q.name, bild: B,
      frageText: `${q.gefroren}\n\n${q.auftrag}\n\nMöchtest du jetzt sprechen?`,
      ja: "Ja, ich spreche!",
      spaeter: "Das Eis knistert leise. Komm wieder, wenn du bereit bist.",
      folge,
    });
    if (!geschafft) return;
    erledigen(q.id);
    welt.aktualisieren();
    await dialog(q.name, q.danach, B);
    if (alleFrei()) {
      await dialog("Vocantia", [
        "Ein tiefes Knacken geht durch das Tal. Die Eiswand am Bergpfad bekommt Risse – und fällt in sich zusammen.",
        "Oben auf dem Berg hörst du ein wütendes Brummen.",
      ]);
    }
    await belohnung({ xp: 150, grund: `Quest abgeschlossen: ${q.titel}`, gegenstaende: [q.gegenstand], fanfare: true });
  };
}

async function eiswand() {
  const offen = QUESTS.filter((q) => !istErledigt(q.id)).length;
  await dialog("Eiswand", `Eine glatte Wand aus blauem Eis versperrt den Bergpfad. Darin hörst du ein leises Summen – wie viele Stimmen, ganz weit weg. Noch ${offen === 1 ? "eine Person ist" : `${offen} Personen sind`} im Dorf eingefroren.`);
}

async function brunnen() {
  if (istErledigt("vocantia_finale")) {
    await dialog("Brunnen", "Das Wasser plätschert wieder. Auf dem Rand sitzen Spatzen und streiten sich um Brotkrumen.");
    return;
  }
  await dialog("Gefrorener Brunnen", "Der Brunnen ist bis zum Boden gefroren. Das Wasser ist mitten im Sprung stehen geblieben – wie ein Satz, den niemand zu Ende gesagt hat.");
}

// ---------- Endkampf: der Schweigekönig ----------

async function koenig(welt) {
  const B = bild("boss_schweigekoenig");
  if (istErledigt("vocantia_boss")) {
    await dialog("Eisthron", "Der Thron ist leer und tropft. Ganz oben auf dem Gipfel sitzt der Schweigekönig im letzten Schnee, den Rücken zum Tal. Ab und zu brummt er. Vielleicht summt er sogar mit.");
    return;
  }
  if (!alleFrei()) {
    await dialog(KOENIG, "„…… Geh. Hier oben ist es still. So soll es bleiben.“", B);
    return;
  }
  if (!hat("sprechsiegel")) {
    await dialog(KOENIG, [
      "„Hah. Du hast mit Eisfiguren geredet. Das ist leicht. Eisfiguren lachen nicht über Fehler.“",
      "„Hast du schon einmal vor echten Menschen gesprochen? Zeig mir das Sprechsiegel – sonst geh zurück ins Tal!“",
      "(Das Sprechsiegel bekommst du von deiner Lehrkraft für eine mündliche Leistung im Unterricht. Gib den Code im Menü (☰) unter „Lehrercode einlösen“ ein.)",
    ], B);
    return;
  }
  const bereit = await frage(KOENIG, "„Das Sprechsiegel … warmer Bernstein. Ich hasse Bernstein. Nun gut. Sprich – wenn du dich traust! Bist du bereit?“", ["Ja, ich bin bereit!", "Noch nicht."], B);
  if (bereit !== 0) return;
  const sieg = await kampf({ ...SCHWEIGEKOENIG, bild: B, quest: "vocantia_boss" }, SCHWEIGEKOENIG.fragen);
  if (!sieg) return;
  erledigen("vocantia_boss");
  welt.aktualisieren();
  await belohnung({ xp: 200, grund: "Bosskampf gewonnen: Der Schweigekönig" });
  await dialog(RUNA, [
    "Die Sonne bricht durch die Wolken. Im ganzen Tal tropft es, rauscht es, knackt es.",
    "Der Schnee schmilzt. Unter ihm ist das Gras noch grün. Am See springt das Eis, und überall öffnen sich Blüten.",
  ], bild("npc_runa"));
  erledigen("vocantia_finale");
  welt.aktualisieren();
  musik("vocantia_fruehling");
  await dialog(RUNA, [
    `Runa steht neben dir. Ihre Stimme ist laut und klar: „${zustand.held?.name ?? "Du"}, du hast uns allen die Stimme zurückgegeben!“`,
    "Die fünf Eiskristalle in deiner Tasche schmelzen zu einem einzigen, funkelnden Stein.",
    "„Für dich. Ein Diamant – hart wie Eis, aber er funkelt nur im Licht. Vocantia ist gerettet!“",
  ], bild("npc_runa"));
  await belohnung({ xp: 250, grund: "Vocantia ist gerettet!", gegenstaende: ["diamant_abzeichen"], fanfare: true });
}

// ---------- Portal ----------

async function heimweg(welt) {
  const antwort = await frage("Portal", "Das Portal glitzert wie Raureif. Möchtest du ins Dorf der Ankömmlinge zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

export default {
  id: "vocantia",
  name: "Vocantia – Das Bergdorf im Schweigen",
  get musik() { return zustand.erledigt.vocantia_finale ? "vocantia_fruehling" : "vocantia"; },
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster: RASTER,
  spawns: {
    start: [23, 40],
    eingang: [23, 40],
    mitte: [23, 27],
    weide: [12, 38],
    markt: [21, 23],
    halle: [9, 20],
    rat: [35, 21],
    see: [26, 36],
    pfad: [23, 13],
    gipfel: [23, 7],
  },
  objekte: [
    { id: "portal_vocantia", art: "portal", name: "Portal ins Dorf", x: 22, y: 42, breite: 2, aktion: heimweg, hinweis: "Portal benutzen", aktiv: () => true },
    { id: "runa", art: "npc", name: RUNA, bild: "npc_runa", x: 23, y: 26, aktion: runa,
      marker: (z) => !z.erledigt.vocantia_intro || (alleFrei(z) && !z.erledigt.vocantia_boss) },
    { id: "vocantia_brunnen", art: "objekt", name: "Gefrorener Brunnen", bild: "brunnen_eis", x: 23, y: 23, breite: 2, hoehe: 2, aktion: brunnen, hinweis: "Den Brunnen ansehen",
      leuchtet: (z) => Boolean(z.erledigt.vocantia_finale) },
    ...QUESTS.map((q) => ({
      id: q.id.replace("vocantia_", "bewohner_"), art: "npc", name: q.name, bild: q.npc, x: ORTE[q.id][0], y: ORTE[q.id][1],
      aktion: bewohner(q), hinweis: "Ansprechen",
      eis: true, frei: (z) => Boolean(z.erledigt[q.id]),
      leuchtet: (z) => Boolean(z.erledigt[q.id]),
      marker: (z) => Boolean(z.erledigt.vocantia_intro) && !z.erledigt[q.id],
    })),
    { id: "marktstand", art: "objekt", name: "Marktstand", bild: "marktstand", x: 18, y: 20, breite: 2, leuchtet: (z) => Boolean(z.erledigt.vocantia_q2) },
    { id: "amboss", art: "objekt", name: "Amboss", bild: "amboss", x: 12, y: 19, leuchtet: (z) => Boolean(z.erledigt.vocantia_q3) },
    { id: "ratsfeuer", art: "objekt", name: "Ratsfeuer", bild: "ratsfeuer", x: 37, y: 19, leuchtet: (z) => Boolean(z.erledigt.vocantia_q4) },
    { id: "buehne", art: "objekt", name: "Bühne am See", bild: "buehne", x: 26, y: 32, breite: 3, hoehe: 2, leuchtet: (z) => Boolean(z.erledigt.vocantia_q5) },
    { id: "eiswand", art: "objekt", name: "Eiswand", bild: "eiswand", x: 22, y: 10, breite: 4,
      aktion: eiswand, hinweis: "Die Eiswand untersuchen", offen: (z) => alleFrei(z) },
    { id: "eisthron", art: "npc", name: KOENIG, bild: "schweigekoenig", x: 23, y: 3, breite: 2, hoehe: 2,
      aktion: koenig, hinweis: "Den Schweigekönig ansprechen",
      leuchtet: (z) => Boolean(z.erledigt.vocantia_boss),
      marker: (z) => alleFrei(z) && !z.erledigt.vocantia_boss },
  ],
};
