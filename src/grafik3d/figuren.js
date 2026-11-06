// Polygonfiguren für die 3D-Version (Low-Poly mit flacher Schattierung).
// Aussehen wie in der 16-Bit-Version (AUSSEHEN), damit beide Versionen zusammenpassen.

import * as THREE from "../../vendor/three.module.min.js";

const materialien = new Map();
export function mat(farbe, opt = {}) {
  const key = `${farbe}|${JSON.stringify(opt)}`;
  if (!materialien.has(key)) {
    materialien.set(key, new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.85, flatShading: true, ...opt }));
  }
  return materialien.get(key);
}

function netz(geo, material, { schatten = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = schatten;
  m.receiveShadow = true;
  return m;
}

function dunkler(hex, f = 0.75) {
  return `#${new THREE.Color(hex).multiplyScalar(f).getHexString()}`;
}

/**
 * Baut eine Figur. Liefert { gruppe, animieren(zeit, laufTempo) }.
 * Ursprung: zwischen den Füßen, Blick in Richtung +z.
 */
export function figurBauen(d) {
  const g = new THREE.Group();
  const haut = mat(d.haut);
  const kleid = mat(d.kleid);
  const akzent = mat(d.akzent, { roughness: 0.5, metalness: d.akzent === "#e0b040" || d.akzent === "#e6c45a" ? 0.4 : 0 });
  const hose = mat(d.hose);
  const stiefel = mat(d.stiefel);
  const haare = mat(d.haare);

  // Beine (Drehpunkt an der Hüfte)
  const beine = [];
  for (const seite of [-1, 1]) {
    const bein = new THREE.Group();
    bein.position.set(seite * 0.13, 0.82, 0);
    const ober = netz(new THREE.CylinderGeometry(0.1, 0.085, 0.62, 7), hose);
    ober.position.y = -0.32;
    const stiefelM = netz(new THREE.BoxGeometry(0.17, 0.2, 0.27), stiefel);
    stiefelM.position.set(0, -0.72, 0.04);
    bein.add(ober, stiefelM);
    if (!d.robe) g.add(bein);
    beine.push(bein);
  }

  // Körper
  const koerper = new THREE.Group();
  koerper.position.y = 0.82;
  g.add(koerper);
  const rumpf = netz(new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8), kleid);
  rumpf.position.y = 0.38;
  koerper.add(rumpf);
  const guertel = netz(new THREE.CylinderGeometry(0.305, 0.305, 0.08, 8), akzent);
  guertel.position.y = 0.1;
  koerper.add(guertel);
  if (!d.robe) {
    const rock = netz(new THREE.CylinderGeometry(0.3, 0.36, 0.26, 8), kleid);
    rock.position.y = -0.05;
    koerper.add(rock);
  } else {
    const robe = netz(new THREE.CylinderGeometry(0.3, 0.48, 0.86, 10), kleid);
    robe.position.y = -0.38;
    koerper.add(robe);
    const saum = netz(new THREE.CylinderGeometry(0.485, 0.49, 0.06, 10), akzent);
    saum.position.y = -0.79;
    koerper.add(saum);
  }
  if (d.schuerze) {
    const s = netz(new THREE.BoxGeometry(0.4, d.robe ? 1.0 : 0.75, 0.04), mat(d.schuerze));
    s.position.set(0, d.robe ? -0.05 : 0.18, 0.31);
    s.rotation.x = -0.06;
    koerper.add(s);
  }
  // Kragen
  const kragen = netz(new THREE.TorusGeometry(0.16, 0.04, 5, 10), akzent);
  kragen.rotation.x = Math.PI / 2;
  kragen.position.y = 0.73;
  koerper.add(kragen);

  // Arme (Drehpunkt an der Schulter)
  const arme = [];
  for (const seite of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(seite * 0.34, 0.68, 0);
    const ober = netz(new THREE.CylinderGeometry(0.08, 0.07, 0.56, 6), d.armeHaut ? haut : kleid);
    ober.position.y = -0.28;
    const hand = netz(new THREE.IcosahedronGeometry(0.075, 0), haut);
    hand.position.y = -0.6;
    arm.add(ober, hand);
    arm.rotation.z = seite * 0.08;
    koerper.add(arm);
    arme.push(arm);
  }

  // Kopf
  const kopf = new THREE.Group();
  kopf.position.y = 0.92;
  koerper.add(kopf);
  const hals = netz(new THREE.CylinderGeometry(0.075, 0.08, 0.14, 6), haut);
  hals.position.y = -0.08;
  kopf.add(hals);
  const schaedel = netz(new THREE.IcosahedronGeometry(0.27, 2), haut);
  schaedel.scale.set(1, 1.08, 1);
  schaedel.position.y = 0.2;
  kopf.add(schaedel);
  for (const seite of [-1, 1]) {
    const ohr = netz(new THREE.IcosahedronGeometry(0.06, 0), haut);
    ohr.scale.set(0.6, 1, 0.8);
    ohr.position.set(seite * 0.27, 0.2, 0);
    kopf.add(ohr);
    const auge = netz(new THREE.SphereGeometry(0.038, 8, 6), mat("#1e1628", { roughness: 0.25 }), { schatten: false });
    auge.position.set(seite * 0.095, 0.23, 0.245);
    auge.scale.set(1, 1.3, 0.6);
    kopf.add(auge);
    const glanz = netz(new THREE.SphereGeometry(0.012, 6, 4), mat("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.6 }), { schatten: false });
    glanz.position.set(seite * 0.095 - 0.012, 0.25, 0.268);
    kopf.add(glanz);
    const braue = netz(new THREE.BoxGeometry(0.1, 0.022, 0.02), mat(d.bart ? d.bartfarbe : d.haare), { schatten: false });
    braue.position.set(seite * 0.1, 0.32, 0.24);
    braue.rotation.z = seite * -0.12;
    kopf.add(braue);
  }
  const nase = netz(new THREE.ConeGeometry(0.035, 0.08, 5), haut);
  nase.rotation.x = Math.PI / 2;
  nase.position.set(0, 0.17, 0.28);
  kopf.add(nase);
  const mund = netz(new THREE.BoxGeometry(0.08, 0.014, 0.01), mat(dunkler(d.haut, 0.55)), { schatten: false });
  mund.position.set(0, 0.08, 0.255);
  kopf.add(mund);
  if (d.wangen || d.frisur === "dutt") {
    for (const seite of [-1, 1]) {
      const w = netz(new THREE.CircleGeometry(0.035, 8), mat("#f08080", { transparent: true, opacity: 0.45 }), { schatten: false });
      w.position.set(seite * 0.15, 0.13, 0.235);
      w.rotation.y = seite * 0.5;
      kopf.add(w);
    }
  }

  frisur(kopf, d, haare);
  bart(kopf, d);
  ausruestung(koerper, arme, d);

  // Animation
  let phase = 0;
  const animieren = (zeit, tempo, dt = 0.016) => {
    if (tempo > 0.05) {
      phase += dt * 9 * Math.min(1.4, tempo);
      const s = Math.sin(phase);
      beine[0].rotation.x = s * 0.7; beine[1].rotation.x = -s * 0.7;
      arme[0].rotation.x = -s * 0.6; arme[1].rotation.x = s * 0.6;
      koerper.position.y = 0.82 + Math.abs(Math.cos(phase)) * 0.05;
      koerper.rotation.z = s * 0.03;
      if (d.robe) koerper.children.forEach((c) => { if (c.geometry?.type === "CylinderGeometry" && c.position.y < -0.3) c.rotation.z = s * 0.06; });
    } else {
      phase = 0;
      for (const b of beine) b.rotation.x *= 0.8;
      for (const a of arme) a.rotation.x *= 0.8;
      koerper.position.y = 0.82 + Math.sin(zeit * 2) * 0.01;
      koerper.rotation.z = 0;
      kopf.rotation.y = Math.sin(zeit * 0.5) * 0.12;
    }
  };
  g.traverse((o) => { if (o.isMesh) o.userData.figur = true; });
  return { gruppe: g, animieren, kopf };
}

function frisur(kopf, d, haare) {
  const f = d.frisur;
  const kappe = (r = 0.29, theta = 1.75) => {
    const m = netz(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, theta), haare);
    m.position.set(0, 0.22, -0.02);
    m.rotation.x = -0.25;
    return m;
  };
  if (f === "kurz" || f === "lockig" || f === "zopf" || f === "lang" || f === "dutt") {
    kopf.add(kappe());
    const pony = netz(new THREE.BoxGeometry(0.42, 0.08, 0.12), haare);
    pony.position.set(0, 0.39, 0.18);
    pony.rotation.x = 0.5;
    if (f !== "dutt") kopf.add(pony);
  }
  if (f === "lockig") {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const l = netz(new THREE.IcosahedronGeometry(0.08, 0), haare);
      l.position.set(Math.cos(a) * 0.26, 0.38 + Math.sin(i) * 0.03, Math.sin(a) * 0.24 - 0.04);
      kopf.add(l);
    }
  }
  if (f === "lang" || d.langhaar) {
    const h = netz(new THREE.BoxGeometry(0.5, 0.6, 0.18), haare);
    h.position.set(0, -0.02, -0.18);
    kopf.add(h);
    for (const s of [-1, 1]) {
      const strähne = netz(new THREE.BoxGeometry(0.08, 0.42, 0.14), haare);
      strähne.position.set(s * 0.26, 0.05, 0.05);
      kopf.add(strähne);
    }
  }
  if (f === "zopf") {
    const z = netz(new THREE.CylinderGeometry(0.07, 0.03, 0.5, 6), haare);
    z.position.set(0, 0.15, -0.33);
    z.rotation.x = 0.5;
    kopf.add(z);
  }
  if (f === "dutt") {
    const dutt = netz(new THREE.IcosahedronGeometry(0.13, 1), haare);
    dutt.position.set(0, 0.48, -0.08);
    kopf.add(dutt);
    const band = netz(new THREE.TorusGeometry(0.27, 0.025, 4, 14), mat(d.akzent));
    band.position.y = 0.36; band.rotation.x = Math.PI / 2 - 0.25;
    kopf.add(band);
  }
  if (f === "glatze") {
    const kranz = netz(new THREE.TorusGeometry(0.25, 0.06, 5, 12, Math.PI * 1.2), haare);
    kranz.position.set(0, 0.17, -0.02);
    kranz.rotation.set(Math.PI / 2, 0, Math.PI * 0.9);
    kopf.add(kranz);
  }
  if (f === "kapuze") {
    const stoff = mat(d.kapuze);
    const k = netz(new THREE.SphereGeometry(0.34, 12, 9, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.62), stoff);
    k.position.set(0, 0.22, -0.01);
    kopf.add(k);
    const umhang = netz(new THREE.ConeGeometry(0.46, 0.5, 10, 1, true), stoff);
    umhang.position.set(0, -0.15, -0.02);
    kopf.add(umhang);
    const pony = netz(new THREE.BoxGeometry(0.34, 0.07, 0.1), haare);
    pony.position.set(0, 0.36, 0.2); pony.rotation.x = 0.5;
    kopf.add(pony);
  }
  if (f === "spitzhut") {
    kopf.add(kappe(0.285, 1.9));
    const hut = mat(d.hut);
    const krempe = netz(new THREE.CylinderGeometry(0.5, 0.52, 0.04, 14), hut);
    krempe.position.y = 0.42;
    const spitze = netz(new THREE.ConeGeometry(0.27, 0.62, 10), hut);
    spitze.position.set(0, 0.74, -0.04);
    spitze.rotation.x = -0.25;
    const band = netz(new THREE.CylinderGeometry(0.27, 0.28, 0.07, 10), mat(d.hutband, { metalness: 0.4, roughness: 0.4 }));
    band.position.y = 0.48;
    kopf.add(krempe, spitze, band);
  }
}

function bart(kopf, d) {
  if (!d.bart) return;
  const b = mat(d.bartfarbe);
  if (d.bart === "lang") {
    const k = netz(new THREE.ConeGeometry(0.22, 0.6, 8), b);
    k.rotation.x = Math.PI;
    k.position.set(0, -0.12, 0.18);
    kopf.add(k);
  } else {
    const k = netz(new THREE.IcosahedronGeometry(0.2, 1), b);
    k.scale.set(1.15, 0.9, 0.8);
    k.position.set(0, 0.03, 0.12);
    kopf.add(k);
    for (const s of [-1, 1]) {
      const zopf = netz(new THREE.CylinderGeometry(0.04, 0.03, 0.3, 5), b);
      zopf.position.set(s * 0.07, -0.22, 0.2);
      kopf.add(zopf);
    }
  }
  const schnurr = netz(new THREE.BoxGeometry(0.2, 0.05, 0.06), b);
  schnurr.position.set(0, 0.11, 0.26);
  kopf.add(schnurr);
}

function ausruestung(koerper, arme, d) {
  const holz = mat("#7a5230");
  const e = d.extra;
  if (e === "schwert") {
    const s = new THREE.Group();
    const klinge = netz(new THREE.BoxGeometry(0.06, 0.8, 0.02), mat("#d8dce8", { metalness: 0.8, roughness: 0.3 }));
    const parier = netz(new THREE.BoxGeometry(0.26, 0.05, 0.06), mat("#d0a030", { metalness: 0.6, roughness: 0.3 }));
    parier.position.y = 0.42;
    const griff = netz(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 5), mat("#5a3420"));
    griff.position.y = 0.53;
    s.add(klinge, parier, griff);
    s.position.set(0.05, 0.4, -0.32);
    s.rotation.z = -0.6;
    koerper.add(s);
    for (const seite of [-1, 1]) {
      const schulter = netz(new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat("#c8ccd8", { metalness: 0.7, roughness: 0.35 }));
      schulter.position.set(seite * 0.33, 0.66, 0);
      koerper.add(schulter);
    }
  }
  if (e === "stab" || e === "wanderstab") {
    const stab = netz(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6), holz);
    stab.position.set(0, -0.45, 0.08);
    arme[1].add(stab);
    const spitze = e === "stab"
      ? netz(new THREE.OctahedronGeometry(0.11, 0), mat("#40c8f0", { emissive: "#2aa8e0", emissiveIntensity: 1.2, roughness: 0.2 }))
      : netz(new THREE.IcosahedronGeometry(0.08, 0), holz);
    spitze.position.set(0, 0.42, 0.08);
    arme[1].add(spitze);
  }
  if (e === "koecher") {
    const k = netz(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 7), mat("#7a5230"));
    k.position.set(0.12, 0.42, -0.3);
    k.rotation.z = -0.35;
    koerper.add(k);
    for (let i = 0; i < 3; i++) {
      const f = netz(new THREE.BoxGeometry(0.02, 0.1, 0.05), mat(i === 1 ? "#c04040" : "#f0f0f0"));
      f.position.set(0.2 + i * 0.025, 0.74, -0.3 + (i - 1) * 0.03);
      koerper.add(f);
    }
    const bogen = netz(new THREE.TorusGeometry(0.42, 0.02, 4, 12, Math.PI * 0.9), holz);
    bogen.position.set(-0.05, 0.35, -0.34);
    bogen.rotation.z = Math.PI / 2 + 0.3;
    koerper.add(bogen);
  }
  if (e === "laute") {
    const l = new THREE.Group();
    const bauch = netz(new THREE.SphereGeometry(0.22, 10, 8), mat("#b8742a", { roughness: 0.4 }));
    bauch.scale.set(1, 1.2, 0.4);
    const hals = netz(new THREE.BoxGeometry(0.06, 0.45, 0.04), holz);
    hals.position.y = 0.38;
    l.add(bauch, hals);
    l.position.set(0, 0.3, -0.32);
    l.rotation.z = 0.5;
    koerper.add(l);
  }
  if (e === "buch") {
    const b = netz(new THREE.BoxGeometry(0.22, 0.28, 0.07), mat("#8a2a2a"));
    b.position.set(0, -0.58, 0.1);
    arme[0].add(b);
  }
}

/** Der Torwächter (für das Titelbild). */
export function torwaechterBauen() {
  const g = new THREE.Group();
  const stein = mat("#5a5674");
  const robe = netz(new THREE.ConeGeometry(0.8, 2.2, 9), stein);
  robe.position.y = 1.1;
  const kapuze = netz(new THREE.IcosahedronGeometry(0.48, 1), mat("#44405a"));
  kapuze.position.y = 2.25;
  const gesicht = netz(new THREE.SphereGeometry(0.3, 10, 8), mat("#0c0a14"));
  gesicht.position.set(0, 2.2, 0.22);
  g.add(robe, kapuze, gesicht);
  for (const s of [-1, 1]) {
    const auge = netz(new THREE.BoxGeometry(0.12, 0.06, 0.05), mat("#80ecff", { emissive: "#58d8f0", emissiveIntensity: 2.5 }));
    auge.position.set(s * 0.12, 2.24, 0.48);
    g.add(auge);
  }
  const stab = netz(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), mat("#6b4a2a"));
  stab.position.set(0.75, 1.3, 0.2);
  const kristall = netz(new THREE.OctahedronGeometry(0.18, 0), mat("#40c8f0", { emissive: "#2aa8e0", emissiveIntensity: 1.6 }));
  kristall.position.set(0.75, 2.7, 0.2);
  g.add(stab, kristall);
  return g;
}
