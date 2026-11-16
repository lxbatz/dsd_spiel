// Pixel-Avatare für die Credits (64×64, im Stil der Porträts im Spiel).

import { Bild, rampe, mische, hash } from "./pinsel.js";
import { portraitBild } from "./portraits.js";

const G = 64;

/** Johannes Richter: Glatze, Schnurrbart mit Dreitagebart, freundliches Lächeln, schwarze Strickjacke, Lochblechwand der Schule. */
export function johannesBild() {
  return portraitBild(null, {
    aussehen: {
      haut: "#eebf9e", haare: "#c49a80", frisur: "glatze", bart: "schnurrbart", bartfarbe: "#93745c",
      kleid: "#26262e", akzent: "#121216", hose: "#26262e", stiefel: "#1a1a1a",
    },
    portrait: { hintergrund: "#a4a6ac", augen: "#6a7480", ausdruck: "froh", zaehne: true, szene: "lochblech" },
  });
}

/** Alexander Batzke: kurze, verwuschelte braune Haare, leichter Bartschatten, Lächeln, rot-schwarzes Karohemd über schwarzem T-Shirt, Holzwand. */
export function alexanderBild() {
  return portraitBild(null, {
    aussehen: {
      haut: "#efc4a2", haare: "#6a4628", frisur: "wuschel", bart: "stoppeln", bartfarbe: "#9a7254",
      kleid: "#b8282a", akzent: "#1a1416", hose: "#2a2a34", stiefel: "#1a1a1a",
      karo: "#c42a2c", karoDunkel: "#1c1416", hemd: "#1c1c22", aufdruck: "#e8e8ec",
    },
    portrait: { hintergrund: "#d4a46a", augen: "#5a7a98", ausdruck: "froh", zaehne: true, szene: "holz" },
  });
}

/** Das Claude-Logo als Pixelbild: ein terrakottafarbener Strahlenstern auf hellem Grund. */
export function claudeBild() {
  const b = new Bild(G, G);
  const grund = rampe("#f0eee6", -3, 1);
  // Ruhiger, heller Grund mit leichter Vignette am Rand
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const d = Math.hypot((x - 32) / 32, (y - 32) / 32);
    b.set(x, y, d > 0.95 && hash(x, y, 3) < (d - 0.95) * 4 ? grund[2] : grund[3]);
  }
  const haupt = "#d97757", schatten = mische("#d97757", "#7a2a14", 0.28), licht = mische("#d97757", "#ffffff", 0.18);
  const cx = 32, cy = 32;
  // Zwölf gleichmäßig breite Strahlen mit runden Enden, Länge und Winkel leicht unregelmäßig (wie im Logo)
  const strahlen = Array.from({ length: 12 }, (_, i) => ({
    w: (i / 12) * Math.PI * 2 + (hash(i, 1, 7) - 0.5) * 0.16,
    l: 21 + hash(i, 2, 7) * 5,
  }));
  const BREITE = 2.05;
  const abstand = (x, y, s) => {
    const dx = Math.cos(s.w), dy = Math.sin(s.w);
    const px = x - cx, py = y - cy;
    const t = Math.max(0, Math.min(s.l, px * dx + py * dy));
    return Math.hypot(px - dx * t, py - dy * t) - BREITE;
  };
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const xm = x + 0.5, ym = y + 0.5;
    if (Math.hypot(xm - cx, ym - cy) > 3.6 && !strahlen.some((s) => abstand(xm, ym, s) < 0)) continue;
    b.set(x, y, haupt);
  }
  // Flach wie das Logo, nur eine Pixelkante Licht oben links und Schatten unten rechts
  const innen = (x, y) => b.get(x, y) === haupt || b.get(x, y) === licht || b.get(x, y) === schatten;
  const kopie = [];
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    if (b.get(x, y) !== haupt) continue;
    if (!innen(x + 1, y + 1)) kopie.push([x, y, schatten]);
    else if (!innen(x - 1, y - 1)) kopie.push([x, y, licht]);
  }
  for (const [x, y, c] of kopie) b.set(x, y, c);
  return b;
}
