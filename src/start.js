// Startbildschirm und Prolog – gemeinsam für alle Grafikversionen.

import { zustand, zuruecksetzen, spielzeitZaehlen, speichern } from "./zustand.js";
import { el, zeigen, knopf, fokus, schliessen, dialog, bestaetigen } from "./ui/fenster.js";
import { hudZeigen, codeAnzeigen, autoSicherungTakt } from "./ui/hud.js";
import "./ton.js";
import { bild } from "./ui/bilder.js";
import { musik } from "./musik.js";
import { vollbildBeimStart } from "./ui/vollbild.js";

// Rechtsklick, Kopieren, Ausschneiden, Einfügen, Bilder und Text ziehen, Strg+S, Strg+U, F12 und
// Strg+Umschalt+I/J/C sind im Spiel gesperrt. So kann niemand Aufgabentexte in die Schreibaufgaben kopieren
// (in der Prüfung gäbe das 0 Punkte). Erlaubt bleibt nur das Einfügen in Felder mit data-einfuegen
// (Lehrercode) und das Kopieren des eigenen Textes aus einer Schreibaufgabe.
const einfuegenErlaubt = (z) => !!z?.closest?.("[data-einfuegen]");
const eigenerText = (z) => !!z?.closest?.("textarea.freitext");
const ziel = (ev) => (ev.target?.nodeType === 1 ? ev.target : ev.target?.parentElement);
// Bei Textfeldern ist das Ereignisziel das Feld selbst, sonst zählt, wo die Markierung liegt.
const markierungIn = (ev, pruef) => {
  const z = ziel(ev);
  if (z?.matches?.("textarea, input")) return pruef(z);
  const sel = document.getSelection();
  if (!sel || sel.isCollapsed) return true;
  const knoten = (n) => (n?.nodeType === 1 ? n : n?.parentElement);
  return pruef(knoten(sel.anchorNode)) && pruef(knoten(sel.focusNode));
};
document.addEventListener("contextmenu", (ev) => { if (!einfuegenErlaubt(ziel(ev))) ev.preventDefault(); }, true);
document.addEventListener("copy", (ev) => { if (!markierungIn(ev, eigenerText)) ev.preventDefault(); }, true);
document.addEventListener("cut", (ev) => { if (!markierungIn(ev, (z) => eigenerText(z) || einfuegenErlaubt(z))) ev.preventDefault(); }, true);
document.addEventListener("paste", (ev) => { if (!einfuegenErlaubt(ziel(ev))) ev.preventDefault(); }, true);
document.addEventListener("beforeinput", (ev) => {
  if (/^insertFrom(Paste|Drop|Yank)/.test(ev.inputType) && !einfuegenErlaubt(ziel(ev))) ev.preventDefault();
}, true);
document.addEventListener("dragstart", (ev) => { if (!einfuegenErlaubt(ziel(ev))) ev.preventDefault(); }, true);
document.addEventListener("drop", (ev) => { if (!einfuegenErlaubt(ziel(ev))) ev.preventDefault(); }, true);
document.addEventListener("keydown", (ev) => {
  const taste = ev.key.toLowerCase();
  if ((ev.ctrlKey || ev.metaKey) && ["s", "u"].includes(taste)) ev.preventDefault();
  // F12 und Strg+Umschalt+I/J/C (Entwicklerwerkzeuge)
  if (ev.key === "F12" || ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ["i", "j", "c"].includes(taste))) ev.preventDefault();
}, true);

export const PROLOG = [
  "Vor langer Zeit war Eldoria ein Land des Friedens. Vier Reiche lebten in Harmonie: Aurelia, das Reich des Hörens. Scriptoria, das Reich des Lesens. Lythara, das Reich des Schreibens. Und Vocantia, das Reich des Sprechens.",
  "Verbunden waren sie durch das Sprachsiegel von Eldoria. Es half allen Bewohnern, miteinander zu sprechen und gemeinsam Probleme zu lösen.",
  "Doch dann kam Morgrath, der Verschleierer. Er hasste Verständigung. Mit einem Fluch zerschlug er das Siegel in vier Teile und versteckte sie in den vier Reichen.",
  "Seitdem verstehen sich die Völker kaum noch. Wissen verschwindet, und Missverständnisse führen zu Streit.",
  "Heute kommst du im Dorf der Ankömmlinge an. Vielleicht bist du die Heldin oder der Held aus der alten Prophezeiung …",
];

// Spielzeit für die Statistik der Lehrkraft: alle 15 Sekunden, solange das Spiel sichtbar ist.
let zeitmessung = null;
function spielzeitMessen() {
  if (zeitmessung) return;
  let takte = 0;
  zeitmessung = setInterval(() => {
    if (document.hidden) return;
    spielzeitZaehlen(15);
    autoSicherungTakt(15);
    if (++takte % 4 === 0) speichern();
  }, 15000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) speichern(); });
}

/**
 * Zeigt den Titelbildschirm.
 * beimStart:   Funktion, die die Spielwelt startet
 * untertitel:  optionaler Zusatz (z. B. „16-Bit-Demo“)
 * titelBild:   Schlüssel des Bildes über dem Titel
 * bildGroesse: Anzeigegröße des Bildes in Pixeln
 * intro:       optional { szene(nr), ende() } – zeigt zu jeder Prolog-Tafel eine Szene im Hintergrund (3D)
 */
export function titelZeigen({ beimStart, untertitel = null, titelBild = "boss_torwaechter", bildGroesse = 96, intro = null }) {
  const starten = () => {
    schliessen();
    hudZeigen();
    beimStart();
    spielzeitMessen();
  };

  const neuesSpiel = async () => {
    vollbildBeimStart();
    zuruecksetzen();
    musik("intro");
    if (intro) {
      // Zu jeder Tafel eine kurze Szene; das Intro lässt sich überspringen
      for (let i = 0; i < PROLOG.length; i++) {
        await intro.szene(i);
        const weiter = await dialog("Die Chroniken von Eldoria", PROLOG[i], null,
          { weiter: i < PROLOG.length - 1 ? "Weiter ▸" : "Los geht's!", ueberspringen: i < PROLOG.length - 1 ? "Intro überspringen" : null });
        if (!weiter) break;
      }
      intro.ende();
    } else {
      await dialog("Die Chroniken von Eldoria", PROLOG);
    }
    starten();
  };

  // Nach einem Sprungcode (Lehrkraft) direkt weiterspielen
  let direkt = false;
  try { direkt = sessionStorage.getItem("eldoria-direkt-weiter") === "1"; sessionStorage.removeItem("eldoria-direkt-weiter"); } catch { /* egal */ }
  if (direkt) { starten(); return; }

  const hatSpielstand = Boolean(zustand.held) || zustand.xp > 0;
  const knoepfe = hatSpielstand
    ? [knopf("▶ Weiterspielen", () => { vollbildBeimStart(); starten(); }), knopf("Neues Spiel", async () => {
        const ja = await bestaetigen("Neues Spiel?", "Dein bisheriger Fortschritt auf diesem Gerät wird gelöscht.", "Ja, neu beginnen");
        if (ja) neuesSpiel();
        else titelZeigen({ beimStart, untertitel, titelBild, bildGroesse, intro });
      }, "knopf zweitrangig")]
    : [knopf("▶ Das Abenteuer beginnt", neuesSpiel)];

  zeigen(
    el("div", { class: "titelbild" },
      el("img", {
        src: bild(titelBild), alt: "",
        style: `width:${bildGroesse}px;height:${bildGroesse}px;image-rendering:pixelated`,
      }),
      el("h1", {}, "Die Chroniken von Eldoria"),
      el("p", {}, "Der Weg zum Sprachsiegel der Vier Reiche"),
      untertitel ? el("p", { class: "titel-version" }, untertitel) : null,
      hatSpielstand && zustand.held ? el("p", {}, `Willkommen zurück, ${zustand.held.name}! (${zustand.xp} XP)`) : null),
    el("div", { class: "knopfleiste", style: "justify-content:center" }, knoepfe),
    el("p", { class: "titel-steuerung" }, "Steuerung: Pfeiltasten oder WASD · E oder Leertaste zum Sprechen"),
    el("p", { class: "titel-code" }, el("button", {
      type: "button", class: "link-knopf",
      onclick: () => codeAnzeigen({ zurueck: () => titelZeigen({ beimStart, untertitel, titelBild, bildGroesse, intro }) }),
    }, "🔑 Code eingeben")),
  );
  fokus(knoepfe[0]);
}
