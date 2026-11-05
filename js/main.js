// Grundgerüst: Spielschleife mit einer Figur in Pixel-Optik.
// Story, Aufgaben und Dialoge kommen später dazu.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 8;
const keys = new Set();

const hero = { x: 88, y: 56, speed: 1.2 };

window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function update() {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  hero.x = Math.max(0, Math.min(canvas.width - TILE, hero.x + dx * hero.speed));
  hero.y = Math.max(0, Math.min(canvas.height - TILE, hero.y + dy * hero.speed));
}

function drawGrass() {
  for (let y = 0; y < canvas.height; y += TILE) {
    for (let x = 0; x < canvas.width; x += TILE) {
      ctx.fillStyle = (x / TILE + y / TILE) % 2 === 0 ? "#2b3050" : "#303659";
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
}

function drawHero() {
  const x = Math.round(hero.x);
  const y = Math.round(hero.y);
  ctx.fillStyle = "#f2c572"; // Haut
  ctx.fillRect(x + 2, y, 4, 3);
  ctx.fillStyle = "#4a7bd8"; // Kleidung
  ctx.fillRect(x + 1, y + 3, 6, 3);
  ctx.fillStyle = "#3b2f5c"; // Beine
  ctx.fillRect(x + 2, y + 6, 4, 2);
}

function frame() {
  update();
  drawGrass();
  drawHero();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
