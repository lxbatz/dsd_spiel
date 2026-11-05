// Aufgabentypen und der Ablauf von Aufgabenfolgen.
//
// Jede Aufgabe ist ein Objekt mit einem Feld "typ". Unterstützte Typen:
//
//   auswahl       { frage, optionen: [..], richtig: <Index>, erklaerung?, tipp?, mischen? }
//   luecke        { frage, text: "Ich {heiße} Mira.", auswahl?: true, ablenker?: [..], erklaerung? }
//                   In {..} steht die Lösung, Alternativen mit | trennen: {heiße|bin}
//   ordnen        { frage, teile: [..in richtiger Reihenfolge..], loesungen?: ["alternativer Satz"], erklaerung? }
//   zuordnen      { frage, paare: [[links, rechts], ..], erklaerung? }
//   richtigfalsch { frage, aussagen: [[satz, true|false], ..], erklaerung? }
//   freitext      { id, frage, minWoerter, checkliste: [..], muster: [{ such, ok, fehlt }], stichpunkte? }
//
// Alle Typen können zusätzlich einen Lesetext haben:
//   lesetext: "<id aus texte.js>"  oder  { titel, text, quelle }

import { el, zeigen, knopf, fokus } from "./fenster.js";
import { mischen, woerterZaehlen } from "../hilfen.js";
import { hatEffekt, textSpeichern, zustand } from "../zustand.js";
import { TEXTE } from "../inhalte/texte.js";

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
    sperren() { gesperrt = true; },
  };
}

function zuordnen(a) {
  const rechts = mischen(a.paare.map((p) => p[1]));
  const selects = a.paare.map(() =>
    el("select", {}, el("option", { value: "" }, "– wählen –"), rechts.map((r) => el("option", { value: r }, r))));
  return {
    element: el("table", { class: "zuordnen-tabelle" },
      el("tbody", {}, a.paare.map((p, i) => el("tr", {}, el("td", { style: "width:45%" }, p[0]), el("td", {}, selects[i]))))),
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
    sperren() { zeilen.forEach((z) => { z.r.disabled = true; z.f.disabled = true; }); },
  };
}

function freitext(a) {
  const leiste = umlautLeiste();
  const vorher = zustand.texte[a.id]?.text ?? "";
  const feld = el("textarea", { class: "freitext", spellcheck: "false", placeholder: "Schreibe hier deinen Text …" });
  feld.value = vorher;
  leiste.merken(feld);
  const zaehler = el("div", { class: "wortzahl" });
  const analyse = el("ul", { class: "analyse" });
  const haken = (a.checkliste ?? []).map((punkt) => el("input", { type: "checkbox" }));
  const stichpunkte = typeof a.stichpunkte === "function" ? a.stichpunkte(zustand) : a.stichpunkte;

  function aktualisieren() {
    const n = woerterZaehlen(feld.value);
    zaehler.textContent = `${n} Wörter${a.minWoerter ? ` (mindestens ${a.minWoerter})` : ""}`;
    analyse.replaceChildren(...(a.muster ?? []).map((mu) => {
      const ok = new RegExp(mu.such, "iu").test(feld.value);
      return el("li", { class: ok ? "ok" : "fehlt" }, ok ? `✔ ${mu.ok}` : `✘ ${mu.fehlt}`);
    }));
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
      feld, leiste, zaehler,
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
      return { ok: true, meldung: "Dein Text ist gespeichert. Du findest ihn im Heldenpass unter „Meine Texte“. Zeig ihn deiner Lehrkraft!" };
    },
    loesungZeigen() {},
    sperren() { feld.disabled = true; haken.forEach((h) => { h.disabled = true; }); },
  };
}

const TYPEN = { auswahl, luecke, ordnen, zuordnen, richtigfalsch, freitext };

export function aufgabeErstellen(aufgabe) {
  const fn = TYPEN[aufgabe.typ];
  if (!fn) throw new Error(`Unbekannter Aufgabentyp: ${aufgabe.typ}`);
  return fn(aufgabe);
}

export { lesetextElement };

// ---------- Ablauf ----------

/**
 * Zeigt eine Folge von Aufgaben im Übungsmodus:
 * Bei Fehlern darf man es noch einmal versuchen, nach zwei Fehlversuchen
 * kann man sich die Lösung zeigen lassen.
 * Liefert { gesamt, ersterVersuch } (Anzahl beim ersten Versuch richtig gelöst).
 */
export async function aufgabenFolge({ titel, untertitel, aufgaben, lesetext }) {
  let ersterVersuch = 0;
  for (let i = 0; i < aufgaben.length; i++) {
    const a = aufgaben[i];
    const ok = await new Promise((fertig) => {
      const r = aufgabeErstellen(a);
      const feedback = el("div", { class: "feedback", hidden: true });
      const leiste = el("div", { class: "knopfleiste" });
      let versuche = 0;

      const melden = (art, text) => {
        feedback.className = `feedback ${art}`;
        feedback.replaceChildren(...text.split("\n").flatMap((z, j) => (j ? [el("br"), z] : [z])));
        feedback.hidden = !text;
      };

      const weiterKnopf = (warRichtig) => {
        const w = knopf(i === aufgaben.length - 1 ? "Fertig ✔" : "Nächste Aufgabe ▸", () => fertig(warRichtig));
        leiste.replaceChildren(w);
        fokus(w);
      };

      const loesungKnopf = knopf("Lösung zeigen", () => {
        r.loesungZeigen();
        r.sperren();
        melden("info", ["So ist es richtig.", a.erklaerung].filter(Boolean).join("\n"));
        weiterKnopf(false);
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
        melden("schlecht", [e.meldung, versuche >= 2 ? "Du kannst es noch einmal versuchen oder dir die Lösung zeigen lassen." : "Versuch es noch einmal!"].join("\n"));
        if (versuche >= 2 && !leiste.contains(loesungKnopf) && a.typ !== "freitext") leiste.prepend(loesungKnopf);
      });
      leiste.append(pruefKnopf);

      zeigen(
        el("h2", {}, titel),
        el("div", { class: "fortschritt" }, [untertitel, aufgaben.length > 1 ? `Aufgabe ${i + 1} von ${aufgaben.length}` : null].filter(Boolean).join(" · ")),
        lesetextElement(a.lesetext ?? lesetext),
        el("div", { class: "frage" }, a.frage),
        r.element,
        feedback,
        leiste,
      );
      fokus(r.erstesFeld);
    });
    if (ok) ersterVersuch++;
  }
  return { gesamt: aufgaben.length, ersterVersuch };
}
