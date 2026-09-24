# DaZ-Tool — Update (Version 20260928a)
Enthält: neue Dateistruktur, A1.1 Grundschrift, A1.2 Begrüßung, A1.3 Personen, **A1.4 Zahlen und Zeiten (neu)**.
Noch nicht enthalten: A1.5 Schule (kommt später als weitere Datei).

## Was du hochladen musst
**Am einfachsten und sichersten: wieder den kompletten Inhalt des Ordners hochladen** (GitHub ersetzt dabei alles; unveränderte Dateien bleiben inhaltlich gleich).

Neu bzw. geändert gegenüber deinem letzten Upload (Version 20260927a) sind nur diese Dateien — falls du lieber nur diese hochlädst:
* `index.html` und `lehrkraft.html` (neue Versionsnummer + neue Datei im Lader)
* `js/student.js` (neues Spiel „Immer 3!“)
* `data/curriculum.js` (Lernpfad enthält A1.4)
* `data/icons-a1.js` (neue Original-Bilder: Tätigkeiten und Uhren)
* `data/a1-lf4-zahlen-zeiten.js` (**neu**: A1.4 Tests, Abschlusstest, Spiel)
Achtung: Die Ordner `js` und `data` dabei mit hochladen (nicht die Dateien einzeln ohne Ordner), sonst liegen sie am falschen Ort.

## Hochladen auf GitHub (Repository Chewinter/Daz-Tool) — Schritt für Schritt
1. ZIP auf dem Rechner **entpacken** (Rechtsklick → Alle extrahieren). Es entsteht der Ordner `Daz-Tool`.
2. GitHub im Browser → Repository `Daz-Tool` → **Add file → Upload files**.
3. Den **Inhalt** des Ordners `Daz-Tool` in das Fenster ziehen: `index.html`, `lehrkraft.html`, `README.md` und die Ordner `css`, `js`, `data`.
   Nicht das ZIP selbst und nicht den äußeren Ordner `Daz-Tool` hochladen.
4. Unten bei „Commit changes“ eine Notiz eintippen (z. B. „A1.4 Zahlen und Zeiten“) → **Commit changes**.
5. 1–2 Minuten warten, dann `https://chewinter.github.io/Daz-Tool/` öffnen und hart neu laden (Strg+Shift+R; am Tablet Seite schließen und neu öffnen).
6. Google Apps Script / Google Sheet **nicht anfassen**. Alle Abgaben und Fortschritte bleiben erhalten.

## Kurzer Test nach dem Hochladen
* Startseite → Name wählen → Fortschrittsübersicht erscheint; unter Niveau A1 gibt es jetzt auch „A1.4 Zahlen und Zeiten“.
* Einen Vokabeltest aus A1.4 starten (z. B. „Wie spät ist es?“ mit den Uhren), abschicken → Lehrkraft-Ansicht (PIN) → Abgabe ist da.
* Das Spiel „Immer 3!“ öffnen (Uhr + zwei Uhrzeiten zusammenfinden).
Falls etwas nicht stimmt: GitHub → **Commits** → letzten Commit öffnen → **Revert** stellt den alten Stand wieder her.

## Wichtig für später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
* Neuer Schüler: `js/shared.js` → Liste `STUDENTS` → unten anhängen (bestehende Namen nie ändern).
* Neues Lernfeld: Datei nach dem Muster `data/a1-lf4-zahlen-zeiten.js` anlegen, in den Lader-Block **beider** HTML-Dateien eintragen
  (vor `data/curriculum.js`) und in `data/curriculum.js` eine Stufe mit neuer `id` ergänzen.

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html` / `lehrkraft.html` | Schüler-Seite / Lehrkraft-Ansicht (Gerüst + Lader) |
| `css/style.css` | Aussehen |
| `js/shared.js` | Speicher-Anbindung, Schülerliste, gemeinsame Funktionen |
| `js/student.js`, `js/teacher.js` | Code der beiden Seiten |
| `js/tests-common.js` | Abschlusstest-Bausteine |
| `data/curriculum.js` | Lernpfad (Reihenfolge, feste Stufen-IDs) |
| `data/a1-lf1-…` bis `a1-lf4-…` | A1.1 bis A1.4 |
| `data/icons-a1.js` | Original-Bilder aus dem Werkbuch |
| `data/*-a2.js`, `grammatik-a1.js`, `tests-eingangstest.js` | bisherige Inhalte, unverändert |
