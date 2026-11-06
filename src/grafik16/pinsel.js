// Pixel-Pinsel für die 16-Bit-Grafik.
// Ein Bild ist ein Raster aus Farben (Hex-Strings) oder null (durchsichtig).
// Alle Formen werden pixelgenau ohne Kantenglättung gezeichnet.

// ---------- Farben ----------

export function hexZuRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbZuHex([r, g, b]) {
  const k = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${k(r)}${k(g)}${k(b)}`;
}

function rgbZuHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslZuRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

function drehe(h, ziel, menge) {
  let d = ((ziel - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), menge);
}

/** Verändert Helligkeit; Schatten wandern Richtung Blau/Violett, Lichter Richtung Gelb. */
export function toene(hex, stufe) {
  const [h, s, l] = rgbZuHsl(hexZuRgb(hex));
  if (stufe < 0) {
    // Sehr helle/ungesättigte Farben (Weiß, Grau) nur wenig verschieben
    const menge = s < 0.25 ? 4 : 7;
    const nh = drehe(h, 250, menge * -stufe);
    return rgbZuHex(hslZuRgb([nh, Math.min(1, s * (s < 0.25 ? 0.8 : 1)), Math.max(0.03, l * (1 - 0.2 * -stufe))]));
  }
  const nh = drehe(h, 55, 8 * stufe);
  return rgbZuHex(hslZuRgb([nh, Math.max(0, s - 0.04 * stufe), Math.min(0.97, l + (1 - l) * 0.28 * stufe)]));
}

/** Farbrampe von dunkel nach hell um eine Grundfarbe: [-2, -1, 0, +1] (Standard) */
export function rampe(hex, von = -2, bis = 1) {
  const r = [];
  for (let i = von; i <= bis; i++) r.push(i === 0 ? hex : toene(hex, i));
  return r;
}

export function mische(a, b, t) {
  const x = hexZuRgb(a), y = hexZuRgb(b);
  return rgbZuHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

// ---------- Zufall und Muster ----------

export function zufall(saat) {
  let s = saat >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function hash(x, y, saat = 0) {
  let h = (x * 374761393 + y * 668265263 + saat * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function bayer(x, y) {
  return BAYER[(y & 3) * 4 + (x & 3)] / 16;
}

// ---------- Bild ----------

const LICHT = (() => { const v = [-0.55, -0.65, 0.52]; const l = Math.hypot(...v); return v.map((x) => x / l); })();

export class Bild {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null);
  }

  set(x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }

  loesche(x, y) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = null;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  /** Rechteck mit abgerundeten Ecken (r = 1 oder 2 Pixel). */
  rund(x, y, w, h, c, r = 1) {
    this.rect(x, y, w, h, c);
    const weg = r === 1 ? [[0, 0]] : [[0, 0], [1, 0], [0, 1]];
    for (const [i, j] of weg) {
      this.loesche(x + i, y + j); this.loesche(x + w - 1 - i, y + j);
      this.loesche(x + i, y + h - 1 - j); this.loesche(x + w - 1 - i, y + h - 1 - j);
    }
    return this;
  }

  linie(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }

  /** Füllt alle Pixel, für die innen(x, y) wahr ist, mit farbe(x, y). */
  fuelle(x0, y0, x1, y1, innen, farbe) {
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        if (innen(x + 0.5, y + 0.5)) this.set(x, y, typeof farbe === "function" ? farbe(x, y) : farbe);
      }
    }
    return this;
  }

  ellipse(cx, cy, rx, ry, c) {
    return this.fuelle(cx - rx, cy - ry, cx + rx, cy + ry,
      (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, c);
  }

  /**
   * Ellipse, schattiert wie eine Kugel. r: Farbrampe (dunkel → hell).
   * opt.dither: Stärke des Ditherings an den Übergängen (0 = aus)
   * opt.hell: verschiebt die Gesamthelligkeit (-1 … 1)
   */
  kugel(cx, cy, rx, ry, r, opt = {}) {
    const { dither = 0.5, hell = 0, licht = LICHT } = opt;
    return this.fuelle(cx - rx, cy - ry, cx + rx, cy + ry,
      (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
      (x, y) => {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const d = nx * licht[0] + ny * licht[1] + nz * licht[2];
        return tonAus(r, (d + 1) / 2 + hell * 0.5, x, y, dither);
      });
  }

  /** Senkrechter Zylinder (z. B. Stamm, Arm, Körper): links hell, rechts dunkel. */
  zylinder(x, y, w, h, r, opt = {}) {
    const { dither = 0.4, hell = 0 } = opt;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const nx = w === 1 ? 0 : (i + 0.5) / w * 2 - 1;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
        const d = nx * LICHT[0] + nz * (LICHT[2] + 0.35);
        this.set(x + i, y + j, tonAus(r, (d + 0.6) / 1.9 + hell * 0.5, x + i, y + j, dither));
      }
    }
    return this;
  }

  /** Polygon füllen (Punkte als [[x, y], …]). farbe kann eine Funktion (x, y) sein. */
  poly(punkte, farbe) {
    const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
    return this.fuelle(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys),
      (x, y) => imPolygon(x, y, punkte), farbe);
  }

  /** Senkrechter Verlauf über eine Rampe (oben hell → unten dunkel, falls umkehren). */
  verlauf(x, y, w, h, r, { dither = 0.6, umkehren = false } = {}) {
    for (let j = 0; j < h; j++) {
      const t = h === 1 ? 0.5 : j / (h - 1);
      for (let i = 0; i < w; i++) this.set(x + i, y + j, tonAus(r, umkehren ? t : 1 - t, x + i, y + j, dither));
    }
    return this;
  }

  /** Pixelmuster aus Textzeilen; palette: Zeichen → Farbe ('.' und ' ' = nichts). */
  muster(x, y, zeilen, palette) {
    zeilen.forEach((z, j) => [...z].forEach((ch, i) => { if (palette[ch]) this.set(x + i, y + j, palette[ch]); }));
    return this;
  }

  /** Legt ein anderes Bild darüber. */
  ueber(bild, ox = 0, oy = 0, spiegeln = false) {
    for (let y = 0; y < bild.h; y++) {
      for (let x = 0; x < bild.w; x++) {
        const c = bild.get(spiegeln ? bild.w - 1 - x : x, y);
        if (c) this.set(ox + x, oy + y, c);
      }
    }
    return this;
  }

  /**
   * Umriss außen herum. farbe: feste Farbe oder null = abgedunkelte Nachbarfarbe (farbiger Umriss).
   * diagonal: auch Ecken umranden.
   */
  umriss(farbe = null, { staerke = 0.42, diagonal = false } = {}) {
    const neu = [];
    const nachbarn = diagonal
      ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
      : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        for (const [dx, dy] of nachbarn) {
          const n = this.get(x + dx, y + dy);
          if (n) { neu.push([x, y, farbe ?? dunkel(n, staerke)]); break; }
        }
      }
    }
    for (const [x, y, c] of neu) this.set(x, y, c);
    return this;
  }

  /** Spiegelt das Bild waagerecht (neues Bild). */
  gespiegelt() {
    const b = new Bild(this.w, this.h);
    b.ueber(this, 0, 0, true);
    return b;
  }

  /** Verschiebt den Inhalt eines Bereichs (für Animationen). */
  verschoben(dx, dy, bereich = null) {
    const b = new Bild(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.get(x, y);
        if (!c) continue;
        const drin = !bereich || bereich(x, y);
        b.set(drin ? x + dx : x, drin ? y + dy : y, c);
      }
    }
    return b;
  }

  /** Zeichnet das Bild in einen Canvas-Kontext. */
  malen(ctx, ox = 0, oy = 0) {
    const daten = ctx.createImageData(this.w, this.h);
    for (let i = 0; i < this.px.length; i++) {
      const c = this.px[i];
      if (!c) continue;
      const [r, g, b] = hexZuRgb(c);
      daten.data.set([r, g, b, 255], i * 4);
    }
    const tmp = document.createElement("canvas");
    tmp.width = this.w; tmp.height = this.h;
    tmp.getContext("2d").putImageData(daten, 0, 0);
    ctx.drawImage(tmp, ox, oy);
  }

  alsCanvas(skala = 1) {
    const c = document.createElement("canvas");
    c.width = this.w * skala; c.height = this.h * skala;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (skala === 1) this.malen(ctx);
    else {
      const tmp = this.alsCanvas(1);
      ctx.drawImage(tmp, 0, 0, c.width, c.height);
    }
    return c;
  }
}

export function dunkel(hex, staerke = 0.42) {
  const [h, s, l] = rgbZuHsl(hexZuRgb(hex));
  return rgbZuHex(hslZuRgb([drehe(h, 260, 25), Math.min(1, s * 0.9 + 0.1), l * staerke]));
}

/** Wählt einen Ton aus der Rampe; t in 0..1, mit geordnetem Dithering. */
export function tonAus(r, t, x, y, dither = 0.5) {
  const n = r.length;
  const v = Math.max(0, Math.min(0.9999, t)) * n + (bayer(x, y) - 0.5) * dither;
  return r[Math.max(0, Math.min(n - 1, Math.floor(v)))];
}

function imPolygon(x, y, p) {
  let drin = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) drin = !drin;
  }
  return drin;
}
