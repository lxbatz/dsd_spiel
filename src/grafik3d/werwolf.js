// Der Bibliothekar der Schatten – Endgegner von Scriptoria.
// Ein Werwolf im zerrissenen Bibliotheksmantel, mit einer zerbrochenen Brille auf der Schnauze.
// Nach dem Sieg verwandelt er sich zurück in Meister Ambros, einen lieben alten Bibliothekar.
//
// Liefert { gruppe, animieren(zeit, tempo, dt), pose(name) }.
// Posen: "wolf" (Werwolf, Standard) und "bibliothekar" (zurückverwandelt).
// Ursprung: zwischen den Füßen, Blick in Richtung +z (wie alle Figuren).

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL, gruppe, figurBauen } from "./figuren.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { textur, lichtTextur } from "./texturen.js";

const FELL = "#625c6c", FELL_DUNKEL = "#3e3a46", FELL_HELL = "#a49cae", MANTEL = "#3a2448", MANTEL_DUNKEL = "#24162e";
const KRALLE = "#e8e0cc", NASE = "#141016", AUGE = "#ffd23a", MAUL = "#3a0e14";

function bein(eltern, seite) {
  const h = gruppe(eltern, seite * 0.38, 1.25, 0);
  const t = new Teile();
  t.add(KAPSEL(), FELL, [0, -0.35, 0.12], [0.5, 0, 0], [0.24, 0.42, 0.24]);       // Oberschenkel
  t.add(KAPSEL(), FELL_DUNKEL, [0, -0.85, -0.05], [-0.45, 0, 0], [0.15, 0.35, 0.15]); // Unterschenkel (Wolfsbein)
  t.add(KAPSEL(), FELL_DUNKEL, [0, -1.12, 0.08], [0.2, 0, 0], [0.1, 0.12, 0.1]);
  t.add(KUGEL(), FELL_DUNKEL, [0, -1.2, 0.2], [0, 0, 0], [0.2, 0.09, 0.3]);          // Pfote
  for (const k of [-1, 0, 1]) t.add(KEGEL(6), KRALLE, [k * 0.08, -1.22, 0.5], [Math.PI / 2, 0, 0], [0.03, 0.12, 0.03], { art: "glanz" });
  t.in(h);
  return h;
}

function arm(eltern, seite) {
  const schulter = gruppe(eltern, seite * 0.72, 0.6, 0.05);
  const t = new Teile();
  t.add(KUGEL(), FELL, [0, 0, 0], [0, 0, 0], [0.3, 0.3, 0.3]);
  t.add(KAPSEL(), FELL, [seite * 0.08, -0.45, 0.05], [0, 0, seite * 0.15], [0.17, 0.4, 0.17]);
  t.add(KAPSEL(), FELL_DUNKEL, [seite * 0.14, -1.05, 0.15], [-0.3, 0, seite * 0.05], [0.13, 0.38, 0.13]);
  t.add(KUGEL(), FELL_DUNKEL, [seite * 0.16, -1.45, 0.28], [0, 0, 0], [0.16, 0.12, 0.14]);   // Pranke
  for (const k of [-1, 0, 1]) t.add(KEGEL(6), KRALLE, [seite * 0.16 + k * 0.06, -1.6, 0.35], [0.4, 0, 0], [0.025, 0.16, 0.025], { art: "glanz" });
  // Fellbüschel an der Schulter
  for (let i = 0; i < 4; i++) t.add(KEGEL(5), FELL_HELL, [seite * (0.18 + i * 0.03), 0.12 - i * 0.12, -0.15], [0.3, 0, seite * (1.2 + i * 0.2)], [0.08, 0.3, 0.06]);
  t.in(schulter);
  return schulter;
}

function kopfBauen(eltern) {
  const k = gruppe(eltern, 0, 1.05, 0.35);
  const t = new Teile();
  t.add(KUGEL(), FELL, [0, 0, 0], [0, 0, 0], [0.42, 0.4, 0.42]);
  // Wangenfell
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) t.add(KEGEL(5), FELL_HELL, [s * 0.36, -0.12 - i * 0.07, 0.05], [0, 0, s * (1.8 + i * 0.25)], [0.07, 0.24, 0.05]);
  // Schnauze
  t.add(KAPSEL(), FELL, [0, -0.08, 0.42], [Math.PI / 2, 0, 0], [0.2, 0.3, 0.17]);
  t.add(KUGEL(), NASE, [0, -0.02, 0.78], [0, 0, 0], [0.09, 0.07, 0.07], { art: "glanz" });
  // Unterkiefer mit Zähnen
  t.add(KAPSEL(), FELL_DUNKEL, [0, -0.26, 0.38], [Math.PI / 2 - 0.25, 0, 0], [0.15, 0.24, 0.1]);
  t.add(KASTEN(), MAUL, [0, -0.2, 0.5], [-0.2, 0, 0], [0.24, 0.05, 0.42]);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) t.add(KEGEL(4), KRALLE, [s * (0.06 + i * 0.015), -0.15, 0.68 - i * 0.08], [Math.PI, 0, 0], [0.025, 0.08, 0.025]);
  // Ohren
  for (const s of [-1, 1]) {
    t.add(KEGEL(4), FELL_DUNKEL, [s * 0.24, 0.4, -0.05], [0, 0, s * -0.35], [0.14, 0.38, 0.1]);
    t.add(KEGEL(4), "#8a5a6a", [s * 0.235, 0.37, 0.0], [0, 0, s * -0.35], [0.08, 0.26, 0.05]);
  }
  // Mähne
  for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.22; t.add(KEGEL(5), FELL_DUNKEL, [Math.sin(a) * 0.3, 0.1 - Math.abs(a) * 0.15, -0.3], [-0.9, a, 0], [0.12, 0.45, 0.08]); }
  t.in(k);
  // Glühende Augen
  const augen = [-0.15, 0.15].map((s) => {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), new THREE.MeshBasicMaterial({ color: AUGE, toneMapped: false }));
    a.position.set(s, 0.07, 0.36); k.add(a); return a;
  });
  // Zerbrochene runde Brille – ein Rest des Bibliothekars
  const brille = new Teile();
  for (const s of [-1, 1]) brille.add(RING(0.12), "#c8a050", [s * 0.15, 0.07, 0.42], [0, 0, 0], 0.1, { art: "glanz" });
  brille.add(KASTEN(), "#c8a050", [0, 0.09, 0.42], [0, 0, 0], [0.1, 0.015, 0.015], { art: "glanz" });
  brille.add(KASTEN(), "#c8a050", [0.3, 0.02, 0.34], [0, -0.7, -0.6], [0.22, 0.015, 0.015], { art: "glanz" });   // abgeknickter Bügel
  brille.in(k);
  const glas = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), new THREE.MeshStandardMaterial({ color: "#c8e0ff", transparent: true, opacity: 0.25, roughness: 0.1 }));
  glas.position.set(-0.15, 0.07, 0.43); k.add(glas);
  return { k, augen };
}

function wolfBauen() {
  const wurzel = new THREE.Group();
  const beine = [bein(wurzel, -1), bein(wurzel, 1)];
  const rumpf = gruppe(wurzel, 0, 1.25, 0);
  rumpf.rotation.x = 0.35;                              // gebeugt
  const t = new Teile();
  t.add(KUGEL(), FELL, [0, 0.45, 0], [0, 0, 0], [0.62, 0.78, 0.5]);
  t.add(KUGEL(), FELL_HELL, [0, 0.45, 0.28], [0, 0, 0], [0.38, 0.55, 0.25]);            // helle Brust
  t.add(KUGEL(), FELL, [0, 0.82, -0.05], [0, 0, 0], [0.85, 0.42, 0.55]);                // breite Schultern
  // Zerrissener Bibliotheksmantel (Kragen und Fetzen um die Hüfte)
  t.add(ZYL(0.85, 1, 14), MANTEL, [0, 0.05, 0], [0, 0, 0], [0.62, 0.45, 0.52]);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; t.add(KEGEL(3), i % 2 ? MANTEL : MANTEL_DUNKEL, [Math.sin(a) * 0.55, -0.32 - (i % 3) * 0.06, Math.cos(a) * 0.46], [Math.PI, a, 0], [0.16, 0.35, 0.05]); }
  t.add(RING(0.35), MANTEL_DUNKEL, [0, 1.0, 0.02], [Math.PI / 2 - 0.2, 0, 0], [0.5, 0.42, 0.5]);
  // Schweif
  for (let i = 0; i < 5; i++) t.add(KUGEL(), i < 4 ? FELL : FELL_HELL, [0, -0.15 - i * 0.12, -0.5 - i * 0.18], [0, 0, 0], 0.2 - i * 0.025);
  t.in(rumpf);
  const arme = [arm(rumpf, -1), arm(rumpf, 1)];
  const { k: kopf, augen } = kopfBauen(rumpf);
  // Ein altes Buch hängt noch an einer Kette am Gürtel
  const buch = new Teile();
  buch.add(KASTEN(), "#6a2a1a", [0.5, -0.05, 0.35], [0.2, 0.3, 0.1], [0.28, 0.36, 0.08]);
  buch.add(KASTEN(), "#e8dcc0", [0.5, -0.05, 0.35], [0.2, 0.3, 0.1], [0.24, 0.32, 0.09]);
  buch.in(rumpf);
  wurzel.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { wurzel, rumpf, kopf, arme, beine, augen };
}

export function bibliothekarBauen() {
  const gruppeAussen = new THREE.Group();
  const w = wolfBauen();
  w.wurzel.scale.setScalar(1.45);
  gruppeAussen.add(w.wurzel);
  // Meister Ambros – der zurückverwandelte Bibliothekar
  const ambros = figurBauen(AUSSEHEN.npc_ambros, "npc_ambros");
  ambros.gruppe.visible = false;
  gruppeAussen.add(ambros.gruppe);
  // Lichtwirbel bei der Verwandlung
  const funken = [];
  for (let i = 0; i < 24; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,255,255,1)")), color: i % 2 ? "#ffe8a0" : "#b8f0ff", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.4);
    gruppeAussen.add(s); funken.push(s);
  }

  let ziel = "wolf", wechsel = 0;   // wechsel: 0 = Wolf, 1 = Bibliothekar
  return {
    gruppe: gruppeAussen,
    pose(name) { ziel = name === "bibliothekar" ? "bibliothekar" : "wolf"; },
    sofort(name) { ziel = name; wechsel = name === "bibliothekar" ? 1 : 0; },
    animieren(zeit, tempo = 0, dt = 0.016) {
      const soll = ziel === "bibliothekar" ? 1 : 0;
      wechsel += Math.sign(soll - wechsel) * Math.min(Math.abs(soll - wechsel), dt * 0.6);
      // Verwandlung: Wolf schrumpft und verblasst, Bibliothekar wächst, Funken wirbeln
      const wolfSkala = 1.45 * (1 - Math.min(1, wechsel * 1.6));
      w.wurzel.visible = wolfSkala > 0.02;
      w.wurzel.scale.setScalar(Math.max(0.001, wolfSkala));
      const mensch = Math.max(0, (wechsel - 0.4) / 0.6);
      ambros.gruppe.visible = mensch > 0.01;
      ambros.gruppe.scale.setScalar(Math.max(0.001, mensch));
      const wirbel = Math.sin(Math.min(1, wechsel) * Math.PI);
      funken.forEach((s, i) => {
        const a = zeit * 3 + (i / funken.length) * Math.PI * 2;
        s.position.set(Math.cos(a) * 1.2, 0.3 + (i % 6) * 0.45 + Math.sin(zeit * 2 + i) * 0.1, Math.sin(a) * 1.2);
        s.material.opacity = wirbel * 0.9;
      });
      if (w.wurzel.visible) {
        const atem = Math.sin(zeit * 1.6);
        w.rumpf.scale.set(1 + atem * 0.03, 1 + atem * 0.02, 1 + atem * 0.03);
        w.kopf.rotation.y = Math.sin(zeit * 0.5) * 0.3;
        w.kopf.rotation.x = -0.25 + Math.sin(zeit * 0.8) * 0.06;
        w.arme.forEach((a, i) => { a.rotation.x = Math.sin(zeit * 1.2 + i * Math.PI) * 0.12 - 0.1; });
        const glut = 0.75 + Math.sin(zeit * 3) * 0.25;
        w.augen.forEach((a) => a.material.color.setRGB(1, 0.82 * glut, 0.22 * glut));
      }
      if (ambros.gruppe.visible) ambros.animieren(zeit, tempo, dt);
    },
  };
}
