# DaZ-Tool — Update (Version 20261024c)
Enthält ALLES seit Version 20260928a. Einfach den kompletten Inhalt neu hochladen.

## Neu in dieser Version — „Wiederholen“ jetzt auf Aufgaben-Ebene
Umgesetzt, wie besprochen:

* **Kein Teile-Ankreuzen mehr.** „Wiederholen nötig“ merkt sich automatisch **genau die Aufgaben**, die du gerade
  mit ✗ markiert hast — bei Lernfeld-Tests, normalen Vokabeltests UND Grammatik-Blöcken.
* **Beim erneuten Bearbeiten** ist wirklich nur noch die konkret falsche Aufgabe offen. Alles andere ist grau,
  vorausgefüllt und übernimmt automatisch die alte (richtige) Bewertung in die neue Abgabe.
* **Zwei klar getrennte Ergebnisse** (wie gewünscht):
  – „Korrigiert — freigeben“ *(bzw. bei Lernfeld-Tests: Ergebnis „trotzdem: kann weitermachen“)* → nur die
    handschriftliche Korrektur auf Papier reicht, der nächste Schritt wird frei.
  – „Wiederholen nötig“ → der Schüler muss zusätzlich die markierten Aufgaben digital neu machen, bevor der
    nächste Schritt sich freischaltet.
* **Alte, bereits gespeicherte Bewertungen** (im alten teilbasierten Format von vor diesem Update) funktionieren
  unverändert weiter — nichts geht kaputt.
* **Nebenbei gefundener Bug behoben:** Bei einer Aufgabenart mit anklickbaren Karten ("Farbe zuordnen") wirkte das
  Sperren bisher nur optisch — die Karten ließen sich trotzdem anklicken. Jetzt wirklich gesperrt.

## Schon aus den letzten Runden enthalten
Automatische Schritt-für-Schritt-Freischaltung (inkl. Sperre bei „Wiederholen nötig“, automatische Freigabe nach
erneuter Abgabe), Testaccount „TEst“, Hinweisfeld sofort sichtbar mit Fehlerart-Auswahl, Bewertungskarten
einklappbar, „Korrigiere die folgenden Aufgaben auf einem Blatt“ auf der Schülerseite, Hut/Mantel-Bilder in B1.1,
Lesespur-Karte gedreht, Anzeige breiter.

## Hochladen
**Den kompletten Inhalt des Ordners `Daz-Tool` hochladen.**
1. ZIP entpacken → Ordner `Daz-Tool`.
2. GitHub → Repository `Daz-Tool` → **Add file → Upload files**.
3. Den **Inhalt** des Ordners hineinziehen (`index.html`, `lehrkraft.html`, `README.md`, Ordner `css`, `js`, `data`). Vorhandene Dateien werden ersetzt.
4. **Commit changes** → 1–2 Minuten warten → hart neu laden (Strg+Shift+R).
5. Google Apps Script / Google Sheet **nicht anfassen**. Alle Abgaben und Fortschritte bleiben erhalten.

## Kurzer Test danach
* Eine Abgabe bewerten, ein paar Antworten ✗ markieren, „Wiederholen nötig“ klicken (kein Ankreuzen mehr nötig).
* Schüler öffnet den Test erneut: nur die markierten Aufgaben sollten offen sein, der Rest grau/vorausgefüllt.
* Nach der erneuten Abgabe: nächster Schritt schaltet sich automatisch frei.

## Später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
