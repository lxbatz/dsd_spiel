// Aurelia – Stadtplan der Hafenstadt der Glocken (Raster wird hier erzeugt).
// Norden (oben): Akropolis mit Glockenturm · Mitte: Agora mit Säulenhallen und Brunnen
// Westen: Stadttor mit Portal, Werft am Wasser · Osten: Leuchtturm auf einer Landzunge
// Süden: Kai mit fünf Stegen, dahinter das Meer.
//
// Zeichen: "_" Pflaster  "." Sand/Kai-Rand  "=" Holzsteg  "~" Meer  "W" Stadtmauer
//          "H" Haus  "G" Glockenturm  "L" Leuchtturm  "C" Säule  "T" Zypresse  "O" Olivenbaum

export const BREITE = 48;
export const HOEHE = 40;
export const KAI_Y = 29;          // erste Meereszeile
export const STEGE = [4, 13, 22, 31, 38].map((x, i) => ({ nr: i + 1, x, y0: KAI_Y, y1: KAI_Y + 6 }));

function bauen() {
  const r = Array.from({ length: HOEHE }, () => Array(BREITE).fill("_"));
  const setze = (x0, y0, x1, y1, z) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (r[y]?.[x] !== undefined) r[y][x] = z; };

  // Meer im Süden und Osten
  setze(0, KAI_Y, BREITE - 1, HOEHE - 1, "~");
  setze(42, 11, BREITE - 1, KAI_Y, "~");
  // Kai-Rand aus Sand und Stein
  setze(0, KAI_Y - 1, 41, KAI_Y - 1, ".");
  // Landzunge mit Leuchtturm
  setze(41, 15, 46, 19, "_");
  setze(44, 16, 45, 17, "L");
  // Stege
  for (const s of STEGE) setze(s.x, s.y0, s.x + 1, s.y1, "=");
  // Stadtmauer im Norden und Westen (mit Tor im Westen bei y 18–20)
  setze(0, 0, BREITE - 1, 0, "W");
  setze(0, 0, 0, KAI_Y - 1, "W");
  r[18][0] = r[19][0] = r[20][0] = "_";
  setze(BREITE - 1, 0, BREITE - 1, 10, "W");

  // Akropolis mit Glockenturm und Tempelsäulen
  setze(22, 3, 25, 6, "G");
  for (let x = 18; x <= 29; x += 3) { r[2][x] = "C"; r[8][x] = "C"; }
  for (const y of [4, 6]) { r[y][18] = "C"; r[y][29] = "C"; }
  // Agora: Säulenhallen (Stoa) im Norden und Süden, Wege frei lassen
  for (let x = 15; x <= 32; x += 3) { if (x < 22 || x > 25) { r[11][x] = "C"; r[22][x] = "C"; } }

  // Häuserblöcke (weiß gekalkt, Ziegeldächer)
  const haeuser = [
    [3, 3, 8, 7], [10, 3, 14, 6], [33, 3, 38, 7], [40, 3, 45, 7],
    [3, 11, 8, 15], [34, 11, 39, 14],
    [3, 22, 7, 25], [11, 24, 15, 26], [34, 22, 39, 25], [27, 24, 31, 26],
  ];
  for (const [x0, y0, x1, y1] of haeuser) setze(x0, y0, x1, y1, "H");

  // Bäume: Zypressen an der Akropolis und an der Mauer, Olivenbäume auf den Plätzen
  for (const [x, y] of [[16, 3], [16, 6], [31, 3], [31, 6], [2, 9], [12, 9], [36, 9], [45, 9], [10, 20], [37, 18], [40, 21]]) r[y][x] = "T";
  for (const [x, y] of [[12, 13], [33, 17], [13, 19], [19, 25], [25, 25]]) r[y][x] = "O";
  return r.map((z) => z.join(""));
}

export const RASTER = bauen();

export const HINDERNIS = { W: 3.2, H: 7, G: 16, L: 14, C: 5, T: 6, O: 3.5 };
export const BLOCKIERT = new Set(["~", ...Object.keys(HINDERNIS)]);

/** Zusammenhängende Rechtecke eines Zeichens (z. B. alle Häuser). */
export function bloecke(raster, zeichen) {
  const gesehen = new Set(), liste = [];
  raster.forEach((zeile, y) => [...zeile].forEach((c, x) => {
    if (c !== zeichen || gesehen.has(`${x},${y}`)) return;
    let x1 = x, y1 = y;
    while (raster[y][x1 + 1] === zeichen) x1++;
    while (raster[y1 + 1]?.[x] === zeichen) y1++;
    for (let yy = y; yy <= y1; yy++) for (let xx = x; xx <= x1; xx++) gesehen.add(`${xx},${yy}`);
    liste.push({ x, y, w: x1 - x + 1, h: y1 - y + 1 });
  }));
  return liste;
}
