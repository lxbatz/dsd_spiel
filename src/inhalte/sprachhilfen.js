// Hilfen, um Angaben aus dem Heldenpass grammatisch richtig in Sätze einzubauen.

// Länder mit Artikel (Dativ nach „aus“ und „in“). Alle anderen Länder stehen ohne Artikel.
const FEMININ = [
  "Türkei", "Schweiz", "Ukraine", "Slowakei", "Mongolei", "Tschechische Republik", "Dominikanische Republik",
  "Zentralafrikanische Republik", "Elfenbeinküste", "Demokratische Republik Kongo", "Republik Moldau",
];
const MASKULIN = ["Iran", "Irak", "Libanon", "Sudan", "Südsudan", "Jemen", "Kongo", "Tschad", "Senegal", "Niger", "Oman", "Vatikan", "Kosovo"];
const PLURAL = [
  "USA", "Vereinigten Staaten", "Niederlande", "Philippinen", "Vereinigten Arabischen Emirate", "Malediven",
  "Seychellen", "Komoren", "Bahamas",
];

/** Entfernt Zeichen, die im Lückentext-Format eine Bedeutung haben, und Satzzeichen am Ende. */
export function sauber(text) {
  return String(text ?? "").replace(/[{}|]/g, "").trim().replace(/[.!?,;:]+$/, "").trim();
}

export function grossAnfang(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function finde(liste, wort) {
  return liste.find((x) => x.toLowerCase() === wort.toLowerCase());
}

/**
 * „aus“ oder „in“ + Land/Ort mit dem richtigen Artikel:
 *   ortMit("aus", "Dänemark") → "aus Dänemark"
 *   ortMit("aus", "türkei")   → "aus der Türkei"
 *   ortMit("in", "Iran")      → "im Iran"
 *   ortMit("in", "die USA")   → "in den USA"
 */
export function ortMit(praeposition, ort) {
  let o = sauber(ort).replace(/^(die|der|das|dem|den)\s+/i, "");
  o = grossAnfang(o);
  const f = finde(FEMININ, o);
  if (f) return `${praeposition} der ${f}`;
  const m = finde(MASKULIN, o);
  if (m) return praeposition === "in" ? `im ${m}` : `${praeposition} dem ${m}`;
  const p = finde(PLURAL, o);
  if (p) return `${praeposition} den ${p}`;
  return `${praeposition} ${o}`;
}

/** Zerlegt „Polnisch, englisch und Deutsch“ in ["Polnisch", "Englisch", "Deutsch"]. */
export function teileListe(text) {
  return sauber(text)
    .split(/\s*(?:,|;|\/|&|\+|\bund\b|\boder\b)\s*/i)
    .map((t) => grossAnfang(t.trim()))
    .filter(Boolean);
}

/** ["A", "B", "C"] → "A, B und C" */
export function aufzaehlen(teile) {
  if (teile.length <= 1) return teile.join("");
  return `${teile.slice(0, -1).join(", ")} und ${teile[teile.length - 1]}`;
}

/** Liefert das Alter als Zahl (aus „16“, „16 Jahre“ …) oder null. */
export function alterAlsZahl(text) {
  const m = String(text ?? "").match(/\d{1,3}/);
  if (!m) return null;
  const n = Number(m[0]);
  return n >= 5 && n <= 120 ? n : null;
}
