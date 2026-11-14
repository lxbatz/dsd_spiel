// Sprungpunkte für Lehrkräfte: Mit einem Sprungcode (siehe codes.js) springt man direkt an
// eine Stelle im Spiel, ohne vorher alle Aufgaben zu lösen. Der Spielstand wird dabei so
// gesetzt, als wäre alles davor erledigt (XP, Gegenstände, Beispieltexte) und als
// „Testspielstand“ markiert – das Lehrerzimmer zeigt ihn mit 🧪 an.

import { INSELN } from "./lythara_inseln.js";

// Fortschritt in Spielreihenfolge: [Markierung, XP, Gegenstand]
const SCHRITTE = [
  ["dorf_heldenpass", 50, "heldenpass"],
  ["dorf_wilma", 50, "amulett_wortschaetze"],
  ["dorf_borin", 50],
  ["dorf_brett", 50],
  ["dorf_abschluss", 0, "bronze_abzeichen"],
  ["lythara_intro", 0, "spiegel_nachricht"],
  ["lythara_tor1", 20], ["lythara_tor2", 20], ["lythara_tor3", 20], ["lythara_tor4", 20], ["lythara_tor5", 20],
  ["lythara_einleitung", 25],
  ["lythara_q1_boss", 150, "rolle_beobachter"],
  ["lythara_q1_abschluss", 0],
  ["lythara_turm_intro", 0],
  ...INSELN.flatMap((q) => [
    [`lythara_${q.id}_intro`, 0],
    ...q.stationen.map((s) => [s.id, 20]),
    [q.text.id, 25],
    [`lythara_${q.id}_boss`, 150, q.rolle],
  ]),
  ["lythara_buch", 200, "buch_der_stimmen"],
  ["lythara_finale", 0, "silber_abzeichen"],
  ["aurelia_intro", 0],
  ["aurelia_q1_start", 0],
  ["aurelia_q1_m1", 20], ["aurelia_q1_m2", 20], ["aurelia_q1_m3", 20],
  ["aurelia_q1_reisende", 0],
  ["aurelia_q1", 150, "ton_hafen"],
  ["aurelia_q1_orpheon", 0],
  ["aurelia_q2_start", 0],
  ["aurelia_q2_g1", 25], ["aurelia_q2_g2", 25], ["aurelia_q2_g3", 25],
  ["aurelia_q2_ohrenprobe", 0],
  ["aurelia_q2", 150, "ton_markt"],
  ["aurelia_q2_orpheon", 0],
  ["aurelia_q3_start", 0],
  ["aurelia_q3_p1", 25], ["aurelia_q3_p2", 25], ["aurelia_q3_p3", 25],
  ["aurelia_q3_notizbuch", 0],
  ["aurelia_q3", 150, "ton_leuchtturm"],
  ["aurelia_q3_orpheon", 0],
  ["aurelia_q4_start", 0],
  ["aurelia_q4_w1", 25], ["aurelia_q4_w2", 25], ["aurelia_q4_w3", 25],
  ["aurelia_q4_abnahme", 0],
  ["aurelia_q4", 150, "ton_werft"],
  ["aurelia_q4_orpheon", 0],
  ["aurelia_q5_start", 0],
  ["aurelia_q5_s1", 25], ["aurelia_q5_s2", 25],
  ["aurelia_q5_boss", 200, "ton_turm"],
  ["aurelia_q5", 0],
  ["aurelia_finale", 250, "gold_abzeichen"],
  ["scriptoria_intro", 0],
  ["scriptoria_q1_start", 0],
  ["scriptoria_q1", 150, "seite_briefe"],
  ["scriptoria_q2_start", 0],
  ["scriptoria_q2", 150, "seite_berichte"],
  ["scriptoria_q3_start", 0],
  ["scriptoria_q3_a1", 25], ["scriptoria_q3_a2", 25],
  ["scriptoria_q3_probe", 0],
  ["scriptoria_q3", 150, "seite_regeln"],
  ["scriptoria_q4_start", 0],
  ["scriptoria_q4_t1", 25], ["scriptoria_q4_t2", 25],
  ["scriptoria_q4", 150, "seite_hinweise"],
];

/** Beispieltexte für die freien Texte, damit spätere Stellen (z. B. das Buch der Stimmen) etwas zeigen. */
export const BEISPIELTEXTE = {
  dorf_vorstellung: "Hallo! Ich heiße Mira. Ich bin 16 Jahre alt. Ich komme aus Polen und wohne jetzt in Köln. Ich spreche Polnisch, Englisch und ein bisschen Deutsch. In meiner Freizeit spiele ich gern Fußball. Später möchte ich Mechatronikerin werden.",
  lythara_einleitung: "Praktikum im Ausland – ja oder nein?\nHallo zusammen,\nich habe im Forum des Magazins „Startklar“ einen Beitrag von Jonas gelesen. In dem Beitrag geht es um ein Praktikum im Ausland. Das Thema interessiert mich, weil ich nächstes Jahr selbst ein Praktikum mache. Habt ihr schon Erfahrungen? Dann lest weiter!",
  lythara_q2_text: "Nun möchte ich den Beitrag kurz zusammenfassen. Der Text stammt von Jonas, einem 17-jährigen Auszubildenden, der Koch wird. Er berichtet, dass er vier Wochen in einem Hotel in Wien gearbeitet hat. Am Anfang war es schwierig für ihn, weil er dort niemanden kannte. Später hat er Freunde gefunden und viel gelernt. Jonas ist der Meinung, dass alle Azubis ins Ausland gehen sollten. Zum Schluss bittet er die Leser, ihre Meinung zu schreiben.",
  lythara_q3_text: "Jetzt möchte ich von meinen eigenen Erfahrungen berichten. Genauso wie Jonas war ich schon im Ausland. Letzten Sommer habe ich drei Wochen in einer Bäckerei in Polen gearbeitet. Am Anfang war ich sehr nervös, weil ich die Sprache nicht gut konnte. Dann haben mir die Kollegen alles erklärt. Danach hat mir die Arbeit viel Spaß gemacht. Schließlich habe ich sogar ein paar Rezepte gelernt.",
  lythara_q4_text: "Nach meinen Erfahrungen bin ich der Meinung, dass ein Praktikum im Ausland für alle Azubis sinnvoll ist. Zuerst lernt man eine neue Sprache, weil man jeden Tag mit Kollegen sprechen muss. Außerdem wird man selbstständiger. Zum Beispiel muss man allein einkaufen und kochen. Ein weiterer Punkt ist, dass Firmen Auslandserfahrung gut finden. Ein Praktikum ist zwar teuer, aber es lohnt sich. Deshalb finde ich, dass jeder Azubi diese Chance nutzen sollte.",
  lythara_q5_text: "Aus diesen Gründen bin ich für ein Praktikum im Ausland. Ich hoffe, euch hat mein Beitrag gefallen. Was meint ihr? Ich bin gespannt auf eure Antworten!\nViele Grüße\nMira",
};
BEISPIELTEXTE.lythara_buch = ["lythara_einleitung", "lythara_q2_text", "lythara_q3_text", "lythara_q4_text", "lythara_q5_text"].map((id) => BEISPIELTEXTE[id]).join("\n\n");

// Welcher Text gehört zu welcher Markierung?
const TEXT_ZU = { dorf_heldenpass: "dorf_vorstellung", lythara_einleitung: "lythara_einleitung", lythara_buch: "lythara_buch" };
for (const q of INSELN) TEXT_ZU[q.text.id] = q.text.id;

/**
 * Die Sprungpunkte. bis: letzte Markierung, die schon erledigt ist (null = nichts erledigt).
 */
export const SPRUNGPUNKTE = [
  { id: "dorf", name: "Dorf: Anfang (Heldenpass bei Aldric)", bis: null, karte: "dorf", spawn: "start" },
  { id: "dorf_quests", name: "Dorf: Heldenpass fertig, Wilma, Borin und Brett offen", bis: "dorf_heldenpass", karte: "dorf", spawn: "start" },
  { id: "dorf_ende", name: "Dorf: alle Quests gelöst, zurück zu Aldric", bis: "dorf_brett", karte: "dorf", spawn: "start" },
  { id: "halle", name: "Lythara: Halle der Tausend Tore, Begrüßung durch Lyra", bis: "dorf_abschluss", karte: "halle", spawn: "eingang" },
  { id: "halle_tore", name: "Halle: die fünf Tore", bis: "lythara_intro", karte: "halle", spawn: "eingang" },
  { id: "halle_pult", name: "Halle: alle Tore offen, Pult des Beobachters", bis: "lythara_tor5", karte: "halle", spawn: "pult" },
  { id: "halle_boss", name: "Halle: vor dem Torwächter der Quellen", bis: "lythara_einleitung", karte: "halle", spawn: "torwaechter" },
  { id: "dorf_neben", name: "Dorf: Nebenquests (nach Quest 1, Finn, Wilma, Borin)", bis: "lythara_q1_boss", karte: "dorf", spawn: "vonLythara" },
  { id: "kammern", name: "Inseln der Stimmen: Ankunft (Lyra)", bis: "lythara_q1_abschluss", karte: "turm", spawn: "eingang" },
  ...INSELN.flatMap((q, i) => [
    { id: `${q.id}_anfang`, name: `${q.insel}: Anfang (${q.lernziel})`, bis: i === 0 ? "lythara_turm_intro" : `lythara_${INSELN[i - 1].id}_boss`, karte: "turm", spawn: q.id },
    { id: `${q.id}_waechter`, name: `${q.insel}: vor dem Wächter (${q.waechter.name})`, bis: q.text.id, karte: "turm", spawn: `${q.id}_waechter` },
  ]),
  { id: "buch", name: "Das Buch der Stimmen (Finale)", bis: "lythara_q5_boss", karte: "turm", spawn: "buch" },
  { id: "ende", name: "Lythara gerettet (Ende von Lythara)", bis: "lythara_finale", karte: "turm", spawn: "eingang" },
  { id: "aurelia", name: "Aurelia: Ankunft am Stadttor (Orpheon)", bis: "lythara_finale", karte: "aurelia", spawn: "eingang" },
  { id: "aurelia_q1", name: "Aurelia: Hafen, Rufmuscheln (Quest 1)", bis: "aurelia_q1_start", karte: "aurelia", spawn: "hafen" },
  { id: "aurelia_q1_ende", name: "Aurelia: Rufmuscheln gehört, Reisende beraten", bis: "aurelia_q1_m3", karte: "aurelia", spawn: "hafen" },
  { id: "aurelia_q2", name: "Aurelia: Agora, Gespräche am Markt (Quest 2)", bis: "aurelia_q1_orpheon", karte: "aurelia", spawn: "markt" },
  { id: "aurelia_q2_ende", name: "Aurelia: Gespräche gehört, Ohrenprobe bei Ione", bis: "aurelia_q2_g3", karte: "aurelia", spawn: "markt" },
  { id: "aurelia_q3", name: "Aurelia: Leuchtturm, Talos und die Klangperlen (Quest 3)", bis: "aurelia_q2_orpheon", karte: "aurelia", spawn: "leuchtturm" },
  { id: "aurelia_q3_ende", name: "Aurelia: Perlen gefunden, Talos' Notizbuch", bis: "aurelia_q3_p3", karte: "aurelia", spawn: "leuchtturm" },
  { id: "aurelia_q4", name: "Aurelia: Werft, Kassia, Timon und Daria (Quest 4)", bis: "aurelia_q3_orpheon", karte: "aurelia", spawn: "werft" },
  { id: "aurelia_q4_ende", name: "Aurelia: Werft, Abnahme im Prüfungsmodus", bis: "aurelia_q4_w3", karte: "aurelia", spawn: "werft" },
  { id: "aurelia_q5", name: "Aurelia: Glockenturm, Stimmenmuscheln (Quest 5)", bis: "aurelia_q5_start", karte: "aurelia", spawn: "turm" },
  { id: "aurelia_drache", name: "Aurelia: vor dem Drachenrichter (Endkampf)", bis: "aurelia_q5_s2", karte: "aurelia", spawn: "turm" },
  { id: "aurelia_ende", name: "Aurelia gerettet (Ende von Aurelia)", bis: "aurelia_finale", karte: "aurelia", spawn: "turm" },
  { id: "scriptoria", name: "Scriptoria: Ankunft im Bücherwald (Lirien)", bis: "aurelia_finale", karte: "scriptoria", spawn: "eingang" },
  { id: "scriptoria_q1", name: "Scriptoria: Briefbaum, die verlorenen Wörter (Quest 1)", bis: "scriptoria_q1_start", karte: "scriptoria", spawn: "west" },
  { id: "scriptoria_q2", name: "Scriptoria: Lesekreis bei Mara (Quest 2)", bis: "scriptoria_q1", karte: "scriptoria", spawn: "nordwest" },
  { id: "scriptoria_q3", name: "Scriptoria: Nachtpfad bei Vesna (Quest 3)", bis: "scriptoria_q2", karte: "scriptoria", spawn: "ost" },
  { id: "scriptoria_q3_ende", name: "Scriptoria: Aushänge gelesen, Laternenprobe", bis: "scriptoria_q3_a2", karte: "scriptoria", spawn: "ost" },
  { id: "scriptoria_q4", name: "Scriptoria: Lehrlingshaus bei Corvin (Quest 4)", bis: "scriptoria_q3", karte: "scriptoria", spawn: "nordost" },
];

const TESTHELD = {
  name: "Testheld", alter: "16", land: "Deutschland", wohnort: "Köln", sprachen: "Deutsch, Englisch",
  hobbys: "Lesen", beruf: "Lehrer", klasse: "magier", kennung: "TEST",
};

/**
 * Baut den Spielstand für einen Sprungpunkt. alt: bisheriger Spielstand (Held, Spieler-ID und Statistik bleiben).
 */
export function sprungZustand(punkt, alt) {
  const ende = punkt.bis ? SCHRITTE.findIndex(([id]) => id === punkt.bis) : -1;
  if (punkt.bis && ende < 0) throw new Error(`Unbekannte Markierung: ${punkt.bis}`);
  const jetzt = new Date().toISOString();
  const erledigt = {}, texte = {}, gegenstaende = [];
  let xp = 0;
  for (const [id, punkte, gegenstand] of SCHRITTE.slice(0, ende + 1)) {
    erledigt[id] = true;
    xp += punkte;
    if (gegenstand && !gegenstaende.includes(gegenstand)) gegenstaende.push(gegenstand);
    const t = TEXT_ZU[id];
    if (t) texte[t] = alt.texte?.[t] ?? { text: BEISPIELTEXTE[t], datum: jetzt };
  }
  return {
    ...alt,
    held: punkt.bis ? (alt.held ?? { ...TESTHELD }) : alt.held,
    xp,
    gegenstaende,
    erledigt,
    texte,
    ort: { karte: punkt.karte, spawn: punkt.spawn },
    protokoll: [...(alt.protokoll ?? []), { xp: 0, grund: `Sprungcode: ${punkt.name}`, datum: jetzt }],
    testmodus: true,
  };
}
