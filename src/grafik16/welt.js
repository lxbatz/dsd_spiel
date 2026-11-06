// 16-Bit-Welt: Boden als zusammenhängendes Bild, große Gebäude, Bäume und Objekte.

import { Bild, rampe, mische, toene, tonAus, hash, dunkel } from "./pinsel.js";

export const K = 16;
const R = (hex) => rampe(hex, -2, 1);
const R5 = (hex) => rampe(hex, -3, 1);

// ---------- Rauschen ----------

function glatt(x, y, groesse, saat) {
  const gx = x / groesse, gy = y / groesse;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = gx - x0, fy = gy - y0;
  const s = (t) => t * t * (3 - 2 * t);
  const a = hash(x0, y0, saat), b = hash(x0 + 1, y0, saat), c = hash(x0, y0 + 1, saat), d = hash(x0 + 1, y0 + 1, saat);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}

// ---------- Materialien ----------

const DRAUSSEN = { ".": "gras", "T": "gras", "F": "gras", "f": "gras", "H": "gras", "R": "gras", "d": "gras", ",": "weg", "~": "wasser" };
const DRINNEN = { "#": "wand", "_": "stein", "B": "stein", "c": "stein", "=": "teppich" };

function material(raster, tx, ty) {
  const zeile = raster[Math.max(0, Math.min(raster.length - 1, ty))];
  const z = zeile[Math.max(0, Math.min(zeile.length - 1, tx))];
  return DRAUSSEN[z] ?? DRINNEN[z] ?? "gras";
}

const GRAS = R5("#5aa53e");
const WEG = R5("#dcb878");
const WASSER = R5("#4a8ae0");
const STEIN = R5("#7a7090");
const WAND = R5("#5a5070");
const TEPPICH = R5("#a42a3c");
const GOLD = R("#e0b448");

/** Malt den kompletten Boden einer Karte. */
export function bodenMalen(raster) {
  const w = raster[0].length * K, h = raster.length * K;
  const b = new Bild(w, h);
  const mat = new Array(w * h);

  // 1. Material je Pixel (draußen mit gewellten Grenzen)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const genau = material(raster, Math.floor(x / K), Math.floor(y / K));
      let m = genau;
      if (genau === "gras" || genau === "weg" || genau === "wasser") {
        const wx = x + (glatt(x, y, 6, 11) - 0.5) * 7;
        const wy = y + (glatt(x, y, 6, 23) - 0.5) * 7;
        const n = material(raster, Math.floor(wx / K), Math.floor(wy / K));
        if (n === "gras" || n === "weg" || n === "wasser") m = n;
      }
      mat[y * w + x] = m;
    }
  }
  const M = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : mat[y * w + x]);
  const nahe = (x, y, art, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (M(x + dx, y + dy) === art) return true;
    return false;
  };

  // 2. Farben
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const m = M(x, y);
      let c;
      if (m === "gras") {
        const flecken = glatt(x, y, 24, 5) * 0.55 + glatt(x, y, 7, 9) * 0.45;
        c = tonAus(GRAS.slice(1, 4), flecken * 0.95 + 0.05, x, y, 0.8);
        // Grasbüschel
        const bx = x % 9, by = y % 7, s = hash(Math.floor(x / 9), Math.floor(y / 7), 3);
        if (s > 0.55 && ((by === 3 && (bx === 2 || bx === 4)) || (by === 2 && bx === 3))) c = GRAS[4];
        if (s > 0.55 && by === 4 && bx >= 2 && bx <= 4) c = GRAS[1];
        if (nahe(x, y, "weg", 1)) c = GRAS[1];
        if (nahe(x, y, "wasser", 2)) c = nahe(x, y, "wasser", 1) ? "#5a4228" : GRAS[1];
      } else if (m === "weg") {
        c = tonAus(WEG.slice(2, 5), 0.35 + glatt(x, y, 10, 7) * 0.5, x, y, 0.6);
        const kiesel = hash(x, y, 77);
        if (kiesel > 0.985) { c = WEG[1]; b.set(x + 1, y, WEG[4]); }
        else if (kiesel > 0.97) c = WEG[4];
        if (!nahe(x, y, "weg", 0) || ["gras"].some((a) => M(x - 1, y) === a || M(x + 1, y) === a || M(x, y - 1) === a || M(x, y + 1) === a)) c = WEG[1];
      } else if (m === "wasser") {
        const tief = nahe(x, y, "gras", 3) ? 3 : 2;
        c = tonAus([WASSER[2], WASSER[3]], tief === 3 ? 0.75 : 0.3 + glatt(x, y, 12, 4) * 0.4, x, y, 0.5);
        const welle = Math.sin(x * 0.45 + Math.floor(y / 5) * 2.1) > 0.82 && (y % 5 === 0);
        if (welle) c = WASSER[4];
        if (nahe(x, y, "gras", 1)) c = "#d8f0ff";
      } else if (m === "stein") {
        const bx = x % 8, by = y % 8;
        c = tonAus(STEIN.slice(1, 4), 0.5 + (hash(Math.floor(x / 8), Math.floor(y / 8), 4) - 0.5) * 0.5, x, y, 0.5);
        if (bx === 0 || by === 0) c = STEIN[4];
        if (bx === 7 || by === 7) c = STEIN[0];
        if (hash(x, y, 9) > 0.97) c = STEIN[1];
      } else if (m === "teppich") {
        const tx = Math.floor(x / K), ty = Math.floor(y / K);
        const links = material(raster, tx - 1, ty) !== "teppich", rechts = material(raster, tx + 1, ty) !== "teppich";
        const lx = x % K;
        c = TEPPICH[(Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 2 : 3];
        const rand = (links && lx <= 2) || (rechts && lx >= 13);
        if (rand) c = (links && lx === 1) || (rechts && lx === 14) ? GOLD[2] : TEPPICH[1];
        const mx = (x % 32) - 16, my = (y % 32) - 16;
        if (!rand && Math.abs(mx) + Math.abs(my) === 5) c = GOLD[1];
      } else if (m === "wand") {
        const ty = Math.floor(y / K);
        const unten = material(raster, Math.floor(x / K), ty + 1);
        const front = unten !== "wand";
        const ly = y % K;
        if (front) {
          // Vorderseite: Mauersteine
          const reihe = Math.floor(ly / 4), versatz = reihe % 2 ? 4 : 0;
          const fuge = ly % 4 === 3 || (x + versatz) % 8 === 7;
          c = fuge ? WAND[0] : tonAus(WAND.slice(1, 4), 0.55 - reihe * 0.08 + (hash(Math.floor((x + versatz) / 8), ty * 4 + reihe, 2) - 0.5) * 0.3, x, y, 0.5);
          if (ly <= 1) c = WAND[4];
        } else {
          c = (x + y) % 2 ? "#2a2440" : "#2e2846";
          if (hash(x, y, 31) > 0.96) c = "#3a3456";
        }
      }
      b.set(x, y, c);
    }
  }

  // 3. Blumen und Kleinkram
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z === "F") blumen(b, tx * K, ty * K, tx * 31 + ty);
    if (z === "." && hash(tx, ty, 42) > 0.88) blumen(b, tx * K, ty * K, tx * 13 + ty * 7, 2);
    if (z === "," && hash(tx, ty, 8) > 0.9) stein(b, tx * K + 5, ty * K + 9);
  }));

  // 4. Schatten
  raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
    if (z === "T") schatten(b, tx * K + 10, ty * K + 15, 10, 4);
    if (z === "B" || z === "c") schatten(b, tx * K + 10, ty * K + 15, 7, 2);
  }));
  for (const haus of haeuserFinden(raster)) {
    for (let y = haus.y * K + haus.h * K; y < haus.y * K + haus.h * K + 5; y++) {
      for (let x = haus.x * K + 4; x < (haus.x + haus.w) * K + 6; x++) { const c = b.get(x, y); if (c) b.set(x, y, toene(c, -1)); }
    }
  }
  return b;
}

function schatten(b, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) { const c = b.get(x, y); if (c) b.set(x, y, toene(c, -1)); }
    }
  }
}

function blumen(b, ox, oy, saat, anzahl = 6) {
  const farben = ["#f04858", "#f8d848", "#ffffff", "#78a8f8", "#f890c0"];
  for (let i = 0; i < anzahl; i++) {
    const x = ox + 2 + Math.floor(hash(saat, i, 1) * 11), y = oy + 2 + Math.floor(hash(saat, i, 2) * 11);
    const f = farben[Math.floor(hash(saat, i, 3) * farben.length)];
    b.set(x, y + 2, "#2f6a28");
    b.set(x - 1, y, f); b.set(x + 1, y, f); b.set(x, y - 1, f); b.set(x, y + 1, toene(f, -1));
    b.set(x, y, "#f8e070");
  }
}

function stein(b, x, y) {
  const s = R("#a09888");
  b.rect(x, y, 3, 2, s[2]); b.set(x, y, s[3]); b.rect(x, y + 2, 3, 1, s[0]);
}

// ---------- Häuser ----------

/** Findet Häuser (zusammenhängende R/H/d-Felder) im Raster. */
export function haeuserFinden(raster) {
  const gesehen = new Set();
  const haeuser = [];
  raster.forEach((zeile, y) => [...zeile].forEach((z, x) => {
    if (!"RHd".includes(z) || gesehen.has(`${x},${y}`)) return;
    let x1 = x, y1 = y;
    while ("RHd".includes(raster[y][x1 + 1] ?? "")) x1++;
    while ("RHd".includes(raster[y1 + 1]?.[x] ?? "")) y1++;
    let tuer = null;
    for (let yy = y; yy <= y1; yy++) for (let xx = x; xx <= x1; xx++) {
      gesehen.add(`${xx},${yy}`);
      if (raster[yy][xx] === "d") tuer = xx - x;
    }
    haeuser.push({ x, y, w: x1 - x + 1, h: y1 - y + 1, tuer });
  }));
  // Art des Hauses nach Größe und Lage
  haeuser.forEach((h) => { h.art = h.w >= 7 ? "rathaus" : h.x < 10 ? "wohnhaus" : "schmiede"; });
  return haeuser;
}

export const DACH_UEBERSTAND = 22;

export function hausBild(haus) {
  const W = haus.w * K, H = haus.h * K + DACH_UEBERSTAND;
  const b = new Bild(W, H);
  const dachFarbe = { rathaus: "#4e6ab8", wohnhaus: "#c84a36", schmiede: "#6a5a54" }[haus.art];
  const dach = R5(dachFarbe);
  const putz = R5(haus.art === "schmiede" ? "#b8a890" : "#eadcb8");
  const balken = R5("#6a4426");
  const wandOben = H - 30;          // Oberkante der Wand
  const traufe = wandOben + 2;

  // Wand
  b.verlauf(0, wandOben, W, 30, putz.slice(1, 5), { dither: 0.7 });
  b.rect(0, wandOben, W, 3, putz[1]);
  for (let x = 0; x < W; x += 2) b.set(x, H - 3, "#8a8478");
  b.rect(0, H - 3, W, 3, "#7a7468"); b.rect(0, H - 3, W, 1, "#9a9488");
  for (let x = 1; x < W; x += 6) b.set(x, H - 2, "#5a5650");
  // Fachwerk
  const pfosten = [0, W - 3];
  for (let x = 16; x < W - 8; x += 24) pfosten.push(x);
  for (const x of pfosten) b.rect(x, wandOben, 3, H - wandOben - 3, balken[2]);
  for (const x of pfosten) b.rect(x + 2, wandOben, 1, H - wandOben - 3, balken[1]);
  b.rect(0, wandOben + 13, W, 2, balken[2]); b.rect(0, wandOben + 14, W, 1, balken[1]);

  // Fenster
  const tuerX = (haus.tuer ?? Math.floor(haus.w / 2)) * K;
  for (let x = 4; x + 14 < W; x += 24) {
    if (Math.abs(x + 7 - (tuerX + 8)) < 14) continue;
    fenster(b, x + 1, wandOben + 4, haus.art);
  }
  // Tür
  tuer(b, tuerX + 1, H - 22, haus.art);

  // Dach (Satteldach von vorn, Ziegelreihen)
  const dachPunkte = [[-1, traufe], [W, traufe], [W - 10, 2], [9, 2]];
  b.poly(dachPunkte, (x, y) => {
    const reihe = Math.floor((traufe - y) / 4);
    const versatz = reihe % 2 ? 3 : 0;
    const fuge = (traufe - y) % 4 === 0 || (x + versatz) % 6 === 0;
    const seite = x < W / 2 ? 0.15 : -0.12;
    return fuge ? dach[1] : tonAus(dach.slice(1, 5), 0.5 + seite + (y < traufe - 18 ? 0.15 : 0) + (hash(Math.floor((x + versatz) / 6), reihe, 5) - 0.5) * 0.25, x, y, 0.4);
  });
  b.rect(9, 1, W - 18, 2, dach[4]); b.rect(9, 3, W - 18, 1, dach[2]);   // First
  b.rect(-1, traufe - 1, W + 1, 2, dach[0]);                             // Traufkante
  for (let x = 0; x < W; x++) { const c = b.get(x, traufe + 1); if (c) b.set(x, traufe + 1, toene(c, -1)); b.set(x, traufe + 2, toene(b.get(x, traufe + 2) ?? putz[1], -1)); }

  // Schornstein
  const sx = W - 22;
  const kamin = R("#8a7a70");
  b.rect(sx, -2 + 4, 8, 12, kamin[2]); b.rect(sx, 4, 2, 12, kamin[3]); b.rect(sx + 6, 4, 2, 12, kamin[1]);
  b.rect(sx - 1, 2, 10, 3, kamin[1]); b.rect(sx - 1, 2, 10, 1, kamin[3]);
  for (let y = 7; y < 16; y += 3) b.rect(sx, y, 8, 1, kamin[0]);

  // Besonderheiten
  if (haus.art === "rathaus") {
    // Wappen im Giebel
    b.kugel(W / 2, 12, 6, 6, R("#e0b448"), { dither: 0.3 });
    b.kugel(W / 2, 12, 4, 4, R("#3a5ab0"), { dither: 0.2 });
    b.rect(W / 2 - 1, 9, 2, 6, "#f8f0d0"); b.rect(W / 2 - 3, 11, 6, 2, "#f8f0d0");
    // Fahnen neben der Tür
    for (const fx of [tuerX - 8, tuerX + 22]) { b.rect(fx, wandOben + 2, 1, 14, balken[1]); b.rect(fx + 1, wandOben + 3, 5, 7, "#3a5ab0"); b.rect(fx + 1, wandOben + 6, 5, 1, "#e0b448"); }
  }
  if (haus.art === "schmiede") {
    // Schild mit Amboss
    b.rect(tuerX + 18, wandOben + 4, 12, 9, balken[2]); b.rect(tuerX + 19, wandOben + 5, 10, 7, "#d8c8a0");
    b.rect(tuerX + 21, wandOben + 7, 6, 2, "#3a3a44"); b.rect(tuerX + 23, wandOben + 9, 2, 2, "#3a3a44");
    // Glut im Fenster
    b.rect(2, wandOben + 16, 10, 8, "#2a1a14"); b.rect(3, wandOben + 20, 8, 3, "#f08020"); b.rect(5, wandOben + 21, 4, 1, "#ffe080");
  }
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function fenster(b, x, y, art) {
  const rahmen = R("#7a4e2a");
  b.rect(x, y, 13, 11, rahmen[1]);
  b.rect(x + 1, y + 1, 11, 9, "#3a5a8a");
  b.rect(x + 1, y + 1, 11, 4, "#5a8ac8");
  b.rect(x + 2, y + 2, 2, 2, "#c8e8ff");
  b.rect(x + 6, y + 1, 1, 9, rahmen[2]); b.rect(x + 1, y + 5, 11, 1, rahmen[2]);
  // Fensterläden
  b.rect(x - 3, y, 3, 11, art === "rathaus" ? "#3a5ab0" : "#4a8a3a"); b.rect(x + 13, y, 3, 11, art === "rathaus" ? "#3a5ab0" : "#4a8a3a");
  b.rect(x - 3, y + 5, 3, 1, "#2a3a2a"); b.rect(x + 13, y + 5, 3, 1, "#2a3a2a");
  // Blumenkasten
  if (art !== "schmiede") {
    b.rect(x - 1, y + 11, 15, 3, rahmen[2]); b.rect(x - 1, y + 13, 15, 1, rahmen[0]);
    for (let i = 0; i < 6; i++) { const f = ["#f04858", "#f8d848", "#f890c0"][i % 3]; b.set(x + i * 2 + 1, y + 10, f); b.set(x + i * 2, y + 11, "#3a8a2a"); }
  }
}

function tuer(b, x, y, art) {
  const holz = R5(art === "rathaus" ? "#7a3a2a" : art === "schmiede" ? "#4a3a30" : "#6a8a3a");
  b.rect(x - 1, y - 1, 16, 23, "#5a5048");
  b.rect(x, y, 14, 22, holz[2]);
  b.fuelle(x, y - 3, x + 13, y + 2, (px, py) => ((px - (x + 7)) / 7.5) ** 2 + ((py - (y + 2)) / 5) ** 2 <= 1, holz[2]);
  for (let i = 2; i < 14; i += 4) b.rect(x + i, y - 1, 1, 23, holz[1]);
  b.rect(x, y + 6, 14, 1, "#3a3a44"); b.rect(x, y + 15, 14, 1, "#3a3a44");
  b.set(x + 11, y + 11, "#e8c040"); b.set(x + 11, y + 12, "#a08020");
  b.rect(x - 2, y + 22, 18, 2, "#9a9488");
}

// ---------- Natur und Objekte ----------

export function baumBild(variante = 0) {
  const b = new Bild(34, 40);
  const blatt = R5(["#3a8a3a", "#2f7a3e", "#4a9a36"][variante % 3]);
  const stamm = R("#7a5232");
  b.zylinder(14, 26, 6, 12, stamm);
  b.set(13, 37, stamm[1]); b.set(20, 37, stamm[0]); b.rect(12, 38, 10, 1, stamm[0]);
  const ballen = [
    [17, 18, 14, 11], [9, 15, 7, 7], [25, 14, 7, 7], [17, 8, 9, 7], [10, 22, 6, 5], [24, 22, 6, 5], [17, 4, 6, 4],
  ];
  for (const [cx, cy, rx, ry] of ballen) b.kugel(cx, cy, rx, ry, blatt, { dither: 0.55 });
  for (let i = 0; i < 26; i++) {
    const x = 4 + Math.floor(hash(variante, i, 1) * 26), y = 2 + Math.floor(hash(variante, i, 2) * 24);
    if (b.get(x, y)) b.set(x, y, hash(variante, i, 3) > 0.5 ? blatt[4] : blatt[0]);
  }
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function zaunBild() {
  const b = new Bild(16, 16);
  const holz = R("#9a6a3a");
  b.rect(0, 6, 16, 2, holz[2]); b.rect(0, 6, 16, 1, holz[3]);
  b.rect(0, 11, 16, 2, holz[1]);
  b.zylinder(2, 3, 3, 12, holz); b.set(2, 3, holz[3]); b.set(3, 2, holz[2]);
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function brunnenBild() {
  const b = new Bild(26, 32);
  const stein = R5("#9a92a0");
  const holz = R("#7a5232");
  b.rect(3, 6, 2, 18, holz[2]); b.rect(21, 6, 2, 18, holz[1]);
  b.poly([[0, 8], [26, 8], [21, 1], [5, 1]], (x, y) => R("#b84a36")[y < 4 ? 3 : x < 13 ? 2 : 1]);
  b.rect(6, 9, 14, 1, holz[0]);
  b.rect(12, 9, 1, 8, "#c8b890"); b.rect(11, 16, 3, 3, holz[1]);
  b.zylinder(2, 19, 22, 11, stein);
  b.fuelle(1, 16, 25, 23, (x, y) => ((x - 13) / 11.5) ** 2 + ((y - 19.5) / 3.5) ** 2 <= 1, stein[4]);
  b.fuelle(3, 17, 23, 22, (x, y) => ((x - 13) / 9) ** 2 + ((y - 19.5) / 2.4) ** 2 <= 1, "#2a4a8a");
  b.set(9, 19, "#8ac0f0"); b.set(10, 19, "#8ac0f0");
  for (let x = 3; x < 24; x += 5) b.rect(x, 24 + (x % 2), 1, 3, stein[0]);
  b.rect(2, 26, 22, 1, stein[1]);
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function brettBild() {
  const b = new Bild(22, 28);
  const holz = R("#8a5a32");
  b.rect(3, 12, 2, 16, holz[1]); b.rect(17, 12, 2, 16, holz[0]);
  b.poly([[0, 4], [22, 4], [18, 0], [4, 0]], (x) => R("#6a4a2a")[x < 11 ? 2 : 1]);
  b.rect(1, 4, 20, 14, holz[2]); b.rect(2, 5, 18, 12, "#5a3a22");
  b.rect(3, 6, 6, 8, "#f4f0e0"); b.rect(10, 6, 8, 5, "#f0e0a0"); b.rect(11, 12, 6, 4, "#e8f0f8");
  for (const [x, y, w] of [[4, 8, 4], [4, 10, 3], [4, 12, 4], [11, 7, 6], [11, 9, 5], [12, 13, 4]]) b.rect(x, y, w, 1, "#8a8070");
  b.set(6, 6, "#d03030"); b.set(14, 6, "#3050d0");
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function standBild() {
  const b = new Bild(34, 34);
  const holz = R("#8a5a32");
  b.rect(3, 8, 2, 24, holz[1]); b.rect(29, 8, 2, 24, holz[0]);
  // Markise
  b.poly([[0, 14], [34, 14], [30, 2], [4, 2]], (x, y) => ((Math.floor((x + (14 - y) * 0.3) / 5)) % 2 ? "#f4f0e8" : "#d03a3a"));
  for (let x = 0; x < 34; x += 4) b.fuelle(x, 14, x + 4, 17, (px, py) => ((px - x - 2) / 2.2) ** 2 + ((py - 14) / 2.4) ** 2 <= 1 && py >= 14, (Math.floor(x / 4) % 2 ? "#f4f0e8" : "#d03a3a"));
  b.rect(4, 2, 26, 1, "#fff8f0");
  // Theke und Waren
  b.rect(1, 22, 32, 10, holz[2]); b.rect(1, 22, 32, 2, holz[3]); for (let x = 4; x < 32; x += 7) b.rect(x, 24, 1, 8, holz[1]);
  for (const [x, f] of [[4, "#e03a3a"], [7, "#e84a3a"], [5, "#c82a2a"]]) b.kugel(x + 1, 19 + (x % 2), 2, 2, R(f));
  for (const x of [13, 18]) { b.kugel(x, 20, 3, 1.8, R("#c8903a")); b.set(x - 1, 19, "#f0c070"); }
  for (const x of [25, 29]) b.kugel(x, 19.5, 2.4, 2.2, R("#6ab040"));
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function ambossBild() {
  const b = new Bild(18, 18);
  const holz = R("#7a5232");
  const eisen = R5("#5a5a68");
  b.zylinder(4, 10, 10, 8, holz);
  b.fuelle(3, 8, 15, 12, (x, y) => ((x - 9) / 6) ** 2 + ((y - 10) / 2) ** 2 <= 1, holz[3]);
  b.rect(5, 6, 8, 3, eisen[2]); b.rect(1, 4, 15, 3, eisen[3]); b.rect(1, 4, 15, 1, eisen[4]); b.rect(0, 5, 2, 1, eisen[2]);
  b.rect(6, 7, 6, 2, eisen[1]);
  b.rect(13, 1, 1, 6, holz[2]); b.rect(11, 0, 5, 2, eisen[3]);
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function pultBild() {
  const b = new Bild(18, 24);
  const holz = R5("#7a4a2a");
  b.zylinder(7, 10, 4, 12, holz);
  b.rect(3, 21, 12, 3, holz[1]); b.rect(3, 21, 12, 1, holz[3]);
  b.poly([[0, 10], [18, 10], [16, 3], [2, 3]], (x, y) => holz[y < 6 ? 4 : 3]);
  b.rect(2, 3, 6, 6, "#f4ecd8"); b.rect(10, 3, 6, 6, "#ece2c8"); b.rect(8, 3, 2, 6, "#c8b890");
  for (let y = 4; y < 8; y += 2) { b.rect(3, y, 4, 1, "#9a9080"); b.rect(11, y, 4, 1, "#9a9080"); }
  b.linie(14, 0, 16, 4, "#f8f8ff"); b.set(15, 1, "#d8d8e8");
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function regalBild() {
  const b = new Bild(16, 26);
  const holz = R5("#6a3e22");
  b.rect(0, 0, 16, 26, holz[2]);
  b.rect(1, 2, 14, 22, holz[0]);
  const buecher = ["#b83a3a", "#3a6ab8", "#3a9a4a", "#d8a83a", "#8a4ab0", "#c8b088", "#2a8a8a"];
  [2, 9, 16].forEach((y, r) => {
    let x = 1;
    while (x < 15) {
      const w = 1 + Math.floor(hash(x, r, 4) * 2), hb = 5 + Math.floor(hash(x, r, 5) * 2);
      const f = R(buecher[Math.floor(hash(x, r, 6) * buecher.length)]);
      b.rect(x, y + 7 - hb, w, hb, f[2]); b.rect(x, y + 7 - hb, 1, hb, f[3]); b.set(x, y + 7 - hb + 1, "#f0e0a0");
      x += w;
    }
    b.rect(0, y + 7, 16, 1, holz[3]);
  });
  b.rect(0, 0, 16, 2, holz[4]); b.rect(0, 0, 1, 26, holz[3]); b.rect(15, 0, 1, 26, holz[1]);
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function kerzeBild(flamme) {
  const b = new Bild(16, 26);
  const eisen = R("#6a6070");
  b.rect(4, 23, 8, 2, eisen[1]); b.rect(5, 22, 6, 1, eisen[2]);
  b.rect(7, 8, 2, 14, eisen[2]); b.rect(7, 8, 1, 14, eisen[3]);
  b.rect(3, 9, 10, 1, eisen[1]); b.rect(3, 7, 2, 2, eisen[2]); b.rect(11, 7, 2, 2, eisen[2]);
  for (const x of [3, 7, 11]) {
    b.rect(x, x === 7 ? 3 : 4, 2, x === 7 ? 5 : 4, "#f4ecd8");
    const fy = (x === 7 ? 0 : 1) - (flamme && x !== 7 ? 1 : 0);
    b.rect(x, fy, 2, 3, "#ffb030"); b.set(x + (flamme ? 1 : 0), fy, "#fff4b0"); b.set(x, fy + 2, "#ff7020");
  }
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function torBild(offen, gluehen) {
  const b = new Bild(32, 32);
  const stein = R5("#8a8098");
  // Bogen
  b.rect(0, 4, 5, 28, stein[2]); b.rect(27, 4, 5, 28, stein[1]);
  b.fuelle(0, 0, 31, 14, (x, y) => ((x - 16) / 16) ** 2 + ((y - 14) / 14) ** 2 <= 1 && !(((x - 16) / 11) ** 2 + ((y - 14) / 10) ** 2 <= 1),
    (x, y) => tonAus(stein.slice(1, 5), 0.7 - x / 60, x, y, 0.4));
  for (let y = 6; y < 32; y += 5) { b.rect(0, y, 5, 1, stein[0]); b.rect(27, y, 5, 1, stein[0]); }
  b.rect(14, 0, 4, 5, stein[4]); b.rect(14, 4, 4, 1, stein[1]);
  if (!offen) {
    const holz = R5("#6a4426");
    b.fuelle(5, 4, 26, 31, (x, y) => y >= 14 || ((x - 16) / 11) ** 2 + ((y - 14) / 10) ** 2 <= 1,
      (x, y) => ((x - 5) % 4 === 0 ? holz[1] : holz[(x < 16 ? 3 : 2)]));
    b.rect(5, 12, 22, 2, "#4a4a58"); b.rect(5, 24, 22, 2, "#4a4a58");
    b.rect(15, 6, 2, 26, holz[0]);
    const glut = gluehen ? "#fff4a0" : "#e8c040";
    b.kugel(16, 19, 4.5, 4.5, gluehen ? R("#f8d860") : R("#d8a830"), { dither: 0.3 });
    b.rect(15, 16, 2, 6, glut); b.rect(13, 18, 6, 2, glut);
  } else {
    b.fuelle(5, 4, 26, 31, (x, y) => (y >= 14 || ((x - 16) / 11) ** 2 + ((y - 14) / 10) ** 2 <= 1) && (x < 8 || x > 23),
      (x) => R5("#6a4426")[x < 16 ? 3 : 1]);
  }
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function siegeltuerBild() {
  const b = new Bild(32, 32);
  const eisen = R5("#4a4658");
  b.rect(1, 2, 30, 30, eisen[1]);
  b.rect(3, 4, 26, 28, eisen[2]);
  for (let x = 5; x < 29; x += 6) b.rect(x, 4, 1, 28, eisen[0]);
  for (const y of [8, 26]) { b.rect(3, y, 26, 2, eisen[3]); for (let x = 5; x < 29; x += 6) b.set(x + 2, y, "#c8c8d8"); }
  b.linie(3, 12, 29, 22, "#8a8a98"); b.linie(3, 22, 29, 12, "#8a8a98");
  b.kugel(16, 17, 6, 6, R5("#b02a2a"), { dither: 0.3 });
  b.kugel(16, 17, 3, 3, R("#e0b448"));
  b.set(16, 17, "#fff4c0");
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function portalBild(aktiv, phase = 0) {
  const b = new Bild(34, 22);
  const stein = R5("#8a8498");
  b.fuelle(0, 3, 33, 21, (x, y) => ((x - 16.5) / 16.5) ** 2 + ((y - 12) / 8.5) ** 2 <= 1, (x, y) => tonAus(stein.slice(1, 5), 0.75 - (y - 3) / 24, x, y, 0.5));
  b.fuelle(4, 6, 29, 18, (x, y) => ((x - 16.5) / 12.5) ** 2 + ((y - 12) / 5.6) ** 2 <= 1,
    aktiv ? (x, y) => {
      const a = Math.atan2((y - 12) * 2.2, x - 16.5) + phase * 1.1;
      const r = Math.hypot((x - 16.5) / 12.5, (y - 12) / 5.6);
      return tonAus(R5("#3a8ae8"), 0.95 - r * 0.6 + Math.sin(a * 3 + r * 6) * 0.18, x, y, 0.6);
    } : (x, y) => tonAus(R5("#3a3448"), 0.5 - (y - 6) / 30, x, y, 0.5));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = 16.5 + Math.cos(a) * 14.6, y = 12 + Math.sin(a) * 7.2;
    b.rect(Math.round(x) - 1, Math.round(y) - 3, 3, 4, stein[3]); b.rect(Math.round(x) - 1, Math.round(y) - 3, 3, 1, stein[4]);
    b.set(Math.round(x), Math.round(y) - 1, aktiv ? "#a8e8ff" : stein[1]);
  }
  if (aktiv) for (let i = 0; i < 5; i++) b.set(8 + ((i * 7 + phase * 3) % 18), 8 + ((i * 3 + phase) % 8), "#ffffff");
  b.umriss(null, { staerke: 0.3 });
  return b;
}

function markerBild() {
  const b = new Bild(11, 13);
  b.rund(0, 0, 11, 10, "#fff8e0", 2);
  b.poly([[3, 9], [7, 9], [5, 12]], "#fff8e0");
  b.rect(4, 2, 3, 4, "#e09a20"); b.rect(4, 7, 3, 2, "#e09a20"); b.rect(5, 2, 1, 4, "#ffd060");
  b.umriss("#3a2410");
  return b;
}

function funkelBild(n) {
  const b = new Bild(7, 7);
  const c = "#ffffff";
  if (n === 0) b.set(3, 3, c);
  if (n === 1) { b.set(3, 3, c); b.set(2, 3, "#b8e0ff"); b.set(4, 3, "#b8e0ff"); b.set(3, 2, "#b8e0ff"); b.set(3, 4, "#b8e0ff"); }
  if (n === 2) { b.rect(1, 3, 5, 1, "#b8e0ff"); b.rect(3, 1, 1, 5, "#b8e0ff"); b.set(3, 3, c); }
  return b;
}

function falterBild(n) {
  const b = new Bild(7, 5);
  const f = "#f8f0a0";
  if (n === 0) { b.rect(0, 0, 3, 3, f); b.rect(4, 0, 3, 3, f); b.rect(3, 1, 1, 3, "#3a2a1a"); }
  else { b.rect(1, 1, 2, 2, f); b.rect(4, 1, 2, 2, f); b.rect(3, 1, 1, 3, "#3a2a1a"); }
  return b;
}

/** Alle Objekte als Bilder (Schlüssel → Bild). Mehrere Bilder einer Animation: name_0, name_1 … */
export function objektBilder() {
  return {
    baum_0: baumBild(0), baum_1: baumBild(1), baum_2: baumBild(2),
    zaun: zaunBild(),
    brunnen: brunnenBild(),
    brett: brettBild(),
    marktstand: standBild(),
    amboss: ambossBild(),
    pult: pultBild(),
    regal: regalBild(),
    kerze_0: kerzeBild(false), kerze_1: kerzeBild(true),
    tor_zu_0: torBild(false, false), tor_zu_1: torBild(false, true), tor_offen: torBild(true),
    siegeltuer: siegeltuerBild(),
    portal_aus: portalBild(false), portal_an_0: portalBild(true, 0), portal_an_1: portalBild(true, 1), portal_an_2: portalBild(true, 2),
    marker: markerBild(),
    funkeln_0: funkelBild(0), funkeln_1: funkelBild(1), funkeln_2: funkelBild(2),
    falter_0: falterBild(0), falter_1: falterBild(1),
  };
}

export function lichtschein(groesse, farbe) {
  const c = document.createElement("canvas");
  c.width = c.height = groesse;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(groesse / 2, groesse / 2, 0, groesse / 2, groesse / 2, groesse / 2);
  g.addColorStop(0, farbe);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, groesse, groesse);
  return c;
}

export { dunkel, mische };
