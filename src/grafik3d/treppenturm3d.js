// 3D: Der Turm der Tausend Treppen (Lythara, Quest 1).
// Sechs Etagen einer Burg, durch gerade Treppen verbunden. Von unten nach oben wird es heller,
// schöner und eleganter: Keller → Kammern des Gesindes → Waffenkammer → Bankettsaal
// → Gemächer der Burgherren → Observatorium mit Sternenkuppel.
// Tore, Pult, Siegel und Torwächter kommen aus halle3d.js.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL, DREH, V } from "./figuren.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { halleObjektModell } from "./halle3d.js";
import { RASTER, BLOCKIERT, ETAGEN_POS, TREPPEN, X0, X1, GANG, hoeheBeiZeile, etageBeiZeile } from "../welt/treppenturm_layout.js";

const WAND_H = 7.6;
const GX0 = GANG[0] * E, GX1 = (GANG[GANG.length - 1] + 1) * E;     // Treppengang in Weltkoordinaten
const IX0 = X0 * E, IX1 = (X1 + 1) * E;                               // Innenwände

/** Aussehen je Etage (vom dunklen Keller bis zum hellen Observatorium) */
const THEMA = {
  keller: { boden: "grob", wand: "#4a4440", fuge: "#2a2622", decke: "#3a322a", licht: "#ff9a50", staerke: 18, teppich: null },
  gesinde: { boden: "dielen", wand: "#b8a88a", fuge: "#8a7a60", decke: "#5a3e26", licht: "#ffb878", staerke: 26, teppich: "#7a6a4a" },
  waffen: { boden: "platten", wand: "#8a8480", fuge: "#5a5450", decke: "#4a3a2a", licht: "#ffc890", staerke: 30, teppich: "#7a2228" },
  bankett: { boden: "schach", wand: "#c8b494", fuge: "#9a8668", decke: "#6a4426", licht: "#ffd8a0", staerke: 34, teppich: "#a01a2e" },
  gemaecher: { boden: "parkett", wand: "#ece0c8", fuge: "#c8b48a", decke: "#f4ecdc", licht: "#fff0d0", staerke: 36, teppich: "#2a3a8a" },
  observatorium: { boden: "marmor", wand: "#e8e4dc", fuge: "#c4bdb0", decke: "#1a1c3a", licht: "#d8e4ff", staerke: 18, teppich: null },
};

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

function bodenTextur(art) {
  const [c, g] = leinwand(128, 128);
  if (art === "grob") {
    g.fillStyle = "#3a332c"; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 14; i++) {
      const x = hash(i, 1, 3) * 128, y = hash(i, 2, 3) * 128, r = 14 + hash(i, 3, 3) * 14;
      g.fillStyle = `hsl(30, 10%, ${22 + hash(i, 4, 3) * 12}%)`;
      g.beginPath(); g.ellipse(x, y, r, r * 0.7, hash(i, 5, 3) * 3, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${hash(i, 6, 3) * 0.25})`; g.fillRect(hash(i, 7, 3) * 128, hash(i, 8, 3) * 128, 2, 2); }
  } else if (art === "dielen" || art === "parkett") {
    const hell = art === "parkett";
    g.fillStyle = hell ? "#9a6a3a" : "#7a5a3a"; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 16) {
      for (let x = (y / 16) % 2 ? -32 : 0; x < 128; x += 64) {
        g.fillStyle = `hsl(28, ${hell ? 45 : 35}%, ${(hell ? 36 : 28) + hash(x, y, 4) * 10}%)`;
        g.fillRect(x + 1, y + 1, 62, 14);
      }
    }
    if (hell) { g.strokeStyle = "rgba(255,220,160,0.25)"; for (let y = 0; y < 128; y += 16) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(128, y + 0.5); g.stroke(); } }
  } else if (art === "platten") {
    g.fillStyle = "#4a4644"; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) {
      g.fillStyle = `hsl(30, 6%, ${42 + hash(x, y, 5) * 12}%)`;
      g.fillRect(x + 1.5, y + 1.5, 29, 29);
    }
  } else if (art === "schach") {
    for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) {
      g.fillStyle = ((x + y) / 32) % 2 ? "#e8e0d0" : "#5a3a2a";
      g.fillRect(x, y, 32, 32);
    }
    g.strokeStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i <= 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  } else {
    // Marmor mit Adern und einem goldenen Sternmuster
    g.fillStyle = "#f2eee6"; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = "rgba(150,140,170,0.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) {
      let x = hash(i, 1, 6) * 128, y = hash(i, 2, 6) * 128;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (hash(i, k, 7) - 0.4) * 40; y += (hash(i, k, 8) - 0.5) * 40; g.lineTo(x, y); }
      g.stroke();
    }
    g.strokeStyle = "rgba(200,170,90,0.6)"; g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, 127, 127);
  }
  return c;
}

function wandTextur(farbe, fuge, art) {
  const [c, g] = leinwand(128, 128);
  g.fillStyle = fuge; g.fillRect(0, 0, 128, 128);
  if (art === "putz") {
    g.fillStyle = farbe; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${hash(i, 1, 9) > 0.5 ? "255,255,255" : "0,0,0"},0.05)`; g.fillRect(hash(i, 2, 9) * 128, hash(i, 3, 9) * 128, 3, 3); }
    return c;
  }
  const hoch = art === "quader" ? 32 : 21;
  for (let y = 0, r = 0; y < 128; y += hoch, r++) {
    for (let x = r % 2 ? -24 : 0; x < 128; x += 48) {
      const v = hash(x, y, 10);
      g.fillStyle = new THREE.Color(farbe).offsetHSL(0, 0, (v - 0.5) * 0.08).getStyle();
      g.fillRect(x + 1.5, y + 1.5, 45, hoch - 3);
    }
  }
  return c;
}

/** Fensterbild: Himmel und Landschaft, je höher die Etage, desto tiefer liegt der Horizont */
function fensterTextur(nr) {
  const [c, g] = leinwand(64, 128);
  const horizont = 92 - nr * 12;
  const himmel = g.createLinearGradient(0, 0, 0, horizont);
  himmel.addColorStop(0, nr >= 4 ? "#5a8ad8" : "#7aa8d8");
  himmel.addColorStop(1, "#d8e8f4");
  g.fillStyle = himmel; g.fillRect(0, 0, 64, horizont);
  if (nr <= 2) {
    // Hügel und Wald von Lythara
    g.fillStyle = "#6a9a5a"; g.fillRect(0, horizont, 64, 128 - horizont);
    g.fillStyle = "#4a7a4a";
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(hash(i, 1, 11) * 64, horizont + 4, 14, 8, 0, Math.PI, 0); g.fill(); }
  } else {
    // Hoch über den Wolken
    g.fillStyle = "#e8eef8"; g.fillRect(0, horizont, 64, 128 - horizont);
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(hash(i, 2, 11) * 64, horizont + 2 + hash(i, 3, 11) * 20, 12, 5, 0, 0, Math.PI * 2); g.fill(); }
  }
  // Fensterkreuz
  g.fillStyle = "#3a2a1a"; g.fillRect(30, 0, 4, 128); g.fillRect(0, 60, 64, 4);
  return c;
}

function sternTextur() {
  const [c, g] = leinwand(512, 256);
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "#0a0c24"); v.addColorStop(1, "#2a2a5a");
  g.fillStyle = v; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 500; i++) {
    const s = hash(i, 1, 12);
    g.fillStyle = s > 0.9 ? "#fff6c0" : s > 0.6 ? "#ffffff" : "#b8c8ff";
    const r = s > 0.95 ? 2 : 1;
    g.fillRect(hash(i, 2, 12) * 512, hash(i, 3, 12) * 256, r, r);
  }
  // Sternbilder mit goldenen Linien
  g.strokeStyle = "rgba(230,200,120,0.55)"; g.lineWidth = 1;
  for (let k = 0; k < 7; k++) {
    g.beginPath();
    let x = 40 + k * 68, y = 40 + hash(k, 4, 12) * 150;
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) { x += (hash(k, j, 13) - 0.3) * 50; y += (hash(k, j, 14) - 0.5) * 50; g.lineTo(x, y); g.fillStyle = "#fff4c0"; g.fillRect(x - 1.5, y - 1.5, 3, 3); }
    g.stroke();
  }
  return c;
}

function karteTextur(art) {
  const [c, g] = leinwand(128, 128);
  g.fillStyle = art === "stern" ? "#1e2448" : "#e8dcc0"; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = art === "stern" ? "#e8c870" : "#6a4a2a"; g.lineWidth = 2;
  g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(64, 64, 34, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 34, 64 + Math.sin(a) * 34); g.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52); g.stroke(); }
  g.fillStyle = art === "stern" ? "#fff4c0" : "#8a2a2a";
  for (let i = 0; i < 20; i++) g.fillRect(20 + hash(i, 1, 15) * 88, 20 + hash(i, 2, 15) * 88, 3, 3);
  return c;
}

let _tex = null;
function texturen() {
  if (_tex) return _tex;
  _tex = { licht: textur(lichtTextur("rgba(255,255,255,1)")), sterne: textur(sternTextur()) };
  return _tex;
}

/** Wandteppich: die Burg (der Turm der Tausend Treppen) von außen als Pixelbild, mit Bordüre und Fransen */
function wandteppichTextur() {
  const W = 48, H = 40;
  const [c, g] = leinwand(W, H);
  const px = (x, y, w, h, f) => { g.fillStyle = f; g.fillRect(x, y, w, h); };
  // Himmel und Hügel
  px(0, 0, W, H, "#5a7ac8");
  px(0, 0, W, 8, "#4a62b0");
  for (const [x, y] of [[6, 4], [40, 6], [34, 3], [12, 9]]) px(x, y, 1, 1, "#f4e8a8");
  px(0, 30, W, 10, "#3a7a3a");
  for (let x = 0; x < W; x++) px(x, 28 + Math.round(Math.sin(x * 0.3) * 1.5), 1, 3, "#4a8a3a");
  // Ringmauer mit Zinnen und Tor
  px(8, 24, 32, 8, "#8a8494");
  for (let x = 8; x < 40; x += 3) px(x, 22, 2, 2, "#8a8494");
  px(22, 27, 4, 5, "#3a2a1a");
  // Der Turm: sechs Etagen, oben die blaue Kuppel des Observatoriums
  px(19, 4, 10, 22, "#a8a2b4");
  px(19, 4, 2, 22, "#c8c2d4");
  for (let k = 0; k < 6; k++) {
    const y = 23 - k * 3.4;
    px(19, Math.round(y) + 2, 10, 1, "#7a7488");
    px(21, Math.round(y), 2, 2, k === 0 ? "#ff9a50" : "#ffd890");
    px(25, Math.round(y), 2, 2, k === 0 ? "#ff9a50" : "#ffd890");
  }
  px(18, 3, 12, 2, "#c8c2d4");
  for (let x = 18; x < 30; x += 2) px(x, 2, 1, 1, "#c8c2d4");
  px(20, 0, 8, 3, "#2a3a8a");
  px(23, 0, 2, 1, "#b48aff");
  // Fahnen an den Ecktürmen
  for (const x of [8, 37]) { px(x, 18, 3, 6, "#9a94a4"); px(x + 1, 14, 1, 4, "#4a3a2a"); px(x + 2, 14, 3, 2, "#a01a2e"); }
  // Bordüre in Gold und Weinrot
  g.strokeStyle = "#d8b048"; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
  g.strokeStyle = "#7a1a2a"; g.lineWidth = 1; g.strokeRect(3.5, 3.5, W - 7, H - 7);
  const t = textur(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  return t;
}

const DREH_VASE = () => DREH([V(0, 0), V(0.18, 0), V(0.26, 0.25), V(0.24, 0.6), V(0.12, 0.85), V(0.16, 1.05), V(0, 1.05)], 14, "vase");

// ---------- Möbel ----------

const HOLZ = "#6a4a2e", HOLZ_D = "#4a3220", HOLZ_H = "#8a6a44", EISEN = "#5a5a64", GOLD = "#d8b048";

/** Baut ein Möbelstück für Zeichen c auf Etage id. (x, z) = Mitte des Blocks, w/d = Größe in Welt-Einheiten, y = Boden */
function moebel(t, c, id, x, y, z, w, d) {
  const top = (h) => y + h;
  if (c === "F") {
    for (const [dx, dz] of [[-0.95, -0.95], [0.95, -0.95], [-0.95, 0.95], [0.95, 0.95]]) {
      t.add(ZYL(0.85, 0.85, 14), HOLZ, [x + dx, top(0.75), z + dz], [0, 0, 0], [0.85, 1.5, 0.85]);
      t.add(ZYL(1, 1, 14), HOLZ_H, [x + dx, top(0.75), z + dz], [0, 0, 0], [0.92, 1.1, 0.92]);
      for (const hy of [0.25, 1.25]) t.add(ZYL(1, 1, 14), EISEN, [x + dx, top(hy), z + dz], [0, 0, 0], [0.9, 0.08, 0.9], { art: "glanz" });
    }
    t.add(ZYL(0.85, 0.85, 14), HOLZ, [x, top(1.95), z], [Math.PI / 2, 0, 0.3], [0.8, 1.5, 0.8]);
  } else if (c === "K") {
    const n = id === "keller" ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const s = 1.5 - i * 0.25;
      t.add(KASTEN(), i % 2 ? HOLZ_H : HOLZ, [x + (i === 1 ? 0.5 : -0.2), top(i * 1.45 + s / 2), z + (i === 2 ? 0.4 : 0)], [0, i * 0.3, 0], [s, s, s]);
      t.add(KASTEN(), HOLZ_D, [x + (i === 1 ? 0.5 : -0.2), top(i * 1.45 + s / 2), z + (i === 2 ? 0.4 : 0)], [0, i * 0.3, 0], [s + 0.04, 0.12, s + 0.04]);
    }
  } else if (c === "W" && id === "keller") {
    // Weinregal mit Flaschen
    t.add(KASTEN(), HOLZ_D, [x - 0.6, top(1.6), z], [0, 0, 0], [0.8, 3.2, d - 0.2]);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) t.add(ZYL(0.6, 1, 8), k % 3 ? "#2a4a2a" : "#5a1a2a", [x - 0.2, top(0.45 + r * 0.75), z - d / 2 + 0.6 + k * (d - 1.2) / 6], [0, 0, Math.PI / 2], [0.12, 0.6, 0.12], { art: "glanz" });
  } else if (c === "W") {
    // Waffenständer: Rahmen mit Schwertern und Speeren, Schilde an der Wand
    const seite = x < (IX0 + IX1) / 2 ? -1 : 1;
    t.add(KASTEN(), HOLZ, [x, top(0.2), z], [0, 0, 0], [0.8, 0.4, d - 0.4]);
    t.add(KASTEN(), HOLZ, [x, top(2.4), z], [0, 0, 0], [0.5, 0.15, d - 0.4]);
    for (let k = 0; k < 6; k++) {
      const zz = z - d / 2 + 0.7 + k * (d - 1.4) / 5;
      if (k % 2) t.add(ZYL(1, 1, 6), HOLZ_H, [x, top(1.9), zz], [0, 0, 0], [0.05, 3.4, 0.05]), t.add(KEGEL(4), "#c8ccd4", [x, top(3.75), zz], [0, 0, 0], [0.1, 0.4, 0.1], { art: "glanz" });
      else t.add(KASTEN(), "#c8ccd4", [x, top(1.35), zz], [0, 0, 0], [0.04, 2.0, 0.14], { art: "glanz" }), t.add(KASTEN(), GOLD, [x, top(0.4), zz], [0, 0, 0], [0.1, 0.08, 0.45], { art: "glanz" });
    }
    for (let k = 0; k < 2; k++) {
      const zz = z - d / 4 + k * d / 2;
      t.add(ZYL(1, 1, 18), k ? "#2a4a8a" : "#8a2a2a", [x + seite * 0.62, top(4.2), zz], [0, 0, Math.PI / 2], [0.7, 0.1, 0.7]);
      t.add(ZYL(1, 1, 18), GOLD, [x + seite * 0.6, top(4.2), zz], [0, 0, Math.PI / 2], [0.2, 0.14, 0.2], { art: "glanz" });
    }
  } else if (c === "B" && id === "gesinde") {
    t.add(KASTEN(), HOLZ, [x, top(0.3), z], [0, 0, 0], [w - 0.4, 0.4, d - 0.5]);
    t.add(KASTEN(), "#d8c890", [x, top(0.58), z], [0, 0, 0], [w - 0.6, 0.2, d - 0.7], { art: "stoff" });
    t.add(KASTEN(), "#7a5a4a", [x + 0.4, top(0.7), z], [0, 0, 0], [w * 0.55, 0.1, d - 0.6], { art: "stoff" });
    t.add(KASTEN(), "#efe6d0", [x - w / 2 + 0.7, top(0.75), z], [0, 0, 0], [0.7, 0.2, d - 1.1], { art: "stoff" });
  } else if (c === "B") {
    // Himmelbett mit Pfosten, Baldachin und Vorhängen
    t.add(KASTEN(), HOLZ_D, [x, top(0.45), z], [0, 0, 0], [w - 0.6, 0.6, d - 0.8]);
    t.add(KASTEN(), "#f4eee0", [x, top(0.85), z], [0, 0, 0], [w - 0.8, 0.3, d - 1.0], { art: "stoff" });
    t.add(KASTEN(), "#2a3a8a", [x + 0.5, top(1.02), z], [0, 0, 0], [w * 0.6, 0.12, d - 0.9], { art: "stoff" });
    for (const k of [-0.6, 0.6]) t.add(KASTEN(), "#ffffff", [x - w / 2 + 1.0, top(1.1), z + k], [0, 0, 0], [0.6, 0.25, 0.9], { art: "stoff" });
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) t.add(ZYL(1, 1, 8), HOLZ_D, [x + dx * (w / 2 - 0.4), top(2.3), z + dz * (d / 2 - 0.5)], [0, 0, 0], [0.12, 4.6, 0.12]);
    t.add(KASTEN(), "#2a3a8a", [x, top(4.6), z], [0, 0, 0], [w - 0.5, 0.2, d - 0.7], { art: "stoff" });
    t.add(KASTEN(), GOLD, [x, top(4.75), z], [0, 0, 0], [w - 0.4, 0.08, d - 0.6], { art: "glanz" });
    for (const dz of [-1, 1]) t.add(KASTEN(), "#3a4aa0", [x - w / 2 + 0.5, top(2.5), z + dz * (d / 2 - 0.5)], [0, 0, 0], [0.25, 4.0, 0.9], { art: "stoff" });
  } else if (c === "T" && id === "gesinde") {
    t.add(KASTEN(), HOLZ_H, [x, top(1.0), z], [0, 0, 0], [w - 0.6, 0.15, d - 0.6]);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) t.add(KASTEN(), HOLZ, [x + dx * (w / 2 - 0.6), top(0.5), z + dz * (d / 2 - 0.6)], [0, 0, 0], [0.15, 1.0, 0.15]);
    for (const dz of [-1, 1]) t.add(KASTEN(), HOLZ, [x, top(0.5), z + dz * (d / 2 - 0.1)], [0, 0, 0], [w - 1, 0.12, 0.4]);
    for (let k = 0; k < 3; k++) t.add(ZYL(1, 0.6, 10), "#a8885a", [x - 1 + k, top(1.15), z + (k % 2 ? 0.3 : -0.3)], [0, 0, 0], [0.22, 0.14, 0.22]);
    t.add(ZYL(1, 1, 10), "#c8a858", [x + 1.2, top(1.2), z], [0, 0, 0], [0.3, 0.2, 0.3]);
  } else if (c === "T" && id === "bankett") {
    // Lange Tafel mit weißem Tischtuch, Tellern, Kelchen, Kerzenleuchtern und Stühlen
    t.add(KASTEN(), HOLZ_D, [x, top(1.05), z], [0, 0, 0], [w - 0.6, 0.12, d - 0.6]);
    t.add(KASTEN(), "#f4eee4", [x, top(1.1), z], [0, 0, 0], [w - 0.5, 0.04, d - 0.5], { art: "stoff" });
    t.add(KASTEN(), "#a01a2e", [x, top(1.13), z], [0, 0, 0], [0.5, 0.02, d - 0.8], { art: "stoff" });
    for (let k = 0; k < 2; k++) for (const dx of [-1, 1]) t.add(KASTEN(), HOLZ, [x + dx * (w / 2 - 0.6), top(0.5), z - d / 2 + 0.7 + k * (d - 1.4)], [0, 0, 0], [0.18, 1.0, 0.18]);
    const n = Math.round((d - 1.2) / 1.5);
    for (let k = 0; k <= n; k++) {
      const zz = z - d / 2 + 0.9 + k * ((d - 1.8) / n);
      for (const dx of [-1, 1]) {
        t.add(ZYL(1, 1, 16), "#e8e8f0", [x + dx * 0.55, top(1.14), zz], [0, 0, 0], [0.28, 0.02, 0.28], { art: "glanz" });
        t.add(ZYL(0.5, 0.25, 10), GOLD, [x + dx * 0.25, top(1.3), zz + 0.3], [0, 0, 0], [0.09, 0.3, 0.09], { art: "glanz" });
        // Stuhl mit hoher Lehne
        t.add(KASTEN(), HOLZ, [x + dx * (w / 2 + 0.25), top(0.6), zz], [0, 0, 0], [0.6, 0.1, 0.6]);
        t.add(KASTEN(), HOLZ_D, [x + dx * (w / 2 + 0.5), top(1.25), zz], [0, 0, 0], [0.1, 1.3, 0.6]);
        t.add(KASTEN(), "#a01a2e", [x + dx * (w / 2 + 0.25), top(0.68), zz], [0, 0, 0], [0.5, 0.06, 0.5], { art: "stoff" });
        for (const dz of [-0.25, 0.25]) t.add(KASTEN(), HOLZ_D, [x + dx * (w / 2 + 0.25), top(0.3), zz + dz], [0, 0, 0], [0.08, 0.6, 0.08]);
      }
    }
    for (const dz of [-d / 4, d / 4]) {
      t.add(ZYL(0.3, 1, 10), GOLD, [x, top(1.4), z + dz], [0, 0, 0], [0.18, 0.5, 0.18], { art: "glanz" });
      for (const dx of [-0.25, 0, 0.25]) t.add(ZYL(1, 1, 8), "#f4f0e0", [x + dx, top(1.85), z + dz], [0, 0, 0], [0.04, 0.35, 0.04]);
    }
  } else if (c === "T") {
    // Schreibtisch mit Buch und Kerze
    t.add(KASTEN(), HOLZ_H, [x, top(1.0), z], [0, 0, 0], [w - 0.3, 0.12, d - 0.5]);
    for (const dx of [-1, 1]) t.add(KASTEN(), HOLZ_D, [x + dx * (w / 2 - 0.4), top(0.5), z], [0, 0, 0], [0.4, 1.0, d - 0.6]);
    t.add(KASTEN(), "#5a1a2a", [x - 0.4, top(1.1), z], [0, 0.3, 0], [0.7, 0.1, 0.5]);
    t.add(ZYL(1, 1, 8), "#f4f0e0", [x + 0.8, top(1.3), z], [0, 0, 0], [0.05, 0.4, 0.05]);
    t.add(ZYL(1, 1, 12), GOLD, [x + 0.8, top(1.07), z], [0, 0, 0], [0.15, 0.04, 0.15], { art: "glanz" });
  } else if (c === "R") {
    // Ritterrüstung auf einem Ständer
    t.add(ZYL(1, 1, 12), HOLZ_D, [x, top(0.1), z], [0, 0, 0], [0.55, 0.2, 0.55]);
    t.add(ZYL(1, 1, 8), HOLZ, [x, top(1.0), z], [0, 0, 0], [0.06, 1.8, 0.06]);
    const st = "#b8bcc8";
    for (const s of [-1, 1]) t.add(KAPSEL(), st, [x + s * 0.17, top(0.75), z], [0, 0, 0], [0.12, 0.25, 0.12], { art: "glanz" });
    t.add(KUGEL(), st, [x, top(1.65), z], [0, 0, 0], [0.38, 0.5, 0.28], { art: "glanz" });
    for (const s of [-1, 1]) t.add(KUGEL(), st, [x + s * 0.42, top(2.0), z], [0, 0, 0], [0.18, 0.15, 0.18], { art: "glanz" }), t.add(KAPSEL(), st, [x + s * 0.48, top(1.55), z], [0, 0, s * 0.1], [0.1, 0.25, 0.1], { art: "glanz" });
    t.add(KUGEL(), st, [x, top(2.4), z], [0, 0, 0], [0.22, 0.27, 0.24], { art: "glanz" });
    t.add(KASTEN(), "#2a2a30", [x, top(2.42), z + 0.2], [0, 0, 0], [0.24, 0.04, 0.04]);
    t.add(KEGEL(6), "#a01a2e", [x, top(2.75), z], [0, 0, 0], [0.06, 0.4, 0.06]);
  } else if (c === "A") {
    t.add(ZYL(1, 1.2, 10), HOLZ_D, [x, top(0.4), z], [0, 0, 0], [0.45, 0.8, 0.45]);
    t.add(KASTEN(), "#3a3e46", [x, top(0.95), z], [0, 0, 0], [0.9, 0.3, 0.42], { art: "glanz" });
    t.add(KEGEL(4), "#3a3e46", [x + 0.62, top(0.98), z], [0, 0, -Math.PI / 2], [0.16, 0.42, 0.16], { art: "glanz" });
  } else if (c === "S") {
    t.add(KASTEN(), HOLZ_H, [x, top(1.8), z], [0, 0, 0], [w - 0.3, 3.6, d - 0.6]);
    t.add(KASTEN(), HOLZ_D, [x, top(3.7), z], [0, 0, 0], [w - 0.1, 0.2, d - 0.4]);
    for (const dx of [-0.5, 0.5]) t.add(KASTEN(), "#9a7a52", [x + dx * (w / 2 - 0.2), top(1.9), z + d / 2 - 0.29], [0, 0, 0], [w / 2 - 0.35, 3.0, 0.04]);
    for (const dx of [-0.12, 0.12]) t.add(KUGEL_K(), GOLD, [x + dx, top(1.9), z + d / 2 - 0.25], [0, 0, 0], 0.06, { art: "glanz" });
  } else if (c === "G") {
    t.add(ZYL(0.6, 1, 12), GOLD, [x, top(0.6), z], [0, 0, 0], [0.4, 1.2, 0.4], { art: "glanz" });
    t.add(ZYL(1, 1, 16), "#3a2a5a", [x, top(0.1), z], [0, 0, 0], [0.8, 0.2, 0.8]);
  } else if (c === "O") {
    // Großes Fernrohr auf einem Dreibein, zum Kuppelspalt gerichtet
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; t.add(ZYL(1, 1, 8), HOLZ_D, [x + Math.cos(a) * 0.6, top(1.0), z + Math.sin(a) * 0.6], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3], [0.08, 2.1, 0.08]); }
    t.add(KUGEL(), GOLD, [x, top(2.0), z], [0, 0, 0], 0.25, { art: "glanz" });
    // Rohr: um die X-Achse gekippt, die Öffnung zeigt nach Norden zum Kuppelspalt
    const kipp = -0.75, dy = Math.cos(kipp), dz = Math.sin(kipp);
    t.add(ZYL(0.34, 0.24, 16), "#2a3a6a", [x, top(2.0) + dy * 1.1, z + dz * 1.1], [kipp, 0, 0], [1, 3.6, 1], { art: "glanz" });
    t.add(ZYL(1, 1, 16), GOLD, [x, top(2.0) + dy * 2.85, z + dz * 2.85], [kipp, 0, 0], [0.4, 0.18, 0.4], { art: "glanz" });
    t.add(ZYL(1, 1, 12), GOLD, [x, top(2.0) - dy * 0.75, z - dz * 0.75], [kipp, 0, 0], [0.12, 0.4, 0.12], { art: "glanz" });
  }
}

// ---------- Bau ----------

export function treppenturmBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const tex = texturen();
  const B = raster[0].length * E, T = raster.length * E;
  szene.background = new THREE.Color("#0c0a10");
  szene.fog = new THREE.Fog("#140e0a", 16, 60);

  const hemi = new THREE.HemisphereLight("#d8c0a0", "#3a2a20", 1.0);
  szene.add(hemi);
  const sonne = new THREE.DirectionalLight("#fff0d8", 1.2);
  sonne.castShadow = qualitaet.schatten;
  sonne.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(sonne.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
  sonne.shadow.bias = -0.0005;
  sonne.shadow.normalBias = 0.04;
  szene.add(sonne, sonne.target);

  const bodenY = (x, z) => hoeheBeiZeile(z / E);
  const kachelH = (tx, ty) => hoeheBeiZeile(ty + 0.5);

  // --- Böden der Etagen ---
  for (const e of ETAGEN_POS) {
    const th = THEMA[e.id];
    const tiefe = (e.y1 - e.y0 + 1) * E;
    const t = textur(bodenTextur(th.boden), { wiederholen: true });
    t.repeat.set((IX1 - IX0) / 4, tiefe / 4);
    const m = new THREE.Mesh(new THREE.BoxGeometry(IX1 - IX0, 0.6, tiefe), new THREE.MeshStandardMaterial({ map: t, roughness: th.boden === "marmor" || th.boden === "schach" ? 0.35 : 0.85 }));
    m.position.set((IX0 + IX1) / 2, e.h - 0.3, e.y0 * E + tiefe / 2);
    m.receiveShadow = true;
    szene.add(m);
    if (th.teppich) {
      const tep = new THREE.Mesh(new THREE.PlaneGeometry(GX1 - GX0 - 0.6, tiefe).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: th.teppich, roughness: 1 }));
      tep.position.set((GX0 + GX1) / 2, e.h + 0.012, e.y0 * E + tiefe / 2);
      tep.receiveShadow = true;
      szene.add(tep);
      const rand = new THREE.Mesh(new THREE.PlaneGeometry(GX1 - GX0 - 0.2, tiefe).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: e.nr >= 3 ? GOLD : "#4a3a2a", roughness: 0.6 }));
      rand.position.set((GX0 + GX1) / 2, e.h + 0.008, e.y0 * E + tiefe / 2);
      szene.add(rand);
    }
  }

  // --- Mauern (Kachel für Kachel, Höhe nach den Nachbarn), Treppen, Decken ---
  const wandMat = {};
  for (const [id, th] of Object.entries(THEMA)) {
    const art = id === "gesinde" || id === "gemaecher" || id === "observatorium" ? "putz" : id === "keller" ? "bruch" : "quader";
    const t = textur(wandTextur(th.wand, th.fuge, art), { wiederholen: true });
    wandMat[id] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
  }
  const wandGeos = {};
  const box = (id, x, y, z, w, h, d, uv = 4) => {
    const g = new THREE.BoxGeometry(w, h, d);
    // UVs nach Weltgröße, damit die Steine überall gleich groß sind
    const uvA = g.attributes.uv, n = g.attributes.normal;
    for (let i = 0; i < uvA.count; i++) {
      const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
      const sx = nx > 0.5 ? d : w, sy = ny > 0.5 ? d : h;
      uvA.setXY(i, uvA.getX(i) * sx / uv, uvA.getY(i) * sy / uv);
    }
    g.translate(x, y, z);
    (wandGeos[id] ??= []).push(g);
  };
  const etageId = (ty) => ETAGEN_POS[Math.min(5, Math.max(0, Math.round(etageBeiZeile(ty))))].id;
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c !== "#") return;
    let lo = Infinity, hi = -Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const n = raster[ty + dy]?.[tx + dx];
      if (!n || n === "#") continue;
      const h = kachelH(tx + dx, ty + dy);
      lo = Math.min(lo, h); hi = Math.max(hi, h);
    }
    if (lo === Infinity) return;
    // Nachbarzeilen auf Treppen: auch die Höhe am Kachelrand beachten
    lo = Math.min(lo, hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    hi = Math.max(hi, hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    const unten = lo - 0.7, oben = hi + WAND_H;
    box(etageId(ty), (tx + 0.5) * E, (unten + oben) / 2, (ty + 0.5) * E, E, oben - unten, E);
  }));
  // Decken und Stürze
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c === "#") return;
    const h = Math.max(hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    const id = etageId(ty);
    if (id === "observatorium" && c !== "=") return;            // dort wölbt sich die Sternenkuppel
    box(id, (tx + 0.5) * E, h + WAND_H + 0.25, (ty + 0.5) * E, E, 0.5, E);
  }));
  for (const [id, liste] of Object.entries(wandGeos)) {
    const g = mergeGeos(liste);
    const m = new THREE.Mesh(g, wandMat[id]);
    m.receiveShadow = true;
    m.castShadow = false;      // Mauern und Decken werfen keine Schatten, sonst wäre der ganze Turm dunkel
    szene.add(m);
  }
  // Treppenstufen
  const stufen = new Teile();
  for (let i = 1; i < TREPPEN.length; i++) {
    const tr = TREPPEN[i];
    const z0 = tr.y0 * E, z1 = (tr.y1 + 1) * E, n = (tr.y1 - tr.y0 + 1) * 2;
    const farbe = ["#5a524a", "#7a6a50", "#8a8480", "#a8946e", "#d8ccb8", "#ece6da"][i - 1];
    for (let k = 0; k < n; k++) {
      const za = z0 + (k / n) * (z1 - z0), zb = z0 + ((k + 1) / n) * (z1 - z0);
      const hTop = hoeheBeiZeile((za + zb) / 2 / E) + 0.12;
      const unten = tr.unten - 0.7;
      stufen.add(KASTEN(), farbe, [(GX0 + GX1) / 2, (hTop + unten) / 2, (za + zb) / 2], [0, 0, 0], [GX1 - GX0, hTop - unten, zb - za + 0.02]);
      stufen.add(KASTEN(), i >= 4 ? GOLD : "#3a2e24", [(GX0 + GX1) / 2, hTop + 0.005, zb - 0.06], [0, 0, 0], [GX1 - GX0, 0.02, 0.1], i >= 4 ? { art: "glanz" } : {});
    }
    // Boden unter dem Tor oben an der Treppe (sonst klafft dort ein Loch zwischen Treppe und Etage)
    const oben = ETAGEN_POS[i], thOben = THEMA[oben.id];
    const ta = (tr.y0 - 1) * E, tb = tr.y0 * E;
    stufen.add(KASTEN(), farbe, [(GX0 + GX1) / 2, (tr.oben + tr.unten - 0.7) / 2, (ta + tb) / 2], [0, 0, 0], [GX1 - GX0, tr.oben - tr.unten + 0.7, tb - ta + 0.04]);
    const schwelle = new THREE.Mesh(new THREE.BoxGeometry(GX1 - GX0, 0.12, tb - ta + 0.04), new THREE.MeshStandardMaterial({ color: thOben.teppich ?? farbe, roughness: 0.9 }));
    schwelle.position.set((GX0 + GX1) / 2, tr.oben - 0.05, (ta + tb) / 2);
    schwelle.receiveShadow = true;
    szene.add(schwelle);
    // Läufer auf den oberen Treppen
    if (i >= 3) stufen.add(KASTEN(), ["", "", "", "#a01a2e", "#2a3a8a", "#2a3a8a"][i], [(GX0 + GX1) / 2, (tr.oben + tr.unten) / 2 + 0.14, (z0 + z1) / 2], [Math.atan2(tr.oben - tr.unten, z1 - z0), 0, 0], [GX1 - GX0 - 1.2, 0.04, Math.hypot(z1 - z0, tr.oben - tr.unten)], { art: "stoff" });
  }
  stufen.in(szene);

  // --- Möbel ---
  const moebelTeile = new Teile();
  const gesehen = new Set();
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (!BLOCKIERT.has(c) || c === "#" || gesehen.has(`${tx},${ty}`)) return;
    let x1 = tx, y1 = ty;
    while (raster[ty][x1 + 1] === c) x1++;
    while (raster[y1 + 1]?.[tx] === c) y1++;
    for (let yy = ty; yy <= y1; yy++) for (let xx = tx; xx <= x1; xx++) gesehen.add(`${xx},${yy}`);
    const w = (x1 - tx + 1) * E, d = (y1 - ty + 1) * E;
    moebel(moebelTeile, c, etageId(ty), tx * E + w / 2, kachelH(tx, ty), ty * E + d / 2, w, d);
  }));
  moebelTeile.in(szene);

  // --- Ausstattung je Etage: Fackeln, Fenster, Banner, Kamin, Kronleuchter, Kuppel ---
  const flammen = [];
  const flamme = (x, y, z, groesse = 0.9, farbe = "#ffb050") => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: farbe, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(x, y, z); s.scale.setScalar(groesse);
    szene.add(s); flammen.push(s);
  };
  const deko = new Teile();
  const fensterMats = [];
  for (const e of ETAGEN_POS) {
    const id = e.id, th = THEMA[id];
    const za = e.y0 * E, zb = (e.y1 + 1) * E, zm = (za + zb) / 2, h = e.h;
    // Licht der Etage
    const l = new THREE.PointLight(th.licht, th.staerke, 26, 1.4);
    l.position.set((IX0 + IX1) / 2, h + 5.5, zm);
    szene.add(l);
    // Fackeln an den Seitenwänden (unten), Wandleuchter in Gold (oben)
    for (const s of [-1, 1]) for (const zz of [za + 3, zb - 3]) {
      const x = s < 0 ? IX0 + 0.25 : IX1 - 0.25;
      if (id === "observatorium") continue;
      deko.add(KASTEN(), e.nr >= 3 ? GOLD : EISEN, [x, h + 3.2, zz], [0, 0, 0], [0.3, 0.1, 0.3], e.nr >= 3 ? { art: "glanz" } : {});
      deko.add(ZYL(1, 0.6, 8), e.nr >= 3 ? GOLD : HOLZ_D, [x - s * 0.15, h + 3.5, zz], [0, 0, s * 0.3], [0.1, 0.6, 0.1], e.nr >= 3 ? { art: "glanz" } : {});
      flamme(x - s * 0.3, h + 3.95, zz, e.nr >= 3 ? 0.6 : 0.95, e.nr >= 3 ? "#ffe0a0" : "#ff9a40");
    }
    // Fenster ab den Kammern des Gesindes, immer größer
    if (e.nr >= 1 && id !== "observatorium") {
      const fw = 0.8 + e.nr * 0.3, fh = 1.4 + e.nr * 0.5;
      const mat = new THREE.MeshBasicMaterial({ map: textur(fensterTextur(e.nr)), toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) });
      fensterMats.push(mat);
      for (const s of [-1, 1]) {
        const x = s < 0 ? IX0 + 0.03 : IX1 - 0.03;
        const fz = zm + (s < 0 ? -1.5 : 1.5);
        if (id === "bankett" && s < 0) continue;               // dort steht der Kamin
        const f = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), mat);
        f.position.set(x, h + 2.6 + fh / 2, fz);
        f.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
        szene.add(f);
        // Laibung und Bogen
        deko.add(KASTEN(), th.fuge, [x - s * 0.05, h + 2.55, fz], [0, 0, 0], [0.25, 0.12, fw + 0.4]);
        deko.add(KASTEN(), th.fuge, [x - s * 0.05, h + 2.6 + fh + 0.06, fz], [0, 0, 0], [0.25, 0.12, fw + 0.4]);
        if (e.nr >= 4) for (const dz of [-1, 1]) deko.add(KASTEN(), "#8a1a2a", [x - s * 0.1, h + 2.5 + fh / 2, fz + dz * (fw / 2 + 0.35)], [0, 0, 0], [0.1, fh + 0.6, 0.45], { art: "stoff" });
        // Lichtschein durch das Fenster
        const schein = new THREE.Mesh(new THREE.PlaneGeometry(fw * 1.6, 5), new THREE.MeshBasicMaterial({ map: tex.licht, color: "#fff2d0", transparent: true, opacity: 0.06 + e.nr * 0.025, depthWrite: false, blending: THREE.AdditiveBlending }));
        schein.position.set(x - s * 1.8, h + 2.6, fz);
        schein.rotation.set(0, s < 0 ? Math.PI / 2 : -Math.PI / 2, s * 0.6);
        szene.add(schein);
      }
    }
    if (id === "keller") {
      // Gewölbebögen und Ketten an der Wand
      for (const zz of [za + 4, za + 10, za + 16]) deko.add(RING(0.08, Math.PI), "#4a423a", [(IX0 + IX1) / 2, h + 3.2, zz], [0, 0, 0], [(IX1 - IX0) / 2, 4.0, 3]);
      for (let k = 0; k < 6; k++) deko.add(RING(0.3), EISEN, [IX1 - 0.2, h + 4.5 - k * 0.22, za + 8], [k % 2 ? Math.PI / 2 : 0, 0, 0], [0.12, 0.16, 0.12], { art: "glanz" });
    }
    if (id === "gesinde") {
      // Regal mit Töpfen und eine Wäscheleine
      deko.add(KASTEN(), HOLZ, [IX1 - 0.3, h + 3.0, za + 2.5], [0, 0, 0], [0.5, 0.08, 2.4]);
      for (let k = 0; k < 4; k++) deko.add(ZYL(0.8, 1, 10), k % 2 ? "#a8643a" : "#8a7a5a", [IX1 - 0.3, h + 3.3, za + 1.6 + k * 0.6], [0, 0, 0], [0.2, 0.45, 0.2]);
      deko.add(KASTEN(), "#d8c8a8", [(IX0 + IX1) / 2 - 7, h + 4.2, zm], [0, 0, 0], [0.02, 0.02, (zb - za) - 2]);
      for (let k = 0; k < 4; k++) deko.add(KASTEN(), ["#e8e0d0", "#8a9ab8", "#c8b890", "#e8e0d0"][k], [(IX0 + IX1) / 2 - 7, h + 3.75, za + 3 + k * 2.2], [0, 0, 0], [0.04, 0.9, 1.0], { art: "stoff" });
    }
    if (id === "waffen" || id === "bankett") {
      // Banner an der Rückwand (Süden) links und rechts vom Tor
      for (const s of [-1, 1]) {
        const x = (GX0 + GX1) / 2 + s * 6;
        deko.add(KASTEN(), id === "waffen" ? "#7a2228" : "#a01a2e", [x, h + 4.6, zb - 0.08], [0, 0, 0], [1.8, 4.0, 0.06], { art: "stoff" });
        deko.add(KASTEN(), GOLD, [x, h + 4.6, zb - 0.12], [0, 0, Math.PI / 4], [0.7, 0.7, 0.04], { art: "glanz" });
        deko.add(ZYL(1, 1, 8), HOLZ_D, [x, h + 6.65, zb - 0.15], [0, 0, Math.PI / 2], [0.06, 2.2, 0.06]);
      }
    }
    if (id === "bankett") {
      // Kamin an der Westwand mit Feuer
      const kx = IX0 + 0.6;
      deko.add(KASTEN(), "#8a7a64", [kx, h + 1.6, zm], [0, 0, 0], [1.2, 3.2, 4.2]);
      deko.add(KASTEN(), "#1a1410", [kx + 0.5, h + 1.0, zm], [0, 0, 0], [0.3, 1.8, 2.6]);
      deko.add(KASTEN(), "#a89478", [kx + 0.2, h + 3.3, zm], [0, 0, 0], [1.6, 0.3, 4.6]);
      for (let k = 0; k < 3; k++) flamme(kx + 0.75, h + 0.5 + k * 0.25, zm - 0.6 + k * 0.6, 1.1, k % 2 ? "#ffb040" : "#ff6a20");
      const feuer = new THREE.PointLight("#ff8a3a", 10, 10, 1.6);
      feuer.position.set(kx + 1.5, h + 1.2, zm);
      szene.add(feuer);
      // Zwei Kronleuchter
      for (const zz of [za + 4, zb - 4]) {
        deko.add(RING(0.08), GOLD, [(IX0 + IX1) / 2, h + 5.6, zz], [Math.PI / 2, 0, 0], [1.4, 1.4, 1], { art: "glanz" });
        deko.add(ZYL(1, 1, 6), GOLD, [(IX0 + IX1) / 2, h + 6.6, zz], [0, 0, 0], [0.03, 2.0, 0.03], { art: "glanz" });
        for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; flamme((IX0 + IX1) / 2 + Math.cos(a) * 1.4, h + 5.95, zz + Math.sin(a) * 1.4, 0.45, "#ffe0a0"); }
      }
    }
    if (id === "gemaecher") {
      // Gemälde in Goldrahmen und ein Teppich vor dem Bett
      for (const [x, zz, f] of [[IX1 - 0.08, za + 3, "#4a6a8a"], [IX1 - 0.08, zb - 3, "#8a5a3a"]]) {
        deko.add(KASTEN(), GOLD, [x, h + 3.8, zz], [0, 0, 0], [0.08, 1.8, 1.5], { art: "glanz" });
        deko.add(KASTEN(), f, [x - 0.03, h + 3.8, zz], [0, 0, 0], [0.06, 1.5, 1.2]);
      }
      deko.add(KASTEN(), "#8a1a2a", [IX0 + 5.2, h + 0.02, za + 3], [0, 0, 0], [3.4, 0.03, 4.4], { art: "stoff" });
      deko.add(KASTEN(), GOLD, [IX0 + 5.2, h + 0.015, za + 3], [0, 0, 0], [3.7, 0.02, 4.7], { art: "glanz" });
      // Großer Wandteppich gegenüber dem Bett, links neben der Tür: die Burg von außen als Pixelbild
      const tw = 6.4, th2 = 5.2, tx = (IX0 + GX0) / 2, tz = zb - 0.1;
      const teppich = new THREE.Mesh(new THREE.PlaneGeometry(tw, th2), new THREE.MeshStandardMaterial({ map: wandteppichTextur(), roughness: 1 }));
      teppich.position.set(tx, h + 1.1 + th2 / 2, tz);
      teppich.rotation.y = Math.PI;
      szene.add(teppich);
      deko.add(ZYL(1, 1, 10), GOLD, [tx, h + 1.25 + th2, tz - 0.1], [0, 0, Math.PI / 2], [0.09, tw + 0.8, 0.09], { art: "glanz" });
      for (const s of [-1, 1]) deko.add(KUGEL(), GOLD, [tx + s * (tw / 2 + 0.45), h + 1.25 + th2, tz - 0.1], [0, 0, 0], 0.16, { art: "glanz" });
      for (let k = 0; k < 12; k++) deko.add(KASTEN(), GOLD, [tx - tw / 2 + 0.27 + k * (tw - 0.54) / 11, h + 1.0, tz - 0.06], [0, 0, 0], [0.08, 0.25, 0.02], { art: "stoff" });
      // Truhe am Fußende des Bettes, Kandelaber neben dem Bett, Vasen mit Blumen
      const bettX = 7 * E + 3, bettZ = (e.y0 + 1) * E + 3;
      deko.add(KASTEN(), "#6a3a1e", [bettX + 3.6, h + 0.35, bettZ], [0, 0, 0], [0.8, 0.7, 2.0]);
      deko.add(KASTEN(), GOLD, [bettX + 3.6, h + 0.72, bettZ], [0, 0, 0], [0.84, 0.06, 2.04], { art: "glanz" });
      for (const dz of [-0.6, 0.6]) deko.add(KASTEN(), GOLD, [bettX + 4.02, h + 0.4, bettZ + dz], [0, 0, 0], [0.04, 0.5, 0.1], { art: "glanz" });
      for (const dz of [-3.6, 3.6]) {
        deko.add(ZYL(0.4, 1, 10), GOLD, [bettX - 1.6, h + 0.9, bettZ + dz], [0, 0, 0], [0.12, 1.8, 0.12], { art: "glanz" });
        deko.add(ZYL(1, 1, 12), GOLD, [bettX - 1.6, h + 1.82, bettZ + dz], [0, 0, 0], [0.3, 0.05, 0.3], { art: "glanz" });
        for (const dx of [-0.18, 0, 0.18]) { deko.add(ZYL(1, 1, 8), "#f4f0e0", [bettX - 1.6 + dx, h + 2.0, bettZ + dz], [0, 0, 0], [0.04, 0.32, 0.04]); flamme(bettX - 1.6 + dx, h + 2.25, bettZ + dz, 0.3, "#ffe0a0"); }
      }
      for (const [vx, vz] of [[IX1 - 0.7, zm], [GX1 + 1.0, zb - 0.8]]) {
        deko.add(DREH_VASE(), "#2a4a9a", [vx, h, vz], [0, 0, 0], 1, { art: "glanz" });
        for (let k = 0; k < 5; k++) deko.add(KUGEL_K(), ["#ff7aa8", "#ffd23a", "#ffffff", "#ff9a5a", "#c88aff"][k], [vx + Math.cos(k * 1.3) * 0.2, h + 1.25 + (k % 2) * 0.12, vz + Math.sin(k * 1.3) * 0.2], [0, 0, 0], 0.12);
      }
      // Kronleuchter aus Gold und eine goldene Zierleiste unter der Decke
      deko.add(RING(0.08), GOLD, [(IX0 + IX1) / 2, h + 5.8, zm], [Math.PI / 2, 0, 0], [1.3, 1.3, 1], { art: "glanz" });
      deko.add(RING(0.06), GOLD, [(IX0 + IX1) / 2, h + 5.5, zm], [Math.PI / 2, 0, 0], [0.7, 0.7, 1], { art: "glanz" });
      deko.add(ZYL(1, 1, 6), GOLD, [(IX0 + IX1) / 2, h + 6.75, zm], [0, 0, 0], [0.03, 1.9, 0.03], { art: "glanz" });
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; flamme((IX0 + IX1) / 2 + Math.cos(a) * 1.3, h + 6.1, zm + Math.sin(a) * 1.3, 0.4, "#fff0c0"); }
      for (const [x0, x1, z0, z1] of [[IX0, IX1, za + 0.05, za + 0.05], [IX0, IX1, zb - 0.05, zb - 0.05], [IX0 + 0.05, IX0 + 0.05, za, zb], [IX1 - 0.05, IX1 - 0.05, za, zb]]) {
        deko.add(KASTEN(), GOLD, [(x0 + x1) / 2, h + WAND_H - 0.25, (z0 + z1) / 2], [0, 0, 0], [Math.max(0.12, x1 - x0), 0.18, Math.max(0.12, z1 - z0)], { art: "glanz" });
      }
    }
    if (id === "observatorium") {
      // Sternenkuppel mit Spalt, Sternkarten, schwebende Lichtkugeln, Himmelsgloben
      const breite = IX1 - IX0, tiefe = zb - za;
      const kuppel = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex.sterne, side: THREE.BackSide, toneMapped: false }));
      kuppel.scale.set(breite / 2 + 0.5, 9, tiefe / 2 + 0.5);
      kuppel.position.set((IX0 + IX1) / 2, h + WAND_H - 0.2, zm);
      szene.add(kuppel);
      animationen.push((zeit) => { kuppel.rotation.y = zeit * 0.01; });
      for (const [x, s] of [[IX0 + 0.12, -1], [IX1 - 0.12, 1]]) for (const zz of [za + 4, zb - 4]) {
        const k = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: textur(karteTextur(zz < zm ? "stern" : "land")), toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) }));
        k.position.set(x, h + 3.8, zz); k.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
        szene.add(k);
        deko.add(KASTEN(), GOLD, [x + s * 0.07, h + 3.8, zz], [0, 0, 0], [0.04, 2.6, 2.6], { art: "glanz" });
      }
      // Armillarsphären auf den Säulen (G)
      for (const [gx, gz] of [[9 * E, (e.y0 + 2) * E], [21 * E, (e.y0 + 7) * E]]) {
        const sph = new THREE.Group();
        const st = new Teile();
        for (let k = 0; k < 3; k++) st.add(RING(0.04), GOLD, [0, 0, 0], [k * Math.PI / 3, k * 0.6, 0], [0.75, 0.75, 0.75], { art: "glanz" });
        st.add(KUGEL(), "#3a6ad8", [0, 0, 0], [0, 0, 0], 0.22, { art: "glanz" });
        st.in(sph);
        sph.position.set(gx, h + 1.9, gz);
        szene.add(sph);
        animationen.push((zeit) => { sph.rotation.y = zeit * 0.4; sph.rotation.x = Math.sin(zeit * 0.3) * 0.3; });
      }
      // Schwebende Lichtkugeln
      for (let k = 0; k < 6; k++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: k % 2 ? "#c8d8ff" : "#fff0c0", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        s.scale.setScalar(0.8);
        szene.add(s);
        animationen.push((zeit) => s.position.set((IX0 + IX1) / 2 + Math.cos(zeit * 0.3 + k) * 10, h + 6 + Math.sin(zeit * 0.7 + k) * 0.6, zm + Math.sin(zeit * 0.3 + k) * 5));
      }
    }
  }
  deko.in(szene);
  animationen.push((zeit) => flammen.forEach((s, i) => { s.material.opacity = 0.75 + Math.sin(zeit * 9 + i * 1.7) * 0.15 + Math.sin(zeit * 13 + i) * 0.08; }));

  // --- Licht folgt der Höhe: unten warm und dunkel, oben hell und kühl ---
  const F = (a) => new THREE.Color(a);
  const stufenFarben = [
    { bg: F("#0c0a10"), nebel: F("#0e0a08"), hemi: F("#a89078"), boden: F("#2a2018"), i: 0.75, sonne: 0.35, weit: 44 },
    { bg: F("#1a1814"), nebel: F("#2a2218"), hemi: F("#e8d0b0"), boden: F("#4a3a28"), i: 1.15, sonne: 0.8, weit: 54 },
    { bg: F("#2a2a2c"), nebel: F("#3a3632"), hemi: F("#f0dcc0"), boden: F("#4a4038"), i: 1.35, sonne: 1.0, weit: 60 },
    { bg: F("#3a2e24"), nebel: F("#4a3a2c"), hemi: F("#ffe8c8"), boden: F("#5a3a28"), i: 1.55, sonne: 1.2, weit: 66 },
    { bg: F("#8aa0b8"), nebel: F("#d8ccb8"), hemi: F("#fff4e0"), boden: F("#a89070"), i: 1.8, sonne: 1.5, weit: 74 },
    { bg: F("#1a1c3a"), nebel: F("#2a2c48"), hemi: F("#eef0ff"), boden: F("#8a849c"), i: 1.3, sonne: 1.1, weit: 140 },
  ];
  const versatz = new THREE.Vector3(5, 26, 8);
  const tmp = new THREE.Color();
  let spielerY = 0;
  const mische = (ziel, a, b, t) => ziel.copy(a).lerp(b, t);
  return {
    blockZeichen: BLOCKIERT,
    boden: bodenY,
    // Im hellen Observatorium kein Bloom (sonst wirkt der weiße Marmor neblig); unten leuchten Fackeln und Kerzen
    get bloom() { return spielerY < ETAGEN_POS[5].h - 1.5; },
    hindernis: (tx, ty) => (raster[ty]?.[tx] === "#" ? 999 : kachelH(tx, ty)),
    objektModell: (o) => halleObjektModell(o, animationen),
    licht: (pos) => {
      sonne.position.set(pos.x + versatz.x, pos.y + versatz.y, pos.z + versatz.z);
      sonne.target.position.set(pos.x, pos.y, pos.z);
      const f = Math.max(0, Math.min(5, pos.y / (ETAGEN_POS[1].h || 3.2)));
      const i = Math.min(4, Math.floor(f)), u = f - i;
      const a = stufenFarben[i], b = stufenFarben[i + 1];
      mische(szene.background, a.bg, b.bg, u);
      mische(szene.fog.color, a.nebel, b.nebel, u);
      szene.fog.far = a.weit + (b.weit - a.weit) * u;
      szene.fog.near = 16 + f * 4;
      spielerY = pos.y;
      mische(hemi.color, a.hemi, b.hemi, u);
      mische(hemi.groundColor, a.boden, b.boden, u);
      hemi.intensity = a.i + (b.i - a.i) * u;
      sonne.intensity = a.sonne + (b.sonne - a.sonne) * u;
      fensterMats.forEach((m) => m.color.copy(tmp.setScalar(0.85)));
    },
    kamera: { hoehe: 3.0, abstand: 6.4, maxHoehe: 5.2 },
  };
}

function mergeGeos(liste) {
  // Einfaches Zusammenfügen von BoxGeometries (alle indiziert, gleiche Attribute)
  let nPos = 0, nIdx = 0;
  for (const g of liste) { nPos += g.attributes.position.count; nIdx += g.index.count; }
  const pos = new Float32Array(nPos * 3), nor = new Float32Array(nPos * 3), uv = new Float32Array(nPos * 2), idx = new Uint32Array(nIdx);
  let op = 0, oi = 0;
  for (const g of liste) {
    pos.set(g.attributes.position.array, op * 3);
    nor.set(g.attributes.normal.array, op * 3);
    uv.set(g.attributes.uv.array, op * 2);
    const ia = g.index.array;
    for (let i = 0; i < ia.length; i++) idx[oi + i] = ia[i] + op;
    op += g.attributes.position.count; oi += ia.length;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  m.setIndex(new THREE.BufferAttribute(idx, 1));
  return m;
}
