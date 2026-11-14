// Lythara – Der Turm der Tausend Treppen (Quest 1: Die Schriftrolle des Beobachters, nur 3D)
// Sechs Etagen einer alten Burg übereinander. Mit jedem Tor steigt man eine gerade Treppe höher,
// und jede Etage ist schöner, heller und eleganter eingerichtet:
//   Keller (Lyra) → Kammern des Gesindes → Waffenkammer der Ritter → Bankettsaal
//   → Gemächer der Burgherren → Observatorium (Pult, Torwächter, Siegel zu den Inseln der Stimmen)
// Tore, Pult, Torwächter und Siegel kommen aus src/welt/halle.js (dieselben Fortschrittsmarken
// wie in der Halle der 2D-Versionen, alte Spielstände passen also).

import { dialog, textZeigen } from "../ui/fenster.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { TORE as TOR_INHALTE } from "../inhalte/lythara_q1.js";
import { TEXTE } from "../inhalte/texte.js";
import { torAktion, pult, torwaechter, siegel, rueckportal } from "./halle.js";
import { RASTER, TORE, ETAGEN_POS } from "./treppenturm_layout.js";

const LYRA = "Meisterin Lyra";
const ETAGE_NACH_TOR = ["", "die Kammern des Gesindes", "die Waffenkammer der Ritter", "den Bankettsaal", "die Gemächer der Burgherren", "das Observatorium"];

async function lyra() {
  const B = bild("npc_lyra");
  const name = zustand.held?.name ?? "Fremde";

  if (!istErledigt("lythara_intro")) {
    await dialog(LYRA, [
      `Willkommen in Lythara, ${name}! Ich bin Lyra, die letzte Schülerin der Schreibmeister.`,
      "Früher bewahrten die Schreiberkönige hier das Buch der Stimmen. Darin standen die Gedanken, Erfahrungen und Meinungen aller Völker.",
      "Doch Morgrath hat das Buch zerstört. Seine Seiten sind über die Inseln der Stimmen verstreut, hoch über diesem Turm. Um sie zu retten, brauchst du fünf Schriftrollen.",
      "Die erste ist die Rolle des Beobachters. Wer sie besitzt, kann einen Text vorstellen: Man nennt das eine Einleitung.",
      "Schau in diesen magischen Spiegel. Er zeigt dir die Nachricht eines Reisenden aus einer fernen Welt …",
    ], B);
    const t = TEXTE.nachricht_reisender;
    await textZeigen(`🪞 ${t.titel}`, t.text, t.quelle);
    erledigen("lythara_intro");
    await belohnung({ xp: 0, grund: "Du hast die Nachricht des Reisenden gefunden.", gegenstaende: ["spiegel_nachricht"] });
    await dialog(LYRA, [
      "Diese Nachricht brauchst du jetzt. Du findest sie in deinem Inventar (Taste I).",
      "Wir stehen im Keller des Turms der Tausend Treppen. Über uns liegen fünf Etagen: die Kammern des Gesindes, die Waffenkammer der Ritter, der Bankettsaal, die Gemächer der Burgherren und ganz oben das Observatorium.",
      "Oben an jeder Treppe wartet ein Tor. Es öffnet sich nur, wenn du einen Teil einer guten Einleitung beherrschst.",
      "Im Observatorium steht das Pult des Beobachters. Dort schreibst du deine eigene Einleitung. Und dann … wartet der Torwächter der Quellen vor dem Siegel zu den Inseln.",
    ], B);
    return;
  }

  if (istErledigt("lythara_q1_boss")) {
    erledigen("lythara_q1_abschluss");
    await dialog(LYRA, [
      "Du hast die Rolle des Beobachters! Die erste Seite des Buches der Stimmen leuchtet wieder.",
      "Jetzt ist das Siegel oben im Observatorium offen. Es führt hinaus zu den Inseln der Stimmen, hoch über dem Turm. Dort warten die vier anderen Schriftrollen.",
      "Ich gehe schon voraus. Steig alle Treppen hinauf und geh durch das Siegel – ich warte auf dich!",
    ], B);
    return;
  }

  const geoeffnet = Object.keys(TOR_INHALTE).filter((t) => istErledigt(`lythara_${t}`)).length;
  await dialog(LYRA, geoeffnet < 5
    ? `Du hast ${geoeffnet} von 5 Toren geöffnet. Das nächste Tor führt in ${ETAGE_NACH_TOR[geoeffnet + 1]}. Lies Jonas' Text noch einmal, wenn du unsicher bist.`
    : "Alle Tore sind offen! Steig hinauf ins Observatorium, schreibe am Pult deine Einleitung und stell dich dann dem Torwächter.", B);
}

const toreObjekte = Object.keys(TOR_INHALTE).map((torId, i) => ({
  id: torId, art: "tor", name: TOR_INHALTE[torId].name, x: TORE[i + 1].x, y: TORE[i + 1].y, breite: 2,
  aktion: torAktion(torId), hinweis: `${TOR_INHALTE[torId].name} untersuchen`,
  offen: (z) => Boolean(z.erledigt[`lythara_${torId}`]),
  marker: (z) => z.erledigt.lythara_intro && !z.erledigt[`lythara_${torId}`],
}));

const K = ETAGEN_POS[0], OB = ETAGEN_POS[5];

export default {
  id: "treppenturm",
  name: "Lythara – Der Turm der Tausend Treppen",
  musik: "halle",
  nur3d: true,
  nur3dZiel: ["halle", "eingang"],
  raster: RASTER,
  spawns: {
    start: [15, K.y1 - 1],
    eingang: [15, K.y1 - 1],
    vonTurm: [15, OB.y0 + 3],
    pult: [11, OB.y0 + 7],
    torwaechter: [15, OB.y0 + 5],
  },
  objekte: [
    { id: "lyra", art: "npc", name: "Meisterin Lyra", bild: "npc_lyra", x: 18, y: K.y1 - 3, aktion: lyra,
      // Nach Quest 1 geht Lyra zu den Inseln der Stimmen voraus
      sichtbar: (z) => !z.erledigt.lythara_q1_abschluss,
      marker: (z) => !z.erledigt.lythara_intro || (z.erledigt.lythara_q1_boss && !z.erledigt.lythara_q1_abschluss) },
    { id: "rueckportal", art: "portal", name: "Portal ins Dorf", x: 10, y: K.y1 - 1, breite: 2, aktion: rueckportal, hinweis: "Portal ins Dorf benutzen",
      aktiv: () => true },
    ...toreObjekte,
    { id: "pult", art: "objekt", name: "Pult des Beobachters", bild: "pult", x: 9, y: OB.y0 + 5, aktion: pult, hinweis: "Am Pult schreiben",
      marker: (z) => z.erledigt.lythara_tor5 && !z.erledigt.lythara_einleitung },
    { id: "torwaechter", art: "npc", name: "Der Torwächter der Quellen", bild: "boss_torwaechter", x: 14, y: OB.y0 + 1, breite: 2, hoehe: 2,
      aktion: torwaechter, hinweis: "Den Torwächter herausfordern",
      sichtbar: (z) => !z.erledigt.lythara_q1_boss,
      marker: (z) => z.erledigt.lythara_einleitung && !z.erledigt.lythara_q1_boss },
    { id: "siegel", art: "objekt", name: "Siegel zu den Inseln", bild: "siegeltuer", x: 14, y: 0, breite: 2, aktion: siegel, hinweis: "Das Siegel untersuchen",
      marker: (z) => z.erledigt.lythara_q1_abschluss && !z.erledigt.lythara_turm_intro },
  ],
};
