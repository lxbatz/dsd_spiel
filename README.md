# DSD-Spiel

Ein Browser-Adventure-Rollenspiel zur spielerischen Vorbereitung auf das **Deutsche Sprachdiplom der Kultusministerkonferenz (DSD)**.

Zielgruppe: Schülerinnen und Schüler, die Deutsch als Fremdsprache lernen.

Die Lernenden reisen als Heldin oder Held durch eine Fantasy-Welt (Heldenreise) und erwerben dabei die sprachlichen und inhaltlichen Kompetenzen, die das DSD verlangt. Lernen geschieht über Aufgaben, Dialoge und Rätsel im Spielverlauf.

## Status

Frühes Grundgerüst: Eine Canvas-Szene mit einer Spielfigur in Pixel-Optik. Spielinhalte, Story und Aufgaben folgen.

## Starten

Die Datei `index.html` direkt im Browser öffnen, oder über einen lokalen Webserver:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen.

## Struktur

```
index.html      Einstiegspunkt
js/main.js      Spielschleife, Eingabe, Rendering
assets/         Pixel-Art, Sounds, Texte
```

## Technik

- HTML5 Canvas mit Pixel-Art (ohne Frameworks, keine Build-Schritte)
- Vanilla JavaScript (ES-Module)
- WebGL ist für spätere Effekte vorgesehen
