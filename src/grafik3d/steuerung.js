// Touch-Steuerung für Handy und Tablet: Joystick links, Aktionsknopf rechts,
// Wischen dreht die Kamera, zwei Finger zoomen, Tippen läuft zu einer Stelle.
//
// Wichtig (Erfahrung aus einem früheren Projekt): Läuft das Spiel eingebettet
// (z. B. in einer Artefakt-Ansicht in Chrome/Edge auf Android), übernimmt der
// Browser Wischgesten sonst als Scrollen der äußeren Seite. Deshalb werden
// Touch-Events auf Dokumentebene mit { passive: false, capture: true } abgefangen
// und mit preventDefault() für das Spiel beansprucht – aber nur außerhalb von
// Fenstern und Knöpfen, damit Dialoge und Aufgaben normal bedienbar bleiben.

import { istTouch } from "./qualitaet.js";

const IST_BEDIENELEMENT = "button, a, input, textarea, select, label, #overlay, #hud, #aktion-knopf, .knopf";

export class Touchsteuerung {
  /**
   * spiel: { aktiv(): bool, drehen(dx, dy), zoomen(f), tippen(x, y), aktion() }
   */
  constructor(spiel) {
    this.spiel = spiel;
    this.joy = { x: 0, y: 0 };
    this.joyTouch = null;
    this.blickTouch = null;
    this.finger = new Map();
    this.pinch = null;

    this.joyEl = document.createElement("div");
    this.joyEl.id = "joystick";
    this.knauf = document.createElement("i");
    this.joyEl.append(this.knauf);
    this.aktionEl = document.createElement("button");
    this.aktionEl.id = "aktion-knopf";
    this.aktionEl.type = "button";
    this.aktionEl.innerHTML = "<span>💬</span><small></small>";
    this.aktionEl.hidden = true;
    const buehne = document.getElementById("buehne");
    buehne.append(this.joyEl, this.aktionEl);
    this.aktionEl.addEventListener("click", (ev) => { ev.preventDefault(); this.spiel.aktion(); });

    if (istTouch()) this.einschalten();
    this.hoeren();
  }

  einschalten() {
    if (this.an) return;
    this.an = true;
    document.body.classList.add("touch");
  }

  /** Zeigt den Aktionsknopf mit kurzem Text (oder versteckt ihn). */
  aktionZeigen(text) {
    if (!this.an) return;
    const sichtbar = Boolean(text);
    if (this.aktionEl.hidden === !sichtbar && this.aktionText === text) return;
    this.aktionText = text;
    this.aktionEl.hidden = !sichtbar;
    if (sichtbar) {
      const [symbol, kurz] = [
        [/herausfordern/i, "⚔️", "Kämpfen"], [/streicheln/i, "🐾", "Streicheln"], [/portal/i, "🌀", "Reisen"],
        [/schreiben/i, "✒️", "Schreiben"], [/lesen/i, "📜", "Lesen"], [/untersuchen/i, "🔍", "Ansehen"],
        [/schauen/i, "👀", "Schauen"], [/sprechen/i, "💬", "Sprechen"],
      ].find(([m]) => m.test(text))?.slice(1) ?? ["✋", "Benutzen"];
      this.aktionEl.querySelector("small").textContent = kurz;
      this.aktionEl.querySelector("span").textContent = symbol;
      this.aktionEl.title = text;
    }
  }

  joySetzen(x, y) {
    const r = this.joyEl.getBoundingClientRect();
    let dx = (x - r.left - r.width / 2) / (r.width / 2), dy = (y - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; }
    this.joy.x = dx; this.joy.y = dy;
    this.knauf.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`;
  }

  joyLoslassen() {
    this.joyTouch = null;
    this.joy.x = this.joy.y = 0;
    this.knauf.style.transform = "";
  }

  hoeren() {
    const opt = { passive: false, capture: true };
    document.addEventListener("touchstart", (e) => {
      this.einschalten();
      let meins = false;
      for (const t of e.changedTouches) {
        const el = t.target;
        if (this.joyTouch === null && el && this.joyEl.contains(el)) {
          this.joyTouch = t.identifier;
          this.joySetzen(t.clientX, t.clientY);
          meins = true;
        } else if (this.spiel.aktiv() && !el?.closest?.(IST_BEDIENELEMENT)) {
          this.finger.set(t.identifier, { x: t.clientX, y: t.clientY, x0: t.clientX, y0: t.clientY, zeit: performance.now() });
          meins = true;
        }
      }
      if (this.finger.size === 2) {
        const [a, b] = [...this.finger.values()];
        this.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
      if (meins && e.cancelable) e.preventDefault();
    }, opt);

    document.addEventListener("touchmove", (e) => {
      let meins = false;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouch) { this.joySetzen(t.clientX, t.clientY); meins = true; continue; }
        const f = this.finger.get(t.identifier);
        if (!f) continue;
        meins = true;
        if (this.finger.size === 1) this.spiel.drehen(t.clientX - f.x, t.clientY - f.y);
        f.x = t.clientX; f.y = t.clientY;
      }
      if (this.finger.size === 2 && this.pinch) {
        const [a, b] = [...this.finger.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.spiel.zoomen(this.pinch / Math.max(1, d));
        this.pinch = d;
      }
      if (meins && e.cancelable) e.preventDefault();
    }, opt);

    const ende = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouch) this.joyLoslassen();
        const f = this.finger.get(t.identifier);
        if (f) {
          const kurz = performance.now() - f.zeit < 350 && Math.hypot(t.clientX - f.x0, t.clientY - f.y0) < 12;
          this.finger.delete(t.identifier);
          if (kurz && e.type === "touchend" && !this.pinch) this.spiel.tippen(t.clientX, t.clientY);
        }
      }
      if (this.finger.size < 2) this.pinch = null;
    };
    document.addEventListener("touchend", ende, { passive: true, capture: true });
    document.addEventListener("touchcancel", ende, { passive: true, capture: true });
  }

  /** Alles loslassen (z. B. wenn ein Fenster aufgeht). */
  zuruecksetzen() {
    this.joyLoslassen();
    this.finger.clear();
    this.pinch = null;
  }
}
