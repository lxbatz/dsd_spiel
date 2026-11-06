// Einstieg: 3D-Version (Three.js), Demo des Dorfes
import { Spiel3D } from "./grafik3d/spiel.js";
import { zustand } from "./zustand.js";
import { titelZeigen } from "./start.js";

const spiel = new Spiel3D(document.getElementById("spiel"));
window.eldoria = { spiel3d: spiel, zustand };
spiel.vorbereiten();

titelZeigen({
  beimStart: () => spiel.starten(),
  untertitel: "3D-Version · Demo: Das Dorf der Ankömmlinge",
  titelBild: "boss_torwaechter",
  bildGroesse: 128,
});
