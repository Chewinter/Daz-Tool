/* Lesespurgeschichten (Pilot) — nach "Kriminell gute Lesespurgeschichten Deutsch 9/10" (Annette Weber, Auer Verlag),
   von Chewinters Schule lizenziert. Eigene, textbasierte Umsetzung ohne die Original-Landkarte/den Original-Text:
   gleiche Rätsellogik (richtige vs. ähnliche falsche Orte, Sackgassen führen zurück), eigene kürzere Stationstexte. */
registerActivities({
 "a2_lesespur_bank": {
  "title": "Der Banküberfall",
  "sub": "Lesespurgeschichte — Der Banküberfall",
  "type": "lesespur",
  "karte": "Lesespur_Bank_Karte",
  "hinweis": "Lies jede Station genau — darin steckt ein Hinweis auf einen Ort auf der Karte. Schau auf der Karte nach, welche Ziffer zu diesem Ort passt, und wähle sie unten aus. Bei einer falschen Wahl bekommst du einen Hinweis und darfst es noch einmal versuchen.",
  "frage": "Welche Ziffer auf der Karte passt zu dem gesuchten Ort?",
  "start": "s1",
  "knoten": {
   "s1": {
    "text": "Doris hat heute ihren letzten Arbeitstag in der Bank – morgen beginnt ihre Rente. Sie steht gerade an einem Automaten für Kontoauszüge, direkt neben der Eingangstür, und füllt Papier nach. Da betritt ein maskierter Mann mit einer Pistole die Bank. „Überfall!“, schreit er. „Alle auf den Boden!“ Doris muss erst einmal grinsen – sie denkt, ihre Kollegen wollen sie zum Abschied hereinlegen. Der Mann bemerkt ihr Grinsen und kommt direkt auf sie zu.",
    "choices": [
     {
      "ziffer": "7",
      "next": "s7"
     },
     {
      "ziffer": "6",
      "next": "d6"
     }
    ]
   },
   "s7": {
    "text": "Richtig! Das ist der Automat direkt neben der Eingangstür. Der Mann sieht Doris wütend an. „Was ist so witzig?“, schreit er. Die Waffe sieht täuschend echt aus. Er hält sie Doris an die Schläfe und zwingt sie, mit ihm zu einem Schalter zu gehen – genau dem, der direkt vor einem Fenster liegt.",
    "choices": [
     {
      "ziffer": "15",
      "next": "s15"
     },
     {
      "ziffer": "13",
      "next": "d13"
     }
    ]
   },
   "s15": {
    "text": "Richtig! Das ist ihr eigener Schalter, direkt vor dem Fenster. Jetzt wird Doris richtig mulmig: Ist das vielleicht doch kein Scherz? „Her mit dem Tresorschlüssel!“, brüllt der Mann. „Den hat nur unser Chef“, sagt Doris. „Dann bring mich zu ihm!“ Sie führt ihn los – vorbei an einer Kamera, die in der Ecke direkt neben ihrem eigenen Schalter hängt.",
    "choices": [
     {
      "ziffer": "5",
      "next": "s5"
     },
     {
      "ziffer": "10",
      "next": "d10"
     }
    ]
   },
   "s5": {
    "text": "Richtig! Das ist die Kamera direkt neben ihrem Schalter. Der Verbrecher zerstört sie sofort mit einem Schuss. Doris bekommt jetzt wirklich Angst. Aufgeregt führt sie ihn weiter – zum Büro des Chefs, das direkt neben dem Eingang liegt.",
    "choices": [
     {
      "ziffer": "8",
      "next": "s8"
     },
     {
      "ziffer": "4",
      "next": "d4"
     }
    ]
   },
   "s8": {
    "text": "Richtig! Das ist das Büro des Chefs, direkt neben dem Eingang. „Tresor auf, schnell!“, brüllt der Mann. Der Chef nimmt zitternd einen Schlüssel und geht voraus. Dabei kommen die drei an einem bestimmten Fenster vorbei – dem, an dem sie auf dem Weg zum Tresorraum immer vorbeigehen.",
    "choices": [
     {
      "ziffer": "16",
      "next": "s16"
     },
     {
      "ziffer": "2",
      "next": "d2"
     }
    ]
   },
   "s16": {
    "text": "Richtig! An diesem Fenster kommen die drei tatsächlich vorbei. Draußen sieht Doris ihre beste Freundin mit einem riesigen Blumenstrauß auf die Bank zulaufen. „Bloß nicht reinkommen!“, denkt Doris panisch. „Weiter!“, brüllt der Verbrecher. Er schiebt seine Geiseln an zwei Geldautomaten vorbei – vor dem, in dem gerade ein dickes Bündel Geldscheine liegt, bleiben sie stehen.",
    "choices": [
     {
      "ziffer": "14",
      "next": "s14"
     },
     {
      "ziffer": "9",
      "next": "d9"
     }
    ]
   },
   "s14": {
    "text": "Richtig! In diesem Automaten liegt tatsächlich ein Bündel mit 400 Euro – es gehört einem Kunden, der jetzt verängstigt auf dem Boden liegt. Doris will ablenken: „Da drüben ist der Tresorraum!“, ruft sie und zeigt auf eine offene Tür genau gegenüber vom Eingang.",
    "choices": [
     {
      "ziffer": "11",
      "next": "s11"
     },
     {
      "ziffer": "17",
      "next": "d17"
     }
    ]
   },
   "s11": {
    "text": "Richtig! Das ist die Tür zum Tresorraum. Die drei betreten den Raum. Der Verbrecher zeigt auf einen Tresor: „Her mit dem Geld!“ Doch in diesem Raum gibt es zwei Tresore – nur einer davon ist der große, in dem fast das gesamte Geld der Bank liegt.",
    "choices": [
     {
      "ziffer": "3",
      "next": "s3"
     },
     {
      "ziffer": "12",
      "next": "d12"
     }
    ]
   },
   "s3": {
    "text": "Richtig! In diesem großen Tresor liegt fast das gesamte Geld der Bank. Der Chef öffnet ihn, der Verbrecher stopft das Geld in einen Rucksack und rennt zur Tür – doch dort warten schon vier Polizisten! Doris' Freundin hatte draußen sofort erkannt, dass die Bank überfallen wird, und die Polizei alarmiert. „Und ich dachte, ihr hättet mir diese Überraschung zum Abschied vorbereitet!“, seufzt Doris erleichtert. Am nächsten Tag geht sie in Rente – und die hat sie sich wirklich verdient!",
    "ende": true
   },
   "d6": {
    "sackgasse": true,
    "text": "Das ist zwar auch ein Automat für Kontoauszüge, aber er steht nicht direkt neben der Eingangstür. Hier bist du falsch.",
    "zurueck": "s1"
   },
   "d13": {
    "sackgasse": true,
    "text": "Das ist zwar auch ein Schalter, aber er liegt nicht vor dem Fenster. Hier bist du falsch.",
    "zurueck": "s7"
   },
   "d10": {
    "sackgasse": true,
    "text": "Das ist zwar auch eine Kamera, aber sie hängt nicht neben Doris' eigenem Schalter. Hier bist du falsch.",
    "zurueck": "s15"
   },
   "d4": {
    "sackgasse": true,
    "text": "Das ist zwar ein Raum, aber es ist nur ein Besprechungsraum – nicht das Büro des Chefs. Hier bist du falsch.",
    "zurueck": "s5"
   },
   "d2": {
    "sackgasse": true,
    "text": "Auch hier ist ein Fenster, aber an diesem kommen Chef, Doris und der Verbrecher gar nicht vorbei. Hier bist du falsch.",
    "zurueck": "s8"
   },
   "d9": {
    "sackgasse": true,
    "text": "Das ist zwar auch ein Geldautomat, aber hier liegt kein Bündel Geldscheine. Hier bist du falsch.",
    "zurueck": "s16"
   },
   "d17": {
    "sackgasse": true,
    "text": "Das ist zwar auch eine Tür, aber sie steht nicht offen. Hier bist du falsch.",
    "zurueck": "s14"
   },
   "d12": {
    "sackgasse": true,
    "text": "Dieser Tresor ist viel zu klein – er ist nur für die Wertsachen der Mitarbeiter gedacht, nicht für das Geld der Bank. Hier bist du falsch.",
    "zurueck": "s11"
   }
  }
 }
});
