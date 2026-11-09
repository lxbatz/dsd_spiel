// Lythara – Die Inseln der Stimmen (Quests 2–5 und Finale)
// Hinter der Siegeltür der Halle: schwebende Inseln hoch über Lythara. Auf jeder der vier Inseln
// stehen drei Echo-Kristalle, ein Pult (freier Text) und ein Wächter. Ist der Wächter besiegt,
// erscheint die Brücke zur nächsten Insel. Auf der obersten Insel liegt das Buch der Stimmen.
// Die Karten-ID bleibt "turm", damit alte Spielstände weiter passen.
// Form und Lage der Inseln: inseln_layout.js

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { kampf } from "../ui/kampf.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { INSELN, BUCH, FRAGE } from "../inhalte/lythara_inseln.js";
import { LAYOUT, INSEL_FORMEN } from "./inseln_layout.js";

const LYRA = "Meisterin Lyra";
const lyraBild = () => bild("npc_lyra");

/** Ist die Insel erreichbar (Brücke dorthin da)? */
function inselOffen(i, z = zustand) {
  return i === 0 ? Boolean(z.erledigt.lythara_turm_intro) : Boolean(z.erledigt[`lythara_${INSELN[i - 1].id}_boss`]);
}

const stationenFertig = (q, z = zustand) => q.stationen.every((s) => z.erledigt[s.id]);

// ---------- Meisterin Lyra am Eingang ----------

async function lyra() {
  const B = lyraBild();
  const name = zustand.held?.name ?? "Fremde";

  if (!istErledigt("lythara_turm_intro")) {
    await dialog(LYRA, [
      `Da bist du ja, ${name}! Willkommen auf den Inseln der Stimmen – hoch über Lythara.`,
      "Schau dich um: Dort unten liegt die Halle der Tausend Tore. In der Halle hast du gelernt, wie man einen Text einleitet. Aber ein ganzer Beitrag hat noch mehr Teile.",
      "Über uns schweben vier Inseln. Auf jeder wartet eine Schriftrolle: Wiedergabe, Erfahrungen, Meinung und Schluss.",
      `Auf der höchsten Insel liegt das Buch der Stimmen. Dort schreibst du am Ende deinen ganzen Forumsbeitrag zu Jonas' Text und zur Frage: „${FRAGE}“`,
      "Genau so einen Text schreibst du auch in der DSD-Prüfung. Ich rufe jetzt die erste Brücke – zur Insel der Echos. Viel Glück!",
    ], B);
    erledigen("lythara_turm_intro");
    return;
  }

  if (istErledigt("lythara_buch")) {
    if (!istErledigt("lythara_finale")) {
      erledigen("lythara_finale");
      await belohnung({ xp: 0, grund: "Lythara ist gerettet!", gegenstaende: ["silber_abzeichen"], fanfare: true });
    }
    await dialog(LYRA, [
      `${name}, du hast es geschafft! Das Buch der Stimmen ist wieder ganz.`,
      "Du kannst jetzt einen vollständigen Forumsbeitrag schreiben: Einleitung, Wiedergabe, Erfahrungen, Meinung und Schluss.",
      "Lies deinen Text im Heldenpass noch einmal und zeig ihn deiner Lehrkraft. Das Reich Lythara ist gerettet!",
    ], B);
    return;
  }

  const i = INSELN.findIndex((q) => !istErledigt(`lythara_${q.id}_boss`));
  if (i < 0) {
    await dialog(LYRA, "Alle vier Rollen gehören dir! Geh hinauf zur höchsten Insel. Dort wartet das Buch der Stimmen.", B);
    return;
  }
  const q = INSELN[i];
  await dialog(LYRA, `Deine nächste Aufgabe wartet auf der ${q.insel.replace(/^Die /, "")} (${q.lernziel}). Folge den Brücken nach oben!`, B);
}

/** Lyra spricht beim ersten Kristall einer Insel durch den Kristall zu dir. */
async function inselEinfuehrung(q) {
  const id = `lythara_${q.id}_intro`;
  if (istErledigt(id)) return;
  await dialog("Lyras Stimme", q.lyra, lyraBild());
  erledigen(id);
}

// ---------- Kristalle, Pult, Wächter ----------

function kristallAktion(q, s) {
  return async () => {
    await inselEinfuehrung(q);
    if (istErledigt(s.id)) {
      const nochmal = await frage(s.name, `„${s.inschrift}“\n\nDiesen Kristall hast du schon zum Leuchten gebracht. Möchtest du noch einmal üben?`, ["Ja, noch einmal üben", "Nein"]);
      if (nochmal !== 0) return;
      await aufgabenFolge({ id: s.id, titel: s.name, untertitel: `${q.insel} · ${q.lernziel}`, aufgaben: s.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: s.name,
      frageText: `Im Kristall flüstert eine Stimme:\n„${s.inschrift}“\n\nWillst du die Aufgabe des Kristalls jetzt lösen?`,
      ja: "Ja, jetzt lösen",
      spaeter: "Der Kristall leuchtet weiter und wartet auf dich.",
      folge: { id: s.id, titel: s.name, untertitel: `${q.insel} · ${q.lernziel}`, aufgaben: s.aufgaben },
    });
    if (!geschafft) return;
    erledigen(s.id);
    await belohnung({ xp: 20, grund: `${s.name}: Der Kristall leuchtet!`, fanfare: true });
  };
}

function pultAktion(q) {
  return async () => {
    if (!stationenFertig(q)) {
      const fehlen = q.stationen.filter((s) => !istErledigt(s.id)).length;
      await dialog(q.pult, `Die Feder bewegt sich nicht. Bring zuerst die Echo-Kristalle dieser Insel zum Leuchten (noch ${fehlen}).`);
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
    await belohnung({ xp: 25, grund: `${q.pult}: Dein Text ist gespeichert.`, fanfare: true });
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
    const naechste = INSELN[INSELN.indexOf(q) + 1];
    await dialog("Lyras Stimme", naechste
      ? `Wunderbar! Schau – die Brücke zur ${naechste.insel.replace(/^Die /, "")} erscheint!`
      : "Unglaublich – alle vier Rollen gehören dir! Jetzt wartet das Buch der Stimmen auf dich.", lyraBild());
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
    frageText: "Die leeren Seiten des Buches leuchten. Hier schreibst du deinen ganzen Forumsbeitrag. Deine Texte aus der Halle und von den Inseln liegen schon bereit.\n\nMöchtest du jetzt schreiben?",
    ja: "Ja, jetzt schreiben",
    spaeter: "Das Buch wartet auf deine Worte.",
    folge: { id: "lythara_buch", titel: "Das Buch der Stimmen", untertitel: "Dein ganzer Forumsbeitrag", aufgaben: [BUCH] },
  });
  if (!geschafft) return;
  erledigen("lythara_buch");
  await belohnung({ xp: 200, grund: "Das Buch der Stimmen ist wieder ganz!", gegenstaende: ["buch_der_stimmen"], fanfare: true });
  await dialog("Lyras Stimme", "Komm zu mir zurück auf die Ankunftsinsel, ich muss dir etwas sagen!", lyraBild());
}

async function rueckweg(welt) {
  const antwort = await frage("Das zerbrochene Siegel", "Durch das Siegel siehst du die Halle der Tausend Tore. Möchtest du zurück in die Halle gehen?", ["Ja, zurück in die Halle", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("halle", "vonTurm");
}

// ---------- Objekte ----------

function inselObjekte(q, i) {
  const ort = LAYOUT.orte[q.id];
  const brueckeDahin = LAYOUT.bruecken[i];
  const offen = (z) => inselOffen(i, z);
  const vorher = INSELN[i - 1];
  return [
    // Brücke zu dieser Insel: erscheint, wenn Lyra sie ruft bzw. der Wächter davor besiegt ist
    {
      id: `bruecke_${q.id}`, art: "bruecke", name: `Brücke zur ${q.insel.replace(/^Die /, "")}`, farbe: q.farbe,
      x: brueckeDahin.x, y: brueckeDahin.y, breite: brueckeDahin.breite, hoehe: brueckeDahin.hoehe,
      offen,
      aktion: async () => dialog(`Brücke zur ${q.insel.replace(/^Die /, "")}`, i === 0
        ? "Hier schimmert nur ein schwacher Lichtstreifen über dem Abgrund. Sprich zuerst mit Meisterin Lyra."
        : `Hier schimmert nur ein schwacher Lichtstreifen über dem Abgrund. Die Brücke erscheint, wenn du den Wächter der ${vorher.insel.replace(/^Die /, "")} besiegt hast.`),
      hinweis: "Den Lichtstreifen untersuchen",
    },
    ...q.stationen.map((s, k) => ({
      id: s.id, art: "objekt", name: s.name, bild: "kristall", farbe: q.farbe, x: ort.kristalle[k][0], y: ort.kristalle[k][1],
      aktion: kristallAktion(q, s), hinweis: `${s.name} berühren`,
      leuchtet: (z) => Boolean(z.erledigt[s.id]),
      marker: (z) => offen(z) && !z.erledigt[s.id],
    })),
    {
      id: `pult_${q.id}`, art: "objekt", name: q.pult, bild: "pult", x: ort.pult[0], y: ort.pult[1],
      aktion: pultAktion(q), hinweis: "Am Pult schreiben",
      marker: (z) => stationenFertig(q, z) && !z.erledigt[q.text.id],
    },
    {
      id: `waechter_${q.id}`, art: "npc", name: q.waechter.name, bild: q.waechter.bild, x: ort.waechter[0], y: ort.waechter[1], breite: 2, hoehe: 2,
      aktion: waechterAktion(q), hinweis: `${q.waechter.name} herausfordern`,
      sichtbar: (z) => !z.erledigt[`lythara_${q.id}_boss`],
      marker: (z) => Boolean(z.erledigt[q.text.id]) && !z.erledigt[`lythara_${q.id}_boss`],
    },
  ];
}

const ankunft = INSEL_FORMEN[0];
const siegelInsel = LAYOUT.orte.q5;

export default {
  id: "turm",
  name: "Lythara – Die Inseln der Stimmen",
  musik: "inseln",
  nur3d: true,
  raster: LAYOUT.raster,
  inseln: INSEL_FORMEN,
  spawns: {
    start: [ankunft.cx, ankunft.cy + 1],
    eingang: [ankunft.cx, ankunft.cy + 1],
    // Startpunkte für Sprungcodes der Lehrkraft: Anfang jeder Insel, vor jedem Wächter, beim Buch
    ...Object.fromEntries(INSELN.flatMap((q) => {
      const o = LAYOUT.orte[q.id];
      return [[q.id, o.ankunft], [`${q.id}_waechter`, [o.waechter[0] + 1, o.waechter[1] + 4]]];
    })),
    buch: [siegelInsel.buch[0] + 1, siegelInsel.buch[1] + 3],
  },
  objekte: [
    { id: "lyra_turm", art: "npc", name: "Meisterin Lyra", bild: "npc_lyra", x: ankunft.cx + 3, y: ankunft.cy - 2, aktion: lyra,
      marker: (z) => !z.erledigt.lythara_turm_intro || (z.erledigt.lythara_buch && !z.erledigt.lythara_finale) },
    { id: "rueckweg", art: "portal", name: "Das zerbrochene Siegel", bild: "siegel_portal", x: ankunft.cx - 6, y: ankunft.cy + 1, breite: 2,
      aktion: rueckweg, hinweis: "Durch das Siegel zurück in die Halle", aktiv: () => true },
    ...INSELN.flatMap(inselObjekte),
    { id: "buch_stimmen", art: "objekt", name: "Das Buch der Stimmen", bild: "buch_stimmen", x: siegelInsel.buch[0], y: siegelInsel.buch[1], breite: 2,
      aktion: buchDerStimmen, hinweis: "Im Buch der Stimmen schreiben",
      leuchtet: (z) => Boolean(z.erledigt.lythara_buch),
      marker: (z) => Boolean(z.erledigt.lythara_q5_boss) && !z.erledigt.lythara_buch },
  ],
};
