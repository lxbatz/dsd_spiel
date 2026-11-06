import { el, zeigen, knopf, fokus, schliessen } from "./fenster.js";
import { bild } from "./bilder.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, stufeVon } from "../zustand.js";

const FELDER = [
  ["name", "Vorname (Heldenname)", "z. B. Mira", true],
  ["alter", "Alter", "z. B. 16"],
  ["land", "Herkunftsland", "z. B. Polen"],
  ["wohnort", "Wohnort", "z. B. Köln"],
  ["sprachen", "Sprachen", "z. B. Polnisch, Englisch, Deutsch"],
  ["hobbys", "Hobbys", "z. B. Fußball, Musik"],
  ["beruf", "Traumberuf", "z. B. Mechatronikerin"],
];

/** Formular zum Ausfüllen des Heldenpasses. Liefert das Held-Objekt oder null („Später“). */
export function heldenpassFormular() {
  return new Promise((fertig) => {
    let klasse = "barde";
    const eingaben = {};
    const meldung = el("div", { class: "feedback schlecht", hidden: true });

    const klassenKnoepfe = Object.entries(KLASSEN).map(([id, k]) => {
      const b = el("button", { type: "button", class: "klasse" + (id === klasse ? " gewaehlt" : "") },
        el("img", { src: bild(k.textur), alt: "" }), el("b", {}, k.name), el("br"), el("small", {}, k.text));
      b.addEventListener("click", () => {
        klasse = id;
        klassenKnoepfe.forEach((x) => x.classList.remove("gewaehlt"));
        b.classList.add("gewaehlt");
      });
      return b;
    });

    const felder = FELDER.map(([id, label, platzhalter]) => {
      const input = el("input", { type: "text", placeholder: platzhalter, maxlength: 60, autocomplete: "off" });
      eingaben[id] = input;
      return el("label", {}, label, input);
    });

    const ok = knopf("Heldenpass ausstellen ✔", () => {
      const held = { klasse };
      for (const [id] of FELDER) held[id] = eingaben[id].value.trim();
      if (!held.name) {
        meldung.textContent = "Bitte schreib deinen Vornamen in den Heldenpass.";
        meldung.hidden = false;
        eingaben.name.focus();
        return;
      }
      fertig(held);
    });

    zeigen(
      el("h2", {}, "🪪 Heldenpass"),
      el("div", { class: "untertitel" }, "Fülle deinen Heldenpass aus. Schreib auf Deutsch! Nur der Vorname ist Pflicht."),
      el("div", { class: "formular" }, felder),
      el("h3", {}, "Wähle deine Heldenklasse"),
      el("div", { class: "klassen" }, klassenKnoepfe),
      meldung,
      el("div", { class: "knopfleiste" }, knopf("Später", () => fertig(null), "knopf zweitrangig"), ok),
    );
    fokus(eingaben.name);
  });
}

/** Zeigt den Heldenpass und die eigenen Texte. */
export function heldenpassAnzeigen() {
  const h = zustand.held;
  if (!h) {
    zeigen(el("h2", {}, "🪪 Heldenpass"),
      el("p", {}, "Du hast noch keinen Heldenpass. Sprich mit dem Ratsältesten Aldric im Dorf."),
      el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)));
    return;
  }
  const s = stufeVon(zustand.xp);
  const k = KLASSEN[h.klasse];
  const texte = Object.entries(zustand.texte);
  zeigen(
    el("div", { class: "dialog" },
      el("img", { class: "portrait", src: bild(k?.textur), alt: "" }),
      el("div", {},
        el("h2", {}, h.name),
        el("div", { class: "untertitel" }, `${k?.name ?? ""} · Stufe ${s.stufe}: ${s.titel} · ${zustand.xp} XP`))),
    el("dl", { class: "pass-ansicht" },
      FELDER.slice(1).map(([id, label]) => [el("div", {}, el("dt", {}, label), el("dd", {}, h[id] || "–"))])),
    el("h3", {}, "📝 Meine Texte"),
    texte.length
      ? texte.map(([id, t]) => el("details", { style: "margin-bottom:8px" },
          el("summary", {}, `${TEXT_NAMEN[id] ?? id} (${new Date(t.datum).toLocaleDateString("de-DE")})`),
          el("div", { class: "lesetext" }, t.text)))
      : el("p", {}, "Noch keine Texte."),
    el("div", { class: "knopfleiste" }, knopf("Schließen", schliessen)),
  );
}

export const TEXT_NAMEN = {
  dorf_vorstellung: "Meine Vorstellung",
  lythara_einleitung: "Meine Einleitung (Schriftrolle des Beobachters)",
};
