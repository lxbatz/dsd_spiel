// Mimi, die Katze von Händlerin Wilma (nur in der 3D-Version).
// Sie sitzt gern am Markt, streift umher, weicht schnellen Schritten aus
// und schnurrt, wenn man sie streichelt.

import * as THREE from "../../vendor/three.module.min.js";
import { Teile, KUGEL, KUGEL_K, KAPSEL, KEGEL, RING, gruppe } from "./figuren.js";

const FELL = "#e8a050", FELL_HELL = "#f8e0c0", FELL_DUNKEL = "#b86a2a";

export function katzeBauen() {
  const wurzel = new THREE.Group();
  const t = new Teile();
  const koerper = gruppe(wurzel, 0, 0, 0);
  // Rumpf mit Streifen
  t.add(KUGEL(), FELL, [0, 0.24, 0], [0, 0, 0], [0.13, 0.13, 0.24]);
  t.add(KUGEL(), FELL_HELL, [0, 0.2, 0.06], [0, 0, 0], [0.1, 0.1, 0.17]);
  for (let i = 0; i < 4; i++) t.add(RING(0.12, Math.PI), FELL_DUNKEL, [0, 0.25, -0.12 + i * 0.07], [0, Math.PI / 2, 0], [0.132, 0.132, 0.2]);
  t.in(koerper);
  // Kopf
  const kopf = gruppe(koerper, 0, 0.36, 0.2);
  t.add(KUGEL(), FELL, [0, 0, 0], [0, 0, 0], [0.11, 0.1, 0.1]);
  t.add(KUGEL_K(), FELL_HELL, [0, -0.03, 0.07], [0, 0, 0], [0.06, 0.045, 0.045]);
  t.add(KUGEL_K(), "#f08a9a", [0, -0.005, 0.1], [0, 0, 0], [0.014, 0.01, 0.01]);
  for (const s of [-1, 1]) {
    t.add(KEGEL(8), FELL, [s * 0.065, 0.09, -0.01], [0, 0, s * -0.35], [0.04, 0.08, 0.03]);
    t.add(KEGEL(8), "#f0a0a8", [s * 0.063, 0.085, 0.005], [0, 0, s * -0.35], [0.022, 0.05, 0.01]);
    t.add(KUGEL_K(), "#9ad84a", [s * 0.045, 0.02, 0.085], [0, 0, 0], [0.022, 0.026, 0.012]);
    t.add(KUGEL_K(), "#101010", [s * 0.045, 0.02, 0.094], [0, 0, 0], [0.007, 0.02, 0.006]);
    t.add(KUGEL_K(), "#ffffff", [s * 0.04, 0.03, 0.096], [0, 0, 0], 0.004, { art: "leucht" });
    for (const w of [-0.25, 0, 0.25]) t.add(KAPSEL(), "#f8f4ee", [s * 0.08, -0.02 + w * 0.04, 0.08], [0, 0, Math.PI / 2 + w * s], [0.003, 0.05, 0.003]);
  }
  t.in(kopf);
  // Beine
  const beine = [];
  for (const [x, z] of [[-0.07, 0.14], [0.07, 0.14], [-0.07, -0.14], [0.07, -0.14]]) {
    const b = gruppe(koerper, x, 0.2, z);
    t.add(KAPSEL(), FELL, [0, -0.09, 0], [0, 0, 0], [0.035, 0.12, 0.035]);
    t.add(KUGEL_K(), FELL_HELL, [0, -0.18, 0.01], [0, 0, 0], [0.04, 0.025, 0.05]);
    t.in(b);
    beine.push(b);
  }
  // Schwanz aus Gliedern
  const schwanz = [];
  let eltern = koerper, pos = [0, 0.3, -0.22];
  for (let i = 0; i < 6; i++) {
    const s = gruppe(eltern, ...pos);
    t.add(KUGEL_K(), i === 5 ? FELL_HELL : i % 2 ? FELL_DUNKEL : FELL, [0, 0.04, 0], [0, 0, 0], [0.032 - i * 0.002, 0.05, 0.032 - i * 0.002]);
    t.in(s);
    schwanz.push(s);
    eltern = s;
    pos = [0, 0.07, 0];
  }
  wurzel.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  let phase = 0;
  const animieren = (zeit, tempo, dt, sitzt) => {
    if (tempo > 0.05) {
      phase += dt * 14 * Math.min(2, tempo);
      beine.forEach((b, i) => { b.rotation.x = Math.sin(phase + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.6; });
      koerper.position.y = Math.abs(Math.sin(phase)) * 0.02;
      koerper.rotation.x = 0;
      schwanz.forEach((s, i) => { s.rotation.x = -0.25 - i * 0.05; s.rotation.z = Math.sin(zeit * 6 - i) * 0.12; });
    } else {
      beine.forEach((b) => { b.rotation.x *= 0.85; });
      // Sitzen: hinten absenken
      const ziel = sitzt ? -0.32 : 0;
      koerper.rotation.x += (ziel - koerper.rotation.x) * Math.min(1, dt * 5);
      koerper.position.y += ((sitzt ? 0.05 : 0) - koerper.position.y) * Math.min(1, dt * 5);
      beine[2].rotation.x += ((sitzt ? -1.1 : 0) - beine[2].rotation.x) * Math.min(1, dt * 5);
      beine[3].rotation.x += ((sitzt ? -1.1 : 0) - beine[3].rotation.x) * Math.min(1, dt * 5);
      schwanz.forEach((s, i) => { s.rotation.x = sitzt ? 0.25 + i * 0.08 : -0.3; s.rotation.z = Math.sin(zeit * 2.2 - i * 0.7) * 0.22; });
      kopf.rotation.y = Math.sin(zeit * 0.6) * 0.4;
      kopf.rotation.x = sitzt ? 0.3 : 0;
    }
  };
  return { gruppe: wurzel, animieren, kopf };
}

/**
 * Verhalten der Katze. bereich: { x0, z0, x1, z1 } (Welt), frei(x, z): ob dort Platz ist.
 */
export function katzeVerhalten(katze, bereich, frei) {
  const pos = katze.gruppe.position;
  const ziel = new THREE.Vector3(pos.x, 0, pos.z);
  let modus = "sitzen", timer = 3, tempo = 0, ausweichen = 0, letzte = pos.clone(), stillstand = 0;
  const neuesZiel = (weg = null) => {
    for (let i = 0; i < 20; i++) {
      let x = bereich.x0 + Math.random() * (bereich.x1 - bereich.x0);
      let z = bereich.z0 + Math.random() * (bereich.z1 - bereich.z0);
      if (weg) {
        const d = new THREE.Vector3(pos.x - weg.x, 0, pos.z - weg.z).normalize();
        x = pos.x + d.x * 3 + (Math.random() - 0.5) * 2; z = pos.z + d.z * 3 + (Math.random() - 0.5) * 2;
      }
      if (frei(x, z) && x > bereich.x0 && x < bereich.x1 && z > bereich.z0 && z < bereich.z1) { ziel.set(x, 0, z); return true; }
    }
    return false;
  };
  return {
    gestreichelt() { modus = "sitzen"; timer = 6; tempo = 0; },
    update(zeit, dt, spieler, spielerTempo) {
      const dx = spieler.x - pos.x, dz = spieler.z - pos.z;
      const abstand = Math.hypot(dx, dz);
      ausweichen -= dt;
      // Wer schnell auf Mimi zurennt, erschreckt sie
      if (abstand < 1.4 && spielerTempo > 0.85 && ausweichen <= 0 && modus !== "laufen") {
        if (neuesZiel(spieler)) { modus = "laufen"; ausweichen = 2.5; }
      }
      timer -= dt;
      if (modus === "sitzen" && timer <= 0) {
        if (neuesZiel()) modus = "laufen"; else timer = 2;
      }
      let soll = 0;
      if (modus === "laufen") {
        const vx = ziel.x - pos.x, vz = ziel.z - pos.z;
        const d = Math.hypot(vx, vz);
        if (d < 0.15) { modus = "sitzen"; timer = 4 + Math.random() * 6; }
        else {
          soll = ausweichen > 0 ? 3.2 : 1.1;
          const nx = pos.x + (vx / d) * tempo * dt, nz = pos.z + (vz / d) * tempo * dt;
          if (frei(nx, nz)) { pos.x = nx; pos.z = nz; }
          else { modus = "sitzen"; timer = 1; }
          const winkel = Math.atan2(vx, vz);
          const diff = ((winkel - katze.gruppe.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          katze.gruppe.rotation.y += diff * Math.min(1, dt * 8);
        }
        // Festgefahren? Dann neu planen.
        stillstand = pos.distanceTo(letzte) < 0.01 ? stillstand + dt : 0;
        letzte.copy(pos);
        if (stillstand > 1.2) { modus = "sitzen"; timer = 1; stillstand = 0; }
      } else if (abstand < 3) {
        // Sitzend schaut sie zur Spielfigur
        const winkel = Math.atan2(dx, dz);
        const diff = ((winkel - katze.gruppe.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        katze.gruppe.rotation.y += diff * Math.min(1, dt * 2);
      }
      tempo += (soll - tempo) * Math.min(1, dt * 6);
      katze.animieren(zeit, tempo, dt, modus === "sitzen");
    },
  };
}
