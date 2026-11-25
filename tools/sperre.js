// Einfache Passwortabfrage für die Lehrerseiten (Lehrerzimmer, Lehrercodes).
// Das ist nur eine Hürde gegen neugierige Blicke, kein echter Schutz: Die Seiten liegen öffentlich,
// und wer den Quelltext liest, kann sie auch ohne Passwort öffnen.
// Im Repository steht nur die SHA-256-Prüfsumme, nie das Passwort selbst.
// Neues Passwort: SHA-256 von "eldoria-lehrerzimmer|<Passwort>" berechnen und unten eintragen.

const PRUEFSUMME = "099588ceadf054c6875a51303d1d828e3cdacc3ad92036e4d3e4c28728317077";
const MERKER = "eldoria-lehrer-frei";

async function pruefsumme(text) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`eldoria-lehrerzimmer|${text}`));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function frei() {
  document.documentElement.classList.remove("gesperrt");
  document.getElementById("sperre")?.remove();
}

function lesen() { try { return sessionStorage.getItem(MERKER); } catch { return null; } }
function merken() { try { sessionStorage.setItem(MERKER, PRUEFSUMME); } catch { /* ohne Speicher: nächstes Mal neu fragen */ } }

const STIL = `
  html.gesperrt body > :not(#sperre) { display: none !important; }
  #sperre { position: fixed; inset: 0; display: grid; place-items: center; padding: 16px;
    background: #f4f4f8; color: #1d1c28; font-family: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif; z-index: 9999; }
  #sperre form { width: min(360px, 100%); background: #fff; border: 1px solid #d9d9e3; border-radius: 12px;
    padding: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
  #sperre h1 { margin: 0; font-family: "Cinzel", Georgia, serif; font-size: 22px; }
  #sperre p { margin: 0; color: #535166; font-size: 14px; }
  #sperre input { font: inherit; font-size: 16px; padding: 10px 12px; border: 1px solid #b9b7cc; border-radius: 8px; background: #fff; color: inherit; }
  #sperre button { font: inherit; font-weight: 700; padding: 10px 12px; border: 0; border-radius: 8px; background: #3b3f9c; color: #fff; cursor: pointer; }
  #sperre .fehler { color: #d03b3b; min-height: 1.2em; }
  @media (prefers-color-scheme: dark) {
    #sperre { background: #14141c; color: #ecebf4; }
    #sperre form { background: #1d1d28; border-color: #34344a; }
    #sperre p { color: #b9b7cc; }
    #sperre input { background: #272735; border-color: #34344a; }
    #sperre button { background: #9da3f2; color: #14141c; }
  }
`;

function anzeigen() {
  const stil = document.createElement("style");
  stil.textContent = STIL;
  document.head.append(stil);
  const box = document.createElement("div");
  box.id = "sperre";
  box.innerHTML = `
    <form autocomplete="off">
      <h1>🔒 Lehrerbereich</h1>
      <p>Bitte gib das Passwort ein.</p>
      <input type="password" aria-label="Passwort" autofocus>
      <button type="submit">Öffnen</button>
      <p class="fehler" role="alert"></p>
    </form>`;
  document.body.append(box);
  const feld = box.querySelector("input");
  box.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if ((await pruefsumme(feld.value)) === PRUEFSUMME) { merken(); frei(); return; }
    box.querySelector(".fehler").textContent = "Das Passwort stimmt nicht.";
    feld.select();
  });
  feld.focus();
}

if (lesen() === PRUEFSUMME) frei();
else anzeigen();
