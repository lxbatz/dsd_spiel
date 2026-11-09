// Lythara – Die Inseln der Stimmen in 3D.
// Schwebende Felsinseln im Abendhimmel über einem Wolkenmeer, verbunden durch magische Brücken.
// Jede Insel hat ein eigenes Thema:
//   Ankunft        – Runenkreis, das zerbrochene Siegel (Weg zurück in die Halle), Laternen
//   Echos          – Grotte mit Wasserbecken, Echo-Ringe, Wasserfall über die Inselkante
//   Erinnerungen   – Herbstgarten mit rotgoldenen Bäumen, Laternen, schwebenden Erinnerungsbildern
//   Waage          – Marmorterrasse mit Säulenkranz und einer riesigen goldenen Waage
//   Siegel         – Sternwarte: Sternkarte am Boden, Kuppelbögen, Fernrohr, Planetenmodell
// In der Ferne: die Halle der Tausend Tore auf ihrem Berg, kleine schwebende Inseln, zwei Monde.
// Form und Lage der Inseln kommen aus src/welt/inseln_layout.js.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, RING, KASTEN, KEGEL, DREH, V, torwaechterBauen } from "./figuren.js";
import { textur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { lichtpunkteBauen, voegelBauen } from "./effekte.js";
import { WAECHTER, kristallBauen, buchBauen, pultBauen, strahlTextur } from "./halle3d.js";
import { randFaktor, HINDERNIS, BLOCKIERT } from "../welt/inseln_layout.js";

const THEMA_FARBE = { ankunft: "#c9a24e", echos: "#58d8f0", erinnerungen: "#ffb347", waage: "#7aff9a", siegel: "#b48aff" };

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

/** Boden je Thema (wiederholbar, 256 px ≈ 6 Welteinheiten). */
function bodenTextur(thema) {
  const [c, g] = leinwand(256, 256);
  const fleck = (farben, n, rMin, rMax, s) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = farben[i % farben.length];
      g.globalAlpha = 0.25 + hash(i, 1, s) * 0.5;
      g.beginPath();
      g.arc(hash(i, 2, s) * 256, hash(i, 3, s) * 256, rMin + hash(i, 4, s) * (rMax - rMin), 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  };
  if (thema === "waage") {
    // Heller Marmor mit Goldfugen
    g.fillStyle = "#e8e4dc"; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      g.fillStyle = (x + y) % 2 ? "#f4f1ea" : "#d8d2c8";
      g.fillRect(x * 128 + 2, y * 128 + 2, 124, 124);
    }
    g.strokeStyle = "rgba(150,140,130,0.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      let x = hash(i, 1, 7) * 256, y = hash(i, 2, 7) * 256;
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (hash(i, k, 8) - 0.5) * 60; y += (hash(i, k, 9) - 0.3) * 40; g.lineTo(x, y); }
      g.stroke();
    }
    g.strokeStyle = "#c9a24e"; g.lineWidth = 4;
    g.strokeRect(2, 2, 252, 252); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
    return c;
  }
  if (thema === "siegel") {
    // Nachtblauer Stein mit Sternbildern
    g.fillStyle = "#26254a"; g.fillRect(0, 0, 256, 256);
    fleck(["#30305a", "#1c1c3a", "#2c2a52"], 60, 6, 26, 21);
    g.strokeStyle = "rgba(10,10,30,0.6)"; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
    g.strokeStyle = "rgba(230,200,120,0.55)"; g.lineWidth = 1.4; g.fillStyle = "#ffe6a0";
    for (let s = 0; s < 4; s++) {
      const punkte = Array.from({ length: 4 + (s % 2) }, (_, k) => [30 + hash(s, k, 31) * 196, 30 + hash(s, k, 32) * 196]);
      g.beginPath(); punkte.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      for (const [x, y] of punkte) { g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); }
    }
    return c;
  }
  if (thema === "erinnerungen") {
    g.fillStyle = "#7a7a3a"; g.fillRect(0, 0, 256, 256);
    fleck(["#8a8440", "#6a6a30", "#94884a"], 90, 8, 30, 41);
    fleck(["#d8782a", "#c84a2a", "#e8b040", "#a8402a"], 150, 2, 5, 42);   // Laub
    return c;
  }
  if (thema === "echos") {
    g.fillStyle = "#4a7a6a"; g.fillRect(0, 0, 256, 256);
    fleck(["#3e6e60", "#5a8a74", "#4a6a6a"], 90, 8, 30, 51);
    fleck(["#7a8a88", "#6a7472"], 22, 6, 14, 52);                         // Kiesel
    return c;
  }
  // Ankunft: heller Stein mit Moos
  g.fillStyle = "#9a94a8"; g.fillRect(0, 0, 256, 256);
  fleck(["#a8a2b4", "#8a8498", "#9ca0a0"], 70, 10, 34, 61);
  fleck(["#6a8a5a", "#7a9a62"], 40, 4, 12, 62);
  g.strokeStyle = "rgba(60,56,80,0.18)"; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) g.strokeRect(i * 64 + (k % 2) * 32, k * 64, 64, 64);
  return c;
}

function wolkenTextur(seed, hell = "#fff4f8", schatten = "#c8a8c8") {
  const [c, g] = leinwand(512, 512);
  g.fillStyle = schatten; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = hash(i, 1, seed) * 512, y = hash(i, 2, seed) * 512, r = 18 + hash(i, 3, seed) * 70;
    const v = g.createRadialGradient(x, y, 0, x, y, r);
    v.addColorStop(0, hell); v.addColorStop(1, "rgba(255,240,250,0)");
    g.fillStyle = v;
    for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { g.save(); g.translate(dx, dy); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore(); }
  }
  return c;
}

function runenkreisTextur(farbe) {
  const [c, g] = leinwand(512, 512);
  g.translate(256, 256);
  g.strokeStyle = farbe; g.fillStyle = farbe; g.lineWidth = 6;
  for (const r of [235, 200, 120]) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
  g.font = "bold 34px serif"; g.textAlign = "center"; g.textBaseline = "middle";
  const zeichen = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
  for (let i = 0; i < 24; i++) {
    g.save(); g.rotate((i / 24) * Math.PI * 2); g.fillText(zeichen[i], 0, -218); g.restore();
  }
  g.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 * 2 - Math.PI / 2;
    const b = ((i + 1) / 5) * Math.PI * 2 * 2 - Math.PI / 2;
    g.beginPath(); g.moveTo(Math.cos(a) * 120, Math.sin(a) * 120); g.lineTo(Math.cos(b) * 120, Math.sin(b) * 120); g.stroke();
  }
  return c;
}

function wasserfallTextur() {
  const [c, g] = leinwand(64, 256);
  g.fillStyle = "rgba(200,240,255,0.55)"; g.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(255,255,255,${0.3 + hash(i, 1, 71) * 0.6})`;
    g.fillRect(hash(i, 2, 71) * 64, hash(i, 3, 71) * 256, 1 + hash(i, 4, 71) * 3, 20 + hash(i, 5, 71) * 60);
  }
  return c;
}

/** Erinnerungsbilder: einfache gemalte Szenen aus der Arbeitswelt. */
function bildTextur(art) {
  const [c, g] = leinwand(256, 192);
  const himmel = g.createLinearGradient(0, 0, 0, 192);
  himmel.addColorStop(0, art === "bahnhof" ? "#f4b880" : "#a8d0f0"); himmel.addColorStop(1, "#f8ead0");
  g.fillStyle = himmel; g.fillRect(0, 0, 256, 192);
  if (art === "kueche") {
    g.fillStyle = "#c8b8a0"; g.fillRect(0, 110, 256, 82);
    g.fillStyle = "#8a8a94"; g.fillRect(30, 70, 120, 50); g.fillStyle = "#2a2a30"; g.fillRect(40, 80, 100, 30);
    g.fillStyle = "#d84a2a"; g.beginPath(); g.ellipse(70, 70, 22, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e8e8f0"; g.fillRect(170, 40, 40, 70); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(190, 38, 16, Math.PI, 0); g.fill();
    g.fillStyle = "#f4f4f4"; g.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(70 + i * 8, 50 - i * 12, 7, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
  } else if (art === "werkstatt") {
    g.fillStyle = "#9a7a5a"; g.fillRect(0, 120, 256, 72);
    g.fillStyle = "#6a4a2e"; g.fillRect(20, 100, 216, 20);
    g.fillStyle = "#5a5a64"; g.fillRect(40, 60, 12, 40); g.fillRect(36, 56, 20, 8);
    g.fillStyle = "#c84a2a"; g.fillRect(120, 80, 60, 20); g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(130, 102, 9, 0, Math.PI * 2); g.arc(170, 102, 9, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#5a5a64"; g.lineWidth = 5; g.beginPath(); g.moveTo(200, 40); g.lineTo(230, 90); g.stroke();
  } else if (art === "hotel") {
    g.fillStyle = "#e8d8b8"; g.fillRect(50, 40, 156, 152);
    g.fillStyle = "#6a8ac8"; for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) g.fillRect(64 + x * 36, 56 + y * 34, 22, 20);
    g.fillStyle = "#8a3a2a"; g.fillRect(110, 150, 36, 42);
    g.fillStyle = "#c8a040"; g.font = "bold 20px serif"; g.textAlign = "center"; g.fillText("HOTEL", 128, 34);
  } else {
    // Bahnhof mit Zug: Abreise ins Ausland
    g.fillStyle = "#8a8a8a"; g.fillRect(0, 140, 256, 52);
    g.fillStyle = "#5a5a64"; g.fillRect(0, 150, 256, 6);
    g.fillStyle = "#2a6ab8"; g.fillRect(20, 96, 170, 48); g.fillStyle = "#c8e0f8"; for (let i = 0; i < 4; i++) g.fillRect(34 + i * 38, 106, 26, 18);
    g.fillStyle = "#2a6ab8"; g.beginPath(); g.moveTo(190, 96); g.lineTo(226, 120); g.lineTo(226, 144); g.lineTo(190, 144); g.fill();
    g.fillStyle = "#3a3a40"; g.fillRect(230, 60, 6, 80); g.fillStyle = "#f8f0c0"; g.beginPath(); g.arc(233, 58, 8, 0, Math.PI * 2); g.fill();
  }
  // Rahmen-Vignette
  const v = g.createRadialGradient(128, 96, 60, 128, 96, 150);
  v.addColorStop(0, "rgba(255,240,210,0)"); v.addColorStop(1, "rgba(120,80,40,0.55)");
  g.fillStyle = v; g.fillRect(0, 0, 256, 192);
  return c;
}

// ---------- Himmel und Ferne ----------

function himmelBauen(szene, mitte, sonnenRichtung) {
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(520, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      zenit: { value: new THREE.Color("#1c2462") },
      mitte: { value: new THREE.Color("#6e4c9e") },
      horizont: { value: new THREE.Color("#ffad7a") },
      tief: { value: new THREE.Color("#c48cb4") },
      sonne: { value: sonnenRichtung.clone().normalize() },
    },
    vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 zenit; uniform vec3 mitte; uniform vec3 horizont; uniform vec3 tief; uniform vec3 sonne; varying vec3 p;
      void main(){
        float h = p.y;
        vec3 c = h > 0.0 ? mix(mix(horizont, mitte, smoothstep(0.0, 0.22, h)), zenit, smoothstep(0.18, 0.75, h)) : mix(horizont, tief, smoothstep(0.0, -0.25, h));
        float s = max(dot(p, sonne), 0.0);
        c += vec3(1.0, 0.72, 0.45) * (pow(s, 600.0) * 1.6 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.12);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  himmel.position.copy(mitte);
  himmel.renderOrder = -10;
  szene.add(himmel);

  // Sterne im oberen Himmel
  const n = 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, 81) * Math.PI * 2, h = 0.25 + hash(i, 2, 81) * 0.75;
    const r = Math.sqrt(1 - h * h);
    pos.set([Math.cos(a) * r * 480, h * 480, Math.sin(a) * r * 480], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const sterne = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#fff4e0", size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.7, fog: false, depthWrite: false }));
  sterne.position.copy(mitte);
  szene.add(sterne);

  // Zwei Monde
  const mondTex = textur((() => {
    const [c, g] = leinwand(128, 128);
    const v = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    v.addColorStop(0, "rgba(255,250,240,1)"); v.addColorStop(0.42, "rgba(240,236,230,1)"); v.addColorStop(0.47, "rgba(240,220,255,0.35)"); v.addColorStop(1, "rgba(200,180,255,0)");
    g.fillStyle = v; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(180,170,190,0.45)";
    for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(44 + hash(i, 1, 91) * 40, 44 + hash(i, 2, 91) * 40, 3 + hash(i, 3, 91) * 7, 0, Math.PI * 2); g.fill(); }
    return c;
  })());
  for (const [x, y, z, s, farbe] of [[160, 190, -380, 120, "#ffffff"], [260, 130, -300, 46, "#ffd8f0"]]) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: mondTex, color: farbe, fog: false, depthWrite: false, transparent: true }));
    m.position.set(mitte.x + x, y, mitte.z + z);
    m.scale.setScalar(s);
    m.renderOrder = -9;
    szene.add(m);
  }
}

function wolkenmeerBauen(szene, mitte, animationen, qualitaet) {
  const unten = textur(wolkenTextur(5), { wiederholen: true });
  unten.repeat.set(5, 5);
  const meer = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: unten, color: "#f0d0e0" }));
  meer.position.set(mitte.x, -34, mitte.z);
  szene.add(meer);
  const oben = textur(wolkenTextur(9, "#ffffff", "rgba(255,230,240,0)"), { wiederholen: true });
  oben.repeat.set(3, 3);
  const schleier = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: oben, transparent: true, opacity: 0.55, depthWrite: false }));
  schleier.position.set(mitte.x, -24, mitte.z);
  szene.add(schleier);
  animationen.push((t) => {
    unten.offset.set(t * 0.002, t * 0.0012);
    oben.offset.set(-t * 0.003, t * 0.002);
  });

  // Einzelne Wolkenballen unter und neben den Inseln
  const weiss = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true, emissive: "#e8b8d0", emissiveIntensity: 0.35 });
  const anzahl = qualitaet.partikel >= 1 ? 22 : 12;
  const ballen = [];
  for (let i = 0; i < anzahl; i++) {
    const w = new THREE.Group();
    const teile = 3 + Math.floor(hash(i, 1, 101) * 3);
    for (let j = 0; j < teile; j++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + hash(i, j, 102) * 5, 1), weiss);
      b.position.set(j * 6 - teile * 3, hash(i, j, 103) * 2.5, hash(i, j, 104) * 5 - 2.5);
      b.scale.y = 0.5;
      w.add(b);
    }
    const a = hash(i, 2, 101) * Math.PI * 2, r = 40 + hash(i, 3, 101) * 160;
    w.position.set(mitte.x + Math.cos(a) * r, -10 - hash(i, 4, 101) * 16, mitte.z + Math.sin(a) * r * 1.3);
    w.userData.v = 0.4 + hash(i, 5, 101) * 0.8;
    szene.add(w);
    ballen.push(w);
  }
  animationen.push((t, dt = 0.016) => {
    for (const w of ballen) {
      w.position.x += w.userData.v * dt;
      if (w.position.x > mitte.x + 230) w.position.x = mitte.x - 230;
    }
  });
}

/** Ein schwebender Felsen (für Inseln und Deko-Inseln): unregelmäßiger Kegel nach unten. */
function felsGeometrie(randPunkte, tiefe, seed) {
  const ringe = 7, n = randPunkte.length;
  const pos = [], farben = [], idx = [];
  const cx = randPunkte.reduce((s, p) => s + p.x, 0) / n, cz = randPunkte.reduce((s, p) => s + p.y, 0) / n;
  const farbe = new THREE.Color();
  for (let k = 0; k <= ringe; k++) {
    const t = k / ringe;
    const f = 1 - Math.pow(t, 1.35) * 0.96;
    const y = -0.5 - t * tiefe;
    for (let i = 0; i < n; i++) {
      const p = randPunkte[i];
      const zufall = k === 0 ? 1 : 1 + (hash(i, k, seed) - 0.5) * 0.22;
      pos.push(cx + (p.x - cx) * f * zufall, y + (k ? (hash(i, k, seed + 1) - 0.5) * tiefe * 0.08 : 0), cz + (p.y - cz) * f * zufall);
      farbe.set(t < 0.12 ? "#6a4a32" : t < 0.5 ? "#7a7088" : "#5a5068");
      const hell = 0.85 + hash(i, k, seed + 2) * 0.3;
      farben.push(farbe.r * hell, farbe.g * hell, farbe.b * hell);
    }
  }
  pos.push(cx, -0.5 - tiefe * 1.12, cz);
  farben.push(0.3, 0.27, 0.36);
  for (let k = 0; k < ringe; k++) for (let i = 0; i < n; i++) {
    const a = k * n + i, b = k * n + (i + 1) % n, c = (k + 1) * n + i, d = (k + 1) * n + (i + 1) % n;
    idx.push(a, b, c, b, d, c);
  }
  const spitze = (ringe + 1) * n;
  for (let i = 0; i < n; i++) idx.push(ringe * n + i, ringe * n + (i + 1) % n, spitze);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(farben, 3));
  g.setIndex(idx);
  const ohneIndex = g.toNonIndexed();
  ohneIndex.computeVertexNormals();
  return ohneIndex;
}

const felsMaterial = () => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });

/** Ferne Deko: kleine schwebende Inseln mit Bäumen und die Halle der Tausend Tore auf ihrem Berg. */
function ferneBauen(szene, mitte, animationen, B, T) {
  const material = felsMaterial();
  const gras = new THREE.MeshStandardMaterial({ color: "#6a9a5a", roughness: 1, flatShading: true });
  const kleine = [];
  for (let i = 0; i < 12; i++) {
    const a = hash(i, 1, 111) * Math.PI * 2, r = 70 + hash(i, 2, 111) * 120;
    const gr = 3 + hash(i, 3, 111) * 6;
    const punkte = Array.from({ length: 14 }, (_, k) => {
      const w = (k / 14) * Math.PI * 2;
      const f = gr * (1 + (hash(i, k, 112) - 0.5) * 0.3);
      return new THREE.Vector2(Math.cos(w) * f, Math.sin(w) * f);
    });
    const g = new THREE.Group();
    const fels = new THREE.Mesh(felsGeometrie(punkte, gr * 1.6, 120 + i), material);
    g.add(fels);
    const deckel = new THREE.Mesh(new THREE.CylinderGeometry(gr * 1.02, gr * 0.98, 0.6, 14), gras);
    deckel.position.y = -0.3;
    g.add(deckel);
    const t = new Teile();
    for (let k = 0; k < 1 + Math.floor(gr / 3); k++) {
      const x = (hash(i, k, 113) - 0.5) * gr, z = (hash(i, k, 114) - 0.5) * gr;
      t.add(ZYL(1, 1, 6), "#5a3a22", [x, 0.8, z], [0, 0, 0], [0.15, 1.6, 0.15]);
      t.add(KEGEL(7), hash(i, k, 115) > 0.5 ? "#3a7a4a" : "#d8782a", [x, 2.2, z], [0, 0, 0], [0.9, 2.2, 0.9]);
    }
    t.in(g, { schatten: false });
    // Außerhalb des Spielbereichs (Ellipse um alle Inseln), damit nichts im Weg schwebt
    g.position.set(mitte.x + Math.cos(a) * (B / 2 + 35 + r * 0.5), -10 + hash(i, 4, 111) * 28, mitte.z + Math.sin(a) * (T / 2 + 30 + r * 0.4));
    g.userData = { y: g.position.y, p: hash(i, 5, 111) * 6 };
    szene.add(g);
    kleine.push(g);
  }
  animationen.push((t) => { for (const g of kleine) g.position.y = g.userData.y + Math.sin(t * 0.3 + g.userData.p) * 0.8; });

  // Die Halle der Tausend Tore auf einem Berg unter den Inseln (Blick zurück)
  const halle = new THREE.Group();
  const stein = "#6a6488", dach = "#3a3a6a";
  const t = new Teile();
  t.add(KEGEL(9), "#5a5468", [0, -30, 0], [0, 0.3, 0], [70, 80, 70], { verlauf: 0.5 });
  t.add(KASTEN(), stein, [0, 18, 0], [0, 0, 0], [34, 16, 22]);
  t.add(KEGEL(4), dach, [0, 33, 0], [0, Math.PI / 4, 0], [26, 14, 18]);
  for (const [x, z, h] of [[-20, -12, 34], [20, -12, 30], [-20, 12, 30], [20, 12, 36], [0, -16, 44]]) {
    t.add(ZYL(1, 1, 10), stein, [x, 10 + h / 2, z], [0, 0, 0], [4.5, h, 4.5]);
    t.add(KEGEL(10), dach, [x, 10 + h + 5, z], [0, 0, 0], [5.6, 10, 5.6]);
  }
  t.in(halle, { schatten: false });
  const fenster = new Teile();
  for (let i = 0; i < 14; i++) fenster.add(KASTEN(), "#ffd890", [-14 + (i % 7) * 4.6, 14 + Math.floor(i / 7) * 6, 11.2], [0, 0, 0], [1.4, 2.4, 0.3], { art: "leucht" });
  fenster.add(KUGEL(), "#c8a8ff", [0, 56, -16], [0, 0, 0], 2.2, { art: "leucht" });
  fenster.in(halle, { schatten: false });
  halle.position.set(mitte.x - 40, -62, mitte.z + 330);
  halle.rotation.y = 0.5;
  halle.scale.setScalar(1.25);
  szene.add(halle);
}

// ---------- Inseln ----------

function inselBauen(szene, insel, animationen) {
  const g = new THREE.Group();
  const rand = [];
  for (let k = 0; k < 64; k++) {
    const w = (k / 64) * Math.PI * 2;
    const f = randFaktor(insel, w) * 1.06 + 0.04;
    rand.push(new THREE.Vector2((insel.cx + Math.cos(w) * insel.rx * f) * E, (insel.cy + Math.sin(w) * insel.ry * f) * E));
  }
  // Oberfläche mit Grasrand
  const form = new THREE.Shape(rand);
  const deckel = new THREE.ExtrudeGeometry(form, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.25, bevelSegments: 2 });
  deckel.rotateX(Math.PI / 2);
  deckel.translate(0, -0.17, 0);
  const tex = textur(bodenTextur(insel.thema), { wiederholen: true });
  tex.repeat.set(1 / 6, 1 / 6);
  const randFarbe = { waage: "#d8d2c8", siegel: "#2c2a52", erinnerungen: "#6a5a30", echos: "#3e5e54", ankunft: "#7a7488" }[insel.thema];
  const oben = new THREE.Mesh(deckel, [new THREE.MeshStandardMaterial({ map: tex, roughness: insel.thema === "waage" ? 0.35 : 0.9, metalness: 0.02 }), new THREE.MeshStandardMaterial({ color: randFarbe, roughness: 0.9 })]);
  oben.receiveShadow = true;
  g.add(oben);
  // Fels darunter
  const tiefe = 9 + insel.rx * 0.9;
  const fels = new THREE.Mesh(felsGeometrie(rand.map((p) => p.clone()), tiefe, 200 + insel.cx), felsMaterial());
  fels.castShadow = false;
  fels.receiveShadow = true;
  g.add(fels);
  // Leuchtende Kristalle, die unten aus dem Fels wachsen
  const farbe = THEMA_FARBE[insel.thema];
  const t = new Teile();
  const mx = insel.cx * E, mz = insel.cy * E;
  for (let i = 0; i < 9; i++) {
    const w = hash(i, 1, insel.cx) * Math.PI * 2, r = (0.25 + hash(i, 2, insel.cx) * 0.4) * insel.rx * E;
    const y = -3 - hash(i, 3, insel.cx) * tiefe * 0.6;
    t.add(KEGEL(6), farbe, [mx + Math.cos(w) * r, y, mz + Math.sin(w) * r * (insel.ry / insel.rx)], [Math.PI + (hash(i, 4, insel.cx) - 0.5) * 0.6, 0, (hash(i, 5, insel.cx) - 0.5) * 0.6], [0.35, 1.6 + hash(i, 6, insel.cx) * 1.5, 0.35], { art: "leucht" });
  }
  // Randsteine
  for (let k = 0; k < 64; k += 3) {
    const p = rand[k];
    if (hash(k, 1, insel.cy) < 0.35) continue;
    t.add(KUGEL_K(), insel.thema === "waage" ? "#e8e4dc" : "#7a748a", [p.x + (mx - p.x) * 0.03, 0.1, p.y + (mz - p.y) * 0.03], [hash(k, 2, 5), hash(k, 3, 5), 0], [0.45 + hash(k, 4, 5) * 0.4, 0.3, 0.4 + hash(k, 5, 5) * 0.3]);
  }
  t.in(g);
  // Kleine Felsbrocken, die neben der Insel schweben
  const brocken = [];
  for (let i = 0; i < 4; i++) {
    const w = (i / 4) * Math.PI * 2 + hash(i, 7, insel.cy) * 1.2;
    const r = (insel.rx + 3 + hash(i, 8, insel.cy) * 3) * E;
    const s = 0.8 + hash(i, 9, insel.cy) * 1.4;
    const punkte = Array.from({ length: 8 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return new THREE.Vector2(Math.cos(a) * s, Math.sin(a) * s);
    });
    const b = new THREE.Mesh(felsGeometrie(punkte, s * 1.8, 300 + i + insel.cx), felsMaterial());
    b.position.set(mx + Math.cos(w) * r, -2 - hash(i, 10, insel.cy) * 5, mz + Math.sin(w) * r * (insel.ry / insel.rx));
    b.userData = { y: b.position.y, p: i * 1.7 };
    g.add(b);
    brocken.push(b);
  }
  animationen.push((zeit) => { for (const b of brocken) { b.position.y = b.userData.y + Math.sin(zeit * 0.5 + b.userData.p) * 0.35; b.rotation.y = zeit * 0.05 + b.userData.p; } });
  szene.add(g);
}

// ---------- Deko auf den Inseln ----------

const kachelMitte = (tx, ty) => [tx * E + E / 2, ty * E + E / 2];

function laterne(t, x, z, farbe) {
  t.add(ZYL(1, 1, 8), "#3a3440", [x, 1.2, z], [0, 0, 0], [0.07, 2.4, 0.07], { art: "glanz" });
  t.add(ZYL(1, 1, 8), "#3a3440", [x, 0.08, z], [0, 0, 0], [0.25, 0.16, 0.25]);
  t.add(KASTEN(), "#3a3440", [x, 2.45, z], [0, 0, 0], [0.42, 0.06, 0.42]);
  t.add(KUGEL(), farbe, [x, 2.65, z], [0, 0, 0], [0.18, 0.24, 0.18], { art: "leucht" });
  t.add(KEGEL(4), "#3a3440", [x, 2.98, z], [0, Math.PI / 4, 0], [0.32, 0.25, 0.32]);
}

function felsbrocken(t, x, z, s, farbe = "#7a748a", moos = null) {
  t.add(KUGEL_K(), farbe, [x, 0.35 * s, z], [hash(x, z, 1), hash(x, z, 2), 0], [0.9 * s, 0.75 * s, 0.8 * s]);
  t.add(KUGEL_K(), farbe, [x + 0.4 * s, 0.2 * s, z + 0.3 * s], [0, hash(x, z, 3), 0], [0.5 * s, 0.4 * s, 0.5 * s]);
  if (moos) t.add(KUGEL_K(), moos, [x - 0.1, 0.62 * s, z], [0, 0, 0], [0.6 * s, 0.2 * s, 0.55 * s]);
}

function glanzPunkt(szene, x, y, z, farbe, groesse, animationen, puls = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,255,255,0.95)")), color: farbe, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.position.set(x, y, z);
  s.scale.setScalar(groesse);
  szene.add(s);
  if (puls) animationen.push((t) => { s.material.opacity = 0.7 + Math.sin(t * 2 * puls + x) * 0.25; });
  return s;
}

function dekoBauen(szene, raster, inseln, animationen, qualitaet) {
  const nachThema = {};
  // Hindernis-Kacheln der jeweiligen Insel zuordnen
  const inselVon = (tx, ty) => inseln.reduce((beste, i) => {
    const d = Math.hypot((tx + 0.5 - i.cx) / i.rx, (ty + 0.5 - i.cy) / i.ry);
    return !beste || d < beste.d ? { i, d } : beste;
  }, null).i;
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => {
    if (!HINDERNIS[c] && c !== "w") return;
    const i = inselVon(tx, ty);
    ((nachThema[i.thema] ??= {})[c] ??= []).push([tx, ty]);
  }));
  const t = new Teile();
  const leucht = [];

  for (const insel of inseln) {
    const kacheln = nachThema[insel.thema] ?? {};
    const farbe = THEMA_FARBE[insel.thema];
    const mx = insel.cx * E, mz = insel.cy * E;
    for (const [tx, ty] of kacheln.L ?? []) {
      const [x, z] = kachelMitte(tx, ty);
      const lf = insel.thema === "siegel" ? "#a8c8ff" : insel.thema === "erinnerungen" ? "#ffc070" : "#ffe0a0";
      laterne(t, x, z, lf);
      leucht.push([x, 2.65, z, lf]);
    }
    for (const [tx, ty] of kacheln.R ?? []) {
      const [x, z] = kachelMitte(tx, ty);
      felsbrocken(t, x, z, 1 + hash(tx, ty, 9) * 0.5, insel.thema === "echos" ? "#5a6a6e" : "#7a748a", insel.thema === "echos" ? "#4a8a5a" : null);
      if (insel.thema === "echos") for (let k = 0; k < 3; k++) {
        const px = x + (hash(tx, k, 3) - 0.5) * 1.6, pz = z + (hash(ty, k, 4) - 0.5) * 1.6;
        t.add(ZYL(1, 1, 6), "#d8e8f0", [px, 0.15, pz], [0, 0, 0], [0.04, 0.3, 0.04]);
        t.add(KUGEL(), "#7af0ff", [px, 0.32, pz], [0, 0, 0], [0.12, 0.07, 0.12], { art: "leucht" });
      }
    }

    if (insel.thema === "ankunft") {
      const kreis = new THREE.Mesh(new THREE.CircleGeometry(4.6, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
        map: textur(runenkreisTextur("#ffe6a0")), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      }));
      kreis.position.set(mx, 0.04, mz);
      szene.add(kreis);
      animationen.push((zeit) => { kreis.rotation.y = zeit * 0.08; kreis.material.opacity = 0.4 + Math.sin(zeit * 1.2) * 0.15; });
    }

    if (insel.thema === "echos") {
      // Wasserbecken mit Steinrand und Echo-Ringen
      const w = kacheln.w ?? [];
      if (w.length) {
        const xs = w.map(([x]) => x), zs = w.map(([, y]) => y);
        const x0 = Math.min(...xs) * E, x1 = (Math.max(...xs) + 1) * E, z0 = Math.min(...zs) * E, z1 = (Math.max(...zs) + 1) * E;
        const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rx = (x1 - x0) / 2, rz = (z1 - z0) / 2;
        const wasser = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
          color: "#2a8aa8", metalness: 0.3, roughness: 0.08, transparent: true, opacity: 0.88, emissive: "#0a4a6a", emissiveIntensity: 0.6,
        }));
        wasser.scale.set(rx * 0.95, 1, rz * 0.95);
        wasser.position.set(cx, 0.06, cz);
        szene.add(wasser);
        for (let k = 0; k < 22; k++) {
          const a = (k / 22) * Math.PI * 2;
          t.add(KUGEL_K(), "#6a7a7e", [cx + Math.cos(a) * rx, 0.12, cz + Math.sin(a) * rz], [0, a, 0], [0.42, 0.28, 0.36]);
        }
        const ringe = [];
        const ringMat = new THREE.MeshBasicMaterial({ color: "#a8f4ff", transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
        for (let k = 0; k < 4; k++) {
          const r = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48).rotateX(-Math.PI / 2), ringMat.clone());
          r.position.set(cx, 0.1, cz);
          szene.add(r);
          ringe.push(r);
        }
        animationen.push((zeit) => {
          ringe.forEach((r, k) => {
            const p = (zeit * 0.22 + k / ringe.length) % 1;
            r.scale.set(0.2 + p * rx * 0.9, 1, 0.2 + p * rz * 0.9);
            r.material.opacity = (1 - p) * 0.55;
            r.position.y = 0.1 + Math.sin(p * Math.PI) * 0.6;
          });
        });
        glanzPunkt(szene, cx, 1.2, cz, "#7af0ff", 3.5, animationen, 0.6);
      }
      // Wasserfall über die Inselkante (auf der Seite weg von der Brücke)
      const s = 23 > insel.cx ? -1 : 1;
      const randX = (insel.cx + s * insel.rx * 1.03) * E;
      const fallTex = textur(wasserfallTextur(), { wiederholen: true });
      fallTex.repeat.set(1, 5);
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 40), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
      fall.position.set(randX + s * 0.7, -19.9, mz);
      fall.rotation.y = Math.PI / 2;
      szene.add(fall);
      const bach = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(randX - (mx + s * 4 * E)), 2.2).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#5ad0f0", metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.92, emissive: "#1a7aa0", emissiveIntensity: 0.8 }));
      bach.position.set((randX + mx + s * 4 * E) / 2, 0.07, mz);
      szene.add(bach);
      const bachTex = textur(wasserfallTextur(), { wiederholen: true });
      bachTex.rotation = Math.PI / 2;
      bach.material.emissiveMap = bachTex;
      animationen.push((zeit) => { fallTex.offset.y = zeit * 0.9; bachTex.offset.y = zeit * 0.5; });
      lichtpunkteBauen(szene, [[randX, mz]], { farbe: "#e8fbff", groesse: 0.5, hoehe: [-6, 0.4], streuung: 2.2, anzahl: Math.round(40 * qualitaet.partikel) }, animationen);
    }

    if (insel.thema === "erinnerungen") {
      // Herbstbäume: 2×2-Gruppe = großer Baum, einzelne Kachel = kleiner Baum
      const baeume = kacheln.T ?? [];
      const genutzt = new Set();
      let grossMitte = null;
      const laub = ["#e07a2a", "#c8442e", "#e8b040", "#d85a24"];
      for (const [tx, ty] of baeume) {
        if (genutzt.has(`${tx},${ty}`)) continue;
        const gross = baeume.some(([x, y]) => x === tx + 1 && y === ty) && baeume.some(([x, y]) => x === tx && y === ty + 1);
        const groesse = gross ? 2 : 1;
        if (gross) for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) genutzt.add(`${tx + dx},${ty + dy}`);
        const x = tx * E + (groesse * E) / 2, z = ty * E + (groesse * E) / 2;
        if (gross && !grossMitte) grossMitte = [x, z];
        const h = gross ? 4.8 : 3;
        t.add(ZYL(0.7, 1, 8), "#5a3a26", [x, h / 2, z], [0, 0, 0], [0.22 * groesse, h, 0.22 * groesse]);
        for (let k = 0; k < (gross ? 7 : 4); k++) {
          const a = (k / 7) * Math.PI * 2 + hash(tx, ty, k);
          const r = k === 0 ? 0 : (gross ? 1.5 : 0.8);
          t.add(KUGEL_K(), laub[(k + tx) % laub.length], [x + Math.cos(a) * r, h + (k === 0 ? 0.8 : hash(k, tx, 3) * 0.8), z + Math.sin(a) * r], [0, a, 0], (gross ? 1.6 : 1.0) * (0.8 + hash(k, ty, 2) * 0.4), { verlauf: 0.25 });
        }
      }
      // Fallende Blätter
      const blaetter = [];
      const geo = new THREE.PlaneGeometry(0.2, 0.13);
      const quellen = baeume.length ? baeume : [[insel.cx, insel.cy]];
      for (let i = 0; i < Math.round(30 * qualitaet.partikel); i++) {
        const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: laub[i % laub.length], side: THREE.DoubleSide }));
        szene.add(m);
        const b = { m, phase: hash(i, 1, 131) * 6, tempo: 0.4 + hash(i, 2, 131) * 0.4, pos: new THREE.Vector3() };
        b.neu = () => { const [qx, qy] = quellen[Math.floor(Math.random() * quellen.length)]; b.pos.set(qx * E + 1 + (Math.random() - 0.5) * 3, 4 + Math.random() * 2, qy * E + 1 + (Math.random() - 0.5) * 3); };
        b.neu(); b.pos.y = Math.random() * 5;
        blaetter.push(b);
      }
      animationen.push((zeit, dt = 0.016) => {
        for (const b of blaetter) {
          b.pos.y -= b.tempo * dt;
          b.pos.x += Math.sin(zeit * 1.3 + b.phase) * dt * 0.6 + dt * 0.25;
          b.pos.z += Math.cos(zeit * 1.1 + b.phase) * dt * 0.4;
          if (b.pos.y < 0.03) { b.liegen = (b.liegen ?? 0) + dt; b.pos.y = 0.03; if (b.liegen > 2.5) { b.liegen = 0; b.neu(); } }
          b.m.position.copy(b.pos);
          if (b.pos.y > 0.04) b.m.rotation.set(zeit * 2 + b.phase, zeit * 1.3, Math.sin(zeit * 3 + b.phase));
          else b.m.rotation.set(-Math.PI / 2, 0, b.phase);
        }
      });
      // Schwebende Erinnerungsbilder um den großen Baum
      const bilder = [];
      ["kueche", "werkstatt", "hotel", "bahnhof"].forEach((art, k) => {
        const rahmen = new THREE.Group();
        const bild = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ map: textur(bildTextur(art)), side: THREE.DoubleSide, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) }));
        rahmen.add(bild);
        const rt = new Teile();
        for (const [x, y, w, h] of [[0, 0.65, 1.8, 0.1], [0, -0.65, 1.8, 0.1], [-0.85, 0, 0.1, 1.4], [0.85, 0, 0.1, 1.4]]) rt.add(KASTEN(), "#c9a24e", [x, y, 0], [0, 0, 0], [w, h, 0.08], { art: "glanz" });
        rt.in(rahmen, { schatten: false });
        rahmen.userData = { a: (k / 4) * Math.PI * 2, h: 3.4 + (k % 2) * 0.6 };
        szene.add(rahmen);
        bilder.push(rahmen);
      });
      const [bx, bz] = grossMitte ?? [mx, mz];
      animationen.push((zeit) => {
        for (const r of bilder) {
          const a = r.userData.a + zeit * 0.12;
          r.position.set(bx + Math.cos(a) * 4.2, r.userData.h + Math.sin(zeit * 0.8 + r.userData.a) * 0.25, bz + Math.sin(a) * 4.2);
          r.rotation.y = -a + Math.PI / 2;
        }
      });
      lichtpunkteBauen(szene, quellen.map(([x, y]) => [x * E + 1, y * E + 1]), { farbe: "#ffd080", groesse: 0.14, hoehe: [0.5, 3.5], streuung: 3, anzahl: Math.round(60 * qualitaet.partikel) }, animationen);
    }

    if (insel.thema === "waage") {
      for (const [tx, ty] of kacheln.p ?? []) {
        const [x, z] = kachelMitte(tx, ty);
        const kaputt = hash(tx, ty, 3) > 0.7;
        const h = kaputt ? 2.6 + hash(tx, ty, 4) * 1.5 : 5.2;
        t.add(ZYL(1, 1, 16), "#f0ece4", [x, h / 2 + 0.3, z], [0, 0, 0], [0.42, h, 0.42]);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          t.add(KASTEN(), "#e0dad0", [x + Math.cos(a) * 0.4, h / 2 + 0.3, z + Math.sin(a) * 0.4], [0, -a, 0], [0.06, h * 0.96, 0.08]);
        }
        t.add(KASTEN(), "#e8e2d8", [x, 0.15, z], [0, 0, 0], [1.1, 0.3, 1.1]);
        if (!kaputt) {
          t.add(KASTEN(), "#c9a24e", [x, h + 0.42, z], [0, 0, 0], [1.0, 0.24, 1.0], { art: "glanz" });
          t.add(KUGEL(), "#7aff9a", [x, h + 0.75, z], [0, 0, 0], 0.18, { art: "leucht" });
        } else {
          t.add(KUGEL_K(), "#f0ece4", [x + 0.6, 0.2, z + 0.3], [0.4, 0.2, 0], [0.4, 0.25, 0.35]);
        }
      }
      // Die große Waage
      const s = kacheln.S ?? [];
      if (s.length) {
        const cx = (Math.min(...s.map(([x]) => x)) + 1) * E, cz = (Math.min(...s.map(([, y]) => y)) + 1) * E;
        const sockel = new Teile();
        sockel.add(ZYL(1, 1, 24), "#e8e2d8", [cx, 0.3, cz], [0, 0, 0], [1.8, 0.6, 1.8]);
        sockel.add(ZYL(1, 1, 24), "#c9a24e", [cx, 0.65, cz], [0, 0, 0], [1.4, 0.1, 1.4], { art: "glanz" });
        sockel.add(ZYL(0.7, 1, 12), "#c9a24e", [cx, 2.7, cz], [0, 0, 0], [0.22, 4.2, 0.22], { art: "glanz" });
        sockel.add(KUGEL(), "#c9a24e", [cx, 4.9, cz], [0, 0, 0], 0.35, { art: "glanz" });
        const g0 = new THREE.Group();
        sockel.in(g0);
        szene.add(g0);
        const balken = new THREE.Group();
        balken.position.set(cx, 4.85, cz);
        const bt = new Teile();
        bt.add(KASTEN(), "#c9a24e", [0, 0, 0], [0, 0, 0], [4.6, 0.16, 0.2], { art: "glanz" });
        for (const sx of [-1, 1]) bt.add(KEGEL(8), "#c9a24e", [sx * 2.35, 0, 0], [0, 0, sx * Math.PI / 2], [0.14, 0.3, 0.14], { art: "glanz" });
        bt.in(balken);
        const schalen = [];
        for (const sx of [-1, 1]) {
          const schale = new THREE.Group();
          const st = new Teile();
          for (let k = 0; k < 3; k++) {
            const a = (k / 3) * Math.PI * 2;
            st.add(ZYL(1, 1, 4), "#a88a3e", [Math.cos(a) * 0.35, -0.8, Math.sin(a) * 0.35], [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35], [0.015, 1.7, 0.015]);
          }
          st.add(DREH([V(0, 0), V(0.75, 0.05), V(0.85, 0.22), V(0.8, 0.25), V(0, 0.08)], 20, "waagschale"), "#c9a24e", [0, -1.75, 0], [0, 0, 0], 1, { art: "glanz" });
          st.add(KUGEL(), sx < 0 ? "#7aff9a" : "#b8c8ff", [0, -1.45, 0], [0, 0, 0], 0.3, { art: "leucht" });
          st.in(schale);
          schale.position.set(sx * 2.2, 0, 0);
          balken.add(schale);
          schalen.push(schale);
        }
        szene.add(balken);
        animationen.push((zeit) => {
          const w = Math.sin(zeit * 0.45) * 0.16 + Math.sin(zeit * 1.3) * 0.03;
          balken.rotation.z = w;
          for (const s of schalen) s.rotation.z = -w;
        });
        glanzPunkt(szene, cx, 5.2, cz, "#fff2c0", 2.4, animationen, 0.5);
      }
      lichtpunkteBauen(szene, [[mx, mz]], { farbe: "#e8fff0", groesse: 0.12, hoehe: [0.5, 5], streuung: insel.rx * 1.4, anzahl: Math.round(50 * qualitaet.partikel) }, animationen);
    }

    if (insel.thema === "siegel") {
      // Kuppelbögen der Sternwarte über dem Buch
      const bogen = new Teile();
      const kx = mx, kz = (insel.cy - 3.5) * E;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI;
        bogen.add(RING(0.05, Math.PI), "#c9a24e", [kx, 0, kz], [0, a, 0], [6.5, 6.5, 6.5], { art: "glanz" });
      }
      bogen.add(RING(0.05), "#c9a24e", [kx, 0.05, kz], [Math.PI / 2, 0, 0], [6.5, 6.5, 3], { art: "glanz" });
      bogen.add(KUGEL(), "#e8dcff", [kx, 6.6, kz], [0, 0, 0], 0.5, { art: "leucht" });
      const gb = new THREE.Group();
      bogen.in(gb, { schatten: false });
      szene.add(gb);
      // Fernrohr
      for (const [tx, ty] of (kacheln.F ?? []).slice(0, 1)) {
        const [x, z] = kachelMitte(tx, ty);
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2;
          t.add(ZYL(1, 1, 5), "#5a3a26", [x + Math.cos(a) * 0.35, 0.8, z + Math.sin(a) * 0.35], [Math.sin(a) * -0.3, 0, Math.cos(a) * 0.3], [0.05, 1.7, 0.05]);
        }
        t.add(ZYL(0.75, 1, 14), "#c9a24e", [x, 2.1, z], [0.9, 0.6, 0], [0.22, 2.6, 0.22], { art: "glanz" });
        t.add(ZYL(1, 1, 14), "#8a6a2e", [x, 2.1, z], [0.9, 0.6, 0], [0.26, 0.3, 0.26], { art: "glanz" });
      }
      // Planetenmodell (Orrery)
      const o = kacheln.O ?? [];
      if (o.length) {
        const ox = (Math.min(...o.map(([x]) => x)) + o.length / 2) * E, oz = o[0][1] * E + E / 2;
        t.add(ZYL(1, 1, 16), "#4a4060", [ox, 0.5, oz], [0, 0, 0], [0.5, 1.0, 0.5]);
        t.add(ZYL(1, 1, 16), "#c9a24e", [ox, 1.05, oz], [0, 0, 0], [0.6, 0.1, 0.6], { art: "glanz" });
        const planeten = new THREE.Group();
        planeten.position.set(ox, 1.9, oz);
        const pt = new Teile();
        pt.add(KUGEL(), "#ffd060", [0, 0, 0], [0, 0, 0], 0.32, { art: "leucht" });
        pt.in(planeten, { schatten: false });
        const bahnen = [];
        [["#7ab8ff", 0.8, 0.12], ["#ff8a6a", 1.3, 0.16], ["#c8a8ff", 1.8, 0.2]].forEach(([f, r, gr], k) => {
          const bahn = new THREE.Group();
          const bt = new Teile();
          bt.add(RING(0.02), "#c9a24e", [0, 0, 0], [Math.PI / 2, 0, 0], r, { art: "glanz" });
          bt.add(KUGEL(), f, [r, 0, 0], [0, 0, 0], gr, { art: "leucht" });
          if (k === 2) bt.add(RING(0.06), "#e8dcff", [r, 0, 0], [1.2, 0, 0], gr * 1.8, { art: "leucht" });
          bt.in(bahn, { schatten: false });
          bahn.rotation.x = (k - 1) * 0.15;
          planeten.add(bahn);
          bahnen.push(bahn);
        });
        szene.add(planeten);
        animationen.push((zeit) => { bahnen.forEach((b, k) => { b.rotation.y = zeit * (0.6 - k * 0.15); }); });
      }
      lichtpunkteBauen(szene, [[mx, mz]], { farbe: "#d8c8ff", groesse: 0.16, hoehe: [1, 9], streuung: insel.rx * 1.5, anzahl: Math.round(90 * qualitaet.partikel) }, animationen);
    }
  }
  const g = new THREE.Group();
  t.in(g);
  szene.add(g);
  for (const [x, y, z, f] of leucht) glanzPunkt(szene, x, y, z, f, 1.4, animationen, 1.5);
}

// ---------- Objekte: Brücke und Siegel-Portal ----------

/** Magische Brücke: erst ein schwacher Lichtstreifen, dann erscheinen die Planken nacheinander. */
function brueckeBauen(o, animationen) {
  const g = new THREE.Group();
  const laenge = (o.hoehe ?? 1) * E + 2.4, breite = (o.breite ?? 2) * E - 0.6;
  const farbe = new THREE.Color(o.farbe ?? "#ffe0a0");
  const planken = [];
  const holz = new THREE.MeshStandardMaterial({ color: "#8a6440", roughness: 0.85 });
  const anzahl = Math.round(laenge / 0.62);
  for (let i = 0; i < anzahl; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(breite * (0.94 + hash(i, 1, 141) * 0.08), 0.14, 0.52), holz);
    p.position.set((hash(i, 2, 141) - 0.5) * 0.12, -0.05, laenge / 2 - 0.31 - i * 0.62);
    p.rotation.y = (hash(i, 3, 141) - 0.5) * 0.06;
    p.castShadow = true; p.receiveShadow = true;
    p.userData.y = p.position.y;
    g.add(p);
    planken.push(p);
  }
  // Pfosten mit Leuchtsteinen und Seile
  const pfosten = new Teile();
  const steine = new Teile();
  const pfostenZ = [];
  for (let z = laenge / 2 - 0.4; z > -laenge / 2; z -= 3.2) pfostenZ.push(z);
  for (const z of pfostenZ) for (const sx of [-1, 1]) {
    pfosten.add(ZYL(1, 1, 6), "#6a4a30", [sx * breite / 2, 0.45, z], [0, 0, 0], [0.08, 1.1, 0.08]);
    steine.add(KUGEL(), o.farbe ?? "#ffe0a0", [sx * breite / 2, 1.05, z], [0, 0, 0], 0.12, { art: "leucht" });
  }
  const pfostenG = new THREE.Group(); pfosten.in(pfostenG);
  const steineG = new THREE.Group(); steine.in(steineG, { schatten: false });
  g.add(pfostenG, steineG);
  const seilMat = new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: 0.9, toneMapped: false });
  const seile = [];
  for (const sx of [-1, 1]) {
    const seil = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, laenge, 6).rotateX(Math.PI / 2), seilMat);
    seil.position.set(sx * breite / 2, 0.9, 0);
    g.add(seil);
    seile.push(seil);
  }
  // Lichtstreifen im geschlossenen Zustand
  const streifen = new THREE.Mesh(new THREE.PlaneGeometry(breite * 0.5, laenge).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: textur(strahlTextur()), color: farbe, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  }));
  streifen.position.y = 0.02;
  g.add(streifen);
  const funken = new THREE.Group();
  const ftex = textur(lichtTextur("rgba(255,255,255,1)"));
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ftex, color: farbe, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.35);
    s.userData = { z: (hash(i, 1, 151) - 0.5) * laenge, p: hash(i, 2, 151) };
    funken.add(s);
  }
  g.add(funken);

  let offen = 0, ziel = 0;
  const setzeOffen = (an, sofort = false) => { ziel = an ? 1 : 0; if (sofort) offen = ziel; };
  animationen.push((zeit, dt = 0.016) => {
    offen += Math.sign(ziel - offen) * Math.min(Math.abs(ziel - offen), dt * 0.4);
    planken.forEach((p, i) => {
      // Planke i erscheint, sobald der Aufbau weit genug ist (von der Ankunftsseite aus)
      const anteil = THREE.MathUtils.clamp(offen * (anzahl + 6) - i, 0, 1);
      p.visible = anteil > 0.01;
      p.position.y = p.userData.y - (1 - anteil) * 1.6 + Math.sin(zeit * 1.4 + i * 0.4) * 0.03 * offen;
      p.scale.setScalar(0.4 + anteil * 0.6);
    });
    const fertig = THREE.MathUtils.clamp(offen * 1.4 - 0.4, 0, 1);
    pfostenG.visible = steineG.visible = fertig > 0.02;
    pfostenG.scale.y = steineG.scale.y = Math.max(0.02, fertig);
    for (const s of seile) { s.visible = fertig > 0.02; s.scale.z = Math.max(0.02, fertig); }
    streifen.material.opacity = (1 - offen) * (0.25 + Math.sin(zeit * 2) * 0.12);
    funken.visible = offen < 0.98;
    funken.children.forEach((s) => {
      const p = (zeit * 0.3 + s.userData.p) % 1;
      s.position.set(Math.sin(zeit + s.userData.p * 9) * 0.6, p * 1.8, s.userData.z);
      s.material.opacity = (1 - p) * (1 - offen);
    });
  });
  return { modell: g, setzeOffen };
}

/** Das zerbrochene Siegel: ein schwebender Steinring mit lila Leuchten – der Weg zurück in die Halle. */
function siegelPortalBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  t.add(ZYL(1, 1, 24), "#5c5674", [0, 0.1, 0], [0, 0, 0], [1.8, 0.2, 1.8]);
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI * 0.05 + (k / 7) * Math.PI * 1.15;
    t.add(KASTEN(), "#6a6488", [Math.cos(a) * 1.7, 1.9 + Math.sin(a) * 1.7, 0], [0, 0, a], [0.55, 0.5, 0.45]);
  }
  t.in(g);
  const scheibe = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), new THREE.MeshBasicMaterial({
    map: textur(runenkreisTextur("#d8b8ff")), color: "#b48aff", transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  }));
  scheibe.position.y = 1.9;
  g.add(scheibe);
  const brocken = [];
  for (let k = 0; k < 3; k++) {
    const b = new THREE.Group();
    const tt = new Teile();
    tt.add(KASTEN(), "#6a6488", [0, 0, 0], [0.3 * k, 0.2, 0.5], [0.45, 0.4, 0.35]);
    tt.in(b);
    b.userData.a = -0.6 - k * 0.35;
    g.add(b);
    brocken.push(b);
  }
  g.userData.setzeAktiv = () => {};
  animationen.push((zeit) => {
    scheibe.rotation.z = zeit * 0.3;
    scheibe.material.opacity = 0.55 + Math.sin(zeit * 1.8) * 0.15;
    brocken.forEach((b, k) => {
      const a = b.userData.a + Math.sin(zeit * 0.7 + k) * 0.05;
      b.position.set(Math.cos(a) * (2.1 + k * 0.2), 1.9 + Math.sin(a) * (2.1 + k * 0.2) + Math.sin(zeit + k) * 0.1, 0);
      b.rotation.set(zeit * 0.3 + k, zeit * 0.2, 0);
    });
  });
  return g;
}

function objektModell(o, animationen) {
  if (o.art === "bruecke") return brueckeBauen(o, animationen);
  if (o.bild === "siegel_portal") return { modell: siegelPortalBauen(animationen) };
  if (o.bild === "kristall") return kristallBauen(o, animationen);
  if (o.bild === "pult") return { modell: pultBauen(animationen) };
  if (o.bild === "buch_stimmen") return buchBauen(animationen);
  if (WAECHTER[o.bild]) {
    const f = torwaechterBauen(WAECHTER[o.bild]);
    f.gruppe.scale.setScalar(1.25);
    return { modell: f.gruppe, figur: f, boss: true };
  }
  return null;
}

// ---------- Aufbau ----------

/**
 * Baut die Inseln der Stimmen. Schnittstelle wie halleBauen (siehe spiel.js).
 */
export function inselnBauen(szene, raster, kontext) {
  const { animationen, qualitaet, def } = kontext;
  const inseln = def.inseln;
  const B = raster[0].length * E, T = raster.length * E;
  const mitte = new THREE.Vector3(B / 2, 0, T / 2);
  const sonnenRichtung = new THREE.Vector3(-0.75, 0.16, -0.45);

  szene.background = new THREE.Color("#e8a8a0");
  szene.fog = new THREE.Fog("#c8a0c0", 70, 380);

  himmelBauen(szene, mitte, sonnenRichtung);
  wolkenmeerBauen(szene, mitte, animationen, qualitaet);
  ferneBauen(szene, mitte, animationen, B, T);

  // Licht: warme Abendsonne mit Schatten (folgt der Spielfigur), violettes Himmelslicht
  szene.add(new THREE.HemisphereLight("#c8c0ff", "#7a5a78", 1.45));
  const sonne = new THREE.DirectionalLight("#ffd2a8", 2.5);
  sonne.castShadow = qualitaet.schatten;
  sonne.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(sonne.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
  sonne.shadow.bias = -0.0005;
  sonne.shadow.normalBias = 0.04;
  szene.add(sonne, sonne.target);
  const versatz = sonnenRichtung.clone().normalize().multiplyScalar(60).add(new THREE.Vector3(0, 30, 0));

  for (const insel of inseln) inselBauen(szene, insel, animationen);
  dekoBauen(szene, raster, inseln, animationen, qualitaet);
  voegelBauen(szene, new THREE.Vector3(mitte.x, 14, mitte.z), Math.round(6 * qualitaet.partikel), animationen);

  return {
    blockZeichen: BLOCKIERT,
    hindernis: (tx, ty) => HINDERNIS[raster[ty]?.[tx]] ?? 0,
    objektModell: (o) => objektModell(o, animationen),
    licht: (p) => {
      sonne.position.set(p.x + versatz.x, versatz.y, p.z + versatz.z);
      sonne.target.position.set(p.x, 0, p.z);
    },
    kamera: { hoehe: 3.2, abstand: 7.0, maxHoehe: 9 },
  };
}
