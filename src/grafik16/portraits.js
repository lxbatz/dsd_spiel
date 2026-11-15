// Detaillierte 64×64-Porträts für Dialoge, Heldenpass und Kopfleiste.

import { Bild, rampe, mische, toene, tonAus, hash } from "./pinsel.js";
import { AUSSEHEN } from "./figuren.js";

const G = 64;
const R = (hex) => rampe(hex, -2, 1);
const R5 = (hex) => rampe(hex, -3, 1);

// Zusätzliche Angaben nur für Porträts
export const PORTRAITS = {
  held_neu: { hintergrund: "#5a6a8a", augen: "#4a7a3a", ausdruck: "neugierig", szene: "land", schal: "#b85a3a" },
  held_kriegerin: { hintergrund: "#8a3a3a", augen: "#3a6a9a", ausdruck: "mutig", szene: "land", narbe: true },
  held_magier: { hintergrund: "#2a3a7a", augen: "#6a3a9a", ausdruck: "ruhig", szene: "nacht" },
  held_waldlaeufer: { hintergrund: "#3a6a4a", augen: "#3a7a5a", ausdruck: "ruhig", szene: "wald", spange: true },
  held_barde: { hintergrund: "#8a5a2a", augen: "#5a3a1a", ausdruck: "froh", szene: "land", feder: true },
  npc_aldric: { hintergrund: "#3a4a7a", augen: "#4a6a9a", ausdruck: "weise", alt: true, szene: "dorf", amulett: true },
  npc_wilma: { hintergrund: "#6a8a4a", augen: "#6a4a2a", ausdruck: "froh", ohrringe: true, szene: "markt", blume: true },
  npc_borin: { hintergrund: "#7a4a2a", augen: "#3a4a6a", ausdruck: "froh", russ: true, szene: "schmiede", licht: { farbe: "#ffb060", seite: 1 } },
  npc_finn: { hintergrund: "#6a5a3a", augen: "#3a8a4a", ausdruck: "neugierig", szene: "schmiede", schal: "#3a5a9a", licht: { farbe: "#ffb060", seite: 1 } },
  npc_orpheon: { hintergrund: "#4a7ab8", augen: "#3a6a9a", ausdruck: "weise", alt: true, szene: "meer", amulett: true, licht: { farbe: "#fff0c0", seite: -1 } },
  npc_nerea: { hintergrund: "#3a8ac8", augen: "#5a3a1a", ausdruck: "froh", ohrringe: true, szene: "meer", licht: { farbe: "#ffe0a0", seite: 1 } },
  npc_daphne: { hintergrund: "#c8803a", augen: "#4a2a14", ausdruck: "froh", ohrringe: true, szene: "markt", blume: true, licht: { farbe: "#ffe0a0", seite: 1 } },
  npc_ilias: { hintergrund: "#3a7aa8", augen: "#3a2a1a", ausdruck: "froh", szene: "meer", licht: { farbe: "#fff0c0", seite: -1 } },
  npc_kleon: { hintergrund: "#9a6a44", augen: "#4a5a6a", ausdruck: "weise", alt: true, szene: "markt", licht: { farbe: "#ffd8a0", seite: 1 } },
  npc_ione: { hintergrund: "#7a4a8a", augen: "#3a2a4a", ausdruck: "ruhig", szene: "markt", amulett: true, licht: { farbe: "#ffe8c0", seite: -1 } },
  npc_talos: { hintergrund: "#2a4a7a", augen: "#4a6a8a", ausdruck: "weise", alt: true, szene: "meer", schal: "#c8503a", licht: { farbe: "#ffc060", seite: 1 } },
  npc_kassia: { hintergrund: "#5a7a9a", augen: "#3a2a1a", ausdruck: "ruhig", szene: "meer", ohrringe: true, licht: { farbe: "#fff0c0", seite: -1 } },
  npc_timon: { hintergrund: "#4a8ac8", augen: "#3a6a9a", ausdruck: "neugierig", szene: "meer", licht: { farbe: "#ffe8b0", seite: 1 } },
  npc_daria: { hintergrund: "#9a5a3a", augen: "#3a7a5a", ausdruck: "froh", szene: "meer", spange: true, licht: { farbe: "#ffd8a0", seite: 1 } },
  npc_lirien: { hintergrund: "#1e3a32", augen: "#4aa88a", ausdruck: "weise", szene: "wald", amulett: true, licht: { farbe: "#a0ffd0", seite: -1 } },
  npc_fennick: { hintergrund: "#3a4a2a", augen: "#6a4a2a", ausdruck: "froh", szene: "wald", licht: { farbe: "#ffe0a0", seite: 1 } },
  npc_mara: { hintergrund: "#3a2a4a", augen: "#3a2a1a", ausdruck: "froh", szene: "bibliothek", brille: true, licht: { farbe: "#ffd890", seite: -1 } },
  npc_vesna: { hintergrund: "#1a1a3a", augen: "#e8b840", ausdruck: "ruhig", szene: "nacht", licht: { farbe: "#ffc860", seite: 1 } },
  npc_corvin: { hintergrund: "#3a2a1a", augen: "#4a6a7a", ausdruck: "weise", alt: true, brille: true, szene: "bibliothek", licht: { farbe: "#ffd890", seite: 1 } },
  npc_ilka: { hintergrund: "#2a4a3a", augen: "#3a7a5a", ausdruck: "neugierig", szene: "wald", licht: { farbe: "#ffe0a0", seite: -1 } },
  npc_lyra: { hintergrund: "#4a3a7a", augen: "#8a5ab0", ausdruck: "neugierig", brille: true, szene: "bibliothek", feder: true, licht: { farbe: "#ffd890", seite: -1 } },
  boss_torwaechter: { hintergrund: "#1e1a30", szene: "runen", waechter: {} },
  // Wächter der Inseln der Stimmen (gleiche Gestalt, andere Farben)
  boss_kopist: { hintergrund: "#14222c", szene: "runen", waechter: { stein: "#5a6c7e", dunkel: "#34424e", glut: "#d0fbff", rune: "#58d8f0" } },
  boss_vergessen: { hintergrund: "#2a2420", szene: "runen", waechter: { stein: "#7c7670", dunkel: "#4a4642", glut: "#ffd890", rune: "#ffb347" } },
  boss_zauderer: { hintergrund: "#16261a", szene: "runen", waechter: { stein: "#5e7660", dunkel: "#34443a", glut: "#d0ffd6", rune: "#7aff9a" } },
  boss_drachenrichter: { hintergrund: "#1c1630", drache: true },
  boss_bibliothekar: { hintergrund: "#0e1418", werwolf: true },
  npc_ambros: { hintergrund: "#2a1e34", augen: "#5a7a9a", ausdruck: "weise", alt: true, brille: true, szene: "bibliothek", amulett: true, licht: { farbe: "#ffe0a0", seite: -1 } },
  npc_runa: { hintergrund: "#5a7a9a", augen: "#4a6a8a", ausdruck: "weise", alt: true, szene: "schnee", amulett: true, licht: { farbe: "#e8f4ff", seite: -1 } },
  npc_eik: { hintergrund: "#6a8aaa", augen: "#4a7a3a", ausdruck: "neugierig", szene: "schnee", licht: { farbe: "#fff0d0", seite: 1 } },
  npc_brynja: { hintergrund: "#6a8aaa", augen: "#3a6a9a", ausdruck: "froh", ohrringe: true, szene: "schnee", licht: { farbe: "#fff0d0", seite: -1 } },
  npc_torvald: { hintergrund: "#5a6a7a", augen: "#3a4a6a", ausdruck: "froh", russ: true, szene: "schnee", licht: { farbe: "#ffb060", seite: 1 } },
  npc_halvar: { hintergrund: "#4a6a8a", augen: "#4a6a9a", ausdruck: "weise", alt: true, szene: "schnee", amulett: true, licht: { farbe: "#ffc060", seite: 1 } },
  npc_sigrun: { hintergrund: "#6a7aaa", augen: "#6a3a8a", ausdruck: "froh", szene: "schnee", blume: true, licht: { farbe: "#ffe0f0", seite: -1 } },
  boss_schweigekoenig: { hintergrund: "#2a4a6a", troll: true },
  boss_morgrath: { hintergrund: "#3a0c08", morgrath: true },
  boss_echo: { hintergrund: "#22183a", szene: "runen", waechter: { stein: "#70608e", dunkel: "#40345a", glut: "#ecdcff", rune: "#b48aff" } },
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
  const szene = SZENEN[p.szene];
  if (szene) szene(b, p);
  else {
    b.fuelle(0, 0, G - 1, G - 1, (x, y) => ((x - 30) / 30) ** 2 + ((y - 26) / 26) ** 2 <= 1,
      (x, y) => tonAus(r, 0.75 - Math.hypot(x - 30, y - 26) / 70, x, y, 0.9));
  }
  // Leichte Vignette, damit die Figur gut lesbar bleibt
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const d = Math.hypot((x - 32) / 32, (y - 30) / 34);
    if (d > 0.82 && hash(x, y, 99) < (d - 0.82) * 2.2) b.set(x, y, toene(b.get(x, y), -1));
  }
}

function wolke(b, cx, cy, breite) {
  const w = ["#c8d8f0", "#e6eefa", "#ffffff"];
  for (let i = 0; i < breite; i += 3) b.kugel(cx + i, cy - Math.sin((i / breite) * Math.PI) * 2, 3.2, 2.4, w, { dither: 0.3 });
}

function huegel(b, y0, amp, freq, phase, farbe) {
  const r = R(farbe);
  for (let x = 0; x < G; x++) {
    const oben = Math.round(y0 - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.7 + phase) * amp * 0.3);
    for (let y = oben; y < G; y++) b.set(x, y, tonAus(r, 0.7 - (y - oben) / 30, x, y, 0.8));
  }
}

const SZENEN = {
  schnee(b, p) {
    b.verlauf(0, 0, G, 44, R5(mische("#a8d8ff", p.hintergrund, 0.2)).reverse(), { dither: 0.9, umkehren: true });
    // Verschneite Berge
    for (const [x0, h, w] of [[-6, 30, 26], [16, 38, 22], [36, 32, 28]]) {
      for (let x = Math.max(0, x0 - w); x < Math.min(G, x0 + w); x++) {
        const oben = Math.round(G - h + Math.abs(x - x0) * (h / w) * 0.9);
        for (let y = oben; y < G; y++) b.set(x, y, y - oben < 6 - Math.abs(x - x0) * 0.1 ? (hash(x, y, 7) > 0.2 ? "#f4f8ff" : "#d8e4f4") : (hash(x, y, 8) > 0.5 ? "#7a8aa0" : "#6a7a90"));
      }
    }
    huegel(b, 52, 2, 0.12, 1, "#e8f0fa");
    // Schneeflocken
    for (let i = 0; i < 26; i++) b.set(Math.floor(hash(i, 1, 12) * G), Math.floor(hash(i, 2, 12) * G), "#ffffff");
  },
  land(b, p) {
    const himmel = R5(mische("#6aa8e8", p.hintergrund, 0.25));
    b.verlauf(0, 0, G, 40, [...himmel].reverse(), { dither: 0.9, umkehren: true });
    wolke(b, 4, 10, 14); wolke(b, 42, 6, 12);
    huegel(b, 36, 3, 0.09, 1, "#6a8ab0");
    huegel(b, 42, 4, 0.13, 3, "#4f8a4a");
    huegel(b, 50, 3, 0.2, 0.5, "#3f7a3a");
  },
  wald(b) {
    b.verlauf(0, 0, G, G, R5("#9ac8a0").reverse(), { dither: 0.9, umkehren: true });
    for (let i = 0; i < 9; i++) {
      const x = 2 + i * 7.5 + hash(i, 1, 4) * 3, h = 30 + hash(i, 2, 4) * 18;
      const r = R(i % 2 ? "#2f6a3a" : "#3a7a44");
      for (let y = G - h; y < G; y++) {
        const w = Math.max(1, (y - (G - h)) * 0.32);
        for (let dx = -w; dx <= w; dx++) b.set(Math.round(x + dx), y, tonAus(r, 0.6 - dx / (w * 3), x + dx, y, 0.7));
      }
    }
    for (let i = 0; i < 14; i++) b.set(Math.floor(hash(i, 3, 4) * G), Math.floor(hash(i, 4, 4) * 40), "#f8f4c0");
  },
  nacht(b, p) {
    b.verlauf(0, 0, G, G, R5("#2a3a7a"), { dither: 0.9 });
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(hash(i, 1, 6) * G), y = Math.floor(hash(i, 2, 6) * 44);
      b.set(x, y, hash(i, 3, 6) > 0.7 ? "#ffffff" : "#b8c8f8");
      if (hash(i, 4, 6) > 0.85) { b.set(x - 1, y, "#8898d8"); b.set(x + 1, y, "#8898d8"); b.set(x, y - 1, "#8898d8"); b.set(x, y + 1, "#8898d8"); }
    }
    b.kugel(52, 12, 6, 6, ["#c8c8a0", "#e8e8c8", "#fffff0"], { dither: 0.3 });
    b.kugel(55, 10, 5, 5, R5("#2a3a7a").slice(2, 4), { dither: 0 });
    huegel(b, 48, 3, 0.11, 2, "#1e2a5a");
  },
  dorf(b) {
    b.verlauf(0, 0, G, 44, R5("#7ab0e8").reverse(), { dither: 0.9, umkehren: true });
    wolke(b, 36, 7, 14);
    huegel(b, 34, 2, 0.1, 1, "#5a8ab0");
    const haeuser = [[0, 30, 16, "#c84a36"], [18, 34, 14, "#4e6ab8"], [40, 31, 18, "#c84a36"], [56, 33, 12, "#5a4e4a"]];
    for (const [x0, y0, w, dach] of haeuser) {
      b.rect(x0, y0, w, G - y0, "#d8c8a8");
      b.rect(x0, y0, 1, G - y0, "#b8a888");
      const dr = R(dach);
      for (let j = 0; j < 8; j++) b.rect(x0 - 1 + j, y0 - 8 + j, w + 2 - j * 2, 1, dr[j % 2 ? 1 : 2]);
      for (let k = 0; k < Math.floor(w / 6); k++) { b.rect(x0 + 2 + k * 6, y0 + 4, 3, 3, "#f8e8a0"); b.rect(x0 + 2 + k * 6, y0 + 4, 3, 1, "#6a4426"); }
      b.rect(x0, y0 + 10, w, 1, "#6a4426");
    }
    huegel(b, 56, 1, 0.3, 0, "#4f8a4a");
  },
  markt(b) {
    b.verlauf(0, 0, G, G, R5("#a8c890").reverse(), { dither: 0.9, umkehren: true });
    // Regal mit Äpfeln und Brot
    b.rect(0, 38, G, 3, "#7a5230"); b.rect(0, 41, G, 1, "#4a2e1a");
    for (let i = 0; i < 12; i++) b.kugel(3 + i * 5.2, 35.5, 2.3, 2.2, R(i % 3 === 2 ? "#6ab040" : "#d83a3a"), { dither: 0.3 });
    for (let i = 0; i < 5; i++) b.kugel(6 + i * 12, 50, 4.5, 2.6, R("#d8a050"), { dither: 0.4 });
    // Markise oben
    for (let x = 0; x < G; x++) {
      const streifen = Math.floor(x / 6) % 2;
      const unten = 12 + Math.round(Math.abs(Math.sin((x % 6) / 6 * Math.PI)) * 2);
      for (let y = 0; y < unten; y++) b.set(x, y, streifen ? (y < 2 ? "#e8e4dc" : "#f4f0e8") : (y < 2 ? "#a82a2a" : "#d03a3a"));
      b.set(x, unten, streifen ? "#c8c4bc" : "#8a2020");
    }
  },
  schmiede(b) {
    // Ziegelwand mit Glut
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      const reihe = Math.floor(y / 4), fuge = y % 4 === 3 || (x + (reihe % 2) * 4) % 8 === 7;
      const glut = Math.max(0, 1 - Math.hypot(x - 54, y - 44) / 30);
      const basis = fuge ? "#2a1a14" : mische(hash(Math.floor((x + (reihe % 2) * 4) / 8), reihe, 7) > 0.5 ? "#5a3426" : "#4a2a20", "#ff8a30", glut * 0.6);
      b.set(x, y, basis);
    }
    // Esse: gemauerte Öffnung mit Glut
    for (let y = 36; y < G; y++) for (let x = 47; x < G; x++) {
      const innen = y > 42 || ((x - 56) / 8.5) ** 2 + ((y - 43) / 7) ** 2 <= 1;
      const rand = y > 41 ? (x === 47 || x === 48) : ((x - 56) / 9.5) ** 2 + ((y - 43) / 8) ** 2 <= 1;
      if (innen) b.set(x, y, tonAus(["#2a0e06", "#6a1a08", "#c83a10", "#f07020", "#ffc050"], (y - 40) / 26 + hash(x, y, 4) * 0.25, x, y, 0.7));
      else if (rand) b.set(x, y, "#6a5a50");
    }
    for (let i = 0; i < 14; i++) b.set(40 + Math.floor(hash(i, 1, 8) * 22), 10 + Math.floor(hash(i, 2, 8) * 28), hash(i, 3, 8) > 0.5 ? "#ffd060" : "#ff8a30");
  },
  bibliothek(b) {
    b.rect(0, 0, G, G, "#2a1e18");
    const farben = ["#8a2a2a", "#2a4a8a", "#2a6a3a", "#6a3a8a", "#a8742a", "#3a3a4a", "#9a8a6a"];
    for (let reihe = 0; reihe < 4; reihe++) {
      const y0 = 2 + reihe * 16;
      let x = 0, i = 0;
      while (x < G) {
        const w = 2 + Math.floor(hash(i, reihe, 3) * 3), h = 10 + Math.floor(hash(i, reihe, 4) * 4);
        const r = R(farben[Math.floor(hash(i, reihe, 5) * farben.length)]);
        for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < h; dy++) b.set(x + dx, y0 + 13 - h + dy, r[dx === 0 ? 2 : dx === w - 1 ? 0 : 1]);
        if (h > 11) b.rect(x, y0 + 13 - h + 2, w, 1, "#e0b850");
        x += w; i++;
      }
      b.rect(0, y0 + 13, G, 2, "#6a4428"); b.rect(0, y0 + 15, G, 1, "#3a2414");
    }
    // Kerzenschein links
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      const k = Math.max(0, 1 - Math.hypot(x - 8, y - 18) / 26);
      if (k > 0 && hash(x, y, 31) < k * 1.4) b.set(x, y, mische(b.get(x, y), "#ffcf70", k * 0.5));
    }
    b.rect(7, 16, 2, 6, "#f2ead6"); b.set(7, 14, "#fff4b0"); b.set(8, 14, "#ffd050"); b.set(7, 15, "#ff9a30"); b.set(8, 15, "#ffd050");
  },
  meer(b, p) {
    // Mittelmeer: heller Himmel, Sonne, Meereslinie mit Glitzern, weiße Häuser am Horizont
    const himmel = R5(mische("#7ac0f0", p.hintergrund, 0.2));
    b.verlauf(0, 0, G, 38, [...himmel].reverse(), { dither: 0.9, umkehren: true });
    b.fuelle(46, 4, 60, 18, (x, y) => (x - 53) ** 2 + (y - 11) ** 2 <= 36, "#fff4c0");
    wolke(b, 6, 8, 12);
    const meer = R5("#2a7ab8");
    b.verlauf(0, 38, G, 26, meer, { dither: 0.8 });
    for (let i = 0; i < 26; i++) b.set(Math.floor(hash(i, 1, 9) * G), 39 + Math.floor(hash(i, 2, 9) * 24), "#d8f0ff");
    for (let i = 0; i < 6; i++) { const x = 2 + i * 10 + Math.floor(hash(i, 3, 9) * 4), h = 4 + Math.floor(hash(i, 4, 9) * 4); b.rect(x, 38 - h, 6, h, "#f4f0e8"); b.rect(x, 38 - h - 1, 6, 1, "#c8603a"); }
  },
  runen(b) {
    b.verlauf(0, 0, G, G, R5("#1e1a30"), { dither: 0.9 });
    for (let i = 0; i < 360; i += 2) {
      const a = (i * Math.PI) / 180;
      const x = Math.round(32 + Math.cos(a) * 29), y = Math.round(30 + Math.sin(a) * 29);
      b.set(x, y, i % 30 < 10 ? "#58d8f0" : "#2a6a8a");
    }
  },
};

/** Kantenlicht: helle Ränder auf der Lichtseite, dunklere auf der Schattenseite. */
function kantenlicht(f, licht = { farbe: "#fff2d0", seite: -1 }) {
  const neu = [];
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const c = f.get(x, y);
    if (!c) continue;
    const lx = x + licht.seite, sx = x - licht.seite;
    if (!f.get(lx, y) || (!f.get(x, y - 1) && licht.seite < 0)) neu.push([x, y, mische(c, licht.farbe, 0.42)]);
    else if (!f.get(sx, y) && hash(x, y, 12) > 0.3) neu.push([x, y, toene(c, -1)]);
  }
  for (const [x, y, c] of neu) f.set(x, y, c);
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
  const w = p.waechter ?? {};
  const stein = R5(w.stein ?? "#6e6a88");
  const dunkel = R5(w.dunkel ?? "#4a4660");
  form(f, (x, y) => ((x - 32) / 30) ** 2 + ((y - 70) / 24) ** 2 <= 1, (x, y) => kugelTon(stein, 28, 56, 32, 20, x, y));
  form(f, (x, y) => ((x - 32) / 21) ** 2 + ((y - 30) / 25) ** 2 <= 1 && y < 56, (x, y) => kugelTon(dunkel, 28, 22, 22, 26, x, y, { dither: 0.6 }));
  form(f, (x, y) => ((x - 32) / 12) ** 2 + ((y - 34) / 13) ** 2 <= 1, (x, y) => (y < 26 ? "#08060e" : "#120f1c"));
  const glut = w.glut ?? "#80ecff";
  const rune = w.rune ?? "#58d8f0";
  const glutDunkel = toene(rune, -2);
  for (const cx of [26, 38]) {
    f.rect(cx - 2, 31, 5, 3, glut); f.rect(cx - 1, 31, 3, 1, "#ffffff");
    f.set(cx - 3, 32, glutDunkel); f.set(cx + 3, 32, glutDunkel);
  }
  for (const [x, y] of [[31, 52], [32, 52], [32, 53], [31, 56], [32, 58], [31, 59], [24, 55], [40, 55]]) f.set(x, y, rune);
  for (let i = 0; i < 18; i++) { const x = 6 + Math.floor(hash(i, 3) * 52), y = 46 + Math.floor(hash(i, 7) * 18); if (f.get(x, y)) f.set(x, y, stein[0]); }
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
}

/** Der Drachenrichter: Kopf im Dreiviertelprofil nach rechts, wie in der Konzeptzeichnung. */
function drachenrichter(b, p) {
  // Hintergrund: dunkle Glut mit Funken
  b.verlauf(0, 0, G, G, R5(p.hintergrund), { dither: 0.9 });
  b.fuelle(0, 0, G - 1, G - 1, (x, y) => ((x - 40) / 30) ** 2 + ((y - 30) / 26) ** 2 <= 1,
    (x, y) => tonAus(R5("#4a3a6a"), 0.8 - Math.hypot(x - 40, y - 30) / 40, x, y, 0.9));
  for (let i = 0; i < 16; i++) b.set(4 + Math.floor(hash(i, 1, 7) * 56), 2 + Math.floor(hash(i, 2, 7) * 58), i % 3 ? "#ff9a3a" : "#ffd27a");
  const f = new Bild(G, G);
  const haut = R5("#a8322a"), dunkel = R5("#76221e"), bauch = R("#e0a860"), membran = R("#c85038");
  const schatten = (r, hellX, hellY) => (x, y) => tonAus(r, 0.75 - ((x - hellX) ** 2 + (y - hellY) ** 2) / 900, x, y, 0.5);
  // Hals mit Kehlplatten
  f.poly([[12, 40], [30, 40], [34, 64], [6, 64]], schatten(haut, 18, 44));
  for (let i = 0; i < 4; i++) f.poly([[24 + i, 44 + i * 5], [32 + i, 45 + i * 5], [33 + i, 48 + i * 5], [25 + i, 48 + i * 5]], bauch[1 + (i % 2)]);
  // Ohren: hinten (dunkler) und vorne, spitz mit S-Rand
  f.poly([[10, 30], [6, 3], [12, 12], [20, 20], [22, 28]], (x, y) => tonAus(dunkel, 0.45 - (y - 3) / 80, x, y, 0.4));
  f.poly([[11, 28], [8, 9], [13, 15], [19, 22]], membran[0]);
  f.poly([[26, 24], [33, 1], [36, 10], [37, 16], [44, 21], [40, 28]], (x, y) => tonAus(membran, 0.7 - (y - 1) / 60, x, y, 0.4));
  f.linie(26, 24, 33, 1, dunkel[1]); f.linie(27, 24, 34, 2, dunkel[2]);
  // Schädel
  f.fuelle(12, 18, 40, 44, (x, y) => ((x - 26) / 13) ** 2 + ((y - 31) / 12) ** 2 <= 1, (x, y) => kugelTon(haut, 24, 26, 13, 12, x, y));
  f.ellipse(30, 25, 3, 3, dunkel[1]); f.ellipse(30, 25, 2, 2, dunkel[2]);   // „Pflaster“ des Ohrs
  // Schnauze: langer Kasten, Oberseite heller, Vorderseite dunkler
  f.poly([[30, 23], [56, 26], [57, 38], [31, 39]], (x, y) => tonAus(haut, 0.95 - (y - 23) / 22, x, y, 0.4));
  f.poly([[30, 23], [56, 26], [56, 28], [31, 26]], haut[4]);
  for (const x of [38, 46]) f.linie(x, 24, x, 26, haut[2]);
  f.poly([[56, 26], [61, 28], [61, 38], [57, 38]], dunkel[2]);
  f.rect(57, 29, 2, 3, "#1a0606"); f.set(58, 28, "#1a0606");                   // Nasenloch (Tropfen)
  // Maul: offen, Zähne oben und unten, Zunge
  f.poly([[32, 38], [60, 38], [58, 44], [34, 46]], "#3a0e10");
  f.poly([[40, 42], [56, 41], [54, 44], [42, 45]], "#e05a6a");
  for (let x = 34; x <= 58; x += 4) { f.set(x, 39, "#f2ead6"); f.set(x, 40, "#f2ead6"); f.set(x + 1, 39, "#d8ccb0"); }
  f.rect(58, 39, 1, 4, "#f2ead6"); f.rect(59, 39, 1, 2, "#f2ead6");          // Fangzahn
  // Unterkiefer wie eine Baggerschaufel
  f.poly([[30, 45], [59, 43], [60, 49], [32, 52]], (x, y) => tonAus(dunkel, 0.75 - (y - 43) / 14, x, y, 0.4));
  f.poly([[33, 48], [58, 46], [58, 48], [34, 50]], bauch[1]);
  for (let x = 37; x <= 57; x += 5) f.set(x, 44, "#f2ead6");
  // Auge: dreieckig, glühend, mit wütender Braue
  f.poly([[30, 31], [40, 26], [37, 33]], "#ffd23a");
  f.poly([[31, 31], [37, 28], [36, 31]], "#ffe680");
  f.set(36, 29, "#fff4b0"); f.rect(34, 30, 1, 2, "#5a1a04");
  f.linie(29, 25, 39, 23, dunkel[0]); f.linie(29, 26, 39, 24, dunkel[1]);
  // Stacheln am Hinterkopf
  for (const [x, y] of [[14, 21], [12, 26], [11, 31]]) { f.set(x, y, "#3a2a28"); f.set(x - 1, y - 1, "#3a2a28"); f.set(x - 2, y - 2, "#5a4a44"); }
  // Rauchwölkchen aus der Nase
  for (const [x, y, rr] of [[60, 22, 2], [62, 18, 2], [59, 15, 1]]) f.ellipse(x, y, rr, rr, "#b8b0a8");
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
}


function werwolf(b, p) {
  // Hintergrund: dunkler Wald mit Nebel und einem bleichen Mond
  b.verlauf(0, 0, G, G, R5(p.hintergrund), { dither: 0.9 });
  b.ellipse(50, 12, 7, 7, "#d8dcc8"); b.ellipse(48, 11, 5, 5, "#eef0e0");
  for (const x of [4, 14, 58]) b.rect(x, 0, 5, G, "#141a1c");
  for (let i = 0; i < 18; i++) b.set(Math.floor(hash(i, 3, 9) * 64), 40 + Math.floor(hash(i, 4, 9) * 24), "#3a2a4a");
  const f = new Bild(G, G);
  const fell = R5("#4a4652"), dunkel = R5("#2e2b34"), hell = R("#8a8494"), mantel = R5("#3a2448");
  const ton = (r, hx, hy, s = 700) => (x, y) => tonAus(r, 0.8 - ((x - hx) ** 2 + (y - hy) ** 2) / s, x, y, 0.5);
  // Schultern im zerrissenen Mantel
  f.poly([[2, 64], [8, 46], [22, 40], [42, 40], [56, 46], [62, 64]], ton(mantel, 24, 46, 900));
  for (let i = 0; i < 6; i++) f.poly([[6 + i * 9, 64], [10 + i * 9, 56], [14 + i * 9, 64]], mantel[0]);
  // Fellkragen
  for (let i = 0; i < 9; i++) f.poly([[14 + i * 4, 44], [16 + i * 4, 36], [19 + i * 4, 44]], i % 2 ? hell[1] : fell[2]);
  // Ohren
  f.poly([[14, 22], [12, 2], [24, 14]], ton(dunkel, 15, 8));
  f.poly([[15, 18], [14, 7], [21, 14]], "#8a5a6a");
  f.poly([[50, 22], [52, 2], [40, 14]], ton(dunkel, 48, 8));
  f.poly([[49, 18], [50, 7], [43, 14]], "#8a5a6a");
  // Kopf mit Wangenfell
  f.fuelle(12, 10, 52, 42, (x, y) => ((x - 32) / 19) ** 2 + ((y - 25) / 15) ** 2 <= 1, ton(fell, 26, 18, 500));
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) f.poly([[32 + s * 14, 26 + i * 3], [32 + s * 22, 30 + i * 4], [32 + s * 15, 31 + i * 3]], hell[1 + (i % 2)]);
  // Schnauze und Maul
  f.poly([[24, 28], [40, 28], [42, 44], [22, 44]], ton(hell, 30, 30, 300));
  f.ellipse(32, 30, 4, 3, "#141016"); f.set(31, 29, "#5a5060");
  f.poly([[24, 40], [40, 40], [37, 47], [27, 47]], "#3a0e14");
  for (let x = 25; x <= 39; x += 3) { f.set(x, 40, "#f2ead6"); f.set(x, 41, "#f2ead6"); }
  f.rect(25, 40, 1, 4, "#f2ead6"); f.rect(39, 40, 1, 4, "#f2ead6");
  // Glühende Augen unter wütenden Brauen
  for (const s of [-1, 1]) {
    f.ellipse(32 + s * 8, 22, 3, 2, "#ffd23a"); f.set(32 + s * 8, 22, "#fff4b0");
    f.linie(32 + s * 4, 19, 32 + s * 12, 17, dunkel[0]);
  }
  // Zerbrochene runde Brille
  for (const s of [-1, 1]) for (let a = 0; a < 24; a++) { const w = (a / 24) * Math.PI * 2; f.set(Math.round(32 + s * 8 + Math.cos(w) * 5), Math.round(22 + Math.sin(w) * 4), "#c8a050"); }
  f.linie(27, 21, 37, 21, "#c8a050");
  f.linie(41, 18, 45, 25, "#e8f0ff");   // Sprung im Glas
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
}

function schweigekoenig(b, p) {
  // Hintergrund: blasser Winterhimmel, ein eisiger Gipfel und fallender Schnee
  b.verlauf(0, 0, G, G, R5(p.hintergrund), { dither: 0.9 });
  for (let x = 0; x < G; x++) {
    const oben = Math.round(18 + Math.abs(x - 46) * 0.9);
    for (let y = oben; y < G; y++) b.set(x, y, y - oben < 4 ? "#dce8f4" : "#3a5470");
  }
  const f = new Bild(G, G);
  const haut = R5("#8ea8bc"), dunkel = R5("#5e7890"), fell = R5("#7a6a58"), eis = R("#bfe8ff");
  const ton = (r, hx, hy, s = 700) => (x, y) => tonAus(r, 0.8 - ((x - hx) ** 2 + (y - hy) ** 2) / s, x, y, 0.5);
  // Massige Schultern im Fellmantel
  f.poly([[0, 64], [4, 44], [20, 38], [44, 38], [60, 44], [64, 64]], ton(fell, 24, 44, 1000));
  for (let i = 0; i < 8; i++) f.poly([[4 + i * 8, 46], [8 + i * 8, 40], [12 + i * 8, 46]], fell[3]);
  // Kette quer über die Brust
  for (let i = 0; i < 9; i++) { const x = 6 + i * 6, y = 48 + Math.round(Math.sin(i / 8 * Math.PI) * 6); f.ellipse(x, y, 3, 2, "#4a4e58"); f.ellipse(x, y, 1, 1, fell[1]); f.set(x - 1, y - 1, "#8a909a"); }
  // Kopf
  f.fuelle(10, 10, 54, 46, (x, y) => ((x - 32) / 20) ** 2 + ((y - 28) / 17) ** 2 <= 1, ton(haut, 26, 20, 600));
  // Schwere Stirn und Knollennase
  f.fuelle(14, 16, 50, 26, (x, y) => ((x - 32) / 18) ** 2 + ((y - 21) / 4) ** 2 <= 1, ton(dunkel, 28, 18, 400));
  f.kugel(32, 31, 4.5, 4, R("#c4d6e4"), { dither: 0.3 });
  // Kalte, leuchtende Augen
  for (const s of [-1, 1]) { f.ellipse(32 + s * 9, 25, 3, 2, "#8af0ff"); f.set(32 + s * 9, 25, "#ffffff"); f.linie(32 + s * 4, 21, 32 + s * 14, 22, dunkel[0]); }
  // Maul mit Hauern
  f.linie(24, 38, 40, 38, dunkel[0]);
  for (const s of [-1, 1]) f.poly([[32 + s * 6, 38], [32 + s * 8, 38], [32 + s * 7, 33]], "#eef2e6");
  // Eiszapfenbart
  for (let i = 0; i < 9; i++) { const x = 20 + i * 3, l = 6 + Math.round((1 - Math.abs(i - 4) / 4) * 9); f.poly([[x - 1, 40], [x + 2, 40], [x, 40 + l]], i % 2 ? eis[1] : eis[2]); }
  // Gefrorene Krone
  f.rect(15, 9, 34, 4, eis[1]);
  for (let i = 0; i < 6; i++) { const x = 16 + i * 6.4, h = i === 2 || i === 3 ? 10 : 6; f.poly([[x, 10], [x + 4, 10], [x + 2, 10 - h]], eis[2]); f.set(Math.round(x + 2), 10 - h + 2, "#ffffff"); }
  f.set(31, 11, "#5ad0ff"); f.set(32, 11, "#5ad0ff");
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
}

function morgrath(b, p) {
  // Hintergrund: glühender Höhlenhimmel, unten Lava
  b.verlauf(0, 0, G, G, R5(p.hintergrund), { dither: 0.9 });
  for (let x = 0; x < G; x++) {
    const oben = 54 + Math.round(Math.sin(x * 0.4) * 1.5);
    for (let y = oben; y < G; y++) b.set(x, y, (x + y) % 5 ? "#ff7a1a" : "#ffd060");
    b.set(x, oben, "#ffe8a0");
  }
  for (let i = 0; i < 14; i++) b.set((i * 23) % G, 6 + ((i * 37) % 44), i % 2 ? "#ff9a3a" : "#ffd060");   // Glutfunken
  const f = new Bild(G, G);
  const eisen = R5("#4a4652"), schwarz = R5("#24202a"), glut = R("#ff6a1a");
  const ton = (r, hx, hy, s = 700) => (x, y) => tonAus(r, 0.75 - ((x - hx) ** 2 + (y - hy) ** 2) / s, x, y, 0.5);
  // Gewaltige Schulterplatten mit Dornen
  f.poly([[0, 64], [0, 46], [12, 38], [24, 42], [40, 42], [52, 38], [64, 46], [64, 64]], ton(schwarz, 20, 44, 900));
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) { const x = 32 + s * (16 + i * 4); f.poly([[x - 2, 44 - i], [x + 2, 44 - i], [x + s * 2, 30 - i * 2]], eisen[3 - (i % 2)]); }
    f.linie(32 + s * 12, 44, 32 + s * 28, 52, eisen[4]);
  }
  // Brustpanzer mit glühendem Riss
  f.poly([[22, 64], [22, 46], [32, 42], [42, 46], [42, 64]], ton(eisen, 28, 48, 500));
  f.linie(32, 46, 30, 52, glut[2]); f.linie(30, 52, 33, 57, glut[2]); f.linie(33, 57, 31, 63, glut[1]);
  f.set(31, 52, "#ffe8a0"); f.set(32, 56, "#ffe8a0");
  // Helm: hoch, schmal, mit spitzem Kinn
  f.poly([[20, 14], [44, 14], [46, 30], [40, 42], [32, 46], [24, 42], [18, 30]], ton(schwarz, 26, 20, 600));
  f.poly([[22, 16], [32, 14], [32, 44], [25, 40], [20, 30]], ton(eisen, 24, 22, 500));
  // T-förmiger Sehschlitz, der glüht
  f.rect(23, 25, 18, 3, "#ff7a1a"); f.rect(31, 25, 2, 13, "#ff7a1a");
  f.rect(24, 26, 16, 1, "#ffe8a0"); f.rect(31, 27, 2, 9, "#ffd060");
  for (const s of [-1, 1]) f.set(32 + s * 6, 26, "#ffffff");
  // Dornenkrone
  for (let i = 0; i < 7; i++) {
    const x = 19 + i * 4.3, h = 8 + (i === 3 ? 10 : i === 2 || i === 4 ? 6 : 2) + (i % 2) * 2;
    f.poly([[x, 16], [x + 3, 16], [x + 1.5, 16 - h]], i % 2 ? eisen[2] : schwarz[3]);
  }
  f.rect(18, 14, 28, 3, eisen[1]);
  f.set(32, 15, "#ff7a1a"); f.set(26, 15, "#ff7a1a"); f.set(38, 15, "#ff7a1a");
  f.umriss(null, { staerke: 0.35 });
  b.ueber(f);
  // Glutschein von unten am Rand der Figur
  for (let y = 40; y < 54; y++) for (let x = 0; x < G; x++) if (f.get?.(x, y) && !f.get?.(x, y + 2)) b.set(x, y, "#ff9a3a");
}

/** Malt das Porträt einer Figur (64×64). */
export function portraitBild(schluessel) {
  const p = PORTRAITS[schluessel];
  const b = new Bild(G, G);
  if (p?.waechter) { torwaechter(b, p); return b; }
  if (p?.drache) { drachenrichter(b, p); return b; }
  if (p?.werwolf) { werwolf(b, p); return b; }
  if (p?.troll) { schweigekoenig(b, p); return b; }
  if (p?.morgrath) { morgrath(b, p); return b; }
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
  glanzlichter(f, d);
  schmuck(f, d, p);
  kantenlicht(f, p.licht);
  f.umriss(null, { staerke: 0.3 });
  b.ueber(f);
  return b;
}

/** Glanzlicht auf den Haaren (heller Bogen oben links). */
function glanzlichter(f, d) {
  if (["glatze", "kapuze"].includes(d.frisur)) return;
  const r = R5(d.haare);
  const ziel = d.frisur === "spitzhut" ? 23 : 19;
  for (let a = 0; a < 1; a += 0.02) {
    const x = Math.round(20 + a * 16), y = Math.round(ziel - Math.sin(a * Math.PI) * 4 + (d.frisur === "lockig" ? 1 : 0));
    for (const dy of [0, 1]) {
      const c = f.get(x, y + dy);
      const i = r.indexOf(c);
      if (i >= 0 && i < r.length - 1 && hash(x, y + dy, 3) > 0.25) f.set(x, y + dy, r[Math.min(r.length - 1, i + 1 + (dy === 0 ? 1 : 0))]);
    }
  }
}

/** Kleine Erkennungszeichen: Amulett, Blume, Narbe, Federn, Spange, Schal. */
function schmuck(f, d, p) {
  const gold = R("#e0b040");
  if (p.amulett) {
    f.linie(27, 50, 32, 55, gold[1]); f.linie(37, 50, 32, 55, gold[1]);
    f.kugel(32, 57, 2.6, 2.6, gold, { dither: 0.2 });
    f.set(32, 57, "#5ad0ff"); f.set(31, 56, "#c8f4ff");
  }
  if (p.blume) {
    for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0]]) f.kugel(20 + dx, 19 + dy, 1.6, 1.6, R("#f070a0"), { dither: 0 });
    f.set(20, 19, "#ffe040"); f.set(19, 19, "#f8c020");
  }
  if (p.narbe) { f.linie(40, 35, 43, 38, mische(R5(d.haut)[1], "#a04040", 0.3)); }
  if (p.feder) {
    // Feder hinter dem Ohr (Lyra: Schreibfeder, Barde: rote Feder)
    const rot = d.extra === "laute";
    const fr = R(rot ? "#d84040" : "#f4f0e8");
    for (let i = 0; i < 12; i++) {
      const x = 46 + Math.round(i * 0.5), y = 34 - i;
      f.set(x, y, fr[2]); f.set(x + 1, y, fr[1]); if (i > 2 && i < 10) f.set(x - 1, y, fr[3]);
    }
    f.linie(46, 34, 45, 38, rot ? "#8a2020" : "#8a8070");
  }
  if (p.spange) {
    const blatt = R("#5ab04a");
    f.kugel(32, 53, 3.2, 2.2, blatt, { dither: 0.2 });
    f.linie(29, 53, 35, 53, blatt[0]);
    f.set(32, 51, gold[2]); f.set(32, 55, gold[2]);
  }
  if (p.schal) {
    const sr = R(p.schal);
    for (let y = 49; y < 57; y++) for (let x = 21; x < 44; x++) {
      const innen = ((x - 32) / 11.5) ** 2 + ((y - 52.5) / 3.6) ** 2 <= 1;
      if (innen) f.set(x, y, sr[((x + y * 2) >> 2) % 2 ? 1 : 2]);
    }
    for (let y = 55; y < 64; y++) f.rect(36, y, 4, 1, sr[y % 3 === 0 ? 0 : 1]);
  }
}
