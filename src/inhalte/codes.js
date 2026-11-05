// Lehrercodes: Die Lehrkraft verteilt Codes für Leistungen im Unterricht
// (Teamarbeit, mündliche Beiträge, korrigierte Texte, ...).
//
// Hier stehen nur die SHA-256-Prüfsummen der Codes, nicht die Codes selbst.
// Neue Codes erzeugt man mit tools/lehrercodes.html und fügt die
// erzeugten Zeilen unten ein.
//
// Hinweis: Jeder Code kann pro Gerät nur einmal eingelöst werden.
// Auf einem anderen Gerät funktioniert derselbe Code noch einmal –
// deshalb Codes am besten einzeln an Personen ausgeben.
//
// Format:  "<sha256 des Codes>": { xp: <Zahl>, grund: "<Text>", gegenstand?: "<id>" },

export const CODES = {
  // Testcode zum Ausprobieren: ELD-TEST-0001 (10 XP). Vor dem Einsatz in der Klasse löschen.
  "76ef454736d5b0e005fa6c1dd0a07464414434e6982299236a1ce9bff1044d75": { xp: 10, grund: "Testcode" },
};
