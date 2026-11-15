// Das Intro (3D): Zu jeder Tafel des Prologs zeigt der Hintergrund eine kurze Szene.
//   0  Überflug durch die vier Reiche (Aurelia, Scriptoria, Lythara, Vocantia) – in ihrer schönen, befreiten Gestalt
//   1  Das Sprachsiegel dreht sich in einer hellen Leere (wie DAS NICHTS)
//   2  Morgrath zerschlägt das Siegel vor der Feste Schattenzahn, die vier Teile fliegen davon
//   3  Figuren aus allen Reichen laufen durcheinander und verstehen sich nicht mehr
//   4  Das Dorf der Ankömmlinge (die bekannte Kamerafahrt des Titelbilds)
// Die Reiche werden nur für das Intro gebaut und danach wieder verworfen. Damit sie „schön“ aussehen,
// gelten während des Intros die Fortschritte bis zur Befreiung aller vier Reiche (danach wird der Zustand zurückgesetzt).

import * as THREE from "../../vendor/three.module.min.js";
import { figurBauen } from "./figuren.js";
import { morgrathBauen } from "./morgrath.js";
import { siegelBauen, viertelRichtung, SIEGEL_FARBEN } from "./siegel.js";
import { Effekte } from "./effekte.js";
import { textur } from "./texturen.js";
import { E } from "./welt.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { zustand } from "../zustand.js";
import { SPRUNGPUNKTE, sprungZustand } from "../inhalte/sprungpunkte.js";
import { hash } from "../grafik16/pinsel.js";

const WEISS = "#f3f1ec";
const glatt = (u) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * Kamerafahrten über die Reiche, in Kachelkoordinaten (x, Höhe, y): von → nach, Blick von → nach.
 * Jede Fahrt dauert etwas länger als ihre Anzeige, damit die Kamera beim Überblenden noch in Bewegung ist.
 */
const REICHE = [
  { id: "aurelia", von: [8, 16, 44], nach: [22, 13, 36], blickVon: [30, 0, 20], blickNach: [40, 0, 16] },
  { id: "scriptoria", von: [19.5, 6.5, 30.5], nach: [21.5, 6.3, 29.5], blickVon: [24, 2, 20], blickNach: [26, 2, 19] },
  { id: "turm", von: [21, 14, 95], nach: [24, 12, 89], blickVon: [23, 4, 62], blickNach: [24, 4, 55] },
  { id: "vocantia", von: [10, 12, 41], nach: [20, 10, 36], blickVon: [26, 2, 22], blickNach: [30, 2, 18] },
];
const REICH_DAUER = 3.2;

const FIGUREN = ["npc_aldric", "npc_wilma", "npc_borin", "npc_finn", "npc_orpheon", "npc_nerea", "npc_kleon", "npc_lirien",
  "npc_vesna", "npc_corvin", "npc_runa", "npc_torvald", "npc_lyra", "npc_ilias"];

/** Sprechblase mit Zeichen (?, !, …) als Sprite */
function blasenTextur(zeichen, farbe) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.strokeStyle = "#3a3448"; g.lineWidth = 6;
  g.beginPath(); g.ellipse(64, 54, 50, 42, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(50, 92); g.lineTo(44, 120); g.lineTo(72, 94); g.closePath(); g.fill();
  g.fillStyle = farbe; g.font = "bold 64px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(zeichen, 64, 58);
  return textur(c);
}

export class Intro {
  constructor(spiel) {
    this.spiel = spiel;
    this.alteErledigt = zustand.erledigt;
    // Die Reiche in ihrer befreiten Gestalt (Fortschritt bis kurz vor Schattenzahn)
    try {
      zustand.erledigt = { ...sprungZustand(SPRUNGPUNKTE.find((p) => p.id === "schattenzahn"), zustand).erledigt };
      delete zustand.erledigt.schattenzahn_auftrag;
    } catch { /* ohne schöne Reiche geht es auch */ }
    this.karten = {};          // nur für das Intro gebaute Karten
    this.aktuell = null;       // { karte, bild(t, dt) }
    this.zeit = 0;
    this.kamPos = new THREE.Vector3(); this.kamBlick = new THREE.Vector3();
  }

  /** Eine Karte für das Intro bauen (nicht im Spiel zwischengespeichert), ohne Spielfigur */
  karte(id) {
    if (this.karten[id]) return this.karten[id];
    const s = this.spiel;
    const k = s.karteBauen(id);
    k.bau.aktiv?.(false);
    const vorher = s.karte;
    s.karte = k;
    s.ersteAktualisierung = true;
    s.aktualisieren();
    s.ersteAktualisierung = false;
    s.karte = vorher;
    for (const o of k.objekte) o.marker.visible = false;
    try { s.renderer.compile(k.szene, s.kamera); } catch { /* egal */ }
    this.karten[id] = k;
    return k;
  }

  /** Helle Leere wie in DAS NICHTS (für das Siegel und die Figuren) */
  weisseKarte() {
    if (this.weiss) return this.weiss;
    const szene = new THREE.Scene();
    szene.background = new THREE.Color(WEISS);
    szene.fog = new THREE.Fog(WEISS, 18, 60);
    szene.add(new THREE.HemisphereLight("#ffffff", "#d6d0c4", 1.5));
    const licht = new THREE.DirectionalLight("#fffaf0", 1.9);
    licht.position.set(6, 14, 8);
    licht.castShadow = this.spiel.q.schatten;
    licht.shadow.mapSize.set(1024, 1024);
    Object.assign(licht.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
    szene.add(licht);
    const boden = new THREE.Mesh(new THREE.CircleGeometry(80, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: WEISS, roughness: 1 }));
    boden.receiveShadow = true;
    szene.add(boden);
    this.weiss = { id: "intro_weiss", szene, animationen: [], objekte: [], effekte: new Effekte(szene, this.spiel.q.partikel), bau: {}, raster: [[]] };
    return this.weiss;
  }

  /** Wechselt zu Szene nr (mit Überblendung). */
  async zeigen(nr) {
    const s = this.spiel;
    await s.ueberblenden(() => {
      this.aufraeumen?.();
      this.aufraeumen = null;
      this.zeit = 0;
      if (nr === 0) this.reicheStarten();
      else if (nr === 1) this.siegelStarten();
      else if (nr === 2) this.schlagStarten();
      else if (nr === 3) this.figurenStarten();
      else this.dorfStarten();
    });
  }

  setzen(karte, bild) {
    this.spiel.karte = karte;
    this.aktuell = { karte, bild };
  }

  kamera(pos, blick) {
    const k = this.spiel.kamera;
    k.position.copy(pos);
    k.lookAt(blick);
  }

  // ---------- 0: Überflug durch die vier Reiche ----------
  reicheStarten() {
    let nr = 0, t0 = 0;
    const fahrt = (r) => {
      const k = this.karte(r.id);
      const pos = V(), blick = V(), boden = V();
      this.setzen(k, (t) => {
        const u = (t - t0) / (REICH_DAUER + 1.2);
        const a = r.von, b = r.nach, ba = r.blickVon, bb = r.blickNach;
        const m = (x, y) => x + (y - x) * u;
        pos.set(m(a[0], b[0]) * E, m(a[1], b[1]), m(a[2], b[2]) * E);
        blick.set(m(ba[0], bb[0]) * E, m(ba[1], bb[1]), m(ba[2], bb[2]) * E);
        boden.set(blick.x, 0, blick.z);
        k.bau.licht?.(boden, t);
        this.kamera(pos, blick);
        if (t - t0 > REICH_DAUER && !this.wechselt) {
          this.wechselt = true;
          nr = (nr + 1) % REICHE.length;
          this.spiel.ueberblenden(() => { t0 = this.zeit; fahrt(REICHE[nr]); }).then(() => { this.wechselt = false; });
        }
      });
    };
    fahrt(REICHE[0]);
  }

  // ---------- 1: Das Sprachsiegel in der hellen Leere ----------
  siegelStarten() {
    const w = this.weisseKarte();
    const s = siegelBauen();
    s.gruppe.position.set(0, 2.0, 0);
    w.szene.add(s.gruppe);
    const pos = V(), blick = V(0, 1.45, 0);
    this.setzen(w, (t, dt) => {
      s.gruppe.rotation.y = t * 0.7;
      s.gruppe.position.y = 2.0 + Math.sin(t * 1.4) * 0.08;
      const auf = glatt(t / 1.2);
      s.gruppe.scale.setScalar(0.01 + auf * 0.99);
      const w2 = 0.25 + t * 0.06;
      pos.set(Math.sin(w2) * 4.4, 2.1, Math.cos(w2) * 4.4);
      this.kamera(pos, blick);
      if (Math.random() < dt * 14) {
        const a = Math.random() * Math.PI * 2;
        w.effekte.funken.aussenden(V(Math.cos(a) * 1.1, 2.0 + Math.sin(a) * 1.1, 0).applyAxisAngle(V(0, 1, 0), s.gruppe.rotation.y), V(0, 0.4, 0), { farbe: [1.3, 1.05, 0.5], groesse: 0.08, dauer: 1.2, schwer: -0.2 });
      }
    });
    this.aufraeumen = () => w.szene.remove(s.gruppe);
  }

  // ---------- 2: Morgrath zerschlägt das Siegel vor der Feste ----------
  schlagStarten() {
    const k = this.karte("schattenzahn");
    for (const o of k.objekte) o.modell.visible = false;
    // Wo ist das Burgtor? (Zeile über dem Vorhof)
    const vorhofY = k.def.spawns.tor[1] - 3;
    const wandZ = (vorhofY - 1) * E, mx = 20 * E;
    const m = morgrathBauen();
    m.gruppe.position.set(mx, 0, wandZ + 10);
    k.szene.add(m.gruppe);
    const s = siegelBauen();
    const siegelPos = V(mx, 4.4, wandZ + 13.4);
    s.gruppe.position.copy(siegelPos);
    s.gruppe.scale.setScalar(1.35);
    k.szene.add(s.gruppe);
    // Das Siegel leuchtet golden und beleuchtet Morgrath von vorn
    const glanz = new THREE.PointLight("#ffd890", 40, 16, 1.4);
    glanz.position.copy(siegelPos).add(V(0, 0.5, 1.5));
    k.szene.add(glanz);
    const teile = s.viertel.map((v, i) => {
      // Jedes Viertel wird ein eigenes Stück, das wegfliegt
      const g = new THREE.Group();
      g.position.copy(siegelPos);
      g.scale.setScalar(1.35);
      v.parent.remove(v);
      g.add(v);
      k.szene.add(g);
      return { g, v: V(), dreh: V(), liegt: false, farbe: new THREE.Color(SIEGEL_FARBEN[i]), richtung: viertelRichtung(i) };
    });
    let zerbrochen = false, fliegen = false;
    const pos = V(), blick = V(), wackeln = V();
    const boden = V(mx, 0, wandZ + 16);
    const B = { pos: V(mx + 2.5, 8, wandZ + 29), blick: V(mx, 0, wandZ + 20) };
    const C = { pos: V(mx + 4, 26, wandZ + 44), blick: V(mx + 40, 150, wandZ - 520) };
    this.setzen(k, (t, dt) => {
      m.animieren(t, 0, dt);
      k.bau.licht?.(boden, t);
      // 0–1.6 s: das Siegel schwebt; 1.6–3.0 s: Morgrath holt aus; 3.0–3.25 s: der Schlag
      m.schlagen(t < 1.6 ? 0 : t < 3.0 ? (t - 1.6) / 1.4 * 0.6 : t < 3.25 ? 0.6 + (t - 3.0) / 0.25 * 0.12 : t < 6 ? 0.72 : Math.max(0, 0.72 - (t - 6) * 0.4));
      if (!zerbrochen) {
        s.gruppe.rotation.y = Math.sin(t * 0.9) * 0.25;
        s.gruppe.position.y = siegelPos.y + Math.sin(t * 1.6) * 0.1;
        for (const tl of teile) { tl.g.position.copy(s.gruppe.position); tl.g.rotation.copy(s.gruppe.rotation); }
      }
      glanz.intensity = zerbrochen ? Math.max(0, glanz.intensity - dt * 30) : 34 + Math.sin(t * 3) * 6;
      if (t >= 3.2 && !zerbrochen) {
        zerbrochen = true;
        s.rand.visible = false; s.mitte.visible = false; s.schein.visible = false;
        k.effekte.explosion(siegelPos, "#ffcf6a", 120, 6);
        k.effekte.explosion(siegelPos, "#6a2a8a", 80, 4);
        k.effekte.staub(V(mx, 0.1, wandZ + 15), 3, 40, "#5a4a4a");
        for (const tl of teile) {
          tl.v.copy(tl.richtung).multiplyScalar(3.5 + Math.random()).add(V((Math.random() - 0.5) * 1.5, 2.5, 2 + Math.random() * 2));
          tl.dreh.set(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3);
        }
      }
      if (zerbrochen && !fliegen) {
        for (const tl of teile) {
          if (tl.liegt) continue;
          tl.v.y -= 14 * dt;
          tl.g.position.addScaledVector(tl.v, dt);
          tl.g.rotation.x += tl.dreh.x * dt; tl.g.rotation.y += tl.dreh.y * dt; tl.g.rotation.z += tl.dreh.z * dt;
          if (tl.g.position.y < 0.12) {
            if (Math.abs(tl.v.y) > 2.5) { tl.v.y = -tl.v.y * 0.3; tl.v.x *= 0.5; tl.v.z *= 0.5; tl.dreh.multiplyScalar(0.4); }
            else { tl.liegt = true; tl.g.position.y = 0.06; tl.g.rotation.set(-Math.PI / 2, 0, tl.g.rotation.z); }
          }
        }
      }
      // Nach einer Weile steigen die vier Teile auf und fliegen in alle Himmelsrichtungen davon
      if (t >= 6.2 && !fliegen) {
        fliegen = true;
        teile.forEach((tl, i) => { const a = i * Math.PI / 2 + 0.6; tl.v.set(Math.cos(a) * 9, 7, Math.sin(a) * 6 - 4); });
      }
      if (fliegen) {
        for (const tl of teile) {
          if (!tl.g.visible) continue;
          tl.v.y += 4 * dt;
          tl.g.position.addScaledVector(tl.v, dt);
          tl.g.rotation.y += dt * 6;
          k.effekte.funken.aussenden(tl.g.position, V((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4), { farbe: [tl.farbe.r * 1.5, tl.farbe.g * 1.5, tl.farbe.b * 1.5], groesse: 0.16, dauer: 0.9, schwer: 0 });
          if (tl.g.position.y > 60) tl.g.visible = false;
        }
      }
      // Kamera: tief vor Morgrath, Blick hinauf zu Burg und Vulkan; beim Schlag bebt das Bild
      const stoss = t > 3.2 && t < 4.2 ? (1 - (t - 3.2)) * 0.25 : 0;
      wackeln.set((Math.random() - 0.5) * stoss, (Math.random() - 0.5) * stoss, 0);
      // A: der Schlag – B: Blick hinab auf die Teile am Boden – C: hinauf mit den Teilen, über der Feste erscheint der Vulkan
      const nah = glatt((t - 0.2) / 3);
      pos.set(mx + 5 - nah * 1.5, 2.8 + nah * 0.3, wandZ + 31 - nah * 3.5);
      blick.set(mx, 5.4, wandZ + 4);
      if (t > 3.3) { pos.lerp(B.pos, glatt((t - 3.3) / 0.9)); blick.lerp(B.blick, glatt((t - 3.3) / 0.9)); }
      if (t > 6.2) { pos.lerp(C.pos, glatt((t - 6.2) / 3)); blick.lerp(C.blick, glatt((t - 6.2) / 3)); }
      this.kamera(pos.add(wackeln), blick);
    });
    this.aufraeumen = () => {
      k.szene.remove(m.gruppe, s.gruppe, glanz);
      for (const tl of teile) k.szene.remove(tl.g);
    };
  }

  // ---------- 3: Missverständnisse ----------
  figurenStarten() {
    const w = this.weisseKarte();
    const blasen = { "?": blasenTextur("?", "#2a6ad0"), "!": blasenTextur("!", "#d03a2a"), "…": blasenTextur("…", "#3a3448") };
    const leute = FIGUREN.filter((k) => AUSSEHEN[k]).map((schluessel, i) => {
      const f = figurBauen(AUSSEHEN[schluessel], schluessel);
      f.gruppe.position.set((hash(i, 1, 7) - 0.5) * 16, 0, (hash(i, 2, 7) - 0.5) * 9);
      f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      w.szene.add(f.gruppe);
      const blase = new THREE.Sprite(new THREE.SpriteMaterial({ map: blasen["?"], transparent: true, depthWrite: false }));
      blase.scale.setScalar(1.0); blase.position.y = 2.7; blase.visible = false;
      f.gruppe.add(blase);
      return { f, blase, ziel: V(), warten: hash(i, 3, 7) * 1.5, blaseBis: 0, tempo: 0, sperre: 0 };
    });
    const neuesZiel = (p) => p.ziel.set((Math.random() - 0.5) * 18, 0, (Math.random() - 0.5) * 10);
    leute.forEach(neuesZiel);
    const pos = V(), blick = V(0, 0.2, -1.5), d = V();
    this.setzen(w, (t, dt) => {
      for (const p of leute) {
        const g = p.f.gruppe;
        p.sperre -= dt;
        if (p.warten > 0) {
          p.warten -= dt;
          p.tempo = Math.max(0, p.tempo - dt * 4);
          if (p.warten <= 0) neuesZiel(p);
        } else {
          d.subVectors(p.ziel, g.position); d.y = 0;
          if (d.length() < 0.3) { p.warten = 0.4 + Math.random() * 1.6; }
          else {
            p.tempo = Math.min(1, p.tempo + dt * 4);
            d.normalize();
            g.position.addScaledVector(d, dt * 1.9 * p.tempo);
            let soll = Math.atan2(d.x, d.z), diff = soll - g.rotation.y;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            g.rotation.y += diff * Math.min(1, dt * 10);
          }
        }
        // Begegnen sich zwei, bleiben sie stehen, schauen sich an – und verstehen sich nicht
        if (p.sperre <= 0) for (const q of leute) {
          if (q === p || q.sperre > 0) continue;
          if (g.position.distanceTo(q.f.gruppe.position) < 1.1) {
            const zeichen = ["?", "!", "…"];
            for (const [a, b] of [[p, q], [q, p]]) {
              const pa = a.f.gruppe.position, pb = b.f.gruppe.position;
              a.f.gruppe.rotation.y = Math.atan2(pb.x - pa.x, pb.z - pa.z);
              a.warten = 1.6; a.sperre = 4; a.blaseBis = t + 1.5;
              a.blase.material.map = blasen[zeichen[Math.floor(Math.random() * 3)]];
              // danach in die entgegengesetzte Richtung
              a.ziel.set(pa.x + (pa.x - pb.x) * 6, 0, pa.z + (pa.z - pb.z) * 6).clampScalar(-9, 9);
            }
            break;
          }
        }
        p.blase.visible = t < p.blaseBis;
        p.f.animieren(t, p.tempo, dt);
      }
      const w2 = t * 0.05;
      pos.set(Math.sin(w2) * 2.5, 4.6, 10.5 + Math.cos(w2) * 0.6);
      this.kamera(pos, blick);
    });
    this.aufraeumen = () => { for (const p of leute) w.szene.remove(p.f.gruppe); };
  }

  // ---------- 4: Das Dorf (Kamerafahrt wie im Titelbild) ----------
  dorfStarten() {
    this.spiel.karte = this.spiel.karten.dorf;
    this.aktuell = null;
  }

  /** Ein Bild im Intro (vom Spiel aufgerufen, solange es noch nicht gestartet ist) */
  bild(t, dt) {
    if (!this.aktuell) return false;
    this.zeit += dt;
    this.aktuell.bild(this.zeit, dt);
    return true;
  }

  /** Intro beenden: Zustand zurück, Karten verwerfen */
  ende() {
    this.aufraeumen?.();
    zustand.erledigt = this.alteErledigt;
    const frei = (szene) => szene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    for (const k of Object.values(this.karten)) frei(k.szene);
    if (this.weiss) frei(this.weiss.szene);
    this.karten = {};
    this.aktuell = null;
    this.spiel.karte = this.spiel.karten.dorf;
  }
}
