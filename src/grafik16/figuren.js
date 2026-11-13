// 16-Bit-Figuren: 16×24 Pixel, Blickrichtungen unten/oben/seite (seite = nach links,
// rechts wird gespiegelt), Bilder: 0 stehen, 1 Schritt A, 2 Schritt B, 3 atmen.

import { Bild, rampe, mische, toene } from "./pinsel.js";

export const SPRITE_B = 16;
export const SPRITE_H = 24;
export const RICHTUNGEN = ["unten", "oben", "seite"];
export const BILDER_PRO_RICHTUNG = 4;

// Aussehen aller Figuren. Schlüssel wie in klassen.js (textur) und welt/*.js (bild).
export const AUSSEHEN = {
  held_neu: {
    haut: "#f0c49a", haare: "#6b4a2e", frisur: "kapuze", kapuze: "#8a8070",
    kleid: "#7a6e5c", akzent: "#5a4630", hose: "#4f4a58", stiefel: "#5a3a24",
  },
  held_kriegerin: {
    haut: "#f0c49a", haare: "#c4472a", frisur: "zopf",
    kleid: "#b83838", akzent: "#c9c9d6", hose: "#4a3a34", stiefel: "#6a4024", extra: "schwert",
  },
  held_magier: {
    haut: "#e8b890", haare: "#3a2a48", frisur: "spitzhut", hut: "#3654b8", hutband: "#e0b040",
    kleid: "#3654b8", akzent: "#e0b040", hose: "#2a3470", stiefel: "#3a2a2a", robe: true, extra: "stab",
  },
  held_waldlaeufer: {
    haut: "#f2cca4", haare: "#e6be5a", frisur: "kapuze", kapuze: "#3e7e44",
    kleid: "#4f9a4a", akzent: "#7a5230", hose: "#5a4a32", stiefel: "#5a3a20", extra: "koecher",
  },
  held_barde: {
    haut: "#c98b5e", haare: "#5a2a14", frisur: "lockig",
    kleid: "#e0a030", akzent: "#b03030", hose: "#6a3a8a", stiefel: "#4a2a1a", extra: "laute",
  },
  npc_aldric: {
    haut: "#f0c8a4", haare: "#e6e2d8", frisur: "lang", bart: "lang", bartfarbe: "#efebe2",
    kleid: "#2f4f9f", akzent: "#e0b040", hose: "#2f4f9f", stiefel: "#3a2a1a", robe: true, extra: "wanderstab",
  },
  npc_wilma: {
    haut: "#f2c8a0", haare: "#8a4a2a", frisur: "dutt", wangen: true,
    kleid: "#4f8a3c", akzent: "#f0e6d0", hose: "#4f8a3c", stiefel: "#4a2a1a", robe: true, schuerze: "#f0e6d0",
  },
  npc_borin: {
    haut: "#d39a6a", haare: "#9a4a1e", frisur: "glatze", bart: "kurz", bartfarbe: "#a4501e",
    kleid: "#5a4a3a", akzent: "#3a2a20", hose: "#3a3a40", stiefel: "#2a1a14", schuerze: "#8a5a2e", armeHaut: true,
  },
  npc_finn: {
    haut: "#f6d4b4", haare: "#c4472a", frisur: "kurz",
    kleid: "#7a5230", akzent: "#e8d8b0", hose: "#3a5a9a", stiefel: "#4a2a1a", extra: "buch",
  },
  npc_orpheon: {
    haut: "#e2b48c", haare: "#e8e4dc", frisur: "lang", bart: "lang", bartfarbe: "#ece8e0",
    kleid: "#f2ece0", akzent: "#3a7ab8", hose: "#f2ece0", stiefel: "#8a6a40", robe: true, extra: "wanderstab",
  },
  npc_nerea: {
    haut: "#c88a5a", haare: "#2a1a14", frisur: "lockig", wangen: true,
    kleid: "#2a6a9a", akzent: "#e8c060", hose: "#2a6a9a", stiefel: "#6a4a2a", robe: true, ohrringe: true,
  },
  npc_daphne: {
    haut: "#d9a274", haare: "#3a2214", frisur: "dutt", wangen: true,
    kleid: "#c8603a", akzent: "#f2e6c8", hose: "#c8603a", stiefel: "#7a5230", robe: true, schuerze: "#f2e6c8", ohrringe: true,
  },
  npc_ilias: {
    haut: "#c48456", haare: "#2a2422", frisur: "lockig", bart: "kurz", bartfarbe: "#2a2422",
    kleid: "#e8eef2", akzent: "#2a5a8a", hose: "#2a4a6a", stiefel: "#3a3a3a", schuerze: "#5a8aa0", armeHaut: true,
  },
  npc_kleon: {
    haut: "#d8a47a", haare: "#b8b0a4", frisur: "glatze", bart: "lang", bartfarbe: "#c8c0b4",
    kleid: "#8a6a4a", akzent: "#c87a4a", hose: "#5a4a3a", stiefel: "#5a3a24", schuerze: "#b8784a", armeHaut: true,
  },
  npc_ione: {
    haut: "#ecc4a0", haare: "#1a1a2a", frisur: "zopf",
    kleid: "#e8e2d4", akzent: "#7a3a8a", hose: "#7a3a8a", stiefel: "#6a4a2a", robe: true, extra: "buch",
  },
  npc_talos: {
    haut: "#c89470", haare: "#e4e0d8", frisur: "kurz", bart: "kurz", bartfarbe: "#e4e0d8",
    kleid: "#24406a", akzent: "#e0b040", hose: "#3a3a48", stiefel: "#2a2220", schal: "#c8503a",
  },
  npc_kassia: {
    haut: "#b87c52", haare: "#3a2a20", frisur: "kurz", wangen: false,
    kleid: "#5a6a7a", akzent: "#d8a838", hose: "#3a4048", stiefel: "#3a2a1a", schuerze: "#8a5a2e", armeHaut: true,
  },
  npc_timon: {
    haut: "#f0c8a0", haare: "#c8a050", frisur: "lockig",
    kleid: "#2a5aa8", akzent: "#e8e0c8", hose: "#2a5aa8", stiefel: "#4a4a4a",
  },
  npc_daria: {
    haut: "#e8b48a", haare: "#8a2a1a", frisur: "zopf",
    kleid: "#c84a2a", akzent: "#f0e0c0", hose: "#3a4a5a", stiefel: "#3a2a1a", schuerze: "#6a5040", armeHaut: true,
  },
  npc_lyra: {
    haut: "#f4d2b0", haare: "#cfc6ee", frisur: "spitzhut", langhaar: true, hut: "#6a3fa0", hutband: "#e6c45a",
    kleid: "#6a3fa0", akzent: "#e6c45a", hose: "#4a2a80", stiefel: "#2a1a2a", robe: true, extra: "buch",
  },
};

const R = (hex) => rampe(hex, -2, 1);
const AUGE = "#2a1c34";

// ---------- Teile ----------

function kopf(b, d, richtung, oy) {
  const h = R(d.haut);
  if (richtung === "seite") {
    b.kugel(7.5, 7 + oy, 4.9, 5, h, { dither: 0.3, hell: 0.15 });
    b.set(2, 8 + oy, h[2]);                       // Nase
    b.set(2, 7 + oy, h[3]);
    b.set(9, 7 + oy, h[1]); b.set(9, 8 + oy, h[0]); // Ohr
    b.set(4, 7 + oy, AUGE); b.set(4, 8 + oy, AUGE);
    b.set(4, 10 + oy, h[1]);
    if (d.wangen) b.set(5, 9 + oy, mische(h[2], "#e05050", 0.4));
  } else {
    b.kugel(8, 7 + oy, 5, 5, h, { dither: 0.3, hell: 0.15 });
    b.set(2, 7 + oy, h[2]); b.set(2, 8 + oy, h[1]); b.set(13, 7 + oy, h[1]); b.set(13, 8 + oy, h[0]);
    if (richtung === "unten") {
      b.set(5, 7 + oy, AUGE); b.set(5, 8 + oy, AUGE); b.set(10, 7 + oy, AUGE); b.set(10, 8 + oy, AUGE);
      b.set(6, 7 + oy, "#ffffff"); b.set(11, 7 + oy, "#ffffff");
      b.set(7, 10 + oy, h[1]); b.set(8, 10 + oy, h[1]);
      if (d.wangen || d.frisur === "dutt") { b.set(4, 9 + oy, mische(h[2], "#e05050", 0.45)); b.set(11, 9 + oy, mische(h[2], "#e05050", 0.45)); }
    }
  }
}

function haare(b, d, richtung, oy, teil) {
  const r = R(d.haare);
  const ell = (cx, cy, rx, ry, extra) => b.fuelle(cx - rx, cy - ry + oy, cx + rx, cy + ry + oy,
    (x, y) => ((x - cx) / rx) ** 2 + ((y - oy - cy) / ry) ** 2 <= 1 && extra(x, y - oy),
    (x, y) => {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - oy - cy) / ry;
      const t = 0.55 - nx * 0.35 - ny * 0.35;
      return r[Math.max(0, Math.min(3, Math.floor(t * 4 + ((x + y) % 2) * 0.3)))];
    });
  const f = d.frisur;

  if (teil === "hinten") {
    // Lange Haare hinter dem Körper
    if (f === "lang" || d.langhaar) {
      if (richtung === "unten") { b.rect(3, 9 + oy, 2, 6, r[1]); b.rect(11, 9 + oy, 2, 6, r[1]); }
      if (richtung === "seite") b.rect(9, 6 + oy, 3, 9, r[1]);
    }
    if (f === "zopf" && richtung !== "unten") {
      if (richtung === "oben") { b.rect(7, 10 + oy, 2, 5, r[1]); b.set(7, 15 + oy, r[0]); b.set(8, 15 + oy, r[0]); }
      else { b.rect(11, 5 + oy, 2, 2, r[2]); b.rect(12, 7 + oy, 2, 5, r[1]); }
    }
    return;
  }

  if (f === "glatze") {
    const h = R(d.haut);
    if (richtung !== "seite") { b.set(6, 3 + oy, h[3]); b.set(7, 3 + oy, h[3]); }
    if (richtung === "unten") { b.rect(3, 5 + oy, 1, 4, r[1]); b.rect(12, 5 + oy, 1, 4, r[1]); }
    if (richtung === "oben") b.rect(3, 7 + oy, 10, 3, r[1]);
    if (richtung === "seite") b.rect(8, 6 + oy, 4, 4, r[1]);
    return;
  }

  if (f === "kapuze") {
    const k = R(d.kapuze);
    const huelle = (x, y) => {
      if (richtung === "unten") return !(((x + 0.5 - 8) / 4.2) ** 2 + ((y + 0.5 - 8.4) / 3.9) ** 2 <= 1);
      if (richtung === "seite") return !(x < 7 && y > 4.5 && y < 11.5);
      return true;
    };
    b.fuelle(1, 0 + oy, 14, 12 + oy,
      (x, y) => (((x - 8) / 6.4) ** 2 + ((y - oy - 6.6) / 6.2) ** 2 <= 1) && huelle(x, y - oy),
      (x, y) => k[Math.max(0, Math.min(3, Math.floor((0.62 - (x - 8) * 0.05 - (y - oy - 6) * 0.06) * 4 + ((x + y) % 2) * 0.25)))]);
    if (richtung === "unten") { // Haarsträhnen unter der Kapuze
      b.set(5, 5 + oy, r[2]); b.set(6, 5 + oy, r[3]); b.set(9, 5 + oy, r[2]); b.set(10, 5 + oy, r[1]);
    }
    return;
  }

  // Grundfrisur (kurz, lang, lockig, dutt, zopf, spitzhut)
  if (richtung === "unten") {
    ell(8, 5, 5.7, 4.2, (x, y) => y < 5.6 || x < 4.2 || x > 11.8 || (y < 6.6 && (x | 0) % 3 === 0));
  } else if (richtung === "oben") {
    ell(8, 6.6, 5.5, 5.6, () => true);
  } else {
    ell(8, 5.6, 5.4, 4.4, (x, y) => y < 4.4 || x > 7.6 || (y < 5.6 && x > 3.5));
  }
  if (f === "lang" || d.langhaar) {
    if (richtung === "unten") { b.rect(3, 6 + oy, 1, 7, r[2]); b.rect(12, 6 + oy, 1, 7, r[1]); }
    if (richtung === "oben") b.rect(4, 10 + oy, 8, 5, r[2]);
  }
  if (f === "lockig") {
    for (const [x, y] of [[3, 3], [12, 3], [2, 5], [13, 5], [4, 1], [11, 1], [7, 0]]) b.set(x, y + oy, r[(x + y) % 2 ? 1 : 3]);
  }
  if (f === "dutt") {
    const cy = richtung === "oben" ? 4 : 1.6;
    b.kugel(8, cy + oy, 2.6, 2, r, { dither: 0.2 });
    if (richtung !== "oben") b.rect(5, 3 + oy, 6, 1, R(d.akzent)[2]);   // Haarband
  }
  if (f === "spitzhut") hut(b, d, richtung, oy);
}

function hut(b, d, richtung, oy) {
  const h = R(d.hut);
  const band = R(d.hutband)[2];
  b.fuelle(0, 3 + oy, 15, 7 + oy, (x, y) => ((x - 8) / 7.4) ** 2 + ((y - oy - 5.2) / 1.7) ** 2 <= 1,
    (x, y) => h[y - oy < 5 ? 2 : (x + y) % 2 ? 0 : 1]);
  const spitze = richtung === "seite" ? [[3.5, 5], [11.5, 5], [11, 2.2], [13.8, 0], [9, 0.8]] : [[3.8, 5], [12.2, 5], [10, 1.6], [12.6, 0], [8, 0.6]];
  b.poly(spitze.map(([x, y]) => [x, y + oy]), (x) => h[x < 6 ? 3 : x < 9 ? 2 : 1]);
  b.rect(4, 4 + oy, 8, 1, band);
  b.set(6, 2 + oy, "#fff6c0");  // Stern
}

function bart(b, d, richtung, oy) {
  if (!d.bart || richtung === "oben") return;
  const r = R(d.bartfarbe);
  const lang = d.bart === "lang";
  const strähnen = (x, y) => r[Math.max(0, Math.min(3, ((x * 7 + y * 3) % 5 === 0) ? 1 : 2 + ((x + y) % 2) - (y > 13 ? 1 : 0)))];
  if (richtung === "unten") {
    b.fuelle(3, 8 + oy, 13, (lang ? 17 : 14) + oy,
      (x, y) => (((x - 8) / 4.4) ** 2 + ((y - oy - (lang ? 11 : 10.5)) / (lang ? 5.6 : 3.8)) ** 2 <= 1) && y - oy > 8.6, strähnen);
    b.rect(5, 9 + oy, 6, 1, r[2]);   // Schnurrbart
    b.set(7, 10 + oy, r[0]); b.set(8, 10 + oy, r[0]);
  } else {
    b.fuelle(1, 8 + oy, 8, (lang ? 17 : 14) + oy,
      (x, y) => (((x - 4.6) / 3) ** 2 + ((y - oy - (lang ? 11.5 : 10.5)) / (lang ? 5 : 3.4)) ** 2 <= 1) && y - oy > 8.6, strähnen);
  }
}

function koerper(b, d, richtung, bildNr, oy) {
  const k = R(d.kleid);
  const a = R(d.akzent);
  const haut = R(d.haut);
  const armR = d.armeHaut ? haut : k;
  const schwung = bildNr === 1 ? 1 : bildNr === 2 ? -1 : 0;

  if (richtung === "seite") {
    b.zylinder(5, 12 + oy, 6, 6, k);
    b.rect(5, 16 + oy, 6, 1, a[1]);
    if (!d.robe) b.zylinder(5, 17 + oy, 6, 2, k, { hell: -0.3 });
    if (d.schuerze) { const s = R(d.schuerze); b.rect(4, 13 + oy, 2, 7, s[2]); b.set(4, 19 + oy, s[1]); }
    // Arm (vorne), schwingt beim Laufen
    const ax = 7 - schwung;
    b.zylinder(ax, 12 + oy, 2, 4, armR);
    b.rect(ax, 16 + oy, 2, 1, haut[2]);
    return;
  }

  b.zylinder(4, 12 + oy, 8, 5, k);
  if (richtung === "unten") { b.set(7, 12 + oy, haut[1]); b.set(8, 12 + oy, haut[1]); b.set(7, 13 + oy, haut[0]); }
  b.rect(4, 16 + oy, 8, 1, a[1]);
  if (richtung === "unten") { b.set(7, 16 + oy, "#e8c040"); b.set(8, 16 + oy, "#b08020"); }
  if (!d.robe) b.zylinder(4, 17 + oy, 8, 2, k, { hell: -0.25 });
  if (d.schuerze && richtung === "unten") {
    const s = R(d.schuerze);
    b.zylinder(5, 13 + oy, 6, 7, s, { hell: 0.1 });
    b.set(5, 12 + oy, s[1]); b.set(10, 12 + oy, s[1]);
    b.rect(6, 17 + oy, 4, 1, s[1]);
  }
  // Arme
  const links = bildNr === 1 ? -1 : 0, rechts = bildNr === 2 ? -1 : 0;
  b.zylinder(2, 12 + oy + links, 2, 5, armR);
  b.rect(2, 17 + oy + links, 2, 1, haut[2]);
  b.zylinder(12, 12 + oy + rechts, 2, 5, armR, { hell: -0.2 });
  b.rect(12, 17 + oy + rechts, 2, 1, haut[1]);
}

function beine(b, d, richtung, bildNr) {
  const p = R(d.hose);
  const s = R(d.stiefel);
  if (d.robe) {
    const k = R(d.kleid);
    const a = R(d.akzent)[2];
    if (richtung === "seite") {
      b.poly([[5, 17], [11, 17], [12, 23], [4, 23]], (x) => k[x < 7 ? 2 : x < 10 ? 1 : 0]);
      b.rect(4, 22, 8, 1, a);
      if (bildNr !== 2) b.rect(3, 23, 3, 1, s[1]);
      if (bildNr !== 1) b.rect(8, 23, 3, 1, s[0]);
    } else {
      b.poly([[4, 17], [12, 17], [13, 23], [3, 23]], (x, y) => k[x < 6 ? 3 - (y > 20 ? 1 : 0) : x < 10 ? 2 - (y > 21 ? 1 : 0) : 1]);
      b.rect(3, 22, 10, 1, a);
      if (bildNr !== 2) b.rect(5, 23, 2, 1, s[1]);
      if (bildNr !== 1) b.rect(9, 23, 2, 1, s[1]);
    }
    return;
  }
  if (richtung === "seite") {
    if (bildNr === 0 || bildNr === 3) {
      b.zylinder(6, 19, 3, 3, p);
      b.rect(5, 22, 4, 2, s[1]); b.set(5, 22, s[2]);
    } else {
      const vorn = bildNr === 1 ? p : R(toene(d.hose, -1));
      const hinten = bildNr === 1 ? R(toene(d.hose, -1)) : p;
      b.zylinder(9, 19, 2, 2, hinten); b.rect(9, 21, 3, 2, s[0]);
      b.zylinder(4, 19, 2, 3, vorn); b.rect(3, 22, 3, 2, s[1]); b.set(3, 22, s[2]);
    }
    return;
  }
  const hebL = bildNr === 1 ? -1 : 0, hebR = bildNr === 2 ? -1 : 0;
  b.zylinder(5, 19 + hebL, 2, 3, p); b.rect(4, 22 + hebL, 3, 2, s[1]); b.set(4, 22 + hebL, s[2]);
  b.zylinder(9, 19 + hebR, 2, 3, p, { hell: -0.2 }); b.rect(9, 22 + hebR, 3, 2, s[0]); b.set(9, 22 + hebR, s[1]);
}

function ausruestung(b, d, richtung, oy, teil) {
  const e = d.extra;
  if (!e) return;
  const holz = R("#7a5230");
  const metall = R("#b8bcc8");
  if (e === "schwert") {
    if (teil === "hinten" && richtung !== "oben") { b.rect(12, 8 + oy, 1, 4, metall[2]); b.rect(11, 9 + oy, 3, 1, "#d0a030"); }
    if (teil === "vorne" && richtung === "oben") {
      b.linie(4, 19 + oy, 11, 10 + oy, metall[3]); b.linie(5, 19 + oy, 12, 10 + oy, metall[1]);
      b.rect(11, 9 + oy, 3, 1, "#d0a030"); b.rect(12, 7 + oy, 1, 2, holz[1]);
    }
  }
  if (e === "koecher") {
    if (teil === "hinten" && richtung === "unten") { b.rect(12, 8 + oy, 2, 3, holz[2]); b.set(12, 7 + oy, "#e0e0e0"); b.set(13, 7 + oy, "#c04040"); }
    if (teil === "vorne" && richtung === "oben") {
      b.zylinder(9, 11 + oy, 3, 7, holz); b.set(9, 10 + oy, "#e0e0e0"); b.set(10, 9 + oy, "#c04040"); b.set(11, 10 + oy, "#e0e0e0");
    }
    if (teil === "hinten" && richtung === "seite") { b.zylinder(10, 11 + oy, 2, 6, holz); b.set(11, 10 + oy, "#c04040"); }
  }
  if (e === "laute") {
    const lack = R("#b8742a");
    if (teil === "hinten" && richtung === "unten") { b.rect(3, 7 + oy, 1, 5, holz[1]); b.set(3, 6 + oy, holz[0]); }
    if (teil === "vorne" && richtung === "oben") { b.kugel(8, 16 + oy, 3.4, 3.2, lack, { dither: 0.3 }); b.set(8, 16 + oy, "#3a2010"); b.rect(8, 9 + oy, 1, 5, holz[1]); }
    if (teil === "hinten" && richtung === "seite") b.kugel(11, 15 + oy, 2.4, 3, lack);
  }
  if (e === "stab" || e === "wanderstab") {
    const x = richtung === "seite" ? 3 : richtung === "unten" ? 14 : 1;
    if ((teil === "vorne") === (richtung !== "oben")) {
      b.rect(x, 7 + oy, 1, 16 - oy, holz[e === "stab" ? 1 : 2]);
      if (e === "stab") { b.kugel(x + 0.5, 6 + oy, 1.6, 1.6, R("#40c8f0")); b.set(x, 5 + oy, "#ffffff"); }
      else { b.rect(x - 1, 6 + oy, 2, 2, holz[1]); b.set(x - 1, 6 + oy, holz[3]); }
    }
  }
  if (e === "buch" && teil === "vorne" && richtung === "unten") {
    b.rect(11, 15 + oy, 4, 3, "#8a2a2a"); b.rect(12, 15 + oy, 2, 1, "#f0e0b0"); b.set(11, 15 + oy, "#e6c45a");
  }
}

/** Zeichnet eine Figur in einer Richtung und einem Animationsbild. */
export function figurBild(d, richtung, bildNr) {
  const b = new Bild(SPRITE_B, SPRITE_H);
  const oy = bildNr === 3 ? 1 : 0;   // atmen: Kopf/Körper 1 Pixel tiefer
  haare(b, d, richtung, oy, "hinten");
  ausruestung(b, d, richtung, oy, "hinten");
  beine(b, d, richtung, bildNr);
  koerper(b, d, richtung, bildNr, oy);
  kopf(b, d, richtung, oy);
  haare(b, d, richtung, oy, "vorne");
  bart(b, d, richtung, oy);
  ausruestung(b, d, richtung, oy, "vorne");
  b.umriss(null, { staerke: 0.32 });
  return b;
}

/** Spritesheet: Zeilen = Richtungen (unten, oben, seite), Spalten = Bilder 0–3. */
export function figurBlatt(d) {
  const blatt = new Bild(SPRITE_B * BILDER_PRO_RICHTUNG, SPRITE_H * RICHTUNGEN.length);
  RICHTUNGEN.forEach((r, zeile) => {
    for (let n = 0; n < BILDER_PRO_RICHTUNG; n++) blatt.ueber(figurBild(d, r, n), n * SPRITE_B, zeile * SPRITE_H);
  });
  return blatt;
}

// ---------- Der Torwächter (Boss, 32×40) ----------

export function torwaechterBild(gluehen = 0) {
  const b = new Bild(32, 40);
  const stein = R("#6e6a88");
  const dunkelstein = R("#4a4660");
  const rune = gluehen ? "#a8f4ff" : "#58d8f0";
  // Stab
  b.rect(27, 8, 2, 32, R("#6b4a2a")[1]); b.rect(27, 8, 1, 32, R("#6b4a2a")[2]);
  b.kugel(28, 6, 3.2, 3.2, R(gluehen ? "#7fe8ff" : "#40c8f0"), { dither: 0.2 });
  b.set(27, 5, "#ffffff");
  // Mantel
  b.poly([[5, 39], [9, 14], [23, 14], [27, 39]], (x, y) => stein[Math.min(3, Math.max(0, Math.floor(3.3 - (x - 5) / 7.5 + ((x + y) % 2) * 0.3)))]);
  b.poly([[11, 39], [13, 18], [19, 18], [21, 39]], (x) => dunkelstein[x < 16 ? 2 : 1]);
  // Schultern
  b.kugel(9, 16, 4, 3, stein); b.kugel(23, 16, 4, 3, stein, { hell: -0.3 });
  // Kapuze
  b.kugel(16, 10, 7.5, 7.5, dunkelstein, { dither: 0.4 });
  b.ellipse(16, 12, 4.5, 4, "#100e18");
  // Augen
  b.rect(13, 11, 2, 2, rune); b.rect(18, 11, 2, 2, rune);
  if (gluehen) { b.set(12, 11, "#2a6878"); b.set(20, 11, "#2a6878"); }
  // Runen auf dem Mantel
  for (const [x, y] of [[15, 21], [16, 21], [15, 22], [16, 25], [15, 28], [16, 28], [16, 31], [15, 34], [16, 34]]) b.set(x, y, rune);
  for (const [x, y] of [[12, 24], [20, 24], [12, 30], [20, 30]]) b.rect(x, y, 1, 2, "#e6c45a");
  // Hand am Stab
  b.kugel(26, 20, 2.6, 2.2, stein);
  b.umriss(null, { staerke: 0.3 });
  return b;
}
