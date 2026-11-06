// Gemeinsamer Ablauf beim Start einer Quest:
// Die Figur fragt, ob man jetzt helfen will („Später“ ist immer möglich),
// dann folgen die Aufgaben. Bricht man ab, wird nichts gespeichert.

import { dialog, frage } from "../ui/fenster.js";
import { aufgabenFolge } from "../ui/aufgaben.js";

/**
 * sprecher, bild:  wer fragt
 * frageText, ja:   die Frage vor dem Start und der Text für „Ja“
 * spaeter:         was die Figur sagt, wenn man später wiederkommen will
 * folge:           Daten für aufgabenFolge ({ titel, untertitel, aufgaben })
 * Liefert true, wenn alle Aufgaben gelöst wurden.
 */
export async function questStarten({ sprecher, bild, frageText, ja, spaeter, folge }) {
  const antwort = await frage(sprecher, frageText, [ja, "Später"], bild);
  if (antwort !== 0) {
    await dialog(sprecher, spaeter, bild);
    return false;
  }
  const ergebnis = await aufgabenFolge(folge);
  if (ergebnis.abgebrochen) {
    await dialog(sprecher, spaeter, bild);
    return false;
  }
  return true;
}
