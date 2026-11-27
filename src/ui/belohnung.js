import { el, zeigen, knopf, fokus, toast } from "./fenster.js";
import { xpGeben, geben } from "../zustand.js";
import { GEGENSTAENDE } from "../inhalte/gegenstaende.js";
import { spieleJingle } from "../musik.js";
import { leistungAbholen } from "./aufgaben.js";

/** Vergibt XP und Gegenstände und zeigt einen Belohnungsbildschirm. fanfare: true bei abgeschlossenen Quests. */
export function belohnung({ xp = 0, grund = "", gegenstaende = [], fanfare = false }) {
  // Nach einer Aufgabenfolge: Fehlversuche und gezeigte Lösungen kosten XP.
  const leistung = xp > 0 ? leistungAbholen() : null;
  const voll = xp;
  if (leistung && leistung.faktor < 1) xp = Math.round(xp * leistung.faktor);
  const abzug = leistung && xp < voll
    ? `von ${voll} XP · ${[leistung.fehler ? `${leistung.fehler} Fehlversuch${leistung.fehler === 1 ? "" : "e"}` : null, leistung.loesungen ? `${leistung.loesungen}× Lösung angesehen` : null].filter(Boolean).join(" · ")}`
    : null;
  if (fanfare) spieleJingle("fanfare", { danach: true });
  const neu = gegenstaende.filter((id) => geben(id));
  const ergebnis = xp ? xpGeben(xp, grund) : null;
  if (ergebnis?.aufgestiegen) spieleJingle("stufe", { danach: true });
  // Für die 3D-Darstellung: Funken um die Spielfigur
  window.dispatchEvent(new CustomEvent("eldoria:belohnung", { detail: { xp, aufgestiegen: Boolean(ergebnis?.aufgestiegen) } }));

  return new Promise((weiter) => {
    const k = knopf("Weiter", weiter);
    zeigen(
      el("div", { class: "titelbild" },
        el("h2", {}, "✨ Belohnung ✨"),
        el("p", {}, grund),
        xp || abzug ? el("div", { style: "font-size:40px;font-weight:bold;color:var(--gold-dunkel);margin:10px 0" }, `+${xp} XP`) : null,
        abzug ? el("div", { class: "xp-abzug" }, abzug, el("br"), xp ? "Beim ersten Versuch richtig gibt es die vollen XP." : "Wer die Lösungen ansieht, bekommt keine XP.") : null,
      ),
      neu.length
        ? el("div", { class: "gegenstaende", style: "margin-top:10px" },
            neu.map((id) => {
              const g = GEGENSTAENDE[id];
              return el("div", { class: "gegenstand" },
                el("div", { class: "icon" }, g.icon),
                el("b", {}, g.name),
                el("small", {}, g.text));
            }))
        : null,
      ergebnis?.aufgestiegen
        ? el("div", { class: "feedback gut", style: "text-align:center;font-size:18px" },
            `⭐ Neue Stufe! Du bist jetzt Stufe ${ergebnis.stufe.stufe}: ${ergebnis.stufe.titel}`)
        : null,
      el("div", { class: "knopfleiste" }, k),
    );
    fokus(k);
    if (xp) toast(`+${xp} XP – ${grund}`);
  });
}
