import { BootSzene } from "./szenen/boot.js";
import { KartenSzene } from "./szenen/karte.js";
import { zustand, zuruecksetzen } from "./zustand.js";
import { el, zeigen, knopf, fokus, schliessen, dialog, bestaetigen } from "./ui/fenster.js";
import { hudZeigen } from "./ui/hud.js";

const spiel = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "spiel",
  width: 480,
  height: 320,
  pixelArt: true,
  backgroundColor: "#14121f",
  physics: { default: "arcade", arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootSzene, KartenSzene],
});

window.eldoria = { spiel, zustand };

const PROLOG = [
  "Vor langer Zeit war Eldoria ein Land des Friedens. Vier Reiche lebten in Harmonie: Aurelia, das Reich des Hörens. Scriptoria, das Reich des Lesens. Lythara, das Reich des Schreibens. Und Vocantia, das Reich des Sprechens.",
  "Verbunden waren sie durch das Sprachsiegel von Eldoria. Es half allen Bewohnern, miteinander zu sprechen und gemeinsam Probleme zu lösen.",
  "Doch dann kam Morgrath, der Verschleierer. Er hasste Verständigung. Mit einem Fluch zerschlug er das Siegel in vier Teile und versteckte sie in den vier Reichen.",
  "Seitdem verstehen sich die Völker kaum noch. Wissen verschwindet, und Missverständnisse führen zu Streit.",
  "Heute kommst du im Dorf der Ankömmlinge an. Vielleicht bist du die Heldin oder der Held aus der alten Prophezeiung …",
];

function starten() {
  schliessen();
  hudZeigen();
  spiel.scene.start("karte");
}

async function neuesSpiel() {
  zuruecksetzen();
  await dialog("Die Chroniken von Eldoria", PROLOG);
  starten();
}

function titel() {
  const hatSpielstand = Boolean(zustand.held) || zustand.xp > 0;
  const knoepfe = hatSpielstand
    ? [knopf("▶ Weiterspielen", starten), knopf("Neues Spiel", async () => {
        const ja = await bestaetigen("Neues Spiel?", "Dein bisheriger Fortschritt auf diesem Gerät wird gelöscht.", "Ja, neu beginnen");
        if (ja) neuesSpiel();
        else titel();
      }, "knopf zweitrangig")]
    : [knopf("▶ Das Abenteuer beginnt", neuesSpiel)];
  zeigen(
    el("div", { class: "titelbild" },
      el("img", { src: "", id: "titel-bild", alt: "", style: "width:96px;height:96px;image-rendering:pixelated" }),
      el("h1", {}, "Die Chroniken von Eldoria"),
      el("p", {}, "Der Weg zum Sprachsiegel der Vier Reiche"),
      hatSpielstand && zustand.held ? el("p", {}, `Willkommen zurück, ${zustand.held.name}! (${zustand.xp} XP)`) : null),
    el("div", { class: "knopfleiste", style: "justify-content:center" }, knoepfe),
    el("p", { style: "text-align:center;font-size:13px;color:var(--tinte-2);margin-top:16px" },
      "Steuerung: Pfeiltasten oder WASD · E oder Leertaste zum Sprechen"),
  );
  import("./ui/bilder.js").then(({ bild }) => {
    const img = document.getElementById("titel-bild");
    if (img) img.src = bild("boss_torwaechter");
  });
  fokus(knoepfe[0]);
}

spiel.events.once("bereit", titel);
