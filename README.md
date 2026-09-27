# DaZ-Tool — Update (Version 20261018a)
Enthält ALLES seit Version 20260928a. Einfach den kompletten Inhalt neu hochladen.

## Neu in dieser Version — Lesespur-Pilot jetzt mit der echten Original-Karte
Wie besprochen: Die Original-Lesespurlandkarte (Grundriss der Bank mit den 17 nummerierten Orten) ist jetzt Teil
des Spiels. Bei jeder Station liest man den Text, sucht auf der Karte die passende Ziffer für den beschriebenen
Ort und wählt sie unten aus zwei Ziffern-Buttons aus. Genau wie im Buch: richtige Ziffer → Geschichte geht weiter,
falsche Ziffer → kurzer Hinweis, man überlegt an der gleichen Stelle noch einmal.

## Hochladen
**Den kompletten Inhalt des Ordners `Daz-Tool` hochladen.**
1. ZIP entpacken (Rechtsklick → Alle extrahieren) → Ordner `Daz-Tool`.
2. GitHub → Repository `Daz-Tool` → **Add file → Upload files**.
3. Den **Inhalt** des Ordners hineinziehen: `index.html`, `lehrkraft.html`, `README.md` und die Ordner `css`, `js`, `data` (nicht das ZIP, nicht den äußeren Ordner). Vorhandene Dateien werden ersetzt.
4. **Commit changes** → 1–2 Minuten warten → Seite hart neu laden (Strg+Shift+R; am Tablet Seite schließen und neu öffnen).
5. Google Apps Script / Google Sheet **nicht anfassen**. Alle Abgaben und Fortschritte bleiben erhalten.
Neue Datei: `data/icons-lesespur.js` (enthält die Kartengrafik). Rückgängig: GitHub → Commits → letzten Commit → **Revert**.

## Kurzer Test danach
* „Lesespurgeschichten“ → „Der Banküberfall“ öffnen: Die Karte muss sichtbar sein, mit allen 17 Ziffern lesbar.
* Eine falsche Ziffer wählen (Sackgasse testen), dann den richtigen Weg bis zum Ende finden.

## Später
* Nach **jeder** Änderung an css/js/data in **beiden** HTML-Dateien oben `var APP_V = '…'` hochzählen.
