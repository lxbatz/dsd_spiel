# Inhalte anlegen und ändern

Alle Lerninhalte liegen in `src/inhalte/`. Für neue Aufgaben muss man nichts am Spielcode ändern.

| Datei | Inhalt |
|---|---|
| `texte.js` | Lesetexte (Steckbrief, Aushang, Forumsbeitrag …) |
| `dorf.js` | Aufgaben im Dorf der Ankömmlinge |
| `lythara_q1.js` | Lythara Quest 1: die fünf Tore, die Einleitung am Pult, der Torwächter |
| `gegenstaende.js` | Gegenstände und ihre Wirkung |
| `codes.js` | Lehrercodes (nur Prüfsummen, siehe `tools/lehrercodes.html`) |
| `klassen.js` | Heldenklassen im Heldenpass |

Die Dialoge der Figuren stehen in `src/welt/dorf.js` und `src/welt/halle.js`.

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
}
```
`such` ist ein regulärer Ausdruck (Groß-/Kleinschreibung egal). Freie Texte werden nicht bewertet: Die Schülerin/der Schüler muss die Mindestwortzahl erreichen und den Selbstcheck abhaken. Die Lehrkraft liest den Text im Heldenpass und vergibt ggf. einen Lehrercode.

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
| Lehrercodes | je nach Code (Teamarbeit 20, mündlicher Beitrag 10 …) |

Die Stufen stehen in `src/zustand.js` (`STUFEN`).
