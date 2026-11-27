// 3D-Version: Darstellung, Kamera über der Schulter, Steuerung (Tastatur, Maus, Touch),
// Kartenwechsel, Kollision, Interaktion und Effekte.

import * as THREE from "../../vendor/three.module.min.js";
import { EffectComposer } from "../../vendor/three-addons/postprocessing/EffectComposer.js";
import { RenderPass } from "../../vendor/three-addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../../vendor/three-addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "../../vendor/three-addons/postprocessing/OutputPass.js";
import { KARTEN } from "../welt/karten.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, ortSetzen } from "../zustand.js";
import { ton } from "../ton.js";
import { istOffen, schliessen, hinweis, toast, beimSchliessen, el, knopf } from "../ui/fenster.js";
import { hudSperreSetzen, hudEinstellungen } from "../ui/hud.js";
import { bildSetzen } from "../ui/bilder.js";
import { musik, grollen } from "../musik.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { PORTRAITS, portraitBild } from "../grafik16/portraits.js";
import { figurBauen } from "./figuren.js";
import { E, welt, dorfBauen, objektBauen } from "./welt.js";
import { halleBauen } from "./halle3d.js";
import { inselnBauen } from "./inseln3d.js";
import { nichtsBauen } from "./nichts3d.js";
import { aureliaBauen } from "./aurelia3d.js";
import { scriptoriaBauen } from "./scriptoria3d.js";
import { vocantiaBauen } from "./vocantia3d.js";
import { treppenturmBauen } from "./treppenturm3d.js";
import { festeBauen } from "./feste3d.js";
import { Effekte, punktSkalaSetzen } from "./effekte.js";
import { Intro } from "./intro.js";
import { textur, lichtTextur } from "./texturen.js";
import { Touchsteuerung } from "./steuerung.js";
import { STUFEN, startStufe, gewaehlteStufe, stufeSpeichern, Messung, istTouch } from "./qualitaet.js";

const BAUER = { dorf: dorfBauen, halle: halleBauen, turm: inselnBauen, nichts: nichtsBauen, aurelia: aureliaBauen, scriptoria: scriptoriaBauen, vocantia: vocantiaBauen, treppenturm: treppenturmBauen, schattenzahn: festeBauen };
const TEMPO = 5.2;
const RADIUS = 0.38;
const REICHWEITE = 1.5;

function winkelDiff(a, b) {
  return ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}

export class Spiel3D {
  constructor(behaelter) {
    this.behaelter = behaelter;
    this.stufe = startStufe();
    this.q = { ...STUFEN[this.stufe] };
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.q.pixelRatio));
    this.renderer.shadowMap.enabled = this.q.schatten;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    behaelter.append(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";

    this.kamera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);
    this.uhr = new THREE.Clock();
    this.tasten = new Set();
    this.yaw = 0;
    this.hoehe = 2.9;
    this.abstand = 6.2;
    this.kameraAbstand = 6.2;
    this.beschaeftigt = false;
    this.sperreBis = 0;
    this.gestartet = false;
    globalThis.eldoriaDreiD = true;
    this.tempo = 0;
    this.karten = {};
    this.karte = null;
    this.laufZiel = null;
    this.messung = new Messung();
    this.raycaster = new THREE.Raycaster();

    // Überblende für Kartenwechsel
    this.blende = document.createElement("div");
    this.blende.id = "blende";
    document.getElementById("buehne").append(this.blende);
    // Standbild für echtes Überblenden zwischen zwei Szenen (Intro)
    this.standbild = document.createElement("canvas");
    this.standbild.id = "standbild";
    behaelter.append(this.standbild);

    this.touch = new Touchsteuerung({
      aktiv: () => this.gestartet && !this.beschaeftigt && !istOffen(),
      drehen: (dx, dy) => this.drehen(dx, dy),
      zoomen: (f) => { this.abstand = THREE.MathUtils.clamp(this.abstand * f, 3.2, 11); },
      tippen: (x, y) => this.tippen(x, y),
      aktion: () => { const o = this.naechstesObjekt(); if (o && !this.beschaeftigt && !istOffen()) this.interagieren(o); },
    });

    new ResizeObserver(() => this.groesseAnpassen()).observe(behaelter);
    this.groesseAnpassen();
    this.eingabe();
    this.ereignisse();
    this.einstellungen();
  }

  groesseAnpassen() {
    const w = this.behaelter.clientWidth || 800, h = this.behaelter.clientHeight || 600;
    this.renderer.setSize(w, h);
    this.kamera.aspect = w / h;
    // Im Hochformat etwas weiter sehen
    this.kamera.fov = w < h ? 68 : 55;
    this.kamera.updateProjectionMatrix();
    this.composer?.setSize(w, h);
    const px = h * this.renderer.getPixelRatio();
    punktSkalaSetzen(px / (2 * Math.tan(THREE.MathUtils.degToRad(this.kamera.fov / 2))));
  }

  // ---------- Grafikqualität ----------

  qualitaetSetzen(stufe, { speichern = false } = {}) {
    this.stufe = stufe;
    this.q = { ...STUFEN[stufe] };
    if (speichern) stufeSpeichern(stufe);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.q.pixelRatio));
    this.renderer.shadowMap.enabled = this.q.schatten;
    for (const k of Object.values(this.karten)) {
      k.szene.traverse((o) => {
        if (o.isDirectionalLight) {
          o.castShadow = this.q.schatten;
          if (o.shadow.mapSize.x !== this.q.schattenGroesse) {
            o.shadow.mapSize.set(this.q.schattenGroesse, this.q.schattenGroesse);
            o.shadow.map?.dispose();
            o.shadow.map = null;
          }
        }
        if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true;
      });
    }
    if (!this.q.bloom) { this.composer?.dispose(); this.composer = null; }
    this.groesseAnpassen();
  }

  composerBauen() {
    if (!this.karte) return;
    const w = this.behaelter.clientWidth || 800, h = this.behaelter.clientHeight || 600;
    // Mit Kantenglättung (MSAA): ohne eigenes Ziel würde der Composer ohne Antialiasing rendern
    const ziel = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, ziel);
    this.renderPass = new RenderPass(this.karte.szene, this.kamera);
    this.composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.32, 0.45, 0.82);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.composer.setSize(w, h);
  }

  einstellungen() {
    hudEinstellungen({
      steuerung: () => istTouch()
        ? "Laufen: Joystick links oder auf eine Stelle tippen · Sprechen: runder Knopf rechts oder Figur antippen · Kamera: wischen, mit zwei Fingern zoomen"
        : "Laufen: W A S D oder Pfeiltasten (oder Klick auf eine Stelle) · Sprechen/Benutzen: E, Leertaste oder Klick · Kamera: Maus ziehen, Mausrad zoomt, C setzt sie zurück · Aufgaben: Q · Inventar: I · Heldenpass: P · Musik: M · Menü: Esc",
      zusatz: () => {
        const gewaehlt = gewaehlteStufe();
        const knoepfe = [["auto", "Automatisch"], ...Object.entries(STUFEN).map(([k, v]) => [k, v.name])].map(([k, name]) => {
          const aktiv = (gewaehlt ?? "auto") === k;
          return knopf(name, () => {
            if (k === "auto") { stufeSpeichern(null); this.qualitaetSetzen(startStufe()); }
            else this.qualitaetSetzen(k, { speichern: true });
            toast(`Grafik: ${name}`);
            schliessen();
          }, aktiv ? "knopf" : "knopf zweitrangig");
        });
        return [
          el("h3", {}, "Grafik"),
          el("p", {}, `Jetzt: ${STUFEN[this.stufe].name}. Wenn das Spiel ruckelt, wähle eine niedrigere Stufe.`),
          el("div", { class: "knopfleiste", style: "justify-content:flex-start;margin-top:6px" }, knoepfe),
        ];
      },
    });
  }

  // ---------- Porträts (Pixel-Art aus der 16-Bit-Version) ----------

  portraitsErzeugen() {
    for (const k of Object.keys(PORTRAITS)) bildSetzen(k, portraitBild(k).alsCanvas(1).toDataURL());
  }

  // ---------- Karten ----------

  karteBauen(id) {
    const def = KARTEN[id];
    const szene = new THREE.Scene();
    const animationen = [];
    // kino(pos, blick): Zwischensequenzen führen die Kamera selbst (null gibt sie zurück)
    const kino = (pos, blick) => { this.kino = pos ? { pos: pos.clone(), blick: blick.clone() } : null; };
    const bau = BAUER[id](szene, def.raster, { animationen, qualitaet: this.q, def, kino });
    const effekte = new Effekte(szene, this.q.partikel);
    bau.effekteSetzen?.(effekte);
    const karte = { id, def, szene, animationen, bau, effekte, raster: def.raster, objekte: [] };

    for (const o of def.objekte) {
      const b = o.breite ?? 1, h = o.hoehe ?? 1;
      const cx = o.x * E + (b * E) / 2, cz = o.y * E + (h * E) / 2;
      // Unsichtbare Stellen (src/welt/stellen.js) liegen auf vorhandener Deko und brauchen kein eigenes Modell
      let res = o.unsichtbar ? { modell: new THREE.Group(), kopfY: o.kopfY, weit: o.weit } : bau.objektModell(o);
      if (!res && o.art === "npc" && AUSSEHEN[o.bild]) {
        const figur = figurBauen(AUSSEHEN[o.bild], o.bild);
        res = { modell: figur.gruppe, figur };
      }
      if (!res) res = { modell: objektBauen(o, animationen) };
      const versatz = res.versatz ?? [0, 0];
      const bodenY = bau.boden?.(cx, cz) ?? 0;
      res.modell.position.set(cx + versatz[0], bodenY, cz + versatz[1]);
      if (o.drehung) res.modell.rotation.y = o.drehung;
      szene.add(res.modell);
      const marker = this.markerBauen();
      const markerY = bodenY + (res.boss ? 5.2 : o.art === "tor" ? 7.9 : o.art === "npc" ? 2.95 : 2.8);
      marker.position.set(cx, markerY, cz + (o.art === "tor" ? 1.3 : 0));
      marker.userData.y = markerY;
      szene.add(marker);
      const rand = o.art === "npc" ? 0.45 : 0.1;
      karte.objekte.push({
        def: o, modell: res.modell, figur: res.figur ?? null, marker, setzeOffen: res.setzeOffen, boss: res.boss, bodenY,
        kopfY: res.kopfY, weit: res.weit, kameraY: res.kameraY,
        rechteck: { x0: o.x * E + rand, z0: o.y * E + rand, x1: (o.x + b) * E - rand, z1: (o.y + h) * E - rand },
        fest: o.art !== "portal",
        grundDrehung: o.drehung ?? 0,
        blick: null,
      });
    }
    for (const z of bau.zusatz ?? []) {
      karte.objekte.push({ ...z, marker: { visible: false, position: new THREE.Vector3(), userData: {} }, fest: false, interaktiv: true, rechteck: { x0: 0, z0: 0, x1: 0, z1: 0 } });
    }

    // Leuchtring unter dem nächsten Ziel
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 40).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: "#ffd870", transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    ring.position.y = 0.04;
    ring.visible = false;
    szene.add(ring);
    karte.ring = ring;
    return karte;
  }

  markerBauen() {
    const g = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: "#ffd040", emissive: "#ffb000", emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.3 });
    // Gold = Hauptquest, Blau = Nebenquest (marker() liefert dann "neben")
    g.userData.farbe = (neben) => {
      gold.color.set(neben ? "#60b8ff" : "#ffd040");
      gold.emissive.set(neben ? "#1a6aff" : "#ffb000");
      schein.material.color.set(neben ? "#8ac8ff" : "#ffffff");
    };
    const strich = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 10), gold);
    strich.position.y = 0.36;
    const punkt = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), gold);
    const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: textur(lichtTextur("rgba(255,210,90,0.8)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    schein.scale.setScalar(1.3);
    schein.position.y = 0.25;
    g.add(strich, punkt, schein);
    g.visible = false;
    return g;
  }

  heldSchluessel() {
    return zustand.held ? (KLASSEN[zustand.held.klasse]?.textur ?? "held_neu") : "held_neu";
  }

  heldBauen() {
    const pos = this.held?.gruppe.position.clone();
    const rot = this.held?.gruppe.rotation.y ?? Math.PI;
    this.held?.gruppe.removeFromParent();
    this.heldKey = this.heldSchluessel();
    this.held = figurBauen(AUSSEHEN[this.heldKey], this.heldKey);
    if (pos) this.held.gruppe.position.copy(pos);
    this.held.gruppe.rotation.y = rot;
    this.karte?.szene.add(this.held.gruppe);
  }

  // ---------- Ablauf ----------

  // ---------- Intro ----------

  /** Zeigt Szene nr des Intros hinter der Prolog-Tafel (siehe intro.js). */
  async introSzene(nr) {
    if (this.gestartet) return;
    this.intro ??= new Intro(this);
    await this.intro.zeigen(nr);
  }

  introEnde() {
    this.intro?.ende();
    this.intro = null;
  }

  /**
   * Echtes Überblenden: Das letzte Bild wird als Standbild festgehalten, dann wechselt fn die Szene,
   * und das Standbild blendet langsam aus. Liefert ein Promise, sobald fn ausgeführt ist.
   */
  ueberblenden(fn) {
    return new Promise((fertig) => { this.ueberblendAuftrag = { fn, fertig }; });
  }

  ueberblendenAusfuehren() {
    const a = this.ueberblendAuftrag;
    this.ueberblendAuftrag = null;
    const c = this.standbild, quelle = this.renderer.domElement;
    try {
      c.width = quelle.width; c.height = quelle.height;
      c.getContext("2d").drawImage(quelle, 0, 0);
      c.style.transition = "none";
      c.style.opacity = "1";
    } catch { /* ohne Standbild wechselt es eben hart */ }
    try { a.fn(); } catch (fehler) { console.error(fehler); }
    requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transition = "opacity 1s ease"; c.style.opacity = "0"; }));
    a.fertig();
  }

  vorbereiten() {
    this.portraitsErzeugen();
    this.karte = this.karten.dorf = this.karteBauen("dorf");
    if (this.q.bloom) this.composerBauen();
    this.renderer.setAnimationLoop(() => this.bild());
  }

  /** Kompass oben rechts: N zeigt immer nach Norden (die Ziele im Questlog nennen Himmelsrichtungen) */
  kompassBauen() {
    if (this.kompass) return;
    const k = document.createElement("div");
    k.className = "kompass";
    k.setAttribute("aria-hidden", "true");
    k.innerHTML = `<div class="kompass-rose"><span class="k-n">N</span><span class="k-o">O</span><span class="k-s">S</span><span class="k-w">W</span><i></i></div>`;
    this.behaelter.append(k);
    this.kompass = k.firstElementChild;
  }

  starten() {
    this.kompassBauen();
    let id = KARTEN[zustand.ort.karte] ? zustand.ort.karte : "dorf";
    let spawn = zustand.ort.spawn;
    if (!KARTEN[id].spawns[spawn]) spawn = "start";
    if (!this.hoererAngemeldet) {
      this.hoererAngemeldet = true;
      beimSchliessen(() => { this.tasten.clear(); this.touch.zuruecksetzen(); this.sperreBis = performance.now() + 200; });
      hudSperreSetzen(() => this.beschaeftigt);
    }
    this.heldBauen();
    this.wechseln(id, spawn, { sofort: true });
    this.gestartet = true;
    document.body.classList.add("im-spiel");
    window.eldoria = { ...(window.eldoria ?? {}), spiel3d: this, zustand };
  }

  async wechseln(id, spawn, { sofort = false } = {}) {
    // In 3D ist die Halle der Tausend Tore zum Turm der Tausend Treppen geworden (gleiche Startpunkte)
    if (id === "halle") id = "treppenturm";
    if (!sofort) {
      this.blende.classList.add("an");
      await new Promise((r) => setTimeout(r, 450));
    }
    const karte = this.karten[id] ??= this.karteBauen(id);
    this.karte = karte;
    // Welten erfahren, ob sie gerade sichtbar sind (z. B. Frost-Rand am Bildschirm in Vocantia)
    for (const k of Object.values(this.karten)) k.bau.aktiv?.(k === karte);
    if (this.renderPass) this.renderPass.scene = karte.szene;
    karte.szene.add(this.held.gruppe);
    const [sx, sy] = karte.def.spawns[spawn] ?? karte.def.spawns.start;
    const startY = karte.bau.boden?.(welt(sx), welt(sy)) ?? 0;
    this.held.gruppe.position.set(welt(sx), startY, welt(sy));
    this.held.gruppe.rotation.y = Math.PI;
    this.yaw = 0;
    this.hoehe = karte.bau.kamera?.hoehe ?? 2.9;
    this.abstand = karte.bau.kamera?.abstand ?? 6.2;
    this.kameraAbstand = this.abstand;
    this.laufZiel = null;
    this.kamera.position.set(welt(sx), startY + this.hoehe, welt(sy) + this.abstand);
    ortSetzen(id, spawn);
    musik(karte.def.musik ?? null);
    this.ersteAktualisierung = true;
    this.aktualisieren();
    this.ersteAktualisierung = false;
    try { this.renderer.compile(karte.szene, this.kamera); } catch { /* egal */ }
    toast(`📍 ${karte.def.name}`);
    if (!sofort) {
      await new Promise((r) => setTimeout(r, 120));
      this.blende.classList.remove("an");
    }
  }

  aktualisieren() {
    const karte = this.karte;
    if (!karte) return;
    for (const obj of karte.objekte) {
      const { def, modell, marker } = obj;
      if (obj.dynamisch) continue;
      const sichtbar = def.sichtbar ? def.sichtbar(zustand) : true;
      // Besiegter Boss löst sich auf
      if (obj.boss && obj.warSichtbar && !sichtbar && !this.ersteAktualisierung) {
        obj.verschwinden = 2.2;
        karte.effekte.aufloesen(modell.position, 4);
        this.wackelnBis = performance.now() + 600;
      } else if (!obj.verschwinden || sichtbar) {
        modell.visible = sichtbar;
      }
      obj.warSichtbar = sichtbar;
      let offen = false;
      if (def.art === "tor" || def.offen) {
        offen = Boolean(def.offen?.(zustand));
        if (def.art === "tor" && offen && obj.warOffen === false && !this.ersteAktualisierung) {
          const p = modell.position;
          karte.effekte.staub(new THREE.Vector3(p.x, 0.1, p.z + 1.4), 2.2, 40);
          karte.effekte.explosion(new THREE.Vector3(p.x, 3, p.z + 1.2), "#ffe8a0", 50, 4);
        }
        obj.setzeOffen?.(offen, this.ersteAktualisierung || obj.warOffen === undefined);
        obj.warOffen = offen;
      }
      if (def.art === "portal") modell.userData.setzeAktiv?.(def.aktiv(zustand));
      if (def.leuchtet) modell.userData.setzeLeuchten?.(def.leuchtet(zustand), this.ersteAktualisierung);
      obj.interaktiv = Boolean(def.aktion) && sichtbar && !offen;
      obj.aktivFest = obj.fest && sichtbar && !offen;
      const markerWert = def.marker?.(zustand);
      marker.visible = obj.interaktiv && Boolean(markerWert);
      marker.userData.farbe?.(markerWert === "neben");
    }
    if (this.held && this.heldKey !== this.heldSchluessel()) this.heldBauen();
  }

  // ---------- Eingabe ----------

  eingabe() {
    const ignorieren = (ev) => ["INPUT", "TEXTAREA", "SELECT"].includes(ev.target?.tagName);
    window.addEventListener("keydown", (ev) => {
      if (ignorieren(ev)) return;
      const k = ev.key.toLowerCase();
      if (istOffen() || this.beschaeftigt || !this.gestartet) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) ev.preventDefault();
      this.tasten.add(k);
      this.laufZiel = null;
      if ((k === "e" || k === " ") && !ev.repeat && performance.now() > this.sperreBis) {
        const obj = this.naechstesObjekt();
        if (obj) this.interagieren(obj);
      }
      if (k === "c" && this.held) this.yaw = this.held.gruppe.rotation.y + Math.PI;
    });
    window.addEventListener("keyup", (ev) => this.tasten.delete(ev.key.toLowerCase()));
    window.addEventListener("blur", () => this.tasten.clear());

    // Maus: ziehen dreht die Kamera, Klick läuft zur Stelle oder spricht an
    const leinwand = this.renderer.domElement;
    let ziehen = null;
    leinwand.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType !== "mouse" || ev.button !== 0) return;
      ziehen = { x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY };
      leinwand.setPointerCapture(ev.pointerId);
    });
    leinwand.addEventListener("pointermove", (ev) => {
      if (!ziehen || ev.pointerType !== "mouse") return;
      this.drehen(ev.clientX - ziehen.x, ev.clientY - ziehen.y);
      ziehen.x = ev.clientX; ziehen.y = ev.clientY;
    });
    leinwand.addEventListener("pointerup", (ev) => {
      if (!ziehen || ev.pointerType !== "mouse") return;
      const klick = Math.hypot(ev.clientX - ziehen.x0, ev.clientY - ziehen.y0) < 5;
      ziehen = null;
      if (klick) this.tippen(ev.clientX, ev.clientY);
    });
    leinwand.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      this.abstand = THREE.MathUtils.clamp(this.abstand + ev.deltaY * 0.005, 3.2, 11);
    }, { passive: false });
  }

  drehen(dx, dy) {
    if (!this.gestartet) return;
    this.yaw -= dx * 0.006;
    this.hoehe = THREE.MathUtils.clamp(this.hoehe + dy * 0.02, 1.3, this.karte?.bau.kamera?.maxHoehe ?? 7);
    this.manuellBis = performance.now() + 1500;
  }

  /** Tippen/Klicken: Objekt ansprechen oder zur Stelle laufen. */
  tippen(x, y) {
    if (!this.gestartet || this.beschaeftigt || istOffen() || !this.karte) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.kamera);
    const ziele = this.karte.objekte.filter((o) => o.interaktiv && o.modell.visible);
    const treffer = this.raycaster.intersectObjects(ziele.map((o) => o.modell), true)[0];
    if (treffer) {
      const obj = ziele.find((o) => { let p = treffer.object; while (p) { if (p === o.modell) return true; p = p.parent; } return false; });
      if (obj) {
        if (this.abstandZu(obj) < REICHWEITE) this.interagieren(obj);
        else this.laufZiel = { obj, festSeit: 0 };
        return;
      }
    }
    const boden = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(this.held?.gruppe.position.y ?? 0));
    const punkt = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(boden, punkt)) {
      this.laufZiel = { punkt, festSeit: 0 };
      this.karte.effekte.ziel(punkt);
    }
  }

  ereignisse() {
    window.addEventListener("eldoria:belohnung", (ev) => {
      if (!this.held || !this.karte) return;
      const p = this.held.gruppe.position;
      this.karte.effekte.belohnung(new THREE.Vector3(p.x, p.y + 0.2, p.z), Boolean(ev.detail?.aufgestiegen));
    });
    window.addEventListener("eldoria:treffer", () => {
      const o = this.gespraech;
      if (!o || !this.karte) return;
      const p = o.modell.position;
      this.karte.effekte.explosion(new THREE.Vector3(p.x, o.boss ? 3 : 1.6, p.z + 0.5), "#9af4ff", 70, 5);
      this.trefferBis = performance.now() + 250;
    });
    window.addEventListener("eldoria:schaden", () => {
      this.wackelnBis = performance.now() + 400;
      document.getElementById("buehne")?.classList.add("schaden");
      setTimeout(() => document.getElementById("buehne")?.classList.remove("schaden"), 450);
    });
  }

  // ---------- Kollision und Reichweite ----------

  blockiert(x, z) {
    const r = RADIUS, raster = this.karte.raster, blockZ = this.karte.bau.blockZeichen;
    for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r], [0, 0]]) {
      const tx = Math.floor((x + dx) / E), tz = Math.floor((z + dz) / E);
      const zeile = raster[tz];
      if (!zeile || tx < 0 || tx >= zeile.length) return true;
      if (blockZ.has(zeile[tx])) return true;
    }
    for (const o of this.karte.objekte) {
      if (!o.aktivFest) continue;
      const q = o.rechteck;
      if (x > q.x0 - r && x < q.x1 + r && z > q.z0 - r && z < q.z1 + r) return true;
    }
    return false;
  }

  abstandZu(o) {
    const p = this.held.gruppe.position;
    if (o.dynamisch) return Math.max(0, Math.hypot(o.modell.position.x - p.x, o.modell.position.z - p.z) - 0.4);
    const q = o.rechteck;
    return Math.hypot(Math.max(q.x0 - p.x, 0, p.x - q.x1), Math.max(q.z0 - p.z, 0, p.z - q.z1));
  }

  naechstesObjekt() {
    if (!this.held || !this.karte) return null;
    let bestes = null, abstand = Infinity;
    for (const o of this.karte.objekte) {
      if (!o.interaktiv || o.verschwinden) continue;
      const d = this.abstandZu(o);
      if (d < REICHWEITE && d < abstand) { bestes = o; abstand = d; }
    }
    return bestes;
  }

  async interagieren(obj) {
    if (this.beschaeftigt) return;
    this.beschaeftigt = true;
    this.tasten.clear();
    this.touch.zuruecksetzen();
    this.laufZiel = null;
    this.touch.aktionZeigen(null);
    hinweis(null);
    const p = this.held.gruppe.position, m = obj.modell.position;
    this.heldBlick = Math.atan2(m.x - p.x, m.z - p.z);
    if (obj.figur && !obj.boss && !obj.figur.starr?.()) obj.blick = Math.atan2(p.x - m.x, p.z - m.z);
    this.gespraech = obj;
    this.gespraechSeite = this.freieSeite(obj);
    obj.figur?.sprechen?.(true, this.uhr.elapsedTime);
    const reise = {};
    try {
      const api = this.weltApi(this.karte, reise);
      await (obj.aktion ? obj.aktion(api) : obj.def.aktion(api));
      if (reise.ziel) ton("portal");
    } catch (fehler) {
      console.error(fehler);
      toast("Hoppla, da ist etwas schiefgelaufen.");
    }
    obj.figur?.sprechen?.(false);
    if (obj.figur && !obj.boss) obj.blick = obj.grundDrehung;
    this.gespraech = null;
    await this.ablaufEnde(reise);
  }

  /** Was Aktionen und Auslöser mit der Welt tun dürfen. */
  weltApi(karte, reise) {
    return {
      aktualisieren: () => this.aktualisieren(),
      reisen: (k, spawn) => { reise.ziel = [k, spawn]; },
      erschuettern: () => { this.wackelnBis = performance.now() + 450; },
      dreiD: true,
      effekte: karte.effekte,
      // Zwischensequenzen der 3D-Welt (z. B. das Sprachsiegel und der Einsturz in Schattenzahn)
      szene: (name) => karte.bau.ereignis?.(name) ?? Promise.resolve(),
      // Die Spielfigur läuft von selbst zu einer Kachel (für Zwischensequenzen)
      laufen: (tx, ty) => new Promise((fertig) => {
        this.heldBlick = null;
        this.skriptLauf = { punkt: new THREE.Vector3(welt(tx), 0, welt(ty)), fertig, zeit: 0, fest: 0 };
      }),
      blicken: (tx, ty) => { const p = this.held.gruppe.position; this.heldBlick = Math.atan2(welt(tx) - p.x, welt(ty) - p.z); },
    };
  }

  /** Ein Auslöser der Karte (z. B. „die Figur betritt den Vorhof“) startet einen Ablauf wie ein Gespräch. */
  async ausloesen(a) {
    if (this.beschaeftigt) return;
    this.beschaeftigt = true;
    this.tasten.clear();
    this.touch.zuruecksetzen();
    this.laufZiel = null;
    this.touch.aktionZeigen(null);
    hinweis(null);
    const reise = {};
    try {
      await a.aktion(this.weltApi(this.karte, reise));
    } catch (fehler) {
      console.error(fehler);
      toast("Hoppla, da ist etwas schiefgelaufen.");
    }
    await this.ablaufEnde(reise);
  }

  async ablaufEnde(reise) {
    this.heldBlick = null;
    this.kino = null;
    if (this.skriptLauf) { this.skriptLauf.fertig(); this.skriptLauf = null; }
    schliessen();
    this.aktualisieren();
    if (reise.ziel && KARTEN[reise.ziel[0]]) await this.wechseln(reise.ziel[0], reise.ziel[1]);
    this.beschaeftigt = false;
  }

  // ---------- Bewegung ----------

  bewegen(dt) {
    const k = this.tasten;
    let vor = 0, seit = 0;
    const frei = !this.beschaeftigt && !istOffen();
    if (frei) {
      if (k.has("w") || k.has("arrowup")) vor += 1;
      if (k.has("s") || k.has("arrowdown")) vor -= 1;
      if (k.has("a") || k.has("arrowleft")) seit -= 1;
      if (k.has("d") || k.has("arrowright")) seit += 1;
      vor -= this.touch.joy.y;
      seit += this.touch.joy.x;
      if (vor || seit) this.laufZiel = null;
    }
    const g = this.held.gruppe;
    const vorwaerts = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const rechts = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const richtung = vorwaerts.multiplyScalar(vor).add(rechts.multiplyScalar(seit));
    let staerke = Math.min(1, richtung.length());

    // Automatisch laufen (Tippen/Klicken)
    let automatisch = false;
    if (this.skriptLauf) {
      // In einer Zwischensequenz läuft die Figur selbst; hängt sie fest, steht sie einfach am Ziel
      const s = this.skriptLauf;
      richtung.set(s.punkt.x - g.position.x, 0, s.punkt.z - g.position.z);
      s.zeit += dt;
      if (richtung.length() < 0.25 || s.fest > 1.0 || s.zeit > 15) {
        if (richtung.length() >= 0.25) g.position.set(s.punkt.x, g.position.y, s.punkt.z);
        this.skriptLauf = null;
        s.fertig();
      } else { staerke = 1; automatisch = true; }
    }
    if (frei && this.laufZiel && !staerke) {
      const z = this.laufZiel;
      if (z.obj && this.abstandZu(z.obj) < REICHWEITE * 0.8) {
        this.laufZiel = null;
        this.interagieren(z.obj);
      } else {
        const ziel = z.obj ? z.obj.modell.position : z.punkt;
        richtung.set(ziel.x - g.position.x, 0, ziel.z - g.position.z);
        if (richtung.length() < 0.25) this.laufZiel = null;
        else { staerke = 1; automatisch = true; }
      }
    }

    const zielTempo = staerke > 0.1 ? TEMPO * staerke : 0;
    this.tempo += (zielTempo - this.tempo) * Math.min(1, dt * 10);
    if (staerke > 0.1) {
      richtung.normalize();
      const ziel = Math.atan2(richtung.x, richtung.z);
      g.rotation.y += winkelDiff(g.rotation.y, ziel) * Math.min(1, dt * 12);
      const schritt = this.tempo * dt;
      const vorher = g.position.clone();
      const nx = g.position.x + richtung.x * schritt, nz = g.position.z + richtung.z * schritt;
      if (!this.blockiert(nx, nz)) g.position.set(nx, g.position.y, nz);
      else if (!this.blockiert(nx, g.position.z)) g.position.x = nx;
      else if (!this.blockiert(g.position.x, nz)) g.position.z = nz;
      if (automatisch && this.skriptLauf) {
        this.skriptLauf.fest = g.position.distanceTo(vorher) < schritt * 0.2 ? this.skriptLauf.fest + dt : 0;
      } else if (automatisch) {
        // Hängt die Figur fest, wird das automatische Laufen beendet
        this.laufZiel.festSeit = g.position.distanceTo(vorher) < schritt * 0.2 ? this.laufZiel.festSeit + dt : 0;
        if (this.laufZiel.festSeit > 0.4) this.laufZiel = null;
      }
      // Kamera schwenkt langsam hinter die Figur (nicht beim Rückwärtsgehen).
      // Steht die Figur an einer Kante oder Wand fest, bleibt die Kamera ruhig – sonst dreht sie sich im Kreis.
      const bewegt = g.position.distanceTo(vorher) > schritt * 0.3;
      this.festZeit = bewegt ? 0 : (this.festZeit ?? 0) + dt;
      if ((vor >= 0 || automatisch) && this.festZeit < 0.15 && !(this.manuellBis > performance.now())) {
        this.yaw += winkelDiff(this.yaw, g.rotation.y + Math.PI) * Math.min(1, dt * (automatisch ? 1.0 : 1.6));
      }
      // Staubwölkchen
      this.schrittZeit = (this.schrittZeit ?? 0) - dt;
      if (this.schrittZeit < 0 && this.tempo > TEMPO * 0.6) {
        this.schrittZeit = 0.16;
        this.karte.effekte.schritt(g.position);
      }
    }
    if (this.heldBlick != null) g.rotation.y += winkelDiff(g.rotation.y, this.heldBlick) * Math.min(1, dt * 8);
    // Treppen und Etagen: Die Figur folgt der Bodenhöhe der Welt (ohne „boden“ bleibt sie auf 0)
    const sollY = this.karte.bau.boden?.(g.position.x, g.position.z) ?? 0;
    g.position.y += (sollY - g.position.y) * Math.min(1, dt * 14);
  }

  /** Auf welcher Seite hat die Gesprächskamera freie Sicht? (1 = rechts, -1 = links) */
  freieSeite(o) {
    const p = this.held.gruppe.position, m = o.modell.position;
    const richtung = new THREE.Vector3(p.x - m.x, 0, p.z - m.z);
    if (richtung.lengthSq() < 0.01) richtung.set(0, 0, 1);
    richtung.normalize();
    const kopf = new THREE.Vector3(p.x, p.y + 1.7, p.z);
    const wert = (s) => {
      const ziel = kopf.clone().addScaledVector(richtung, 2.3).addScaledVector(new THREE.Vector3(richtung.z, 0, -richtung.x), 1.75 * s);
      ziel.y = p.y + 2.05;
      return this.freieStrecke(kopf, ziel) / kopf.distanceTo(ziel);
    };
    return wert(-1) > wert(1) + 0.05 ? -1 : 1;
  }

  /** Wie weit kann die Kamera vom Kopf weg, ohne in einer Mauer zu stecken? */
  freieStrecke(von, nach) {
    const raster = this.karte.raster, hindernis = this.karte.bau.hindernis;
    const d = von.distanceTo(nach);
    const schritt = 0.2;
    const v = new THREE.Vector3();
    for (let s = schritt; s <= d; s += schritt) {
      v.lerpVectors(von, nach, s / d);
      const tx = Math.floor(v.x / E), ty = Math.floor(v.z / E);
      if (ty < 0 || ty >= raster.length || tx < 0 || tx >= raster[0].length) continue;
      if (hindernis(tx, ty) > v.y - 0.25) return Math.max(1.0, s - 0.45);
      // Feste Objekte (geschlossene Tore, Marktstand, Brunnen …) verdecken die Sicht
      for (const o of this.karte.objekte) {
        if (!o.aktivFest || o === this.gespraech) continue;
        const q = o.rechteck;
        const hoch = o.def.art === "bruecke" ? 0 : o.def.art === "tor" ? 7 : o.boss ? 4.5 : 3.3;
        if (v.x > q.x0 - 0.3 && v.x < q.x1 + 0.3 && v.z > q.z0 - 0.4 && v.z < q.z1 + 0.4 && v.y < hoch) return Math.max(1.0, s - 0.45);
      }
    }
    return d;
  }

  /** Blickrichtung der Kamera (0 = nach Norden) als Drehwinkel für den Kompass */
  kompassWinkel() {
    const v = new THREE.Vector3();
    this.kamera.getWorldDirection(v);
    // Blick nach Norden (-z) → 0; Blick nach Westen → +90° im Uhrzeigersinn, N steht rechts
    return Math.atan2(-v.x, -v.z);
  }

  kameraFolgen(dt) {
    const p = this.held.gruppe.position;
    let ziel, blick;
    const o = this.gespraech;
    const kino = this.kino;
    if (kino !== this.kinoVorher) {
      // Zwischensequenz: schwarze Balken oben und unten, keine Bedienelemente
      document.body.classList.toggle("kino", Boolean(kino));
      this.kinoVorher = kino;
    }
    if (kino) {
      this.kamera.position.lerp(kino.pos, 1 - Math.exp(-dt * 2.4));
      blick = kino.blick.clone();
    } else if (o && o.modell.visible) {
      // Gesprächskamera: über die Schulter auf das Gegenüber
      const m = o.modell.position;
      const richtung = new THREE.Vector3(p.x - m.x, 0, p.z - m.z);
      if (richtung.lengthSq() < 0.01) richtung.set(0, 0, 1);
      richtung.normalize();
      const quer = new THREE.Vector3(richtung.z, 0, -richtung.x).multiplyScalar(this.gespraechSeite ?? 1);
      const gross = o.boss || o.def.art === "tor" || o.def.bild === "siegeltuer";
      const weit = o.weit ?? (gross ? 5.0 : o.dynamisch ? 2.0 : 2.3);
      ziel = new THREE.Vector3(p.x, p.y + (o.kameraY ?? (gross ? 3.0 : 2.05)), p.z).addScaledVector(richtung, weit).addScaledVector(quer, gross ? 2.4 : 1.75);
      const kopfY = o.kopfY ?? (o.boss ? 3.3 : o.def.art === "tor" ? 3.6 : o.dynamisch ? 0.5 : o.figur ? 1.85 : 1.2);
      blick = new THREE.Vector3(m.x, m.y + kopfY, m.z).lerp(new THREE.Vector3(p.x, p.y + 1.6, p.z), 0.18);
      // Auf niedrigen Bildschirmen (Handy quer) die Figuren höher ins Bild rücken
      blick.y -= this.behaelter.clientHeight < 520 ? 1.0 : 0.35;
      const kopfHeld = new THREE.Vector3(p.x, p.y + 1.7, p.z);
      const frei = this.freieStrecke(kopfHeld, ziel);
      const voll = kopfHeld.distanceTo(ziel);
      if (frei < voll) ziel.lerpVectors(kopfHeld, ziel, frei / voll);
      this.kamera.position.lerp(ziel, 1 - Math.exp(-dt * 3.5));
    } else {
      const rechts = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const kopf = new THREE.Vector3(p.x, p.y + 1.7, p.z).addScaledVector(rechts, 0.35);
      const voll = new THREE.Vector3(p.x + Math.sin(this.yaw) * this.abstand, p.y + this.hoehe, p.z + Math.cos(this.yaw) * this.abstand).addScaledVector(rechts, 0.7);
      const frei = this.freieStrecke(kopf, voll);
      const gesamt = kopf.distanceTo(voll);
      const sollAbstand = Math.min(1, frei / gesamt);
      // Näher heran sofort, wieder weg langsam
      this.kameraAnteil = this.kameraAnteil ?? 1;
      this.kameraAnteil += (sollAbstand - this.kameraAnteil) * Math.min(1, dt * (sollAbstand < this.kameraAnteil ? 14 : 2.5));
      ziel = new THREE.Vector3().lerpVectors(kopf, voll, this.kameraAnteil);
      // Muss die Kamera nah heran (Mauer, Bäume oder Rand hinter der Figur), steigt sie zusätzlich nach oben.
      // So schaut sie von oben auf die Figur statt aus ihrem Kopf – das Bild springt und dreht nicht mehr wild.
      if (this.kameraAnteil < 0.7) ziel.y = Math.min(ziel.y + (0.7 - this.kameraAnteil) * 3.2, p.y + (this.karte.bau.kamera?.maxHoehe ?? 7) - 0.3);
      this.kamera.position.lerp(ziel, 1 - Math.exp(-dt * 7));
      blick = new THREE.Vector3(p.x, p.y + 1.55, p.z).addScaledVector(rechts, 0.42);
    }
    if (this.wackelnBis > performance.now()) blick.add(new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, 0));
    this.blickPunkt = this.blickPunkt ? this.blickPunkt.lerp(blick, 1 - Math.exp(-dt * (kino ? 2.6 : 8))) : blick.clone();
    this.kamera.lookAt(this.blickPunkt);
    // Die Erde bebt (Stärke 0–1 kommt von der Welt): Die Kamera zittert mit
    const beben = this.karte.bau.beben?.() ?? 0;
    if (beben > 0.01) {
      const s = beben * 0.022;
      this.kamera.rotation.x += (Math.random() - 0.5) * s;
      this.kamera.rotation.y += (Math.random() - 0.5) * s;
      this.kamera.rotation.z += (Math.random() - 0.5) * s * 0.5;
    }
  }

  // ---------- Bildschleife ----------

  bild() {
    const dt = Math.min(0.05, this.uhr.getDelta());
    const t = this.uhr.elapsedTime;
    const karte = this.karte;
    if (!karte) return;
    for (const a of karte.animationen) a(t, dt);
    const spieler = this.held?.gruppe.position ?? new THREE.Vector3(30, 0, 30);
    for (const o of karte.objekte) {
      if (o.dynamisch) {
        o.update(t, dt, spieler, this.tempo / TEMPO, (x, z) => !this.blockiertFuerTier(x, z));
        continue;
      }
      if (o.figur && o.modell.visible) {
        o.figur.animieren(t + o.def.x, 0, dt);
        if (o.blick != null) o.modell.rotation.y += winkelDiff(o.modell.rotation.y, o.blick) * Math.min(1, dt * 5);
      }
      if (o.verschwinden) {
        o.verschwinden -= dt;
        const k = Math.max(0, o.verschwinden / 2.2);
        o.modell.scale.setScalar(1.25 * (0.3 + 0.7 * k));
        o.modell.position.y = (o.bodenY ?? 0) + (1 - k) * 1.5;
        if (o.verschwinden <= 0) { o.verschwinden = 0; o.modell.visible = false; }
      }
      if (o.boss && this.trefferBis > performance.now()) o.modell.position.x += (Math.random() - 0.5) * 0.08;
      if (o.marker.visible) {
        o.marker.position.y = o.marker.userData.y + Math.sin(t * 3) * 0.12;
        o.marker.rotation.y = t * 1.5;
      }
    }
    karte.effekte.update(dt);
    if (this.gestartet) {
      this.bewegen(dt);
      this.held.animieren(t, this.tempo / TEMPO, dt);
      karte.bau.licht?.(this.held.gruppe.position, t);
      this.kameraFolgen(dt);
      grollen(karte.bau.beben?.() ?? 0);
      // Auslöser der Karte (z. B. Betreten eines Bereichs)
      if (karte.def.ausloeser && !this.beschaeftigt && !istOffen()) {
        const p = this.held.gruppe.position;
        const a = karte.def.ausloeser.find((x) => x.wenn(zustand, Math.floor(p.x / E), Math.floor(p.z / E)));
        if (a) this.ausloesen(a);
      }
      if (this.kompass) this.kompass.style.transform = `rotate(${this.kompassWinkel()}rad)`;
      const obj = !this.beschaeftigt && !istOffen() ? this.naechstesObjekt() : null;
      const text = obj ? (obj.def.hinweis ?? `Mit ${obj.def.name} sprechen`) : null;
      if (obj) hinweis("E", text);
      else if (!this.beschaeftigt) hinweis(null);
      this.touch.aktionZeigen(text);
      // Leuchtring unter dem Ziel
      karte.ring.visible = Boolean(obj);
      if (obj) {
        const m = obj.modell.position;
        const q = obj.rechteck;
        const groesse = obj.dynamisch ? 0.6 : Math.max(0.8, Math.max(q.x1 - q.x0, q.z1 - q.z0) * 0.6);
        karte.ring.position.set(obj.dynamisch ? m.x : (q.x0 + q.x1) / 2, (obj.bodenY ?? 0) + 0.04, obj.dynamisch ? m.z : (q.z0 + q.z1) / 2);
        karte.ring.scale.setScalar(groesse * (1 + Math.sin(t * 4) * 0.05));
        karte.ring.material.opacity = 0.5 + Math.sin(t * 4) * 0.2;
      }
    } else if (this.intro?.bild(t, dt)) {
      // Intro: die Szene führt die Kamera selbst
    } else {
      // Titelbild: Kamera kreist langsam über dem Dorf
      const m = new THREE.Vector3(karte.raster[0].length, 0, karte.raster.length);
      karte.bau.licht?.(m, t);
      this.kamera.position.set(m.x + Math.sin(t * 0.08) * 26, 14, m.z + Math.cos(t * 0.08) * 22);
      this.kamera.lookAt(m.x, 1, m.z - 2);
    }
    if (this.q.bloom && karte.bau.bloom !== false) {
      if (!this.composer) this.composerBauen();
      if (this.renderPass.scene !== karte.szene) this.renderPass.scene = karte.szene;
      this.composer.render(dt);
    } else {
      this.renderer.render(karte.szene, this.kamera);
    }
    if (this.ueberblendAuftrag) this.ueberblendenAusfuehren();
    // Läuft es zu langsam? Dann automatisch eine Stufe tiefer.
    const jetzt = performance.now();
    const roh = jetzt - (this.letztesBild ?? jetzt);
    this.letztesBild = jetzt;
    if (this.gestartet && !gewaehlteStufe() && !document.hidden && this.messung.bild(roh)) {
      const naechste = this.stufe === "hoch" ? "mittel" : this.stufe === "mittel" ? "niedrig" : null;
      if (naechste) {
        this.qualitaetSetzen(naechste);
        toast(`Grafik auf „${STUFEN[naechste].name}“ gestellt, damit es flüssiger läuft.`);
      }
    }
  }

  /** Für Tiere: nur Kacheln und feste Objekte, mit kleinerem Radius. */
  blockiertFuerTier(x, z) {
    const raster = this.karte.raster, blockZ = this.karte.bau.blockZeichen;
    for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      const tx = Math.floor((x + dx) / E), tz = Math.floor((z + dz) / E);
      const zeile = raster[tz];
      if (!zeile || tx < 0 || tx >= zeile.length || blockZ.has(zeile[tx])) return true;
    }
    for (const o of this.karte.objekte) {
      if (!o.aktivFest) continue;
      const q = o.rechteck;
      if (x > q.x0 - 0.2 && x < q.x1 + 0.2 && z > q.z0 - 0.2 && z < q.z1 + 0.2) return true;
    }
    return false;
  }
}
