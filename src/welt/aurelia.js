// Aurelia – die Hafenstadt der Glocken (Reich des Hörens, nur 3D)
// Seit Morgraths Fluch schweigen die Glocken, und niemand versteht mehr, was die anderen sagen.
// Quest 1: Die Stimmen des Hafens (Durchsagen) bei Hafenmeisterin Nerea.
// Quests 2–5 und der Drachenrichter folgen; ihre Orte sind schon da.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { MUSCHELN, REISENDE } from "../inhalte/aurelia_q1.js";
import { RASTER, KAI_Y } from "./aurelia_layout.js";

const ORPHEON = "Orpheon, der Glockenhüter";
const NEREA = "Hafenmeisterin Nerea";

const muschelnFertig = (z = zustand) => MUSCHELN.every((m) => z.erledigt[m.id]);

async function orpheon() {
  const B = bild("npc_orpheon");
  const name = zustand.held?.name ?? "Fremde";
  if (!istErledigt("aurelia_intro")) {
    await dialog(ORPHEON, [
      `Sei gegrüßt, ${name}! Willkommen in Aurelia, der Stadt der Glocken. Ich bin Orpheon, der Glockenhüter.`,
      "Früher hörte man hier überall Musik: Die Glocken läuteten, die Händler riefen, die Seeleute sangen. Aurelia ist das Reich des Hörens.",
      "Doch Morgrath hat die große Glocke oben auf dem Turm zum Schweigen gebracht. Seitdem hören die Menschen nicht mehr richtig zu. Sie verstehen Durchsagen, Nachrichten und Gespräche nicht mehr.",
      "Jeder Teil der Stadt hat einen eigenen Ton: der Hafen, der Markt, der Leuchtturm, die Werft und der Turm. Bring die Töne zurück, dann klingt die Glocke wieder.",
      "Beginne am Hafen im Süden. Hafenmeisterin Nerea braucht dringend jemanden, der gut zuhören kann!",
    ], B);
    erledigen("aurelia_intro");
    return;
  }
  if (istErledigt("aurelia_q1")) {
    erledigen("aurelia_q1_orpheon");
    await dialog(ORPHEON, [
      "Hörst du das? Ein leiser Ton schwebt über der Stadt. Der Ton des Hafens ist zurück!",
      "Die anderen Töne sind noch verloren. Der Markt, der Leuchtturm, die Werft und der Turm warten auf dich. (Diese Quests kommen bald.)",
    ], B);
    return;
  }
  await dialog(ORPHEON, "Geh zum Hafen im Süden. Nerea wartet am Kai auf dich.", B);
}

async function nerea() {
  const B = bild("npc_nerea");
  if (!istErledigt("aurelia_intro")) {
    await dialog(NEREA, "Ahoi! Bist du neu hier? Sprich zuerst mit Orpheon am Stadttor.", B);
    return;
  }
  if (!istErledigt("aurelia_q1_start")) {
    await dialog(NEREA, [
      "Ahoi! Ich bin Nerea, die Hafenmeisterin. Gut, dass du kommst – hier ist das reine Chaos!",
      "Die Rufmuscheln am Kai machen jeden Tag Durchsagen: Fähren, Ausflüge, Fundsachen, Wetter. Aber seit die Glocke schweigt, hört niemand mehr zu!",
      "Die Reisenden laufen zum falschen Steg, verpassen ihre Fähre und verlieren ihre Sachen.",
      "Hör dir die drei Rufmuscheln am Kai an und merk dir alles genau. Dann komm zurück und hilf mir mit den Reisenden.",
      "Ein Tipp: Bei Durchsagen kommt es auf Details an – Uhrzeiten, Zahlen, Orte. Und pass auf, wenn sich etwas ändert!",
    ], B);
    erledigen("aurelia_q1_start");
    return;
  }
  if (istErledigt("aurelia_q1")) {
    await dialog(NEREA, "Die Fähren fahren pünktlich vom richtigen Steg, und keiner verliert mehr seinen Rucksack. Danke! Du hast wirklich gute Ohren.", B);
    return;
  }
  if (!muschelnFertig()) {
    const fehlen = MUSCHELN.filter((m) => !istErledigt(m.id)).length;
    await dialog(NEREA, `Du musst noch ${fehlen === 1 ? "eine Rufmuschel" : `${fehlen} Rufmuscheln`} anhören. Sie stehen am Kai bei den Stegen.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: NEREA, bild: B,
    frageText: "Du hast alle Durchsagen gehört? Sehr gut! Da kommen schon die ersten Reisenden mit Fragen. Hilfst du ihnen? Du darfst die Durchsagen noch einmal anhören.",
    ja: "Ja, ich helfe den Reisenden!",
    spaeter: "In Ordnung, aber beeil dich – die Fähre wartet nicht!",
    folge: { id: "aurelia_q1_reisende", titel: "Quest: Die Stimmen des Hafens", untertitel: "Reisende beraten", aufgaben: REISENDE },
  });
  if (!geschafft) return;
  erledigen("aurelia_q1_reisende");
  erledigen("aurelia_q1");
  await dialog(NEREA, [
    "Alle haben dich verstanden – und du hast alle verstanden! So muss ein Hafen klingen.",
    "Hör mal … Vom Turm kommt ein Ton! Das ist der Ton des Hafens. Er gehört jetzt dir.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Die Stimmen des Hafens", gegenstaende: ["ton_hafen"], fanfare: true });
}

function muschelAktion(m) {
  return async () => {
    if (!istErledigt("aurelia_q1_start")) {
      await dialog(m.name, "Eine große Muschel auf einem Pfosten. Sie rauscht leise wie das Meer. Sprich zuerst mit Hafenmeisterin Nerea am Kai.");
      return;
    }
    if (istErledigt(m.id)) {
      const nochmal = await frage(m.name, "Diese Durchsagen hast du schon gehört. Möchtest du noch einmal üben?", ["Ja, noch einmal", "Nein"]);
      if (nochmal === 0) await aufgabenFolge({ id: m.id, titel: m.name, untertitel: "Durchsagen verstehen", aufgaben: m.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: m.name,
      frageText: `Die Muschel rauscht, dann hörst du einen Gong.\n„${m.inschrift}“\n\nMöchtest du die Durchsagen jetzt anhören?`,
      ja: "Ja, anhören",
      spaeter: "Die Muschel rauscht weiter.",
      folge: { id: m.id, titel: m.name, untertitel: "Durchsagen verstehen · Klicke auf „Anhören“", aufgaben: m.aufgaben },
    });
    if (!geschafft) return;
    erledigen(m.id);
    await belohnung({ xp: 20, grund: `${m.name}: Durchsagen verstanden!`, fanfare: true });
  };
}

/** Orte der späteren Quests – schon zu sehen, aber noch nicht spielbar */
function spaeter(name, text) {
  return async () => dialog(name, text);
}

async function heimweg(welt) {
  const antwort = await frage("Portal", "Das Portal schimmert golden. Möchtest du ins Dorf der Ankömmlinge zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

async function brunnen() {
  await dialog("Brunnen der Agora", "Das Wasser plätschert. Früher spielte der Brunnen eine Melodie. Jetzt hört man nur noch ein leises Rauschen.");
}

const MUSCHEL_ORTE = [[11, KAI_Y - 2], [25, KAI_Y - 2], [35, KAI_Y - 2]];

export default {
  id: "aurelia",
  name: "Aurelia – Die Hafenstadt der Glocken",
  musik: "aurelia",
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster: RASTER,
  spawns: {
    start: [5, 19],
    eingang: [5, 19],
    hafen: [21, 24],
  },
  objekte: [
    { id: "portal_aurelia", art: "portal", name: "Portal ins Dorf", x: 1, y: 18, breite: 2, aktion: heimweg, hinweis: "Portal benutzen", aktiv: () => true },
    { id: "orpheon", art: "npc", name: ORPHEON, bild: "npc_orpheon", x: 7, y: 17, aktion: orpheon,
      marker: (z) => !z.erledigt.aurelia_intro || (z.erledigt.aurelia_q1 && !z.erledigt.aurelia_q1_orpheon) },
    { id: "nerea", art: "npc", name: NEREA, bild: "npc_nerea", x: 20, y: 26, aktion: nerea,
      marker: (z) => Boolean(z.erledigt.aurelia_intro) && (!z.erledigt.aurelia_q1_start || (muschelnFertig(z) && !z.erledigt.aurelia_q1)) },
    ...MUSCHELN.map((m, i) => ({
      id: m.id, art: "objekt", name: m.name, bild: "rufmuschel", x: MUSCHEL_ORTE[i][0], y: MUSCHEL_ORTE[i][1],
      aktion: muschelAktion(m), hinweis: `${m.name} anhören`,
      leuchtet: (z) => Boolean(z.erledigt[m.id]),
      marker: (z) => Boolean(z.erledigt.aurelia_q1_start) && !z.erledigt[m.id],
    })),
    { id: "brunnen_agora", art: "objekt", name: "Brunnen der Agora", bild: "brunnen_antik", x: 23, y: 16, breite: 2, hoehe: 2, aktion: brunnen, hinweis: "Den Brunnen ansehen" },
    { id: "stand_a1", art: "objekt", name: "Marktstand", bild: "marktstand", x: 16, y: 14, breite: 2,
      aktion: spaeter("Marktstand", "Die Händlerinnen und Händler reden alle durcheinander. Hier wartet bald Quest 2: Gespräche am Markt."), hinweis: "Den Marktstand ansehen" },
    { id: "stand_a2", art: "objekt", name: "Marktstand", bild: "marktstand", x: 29, y: 19, breite: 2,
      aktion: spaeter("Marktstand", "Oliven, Feigen, Fisch … aber niemand versteht den anderen. (Quest 2 kommt bald.)"), hinweis: "Den Marktstand ansehen" },
    { id: "leuchtturm_tuer", art: "objekt", name: "Tür des Leuchtturms", bild: "tafel", x: 43, y: 17,
      aktion: spaeter("Leuchtturm", "Die Tür ist verschlossen. Drinnen klingelt das Muschelfon, aber niemand hört die Nachrichten ab. (Quest 3 kommt bald.)"), hinweis: "Die Tür untersuchen" },
    { id: "werft_tafel", art: "objekt", name: "Werft", bild: "tafel", x: 9, y: 27,
      aktion: spaeter("Werft", "„Werft von Aurelia – Auszubildende gesucht!“ Hier wartet bald Quest 4: Arbeitsanweisungen verstehen."), hinweis: "Die Tafel lesen" },
    { id: "turm_tuer", art: "objekt", name: "Tor des Glockenturms", bild: "tafel", x: 23, y: 7,
      aktion: spaeter("Glockenturm", "Das Tor ist verschlossen. Ganz oben hängt die große Glocke – stumm. Und manchmal hörst du ein tiefes Grollen … (Quest 5 und der Endkampf kommen bald.)"),
      hinweis: "Das Tor untersuchen", leuchtet: (z) => Boolean(z.erledigt.aurelia_q1) },
  ],
};
