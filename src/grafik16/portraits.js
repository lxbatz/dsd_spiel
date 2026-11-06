// Detaillierte 64×64-Porträts für Dialoge, Heldenpass und Kopfleiste.

import { Bild, rampe, mische, toene, tonAus, hash } from "./pinsel.js";
import { AUSSEHEN } from "./figuren.js";

const G = 64;
const R = (hex) => rampe(hex, -2, 1);
const R5 = (hex) => rampe(hex, -3, 1);

// Zusätzliche Angaben nur für Porträts
export const PORTRAITS = {
  held_neu: { hintergrund: "#5a6a8a", augen: "#4a7a3a", ausdruck: "neugierig" },
  held_kriegerin: { hintergrund: "#8a3a3a", augen: "#3a6a9a", ausdruck: "mutig" },
  held_magier: { hintergrund: "#2a3a7a", augen: "#6a3a9a", ausdruck: "ruhig" },
  held_waldlaeufer: { hintergrund: "#3a6a4a", augen: "#3a7a5a", ausdruck: "ruhig" },
  held_barde: { hintergrund: "#8a5a2a", augen: "#5a3a1a", ausdruck: "froh" },
  npc_aldric: { hintergrund: "#3a4a7a", augen: "#4a6a9a", ausdruck: "weise", alt: true },
  npc_wilma: { hintergrund: "#6a8a4a", augen: "#6a4a2a", ausdruck: "froh", ohrringe: true },
  npc_borin: { hintergrund: "#7a4a2a", augen: "#3a4a6a", ausdruck: "froh", russ: true },
  npc_lyra: { hintergrund: "#4a3a7a", augen: "#8a5ab0", ausdruck: "neugierig", brille: true },
  boss_torwaechter: { hintergrund: "#1e1a30" },
};

// ---------- Hilfen ----------

function form(b, innen, farbe) {
  return b.fuelle(0, 0, G - 1, G - 1, innen, farbe);
}

/** Schattierung für eine beliebige Form mit „Kugelnormale“ um (cx, cy). */
function kugelTon(r, cx, cy, rx, ry, x, y, { dither = 0.45, hell = 0 } = {}) {
  const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
  const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, nx * nx + ny * ny)));
  const d = -0.55 * nx - 0.6 * ny + 0.58 * nz;
  return tonAus(r, (d + 1) / 2 + hell * 0.5, x, y, dither);
}

/** Strähnen-Textur für Haare und Bärte. */
function straehne(r, x, y, cx, cy, rx, ry, { welle = 0.8, hell = 0 } = {}) {
  const basis = kugelTon([0, 1, 2, 3], cx, cy, rx, ry, x, y, { dither: 0, hell });
  const s = Math.sin(x * welle + y * 0.35 + Math.sin(y * 0.4) * 1.6);
  const t = Math.max(0, Math.min(r.length - 1, basis + (s > 0.55 ? 1 : s < -0.7 ? -1 : 0)));
  return r[t];
}

// ---------- Teile ----------

function hintergrund(b, p) {
  const r = R5(p.hintergrund);
  b.verlauf(0, 0, G, G, r, { dither: 0.9 });
  b.fuelle(0, 0, G - 1, G - 1, (x, y) => ((x - 30) / 30) ** 2 + ((y - 26) / 26) ** 2 <= 1,
    (x, y) => tonAus(r, 0.75 - Math.hypot(x - 30, y - 26) / 70, x, y, 0.9));
  // Fensterkreuz-Licht als dezentes Muster
  for (let i = 0; i < 6; i++) b.set(8 + i * 9 + (i % 2), 6 + (i % 3) * 3, r[r.length - 1]);
}

function koerper(b, d, p, f) {
  const k = R5(d.kleid);
  const a = R(d.akzent);
  form(b, (x, y) => ((x - 32) / 28) ** 2 + ((y - 70) / 22) ** 2 <= 1,
    (x, y) => kugelTon(k, 30, 58, 30, 18, x, y, { dither: 0.5 }));
  // Falten
  for (const [x0, y0, x1, y1] of [[18, 56, 14, 63], [46, 56, 50, 63], [26, 58, 24, 63], [40, 58, 41, 63]]) b.linie(x0, y0, x1, y1, k[1]);

  if (d.robe || f.kragen === "v") {
    // V-Ausschnitt mit Borte
    b.poly([[25, 48], [39, 48], [32, 60]], (x, y) => kugelTon(R(d.haut), 32, 50, 10, 10, x, y, { hell: -0.4 }));
    b.linie(25, 48, 32, 60, a[2]); b.linie(26, 48, 32, 59, a[3]);
    b.linie(39, 48, 32, 60, a[1]); b.linie(38, 48, 32, 59, a[2]);
  } else {
    // Rundkragen
    form(b, (x, y) => ((x - 32) / 9) ** 2 + ((y - 49) / 4) ** 2 <= 1 && y > 48, a[2]);
    b.linie(24, 50, 40, 50, a[1]);
  }
  if (d.schuerze) {
    const s = R(d.schuerze);
    b.rect(22, 52, 2, 12, s[2]); b.rect(40, 52, 2, 12, s[1]);
    if (d.robe) form(b, (x, y) => y > 58 && x > 21 && x < 43, (x, y) => kugelTon(s, 30, 62, 14, 8, x, y));
  }
}

function hals(b, d) {
  const h = R5(d.haut);
  b.fuelle(26, 40, 38, 52, (x) => x >= 26 && x <= 38, (x, y) => (y < 45 ? h[1] : kugelTon(h, 30, 46, 8, 8, x, y, { hell: -0.2 })));
}

function kopfInnen(x, y) {
  // Eiform: unten schmaler (Kinn)
  const cy = 31, ry = 16;
  const t = (y - cy) / ry;
  const rx = 13.2 * (t > 0 ? 1 - 0.28 * t * t : 1);
  return ((x - 32) / rx) ** 2 + t * t <= 1;
}

function kopf(b, d, p) {
  const h = R5(d.haut);
  // Ohren
  for (const ox of [18.6, 45.4]) {
    form(b, (x, y) => ((x - ox) / 2.6) ** 2 + ((y - 32) / 4.2) ** 2 <= 1, (x, y) => kugelTon(h, ox, 31, 3, 5, x, y));
    b.set(Math.round(ox), 32, h[1]); b.set(Math.round(ox), 33, h[1]);
  }
  form(b, kopfInnen, (x, y) => kugelTon(h, 30, 28, 15, 18, x, y, { dither: 0.35, hell: 0.3 }));
  // Wangen
  const rot = (c) => mische(c, "#e2506a", p.ausdruck === "froh" ? 0.38 : 0.22);
  for (const cx of [24, 40]) form(b, (x, y) => ((x - cx) / 2.6) ** 2 + ((y - 38) / 1.4) ** 2 <= 1, (x, y) => rot(b.get(x, y) ?? h[2]));
  // Nase
  b.linie(33, 31, 34, 36, h[1]); b.set(32, 33, h[4]); b.set(32, 34, h[4]);
  b.set(30, 37, h[0]); b.set(31, 37, h[1]); b.set(34, 37, h[0]); b.set(33, 37, h[1]); b.set(32, 38, h[1]);
  // Mund
  const lippe = mische(h[1], "#b03a4a", 0.35);
  const froh = p.ausdruck === "froh" || p.ausdruck === "neugierig";
  b.linie(29, 41, 35, 41, lippe);
  if (froh) { b.set(28, 40, lippe); b.set(36, 40, lippe); b.linie(30, 42, 34, 42, h[1]); }
  else b.linie(30, 42, 34, 42, h[2]);
  if (p.ausdruck === "mutig") { b.set(36, 40, lippe); }
  // Augen
  augen(b, d, p);
  // Falten bei älteren Figuren
  if (p.alt) {
    for (const [x0, y0, x1, y1] of [[25, 20, 30, 19], [34, 19, 39, 20], [27, 22, 37, 22], [19, 33, 21, 31], [43, 31, 45, 33], [26, 39, 27, 42], [38, 42, 37, 39]]) b.linie(x0, y0, x1, y1, h[1]);
  }
  if (p.russ) for (const [x, y] of [[23, 34], [24, 35], [41, 27], [42, 28], [39, 36]]) b.set(x, y, mische(h[1], "#2a2020", 0.5));
}

function augen(b, d, p) {
  const iris = R(p.augen);
  const lid = mische(R(d.haare)[0], "#1a1020", 0.6);
  const weiss = "#f4f0ee";
  const halb = p.ausdruck === "weise";
  for (const [cx, dir] of [[26, 1], [38, -1]]) {
    // Augapfel
    form(b, (x, y) => ((x - cx) / 3.4) ** 2 + ((y - 31) / (halb ? 1.5 : 2.1)) ** 2 <= 1, weiss);
    // Iris + Pupille (Blick leicht zur Mitte)
    const ix = cx + (dir > 0 ? 0 : -1);
    b.rect(ix, halb ? 30 : 29, 2, halb ? 2 : 4, iris[1]);
    b.rect(ix, halb ? 31 : 31, 2, 1, iris[2]);
    b.set(ix + (dir > 0 ? 1 : 0), 30, "#140c18");
    b.set(ix + (dir > 0 ? 1 : 0), 31, "#140c18");
    b.set(ix, 29, "#ffffff");
    // Oberlid und Wimpern
    b.linie(cx - 3, halb ? 30 : 29, cx + 3, halb ? 30 : 29, lid);
    b.set(cx + 4 * dir, 29, lid); b.set(cx - 4 * dir, 30, lid);
    b.linie(cx - 2, 33, cx + 2, 33, R5(d.haut)[1]);
    // Augenbrauen
    const brauen = d.bartfarbe && d.frisur === "glatze" ? R(d.bartfarbe) : R(d.frisur === "glatze" ? d.haare : d.haare);
    const dick = p.alt || d.bart ? 2 : 1;
    const y0 = p.ausdruck === "mutig" ? (dir > 0 ? 25 : 26) : 25;
    b.rect(cx - 4, y0 + (dir > 0 ? 1 : 0), 8, dick, brauen[1]);
    b.rect(cx - 3, y0 + (dir > 0 ? 0 : 1), 6, 1, brauen[p.alt ? 3 : 2]);
  }
  if (p.brille) {
    const gold = "#d8b040";
    for (const cx of [26, 38]) {
      form(b, (x, y) => { const v = ((x - cx) / 5) ** 2 + ((y - 31) / 4.2) ** 2; return v <= 1 && v >= 0.62; }, gold);
    }
    b.linie(31, 30, 33, 30, gold);
  }
}

function haare(b, d, p, teil) {
  const r = R5(d.haare);
  const f = d.frisur;
  const lang = f === "lang" || d.langhaar;

  if (teil === "hinten") {
    if (lang) form(b, (x, y) => ((x - 32) / 18.5) ** 2 + ((y - 38) / 24) ** 2 <= 1 && y > 18,
      (x, y) => straehne(r, x, y, 30, 34, 20, 26, { welle: 1.1, hell: -0.25 }));
    if (f === "dutt") b.kugel(32, 12, 8, 6, R(d.haare), { dither: 0.5 });
    if (f === "zopf") {
      for (let i = 0; i < 6; i++) b.kugel(47 + i * 0.6, 38 + i * 4.2, 3.6 - i * 0.3, 3, R(d.haare), { dither: 0.4 });
    }
    return;
  }

  if (f === "glatze") {
    const h = R5(d.haut);
    form(b, (x, y) => ((x - 26) / 5) ** 2 + ((y - 19) / 3) ** 2 <= 1 && kopfInnen(x, y), h[4]);
    for (const [x0, x1] of [[17, 21], [43, 47]]) {
      form(b, (x, y) => x >= x0 && x <= x1 && y >= 24 && y <= 34 && (kopfInnen(x, y) || x < 20 || x > 44),
        (x, y) => straehne(R(d.haare), x, y, 32, 30, 14, 10));
    }
    return;
  }

  if (f === "kapuze") {
    const k = R5(d.kapuze);
    // Strähnen unter der Kapuze
    form(b, (x, y) => y >= 17 && y <= 24 && kopfInnen(x, y) && (Math.sin(x * 0.9) > -0.2 || y < 21), (x, y) => straehne(r, x, y, 30, 18, 14, 8));
    form(b, (x, y) => {
      const aussen = ((x - 32) / 21) ** 2 + ((y - 33) / 25) ** 2 <= 1;
      const gesicht = ((x - 32) / 13.6) ** 2 + ((y - 34) / 17) ** 2 <= 1 && y > 17;
      return aussen && !gesicht && y < 60;
    }, (x, y) => kugelTon(k, 28, 24, 24, 28, x, y, { dither: 0.5 }));
    b.linie(19, 26, 21, 44, k[1]); b.linie(45, 26, 43, 44, k[0]);
    return;
  }

  // Grundfrisur
  form(b, (x, y) => {
    const kappe = ((x - 32) / 15) ** 2 + ((y - 27) / 13.5) ** 2 <= 1 && y < 27;
    const pony = y >= 22 && y < 26 + ((x * 7) % 5 > 2 ? 2 : 0) && kopfInnen(x, y) && f !== "dutt";
    const seiten = (x < 20.5 || x > 43.5) && y < (lang ? 52 : 34) && y > 20 && ((x - 32) / 15.5) ** 2 < 1;
    return kappe || pony || seiten;
  }, (x, y) => straehne(r, x, y, 28, 20, 18, 16, { welle: f === "lockig" ? 1.8 : 0.9 }));

  if (f === "dutt") {
    b.linie(32, 14, 32, 21, r[0]);            // Scheitel
    const band = R(d.akzent);
    b.rect(19, 18, 26, 2, band[2]); b.rect(19, 20, 26, 1, band[1]);
  }
  if (f === "lockig") {
    for (let i = 0; i < 9; i++) {
      const x = 17 + i * 3.8, y = 16 + Math.abs(4 - i) * 1.3;
      b.kugel(x, y, 2.4, 2.4, R(d.haare), { dither: 0.3 });
    }
  }
  if (f === "zopf") {
    b.poly([[22, 16], [40, 14], [44, 24], [36, 22], [30, 26], [26, 22]], (x, y) => straehne(r, x, y, 30, 16, 14, 10, { welle: 1.4, hell: 0.2 }));
  }
  if (f === "spitzhut") hut(b, d);
}

function hut(b, d) {
  const h = R5(d.hut);
  const band = R(d.hutband);
  b.poly([[17, 21], [47, 21], [42, 8], [50, 0], [38, 4], [30, 0]], (x, y) => kugelTon(h, 26, 6, 22, 22, x, y, { dither: 0.5 }));
  form(b, (x, y) => ((x - 32) / 25) ** 2 + ((y - 21) / 4.6) ** 2 <= 1,
    (x, y) => (y < 21 ? h[3] : kugelTon(h, 26, 18, 30, 8, x, y, { hell: -0.4 })));
  b.rect(19, 16, 27, 3, band[2]); b.rect(19, 18, 27, 1, band[1]);
  for (const [x, y] of [[28, 9], [36, 6], [41, 13]]) { b.set(x, y, "#fff6c0"); b.set(x - 1, y, "#e6c45a"); b.set(x + 1, y, "#e6c45a"); b.set(x, y - 1, "#e6c45a"); b.set(x, y + 1, "#e6c45a"); }
  // Schatten der Krempe auf der Stirn
  for (let x = 20; x <= 44; x++) for (let y = 25; y <= 26; y++) { const c = b.get(x, y); if (c && kopfInnen(x, y)) b.set(x, y, toene(c, -1)); }
}

function bart(b, d) {
  if (!d.bart) return;
  const r = R5(d.bartfarbe);
  if (d.bart === "lang") {
    form(b, (x, y) => ((x - 32) / 15) ** 2 + ((y - 50) / 19) ** 2 <= 1 && y >= 35 - (Math.abs(x - 32) > 9 ? 4 : 0) && !(y >= 40 && y <= 42 && x >= 30 && x <= 34),
      (x, y) => straehne(r, x, y, 30, 44, 16, 20, { welle: 1.3 }));
    // Schnurrbart
    for (const [cx, dir] of [[27, -1], [37, 1]]) {
      form(b, (x, y) => ((x - cx) / 6) ** 2 + ((y - 39.5 - (Math.abs(x - 32) / 6)) / 2.2) ** 2 <= 1, (x, y) => straehne(r, x, y, 30, 36, 12, 6, { hell: 0.3 }));
    }
    b.linie(30, 41, 34, 41, mische(r[1], "#7a3040", 0.3));
  } else {
    form(b, (x, y) => ((x - 32) / 14) ** 2 + ((y - 40) / 11) ** 2 <= 1 && y >= 33 && !(y >= 40 && y <= 42 && x >= 29 && x <= 35) && kopfInnen(x, y - 3),
      (x, y) => straehne(r, x, y, 30, 36, 15, 12, { welle: 1.5 }));
    // Zwei Zöpfe
    for (const cx of [28, 36]) {
      for (let i = 0; i < 4; i++) b.kugel(cx, 50 + i * 3.4, 2.4, 1.9, R(d.bartfarbe), { dither: 0.2 });
      b.rect(cx - 2, 61, 4, 1, "#c8c8d0");
    }
    for (const [cx] of [[27], [37]]) form(b, (x, y) => ((x - cx) / 5.4) ** 2 + ((y - 39) / 2) ** 2 <= 1, (x, y) => straehne(r, x, y, 30, 36, 12, 6, { hell: 0.3 }));
  }
}

function ausruestung(b, d, p, teil) {
  const holz = R("#7a5230");
  const metall = R5("#b8bcc8");
  const e = d.extra;
  if (teil === "hinten") {
    if (e === "schwert") { b.rect(48, 22, 3, 22, holz[1]); b.rect(43, 42, 13, 3, R("#d0a030")[2]); b.rect(43, 44, 13, 1, R("#d0a030")[1]); b.kugel(49.5, 21, 2.5, 2.5, R("#d0a030")); }
    if (e === "koecher") {
      b.zylinder(46, 34, 6, 22, holz);
      for (const [x, c] of [[46, "#e8e8e8"], [48, "#c04040"], [50, "#e8e8e8"]]) { b.rect(x, 28, 2, 6, c); b.set(x, 27, toene(c, -1)); }
    }
    if (e === "laute") { b.rect(10, 18, 4, 40, holz[2]); b.rect(10, 18, 1, 40, holz[3]); for (let i = 0; i < 3; i++) b.rect(8, 20 + i * 4, 8, 1, holz[0]); }
    if (e === "stab") { b.rect(53, 14, 3, 50, holz[2]); b.rect(53, 14, 1, 50, holz[3]); b.kugel(54.5, 10, 5, 5, R5("#40c8f0"), { dither: 0.3 }); b.set(53, 8, "#ffffff"); b.set(52, 9, "#e0fbff"); }
    if (e === "wanderstab") { b.rect(8, 6, 4, 58, holz[2]); b.rect(8, 6, 1, 58, holz[3]); b.kugel(10, 6, 4, 4, holz); }
    return;
  }
  if (e === "schwert") {
    // Schulterpanzer mit Kante und Nieten
    for (const [cx, hell] of [[11, 0.25], [53, -0.25]]) {
      b.kugel(cx, 58, 8, 5, metall, { hell, dither: 0.3 });
      b.linie(cx - 7, 61, cx + 7, 61, metall[0]);
      b.linie(cx - 6, 60, cx + 6, 60, metall[3]);
      b.set(cx - 3, 57, "#ffffff"); b.set(cx + 3, 57, metall[1]);
    }
  }
  if (e === "koecher" || e === "laute") b.linie(e === "laute" ? 16 : 20, 48, e === "laute" ? 44 : 42, 63, R(d.akzent)[0]);
  if (e === "buch") { b.rect(42, 54, 16, 10, "#8a2a2a"); b.rect(43, 54, 14, 2, "#f0e0b0"); b.rect(42, 54, 1, 10, "#e6c45a"); }
  if (p.ohrringe) { b.kugel(18.5, 38, 1.4, 1.6, R("#e0b040")); b.kugel(45.5, 38, 1.4, 1.6, R("#e0b040")); }
}

function torwaechter(b, p) {
  hintergrund(b, p);
  const f = new Bild(G, G);
  const stein = R5("#6e6a88");
  const dunkel = R5("#4a4660");
  form(f, (x, y) => ((x - 32) / 30) ** 2 + ((y - 70) / 24) ** 2 <= 1, (x, y) => kugelTon(stein, 28, 56, 32, 20, x, y));
  form(f, (x, y) => ((x - 32) / 21) ** 2 + ((y - 30) / 25) ** 2 <= 1 && y < 56, (x, y) => kugelTon(dunkel, 28, 22, 22, 26, x, y, { dither: 0.6 }));
  form(f, (x, y) => ((x - 32) / 12) ** 2 + ((y - 34) / 13) ** 2 <= 1, (x, y) => (y < 26 ? "#08060e" : "#120f1c"));
  const glut = "#80ecff";
  for (const cx of [26, 38]) {
    f.rect(cx - 2, 31, 5, 3, glut); f.rect(cx - 1, 31, 3, 1, "#ffffff");
    f.set(cx - 3, 32, "#2a7a8a"); f.set(cx + 3, 32, "#2a7a8a");
  }
  for (const [x, y] of [[31, 52], [32, 52], [32, 53], [31, 56], [32, 58], [31, 59], [24, 55], [40, 55]]) f.set(x, y, "#58d8f0");
  for (let i = 0; i < 18; i++) { const x = 6 + Math.floor(hash(i, 3) * 52), y = 46 + Math.floor(hash(i, 7) * 18); if (f.get(x, y)) f.set(x, y, stein[0]); }
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
}

/** Malt das Porträt einer Figur (64×64). */
export function portraitBild(schluessel) {
  const p = PORTRAITS[schluessel];
  const b = new Bild(G, G);
  if (schluessel === "boss_torwaechter") { torwaechter(b, p); return b; }
  const d = AUSSEHEN[schluessel];
  hintergrund(b, p);
  const f = new Bild(G, G);
  ausruestung(f, d, p, "hinten");
  haare(f, d, p, "hinten");
  koerper(f, d, p, {});
  hals(f, d);
  kopf(f, d, p);
  haare(f, d, p, "vorne");
  bart(f, d);
  ausruestung(f, d, p, "vorne");
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
  return b;
}
