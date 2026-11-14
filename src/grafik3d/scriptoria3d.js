// 3D: Scriptoria – ein verwunschener Bücherwald bei Nacht.
// Riesige silbergraue Bäume, ein dunkles Blätterdach, leuchtende Pilze, Glühwürmchen, Bücherregale zwischen
// den Wurzeln, der Große Lesebaum mit Laternen – und Schwarzer Nebel, der nach jeder Lese-Quest zurückweicht.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KASTEN, KEGEL } from "./figuren.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { lichtpunkteBauen } from "./effekte.js";
import { HINDERNIS, BLOCKIERT, bloecke, LICHTUNGEN } from "../welt/scriptoria_layout.js";
import { zustand } from "../zustand.js";

const RINDE = "#8e9690", RINDE_DUNKEL = "#5a625e", MOOS = "#1f3a26", LAUB = "#12261a";
const PILZFARBEN = ["#5ff0ff", "#b98aff", "#7dff9a", "#ffd36a"];
const PX = 16;

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

function bodenTextur(raster) {
  const W = raster[0].length * PX, H = raster.length * PX;
  const [c, g] = leinwand(W, H);
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    const x = tx * PX, y = ty * PX;
    const wald = z === "#";
    g.fillStyle = wald ? "#0d1a10" : "#1d3322";
    g.fillRect(x, y, PX, PX);
    for (let i = 0; i < 10; i++) {
      const v = hash(tx, ty, i);
      g.fillStyle = wald ? (v > 0.5 ? "rgba(30,60,35,0.6)" : "rgba(5,10,6,0.6)") : (v > 0.6 ? "rgba(70,110,60,0.5)" : v > 0.3 ? "rgba(40,70,40,0.5)" : "rgba(90,80,50,0.35)");
      g.fillRect(x + hash(tx, i, 1) * PX, y + hash(ty, i, 2) * PX, 3, 3);
    }
  }));
  // Weichere Übergänge
  g.filter = "blur(3px)";
  g.drawImage(c, 0, 0);
  g.filter = "none";
  return c;
}

function buecherTextur() {
  const [c, g] = leinwand(128, 128);
  g.fillStyle = "#3a2414"; g.fillRect(0, 0, 128, 128);
  const farben = ["#7a2a2a", "#2a4a7a", "#3a6a3a", "#8a6a2a", "#5a2a6a", "#6a4a2a", "#2a5a5a", "#9a8a6a"];
  for (let reihe = 0; reihe < 4; reihe++) {
    const y0 = reihe * 32 + 4;
    let x = 2;
    let i = 0;
    while (x < 124) {
      const w = 4 + Math.floor(hash(reihe, i, 3) * 6);
      const h = 20 + Math.floor(hash(reihe, i, 4) * 7);
      g.fillStyle = farben[Math.floor(hash(reihe, i, 5) * farben.length)];
      g.fillRect(x, y0 + 26 - h, w - 1, h);
      g.fillStyle = "rgba(255,230,160,0.35)"; g.fillRect(x, y0 + 26 - h + 4, w - 1, 1);
      x += w; i++;
    }
    g.fillStyle = "#24160c"; g.fillRect(0, y0 + 26, 128, 6);
  }
  return c;
}

let _tex = null;
function texturen() {
  if (_tex) return _tex;
  _tex = {
    buecher: textur(buecherTextur(), { wiederholen: true }),
    licht: textur(lichtTextur("rgba(255,255,255,1)")),
    nebel: textur(lichtTextur("rgba(255,255,255,1)")),
  };
  return _tex;
}

// ---------- Bausteine ----------

/** Riesenbaum: Stamm mit Wurzeln, optional mit Regalnische und Pilzen */
function riesenbaum(t, x, z, r, { seed = 0 } = {}) {
  t.add(ZYL(0.82, 1, 14), RINDE, [x, 13, z], [0, seed, 0], [r, 26, r], { verlauf: 0.5, zu: RINDE_DUNKEL });
  // Wurzeln
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + seed;
    t.add(KEGEL(8), RINDE_DUNKEL, [x + Math.cos(a) * r * 1.05, 0.9, z + Math.sin(a) * r * 1.05], [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9], [r * 0.38, 2.4, r * 0.38]);
  }
  // Moosflecken
  for (let k = 0; k < 4; k++) {
    const a = hash(seed * 10, k, 7) * Math.PI * 2, h = 1 + hash(seed * 10, k, 8) * 6;
    t.add(KUGEL_K(), MOOS, [x + Math.cos(a) * r * 0.95, h, z + Math.sin(a) * r * 0.95], [0, 0, 0], [0.6, 0.9, 0.6]);
  }
}

function pilz(t, x, z, s, farbe) {
  t.add(ZYL(0.8, 1, 8), "#d8d4c4", [x, s * 0.5, z], [0, 0, 0], [s * 0.18, s, s * 0.18]);
  t.add(KUGEL(), farbe, [x, s, z], [0, 0, 0], [s * 0.55, s * 0.28, s * 0.55], { art: "leucht" });
}

// ---------- Objekte ----------

function briefbaumBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(0.7, 1, 10), RINDE_DUNKEL, [0, 1.4, 0], [0, 0, 0.05], [0.3, 2.8, 0.3]);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    t.add(ZYL(0.5, 1, 6), RINDE_DUNKEL, [Math.cos(a) * 0.55, 2.7, Math.sin(a) * 0.55], [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9], [0.09, 1.4, 0.09]);
  }
  t.add(KUGEL_K(), "#2a4a2e", [0, 3.4, 0], [0, 0, 0], [1.3, 0.8, 1.3]);
  t.in(g);
  // Briefe an Fäden
  const briefe = [];
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3, r = 0.9 + (k % 2) * 0.25;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.02), new THREE.MeshStandardMaterial({ color: "#f0e6cc", emissive: "#ffe8a0", emissiveIntensity: 0, roughness: 0.8 }));
    b.position.set(Math.cos(a) * r, 2.3 - (k % 3) * 0.25, Math.sin(a) * r);
    b.rotation.y = -a;
    g.add(b); briefe.push(b);
  }
  let leuchten = 0;
  g.userData.setzeLeuchten = (an) => { leuchten = an ? 0.9 : 0; };
  animationen.push((zeit) => {
    briefe.forEach((b, i) => {
      b.rotation.z = Math.sin(zeit * 1.5 + i) * 0.25;
      b.material.emissiveIntensity = leuchten * (0.6 + Math.sin(zeit * 2 + i) * 0.3);
    });
  });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function lesepultBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  // Steintisch mit Baumstümpfen als Sitze
  t.add(ZYL(1, 1, 16), "#6a6a62", [0, 0.45, 0], [0, 0, 0], [1.1, 0.9, 0.8]);
  t.add(ZYL(1, 1, 16), "#7a7a70", [0, 0.95, 0], [0, 0, 0], [1.4, 0.12, 1.0]);
  for (const [sx, sz] of [[-2.0, 0.6], [2.0, 0.6], [0, 1.8], [-1.5, -1.2], [1.5, -1.2]]) t.add(ZYL(0.9, 1, 10), "#5a4030", [sx, 0.3, sz], [0, 0, 0], [0.4, 0.6, 0.4]);
  // Offenes Gästebuch
  t.add(KASTEN(), "#5a2a1a", [0, 1.06, 0], [0, 0, 0], [0.9, 0.06, 0.6]);
  t.add(KASTEN(), "#f4ead0", [-0.22, 1.1, 0], [0, 0, 0.12], [0.42, 0.03, 0.55]);
  t.add(KASTEN(), "#f4ead0", [0.22, 1.1, 0], [0, 0, -0.12], [0.42, 0.03, 0.55]);
  t.in(g);
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#ffe0a0", transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  schein.position.set(0, 1.4, 0); schein.scale.setScalar(1.8);
  g.add(schein);
  animationen.push((zeit) => { schein.material.opacity = 0.4 + Math.sin(zeit * 1.7) * 0.12; });
  g.userData.setzeLeuchten = () => {};
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function aushangBauen() {
  const g = new THREE.Group();
  const t = new Teile();
  for (const sx of [-0.6, 0.6]) t.add(ZYL(1, 1, 6), RINDE_DUNKEL, [sx, 1.0, 0], [0, 0, 0], [0.08, 2.0, 0.08]);
  t.add(KASTEN(), "#6a4a2e", [0, 1.5, 0], [0, 0, 0], [1.5, 0.9, 0.08]);
  t.add(KASTEN(), "#e8dcc0", [0, 1.5, 0.05], [0, 0, 0], [1.3, 0.72, 0.02]);
  for (let i = 0; i < 5; i++) t.add(KASTEN(), "#5a4a3a", [-0.1 + (i % 2) * 0.1, 1.72 - i * 0.12, 0.07], [0, 0, 0], [0.9 - (i % 3) * 0.15, 0.025, 0.01]);
  t.add(KEGEL(4), "#3a2a1a", [0, 2.1, 0], [0, Math.PI / 4, 0], [1.1, 0.4, 0.25]);
  t.in(g);
  g.userData.setzeLeuchten = () => {};
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function steintorBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  for (const sx of [-2.2, 2.2]) t.add(KASTEN(), "#4a4a50", [sx, 2.2, 0], [0, 0, 0], [1.2, 4.4, 1.4]);
  t.add(KASTEN(), "#4a4a50", [0, 4.8, 0], [0, 0, 0], [5.8, 1.2, 1.5]);
  t.add(KASTEN(), "#050608", [0, 2.0, -0.2], [0, 0, 0], [3.2, 4.0, 0.8]);
  // Wurzeln über dem Tor
  for (let k = 0; k < 6; k++) t.add(ZYL(0.5, 1, 6), RINDE_DUNKEL, [-2.6 + k, 4.4 - (k % 2) * 0.6, 0.6], [0.3, 0, 0.5 - k * 0.2], [0.12, 2.4, 0.12]);
  t.in(g);
  // Zwei glühende Augen in der Dunkelheit
  const augen = [-0.45, 0.45].map((sx) => {
    const a = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#ffcc33", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    a.position.set(sx, 2.6, 0.25); a.scale.setScalar(0.45); g.add(a); return a;
  });
  animationen.push((zeit) => {
    const blinzeln = Math.sin(zeit * 0.7) > 0.97 ? 0 : 1;
    const da = !zustand.erledigt.scriptoria_q5_boss;
    augen.forEach((a) => { a.visible = da; a.material.opacity = blinzeln * (0.7 + Math.sin(zeit * 3) * 0.2); });
  });
  g.userData.setzeLeuchten = () => {};
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

/** Schwarzer Nebel, der einen Pfad versperrt. setzeOffen(true) lässt ihn verwehen. */
function nebelBauen(o, animationen) {
  const g = new THREE.Group();
  const b = (o.breite ?? 1) * E, h = (o.hoehe ?? 1) * E;
  const fetzen = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.SpriteMaterial({ map: texturen().nebel, color: i % 3 ? "#020104" : "#140a22", transparent: true, opacity: 0.95, depthWrite: false });
    const s = new THREE.Sprite(m);
    s.userData = { x: (hash(i, 1, 9) - 0.5) * b, z: (hash(i, 2, 9) - 0.5) * h, y: 0.6 + hash(i, 3, 9) * 3.6, gr: 3.4 + hash(i, 4, 9) * 3, p: i };
    s.scale.setScalar(s.userData.gr);
    g.add(s); fetzen.push(s);
  }
  // Violettes Glimmen im Nebel, damit man ihn im dunklen Wald sieht
  const glimmen = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturen().licht, color: "#8a3aff", transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.userData = { x: (hash(i, 5, 9) - 0.5) * b, z: (hash(i, 6, 9) - 0.5) * h, y: 0.8 + hash(i, 7, 9) * 2.6, p: i };
    s.scale.setScalar(1.2 + hash(i, 8, 9) * 1.4);
    g.add(s); glimmen.push(s);
  }
  let ziel = 1, wert = 1;
  g.userData.setzeOffen = (offen, sofort) => { ziel = offen ? 0 : 1; if (sofort) wert = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    wert += (ziel - wert) * Math.min(1, dt * 0.8);
    g.visible = wert > 0.02;
    if (!g.visible) return;
    for (const s of fetzen) {
      const u = s.userData;
      s.position.set(u.x + Math.sin(zeit * 0.4 + u.p) * 0.6, u.y + Math.sin(zeit * 0.6 + u.p * 2) * 0.3 + (1 - wert) * 4, u.z + Math.cos(zeit * 0.35 + u.p) * 0.6);
      s.material.opacity = 0.8 * wert;
      s.material.rotation = zeit * 0.1 + u.p;
    }
    for (const s of glimmen) {
      const u = s.userData;
      s.position.set(u.x + Math.sin(zeit * 0.5 + u.p) * 0.8, u.y + Math.sin(zeit * 0.9 + u.p) * 0.4, u.z + Math.cos(zeit * 0.4 + u.p) * 0.8);
      s.material.opacity = (0.25 + Math.sin(zeit * 1.3 + u.p * 2) * 0.15) * wert;
    }
  });
  return { modell: g, setzeOffen: g.userData.setzeOffen };
}

/** Lehrlingshaus: Holzhaus auf Stelzen mit runden, warm leuchtenden Fenstern */
function baumhausBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  const holz = "#6a4a30", dunkel = "#4a3020";
  for (const sx of [-2.4, 2.4]) for (const sz of [-1.4, 1.4]) t.add(ZYL(1, 1, 8), dunkel, [sx, 0.9, sz], [0, 0, 0], [0.22, 1.8, 0.22]);
  t.add(KASTEN(), holz, [0, 1.85, 0], [0, 0, 0], [5.6, 0.2, 3.6]);
  t.add(KASTEN(), "#7a5838", [0, 3.2, 0], [0, 0, 0], [5.0, 2.5, 3.0]);
  for (let i = 0; i < 6; i++) t.add(KASTEN(), dunkel, [0, 2.1 + i * 0.42, 1.52], [0, 0, 0], [5.02, 0.04, 0.02]);
  t.add(KEGEL(4), "#3a4a2a", [0, 5.4, 0], [0, Math.PI / 4, 0], [4.3, 2.0, 3.0]);
  t.add(KASTEN(), dunkel, [1.4, 2.9, 1.52], [0, 0, 0], [0.9, 1.6, 0.06]);
  // Treppe
  for (let i = 0; i < 4; i++) t.add(KASTEN(), dunkel, [1.4, 0.25 + i * 0.42, 2.3 + (3 - i) * 0.35], [0, 0, 0], [1.0, 0.1, 0.35]);
  t.in(g);
  const fenster = [[-1.2, 3.4], [-0.1, 3.4]].map(([x, y]) => {
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.38, 16), new THREE.MeshBasicMaterial({ color: "#ffc870", toneMapped: false }));
    f.position.set(x, y, 1.53); g.add(f); return f;
  });
  animationen.push((zeit) => fenster.forEach((f, i) => f.material.color.setHSL(0.1, 1, 0.55 + Math.sin(zeit * 2 + i) * 0.05)));
  g.userData.setzeLeuchten = () => {};
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function objektModell(o, animationen) {
  if (o.bild === "briefbaum") return { modell: briefbaumBauen(animationen) };
  if (o.bild === "lesepult") return { modell: lesepultBauen(animationen) };
  if (o.bild === "aushang") return { modell: aushangBauen() };
  if (o.bild === "baumhaus") return { modell: baumhausBauen(animationen) };
  if (o.bild === "steintor") return { modell: steintorBauen(animationen) };
  if (o.bild === "nebel") return nebelBauen(o, animationen);
  return null;
}

// ---------- Aufbau ----------

export function scriptoriaBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const B = raster[0].length * E, T = raster.length * E;
  const tex = texturen();
  szene.background = new THREE.Color("#04070a");
  szene.fog = new THREE.Fog("#0c1a16", 18, 70);

  // Licht: kühles Mondlicht durch das Blätterdach, schwaches Grün von unten
  szene.add(new THREE.HemisphereLight("#7a9ac8", "#1a3020", 1.7));
  szene.add(new THREE.AmbientLight("#2a3a4a", 0.6));
  const mond = new THREE.DirectionalLight("#b8d0ff", 1.8);
  mond.castShadow = qualitaet.schatten;
  mond.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(mond.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
  mond.shadow.bias = -0.0004;
  mond.shadow.normalBias = 0.03;
  szene.add(mond, mond.target);

  // Boden
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(B, T).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: textur(bodenTextur(raster)), roughness: 1 }));
  boden.position.set(B / 2, 0, T / 2);
  boden.receiveShadow = true;
  szene.add(boden);
  // Dunkler Boden rund um die Karte
  const aussen = new THREE.Mesh(new THREE.PlaneGeometry(B + 160, T + 160).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#0a140c", roughness: 1 }));
  aussen.position.set(B / 2, -0.02, T / 2);
  szene.add(aussen);

  // --- Dichter Wald: Stämme und Unterholz (instanziert) ---
  const waldKacheln = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => { if (c === "#") waldKacheln.push([tx, ty]); }));
  // auch ein Ring außerhalb der Karte
  for (let ty = -6; ty < raster.length + 6; ty++) for (let tx = -6; tx < raster[0].length + 6; tx++) {
    if (tx >= 0 && ty >= 0 && tx < raster[0].length && ty < raster.length) continue;
    waldKacheln.push([tx, ty]);
  }
  const staemme = waldKacheln.filter(([x, y]) => hash(x, y, 31) < 0.3);
  const stammGeo = new THREE.CylinderGeometry(0.75, 1, 1, 10);
  const stammMesh = new THREE.InstancedMesh(stammGeo, new THREE.MeshStandardMaterial({ color: RINDE, roughness: 0.9 }), staemme.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sk = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
  staemme.forEach(([x, y], i) => {
    const r = 0.5 + hash(x, y, 32) * 0.8, h = 26;
    p.set((x + 0.5 + (hash(x, y, 33) - 0.5) * 0.6) * E, h / 2, (y + 0.5 + (hash(x, y, 34) - 0.5) * 0.6) * E);
    m4.compose(p, q.setFromEuler(new THREE.Euler(0, hash(x, y, 35) * 6, 0)), sk.set(r, h, r));
    stammMesh.setMatrixAt(i, m4);
    stammMesh.setColorAt(i, col.set(RINDE).multiplyScalar(0.55 + hash(x, y, 36) * 0.5));
  });
  stammMesh.castShadow = true; stammMesh.receiveShadow = true;
  szene.add(stammMesh);

  const buschGeo = new THREE.IcosahedronGeometry(1, 1);
  const buschMesh = new THREE.InstancedMesh(buschGeo, new THREE.MeshStandardMaterial({ color: "#1a3220", roughness: 0.95, flatShading: true }), waldKacheln.length * 2);
  let n = 0;
  // Kein Unterholz direkt am Weg, sonst steht es der Kamera im Bild
  const amWeg = (x, y) => [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].some(([dx, dy]) => raster[y + dy]?.[x + dx] === "_");
  for (const [x, y] of waldKacheln) for (let k = 0; k < 2; k++) {
    if (amWeg(x, y)) continue;
    const s = 0.9 + hash(x, y, 40 + k) * 0.9;
    p.set((x + 0.25 + hash(x, y, 42 + k) * 0.5) * E, s * 0.45, (y + 0.25 + hash(x, y, 44 + k) * 0.5) * E);
    m4.compose(p, q.setFromEuler(new THREE.Euler(0, hash(x, y, 46 + k) * 6, 0)), sk.set(s * 1.1, s * 0.8, s * 1.1));
    buschMesh.setMatrixAt(n, m4);
    buschMesh.setColorAt(n, col.set(k ? "#16301c" : "#20402a").multiplyScalar(0.6 + hash(x, y, 48 + k) * 0.6));
    n++;
  }
  buschMesh.count = n;
  buschMesh.receiveShadow = true;
  szene.add(buschMesh);

  // --- Blätterdach ---
  const dachN = 90;
  const dach = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: LAUB, roughness: 1, flatShading: true }), dachN);
  for (let i = 0; i < dachN; i++) {
    const s = 9 + hash(i, 1, 50) * 9;
    p.set(-20 + hash(i, 2, 50) * (B + 40), 24 + hash(i, 3, 50) * 8, -20 + hash(i, 4, 50) * (T + 40));
    m4.compose(p, q.identity(), sk.set(s, s * 0.45, s));
    dach.setMatrixAt(i, m4);
    dach.setColorAt(i, col.set(i % 7 === 0 ? "#3a3a1a" : LAUB).multiplyScalar(0.7 + hash(i, 5, 50) * 0.5));
  }
  szene.add(dach);

  // --- Riesenbäume, Lesebaum, Regale, Pilze, Felsen ---
  const t = new Teile();
  bloecke(raster, "B").forEach((b, i) => riesenbaum(t, (b.x + b.w / 2) * E, (b.y + b.h / 2) * E, 1.7 + (i % 3) * 0.25, { seed: i }));
  const regalMat = new THREE.MeshStandardMaterial({ map: tex.buecher, roughness: 0.85 });
  for (const b of bloecke(raster, "R")) {
    const w = b.w * E, d = b.h * E;
    const geo = new THREE.BoxGeometry(w, 2.6, d);
    const mat = regalMat.clone(); mat.map = tex.buecher.clone(); mat.map.needsUpdate = true;
    mat.map.repeat.set(Math.max(1, Math.round(Math.max(w, d) / 2)), 1);
    const m = new THREE.Mesh(geo, mat);
    m.position.set((b.x + b.w / 2) * E, 1.3, (b.y + b.h / 2) * E);
    m.castShadow = true; m.receiveShadow = true;
    szene.add(m);
    t.add(KASTEN(), "#3a2414", [(b.x + b.w / 2) * E, 2.66, (b.y + b.h / 2) * E], [0, 0, 0], [w + 0.2, 0.12, d + 0.2]);
  }
  bloecke(raster, "P").forEach((b, i) => {
    const x = (b.x + 0.5) * E, z = (b.y + 0.5) * E;
    pilz(t, x, z, 1.6, PILZFARBEN[i % 4]);
    pilz(t, x + 0.7, z + 0.4, 0.9, PILZFARBEN[(i + 1) % 4]);
    pilz(t, x - 0.6, z + 0.5, 0.7, PILZFARBEN[(i + 2) % 4]);
  });
  for (const b of bloecke(raster, "S")) for (let k = 0; k < b.w; k++) t.add(KUGEL_K(), "#3a3c40", [(b.x + k + 0.5) * E, 1.2, (b.y + 0.2) * E], [k, k * 2, 0], [1.6, 2.6 + hash(k, 1, 60) * 1.5, 1.4]);
  // Kleine Leuchtpilze verstreut am Rand der Lichtungen
  const pilzOrte = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c !== "_") return;
    const amRand = ["#", "B", "R"].some((z) => raster[ty - 1]?.[tx] === z || raster[ty + 1]?.[tx] === z || raster[ty]?.[tx - 1] === z || raster[ty]?.[tx + 1] === z);
    if (amRand && hash(tx, ty, 70) < 0.35) pilzOrte.push([tx, ty]);
  }));
  pilzOrte.forEach(([x, y], i) => pilz(t, (x + 0.2 + hash(x, y, 71) * 0.6) * E, (y + 0.2 + hash(x, y, 72) * 0.6) * E, 0.35 + hash(x, y, 73) * 0.35, PILZFARBEN[i % 4]));

  // Der Große Lesebaum
  const [lb] = bloecke(raster, "L");
  const lx = (lb.x + lb.w / 2) * E, lz = (lb.y + lb.h / 2) * E;
  riesenbaum(t, lx, lz, 3.4, { seed: 99 });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    if (Math.abs(a - Math.PI / 2) < 0.4) continue;     // vorne (Süden) frei für Lirien
    for (const hoehe of [1.3, 4.2]) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 0.5), regalMat);
      box.position.set(lx + Math.cos(a) * 3.55, hoehe, lz + Math.sin(a) * 3.55);
      box.rotation.y = -a + Math.PI / 2;
      box.castShadow = true;
      szene.add(box);
    }
  }
  // Plattform mit Geländer
  t.add(ZYL(1, 1, 24), "#5a4030", [lx, 7.0, lz], [0, 0, 0], [5.2, 0.25, 5.2]);
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; t.add(ZYL(1, 1, 6), "#4a3020", [lx + Math.cos(a) * 5, 7.6, lz + Math.sin(a) * 5], [0, 0, 0], [0.06, 1.0, 0.06]); }
  t.add(ZYL(1, 1, 24), "#4a3020", [lx, 8.1, lz], [0, 0, 0], [5.05, 0.08, 5.05]);
  t.in(szene);

  // Laternen am Lesebaum (warmes Licht)
  const laternen = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#ffc870", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(lx + Math.cos(a) * 5.4, 6.2 + (k % 2) * 0.6, lz + Math.sin(a) * 5.4);
    s.scale.setScalar(1.4);
    szene.add(s); laternen.push(s);
  }
  const lampe = new THREE.PointLight("#ffbf70", 40, 22, 1.6);
  lampe.position.set(lx, 6, lz + 4);
  szene.add(lampe);

  // Glühwürmchen über allen Lichtungen
  const orte = [];
  for (const [x0, y0, x1, y1] of Object.values(LICHTUNGEN)) for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) orte.push([(x + 0.5) * E, (y + 0.5) * E]);
  lichtpunkteBauen(szene, orte, { farbe: "#d8ff6a", groesse: 0.22, hoehe: [0.4, 4.5], streuung: 1.8, anzahl: Math.round(260 * qualitaet.partikel) }, animationen);
  // Langsam ziehende dunkle Nebelschwaden am Waldrand
  const schwaden = [];
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.nebel, color: "#0a0814", transparent: true, opacity: 0.45, depthWrite: false }));
    const [x, y] = waldKacheln[Math.floor(hash(i, 1, 80) * waldKacheln.length)];
    s.userData = { x: x * E, z: y * E, p: i };
    s.scale.setScalar(6 + hash(i, 2, 80) * 5);
    szene.add(s); schwaden.push(s);
  }
  animationen.push((zeit) => {
    laternen.forEach((s, i) => { s.material.opacity = 0.75 + Math.sin(zeit * 3 + i * 1.3) * 0.15; });
    // Weniger Nebel, je mehr Quests gelöst sind
    const geloest = ["scriptoria_q1", "scriptoria_q2", "scriptoria_q3", "scriptoria_q4", "scriptoria_q5"].filter((k) => zustand.erledigt[k]).length;
    schwaden.forEach((s) => {
      const u = s.userData;
      s.position.set(u.x + Math.sin(zeit * 0.1 + u.p) * 3, 1.5 + Math.sin(zeit * 0.3 + u.p) * 0.5, u.z + Math.cos(zeit * 0.08 + u.p) * 3);
      s.material.opacity = 0.45 * (1 - geloest / 6);
    });
  });

  const versatz = new THREE.Vector3(-18, 50, 26);
  return {
    blockZeichen: BLOCKIERT,
    hindernis: (tx, ty) => HINDERNIS[raster[ty]?.[tx]] ?? 0,
    objektModell: (o) => objektModell(o, animationen),
    licht: (pos) => {
      mond.position.set(pos.x + versatz.x, versatz.y, pos.z + versatz.z);
      mond.target.position.set(pos.x, 0, pos.z);
    },
    kamera: { hoehe: 3.0, abstand: 6.6, maxHoehe: 9 },
  };
}
