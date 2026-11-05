# Die Chroniken von Eldoria

Ein Browser-Adventure zur spielerischen Vorbereitung auf das **Deutsche Sprachdiplom (DSD I PRO)**.
Zielgruppe: Schülerinnen und Schüler, die Deutsch als Fremdsprache lernen (Niveau A2/B1).

Die Spielenden reisen als Sprachwächterinnen und Sprachwächter durch Eldoria. In vier Reichen (Hören, Lesen, Schreiben, Sprechen) sammeln sie die Fragmente des zerbrochenen Sprachsiegels. Jede Quest ist eine DSD-Übung, jeder Bosskampf eine Prüfungssituation.

## Was ist schon spielbar?

1. **Das Dorf der Ankömmlinge** (Tutorial, Level 1)
   - Heldenpass ausfüllen und sich vorstellen (Ratsältester Aldric)
   - Fragen stellen (Händlerin Wilma) → *Amulett der Wortschätze*
   - Personen beschreiben (Schmied Borin)
   - Einen Aushang verstehen (Schwarzes Brett)
   - Abschluss: *Bronze-Abzeichen*, das Portal nach Lythara öffnet sich
2. **Lythara, Quest 1: Die Schriftrolle des Beobachters** (Lernziel: Einleitung schreiben)
   - Der magische Spiegel zeigt einen Forumsbeitrag (Jonas, Praktikum im Ausland)
   - Halle der Tausend Tore: fünf Tore = Thema, Quelle, Interesse, Leser, Überschrift
   - Pult des Beobachters: eigene Einleitung schreiben (mit Selbstcheck und Textprüfung)
   - Bosskampf gegen den Torwächter der Quellen → *Rolle des Beobachters*

Dazu: XP und Stufen, Inventar, Aufgabenliste, Heldenpass mit gespeicherten Texten, Lehrercodes, automatisches Speichern, Spielstand-Export.

Alle Texte und Aufgaben sind **eigene Beispielinhalte** und werden ersetzt bzw. ergänzt, sobald das Unterrichtsmaterial vorliegt.

## Starten

Das Spiel braucht einen kleinen Webserver (wegen der JavaScript-Module). Im Projektordner:

```bash
python3 -m http.server 8000
```

Dann im Browser `http://localhost:8000` öffnen.

**Steuerung:** Pfeiltasten oder WASD · E oder Leertaste zum Sprechen/Benutzen · Q Aufgaben · I Inventar · P Heldenpass · Esc Menü

## Für Lehrkräfte

- **Lehrercodes** für Teamarbeit, mündliche Beiträge usw.: `tools/lehrercodes.html` öffnen (ebenfalls über den Webserver, z. B. `http://localhost:8000/tools/lehrercodes.html`). Anleitung steht auf der Seite.
- **Texte der Schüler:** Freie Texte (Vorstellung, Einleitung) werden im Heldenpass unter „Meine Texte“ gespeichert und können kopiert werden.
- **Neue Inhalte anlegen:** siehe [docs/inhalte.md](docs/inhalte.md).

## Technik

- [Phaser 3.90](https://phaser.io) (lokal in `vendor/`, keine Internetverbindung nötig), Vanilla JavaScript als ES-Module, kein Build-Schritt
- Karte und Figuren im Canvas, alle Texte und Aufgaben als HTML-Fenster darüber (gut lesbar, Umlaut-Tasten, später gut an Tablets anpassbar)
- Spielstand im `localStorage` des Browsers, ein Spielstand pro Gerät

```
index.html             Einstiegspunkt
css/style.css          Aussehen der Fenster und der Kopfleiste
src/main.js            Startbildschirm, Prolog, Phaser-Konfiguration
src/zustand.js         Spielstand, XP, Stufen, Speichern/Export
src/grafik.js          Platzhalter-Grafiken (Kacheln, Figuren, Objekte)
src/szenen/            Phaser-Szenen (Laden, Karte)
src/welt/              Karten und Story-Logik (Dorf, Halle der Tausend Tore)
src/inhalte/           ALLE Lerninhalte: Aufgaben, Lesetexte, Gegenstände, Codes
src/ui/                Fenster: Dialoge, Aufgabentypen, Bosskampf, Heldenpass, Kopfleiste
tools/lehrercodes.html Werkzeug zum Erzeugen von Lehrercodes
vendor/                Phaser (MIT-Lizenz)
```

Die Grafiken sind Platzhalter und liegen gebündelt in `src/grafik.js`. Ob das Spiel bei Pixel-Art bleibt oder auf 3D-Figuren wechselt, ist noch offen; Inhalte, Aufgaben und Spielstand sind davon unabhängig.
