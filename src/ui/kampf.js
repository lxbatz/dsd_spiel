// Bosskampf: Der Gegner stellt Fragen. Jede richtige Antwort trifft ihn,
// jede falsche Antwort kostet ein Herz. Kein zweiter Versuch pro Frage.

import { el, zeigen, knopf, fokus } from "./fenster.js";
import { aufgabeErstellen, aufgabeAufloesen, lesetextElement } from "./aufgaben.js";
import { hoertextElement, hoerenStoppen } from "./hoeren.js";
import { sprechenStoppen } from "./sprechen.js";
import { hatEffekt, kampfErgebnis } from "../zustand.js";
import { mischen, zufall } from "../hilfen.js";
import { musik, aktuelleMusik, spieleJingle } from "../musik.js";

/**
 * gegner: { name, bild (Data-URL), lp, schaden, einleitung, spott: [..], sieg: [..], niederlage: [..] }
 * fragen: Aufgaben (wie in aufgaben.js)
 * Liefert true bei Sieg, false bei Niederlage.
 */
export async function kampf(gegner, roheFragen) {
  const fragen = roheFragen.map(aufgabeAufloesen);
  const herzenMax = 3 + (hatEffekt("extra_herz") ? 1 : 0);
  let herzen = herzenMax;
  let lp = gegner.lp;
  const schaden = gegner.schaden ?? 20;
  let stapel = mischen(fragen);
  let runde = 0;
  const verlauf = [];
  const musikVorher = aktuelleMusik();
  musik(gegner.musik ?? "kampf");

  await new Promise((los) => {
    const k = knopf("⚔️ Kampf beginnen", los);
    zeigen(
      el("div", { class: "kampf-kopf" },
        el("img", { class: "portrait", src: gegner.bild, alt: "" }),
        el("div", {}, el("h2", {}, gegner.name), el("div", { class: "rede" }, gegner.einleitung))),
      el("div", { class: "feedback info" },
        `So funktioniert der Kampf: Jede richtige Antwort trifft den Gegner (−${schaden} Lebenspunkte). `,
        `Bei einer falschen Antwort verlierst du ein Herz. Du hast ${herzenMax} Herzen`,
        herzenMax > 3 ? " (+1 durch dein Bronze-Abzeichen)." : "."),
      el("div", { class: "knopfleiste" }, k));
    fokus(k);
  });

  while (lp > 0 && herzen > 0) {
    if (!stapel.length) stapel = mischen(fragen);     // nur, falls alle Fragen schon richtig beantwortet sind
    const a = stapel.shift();
    runde++;

    await new Promise((weiter) => {
      const r = aufgabeErstellen(a);
      const portrait = el("img", { class: "portrait", src: gegner.bild, alt: "" });
      const balken = el("div", { style: `width:${(lp / gegner.lp) * 100}%` });
      const herzAnzeige = el("div", { class: "herzen", title: "Deine Herzen" });
      const zeichneHerzen = () => { herzAnzeige.textContent = "❤️".repeat(herzen) + "🖤".repeat(herzenMax - herzen); };
      zeichneHerzen();
      const lpText = el("div", { class: "fortschritt" }, `${gegner.name}: ${lp} / ${gegner.lp} Lebenspunkte`);
      const feedback = el("div", { class: "feedback", hidden: true });
      const leiste = el("div", { class: "knopfleiste" });

      const pruef = knopf("⚔️ Angreifen", () => {
        const e = r.pruefen();
        if (e.leer) {
          feedback.className = "feedback info";
          feedback.textContent = e.meldung;
          feedback.hidden = false;
          return;
        }
        r.sperren();
        verlauf.push({ frage: a.frage, typ: a.typ, ok: Boolean(e.ok) });
        if (e.ok) {
          lp = Math.max(0, lp - schaden);
          balken.style.width = `${(lp / gegner.lp) * 100}%`;
          lpText.textContent = `${gegner.name}: ${lp} / ${gegner.lp} Lebenspunkte`;
          portrait.classList.remove("treffer");
          void portrait.offsetWidth;
          portrait.classList.add("treffer");
          window.dispatchEvent(new CustomEvent("eldoria:treffer"));
          feedback.className = "feedback gut";
          feedback.textContent = ["Treffer! 💥", a.erklaerung].filter(Boolean).join(" ");
        } else {
          herzen--;
          zeichneHerzen();
          window.dispatchEvent(new CustomEvent("eldoria:schaden"));
          r.loesungZeigen();
          feedback.className = "feedback schlecht";
          feedback.textContent = ["Der Gegner wehrt ab! Du verlierst ein Herz.", a.erklaerung, "Diese Frage kommt später noch einmal."].filter(Boolean).join(" ");
          // Falsch beantwortete Fragen kommen am Ende wieder; richtig beantwortete nicht
          stapel.push(a);
        }
        feedback.hidden = false;
        const w = knopf(lp <= 0 || herzen <= 0 ? "Weiter ▸" : "Nächste Runde ▸", weiter);
        leiste.replaceChildren(w);
        fokus(w);
      });
      leiste.append(pruef);

      zeigen(
        el("div", { class: "kampf-kopf" },
          portrait,
          el("div", { style: "flex:1" },
            el("h2", {}, gegner.name),
            el("div", { class: "lp-balken" }, balken),
            lpText,
            herzAnzeige)),
        el("div", { class: "spott" }, `Runde ${runde}: „${zufall(gegner.spott)}“`),
        lesetextElement(a.lesetext),
        hoertextElement(a.hoertext),
        el("div", { class: "frage" }, a.frage),
        r.element,
        feedback,
        leiste);
      fokus(r.erstesFeld);
    });
    hoerenStoppen();
    sprechenStoppen();
  }

  const sieg = lp <= 0;
  kampfErgebnis({
    gegner: gegner.name, quest: gegner.quest ?? null, sieg,
    richtig: verlauf.filter((f) => f.ok).length, falsch: verlauf.filter((f) => !f.ok).length,
    herzen, herzenMax, fragen: verlauf,
  });
  // Nach dem Kampf wieder die Musik der Karte; bei einem Sieg vorher die Siegesfanfare.
  if (sieg) spieleJingle("sieg");
  musik(musikVorher, { sofort: sieg });
  await new Promise((weiter) => {
    const k = knopf("Weiter", weiter);
    zeigen(
      el("div", { class: "kampf-kopf" },
        el("img", { class: "portrait", src: gegner.bild, alt: "", style: sieg ? "opacity:.5;filter:grayscale(1)" : "" }),
        el("div", {},
          el("h2", {}, sieg ? "🏆 Sieg!" : "Niederlage …"),
          el("div", { class: "rede" }, (sieg ? gegner.sieg : gegner.niederlage).join("\n")))),
      el("div", { class: "knopfleiste" }, k));
    fokus(k);
  });
  return sieg;
}
