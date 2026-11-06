// Einstieg: klassische Version (einfache Platzhalter-Grafik)
import { BootSzene } from "./szenen/boot.js";
import { KartenSzene } from "./szenen/karte.js";
import { zustand } from "./zustand.js";
import { titelZeigen } from "./start.js";

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

spiel.events.once("bereit", () => titelZeigen({ beimStart: () => spiel.scene.start("karte") }));
