// 3D-Version: Darstellung, Kamera über der Schulter, Steuerung, Kollision, Interaktion.

import * as THREE from "../../vendor/three.module.min.js";
import { KARTEN } from "../welt/karten.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, ortSetzen } from "../zustand.js";
import { istOffen, schliessen, hinweis, toast, beimSchliessen, dialog } from "../ui/fenster.js";
import { hudSperreSetzen } from "../ui/hud.js";
import { bildSetzen } from "../ui/bilder.js";
import { musik } from "../musik.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { PORTRAITS } from "../grafik16/portraits.js";
import { figurBauen, torwaechterBauen, mat } from "./figuren.js";
import { E, welt, bodenBauen, umgebungBauen, baeumeBauen, wieseBauen, zaunBauen, haeuserBauen, objektBauen } from "./welt.js";
import { verlaufTextur, textur } from "./texturen.js";

const BLOCKIEREND = new Set(["T", "~", "H", "R", "d", "f"]);
const TEMPO = 5.2;
const RADIUS = 0.38;
const REICHWEITE = 1.5;

function winkelDiff(a, b) {
  return ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}

export class Spiel3D {
  constructor(behaelter) {
    this.behaelter = behaelter;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    behaelter.append(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";

    this.szene = new THREE.Scene();
    this.szene.fog = new THREE.Fog("#d4e8fb", 45, 190);
    this.kamera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);
    this.uhr = new THREE.Clock();
    this.animationen = [];
    this.tasten = new Set();
    this.yaw = 0;
    this.hoehe = 2.8;
    this.abstand = 6.2;
    this.beschaeftigt = false;
    this.sperreBis = 0;
    this.gestartet = false;
    this.tempo = 0;

    new ResizeObserver(() => this.groesseAnpassen()).observe(behaelter);
    this.groesseAnpassen();
    this.eingabe();
  }

  groesseAnpassen() {
    const w = this.behaelter.clientWidth || 800, h = this.behaelter.clientHeight || 600;
    this.renderer.setSize(w, h);
    this.kamera.aspect = w / h;
    this.kamera.updateProjectionMatrix();
  }

  // ---------- Porträts aus den 3D-Modellen ----------

  portraitsErzeugen() {
    const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    r.setSize(192, 192);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Scene();
    s.add(new THREE.HemisphereLight("#fff4e0", "#4a5a7a", 1.4));
    const key = new THREE.DirectionalLight("#fff0d8", 2.6); key.position.set(-2, 4, 4); s.add(key);
    const rand = new THREE.DirectionalLight("#9ac8ff", 2.0); rand.position.set(3, 2, -3); s.add(rand);
    const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    const schluessel = [...Object.keys(AUSSEHEN), "boss_torwaechter"];
    for (const k of schluessel) {
      const farbe = new THREE.Color(PORTRAITS[k]?.hintergrund ?? "#3a4a7a");
      s.background = textur(verlaufTextur(`#${farbe.clone().offsetHSL(0, 0, 0.15).getHexString()}`, `#${farbe.clone().offsetHSL(0, 0, -0.12).getHexString()}`));
      const modell = k === "boss_torwaechter" ? torwaechterBauen() : figurBauen(AUSSEHEN[k]).gruppe;
      modell.rotation.y = -0.35;
      s.add(modell);
      if (k === "boss_torwaechter") { cam.position.set(0.9, 2.4, 3.6); cam.lookAt(0, 2.05, 0); }
      else {
        const hut = AUSSEHEN[k].frisur === "spitzhut";
        cam.position.set(0.7, hut ? 2.25 : 2.05, hut ? 3.2 : 2.7);
        cam.lookAt(0, hut ? 2.1 : 1.92, 0);
      }
      r.render(s, cam);
      bildSetzen(k, r.domElement.toDataURL());
      s.remove(modell);
    }
    r.dispose();
    r.forceContextLoss();
  }

  // ---------- Welt ----------

  weltBauen() {
    const def = KARTEN.dorf;
    this.def = def;
    const raster = def.raster;
    this.raster = raster;

    const sonne = new THREE.DirectionalLight("#fff0d6", 2.6);
    const mitte = new THREE.Vector3(raster[0].length, 0, raster.length);
    sonne.position.copy(mitte).add(new THREE.Vector3(-28, 42, 22));
    sonne.target.position.copy(mitte);
    sonne.castShadow = true;
    sonne.shadow.mapSize.set(2048, 2048);
    Object.assign(sonne.shadow.camera, { left: -42, right: 42, top: 36, bottom: -36, near: 1, far: 140 });
    sonne.shadow.bias = -0.0004;
    sonne.shadow.normalBias = 0.03;
    this.szene.add(sonne, sonne.target);
    this.szene.add(new THREE.HemisphereLight("#cfe6ff", "#5a7a3a", 1.1));

    const boden = bodenBauen(this.szene, raster);
    this.animationen.push(boden.wellen);
    const { wolken } = umgebungBauen(this.szene, boden.breite, boden.tiefe);
    this.animationen.push((t) => { wolken.rotation.y = t * 0.004; });
    baeumeBauen(this.szene, raster);
    wieseBauen(this.szene, raster);
    zaunBauen(this.szene, raster);
    haeuserBauen(this.szene, raster, this.animationen);

    // Objekte
    this.objekte = def.objekte.map((o) => {
      const b = o.breite ?? 1, h = o.hoehe ?? 1;
      const cx = o.x * E + (b * E) / 2, cz = o.y * E + (h * E) / 2;
      let modell, figur = null;
      if (o.art === "npc" && AUSSEHEN[o.bild]) {
        figur = figurBauen(AUSSEHEN[o.bild]);
        modell = figur.gruppe;
      } else {
        modell = objektBauen(o, this.animationen);
      }
      modell.position.set(cx, 0, cz);
      this.szene.add(modell);
      const marker = this.markerBauen();
      marker.position.set(cx, o.art === "npc" ? 3.0 : 2.8, cz);
      this.szene.add(marker);
      const rand = o.art === "npc" ? 0.45 : 0.1;
      return {
        def: o, modell, figur, marker,
        rechteck: { x0: o.x * E + rand, z0: o.y * E + rand, x1: (o.x + b) * E - rand, z1: (o.y + h) * E - rand },
        fest: o.art !== "portal",
      };
    });
  }

  markerBauen() {
    const g = new THREE.Group();
    const gold = mat("#ffd040", { emissive: "#ffb000", emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.3 });
    const strich = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.14), gold);
    strich.position.y = 0.32;
    const punkt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), gold);
    g.add(strich, punkt);
    g.visible = false;
    return g;
  }

  heldSchluessel() {
    return zustand.held ? (KLASSEN[zustand.held.klasse]?.textur ?? "held_neu") : "held_neu";
  }

  heldBauen() {
    const pos = this.held?.gruppe.position.clone();
    const rot = this.held?.gruppe.rotation.y ?? Math.PI;
    if (this.held) this.szene.remove(this.held.gruppe);
    this.heldKey = this.heldSchluessel();
    this.held = figurBauen(AUSSEHEN[this.heldKey]);
    if (pos) this.held.gruppe.position.copy(pos);
    this.held.gruppe.rotation.y = rot;
    this.szene.add(this.held.gruppe);
  }

  // ---------- Ablauf ----------

  vorbereiten() {
    this.portraitsErzeugen();
    this.weltBauen();
    // Titelkamera kreist langsam über dem Dorf
    this.renderer.setAnimationLoop(() => this.bild());
  }

  starten() {
    const def = this.def;
    let spawn = zustand.ort.karte === "dorf" ? zustand.ort.spawn : "start";
    if (!def.spawns[spawn]) spawn = "start";
    ortSetzen("dorf", spawn);
    musik(def.musik ?? null);
    const [sx, sy] = def.spawns[spawn];
    this.heldBauen();
    this.held.gruppe.position.set(welt(sx), 0, welt(sy));
    this.held.gruppe.rotation.y = Math.PI;
    this.yaw = 0;
    this.kamera.position.set(welt(sx), 3, welt(sy) + 6);
    this.gestartet = true;
    if (!this.hoererAngemeldet) {
      this.hoererAngemeldet = true;
      beimSchliessen(() => { this.tasten.clear(); this.sperreBis = performance.now() + 200; });
      hudSperreSetzen(() => this.beschaeftigt);
    }
    this.aktualisieren();
    toast(`📍 ${def.name}`);
    window.eldoria = { ...(window.eldoria ?? {}), spiel3d: this, zustand };
  }

  aktualisieren() {
    for (const obj of this.objekte) {
      const { def, modell, marker } = obj;
      const sichtbar = def.sichtbar ? def.sichtbar(zustand) : true;
      modell.visible = sichtbar;
      if (def.art === "portal") modell.userData.setzeAktiv?.(def.aktiv(zustand));
      obj.interaktiv = Boolean(def.aktion) && sichtbar;
      obj.aktivFest = obj.fest && sichtbar;
      marker.visible = obj.interaktiv && Boolean(def.marker?.(zustand));
    }
    if (this.gestartet && this.heldKey !== this.heldSchluessel()) this.heldBauen();
  }

  eingabe() {
    const ignorieren = (ev) => ["INPUT", "TEXTAREA", "SELECT"].includes(ev.target?.tagName);
    window.addEventListener("keydown", (ev) => {
      if (ignorieren(ev)) return;
      const k = ev.key.toLowerCase();
      if (istOffen() || this.beschaeftigt) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) ev.preventDefault();
      this.tasten.add(k);
      if ((k === "e" || k === " ") && !ev.repeat && performance.now() > this.sperreBis) {
        const obj = this.naechstesObjekt();
        if (obj) this.interagieren(obj);
      }
      if (k === "c" && this.held) this.yaw = this.held.gruppe.rotation.y + Math.PI;
    });
    window.addEventListener("keyup", (ev) => this.tasten.delete(ev.key.toLowerCase()));
    window.addEventListener("blur", () => this.tasten.clear());
    const leinwand = this.renderer.domElement;
    let ziehen = null;
    leinwand.addEventListener("pointerdown", (ev) => { ziehen = { x: ev.clientX, y: ev.clientY }; leinwand.setPointerCapture(ev.pointerId); });
    leinwand.addEventListener("pointermove", (ev) => {
      if (!ziehen) return;
      this.yaw -= (ev.clientX - ziehen.x) * 0.006;
      this.hoehe = THREE.MathUtils.clamp(this.hoehe + (ev.clientY - ziehen.y) * 0.02, 1.4, 7);
      ziehen = { x: ev.clientX, y: ev.clientY };
      this.manuellBis = performance.now() + 1500;
    });
    leinwand.addEventListener("pointerup", () => { ziehen = null; });
    leinwand.addEventListener("wheel", (ev) => { ev.preventDefault(); this.abstand = THREE.MathUtils.clamp(this.abstand + ev.deltaY * 0.005, 3.5, 11); }, { passive: false });
  }

  blockiert(x, z) {
    const r = RADIUS;
    for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r], [0, 0]]) {
      const tx = Math.floor((x + dx) / E), tz = Math.floor((z + dz) / E);
      const zeile = this.raster[tz];
      if (!zeile || tx < 0 || tx >= zeile.length) return true;
      if (BLOCKIEREND.has(zeile[tx])) return true;
    }
    for (const o of this.objekte) {
      if (!o.aktivFest) continue;
      const q = o.rechteck;
      if (x > q.x0 - r && x < q.x1 + r && z > q.z0 - r && z < q.z1 + r) return true;
    }
    return false;
  }

  naechstesObjekt() {
    if (!this.held) return null;
    const p = this.held.gruppe.position;
    let bestes = null, abstand = Infinity;
    for (const o of this.objekte) {
      if (!o.interaktiv) continue;
      const q = o.rechteck;
      const d = Math.hypot(Math.max(q.x0 - p.x, 0, p.x - q.x1), Math.max(q.z0 - p.z, 0, p.z - q.z1));
      if (d < REICHWEITE && d < abstand) { bestes = o; abstand = d; }
    }
    return bestes;
  }

  async interagieren(obj) {
    this.beschaeftigt = true;
    this.tasten.clear();
    hinweis(null);
    const p = this.held.gruppe.position, m = obj.modell.position;
    this.held.gruppe.rotation.y = Math.atan2(m.x - p.x, m.z - p.z);
    if (obj.figur) obj.modell.rotation.y = Math.atan2(p.x - m.x, p.z - m.z);
    let reiseZiel = null;
    const weltApi = {
      aktualisieren: () => this.aktualisieren(),
      reisen: (karte) => { reiseZiel = karte; },
      erschuettern: () => { this.wackelnBis = performance.now() + 300; },
    };
    try {
      await obj.def.aktion(weltApi);
      if (reiseZiel) {
        await dialog("Portal", "Das Portal leuchtet hell … aber in dieser 3D-Demo gibt es bisher nur das Dorf der Ankömmlinge. Lythara folgt, wenn ihr euch für die 3D-Version entscheidet.");
      }
    } catch (fehler) {
      console.error(fehler);
      toast("Hoppla, da ist etwas schiefgelaufen.");
    }
    this.beschaeftigt = false;
    schliessen();
    this.aktualisieren();
  }

  bewegen(dt) {
    const k = this.tasten;
    let vor = 0, seit = 0;
    if (!this.beschaeftigt && !istOffen()) {
      if (k.has("w") || k.has("arrowup")) vor += 1;
      if (k.has("s") || k.has("arrowdown")) vor -= 1;
      if (k.has("a") || k.has("arrowleft")) seit -= 1;
      if (k.has("d") || k.has("arrowright")) seit += 1;
    }
    const g = this.held.gruppe;
    const vorwaerts = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const rechts = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const richtung = vorwaerts.multiplyScalar(vor).add(rechts.multiplyScalar(seit));
    const laenge = richtung.length();
    const zielTempo = laenge > 0 ? TEMPO : 0;
    this.tempo += (zielTempo - this.tempo) * Math.min(1, dt * 10);
    if (laenge > 0) {
      richtung.divideScalar(laenge);
      const ziel = Math.atan2(richtung.x, richtung.z);
      g.rotation.y += winkelDiff(g.rotation.y, ziel) * Math.min(1, dt * 12);
      const schritt = this.tempo * dt;
      const nx = g.position.x + richtung.x * schritt, nz = g.position.z + richtung.z * schritt;
      if (!this.blockiert(nx, nz)) g.position.set(nx, 0, nz);
      else if (!this.blockiert(nx, g.position.z)) g.position.x = nx;
      else if (!this.blockiert(g.position.x, nz)) g.position.z = nz;
      // Kamera schwenkt langsam hinter die Figur (nicht beim Rückwärtsgehen)
      if (vor >= 0 && !(this.manuellBis > performance.now())) {
        this.yaw += winkelDiff(this.yaw, g.rotation.y + Math.PI) * Math.min(1, dt * 1.6);
      }
    }
  }

  kameraFolgen(dt) {
    const p = this.held.gruppe.position;
    const ziel = new THREE.Vector3(p.x + Math.sin(this.yaw) * this.abstand, this.hoehe, p.z + Math.cos(this.yaw) * this.abstand);
    // Leicht nach rechts versetzt: Blick „über die Schulter“
    const rechts = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).multiplyScalar(0.7);
    ziel.add(rechts);
    this.kamera.position.lerp(ziel, 1 - Math.exp(-dt * 6));
    const blick = new THREE.Vector3(p.x, 1.6, p.z).add(rechts.multiplyScalar(0.6));
    if (this.wackelnBis > performance.now()) blick.add(new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, 0));
    this.kamera.lookAt(blick);
  }

  bild() {
    const dt = Math.min(0.05, this.uhr.getDelta());
    const t = this.uhr.elapsedTime;
    for (const a of this.animationen) a(t);
    for (const o of this.objekte) {
      o.figur?.animieren(t + o.def.x, 0, dt);
      if (o.marker.visible) { o.marker.position.y = 3.0 + Math.sin(t * 3) * 0.12; o.marker.rotation.y = t * 1.5; }
    }
    if (this.gestartet) {
      this.bewegen(dt);
      this.held.animieren(t, this.tempo / TEMPO, dt);
      this.kameraFolgen(dt);
      const obj = !this.beschaeftigt && !istOffen() ? this.naechstesObjekt() : null;
      if (obj) hinweis("E", obj.def.hinweis ?? `Mit ${obj.def.name} sprechen`);
      else if (!this.beschaeftigt) hinweis(null);
    } else {
      // Titelbild: Kamera kreist über dem Dorf
      const m = new THREE.Vector3(this.raster[0].length, 0, this.raster.length);
      this.kamera.position.set(m.x + Math.sin(t * 0.08) * 26, 14, m.z + Math.cos(t * 0.08) * 22);
      this.kamera.lookAt(m.x, 1, m.z - 2);
    }
    this.renderer.render(this.szene, this.kamera);
  }
}
