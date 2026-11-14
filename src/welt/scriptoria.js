// Scriptoria – das Reich der Tausend Bücher (Reich des Lesens, nur 3D)
// Ein verwunschener Wald voller Bücherregale. Der Schwarze Nebel hat die große Bibliothek verschlungen
// und versperrt die Pfade. Jede gelöste Lese-Quest drängt ihn ein Stück zurück.
// Quest 1: Die verlorenen Wörter (Lesen Teil 1) bei Bote Fennick am Briefbaum.
// Quest 2: Der Lesekreis (Lesen Teil 2) bei Mara.
// Quest 3: Der Nachtpfad (Lesen Teil 3) bei Laternenwärterin Vesna: zwei Aushänge, dann die Laternenprobe.
// Quests 4–5 und der Bibliothekar der Schatten folgen; ihre Orte sind schon da.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { BRIEFE, LESEKREIS } from "../inhalte/scriptoria_q1_q2.js";
import { AUSHAENGE, LATERNENPROBE } from "../inhalte/scriptoria_q3.js";
import { RASTER, PFADE } from "./scriptoria_layout.js";

const LIRIEN = "Lirien, Hüterin der Bücher";
const FENNICK = "Bote Fennick";
const MARA = "Mara vom Lesekreis";
const VESNA = "Laternenwärterin Vesna";
const aushaengeGelesen = (z = zustand) => AUSHAENGE.every((a) => z.erledigt[a.id]);

/** Welche Quest den Nebel auf einem Pfad vertreibt (Index wie in PFADE[].nebel) */
const NEBEL_WEICHT = ["scriptoria_q1", "scriptoria_q2", "scriptoria_q3", "scriptoria_q4", "scriptoria_q5"];

async function lirien() {
  const B = bild("npc_lirien");
  const name = zustand.held?.name ?? "Wanderer";
  if (!istErledigt("scriptoria_intro")) {
    await dialog(LIRIEN, [
      `Psst … leise, ${name}. Willkommen in Scriptoria, dem Reich der Tausend Bücher. Ich bin Lirien, die Hüterin der Bücher.`,
      "Früher stand hier die größte Bibliothek von Eldoria. Die Bäume waren unsere Regale, und das Licht der Pilze war unsere Lampe. Jeder konnte hier lesen und lernen.",
      "Dann kam der Schwarze Nebel. Er frisst Wörter und versteckt das Wissen. Die große Bibliothek liegt jetzt tief unter der Erde – und ein Schatten bewacht ihren Eingang.",
      "Der Nebel hat Angst vor Menschen, die genau lesen. Jedes Mal, wenn du einen Text wirklich verstehst, weicht er ein Stück zurück.",
      "Beginne im Westen beim Briefbaum. Bote Fennick hat ein Problem mit seinen Briefen.",
      "Ein Tipp für das ganze Reich: Lies zuerst die Aufgabe, dann den Text. Und achte auf Wörter wie „nur“, „alle“, „nicht“ und „noch“!",
    ], B);
    erledigen("scriptoria_intro");
    return;
  }
  if (istErledigt("scriptoria_q3")) {
    await dialog(LIRIEN, [
      "Drei Seiten leuchten! Der Nachtpfad ist wieder sicher, und der Nebel vor dem Lehrlingshaus im Nordosten weicht.",
      "Beim Lehrlingshaus und an den Wegweisern im Norden warten noch Aufgaben. (Diese Quests kommen bald.)",
    ], B);
    return;
  }
  if (istErledigt("scriptoria_q2")) {
    await dialog(LIRIEN, [
      "Spürst du es? Der Nebel im Osten ist verschwunden. Zwei Seiten des Großen Buches leuchten wieder.",
      "Geh nach Osten zum Nachtpfad. Laternenwärterin Vesna passt dort auf die Besucher auf – aber seit der Nebel die Aushänge verwischt hat, liest niemand mehr die Regeln.",
    ], B);
    return;
  }
  if (istErledigt("scriptoria_q1")) {
    await dialog(LIRIEN, "Der Nebel im Nordwesten weicht! Dort sitzt Mara mit ihrem Lesekreis. Sie braucht jemanden, der genau liest.", B);
    return;
  }
  await dialog(LIRIEN, "Geh nach Westen zum Briefbaum. Bote Fennick wartet dort auf dich.", B);
}

// ---------- Quest 1: Die verlorenen Wörter ----------

async function fennick() {
  const B = bild("npc_fennick");
  if (!istErledigt("scriptoria_intro")) {
    await dialog(FENNICK, "Briefe, Briefe, überall Briefe … Sprich zuerst mit Lirien am Großen Lesebaum.", B);
    return;
  }
  if (!istErledigt("scriptoria_q1_start")) {
    await dialog(FENNICK, [
      "Oh, endlich jemand! Ich bin Fennick, der Bote von Scriptoria. Ich bringe die Briefe zwischen den Bäumen hin und her.",
      "Aber heute Nacht ist der Schwarze Nebel über meinen Briefbaum gezogen. Er hat Wörter aus den Briefen gestohlen! Jetzt sind überall Lücken.",
      "Die Wörter liegen noch unter dem Baum – aber auch ein paar falsche, die nicht hineinpassen. Hilfst du mir, die Briefe zu reparieren?",
      "Lies jeden Brief zuerst ganz. Achte dann auf die Wörter vor und nach der Lücke. Und am Ende brauche ich für jeden Brief eine passende Betreffzeile.",
    ], B);
    erledigen("scriptoria_q1_start");
    return;
  }
  if (istErledigt("scriptoria_q1")) {
    await dialog(FENNICK, "Alle Briefe sind wieder ganz und unterwegs! Und schau: Der Nebel im Nordwesten zieht sich zurück.", B);
    return;
  }
  await dialog(FENNICK, "Die Briefe hängen am Briefbaum, gleich hier neben mir.", B);
}

async function briefbaum(welt) {
  if (!istErledigt("scriptoria_q1_start")) {
    await dialog("Briefbaum", "An den Ästen hängen Briefe in kleinen Umschlägen. Manche flattern im Wind. Sprich zuerst mit Bote Fennick.");
    return;
  }
  if (istErledigt("scriptoria_q1")) {
    const nochmal = await frage("Briefbaum", "Die Briefe sind repariert. Möchtest du noch einmal üben?", ["Ja, noch einmal", "Nein"]);
    if (nochmal === 0) await aufgabenFolge({ id: "scriptoria_q1", titel: "Die verlorenen Wörter", untertitel: "Briefe ergänzen · Lesen Teil 1", aufgaben: BRIEFE });
    return;
  }
  const geschafft = await questStarten({
    sprecher: "Briefbaum",
    frageText: "Drei Briefe hängen am Baum. In jedem fehlen vier Wörter. Unter dem Baum liegen die Wörter – und ein paar falsche. Möchtest du die Briefe reparieren?",
    ja: "Ja, Briefe reparieren",
    spaeter: "Die Briefe flattern weiter im Wind.",
    folge: { id: "scriptoria_q1", titel: "Die verlorenen Wörter", untertitel: "Briefe ergänzen und Betreff wählen · wie DSD Lesen Teil 1", aufgaben: BRIEFE },
  });
  if (!geschafft) return;
  erledigen("scriptoria_q1");
  welt.aktualisieren();
  await dialog(FENNICK, [
    "Wunderbar! Jedes Wort sitzt an seinem Platz.",
    "Sieh nur – eine Seite leuchtet zwischen den Briefen auf! Und der Nebel im Nordwesten weicht zurück.",
  ], bild("npc_fennick"));
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Die verlorenen Wörter", gegenstaende: ["seite_briefe"], fanfare: true });
}

// ---------- Quest 2: Der Lesekreis ----------

async function mara(welt) {
  const B = bild("npc_mara");
  if (!istErledigt("scriptoria_q2_start")) {
    await dialog(MARA, [
      "Willkommen im Lesekreis! Ich bin Mara. Hier lesen wir jeden Donnerstag zusammen – na ja, wir haben es getan, bevor der Nebel kam.",
      "Letzte Woche hatten wir den Tag „Berufe rund ums Buch“. Die Besucher haben ins Gästebuch geschrieben, was sie erlebt haben.",
      "Aber der Nebel hat die Seiten durcheinandergewirbelt! Ich weiß nicht mehr, welcher Bericht zu welchem Erlebnis gehört.",
      "Ein Tipp: Die Situationen sind mit anderen Worten beschrieben als die Berichte. Und Vorsicht – manche Berichte passen fast, aber nicht ganz!",
    ], B);
    erledigen("scriptoria_q2_start");
  }
  if (istErledigt("scriptoria_q2")) {
    const nochmal = await frage(MARA, "Das Gästebuch ist wieder in Ordnung. Möchtest du noch einmal üben?", ["Ja, noch einmal", "Nein"], B);
    if (nochmal === 0) await aufgabenFolge({ id: "scriptoria_q2", titel: "Der Lesekreis", untertitel: "Berichte zuordnen · Lesen Teil 2", aufgaben: LESEKREIS });
    return;
  }
  const geschafft = await questStarten({
    sprecher: MARA, bild: B,
    frageText: "Hier ist das Gästebuch. Ordnest du die Berichte den Situationen zu?",
    ja: "Ja, ich lese genau",
    spaeter: "Kein Problem, das Gästebuch läuft nicht weg.",
    folge: { id: "scriptoria_q2", titel: "Der Lesekreis", untertitel: "Berichte zuordnen · wie DSD Lesen Teil 2", aufgaben: LESEKREIS },
  });
  if (!geschafft) return;
  erledigen("scriptoria_q2");
  welt.aktualisieren();
  await dialog(MARA, [
    "Genau so war es! Du liest wie eine echte Bibliothekarin – oder ein echter Bibliothekar.",
    "Hörst du das Rascheln? Eine leuchtende Seite fliegt aus dem Gästebuch. Und im Osten wird der Nebel dünner.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Der Lesekreis", gegenstaende: ["seite_berichte"], fanfare: true });
}

// ---------- Quest 3: Der Nachtpfad ----------

async function vesna(welt) {
  const B = bild("npc_vesna");
  if (!istErledigt("scriptoria_q2")) {
    await dialog(VESNA, "Psst. Hier beginnt der Nachtpfad. Ohne Laterne geht hier niemand weiter.", B);
    return;
  }
  if (!istErledigt("scriptoria_q3_start")) {
    await dialog(VESNA, [
      "Ah, ein Licht im Nebel! Ich bin Vesna, die Laternenwärterin. Ich passe auf, dass niemand auf dem Nachtpfad verloren geht.",
      "Gestern haben sich wieder drei Besucher verlaufen, und ein Lehrling hat im Archiv Tee über ein altes Buch geschüttet. Warum? Niemand liest die Aushänge genau!",
      "Hier am Pfad hängen die Regeln für Besucher, und dort hinten die Tafel mit den Hinweisen für die Lehrlinge im Archiv. Lies beide und sag mir, was stimmt und was nicht.",
      "Aber Vorsicht: Die Sätze stehen nie genau so im Text. Achte auf kleine Wörter wie „unter“, „nur“, „auch“ und „nicht“ – sie ändern alles!",
    ], B);
    erledigen("scriptoria_q3_start");
    return;
  }
  if (istErledigt("scriptoria_q3")) {
    await dialog(VESNA, "Der Pfad ist sicher, und meine Laternen leuchten. Danke – du liest so genau wie eine Eule sieht!", B);
    return;
  }
  if (!aushaengeGelesen()) {
    const offen = AUSHAENGE.filter((a) => !istErledigt(a.id)).map((a) => a.name);
    await dialog(VESNA, `Lies zuerst noch: ${offen.join(" und ")}.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: VESNA, bild: B,
    frageText: "Du hast beide Aushänge gelesen. Jetzt die Laternenprobe: Ich prüfe, ob du die kleinen Wörter wirklich verstanden hast. Bereit?",
    ja: "Ja, Laternenprobe!",
    spaeter: "Gut. Die Laterne wartet auf dich.",
    folge: { id: "scriptoria_q3_probe", titel: "Der Nachtpfad", untertitel: "Die Laternenprobe · Signalwörter genau lesen", aufgaben: LATERNENPROBE },
  });
  if (!geschafft) return;
  erledigen("scriptoria_q3_probe");
  erledigen("scriptoria_q3");
  welt.aktualisieren();
  await dialog(VESNA, [
    "Bestanden! Hier, nimm diese Laterne – sie leuchtet nur für Menschen, die genau lesen.",
    "Schau: Zwischen den Regeln leuchtet eine Seite auf. Und der Nebel vor dem Lehrlingshaus im Nordosten zieht sich zurück!",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Der Nachtpfad", gegenstaende: ["seite_regeln"], fanfare: true });
}

function aushangAktion(a) {
  return async () => {
    if (!istErledigt("scriptoria_q3_start")) {
      await dialog(a.name, "Die Schrift ist vom Nebel verwischt. Vielleicht kann dir die Laternenwärterin helfen.");
      return;
    }
    if (istErledigt(a.id)) {
      const nochmal = await frage(a.name, "Diesen Aushang hast du schon genau gelesen. Möchtest du noch einmal üben?", ["Ja, noch einmal", "Nein"]);
      if (nochmal === 0) await aufgabenFolge({ id: a.id, titel: a.name, untertitel: "Regeln lesen · Richtig oder falsch?", aufgaben: a.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: a.name,
      frageText: "Vesnas Laterne macht die verwischte Schrift wieder lesbar. Möchtest du den Aushang jetzt genau lesen?",
      ja: "Ja, genau lesen",
      spaeter: "Der Aushang wartet.",
      folge: { id: a.id, titel: a.name, untertitel: "Regeln lesen · Richtig oder falsch? · wie DSD Lesen Teil 3", aufgaben: a.aufgaben },
    });
    if (!geschafft) return;
    erledigen(a.id);
    await belohnung({ xp: 25, grund: `${a.name}: genau gelesen!`, fanfare: true });
  };
}

// ---------- Nebel, Platzhalter, Portal ----------

function nebelAktion(i) {
  return async () => {
    const vorher = ["Hilf zuerst Bote Fennick am Briefbaum.", "Hilf zuerst Mara im Lesekreis.", "Lies zuerst den Aushang am Nachtpfad.", "Hilf zuerst im Lehrlingshaus.", "Entschlüssle zuerst die Wegweiser."][i];
    await dialog("Schwarzer Nebel", `Dichter, schwarzer Nebel versperrt den Weg. Er flüstert unverständliche Wörter. ${vorher}`);
  };
}

const spaeter = (name, text) => async () => dialog(name, text);

async function heimweg(welt) {
  const antwort = await frage("Portal", "Das Portal schimmert grün zwischen den Wurzeln. Möchtest du ins Dorf der Ankömmlinge zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

export default {
  id: "scriptoria",
  name: "Scriptoria – Das Reich der Tausend Bücher",
  musik: "scriptoria",
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster: RASTER,
  spawns: {
    start: [22, 39],
    eingang: [22, 39],
    mitte: [22, 25],
    west: [7, 27],
    nordwest: [7, 9],
    ost: [36, 26],
  },
  objekte: [
    { id: "portal_scriptoria", art: "portal", name: "Portal ins Dorf", x: 21, y: 42, breite: 2, aktion: heimweg, hinweis: "Portal benutzen", aktiv: () => true },
    { id: "lirien", art: "npc", name: LIRIEN, bild: "npc_lirien", x: 22, y: 24, aktion: lirien,
      marker: (z) => !z.erledigt.scriptoria_intro },
    { id: "fennick", art: "npc", name: FENNICK, bild: "npc_fennick", x: 8, y: 26, aktion: fennick,
      marker: (z) => Boolean(z.erledigt.scriptoria_intro) && !z.erledigt.scriptoria_q1_start },
    { id: "briefbaum", art: "objekt", name: "Briefbaum", bild: "briefbaum", x: 6, y: 27, aktion: briefbaum, hinweis: "Die Briefe ansehen",
      leuchtet: (z) => Boolean(z.erledigt.scriptoria_q1),
      marker: (z) => Boolean(z.erledigt.scriptoria_q1_start) && !z.erledigt.scriptoria_q1 },
    { id: "mara", art: "npc", name: MARA, bild: "npc_mara", x: 9, y: 13, aktion: mara,
      marker: (z) => Boolean(z.erledigt.scriptoria_q1) && !z.erledigt.scriptoria_q2 },
    { id: "lesekreis", art: "objekt", name: "Gästebuch des Lesekreises", bild: "lesepult", x: 6, y: 13, aktion: mara, hinweis: "Das Gästebuch lesen" },
    { id: "vesna", art: "npc", name: VESNA, bild: "npc_vesna", x: 35, y: 25, aktion: vesna,
      marker: (z) => Boolean(z.erledigt.scriptoria_q2) && (!z.erledigt.scriptoria_q3_start || (aushaengeGelesen(z) && !z.erledigt.scriptoria_q3)) },
    ...AUSHAENGE.map((a, i) => ({
      id: a.id, art: "objekt", name: a.name, bild: "aushang", x: i ? 38 : 37, y: i ? 30 : 27,
      aktion: aushangAktion(a), hinweis: `${a.name} lesen`,
      marker: (z) => Boolean(z.erledigt.scriptoria_q3_start) && !z.erledigt[a.id],
    })),
    { id: "lehrlingshaus", art: "objekt", name: "Lehrlingshaus", bild: "aushang", x: 37, y: 8,
      aktion: spaeter("Lehrlingshaus", "Hier wohnen die Lehrlinge der Bibliothek. (Quest 4 kommt bald.)"), hinweis: "Das Lehrlingshaus ansehen" },
    { id: "wegweiser", art: "objekt", name: "Wegweiser", bild: "aushang", x: 22, y: 9,
      aktion: spaeter("Wegweiser", "Viele Schilder zeigen in alle Richtungen – aber die Schrift ist verschwunden. (Quest 5 kommt bald.)"), hinweis: "Die Wegweiser lesen" },
    { id: "tiefe_tor", art: "objekt", name: "Tor zur unterirdischen Bibliothek", bild: "steintor", x: 21, y: 1, breite: 3,
      aktion: spaeter("Tor", "Ein steinernes Tor im Hügel, überwachsen von Wurzeln. Dahinter knurrt etwas in der Dunkelheit … (Der Bibliothekar der Schatten kommt bald.)"), hinweis: "Das Tor untersuchen" },
    ...PFADE.filter((p) => p.tor).map((p) => ({
      id: `nebel_${p.nebel}`, art: "nebel", name: "Schwarzer Nebel", bild: "nebel",
      x: p.tor[0], y: p.tor[1], breite: p.tor[2], hoehe: p.tor[3],
      aktion: nebelAktion(p.nebel), hinweis: "Den Nebel untersuchen",
      offen: (z) => Boolean(z.erledigt[NEBEL_WEICHT[p.nebel]]),
    })),
  ],
};
