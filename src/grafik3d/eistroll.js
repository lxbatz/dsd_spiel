// Der Schweigekönig – Endgegner von Vocantia.
// Ein großer Eistroll mit gefrorener Krone, Eiszapfenbart und schweren Ketten vor seinem Eisthron.
// Nach dem Sieg zerspringen die Ketten, und der Troll stapft geschlagen hinauf auf den Gipfel,
// wo er sich in den letzten Schnee setzt (er verwandelt sich NICHT zurück).
//
// Liefert { gruppe, animieren(zeit, tempo, dt), pose(name), sofort(name) }.
// Posen: "thron" (Standard) und "gipfel" (zurückgezogen).
// Ursprung: Mitte vor dem Thron, Blick in Richtung +z (wie alle Figuren).

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL, gruppe } from "./figuren.js";

const HAUT = "#8ea8bc", HAUT_DUNKEL = "#5e7890", HAUT_HELL = "#c4d6e4", FELL = "#7a6a58", FELL_DUNKEL = "#4e4234";
const EIS = "#bfe8ff", EIS_HELL = "#e8f8ff", EISEN = "#4a4e58", AUGE = "#8af0ff";

/** Ziel auf dem Gipfel, relativ zum Thron (passt zum Gipfel in vocantia3d.js) */
export const GIPFEL = new THREE.Vector3(6, 8, -13);

function eisMat(opacity = 0.85) {
  return new THREE.MeshStandardMaterial({ color: EIS, emissive: "#3aa8ff", emissiveIntensity: 0.35, roughness: 0.15, metalness: 0.1, transparent: true, opacity });
}

function bein(eltern, seite) {
  const h = gruppe(eltern, seite * 0.55, 1.5, 0);
  const t = new Teile();
  t.add(KAPSEL(), HAUT, [0, -0.45, 0], [0, 0, 0], [0.36, 0.5, 0.36]);
  t.add(KAPSEL(), HAUT_DUNKEL, [0, -1.05, 0.02], [0, 0, 0], [0.3, 0.42, 0.3]);
  t.add(KUGEL(), HAUT_DUNKEL, [0, -1.42, 0.16], [0, 0, 0], [0.36, 0.16, 0.48]);      // großer Fuß
  for (const k of [-1, 0, 1]) t.add(KUGEL(), HAUT_HELL, [k * 0.13, -1.45, 0.58], [0, 0, 0], [0.09, 0.08, 0.09]);
  // Fellwickel an der Wade
  t.add(ZYL(1, 1, 10), FELL, [0, -0.95, 0], [0, 0, 0], [0.34, 0.28, 0.34], { art: "stoff" });
  t.in(h);
  return h;
}

function arm(eltern, seite) {
  const schulter = gruppe(eltern, seite * 1.05, 1.15, 0);
  const t = new Teile();
  t.add(KUGEL(), HAUT, [0, 0, 0], [0, 0, 0], [0.5, 0.48, 0.48]);
  t.add(KAPSEL(), HAUT, [seite * 0.12, -0.65, 0.02], [0, 0, seite * 0.12], [0.3, 0.55, 0.3]);
  t.add(KAPSEL(), HAUT_DUNKEL, [seite * 0.2, -1.45, 0.12], [-0.2, 0, 0], [0.27, 0.5, 0.27]);
  t.add(KUGEL(), HAUT_DUNKEL, [seite * 0.22, -2.0, 0.22], [0, 0, 0], [0.34, 0.3, 0.32]);  // Faust
  // Schnee auf der Schulter
  t.add(KUGEL_K(), "#f4faff", [0, 0.32, 0], [0, 0, 0], [0.42, 0.18, 0.4]);
  // Eiserne Handschelle
  t.add(ZYL(1, 1, 12), EISEN, [seite * 0.2, -1.7, 0.16], [-0.2, 0, 0], [0.32, 0.18, 0.32], { art: "glanz" });
  t.in(schulter);
  return schulter;
}

function kopfBauen(eltern) {
  const k = gruppe(eltern, 0, 1.65, 0.25);
  const t = new Teile();
  t.add(KUGEL(), HAUT, [0, 0, 0], [0, 0, 0], [0.62, 0.55, 0.58]);
  t.add(KUGEL(), HAUT_DUNKEL, [0, 0.2, 0.35], [0, 0, 0], [0.55, 0.16, 0.3]);       // schwere Stirn
  t.add(KUGEL(), HAUT_HELL, [0, -0.04, 0.56], [0, 0, 0], [0.16, 0.18, 0.16]);      // Knollennase
  t.add(KUGEL(), HAUT_DUNKEL, [0, -0.3, 0.32], [0, 0, 0], [0.48, 0.24, 0.32]);     // Unterkiefer
  for (const s of [-1, 1]) {
    t.add(KEGEL(6), "#eef2e6", [s * 0.26, -0.22, 0.5], [-0.2, 0, s * -0.2], [0.07, 0.24, 0.07]);   // Hauer
    t.add(KUGEL(), HAUT_DUNKEL, [s * 0.6, 0.02, 0], [0, 0, s * 0.4], [0.12, 0.2, 0.08]);           // Ohren
  }
  // Eiszapfenbart
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.1, l = 0.35 + (1 - Math.abs(i - 4) / 4) * 0.5;
    t.add(KEGEL(5), i % 2 ? EIS : EIS_HELL, [x, -0.5 - l / 2, 0.38 - Math.abs(i - 4) * 0.03], [Math.PI, 0, 0], [0.06, l, 0.06], { art: "glanz" });
  }
  t.in(k);
  // Leuchtende, eisblaue Augen
  const augen = [-0.2, 0.2].map((s) => {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), new THREE.MeshBasicMaterial({ color: AUGE, toneMapped: false }));
    a.position.set(s, 0.08, 0.5); k.add(a); return a;
  });
  // Gefrorene Krone: Reif mit Eisspitzen
  const krone = new THREE.Group();
  krone.position.set(0, 0.42, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 20), eisMat(0.95));
  ring.rotation.x = Math.PI / 2;
  krone.add(ring);
  const zacken = new THREE.ConeGeometry(0.08, 1, 5);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const z = new THREE.Mesh(zacken, eisMat(0.9));
    const h = i === 0 ? 0.55 : 0.32 + (i % 2) * 0.12;
    z.scale.set(1, h, 1);
    z.position.set(Math.sin(a) * 0.42, h / 2 + 0.03, Math.cos(a) * 0.42);
    krone.add(z);
  }
  k.add(krone);
  return { k, augen, krone };
}

/** Schwere Kette aus Gliedern zwischen zwei Punkten (lokal), hängt leicht durch */
function kette(t, a, b, glieder = 10, durchhang = 0.4) {
  for (let i = 0; i <= glieder; i++) {
    const u = i / glieder;
    const x = a[0] + (b[0] - a[0]) * u, z = a[2] + (b[2] - a[2]) * u;
    const y = a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * durchhang;
    t.add(RING(0.35), EISEN, [x, y, z], [i % 2 ? 0 : Math.PI / 2, Math.atan2(b[0] - a[0], b[2] - a[2]), 0], [0.11, 0.11, 0.2], { art: "glanz" });
  }
}

function thronBauen() {
  const g = new THREE.Group();
  const m = eisMat(0.8);
  const sitz = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 2.0), m);
  sitz.position.set(0, 0.7, -1.4);
  const lehne = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.8, 0.7), m);
  lehne.position.set(0, 2.4, -2.4);
  g.add(sitz, lehne);
  // Eiszacken auf der Lehne
  const zacke = new THREE.ConeGeometry(0.3, 1, 5);
  for (let i = 0; i < 7; i++) {
    const z = new THREE.Mesh(zacke, m);
    const h = 1 + (1 - Math.abs(i - 3) / 3) * 1.6;
    z.scale.set(1, h, 1);
    z.position.set(-1.5 + i * 0.5, 4.8 + h / 2, -2.4);
    g.add(z);
  }
  for (const s of [-1, 1]) {
    const lehnteil = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 2.0), m);
    lehnteil.position.set(s * 1.75, 1.9, -1.4);
    g.add(lehnteil);
  }
  // Ketten-Anker im Boden
  const t = new Teile();
  for (const s of [-1, 1]) t.add(ZYL(1, 1, 8), EISEN, [s * 2.4, 0.15, 0.6], [0, 0, 0], [0.25, 0.3, 0.25], { art: "glanz" });
  t.in(g);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/** opt.thron: mit Eisthron · opt.ziel: wohin er sich zurückzieht (in der Galerie bleibt er stehen und setzt sich) */
export function eistrollBauen({ thron = true, ziel: rueckzug = GIPFEL } = {}) {
  const aussen = new THREE.Group();
  if (thron) aussen.add(thronBauen());
  const wurzel = new THREE.Group();          // bewegt sich beim Rückzug
  aussen.add(wurzel);
  const koerper = new THREE.Group();
  koerper.scale.setScalar(1.25);
  wurzel.add(koerper);
  const beine = [bein(koerper, -1), bein(koerper, 1)];
  const rumpf = gruppe(koerper, 0, 1.5, 0);
  rumpf.rotation.x = 0.18;
  const t = new Teile();
  t.add(KUGEL(), HAUT, [0, 0.55, 0], [0, 0, 0], [0.95, 0.95, 0.75]);           // großer Bauch
  t.add(KUGEL(), HAUT_HELL, [0, 0.45, 0.4], [0, 0, 0], [0.62, 0.62, 0.4]);
  t.add(KUGEL(), HAUT, [0, 1.12, -0.1], [0, 0, 0], [1.1, 0.5, 0.66]);          // breite Schultern
  // Fellmantel und Lendenschurz
  t.add(ZYL(0.9, 1, 14), FELL, [0, 0.0, 0], [0, 0, 0], [0.92, 0.5, 0.75], { art: "stoff" });
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; t.add(KEGEL(3), i % 2 ? FELL : FELL_DUNKEL, [Math.sin(a) * 0.86, -0.38, Math.cos(a) * 0.7], [Math.PI, a, 0], [0.2, 0.4, 0.06], { art: "stoff" }); }
  t.add(RING(0.3), FELL_DUNKEL, [0, 1.25, -0.05], [Math.PI / 2 - 0.15, 0, 0], [0.8, 0.62, 0.7], { art: "stoff" });
  // Raureif und Eiszapfen am Mantel
  for (let i = 0; i < 8; i++) { const a = -1.2 + i * 0.34; t.add(KEGEL(4), EIS_HELL, [Math.sin(a) * 0.8, 0.95, Math.cos(a) * 0.55 - 0.1], [Math.PI, 0, 0], [0.04, 0.22, 0.04], { art: "glanz" }); }
  t.in(rumpf);
  const arme = [arm(rumpf, -1), arm(rumpf, 1)];
  arme.forEach((a, i) => { a.rotation.z = (i ? -1 : 1) * 0.1; });
  const { k: kopf, augen, krone } = kopfBauen(rumpf);

  // Schwere Ketten: um den Bauch und von den Handgelenken zu den Ankern am Boden
  const ketten = new THREE.Group();
  const tk = new Teile();
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    tk.add(RING(0.35), EISEN, [Math.sin(a) * 1.22, 2.0 + Math.sin(a * 2) * 0.05, Math.cos(a) * 0.98], [i % 2 ? 0 : Math.PI / 2, a + Math.PI / 2, 0], [0.12, 0.12, 0.22], { art: "glanz" });
  }
  kette(tk, [-1.6, 2.2, 0.4], [-2.4, 0.2, 0.6], 9, 0.2);
  kette(tk, [1.6, 2.2, 0.4], [2.4, 0.2, 0.6], 9, 0.2);
  kette(tk, [0, 2.0, 1.1], [0, 0.2, 2.2], 7, 0.4);
  tk.in(ketten);
  wurzel.add(ketten);
  // Bruchstücke, die beim Zerspringen wegfliegen
  const splitter = [];
  const splitterGeo = new THREE.TorusGeometry(0.12, 0.04, 6, 10);
  const splitterMat = new THREE.MeshStandardMaterial({ color: EISEN, roughness: 0.3, metalness: 0.8 });
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Mesh(splitterGeo, splitterMat);
    s.visible = false;
    s.userData.v = new THREE.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 3, (Math.random() - 0.5) * 6);
    aussen.add(s); splitter.push(s);
  }

  aussen.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  let ziel = "thron", fortschritt = 0, splitterZeit = -1;  // fortschritt: 0 = am Thron, 1 = auf dem Gipfel
  const start = new THREE.Vector3(0, 0, thron ? 0.6 : 0), rand = thron ? new THREE.Vector3(1.5, 0, -3.5) : start;
  return {
    gruppe: aussen,
    pose(name) {
      if (name === "gipfel" && ziel !== "gipfel") splitterZeit = 0;
      ziel = name === "gipfel" ? "gipfel" : "thron";
    },
    sofort(name) {
      ziel = name === "gipfel" ? "gipfel" : "thron";
      fortschritt = ziel === "gipfel" ? 1 : 0;
      splitterZeit = -1;
    },
    animieren(zeit, tempo = 0, dt = 0.016) {
      const soll = ziel === "gipfel" ? 1 : 0;
      // Erst zerspringen die Ketten, dann stapft der König langsam davon
      const warten = splitterZeit >= 0 && splitterZeit < 1.6;
      if (!warten) fortschritt += Math.sign(soll - fortschritt) * Math.min(Math.abs(soll - fortschritt), dt / 14);
      ketten.visible = ziel === "thron" && fortschritt < 0.01;
      if (splitterZeit >= 0) {
        splitterZeit += dt;
        splitter.forEach((s, i) => {
          s.visible = splitterZeit < 3;
          const u = splitterZeit;
          s.position.set(s.userData.v.x * u, 2 + s.userData.v.y * u - 4.9 * u * u, 0.6 + s.userData.v.z * u);
          if (s.position.y < 0.05) s.position.y = 0.05;
          s.rotation.set(u * 5 + i, u * 3, 0);
        });
        if (splitterZeit > 3) splitterZeit = -1;
      }
      // Weg: vom Thron zum Rand des Plateaus, dann den Hang hinauf zum Gipfel
      const p = fortschritt;
      const unterwegs = p > 0.001 && p < 0.999;
      if (p < 0.25) wurzel.position.lerpVectors(start, rand, p / 0.25);
      else wurzel.position.lerpVectors(rand, rueckzug, (p - 0.25) / 0.75);
      // Blickrichtung: in Laufrichtung; oben setzt er sich und schaut halb abgewandt ins Tal
      const [von, nach] = p < 0.25 ? [start, rand] : [rand, rueckzug];
      const laeuft = unterwegs && nach.distanceTo(von) > 0.01;
      wurzel.rotation.y = p >= 0.999 ? (thron ? 0.5 : 0) : laeuft ? Math.atan2(nach.x - von.x, nach.z - von.z) : 0;
      const sitzt = p >= 0.999;
      const schritt = unterwegs ? Math.sin(zeit * 4.5) : 0;
      beine[0].rotation.x = sitzt ? -1.4 : schritt * 0.45;
      beine[1].rotation.x = sitzt ? -1.3 : -schritt * 0.45;
      koerper.position.y = sitzt ? -0.9 : unterwegs ? Math.abs(schritt) * 0.08 : 0;
      const atem = Math.sin(zeit * 1.2);
      rumpf.scale.set(1 + atem * 0.025, 1 + atem * 0.02, 1 + atem * 0.025);
      rumpf.rotation.x = sitzt ? 0.45 : 0.18;
      kopf.rotation.x = sitzt ? 0.35 : -0.1 + Math.sin(zeit * 0.7) * 0.05;
      kopf.rotation.y = sitzt ? -0.4 : Math.sin(zeit * 0.4) * 0.25;
      arme.forEach((a, i) => {
        const s = i ? -1 : 1;
        a.rotation.x = sitzt ? -0.9 : unterwegs ? -schritt * (i ? -0.3 : 0.3) : -0.15 + Math.sin(zeit * 1.1 + i * Math.PI) * 0.08;
        a.rotation.z = s * (sitzt ? 0.25 : 0.1);
      });
      // Die Krone tropft und verliert nach dem Sieg ihr Leuchten
      const glut = ziel === "thron" ? 0.75 + Math.sin(zeit * 2.5) * 0.25 : 0.35;
      augen.forEach((a) => a.material.color.setRGB(0.54 * glut, 0.94 * glut, glut));
      krone.children.forEach((c) => { if (c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = ziel === "thron" ? 0.35 + Math.sin(zeit * 2) * 0.1 : 0.08; });
      krone.rotation.z = ziel === "gipfel" ? 0.25 : 0;   // schief, nach der Niederlage
    },
  };
}
