// Kleine 3D-Vorschau der eigenen Spielfigur (im Aussehen-Editor).
// Die Figur dreht sich langsam; mit Maus oder Finger kann man sie selbst drehen.
// Es gibt nur einen Renderer für alle Vorschauen, damit keine WebGL-Kontexte liegen bleiben.

import * as THREE from "../../vendor/three.module.min.js";
import { figurBauen } from "./figuren.js";

let renderer = null, szene = null, kamera = null, figur = null;
let laeuft = false, winkel = 0.5, ziehen = null, ruheBis = 0, weg = 0;
const uhr = new THREE.Clock();

function einrichten() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  szene = new THREE.Scene();
  const sonne = new THREE.DirectionalLight("#fff0d6", 2.4);
  sonne.position.set(2, 4, 3);
  szene.add(sonne);
  const gegen = new THREE.DirectionalLight("#bcd4ff", 0.9);
  gegen.position.set(-3, 2, -2);
  szene.add(gegen);
  szene.add(new THREE.HemisphereLight("#cfe6ff", "#7a6a50", 1.2));
  kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  const c = renderer.domElement;
  c.className = "aussehen-figur";
  c.setAttribute("aria-label", "Deine Spielfigur (zum Drehen ziehen)");
  c.style.touchAction = "none";
  c.addEventListener("pointerdown", (ev) => { ziehen = ev.clientX; c.setPointerCapture(ev.pointerId); });
  c.addEventListener("pointermove", (ev) => {
    if (ziehen === null) return;
    winkel += (ev.clientX - ziehen) * 0.02;
    ziehen = ev.clientX;
    ruheBis = performance.now() + 2500;
  });
  const los = () => { ziehen = null; };
  c.addEventListener("pointerup", los);
  c.addEventListener("pointercancel", los);
}

function bild() {
  const c = renderer.domElement;
  // Nicht (mehr) auf der Seite: noch kurz warten (das Fenster baut sich gerade auf), dann anhalten
  if (!c.isConnected) {
    if (++weg > 90) { laeuft = false; return; }
    requestAnimationFrame(bild);
    return;
  }
  weg = 0;
  const dt = Math.min(0.05, uhr.getDelta());
  // Größe an die Anzeige anpassen (CSS bestimmt sie, z. B. kleiner auf dem Handy)
  const b = c.clientWidth, h = c.clientHeight;
  if (b && h && (c.width !== Math.round(b * renderer.getPixelRatio()) || c.height !== Math.round(h * renderer.getPixelRatio()))) {
    renderer.setSize(b, h, false);
    kamera.aspect = b / h;
    kamera.updateProjectionMatrix();
  }
  if (ziehen === null && performance.now() > ruheBis) winkel += dt * 0.6;
  if (figur) {
    figur.gruppe.rotation.y = winkel;
    figur.animieren(uhr.elapsedTime, 0, dt);
  }
  renderer.render(szene, kamera);
  requestAnimationFrame(bild);
}

/** Liefert das Canvas der Vorschau (oder null, wenn kein WebGL geht). */
export function vorschauElement() {
  try { einrichten(); } catch { return null; }
  return renderer.domElement;
}

/** Zeigt die Figur mit diesem Aussehen (d wie AUSSEHEN, portrait wie PORTRAITS). */
export function vorschauSetzen(d, schluessel, portrait) {
  if (!renderer) return;
  if (figur) szene.remove(figur.gruppe);
  figur = figurBauen(d, schluessel, portrait);
  szene.add(figur.gruppe);
  // Kamera so setzen, dass die ganze Figur (auch mit Hut) ins Bild passt
  figur.gruppe.rotation.y = 0;
  const box = new THREE.Box3().setFromObject(figur.gruppe);
  const hoehe = box.max.y - box.min.y, mitte = (box.max.y + box.min.y) / 2;
  const abstand = (hoehe * 0.57) / Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
  kamera.position.set(0, mitte + hoehe * 0.06, abstand);
  kamera.lookAt(0, mitte, 0);
  figur.gruppe.rotation.y = winkel;
  weg = 0;
  if (!laeuft) { laeuft = true; uhr.getDelta(); requestAnimationFrame(bild); }
}
