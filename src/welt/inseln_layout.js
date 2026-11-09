// Die Inseln der Stimmen: Form und Lage der schwebenden Inseln, Brücken und Hindernisse.
// Reine Daten (ohne Grafik), damit Spiellogik (turm.js) und 3D-Bau (grafik3d/inseln3d.js)
// dieselbe Form benutzen. 1 Kachel = 2 Welteinheiten.
//
// Zeichen im Raster:
//   " " Abgrund (nicht begehbar)   "_" Inselboden   "b" Brücke (gesperrt, bis sie erscheint)
//   "w" Wasser   "R" Felsen   "T" Baum   "p" Säule   "S" Waage   "F" Fernrohr   "O" Planetenmodell   "L" Laterne

export const BREITE = 46;
export const HOEHE = 95;

// Spalte, in der alle Brücken laufen (2 Kacheln breit: BX und BX + 1)
export const BX = 22;

/** Die Inseln von unten (Ankunft) nach oben (Insel des Siegels). */
export const INSEL_FORMEN = [
  { id: "ankunft", thema: "ankunft", cx: 23, cy: 87, rx: 7, ry: 5 },
  { id: "q2", thema: "echos", cx: 17, cy: 68, rx: 9.5, ry: 7.2 },
  { id: "q3", thema: "erinnerungen", cx: 29, cy: 48, rx: 9.5, ry: 7.2 },
  { id: "q4", thema: "waage", cx: 17, cy: 28, rx: 9.5, ry: 7.2 },
  { id: "q5", thema: "siegel", cx: 23, cy: 9, rx: 9.5, ry: 7 },
];

/** Unregelmäßiger Rand: Faktor für den Radius in Richtung des Winkels w. */
export function randFaktor(insel, w) {
  return 1 + 0.07 * Math.sin(3 * w + insel.cx) + 0.05 * Math.sin(5 * w + insel.cy * 0.7) + 0.03 * Math.sin(9 * w + insel.cx * 1.3);
}

/** < 1 innerhalb der Insel. x, y in Kachelkoordinaten (Kachelmitte = tx + 0.5). */
export function inselMass(insel, x, y) {
  const dx = (x - insel.cx) / insel.rx, dy = (y - insel.cy) / insel.ry;
  return Math.hypot(dx, dy) / randFaktor(insel, Math.atan2(dy, dx));
}

const istInnen = (insel, tx, ty) => inselMass(insel, tx + 0.5, ty + 0.5) < 1;

/** Hindernisse und Objektplätze je Insel (Kachelkoordinaten). */
function plaetze(insel) {
  const { cx, cy } = insel;
  const r = Math.round;
  if (insel.thema === "ankunft") {
    return {
      deko: [["R", r(cx - 6), r(cy - 1)], ["R", r(cx + 5), r(cy + 2)], ["L", r(cx - 3), r(cy - 3)], ["L", r(cx + 4), r(cy - 3)]],
    };
  }
  if (insel.thema === "siegel") {
    return {
      kristalle: [[r(cx - 7), r(cy + 2)], [r(cx + 6), r(cy + 2)], [r(cx - 6), r(cy - 3)]],
      pult: [r(cx + 5), r(cy - 3)],
      deko: [["O", r(cx - 4), r(cy + 4)], ["O", r(cx - 3), r(cy + 4)], ["F", r(cx + 4), r(cy + 4)], ["L", r(cx - 3), r(cy - 5)], ["L", r(cx + 3), r(cy - 5)]],
    };
  }
  // Inseln 2–4: Stationen auf der Seite, die von der Brücke weg liegt
  const s = BX + 1 > cx ? -1 : 1;
  const x = (d) => r(cx + s * d);
  const p = {
    kristalle: [[x(6), r(cy + 2)], [x(1), r(cy + 4)], [x(6), r(cy - 3)]],
    pult: [x(1), r(cy - 4)],
    deko: [],
  };
  if (insel.thema === "echos") {
    for (let dx = 2; dx <= 4; dx++) for (let dy = -1; dy <= 1; dy++) p.deko.push(["w", x(dx), r(cy + dy)]);
    p.deko.push(["R", x(8), r(cy - 1)], ["R", x(3), r(cy + 3)], ["R", x(-1), r(cy - 2)]);
  }
  if (insel.thema === "erinnerungen") {
    p.deko.push(["T", x(3), r(cy)], ["T", x(4), r(cy)], ["T", x(3), r(cy - 1)], ["T", x(4), r(cy - 1)]);
    p.deko.push(["T", x(8), r(cy - 1)], ["T", x(-2), r(cy + 4)], ["L", x(-1), r(cy - 2)], ["L", x(5), r(cy + 3)]);
  }
  if (insel.thema === "waage") {
    p.deko.push(["S", x(3), r(cy)], ["S", x(4), r(cy)], ["S", x(3), r(cy - 1)], ["S", x(4), r(cy - 1)]);
    // Säulenkranz am Rand (nicht auf dem Weg der Brücke)
    for (let i = 0; i < 10; i++) {
      const w = (i / 10) * Math.PI * 2 + 0.3;
      const f = 0.8 * randFaktor(insel, w);
      p.deko.push(["p", Math.floor(cx + Math.cos(w) * insel.rx * f), Math.floor(cy + Math.sin(w) * insel.ry * f)]);
    }
  }
  return p;
}

function bauen() {
  const raster = Array.from({ length: HOEHE }, () => Array(BREITE).fill(" "));
  for (const insel of INSEL_FORMEN) {
    for (let ty = 0; ty < HOEHE; ty++) for (let tx = 0; tx < BREITE; tx++) if (istInnen(insel, tx, ty)) raster[ty][tx] = "_";
  }

  // Brücken zwischen aufeinanderfolgenden Inseln (von unten nach oben)
  const bruecken = [];
  for (let i = 0; i < INSEL_FORMEN.length - 1; i++) {
    const unten = INSEL_FORMEN[i], oben = INSEL_FORMEN[i + 1];
    let y0 = Infinity, y1 = -Infinity;
    for (const tx of [BX, BX + 1]) {
      for (let ty = oben.cy; ty <= unten.cy; ty++) {
        if (istInnen(oben, tx, ty) || istInnen(unten, tx, ty)) continue;
        raster[ty][tx] = "b";
        y0 = Math.min(y0, ty); y1 = Math.max(y1, ty);
      }
    }
    bruecken.push({ von: unten.id, nach: oben.id, x: BX, y: y0, breite: 2, hoehe: y1 - y0 + 1 });
  }

  // Wächter: am oberen Ende jeder Insel 2–4 vor der Brücke, auf der Insel des Siegels vor dem Buch
  const orte = {};
  for (const insel of INSEL_FORMEN) {
    const p = plaetze(insel);
    const randOben = (tx) => { let ty = insel.cy; while (istInnen(insel, tx, ty - 1)) ty--; return ty; };
    const randUnten = (tx) => { let ty = insel.cy; while (istInnen(insel, tx, ty + 1)) ty++; return ty; };
    const oben = Math.max(randOben(BX), randOben(BX + 1));
    const unten = Math.min(randUnten(BX), randUnten(BX + 1));
    if (insel.thema === "siegel") {
      p.buch = [BX, insel.cy - 5];
      p.waechter = [BX, insel.cy - 2];
    } else if (insel.thema !== "ankunft") {
      p.waechter = [BX, oben];
    }
    p.ankunft = [BX + 1, unten - 1];   // Startpunkt, wenn man über die Brücke kommt
    for (const [z, tx, ty] of p.deko ?? []) raster[ty][tx] = z;
    orte[insel.id] = p;
  }
  return { raster: raster.map((z) => z.join("")), bruecken, orte };
}

export const LAYOUT = bauen();

/** Hindernishöhe für die Kamera (0 = frei; über dem Abgrund kann die Kamera schweben). */
export const HINDERNIS = { T: 5.5, p: 6, S: 4.6, F: 3.2, O: 2.6, R: 1.6, L: 2.6 };
export const BLOCKIERT = new Set([" ", "w", ...Object.keys(HINDERNIS)]);
