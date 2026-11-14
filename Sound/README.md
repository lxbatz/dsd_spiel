# Sound

Hier liegen alle Audiodateien des Spiels.

Geplant sind zum Beispiel:
- **Hörtexte** für das Reich Aurelia (Hörverstehen): Dialoge, Durchsagen, Nachrichten
- **Musik** für die Gebiete (Dorf, Lythara, Bosskampf …)
- **Geräusche** für Aktionen (Tor öffnet sich, richtige/falsche Antwort, Belohnung …)

Empfohlenes Format: **MP3** (läuft in allen Browsern). Dateinamen bitte ohne Leerzeichen und Umlaute, z. B. `aurelia_markt_dialog1.mp3`.

Bei fremden Dateien immer die Lizenz prüfen und hier notieren (Quelle, Urheber, Lizenz).

## Dateien und Lizenzen

| Datei | Verwendung im Spiel | Herkunft |
|---|---|---|
| `opening_03` | Intro-Text (Prolog) | MIDI von einer Website für RPG-Maker-Spiele, frei verwendbar (Platzhalter) |
| `town_03` | Dorf der Ankömmlinge | wie oben (Platzhalter) |
| `fanfare_01` | Quest abgeschlossen | wie oben (Platzhalter) |
| `castle_01` | Halle der Tausend Tore | wie oben (Platzhalter) |
| `aurelia` | Aurelia (Hafenstadt der Glocken) | vom Projekt hochgeladen (Platzhalter) |
| `plains_01` | Inseln der Stimmen | wie oben (Platzhalter) |
| `castle_03` | noch nicht verwendet | wie oben (Platzhalter) |
| `battle_02` | Bosskampf | wie oben (Platzhalter) |
| `fanfare_03` | Sieg im Bosskampf | wie oben (Platzhalter) |
| `fanfare_02` | Levelaufstieg | wie oben (Platzhalter) |
| `evil_03` | noch nicht verwendet | wie oben (Platzhalter) |

Die `.mid`-Dateien sind die Originale. Die `.mp3`-Dateien daraus wurden mit FluidSynth und dem Klangsatz „FluidR3 GM“ (MIT-Lizenz, Frank Wen) erzeugt; die Stille am Ende wurde abgeschnitten, damit die Musik ohne Lücke in Schleife läuft.

Welche Datei wo läuft, steht in `src/musik.js`.

- `forest_02` – Scriptoria, der Bücherwald (aus `forest_02.mid`, mit FluidR3_GM umgewandelt)
- `vocantia_snow_02` – Vocantia im ewigen Winter (aus `vocantia_snow_02.mid`, mit FluidR3_GM umgewandelt)
- `vocantia_town_02` – Vocantia nach dem Auftauen (aus `vocantia_town_02.mid`, mit FluidR3_GM umgewandelt)
