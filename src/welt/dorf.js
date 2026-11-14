// Das Dorf der Ankömmlinge (Level 1)

import { dialog, frage } from "../ui/fenster.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { heldenpassFormular } from "../ui/heldenpass.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen, heldSetzen, geben } from "../zustand.js";
import { VORSTELLEN, FRAGEN_STELLEN, PERSONEN_BESCHREIBEN, AUSHANG } from "../inhalte/dorf.js";
import { FINN_AUFGABEN, MARKT_AUFGABEN, WERKSTATT_AUFGABEN, MIMI_WILMA, MIMI_ALDRIC, MIMI_BORIN, MIMI_FINN } from "../inhalte/dorf_neben.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { NICHTS_OFFEN } from "./nichts.js";

const DORF_QUESTS = [
  ["dorf_wilma", "Händlerin Wilma am Markt"],
  ["dorf_borin", "Schmied Borin an der Schmiede"],
  ["dorf_brett", "das Schwarze Brett am Brunnen"],
];

const ohnePass = () => !istErledigt("dorf_heldenpass");

// Nebenquests (freiwillig): offen, sobald der Torwächter in Lythara besiegt ist
export const nebenquestsOffen = (z = zustand) => Boolean(z.erledigt.lythara_q1_boss);
export const NEBENQUESTS = [
  ["dorf_finn", "Finns Geheimnis (Finn an der Schmiede)"],
  ["dorf_markt", "Ein Tag am Marktstand (Händlerin Wilma)"],
  ["dorf_werkstatt", "Borins Werkstatt (Schmied Borin)"],
  ["dorf_mimi", "Mimi ist weg! (Händlerin Wilma, nach dem Marktstand)"],
];

// ---------- Nebenquest „Mimi ist weg!“ (Hören) ----------
// Ablauf: Wilma (dorf_mimi_start) → Aldric (dorf_mimi_aldric) → Borin (dorf_mimi_borin)
// → Finn (dorf_mimi_finn) → Korb am Holzzaun (dorf_mimi_gefunden) → zurück zu Wilma (dorf_mimi)
const mimiSchritt = (z = zustand) => {
  const e = (id) => Boolean(z.erledigt[id]);
  if (!e("dorf_markt") || e("dorf_mimi")) return null;
  if (!e("dorf_mimi_start")) return "wilma";
  if (!e("dorf_mimi_aldric")) return "aldric";
  if (!e("dorf_mimi_borin")) return "borin";
  if (!e("dorf_mimi_finn")) return "finn";
  if (!e("dorf_mimi_gefunden")) return "korb";
  return "wilma_ende";
};
export { mimiSchritt };

/** Ein Hörschritt: kurze Einleitung, dann die Höraufgaben. */
async function mimiHoeren(sprecher, B, einleitung, id, titel, aufgaben, danach) {
  await dialog(sprecher, einleitung, B);
  const ergebnis = await aufgabenFolge({ id, titel: `Nebenquest: Mimi ist weg! – ${titel}`, untertitel: "Hören: Klicke auf „Anhören“. Du kannst so oft hören, wie du möchtest.", aufgaben });
  if (ergebnis.abgebrochen) {
    await dialog(sprecher, "Komm einfach wieder, wenn du Zeit hast.", B);
    return false;
  }
  erledigen(id);
  await belohnung({ xp: 15, grund: `Hinweis gefunden: ${titel}`, fanfare: true });
  if (danach) await dialog(sprecher, danach, B);
  return true;
}

async function zuerstZuAldric(sprecher, bildKey) {
  await dialog(sprecher, "Hallo, Fremde, Fremder! Du bist neu hier, oder? Geh zuerst zum Ratsältesten Aldric vor dem Rathaus.", bild(bildKey));
}

async function aldric(welt) {
  const S = "Ratsältester Aldric";
  const B = bild("npc_aldric");

  if (!istErledigt("dorf_heldenpass")) {
    const spaeter = "Kein Problem. Sieh dich ruhig im Dorf um. Komm zu mir, wenn du bereit bist.";
    if (!zustand.held) {
      await dialog(S, [
        "Willkommen im Dorf der Ankömmlinge!\nIch bin Aldric, der Älteste im Rat der Weisen.",
        "Eldoria ist in großer Gefahr. Der dunkle Zauberer Morgrath hat das Sprachsiegel zerbrochen. Seitdem verstehen sich die Völker nicht mehr.",
        "Eine alte Prophezeiung sagt: Nur wer die vier Sprachkräfte meistert – Hören, Lesen, Schreiben und Sprechen – kann das Siegel erneuern.",
        "Vielleicht bist du eine Heldin oder ein Held aus der Prophezeiung? Zuerst brauchst du einen Heldenpass. Bitte füll ihn aus.",
      ], B);
      const neuerHeld = await heldenpassFormular();
      if (!neuerHeld) {
        await dialog(S, spaeter, B);
        return;
      }
      heldSetzen(neuerHeld);
      geben("heldenpass");
      welt.aktualisieren();
    }
    const held = zustand.held;
    const geschafft = await questStarten({
      sprecher: S, bild: B,
      frageText: `${held.name} – ein schöner Name! Jetzt stell dich dem Rat richtig vor. Zeig uns, was du schon kannst. Bist du bereit?`,
      ja: "Ja, ich stelle mich vor!",
      spaeter,
      folge: { id: "dorf_heldenpass", titel: "Quest: Stell dich vor", untertitel: "Dorf der Ankömmlinge", aufgaben: VORSTELLEN },
    });
    if (!geschafft) return;
    erledigen("dorf_heldenpass");
    await belohnung({ xp: 50, grund: "Quest abgeschlossen: Stell dich vor", fanfare: true });
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
    await belohnung({ xp: 0, grund: "Das Dorf der Ankömmlinge ist gemeistert!", gegenstaende: ["bronze_abzeichen"], fanfare: true });
    welt.aktualisieren();
    await dialog(S, [
      "Jetzt bist du bereit. Das Portal im Süden des Dorfes ist offen.",
      "Es bringt dich nach Lythara, ins Reich der Schreiber. Die Schreibmeister sind verschwunden, und überall liegen unvollständige Texte.",
      "Lythara braucht am dringendsten Hilfe. Finde dort Meisterin Lyra. Viel Glück!",
    ], B);
    return;
  }

  if (mimiSchritt() === "aldric") {
    await mimiHoeren(S, B, "Wilmas Katze wird gesucht? Lass mich überlegen …", "dorf_mimi_aldric", "Aldric erinnert sich", MIMI_ALDRIC,
      "Borin ist an der Schmiede. Vielleicht hat er etwas bemerkt.");
    return;
  }
  const offeneNeben = nebenquestsOffen() ? NEBENQUESTS.filter(([id]) => !istErledigt(id)) : [];
  await dialog(S, offeneNeben.length
    ? ["Das Portal im Süden bringt dich nach Lythara. Der Rat glaubt an dich!",
      `Übrigens: Ein paar Leute im Dorf könnten deine Hilfe brauchen. Achte auf die blauen Zeichen!\n${offeneNeben.map(([, t]) => "• " + t).join("\n")}`]
    : "Das Portal im Süden bringt dich nach Lythara. Der Rat glaubt an dich!", B);
}

async function wilma() {
  const S = "Händlerin Wilma";
  const B = bild("npc_wilma");
  if (ohnePass()) return zuerstZuAldric(S, "npc_wilma");
  if (istErledigt("dorf_wilma")) {
    if (mimiSchritt() === "wilma") {
      return mimiHoeren(S, B, "Oh … hallo. Meine Stimme ist wieder da, aber jetzt habe ich ein neues Problem. Hör mir bitte gut zu!",
        "dorf_mimi_start", "Wilmas Nachricht", MIMI_WILMA, "Danke! Frag zuerst Aldric vor dem Rathaus. Er ist jeden Morgen früh unterwegs.");
    }
    if (mimiSchritt() === "wilma_ende") {
      await dialog(S, [
        "Was? Mimi hat drei Kätzchen bekommen? In dem alten Korb am Zaun? Auf Borins Handtuch?",
        "Deshalb war sie so müde und hat so viel gegessen! Oh, ich bin so glücklich!",
        "Finn hat schon ein Bild von den Kleinen gemalt. Das sollst du bekommen – als Dank fürs Suchen und Zuhören.",
      ], B);
      erledigen("dorf_mimi");
      await belohnung({ xp: 50, grund: "Nebenquest abgeschlossen: Mimi ist weg!", gegenstaende: ["katzenbild"], fanfare: true });
      return;
    }
    if (nebenquestsOffen() && !istErledigt("dorf_markt")) {
      const geschafft = await questStarten({
        sprecher: S, bild: B,
        frageText: "*hust* … Oh, hallo! Ich bin erkältet und habe fast keine Stimme mehr. Aber heute ist Markttag! Kannst du für mich die Kunden bedienen? Hier ist meine Preisliste.",
        ja: "Ja, ich helfe am Stand!",
        spaeter: "*hust* Schade … Vielleicht später?",
        folge: { id: "dorf_markt", titel: "Nebenquest: Ein Tag am Marktstand", untertitel: "Verkaufsgespräche führen", aufgaben: MARKT_AUFGABEN },
      });
      if (!geschafft) return;
      erledigen("dorf_markt");
      await dialog(S, [
        "*flüstert* Du warst wunderbar! Alle Kunden waren zufrieden – und so höflich warst du!",
        "Die Kunden haben dir Trinkgeld gegeben. Das gehört dir. Und Mimi hat dir die ganze Zeit zugeschaut.",
      ], B);
      await belohnung({ xp: 50, grund: "Nebenquest abgeschlossen: Ein Tag am Marktstand", gegenstaende: ["trinkgeld"], fanfare: true });
      return;
    }
    await dialog(S, istErledigt("dorf_markt")
      ? "Meine Stimme ist wieder da! Wenn du mal einen Job suchst – am Marktstand bist du ein Profi."
      : "Frisches Brot, rote Äpfel! Und denk daran: Ein gutes Gespräch beginnt mit einer guten Frage.", B);
    return;
  }
  await dialog(S, "Hallo! Ich bin Wilma. Ich verkaufe hier Brot, Obst und Gemüse.", B);
  const geschafft = await questStarten({
    sprecher: S, bild: B,
    frageText: "Seit Morgraths Fluch verstehe ich meine Kunden nicht mehr. Alle meine Fragen sind durcheinander! Hilfst du mir?",
    ja: "Ja, ich helfe dir!",
    spaeter: "Schade! Komm einfach wieder, wenn du Zeit hast. Ich bin immer hier am Markt.",
    folge: { id: "dorf_wilma", titel: "Quest: Wilmas Fragen", untertitel: "Fragen stellen", aufgaben: FRAGEN_STELLEN },
  });
  if (!geschafft) return;
  erledigen("dorf_wilma");
  await dialog(S, "Wunderbar! Jetzt kann ich wieder mit allen sprechen. Hier, nimm das. Meine Großmutter hat es gefunden – es ist ein altes Artefakt!", B);
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Wilmas Fragen", gegenstaende: ["amulett_wortschaetze"], fanfare: true });
}

async function borin(welt) {
  const S = "Schmied Borin";
  const B = bild("npc_borin");
  if (ohnePass()) return zuerstZuAldric(S, "npc_borin");
  if (istErledigt("dorf_borin")) {
    if (istErledigt("dorf_finn_brief") && !istErledigt("dorf_finn")) return finnSprichtMitBorin();
    if (mimiSchritt() === "borin") {
      await mimiHoeren(S, B, "Eine rote Katze? Warte mal …", "dorf_mimi_borin", "Borin hat etwas gehört", MIMI_BORIN,
        "Finn steht da drüben. Frag ihn!");
      return;
    }
    if (nebenquestsOffen() && !istErledigt("dorf_werkstatt")) return werkstatt(welt);
    await dialog(S, istErledigt("dorf_werkstatt")
      ? "Das Gartentor ist fertig und der Rat ist zufrieden. Du hast Talent fürs Handwerk!"
      : "Finn ist wieder da! Er war bei der Katze von Wilma. Danke noch einmal!", B);
    return;
  }
  await dialog(S, "Hallo! Ich bin Borin, der Schmied. Ich habe ein großes Problem: Mein Lehrling Finn ist verschwunden!", B);
  const geschafft = await questStarten({
    sprecher: S, bild: B,
    frageText: "Ich habe einen Steckbrief geschrieben. Liest du ihn und hilfst mir, Finn zu finden?",
    ja: "Ja, ich helfe dir!",
    spaeter: "Na gut. Aber bitte komm bald wieder – ich mache mir Sorgen um Finn!",
    folge: { id: "dorf_borin", titel: "Quest: Wo ist Finn?", untertitel: "Personen beschreiben", aufgaben: PERSONEN_BESCHREIBEN },
  });
  if (!geschafft) return;
  erledigen("dorf_borin");
  await dialog(S, "Rote Haare, braune Jacke, eine Katze … Das war Finn! Danke! Jetzt weiß ich, wo ich ihn suchen muss.", B);
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Wo ist Finn?", fanfare: true });
}

// ---------- Nebenquests: Finn und die Werkstatt ----------

async function finn() {
  const S = "Finn";
  const B = bild("npc_finn");
  const name = zustand.held?.name ?? "du";
  if (!nebenquestsOffen()) {
    await dialog(S, "Hallo! Ich bin Finn, Borins Lehrling. Danke, dass du Borin geholfen hast. Ich war nur bei Mimi – sie hatte Hunger.", B);
    return;
  }
  if (mimiSchritt() === "finn") {
    await mimiHoeren(S, B, "Du suchst Mimi? Komm näher, ich muss leise sprechen!", "dorf_mimi_finn", "Finns Geheimtipp", MIMI_FINN,
      "Der Korb steht hinter Wilmas Garten, am alten Holzzaun. Leise!");
    return;
  }
  if (istErledigt("dorf_finn")) {
    await dialog(S, `Im Sommer mache ich ein Praktikum bei Tante Rosa in Lumen! Und danach baue ich mit Borin ein Bücherregal aus Eisen. Danke, ${name}!`, B);
    return;
  }
  if (istErledigt("dorf_finn_brief")) {
    await dialog(S, "Ich bin so nervös … Gehst du mit mir zu Borin? Er ist gleich da drüben an der Schmiede.", B);
    return;
  }
  await dialog(S, [
    `Psst, ${name}! Kannst du ein Geheimnis behalten?`,
    "Ich habe einen Brief an meine Tante Rosa geschrieben. Aber ich traue mich nicht, ihn abzuschicken.",
  ], B);
  const geschafft = await questStarten({
    sprecher: S, bild: B,
    frageText: "Liest du ihn? Sag mir bitte ehrlich, was du denkst!",
    ja: "Ja, ich lese deinen Brief.",
    spaeter: "Okay … Aber bitte erzähl es noch niemandem!",
    folge: { id: "dorf_finn", titel: "Nebenquest: Finns Geheimnis", untertitel: "Einen persönlichen Brief verstehen", aufgaben: FINN_AUFGABEN },
  });
  if (!geschafft) return;
  erledigen("dorf_finn_brief");
  await dialog(S, [
    "Du meinst, ich soll ehrlich mit Borin sprechen? … Ja. Du hast recht.",
    "Kommst du mit? Allein schaffe ich das nicht. Borin ist an der Schmiede.",
  ], B);
}

async function finnSprichtMitBorin() {
  const name = zustand.held?.name ?? "du";
  await dialog("Finn", [
    "Borin … ich muss dir etwas sagen. Die Arbeit in der Schmiede ist gut, und du bist ein toller Meister.",
    "Aber ich liebe Bücher. Ich möchte im Sommer ein Praktikum bei Tante Rosa in der Buchhandlung machen.",
  ], bild("npc_finn"));
  await dialog("Schmied Borin", [
    "Finn, Junge … Glaubst du, das habe ich nicht gemerkt? Du liest sogar beim Mittagessen!",
    "Mach das Praktikum. Ich bin stolz auf dich, wenn du deinen eigenen Weg findest.",
    "Und weißt du was? Wenn du zurück bist, bauen wir zusammen ein Bücherregal aus Eisen. Ein Schmied, der Bücher liebt – das gab es noch nie!",
  ], bild("npc_borin"));
  erledigen("dorf_finn");
  await dialog("Finn", `Danke, Borin! Und danke dir, ${name}. Hier, das ist mein Lieblingslesezeichen. Es soll dir Glück bringen.`, bild("npc_finn"));
  await belohnung({ xp: 50, grund: "Nebenquest abgeschlossen: Finns Geheimnis", gegenstaende: ["lesezeichen_finn"], fanfare: true });
}

async function werkstatt(welt) {
  const S = "Schmied Borin";
  const B = bild("npc_borin");
  const geschafft = await questStarten({
    sprecher: S, bild: B,
    frageText: "Gut, dass du da bist! Der Rat hat ein Gartentor bei mir bestellt. Ich brauche einen Helfer, der die Bestellung und meine Anleitung genau liest. Hilfst du mir in der Werkstatt?",
    ja: "Ja, ich helfe in der Werkstatt!",
    spaeter: "In Ordnung. Das Eisen wartet auf dich!",
    folge: { id: "dorf_werkstatt", titel: "Nebenquest: Borins Werkstatt", untertitel: "Bestellung und Arbeitsanleitung verstehen", aufgaben: WERKSTATT_AUFGABEN },
  });
  if (!geschafft) return;
  erledigen("dorf_werkstatt");
  await dialog(S, [
    "Klong! Klong! … Fertig! Schwarz, mit Schloss, genau 1,20 Meter breit – so wie der Rat es wollte.",
    "Wir haben das Tor schon am Kräutergarten eingebaut. Schau es dir an! Du hast Talent fürs Handwerk.",
  ], B);
  welt?.aktualisieren?.();
  await belohnung({ xp: 50, grund: "Nebenquest abgeschlossen: Borins Werkstatt", gegenstaende: ["schmiedehammer"], fanfare: true });
}

async function katzenkorb(welt) {
  if (mimiSchritt() === "korb") {
    await dialog("Alter Korb", [
      "Du gehst ganz leise zum Korb und schaust hinein …",
      "Da ist Mimi! Sie liegt auf Borins altem Handtuch und einem Stück Stoff. Und neben ihr schlafen drei winzige Kätzchen!",
      "Mimi schnurrt leise. Jetzt weißt du, warum sie so müde war. Erzähl es schnell Wilma!",
    ]);
    erledigen("dorf_mimi_gefunden");
    welt?.aktualisieren?.();
    return;
  }
  await dialog("Alter Korb", istErledigt("dorf_mimi_gefunden")
    ? "Mimi und ihre drei Kätzchen schlafen im Heu. Pssst!"
    : "Ein alter Korb voller Heu am Holzzaun.");
}

async function gartentor() {
  await dialog("Gartentor", "Ein schwarzes Tor aus Eisen mit einem kleinen Schloss. Du hast geholfen, es zu bauen!");
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
  const geschafft = await questStarten({
    sprecher: "Schwarzes Brett",
    frageText: "Am Brett hängt ein neuer Aushang des Rates. Möchtest du ihn jetzt lesen und die Fragen beantworten?",
    ja: "Ja, jetzt lesen",
    spaeter: "Der Aushang hängt hier noch. Du kannst ihn später lesen.",
    folge: { id: "dorf_brett", titel: "Quest: Der Aushang", untertitel: "Einfache Texte verstehen", aufgaben: AUSHANG },
  });
  if (!geschafft) return;
  erledigen("dorf_brett");
  await belohnung({ xp: 50, grund: "Quest abgeschlossen: Der Aushang", fanfare: true });
}

async function brunnen() {
  await dialog("Brunnen", "Das Wasser ist klar und kalt. Im Wasser siehst du dein Spiegelbild. Du siehst mutig aus!");
}

async function portal(welt) {
  if (!istErledigt("dorf_abschluss")) {
    await dialog("Altes Portal", "Die Steine sind kalt und dunkel. Der Rat muss das Portal erst öffnen.");
    return;
  }
  // Mehrere Ziele (nur in der 3D-Version): die Inseln der Stimmen nach dem ersten Besuch, DAS NICHTS (Figurengalerie)
  const ziele = [["In die Halle der Tausend Tore", "halle"]];
  if (welt.dreiD && istErledigt("lythara_turm_intro")) ziele.push(["Zu den Inseln der Stimmen", "turm"]);
  if (welt.dreiD && istErledigt("lythara_finale")) ziele.push(["Nach Aurelia, ins Reich des Hörens", "aurelia"]);
  if (welt.dreiD && istErledigt("aurelia_finale")) ziele.push(["Nach Scriptoria, ins Reich des Lesens", "scriptoria"]);
  if (welt.dreiD && istErledigt("scriptoria_finale")) ziele.push(["Nach Vocantia, ins Reich des Sprechens", "vocantia"]);
  if (welt.dreiD && NICHTS_OFFEN) ziele.push(["In DAS NICHTS (alle Figuren ansehen)", "nichts"]);
  if (ziele.length > 1) {
    const wahl = await frage("Portal", "Das Portal leuchtet blau. Wohin möchtest du reisen?", [...ziele.map(([t]) => t), "Noch nicht."]);
    if (wahl >= 0 && wahl < ziele.length) welt.reisen(ziele[wahl][1], "eingang");
    return;
  }
  const antwort = await frage("Portal nach Lythara", "Das Portal leuchtet blau. Möchtest du nach Lythara reisen, ins Reich der Schreiber?", ["Ja, ich reise nach Lythara!", "Noch nicht."]);
  if (antwort === 0) welt.reisen("halle", "eingang");
}

export default {
  id: "dorf",
  name: "Das Dorf der Ankömmlinge",
  musik: "dorf",
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
      marker: (z) => !z.erledigt.dorf_heldenpass || (!z.erledigt.dorf_abschluss && DORF_QUESTS.every(([id]) => z.erledigt[id])) ? true
        : mimiSchritt(z) === "aldric" ? "neben" : false },
    { id: "wilma", art: "npc", name: "Händlerin Wilma", bild: "npc_wilma", x: 6, y: 9, aktion: wilma,
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_wilma ? true
        : z.erledigt.dorf_wilma && nebenquestsOffen(z) && (!z.erledigt.dorf_markt || ["wilma", "wilma_ende"].includes(mimiSchritt(z))) ? "neben" : false },
    { id: "stand", art: "objekt", bild: "marktstand", x: 7, y: 9, breite: 2 },
    { id: "borin", art: "npc", name: "Schmied Borin", bild: "npc_borin", x: 24, y: 5, aktion: borin,
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_borin ? true
        : z.erledigt.dorf_borin && nebenquestsOffen(z) && ((z.erledigt.dorf_finn_brief && !z.erledigt.dorf_finn) || !z.erledigt.dorf_werkstatt || mimiSchritt(z) === "borin") ? "neben" : false },
    { id: "amboss", art: "objekt", bild: "amboss", x: 26, y: 5 },
    { id: "finn", art: "npc", name: "Finn", bild: "npc_finn", x: 21, y: 6, aktion: finn,
      sichtbar: (z) => Boolean(z.erledigt.dorf_borin),
      marker: (z) => nebenquestsOffen(z) && (!z.erledigt.dorf_finn_brief || mimiSchritt(z) === "finn") ? "neben" : false },
    { id: "katzenkorb", art: "objekt", name: "Alter Korb", bild: "katzenkorb", x: 4, y: 15, aktion: katzenkorb, hinweis: "In den Korb schauen",
      leuchtet: (z) => Boolean(z.erledigt.dorf_mimi_gefunden),
      marker: (z) => (mimiSchritt(z) === "korb" ? "neben" : false) },
    { id: "gartentor", art: "objekt", name: "Gartentor", bild: "gartentor", x: 9, y: 14, breite: 2, aktion: gartentor, hinweis: "Das Gartentor ansehen",
      sichtbar: (z) => Boolean(z.erledigt.dorf_werkstatt) && Boolean(globalThis.eldoriaDreiD) },
    { id: "brett", art: "objekt", name: "Schwarzes Brett", bild: "brett", x: 12, y: 9, aktion: brett, hinweis: "Aushang lesen",
      marker: (z) => z.erledigt.dorf_heldenpass && !z.erledigt.dorf_brett },
    { id: "brunnen", art: "objekt", name: "Brunnen", bild: "brunnen", x: 17, y: 10, aktion: brunnen, hinweis: "In den Brunnen schauen" },
    { id: "portal", art: "portal", name: "Portal nach Lythara", x: 14, y: 17, breite: 2, aktion: portal, hinweis: "Portal benutzen",
      aktiv: (z) => Boolean(z.erledigt.dorf_abschluss) },
  ],
};
