// Der Drachenrichter – Bossgegner nach den Konzeptzeichnungen in Grafik/Drachenrichter1.jpg und 2.jpg.
//
// Umsetzung der Zeichnungen:
//   - Kopf aus Grundkörpern: Zylinder als Schädel, lange kastenförmige Schnauze mit Nasenplatten
//   - Unterkiefer wie eine Baggerschaufel, Drehachse hinten (Maul öffnet beim Sprechen)
//   - dreieckige, glühende Augen mit wütenden Brauen
//   - große Ohren auf einem runden „Pflaster“, S-förmiger Rand, klappen wie eine Tür nach hinten
//   - Nasenlöcher als Tropfen; die Nase stößt in Stößen Rauch aus („Blasebalg“)
//   - eiförmiger Bauch mit Bauchplatten, langer Hals bis zur Drosselgrube
//   - Fledermausflügel (ausgebreitet oder gefaltet), Arme mit Krallen
//   - kräftige Hinterbeine mit Krallenfüßen, Schweif aus Röhren mit spitzem Kegel am Ende
//   - Pose „kniend“: Wenn er besiegt ist, kniet er vor seinem Bezwinger
//
// Ursprung: zwischen den Füßen, Blick in Richtung +z (wie alle Figuren).

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KASTEN, KEGEL, gruppe } from "./figuren.js";
import { textur } from "./texturen.js";

export const DRACHE_FARBEN = {
  haut: "#a8322a",
  dunkel: "#76221e",
  bauch: "#e0a860",
  membran: "#c85038",
  horn: "#3a2a28",
  zahn: "#f2ead6",
  auge: "#ffd23a",
  maul: "#3a0e10",
  zunge: "#e05a6a",
};
const F = DRACHE_FARBEN;

// ---------- Hilfen ----------

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), OBEN = new THREE.Vector3(0, 1, 0);

/** Röhre von a nach b (Zylinder mit runden Gelenken). */
function knochen(t, a, b, rA, rB, farbe, opt = {}) {
  _a.set(...a); _b.set(...b);
  _d.subVectors(_b, _a);
  const laenge = _d.length();
  _q.setFromUnitVectors(OBEN, _d.normalize());
  _e.setFromQuaternion(_q);
  const mitte = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  t.add(ZYL(rB / rA, 1, 12), farbe, mitte, [_e.x, _e.y, _e.z], [rA, laenge, rA], opt);
  if (opt.gelenke !== false) {
    t.add(KUGEL_K(), farbe, a, [0, 0, 0], rA, opt);
    t.add(KUGEL_K(), farbe, b, [0, 0, 0], rB, opt);
  }
}

/** Kegel, der von Punkt a in Richtung b zeigt (Krallen, Zähne, Stacheln). */
function spitze(t, a, b, r, farbe, opt = {}, seg = 6) {
  _a.set(...a); _b.set(...b);
  _d.subVectors(_b, _a);
  const laenge = _d.length();
  _q.setFromUnitVectors(OBEN, _d.normalize());
  _e.setFromQuaternion(_q);
  t.add(KEGEL(seg), farbe, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [_e.x, _e.y, _e.z], [r, laenge, r], opt);
}

const formen = new Map();
/** Ohr: flache S-Form, u = nach hinten, v = nach oben (wird zur Seite gedreht). */
function ohrForm(dicke) {
  const key = `ohr${dicke}`;
  if (!formen.has(key)) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(-0.1, 0.5, 0.04, 1.0);             // Vorderkante, leicht geschwungen
    s.quadraticCurveTo(0.12, 0.8, 0.16, 0.62);            // S-Form außen: oben spitz …
    s.quadraticCurveTo(0.2, 0.4, 0.38, 0.24);             // … in der Mitte eingezogen …
    s.quadraticCurveTo(0.44, 0.04, 0.26, -0.02);          // … unten bauchig
    s.quadraticCurveTo(0.12, -0.06, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: dicke, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, -dicke / 2);
    g.rotateY(Math.PI / 2);                                // u → -z (nach hinten), Fläche zeigt zur Seite
    formen.set(key, g);
  }
  return formen.get(key);
}

/** Dreiecks-Prisma für die Augen. */
const DREIECK = () => {
  if (!formen.has("dreieck")) formen.set("dreieck", new THREE.CylinderGeometry(1, 1, 1, 3));
  return formen.get("dreieck");
};

/** Flughaut aus Punkten (Fächer von Dreiecken), beidseitig sichtbar. */
function flughaut(punkte, dreiecke) {
  const pos = [];
  for (const [i, j, k] of dreiecke) pos.push(...punkte[i], ...punkte[j], ...punkte[k]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

let rauchTex = null;
function rauchTextur() {
  if (rauchTex) return rauchTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const v = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  v.addColorStop(0, "rgba(220,215,210,0.9)");
  v.addColorStop(0.5, "rgba(180,175,170,0.45)");
  v.addColorStop(1, "rgba(150,150,150,0)");
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 64);
  rauchTex = textur(c);
  return rauchTex;
}

// ---------- Teile ----------

function kopfBauen(kopf) {
  const t = new Teile();
  // Schädel: liegender Zylinder (Grundkonstruktion) und eckige Schädelplatte
  t.add(ZYL(1, 1, 14), F.haut, [0, 0.1, -0.05], [0, 0, Math.PI / 2], [0.36, 0.64, 0.36]);
  t.add(KASTEN(), F.haut, [0, 0.27, -0.02], [0.08, 0, 0], [0.58, 0.24, 0.62]);
  t.add(KASTEN(), F.dunkel, [0, 0.4, -0.12], [0.2, 0, 0], [0.4, 0.06, 0.4]);
  // Schnauze: langer Kasten, Oberseite aus drei Platten, Vorderseite als eigene Platte
  t.add(KASTEN(), F.haut, [0, 0.06, 0.55], [0, 0, 0], [0.46, 0.3, 0.86]);
  for (let i = 0; i < 3; i++) t.add(KASTEN(), i % 2 ? F.haut : F.dunkel, [0, 0.235, 0.3 + i * 0.25], [-0.06, 0, 0], [0.48 - i * 0.02, 0.07, 0.24]);
  t.add(KASTEN(), F.dunkel, [0, 0.06, 0.985], [0, 0, 0], [0.47, 0.32, 0.05]);
  // Nasenlöcher: Tropfen
  for (const s of [-1, 1]) {
    t.add(KUGEL_K(), "#1a0606", [s * 0.12, 0.15, 1.0], [0, 0, 0], [0.06, 0.05, 0.03]);
    t.add(KUGEL_K(), "#1a0606", [s * 0.125, 0.2, 0.995], [0, 0, 0], [0.03, 0.035, 0.025]);
  }
  // Maul innen und obere Zähne
  t.add(KASTEN(), F.maul, [0, -0.1, 0.55], [0, 0, 0], [0.4, 0.06, 0.8]);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.3 + i * 0.14;
      spitze(t, [s * 0.2, -0.08, z], [s * 0.2, -0.2 - (i % 2) * 0.03, z + 0.01], 0.028, F.zahn, { art: "glanz" }, 5);
    }
    spitze(t, [s * 0.17, -0.06, 0.93], [s * 0.15, -0.32, 0.96], 0.04, F.zahn, { art: "glanz" }, 6); // Fangzähne
  }
  // Augen: dreieckig und glühend, darüber wütende Brauen
  for (const s of [-1, 1]) {
    t.add(KASTEN(), "#2a0a08", [s * 0.27, 0.19, 0.26], [0, s * 0.35, 0], [0.08, 0.17, 0.26]);
    t.add(DREIECK(), F.auge, [s * 0.305, 0.19, 0.28], [Math.PI / 2 + s * 0.25, s * 0.35, Math.PI / 2], [0.12, 0.035, 0.1], { art: "leucht" });
    t.add(KUGEL_K(), "#1a0404", [s * 0.33, 0.18, 0.3], [0, 0, 0], [0.02, 0.05, 0.02]);
    t.add(KASTEN(), F.dunkel, [s * 0.23, 0.34, 0.27], [0, s * 0.15, s * 0.42], [0.27, 0.08, 0.2]);
  }
  // Stacheln auf dem Hinterkopf
  for (let i = 0; i < 3; i++) spitze(t, [0, 0.38 - i * 0.05, -0.2 - i * 0.14], [0, 0.55 - i * 0.07, -0.34 - i * 0.16], 0.05, F.horn, {}, 4);
  t.in(kopf);

  // Unterkiefer: Baggerschaufel mit Drehachse hinten
  const kiefer = gruppe(kopf, 0, -0.1, -0.1);
  const k = new Teile();
  k.add(KASTEN(), F.haut, [0, -0.08, 0.6], [0, 0, 0], [0.44, 0.08, 0.98]);
  for (const s of [-1, 1]) k.add(KASTEN(), F.haut, [s * 0.205, -0.0, 0.6], [0, 0, 0], [0.05, 0.16, 0.9]);
  k.add(KASTEN(), F.dunkel, [0, -0.02, 1.08], [0, 0, 0], [0.44, 0.15, 0.06]);
  k.add(KASTEN(), F.bauch, [0, -0.13, 0.55], [0, 0, 0], [0.34, 0.03, 0.8]);
  k.add(KASTEN(), F.maul, [0, -0.03, 0.6], [0, 0, 0], [0.36, 0.04, 0.88]);
  k.add(KUGEL(), F.zunge, [0, 0.0, 0.55], [0, 0, 0], [0.12, 0.035, 0.36]);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.36 + i * 0.16;
      spitze(k, [s * 0.19, 0.06, z], [s * 0.19, 0.17 + (i % 2) * 0.03, z], 0.026, F.zahn, { art: "glanz" }, 5);
    }
    spitze(k, [s * 0.15, 0.06, 1.03], [s * 0.14, 0.24, 1.05], 0.035, F.zahn, { art: "glanz" }, 6);
  }
  k.in(kiefer);

  // Ohren auf dem runden „Pflaster“, klappen wie eine Tür
  const ohren = [];
  for (const s of [-1, 1]) {
    const basis = gruppe(kopf, s * 0.33, 0.3, -0.14);
    const p = new Teile();
    p.add(ZYL(1, 1, 16), F.dunkel, [0, 0, 0], [0, 0, Math.PI / 2], [0.12, 0.08, 0.12]);
    p.in(basis);
    const ohr = gruppe(basis, s * 0.03, 0, 0);
    const o = new Teile();
    o.add(ohrForm(0.035), F.membran, [0, 0, 0], [0, 0, 0], [1, 1.45, 1.3], { art: "stoff" });
    // kräftige Vorderkante
    knochen(o, [0, 0, 0.02], [0, 0.7, 0.1], 0.055, 0.04, F.dunkel);
    knochen(o, [0, 0.7, 0.1], [0, 1.42, -0.03], 0.04, 0.022, F.dunkel);
    o.in(ohr);
    ohr.rotation.z = -s * 0.28;
    ohr.rotation.y = s * 0.15;
    ohren.push({ ohr, s });
  }
  return { kiefer, ohren };
}

/** Flügel: Armknochen, Fingerknochen und Flughaut. s = Seite (-1 links, 1 rechts). */
function fluegelBauen(eltern, s) {
  const g = gruppe(eltern, s * 0.38, 1.75, -0.48);
  const innen = gruppe(g);
  innen.scale.x = s;
  const P = {
    w: [0, 0, 0], e: [0.75, 0.55, -0.35], h: [1.55, 0.95, -0.55],
    f1: [2.55, 1.35, -0.85], f2: [2.75, 0.35, -0.95], f3: [2.2, -0.55, -0.85], f4: [1.25, -0.95, -0.6],
    r: [0.15, -0.65, -0.25],
  };
  const t = new Teile();
  knochen(t, P.w, P.e, 0.11, 0.08, F.dunkel);
  knochen(t, P.e, P.h, 0.08, 0.065, F.dunkel);
  for (const f of ["f1", "f2", "f3", "f4"]) knochen(t, P.h, P[f], 0.045, 0.018, F.dunkel, { gelenke: false });
  spitze(t, P.h, [P.h[0] + 0.05, P.h[1] + 0.3, P.h[2] + 0.1], 0.06, F.horn, {}, 5);   // Daumenkralle
  t.in(innen);
  // Flughaut mit gebogenen Rändern zwischen den Fingern
  const zwischen = (a, b, k) => [(a[0] + b[0]) / 2 * k + P.h[0] * (1 - k), (a[1] + b[1]) / 2 * k + P.h[1] * (1 - k), (a[2] + b[2]) / 2 * k + P.h[2] * (1 - k)];
  const pkt = [P.w, P.e, P.h, P.f1, zwischen(P.f1, P.f2, 0.78), P.f2, zwischen(P.f2, P.f3, 0.78), P.f3, zwischen(P.f3, P.f4, 0.78), P.f4, [0.7, -0.75, -0.42], P.r];
  const dreiecke = [[2, 3, 4], [2, 4, 5], [2, 5, 6], [2, 6, 7], [2, 7, 8], [2, 8, 9], [1, 2, 9], [1, 9, 10], [0, 1, 10], [0, 10, 11]];
  const haut = new THREE.Mesh(flughaut(pkt, dreiecke), new THREE.MeshStandardMaterial({
    color: F.membran, side: THREE.DoubleSide, roughness: 0.9, transparent: true, opacity: 0.95, flatShading: true,
  }));
  haut.castShadow = true;
  haut.userData.figur = true;
  innen.add(haut);
  return g;
}

function armBauen(eltern, s) {
  const schulter = gruppe(eltern, s * 0.62, 1.42, 0.28);
  const t = new Teile();
  t.add(KUGEL(), F.haut, [0, 0, 0], [0, 0, 0], 0.2);
  knochen(t, [0, 0, 0], [0, -0.55, 0], 0.17, 0.12, F.haut);
  t.in(schulter);
  const ellbogen = gruppe(schulter, 0, -0.55, 0);
  const u = new Teile();
  knochen(u, [0, 0, 0], [0, -0.5, 0], 0.12, 0.09, F.haut);
  u.add(KUGEL(), F.haut, [0, -0.58, 0.02], [0, 0, 0], [0.13, 0.1, 0.14]);
  for (const k of [-1, 0, 1]) spitze(u, [k * 0.07, -0.62, 0.08], [k * 0.09, -0.8, 0.22], 0.035, F.zahn, {}, 5);
  u.in(ellbogen);
  return { schulter, ellbogen };
}

function beinBauen(eltern, s) {
  const huefte = gruppe(eltern, s * 0.55, 1.05, -0.05);
  const t = new Teile();
  t.add(KUGEL(), F.haut, [s * 0.05, 0, 0.05], [0, 0, 0], [0.42, 0.5, 0.52]);
  knochen(t, [s * 0.05, -0.1, 0.1], [s * 0.05, -0.42, 0.42], 0.22, 0.15, F.haut);
  knochen(t, [s * 0.05, -0.42, 0.42], [s * 0.05, -0.8, -0.12], 0.14, 0.11, F.haut);
  knochen(t, [s * 0.05, -0.8, -0.12], [s * 0.05, -0.98, 0.16], 0.11, 0.1, F.haut);
  t.add(KUGEL(), F.haut, [s * 0.05, -0.98, 0.2], [0, 0, 0], [0.2, 0.08, 0.16]);
  for (const k of [-1, 0, 1]) {
    const x = s * 0.05 + k * 0.13;
    knochen(t, [x, -0.98, 0.22], [x + k * 0.04, -0.99, 0.48], 0.06, 0.05, F.haut);
    spitze(t, [x + k * 0.04, -0.98, 0.5], [x + k * 0.05, -1.03, 0.68], 0.045, F.zahn, {}, 5);
  }
  spitze(t, [s * 0.05, -0.95, 0.0], [s * 0.05, -1.02, -0.2], 0.04, F.zahn, {}, 5);   // Sporn hinten
  t.in(huefte);
  return huefte;
}

function schweifBauen(eltern) {
  const glieder = [];
  let eltern2 = gruppe(eltern, 0, 0.95, -0.62);
  const n = 10;
  for (let i = 0; i < n; i++) {
    const g = i === 0 ? eltern2 : gruppe(eltern2, 0, 0, -0.34);
    const r0 = 0.3 * (1 - i / n) + 0.05, r1 = 0.3 * (1 - (i + 1) / n) + 0.05;
    const t = new Teile();
    knochen(t, [0, 0, 0], [0, 0, -0.36], r0, r1, F.haut);
    if (i < n - 2) spitze(t, [0, r0 * 0.85, -0.12], [0, r0 + 0.14, -0.22], 0.05, F.horn, {}, 4);
    if (i === n - 1) {
      // Spitzer Kegel am Ende
      spitze(t, [0, 0, -0.32], [0, 0.06, -0.8], 0.16, F.horn, {}, 4);
    }
    t.in(g);
    g.userData.grund = i < 3 ? 0.22 : i < 6 ? -0.05 : -0.22;   // erst nach unten, dann wieder nach oben
    g.rotation.x = g.userData.grund;
    glieder.push(g);
    eltern2 = g;
  }
  return glieder;
}

// ---------- Drache ----------

/**
 * Baut den Drachenrichter.
 * Liefert { gruppe, animieren(zeit, tempo, dt), kopf, sprechen(an), pose(name) }.
 * Posen: "stehend" (Flügel ausgebreitet), "gefaltet" (Flügel angelegt), "kniend" (besiegt).
 */
export function drachenrichterBauen() {
  const wurzel = new THREE.Group();
  const unten = gruppe(wurzel);                       // Hüfte, Beine, Schweif
  const beine = [beinBauen(unten, -1), beinBauen(unten, 1)];
  const schweif = schweifBauen(unten);

  const ober = gruppe(unten, 0, 1.1, -0.05);            // Oberkörper (Drehpunkt in der Hüfte)
  const t = new Teile();
  // Eiförmiger Bauch und Brust
  t.add(KUGEL(), F.haut, [0, 0.72, 0], [0.12, 0, 0], [0.82, 1.08, 0.74]);
  t.add(KUGEL(), F.haut, [0, 1.38, 0.05], [0, 0, 0], [0.74, 0.6, 0.62]);
  // Bauchplatten
  for (let i = 0; i < 7; i++) {
    const y = 0.05 + i * 0.22;
    const ey = (y - 0.72) / 1.08;
    const z = 0.74 * Math.sqrt(Math.max(0.05, 1 - ey * ey)) + 0.06 + 0.12 * (y - 0.72) * 0.25;
    t.add(KASTEN(), F.bauch, [0, y, z], [-0.25 * ey, 0, 0], [0.6 - Math.abs(ey) * 0.3, 0.17, 0.08]);
  }
  // Rückenstacheln
  for (let i = 0; i < 5; i++) spitze(t, [0, 0.5 + i * 0.25, -0.62 + i * 0.03], [0, 0.66 + i * 0.25, -0.86 + i * 0.03], 0.07, F.horn, {}, 4);
  t.in(ober);

  const arme = [armBauen(ober, -1), armBauen(ober, 1)];
  const fluegel = [fluegelBauen(ober, -1), fluegelBauen(ober, 1)];

  // Hals bis zur Drosselgrube, oben der Kopf
  const hals = gruppe(ober, 0, 1.6, 0.18);
  const h = new Teile();
  knochen(h, [0, 0, 0], [0, 0.55, 0.12], 0.34, 0.3, F.haut);
  knochen(h, [0, 0.55, 0.12], [0, 1.0, 0.32], 0.3, 0.26, F.haut);
  for (let i = 0; i < 4; i++) h.add(KASTEN(), F.bauch, [0, 0.12 + i * 0.24, 0.3 + i * 0.06], [-0.3, 0, 0], [0.34, 0.14, 0.07]);
  h.in(hals);
  const kopf = gruppe(hals, 0, 1.05, 0.38);
  kopf.scale.setScalar(1.25);
  const { kiefer, ohren } = kopfBauen(kopf);

  // Rauch aus den Nasenlöchern
  const rauch = [];
  const rauchMat = new THREE.SpriteMaterial({ map: rauchTextur(), transparent: true, depthWrite: false, opacity: 0 });
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Sprite(rauchMat.clone());
    sp.visible = false;
    kopf.add(sp);
    rauch.push({ sp, s: i % 2 ? 1 : -1, alter: 99 });
  }

  wurzel.traverse((o) => { if (o.isMesh) o.userData.figur = true; });

  // ----- Posen -----
  const POSEN = {
    stehend: { knien: 0, falten: 0 },
    gefaltet: { knien: 0, falten: 1 },
    kniend: { knien: 1, falten: 1 },
  };
  let ziel = POSEN.stehend;
  const jetzt = { knien: 0, falten: 0 };
  let spricht = false, sprechStart = 0, letzterStoss = 0;

  function animieren(zeit, _tempo = 0, dt = 0.016) {
    for (const k of ["knien", "falten"]) jetzt[k] += (ziel[k] - jetzt[k]) * Math.min(1, dt * 2.5);
    const kn = jetzt.knien, fa = jetzt.falten;
    const atem = Math.sin(zeit * 1.6);

    // Körper: atmen, beim Knien nach vorn und unten
    unten.position.y = -0.42 * kn;
    ober.rotation.x = 0.04 * atem + 0.5 * kn;
    ober.scale.set(1 + atem * 0.012, 1 + atem * 0.01, 1 + atem * 0.012);
    for (const [i, b] of beine.entries()) {
      b.rotation.x = -0.55 * kn;
      b.position.y = 1.05 + 0.25 * kn;
      b.rotation.z = (i ? -1 : 1) * 0.08 * kn;
    }

    // Hals und Kopf: leichtes Pendeln, beim Knien Kopf gesenkt
    hals.rotation.x = 0.05 * Math.sin(zeit * 0.7) + 0.15 * kn;
    hals.rotation.y = 0.12 * Math.sin(zeit * 0.45);
    kopf.rotation.x = -0.05 * Math.sin(zeit * 0.9 + 1) + 0.1 * kn;
    kopf.rotation.z = 0.04 * Math.sin(zeit * 0.6);

    // Maul: beim Sprechen auf und zu, sonst leicht geöffnet
    const offen = spricht
      ? 0.18 + Math.abs(Math.sin((zeit - sprechStart) * 7)) * 0.35
      : 0.12 + 0.05 * Math.sin(zeit * 1.6);
    kiefer.rotation.x += (offen * (1 - kn * 0.7) - kiefer.rotation.x) * Math.min(1, dt * 12);

    // Ohren: zucken, beim Falten/Knien wie eine Tür nach hinten geklappt
    for (const { ohr, s } of ohren) {
      ohr.rotation.y = -s * (0.6 - 0.75 * Math.max(fa * 0.5, kn)) + s * 0.05 * Math.sin(zeit * 2.3 + s);
      ohr.rotation.x = -0.25 * kn;
    }

    // Arme: hängen locker, beim Knien auf den Boden gestützt
    for (const [i, a] of arme.entries()) {
      const s = i ? 1 : -1;
      a.schulter.rotation.x = -0.45 + 0.05 * atem - 0.5 * kn;
      a.schulter.rotation.z = s * (0.18 - 0.08 * kn);
      a.ellbogen.rotation.x = -0.95 + 0.55 * kn;
    }

    // Flügel: ausgebreitet mit langsamem Schlag oder angelegt
    for (const [i, f] of fluegel.entries()) {
      const s = i ? 1 : -1;
      const schlag = Math.sin(zeit * 1.3) * 0.12 * (1 - fa);
      f.rotation.set(0.15 * fa, s * (0.35 + 1.05 * fa), s * (0.25 + schlag - 0.55 * fa));
      f.children[0].scale.set(s * (1 - 0.45 * fa), 1 - 0.25 * fa, 1);
    }

    // Schweif: Wellenbewegung
    schweif.forEach((g, i) => {
      g.rotation.y = Math.sin(zeit * 1.1 - i * 0.55) * 0.09 * (1 - kn * 0.6);
      g.rotation.x = g.userData.grund + Math.sin(zeit * 0.8 - i * 0.4) * 0.03;
    });

    // Rauch: alle paar Sekunden ein Stoß aus beiden Nasenlöchern (Blasebalg)
    if (zeit - letzterStoss > 3.2 && kn < 0.5) {
      letzterStoss = zeit;
      let n = 0;
      for (const r of rauch) if (r.alter > 1.6 && n < 6) { r.alter = -n * 0.08; r.v = 0.7 + Math.random() * 0.5; n++; }
    }
    for (const r of rauch) {
      r.alter += dt;
      const a = r.alter;
      if (a < 0 || a > 1.6) { r.sp.visible = false; continue; }
      r.sp.visible = true;
      r.sp.position.set(r.s * (0.13 + a * 0.25), 0.18 + a * 0.45, 1.05 + a * r.v);
      r.sp.scale.setScalar(0.12 + a * 0.5);
      r.sp.material.opacity = 0.65 * (1 - a / 1.6);
    }
  }

  return {
    gruppe: wurzel,
    kopf,
    animieren,
    sprechen(an, zeit = 0) { spricht = an; sprechStart = zeit; },
    pose(name) { ziel = POSEN[name] ?? POSEN.stehend; },
  };
}
