/* A1.4 Zahlen und Zeiten (Werkstattarbeit DaZ A1, Lernfeld 4, Arbeitsblätter 1–7 und Lernfeld-Test 4).
   Bilder: data/icons-a1.js (Tätigkeiten, Uhren — Original-Ausschnitte). Schritt 6 ist das Spiel "Immer 3!". */
registerTests({
 "a1_lf4_schritt1": {
  "title": "Tageszeiten",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 1 (Tageszeiten, schlafen, lernen, kochen, essen, arbeiten)",
  "teil1": [
   {
    "num": 1,
    "word": "schlafen",
    "icons": [
     "Tätigkeit_lernen",
     "Tätigkeit_arbeiten",
     "Tätigkeit_schlafen",
     "Tätigkeit_kochen"
    ],
    "correct": 2
   },
   {
    "num": 2,
    "word": "lernen",
    "icons": [
     "Tätigkeit_kochen",
     "Tätigkeit_lernen",
     "Tätigkeit_arbeiten",
     "Tätigkeit_schlafen"
    ],
    "correct": 1
   },
   {
    "num": 3,
    "word": "kochen",
    "icons": [
     "Tätigkeit_essen",
     "Tätigkeit_kochen",
     "Tätigkeit_lernen",
     "Tätigkeit_schlafen"
    ],
    "correct": 1
   },
   {
    "num": 4,
    "word": "essen",
    "icons": [
     "Tätigkeit_lernen",
     "Tätigkeit_kochen",
     "Tätigkeit_arbeiten",
     "Tätigkeit_essen"
    ],
    "correct": 3
   },
   {
    "num": 5,
    "word": "arbeiten",
    "icons": [
     "Tätigkeit_lernen",
     "Tätigkeit_schlafen",
     "Tätigkeit_arbeiten",
     "Tätigkeit_essen"
    ],
    "correct": 2
   }
  ],
  "teil2": [
   {
    "num": 6,
    "vor": "am Morgen →",
    "nach": "",
    "options": [
     "mittags",
     "nachts",
     "morgens"
    ],
    "correct": 2
   },
   {
    "num": 7,
    "vor": "am Mittag →",
    "nach": "",
    "options": [
     "vormittags",
     "abends",
     "mittags"
    ],
    "correct": 2
   },
   {
    "num": 8,
    "vor": "am Abend →",
    "nach": "",
    "options": [
     "abends",
     "nachmittags",
     "morgens"
    ],
    "correct": 0
   },
   {
    "num": 9,
    "vor": "in der Nacht →",
    "nach": "",
    "options": [
     "nachmittags",
     "morgens",
     "nachts"
    ],
    "correct": 2
   },
   {
    "num": 10,
    "vor": "Wann",
    "nach": "du?",
    "options": [
     "lernst",
     "lerne",
     "lernt"
    ],
    "correct": 0
   },
   {
    "num": 11,
    "vor": "Ich",
    "nach": "nachts.",
    "options": [
     "schläfst",
     "schlafe",
     "schläft"
    ],
    "correct": 1
   },
   {
    "num": 12,
    "vor": "Er",
    "nach": "mittags.",
    "options": [
     "esse",
     "esst",
     "isst"
    ],
    "correct": 2
   },
   {
    "num": 13,
    "vor": "Du",
    "nach": "abends.",
    "options": [
     "arbeitet",
     "arbeite",
     "arbeitest"
    ],
    "correct": 2
   }
  ],
  "teil3": [
   {
    "num": 14,
    "word": "lernen (am Morgen)",
    "pronomen": "Ich"
   },
   {
    "num": 15,
    "word": "kochen (mittags)",
    "pronomen": "Er"
   },
   {
    "num": 16,
    "word": "essen (abends)",
    "pronomen": "Wir"
   },
   {
    "num": 17,
    "word": "arbeiten (vormittags)",
    "pronomen": "Du"
   },
   {
    "num": 18,
    "word": "schlafen (nachts)",
    "pronomen": "Ich"
   }
  ],
  "teil4": [
   {
    "num": 19,
    "word": "am Morgen",
    "correct": "morgens"
   },
   {
    "num": 20,
    "word": "am Vormittag",
    "correct": "vormittags"
   },
   {
    "num": 21,
    "word": "am Mittag",
    "correct": "mittags"
   },
   {
    "num": 22,
    "word": "am Nachmittag",
    "correct": "nachmittags"
   },
   {
    "num": 23,
    "word": "am Abend",
    "correct": "abends"
   },
   {
    "num": 24,
    "word": "in der Nacht",
    "correct": "nachts"
   }
  ],
  "teil1Hint": "Welches Bild passt zum Verb? Tippe auf das richtige Bild.",
  "teil4Label": "Wann?",
  "teil4Hint": "Schreibe die Zeitangabe mit -s (z. B. am Morgen → morgens)."
 },
 "a1_lf4_schritt2": {
  "title": "Was machst du heute?",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 2 (spazieren gehen, einkaufen gehen, Fußball spielen, Musik hören, Fahrrad fahren)",
  "teil1": [
   {
    "num": 1,
    "word": "spazieren gehen",
    "icons": [
     "Tätigkeit_Fußball_spielen",
     "Tätigkeit_einkaufen_gehen",
     "Tätigkeit_Musik_hören",
     "Tätigkeit_spazieren_gehen"
    ],
    "correct": 3
   },
   {
    "num": 2,
    "word": "einkaufen gehen",
    "icons": [
     "Tätigkeit_spazieren_gehen",
     "Tätigkeit_Fahrrad_fahren",
     "Tätigkeit_Musik_hören",
     "Tätigkeit_einkaufen_gehen"
    ],
    "correct": 3
   },
   {
    "num": 3,
    "word": "Fußball spielen",
    "icons": [
     "Tätigkeit_einkaufen_gehen",
     "Tätigkeit_Fahrrad_fahren",
     "Tätigkeit_spazieren_gehen",
     "Tätigkeit_Fußball_spielen"
    ],
    "correct": 3
   },
   {
    "num": 4,
    "word": "Musik hören",
    "icons": [
     "Tätigkeit_einkaufen_gehen",
     "Tätigkeit_Fußball_spielen",
     "Tätigkeit_Fahrrad_fahren",
     "Tätigkeit_Musik_hören"
    ],
    "correct": 3
   },
   {
    "num": 5,
    "word": "Fahrrad fahren",
    "icons": [
     "Tätigkeit_einkaufen_gehen",
     "Tätigkeit_Fahrrad_fahren",
     "Tätigkeit_Fußball_spielen",
     "Tätigkeit_Musik_hören"
    ],
    "correct": 1
   }
  ],
  "teil2": [
   {
    "num": 6,
    "vor": "Ich",
    "nach": "spazieren.",
    "options": [
     "gehst",
     "geht",
     "gehe"
    ],
    "correct": 2
   },
   {
    "num": 7,
    "vor": "Du",
    "nach": "Fußball.",
    "options": [
     "spielt",
     "spiele",
     "spielst"
    ],
    "correct": 2
   },
   {
    "num": 8,
    "vor": "Er",
    "nach": "Musik.",
    "options": [
     "höre",
     "hörst",
     "hört"
    ],
    "correct": 2
   },
   {
    "num": 9,
    "vor": "Wir",
    "nach": "Fahrrad.",
    "options": [
     "fahren",
     "fährst",
     "fahrt"
    ],
    "correct": 0
   },
   {
    "num": 10,
    "vor": "Du",
    "nach": "Fahrrad.",
    "options": [
     "fährst",
     "fahre",
     "fährt"
    ],
    "correct": 0
   },
   {
    "num": 11,
    "vor": "Er",
    "nach": "Fahrrad.",
    "options": [
     "fahren",
     "fährt",
     "fahre"
    ],
    "correct": 1
   },
   {
    "num": 12,
    "vor": "Ihr",
    "nach": "einkaufen.",
    "options": [
     "gehen",
     "gehst",
     "geht"
    ],
    "correct": 2
   },
   {
    "num": 13,
    "vor": "Was",
    "nach": "du heute?",
    "options": [
     "macht",
     "mache",
     "machst"
    ],
    "correct": 2
   }
  ],
  "teil3": [
   {
    "num": 14,
    "word": "spazieren gehen (am Wochenende)",
    "pronomen": "Ich"
   },
   {
    "num": 15,
    "word": "Fußball spielen",
    "pronomen": "Er"
   },
   {
    "num": 16,
    "word": "Musik hören",
    "pronomen": "Wir"
   },
   {
    "num": 17,
    "word": "Fahrrad fahren",
    "pronomen": "Du"
   },
   {
    "num": 18,
    "word": "einkaufen gehen",
    "pronomen": "Ihr"
   }
  ],
  "teil4": [
   {
    "num": 19,
    "word": "ich gehe spazieren",
    "correct": "du gehst spazieren"
   },
   {
    "num": 20,
    "word": "ich spiele Fußball",
    "correct": "du spielst Fußball"
   },
   {
    "num": 21,
    "word": "ich höre Musik",
    "correct": "du hörst Musik"
   },
   {
    "num": 22,
    "word": "ich fahre Fahrrad",
    "correct": "du fährst Fahrrad"
   },
   {
    "num": 23,
    "word": "ich gehe einkaufen",
    "correct": "du gehst einkaufen"
   }
  ],
  "teil1Hint": "Welches Bild passt zur Tätigkeit? Tippe auf das richtige Bild.",
  "teil4Label": "ich → du",
  "teil4Hint": "Schreibe den ganzen Satz mit „du“."
 },
 "a1_lf4_schritt3": {
  "title": "Was machst du morgen?",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 3 (die Woche, gestern – heute – morgen)",
  "teil1": [],
  "teil2": [
   {
    "num": 1,
    "vor": "Nach Dienstag kommt",
    "nach": ".",
    "options": [
     "Freitag",
     "Mittwoch",
     "Montag"
    ],
    "correct": 1
   },
   {
    "num": 2,
    "vor": "Nach Freitag kommt",
    "nach": ".",
    "options": [
     "Donnerstag",
     "Samstag",
     "Sonntag"
    ],
    "correct": 1
   },
   {
    "num": 3,
    "vor": "Samstag und Sonntag sind das",
    "nach": ".",
    "options": [
     "Wochentag",
     "Woche",
     "Wochenende"
    ],
    "correct": 2
   },
   {
    "num": 4,
    "vor": "Heute ist Mittwoch. Morgen ist",
    "nach": ".",
    "options": [
     "Freitag",
     "Donnerstag",
     "Dienstag"
    ],
    "correct": 1
   },
   {
    "num": 5,
    "vor": "Heute ist Mittwoch. Gestern war",
    "nach": ".",
    "options": [
     "Dienstag",
     "Montag",
     "Donnerstag"
    ],
    "correct": 0
   },
   {
    "num": 6,
    "vor": "Heute ist Mittwoch. Übermorgen ist",
    "nach": ".",
    "options": [
     "Samstag",
     "Freitag",
     "Donnerstag"
    ],
    "correct": 1
   },
   {
    "num": 7,
    "vor": "Heute ist Mittwoch. Vorgestern war",
    "nach": ".",
    "options": [
     "Montag",
     "Sonntag",
     "Dienstag"
    ],
    "correct": 0
   },
   {
    "num": 8,
    "vor": "Was machst du morgen? – Ich",
    "nach": "morgen einkaufen.",
    "options": [
     "gehst",
     "gehe",
     "geht"
    ],
    "correct": 1
   }
  ],
  "teil3": [
   {
    "num": 9,
    "word": "Was machst du morgen? (einkaufen gehen)",
    "pronomen": "Ich gehe morgen"
   },
   {
    "num": 10,
    "word": "Was machst du am Montag? (Fahrrad fahren)",
    "pronomen": "Ich fahre am Montag"
   },
   {
    "num": 11,
    "word": "Was machst du am Dienstag? (lesen)",
    "pronomen": "Ich lese am Dienstag"
   },
   {
    "num": 12,
    "word": "Was machst du am Freitag? (Musik hören)",
    "pronomen": "Ich höre am Freitag"
   },
   {
    "num": 13,
    "word": "Was machst du am Sonntag? (schlafen)",
    "pronomen": "Ich schlafe am Sonntag"
   }
  ],
  "teil4": [
   {
    "num": 14,
    "word": "Montag",
    "correct": "Dienstag"
   },
   {
    "num": 15,
    "word": "Dienstag",
    "correct": "Mittwoch"
   },
   {
    "num": 16,
    "word": "Mittwoch",
    "correct": "Donnerstag"
   },
   {
    "num": 17,
    "word": "Donnerstag",
    "correct": "Freitag"
   },
   {
    "num": 18,
    "word": "Freitag",
    "correct": "Samstag"
   },
   {
    "num": 19,
    "word": "Samstag",
    "correct": "Sonntag"
   },
   {
    "num": 20,
    "word": "Sonntag",
    "correct": "Montag"
   }
  ],
  "teil4Label": "Der Tag danach",
  "teil4Hint": "Welcher Tag kommt danach? Schreibe den Wochentag."
 },
 "a1_lf4_schritt4": {
  "title": "Zahlen bis 1 Million",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 4 (Zahlen von 100 bis 1 Million, Jahreszahlen)",
  "teil1": [],
  "teil2": [
   {
    "num": 1,
    "vor": "109 =",
    "nach": "",
    "options": [
     "neunhundert",
     "hundertneunzig",
     "hundertneun"
    ],
    "correct": 2
   },
   {
    "num": 2,
    "vor": "300 =",
    "nach": "",
    "options": [
     "dreihundert",
     "dreizehn",
     "dreitausend"
    ],
    "correct": 0
   },
   {
    "num": 3,
    "vor": "1001 =",
    "nach": "",
    "options": [
     "eintausendeins",
     "einhunderteins",
     "eintausendzehn"
    ],
    "correct": 0
   },
   {
    "num": 4,
    "vor": "1200 =",
    "nach": "",
    "options": [
     "zwölftausend",
     "zweitausendeinhundert",
     "eintausendzweihundert"
    ],
    "correct": 2
   },
   {
    "num": 5,
    "vor": "2016 =",
    "nach": "",
    "options": [
     "sechzehntausend",
     "zweitausendsechzig",
     "zweitausendsechzehn"
    ],
    "correct": 2
   },
   {
    "num": 6,
    "vor": "12 000 =",
    "nach": "",
    "options": [
     "zwölfhundert",
     "zweitausendzwölf",
     "zwölftausend"
    ],
    "correct": 2
   },
   {
    "num": 7,
    "vor": "100 000 =",
    "nach": "",
    "options": [
     "eine Million",
     "hunderttausend",
     "zehntausend"
    ],
    "correct": 1
   },
   {
    "num": 8,
    "vor": "1 000 000 =",
    "nach": "",
    "options": [
     "eine Million",
     "eintausend",
     "hunderttausend"
    ],
    "correct": 0
   }
  ],
  "teil3": [
   {
    "num": 9,
    "word": "Wann bist du geboren? (2005)",
    "pronomen": "Ich bin im Jahr"
   },
   {
    "num": 10,
    "word": "Wann bist du geboren? (1998)",
    "pronomen": "Ich bin im Jahr"
   },
   {
    "num": 11,
    "word": "Wie viel kostet das? (1090 Euro)",
    "pronomen": "Das kostet"
   },
   {
    "num": 12,
    "word": "Wie viel kostet das? (1100 Euro)",
    "pronomen": "Das kostet"
   }
  ],
  "teil4": [
   {
    "num": 13,
    "word": "200",
    "correct": "zweihundert"
   },
   {
    "num": 14,
    "word": "500",
    "correct": "fünfhundert"
   },
   {
    "num": 15,
    "word": "1001",
    "correct": "eintausendeins"
   },
   {
    "num": 16,
    "word": "2000",
    "correct": "zweitausend"
   },
   {
    "num": 17,
    "word": "3000",
    "correct": "dreitausend"
   },
   {
    "num": 18,
    "word": "11 000",
    "correct": "elftausend"
   },
   {
    "num": 19,
    "word": "12 000",
    "correct": "zwölftausend"
   },
   {
    "num": 20,
    "word": "200 000",
    "correct": "zweihunderttausend"
   },
   {
    "num": 21,
    "word": "1 000 000",
    "correct": "eine Million"
   }
  ],
  "teil2Hint": "Wähle die richtige Zahl. Tippe auf die richtige Antwort.",
  "teil4Label": "Ziffern als Wörter",
  "teil4Hint": "Schreibe die Zahl als ein Wort (z. B. 200 → zweihundert). Bei 1 000 000 schreibe: eine Million.",
  "teil4OhneWortbank": true
 },
 "a1_lf4_schritt5": {
  "title": "Wie spät ist es?",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 5 (Uhrzeiten, pünktlich, zu spät)",
  "teil1": [
   {
    "num": 1,
    "word": "ein Uhr",
    "icons": [
     "Uhr_12_30",
     "Uhr_5_30",
     "Uhr_1_00",
     "Uhr_5_45"
    ],
    "correct": 2
   },
   {
    "num": 2,
    "word": "viertel nach zwölf",
    "icons": [
     "Uhr_10_00",
     "Uhr_12_15",
     "Uhr_5_45",
     "Uhr_2_45"
    ],
    "correct": 1
   },
   {
    "num": 3,
    "word": "halb eins",
    "icons": [
     "Uhr_12_45",
     "Uhr_3_30",
     "Uhr_12_30",
     "Uhr_1_00"
    ],
    "correct": 2
   },
   {
    "num": 4,
    "word": "viertel vor eins",
    "icons": [
     "Uhr_3_30",
     "Uhr_12_45",
     "Uhr_11_15",
     "Uhr_4_30"
    ],
    "correct": 1
   },
   {
    "num": 5,
    "word": "viertel nach drei",
    "icons": [
     "Uhr_3_30",
     "Uhr_3_15",
     "Uhr_11_15",
     "Uhr_5_30"
    ],
    "correct": 1
   },
   {
    "num": 6,
    "word": "halb vier",
    "icons": [
     "Uhr_6_00",
     "Uhr_8_00",
     "Uhr_4_30",
     "Uhr_3_30"
    ],
    "correct": 3
   },
   {
    "num": 7,
    "word": "viertel vor vier",
    "icons": [
     "Uhr_10_00",
     "Uhr_8_00",
     "Uhr_3_45",
     "Uhr_12_15"
    ],
    "correct": 2
   },
   {
    "num": 8,
    "word": "viertel nach neun",
    "icons": [
     "Uhr_3_30",
     "Uhr_9_15",
     "Uhr_6_00",
     "Uhr_11_15"
    ],
    "correct": 1
   }
  ],
  "teil2": [
   {
    "num": 9,
    "vor": "16:12 Uhr =",
    "nach": "",
    "options": [
     "zwölf Uhr sechzehn",
     "sechzehn Uhr zwölf",
     "sechzehn Uhr zwanzig"
    ],
    "correct": 1
   },
   {
    "num": 10,
    "vor": "13:05 Uhr =",
    "nach": "",
    "options": [
     "dreizehn Uhr fünf",
     "dreizehn Uhr fünfzehn",
     "fünf Uhr dreizehn"
    ],
    "correct": 0
   },
   {
    "num": 11,
    "vor": "18:47 Uhr =",
    "nach": "",
    "options": [
     "achtzehn Uhr siebenundvierzig",
     "siebzehn Uhr achtundvierzig",
     "achtzehn Uhr vierundsiebzig"
    ],
    "correct": 0
   },
   {
    "num": 12,
    "vor": "18:40 Uhr ist",
    "nach": ".",
    "options": [
     "abends",
     "vormittags",
     "morgens"
    ],
    "correct": 0
   },
   {
    "num": 13,
    "vor": "15:51 Uhr ist",
    "nach": ".",
    "options": [
     "morgens",
     "nachmittags",
     "abends"
    ],
    "correct": 1
   },
   {
    "num": 14,
    "vor": "23:55 Uhr ist",
    "nach": ".",
    "options": [
     "nachts",
     "morgens",
     "mittags"
    ],
    "correct": 0
   },
   {
    "num": 15,
    "vor": "12:02 Uhr ist",
    "nach": ".",
    "options": [
     "mittags",
     "abends",
     "nachts"
    ],
    "correct": 0
   },
   {
    "num": 16,
    "vor": "neun Uhr einunddreißig ist",
    "nach": ".",
    "options": [
     "vormittags",
     "abends",
     "nachts"
    ],
    "correct": 0
   }
  ],
  "teil3": [
   {
    "num": 17,
    "word": "Wie viel Uhr ist es? (7:15)",
    "pronomen": "Es ist"
   },
   {
    "num": 18,
    "word": "Wie viel Uhr ist es? (9:30)",
    "pronomen": "Es ist"
   },
   {
    "num": 19,
    "word": "Wie viel Uhr ist es? (6:45)",
    "pronomen": "Es ist"
   },
   {
    "num": 20,
    "word": "Bist du pünktlich?",
    "pronomen": "Ich bin"
   },
   {
    "num": 21,
    "word": "Bist du zu spät?",
    "pronomen": "Ich bin"
   }
  ],
  "teil4": [
   {
    "num": 22,
    "word": "9:15",
    "correct": "viertel nach neun"
   },
   {
    "num": 23,
    "word": "9:45",
    "correct": "viertel vor zehn"
   },
   {
    "num": 24,
    "word": "9:30",
    "correct": "halb zehn"
   },
   {
    "num": 25,
    "word": "14:00",
    "correct": "vierzehn Uhr"
   },
   {
    "num": 26,
    "word": "7:15",
    "correct": "viertel nach sieben"
   },
   {
    "num": 27,
    "word": "6:45",
    "correct": "viertel vor sieben"
   },
   {
    "num": 28,
    "word": "4:30",
    "correct": "halb fünf"
   }
  ],
  "teil1Hint": "Welche Uhr zeigt diese Zeit? Tippe auf das richtige Bild.",
  "teil4Label": "Uhrzeit sagen",
  "teil4Hint": "Schreibe die Uhrzeit mit Wörtern (z. B. 9:15 → viertel nach neun).",
  "teil4OhneWortbank": true
 },
 "a1_lf4_schritt7": {
  "title": "Welcher Tag ist heute?",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 7 (Monate, Jahreszeiten, Datum)",
  "teil1": [],
  "teil2": [
   {
    "num": 1,
    "vor": "Der Januar ist im",
    "nach": ".",
    "options": [
     "Winter",
     "Sommer",
     "Frühling"
    ],
    "correct": 0
   },
   {
    "num": 2,
    "vor": "Der Mai ist im",
    "nach": ".",
    "options": [
     "Frühling",
     "Herbst",
     "Winter"
    ],
    "correct": 0
   },
   {
    "num": 3,
    "vor": "Der Juli ist im",
    "nach": ".",
    "options": [
     "Herbst",
     "Sommer",
     "Winter"
    ],
    "correct": 1
   },
   {
    "num": 4,
    "vor": "Der November ist im",
    "nach": ".",
    "options": [
     "Frühling",
     "Herbst",
     "Sommer"
    ],
    "correct": 1
   },
   {
    "num": 5,
    "vor": "Der erste Monat im Jahr ist der",
    "nach": ".",
    "options": [
     "Januar",
     "Dezember",
     "Februar"
    ],
    "correct": 0
   },
   {
    "num": 6,
    "vor": "Der letzte Monat im Jahr ist der",
    "nach": ".",
    "options": [
     "November",
     "Dezember",
     "Januar"
    ],
    "correct": 1
   },
   {
    "num": 7,
    "vor": "Der",
    "nach": "Monat im Jahr ist der Februar.",
    "options": [
     "zweite",
     "erste",
     "dritte"
    ],
    "correct": 0
   },
   {
    "num": 8,
    "vor": "Der dritte Monat im Jahr ist der",
    "nach": ".",
    "options": [
     "März",
     "April",
     "Mai"
    ],
    "correct": 0
   }
  ],
  "teil3": [
   {
    "num": 9,
    "word": "Welcher Tag ist heute? (Montag)",
    "pronomen": "Heute ist"
   },
   {
    "num": 10,
    "word": "Winter",
    "pronomen": "Der Februar ist im"
   },
   {
    "num": 11,
    "word": "Sommer",
    "pronomen": "Der Juli ist im"
   },
   {
    "num": 12,
    "word": "letzter Monat im Jahr",
    "pronomen": "Der Dezember ist der letzte"
   },
   {
    "num": 13,
    "word": "erster Monat im Jahr",
    "pronomen": "Der Januar ist der erste"
   }
  ],
  "teil4": [
   {
    "num": 14,
    "word": "der erste Monat",
    "correct": "Januar"
   },
   {
    "num": 15,
    "word": "der dritte Monat",
    "correct": "März"
   },
   {
    "num": 16,
    "word": "der fünfte Monat",
    "correct": "Mai"
   },
   {
    "num": 17,
    "word": "der siebte Monat",
    "correct": "Juli"
   },
   {
    "num": 18,
    "word": "der neunte Monat",
    "correct": "September"
   },
   {
    "num": 19,
    "word": "der zehnte Monat",
    "correct": "Oktober"
   },
   {
    "num": 20,
    "word": "der elfte Monat",
    "correct": "November"
   },
   {
    "num": 21,
    "word": "der zwölfte Monat",
    "correct": "Dezember"
   }
  ],
  "teil4Label": "Die Monate",
  "teil4Hint": "Welcher Monat ist das? Schreibe den Monat."
 },
 "a1_lf4_abschlusstest": {
  "title": "Lernfeld-Test A1.4",
  "sub": "A1.4 Zahlen und Zeiten — Lernfeld-Test (75 Punkte, davon 3 von der Lehrkraft)",
  "type": "abschlusstest_generisch",
  "abschnitte": [
   {
    "titel": "Ergänze.",
    "kurz": "Verbform",
    "hinweis": "Schreibe die Verbformen. Jedes Feld 0,5 Punkte (39 P.).",
    "art": "konjugation",
    "gruppen": [
     {
      "verbs": [
       "schlafen",
       "lernen",
       "kochen",
       "essen",
       "arbeiten"
      ],
      "forms": {
       "schlafen": [
        "schlafe",
        "schläfst",
        "schläft",
        "schlafen",
        "schlaft",
        "schlafen"
       ],
       "lernen": [
        "lerne",
        "lernst",
        "lernt",
        "lernen",
        "lernt",
        "lernen"
       ],
       "kochen": [
        "koche",
        "kochst",
        "kocht",
        "kochen",
        "kocht",
        "kochen"
       ],
       "essen": [
        "esse",
        "isst",
        "isst",
        "essen",
        "esst",
        "essen"
       ],
       "arbeiten": [
        "arbeite",
        "arbeitest",
        "arbeitet",
        "arbeiten",
        "arbeitet",
        "arbeiten"
       ]
      }
     },
     {
      "verbs": [
       "merken",
       "finden",
       "bringen",
       "ausmalen"
      ],
      "forms": {
       "merken": [
        "merke",
        "merkst",
        "merkt",
        "merken",
        "merkt",
        "merken"
       ],
       "finden": [
        "finde",
        "findest",
        "findet",
        "finden",
        "findet",
        "finden"
       ],
       "bringen": [
        "bringe",
        "bringst",
        "bringt",
        "bringen",
        "bringt",
        "bringen"
       ],
       "ausmalen": [
        "male aus",
        "malst aus",
        "malt aus",
        "malen aus",
        "malt aus",
        "malen aus"
       ]
      }
     },
     {
      "verbs": [
       "spazieren gehen",
       "Fußball spielen",
       "Musik hören",
       "Fahrrad fahren"
      ],
      "forms": {
       "spazieren gehen": [
        "gehe spazieren",
        "gehst spazieren",
        "geht spazieren",
        "gehen spazieren",
        "geht spazieren",
        "gehen spazieren"
       ],
       "Fußball spielen": [
        "spiele Fußball",
        "spielst Fußball",
        "spielt Fußball",
        "spielen Fußball",
        "spielt Fußball",
        "spielen Fußball"
       ],
       "Musik hören": [
        "höre Musik",
        "hörst Musik",
        "hört Musik",
        "hören Musik",
        "hört Musik",
        "hören Musik"
       ],
       "Fahrrad fahren": [
        "fahre Fahrrad",
        "fährst Fahrrad",
        "fährt Fahrrad",
        "fahren Fahrrad",
        "fahrt Fahrrad",
        "fahren Fahrrad"
       ]
      }
     }
    ]
   },
   {
    "titel": "Antworte.",
    "kurz": "Antwort",
    "hinweis": "Schau das Bild an und antworte mit einem ganzen Satz. Diese 3 Punkte bewertet deine Lehrkraft.",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "bild": "Tätigkeit_lernen",
      "frage": "Wann lernst du?",
      "manuell": true
     },
     {
      "bild": "Tätigkeit_kochen",
      "frage": "Wann kochen Sie? Ich ...",
      "manuell": true
     },
     {
      "bild": "Tätigkeit_Musik_hören",
      "frage": "Was machst du morgens?",
      "manuell": true
     }
    ]
   },
   {
    "titel": "Schreibe die Wochentage in der richtigen Reihenfolge.",
    "kurz": "Wochentag",
    "hinweis": "Nach dem Montag kommt ... Jeder Tag 1 Punkt (6 P.).",
    "beispiel": "der Montag",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "frage": "Nach Montag kommt",
      "antwort": "Dienstag",
      "exakt": false
     },
     {
      "frage": "Nach Dienstag kommt",
      "antwort": "Mittwoch",
      "exakt": false
     },
     {
      "frage": "Nach Mittwoch kommt",
      "antwort": "Donnerstag",
      "exakt": false
     },
     {
      "frage": "Nach Donnerstag kommt",
      "antwort": "Freitag",
      "exakt": false
     },
     {
      "frage": "Nach Freitag kommt",
      "antwort": "Samstag",
      "exakt": false
     },
     {
      "frage": "Nach Samstag kommt",
      "antwort": "Sonntag",
      "exakt": false
     }
    ]
   },
   {
    "titel": "Ergänze.",
    "kurz": "gestern – heute – morgen",
    "hinweis": "Heute ist Mittwoch. Jede Lücke 1 Punkt (8 P.).",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "frage": "___ war Dienstag.",
      "antwort": "Gestern"
     },
     {
      "frage": "Gestern war ___.",
      "antwort": "Dienstag"
     },
     {
      "frage": "___ war Montag.",
      "antwort": "Vorgestern"
     },
     {
      "frage": "Vorgestern war ___.",
      "antwort": "Montag"
     },
     {
      "frage": "___ ist Donnerstag.",
      "antwort": "Morgen"
     },
     {
      "frage": "Morgen ist ___.",
      "antwort": "Donnerstag"
     },
     {
      "frage": "___ ist Freitag.",
      "antwort": "Übermorgen"
     },
     {
      "frage": "Übermorgen ist ___.",
      "antwort": "Freitag"
     }
    ]
   },
   {
    "titel": "Schreibe die Ziffern als Wörter.",
    "kurz": "Zahl als Wort",
    "hinweis": "Jede Zahl 1 Punkt (7 P.).",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "frage": "243",
      "antwort": "zweihundertdreiundvierzig"
     },
     {
      "frage": "1 000",
      "antwort": [
       "eintausend",
       "tausend"
      ]
     },
     {
      "frage": "1 079",
      "antwort": "eintausendneunundsiebzig"
     },
     {
      "frage": "8 762",
      "antwort": "achttausendsiebenhundertzweiundsechzig"
     },
     {
      "frage": "12 024",
      "antwort": "zwölftausendvierundzwanzig"
     },
     {
      "frage": "286 905",
      "antwort": "zweihundertsechsundachtzigtausendneunhundertfünf"
     },
     {
      "frage": "1 845 011",
      "antwort": "eine Million achthundertfünfundvierzigtausendelf"
     }
    ]
   },
   {
    "titel": "Jahreszahl und Euro.",
    "kurz": "Jahr / Euro",
    "hinweis": "Schreibe die Zahl als Jahreszahl und als Euro-Betrag. Jedes Feld 0,5 Punkte (3 P.).",
    "art": "eingabe",
    "punkte": 0.5,
    "items": [
     {
      "frage": "1090 – Jahr",
      "antwort": [
       "eintausendneunzig",
       "tausendneunzig"
      ]
     },
     {
      "frage": "1090 – Euro",
      "antwort": [
       "eintausendneunzig"
      ]
     },
     {
      "frage": "1248 – Jahr",
      "antwort": [
       "zwölfhundertachtundvierzig"
      ]
     },
     {
      "frage": "1248 – Euro",
      "antwort": [
       "eintausendzweihundertachtundvierzig"
      ]
     },
     {
      "frage": "2014 – Jahr",
      "antwort": [
       "zweitausendvierzehn"
      ]
     },
     {
      "frage": "2014 – Euro",
      "antwort": [
       "zweitausendvierzehn"
      ]
     }
    ]
   },
   {
    "titel": "Schreibe die Zahlen als Ziffern.",
    "kurz": "Wort als Zahl",
    "hinweis": "Jede Zahl 1 Punkt (2 P.).",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "frage": "sechshundertdreiundachtzig",
      "antwort": [
       "683"
      ]
     },
     {
      "frage": "neunhundertvierundzwanzigtausenddreihundertelf",
      "antwort": [
       "924311",
       "924 311"
      ]
     }
    ]
   },
   {
    "titel": "Wie spät ist es?",
    "kurz": "Uhrzeit",
    "hinweis": "Schau die Uhr an. Beispiel: „Es ist ein Uhr.“ Jede Uhr 1 Punkt (5 P.).",
    "beispiel": "Es ist ein Uhr.",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "bild": "Uhr_3_15",
      "antwort": [
       "viertel nach drei",
       "viertel nach drei.",
       "Es ist viertel nach drei",
       "Es ist viertel nach drei.",
       "drei Uhr fünfzehn",
       "drei Uhr fünfzehn.",
       "Es ist drei Uhr fünfzehn",
       "Es ist drei Uhr fünfzehn.",
       "fünfzehn Uhr fünfzehn",
       "fünfzehn Uhr fünfzehn.",
       "Es ist fünfzehn Uhr fünfzehn",
       "Es ist fünfzehn Uhr fünfzehn."
      ],
      "label": "Uhr 3:15"
     },
     {
      "bild": "Uhr_6_20",
      "antwort": [
       "zwanzig nach sechs",
       "zwanzig nach sechs.",
       "Es ist zwanzig nach sechs",
       "Es ist zwanzig nach sechs.",
       "sechs Uhr zwanzig",
       "sechs Uhr zwanzig.",
       "Es ist sechs Uhr zwanzig",
       "Es ist sechs Uhr zwanzig.",
       "achtzehn Uhr zwanzig",
       "achtzehn Uhr zwanzig.",
       "Es ist achtzehn Uhr zwanzig",
       "Es ist achtzehn Uhr zwanzig."
      ],
      "label": "Uhr 6:20"
     },
     {
      "bild": "Uhr_7_30",
      "antwort": [
       "halb acht",
       "halb acht.",
       "Es ist halb acht",
       "Es ist halb acht.",
       "sieben Uhr dreißig",
       "sieben Uhr dreißig.",
       "Es ist sieben Uhr dreißig",
       "Es ist sieben Uhr dreißig.",
       "neunzehn Uhr dreißig",
       "neunzehn Uhr dreißig.",
       "Es ist neunzehn Uhr dreißig",
       "Es ist neunzehn Uhr dreißig."
      ],
      "label": "Uhr 7:30"
     },
     {
      "bild": "Uhr_7_35",
      "antwort": [
       "fünf nach halb acht",
       "fünf nach halb acht.",
       "Es ist fünf nach halb acht",
       "Es ist fünf nach halb acht.",
       "fünfundzwanzig vor acht",
       "fünfundzwanzig vor acht.",
       "Es ist fünfundzwanzig vor acht",
       "Es ist fünfundzwanzig vor acht.",
       "sieben Uhr fünfunddreißig",
       "sieben Uhr fünfunddreißig.",
       "Es ist sieben Uhr fünfunddreißig",
       "Es ist sieben Uhr fünfunddreißig.",
       "neunzehn Uhr fünfunddreißig",
       "neunzehn Uhr fünfunddreißig.",
       "Es ist neunzehn Uhr fünfunddreißig",
       "Es ist neunzehn Uhr fünfunddreißig."
      ],
      "label": "Uhr 7:35"
     },
     {
      "bild": "Uhr_8_45",
      "antwort": [
       "viertel vor neun",
       "viertel vor neun.",
       "Es ist viertel vor neun",
       "Es ist viertel vor neun.",
       "acht Uhr fünfundvierzig",
       "acht Uhr fünfundvierzig.",
       "Es ist acht Uhr fünfundvierzig",
       "Es ist acht Uhr fünfundvierzig.",
       "zwanzig Uhr fünfundvierzig",
       "zwanzig Uhr fünfundvierzig.",
       "Es ist zwanzig Uhr fünfundvierzig",
       "Es ist zwanzig Uhr fünfundvierzig."
      ],
      "label": "Uhr 8:45"
     }
    ]
   },
   {
    "titel": "Welches Datum haben wir?",
    "kurz": "Datum",
    "hinweis": "Schreibe den Satz (2 P.): Heute ist Montag, der 24. November 2016. Schreibe alle Zahlen als Wörter.",
    "art": "eingabe",
    "punkte": 2,
    "items": [
     {
      "frage": "Montag, 24.11.2016",
      "antwort": [
       "Heute ist Montag, der vierundzwanzigste November zweitausendsechzehn.",
       "Heute ist Montag, der vierundzwanzigste November zweitausendsechzehn"
      ]
     }
    ]
   }
  ],
  "punkte_max": 72
 }
});
registerActivities({
 "a1_lf4_immer3": {
  "title": "Immer 3!",
  "sub": "A1.4 Zahlen und Zeiten — Schritt 6 (Spiel: Uhrzeiten zuordnen)",
  "type": "dreier",
  "schritt": 6,
  "runde": 4,
  "hinweis": "Finde immer drei Karten, die zusammengehören: die Uhr und zwei Uhrzeiten. Tippe drei Karten an.",
  "saetze": [
   [
    {
     "bild": "Uhr_5_00"
    },
    "fünf Uhr",
    "17:00 Uhr"
   ],
   [
    {
     "bild": "Uhr_9_00"
    },
    "neun Uhr",
    "einundzwanzig Uhr"
   ],
   [
    {
     "bild": "Uhr_2_00"
    },
    "2:00 Uhr",
    "14:00 Uhr"
   ],
   [
    {
     "bild": "Uhr_11_00"
    },
    "elf Uhr",
    "23:00 Uhr"
   ],
   [
    {
     "bild": "Uhr_5_30"
    },
    "17 Uhr 30",
    "halb 6"
   ],
   [
    {
     "bild": "Uhr_4_30"
    },
    "vier Uhr dreißig",
    "halb fünf"
   ],
   [
    {
     "bild": "Uhr_9_30"
    },
    "09:30 Uhr",
    "halb 10"
   ],
   [
    {
     "bild": "Uhr_2_45"
    },
    "viertel vor drei",
    "14:45 Uhr"
   ],
   [
    {
     "bild": "Uhr_7_15"
    },
    "viertel nach sieben",
    "sieben Uhr fünfzehn"
   ],
   [
    {
     "bild": "Uhr_5_45"
    },
    "viertel vor sechs",
    "siebzehn Uhr fünfundvierzig"
   ],
   [
    {
     "bild": "Uhr_11_15"
    },
    "viertel nach elf",
    "23:15 Uhr"
   ]
  ]
 }
});
