// Kleiner Knopf „Musik an/aus“, der in Kampf- und Prüfungsfenstern immer sichtbar ist.
// Alle Schalter folgen dem Stummzustand, auch wenn er mit der Taste M geändert wird.

import { el } from "./fenster.js";
import { istStumm, stummSchalten, beimStummschalten } from "../musik.js";

const schalter = new Set();

function beschriften(b) {
  const aus = istStumm();
  b.textContent = aus ? "🔇 Musik aus" : "🔊 Musik an";
  b.title = aus ? "Musik einschalten (M)" : "Musik ausschalten (M)";
  b.setAttribute("aria-pressed", aus ? "true" : "false");
}

beimStummschalten(() => {
  for (const b of schalter) {
    if (!b.isConnected) schalter.delete(b);
    else beschriften(b);
  }
});

export function tonSchalter() {
  const b = el("button", { type: "button", class: "ton-schalter", onclick: () => { stummSchalten(); b.blur(); } });
  beschriften(b);
  schalter.add(b);
  return b;
}
