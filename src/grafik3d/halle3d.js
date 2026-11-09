// Lythara – Die Halle der Tausend Tore in 3D.
// Eine verlorene Bibliothek: hohe Steinmauern, Bücherregale, Kerzenständer,
// Mondlicht durch hohe Fenster, schwebende Bücher und fünf magische Tore.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL_K, ZYL, RING, KASTEN, KEGEL, DREH, V, torwaechterBauen } from "./figuren.js";
import { textur, holzTextur, lichtTextur } from "./texturen.js";
import { hash } from "../grafik16/pinsel.js";
import { E, welt } from "./welt.js";

export const WAND_H = 7.5;
const REGAL_H = 4.4;

// Farben der fünf Tore (Thema, Quellen, Interesse, Leser, Überschrift)
export const TORFARBEN = { tor1: "#ffb347", tor2: "#58d8f0", tor3: "#ff7aa2", tor4: "#7aff9a", tor5: "#b48aff" };

// Farben des Hallenbaus (weitere Themen können hier ergänzt werden)
const THEMEN = {
  halle: { himmel: "#0c0a14", nebel: "#141020", hemi: "#9a94d0", banner: null },
};

// Farben der Wächter (Stein, dunkler Stein, Glut, Emblem auf dem Stab)
export const WAECHTER = {
  boss_torwaechter: { stein: "#5c5878", steinH: "#7a7698", dunkel: "#3a364e", glut: "#9af4ff", rune: "#58d8f0", emblem: "kristall" },
  boss_kopist: { stein: "#4a5a6a", steinH: "#6a7e90", dunkel: "#283440", glut: "#bff8ff", rune: "#58d8f0", emblem: "feder" },
  boss_vergessen: { stein: "#6a6460", steinH: "#8a847e", dunkel: "#3e3a38", glut: "#ffd28a", rune: "#ffb347", emblem: "sanduhr" },
  boss_zauderer: { stein: "#4e6450", steinH: "#6e8670", dunkel: "#2c3a2e", glut: "#c8ffcf", rune: "#7aff9a", emblem: "waage" },
  boss_echo: { stein: "#5e4e78", steinH: "#7e6c9a", dunkel: "#342a48", glut: "#e2ccff", rune: "#b48aff", emblem: "ringe" },
};

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

// ---------- Texturen ----------

function hallenBoden(raster) {
  const P = 48;
  const B = raster[0].length, T = raster.length;
  const [c, g] = leinwand(B * P, T * P);
  g.fillStyle = "#3a3448"; g.fillRect(0, 0, B * P, T * P);
  // Steinplatten (je Kachel 2×2, versetzt)
  for (let ty = 0; ty < T; ty++) for (let tx = 0; tx < B; tx++) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = tx * P + i * P / 2, y = ty * P + j * P / 2 + ((tx + i) % 2) * 6 - 3;
      const h = hash(tx * 2 + i, ty * 2 + j, 11);
      const l = 34 + h * 12;
      g.fillStyle = `hsl(${250 + h * 20}, ${10 + h * 6}%, ${l}%)`;
      g.beginPath(); g.roundRect(x + 1.5, y + 1.5, P / 2 - 3, P / 2 - 3, 3); g.fill();
      if (hash(tx, ty, i + j * 2 + 40) > 0.85) {
        g.strokeStyle = "rgba(20,16,30,0.5)"; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x + 4, y + 6 + h * 10); g.lineTo(x + 12 + h * 8, y + 14); g.lineTo(x + 18, y + 20); g.stroke();
      }
    }
  }
  // Teppich auf dem Mittelweg (=)
  for (let ty = 0; ty < T; ty++) for (let tx = 0; tx < B; tx++) {
    if (raster[ty][tx] !== "=") continue;
    const x = tx * P, y = ty * P;
    g.fillStyle = "#7a1e2c"; g.fillRect(x, y, P, P);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${hash(k, tx, ty) > 0.5 ? "160,40,60" : "60,10,20"},0.25)`; g.fillRect(x + hash(k, 1, tx + ty * 50) * P, y + hash(k, 2, tx + ty * 50) * P, 2, 2); }
    const links = raster[ty][tx - 1] !== "=", rechts = raster[ty][tx + 1] !== "=";
    g.fillStyle = "#d8a840";
    if (links) { g.fillRect(x + 3, y, 4, P); g.fillRect(x + 10, y, 1.5, P); }
    if (rechts) { g.fillRect(x + P - 7, y, 4, P); g.fillRect(x + P - 11.5, y, 1.5, P); }
    // Rautenmuster
    if (links) {
      g.strokeStyle = "rgba(230,190,90,0.55)"; g.lineWidth = 2;
      const mx = x + P, my = y + P / 2;
      g.beginPath(); g.moveTo(mx, my - 14); g.lineTo(mx + 14, my); g.lineTo(mx, my + 14); g.lineTo(mx - 14, my); g.closePath(); g.stroke();
      g.fillStyle = "rgba(230,190,90,0.6)"; g.beginPath(); g.arc(mx, my, 3, 0, Math.PI * 2); g.fill();
    }
  }
  // Schatten am Mauerfuß
  const [s, sg] = leinwand(B * P, T * P);
  sg.fillStyle = "#000";
  for (let ty = 0; ty < T; ty++) for (let tx = 0; tx < B; tx++) if (raster[ty][tx] === "#" || raster[ty][tx] === "B") sg.fillRect(tx * P, ty * P, P, P);
  g.save(); g.globalAlpha = 0.45; g.filter = "blur(10px)"; g.drawImage(s, 0, 0); g.restore();
  return c;
}

function mauerTextur() {
  const [c, g] = leinwand(256, 256);
  g.fillStyle = "#2c2838"; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 8; r++) {
    for (let x = -64; x < 256; x += 64) {
      const h = hash(x, r, 3);
      g.fillStyle = `hsl(${245 + h * 25}, 12%, ${30 + h * 12}%)`;
      g.beginPath(); g.roundRect(x + (r % 2) * 32 + 2, r * 32 + 2, 60, 28, 4); g.fill();
      g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + (r % 2) * 32 + 4, r * 32 + 3, 56, 4);
      g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(x + (r % 2) * 32 + 4, r * 32 + 24, 56, 4);
    }
  }
  for (let i = 0; i < 400; i++) { g.fillStyle = hash(i, 1, 9) > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.12)"; g.fillRect(hash(i, 2, 9) * 256, hash(i, 3, 9) * 256, 2, 2); }
  return c;
}

function schildTextur(text, farbe) {
  const [c, g] = leinwand(512, 96);
  const v = g.createLinearGradient(0, 0, 0, 96);
  v.addColorStop(0, "#3a3446"); v.addColorStop(1, "#24202e");
  g.fillStyle = v; g.beginPath(); g.roundRect(4, 4, 504, 88, 14); g.fill();
  g.strokeStyle = "#c9a24e"; g.lineWidth = 4; g.stroke();
  g.font = "600 40px Cinzel, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = farbe; g.shadowBlur = 14;
  g.fillStyle = "#ffe9b0"; g.fillText(text, 256, 50, 400);
  return c;
}

function runenTextur(farbe, seed = 1) {
  const [c, g] = leinwand(64, 256);
  g.clearRect(0, 0, 64, 256);
  g.strokeStyle = farbe; g.lineWidth = 4; g.lineCap = "round"; g.shadowColor = farbe; g.shadowBlur = 8;
  for (let i = 0; i < 6; i++) {
    const y = 20 + i * 40;
    g.beginPath();
    const n = 2 + Math.floor(hash(i, seed, 2) * 3);
    for (let k = 0; k < n; k++) {
      const x0 = 14 + hash(i, k, seed) * 36, y0 = y - 12 + hash(k, i, seed + 1) * 24;
      const x1 = 14 + hash(k, i, seed + 2) * 36, y1 = y - 12 + hash(i, k, seed + 3) * 24;
      g.moveTo(x0, y0); g.lineTo(x1, y1);
    }
    g.stroke();
  }
  return c;
}

function siegelTextur() {
  const [c, g] = leinwand(256, 256);
  g.translate(128, 128);
  g.strokeStyle = "#d6b8ff"; g.shadowColor = "#a070ff"; g.shadowBlur = 12; g.lineWidth = 5;
  g.beginPath(); g.arc(0, 0, 112, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(0, 0, 40, 0, Math.PI * 2); g.stroke();
  // Vier Zacken (die vier Sprachkräfte)
  g.lineWidth = 4;
  g.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2; const r = i % 2 ? 40 : 88; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.stroke();
  g.font = "bold 18px serif"; g.fillStyle = "#e8d8ff";
  const zeichen = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊ";
  for (let i = 0; i < 16; i++) { g.save(); g.rotate((i / 16) * Math.PI * 2); g.fillText(zeichen[i], -6, -97); g.restore(); }
  return c;
}

function buchseitenTextur() {
  const [c, g] = leinwand(128, 96);
  g.fillStyle = "#f2e6c8"; g.fillRect(0, 0, 128, 96);
  g.fillStyle = "#d8c8a0"; g.fillRect(62, 0, 4, 96);
  g.fillStyle = "#6a5a48";
  for (const x0 of [8, 72]) for (let y = 12; y < 88; y += 7) g.fillRect(x0, y, 48 - ((y * 7) % 13), 2);
  g.fillStyle = "#a03030"; g.fillRect(8, 10, 8, 10);
  return c;
}

export function strahlTextur() {
  const [c, g] = leinwand(8, 128);
  const v = g.createLinearGradient(0, 0, 0, 128);
  v.addColorStop(0, "rgba(255,255,255,0)"); v.addColorStop(0.25, "rgba(255,255,255,0.9)"); v.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = v; g.fillRect(0, 0, 8, 128);
  return c;
}

function fensterTextur() {
  const [c, g] = leinwand(64, 160);
  const v = g.createLinearGradient(0, 0, 0, 160);
  v.addColorStop(0, "#cfe0ff"); v.addColorStop(1, "#5a78c8");
  g.fillStyle = "#1a1626"; g.fillRect(0, 0, 64, 160);
  g.fillStyle = v;
  g.beginPath(); g.moveTo(6, 160); g.lineTo(6, 34); g.arc(32, 34, 26, Math.PI, 0); g.lineTo(58, 160); g.fill();
  g.strokeStyle = "#1a1626"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(32, 8); g.lineTo(32, 160); g.moveTo(6, 70); g.lineTo(58, 70); g.moveTo(6, 115); g.lineTo(58, 115); g.stroke();
  return c;
}

// ---------- Geometrie mit Welt-UVs ----------

class Bau {
  constructor() { this.pos = []; this.nor = []; this.uv = []; }
  flaeche(a, b, c, d, n, uvs) {
    this.pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i++) this.nor.push(...n);
    const [ua, ub, uc, ud] = uvs;
    this.uv.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud);
  }
  /** Quader mit Texturkoordinaten in Weltgröße (1 Einheit = s). ohne: Liste von Seiten wie "y-". */
  quader(x0, y0, z0, x1, y1, z1, s = 0.25, ohne = []) {
    const u = (a) => a * s;
    if (!ohne.includes("z+")) this.flaeche([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], [[u(x0), u(y0)], [u(x1), u(y0)], [u(x1), u(y1)], [u(x0), u(y1)]]);
    if (!ohne.includes("z-")) this.flaeche([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], [[u(x1), u(y0)], [u(x0), u(y0)], [u(x0), u(y1)], [u(x1), u(y1)]]);
    if (!ohne.includes("x+")) this.flaeche([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], [[u(z1), u(y0)], [u(z0), u(y0)], [u(z0), u(y1)], [u(z1), u(y1)]]);
    if (!ohne.includes("x-")) this.flaeche([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], [[u(z0), u(y0)], [u(z1), u(y0)], [u(z1), u(y1)], [u(z0), u(y1)]]);
    if (!ohne.includes("y+")) this.flaeche([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [[u(x0), u(z1)], [u(x1), u(z1)], [u(x1), u(z0)], [u(x0), u(z0)]]);
  }
  geometrie() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    return g;
  }
}

// ---------- Hilfen ----------

const zeichen = (raster, tx, ty) => raster[ty]?.[tx] ?? "#";

function kacheln(raster, z) {
  const l = [];
  raster.forEach((zeile, ty) => [...zeile].forEach((c, tx) => { if (c === z) l.push([tx, ty]); }));
  return l;
}

/** Abschnitte (Kammern) zwischen den Trennwänden: Liste von { z0, z1 } in Kachelzeilen. */
function kammern(raster) {
  const trenn = [];
  raster.forEach((zeile, ty) => { if (zeile.slice(6, 24).replace(/=/g, "#") === "#".repeat(18)) trenn.push(ty); });
  const l = [];
  for (let i = 0; i < trenn.length - 1; i++) if (trenn[i + 1] - trenn[i] > 1) l.push({ z0: trenn[i] + 1, z1: trenn[i + 1] - 1 });
  return l;
}

// ---------- Aufbau ----------

/**
 * Baut die Halle in die Szene.
 * Liefert { blockZeichen, hindernis(tx, ty), objektModell(o, animationen), licht(spielerPos, zeit), nebel, ... }.
 */
export function halleBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const thema = THEMEN[kontext.thema] ?? THEMEN.halle;
  const B = raster[0].length * E, T = raster.length * E;

  szene.background = new THREE.Color(thema.himmel);
  szene.fog = new THREE.Fog(thema.nebel, 14, 58);

  // Licht: schwaches Grundlicht, Mondlicht durch die Fenster (mit Schatten)
  szene.add(new THREE.HemisphereLight(thema.hemi, "#3a2a40", 1.6));
  const mond = new THREE.DirectionalLight("#a8c0ff", 1.7);
  mond.position.set(-14, 22, 6);
  mond.castShadow = qualitaet.schatten;
  mond.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(mond.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
  mond.shadow.bias = -0.0005;
  mond.shadow.normalBias = 0.04;
  szene.add(mond, mond.target);

  // Boden
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(B, T).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: textur(hallenBoden(raster)), roughness: 0.6, metalness: 0.05 }));
  boden.position.set(B / 2, 0, T / 2);
  boden.receiveShadow = true;
  szene.add(boden);

  // Mauern: waagerechte Läufe von # zu Quadern zusammenfassen (nur sichtbare Seiten)
  const bau = new Bau();
  raster.forEach((zeile, ty) => {
    let tx = 0;
    while (tx < zeile.length) {
      if (zeile[tx] !== "#") { tx++; continue; }
      let ende = tx;
      while (ende + 1 < zeile.length && zeile[ende + 1] === "#") ende++;
      // Liegt der Lauf komplett im Inneren der Mauer? Dann weglassen.
      let sichtbar = false;
      for (let x = tx; x <= ende; x++) {
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (zeichen(raster, x + dx, ty + dy) !== "#") sichtbar = true;
      }
      if (sichtbar) bau.quader(tx * E, 0, ty * E, (ende + 1) * E, WAND_H, (ty + 1) * E, 0.22);
      tx = ende + 1;
    }
  });
  const mauerTex = textur(mauerTextur(), { wiederholen: true });
  const mauern = new THREE.Mesh(bau.geometrie(), new THREE.MeshStandardMaterial({ map: mauerTex, roughness: 0.92 }));
  mauern.castShadow = true;
  mauern.receiveShadow = true;
  szene.add(mauern);

  // Decke mit Balken
  const decke = new THREE.Mesh(new THREE.PlaneGeometry(B, T).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#1a1622", roughness: 1 }));
  decke.position.set(B / 2, WAND_H, T / 2);
  szene.add(decke);
  const balkenMat = new THREE.MeshStandardMaterial({ map: textur(holzTextur("#4a3020"), { wiederholen: true }), roughness: 0.9 });
  const raum = kammern(raster);
  for (const k of raum) {
    for (let ty = k.z0; ty <= k.z1 + 1; ty += 2) {
      const balken = new THREE.Mesh(new THREE.BoxGeometry(36, 0.45, 0.5), balkenMat);
      balken.position.set(30, WAND_H - 0.25, ty * E);
      szene.add(balken);
    }
  }

  // Säulen an den Trennwänden (neben jedem Torbogen und an den Ecken)
  const saeulen = new Teile();
  for (let ty = 0; ty < raster.length; ty++) {
    const z = raster[ty];
    if (z.slice(6, 24).replace(/=/g, "#") !== "#".repeat(18)) continue;
    for (const x of [12.6, 27.0, 33.0, 47.4]) {
      for (const seite of [-1, 1]) {
        const zz = ty * E + E / 2 + seite * (E / 2 + 0.25);
        if (zz < 0 || zz > T) continue;
        const nachbar = zeichen(raster, Math.floor(x / E), ty + seite);
        if (nachbar === "#") continue;
        saeulen.add(ZYL(1, 1, 18), "#4a4460", [x, WAND_H / 2, zz], [0, 0, 0], [0.42, WAND_H, 0.42]);
        saeulen.add(ZYL(1, 1, 18), "#5c5674", [x, 0.2, zz], [0, 0, 0], [0.58, 0.4, 0.58]);
        saeulen.add(ZYL(1, 1, 18), "#5c5674", [x, WAND_H - 0.5, zz], [0, 0, 0], [0.55, 0.3, 0.55]);
        saeulen.add(RING(0.25), "#c9a24e", [x, 2.2, zz], [Math.PI / 2, 0, 0], [0.43, 0.43, 0.25], { art: "glanz" });
      }
    }
  }
  saeulen.in(szene);

  // Bücherregale
  regaleBauen(szene, raster);
  // Kerzenständer und Kerzenlicht
  const kerzen = kerzenBauen(szene, raster, animationen);
  // Fenster, Lichtstrahlen und Banner an den Seitenwänden
  fensterBauen(szene, raum, animationen, thema.banner);
  // Schwebende Bücher und Staub
  schwebendeBuecher(szene, raum, animationen);

  // Punktlichter wandern zu den Kerzen in der Nähe der Spielfigur
  const lichter = [];
  for (let i = 0; i < qualitaet.kerzenlichter; i++) {
    const l = new THREE.PointLight("#ffb860", 0, 14, 1.4);
    szene.add(l);
    lichter.push(l);
  }
  // Warmes Licht bei der Spielfigur, damit Gesichter gut zu sehen sind
  const begleiter = new THREE.PointLight("#ffe0b0", 5, 9, 1.5);
  szene.add(begleiter);
  const licht = (p, zeit) => {
    begleiter.position.set(p.x, 3.2, p.z + 1.2);
    mond.position.set(p.x - 14, 22, p.z + 6);
    mond.target.position.set(p.x, 0, p.z);
    const nah = kerzen.orte.map((o, i) => [o, i, (o.x - p.x) ** 2 + (o.z - p.z) ** 2]).sort((a, b) => a[2] - b[2]);
    lichter.forEach((l, i) => {
      const e = nah[i];
      if (!e) { l.intensity = 0; return; }
      l.position.set(e[0].x, e[0].y + 0.6, e[0].z);
      l.intensity = 16 * (0.85 + Math.sin(zeit * 9 + e[1]) * 0.08 + Math.sin(zeit * 23 + e[1] * 3) * 0.06);
    });
  };

  return {
    blockZeichen: new Set(["#", "B", "c"]),
    hindernis: (tx, ty) => {
      const c = zeichen(raster, tx, ty);
      return c === "#" ? WAND_H : c === "B" ? REGAL_H : 0;
    },
    objektModell: (o) => objektModell(o, animationen),
    licht,
    kamera: { hoehe: 3.0, abstand: 6.4, maxHoehe: 5.2 },
  };
}

// ---------- Regale ----------

function regaleBauen(szene, raster) {
  const holz = new Teile();
  const buecher = [];
  const farben = ["#8a2a2a", "#2a4a8a", "#2a6a3a", "#6a3a8a", "#a8742a", "#3a3a4a", "#7a5a2a", "#4a2a2a", "#2a5a6a", "#9a8a6a"];
  for (const [tx, ty] of kacheln(raster, "B")) {
    // Rückwand liegt dort, wo eine Mauer angrenzt
    let richtung = null;
    if (zeichen(raster, tx, ty - 1) === "#") richtung = [0, 1];
    else if (zeichen(raster, tx, ty + 1) === "#") richtung = [0, -1];
    else if (zeichen(raster, tx - 1, ty) === "#") richtung = [1, 0];
    else if (zeichen(raster, tx + 1, ty) === "#") richtung = [-1, 0];
    else richtung = [0, 1];
    const [nx, nz] = richtung;
    const cx = welt(tx), cz = welt(ty);
    const tiefe = 0.7;
    // Mittelpunkt des Regals an der Wand
    const mx = cx - nx * (E / 2 - tiefe / 2), mz = cz - nz * (E / 2 - tiefe / 2);
    const quer = nx === 0; // Regal liegt quer (Breite entlang x)
    const dreh = Math.atan2(nx, nz);
    const brett = (u, y, w, h, d, v = 0, farbe = "#5a3a22") => {
      const px = mx + (quer ? u : nx * v), pz = mz + (quer ? nz * v : u);
      holz.add(KASTEN(), farbe, [px, y, pz], [0, dreh, 0], [w, h, d]);
    };
    brett(0, REGAL_H / 2, 1.96, REGAL_H, 0.06, -tiefe / 2 + 0.03, "#3a2616");
    brett(-0.95, REGAL_H / 2, 0.08, REGAL_H, tiefe, 0, "#5a3a22");
    brett(0.95, REGAL_H / 2, 0.08, REGAL_H, tiefe, 0, "#5a3a22");
    brett(0, REGAL_H + 0.08, 2.1, 0.18, tiefe + 0.1, 0.02, "#6a4428");
    for (let r = 0; r < 5; r++) {
      const y = 0.15 + r * 0.85;
      brett(0, y, 1.84, 0.06, tiefe, 0, "#6a4428");
      // Bücher auf diesem Brett
      let u = -0.88;
      let n = 0;
      while (u < 0.86) {
        const s = hash(tx * 7 + r, ty * 3 + n, 2);
        const breite = 0.05 + s * 0.07;
        if (u + breite > 0.88) break;
        if (hash(tx, ty * 9 + r, n + 20) > 0.93) { u += 0.12; n++; continue; }
        const hoehe = 0.4 + hash(tx, ty, r * 30 + n) * 0.28;
        const kipp = hash(n, r, tx + ty) > 0.94 ? 0.25 : 0;
        const tiefeB = 0.42 + hash(n, tx, ty + r) * 0.12;
        const ux = u + breite / 2 + (kipp ? 0.04 : 0);
        const px = mx + (quer ? ux : 0) + (quer ? 0 : nx * (0.03)), pz = mz + (quer ? nz * 0.03 : ux);
        buecher.push({ p: [px, y + 0.03 + hoehe / 2 * Math.cos(kipp), pz], dreh, kipp, s: [breite, hoehe, tiefeB], f: farben[Math.floor(hash(r, n, tx * 13 + ty) * farben.length)] });
        u += breite + 0.004 + (kipp ? 0.12 : 0);
        n++;
      }
    }
  }
  holz.in(szene);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.75 }), buecher.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  buecher.forEach((b, i) => {
    e.set(0, b.dreh, b.kipp, "YXZ");
    q.setFromEuler(e);
    m.compose(new THREE.Vector3(...b.p), q, new THREE.Vector3(...b.s));
    inst.setMatrixAt(i, m);
    inst.setColorAt(i, c.set(b.f).offsetHSL(0, 0, (hash(i, 1, 1) - 0.5) * 0.08));
  });
  inst.castShadow = true;
  inst.receiveShadow = true;
  szene.add(inst);
}

// ---------- Kerzen ----------

function kerzenBauen(szene, raster, animationen) {
  const t = new Teile();
  const flammen = [];
  const orte = [];
  for (const [tx, ty] of kacheln(raster, "c")) {
    const x = welt(tx), z = welt(ty);
    t.add(DREH([V(0, 0), V(0.32, 0), V(0.3, 0.06), V(0.14, 0.14), V(0.06, 0.3), V(0, 0.3)], 18, "kfuss"), "#3a3440", [x, 0, z], [0, 0, 0], 1, { art: "glanz" });
    t.add(ZYL(1, 1, 10), "#3a3440", [x, 0.95, z], [0, 0, 0], [0.04, 1.4, 0.04], { art: "glanz" });
    t.add(RING(0.15, Math.PI), "#3a3440", [x, 1.62, z], [0, 0, Math.PI], [0.3, 0.22, 0.3], { art: "glanz" });
    t.add(ZYL(1, 1, 10), "#c9a24e", [x, 1.66, z], [0, 0, 0], [0.12, 0.05, 0.12], { art: "glanz" });
    for (const dx of [-0.3, 0, 0.3]) {
      const hoehe = dx === 0 ? 0.32 : 0.24;
      const y0 = dx === 0 ? 1.7 : 1.62;
      t.add(ZYL(1, 1, 10), "#c9a24e", [x + dx, y0 - 0.02, z], [0, 0, 0], [0.08, 0.03, 0.08], { art: "glanz" });
      t.add(ZYL(1, 1, 10), "#f2ead6", [x + dx, y0 + hoehe / 2, z], [0, 0, 0], [0.045, hoehe, 0.045]);
      t.add(KUGEL_K(), "#f8f2e4", [x + dx + 0.03, y0 + hoehe * 0.7, z + 0.03], [0, 0, 0], [0.015, 0.05, 0.015]);
      flammen.push(new THREE.Vector3(x + dx, y0 + hoehe + 0.08, z));
    }
    orte.push(new THREE.Vector3(x, 1.7, z));
  }
  t.in(szene);
  // Flammen: ein InstancedMesh, flackert
  const geo = new THREE.SphereGeometry(1, 10, 8);
  geo.translate(0, 0.6, 0);
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.75, 0.35).multiplyScalar(2.5), toneMapped: false }), flammen.length);
  szene.add(inst);
  // Lichtschein
  const schein = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(flammen.filter((_, i) => i % 3 === 1)),
    new THREE.PointsMaterial({ map: textur(lichtTextur("rgba(255,190,110,0.9)")), size: 2.4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }),
  );
  szene.add(schein);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  animationen.push((zeit) => {
    flammen.forEach((p, i) => {
      const f = 1 + Math.sin(zeit * 13 + i * 1.7) * 0.12 + Math.sin(zeit * 29 + i) * 0.08;
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin(zeit * 3 + i) * 0.08);
      m.compose(p, q, s.set(0.035, 0.07 * f, 0.035));
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    schein.material.opacity = 0.5 + Math.sin(zeit * 11) * 0.04;
  });
  return { orte };
}

// ---------- Fenster, Lichtstrahlen, Banner ----------

function fensterBauen(szene, raum, animationen, farben) {
  const glas = new THREE.MeshBasicMaterial({ map: textur(fensterTextur()), toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.25) });
  const strahlMat = new THREE.MeshBasicMaterial({
    map: textur(strahlTextur()), color: "#8aa8ff", transparent: true, opacity: 0.16,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
  });
  const fensterGeo = new THREE.PlaneGeometry(1.5, 3.8);
  const bannerFarben = farben ?? Object.values(TORFARBEN);
  raum.forEach((k, i) => {
    const zm = ((k.z0 + k.z1 + 1) / 2) * E;
    for (const seite of [-1, 1]) {
      const x = seite < 0 ? 12.02 : 47.98;
      const f = new THREE.Mesh(fensterGeo, glas);
      f.position.set(x, 4.6, zm);
      f.rotation.y = seite < 0 ? Math.PI / 2 : -Math.PI / 2;
      szene.add(f);
      // Fensterbank
      const bank = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 1.9), new THREE.MeshStandardMaterial({ color: "#5c5674" }));
      bank.position.set(x - seite * 0.15, 2.65, zm);
      szene.add(bank);
      // Lichtstrahl schräg nach unten in den Raum
      if (seite < 0) {
        const strahl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, 11, 14, 1, true), strahlMat);
        const richtung = new THREE.Vector3(1, -0.62, 0.22).normalize();
        strahl.position.set(x, 4.4, zm).addScaledVector(richtung, 5.5);
        strahl.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), richtung);
        strahl.renderOrder = 2;
        szene.add(strahl);
      }
      // Banner zwischen den Fenstern
      const farbe = bannerFarben[(raum.length - 1 - i) % bannerFarben.length] ?? "#c9a24e";
      for (const dz of [-3.2, 3.2]) {
        const geo = new THREE.PlaneGeometry(1.1, 3.2, 1, 8);
        const banner = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: textur(bannerTextur(farbe)), side: THREE.DoubleSide, roughness: 0.9 }));
        banner.position.set(x - seite * 0.06, 4.3, zm + dz);
        banner.rotation.y = seite < 0 ? Math.PI / 2 : -Math.PI / 2;
        banner.castShadow = true;
        szene.add(banner);
        const pos = geo.attributes.position, basis = Float32Array.from(pos.array);
        const phase = i * 2 + dz + seite;
        animationen.push((zeit) => {
          for (let v = 0; v < pos.count; v++) {
            const yy = basis[v * 3 + 1];
            pos.array[v * 3 + 2] = Math.sin(zeit * 1.3 + yy * 1.5 + phase) * 0.05 * (1.6 - yy) * 0.6;
          }
          pos.needsUpdate = true;
        });
        const stange = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#c9a24e", metalness: 0.6, roughness: 0.4 }));
        stange.position.set(x - seite * 0.1, 5.92, zm + dz);
        stange.rotation.y = seite < 0 ? 0 : Math.PI;
        szene.add(stange);
      }
    }
  });
}

function bannerTextur(farbe) {
  const [c, g] = leinwand(64, 192);
  const basis = new THREE.Color(farbe);
  const dunkel = basis.clone().multiplyScalar(0.45);
  g.fillStyle = `#${dunkel.getHexString()}`;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 0); g.lineTo(64, 170); g.lineTo(32, 192); g.lineTo(0, 170); g.fill();
  g.strokeStyle = "#e0b850"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(4, 2); g.lineTo(4, 168); g.lineTo(32, 188); g.lineTo(60, 168); g.lineTo(60, 2); g.stroke();
  // Wappen: aufgeschlagenes Buch mit Feder
  g.fillStyle = `#${basis.getHexString()}`;
  g.beginPath(); g.arc(32, 80, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f2e6c8";
  g.beginPath(); g.moveTo(16, 84); g.quadraticCurveTo(24, 76, 32, 82); g.quadraticCurveTo(40, 76, 48, 84); g.lineTo(48, 92); g.quadraticCurveTo(40, 86, 32, 92); g.quadraticCurveTo(24, 86, 16, 92); g.fill();
  g.strokeStyle = "#f2e6c8"; g.lineWidth = 2; g.beginPath(); g.moveTo(36, 78); g.lineTo(46, 62); g.stroke();
  return c;
}

// ---------- Schwebende Bücher, lose Seiten und Staub ----------

function schwebendeBuecher(szene, raum, animationen) {
  const seiten = new THREE.MeshStandardMaterial({ map: textur(buchseitenTextur()), side: THREE.DoubleSide, roughness: 0.9 });
  const einband = new THREE.MeshStandardMaterial({ color: "#7a2a2a", roughness: 0.7 });
  const buecher = [];
  raum.forEach((k, i) => {
    for (let j = 0; j < 2; j++) {
      const g = new THREE.Group();
      const links = new THREE.Group(), rechts = new THREE.Group();
      for (const [h, s] of [[links, -1], [rechts, 1]]) {
        const deckel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.56), einband);
        deckel.position.x = s * 0.21;
        const blatt = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.52).rotateX(-Math.PI / 2), seiten);
        blatt.position.set(s * 0.2, 0.02, 0);
        blatt.geometry = blatt.geometry.clone();
        const uv = blatt.geometry.attributes.uv;
        for (let v = 0; v < uv.count; v++) uv.setX(v, s < 0 ? uv.getX(v) * 0.5 : 0.5 + uv.getX(v) * 0.5);
        h.add(deckel, blatt);
        g.add(h);
      }
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      const mitte = new THREE.Vector3(30 + (j ? 7 : -7), 3.0 + j * 0.6, ((k.z0 + k.z1 + 1) / 2) * E);
      szene.add(g);
      buecher.push({ g, links, rechts, mitte, phase: i * 1.7 + j * 3.1, r: 1.6 + j * 0.6 });
    }
  });
  // Staubkörnchen im Licht
  const n = 420;
  const pos = new Float32Array(n * 3), basis = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    basis[i * 3] = 13 + hash(i, 1, 77) * 34;
    basis[i * 3 + 1] = 0.3 + hash(i, 2, 77) * 6.5;
    basis[i * 3 + 2] = 2 + hash(i, 3, 77) * ((raum.at(-1)?.z1 ?? 40) * E);
  }
  const staubGeo = new THREE.BufferGeometry();
  staubGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const staub = new THREE.Points(staubGeo, new THREE.PointsMaterial({
    map: textur(lichtTextur("rgba(255,235,200,1)")), size: 0.09, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8,
  }));
  staub.frustumCulled = false;
  szene.add(staub);
  animationen.push((zeit) => {
    for (const b of buecher) {
      const a = zeit * 0.25 + b.phase;
      b.g.position.set(b.mitte.x + Math.cos(a) * b.r, b.mitte.y + Math.sin(zeit * 1.1 + b.phase) * 0.25, b.mitte.z + Math.sin(a) * b.r * 0.6);
      b.g.rotation.y = -a + Math.PI / 2;
      b.g.rotation.z = Math.sin(zeit * 0.9 + b.phase) * 0.15;
      const flattern = 0.35 + Math.sin(zeit * 3 + b.phase) * 0.25;
      b.links.rotation.z = flattern; b.rechts.rotation.z = -flattern;
    }
    for (let i = 0; i < n; i++) {
      pos[i * 3] = basis[i * 3] + Math.sin(zeit * 0.2 + i) * 0.6;
      pos[i * 3 + 1] = basis[i * 3 + 1] + Math.sin(zeit * 0.15 + i * 0.7) * 0.5;
      pos[i * 3 + 2] = basis[i * 3 + 2] + Math.cos(zeit * 0.17 + i * 1.3) * 0.6;
    }
    staubGeo.attributes.position.needsUpdate = true;
  });
}

// ---------- Objekte der Halle ----------

function objektModell(o, animationen) {
  if (o.art === "tor") return torBauen(o, animationen);
  if (o.bild === "pult") return { modell: pultBauen(animationen) };
  if (o.bild === "siegeltuer") return { modell: siegelBauen(animationen), versatz: [0, 0.95] };
  if (o.bild === "kristall") return kristallBauen(o, animationen);
  if (o.bild === "buch_stimmen") return buchBauen(animationen);
  if (WAECHTER[o.bild]) {
    const f = torwaechterBauen(WAECHTER[o.bild]);
    f.gruppe.scale.setScalar(1.25);
    return { modell: f.gruppe, figur: f, boss: true };
  }
  return null;
}

function torBauen(o, animationen) {
  const farbe = o.farbe ?? TORFARBEN[o.id] ?? "#c9a24e";
  const g = new THREE.Group();
  const t = new Teile();
  // Torbogen auf beiden Seiten
  for (const s of [-1, 1]) {
    t.add(RING(0.16, Math.PI), "#5c5674", [0, 4.6, s * 1.02], [0, 0, 0], [2.05, 2.05, 1.2]);
    t.add(KASTEN(), "#4a4460", [0, 6.85, s * 1.02], [0, 0, 0], [4.6, 0.5, 0.35]);
    for (const x of [-2.15, 2.15]) t.add(KASTEN(), "#4a4460", [x, 2.3, s * 1.02], [0, 0, 0], [0.42, 4.6, 0.35]);
  }
  // Bogenfeld über den Flügeln
  for (const s of [-1, 1]) t.add(geo2("halbkreis"), "#2e2a3c", [0, 4.6, s * 0.95], [0, s < 0 ? Math.PI : 0, 0], [2.0, 2.0, 1]);
  // Schlussstein
  t.add(KASTEN(), "#6a6488", [0, 6.6, 1.15], [0, 0, Math.PI / 4], [0.5, 0.5, 0.2]);
  t.in(g);
  const stein = new Teile();
  stein.add(geo2("raute"), farbe, [0, 6.6, 1.27], [0, 0, 0], [0.16, 0.22, 0.05], { art: "leucht" });
  stein.in(g);
  // Namensschild über dem Bogen
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.75), new THREE.MeshBasicMaterial({ map: textur(schildTextur(o.name, farbe)), transparent: true, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) }));
  schild.position.set(0, 5.35, 1.12);
  g.add(schild);
  // Zwei Torflügel mit Scharnier außen
  const holz = new THREE.MeshStandardMaterial({ map: textur(holzTextur("#6a4026")), roughness: 0.8 });
  const eisen = new THREE.MeshStandardMaterial({ color: "#3a3440", metalness: 0.7, roughness: 0.4 });
  const runenMat = new THREE.MeshBasicMaterial({ map: textur(runenTextur(farbe, o.y)), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const fluegel = [];
  for (const s of [-1, 1]) {
    const scharnier = new THREE.Group();
    scharnier.position.set(s * 1.98, 0, 0);
    const blatt = new THREE.Group();
    blatt.position.x = -s * 0.99;
    const brett = new THREE.Mesh(new THREE.BoxGeometry(1.96, 4.55, 0.18), holz);
    brett.position.y = 2.28;
    blatt.add(brett);
    for (const y of [0.8, 2.3, 3.8]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.24), eisen);
      band.position.y = y;
      blatt.add(band);
      for (const x of [-0.7, 0, 0.7]) {
        const niete = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), eisen);
        niete.position.set(x, y, 0.13);
        blatt.add(niete);
      }
    }
    const griff = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 16), eisen);
    griff.position.set(s * 0.72, 2.3, 0.2);
    blatt.add(griff);
    const runen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 2.6), runenMat);
    runen.position.set(s * 0.45, 2.6, 0.1);
    blatt.add(runen);
    const runenHinten = runen.clone();
    runenHinten.position.z = -0.1;
    runenHinten.rotation.y = Math.PI;
    blatt.add(runenHinten);
    blatt.traverse((m) => { if (m.isMesh && m !== runen && m !== runenHinten) { m.castShadow = true; m.receiveShadow = true; } });
    scharnier.add(blatt);
    g.add(scharnier);
    fluegel.push({ scharnier, s });
  }
  // Leuchten in der Torspalte
  const spalt = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 4.6), new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  spalt.position.set(0, 2.4, 0.12);
  g.add(spalt);
  // Farbiger Lichtschein vor dem Tor (ohne echtes Licht – spart Rechenzeit)
  const schein = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: textur(lichtTextur("rgba(255,255,255,0.9)")), color: farbe, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  schein.position.set(0, 0.03, 1.9);
  g.add(schein);

  let offen = 0, ziel = 0;
  const setzeOffen = (an, sofort = false) => {
    ziel = an ? 1 : 0;
    if (sofort) offen = ziel;
  };
  animationen.push((zeit, dt = 0.016) => {
    offen += Math.sign(ziel - offen) * Math.min(Math.abs(ziel - offen), dt * 0.55);
    const e = offen < 0.5 ? 2 * offen * offen : 1 - (-2 * offen + 2) ** 2 / 2;
    for (const f of fluegel) f.scharnier.rotation.y = -f.s * e * 1.75;
    const puls = 0.6 + Math.sin(zeit * 2.2 + o.y) * 0.3;
    runenMat.opacity = (1 - e) * puls + 0.08;
    spalt.material.opacity = (1 - e) * (0.5 + puls * 0.4);
    spalt.visible = e < 0.98;
    schein.material.opacity = (1 - e) * 0.3 * puls + 0.05;
  });
  return { modell: g, setzeOffen };
}

const geoCache2 = new Map();
function geo2(name) {
  if (!geoCache2.has(name)) {
    if (name === "raute") geoCache2.set(name, new THREE.OctahedronGeometry(1, 0));
    if (name === "halbkreis") geoCache2.set(name, new THREE.CircleGeometry(1, 24, 0, Math.PI));
  }
  return geoCache2.get(name);
}

export function pultBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  const holz = "#5a3a22";
  t.add(DREH([V(0, 0), V(0.45, 0), V(0.42, 0.1), V(0.2, 0.18), V(0.13, 0.5), V(0.16, 0.9), V(0.1, 1.05), V(0, 1.05)], 18, "pultfuss"), holz, [0, 0, 0]);
  t.add(KASTEN(), "#6a4428", [0, 1.18, 0], [-0.45, 0, 0], [1.1, 0.08, 0.75]);
  t.add(KASTEN(), "#4a2e1a", [0, 1.12, 0.32], [-0.45, 0, 0], [1.12, 0.12, 0.05]);
  // Tintenfass und Feder
  t.add(ZYL(0.7, 1, 12), "#1a2a4a", [0.42, 1.3, -0.25], [0, 0, 0], [0.07, 0.1, 0.07], { art: "glanz" });
  t.add(KEGEL(8), "#f4f0e8", [0.46, 1.48, -0.25], [0, 0, -0.35], [0.03, 0.32, 0.012]);
  t.in(g);
  // Aufgeschlagenes Buch
  const seiten = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), new THREE.MeshStandardMaterial({ map: textur(buchseitenTextur()), roughness: 0.9 }));
  seiten.position.set(0, 1.235, 0.0);
  seiten.rotation.x = -Math.PI / 2 - 0.45;
  g.add(seiten);
  // Schwebende Leuchtschrift über dem Buch
  const funken = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 24 }, (_, i) => new THREE.Vector3((hash(i, 1, 5) - 0.5) * 0.7, 1.35 + hash(i, 2, 5) * 0.6, (hash(i, 3, 5) - 0.5) * 0.4))),
    new THREE.PointsMaterial({ map: textur(lichtTextur("rgba(255,220,140,1)")), size: 0.08, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  g.add(funken);
  animationen.push((zeit) => {
    funken.rotation.y = zeit * 0.3;
    funken.material.opacity = 0.5 + Math.sin(zeit * 2) * 0.3;
  });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function siegelBauen(animationen) {
  const g = new THREE.Group();
  const t = new Teile();
  // Steinrahmen und schwere Tür
  t.add(KASTEN(), "#3a3448", [0, 3.0, 0], [0, 0, 0], [3.9, 6.0, 0.3]);
  for (const x of [-2.2, 2.2]) t.add(KASTEN(), "#5c5674", [x, 3.2, 0.1], [0, 0, 0], [0.6, 6.4, 0.5]);
  t.add(KASTEN(), "#5c5674", [0, 6.4, 0.1], [0, 0, 0], [5.0, 0.6, 0.5]);
  // Ketten
  for (const s of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      t.add(RING(0.28), "#6a6478", [s * (1.8 - u * 1.8), 4.8 - u * 1.9 + Math.sin(u * Math.PI) * -0.25, 0.25], [i % 2 ? Math.PI / 2 : 0, 0, s * 0.8], [0.12, 0.18, 0.12], { art: "glanz" });
    }
  }
  t.in(g);
  const siegel = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshBasicMaterial({ map: textur(siegelTextur()), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  siegel.position.set(0, 3.0, 0.2);
  g.add(siegel);
  const schein = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: textur(lichtTextur("rgba(255,255,255,0.9)")), color: "#a070ff", transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  schein.position.set(0, 0.03, 1.6);
  g.add(schein);
  animationen.push((zeit) => {
    siegel.rotation.z = zeit * 0.2;
    siegel.material.opacity = 0.75 + Math.sin(zeit * 1.7) * 0.2;
    schein.material.opacity = 0.3 + Math.sin(zeit * 1.7) * 0.08;
  });
  g.traverse((m) => { if (m.isMesh && m !== siegel) { m.receiveShadow = true; } });
  return g;
}

// ---------- Für die Inseln der Stimmen: Echo-Kristall und Buch der Stimmen ----------

/** Echo-Kristall auf einem Steinsockel. Glimmt schwach, bis die Aufgabe gelöst ist – dann leuchtet er hell. */
export function kristallBauen(o, animationen) {
  const farbe = new THREE.Color(o.farbe ?? "#9af4ff");
  const dunkel = farbe.clone().multiplyScalar(0.28);
  const g = new THREE.Group();
  const t = new Teile();
  t.add(DREH([V(0, 0), V(0.55, 0), V(0.52, 0.12), V(0.3, 0.2), V(0.2, 0.7), V(0.32, 0.86), V(0.36, 0.98), V(0, 0.98)], 20, "kristallsockel"), "#5c5674", [0, 0, 0]);
  t.add(RING(0.08), "#c9a24e", [0, 0.92, 0], [Math.PI / 2, 0, 0], [0.34, 0.34, 0.3], { art: "glanz" });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    t.add(KASTEN(), "#4a4460", [Math.cos(a) * 0.42, 0.06, Math.sin(a) * 0.42], [0, -a, 0], [0.16, 0.12, 0.1]);
  }
  t.in(g);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  const mat = new THREE.MeshBasicMaterial({ color: dunkel.clone(), toneMapped: false });
  const kristall = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), mat);
  kristall.scale.set(0.24, 0.44, 0.24);
  kristall.position.y = 1.62;
  g.add(kristall);
  const splitter = new THREE.Group();
  splitter.position.y = 1.62;
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(kristall.geometry, mat);
    const a = (i / 5) * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.52, Math.sin(i * 1.7) * 0.16, Math.sin(a) * 0.52);
    s.scale.set(0.045, 0.1, 0.045);
    splitter.add(s);
  }
  g.add(splitter);
  const glanz = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,255,255,0.9)")), color: farbe, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glanz.position.y = 1.62;
  g.add(glanz);
  const schein = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: textur(lichtTextur("rgba(255,255,255,0.9)")), color: farbe, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  schein.position.y = 0.03;
  g.add(schein);

  let an = 0, ziel = 0;
  g.userData.setzeLeuchten = (wert, sofort) => {
    ziel = wert ? 1 : 0;
    if (sofort) an = ziel;
  };
  const versatz = (o.x ?? 0) * 0.7 + (o.y ?? 0) * 0.3;
  animationen.push((zeit, dt = 0.016) => {
    an += Math.sign(ziel - an) * Math.min(Math.abs(ziel - an), dt * 0.7);
    const puls = 0.5 + Math.sin(zeit * 2.1 + versatz) * 0.5;
    kristall.rotation.y = zeit * (0.4 + an * 0.9);
    kristall.position.y = 1.62 + Math.sin(zeit * 1.3 + versatz) * 0.06;
    splitter.rotation.y = -zeit * (0.25 + an * 0.9);
    splitter.position.y = kristall.position.y;
    mat.color.copy(dunkel).lerp(farbe, 0.3 + puls * 0.25 + an * 0.45);
    glanz.material.opacity = 0.2 + puls * 0.12 + an * 0.5;
    glanz.scale.setScalar(1.1 + an * 0.9 + puls * 0.1);
    schein.material.opacity = 0.1 + puls * 0.05 + an * 0.25;
  });
  return { modell: g };
}

/** Das Buch der Stimmen: ein großes Pult mit aufgeschlagenem Buch und einer Lichtsäule. */
export function buchBauen(animationen) {
  const g = new THREE.Group();
  const pult = pultBauen(animationen);
  pult.scale.setScalar(1.55);
  g.add(pult);
  const t = new Teile();
  // Stufen
  t.add(ZYL(1, 1, 28), "#4a4460", [0, 0.08, 0], [0, 0, 0], [1.6, 0.16, 1.6]);
  t.add(ZYL(1, 1, 28), "#5c5674", [0, 0.2, 0], [0, 0, 0], [1.25, 0.1, 1.25]);
  t.add(RING(0.05), "#c9a24e", [0, 0.26, 0], [Math.PI / 2, 0, 0], [1.25, 1.25, 0.3], { art: "glanz" });
  t.in(g);
  pult.position.y = 0.25;
  const saeule = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 7, 20, 1, true), new THREE.MeshBasicMaterial({
    map: textur(strahlTextur()), color: "#ffe2a0", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  }));
  saeule.position.y = 3.8;
  g.add(saeule);
  const seiten = new THREE.Group();
  seiten.position.y = 2.6;
  const seitenMat = new THREE.MeshBasicMaterial({ map: textur(buchseitenTextur()), side: THREE.DoubleSide, transparent: true, opacity: 0.85, toneMapped: false });
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), seitenMat);
    const a = (i / 6) * Math.PI * 2;
    s.position.set(Math.cos(a) * 1.1, Math.sin(i * 2.1) * 0.25, Math.sin(a) * 1.1);
    s.rotation.set(0.3, -a, 0.2);
    seiten.add(s);
  }
  g.add(seiten);
  let an = 0, ziel = 0;
  g.userData.setzeLeuchten = (wert, sofort) => {
    ziel = wert ? 1 : 0;
    if (sofort) an = ziel;
  };
  animationen.push((zeit, dt = 0.016) => {
    an += Math.sign(ziel - an) * Math.min(Math.abs(ziel - an), dt * 0.5);
    seiten.rotation.y = zeit * 0.35;
    seiten.position.y = 2.6 + Math.sin(zeit) * 0.12;
    seitenMat.opacity = 0.35 + an * 0.6;
    saeule.material.opacity = 0.05 + an * 0.3 + Math.sin(zeit * 1.5) * 0.03;
  });
  return { modell: g, versatz: [0, 0.2] };
}
