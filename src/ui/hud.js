// Kopfleiste (Name, Stufe, XP) und die Fenster Aufgaben, Inventar, Code, Menü.

import { el, zeigen, knopf, fokus, schliessen, istOffen, toast, textZeigen, bestaetigen } from "./fenster.js";
import { bild } from "./bilder.js";
import { heldenpassAnzeigen, kennungErfragen } from "./heldenpass.js";
import {
  zustand, beobachten, stufeVon, xpGeben, geben, speichern,
  zuruecksetzen, spielstandDatei, spielstandLesen, spielstandUebernehmen,
} from "../zustand.js";
import { GEGENSTAENDE } from "../inhalte/gegenstaende.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { CODES } from "../inhalte/codes.js";
import { codePruefen } from "../codesignatur.js";
import { SPRUNGPUNKTE, sprungZustand } from "../inhalte/sprungpunkte.js";
import { TEXTE } from "../inhalte/texte.js";
import { ziele } from "../welt/ziele.js";
import { sha256 } from "../hilfen.js";
import { istStumm, stummSchalten, spieleJingle } from "../musik.js";
import { johannesBild, alexanderBild, claudeBild } from "../grafik16/credits_bilder.js";

const hud = document.getElementById("hud");

export function hudZeigen() {
  hud.hidden = false;
  hudAktualisieren();
}

function hudAktualisieren() {
  const s = stufeVon(zustand.xp);
  const h = zustand.held;
  document.getElementById("hud-name").textContent = h?.name ?? "Unbekannter Gast";
  // Nach dem Sieg über Morgrath trägt man den Ehrentitel statt des Stufentitels
  const titel = zustand.erledigt.schattenzahn_finale ? "Meister der Vier Sprachkräfte" : s.titel;
  document.getElementById("hud-stufe").textContent = `Stufe ${s.stufe} · ${titel}`;
  document.getElementById("hud-bild").src = bild(h ? KLASSEN[h.klasse]?.textur : "held_neu");
  const anteil = s.bis ? (zustand.xp - s.ab) / (s.bis - s.ab) : 1;
  document.getElementById("hud-xp-fuellung").style.width = `${Math.round(anteil * 100)}%`;
  document.getElementById("hud-xp-text").textContent = s.bis
    ? `${zustand.xp} XP · noch ${s.bis - zustand.xp} XP bis Stufe ${s.stufe + 1}`
    : `${zustand.xp} XP · höchste Stufe`;
}
beobachten(hudAktualisieren);

// ---------- Fenster ----------

function aufgabenAnzeigen() {
  const liste = ziele(zustand);
  zeigen(
    el("h2", {}, "📋 Aufgaben"),
    el("ul", { class: "ziel-liste" },
      liste.map((z) => el("li", { class: z.erledigt ? "erledigt" : "" }, z.erledigt ? "✔ " : "◻ ", z.text))),
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)),
  );
}

function inventarAnzeigen() {
  const ids = zustand.gegenstaende;
  zeigen(
    el("h2", {}, "🎒 Inventar"),
    ids.length
      ? el("div", { class: "gegenstaende" }, ids.map((id) => {
          const g = GEGENSTAENDE[id];
          if (!g) return null;
          return el("div", { class: "gegenstand" },
            el("div", { class: "icon" }, g.icon),
            el("b", {}, g.name),
            el("small", {}, g.text),
            g.lesen ? el("div", {}, knopf("Lesen", async () => {
              const t = TEXTE[g.lesen];
              await textZeigen(t.titel, t.text, t.quelle);
              inventarAnzeigen();
            })) : null);
        }))
      : el("p", {}, "Dein Inventar ist noch leer."),
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)),
  );
}

// ---------- Sprungcodes für Lehrkräfte ----------

function springen(punkt) {
  spielstandUebernehmen(sprungZustand(punkt, zustand));
  try { sessionStorage.setItem("eldoria-direkt-weiter", "1"); } catch { /* egal */ }
  location.reload();
}

async function sprungAnbieten(ziel, zurueck) {
  const warnung = el("p", { class: "klein" },
    "Der jetzige Spielstand auf diesem Gerät wird überschrieben (Held und Statistik bleiben). ",
    "Er gilt danach als Testspielstand und ist im Lehrerzimmer mit 🧪 markiert. ",
    "Tipp: Vorher über Menü → „Als Datei speichern“ sichern.");
  if (ziel === "menue") {
    zeigen(
      el("h2", {}, "🧭 Sprungmenü für Lehrkräfte"),
      el("div", { class: "untertitel" }, "Wähle die Stelle, an die du springen willst."),
      warnung,
      el("div", { class: "auswahl-liste sprung-liste" }, SPRUNGPUNKTE.map((p) => knopf(p.name, () => springen(p), "knopf zweitrangig"))),
      el("div", { class: "knopfleiste" }, knopf("Abbrechen", zurueck ?? schliessen, "knopf zweitrangig")),
    );
    return;
  }
  const punkt = SPRUNGPUNKTE.find((p) => p.id === ziel);
  if (!punkt) return;
  const ja = await bestaetigen("🧭 Sprungcode", `Springen zu: ${punkt.name}?\n\n${warnung.textContent}`, "Ja, springen");
  if (ja) springen(punkt);
  else (zurueck ?? schliessen)();
}

export function codeAnzeigen({ zurueck } = {}) {
  const eingabe = el("input", { class: "code-eingabe", placeholder: "ELD-XXXX-XXXX", maxlength: 20, autocomplete: "off" });
  const meldung = el("div", { class: "feedback", hidden: true });
  const einloesen = async () => {
    let code = eingabe.value.trim().toUpperCase();
    if (!code) return;
    // Schreibweise vereinheitlichen: „eld abcd efgh“ → „ELD-ABCD-EFGH“
    const roh = code.replace(/[^A-Z0-9]/g, "");
    if (/^(ELD|SPR)[A-Z0-9]{8}$/.test(roh)) code = `${roh.slice(0, 3)}-${roh.slice(3, 7)}-${roh.slice(7)}`;
    const hash = await sha256(code);
    // Zuerst die Liste in codes.js (ältere Codes, Sprungcodes), dann Codes mit eingebauter Prüfsumme
    const eintrag = CODES[hash] ?? (await codePruefen(code));
    meldung.hidden = false;
    if (!eintrag) {
      meldung.className = "feedback schlecht";
      meldung.textContent = "Diesen Code kennt der Rat nicht. Prüfe die Schreibweise.";
      return;
    }
    if (eintrag.sprung) {
      await sprungAnbieten(eintrag.sprung, zurueck);
      return;
    }
    if (zustand.codes.includes(hash)) {
      meldung.className = "feedback schlecht";
      meldung.textContent = "Diesen Code hast du schon eingelöst.";
      return;
    }
    zustand.codes.push(hash);
    if (eintrag.gegenstand) geben(eintrag.gegenstand);
    const e = xpGeben(eintrag.xp ?? 0, `Lehrercode: ${eintrag.grund}`);
    if (e.aufgestiegen) spieleJingle("stufe");
    speichern();
    meldung.className = "feedback gut";
    meldung.textContent = `✔ +${eintrag.xp} XP für „${eintrag.grund}“` +
      (eintrag.gegenstand ? ` und ${GEGENSTAENDE[eintrag.gegenstand]?.name}` : "") +
      (e.aufgestiegen ? ` · Neue Stufe: ${e.stufe.stufe} (${e.stufe.titel})!` : "");
    eingabe.value = "";
    toast(`+${eintrag.xp} XP – ${eintrag.grund}`);
  };
  eingabe.addEventListener("keydown", (ev) => { if (ev.key === "Enter") einloesen(); });
  zeigen(
    el("h2", {}, "🔑 Lehrercode einlösen"),
    el("div", { class: "untertitel" }, "Für Teamarbeit, mündliche Beiträge und Texte bekommst du von deiner Lehrkraft Codes."),
    eingabe, meldung,
    el("div", { class: "knopfleiste" }, knopf("Schließen", zurueck ?? schliessen, "knopf zweitrangig"), knopf("Einlösen", einloesen)),
  );
  fokus(eingabe);
}

// Die Grafikversion kann eigene Steuerungstexte und Einstellungen beisteuern.
let einstellungen = { steuerung: null, zusatz: null };
export function hudEinstellungen(e) { einstellungen = { ...einstellungen, ...e }; }

async function dateiSpeichern(meldung) {
  if (zustand.held && !zustand.held.kennung) {
    await kennungErfragen();
    menueAnzeigen();
  }
  // In einer Artefakt-Ansicht ist das Speichern nur über die Plattform erlaubt (dort als .json).
  const plattform = window.claude?.use ? await window.claude.use("downloads").catch(() => null) : null;
  const { name, inhalt } = spielstandDatei(plattform ? "json" : "sav");
  if (plattform) {
    try {
      await plattform.save({ filename: name, data: inhalt });
      toast("💾 Spielstand gespeichert");
    } catch (e) {
      if (e?.code !== "declined") { meldung.hidden = false; meldung.className = "feedback schlecht"; meldung.textContent = "Speichern ist hier leider nicht möglich."; }
    }
    return;
  }
  const url = URL.createObjectURL(new Blob([inhalt], { type: "application/octet-stream" }));
  const a = el("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast(`💾 ${name} wird heruntergeladen`);
}

function dateiLaden(meldung) {
  const eingabe = el("input", { type: "file", accept: ".sav,.json,.txt", style: "display:none" });
  document.body.append(eingabe);
  eingabe.addEventListener("change", async () => {
    const datei = eingabe.files?.[0];
    eingabe.remove();
    if (!datei) return;
    try {
      const daten = spielstandLesen(await datei.text());
      const wer = daten.held?.name ? `${daten.held.name} (${daten.xp} XP)` : `${daten.xp} XP`;
      const ja = await bestaetigen("Spielstand laden?", `Gefunden: ${wer}. Dein jetziger Fortschritt auf diesem Gerät wird dadurch ersetzt.`, "Ja, laden");
      if (!ja) return menueAnzeigen();
      spielstandUebernehmen(daten);
      location.reload();
    } catch (e) {
      meldung.hidden = false;
      meldung.className = "feedback schlecht";
      meldung.textContent = e.message;
    }
  });
  eingabe.click();
}

function menueAnzeigen() {
  const meldung = el("div", { class: "feedback", hidden: true });
  const codeFeld = el("textarea", { class: "code-feld", placeholder: "Alten Spielstand-Code hier einfügen …" });
  const steuerung = einstellungen.steuerung?.() ?? "Laufen: Pfeiltasten oder W A S D · Sprechen/Benutzen: E oder Leertaste · Aufgaben: Q · Inventar: I · Heldenpass: P · Musik an/aus: M · Menü: Esc";

  const tonKnopf = knopf(tonText(), () => { stummSchalten(); tonKnopf.textContent = tonText(); }, "knopf zweitrangig");
  zeigen(
    el("h2", {}, "☰ Menü"),
    el("div", { class: "knopfleiste menue-schnell", style: "justify-content:flex-start" },
      tonKnopf,
      knopf("🔑 Lehrercode einlösen", () => codeAnzeigen({ zurueck: menueAnzeigen }), "knopf zweitrangig"),
      knopf("🎬 Credits", creditsAnzeigen, "knopf zweitrangig")),
    el("h3", {}, "Steuerung"),
    el("p", {}, steuerung),
    el("h3", {}, "Spielstand"),
    el("p", {}, "Dein Spiel wird automatisch in diesem Browser gespeichert. Für ein anderes Gerät speicherst du deinen Spielstand als Datei und lädst ihn dort wieder."),
    el("div", { class: "knopfleiste", style: "justify-content:flex-start;margin-top:6px" },
      knopf("💾 Als Datei speichern", () => dateiSpeichern(meldung)),
      knopf("📂 Datei laden", () => dateiLaden(meldung), "knopf zweitrangig")),
    meldung,
    el("details", { class: "alter-code" },
      el("summary", {}, "Alten Spielstand-Code einfügen"),
      codeFeld,
      knopf("Code laden", () => {
        try {
          spielstandUebernehmen(spielstandLesen(codeFeld.value));
          location.reload();
        } catch (e) {
          meldung.hidden = false;
          meldung.className = "feedback schlecht";
          meldung.textContent = e.message;
        }
      }, "knopf zweitrangig")),
    einstellungen.zusatz?.() ?? null,
    el("h3", {}, "Neues Spiel"),
    knopf("Alles löschen und neu beginnen", async () => {
      const ja = await bestaetigen("Wirklich alles löschen?", "Dein ganzer Fortschritt auf diesem Gerät geht verloren. Tipp: Speichere vorher eine Datei.", "Ja, alles löschen");
      if (!ja) return menueAnzeigen();
      zuruecksetzen();
      location.reload();
    }, "knopf zweitrangig"),
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)),
  );
}

const tonText = () => (istStumm() ? "🔇 Musik einschalten (M)" : "🔊 Musik ausschalten (M)");

// ---------- Credits ----------

// [Rolle, Name, Pixel-Avatar (optional)]
const CREDITS = [
  ["Idee und fachliche Leitung", "Johannes Richter", johannesBild],
  ["Game Direction und ausführender Produzent", "Alexander Batzke", alexanderBild],
  ["Programmierung, Grafik, Questdesign, Texte", "Claude Code", claudeBild],
  ["Musik", "Beau Buckley (Fantasy Musica)"],
];
const creditBilder = new Map();
const creditBild = (fn) => {
  if (!creditBilder.has(fn)) creditBilder.set(fn, fn().alsCanvas(1).toDataURL());
  return creditBilder.get(fn);
};

function creditsAnzeigen() {
  zeigen(
    el("h2", {}, "🎬 Credits"),
    el("div", { class: "untertitel" }, "Die Chroniken von Eldoria"),
    el("div", { class: "credits" }, CREDITS.map(([rolle, name, bildFn]) => el("div", { class: "credit" },
      bildFn ? el("img", { class: "portrait credit-bild", src: creditBild(bildFn), alt: `Pixel-Avatar: ${name}` }) : null,
      el("div", { class: "credit-rolle" }, rolle),
      el("div", { class: "credit-name" }, name)))),
    el("div", { class: "knopfleiste" }, knopf("Zurück zum Menü", menueAnzeigen, "knopf zweitrangig"), knopf("Schließen", schliessen)),
  );
}

const AKTIONEN = {
  ziele: aufgabenAnzeigen,
  inventar: inventarAnzeigen,
  heldenpass: heldenpassAnzeigen,
  menue: menueAnzeigen,
};
const OHNE_FENSTER = {};

let hudGesperrt = () => false;
/** Die Spielszene meldet hier, wann gerade eine Interaktion läuft. */
export function hudSperreSetzen(fn) { hudGesperrt = fn; }

hud.addEventListener("click", (ev) => {
  const b = ev.target.closest("button[data-aktion]");
  if (!b) return;
  b.blur();
  if (OHNE_FENSTER[b.dataset.aktion]) return OHNE_FENSTER[b.dataset.aktion]();
  if (istOffen() || hudGesperrt()) return;
  AKTIONEN[b.dataset.aktion]?.();
});

document.addEventListener("keydown", (ev) => {
  if (hud.hidden) return;
  const tag = ev.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (ev.key.toLowerCase() === "m") { stummSchalten(); return toast(istStumm() ? "🔇 Musik aus" : "🔊 Musik an"); }
  if (ev.key === "Escape") {
    if (istOffen() && !hudGesperrt()) schliessen();
    else if (!istOffen()) menueAnzeigen();
    return;
  }
  if (istOffen() || hudGesperrt()) return;
  const taste = ev.key.toLowerCase();
  if (taste === "q") aufgabenAnzeigen();
  else if (taste === "i") inventarAnzeigen();
  else if (taste === "p") heldenpassAnzeigen();
});
