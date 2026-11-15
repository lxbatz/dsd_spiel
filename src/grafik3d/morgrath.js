// Morgrath, der Verschleierer – der letzte Gegner von Eldoria.
// Ein riesiger Dunkler Herrscher in schwarzer, gezackter Plattenrüstung:
//   - Helm mit glühendem T-Visier und einer Krone aus langen, schwarzen Dornen
//   - drei Lagen Schulterplatten mit Stacheln, gezackte Armschienen, Krallenhandschuhe
//   - in der Brust ein glühender Riss (dort, wo er das Sprachsiegel zerbrochen hat)
//   - ein zerrissener Umhang, der im Hitzewind weht, Glutfunken und dunkler Rauch um ihn herum
//   - ein riesiger Streitkolben mit Flanschen und Stacheln
// Posen: "stehen" (Standard, atmet, Umhang weht, Kolben pendelt), "taumeln" (getroffen, weicht zurück) und "gefallen"
// (taumelt rückwärts, kippt nach hinten und stürzt in die Lava – danach unsichtbar).
// Ursprung: zwischen den Füßen, Blick in Richtung +z. Höhe etwa 7,5 Einheiten.
//
// Liefert { gruppe, animieren(zeit, tempo, dt), pose(name), sofort(name), sprechen(an) }.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, ZYL, KAPSEL, RING, KASTEN, KEGEL, gruppe } from "./figuren.js";
import { textur, lichtTextur } from "./texturen.js";

const EISEN = "#26232c", EISEN_H = "#3e3a46", EISEN_D = "#16141a", KANTE = "#5a5262", GLUT = "#ff6a1a", GLUT_H = "#ffc060";
const UMHANG = "#2a0c10", UMHANG_D = "#160608";

let _licht = null;
const lichtTex = () => (_licht ??= textur(lichtTextur("rgba(255,255,255,1)")));

/** Stachel: Kegel von Punkt p in Richtung (rx, rz) gekippt */
function stachel(t, p, laenge, dicke, r, farbe = EISEN_D) {
  t.add(KEGEL(6), farbe, p, r, [dicke, laenge, dicke], { art: "glanz" });
}

function beinBauen(eltern, s) {
  const h = gruppe(eltern, s * 0.55, 2.3, 0);
  const t = new Teile();
  t.add(KAPSEL(), EISEN, [0, -0.55, 0.05], [0.12, 0, 0], [0.36, 0.42, 0.38], { art: "glanz" });          // Oberschenkel
  t.add(KUGEL(), EISEN_H, [0, -1.2, 0.12], [0, 0, 0], [0.3, 0.26, 0.3], { art: "glanz" });               // Knie
  stachel(t, [0, -1.15, 0.42], 0.55, 0.11, [Math.PI / 2 + 0.3, 0, 0]);                                  // Kniestachel
  t.add(ZYL(0.95, 0.75, 10), EISEN, [0, -1.75, 0], [0, 0, 0], [0.32, 1.0, 0.36], { art: "glanz" });     // Beinschiene
  for (let k = 0; k < 3; k++) stachel(t, [0, -1.45 - k * 0.3, -0.32], 0.35, 0.07, [-Math.PI / 2 - 0.4, 0, 0]);
  t.add(KASTEN(), EISEN_D, [0, -2.2, 0.18], [0, 0, 0], [0.42, 0.22, 0.85], { art: "glanz" });          // Stiefel
  t.add(KEGEL(4), EISEN_D, [0, -2.22, 0.75], [Math.PI / 2, Math.PI / 4, 0], [0.22, 0.45, 0.14], { art: "glanz" });
  t.add(KASTEN(), KANTE, [0, -2.05, 0.18], [0, 0, 0], [0.44, 0.04, 0.8], { art: "glanz" });
  t.in(h);
  return h;
}

function schulterBauen(eltern, s) {
  const g = gruppe(eltern, s * 1.15, 1.55, -0.05);
  const t = new Teile();
  for (let k = 0; k < 3; k++) {
    const r = 0.78 - k * 0.12;
    t.add(KUGEL(), k % 2 ? EISEN_H : EISEN, [s * k * 0.12, -k * 0.22, 0], [0, 0, s * (0.35 + k * 0.1)], [r, r * 0.55, r * 0.85], { art: "glanz" });
    t.add(RING(0.06), KANTE, [s * k * 0.12, -k * 0.22 - r * 0.12, 0], [Math.PI / 2, 0, s * (0.35 + k * 0.1)], [r * 0.95, r * 0.8, r], { art: "glanz" });
  }
  // Lange Stacheln nach oben und außen
  for (let k = 0; k < 4; k++) stachel(t, [s * (0.15 + k * 0.18), 0.45 - k * 0.05, -0.35 + k * 0.22], 1.0 - k * 0.12, 0.11, [0, 0, -s * (0.25 + k * 0.18)]);
  t.in(g);
  return g;
}

function armBauen(eltern, s) {
  const schulter = gruppe(eltern, s * 1.15, 1.3, 0);
  const t = new Teile();
  t.add(KAPSEL(), EISEN, [s * 0.1, -0.55, 0], [0, 0, s * 0.1], [0.27, 0.42, 0.27], { art: "glanz" });
  t.add(KUGEL(), EISEN_H, [s * 0.15, -1.1, 0.02], [0, 0, 0], [0.24, 0.22, 0.24], { art: "glanz" });
  t.in(schulter);
  const unter = gruppe(schulter, s * 0.17, -1.12, 0.02);
  const u = new Teile();
  u.add(ZYL(1.15, 0.85, 10), EISEN, [0, -0.5, 0], [0, 0, 0], [0.27, 0.95, 0.27], { art: "glanz" });   // Armschiene
  for (let k = 0; k < 3; k++) stachel(u, [s * 0.25, -0.25 - k * 0.25, 0], 0.4, 0.07, [0, 0, -s * (Math.PI / 2 + 0.3)]);
  u.add(KUGEL(), EISEN_D, [0, -1.12, 0.05], [0, 0, 0], [0.3, 0.26, 0.28], { art: "glanz" });          // Faust
  for (let k = 0; k < 4; k++) u.add(KEGEL(5), EISEN_H, [(k - 1.5) * 0.11, -1.3, 0.2], [0.5, 0, 0], [0.05, 0.22, 0.05], { art: "glanz" });  // Krallen
  u.in(unter);
  return { schulter, unter };
}

function kopfBauen(eltern) {
  const k = gruppe(eltern, 0, 2.15, 0.08);
  const t = new Teile();
  t.add(KUGEL(), EISEN, [0, 0.1, 0], [0, 0, 0], [0.42, 0.52, 0.46], { art: "glanz" });                 // Helmkuppel
  t.add(KASTEN(), EISEN_H, [0, -0.05, 0.36], [0.08, 0, 0], [0.5, 0.62, 0.12], { art: "glanz" });       // Gesichtsplatte
  t.add(KEGEL(4), EISEN, [0, -0.5, 0.33], [Math.PI, Math.PI / 4, 0], [0.32, 0.4, 0.2], { art: "glanz" }); // spitzes Kinn
  t.add(KASTEN(), KANTE, [0, 0.27, 0.41], [0.08, 0, 0], [0.54, 0.05, 0.08], { art: "glanz" });          // Stirnrand
  // Wangenklappen
  for (const s of [-1, 1]) t.add(KASTEN(), EISEN, [s * 0.36, -0.12, 0.2], [0, s * 0.45, 0], [0.12, 0.55, 0.4], { art: "glanz" });
  // Die Dornenkrone: ein Halbkreis aus langen schwarzen Dornen, in der Mitte am höchsten
  for (let i = 0; i < 11; i++) {
    const w = -Math.PI * 0.62 + (i / 10) * Math.PI * 1.24;
    const hoehe = 0.55 + Math.cos(w * 0.9) * 0.95;
    const x = Math.sin(w) * 0.42, z = -Math.cos(w) * 0.32 + 0.05;
    stachel(t, [x, 0.55 + hoehe / 2, z], hoehe, 0.07, [-0.2 * Math.cos(w), 0, -Math.sin(w) * 0.35], i % 2 ? EISEN_D : EISEN);
  }
  // Zwei geschwungene Hörner zur Seite
  for (const s of [-1, 1]) for (let j = 0; j < 4; j++) t.add(KEGEL(6), EISEN_D, [s * (0.45 + j * 0.16), 0.32 + j * j * 0.04, -0.05 - j * 0.04], [0, 0, -s * (1.0 - j * 0.25)], [0.12 - j * 0.02, 0.32, 0.12 - j * 0.02], { art: "glanz" });
  t.in(k);
  // Glühendes T-Visier
  const visierMat = new THREE.MeshBasicMaterial({ color: GLUT, toneMapped: false });
  const visier = new THREE.Group();
  const quer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.02), visierMat);
  quer.position.set(0, 0.1, 0.425);
  const laengs = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.02), visierMat);
  laengs.position.set(0, -0.07, 0.425);
  visier.add(quer, laengs);
  k.add(visier);
  const augenSchein = new THREE.Sprite(new THREE.SpriteMaterial({ map: lichtTex(), color: GLUT, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  augenSchein.position.set(0, 0.05, 0.5); augenSchein.scale.set(0.9, 0.5, 1);
  k.add(augenSchein);
  return { k, visierMat, augenSchein };
}

function streitkolbenBauen(eltern) {
  const g = gruppe(eltern, 0, -1.12, 0.12);
  g.rotation.x = 2.25;      // Kopf nach vorn unten: Morgrath hält den Kolben gesenkt vor sich
  const t = new Teile();
  t.add(ZYL(1, 1, 10), EISEN_D, [0, 0.3, 0], [0, 0, 0], [0.07, 3.2, 0.07], { art: "glanz" });          // Stiel
  for (let i = 0; i < 4; i++) t.add(RING(0.3), KANTE, [0, -0.6 + i * 0.25, 0], [Math.PI / 2, 0, 0], [0.09, 0.09, 0.1], { art: "glanz" });
  t.add(KUGEL(), EISEN, [0, 1.95, 0], [0, 0, 0], [0.38, 0.45, 0.38], { art: "glanz" });               // Kopf
  for (let i = 0; i < 7; i++) {
    const w = (i / 7) * Math.PI * 2;
    t.add(KASTEN(), EISEN_H, [Math.cos(w) * 0.32, 1.95, Math.sin(w) * 0.32], [0, -w, 0], [0.32, 0.75, 0.05], { art: "glanz" });   // Flansche
    stachel(t, [Math.cos(w) * 0.55, 1.95, Math.sin(w) * 0.55], 0.3, 0.06, [0, 0, 0], EISEN_D);
  }
  stachel(t, [0, 2.55, 0], 0.55, 0.09, [0, 0, 0]);
  t.add(KEGEL(6), EISEN_D, [0, -1.35, 0], [Math.PI, 0, 0], [0.1, 0.25, 0.1], { art: "glanz" });
  t.in(g);
  // Glühende Runen im Kolbenkopf
  const rune = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), new THREE.MeshBasicMaterial({ color: GLUT, toneMapped: false, transparent: true, opacity: 0.85 }));
  rune.position.y = 1.95; rune.scale.set(1, 1.2, 1);
  g.add(rune);
  return { g, rune };
}

function umhangBauen(eltern) {
  // Mehrere Bahnen vom Rücken bis zum Boden, unten zerrissen. Jede Bahn weht einzeln.
  const g = gruppe(eltern, 0, 1.6, -0.45);
  const bahnen = [];
  const mat = new THREE.MeshStandardMaterial({ color: UMHANG, side: THREE.DoubleSide, roughness: 0.95, flatShading: true });
  const randMat = new THREE.MeshStandardMaterial({ color: UMHANG_D, side: THREE.DoubleSide, roughness: 1, flatShading: true });
  const N = 7;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1) - 0.5;
    const laenge = 3.6 + Math.sin(i * 2.3) * 0.35;
    const geo = new THREE.PlaneGeometry(0.42, laenge, 1, 8);
    geo.translate(0, -laenge / 2, 0);
    // Zerrissene Unterkante: unterste Punkte versetzen
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) if (pos.getY(k) < -laenge + 0.05) pos.setY(k, pos.getY(k) + (k % 2 ? 0.35 : -0.05));
    const m = new THREE.Mesh(geo, i % 2 ? mat : randMat);
    m.position.set(u * 2.2, 0, -Math.abs(u) * 0.35);
    m.rotation.y = u * 0.5;
    m.castShadow = true;
    g.add(m);
    bahnen.push({ m, basisX: 0.12 + Math.abs(u) * 0.1, phase: i * 0.9 });
  }
  return { g, bahnen };
}

export function morgrathBauen() {
  const aussen = new THREE.Group();
  const wurzel = gruppe(aussen);                 // bewegt sich beim Sturz
  const koerper = gruppe(wurzel);
  koerper.scale.setScalar(1.55);
  const beine = [beinBauen(koerper, -1), beinBauen(koerper, 1)];

  const rumpf = gruppe(koerper, 0, 2.35, 0);
  const t = new Teile();
  // Becken und Beinschöße (überlappende Platten)
  t.add(ZYL(0.95, 1.1, 12), EISEN, [0, 0, 0], [0, 0, 0], [0.62, 0.45, 0.5], { art: "glanz" });
  for (let i = 0; i < 9; i++) {
    const w = -Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
    t.add(KASTEN(), i % 2 ? EISEN_H : EISEN, [Math.sin(w) * 0.6, -0.42, Math.cos(w) * 0.5], [0.25, w, 0], [0.38, 0.75, 0.06], { art: "glanz" });
  }
  t.add(ZYL(1, 1, 16), KANTE, [0, 0.22, 0], [0, 0, 0], [0.68, 0.1, 0.55], { art: "glanz" });         // Gürtel
  t.add(KUGEL(), EISEN_H, [0, 0.22, 0.55], [0, 0, 0], [0.15, 0.17, 0.08], { art: "glanz" });         // Schnalle
  // Brustpanzer: breit, gewölbt, mit Bauchschienen
  t.add(KUGEL(), EISEN, [0, 1.05, 0], [0, 0, 0], [0.85, 0.85, 0.58], { art: "glanz" });
  for (let i = 0; i < 4; i++) t.add(ZYL(1, 1, 14), i % 2 ? EISEN_H : EISEN, [0, 0.38 + i * 0.13, 0.02], [0.08, 0, 0], [0.6 - i * 0.02, 0.1, 0.48], { art: "glanz" });
  t.add(KASTEN(), KANTE, [0, 1.15, 0.52], [0.15, 0, 0], [0.06, 0.9, 0.06], { art: "glanz" });        // Brustgrat
  t.add(KUGEL(), EISEN, [0, 1.55, -0.05], [0, 0, 0], [1.05, 0.42, 0.6], { art: "glanz" });          // Schulterpartie
  // Hoher Kragen hinter dem Helm
  for (let i = 0; i < 7; i++) {
    const w = -Math.PI * 0.55 + (i / 6) * Math.PI * 1.1;
    stachel(t, [Math.sin(w) * 0.45, 2.0, -Math.cos(w) * 0.25 - 0.1], 0.8, 0.1, [-0.35 * Math.cos(w), 0, -Math.sin(w) * 0.5], EISEN);
  }
  t.in(rumpf);
  // Der glühende Riss in der Brust
  const glutMat = new THREE.MeshBasicMaterial({ color: GLUT, toneMapped: false });
  const riss = new THREE.Group();
  for (const [x, y, l, w] of [[0, 1.15, 0.5, 0.05], [0.08, 0.95, 0.3, -0.6], [-0.1, 1.3, 0.28, 0.7], [0.12, 1.32, 0.22, -0.9]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, l, 0.02), glutMat);
    m.position.set(x, y, 0.585); m.rotation.z = w;
    riss.add(m);
  }
  rumpf.add(riss);
  const kern = new THREE.Sprite(new THREE.SpriteMaterial({ map: lichtTex(), color: GLUT, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  kern.position.set(0, 1.12, 0.7); kern.scale.setScalar(1.1);
  rumpf.add(kern);

  const schultern = [schulterBauen(rumpf, -1), schulterBauen(rumpf, 1)];
  const arme = [armBauen(rumpf, -1), armBauen(rumpf, 1)];
  const { k: kopf, visierMat, augenSchein } = kopfBauen(rumpf);
  const kolben = streitkolbenBauen(arme[1].unter);
  // Glühender Ring an der linken Hand
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 16), glutMat);
  ring.position.set(0, -1.15, 0.2); ring.rotation.x = Math.PI / 2;
  arme[0].unter.add(ring);
  const umhang = umhangBauen(rumpf);

  // Licht in der Brust: wirft rotes Glühen auf die Umgebung
  const licht = new THREE.PointLight("#ff6a2a", 14, 12, 1.6);
  licht.position.set(0, 4.2, 1.2);
  wurzel.add(licht);

  // Glutfunken und dunkler Rauch
  const funken = [];
  for (let i = 0; i < 28; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: lichtTex(), color: i % 3 ? GLUT : GLUT_H, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.18 + (i % 4) * 0.05);
    s.userData = { w: (i / 28) * Math.PI * 2, r: 1.0 + (i % 5) * 0.35, v: 0.5 + (i % 7) * 0.12, p: i * 0.37 };
    wurzel.add(s); funken.push(s);
  }
  const rauch = [];
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: lichtTex(), color: "#0a0608", transparent: true, opacity: 0.55, depthWrite: false }));
    s.userData = { w: (i / 10) * Math.PI * 2, p: i };
    s.scale.setScalar(2.4);
    wurzel.add(s); rauch.push(s);
  }

  aussen.traverse((m) => { if (m.isMesh && !m.material?.isMeshBasicMaterial) { m.castShadow = true; m.receiveShadow = true; } });

  // Wie weit der Sturz fortgeschritten ist: stehen 0, taumeln (getroffen zurückweichen) 0.3, gefallen 1
  const POSEN = { stehen: 0, taumeln: 0.3, gefallen: 1 };
  let ziel = "stehen", sturz = 0, redet = false;
  return {
    gruppe: aussen,
    kopf,
    pose(name) { ziel = POSEN[name] !== undefined ? name : "stehen"; },
    sofort(name) { ziel = POSEN[name] !== undefined ? name : "stehen"; sturz = POSEN[ziel]; },
    sprechen(an) { redet = Boolean(an); },
    animieren(zeit, _tempo = 0, dt = 0.016) {
      const soll = POSEN[ziel];
      sturz += Math.sign(soll - sturz) * Math.min(Math.abs(soll - sturz), dt / (ziel === "taumeln" ? 2 : 4.5));
      // Sturz: taumeln, nach hinten kippen, in die Lava fallen und versinken
      const tau = Math.min(1, sturz / 0.35), kipp = Math.max(0, (sturz - 0.25) / 0.45), fall = Math.max(0, (sturz - 0.55) / 0.45);
      wurzel.position.set(Math.sin(zeit * 9) * 0.12 * tau * (1 - kipp), -fall * fall * 14, -tau * 1.4 - kipp * 3.5 - fall * 2);
      wurzel.rotation.x = -kipp * 1.35;
      wurzel.visible = sturz < 0.995;
      licht.intensity = (1 - fall) * (12 + Math.sin(zeit * 6) * 3);

      const atem = Math.sin(zeit * 1.1);
      rumpf.scale.set(1 + atem * 0.015, 1 + atem * 0.012, 1 + atem * 0.015);
      rumpf.rotation.x = 0.06 + kipp * 0.3;
      kopf.rotation.y = Math.sin(zeit * 0.35) * 0.2;
      kopf.rotation.x = (redet ? Math.sin(zeit * 7) * 0.05 : 0) - 0.06 + tau * 0.25;
      arme[1].schulter.rotation.x = -0.35 + Math.sin(zeit * 0.8) * 0.08 - tau * 0.9;
      arme[1].unter.rotation.x = -0.6;
      arme[0].schulter.rotation.x = -0.15 + Math.sin(zeit * 0.8 + 1) * 0.06 - tau * 1.2;
      arme[0].schulter.rotation.z = 0.15 + tau * 0.4;
      arme[0].unter.rotation.x = -0.4 - (redet ? 0.4 + Math.sin(zeit * 3) * 0.1 : 0);
      beine[0].rotation.x = tau * 0.3; beine[1].rotation.x = -tau * 0.2;
      kolben.rune.material.opacity = 0.6 + Math.sin(zeit * 3) * 0.3;
      // Glühen pulsiert
      const glut = 0.75 + Math.sin(zeit * 2.3) * 0.2 + Math.sin(zeit * 7.1) * 0.05;
      visierMat.color.setRGB(1, 0.42 * glut + 0.1, 0.1 * glut);
      augenSchein.material.opacity = 0.55 + glut * 0.3;
      kern.material.opacity = 0.5 + glut * 0.4;
      // Umhang weht im heißen Wind
      for (const b of umhang.bahnen) b.m.rotation.x = b.basisX + Math.sin(zeit * 1.4 + b.phase) * 0.12 + Math.sin(zeit * 3.1 + b.phase) * 0.04 + kipp * 0.6;
      // Funken steigen auf, Rauch kriecht um die Füße
      for (const s of funken) {
        const u = s.userData, h = (zeit * u.v + u.p) % 1;
        s.position.set(Math.cos(u.w + zeit * 0.3) * u.r, 0.3 + h * 7.5, Math.sin(u.w + zeit * 0.3) * u.r * 0.7);
        s.material.opacity = (1 - h) * 0.85 * (1 - fall);
      }
      for (const s of rauch) {
        const u = s.userData;
        s.position.set(Math.cos(u.w + zeit * 0.15) * 1.6, 0.6 + Math.sin(zeit * 0.5 + u.p) * 0.3, Math.sin(u.w + zeit * 0.15) * 1.3);
        s.material.opacity = 0.45 * (1 - fall);
      }
    },
  };
}
