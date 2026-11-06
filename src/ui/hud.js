// Kopfleiste (Name, Stufe, XP) und die Fenster Aufgaben, Inventar, Code, Menü.

import { el, zeigen, knopf, fokus, schliessen, istOffen, toast, textZeigen, bestaetigen } from "./fenster.js";
import { bild } from "./bilder.js";
import { heldenpassAnzeigen } from "./heldenpass.js";
import {
  zustand, beobachten, stufeVon, xpGeben, geben, speichern,
  exportieren, importieren, zuruecksetzen,
} from "../zustand.js";
import { GEGENSTAENDE } from "../inhalte/gegenstaende.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { CODES } from "../inhalte/codes.js";
import { TEXTE } from "../inhalte/texte.js";
import { ziele } from "../welt/ziele.js";
import { sha256 } from "../hilfen.js";
import { istStumm, stummSchalten, beimStummschalten } from "../musik.js";

const hud = document.getElementById("hud");

export function hudZeigen() {
  hud.hidden = false;
  hudAktualisieren();
}

function hudAktualisieren() {
  const s = stufeVon(zustand.xp);
  const h = zustand.held;
  document.getElementById("hud-name").textContent = h?.name ?? "Unbekannter Gast";
  document.getElementById("hud-stufe").textContent = `Stufe ${s.stufe} · ${s.titel}`;
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

function codeAnzeigen() {
  const eingabe = el("input", { class: "code-eingabe", placeholder: "ELD-XXXX-XXXX", maxlength: 20, autocomplete: "off" });
  const meldung = el("div", { class: "feedback", hidden: true });
  const einloesen = async () => {
    const code = eingabe.value.trim().toUpperCase();
    if (!code) return;
    const hash = await sha256(code);
    const eintrag = CODES[hash];
    meldung.hidden = false;
    if (!eintrag) {
      meldung.className = "feedback schlecht";
      meldung.textContent = "Diesen Code kennt der Rat nicht. Prüfe die Schreibweise.";
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
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen, "knopf zweitrangig"), knopf("Einlösen", einloesen)),
  );
  fokus(eingabe);
}

function menueAnzeigen() {
  const exportFeld = el("textarea", { class: "code-feld", readonly: true });
  const importFeld = el("textarea", { class: "code-feld", placeholder: "Spielstand-Code hier einfügen …" });
  const meldung = el("div", { class: "feedback", hidden: true });

  zeigen(
    el("h2", {}, "☰ Menü"),
    el("h3", {}, "Steuerung"),
    el("p", {}, "Laufen: Pfeiltasten oder W A S D · Sprechen/Benutzen: E oder Leertaste · ",
      "Aufgaben: Q · Inventar: I · Heldenpass: P · Musik an/aus: M · Menü: Esc"),
    el("h3", {}, "Spielstand sichern"),
    el("p", {}, "Dein Spiel wird automatisch in diesem Browser gespeichert. Willst du auf einem anderen Gerät weiterspielen? Dann kopiere diesen Code und füge ihn dort ein."),
    knopf("Code erzeugen", async () => {
      exportFeld.value = exportieren();
      exportFeld.select();
      try { await navigator.clipboard.writeText(exportFeld.value); toast("Spielstand-Code kopiert"); } catch { /* manuell kopieren */ }
    }, "knopf zweitrangig"),
    exportFeld,
    el("h3", {}, "Spielstand laden"),
    importFeld,
    knopf("Spielstand laden", () => {
      try {
        importieren(importFeld.value);
        location.reload();
      } catch (e) {
        meldung.hidden = false;
        meldung.className = "feedback schlecht";
        meldung.textContent = e.message;
      }
    }, "knopf zweitrangig"),
    meldung,
    el("h3", {}, "Neues Spiel"),
    knopf("Alles löschen und neu beginnen", async () => {
      const ja = await bestaetigen("Wirklich alles löschen?", "Dein ganzer Fortschritt auf diesem Gerät geht verloren.", "Ja, alles löschen");
      if (!ja) return menueAnzeigen();
      zuruecksetzen();
      location.reload();
    }, "knopf zweitrangig"),
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)),
  );
}

function tonKnopfAktualisieren() {
  const k = document.getElementById("ton-knopf");
  k.textContent = istStumm() ? "🔇" : "🔊";
  k.title = istStumm() ? "Musik einschalten (M)" : "Musik ausschalten (M)";
}
beimStummschalten(tonKnopfAktualisieren);
tonKnopfAktualisieren();

const AKTIONEN = {
  ziele: aufgabenAnzeigen,
  inventar: inventarAnzeigen,
  heldenpass: heldenpassAnzeigen,
  code: codeAnzeigen,
  menue: menueAnzeigen,
};
const OHNE_FENSTER = { ton: () => stummSchalten() };

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
  if (ev.key.toLowerCase() === "m") return stummSchalten();
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
