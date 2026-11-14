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
  if (!e("aurelia_q3")) return liste;
  const werft = ["aurelia_q4_w1", "aurelia_q4_w2", "aurelia_q4_w3"].filter(e).length;
  liste.push({ text: `Die Werft: Hör an der Werkbank, bei Timon und bei Daria zu (${werft}/3) und besteh die Abnahme bei Werftmeisterin Kassia.`, erledigt: e("aurelia_q4") });
  if (!e("aurelia_q4")) return liste;
  const stimmen = ["aurelia_q5_s1", "aurelia_q5_s2"].filter(e).length;
  liste.push({ text: `Der Glockenturm: Hör die Stimmenmuscheln auf der Akropolis an (${stimmen}/2) und besiege den Drachenrichter.`, erledigt: e("aurelia_q5_boss") });
  if (e("aurelia_finale")) liste.push({ text: "Aurelia ist gerettet! Die große Glocke klingt wieder.", erledigt: true });
  if (!e("aurelia_finale")) return liste;
  // Scriptoria – Reich des Lesens
  liste.push({ text: "Reise durch das Portal im Dorf nach Scriptoria und sprich mit Lirien am Großen Lesebaum.", erledigt: e("scriptoria_intro") });
  liste.push({ text: "Die verlorenen Wörter: Repariere mit Bote Fennick die Briefe am Briefbaum (Westen).", erledigt: e("scriptoria_q1") });
  if (e("scriptoria_q1")) liste.push({ text: "Der Lesekreis: Ordne mit Mara die Berichte im Gästebuch (Nordwesten).", erledigt: e("scriptoria_q2") });
  if (!e("scriptoria_q2")) return liste;
  const aushaenge = ["scriptoria_q3_a1", "scriptoria_q3_a2"].filter(e).length;
  liste.push({ text: `Der Nachtpfad: Lies die Aushänge im Osten (${aushaenge}/2) und besteh Vesnas Laternenprobe.`, erledigt: e("scriptoria_q3") });
  if (!e("scriptoria_q3")) return liste;
  const texte = ["scriptoria_q4_t1", "scriptoria_q4_t2"].filter(e).length;
  liste.push({ text: `Das Lehrlingshaus: Lies den Text am Schwarzen Brett und Ilkas Praktikumsunterlagen (${texte}/2) und sprich dann mit Ausbilder Corvin.`, erledigt: e("scriptoria_q4") });
  if (!e("scriptoria_q4")) return liste;
  const schilder = ["scriptoria_q5_w1", "scriptoria_q5_w2"].filter(e).length;
  liste.push({ text: `Die Wegweiser: Ordne an der Kreuzung im Norden die Schilder und die Kurstafel (${schilder}/2).`, erledigt: e("scriptoria_q5") });
  if (!e("scriptoria_q5")) return liste;
  liste.push({ text: "Besiege den Bibliothekar der Schatten vor dem Tor zur unterirdischen Bibliothek.", erledigt: e("scriptoria_boss") });
  if (e("scriptoria_finale")) liste.push({ text: "Scriptoria ist gerettet! Der Schwarze Nebel ist fort.", erledigt: true });
  if (!e("scriptoria_finale")) return liste;
  // Vocantia – Reich des Sprechens (Reihenfolge der fünf Bewohner frei)
  liste.push({ text: "Reise durch das Portal im Dorf nach Vocantia und sprich mit Großmutter Runa am gefrorenen Brunnen.", erledigt: e("vocantia_intro") });
  if (!e("vocantia_intro")) return liste;
  for (const [id, text] of [
    ["vocantia_q1", "Erste Worte: Sprich für Hirte Eik auf der Weide (Südwesten)."],
    ["vocantia_q2", "Der Markt der Rollen: Sprich für Händlerin Brynja am Marktstand."],
    ["vocantia_q3", "Die Halle der Dinge: Sprich für Schmied Torvald vor der Langhalle (Westen)."],
    ["vocantia_q4", "Die Ratsrunde: Sprich für Ratsältesten Halvar am Ratshaus (Nordosten)."],
    ["vocantia_q5", "Die Bühne am See: Sprich für Spielleiterin Sigrun an der Bühne (Südosten)."],
  ]) liste.push({ text, erledigt: e(id) });
  if (!["vocantia_q1", "vocantia_q2", "vocantia_q3", "vocantia_q4", "vocantia_q5"].every(e)) return liste;
  liste.push({ text: "Hol dir das Sprechsiegel: einen Code von deiner Lehrkraft für eine mündliche Leistung im Unterricht.", erledigt: (z.gegenstaende ?? []).includes("sprechsiegel") });
  liste.push({ text: "Steig den Bergpfad hinauf und besiege den Schweigekönig auf dem Plateau.", erledigt: e("vocantia_boss") });
  if (e("vocantia_finale")) liste.push({ text: "Vocantia ist gerettet! Das Tal taut auf und blüht.", erledigt: true });
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
