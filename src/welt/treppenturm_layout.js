// Turm der Tausend Treppen (Lythara, Quest 1) – Raster und Höhen werden hier erzeugt.
// Sechs Etagen übereinander, verbunden durch gerade Treppen. Von Süden (unten) nach Norden (oben):
//   0 Keller (Eingang, Lyra) → Tor des Themas → 1 Kammern des Gesindes → Tor der Quellen
//   → 2 Waffenkammer der Ritter → Tor des Interesses → 3 Bankettsaal → Tor der Leser
//   → 4 Gemächer der Burgherren → Tor der Überschrift → 5 Das Observatorium (Pult, Torwächter, Siegel)
// Jedes Tor steht oben an seiner Treppe, im Durchgang zur nächsten Etage.
//
// Zeichen: "#" Mauer  "_" Boden  "=" Treppe/Durchgang  Möbel (blockieren): "F" Fass "K" Kiste "W" Ständer/Regal
//          "B" Bett "T" Tisch "R" Rüstung "S" Schrank "O" Fernrohr "G" Himmelsglobus "A" Amboss

export const BREITE = 30;
export const X0 = 6, X1 = 23;            // Innenraum der Etagen
export const GANG = [14, 15];            // Treppe und Tor (zwei Kacheln breit)
export const EBENE_H = 3.2;              // Höhenunterschied zwischen zwei Etagen
export const TREPPE_LAENGE = 5;

export const ETAGEN = [
  { id: "keller", name: "Der Keller", tiefe: 9 },
  { id: "gesinde", name: "Die Kammern des Gesindes", tiefe: 7 },
  { id: "waffen", name: "Die Waffenkammer der Ritter", tiefe: 7 },
  { id: "bankett", name: "Der Bankettsaal", tiefe: 7 },
  { id: "gemaecher", name: "Die Gemächer der Burgherren", tiefe: 7 },
  { id: "observatorium", name: "Das Observatorium", tiefe: 9 },
];

/** Möbel je Etage: [Zeichen, x, Zeile ab Etagenbeginn, Breite, Tiefe] */
const MOEBEL = {
  keller: [["F", 7, 1, 2, 2], ["F", 21, 1, 2, 2], ["W", 7, 4, 1, 3], ["K", 21, 6, 2, 2]],
  gesinde: [["B", 7, 1, 3, 1], ["B", 7, 4, 3, 1], ["T", 19, 2, 3, 2], ["K", 22, 5, 1, 1]],
  waffen: [["W", 7, 1, 1, 4], ["W", 22, 1, 1, 4], ["R", 9, 5, 1, 1], ["R", 20, 5, 1, 1], ["A", 19, 2, 1, 1]],
  bankett: [["T", 8, 1, 2, 5], ["T", 20, 1, 2, 5]],
  gemaecher: [["B", 7, 1, 3, 3], ["S", 21, 1, 2, 1], ["T", 20, 4, 2, 1]],
  observatorium: [["O", 19, 1, 3, 3], ["G", 8, 1, 2, 2], ["G", 20, 6, 2, 2]],
};

/**
 * Baut das Raster von oben (Norden) nach unten (Süden).
 * Liefert raster, die Zeilen jeder Etage und der Treppen, und die Position der Tore.
 */
function bauen() {
  const zeilen = [];
  const voll = (z) => Array(BREITE).fill(z);
  const etagen = [], treppen = [], tore = [];
  zeilen.push(voll("#"));                                       // Außenmauer oben (Siegel)
  for (let i = ETAGEN.length - 1; i >= 0; i--) {
    const e = ETAGEN[i];
    const y0 = zeilen.length;
    for (let k = 0; k < e.tiefe; k++) {
      const z = voll("#");
      for (let x = X0; x <= X1; x++) z[x] = "_";
      zeilen.push(z);
    }
    for (const [c, x, oy, w, h] of MOEBEL[e.id]) for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) zeilen[y0 + oy + yy][x + xx] = c;
    etagen[i] = { ...e, nr: i, y0, y1: zeilen.length - 1, h: i * EBENE_H };
    if (i === 0) break;
    // Durchgang mit Tor zur Etage i (oben an der Treppe), dann die Treppe hinunter zur Etage i - 1
    const torZeile = voll("#");
    for (const x of GANG) torZeile[x] = "=";
    tore[i] = { x: GANG[0], y: zeilen.length };
    zeilen.push(torZeile);
    const t0 = zeilen.length;
    for (let k = 0; k < TREPPE_LAENGE; k++) {
      const z = voll("#");
      for (const x of GANG) z[x] = "=";
      zeilen.push(z);
    }
    treppen[i] = { y0: t0, y1: zeilen.length - 1, oben: i * EBENE_H, unten: (i - 1) * EBENE_H };
  }
  zeilen.push(voll("#"));                                       // Außenmauer unten
  return { raster: zeilen.map((z) => z.join("")), etagen, treppen, tore };
}

const GEBAUT = bauen();
export const RASTER = GEBAUT.raster;
export const ETAGEN_POS = GEBAUT.etagen;      // je Etage: { id, name, nr, y0, y1, h }
export const TREPPEN = GEBAUT.treppen;        // TREPPEN[i] führt von Etage i-1 hinauf zu Etage i
export const TORE = GEBAUT.tore;              // TORE[i]: Tor oben an der Treppe zu Etage i

export const BLOCKIERT = new Set(["#", "F", "K", "W", "B", "T", "R", "S", "O", "G", "A"]);

/** Bodenhöhe an einer Kachelzeile (Zeilenmitte = ty + 0.5); auf Treppen stufenlos. */
export function hoeheBeiZeile(zeile) {
  const oben = ETAGEN_POS[ETAGEN_POS.length - 1];
  if (zeile < oben.y0) return oben.h;                         // Außenmauer oben mit der Siegeltür
  for (const e of ETAGEN_POS) if (zeile >= e.y0 && zeile <= e.y1 + 1) return e.h;
  for (let i = 1; i < TREPPEN.length; i++) {
    const t = TREPPEN[i];
    if (!t) continue;
    // Torzeile (direkt über der Treppe) liegt auf der oberen Höhe
    if (zeile >= t.y0 - 1 && zeile < t.y0) return t.oben;
    if (zeile >= t.y0 && zeile <= t.y1 + 1) {
      const u = (zeile - t.y0) / (t.y1 + 1 - t.y0);      // 0 oben … 1 unten
      return t.oben + (t.unten - t.oben) * u;
    }
  }
  return 0;
}

/** Zu welcher Etage gehört eine Zeile? (auf Treppen: die obere) */
export function etageBeiZeile(zeile) {
  if (zeile < ETAGEN_POS[ETAGEN_POS.length - 1].y0) return ETAGEN_POS.length - 1;
  for (const e of ETAGEN_POS) if (zeile >= e.y0 && zeile <= e.y1) return e.nr;
  for (let i = 1; i < TREPPEN.length; i++) if (TREPPEN[i] && zeile >= TREPPEN[i].y0 - 1 && zeile <= TREPPEN[i].y1) return i - 0.5;
  return 0;
}
