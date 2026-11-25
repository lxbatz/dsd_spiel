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
| `vocantia.js` | Vocantia (Sprechen): die fünf Quests (Erste Worte, Markt der Rollen, Halle der Dinge, Ratsrunde, Bühne am See) und der Schweigekönig |
| `scriptoria_q5.js` | Scriptoria Quest 5: Überschriften zuordnen (Lesen Teil 5), Endkampf gegen den Bibliothekar der Schatten |
| `scriptoria_q4.js` | Scriptoria Quest 4: zwei Informationstexte mit je sechs Aufgaben A/B/C (Lesen Teil 4) |
| `scriptoria_q3.js` | Scriptoria Quest 3: Aushänge richtig/falsch (Lesen Teil 3), Laternenprobe zu Signalwörtern |
| `scriptoria_q1_q2.js` | Scriptoria Quest 1 (Briefe mit Wortliste + Betreff, Lesen Teil 1) und Quest 2 (Berichte zuordnen, Lesen Teil 2) |
| `aurelia_q5.js` | Aurelia Quest 5: Meinungen zuordnen (Teil 5, Übung und Generalprobe nur einmal hören), Endkampf gegen den Drachenrichter |
| `aurelia_q4.js` | Aurelia Quest 4: Werft – Szenen am Arbeitsplatz, Interview (R/F), Bericht (Block mit 6 Aufgaben), Abnahme im Prüfungsmodus |
| `aurelia_q3.js` | Aurelia Quest 3: Telefonnachrichten auf drei Klangperlen (mit Piepton), Talos' Notizbuch |
| `aurelia_q2.js` | Aurelia Quest 2: Gespräche am Markt (drei Händler, Gespräche mit zwei Stimmen), Ohrenprobe bei Ione |
| `schattenzahn_hoeren.js` | Feste Schattenzahn: Probeprüfung Hörverstehen (5 Teile, 24 Items) |
| `schattenzahn_lesen.js` | Feste Schattenzahn: Probeprüfung Leseverstehen (5 Teile, 24 Items) |
| `schattenzahn_finale.js` | Feste Schattenzahn: Schriftliche Kommunikation (Forumsbeitrag), Mündliche Kommunikation (Gespräch, Präsentation, Nachfragen), Morgraths Worte und der Endkampf |
| `quests.js` | Liste aller Quests für die Statistik und das Lehrerzimmer (neue Quests hier eintragen) |
| `gegenstaende.js` | Gegenstände und ihre Wirkung |
| `codes.js` | Ältere Lehrercodes und Sprungcodes (nur Prüfsummen). Neue Lehrercodes erzeugt `tools/lehrercodes.html` mit eingebauter Prüfsumme (`src/codesignatur.js`), sie brauchen keinen Eintrag hier |
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
  ablenker: ["dick", "alt"],          // optional: Antworten, die übrig bleiben (wie im DSD) – dann erscheinen die
                                      // Antworten als Liste A, B, C …, und man wählt nur den Buchstaben
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
  vergleich: ["nachricht_reisender"], // optional: weitere Texte, aus denen nicht abgeschrieben werden darf
}
```
`such` ist ein regulärer Ausdruck (Groß-/Kleinschreibung egal). Freie Texte werden nicht bewertet: Die Schülerin/der Schüler muss die Mindestwortzahl erreichen und den Selbstcheck abhaken. Die Lehrkraft liest den Text im Heldenpass und vergibt ggf. einen Lehrercode.

**Abschriftprüfung:** Der Text wird mit dem Lesetext der Aufgabe (oder der Quest) und den Texten in `vergleich` abgeglichen. Ab 6 gleichen Wörtern in Folge erscheint eine Warnung mit der Stelle; Wortfolgen aus `stichpunkte`, `vorlage` und `frage` sind erlaubt. Ist mindestens die Hälfte des Textes abgeschrieben, wird er nicht angenommen.

### Sprechen
```js
{
  typ: "sprechen",
  frage: "Erzähl von deiner Familie.",
  laut: "Erzähl mir bitte etwas über deine Familie.",   // optional: wird vorgelesen (sonst frage)
  dauer: 30,                                            // so viele Sekunden muss man mindestens sprechen
  hilfen: "In meiner Familie sind wir … · Ich habe … Geschwister.",   // Redemittel zum Aufklappen
  partner: { a: "A fragt und hört zu.", b: "B antwortet ausführlich." },   // optional: Partnerübung
  checkliste: ["Ich habe in ganzen Sätzen gesprochen.", "…"],   // Selbst- oder Partnercheck
}
```
Man wählt zwischen **Ohne Mikrofon** (Sprechuhr mit Start/Pause) und **Mit Mikrofon** (Stimmkristall: füllt sich nur, solange man spricht; auf Wunsch eine Aufnahme zum Anhören). Die Stimme wird nicht gespeichert und nicht übertragen; die Wahl merkt sich der Browser. Die Aufgabe ist gelöst, wenn die Sprechzeit erreicht und die Checkliste abgehakt ist. Sprechaufgaben funktionieren auch im Bosskampf.

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
| Nebenquest im Dorf abgeschlossen | 50 |
| Aurelia: Station einer Quest (Rufmuschel 20, Stand/Perle/Werft 25) | 20–25 |
| Aurelia: Quest abgeschlossen (Ton der Glocke) | 150 |
| Lehrercodes | je nach Code (Teamarbeit 20, mündlicher Beitrag 10 …) |

## Stufen

Die Stufen stehen in `src/spielstand.js` (`STUFEN`). Das Lehrerzimmer nutzt dieselbe Liste.

| Stufe | ab XP | Titel | ungefähr erreicht |
|---|---|---|---|
| 1 | 0 | Ankömmling | Start |
| 2 | 100 | Wanderer | Dorf |
| 3 | 250 | Lehrling der Worte | Dorf |
| 4 | 450 | Pfadfinder | Halle der Tausend Tore |
| 5 | 700 | Sprachwächter | Halle / erste Insel |
| 6 | 1000 | Hüter der Schrift | Inseln der Stimmen |
| 7 | 1400 | Veteran von Eldoria | Inseln der Stimmen |
| 8 | 1900 | Meister der Worte | Ende Lythara / Aurelia |
| 9 | 2500 | Held von Eldoria | Aurelia, Quest 4 |
| 10 | 2750 | Bewahrer der Töne | Aurelia, Quest 5 (mit Nebenquests früher) |
| 11 | 3000 | Stimme von Aurelia | Sieg über den Drachenrichter |
| 12 | 3300 | Wächter der Glocken | ab hier: kommende Reiche, Nebenquests, Lehrercodes |
| 13 | 3650 | Kenner der Schriften | |
| 14 | 4000 | Hüter des Wissens | |
| 15 | 4400 | Ritter der Sprache | |
| 16 | 4800 | Bote der Reiche | |
| 17 | 5250 | Meister der Rede | |
| 18 | 5700 | Wortschmied | |
| 19 | 6200 | Stimme der Weisen | |
| 20 | 6700 | Siegelträger | |
| 21 | 7250 | Erbe der Schreibmeister | |
| 22 | 7800 | Ratgeber von Eldoria | |
| 23 | 8400 | Sternenleser | |
| 24 | 9000 | Retter der Stimmen | |
| 25 | 9700 | Legende von Eldoria | Ende des Spiels |

Pro Reich gibt es bisher etwa 1100–1300 XP. Wenn die nächsten Reiche fertig sind, kann man die Schwellen ab Stufe 12 noch anpassen. Die XP der Spielerinnen und Spieler bleiben dabei gleich, nur die angezeigte Stufe ändert sich.

Neue Stufen einfach hinten an `STUFEN` anhängen. Bei neuen Reichen die Schwellen so wählen, dass der Hauptweg weiter Stufen bringt.

## Neue Orte in der 3D-Version

Ein neuer Ort braucht zwei Teile:

1. **Die Karte mit der Story-Logik** in `src/welt/` (wie `dorf.js` oder `halle.js`): Raster, Startpunkte (`spawns`), Musik und Objekte mit ihren Aktionen. Die Karte wird in `src/welt/karten.js` eingetragen.
2. **Das 3D-Aussehen** in `src/grafik3d/`: eine Funktion wie `halleBauen(szene, raster, kontext)`, die Boden, Wände, Licht und Dekoration baut. Sie wird in `src/grafik3d/spiel.js` bei `BAUER` eingetragen.

Figuren (`art: "npc"`) bekommen automatisch ein 3D-Modell und ein Pixel-Porträt, wenn es für ihr `bild` einen Eintrag in `AUSSEHEN` (`src/grafik16/figuren.js`) und `PORTRAITS` (`src/grafik16/portraits.js`) gibt. Die Figuren kann man mit `tools/vorschau3d.html` ansehen.

Die Inseln der Stimmen (Karten-ID `turm`, damit alte Spielstände passen) haben einen eigenen 3D-Bau: `src/grafik3d/inseln3d.js`. Form und Lage der Inseln, Brücken und Hindernisse stehen in `src/welt/inseln_layout.js` (Mittelpunkt, Größe und Thema je Insel; das Raster wird daraus erzeugt). Eine Brücke (`art: "bruecke"`) sperrt den Weg, bis `offen(zustand)` wahr wird, und baut sich dann Planke für Planke auf. Die Inseln gibt es nur in der 3D-Version (`nur3d: true`); die älteren Versionen bleiben in der Halle.

Ein Echo-Kristall (`bild: "kristall"`, `farbe`) glimmt schwach und leuchtet hell, sobald `leuchtet(zustand)` wahr ist. Die Wächter sind Varianten des Torwächters; ihre Farben und Zeichen stehen in `WAECHTER` (`src/grafik3d/halle3d.js`), die Porträts in `PORTRAITS` (`waechter: {...}`).

Der Turm der Tausend Treppen (`src/welt/treppenturm.js`, Raster und Höhen in `src/welt/treppenturm_layout.js`, 3D in `src/grafik3d/treppenturm3d.js`) ersetzt in 3D die Halle der Tausend Tore: Wer in 3D zur Karte `halle` reist, landet im Turm (gleiche Startpunkte und Fortschrittsmarken). Eine Welt kann mit `boden(x, z)` eine Bodenhöhe liefern; dann steigen Figur, Kamera, Objekte und Marker Treppen und Etagen hinauf (ohne `boden` bleibt alles auf Höhe 0).

Vocantia (`src/welt/vocantia.js`, 3D in `src/grafik3d/vocantia3d.js`, Raster in `src/welt/vocantia_layout.js`): Eingefrorene Figuren haben `eis: true` und tauen auf, sobald `leuchtet(zustand)` wahr wird. Das ganze Tal taut nach `vocantia_finale` auf. Der Schweigekönig steht in `src/grafik3d/eistroll.js` (Posen „thron“ und „gipfel“). Eine Welt kann mit `aktiv(an)` erfahren, ob sie gerade sichtbar ist (hier für den Frost-Rand).

Die Feste Schattenzahn (`src/welt/schattenzahn.js`, Raster und Höhen in `src/welt/schattenzahn_layout.js`, 3D in `src/grafik3d/feste3d.js`, Morgrath in `src/grafik3d/morgrath.js`) ist die finale Kampagne: Vom Vorhof vor der Burg geht es über Treppen und Fallgitter immer tiefer hinab, durch das Dungeon des Hörens, die Katakomben des Lesens, die Grotte der Schreiber und die Kaverne der Stimmen. Hören und Lesen laufen mit `pruefungsFolge` (`src/ui/aufgaben.js`): ein Versuch je Aufgabe, keine Rückmeldung, Punkte je Teil und am Ende eine Auswertung (`pruefungsAuswertung`). Die Ergebnisse stehen in `zustand.pruefung` und im Heldenpass. Morgrath ist ein Bosskampf in fünf Phasen (Lebenskraft 1200, je Phase 240): Phase 1–4 sind die Prüfungsteile mit Bossbalken über den Aufgaben (Option `kopf` in `pruefungsFolge`/`aufgabenFolge`) und Bossmusik (`kampf_morgrath`; während der Hörtexte der Hörprüfung schweigt sie ganz), Phase 5 ist der Endkampf (`kampf` mit `lpVoll` und `phase`). Morgrath hat die Posen „stehen“, „taumeln“ (nach jeder bestandenen Phase, dann flieht er) und „gefallen“ (er stürzt in den Lavasee).

Das Ende läuft über drei Zustände: `schattenzahn_boss` (Morgrath in der Lava) → `schattenzahn_flucht` (die Splitter haben sich zum Sprachsiegel vereint, die Feste bebt, Bossmusik) → `schattenzahn_finale` (draußen: Einsturz, blauer Himmel). Dafür gibt es in der 3D-Engine (`src/grafik3d/spiel.js`) allgemeine Bausteine:
- **Zwischensequenzen:** `welt.szene(name)` ruft `ereignis(name)` des 3D-Bauers auf und wartet, bis die Sequenz fertig ist. Der Bauer führt dabei die Kamera mit `kontext.kino(pos, blick)` (`kino(null)` gibt sie zurück); solange zeigt das Spiel Kinobalken und blendet die Bedienelemente aus. In `feste3d.js` gibt es `siegel`, `beben` und `einsturz`.
- **Beben:** Liefert der Bauer `beben()` (0–1), zittert die Kamera, und `grollen()` aus `src/musik.js` erzeugt ein tiefes Grollen (Web Audio, ohne Datei).
- **Laufen und Blicken:** `welt.laufen(tx, ty)` lässt die Spielfigur selbst zu einer Kachel laufen (Promise), `welt.blicken(tx, ty)` dreht sie in eine Richtung.
- **Auslöser:** `ausloeser: [{ wenn(zustand, tx, ty), aktion(welt) }]` in der Karte startet einen Ablauf, sobald die Bedingung stimmt (z. B. die Figur betritt auf der Flucht den Vorhof).
- **Drehung:** `drehung` an einem Objekt dreht das Modell (z. B. die Mentoren vor dem Tor mit Blick zur Burg).

Kampf-, Prüfungs- und Sprechfenster haben oben einen Knopf „Musik an/aus“ (`tonSchalter()` aus `src/ui/tonschalter.js`); er folgt auch der Taste M.

Ein Tor (`art: "tor"`) öffnet sich in 3D von selbst mit Staub und Funken, sobald `offen(zustand)` wahr wird. Ein Gegner, dessen `sichtbar(zustand)` nach dem Sieg falsch wird, löst sich in Funken auf.

## Intro (3D)

`src/grafik3d/intro.js` zeigt zu jeder Tafel des Prologs (`PROLOG` in `src/start.js`) eine Szene. `titelZeigen` bekommt dafür `intro: { szene(nr), ende() }` (siehe `src/main3d.js`); die 16-Bit-Version zeigt den Prolog weiter ohne Szenen. Die Reiche werden nur für das Intro gebaut: Während des Intros gelten vorübergehend die Fortschritte bis zur Befreiung aller vier Reiche (damit sie „schön“ aussehen), danach wird der Zustand zurückgesetzt und die Intro-Karten werden verworfen. Die Kamerafahrten über die Reiche stehen in `REICHE` (Kachelkoordinaten). Szenen wechseln mit `spiel.ueberblenden(fn)`: Das letzte Bild bleibt als Standbild stehen und blendet über die neue Szene aus. Das Sprachsiegel ist ein gemeinsames Modell (`src/grafik3d/siegel.js`), Morgrath kann mit `schlagen(u)` mit dem Streitkolben zuschlagen.

**Musik und Mikrofon:** Solange der Stimmkristall das Mikrofon benutzt, schweigt die Hintergrundmusik (`mikrofonStille` in `src/musik.js`), damit sie nicht mitgemessen oder mit aufgenommen wird. Beim Weitergehen (`sprechenStoppen`) kommt sie zurück.
