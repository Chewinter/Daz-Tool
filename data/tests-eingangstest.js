/* Einstufungstest A1 (vor A2). */
registerTests({
 "eingangstest_a1": {
  "title": "Einstufungstest A1",
  "sub": "Bevor es mit A2 losgeht — prüfen wir, ob A1 wirklich sitzt",
  "type": "eingangstest",
  "schwelle": 85,
  "fragenProRunde": 10,
  "bereiche": [
   {
    "id": "bereich1",
    "name": "Begrüßung & Personalpronomen",
    "pool": [
     {
      "type": "mc",
      "prompt": "Es ist 8 Uhr morgens. Was sagst du?",
      "options": [
       "Guten Morgen",
       "Gute Nacht",
       "Guten Abend"
      ],
      "correct": 0
     },
     {
      "type": "mc",
      "prompt": "Es ist 22 Uhr, du gehst ins Bett. Was sagst du?",
      "options": [
       "Guten Tag",
       "Gute Nacht",
       "Guten Morgen"
      ],
      "correct": 1
     },
     {
      "type": "mc",
      "prompt": "Du verlässt einen Freund. Was sagst du?",
      "options": [
       "Auf Wiedersehen",
       "Guten Appetit",
       "Bitte"
      ],
      "correct": 0
     },
     {
      "type": "text",
      "prompt": "___ heiße Anna. Wie heißt du?",
      "answer": "Ich"
     },
     {
      "type": "text",
      "prompt": "Ich komme aus Syrien. Woher ___ du?",
      "answer": "kommst"
     },
     {
      "type": "text",
      "prompt": "Er ___ (kommen) aus Polen.",
      "answer": "kommt"
     },
     {
      "type": "text",
      "prompt": "Wir ___ (sein) Schüler.",
      "answer": "sind"
     },
     {
      "type": "text",
      "prompt": "Ich ___ (sein) 25 Jahre alt.",
      "answer": "bin"
     },
     {
      "type": "text",
      "prompt": "Wie ___ (heißen) Sie? (Höflichkeitsform)",
      "answer": "heißen"
     },
     {
      "type": "text",
      "prompt": "Sie (Plural) ___ (kommen) aus Marokko.",
      "answer": "kommen"
     },
     {
      "type": "mc",
      "prompt": "Du triffst deine Lehrerin. Wie fragst du nach ihrem Namen?",
      "options": [
       "Wie heißt du?",
       "Wie heißen Sie?",
       "Wer bist du?"
      ],
      "correct": 1
     },
     {
      "type": "text",
      "prompt": "Ihr ___ (heißen) Tom und Lisa.",
      "answer": "heißt"
     }
    ]
   },
   {
    "id": "bereich2",
    "name": "Zahlen, Alter & Telefonnummer",
    "pool": [
     {
      "type": "text",
      "prompt": "Schreibe als Ziffer: einundzwanzig",
      "answer": "21"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Ziffer: siebenunddreißig",
      "answer": "37"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Ziffer: hundert",
      "answer": "100"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Wort: 45",
      "answer": "fünfundvierzig"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Wort: 12",
      "answer": "zwölf"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Wort: 68",
      "answer": "achtundsechzig"
     },
     {
      "type": "text",
      "prompt": "Ich bin 30 Jahre alt. Wie fragst du danach?",
      "answer": "Wie alt bist du?"
     },
     {
      "type": "text",
      "prompt": "(30 Jahre): Ich ___ dreißig Jahre alt.",
      "answer": "bin"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Ziffer: dreihundertfünfzig",
      "answer": "350"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Wort: 1000",
      "answer": [
       "eintausend",
       "tausend"
      ]
     },
     {
      "type": "text",
      "prompt": "Meine Telefonnummer ist 0176 2345678. Wie fragst du danach?",
      "answer": "Wie ist deine Telefonnummer?"
     },
     {
      "type": "text",
      "prompt": "Schreibe als Ziffer: neunundneunzig",
      "answer": "99"
     }
    ]
   },
   {
    "id": "bereich3",
    "name": "Familie & Possessivartikel",
    "pool": [
     {
      "type": "text",
      "prompt": "der Bruder + die Schwester = die ___",
      "answer": "Geschwister"
     },
     {
      "type": "text",
      "prompt": "der Vater + die Mutter = die ___",
      "answer": "Eltern"
     },
     {
      "type": "text",
      "prompt": "der Großvater + die Großmutter = die ___",
      "answer": "Großeltern"
     },
     {
      "type": "text",
      "prompt": "der Mann + die Frau = das ___",
      "answer": "Ehepaar"
     },
     {
      "type": "text",
      "prompt": "Das ist ___ (mein) Vater.",
      "answer": "mein"
     },
     {
      "type": "text",
      "prompt": "Das ist ___ (meine) Mutter.",
      "answer": "meine"
     },
     {
      "type": "text",
      "prompt": "Wie geht es ___ (dir)?",
      "answer": "dir"
     },
     {
      "type": "text",
      "prompt": "Es geht ___ (mir) gut, danke.",
      "answer": "mir"
     },
     {
      "type": "text",
      "prompt": "Kannst du ___ (ihm) helfen? (einem Mann)",
      "answer": "ihm"
     },
     {
      "type": "text",
      "prompt": "___ (der) Bruder, ___ (die) Schwester, ___ (das) Kind – wie heißt der Plural-Artikel? Ergänze: ___ Kinder",
      "answer": "die"
     },
     {
      "type": "text",
      "prompt": "Ich habe zwei Kinder: einen Sohn und eine ___.",
      "answer": "Tochter"
     },
     {
      "type": "text",
      "prompt": "Sprichst du Deutsch? Ja, ich spreche ___ (wenig) Deutsch.",
      "answer": "wenig"
     }
    ]
   },
   {
    "id": "bereich4",
    "name": "Zeit (Uhr, Wochentage, Monate)",
    "pool": [
     {
      "type": "clock",
      "hour": 3,
      "minute": 0,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "drei Uhr",
      "acceptable": [
       "drei uhr",
       "es ist drei uhr"
      ]
     },
     {
      "type": "clock",
      "hour": 6,
      "minute": 30,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "halb sieben",
      "acceptable": [
       "halb sieben",
       "es ist halb sieben"
      ]
     },
     {
      "type": "clock",
      "hour": 9,
      "minute": 15,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "viertel nach neun",
      "acceptable": [
       "viertel nach neun",
       "es ist viertel nach neun",
       "neun uhr fünfzehn"
      ]
     },
     {
      "type": "clock",
      "hour": 11,
      "minute": 45,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "viertel vor zwölf",
      "acceptable": [
       "viertel vor zwölf",
       "es ist viertel vor zwölf"
      ]
     },
     {
      "type": "clock",
      "hour": 12,
      "minute": 0,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "zwölf Uhr",
      "acceptable": [
       "zwölf uhr",
       "es ist zwölf uhr",
       "mittag",
       "mitternacht"
      ]
     },
     {
      "type": "clock",
      "hour": 4,
      "minute": 30,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "halb fünf",
      "acceptable": [
       "halb fünf",
       "es ist halb fünf"
      ]
     },
     {
      "type": "clock",
      "hour": 2,
      "minute": 15,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "viertel nach zwei",
      "acceptable": [
       "viertel nach zwei",
       "es ist viertel nach zwei"
      ]
     },
     {
      "type": "clock",
      "hour": 7,
      "minute": 45,
      "prompt": "Wie viel Uhr ist es?",
      "answer": "viertel vor acht",
      "acceptable": [
       "viertel vor acht",
       "es ist viertel vor acht"
      ]
     },
     {
      "type": "text",
      "prompt": "Nach Montag kommt ___.",
      "answer": "Dienstag"
     },
     {
      "type": "text",
      "prompt": "Nach Freitag kommt ___.",
      "answer": "Samstag"
     },
     {
      "type": "text",
      "prompt": "Der dritte Monat des Jahres ist ___.",
      "answer": "März"
     },
     {
      "type": "text",
      "prompt": "Der letzte Monat des Jahres ist ___.",
      "answer": "Dezember"
     },
     {
      "type": "text",
      "prompt": "Nach dem Winter kommt ___.",
      "answer": "Frühling"
     },
     {
      "type": "text",
      "prompt": "Vor dem Winter kommt ___.",
      "answer": "Herbst"
     },
     {
      "type": "text",
      "prompt": "Heute ist Mittwoch. Morgen ist ___.",
      "answer": "Donnerstag"
     },
     {
      "type": "text",
      "prompt": "Wie heißt der 1. Tag der Woche? der ___",
      "answer": "Montag"
     }
    ]
   },
   {
    "id": "bereich5",
    "name": "Schule, Farben & Adjektive",
    "pool": [
     {
      "type": "text",
      "prompt": "Der Tisch ist grün. Das ist ein grün___ Tisch.",
      "answer": "er"
     },
     {
      "type": "text",
      "prompt": "Die Tafel ist rot. Das ist eine rot___ Tafel.",
      "answer": "e"
     },
     {
      "type": "text",
      "prompt": "Das Heft ist blau. Das ist ein blau___ Heft.",
      "answer": "es"
     },
     {
      "type": "text",
      "prompt": "Welche Farbe hat eine Banane? ___",
      "answer": "gelb"
     },
     {
      "type": "text",
      "prompt": "Welche Farbe hat eine Tomate? ___",
      "answer": "rot"
     },
     {
      "type": "text",
      "prompt": "___ Tafel (bestimmter Artikel)",
      "answer": "die"
     },
     {
      "type": "text",
      "prompt": "___ Stuhl (bestimmter Artikel)",
      "answer": "der"
     },
     {
      "type": "text",
      "prompt": "___ Buch (bestimmter Artikel)",
      "answer": "das"
     },
     {
      "type": "text",
      "prompt": "In der Schule lernst du Zahlen im Fach ___.",
      "answer": [
       "Mathematik",
       "Mathe"
      ]
     },
     {
      "type": "text",
      "prompt": "Im Sportunterricht bist du in der ___.",
      "answer": [
       "Turnhalle",
       "Sporthalle"
      ]
     },
     {
      "type": "text",
      "prompt": "Wo isst du in der Schule mittags? In der ___.",
      "answer": [
       "Mensa",
       "Kantine",
       "Schulkantine"
      ]
     },
     {
      "type": "text",
      "prompt": "Was fragst du, wenn du wissen willst, was ein Gegenstand ist? ___ ist das?",
      "answer": "Was"
     },
     {
      "type": "text",
      "prompt": "Womit schreibst du an die Tafel? Mit der ___.",
      "answer": "Kreide"
     },
     {
      "type": "text",
      "prompt": "Wo sitzen die Schüler im Klassenzimmer? Am ___.",
      "answer": "Tisch"
     }
    ]
   }
  ]
 }
});
