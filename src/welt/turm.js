// Lythara – Die Kammern der Stimmen (Quests 2–5 und Finale)
// Hinter der Siegeltür der Halle. Vier Kammern übereinander, jede mit drei Echo-Kristallen,
// einem Pult (freier Text) und einem Wächter. Ganz oben liegt das Buch der Stimmen.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { kampf } from "../ui/kampf.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { KAMMERN, BUCH, FRAGE } from "../inhalte/lythara_kammern.js";

const LYRA = "Meisterin Lyra";
const lyraBild = () => bild("npc_lyra");

// Oberste Zeile jeder Kammer (Kammer 0 = unten, Kammer 3 = oben)
const OBEN = [25, 17, 9, 1];

/** Ist die Kammer erreichbar (Tor davor offen)? */
function kammerOffen(i, z = zustand) {
  return i === 0 ? Boolean(z.erledigt.lythara_turm_intro) : Boolean(z.erledigt[`lythara_${KAMMERN[i - 1].id}_boss`]);
}

const stationenFertig = (q, z = zustand) => q.stationen.every((s) => z.erledigt[s.id]);

// ---------- Meisterin Lyra am Eingang ----------

async function lyra() {
  const B = lyraBild();
  const name = zustand.held?.name ?? "Fremde";

  if (!istErledigt("lythara_turm_intro")) {
    await dialog(LYRA, [
      `Da bist du ja, ${name}! Willkommen in den Kammern der Stimmen.`,
      "In der Halle hast du gelernt, wie man einen Text einleitet. Aber ein ganzer Beitrag hat noch mehr Teile.",
      "Über uns liegen vier Kammern. In jeder wartet eine Schriftrolle: Wiedergabe, Erfahrungen, Meinung und Schluss.",
      `Am Ende schreibst du in das Buch der Stimmen deinen ganzen Forumsbeitrag zu Jonas' Text und zur Frage: „${FRAGE}“`,
      "Genau so einen Text schreibst du auch in der DSD-Prüfung. Das Tor zur Kammer der Echos ist jetzt offen. Viel Glück!",
    ], B);
    erledigen("lythara_turm_intro");
    return;
  }

  if (istErledigt("lythara_buch")) {
    if (!istErledigt("lythara_finale")) {
      erledigen("lythara_finale");
      await belohnung({ xp: 0, grund: "Lythara ist gerettet!", gegenstaende: ["silber_abzeichen"] });
    }
    await dialog(LYRA, [
      `${name}, du hast es geschafft! Das Buch der Stimmen ist wieder ganz.`,
      "Du kannst jetzt einen vollständigen Forumsbeitrag schreiben: Einleitung, Wiedergabe, Erfahrungen, Meinung und Schluss.",
      "Lies deinen Text im Heldenpass noch einmal und zeig ihn deiner Lehrkraft. Das Reich Lythara ist gerettet!",
    ], B);
    return;
  }

  const i = KAMMERN.findIndex((q) => !istErledigt(`lythara_${q.id}_boss`));
  if (i < 0) {
    await dialog(LYRA, "Alle vier Rollen gehören dir! Geh ganz nach oben zum Buch der Stimmen und schreibe deinen ganzen Beitrag.", B);
    return;
  }
  const q = KAMMERN[i];
  await dialog(LYRA, `Deine nächste Aufgabe wartet in der ${q.kammer.replace(/^Die /, "")} (${q.lernziel}). Geh nach Norden!`, B);
}

/** Lyra spricht beim ersten Kristall einer Kammer durch einen Kristall zu dir. */
async function kammerEinfuehrung(q) {
  const id = `lythara_${q.id}_intro`;
  if (istErledigt(id)) return;
  await dialog("Lyras Stimme", q.lyra, lyraBild());
  erledigen(id);
}

// ---------- Kristalle, Pult, Wächter ----------

function kristallAktion(q, s) {
  return async () => {
    await kammerEinfuehrung(q);
    if (istErledigt(s.id)) {
      const nochmal = await frage(s.name, `„${s.inschrift}“\n\nDiesen Kristall hast du schon zum Leuchten gebracht. Möchtest du noch einmal üben?`, ["Ja, noch einmal üben", "Nein"]);
      if (nochmal !== 0) return;
      await aufgabenFolge({ id: s.id, titel: s.name, untertitel: `${q.kammer} · ${q.lernziel}`, aufgaben: s.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: s.name,
      frageText: `Im Kristall flüstert eine Stimme:\n„${s.inschrift}“\n\nWillst du die Aufgabe des Kristalls jetzt lösen?`,
      ja: "Ja, jetzt lösen",
      spaeter: "Der Kristall leuchtet weiter und wartet auf dich.",
      folge: { id: s.id, titel: s.name, untertitel: `${q.kammer} · ${q.lernziel}`, aufgaben: s.aufgaben },
    });
    if (!geschafft) return;
    erledigen(s.id);
    await belohnung({ xp: 20, grund: `${s.name}: Der Kristall leuchtet!` });
  };
}

function pultAktion(q) {
  return async () => {
    if (!stationenFertig(q)) {
      const fehlen = q.stationen.filter((s) => !istErledigt(s.id)).length;
      await dialog(q.pult, `Die Feder bewegt sich nicht. Bring zuerst die Echo-Kristalle dieser Kammer zum Leuchten (noch ${fehlen}).`);
      return;
    }
    if (istErledigt(q.text.id)) {
      const nochmal = await frage(q.pult, "Dein Text liegt auf dem Pult. Möchtest du ihn überarbeiten?", ["Ja, überarbeiten", "Nein"]);
      if (nochmal !== 0) return;
      await aufgabenFolge({ titel: q.pult, untertitel: "Deinen Text überarbeiten", aufgaben: [q.text] });
      return;
    }
    const geschafft = await questStarten({
      sprecher: q.pult,
      frageText: "Auf dem Pult liegen ein leeres Pergament und eine Feder. Hier schreibst du deinen eigenen Text. Möchtest du jetzt schreiben?",
      ja: "Ja, jetzt schreiben",
      spaeter: "Das Pergament bleibt hier liegen. Du kannst später schreiben.",
      folge: { id: q.text.id, titel: q.pult, untertitel: q.lernziel, aufgaben: [q.text] },
    });
    if (!geschafft) return;
    erledigen(q.text.id);
    await belohnung({ xp: 25, grund: `${q.pult}: Dein Text ist gespeichert.` });
  };
}

function waechterAktion(q) {
  const w = q.waechter;
  return async (welt) => {
    const B = bild(w.bild);
    if (!istErledigt(q.text.id)) {
      await dialog(w.name, `Du willst mich herausfordern? Schreib zuerst am ${q.pult} deinen eigenen Text!`, B);
      return;
    }
    const bereit = await frage(w.name, "Bist du bereit für den Kampf?", ["Ja, ich bin bereit!", "Noch nicht."], B);
    if (bereit !== 0) return;
    const quest = `lythara_${q.id}_boss`;
    const sieg = await kampf({ ...w, bild: B, quest }, w.fragen);
    if (!sieg) return;
    erledigen(quest);
    welt.aktualisieren();
    await belohnung({ xp: 150, grund: `Bosskampf gewonnen: ${q.rollenName}`, gegenstaende: [q.rolle] });
    const naechste = KAMMERN[KAMMERN.indexOf(q) + 1];
    await dialog("Lyras Stimme", naechste
      ? `Wunderbar! Das Tor zur ${naechste.kammer.replace(/^Die /, "")} hat sich geöffnet.`
      : "Unglaublich – alle vier Rollen gehören dir! Oben wartet das Buch der Stimmen.", lyraBild());
  };
}

async function buchDerStimmen() {
  if (!istErledigt("lythara_q5_boss")) {
    await dialog("Das Buch der Stimmen", "Ein riesiges Buch mit leeren, leuchtenden Seiten. Das Endlose Echo lässt dich nicht heran.");
    return;
  }
  if (istErledigt("lythara_buch")) {
    const nochmal = await frage("Das Buch der Stimmen", "Dein Forumsbeitrag steht im Buch der Stimmen. Möchtest du ihn überarbeiten?", ["Ja, überarbeiten", "Nein"]);
    if (nochmal !== 0) return;
    await aufgabenFolge({ titel: "Das Buch der Stimmen", untertitel: "Deinen Forumsbeitrag überarbeiten", aufgaben: [BUCH] });
    return;
  }
  const geschafft = await questStarten({
    sprecher: "Das Buch der Stimmen",
    frageText: "Die leeren Seiten des Buches leuchten. Hier schreibst du deinen ganzen Forumsbeitrag. Deine Texte aus den Kammern liegen schon bereit.\n\nMöchtest du jetzt schreiben?",
    ja: "Ja, jetzt schreiben",
    spaeter: "Das Buch wartet auf deine Worte.",
    folge: { id: "lythara_buch", titel: "Das Buch der Stimmen", untertitel: "Dein ganzer Forumsbeitrag", aufgaben: [BUCH] },
  });
  if (!geschafft) return;
  erledigen("lythara_buch");
  await belohnung({ xp: 200, grund: "Das Buch der Stimmen ist wieder ganz!", gegenstaende: ["buch_der_stimmen"] });
  await dialog("Lyras Stimme", "Komm zu mir zum Eingang, ich muss dir etwas sagen!", lyraBild());
}

async function rueckweg(welt) {
  const antwort = await frage("Siegeltür", "Möchtest du zurück in die Halle der Tausend Tore gehen?", ["Ja, zurück in die Halle", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("halle", "vonTurm");
}

// ---------- Objekte ----------

function kammerObjekte(q, i) {
  const a = OBEN[i];
  const bossY = i === 3 ? a + 2 : a;
  const plaetze = [[8, a + 5], [21, a + 5], [8, a + 2]];
  const offen = (z) => kammerOffen(i, z);
  return [
    // Tor in diese Kammer (in der Trennwand darunter)
    {
      id: `turm_tor${i + 1}`, art: "tor", name: q.kammer.replace(/^Die /, ""), farbe: q.farbe, x: 14, y: a + 7, breite: 2,
      offen,
      aktion: async () => dialog(q.kammer, i === 0
        ? "Das Tor ist verschlossen. Sprich zuerst mit Meisterin Lyra."
        : `Das Tor ist verschlossen. Besiege zuerst den Wächter der ${KAMMERN[i - 1].kammer.replace(/^Die /, "")}.`),
      hinweis: "Das Tor untersuchen",
    },
    ...q.stationen.map((s, k) => ({
      id: s.id, art: "objekt", name: s.name, bild: "kristall", farbe: q.farbe, x: plaetze[k][0], y: plaetze[k][1],
      aktion: kristallAktion(q, s), hinweis: `${s.name} berühren`,
      leuchtet: (z) => Boolean(z.erledigt[s.id]),
      marker: (z) => offen(z) && !z.erledigt[s.id],
    })),
    {
      id: `pult_${q.id}`, art: "objekt", name: q.pult, bild: "pult", x: 21, y: a + 2,
      aktion: pultAktion(q), hinweis: "Am Pult schreiben",
      marker: (z) => stationenFertig(q, z) && !z.erledigt[q.text.id],
    },
    {
      id: `waechter_${q.id}`, art: "npc", name: q.waechter.name, bild: q.waechter.bild, x: 14, y: bossY, breite: 2, hoehe: 2,
      aktion: waechterAktion(q), hinweis: `${q.waechter.name} herausfordern`,
      sichtbar: (z) => !z.erledigt[`lythara_${q.id}_boss`],
      marker: (z) => Boolean(z.erledigt[q.text.id]) && !z.erledigt[`lythara_${q.id}_boss`],
    },
  ];
}

// Raster: 30 × 40. Kammern 7 Zeilen hoch, Trennwände mit Durchgang (==) in Spalte 14/15.
const KAMMER_ZEILEN = [
  "######B_______==_______B######",
  "######c_______==_______c######",
  "######________==________######",
  "######B_______==_______B######",
  "######________==________######",
  "######c_______==_______c######",
  "######B_______==_______B######",
];
const TRENN = "##############==##############";
const WAND = "##############################";

export default {
  id: "turm",
  name: "Lythara – Die Kammern der Stimmen",
  musik: "halle",
  nur3d: true,
  raster: [
    WAND,
    ...KAMMER_ZEILEN, TRENN,   // Kammer des Siegels (Zeilen 1–7)
    ...KAMMER_ZEILEN, TRENN,   // Kammer der Waage (9–15)
    ...KAMMER_ZEILEN, TRENN,   // Kammer der Erinnerungen (17–23)
    ...KAMMER_ZEILEN, TRENN,   // Kammer der Echos (25–31)
    "######________==________######",
    "######_c______==______c_######",
    "######________==________######",
    "######________==________######",
    "######_c______==______c_######",
    "######________==________######",
    WAND,
  ],
  spawns: {
    start: [15, 37],
    eingang: [15, 37],
    // Startpunkte für Sprungcodes der Lehrkraft: Anfang jeder Kammer, vor jedem Wächter, beim Buch
    ...Object.fromEntries(KAMMERN.flatMap((q, i) => [[q.id, [15, OBEN[i] + 6]], [`${q.id}_waechter`, [15, OBEN[i] + (i === 3 ? 6 : 4)]]])),
    buch: [15, 4],
  },
  objekte: [
    { id: "lyra_turm", art: "npc", name: "Meisterin Lyra", bild: "npc_lyra", x: 18, y: 35, aktion: lyra,
      marker: (z) => !z.erledigt.lythara_turm_intro || (z.erledigt.lythara_buch && !z.erledigt.lythara_finale) },
    { id: "rueckweg", art: "portal", name: "Weg zurück in die Halle", x: 10, y: 37, breite: 2, aktion: rueckweg, hinweis: "Zurück in die Halle gehen",
      aktiv: () => true },
    ...KAMMERN.flatMap(kammerObjekte),
    { id: "buch_stimmen", art: "objekt", name: "Das Buch der Stimmen", bild: "buch_stimmen", x: 14, y: 1, breite: 2,
      aktion: buchDerStimmen, hinweis: "Im Buch der Stimmen schreiben",
      leuchtet: (z) => Boolean(z.erledigt.lythara_buch),
      marker: (z) => Boolean(z.erledigt.lythara_q5_boss) && !z.erledigt.lythara_buch },
  ],
};
