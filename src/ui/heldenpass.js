import { el, zeigen, knopf, fokus, schliessen } from "./fenster.js";
import { bild } from "./bilder.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, stufeVon, speichern } from "../zustand.js";
import { TEXT_NAMEN } from "../inhalte/quests.js";
import { heldBild, klassenName } from "../held.js";
import { aussehenEditor, aussehenAendern } from "./aussehen.js";

const FELDER = [
  ["name", "Vorname (Heldenname)", "z. B. Mira", true],
  ["alter", "Alter", "z. B. 16"],
  ["land", "Herkunftsland", "z. B. Polen"],
  ["wohnort", "Wohnort", "z. B. Köln"],
  ["sprachen", "Sprachen", "z. B. Polnisch, Englisch, Deutsch"],
  ["hobbys", "Hobbys", "z. B. Fußball, Musik"],
  ["beruf", "Traumberuf", "z. B. Mechatronikerin"],
  ["kennung", "Klasse und Nummer (für deine Lehrkraft)", "z. B. IFK11-07"],
];

/** Fragt nach der Kennung für die Lehrkraft (Klasse und Nummer), falls sie fehlt. Liefert true, wenn vorhanden. */
export function kennungErfragen() {
  if (!zustand.held || zustand.held.kennung) return Promise.resolve(true);
  return new Promise((fertig) => {
    const eingabe = el("input", { type: "text", class: "code-eingabe", placeholder: "z. B. IFK11-07", maxlength: 30, autocomplete: "off" });
    const ok = () => {
      const wert = eingabe.value.trim();
      if (!wert) { eingabe.focus(); return; }
      zustand.held.kennung = wert;
      speichern();
      fertig(true);
    };
    eingabe.addEventListener("keydown", (ev) => { if (ev.key === "Enter") ok(); });
    zeigen(
      el("h2", {}, "🪪 Für deine Lehrkraft"),
      el("p", {}, "Damit deine Lehrkraft deinen Spielstand zuordnen kann: Schreib deine Klasse und deine Nummer in der Klassenliste."),
      eingabe,
      el("div", { class: "knopfleiste" }, knopf("Ohne Angabe weiter", () => fertig(false), "knopf zweitrangig"), knopf("Speichern ✔", ok)),
    );
    fokus(eingabe);
  });
}

/** Formular zum Ausfüllen des Heldenpasses. Liefert das Held-Objekt oder null („Später“). */
export function heldenpassFormular() {
  return new Promise((fertig) => {
    let klasse = "barde";
    const eingaben = {};
    const meldung = el("div", { class: "feedback schlecht", hidden: true });
    const editor = aussehenEditor({ klasse });

    const klassenKnoepfe = Object.entries(KLASSEN).map(([id, k]) => {
      const b = el("button", { type: "button", class: "klasse" + (id === klasse ? " gewaehlt" : "") },
        el("img", { src: bild(k.textur), alt: "" }), el("b", {}, k.name), el("br"), el("small", {}, k.text));
      b.addEventListener("click", () => {
        klasse = id;
        klassenKnoepfe.forEach((x) => x.classList.remove("gewaehlt"));
        b.classList.add("gewaehlt");
        editor.klasseSetzen(id);
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
      const aussehen = editor.wert();
      if (Object.keys(aussehen).length) held.aussehen = aussehen;
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
      el("div", { class: "untertitel" }, "Fülle deinen Heldenpass aus. Schreib auf Deutsch! Nur der Vorname ist Pflicht. Klasse und Nummer sieht nur deine Lehrkraft."),
      el("div", { class: "formular" }, felder),
      el("h3", {}, "Wähle deine Heldenklasse"),
      el("div", { class: "klassen" }, klassenKnoepfe),
      el("h3", {}, "Gestalte deine Figur"),
      editor.element,
      meldung,
      el("div", { class: "knopfleiste" }, knopf("Später", () => fertig(null), "knopf zweitrangig"), ok),
    );
    fokus(eingaben.name);
  });
}

/** Ergebnisse der Probeprüfung in der Feste Schattenzahn (für Schülerin, Schüler und Lehrkraft) */
function probepruefung() {
  const p = zustand.pruefung ?? {};
  if (!Object.keys(p).length) return null;
  const zeile = (teil, name) => {
    const e = p[teil];
    if (!e) return el("tr", {}, el("td", {}, name), el("td", {}, "–"));
    const wert = e.max ? `${e.punkte} / ${e.max} Punkte ${e.bestanden ? "✔" : "✘"}` : "abgegeben ✔ (bewertet die Lehrkraft)";
    return el("tr", {}, el("td", {}, name), el("td", {}, `${wert} · ${e.versuche} ${e.versuche === 1 ? "Versuch" : "Versuche"}`));
  };
  return [
    el("h3", {}, "🏰 Probeprüfung (Feste Schattenzahn)"),
    el("table", { class: "auswertung" }, el("tbody", {},
      zeile("hoeren", "Hörverstehen"), zeile("lesen", "Leseverstehen"), zeile("schreiben", "Schriftliche Kommunikation"), zeile("sprechen", "Mündliche Kommunikation"))),
  ];
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
  const texte = Object.entries(zustand.texte);
  zeigen(
    el("div", { class: "dialog" },
      el("img", { class: "portrait", src: heldBild(h), alt: "" }),
      el("div", {},
        el("h2", {}, h.name),
        el("div", { class: "untertitel" }, `${klassenName(h)} · Stufe ${s.stufe}: ${s.titel} · ${zustand.xp} XP`),
        zustand.erledigt.schattenzahn_finale ? el("div", { class: "ehrentitel" }, "🌟 Meister der Vier Sprachkräfte") : null)),
    el("dl", { class: "pass-ansicht" },
      FELDER.slice(1).map(([id, label]) => el("div", {}, el("dt", {}, label), el("dd", {}, h[id] || "–")))),
    probepruefung(),
    el("h3", {}, "📝 Meine Texte"),
    texte.length
      ? texte.map(([id, t]) => el("details", { style: "margin-bottom:8px" },
          el("summary", {}, `${TEXT_NAMEN[id] ?? id} (${new Date(t.datum).toLocaleDateString("de-DE")})`),
          el("div", { class: "lesetext" }, t.text)))
      : el("p", {}, "Noch keine Texte."),
    el("div", { class: "knopfleiste" },
      knopf("🎨 Aussehen ändern", () => aussehenAendern({ zurueck: heldenpassAnzeigen }), "knopf zweitrangig"),
      knopf("Schließen", schliessen)),
  );
}

export { TEXT_NAMEN };
