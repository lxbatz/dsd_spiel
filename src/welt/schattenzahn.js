// Die finale Kampagne: Die Feste Schattenzahn (nur 3D)
// Morgrath lebt noch. Er hat sich in der Feste Schattenzahn vor einem aktiven Vulkan verschanzt.
// Vor dem Burgtor warten die vier Mentoren (Lyra, Orpheon, Lirien, Runa) am Lagerfeuer.
// Dann geht es immer tiefer hinab – jede Ebene ist ein Teil einer vollständigen DSD-I-PRO-Probeprüfung:
//   Dungeon des Hörens      → Hörverstehen (24 Punkte, bestanden ab 12)
//   Katakomben des Lesens   → Leseverstehen (24 Punkte, bestanden ab 12)
//   Grotte der Schreiber    → Schriftliche Kommunikation (Forumsbeitrag, die Lehrkraft bewertet)
//   Kaverne der Stimmen     → Mündliche Kommunikation (Gespräch + Präsentation), danach der Endkampf
// In jeder Ebene stellt sich Morgrath zum Kampf. Jede bestandene Prüfung treibt ihn tiefer hinab.
// Am Ende stürzt er in die Lava. Belohnung: das Sprachsiegel von Eldoria und der Titel „Meister der Vier Sprachkräfte“.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge, pruefungsFolge, pruefungsAuswertung } from "../ui/aufgaben.js";
import { kampf } from "../ui/kampf.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { musik } from "../musik.js";
import { zustand, istErledigt, erledigen, speichern } from "../zustand.js";
import { HOEREN, HOEREN_HINWEIS } from "../inhalte/schattenzahn_hoeren.js";
import { LESEN, LESEN_HINWEIS } from "../inhalte/schattenzahn_lesen.js";
import { SCHREIBEN, SCHREIBEN_HINWEIS, SPRECHEN, SPRECHEN_HINWEIS, MORGRATH, MORGRATH_NAME, MORGRATH_WORTE } from "../inhalte/schattenzahn_finale.js";
import { RASTER, TORE, EBENEN_POS } from "./schattenzahn_layout.js";

export const TITEL_MEISTER = "Meister der Vier Sprachkräfte";
const BESTEHEN_AB = 0.5;        // Hören und Lesen: bestanden ab der Hälfte der Punkte (12 von 24)

const name = () => zustand.held?.name ?? "Held";
const LYRA = "Meisterin Lyra", ORPHEON = "Orpheon, der Glockenhüter", LIRIEN = "Lirien, Hüterin der Bücher", RUNA = "Großmutter Runa";

/** Die vier Prüfungsteile in der Reihenfolge der Ebenen */
const TEILE = [
  { id: "hoeren", flag: "schattenzahn_hoeren", name: "Hörverstehen", ort: "Dungeon des Hörens", splitter: "siegel_hoeren", dauer: "etwa 40 Minuten" },
  { id: "lesen", flag: "schattenzahn_lesen", name: "Leseverstehen", ort: "Katakomben des Lesens", splitter: "siegel_lesen", dauer: "etwa 60 Minuten" },
  { id: "schreiben", flag: "schattenzahn_schreiben", name: "Schriftliche Kommunikation", ort: "Grotte der Schreiber", splitter: "siegel_schreiben", dauer: "etwa 75 Minuten" },
  { id: "sprechen", flag: "schattenzahn_sprechen", name: "Mündliche Kommunikation", ort: "Kaverne der Stimmen", splitter: "siegel_sprechen", dauer: "etwa 20 Minuten, am besten zu zweit" },
];

function ergebnisMerken(teil, daten) {
  const alt = zustand.pruefung[teil] ?? { versuche: 0 };
  zustand.pruefung[teil] = { ...alt, ...daten, versuche: (alt.versuche ?? 0) + 1, datum: new Date().toISOString() };
  speichern();
}

// ---------- Die Mentoren am Lagerfeuer ----------

async function lyra(welt) {
  const B = bild("npc_lyra");
  if (!istErledigt("schattenzahn_intro")) {
    await dialog(LYRA, [
      `${name()}! Gut, dass du da bist. Wir haben auf dich gewartet – alle vier.`,
      "Aldric hatte recht: Morgrath lebt. Als du die vier Reiche befreit hast, ist er hierher geflohen, in die Feste Schattenzahn. Er hat die vier Splitter des Sprachsiegels mitgenommen.",
      "Die Feste reicht tief in den Berg hinein, bis hinunter zur Lava. Jede Ebene ist eine Prüfung – so wie deine echte DSD-Prüfung: Hören, Lesen, Schreiben und Sprechen.",
      "Das hier ist eine Probeprüfung. Es gibt keine Hilfe, keine zweite Chance bei einer Aufgabe und keine Rückmeldung, bevor du fertig bist. Erst am Ende siehst du deine Punkte.",
      "Beim Hören und Lesen brauchst du mindestens die Hälfte der Punkte. Schreiben und Sprechen bewertet später deine Lehrkraft – gib dort dein Bestes.",
      "Nimm dir Zeit. Jede Prüfung dauert so lange wie in echt. Wenn du nicht bestehst, kannst du es noch einmal versuchen – Morgrath läuft uns nicht weg.",
    ], B);
    erledigen("schattenzahn_intro");
    welt.aktualisieren();
    await dialog("Burgtor", "Mit einem schweren Rasseln hebt sich das Fallgitter. Kalte, schwefelige Luft strömt aus der Tiefe herauf.");
    return;
  }
  if (istErledigt("schattenzahn_finale")) {
    await dialog(LYRA, [
      `${name()}, du hast es geschafft. Morgrath ist fort, und das Sprachsiegel leuchtet wieder.`,
      "Jetzt bist du bereit für deine echte Prüfung. Denk daran: Lies die Aufgaben genau, hör bis zum Ende zu, schreib ausführlich und sprich mutig. Wir glauben an dich!",
    ], B);
    return;
  }
  const naechster = TEILE.find((t) => !istErledigt(t.flag));
  await dialog(LYRA, `Dein nächster Weg führt ins ${naechster.ort}. Dort wartet die Probeprüfung ${naechster.name}. Du schaffst das!`, B);
}

const mentorTipp = (sprecher, bildKey, tipps, danach) => async () => {
  const B = bild(bildKey);
  if (istErledigt("schattenzahn_finale")) { await dialog(sprecher, danach, B); return; }
  if (!istErledigt("schattenzahn_intro")) { await dialog(sprecher, "Sprich zuerst mit Lyra. Sie erklärt dir alles.", B); return; }
  await dialog(sprecher, tipps, B);
};

const orpheon = mentorTipp(ORPHEON, "npc_orpheon", [
  "Mein Rat für das Dungeon des Hörens: Lies vor jedem Text die Aufgabe. Dann weißt du, worauf du hören musst.",
  "Hör bis zum Ende! Oft ändert jemand seine Meinung oder korrigiert sich – die Lösung kommt zum Schluss. Und vergiss nicht: Die Meinungen im letzten Teil hörst du nur einmal.",
], "Die Glocken von Aurelia läuten für dich, bis hierher!");

const lirien = mentorTipp(LIRIEN, "npc_lirien", [
  "In den Katakomben des Lesens gilt: Die Lösung steht fast nie wörtlich im Text. Suche dieselbe Bedeutung mit anderen Worten.",
  "Und hüte dich vor den kleinen Wörtern – „nur“, „alle“, „die meisten“, „noch nicht“. Morgrath liebt sie.",
], "Über Scriptoria scheint die Sonne – und jetzt auch über dir.");

const runa = mentorTipp(RUNA, "npc_runa", [
  "Für die Grotte der Schreiber: Plane, bevor du schreibst. Einleitung, Wiedergabe, Erfahrungen, Meinung, Schluss. Und lieber mutig und ausführlich als kurz und fehlerfrei.",
  "Und in der Kaverne der Stimmen: Antworte nie nur mit einem Satz. Erzähl, gib Beispiele, begründe. Wenn du eine Frage nicht verstehst – frag nach!",
], "Hörst du? Ganz Eldoria singt!");

// ---------- Morgrath in den vier Ebenen ----------

function morgrathAktion(t) {
  return async (welt) => {
    const B = bild("boss_morgrath");
    const worte = MORGRATH_WORTE[t.id];
    const i = TEILE.indexOf(t);
    if (i > 0 && !istErledigt(TEILE[i - 1].flag)) return;
    // In der Kaverne: nach der mündlichen Prüfung folgt sofort der Endkampf
    if (t.id === "sprechen" && istErledigt(t.flag)) { await endkampf(welt); return; }
    await dialog(MORGRATH_NAME, worte.vorher, B);
    const bereit = await frage(MORGRATH_NAME, `Probeprüfung ${t.name} – ${t.dauer}. Bist du bereit?`, ["Ja, ich stelle mich der Prüfung!", "Noch nicht."], B);
    if (bereit !== 0) return;

    if (t.id === "hoeren" || t.id === "lesen") {
      const e = await pruefungsFolge({
        id: `schattenzahn_${t.id}`, titel: `Probeprüfung ${t.name}`, untertitel: t.ort,
        aufgaben: t.id === "hoeren" ? HOEREN : LESEN, bestehenAb: BESTEHEN_AB,
        hinweis: t.id === "hoeren" ? HOEREN_HINWEIS : LESEN_HINWEIS,
      });
      if (e.abgebrochen) { await dialog(MORGRATH_NAME, "„Du gibst schon auf? Wie erbärmlich. Komm wieder, wenn du Mut hast!“", B); return; }
      ergebnisMerken(t.id, { punkte: e.punkte, max: e.max, bestanden: e.bestanden, teile: e.teile });
      await pruefungsAuswertung(`Probeprüfung ${t.name}`, e);
      if (!e.bestanden) { await dialog(MORGRATH_NAME, worte.niederlage, B); return; }
    } else {
      const e = await aufgabenFolge({
        id: `schattenzahn_${t.id}`, titel: `Probeprüfung ${t.name}`, untertitel: `${t.ort} · ${t.id === "schreiben" ? SCHREIBEN_HINWEIS : SPRECHEN_HINWEIS}`,
        aufgaben: t.id === "schreiben" ? SCHREIBEN : SPRECHEN,
      });
      if (e.abgebrochen) { await dialog(MORGRATH_NAME, worte.niederlage, B); return; }
      ergebnisMerken(t.id, { abgegeben: true, bestanden: true });
    }

    erledigen(t.flag);
    if (t.id === "sprechen") {
      await belohnung({ xp: 250, grund: `Probeprüfung bestanden: ${t.name}`, gegenstaende: [t.splitter], fanfare: true });
      await dialog(MORGRATH_NAME, "„Du sprichst … zu laut. VIEL zu laut! Genug geredet – jetzt KÄMPFE!“", B);
      await endkampf(welt);
      return;
    }
    welt.aktualisieren();
    await dialog(MORGRATH_NAME, worte.sieg, B);
    await belohnung({ xp: 250, grund: `Probeprüfung bestanden: ${t.name}`, gegenstaende: [t.splitter], fanfare: true });
    await dialog("Fallgitter", `Hinter dir rasselt es: Das Fallgitter zum ${TEILE[i + 1].ort} hebt sich. Der Weg führt noch tiefer hinab.`);
  };
}

async function endkampf(welt) {
  const B = bild("boss_morgrath");
  const sieg = await kampf({ ...MORGRATH, bild: B, quest: "schattenzahn_boss", musik: "kampf_morgrath" }, MORGRATH.fragen);
  if (!sieg) return;
  erledigen("schattenzahn_boss");
  welt.aktualisieren();
  await belohnung({ xp: 300, grund: "Endkampf gewonnen: Morgrath, der Verschleierer" });
  await dialog("Die Kaverne der Stimmen", [
    "Die Lava beruhigt sich. Wo Morgrath versunken ist, steigen vier helle Lichter auf – die Splitter des Sprachsiegels.",
    "Sie schweben zu dir herüber, drehen sich umeinander … und verschmelzen mit einem hellen Klang zu einem einzigen, leuchtenden Siegel.",
  ]);
  erledigen("schattenzahn_finale");
  welt.aktualisieren();
  musik("schattenzahn_sieg");
  await dialog(LYRA, [
    "Lyra, Orpheon, Lirien und Runa kommen die Treppe herunter. Lyra legt dir die Hand auf die Schulter.",
    `„${name()} – du hast Hören, Lesen, Schreiben und Sprechen gemeistert. Du hast eine ganze Probeprüfung bestanden. Morgrath ist besiegt, und Eldoria ist gerettet.“`,
    `„Von heute an trägst du einen neuen Titel: ${TITEL_MEISTER}.“`,
  ], bild("npc_lyra"));
  await belohnung({ xp: 500, grund: `Eldoria ist gerettet! Neuer Titel: ${TITEL_MEISTER}`, gegenstaende: ["sprachsiegel_eldoria"], fanfare: true });
  await dialog("Lichtportal", "Neben dir öffnet sich ein Portal aus warmem Licht. Es führt zurück ins Dorf der Ankömmlinge – Aldric wartet sicher schon.");
}

// ---------- Tore und Portale ----------

function torAktion(i) {
  return async () => {
    if (i === 1) {
      await dialog("Burgtor", "Ein riesiges Fallgitter aus schwarzem Eisen. Dahinter führt eine Treppe in die Tiefe. Sprich zuerst mit den Mentoren am Lagerfeuer.");
      return;
    }
    await dialog("Fallgitter", `Das Fallgitter ist verschlossen. Morgrath steht davor – besiege ihn zuerst in der Probeprüfung ${TEILE[i - 2].name}.`);
  };
}

async function heimweg(welt) {
  const antwort = await frage("Portal", "Das Portal flackert rot im Ascheregen. Möchtest du ins Dorf der Ankömmlinge zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

async function lichtportal(welt) {
  const antwort = await frage("Lichtportal", "Das Portal aus warmem Licht führt ins Dorf der Ankömmlinge. Möchtest du zurückkehren?", ["Ja, nach Hause", "Noch nicht"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

const V = EBENEN_POS[0], K = EBENEN_POS[4];
const MORGRATH_ORT = { hoeren: [19, EBENEN_POS[1].y0 + 1], lesen: [19, EBENEN_POS[2].y0 + 1], schreiben: [19, EBENEN_POS[3].y0 + 1], sprechen: [19, K.y0 + 6] };

export default {
  id: "schattenzahn",
  name: "Die Feste Schattenzahn",
  get musik() { return zustand.erledigt.schattenzahn_finale ? "schattenzahn_sieg" : "schattenzahn"; },
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster: RASTER,
  spawns: {
    start: [20, V.y1 - 2],
    eingang: [20, V.y1 - 2],
    tor: [20, V.y0 + 3],
    hoeren: [20, EBENEN_POS[1].y1 - 1],
    lesen: [20, EBENEN_POS[2].y1 - 1],
    schreiben: [20, EBENEN_POS[3].y1 - 1],
    sprechen: [20, K.y1 - 1],
  },
  objekte: [
    { id: "portal_schattenzahn", art: "portal", name: "Portal ins Dorf", x: 19, y: V.y1, breite: 2, aktion: heimweg, hinweis: "Portal benutzen", aktiv: () => true },
    { id: "sz_lyra", art: "npc", name: LYRA, bild: "npc_lyra", x: 16, y: V.y1 - 6, aktion: lyra,
      marker: (z) => !z.erledigt.schattenzahn_intro },
    { id: "sz_orpheon", art: "npc", name: ORPHEON, bild: "npc_orpheon", x: 23, y: V.y1 - 6, aktion: orpheon },
    { id: "sz_lirien", art: "npc", name: LIRIEN, bild: "npc_lirien", x: 16, y: V.y1 - 3, aktion: lirien },
    { id: "sz_runa", art: "npc", name: RUNA, bild: "npc_runa", x: 23, y: V.y1 - 3, aktion: runa },
    ...TORE.map((t, i) => t && ({
      id: `sz_tor${i}`, art: "tor", name: i === 1 ? "Burgtor" : `Fallgitter zum ${TEILE[i - 1].ort}`, bild: "fallgitter", x: t.x, y: t.y, breite: 2,
      aktion: torAktion(i), hinweis: i === 1 ? "Das Burgtor untersuchen" : "Das Fallgitter untersuchen",
      offen: (z) => Boolean(i === 1 ? z.erledigt.schattenzahn_intro : z.erledigt[TEILE[i - 2].flag]),
    })).filter(Boolean),
    ...TEILE.map((t, i) => ({
      id: `sz_morgrath_${t.id}`, art: "npc", name: MORGRATH_NAME, bild: "morgrath", x: MORGRATH_ORT[t.id][0], y: MORGRATH_ORT[t.id][1], breite: 2, hoehe: 2,
      aktion: morgrathAktion(t), hinweis: t.id === "sprechen" ? "Morgrath herausfordern" : `Probeprüfung ${t.name} beginnen`,
      // In den oberen Ebenen verschwindet er nach der bestandenen Prüfung in die Tiefe; in der Kaverne stürzt er in die Lava
      sichtbar: (z) => t.id === "sprechen" || !z.erledigt[t.flag],
      leuchtet: (z) => t.id === "sprechen" && Boolean(z.erledigt.schattenzahn_boss),
      // Nach dem Sturz in die Lava kann man ihn nicht mehr ansprechen (und nicht mehr anstoßen)
      offen: (z) => t.id === "sprechen" && Boolean(z.erledigt.schattenzahn_boss),
      marker: (z) => Boolean(z.erledigt.schattenzahn_intro) && (i === 0 || Boolean(z.erledigt[TEILE[i - 1].flag])) && !z.erledigt[t.flag]
        || (t.id === "sprechen" && Boolean(z.erledigt[t.flag]) && !z.erledigt.schattenzahn_boss),
    })),
    { id: "sz_lichtportal", art: "portal", name: "Lichtportal", x: 19, y: K.y1 - 3, breite: 2, aktion: lichtportal, hinweis: "Durch das Lichtportal gehen",
      aktiv: (z) => Boolean(z.erledigt.schattenzahn_finale), sichtbar: (z) => Boolean(z.erledigt.schattenzahn_finale) },
  ],
};
