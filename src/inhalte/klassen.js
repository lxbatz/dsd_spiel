// Heldenklassen für den Heldenpass. "textur" verweist auf eine Figur aus grafik.js / grafik16/figuren.js.
// w / m: Name, wenn man im Heldenpass „Heldin“ oder „Held“ gewählt hat (sonst gilt name).
export const KLASSEN = {
  kriegerin: { name: "Kriegerin / Krieger", w: "Kriegerin", m: "Krieger", textur: "held_kriegerin", text: "mutig und stark" },
  magier: { name: "Magierin / Magier", w: "Magierin", m: "Magier", textur: "held_magier", text: "klug und neugierig" },
  waldlaeufer: { name: "Waldläuferin / Waldläufer", w: "Waldläuferin", m: "Waldläufer", textur: "held_waldlaeufer", text: "aufmerksam und schnell" },
  barde: { name: "Bardin / Barde", w: "Bardin", m: "Barde", textur: "held_barde", text: "kreativ und gesprächig" },
};
