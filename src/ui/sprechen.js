// Sprechaufgaben (Vocantia) – funktionieren mit und ohne Mikrofon.
//
//   sprechen { frage, laut?, dauer: Sekunden, hilfen?, checkliste: [..], partner?: { a, b }, erklaerung? }
//     frage:      Aufgabe (wird angezeigt; mit „🔊“ liest die Sprachausgabe `laut ?? frage` vor)
//     dauer:      so lange soll man mindestens sprechen (Sekunden)
//     hilfen:     Redemittel, aufklappbar
//     checkliste: Selbstcheck bzw. Partnercheck – muss abgehakt werden
//     partner:    Partnerübung: { a: "Rolle A …", b: "Rolle B …" }
//
// Ohne Mikrofon: Sprechuhr (Start/Stopp). Mit Mikrofon: Stimmkristall – er misst NUR die Lautstärke
// (Web Audio), lädt sich beim Sprechen auf und flackert bei langen Pausen. Zusätzlich kann man sich selbst
// aufnehmen und anhören. Nichts wird gespeichert oder hochgeladen; beim Weitergehen wird alles gelöscht.

import { el } from "./fenster.js";
import { hoertextElement } from "./hoeren.js";

const WAHL = "eldoria-mikrofon";
let aktiv = null;   // { stream, ctx, raf, recorder, urls }

function wahlLesen() { try { return localStorage.getItem(WAHL) === "1"; } catch { return false; } }
function wahlSpeichern(an) { try { localStorage.setItem(WAHL, an ? "1" : "0"); } catch { /* egal */ } }

/** Mikrofon, Messung und Aufnahmen beenden (beim Weitergehen und nach dem Kampf). */
export function sprechenStoppen() {
  if (!aktiv) return;
  clearInterval(aktiv.raf);
  try { if (aktiv.recorder?.state === "recording") aktiv.recorder.stop(); } catch { /* egal */ }
  aktiv.stream?.getTracks().forEach((t) => t.stop());
  aktiv.ctx?.close().catch(() => {});
  aktiv.urls.forEach((u) => URL.revokeObjectURL(u));
  aktiv = null;
}

export const mikrofonMoeglich = () => Boolean(navigator.mediaDevices?.getUserMedia && (window.AudioContext || window.webkitAudioContext));

function kristallSvg() {
  // Facettierter Kristall; die Füllung wird über eine Clip-Höhe gesteuert
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 60 100");
  svg.setAttribute("class", "kristall-svg");
  svg.innerHTML = `
    <defs>
      <linearGradient id="kristallVerlauf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e8fbff"/><stop offset="0.5" stop-color="#7fd8ff"/><stop offset="1" stop-color="#3a7ad8"/>
      </linearGradient>
      <clipPath id="kristallForm"><polygon points="30,2 56,30 46,96 14,96 4,30"/></clipPath>
    </defs>
    <polygon points="30,2 56,30 46,96 14,96 4,30" fill="#1a2a3a" stroke="#9adcff" stroke-width="1.5"/>
    <g clip-path="url(#kristallForm)"><rect class="kristall-fuellung" x="0" y="100" width="60" height="100" fill="url(#kristallVerlauf)"/></g>
    <path d="M4,30 L30,40 L56,30 M30,40 L30,96" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>`;
  return svg;
}

export function sprechen(a) {
  const dauer = a.dauer ?? 30;
  let gesprochen = 0;            // Sekunden (Uhr: laufende Zeit, Kristall: Zeit mit Stimme)
  let modus = null;              // "uhr" | "kristall"
  let uhrStart = null, uhrTimer = null;

  const anzeige = el("div", { class: "sprech-zeit" });
  const balken = el("div", { class: "sprech-balken" }, el("div", { class: "sprech-balken-fuellung" }));
  const kristall = el("div", { class: "kristall", hidden: true }, kristallSvg());
  const hinweis = el("div", { class: "sprech-hinweis" });
  const aufnahmeBereich = el("div", { class: "sprech-aufnahme" });
  const haken = (a.checkliste ?? []).map(() => el("input", { type: "checkbox" }));

  const aktualisieren = () => {
    const anteil = Math.min(1, gesprochen / dauer);
    anzeige.textContent = `${Math.floor(gesprochen)} / ${dauer} Sekunden${anteil >= 1 ? " ✔" : ""}`;
    balken.firstChild.style.width = `${anteil * 100}%`;
    const rect = kristall.querySelector(".kristall-fuellung");
    if (rect) rect.setAttribute("y", String(100 - anteil * 98));
    kristall.classList.toggle("voll", anteil >= 1);
  };

  // ---------- Sprechuhr ----------
  const uhrKnopf = el("button", { type: "button", class: "knopf" }, "▶ Start");
  uhrKnopf.addEventListener("click", () => {
    if (uhrTimer) {
      clearInterval(uhrTimer); uhrTimer = null; uhrKnopf.textContent = "▶ Weiter";
      return;
    }
    const basis = gesprochen;
    uhrStart = performance.now();
    uhrTimer = setInterval(() => { gesprochen = basis + (performance.now() - uhrStart) / 1000; aktualisieren(); }, 200);
    uhrKnopf.textContent = "⏸ Pause";
  });
  const uhrBereich = el("div", { class: "sprech-modus", hidden: true },
    el("div", { class: "sprech-info" }, "⏱ Sprechuhr: Drück auf Start und sprich laut. Deine Partnerin, dein Partner oder deine Lehrkraft hört zu."),
    uhrKnopf);

  // ---------- Stimmkristall ----------
  const kristallKnopf = el("button", { type: "button", class: "knopf" }, "🎙 Mikrofon einschalten");
  const aufnahmeKnopf = el("button", { type: "button", class: "knopf zweitrangig", hidden: true }, "⏺ Aufnehmen");
  const kristallBereich = el("div", { class: "sprech-modus", hidden: true },
    el("div", { class: "sprech-info" }, "💎 Stimmkristall: Er lädt sich auf, solange du sprichst. Das Spiel hört nicht, WAS du sagst – nur, DASS du sprichst. Nichts wird gespeichert."),
    el("div", { class: "knopfleiste" }, kristallKnopf, aufnahmeKnopf));

  kristallKnopf.addEventListener("click", async () => {
    if (aktiv) return;
    kristallKnopf.disabled = true;
    hinweis.textContent = "Bitte erlaube den Zugriff auf das Mikrofon …";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      aktiv = { stream, ctx, raf: 0, recorder: null, urls: [] };
      const daten = new Float32Array(analyser.fftSize);
      // Zeitbasiert (alle 50 ms), damit es auch auf langsamen Geräten gleich schnell läuft
      const start = performance.now();
      let boden = 0.01, letzte = start, stille = 0;
      const schritt = () => {
        if (!aktiv) return;
        analyser.getFloatTimeDomainData(daten);
        let s = 0;
        for (let i = 0; i < daten.length; i++) s += daten[i] * daten[i];
        const pegel = Math.sqrt(s / daten.length);
        const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - letzte) / 1000);
        letzte = jetzt;
        // Grundrauschen in den ersten 0,8 Sekunden lernen, danach nur langsam nach unten anpassen
        const lernt = jetzt - start < 800;
        if (lernt) boden = Math.max(boden, pegel); else if (pegel < boden) boden = boden * 0.99 + pegel * 0.01;
        const spricht = !lernt && pegel > Math.max(0.015, boden * 2.5);
        if (spricht) { gesprochen += dt; stille = 0; } else stille += dt;
        kristall.classList.toggle("spricht", spricht);
        kristall.classList.toggle("flackert", !lernt && stille > 2 && gesprochen > 0 && gesprochen < dauer);
        kristall.style.setProperty("--pegel", String(Math.min(1, pegel * 8)));
        hinweis.textContent = lernt ? "Einen Moment still sein – ich messe das Grundrauschen …" : spricht ? "Der Kristall lädt sich auf …" : stille > 2 ? "Der Kristall flackert – sprich weiter!" : "";
        aktualisieren();
      };
      aktiv.raf = setInterval(schritt, 50);
      kristallKnopf.textContent = "🎙 Mikrofon ist an";
      if (window.MediaRecorder) aufnahmeKnopf.hidden = false;
    } catch {
      kristallKnopf.disabled = false;
      hinweis.textContent = "Kein Mikrofon gefunden oder kein Zugriff erlaubt. Nimm die Sprechuhr.";
      modusWaehlen("uhr");
    }
  });

  aufnahmeKnopf.addEventListener("click", () => {
    if (!aktiv) return;
    if (aktiv.recorder?.state === "recording") { aktiv.recorder.stop(); return; }
    const teile = [];
    const rec = new MediaRecorder(aktiv.stream);
    aktiv.recorder = rec;
    rec.ondataavailable = (e) => { if (e.data.size) teile.push(e.data); };
    rec.onstop = () => {
      aufnahmeKnopf.textContent = "⏺ Neu aufnehmen";
      if (!aktiv) return;
      const url = URL.createObjectURL(new Blob(teile, { type: rec.mimeType }));
      aktiv.urls.push(url);
      aufnahmeBereich.replaceChildren(
        el("div", { class: "sprech-info" }, "🎧 Hör dich selbst an. Die Aufnahme bleibt nur hier und wird gelöscht, wenn du weitergehst."),
        el("audio", { controls: true, src: url }));
    };
    rec.start();
    aufnahmeKnopf.textContent = "⏹ Aufnahme beenden";
  });

  const modusWaehlen = (m) => {
    modus = m;
    uhrBereich.hidden = m !== "uhr";
    kristallBereich.hidden = m !== "kristall";
    kristall.hidden = m !== "kristall";
    balken.hidden = m === "kristall";
    wahl.querySelectorAll("button").forEach((b) => b.classList.toggle("gewaehlt", b.dataset.modus === m));
    if (m === "kristall") wahlSpeichern(true); else if (m === "uhr") wahlSpeichern(false);
  };
  const wahl = el("div", { class: "sprech-wahl" },
    el("button", { type: "button", class: "knopf zweitrangig", "data-modus": "uhr", onclick: () => modusWaehlen("uhr") }, "⏱ Ohne Mikrofon"),
    mikrofonMoeglich() ? el("button", { type: "button", class: "knopf zweitrangig", "data-modus": "kristall", onclick: () => modusWaehlen("kristall") }, "💎 Mit Mikrofon") : null);

  const frageText = a.laut ?? a.frage;
  const element = el("div", { class: "sprechen" },
    a.partner ? el("div", { class: "partner-karte" },
      el("b", {}, "👥 Partnerübung"),
      el("div", {}, el("b", {}, "A: "), a.partner.a),
      el("div", {}, el("b", {}, "B: "), a.partner.b)) : null,
    hoertextElement({ sprecher: a.partner ? "Die Frage zum Vorlesen" : "Die Prüferin fragt", text: frageText, stimme: { tonhoehe: 1.05, tempo: 0.9 } }),
    a.hilfen ? el("details", { class: "stichpunkte" }, el("summary", {}, "💡 Redemittel"), el("div", {}, a.hilfen)) : null,
    el("div", { class: "sprech-ziel" }, `Ziel: mindestens ${dauer} Sekunden sprechen.`),
    wahl, uhrBereich, kristallBereich,
    el("div", { class: "sprech-anzeige" }, kristall, el("div", {}, anzeige, balken, hinweis)),
    aufnahmeBereich,
    a.checkliste?.length ? el("div", { class: "checkliste" },
      el("h3", {}, a.partner ? "Partnercheck" : "Selbstcheck"),
      a.checkliste.map((punkt, i) => el("label", {}, haken[i], " ", punkt))) : null,
  );
  aktualisieren();
  modusWaehlen(wahlLesen() && mikrofonMoeglich() ? "kristall" : "uhr");

  return {
    element,
    erstesFeld: wahl.querySelector("button"),
    pruefen() {
      if (gesprochen < dauer) return { ok: false, leer: true, meldung: `Sprich noch etwas länger: ${Math.floor(gesprochen)} von ${dauer} Sekunden.` };
      if (haken.some((h) => !h.checked)) return { ok: false, leer: true, meldung: a.partner ? "Geht zusammen den Partnercheck durch und hakt alles ab." : "Geh den Selbstcheck durch und hake alles ab." };
      clearInterval(uhrTimer); uhrTimer = null;
      return { ok: true, meldung: "Stark gesprochen! 🗣️" };
    },
    loesungZeigen() {},
    sperren() { uhrKnopf.disabled = true; kristallKnopf.disabled = true; aufnahmeKnopf.disabled = true; haken.forEach((h) => { h.disabled = true; }); clearInterval(uhrTimer); },
  };
}
