import { el, zeigen, knopf, fokus, toast } from "./fenster.js";
import { xpGeben, geben } from "../zustand.js";
import { GEGENSTAENDE } from "../inhalte/gegenstaende.js";
import { spieleJingle } from "../musik.js";

/** Vergibt XP und Gegenstände und zeigt einen Belohnungsbildschirm. fanfare: true bei abgeschlossenen Quests. */
export function belohnung({ xp = 0, grund = "", gegenstaende = [], fanfare = false }) {
  if (fanfare) spieleJingle("fanfare");
  const neu = gegenstaende.filter((id) => geben(id));
  const ergebnis = xp ? xpGeben(xp, grund) : null;

  return new Promise((weiter) => {
    const k = knopf("Weiter", weiter);
    zeigen(
      el("div", { class: "titelbild" },
        el("h2", {}, "✨ Belohnung ✨"),
        el("p", {}, grund),
        xp ? el("div", { style: "font-size:40px;font-weight:bold;color:var(--gold-dunkel);margin:10px 0" }, `+${xp} XP`) : null,
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
