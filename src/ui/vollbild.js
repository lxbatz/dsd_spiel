// Vollbild: Das Spiel wechselt beim Start (Klick auf „Weiterspielen“ / „Das Abenteuer beginnt“)
// automatisch in den Vollbildmodus. Browser erlauben das nur direkt nach einem Klick oder Tastendruck.
// Wer im Menü „Vollbild aus“ wählt, bekommt es beim nächsten Start nicht mehr automatisch.
// Geräte ohne Vollbild-API (z. B. iPhone-Safari) und eingebettete Seiten ohne Erlaubnis ignorieren den Aufruf.

const MERKER = "eldoria-vollbild";

export const vollbildMoeglich = () => Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
export const istVollbild = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);

function gewuenscht() { try { return localStorage.getItem(MERKER) !== "aus"; } catch { return true; } }
function merken(an) { try { localStorage.setItem(MERKER, an ? "an" : "aus"); } catch { /* egal */ } }

// Beide geben ein Promise zurück, das nie fehlschlägt (abgelehnte Anfragen werden still ignoriert).
function einschalten() {
  const d = document.documentElement;
  try {
    return Promise.resolve(d.requestFullscreen ? d.requestFullscreen({ navigationUI: "hide" }) : d.webkitRequestFullscreen?.()).catch(() => {});
  } catch { return Promise.resolve(); }
}

function ausschalten() {
  try {
    return Promise.resolve(document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen?.()).catch(() => {});
  } catch { return Promise.resolve(); }
}

/** Beim Spielstart aufrufen, direkt im Klick-Handler (vor dem ersten await). */
export function vollbildBeimStart() {
  if (vollbildMoeglich() && gewuenscht() && !istVollbild()) einschalten();
}

/** Schalter für das Menü. Das Promise ist erfüllt, sobald der Wechsel durch ist. */
export function vollbildUmschalten() {
  if (istVollbild()) { merken(false); return ausschalten(); }
  merken(true);
  return einschalten();
}
