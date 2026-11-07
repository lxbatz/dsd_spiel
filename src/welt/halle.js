// Lythara – Die Halle der Tausend Tore (Quest 1: Die Schriftrolle des Beobachters)

import { dialog, frage, textZeigen } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { kampf } from "../ui/kampf.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { TORE, EINLEITUNG, TORWAECHTER } from "../inhalte/lythara_q1.js";
import { TEXTE } from "../inhalte/texte.js";

const LYRA = "Meisterin Lyra";

async function lyra() {
  const B = bild("npc_lyra");
  const name = zustand.held?.name ?? "Fremde";

  if (!istErledigt("lythara_intro")) {
    await dialog(LYRA, [
      `Willkommen in Lythara, ${name}! Ich bin Lyra, die letzte Schülerin der Schreibmeister.`,
      "Früher bewahrten die Schreiberkönige hier das Buch der Stimmen. Darin standen die Gedanken, Erfahrungen und Meinungen aller Völker.",
      "Doch Morgrath hat das Buch zerstört. Seine Seiten liegen jetzt hier in der Verlorenen Bibliothek. Um sie zu retten, brauchst du fünf Schriftrollen.",
      "Die erste ist die Rolle des Beobachters. Wer sie besitzt, kann einen Text vorstellen: Man nennt das eine Einleitung.",
      "Schau in diesen magischen Spiegel. Er zeigt dir die Nachricht eines Reisenden aus einer fernen Welt …",
    ], B);
    const t = TEXTE.nachricht_reisender;
    await textZeigen(`🪞 ${t.titel}`, t.text, t.quelle);
    erledigen("lythara_intro");
    await belohnung({ xp: 0, grund: "Du hast die Nachricht des Reisenden gefunden.", gegenstaende: ["spiegel_nachricht"] });
    await dialog(LYRA, [
      "Diese Nachricht brauchst du jetzt. Du findest sie in deinem Inventar (Taste I).",
      "Vor dir liegt die Halle der Tausend Tore. Jedes Tor öffnet sich nur, wenn du einen Teil einer guten Einleitung beherrschst.",
      "Hinter dem letzten Tor steht das Pult des Beobachters. Dort schreibst du deine eigene Einleitung. Und dann … wartet der Torwächter der Quellen.",
    ], B);
    return;
  }

  if (istErledigt("lythara_q1_boss")) {
    erledigen("lythara_q1_abschluss");
    await dialog(LYRA, [
      "Du hast die Rolle des Beobachters! Die erste Seite des Buches der Stimmen leuchtet wieder.",
      "Hinter dem Siegel wartet die Kammer der Echos – dort geht es um die Rolle des Chronisten. Aber das Siegel ist noch verschlossen. Komm bald wieder!",
    ], B);
    return;
  }

  const geoeffnet = Object.keys(TORE).filter((t) => istErledigt(`lythara_${t}`)).length;
  await dialog(LYRA, geoeffnet < 5
    ? `Du hast ${geoeffnet} von 5 Toren geöffnet. Geh weiter nach Norden! Lies Jonas' Text noch einmal, wenn du unsicher bist.`
    : "Alle Tore sind offen! Schreibe am Pult deine Einleitung und stell dich dann dem Torwächter.", B);
}

function torAktion(torId) {
  const tor = TORE[torId];
  return async (welt) => {
    if (!istErledigt("lythara_intro")) {
      await dialog(tor.name, "Das Tor ist verschlossen. Sprich zuerst mit Meisterin Lyra am Eingang.");
      return;
    }
    const geschafft = await questStarten({
      sprecher: tor.name,
      frageText: `In das Tor sind leuchtende Buchstaben geschnitzt:\n„${tor.inschrift}“\n\nWillst du das Rätsel des Tores jetzt lösen?`,
      ja: "Ja, das Rätsel lösen",
      spaeter: "Die Buchstaben leuchten weiter. Das Tor wartet auf dich.",
      folge: { titel: tor.name, untertitel: "Die Schriftrolle des Beobachters", aufgaben: tor.aufgaben },
    });
    if (!geschafft) return;
    erledigen(`lythara_${torId}`);
    welt.aktualisieren();
    welt.erschuettern();
    await belohnung({ xp: 20, grund: `${tor.name} ist offen!` });
  };
}

async function pult() {
  if (istErledigt("lythara_einleitung")) {
    const nochmal = await frage("Pult des Beobachters", "Deine Einleitung liegt auf dem Pult. Möchtest du sie überarbeiten?", ["Ja, überarbeiten", "Nein"]);
    if (nochmal !== 0) return;
    await aufgabenFolge({ titel: "Pult des Beobachters", untertitel: "Deine Einleitung überarbeiten", aufgaben: [EINLEITUNG] });
    return;
  }
  const geschafft = await questStarten({
    sprecher: "Pult des Beobachters",
    frageText: "Auf dem Pult liegt ein leeres Pergament und eine Feder. Hier schreibst du deine eigene Einleitung. Möchtest du jetzt schreiben?",
    ja: "Ja, jetzt schreiben",
    spaeter: "Das Pergament bleibt hier liegen. Du kannst später schreiben.",
    folge: { titel: "Pult des Beobachters", untertitel: "Schreibe deine Einleitung", aufgaben: [EINLEITUNG] },
  });
  if (!geschafft) return;
  erledigen("lythara_einleitung");
  await belohnung({ xp: 25, grund: "Bonusaufgabe: Deine eigene Einleitung" });
}

async function torwaechter(welt) {
  const B = bild("boss_torwaechter");
  if (!istErledigt("lythara_einleitung")) {
    await dialog(TORWAECHTER.name, "Du willst mich herausfordern? Zeig mir zuerst am Pult, dass du eine Einleitung schreiben kannst!", B);
    return;
  }
  const bereit = await frage(TORWAECHTER.name, "Wer wagt es, vor mich zu treten? Bist du bereit für den Kampf?", ["Ja, ich bin bereit!", "Noch nicht."], B);
  if (bereit !== 0) return;
  const sieg = await kampf({ ...TORWAECHTER, bild: B }, TORWAECHTER.fragen);
  if (!sieg) return;
  erledigen("lythara_q1_boss");
  welt.aktualisieren();
  await belohnung({ xp: 150, grund: "Bosskampf gewonnen und Quest abgeschlossen: Die Schriftrolle des Beobachters", gegenstaende: ["rolle_beobachter"] });
  await dialog(LYRA, "Lyras Stimme hallt durch die Halle: „Du hast es geschafft! Komm zu mir zum Eingang.“", bild("npc_lyra"));
}

async function siegel() {
  await dialog("Siegeltür", istErledigt("lythara_q1_boss")
    ? "Hinter dieser Tür liegt die Kammer der Echos. Das Siegel ist noch zu. (Quest 2 kommt bald!)"
    : "Eine schwere Tür mit einem leuchtenden Siegel. Der Torwächter bewacht sie.");
}

async function rueckportal(welt) {
  const antwort = await frage("Portal", "Möchtest du zurück ins Dorf der Ankömmlinge reisen?", ["Ja, zurück ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

const toreObjekte = Object.keys(TORE).map((torId, i) => ({
  id: torId, art: "tor", name: TORE[torId].name, x: 14, y: 33 - i * 6, breite: 2,
  aktion: torAktion(torId), hinweis: `${TORE[torId].name} untersuchen`,
  offen: (z) => Boolean(z.erledigt[`lythara_${torId}`]),
  marker: (z) => z.erledigt.lythara_intro && !z.erledigt[`lythara_${torId}`],
}));

export default {
  id: "halle",
  name: "Lythara – Die Halle der Tausend Tore",
  musik: "halle",
  raster: [
    "##############################",
    "######BBBB____==____BBBB######",
    "######_c______==______c_######",
    "######________==________######",
    "######B_______==_______B######",
    "######B__c____==____c__B######",
    "######B_______==_______B######",
    "######________==________######",
    "######_c______==______c_######",
    "##############==##############",
    "######BB______==______BB######",
    "######_c______==______c_######",
    "######________==________######",
    "######_c______==______c_######",
    "######BB______==______BB######",
    "##############==##############",
    "######BB______==______BB######",
    "######_c______==______c_######",
    "######________==________######",
    "######_c______==______c_######",
    "######BB______==______BB######",
    "##############==##############",
    "######BB______==______BB######",
    "######_c______==______c_######",
    "######________==________######",
    "######_c______==______c_######",
    "######BB______==______BB######",
    "##############==##############",
    "######BB______==______BB######",
    "######_c______==______c_######",
    "######________==________######",
    "######_c______==______c_######",
    "######BB______==______BB######",
    "##############==##############",
    "######________==________######",
    "######_c______==______c_######",
    "######________==________######",
    "######________==________######",
    "######________==________######",
    "######_c______==______c_######",
    "######________==________######",
    "##############################",
  ],
  spawns: {
    start: [15, 38],
    eingang: [15, 38],
  },
  objekte: [
    { id: "lyra", art: "npc", name: "Meisterin Lyra", bild: "npc_lyra", x: 18, y: 36, aktion: lyra,
      marker: (z) => !z.erledigt.lythara_intro || (z.erledigt.lythara_q1_boss && !z.erledigt.lythara_q1_abschluss) },
    { id: "rueckportal", art: "portal", name: "Portal ins Dorf", x: 10, y: 38, breite: 2, aktion: rueckportal, hinweis: "Portal ins Dorf benutzen",
      aktiv: () => true },
    ...toreObjekte,
    { id: "pult", art: "objekt", name: "Pult des Beobachters", bild: "pult", x: 9, y: 6, aktion: pult, hinweis: "Am Pult schreiben",
      marker: (z) => z.erledigt.lythara_tor5 && !z.erledigt.lythara_einleitung },
    { id: "torwaechter", art: "npc", name: "Der Torwächter der Quellen", bild: "boss_torwaechter", x: 14, y: 2, breite: 2, hoehe: 2,
      aktion: torwaechter, hinweis: "Den Torwächter herausfordern",
      sichtbar: (z) => !z.erledigt.lythara_q1_boss,
      marker: (z) => z.erledigt.lythara_einleitung && !z.erledigt.lythara_q1_boss },
    { id: "siegel", art: "objekt", name: "Siegeltür", bild: "siegeltuer", x: 14, y: 0, breite: 2, aktion: siegel, hinweis: "Die Siegeltür untersuchen" },
  ],
};
