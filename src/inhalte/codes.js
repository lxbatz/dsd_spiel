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
//
// Sprungcodes (nur für Lehrkräfte): { sprung: "<id aus sprungpunkte.js>" } springt an eine Stelle
// im Spiel, { sprung: "menue" } zeigt eine Liste aller Stellen. Sie können beliebig oft benutzt
// werden; der Spielstand wird dabei als Testspielstand markiert. Die Codes selbst stehen nicht im
// Repository – die Lehrkraft hat die Liste.

export const CODES = {
  // Testcode zum Ausprobieren: ELD-TEST-0001 (10 XP). Vor dem Einsatz in der Klasse löschen.
  "76ef454736d5b0e005fa6c1dd0a07464414434e6982299236a1ce9bff1044d75": { xp: 10, grund: "Testcode" },
  // Sprungcodes für Lehrkräfte
  "01517cac2340b3b1368f25a66f0ac1a2b3a22543624c6f8ad0b8d60b8327e5c2": { sprung: "menue", grund: "Sprungmenü (alle Stellen)" },
  "a2806dc4d8bf04d3b726c166a491784274df3a281247843c6f875b39bf34737e": { sprung: "dorf", grund: "Sprungcode" },
  "9473bbcbb4a2b49b2182dc62732ec94e578f7f77d2dd118a5e10489600dab831": { sprung: "dorf_quests", grund: "Sprungcode" },
  "271990997bf4ef6695d67858cde5bf74fca3a2113ee70560a3bcefd01d068e82": { sprung: "dorf_ende", grund: "Sprungcode" },
  "a2b89d7ef24623e60cb210db155ccf018e90103aa7e0b4afa0cad04198fb0601": { sprung: "halle", grund: "Sprungcode" },
  "258a727bb24ba09edefd569a72c7fee6801c3452b7ba1d955386d0faef810544": { sprung: "halle_tore", grund: "Sprungcode" },
  "d6482dcd20580e23dd768a8dd7db79a9c054c6d2b78459a6a62a1e697f02cc22": { sprung: "halle_pult", grund: "Sprungcode" },
  "8188242dce06d0f7d65932d9b98cefaec2c26033c89dcf0bd528e6cd7d77ae3d": { sprung: "halle_boss", grund: "Sprungcode" },
  "fcb09d85dd34cad93db701119479f3cf529fd52a6f298d82fcd4abfc0d39d9ac": { sprung: "kammern", grund: "Sprungcode" },
  "56608d52c3a3b03f5afc61a024eb505e1d5fb5a392cb94cc2385462844f536a6": { sprung: "q2_anfang", grund: "Sprungcode" },
  "9fcc384c76799fcbbd850da9c4d330f48dec2ef61dbfed0866504965172770f4": { sprung: "q2_waechter", grund: "Sprungcode" },
  "33d4a52d533f007a44b1f39bbc5017cdfe2bbca85499203b4e644c7df48bff9b": { sprung: "q3_anfang", grund: "Sprungcode" },
  "86595e46bf7883f2a45abb7442691b9efa67dfbf0af062591758f19139337c1e": { sprung: "q3_waechter", grund: "Sprungcode" },
  "cfd3cb4a897b67f857526d473df6503fe2eb8c6b012a61e6a431936b772ed273": { sprung: "q4_anfang", grund: "Sprungcode" },
  "77d2077b9034062fb0f9ed734661c2a5e1da274fcb55325c83b3f4c49dbe5a55": { sprung: "q4_waechter", grund: "Sprungcode" },
  "2e76257fea76f4f85673d6b79b7c880e2e92dda120e0150c7fb977c9544aa189": { sprung: "q5_anfang", grund: "Sprungcode" },
  "2d00579a15392ec19670296a45ec59c7bb3a7977ad2bbb08eaaa35b8f84e6bea": { sprung: "q5_waechter", grund: "Sprungcode" },
  "685a3aebdae4dd460d23fde55d1f013868fbdf6b7d87f905ea8d5075ac8471e7": { sprung: "buch", grund: "Sprungcode" },
  "0312929b9db869d081416847de7c8b1295f332280d129935a6dfd399fcede861": { sprung: "ende", grund: "Sprungcode" },
  "77983742c7a038f0ca6f01bbbaf973c03897bc22e629e246324ceeb64141260a": { sprung: "dorf_neben", grund: "Sprungcode" },
  "0c130a3f7946e986ecdc0cad78de18af9d41e5589d910402d5ef1e2175c57c79": { sprung: "aurelia", grund: "Sprungcode" },
  "adbc8ce12c8b6171cf51e10aa13ac052def8854035e999bc292642f20f582911": { sprung: "aurelia_q1", grund: "Sprungcode" },
  "54d6a07071745f50a9b4031e82fe303295321bf17d80e03db35909db0afecb78": { sprung: "aurelia_q1_ende", grund: "Sprungcode" },
  "041cbc829b90705070a0172d0a98fe8cef74c38f0014cc7049cb9fedd88739b9": { sprung: "aurelia_q2", grund: "Sprungcode" },
  "14aef49c95793a96244f6d7f808fd7a6c5f2a5e7d5ec142c7fb229bdd44deb7c": { sprung: "aurelia_q2_ende", grund: "Sprungcode" },
  "ac609de4c14d8835666f488cc85a5fbb88929a9ca9cb8f086093fd501112f58c": { sprung: "aurelia_q3", grund: "Sprungcode" },
  "0ac32648f20417b0e3604e0ce689d1fcd9c01ddc6991a9251c62ab96a1c58c1a": { sprung: "aurelia_q3_ende", grund: "Sprungcode" },
  "31ed9e0f0c7323b24ac2c8223bfda842b0841f9df69910c929854f264c189207": { sprung: "aurelia_q4", grund: "Sprungcode" },
  "49d4b232beb168cec753caa0eab13bc28eafbe12e479c072b2d0925779796ab0": { sprung: "aurelia_q4_ende", grund: "Sprungcode" },
};
