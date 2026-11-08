// Eine Kartenszene: Zeichnet das Raster, die Figuren und Objekte,
// steuert die Heldin/den Helden und startet Interaktionen.

import { KACHEL, KACHELN, BLOCKIEREND } from "../grafik.js";
import { KARTEN } from "../welt/karten.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, ortSetzen } from "../zustand.js";
import { istOffen, schliessen, hinweis, toast, beimSchliessen } from "../ui/fenster.js";
import { hudSperreSetzen } from "../ui/hud.js";
import { musik } from "../musik.js";

const TEMPO = 72;
const REICHWEITE = 14; // Pixel Abstand für Interaktionen

export class KartenSzene extends Phaser.Scene {
  constructor() {
    super("karte");
  }

  init(daten) {
    this.kartenId = daten?.karte ?? zustand.ort.karte ?? "dorf";
    this.spawnId = daten?.spawn ?? zustand.ort.spawn ?? "start";
    this.beschaeftigt = false;
    this.reiseZiel = null;
    this.sperreBis = 0;
  }

  create() {
    // Karten nur für die 3D-Version (z. B. die Kammern der Stimmen): zurück in die Halle
    if (KARTEN[this.kartenId]?.nur3d) { this.kartenId = "halle"; this.spawnId = "vonTurm"; }
    const def = KARTEN[this.kartenId] ?? KARTEN.dorf;
    this.def = def;
    ortSetzen(def.id, this.spawnId);
    musik(def.musik ?? null);

    // Kacheln
    const daten = def.raster.map((zeile) => [...zeile].map((z) => KACHELN[z] ?? 0));
    const karte = this.make.tilemap({ data: daten, tileWidth: KACHEL, tileHeight: KACHEL });
    const satz = karte.addTilesetImage("kacheln", "kacheln", KACHEL, KACHEL, 0, 0);
    this.ebene = karte.createLayer(0, satz, 0, 0);
    this.ebene.setCollision(BLOCKIEREND);
    const breite = karte.widthInPixels;
    const hoehe = karte.heightInPixels;
    this.physics.world.setBounds(0, 0, breite, hoehe);

    // Objekte
    this.feste = this.physics.add.staticGroup();
    this.objekte = def.objekte.map((o) => this.objektErzeugen(o));

    // Spielfigur
    const [sx, sy] = def.spawns[this.spawnId] ?? def.spawns.start;
    this.spieler = this.physics.add.sprite(sx * KACHEL + 8, sy * KACHEL + 8, this.heldTextur(), 0);
    this.spieler.body.setSize(10, 6).setOffset(3, 10);
    this.spieler.setCollideWorldBounds(true);
    this.physics.add.collider(this.spieler, this.ebene);
    this.physics.add.collider(this.spieler, this.feste);

    // Kamera
    const kamera = this.cameras.main;
    kamera.setBounds(0, 0, breite, hoehe);
    kamera.startFollow(this.spieler, true, 0.15, 0.15);
    kamera.setRoundPixels(true);
    kamera.fadeIn(300);

    // Tastatur (ohne „Capture“, damit Textfelder normal funktionieren)
    this.input.keyboard.clearCaptures();
    this.tasten = this.input.keyboard.addKeys({
      hoch: "UP", runter: "DOWN", links: "LEFT", rechts: "RIGHT",
      w: "W", a: "A", s: "S", d: "D",
    }, false);

    // Interaktion per Tastenereignis (zuverlässig auch bei sehr kurzem Antippen)
    const ausloesen = (ev) => {
      if (ev.repeat || this.beschaeftigt || istOffen() || this.time.now <= this.sperreBis) return;
      const obj = this.naechstesObjekt();
      if (obj) this.interagieren(obj);
    };
    this.input.keyboard.on("keydown-E", ausloesen);
    this.input.keyboard.on("keydown-SPACE", ausloesen);

    if (!this.hoererAngemeldet) {
      this.hoererAngemeldet = true;
      beimSchliessen(() => {
        this.input?.keyboard?.resetKeys();
        this.sperreBis = this.time.now + 200;
      });
      hudSperreSetzen(() => this.beschaeftigt);
    }

    this.aktualisieren();
    toast(`📍 ${def.name}`);

    // Für Tests und zum Ausprobieren in der Browser-Konsole
    window.eldoria = { ...(window.eldoria ?? {}), szene: this, zustand };
  }

  heldTextur() {
    return zustand.held ? (KLASSEN[zustand.held.klasse]?.textur ?? "held_neu") : "held_neu";
  }

  objektErzeugen(o) {
    const b = o.breite ?? 1;
    const h = o.hoehe ?? 1;
    const x = o.x * KACHEL + (b * KACHEL) / 2;
    const y = o.y * KACHEL + (h * KACHEL) / 2;
    const textur = o.art === "tor" ? "tor_zu" : o.art === "portal" ? "portal_aus" : o.bild;
    const fest = o.art !== "portal";
    const sprite = fest ? this.feste.create(x, y, textur, o.art === "npc" && !o.hoehe ? 0 : undefined) : this.add.sprite(x, y, textur);
    sprite.setDepth(o.art === "portal" ? 1 : y);
    if (o.art === "npc" && this.anims.exists(`${o.bild}_stehen`)) sprite.play(`${o.bild}_stehen`);
    const marker = this.add.image(x, y - (h * KACHEL) / 2 - 7, "marker").setDepth(10000).setVisible(false);
    this.tweens.add({ targets: marker, y: marker.y - 3, duration: 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    return { def: o, sprite, marker, rechteck: new Phaser.Geom.Rectangle(o.x * KACHEL, o.y * KACHEL, b * KACHEL, h * KACHEL) };
  }

  /** Passt alle Objekte an den Spielstand an (Tore offen, Marker, Sichtbarkeit …). */
  aktualisieren() {
    for (const obj of this.objekte) {
      const { def, sprite, marker } = obj;
      const sichtbar = def.sichtbar ? def.sichtbar(zustand) : true;
      let aktiv = sichtbar;
      if (def.art === "tor") {
        const offen = def.offen(zustand);
        sprite.setTexture(offen ? "tor_offen" : "tor_zu");
        aktiv = !offen;
      }
      if (def.art === "portal") sprite.setTexture(def.aktiv(zustand) ? "portal_an" : "portal_aus");
      sprite.setVisible(sichtbar);
      if (sprite.body) sprite.body.enable = aktiv;
      obj.interaktiv = Boolean(def.aktion) && aktiv;
      marker.setVisible(obj.interaktiv && Boolean(def.marker?.(zustand)));
    }
    const textur = this.heldTextur();
    if (this.spieler.texture.key !== textur) {
      this.spieler.setTexture(textur, 0);
      this.spieler.anims.stop();
    }
  }

  naechstesObjekt() {
    const fuss = new Phaser.Geom.Point(this.spieler.x, this.spieler.y + 5);
    let bestes = null;
    let abstand = Infinity;
    for (const obj of this.objekte) {
      if (!obj.interaktiv) continue;
      const r = obj.rechteck;
      const dx = Math.max(r.x - fuss.x, 0, fuss.x - r.right);
      const dy = Math.max(r.y - fuss.y, 0, fuss.y - r.bottom);
      const d = Math.hypot(dx, dy);
      if (d < REICHWEITE && d < abstand) { bestes = obj; abstand = d; }
    }
    return bestes;
  }

  async interagieren(obj) {
    this.beschaeftigt = true;
    hinweis(null);
    this.spieler.setVelocity(0, 0);
    this.spieler.anims.stop();
    const welt = {
      aktualisieren: () => this.aktualisieren(),
      reisen: (karte, spawn) => { this.reiseZiel = { karte, spawn }; },
      erschuettern: () => this.cameras.main.shake(250, 0.006),
    };
    try {
      await obj.def.aktion(welt);
    } catch (fehler) {
      console.error(fehler);
      toast("Hoppla, da ist etwas schiefgelaufen.");
    }
    this.beschaeftigt = false;
    schliessen();
    this.aktualisieren();
    if (this.reiseZiel) {
      const ziel = this.reiseZiel;
      this.beschaeftigt = true;
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.restart(ziel));
    }
  }

  update() {
    const s = this.spieler;
    if (this.beschaeftigt || istOffen()) {
      s.setVelocity(0, 0);
      s.anims.stop();
      return;
    }
    const t = this.tasten;
    let vx = 0;
    let vy = 0;
    if (t.links.isDown || t.a.isDown) vx -= 1;
    if (t.rechts.isDown || t.d.isDown) vx += 1;
    if (t.hoch.isDown || t.w.isDown) vy -= 1;
    if (t.runter.isDown || t.s.isDown) vy += 1;
    const laenge = Math.hypot(vx, vy) || 1;
    s.setVelocity((vx / laenge) * TEMPO, (vy / laenge) * TEMPO);
    if (vx) s.setFlipX(vx < 0);
    if (vx || vy) s.anims.play(`${s.texture.key}_laufen`, true);
    else { s.anims.stop(); s.setFrame(0); }
    s.setDepth(s.y);

    const obj = this.naechstesObjekt();
    if (obj) hinweis("E", obj.def.hinweis ?? `Mit ${obj.def.name} sprechen`);
    else hinweis(null);
  }
}
