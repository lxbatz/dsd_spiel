// Bilder der Spielfiguren als Data-URLs, damit HTML-Fenster sie als Porträt zeigen können.
// Werden in der BootSzene aus den Phaser-Texturen erzeugt.
const bilder = {};

export function bildSetzen(schluessel, url) {
  bilder[schluessel] = url;
}

export function bild(schluessel) {
  return bilder[schluessel] ?? "";
}
