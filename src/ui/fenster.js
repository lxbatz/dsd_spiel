// Das Overlay-Fenster für Dialoge, Aufgaben, Inventar usw.

const overlay = document.getElementById("overlay");
const fenster = document.getElementById("fenster");
let offen = false;
const schliessHoerer = new Set();

export function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else if (k === "value") e.value = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const kind of kinder.flat()) {
    if (kind === null || kind === undefined || kind === false) continue;
    e.append(kind instanceof Node ? kind : String(kind));
  }
  return e;
}

export function istOffen() {
  return offen;
}

export function beimSchliessen(fn) {
  schliessHoerer.add(fn);
}

/** Zeigt Inhalt im Fenster (öffnet es, falls nötig). */
export function zeigen(...knoten) {
  fenster.replaceChildren(...knoten.flat().filter((k) => k !== null && k !== undefined && k !== false));
  overlay.hidden = false;
  offen = true;
  fenster.scrollTop = 0;
}

export function schliessen() {
  if (!offen) return;
  overlay.hidden = true;
  offen = false;
  fenster.replaceChildren();
  document.activeElement?.blur?.();
  schliessHoerer.forEach((fn) => fn());
}

export function knopf(text, onclick, klasse = "knopf") {
  return el("button", { class: klasse, type: "button", onclick }, text);
}

/** Setzt den Fokus nach dem Rendern (damit Enter/Leertaste den Knopf auslösen). */
export function fokus(element) {
  requestAnimationFrame(() => element?.focus?.());
}

function portrait(bildUrl) {
  return bildUrl ? el("img", { class: "portrait", src: bildUrl, alt: "" }) : null;
}

/**
 * Zeigt eine oder mehrere Dialogzeilen nacheinander.
 * zeilen: Array von Strings.
 */
export async function dialog(sprecher, zeilen, bildUrl) {
  const liste = Array.isArray(zeilen) ? zeilen : [zeilen];
  for (let i = 0; i < liste.length; i++) {
    await new Promise((weiter) => {
      const letzte = i === liste.length - 1;
      const k = knopf(letzte ? "OK" : "Weiter ▸", weiter);
      zeigen(
        el("div", { class: "dialog" },
          portrait(bildUrl),
          el("div", {},
            el("div", { class: "sprecher" }, sprecher),
            el("div", { class: "rede" }, liste[i]),
          ),
        ),
        el("div", { class: "knopfleiste" }, k),
      );
      fokus(k);
    });
  }
}

/** Stellt eine Frage mit Antwortknöpfen und liefert den Index der Antwort. */
export function frage(sprecher, text, optionen, bildUrl) {
  return new Promise((antwort) => {
    const knoepfe = optionen.map((o, i) => knopf(o, () => antwort(i)));
    zeigen(
      el("div", { class: "dialog" },
        portrait(bildUrl),
        el("div", { style: "flex:1" },
          el("div", { class: "sprecher" }, sprecher),
          el("div", { class: "rede" }, text),
          el("div", { class: "auswahl-liste" }, knoepfe),
        ),
      ),
    );
    fokus(knoepfe[0]);
  });
}

/** Fragt nach einer Bestätigung im Spielfenster (statt confirm()). Liefert true/false. */
export function bestaetigen(titel, text, ja, nein = "Abbrechen") {
  return new Promise((antwort) => {
    const n = knopf(nein, () => antwort(false), "knopf zweitrangig");
    const j = knopf(ja, () => antwort(true));
    zeigen(el("h2", {}, titel), el("p", {}, text), el("div", { class: "knopfleiste" }, n, j));
    fokus(n);
  });
}

/** Zeigt einen Lesetext mit Titel. */
export function textZeigen(titel, text, quelle) {
  return new Promise((weiter) => {
    const k = knopf("Schließen", weiter);
    zeigen(
      el("h2", {}, titel),
      el("div", { class: "lesetext", style: "max-height:none" }, text, quelle ? el("span", { class: "quelle" }, quelle) : null),
      el("div", { class: "knopfleiste" }, k),
    );
    fokus(k);
  });
}

export function toast(text, dauer = 3500) {
  const t = el("div", { class: "toast" }, text);
  document.getElementById("toasts").append(t);
  setTimeout(() => t.remove(), dauer);
}

const hinweisEl = document.getElementById("hinweis");
export function hinweis(taste, text) {
  if (!text) {
    hinweisEl.hidden = true;
    return;
  }
  hinweisEl.replaceChildren(el("kbd", {}, taste), text);
  hinweisEl.hidden = false;
}
