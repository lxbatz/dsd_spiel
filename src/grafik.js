// Platzhalter-Grafiken: Alle Kacheln und Figuren werden hier per Code gezeichnet.
// Später kann man sie durch echte Pixel-Art (PNG-Dateien) oder ein anderes
// Grafikkonzept ersetzen, ohne Spiellogik oder Inhalte zu ändern.

export const KACHEL = 16;

// Zeichen im Kartenraster -> Kachelnummer im Kachelsatz
export const KACHELN = {
  ".": 0, // Gras
  ",": 1, // Weg
  "T": 2, // Baum
  "~": 3, // Wasser
  "H": 4, // Hauswand
  "R": 5, // Dach
  "d": 6, // Haustür
  "f": 7, // Zaun
  "F": 8, // Blumen
  "#": 9, // Steinwand
  "_": 10, // Steinboden
  "=": 11, // Teppich
  "B": 12, // Bücherregal
  "c": 13, // Kerzenständer
};
export const BLOCKIEREND = [2, 3, 4, 5, 6, 7, 9, 12, 13];

// ---------- Hilfen ----------

function zufallsGenerator(saat) {
  let s = saat;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function rechteck(ctx, x, y, w, h, farbe) {
  ctx.fillStyle = farbe;
  ctx.fillRect(x, y, w, h);
}

function sprenkel(ctx, ox, oy, w, h, farben, anzahl, saat) {
  const r = zufallsGenerator(saat);
  for (let i = 0; i < anzahl; i++) {
    rechteck(ctx, ox + Math.floor(r() * w), oy + Math.floor(r() * h), 1, 1, farben[i % farben.length]);
  }
}

/** Zeichnet ein Pixelmuster aus Textzeilen. palette: Zeichen -> Farbe ('.' = transparent). */
function muster(ctx, ox, oy, zeilen, palette) {
  zeilen.forEach((zeile, y) => {
    [...zeile].forEach((z, x) => {
      const farbe = palette[z];
      if (farbe) rechteck(ctx, ox + x, oy + y, 1, 1, farbe);
    });
  });
}

// ---------- Kacheln ----------

const kachelZeichner = [
  // 0 Gras
  (c, x) => { rechteck(c, x, 0, 16, 16, "#4f8a3c"); sprenkel(c, x, 0, 16, 16, ["#5f9c48", "#437a33"], 22, 7); },
  // 1 Weg
  (c, x) => { rechteck(c, x, 0, 16, 16, "#c9a66b"); sprenkel(c, x, 0, 16, 16, ["#b8935a", "#d8b880"], 18, 3); },
  // 2 Baum
  (c, x) => {
    kachelZeichner[0](c, x);
    rechteck(c, x + 7, 10, 3, 6, "#5c3b1e");
    c.fillStyle = "#2f6b2a"; c.beginPath(); c.arc(x + 8, 7, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3f8536"; c.beginPath(); c.arc(x + 6, 5, 3, 0, Math.PI * 2); c.fill();
    sprenkel(c, x + 3, 2, 10, 9, ["#255a22"], 8, 11);
  },
  // 3 Wasser
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#3a6fb0");
    rechteck(c, x + 2, 4, 5, 1, "#5a8fd0"); rechteck(c, x + 9, 9, 5, 1, "#5a8fd0"); rechteck(c, x + 3, 13, 4, 1, "#5a8fd0");
  },
  // 4 Hauswand (Fachwerk)
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#e3d3ac");
    rechteck(c, x, 0, 16, 2, "#6b4a2a"); rechteck(c, x, 14, 16, 2, "#6b4a2a"); rechteck(c, x, 0, 2, 16, "#6b4a2a");
    rechteck(c, x + 5, 5, 6, 5, "#6b4a2a"); rechteck(c, x + 6, 6, 4, 3, "#86b9de");
  },
  // 5 Dach
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#a33b2a");
    for (let y = 3; y < 16; y += 4) rechteck(c, x, y, 16, 1, "#7d2a1e");
    for (let y = 0; y < 16; y += 4) rechteck(c, x + ((y / 4) % 2) * 4 + 2, y, 1, 3, "#7d2a1e");
  },
  // 6 Tür
  (c, x) => {
    kachelZeichner[4](c, x);
    rechteck(c, x + 4, 3, 8, 13, "#5a3a20"); rechteck(c, x + 5, 4, 6, 12, "#7a5230"); rechteck(c, x + 9, 10, 1, 1, "#e6c45a");
  },
  // 7 Zaun
  (c, x) => {
    kachelZeichner[0](c, x);
    rechteck(c, x, 6, 16, 2, "#8a6a3a"); rechteck(c, x, 11, 16, 2, "#8a6a3a");
    rechteck(c, x + 2, 3, 2, 12, "#6e5230"); rechteck(c, x + 12, 3, 2, 12, "#6e5230");
  },
  // 8 Blumen
  (c, x) => {
    kachelZeichner[0](c, x);
    [[3, 4, "#e05a5a"], [10, 3, "#f2d24b"], [6, 10, "#ffffff"], [12, 11, "#e05a5a"], [2, 12, "#f2d24b"]]
      .forEach(([bx, by, f]) => { rechteck(c, x + bx, by, 2, 2, f); rechteck(c, x + bx, by + 2, 1, 1, "#2f6b2a"); });
  },
  // 9 Steinwand
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#3b3548");
    for (let y = 0; y < 16; y += 4) {
      rechteck(c, x, y + 3, 16, 1, "#2a2535");
      const v = (y / 4) % 2 ? 4 : 0;
      rechteck(c, x + v, y, 1, 3, "#2a2535"); rechteck(c, x + v + 8, y, 1, 3, "#2a2535");
      rechteck(c, x + v + 1, y, 6, 1, "#4a4358");
    }
  },
  // 10 Steinboden
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#6b6478");
    rechteck(c, x, 7, 16, 1, "#5e5869"); rechteck(c, x + 7, 0, 1, 16, "#5e5869");
    sprenkel(c, x, 0, 16, 16, ["#757086", "#615b70"], 14, 5);
  },
  // 11 Teppich
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#8e2b3a");
    sprenkel(c, x, 0, 16, 16, ["#9e3646", "#7e2232"], 10, 9);
  },
  // 12 Bücherregal
  (c, x) => {
    rechteck(c, x, 0, 16, 16, "#4a2f1e");
    const buecher = ["#b23a3a", "#3d6fb6", "#3f8f4f", "#d9a441", "#7a4fa0", "#c9a66b"];
    [1, 6, 11].forEach((y, reihe) => {
      for (let b = 0; b < 7; b++) rechteck(c, x + 1 + b * 2, y, 2, 4, buecher[(b + reihe * 2) % buecher.length]);
      rechteck(c, x, y + 4, 16, 1, "#2e1c10");
    });
  },
  // 13 Kerzenständer
  (c, x) => {
    kachelZeichner[10](c, x);
    rechteck(c, x + 5, 14, 6, 2, "#8a7a5a"); rechteck(c, x + 7, 6, 2, 8, "#8a7a5a");
    rechteck(c, x + 7, 3, 2, 3, "#f0e6c8"); rechteck(c, x + 7, 1, 2, 2, "#ffcc33"); rechteck(c, x + 7, 0, 1, 1, "#ff8822");
  },
];

// ---------- Figuren ----------

const KOERPER_A = [
  "................",
  "......hhhh......",
  ".....hhhhhh.....",
  ".....hssssh.....",
  ".....sesses.....",
  ".....ssssss.....",
  "......ssss......",
  "....kkkkkkkk....",
  "...kkkkaakkkk...",
  "...skkkaakkks...",
  "...skkkkkkkks...",
  "....kkkkkkkk....",
  "....aaaaaaaa....",
  "....pp....pp....",
  "....pp....pp....",
  "....oo....oo....",
];
const BEINE_B = [
  ".....pp..pp.....",
  ".....pp..pp.....",
  ".....oo..oo.....",
];
const ROBE = [
  "...kkkkkkkkkk...",
  "...kkkkkkkkkk...",
  "....oo....oo....",
];
const BART = [
  [5, ".....swwwws....."],
  [6, "......wwww......"],
  [7, "....kkwwwwkk...."],
];
const HUT = [
  ".......mm.......",
  "......mmmm......",
  "....mmmmmmmm....",
];
const KAPUZE = [
  ".....kkkkkk.....",
  "....kkkkkkkk....",
  "....kssssssk....",
];

function figurZeilen(f, schritt) {
  let z = [...KOERPER_A];
  if (f.bart) BART.forEach(([i, zeile]) => { z[i] = zeile; });
  if (f.robe) z.splice(13, 3, ...ROBE);
  else if (schritt) z.splice(13, 3, ...BEINE_B);
  if (f.hut) z.splice(0, 3, ...HUT);
  if (f.kapuze) z.splice(1, 3, ...KAPUZE);
  return z;
}

export const FIGUREN = {
  held_neu: { h: "#5a4a3a", s: "#f0c8a0", k: "#7a7a7a", a: "#5a5a5a", p: "#4a4a5a", o: "#3a2a1a", kapuze: true },
  held_kriegerin: { h: "#b5651d", s: "#f0c8a0", k: "#a83232", a: "#c0c0c0", p: "#5a4a3a", o: "#3a2a1a" },
  held_magier: { h: "#2a2a3a", s: "#e8b890", k: "#3d4fb6", a: "#e6c45a", p: "#2a3a7a", o: "#2a1a1a", m: "#3d4fb6", hut: true },
  held_waldlaeufer: { h: "#e3c16f", s: "#f2d0aa", k: "#3f7f3f", a: "#7a5230", p: "#4a3a2a", o: "#3a2a1a", kapuze: true },
  held_barde: { h: "#6b3a1e", s: "#c98b5e", k: "#d9a441", a: "#a83232", p: "#5a3a7a", o: "#3a2a1a" },
  npc_aldric: { h: "#e8e8e8", s: "#f0c8a0", k: "#2f4f8f", a: "#e6c45a", p: "#2f4f8f", o: "#3a2a1a", w: "#f4f4f4", bart: true, robe: true },
  npc_wilma: { h: "#7a4a2a", s: "#f0c8a0", k: "#4f8a3c", a: "#f4f0e0", p: "#4f8a3c", o: "#3a2a1a", robe: true },
  npc_borin: { h: "#c98b5e", s: "#c98b5e", k: "#5a4a3a", a: "#8a6a3a", p: "#3a3a3a", o: "#2a1a1a", w: "#8a4a1a", bart: true },
  npc_lyra: { h: "#d8d8f0", s: "#f2d0aa", k: "#6a3fa0", a: "#e6c45a", p: "#6a3fa0", o: "#2a1a2a", m: "#4a2a80", hut: true, robe: true },
};

function figurZeichnen(ctx, ox, f, schritt) {
  muster(ctx, ox, 0, figurZeilen(f, schritt), {
    h: f.h, s: f.s, e: "#222222", k: f.k, a: f.a, p: f.p, o: f.o, w: f.w ?? f.h, m: f.m ?? f.k,
  });
}

// ---------- Objekte ----------

const OBJEKTE = {
  marker: [7, 10, (c) => {
    muster(c, 0, 0, [
      "..ttt..", ".tgggt.", ".tgggt.", ".tgggt.", "..tgt..", "..tgt..", "..ttt..", "..ttt..", ".tgggt.", "..ttt..",
    ], { t: "#2b2116", g: "#f2c94c" });
  }],
  marktstand: [32, 16, (c) => {
    for (let i = 0; i < 8; i++) rechteck(c, i * 4, 0, 4, 5, i % 2 ? "#f4f0e0" : "#c0392b");
    rechteck(c, 1, 5, 2, 11, "#6e5230"); rechteck(c, 29, 5, 2, 11, "#6e5230");
    rechteck(c, 0, 9, 32, 4, "#8a6a3a"); rechteck(c, 0, 13, 32, 1, "#5a3a20");
    [[4, 7, "#d63a3a"], [7, 7, "#d63a3a"], [5, 6, "#e04a4a"], [13, 7, "#c9933a"], [16, 7, "#c9933a"], [22, 7, "#f2d24b"], [25, 7, "#7fbf4f"]]
      .forEach(([x, y, f]) => rechteck(c, x, y, 3, 2, f));
  }],
  amboss: [16, 16, (c) => {
    rechteck(c, 2, 5, 12, 3, "#4a4a55"); rechteck(c, 0, 5, 3, 2, "#4a4a55");
    rechteck(c, 5, 8, 6, 4, "#3a3a44"); rechteck(c, 3, 12, 10, 3, "#2a2a33"); rechteck(c, 3, 5, 10, 1, "#6a6a78");
  }],
  brett: [16, 16, (c) => {
    rechteck(c, 2, 9, 2, 7, "#5a3a20"); rechteck(c, 12, 9, 2, 7, "#5a3a20");
    rechteck(c, 0, 1, 16, 10, "#7a5230"); rechteck(c, 1, 2, 14, 8, "#2f2f2f");
    rechteck(c, 2, 3, 5, 6, "#f4f0e0"); rechteck(c, 8, 3, 6, 4, "#f2e2a0"); rechteck(c, 3, 4, 3, 1, "#666"); rechteck(c, 3, 6, 3, 1, "#666");
  }],
  brunnen: [16, 16, (c) => {
    c.fillStyle = "#8a8698"; c.beginPath(); c.arc(8, 9, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3a6fb0"; c.beginPath(); c.arc(8, 9, 4.5, 0, Math.PI * 2); c.fill();
    rechteck(c, 6, 7, 2, 1, "#8fc0ee");
    sprenkel(c, 1, 3, 14, 13, ["#6e6a80"], 10, 4);
  }],
  pult: [16, 16, (c) => {
    rechteck(c, 6, 8, 4, 7, "#5a3a20"); rechteck(c, 3, 14, 10, 2, "#4a2f1e");
    rechteck(c, 1, 3, 14, 5, "#7a5230"); rechteck(c, 2, 2, 5, 4, "#f4f0e0"); rechteck(c, 9, 2, 5, 4, "#f4f0e0");
    rechteck(c, 7, 2, 2, 4, "#c9b98a"); rechteck(c, 3, 3, 3, 1, "#999"); rechteck(c, 10, 3, 3, 1, "#999");
    rechteck(c, 13, 0, 1, 3, "#f4f4f4");
  }],
  siegeltuer: [32, 16, (c) => {
    rechteck(c, 0, 0, 32, 16, "#2a2535"); rechteck(c, 3, 1, 26, 15, "#4a2f1e");
    for (let x = 6; x < 28; x += 5) rechteck(c, x, 1, 1, 15, "#3a2416");
    c.fillStyle = "#a83232"; c.beginPath(); c.arc(16, 9, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#e6c45a"; c.beginPath(); c.arc(16, 9, 2.5, 0, Math.PI * 2); c.fill();
  }],
  tor_zu: [32, 16, (c) => {
    rechteck(c, 0, 0, 32, 16, "#2a2535");
    rechteck(c, 0, 0, 3, 16, "#4a4358"); rechteck(c, 29, 0, 3, 16, "#4a4358");
    rechteck(c, 3, 1, 26, 15, "#5a3a22");
    for (let x = 5; x < 29; x += 4) rechteck(c, x, 1, 1, 15, "#432a17");
    rechteck(c, 3, 4, 26, 1, "#3a3a44"); rechteck(c, 3, 11, 26, 1, "#3a3a44");
    c.fillStyle = "#e6c45a"; c.beginPath(); c.arc(16, 8, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff3b0"; rechteck(c, 15, 6, 2, 4, "#fff3b0");
  }],
  tor_offen: [32, 16, (c) => {
    rechteck(c, 0, 0, 4, 16, "#4a4358"); rechteck(c, 28, 0, 4, 16, "#4a4358");
    rechteck(c, 3, 0, 1, 16, "#5a3a22"); rechteck(c, 28, 0, 1, 16, "#5a3a22");
    rechteck(c, 1, 2, 2, 2, "#e6c45a"); rechteck(c, 29, 2, 2, 2, "#e6c45a");
  }],
  portal_aus: [32, 16, (c) => {
    c.fillStyle = "#6e6a80"; c.beginPath(); c.ellipse(16, 8, 15, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3b3548"; c.beginPath(); c.ellipse(16, 8, 11, 4.5, 0, 0, Math.PI * 2); c.fill();
    [[3, 7], [28, 7], [16, 1], [16, 14], [8, 3], [24, 3], [8, 12], [24, 12]].forEach(([x, y]) => rechteck(c, x, y, 2, 2, "#8a8698"));
  }],
  portal_an: [32, 16, (c) => {
    c.fillStyle = "#6e6a80"; c.beginPath(); c.ellipse(16, 8, 15, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3a8fe0"; c.beginPath(); c.ellipse(16, 8, 11, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#9fd4ff"; c.beginPath(); c.ellipse(16, 8, 6, 2.5, 0, 0, Math.PI * 2); c.fill();
    [[3, 7], [28, 7], [16, 1], [16, 14], [8, 3], [24, 3], [8, 12], [24, 12]].forEach(([x, y]) => rechteck(c, x, y, 2, 2, "#bfe6ff"));
  }],
  boss_torwaechter: [32, 32, (c) => {
    // Stab
    rechteck(c, 26, 6, 2, 26, "#6b4a2a");
    c.fillStyle = "#66e0ff"; c.beginPath(); c.arc(27, 5, 3.5, 0, Math.PI * 2); c.fill();
    rechteck(c, 26, 4, 1, 1, "#ffffff");
    // Körper (Steinmantel)
    c.fillStyle = "#4a4660";
    c.beginPath(); c.moveTo(6, 31); c.lineTo(9, 11); c.lineTo(23, 11); c.lineTo(26, 31); c.closePath(); c.fill();
    c.fillStyle = "#5e5a78";
    c.beginPath(); c.moveTo(9, 31); c.lineTo(11, 13); c.lineTo(21, 13); c.lineTo(23, 31); c.closePath(); c.fill();
    // Kapuze
    c.fillStyle = "#3a3650"; c.beginPath(); c.arc(16, 9, 7, Math.PI, 0); c.lineTo(23, 14); c.lineTo(9, 14); c.closePath(); c.fill();
    rechteck(c, 11, 7, 10, 6, "#15131f");
    // Augen
    rechteck(c, 12, 9, 3, 2, "#66e0ff"); rechteck(c, 17, 9, 3, 2, "#66e0ff");
    // Runen
    [[13, 17], [18, 17], [15, 21], [13, 25], [18, 25]].forEach(([x, y]) => rechteck(c, x, y, 2, 2, "#e6c45a"));
    rechteck(c, 15, 16, 2, 12, "#e6c45a");
    // Arm
    rechteck(c, 22, 15, 5, 3, "#4a4660"); rechteck(c, 25, 14, 3, 4, "#5e5a78");
  }],
};

/** Erzeugt alle Texturen in der übergebenen Phaser-Szene. */
export function grafikenErzeugen(szene) {
  const n = kachelZeichner.length;
  const kacheln = szene.textures.createCanvas("kacheln", KACHEL * n, KACHEL);
  const kc = kacheln.getContext();
  kachelZeichner.forEach((zeichne, i) => zeichne(kc, i * KACHEL));
  kacheln.refresh();

  for (const [schluessel, f] of Object.entries(FIGUREN)) {
    const t = szene.textures.createCanvas(schluessel, 32, 16);
    const c = t.getContext();
    figurZeichnen(c, 0, f, false);
    figurZeichnen(c, 16, f, true);
    t.add(0, 0, 0, 0, 16, 16);
    t.add(1, 0, 16, 0, 16, 16);
    t.refresh();
    szene.anims.create({
      key: `${schluessel}_laufen`,
      frames: [{ key: schluessel, frame: 1 }, { key: schluessel, frame: 0 }],
      frameRate: 6, repeat: -1,
    });
    szene.anims.create({
      key: `${schluessel}_stehen`,
      frames: [{ key: schluessel, frame: 0 }, { key: schluessel, frame: 0 }, { key: schluessel, frame: 1 }],
      frameRate: 1.5, repeat: -1,
    });
  }

  for (const [schluessel, [w, h, zeichne]] of Object.entries(OBJEKTE)) {
    const t = szene.textures.createCanvas(schluessel, w, h);
    zeichne(t.getContext());
    t.refresh();
  }
}

/** Liefert ein Porträt (Data-URL) für HTML-Fenster. */
export function portraitUrl(szene, schluessel) {
  const quelle = szene.textures.get(schluessel).getSourceImage();
  const istFigur = Boolean(FIGUREN[schluessel]);
  const w = istFigur ? 16 : quelle.width;
  const h = istFigur ? 16 : quelle.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(quelle, 0, 0, w, h, 0, 0, w, h);
  return canvas.toDataURL();
}

export function alleSchluessel() {
  return [...Object.keys(FIGUREN), ...Object.keys(OBJEKTE)];
}
