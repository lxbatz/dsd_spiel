// Aufgabenliste (Fenster „Aufgaben“): Was ist erledigt, was kommt als Nächstes?

import { KAMMERN } from "../inhalte/lythara_kammern.js";

export function ziele(z) {
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

  liste.push({ text: "Geh durch die Siegeltür und sprich in den Kammern der Stimmen mit Lyra.", erledigt: e("lythara_turm_intro") });
  for (const q of KAMMERN) {
    const boss = e(`lythara_${q.id}_boss`);
    const kristalle = q.stationen.filter((s) => e(s.id)).length;
    liste.push({
      text: `${q.kammer} – ${q.lernziel} (Kristalle ${kristalle}/3 · Text am Pult ${e(q.text.id) ? "✔" : "–"} · Wächter: ${q.waechter.name})`,
      erledigt: boss,
    });
    if (!boss) return liste;
  }
  liste.push({ text: "Schreibe deinen ganzen Forumsbeitrag in das Buch der Stimmen.", erledigt: e("lythara_buch") });
  liste.push({ text: "Sprich ein letztes Mal mit Meisterin Lyra.", erledigt: e("lythara_finale") });
  return liste;
}
