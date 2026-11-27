# Die Chroniken von Eldoria – Arbeitsregeln

Browser-Rollenspiel für DaF-Lernende (A2, Berufskolleg) zur Vorbereitung auf das **DSD I PRO**.
Hauptversion ist die 3D-Version (`index.html`, Three.js, ES-Module ohne Build-Schritt).

## Prüfungsformat ist die Grundlage

Vor dem Bau neuer Aufgaben, Quests oder Bosskämpfe zuerst **`docs/dsd_pruefung.md`** lesen.
Dort stehen die Formate aus dem offiziellen Modellsatz, die Muster der Lösungen und Ablenker
und die Bewertungskriterien der Handreichung für die Schriftliche Kommunikation. Daran orientieren sich:
- **Formate:**
  - A/B/C als Satzanfang mit drei Fortsetzungen
  - Richtig/Falsch
  - Zuordnen mit übrig bleibenden Antworten (`ablenker`, `beispiel`)
  - Lückentext mit Wortliste
- **Hören:**
  - ein Item pro kurzem Hörtext (Teil 1/2)
  - 5–6 Items zu Interview oder Bericht (Teil 3/4)
  - Meinungen nur einmal hören (Teil 5)
- **Lösungen** im Text umschreiben, **Ablenker** mit Lockwörtern aus dem Text, Korrekturen am Ende, Verneinungen, Mengenwörter.
- **Themen aus der Berufswelt:** Ausbildung, Praktikum, Arbeitsplatz, Kunden, Termine. In der Spielwelt werden sie übertragen.
- **Schreib-Feedback** nach den Kriterien der Handreichung:
  - Textsorteneinbettung
  - Wiedergabe mit eigenen Worten
  - ausführliche Erfahrungen
  - begründete Meinung
  - komplexe Strukturen loben

## Urheberrecht

Modellsätze, Hör-Audios, Handreichungen und der SK-Reader sind geschützt. **Keine Originaltexte ins Spiel** und keine
offiziellen Prüfungsdateien ins Repository. Nur Formate und Muster nachbauen, alle Texte selbst schreiben.

## Technik und Ablauf

- Inhalte: `src/inhalte/*.js`, Karten: `src/welt/*.js`, 3D: `src/grafik3d/*.js`. Die Aufgabentypen stehen in `src/ui/aufgaben.js`, die Anleitung in `docs/inhalte.md`.
- Neue Quests in `src/inhalte/quests.js` eintragen (Lehrerzimmer, dazu der Prüfungsbezug in `DSD_BEZUG`), Ziele in `src/welt/ziele.js`, Sprungpunkte in `src/inhalte/sprungpunkte.js`.
- Sprungcodes stehen nur als SHA-256-Hash in `src/inhalte/codes.js`, die Klartext-Codes nie ins Repository.
- Vor dem Commit mit einem automatischen Playwright-Durchlauf testen (Sprungpunkt setzen, Objekte benutzen, Aufgaben lösen).
- Keine Modellbezeichnungen in Commits, Code oder Doku.
