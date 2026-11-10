// Aurelia in 3D – eine antike Hafenstadt am Mittelmeer.
// Weiß gekalkte Häuser mit Ziegeldächern und blauen Fensterläden, Bougainvillea,
// eine Agora mit Säulenhallen und Brunnen, ein Glockenturm auf der Akropolis mit Tempelsäulen,
// ein Leuchtturm im Stil des Pharos, Stadtmauer, Zypressen und Olivenbäume,
// ein Kai mit fünf Holzstegen, Booten, einer Fähre und einer Werft – und das tiefblaue Meer.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, RING, KASTEN, KEGEL, DREH, V } from "./figuren.js";
import { textur, lichtTextur, dachTextur, holzTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { lichtpunkteBauen, voegelBauen } from "./effekte.js";
import { HINDERNIS, BLOCKIERT, bloecke, STEGE, KAI_Y } from "../welt/aurelia_layout.js";
import { zustand } from "../zustand.js";

const MARMOR = "#f2ece0", KALK = "#f6f2e8", SANDSTEIN = "#d8c8a4", TERRAKOTTA = "#c0603a", MEERBLAU = "#1f7ab8";
const PX = 32;

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

/** Boden: Pflaster aus hellen Kalksteinplatten, Sand am Kai, Meer durchsichtig (Alpha). */
function bodenTextur(raster) {
  const W = raster[0].length * PX, H = raster.length * PX;
  const [c, g] = leinwand(W, H);
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    const x = tx * PX, y = ty * PX;
    if (z === "~") return;                                   // bleibt durchsichtig
    if (z === ".") {
      g.fillStyle = "#e6d2a4"; g.fillRect(x, y, PX, PX);
      for (let i = 0; i < 12; i++) { g.fillStyle = hash(tx, ty, i) > 0.5 ? "rgba(255,250,230,0.35)" : "rgba(150,120,70,0.2)"; g.fillRect(x + hash(tx, i, 1) * PX, y + hash(ty, i, 2) * PX, 2, 2); }
      return;
    }
    // Agora (Mitte) mit größeren Marmorplatten, sonst Kalksteinpflaster
    const agora = tx >= 15 && tx <= 32 && ty >= 11 && ty <= 22;
    g.fillStyle = agora ? "#b8b0a0" : "#a89878";   // Fugen
    g.fillRect(x, y, PX, PX);
    const n = agora ? 1 : 2;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = PX / n, v = hash(tx * 2 + i, ty * 2 + j, agora ? 7 : 3);
      const grund = agora ? [236, 230, 218] : [214, 200, 172];
      const k = 0.92 + v * 0.12;
      g.fillStyle = `rgb(${grund[0] * k | 0},${grund[1] * k | 0},${grund[2] * k | 0})`;
      g.fillRect(x + i * s + 1, y + j * s + 1, s - 2, s - 2);
    }
    g.fillStyle = "rgba(120,100,70,0.35)";
    g.fillRect(x, y, PX, 1); g.fillRect(x, y, 1, PX);
    if (agora && (tx + ty) % 4 === 0) { g.fillStyle = "rgba(60,120,180,0.25)"; g.fillRect(x + 12, y + 12, 8, 8); }
  }));
  return c;
}

/** Kalkputz mit Fenstern (blaue Läden), wiederholbar je 2 Welteinheiten. */
function putzTextur() {
  const [c, g] = leinwand(128, 256);
  g.fillStyle = KALK; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 400; i++) { g.fillStyle = hash(i, 1, 21) > 0.5 ? "rgba(255,255,255,0.5)" : "rgba(180,170,150,0.18)"; g.fillRect(hash(i, 2, 21) * 128, hash(i, 3, 21) * 256, 2 + hash(i, 4, 21) * 4, 2); }
  // Fenster im oberen Teil, blaue Läden
  const fenster = (y) => {
    g.fillStyle = "#3a2e28"; g.fillRect(48, y, 32, 40);
    g.fillStyle = "#2a6ab0"; g.fillRect(36, y, 12, 40); g.fillRect(80, y, 12, 40);
    g.fillStyle = "#4a8ad0"; for (let k = 0; k < 5; k++) { g.fillRect(37, y + 3 + k * 8, 10, 3); g.fillRect(81, y + 3 + k * 8, 10, 3); }
    g.fillStyle = "#d8ccb4"; g.fillRect(44, y + 40, 40, 5);
  };
  fenster(36);
  // Sockelstreifen unten
  g.fillStyle = "#d8ccb0"; g.fillRect(0, 236, 128, 20);
  return c;
}

function wasserTextur() {
  const [c, g] = leinwand(256, 256);
  g.fillStyle = "#2a86c4"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) {
    const x = hash(i, 1, 31) * 256, y = hash(i, 2, 31) * 256, w = 10 + hash(i, 3, 31) * 40;
    g.strokeStyle = hash(i, 4, 31) > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(10,60,110,0.25)";
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 4, x + w, y); g.stroke();
  }
  return c;
}

function schildTextur(text, farbe = "#3a2a1a") {
  const [c, g] = leinwand(256, 128);
  g.fillStyle = "#c8a878"; g.fillRect(0, 0, 256, 128);
  g.strokeStyle = "#7a5a34"; g.lineWidth = 10; g.strokeRect(5, 5, 246, 118);
  g.font = "700 64px Cinzel, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = farbe; g.fillText(text, 128, 68, 230);
  return c;
}

// ---------- Himmel, Meer, Umland ----------

function himmelBauen(szene, mitte) {
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { oben: { value: new THREE.Color("#2f7fd8") }, horizont: { value: new THREE.Color("#cfe8f8") }, sonne: { value: new THREE.Vector3(0.45, 0.42, 0.78).normalize() } },
    vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 oben; uniform vec3 horizont; uniform vec3 sonne; varying vec3 p;
      void main(){ float t = clamp(p.y * 2.2, 0.0, 1.0); vec3 c = mix(horizont, oben, pow(t, 0.7));
        float s = max(dot(p, sonne), 0.0); c += vec3(1.0, 0.92, 0.75) * (pow(s, 800.0) * 1.5 + pow(s, 30.0) * 0.25);
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  himmel.position.copy(mitte);
  szene.add(himmel);
  // Wolken
  const weiss = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true, emissive: "#d8e8f8", emissiveIntensity: 0.4 });
  for (let i = 0; i < 8; i++) {
    const w = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + hash(i, j, 41) * 5, 1), weiss);
      b.position.set(j * 7 - 10, hash(i, j, 42) * 2, hash(i, j, 43) * 5); b.scale.y = 0.45; w.add(b);
    }
    const a = (i / 8) * Math.PI * 2;
    w.position.set(mitte.x + Math.cos(a) * 200, 70 + hash(i, 1, 44) * 30, mitte.z + Math.sin(a) * 200);
    szene.add(w);
  }
}

function meerBauen(szene, mitte, B, T, animationen) {
  // Weites Meer (bis zum Horizont), Textur wandert langsam
  const tex = textur(wasserTextur(), { wiederholen: true });
  tex.repeat.set(60, 60);
  const fern = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, color: "#5ab0e8", roughness: 0.25, metalness: 0.1 }));
  fern.position.set(mitte.x, -0.75, mitte.z + 300);
  szene.add(fern);
  // Nahes Wasser mit Wellen
  const geo = new THREE.PlaneGeometry(B + 60, 70, 90, 40).rotateX(-Math.PI / 2);
  const nah = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, color: "#4aa8e0", roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.94 }));
  nah.position.set(B / 2, -0.7, KAI_Y * E + 30);
  nah.receiveShadow = true;
  szene.add(nah);
  const nahOst = new THREE.Mesh(new THREE.PlaneGeometry(40, KAI_Y * E, 20, 30).rotateX(-Math.PI / 2), nah.material);
  nahOst.position.set(B + 4, -0.7, KAI_Y * E / 2 + 6);
  szene.add(nahOst);
  const pos = geo.attributes.position, basis = Float32Array.from(pos.array);
  animationen.push((t) => {
    tex.offset.set(t * 0.004, t * 0.006);
    for (let i = 0; i < pos.count; i++) {
      const x = basis[i * 3], z = basis[i * 3 + 2];
      pos.array[i * 3 + 1] = Math.sin(x * 0.35 + t * 1.3) * 0.08 + Math.cos(z * 0.45 + t * 1.1) * 0.08;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  // Ferne Inseln
  const fels = new THREE.MeshStandardMaterial({ color: "#a8a07a", roughness: 1, flatShading: true });
  const gruen = new THREE.MeshStandardMaterial({ color: "#7a8a4a", roughness: 1, flatShading: true });
  for (let i = 0; i < 5; i++) {
    const r = 18 + hash(i, 1, 51) * 30;
    const insel = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? fels : gruen);
    insel.scale.y = 0.25 + hash(i, 2, 51) * 0.25;
    insel.position.set(mitte.x - 260 + i * 140 + hash(i, 3, 51) * 40, -1, mitte.z + 260 + hash(i, 4, 51) * 120);
    szene.add(insel);
  }
}

function umlandBauen(szene, B, T) {
  // Trockene Hügel im Norden und Westen mit Zypressen und Olivenhainen
  const erde = new THREE.MeshStandardMaterial({ color: "#a8a466", roughness: 1 });
  const nord = new THREE.Mesh(new THREE.PlaneGeometry(B + 600, 400).rotateX(-Math.PI / 2), erde);
  nord.position.set(B / 2, -0.03, -200);
  szene.add(nord);
  const west = new THREE.Mesh(new THREE.PlaneGeometry(400, KAI_Y * E + 400).rotateX(-Math.PI / 2), erde);
  west.position.set(-200, -0.03, (KAI_Y * E) / 2 - 200);
  szene.add(west);
  const ost = new THREE.Mesh(new THREE.PlaneGeometry(300, 20).rotateX(-Math.PI / 2), erde);
  ost.position.set(B + 150, -0.03, 10);
  szene.add(ost);
  const huegel = new THREE.MeshStandardMaterial({ color: "#9a9a5a", roughness: 1, flatShading: true });
  const fels = new THREE.MeshStandardMaterial({ color: "#c8b88a", roughness: 1, flatShading: true });
  // Hügel nur im Norden und Westen (nie im Meer)
  for (let i = 0; i < 16; i++) {
    const nord = i < 10;
    const x = nord ? -60 + (i / 9) * (B + 120) + (hash(i, 1, 61) - 0.5) * 20 : -70 - hash(i, 2, 61) * 50;
    const z = nord ? -70 - hash(i, 2, 61) * 50 : -40 + ((i - 10) / 5) * (KAI_Y * E + 20);
    const h = new THREE.Mesh(new THREE.SphereGeometry(30 + hash(i, 3, 61) * 25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 3 ? huegel : fels);
    h.scale.y = 0.4 + hash(i, 4, 61) * 0.4;
    h.position.set(x, -1, z);
    szene.add(h);
  }
  const t = new Teile();
  for (let i = 0; i < 70; i++) {
    const x = -8 - hash(i, 1, 71) * 60, z = -10 + hash(i, 2, 71) * (KAI_Y * E + 10);
    const x2 = hash(i, 3, 71) * (B + 20), z2 = -6 - hash(i, 4, 71) * 50;
    const [px, pz] = i % 2 ? [x, z] : [x2, z2];
    if (i % 3 === 0) zypresse(t, px, pz, 0.8 + hash(i, 5, 71) * 0.6);
    else olive(t, px, pz, 0.8 + hash(i, 6, 71) * 0.4);
  }
  const g = new THREE.Group(); t.in(g, { schatten: false }); szene.add(g);
}

// ---------- Bausteine ----------

function zypresse(t, x, z, s = 1) {
  t.add(ZYL(1, 1, 6), "#5a3a26", [x, 0.4 * s, z], [0, 0, 0], [0.12 * s, 0.8 * s, 0.12 * s]);
  t.add(KUGEL_K(), "#2f5a32", [x, 2.6 * s, z], [0, 0, 0], [0.55 * s, 2.3 * s, 0.55 * s], { verlauf: 0.35 });
  t.add(KEGEL(8), "#335e36", [x, 4.9 * s, z], [0, 0, 0], [0.35 * s, 1.2 * s, 0.35 * s]);
}

function olive(t, x, z, s = 1) {
  t.add(ZYL(0.7, 1, 7), "#6a5a46", [x, 0.6 * s, z], [0.15, 0, 0.1], [0.18 * s, 1.2 * s, 0.18 * s]);
  t.add(ZYL(0.6, 1, 6), "#6a5a46", [x + 0.25 * s, 1.3 * s, z], [0, 0, -0.6], [0.1 * s, 0.7 * s, 0.1 * s]);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + x;
    t.add(KUGEL_K(), k % 2 ? "#8a9a6a" : "#9aaa7a", [x + Math.cos(a) * 0.65 * s, 1.85 * s + (k % 2) * 0.25 * s, z + Math.sin(a) * 0.65 * s], [0, a, 0], [0.75 * s, 0.45 * s, 0.7 * s], { verlauf: 0.2 });
  }
}

function saeule(t, x, z, h = 4.6, r = 0.32, farbe = MARMOR) {
  t.add(KASTEN(), farbe, [x, 0.12, z], [0, 0, 0], [r * 2.6, 0.24, r * 2.6]);
  t.add(ZYL(1, 1, 8), farbe, [x, 0.34, z], [0, 0, 0], [r * 1.25, 0.2, r * 1.25]);
  t.add(ZYL(0.88, 1, 16), farbe, [x, h / 2, z], [0, 0, 0], [r, h - 0.6, r]);
  t.add(ZYL(1.35, 1, 16), farbe, [x, h - 0.22, z], [0, 0, 0], [r * 1.1, 0.24, r * 1.1]);
  t.add(KASTEN(), farbe, [x, h - 0.04, z], [0, 0, 0], [r * 2.7, 0.16, r * 2.7]);
}

function amphore(t, x, z, s = 1, farbe = "#b8643a") {
  t.add(DREH([V(0, 0), V(0.08, 0), V(0.22, 0.25), V(0.25, 0.45), V(0.18, 0.7), V(0.08, 0.8), V(0.09, 0.9), V(0, 0.9)], 14, "amphore"), farbe, [x, 0, z], [0, 0, 0], s);
  for (const sx of [-1, 1]) t.add(RING(0.25, Math.PI), farbe, [x + sx * 0.12 * s, 0.75 * s, z], [0, 0, sx * 1.2], [0.08 * s, 0.1 * s, 0.08 * s]);
}

function hausBauen(t, dachT, h, idx, animationen) {
  const x0 = h.x * E, z0 = h.y * E, w = h.w * E, d = h.h * E;
  const hoehe = 3.6 + (idx % 3) * 1.1;
  const cx = x0 + w / 2, cz = z0 + d / 2;
  // Wände: eigene Mesh mit Putztextur (Fenster), Sockel und Gesims über Teile
  t.add(KASTEN(), "#e8dcc4", [cx, 0.2, cz], [0, 0, 0], [w - 0.1, 0.4, d - 0.1]);
  t.add(KASTEN(), "#e4d8c0", [cx, hoehe + 0.05, cz], [0, 0, 0], [w - 0.05, 0.18, d - 0.05]);
  // Tür (Süd- oder Nordseite) mit Bogen
  const tuerZ = h.y > 20 ? z0 - 0.02 : z0 + d + 0.02;
  const tuerX = cx + ((idx % 3) - 1) * w * 0.2;
  t.add(KASTEN(), "#5a3a26", [tuerX, 1.0, tuerZ], [0, 0, 0], [1.0, 2.0, 0.08]);
  t.add(ZYL(1, 1, 12), "#5a3a26", [tuerX, 2.0, tuerZ], [Math.PI / 2, 0, 0], [0.5, 0.08, 0.5]);
  t.add(KASTEN(), "#d8ccb4", [tuerX, 0.06, tuerZ + (h.y > 20 ? -0.35 : 0.35)], [0, 0, 0], [1.4, 0.12, 0.6]);
  // Dach: flaches Walmdach aus Ziegeln oder Dachterrasse mit Pergola
  const g = new THREE.Group();
  if (idx % 4 !== 3) {
    const dach = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), dachT);
    dach.scale.set(w + 0.6, 1.3 + (idx % 2) * 0.4, d + 0.6);
    dach.position.set(cx, hoehe + 0.14 + dach.scale.y / 2, cz);
    dach.castShadow = true; dach.receiveShadow = true;
    g.add(dach);
  } else {
    // Dachterrasse: Brüstung, Pergola mit Weinlaub, Pflanzkübel
    for (const [px, pz, sw, sd] of [[cx, z0 + 0.1, w, 0.2], [cx, z0 + d - 0.1, w, 0.2], [x0 + 0.1, cz, 0.2, d], [x0 + w - 0.1, cz, 0.2, d]]) t.add(KASTEN(), KALK, [px, hoehe + 0.45, pz], [0, 0, 0], [sw, 0.7, sd]);
    for (const [px, pz] of [[x0 + 1, z0 + 1], [x0 + w - 1, z0 + 1], [x0 + 1, z0 + d - 1], [x0 + w - 1, z0 + d - 1]]) t.add(ZYL(1, 1, 6), "#7a5a3a", [px, hoehe + 1.2, pz], [0, 0, 0], [0.07, 2.2, 0.07]);
    for (let k = 0; k < 6; k++) t.add(KUGEL_K(), k % 2 ? "#5a8a3a" : "#6a9a44", [x0 + 1 + (k / 5) * (w - 2), hoehe + 2.35, cz + Math.sin(k) * d * 0.3], [0, 0, 0], [0.9, 0.25, 0.8]);
    amphore(t, x0 + 0.6, z0 + d - 0.6, 1.1, "#c87048");
  }
  // Bougainvillea an jedem zweiten Haus
  if (idx % 2 === 0) {
    const bx = x0 + 0.15, bz = z0 + d * 0.3;
    for (let k = 0; k < 9; k++) t.add(KUGEL_K(), k % 3 ? "#d83a8a" : "#e85aa8", [bx - 0.2, 1.4 + hash(idx, k, 1) * 2.4, bz + hash(idx, k, 2) * d * 0.4], [0, 0, 0], [0.3, 0.35, 0.4]);
    t.add(ZYL(1, 1, 5), "#5a4a2a", [bx - 0.15, 1.6, bz + d * 0.2], [0, 0, 0.1], [0.05, 3.2, 0.05]);
  }
  return { g, hoehe, x0, z0, w, d };
}

function waendeBauen(szene, haeuser) {
  // Alle Wände einer Höhe teilen sich ein Material; UV über die Weltlänge (Fensterabstand 2 Einheiten)
  const tex = textur(putzTextur(), { wiederholen: true });
  const geos = [];
  for (const h of haeuser) {
    const box = new THREE.BoxGeometry(h.w - 0.1, h.hoehe, h.d - 0.1);
    const uv = box.attributes.uv, nrm = box.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      const breit = Math.abs(nrm.getX(i)) > 0.5 ? h.d : h.w;
      uv.setX(i, uv.getX(i) * breit / 2);
      if (Math.abs(nrm.getY(i)) > 0.5) uv.setXY(i, 0.02, 0.98);
    }
    box.translate(h.x0 + h.w / 2, h.hoehe / 2, h.z0 + h.d / 2);
    geos.push(box);
  }
  const m = new THREE.Mesh(mergeBoxen(geos), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }));
  m.castShadow = true; m.receiveShadow = true;
  szene.add(m);
}

function mergeBoxen(geos) {
  let n = 0, ni = 0;
  for (const g of geos) { n += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = new Uint32Array(ni);
  let v = 0, i0 = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, v * 3); nor.set(g.attributes.normal.array, v * 3); uv.set(g.attributes.uv.array, v * 2);
    const a = g.index.array; for (let k = 0; k < a.length; k++) idx[i0 + k] = a[k] + v;
    v += g.attributes.position.count; i0 += a.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

function glockenturmBauen(szene, b, animationen) {
  const g = new THREE.Group();
  const cx = (b.x + b.w / 2) * E, cz = (b.y + b.h / 2) * E;
  g.position.set(cx, 0, cz);
  const t = new Teile();
  // Podium mit Stufen
  for (let i = 0; i < 3; i++) t.add(KASTEN(), MARMOR, [0, 0.15 + i * 0.3, 0], [0, 0, 0], [b.w * E + 1.6 - i * 0.8, 0.3, b.h * E + 1.6 - i * 0.8]);
  // Schaft aus Sandstein mit Lisenen
  t.add(KASTEN(), SANDSTEIN, [0, 6.9, 0], [0, 0, 0], [5.6, 12, 5.6]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(KASTEN(), "#e4d6b4", [sx * 2.7, 6.9, sz * 2.7], [0, 0, 0], [0.6, 12, 0.6]);
  for (const y of [4.5, 9]) t.add(KASTEN(), "#e8dcc0", [0, y, 0], [0, 0, 0], [6.0, 0.3, 6.0]);
  // Tor mit Bogen (Süden)
  t.add(KASTEN(), "#5a3a26", [0, 2.0, 2.82], [0, 0, 0], [1.8, 2.8, 0.1]);
  t.add(ZYL(1, 1, 16), "#5a3a26", [0, 3.4, 2.82], [Math.PI / 2, 0, 0], [0.9, 0.1, 0.9]);
  t.add(RING(0.12, Math.PI), "#c9a24e", [0, 3.4, 2.9], [0, 0, 0], [1.0, 1.0, 0.5], { art: "glanz" });
  // Glockenstube: vier Ecksäulen, Gebälk, Kuppel
  t.in(g);
  const stube = new Teile();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    stube.add(ZYL(0.9, 1, 14), MARMOR, [sx * 2.4, 14.6, sz * 2.4], [0, 0, 0], [0.38, 4.2, 0.38]);
    stube.add(KASTEN(), MARMOR, [sx * 2.4, 16.8, sz * 2.4], [0, 0, 0], [1.0, 0.2, 1.0]);
  }
  stube.add(KASTEN(), MARMOR, [0, 12.6, 0], [0, 0, 0], [6.2, 0.3, 6.2]);
  stube.add(KASTEN(), "#e8dcc0", [0, 17.1, 0], [0, 0, 0], [6.4, 0.5, 6.4]);
  // Dreiecksgiebel auf allen vier Seiten
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    stube.add(KEGEL(3), MARMOR, [Math.sin(a) * 3.0, 17.9, Math.cos(a) * 3.0], [Math.PI / 2, a, 0, "YXZ"], [3.3, 0.25, 1.2]);
  }
  stube.add(DREH([V(0, 0), V(2.9, 0), V(2.6, 0.9), V(1.8, 1.7), V(0.8, 2.15), V(0, 2.3)], 24, "turmkuppel"), TERRAKOTTA, [0, 17.35, 0]);
  stube.add(ZYL(1, 1, 8), "#c9a24e", [0, 20.0, 0], [0, 0, 0], [0.08, 0.9, 0.08], { art: "glanz" });
  stube.add(KUGEL(), "#c9a24e", [0, 20.55, 0], [0, 0, 0], 0.22, { art: "glanz" });
  stube.in(g);
  // Die große Glocke (Bronze) mit Leuchten, sobald ein Ton zurück ist
  const glocke = new THREE.Group();
  glocke.position.set(0, 16.2, 0);
  const gt = new Teile();
  gt.add(DREH([V(0, 0), V(1.25, -0.05), V(1.15, 0.2), V(0.85, 0.6), V(0.8, 1.4), V(0.55, 1.75), V(0, 1.82)], 24, "glocke"), "#b8863a", [0, -1.9, 0], [0, 0, 0], 1, { art: "glanz" });
  gt.add(KUGEL(), "#8a6428", [0, -1.95, 0], [0, 0, 0], 0.22, { art: "glanz" });
  gt.add(ZYL(1, 1, 8), "#5a3a26", [0, 0.1, 0], [0, 0, Math.PI / 2], [0.15, 4.6, 0.15]);
  gt.in(glocke);
  g.add(glocke);
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,230,160,0.95)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  schein.position.set(0, 15, 0); schein.scale.setScalar(9);
  g.add(schein);
  animationen.push((zeit) => {
    const toene = ["aurelia_q1", "aurelia_q2", "aurelia_q3", "aurelia_q4", "aurelia_q5"].filter((k) => zustand.erledigt[k]).length;
    glocke.rotation.z = toene ? Math.sin(zeit * 1.2) * 0.05 * toene : 0;
    schein.material.opacity = toene ? 0.25 + toene * 0.12 + Math.sin(zeit * 2) * 0.05 : 0;
  });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  szene.add(g);
}

function leuchtturmBauen(szene, b, animationen) {
  const g = new THREE.Group();
  g.position.set((b.x + b.w / 2) * E, 0, (b.y + b.h / 2) * E);
  const t = new Teile();
  // Felsen und Sockel
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; t.add(KUGEL_K(), "#b8a88a", [Math.cos(a) * 3.2, -0.2, Math.sin(a) * 3.2], [i, i * 2, 0], [1.4, 0.9, 1.2]); }
  t.add(KASTEN(), SANDSTEIN, [0, 2.6, 0], [0, 0, 0], [4.4, 5.2, 4.4]);
  for (const y of [1.2, 5.2]) t.add(KASTEN(), "#e8dcc0", [0, y, 0], [0, 0, 0], [4.7, 0.25, 4.7]);
  t.add(KASTEN(), "#5a3a26", [0, 1.1, 2.22], [0, 0, 0], [1.0, 2.0, 0.06]);
  // Achteckiger Mittelteil
  t.add(ZYL(0.88, 1, 8), KALK, [0, 7.8, 0], [0, Math.PI / 8, 0], [1.9, 5.2, 1.9]);
  t.add(ZYL(1, 1, 8), "#e8dcc0", [0, 10.45, 0], [0, Math.PI / 8, 0], [1.9, 0.25, 1.9]);
  // Runder Aufsatz mit Feuerschale und Säulchen
  t.add(ZYL(0.9, 1, 16), KALK, [0, 11.8, 0], [0, 0, 0], [1.25, 2.5, 1.25]);
  t.add(ZYL(1, 1, 16), "#e8dcc0", [0, 13.1, 0], [0, 0, 0], [1.45, 0.2, 1.45]);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; t.add(ZYL(1, 1, 8), MARMOR, [Math.cos(a) * 1.1, 14.0, Math.sin(a) * 1.1], [0, 0, 0], [0.1, 1.8, 0.1]); }
  t.add(DREH([V(0, 0), V(1.4, 0), V(1.0, 0.7), V(0, 0.9)], 16, "lt_dach"), TERRAKOTTA, [0, 14.9, 0]);
  t.add(KUGEL(), "#c9a24e", [0, 15.95, 0], [0, 0, 0], 0.18, { art: "glanz" });
  t.add(DREH([V(0, 0), V(0.7, 0.05), V(0.75, 0.35), V(0, 0.3)], 14, "feuerschale"), "#8a6428", [0, 13.3, 0], [0, 0, 0], 1, { art: "glanz" });
  t.in(g);
  // Feuer und rotierender Lichtstrahl
  const feuer = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,200,90,1)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  feuer.position.set(0, 14.0, 0); feuer.scale.setScalar(3.2);
  g.add(feuer);
  const strahl = new THREE.Mesh(new THREE.ConeGeometry(2.2, 26, 16, 1, true).rotateZ(Math.PI / 2).translate(13, 0, 0), new THREE.MeshBasicMaterial({
    color: "#fff2c0", transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }));
  strahl.position.set(0, 14.0, 0);
  g.add(strahl);
  animationen.push((zeit) => {
    feuer.scale.setScalar(3.0 + Math.sin(zeit * 9) * 0.2 + Math.sin(zeit * 23) * 0.1);
    strahl.rotation.y = zeit * 0.5;
  });
  g.traverse((m) => { if (m.isMesh && m !== strahl) { m.castShadow = true; m.receiveShadow = true; } });
  szene.add(g);
}

function bootBauen(laenge, farbe, mitSegel, segelFarbe = "#f4ece0") {
  const g = new THREE.Group();
  const t = new Teile();
  const rumpf = new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  t.add(rumpf, farbe, [0, 0.35, 0], [0, 0, 0], [laenge * 0.17, laenge * 0.12, laenge * 0.5], { verlauf: 0.3 });
  t.add(KASTEN(), "#8a6440", [0, 0.36, 0], [0, 0, 0], [laenge * 0.3, 0.06, laenge * 0.85]);
  t.add(RING(0.06), "#5a3a26", [0, 0.38, 0], [Math.PI / 2, 0, 0], [laenge * 0.17, laenge * 0.5, 1]);
  // Bug mit Auge (antike Schiffe)
  for (const s of [-1, 1]) t.add(KUGEL_K(), "#f4f0e8", [s * laenge * 0.13, 0.25, laenge * 0.4], [0, 0, 0], [0.04, 0.09, 0.12]);
  if (mitSegel) {
    t.add(ZYL(1, 1, 8), "#6a4a2e", [0, laenge * 0.45, 0], [0, 0, 0], [0.07, laenge * 0.85, 0.07]);
    t.add(ZYL(1, 1, 8), "#6a4a2e", [0, laenge * 0.78, 0], [0, 0, Math.PI / 2], [0.05, laenge * 0.45, 0.05]);
  }
  t.in(g);
  if (mitSegel) {
    const [c, gx] = leinwand(64, 64);
    gx.fillStyle = segelFarbe; gx.fillRect(0, 0, 64, 64);
    gx.fillStyle = "#c0503a"; for (let i = 0; i < 4; i++) gx.fillRect(i * 16, 0, 8, 64);
    const segel = new THREE.Mesh(new THREE.PlaneGeometry(laenge * 0.42, laenge * 0.5, 4, 4), new THREE.MeshStandardMaterial({ map: textur(c), side: THREE.DoubleSide, roughness: 0.9 }));
    segel.position.set(0, laenge * 0.52, 0.08);
    segel.rotation.y = Math.PI / 2;
    segel.castShadow = true;
    g.add(segel);
  }
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function hafenBauen(szene, raster, animationen) {
  const t = new Teile();
  // Kaimauer: Steinkante überall, wo Land an Meer grenzt
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z === "~" || z === "=") return;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      if (raster[ty + dy]?.[tx + dx] !== "~") continue;
      const x = tx * E + E / 2 + dx * (E / 2 - 0.25), zz = ty * E + E / 2 + dy * (E / 2 - 0.25);
      t.add(KASTEN(), "#b8a888", [x, -0.75, zz], [0, 0, 0], [dx ? 0.5 : E, 1.6, dy ? 0.5 : E]);
      t.add(KASTEN(), "#d4c6a6", [x, 0.08, zz], [0, 0, 0], [dx ? 0.55 : E, 0.16, dy ? 0.55 : E]);
    }
  }));
  // Stege aus Holz auf Pfählen, mit Nummernschild
  const holz = new THREE.MeshStandardMaterial({ map: textur(holzTextur("#9a7048"), { wiederholen: true }), roughness: 0.9 });
  for (const s of STEGE) {
    const laenge = (s.y1 - s.y0 + 1) * E;
    for (let i = 0; i < laenge / 0.5; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(E * 2 - 0.2, 0.12, 0.44), holz);
      p.position.set(s.x * E + E, 0.02, s.y0 * E + 0.25 + i * 0.5);
      p.receiveShadow = true; p.castShadow = true;
      szene.add(p);
    }
    for (let k = 0; k <= laenge / 3; k++) for (const sx of [-1, 1]) {
      t.add(ZYL(1, 1, 7), "#6a4a2e", [s.x * E + E + sx * 1.75, -0.6, s.y0 * E + 0.3 + k * 3], [0, 0, 0], [0.13, 1.6, 0.13]);
    }
    t.add(ZYL(0.8, 1, 10), "#4a4a52", [s.x * E + E - 1.5, 0.35, (s.y1 + 1) * E - 0.4], [0, 0, 0], [0.18, 0.5, 0.18], { art: "glanz" });
    const schild = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: textur(schildTextur(`Steg ${s.nr}`)), roughness: 0.8 }));
    schild.position.set(s.x * E + E + 1.3, 1.35, s.y0 * E - 0.6);
    szene.add(schild);
    t.add(ZYL(1, 1, 6), "#6a4a2e", [s.x * E + E + 1.3, 0.6, s.y0 * E - 0.65], [0, 0, 0], [0.05, 1.2, 0.05]);
  }
  // Waren am Kai: Amphoren, Kisten, Netze
  for (let i = 0; i < 12; i++) {
    const x = 2 + hash(i, 1, 81) * 40, z = (KAI_Y - 1) * E + 0.6;
    if (STEGE.some((s) => Math.abs(x - s.x - 1) < 2.2)) continue;
    if (i % 3 === 0) t.add(KASTEN(), "#9a7048", [x * E, 0.35, z], [0, hash(i, 2, 81), 0], [0.7, 0.7, 0.7]);
    else amphore(t, x * E, z, 1.1, i % 2 ? "#b8643a" : "#a85a34");
  }
  const g = new THREE.Group(); t.in(g); szene.add(g);
  g.traverse((m) => { if (m.isMesh) m.receiveShadow = true; });

  // Boote an den Stegen und die Fähre an Steg 5
  const boote = [];
  STEGE.forEach((s, i) => {
    if (i === 4) return;
    const b = bootBauen(4 + (i % 2), ["#2a6ab0", "#c8603a", "#f2ece0", "#3a8a5a"][i], i % 2 === 1);
    b.position.set(s.x * E + (i % 2 ? -2.2 : 6.2), -0.75, (s.y0 + 3) * E);
    szene.add(b); boote.push(b);
  });
  const faehre = bootBauen(11, "#7a4a2a", true);
  const s5 = STEGE[4];
  faehre.position.set(s5.x * E + 6, -0.8, (s5.y0 + 3.5) * E);
  szene.add(faehre); boote.push(faehre);
  // Werft im Westen: halbfertiger Rumpf mit Spanten auf Stelzen im Wasser
  const werft = new Teile();
  for (let k = 0; k < 6; k++) werft.add(RING(0.06, Math.PI), "#8a6440", [3, 0.4, (KAI_Y + 1) * E + k * 0.9], [0, 0, Math.PI], [1.6, 1.3, 1]);
  werft.add(KASTEN(), "#7a5434", [3, -0.85, (KAI_Y + 3) * E], [0, 0, 0], [0.4, 0.3, 6]);
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) werft.add(ZYL(1, 1, 6), "#6a4a2e", [3 + sx * 2, -0.2, (KAI_Y + 1) * E + k * 2.5], [0, 0, sx * 0.2], [0.1, 2.2, 0.1]);
  const wg = new THREE.Group(); werft.in(wg); szene.add(wg);
  animationen.push((zeit) => {
    boote.forEach((b, i) => {
      b.position.y = (i === boote.length - 1 ? -0.8 : -0.75) + Math.sin(zeit * 1.1 + i) * 0.06;
      b.rotation.z = Math.sin(zeit * 0.9 + i * 2) * 0.03;
      b.rotation.x = Math.sin(zeit * 0.7 + i) * 0.015;
    });
  });
}

function stadtBauen(szene, raster, animationen) {
  const t = new Teile();
  // Stadtmauer mit Zinnen, Tortürme am Westtor
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z !== "W") return;
    const x = tx * E + E / 2, zz = ty * E + E / 2;
    t.add(KASTEN(), SANDSTEIN, [x, 1.5, zz], [0, 0, 0], [E, 3.0, E]);
    if ((tx + ty) % 2 === 0) t.add(KASTEN(), "#d0c09c", [x, 3.3, zz], [0, 0, 0], [E * 0.6, 0.6, E * 0.6]);
  }));
  for (const y of [17, 21]) {
    t.add(ZYL(1, 1, 10), SANDSTEIN, [1, 2.6, y * E + 1], [0, 0, 0], [1.6, 5.2, 1.6]);
    t.add(KEGEL(10), TERRAKOTTA, [1, 6.0, y * E + 1], [0, 0, 0], [1.9, 1.6, 1.9]);
  }
  // Säulen (Stoa an der Agora, Tempel um den Turm) mit Gebälk zwischen benachbarten Säulen
  const saeulen = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => { if (z === "C") saeulen.push([tx, ty]); }));
  for (const [tx, ty] of saeulen) saeule(t, tx * E + E / 2, ty * E + E / 2);
  for (const [tx, ty] of saeulen) {
    for (const [dx, dy] of [[3, 0], [0, 2]]) {
      if (!saeulen.some(([x, y]) => x === tx + dx && y === ty + dy)) continue;
      const x = (tx + dx / 2) * E + E / 2, zz = (ty + dy / 2) * E + E / 2;
      t.add(KASTEN(), MARMOR, [x, 4.75, zz], [0, 0, 0], [dx ? dx * E + 0.9 : 0.9, 0.5, dy ? dy * E + 0.9 : 0.9]);
      t.add(KASTEN(), "#e4dccc", [x, 5.12, zz], [0, 0, 0], [dx ? dx * E + 1.0 : 1.0, 0.22, dy ? dy * E + 1.0 : 1.0]);
    }
  }
  // Bäume
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z === "T") zypresse(t, tx * E + E / 2, ty * E + E / 2, 1.1);
    if (z === "O") olive(t, tx * E + E / 2, ty * E + E / 2, 1.2);
  }));
  // Kleinigkeiten: Amphoren und Blumenkübel an Hauswänden, Laternen
  for (let i = 0; i < 18; i++) {
    const tx = 2 + Math.floor(hash(i, 1, 91) * 44), ty = 2 + Math.floor(hash(i, 2, 91) * 25);
    if (raster[ty]?.[tx] !== "_") continue;
    const nachbarHaus = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => raster[ty + dy]?.[tx + dx] === "H");
    if (!nachbarHaus) continue;
    amphore(t, tx * E + E / 2, ty * E + E / 2, 1.0, i % 2 ? "#c87048" : "#a85a34");
    t.add(KUGEL_K(), "#4a8a3a", [tx * E + E / 2, 1.0, ty * E + E / 2], [0, 0, 0], [0.35, 0.3, 0.35]);
  }
  const g = new THREE.Group(); t.in(g); szene.add(g);

  // Häuser
  const dachT = new THREE.MeshStandardMaterial({ map: textur(dachTextur(TERRAKOTTA), { wiederholen: true }), roughness: 0.85 });
  dachT.map.repeat.set(3, 3);
  const ht = new Teile();
  const haeuser = bloecke(raster, "H").map((h, i) => {
    const r = hausBauen(ht, dachT, h, i, animationen);
    szene.add(r.g);
    return r;
  });
  const hg = new THREE.Group(); ht.in(hg); szene.add(hg);
  waendeBauen(szene, haeuser);
  for (const b of bloecke(raster, "G")) glockenturmBauen(szene, b, animationen);
  for (const b of bloecke(raster, "L")) leuchtturmBauen(szene, b, animationen);
}

// ---------- Objekte ----------

function rufmuschelBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(0.8, 1, 10), MARMOR, [0, 0.6, 0], [0, 0, 0], [0.22, 1.2, 0.22]);
  t.add(KASTEN(), MARMOR, [0, 0.06, 0], [0, 0, 0], [0.7, 0.12, 0.7]);
  // Spiralmuschel (Tritonshorn): Kegel mit Windungen, Öffnung zeigt nach vorn
  t.add(KEGEL(14), "#f2d8b8", [0, 1.5, -0.15], [-1.2, 0, 0], [0.32, 0.9, 0.32], { verlauf: 0.25 });
  for (let k = 0; k < 4; k++) t.add(RING(0.18), "#e0b890", [0, 1.42 + k * 0.08, -0.05 - k * 0.17], [-1.2 + Math.PI / 2, 0, 0], [0.3 - k * 0.06, 0.3 - k * 0.06, 0.4]);
  t.add(DREH([V(0.05, 0), V(0.34, 0.05), V(0.36, 0.12), V(0, 0.08)], 16, "muschelmund"), "#f8c8b0", [0, 1.62, 0.32], [1.2, 0, 0]);
  t.in(g);
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(120,220,255,0.9)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  schein.position.set(0, 1.6, 0.25); schein.scale.setScalar(1.2);
  g.add(schein);
  // Schallringe, solange die Muschel noch nicht gehört wurde
  const ringe = [];
  for (let k = 0; k < 3; k++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 32), new THREE.MeshBasicMaterial({ color: "#9ae8ff", transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    r.position.set(0, 1.62, 0.4);
    g.add(r); ringe.push(r);
  }
  let gehoert = false;
  g.userData.setzeLeuchten = (an) => { gehoert = Boolean(an); };
  animationen.push((zeit) => {
    ringe.forEach((r, k) => {
      const p = (zeit * 0.5 + k / 3) % 1;
      r.visible = !gehoert;
      r.scale.setScalar(0.2 + p * 0.8);
      r.position.z = 0.4 + p * 0.8;
      r.material.opacity = (1 - p) * 0.5;
    });
    schein.material.color.set(gehoert ? "#ffd27a" : "#9ae8ff");
    schein.scale.setScalar(1.1 + Math.sin(zeit * 3) * 0.1 + (gehoert ? 0.4 : 0));
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function brunnenBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(1, 1, 28), MARMOR, [0, 0.3, 0], [0, 0, 0], [1.75, 0.6, 1.75]);
  t.add(RING(0.08), "#e4dccc", [0, 0.6, 0], [Math.PI / 2, 0, 0], [1.75, 1.75, 1]);
  t.add(ZYL(0.7, 1, 12), MARMOR, [0, 1.2, 0], [0, 0, 0], [0.28, 1.6, 0.28]);
  t.add(DREH([V(0, 0), V(0.75, 0.15), V(0.85, 0.35), V(0, 0.25)], 20, "brunnenschale"), MARMOR, [0, 1.95, 0]);
  t.add(KUGEL(), "#c9a24e", [0, 2.45, 0], [0, 0, 0], 0.16, { art: "glanz" });
  t.in(g);
  const wasser = new THREE.Mesh(new THREE.CircleGeometry(1.62, 28).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#5ab8e8", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 }));
  wasser.position.y = 0.52;
  g.add(wasser);
  const tropfen = [];
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), new THREE.MeshBasicMaterial({ color: "#d8f4ff" }));
    s.userData = { a: (i / 18) * Math.PI * 2, p: i / 18 };
    g.add(s); tropfen.push(s);
  }
  animationen.push((zeit) => {
    for (const s of tropfen) {
      const p = (zeit * 0.8 + s.userData.p) % 1;
      const r = 0.85 * p;
      s.position.set(Math.cos(s.userData.a) * r, 2.2 + p * 0.3 - p * p * 1.9, Math.sin(s.userData.a) * r);
    }
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function tafelBauen() {
  const g = new THREE.Group();
  const t = new Teile();
  for (const sx of [-0.45, 0.45]) t.add(ZYL(1, 1, 6), "#6a4a2e", [sx, 0.75, 0], [0, 0, 0], [0.06, 1.5, 0.06]);
  t.add(KASTEN(), "#b8946a", [0, 1.25, 0.03], [0, 0, 0], [1.2, 0.75, 0.06]);
  t.add(KASTEN(), "#7a5a34", [0, 1.66, 0.03], [0, 0, 0], [1.3, 0.08, 0.1]);
  t.in(g);
  g.userData.setzeLeuchten = () => {};
  return g;
}

function objektModell(o, animationen) {
  if (o.bild === "rufmuschel") return { modell: rufmuschelBauen(animationen) };
  if (o.bild === "brunnen_antik") return { modell: brunnenBauen(animationen) };
  if (o.bild === "tafel") return { modell: tafelBauen() };
  return null;
}

// ---------- Aufbau ----------

export function aureliaBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const B = raster[0].length * E, T = raster.length * E;
  const mitte = new THREE.Vector3(B / 2, 0, T / 2);
  szene.background = new THREE.Color("#bcdcf4");
  szene.fog = new THREE.Fog("#cfe4f2", 90, 420);

  himmelBauen(szene, mitte);
  szene.add(new THREE.HemisphereLight("#d8ecff", "#c8b490", 1.25));
  const sonne = new THREE.DirectionalLight("#fff0d8", 2.8);
  sonne.castShadow = qualitaet.schatten;
  sonne.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(sonne.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
  sonne.shadow.bias = -0.0004;
  sonne.shadow.normalBias = 0.03;
  szene.add(sonne, sonne.target);

  // Boden mit Pflaster, Meer bleibt frei
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(B, T).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: textur(bodenTextur(raster)), roughness: 0.95, alphaTest: 0.5, transparent: false }));
  boden.position.set(B / 2, 0, T / 2);
  boden.receiveShadow = true;
  szene.add(boden);

  meerBauen(szene, mitte, B, T, animationen);
  umlandBauen(szene, B, T);
  stadtBauen(szene, raster, animationen);
  hafenBauen(szene, raster, animationen);

  // Lebendiges: Möwen, Glitzern auf dem Wasser, Pollen
  voegelBauen(szene, new THREE.Vector3(mitte.x, 10, KAI_Y * E + 10), Math.round(8 * qualitaet.partikel), animationen);
  const glitzer = [];
  for (let x = 0; x < raster[0].length; x += 3) glitzer.push([x * E, (KAI_Y + 4) * E + (x % 4) * 3]);
  lichtpunkteBauen(szene, glitzer, { farbe: "#ffffff", groesse: 0.3, hoehe: [-0.5, -0.4], streuung: 6, funkeln: true, anzahl: Math.round(140 * qualitaet.partikel) }, animationen);

  const versatz = new THREE.Vector3(30, 50, 40);
  return {
    blockZeichen: BLOCKIERT,
    hindernis: (tx, ty) => HINDERNIS[raster[ty]?.[tx]] ?? 0,
    objektModell: (o) => objektModell(o, animationen),
    licht: (p) => {
      sonne.position.set(p.x + versatz.x, versatz.y, p.z + versatz.z);
      sonne.target.position.set(p.x, 0, p.z);
    },
    kamera: { hoehe: 3.0, abstand: 6.6, maxHoehe: 9 },
  };
}
