// Editor für das Aussehen der eigenen Figur (im Heldenpass-Formular und später über „Aussehen ändern“).
// Gespeichert werden nur die Werte, die man selbst gewählt hat (siehe src/held.js).

import { el, zeigen, knopf, schliessen } from "./fenster.js";
import { zustand, speichern } from "../zustand.js";
import { vorschauElement, vorschauSetzen } from "../grafik3d/vorschau.js";
import {
  HAUTFARBEN, HAARFARBEN, AUGENFARBEN, KLEIDFARBEN, FRISUREN, BAERTE,
  aussehenFuer, portraitFuer, portraitUrl, klassenName, klassenTextur,
} from "../held.js";

/**
 * Baut den Editor. klasse: gewählte Heldenklasse, wahl: bisheriges held.aussehen.
 * Liefert { element, klasseSetzen(k), wert() }.
 */
export function aussehenEditor({ klasse, wahl = {} }) {
  let k = klasse;
  const w = { ...wahl };
  const portrait = el("img", { class: "aussehen-portrait", alt: "Porträt deiner Figur" });
  const figur = vorschauElement();   // 3D-Vorschau der echten Spielfigur (null ohne WebGL)
  const name = el("div", { class: "aussehen-name" });
  const zeilen = [];

  const neuZeichnen = () => {
    portrait.src = portraitUrl(k, w);
    const d = aussehenFuer(k, w);
    if (figur) vorschauSetzen(d, klassenTextur(k), portraitFuer(k, w));
    name.textContent = klassenName({ klasse: k, aussehen: w });
    for (const z of zeilen) z.markieren(d);
  };

  /** Eine Zeile mit Knöpfen. feld: Schlüssel in w; aktuell(d): der Wert, der gerade sichtbar ist. */
  const zeile = (titel, feld, optionen, { farbe = false, aktuell } = {}) => {
    const knoepfe = optionen.map(([wert, text]) => {
      const b = farbe
        ? el("button", { type: "button", class: "farbfeld", title: text, "aria-label": text, style: `background:${wert}` })
        : el("button", { type: "button", class: "wahl" }, text);
      b.dataset.wert = wert;
      b.addEventListener("click", () => { w[feld] = wert; neuZeichnen(); });
      return b;
    });
    const z = el("div", { class: "aussehen-zeile" }, el("span", { class: "aussehen-titel" }, titel), el("div", { class: "aussehen-knoepfe" }, knoepfe));
    z.markieren = (d) => {
      const jetzt = aktuell ? aktuell(d) : w[feld];
      for (const b of knoepfe) b.classList.toggle("gewaehlt", b.dataset.wert === String(jetzt ?? ""));
    };
    zeilen.push(z);
    return z;
  };

  const element = el("div", { class: "aussehen" },
    el("div", { class: "aussehen-vorschau" }, portrait, figur, name),
    el("div", { class: "aussehen-auswahl" },
      zeile("Ich spiele", "form", [["w", "eine Heldin"], ["m", "einen Helden"]]),
      zeile("Haut", "haut", HAUTFARBEN.map((f, i) => [f, `Hautfarbe ${i + 1}`]), { farbe: true, aktuell: (d) => d.haut }),
      zeile("Haare", "haare", HAARFARBEN, { farbe: true, aktuell: (d) => d.haare }),
      zeile("Frisur", "frisur", FRISUREN, { aktuell: (d) => d.frisur }),
      zeile("Bart", "bart", BAERTE, { aktuell: (d) => d.bart ?? "" }),
      zeile("Augen", "augen", AUGENFARBEN, { farbe: true }),
      zeile("Kleidung", "kleid", KLEIDFARBEN, { farbe: true, aktuell: (d) => d.kleid }),
      el("div", { class: "aussehen-zeile" }, el("span", { class: "aussehen-titel" }),
        knopf("↺ Wie am Anfang", () => { for (const f of Object.keys(w)) delete w[f]; neuZeichnen(); }, "knopf zweitrangig klein")),
    ),
  );
  neuZeichnen();
  return {
    element,
    klasseSetzen(neu) { k = neu; neuZeichnen(); },
    wert() { return { ...w }; },
  };
}

/** Eigenes Fenster: Aussehen nachträglich ändern (aus dem Heldenpass). */
export function aussehenAendern({ zurueck } = {}) {
  const h = zustand.held;
  if (!h) return;
  const ed = aussehenEditor({ klasse: h.klasse, wahl: h.aussehen ?? {} });
  zeigen(
    el("h2", {}, "🎨 Aussehen ändern"),
    el("div", { class: "untertitel" }, "Wähle, wie deine Figur aussieht. Du kannst das jederzeit wieder ändern."),
    ed.element,
    el("div", { class: "knopfleiste" },
      knopf("Abbrechen", () => (zurueck ? zurueck() : schliessen()), "knopf zweitrangig"),
      knopf("Speichern ✔", () => {
        const w = ed.wert();
        if (Object.keys(w).length) h.aussehen = w; else delete h.aussehen;
        speichern();
        heldNeuZeigen();
        zurueck ? zurueck() : schliessen();
      })),
  );
}

/** Zeigt das neue Aussehen sofort in der Welt und in der Kopfleiste. */
export function heldNeuZeigen() {
  window.eldoria?.spiel3d?.aktualisieren?.();
  window.eldoria?.szene?.aktualisieren?.();
  import("./hud.js").then((m) => { if (!document.getElementById("hud")?.hidden) m.hudZeigen(); });
}
