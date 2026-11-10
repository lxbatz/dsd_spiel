// Grafikqualität: drei Stufen, automatisch passend zum Gerät gewählt.
// Läuft das Spiel zu langsam, wird die Stufe selbsttätig gesenkt –
// außer, jemand hat sie im Menü selbst eingestellt.

const SCHLUESSEL = "eldoria-grafik";

export const STUFEN = {
  hoch: { name: "Hoch", schatten: true, schattenGroesse: 1024, pixelRatio: 2, bloom: true, kerzenlichter: 6, partikel: 1 },
  mittel: { name: "Mittel", schatten: true, schattenGroesse: 1024, pixelRatio: 1.5, bloom: false, kerzenlichter: 4, partikel: 0.75 },
  niedrig: { name: "Niedrig", schatten: false, schattenGroesse: 512, pixelRatio: 1, bloom: false, kerzenlichter: 3, partikel: 0.45 },
};

export const istTouch = () => ("ontouchstart" in window) || (window.matchMedia?.("(pointer: coarse)").matches ?? false);

function lesen() {
  try { return localStorage.getItem(SCHLUESSEL); } catch { return null; }
}

/** Gewählte Stufe (vom Menü) oder null, wenn automatisch. */
export function gewaehlteStufe() {
  const s = lesen();
  return STUFEN[s] ? s : null;
}

export function stufeSpeichern(stufe) {
  try {
    if (stufe) localStorage.setItem(SCHLUESSEL, stufe);
    else localStorage.removeItem(SCHLUESSEL);
  } catch { /* egal */ }
}

/** Startstufe: Handy und Tablet „mittel“, sonst „hoch“. */
export function startStufe() {
  const g = gewaehlteStufe();
  if (g) return g;
  const klein = Math.min(screen.width, screen.height) < 700;
  return istTouch() ? (klein ? "niedrig" : "mittel") : "hoch";
}

/** Misst die Bildrate und meldet, wenn eine Stufe tiefer nötig ist. */
export class Messung {
  constructor() { this.mittel = 16; this.zeit = 0; this.schritte = 0; }
  /** Liefert true, wenn seit 5 s im Schnitt weniger als ca. 25 Bilder pro Sekunde kommen. */
  bild(ms) {
    if (ms > 500) { this.zeit = 0; return false; }
    this.mittel = this.mittel * 0.95 + ms * 0.05;
    this.zeit += ms / 1000;
    if (this.zeit < 5 || this.mittel < 40 || this.schritte >= 2) return false;
    this.zeit = 0;
    this.schritte++;
    return true;
  }
}
