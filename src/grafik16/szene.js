// Phaser-Szenen der 16-Bit-Version.

import { KARTEN } from "../welt/karten.js";
import { KLASSEN } from "../inhalte/klassen.js";
import { zustand, ortSetzen } from "../zustand.js";
import { istOffen, schliessen, hinweis, toast, beimSchliessen } from "../ui/fenster.js";
import { hudSperreSetzen } from "../ui/hud.js";
import { bildSetzen } from "../ui/bilder.js";
import { musik } from "../musik.js";
import { AUSSEHEN, figurBlatt, torwaechterBild, SPRITE_B, SPRITE_H, RICHTUNGEN, BILDER_PRO_RICHTUNG } from "./figuren.js";
import { PORTRAITS, portraitBild } from "./portraits.js";
import { K, bodenMalen, objektBilder, haeuserFinden, hausBild, DACH_UEBERSTAND, lichtschein } from "./welt.js";

const TEMPO = 70;
const REICHWEITE = 14;
const BLOCKIEREND = new Set(["T", "~", "H", "R", "d", "f", "#", "B", "c"]);

function texturAusBild(szene, schluessel, bild) {
  if (szene.textures.exists(schluessel)) szene.textures.remove(schluessel);
  szene.textures.addCanvas(schluessel, bild.alsCanvas(1));
}

// ---------- Laden ----------

export class Boot16 extends Phaser.Scene {
  constructor() { super("boot16"); }

  create() {
    // Figuren als Spritesheets
    for (const [schluessel, d] of Object.entries(AUSSEHEN)) {
      const tex = this.textures.addCanvas(`${schluessel}_16`, figurBlatt(d).alsCanvas(1));
      for (let zeile = 0; zeile < RICHTUNGEN.length; zeile++) {
        for (let n = 0; n < BILDER_PRO_RICHTUNG; n++) tex.add(zeile * BILDER_PRO_RICHTUNG + n, 0, n * SPRITE_B, zeile * SPRITE_H, SPRITE_B, SPRITE_H);
      }
      RICHTUNGEN.forEach((r, zeile) => {
        const f = (n) => ({ key: `${schluessel}_16`, frame: zeile * BILDER_PRO_RICHTUNG + n });
        this.anims.create({ key: `${schluessel}_${r}_laufen`, frames: [f(1), f(0), f(2), f(0)], frameRate: 8, repeat: -1 });
        this.anims.create({ key: `${schluessel}_${r}_stehen`, frames: [f(0), f(0), f(0), f(3), f(3)], frameRate: 3, repeat: -1 });
      });
    }
    texturAusBild(this, "boss16_0", torwaechterBild(0));
    texturAusBild(this, "boss16_1", torwaechterBild(1));
    this.anims.create({ key: "boss16", frames: [{ key: "boss16_0" }, { key: "boss16_1" }], frameRate: 1.5, repeat: -1 });

    // Objekte
    for (const [schluessel, bild] of Object.entries(objektBilder())) texturAusBild(this, `${schluessel}_16`, bild);
    const anim = (key, teile, rate) => this.anims.create({ key, frames: teile.map((t) => ({ key: `${t}_16` })), frameRate: rate, repeat: -1 });
    anim("kerze16", ["kerze_0", "kerze_1"], 5);
    anim("tor16", ["tor_zu_0", "tor_zu_1"], 1.5);
    anim("portal16", ["portal_an_0", "portal_an_1", "portal_an_2"], 6);
    anim("funkeln16", ["funkeln_0", "funkeln_1", "funkeln_2", "funkeln_1", "funkeln_0"], 8);
    anim("falter16", ["falter_0", "falter_1"], 8);
    this.textures.addCanvas("licht_warm", lichtschein(64, "rgba(255,190,90,0.55)"));
    this.textures.addCanvas("licht_blau", lichtschein(64, "rgba(120,200,255,0.5)"));
    this.textures.addCanvas("pixel", (() => { const c = document.createElement("canvas"); c.width = c.height = 1; return c; })());

    // Porträts für Dialoge, Heldenpass, Kopfleiste
    for (const schluessel of Object.keys(PORTRAITS)) bildSetzen(schluessel, portraitBild(schluessel).alsCanvas(1).toDataURL());

    this.game.events.emit("bereit");
  }
}

// ---------- Karte ----------

export class Karte16 extends Phaser.Scene {
  constructor() { super("karte16"); }

  init(daten) {
    this.kartenId = daten?.karte ?? zustand.ort.karte ?? "dorf";
    this.spawnId = daten?.spawn ?? zustand.ort.spawn ?? "start";
    this.beschaeftigt = false;
    this.reiseZiel = null;
    this.sperreBis = 0;
    this.richtung = "unten";
  }

  create() {
    // Karten nur für die 3D-Version (z. B. die Kammern der Stimmen): zurück in die Halle
    if (KARTEN[this.kartenId]?.nur3d) { this.kartenId = "halle"; this.spawnId = "vonTurm"; }
    const def = KARTEN[this.kartenId] ?? KARTEN.dorf;
    this.def = def;
    ortSetzen(def.id, this.spawnId);
    musik(def.musik ?? null);
    const raster = def.raster;
    const breite = raster[0].length * K, hoehe = raster.length * K;
    this.drinnen = raster.some((z) => z.includes("#"));

    // Boden (einmal pro Karte gemalt)
    const bodenKey = `boden16_${def.id}`;
    if (!this.textures.exists(bodenKey)) this.textures.addCanvas(bodenKey, bodenMalen(raster).alsCanvas(1));
    this.add.image(0, 0, bodenKey).setOrigin(0, 0).setDepth(-10);

    // Kollision über ein unsichtbares Raster
    this.feste = this.physics.add.staticGroup();
    raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
      if (!BLOCKIEREND.has(z)) return;
      const zone = this.add.zone(tx * K + K / 2, ty * K + K / 2, K, K);
      this.physics.add.existing(zone, true);
      this.feste.add(zone);
    }));
    this.physics.world.setBounds(0, 0, breite, hoehe);

    // Kulisse: Häuser, Bäume, Zäune, Regale, Kerzen, Wasserfunkeln
    for (const haus of haeuserFinden(raster)) {
      const key = `haus16_${def.id}_${haus.x}_${haus.y}`;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, hausBild(haus).alsCanvas(1));
      this.add.image(haus.x * K, haus.y * K - DACH_UEBERSTAND, key).setOrigin(0, 0).setDepth((haus.y + haus.h) * K);
      if (haus.art === "schmiede") this.rauch((haus.x + haus.w) * K - 18, haus.y * K - DACH_UEBERSTAND + 2);
    }
    raster.forEach((zeile, ty) => [...zeile].forEach((z, tx) => {
      const x = tx * K + K / 2, y = (ty + 1) * K;
      if (z === "T") this.add.image(x + 1, y + 2, `baum_${(tx * 7 + ty * 3) % 3}_16`).setOrigin(0.5, 1).setDepth(y);
      if (z === "f") this.add.image(x, y, "zaun_16").setOrigin(0.5, 1).setDepth(y);
      if (z === "B") this.add.image(x, y, "regal_16").setOrigin(0.5, 1).setDepth(y);
      if (z === "c") {
        this.add.sprite(x, y, "kerze_0_16").setOrigin(0.5, 1).setDepth(y).play({ key: "kerze16", startFrame: (tx + ty) % 2 });
        const licht = this.add.image(x, y - 22, "licht_warm").setDepth(9000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.3);
        this.tweens.add({ targets: licht, alpha: 0.75, scale: 1.2, duration: 400 + (tx * 37) % 300, yoyo: true, repeat: -1 });
      }
      if (z === "~" && (tx * 5 + ty * 3) % 4 === 0) {
        const f = this.add.sprite(x + (tx % 3) * 3 - 3, y - 8, "funkeln_0_16").setDepth(-5);
        this.time.delayedCall((tx * 211 + ty * 97) % 2000, () => f.play("funkeln16"));
        f.on("animationrepeat", () => f.setPosition(tx * K + 3 + Math.random() * 10, ty * K + 3 + Math.random() * 10));
      }
    }));
    if (!this.drinnen) this.falter(breite, hoehe);

    // Objekte aus der Kartendefinition
    this.objekte = def.objekte.map((o) => this.objektErzeugen(o));

    // Spielfigur
    const [sx, sy] = def.spawns[this.spawnId] ?? def.spawns.start;
    this.spieler = this.physics.add.sprite(sx * K + K / 2, (sy + 1) * K - 2, `${this.heldSchluessel()}_16`, 0).setOrigin(0.5, 1);
    this.spieler.body.setSize(10, 6).setOffset(3, 17);
    this.spieler.setCollideWorldBounds(true);
    this.physics.add.collider(this.spieler, this.feste);

    // Dunkelheit in der Halle
    if (this.drinnen) {
      this.add.rectangle(0, 0, breite, hoehe, 0x140c28, 0.32).setOrigin(0, 0).setDepth(8999);
    }

    const kamera = this.cameras.main;
    kamera.setBounds(0, 0, breite, hoehe);
    kamera.startFollow(this.spieler, true, 0.12, 0.12);
    kamera.setRoundPixels(true);
    kamera.fadeIn(350);

    this.input.keyboard.clearCaptures();
    this.tasten = this.input.keyboard.addKeys({
      hoch: "UP", runter: "DOWN", links: "LEFT", rechts: "RIGHT", w: "W", a: "A", s: "S", d: "D",
    }, false);
    const ausloesen = (ev) => {
      if (ev.repeat || this.beschaeftigt || istOffen() || this.time.now <= this.sperreBis) return;
      const obj = this.naechstesObjekt();
      if (obj) this.interagieren(obj);
    };
    this.input.keyboard.on("keydown-E", ausloesen);
    this.input.keyboard.on("keydown-SPACE", ausloesen);

    if (!this.hoererAngemeldet) {
      this.hoererAngemeldet = true;
      beimSchliessen(() => { this.input?.keyboard?.resetKeys(); this.sperreBis = this.time.now + 200; });
      hudSperreSetzen(() => this.beschaeftigt);
    }

    this.aktualisieren();
    toast(`📍 ${def.name}`);
    window.eldoria = { ...(window.eldoria ?? {}), szene: this, zustand };
  }

  heldSchluessel() {
    return zustand.held ? (KLASSEN[zustand.held.klasse]?.textur ?? "held_neu") : "held_neu";
  }

  objektErzeugen(o) {
    const b = o.breite ?? 1, h = o.hoehe ?? 1;
    const x = o.x * K + (b * K) / 2, unten = (o.y + h) * K;
    let sprite;
    if (o.art === "npc" && o.bild === "boss_torwaechter") {
      sprite = this.add.sprite(x, unten + 2, "boss16_0").setOrigin(0.5, 1).play("boss16");
    } else if (o.art === "npc") {
      sprite = this.add.sprite(x, unten - 1, `${o.bild}_16`, 0).setOrigin(0.5, 1);
      sprite.play({ key: `${o.bild}_unten_stehen`, startFrame: (o.x + o.y) % 4 });
    } else if (o.art === "tor") {
      sprite = this.add.sprite(x, unten, "tor_zu_0_16").setOrigin(0.5, 1);
    } else if (o.art === "portal") {
      sprite = this.add.sprite(x, unten - 1, "portal_aus_16").setOrigin(0.5, 1);
    } else {
      const key = `${o.bild}_16`;
      sprite = this.add.image(x, unten + (o.bild === "siegeltuer" ? 0 : 1), this.textures.exists(key) ? key : "marker_16").setOrigin(0.5, 1);
    }
    sprite.setDepth(o.art === "portal" ? -4 : unten);

    let zone = null;
    if (o.art !== "portal") {
      zone = this.add.zone(o.x * K + (b * K) / 2, o.y * K + (h * K) / 2, b * K, h * K);
      this.physics.add.existing(zone, true);
      this.feste.add(zone);
    }
    let licht = null;
    if (o.art === "portal") licht = this.add.image(x, unten - 10, "licht_blau").setDepth(9000).setBlendMode(Phaser.BlendModes.ADD).setScale(1.4).setVisible(false);
    const marker = this.add.image(x, unten - sprite.height - 6, "marker_16").setDepth(10000).setVisible(false);
    this.tweens.add({ targets: marker, y: marker.y - 3, duration: 450, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    return { def: o, sprite, zone, marker, licht, rechteck: new Phaser.Geom.Rectangle(o.x * K, o.y * K, b * K, h * K) };
  }

  aktualisieren() {
    for (const obj of this.objekte) {
      const { def, sprite, zone, marker, licht } = obj;
      const sichtbar = def.sichtbar ? def.sichtbar(zustand) : true;
      let aktiv = sichtbar;
      if (def.art === "tor") {
        const offen = def.offen(zustand);
        if (offen) { sprite.stop(); sprite.setTexture("tor_offen_16"); } else if (!sprite.anims.isPlaying) sprite.play("tor16");
        aktiv = !offen;
      }
      if (def.art === "portal") {
        const an = def.aktiv(zustand);
        if (an) { if (!sprite.anims.isPlaying) sprite.play("portal16"); } else { sprite.stop(); sprite.setTexture("portal_aus_16"); }
        licht?.setVisible(an);
      }
      sprite.setVisible(sichtbar);
      if (zone?.body) zone.body.enable = def.art === "tor" ? aktiv : sichtbar;
      obj.interaktiv = Boolean(def.aktion) && aktiv;
      marker.setVisible(obj.interaktiv && Boolean(def.marker?.(zustand)));
    }
    const key = `${this.heldSchluessel()}_16`;
    if (this.spieler.texture.key !== key) {
      this.spieler.anims.stop();
      this.spieler.setTexture(key, 0);
    }
  }

  naechstesObjekt() {
    const fx = this.spieler.x, fy = this.spieler.y - 3;
    let bestes = null, abstand = Infinity;
    for (const obj of this.objekte) {
      if (!obj.interaktiv) continue;
      const r = obj.rechteck;
      const d = Math.hypot(Math.max(r.x - fx, 0, fx - r.right), Math.max(r.y - fy, 0, fy - r.bottom));
      if (d < REICHWEITE && d < abstand) { bestes = obj; abstand = d; }
    }
    return bestes;
  }

  /** Dreht eine Figur zum Spieler (beim Ansprechen). */
  zuwenden(obj) {
    if (obj.def.art !== "npc" || obj.def.bild === "boss_torwaechter") return;
    const dx = this.spieler.x - obj.sprite.x, dy = this.spieler.y - obj.sprite.y;
    const r = Math.abs(dx) > Math.abs(dy) ? "seite" : dy < 0 ? "oben" : "unten";
    obj.sprite.setFlipX(r === "seite" && dx > 0);
    obj.sprite.play(`${obj.def.bild}_${r}_stehen`);
  }

  async interagieren(obj) {
    this.beschaeftigt = true;
    hinweis(null);
    this.spieler.setVelocity(0, 0);
    this.spieler.anims.stop();
    this.zuwenden(obj);
    const welt = {
      aktualisieren: () => this.aktualisieren(),
      reisen: (karte, spawn) => { this.reiseZiel = { karte, spawn }; },
      erschuettern: () => this.cameras.main.shake(250, 0.008),
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
      this.cameras.main.fadeOut(350);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.restart(ziel));
    }
  }

  rauch(x, y) {
    this.time.addEvent({
      delay: 700, loop: true,
      callback: () => {
        const r = this.add.circle(x + Math.random() * 4, y, 2 + Math.random() * 2, 0xd8d4e0, 0.75).setDepth(9500);
        this.tweens.add({ targets: r, y: y - 28 - Math.random() * 10, x: r.x + 6 + Math.random() * 8, scale: 2.4, alpha: 0, duration: 2600, onComplete: () => r.destroy() });
      },
    });
  }

  falter(breite, hoehe) {
    for (let i = 0; i < 3; i++) {
      const f = this.add.sprite(60 + i * 140, 140 + i * 20, "falter_0_16").setDepth(9600).play({ key: "falter16", startFrame: i % 2 });
      const fliegen = () => this.tweens.add({
        targets: f, x: Phaser.Math.Clamp(f.x + Phaser.Math.Between(-60, 60), 30, breite - 30),
        y: Phaser.Math.Clamp(f.y + Phaser.Math.Between(-40, 40), 40, hoehe - 40),
        duration: Phaser.Math.Between(1800, 3200), ease: "Sine.easeInOut", onComplete: fliegen,
      });
      fliegen();
    }
  }

  update() {
    const s = this.spieler;
    const key = this.heldSchluessel();
    if (this.beschaeftigt || istOffen()) {
      s.setVelocity(0, 0);
      if (s.anims.isPlaying) s.anims.stop();
      return;
    }
    const t = this.tasten;
    let vx = 0, vy = 0;
    if (t.links.isDown || t.a.isDown) vx -= 1;
    if (t.rechts.isDown || t.d.isDown) vx += 1;
    if (t.hoch.isDown || t.w.isDown) vy -= 1;
    if (t.runter.isDown || t.s.isDown) vy += 1;
    const laenge = Math.hypot(vx, vy) || 1;
    s.setVelocity((vx / laenge) * TEMPO, (vy / laenge) * TEMPO);
    if (vx || vy) {
      this.richtung = vy && Math.abs(vy) >= Math.abs(vx) ? (vy < 0 ? "oben" : "unten") : "seite";
      if (vx) s.setFlipX(vx > 0);
      if (this.richtung !== "seite") s.setFlipX(false);
      s.anims.play(`${key}_${this.richtung}_laufen`, true);
    } else {
      s.anims.stop();
      s.setFrame(RICHTUNGEN.indexOf(this.richtung) * BILDER_PRO_RICHTUNG);
    }
    s.setDepth(s.y);

    const obj = this.naechstesObjekt();
    if (obj) hinweis("E", obj.def.hinweis ?? `Mit ${obj.def.name} sprechen`);
    else hinweis(null);
  }
}
