// Erfundene Beispielklasse für das Lehrerzimmer (zum Ausprobieren, ohne echte Daten).
// Benutzt die echten Aufgaben des Spiels, damit Stolpersteine und Statistiken realistisch aussehen.

import { VORSTELLEN, FRAGEN_STELLEN, PERSONEN_BESCHREIBEN, AUSHANG } from "../src/inhalte/dorf.js";
import { TORE, EINLEITUNG, TORWAECHTER } from "../src/inhalte/lythara_q1.js";
import { KAMMERN, BUCH } from "../src/inhalte/lythara_kammern.js";

const PERSONEN = [
  ["Mira", "kriegerin", 0.82, 22], ["Ahmad", "magier", 0.9, 32], ["Oksana", "waldlaeufer", 0.7, 15],
  ["Luca", "barde", 0.55, 9], ["Yaren", "magier", 0.76, 18], ["Tomasz", "kriegerin", 0.6, 6],
  ["Amina", "barde", 0.88, 27], ["Diego", "waldlaeufer", 0.48, 4], ["Sara", "magier", 0.68, 13],
  ["Nikola", "kriegerin", 0.72, 11], ["Fatima", "waldlaeufer", 0.84, 24], ["Jonas", "barde", 0.5, 1],
];

// Wie schwer ist eine Aufgabe? (für die Beispieldaten: manche Aufgaben sind schwerer)
const SCHWER = {
  "dorf_wilma#3": 0.25, "lythara_tor2#2": 0.3, "lythara_tor4#1": 0.22, "dorf_brett#2": 0.18, "lythara_tor5#2": 0.15,
  "lythara_q2_s1#4": 0.3, "lythara_q3_s3#2": 0.28, "lythara_q4_s2#4": 0.25, "lythara_q4_s1#2": 0.2,
};

function zufallsquelle(saat) {
  let a = saat;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const TEXT_VORSTELLUNG = "Hallo! Ich heiße {name}. Ich bin 17 Jahre alt und komme aus Syrien. Jetzt wohne ich in Dortmund. Ich spreche Arabisch, Englisch und ein bisschen Deutsch. In meiner Freizeit spiele ich gern Fußball und höre Musik. Später möchte ich Elektronikerin werden.";
const TEXT_EINLEITUNG = "Praktikum im Ausland – eine gute Idee?\nHallo zusammen,\nim Forum von „Startklar“ habe ich einen Beitrag von Jonas gelesen. Er schreibt über sein Praktikum in Spanien. Das Thema ist auch für mich wichtig, weil ich bald ein Praktikum suche. Was denkt ihr? Lest meinen Text!";

export function beispielKlasse() {
  const jetzt = Date.now();
  const tag = 864e5;
  return PERSONEN.map(([name, klasse, koennen, questZahl], p) => {
    const r = zufallsquelle(1000 + p * 77);
    const held = { name, klasse, alter: "17", land: "Syrien", wohnort: "Dortmund", sprachen: "Arabisch, Englisch", hobbys: "Fußball", beruf: "Elektronikerin", kennung: `IFK11-${String(p + 1).padStart(2, "0")}` };
    const z = { version: 1, held, xp: 0, gegenstaende: ["heldenpass"], erledigt: {}, texte: {}, codes: [], ort: { karte: "dorf", spawn: "start" }, protokoll: [], spielerId: `beispiel-${p}`, statistik: { quests: {}, kaempfe: [], spielzeit: 0, tage: {} } };
    const start = jetzt - (24 + Math.floor(r() * 4)) * tag;
    const schritt = (22 * tag) / Math.max(questZahl, 9);
    let t = start;
    const folge = [
      ["dorf_heldenpass", VORSTELLEN.map((a) => (typeof a === "function" ? a(z) : a)), 50],
      ["dorf_wilma", FRAGEN_STELLEN, 50], ["dorf_borin", PERSONEN_BESCHREIBEN, 50], ["dorf_brett", AUSHANG, 50],
      ...Object.entries(TORE).map(([id, tor]) => [`lythara_${id}`, tor.aufgaben, 20]),
      ["lythara_einleitung", [EINLEITUNG], 25],
      ["lythara_q1_boss", null, 150, TORWAECHTER],
      ...KAMMERN.flatMap((q) => [
        ...q.stationen.map((st) => [st.id, st.aufgaben.map((a) => (typeof a === "function" ? a(z) : a)), 20]),
        [q.text.id, [q.text], 25],
        [`lythara_${q.id}_boss`, null, 150, q.waechter],
      ]),
      ["lythara_buch", [BUCH], 200],
    ];
    folge.slice(0, questZahl + (r() < 0.4 ? 1 : 0)).forEach(([id, aufgaben, xp, gegner], i) => {
      t += schritt * (0.5 + r());
      if (t > jetzt - 3600e3) t = jetzt - 3600e3 * (1 + r());
      const fertig = i < questZahl;
      if (aufgaben === null) {
        // Bosskampf: erst ein verlorener Kampf bei schwächeren Spielern
        const kaempfe = koennen < 0.75 ? [false, true] : [true];
        for (const sieg of kaempfe) {
          const fragen = gegner.fragen.slice(0, sieg ? 5 : 4).map((f, k) => ({ frage: f.frage, typ: f.typ, ok: sieg ? k !== 2 || r() < koennen : k % 2 === 0 }));
          z.statistik.kaempfe.push({ gegner: gegner.name, quest: id, datum: new Date(t).toISOString(), sieg, richtig: fragen.filter((f) => f.ok).length, falsch: fragen.filter((f) => !f.ok).length, fragen });
          t += 600e3;
        }
        if (fertig) { z.erledigt[id] = true; z.xp += xp; z.protokoll.push({ xp, grund: "Bosskampf gewonnen", datum: new Date(t).toISOString() }); }
        return;
      }
      const ergebnis = aufgaben.map((a, k) => {
        const schwer = SCHWER[`${id}#${k + 1}`] ?? 0;
        const erster = a.typ === "freitext" || r() < koennen - schwer;
        const fehler = erster ? 0 : 1 + Math.floor(r() * 2.4);
        return { nr: k + 1, frage: a.frage, typ: a.typ, fehler, ersterVersuch: erster, loesungGezeigt: fehler >= 2 && r() < 0.5, sekunden: Math.round(30 + r() * 110 + (a.typ === "freitext" ? 400 : 0)) };
      });
      const lauf = { datum: new Date(t).toISOString(), aufgaben: ergebnis };
      z.statistik.quests[id] = fertig
        ? { durchgaenge: 1, abgebrochen: r() < 0.2 ? 1 : 0, erster: lauf, letzter: lauf }
        : { durchgaenge: 0, abgebrochen: 1, erster: null, letzter: null };
      if (fertig) {
        z.erledigt[id] = true;
        z.xp += xp;
        z.protokoll.push({ xp, grund: `Quest: ${id}`, datum: new Date(t).toISOString() });
        if (id === "dorf_heldenpass") z.texte.dorf_vorstellung = { text: TEXT_VORSTELLUNG.replace("{name}", name), datum: new Date(t).toISOString() };
        if (id === "lythara_einleitung") z.texte.lythara_einleitung = { text: TEXT_EINLEITUNG, datum: new Date(t).toISOString() };
      }
    });
    // Spielzeit pro Tag
    for (let d = start; d < jetzt; d += tag) {
      const aktiv = r() < Math.min(0.85, questZahl / 22 + 0.15) * (d > jetzt - 7 * tag ? 1.1 : 0.8);
      if (!aktiv || (questZahl < 4 && d > jetzt - 9 * tag)) continue;
      const sek = Math.round((8 + r() * 35) * 60);
      z.statistik.tage[new Date(d).toLocaleDateString("sv-SE")] = sek;
      z.statistik.spielzeit += sek;
    }
    if (r() < 0.4) { z.codes.push("beispiel"); z.xp += 20; z.protokoll.push({ xp: 20, grund: "Lehrercode: Teamarbeit", datum: new Date(t).toISOString() }); }
    const zuletzt = Math.max(t, ...Object.keys(z.statistik.tage).map((d) => new Date(d).getTime() + 18 * 3600e3));
    z._gespeichert = new Date(Math.min(jetzt, zuletzt + 3600e3)).toISOString();
    return z;
  });
}
