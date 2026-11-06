// Einstieg: 16-Bit-Version (SNES-Stil)
import { Boot16, Karte16 } from "./grafik16/szene.js";
import { zustand } from "./zustand.js";
import { titelZeigen } from "./start.js";

const spiel = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "spiel",
  width: 384,
  height: 240,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#0e0c1a",
  physics: { default: "arcade", arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot16, Karte16],
});

window.eldoria = { spiel, zustand };

spiel.events.once("bereit", () => titelZeigen({
  beimStart: () => spiel.scene.start("karte16"),
  untertitel: "16-Bit-Version",
  titelBild: "boss_torwaechter",
  bildGroesse: 128,
}));
