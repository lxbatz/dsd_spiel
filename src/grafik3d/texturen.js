// Texturen für die 3D-Version, per Canvas gemalt.

import * as THREE from "../../vendor/three.module.min.js";
import { hash } from "../grafik16/pinsel.js";

export const PX_PRO_KACHEL = 32;

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

export function textur(c, { wiederholen = false, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (wiederholen) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}

function glatt(x, y, g, s) {
  const gx = x / g, gy = y / g, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const k = (t) => t * t * (3 - 2 * t);
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s);
  return a + (b - a) * k(fx) + (c - a) * k(fy) + (a - b - c + d) * k(fx) * k(fy);
}

const ART = { ",": "weg", "~": "wasser" };

/**
 * Bodentextur und Wassermaske aus dem Kartenraster.
 * Liefert { boden: Canvas, wasser: Canvas (weiß = Wasser) }.
 */
export function bodenTexturen(raster) {
  const P = PX_PRO_KACHEL;
  const W = raster[0].length * P, H = raster.length * P;
  const art = (tx, ty) => ART[raster[Math.max(0, Math.min(raster.length - 1, ty))]?.[Math.max(0, Math.min(raster[0].length - 1, tx))]] ?? "gras";

  const [boden, bctx] = canvas(W, H);
  const [maske, mctx] = canvas(W, H);
  const bild = bctx.createImageData(W, H);
  const mbild = mctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const wx = x + (glatt(x, y, 14, 3) - 0.5) * 16, wy = y + (glatt(x, y, 14, 7) - 0.5) * 16;
      const m = art(Math.floor(wx / P), Math.floor(wy / P));
      const n = glatt(x, y, 40, 1) * 0.6 + glatt(x, y, 9, 2) * 0.3 + hash(x, y, 5) * 0.1;
      let r, g, b;
      if (m === "gras") { r = 70 + n * 40; g = 128 + n * 52; b = 46 + n * 20; }
      else if (m === "weg") { r = 196 + n * 34; g = 164 + n * 30; b = 112 + n * 22; if (hash(x, y, 9) > 0.993) { r -= 50; g -= 50; b -= 40; } }
      else { r = 70 + n * 20; g = 90 + n * 18; b = 110 + n * 20; }
      const i = (y * W + x) * 4;
      bild.data[i] = r; bild.data[i + 1] = g; bild.data[i + 2] = b; bild.data[i + 3] = 255;
      const wasser = m === "wasser" ? 255 : 0;
      mbild.data[i] = mbild.data[i + 1] = mbild.data[i + 2] = wasser; mbild.data[i + 3] = 255;
    }
  }
  bctx.putImageData(bild, 0, 0);
  mctx.putImageData(mbild, 0, 0);
  // Weiche Übergänge
  const [weich, wctx] = canvas(W, H);
  wctx.filter = "blur(2.5px)";
  wctx.drawImage(boden, 0, 0);
  bctx.drawImage(weich, 0, 0);
  const [mweich, mwctx] = canvas(W, H);
  mwctx.filter = "blur(4px)";
  mwctx.drawImage(maske, 0, 0);
  // Feine Details über der Unschärfe
  for (let i = 0; i < W * H / 60; i++) {
    const x = hash(i, 1, 4) * W, y = hash(i, 2, 4) * H;
    bctx.fillStyle = hash(i, 3, 4) > 0.5 ? "rgba(255,255,220,0.10)" : "rgba(20,40,10,0.12)";
    bctx.fillRect(x, y, 2, 2);
  }
  return { boden, wasser: mweich };
}

/** Putz mit Fachwerk, Fenstern und optional Tür. */
export function wandTextur({ breite, hoehe, tuer = null, fenster = true, farbe = "#efe2c4", balken = "#6a4426", art = "wohnhaus" }) {
  const S = 64; // Pixel pro Welteinheit
  const [c, ctx] = canvas(Math.round(breite * S), Math.round(hoehe * S));
  const W = c.width, H = c.height;
  ctx.fillStyle = farbe; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < W * H / 40; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + hash(i, 7, 1) * 0.04})`;
    ctx.fillRect(hash(i, 1, 1) * W, hash(i, 2, 1) * H, 2, 2);
  }
  // Sockel
  ctx.fillStyle = "#8a8478"; ctx.fillRect(0, H - 22, W, 22);
  for (let x = 0; x < W; x += 28) { ctx.fillStyle = "#6a665e"; ctx.fillRect(x, H - 22, 2, 22); }
  // Fachwerk
  ctx.fillStyle = balken;
  const b = 12;
  ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H * 0.48, W, b); ctx.fillRect(0, H - 22 - b, W, b);
  const pfosten = Math.max(2, Math.round(breite / 2.2));
  for (let i = 0; i <= pfosten; i++) ctx.fillRect(Math.min(W - b, (i / pfosten) * W - b / 2), 0, b, H - 22);
  ctx.lineWidth = b * 0.8; ctx.strokeStyle = balken;
  for (let i = 0; i < pfosten; i++) {
    if (i % 2) continue;
    const x0 = (i / pfosten) * W, x1 = ((i + 1) / pfosten) * W;
    ctx.beginPath(); ctx.moveTo(x0, H * 0.48 + b); ctx.lineTo(x1, H - 22 - b); ctx.stroke();
  }
  // Fenster
  const tuerX = tuer !== null ? tuer * S : null;
  if (fenster) {
    for (let i = 0; i < pfosten; i++) {
      const mx = ((i + 0.5) / pfosten) * W;
      if (tuerX !== null && Math.abs(mx - tuerX) < S * 1.3) continue;
      const fw = S * 0.8, fh = S * 0.75, fy = H * 0.15;
      ctx.fillStyle = art === "rathaus" ? "#2f4fa8" : "#3f7a34";
      ctx.fillRect(mx - fw / 2 - 18, fy, 16, fh); ctx.fillRect(mx + fw / 2 + 2, fy, 16, fh);
      ctx.fillStyle = "#5a3a22"; ctx.fillRect(mx - fw / 2 - 4, fy - 4, fw + 8, fh + 8);
      const g = ctx.createLinearGradient(0, fy, 0, fy + fh);
      g.addColorStop(0, "#9ad0ff"); g.addColorStop(1, "#2a4a7a");
      ctx.fillStyle = g; ctx.fillRect(mx - fw / 2, fy, fw, fh);
      ctx.fillStyle = "#5a3a22"; ctx.fillRect(mx - 3, fy, 6, fh); ctx.fillRect(mx - fw / 2, fy + fh / 2 - 3, fw, 6);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(mx - fw / 2 + 6, fy + 6, 10, 10);
    }
  }
  // Tür
  if (tuerX !== null) {
    const tw = S * 1.0, th = S * 1.7;
    ctx.fillStyle = "#4a4038"; ctx.fillRect(tuerX - tw / 2 - 8, H - th - 8, tw + 16, th + 8);
    ctx.fillStyle = art === "rathaus" ? "#7a3a2a" : art === "schmiede" ? "#3a302a" : "#5a7a32";
    ctx.beginPath();
    ctx.moveTo(tuerX - tw / 2, H); ctx.lineTo(tuerX - tw / 2, H - th + tw / 2);
    ctx.arc(tuerX, H - th + tw / 2, tw / 2, Math.PI, 0); ctx.lineTo(tuerX + tw / 2, H); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let x = -tw / 2 + 12; x < tw / 2; x += 14) ctx.fillRect(tuerX + x, H - th + 10, 2, th - 10);
    ctx.fillStyle = "#e8c040"; ctx.beginPath(); ctx.arc(tuerX + tw / 3, H - th / 2, 4, 0, Math.PI * 2); ctx.fill();
    if (art === "schmiede") {
      ctx.fillStyle = "#5a3a22"; ctx.fillRect(tuerX + tw, H - th - 4, 60, 40);
      ctx.fillStyle = "#e8dcc0"; ctx.fillRect(tuerX + tw + 4, H - th, 52, 32);
      ctx.fillStyle = "#3a3a44"; ctx.fillRect(tuerX + tw + 14, H - th + 10, 32, 8); ctx.fillRect(tuerX + tw + 24, H - th + 18, 12, 8);
    }
    if (art === "rathaus") {
      ctx.fillStyle = "#e0b448"; ctx.beginPath(); ctx.arc(tuerX, H - th - 40, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3a5ab0"; ctx.beginPath(); ctx.arc(tuerX, H - th - 40, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f8f0d0"; ctx.fillRect(tuerX - 3, H - th - 52, 6, 24); ctx.fillRect(tuerX - 10, H - th - 43, 20, 6);
    }
  }
  return c;
}

/** Dachziegel. */
export function dachTextur(farbe) {
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = farbe; ctx.fillRect(0, 0, 256, 256);
  const basis = new THREE.Color(farbe);
  for (let reihe = 0; reihe < 16; reihe++) {
    const y = reihe * 16, versatz = reihe % 2 ? 16 : 0;
    for (let x = -32; x < 256; x += 32) {
      const f = basis.clone().offsetHSL(0, 0, (hash(x, reihe, 3) - 0.5) * 0.08);
      ctx.fillStyle = `#${f.getHexString()}`;
      ctx.beginPath(); ctx.roundRect(x + versatz + 1, y + 1, 30, 15, [0, 0, 8, 8]); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x + versatz + 1, y + 13, 30, 3);
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x + versatz + 3, y + 2, 26, 2);
    }
  }
  return c;
}

export function holzTextur(farbe = "#8a5a32") {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = farbe; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(40,20,10,${0.08 + hash(i, 1, 2) * 0.12})`;
    ctx.lineWidth = 1 + hash(i, 2, 2) * 2;
    const x = hash(i, 3, 2) * 128;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 6, 40, x - 6, 80, x + 3, 128); ctx.stroke();
  }
  return c;
}

export function steinTextur(farbe = "#9a94a0") {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = "#5a5660"; ctx.fillRect(0, 0, 128, 128);
  const basis = new THREE.Color(farbe);
  for (let r = 0; r < 8; r++) {
    for (let x = -16; x < 128; x += 32) {
      const f = basis.clone().offsetHSL(0, 0, (hash(x, r, 5) - 0.5) * 0.12);
      ctx.fillStyle = `#${f.getHexString()}`;
      ctx.beginPath(); ctx.roundRect(x + (r % 2) * 16 + 1, r * 16 + 1, 30, 14, 4); ctx.fill();
    }
  }
  return c;
}

export function markiseTextur() {
  const [c, ctx] = canvas(128, 64);
  for (let x = 0; x < 128; x += 16) { ctx.fillStyle = (x / 16) % 2 ? "#f4f0e8" : "#d03a3a"; ctx.fillRect(x, 0, 16, 64); }
  return c;
}

export function aushangTextur() {
  const [c, ctx] = canvas(128, 96);
  ctx.fillStyle = "#4a2e1a"; ctx.fillRect(0, 0, 128, 96);
  const zettel = [[8, 8, 40, 52, "#f4f0e0"], [54, 8, 64, 34, "#f0e0a0"], [58, 48, 50, 40, "#e8f0f8"], [10, 64, 36, 26, "#f8e8e0"]];
  for (const [x, y, w, h, f] of zettel) {
    ctx.fillStyle = f; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#8a8070";
    for (let l = y + 8; l < y + h - 4; l += 6) ctx.fillRect(x + 4, l, w - 8 - (l % 3) * 4, 2);
    ctx.fillStyle = "#c03030"; ctx.beginPath(); ctx.arc(x + w / 2, y + 3, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  return c;
}

/** Senkrechter Farbverlauf (für Himmel und Porträthintergründe). */
export function verlaufTextur(oben, unten) {
  const [c, ctx] = canvas(4, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, oben); g.addColorStop(1, unten);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
  return c;
}

export function lichtTextur(farbe = "rgba(140,210,255,1)") {
  const [c, ctx] = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, farbe); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return c;
}
