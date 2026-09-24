# DaZ-Tool — Update (Version 20260927a)
Enthält: neue Dateistruktur (Schüler-Seite + eigene Lehrkraft-Seite), A1.1 Grundschrift, A1.2 Begrüßung, A1.3 Personen.
Noch NICHT enthalten: A1.4 Zahlen und Zeiten, A1.5 Schule (kommen später als weitere Dateien).

## Hochladen auf GitHub (Repository Chewinter/Daz-Tool) — Schritt für Schritt
1. ZIP auf dem Rechner **entpacken** (Rechtsklick → Alle extrahieren). Es entsteht der Ordner `Daz-Tool`.
2. GitHub im Browser öffnen → Repository `Daz-Tool` → Knopf **Add file → Upload files**.
3. Den **Inhalt** des Ordners `Daz-Tool` in das Fenster ziehen: `index.html`, `lehrkraft.html`, `README.md` und die drei Ordner
   `css`, `js`, `data` (Ordner einfach mitziehen — die Struktur bleibt erhalten).
   Nicht das ZIP selbst hochladen und nicht den äußeren Ordner `Daz-Tool` (sonst liegt alles eine Ebene zu tief).
4. Unten bei „Commit changes“ eine Notiz eintippen (z. B. „Neue Struktur + A1.1–A1.3“) → **Commit changes**.
   Dass `index.html` ersetzt wird, ist richtig.
5. 1–2 Minuten warten. Dann `https://chewinter.github.io/Daz-Tool/` öffnen und die Seite hart neu laden
   (Strg+Shift+R bzw. am Tablet die Seite schließen und neu öffnen).
6. **Google Apps Script / Google Sheet nicht anfassen.** Alle bisherigen Abgaben, Freigaben und Fortschritte bleiben erhalten.

## Kurzer Test nach dem Hochladen (5 Minuten)
* Startseite lädt, Name wählen → Fortschrittsübersicht erscheint; bei Schülern, die schon in A2 sind, ist weiterhin A2 vorausgewählt.
* Als Testschüler einen Vokabeltest aus **A1.1** starten, abschicken → unten „Lehrkraft-Ansicht“ (führt zu `lehrkraft.html`), PIN eingeben,
  Schüler wählen → die Abgabe ist da und lässt sich freigeben.
* Ein Bild in A1.2/A1.3 kurz ansehen (Begrüßungs-Szenen, Tätigkeiten).
Falls etwas nicht stimmt: auf GitHub → Repository → **Commits** → den letzten Commit öffnen → **Revert** stellt den alten Stand wieder her.

## Wichtig für später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
* Neuer Schüler: `js/shared.js` → Liste `STUDENTS` → unten anhängen (bestehende Namen nie ändern).
* Neues Lernfeld: Datei nach dem Muster `data/a1-lf3-personen.js` anlegen, in den Lader-Block **beider** HTML-Dateien eintragen
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
| `data/a1-lf1-grundschrift.js`, `a1-lf2-begruessung.js`, `a1-lf3-personen.js` | A1.1 bis A1.3 |
| `data/icons-a1.js` | Original-Bilder aus dem Werkbuch |
| `data/*-a2.js`, `grammatik-a1.js`, `tests-eingangstest.js` | bisherige Inhalte, unverändert |

## Was neu ist
* A1.1–A1.3 stehen **vor** dem Grammatik-Training (Bilder = Original-Ausschnitte aus dem Werkbuch).
* Bestandsschutz: Wer schon in einem späteren Lernfeld etwas abgegeben hat (z. B. mitten in A2), bleibt freigeschaltet;
  die A1-Lernfelder sind für ihn freiwillig sichtbar, aber nicht „erledigt“.
* „Zugriff manuell freischalten“ speichert die Stufen-ID (alte Einträge werden richtig gelesen).
* Lehrkraft-Ansicht und Export laden alle Abgaben in einem Aufruf.
* Antworten, die du selbst bewertest (z. B. „Beantworte …“), erscheinen als „nicht automatisch geprüft“.
