// Baut die 3D-Welt aus dem Kartenraster.
// 1 Kachel = 2 Welteinheiten. Kachel (tx, ty) hat ihre Mitte bei (tx*2+1, ty*2+1) in x/z.

import * as THREE from "../../vendor/three.module.min.js";
import { mat } from "./figuren.js";
import { bodenTexturen, wandTextur, dachTextur, holzTextur, steinTextur, markiseTextur, aushangTextur, textur, lichtTextur } from "./texturen.js";
import { haeuserFinden } from "../grafik16/welt.js";
import { hash } from "../grafik16/pinsel.js";

export const E = 2; // Welteinheiten pro Kachel
export const welt = (t) => t * E + E / 2;

function netz(geo, material, schatten = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = schatten;
  m.receiveShadow = true;
  return m;
}

const texMat = new Map();
function texturMaterial(name, erzeugen, opt = {}) {
  if (!texMat.has(name)) texMat.set(name, new THREE.MeshStandardMaterial({ map: textur(erzeugen(), opt), roughness: 0.9, ...opt.material }));
  return texMat.get(name);
}

// ---------- Boden, Wasser, Umgebung ----------

export function bodenBauen(szene, raster) {
  const B = raster[0].length * E, T = raster.length * E;
  const { boden, wasser } = bodenTexturen(raster);
  const geo = new THREE.PlaneGeometry(B, T);
  geo.rotateX(-Math.PI / 2);
  const b = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: textur(boden), roughness: 1 }));
  b.position.set(B / 2, 0, T / 2);
  b.receiveShadow = true;
  szene.add(b);

  // Wasser: durchsichtige, leicht bewegte Fläche mit Maske
  const wgeo = new THREE.PlaneGeometry(B, T, 120, 80);
  wgeo.rotateX(-Math.PI / 2);
  const maske = textur(wasser, { srgb: false });
  const w = new THREE.Mesh(wgeo, new THREE.MeshStandardMaterial({
    color: "#3d8ee0", roughness: 0.08, metalness: 0.1, transparent: true, alphaMap: maske, opacity: 0.9, depthWrite: false,
  }));
  w.position.set(B / 2, 0.12, T / 2);
  w.receiveShadow = true;
  szene.add(w);
  const pos = wgeo.attributes.position;
  const basis = Float32Array.from(pos.array);
  const wellen = (t) => {
    for (let i = 0; i < pos.count; i++) {
      const x = basis[i * 3], z = basis[i * 3 + 2];
      pos.array[i * 3 + 1] = Math.sin(x * 1.3 + t * 1.6) * 0.04 + Math.cos(z * 1.7 + t * 1.2) * 0.04;
    }
    pos.needsUpdate = true;
    wgeo.computeVertexNormals();
  };

  // Großer Untergrund außerhalb der Karte
  const umland = new THREE.Mesh(new THREE.CircleGeometry(260, 48).rotateX(-Math.PI / 2), mat("#4f8a36", { flatShading: false }));
  umland.position.set(B / 2, -0.02, T / 2);
  umland.receiveShadow = true;
  szene.add(umland);
  return { wellen, breite: B, tiefe: T };
}

export function umgebungBauen(szene, B, T) {
  // Himmel
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { oben: { value: new THREE.Color("#3f8ff0") }, unten: { value: new THREE.Color("#d8ecff") } },
    vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 oben; uniform vec3 unten; varying vec3 p; void main(){ float t = clamp(p.y*1.6+0.1,0.0,1.0); gl_FragColor = vec4(mix(unten,oben,t),1.0); }",
  }));
  himmel.position.set(B / 2, 0, T / 2);
  szene.add(himmel);

  // Hügel und Berge
  const huegel = mat("#5a9a40");
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + hash(i, 1) * 0.3;
    const r = 70 + hash(i, 2) * 30;
    const h = netz(new THREE.SphereGeometry(18 + hash(i, 3) * 14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), huegel, false);
    h.scale.y = 0.35 + hash(i, 4) * 0.3;
    h.position.set(B / 2 + Math.cos(a) * r, -1, T / 2 + Math.sin(a) * r);
    szene.add(h);
  }
  const berg = mat("#6a7c98");
  const schnee = mat("#f4f8ff");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const r = 170 + hash(i, 5) * 40;
    const hoehe = 45 + hash(i, 6) * 40;
    const k = netz(new THREE.ConeGeometry(30 + hash(i, 7) * 20, hoehe, 6), berg, false);
    k.position.set(B / 2 + Math.cos(a) * r, hoehe / 2 - 4, T / 2 + Math.sin(a) * r);
    k.rotation.y = hash(i, 8) * 3;
    szene.add(k);
    const kappe = netz(new THREE.ConeGeometry((30 + hash(i, 7) * 20) * 0.3, hoehe * 0.3, 6), schnee, false);
    kappe.position.set(k.position.x, hoehe - 4 - hoehe * 0.15, k.position.z);
    kappe.rotation.y = k.rotation.y;
    szene.add(kappe);
  }
  // Wolken
  const wolken = new THREE.Group();
  const weiss = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true, emissive: "#c8d8f0", emissiveIntensity: 0.25 });
  for (let i = 0; i < 9; i++) {
    const w = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(5 + hash(i, j) * 4, 1), weiss);
      b.position.set(j * 6 - 9, hash(i, j + 5) * 2, hash(i, j + 9) * 4);
      b.scale.y = 0.55;
      w.add(b);
    }
    const a = (i / 9) * Math.PI * 2;
    w.position.set(B / 2 + Math.cos(a) * 120, 55 + hash(i, 3) * 25, T / 2 + Math.sin(a) * 120);
    wolken.add(w);
  }
  szene.add(wolken);
  return { wolken };
}

// ---------- Natur ----------

export function baeumeBauen(szene, raster) {
  const positionen = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => { if (z === "T") positionen.push([tx, ty]); }));
  const stammGeo = new THREE.CylinderGeometry(0.22, 0.34, 1.8, 7);
  stammGeo.translate(0, 0.9, 0);
  const kroneGeo = new THREE.IcosahedronGeometry(1, 1);
  const staemme = new THREE.InstancedMesh(stammGeo, mat("#6b4a2e"), positionen.length);
  const kronen = new THREE.InstancedMesh(kroneGeo, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), positionen.length * 3);
  staemme.castShadow = kronen.castShadow = true;
  staemme.receiveShadow = kronen.receiveShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const farbe = new THREE.Color();
  positionen.forEach(([tx, ty], i) => {
    const x = welt(tx) + (hash(tx, ty, 1) - 0.5) * 0.6, z = welt(ty) + (hash(tx, ty, 2) - 0.5) * 0.6;
    const g = 0.9 + hash(tx, ty, 3) * 0.45;
    m.compose(p.set(x, 0, z), q.identity(), s.set(g, g, g));
    staemme.setMatrixAt(i, m);
    for (let j = 0; j < 3; j++) {
      const r = (j === 0 ? 1.45 : 1.0) * g;
      const off = j === 0 ? [0, 0] : [(j === 1 ? -0.7 : 0.7) * g, (hash(tx, ty, 9 + j) - 0.5) * g];
      q.setFromEuler(new THREE.Euler(hash(tx, ty, 4 + j), hash(tx, ty, 5 + j) * 3, 0));
      m.compose(p.set(x + off[0], (j === 0 ? 2.9 : 2.3) * g, z + off[1]), q, s.set(r, r * 0.9, r));
      kronen.setMatrixAt(i * 3 + j, m);
      farbe.setHSL(0.28 + hash(tx, ty, 6 + j) * 0.05, 0.5, 0.3 + hash(tx, ty, 7 + j) * 0.1);
      kronen.setColorAt(i * 3 + j, farbe);
    }
  });
  szene.add(staemme, kronen);
}

export function wieseBauen(szene, raster) {
  const blumen = [];
  const buesche = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z === "F") for (let i = 0; i < 9; i++) blumen.push([welt(tx) + (hash(tx, ty, i) - 0.5) * 1.8, welt(ty) + (hash(tx, ty, i + 20) - 0.5) * 1.8, i]);
    if (z === "." || z === "F") for (let i = 0; i < 4; i++) if (hash(tx, ty, i + 40) > 0.4) buesche.push([welt(tx) + (hash(tx, ty, i + 50) - 0.5) * 1.9, welt(ty) + (hash(tx, ty, i + 60) - 0.5) * 1.9]);
  }));
  const bluete = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true }), blumen.length);
  const stiel = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4).translate(0, 0.15, 0), mat("#3a7a2a"), blumen.length);
  const farben = ["#f04858", "#f8d848", "#ffffff", "#78a8f8", "#f890c0"].map((c) => new THREE.Color(c));
  const m = new THREE.Matrix4();
  blumen.forEach(([x, z, i], n) => {
    m.makeTranslation(x, 0, z); stiel.setMatrixAt(n, m);
    m.makeTranslation(x, 0.3, z); bluete.setMatrixAt(n, m);
    bluete.setColorAt(n, farben[(i + Math.floor(x)) % farben.length]);
  });
  // Grasbüschel aus drei schmalen Halmen
  const halm = new THREE.ConeGeometry(0.035, 0.26, 3).translate(0, 0.13, 0);
  const gras = new THREE.InstancedMesh(halm, new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), buesche.length * 3);
  const gfarbe = new THREE.Color();
  buesche.forEach(([x, z], n) => {
    for (let j = 0; j < 3; j++) {
      const neigung = (j - 1) * 0.35 + (hash(n, j) - 0.5) * 0.2;
      m.compose(new THREE.Vector3(x + (j - 1) * 0.05, 0, z + (hash(n, j + 3) - 0.5) * 0.08),
        new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(n, j + 6) - 0.5) * 0.3, x * 3, neigung)),
        new THREE.Vector3(1, 0.7 + hash(n, j + 9) * 0.7, 1));
      gras.setMatrixAt(n * 3 + j, m);
      gfarbe.setHSL(0.27 + hash(n, j + 12) * 0.04, 0.55, 0.32 + hash(n, j + 15) * 0.1);
      gras.setColorAt(n * 3 + j, gfarbe);
    }
  });
  szene.add(bluete, stiel, gras);
}

export function zaunBauen(szene, raster) {
  const holz = texturMaterial("holz", () => holzTextur("#9a6a3a"));
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z !== "f") return;
    const pfahl = netz(new THREE.BoxGeometry(0.16, 1.0, 0.16), holz);
    pfahl.position.set(welt(tx) - 0.8, 0.5, welt(ty));
    szene.add(pfahl);
    for (const y of [0.4, 0.75]) {
      const latte = netz(new THREE.BoxGeometry(2, 0.1, 0.06), holz);
      latte.position.set(welt(tx), y, welt(ty));
      szene.add(latte);
    }
  }));
}

// ---------- Häuser ----------

const DACHFARBE = { rathaus: "#4e6ab8", wohnhaus: "#c84a36", schmiede: "#5a4e4a" };

export function haeuserBauen(szene, raster, animationen) {
  for (const h of haeuserFinden(raster)) {
    const B = h.w * E, T = h.h * E, H = 3.4;
    const gruppe = new THREE.Group();
    gruppe.position.set(h.x * E + B / 2, 0, h.y * E + T / 2);
    const putz = h.art === "schmiede" ? "#c8b898" : "#efe2c4";
    const vorn = new THREE.MeshStandardMaterial({ map: textur(wandTextur({ breite: B, hoehe: H, tuer: (h.tuer + 0.5) * E, art: h.art, farbe: putz })), roughness: 0.9 });
    const seite = new THREE.MeshStandardMaterial({ map: textur(wandTextur({ breite: T, hoehe: H, fenster: true, art: h.art, farbe: putz })), roughness: 0.9 });
    const hinten = new THREE.MeshStandardMaterial({ map: textur(wandTextur({ breite: B, hoehe: H, fenster: false, art: h.art, farbe: putz })), roughness: 0.9 });
    const wand = netz(new THREE.BoxGeometry(B, H, T), [seite, seite, mat(putz), mat(putz), vorn, hinten]);
    wand.position.y = H / 2;
    gruppe.add(wand);

    // Satteldach (First parallel zur Vorderseite)
    const ueber = 0.5, firstH = 2.6;
    const form = new THREE.Shape();
    form.moveTo(-T / 2 - ueber, 0); form.lineTo(T / 2 + ueber, 0); form.lineTo(0, firstH); form.closePath();
    const dachGeo = new THREE.ExtrudeGeometry(form, { depth: B + ueber * 2, bevelEnabled: false });
    dachGeo.rotateY(Math.PI / 2);
    dachGeo.translate(-B / 2 - ueber, H, 0);
    const dachTex = textur(dachTextur(DACHFARBE[h.art]), { wiederholen: true });
    dachTex.repeat.set(0.35, 0.35);
    const dach = netz(dachGeo, new THREE.MeshStandardMaterial({ map: dachTex, roughness: 0.8 }));
    gruppe.add(dach);
    // Giebel (verputzt)
    for (const s of [-1, 1]) {
      const giebel = new THREE.Shape();
      giebel.moveTo(-T / 2, 0); giebel.lineTo(T / 2, 0); giebel.lineTo(0, firstH - 0.35); giebel.closePath();
      const g = netz(new THREE.ShapeGeometry(giebel).rotateY(Math.PI / 2 * s), mat(putz, { side: THREE.DoubleSide }));
      g.position.set(s * (B / 2 + 0.01), H, 0);
      gruppe.add(g);
    }
    // Schornstein
    const kamin = netz(new THREE.BoxGeometry(0.7, 2.2, 0.7), texturMaterial("stein", () => steinTextur("#9a8a80")));
    kamin.position.set(B / 2 - 1.4, H + 1.9, -0.5);
    gruppe.add(kamin);
    if (h.art === "schmiede") animationen.push(rauchErzeugen(szene, gruppe.position.x + B / 2 - 1.4, H + 3.1, gruppe.position.z - 0.5));

    // Blumenkästen unter den Fenstern der Vorderseite
    if (h.art !== "schmiede") {
      const pfosten = Math.max(2, Math.round(B / 2.2));
      for (let i = 0; i < pfosten; i++) {
        const mx = ((i + 0.5) / pfosten) * B - B / 2;
        if (Math.abs(mx - ((h.tuer + 0.5) * E - B / 2)) < 1.3) continue;
        const kasten = netz(new THREE.BoxGeometry(1.0, 0.2, 0.25), mat("#6a4426"));
        kasten.position.set(mx, H * 0.53, T / 2 + 0.12);
        gruppe.add(kasten);
        for (let j = 0; j < 5; j++) {
          const bl = netz(new THREE.IcosahedronGeometry(0.08, 0), mat(["#f04858", "#f8d848", "#f890c0"][j % 3]), false);
          bl.position.set(mx - 0.4 + j * 0.2, H * 0.53 + 0.15, T / 2 + 0.14);
          gruppe.add(bl);
        }
      }
    }
    // Stufe vor der Tür
    const stufe = netz(new THREE.BoxGeometry(1.4, 0.15, 0.6), texturMaterial("stein", () => steinTextur()));
    stufe.position.set((h.tuer + 0.5) * E - B / 2, 0.07, T / 2 + 0.3);
    gruppe.add(stufe);
    if (h.art === "rathaus") {
      for (const s of [-1, 1]) {
        const mast = netz(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 6), mat("#6a4426"));
        mast.position.set((h.tuer + 0.5) * E - B / 2 + s * 1.5, 1.45, T / 2 + 0.4);
        const fahne = netz(new THREE.PlaneGeometry(0.7, 0.9, 6, 1), mat("#3a5ab0", { side: THREE.DoubleSide }));
        fahne.position.set(mast.position.x + 0.36, 2.4, mast.position.z);
        const fpos = fahne.geometry.attributes.position, fbasis = Float32Array.from(fpos.array);
        animationen.push((t) => {
          for (let i = 0; i < fpos.count; i++) fpos.array[i * 3 + 2] = Math.sin(fbasis[i * 3] * 5 + t * 4) * 0.08 * (fbasis[i * 3] + 0.35);
          fpos.needsUpdate = true;
        });
        gruppe.add(mast, fahne);
      }
    }
    if (h.art === "schmiede") {
      const glut = new THREE.PointLight("#ff8a30", 6, 6, 2);
      glut.position.set((h.tuer + 0.5) * E - B / 2, 1.2, T / 2 + 0.8);
      gruppe.add(glut);
      animationen.push((t) => { glut.intensity = 5 + Math.sin(t * 9) * 1.2 + Math.sin(t * 23) * 0.6; });
    }
    szene.add(gruppe);
  }
}

function rauchErzeugen(szene, x, y, z) {
  const tex = textur(lichtTextur("rgba(225,225,235,0.9)"));
  const wolken = [];
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.userData.versatz = i / 8;
    szene.add(s);
    wolken.push(s);
  }
  return (t) => {
    for (const s of wolken) {
      const p = (t * 0.18 + s.userData.versatz) % 1;
      s.position.set(x + p * 1.6 + Math.sin(p * 6) * 0.2, y + p * 4, z - p * 0.6);
      s.scale.setScalar(0.6 + p * 2.2);
      s.material.opacity = (1 - p) * 0.75;
    }
  };
}

// ---------- Objekte aus der Kartendefinition ----------

export function objektBauen(o, animationen) {
  const g = new THREE.Group();
  const holz = texturMaterial("holz", () => holzTextur("#8a5a32"));
  const stein = texturMaterial("stein", () => steinTextur());
  if (o.bild === "marktstand") {
    const tisch = netz(new THREE.BoxGeometry(3.4, 0.9, 1.1), holz); tisch.position.y = 0.45; g.add(tisch);
    for (const sx of [-1.6, 1.6]) for (const sz of [-0.45, 0.45]) {
      const pfosten = netz(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), holz);
      pfosten.position.set(sx, 1.2, sz - 0.1); g.add(pfosten);
    }
    const markise = netz(new THREE.PlaneGeometry(3.8, 1.8), new THREE.MeshStandardMaterial({ map: textur(markiseTextur()), side: THREE.DoubleSide, roughness: 0.9 }));
    markise.rotation.x = -Math.PI / 2 + 0.45; markise.position.set(0, 2.35, 0.1); g.add(markise);
    const warenfarben = ["#d83a3a", "#e04a3a", "#c8903a", "#d8a050", "#6ab040", "#7ac050"];
    for (let i = 0; i < 12; i++) {
      const w = netz(new THREE.IcosahedronGeometry(0.14 + (i % 3) * 0.02, 1), mat(warenfarben[Math.floor(i / 2)]));
      w.position.set(-1.4 + i * 0.25, 1.02, (i % 2) * 0.25 - 0.1); g.add(w);
    }
    for (const sx of [-1.9, 1.9]) { const kiste = netz(new THREE.BoxGeometry(0.6, 0.5, 0.6), holz); kiste.position.set(sx, 0.25, 0.6); g.add(kiste); }
  } else if (o.bild === "amboss") {
    const stumpf = netz(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 9), mat("#7a5232")); stumpf.position.y = 0.3; g.add(stumpf);
    const eisen = mat("#4a4a58", { metalness: 0.7, roughness: 0.35 });
    const fuss = netz(new THREE.BoxGeometry(0.4, 0.3, 0.3), eisen); fuss.position.y = 0.75; g.add(fuss);
    const oben = netz(new THREE.BoxGeometry(0.9, 0.22, 0.38), eisen); oben.position.y = 0.98; g.add(oben);
    const horn = netz(new THREE.ConeGeometry(0.14, 0.45, 6), eisen); horn.rotation.z = Math.PI / 2; horn.position.set(-0.65, 0.98, 0); g.add(horn);
    const hammer = netz(new THREE.BoxGeometry(0.28, 0.12, 0.12), eisen); hammer.position.set(0.2, 1.15, 0.05); g.add(hammer);
  } else if (o.bild === "brett") {
    for (const sx of [-0.8, 0.8]) { const p = netz(new THREE.BoxGeometry(0.14, 2.3, 0.14), holz); p.position.set(sx, 1.15, 0); g.add(p); }
    const tafel = netz(new THREE.BoxGeometry(2.0, 1.4, 0.1), [holz, holz, holz, holz, new THREE.MeshStandardMaterial({ map: textur(aushangTextur()), roughness: 0.9 }), holz]);
    tafel.position.set(0, 1.55, 0.05); g.add(tafel);
    const dach = netz(new THREE.BoxGeometry(2.3, 0.1, 0.6), mat("#6a4a2a")); dach.position.set(0, 2.35, 0.1); dach.rotation.x = 0.25; g.add(dach);
  } else if (o.bild === "brunnen") {
    const ring = netz(new THREE.CylinderGeometry(0.85, 0.9, 0.8, 14, 1, true), stein); ring.position.y = 0.4; g.add(ring);
    const rand = netz(new THREE.TorusGeometry(0.85, 0.1, 6, 16), stein); rand.rotation.x = Math.PI / 2; rand.position.y = 0.8; g.add(rand);
    const wasser = netz(new THREE.CircleGeometry(0.8, 16).rotateX(-Math.PI / 2), mat("#2a5a9a", { roughness: 0.1 }), false); wasser.position.y = 0.55; g.add(wasser);
    for (const sx of [-0.8, 0.8]) { const p = netz(new THREE.BoxGeometry(0.12, 2.0, 0.12), holz); p.position.set(sx, 1.0, 0); g.add(p); }
    const form = new THREE.Shape(); form.moveTo(-0.7, 0); form.lineTo(0.7, 0); form.lineTo(0, 0.6); form.closePath();
    const dach = netz(new THREE.ExtrudeGeometry(form, { depth: 2.1, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-1.05, 2.0, 0), mat("#b84a36"));
    g.add(dach);
    const eimer = netz(new THREE.CylinderGeometry(0.15, 0.12, 0.25, 8), holz); eimer.position.set(0, 1.4, 0); g.add(eimer);
    const seil = netz(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 3), mat("#d8c8a0")); seil.position.set(0, 1.75, 0); g.add(seil);
  } else if (o.art === "portal") {
    const ring = netz(new THREE.TorusGeometry(1.6, 0.18, 6, 24), stein); ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; g.add(ring);
    const scheibe = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: "#3a3448", emissive: "#3a9aff", emissiveIntensity: 0, roughness: 0.4, transparent: true, opacity: 0.95 }));
    scheibe.position.y = 0.06; g.add(scheibe);
    const runen = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const st = netz(new THREE.BoxGeometry(0.35, 1.0 + (i % 2) * 0.4, 0.25), stein);
      st.position.set(Math.cos(a) * 2.0, 0.5 + (i % 2) * 0.2, Math.sin(a) * 2.0); st.rotation.y = -a; g.add(st);
      const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.3), new THREE.MeshStandardMaterial({ color: "#2a2a38", emissive: "#80e0ff", emissiveIntensity: 0 }));
      rune.position.set(Math.cos(a) * 1.86, 0.65, Math.sin(a) * 1.86); rune.lookAt(0, 0.65, 0); g.add(rune);
      runen.push(rune);
    }
    const licht = new THREE.PointLight("#60c0ff", 0, 9, 2); licht.position.y = 1.0; g.add(licht);
    const funken = new THREE.Group();
    const ftex = textur(lichtTextur("rgba(170,230,255,1)"));
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ftex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.setScalar(0.25); s.userData.a = (i / 14) * Math.PI * 2; s.userData.v = 0.6 + hash(i, 2) * 0.8;
      funken.add(s);
    }
    g.add(funken);
    g.userData.setzeAktiv = (an) => { g.userData.aktiv = an; };
    animationen.push((t) => {
      const an = g.userData.aktiv;
      scheibe.material.emissiveIntensity = an ? 1.6 + Math.sin(t * 3) * 0.4 : 0;
      scheibe.material.color.set(an ? "#2a6ad0" : "#3a3448");
      licht.intensity = an ? 7 + Math.sin(t * 3) * 2 : 0;
      for (const r of runen) r.material.emissiveIntensity = an ? 1.5 : 0;
      funken.visible = Boolean(an);
      funken.children.forEach((s) => {
        const p = (t * 0.35 * s.userData.v + s.userData.a) % 1;
        s.position.set(Math.cos(s.userData.a + t) * 1.2 * (1 - p * 0.5), p * 2.5, Math.sin(s.userData.a + t) * 1.2 * (1 - p * 0.5));
        s.material.opacity = 1 - p;
      });
    });
  }
  g.traverse((x) => { if (x.isMesh) { x.castShadow = x.castShadow ?? true; } });
  return g;
}

export { mat };
