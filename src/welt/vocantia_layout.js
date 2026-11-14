// Vocantia – das Bergdorf im Schweigen (Raster wird hier erzeugt).
// Ein Tal zwischen hohen Bergen. Süden: Portal · Mitte: Dorfplatz mit gefrorenem Brunnen (Großmutter Runa)
// Westen: Langhalle der Dinge (Torvald) und Marktstände (Brynja) · Südwesten: Weide (Eik)
// Nordosten: rundes Ratshaus (Halvar) · Südosten: gefrorener See mit Bühne (Sigrun)
// Norden: Bergpfad hinauf zum Plateau mit dem Eisthron des Schweigekönigs.
//
// Zeichen: "#" Berg  "_" Schnee/Weg  "H" Haus  "L" Langhalle  "R" Ratshaus  "T" Tanne  "~" See  "F" Brunnen  "S" Fels  "Z" Zaun

export const BREITE = 48;
export const HOEHE = 44;
export const SEE = { cx: 37.5, cy: 34, rx: 7.5, ry: 5 };

function bauen() {
  const r = Array.from({ length: HOEHE }, () => Array(BREITE).fill("#"));
  const setze = (x0, y0, x1, y1, z) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (r[y]?.[x] !== undefined) r[y][x] = z; };
  // Tal, Bergpfad, Gipfelplateau
  setze(4, 12, 43, 42, "_");
  setze(2, 16, 4, 38, "_");
  setze(22, 7, 25, 12, "_");
  setze(17, 2, 30, 7, "_");
  // See im Südosten
  for (let y = 0; y < HOEHE; y++) for (let x = 0; x < BREITE; x++) {
    if (((x + 0.5 - SEE.cx) / SEE.rx) ** 2 + ((y + 0.5 - SEE.cy) / SEE.ry) ** 2 <= 1) r[y][x] = "~";
  }
  // Gebäude
  setze(5, 13, 13, 17, "L");                    // Langhalle der Dinge
  setze(34, 13, 39, 17, "R");                   // Ratshaus
  for (const [x0, y0, x1, y1] of [[16, 13, 19, 16], [28, 13, 31, 16], [6, 21, 9, 24], [40, 20, 43, 23], [11, 32, 14, 35], [17, 35, 20, 38], [27, 38, 30, 41]]) setze(x0, y0, x1, y1, "H");
  setze(23, 23, 24, 24, "F");                    // gefrorener Brunnen
  // Zaun der Weide im Südwesten
  for (let x = 4; x <= 10; x++) { r[34][x] = "Z"; }
  for (let y = 34; y <= 41; y++) r[y][10] = "Z";
  r[37][10] = "_"; r[38][10] = "_";
  // Tannen am Rand
  for (const [x, y] of [[4, 19], [5, 27], [12, 20], [15, 28], [33, 21], [42, 27], [41, 12], [6, 40], [16, 41], [33, 41], [42, 41], [26, 18], [20, 26], [32, 26], [18, 4], [29, 4], [20, 12], [27, 12]]) r[y][x] = "T";
  // Felsen
  for (const [x, y] of [[17, 6], [30, 6], [44, 31], [4, 31], [22, 12], [25, 12]]) r[y][x] = "S";
  return r.map((z) => z.join(""));
}

export const RASTER = bauen();

export const HINDERNIS = { "#": 14, H: 5, L: 6, R: 6, T: 7, "~": 0.2, F: 1.6, S: 2.2, Z: 1 };
export const BLOCKIERT = new Set(["#", "H", "L", "R", "T", "~", "F", "S", "Z"]);

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
