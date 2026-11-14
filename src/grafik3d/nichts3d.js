// DAS NICHTS in 3D: eine endlose, helle Leere. Der Boden verschwimmt im Nebel mit dem Himmel,
// sodass kein Horizont zu sehen ist. Alle Figuren stehen auf weißen Sockeln, drehen sich langsam
// und halten an, wenn man sie anspricht.

import * as THREE from "../../vendor/three.module.min.js";
import { figurBauen, torwaechterBauen, Teile, ZYL, RING, KASTEN } from "./figuren.js";
import { drachenrichterBauen } from "./drache.js";
import { bibliothekarBauen } from "./werwolf.js";
import { katzeBauen } from "./katze.js";
import { WAECHTER } from "./halle3d.js";
import { textur } from "./texturen.js";
import { lichtpunkteBauen } from "./effekte.js";
import { AUSSEHEN } from "../grafik16/figuren.js";
import { hash } from "../grafik16/pinsel.js";
import { E } from "./welt.js";
import { posen } from "../welt/nichts_posen.js";

const WEISS = "#f3f1ec";
const SOCKEL_H = { figur: 0.35, tier: 0.35, boss: 0.45, drache: 0.6 };

function leinwand(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

function bodenTextur() {
  const [c, g] = leinwand(256, 256);
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(120,115,105,0.16)"; g.lineWidth = 2;
  g.strokeRect(1, 1, 254, 254);
  g.strokeStyle = "rgba(120,115,105,0.07)"; g.lineWidth = 1;
  g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
  return c;
}

function schriftTextur(text, { breite = 512, hoehe = 96, groesse = 44, farbe = "#4a4640", rahmen = true } = {}) {
  const [c, g] = leinwand(breite, hoehe);
  if (rahmen) {
    g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath(); g.roundRect(4, 4, breite - 8, hoehe - 8, 14); g.fill();
    g.strokeStyle = "#c9a24e"; g.lineWidth = 4; g.stroke();
  }
  g.font = `600 ${groesse}px Cinzel, Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = farbe;
  g.fillText(text, breite / 2, hoehe / 2 + 2, breite - 40);
  return c;
}

/** Sockel mit Goldring und Namensschild; darauf die Figur auf einem Drehteller. */
function galerieModell(o, animationen) {
  const { typ, key, name } = o.galerie;
  const g = new THREE.Group();
  const r = (o.breite * E) / 2 - 0.25;
  const h = SOCKEL_H[typ];
  const t = new Teile();
  t.add(ZYL(1, 1.04, 40), "#ffffff", [0, h / 2, 0], [0, 0, 0], [r, h, r]);
  t.add(ZYL(1, 1, 40), "#ebe7df", [0, 0.03, 0], [0, 0, 0], [r * 1.08, 0.06, r * 1.08]);
  t.add(RING(0.04), "#c9a24e", [0, h - 0.02, 0], [Math.PI / 2, 0, 0], [r * 0.98, r * 0.98, 1], { art: "glanz" });
  t.in(g);
  // Namensschild vor dem Sockel
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4.2, 1.6 + name.length * 0.1), 0.52),
    new THREE.MeshBasicMaterial({ map: textur(schriftTextur(name)), transparent: true, toneMapped: false }));
  schild.position.set(0, 0.3, r + 0.1);
  schild.rotation.x = -0.35;
  g.add(schild);

  const dreh = new THREE.Group();
  dreh.position.y = h;
  g.add(dreh);
  let figur;
  if (typ === "figur") figur = figurBauen(AUSSEHEN[key], key);
  else if (typ === "tier") { figur = katzeBauen(); figur.gruppe.scale.setScalar(2.2); }
  else if (typ === "boss") { figur = torwaechterBauen(WAECHTER[key]); figur.gruppe.scale.setScalar(1.25); }
  else if (typ === "werwolf") { figur = bibliothekarBauen(); posen.set(key, figur.pose); }
  else { figur = drachenrichterBauen(); figur.gruppe.scale.setScalar(1.2); posen.set(key, figur.pose); }
  dreh.add(figur.gruppe);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.castShadow || m.userData.figur; m.receiveShadow = true; } });

  let pause = false;
  const wrapper = {
    kopf: figur.kopf,
    animieren(zeit, _tempo, dt = 0.016) {
      if (typ === "tier") figur.animieren(zeit, 0, dt, true);
      else figur.animieren(zeit, 0, dt);
      if (pause) {
        const d = ((-dreh.rotation.y % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        dreh.rotation.y += d * Math.min(1, dt * 4);
      } else {
        dreh.rotation.y += dt * 0.35;
      }
    },
    sprechen(an, zeit) {
      pause = an;
      figur.sprechen?.(an, zeit);
    },
  };
  const gross = typ === "boss" || typ === "drache";
  return {
    modell: g, figur: wrapper, boss: gross,
    // Der Drache ist groß: Kamera weiter weg und tiefer blicken, damit er über dem Dialogfenster ganz zu sehen ist
    kopfY: h + (typ === "drache" ? 1.4 : typ === "boss" ? 3.0 : typ === "tier" ? 0.8 : 1.75),
    weit: typ === "drache" ? 11 : undefined,
    kameraY: typ === "drache" ? 3.4 : undefined,
  };
}

/** Schwebende, halb durchsichtige Formen in der Ferne – damit die Leere Tiefe bekommt. */
function schwebendeFormen(szene, mitte, animationen) {
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, transparent: true, opacity: 0.55, flatShading: true });
  const formen = [];
  const geos = [new THREE.BoxGeometry(1, 1, 1), new THREE.OctahedronGeometry(0.8, 0), new THREE.TetrahedronGeometry(0.9, 0)];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(geos[i % 3], mat);
    const a = hash(i, 1, 171) * Math.PI * 2, r = 45 + hash(i, 2, 171) * 60;
    m.position.set(mitte.x + Math.cos(a) * r, 3 + hash(i, 3, 171) * 22, mitte.z + Math.sin(a) * r);
    m.scale.setScalar(1 + hash(i, 4, 171) * 3.5);
    m.userData = { y: m.position.y, p: hash(i, 5, 171) * 6, v: 0.05 + hash(i, 6, 171) * 0.15 };
    szene.add(m);
    formen.push(m);
  }
  animationen.push((zeit) => {
    for (const m of formen) {
      m.position.y = m.userData.y + Math.sin(zeit * 0.3 + m.userData.p) * 1.2;
      m.rotation.set(zeit * m.userData.v, zeit * m.userData.v * 1.3, 0);
    }
  });
}

export function nichtsBauen(szene, raster, kontext) {
  const { animationen, qualitaet } = kontext;
  const B = raster[0].length * E, T = raster.length * E;
  const mitte = new THREE.Vector3(B / 2, 0, T / 2);

  szene.background = new THREE.Color(WEISS);
  szene.fog = new THREE.Fog(WEISS, 60, 160);   // nur ganz weit hinten, damit der Horizont verschwindet

  szene.add(new THREE.HemisphereLight("#ffffff", "#d6d0c4", 1.5));
  const licht = new THREE.DirectionalLight("#fffaf0", 1.9);
  licht.castShadow = qualitaet.schatten;
  licht.shadow.mapSize.set(qualitaet.schattenGroesse, qualitaet.schattenGroesse);
  Object.assign(licht.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
  licht.shadow.bias = -0.0005;
  licht.shadow.normalBias = 0.04;
  szene.add(licht, licht.target);

  // Endloser Boden mit feinem Raster, der im Nebel verschwindet
  const tex = textur(bodenTextur(), { wiederholen: true });
  tex.repeat.set(200, 200);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, color: "#ffffff", roughness: 0.95 }));
  boden.position.set(mitte.x, 0, mitte.z);
  boden.receiveShadow = true;
  szene.add(boden);

  // Schriftzug am Boden beim Eingang
  const titel = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.9).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: textur(schriftTextur("DAS NICHTS", { breite: 1024, hoehe: 192, groesse: 120, farbe: "#b8b2a6", rahmen: false })), transparent: true, depthWrite: false }));
  titel.position.set(mitte.x, 0.02, 34 * E);
  szene.add(titel);

  schwebendeFormen(szene, mitte, animationen);
  lichtpunkteBauen(szene, [[mitte.x, mitte.z]], { farbe: "#e8c880", groesse: 0.14, hoehe: [0.3, 7], streuung: 30, anzahl: Math.round(120 * qualitaet.partikel) }, animationen);

  return {
    blockZeichen: new Set(["#"]),
    hindernis: () => 0,
    objektModell: (o) => (o.galerie ? galerieModell(o, animationen) : null),
    licht: (p) => {
      licht.position.set(p.x - 12, 30, p.z + 18);
      licht.target.position.set(p.x, 0, p.z);
    },
    kamera: { hoehe: 3.0, abstand: 6.6, maxHoehe: 9 },
    bloom: false,   // Leuchten würde die weiße Leere überstrahlen und die Figuren verschleiern
  };
}
