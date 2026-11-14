// 3D: Vocantia – ein Bergdorf im ewigen Winter.
// Hohe verschneite Berge, Holzhäuser mit Schneedächern und Eiszapfen, Tannen, ein gefrorener See,
// ein gefrorener Brunnen, Schneefall und ein Frost-Rand am Bildschirm.
// Die eingefrorenen Bewohner stehen in einer Hülle aus Eis. Nach dem Sieg über den Schweigekönig
// taut das ganze Tal auf: Schnee und Eis schmelzen, Gras und Blumen wachsen, Schmetterlinge fliegen.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KASTEN, KEGEL, figurBauen } from "./figuren.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { schmetterlingeBauen, voegelBauen } from "./effekte.js";
import { HINDERNIS, BLOCKIERT, bloecke, SEE } from "../welt/vocantia_layout.js";
import { zustand } from "../zustand.js";
import { eistrollBauen, GIPFEL } from "./eistroll.js";

const PX = 16;
const FELS = "#7c8896", FELS_DUNKEL = "#566270", SCHNEE = "#f4f8ff", HOLZ = "#6a4a32", HOLZ_DUNKEL = "#4a3222";
const QUESTS = ["vocantia_q1", "vocantia_q2", "vocantia_q3", "vocantia_q4", "vocantia_q5"];

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

function bodenTextur(raster, winter) {
  const W = raster[0].length * PX, H = raster.length * PX;
  const [c, g] = leinwand(W, H);
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    const x = tx * PX, y = ty * PX;
    const berg = z === "#";
    if (winter) {
      g.fillStyle = berg ? "#d8e2ee" : "#eef4fc";
      g.fillRect(x, y, PX, PX);
      for (let i = 0; i < 8; i++) {
        const v = hash(tx, ty, i);
        g.fillStyle = v > 0.6 ? "rgba(255,255,255,0.9)" : v > 0.3 ? "rgba(190,210,235,0.5)" : "rgba(160,185,215,0.35)";
        g.fillRect(x + hash(tx, i, 1) * PX, y + hash(ty, i, 2) * PX, 3, 2);
      }
    } else {
      g.fillStyle = berg ? "#6a7a5a" : "#5a9a44";
      g.fillRect(x, y, PX, PX);
      for (let i = 0; i < 10; i++) {
        const v = hash(tx, ty, i + 20);
        g.fillStyle = v > 0.6 ? "rgba(120,190,80,0.6)" : v > 0.3 ? "rgba(60,120,40,0.5)" : "rgba(140,120,70,0.35)";
        g.fillRect(x + hash(tx, i, 3) * PX, y + hash(ty, i, 4) * PX, 2, 3);
      }
    }
  }));
  // Fußspuren-Weg vom Portal zum Brunnen und zum Bergpfad (nur im Winter sichtbar)
  if (winter) {
    g.strokeStyle = "rgba(170,190,215,0.55)"; g.lineWidth = PX * 0.9; g.lineCap = "round";
    g.beginPath(); g.moveTo(23 * PX, 42 * PX); g.lineTo(23.5 * PX, 26 * PX); g.lineTo(23.5 * PX, 8 * PX); g.stroke();
  } else {
    g.strokeStyle = "rgba(150,120,80,0.6)"; g.lineWidth = PX * 1.2; g.lineCap = "round";
    g.beginPath(); g.moveTo(23 * PX, 42 * PX); g.lineTo(23.5 * PX, 26 * PX); g.lineTo(23.5 * PX, 8 * PX); g.stroke();
  }
  g.filter = "blur(2px)";
  g.drawImage(c, 0, 0);
  g.filter = "none";
  return c;
}

function eisTextur() {
  const [c, g] = leinwand(256, 256);
  g.fillStyle = "#cfeaff"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) {
    let x = hash(i, 1, 5) * 256, y = hash(i, 2, 5) * 256;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 4; k++) { x += (hash(i, k, 6) - 0.5) * 60; y += (hash(i, k, 7) - 0.5) * 60; g.lineTo(x, y); }
    g.stroke();
  }
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(150,200,240,${hash(i, 3, 5) * 0.4})`; g.fillRect(hash(i, 4, 5) * 256, hash(i, 5, 5) * 256, 4, 4); }
  return c;
}

function frostRand() {
  const d = document.createElement("div");
  d.className = "frost-rand";
  Object.assign(d.style, {
    position: "fixed", inset: "0", pointerEvents: "none", zIndex: "3", opacity: "0", transition: "opacity 1.2s",
    background: "radial-gradient(ellipse at center, rgba(255,255,255,0) 58%, rgba(200,230,255,0.22) 78%, rgba(235,248,255,0.6) 100%)",
    boxShadow: "inset 0 0 90px rgba(190,225,255,0.55)",
  });
  document.body.append(d);
  return d;
}

let _tex = null;
function texturen() {
  if (_tex) return _tex;
  _tex = { licht: textur(lichtTextur("rgba(255,255,255,1)")), eis: textur(eisTextur(), { wiederholen: true }) };
  return _tex;
}

// ---------- Auftauen: gemeinsamer Zustand ----------

/** tau: 0 = tiefer Winter, 1 = Frühling. waerme: 0..1 je nach befreiten Bewohnern. */
const welt = { tau: 0, waerme: 0 };
const sollTau = () => (zustand.erledigt.vocantia_finale ? 1 : 0);
const sollWaerme = () => QUESTS.filter((q) => zustand.erledigt[q]).length / 5;

// ---------- Bausteine ----------

function tanne(t, schnee, x, z, s, seed) {
  t.add(ZYL(0.6, 1, 6), HOLZ_DUNKEL, [x, s * 0.4, z], [0, 0, 0], [s * 0.18, s * 0.8, s * 0.18]);
  for (let k = 0; k < 4; k++) {
    const h = s * (0.9 + k * 0.75), r = s * (1.15 - k * 0.24);
    t.add(KEGEL(8), k % 2 ? "#1e4a34" : "#24563c", [x, h, z], [0, seed + k, 0], [r, s * 1.1, r]);
    schnee.add(KEGEL(8), SCHNEE, [x, h + s * 0.2, z], [0, seed + k, 0], [r * 0.82, s * 0.62, r * 0.82]);
  }
}

/** Holzhaus mit Satteldach. Schnee und Eiszapfen kommen in eigene Sammler (sie tauen später). */
function haus(t, schnee, zapfen, fenster, b, { dach = "#8a3a2a", wand = "#7a5638", hoehe = 3.2, giebel = false } = {}) {
  const x = (b.x + b.w / 2) * E, z = (b.y + b.h / 2) * E, w = b.w * E - 0.4, d = b.h * E - 0.4;
  t.add(KASTEN(), FELS_DUNKEL, [x, 0.3, z], [0, 0, 0], [w + 0.2, 0.6, d + 0.2]);
  t.add(KASTEN(), wand, [x, 0.6 + hoehe / 2, z], [0, 0, 0], [w, hoehe, d]);
  // Balken
  for (let i = 0; i < 5; i++) t.add(KASTEN(), HOLZ_DUNKEL, [x, 0.8 + i * (hoehe / 5), z + d / 2 + 0.02], [0, 0, 0], [w + 0.05, 0.08, 0.04]);
  // Satteldach (Prisma aus einem dreiseitigen Zylinder, quer gelegt)
  // Dreiseitiger Zylinder, quer gelegt, Spitze nach oben: Höhe dh, Tiefe d + Überstand
  const dh = Math.min(w, d) * 0.45 + 0.8, top = 0.6 + hoehe;
  const tiefe = (d / 2 + 0.6) / 0.866, hz = dh / 1.5;
  const LIEGT = [0, Math.PI / 2, Math.PI / 2, "ZYX"];
  t.add(ZYL(1, 1, 3), dach, [x, top + hz * 0.5, z], LIEGT, [tiefe, w + 0.8, hz]);
  schnee.add(ZYL(1, 1, 3), SCHNEE, [x, top + hz * 0.5 + 0.12, z], LIEGT, [tiefe * 0.98, w + 0.9, hz * 0.98]);
  if (giebel) for (const s of [-1, 1]) t.add(KEGEL(4), HOLZ_DUNKEL, [x + s * (w / 2 + 0.4), top + dh + 0.2, z], [0, 0, s * 0.5], [0.15, 1.2, 0.15]);
  // Tür und Fenster (vorne, Richtung Süden)
  t.add(KASTEN(), HOLZ_DUNKEL, [x - w * 0.25, 0.6 + 1.0, z + d / 2 + 0.03], [0, 0, 0], [0.9, 2.0, 0.06]);
  fenster.push([x + w * 0.2, 0.6 + hoehe * 0.55, z + d / 2 + 0.04]);
  if (w > 6) fenster.push([x - w * 0.42, 0.6 + hoehe * 0.55, z + d / 2 + 0.04], [x + w * 0.42, 0.6 + hoehe * 0.55, z + d / 2 + 0.04]);
  // Eiszapfen an der Traufe vorne und hinten
  const traufeY = top + 0.05;
  for (const s of [-1, 1]) for (let i = 0; i < Math.floor(w / 0.55); i++) {
    const l = 0.3 + hash(b.x * 7 + i, b.y + s, 3) * 0.7;
    zapfen.push([x - w / 2 + 0.2 + i * 0.55, traufeY - l / 2, z + s * (d / 2 + 0.5), l]);
  }
}

function rundhaus(t, schnee, fenster, b) {
  const x = (b.x + b.w / 2) * E, z = (b.y + b.h / 2) * E, r = Math.min(b.w, b.h) * E * 0.48;
  t.add(ZYL(1, 1, 18), FELS_DUNKEL, [x, 0.4, z], [0, 0, 0], [r + 0.3, 0.8, r + 0.3]);
  t.add(ZYL(1, 1, 18), "#6a4c34", [x, 2.6, z], [0, 0, 0], [r, 4.2, r]);
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; t.add(KASTEN(), HOLZ_DUNKEL, [x + Math.sin(a) * r, 2.6, z + Math.cos(a) * r], [0, a, 0], [0.18, 4.2, 0.12]); }
  t.add(KEGEL(18), "#7a3a2a", [x, 6.6, z], [0, 0, 0], [r + 1.0, 3.8, r + 1.0]);
  schnee.add(KEGEL(18), SCHNEE, [x, 6.75, z], [0, 0, 0], [r + 0.95, 3.6, r + 0.95]);
  t.add(ZYL(1, 1, 8), HOLZ_DUNKEL, [x, 9, z], [0, 0, 0], [0.12, 1.6, 0.12]);
  t.add(KASTEN(), HOLZ_DUNKEL, [x, 1.7, z + r + 0.02], [0, 0, 0], [1.4, 2.4, 0.1]);
  fenster.push([x - r * 0.6, 3.2, z + r * 0.82], [x + r * 0.6, 3.2, z + r * 0.82]);
}

// ---------- Objekte ----------

function eishuelle() {
  const mat = new THREE.MeshStandardMaterial({ color: "#cfeeff", emissive: "#4ab0ff", emissiveIntensity: 0.18, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.62, flatShading: true, depthWrite: false });
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat);
  m.scale.set(0.62, 1.18, 0.58);
  m.position.y = 1.05;
  m.renderOrder = 2;
  return m;
}

/** Eingefrorene Figur: Figur in einer Eishülle. Taut auf, wenn ihre Quest erledigt ist. */
function eisfigurBauen(o, animationen) {
  const f = figurBauen(AUSSEHEN[o.bild], o.bild);
  const huelle = eishuelle();
  f.gruppe.add(huelle);
  // Reif-Glitzer um die Figur
  const glitzer = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#e8f8ff", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.25); f.gruppe.add(s); glitzer.push(s);
  }
  let frei = 0, ziel = 0;
  f.gruppe.userData.setzeLeuchten = (an, sofort) => { ziel = an ? 1 : 0; if (sofort) frei = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    frei += Math.sign(ziel - frei) * Math.min(Math.abs(ziel - frei), dt * 0.5);
    huelle.visible = frei < 0.99;
    huelle.material.opacity = 0.62 * (1 - frei);
    huelle.scale.set(0.62 + frei * 0.15, 1.18 * (1 - frei * 0.85), 0.58 + frei * 0.15);
    huelle.position.y = 1.05 * (1 - frei * 0.85);
    glitzer.forEach((s, i) => {
      const a = zeit * 0.8 + i * 1.05;
      s.position.set(Math.cos(a) * 0.7, 0.4 + ((zeit * 0.3 + i / 6) % 1) * 1.8, Math.sin(a) * 0.6);
      s.material.opacity = frei < 0.99 ? 0.5 + Math.sin(zeit * 3 + i) * 0.3 : 0;
    });
  });
  const figur = {
    gruppe: f.gruppe,
    starr: () => frei < 0.5,
    animieren: (zeit, tempo, dt) => { if (frei > 0.5) f.animieren(zeit, tempo, dt); },
    sprechen: (...a) => { if (frei > 0.5) f.sprechen?.(...a); },
  };
  return { modell: f.gruppe, figur };
}

function brunnenBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(1, 1, 20), "#8a929e", [0, 0.45, 0], [0, 0, 0], [1.7, 0.9, 1.7]);
  t.add(ZYL(1, 1, 20), "#6a727e", [0, 0.92, 0], [0, 0, 0], [1.8, 0.12, 1.8]);
  t.add(ZYL(1, 1, 10), "#8a929e", [0, 1.4, 0], [0, 0, 0], [0.25, 1.4, 0.25]);
  t.add(ZYL(1, 0.6, 14), "#8a929e", [0, 2.15, 0], [0, 0, 0], [0.75, 0.2, 0.75]);
  t.in(g);
  // Gefrorenes Wasser: Eisfläche und erstarrter Strahl
  const eisMat = new THREE.MeshStandardMaterial({ color: "#d4f0ff", emissive: "#5ab8ff", emissiveIntensity: 0.25, roughness: 0.1, transparent: true, opacity: 0.85 });
  const flaeche = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.1, 20), eisMat);
  flaeche.position.y = 0.88;
  const strahl = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const z = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.1, 5), eisMat);
    z.position.set(Math.cos(a) * 0.6, 1.75, Math.sin(a) * 0.6);
    z.rotation.set(Math.PI, 0, 0);
    strahl.add(z);
  }
  const spitze = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.1, 6), eisMat);
  spitze.position.y = 2.8;
  strahl.add(spitze);
  g.add(flaeche, strahl);
  // Wasser nach dem Auftauen
  const wasserMat = new THREE.MeshStandardMaterial({ color: "#3a8ac8", roughness: 0.1, transparent: true, opacity: 0 });
  const wasser = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.08, 20), wasserMat);
  wasser.position.y = 0.86;
  g.add(wasser);
  const tropfen = [];
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#bfe6ff", transparent: true, opacity: 0, depthWrite: false }));
    s.scale.setScalar(0.18); g.add(s); tropfen.push(s);
  }
  g.userData.setzeLeuchten = () => {};
  animationen.push((zeit) => {
    const tau = welt.tau;
    flaeche.material.opacity = 0.85 * (1 - tau);
    strahl.visible = tau < 0.6;
    strahl.scale.setScalar(Math.max(0.01, 1 - tau * 1.6));
    wasserMat.opacity = tau * 0.85;
    tropfen.forEach((s, i) => {
      const u = (zeit * 0.9 + i / 16) % 1, a = (i / 16) * Math.PI * 2;
      s.position.set(Math.cos(a) * u * 1.2, 2.3 + u * 0.8 - u * u * 2.2, Math.sin(a) * u * 1.2);
      s.material.opacity = tau > 0.6 ? 0.8 * (1 - u) : 0;
    });
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function marktstandBauen() {
  const g = new THREE.Group();
  const t = new Teile(), s = new Teile();
  for (const sx of [-1.7, 1.7]) for (const sz of [-0.6, 0.6]) t.add(ZYL(1, 1, 6), HOLZ_DUNKEL, [sx, 1.2, sz], [0, 0, 0], [0.08, 2.4, 0.08]);
  t.add(KASTEN(), HOLZ, [0, 0.9, 0], [0, 0, 0], [3.6, 0.15, 1.3]);
  t.add(KASTEN(), HOLZ_DUNKEL, [0, 0.45, 0.6], [0, 0, 0], [3.6, 0.9, 0.08]);
  t.add(KASTEN(), "#b83a3a", [0, 2.5, 0], [0.12, 0, 0], [3.9, 0.12, 1.7], { art: "stoff" });
  s.add(KASTEN(), SCHNEE, [0, 2.6, 0], [0.12, 0, 0], [3.9, 0.12, 1.7]);
  // Waren: Wollsocken, Käselaibe, Tee
  for (let i = 0; i < 5; i++) t.add(KASTEN(), ["#c84a4a", "#4a7ac8", "#e8d8b0", "#5a9a5a", "#c8a040"][i], [-1.3 + i * 0.6, 1.08, -0.1], [0, 0, 0.1 * i], [0.22, 0.2, 0.42], { art: "stoff" });
  for (let i = 0; i < 3; i++) t.add(ZYL(1, 1, 14), "#e8c060", [-1.2 + i * 1.1, 1.12, 0.32], [0, 0, 0], [0.24, 0.18, 0.24]);
  t.in(g);
  const schnee = new THREE.Group(); s.in(schnee); g.add(schnee);
  g.userData.setzeLeuchten = () => {};
  g.userData.schnee = schnee;
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function ambossBauen() {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(1, 1.1, 10), HOLZ_DUNKEL, [0, 0.4, 0], [0, 0, 0], [0.45, 0.8, 0.45]);
  t.add(KASTEN(), "#3a3e46", [0, 0.95, 0], [0, 0, 0], [1.0, 0.3, 0.45], { art: "glanz" });
  t.add(KEGEL(4), "#3a3e46", [0.7, 0.98, 0], [0, 0, -Math.PI / 2], [0.18, 0.5, 0.18], { art: "glanz" });
  // Werkzeuge daneben
  t.add(KASTEN(), HOLZ, [-0.9, 0.06, 0.4], [0, 0.5, 0], [0.9, 0.06, 0.06]);
  t.add(KASTEN(), "#3a3e46", [-1.3, 0.1, 0.62], [0, 0.5, 0], [0.12, 0.14, 0.3], { art: "glanz" });
  t.add(KASTEN(), HOLZ, [0.8, 0.06, 0.6], [0, -0.3, 0], [0.7, 0.06, 0.05]);
  t.in(g);
  g.userData.setzeLeuchten = () => {};
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

/** Ratsfeuer: Steinkreis mit Flammen aus Eis, die nach Quest 4 zu echtem Feuer werden */
function ratsfeuerBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; t.add(KUGEL_K(), "#6a727e", [Math.cos(a) * 0.75, 0.15, Math.sin(a) * 0.75], [i, i, 0], [0.28, 0.2, 0.24]); }
  for (let i = 0; i < 3; i++) t.add(ZYL(1, 1, 6), HOLZ_DUNKEL, [0, 0.18, 0], [0, (i / 3) * Math.PI, Math.PI / 2], [0.09, 1.0, 0.09]);
  t.in(g);
  const eisMat = new THREE.MeshStandardMaterial({ color: "#d4f0ff", emissive: "#5ab8ff", emissiveIntensity: 0.4, roughness: 0.1, transparent: true, opacity: 0.85 });
  const eis = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const z = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9 + (i % 2) * 0.5, 5), eisMat);
    const a = (i / 5) * Math.PI * 2;
    z.position.set(Math.cos(a) * 0.2, 0.6, Math.sin(a) * 0.2);
    eis.add(z);
  }
  g.add(eis);
  const flammen = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: i % 2 ? "#ffb040" : "#ff6a20", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.add(s); flammen.push(s);
  }
  const licht = new THREE.PointLight("#ff9a40", 0, 9, 1.6);
  licht.position.y = 1.2;
  g.add(licht);
  let feuer = 0, ziel = 0;
  g.userData.setzeLeuchten = (an, sofort) => { ziel = an ? 1 : 0; if (sofort) feuer = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    feuer += Math.sign(ziel - feuer) * Math.min(Math.abs(ziel - feuer), dt * 0.6);
    eis.visible = feuer < 0.98;
    eis.scale.setScalar(Math.max(0.01, 1 - feuer));
    flammen.forEach((s, i) => {
      const u = (zeit * 1.4 + i / 7) % 1;
      s.position.set(Math.sin(i * 2.1) * 0.2, 0.4 + u * 1.2, Math.cos(i * 1.7) * 0.2);
      s.scale.setScalar(0.9 * (1 - u) + 0.2);
      s.material.opacity = feuer * (1 - u) * 0.9;
    });
    licht.intensity = feuer * (6 + Math.sin(zeit * 13) * 1.2);
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function buehneBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile(), s = new Teile();
  t.add(KASTEN(), HOLZ, [0, 0.4, 0], [0, 0, 0], [5.6, 0.8, 3.4]);
  for (let i = 0; i < 8; i++) t.add(KASTEN(), HOLZ_DUNKEL, [-2.45 + i * 0.7, 0.81, 0], [0, 0, 0], [0.05, 0.02, 3.4]);
  s.add(KASTEN(), SCHNEE, [0, 0.85, 0], [0, 0, 0], [5.4, 0.08, 3.2]);
  for (const sx of [-2.6, 2.6]) t.add(ZYL(1, 1, 8), HOLZ_DUNKEL, [sx, 2.6, -1.5], [0, 0, 0], [0.14, 3.6, 0.14]);
  t.add(KASTEN(), HOLZ_DUNKEL, [0, 4.4, -1.5], [0, 0, 0], [5.6, 0.25, 0.25]);
  // Vorhang (rot, gefroren steif)
  for (let i = 0; i < 10; i++) t.add(ZYL(1, 1, 6), i % 2 ? "#9a2a3a" : "#b8344a", [-2.4 + i * 0.53, 2.6, -1.45], [0, 0, 0], [0.28, 3.5, 0.12], { art: "stoff" });
  // Girlanden mit Wimpeln
  for (let i = 0; i < 9; i++) t.add(KEGEL(3), ["#e84a4a", "#4ab0e8", "#f0c040"][i % 3], [-2.4 + i * 0.6, 4.0 - Math.sin((i / 8) * Math.PI) * 0.5, -1.3], [Math.PI, 0, 0], [0.16, 0.35, 0.04], { art: "stoff" });
  // Treppe nach vorne
  for (let i = 0; i < 2; i++) t.add(KASTEN(), HOLZ_DUNKEL, [0, 0.2 + i * 0.3, 1.9 - i * 0.3], [0, 0, 0], [1.4, 0.15, 0.4]);
  t.in(g);
  const schnee = new THREE.Group(); s.in(schnee); g.add(schnee);
  // Lampen am Bühnenrand (leuchten nach Quest 5)
  const lampen = [-2.2, -0.7, 0.7, 2.2].map((x) => {
    const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#ffd080", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    l.position.set(x, 1.1, 1.6); l.scale.setScalar(0.7); g.add(l); return l;
  });
  let an = 0, ziel = 0;
  g.userData.setzeLeuchten = (wert, sofort) => { ziel = wert ? 1 : 0; if (sofort) an = ziel; };
  g.userData.schnee = schnee;
  animationen.push((zeit, dt = 0.016) => {
    an += Math.sign(ziel - an) * Math.min(Math.abs(ziel - an), dt);
    lampen.forEach((l, i) => { l.material.opacity = an * (0.75 + Math.sin(zeit * 2 + i) * 0.15); });
  });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

/** Eiswand am Bergpfad: schmilzt (setzeOffen), wenn alle fünf Bewohner frei sind */
function eiswandBauen(o, animationen) {
  const g = new THREE.Group();
  const b = (o.breite ?? 1) * E;
  const mat = new THREE.MeshStandardMaterial({ color: "#bfe6ff", emissive: "#3a9aff", emissiveIntensity: 0.3, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, flatShading: true });
  const bloecke = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat);
    const h = 2.5 + hash(i, 1, 30) * 3.5;
    m.scale.set(0.9 + hash(i, 2, 30) * 0.5, h, 0.8);
    m.position.set(-b / 2 + 0.5 + (i / 8) * (b - 1), h * 0.7, (hash(i, 3, 30) - 0.5) * 0.8);
    m.rotation.set(hash(i, 4, 30) * 0.3, hash(i, 5, 30) * 3, hash(i, 6, 30) * 0.3);
    m.userData.h = h;
    g.add(m); bloecke.push(m);
  }
  let ziel = 1, wert = 1;
  const setzeOffen = (offen, sofort) => { ziel = offen ? 0 : 1; if (sofort) wert = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    wert += (ziel - wert) * Math.min(1, dt * 0.6);
    g.visible = wert > 0.02;
    if (!g.visible) return;
    mat.opacity = 0.85 * Math.min(1, wert * 1.5);
    bloecke.forEach((m) => { m.scale.y = m.userData.h * wert; m.position.y = m.userData.h * 0.7 * wert; });
    mat.emissiveIntensity = 0.25 + Math.sin(zeit * 1.5) * 0.08;
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return { modell: g, setzeOffen };
}

function objektModell(o, animationen) {
  if (o.eis) return eisfigurBauen(o, animationen);
  if (o.bild === "brunnen_eis") return { modell: brunnenBauen(animationen) };
  if (o.bild === "marktstand") return { modell: marktstandBauen() };
  if (o.bild === "amboss") return { modell: ambossBauen() };
  if (o.bild === "ratsfeuer") return { modell: ratsfeuerBauen(animationen) };
  if (o.bild === "buehne") return { modell: buehneBauen(animationen) };
  if (o.bild === "eiswand") return eiswandBauen(o, animationen);
  if (o.bild === "schweigekoenig") {
    const f = eistrollBauen();
    f.gruppe.userData.setzeLeuchten = (an, sofort) => (sofort ? f.sofort : f.pose)(an ? "gipfel" : "thron");
    return { modell: f.gruppe, figur: f, boss: true, kopfY: 4.6, weit: 7.5, kameraY: 2.2 };
  }
  return null;
}

// ---------- Aufbau ----------

export function vocantiaBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const BR = raster[0].length, HO = raster.length;
  const B = BR * E, T = HO * E;
  const tex = texturen();
  welt.tau = sollTau();
  welt.waerme = sollWaerme();

  const himmelWinter = new THREE.Color("#bfe2fa"), himmelFruehling = new THREE.Color("#7ec0f4");
  szene.background = himmelWinter.clone();
  szene.fog = new THREE.Fog("#dbeeff", 40, 120);
  const nebelWinter = new THREE.Color("#dbeeff"), nebelFruehling = new THREE.Color("#cfe8ff");

  // Licht: kalte, helle Wintersonne; nach dem Auftauen warm
  const hemi = new THREE.HemisphereLight("#dcefff", "#a8bcd4", 1.5);
  szene.add(hemi);
  const sonne = new THREE.DirectionalLight("#e8f2ff", 2.2);
  sonne.castShadow = qualitaet.schatten;
  sonne.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(sonne.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 180 });
  sonne.shadow.bias = -0.0004;
  sonne.shadow.normalBias = 0.03;
  szene.add(sonne, sonne.target);

  // Boden: Grasboden darunter, Schneeboden darüber (wird beim Auftauen durchsichtig)
  const bodenGeo = new THREE.PlaneGeometry(B, T).rotateX(-Math.PI / 2);
  const gras = new THREE.Mesh(bodenGeo, new THREE.MeshStandardMaterial({ map: textur(bodenTextur(raster, false)), roughness: 1 }));
  gras.position.set(B / 2, -0.01, T / 2);
  gras.receiveShadow = true;
  const schneeMat = new THREE.MeshStandardMaterial({ map: textur(bodenTextur(raster, true)), roughness: 0.9, transparent: true });
  const schneeBoden = new THREE.Mesh(bodenGeo, schneeMat);
  schneeBoden.position.set(B / 2, 0.005, T / 2);
  schneeBoden.receiveShadow = true;
  szene.add(gras, schneeBoden);
  const aussenMat = new THREE.MeshStandardMaterial({ color: "#e4ecf6", roughness: 1 });
  const aussen = new THREE.Mesh(new THREE.PlaneGeometry(B + 240, T + 240).rotateX(-Math.PI / 2), aussenMat);
  aussen.position.set(B / 2, -0.03, T / 2);
  szene.add(aussen);

  // See: Wasser unten, Eis oben
  const seeX = SEE.cx * E, seeZ = SEE.cy * E;
  const wasser = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#2a7ab8", roughness: 0.08, metalness: 0.2 }));
  wasser.scale.set(SEE.rx * E, 1, SEE.ry * E);
  wasser.position.set(seeX, 0.02, seeZ);
  const eisMat = new THREE.MeshStandardMaterial({ map: tex.eis, color: "#e8f6ff", roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.95 });
  tex.eis.repeat.set(3, 2);
  const eis = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), eisMat);
  eis.scale.set(SEE.rx * E * 1.02, 1, SEE.ry * E * 1.02);
  eis.position.set(seeX, 0.05, seeZ);
  eis.receiveShadow = true;
  szene.add(wasser, eis);
  // Schilf und Steine am Ufer
  const ufer = new Teile();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const x = seeX + Math.cos(a) * SEE.rx * E * 1.06, z = seeZ + Math.sin(a) * SEE.ry * E * 1.06;
    if (x > B - 6) continue;
    ufer.add(KUGEL_K(), "#8a929e", [x, 0.1, z], [i, i, 0], [0.35 + hash(i, 1, 9) * 0.3, 0.22, 0.3]);
  }
  ufer.in(szene);

  // --- Berge: Abstandsfeld zu begehbaren Kacheln, damit kein Berg ins Tal ragt ---
  const RAND = 10;
  const W2 = BR + RAND * 2, H2 = HO + RAND * 2;
  const dist = new Float32Array(W2 * H2).fill(1e9);
  const queue = [];
  for (let y = 0; y < HO; y++) for (let x = 0; x < BR; x++) if (raster[y][x] !== "#") { dist[(y + RAND) * W2 + x + RAND] = 0; queue.push([x + RAND, y + RAND]); }
  for (let qi = 0; qi < queue.length; qi++) {
    const [x, y] = queue[qi], d = dist[y * W2 + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W2 || ny >= H2) continue;
      if (dist[ny * W2 + nx] > d + 1) { dist[ny * W2 + nx] = d + 1; queue.push([nx, ny]); }
    }
  }
  const berge = new Teile(), bergSchnee = new Teile();
  // Der Gipfel hinter dem Eisthron (hierher zieht sich der Schweigekönig zurück) – davor bleibt die Sicht frei
  const thronX = 24 * E, thronZ = 4 * E;
  const gx = thronX + GIPFEL.x, gz = thronZ + GIPFEL.z;
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const d = dist[y * W2 + x];
    if (d < 2) continue;
    if (hash(x, y, 91) > (d < 4 ? 0.3 : 0.12)) continue;
    const r = Math.min(d * E * 1.05, 5 + hash(x, y, 92) * 9);
    const h = r * (1.3 + hash(x, y, 93) * 0.9);
    const wx = (x - RAND + 0.5) * E, wz = (y - RAND + 0.5) * E;
    if (wz < thronZ + 2 && Math.hypot(wx - gx, wz - gz) < 14 + r && Math.abs(wx - (thronX + gx) / 2) < 12 + r * 0.5) continue;
    berge.add(KEGEL(7), hash(x, y, 94) > 0.5 ? FELS : FELS_DUNKEL, [wx, h / 2, wz], [0, hash(x, y, 95) * 6, 0], [r, h, r], { verlauf: 0.35 });
    bergSchnee.add(KEGEL(7), SCHNEE, [wx, h * 0.78, wz], [0, hash(x, y, 95) * 6, 0], [r * 0.47, h * 0.46, r * 0.47]);
  }
  // Ferne Gipfel als Panorama
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rr = 95 + hash(i, 1, 96) * 25;
    const x = B / 2 + Math.cos(a) * rr, z = T / 2 + Math.sin(a) * rr * 0.9;
    const r = 22 + hash(i, 2, 96) * 16, h = 40 + hash(i, 3, 96) * 30;
    berge.add(KEGEL(7), FELS, [x, h / 2 - 2, z], [0, i, 0], [r, h, r], { verlauf: 0.3 });
    bergSchnee.add(KEGEL(7), SCHNEE, [x, h * 0.75 - 2, z], [0, i, 0], [r * 0.52, h * 0.52, r * 0.52]);
  }
  // Der Gipfel selbst: breiter Felskegel mit flacher, verschneiter Kuppe
  berge.add(ZYL(0.3, 1, 9), FELS_DUNKEL, [gx, GIPFEL.y / 2, gz], [0, 0.3, 0], [9, GIPFEL.y, 9], { verlauf: 0.3 });
  bergSchnee.add(ZYL(1, 1, 9), SCHNEE, [gx, GIPFEL.y + 0.1, gz], [0, 0.3, 0], [2.7, 0.3, 2.7]);
  berge.in(szene);
  const bergSchneeGruppe = new THREE.Group();
  bergSchnee.in(bergSchneeGruppe);
  szene.add(bergSchneeGruppe);

  // --- Dorf: Häuser, Langhalle, Ratshaus, Tannen, Felsen, Zaun ---
  const t = new Teile(), schnee = new Teile(), zapfenOrte = [], fenster = [];
  bloecke(raster, "H").forEach((b, i) => haus(t, schnee, zapfenOrte, fenster, b, { dach: ["#8a3a2a", "#5a4a3a", "#7a5a2a"][i % 3], wand: i % 2 ? "#7a5638" : "#8a6444" }));
  for (const b of bloecke(raster, "L")) haus(t, schnee, zapfenOrte, fenster, b, { dach: "#5a3a24", wand: "#6a4a30", hoehe: 4.2, giebel: true });
  for (const b of bloecke(raster, "R")) rundhaus(t, schnee, fenster, b);
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c === "T") tanne(t, schnee, (tx + 0.5) * E, (ty + 0.5) * E, 1.6 + hash(tx, ty, 5) * 0.6, tx + ty);
    if (c === "S") {
      t.add(KUGEL_K(), "#7a828e", [(tx + 0.5) * E, 0.7, (ty + 0.5) * E], [tx, ty, 0], [1.2, 1.1, 1.0]);
      schnee.add(KUGEL_K(), SCHNEE, [(tx + 0.5) * E, 1.25, (ty + 0.5) * E], [tx, ty, 0], [0.95, 0.5, 0.85]);
    }
    if (c === "Z") {
      t.add(ZYL(1, 1, 6), HOLZ_DUNKEL, [(tx + 0.5) * E, 0.6, (ty + 0.5) * E], [0, 0, 0], [0.1, 1.2, 0.1]);
      const rechts = raster[ty][tx + 1] === "Z", unten = raster[ty + 1]?.[tx] === "Z";
      for (const hy of [0.5, 0.95]) {
        if (rechts) t.add(KASTEN(), HOLZ, [(tx + 1) * E, hy, (ty + 0.5) * E], [0, 0, 0], [E, 0.08, 0.06]);
        if (unten) t.add(KASTEN(), HOLZ, [(tx + 0.5) * E, hy, (ty + 1) * E], [0, 0, 0], [0.06, 0.08, E]);
      }
      schnee.add(KUGEL_K(), SCHNEE, [(tx + 0.5) * E, 1.22, (ty + 0.5) * E], [0, 0, 0], [0.13, 0.06, 0.13]);
    }
  }));
  // Tannen am Fuß der Berge
  for (let y = 0; y < HO; y++) for (let x = 0; x < BR; x++) {
    const d = dist[(y + RAND) * W2 + x + RAND];
    if (d === 1 && hash(x, y, 97) < 0.28) tanne(t, schnee, (x + 0.5) * E, (y + 0.5) * E, 1.8 + hash(x, y, 98) * 1.2, x * y);
  }
  // Eingefrorene Schafe auf der Weide
  for (const [sx, sy] of [[4.5, 36.5], [6.2, 40], [8.6, 36]]) {
    const x = sx * E, z = sy * E;
    t.add(KUGEL(), "#f0ece4", [x, 0.6, z], [0, 0, 0], [0.55, 0.42, 0.75], { art: "stoff" });
    t.add(KUGEL(), "#3a3632", [x, 0.75, z + 0.7], [0, 0, 0], [0.2, 0.2, 0.25]);
    for (const [dx, dz] of [[-0.3, -0.4], [0.3, -0.4], [-0.3, 0.4], [0.3, 0.4]]) t.add(ZYL(1, 1, 6), "#3a3632", [x + dx, 0.2, z + dz], [0, 0, 0], [0.06, 0.4, 0.06]);
  }
  t.in(szene);
  const schneeGruppe = new THREE.Group();
  schnee.in(schneeGruppe);
  // Eigene Materialien, damit das Ausblenden des Schnees nicht die geteilten Figuren-Materialien trifft
  const schneeMats = [];
  schneeGruppe.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; schneeMats.push(m.material); } });
  szene.add(schneeGruppe);

  // Eiszapfen (instanziert, schrumpfen mit jedem befreiten Bewohner)
  const zapfenGeo = new THREE.ConeGeometry(0.07, 1, 5).rotateX(Math.PI);
  const zapfen = new THREE.InstancedMesh(zapfenGeo, new THREE.MeshStandardMaterial({ color: "#dff4ff", emissive: "#6ac0ff", emissiveIntensity: 0.25, roughness: 0.05, transparent: true, opacity: 0.9 }), Math.max(1, zapfenOrte.length));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sk = new THREE.Vector3(), p = new THREE.Vector3();
  const zapfenSetzen = (f) => {
    zapfenOrte.forEach(([x, y, z, l], i) => {
      const ll = l * f;
      m4.compose(p.set(x, y + l / 2 - ll / 2, z), q.identity(), sk.set(1, Math.max(0.001, ll), 1));
      zapfen.setMatrixAt(i, m4);
    });
    zapfen.instanceMatrix.needsUpdate = true;
  };
  zapfen.count = zapfenOrte.length;
  szene.add(zapfen);

  // Fenster: dunkel im Schweigen, warm leuchtend, sobald das Dorf wieder spricht
  const fensterMat = new THREE.MeshBasicMaterial({ color: "#3a4a5a", toneMapped: false });
  for (const [x, y, z] of fenster) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), fensterMat);
    f.position.set(x, y, z);
    szene.add(f);
  }

  // --- Frühling: Blumen, Gras, Schmetterlinge, Vögel ---
  const fruehling = new THREE.Group();
  szene.add(fruehling);
  const blumenOrte = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c === "_" && hash(tx, ty, 120) < 0.22 && !(tx >= 22 && tx <= 25)) blumenOrte.push([tx, ty]);
  }));
  const blueteGeo = new THREE.IcosahedronGeometry(0.16, 0);
  const blueten = new THREE.InstancedMesh(blueteGeo, new THREE.MeshStandardMaterial({ roughness: 0.6 }), blumenOrte.length * 3);
  const stiele = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), new THREE.MeshStandardMaterial({ color: "#3a8a3a" }), blumenOrte.length * 3);
  const farben = ["#ff6a8a", "#ffd23a", "#ffffff", "#b07aff", "#5ab0ff", "#ff9a3a"];
  const blumen = [];
  blumenOrte.forEach(([x, y], i) => {
    for (let k = 0; k < 3; k++) {
      blumen.push({ x: (x + 0.15 + hash(x, y, 121 + k) * 0.7) * E, z: (y + 0.15 + hash(x, y, 124 + k) * 0.7) * E, f: farben[(i + k) % farben.length], v: hash(x, y, 127 + k) });
    }
  });
  const col = new THREE.Color();
  blumen.forEach((b, i) => { blueten.setColorAt(i, col.set(b.f)); });
  const blumenSetzen = (wachstum) => {
    blumen.forEach((b, i) => {
      const s = Math.max(0.001, Math.min(1, wachstum * 1.6 - b.v * 0.6));
      m4.compose(p.set(b.x, 0.5 * s, b.z), q.identity(), sk.set(s, s, s));
      blueten.setMatrixAt(i, m4);
      m4.compose(p.set(b.x, 0.25 * s, b.z), q.identity(), sk.set(1, s, 1));
      stiele.setMatrixAt(i, m4);
    });
    blueten.instanceMatrix.needsUpdate = true;
    stiele.instanceMatrix.needsUpdate = true;
  };
  fruehling.add(blueten, stiele);
  // Schmetterlinge über den Blumen (die Effekt-Funktion sucht „F“ im Raster)
  const blumenRaster = raster.map((z, ty) => [...z].map((c, tx) => (blumenOrte.some(([x, y]) => x === tx && y === ty) && hash(tx, ty, 130) < 0.3 ? "F" : ".")).join(""));
  schmetterlingeBauen(fruehling, blumenRaster, Math.round(14 * qualitaet.partikel) || 4, animationen);
  voegelBauen(fruehling, new THREE.Vector3(B / 2, 14, T / 2), 7, animationen);

  // --- Schneefall ---
  const flockenN = Math.round(1800 * qualitaet.partikel) || 400;
  const fpos = new Float32Array(flockenN * 3), fbasis = new Float32Array(flockenN * 3);
  for (let i = 0; i < flockenN; i++) {
    fbasis[i * 3] = hash(i, 1, 140) * B; fbasis[i * 3 + 1] = hash(i, 2, 140) * 16; fbasis[i * 3 + 2] = hash(i, 3, 140) * T;
  }
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
  const flockenMat = new THREE.PointsMaterial({ map: tex.licht, color: "#ffffff", size: 0.22, transparent: true, opacity: 0.9, depthWrite: false });
  const flocken = new THREE.Points(fgeo, flockenMat);
  flocken.frustumCulled = false;
  szene.add(flocken);

  // Frost am Bildschirmrand (nur solange Vocantia sichtbar und gefroren ist)
  const frost = frostRand();
  let sichtbar = false;

  // --- Animation: Schneefall, Auftauen, Wärme ---
  const sonneWinter = new THREE.Color("#e8f2ff"), sonneFruehling = new THREE.Color("#fff0d0");
  const hemiWinterOben = new THREE.Color("#dcefff"), hemiFruehlingOben = new THREE.Color("#fff6e0");
  const hemiWinterUnten = new THREE.Color("#a8bcd4"), hemiFruehlingUnten = new THREE.Color("#5a8a3a");
  const aussenWinter = new THREE.Color("#e4ecf6"), aussenFruehling = new THREE.Color("#6a9a4a");
  const fensterAus = new THREE.Color("#3a4a5a"), fensterAn = new THREE.Color("#ffc870");
  const markt = [], merken = (g) => { if (g?.userData?.schnee) markt.push(g.userData.schnee); };
  let letzteTau = -1, letzteWaerme = -1;
  animationen.push((zeit, dt = 0.016) => {
    welt.tau += Math.sign(sollTau() - welt.tau) * Math.min(Math.abs(sollTau() - welt.tau), dt / 7);
    welt.waerme += Math.sign(sollWaerme() - welt.waerme) * Math.min(Math.abs(sollWaerme() - welt.waerme), dt / 3);
    const tau = welt.tau;
    // Schneefall wird schwächer, je wärmer es wird, und hört nach dem Auftauen auf
    flocken.visible = tau < 0.99;
    if (flocken.visible) {
      flockenMat.opacity = 0.9 * (1 - tau) * (1 - welt.waerme * 0.4);
      for (let i = 0; i < flockenN; i++) {
        const fall = (fbasis[i * 3 + 1] - zeit * (0.9 + (i % 5) * 0.12)) % 16;
        fpos[i * 3] = fbasis[i * 3] + Math.sin(zeit * 0.6 + i) * 0.8;
        fpos[i * 3 + 1] = fall < 0 ? fall + 16 : fall;
        fpos[i * 3 + 2] = fbasis[i * 3 + 2] + Math.cos(zeit * 0.5 + i * 0.7) * 0.8;
      }
      fgeo.attributes.position.needsUpdate = true;
    }
    frost.style.opacity = sichtbar ? String(Math.max(0, 1 - tau * 1.4) * (1 - welt.waerme * 0.35)) : "0";
    if (Math.abs(tau - letzteTau) < 1e-4 && Math.abs(welt.waerme - letzteWaerme) < 1e-4) return;
    letzteTau = tau; letzteWaerme = welt.waerme;
    szene.background.copy(himmelWinter).lerp(himmelFruehling, tau);
    szene.fog.color.copy(nebelWinter).lerp(nebelFruehling, tau);
    sonne.color.copy(sonneWinter).lerp(sonneFruehling, tau);
    hemi.color.copy(hemiWinterOben).lerp(hemiFruehlingOben, tau);
    hemi.groundColor.copy(hemiWinterUnten).lerp(hemiFruehlingUnten, tau);
    aussenMat.color.copy(aussenWinter).lerp(aussenFruehling, tau);
    schneeMat.opacity = 1 - tau;
    schneeBoden.visible = tau < 0.999;
    eisMat.opacity = 0.95 * (1 - tau);
    eis.visible = tau < 0.999;
    const schmelzen = Math.max(0.001, 1 - tau);
    schneeGruppe.visible = tau < 0.98;
    for (const m of schneeMats) m.opacity = 1 - tau;
    for (const s of markt) s.visible = tau < 0.6;
    zapfenSetzen(Math.max(0.001, (1 - welt.waerme * 0.5) * schmelzen));
    zapfen.visible = tau < 0.99;
    fensterMat.color.copy(fensterAus).lerp(fensterAn, Math.min(1, welt.waerme * 0.6 + tau));
    fruehling.visible = tau > 0.02;
    blumenSetzen(tau);
  });

  const versatz = new THREE.Vector3(26, 60, 34);
  return {
    blockZeichen: BLOCKIERT,
    hindernis: (tx, ty) => HINDERNIS[raster[ty]?.[tx]] ?? 0,
    objektModell: (o) => {
      const res = objektModell(o, animationen);
      merken(res?.modell);
      return res;
    },
    licht: (pos) => {
      sonne.position.set(pos.x + versatz.x, versatz.y, pos.z + versatz.z);
      sonne.target.position.set(pos.x, 0, pos.z);
    },
    aktiv: (an) => { sichtbar = an; if (!an) frost.style.opacity = "0"; },
    kamera: { hoehe: 3.2, abstand: 7, maxHoehe: 10 },
  };
}
