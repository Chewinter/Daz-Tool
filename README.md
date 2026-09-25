# DaZ-Tool — Update (Version 20261004a)
Enthält ALLES seit Version 20260928a. Einfach den kompletten Inhalt neu hochladen.

## Neu in dieser Version
* **B1.2 Die Erde** (Fortgeschrittenenkurs B1, Lernfeld 2): Schritt 1 Die Welt · Schritt 2 Das Sonnensystem · Schritt 3 Tag und Nacht (Passiv) ·
  Schritt 4 Das Wetter (20 Original-Wettersymbole) · Schritt 5 Modalverben · Lernfeld-Test B1.2 (110 Punkte: 97 automatisch + 13 für die Wettervorhersage, die du bewertest).
  Im Lernfeld-Test: Weltkarte mit nummerierten Feldern (Kontinente), Verbtabellen, Passiv, Lückentext.
* **B1.1 Unterwegs** (Lernfeld 1) mit Spiel „Vier-Seiten-Puzzle“ und Lernfeld-Test (137 Punkte).
* Wortstamm und Eingabefeld bei Verben sind optisch ein Kästchen (nur die Endung tippen).
* Einheitliche Bezeichnungen (Test zu Schritt N · Spiel · Lernfeld-Test · Grammatik-Block/Aufgabe · Einstufungstest A1), Schritt-Matrix, Hinweisfelder bei ✗,
  Lehrkraft-Startseite mit „Wartet auf dich“ / „Liegt beim Schüler“ / Spielbrett, Zettel-Haken, ✓/✗-Bewertung, Note, Teile wiederholen, A1.5 Schule.

## Hochladen
**Den kompletten Inhalt des Ordners `Daz-Tool` hochladen** (fast alle Dateien haben sich geändert).
1. ZIP entpacken (Rechtsklick → Alle extrahieren) → Ordner `Daz-Tool`.
2. GitHub → Repository `Daz-Tool` → **Add file → Upload files**.
3. Den **Inhalt** des Ordners hineinziehen: `index.html`, `lehrkraft.html`, `README.md` und die Ordner `css`, `js`, `data` (nicht das ZIP, nicht den äußeren Ordner). Vorhandene Dateien werden ersetzt.
4. **Commit changes** → 1–2 Minuten warten → Seite hart neu laden (Strg+Shift+R; am Tablet Seite schließen und neu öffnen).
5. Google Apps Script / Google Sheet **nicht anfassen**. Alle Abgaben und Fortschritte bleiben erhalten.
Neue Dateien: `js/bewertung.js`, `js/uebersicht.js`, `data/a1-lf5-schule.js`, `data/b1-lf1-unterwegs.js`, `data/b1-lf2-die-erde.js`. Rückgängig: GitHub → Commits → letzten Commit → **Revert**.

## Kurzer Test danach
* `lehrkraft.html` öffnen, PIN → Übersicht und Schritt-Matrix (jetzt auch mit B1.1 und B1.2).
* Als Testschüler „B1.2 Die Erde“ öffnen (B1 ist nach A2 freigeschaltet; für Quereinsteiger „Zugriff manuell freischalten“).
* Im Lernfeld-Test B1.2 die Kontinente-Karte und die Wettervorhersage ansehen; in der Lehrkraft-Ansicht die Wettervorhersage mit ✓/✗ bewerten.

## Später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
* Neuer Schüler: `js/shared.js` → Liste `STUDENTS` → unten anhängen.
* Neues Lernfeld: Datei nach Muster `data/b1-lf2-die-erde.js` anlegen, in den Lader **beider** HTML-Dateien eintragen (vor `data/curriculum.js`), Stufe in `data/curriculum.js` ergänzen.
