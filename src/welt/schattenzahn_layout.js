// Feste Schattenzahn – Raster und Bodenhöhen (wird hier erzeugt).
// Von Süden nach Norden geht es immer tiefer hinab:
//   Vorhof (draußen, Höhe 0) → Burgtor → Treppe hinab
//   → Dungeon des Hörens (−4) → Tor → Treppe → Katakomben des Lesens (−8) → Tor → Treppe
//   → Grotte der Schreiber (−12) → Tor → Treppe → Kaverne der Stimmen (−16) mit dem Lavasee im Norden.
// Jedes Tor steht oben an seiner Treppe, im Durchgang am Nordende der Ebene darüber.
//
// Zeichen: "#" Fels/Mauer  "_" Boden  "=" Treppe/Durchgang  "~" Lava (tödlich, gesperrt)
//          Deko, die blockiert: "Z" Zelle/Gitter  "K" Kiste/Fass  "N" Knochennische  "P" Schreibpult  "S" Stalagmit/Fels  "F" Lagerfeuer

export const BREITE = 40;
export const GANG = [19, 20];
export const TREPPE_LAENGE = 5;
export const TIEFE = 4;          // Höhenunterschied zwischen zwei Ebenen

/** Die Ebenen von oben (draußen) nach unten */
export const EBENEN = [
  { id: "vorhof", name: "Vor der Feste Schattenzahn", tiefe: 20, x0: 3, x1: 36 },
  { id: "hoeren", name: "Das Dungeon des Hörens", tiefe: 9, x0: 10, x1: 29 },
  { id: "lesen", name: "Die Katakomben des Lesens", tiefe: 9, x0: 9, x1: 30 },
  { id: "schreiben", name: "Die Grotte der Schreiber", tiefe: 10, x0: 8, x1: 31 },
  { id: "sprechen", name: "Die Kaverne der Stimmen", tiefe: 16, x0: 5, x1: 34 },
];

/** Deko je Ebene: [Zeichen, x, Zeile ab Ebenenbeginn (von Norden), Breite, Tiefe] */
const DEKO = {
  vorhof: [["K", 6, 4, 2, 2], ["K", 32, 5, 2, 1], ["S", 9, 9, 1, 1], ["S", 30, 10, 1, 1], ["F", 19, 13, 2, 2], ["S", 5, 15, 1, 1], ["S", 34, 14, 1, 1]],
  hoeren: [["Z", 10, 0, 3, 3], ["Z", 27, 0, 3, 3], ["Z", 10, 5, 3, 3], ["Z", 27, 5, 3, 3]],
  lesen: [["N", 9, 1, 1, 6], ["N", 30, 1, 1, 6], ["K", 12, 7, 2, 1], ["K", 26, 1, 2, 1]],
  schreiben: [["P", 11, 2, 2, 1], ["P", 11, 6, 2, 1], ["P", 26, 2, 2, 1], ["P", 26, 6, 2, 1], ["S", 15, 8, 1, 1], ["S", 24, 0, 1, 1]],
  sprechen: [["S", 7, 13, 1, 1], ["S", 31, 12, 1, 1], ["S", 10, 9, 1, 1], ["S", 29, 9, 1, 1]],
};

function bauen() {
  const zeilen = [];
  const voll = (z) => Array(BREITE).fill(z);
  const ebenen = [], treppen = [], tore = [];
  zeilen.push(voll("#"));
  for (let i = EBENEN.length - 1; i >= 0; i--) {
    const e = EBENEN[i];
    const y0 = zeilen.length;
    for (let k = 0; k < e.tiefe; k++) {
      const z = voll("#");
      for (let x = e.x0; x <= e.x1; x++) z[x] = "_";
      zeilen.push(z);
    }
    for (const [c, x, oy, w, h] of DEKO[e.id]) for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) zeilen[y0 + oy + yy][x + xx] = c;
    if (e.id === "sprechen") {
      // Lavasee im Norden der Kaverne, davor ein Felsvorsprung
      for (let yy = 0; yy < 6; yy++) for (let x = e.x0; x <= e.x1; x++) {
        const rand = Math.abs(x - (e.x0 + e.x1) / 2) / ((e.x1 - e.x0) / 2);
        if (yy <= 3 || (yy <= 5 && rand > 0.45) || rand > 0.86) zeilen[y0 + yy][x] = "~";
      }
    }
    ebenen[i] = { ...e, nr: i, y0, y1: zeilen.length - 1, h: -i * TIEFE };
    if (i === 0) break;
    // Tor zur Ebene i (oben an der Treppe, auf Höhe der Ebene i-1) – die Treppe führt nach Norden hinab
    // Achtung: Wir bauen von Norden nach Süden. Die Ebene darüber (i-1) liegt südlich.
    const t0 = zeilen.length;
    for (let k = 0; k < TREPPE_LAENGE; k++) {
      const z = voll("#");
      for (const x of GANG) z[x] = "=";
      zeilen.push(z);
    }
    treppen[i] = { y0: t0, y1: zeilen.length - 1, unten: -i * TIEFE, oben: -(i - 1) * TIEFE };
    const torZeile = voll("#");
    for (const x of GANG) torZeile[x] = "=";
    tore[i] = { x: GANG[0], y: zeilen.length };
    zeilen.push(torZeile);
  }
  zeilen.push(voll("#"));
  return { raster: zeilen.map((z) => z.join("")), ebenen, treppen, tore };
}

const GEBAUT = bauen();
export const RASTER = GEBAUT.raster;
export const EBENEN_POS = GEBAUT.ebenen;   // je Ebene: { id, name, nr, y0, y1, h, x0, x1 }
export const TREPPEN = GEBAUT.treppen;     // TREPPEN[i]: von Ebene i-1 (Süden, oben) hinab zu Ebene i
export const TORE = GEBAUT.tore;           // TORE[i]: Tor oben an der Treppe hinab zu Ebene i

export const BLOCKIERT = new Set(["#", "~", "Z", "K", "N", "P", "S", "F"]);

/** Bodenhöhe an einer Kachelzeile (Zeilenmitte = ty + 0.5); auf Treppen stufenlos. */
export function hoeheBeiZeile(zeile) {
  const vorhof = EBENEN_POS[0];
  if (zeile > vorhof.y1) return 0;
  for (const e of EBENEN_POS) if (zeile >= e.y0 && zeile < e.y1 + 1) return e.h;
  for (let i = 1; i < TREPPEN.length; i++) {
    const t = TREPPEN[i];
    // Torzeile (südlich der Treppe) liegt auf der oberen Höhe
    if (zeile >= t.y1 + 1 && zeile < t.y1 + 2) return t.oben;
    if (zeile >= t.y0 && zeile < t.y1 + 1) {
      const u = (t.y1 + 1 - zeile) / (t.y1 + 1 - t.y0);    // 0 oben (Süden) … 1 unten (Norden)
      return t.oben + (t.unten - t.oben) * u;
    }
  }
  return EBENEN_POS[EBENEN_POS.length - 1].h;
}

/** Zu welcher Ebene gehört eine Zeile? (Treppen und Torzeilen: die untere) */
export function ebeneBeiZeile(zeile) {
  for (const e of EBENEN_POS) if (zeile >= e.y0 && zeile <= e.y1) return e.nr;
  for (let i = 1; i < TREPPEN.length; i++) if (zeile >= TREPPEN[i].y0 && zeile <= TREPPEN[i].y1 + 1) return i;
  return zeile > EBENEN_POS[0].y1 ? 0 : EBENEN_POS.length - 1;
}
