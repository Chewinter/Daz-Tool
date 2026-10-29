/* A1.5 Schule (Werkstattarbeit DaZ A1, Lernfeld 5, Arbeitsblätter 1–4, Schuldomino, Lernfeld-Test 5). Bilder: data/icons-a1.js (Original-Ausschnitte).
   Das Klassenzimmer-Memory ist selbst ergänzt (Spiel zu Schritt 2). */
registerTests({
 "a1_lf5_schritt1": {
  "title": "Meine Schule",
  "sub": "A1.5 Schule — Schritt 1 (Schulgebäude, Fächer, Stundenplan)",
  "teil1": [
   {
    "num": 1,
    "word": "die Schule",
    "icons": [
     "A15_Ort_die_Buecherei",
     "A15_Ort_die_Turnhalle",
     "A15_Ort_die_Aula",
     "A15_Ort_die_Schule"
    ],
    "correct": 3
   },
   {
    "num": 2,
    "word": "die Turnhalle",
    "icons": [
     "A15_Ort_der_Pausenhof",
     "A15_Ort_der_Sportplatz",
     "A15_Ort_die_Aula",
     "A15_Ort_die_Turnhalle"
    ],
    "correct": 3
   },
   {
    "num": 3,
    "word": "der Pausenhof",
    "icons": [
     "A15_Ort_die_Aula",
     "A15_Ort_die_Turnhalle",
     "A15_Ort_der_Pausenhof",
     "A15_Ort_die_Buecherei"
    ],
    "correct": 2
   },
   {
    "num": 4,
    "word": "der Sportplatz",
    "icons": [
     "A15_Ort_der_Sportplatz",
     "A15_Ort_die_Mensa",
     "A15_Ort_die_Turnhalle",
     "A15_Ort_der_Pausenhof"
    ],
    "correct": 0
   },
   {
    "num": 5,
    "word": "das Fenster",
    "icons": [
     "A15_Ort_die_Schule",
     "A15_Ort_der_Sportplatz",
     "A15_Ort_die_Aula",
     "A15_Ort_das_Fenster"
    ],
    "correct": 3
   },
   {
    "num": 6,
    "word": "die Bücherei",
    "icons": [
     "A15_Ort_die_Buecherei",
     "A15_Ort_die_Turnhalle",
     "A15_Ort_der_Sportplatz",
     "A15_Ort_das_Fenster"
    ],
    "correct": 0
   },
   {
    "num": 7,
    "word": "die Aula",
    "icons": [
     "A15_Ort_die_Aula",
     "A15_Ort_die_Mensa",
     "A15_Ort_das_Fenster",
     "A15_Ort_der_Sportplatz"
    ],
    "correct": 0
   },
   {
    "num": 8,
    "word": "die Mensa",
    "icons": [
     "A15_Ort_das_Fenster",
     "A15_Ort_die_Turnhalle",
     "A15_Ort_die_Buecherei",
     "A15_Ort_die_Mensa"
    ],
    "correct": 3
   }
  ],
  "teil2": [
   {
    "num": 9,
    "vor": "Der Rektor arbeitet im",
    "nach": ".",
    "options": [
     "Rektorat",
     "Sportplatz",
     "Pausenhof"
    ],
    "correct": 0
   },
   {
    "num": 10,
    "vor": "Die Lehrer sitzen im",
    "nach": ".",
    "options": [
     "Pausenhof",
     "Lehrerzimmer",
     "Hausmeisterbüro"
    ],
    "correct": 1
   },
   {
    "num": 11,
    "vor": "Was",
    "nach": "du am Montag in der ersten Stunde?",
    "options": [
     "hat",
     "habe",
     "hast"
    ],
    "correct": 2
   },
   {
    "num": 12,
    "vor": "Am Montag in der ersten Stunde",
    "nach": "ich Deutsch.",
    "options": [
     "hat",
     "hast",
     "habe"
    ],
    "correct": 2
   },
   {
    "num": 13,
    "vor": "Am Mittwoch in der 4. Stunde hat das Kind",
    "nach": ".",
    "options": [
     "Physik",
     "Musik",
     "Kunst"
    ],
    "correct": 1,
    "bildGross": "A15_Stundenplan",
    "bildTitel": "Der Stundenplan"
   },
   {
    "num": 14,
    "vor": "Physik hat das Kind im",
    "nach": ".",
    "options": [
     "Musikraum",
     "Kunstraum",
     "Physiksaal"
    ],
    "correct": 2,
    "bildGross": "A15_Stundenplan",
    "bildTitel": "Der Stundenplan"
   },
   {
    "num": 15,
    "vor": "Biologie hat das Kind im",
    "nach": ".",
    "options": [
     "Kunstraum",
     "Biologiesaal",
     "Physiksaal"
    ],
    "correct": 1,
    "bildGross": "A15_Stundenplan",
    "bildTitel": "Der Stundenplan"
   },
   {
    "num": 16,
    "vor": "Am Montag in der 5. und 6. Stunde hat das Kind",
    "nach": ".",
    "options": [
     "Musik",
     "Kunst",
     "Sport"
    ],
    "correct": 1,
    "bildGross": "A15_Stundenplan",
    "bildTitel": "Der Stundenplan"
   },
   {
    "num": 17,
    "vor": "Nach der 2. Stunde ist die große",
    "nach": ".",
    "options": [
     "Pause",
     "Mensa",
     "Stunde"
    ],
    "correct": 0,
    "bildGross": "A15_Stundenplan",
    "bildTitel": "Der Stundenplan"
   },
   {
    "num": 18,
    "vor": "Nr. 3 ist",
    "nach": ".",
    "options": [
     "die Mensa / Schulkantine",
     "das Klassenzimmer",
     "die Turnhalle"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 19,
    "vor": "Nr. 6 ist",
    "nach": ".",
    "options": [
     "die Schule",
     "der Pausenhof",
     "der Gang"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 20,
    "vor": "Nr. 8 ist",
    "nach": ".",
    "options": [
     "die Turnhalle",
     "die Tür",
     "die Jungentoilette"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 21,
    "vor": "Nr. 9 ist",
    "nach": ".",
    "options": [
     "das Klassenzimmer",
     "das Lehrerzimmer",
     "die Turnhalle"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 22,
    "vor": "Nr. 10 ist",
    "nach": ".",
    "options": [
     "die Aula",
     "das Hausmeisterbüro",
     "das Klassenzimmer"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 23,
    "vor": "Nr. 11 ist",
    "nach": ".",
    "options": [
     "die Schule",
     "das Rektorat",
     "das Sekretariat"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 24,
    "vor": "Nr. 12 ist",
    "nach": ".",
    "options": [
     "die Jungentoilette",
     "das Rektorat",
     "der Sportplatz"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 25,
    "vor": "Nr. 13 ist",
    "nach": ".",
    "options": [
     "die Bücherei",
     "die Mädchentoilette",
     "die Aula"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 26,
    "vor": "Nr. 14 ist",
    "nach": ".",
    "options": [
     "die Mensa / Schulkantine",
     "das Lehrerzimmer",
     "die Jungentoilette"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   },
   {
    "num": 27,
    "vor": "Nr. 18 ist",
    "nach": ".",
    "options": [
     "das Fußballfeld",
     "die Bücherei",
     "die Mädchentoilette"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt1_schulplan_nummeriert",
    "bildTitel": "",
    "auto": "schrittbild"
   }
  ],
  "teil3": [
   {
    "num": 28,
    "word": "Was hast du am Montag in der ersten Stunde? (Deutsch) Antworte mit einem ganzen Satz.",
    "pronomen": "Ich"
   },
   {
    "num": 29,
    "word": "Wo hast du Sport? (die Turnhalle) Antworte mit einem ganzen Satz.",
    "pronomen": "Ich"
   },
   {
    "num": 30,
    "word": "Wo isst du zu Mittag? (die Mensa) Antworte mit einem ganzen Satz.",
    "pronomen": "Ich"
   },
   {
    "num": 31,
    "word": "erzählen",
    "pronomen": "Ich"
   },
   {
    "num": 32,
    "word": "beschriften",
    "pronomen": "Wir"
   }
  ],
  "teil4": [
   {
    "num": 33,
    "word": "die Schule",
    "correct": "die Schulen"
   },
   {
    "num": 34,
    "word": "der Gang",
    "correct": "die Gänge"
   },
   {
    "num": 35,
    "word": "der Raum",
    "correct": "die Räume"
   },
   {
    "num": 36,
    "word": "die Mensa",
    "correct": "die Mensen"
   },
   {
    "num": 37,
    "word": "der Sportplatz",
    "correct": "die Sportplätze"
   },
   {
    "num": 38,
    "word": "die Bücherei",
    "correct": "die Büchereien"
   },
   {
    "num": 39,
    "word": "der Musikraum",
    "correct": "die Musikräume"
   },
   {
    "num": 40,
    "word": "der Physiksaal",
    "correct": "die Physiksäle"
   }
  ],
  "teil1Hint": "Welches Bild aus dem Schulplan passt zum Wort? Tippe auf das richtige Bild.",
  "teil2Hint": "Wähle das richtige Wort. Schau dir dazu den Stundenplan und den Schulplan an.",
  "teil4Label": "Einzahl – Mehrzahl",
  "teil4Hint": "Schreibe die Mehrzahl mit Artikel (z. B. die Tür → die Türen).",
  "teil4OhneWortbank": true,
  "teil4Frage": "Mehrzahl von „{word}“",
  "testVersion": 3,
  "nummernAltV": {
   "1": {
    "teil2": {
     "1": 0,
     "2": 0,
     "3": 0,
     "4": 0,
     "5": 9,
     "6": 10,
     "7": 0,
     "8": 0,
     "9": 11,
     "10": 12
    },
    "teil3": {
     "11": 28,
     "12": 29,
     "13": 30,
     "14": 31,
     "15": 32
    },
    "teil4": {
     "16": 33,
     "17": 0,
     "18": 34,
     "19": 35,
     "20": 36,
     "21": 0,
     "22": 37,
     "23": 38
    }
   },
   "2": {
    "teil2": {
     "1": 0,
     "2": 0,
     "3": 0,
     "4": 0,
     "5": 9,
     "6": 10,
     "7": 0,
     "8": 0,
     "9": 11,
     "10": 12,
     "11": 0,
     "12": 0,
     "13": 18,
     "14": 0,
     "15": 0,
     "16": 19,
     "17": 0,
     "18": 20,
     "19": 21,
     "20": 22,
     "21": 23,
     "22": 24,
     "23": 25,
     "24": 26,
     "25": 0,
     "26": 0,
     "27": 0,
     "28": 27
    },
    "teil3": {
     "29": 28,
     "30": 29,
     "31": 30,
     "32": 31,
     "33": 32
    },
    "teil4": {
     "34": 33,
     "35": 0,
     "36": 34,
     "37": 35,
     "38": 36,
     "39": 0,
     "40": 37,
     "41": 38
    }
   }
  }
 },
 "a1_lf5_schritt2": {
  "title": "Was ist das?",
  "sub": "A1.5 Schule — Schritt 2 (Klassenzimmer, Mäppchen, Farben)",
  "teil1": [
   {
    "num": 1,
    "word": "die Tafel",
    "icons": [
     "Ding_Regal",
     "Ding_Tafel",
     "Ding_Lampe",
     "Ding_Uhr"
    ],
    "correct": 1
   },
   {
    "num": 2,
    "word": "die Uhr",
    "icons": [
     "Ding_Tafel",
     "Ding_Globus",
     "Ding_Lampe",
     "Ding_Uhr"
    ],
    "correct": 3
   },
   {
    "num": 3,
    "word": "der Tisch",
    "icons": [
     "Ding_Buch",
     "Ding_Lampe",
     "Ding_Tisch",
     "Ding_Schultasche"
    ],
    "correct": 2
   },
   {
    "num": 4,
    "word": "die Lampe",
    "icons": [
     "Ding_Lampe",
     "Ding_Vorhang",
     "Ding_Uhr",
     "Ding_Teppich"
    ],
    "correct": 0
   },
   {
    "num": 5,
    "word": "das Buch",
    "icons": [
     "Ding_Vorhang",
     "Ding_Buch",
     "Ding_Uhr",
     "Ding_Tafel"
    ],
    "correct": 1
   },
   {
    "num": 6,
    "word": "der Globus",
    "icons": [
     "Ding_Schultasche",
     "Ding_Lampe",
     "Ding_Globus",
     "Ding_Papierkorb"
    ],
    "correct": 2
   },
   {
    "num": 7,
    "word": "der Stuhl",
    "icons": [
     "Ding_Buch",
     "Ding_Vorhang",
     "Ding_Stuhl",
     "Ding_Uhr"
    ],
    "correct": 2
   },
   {
    "num": 8,
    "word": "die Schultasche",
    "icons": [
     "Ding_Regal",
     "Ding_Schultasche",
     "Ding_Teppich",
     "Ding_Papierkorb"
    ],
    "correct": 1
   },
   {
    "num": 9,
    "word": "der Vorhang",
    "icons": [
     "S_a1_lf5_schritt2_der_Vorhang",
     "S_a1_lf5_schritt2_die_Schultasche",
     "S_a1_lf5_schritt2_das_Regal",
     "S_a1_lf5_schritt2_das_Maeppchen"
    ],
    "correct": 0,
    "auto": "schrittbild"
   },
   {
    "num": 10,
    "word": "grün",
    "icons": [
     "S_a1_lf5_schritt2_der_Papierkorb",
     "S_a1_lf5_schritt2_der_Bleistift",
     "S_a1_lf5_schritt2_Farbe_gruen",
     "S_a1_lf5_schritt2_der_Spitzer"
    ],
    "correct": 2,
    "auto": "schrittbild"
   },
   {
    "num": 11,
    "word": "gelb",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_gelb",
     "S_a1_lf5_schritt2_Farbe_grau",
     "S_a1_lf5_schritt2_Farbe_blau",
     "S_a1_lf5_schritt2_das_Buch"
    ],
    "correct": 0,
    "auto": "schrittbild"
   },
   {
    "num": 12,
    "word": "rot",
    "icons": [
     "S_a1_lf5_schritt2_das_Regal",
     "S_a1_lf5_schritt2_die_Uhr",
     "S_a1_lf5_schritt2_Farbe_rot",
     "S_a1_lf5_schritt2_Farbe_orange"
    ],
    "correct": 2,
    "auto": "schrittbild"
   },
   {
    "num": 13,
    "word": "orange",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_blau",
     "S_a1_lf5_schritt2_Farbe_orange",
     "S_a1_lf5_schritt2_Farbe_bunt",
     "S_a1_lf5_schritt2_der_Globus"
    ],
    "correct": 1,
    "auto": "schrittbild"
   },
   {
    "num": 14,
    "word": "braun",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_orange",
     "S_a1_lf5_schritt2_Farbe_gelb",
     "S_a1_lf5_schritt2_Farbe_braun",
     "S_a1_lf5_schritt2_Farbe_bunt"
    ],
    "correct": 2,
    "auto": "schrittbild"
   },
   {
    "num": 15,
    "word": "blau",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_rot",
     "S_a1_lf5_schritt2_Farbe_blau",
     "S_a1_lf5_schritt2_der_Globus",
     "S_a1_lf5_schritt2_Farbe_bunt"
    ],
    "correct": 1,
    "auto": "schrittbild"
   },
   {
    "num": 16,
    "word": "lila / violett",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_braun",
     "S_a1_lf5_schritt2_Farbe_bunt",
     "S_a1_lf5_schritt2_die_Lampe",
     "S_a1_lf5_schritt2_Farbe_lila"
    ],
    "correct": 3,
    "auto": "schrittbild"
   },
   {
    "num": 17,
    "word": "grau",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_grau",
     "S_a1_lf5_schritt2_das_Regal",
     "S_a1_lf5_schritt2_die_Schultasche_2",
     "S_a1_lf5_schritt2_die_Tafel"
    ],
    "correct": 0,
    "auto": "schrittbild"
   },
   {
    "num": 18,
    "word": "schwarz",
    "icons": [
     "S_a1_lf5_schritt2_die_Schultasche_2",
     "S_a1_lf5_schritt2_Farbe_lila",
     "S_a1_lf5_schritt2_Farbe_schwarz",
     "S_a1_lf5_schritt2_Farbe_gelb"
    ],
    "correct": 2,
    "auto": "schrittbild"
   },
   {
    "num": 19,
    "word": "bunt",
    "icons": [
     "S_a1_lf5_schritt2_Farbe_rot",
     "S_a1_lf5_schritt2_das_Buch",
     "S_a1_lf5_schritt2_Farbe_bunt",
     "S_a1_lf5_schritt2_der_Tisch"
    ],
    "correct": 2,
    "auto": "schrittbild"
   },
   {
    "num": 20,
    "word": "der Bleistift",
    "icons": [
     "S_a1_lf5_schritt2_die_Lampe",
     "S_a1_lf5_schritt2_das_Maeppchen",
     "S_a1_lf5_schritt2_der_Bleistift",
     "S_a1_lf5_schritt2_der_Globus"
    ],
    "correct": 2,
    "auto": "schrittbild"
   }
  ],
  "teil2": [
   {
    "num": 21,
    "vor": "Was ist das? – Das ist",
    "nach": "Tafel.",
    "options": [
     "die",
     "der",
     "das"
    ],
    "correct": 0
   },
   {
    "num": 22,
    "vor": "Was ist das? – Das ist",
    "nach": "Tisch.",
    "options": [
     "der",
     "die",
     "das"
    ],
    "correct": 0
   },
   {
    "num": 23,
    "vor": "Was ist das? – Das ist",
    "nach": "Buch.",
    "options": [
     "das",
     "der",
     "die"
    ],
    "correct": 0
   },
   {
    "num": 24,
    "vor": "Was ist das? – Das ist",
    "nach": "Uhr.",
    "options": [
     "der",
     "das",
     "die"
    ],
    "correct": 2
   },
   {
    "num": 25,
    "vor": "Was ist das? – Das ist",
    "nach": "Globus.",
    "options": [
     "die",
     "das",
     "der"
    ],
    "correct": 2
   },
   {
    "num": 26,
    "vor": "Was ist das? – Das ist",
    "nach": "Regal.",
    "options": [
     "das",
     "die",
     "der"
    ],
    "correct": 0
   },
   {
    "num": 27,
    "vor": "Der Tisch ist grün. Das ist der",
    "nach": "Tisch.",
    "options": [
     "grünes",
     "grüne",
     "grüner"
    ],
    "correct": 1
   },
   {
    "num": 28,
    "vor": "Die Tafel ist grün. Das ist eine",
    "nach": "Tafel.",
    "options": [
     "grünes",
     "grüne",
     "grüner"
    ],
    "correct": 1
   },
   {
    "num": 29,
    "vor": "Das Mäppchen ist blau. Das ist ein",
    "nach": "Mäppchen.",
    "options": [
     "blaues",
     "blaue",
     "blauer"
    ],
    "correct": 0
   },
   {
    "num": 30,
    "vor": "Der Bleistift ist grün. Das ist ein",
    "nach": "Bleistift.",
    "options": [
     "grünes",
     "grüne",
     "grüner"
    ],
    "correct": 2
   },
   {
    "num": 31,
    "vor": "Nr. 1 ist",
    "nach": ".",
    "options": [
     "der Kugelschreiber",
     "der Buntstift",
     "das Lineal"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 32,
    "vor": "Nr. 2 ist",
    "nach": ".",
    "options": [
     "der Füller",
     "der Kugelschreiber",
     "die Schere"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 33,
    "vor": "Nr. 3 ist",
    "nach": ".",
    "options": [
     "der Klebstoff",
     "der Zirkel",
     "der Buntstift"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 34,
    "vor": "Nr. 4 ist",
    "nach": ".",
    "options": [
     "der Filzstift",
     "das Lineal",
     "das Geodreieck"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 35,
    "vor": "Nr. 5 ist",
    "nach": ".",
    "options": [
     "der Tesafilm",
     "der Filzstift",
     "das Geodreieck"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 36,
    "vor": "Nr. 6 ist",
    "nach": ".",
    "options": [
     "der Radiergummi",
     "der Filzstift",
     "das Geodreieck"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 37,
    "vor": "Nr. 7 ist",
    "nach": ".",
    "options": [
     "der Buntstift",
     "der Filzstift",
     "das Lineal"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 38,
    "vor": "Nr. 9 ist",
    "nach": ".",
    "options": [
     "das Lineal",
     "der Klebstoff",
     "die Schere"
    ],
    "correct": 1,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 39,
    "vor": "Nr. 10 ist",
    "nach": ".",
    "options": [
     "der Zirkel",
     "der Radiergummi",
     "das Geodreieck"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 40,
    "vor": "Nr. 11 ist",
    "nach": ".",
    "options": [
     "der Zirkel",
     "der Füller",
     "die Schere"
    ],
    "correct": 2,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   },
   {
    "num": 41,
    "vor": "Nr. 12 ist",
    "nach": ".",
    "options": [
     "der Kugelschreiber",
     "der Füller",
     "die Schere"
    ],
    "correct": 0,
    "bildGross": "S_a1_lf5_schritt2_maeppchen_nummeriert",
    "bildTitel": "Das Mäppchen",
    "auto": "schrittbild"
   }
  ],
  "teil3": [
   {
    "num": 42,
    "word": "Was ist das? (die Tafel) Antworte mit einem ganzen Satz.",
    "pronomen": "Das"
   },
   {
    "num": 43,
    "word": "Was ist das? (der Stuhl) Antworte mit einem ganzen Satz.",
    "pronomen": "Das"
   },
   {
    "num": 44,
    "word": "Welche Farbe hat der Tisch? (grün) Antworte mit einem ganzen Satz.",
    "pronomen": "Der Tisch"
   },
   {
    "num": 45,
    "word": "Welche Farbe hat die Schultasche? (rot) Antworte mit einem ganzen Satz.",
    "pronomen": "Die Schultasche"
   },
   {
    "num": 46,
    "word": "sich verändern",
    "pronomen": "Das Adjektiv"
   }
  ],
  "teil4": [
   {
    "num": 47,
    "word": "Bild Bleistift + grün",
    "label": "Bild Bleistift + grün",
    "bild": "A15_GF_Bleistift_gruen",
    "correct": "der grüne Bleistift",
    "akzeptiert": [
     "ein grüner Bleistift",
     "Das ist der grüne Bleistift",
     "Das ist ein grüner Bleistift"
    ]
   },
   {
    "num": 48,
    "word": "Bild Schultasche + rot",
    "label": "Bild Schultasche + rot",
    "bild": "A15_GF_Schultasche_rot",
    "correct": "die rote Schultasche",
    "akzeptiert": [
     "eine rote Schultasche",
     "Das ist die rote Schultasche",
     "Das ist eine rote Schultasche"
    ]
   },
   {
    "num": 49,
    "word": "Bild Mäppchen + blau",
    "label": "Bild Mäppchen + blau",
    "bild": "A15_GF_Maeppchen_blau",
    "correct": "das blaue Mäppchen",
    "akzeptiert": [
     "ein blaues Mäppchen",
     "Das ist das blaue Mäppchen",
     "Das ist ein blaues Mäppchen"
    ]
   },
   {
    "num": 50,
    "word": "Bild Spitzer + schwarz",
    "label": "Bild Spitzer + schwarz",
    "bild": "A15_GF_Spitzer_schwarz",
    "correct": "der schwarze Spitzer",
    "akzeptiert": [
     "ein schwarzer Spitzer",
     "Das ist der schwarze Spitzer",
     "Das ist ein schwarzer Spitzer"
    ]
   },
   {
    "num": 51,
    "word": "das Waschbecken",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_das_Waschbecken",
    "correct": "das Waschbecken",
    "beschrifte": true,
    "auto": "schrittbild"
   },
   {
    "num": 52,
    "word": "das Regal",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_das_Regal",
    "correct": "das Regal",
    "beschrifte": true,
    "auto": "schrittbild"
   },
   {
    "num": 53,
    "word": "das Mäppchen",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_das_Maeppchen",
    "correct": "das Mäppchen",
    "beschrifte": true,
    "auto": "schrittbild",
    "akzeptiert": [
     "das Federmäppchen",
     "die Federmappe"
    ]
   },
   {
    "num": 54,
    "word": "der Schwamm",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_der_Schwamm",
    "correct": "der Schwamm",
    "beschrifte": true,
    "auto": "schrittbild"
   },
   {
    "num": 55,
    "word": "der Papierkorb",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_der_Papierkorb",
    "correct": "der Papierkorb",
    "beschrifte": true,
    "auto": "schrittbild",
    "akzeptiert": [
     "der Mülleimer"
    ]
   },
   {
    "num": 56,
    "word": "der Spitzer",
    "frage": "Beschrifte das Bild ({word})",
    "bild": "S_a1_lf5_schritt2_der_Spitzer",
    "correct": "der Spitzer",
    "beschrifte": true,
    "auto": "schrittbild",
    "akzeptiert": [
     "der Anspitzer"
    ]
   }
  ],
  "teil1Hint": "Welches Bild passt zum Wort? Tippe auf das richtige Bild.",
  "teil4Label": "Gegenstand und Farbe",
  "teil4Hint": "Schau die zwei Bilder an: Welcher Gegenstand, welche Farbe? Schreibe mit Artikel (z. B. der grüne Tisch).",
  "teil4OhneWortbank": true,
  "teil4Frage": "Welche Farbe hat das Bild? „{word}“",
  "testVersion": 3,
  "nummernAltV": {
   "1": {
    "teil1": {
     "1": 1,
     "2": 2,
     "3": 3,
     "4": 4,
     "5": 5,
     "6": 6,
     "7": 7,
     "8": 8
    },
    "teil2": {
     "9": 21,
     "10": 22,
     "11": 23,
     "12": 24,
     "13": 25,
     "14": 26,
     "15": 27,
     "16": 28,
     "17": 29,
     "18": 30
    },
    "teil3": {
     "19": 42,
     "20": 43,
     "21": 44,
     "22": 45,
     "23": 46
    },
    "teil4": {
     "24": 0,
     "25": 0,
     "26": 0,
     "27": 0,
     "28": 0,
     "29": 0,
     "30": 0,
     "31": 0,
     "32": 0,
     "33": 0
    }
   },
   "2": {
    "teil1": {
     "1": 1,
     "2": 2,
     "3": 3,
     "4": 4,
     "5": 5,
     "6": 6,
     "7": 7,
     "8": 8,
     "9": 9,
     "10": 10,
     "11": 11,
     "12": 12,
     "13": 13,
     "14": 14,
     "15": 15,
     "16": 16,
     "17": 17,
     "18": 18,
     "19": 19,
     "20": 20
    },
    "teil2": {
     "21": 21,
     "22": 22,
     "23": 23,
     "24": 24,
     "25": 25,
     "26": 26,
     "27": 27,
     "28": 28,
     "29": 29,
     "30": 30
    },
    "teil3": {
     "31": 42,
     "32": 43,
     "33": 44,
     "34": 45,
     "35": 46
    },
    "teil4": {
     "36": 0,
     "37": 0,
     "38": 0,
     "39": 0,
     "40": 0,
     "41": 0,
     "42": 0,
     "43": 0,
     "44": 0,
     "45": 0,
     "46": 51,
     "47": 52,
     "48": 53,
     "49": 54,
     "50": 55,
     "51": 56
    }
   }
  }
 },
 "a1_lf5_schritt3": {
  "title": "Wer ist das? Was ist das?",
  "sub": "A1.5 Schule — Schritt 3 (Personen in der Schule, wer oder was?)",
  "teil1": [
   {
    "num": 1,
    "word": "der Hausmeister",
    "icons": [
     "A15_der_Hausmeister",
     "A15_der_Rektor",
     "A15_die_Lehrerin",
     "A15_der_Schueler"
    ],
    "correct": 0
   },
   {
    "num": 2,
    "word": "die Lehrerin",
    "icons": [
     "A15_der_Schueler",
     "A15_der_Rektor",
     "A15_die_Putzfrau",
     "A15_die_Lehrerin"
    ],
    "correct": 3
   },
   {
    "num": 3,
    "word": "der Lehrer",
    "icons": [
     "A15_die_Sekretaerin",
     "A15_der_Lehrer",
     "A15_die_Lehrerin",
     "A15_die_Schuelerin"
    ],
    "correct": 1
   },
   {
    "num": 4,
    "word": "der Rektor",
    "icons": [
     "A15_der_Lehrer",
     "A15_der_Hausmeister",
     "A15_der_Rektor",
     "A15_die_Putzfrau"
    ],
    "correct": 2
   },
   {
    "num": 5,
    "word": "die Putzfrau",
    "icons": [
     "A15_die_Schuelerin",
     "A15_die_Putzfrau",
     "A15_der_Lehrer",
     "A15_der_Schueler"
    ],
    "correct": 1
   },
   {
    "num": 6,
    "word": "der Schüler",
    "icons": [
     "A15_der_Schueler",
     "A15_der_Lehrer",
     "A15_der_Rektor",
     "A15_die_Sekretaerin"
    ],
    "correct": 0
   },
   {
    "num": 7,
    "word": "die Schülerin",
    "icons": [
     "A15_der_Schueler",
     "A15_die_Putzfrau",
     "A15_die_Schuelerin",
     "A15_der_Hausmeister"
    ],
    "correct": 2
   },
   {
    "num": 8,
    "word": "die Sekretärin",
    "icons": [
     "A15_der_Lehrer",
     "A15_die_Sekretaerin",
     "A15_der_Hausmeister",
     "A15_der_Rektor"
    ],
    "correct": 1
   }
  ],
  "teil2": [
   {
    "num": 9,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Wer",
     "Was"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Lehrer"
   },
   {
    "num": 10,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Heft"
   },
   {
    "num": 11,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Schultasche"
   },
   {
    "num": 12,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 1,
    "bildGross": "A15_WW_Sekretaerin"
   },
   {
    "num": 13,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Lampe"
   },
   {
    "num": 14,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Fueller"
   },
   {
    "num": 15,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Wer",
     "Was"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Hausmeister"
   },
   {
    "num": 16,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 1,
    "bildGross": "A15_WW_Schuelerin"
   },
   {
    "num": 17,
    "vor": "",
    "nach": "ist das?",
    "options": [
     "Was",
     "Wer"
    ],
    "correct": 0,
    "bildGross": "A15_WW_Tafel"
   },
   {
    "num": 18,
    "vor": "Das ist",
    "nach": "Sekretärin.",
    "options": [
     "der",
     "die",
     "das"
    ],
    "correct": 1
   },
   {
    "num": 19,
    "vor": "Das ist",
    "nach": "Füller.",
    "options": [
     "der",
     "die",
     "das"
    ],
    "correct": 0
   },
   {
    "num": 20,
    "vor": "Das ist",
    "nach": "Lampe.",
    "options": [
     "die",
     "der",
     "das"
    ],
    "correct": 0
   },
   {
    "num": 21,
    "vor": "Das ist",
    "nach": "Hausmeister.",
    "options": [
     "das",
     "die",
     "der"
    ],
    "correct": 2
   },
   {
    "num": 22,
    "vor": "Das ist",
    "nach": "Heft.",
    "options": [
     "der",
     "die",
     "das"
    ],
    "correct": 2
   },
   {
    "num": 23,
    "vor": "Das ist",
    "nach": "Schultasche.",
    "options": [
     "das",
     "die",
     "der"
    ],
    "correct": 1
   }
  ],
  "teil3": [
   {
    "num": 24,
    "word": "Schau das Bild an. Frage und antworte: Schreibe die Frage und die Antwort (wie: Wer ist das? – Das ist der Lehrer.).",
    "pronomen": "",
    "bild": "A15_WW_Schuelerin"
   },
   {
    "num": 25,
    "word": "Schau das Bild an. Frage und antworte: Schreibe die Frage und die Antwort (wie: Wer ist das? – Das ist der Lehrer.).",
    "pronomen": "",
    "bild": "A15_WW_Lampe"
   },
   {
    "num": 26,
    "word": "Schau das Bild an. Frage und antworte: Schreibe die Frage und die Antwort (wie: Wer ist das? – Das ist der Lehrer.).",
    "pronomen": "",
    "bild": "A15_WW_Hausmeister"
   },
   {
    "num": 27,
    "word": "Schau das Bild an. Frage und antworte: Schreibe die Frage und die Antwort (wie: Wer ist das? – Das ist der Lehrer.).",
    "pronomen": "",
    "bild": "A15_WW_Fueller"
   }
  ],
  "teil4": [
   {
    "num": 28,
    "word": "der Hausmeister → weiblich",
    "label": "der Hausmeister",
    "frage": "Weibliche Form: {word}",
    "correct": "die Hausmeisterin"
   },
   {
    "num": 29,
    "word": "der Rektor → weiblich",
    "label": "der Rektor",
    "frage": "Weibliche Form: {word}",
    "correct": "die Rektorin"
   },
   {
    "num": 30,
    "word": "der Putzmann → weiblich",
    "label": "der Putzmann",
    "frage": "Weibliche Form: {word}",
    "correct": "die Putzfrau"
   },
   {
    "num": 31,
    "word": "der Sekretär → weiblich",
    "label": "der Sekretär",
    "frage": "Weibliche Form: {word}",
    "correct": "die Sekretärin"
   },
   {
    "num": 32,
    "word": "die Person → Mehrzahl",
    "label": "die Person",
    "frage": "Mehrzahl: {word}",
    "correct": "die Personen"
   },
   {
    "num": 33,
    "word": "das Ding → Mehrzahl",
    "label": "das Ding",
    "frage": "Mehrzahl: {word}",
    "correct": "die Dinge"
   },
   {
    "num": 34,
    "word": "der Rektor → Mehrzahl",
    "label": "der Rektor",
    "frage": "Mehrzahl: {word}",
    "correct": "die Rektoren"
   },
   {
    "num": 35,
    "word": "die Tabelle → Mehrzahl",
    "label": "die Tabelle",
    "frage": "Mehrzahl: {word}",
    "correct": "die Tabellen"
   }
  ],
  "teil1Hint": "Welches Bild passt zum Wort? Tippe auf das richtige Bild.",
  "teil2Hint": "Merke: Nominativ – Wer oder was? Personen → wer? Dinge → was? Wähle die richtige Frage. Danach: Wähle den richtigen Artikel.",
  "teil4Label": "Männlich – weiblich, Einzahl – Mehrzahl",
  "teil4Hint": "Schreibe die weibliche Form oder die Mehrzahl, immer mit Artikel.",
  "teil4OhneWortbank": true
 },
 "a1_lf5_schritt4": {
  "title": "Wo ist das Heft?",
  "sub": "A1.5 Schule — Schritt 4 (Präpositionen mit Dativ: wo?)",
  "teil1": [],
  "teil2": [
   {
    "num": 1,
    "vor": "Nr. 1 ist",
    "nach": ".",
    "options": [
     "zwischen",
     "auf",
     "hinter"
    ],
    "correct": 1,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 2,
    "vor": "Nr. 2 ist",
    "nach": ".",
    "options": [
     "hinter",
     "vor",
     "unter"
    ],
    "correct": 2,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 3,
    "vor": "Nr. 3 ist",
    "nach": ".",
    "options": [
     "neben",
     "hinter",
     "vor"
    ],
    "correct": 2,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 4,
    "vor": "Nr. 4 ist",
    "nach": ".",
    "options": [
     "unter",
     "hinter",
     "vor"
    ],
    "correct": 1,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 5,
    "vor": "Nr. 5 ist",
    "nach": ".",
    "options": [
     "neben",
     "unter",
     "vor"
    ],
    "correct": 0,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 6,
    "vor": "Nr. 6 ist",
    "nach": ".",
    "options": [
     "vor",
     "unter",
     "in"
    ],
    "correct": 2,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 7,
    "vor": "Nr. 7 ist",
    "nach": ".",
    "options": [
     "auf",
     "unter",
     "zwischen"
    ],
    "correct": 2,
    "bildGross": "A15_Praepositionen",
    "bildTitel": "Welche Präposition passt?"
   },
   {
    "num": 8,
    "vor": "1. Das Mädchen ist",
    "nach": "Tafel.",
    "options": [
     "vor dem",
     "vor der",
     "vor die"
    ],
    "correct": 1,
    "bildGross": "A15_Klassenzimmer_nummeriert",
    "bildTitel": "Beschreibe (Präposition + Artikel)"
   },
   {
    "num": 9,
    "vor": "2. Das Kind ist",
    "nach": "Stuhl.",
    "options": [
     "auf den",
     "auf der",
     "auf dem"
    ],
    "correct": 2,
    "bildGross": "A15_Klassenzimmer_nummeriert",
    "bildTitel": "Beschreibe (Präposition + Artikel)"
   },
   {
    "num": 10,
    "vor": "3. Das Buch ist",
    "nach": "Regal.",
    "options": [
     "in der",
     "in dem",
     "in den"
    ],
    "correct": 1,
    "bildGross": "A15_Klassenzimmer_nummeriert",
    "bildTitel": "Beschreibe (Präposition + Artikel)"
   },
   {
    "num": 11,
    "vor": "4. Die Tasche ist",
    "nach": "Tisch.",
    "options": [
     "unter dem",
     "unter der",
     "unter den"
    ],
    "correct": 0,
    "bildGross": "A15_Klassenzimmer_nummeriert",
    "bildTitel": "Beschreibe (Präposition + Artikel)"
   },
   {
    "num": 12,
    "vor": "5. Der Junge ist",
    "nach": "Mädchen.",
    "options": [
     "neben den",
     "neben dem",
     "neben der"
    ],
    "correct": 1,
    "bildGross": "A15_Klassenzimmer_nummeriert",
    "bildTitel": "Beschreibe (Präposition + Artikel)"
   },
   {
    "num": 13,
    "vor": "der Tisch → auf",
    "nach": "Tisch",
    "options": [
     "der",
     "dem",
     "den"
    ],
    "correct": 1
   },
   {
    "num": 14,
    "vor": "die Tasche → in",
    "nach": "Tasche",
    "options": [
     "dem",
     "die",
     "der"
    ],
    "correct": 2
   },
   {
    "num": 15,
    "vor": "das Mädchen → hinter",
    "nach": "Mädchen",
    "options": [
     "dem",
     "das",
     "der"
    ],
    "correct": 0
   },
   {
    "num": 16,
    "vor": "die Stühle → neben",
    "nach": "Stühlen",
    "options": [
     "den",
     "der",
     "dem"
    ],
    "correct": 0
   }
  ],
  "teil3": [
   {
    "num": 17,
    "word": "Schau das Bild an. Wo ist die Schultasche? Schreibe einen ganzen Satz.",
    "pronomen": "Die Schultasche",
    "bild": "A15_S4_Schultasche_Tisch"
   },
   {
    "num": 18,
    "word": "Schau das Bild an. Wo ist die Schülerin? Schreibe einen ganzen Satz.",
    "pronomen": "Die Schülerin",
    "bild": "A15_S4_Schuelerin_Stuhl"
   },
   {
    "num": 19,
    "word": "Schau das Bild an. Wo ist die Schülerin? Schreibe einen ganzen Satz.",
    "pronomen": "Die Schülerin",
    "bild": "A15_S4_Schuelerin_Stuehle"
   },
   {
    "num": 20,
    "word": "Schau das Bild an. Wo ist das Papier? Schreibe einen ganzen Satz.",
    "pronomen": "Das Papier",
    "bild": "A15_S4_Papier_Papierkorb"
   },
   {
    "num": 21,
    "word": "Schau das Bild an. Wo ist das Buch? Schreibe einen ganzen Satz.",
    "pronomen": "Das Buch",
    "bild": "A15_S4_Buch_Schultasche"
   }
  ],
  "teil4": [
   {
    "num": 22,
    "word": "auf → Gegenteil",
    "label": "auf",
    "frage": "Gegenteil von {word}",
    "correct": "unter"
   },
   {
    "num": 23,
    "word": "vor → Gegenteil",
    "label": "vor",
    "frage": "Gegenteil von {word}",
    "correct": "hinter"
   },
   {
    "num": 24,
    "word": "Das Heft ist ___ Mäppchen. (in)",
    "frage": "{word}",
    "correct": "im",
    "akzeptiert": [
     "in dem"
    ]
   },
   {
    "num": 25,
    "word": "Das Heft ist ___ Büchern. (zwischen)",
    "frage": "{word}",
    "correct": "zwischen den"
   },
   {
    "num": 26,
    "word": "Der Globus ist ___ Schrank. (auf)",
    "frage": "{word}",
    "correct": "auf dem"
   }
  ],
  "teil2Hint": "Merke: Wo? → Dativ → der Artikel verändert sich (der Tisch → auf dem Tisch, die Tasche → in der Tasche, die Stühle → neben den Stühlen). Wähle die richtige Antwort.",
  "teil4Label": "Gegenteile und Präposition + Artikel",
  "teil4Hint": "Schreibe das Gegenteil. Bei den Sätzen: Schreibe Präposition + Artikel in die Lücke (z. B. auf dem).",
  "teil4OhneWortbank": true
 },
 "a1_lf5_abschlusstest": {
  "title": "Lernfeld-Test A1.5",
  "sub": "A1.5 Schule — Lernfeld-Test (35,5 Punkte, davon 4 von der Lehrkraft)",
  "type": "abschlusstest_generisch",
  "abschnitte": [
   {
    "titel": "Ergänze.",
    "kurz": "Verbform",
    "hinweis": "Schreibe die Verbformen. Jedes Feld 0,5 Punkte (15 P.).",
    "art": "konjugation",
    "gruppen": [
     {
      "verbs": [
       "beschriften",
       "erzählen",
       "einordnen",
       "sich verändern",
       "beschreiben"
      ],
      "forms": {
       "beschriften": [
        "beschrifte",
        "beschriftest",
        "beschriftet",
        "beschriften",
        "beschriftet",
        "beschriften"
       ],
       "erzählen": [
        "erzähle",
        "erzählst",
        "erzählt",
        "erzählen",
        "erzählt",
        "erzählen"
       ],
       "einordnen": [
        "ordne ein",
        "ordnest ein",
        "ordnet ein",
        "ordnen ein",
        "ordnet ein",
        "ordnen ein"
       ],
       "sich verändern": [
        "verändere mich",
        "veränderst dich",
        "verändert sich",
        "verändern uns",
        "verändert euch",
        "verändern sich"
       ],
       "beschreiben": [
        "beschreibe",
        "beschreibst",
        "beschreibt",
        "beschreiben",
        "beschreibt",
        "beschreiben"
       ]
      },
      "ohneStamm": [
       "sich verändern",
       "einordnen"
      ]
     }
    ]
   },
   {
    "titel": "Der Stundenplan: Frage und antworte.",
    "kurz": "Stundenplan",
    "hinweis": "Schau den Stundenplan an. Nr. 1: jede Lücke 0,5 Punkte. Nr. 2 und 3 bewertet deine Lehrkraft (je 2 P.). Zusammen 5 P.",
    "bild": "A15_LT_Stundenplan",
    "art": "eingabe",
    "punkte": 0.5,
    "items": [
     {
      "frage": "1. – Was hast du am Montag in der ___ Stunde? – Deutsch.",
      "antwort": [
       "ersten",
       "1."
      ]
     },
     {
      "frage": "1. – Wo? – Ich habe ___ C12 Deutsch. (zwei Wörter)",
      "antwort": [
       "im Raum"
      ]
     },
     {
      "frage": "2. Schreibe selbst ein Gespräch wie in Nr. 1 zum Stundenplan (Dienstag).",
      "manuell": true,
      "lang": true,
      "punkte": 2
     },
     {
      "frage": "3. Schreibe selbst ein Gespräch wie in Nr. 1 zum Stundenplan (Mittwoch).",
      "manuell": true,
      "lang": true,
      "punkte": 2
     }
    ]
   },
   {
    "titel": "Ergänze: Wer ist das? Was ist das?",
    "kurz": "Wer oder was?",
    "hinweis": "Schreibe zu jedem Bild die Frage und die Antwort. Frage 1 Punkt, Antwort 1 Punkt (12 P.).",
    "beispiel": "Was ist das? – Das ist das Lineal.",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "bild": "A15_LT_Lehrerin",
      "frage": "Bild 1 – Frage:",
      "antwort": "Wer ist das?",
      "label": "Bild 1 (Lehrerin): Frage"
     },
     {
      "frage": "Bild 1 – Antwort:",
      "antwort": "Das ist die Lehrerin.",
      "label": "Bild 1: Antwort"
     },
     {
      "bild": "A15_LT_Heft",
      "frage": "Bild 2 – Frage:",
      "antwort": "Was ist das?",
      "label": "Bild 2 (Heft): Frage"
     },
     {
      "frage": "Bild 2 – Antwort:",
      "antwort": "Das ist das Heft.",
      "label": "Bild 2: Antwort"
     },
     {
      "bild": "A15_LT_Tafel",
      "frage": "Bild 3 – Frage:",
      "antwort": "Was ist das?",
      "label": "Bild 3 (Tafel): Frage"
     },
     {
      "frage": "Bild 3 – Antwort:",
      "antwort": "Das ist die Tafel.",
      "label": "Bild 3: Antwort"
     },
     {
      "bild": "A15_LT_Sekretaerin",
      "frage": "Bild 4 – Frage:",
      "antwort": "Wer ist das?",
      "label": "Bild 4 (Sekretärin): Frage"
     },
     {
      "frage": "Bild 4 – Antwort:",
      "antwort": "Das ist die Sekretärin.",
      "label": "Bild 4: Antwort"
     },
     {
      "bild": "A15_LT_Fueller",
      "frage": "Bild 5 – Frage:",
      "antwort": "Was ist das?",
      "label": "Bild 5 (Füller): Frage"
     },
     {
      "frage": "Bild 5 – Antwort:",
      "antwort": "Das ist der Füller.",
      "label": "Bild 5: Antwort"
     },
     {
      "bild": "A15_LT_Putzfrau",
      "frage": "Bild 6 – Frage:",
      "antwort": "Wer ist das?",
      "label": "Bild 6 (Putzfrau): Frage"
     },
     {
      "frage": "Bild 6 – Antwort:",
      "antwort": "Das ist die Putzfrau.",
      "label": "Bild 6: Antwort"
     }
    ]
   },
   {
    "titel": "Schreibe Sätze.",
    "kurz": "Sätze",
    "hinweis": "Schau die Bilder an. Lücke 0,5 Punkte, jeder Satz 1 Punkt (3,5 P.).",
    "art": "eingabe",
    "punkte": 1,
    "items": [
     {
      "bild": "A15_LT_Stift_Maeppchen",
      "frage": "Der Stift ist ___ Mäppchen.",
      "antwort": [
       "im",
       "in dem"
      ],
      "punkte": 0.5
     },
     {
      "bild": "A15_LT_Globus_Schrank",
      "frage": "Der …",
      "antwort": [
       "Der Globus ist auf dem Schrank."
      ]
     },
     {
      "bild": "A15_LT_Handtuch_Waschbecken",
      "frage": "Das …",
      "antwort": [
       "Das Handtuch ist neben dem Waschbecken."
      ]
     },
     {
      "bild": "A15_LT_Schueler_Lehrer",
      "frage": "Der …",
      "antwort": [
       "Der Schüler ist zwischen den Lehrern."
      ]
     }
    ]
   }
  ],
  "punkte_max": 31.5,
  "testVersion": 2
 }
});
registerActivities({
 "a1_lf5_memory": {
  "title": "Klassenzimmer-Memory",
  "sub": "A1.5 Schule — Spiel zu Schritt 2",
  "type": "memory",
  "schritt": 2,
  "anzahl": 8,
  "hinweis": "Decke zwei Karten auf: Das Bild und das Wort passen zusammen. Lies das Wort laut!",
  "pairs": [
   [
    {
     "bild": "Ding_Tafel"
    },
    "die Tafel"
   ],
   [
    {
     "bild": "Ding_Uhr"
    },
    "die Uhr"
   ],
   [
    {
     "bild": "Ding_Tisch"
    },
    "der Tisch"
   ],
   [
    {
     "bild": "Ding_Lampe"
    },
    "die Lampe"
   ],
   [
    {
     "bild": "Ding_Buch"
    },
    "das Buch"
   ],
   [
    {
     "bild": "Ding_Globus"
    },
    "der Globus"
   ],
   [
    {
     "bild": "Ding_Stuhl"
    },
    "der Stuhl"
   ],
   [
    {
     "bild": "Ding_Schultasche"
    },
    "die Schultasche"
   ],
   [
    {
     "bild": "Ding_Regal"
    },
    "das Regal"
   ],
   [
    {
     "bild": "Ding_Vorhang"
    },
    "der Vorhang"
   ],
   [
    {
     "bild": "Ding_Teppich"
    },
    "der Teppich"
   ],
   [
    {
     "bild": "Ding_Papierkorb"
    },
    "der Papierkorb"
   ]
  ]
 },
 "a1_lf5_domino": {
  "title": "Schuldomino",
  "sub": "A1.5 Schule — Schritt 5 (Spiel)",
  "type": "domino",
  "schritt": 5,
  "passtText": " (Satz und Bild). Lies den Satz laut",
  "pairs": [
   [
    "Der Bleistift ist auf dem Pult.",
    "BILD:A15_Domino_Pult_Bleistift"
   ],
   [
    "Die Schultasche ist unter dem Tisch.",
    "BILD:A15_Domino_Tisch_Schultasche"
   ],
   [
    "Der Füller ist in dem Mäppchen.",
    "BILD:A15_Domino_Maeppchen_Fueller"
   ],
   [
    "Der Lehrer ist zwischen den Schülern.",
    "BILD:A15_Domino_Lehrer_Schueler"
   ],
   [
    "Der Rektor ist hinter dem Tisch.",
    "BILD:A15_Domino_Rektor_Tisch"
   ],
   [
    "Die Kreide ist unter der Tafel.",
    "BILD:A15_Domino_Kreide_Tafel"
   ],
   [
    "Das Tischtuch ist auf dem Tisch.",
    "BILD:A15_Domino_Tischtuch_Tisch"
   ],
   [
    "Der Radiergummi ist in dem Mäppchen.",
    "BILD:A15_Domino_Maeppchen_Radiergummi"
   ],
   [
    "Der Papierkorb ist neben dem Waschbecken.",
    "BILD:A15_Domino_Waschbecken_Papierkorb"
   ],
   [
    "Das Heft ist in der Schultasche.",
    "BILD:A15_Domino_Schultasche_Heft"
   ],
   [
    "Die Kinder sind in der Turnhalle.",
    "BILD:A15_Domino_Kinder_Turnhalle"
   ],
   [
    "Das Lineal ist neben den Stiften.",
    "BILD:A15_Domino_Lineal_Stifte"
   ],
   [
    "Der Ordner ist zwischen den Büchern.",
    "BILD:A15_Domino_Ordner_Buecher"
   ],
   [
    "Der Globus ist auf dem Schrank.",
    "BILD:A15_Domino_Schrank_Globus"
   ],
   [
    "Das Handtuch ist neben dem Waschbecken.",
    "BILD:A15_Domino_Handtuch_Waschbecken"
   ],
   [
    "Das Papier ist in dem Papierkorb.",
    "BILD:A15_Domino_Papierkorb_Papier"
   ],
   [
    "Der Schüler ist zwischen den Lehrern.",
    "BILD:A15_Domino_Schueler_Lehrer"
   ],
   [
    "Das Papier ist neben dem Papierkorb.",
    "BILD:A15_Domino_Papier_neben_Papierkorb"
   ],
   [
    "Das Mäppchen ist unter dem Tisch.",
    "BILD:A15_Domino_Tisch_Maeppchen"
   ]
  ]
 }
});
