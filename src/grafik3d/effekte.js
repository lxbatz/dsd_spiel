// Visuelle Effekte: Partikel (Funken, Staub, Herzen), Schmetterlinge, Vögel,
// fallende Blätter, Pollen, Wasserglitzern und Wind im Gras.

import * as THREE from "../../vendor/three.module.min.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E, welt } from "./welt.js";

// ---------- Partikel ----------

const PUNKT_VERTEX = `
  attribute float groesse;
  attribute float alpha;
  attribute vec3 farbe;
  uniform float skala;
  varying float vA;
  varying vec3 vF;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = groesse * skala / max(0.1, -mv.z);
    vA = alpha;
    vF = farbe;
  }`;
const PUNKT_FRAGMENT = `
  uniform sampler2D karte;
  varying float vA;
  varying vec3 vF;
  void main() {
    vec4 t = texture2D(karte, gl_PointCoord);
    if (t.a * vA < 0.01) discard;
    gl_FragColor = vec4(vF * t.rgb, t.a * vA);
  }`;

const PUNKT_MATS = new Set();
let punktSkala = 600;
/** Größe der Punkte an die Bildschirmhöhe anpassen (Pixel pro Welteinheit in 1 m Abstand). */
export function punktSkalaSetzen(wert) {
  punktSkala = wert;
  for (const m of PUNKT_MATS) m.uniforms.skala.value = wert;
}

function punktMaterial(karte, additiv) {
  const m = new THREE.ShaderMaterial({
    uniforms: { karte: { value: karte }, skala: { value: 600 } },
    vertexShader: PUNKT_VERTEX,
    fragmentShader: PUNKT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: additiv ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  m.uniforms.skala.value = punktSkala;
  PUNKT_MATS.add(m);
  return m;
}

let funkenTex = null, rauchTex = null, herzTex = null;
function texturen() {
  if (funkenTex) return;
  funkenTex = textur(lichtTextur("rgba(255,255,255,1)"));
  rauchTex = textur(lichtTextur("rgba(255,255,255,0.75)"));
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(32, 56); g.bezierCurveTo(4, 36, 6, 10, 22, 10); g.bezierCurveTo(28, 10, 32, 16, 32, 20);
  g.bezierCurveTo(32, 16, 36, 10, 42, 10); g.bezierCurveTo(58, 10, 60, 36, 32, 56); g.fill();
  herzTex = textur(c);
}

/** Ein Partikelsystem mit fester Größe (Ringpuffer). */
class Partikel {
  constructor(szene, anzahl, karte, additiv) {
    this.n = anzahl;
    this.pos = new Float32Array(anzahl * 3);
    this.vel = new Float32Array(anzahl * 3);
    this.farbe = new Float32Array(anzahl * 3);
    this.alpha = new Float32Array(anzahl);
    this.groesse = new Float32Array(anzahl);
    this.leben = new Float32Array(anzahl);
    this.dauer = new Float32Array(anzahl);
    this.schwer = new Float32Array(anzahl);
    this.wachsen = new Float32Array(anzahl);
    this.start = new Float32Array(anzahl);
    this.i = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("farbe", new THREE.BufferAttribute(this.farbe, 3));
    g.setAttribute("alpha", new THREE.BufferAttribute(this.alpha, 1));
    g.setAttribute("groesse", new THREE.BufferAttribute(this.groesse, 1));
    this.geo = g;
    this.punkte = new THREE.Points(g, punktMaterial(karte, additiv));
    this.punkte.frustumCulled = false;
    this.punkte.renderOrder = 5;
    szene.add(this.punkte);
  }

  aussenden(p, v, { farbe = [1, 1, 1], groesse = 0.3, dauer = 1, schwer = 0, wachsen = 0 }) {
    const i = this.i;
    this.i = (this.i + 1) % this.n;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.farbe.set(farbe, i * 3);
    this.leben[i] = dauer; this.dauer[i] = dauer;
    this.groesse[i] = groesse; this.start[i] = groesse;
    this.schwer[i] = schwer; this.wachsen[i] = wachsen;
    this.alpha[i] = 1;
  }

  update(dt) {
    let aktiv = false;
    for (let i = 0; i < this.n; i++) {
      if (this.leben[i] <= 0) { this.alpha[i] = 0; continue; }
      aktiv = true;
      this.leben[i] -= dt;
      const k = i * 3;
      this.vel[k + 1] -= this.schwer[i] * dt;
      this.vel[k] *= 1 - dt * 0.8; this.vel[k + 2] *= 1 - dt * 0.8;
      this.pos[k] += this.vel[k] * dt; this.pos[k + 1] += this.vel[k + 1] * dt; this.pos[k + 2] += this.vel[k + 2] * dt;
      const t = Math.max(0, this.leben[i] / this.dauer[i]);
      this.alpha[i] = Math.min(1, t * 2.5) * Math.min(1, (1 - t) * 8 + 0.2);
      this.groesse[i] = this.start[i] * (1 + (1 - t) * this.wachsen[i]);
    }
    if (aktiv || this.warAktiv) {
      for (const a of ["position", "alpha", "groesse", "farbe"]) this.geo.attributes[a].needsUpdate = true;
    }
    this.warAktiv = aktiv;
  }
}

const zufall = () => Math.random() * 2 - 1;
const _v = new THREE.Vector3(), _p = new THREE.Vector3();
const FARBE = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };

/** Alle Partikeleffekte einer Szene. */
export class Effekte {
  constructor(szene, menge = 1) {
    texturen();
    this.menge = menge;
    this.funken = new Partikel(szene, 700, funkenTex, true);
    this.rauch = new Partikel(szene, 260, rauchTex, false);
    this.herzen = new Partikel(szene, 40, herzTex, false);
  }

  update(dt) {
    this.funken.update(dt);
    this.rauch.update(dt);
    this.herzen.update(dt);
  }

  /** Goldene Funken, die aufsteigen (Belohnung). */
  belohnung(pos, stark = false) {
    const n = Math.round((stark ? 160 : 70) * this.menge);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.3 + Math.random() * 0.8;
      _p.set(pos.x + Math.cos(a) * r, pos.y + Math.random() * 0.4, pos.z + Math.sin(a) * r);
      _v.set(Math.cos(a) * 0.6, 2 + Math.random() * 3, Math.sin(a) * 0.6);
      const gold = Math.random() > 0.3;
      this.funken.aussenden(_p, _v, { farbe: gold ? [1.4, 1.0, 0.35] : [1.0, 1.0, 1.4], groesse: 0.12 + Math.random() * 0.14, dauer: 1.2 + Math.random() * 1.2, schwer: -0.4 });
    }
    if (stark) {
      // Lichtsäule beim Stufenaufstieg
      for (let i = 0; i < 90 * this.menge; i++) {
        const a = Math.random() * Math.PI * 2;
        _p.set(pos.x + Math.cos(a) * 0.5, pos.y + Math.random() * 0.3, pos.z + Math.sin(a) * 0.5);
        _v.set(0, 5 + Math.random() * 4, 0);
        this.funken.aussenden(_p, _v, { farbe: [1.2, 1.2, 0.8], groesse: 0.2, dauer: 1.5, schwer: 0 });
      }
    }
  }

  /** Bunte Funkenexplosion (Treffer, Tor öffnet sich). */
  explosion(pos, farbe = "#ffd060", n = 60, kraft = 3) {
    const f = FARBE(farbe).map((x) => x * 1.4);
    for (let i = 0; i < n * this.menge; i++) {
      _v.set(zufall(), Math.random() * 0.8 + 0.2, zufall()).normalize().multiplyScalar(kraft * (0.4 + Math.random() * 0.8));
      this.funken.aussenden(pos, _v, { farbe: f, groesse: 0.1 + Math.random() * 0.15, dauer: 0.7 + Math.random() * 0.8, schwer: 3 });
    }
  }

  /** Staubwolke am Boden (Tor, Landung). */
  staub(pos, breite = 2, n = 30, farbe = "#b8aa98") {
    const f = FARBE(farbe);
    for (let i = 0; i < n * this.menge; i++) {
      _p.set(pos.x + zufall() * breite, pos.y + Math.random() * 0.3, pos.z + zufall() * 0.6);
      _v.set(zufall() * 0.8, 0.3 + Math.random() * 0.7, zufall() * 0.8 + 0.6);
      this.rauch.aussenden(_p, _v, { farbe: f, groesse: 0.6 + Math.random() * 0.6, dauer: 1.2 + Math.random(), schwer: 0, wachsen: 1.8 });
    }
  }

  /** Kleine Staubwölkchen beim Laufen. */
  schritt(pos) {
    _p.set(pos.x + zufall() * 0.15, 0.05, pos.z + zufall() * 0.15);
    _v.set(zufall() * 0.3, 0.25, zufall() * 0.3);
    this.rauch.aussenden(_p, _v, { farbe: [0.82, 0.76, 0.66], groesse: 0.25, dauer: 0.6, wachsen: 1.5 });
  }

  /** Herzchen (Katze streicheln). */
  herzchen(pos) {
    for (let i = 0; i < 6; i++) {
      _p.set(pos.x + zufall() * 0.3, pos.y + Math.random() * 0.2, pos.z + zufall() * 0.3);
      _v.set(zufall() * 0.3, 0.8 + Math.random() * 0.6, zufall() * 0.3);
      this.herzen.aussenden(_p, _v, { farbe: [1, 0.35, 0.5], groesse: 0.35, dauer: 1.6, schwer: -0.1 });
    }
  }

  /** Magisches Auflösen (besiegter Boss). */
  aufloesen(pos, hoehe = 3, farbe = "#9af4ff") {
    const f = FARBE(farbe).map((x) => x * 1.5);
    for (let i = 0; i < 260 * this.menge; i++) {
      _p.set(pos.x + zufall() * 1.0, pos.y + Math.random() * hoehe, pos.z + zufall() * 1.0);
      _v.set(zufall() * 0.6, 1 + Math.random() * 2.5, zufall() * 0.6);
      this.funken.aussenden(_p, _v, { farbe: f, groesse: 0.08 + Math.random() * 0.16, dauer: 1.5 + Math.random() * 1.5, schwer: -0.5 });
    }
  }

  /** Funkeln an einer Stelle (Zielpunkt beim Tippen). */
  ziel(pos) {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      _p.set(pos.x + Math.cos(a) * 0.35, 0.08, pos.z + Math.sin(a) * 0.35);
      _v.set(Math.cos(a) * 0.4, 0.6, Math.sin(a) * 0.4);
      this.funken.aussenden(_p, _v, { farbe: [1.2, 1.0, 0.5], groesse: 0.1, dauer: 0.5 });
    }
  }
}

// ---------- Wind im Gras ----------

/** Lässt Halme und Blumen im Wind wiegen (Vertex-Shader, nur für InstancedMesh). */
export function windMaterial(material, staerke = 0.08, hoehe = 0.3) {
  const zeit = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.windZeit = zeit;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float windZeit;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 wp = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        #else
          vec2 wp = vec2(0.0);
        #endif
        float wk = clamp(position.y / ${hoehe.toFixed(3)}, 0.0, 1.0);
        float welle = sin(windZeit * 1.9 + wp.x * 0.35 + wp.y * 0.21) + 0.45 * sin(windZeit * 3.7 + wp.x * 1.3);
        transformed.x += welle * ${staerke.toFixed(3)} * wk * wk;
        transformed.z += cos(windZeit * 1.4 + wp.y * 0.4) * ${(staerke * 0.5).toFixed(3)} * wk * wk;`);
  };
  material.customProgramCacheKey = () => `wind${staerke}|${hoehe}`;
  return zeit;
}

// ---------- Schmetterlinge ----------

function fluegelTextur(farbe, muster) {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const g = c.getContext("2d");
  const f = new THREE.Color(farbe);
  const dunkel = f.clone().multiplyScalar(0.35).getStyle();
  g.fillStyle = f.getStyle();
  g.strokeStyle = dunkel; g.lineWidth = 3;
  // Vorder- und Hinterflügel (rechte Hälfte, Körper links)
  g.beginPath(); g.moveTo(2, 30); g.bezierCurveTo(20, 0, 60, 2, 58, 22); g.bezierCurveTo(56, 32, 30, 34, 2, 32); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(2, 33); g.bezierCurveTo(30, 34, 46, 50, 34, 60); g.bezierCurveTo(24, 66, 8, 50, 2, 36); g.fill(); g.stroke();
  g.fillStyle = muster;
  g.beginPath(); g.arc(40, 16, 6, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(24, 48, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = dunkel; g.beginPath(); g.arc(40, 16, 2.5, 0, Math.PI * 2); g.fill();
  return textur(c);
}

export function schmetterlingeBauen(szene, raster, anzahl, animationen) {
  const blumen = [];
  raster.forEach((z, ty) => [...z].forEach((c, tx) => { if (c === "F") blumen.push([welt(tx), welt(ty)]); }));
  if (!blumen.length) return;
  const arten = [["#ffb030", "#fff4c0"], ["#5aa8ff", "#e8f4ff"], ["#ff6aa8", "#ffe0f0"], ["#f8f4e8", "#ffcc40"], ["#b07aff", "#f0e0ff"]];
  const geo = new THREE.PlaneGeometry(0.34, 0.34);
  geo.translate(0.17, 0, 0);
  geo.rotateX(-Math.PI / 2);
  const tiere = [];
  for (let i = 0; i < anzahl; i++) {
    const [farbe, muster] = arten[i % arten.length];
    const m = new THREE.MeshStandardMaterial({ map: fluegelTextur(farbe, muster), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.8, emissive: new THREE.Color(farbe).multiplyScalar(0.25) });
    const g = new THREE.Group();
    const rechts = new THREE.Mesh(geo, m);
    const links = new THREE.Mesh(geo, m);
    links.scale.x = -1;
    const koerper = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.12, 3, 6).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#2a2018" }));
    g.add(rechts, links, koerper);
    rechts.castShadow = links.castShadow = true;
    g.scale.setScalar(0.85 + hash(i, 1, 3) * 0.4);
    szene.add(g);
    const start = blumen[i % blumen.length];
    tiere.push({ g, rechts, links, pos: new THREE.Vector3(start[0], 1, start[1]), ziel: new THREE.Vector3(start[0], 1, start[1]), sitzen: 0, phase: i * 1.3, tempo: 1.1 + hash(i, 2, 3) * 0.6 });
  }
  const neuesZiel = (t, i) => {
    const b = blumen[Math.floor(Math.random() * blumen.length)];
    t.ziel.set(b[0] + (Math.random() - 0.5) * 3, 0.5 + Math.random() * 1.6, b[1] + (Math.random() - 0.5) * 3);
    if (Math.random() < 0.35) t.ziel.y = 0.38;   // Landen auf einer Blume
  };
  tiere.forEach(neuesZiel);
  animationen.push((zeit, dt = 0.016) => {
    tiere.forEach((t, i) => {
      if (t.sitzen > 0) {
        t.sitzen -= dt;
        const s = 0.25 + Math.sin(zeit * 2 + i) * 0.25;
        t.rechts.rotation.z = s; t.links.rotation.z = -s;
        if (t.sitzen <= 0) neuesZiel(t, i);
        return;
      }
      _v.subVectors(t.ziel, t.pos);
      const d = _v.length();
      if (d < 0.2) {
        if (t.ziel.y < 0.45) t.sitzen = 2 + Math.random() * 4;
        else neuesZiel(t, i);
        return;
      }
      _v.normalize();
      t.pos.addScaledVector(_v, Math.min(d, t.tempo * dt));
      const bob = Math.sin(zeit * 9 + t.phase) * 0.08;
      t.g.position.set(t.pos.x + Math.sin(zeit * 2.3 + t.phase) * 0.15, t.pos.y + bob, t.pos.z);
      t.g.rotation.y = Math.atan2(_v.x, _v.z);
      const f = Math.sin(zeit * 26 + t.phase) * 1.15;
      t.rechts.rotation.z = f; t.links.rotation.z = -f;
    });
  });
}

// ---------- Vögel ----------

export function voegelBauen(szene, mitte, anzahl, animationen) {
  const mat = new THREE.MeshStandardMaterial({ color: "#2a2a34", side: THREE.DoubleSide, roughness: 1 });
  const voegel = [];
  for (let i = 0; i < anzahl; i++) {
    const g = new THREE.Group();
    const koerper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 3, 6).rotateX(Math.PI / 2), mat);
    const fl = [];
    for (const s of [-1, 1]) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.28).translate(0.35, 0, 0).rotateX(-Math.PI / 2), mat);
      if (s < 0) f.scale.x = -1;
      g.add(f); fl.push(f);
    }
    g.add(koerper);
    szene.add(g);
    voegel.push({ g, fl, r: 18 + hash(i, 1, 8) * 16, h: 16 + hash(i, 2, 8) * 10, v: 0.12 + hash(i, 3, 8) * 0.08, phase: hash(i, 4, 8) * 6 });
  }
  animationen.push((zeit) => {
    for (const b of voegel) {
      const a = zeit * b.v + b.phase;
      b.g.position.set(mitte.x + Math.cos(a) * b.r, b.h + Math.sin(zeit * 0.5 + b.phase) * 1.5, mitte.z + Math.sin(a) * b.r);
      b.g.rotation.set(0, -a, 0.3);
      const f = Math.sin(zeit * 8 + b.phase) * 0.6 * (Math.sin(zeit * 0.7 + b.phase) > -0.2 ? 1 : 0.1);
      b.fl[0].rotation.z = -f; b.fl[1].rotation.z = f;
    }
  });
}

// ---------- Fallende Blätter ----------

export function blaetterBauen(szene, raster, anzahl, animationen) {
  const baeume = [];
  raster.forEach((z, ty) => [...z].forEach((c, tx) => { if (c === "T") baeume.push([welt(tx), welt(ty)]); }));
  if (!baeume.length) return;
  const geo = new THREE.PlaneGeometry(0.16, 0.1);
  const farben = ["#7aa83a", "#c8a030", "#a8c048", "#d87a30"];
  const blaetter = [];
  for (let i = 0; i < anzahl; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: farben[i % farben.length], side: THREE.DoubleSide }));
    szene.add(m);
    const b = { m, pos: new THREE.Vector3(), phase: Math.random() * 6, tempo: 0.5 + Math.random() * 0.4 };
    const neu = () => {
      const [x, z] = baeume[Math.floor(Math.random() * baeume.length)];
      b.pos.set(x + (Math.random() - 0.5) * 2, 2.5 + Math.random() * 2, z + (Math.random() - 0.5) * 2);
    };
    b.neu = neu;
    neu();
    b.pos.y = Math.random() * 4;
    blaetter.push(b);
  }
  animationen.push((zeit, dt = 0.016) => {
    for (const b of blaetter) {
      b.pos.y -= b.tempo * dt;
      b.pos.x += Math.sin(zeit * 1.3 + b.phase) * dt * 0.6 + dt * 0.3;
      b.pos.z += Math.cos(zeit * 1.1 + b.phase) * dt * 0.4;
      if (b.pos.y < 0.02) { b.pos.y = 0.02; b.liegen = (b.liegen ?? 0) + dt; if (b.liegen > 3) { b.liegen = 0; b.neu(); } }
      b.m.position.copy(b.pos);
      if (b.pos.y > 0.03) b.m.rotation.set(zeit * 2 + b.phase, zeit * 1.3, Math.sin(zeit * 3 + b.phase));
      else b.m.rotation.set(-Math.PI / 2, 0, b.phase);
    }
  });
}

// ---------- Pollen und Glitzern ----------

/** Schwebende Lichtpünktchen (Pollen über Wiesen, Glitzern auf dem Wasser). */
export function lichtpunkteBauen(szene, orte, { farbe = "#fff6c0", groesse = 0.12, hoehe = [0.3, 2.2], streuung = 1.6, funkeln = false, anzahl = 160 }, animationen) {
  if (!orte.length) return;
  texturen();
  const n = anzahl;
  const pos = new Float32Array(n * 3), basis = new Float32Array(n * 3);
  const alpha = new Float32Array(n), gr = new Float32Array(n), fa = new Float32Array(n * 3);
  const c = new THREE.Color(farbe);
  for (let i = 0; i < n; i++) {
    const [x, z] = orte[i % orte.length];
    basis[i * 3] = x + (hash(i, 1, 51) - 0.5) * streuung * 2;
    basis[i * 3 + 1] = hoehe[0] + hash(i, 2, 51) * (hoehe[1] - hoehe[0]);
    basis[i * 3 + 2] = z + (hash(i, 3, 51) - 0.5) * streuung * 2;
    gr[i] = groesse * (0.6 + hash(i, 4, 51) * 0.8);
    fa.set([c.r * 1.3, c.g * 1.3, c.b * 1.3], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("alpha", new THREE.BufferAttribute(alpha, 1));
  g.setAttribute("groesse", new THREE.BufferAttribute(gr, 1));
  g.setAttribute("farbe", new THREE.BufferAttribute(fa, 3));
  const p = new THREE.Points(g, punktMaterial(funkenTex, true));
  p.frustumCulled = false;
  szene.add(p);
  animationen.push((zeit) => {
    for (let i = 0; i < n; i++) {
      if (funkeln) {
        pos[i * 3] = basis[i * 3]; pos[i * 3 + 1] = basis[i * 3 + 1]; pos[i * 3 + 2] = basis[i * 3 + 2];
        const s = Math.sin(zeit * (2 + (i % 5)) + i * 7.1);
        alpha[i] = s > 0.82 ? (s - 0.82) * 5.5 : 0;
      } else {
        pos[i * 3] = basis[i * 3] + Math.sin(zeit * 0.3 + i) * 0.5;
        pos[i * 3 + 1] = basis[i * 3 + 1] + Math.sin(zeit * 0.5 + i * 1.7) * 0.25;
        pos[i * 3 + 2] = basis[i * 3 + 2] + Math.cos(zeit * 0.27 + i * 0.6) * 0.5;
        alpha[i] = 0.35 + Math.sin(zeit * 1.5 + i) * 0.3;
      }
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.alpha.needsUpdate = true;
  });
  return p;
}

