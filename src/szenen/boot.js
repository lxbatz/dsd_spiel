import { grafikenErzeugen, portraitUrl, alleSchluessel } from "../grafik.js";
import { bildSetzen } from "../ui/bilder.js";

export class BootSzene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    grafikenErzeugen(this);
    for (const k of alleSchluessel()) bildSetzen(k, portraitUrl(this, k));
    this.game.events.emit("bereit");
  }
}
