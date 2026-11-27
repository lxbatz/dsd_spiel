// Action in der 3D-Welt: kleine Gegner, Angriffe der vier Klassen, Herzen, Beute und „Game Over“.
//
// In jedem Reich laufen kleine Gegner herum (Hasen im Dorf, Ratten im Turm …). Man greift mit F,
// mit der rechten Maustaste, mit einem Klick auf den Gegner oder (Touch) mit dem Schwertknopf an.
// Bei einem Treffer fliegen Comic-Wörter heraus (kurze deutsche Ausrufe zum Lesen, kein Blut).
// Besiegte Gegner lassen manchmal ein Herz oder ein Hilfsmittel fallen. Wer alle Herzen verliert,
// wacht im Dorf der Ankömmlinge wieder auf und verliert nichts.
// Gegner und Angriffe ruhen, solange ein Fenster offen ist oder eine Zwischensequenz läuft.

import * as THREE from "../../vendor/three.module.min.js";
import { E, welt } from "./welt.js";
import { zustand, herzenJetzt, herzenMax, herzenSetzen, vorratAendern, speichern, stufeVon } from "../zustand.js";
import { HILFSMITTEL, BEUTE } from "../inhalte/hilfsmittel.js";
import { el, zeigen, knopf, fokus, istOffen, schliessen, toast } from "../ui/fenster.js";
import { ton } from "../ton.js";

// ---------- Gegnerarten ----------

const ALLE_ENDE = ["Ich gebe auf!", "Tschüss!", "Ich komme wieder!", "Das war zu viel!", "Gute Nacht!"];

export const ARTEN = {
  hase: { name: "Hase", lp: 2, tempo: 2.6, blick: 4.5, groesse: 1, huepfen: true,
    worte: ["Autsch!", "Hoppla!", "Au!", "Huch!", "Nicht so fest!"], ende: ["Ich hoppel nach Hause!"] },
  ratte: { name: "Ratte", lp: 2, tempo: 3.0, blick: 6, groesse: 1,
    worte: ["Piiiep!", "Au!", "Meine Nase!", "Lass mich!", "Autsch!"], ende: ["Ich gehe zurück in den Keller."] },
  vogel: { name: "Vogel", lp: 2, tempo: 3.4, blick: 7, groesse: 1, fliegt: true,
    worte: ["Kraah!", "Meine Federn!", "Au!", "Hilfe!"], ende: ["Ich fliege weg!"] },
  schildkroete: { name: "Schildkröte", lp: 4, tempo: 1.7, blick: 5, groesse: 1,
    worte: ["Bonk!", "Mein Panzer!", "Langsam!", "Au!"], ende: ["Ich mache eine Pause."] },
  spinne: { name: "Spinne", lp: 3, tempo: 3.2, blick: 6.5, groesse: 1,
    worte: ["Zisch!", "Meine Beine!", "Au, au, au!", "Autsch!"], ende: ["Ich baue ein neues Netz."] },
  eisfuchs: { name: "Schweigefuchs", lp: 3, tempo: 3.6, blick: 7, groesse: 1,
    worte: ["Brrr!", "Pssst!", "Au!", "Sei still!"], ende: ["Mir ist zu warm!"] },
  goblin: { name: "Goblin", lp: 3, tempo: 3.3, blick: 7.5, groesse: 1,
    worte: ["Uff!", "Mein Kopf!", "Das tut weh!", "Na warte!"], ende: ["Ich sage es dem Chef!"] },
};

/** Welche Gegner wo leben: Karte -> [Art, Anzahl] */
export const GEGNER_PRO_KARTE = {
  dorf: ["hase", 4],
  treppenturm: ["ratte", 5],
  turm: ["vogel", 5],
  aurelia: ["schildkroete", 5],
  scriptoria: ["spinne", 6],
  vocantia: ["eisfuchs", 5],
  schattenzahn: ["goblin", 6],
};

const WIEDERKOMMEN = 35;      // Sekunden, bis ein besiegter Gegner neu erscheint
const ABSTAND_SPIELER = 9;    // so weit weg erscheinen neue Gegner
const UNVERWUNDBAR = 1.5;     // Sekunden nach einem Treffer

/** Angriffe der Klassen: Reichweite, Wartezeit, Art */
const ANGRIFFE = {
  kriegerin: { art: "schwert", reichweite: 2.6, warten: 0.42, ton: "schwert" },
  magier: { art: "zauber", reichweite: 14, warten: 0.6, ton: "zauber" },
  waldlaeufer: { art: "pfeil", reichweite: 17, warten: 0.55, ton: "pfeil" },
  barde: { art: "leier", reichweite: 3.8, warten: 0.85, ton: "leier" },
};

// ---------- Modelle ----------

const mat = new Map();
function M(farbe, { glanz = false, leucht = null } = {}) {
  const k = `${farbe}|${glanz}|${leucht}`;
  if (!mat.has(k)) mat.set(k, new THREE.MeshStandardMaterial({ color: farbe, roughness: glanz ? 0.35 : 0.8, flatShading: true, emissive: leucht ?? "#000000", emissiveIntensity: leucht ? 1.2 : 0 }));
  return mat.get(k);
}
const KUGEL = new THREE.SphereGeometry(1, 12, 8);
const KEGEL = new THREE.ConeGeometry(1, 1, 8);
const ZYL = new THREE.CylinderGeometry(1, 1, 1, 8);
function teil(gruppe, geo, farbe, pos, skala, rot = [0, 0, 0], opt) {
  const m = new THREE.Mesh(geo, M(farbe, opt));
  m.position.set(...pos);
  m.scale.set(...skala);
  m.rotation.set(...rot);
  m.castShadow = true;
  gruppe.add(m);
  return m;
}
function augen(g, y, z, abstand, groesse = 0.04, farbe = "#1a1018") {
  for (const s of [-1, 1]) teil(g, KUGEL, farbe, [s * abstand, y, z], [groesse, groesse, groesse], [0, 0, 0], { glanz: true });
}

/** Baut das Modell einer Gegnerart. Liefert { gruppe, koerper, beine: [...] } */
function modellBauen(art) {
  const g = new THREE.Group();
  const k = new THREE.Group();
  g.add(k);
  const beine = [];
  switch (art) {
    case "hase": {
      teil(k, KUGEL, "#d8c8b0", [0, 0.28, 0], [0.24, 0.22, 0.3]);
      teil(k, KUGEL, "#e4d6c0", [0, 0.48, 0.22], [0.15, 0.14, 0.15]);
      for (const s of [-1, 1]) teil(k, KUGEL, "#d8c8b0", [s * 0.06, 0.72, 0.18], [0.04, 0.16, 0.03], [-0.2, 0, s * 0.15]);
      teil(k, KUGEL, "#ffffff", [0, 0.34, -0.3], [0.08, 0.08, 0.08]);
      teil(k, KUGEL, "#e88a9a", [0, 0.48, 0.37], [0.025, 0.02, 0.02]);
      augen(k, 0.53, 0.33, 0.07, 0.03, "#c01020");   // rote Augen: ein frecher Hase
      break;
    }
    case "ratte": {
      teil(k, KUGEL, "#6a5a5a", [0, 0.17, 0], [0.16, 0.14, 0.3]);
      teil(k, KEGEL, "#7a6a6a", [0, 0.2, 0.34], [0.1, 0.22, 0.1], [Math.PI / 2, 0, 0]);
      teil(k, KUGEL, "#e88a9a", [0, 0.2, 0.46], [0.025, 0.025, 0.025]);
      for (const s of [-1, 1]) teil(k, KUGEL, "#c89a9a", [s * 0.08, 0.3, 0.24], [0.06, 0.06, 0.02]);
      teil(k, ZYL, "#c89a9a", [0, 0.12, -0.45], [0.015, 0.4, 0.015], [Math.PI / 2.3, 0, 0]);
      augen(k, 0.25, 0.36, 0.05, 0.025, "#ff3030");
      for (const s of [-1, 1]) for (const z of [-0.15, 0.15]) beine.push(teil(k, KUGEL, "#4a3a3a", [s * 0.1, 0.04, z], [0.04, 0.04, 0.06]));
      break;
    }
    case "vogel": {
      teil(k, KUGEL, "#3a3a48", [0, 0, 0], [0.18, 0.16, 0.26]);
      teil(k, KUGEL, "#4a4a5a", [0, 0.12, 0.2], [0.12, 0.12, 0.12]);
      teil(k, KEGEL, "#f0b030", [0, 0.1, 0.36], [0.04, 0.12, 0.04], [Math.PI / 2, 0, 0]);
      augen(k, 0.16, 0.29, 0.05, 0.022, "#ffd040");
      for (const s of [-1, 1]) beine.push(teil(k, KUGEL, "#2a2a38", [s * 0.26, 0.04, 0], [0.28, 0.03, 0.14]));   // Flügel
      teil(k, KUGEL, "#2a2a38", [0, 0.02, -0.3], [0.1, 0.03, 0.14]);
      break;
    }
    case "schildkroete": {
      teil(k, KUGEL, "#5a7a3a", [0, 0.22, 0], [0.38, 0.22, 0.44]);
      teil(k, KUGEL, "#7a9a4a", [0, 0.3, 0], [0.26, 0.16, 0.3]);
      teil(k, KUGEL, "#a8c070", [0, 0.2, 0.5], [0.13, 0.12, 0.15]);
      augen(k, 0.25, 0.6, 0.07, 0.03);
      for (const s of [-1, 1]) for (const z of [-0.25, 0.25]) beine.push(teil(k, KUGEL, "#a8c070", [s * 0.3, 0.08, z], [0.09, 0.08, 0.1]));
      break;
    }
    case "spinne": {
      teil(k, KUGEL, "#2a1a2a", [0, 0.3, -0.12], [0.24, 0.2, 0.28]);
      teil(k, KUGEL, "#3a2238", [0, 0.28, 0.2], [0.14, 0.12, 0.14]);
      teil(k, KUGEL, "#9a2a4a", [0, 0.42, -0.14], [0.08, 0.04, 0.12]);
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) teil(k, KUGEL, "#ff4060", [s * (0.03 + i * 0.012), 0.34 - i * 0.01, 0.32], [0.018, 0.018, 0.018], [0, 0, 0], { leucht: "#ff2040" });
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
        const bein = teil(k, ZYL, "#2a1a2a", [s * 0.32, 0.2, 0.18 - i * 0.14], [0.022, 0.44, 0.022], [0, 0, s * 1.0]);
        beine.push(bein);
      }
      break;
    }
    case "eisfuchs": {
      teil(k, KUGEL, "#eef4fa", [0, 0.34, 0], [0.18, 0.18, 0.34]);
      teil(k, KUGEL, "#ffffff", [0, 0.5, 0.34], [0.15, 0.14, 0.15]);
      teil(k, KEGEL, "#ffffff", [0, 0.47, 0.52], [0.07, 0.16, 0.07], [Math.PI / 2, 0, 0]);
      teil(k, KUGEL, "#203040", [0, 0.47, 0.6], [0.025, 0.025, 0.025]);
      for (const s of [-1, 1]) teil(k, KEGEL, "#eef4fa", [s * 0.08, 0.66, 0.3], [0.05, 0.14, 0.04]);
      teil(k, KUGEL, "#dce8f4", [0, 0.4, -0.42], [0.1, 0.1, 0.24], [0.6, 0, 0]);
      augen(k, 0.54, 0.46, 0.06, 0.025, "#40a0ff");
      for (const s of [-1, 1]) for (const z of [-0.2, 0.2]) beine.push(teil(k, ZYL, "#dce8f4", [s * 0.1, 0.1, z], [0.04, 0.22, 0.04]));
      break;
    }
    case "goblin": {
      teil(k, KUGEL, "#6a8a3a", [0, 0.55, 0], [0.24, 0.26, 0.2]);
      teil(k, KUGEL, "#7a9a4a", [0, 0.95, 0.02], [0.2, 0.19, 0.19]);
      for (const s of [-1, 1]) teil(k, KEGEL, "#7a9a4a", [s * 0.24, 1.0, 0], [0.05, 0.2, 0.04], [0, 0, -s * 1.3]);
      teil(k, KEGEL, "#5a7a2a", [0, 0.92, 0.22], [0.04, 0.12, 0.04], [Math.PI / 2.2, 0, 0]);
      augen(k, 1.0, 0.17, 0.07, 0.03, "#ffd020");
      teil(k, KUGEL, "#5a3a20", [0, 0.42, 0], [0.26, 0.12, 0.22]);                // Lendenschurz
      teil(k, ZYL, "#7a5a30", [0.28, 0.5, 0.12], [0.04, 0.6, 0.04], [0.5, 0, 0]); // Keule
      teil(k, KUGEL, "#7a5a30", [0.28, 0.75, 0.3], [0.08, 0.1, 0.08]);
      for (const s of [-1, 1]) beine.push(teil(k, ZYL, "#5a7a2a", [s * 0.1, 0.16, 0], [0.06, 0.32, 0.06]));
      break;
    }
  }
  return { gruppe: g, koerper: k, beine };
}

// ---------- Schrift-Sprites (Comic-Wörter, Beute) ----------

const spriteCache = new Map();
function comicTextur(text, art = "knall") {
  const k = `${art}|${text}`;
  if (spriteCache.has(k)) return spriteCache.get(k);
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const g = c.getContext("2d");
  g.font = "900 64px 'Atkinson Hyperlegible', 'Arial Black', sans-serif";
  const breite = Math.min(480, g.measureText(text).width + 70);
  const cx = 256, cy = 128;
  if (art === "knall") {
    // Gelber Stern mit schwarzem Rand
    g.beginPath();
    const zacken = 14;
    for (let i = 0; i <= zacken * 2; i++) {
      const a = (i / (zacken * 2)) * Math.PI * 2;
      const r = i % 2 ? 0.78 : 1;
      g.lineTo(cx + Math.cos(a) * (breite / 2) * r * 1.05, cy + Math.sin(a) * 92 * r);
    }
    g.fillStyle = "#ffe14a"; g.strokeStyle = "#1a1018"; g.lineWidth = 8;
    g.fill(); g.stroke();
    g.fillStyle = "#c81e2a";
  } else {
    // Sprechblase (weiß) für Abschiedssätze
    g.fillStyle = "#ffffff"; g.strokeStyle = "#1a1018"; g.lineWidth = 7;
    const x0 = cx - breite / 2, y0 = 40, h = 140, r = 40;
    g.beginPath();
    g.roundRect(x0, y0, breite, h, r);
    g.moveTo(cx - 20, y0 + h); g.lineTo(cx, y0 + h + 40); g.lineTo(cx + 20, y0 + h);
    g.fill(); g.stroke();
    g.fillStyle = "#1a1018";
  }
  g.textAlign = "center"; g.textBaseline = "middle";
  let groesse = 64;
  while (g.measureText(text).width > breite - 50 && groesse > 30) { groesse -= 4; g.font = `900 ${groesse}px 'Atkinson Hyperlegible', 'Arial Black', sans-serif`; }
  g.fillText(text, cx, art === "knall" ? cy + 4 : 110);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  spriteCache.set(k, t);
  return t;
}

function symbolTextur(symbol) {
  const k = `symbol|${symbol}`;
  if (spriteCache.has(k)) return spriteCache.get(k);
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.font = "96px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(255,240,180,.9)"; g.shadowBlur = 16;
  g.fillText(symbol, 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  spriteCache.set(k, t);
  return t;
}

function sprite(textur, breite, hoehe) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  s.scale.set(breite, hoehe, 1);
  s.renderOrder = 10;
  return s;
}

const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];

// ---------- Die Action ----------

export class Action {
  constructor(spiel) {
    this.spiel = spiel;
    this.warten = 0;
    this.unverwundbar = 0;
    this.gameOver = false;
    this.knopf = document.createElement("button");
    this.knopf.id = "angriff-knopf";
    this.knopf.type = "button";
    this.knopf.dataset.stumm = "1";
    this.knopf.innerHTML = "<span>⚔️</span><small>Angreifen</small>";
    this.knopf.hidden = true;
    this.knopf.addEventListener("click", (e) => { e.preventDefault(); this.angreifen(); });
    document.getElementById("buehne").append(this.knopf);
  }

  /** Daten der Action für eine Karte (beim ersten Besuch angelegt). */
  karteDaten(karte) {
    if (karte.action) return karte.action;
    const [art, anzahl] = GEGNER_PRO_KARTE[karte.id] ?? [null, 0];
    karte.action = { art, anzahl, gegner: [], wurf: [], beute: [], woerter: [], wellen: [] };
    return karte.action;
  }

  get aktiv() {
    const s = this.spiel;
    return s.gestartet && !s.beschaeftigt && !istOffen() && !s.kino && !this.gameOver && Boolean(s.karte);
  }

  // ---------- Gegner ----------

  freierPlatz(karte, weg = ABSTAND_SPIELER) {
    const raster = karte.raster, p = this.spiel.held.gruppe.position;
    for (let versuch = 0; versuch < 60; versuch++) {
      const tx = Math.floor(Math.random() * raster[0].length), ty = Math.floor(Math.random() * raster.length);
      const x = welt(tx), z = welt(ty);
      if (this.spiel.blockiertFuerTier(x, z) || this.spiel.blockiertFuerTier(x + 0.6, z) || this.spiel.blockiertFuerTier(x - 0.6, z)) continue;
      if (Math.hypot(x - p.x, z - p.z) < weg) continue;
      // Nicht direkt neben Figuren, Portalen oder Startpunkten
      if (karte.objekte.some((o) => o.modell.visible && Math.hypot(o.modell.position.x - x, o.modell.position.z - z) < 3.5)) continue;
      if (Object.values(karte.def.spawns ?? {}).some(([sx, sy]) => Math.hypot(welt(sx) - x, welt(sy) - z) < 5)) continue;
      return { x, z };
    }
    return null;
  }

  gegnerErzeugen(karte) {
    const d = this.karteDaten(karte);
    const platz = this.freierPlatz(karte);
    if (!platz) return;
    const art = ARTEN[d.art];
    const m = modellBauen(d.art);
    const y = karte.bau.boden?.(platz.x, platz.z) ?? 0;
    m.gruppe.position.set(platz.x, y, platz.z);
    m.gruppe.rotation.y = Math.random() * Math.PI * 2;
    m.gruppe.scale.setScalar(0.01);
    karte.szene.add(m.gruppe);
    d.gegner.push({ art: d.art, def: art, ...m, lp: art.lp, ziel: null, ruhe: Math.random() * 2, betaeubt: 0, blitz: 0, erscheinen: 0, phase: Math.random() * 10, rueckstoss: new THREE.Vector3() });
  }

  /** Gegner gibt es erst, wenn man einen Heldenpass hat (vorher erklärt Aldric das Spiel). */
  get erlaubt() { return Boolean(zustand.held && zustand.erledigt?.dorf_heldenpass); }

  karteGewechselt(karte) {
    const d = this.karteDaten(karte);
    d.nachschub = [];
    if (!this.erlaubt) return;
    // Beim Betreten: fehlende Gegner sofort ergänzen (weit weg vom Startpunkt)
    while (d.gegner.length < d.anzahl) {
      const vorher = d.gegner.length;
      this.gegnerErzeugen(karte);
      if (d.gegner.length === vorher) break;
    }
  }

  // ---------- Bildschleife ----------

  update(dt, t) {
    const karte = this.spiel.karte;
    if (!karte || !this.spiel.held) return;
    const d = this.karteDaten(karte);
    const aktiv = this.aktiv;
    this.warten = Math.max(0, this.warten - dt);
    if (aktiv) this.unverwundbar = Math.max(0, this.unverwundbar - dt);
    const p = this.spiel.held.gruppe.position;
    // Blinken während der Unverwundbarkeit
    this.spiel.held.gruppe.visible = !(this.unverwundbar > 0 && Math.floor(this.unverwundbar * 12) % 2 === 0) || !aktiv;

    // Nachschub nach einiger Zeit (auch, wenn Gegner erst jetzt erlaubt sind)
    d.nachschub ??= [];
    if (this.erlaubt && d.gegner.filter((g) => g.stirbt == null).length + d.nachschub.length < d.anzahl) d.nachschub.push({ zeit: 4 + Math.random() * 6 });
    for (const n of d.nachschub) n.zeit -= aktiv ? dt : 0;
    if (d.nachschub?.length && d.nachschub[0].zeit <= 0) { d.nachschub.shift(); this.gegnerErzeugen(karte); }

    let nahe = false;
    for (const g of [...d.gegner]) {
      // Erscheinen (wachsen) und Sterben (schrumpfen)
      if (g.stirbt != null) {
        g.stirbt -= dt;
        const k = Math.max(0, g.stirbt / 0.4);
        g.gruppe.scale.setScalar(k);
        g.gruppe.rotation.y += dt * 14;
        if (g.stirbt <= 0) { g.gruppe.removeFromParent(); d.gegner.splice(d.gegner.indexOf(g), 1); }
        continue;
      }
      g.erscheinen = Math.min(1, g.erscheinen + dt * 1.5);
      const groesse = g.erscheinen * (g.blitz > 0 ? 1.15 : 1);
      g.gruppe.scale.setScalar(groesse);
      g.blitz = Math.max(0, g.blitz - dt);
      const gp = g.gruppe.position;
      const dx = p.x - gp.x, dz = p.z - gp.z, abstand = Math.hypot(dx, dz);
      if (abstand < 10) nahe = true;
      g.phase += dt;
      if (!aktiv) continue;

      // Rückstoß nach einem Treffer
      if (g.rueckstoss.lengthSq() > 0.001) {
        const nx = gp.x + g.rueckstoss.x * dt, nz = gp.z + g.rueckstoss.z * dt;
        if (!this.spiel.blockiertFuerTier(nx, nz)) gp.set(nx, gp.y, nz);
        g.rueckstoss.multiplyScalar(Math.max(0, 1 - dt * 8));
      }
      g.betaeubt = Math.max(0, g.betaeubt - dt);
      let tempo = 0, richtung = null;
      if (g.betaeubt <= 0) {
        if (abstand < g.def.blick && aktiv && !zustand.kampfTipp) { this.kampfErklaeren(g); return; }
        if (abstand < g.def.blick && this.unverwundbar <= 0) {
          richtung = new THREE.Vector3(dx, 0, dz).normalize();
          tempo = g.def.tempo;
        } else {
          // Herumstreifen
          g.ruhe -= dt;
          if (!g.ziel || g.ruhe < 0) {
            g.ruhe = 1.5 + Math.random() * 3;
            g.ziel = Math.random() < 0.4 ? null : new THREE.Vector3(gp.x + (Math.random() - 0.5) * 8, 0, gp.z + (Math.random() - 0.5) * 8);
          }
          if (g.ziel) {
            richtung = new THREE.Vector3(g.ziel.x - gp.x, 0, g.ziel.z - gp.z);
            if (richtung.length() < 0.4) g.ziel = null;
            else { richtung.normalize(); tempo = g.def.tempo * 0.4; }
          }
        }
      }
      if (richtung && tempo) {
        const schritt = tempo * dt;
        const nx = gp.x + richtung.x * schritt, nz = gp.z + richtung.z * schritt;
        if (!this.spiel.blockiertFuerTier(nx, nz)) gp.set(nx, gp.y, nz);
        else if (!this.spiel.blockiertFuerTier(nx, gp.z)) gp.x = nx;
        else if (!this.spiel.blockiertFuerTier(gp.x, nz)) gp.z = nz;
        else g.ziel = null;
        const ziel = Math.atan2(richtung.x, richtung.z);
        g.gruppe.rotation.y += (((ziel - g.gruppe.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 8);
      }
      // Bodenhöhe, Hüpfen, Fliegen, Beine
      const boden = karte.bau.boden?.(gp.x, gp.z) ?? 0;
      const laeuft = tempo > 0;
      let y = boden;
      if (g.def.fliegt) y += 1.1 + Math.sin(g.phase * 2.2) * 0.25;
      else if (g.def.huepfen && laeuft) y += Math.abs(Math.sin(g.phase * 9)) * 0.25;
      gp.y += (y - gp.y) * Math.min(1, dt * 12);
      g.beine.forEach((b, i) => {
        if (g.def.fliegt) b.rotation.z = Math.sin(g.phase * 18) * 0.7 * (i ? 1 : -1);
        else if (laeuft) b.rotation.x = Math.sin(g.phase * 14 + i * 1.7) * 0.6;
      });
      g.koerper.position.y = laeuft && !g.def.fliegt && !g.def.huepfen ? Math.abs(Math.sin(g.phase * 14)) * 0.03 : 0;

      // Berührt der Gegner die Spielfigur? Dann verliert man ein Herz.
      if (abstand < 0.75 && this.unverwundbar <= 0 && g.betaeubt <= 0 && Math.abs(gp.y - p.y) < 1.6) this.getroffen(g);
    }

    // Würfe (Zauber, Pfeile)
    for (const w of [...d.wurf]) {
      w.zeit -= dt;
      if (w.ziel && w.ziel.stirbt == null && w.lenkbar) {
        const zp = w.ziel.gruppe.position;
        const soll = new THREE.Vector3(zp.x - w.obj.position.x, zp.y + 0.35 - w.obj.position.y, zp.z - w.obj.position.z).normalize().multiplyScalar(w.v.length());
        w.v.lerp(soll, Math.min(1, dt * 6));
      }
      w.obj.position.addScaledVector(w.v, dt);
      if (w.art === "pfeil") w.obj.lookAt(w.obj.position.clone().add(w.v));
      else karte.effekte.funken.aussenden(w.obj.position, new THREE.Vector3(0, 0.3, 0), { farbe: [0.6, 1.2, 1.6], groesse: 0.12, dauer: 0.35 });
      const treffer = d.gegner.find((g) => g.stirbt == null && Math.hypot(g.gruppe.position.x - w.obj.position.x, g.gruppe.position.z - w.obj.position.z) < 0.85 && Math.abs(g.gruppe.position.y + 0.3 - w.obj.position.y) < 1.1);
      const tx = Math.floor(w.obj.position.x / E), tz = Math.floor(w.obj.position.z / E);
      const wand = (karte.bau.hindernis?.(tx, tz) ?? 0) > w.obj.position.y;
      if (treffer || w.zeit <= 0 || wand) {
        if (treffer) this.treffen(treffer, w.v);
        if (w.art === "zauber") karte.effekte.explosion(w.obj.position, "#9af4ff", 26, 2.2);
        w.obj.removeFromParent();
        d.wurf.splice(d.wurf.indexOf(w), 1);
      }
    }

    // Schallwellen der Leier und Schwerthiebe
    for (const s of [...d.wellen]) {
      s.zeit += dt;
      const k = Math.min(1, s.zeit / s.dauer);
      if (s.art === "leier") {
        s.obj.scale.setScalar(0.3 + k * s.radius);
        s.obj.material.opacity = 0.85 * (1 - k);
        s.obj.position.copy(this.spiel.held.gruppe.position).setY(this.spiel.held.gruppe.position.y + 0.15);
      } else {
        s.obj.material.opacity = 0.9 * (1 - k);
        s.obj.rotation.z = s.start + k * 2.2;
      }
      if (k >= 1) { s.obj.removeFromParent(); d.wellen.splice(d.wellen.indexOf(s), 1); }
    }

    // Comic-Wörter steigen auf und verblassen
    for (const w of [...d.woerter]) {
      w.zeit += dt;
      const k = w.zeit / w.dauer;
      w.obj.position.y += dt * (w.blase ? 0.35 : 1.1);
      const pop = Math.min(1, w.zeit * 9);
      w.obj.scale.set(w.b * pop * (1 + (1 - pop) * 0.4), w.h * pop, 1);
      w.obj.material.opacity = k > 0.7 ? Math.max(0, 1 - (k - 0.7) / 0.3) : 1;
      if (k >= 1) { w.obj.removeFromParent(); d.woerter.splice(d.woerter.indexOf(w), 1); }
    }

    // Beute: schwebt, wird angezogen und eingesammelt
    for (const b of [...d.beute]) {
      b.zeit -= dt;
      const bp = b.obj.position;
      const boden = karte.bau.boden?.(bp.x, bp.z) ?? 0;
      bp.y = boden + 0.55 + Math.sin(t * 3 + b.phase) * 0.12;
      const ab = Math.hypot(p.x - bp.x, p.z - bp.z);
      if (ab < 2.6 && aktiv && (b.art !== "herz" || herzenJetzt() < herzenMax())) {
        bp.x += (p.x - bp.x) * Math.min(1, dt * 6);
        bp.z += (p.z - bp.z) * Math.min(1, dt * 6);
      }
      if ((ab < 0.7 && aktiv && (b.art !== "herz" || herzenJetzt() < herzenMax())) || b.zeit <= 0) {
        if (b.zeit > 0) this.einsammeln(b);
        b.obj.removeFromParent();
        d.beute.splice(d.beute.indexOf(b), 1);
      } else if (b.zeit < 4) b.obj.visible = Math.floor(b.zeit * 6) % 2 === 0;
    }

    // Touch: Angriffsknopf nur, wenn Gegner in der Nähe sind
    const zeigen = aktiv && nahe && document.body.classList.contains("touch");
    if (this.knopf.hidden === zeigen) this.knopf.hidden = !zeigen;
  }

  /** Beim ersten Gegner: kurz erklären, wie man kämpft. */
  async kampfErklaeren(g) {
    zustand.kampfTipp = true;
    speichern();
    const touch = document.body.classList.contains("touch");
    await new Promise((weiter) => {
      const k = knopf("Los geht's! ⚔️", weiter);
      zeigen(
        el("h2", {}, `⚔️ Vorsicht: ${g.def.name}!`),
        el("p", {}, `In den Reichen von Eldoria laufen freche Wesen herum. Kommt dir eines zu nahe, verlierst du ein Herz.`),
        el("ul", {},
          el("li", {}, touch ? "Angreifen: Tippe auf den roten Schwertknopf oder auf den Gegner." : "Angreifen: Taste F, rechte Maustaste oder Klick auf den Gegner."),
          el("li", {}, "Bei jedem Treffer fliegen Wörter heraus – lies sie!"),
          el("li", {}, "Besiegte Gegner lassen manchmal ❤️ Herzen oder Hilfsmittel (🧪 🪶 🔍) fallen. Lauf darüber, um sie einzusammeln."),
          el("li", {}, "Hilfsmittel helfen dir bei Aufgaben. Heiltrank: Taste H oder im Inventar."),
          el("li", {}, "Verlierst du alle Herzen, wachst du im Dorf auf. Du verlierst nichts.")),
        el("div", { class: "knopfleiste" }, k));
      fokus(k);
    });
    schliessen();
    this.unverwundbar = 1.5;
  }

  // ---------- Angreifen ----------

  /** Nächster Gegner in Reichweite, bevorzugt vor der Figur. */
  zielSuchen(reichweite) {
    const d = this.spiel.karte?.action;
    if (!d) return null;
    const g0 = this.spiel.held.gruppe;
    const vorn = new THREE.Vector3(Math.sin(g0.rotation.y), 0, Math.cos(g0.rotation.y));
    let bestes = null, wert = Infinity;
    for (const g of d.gegner) {
      if (g.stirbt != null || g.erscheinen < 0.5) continue;
      const v = new THREE.Vector3().subVectors(g.gruppe.position, g0.position).setY(0);
      const ab = v.length();
      if (ab > reichweite) continue;
      const vor = ab > 0.01 ? v.normalize().dot(vorn) : 1;
      const w = ab * (vor > 0.3 ? 1 : 2.2);
      if (w < wert) { wert = w; bestes = g; }
    }
    return bestes;
  }

  angreifen(ziel = null) {
    if (!this.aktiv || this.warten > 0 || !this.spiel.held) return false;
    const klasse = zustand.held?.klasse ?? "kriegerin";
    const a = ANGRIFFE[klasse] ?? ANGRIFFE.kriegerin;
    const karte = this.spiel.karte, d = this.karteDaten(karte);
    const g0 = this.spiel.held.gruppe;
    ziel = ziel && ziel.stirbt == null ? ziel : this.zielSuchen(a.art === "schwert" || a.art === "leier" ? a.reichweite + 1.5 : a.reichweite);
    if (ziel) {
      const zp = ziel.gruppe.position;
      g0.rotation.y = Math.atan2(zp.x - g0.position.x, zp.z - g0.position.z);
      this.spiel.heldBlick = null;
    }
    this.warten = a.warten;
    this.spiel.held.angreifen?.(a.art === "leier" ? 0.5 : 0.32);
    ton(a.ton);
    const vorn = new THREE.Vector3(Math.sin(g0.rotation.y), 0, Math.cos(g0.rotation.y));
    const brust = g0.position.clone().add(new THREE.Vector3(0, 1.1, 0));

    if (a.art === "schwert") {
      // Hieb im Halbkreis vor der Figur
      const bogen = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.9, 24, 1, -0.9, 1.8),
        new THREE.MeshBasicMaterial({ color: "#fff4c0", transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      bogen.position.copy(brust).addScaledVector(vorn, 0.2);
      bogen.rotation.set(-Math.PI / 2, 0, 0);
      const halter = new THREE.Group();
      halter.position.copy(bogen.position); bogen.position.set(0, 0, 0);
      halter.rotation.y = g0.rotation.y - Math.PI / 2;
      halter.add(bogen);
      karte.szene.add(halter);
      d.wellen.push({ art: "schwert", obj: bogen, halter, zeit: 0, dauer: 0.22, start: -1.1 });
      setTimeout(() => halter.removeFromParent(), 300);
      for (const g of d.gegner) {
        if (g.stirbt != null) continue;
        const v = new THREE.Vector3().subVectors(g.gruppe.position, g0.position).setY(0);
        if (v.length() < a.reichweite && v.normalize().dot(vorn) > -0.1) this.treffen(g, vorn);
      }
    } else if (a.art === "leier") {
      // Klangwelle rund um die Figur, Noten fliegen heraus
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: "#ffb0f0", transparent: true, opacity: 0.85, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      karte.szene.add(ring);
      d.wellen.push({ art: "leier", obj: ring, zeit: 0, dauer: 0.45, radius: a.reichweite });
      for (let i = 0; i < 6; i++) {
        const w = Math.random() * Math.PI * 2;
        this.wortZeigen(zufall(["♪", "♫", "♬"]), new THREE.Vector3(g0.position.x + Math.cos(w) * 1.2, g0.position.y + 1.2 + Math.random() * 0.6, g0.position.z + Math.sin(w) * 1.2), { symbol: true });
      }
      for (const g of d.gegner) {
        if (g.stirbt != null) continue;
        const v = new THREE.Vector3().subVectors(g.gruppe.position, g0.position).setY(0);
        if (v.length() < a.reichweite) this.treffen(g, v.normalize());
      }
    } else {
      // Zauber oder Pfeil fliegt los
      let obj;
      if (a.art === "zauber") {
        obj = sprite(symbolTextur("✦"), 0.8, 0.8);
        obj.material.color = new THREE.Color("#a8f4ff");
        obj.material.blending = THREE.AdditiveBlending;
      } else {
        obj = new THREE.Group();
        const schaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6).rotateX(Math.PI / 2), M("#8a6a40"));
        const spitze = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6).rotateX(Math.PI / 2), M("#d0d8e0", { glanz: true }));
        spitze.position.z = 0.5;
        const feder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.18), M("#e04040"));
        feder.position.z = -0.4;
        obj.add(schaft, spitze, feder);
      }
      obj.position.copy(brust).addScaledVector(vorn, 0.5);
      const richtung = ziel ? new THREE.Vector3().subVectors(ziel.gruppe.position.clone().setY(ziel.gruppe.position.y + 0.35), obj.position).normalize() : vorn.clone();
      const v = richtung.multiplyScalar(a.art === "pfeil" ? 22 : 13);
      karte.szene.add(obj);
      d.wurf.push({ art: a.art, obj, v, ziel, lenkbar: a.art === "zauber", zeit: a.reichweite / v.length() + 0.2 });
    }
    return true;
  }

  /** Ein Gegner wird getroffen: Comic-Wort, Rückstoß, Lebenspunkte. */
  treffen(g, richtung) {
    if (g.stirbt != null) return;
    const schaden = stufeVon(zustand.xp).stufe >= 10 ? 2 : 1;
    g.lp -= schaden;
    g.blitz = 0.12;
    g.betaeubt = 0.5;
    g.rueckstoss.copy(richtung).setY(0).normalize().multiplyScalar(6);
    const p = g.gruppe.position;
    const karte = this.spiel.karte;
    karte.effekte.explosion(new THREE.Vector3(p.x, p.y + 0.4, p.z), "#ffe060", 16, 2);
    ton("treffer");
    if (g.lp > 0) {
      this.wortZeigen(zufall(g.def.worte), new THREE.Vector3(p.x, p.y + 1.1, p.z));
      return;
    }
    // Besiegt
    g.stirbt = 0.4;
    ton("besiegt");
    karte.effekte.aufloesen(new THREE.Vector3(p.x, p.y, p.z), 0.8, "#fff0c0");
    this.wortZeigen(zufall([...g.def.ende, ...ALLE_ENDE]), new THREE.Vector3(p.x, p.y + 1.3, p.z), { blase: true });
    zustand.besiegt = (zustand.besiegt ?? 0) + 1;
    this.beuteFallen(new THREE.Vector3(p.x, p.y, p.z));
    const d = this.karteDaten(karte);
    (d.nachschub ??= []).push({ zeit: WIEDERKOMMEN + Math.random() * 15 });
  }

  wortZeigen(text, pos, { blase = false, symbol = false } = {}) {
    const d = this.karteDaten(this.spiel.karte);
    const tex = symbol ? symbolTextur(text) : comicTextur(text, blase ? "blase" : "knall");
    const b = symbol ? 0.5 : blase ? 2.6 : 2.0, h = symbol ? 0.5 : blase ? 1.3 : 1.0;
    const s = sprite(tex, b, h);
    s.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4));
    this.spiel.karte.szene.add(s);
    d.woerter.push({ obj: s, zeit: 0, dauer: blase ? 2.2 : symbol ? 0.9 : 1.1, b, h, blase });
  }

  beuteFallen(pos) {
    const d = this.karteDaten(this.spiel.karte);
    const r = Math.random();
    let art = null;
    let summe = 0;
    for (const [id, w] of Object.entries(BEUTE)) {
      summe += w;
      if (r < summe) { art = id; break; }
    }
    if (art === "herz" && herzenJetzt() >= herzenMax()) art = Math.random() < 0.3 ? "feder" : null;
    if (!art) return;
    const obj = sprite(symbolTextur(art === "herz" ? "❤️" : HILFSMITTEL[art].icon), 0.6, 0.6);
    obj.position.copy(pos).setY(pos.y + 0.5);
    this.spiel.karte.szene.add(obj);
    d.beute.push({ art, obj, zeit: 25, phase: Math.random() * 6 });
  }

  einsammeln(b) {
    if (b.art === "herz") {
      herzenSetzen(herzenJetzt() + 1);
      ton("herz");
      this.herzenAufleuchten();
      return;
    }
    vorratAendern(b.art, 1);
    ton("herz");
    const h = HILFSMITTEL[b.art];
    toast(`${h.icon} ${h.name} gefunden! (im Inventar)`);
  }

  // ---------- Selbst getroffen ----------

  getroffen(g) {
    this.unverwundbar = UNVERWUNDBAR;
    const neu = herzenJetzt() - 1;
    herzenSetzen(neu);
    ton("schaden");
    window.dispatchEvent(new CustomEvent("eldoria:schaden"));
    this.herzenAufleuchten();
    // Rückstoß für beide
    const p = this.spiel.held.gruppe.position, gp = g.gruppe.position;
    const weg = new THREE.Vector3(p.x - gp.x, 0, p.z - gp.z).normalize();
    for (let i = 10; i > 0; i--) {
      const nx = p.x + weg.x * i * 0.12, nz = p.z + weg.z * i * 0.12;
      if (!this.spiel.blockiert(nx, nz)) { p.x = nx; p.z = nz; break; }
    }
    g.rueckstoss.copy(weg).multiplyScalar(-4);
    g.betaeubt = 0.8;
    this.wortZeigen(zufall(["Au!", "Autsch!", "Aua!"]), new THREE.Vector3(p.x, p.y + 2.1, p.z));
    if (neu <= 0) this.verloren();
  }

  herzenAufleuchten() {
    const h = document.getElementById("hud-herzen");
    if (!h) return;
    h.classList.remove("schaden"); void h.offsetWidth; h.classList.add("schaden");
  }

  /** Alle Herzen weg: zurück ins Dorf, ohne etwas zu verlieren. */
  async verloren() {
    if (this.gameOver) return;
    this.gameOver = true;
    // Bis zum Fenster nichts mehr anfangen: keine Gespräche, kein Weiterlaufen
    const s = this.spiel;
    s.tasten.clear();
    s.touch.zuruecksetzen();
    s.laufZiel = null;
    ton("gameover");
    await new Promise((r) => setTimeout(r, 700));
    await new Promise((weiter) => {
      const k = knopf("Im Dorf aufwachen ▸", weiter);
      zeigen(
        el("div", { class: "titelbild" },
          el("h2", {}, "💫 Alle Herzen verloren!"),
          el("p", {}, "Keine Sorge – du verlierst nichts: Deine XP, Gegenstände und Quests bleiben."),
          el("p", {}, "Du wachst im Dorf der Ankömmlinge auf. Deine Herzen sind wieder voll."),
          el("p", { class: "untertitel" }, "Tipp: Besiegte Gegner lassen oft Herzen fallen. Füll deine Herzen auf, bevor du in einen Bosskampf gehst!")),
        el("div", { class: "knopfleiste" }, k));
      fokus(k);
    });
    schliessen();
    // Falls trotzdem noch ein Gespräch oder Ablauf offen war, ist sein Fenster jetzt weg: sauber beenden,
    // sonst bleibt die Figur im Dorf stehen und die Knöpfe oben reagieren nicht mehr.
    s.gespraech = null;
    s.heldBlick = null;
    s.kino = null;
    if (s.skriptLauf) { s.skriptLauf.fertig(); s.skriptLauf = null; }
    s.beschaeftigt = false;
    herzenSetzen(herzenMax());
    speichern();
    this.gameOver = false;
    this.unverwundbar = 2.5;
    await this.spiel.wechseln("dorf", "start");
  }

  /** Klick mit der Maus: Trifft der Strahl einen Gegner? */
  gegnerUnterZeiger(raycaster) {
    const d = this.spiel.karte?.action;
    if (!d?.gegner.length) return null;
    const lebende = d.gegner.filter((g) => g.stirbt == null);
    const t = raycaster.intersectObjects(lebende.map((g) => g.gruppe), true)[0];
    if (!t) return null;
    return lebende.find((g) => { let o = t.object; while (o) { if (o === g.gruppe) return true; o = o.parent; } return false; }) ?? null;
  }
}
