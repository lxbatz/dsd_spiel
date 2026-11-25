// Stellen zum Ansehen in allen Reichen: kurze, bildhafte Texte an Dingen der Spielwelt.
// Sie bringen die Quests nicht weiter, aber sie erzählen von der Welt – kleine Leseanlässe nebenbei.
// Sprache: A2, kurze Sätze, gern poetisch. Gibt es mehrere Texte, kommt bei jedem Besuch der nächste.
// jeNach(flag, vorher, nachher): andere Texte, sobald ein Reich gerettet ist.
//
// Die Stellen liegen unsichtbar auf Deko, die im Raster ohnehin gesperrt ist (Baum, Säule, Fels …),
// darum stehen hier Kachelkoordinaten aus den Layout-Dateien. Vorhandene Objekte ohne eigene Quest
// (Marktstand, Amboss …) bekommen ihre Texte über TEXTE_OBJEKTE.

import { stelle, jeNach } from "../welt/stellen.js";
import { LAYOUT } from "../welt/inseln_layout.js";

// ---------- Lythara: Die Inseln der Stimmen ----------

const ins = LAYOUT.orte;
const deko = (insel, zeichen) => ins[insel].deko.filter(([z]) => z === zeichen).map(([, x, y]) => [x, y]);
const ecke = (liste) => [Math.min(...liste.map(([x]) => x)), Math.min(...liste.map(([, y]) => y))];
const [quelleX, quelleY] = ecke(deko("q2", "w"));
const [baumX, baumY] = ecke(deko("q3", "T").slice(0, 4));
const [waageX, waageY] = ecke(deko("q4", "S"));
const [planetX, planetY] = ecke(deko("q5", "O"));
const [fernrohrX, fernrohrY] = deko("q5", "F")[0];

const INSELN = [
  // Ankunft
  stelle({ id: "st_ankunft_laterne", name: "Laterne", x: 27, y: 84, texte: [
    "In der Laterne tanzt ein kleines Licht. Es brennt ohne Öl und ohne Holz. Vielleicht brennt es mit Worten?",
    "Auf dem Glas steht in alter Schrift: „Wer schreibt, macht Licht für andere.“",
  ] }),
  stelle({ id: "st_ankunft_rand", name: "Rand der Insel", x: 17, y: 86, hinweis: "Über den Rand schauen", texte: [
    "Du schaust über den Rand. Tief unten liegt ein Meer aus Wolken. Dir wird ein bisschen schwindelig.",
    "Ein warmer Wind kommt von unten herauf. Er riecht nach Regen und nach Papier.",
  ] }),
  stelle({ id: "st_ankunft_stein", name: "Moosiger Stein", x: 28, y: 89, texte:
    "Jemand hat Buchstaben in den Stein geritzt: „L. war hier. Heute habe ich meinen ersten Brief geschrieben.“ Du lächelst." }),

  // Insel der Echos
  stelle({ id: "st_quelle", name: "Quelle der Echos", x: quelleX, y: quelleY, breite: 3, hoehe: 3, hinweis: "In die Quelle schauen", kopfY: 0.4, texte: [
    "Das Wasser ist ganz still. Du flüsterst deinen Namen. Die Quelle flüstert ihn dreimal zurück, jedes Mal ein bisschen leiser.",
    "Im Wasser siehst du nicht dein Gesicht, sondern Wörter. Sie schwimmen wie kleine Fische. Wenn du sie fangen willst, sind sie weg.",
    "Du trinkst einen Schluck. Das Wasser ist kühl und schmeckt ein bisschen nach Minze. Plötzlich verstehst du, was die Wellen erzählen.",
  ] }),
  stelle({ id: "st_wasserfall", name: "Am Wasserfall", x: 9, y: 67, hinweis: "Dem Wasserfall nachsehen", texte:
    "Das Wasser fällt über die Kante in die Wolken. Niemand weiß, wo es ankommt. Vielleicht regnet es irgendwo auf eine Stadt, und die Menschen dort haben plötzlich gute Ideen." }),
  stelle({ id: "st_echostein", name: "Echo-Stein", x: 18, y: 66, hinweis: "An den Stein klopfen", texte:
    "Du klopfst an den Stein. Er antwortet mit einem tiefen Ton: „Hallo … allo … llo …“" }),

  // Insel der Erinnerungen
  stelle({ id: "st_baum", name: "Baum der Erinnerungen", x: baumX, y: baumY, breite: 2, hoehe: 2, kopfY: 3, weit: 3.5, texte: [
    "Der Baum zeigt dir Bilder aus deiner Vergangenheit. Du hältst kurz inne und denkst über dein bisheriges Leben nach.",
    "Ein rotes Blatt fällt auf deine Hand. Darauf ist ein Bild: dein erster Schultag. Du warst nervös, aber auch neugierig.",
    "In den Ästen schweben Bilder: eine Werkstatt, eine Küche, ein Büro. Das sind die Erinnerungen von Menschen, die vor dir hier waren. Bald hängt hier vielleicht auch eine von dir.",
  ] }),
  stelle({ id: "st_junger_baum", name: "Junger Baum", x: 37, y: 47, texte:
    "Dieser Baum ist noch klein und hat erst wenige Blätter. „Ich warte auf neue Erinnerungen“, scheint er zu sagen." }),
  stelle({ id: "st_alter_baum", name: "Alter Baum", x: 27, y: 52, texte:
    "In die Rinde hat jemand geschrieben: „Hier habe ich an meine Oma gedacht. Sie hat mir das Lesen beigebracht.“" }),
  stelle({ id: "st_erinnerungslaterne", name: "Laterne", x: 28, y: 46, texte: [
    "Das Licht in der Laterne ist warm und golden – wie ein Sommernachmittag, den man nie vergisst.",
    "Wenn du lange ins Licht schaust, hörst du ein Lachen. Es kommt aus einer anderen Zeit.",
  ] }),

  // Insel der Waage
  stelle({ id: "st_waage", name: "Die große Waage", x: waageX, y: waageY, breite: 2, hoehe: 2, kopfY: 3.2, weit: 4, texte: [
    "Die Waage ist riesig. In der einen Schale leuchtet ein grünes Licht, in der anderen ein weißes. Beide wiegen nichts – und trotzdem bewegt sich die Waage. Hier zählt nicht das Gewicht, sondern das Argument.",
    "Du legst ein Wort in die linke Schale: „dafür“. Die Waage sinkt. Dann legst du „dagegen“ in die rechte Schale. Langsam kommt sie wieder ins Gleichgewicht.",
    "Auf dem Fuß der Waage steht: „Eine Meinung ohne Grund ist leicht wie Luft.“",
  ] }),
  stelle({ id: "st_saeule1", name: "Säule mit Inschrift", x: 24, y: 29, hinweis: "Die Inschrift lesen", kopfY: 2.5, texte:
    "In die Säule ist ein Satz gemeißelt: „Höre beide Seiten, bevor du urteilst.“" }),
  stelle({ id: "st_saeule2", name: "Säule mit Inschrift", x: 21, y: 32, hinweis: "Die Inschrift lesen", kopfY: 2.5, texte:
    "„Zwar ist der Weg lang, aber er lohnt sich.“ Darunter hat jemand mit Kreide geschrieben: „Stimmt!“" }),
  stelle({ id: "st_saeule3", name: "Leere Säule", x: 13, y: 32, kopfY: 2.5, texte:
    "Auf dieser Säule steht noch nichts. Sie wartet auf einen klugen Satz. Vielleicht auf deinen?" }),

  // Insel des Siegels
  stelle({ id: "st_planeten", name: "Planetenmodell", x: planetX, y: planetY, breite: 2, kopfY: 1.9, texte: [
    "Kleine Planeten kreisen langsam um eine goldene Sonne. Sie machen ein leises Geräusch, wie eine Spieluhr.",
    "Du tippst einen Planeten an. Er dreht sich schneller, und alle anderen folgen ihm. Alles hängt zusammen – wie die Sätze in einem guten Text.",
    "Du zählst die Planeten. Einer fehlt. Auf seinem Platz steht ein winziges Schild: „Hier kommt Eldoria hin, wenn das Sprachsiegel wieder ganz ist.“",
  ] }),
  stelle({ id: "st_fernrohr", name: "Fernrohr", x: fernrohrX, y: fernrohrY, hinweis: "Durch das Fernrohr schauen", kopfY: 2, texte: [
    "Du schaust durch das Fernrohr. Ganz weit weg siehst du das Dorf der Ankömmlinge. Jemand winkt.",
    "Im Fernrohr sind die Sterne ganz nah. Sie bilden Buchstaben: A … B … C … Der Himmel lernt auch noch.",
  ] }),
];

// ---------- Das Dorf der Ankömmlinge ----------

const DORF = [
  stelle({ id: "st_teich", name: "Teich", x: 22, y: 11, breite: 4, hoehe: 6, hinweis: "In den Teich schauen", kopfY: 0.3, texte: [
    "Im Teich schwimmen kleine Fische. Wenn dein Schatten auf das Wasser fällt, verstecken sie sich unter den Blättern.",
    "Ein Frosch sitzt am Ufer und schaut dich an. „Quak“, sagt er. Du glaubst, er meint: „Viel Glück auf deiner Reise!“",
  ] }),
  stelle({ id: "st_ratshaus", name: "Tür des Ratshauses", x: 14, y: 4, hinweis: "Das Schild lesen", texte:
    "Über der Tür hängt ein Schild: „Rat der Ankömmlinge – Hier ist jeder willkommen.“ Drinnen hört man leise Stimmen." }),
  stelle({ id: "st_haus", name: "Kleines Haus", x: 6, y: 4, hinweis: "Das Haus ansehen", texte:
    "Die Tür ist zu. Vor dem Fenster stehen Blumen in alten Teekannen. Aus dem Schornstein steigt Rauch – drinnen kocht jemand Suppe." }),
  stelle({ id: "st_eiche", name: "Alte Eiche", x: 9, y: 17, kopfY: 2.5, texte:
    "Die Eiche ist älter als das Dorf. In ihrer Rinde stehen viele Namen. Ganz unten steht klein: „Ich komme wieder. – Lyra“" }),
  stelle({ id: "st_linde", name: "Linde", x: 20, y: 17, kopfY: 2.5, texte:
    "Unter der Linde ist es kühl. Ein Zettel hängt am Stamm: „Wer hat meine Brille gesehen? Bitte zum Ratshaus bringen. Danke! – Aldric“" }),
];

// ---------- Lythara: Der Turm der Tausend Treppen ----------

const TREPPENTURM = [
  // Keller
  stelle({ id: "st_tintenfaesser", name: "Alte Fässer", x: 7, y: 69, breite: 2, hoehe: 2, texte:
    "In den Fässern ist kein Wein, sondern Tinte. Es riecht nach Eisen und alten Briefen." }),
  stelle({ id: "st_kellerregal", name: "Regal im Keller", x: 7, y: 72, hoehe: 3, texte:
    "Auf dem Regal stehen Gläser mit Etiketten: „Komma“, „Punkt“, „Fragezeichen“. In einem Glas hüpft ein Ausrufezeichen hin und her!" }),
  // Kammern des Gesindes
  stelle({ id: "st_schmales_bett", name: "Schmales Bett", x: 7, y: 56, breite: 3, texte:
    "Das Bett ist schmal und hart. Unter dem Kissen liegt ein Zettel: „Morgen um fünf aufstehen. Brot backen. Nicht vergessen: Mama schreiben!“" }),
  stelle({ id: "st_kuechentisch", name: "Küchentisch", x: 19, y: 57, breite: 3, hoehe: 2, texte:
    "Auf dem Tisch stehen vier Becher und ein Teller mit Krümeln. Hier haben die Diener nach der Arbeit zusammen gegessen und gelacht." }),
  // Waffenkammer der Ritter
  stelle({ id: "st_ruestung", name: "Rüstung", x: 9, y: 47, kopfY: 1.8, texte: [
    "Die Rüstung ist leer. Trotzdem hast du das Gefühl, dass sie dich ansieht.",
    "Auf dem Brustpanzer steht: „Das Wort ist stärker als das Schwert.“",
  ] }),
  stelle({ id: "st_waffenamboss", name: "Kleiner Amboss", x: 19, y: 44, texte:
    "Hier hat der Waffenschmied der Ritter gearbeitet. Neben dem Amboss liegt ein Schwert – aus Holz. Wahrscheinlich war es für ein Kind." }),
  // Bankettsaal
  stelle({ id: "st_tafel", name: "Lange Tafel", x: 8, y: 30, breite: 2, hoehe: 5, texte: [
    "Die lange Tafel ist für ein Fest gedeckt. Aber die Teller sind leer und die Kerzen sind aus. Die Gäste kommen wohl nie mehr.",
    "Auf jedem Platz liegt eine Karte mit einem Namen. Auf einer Karte steht nur: „Ehrengast“. Ob du gemeint bist?",
  ] }),
  // Gemächer der Burgherren
  stelle({ id: "st_himmelbett", name: "Himmelbett", x: 7, y: 17, breite: 3, hoehe: 3, texte:
    "Ein großes Bett mit roten Vorhängen. Auf dem Nachttisch liegt ein Tagebuch. Die letzte Seite ist leer – als ob die Geschichte noch nicht fertig ist." }),
  stelle({ id: "st_kleiderschrank", name: "Kleiderschrank", x: 21, y: 17, breite: 2, texte:
    "Im Schrank hängen schöne Kleider aus Samt. Ganz hinten hängt ein einfacher Mantel mit vielen Flicken. Vielleicht war das der Lieblingsmantel." }),
  // Observatorium
  stelle({ id: "st_globus", name: "Himmelsglobus", x: 8, y: 2, breite: 2, hoehe: 2, texte:
    "Auf dem Globus sind keine Länder, sondern Sternbilder: die Glocke, das Buch, die Feder und die Stimme. Die vier Reiche stehen sogar am Himmel." }),
  stelle({ id: "st_grosses_fernrohr", name: "Großes Fernrohr", x: 19, y: 2, breite: 3, hoehe: 3, hinweis: "Durch das Fernrohr schauen", texte:
    "Du schaust durch das große Fernrohr. Über den Wolken schweben Inseln. Auf einer steht ein Baum mit goldenen Blättern." }),
];

// ---------- Aurelia: Die Hafenstadt der Glocken ----------

const A = "aurelia_finale";
const AURELIA = [
  stelle({ id: "st_leuchtturm", name: "Leuchtturm", x: 44, y: 16, breite: 2, hoehe: 2, kopfY: 4, weit: 4, texte: jeNach(A,
    "Das Licht des Leuchtturms ist aus. Draußen auf dem schwarzen Meer finden die Schiffe den Weg nicht.",
    "Das Licht des Leuchtturms dreht sich ruhig über das Meer. Heute findet jedes Schiff den Weg nach Hause.") }),
  stelle({ id: "st_olivenbaum", name: "Olivenbaum", x: 12, y: 13, kopfY: 2, texte: jeNach(A,
    "Der Olivenbaum ist grau und still. Kein Vogel singt in seinen Zweigen.",
    ["In den Zweigen singen die Zikaden. Unter dem Baum liegen reife Oliven.", "Ein Spatz sitzt im Baum und schimpft. Du hast ihn beim Mittagessen gestört."]) }),
  stelle({ id: "st_alter_olivenbaum", name: "Alter Olivenbaum", x: 13, y: 19, kopfY: 2, texte:
    "Dieser Olivenbaum ist sehr alt. Sein Stamm ist krumm wie ein Fragezeichen. Er hat schon viele Fragen gehört." }),
  stelle({ id: "st_saeule_gesetz", name: "Säule der Agora", x: 15, y: 11, hinweis: "Die Inschrift lesen", kopfY: 2.5, texte:
    "In die Säule sind Wörter gemeißelt: „Hör zu. Frag nach. Dann antworte.“ Das ist das älteste Gesetz von Aurelia." }),
  stelle({ id: "st_saeule_zettel", name: "Säule mit Zettel", x: 27, y: 11, hinweis: "Den Zettel lesen", kopfY: 1.8, texte: jeNach(A,
    "Der Zettel ist nass und grau. Man kann nur noch ein Wort lesen: „… gesucht“.",
    "Ein Zettel klebt an der Säule: „Suche Arbeit am Hafen. Ich kann gut zuhören und schwer tragen. Fragt nach Pelagios im Fischerhaus.“") }),
  stelle({ id: "st_zypresse", name: "Zypresse", x: 16, y: 3, kopfY: 2.5, texte: jeNach(A,
    "Der Wind ist kalt. Die Zypresse beugt sich, als ob sie Angst hat.",
    "Die Zypresse steht gerade und ruhig. Von hier oben siehst du das blaue Meer und die weißen Segel.") }),
];

// ---------- Scriptoria: Das Reich der Tausend Bücher ----------

const S = "scriptoria_finale";
const SCRIPTORIA = [
  stelle({ id: "st_lesebaum", name: "Der Große Lesebaum", x: 20, y: 19, breite: 4, hoehe: 4, kopfY: 4, weit: 5, texte: (z) => [
    "Der Große Lesebaum ist so hoch, dass du seine Spitze nicht siehst. In seiner Rinde wachsen Buchstaben wie Moos.",
    z.erledigt[S]
      ? "Die Sonne scheint durch die Blätter. Jedes Blatt ist eine Buchseite, und der Wind blättert langsam darin."
      : "Zwischen den Wurzeln leuchten kleine Pilze. Sie sind die Leselampen des Waldes.",
  ] }),
  stelle({ id: "st_regal_wald", name: "Bücherregal im Wald", x: 4, y: 11, breite: 3, texte: [
    "Mitten im Wald steht ein Regal voller Bücher. Ein Buch heißt: „Wie man einen Drachen höflich begrüßt“.",
    "Zwischen den Büchern hat ein Vogel ein Nest gebaut. Es ist aus alten Buchseiten gemacht.",
  ] }),
  stelle({ id: "st_regal_pfad", name: "Bücherregal", x: 17, y: 11, breite: 3, texte:
    "Auf dem Regal stehen Kochbücher, Reiseführer und ein Wörterbuch. Das Wörterbuch ist ganz dick und hat viele bunte Zettel." }),
  stelle({ id: "st_regal_praktikum", name: "Bücherregal", x: 25, y: 11, breite: 3, texte:
    "Hier steht ein Buch mit dem Titel „Mein erster Tag im Praktikum“. Viele Seiten haben Eselsohren. Es wurde sehr oft gelesen." }),
  stelle({ id: "st_riesenpilz", name: "Riesenpilz", x: 11, y: 7, kopfY: 1.5, texte: jeNach(S,
    "Der Pilz leuchtet blau in der Dunkelheit. Wenn du ihn berührst, wird das Licht heller.",
    "Am Tag leuchtet der Pilz nicht. Dafür sitzt ein Eichhörnchen darauf und liest. Jedenfalls sieht es so aus.") }),
  stelle({ id: "st_pilz", name: "Pilz am Weg", x: 30, y: 19, kopfY: 1.5, texte:
    "Auf dem Pilz klebt ein Schild: „Nicht essen! Das ist ein Lesepilz.“" }),
];

// ---------- Vocantia: Das Bergdorf im Schweigen ----------

const V = "vocantia_finale";
const VOCANTIA = [
  stelle({ id: "st_see", name: "Gefrorener See", x: 35, y: 29, breite: 4, hinweis: "Auf den See schauen", kopfY: 0.3, texte: jeNach(V,
    ["Der See ist zugefroren. Unter dem Eis siehst du Luftblasen. Sie sehen aus wie Wörter, die niemand gesagt hat.",
      "Du rufst über das Eis. Aber kein Echo kommt zurück. Sogar der See schweigt."],
    "Das Eis ist dünn geworden. Kinder rufen am Ufer, und der See antwortet mit hellem Knacken. Bald kann man hier wieder schwimmen.") }),
  stelle({ id: "st_fels_pfad", name: "Fels am Bergpfad", x: 17, y: 6, kopfY: 1.5, texte: jeNach(V,
    "Ein eiskalter Wind pfeift über den Pfad. Er klingt fast wie eine Stimme, aber er sagt kein Wort.",
    "Jemand hat mit roter Farbe auf den Fels geschrieben: „Wir haben unsere Stimmen wieder!“") }),
  stelle({ id: "st_weide", name: "Weidezaun", x: 4, y: 34, breite: 7, hoehe: 3, texte: jeNach(V,
    "Hinter dem Zaun stehen Schafe. Ihre Wolle ist voller Eiskristalle. Sie blöken nicht – sie schweigen wie alle hier.",
    "Die Schafe blöken laut und fröhlich. Ein Lamm springt über den Schnee und fällt auf den Po.") }),
];

// ---------- Die Feste Schattenzahn ----------

const F = "schattenzahn_finale";
const SCHATTENZAHN = [
  // Vorhof
  stelle({ id: "st_lagerfeuer", name: "Lagerfeuer", x: 19, y: 82, breite: 2, hoehe: 2, kopfY: 0.6, texte: jeNach(F,
    "Am Feuer liegen Knochen und ein kaputter Topf. Hier haben die Goblins gegessen. Es riecht nicht gut.",
    "Über dem Feuer brutzeln Würstchen. Ein Goblin kommt herüber und hält dir eins hin: „Hier. Für dich. Danke.“ Die Goblins lernen schnell.") }),
  stelle({ id: "st_goblinkiste", name: "Kiste der Goblins", x: 6, y: 73, breite: 2, hoehe: 2, hinweis: "In die Kiste schauen", texte:
    "In der Kiste liegen alte Helme, ein Löffel und ein Liebesbrief. Der Brief hat viele Rechtschreibfehler, aber er ist sehr romantisch." }),
  stelle({ id: "st_vulkanstein", name: "Schwarzer Fels", x: 9, y: 78, kopfY: 1, texte: jeNach(F,
    "Der Fels ist aus Vulkanstein, schwarz und voller kleiner Löcher. Wenn du ihn berührst, ist er warm.",
    "Der Vulkanstein ist jetzt kalt. Der Vulkan schläft – hoffentlich für immer.") }),
  // Dungeon des Hörens
  stelle({ id: "st_zelle1", name: "Leere Zelle", x: 10, y: 54, breite: 3, hoehe: 3, hinweis: "In die Zelle schauen", texte:
    "Die Tür der Zelle steht offen. An der Wand sind viele Striche: Jemand hat hier die Tage gezählt." }),
  stelle({ id: "st_zelle2", name: "Zelle mit Flöte", x: 27, y: 59, breite: 3, hoehe: 3, hinweis: "In die Zelle schauen", texte:
    "In der Zelle liegt eine kleine Flöte. Wer hier saß, hat Musik gemacht – damit die Stille nicht so laut ist." }),
  // Katakomben des Lesens
  stelle({ id: "st_nische", name: "Knochennische", x: 9, y: 40, hoehe: 6, texte:
    "In der Nische liegen alte Knochen und Bücher ohne Buchstaben. Morgrath hat ihnen die Wörter gestohlen." }),
  // Grotte der Schreiber
  stelle({ id: "st_pult_brief", name: "Altes Schreibpult", x: 11, y: 25, breite: 2, texte:
    "Auf dem Pult liegt ein Brief. Die Tinte ist verwischt. Du kannst nur ein Wort lesen: „Hilfe“." }),
  stelle({ id: "st_pult_feder", name: "Schreibpult", x: 26, y: 29, breite: 2, texte:
    "Auf diesem Pult liegt eine zerbrochene Feder. Hier durfte niemand schreiben, was er wirklich denkt." }),
  // Kaverne der Stimmen
  stelle({ id: "st_stalagmit", name: "Heißer Stein", x: 10, y: 10, kopfY: 1, texte:
    "Der Stein ist heiß. In der Ferne blubbert die Lava. Hier unten hört man kein einziges Wort – nur das Feuer." }),
];

/** Stellen je Karte (ID der Karte → Liste von Objekten) */
export const STELLEN = {
  turm: INSELN,
  dorf: DORF,
  treppenturm: TREPPENTURM,
  aurelia: AURELIA,
  scriptoria: SCRIPTORIA,
  vocantia: VOCANTIA,
  schattenzahn: SCHATTENZAHN,
};

/** Texte für vorhandene Objekte ohne eigene Aufgabe (Karte → Objekt-ID → { hinweis, texte }) */
export const TEXTE_OBJEKTE = {
  dorf: {
    stand: { name: "Marktstand", hinweis: "Den Marktstand ansehen", texte: [
      "Auf dem Stand liegen rote Äpfel, frisches Brot und ein Stück Käse. Es riecht so gut, dass dein Bauch knurrt.",
      "Ein kleines Schild: „Heute frisch: Honig aus dem Dorf. Bitte nicht probieren, ohne zu fragen! – Wilma“",
    ] },
    amboss: { name: "Amboss", hinweis: "Den Amboss ansehen", texte: [
      "Der Amboss ist schwer und schwarz. Er ist noch warm. Hier hat Borin heute schon gearbeitet.",
      "Im Eisen sind viele kleine Dellen. Jede Delle ist ein Hammerschlag. Borin sagt immer: „Übung macht den Meister.“",
    ] },
  },
  scriptoria: {
    lehrlingshaus: { name: "Lehrlingshaus", hinweis: "Das Baumhaus ansehen", texte:
      "Ein Haus hoch oben im Baum. Aus dem Fenster hängt eine Leine mit bunten Socken. Hier wohnen die Lehrlinge der Bibliothek." },
  },
  vocantia: {
    marktstand: { name: "Marktstand", hinweis: "Den Marktstand ansehen", texte: jeNach(V,
      "Der Marktstand ist mit Eis bedeckt. Unter dem Eis siehst du Äpfel und Wollmützen. Niemand verkauft etwas, denn niemand spricht.",
      "Am Stand gibt es warme Mützen, Honigkuchen und heißen Tee. Die Händlerin ruft: „Frisch! Warm! Lecker!“") },
    amboss: { name: "Amboss", hinweis: "Den Amboss ansehen", texte: jeNach(V,
      "Der Hammer liegt noch auf dem Amboss. Er ist am Eis festgefroren.",
      "Der Amboss ist warm. Aus der Langhalle hört man Hammerschläge und Lachen.") },
    ratsfeuer: { name: "Ratsfeuer", hinweis: "Das Ratsfeuer ansehen", texte: jeNach(V,
      "Das Ratsfeuer ist aus. Im Kreis liegt nur kalte, graue Asche. Hier haben die Menschen früher zusammen geredet.",
      "Das Ratsfeuer brennt wieder. Die Funken fliegen hoch in den Himmel – wie Wörter, die endlich frei sind.") },
    buehne: { name: "Bühne am See", hinweis: "Die Bühne ansehen", texte: jeNach(V,
      "Auf der Bühne liegt Schnee. In der Mitte steht ein leerer Notenständer. Seit Monaten hat hier niemand gesungen.",
      "Auf der Bühne liegen Blumen. Gestern Abend hat hier ein Kinderchor gesungen, und alle haben geklatscht.") },
  },
};
