// Aufgabenliste (Fenster „Aufgaben“): Was ist erledigt, was kommt als Nächstes?

import { INSELN } from "../inhalte/lythara_inseln.js";

function hauptziele(z) {
  const e = (id) => Boolean(z.erledigt[id]);
  const tore = ["tor1", "tor2", "tor3", "tor4", "tor5"].filter((t) => e(`lythara_${t}`)).length;
  const liste = [
    { text: "Sprich mit dem Ratsältesten Aldric und fülle deinen Heldenpass aus.", erledigt: e("dorf_heldenpass") },
    { text: "Hilf Händlerin Wilma am Markt (Fragen stellen).", erledigt: e("dorf_wilma") },
    { text: "Hilf Schmied Borin (Personen beschreiben).", erledigt: e("dorf_borin") },
    { text: "Lies das Schwarze Brett am Brunnen.", erledigt: e("dorf_brett") },
    { text: "Kehre zu Aldric zurück.", erledigt: e("dorf_abschluss") },
    { text: "Reise durch das Portal nach Lythara und sprich mit Meisterin Lyra.", erledigt: e("lythara_intro") },
    { text: `Öffne die fünf Tore der Halle (${tore}/5).`, erledigt: tore === 5 },
    { text: "Schreibe am Pult des Beobachters deine eigene Einleitung.", erledigt: e("lythara_einleitung") },
    { text: "Besiege den Torwächter der Quellen.", erledigt: e("lythara_q1_boss") },
  ];
  if (!e("lythara_q1_boss")) return liste;

  liste.push({ text: "Geh durch die Siegeltür und sprich in den Inseln der Stimmen mit Lyra.", erledigt: e("lythara_turm_intro") });
  for (const q of INSELN) {
    const boss = e(`lythara_${q.id}_boss`);
    const kristalle = q.stationen.filter((s) => e(s.id)).length;
    liste.push({
      text: `${q.insel} – ${q.lernziel} (Kristalle ${kristalle}/3 · Text am Pult ${e(q.text.id) ? "✔" : "–"} · Wächter: ${q.waechter.name})`,
      erledigt: boss,
    });
    if (!boss) return liste;
  }
  liste.push({ text: "Schreibe deinen ganzen Forumsbeitrag in das Buch der Stimmen.", erledigt: e("lythara_buch") });
  liste.push({ text: "Sprich ein letztes Mal mit Meisterin Lyra.", erledigt: e("lythara_finale") });
  if (!e("lythara_finale")) return liste;
  // Aurelia – Reich des Hörens (über das Portal im Dorf)
  liste.push({ text: "Reise durch das Portal im Dorf nach Aurelia und sprich mit Orpheon am Stadttor.", erledigt: e("aurelia_intro") });
  const muscheln = ["aurelia_q1_m1", "aurelia_q1_m2", "aurelia_q1_m3"].filter(e).length;
  liste.push({ text: `Die Stimmen des Hafens: Hör die Rufmuscheln am Kai an (${muscheln}/3) und hilf Hafenmeisterin Nerea mit den Reisenden.`, erledigt: e("aurelia_q1") });
  if (!e("aurelia_q1")) return liste;
  const gespraeche = ["aurelia_q2_g1", "aurelia_q2_g2", "aurelia_q2_g3"].filter(e).length;
  liste.push({ text: `Gespräche am Markt: Hör an den Ständen auf der Agora zu (${gespraeche}/3) und mach die Ohrenprobe bei Marktaufseherin Ione.`, erledigt: e("aurelia_q2") });
  if (!e("aurelia_q2")) return liste;
  const perlen = ["aurelia_q3_p1", "aurelia_q3_p2", "aurelia_q3_p3"].filter(e).length;
  liste.push({ text: `Das Licht des Leuchtturms: Finde die Klangperlen (${perlen}/3), hör die Nachrichten an und hilf Leuchtturmwärter Talos mit seinem Notizbuch.`, erledigt: e("aurelia_q3") });
  if (e("aurelia_q3")) liste.push({ text: "Aurelia, Quest 4: Die Werft (kommt bald)", erledigt: false });
  return liste;
}

// Nebenquests im Dorf (freiwillig, nach dem Torwächter in Lythara)
const NEBEN = [
  ["dorf_finn", "Finns Geheimnis: Sprich mit Finn an der Schmiede."],
  ["dorf_markt", "Ein Tag am Marktstand: Hilf der erkälteten Wilma."],
  ["dorf_werkstatt", "Borins Werkstatt: Hilf Borin bei einem Auftrag."],
  ["dorf_mimi", "Mimi ist weg! Hilf Wilma, ihre Katze zu finden (nach dem Marktstand)."],
];

export function ziele(z) {
  const liste = hauptziele(z);
  if (!z.erledigt.lythara_q1_boss) return liste;
  return [...liste, ...NEBEN.map(([id, text]) => ({ text: `Nebenquest im Dorf (freiwillig) – ${text}`, erledigt: Boolean(z.erledigt[id]) }))];
}
