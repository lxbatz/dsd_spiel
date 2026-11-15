// Lehrercodes mit eingebauter Prüfsumme: Die Lehrkraft erzeugt sie mit tools/lehrercodes.html,
// und das Spiel erkennt sie sofort – ohne Liste und ohne Änderung am Code.
// Aufbau: ELD-ABCD-EFGH (8 Zeichen). Das erste Zeichen nennt die Belohnung,
// die letzten drei sind eine Prüfsumme. Wer die Prüfsumme nicht kennt, kann kaum raten (1 : 32 768).
// Ein Code kann pro Gerät nur einmal eingelöst werden (das Spiel merkt sich seine Prüfsumme).

export const ZEICHEN = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // ohne 0/O und 1/I
const SALZ = "Eldoria·Sprachsiegel·2026";

/** Feste Belohnungen. Kennbuchstabe → Belohnung. "X" = eigene XP-Zahl (in zwei Zeichen kodiert). */
export const BELOHNUNGEN = {
  T: { xp: 20, grund: "Teamarbeit" },
  M: { xp: 10, grund: "Mündlicher Beitrag" },
  B: { xp: 25, grund: "Bonusaufgabe" },
  Q: { xp: 50, grund: "Quest im Unterricht" },
  D: { xp: 100, grund: "DSD-Mission" },
  S: { xp: 50, grund: "Sprechsiegel", gegenstand: "sprechsiegel" },
  X: { xp: 0, grund: "Belohnung deiner Lehrkraft" },
};

async function sha256Bytes(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

async function pruefsumme(rumpf) {
  const b = await sha256Bytes(`${SALZ}|${rumpf}`);
  return ZEICHEN[b[0] % 32] + ZEICHEN[b[1] % 32] + ZEICHEN[b[2] % 32];
}

const zufall = (n) => [...crypto.getRandomValues(new Uint32Array(n))].map((x) => ZEICHEN[x % 32]).join("");

/** Erzeugt einen neuen Code. art: Kennbuchstabe aus BELOHNUNGEN; bei "X" die XP-Zahl (1–1000). */
export async function codeErzeugen(art, xp = 0) {
  const rumpf = art === "X"
    ? "X" + ZEICHEN[Math.floor(xp / 32) % 32] + ZEICHEN[xp % 32] + zufall(2)
    : art + zufall(4);
  const code = rumpf + (await pruefsumme(rumpf));
  return `ELD-${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Prüft einen Code. Liefert { xp, grund, gegenstand? } oder null. */
export async function codePruefen(eingabe) {
  const roh = eingabe.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = roh.match(/^ELD([A-Z0-9]{8})$/);
  if (!m) return null;
  const code = m[1];
  if ([...code].some((c) => !ZEICHEN.includes(c))) return null;
  const rumpf = code.slice(0, 5);
  if (code.slice(5) !== (await pruefsumme(rumpf))) return null;
  const art = BELOHNUNGEN[rumpf[0]];
  if (!art) return null;
  if (rumpf[0] === "X") {
    const xp = ZEICHEN.indexOf(rumpf[1]) * 32 + ZEICHEN.indexOf(rumpf[2]);
    if (xp < 1 || xp > 1000) return null;
    return { ...art, xp };
  }
  return { ...art };
}
