# Grafik

Hier liegen alle Bilddateien des Spiels.

Geplant sind zum Beispiel:
- **Figuren** (Heldenklassen, Aldric, Wilma, Borin, Lyra, Gegner …)
- **Kacheln** für die Karten (Gras, Wege, Wände, Wasser …)
- **Objekte** (Tore, Portale, Brunnen, Schwarzes Brett …)
- **Bilder für Aufgaben** (z. B. Bildbeschreibung im Reich Vocantia)

Empfohlenes Format: **PNG**. Dateinamen bitte ohne Leerzeichen und Umlaute, z. B. `npc_aldric.png`.

Zurzeit zeichnet das Spiel alle Grafiken als Platzhalter per Code (`src/grafik.js`). Sobald hier echte Grafiken liegen, kann das Spiel sie stattdessen laden.

Bei fremden Dateien immer die Lizenz prüfen und hier notieren (Quelle, Urheber, Lizenz).

## Konzeptzeichnungen

| Datei | Inhalt | Umsetzung |
|---|---|---|
| `Drachenrichter1.jpg`, `Drachrenrichter2.jpg` | Der Drachenrichter (Bossgegner), Zeichnungen eines Kollegen | 3D-Modell in `src/grafik3d/drache.js`, Pixel-Porträt in `src/grafik16/portraits.js`; anzusehen in DAS NICHTS |

`credits/beau_buckley.png`: Anzeigebild von Beau Buckley (Fantasy Musica) aus dem Forum, in dem die Musik veröffentlicht ist; für die Credits mit gefüllten Ecken quadratisch gemacht.
