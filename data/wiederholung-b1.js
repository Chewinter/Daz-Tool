/* Grammatik-Wiederholung B1 (Abschlusstest, 10 Blöcke, 258 Aufgaben). Erzeugt von gen_wiederholung_b1.py aus
   daten_quelle/wiederholungstest_b1.md — hier nicht von Hand ändern. */
const WDH_B1_THEMEN = [
 {
  "kz": "S1",
  "name": "Genus der Nomen",
  "merksatz": "Endungen verraten oft das Genus: -heit, -keit, -ung, -ion sind die; -chen, -lein, -um sind das; -er (Berufe), Jahreszeiten, Monate, Tage sind der.",
  "anzahl": 8,
  "seite": "109",
  "klein": false
 },
 {
  "kz": "S2",
  "name": "Artikelwörter, Zählwörter",
  "merksatz": "kein/jeder/welcher/dieser/alle/viele richtig einsetzen; bei Mengen ein Zählwort (Flasche, Packung, Dose, Kilo). Zählwörter im Buch: ein wenig, wenige, einige, ein paar, manche, viele, mehrere, alle.",
  "anzahl": 8,
  "seite": "110",
  "klein": false
 },
 {
  "kz": "S3",
  "name": "Possessivartikel",
  "merksatz": "mein, dein, sein, ihr, unser, euer, ihr, Ihr; Endung wie beim unbestimmten Artikel („ein“-Endungen).",
  "anzahl": 8,
  "seite": "111",
  "klein": false
 },
 {
  "kz": "S4",
  "name": "Plural",
  "merksatz": "Pluralendungen: -e, -¨e, -er, -¨er, -n, -en, -s, keine; Plural im Wörterbuch nachsehen. Auch nur Umlaut (der Bruder – die Brüder) und -nen (die Freundin – die Freundinnen).",
  "anzahl": 6,
  "seite": "111",
  "klein": false
 },
 {
  "kz": "S5",
  "name": "Adjektivdeklination",
  "merksatz": "Adjektiv vor dem Nomen bekommt eine Endung: nach dem bestimmten Artikel -e/-en, nach ein-/kein-/mein- zeigt das Adjektiv das fehlende Signal (-er, -es, -e).",
  "anzahl": 11,
  "seite": "112–113",
  "klein": false
 },
 {
  "kz": "S6",
  "name": "prädikativ/attributiv, Adjektive auf -er/-el",
  "merksatz": "Nach sein/werden/bleiben und bei schmecken/aussehen steht das Adjektiv ohne Endung. Bei teuer, sauer, dunkel fällt das e vor der Endung weg (ein teures Auto).",
  "anzahl": 6,
  "seite": "112–113",
  "klein": false
 },
 {
  "kz": "S7",
  "name": "Genitiv",
  "merksatz": "des/eines + Nomen auf -(e)s bei männlich und sächlich; der/einer bei weiblich und Plural. Bei Namen: Maries Haus; Namen auf -s, -ß, -x, -z bekommen nur ein Apostroph (Jonas’ Haus).",
  "anzahl": 6,
  "seite": "114",
  "klein": false
 },
 {
  "kz": "K1",
  "name": "Steigerung",
  "merksatz": "groß – größer – am größten; gern – lieber – am liebsten; gut – besser – am besten; viel – mehr – am meisten; so … wie, aber größer als.",
  "anzahl": 10,
  "seite": "125",
  "klein": false
 },
 {
  "kz": "P1",
  "name": "Personal- und Reflexivpronomen",
  "merksatz": "Akkusativ: mich, dich, ihn, sie, es, uns, euch, sie, Sie. Dativ: mir, dir, ihm, ihr, ihm, uns, euch, ihnen, Ihnen. Reflexiv: mich/mir, dich/dir, sich, uns, euch, sich.",
  "anzahl": 10,
  "seite": "114",
  "klein": false
 },
 {
  "kz": "N1",
  "name": "Verneinung",
  "merksatz": "kein verneint ein Nomen ohne Artikel oder mit „ein“; nicht verneint Verben, Adjektive, bestimmte Nomen; nie/niemals; „sondern“ nach Verneinung.",
  "anzahl": 9,
  "seite": "125",
  "klein": false
 },
 {
  "kz": "Z2",
  "name": "Fragesätze",
  "merksatz": "W-Frage: Fragewort + Verb an Position 2; Ja/Nein-Frage: Verb an Position 1; wo / woher / wohin unterscheiden.",
  "anzahl": 8,
  "seite": "122",
  "klein": false
 },
 {
  "kz": "V1",
  "name": "Verbtypen",
  "merksatz": "Modalverben stehen auf Position 2, der Infinitiv am Ende; trennbare Verben trennen sich im Hauptsatz; reflexive Verben brauchen sich.",
  "anzahl": 6,
  "seite": "115",
  "klein": false
 },
 {
  "kz": "V2",
  "name": "Präsens",
  "merksatz": "Vokalwechsel bei du/er/sie/es (fahren – fährst; lesen – liest; essen – isst); haben, sein, werden unregelmäßig.",
  "anzahl": 8,
  "seite": "116",
  "klein": false
 },
 {
  "kz": "V3",
  "name": "Futur",
  "merksatz": "werden + Infinitiv am Ende: Ich werde morgen kommen.",
  "anzahl": 4,
  "seite": "117",
  "klein": true
 },
 {
  "kz": "V4",
  "name": "Präteritum",
  "merksatz": "regelmäßig: -te; unregelmäßig: Stammwechsel (gehen – ging, lesen – las); sein/haben/Modalverben im Präteritum.",
  "anzahl": 9,
  "seite": "118",
  "klein": false
 },
 {
  "kz": "V5",
  "name": "Perfekt und Partizip II",
  "merksatz": "haben/sein + Partizip II am Ende; ge- vorn (gemacht), trennbar: ge- in der Mitte (aufgestanden), ohne ge- bei be-, ver-, ent-, er-. Bewegung/Zustandsänderung: sein. Ohne ge- auch bei Verben auf -ieren (präsentiert).",
  "anzahl": 10,
  "seite": "118–119",
  "klein": false
 },
 {
  "kz": "V6",
  "name": "Partizip I und II als Adjektiv",
  "merksatz": "Partizip I = Infinitiv + d (schlafend), gleichzeitig; Partizip II als Adjektiv (das geöffnete Fenster), abgeschlossen; beide bekommen Adjektivendungen.",
  "anzahl": 6,
  "seite": "119",
  "klein": true
 },
 {
  "kz": "V7",
  "name": "Imperativ",
  "merksatz": "du: Stamm (Geh! Lies! Gib!), ihr: Stamm + t (Geht!), Sie: Infinitiv + Sie (Gehen Sie!).",
  "anzahl": 8,
  "seite": "119",
  "klein": false
 },
 {
  "kz": "V8",
  "name": "Konjunktiv II",
  "merksatz": "wäre, hätte, würde + Infinitiv, könnte, sollte, müsste; Wunsch, höfliche Bitte, Ratschlag, irreale Bedingung („Wenn ich Zeit hätte, …“).",
  "anzahl": 11,
  "seite": "120",
  "klein": false
 },
 {
  "kz": "V9",
  "name": "Passiv",
  "merksatz": "werden + Partizip II am Ende; Präteritum: wurde/wurden; Perfekt: ist … worden; unpersönlich: Es wird getanzt / Hier wird gearbeitet; Handelnder mit „von“.",
  "anzahl": 13,
  "seite": "121",
  "klein": false
 },
 {
  "kz": "V10",
  "name": "Unregelmäßige Verben",
  "merksatz": "Infinitiv – Präteritum – Partizip II auswendig kennen (gehen – ging – gegangen).",
  "anzahl": 6,
  "seite": "128–129",
  "klein": false
 },
 {
  "kz": "Z1",
  "name": "Satzstellung",
  "merksatz": "Das konjugierte Verb steht im Hauptsatz auf Position 2; Dativ vor Akkusativ bei Nomen, Pronomen vor Nomen (Ich gebe es ihm); Trennbares: Präfix am Ende.",
  "anzahl": 8,
  "seite": "121",
  "klein": false
 },
 {
  "kz": "Z3",
  "name": "Haupt-/Nebensatz, Infinitivsatz",
  "merksatz": "Im Nebensatz steht das Verb am Ende; Infinitiv mit zu (zu machen, zuzumachen); um … zu für den Zweck.",
  "anzahl": 8,
  "seite": "123",
  "klein": false
 },
 {
  "kz": "Z4",
  "name": "Nebenordnende Konjunktionen, Adverbien",
  "merksatz": "und, oder, aber, denn, sondern: Position 0, kein Wechsel der Wortstellung. deshalb, darum, deswegen, trotzdem: Position 1, danach das Verb.",
  "anzahl": 8,
  "seite": "124",
  "klein": false
 },
 {
  "kz": "Z5",
  "name": "Unterordnende Konjunktionen",
  "merksatz": "weil, da, dass, ob, wenn, als, während, bis, bevor, obwohl, sodass/so … dass: Verb am Ende.",
  "anzahl": 12,
  "seite": "124",
  "klein": false
 },
 {
  "kz": "Z6",
  "name": "Relativsätze",
  "merksatz": "Relativpronomen richtet sich nach Genus und Zahl des Bezugsworts, der Kasus nach dem Verb im Relativsatz; Komma vor und nach, Verb am Ende.",
  "anzahl": 12,
  "seite": "124",
  "klein": false
 },
 {
  "kz": "Z7",
  "name": "Zeichensetzung",
  "merksatz": "Komma vor dass, weil, wenn, ob, Relativsätzen und Infinitivsätzen mit um … zu; Komma bei Aufzählungen (nicht vor und/oder).",
  "anzahl": 6,
  "seite": "124",
  "klein": true
 },
 {
  "kz": "R1",
  "name": "Präpositionen mit festem Kasus",
  "merksatz": "Akkusativ: durch, für, gegen, ohne, um. Dativ: aus, bei, mit, nach, seit, von, zu. Genitiv: dank, während, wegen.",
  "anzahl": 10,
  "seite": "126",
  "klein": false
 },
 {
  "kz": "R2",
  "name": "Wechselpräpositionen",
  "merksatz": "wo? = Dativ (Position), wohin? = Akkusativ (Richtung): in, an, auf, vor, hinter, neben, über, unter, zwischen.",
  "anzahl": 8,
  "seite": "126",
  "klein": false
 },
 {
  "kz": "R3",
  "name": "Zeitangaben",
  "merksatz": "um + Uhrzeit, am + Tag/Datum, im + Monat/Jahreszeit, seit + Dauer, von … bis, in der Pause, während.",
  "anzahl": 6,
  "seite": "126",
  "klein": false
 },
 {
  "kz": "R4",
  "name": "Verben mit Präposition",
  "merksatz": "warten auf, sich interessieren für, denken an, sprechen über, träumen von, Angst haben vor, sich gewöhnen an.",
  "anzahl": 9,
  "seite": "127",
  "klein": false
 }
];
const WDH_B1_BLOECKE = ["b1wdh_a", "b1wdh_b", "b1wdh_c", "b1wdh_d", "b1wdh_e", "b1wdh_f", "b1wdh_g", "b1wdh_h", "b1wdh_i", "b1wdh_j"];
registerActivities({
 "b1wdh_a": {
  "title": "Wiederholung A: Nomen und Artikel",
  "sub": "Grammatik-Wiederholung B1 — Block A",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Genus der Nomen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Setze der, die oder das ein.",
     "items": [
      {
       "frage": "___ Mädchen spielt im Park.",
       "thema": "S1",
       "id": "A01",
       "antwort": [
        "Das"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Zeitung liegt auf dem Tisch.",
       "thema": "S1",
       "id": "A02",
       "antwort": [
        "Die"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Ergebnis war sehr gut.",
       "thema": "S1",
       "id": "A03",
       "antwort": [
        "Das"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Freiheit ist wichtig.",
       "thema": "S1",
       "id": "A04",
       "antwort": [
        "Die"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Rathaus ist sehr alt.",
       "thema": "S1",
       "id": "A05",
       "antwort": [
        "Das"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Bürgermeister leitet die Stadt.",
       "thema": "S1",
       "id": "A06",
       "antwort": [
        "Der"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Meinung ist mir wichtig.",
       "thema": "S1",
       "id": "A07",
       "antwort": [
        "Die"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Frühling beginnt im März.",
       "thema": "S1",
       "id": "A08",
       "antwort": [
        "Der"
       ],
       "streng": true,
       "anfang": true
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Artikelwörter, Zählwörter",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das passende Wort.",
     "items": [
      {
       "frage": "Ich kaufe eine ___ Milch.",
       "thema": "S2",
       "id": "A09",
       "antwort": [
        "Packung",
        "Flasche",
        "Tüte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er trinkt jeden Tag drei ___ Wasser.",
       "thema": "S2",
       "id": "A10",
       "antwort": [
        "Flaschen",
        "Gläser",
        "Liter"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ Schüler hat ein Heft. (jed-)",
       "thema": "S2",
       "id": "A11",
       "antwort": [
        "Jeder"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Buch gefällt dir? Dieses hier?",
       "thema": "S2",
       "id": "A12",
       "antwort": [
        "Welches"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Ich habe heute ___ Zeit. (Verneinung)",
       "thema": "S2",
       "id": "A13",
       "antwort": [
        "keine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ Kinder in meiner Klasse sprechen Deutsch.",
       "thema": "S2",
       "id": "A14",
       "antwort": [
        "Alle",
        "Viele",
        "Einige",
        "Manche",
        "Mehrere",
        "Ein paar",
        "Wenige"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Hast du einen Stift? – Nein, ich habe ___.",
       "thema": "S2",
       "id": "A15",
       "antwort": [
        "keinen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "In ___ Klasse bist du?",
       "thema": "S2",
       "id": "A16",
       "antwort": [
        "welcher"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Possessivartikel",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze den Possessivartikel mit der richtigen Endung.",
     "items": [
      {
       "frage": "Das ist Maria. Das ist ___ Bruder.",
       "thema": "S3",
       "id": "A17",
       "antwort": [
        "ihr"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir lieben ___ Heimat.",
       "thema": "S3",
       "id": "A18",
       "antwort": [
        "unsere"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich besuche morgen ___ Großeltern.",
       "thema": "S3",
       "id": "A19",
       "antwort": [
        "meine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Herr Kaya, ist das ___ Auto?",
       "thema": "S3",
       "id": "A20",
       "antwort": [
        "Ihr"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Kinder spielen mit ___ Freunden.",
       "thema": "S3",
       "id": "A21",
       "antwort": [
        "ihren"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Kannst du ___ (dein) Vater im Garten helfen?",
       "thema": "S3",
       "id": "A22",
       "antwort": [
        "deinem"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Plural",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe die Pluralform.",
     "items": [
      {
       "frage": "das Kind – die ___",
       "thema": "S4",
       "id": "A23",
       "antwort": [
        "Kinder"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "der Apfel – die ___",
       "thema": "S4",
       "id": "A24",
       "antwort": [
        "Äpfel"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "die Stadt – die ___",
       "thema": "S4",
       "id": "A25",
       "antwort": [
        "Städte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "das Auto – die ___",
       "thema": "S4",
       "id": "A26",
       "antwort": [
        "Autos"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "das Museum – die ___",
       "thema": "S4",
       "id": "A27",
       "antwort": [
        "Museen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "der Bus – die ___",
       "thema": "S4",
       "id": "A28",
       "antwort": [
        "Busse"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   }
  ]
 },
 "b1wdh_b": {
  "title": "Wiederholung B: Adjektive, Genitiv, Steigerung",
  "sub": "Grammatik-Wiederholung B1 — Block B",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Adjektivdeklination",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Adjektiv mit der richtigen Endung.",
     "items": [
      {
       "frage": "Ich kaufe einen ___ (neu) Computer.",
       "thema": "S5",
       "id": "B01",
       "antwort": [
        "neuen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist ein ___ (alt) Haus.",
       "thema": "S5",
       "id": "B02",
       "antwort": [
        "altes"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie trägt eine ___ (rot) Jacke.",
       "thema": "S5",
       "id": "B03",
       "antwort": [
        "rote"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Mit dem ___ (klein) Auto fahren wir.",
       "thema": "S5",
       "id": "B04",
       "antwort": [
        "kleinen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der ___ (nett) Lehrer erklärt die Aufgabe.",
       "thema": "S5",
       "id": "B05",
       "antwort": [
        "nette"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir wohnen in einer ___ (schön) Stadt.",
       "thema": "S5",
       "id": "B06",
       "antwort": [
        "schönen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich gebe dem ___ (jung) Mann ein Buch.",
       "thema": "S5",
       "id": "B07",
       "antwort": [
        "jungen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das sind meine ___ (neu) Nachbarn.",
       "thema": "S5",
       "id": "B08",
       "antwort": [
        "neuen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Hast du ein ___ (gut) Wörterbuch?",
       "thema": "S5",
       "id": "B09",
       "antwort": [
        "gutes"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die ___ (lang) Reise war anstrengend.",
       "thema": "S5",
       "id": "B10",
       "antwort": [
        "lange"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "prädikativ/attributiv, Adjektive auf -er/-el",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Wähle die richtige Antwort.",
     "items": [
      {
       "frage": "Das Wetter ist ___.",
       "thema": "S6",
       "id": "B11",
       "optionen": [
        "schön",
        "schöne"
       ],
       "antwort": "schön"
      },
      {
       "frage": "Die Suppe schmeckt ___.",
       "thema": "S6",
       "id": "B12",
       "optionen": [
        "gute",
        "gut"
       ],
       "antwort": "gut"
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "prädikativ/attributiv, Adjektive auf -er/-el",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Wähle oder ergänze das Adjektiv (mit oder ohne Endung).",
     "items": [
      {
       "frage": "Ein ___ (teuer) Auto kaufe ich nicht.",
       "thema": "S6",
       "id": "B13",
       "antwort": [
        "teures"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist eine ___ (dunkel) Straße.",
       "thema": "S6",
       "id": "B14",
       "antwort": [
        "dunkle"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ein ___ (sauer) Apfel schmeckt nicht jedem.",
       "thema": "S6",
       "id": "B15",
       "antwort": [
        "saurer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist ein ___ (flexibel) Arbeitsmodell.",
       "thema": "S6",
       "id": "B16",
       "antwort": [
        "flexibles"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Genitiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze den Artikel im Genitiv bzw. das Nomen mit Genitiv-Endung.",
     "items": [
      {
       "frage": "Das ist das Auto ___ Lehrers.",
       "thema": "S7",
       "id": "B17",
       "antwort": [
        "des"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Haus ___ Frau ist groß.",
       "thema": "S7",
       "id": "B18",
       "antwort": [
        "der"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Hälfte ___ Schüler fehlt heute.",
       "thema": "S7",
       "id": "B19",
       "antwort": [
        "der"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Ende ___ Films war traurig.",
       "thema": "S7",
       "id": "B20",
       "antwort": [
        "des"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Meinung ___ Kinder ist wichtig.",
       "thema": "S7",
       "id": "B21",
       "antwort": [
        "der"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Fahrrad meines ___ (Bruder) ist kaputt.",
       "thema": "S7",
       "id": "B22",
       "antwort": [
        "Bruders"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Steigerung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Steigerungsform (Komparativ oder Superlativ) bzw. das Vergleichswort.",
     "items": [
      {
       "frage": "Köln ist groß, aber Berlin ist noch ___.",
       "thema": "K1",
       "id": "B23",
       "antwort": [
        "größer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der Rhein ist der ___ (lang) Fluss in Deutschland.",
       "thema": "K1",
       "id": "B24",
       "antwort": [
        "längste"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich esse gern Pizza, aber Pasta esse ich ___.",
       "thema": "K1",
       "id": "B25",
       "antwort": [
        "lieber"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Mein Bruder ist ___ als ich. (alt)",
       "thema": "K1",
       "id": "B26",
       "antwort": [
        "älter"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist das ___ (gut) Buch, das ich kenne.",
       "thema": "K1",
       "id": "B27",
       "antwort": [
        "beste"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Im Sommer ist es ___ als im Winter. (warm)",
       "thema": "K1",
       "id": "B28",
       "antwort": [
        "wärmer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ist so groß ___ ich.",
       "thema": "K1",
       "id": "B29",
       "antwort": [
        "wie"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Am ___ (viel) Geld hat Peter.",
       "thema": "K1",
       "id": "B30",
       "antwort": [
        "meisten"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   }
  ]
 },
 "b1wdh_c": {
  "title": "Wiederholung C: Pronomen, Verneinung, Fragen",
  "sub": "Grammatik-Wiederholung B1 — Block C",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Personal- und Reflexivpronomen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Pronomen.",
     "items": [
      {
       "frage": "Peter ist krank. Ich besuche ___.",
       "thema": "P1",
       "id": "C01",
       "antwort": [
        "ihn"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Kannst du ___ helfen? Ich verstehe das nicht.",
       "thema": "P1",
       "id": "C02",
       "antwort": [
        "mir"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich freue ___ auf die Ferien.",
       "thema": "P1",
       "id": "C03",
       "antwort": [
        "mich"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir treffen ___ um acht Uhr.",
       "thema": "P1",
       "id": "C04",
       "antwort": [
        "uns"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er wäscht ___ die Hände.",
       "thema": "P1",
       "id": "C05",
       "antwort": [
        "sich"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Gefällt ___ das Kleid, Frau Müller?",
       "thema": "P1",
       "id": "C06",
       "antwort": [
        "Ihnen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist Lena. Ich schenke ___ eine Blume.",
       "thema": "P1",
       "id": "C07",
       "antwort": [
        "ihr"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ihr müsst ___ beeilen.",
       "thema": "P1",
       "id": "C08",
       "antwort": [
        "euch"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich kaufe ___ ein neues Handy (für mich selbst).",
       "thema": "P1",
       "id": "C09",
       "antwort": [
        "mir"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie interessiert ___ für Musik.",
       "thema": "P1",
       "id": "C10",
       "antwort": [
        "sich"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Verneinung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze kein (mit Endung), nicht oder nie.",
     "items": [
      {
       "frage": "Ich habe ___ Hunger.",
       "thema": "N1",
       "id": "C11",
       "antwort": [
        "keinen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er kommt heute ___.",
       "thema": "N1",
       "id": "C12",
       "antwort": [
        "nicht"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das ist ___ mein Buch, sondern deins.",
       "thema": "N1",
       "id": "C13",
       "antwort": [
        "nicht"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie hat ___ Geschwister.",
       "thema": "N1",
       "id": "C14",
       "antwort": [
        "keine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich möchte ___ Kaffee, sondern Tee.",
       "thema": "N1",
       "id": "C15",
       "antwort": [
        "keinen"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Verneinung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Verneine: Ich spiele gern Fußball.",
       "thema": "N1",
       "id": "C16",
       "antwort": [
        "Ich spiele nicht gern Fußball.",
        "Ich spiele nicht gerne Fußball.",
        "Ich spiele ungern Fußball."
       ],
       "satz": true
      },
      {
       "frage": "Verneine: Er ist Lehrer.",
       "thema": "N1",
       "id": "C17",
       "antwort": [
        "Er ist kein Lehrer."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Verneinung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze kein (mit Endung), nicht oder nie.",
     "items": [
      {
       "frage": "Hast du schon einmal Sushi gegessen? – Nein, noch ___.",
       "thema": "N1",
       "id": "C18",
       "antwort": [
        "nie",
        "niemals"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Fragesätze",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Fragewort.",
     "items": [
      {
       "frage": "___ wohnst du? – In Bonn.",
       "thema": "Z2",
       "id": "C19",
       "antwort": [
        "Wo"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ kommst du? – Aus Syrien.",
       "thema": "Z2",
       "id": "C20",
       "antwort": [
        "Woher"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ gehst du? – Ins Kino.",
       "thema": "Z2",
       "id": "C21",
       "antwort": [
        "Wohin"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ ist das? – Das ist Herr Kaya.",
       "thema": "Z2",
       "id": "C22",
       "antwort": [
        "Wer"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ kostet das? – Fünf Euro.",
       "thema": "Z2",
       "id": "C23",
       "antwort": [
        "Wie viel",
        "Wieviel",
        "Was"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ stehst du morgen auf? – Um sechs Uhr.",
       "thema": "Z2",
       "id": "C24",
       "antwort": [
        "Wann",
        "Um wie viel Uhr"
       ],
       "streng": true,
       "anfang": true
      }
     ]
    }
   },
   {
    "nr": 6,
    "titel": "Fragesätze",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Tippe die Wörter in der richtigen Reihenfolge an.",
     "items": [
      {
       "frage": "Wörter: kommst / du / wann / ?",
       "thema": "Z2",
       "id": "C25",
       "woerter": [
        "kommst",
        "du",
        "wann",
        "?"
       ],
       "antwort": [
        "Wann kommst du?"
       ]
      }
     ]
    }
   },
   {
    "nr": 7,
    "titel": "Fragesätze",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Mach eine Frage: Du hast morgen Zeit.",
       "thema": "Z2",
       "id": "C26",
       "antwort": [
        "Hast du morgen Zeit?"
       ],
       "satz": true
      }
     ]
    }
   }
  ]
 },
 "b1wdh_d": {
  "title": "Wiederholung D: Verben I – Präsens, Modalverben, Futur, Imperativ",
  "sub": "Grammatik-Wiederholung B1 — Block D",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Verbtypen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Verb im Präsens (bei zwei Lücken beide Teile).",
     "items": [
      {
       "frage": "Ich ___ gut schwimmen. (können)",
       "thema": "V1",
       "id": "D01",
       "antwort": [
        "kann"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Du ___ hier nicht rauchen. (dürfen)",
       "thema": "V1",
       "id": "D02",
       "antwort": [
        "darfst"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ihr ___ leise sein. (müssen)",
       "thema": "V1",
       "id": "D03",
       "antwort": [
        "müsst"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ morgen früh ___. (aufstehen)",
       "thema": "V1",
       "id": "D04",
       "antwort": [
        "steht auf",
        "steht … auf",
        "steht ... auf",
        "steht, auf",
        "steht / auf"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der Zug ___ um acht Uhr ___. (ankommen)",
       "thema": "V1",
       "id": "D05",
       "antwort": [
        "kommt an",
        "kommt … an",
        "kommt ... an",
        "kommt, an",
        "kommt / an"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich ___ ___ jeden Morgen. (sich duschen)",
       "thema": "V1",
       "id": "D06",
       "antwort": [
        "dusche mich"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Präsens",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Verb im Präsens.",
     "items": [
      {
       "frage": "Du ___ nach Berlin. (fahren)",
       "thema": "V2",
       "id": "D07",
       "antwort": [
        "fährst"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ ein Buch. (lesen)",
       "thema": "V2",
       "id": "D08",
       "antwort": [
        "liest"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie ___ noch. (schlafen)",
       "thema": "V2",
       "id": "D09",
       "antwort": [
        "schläft"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich ___ Deutsch. (sprechen)",
       "thema": "V2",
       "id": "D10",
       "antwort": [
        "spreche"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ihr ___ viel. (arbeiten)",
       "thema": "V2",
       "id": "D11",
       "antwort": [
        "arbeitet"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Du ___ gern Obst. (essen)",
       "thema": "V2",
       "id": "D12",
       "antwort": [
        "isst"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ Arzt. (werden)",
       "thema": "V2",
       "id": "D13",
       "antwort": [
        "wird"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ ihr Zeit? (haben)",
       "thema": "V2",
       "id": "D14",
       "antwort": [
        "Habt"
       ],
       "streng": true,
       "anfang": true
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Futur",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Form von „werden“ (Futur).",
     "items": [
      {
       "frage": "Ich ___ nächstes Jahr in Köln wohnen. (Futur)",
       "thema": "V3",
       "id": "D15",
       "antwort": [
        "werde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ morgen anrufen. (Futur)",
       "thema": "V3",
       "id": "D16",
       "antwort": [
        "wird"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Futur",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Schreibe im Futur: Ich lerne morgen Deutsch.",
       "thema": "V3",
       "id": "D17",
       "antwort": [
        "Ich werde morgen Deutsch lernen.",
        "Morgen werde ich Deutsch lernen."
       ],
       "satz": true
      },
      {
       "frage": "Mach eine Frage im Futur: Du kommst morgen.",
       "thema": "V3",
       "id": "D18",
       "antwort": [
        "Wirst du morgen kommen?"
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Imperativ",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Bilde den Imperativ.",
     "items": [
      {
       "frage": "(du) ___ bitte leise! (sein)",
       "thema": "V7",
       "id": "D19",
       "antwort": [
        "Sei"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(du) ___ das Fenster! (öffnen)",
       "thema": "V7",
       "id": "D20",
       "antwort": [
        "Öffne"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(ihr) ___ mir bitte! (helfen)",
       "thema": "V7",
       "id": "D21",
       "antwort": [
        "Helft"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Sie bitte Platz! (nehmen)",
       "thema": "V7",
       "id": "D22",
       "antwort": [
        "Nehmen"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(du) ___ doch mal! (lesen)",
       "thema": "V7",
       "id": "D23",
       "antwort": [
        "Lies"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(du) ___ bitte langsam! (fahren)",
       "thema": "V7",
       "id": "D24",
       "antwort": [
        "Fahr",
        "Fahre"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(ihr) ___ bitte pünktlich! (kommen)",
       "thema": "V7",
       "id": "D25",
       "antwort": [
        "Kommt"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "(du) ___ mir das Buch! (geben)",
       "thema": "V7",
       "id": "D26",
       "antwort": [
        "Gib"
       ],
       "streng": true,
       "anfang": true
      }
     ]
    }
   }
  ]
 },
 "b1wdh_e": {
  "title": "Wiederholung E: Verben II – Vergangenheit, Partizip, unregelmäßige Verben",
  "sub": "Grammatik-Wiederholung B1 — Block E",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Präteritum",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Verb im Präteritum.",
     "items": [
      {
       "frage": "Gestern ___ ich zu Hause. (sein)",
       "thema": "V4",
       "id": "E01",
       "antwort": [
        "war"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ keine Zeit. (haben)",
       "thema": "V4",
       "id": "E02",
       "antwort": [
        "hatte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir ___ nach Hause. (gehen)",
       "thema": "V4",
       "id": "E03",
       "antwort": [
        "gingen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie ___ ein Buch. (lesen)",
       "thema": "V4",
       "id": "E04",
       "antwort": [
        "las"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Früher ___ ich Fußball. (spielen)",
       "thema": "V4",
       "id": "E05",
       "antwort": [
        "spielte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ihr ___ gestern in der Schule. (sein)",
       "thema": "V4",
       "id": "E06",
       "antwort": [
        "wart"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich ___ nicht kommen. (können)",
       "thema": "V4",
       "id": "E07",
       "antwort": [
        "konnte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ___ mich gestern ___. (anrufen)",
       "thema": "V4",
       "id": "E08",
       "antwort": [
        "rief an",
        "rief … an",
        "rief ... an",
        "rief, an",
        "rief / an"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Perfekt und Partizip II",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Partizip II (Perfekt).",
     "items": [
      {
       "frage": "Ich habe ein Buch ___. (lesen)",
       "thema": "V5",
       "id": "E09",
       "antwort": [
        "gelesen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ist nach Köln ___. (fahren)",
       "thema": "V5",
       "id": "E10",
       "antwort": [
        "gefahren"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir haben Pizza ___. (essen)",
       "thema": "V5",
       "id": "E11",
       "antwort": [
        "gegessen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie hat ihn ___. (anrufen)",
       "thema": "V5",
       "id": "E12",
       "antwort": [
        "angerufen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Hast du das ___? (verstehen)",
       "thema": "V5",
       "id": "E13",
       "antwort": [
        "verstanden"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich habe Deutsch ___. (lernen)",
       "thema": "V5",
       "id": "E14",
       "antwort": [
        "gelernt"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ist spät ___. (aufstehen)",
       "thema": "V5",
       "id": "E15",
       "antwort": [
        "aufgestanden"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Perfekt und Partizip II",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Schreibe im Perfekt: Wir kaufen Brot.",
       "thema": "V5",
       "id": "E16",
       "antwort": [
        "Wir haben Brot gekauft."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Unregelmäßige Verben",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die fehlende Verbform.",
     "items": [
      {
       "frage": "gehen – ging – ___",
       "thema": "V10",
       "id": "E17",
       "antwort": [
        "gegangen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "bringen – ___ – gebracht",
       "thema": "V10",
       "id": "E18",
       "antwort": [
        "brachte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "nehmen – nahm – ___",
       "thema": "V10",
       "id": "E19",
       "antwort": [
        "genommen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "denken – dachte – ___",
       "thema": "V10",
       "id": "E20",
       "antwort": [
        "gedacht"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "stehen – ___ – gestanden",
       "thema": "V10",
       "id": "E21",
       "antwort": [
        "stand"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "wissen – wusste – ___",
       "thema": "V10",
       "id": "E22",
       "antwort": [
        "gewusst"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Partizip I und II als Adjektiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Bilde aus dem Verb im ersten Satz ein Partizip als Adjektiv (mit Endung).",
     "items": [
      {
       "frage": "Das Kind schläft. Das ___ Kind ist süß.",
       "thema": "V6",
       "id": "E23",
       "antwort": [
        "schlafende"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Suppe dampft. Die ___ Suppe riecht gut.",
       "thema": "V6",
       "id": "E24",
       "antwort": [
        "dampfende"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ein Auto fährt. Ein ___ Auto ist laut.",
       "thema": "V6",
       "id": "E25",
       "antwort": [
        "fahrendes"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er öffnet das Fenster. Das ___ Fenster lässt Luft herein.",
       "thema": "V6",
       "id": "E26",
       "antwort": [
        "geöffnete"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Kinder spielen. Die ___ Kinder lachen.",
       "thema": "V6",
       "id": "E27",
       "antwort": [
        "spielenden"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich habe das Buch gekauft. Das ___ Buch ist gut.",
       "thema": "V6",
       "id": "E28",
       "antwort": [
        "gekaufte"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   }
  ]
 },
 "b1wdh_f": {
  "title": "Wiederholung F: Konjunktiv II und Passiv",
  "sub": "Grammatik-Wiederholung B1 — Block F",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Konjunktiv II",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Form im Konjunktiv II.",
     "items": [
      {
       "frage": "Wenn ich Geld hätte, ___ ich ein Haus kaufen.",
       "thema": "V8",
       "id": "F01",
       "antwort": [
        "würde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wenn ich reich ___, würde ich reisen.",
       "thema": "V8",
       "id": "F02",
       "antwort": [
        "wäre"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich ___ gern ein Eis.",
       "thema": "V8",
       "id": "F03",
       "antwort": [
        "hätte",
        "möchte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Du ___ mehr schlafen. (sollen, Ratschlag)",
       "thema": "V8",
       "id": "F04",
       "antwort": [
        "solltest"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ du mir bitte helfen? (können, höfliche Bitte)",
       "thema": "V8",
       "id": "F05",
       "antwort": [
        "Könntest"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Wenn er nicht krank ___, käme er.",
       "thema": "V8",
       "id": "F06",
       "antwort": [
        "wäre"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "An deiner Stelle ___ ich zum Arzt gehen.",
       "thema": "V8",
       "id": "F07",
       "antwort": [
        "würde"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Konjunktiv II",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Ich habe keine Zeit, deshalb komme ich nicht. Wunsch: Wenn ich …",
       "thema": "V8",
       "id": "F08",
       "antwort": [
        "Wenn ich Zeit hätte, würde ich kommen.",
        "Wenn ich Zeit hätte, käme ich."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Konjunktiv II",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Form im Konjunktiv II.",
     "items": [
      {
       "frage": "Er wünscht sich, dass er fliegen ___.",
       "thema": "V8",
       "id": "F09",
       "antwort": [
        "könnte"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wenn wir mehr Zeit ___, ___ wir länger bleiben.",
       "thema": "V8",
       "id": "F10",
       "antwort": [
        "hätten würden",
        "hätten … würden",
        "hätten ... würden",
        "hätten, würden",
        "hätten / würden",
        "hätten blieben",
        "hätten … blieben",
        "hätten ... blieben",
        "hätten, blieben",
        "hätten / blieben"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Passiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Form von „werden“ (Passiv).",
     "items": [
      {
       "frage": "Das Haus ___ von Arbeitern gebaut.",
       "thema": "V9",
       "id": "F11",
       "antwort": [
        "wird",
        "wurde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Briefe ___ gestern geschrieben.",
       "thema": "V9",
       "id": "F12",
       "antwort": [
        "wurden"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Tür ist geöffnet ___.",
       "thema": "V9",
       "id": "F13",
       "antwort": [
        "worden"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Hier ___ Deutsch gesprochen.",
       "thema": "V9",
       "id": "F14",
       "antwort": [
        "wird",
        "wurde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Hausaufgaben ___ von den Schülern gemacht.",
       "thema": "V9",
       "id": "F15",
       "antwort": [
        "werden",
        "wurden"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Passiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Schreibe im Passiv: Man baut hier ein Haus.",
       "thema": "V9",
       "id": "F16",
       "antwort": [
        "Hier wird ein Haus gebaut.",
        "Ein Haus wird hier gebaut."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 6,
    "titel": "Passiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Form von „werden“ (Passiv).",
     "items": [
      {
       "frage": "Der Kuchen ___ von meiner Mutter gebacken. (Präteritum)",
       "thema": "V9",
       "id": "F17",
       "antwort": [
        "wurde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Heute ___ getanzt.",
       "thema": "V9",
       "id": "F18",
       "antwort": [
        "wird"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "In der Schule ___ viel gelacht. (Präteritum)",
       "thema": "V9",
       "id": "F19",
       "antwort": [
        "wurde"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Gesetz ___ 1949 beschlossen.",
       "thema": "V9",
       "id": "F20",
       "antwort": [
        "wurde"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 7,
    "titel": "Passiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Schreibe im Passiv: Der Lehrer korrigiert die Tests.",
       "thema": "V9",
       "id": "F21",
       "antwort": [
        "Die Tests werden vom Lehrer korrigiert.",
        "Die Tests werden von dem Lehrer korrigiert."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 8,
    "titel": "Passiv",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Form von „werden“ (Passiv).",
     "items": [
      {
       "frage": "Dem Mann ___ geholfen.",
       "thema": "V9",
       "id": "F22",
       "antwort": [
        "wird",
        "wurde"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   }
  ]
 },
 "b1wdh_g": {
  "title": "Wiederholung G: Satzbau",
  "sub": "Grammatik-Wiederholung B1 — Block G",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Satzstellung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Tippe die Wörter in der richtigen Reihenfolge an.",
     "items": [
      {
       "frage": "Wörter: gestern / ich / Köln / in / war",
       "thema": "Z1",
       "id": "G01",
       "woerter": [
        "gestern",
        "ich",
        "Köln",
        "in",
        "war"
       ],
       "antwort": [
        "Gestern war ich in Köln.",
        "Ich war gestern in Köln.",
        "In Köln war ich gestern."
       ]
      },
      {
       "frage": "Wörter: morgen / wir / ins Kino / gehen",
       "thema": "Z1",
       "id": "G02",
       "woerter": [
        "morgen",
        "wir",
        "ins Kino",
        "gehen"
       ],
       "antwort": [
        "Morgen gehen wir ins Kino.",
        "Wir gehen morgen ins Kino.",
        "Ins Kino gehen wir morgen."
       ]
      },
      {
       "frage": "Wörter: dem Mann / ich / das Buch / gebe",
       "thema": "Z1",
       "id": "G03",
       "woerter": [
        "dem Mann",
        "ich",
        "das Buch",
        "gebe"
       ],
       "antwort": [
        "Ich gebe dem Mann das Buch.",
        "Dem Mann gebe ich das Buch.",
        "Das Buch gebe ich dem Mann."
       ]
      },
      {
       "frage": "Wörter: ich / es / ihm / gebe",
       "thema": "Z1",
       "id": "G04",
       "woerter": [
        "ich",
        "es",
        "ihm",
        "gebe"
       ],
       "antwort": [
        "Ich gebe es ihm."
       ]
      },
      {
       "frage": "Wörter: heute / der Zug / um acht / kommt / an",
       "thema": "Z1",
       "id": "G05",
       "woerter": [
        "heute",
        "der Zug",
        "um acht",
        "kommt",
        "an"
       ],
       "antwort": [
        "Heute kommt der Zug um acht an.",
        "Der Zug kommt heute um acht an.",
        "Um acht kommt der Zug heute an."
       ]
      },
      {
       "frage": "Wörter: du / ein Eis / möchtest / ?",
       "thema": "Z1",
       "id": "G06",
       "woerter": [
        "du",
        "ein Eis",
        "möchtest",
        "?"
       ],
       "antwort": [
        "Möchtest du ein Eis?"
       ]
      },
      {
       "frage": "Wörter: wir / müssen / lernen / viel",
       "thema": "Z1",
       "id": "G07",
       "woerter": [
        "wir",
        "müssen",
        "lernen",
        "viel"
       ],
       "antwort": [
        "Wir müssen viel lernen.",
        "Viel müssen wir lernen."
       ]
      },
      {
       "frage": "Wörter: hat / er / gestern / gesehen / mich",
       "thema": "Z1",
       "id": "G08",
       "woerter": [
        "hat",
        "er",
        "gestern",
        "gesehen",
        "mich"
       ],
       "antwort": [
        "Er hat mich gestern gesehen.",
        "Gestern hat er mich gesehen.",
        "Mich hat er gestern gesehen."
       ]
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Haupt-/Nebensatz, Infinitivsatz",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Verbinde mit „um … zu“: Ich lerne Deutsch. Ich will in Deutschland arbeiten.",
       "thema": "Z3",
       "id": "G09",
       "antwort": [
        "Ich lerne Deutsch, um in Deutschland zu arbeiten."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Haupt-/Nebensatz, Infinitivsatz",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das fehlende Wort bzw. die Infinitivform mit „zu“.",
     "items": [
      {
       "frage": "Ich hoffe, ___ ich bald Arbeit finde.",
       "thema": "Z3",
       "id": "G10",
       "antwort": [
        "dass"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Es ist wichtig, pünktlich ___ sein.",
       "thema": "Z3",
       "id": "G11",
       "antwort": [
        "zu"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er hat vergessen, das Fenster ___. (zumachen)",
       "thema": "Z3",
       "id": "G12",
       "antwort": [
        "zuzumachen"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Haupt-/Nebensatz, Infinitivsatz",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Tippe die Wörter in der richtigen Reihenfolge an.",
     "items": [
      {
       "frage": "Wörter: ich / nicht / weiß / ob / er / kommt",
       "thema": "Z3",
       "id": "G13",
       "woerter": [
        "ich",
        "nicht",
        "weiß",
        "ob",
        "er",
        "kommt"
       ],
       "antwort": [
        "Ich weiß nicht, ob er kommt."
       ]
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Haupt-/Nebensatz, Infinitivsatz",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das fehlende Wort bzw. die Infinitivform mit „zu“.",
     "items": [
      {
       "frage": "Ich habe keine Lust, die Hausaufgaben ___ ___. (machen)",
       "thema": "Z3",
       "id": "G14",
       "antwort": [
        "zu machen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie fängt an, Deutsch ___ ___. (lernen)",
       "thema": "Z3",
       "id": "G15",
       "antwort": [
        "zu lernen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich bleibe zu Hause, weil ich krank ___.",
       "thema": "Z3",
       "id": "G16",
       "antwort": [
        "bin",
        "war"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 6,
    "titel": "Zeichensetzung",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Setze die Kommas. Schreibe den ganzen Satz ab.",
     "items": [
      {
       "frage": "Setze das Komma: Ich glaube dass er kommt.",
       "thema": "Z7",
       "id": "G17",
       "antwort": [
        "Ich glaube, dass er kommt."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      },
      {
       "frage": "Setze das Komma: Er sagt dass er müde ist.",
       "thema": "Z7",
       "id": "G18",
       "antwort": [
        "Er sagt, dass er müde ist."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      },
      {
       "frage": "Setze das Komma: Ich lerne Deutsch um zu arbeiten.",
       "thema": "Z7",
       "id": "G19",
       "antwort": [
        "Ich lerne Deutsch, um zu arbeiten."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      },
      {
       "frage": "Setze die Kommas: Ich kaufe Brot Käse und Wurst.",
       "thema": "Z7",
       "id": "G20",
       "antwort": [
        "Ich kaufe Brot, Käse und Wurst."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      },
      {
       "frage": "Setze das Komma: Wenn es regnet bleibe ich zu Hause.",
       "thema": "Z7",
       "id": "G21",
       "antwort": [
        "Wenn es regnet, bleibe ich zu Hause."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      },
      {
       "frage": "Setze die Kommas: Das ist der Mann der mir geholfen hat.",
       "thema": "Z7",
       "id": "G22",
       "antwort": [
        "Das ist der Mann, der mir geholfen hat."
       ],
       "streng": true,
       "anfang": true,
       "zeichen": true
      }
     ]
    }
   }
  ]
 },
 "b1wdh_h": {
  "title": "Wiederholung H: Konjunktionen und Relativsätze",
  "sub": "Grammatik-Wiederholung B1 — Block H",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Nebenordnende Konjunktionen, Adverbien",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Konjunktion.",
     "items": [
      {
       "frage": "Ich bin müde, ___ gehe ich ins Bett.",
       "thema": "Z4",
       "id": "H01",
       "antwort": [
        "deshalb",
        "darum",
        "deswegen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich möchte kommen, ___ ich habe keine Zeit.",
       "thema": "Z4",
       "id": "H02",
       "antwort": [
        "aber",
        "doch"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er spielt Fußball ___ sie liest.",
       "thema": "Z4",
       "id": "H03",
       "antwort": [
        "und",
        "während"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Willst du Tee ___ Kaffee?",
       "thema": "Z4",
       "id": "H04",
       "antwort": [
        "oder"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich bleibe nicht, ___ ich gehe nach Hause.",
       "thema": "Z4",
       "id": "H05",
       "antwort": [
        "sondern"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ist zwar jung, ___ sehr erfahren.",
       "thema": "Z4",
       "id": "H06",
       "antwort": [
        "aber"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Nebenordnende Konjunktionen, Adverbien",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Verbinde mit „deshalb“: Es regnet. Ich bleibe zu Hause.",
       "thema": "Z4",
       "id": "H07",
       "antwort": [
        "Es regnet, deshalb bleibe ich zu Hause.",
        "Es regnet. Deshalb bleibe ich zu Hause.",
        "Es regnet, darum bleibe ich zu Hause.",
        "Es regnet. Darum bleibe ich zu Hause.",
        "Es regnet, deswegen bleibe ich zu Hause.",
        "Es regnet. Deswegen bleibe ich zu Hause."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Nebenordnende Konjunktionen, Adverbien",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Konjunktion.",
     "items": [
      {
       "frage": "Ich bleibe zu Hause, ___ ich bin krank.",
       "thema": "Z4",
       "id": "H08",
       "antwort": [
        "denn"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Unterordnende Konjunktionen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die passende Konjunktion.",
     "items": [
      {
       "frage": "Ich bleibe zu Hause, ___ ich krank bin.",
       "thema": "Z5",
       "id": "H09",
       "antwort": [
        "weil",
        "da"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ es regnet, nehme ich einen Schirm.",
       "thema": "Z5",
       "id": "H10",
       "antwort": [
        "Wenn",
        "Falls"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Ich lese, ___ ich warte.",
       "thema": "Z5",
       "id": "H11",
       "antwort": [
        "während",
        "wenn"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich weiß, ___ er kommt.",
       "thema": "Z5",
       "id": "H12",
       "antwort": [
        "dass",
        "wann"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er fragt, ___ ich Zeit habe.",
       "thema": "Z5",
       "id": "H13",
       "antwort": [
        "ob",
        "wann"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er war so müde, ___ er sofort einschlief.",
       "thema": "Z5",
       "id": "H14",
       "antwort": [
        "dass"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ ich klein war, wohnte ich in Syrien.",
       "thema": "Z5",
       "id": "H15",
       "antwort": [
        "Als"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Ich bleibe hier, ___ der Bus kommt.",
       "thema": "Z5",
       "id": "H16",
       "antwort": [
        "bis"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 5,
    "titel": "Unterordnende Konjunktionen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Verbinde mit „bevor“: Ich putze meine Zähne. Dann gehe ich ins Bett.",
       "thema": "Z5",
       "id": "H17",
       "antwort": [
        "Bevor ich ins Bett gehe, putze ich meine Zähne.",
        "Ich putze meine Zähne, bevor ich ins Bett gehe."
       ],
       "satz": true
      }
     ]
    }
   },
   {
    "nr": 6,
    "titel": "Relativsätze",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze das Relativpronomen.",
     "items": [
      {
       "frage": "Das ist der Mann, ___ neben mir wohnt.",
       "thema": "Z6",
       "id": "H18",
       "antwort": [
        "der"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Frau, ___ ich gestern gesehen habe, ist Lehrerin.",
       "thema": "Z6",
       "id": "H19",
       "antwort": [
        "die"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Buch, ___ ich lese, ist spannend.",
       "thema": "Z6",
       "id": "H20",
       "antwort": [
        "das"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der Film, ___ wir gesehen haben, war lang.",
       "thema": "Z6",
       "id": "H21",
       "antwort": [
        "den"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Kinder, ___ im Park spielen, sind laut.",
       "thema": "Z6",
       "id": "H22",
       "antwort": [
        "die"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der Lehrer, ___ wir gestern getroffen haben, kommt aus Köln.",
       "thema": "Z6",
       "id": "H23",
       "antwort": [
        "den"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich habe einen Freund, ___ Peter heißt.",
       "thema": "Z6",
       "id": "H24",
       "antwort": [
        "der"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das sind die Bücher, ___ ich gekauft habe.",
       "thema": "Z6",
       "id": "H25",
       "antwort": [
        "die"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 7,
    "titel": "Relativsätze",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Schreibe den ganzen Satz.",
     "items": [
      {
       "frage": "Verbinde: Das ist ein Mann. Er arbeitet bei der Bahn.",
       "thema": "Z6",
       "id": "H26",
       "antwort": [
        "Das ist ein Mann, der bei der Bahn arbeitet."
       ],
       "satz": true
      },
      {
       "frage": "Verbinde: Das ist das Auto. Ich habe es gekauft.",
       "thema": "Z6",
       "id": "H27",
       "antwort": [
        "Das ist das Auto, das ich gekauft habe."
       ],
       "satz": true
      }
     ]
    }
   }
  ]
 },
 "b1wdh_i": {
  "title": "Wiederholung I: Präpositionen",
  "sub": "Grammatik-Wiederholung B1 — Block I",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Präpositionen mit festem Kasus",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze den Artikel im richtigen Fall.",
     "items": [
      {
       "frage": "Ich fahre mit ___ Bus.",
       "thema": "R1",
       "id": "I01",
       "antwort": [
        "dem",
        "einem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich komme aus ___ Schule.",
       "thema": "R1",
       "id": "I02",
       "antwort": [
        "der",
        "einer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er geht durch ___ Park.",
       "thema": "R1",
       "id": "I03",
       "antwort": [
        "den",
        "einen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Seit ___ Jahr lerne ich Deutsch.",
       "thema": "R1",
       "id": "I04",
       "antwort": [
        "einem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Kind geht zu ___ Arzt.",
       "thema": "R1",
       "id": "I05",
       "antwort": [
        "dem",
        "einem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir gehen ohne ___ Kinder.",
       "thema": "R1",
       "id": "I06",
       "antwort": [
        "die",
        "unsere",
        "meine",
        "ihre",
        "seine",
        "deine",
        "eure"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Nach ___ Unterricht gehe ich essen.",
       "thema": "R1",
       "id": "I07",
       "antwort": [
        "dem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Das Buch ist von ___ Lehrerin.",
       "thema": "R1",
       "id": "I08",
       "antwort": [
        "der",
        "einer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er läuft gegen ___ Wand.",
       "thema": "R1",
       "id": "I09",
       "antwort": [
        "die",
        "eine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Der Weg führt um ___ See.",
       "thema": "R1",
       "id": "I10",
       "antwort": [
        "den",
        "einen"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Wechselpräpositionen",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze den Artikel: wo? = Dativ, wohin? = Akkusativ.",
     "items": [
      {
       "frage": "Das Buch liegt auf ___ Tisch.",
       "thema": "R2",
       "id": "I11",
       "antwort": [
        "dem",
        "einem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich lege das Buch auf ___ Tisch.",
       "thema": "R2",
       "id": "I12",
       "antwort": [
        "den",
        "einen"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir gehen in ___ Kino.",
       "thema": "R2",
       "id": "I13",
       "antwort": [
        "das",
        "ein"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er steht vor ___ Haus.",
       "thema": "R2",
       "id": "I14",
       "antwort": [
        "dem",
        "einem"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie hängt das Bild an ___ Wand.",
       "thema": "R2",
       "id": "I15",
       "antwort": [
        "die",
        "eine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Die Katze sitzt unter ___ Bett.",
       "thema": "R2",
       "id": "I16",
       "antwort": [
        "dem",
        "einem"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 3,
    "titel": "Zeitangaben",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Präposition.",
     "items": [
      {
       "frage": "Der Kurs beginnt ___ 8 Uhr.",
       "thema": "R3",
       "id": "I17",
       "antwort": [
        "um"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ Montag habe ich frei.",
       "thema": "R3",
       "id": "I18",
       "antwort": [
        "Am"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "___ Mai fahre ich in Urlaub.",
       "thema": "R3",
       "id": "I19",
       "antwort": [
        "Im"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Ich lerne ___ drei Jahren Deutsch.",
       "thema": "R3",
       "id": "I20",
       "antwort": [
        "seit"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ der Pause gehe ich nach draußen.",
       "thema": "R3",
       "id": "I21",
       "antwort": [
        "In",
        "Während"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Wir arbeiten ___ 9 ___ 17 Uhr.",
       "thema": "R3",
       "id": "I22",
       "antwort": [
        "von bis",
        "von … bis",
        "von ... bis",
        "von, bis",
        "von / bis"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 4,
    "titel": "Verben mit Präposition",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "Ergänze die Präposition.",
     "items": [
      {
       "frage": "Ich warte ___ den Bus.",
       "thema": "R4",
       "id": "I23",
       "antwort": [
        "auf"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er interessiert sich ___ Musik.",
       "thema": "R4",
       "id": "I24",
       "antwort": [
        "für"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie denkt oft ___ ihre Heimat.",
       "thema": "R4",
       "id": "I25",
       "antwort": [
        "an"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir sprechen ___ das Wetter.",
       "thema": "R4",
       "id": "I26",
       "antwort": [
        "über"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Sie gewöhnt sich ___ das Wetter.",
       "thema": "R4",
       "id": "I27",
       "antwort": [
        "an"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er träumt ___ einem Haus.",
       "thema": "R4",
       "id": "I28",
       "antwort": [
        "von"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Ich habe Angst ___ dem Hund.",
       "thema": "R4",
       "id": "I29",
       "antwort": [
        "vor"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   }
  ]
 },
 "b1wdh_j": {
  "title": "Wiederholung J: Alles zusammen",
  "sub": "Grammatik-Wiederholung B1 — Block J",
  "type": "grammatikblock",
  "wiederholungB1": true,
  "punkte": [
   {
    "nr": 1,
    "titel": "Lückentext „Wochenende in Köln“",
    "erklaerung": "Letztes Wochenende (1) ___ ich mit meiner Familie nach Köln gefahren. Wir haben (2) ___ Zug gefrühstückt. In Köln haben wir den (3) ___ (berühmt) Dom besucht. Er ist viel (4) ___ (groß), als ich gedacht hatte. (5) ___ es auf der Treppe sehr eng war, sind wir bis nach oben gestiegen. Oben war ich so müde, (6) ___ ich mich hinsetzen musste. Danach haben wir (7) ___ Freundin Lena besucht, (8) ___ seit zwei Jahren in Köln wohnt. Wir haben lange (9) ___ das Leben in der Stadt gesprochen. Am Abend (10) ___ wir noch ins Kino gehen, aber es war zu spät. Wenn wir mehr Zeit (11) ___, würden wir länger bleiben. Zum Schluss (12) ___ ein Foto von uns gemacht.",
    "uebung": {
     "typ": "text",
     "anleitung": "Lies den Text. Ergänze die Lücken (die Nummern stehen im Text).",
     "items": [
      {
       "frage": "Letztes Wochenende ___ ich mit meiner Familie nach Köln gefahren.",
       "thema": "V5",
       "id": "J01",
       "antwort": [
        "bin"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir haben ___ Zug gefrühstückt.",
       "thema": "R2",
       "id": "J02",
       "antwort": [
        "im"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "In Köln haben wir den ___ (berühmt) Dom besucht.",
       "thema": "S5",
       "id": "J03",
       "antwort": [
        "berühmten"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Er ist viel ___ (groß), als ich gedacht hatte.",
       "thema": "K1",
       "id": "J04",
       "antwort": [
        "größer"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "___ es auf der Treppe sehr eng war, sind wir bis nach oben gestiegen.",
       "thema": "Z5",
       "id": "J05",
       "antwort": [
        "Obwohl"
       ],
       "streng": true,
       "anfang": true
      },
      {
       "frage": "Oben war ich so müde, ___ ich mich hinsetzen musste.",
       "thema": "Z5",
       "id": "J06",
       "antwort": [
        "dass"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Danach haben wir ___ Freundin Lena besucht, … seit zwei Jahren in Köln wohnt.",
       "thema": "S3",
       "id": "J07",
       "antwort": [
        "unsere",
        "meine"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Danach haben wir … Freundin Lena besucht, ___ seit zwei Jahren in Köln wohnt.",
       "thema": "Z6",
       "id": "J08",
       "antwort": [
        "die"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wir haben lange ___ das Leben in der Stadt gesprochen.",
       "thema": "R4",
       "id": "J09",
       "antwort": [
        "über"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Am Abend ___ wir noch ins Kino gehen, aber es war zu spät.",
       "thema": "V4",
       "id": "J10",
       "antwort": [
        "wollten"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Wenn wir mehr Zeit ___, würden wir länger bleiben.",
       "thema": "V8",
       "id": "J11",
       "antwort": [
        "hätten"
       ],
       "streng": true,
       "anfang": false
      },
      {
       "frage": "Zum Schluss ___ ein Foto von uns gemacht.",
       "thema": "V9",
       "id": "J12",
       "antwort": [
        "wurde"
       ],
       "streng": true,
       "anfang": false
      }
     ]
    }
   },
   {
    "nr": 2,
    "titel": "Fehlersuche: Schreibe den Satz richtig.",
    "erklaerung": "",
    "uebung": {
     "typ": "text",
     "anleitung": "In jedem Satz steckt ein Fehler. Schreibe den Satz richtig.",
     "items": [
      {
       "frage": "Ich habe gestern nach Köln gefahren.",
       "thema": "V5",
       "id": "J13",
       "antwort": [
        "Ich bin gestern nach Köln gefahren."
       ],
       "satz": true
      },
      {
       "frage": "Weil ich müde bin, ich gehe ins Bett.",
       "thema": "Z5",
       "id": "J14",
       "antwort": [
        "Weil ich müde bin, gehe ich ins Bett."
       ],
       "satz": true
      },
      {
       "frage": "Das ist der Mann, den neben mir wohnt.",
       "thema": "Z6",
       "id": "J15",
       "antwort": [
        "Das ist der Mann, der neben mir wohnt."
       ],
       "satz": true
      },
      {
       "frage": "Ich warte an den Bus.",
       "thema": "R4",
       "id": "J16",
       "antwort": [
        "Ich warte auf den Bus."
       ],
       "satz": true
      },
      {
       "frage": "Wir gehen in dem Park.",
       "thema": "R2",
       "id": "J17",
       "antwort": [
        "Wir gehen in den Park.",
        "Wir gehen im Park."
       ],
       "satz": true
      },
      {
       "frage": "Er ist größer wie ich.",
       "thema": "K1",
       "id": "J18",
       "antwort": [
        "Er ist größer als ich."
       ],
       "satz": true
      },
      {
       "frage": "Ich habe kein Zeit.",
       "thema": "N1",
       "id": "J19",
       "antwort": [
        "Ich habe keine Zeit."
       ],
       "satz": true
      },
      {
       "frage": "Das Auto von mein Vater ist alt.",
       "thema": "S3",
       "id": "J20",
       "antwort": [
        "Das Auto von meinem Vater ist alt."
       ],
       "satz": true
      }
     ]
    }
   }
  ]
 },
 "b1wdh_auswertung": {
  "title": "Das musst du wiederholen",
  "sub": "Grammatik-Wiederholung B1 — Gesamtauswertung",
  "type": "wdhauswertung"
 }
});
