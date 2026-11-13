// Scriptoria – der verwunschene Bücherwald (Raster wird hier erzeugt).
// Dichter Wald ("#"), in den Lichtungen und Pfade geschnitten sind. Der Schwarze Nebel versperrt die Pfade
// zwischen den Lichtungen (Objekte in scriptoria.js) und weicht nach jeder gelösten Quest zurück.
//
//   Süden: Eingang mit Portal · Mitte: Lichtung mit dem Großen Lesebaum (Mentorin Lirien)
//   Westen: Briefbaum (Quest 1) · Nordwesten: Lesekreis (Quest 2) · Osten: Nachtpfad mit Aushang (Quest 3)
//   Nordosten: Lehrlingshaus (Quest 4) · Norden: Kreuzung der Wegweiser (Quest 5)
//   ganz im Norden: Eingang zur unterirdischen Bibliothek (Bibliothekar der Schatten)
//
// Zeichen: "#" Wald (Dickicht)  "_" Moos/Pfad  "B" Riesenbaum  "L" Großer Lesebaum  "R" Bücherregal
//          "P" Riesenpilze  "S" Felsen/Hügel

export const BREITE = 44;
export const HOEHE = 44;

/** Lichtungen (x0, y0, x1, y1) */
export const LICHTUNGEN = {
  eingang: [17, 35, 27, 42],
  mitte: [13, 17, 31, 30],
  west: [2, 21, 11, 31],
  nordwest: [2, 6, 12, 15],
  ost: [33, 21, 41, 31],
  nordost: [32, 6, 41, 15],
  nord: [16, 7, 28, 12],
  tiefe: [17, 1, 27, 4],
};

/** Pfade zwischen den Lichtungen; nebel: Index des Nebels, der den Pfad versperrt (null = frei) */
export const PFADE = [
  { rechteck: [21, 30, 23, 35], nebel: null },          // Eingang → Mitte
  { rechteck: [11, 23, 13, 25], nebel: null },          // Mitte → West
  { rechteck: [6, 15, 8, 21], nebel: 0, tor: [6, 18, 3, 1] },   // West → Nordwest
  { rechteck: [31, 23, 33, 25], nebel: 1, tor: [32, 23, 1, 3] }, // Mitte → Ost
  { rechteck: [36, 15, 38, 21], nebel: 2, tor: [36, 18, 3, 1] }, // Ost → Nordost
  { rechteck: [21, 12, 23, 17], nebel: 3, tor: [21, 14, 3, 1] }, // Mitte → Nord
  { rechteck: [21, 4, 23, 7], nebel: 4, tor: [21, 5, 3, 1] },    // Nord → Tiefe
];

function bauen() {
  const r = Array.from({ length: HOEHE }, () => Array(BREITE).fill("#"));
  const setze = (x0, y0, x1, y1, z) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (r[y]?.[x] !== undefined) r[y][x] = z; };
  for (const [x0, y0, x1, y1] of Object.values(LICHTUNGEN)) setze(x0, y0, x1, y1, "_");
  for (const p of PFADE) setze(...p.rechteck, "_");

  // Der Große Lesebaum in der Mitte, Regale im Halbkreis darum
  setze(20, 19, 23, 22, "L");
  for (const [x, y] of [[16, 18], [17, 18], [26, 18], [27, 18], [15, 21], [15, 22], [28, 21], [28, 22]]) r[y][x] = "R";
  // Riesenbäume in den Lichtungen
  for (const [x, y] of [[14, 27], [29, 27], [14, 17], [29, 17], [4, 23], [9, 29], [3, 8], [10, 14], [39, 23], [34, 29], [40, 8], [33, 14], [17, 8], [26, 8], [18, 37], [25, 38]]) setze(x, y, x + 1, y + 1, "B");
  // Bücherregale am Rand der Lichtungen
  const regale = [
    [3, 26, 3, 28], [10, 22, 10, 24],                // West
    [4, 11, 6, 11], [8, 11, 10, 11],                 // Nordwest (Lesekreis)
    [40, 26, 40, 28], [34, 22, 36, 22],              // Ost
    [34, 10, 36, 10], [38, 10, 40, 10],              // Nordost
    [17, 11, 19, 11], [25, 11, 27, 11],              // Nord
    [18, 3, 19, 3], [25, 3, 26, 3],                  // Tiefe
  ];
  for (const [x0, y0, x1, y1] of regale) setze(x0, y0, x1, y1, "R");
  // Riesenpilze
  for (const [x, y] of [[12, 28], [30, 19], [5, 30], [11, 7], [41, 30], [41, 15], [16, 10], [19, 41], [26, 36]]) r[y][x] = "P";
  // Felsiger Hügel über dem Eingang zur unterirdischen Bibliothek
  setze(17, 0, 27, 0, "S");
  return r.map((z) => z.join(""));
}

export const RASTER = bauen();

export const HINDERNIS = { "#": 8, B: 30, L: 30, R: 2.8, P: 2.5, S: 6 };
export const BLOCKIERT = new Set(Object.keys(HINDERNIS));

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
