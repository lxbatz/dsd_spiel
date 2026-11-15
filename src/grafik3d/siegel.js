// Das Sprachsiegel von Eldoria: ein goldener Ring mit vier farbigen Vierteln
// (Hören blau, Lesen grün, Schreiben gold, Sprechen rot). Wird im Intro und im Finale benutzt.

import * as THREE from "../../vendor/three.module.min.js";
import { textur, lichtTextur } from "./texturen.js";

export const SIEGEL_FARBEN = ["#5ab0ff", "#5ae07a", "#ffd04a", "#ff6a5a"];

let _licht = null;
const lichtTex = () => (_licht ??= textur(lichtTextur("rgba(255,255,255,1)")));

/** Liefert { gruppe, rand, viertel: [4 Meshes], mitte, schein }. Die Scheibe zeigt nach +z. */
export function siegelBauen() {
  const gruppe = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: "#e8b440", emissive: "#8a5a08", emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.35 });
  const rand = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.1, 10, 40), gold);
  gruppe.add(rand);
  const viertel = SIEGEL_FARBEN.map((f, i) => {
    const geo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16, 1, false, i * Math.PI / 2 + 0.04, Math.PI / 2 - 0.08).rotateX(Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(f).multiplyScalar(0.85) }));
    gruppe.add(m);
    return m;
  });
  const mitte = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6d8", emissiveIntensity: 1.2 }));
  mitte.position.z = 0.08;
  gruppe.add(mitte);
  // Ein sanfter Schein hinter dem Siegel (davor würde er die vier Farben überstrahlen)
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: lichtTex(), color: "#ffd890", transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  schein.scale.setScalar(4);
  schein.position.z = -0.4;
  schein.renderOrder = -1;
  gruppe.add(schein);
  return { gruppe, rand, viertel, mitte, schein };
}

/** Mittelpunkt eines Viertels (für das Zerbrechen): Richtung vom Zentrum aus */
export function viertelRichtung(i) {
  const a = i * Math.PI / 2 + Math.PI / 4;
  // Der Zylinder wurde um x gedreht: aus (sin, cos) in der xz-Ebene wird (sin, -cos) in der xy-Ebene
  return new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
}
