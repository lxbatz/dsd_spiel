// Das Dorf der Ankömmlinge (Level 1)

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { belohnung } from "../ui/belohnung.js";
import { heldenpassFormular } from "../ui/heldenpass.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen, heldSetzen, geben } from "../zustand.js";
import { VORSTELLEN, FRAGEN_STELLEN, PERSONEN_BESCHREIBEN, AUSHANG } from "../inhalte/dorf.js";

const DORF_QUESTS = [
  ["dorf_wilma", "Händlerin Wilma am Markt"],
  ["dorf_borin", "Schmied Borin an der Schmiede"],
  ["dorf_brett", "das Schwarze Brett am Brunnen"],
];

const ohnePass = () => !istErledigt("dorf_heldenpass");

async function zuerstZuAldric(sprecher, bildKey) {
  await dialog(sprecher, "Hallo, Fremde, Fremder! Du bist neu hier, oder? Geh zuerst zum Ratsältesten Aldric vor dem Rathaus.", bild(bildKey));
}

async function aldric(welt) {
  const S = "Ratsältester Aldric";
  const B = bild("npc_aldric");

  if (!istErledigt("dorf_heldenpass")) {
    await dialog(S, [
      "Willkommen im Dorf der Ankömmlinge!\nIch bin Aldric, der Älteste im Rat der Weisen.",
      "Eldoria ist in großer Gefahr. Der dunkle Zauberer Morgrath hat das Sprachsiegel zerbrochen. Seitdem verstehen sich die Völker nicht mehr.",
      "Eine alte Prophezeiung sagt: Nur wer die vier Sprachkräfte meistert – Hören, Lesen, Schreiben und Sprechen – kann das Siegel erneuern.",
      "Vielleicht bist du eine Heldin oder ein Held aus der Prophezeiung? Zuerst brauchst du einen Heldenpass. Bitte füll ihn aus.",
    ], B);
    const held = await heldenpassFormular();
    heldSetzen(held);
    geben("heldenpass");
    welt.aktualisieren();
    await dialog(S, `${held.name} – ein schöner Name! Jetzt stell dich dem Rat richtig vor. Zeig uns, was du schon kannst.`, B);
    await aufgabenFolge({ titel: "Quest: Stell dich vor", untertitel: "Dorf der Ankömmlinge", aufgaben: VORSTELLEN });
    erledigen("dorf_heldenpass");
    await belohnung({ xp: 50, grund: "Quest abgeschlossen: Stell dich vor" });
    await dialog(S, [
      `Sehr gut, ${held.name}! Der Rat freut sich, dich kennenzulernen.`,
      "Bevor du auf die große Reise gehst, brauchen drei Menschen im Dorf deine Hilfe:\n• Händlerin Wilma am Markt\n• Schmied Borin an der Schmiede\n• und am Brunnen hängt ein Aushang am Schwarzen Brett.",
      "Komm zu mir zurück, wenn du alles erledigt hast. Drücke Q, dann siehst du deine Aufgaben.",
    ], B);
    return;
  }

  const offen = DORF_QUESTS.filter(([id]) => !istErledigt(id));
  if (offen.length) {
    await dialog(S, `Du hast noch nicht alles erledigt. Diese Aufgaben fehlen noch:\n${offen.map(([, t]) => "• " + t).join("\n")}`, B);
    return;
  }

  if (!istErledigt("dorf_abschluss")) {
    await dialog(S, [
      `${zustand.held.name}, das ganze Dorf spricht über dich! Du kannst dich vorstellen, Fragen stellen, Personen beschreiben und Texte verstehen.`,
      "Dafür bekommst du das Bronze-Abzeichen der Ankömmlinge. Es schützt dich in schweren Kämpfen.",
    ], B);
    erledigen("dorf_abschluss");
    await belohnung({ xp: 0, grund: "Das Dorf der Ankömmlinge ist gemeistert!", gegenstaende: ["bronze_abzeichen"] });
    welt.aktualisieren();
    await dialog(S, [
      "Jetzt bist du bereit. Das Portal im Süden des Dorfes ist offen.",
      "Es bringt dich nach Lythara, ins Reich der Schreiber. Die Schreibmeister sind verschwunden, und überall liegen unvollständige Texte.",
      "Lythara braucht am dringendsten Hilfe. Finde dort Meisterin Lyra. Viel Glück!",
    ], B);
    return;
  }

  await dialog(S, "Das Portal im Süden bringt dich nach Lythara. Der Rat glaubt an dich!", B);
}

async function wilma() {
  const S = "Händlerin Wilma";
  const B = bild("npc_wilma");
  if (ohnePass()) return zuerstZuAldric(S, "npc_wilma");
  if (istErledigt("dorf_wilma")) {
    await dialog(S, "Frisches Brot, rote Äpfel! Und denk daran: Ein gutes Gespräch beginnt mit einer guten Frage.", B);
    return;
  }
  await dialog(S, [
    "Hallo! Ich bin Wilma. Ich verkaufe hier Brot, Obst und Gemüse.",
    "Seit Morgraths Fluch verstehe ich meine Kunden nicht mehr. Alle meine Fragen sind durcheinander! Hilfst du mir?",
  ], B);
  await aufgabenFolge({ titel: "Quest: Wilmas Fragen", untertitel: "Fragen stellen", aufgaben: FRAGEN_STELLEN });
  erledigen("dorf_wilma");
  await dialog(S, "Wunderbar! Jetzt kann ich wieder mit allen sprechen. Hier, nimm das. Meine Großmutter hat es gefunden – es ist ein altes Artefakt!", B);
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Wilmas Fragen", gegenstaende: ["amulett_wortschaetze"] });
}

async function borin() {
  const S = "Schmied Borin";
  const B = bild("npc_borin");
  if (ohnePass()) return zuerstZuAldric(S, "npc_borin");
  if (istErledigt("dorf_borin")) {
    await dialog(S, "Finn ist wieder da! Er war bei der Katze von Wilma. Danke noch einmal!", B);
    return;
  }
  await dialog(S, [
    "Hallo! Ich bin Borin, der Schmied. Ich habe ein großes Problem: Mein Lehrling Finn ist verschwunden!",
    "Ich habe einen Steckbrief geschrieben. Lies ihn bitte genau. Dann kannst du mir helfen, Finn zu finden.",
  ], B);
  await aufgabenFolge({ titel: "Quest: Wo ist Finn?", untertitel: "Personen beschreiben", aufgaben: PERSONEN_BESCHREIBEN });
  erledigen("dorf_borin");
  await dialog(S, "Rote Haare, braune Jacke, eine Katze … Das war Finn! Danke! Jetzt weiß ich, wo ich ihn suchen muss.", B);
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Wo ist Finn?" });
}

async function brett() {
  if (ohnePass()) {
    await dialog("Schwarzes Brett", "Hier hängen Nachrichten des Rates. Sprich zuerst mit Aldric vor dem Rathaus.");
    return;
  }
  if (istErledigt("dorf_brett")) {
    await dialog("Schwarzes Brett", "Der Aushang zum Erntefest hängt noch hier. Du hast ihn schon gelesen.");
    return;
  }
  await dialog("Schwarzes Brett", "Am Brett hängt ein neuer Aushang des Rates. Lies ihn genau und beantworte die Fragen.");
  await aufgabenFolge({ titel: "Quest: Der Aushang", untertitel: "Einfache Texte verstehen", aufgaben: AUSHANG });
  erledigen("dorf_brett");
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Der Aushang" });
}

async function brunnen() {
  await dialog("Brunnen", "Das Wasser ist klar und kalt. Im Wasser siehst du dein Spiegelbild. Du siehst mutig aus!");
}

async function portal(welt) {
  if (!istErledigt("dorf_abschluss")) {
    await dialog("Altes Portal", "Die Steine sind kalt und dunkel. Der Rat muss das Portal erst öffnen.");
    return;
  }
  const antwort = await frage("Portal nach Lythara", "Das Portal leuchtet blau. Möchtest du nach Lythara reisen, ins Reich der Schreiber?", ["Ja, ich reise nach Lythara!", "Noch nicht."]);
  if (antwort === 0) welt.reisen("halle", "eingang");
}

export default {
  id: "dorf",
  name: "Das Dorf der Ankömmlinge",
  raster: [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTT........................TTT",
    "TT.RRRRR...RRRRRRR...RRRRR..TT",
    "T..HHHHH...HHHHHHH...HHHHH...T",
    "T..HHdHH...HHHdHHH...HHdHH...T",
    "T....,........,,.......,.....T",
    "T....,........,,.......,.....T",
    "T....,,,,,,,,,,,,,,,,,,,.....T",
    "T.............,,.............T",
    "T..F.....F....,,...F......F..T",
    "T.............,,.............T",
    "T.....,,,,,,,,,,......~~~~...T",
    "T.............,,.....~~~~~~..T",
    "T.............,,.F...~~~~~~..T",
    "T.fffffff.....,,.....~~~~~~..T",
    "T..........F..,,.....~~~~~~..T",
    "T...F.......,,,,,,F...~~~~...T",
    "TT.......T..,,,,,,..T.......TT",
    "TTT.........,,,,,,...........T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ],
  spawns: {
    start: [15, 13],
    vonLythara: [15, 15],
  },
  objekte: [
    { id: "aldric", art: "npc", name: "Ratsältester Aldric", bild: "npc_aldric", x: 16, y: 5, aktion: aldric,
      marker: (z) => !z.erledigt.dorf_heldenpass || (!z.erledigt.dorf_abschluss && DORF_QUESTS.every(([id]) => z.erledigt[id])) },
    { id: "wilma", art: "npc", name: "Händlerin Wilma", bild: "npc_wilma", x: 6, y: 9, aktion: wilma,
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_wilma },
    { id: "stand", art: "objekt", bild: "marktstand", x: 7, y: 9, breite: 2 },
    { id: "borin", art: "npc", name: "Schmied Borin", bild: "npc_borin", x: 24, y: 5, aktion: borin,
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_borin },
    { id: "amboss", art: "objekt", bild: "amboss", x: 26, y: 5 },
    { id: "brett", art: "objekt", name: "Schwarzes Brett", bild: "brett", x: 12, y: 9, aktion: brett, hinweis: "Aushang lesen",
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_brett },
    { id: "brunnen", art: "objekt", name: "Brunnen", bild: "brunnen", x: 17, y: 10, aktion: brunnen, hinweis: "In den Brunnen schauen" },
    { id: "portal", art: "portal", name: "Portal nach Lythara", x: 14, y: 17, breite: 2, aktion: portal, hinweis: "Portal benutzen",
      aktiv: (z) => Boolean(z.erledigt.dorf_abschluss) },
  ],
};
