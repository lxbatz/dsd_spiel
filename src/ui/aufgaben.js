// Aufgabentypen und der Ablauf von Aufgabenfolgen.
//
// Jede Aufgabe ist ein Objekt mit einem Feld "typ". Unterstützte Typen:
//
//   auswahl       { frage, optionen: [..], richtig: <Index>, erklaerung?, tipp?, mischen? }
//   luecke        { frage, text: "Ich {heiße} Mira.", auswahl?: true, ablenker?: [..], erklaerung? }
//                   In {..} steht die Lösung, Alternativen mit | trennen: {heiße|bin}
//   ordnen        { frage, teile: [..in richtiger Reihenfolge..], loesungen?: ["alternativer Satz"], erklaerung? }
//   zuordnen      { frage, paare: [[links, rechts], ..], ablenker?: [..], beispiel?: [links, rechts], erklaerung? }
//                   ablenker: zusätzliche rechte Seiten, die übrig bleiben (wie DSD Lesen Teil 2/5, Hören Teil 5)
//                   beispiel: eine schon gelöste Zeile (Nummer 0 / Lösung Z) über den Aufgaben
//   richtigfalsch { frage, aussagen: [[satz, true|false], ..], erklaerung? }
//   block         { frage, aufgaben: [..], nummer?: 1 } – mehrere Aufgaben (auswahl, richtigfalsch, luecke …) auf
//                   einem Blatt, z. B. zu einem Hörtext wie in DSD Hören Teil 3/4: erst lesen, dann hören, dann alles prüfen
//   sprechen      { frage, dauer, hilfen?, checkliste, partner? } – Sprechaufgabe mit Sprechuhr oder Stimmkristall (ui/sprechen.js)
//   freitext      { id, frage, minWoerter, checkliste: [..], muster: [{ such, ok, fehlt }], stichpunkte?, vorlage? }
//                   vorlage: Text (oder Funktion des Spielstands), der beim ersten Schreiben schon im Feld steht
//                   vergleich: weitere Texte (wie lesetext), aus denen nicht abgeschrieben werden soll.
//                   Der Lesetext wird immer verglichen (Abschriftprüfung, siehe abschriftFinden).
//
// Alle Typen können zusätzlich einen Lesetext haben:
//   lesetext: "<id aus texte.js>"  oder  { titel, text, quelle }
// und/oder einen Hörtext (siehe ui/hoeren.js):
//   hoertext: { sprecher, text, datei?, stimme?: { tonhoehe, tempo } }
//
// Eine Aufgabe kann auch eine Funktion sein, die den Spielstand bekommt und die
// Aufgabe liefert. So lassen sich Angaben aus dem Heldenpass einbauen:
//   (z) => ({ typ: "auswahl", frage: `… ${z.held.beruf} …`, … })

import { el, zeigen, knopf, fokus } from "./fenster.js";
import { mischen, woerterZaehlen } from "../hilfen.js";
import { hatEffekt, textSpeichern, zustand, questErgebnis } from "../zustand.js";
import { TEXTE } from "../inhalte/texte.js";
import { hoertextElement, hoerenStoppen } from "./hoeren.js";
import { sprechen, sprechenStoppen } from "./sprechen.js";
import { ton } from "../ton.js";

// ---------- Hilfen ----------

function normal(s) {
  return s.trim().replace(/\s+/g, " ").replace(/\s+([?.!,;:])/g, "$1");
}

function ohneEszett(s) {
  return s.replace(/ß/g, "ss");
}

/** Vergleicht eine Eingabe mit den erlaubten Lösungen. */
function vergleiche(eingabe, loesungen) {
  const e = normal(eingabe);
  if (!e) return { ok: false, art: "leer" };
  for (const l of loesungen) if (e === normal(l)) return { ok: true };
  for (const l of loesungen) if (ohneEszett(e) === ohneEszett(normal(l))) return { ok: true, art: "eszett" };
  for (const l of loesungen) if (e.toLowerCase() === normal(l).toLowerCase()) return { ok: false, art: "gross" };
  return { ok: false, art: "falsch" };
}

function lesetextHolen(lt) {
  if (!lt) return null;
  return typeof lt === "string" ? TEXTE[lt] : lt;
}

function lesetextElement(lt) {
  const t = lesetextHolen(lt);
  if (!t) return null;
  return el("div", { class: "lesetext" },
    t.titel ? el("b", {}, t.titel, el("br")) : null,
    t.text,
    t.quelle ? el("span", { class: "quelle" }, t.quelle) : null);
}

function umlautLeiste() {
  let letztes = null;
  const leiste = el("div", { class: "umlaute", title: "Sonderzeichen einfügen" },
    ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü", "„", "“"].map((z) =>
      el("button", {
        type: "button",
        onmousedown: (ev) => ev.preventDefault(), // Fokus im Textfeld behalten
        onclick: () => {
          const ziel = letztes;
          if (!ziel || ziel.disabled) return;
          const a = ziel.selectionStart ?? ziel.value.length;
          const b = ziel.selectionEnd ?? ziel.value.length;
          ziel.value = ziel.value.slice(0, a) + z + ziel.value.slice(b);
          ziel.selectionStart = ziel.selectionEnd = a + z.length;
          ziel.dispatchEvent(new Event("input"));
          ziel.focus();
        },
      }, z)));
  leiste.merken = (feld) => feld.addEventListener("focus", () => { letztes = feld; });
  return leiste;
}

// ---------- Aufgabentypen ----------
// Jede Funktion liefert { element, pruefen(), loesungZeigen(), sperren(), erstesFeld }
// pruefen() liefert { ok, leer?, meldung? }

function auswahl(a) {
  let gewaehlt = null;
  const reihenfolge = a.mischen === false ? a.optionen.map((_, i) => i) : mischen(a.optionen.map((_, i) => i));
  const knoepfe = new Map();
  const liste = el("div", { class: "optionen" },
    reihenfolge.map((index, pos) => {
      const b = el("button", {
        type: "button", class: "option",
        onclick: () => {
          gewaehlt = index;
          knoepfe.forEach((k) => k.classList.remove("gewaehlt", "falsch"));
          b.classList.add("gewaehlt");
        },
      }, el("span", { class: "buchstabe" }, "ABCDEFG"[pos]), el("span", {}, a.optionen[index]));
      knoepfe.set(index, b);
      return b;
    }));
  return {
    element: liste,
    erstesFeld: knoepfe.get(reihenfolge[0]),
    pruefen() {
      if (gewaehlt === null) return { ok: false, leer: true, meldung: "Bitte wähle eine Antwort." };
      const ok = gewaehlt === a.richtig;
      knoepfe.get(gewaehlt).classList.add(ok ? "richtig" : "falsch");
      return { ok, meldung: ok ? "" : (a.tipp ?? "Das stimmt leider nicht.") };
    },
    loesungZeigen() { knoepfe.get(a.richtig).classList.add("richtig"); },
    punkte: () => ({ punkte: gewaehlt === a.richtig ? 1 : 0, max: 1 }),
    sperren() { knoepfe.forEach((k) => { k.disabled = true; }); },
  };
}

function luecke(a) {
  const leiste = a.auswahl ? null : umlautLeiste();
  const felder = [];
  const teile = [];
  const re = /\{([^}]+)\}/g;
  let letzte = 0;
  let m;
  const alleLoesungen = [];
  while ((m = re.exec(a.text))) alleLoesungen.push(m[1].split("|")[0]);
  const optionen = a.auswahl ? mischen([...new Set([...alleLoesungen, ...(a.ablenker ?? [])])]) : null;
  const hinweis = hatEffekt("hinweis_buchstabe");

  re.lastIndex = 0;
  while ((m = re.exec(a.text))) {
    teile.push(a.text.slice(letzte, m.index));
    const loesungen = m[1].split("|");
    let feld;
    if (optionen) {
      feld = el("select", {}, el("option", { value: "" }, "– wählen –"), optionen.map((o) => el("option", { value: o }, o)));
    } else {
      feld = el("input", {
        type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false",
        size: Math.max(6, loesungen[0].length + 2),
      });
      leiste.merken(feld);
    }
    felder.push({ feld, loesungen });
    teile.push(feld);
    if (hinweis && !optionen) teile.push(el("span", { class: "tipp-buchstabe", title: "Amulett der Wortschätze" }, `(${loesungen[0][0]}…)`));
    letzte = m.index + m[0].length;
  }
  teile.push(a.text.slice(letzte));

  const element = el("div", {}, el("div", { class: "lueckentext" }, teile), leiste);
  return {
    element,
    erstesFeld: felder[0]?.feld,
    pruefen() {
      const ergebnisse = felder.map(({ feld, loesungen }) => vergleiche(feld.value, loesungen));
      if (ergebnisse.every((e) => e.art === "leer")) return { ok: false, leer: true, meldung: "Bitte fülle die Lücken aus." };
      ergebnisse.forEach((e, i) => {
        felder[i].feld.classList.remove("richtig", "falsch");
        felder[i].feld.classList.add(e.ok ? "richtig" : "falsch");
      });
      const richtig = ergebnisse.filter((e) => e.ok).length;
      const ok = richtig === felder.length;
      const extra = [];
      if (ergebnisse.some((e) => e.art === "gross")) extra.push("Achte auf Groß- und Kleinschreibung.");
      if (ergebnisse.some((e) => e.art === "eszett")) extra.push("Tipp: Im Deutschen schreibt man hier „ß“.");
      const meldung = ok
        ? extra.join(" ")
        : [`${richtig} von ${felder.length} Lücken sind richtig.`, ...extra].join(" ");
      return { ok, meldung };
    },
    loesungZeigen() {
      felder.forEach(({ feld, loesungen }) => {
        feld.value = loesungen[0];
        feld.classList.remove("falsch");
        feld.classList.add("richtig");
      });
    },
    punkte: () => ({ punkte: felder.filter(({ feld, loesungen }) => vergleiche(feld.value, loesungen).ok).length, max: felder.length }),
    sperren() { felder.forEach(({ feld }) => { feld.disabled = true; }); },
  };
}

function ordnen(a) {
  let reihenfolge = mischen(a.teile.map((_, i) => i));
  if (reihenfolge.every((v, i) => v === i) && a.teile.length > 1) reihenfolge = [...reihenfolge.slice(1), reihenfolge[0]];
  const ziel = el("div", { class: "ordnen-ziel", "aria-label": "Dein Satz" });
  const quelle = el("div", { class: "ordnen-quelle" });
  let gesperrt = false;

  function baustein(index) {
    const b = el("button", { type: "button", class: "baustein" }, a.teile[index]);
    b.dataset.index = index;
    b.addEventListener("click", () => {
      if (gesperrt) return;
      ziel.classList.remove("richtig", "falsch");
      (b.parentElement === ziel ? quelle : ziel).append(b);
    });
    return b;
  }
  reihenfolge.forEach((i) => quelle.append(baustein(i)));

  const satz = () => normal([...ziel.children].map((b) => b.textContent).join(" "));
  const loesungen = [a.teile.join(" "), ...(a.loesungen ?? [])].map(normal);

  return {
    element: el("div", {},
      el("div", { class: "fortschritt" }, "Klicke die Bausteine in der richtigen Reihenfolge an. Klicke noch einmal, um einen Baustein zurückzulegen."),
      ziel, quelle),
    erstesFeld: quelle.firstChild,
    pruefen() {
      if (quelle.children.length) {
        return ziel.children.length
          ? { ok: false, leer: true, meldung: "Benutze alle Bausteine." }
          : { ok: false, leer: true, meldung: "Bitte baue den Satz." };
      }
      const s = satz();
      const ok = loesungen.includes(s);
      ziel.classList.add(ok ? "richtig" : "falsch");
      return { ok, meldung: ok ? "" : (a.tipp ?? "Die Reihenfolge stimmt noch nicht.") };
    },
    loesungZeigen() {
      ziel.replaceChildren();
      quelle.replaceChildren();
      a.teile.forEach((_, i) => ziel.append(baustein(i)));
      ziel.classList.remove("falsch");
      ziel.classList.add("richtig");
    },
    punkte: () => ({ punkte: !quelle.children.length && loesungen.includes(satz()) ? 1 : 0, max: 1 }),
    sperren() { gesperrt = true; },
  };
}

function zuordnen(a) {
  const rechts = mischen([...a.paare.map((p) => p[1]), ...(a.ablenker ?? [])]);
  // Mit Ablenkern wie im DSD: Aussagen als Liste A, B, C … – in den Feldern wählt man nur den Buchstaben
  const mitListe = Boolean(a.ablenker?.length);
  const buchstabe = (r) => "ABCDEFGHIJKL"[rechts.indexOf(r)];
  const selects = a.paare.map(() =>
    el("select", {}, el("option", { value: "" }, mitListe ? "–" : "– wählen –"),
      rechts.map((r) => el("option", { value: r }, mitListe ? buchstabe(r) : r))));
  const liste = mitListe ? el("ol", { class: "zuordnen-liste" },
    a.beispiel ? el("li", { class: "zuordnen-beispiel" }, el("b", {}, "Z"), " ", a.beispiel[1]) : null,
    rechts.map((r) => el("li", {}, el("b", {}, buchstabe(r)), " ", r))) : null;
  return {
    element: el("div", {}, liste, el("table", { class: "zuordnen-tabelle" + (mitListe ? " mit-liste" : "") },
      el("tbody", {},
        a.beispiel ? el("tr", { class: "zuordnen-beispiel" }, el("td", { style: "width:45%" }, `Beispiel: ${a.beispiel[0]}`), el("td", {}, mitListe ? "Z" : a.beispiel[1])) : null,
        a.paare.map((p, i) => el("tr", {}, el("td", { style: "width:45%" }, p[0]), el("td", {}, selects[i])))))),
    erstesFeld: selects[0],
    pruefen() {
      if (selects.every((s) => !s.value)) return { ok: false, leer: true, meldung: "Bitte ordne zu." };
      let richtig = 0;
      selects.forEach((s, i) => {
        const ok = s.value === a.paare[i][1];
        if (ok) richtig++;
        s.classList.remove("richtig", "falsch");
        s.classList.add(ok ? "richtig" : "falsch");
      });
      const ok = richtig === selects.length;
      return { ok, meldung: ok ? "" : `${richtig} von ${selects.length} sind richtig.` };
    },
    loesungZeigen() {
      selects.forEach((s, i) => { s.value = a.paare[i][1]; s.classList.remove("falsch"); s.classList.add("richtig"); });
    },
    punkte: () => ({ punkte: selects.filter((s, i) => s.value === a.paare[i][1]).length, max: selects.length }),
    sperren() { selects.forEach((s) => { s.disabled = true; }); },
  };
}

function richtigfalsch(a) {
  const antworten = a.aussagen.map(() => null);
  const zeilen = a.aussagen.map(([satz], i) => {
    const r = el("button", { type: "button", class: "knopf zweitrangig" }, "Richtig");
    const f = el("button", { type: "button", class: "knopf zweitrangig" }, "Falsch");
    const zeile = el("div", { class: "rf-zeile" }, el("span", {}, satz), r, f);
    const waehlen = (wert) => {
      antworten[i] = wert;
      r.classList.toggle("gewaehlt", wert === true);
      f.classList.toggle("gewaehlt", wert === false);
      zeile.classList.remove("richtig", "falsch");
    };
    r.addEventListener("click", () => waehlen(true));
    f.addEventListener("click", () => waehlen(false));
    return { zeile, r, f };
  });
  return {
    element: el("div", {}, zeilen.map((z) => z.zeile)),
    erstesFeld: zeilen[0]?.r,
    pruefen() {
      if (antworten.some((x) => x === null)) return { ok: false, leer: true, meldung: "Bitte entscheide bei jeder Aussage." };
      let richtig = 0;
      zeilen.forEach((z, i) => {
        const ok = antworten[i] === a.aussagen[i][1];
        if (ok) richtig++;
        z.zeile.classList.remove("richtig", "falsch");
        z.zeile.classList.add(ok ? "richtig" : "falsch");
      });
      const ok = richtig === zeilen.length;
      return { ok, meldung: ok ? "" : `${richtig} von ${zeilen.length} sind richtig.` };
    },
    loesungZeigen() {
      zeilen.forEach((z, i) => {
        const wert = a.aussagen[i][1];
        z.r.classList.toggle("gewaehlt", wert === true);
        z.f.classList.toggle("gewaehlt", wert === false);
        z.zeile.classList.remove("falsch");
        z.zeile.classList.add("richtig");
      });
    },
    punkte: () => ({ punkte: antworten.filter((x, i) => x === a.aussagen[i][1]).length, max: zeilen.length }),
    sperren() { zeilen.forEach((z) => { z.r.disabled = true; z.f.disabled = true; }); },
  };
}

// ---------- Abschriftprüfung ----------
// Wer ganze Satzteile aus dem Ausgangstext übernimmt, bekommt eine Warnung (in der Prüfung zählen
// abgeschriebene Sätze nicht). Gezählt werden Folgen von ABSCHRIFT_WOERTER gleichen Wörtern.
// Wortfolgen aus Redemitteln, Vorlage und Aufgabenstellung sind erlaubt.
const ABSCHRIFT_WOERTER = 6;
// Wortfolgen zählen nur innerhalb eines Satzes, sonst ergeben kurze einfache Sätze zufällige Treffer.
const woerterVon = (t) => {
  let satz = 0, zuletzt = 0;
  const text = String(t ?? "");
  return [...text.matchAll(/[\p{L}\p{N}]+/gu)].map((m) => {
    if (/[.!?;:\n]/.test(text.slice(zuletzt, m.index))) satz++;
    zuletzt = m.index + m[0].length;
    return { w: m[0].toLowerCase(), satz, start: m.index, ende: zuletzt };
  });
};
const folge = (w, i) => (w[i].satz === w[i + ABSCHRIFT_WOERTER - 1].satz ? w.slice(i, i + ABSCHRIFT_WOERTER).map((x) => x.w).join(" ") : null);
const folgen = (woerter) => {
  const s = new Set();
  for (let i = 0; i + ABSCHRIFT_WOERTER <= woerter.length; i++) { const f = folge(woerter, i); if (f) s.add(f); }
  return s;
};

/** Liefert { anteil, stellen: ["…"] } – welche Stellen des Textes wörtlich aus den Quellen stammen. */
export function abschriftFinden(text, quellen, erlaubt = []) {
  const quelle = new Set(quellen.flatMap((q) => [...folgen(woerterVon(q))]));
  if (!quelle.size) return { anteil: 0, stellen: [] };
  for (const q of erlaubt) for (const f of folgen(woerterVon(q))) quelle.delete(f);
  const w = woerterVon(text);
  const kopiert = new Array(w.length).fill(false);
  for (let i = 0; i + ABSCHRIFT_WOERTER <= w.length; i++) {
    if (quelle.has(folge(w, i))) kopiert.fill(true, i, i + ABSCHRIFT_WOERTER);
  }
  const stellen = [];
  for (let i = 0; i < w.length; i++) {
    if (!kopiert[i] || (i > 0 && kopiert[i - 1])) continue;
    let j = i;
    while (j + 1 < w.length && kopiert[j + 1]) j++;
    stellen.push(text.slice(w[i].start, w[j].ende));
  }
  return { anteil: w.length ? kopiert.filter(Boolean).length / w.length : 0, stellen };
}
const quellText = (lt) => { const t = lesetextHolen(lt); return t ? [t.titel, t.text].filter(Boolean).join("\n") : ""; };
const kuerzen = (t, n = 80) => (t.length > n ? `${t.slice(0, n).trimEnd()} …` : t);

// Zauberspiegel: Ein Muster zählt erst, wenn der Satz dazu fertig ist – also mehr enthält als die
// gesuchten Wörter und mit . ! ? oder einer neuen Zeile endet. „Ich heiße“ allein reicht nicht.
// mu.wert (optional): Funktion des Spielstands, die Wörter liefert (z. B. den Namen aus dem Heldenpass).
// Dann muss mindestens eines davon genau so geschrieben (Groß/klein, Umlaute) im selben Satz stehen.
const ENDE = /[.!?\n]/;
const WORT = /[\p{L}\p{N}]+/gu;
const wortZahl = (t) => (t.match(WORT) ?? []).length;
export function musterPruefen(text, mu) {
  const re = new RegExp(mu.such, "giu");
  const werte = (typeof mu.wert === "function" ? [mu.wert(zustand)].flat() : []).map((w) => String(w ?? "").trim()).filter(Boolean);
  let halb = false, wertFehlt = null;
  for (const m of text.matchAll(re)) {
    const anfang = m.index, ende = m.index + m[0].length;
    // Leere Treffer (Prüfungen wie „nicht abgeschrieben“) und Muster mit eigenem Satzende (Überschrift, Frage) zählen sofort
    if (!m[0] || ENDE.test(m[0])) return { ok: true };
    let a = anfang; while (a > 0 && !ENDE.test(text[a - 1])) a--;
    let b = ende; while (b < text.length && !ENDE.test(text[b])) b++;
    const fertig = b < text.length;
    const rest = wortZahl(text.slice(a, anfang)) + wortZahl(text.slice(ende, b));
    if (!fertig || rest < 1) { halb = true; continue; }
    if (werte.length) {
      const satz = text.slice(a, b);
      if (!werte.some((w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(satz))) { wertFehlt = werte.join(" / "); continue; }
    }
    return { ok: true };
  }
  if (wertFehlt) return { ok: false, wert: wertFehlt };
  return { ok: false, halb };
}

function freitext(a) {
  const leiste = umlautLeiste();
  const vorlage = typeof a.vorlage === "function" ? a.vorlage(zustand) : a.vorlage;
  const vorher = zustand.texte[a.id]?.text ?? vorlage ?? "";
  const feld = el("textarea", { class: "freitext", spellcheck: "false", placeholder: "Schreibe hier deinen Text …" });
  feld.value = vorher;
  leiste.merken(feld);
  const zaehler = el("div", { class: "wortzahl" });
  const analyse = el("ul", { class: "analyse" });
  const haken = (a.checkliste ?? []).map((punkt) => el("input", { type: "checkbox" }));
  const stichpunkte = typeof a.stichpunkte === "function" ? a.stichpunkte(zustand) : a.stichpunkte;
  const quellen = [a.lesetext, ...(a.vergleich ?? [])].map(quellText).filter(Boolean);
  const erlaubt = [stichpunkte, vorlage, a.frage].filter((x) => typeof x === "string");
  const warnung = el("div", { class: "feedback schlecht abschrift-warnung", hidden: true, role: "alert" });
  const abschrift = () => abschriftFinden(feld.value, quellen, erlaubt);

  function aktualisieren() {
    const n = woerterZaehlen(feld.value);
    zaehler.textContent = `${n} Wörter${a.minWoerter ? ` (mindestens ${a.minWoerter})` : ""}`;
    analyse.replaceChildren(...(a.muster ?? []).map((mu) => {
      const e = musterPruefen(feld.value, mu);
      if (e.ok) return el("li", { class: "ok" }, `✔ ${mu.ok}`);
      if (e.wert) return el("li", { class: "fehlt halb" }, `✘ ${mu.fehlt} Schreib es genau wie in deinem Heldenpass: „${e.wert}“.`);
      if (e.halb) return el("li", { class: "fehlt halb" }, `✘ ${mu.fehlt} Schreib den Satz zu Ende (mit Punkt).`);
      return el("li", { class: "fehlt" }, `✘ ${mu.fehlt}`);
    }));
    const { stellen } = abschrift();
    warnung.hidden = !stellen.length;
    if (stellen.length) {
      warnung.replaceChildren(
        el("b", {}, "⚠ Achtung, abgeschrieben! "),
        stellen.length === 1 ? "Diese Stelle stimmt wörtlich mit dem Ausgangstext überein: " : `${stellen.length} Stellen stimmen wörtlich mit dem Ausgangstext überein, zum Beispiel: `,
        el("i", {}, `„${kuerzen(stellen[0])}“`),
        el("br"),
        "In der Prüfung zählen abgeschriebene Sätze nicht – das gibt 0 Punkte. Schreib diese Stellen mit eigenen Worten.");
    }
  }
  feld.addEventListener("input", aktualisieren);
  aktualisieren();

  const kopieren = el("button", {
    type: "button", class: "knopf zweitrangig",
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(feld.value);
        kopieren.textContent = "✔ Kopiert";
      } catch {
        feld.select();
        kopieren.textContent = "Text markiert – mit Strg+C kopieren";
      }
    },
  }, "📋 Text kopieren");

  return {
    element: el("div", {},
      stichpunkte ? el("div", { class: "stichpunkte" }, stichpunkte) : null,
      feld, leiste, zaehler, warnung,
      a.muster?.length ? el("div", {}, el("b", {}, "Der Zauberspiegel prüft deinen Text:"), analyse) : null,
      a.checkliste?.length ? el("div", { class: "checkliste" },
        el("h3", {}, "Selbstcheck"),
        a.checkliste.map((punkt, i) => el("label", {}, haken[i], " ", punkt))) : null,
      el("div", { style: "margin-top:8px" }, kopieren),
    ),
    erstesFeld: feld,
    pruefen() {
      const n = woerterZaehlen(feld.value);
      const probleme = [];
      if (a.minWoerter && n < a.minWoerter) probleme.push(`Dein Text hat ${n} Wörter. Schreibe mindestens ${a.minWoerter} Wörter.`);
      if (haken.some((h) => !h.checked)) probleme.push("Geh den Selbstcheck durch und hake alle Punkte ab.");
      if (probleme.length) return { ok: false, leer: true, meldung: probleme.join(" ") };
      textSpeichern(a.id, feld.value);
      const { anteil, stellen } = abschrift();
      // Überwiegend abgeschrieben: Der Text wird nicht angenommen (in der Prüfung wären das 0 Punkte).
      if (anteil >= 0.5) return { ok: false, meldung: `⚠ Dein Text ist zum größten Teil aus dem Ausgangstext abgeschrieben (${Math.round(anteil * 100)} %). Das zählt nicht. Schreib den Text mit eigenen Worten.` };
      const hinweis = stellen.length ? `\n⚠ Aber Achtung: ${stellen.length === 1 ? "Eine Stelle ist" : `${stellen.length} Stellen sind`} wörtlich abgeschrieben. Schreib sie noch mit eigenen Worten um – in der Prüfung zählen sie nicht.` : "";
      return { ok: true, meldung: "Dein Text ist gespeichert. Du findest ihn im Heldenpass unter „Meine Texte“. Zeig ihn deiner Lehrkraft!" + hinweis };
    },
    loesungZeigen() {},
    sperren() { feld.disabled = true; haken.forEach((h) => { h.disabled = true; }); },
  };
}

function block(a) {
  const start = a.nummer ?? 1;
  const teile = a.aufgaben.map((teil) => ({ teil, r: TYPEN[teil.typ](teil) }));
  const kaesten = teile.map(({ teil, r }, i) => el("div", { class: "block-teil" },
    el("div", { class: "block-frage" }, el("b", {}, `${start + i}`), " ", teil.frage),
    r.element));
  return {
    element: el("div", { class: "block" }, kaesten),
    erstesFeld: teile[0]?.r.erstesFeld,
    pruefen() {
      const ergebnisse = teile.map(({ r }) => r.pruefen());
      if (ergebnisse.some((e) => e.leer)) return { ok: false, leer: true, meldung: "Bitte bearbeite alle Aufgaben." };
      const richtig = ergebnisse.filter((e) => e.ok).length;
      kaesten.forEach((k, i) => { k.classList.remove("richtig", "falsch"); k.classList.add(ergebnisse[i].ok ? "richtig" : "falsch"); });
      const ok = richtig === teile.length;
      return { ok, meldung: ok ? "" : `${richtig} von ${teile.length} Aufgaben sind richtig.` };
    },
    loesungZeigen() { teile.forEach(({ r }) => r.loesungZeigen()); kaesten.forEach((k) => k.classList.remove("falsch")); },
    punkte: () => teile.map(({ r }) => r.punkte?.() ?? { punkte: 0, max: 0 }).reduce((x, y) => ({ punkte: x.punkte + y.punkte, max: x.max + y.max }), { punkte: 0, max: 0 }),
    sperren() { teile.forEach(({ r }) => r.sperren()); },
  };
}

const TYPEN = { auswahl, luecke, ordnen, zuordnen, richtigfalsch, freitext, block, sprechen };

export function aufgabeErstellen(aufgabe) {
  const fn = TYPEN[aufgabe.typ];
  if (!fn) throw new Error(`Unbekannter Aufgabentyp: ${aufgabe.typ}`);
  return fn(aufgabe);
}

export { lesetextElement };

/** Wandelt eine Aufgaben-Funktion in eine Aufgabe um (mit dem aktuellen Spielstand). */
export function aufgabeAufloesen(aufgabe) {
  return typeof aufgabe === "function" ? aufgabe(zustand) : aufgabe;
}

// ---------- Ablauf ----------

const ABBRUCH = Symbol("abbruch");

/**
 * Zeigt eine Folge von Aufgaben im Übungsmodus:
 * Bei Fehlern darf man es noch einmal versuchen, nach zwei Fehlversuchen
 * kann man sich die Lösung zeigen lassen. Eine Aufgabe mit gezeigter Lösung kommt am Ende
 * noch einmal (ohne „Lösung zeigen“): Eine Quest ist erst geschafft, wenn alles selbst gelöst ist.
 * Mit „Quest abbrechen“ kann man jederzeit aufhören; dann wird nichts gespeichert.
 * Liefert { gesamt, ersterVersuch, faktor } (faktor: Anteil der XP, siehe leistungWert)
 * oder { abgebrochen: true }.
 */
export async function aufgabenFolge({ id, titel, untertitel, aufgaben: roh, lesetext, kopf }) {
  const aufgaben = roh.map(aufgabeAufloesen)
    .map((a) => (a.typ === "freitext" && lesetext && !a.lesetext ? { ...a, vergleich: [...(a.vergleich ?? []), lesetext] } : a));
  const schonErledigt = Boolean(id && zustand.erledigt?.[id]);
  leistungOffen = null;
  let ersterVersuch = 0;
  const protokoll = [];
  const werte = aufgaben.map(() => 0);
  // Warteschlange: [Index der Aufgabe, Wiederholung?]
  const schlange = aufgaben.map((_, i) => [i, false]);
  for (let schritt = 0; schritt < schlange.length; schritt++) {
    const [i, wiederholung] = schlange[schritt];
    const a = aufgaben[i];
    const letzte = schritt === schlange.length - 1;
    const start = performance.now();
    let fehlerZahl = 0, loesungGezeigt = false;
    const ok = await new Promise((fertig) => {
      const r = aufgabeErstellen(a);
      const abbruch = knopf("Quest abbrechen", () => fertig(ABBRUCH), "knopf zweitrangig abbrechen");
      const feedback = el("div", { class: "feedback", hidden: true });
      const leiste = el("div", { class: "knopfleiste" });
      const mitte = el("div", { class: "knopfmitte" });
      let versuche = 0;

      const melden = (art, text) => {
        feedback.className = `feedback ${art}`;
        feedback.replaceChildren(...text.split("\n").flatMap((z, j) => (j ? [el("br"), z] : [z])));
        feedback.hidden = !text;
        if (art === "gut") ton("richtig");
        else if (art === "schlecht") ton("falsch");
      };

      const weiterKnopf = (warRichtig, nochmal = false) => {
        const w = knopf(nochmal ? "Weiter ▸" : letzte ? "Fertig ✔" : "Nächste Aufgabe ▸", () => fertig(warRichtig));
        leiste.replaceChildren(w);
        mitte.replaceChildren();
        fokus(w);
      };

      const loesungKnopf = knopf("Lösung zeigen", () => {
        r.loesungZeigen();
        r.sperren();
        loesungGezeigt = true;
        melden("info", ["So ist es richtig.", a.erklaerung,
          "Merk dir die Lösung gut! Diese Aufgabe kommt am Ende noch einmal. Die Quest ist erst geschafft, wenn du sie selbst löst. Für diese Aufgabe gibt es keine XP."].filter(Boolean).join("\n"));
        weiterKnopf(false, true);
      }, "knopf zweitrangig");

      const pruefKnopf = knopf("Prüfen", () => {
        const e = r.pruefen();
        if (e.leer) { melden("info", e.meldung); return; }
        if (e.ok) {
          r.sperren();
          melden("gut", [a.typ === "freitext" ? "Geschafft! ✍️" : "Richtig! 🎉", e.meldung, a.erklaerung].filter(Boolean).join("\n"));
          weiterKnopf(versuche === 0);
          return;
        }
        versuche++;
        fehlerZahl = versuche;
        const loesungErlaubt = versuche >= 2 && !wiederholung && a.typ !== "freitext";
        melden("schlecht", [e.meldung, loesungErlaubt ? "Versuch es noch einmal. Oder lass dir die Lösung zeigen. Dann kommt die Aufgabe später noch einmal." : "Versuch es noch einmal!"].join("\n"));
        if (loesungErlaubt && !leiste.contains(loesungKnopf)) leiste.prepend(loesungKnopf);
      });
      leiste.append(pruefKnopf);
      if (hilfsmittelKnopf) { const k = hilfsmittelKnopf(r, a); if (k) mitte.append(k); }

      const zaehlung = aufgaben.length > 1 ? (wiederholung ? `Wiederholung: Aufgabe ${i + 1}` : `Aufgabe ${i + 1} von ${aufgaben.length}`) : (wiederholung ? "Wiederholung" : null);
      zeigen(
        kopf?.() ?? null,
        el("h2", {}, titel),
        el("div", { class: "fortschritt" }, [untertitel, zaehlung].filter(Boolean).join(" · ")),
        wiederholung ? el("div", { class: "feedback info" }, "🔁 Diese Aufgabe hast du vorhin mit der Lösung gesehen. Jetzt löst du sie selbst!") : null,
        lesetextElement(a.lesetext ?? lesetext),
        hoertextElement(a.hoertext),
        el("div", { class: "frage" }, a.frage),
        r.element,
        feedback,
        el("div", { class: "knopfzeile" }, abbruch, mitte, leiste),
      );
      fokus(r.erstesFeld);
    });
    hoerenStoppen();
    sprechenStoppen();
    if (ok === ABBRUCH) {
      questErgebnis(id, protokoll, { abgebrochen: true });
      return { abgebrochen: true };
    }
    if (loesungGezeigt) schlange.push([i, true]);
    if (!wiederholung) {
      if (ok) ersterVersuch++;
      werte[i] = leistungWert(a, fehlerZahl, loesungGezeigt);
    }
    protokoll.push({
      nr: i + 1, frage: a.frage, typ: a.typ, fehler: fehlerZahl, ersterVersuch: Boolean(ok) && !wiederholung, loesungGezeigt,
      ...(wiederholung ? { wiederholung: true } : {}),
      sekunden: Math.round((performance.now() - start) / 1000),
      ...(a.typ === "freitext" ? { woerter: woerterZaehlen(zustand.texte[a.id]?.text ?? "") } : {}),
    });
  }
  questErgebnis(id, protokoll);
  const faktor = aufgaben.length ? werte.reduce((x, y) => x + y, 0) / aufgaben.length : 1;
  // Die nächste Belohnung (XP) richtet sich nach dieser Leistung – aber nicht beim freiwilligen Wiederholen.
  if (!schonErledigt) leistungOffen = { faktor, zeit: Date.now(), fehler: protokoll.reduce((x, p) => x + (p.wiederholung ? 0 : p.fehler), 0), loesungen: protokoll.filter((p) => p.loesungGezeigt).length };
  return { gesamt: aufgaben.length, ersterVersuch, faktor };
}

/**
 * Wie viel eine Aufgabe für die XP zählt: beim ersten Versuch alles, beim zweiten die Hälfte,
 * danach ein Viertel. Mit gezeigter Lösung nichts. Freie Texte und Sprechaufgaben zählen immer voll.
 */
export function leistungWert(a, fehler, loesungGezeigt) {
  if (loesungGezeigt) return 0;
  if (a.typ === "freitext" || a.typ === "sprechen") return 1;
  return fehler === 0 ? 1 : fehler === 1 ? 0.5 : 0.25;
}

let leistungOffen = null;
/** Holt (einmalig) die Leistung der letzten Aufgabenfolge, wenn sie gerade erst beendet wurde. */
export function leistungAbholen() {
  const l = leistungOffen;
  leistungOffen = null;
  return l && Date.now() - l.zeit < 3 * 60 * 1000 ? l : null;
}

// Knopf „Hilfsmittel einsetzen“ zwischen „Quest abbrechen“ und „Prüfen“ (wird vom Inventar gesetzt).
let hilfsmittelKnopf = null;
export function hilfsmittelAnmelden(fn) { hilfsmittelKnopf = fn; }

// ---------- Prüfungsmodus (Probeprüfung) ----------

/**
 * Probeprüfung wie im DSD: Jede Aufgabe hat genau einen Versuch, es gibt keine Rückmeldung
 * während der Prüfung. Jedes Item zählt einen Punkt (unbeantwortet = 0). Am Ende kommt die Auswertung
 * nach Prüfungsteilen (Feld `teil` der Aufgaben).
 * kopf: optional eine Funktion, die ein Element über der Aufgabe liefert (z. B. den Bossbalken).
 * Liefert { punkte, max, bestanden, teile: [{ teil, punkte, max }] } oder { abgebrochen: true }.
 */
export async function pruefungsFolge({ id, titel, untertitel, aufgaben: roh, bestehenAb = 0.5, hinweis, kopf }) {
  const aufgaben = roh.map(aufgabeAufloesen);
  const protokoll = [];
  const teile = [];
  for (let i = 0; i < aufgaben.length; i++) {
    const a = aufgaben[i];
    const start = performance.now();
    const ergebnis = await new Promise((fertig) => {
      const r = aufgabeErstellen(a);
      const abbruch = knopf("Prüfung abbrechen", () => fertig(ABBRUCH), "knopf zweitrangig abbrechen");
      const meldung = el("div", { class: "feedback info", hidden: true });
      let gewarnt = false;
      const abgeben = knopf(i === aufgaben.length - 1 ? "Antwort abgeben und auswerten ✔" : "Antwort abgeben ▸", () => {
        const e = r.pruefen?.() ?? { ok: true };
        if (e.leer && !gewarnt) {
          gewarnt = true;
          meldung.textContent = "Du hast noch nicht alles beantwortet. In der Prüfung zählt jede Antwort – rate lieber, als etwas leer zu lassen! Klicke noch einmal, wenn du trotzdem abgeben willst.";
          meldung.hidden = false;
          return;
        }
        fertig(r.punkte?.() ?? { punkte: 0, max: 0 });
      });
      zeigen(
        kopf?.() ?? null,
        el("h2", {}, titel),
        el("div", { class: "fortschritt" }, [untertitel, a.teil, `Aufgabe ${i + 1} von ${aufgaben.length}`].filter(Boolean).join(" · ")),
        i === 0 && hinweis ? el("div", { class: "feedback info" }, hinweis) : null,
        lesetextElement(a.lesetext),
        hoertextElement(a.hoertext),
        el("div", { class: "frage" }, a.frage),
        r.element,
        meldung,
        el("div", { class: "knopfzeile" }, abbruch, el("div", { class: "knopfleiste" }, abgeben)),
      );
      fokus(r.erstesFeld);
    });
    hoerenStoppen();
    sprechenStoppen();
    if (ergebnis === ABBRUCH) {
      questErgebnis(id, protokoll, { abgebrochen: true });
      return { abgebrochen: true };
    }
    const t = teile.find((x) => x.teil === (a.teil ?? "")) ?? teile[teile.push({ teil: a.teil ?? "", punkte: 0, max: 0 }) - 1];
    t.punkte += ergebnis.punkte; t.max += ergebnis.max;
    protokoll.push({
      nr: i + 1, frage: a.frage, typ: a.typ, teil: a.teil, punkte: ergebnis.punkte, max: ergebnis.max,
      ersterVersuch: ergebnis.punkte === ergebnis.max, fehler: ergebnis.max - ergebnis.punkte, loesungGezeigt: false,
      sekunden: Math.round((performance.now() - start) / 1000),
    });
  }
  questErgebnis(id, protokoll);
  const punkte = teile.reduce((x, t) => x + t.punkte, 0), max = teile.reduce((x, t) => x + t.max, 0);
  return { punkte, max, bestanden: punkte >= Math.ceil(max * bestehenAb), grenze: Math.ceil(max * bestehenAb), teile };
}

/** Zeigt die Auswertung einer Probeprüfung. */
export function pruefungsAuswertung(titel, e) {
  return new Promise((weiter) => {
    const k = knopf("Weiter ▸", weiter);
    zeigen(
      el("h2", {}, titel),
      el("div", { class: `feedback ${e.bestanden ? "gut" : "schlecht"}` },
        e.bestanden ? `Bestanden! ${e.punkte} von ${e.max} Punkten.` : `Noch nicht bestanden: ${e.punkte} von ${e.max} Punkten. Zum Bestehen brauchst du ${e.grenze} Punkte.`),
      el("table", { class: "auswertung" },
        el("tbody", {},
          e.teile.map((t) => el("tr", {}, el("td", {}, t.teil), el("td", {}, `${t.punkte} / ${t.max}`))),
          el("tr", { class: "summe" }, el("td", {}, "Gesamt"), el("td", {}, `${e.punkte} / ${e.max}`)))),
      el("p", { class: "untertitel" }, "Dein Ergebnis steht im Heldenpass. Schau dir die Teile mit wenigen Punkten noch einmal in den Reichen an."),
      el("div", { class: "knopfleiste" }, k),
    );
    fokus(k);
  });
}
