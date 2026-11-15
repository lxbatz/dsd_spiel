// 3D: Die Feste Schattenzahn – die finale Kampagne.
// Draußen: ein Vorhof aus Asche und Fels unter blutrotem Himmel, dahinter eine schwarze Burg mit Türmen
// und ein Vulkan, der Lava speit. Ascheregen, Fledermäuse, Goblins mit Speeren, tote Bäume, ein Lagerfeuer
// der Mentoren. Drinnen geht es Ebene um Ebene tiefer hinab, beleuchtet von Fackeln und blubbernder Lava:
//   Dungeon des Hörens (Kerker mit Zellen und Ketten) → Katakomben des Lesens (Knochennischen, Kerzen, Spinnweben)
//   → Grotte der Schreiber (Tropfsteinhöhle mit Schreibpulten und Lavarinnen) → Kaverne der Stimmen (riesige Höhle mit Lavasee).

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL } from "./figuren.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { morgrathBauen } from "./morgrath.js";
import { zustand } from "../zustand.js";
import { RASTER, BLOCKIERT, EBENEN_POS, TREPPEN, GANG, hoeheBeiZeile, ebeneBeiZeile } from "../welt/schattenzahn_layout.js";

const WAND_H = { vorhof: 0, hoeren: 10, lesen: 10, schreiben: 11, sprechen: 26 };
const GX0 = GANG[0] * E, GX1 = (GANG[GANG.length - 1] + 1) * E;
const STEIN = { hoeren: ["#4a4446", "#2a2628"], lesen: ["#5a5246", "#332c24"], schreiben: ["#4a3a34", "#2a1e1a"], sprechen: ["#3a2a26", "#1e1412"], vorhof: ["#3a3436", "#1e1a1c"] };
const EISEN = "#2a2a30";

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

function felsTextur(hell, dunkel, quader) {
  const [c, g] = leinwand(128, 128);
  g.fillStyle = dunkel; g.fillRect(0, 0, 128, 128);
  if (quader) {
    for (let y = 0, r = 0; y < 128; y += 26, r++) for (let x = r % 2 ? -22 : 0; x < 128; x += 44) {
      g.fillStyle = new THREE.Color(hell).offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.08).getStyle();
      g.fillRect(x + 2, y + 2, 40, 22);
    }
  } else {
    g.fillStyle = new THREE.Color(hell).lerp(new THREE.Color(dunkel), 0.35).getStyle(); g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = new THREE.Color(hell).offsetHSL(0, 0, (hash(i, 1, 4) - 0.6) * 0.1).getStyle();
      g.globalAlpha = 0.5;
      g.beginPath(); g.ellipse(hash(i, 2, 4) * 128, hash(i, 3, 4) * 128, 4 + hash(i, 4, 4) * 9, 3 + hash(i, 5, 4) * 6, hash(i, 6, 4) * 3, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${hash(i, 7, 4) * 0.3})`; g.fillRect(hash(i, 8, 4) * 128, hash(i, 9, 4) * 128, 2, 2); }
  return c;
}

/** Boden mit glühenden Rissen (Lava schimmert durch) */
function bodenTextur(hell, dunkel, risse) {
  const c = felsTextur(hell, dunkel, false);
  const g = c.getContext("2d");
  if (risse) {
    g.strokeStyle = "rgba(255,110,30,0.6)"; g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      let x = hash(i, 1, 9) * 128, y = hash(i, 2, 9) * 128;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (hash(i, k, 10) - 0.5) * 40; y += (hash(i, k, 11) - 0.5) * 40; g.lineTo(x, y); }
      g.stroke();
    }
  }
  return c;
}

function lavaTextur() {
  // Glühende Lava, auf der dunkle Krustenschollen treiben
  const [c, g] = leinwand(256, 256);
  const v = g.createLinearGradient(0, 0, 256, 256);
  v.addColorStop(0, "#ff6a10"); v.addColorStop(0.5, "#ffb030"); v.addColorStop(1, "#ff5008");
  g.fillStyle = v; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 46; i++) {
    const x = hash(i, 2, 12) * 256, y = hash(i, 3, 12) * 256, rx = 14 + hash(i, 4, 12) * 22, ry = 10 + hash(i, 5, 12) * 16, w = hash(i, 6, 12) * 3;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      g.fillStyle = "rgba(150,40,8,0.7)";
      g.beginPath(); g.ellipse(x + dx, y + dy, rx + 3, ry + 3, w, 0, Math.PI * 2); g.fill();
      g.fillStyle = i % 3 ? "#3a0c06" : "#521408";
      g.beginPath(); g.ellipse(x + dx, y + dy, rx, ry, w, 0, Math.PI * 2); g.fill();
    }
  }
  return c;
}

function spinnwebTextur() {
  const [c, g] = leinwand(128, 128);
  g.strokeStyle = "rgba(230,230,240,0.75)"; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const a = (i / 8) * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 128, Math.sin(a) * 128); g.stroke(); }
  for (let r = 14; r < 128; r += 14) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2, rr = r * (0.92 + (i % 2) * 0.08); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); }
  return c;
}

function bannerTextur() {
  const [c, g] = leinwand(64, 128);
  g.fillStyle = "#3a0a0e"; g.fillRect(0, 0, 64, 128);
  g.fillStyle = "#14080a"; g.fillRect(4, 4, 56, 112);
  // Ein flammendes Auge
  g.fillStyle = "#ff6a1a"; g.beginPath(); g.ellipse(32, 50, 20, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#14080a"; g.beginPath(); g.ellipse(32, 50, 3, 9, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#ffb040"; g.lineWidth = 2; g.beginPath(); g.ellipse(32, 50, 22, 11, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#3a0a0e"; g.beginPath(); g.moveTo(0, 112); g.lineTo(32, 128); g.lineTo(64, 112); g.lineTo(64, 128); g.lineTo(0, 128); g.fill();
  return c;
}

let _tex = null;
function texturen() {
  if (_tex) return _tex;
  _tex = { licht: textur(lichtTextur("rgba(255,255,255,1)")), lava: textur(lavaTextur(), { wiederholen: true }), web: textur(spinnwebTextur()), banner: textur(bannerTextur()) };
  return _tex;
}

// ---------- Fallgitter ----------

function fallgitterBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  for (const s of [-1, 1]) t.add(KASTEN(), "#3a3438", [s * 2.4, 3.6, 0], [0, 0, 0], [0.9, 7.2, 1.6]);
  t.add(KASTEN(), "#3a3438", [0, 7.5, 0], [0, 0, 0], [5.8, 1.2, 1.7]);
  t.add(RING(0.16, Math.PI), "#4a4248", [0, 5.6, 0.85], [0, 0, 0], [2.0, 2.0, 1.2]);
  for (const s of [-1, 1]) t.add(KEGEL(6), "#1a1618", [s * 2.4, 7.6, 0.85], [0, 0, 0], [0.18, 0.7, 0.18]);
  // Schädel über dem Tor
  t.add(KUGEL(), "#d8d0c0", [0, 7.4, 0.9], [0, 0, 0], [0.42, 0.4, 0.38]);
  for (const s of [-1, 1]) t.add(KUGEL_K(), "#1a1214", [s * 0.15, 7.42, 1.24], [0, 0, 0], [0.1, 0.12, 0.05]);
  t.in(g);
  const gitter = new THREE.Group();
  const gt = new Teile();
  for (let i = 0; i < 7; i++) {
    const x = -1.8 + i * 0.6;
    gt.add(ZYL(1, 1, 6), EISEN, [x, 3.0, 0], [0, 0, 0], [0.07, 6.0, 0.07], { art: "glanz" });
    gt.add(KEGEL(5), EISEN, [x, -0.1, 0], [Math.PI, 0, 0], [0.09, 0.3, 0.09], { art: "glanz" });
  }
  for (let j = 0; j < 5; j++) gt.add(KASTEN(), EISEN, [0, 0.6 + j * 1.3, 0.05], [0, 0, 0], [3.9, 0.12, 0.1], { art: "glanz" });
  gt.in(gitter);
  g.add(gitter);
  let offen = 0, ziel = 0;
  const setzeOffen = (an, sofort) => { ziel = an ? 1 : 0; if (sofort) offen = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    offen += Math.sign(ziel - offen) * Math.min(Math.abs(ziel - offen), dt * 0.4);
    gitter.position.y = offen * 6.4 + (offen > 0 && offen < 1 ? Math.sin(zeit * 40) * 0.03 : 0);
  });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { modell: g, setzeOffen };
}

function objektModell(o, animationen, ankerFuer, merk) {
  if (o.bild === "fallgitter") {
    const r = fallgitterBauen(animationen);
    if (o.id === "sz_tor1") merk.tor = r.modell;
    return r;
  }
  // Der Schuttberg am ehemaligen Burgtor wird mit den übrigen Trümmern gebaut; das Objekt sperrt nur den Weg
  if (o.bild === "truemmer") return { modell: new THREE.Group() };
  if (o.bild === "morgrath") {
    const f = morgrathBauen();
    // Sein Brustlicht läuft über den Lichter-Pool der Welt (sonst wären es zu viele Lichtquellen)
    const lichter = [];
    f.gruppe.traverse((m) => { if (m.isPointLight) lichter.push(m); });
    for (const l of lichter) { ankerFuer(l.parent, l.position.clone(), l.color, l.intensity, l.distance, l.decay); l.parent.remove(l); }
    f.gruppe.userData.setzeLeuchten = (an, sofort) => (sofort ? f.sofort : f.pose)(an === true ? "gefallen" : an || "stehen");
    return { modell: f.gruppe, figur: f, boss: true, kopfY: 6.6, weit: 9, kameraY: 3.4, versatz: [0, 0.4] };
  }
  return null;
}

// ---------- Geometrie-Helfer ----------

function mergeGeos(liste) {
  let nPos = 0, nIdx = 0;
  for (const g of liste) { nPos += g.attributes.position.count; nIdx += g.index.count; }
  const pos = new Float32Array(nPos * 3), nor = new Float32Array(nPos * 3), uv = new Float32Array(nPos * 2), idx = new Uint32Array(nIdx);
  let op = 0, oi = 0;
  for (const g of liste) {
    pos.set(g.attributes.position.array, op * 3); nor.set(g.attributes.normal.array, op * 3); uv.set(g.attributes.uv.array, op * 2);
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

function boxGeo(x, y, z, w, h, d, uv = 4) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uvA = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uvA.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    uvA.setXY(i, uvA.getX(i) * (nx > 0.5 ? d : w) / uv, uvA.getY(i) * (ny > 0.5 ? d : h) / uv);
  }
  g.translate(x, y, z);
  return g;
}

// ---------- Tiere ----------

/** Fledermäuse, die in Kreisen um einen Punkt flattern */
function fledermaeuse(szene, mitte, anzahl, radius, hoehe, animationen) {
  const mat = new THREE.MeshBasicMaterial({ color: "#0c0a0e", side: THREE.DoubleSide });
  const tiere = [];
  for (let i = 0; i < anzahl; i++) {
    const g = new THREE.Group();
    const koerper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), mat);
    g.add(koerper);
    const fl = [-1, 1].map((s) => {
      const f = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.1), new THREE.Vector3(s * 0.55, 0.05, -0.2), new THREE.Vector3(s * 0.45, 0, 0.15), new THREE.Vector3(0, 0, 0.12), new THREE.Vector3(0, 0, -0.1), new THREE.Vector3(s * 0.45, 0, 0.15)]), mat);
      f.geometry.computeVertexNormals();
      g.add(f); return f;
    });
    szene.add(g);
    tiere.push({ g, fl, r: radius * (0.5 + hash(i, 1, 21) * 0.6), h: hoehe + hash(i, 2, 21) * 3, v: 0.6 + hash(i, 3, 21) * 0.6, p: hash(i, 4, 21) * 6 });
  }
  animationen.push((zeit) => {
    for (const b of tiere) {
      const a = zeit * b.v + b.p;
      b.g.position.set(mitte.x + Math.cos(a) * b.r + Math.sin(a * 2.3) * 1.2, b.h + Math.sin(zeit * 2 + b.p) * 0.8, mitte.z + Math.sin(a) * b.r * 0.7);
      b.g.rotation.y = -a;
      const f = Math.sin(zeit * 22 + b.p) * 0.9;
      b.fl[0].rotation.z = f; b.fl[1].rotation.z = -f;
    }
  });
  return tiere;
}

/** Ratten, die an Wänden entlang huschen */
function ratten(szene, wege, animationen) {
  const t = new Teile();
  t.add(KUGEL(), "#3a3230", [0, 0.12, 0], [0, 0, 0], [0.13, 0.11, 0.24]);
  t.add(KUGEL(), "#3a3230", [0, 0.14, 0.24], [0, 0, 0], [0.08, 0.07, 0.1]);
  t.add(KUGEL_K(), "#c88a8a", [0.05, 0.22, 0.22], [0, 0, 0], 0.03);
  t.add(KUGEL_K(), "#c88a8a", [-0.05, 0.22, 0.22], [0, 0, 0], 0.03);
  t.add(ZYL(0.2, 1, 5), "#a87a7a", [0, 0.08, -0.45], [Math.PI / 2, 0, 0], [0.02, 0.45, 0.02]);
  const vorlage = new THREE.Group(); t.in(vorlage);
  const tiere = wege.map(([a, b, y], i) => {
    const r = vorlage.clone(); szene.add(r);
    return { r, a, b, y, v: 1.6 + hash(i, 1, 22) * 1.2, p: hash(i, 2, 22) * 10 };
  });
  animationen.push((zeit) => {
    for (const t2 of tiere) {
      const d = t2.a.distanceTo(t2.b);
      const s = ((zeit * t2.v + t2.p) % (2 * d + 6));
      // hin, kurze Pause, zurück
      const u = s < d ? s / d : s < d + 3 ? 1 : s < 2 * d + 3 ? 1 - (s - d - 3) / d : 0;
      t2.r.position.lerpVectors(t2.a, t2.b, u);
      t2.r.position.y = t2.y;
      const hin = s < d + 3;
      t2.r.rotation.y = Math.atan2((t2.b.x - t2.a.x) * (hin ? 1 : -1), (t2.b.z - t2.a.z) * (hin ? 1 : -1));
    }
  });
}

/** Goblin: kleiner grüner Kerl mit Speer und Helm; patrouilliert zwischen zwei Punkten (oder sitzt nach dem Ende gemütlich am Boden) */
function goblinBauen(sitzend = false) {
  const g = new THREE.Group();
  const t = new Teile();
  const haut = "#5a7a3a", leder = "#4a3022";
  if (sitzend) {
    t.add(KAPSEL(), leder, [0, 0.42, -0.05], [-0.25, 0, 0], [0.28, 0.22, 0.22]);
    t.add(KUGEL(), haut, [0, 0.95, 0.08], [0, 0, 0], [0.3, 0.27, 0.28]);
    for (const s of [-1, 1]) {
      t.add(KEGEL(4), haut, [s * 0.36, 1.0, 0.05], [0, 0, -s * 1.35], [0.08, 0.36, 0.05]);           // Ohren hängen entspannt
      t.add(KUGEL_K(), "#ffd23a", [s * 0.1, 0.97, 0.33], [0, 0, 0], 0.045, { art: "leucht" });
      t.add(KAPSEL(), haut, [s * 0.13, 0.14, 0.28], [Math.PI / 2, 0, 0], [0.08, 0.17, 0.08]);        // Beine nach vorn
      t.add(KAPSEL(), haut, [s * 0.3, 0.38, 0.12], [0.9, 0, s * 0.2], [0.07, 0.18, 0.07]);          // Arme auf den Knien
    }
    t.add(KEGEL(4), haut, [0, 0.9, 0.37], [Math.PI / 2, 0, 0], [0.06, 0.18, 0.06]);
    t.add(KUGEL(), "#5a5a62", [-0.42, 0.12, -0.25], [0.4, 0, 1.2], [0.31, 0.15, 0.3], { art: "glanz" });  // Helm liegt daneben
    t.add(ZYL(1, 1, 6), leder, [0.55, 0.04, 0], [Math.PI / 2, 0.3, 0], [0.03, 2.0, 0.03]);               // Speer liegt am Boden
    t.add(KEGEL(4), "#8a8a92", [0.86, 0.04, 1.05], [Math.PI / 2, 0.3, 0], [0.06, 0.3, 0.04], { art: "glanz" });
    t.in(g);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    return g;
  }
  t.add(KAPSEL(), leder, [0, 0.75, 0], [0, 0, 0], [0.28, 0.22, 0.22]);
  t.add(KUGEL(), haut, [0, 1.3, 0.05], [0, 0, 0], [0.3, 0.27, 0.28]);
  for (const s of [-1, 1]) {
    t.add(KEGEL(4), haut, [s * 0.36, 1.36, 0], [0, 0, -s * 1.2], [0.08, 0.36, 0.05]);              // spitze Ohren
    t.add(KUGEL_K(), "#ffd23a", [s * 0.1, 1.33, 0.3], [0, 0, 0], 0.045, { art: "leucht" });        // gelbe Augen
    t.add(KAPSEL(), haut, [s * 0.12, 0.28, 0], [0, 0, 0], [0.08, 0.16, 0.08]);                    // Beine
    t.add(KAPSEL(), haut, [s * 0.32, 0.75, 0.05], [0, 0, s * 0.3], [0.07, 0.18, 0.07]);           // Arme
  }
  t.add(KEGEL(4), haut, [0, 1.25, 0.34], [Math.PI / 2, 0, 0], [0.06, 0.18, 0.06]);                 // Nase
  t.add(KUGEL(), "#5a5a62", [0, 1.48, 0], [0, 0, 0], [0.31, 0.15, 0.3], { art: "glanz" });          // Helm
  t.add(KEGEL(5), "#5a5a62", [0, 1.7, 0], [0, 0, 0], [0.06, 0.3, 0.06], { art: "glanz" });
  t.add(ZYL(1, 1, 6), leder, [0.38, 1.0, 0.1], [0, 0, 0], [0.03, 2.0, 0.03]);                       // Speer
  t.add(KEGEL(4), "#8a8a92", [0.38, 2.1, 0.1], [0, 0, 0], [0.06, 0.3, 0.04], { art: "glanz" });
  t.in(g);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

// ---------- Aufbau ----------

export function festeBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const tex = texturen();
  const B = raster[0].length * E, T = raster.length * E;
  const V = EBENEN_POS[0], K = EBENEN_POS[4];
  szene.background = new THREE.Color("#2a0c0a");
  szene.fog = new THREE.Fog("#4a160c", 120, 1100);

  const hemi = new THREE.HemisphereLight("#e8906a", "#2a0a06", 1.2);
  szene.add(hemi);
  const sonne = new THREE.DirectionalLight("#ff9a6a", 1.6);
  sonne.castShadow = qualitaet.schatten;
  sonne.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(sonne.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
  sonne.shadow.bias = -0.0005; sonne.shadow.normalBias = 0.04;
  szene.add(sonne, sonne.target);

  // Lichter-Pool: viele Lichtpunkte, aber nur LICHTER echte Lichtquellen, die zu den nächsten Punkten wandern
  const LICHTER = 4;
  const anker = [];
  const lichtPunkt = (farbe, staerke, weite, abfall, x, y, z) => { const a = { pos: new THREE.Vector3(x, y, z), farbe: new THREE.Color(farbe), staerke, weite, abfall }; anker.push(a); return a; };
  const ankerFuer = (obj, versatz, farbe, staerke, weite, abfall) => anker.push({ obj, versatz, pos: new THREE.Vector3(), farbe: new THREE.Color(farbe), staerke, weite, abfall });
  const pool = Array.from({ length: LICHTER }, () => { const l = new THREE.PointLight("#ff8040", 0, 10, 1.3); szene.add(l); return l; });
  const sichtbarIn = (o) => { while (o) { if (!o.visible) return false; if (o === szene) return true; o = o.parent; } return false; };
  const lichterVerteilen = (pos) => {
    const liste = [];
    for (const a of anker) {
      if (a.obj) { if (!sichtbarIn(a.obj)) continue; a.pos.copy(a.versatz); a.obj.localToWorld(a.pos); }
      liste.push([a.pos.distanceTo(pos) - a.weite * 0.4, a]);
    }
    liste.sort((x, y) => x[0] - y[0]);
    pool.forEach((l, i) => {
      const a = liste[i]?.[1];
      if (!a) { l.intensity = 0; return; }
      l.position.copy(a.pos); l.color.copy(a.farbe); l.intensity = a.staerke; l.distance = a.weite; l.decay = a.abfall;
    });
  };

  const kachelH = (tx, ty) => hoeheBeiZeile(ty + 0.5);
  const ebeneId = (ty) => EBENEN_POS[Math.max(0, Math.min(4, ebeneBeiZeile(ty)))].id;

  // --- Böden (zeilenweise, damit der Lavasee frei bleibt; UV in Weltkoordinaten) ---
  let vorhofBoden = null;   // nach dem Ende verschwinden die glühenden Risse im Vorhof
  for (const e of EBENEN_POS) {
    const [hell, dunkel] = STEIN[e.id];
    const t = textur(bodenTextur(hell, dunkel, e.id !== "lesen"), { wiederholen: true });
    const liste = [];
    for (let ty = e.y0; ty <= e.y1; ty++) {
      const zeile = raster[ty];
      for (let tx = 0; tx < zeile.length; tx++) {
        if (zeile[tx] === "#" || zeile[tx] === "~") continue;
        let ende = tx;
        while (ende + 1 < zeile.length && zeile[ende + 1] !== "#" && zeile[ende + 1] !== "~") ende++;
        const g = new THREE.BoxGeometry((ende - tx + 1) * E, 0.6, E);
        g.translate((tx + ende + 1) / 2 * E, e.h - 0.3, (ty + 0.5) * E);
        const pa = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getX(i) / 4, -pa.getZ(i) / 4);
        liste.push(g);
        tx = ende;
      }
    }
    const m = new THREE.Mesh(mergeGeos(liste), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
    m.receiveShadow = true;
    szene.add(m);
    if (e.id === "vorhof") vorhofBoden = { mat: m.material, glut: t, tag: null, bauen: () => textur(bodenTextur(hell, dunkel, false), { wiederholen: true }) };
  }
  // Ascheboden rund um den Vorhof (hinter den Klippen)
  // (nur südlich der Burgmauer auf Höhe 0; dahinter liegt das Land höher, damit es die Dungeons darunter nicht schneidet)
  const ascheMat = new THREE.MeshStandardMaterial({ color: "#1a1412", roughness: 1 });
  const mauerZ = (V.y0 - 1) * E;
  const aussen = new THREE.Mesh(new THREE.PlaneGeometry(B + 400, 200).rotateX(-Math.PI / 2), ascheMat);
  aussen.position.set(B / 2, -0.05, mauerZ - 2 + 100);
  const hinterland = new THREE.Mesh(new THREE.PlaneGeometry(B + 400, 400).rotateX(-Math.PI / 2), ascheMat);
  hinterland.position.set(B / 2, 11, mauerZ - 4 - 200);
  szene.add(aussen, hinterland);

  // --- Mauern und Decken der Dungeons, Klippen im Vorhof ---
  const wandMat = {};
  for (const [id, [hell, dunkel]] of Object.entries(STEIN)) {
    wandMat[id] = new THREE.MeshStandardMaterial({ map: textur(felsTextur(hell, dunkel, id === "hoeren" || id === "lesen"), { wiederholen: true }), roughness: 0.95 });
  }
  const geos = {};
  const klippen = new Teile();
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c !== "#") return;
    let lo = Infinity, hi = -Infinity, nachbar = null;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const n = raster[ty + dy]?.[tx + dx];
      if (!n || n === "#") continue;
      const h = kachelH(tx + dx, ty + dy);
      lo = Math.min(lo, h); hi = Math.max(hi, h);
      nachbar = ebeneId(ty + dy);
    }
    if (lo === Infinity) return;
    lo = Math.min(lo, hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    hi = Math.max(hi, hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    const id = nachbar ?? ebeneId(ty);
    if (id === "vorhof" && ty > V.y0 - 1) {
      // Draußen: zackige Felsen statt Mauern
      const s = 2.5 + hash(tx, ty, 30) * 4;
      klippen.add(KEGEL(6), hash(tx, ty, 31) > 0.5 ? "#3a3236" : "#2a2426", [(tx + 0.5) * E, s / 2 - 0.3, (ty + 0.5) * E], [hash(tx, ty, 32) * 0.3, hash(tx, ty, 33) * 6, 0], [1.4, s + 2, 1.4]);
      return;
    }
    const oben = hi + (WAND_H[id] || 10) + 0.5;
    (geos[id] ??= []).push(boxGeo((tx + 0.5) * E, (lo - 0.8 + oben) / 2, (ty + 0.5) * E, E, oben - lo + 0.8, E));
  }));
  // Decken (Kaverne hat eine hohe, zerklüftete Decke)
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c === "#") return;
    const id = ebeneId(ty);
    if (id === "vorhof" && ty > V.y0 - 1) return;
    const h = Math.max(hoeheBeiZeile(ty), hoeheBeiZeile(ty + 1));
    (geos[id] ??= []).push(boxGeo((tx + 0.5) * E, h + (WAND_H[id] || 10) + 0.25, (ty + 0.5) * E, E, 0.5, E));
  }));
  const wandMeshes = {};
  for (const [id, liste] of Object.entries(geos)) {
    const m = new THREE.Mesh(mergeGeos(liste), wandMat[id]);
    m.receiveShadow = true;
    szene.add(m);
    wandMeshes[id] = m;
  }
  klippen.in(szene);

  // --- Treppenstufen ---
  const stufen = new Teile();
  for (let i = 1; i < TREPPEN.length; i++) {
    const tr = TREPPEN[i];
    const z0 = tr.y0 * E, z1 = (tr.y1 + 1) * E, n = (tr.y1 - tr.y0 + 1) * 2;
    for (let k = 0; k < n; k++) {
      const za = z0 + (k / n) * (z1 - z0), zb = z0 + ((k + 1) / n) * (z1 - z0);
      const hTop = hoeheBeiZeile((za + zb) / 2 / E) + 0.1;
      stufen.add(KASTEN(), STEIN[EBENEN_POS[i].id][0], [(GX0 + GX1) / 2, (hTop + tr.unten - 0.8) / 2, (za + zb) / 2], [0, 0, 0], [GX1 - GX0, hTop - tr.unten + 0.8, zb - za + 0.02]);
    }
    // Boden unter dem Fallgitter (oben an der Treppe)
    const ta = (tr.y1 + 1) * E, tb = (tr.y1 + 2) * E;
    stufen.add(KASTEN(), STEIN[EBENEN_POS[i - 1].id][0], [(GX0 + GX1) / 2, (tr.oben + tr.unten - 0.8) / 2, (ta + tb) / 2], [0, 0, 0], [GX1 - GX0, tr.oben - tr.unten + 0.8, tb - ta + 0.04]);
  }
  const stufenG = new THREE.Group();
  szene.add(stufenG);
  stufen.in(stufenG);

  // --- Fackeln (an den Seitenwänden jeder Ebene) und Lavalicht ---
  const flammen = [];
  const flamme = (x, y, z, g = 0.9, f = "#ff8a30", eltern = szene) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: f, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(x, y, z); s.scale.setScalar(g); eltern.add(s); flammen.push(s);
  };
  const deko = new Teile();
  const fackel = (x, y, z, s) => {
    deko.add(ZYL(1, 0.6, 6), "#3a2a1e", [x, y, z], [0, 0, s * 0.35], [0.09, 0.7, 0.09]);
    deko.add(KASTEN(), EISEN, [x - s * 0.12, y - 0.25, z], [0, 0, 0], [0.25, 0.08, 0.25], { art: "glanz" });
    flamme(x + s * 0.12, y + 0.5, z, 1.0);
  };
  for (const e of EBENEN_POS.slice(1)) {
    const za = e.y0 * E, zb = (e.y1 + 1) * E, xa = e.x0 * E, xb = (e.x1 + 1) * E, h = e.h;
    const n = e.id === "sprechen" ? 4 : 3;
    for (let k = 0; k < n; k++) {
      const z = za + (k + 0.5) * (zb - za) / n;
      fackel(xa + 0.3, h + 3.2, z, 1); fackel(xb - 0.3, h + 3.2, z, -1);
    }
    lichtPunkt(e.id === "sprechen" ? "#ff6a20" : "#ff9040", e.id === "sprechen" ? 60 : 30, e.id === "sprechen" ? 50 : 26, 1.3, (xa + xb) / 2, h + (e.id === "sprechen" ? 6 : 5), (za + zb) / 2);
  }

  // --- Dungeon des Hörens: Kerkerzellen mit Gittern und Ketten ---
  const hoeren = EBENEN_POS[1];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c !== "Z") return;
    const x = (tx + 0.5) * E, z = (ty + 0.5) * E, h = kachelH(tx, ty);
    // Gitter an den offenen Seiten der Zelle (zum Gang hin)
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = raster[ty + dz]?.[tx + dx];
      if (n !== "_") continue;
      for (let k = 0; k < 5; k++) {
        const o = -0.8 + k * 0.4;
        deko.add(ZYL(1, 1, 5), EISEN, [x + dx * 0.95 + (dz ? o : 0), h + 2.2, z + dz * 0.95 + (dx ? o : 0)], [0, 0, 0], [0.05, 4.4, 0.05], { art: "glanz" });
      }
      deko.add(KASTEN(), EISEN, [x + dx * 0.95, h + 4.3, z + dz * 0.95], [0, 0, 0], [dz ? 2 : 0.1, 0.12, dx ? 2 : 0.1], { art: "glanz" });
    }
    if (hash(tx, ty, 40) > 0.6) {
      // Stroh, ein Eimer, Ketten an der Wand
      deko.add(KASTEN(), "#8a7a4a", [x, h + 0.05, z], [0, hash(tx, ty, 41), 0], [1.2, 0.1, 0.8], { art: "stoff" });
      for (let k = 0; k < 5; k++) deko.add(RING(0.3), EISEN, [x, h + 3 - k * 0.22, z], [k % 2 ? Math.PI / 2 : 0, 0, 0], [0.1, 0.13, 0.1], { art: "glanz" });
    }
  }));
  // Ketten hängen von der Decke des Kerkers
  for (let k = 0; k < 6; k++) {
    const x = (hoeren.x0 + 5 + k * 2.2) * E, z = (hoeren.y0 + 2 + (k % 3) * 2.5) * E;
    for (let j = 0; j < 9; j++) deko.add(RING(0.3), EISEN, [x, hoeren.h + 9.5 - j * 0.26, z], [j % 2 ? Math.PI / 2 : 0, k, 0], [0.12, 0.16, 0.12], { art: "glanz" });
    deko.add(KEGEL(4), EISEN, [x, hoeren.h + 7.0, z], [Math.PI, 0, 0], [0.12, 0.3, 0.12], { art: "glanz" });
  }

  // --- Katakomben: Knochennischen, Schädel, Kerzen ---
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    const x = (tx + 0.5) * E, z = (ty + 0.5) * E, h = kachelH(tx, ty);
    if (c === "N") {
      deko.add(KASTEN(), "#2a241c", [x, h + 2.5, z], [0, 0, 0], [1.6, 5, 1.9]);
      const s = raster[ty][tx + 1] === "_" ? 1 : -1;
      for (let r = 0; r < 3; r++) {
        deko.add(KASTEN(), "#120e0a", [x + s * 0.6, h + 0.9 + r * 1.4, z], [0, 0, 0], [0.5, 1.0, 1.5]);
        for (let k = 0; k < 3; k++) {
          deko.add(KUGEL(), "#d8d0bc", [x + s * 0.7, h + 0.72 + r * 1.4, z - 0.45 + k * 0.45], [0, s * 0.5, 0], [0.18, 0.2, 0.2]);
          deko.add(KUGEL_K(), "#1a1410", [x + s * 0.86, h + 0.75 + r * 1.4, z - 0.5 + k * 0.45], [0, 0, 0], [0.04, 0.05, 0.04]);
          deko.add(KUGEL_K(), "#1a1410", [x + s * 0.86, h + 0.75 + r * 1.4, z - 0.4 + k * 0.45], [0, 0, 0], [0.04, 0.05, 0.04]);
        }
      }
      if (hash(tx, ty, 50) > 0.5) { deko.add(ZYL(1, 1, 8), "#efe6d0", [x + s * 0.9, h + 1.65, z], [0, 0, 0], [0.05, 0.3, 0.05]); flamme(x + s * 0.9, h + 1.9, z, 0.35, "#ffd080"); }
    }
    if (c === "K") {
      const draussen = ebeneId(ty) === "vorhof";
      deko.add(KASTEN(), draussen ? "#4a3222" : "#3a2a1e", [x, h + 0.5, z], [0, hash(tx, ty, 60), 0], [1.6, 1.0, 1.6]);
      deko.add(ZYL(0.9, 0.9, 10), "#3a2618", [x + 0.3, h + 1.5, z - 0.2], [0, 0, 0], [0.5, 1.0, 0.5]);
      deko.add(RING(0.1), EISEN, [x + 0.3, h + 1.5, z - 0.2], [Math.PI / 2, 0, 0], [0.52, 0.52, 0.6], { art: "glanz" });
    }
    if (c === "P") {
      // Schreibpult der gefangenen Schreiber mit Kerze und Pergament
      deko.add(KASTEN(), "#3a2618", [x, h + 0.9, z], [-0.3, 0, 0], [1.6, 0.12, 1.0]);
      for (const sx of [-0.65, 0.65]) deko.add(KASTEN(), "#2a1a10", [x + sx, h + 0.45, z], [0, 0, 0], [0.12, 0.9, 0.8]);
      deko.add(KASTEN(), "#e8dcc0", [x - 0.2, h + 0.98, z + 0.05], [-0.3, 0.1, 0], [0.7, 0.02, 0.5]);
      deko.add(KASTEN(), "#1a1410", [x - 0.2, h + 1.0, z + 0.05], [-0.3, 0.1, 0], [0.5, 0.025, 0.04]);
      deko.add(ZYL(1, 1, 8), "#efe6d0", [x + 0.55, h + 1.15, z - 0.15], [0, 0, 0], [0.05, 0.35, 0.05]);
      flamme(x + 0.55, h + 1.42, z - 0.15, 0.35, "#ffd080");
      for (let k = 0; k < 4; k++) deko.add(RING(0.3), EISEN, [x, h + 0.2, z + 0.7 + k * 0.15], [Math.PI / 2, 0, 0], [0.1, 0.1, 0.1], { art: "glanz" });   // Fußfessel
    }
    if (c === "S") {
      const draussen = ebeneId(ty) === "vorhof";
      if (draussen) {
        // Toter Baum
        deko.add(ZYL(0.6, 1, 6), "#2a2220", [x, h + 1.6, z], [0, 0, 0.08], [0.25, 3.2, 0.25]);
        for (let k = 0; k < 4; k++) deko.add(ZYL(0.3, 1, 5), "#2a2220", [x + Math.cos(k * 1.7) * 0.6, h + 2.8 + k * 0.3, z + Math.sin(k * 1.7) * 0.6], [Math.sin(k * 1.7) * 0.9, 0, -Math.cos(k * 1.7) * 0.9], [0.08, 1.4, 0.08]);
      } else {
        deko.add(KEGEL(7), STEIN[ebeneId(ty)][0], [x, h + 1.4, z], [0, hash(tx, ty, 70), 0], [0.8, 2.8, 0.8]);
        deko.add(KEGEL(7), STEIN[ebeneId(ty)][1], [x + 0.6, h + 0.7, z + 0.3], [0, 0, 0], [0.4, 1.4, 0.4]);
      }
    }
    if (c === "F") {
      // Lagerfeuer der Mentoren (eine 2×2-Fläche, nur einmal bauen)
      if (raster[ty][tx - 1] === "F" || raster[ty - 1]?.[tx] === "F") return;
      const fx = (tx + 1) * E, fz = (ty + 1) * E;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; deko.add(KUGEL_K(), "#4a4448", [fx + Math.cos(a) * 1.0, 0.18, fz + Math.sin(a) * 1.0], [k, k, 0], [0.3, 0.22, 0.26]); }
      for (let k = 0; k < 3; k++) deko.add(ZYL(1, 1, 6), "#3a2618", [fx, 0.2, fz], [0, (k / 3) * Math.PI, Math.PI / 2], [0.1, 1.3, 0.1]);
      for (let k = 0; k < 5; k++) flamme(fx + Math.sin(k * 2) * 0.2, 0.6 + k * 0.25, fz + Math.cos(k * 2) * 0.2, 1.3 - k * 0.15, k % 2 ? "#ffb040" : "#ff6a20");
      lichtPunkt("#ff8a3a", 30, 18, 1.4, fx, 1.5, fz);
    }
  }));
  // Stalaktiten in Grotte und Kaverne
  for (const e of [EBENEN_POS[3], K]) {
    const decke = e.h + WAND_H[e.id];
    for (let i = 0; i < (e.id === "sprechen" ? 40 : 18); i++) {
      const x = (e.x0 + hash(i, 1, 80) * (e.x1 - e.x0 + 1)) * E, z = (e.y0 + hash(i, 2, 80) * (e.y1 - e.y0 + 1)) * E;
      const l = (e.id === "sprechen" ? 3 : 1.4) + hash(i, 3, 80) * (e.id === "sprechen" ? 6 : 2);
      deko.add(KEGEL(6), STEIN[e.id][1], [x, decke - l / 2, z], [Math.PI, 0, 0], [0.4 + l * 0.08, l, 0.4 + l * 0.08]);
    }
  }
  // Leuchtende Kristalle in der Grotte
  const grotte = EBENEN_POS[3];
  for (let i = 0; i < 10; i++) {
    const x = (grotte.x0 + 0.6 + (i % 2) * (grotte.x1 - grotte.x0 - 0.2)) * E, z = (grotte.y0 + 1 + (i >> 1) * 2) * E;
    deko.add(KEGEL(5), i % 3 ? "#ff7a3a" : "#ffb060", [x, grotte.h + 0.5, z], [(i % 2 ? -1 : 1) * 0.4, i, 0], [0.18, 1.0, 0.18], { art: "leucht" });
  }
  deko.in(szene);

  // --- Spinnweben in den Ecken (Kerker und Katakomben) ---
  const webMat = new THREE.MeshBasicMaterial({ map: tex.web, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  for (const e of [EBENEN_POS[1], EBENEN_POS[2]]) {
    const decke = e.h + WAND_H[e.id];
    for (const [x, z, ry] of [[e.x0 * E, e.y0 * E, 0], [(e.x1 + 1) * E, e.y0 * E, -Math.PI / 2], [e.x0 * E, (e.y1 + 1) * E, Math.PI / 2], [(e.x1 + 1) * E, (e.y1 + 1) * E, Math.PI]]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), webMat);
      w.position.set(x + (ry === 0 || ry === Math.PI / 2 ? 1.2 : -1.2), decke - 1.2, z + (ry === 0 || ry === -Math.PI / 2 ? 1.2 : -1.2));
      w.rotation.set(0, ry + Math.PI / 4, Math.PI);
      szene.add(w);
    }
  }

  // --- Lava: See in der Kaverne, Rinnen entlang der Wände in Kerker, Grotte und Kaverne ---
  const lavaMat = new THREE.MeshBasicMaterial({ map: tex.lava, toneMapped: false });
  tex.lava.repeat.set(4, 4);
  const lava = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (c !== "~") return;
    lava.push([tx, ty]);
  }));
  const seeTiefe = 7 * E, seeBreite = (K.x1 - K.x0 + 1) * E;
  const lavaTex = tex.lava.clone(); lavaTex.needsUpdate = true;
  lavaTex.repeat.set(seeBreite / 18, seeTiefe / 18);
  const see = new THREE.Mesh(new THREE.PlaneGeometry(seeBreite, seeTiefe).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: lavaTex, toneMapped: false }));
  see.position.set(K.x0 * E + seeBreite / 2, K.h - 0.45, K.y0 * E + seeTiefe / 2);
  szene.add(see);
  const seeLicht = lichtPunkt("#ff6a1a", 50, 40, 1.2, K.x0 * E + seeBreite / 2, K.h + 3, K.y0 * E + 4);
  // Lavarinnen (leuchtende Bänder am Wandfuß)
  const rinneMat = new THREE.MeshBasicMaterial({ map: tex.lava, toneMapped: false });
  for (const e of [EBENEN_POS[3], K]) {
    const za = e.y0 * E, zb = (e.y1 + 1) * E;
    for (const x of [e.x0 * E + 0.35, (e.x1 + 1) * E - 0.35]) {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(0.6, zb - za).rotateX(-Math.PI / 2), rinneMat);
      r.position.set(x, e.h + 0.02, (za + zb) / 2);
      szene.add(r);
    }
    // Lavafall an der Rückwand
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.4, WAND_H[e.id]), rinneMat);
    fall.position.set(e.x0 * E + 3, e.h + WAND_H[e.id] / 2, za + 0.05);
    szene.add(fall);
  }
  // Blubbernde Blasen und Glutfunken über der Lava
  const blasen = [];
  for (let i = 0; i < 40; i++) {
    const [tx, ty] = lava[Math.floor(hash(i, 1, 90) * lava.length)] ?? [20, 3];
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: i % 3 ? "#ff7a20" : "#ffd060", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.userData = { x: (tx + hash(i, 2, 90)) * E, z: (ty + hash(i, 3, 90)) * E, v: 0.4 + hash(i, 4, 90) * 0.8, p: hash(i, 5, 90) };
    szene.add(s); blasen.push(s);
  }

  // --- Vorhof: die schwarze Burg, der Vulkan, Banner, Feuerschalen ---
  const wandZ = (V.y0 - 1) * E, mitteX = (GX0 + GX1) / 2;
  const MAUER = "#4a4048", DUNKEL = "#2a2228";
  // Die Burg besteht aus Teilen, die beim Einsturz einzeln versinken und kippen (Drehpunkt am Fuß des Teils)
  const teile = {};
  const teil = (name, bx, bz, tiefe, boden = 1) => {
    if (!teile[name]) {
      const aussen = new THREE.Group(); aussen.position.set(bx, 0, bz);
      const innen = new THREE.Group(); innen.position.set(-bx, 0, -bz);
      aussen.add(innen); szene.add(aussen);
      teile[name] = { aussen, innen, t: new Teile(), bx, bz, tiefe, boden };
    }
    return teile[name].t;
  };
  const mauer = teil("mauer", mitteX, wandZ - 2, 16), torhaus = teil("torhaus", mitteX, wandZ, 22);
  // Ringmauer mit einer Lücke für das Burgtor (der Gang hinab bleibt frei)
  const links = GX0 - 0.3 - (mitteX - 35), rechts = mitteX + 35 - GX1 - 0.3;
  mauer.add(KASTEN(), MAUER, [mitteX - 35 + links / 2, 6.5, wandZ - 2], [0, 0, 0], [links, 13, 4], { verlauf: 0.5 });
  mauer.add(KASTEN(), MAUER, [GX1 + 0.3 + rechts / 2, 6.5, wandZ - 2], [0, 0, 0], [rechts, 13, 4], { verlauf: 0.5 });
  mauer.add(KASTEN(), MAUER, [mitteX, 10.25, wandZ - 2], [0, 0, 0], [GX1 - GX0 + 1, 5.5, 4]);                 // Sturz über dem Tor
  for (let i = 0; i < 24; i++) mauer.add(KASTEN(), MAUER, [mitteX - 34 + i * 3, 13.8, wandZ - 0.6], [0, 0, 0], [1.6, 1.6, 1.2]);    // Zinnen
  // Torhaus: zwei vorspringende Türme mit Schießscharten, darüber ein gezackter Bogen
  for (const s of [-1, 1]) {
    torhaus.add(KASTEN(), DUNKEL, [mitteX + s * 3.8, 8.5, wandZ + 0.2], [0, 0, 0], [3.2, 17, 3.2], { verlauf: 0.5 });
    for (let k = 0; k < 3; k++) torhaus.add(KEGEL(4), DUNKEL, [mitteX + s * 3.8 + (k - 1) * 1.0, 18.2, wandZ + 0.2], [0, Math.PI / 4, 0], [0.5, 2.6 + (k === 1) * 1.6, 0.5]);
    for (let k = 0; k < 3; k++) torhaus.add(KASTEN(), "#ff6a1a", [mitteX + s * 3.8, 7 + k * 3.5, wandZ + 1.82], [0, 0, 0], [0.25, 1.4, 0.05], { art: "leucht" });
  }
  for (let k = 0; k < 7; k++) torhaus.add(KEGEL(4), DUNKEL, [mitteX - 2.1 + k * 0.7, 8.3 - Math.sin((k / 6) * Math.PI) * 0.8, wandZ + 0.1], [Math.PI, 0, 0], [0.18, 1.0, 0.18]);   // Zähne des Tors
  for (const s of [-1, 1]) {
    // Flankentürme mit Dornendächern
    const fl = teil(`flanke${s}`, mitteX + s * 9, wandZ - 1, 38);
    fl.add(ZYL(0.9, 1, 12), "#3a3238", [mitteX + s * 9, 13, wandZ - 1], [0, 0, 0], [3.4, 26, 3.4]);
    fl.add(KEGEL(8), "#140e10", [mitteX + s * 9, 30, wandZ - 1], [0, 0, 0], [4.2, 8, 4.2]);
    for (let k = 0; k < 6; k++) fl.add(KEGEL(4), "#140e10", [mitteX + s * 9 + Math.cos(k) * 3.6, 26.5, wandZ - 1 + Math.sin(k) * 3.6], [Math.sin(k) * 0.5, 0, -Math.cos(k) * 0.5], [0.3, 2.5, 0.3]);
    const tu = teil(`turm${s}`, mitteX + s * 26, wandZ - 1, 32);
    tu.add(ZYL(0.9, 1, 12), "#3a3238", [mitteX + s * 26, 11, wandZ - 1], [0, 0, 0], [3, 22, 3]);
    tu.add(KEGEL(8), "#140e10", [mitteX + s * 26, 25, wandZ - 1], [0, 0, 0], [3.6, 7, 3.6]);
  }
  // Der Bergfried: ein riesiger, schwarzer Turm mit gezackter Krone (er erinnert an Morgraths Helm)
  const bf = teil("bergfried", mitteX - 12, wandZ - 26, 72, 11);
  bf.add(ZYL(0.8, 1, 10), "#2a2228", [mitteX - 12, 26, wandZ - 26], [0, 0, 0], [9, 52, 9]);
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; bf.add(KEGEL(4), "#140e10", [mitteX - 12 + Math.cos(a) * 6, 56 + (k % 2) * 3, wandZ - 26 + Math.sin(a) * 6], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3], [0.9, 9 + (k % 3) * 4, 0.9]); }
  for (const tl of Object.values(teile)) tl.t.in(tl.innen);
  // Die Innenwand am Tor gehört zur Mauer
  if (wandMeshes.vorhof) teile.mauer.innen.add(wandMeshes.vorhof);
  // Der Vulkan
  const VX = mitteX + 40, VZ = wandZ - 520, VR = 260, VH = 250, VB = -10;
  const vulkan = new Teile();
  vulkan.add(KEGEL(14), "#1a1210", [VX, VB + VH / 2, VZ], [0, 0, 0], [VR, VH, VR], { verlauf: 0.6 });
  vulkan.in(szene);
  // Himmel: oben fast schwarz, am Horizont glühend rot (vom Vulkan)
  let himmel;
  {
    const geo = new THREE.SphereGeometry(800, 32, 16);
    const farben = [], oben = new THREE.Color("#0e0408"), mitte = new THREE.Color("#4a120c"), unten = new THREE.Color("#c8441a");
    const p = geo.attributes.position, c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 800, z = -p.getZ(i) / 800;
      const u = Math.max(0, y);
      c.copy(unten).lerp(mitte, Math.min(1, u * 4)).lerp(oben, Math.max(0, (u - 0.25) * 1.6));
      c.lerp(new THREE.Color("#ff7a2a"), Math.max(0, 1 - u * 5) * Math.max(0, z) * 0.6);    // heller hinter dem Vulkan (Norden)
      farben.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(farben, 3));
    himmel = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    himmel.position.set(mitteX, 0, wandZ);
    himmel.renderOrder = -1;
    szene.add(himmel);
  }
  // Glühende Fenster im Bergfried
  const fensterMat = new THREE.MeshBasicMaterial({ color: "#ff5a1a", toneMapped: false });
  for (let k = 0; k < 10; k++) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.2), fensterMat);
    const a = -0.6 + (k % 4) * 0.4;
    f.position.set(mitteX - 12 + Math.sin(a) * 6.9, 22 + Math.floor(k / 4) * 9, wandZ - 26 + Math.cos(a) * 6.9);
    f.rotation.y = a;
    teile.bergfried.innen.add(f);
  }
  // Lavaströme am Vulkan und Glut im Krater
  const stromTex = tex.lava.clone(); stromTex.needsUpdate = true; stromTex.repeat.set(0.25, 3);
  const stromMat = new THREE.MeshBasicMaterial({ map: stromTex, toneMapped: false, fog: false, transparent: true, opacity: 0.9 });
  const steigung = Math.atan(VR / VH), flanke = Math.hypot(VR, VH);
  for (let k = 0; k < 4; k++) {
    const a = [-0.55, -0.12, 0.2, 0.62][k], l = flanke * [0.42, 0.3, 0.5, 0.26][k];
    const strom = new THREE.Mesh(new THREE.PlaneGeometry([5, 4, 6, 3.5][k], l), stromMat);
    const r = VR * (l / flanke) / 2 + 1.5;
    strom.position.set(VX + Math.sin(a) * r, VB + VH - (l / flanke) * VH / 2, VZ + Math.cos(a) * r);
    strom.rotation.set(-steigung, a, 0, "YXZ");
    szene.add(strom);
  }
  const krater = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#ff6a20", transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  krater.position.set(VX, VB + VH + 6, VZ); krater.scale.set(110, 55, 1);
  szene.add(krater);
  // Rauchsäule über dem Vulkan
  const rauch = [];
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#1a0e0c", transparent: true, opacity: 0.7, depthWrite: false }));
    s.userData = { p: i / 18 };
    szene.add(s); rauch.push(s);
  }
  // Banner an der Mauer und Feuerschalen am Tor
  for (const s of [-1, 1]) for (const x of [4.5, 15]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 6), new THREE.MeshStandardMaterial({ map: tex.banner, side: THREE.DoubleSide, roughness: 1 }));
    b.position.set(mitteX + s * x, 7.5, wandZ + 0.05);
    teile.mauer.innen.add(b);
  }
  const schalen = new Teile();
  for (const s of [-1, 1]) {
    const x = mitteX + s * 4.2, z = wandZ + 2.2;
    schalen.add(ZYL(0.5, 0.8, 8), EISEN, [x, 1.0, z], [0, 0, 0], [0.25, 2.0, 0.25], { art: "glanz" });
    schalen.add(ZYL(1, 0.5, 10), EISEN, [x, 2.2, z], [0, 0, 0], [0.7, 0.45, 0.7], { art: "glanz" });
    for (let k = 0; k < 4; k++) flamme(x + Math.sin(k * 2) * 0.2, 2.6 + k * 0.3, z, 1.2 - k * 0.15, k % 2 ? "#ffb040" : "#ff6a20", teile.torhaus.innen);
    ankerFuer(teile.torhaus.innen, new THREE.Vector3(x, 3.5, z + 0.5), "#ff8a3a", 40, 22, 1.3);
  }
  schalen.in(teile.torhaus.innen);

  // --- Getier: Fledermäuse, Ratten, Goblins ---
  const fledermaeuseDraussen = fledermaeuse(szene, new THREE.Vector3(mitteX, 0, wandZ - 6), Math.round(14 * qualitaet.partikel) || 5, 16, 16, animationen);
  fledermaeuse(szene, new THREE.Vector3(mitteX, 0, (EBENEN_POS[2].y0 + 4) * E), 6, 6, EBENEN_POS[2].h + 6, animationen);
  const rWege = [];
  for (const e of [EBENEN_POS[1], EBENEN_POS[2]]) {
    rWege.push([new THREE.Vector3((e.x0 + 3.5) * E, 0, (e.y1 + 0.6) * E), new THREE.Vector3((e.x1 - 3) * E, 0, (e.y1 + 0.6) * E), e.h]);
    rWege.push([new THREE.Vector3((e.x0 + 4) * E, 0, (e.y0 + 3.5) * E), new THREE.Vector3((e.x0 + 4) * E, 0, (e.y1 - 1) * E), e.h]);
  }
  ratten(szene, rWege.map(([a, b, h]) => [a, b, h]), animationen);
  const goblins = [];
  for (const [x0, z0, x1, z1] of [[6, V.y0 + 2, 15, V.y0 + 2], [26, V.y0 + 3, 34, V.y0 + 3], [5, V.y0 + 9, 5, V.y0 + 16], [34, V.y0 + 8, 34, V.y0 + 15]]) {
    const g = goblinBauen(), sitz = goblinBauen(true);
    sitz.visible = false;
    szene.add(g, sitz);
    goblins.push({ g, sitz, a: new THREE.Vector3((x0 + 0.5) * E, 0, (z0 + 0.5) * E), b: new THREE.Vector3((x1 + 0.5) * E, 0, (z1 + 0.5) * E), p: hash(x0, z0, 95) * 10 });
  }

  // --- Asche und Glut in der Luft ---
  const ascheN = Math.round(700 * qualitaet.partikel) || 200;
  const apos = new Float32Array(ascheN * 3), abasis = new Float32Array(ascheN * 3);
  for (let i = 0; i < ascheN; i++) { abasis[i * 3] = V.x0 * E + hash(i, 1, 99) * (V.x1 - V.x0) * E; abasis[i * 3 + 1] = hash(i, 2, 99) * 14; abasis[i * 3 + 2] = V.y0 * E + hash(i, 3, 99) * (V.y1 - V.y0 + 1) * E; }
  const ageo = new THREE.BufferGeometry(); ageo.setAttribute("position", new THREE.BufferAttribute(apos, 3));
  const asche = new THREE.Points(ageo, new THREE.PointsMaterial({ map: tex.licht, color: "#b8a8a0", size: 0.16, transparent: true, opacity: 0.7, depthWrite: false }));
  asche.frustumCulled = false;
  szene.add(asche);

  animationen.push((zeit) => {
    tex.lava.offset.set(zeit * 0.02, zeit * 0.035); lavaTex.offset.set(zeit * 0.006, zeit * 0.01); stromTex.offset.y = zeit * 0.05;
    seeLicht.staerke = 45 + Math.sin(zeit * 1.7) * 8 + Math.sin(zeit * 4.1) * 4;
    flammen.forEach((s, i) => { s.material.opacity = 0.75 + Math.sin(zeit * 9 + i * 1.7) * 0.15 + Math.sin(zeit * 13 + i) * 0.08; });
    for (const s of blasen) {
      const u = s.userData, h = (zeit * u.v + u.p) % 1;
      s.position.set(u.x, K.h - 0.6 + h * 4, u.z);
      s.scale.setScalar(0.5 + (1 - h) * 0.6);
      s.material.opacity = (1 - h) * 0.9;
    }
    rauch.forEach((s) => { const h = (zeit * 0.03 + s.userData.p) % 1; s.position.set(VX + Math.sin(h * 6) * 8 + h * 50, VB + VH + 10 + h * 160, VZ + h * 10); s.scale.setScalar((40 + h * 90) * (1 - lavaAus * 0.5)); s.material.opacity = 0.75 * (1 - h) * (1 - lavaAus * 0.8); });
    krater.material.opacity = (0.75 + Math.sin(zeit * 1.3) * 0.15) * (1 - lavaAus);
    for (let i = 0; i < ascheN; i++) {
      const y = (abasis[i * 3 + 1] - zeit * (0.5 + (i % 4) * 0.12)) % 14;
      apos[i * 3] = abasis[i * 3] + Math.sin(zeit * 0.4 + i) * 1.2;
      apos[i * 3 + 1] = y < 0 ? y + 14 : y;
      apos[i * 3 + 2] = abasis[i * 3 + 2] + Math.cos(zeit * 0.3 + i) * 1.2;
    }
    ageo.attributes.position.needsUpdate = true;
    for (const gb of goblins) {
      if (gb.sitzt) { gb.sitz.rotation.z = Math.sin(zeit * 0.8 + gb.p) * 0.05; continue; }
      const d = gb.a.distanceTo(gb.b), s = (zeit * 1.1 + gb.p) % (2 * d + 4);
      const u = s < d ? s / d : s < d + 2 ? 1 : s < 2 * d + 2 ? 1 - (s - d - 2) / d : 0;
      gb.g.position.lerpVectors(gb.a, gb.b, u);
      gb.g.position.y = Math.abs(Math.sin(zeit * 8 + gb.p)) * 0.08;
      const hin = s < d + 2;
      gb.g.rotation.y = Math.atan2((gb.b.x - gb.a.x) * (hin ? 1 : -1), (gb.b.z - gb.a.z) * (hin ? 1 : -1));
    }
  });

  // ---------- Das Ende: Sprachsiegel, Beben, Flucht, Einsturz, blauer Himmel ----------
  // Zustände: schattenzahn_boss (Morgrath in der Lava) → schattenzahn_flucht (Siegel vereint, die Feste bebt)
  //           → schattenzahn_finale (draußen bei den Mentoren: Die Feste zerfällt, der Vulkan erlischt).
  const merk = {};
  let effekte = null;
  const heldPos = new THREE.Vector3(mitteX, 0, (V.y0 + 10) * E);
  let lavaAus = 0, tag = 0, einsturzFertig = false, bebenWert = 0, naechstesBeben = 3, ablauf = null;
  const glatt = (u) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };

  // Herabfallende Steine (Flucht und Einsturz)
  const steinMat = new THREE.MeshStandardMaterial({ color: "#3a3034", roughness: 1, flatShading: true });
  const steine = Array.from({ length: 18 }, () => {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), steinMat);
    m.visible = false; m.castShadow = true; szene.add(m);
    return { m, v: new THREE.Vector3(), leben: 0, boden: 0 };
  });
  const steinFallen = (x, y, z, groesse = 1, vx = 0, vz = 0) => {
    const st = steine.find((s) => !s.m.visible);
    if (!st) return;
    st.m.visible = true; st.m.position.set(x, y, z); st.m.scale.setScalar(groesse);
    st.v.set(vx, 0, vz); st.leben = 5; st.boden = hoeheBeiZeile(z / E);
    st.groesse = groesse;
  };
  // Große Staubwolken (eigene Sprites, weil sie viel größer sind als die normalen Effekte)
  const wolken = Array.from({ length: 56 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#8a7e72", transparent: true, opacity: 0, depthWrite: false }));
    s.visible = false; szene.add(s);
    return { s, t: 0, dauer: 1, g: 1 };
  });
  const staubWolke = (x, y, z, g = 8, dauer = 4) => {
    const w = wolken.find((x2) => !x2.s.visible) ?? wolken.reduce((a, b) => (a.t / a.dauer > b.t / b.dauer ? a : b));
    w.s.visible = true; w.s.position.set(x, y, z); w.t = 0; w.dauer = dauer; w.g = g;
    w.s.material.color.set(hash(x, z, 7) > 0.5 ? "#8a7e72" : "#6a6058");
  };

  // Die vier Splitter und das vereinte Sprachsiegel
  const FARBEN = ["#5ab0ff", "#5ae07a", "#ffd04a", "#ff6a5a"];
  const S = new THREE.Vector3(mitteX, K.h + 3.2, (K.y0 + 7) * E);
  const splitter = FARBEN.map((f) => {
    const g = new THREE.Group();
    const kristall = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: f, emissive: f, emissiveIntensity: 1.6, roughness: 0.2, toneMapped: false }));
    kristall.scale.set(0.7, 1.5, 0.7);
    const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: f, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    schein.scale.setScalar(1.8);
    g.add(kristall, schein); g.visible = false; szene.add(g);
    return { g, kristall, farbe: new THREE.Color(f) };
  });
  const lichtTraeger = new THREE.Group(); lichtTraeger.visible = false; szene.add(lichtTraeger);
  ankerFuer(lichtTraeger, new THREE.Vector3(), "#fff0c0", 30, 16, 1.4);
  const siegel = new THREE.Group();
  {
    const gold = new THREE.MeshStandardMaterial({ color: "#e8b440", emissive: "#8a5a08", emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.35 });
    const rand = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.1, 10, 40), gold);
    siegel.add(rand);
    FARBEN.forEach((f, i) => {
      const geo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16, 1, false, i * Math.PI / 2 + 0.04, Math.PI / 2 - 0.08).rotateX(Math.PI / 2);
      siegel.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(f).multiplyScalar(0.85) })));
    });
    const mitte = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6d8", emissiveIntensity: 1.2 }));
    mitte.position.z = 0.08;
    siegel.add(mitte);
    // Ein sanfter Schein hinter dem Siegel (davor würde er die vier Farben überstrahlen)
    const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#ffd890", transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    schein.scale.setScalar(4);
    schein.position.z = -0.4;
    schein.renderOrder = -1;
    siegel.add(schein);
    siegel.visible = false;
    szene.add(siegel);
    ankerFuer(siegel, new THREE.Vector3(0, 0, 0.5), "#ffe08a", 45, 16, 1.4);
  }

  // Was nach dem Einsturz bleibt: ein Schuttberg vor dem Hinterland, Turmstümpfe, Felsbrocken
  const truemmerG = new THREE.Group();
  {
    const tiefe = 18, breite = 300;
    const geo = new THREE.PlaneGeometry(breite, tiefe, 100, 12).rotateX(-Math.PI / 2);
    const p = geo.attributes.position, farben = [];
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i), x = p.getX(i);
      const u = (tiefe / 2 - z) / tiefe;            // 0 vorne (Süden) … 1 hinten
      const rau = Math.sin(Math.PI * u) * (hash(Math.round(x * 3), Math.round(z * 3), 5) - 0.5) * 1.6;
      p.setY(i, -0.3 + 11.6 * glatt(u) + rau);
      c.set(hash(Math.round(x), Math.round(z), 6) > 0.5 ? "#3a3436" : "#2e2a2c").offsetHSL(0, 0, (hash(i, 2, 6) - 0.5) * 0.06);
      farben.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(farben, 3));
    geo.computeVertexNormals();
    const halde = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
    halde.position.set(mitteX, 0, wandZ + 2 - tiefe / 2);
    halde.receiveShadow = true;
    truemmerG.add(halde);
    const t = new Teile();
    // Stümpfe der Türme und des Torhauses
    for (const [x, z, r, h] of [[mitteX - 9, wandZ - 1, 3.4, 5], [mitteX + 9, wandZ - 1, 3.4, 3.5], [mitteX - 26, wandZ - 1, 3, 2.5], [mitteX + 26, wandZ - 1, 3, 4.5]]) {
      t.add(ZYL(0.95, 1, 12), "#3a3238", [x, h / 2, z], [0, 0, 0], [r, h, r]);
      for (let k = 0; k < 5; k++) t.add(KEGEL(4), "#3a3238", [x + Math.cos(k * 1.3) * r * 0.8, h + 0.6, z + Math.sin(k * 1.3) * r * 0.8], [Math.sin(k) * 0.3, k, 0], [0.5, 1.2 + (k % 3) * 0.6, 0.5]);
    }
    for (const sx of [-1, 1]) {
      t.add(KASTEN(), DUNKEL, [mitteX + sx * 3.8, 1.6, wandZ + 0.2], [0, 0, sx * 0.08], [3.2, 3.2, 3.2]);
      t.add(KEGEL(4), DUNKEL, [mitteX + sx * 3.4, 3.6, wandZ + 0.4], [0.2, 0.4, sx * 0.3], [0.8, 1.8, 0.8]);
    }
    // Der Schuttberg im Burgtor (hier geht es nicht mehr hinein)
    for (let k = 0; k < 14; k++) {
      const g = 0.6 + hash(k, 1, 3) * 0.9;
      t.add(KUGEL_K(), hash(k, 2, 3) > 0.5 ? "#3a3436" : "#4a4048", [GX0 + hash(k, 3, 3) * (GX1 - GX0), g * 0.5 + (k > 8 ? 1 : 0), wandZ + 0.4 + hash(k, 4, 3) * 1.4], [k, k * 2, 0], [g, g * 0.7, g]);
    }
    for (let k = 0; k < 4; k++) t.add(ZYL(1, 1, 6), EISEN, [GX0 + 0.6 + k * 0.9, 0.9, wandZ + 1.2], [0.3 + k * 0.2, 0, (k - 1.5) * 0.5], [0.07, 2.4, 0.07], { art: "glanz" });   // verbogene Gitterstäbe
    // Felsbrocken auf der Halde
    for (let k = 0; k < 46; k++) {
      const x = mitteX - 60 + hash(k, 5, 3) * 120, u = 0.1 + hash(k, 6, 3) * 0.75, g = 0.6 + hash(k, 7, 3) * 1.6;
      t.add(KUGEL_K(), hash(k, 8, 3) > 0.5 ? "#3a3436" : "#2a2426", [x, -0.3 + 11.6 * glatt(u) + g * 0.3, wandZ + 2 - u * 18], [k, k, 0], [g, g * 0.6, g]);
    }
    t.in(truemmerG);
  }
  truemmerG.visible = false;
  szene.add(truemmerG);
  // Nach dem Ende wächst im Vorhof wieder Gras
  const grasG = new THREE.Group();
  {
    const t = new Teile();
    for (let i = 0, n = 0; i < 900 && n < 140; i++) {
      const tx = V.x0 + Math.floor(hash(i, 1, 44) * (V.x1 - V.x0 + 1)), ty = V.y0 + Math.floor(hash(i, 2, 44) * (V.y1 - V.y0 + 1));
      if (raster[ty]?.[tx] !== "_" || (tx >= 15 && tx <= 24 && ty <= V.y0 + 9)) continue;
      n++;
      const x = (tx + hash(i, 3, 44)) * E, z = (ty + hash(i, 4, 44)) * E;
      for (let k = 0; k < 4; k++) t.add(KEGEL(4), k % 2 ? "#5a8a3a" : "#4a7a2e", [x + (k - 1.5) * 0.12, 0.18, z + Math.sin(k * 2) * 0.1], [Math.sin(k) * 0.3, k, Math.cos(k) * 0.3], [0.06, 0.4 + hash(i, k, 45) * 0.3, 0.06]);
    }
    for (let k = 0; k < 30; k++) {
      const u = 0.05 + hash(k, 9, 3) * 0.6, x = mitteX - 40 + hash(k, 10, 3) * 80;
      t.add(KEGEL(4), "#5a8a3a", [x, -0.3 + 11.6 * glatt(u) + 0.2, wandZ + 2 - u * 18], [0, k, 0], [0.1, 0.5, 0.1]);
    }
    t.in(grasG, { schatten: false });
  }
  grasG.visible = false;
  szene.add(grasG);

  // Die Sonne (erst nach dem Ende sichtbar)
  const sonnenScheibe = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.licht, color: "#fff4d0", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sonnenScheibe.scale.setScalar(160);
  sonnenScheibe.visible = false;
  szene.add(sonnenScheibe);

  // Himmel und Licht im Vorhof: von Blutrot (Nacht) zu Blau (Tag)
  const himmelFarben = himmel.geometry.attributes.color;
  const nachtHimmel = Float32Array.from(himmelFarben.array);
  const tagHimmel = new Float32Array(nachtHimmel.length);
  {
    const oben = new THREE.Color("#2f6cc0"), mitte = new THREE.Color("#78ace0"), unten = new THREE.Color("#d4e6f2"), c = new THREE.Color();
    const p = himmel.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = Math.max(0, p.getY(i) / 800);
      c.copy(unten).lerp(mitte, Math.min(1, u * 4)).lerp(oben, Math.max(0, (u - 0.25) * 1.6));
      tagHimmel[i * 3] = c.r; tagHimmel[i * 3 + 1] = c.g; tagHimmel[i * 3 + 2] = c.b;
    }
  }
  const sonneNacht = new THREE.Color("#ff9a6a"), sonneTag = new THREE.Color("#fff0dc");
  const F2 = (a) => new THREE.Color(a);
  const vorhofNacht = { bg: F2("#2a0c0a"), nebel: F2("#4a160c"), hemi: F2("#ffa070"), boden: F2("#3a1408"), i: 1.9, sonne: 2.4, nah: 120, weit: 1100 };
  const vorhofTag = { bg: F2("#8cc0ec"), nebel: F2("#b4cce4"), hemi: F2("#eaf2ff"), boden: F2("#6a5a44"), i: 1.7, sonne: 2.7, nah: 160, weit: 1200 };
  const vorhofStufe = { bg: new THREE.Color(), nebel: new THREE.Color(), hemi: new THREE.Color(), boden: new THREE.Color(), i: 0, sonne: 0, nah: 0, weit: 0 };
  const tagSetzen = (u) => {
    tag = u;
    for (let i = 0; i < nachtHimmel.length; i++) himmelFarben.array[i] = nachtHimmel[i] + (tagHimmel[i] - nachtHimmel[i]) * u;
    himmelFarben.needsUpdate = true;
    for (const k of ["bg", "nebel", "hemi", "boden"]) vorhofStufe[k].copy(vorhofNacht[k]).lerp(vorhofTag[k], u);
    for (const k of ["i", "sonne", "nah", "weit"]) vorhofStufe[k] = vorhofNacht[k] + (vorhofTag[k] - vorhofNacht[k]) * u;
    sonne.color.copy(sonneNacht).lerp(sonneTag, u);
    sonnenScheibe.visible = u > 0.01;
    sonnenScheibe.material.opacity = u;
    if (vorhofBoden) {
      if (u > 0.5) vorhofBoden.tag ??= vorhofBoden.bauen();
      const map = u > 0.5 ? vorhofBoden.tag : vorhofBoden.glut;
      if (vorhofBoden.mat.map !== map) { vorhofBoden.mat.map = map; vorhofBoden.mat.needsUpdate = true; }
    }
    grasG.visible = u > 0.3; grasG.scale.y = Math.max(0.01, (u - 0.3) / 0.7);
    asche.material.opacity = 0.7 * (1 - u);
    for (const b of fledermaeuseDraussen) b.g.visible = u < 0.5;
  };
  const lavaSetzen = (u) => { lavaAus = u; stromMat.opacity = 0.9 * (1 - u); for (const s of rauch) s.material.color.set("#1a0e0c").lerp(new THREE.Color("#c8c8cc"), u); };
  const goblinsSetzen = (an, amPlatz) => {
    // Die Goblins setzen sich gemütlich im Kreis auf den Boden
    const mx = 12.5 * E, mz = (V.y0 + 6.5) * E;
    goblins.forEach((gb, i) => {
      gb.sitzt = an; gb.g.visible = !an; gb.sitz.visible = an;
      if (!an) return;
      const a = (i / goblins.length) * Math.PI * 2 + 0.4;
      const x = amPlatz ? mx + Math.cos(a) * 1.5 : gb.g.position.x, z = amPlatz ? mz + Math.sin(a) * 1.5 : gb.g.position.z;
      gb.sitz.position.set(x, 0, z);
      gb.sitz.rotation.y = amPlatz ? Math.atan2(mx - x, mz - z) : gb.g.rotation.y + Math.PI;
    });
  };
  const dungeonOben = [wandMeshes.hoeren, stufenG].filter(Boolean);
  const endZustand = () => {
    for (const tl of Object.values(teile)) tl.aussen.visible = false;
    if (merk.tor) merk.tor.visible = false;
    truemmerG.visible = true; truemmerG.scale.y = 1;
    for (const m of dungeonOben) m.visible = false;
    lavaSetzen(1); tagSetzen(1); goblinsSetzen(true, true);
    einsturzFertig = true;
  };
  lavaSetzen(0); tagSetzen(0);

  // Plan des Einsturzes: [Beginn (s), Kippen, Richtung]
  const PLAN = { "flanke-1": [2.0, 0.3, -1], flanke1: [2.5, 0.3, 1], "turm-1": [3.0, 0.25, -1], turm1: [3.3, 0.25, 1], bergfried: [3.8, 0.4, 1], torhaus: [4.6, 0.12, 0], mauer: [5.0, 0.05, 0] };
  const kinoPos = new THREE.Vector3(), kinoBlick = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
  const mischV = (ziel, a, b, u) => ziel.copy(a).lerp(b, glatt(u));
  const ABLAEUFE = {
    // Die vier Splitter steigen aus der Lava, kreisen und verschmelzen zum Sprachsiegel; das Siegel schwebt zum Helden
    siegel: () => {
      const start = splitter.map((sp, k) => new THREE.Vector3(mitteX + [-9, -3, 3, 9][k], K.h - 0.6, (K.y0 + 1.5) * E));
      let blitz = false;
      return {
        dauer: 11.5,
        schritt: (t) => {
          const mitte = _a.set(0, 0, 0);
          splitter.forEach((sp, k) => {
            sp.g.visible = t < 7.2;
            if (!sp.g.visible) return;
            const winkel = k * Math.PI / 2 + t * (1.6 + Math.max(0, t - 5) * 1.6);
            const r = t < 5 ? 2.6 : 2.6 * (1 - glatt((t - 5) / 2.2)) + 0.15;
            const kreis = _b.set(S.x + Math.cos(winkel) * r, S.y + Math.sin(t * 2 + k) * 0.25 + Math.max(0, t - 5) * 0.3, S.z + Math.sin(winkel) * r);
            if (t < 2.2) sp.g.position.copy(start[k]).setY(start[k].y + glatt(t / 2.2) * 5.5);
            else if (t < 5) sp.g.position.copy(start[k]).setY(start[k].y + 5.5).lerp(kreis, glatt((t - 2.2) / 2.8));
            else sp.g.position.copy(kreis);
            sp.kristall.rotation.y = t * 3 + k;
            mitte.add(sp.g.position);
            effekte?.funken.aussenden(sp.g.position, new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4), { farbe: [sp.farbe.r * 1.4, sp.farbe.g * 1.4, sp.farbe.b * 1.4], groesse: 0.12, dauer: 0.7, schwer: -0.2 });
          });
          if (t < 7.2) { mitte.multiplyScalar(0.25); lichtTraeger.visible = true; lichtTraeger.position.copy(mitte); }
          else lichtTraeger.visible = false;
          if (t >= 7.2 && !blitz) {
            blitz = true;
            effekte?.explosion(S, "#fff2c0", 160, 6);
            effekte?.belohnung(S.clone().setY(S.y - 0.6), true);
            bebenWert = 0.4;
          }
          if (t >= 7.2) bebenWert = Math.max(0, bebenWert - 0.02);
          siegel.visible = t >= 7.2 && t < 11.2;
          if (siegel.visible) {
            const auf = glatt((t - 7.2) / 0.6), zumHeld = glatt((t - 9.8) / 1.4);
            const ueber = 1 + Math.sin(Math.min(1, (t - 7.2) / 0.6) * Math.PI) * 0.25;
            siegel.scale.setScalar(Math.max(0.01, auf * ueber * (1 - zumHeld * 0.85)));
            siegel.position.copy(S).setY(S.y + Math.sin(t * 2) * 0.12).lerp(_b.copy(heldPos).setY(heldPos.y + 1.3), zumHeld);
            siegel.rotation.y = Math.sin(t * 1.2) * 0.5 + zumHeld * 6;
            if (t > 11.0 && !siegel.userData.weg) { siegel.userData.weg = true; effekte?.belohnung(heldPos, false); }
          }
          // Kamera: hinter dem Helden, langsam näher an das Geschehen
          const nah = glatt(t / 9);
          kinoPos.set(S.x + 5.5 - 2.5 * nah, S.y + 1.8 - 0.4 * nah, S.z + 11 - 3.5 * nah);
          kinoBlick.copy(t < 7.2 ? mitte : siegel.position);
          if (t < 2.2) kinoBlick.lerp(_b.copy(S), 0.3);
          kontext.kino?.(kinoPos, kinoBlick);
        },
        ende: () => { for (const sp of splitter) sp.g.visible = false; siegel.visible = false; siegel.userData.weg = false; lichtTraeger.visible = false; bebenWert = 0; },
      };
    },
    // Morgraths Feste verliert ihren Halt: ein schweres Beben, Steine fallen
    beben: () => ({
      dauer: 3.4,
      schritt: (t, dt) => {
        bebenWert = 1 - t / 3.4 * 0.6;
        if (Math.random() < dt * 5) steinNahe(1);
        kinoPos.set(heldPos.x + 3, heldPos.y + 3.2, heldPos.z + 6.5);
        kinoBlick.set(heldPos.x, heldPos.y + 2.2, heldPos.z - 3);
        kontext.kino?.(kinoPos, kinoBlick);
      },
      ende: () => { bebenWert = 0.3; naechstesBeben = 4; },
    }),
    // Draußen: Die Feste zerfällt zu Staub, der Vulkan erlischt, der Himmel wird blau
    einsturz: () => {
      const A = { pos: new THREE.Vector3(mitteX + 7, 4.5, wandZ + 36), blick: new THREE.Vector3(mitteX - 3, 14, wandZ - 12) };
      const B2 = { pos: new THREE.Vector3(mitteX + 3, 8, wandZ + 40), blick: new THREE.Vector3(VX - 20, VB + VH * 0.75, VZ) };
      const C = { pos: new THREE.Vector3(mitteX + 1.5, 3.6, wandZ + 29), blick: new THREE.Vector3(mitteX - 2, 9, wandZ - 30) };
      const staubZeit = {};
      let gesessen = false;
      return {
        dauer: 19,
        schritt: (t, dt) => {
          bebenWert = t < 2 ? 0.5 : t < 9 ? 1 : Math.max(0, 1 - (t - 9) / 6);
          for (const [name, [beginn, kipp, richtung]] of Object.entries(PLAN)) {
            const tl = teile[name];
            if (!tl.aussen.visible) continue;
            const u = Math.max(0, Math.min(1, (t - beginn) / 5));
            const zittern = (u < 1 ? 0.12 : 0) * (1 - u * 0.5);
            tl.aussen.position.set(tl.bx + (Math.random() - 0.5) * zittern, -tl.tiefe * u * u, tl.bz + (Math.random() - 0.5) * zittern);
            tl.aussen.rotation.set(-kipp * 0.4 * u ** 1.5, 0, -richtung * kipp * u ** 1.5);
            const enger = 1 - u * 0.3;
            tl.aussen.scale.set(enger, 1, enger);
            if (u > 0 && u < 1) {
              staubZeit[name] = (staubZeit[name] ?? 0) - dt;
              if (staubZeit[name] <= 0) {
                staubZeit[name] = 0.14;
                const breit = name === "mauer" ? 34 : name === "bergfried" ? 6 : 4;
                staubWolke(tl.bx + (Math.random() - 0.5) * 2 * breit, tl.boden + Math.random() * 3, tl.bz + 2 + Math.random() * 2, 7 + Math.random() * 8, 4 + Math.random() * 2);
                if (Math.random() < 0.5) steinFallen(tl.bx + (Math.random() - 0.5) * 4, tl.boden + 10 + Math.random() * 12, tl.bz + 1, 0.8 + Math.random() * 1.5, (Math.random() - 0.5) * 6, 2 + Math.random() * 3);
              }
            }
            if (u >= 1) {
              tl.aussen.visible = false;
              for (let k = 0; k < 5; k++) staubWolke(tl.bx + (Math.random() - 0.5) * 8, tl.boden + Math.random() * 4, tl.bz + 2, 10 + Math.random() * 6, 5);
            }
          }
          if (merk.tor && t > 4.6) merk.tor.position.y = -(((t - 4.6) / 5) ** 2) * 20;
          // Der Schutt wächst aus dem Staub
          if (t > 5) {
            truemmerG.visible = true;
            truemmerG.scale.y = Math.max(0.01, glatt((t - 5) / 5));
            for (const m of dungeonOben) m.visible = false;
          }
          lavaSetzen(glatt((t - 8.5) / 3.5));
          tagSetzen(glatt((t - 9) / 6));
          if (t > 12 && !gesessen) { gesessen = true; goblinsSetzen(true, true); }
          // Kamera
          if (t < 7) { kinoPos.copy(A.pos); kinoBlick.copy(A.blick); }
          else if (t < 14) { mischV(kinoPos, A.pos, B2.pos, (t - 7) / 4); mischV(kinoBlick, A.blick, B2.blick, (t - 7) / 4); }
          else { mischV(kinoPos, B2.pos, C.pos, (t - 14) / 3); mischV(kinoBlick, B2.blick, C.blick, (t - 14) / 3); }
          kontext.kino?.(kinoPos, kinoBlick);
        },
        ende: () => { endZustand(); bebenWert = 0; },
      };
    },
  };
  /** Ein paar Steine fallen in der Nähe der Spielfigur von der Decke */
  const steinNahe = (n) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 3.5;
      const x = heldPos.x + Math.cos(a) * r, z = heldPos.z + Math.sin(a) * r;
      const c = raster[Math.floor(z / E)]?.[Math.floor(x / E)];
      if (!c || c === "#") continue;
      steinFallen(x, heldPos.y + (heldPos.y > -2 ? 12 : 7.5), z, 0.4 + Math.random() * 0.5);
    }
  };
  if (zustand.erledigt.schattenzahn_finale) endZustand();

  animationen.push((zeit, dt = 0.016) => {
    const z = zustand.erledigt;
    // Laufende Zwischensequenz
    if (ablauf) {
      ablauf.t += dt;
      ablauf.schritt(Math.min(ablauf.t, ablauf.dauer), dt);
      if (ablauf.t >= ablauf.dauer) {
        const fertig = ablauf.fertig;
        ablauf.ende?.();
        ablauf = null;
        kontext.kino?.(null);
        fertig();
      }
    } else if (z.schattenzahn_finale) {
      if (!einsturzFertig) endZustand();     // z. B. nach einem Sprungcode
      bebenWert = 0;
    } else if (z.schattenzahn_flucht) {
      // Auf der Flucht: Die Erde bebt immer wieder, Steine fallen von der Decke, draußen zittert die Burg
      naechstesBeben -= dt;
      if (naechstesBeben <= 0) { naechstesBeben = 3.5 + Math.random() * 3; bebenWert = 0.85; steinNahe(3); }
      bebenWert = Math.max(0.15, bebenWert - dt * 0.5);
      if (heldPos.y > -1) for (const tl of Object.values(teile)) tl.aussen.position.set(tl.bx + (Math.random() - 0.5) * 0.06 * bebenWert, 0, tl.bz + (Math.random() - 0.5) * 0.06 * bebenWert);
    } else {
      bebenWert = 0;
    }
    // Steine und Staub
    for (const st of steine) {
      if (!st.m.visible) continue;
      st.leben -= dt;
      st.v.y -= 22 * dt;
      st.m.position.addScaledVector(st.v, dt);
      st.m.rotation.x += dt * 3; st.m.rotation.z += dt * 2;
      if (st.m.position.y < st.boden + 0.2 * st.groesse || st.leben <= 0) {
        st.m.visible = false;
        if (st.leben > 0 && effekte) effekte.staub(st.m.position.clone().setY(st.boden + 0.1), 0.5 * st.groesse, 8);
      }
    }
    for (const w of wolken) {
      if (!w.s.visible) continue;
      w.t += dt;
      const u = w.t / w.dauer;
      if (u >= 1) { w.s.visible = false; continue; }
      w.s.scale.setScalar(w.g * (0.5 + u * 1.3));
      w.s.position.y += dt * 0.8;
      w.s.material.opacity = Math.min(1, u * 6) * (1 - u) * 0.9;
    }
  });

  // --- Licht folgt der Tiefe: draußen rot, unten dunkel und glühend ---
  const F = (a) => new THREE.Color(a);
  const stufe = [
    vorhofStufe,
    { bg: F("#0a0606"), nebel: F("#120808"), hemi: F("#b88070"), boden: F("#2a120a"), i: 1.15, sonne: 0.4, nah: 18, weit: 60 },
    { bg: F("#0a0806"), nebel: F("#140c08"), hemi: F("#b89a7a"), boden: F("#2a1a0a"), i: 1.15, sonne: 0.35, nah: 18, weit: 60 },
    { bg: F("#120604"), nebel: F("#2a0e06"), hemi: F("#d0886a"), boden: F("#3a1408"), i: 1.15, sonne: 0.35, nah: 18, weit: 64 },
    { bg: F("#1a0604"), nebel: F("#3a1006"), hemi: F("#f08a5a"), boden: F("#4a1408"), i: 1.2, sonne: 0.4, nah: 24, weit: 90 },
  ];
  const mische = (z, a, b, t) => z.copy(a).lerp(b, t);
  const versatz = new THREE.Vector3(10, 34, 14);
  return {
    blockZeichen: BLOCKIERT,
    boden: (x, z) => hoeheBeiZeile(z / 2),
    hindernis: (tx, ty) => (raster[ty]?.[tx] === "#" ? 999 : kachelH(tx, ty)),
    objektModell: (o) => objektModell(o, animationen, ankerFuer, merk),
    effekteSetzen: (e) => { effekte = e; },
    beben: () => bebenWert,
    ereignis: (name) => new Promise((fertig) => {
      if (!ABLAEUFE[name]) { fertig(); return; }
      ablauf = { t: 0, ...ABLAEUFE[name](), fertig };
    }),
    licht: (pos) => {
      sonne.position.set(pos.x + versatz.x, pos.y + versatz.y, pos.z + versatz.z);
      sonne.target.position.set(pos.x, pos.y, pos.z);
      const f = Math.max(0, Math.min(4, -pos.y / 4));
      const i = Math.min(3, Math.floor(f)), u = f - i, a = stufe[i], b = stufe[i + 1];
      mische(szene.background, a.bg, b.bg, u);
      mische(szene.fog.color, a.nebel, b.nebel, u);
      szene.fog.near = a.nah + (b.nah - a.nah) * u; szene.fog.far = a.weit + (b.weit - a.weit) * u;
      mische(hemi.color, a.hemi, b.hemi, u);
      mische(hemi.groundColor, a.boden, b.boden, u);
      hemi.intensity = a.i + (b.i - a.i) * u;
      sonne.intensity = a.sonne + (b.sonne - a.sonne) * u;
      asche.visible = pos.y > -2 && tag < 1;
      heldPos.copy(pos);
      sonnenScheibe.position.set(pos.x + 230, 420, pos.z + 520);
      lichterVerteilen(pos);
      himmel.position.set(pos.x, 0, pos.z);
    },
    kamera: { hoehe: 3.2, abstand: 7, maxHoehe: 6 },
  };
}
