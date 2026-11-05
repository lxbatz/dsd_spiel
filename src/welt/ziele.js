// Aufgabenliste (Fenster „Aufgaben“): Was ist erledigt, was kommt als Nächstes?

export function ziele(z) {
  const e = (id) => Boolean(z.erledigt[id]);
  const tore = ["tor1", "tor2", "tor3", "tor4", "tor5"].filter((t) => e(`lythara_${t}`)).length;
  return [
    { text: "Sprich mit dem Ratsältesten Aldric und fülle deinen Heldenpass aus.", erledigt: e("dorf_heldenpass") },
    { text: "Hilf Händlerin Wilma am Markt (Fragen stellen).", erledigt: e("dorf_wilma") },
    { text: "Hilf Schmied Borin (Personen beschreiben).", erledigt: e("dorf_borin") },
    { text: "Lies das Schwarze Brett am Brunnen.", erledigt: e("dorf_brett") },
    { text: "Kehre zu Aldric zurück.", erledigt: e("dorf_abschluss") },
    { text: "Reise durch das Portal nach Lythara und sprich mit Meisterin Lyra.", erledigt: e("lythara_intro") },
    { text: `Öffne die fünf Tore der Halle (${tore}/5).`, erledigt: tore === 5 },
    { text: "Schreibe am Pult des Beobachters deine eigene Einleitung.", erledigt: e("lythara_einleitung") },
    { text: "Besiege den Torwächter der Quellen.", erledigt: e("lythara_q1_boss") },
    { text: "Quest 2: Die Schriftrolle des Chronisten (kommt bald)", erledigt: false },
  ];
}
