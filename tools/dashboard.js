// Eldoria Lehrerzimmer: wertet Spielstand-Dateien einer Klasse aus.
// Alles läuft lokal im Browser; es werden keine Daten verschickt.

import { spielstandMitKopf, stufeVon } from "../src/spielstand.js";
import { QUESTS, FERTIGKEITEN, TEXT_NAMEN } from "../src/inhalte/quests.js";
import { KLASSEN } from "../src/inhalte/klassen.js";
import { beispielKlasse } from "./dashboard-beispiel.js";

const $ = (id) => document.getElementById(id);
const schueler = new Map();   // Schlüssel -> Auswertung
let gewaehlt = null;
let sortierung = { spalte: "name", ab: true };
let istBeispiel = false;

// ---------- Hilfen ----------

function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kinder.flat()) if (k != null && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}
const svg = (tag, attrs = {}, ...kinder) => {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  for (const k of kinder.flat()) if (k != null) e.append(k instanceof Node ? k : String(k));
  return e;
};
const prozent = (x) => (x == null ? "–" : `${Math.round(x * 100)} %`);
const minuten = (s) => (s < 3600 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`);
const datumKurz = (d) => (d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) : "–");
const datumLang = (d) => (d ? new Date(d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) : "–");
const tagSchluessel = (d) => new Date(d).toLocaleDateString("sv-SE");
const stufeKlasse = (r) => (r == null ? "ohne" : r >= 0.9 ? "s4" : r >= 0.7 ? "s3" : r >= 0.5 ? "s2" : "s1");

// ---------- Tooltip ----------

const tipp = $("tipp");
function tippSetzen(element, zeilen) {
  element.dataset.tipp = "1";
  element._tipp = zeilen;
  if (!element.hasAttribute("tabindex") && element.tagName !== "BUTTON") element.setAttribute("tabindex", "0");
}
function tippZeigen(ziel, x, y) {
  const z = ziel._tipp;
  tipp.replaceChildren(...z.map((zeile, i) => {
    const d = document.createElement("div");
    if (i === 0) { const b = document.createElement("b"); b.textContent = zeile; d.append(b); } else d.textContent = zeile;
    return d;
  }));
  tipp.hidden = false;
  const r = tipp.getBoundingClientRect();
  tipp.style.left = `${Math.min(window.innerWidth - r.width - 8, x + 14)}px`;
  tipp.style.top = `${Math.max(8, y - r.height - 12)}px`;
}
document.addEventListener("pointermove", (e) => {
  const ziel = e.target.closest?.("[data-tipp]");
  if (ziel) tippZeigen(ziel, e.clientX, e.clientY); else tipp.hidden = true;
});
document.addEventListener("focusin", (e) => {
  const ziel = e.target.closest?.("[data-tipp]");
  if (ziel) { const r = ziel.getBoundingClientRect(); tippZeigen(ziel, r.left + r.width / 2, r.top); }
});
document.addEventListener("focusout", () => { tipp.hidden = true; });

// ---------- Auswertung eines Spielstands ----------

function questAuswerten(z, q) {
  const erledigt = Boolean(z.erledigt?.[q.id]);
  const st = z.statistik?.quests?.[q.id];
  const info = { erledigt, rate: null, fehler: 0, loesung: 0, sekunden: 0, durchgaenge: st?.durchgaenge ?? 0, abgebrochen: st?.abgebrochen ?? 0, aufgaben: [], datum: null, versuche: 0 };
  if (q.kampf) {
    const kaempfe = (z.statistik?.kaempfe ?? []).filter((k) => k.quest === q.id || (!k.quest && q.id === "lythara_q1_boss"));
    info.versuche = kaempfe.length;
    info.kaempfe = kaempfe;
    const erster = kaempfe[0];
    if (erster) {
      info.rate = erster.richtig / Math.max(1, erster.richtig + erster.falsch);
      info.fehler = kaempfe.reduce((s, k) => s + k.falsch, 0);
      info.datum = kaempfe.find((k) => k.sieg)?.datum ?? erster.datum;
      info.aufgaben = erster.fragen.map((f, i) => ({ nr: i + 1, frage: f.frage, typ: f.typ, ersterVersuch: f.ok, fehler: f.ok ? 0 : 1 }));
    }
  } else if (st?.erster) {
    const a = st.erster.aufgaben;
    info.aufgaben = a;
    info.rate = a.length ? a.filter((x) => x.ersterVersuch).length / a.length : null;
    info.fehler = a.reduce((s, x) => s + (x.fehler ?? 0), 0);
    info.loesung = a.filter((x) => x.loesungGezeigt).length;
    info.sekunden = a.reduce((s, x) => s + (x.sekunden ?? 0), 0);
    info.datum = st.erster.datum;
  }
  info.status = erledigt ? (info.rate == null ? "ohne" : stufeKlasse(info.rate)) : (info.abgebrochen || info.durchgaenge || info.versuche ? "begonnen" : "offen");
  return info;
}

function auswerten(z, gespeichert, dateiname) {
  const quests = Object.fromEntries(QUESTS.map((q) => [q.id, questAuswerten(z, q)]));
  // Fertigkeiten: alle Aufgaben aus ersten Durchgängen, nach Prüfungsteil
  const fertig = {};
  for (const f of Object.keys(FERTIGKEITEN)) {
    const alle = QUESTS.filter((q) => q.fertigkeit === f).flatMap((q) => quests[q.id].aufgaben);
    fertig[f] = { n: alle.length, rate: alle.length ? alle.filter((a) => a.ersterVersuch).length / alle.length : null };
  }
  const tage = z.statistik?.tage ?? {};
  const daten = [
    ...(z.protokoll ?? []).map((p) => p.datum),
    ...Object.keys(tage),
    ...Object.values(quests).map((q) => q.datum),
    gespeichert,
  ].filter(Boolean).map((d) => new Date(d).getTime()).filter((t) => !Number.isNaN(t));
  const letzte = daten.length ? new Date(Math.max(...daten)) : null;
  const heute = new Date();
  let woche = 0;
  for (let i = 0; i < 7; i++) {
    const t = new Date(heute); t.setDate(heute.getDate() - i);
    woche += tage[tagSchluessel(t)] ?? 0;
  }
  return {
    schluessel: z.spielerId ?? `${z.held?.name ?? "?"}|${z.held?.kennung ?? ""}`,
    name: z.held?.name || "(ohne Heldenpass)",
    kennung: z.held?.kennung ?? "",
    heldenklasse: KLASSEN[z.held?.klasse]?.name ?? "",
    xp: z.xp ?? 0,
    stufe: stufeVon(z.xp ?? 0),
    erledigt: QUESTS.filter((q) => quests[q.id].erledigt).length,
    quests, fertig,
    spielzeit: z.statistik?.spielzeit ?? 0,
    woche, tage, letzte,
    gespeichert: gespeichert ? new Date(gespeichert) : letzte,
    texte: z.texte ?? {},
    protokoll: z.protokoll ?? [],
    codes: (z.codes ?? []).length,
    dateiname,
  };
}

// ---------- Dateien einlesen ----------

async function einlesen(dateien) {
  const fehler = [];
  if (istBeispiel) { schueler.clear(); istBeispiel = false; gewaehlt = null; }
  for (const datei of dateien) {
    if (!/\.(sav|json|txt)$/i.test(datei.name)) continue;
    try {
      const { daten, gespeichert } = spielstandMitKopf(await datei.text());
      const s = auswerten(daten, gespeichert, datei.name);
      const vorher = schueler.get(s.schluessel);
      if (!vorher || (s.gespeichert ?? 0) >= (vorher.gespeichert ?? 0)) schueler.set(s.schluessel, s);
    } catch (e) {
      fehler.push(`${datei.name}: ${e.message}`);
    }
  }
  $("meldungen").replaceChildren(...fehler.map((f) => el("div", {}, f)));
  alles();
}

$("dateien-knopf").addEventListener("click", () => $("dateien").click());
$("ordner-knopf").addEventListener("click", () => $("ordner").click());
$("dateien").addEventListener("change", (e) => { einlesen([...e.target.files]); e.target.value = ""; });
$("ordner").addEventListener("change", (e) => { einlesen([...e.target.files]); e.target.value = ""; });
$("beispiel-knopf").addEventListener("click", () => {
  schueler.clear();
  for (const z of beispielKlasse()) { const s = auswerten(z, z._gespeichert, "Beispiel"); schueler.set(s.schluessel, s); }
  istBeispiel = true;
  gewaehlt = null;
  $("meldungen").replaceChildren();
  alles();
});
const zone = $("einlesen");
zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("aktiv"); });
zone.addEventListener("dragleave", () => zone.classList.remove("aktiv"));
zone.addEventListener("drop", async (e) => {
  e.preventDefault();
  zone.classList.remove("aktiv");
  const dateien = [];
  const eintraege = [...(e.dataTransfer.items ?? [])].map((i) => i.webkitGetAsEntry?.()).filter(Boolean);
  const lies = (eintrag) => new Promise((fertig) => {
    if (eintrag.isFile) eintrag.file((f) => { dateien.push(f); fertig(); }, () => fertig());
    else if (eintrag.isDirectory) {
      const leser = eintrag.createReader();
      const alle = [];
      const weiter = () => leser.readEntries(async (teil) => {
        if (!teil.length) { for (const t of alle) await lies(t); fertig(); return; }
        alle.push(...teil); weiter();
      }, () => fertig());
      weiter();
    } else fertig();
  });
  if (eintraege.length) for (const ein of eintraege) await lies(ein);
  else dateien.push(...e.dataTransfer.files);
  einlesen(dateien);
});

// ---------- Darstellung ----------

function liste() {
  const l = [...schueler.values()];
  const { spalte, ab } = sortierung;
  const wert = (s) => spalte === "name" ? (s.kennung || s.name).toLowerCase()
    : spalte === "xp" ? s.xp : spalte === "woche" ? s.woche : spalte === "letzte" ? (s.letzte?.getTime() ?? 0)
    : spalte === "erledigt" ? s.erledigt : s.quests[spalte]?.rate ?? -1;
  l.sort((a, b) => { const x = wert(a), y = wert(b); return (x < y ? -1 : x > y ? 1 : 0) * (ab ? 1 : -1); });
  return l;
}

function alles() {
  const n = schueler.size;
  $("stand").textContent = n ? `${n} ${n === 1 ? "Spielstand" : "Spielstände"}${istBeispiel ? " · Beispieldaten" : ""}` : "";
  kennzahlen();
  uebersicht();
  stolpersteine();
  fertigkeiten();
  akte();
}

function kennzahlen() {
  const l = [...schueler.values()];
  const box = $("kennzahlen");
  if (!l.length) {
    box.replaceChildren(el("div", { class: "kennzahl", style: "grid-column:1/-1" },
      el("b", { style: "font-size:18px" }, "Noch keine Spielstände eingelesen"),
      el("span", {}, "Wähle oben die Dateien der Klasse aus oder schau dir zuerst die Beispielklasse an.")));
    return;
  }
  const aktiv = l.filter((s) => s.letzte && Date.now() - s.letzte.getTime() < 7 * 864e5).length;
  const schnitt = (f) => l.reduce((a, s) => a + f(s), 0) / l.length;
  box.replaceChildren(
    el("div", { class: "kennzahl" }, el("b", {}, l.length), el("span", {}, "Schülerinnen und Schüler")),
    el("div", { class: "kennzahl" }, el("b", {}, `${aktiv} von ${l.length}`), el("span", {}, "in den letzten 7 Tagen aktiv")),
    el("div", { class: "kennzahl" }, el("b", {}, minuten(schnitt((s) => s.woche))), el("span", {}, "Spielzeit pro Person in den letzten 7 Tagen (Ø)")),
    el("div", { class: "kennzahl" }, el("b", {}, `${schnitt((s) => s.erledigt).toFixed(1).replace(".", ",")} / ${QUESTS.length}`), el("span", {}, "Quests erledigt (Ø)")),
    el("div", { class: "kennzahl" }, el("b", {}, Math.round(schnitt((s) => s.xp))), el("span", {}, "XP (Ø)")),
  );
}

function sortKnopf(text, spalte) {
  const aktiv = sortierung.spalte === spalte;
  return el("button", {
    type: "button", "aria-label": `Nach ${text} sortieren`,
    onclick: () => { sortierung = { spalte, ab: aktiv ? !sortierung.ab : spalte === "name" }; uebersicht(); },
  }, text, aktiv ? (sortierung.ab ? " ▲" : " ▼") : "");
}

function uebersicht() {
  const l = liste();
  const rahmen = $("uebersicht");
  if (!l.length) { rahmen.replaceChildren(el("p", { class: "leer" }, "Hier erscheint eine Zeile pro Person, sobald Spielstände eingelesen sind.")); return; }
  const orte = [...new Set(QUESTS.map((q) => q.ort))];
  const kopf1 = el("tr", {}, el("th", { colspan: 1 }), ...orte.map((o) => el("th", { class: "gruppenkopf", colspan: QUESTS.filter((q) => q.ort === o).length }, o)), el("th", { colspan: 4 }));
  const kopf2 = el("tr", {},
    el("th", {}, sortKnopf("Name / Kennung", "name")),
    ...QUESTS.map((q) => el("th", { class: "quest", title: q.thema }, sortKnopf(q.titel, q.id))),
    el("th", {}, sortKnopf("XP", "xp")),
    el("th", {}, sortKnopf("Quests", "erledigt")),
    el("th", {}, sortKnopf("7 Tage", "woche")),
    el("th", {}, sortKnopf("Zuletzt", "letzte")),
  );
  const zeilen = l.map((s) => {
    const tr = el("tr", { class: "schueler" + (gewaehlt === s.schluessel ? " gewaehlt" : ""), tabindex: "0", "aria-label": `Schülerakte von ${s.name} öffnen` });
    const oeffnen = () => { gewaehlt = gewaehlt === s.schluessel ? null : s.schluessel; uebersicht(); akte(); if (gewaehlt) $("akte").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
    tr.addEventListener("click", oeffnen);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); oeffnen(); } });
    tr.append(el("td", { class: "name" }, el("b", {}, s.kennung || s.name), s.kennung ? el("span", { class: "klein" }, s.name) : null));
    for (const q of QUESTS) {
      const i = s.quests[q.id];
      const text = i.status === "offen" ? "·" : i.status === "begonnen" ? "…" : i.rate == null ? "✓" : Math.round(i.rate * 100);
      const td = el("td", { class: `zelle ${i.status === "offen" ? "offen" : i.status === "begonnen" ? "begonnen" : i.status}` }, String(text));
      const zeilenTipp = [
        i.status === "offen" ? "noch nicht begonnen" : i.status === "begonnen" ? "begonnen, nicht abgeschlossen" : i.rate == null ? "erledigt (ohne Einzelwerte)" : `${prozent(i.rate)} beim ersten Versuch richtig`,
        `${s.kennung || s.name} · ${q.titel}`,
      ];
      if (i.erledigt && !q.kampf && i.aufgaben.length) zeilenTipp.push(`${i.fehler} Fehlversuche · ${i.loesung}× Lösung angesehen · ${minuten(i.sekunden)}`);
      if (q.kampf && i.versuche) zeilenTipp.push(`${i.versuche} ${i.versuche === 1 ? "Kampf" : "Kämpfe"}${i.erledigt ? ", gewonnen" : ""}`);
      if (i.abgebrochen) zeilenTipp.push(`${i.abgebrochen}× abgebrochen`);
      if (i.datum) zeilenTipp.push(`am ${datumLang(i.datum)}`);
      tippSetzen(td, zeilenTipp);
      td.removeAttribute("tabindex");
      tr.append(td);
    }
    const alt = s.letzte && Date.now() - s.letzte.getTime() > 7 * 864e5;
    tr.append(
      el("td", { class: "zahl" }, s.xp),
      el("td", { class: "zahl" }, `${s.erledigt}/${QUESTS.length}`),
      el("td", { class: "zahl" }, minuten(s.woche)),
      el("td", { class: "zahl" + (alt ? " alt" : "") }, datumKurz(s.letzte), alt ? " ⚠" : ""),
    );
    return tr;
  });
  rahmen.replaceChildren(el("table", { class: "uebersicht" }, el("thead", {}, kopf1, kopf2), el("tbody", {}, zeilen)));
}

function balken(beschriftung, wertText, anteil, { marke = null, tippZeilen = null } = {}) {
  const bahn = el("div", { class: "bahn" }, el("div", { class: "fuellung", style: `width:${Math.max(0, Math.min(1, anteil)) * 100}%` }));
  if (marke != null) bahn.append(el("div", { class: "marke", style: `left:calc(${marke * 100}% - 1.5px)` }));
  const zeile = el("div", { class: "balken-zeile" }, el("div", { class: "beschriftung" }, el("span", {}, beschriftung), el("span", { class: "zahl" }, wertText)), bahn);
  if (tippZeilen) tippSetzen(zeile, tippZeilen);
  return zeile;
}

function stolpersteine() {
  const sammel = new Map();
  for (const s of schueler.values()) {
    for (const q of QUESTS) {
      for (const a of s.quests[q.id].aufgaben) {
        if (a.typ === "freitext") continue;
        const key = `${q.id}#${a.nr}`;
        const e = sammel.get(key) ?? { q, nr: a.nr, frage: a.frage, n: 0, richtig: 0, fehler: 0 };
        e.n++; if (a.ersterVersuch) e.richtig++; e.fehler += a.fehler ?? 0;
        sammel.set(key, e);
      }
    }
  }
  const l = [...sammel.values()].filter((e) => e.n >= Math.min(2, schueler.size)).map((e) => ({ ...e, rate: e.richtig / e.n }))
    .sort((a, b) => a.rate - b.rate || b.fehler - a.fehler).slice(0, 8);
  const box = $("stolper");
  if (!l.length) { box.replaceChildren(el("p", { class: "leer" }, "Sobald Aufgaben gelöst wurden, stehen hier die schwierigsten.")); return; }
  box.replaceChildren(...l.map((e) => balken(
    `${e.q.titel} · Aufgabe ${e.nr}: ${e.frage}`,
    `${prozent(e.rate)} (${e.richtig}/${e.n})`,
    e.rate,
    { tippZeilen: [`${prozent(e.rate)} beim ersten Versuch richtig`, `${e.q.titel} · Aufgabe ${e.nr}`, e.frage, `${e.n} Personen · ${e.fehler} Fehlversuche insgesamt`] },
  )));
}

function klassenFertigkeiten() {
  const r = {};
  for (const f of Object.keys(FERTIGKEITEN)) {
    const werte = [...schueler.values()].map((s) => s.fertig[f]).filter((x) => x.rate != null);
    r[f] = werte.length ? werte.reduce((a, x) => a + x.rate, 0) / werte.length : null;
  }
  return r;
}

function fertigkeiten() {
  const box = $("fertigkeiten");
  if (!schueler.size) { box.replaceChildren(el("p", { class: "leer" }, "Noch keine Daten.")); return; }
  const k = klassenFertigkeiten();
  box.replaceChildren(...Object.entries(FERTIGKEITEN).map(([id, f]) => k[id] == null
    ? el("div", { class: "balken-zeile" }, el("div", { class: "beschriftung" }, el("span", {}, `${f.name} (${f.reich})`), el("span", { class: "leer" }, "noch keine Aufgaben im Spiel")))
    : balken(`${f.name} (${f.reich})`, prozent(k[id]), k[id], { tippZeilen: [prozent(k[id]), `${f.name}: Durchschnitt der Klasse`] })));
}

// ---------- Schülerakte ----------

function xpVerlauf(s) {
  const punkte = [];
  let summe = 0;
  for (const p of [...s.protokoll].sort((a, b) => new Date(a.datum) - new Date(b.datum))) {
    summe += p.xp;
    punkte.push({ t: new Date(p.datum).getTime(), xp: summe, grund: p.grund });
  }
  if (!punkte.length) return el("p", { class: "leer" }, "Noch keine XP.");
  const W = 420, H = 170, L = 40, R = 14, O = 12, U = 26;
  const t0 = punkte[0].t, t1 = Math.max(punkte.at(-1).t, t0 + 864e5);
  const ymax = Math.max(100, Math.ceil(punkte.at(-1).xp / 100) * 100);
  const x = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
  const y = (v) => O + (1 - v / ymax) * (H - O - U);
  const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `XP-Verlauf, zuletzt ${summe} XP` });
  for (let v = 0; v <= ymax; v += ymax / 4) {
    g.append(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "achse" }), svg("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end", class: "achsentext" }, Math.round(v)));
  }
  g.append(svg("text", { x: L, y: H - 6, class: "achsentext" }, datumKurz(t0)), svg("text", { x: W - R, y: H - 6, "text-anchor": "end", class: "achsentext" }, datumKurz(t1)));
  // Treppenlinie: XP steigen in Stufen
  let d = `M${x(punkte[0].t)},${y(0)}`;
  for (const p of punkte) d += ` H${x(p.t)} V${y(p.xp)}`;
  d += ` H${x(t1)}`;
  g.append(svg("path", { d: d + ` V${y(0)} Z`, fill: "var(--balken)", opacity: "0.1" }));
  g.append(svg("path", { d, fill: "none", stroke: "var(--balken)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  const letzte = punkte.at(-1);
  g.append(svg("circle", { cx: x(t1), cy: y(letzte.xp), r: 4.5, fill: "var(--balken)", stroke: "var(--flaeche)", "stroke-width": 2 }));
  g.append(svg("text", { x: x(t1) - 8, y: y(letzte.xp) - 9, "text-anchor": "end", class: "wertetext" }, `${letzte.xp} XP`));
  for (const p of punkte) {
    const hit = svg("rect", { x: x(p.t) - 8, y: O, width: 16, height: H - O - U, fill: "transparent" });
    tippSetzen(hit, [`${p.xp} XP`, p.grund, datumLang(p.t)]);
    g.append(hit);
  }
  return g;
}

function aktivitaet(s) {
  const W = 420, H = 156, L = 34, R = 6, O = 20, U = 24, tage = 28;
  const heute = new Date();
  const werte = [];
  for (let i = tage - 1; i >= 0; i--) {
    const t = new Date(heute); t.setDate(heute.getDate() - i);
    werte.push({ t, min: (s.tage[tagSchluessel(t)] ?? 0) / 60 });
  }
  const ymax = Math.max(15, Math.ceil(Math.max(...werte.map((w) => w.min)) / 15) * 15);
  const bw = (W - L - R) / tage;
  const y = (v) => O + (1 - v / ymax) * (H - O - U);
  const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Spielzeit pro Tag, letzte 4 Wochen" });
  for (let v = 0; v <= ymax; v += ymax / 3) g.append(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "achse" }), svg("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end", class: "achsentext" }, `${Math.round(v)}`));
  werte.forEach((w, i) => {
    const xx = L + i * bw;
    if (w.min > 0) {
      const h = Math.max(2, (w.min / ymax) * (H - O - U));
      const breite = Math.min(24, bw - 2);
      const r = Math.min(4, breite / 2, h);
      const x0 = xx + (bw - breite) / 2, y0 = y(0) - h;
      g.append(svg("path", { d: `M${x0},${y(0)} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + breite - r} Q${x0 + breite},${y0} ${x0 + breite},${y0 + r} V${y(0)} Z`, fill: "var(--balken)" }));
    }
    const hit = svg("rect", { x: xx, y: O, width: bw, height: H - O - U, fill: "transparent" });
    tippSetzen(hit, [`${Math.round(w.min)} min`, datumLang(w.t)]);
    g.append(hit);
    if (i % 7 === 0 || i === tage - 1) g.append(svg("text", { x: xx + bw / 2, y: H - 6, "text-anchor": "middle", class: "achsentext" }, datumKurz(w.t)));
  });
  g.append(svg("text", { x: L - 6, y: 9, "text-anchor": "end", class: "achsentext" }, "min"));
  return g;
}

function akte() {
  const box = $("akte");
  const s = gewaehlt ? schueler.get(gewaehlt) : null;
  if (!s) { box.hidden = true; box.replaceChildren(); return; }
  box.hidden = false;
  const k = klassenFertigkeiten();
  const fertigBox = el("div", { class: "balken-liste" }, Object.entries(FERTIGKEITEN).map(([id, f]) => s.fertig[id].rate == null
    ? el("div", { class: "balken-zeile" }, el("div", { class: "beschriftung" }, el("span", {}, f.name), el("span", { class: "leer" }, "noch keine Aufgaben")))
    : balken(f.name, `${prozent(s.fertig[id].rate)} · Klasse ${prozent(k[id])}`, s.fertig[id].rate, { marke: k[id], tippZeilen: [prozent(s.fertig[id].rate), `${f.name} (${s.fertig[id].n} Aufgaben)`, `Klassendurchschnitt: ${prozent(k[id])} (schwarzer Strich)`] })));

  const questTabelle = el("table", { class: "einzel" },
    el("thead", {}, el("tr", {}, el("th", {}, "Quest"), el("th", {}, "Stand"), el("th", { class: "r" }, "1. Versuch"), el("th", { class: "r" }, "Fehler"), el("th", { class: "r" }, "Lösung"), el("th", { class: "r" }, "Zeit"), el("th", { class: "r" }, "Datum"))),
    el("tbody", {}, QUESTS.map((q) => {
      const i = s.quests[q.id];
      const stand = i.erledigt ? el("span", { class: "status ok" }, "✓ erledigt") : i.status === "begonnen" ? el("span", { class: "status" }, "… begonnen") : el("span", { class: "klein" }, "offen");
      return el("tr", {},
        el("td", {}, q.titel, el("div", { class: "klein" }, q.thema)),
        el("td", {}, stand, i.abgebrochen ? el("div", { class: "klein" }, `${i.abgebrochen}× abgebrochen`) : null, q.kampf && i.versuche ? el("div", { class: "klein" }, `${i.versuche} ${i.versuche === 1 ? "Kampf" : "Kämpfe"}`) : null),
        el("td", { class: "r" }, prozent(i.rate)),
        el("td", { class: "r" }, i.aufgaben.length ? i.fehler : "–"),
        el("td", { class: "r" }, i.aufgaben.length && !q.kampf ? `${i.loesung}×` : "–"),
        el("td", { class: "r" }, i.sekunden ? minuten(i.sekunden) : "–"),
        el("td", { class: "r" }, datumKurz(i.datum)));
    })));

  // Aufgaben, die beim ersten Versuch nicht geklappt haben
  const schwer = QUESTS.flatMap((q) => s.quests[q.id].aufgaben.filter((a) => !a.ersterVersuch && a.typ !== "freitext").map((a) => ({ q, a })));
  const texte = Object.entries(s.texte);

  box.replaceChildren(
    el("div", { class: "kopfzeile" },
      el("h2", {}, s.name),
      el("span", { class: "klein" }, [s.kennung, s.heldenklasse, `Stufe ${s.stufe.stufe}: ${s.stufe.titel}`, `${s.xp} XP`].filter(Boolean).join(" · ")),
      el("span", { class: "klein" }, `Spielzeit gesamt ${minuten(s.spielzeit)} · zuletzt aktiv ${datumLang(s.letzte)} · Datei vom ${datumLang(s.gespeichert)}${s.codes ? ` · ${s.codes} Lehrercode${s.codes === 1 ? "" : "s"}` : ""}`),
      el("button", { class: "knopf zweit", type: "button", style: "margin-left:auto", onclick: () => { gewaehlt = null; uebersicht(); akte(); } }, "Schließen")),
    el("div", { class: "akte-raster" },
      el("div", {}, el("h3", {}, "XP-Verlauf"), xpVerlauf(s)),
      el("div", {}, el("h3", {}, "Spielzeit pro Tag (letzte 4 Wochen)"), aktivitaet(s)),
      el("div", {}, el("h3", { style: "margin-bottom:10px" }, "Fertigkeiten"), fertigBox,
        el("p", { class: "klein" }, "Balken: diese Person · schwarzer Strich: Durchschnitt der Klasse"))),
    el("h3", { style: "margin-top:18px" }, "Quests"),
    el("div", { class: "tabelle-rahmen" }, questTabelle),
    el("h3", { style: "margin-top:18px" }, `Beim ersten Versuch falsch (${schwer.length})`),
    schwer.length
      ? el("ul", { class: "klein", style: "margin:6px 0 0;padding-left:18px;max-width:90ch" }, schwer.map(({ q, a }) => el("li", {}, `${q.titel}, Aufgabe ${a.nr}: ${a.frage}`, a.loesungGezeigt ? " (Lösung angesehen)" : a.fehler ? ` (${a.fehler} ${a.fehler === 1 ? "Fehlversuch" : "Fehlversuche"})` : "")))
      : el("p", { class: "leer" }, "Keine – alles beim ersten Versuch richtig oder noch keine Daten."),
    el("h3", { style: "margin-top:18px" }, "Eigene Texte"),
    texte.length
      ? texte.map(([id, t]) => {
          const woerter = (t.text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
          const kopieren = el("button", { class: "knopf zweit", type: "button", style: "padding:4px 10px;font-size:13px" }, "Text kopieren");
          kopieren.addEventListener("click", async () => {
            try { await navigator.clipboard.writeText(t.text); kopieren.textContent = "Kopiert ✓"; } catch { kopieren.textContent = "Bitte von Hand markieren"; }
          });
          return el("div", { class: "text-karte" },
            el("div", { style: "display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between" },
              el("b", {}, TEXT_NAMEN[id] ?? id), el("span", { class: "klein" }, `${woerter} Wörter · ${datumLang(t.datum)}`), kopieren),
            el("p", {}, t.text));
        })
      : el("p", { class: "leer" }, "Noch keine eigenen Texte."),
  );
}

// ---------- Export ----------

function tabellenZeilen() {
  const kopf = ["Kennung", "Name", "Heldenklasse", "XP", "Stufe", "Quests erledigt", ...QUESTS.map((q) => `${q.titel} (1. Versuch %)`), "Spielzeit gesamt (min)", "Spielzeit 7 Tage (min)", "Zuletzt aktiv", "Datei vom"];
  const zeilen = liste().map((s) => [
    s.kennung, s.name, s.heldenklasse, s.xp, s.stufe.stufe, s.erledigt,
    ...QUESTS.map((q) => { const i = s.quests[q.id]; return i.erledigt ? (i.rate == null ? "erledigt" : Math.round(i.rate * 100)) : i.status === "begonnen" ? "begonnen" : ""; }),
    Math.round(s.spielzeit / 60), Math.round(s.woche / 60),
    s.letzte ? s.letzte.toLocaleDateString("de-DE") : "", s.gespeichert ? s.gespeichert.toLocaleDateString("de-DE") : "",
  ]);
  return [kopf, ...zeilen];
}

async function speichernAlsDatei(name, inhalt) {
  const plattform = window.claude?.use ? await window.claude.use("downloads").catch(() => null) : null;
  if (plattform) {
    try { await plattform.save({ filename: name, data: inhalt }); }
    catch (e) { if (e?.code !== "declined") $("meldungen").replaceChildren(el("div", {}, "Speichern ist hier nicht möglich. Nutze „Tabelle kopieren“.")); }
    return;
  }
  const url = URL.createObjectURL(new Blob([inhalt], { type: "text/csv;charset=utf-8" }));
  const a = el("a", { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

$("csv-knopf").addEventListener("click", () => {
  if (!schueler.size) return;
  const csv = "﻿" + tabellenZeilen().map((z) => z.map((w) => `"${String(w).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  speichernAlsDatei(`Eldoria_Klassenstand_${new Date().toLocaleDateString("sv-SE")}.csv`, csv);
});
$("kopieren-knopf").addEventListener("click", async (e) => {
  if (!schueler.size) return;
  const text = tabellenZeilen().map((z) => z.join("\t")).join("\n");
  try { await navigator.clipboard.writeText(text); e.target.textContent = "Kopiert ✓ – in Excel einfügen"; }
  catch { e.target.textContent = "Kopieren nicht möglich"; }
  setTimeout(() => { e.target.textContent = "Tabelle kopieren (für Excel)"; }, 2500);
});

alles();
window.lehrerzimmer = { schueler, einlesen };
