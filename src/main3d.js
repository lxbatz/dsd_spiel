// Einstieg: Die Chroniken von Eldoria in 3D (Three.js)
import { Spiel3D } from "./grafik3d/spiel.js";
import { zustand } from "./zustand.js";
import { titelZeigen } from "./start.js";

const spiel = new Spiel3D(document.getElementById("spiel"));
window.eldoria = { spiel3d: spiel, zustand };
spiel.vorbereiten();

titelZeigen({
  beimStart: () => spiel.starten(),
  titelBild: "boss_torwaechter",
  bildGroesse: 128,
  // Zu den Tafeln des Prologs laufen kurze Szenen (Reiche, Siegel, Morgrath, Missverständnisse, Dorf)
  intro: { szene: (nr) => spiel.introSzene(nr), ende: () => spiel.introEnde() },
});
