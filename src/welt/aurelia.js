// Aurelia – die Hafenstadt der Glocken (Reich des Hörens, nur 3D)
// Seit Morgraths Fluch schweigen die Glocken, und niemand versteht mehr, was die anderen sagen.
// Quest 1: Die Stimmen des Hafens (Durchsagen) bei Hafenmeisterin Nerea.
// Quest 2: Gespräche am Markt (Alltagsgespräche) bei Marktaufseherin Ione und drei Händlern.
// Quest 3: Das Licht des Leuchtturms (Telefonnachrichten) bei Leuchtturmwärter Talos.
// Quest 4: Die Werft (Gespräche am Arbeitsplatz, Interview, Bericht – genau nach DSD Hören Teil 1, 3, 4)
//          bei Werftmeisterin Kassia, Azubi Timon und Bootsbauerin Daria; Abnahme im Prüfungsmodus.
// Quest 5 und der Drachenrichter folgen; ihre Orte sind schon da.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";
import { questStarten } from "./quest.js";
import { belohnung } from "../ui/belohnung.js";
import { bild } from "../ui/bilder.js";
import { zustand, istErledigt, erledigen } from "../zustand.js";
import { MUSCHELN, REISENDE } from "../inhalte/aurelia_q1.js";
import { GESPRAECHE, OHRENPROBE } from "../inhalte/aurelia_q2.js";
import { PERLEN, NOTIZBUCH } from "../inhalte/aurelia_q3.js";
import { WERKBANK, INTERVIEW_AUFGABEN, BERICHT_AUFGABEN, ABNAHME } from "../inhalte/aurelia_q4.js";
import { RASTER, KAI_Y } from "./aurelia_layout.js";

const ORPHEON = "Orpheon, der Glockenhüter";
const NEREA = "Hafenmeisterin Nerea";
const IONE = "Marktaufseherin Ione";
const TALOS = "Leuchtturmwärter Talos";
const KASSIA = "Werftmeisterin Kassia";
const TIMON = "Azubi Timon";
const DARIA = "Bootsbauerin Daria";

const muschelnFertig = (z = zustand) => MUSCHELN.every((m) => z.erledigt[m.id]);
const gespraecheFertig = (z = zustand) => GESPRAECHE.every((g) => z.erledigt[g.id]);
const perlenFertig = (z = zustand) => PERLEN.every((p) => z.erledigt[p.id]);
const WERFT_STATIONEN = ["aurelia_q4_w1", "aurelia_q4_w2", "aurelia_q4_w3"];
const werftFertig = (z = zustand) => WERFT_STATIONEN.every((k) => z.erledigt[k]);

async function orpheon() {
  const B = bild("npc_orpheon");
  const name = zustand.held?.name ?? "Fremde";
  if (!istErledigt("aurelia_intro")) {
    await dialog(ORPHEON, [
      `Sei gegrüßt, ${name}! Willkommen in Aurelia, der Stadt der Glocken. Ich bin Orpheon, der Glockenhüter.`,
      "Früher hörte man hier überall Musik: Die Glocken läuteten, die Händler riefen, die Seeleute sangen. Aurelia ist das Reich des Hörens.",
      "Doch Morgrath hat die große Glocke oben auf dem Turm zum Schweigen gebracht. Seitdem hören die Menschen nicht mehr richtig zu. Sie verstehen Durchsagen, Nachrichten und Gespräche nicht mehr.",
      "Jeder Teil der Stadt hat einen eigenen Ton: der Hafen, der Markt, der Leuchtturm, die Werft und der Turm. Bring die Töne zurück, dann klingt die Glocke wieder.",
      "Beginne am Hafen im Süden. Hafenmeisterin Nerea braucht dringend jemanden, der gut zuhören kann!",
    ], B);
    erledigen("aurelia_intro");
    return;
  }
  if (istErledigt("aurelia_q4")) {
    for (const k of ["aurelia_q1_orpheon", "aurelia_q2_orpheon", "aurelia_q3_orpheon", "aurelia_q4_orpheon"]) erledigen(k);
    await dialog(ORPHEON, [
      "Das Festschiff liegt fertig im Wasser! Vier Töne sind zurück: Hafen, Markt, Leuchtturm und Werft.",
      "Jetzt fehlt nur noch der Ton des Turms. Aber oben wartet etwas Großes … Ich höre es jede Nacht grollen. (Quest 5 und der Endkampf kommen bald.)",
    ], B);
    return;
  }
  if (istErledigt("aurelia_q3")) {
    for (const k of ["aurelia_q1_orpheon", "aurelia_q2_orpheon", "aurelia_q3_orpheon"]) erledigen(k);
    await dialog(ORPHEON, [
      "Sieh nur, der Leuchtturm strahlt wieder über das Meer! Drei Töne sind zurück: Hafen, Markt und Leuchtturm.",
      "Geh jetzt zur Werft im Westen, gleich am Kai. Werftmeisterin Kassia baut das Festschiff für das Glockenfest – aber auf der Werft versteht keiner mehr den anderen.",
    ], B);
    return;
  }
  if (istErledigt("aurelia_q2")) {
    erledigen("aurelia_q1_orpheon");
    erledigen("aurelia_q2_orpheon");
    await dialog(ORPHEON, [
      "Zwei Töne! Der Hafen und der Markt klingen wieder. Hörst du, wie die Leute auf der Agora wieder miteinander reden?",
      "Jetzt brauchst du gute Ohren am Leuchtturm im Osten. Der alte Talos hört sein Muschelfon nicht mehr – und heute Nacht kommt ein Sturm!",
    ], B);
    return;
  }
  if (istErledigt("aurelia_q1")) {
    erledigen("aurelia_q1_orpheon");
    await dialog(ORPHEON, [
      "Hörst du das? Ein leiser Ton schwebt über der Stadt. Der Ton des Hafens ist zurück!",
      "Jetzt geh auf die Agora, den Marktplatz in der Mitte der Stadt. Dort reden alle durcheinander, und keiner versteht den anderen. Marktaufseherin Ione braucht deine Hilfe.",
    ], B);
    return;
  }
  await dialog(ORPHEON, "Geh zum Hafen im Süden. Nerea wartet am Kai auf dich.", B);
}

async function nerea() {
  const B = bild("npc_nerea");
  if (!istErledigt("aurelia_intro")) {
    await dialog(NEREA, "Ahoi! Bist du neu hier? Sprich zuerst mit Orpheon am Stadttor.", B);
    return;
  }
  if (!istErledigt("aurelia_q1_start")) {
    await dialog(NEREA, [
      "Ahoi! Ich bin Nerea, die Hafenmeisterin. Gut, dass du kommst – hier ist das reine Chaos!",
      "Die Rufmuscheln am Kai machen jeden Tag Durchsagen: Fähren, Ausflüge, Fundsachen, Wetter. Aber seit die Glocke schweigt, hört niemand mehr zu!",
      "Die Reisenden laufen zum falschen Steg, verpassen ihre Fähre und verlieren ihre Sachen.",
      "Hör dir die drei Rufmuscheln am Kai an und merk dir alles genau. Dann komm zurück und hilf mir mit den Reisenden.",
      "Ein Tipp: Bei Durchsagen kommt es auf Details an – Uhrzeiten, Zahlen, Orte. Und pass auf, wenn sich etwas ändert!",
    ], B);
    erledigen("aurelia_q1_start");
    return;
  }
  if (istErledigt("aurelia_q1")) {
    await dialog(NEREA, "Die Fähren fahren pünktlich vom richtigen Steg, und keiner verliert mehr seinen Rucksack. Danke! Du hast wirklich gute Ohren.", B);
    return;
  }
  if (!muschelnFertig()) {
    const fehlen = MUSCHELN.filter((m) => !istErledigt(m.id)).length;
    await dialog(NEREA, `Du musst noch ${fehlen === 1 ? "eine Rufmuschel" : `${fehlen} Rufmuscheln`} anhören. Sie stehen am Kai bei den Stegen.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: NEREA, bild: B,
    frageText: "Du hast alle Durchsagen gehört? Sehr gut! Da kommen schon die ersten Reisenden mit Fragen. Hilfst du ihnen? Du darfst die Durchsagen noch einmal anhören.",
    ja: "Ja, ich helfe den Reisenden!",
    spaeter: "In Ordnung, aber beeil dich – die Fähre wartet nicht!",
    folge: { id: "aurelia_q1_reisende", titel: "Quest: Die Stimmen des Hafens", untertitel: "Reisende beraten", aufgaben: REISENDE },
  });
  if (!geschafft) return;
  erledigen("aurelia_q1_reisende");
  erledigen("aurelia_q1");
  await dialog(NEREA, [
    "Alle haben dich verstanden – und du hast alle verstanden! So muss ein Hafen klingen.",
    "Hör mal … Vom Turm kommt ein Ton! Das ist der Ton des Hafens. Er gehört jetzt dir.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Die Stimmen des Hafens", gegenstaende: ["ton_hafen"], fanfare: true });
}

function muschelAktion(m) {
  return async () => {
    if (!istErledigt("aurelia_q1_start")) {
      await dialog(m.name, "Eine große Muschel auf einem Pfosten. Sie rauscht leise wie das Meer. Sprich zuerst mit Hafenmeisterin Nerea am Kai.");
      return;
    }
    if (istErledigt(m.id)) {
      const nochmal = await frage(m.name, "Diese Durchsagen hast du schon gehört. Möchtest du noch einmal üben?", ["Ja, noch einmal", "Nein"]);
      if (nochmal === 0) await aufgabenFolge({ id: m.id, titel: m.name, untertitel: "Durchsagen verstehen", aufgaben: m.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: m.name,
      frageText: `Die Muschel rauscht, dann hörst du einen Gong.\n„${m.inschrift}“\n\nMöchtest du die Durchsagen jetzt anhören?`,
      ja: "Ja, anhören",
      spaeter: "Die Muschel rauscht weiter.",
      folge: { id: m.id, titel: m.name, untertitel: "Durchsagen verstehen · Klicke auf „Anhören“", aufgaben: m.aufgaben },
    });
    if (!geschafft) return;
    erledigen(m.id);
    await belohnung({ xp: 20, grund: `${m.name}: Durchsagen verstanden!`, fanfare: true });
  };
}

// ---------- Quest 2: Gespräche am Markt ----------

async function ione() {
  const B = bild("npc_ione");
  if (!istErledigt("aurelia_q1")) {
    await dialog(IONE, "Ich bin Ione, die Aufseherin über den Markt. Heute ist hier zu viel los! Komm später wieder – zuerst braucht dich Nerea am Hafen.", B);
    return;
  }
  if (!istErledigt("aurelia_q2_start")) {
    await dialog(IONE, [
      "Endlich jemand mit guten Ohren! Ich bin Ione, die Marktaufseherin. Auf der Agora ist das Chaos ausgebrochen.",
      "Die Händler reden mit ihren Kunden, aber hinterher weiß keiner mehr, was eigentlich ausgemacht war: Wer wollte was? Wie viel? Wann?",
      "Geh zu den drei Ständen: Daphne mit dem Obst, Ilias mit dem Fisch und Kleon, der Töpfer. Hör dir die Gespräche an und hilf ihnen.",
      "Ein Tipp: In Gesprächen ändern die Leute oft ihre Meinung. Hör bis zum Ende zu – das Ende ist oft das Wichtigste!",
    ], B);
    erledigen("aurelia_q2_start");
    return;
  }
  if (istErledigt("aurelia_q2")) {
    await dialog(IONE, "Hör nur, wie friedlich der Markt jetzt klingt! Alle verstehen sich wieder. Danke!", B);
    return;
  }
  if (!gespraecheFertig()) {
    const offen = GESPRAECHE.filter((g) => !istErledigt(g.id)).map((g) => g.name);
    await dialog(IONE, `Du musst noch bei ${offen.join(" und ")} zuhören.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: IONE, bild: B,
    frageText: "Alle drei Händler sind zufrieden! Jetzt die Ohrenprobe: Ich spiele dir kurze Gespräche vor. Erkennst du, wo die Leute sind?",
    ja: "Ja, ich mache die Ohrenprobe!",
    spaeter: "Gut, komm wieder, wenn du bereit bist.",
    folge: { id: "aurelia_q2_ohrenprobe", titel: "Quest: Gespräche am Markt", untertitel: "Die Ohrenprobe · Wo sind die Personen?", aufgaben: OHRENPROBE },
  });
  if (!geschafft) return;
  erledigen("aurelia_q2_ohrenprobe");
  erledigen("aurelia_q2");
  await dialog(IONE, [
    "Ausgezeichnet! Du hörst nicht nur die Wörter, du verstehst die ganze Situation.",
    "Hörst du das? Der Brunnen singt wieder! Das ist der Ton des Markts. Er gehört jetzt dir.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Gespräche am Markt", gegenstaende: ["ton_markt"], fanfare: true });
}

function haendlerAktion(g) {
  return async () => {
    const B = bild(g.haendler);
    if (!istErledigt("aurelia_q2_start")) {
      await dialog(g.name, "Feigen! Fisch! Vasen! … Entschuldigung, ich habe gerade keine Zeit. Frag Marktaufseherin Ione, sie steht beim Brunnen.", B);
      return;
    }
    if (istErledigt(g.id)) {
      const nochmal = await frage(g.name, `${g.danach}\n\nMöchtest du das Gespräch noch einmal üben?`, ["Ja, noch einmal", "Nein"], B);
      if (nochmal === 0) await aufgabenFolge({ id: g.id, titel: g.titel, untertitel: "Gespräche verstehen", aufgaben: g.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: g.name, bild: B,
      frageText: `${g.einleitung}\n\nMöchtest du das Gespräch anhören?`,
      ja: "Ja, ich höre zu",
      spaeter: "Na gut, dann später.",
      folge: { id: g.id, titel: `${g.titel} – ${g.name}`, untertitel: "Gespräche verstehen · Klicke auf „Anhören“", aufgaben: g.aufgaben },
    });
    if (!geschafft) return;
    erledigen(g.id);
    await dialog(g.name, g.danach, B);
    await belohnung({ xp: 25, grund: `${g.name}: Gespräch verstanden!`, fanfare: true });
  };
}

// ---------- Quest 3: Das Licht des Leuchtturms ----------

async function talos() {
  const B = bild("npc_talos");
  if (!istErledigt("aurelia_q2")) {
    await dialog(TALOS, "Hm? Was? Sprich lauter, ich höre nichts mehr, seit die Glocke schweigt … Komm später wieder, junger Mensch.", B);
    return;
  }
  if (!istErledigt("aurelia_q3_start")) {
    await dialog(TALOS, [
      "Ah, endlich Besuch! Ich bin Talos, der Wärter des Leuchtturms. Seit vierzig Jahren mache ich jeden Abend das Licht an.",
      "Das Muschelfon hier speichert alle Nachrichten, die die Leute mir schicken – in kleinen Klangperlen. Aber letzte Nacht hat der Wind die Perlen herausgeweht!",
      "Und meine Ohren … seit die Glocke schweigt, höre ich nur noch Rauschen. Die Nachrichten sind bestimmt wichtig.",
      "Such die drei Klangperlen und hör dir die Nachrichten an. Eine liegt hier auf der Landzunge, eine am Kai bei Steg 5 und eine ist bis zur Stadtmauer im Nordosten geflogen.",
      "Merk dir alles gut: Wer ruft an? Was will die Person? Was soll ich tun? Und schreib dir Zahlen und Zeiten auf!",
    ], B);
    erledigen("aurelia_q3_start");
    return;
  }
  if (istErledigt("aurelia_q3")) {
    await dialog(TALOS, "Das Licht brennt, Ilias ist sicher im Hafen, und am Samstag hole ich Leni ab. Danke, mein Freund – du hast die besten Ohren von Aurelia!", B);
    return;
  }
  if (!perlenFertig()) {
    const fehlen = PERLEN.filter((p) => !istErledigt(p.id)).length;
    await dialog(TALOS, `Es fehlen noch ${fehlen === 1 ? "eine Klangperle" : `${fehlen} Klangperlen`}. Eine liegt auf der Landzunge, eine am Kai bei Steg 5, eine bei der Stadtmauer im Nordosten.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: TALOS, bild: B,
    frageText: "Du hast alle Perlen! Hilfst du mir mit meinem Notizbuch? Ich muss wissen, was ich zuerst tun soll und wen ich zurückrufen muss. Du darfst die Nachrichten noch einmal anhören.",
    ja: "Ja, wir schreiben die Notizen!",
    spaeter: "Gut, aber nicht zu lange – der Sturm kommt!",
    folge: { id: "aurelia_q3_notizbuch", titel: "Quest: Das Licht des Leuchtturms", untertitel: "Talos' Notizbuch", aufgaben: NOTIZBUCH },
  });
  if (!geschafft) return;
  erledigen("aurelia_q3_notizbuch");
  erledigen("aurelia_q3");
  await dialog(TALOS, [
    "Natürlich! Zuerst das Licht – der Sturm kommt, und Ilias ist noch draußen!",
    "Talos zieht an einem großen Hebel. Oben im Turm faucht das Feuer auf, und ein heller Strahl wandert über das dunkle Meer.",
    "Hörst du den Ton? Er kommt vom Licht selbst. Das ist der Ton des Leuchtturms. Er gehört dir.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Das Licht des Leuchtturms", gegenstaende: ["ton_leuchtturm"], fanfare: true });
}

async function muschelfon() {
  if (!istErledigt("aurelia_q3_start")) {
    await dialog("Muschelfon", "Eine große Muschel auf einer Säule. Ein rotes Licht blinkt. Daneben hängt ein Hörrohr aus Messing.");
    return;
  }
  if (!perlenFertig()) {
    const n = PERLEN.filter((p) => istErledigt(p.id)).length;
    await dialog("Muschelfon", `Das rote Licht blinkt. Im Muschelfon liegen ${n} von 3 Klangperlen. Bring die fehlenden Perlen zurück!`);
    return;
  }
  await dialog("Muschelfon", "Alle drei Klangperlen sind zurück. Das Licht ist grün. Sprich mit Talos.");
}

function perleAktion(p) {
  return async () => {
    if (!istErledigt("aurelia_q3_start")) {
      await dialog(p.name, "Eine leere Muschel zwischen den Steinen. Hier ist nichts Besonderes.");
      return;
    }
    if (istErledigt(p.id)) {
      const nochmal = await frage(p.name, "Diese Klangperle hast du schon zum Muschelfon gebracht. Möchtest du die Nachrichten noch einmal üben?", ["Ja, noch einmal", "Nein"]);
      if (nochmal === 0) await aufgabenFolge({ id: p.id, titel: p.name, untertitel: "Telefonnachrichten verstehen", aufgaben: p.aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher: p.name,
      frageText: `${p.fundort} Sie summt leise. Wenn du sie ans Ohr hältst, hörst du einen Piepton …\n\nMöchtest du die Nachrichten anhören?`,
      ja: "Ja, anhören",
      spaeter: "Die Perle summt weiter.",
      folge: { id: p.id, titel: p.name, untertitel: "Telefonnachrichten verstehen · Klicke auf „Anhören“", aufgaben: p.aufgaben },
    });
    if (!geschafft) return;
    erledigen(p.id);
    await belohnung({ xp: 25, grund: `${p.name}: Nachrichten verstanden!`, fanfare: true });
  };
}

// ---------- Quest 4: Die Werft ----------

async function kassia() {
  const B = bild("npc_kassia");
  if (!istErledigt("aurelia_q3")) {
    await dialog(KASSIA, "Keine Zeit, keine Zeit! Das Festschiff muss bis zum Glockenfest fertig sein. Komm später wieder.", B);
    return;
  }
  if (!istErledigt("aurelia_q4_start")) {
    await dialog(KASSIA, [
      "Du bist also die Person mit den guten Ohren! Ich bin Kassia, die Meisterin dieser Werft.",
      "Wir bauen das Festschiff für das Glockenfest. Aber seit die Glocke schweigt, geht hier alles schief: Die Leute hören nicht richtig zu. Die Azubis holen das falsche Werkzeug, Termine werden vergessen …",
      "Hilf uns! An der Werkbank hörst du, was hier den ganzen Tag gesprochen wird. Unser neuer Azubi Timon war gestern im Radio. Und Daria, unsere beste Bootsbauerin, hat dort von ihrer Ausbildung erzählt. Sie arbeitet unten am Steg.",
      "Wenn du alles verstanden hast, mache ich mit dir die Abnahme – wie eine echte Prüfung: Jeder Text nur zweimal, und keiner flüstert dir etwas vor!",
      "Ein Tipp: Lies immer zuerst die Aufgaben. Dann weißt du, worauf du achten musst. Und oft kommt das Wichtigste erst am Ende!",
    ], B);
    erledigen("aurelia_q4_start");
    return;
  }
  if (istErledigt("aurelia_q4")) {
    await dialog(KASSIA, "Das Festschiff schwimmt! Und meine Leute hören einander wieder zu. Wenn du je eine Ausbildung suchst – auf meiner Werft ist ein Platz für dich frei.", B);
    return;
  }
  if (!werftFertig()) {
    const offen = [];
    if (!istErledigt("aurelia_q4_w1")) offen.push("an der Werkbank");
    if (!istErledigt("aurelia_q4_w2")) offen.push("bei Timon");
    if (!istErledigt("aurelia_q4_w3")) offen.push("bei Daria am Steg");
    await dialog(KASSIA, `Hör zuerst noch ${offen.join(", ").replace(/, ([^,]*)$/, " und $1")} zu. Dann machen wir die Abnahme.`, B);
    return;
  }
  const geschafft = await questStarten({
    sprecher: KASSIA, bild: B,
    frageText: "Zeit für die Abnahme! Vier kurze Gespräche aus der Werft. Wie in der Prüfung: Du hörst jedes Gespräch höchstens zweimal, und es gibt keinen Text zum Nachlesen. Bereit?",
    ja: "Ja, ich bin bereit!",
    spaeter: "Gut. Üb noch ein bisschen und komm dann zurück.",
    folge: { id: "aurelia_q4_abnahme", titel: "Quest: Die Werft", untertitel: "Die Abnahme · Prüfungsmodus: jeder Text höchstens zweimal", aufgaben: ABNAHME },
  });
  if (!geschafft) return;
  erledigen("aurelia_q4_abnahme");
  erledigen("aurelia_q4");
  await dialog(KASSIA, [
    "Bestanden! So hört eine echte Fachkraft zu.",
    "Alle Mann ans Wasser! … Das Festschiff gleitet von der Helling ins Hafenbecken. Die Leute jubeln, und über dem Wasser schwingt ein heller Ton.",
    "Das ist der Ton der Werft. Er gehört dir.",
  ], B);
  await belohnung({ xp: 150, grund: "Quest abgeschlossen: Die Werft", gegenstaende: ["ton_werft"], fanfare: true });
}

/** Station der Werft: Einleitung beim ersten Mal, danach die Aufgaben (wiederholbar) */
function werftStation({ id, sprecher, bildKey, vorher, einleitung, ja, titel, untertitel, aufgaben, danach }) {
  return async () => {
    const B = bildKey ? bild(bildKey) : undefined;
    if (!istErledigt("aurelia_q4_start")) {
      await dialog(sprecher, vorher, B);
      return;
    }
    if (istErledigt(id)) {
      const nochmal = await frage(sprecher, `${danach}\n\nMöchtest du noch einmal üben?`, ["Ja, noch einmal", "Nein"], B);
      if (nochmal === 0) await aufgabenFolge({ id, titel, untertitel, aufgaben });
      return;
    }
    const geschafft = await questStarten({
      sprecher, bild: B, frageText: einleitung, ja, spaeter: "Gut, dann später.",
      folge: { id, titel, untertitel, aufgaben },
    });
    if (!geschafft) return;
    erledigen(id);
    await dialog(sprecher, danach, B);
    await belohnung({ xp: 25, grund: `${titel}: verstanden!`, fanfare: true });
  };
}

const werkbank = werftStation({
  id: "aurelia_q4_w1", sprecher: "Werkbank",
  vorher: "Eine Werkbank voller Werkzeug. Daneben steht ein kleiner, etwas wackliger Holzhocker.",
  einleitung: "An der Werkbank hörst du, was die Leute auf der Werft den ganzen Tag sagen. Fünf kurze Szenen – zu jeder Szene gibt es eine Aufgabe. Lies zuerst die Aufgabe, dann hör zu!",
  ja: "Szenen anhören",
  titel: "An der Werkbank", untertitel: "Gespräche am Arbeitsplatz · Eine Aufgabe pro Szene",
  aufgaben: WERKBANK,
  danach: "Jetzt weißt du, was auf der Werft los ist: Werkzeug, Lieferungen, Arbeitszeiten – und wer wann was tun soll.",
});

const timon = werftStation({
  id: "aurelia_q4_w2", sprecher: TIMON, bildKey: "npc_timon",
  vorher: "Hallo! Ich bin Timon, ich bin neu hier. Hast du schon mit Kassia gesprochen? Sie ist die Chefin.",
  einleitung: "Hey! Ich war gestern im Radio, bei Radio Muschelwelle! Die haben mich über meine erste Woche hier interviewt. Willst du's hören? Lies zuerst die Sätze – dann weißt du, worauf du achten musst.",
  ja: "Interview anhören",
  titel: "Radio Muschelwelle: Interview", untertitel: "Interview · Richtig oder falsch?",
  aufgaben: INTERVIEW_AUFGABEN,
  danach: "Und? Klinge ich im Radio gut? Mein Hocker wackelt übrigens immer noch ein bisschen …",
});

const daria = werftStation({
  id: "aurelia_q4_w3", sprecher: DARIA, bildKey: "npc_daria",
  vorher: "Hallo! Ich bin Daria. Vorsicht, hier ist frische Farbe! Sprich zuerst mit Kassia, sie verteilt die Arbeit.",
  einleitung: "Ach, du bist das! Ich habe im Radio von meiner Ausbildung erzählt – Kassia hat den Bericht aufgenommen. Hör ihn dir an! Es gibt sechs Aufgaben, sie stehen alle auf einem Blatt. Lies sie zuerst.",
  ja: "Bericht anhören",
  titel: "Radio Muschelwelle: Bericht", untertitel: "Bericht · Wähle bei jeder Aufgabe die richtige Lösung",
  aufgaben: BERICHT_AUFGABEN,
  danach: "Gut zugehört! Und wer weiß – vielleicht baust du ja auch mal Schiffe.",
});

/** Orte der späteren Quests – schon zu sehen, aber noch nicht spielbar */
function spaeter(name, text) {
  return async () => dialog(name, text);
}

async function heimweg(welt) {
  const antwort = await frage("Portal", "Das Portal schimmert golden. Möchtest du ins Dorf der Ankömmlinge zurückkehren?", ["Ja, ins Dorf", "Nein, ich bleibe"]);
  if (antwort === 0) welt.reisen("dorf", "vonLythara");
}

async function brunnen() {
  await dialog("Brunnen der Agora", istErledigt("aurelia_q2")
    ? "Das Wasser plätschert und klingt wie ein kleines Glockenspiel. Der Ton des Markts ist zurück."
    : "Das Wasser plätschert. Früher spielte der Brunnen eine Melodie. Jetzt hört man nur noch ein leises Rauschen.");
}

const STAENDE = [
  { g: GESPRAECHE[0], stand: ["stand_a1", 16, 14], ware: "obst", segel: "#c8503a", npc: [18, 14] },
  { g: GESPRAECHE[1], stand: ["stand_a2", 29, 19], ware: "fisch", segel: "#2a6aa8", npc: [31, 19] },
  { g: GESPRAECHE[2], stand: ["stand_a3", 29, 13], ware: "toepfe", segel: "#d8a838", npc: [31, 13] },
];

const PERLEN_ORTE = [[46, 19], [40, 27], [44, 9]];

const MUSCHEL_ORTE = [[11, KAI_Y - 2], [25, KAI_Y - 2], [35, KAI_Y - 2]];

export default {
  id: "aurelia",
  name: "Aurelia – Die Hafenstadt der Glocken",
  musik: "aurelia",
  nur3d: true,
  nur3dZiel: ["dorf", "vonLythara"],
  raster: RASTER,
  spawns: {
    start: [5, 19],
    eingang: [5, 19],
    hafen: [21, 24],
    markt: [22, 19],
    leuchtturm: [40, 18],
    werft: [7, 28],
  },
  objekte: [
    { id: "portal_aurelia", art: "portal", name: "Portal ins Dorf", x: 1, y: 18, breite: 2, aktion: heimweg, hinweis: "Portal benutzen", aktiv: () => true },
    { id: "orpheon", art: "npc", name: ORPHEON, bild: "npc_orpheon", x: 7, y: 17, aktion: orpheon,
      marker: (z) => !z.erledigt.aurelia_intro || (z.erledigt.aurelia_q1 && !z.erledigt.aurelia_q1_orpheon) || (z.erledigt.aurelia_q2 && !z.erledigt.aurelia_q2_orpheon) || (z.erledigt.aurelia_q3 && !z.erledigt.aurelia_q3_orpheon) || (z.erledigt.aurelia_q4 && !z.erledigt.aurelia_q4_orpheon) },
    { id: "nerea", art: "npc", name: NEREA, bild: "npc_nerea", x: 20, y: 26, aktion: nerea,
      marker: (z) => Boolean(z.erledigt.aurelia_intro) && (!z.erledigt.aurelia_q1_start || (muschelnFertig(z) && !z.erledigt.aurelia_q1)) },
    ...MUSCHELN.map((m, i) => ({
      id: m.id, art: "objekt", name: m.name, bild: "rufmuschel", x: MUSCHEL_ORTE[i][0], y: MUSCHEL_ORTE[i][1],
      aktion: muschelAktion(m), hinweis: `${m.name} anhören`,
      leuchtet: (z) => Boolean(z.erledigt[m.id]),
      marker: (z) => Boolean(z.erledigt.aurelia_q1_start) && !z.erledigt[m.id],
    })),
    { id: "brunnen_agora", art: "objekt", name: "Brunnen der Agora", bild: "brunnen_antik", x: 23, y: 16, breite: 2, hoehe: 2, aktion: brunnen, hinweis: "Den Brunnen ansehen" },
    { id: "ione", art: "npc", name: IONE, bild: "npc_ione", x: 20, y: 18, aktion: ione,
      marker: (z) => Boolean(z.erledigt.aurelia_q1) && (!z.erledigt.aurelia_q2_start || (gespraecheFertig(z) && !z.erledigt.aurelia_q2)) },
    ...STAENDE.flatMap(({ g, stand, ware, segel, npc }) => [
      { id: stand[0], art: "objekt", name: `Stand: ${g.titel.replace("Am ", "")}`, bild: `stand_${ware}`, segel, x: stand[1], y: stand[2], breite: 2,
        aktion: haendlerAktion(g), hinweis: `Mit ${g.name} sprechen` },
      { id: g.haendler.replace("npc_", ""), art: "npc", name: g.name, bild: g.haendler, x: npc[0], y: npc[1], aktion: haendlerAktion(g),
        marker: (z) => Boolean(z.erledigt.aurelia_q2_start) && !z.erledigt[g.id] },
    ]),
    { id: "talos", art: "npc", name: TALOS, bild: "npc_talos", x: 43, y: 19, aktion: talos,
      marker: (z) => Boolean(z.erledigt.aurelia_q2) && (!z.erledigt.aurelia_q3_start || (perlenFertig(z) && !z.erledigt.aurelia_q3)) },
    { id: "muschelfon", art: "objekt", name: "Muschelfon", bild: "muschelfon", x: 41, y: 17, aktion: muschelfon, hinweis: "Das Muschelfon ansehen",
      leuchtet: (z) => perlenFertig(z) },
    ...PERLEN.map((p, i) => ({
      id: p.id, art: "objekt", name: p.name, bild: "klangperle", x: PERLEN_ORTE[i][0], y: PERLEN_ORTE[i][1],
      aktion: perleAktion(p), hinweis: `${p.name} aufheben`,
      leuchtet: (z) => Boolean(z.erledigt.aurelia_q3_start) && !z.erledigt[p.id],
      marker: (z) => Boolean(z.erledigt.aurelia_q3_start) && !z.erledigt[p.id],
    })),
    { id: "kassia", art: "npc", name: KASSIA, bild: "npc_kassia", x: 6, y: 26, aktion: kassia,
      marker: (z) => Boolean(z.erledigt.aurelia_q3) && (!z.erledigt.aurelia_q4_start || (werftFertig(z) && !z.erledigt.aurelia_q4)) },
    { id: "werkbank", art: "objekt", name: "Werkbank", bild: "werkbank", x: 9, y: 26, breite: 2, aktion: werkbank, hinweis: "An der Werkbank zuhören",
      marker: (z) => Boolean(z.erledigt.aurelia_q4_start) && !z.erledigt.aurelia_q4_w1 },
    { id: "timon", art: "npc", name: TIMON, bild: "npc_timon", x: 2, y: 26, aktion: timon,
      marker: (z) => Boolean(z.erledigt.aurelia_q4_start) && !z.erledigt.aurelia_q4_w2 },
    { id: "daria", art: "npc", name: DARIA, bild: "npc_daria", x: 4, y: 31, aktion: daria,
      marker: (z) => Boolean(z.erledigt.aurelia_q4_start) && !z.erledigt.aurelia_q4_w3 },
    { id: "turm_tuer", art: "objekt", name: "Tor des Glockenturms", bild: "tafel", x: 23, y: 7,
      aktion: spaeter("Glockenturm", "Das Tor ist verschlossen. Ganz oben hängt die große Glocke – stumm. Und manchmal hörst du ein tiefes Grollen … (Quest 5 und der Endkampf kommen bald.)"),
      hinweis: "Das Tor untersuchen", leuchtet: (z) => Boolean(z.erledigt.aurelia_q1) },
  ],
};
