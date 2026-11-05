export function mischen(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

export function woerterZaehlen(text) {
  return (text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
}

export async function sha256(text) {
  const daten = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", daten);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
