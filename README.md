# DaZ-Tool — Update (Version 20261001a)
NEU gegenüber Version 20260928a (falls du 20260930a/b noch nicht hochgeladen hast, ist alles Folgende in diesem ZIP enthalten):
* **Lehrkraft-Startseite:** Übersicht statt Schülerauswahl — „Wartet auf dich“, „Liegt beim Schüler“ und das Spielbrett „Wo stehen alle?“
* **Zettel-Haken** („Zettel kontrolliert ✓“) für Korrektur auf Papier — in der Übersicht und in der Karte des Schülers
* Bewertungs-Funktionen (Schalter richtig/falsch, Note, Teile wiederholen, Ergebnis für Schüler), nur die neueste Abgabe eines Tests ist bewertbar
* A1.5 Schule, Korrekturen an einzelnen Sätzen, Multiple-Choice-Optik, „Schritt N“ in den Überschriften

## Was du hochladen musst
**Den kompletten Inhalt des Ordners `Daz-Tool` hochladen** (fast alle Dateien haben sich geändert).

1. ZIP entpacken (Rechtsklick → Alle extrahieren) → Ordner `Daz-Tool`.
2. GitHub → Repository `Daz-Tool` → **Add file → Upload files**.
3. Den **Inhalt** des Ordners hineinziehen: `index.html`, `lehrkraft.html`, `README.md` und die Ordner `css`, `js`, `data`
   (nicht das ZIP, nicht den äußeren Ordner). Vorhandene Dateien werden ersetzt.
4. **Commit changes** → 1–2 Minuten warten → Seite hart neu laden (Strg+Shift+R; am Tablet Seite schließen und neu öffnen).
5. Google Apps Script / Google Sheet **nicht anfassen**. Alle Abgaben und Fortschritte bleiben erhalten.
Neue Dateien: `js/bewertung.js`, `js/uebersicht.js`, `data/a1-lf5-schule.js`. Rückgängig machen: GitHub → Commits → letzten Commit → **Revert**.

## Die neue Startseite (lehrkraft.html)
* Nach der PIN siehst du oben vier Zähler und darunter:
  * **Wartet auf dich:** alle Abgaben ohne Bewertung, älteste zuerst → „Bewerten“ öffnet den Schüler direkt an dieser Abgabe.
    Hinweis: Auch ältere Abgaben, die du nie bewertet hast, erscheinen hier — die kannst du entweder bewerten oder als „ohne Wertung“ ignorieren.
  * **Liegt beim Schüler:** Wiederholung nötig (mit deinem Kommentar) · Korrektur auf Papier (Haken **Zettel kontrolliert ✓**) · angefangen/pausiert.
  * **Wo stehen alle?** Der Lernpfad als Spielbrett. Jeder Schüler ist eine Figur an seiner aktuellen Station (inkl. Bestandsschutz und manueller Freischaltung).
    Gelb + Zahl = so viele Bewertungen warten, rot = muss wiederholen. Klick auf die Figur öffnet den Schüler.
* In der Einzelansicht bringt „← Zur Übersicht“ zurück. „Aktualisieren“ lädt die jeweils sichtbare Ansicht neu.

## So funktioniert die Bewertung (Einzelansicht)
* Jede Antwort hat **✓ / ✗**. Voreingestellt ist das automatische Ergebnis; du kannst es umschalten (wird sofort als Entwurf gespeichert). Gilt auch für bereits eingereichte Tests.
* **Abschlusstests:** Punkte → Note (bis 50 % = 6, darüber Drittelnoten bis 1+). Ab 3− und schlechter: „muss wiederholt werden“ (Teile ankreuzen + Kommentar sind Pflicht).
  Besser als 3−: „bestanden“, der Schüler schreibt die falschen Aufgaben auf Papier ab (dann Haken „Zettel kontrolliert ✓“). Unter jedem Teil: „Diesen Teil wiederholen lassen“.
  Nicht automatisch gewertete Antworten musst du vor der Freigabe selbst mit ✓/✗ bewerten.
* **Vokabeltests / Grammatik:** keine Note. „Korrigiert — freigeben“ (Schüler schreibt Fehler handschriftlich neu) oder „Wiederholen nötig“ (Teile wählen, Kommentar Pflicht).
* Der Schüler sieht das Ergebnis erst nach deiner Freigabe (Knopf „Ergebnis ansehen“ an der Karte) und dort auch „Zettel kontrolliert ✓“.
* **Wichtig:** Für Tests, die du schon mit dem alten Knopf bewertet hast, gibt es noch kein Ergebnis für den Schüler. Dafür einmal in der Einzelansicht „freigeben“ klicken.

## Kurzer Test nach dem Hochladen
* `…/Daz-Tool/lehrkraft.html` öffnen, PIN eingeben → Übersicht lädt (ein paar Sekunden).
* Bei einer Figur klicken → Einzelansicht; ✓/✗ umschalten, „freigeben“; Zurück zur Übersicht.
* Beim Schüler: Karte → „Ergebnis ansehen“.

## Später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
* Neuer Schüler: `js/shared.js` → Liste `STUDENTS` → unten anhängen.
* Neues Lernfeld: Datei nach Muster `data/a1-lf5-schule.js` anlegen, in den Lader **beider** HTML-Dateien eintragen (vor `data/curriculum.js`), Stufe in `data/curriculum.js` ergänzen.
