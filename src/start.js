// Startbildschirm und Prolog – gemeinsam für alle Grafikversionen.

import { zustand, zuruecksetzen } from "./zustand.js";
import { el, zeigen, knopf, fokus, schliessen, dialog, bestaetigen } from "./ui/fenster.js";
import { hudZeigen } from "./ui/hud.js";
import { bild } from "./ui/bilder.js";
import { musik } from "./musik.js";

export const PROLOG = [
  "Vor langer Zeit war Eldoria ein Land des Friedens. Vier Reiche lebten in Harmonie: Aurelia, das Reich des Hörens. Scriptoria, das Reich des Lesens. Lythara, das Reich des Schreibens. Und Vocantia, das Reich des Sprechens.",
  "Verbunden waren sie durch das Sprachsiegel von Eldoria. Es half allen Bewohnern, miteinander zu sprechen und gemeinsam Probleme zu lösen.",
  "Doch dann kam Morgrath, der Verschleierer. Er hasste Verständigung. Mit einem Fluch zerschlug er das Siegel in vier Teile und versteckte sie in den vier Reichen.",
  "Seitdem verstehen sich die Völker kaum noch. Wissen verschwindet, und Missverständnisse führen zu Streit.",
  "Heute kommst du im Dorf der Ankömmlinge an. Vielleicht bist du die Heldin oder der Held aus der alten Prophezeiung …",
];

/**
 * Zeigt den Titelbildschirm.
 * beimStart:   Funktion, die die Spielwelt startet
 * untertitel:  optionaler Zusatz (z. B. „16-Bit-Demo“)
 * titelBild:   Schlüssel des Bildes über dem Titel
 * bildGroesse: Anzeigegröße des Bildes in Pixeln
 */
export function titelZeigen({ beimStart, untertitel = null, titelBild = "boss_torwaechter", bildGroesse = 96 }) {
  const starten = () => {
    schliessen();
    hudZeigen();
    beimStart();
  };

  const neuesSpiel = async () => {
    zuruecksetzen();
    musik("intro");
    await dialog("Die Chroniken von Eldoria", PROLOG);
    starten();
  };

  const hatSpielstand = Boolean(zustand.held) || zustand.xp > 0;
  const knoepfe = hatSpielstand
    ? [knopf("▶ Weiterspielen", starten), knopf("Neues Spiel", async () => {
        const ja = await bestaetigen("Neues Spiel?", "Dein bisheriger Fortschritt auf diesem Gerät wird gelöscht.", "Ja, neu beginnen");
        if (ja) neuesSpiel();
        else titelZeigen({ beimStart, untertitel, titelBild, bildGroesse });
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
  );
  fokus(knoepfe[0]);
}
