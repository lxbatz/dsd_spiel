// Runde Polygonfiguren für die 3D-Version.
// Jede Figur besteht aus wenigen Gelenk-Gruppen (Becken, Oberkörper, Kopf, Arme, Beine).
// Pro Gruppe werden alle Formen zu EINEM Mesh mit Vertexfarben zusammengefügt
// (glatte Schattierung, wenige Zeichenaufrufe). Das Aussehen kommt aus AUSSEHEN (grafik16/figuren.js),
// damit Porträts und Figuren zusammenpassen.

import * as THREE from "../../vendor/three.module.min.js";
import { PORTRAITS } from "../grafik16/portraits.js";

// ---------- Materialien ----------

const materialien = new Map();
/** Einfaches, zwischengespeichertes Material für Welt-Objekte. */
export function mat(farbe, opt = {}) {
  const key = `${farbe}|${JSON.stringify(opt)}`;
  if (!materialien.has(key)) {
    materialien.set(key, new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.85, flatShading: true, ...opt }));
  }
  return materialien.get(key);
}

const FIGUR_MAT = {
  matt: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0 }),
  stoff: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }),
  glanz: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.75 }),
  leucht: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
};

// ---------- Formen-Sammler ----------

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color(), _c2 = new THREE.Color();

const geoCache = new Map();
function geo(key, bauen) {
  if (!geoCache.has(key)) geoCache.set(key, bauen());
  return geoCache.get(key);
}
const KUGEL = () => geo("kugel", () => new THREE.SphereGeometry(1, 22, 16));
const KUGEL_K = () => geo("kugelk", () => new THREE.SphereGeometry(1, 12, 9));
const ZYL = (oben = 1, unten = 1, seg = 16) => geo(`zyl${oben}|${unten}|${seg}`, () => new THREE.CylinderGeometry(oben, unten, 1, seg));
const KAPSEL = () => geo("kapsel", () => new THREE.CapsuleGeometry(1, 1, 6, 14));
const RING = (dicke = 0.25, bogen = Math.PI * 2) => geo(`ring${dicke}|${bogen}`, () => new THREE.TorusGeometry(1, dicke, 10, 28, bogen));
const KASTEN = () => geo("kasten", () => new THREE.BoxGeometry(1, 1, 1));
const KEGEL = (seg = 16) => geo(`kegel${seg}`, () => new THREE.ConeGeometry(1, 1, seg));
const V = (x, y) => new THREE.Vector2(x, y);
const DREH = (punkte, seg = 22, key, phiStart = 0, phiLaenge = Math.PI * 2) =>
  geo(key ?? `dreh${punkte.map((p) => p.x.toFixed(3) + "," + p.y.toFixed(3)).join(";")}|${seg}`, () => new THREE.LatheGeometry(punkte, seg, phiStart, phiLaenge));

/** Sammelt Formen und fügt sie pro Material zu einem Mesh zusammen. */
class Teile {
  constructor() { this.listen = {}; }

  /**
   * form:  Geometrie (Einheitsgröße), farbe: Hex-Farbe
   * p, r, s: Position, Drehung (Euler), Größe (Zahl oder [x,y,z])
   * opt.art: matt | stoff | glanz | leucht, opt.verlauf: Abdunkeln nach unten (0..1)
   */
  add(form, farbe, p = [0, 0, 0], r = [0, 0, 0], s = 1, opt = {}) {
    const sk = typeof s === "number" ? [s, s, s] : s;
    _m.compose(_p.set(p[0], p[1], p[2]), _q.setFromEuler(_e.set(r[0], r[1], r[2], r[3] ?? "XYZ")), _s.set(sk[0], sk[1], sk[2]));
    const g = form.clone().applyMatrix4(_m);
    const pos = g.attributes.position;
    const n = pos.count;
    const farben = new Float32Array(n * 3);
    _c.set(farbe);
    const verlauf = opt.verlauf ?? 0;
    let y0 = 0, y1 = 1;
    if (verlauf) { g.computeBoundingBox(); y0 = g.boundingBox.min.y; y1 = g.boundingBox.max.y; }
    const ziel = opt.zu ? _c2.set(opt.zu) : null;
    for (let i = 0; i < n; i++) {
      let r0 = _c.r, g0 = _c.g, b0 = _c.b;
      if (verlauf || ziel) {
        const t = (pos.getY(i) - y0) / Math.max(1e-5, y1 - y0);
        if (ziel) { r0 += (ziel.r - r0) * (1 - t); g0 += (ziel.g - g0) * (1 - t); b0 += (ziel.b - b0) * (1 - t); }
        const k = 1 - verlauf * (1 - t);
        r0 *= k; g0 *= k; b0 *= k;
      }
      farben[i * 3] = r0; farben[i * 3 + 1] = g0; farben[i * 3 + 2] = b0;
    }
    g.setAttribute("color", new THREE.BufferAttribute(farben, 3));
    const art = opt.art ?? "matt";
    (this.listen[art] ??= []).push(g);
    return this;
  }

  /** Fügt die gesammelten Formen als Meshes in die Gruppe ein. */
  in(gruppe, { schatten = true } = {}) {
    for (const [art, liste] of Object.entries(this.listen)) {
      if (!liste.length) continue;
      const m = new THREE.Mesh(zusammenfuegen(liste), FIGUR_MAT[art]);
      m.castShadow = schatten && art !== "leucht";
      m.receiveShadow = art !== "leucht";
      m.userData.figur = true;
      gruppe.add(m);
    }
    this.listen = {};
    return gruppe;
  }
}

function zusammenfuegen(liste) {
  let nv = 0, ni = 0;
  for (const g of liste) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
  const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let vo = 0, io = 0;
  for (const g of liste) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, vo * 3);
    nor.set(g.attributes.normal.array, vo * 3);
    col.set(g.attributes.color.array, vo * 3);
    if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) idx[io + i] = a[i] + vo; io += a.length; }
    else { for (let i = 0; i < n; i++) idx[io + i] = vo + i; io += n; }
    vo += n;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}

function gruppe(eltern, x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  eltern.add(g);
  return g;
}

export function farbeMal(hex, f) {
  return `#${new THREE.Color(hex).multiplyScalar(f).getHexString()}`;
}
const dunkler = (hex, f = 0.75) => farbeMal(hex, f);
const heller = (hex, k = 0.25) => `#${new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), k).getHexString()}`;

/** Glied: verjüngter Zylinder von oben (0) nach unten (-laenge) mit runden Enden. */
function glied(t, farbe, laenge, rOben, rUnten, opt = {}) {
  t.add(ZYL(rOben / rUnten, 1), farbe, [0, -laenge / 2, 0], [0, 0, 0], [rUnten, laenge, rUnten], opt);
  t.add(KUGEL_K(), farbe, [0, 0, 0], [0, 0, 0], rOben, opt);
  t.add(KUGEL_K(), farbe, [0, -laenge, 0], [0, 0, 0], rUnten, opt);
}

// ---------- Maße ----------

const HUEFTE = 0.86;      // Höhe der Hüftgelenke
const OBERSCHENKEL = 0.38;
const UNTERSCHENKEL = 0.36;
const RUMPF_Y = 0.96;     // Unterkante des Oberkörpers
const SCHULTER_Y = 0.44;  // relativ zum Oberkörper
const KOPF_Y = 0.6;       // relativ zum Oberkörper
const KOPF_R = 0.27;
const KOPF_MITTE = 0.25;  // Schädelmitte relativ zur Kopfgruppe

/** Punkt auf der Gesichtsoberfläche (Kopfgruppe), etwas hervorgehoben. */
/** Radius des eiförmigen Kopfes in der Höhe dy über der Schädelmitte. */
function kopfRadius(dy) {
  if (dy >= 0) return KOPF_R * Math.sqrt(Math.max(0, 1 - (dy / 0.285) ** 2));
  const u = dy / 0.3;
  return KOPF_R * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.22 * u * u);
}
const KOPF_PROFIL = Array.from({ length: 25 }, (_, i) => {
  const dy = 0.285 - (i / 24) * 0.585;
  return V(i === 0 || i === 24 ? 0 : kopfRadius(dy), dy);
}).reverse();
function aufGesicht(x, y, aussen = 0) {
  const r = kopfRadius(y - KOPF_MITTE);
  const z = Math.sqrt(Math.max(0, r * r - x * x)) * 0.98;
  return [x, y, z + aussen];
}

// ---------- Figur ----------

/**
 * Baut eine Figur aus einer AUSSEHEN-Beschreibung.
 * Liefert { gruppe, animieren(zeit, tempo, dt), kopf, sprechen(an) }.
 * Ursprung: zwischen den Füßen, Blick in Richtung +z.
 */
export function figurBauen(d, schluessel = null) {
  const p = (schluessel && PORTRAITS[schluessel]) || {};
  const wurzel = new THREE.Group();
  const koerperGanz = gruppe(wurzel);      // federt beim Gehen
  const t = new Teile();
  const robe = Boolean(d.robe);
  const akzentArt = /^#(e0b040|e6c45a|c9c9d6|d0a030)$/i.test(d.akzent) ? "glanz" : "stoff";

  // ----- Beine -----
  const beine = [], knie = [];
  for (const seite of [-1, 1]) {
    const bein = gruppe(koerperGanz, seite * 0.115, HUEFTE, 0);
    glied(t, d.hose, OBERSCHENKEL, 0.095, 0.072, { art: "stoff" });
    t.in(bein);
    const k = gruppe(bein, 0, -OBERSCHENKEL, 0);
    glied(t, d.hose, UNTERSCHENKEL * 0.5, 0.07, 0.064, { art: "stoff" });
    // Stiefel: Schaft mit Umschlag und runder Fuß
    t.add(ZYL(1, 1), d.stiefel, [0, -UNTERSCHENKEL * 0.62, 0], [0, 0, 0], [0.074, UNTERSCHENKEL * 0.6, 0.078]);
    t.add(ZYL(1, 1), heller(d.stiefel, 0.12), [0, -UNTERSCHENKEL * 0.33, 0], [0, 0, 0], [0.084, 0.05, 0.088]);
    t.add(KUGEL(), d.stiefel, [0, -UNTERSCHENKEL - 0.02, 0.05], [0, 0, 0], [0.088, 0.07, 0.15]);
    t.add(ZYL(1, 1), dunkler(d.stiefel, 0.55), [0, -UNTERSCHENKEL - 0.075, 0.05], [0, 0, 0], [0.086, 0.025, 0.145]);
    t.in(k);
    beine.push(bein); knie.push(k);
    if (robe) bein.visible = false;
  }

  // ----- Becken (Rock, Gürtel, Robe) -----
  const becken = gruppe(koerperGanz, 0, 0, 0);
  t.add(DREH([V(0, 0.76), V(0.17, 0.77), V(0.205, 0.84), V(0.21, 0.92), V(0.2, 0.99), V(0, 0.99)]), d.hose, [0, 0, 0], [0, 0, 0], [1, 1, 0.78], { art: "stoff" });
  if (robe) {
    t.add(DREH([V(0, 1.0), V(0.205, 1.0), V(0.225, 0.8), V(0.27, 0.5), V(0.33, 0.2), V(0.37, 0.06), V(0.35, 0.03), V(0, 0.03)], 26),
      d.kleid, [0, 0, 0], [0, 0, 0], [1, 1, 0.86], { art: "stoff", verlauf: 0.3 });
    t.add(RING(0.07), d.akzent, [0, 0.065, 0], [Math.PI / 2, 0, 0], [0.368, 0.318, 0.6], { art: akzentArt });
    // Füße schauen unter der Robe hervor
    for (const seite of [-1, 1]) t.add(KUGEL(), d.stiefel, [seite * 0.11, 0.045, 0.25], [0, 0, 0], [0.075, 0.05, 0.1]);
  } else {
    // Tunika-Rock bis über die Knie
    t.add(DREH([V(0.2, 1.0), V(0.215, 0.88), V(0.245, 0.74), V(0.27, 0.64), V(0.255, 0.62), V(0, 0.62)], 24),
      d.kleid, [0, 0, 0], [0, 0, 0], [1, 1, 0.82], { art: "stoff", verlauf: 0.25 });
  }
  if (d.schuerze) {
    const lang = robe ? 0.8 : 0.42;
    t.add(DREH([V(0.235, 1.0), V(0.25, 1.0 - lang * 0.5), V(0.3, 1.0 - lang), V(0.29, 0.99 - lang)], 12, `schuerze${robe}`, -Math.PI * 0.3, Math.PI * 0.6),
      d.schuerze, [0, 0.02, 0], [0, 0, 0], [1, 1, 0.9], { art: "stoff" });
  }
  // Gürtel mit Schnalle
  t.add(RING(0.16), d.akzent, [0, 0.995, 0], [Math.PI / 2, 0, 0], [0.212, 0.168, 0.35], { art: akzentArt });
  t.add(KASTEN(), "#e0c070", [0, 0.995, 0.17], [0, 0, 0], [0.07, 0.055, 0.025], { art: "glanz" });
  t.add(KASTEN(), dunkler(d.akzent, 0.6), [0, 0.995, 0.182], [0, 0, 0], [0.035, 0.025, 0.01]);
  if (d.schuerze && !robe) t.add(KASTEN(), d.schuerze, [0, 1.12, 0.16], [0.08, 0, 0], [0.26, 0.26, 0.02], { art: "stoff" });
  t.in(becken);

  // ----- Oberkörper -----
  const rumpf = gruppe(koerperGanz, 0, RUMPF_Y, 0);
  t.add(DREH([V(0, 0), V(0.195, 0), V(0.19, 0.1), V(0.215, 0.26), V(0.235, 0.38), V(0.225, 0.46), V(0.17, 0.52), V(0.09, 0.55), V(0, 0.555)], 24),
    d.kleid, [0, 0, 0], [0, 0, 0], [1.05, 1, 0.72], { art: "stoff", verlauf: 0.18 });
  if (d.schuerze) t.add(KASTEN(), d.schuerze, [0, 0.2, 0.165], [-0.12, 0, 0], [0.28, 0.32, 0.02], { art: "stoff" });
  // Kragen / Ausschnitt
  if (robe) {
    for (const s of [-1, 1]) t.add(KAPSEL(), d.akzent, [s * 0.058, 0.43, 0.15], [-0.35, 0, -s * 0.62], [0.02, 0.09, 0.02], { art: akzentArt });
    t.add(KUGEL_K(), d.haut, [0, 0.47, 0.12], [0, 0, 0], [0.07, 0.06, 0.03]);
  } else {
    t.add(RING(0.38), d.akzent, [0, 0.52, 0], [Math.PI / 2 + 0.15, 0, 0], [0.12, 0.1, 0.12], { art: akzentArt });
  }
  // Knöpfe oder Schnürung
  if (!robe && !d.schuerze) for (let i = 0; i < 3; i++) t.add(KUGEL_K(), d.akzent, [0, 0.12 + i * 0.1, 0.168 + Math.sin(i) * 0.003], [0, 0, 0], 0.017, { art: akzentArt });
  // Hals
  t.add(ZYL(0.9, 1), d.haut, [0, 0.58, 0], [0, 0, 0], [0.075, 0.14, 0.075]);
  t.in(rumpf);

  // ----- Arme -----
  const arme = [], ellbogen = [];
  for (const seite of [-1, 1]) {
    const arm = gruppe(rumpf, seite * 0.27, SCHULTER_Y, 0);
    arm.rotation.z = seite * 0.1;
    const aermel = d.armeHaut ? d.haut : d.kleid;
    t.add(KUGEL(), d.kleid, [0, -0.01, 0], [0, 0, 0], [0.09, 0.085, 0.085], { art: "stoff" });
    glied(t, aermel, 0.27, 0.07, 0.058, { art: d.armeHaut ? "matt" : "stoff" });
    if (d.armeHaut) t.add(RING(0.4), d.kleid, [0, -0.06, 0], [Math.PI / 2, 0, 0], [0.085, 0.085, 0.12], { art: "stoff" });
    t.in(arm);
    const e = gruppe(arm, 0, -0.27, 0);
    e.rotation.x = -0.18;
    glied(t, d.armeHaut ? d.haut : d.kleid, 0.24, 0.058, 0.05, { art: d.armeHaut ? "matt" : "stoff" });
    if (robe && !d.armeHaut) t.add(DREH([V(0.06, 0.0), V(0.085, -0.16), V(0.105, -0.25), V(0.095, -0.26), V(0.05, -0.12)], 14, "aermelrobe"), d.kleid, [0, 0, 0], [0, 0, 0], 1, { art: "stoff" });
    t.add(RING(0.35), d.akzent, [0, -0.215, 0], [Math.PI / 2, 0, 0], [0.056, 0.056, 0.12], { art: akzentArt });
    // Hand mit Daumen
    t.add(KUGEL(), d.haut, [0, -0.29, 0.005], [0, 0, 0], [0.052, 0.068, 0.045]);
    t.add(KAPSEL(), d.haut, [seite * -0.03, -0.27, 0.035], [0.4, 0, seite * 0.6], [0.018, 0.035, 0.018]);
    t.in(e);
    arme.push(arm); ellbogen.push(e);
  }

  // ----- Kopf -----
  const kopf = gruppe(rumpf, 0, KOPF_Y, 0);
  const haut = d.haut;
  t.add(DREH(KOPF_PROFIL, 30, "kopf"), haut, [0, KOPF_MITTE, 0], [0, 0, 0], [1, 1, 0.98]);
  for (const s of [-1, 1]) {
    t.add(KUGEL_K(), haut, [s * 0.262, KOPF_MITTE, -0.01], [0, 0, 0], [0.04, 0.066, 0.05]);           // Ohr
    t.add(KUGEL_K(), dunkler(haut, 0.82), [s * 0.274, KOPF_MITTE - 0.005, -0.005], [0, 0, 0], [0.018, 0.04, 0.03]);
  }
  // Nase
  t.add(KUGEL_K(), heller(haut, 0.05), aufGesicht(0, 0.19, 0.006), [0, 0, 0], [0.04, 0.045, 0.05]);
  for (const s of [-1, 1]) t.add(KUGEL_K(), dunkler(haut, 0.86), aufGesicht(s * 0.025, 0.17, 0.005), [0, 0, 0], [0.018, 0.016, 0.02]);
  // Mund
  const ausdruck = p.ausdruck ?? "froh";
  const lippe = new THREE.Color(haut).lerp(new THREE.Color("#a03040"), 0.45).getHexString();
  if (ausdruck === "froh" || ausdruck === "neugierig") {
    t.add(RING(0.22, Math.PI), `#${lippe}`, aufGesicht(0, 0.115, -0.006), [0, 0, Math.PI], [0.05, 0.034, 0.03]);
  } else if (ausdruck === "mutig") {
    t.add(RING(0.22, Math.PI * 0.8), `#${lippe}`, aufGesicht(0.012, 0.11, -0.006), [0, 0, Math.PI + 0.25], [0.045, 0.026, 0.03]);
  } else {
    t.add(KAPSEL(), `#${lippe}`, aufGesicht(0, 0.105, -0.004), [0, 0, Math.PI / 2], [0.009, 0.05, 0.009]);
  }
  // Wangenrot
  if (d.wangen || ausdruck === "froh") for (const s of [-1, 1]) t.add(KUGEL_K(), new THREE.Color(haut).lerp(new THREE.Color("#ff6a7a"), 0.35).getStyle(), aufGesicht(s * 0.145, 0.15, -0.012), [0, s * 0.5, 0], [0.045, 0.028, 0.02]);
  // Augenbrauen
  const brauenFarbe = d.frisur === "glatze" && d.bartfarbe ? d.bartfarbe : (d.bart ? d.bartfarbe : d.haare);
  for (const s of [-1, 1]) {
    const neigung = ausdruck === "mutig" ? s * 0.32 : ausdruck === "neugierig" ? s * -0.18 : s * -0.08;
    const dick = p.alt || d.bart ? 0.02 : 0.014;
    t.add(KAPSEL(), brauenFarbe, aufGesicht(s * 0.095, 0.335, -0.004), [0, s * 0.35, Math.PI / 2 + neigung], [dick, 0.06, dick]);
  }
  // Falten bei Älteren
  if (p.alt) for (const s of [-1, 1]) t.add(KAPSEL(), dunkler(haut, 0.8), aufGesicht(s * 0.17, 0.24, -0.006), [0, s * 0.6, 0.4 * s], [0.006, 0.03, 0.006]);
  // Ohrringe
  if (p.ohrringe) for (const s of [-1, 1]) t.add(RING(0.3), "#e0b040", [s * 0.27, KOPF_MITTE - 0.075, 0.0], [0, Math.PI / 2, 0], 0.022, { art: "glanz" });
  // Ruß beim Schmied
  if (p.russ) for (const [x, y] of [[-0.12, 0.17], [0.15, 0.3], [0.1, 0.13]]) t.add(KUGEL_K(), dunkler(haut, 0.6), aufGesicht(x, y, -0.008), [0, 0, 0], [0.02, 0.015, 0.012]);
  t.in(kopf);

  // Augen (eigene Gruppe zum Blinzeln)
  const augen = gruppe(kopf, 0, 0.27, 0);
  const iris = p.augen ?? "#4a6a3a";
  for (const s of [-1, 1]) {
    const [x, y, z] = aufGesicht(s * 0.092, 0.27, -0.016);
    const dreh = [0, Math.asin((s * 0.092) / KOPF_R) * 0.9, 0];
    t.add(KUGEL(), "#f6f2ee", [x, y - 0.27, z], dreh, [0.05, 0.058, 0.03]);
    t.add(KUGEL_K(), iris, [x - s * 0.006, y - 0.27 - 0.004, z + 0.022], dreh, [0.031, 0.036, 0.012]);
    t.add(KUGEL_K(), "#120a14", [x - s * 0.006, y - 0.27 - 0.004, z + 0.03], dreh, [0.016, 0.019, 0.006]);
    t.add(KUGEL_K(), "#ffffff", [x - s * 0.016, y - 0.27 + 0.014, z + 0.036], dreh, 0.008, { art: "leucht" });
    // Oberlid / Wimpernlinie
    const lid = ausdruck === "weise" ? 0.012 : 0.04;
    t.add(RING(0.3, Math.PI), dunkler(d.haare === "#e6e2d8" ? "#8a7a6a" : d.haare, 0.6), [x, y - 0.27 + lid - 0.01, z + 0.004], [0, dreh[1], 0], [0.052, 0.03, 0.03]);
    if (ausdruck === "weise") t.add(KUGEL_K(), haut, [x, y - 0.27 + 0.035, z - 0.002], dreh, [0.056, 0.04, 0.035]);
  }
  t.in(augen, { schatten: false });

  // ----- Haare, Bart, Ausrüstung -----
  frisur(t, kopf, d);
  t.in(kopf, { schatten: false });
  bart(t, d);
  t.in(kopf);
  const extras = ausruestung(t, rumpf, arme, ellbogen, d);

  wurzel.traverse((o) => { if (o.isMesh) o.userData.figur = true; });

  // ----- Animation -----
  let phase = 0, blinzeln = 2 + Math.random() * 3, sprichtSeit = -1;
  const animieren = (zeit, tempo, dt = 0.016) => {
    if (tempo > 0.05) {
      phase += dt * 8.5 * Math.min(1.5, 0.6 + tempo * 0.7);
      const s = Math.sin(phase), c = Math.cos(phase);
      const amp = Math.min(1, tempo);
      beine[0].rotation.x = s * 0.62 * amp; beine[1].rotation.x = -s * 0.62 * amp;
      knie[0].rotation.x = Math.max(0, -c) * 0.9 * amp + 0.05; knie[1].rotation.x = Math.max(0, c) * 0.9 * amp + 0.05;
      arme[0].rotation.x = -s * 0.55 * amp; arme[1].rotation.x = s * 0.55 * amp;
      ellbogen[0].rotation.x = -0.35 - Math.max(0, s) * 0.4; ellbogen[1].rotation.x = -0.35 - Math.max(0, -s) * 0.4;
      koerperGanz.position.y = Math.abs(c) * 0.055 * amp - 0.02 * amp;
      rumpf.rotation.y = s * 0.12 * amp;
      rumpf.rotation.x = 0.06 * amp;
      becken.rotation.y = -s * 0.06 * amp;
      kopf.rotation.y = -s * 0.08 * amp;
      kopf.rotation.x = 0;
    } else {
      phase = 0;
      const k = Math.min(1, dt * 10);
      for (const b of beine) b.rotation.x -= b.rotation.x * k;
      for (const b of knie) b.rotation.x -= b.rotation.x * k;
      for (const a of arme) a.rotation.x -= a.rotation.x * k;
      for (const e of ellbogen) e.rotation.x += (-0.18 - e.rotation.x) * k;
      koerperGanz.position.y = Math.sin(zeit * 2.1) * 0.008;
      rumpf.rotation.y *= 1 - k; rumpf.rotation.x *= 1 - k; becken.rotation.y *= 1 - k;
      rumpf.scale.set(1 + Math.sin(zeit * 2.1) * 0.008, 1, 1);
      if (sprichtSeit >= 0) {
        // Beim Sprechen: nicken und mit einer Hand gestikulieren
        const st = zeit - sprichtSeit;
        kopf.rotation.x = Math.sin(st * 5.3) * 0.06;
        kopf.rotation.y = Math.sin(st * 1.7) * 0.1;
        arme[0].rotation.x = -0.5 - Math.sin(st * 3.1) * 0.15;
        ellbogen[0].rotation.x = -0.9 + Math.sin(st * 4.2) * 0.2;
      } else {
        kopf.rotation.y += (Math.sin(zeit * 0.45) * 0.18 - kopf.rotation.y) * k;
        kopf.rotation.x += (Math.sin(zeit * 0.3) * 0.03 - kopf.rotation.x) * k;
      }
    }
    // Blinzeln
    blinzeln -= dt;
    augen.scale.y = blinzeln < 0.12 ? 0.15 : 1;
    if (blinzeln < 0) blinzeln = 2.5 + Math.random() * 3.5;
    extras?.(zeit, dt);
  };
  const sprechen = (an, zeit = performance.now() / 1000) => { sprichtSeit = an ? zeit : -1; };
  return { gruppe: wurzel, animieren, kopf, sprechen };
}

// ---------- Frisuren ----------

function haarKappe(t, farbe, { r = 0.29, theta = 0.56, neigung = -0.52, y = KOPF_MITTE + 0.01 } = {}) {
  t.add(geo(`kappe${theta}`, () => new THREE.SphereGeometry(1, 26, 14, 0, Math.PI * 2, 0, Math.PI * theta)),
    farbe, [0, y, -0.012], [neigung, 0, 0], [r, r * 1.04, r * 1.02]);
}

function pony(t, farbe, n = 6, { hoehe = 0.39, breite = 0.2, laenge = 0.07 } = {}) {
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0 : i / (n - 1) - 0.5;
    const x = u * breite * 2;
    const [px, py, pz] = aufGesicht(x, hoehe - Math.abs(u) * 0.05, 0.01);
    t.add(KUGEL(), i % 2 ? farbe : heller(farbe, 0.06), [px, py, pz - 0.02], [0.5, u * 1.2, u * 0.6], [0.05, laenge, 0.045]);
  }
}

function frisur(t, kopf, d) {
  const f = d.frisur, h = d.haare;
  const glanz = heller(h, 0.18);
  if (f === "kurz" || f === "lockig" || f === "zopf" || f === "lang" || f === "dutt") {
    haarKappe(t, h);
    if (f !== "dutt") pony(t, h, f === "lockig" ? 7 : 6);
    else for (const s of [-1, 1]) t.add(KUGEL(), h, [s * 0.12, KOPF_MITTE + 0.17, 0.17], [0.3, 0, s * 0.8], [0.13, 0.06, 0.08]);
    // Koteletten
    for (const s of [-1, 1]) t.add(KUGEL(), h, [s * 0.245, KOPF_MITTE + 0.02, 0.06], [0, 0, 0], [0.045, 0.11, 0.06]);
  }
  if (f === "lockig") {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const hoch = 0.12 + Math.sin(i * 1.7) * 0.03;
      t.add(KUGEL_K(), i % 3 ? h : glanz, [Math.sin(a) * 0.255, KOPF_MITTE + hoch, Math.cos(a) * 0.24 - 0.04], [0, 0, 0], 0.075);
    }
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 0.6 + (i / 6) * Math.PI * 0.8;
      t.add(KUGEL_K(), h, [Math.sin(a) * 0.26, KOPF_MITTE - 0.06, Math.cos(a) * 0.24], [0, 0, 0], 0.07);
    }
  }
  if (f === "lang" || d.langhaar) {
    t.add(DREH([V(0.2, 0.36), V(0.285, 0.26), V(0.3, 0.05), V(0.29, -0.2), V(0.25, -0.33), V(0.2, -0.34)], 22, "langhaar", Math.PI * 0.3, Math.PI * 1.4),
      h, [0, KOPF_MITTE - 0.02, -0.06], [0, 0, 0], [1, 1, 0.8], { zu: dunkler(h, 0.85) });
    for (const s of [-1, 1]) {
      t.add(KAPSEL(), h, [s * 0.235, KOPF_MITTE - 0.15, 0.08], [0.1, 0, s * 0.06], [0.05, 0.2, 0.05]);
      t.add(KAPSEL(), glanz, [s * 0.26, KOPF_MITTE - 0.13, 0.0], [0, 0, s * 0.04], [0.035, 0.22, 0.035]);
    }
  }
  if (f === "zopf") {
    for (let i = 0; i < 6; i++) {
      t.add(KUGEL_K(), i % 2 ? h : glanz, [0, KOPF_MITTE + 0.05 - i * 0.085, -0.29 - i * 0.022], [0, 0, 0], [0.065 - i * 0.004, 0.06, 0.06]);
    }
    t.add(KUGEL_K(), d.akzent, [0, KOPF_MITTE - 0.48, -0.42], [0, 0, 0], 0.035);
  }
  if (f === "dutt") {
    t.add(KUGEL(), h, [0, KOPF_MITTE + 0.24, -0.1], [0, 0, 0], [0.13, 0.12, 0.12]);
    t.add(RING(0.2, Math.PI * 1.5), glanz, [0, KOPF_MITTE + 0.24, -0.1], [Math.PI / 2, 0, 0], [0.11, 0.11, 0.2]);
    t.add(RING(0.25), d.akzent, [0, KOPF_MITTE + 0.18, -0.07], [Math.PI / 2 - 0.4, 0, 0], [0.105, 0.105, 0.15]);
    t.add(RING(0.08), d.akzent, [0, KOPF_MITTE + 0.1, 0], [Math.PI / 2 - 0.32, 0, 0], [0.292, 0.292, 0.3]);
  }
  if (f === "glatze") {
    t.add(RING(0.2, Math.PI * 1.05), h, [0, KOPF_MITTE - 0.01, -0.01], [Math.PI / 2 - 0.12, 0, Math.PI * 0.975], [0.262, 0.262, 0.32]);
    t.add(KUGEL_K(), heller(d.haut, 0.25), [-0.08, KOPF_MITTE + 0.22, 0.08], [0, 0, 0], [0.06, 0.03, 0.05], { art: "matt" });
  }
  if (f === "kapuze") {
    const stoff = d.kapuze;
    // Strähnen unter der Kapuze
    pony(t, h, 5, { hoehe: 0.37, breite: 0.17 });
    // Kapuze: offene Kugelschale um den Kopf
    t.add(geo("kapuze", () => new THREE.SphereGeometry(1, 26, 16, Math.PI * 0.76, Math.PI * 1.48, 0, Math.PI * 0.7)),
      stoff, [0, KOPF_MITTE + 0.01, -0.01], [0, 0, 0], [0.335, 0.35, 0.335], { art: "stoff" });
    t.add(RING(0.18, Math.PI * 1.15), dunkler(stoff, 0.8), [0, KOPF_MITTE + 0.0, 0.16], [0, 0, -Math.PI * 0.075], [0.3, 0.32, 0.25], { art: "stoff" });
    // Zipfel und Umhang über den Schultern
    t.add(KEGEL(), stoff, [0, KOPF_MITTE + 0.05, -0.36], [-1.9, 0, 0], [0.12, 0.3, 0.12], { art: "stoff" });
    t.add(DREH([V(0.12, 0.0), V(0.3, -0.12), V(0.42, -0.32), V(0.44, -0.36)], 24, "umhang"), stoff, [0, -0.02, -0.02], [0, 0, 0], [1, 1, 0.82], { art: "stoff", verlauf: 0.25 });
  }
  if (f === "spitzhut") {
    haarKappe(t, h, { theta: 0.58 });
    pony(t, h, 5, { hoehe: 0.37 });
    const hut = d.hut;
    // Krempe leicht gewellt, Spitze geknickt
    t.add(DREH([V(0.18, 0.02), V(0.42, 0.0), V(0.52, -0.035), V(0.54, -0.02), V(0.42, 0.025), V(0.18, 0.05)], 30, "krempe"),
      hut, [0, KOPF_MITTE + 0.17, -0.01], [-0.12, 0, 0], 1, { art: "stoff" });
    t.add(DREH([V(0.29, 0), V(0.26, 0.12), V(0.2, 0.26), V(0.13, 0.38), V(0.07, 0.48), V(0.02, 0.54), V(0, 0.55)], 24, "hutkegel"),
      hut, [0, KOPF_MITTE + 0.18, -0.03], [-0.16, 0, 0], 1, { art: "stoff", verlauf: 0.15 });
    t.add(KEGEL(14), hut, [0, KOPF_MITTE + 0.78, -0.2], [-0.95, 0, 0], [0.035, 0.22, 0.035], { art: "stoff" });
    t.add(ZYL(0.97, 1, 24), d.hutband, [0, KOPF_MITTE + 0.215, -0.035], [-0.16, 0, 0], [0.272, 0.06, 0.272], { art: "glanz" });
    // Sterne am Hut
    for (const [a, hy] of [[0.3, 0.33], [-0.5, 0.45], [1.2, 0.27]]) {
      const r = 0.25 - hy * 0.33;
      t.add(geo("stern", () => new THREE.OctahedronGeometry(1, 0)), "#ffe680", [Math.sin(a) * r, KOPF_MITTE + 0.18 + hy, Math.cos(a) * r - 0.03 - hy * 0.08], [0, a, 0], [0.025, 0.035, 0.01], { art: "leucht" });
    }
  }
}

function bart(t, d) {
  if (!d.bart) return;
  const b = d.bartfarbe, hell = heller(b, 0.15);
  if (d.bart === "lang") {
    t.add(DREH([V(0, -0.36), V(0.06, -0.33), V(0.14, -0.2), V(0.19, -0.05), V(0.2, 0.06), V(0.16, 0.12), V(0, 0.13)], 22, "bartlang"),
      b, [0, KOPF_MITTE - 0.13, 0.12], [0.25, 0, 0], [1, 1, 0.75]);
    for (let i = 0; i < 5; i++) t.add(KAPSEL(), i % 2 ? hell : b, [(i - 2) * 0.055, KOPF_MITTE - 0.36, 0.16 + Math.abs(i - 2) * -0.015], [0.2, 0, (i - 2) * 0.08], [0.03, 0.08, 0.03]);
    for (const s of [-1, 1]) t.add(KAPSEL(), hell, aufGesicht(s * 0.06, 0.13, 0.01), [0, 0, Math.PI / 2 + s * 0.35], [0.03, 0.06, 0.03]);
  } else {
    t.add(KUGEL(), b, [0, KOPF_MITTE - 0.12, 0.09], [0.2, 0, 0], [0.22, 0.17, 0.17]);
    for (const s of [-1, 1]) {
      t.add(KAPSEL(), hell, aufGesicht(s * 0.06, 0.135, 0.012), [0, 0, Math.PI / 2 + s * 0.4], [0.032, 0.055, 0.032]);
      for (let i = 0; i < 3; i++) t.add(KUGEL_K(), i % 2 ? hell : b, [s * 0.075, KOPF_MITTE - 0.28 - i * 0.07, 0.19 - i * 0.01], [0, 0, 0], [0.04, 0.045, 0.04]);
      t.add(RING(0.4), "#c8c8d0", [s * 0.075, KOPF_MITTE - 0.31, 0.19], [Math.PI / 2, 0, 0], [0.035, 0.035, 0.06], { art: "glanz" });
    }
  }
}

// ---------- Ausrüstung ----------

function ausruestung(t, rumpf, arme, ellbogen, d) {
  const holz = "#7a5230", holzHell = "#9a6a3e";
  const e = d.extra;
  let anim = null;
  if (e === "schwert") {
    // Schwert in der Scheide auf dem Rücken
    const s = gruppe(rumpf, 0.02, 0.24, -0.2);
    s.rotation.z = -0.65;
    t.add(ZYL(0.9, 1), "#5a3420", [0, -0.05, 0], [0, 0, 0], [0.045, 0.62, 0.025]);
    t.add(ZYL(1, 1), "#d0a030", [0, -0.34, 0], [0, 0, 0], [0.048, 0.05, 0.03], { art: "glanz" });
    t.add(KAPSEL(), "#d0a030", [0, 0.27, 0], [0, 0, Math.PI / 2], [0.03, 0.18, 0.03], { art: "glanz" });
    t.add(ZYL(1, 1), "#4a2a1a", [0, 0.35, 0], [0, 0, 0], [0.022, 0.13, 0.022]);
    t.add(KUGEL_K(), "#d0a030", [0, 0.43, 0], [0, 0, 0], 0.035, { art: "glanz" });
    t.in(s);
    // Riemen und Schulterpanzer
    t.add(RING(0.12), "#5a3420", [0, 0.28, 0], [Math.PI / 2 - 0.1, 0.6, 0], [0.235, 0.17, 0.2]);
    for (const seite of [-1, 1]) {
      t.add(geo("panzer", () => new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), "#c8ccd8", [seite * 0.29, SCHULTER_Y + 0.02, 0], [0, 0, seite * -0.5], [0.12, 0.08, 0.11], { art: "glanz" });
      t.add(RING(0.25), "#9a9eb0", [seite * 0.29, SCHULTER_Y + 0.0, 0], [Math.PI / 2, 0, seite * -0.5], [0.115, 0.105, 0.1], { art: "glanz" });
      t.add(KUGEL_K(), "#e0c070", [seite * 0.33, SCHULTER_Y + 0.05, 0.06], [0, 0, 0], 0.014, { art: "glanz" });
    }
    t.in(rumpf);
  }
  if (e === "stab" || e === "wanderstab") {
    const hand = ellbogen[1];
    const stab = gruppe(hand, 0, -0.29, 0.03);
    stab.rotation.x = 0.18;
    t.add(ZYL(1, 1, 10), holz, [0, 0.05, 0], [0, 0, 0], [0.032, 1.75, 0.032]);
    for (let i = 0; i < 3; i++) t.add(RING(0.35), holzHell, [0, 0.5 + i * 0.07, 0], [Math.PI / 2, 0, 0], [0.036, 0.036, 0.1]);
    if (e === "stab") {
      t.add(RING(0.2), "#e0b040", [0, 0.97, 0], [0, 0, 0], [0.08, 0.1, 0.12], { art: "glanz" });
      t.in(stab);
      const kristall = gruppe(stab, 0, 1.0, 0);
      t.add(geo("kristall", () => new THREE.OctahedronGeometry(1, 0)), "#7ae8ff", [0, 0, 0], [0, 0, 0], [0.07, 0.12, 0.07], { art: "leucht" });
      t.in(kristall);
      anim = (zeit) => { kristall.rotation.y = zeit * 1.6; kristall.position.y = 1.0 + Math.sin(zeit * 2.4) * 0.015; };
    } else {
      t.add(KUGEL_K(), holzHell, [0, 0.95, 0], [0, 0, 0], [0.07, 0.06, 0.07]);
      t.add(RING(0.4, Math.PI * 1.2), holz, [0, 1.0, 0], [0, 0, 0], [0.08, 0.08, 0.1]);
      t.in(stab);
    }
  }
  if (e === "koecher") {
    const k = gruppe(rumpf, 0.1, 0.3, -0.2);
    k.rotation.z = -0.35;
    t.add(ZYL(1.1, 1), "#7a4a28", [0, 0, 0], [0, 0, 0], [0.075, 0.5, 0.075]);
    t.add(RING(0.3), "#5a3420", [0, 0.24, 0], [Math.PI / 2, 0, 0], [0.08, 0.08, 0.1]);
    for (let i = 0; i < 4; i++) {
      t.add(ZYL(1, 1, 6), "#c8a878", [(i - 1.5) * 0.03, 0.32, (i % 2) * 0.03], [0, 0, 0], [0.008, 0.2, 0.008]);
      t.add(KASTEN(), i === 1 ? "#c04040" : "#f0f0f0", [(i - 1.5) * 0.03, 0.42, (i % 2) * 0.03], [0, 0, 0], [0.012, 0.07, 0.04]);
    }
    t.in(k);
    const bogen = gruppe(rumpf, -0.05, 0.3, -0.23);
    bogen.rotation.set(0, 0, Math.PI / 2 + 0.35);
    t.add(RING(0.045, Math.PI * 0.8), holz, [0, 0, 0], [0, 0, -Math.PI * 0.4 + Math.PI / 2], [0.34, 0.34, 0.34]);
    t.in(bogen);
    t.add(RING(0.1), "#5a3420", [0, 0.28, 0], [Math.PI / 2 - 0.1, -0.6, 0], [0.235, 0.17, 0.2]);
    t.in(rumpf);
  }
  if (e === "laute") {
    const l = gruppe(rumpf, -0.02, 0.22, -0.22);
    l.rotation.set(0, 0, 0.55);
    t.add(KUGEL(), "#b8742a", [0, 0, 0], [0, 0, 0], [0.17, 0.22, 0.07]);
    t.add(ZYL(1, 1, 16), "#3a2010", [0, 0.03, -0.065], [Math.PI / 2, 0, 0], [0.05, 0.01, 0.05]);
    t.add(KASTEN(), holz, [0, 0.36, 0], [0, 0, 0], [0.05, 0.36, 0.035]);
    t.add(KASTEN(), "#5a3420", [0, 0.56, -0.01], [-0.4, 0, 0], [0.07, 0.1, 0.035]);
    t.in(l);
    t.add(RING(0.1), d.akzent, [0, 0.28, 0], [Math.PI / 2 - 0.1, 0.6, 0], [0.235, 0.17, 0.2]);
    t.in(rumpf);
  }
  if (e === "buch") {
    const b = gruppe(ellbogen[0], 0, -0.25, 0.08);
    b.rotation.set(-0.3, 0.3, 0);
    t.add(KASTEN(), "#8a2a2a", [0, 0, 0], [0, 0, 0], [0.2, 0.26, 0.06]);
    t.add(KASTEN(), "#f4e8c8", [0.006, 0, 0], [0, 0, 0], [0.19, 0.245, 0.045]);
    t.add(KASTEN(), "#e6c45a", [-0.096, 0, 0], [0, 0, 0], [0.012, 0.265, 0.065], { art: "glanz" });
    t.add(KUGEL_K(), "#e6c45a", [0.0, 0.0, 0.032], [0, 0, 0], [0.03, 0.03, 0.006], { art: "glanz" });
    t.in(b);
    ellbogen[0].rotation.x = -0.9;
  }
  return anim;
}

// ---------- Der Torwächter der Quellen ----------

/** Großer Steinwächter mit Kapuze, leuchtenden Augen und schwebenden Runenringen. */
/**
 * Der Torwächter – und mit anderen Farben und Emblemen auch die Wächter der Inseln der Stimmen.
 * f: { stein, steinH, dunkel, glut, rune, emblem: "kristall" | "feder" | "sanduhr" | "waage" | "ringe" }
 */
export function torwaechterBauen(f = {}) {
  const wurzel = new THREE.Group();
  const schwebe = gruppe(wurzel);
  const t = new Teile();
  const stein = f.stein ?? "#5c5878", steinH = f.steinH ?? "#7a7698", dunkel = f.dunkel ?? "#3a364e";
  const glutF = f.glut ?? "#9af4ff", runeF = f.rune ?? "#58d8f0";
  // Robe aus Stein
  t.add(DREH([V(0, 2.3), V(0.42, 2.25), V(0.55, 1.9), V(0.62, 1.3), V(0.8, 0.6), V(0.98, 0.15), V(0.9, 0.05), V(0, 0.05)], 28, "wrobe"),
    stein, [0, 0, 0], [0, 0, 0], [1, 1, 0.82], { art: "stoff", verlauf: 0.35 });
  // Steinplatten auf der Brust
  for (let i = 0; i < 3; i++) t.add(KASTEN(), i === 1 ? steinH : dunkel, [0, 1.55 - i * 0.32, 0.47 - i * 0.03], [0.12, 0, 0], [0.5 - i * 0.04, 0.24, 0.08]);
  // Schultern
  for (const s of [-1, 1]) {
    t.add(KUGEL(), steinH, [s * 0.6, 2.05, 0], [0, 0, s * -0.3], [0.32, 0.22, 0.3]);
    t.add(KUGEL(), stein, [s * 0.75, 1.55, 0.1], [0, 0, 0], [0.18, 0.4, 0.18]);
    t.add(KUGEL(), steinH, [s * 0.8, 1.1, 0.2], [0, 0, 0], [0.17, 0.16, 0.17]);
  }
  // Kapuze
  t.add(geo("wkapuze", () => new THREE.SphereGeometry(1, 26, 16, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.75)),
    dunkel, [0, 2.5, 0], [0, 0, 0], [0.5, 0.58, 0.5], { art: "stoff" });
  t.add(KEGEL(), dunkel, [0, 2.75, -0.35], [-2.0, 0, 0], [0.2, 0.5, 0.2], { art: "stoff" });
  t.add(KUGEL(), "#08060e", [0, 2.45, 0.08], [0, 0, 0], [0.36, 0.4, 0.36]);
  t.in(schwebe);
  // Leuchtende Augen und Brustrune
  const glut = gruppe(schwebe);
  for (const s of [-1, 1]) t.add(KAPSEL(), glutF, [s * 0.13, 2.47, 0.4], [0, 0, Math.PI / 2 + s * 0.2], [0.04, 0.08, 0.03], { art: "leucht" });
  t.add(RING(0.12), runeF, [0, 1.55, 0.53], [0.12, 0, 0], [0.13, 0.13, 0.1], { art: "leucht" });
  t.add(geo("kristall", () => new THREE.OctahedronGeometry(1, 0)), glutF, [0, 1.55, 0.55], [0, 0, 0], [0.05, 0.08, 0.03], { art: "leucht" });
  t.in(glut);
  // Stab mit Kristall
  const stab = gruppe(schwebe, 0.95, 0, 0.3);
  t.add(ZYL(1, 1, 10), "#5a3c22", [0, 1.35, 0], [0, 0, 0], [0.06, 2.7, 0.06]);
  for (let i = 0; i < 3; i++) t.add(RING(0.3), "#8a8aa8", [0, 2.45 + i * 0.12, 0], [Math.PI / 2, 0, 0], [0.07, 0.07, 0.1], { art: "glanz" });
  t.add(RING(0.15), "#8a8aa8", [0, 2.85, 0], [0, 0, 0], [0.16, 0.2, 0.2], { art: "glanz" });
  t.in(stab);
  const kristall = gruppe(stab, 0, 2.85, 0);
  emblemBauen(t, f.emblem ?? "kristall", glutF, runeF);
  t.in(kristall);
  // Schwebende Runenringe
  const ringe = gruppe(wurzel, 0, 1.3, 0);
  const runen = [];
  for (let i = 0; i < 2; i++) {
    const r = gruppe(ringe);
    t.add(RING(0.02), runeF, [0, 0, 0], [Math.PI / 2, 0, 0], 1.25 + i * 0.25, { art: "leucht" });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      t.add(KASTEN(), glutF, [Math.cos(a) * (1.25 + i * 0.25), 0, Math.sin(a) * (1.25 + i * 0.25)], [0, -a, 0], [0.05, 0.14, 0.012], { art: "leucht" });
    }
    t.in(r);
    r.rotation.x = i ? 0.25 : -0.18;
    runen.push(r);
  }
  const animieren = (zeit) => {
    schwebe.position.y = Math.sin(zeit * 1.3) * 0.06;
    runen[0].rotation.y = zeit * 0.6;
    runen[1].rotation.y = -zeit * 0.45;
    ringe.position.y = 1.3 + Math.sin(zeit * 0.9) * 0.15;
    kristall.rotation.y = zeit * 1.2;
    glut.scale.setScalar(1 + Math.sin(zeit * 3) * 0.02);
  };
  wurzel.traverse((o) => { if (o.isMesh) o.userData.figur = true; });
  return { gruppe: wurzel, animieren, kopf: schwebe, sprechen: () => {} };
}

/** Das Zeichen oben auf dem Stab des Wächters (dreht sich langsam). */
function emblemBauen(t, art, glut, rune) {
  const L = { art: "leucht" };
  if (art === "feder") {
    // Große Schreibfeder des Kopisten
    t.add(KEGEL(10), "#f4f0e8", [0, 0.12, 0], [0, 0, 0.35], [0.1, 0.62, 0.03], { art: "glanz" });
    t.add(ZYL(1, 1, 8), "#c9a24e", [-0.05, -0.22, 0], [0, 0, 0.35], [0.02, 0.22, 0.02], { art: "glanz" });
    t.add(KUGEL(), glut, [-0.1, -0.36, 0], [0, 0, 0], [0.05, 0.05, 0.05], L);
  } else if (art === "sanduhr") {
    // Sanduhr des Vergessens
    t.add(KEGEL(12), glut, [0, 0.13, 0], [Math.PI, 0, 0], [0.14, 0.24, 0.14], L);
    t.add(KEGEL(12), glut, [0, -0.13, 0], [0, 0, 0], [0.14, 0.24, 0.14], L);
    for (const y of [-0.26, 0.26]) t.add(ZYL(1, 1, 14), "#8a6a3a", [0, y, 0], [0, 0, 0], [0.18, 0.04, 0.18], { art: "glanz" });
  } else if (art === "waage") {
    // Waage des Zauderers (schief!)
    t.add(KASTEN(), "#c9a24e", [0, 0.05, 0], [0, 0, 0.18], [0.62, 0.04, 0.04], { art: "glanz" });
    for (const s of [-1, 1]) {
      const y = 0.05 + s * -0.055 - 0.2;
      t.add(ZYL(1, 1, 6), "#c9a24e", [s * 0.29, y + 0.11, 0], [0, 0, 0], [0.008, 0.2, 0.008]);
      t.add(ZYL(1, 0.6, 14), glut, [s * 0.29, y, 0], [0, 0, 0], [0.13, 0.03, 0.13], L);
    }
    t.add(KUGEL(), rune, [0, 0.12, 0], [0, 0, 0], [0.05, 0.05, 0.05], L);
  } else if (art === "ringe") {
    // Schallringe des Endlosen Echos
    for (let i = 0; i < 3; i++) t.add(RING(0.04), i % 2 ? rune : glut, [0, 0, 0], [i * 0.9, i * 0.6, 0], 0.12 + i * 0.07, L);
    t.add(KUGEL(), glut, [0, 0, 0], [0, 0, 0], [0.07, 0.07, 0.07], L);
  } else {
    t.add(geo("kristall", () => new THREE.OctahedronGeometry(1, 0)), glut, [0, 0, 0], [0, 0, 0], [0.13, 0.24, 0.13], L);
  }
}

// Bausteine auch für Welt-Objekte (zusammengefügte Meshes mit Vertexfarben)
export { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL, DREH, V, gruppe };
