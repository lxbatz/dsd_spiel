# Inhalte anlegen und ändern

Alle Lerninhalte liegen in `src/inhalte/`. Für neue Aufgaben muss man nichts am Spielcode ändern.

| Datei | Inhalt |
|---|---|
| `texte.js` | Lesetexte (Steckbrief, Aushang, Forumsbeitrag …) |
| `dorf.js` | Aufgaben im Dorf der Ankömmlinge |
| `lythara_q1.js` | Lythara Quest 1: die fünf Tore, die Einleitung am Pult, der Torwächter |
| `lythara_inseln.js` | Lythara Quests 2–5 und Finale (Inseln der Stimmen): je drei Echo-Kristalle, ein Text am Pult und ein Wächter; das Buch der Stimmen |
| `dorf_neben.js` | Nebenquests im Dorf: Finns Geheimnis, Ein Tag am Marktstand, Borins Werkstatt (mit Lesetexten) |
| `aurelia_q1.js` | Aurelia Quest 1: Durchsagen an den Rufmuscheln, Reisende beraten (Hörtexte mit Gong) |
| `aurelia_q4.js` | Aurelia Quest 4: Werft – Szenen am Arbeitsplatz, Interview (R/F), Bericht (Block mit 6 Aufgaben), Abnahme im Prüfungsmodus |
| `aurelia_q3.js` | Aurelia Quest 3: Telefonnachrichten auf drei Klangperlen (mit Piepton), Talos' Notizbuch |
| `aurelia_q2.js` | Aurelia Quest 2: Gespräche am Markt (drei Händler, Gespräche mit zwei Stimmen), Ohrenprobe bei Ione |
| `quests.js` | Liste aller Quests für die Statistik und das Lehrerzimmer (neue Quests hier eintragen) |
| `gegenstaende.js` | Gegenstände und ihre Wirkung |
| `codes.js` | Lehrercodes (nur Prüfsummen, siehe `tools/lehrercodes.html`) |
| `klassen.js` | Heldenklassen im Heldenpass |

Die Dialoge der Figuren stehen in `src/welt/dorf.js`, `src/welt/halle.js` und `src/welt/turm.js`.

### Lythara: der Aufbau nach dem Reader (Teil B)

Die fünf Quests in Lythara folgen dem Reader „Prüfungsteil Schriftliche Kommunikation“, Teil B. Grundlage ist überall Jonas' Forumsbeitrag (`texte.js`) und die Frage „Sollten alle Auszubildenden ein Praktikum im Ausland machen?“. Die Übungen sind eigene Texte, keine Abschriften aus dem Buch.

| Quest | Ort | Reader | Lernziel |
|---|---|---|---|
| 1 | Halle der Tausend Tore | B1–B14 | Einleitung: Thema, Quelle, Interesse, Leser, Überschrift |
| 2 | Insel der Echos | B15–B37 | Wiedergabe: Verfasser, Situation, Meinung, Appell; eigene Worte, richtig und vollständig |
| 3 | Insel der Erinnerungen | B38–B48 | Erfahrungsbericht: Überleitung, passende Erfahrungen, W-Fragen, Verknüpfungen, Perfekt |
| 4 | Insel der Waage | B49–B61 | Meinung: deutlich sagen, Argumente nach Kriterien, echte Begründungen, Beispiele, Verknüpfungen |
| 5 | Insel des Siegels | B62–B64 | Schluss: Meinung zusammenfassen, Leser ansprechen, Gruß und Name |
| Finale | Buch der Stimmen | – | Der ganze Forumsbeitrag. Die fünf eigenen Texte stehen schon im Feld und werden zusammengefügt und überarbeitet. |

Eine Insel in `lythara_inseln.js` hat diese Teile: `stationen` (drei Kristalle mit je 3–4 Aufgaben), `text` (freier Text am Pult), `waechter` (Bosskampf) und `lyra` (was Lyra beim ersten Kristall sagt). Neue Aufgaben kann man einfach in die Listen schreiben.

## Aufgabentypen

Jede Aufgabe ist ein Objekt mit `typ` und `frage`. Optional: `erklaerung` (wird nach der Antwort gezeigt) und `lesetext` (ID aus `texte.js`, wird über der Aufgabe angezeigt).

### Auswahl (Multiple Choice)
```js
{
  typ: "auswahl",
  frage: "Worum geht es in dem Text?",
  optionen: ["um ein Praktikum", "um eine Reise", "um Rezepte"],
  richtig: 0,                // Index der richtigen Option (0 = erste)
  erklaerung: "…",
}
```
Die Optionen werden im Spiel gemischt.

### Lückentext
```js
{
  typ: "luecke",
  frage: "Ergänze die Verben.",
  text: "Ich {heiße} Mira. Ich {bin} 16 Jahre alt.",   // Lösung in { }
  auswahl: true,              // true = Auswahlliste, weglassen = selbst schreiben
  ablenker: ["habe", "gehe"], // falsche Optionen für die Auswahlliste
}
```
Mehrere richtige Lösungen mit `|` trennen: `{stammt|kommt}`. Beim Schreiben wird „ss“ statt „ß“ akzeptiert (mit Hinweis). Groß-/Kleinschreibung zählt.

### Satz bauen (Ordnen)
```js
{
  typ: "ordnen",
  frage: "Bau den Satz.",
  teile: ["Ich", "habe", "einen Artikel", "gelesen."],     // in richtiger Reihenfolge
  loesungen: ["Einen Artikel habe ich gelesen."],          // optional: weitere richtige Sätze
}
```

### Zuordnen
```js
{
  typ: "zuordnen",
  frage: "Finde das Gegenteil.",
  paare: [["groß", "klein"], ["kurz", "lang"]],
  ablenker: ["dick", "alt"],          // optional: Antworten, die übrig bleiben (wie im DSD)
  beispiel: ["warm", "kalt"],         // optional: schon gelöste Beispielzeile (Nummer 0)
}
```

### Block (mehrere Aufgaben auf einem Blatt)
Wie auf dem Aufgabenblatt der Prüfung: erst alle Aufgaben lesen, dann den Text hören, dann alles zusammen prüfen.
```js
{
  typ: "block",
  hoertext: BERICHT,                 // oder lesetext
  nummer: 15,                        // Nummer der ersten Aufgabe
  frage: "Lies zuerst die Aufgaben 15–20. Hör dann den Bericht.",
  aufgaben: [
    { typ: "auswahl", frage: "Daria", optionen: ["…", "…", "…"], richtig: 1, mischen: false },
    // …
  ],
}
```

### Richtig/Falsch
```js
{
  typ: "richtigfalsch",
  lesetext: "aushang_fest",
  frage: "Richtig oder falsch?",
  aussagen: [["Das Fest ist am Samstag.", true], ["Der Eintritt kostet 5 Euro.", false]],
}
```

### Freier Text
```js
{
  typ: "freitext",
  id: "lythara_einleitung",       // unter dieser ID wird der Text gespeichert
  frage: "Schreibe deine Einleitung.",
  minWoerter: 35,
  stichpunkte: "Redemittel: …",   // Hilfe über dem Textfeld
  muster: [                       // automatische Hinweise (keine Bewertung!)
    { such: "geht es um|handelt von", ok: "Du nennst das Thema.", fehlt: "Nenne das Thema: …" },
  ],
  checkliste: ["Ich nenne das Thema.", "…"],   // Selbstcheck, muss abgehakt werden
  vorlage: (z) => "…",            // optional: Text, der beim ersten Öffnen schon im Feld steht
}
```
`such` ist ein regulärer Ausdruck (Groß-/Kleinschreibung egal). Freie Texte werden nicht bewertet: Die Schülerin/der Schüler muss die Mindestwortzahl erreichen und den Selbstcheck abhaken. Die Lehrkraft liest den Text im Heldenpass und vergibt ggf. einen Lehrercode.

### Hörtexte

Jede Aufgabe kann einen Hörtext haben (zusätzlich oder statt eines Lesetextes):
```js
hoertext: { sprecher: "Händlerin Wilma", text: "Hallo, schön, dass du da bist! …", stimme: { tonhoehe: 1.15, tempo: 0.86 } }
```
Mit `gong: true` erklingt vorher ein Gong wie bei einer Durchsage, mit `piep: true` ein Piepton wie beim Anrufbeantworter. Mit `pruefung: true` gilt der Prüfungsmodus: höchstens zweimal hören, kein Text zum Einblenden (`maxHoeren: 1` für Texte, die man nur einmal hört, wie DSD Hören Teil 5). Für Gespräche mit mehreren Stimmen statt `text` eine Liste `teile: [{ sprecher, text, stimme }, …]` angeben. Die Sprachausgabe des Browsers liest den Text auf Deutsch vor. Für eine eigene Aufnahme `datei: "Sound/hoeren/mimi_wilma.mp3"` ergänzen, dann wird die Datei abgespielt. Nach zweimal Hören kann man den Text einblenden. Beispiele: `dorf_neben.js` (Mimi ist weg!), `aurelia_q2.js` (Gespräche mit zwei Stimmen).

### Angaben aus dem Heldenpass einbauen

Statt eines festen Objekts kann eine Aufgabe auch eine Funktion sein. Sie bekommt den Spielstand `z` und liefert die Aufgabe. Die Angaben aus dem Heldenpass stehen in `z.held` (`name`, `alter`, `land`, `wohnort`, `sprachen`, `hobbys`, `beruf`, `klasse`).

```js
(z) => ({
  typ: "auswahl",
  frage: `Du möchtest deinen Traumberuf nennen: ${z.held.beruf}. Welcher Satz ist richtig?`,
  optionen: [`Ich möchte ${z.held.beruf} werden.`, `Ich werde möchte ${z.held.beruf}.`],
  richtig: 0,
})
```

Vorsicht bei Angaben, die die Grammatik ändern (z. B. „aus Polen“, aber „aus der Türkei“). Ein Beispiel mit Rückfallwert steht in `dorf.js` (Funktion `traumberuf`).

## Übungsmodus und Kampfmodus

- **Quests und Tore (Übungsmodus):** Bei einem Fehler darf man es noch einmal versuchen. Nach zwei Fehlversuchen erscheint „Lösung zeigen“.
- **Bosskampf:** Jede Frage hat nur einen Versuch. Richtig = Schaden am Gegner, falsch = ein Herz weniger (danach wird die Lösung gezeigt). Fragen werden zufällig gezogen. Lebenspunkte und Schaden stehen beim Gegner (`lp`, `schaden`).

## XP im Spiel

| Leistung | XP |
|---|---|
| Quest im Dorf abgeschlossen | 50 |
| Tor in der Halle geöffnet | 20 |
| Eigene Einleitung geschrieben (Bonus) | 25 |
| Torwächter besiegt + Quest abgeschlossen | 150 |
| Echo-Kristall auf den Inseln der Stimmen | 20 |
| Eigener Text am Pult einer Insel | 25 |
| Wächter einer Insel besiegt | 150 |
| Ganzer Forumsbeitrag im Buch der Stimmen | 200 |
| Lehrercodes | je nach Code (Teamarbeit 20, mündlicher Beitrag 10 …) |

Die Stufen stehen in `src/zustand.js` (`STUFEN`).

## Neue Orte in der 3D-Version

Ein neuer Ort braucht zwei Teile:

1. **Die Karte mit der Story-Logik** in `src/welt/` (wie `dorf.js` oder `halle.js`): Raster, Startpunkte (`spawns`), Musik und Objekte mit ihren Aktionen. Die Karte wird in `src/welt/karten.js` eingetragen.
2. **Das 3D-Aussehen** in `src/grafik3d/`: eine Funktion wie `halleBauen(szene, raster, kontext)`, die Boden, Wände, Licht und Dekoration baut. Sie wird in `src/grafik3d/spiel.js` bei `BAUER` eingetragen.

Figuren (`art: "npc"`) bekommen automatisch ein 3D-Modell und ein Pixel-Porträt, wenn es für ihr `bild` einen Eintrag in `AUSSEHEN` (`src/grafik16/figuren.js`) und `PORTRAITS` (`src/grafik16/portraits.js`) gibt. Die Figuren kann man mit `tools/vorschau3d.html` ansehen.

Die Inseln der Stimmen (Karten-ID `turm`, damit alte Spielstände passen) haben einen eigenen 3D-Bau: `src/grafik3d/inseln3d.js`. Form und Lage der Inseln, Brücken und Hindernisse stehen in `src/welt/inseln_layout.js` (Mittelpunkt, Größe und Thema je Insel; das Raster wird daraus erzeugt). Eine Brücke (`art: "bruecke"`) sperrt den Weg, bis `offen(zustand)` wahr wird, und baut sich dann Planke für Planke auf. Die Inseln gibt es nur in der 3D-Version (`nur3d: true`); die älteren Versionen bleiben in der Halle.

Ein Echo-Kristall (`bild: "kristall"`, `farbe`) glimmt schwach und leuchtet hell, sobald `leuchtet(zustand)` wahr ist. Die Wächter sind Varianten des Torwächters; ihre Farben und Zeichen stehen in `WAECHTER` (`src/grafik3d/halle3d.js`), die Porträts in `PORTRAITS` (`waechter: {...}`).

Ein Tor (`art: "tor"`) öffnet sich in 3D von selbst mit Staub und Funken, sobald `offen(zustand)` wahr wird. Ein Gegner, dessen `sichtbar(zustand)` nach dem Sieg falsch wird, löst sich in Funken auf.
