// Spielstand-Dateien und Stufen – ohne Abhängigkeit vom laufenden Spiel,
// damit auch das Lehrer-Dashboard (tools/dashboard.html) sie benutzen kann.

// Stufen: benötigte Gesamt-XP und Titel.
export const STUFEN = [
  { xp: 0, titel: "Ankömmling" },
  { xp: 100, titel: "Wanderer" },
  { xp: 250, titel: "Lehrling der Worte" },
  { xp: 450, titel: "Pfadfinder" },
  { xp: 700, titel: "Sprachwächter" },
  { xp: 1000, titel: "Hüter der Schrift" },
  { xp: 1400, titel: "Veteran von Eldoria" },
  { xp: 1900, titel: "Meister der Worte" },
  { xp: 2500, titel: "Held von Eldoria" },
  // Ab hier: Aurelia und später (Quest 5 + Drachenrichter sollen den Hauptweg auf mindestens 3000 XP bringen)
  { xp: 2750, titel: "Bewahrer der Töne" },
  { xp: 3000, titel: "Großmeister der Stimmen" },
  { xp: 3600, titel: "Legende von Eldoria" },
];

export function stufeVon(xp) {
  let index = 0;
  STUFEN.forEach((s, i) => { if (xp >= s.xp) index = i; });
  const aktuell = STUFEN[index];
  const naechste = STUFEN[index + 1] ?? null;
  return { stufe: index + 1, titel: aktuell.titel, ab: aktuell.xp, bis: naechste ? naechste.xp : null };
}

function pruefsumme(text) {
  // cyrb53 – kleine, schnelle Prüfsumme gegen versehentliche oder neugierige Änderungen
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/** Erzeugt den Inhalt einer Spielstand-Datei (JSON mit Prüfsumme) und einen Dateinamen. */
export function dateiErzeugen(zustand, endung = "sav") {
  const daten = btoa(unescape(encodeURIComponent(JSON.stringify(zustand))));
  const name = (zustand.held?.name ?? "Spielstand").replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 30) || "Spielstand";
  const datum = new Date().toISOString().slice(0, 10);
  const inhalt = JSON.stringify({
    spiel: "Die Chroniken von Eldoria",
    art: "Spielstand",
    format: 2,
    held: zustand.held?.name ?? null,
    kennung: zustand.held?.kennung ?? null,
    xp: zustand.xp,
    gespeichert: new Date().toISOString(),
    daten,
    pruefsumme: pruefsumme("eldoria|" + daten),
  }, null, 2);
  return { name: `Eldoria_${name}_${datum}.${endung}`, inhalt };
}

/** Liest eine Spielstand-Datei (oder einen alten Spielstand-Code). Liefert die Daten, ohne sie zu übernehmen. */
export function spielstandLesen(text) {
  return spielstandMitKopf(text).daten;
}

/** Wie spielstandLesen, liefert zusätzlich das Speicherdatum der Datei: { daten, gespeichert }. */
export function spielstandMitKopf(text) {
  const roh = String(text ?? "").trim();
  let daten, gespeichert = null;
  if (roh.startsWith("ELDORIA1:")) {
    daten = JSON.parse(decodeURIComponent(escape(atob(roh.slice(9)))));
  } else {
    let datei;
    try { datei = JSON.parse(roh); } catch { throw new Error("Das ist keine Spielstand-Datei von Eldoria."); }
    if (datei?.spiel !== "Die Chroniken von Eldoria" || typeof datei.daten !== "string") throw new Error("Das ist keine Spielstand-Datei von Eldoria.");
    if (pruefsumme("eldoria|" + datei.daten) !== datei.pruefsumme) throw new Error("Die Datei ist beschädigt oder wurde verändert.");
    daten = JSON.parse(decodeURIComponent(escape(atob(datei.daten))));
    gespeichert = datei.gespeichert ?? null;
  }
  if (typeof daten !== "object" || daten === null || typeof daten.xp !== "number") throw new Error("Der Spielstand ist beschädigt.");
  return { daten, gespeichert };
}

