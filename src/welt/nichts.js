// DAS NICHTS – eine endlose weiße Leere mit allen Figuren des Spiels auf Sockeln.
// Zum Ansehen der 3D-Modelle und Pixel-Porträts (für Lehrkräfte und Entwicklung).
// Erreichbar über das Portal im Dorf. Neue Figuren einfach in GALERIE eintragen.
// Zum Sperren: NICHTS_OFFEN auf false setzen.

import { dialog, frage } from "../ui/fenster.js";
import { bild } from "../ui/bilder.js";
import { posen } from "./nichts_posen.js";

export const NICHTS_OFFEN = true;

/**
 * Alle Figuren. typ: "figur" (Menschen), "boss" (Wächter), "drache", "tier".
 * reihe: 0 = vorne (Helden), 1 = Dorf und Lythara, 4 = Aurelia, 2 = Wächter, 3 = hinten (Drache).
 */
export const GALERIE = [
  { key: "held_neu", typ: "figur", reihe: 0, name: "Ankömmling", text: "So sieht die Heldin oder der Held aus, bevor der Heldenpass ausgefüllt ist." },
  { key: "held_kriegerin", typ: "figur", reihe: 0, name: "Kriegerin / Krieger", text: "Heldenklasse „mutig und stark“, mit Schwert." },
  { key: "held_magier", typ: "figur", reihe: 0, name: "Magierin / Magier", text: "Heldenklasse „klug und neugierig“, mit Stab und Spitzhut." },
  { key: "held_waldlaeufer", typ: "figur", reihe: 0, name: "Waldläuferin / Waldläufer", text: "Heldenklasse „aufmerksam und schnell“, mit Köcher." },
  { key: "held_barde", typ: "figur", reihe: 0, name: "Bardin / Barde", text: "Heldenklasse „kreativ und gesprächig“, mit Laute." },
  { key: "npc_aldric", typ: "figur", reihe: 1, name: "Ratsältester Aldric", text: "Der Älteste im Rat der Weisen. Gibt im Dorf die Hauptquest." },
  { key: "npc_wilma", typ: "figur", reihe: 1, name: "Händlerin Wilma", text: "Verkauft am Markt Brot, Obst und Gemüse. Quests: Wilmas Fragen, Ein Tag am Marktstand." },
  { key: "npc_borin", typ: "figur", reihe: 1, name: "Schmied Borin", text: "Der Schmied des Dorfes. Quests: Wo ist Finn?, Borins Werkstatt." },
  { key: "npc_finn", typ: "figur", reihe: 1, name: "Finn", text: "Borins Lehrling, liebt Bücher. Nebenquest: Finns Geheimnis." },
  { key: "katze", typ: "tier", reihe: 1, name: "Mimi", text: "Wilmas Katze. Streift durchs Dorf und lässt sich streicheln." },
  { key: "npc_orpheon", typ: "figur", reihe: 4, name: "Orpheon, der Glockenhüter", text: "Der Mentor in Aurelia. Empfängt die Heldin oder den Helden am Stadttor." },
  { key: "npc_nerea", typ: "figur", reihe: 4, name: "Hafenmeisterin Nerea", text: "Leitet den Hafen von Aurelia. Quest 1: Die Stimmen des Hafens (Durchsagen)." },
  { key: "npc_ione", typ: "figur", reihe: 4, name: "Marktaufseherin Ione", text: "Leitet den Markt auf der Agora von Aurelia. Quest 2: Gespräche am Markt (Ohrenprobe)." },
  { key: "npc_daphne", typ: "figur", reihe: 4, name: "Händlerin Daphne", text: "Verkauft Obst und Gemüse auf der Agora von Aurelia. Quest 2: Am Obststand." },
  { key: "npc_ilias", typ: "figur", reihe: 4, name: "Fischer Ilias", text: "Fischer und Fischhändler in Aurelia. Quest 2: Am Fischstand." },
  { key: "npc_kleon", typ: "figur", reihe: 4, name: "Töpfer Kleon", text: "Töpfer auf der Agora von Aurelia. Quest 2: Am Töpferstand (Reklamation)." },
  { key: "npc_talos", typ: "figur", reihe: 4, name: "Leuchtturmwärter Talos", text: "Hütet seit vierzig Jahren den Leuchtturm von Aurelia. Quest 3: Das Licht des Leuchtturms (Telefonnachrichten)." },
  { key: "npc_kassia", typ: "figur", reihe: 4, name: "Werftmeisterin Kassia", text: "Leitet die Werft von Aurelia und baut das Festschiff. Quest 4: Die Werft (Abnahme im Prüfungsmodus)." },
  { key: "npc_timon", typ: "figur", reihe: 4, name: "Azubi Timon", text: "Erstes Lehrjahr als Bootsbauer. Quest 4: Interview im Radio (richtig/falsch)." },
  { key: "npc_daria", typ: "figur", reihe: 4, name: "Bootsbauerin Daria", text: "Drittes Lehrjahr auf der Werft. Quest 4: Bericht über ihre Ausbildung (A/B/C)." },
  { key: "npc_lyra", typ: "figur", reihe: 1, name: "Meisterin Lyra", text: "Die letzte Schülerin der Schreibmeister. Führt durch Lythara." },
  { key: "boss_torwaechter", typ: "boss", reihe: 2, name: "Der Torwächter der Quellen", text: "Boss von Quest 1 (Einleitung) in der Halle der Tausend Tore." },
  { key: "boss_kopist", typ: "boss", reihe: 2, name: "Der Kopist", text: "Wächter der Insel der Echos (Wiedergabe)." },
  { key: "boss_vergessen", typ: "boss", reihe: 2, name: "Der Wächter des Vergessens", text: "Wächter der Insel der Erinnerungen (Erfahrungsbericht)." },
  { key: "boss_zauderer", typ: "boss", reihe: 2, name: "Der Zauderer", text: "Wächter der Insel der Waage (Meinung)." },
  { key: "boss_echo", typ: "boss", reihe: 2, name: "Das Endlose Echo", text: "Wächter der Insel des Siegels (Schluss)." },
  {
    key: "boss_drachenrichter", typ: "drache", reihe: 3, name: "Der Drachenrichter",
    text: [
      "Nach den Konzeptzeichnungen in Grafik/Drachenrichter1.jpg und 2.jpg.",
      "Kopf aus Grundkörpern, Unterkiefer wie eine Baggerschaufel, dreieckige Augen, große S-förmige Ohren auf einem runden „Pflaster“, Rauch aus der Nase, Fledermausflügel, Schweif mit spitzem Kegel.",
      "Noch keinem Ort zugeordnet: vielleicht der Drachen-Boss am Ende von Aurelia.",
    ],
    posen: [["stehend", "Stehend, Flügel ausgebreitet"], ["gefaltet", "Flügel angelegt"], ["kniend", "Kniend (besiegt)"]],
  },
];

// ---------- Anordnung (Raster 44 × 42) ----------

const BREITE = 44, HOEHE = 42;
const REIHEN_Y = [30, 23, 15, 4, 19];
const GROESSE = { figur: 1, tier: 1, boss: 2, drache: 5 };
const ABSTAND = { 0: 5, 1: 4.5, 2: 6, 3: 0, 4: 3.8 };

function platzieren() {
  const objekte = [];
  for (let r = 0; r < REIHEN_Y.length; r++) {
    const liste = GALERIE.filter((g) => g.reihe === r);
    liste.forEach((g, i) => {
      const gr = GROESSE[g.typ];
      const mitte = BREITE / 2 + (i - (liste.length - 1) / 2) * ABSTAND[r];
      objekte.push({ g, x: Math.round(mitte - gr / 2), y: REIHEN_Y[r], gr });
    });
  }
  return objekte;
}

async function ansehen(g) {
  const B = g.typ === "tier" ? "" : bild(g.key);
  const texte = Array.isArray(g.text) ? g.text : [g.text];
  await dialog(g.name, texte, B);
  if (!g.posen) return;
  for (;;) {
    const wahl = await frage(g.name, "Welche Pose möchtest du sehen?", [...g.posen.map(([, t]) => t), "Fertig"], B);
    if (wahl < 0 || wahl >= g.posen.length) return;
    posen.get(g.key)?.(g.posen[wahl][0]);
  }
}

async function zurueck(welt) {
  const antwort = await frage("Portal", "Möchtest du DAS NICHTS verlassen und ins Dorf zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

const raster = Array.from({ length: HOEHE }, (_, y) =>
  Array.from({ length: BREITE }, (_, x) => (x === 0 || y === 0 || x === BREITE - 1 || y === HOEHE - 1 ? "#" : "_")).join(""));

export default {
  id: "nichts",
  name: "DAS NICHTS",
  musik: null,
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster,
  spawns: {
    start: [22, 36],
    eingang: [22, 36],
  },
  objekte: [
    ...platzieren().map(({ g, x, y, gr }) => ({
      id: `galerie_${g.key}`, art: "galerie", name: g.name, bild: g.key, galerie: g,
      x, y, breite: gr, hoehe: gr, aktion: () => ansehen(g), hinweis: `${g.name} ansehen`,
    })),
    { id: "portal_nichts", art: "portal", name: "Portal ins Dorf", x: 21, y: 39, breite: 2, aktion: zurueck, hinweis: "Portal ins Dorf benutzen", aktiv: () => true },
  ],
};
