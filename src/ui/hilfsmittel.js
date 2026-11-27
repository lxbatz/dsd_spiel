// Knopf „Hilfsmittel einsetzen“ zwischen „Quest abbrechen“ und „Prüfen“.
// Pro Aufgabe darf man höchstens ein Hilfsmittel benutzen; danach ist der Knopf grau.

import { el, toast } from "./fenster.js";
import { HILFSMITTEL } from "../inhalte/hilfsmittel.js";
import { vorrat, vorratAendern } from "../zustand.js";
import { ton } from "../ton.js";

/**
 * r: die Aufgabe (aus aufgabeErstellen) mit r.hilfen = { feder?, lupe? }
 * ort: "aufgabe" oder "kampf"
 * heilen: im Bosskampf eine Funktion, die ein Herz zurückgibt (liefert false, wenn alle Herzen voll sind)
 * Liefert ein Element oder null, wenn es hier keine Hilfsmittel gibt.
 */
export function hilfsmittelKnopf(r, { ort = "aufgabe", heilen = null } = {}) {
  const moeglich = (id) => {
    if (!HILFSMITTEL[id].wo.includes(ort)) return false;
    if (id === "heiltrank") return Boolean(heilen);
    return typeof r.hilfen?.[id] === "function";
  };
  const ids = Object.keys(HILFSMITTEL).filter(moeglich);
  if (!ids.length) return null;
  const huelle = el("div", { class: "hilfsmittel" });
  const menue = el("div", { class: "hilfsmittel-menue", hidden: true });
  const knopf = el("button", { type: "button", class: "knopf zweitrangig", title: "Höchstens ein Hilfsmittel pro Aufgabe" }, "🎒 Hilfsmittel einsetzen");
  const zeichnen = () => {
    menue.replaceChildren(...ids.map((id) => {
      const h = HILFSMITTEL[id], n = vorrat(id);
      return el("button", {
        type: "button", class: "hilfsmittel-eintrag", disabled: n < 1, title: h.text,
        onclick: () => {
          const ok = id === "heiltrank" ? heilen() : r.hilfen[id]();
          if (!ok) { toast(id === "heiltrank" ? "Deine Herzen sind schon voll." : "Das hilft bei dieser Aufgabe nicht mehr."); return; }
          vorratAendern(id, -1);
          ton(id === "heiltrank" ? "herz" : "zauber");
          menue.hidden = true;
          knopf.disabled = true;
          knopf.textContent = `${h.icon} ${h.name} eingesetzt`;
        },
      }, el("span", { class: "icon" }, h.icon), el("span", {}, h.name), el("b", {}, `× ${n}`));
    }), el("small", {}, ids.some((id) => vorrat(id) > 0)
      ? "Du darfst pro Aufgabe ein Hilfsmittel benutzen."
      : "Du hast noch keine Hilfsmittel. Besiege kleine Gegner in der Welt oder löse Nebenquests!"));
  };
  knopf.addEventListener("click", () => { zeichnen(); menue.hidden = !menue.hidden; });
  huelle.append(knopf, menue);
  return huelle;
}
