/* ==========================================================================
   shared.js — gemeinsam genutzt von index.html (Schüler) UND lehrkraft.html (Lehrkraft)

   Ladereihenfolge (steht als "Lader" am Ende beider HTML-Dateien):
     shared.js → data/*.js (Inhalte) → data/curriculum.js → tests-common.js → student.js | teacher.js

   Hier drin: Schülerliste (kommt vom Backend), Inhalts-Register, Speicher-Anbindung (Google Apps Script),
   Hilfsfunktionen und die Lernfeld-Logik, die beide Seiten brauchen.
   ========================================================================== */

// ---------------- SCHÜLERLISTE ----------------
// Die Namen stehen NICHT in dieser Datei (sie ist öffentlich abrufbar). Sie werden im Tabellenblatt "Schueler" der
// Google-Tabelle gepflegt und kommen erst nach der Anmeldung (Klassen-Code bzw. Lehrkraft-PIN) vom Apps Script.
// WICHTIG: Namen NIE ändern, wenn schon Abgaben existieren — der Speicher-Schlüssel wird aus dem Namen
// gebildet (slug). Neue Schüler einfach unten anhängen.
let STUDENTS = [];
function fillStudentSelect(selectEl, valueMode) {
  // valueMode "slug": value = slug(Name) (Lehrkraft-Filter), sonst value = voller Name
  const vorher = selectEl.value;
  [...selectEl.querySelectorAll('option')].forEach(o => { if (o.value) o.remove(); }); // erneutes Füllen ohne Doppelte
  STUDENTS.forEach(name => {
    const o = document.createElement('option');
    o.value = valueMode === 'slug' ? slug(name) : name;
    o.textContent = name;
    selectEl.appendChild(o);
  });
  if (vorher && [...selectEl.options].some(o => o.value === vorher)) selectEl.value = vorher;
}

// ---------------- INHALTS-REGISTER ----------------
// Die Inhalte (Tests, Übungen, Bilder) liegen in data/*.js und melden sich hier an.
const ICONS = {};
const TESTS = {};       // { lf1_schritt1: {title, sub, teil1, teil2, teil3, teil4}, ... }
const ACTIVITIES = {};  // Spiele + Grammatikblöcke
function registerInto(ziel, obj, label) {
  Object.keys(obj).forEach(k => {
    if (Object.prototype.hasOwnProperty.call(ziel, k)) console.warn('[' + label + '] ID doppelt vergeben: ' + k + ' — der spätere Eintrag überschreibt den früheren.');
    ziel[k] = obj[k];
  });
}
function registerIcons(obj) { registerInto(ICONS, obj, 'ICONS'); }
function registerTests(obj) { registerInto(TESTS, obj, 'TESTS'); }
function registerActivities(obj) { registerInto(ACTIVITIES, obj, 'ACTIVITIES'); }

function iconSrc(name) { return ICONS[name] ? "data:image/png;base64," + ICONS[name] : ""; } // leer, wenn das Bild auf dieser Seite nicht geladen ist (Lehrkraft-Seite)
function vereinheitlicheText(s) {
  return String(s == null ? '' : s).replace(/[„“”‟″«»]/g, '"').replace(/[‚‘’‛′`´‹›]/g, "'").replace(/\s+/g, ' ').trim();
}
// Satzzeichen/Anführungszeichen am Ende weg, aber nur, wenn danach noch etwas übrig bleibt ("?" bleibt "?")
function ohneEndzeichen(s) { const o = s.replace(/[\s.!?;:,"']+$/, ''); return o || s; }
function normalizeExakt(s) { return ohneEndzeichen(vereinheitlicheText(s)); }
function normalizeZeichen(s) { return vereinheitlicheText(s).toLowerCase().replace(/ß/g, "ss"); }
function normalize(s) { return ohneEndzeichen(normalizeZeichen(s)); }

// ==================== SPEICHER-BACKEND (Google Apps Script) ====================
// Auf GitHub Pages gibt es kein window.storage (das war eine Claude-Artifact-Funktion). Diese Schicht bildet
// dieselbe Schlüssel/Wert-API (get/set/delete/list) über ein kleines Google-Apps-Script nach.
//
// Web-App-URL des Apps Scripts (Format: https://script.google.com/macros/s/AKfycb.../exec). Die URL allein gibt
// keinen Zugriff mehr: Das Script beantwortet nur Anfragen, die den Klassen-Code bzw. den Lehrkraft-PIN mitschicken.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbzhm6rkABGSotUfnubSLGAdgS7yPArfe6_9xvTicuDA-D6l9E91KNbACuqkDJDjKN/exec";

// Zugangscode: auf der Schüler-Seite der Klassen-Code (einmal eingegeben, bleibt auf dem Gerät gespeichert),
// auf der Lehrkraft-Seite der PIN (nur für die Dauer der Sitzung im Speicher). Geht mit JEDER Anfrage mit.
let ZUGANGS_CODE = '';
try { ZUGANGS_CODE = localStorage.getItem('daz_code') || ''; } catch (e) { /* kein localStorage */ }

// Was das Apps Script kann: 1 = bis 10.10.2026, 2 = schuelerStand + setMany mit { loeschen: true }. Kommt mit der Anmeldung.
let BACKEND_API = 1;

// Vorübergehende Fehler (kein Netz, Server überlastet, keine JSON-Antwort) bekommen das Kennzeichen "voruebergehend":
// api() versucht es dann noch einmal. Inhaltliche Antworten (not_found, zugang_verweigert, …) nicht.
function voruebergehenderFehler(text) { const e = new Error(text); e.voruebergehend = true; return e; }
async function ascAnfrage(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw voruebergehenderFehler('Speicher-Server nicht erreichbar (Netzwerk).');
  }
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) throw voruebergehenderFehler('Speicher-Server-Fehler: ' + res.status);
    throw new Error('Speicher-Server-Fehler: ' + res.status);
  }
  let data;
  try { data = await res.json(); } catch (e) { throw voruebergehenderFehler('Speicher-Server: unvollständige Antwort.'); }
  if (data && data.error && /too many|zu viele|rate|lock|sperre|timeout|timed out|zeitüberschreitung|serverfehler/i.test(String(data.error))) throw voruebergehenderFehler(data.error);
  if (data && data.error) {
    // Code fehlt/falsch/geändert: die Seite fragt neu nach (Schüler-Seite: Klassen-Code-Abfrage)
    if (data.error === 'zugang_verweigert' && typeof beiZugangVerweigert === 'function') beiZugangVerweigert();
    throw new Error(data.error);
  }
  return data;
}

// Alle Anfragen gehen per POST (dann steht weder Code noch Schlüssel in einer URL); "text/plain" vermeidet den
// CORS-Preflight bei Apps Script.
function api(payload) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
    return Promise.reject(new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).'));
  }
  return apiMitWiederholung(payload, 3);
}
// Bei vorübergehenden Fehlern bis zu 3 Versuche. Die Wartezeit wächst (ca. 1 s, 2 s) und hat einen Zufallsanteil, damit nicht
// alle Geräte einer Klasse im selben Moment erneut anfragen.
async function apiMitWiederholung(payload, versuche) {
  for (let i = 1; ; i++) {
    try {
      return await ascAnfrage(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ code: ZUGANGS_CODE }, payload)),
      });
    } catch (e) {
      if (!e.voruebergehend || i >= versuche) throw e;
      await new Promise(r => setTimeout(r, wartezeitMitZufall(i)));
    }
  }
}
function wartezeitMitZufall(versuch) { return Math.round(1000 * Math.pow(2, versuch - 1) * (0.5 + Math.random())); }

// Prüft einen Code und liefert { rolle, lehrkraft, geschuetzt, namen }. Wirft 'zugang_verweigert', wenn er nicht stimmt.
function anmelden(code) {
  return api({ action: 'anmelden', code: code || '' }).then(d => { BACKEND_API = (d && d.api) || 1; return d; });
}

window.storage = {
  async get(key /*, shared */) {
    const data = await api({ action: 'get', key });   // fehlender Schlüssel -> Fehler "not_found" (wie bisher)
    return { key, value: data.value };
  },
  async set(key, value /*, shared */) {
    await api({ action: 'set', key, value });
    return { key, value };
  },
  // Mehrere Einträge in EINEM Aufruf schreiben: items = [{ key, value } | { key, loeschen: true }, …] (loeschen erst ab BACKEND_API 2)
  async setMany(items /*, shared */) {
    await api({ action: 'setMany', items });
    return { anzahl: items.length };
  },
  async delete(key /*, shared */) {
    await api({ action: 'delete', key });
    return { key, deleted: true };
  },
  async list(prefix /*, shared */) {
    const data = await api({ action: 'list', prefix: prefix || '' });
    return { keys: data.keys || [], prefix };
  },
  // Schlüssel+Wert aller Einträge, die auf "suffix" enden, in EINEM Aufruf
  async listBySuffix(suffix /*, shared */) {
    const data = await api({ action: 'listBySuffix', suffix: suffix || '' });
    return { items: data.items || [] };
  },
  // Alles für die Startseite EINES Kindes in einer Anfrage (ab BACKEND_API 2): { items: [{key,value}] (…:<slug>), abgaben: [Schlüssel] }
  async schuelerStand(slugName) {
    const data = await api({ action: 'schuelerStand', slug: slugName });
    return { items: data.items || [], abgaben: data.abgaben || [] };
  },
  // Schlüssel+Wert aller Einträge, die mit einem der Präfixe beginnen, in EINEM Aufruf
  async listByPrefix(prefixes /*, shared */) {
    const data = await api({ action: 'listByPrefix', prefixes });
    return { items: data.items || [] };
  },
};
// ==================== ENDE SPEICHER-BACKEND ====================


// Unterdrückt Autokorrektur/Autovervollständigung/Großschreib-Automatik des Browsers auf ALLEN
// Text-Eingabefeldern und Textareas im Tool (Vokabeltests, Übungen, Abschlusstests, Lehreransicht).
// Läuft per MutationObserver, damit auch dynamisch (per JS) erzeugte Felder erfasst werden,
// ohne dass jede einzelne Erzeugungsstelle im Code angepasst werden muss.
function unterdrueckeAutokorrektur(root) {
  (root || document).querySelectorAll('input[type="text"]:not([data-noac]), textarea:not([data-noac])').forEach(el => {
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('data-noac', '1');
  });
}
new MutationObserver(() => unterdrueckeAutokorrektur()).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', () => unterdrueckeAutokorrektur());

// Speichert mit mehreren Versuchen (steigende Wartezeit) — schützt v. a. wichtige Speicherungen
// (z. B. eine Testabgabe) davor, an einem kurzzeitigen "Message rate limit exceeded" zu scheitern,
// wenn gerade viele Schüler:innen gleichzeitig auf denselben gemeinsamen Speicher zugreifen.
async function speichereMitRetry(key, value, shared, versuche) {
  versuche = versuche || 4;
  let letzterFehler;
  for (let i = 1; i <= versuche; i++) {
    try {
      return await window.storage.set(key, value, shared);
    } catch (e) {
      letzterFehler = e;
      if (i < versuche) await new Promise(r => setTimeout(r, 500 * i));
    }
  }
  throw letzterFehler;
}
function slug(s) { return (s || "unbekannt").trim().toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "_"); }
function escapeHtml(s) {
  const d = document.createElement('div'); d.textContent = s || ""; return d.innerHTML;
}

// ---------------- LERNFELD-LOGIK (beide Seiten) ----------------
// Stabile Stage-IDs: Die "manuelle Freischaltung" (Quereinstieg) merkt sich die Stufe über die ID statt
// nur über die Listenposition. Grund: Sobald vor bestehenden Stufen neue eingefügt werden (z. B. die
// A1-Lernfelder), würde eine reine Positionsnummer auf die FALSCHE Stufe zeigen.
// Diese Tabelle bildet die Positionen der ALTEN Liste (vor Einführung der IDs) auf IDs ab, damit bereits
// gespeicherte Freischaltungen richtig gelesen werden. NIE ändern.
const LEGACY_STAGE_IDS = ['a1_grammatik', 'a1_check', 'a2_lf1', 'a2_lf2', 'a2_lf3', 'a2_lf4', 'a2_lf5'];

function stageIndexById(id) { return CURRICULUM.findIndex(s => s.id === id); }

// Liest einen gespeicherten "manualaccess:"-Eintrag und liefert den Index in der AKTUELLEN CURRICULUM-Liste (-1 = keine).
function aufloeseManualAccessIndex(rec) {
  if (!rec) return -1;
  if (rec.uptoStageId) return stageIndexById(rec.uptoStageId);      // neue Einträge: über ID
  if (typeof rec.uptoStageIndex === 'number') {                      // alte Einträge: über die alte Position
    const legacyId = LEGACY_STAGE_IDS[rec.uptoStageIndex];
    return legacyId ? stageIndexById(legacyId) : -1;
  }
  return -1;
}

function istAbschlusstest(t) { return !!(t && t.type && t.type.startsWith('abschlusstest')); }

function curriculumItemInfo(id) {
  if (id === 'eingangstest_a1') return { title: 'Einstufungstest A1', kind: 'eingangstest' };
  if (TESTS[id] && TESTS[id].kindLabel) return { title: TESTS[id].title, kind: TESTS[id].kindLabel };
  if (TESTS[id]) return { title: TESTS[id].title, kind: TESTS[id].type && TESTS[id].type.startsWith('abschluss') ? 'test-final' : 'test' };
  if (ACTIVITIES[id]) {
    // Grammatikblöcke verhalten sich wie Tests (Abgabe + Lehrkraft-Freigabe), alle anderen Übungen
    // (Domino, Quartett, ...) bleiben Selbstmarkierung. isDoneLocal()/getDisplayStatus() behandeln
    // automatisch jeden Kind außer 'activity' wie einen Test — hier reicht daher diese Weiche.
    const isGrammatik = ACTIVITIES[id].type === 'grammatikblock';
    return { title: ACTIVITIES[id].title, kind: isGrammatik ? 'grammatik' : 'activity' };
  }
  return { title: id, kind: 'unknown' };
}

// Alle IDs, unter denen tatsächlich Abgaben (submission:) entstehen können — echte Tests PLUS
// Grammatikblöcke (die seit dem Umbau ebenfalls wie Tests abgeben). Wird für Dashboard-Suche und
// Export verwendet, damit Grammatikblock-Abgaben dort mit auftauchen.
function alleAbgabeIds() {
  return [...Object.keys(TESTS), ...Object.keys(ACTIVITIES).filter(id => ACTIVITIES[id].type === 'grammatikblock')];
}

// ---------------- NOTEN (Sockel-Prinzip) ----------------
// Bis einschließlich 50 % der Punkte = 6. Darüber linear in Drittelnoten von 5- bis 1+ (15 Stufen à 3,33 Prozentpunkte).
// 3- und schlechter (unter 73,3 %) = Test muss wiederholt werden; besser als 3- = bestanden, Fehler auf Papier korrigieren.
const NOTEN_STUFEN = ['5-', '5', '5+', '4-', '4', '4+', '3-', '3', '3+', '2-', '2', '2+', '1-', '1', '1+'];
function berechneNote(punkte, max) {
  if (!max) return null;
  const p = punkte / max * 100;
  if (p <= 50 + 1e-9) return '6';
  const k = Math.min(14, Math.floor((p - 50) / (50 / 15) + 1e-9));
  return NOTEN_STUFEN[k];
}
function noteMussWiederholt(note) { return ['6', '5-', '5', '5+', '4-', '4', '4+', '3-'].indexOf(note) >= 0; }

// "Schritt 3" vor dem Titel: aus der ID (…_schritt3_…) oder aus dem Feld "schritt" einer Übung; Übungen ohne Schrittnummer bleiben ohne.
function schrittLabel(id) {
  const m = /schritt(\d+)/.exec(id);
  if (m) return 'Schritt ' + m[1];
  const a = ACTIVITIES[id];
  return (a && a.schritt) ? 'Schritt ' + a.schritt : '';
}
function titelMitSchritt(id, title) { const l = schrittLabel(id); return l ? l + ': ' + title : title; }

// ---------------- BEZEICHNUNGEN (einheitlich im ganzen Tool) ----------------
// Test zu Schritt N · Spiel · Lernfeld-Test · Grammatik-Block (mit Aufgabe N) · Einstufungstest A1
function typBezeichnung(kind) {
  return kind === 'test-final' ? 'Lernfeld-Test' : kind === 'eingangstest' ? 'Einstufungstest' : kind === 'grammatik' ? 'Grammatik-Block' : kind === 'activity' ? 'Spiel' : kind === 'schreiben' ? 'Schreibaufgabe' : kind === 'lesen' ? 'Leseaufgabe' : 'Test';
}
function anzeigeTitel(id, title) {
  const info = curriculumItemInfo(id);
  const l = schrittLabel(id);
  if (info.kind === 'test') return l ? `Test zu ${l}: ${title}` : `Test: ${title}`;
  if (ACTIVITIES[id] && ACTIVITIES[id].type === 'wdhauswertung') return title;   // Auswertung, kein Spiel
  if (info.kind === 'activity') return l ? `Spiel zu ${l}: ${title}` : `Spiel: ${title}`;
  if (info.kind === 'grammatik' && l) return `${l}: ${title}`;
  return title;
}

// ---------------- SAMMEL-SPEICHERN ----------------
// Mehrere Einträge zusammen speichern (EINE Anfrage statt mehrerer nacheinander), mit Wiederholversuchen wie
// speichereMitRetry. items = [{ key, value }, …]
// Einträge mit { key, loeschen: true } werden mitgelöscht — in derselben Anfrage, wenn das Apps Script das kann
// (BACKEND_API 2), sonst danach im Hintergrund (ältere Fassung des Apps Scripts).
// Jede Anfrage versucht es bei vorübergehenden Fehlern schon selbst bis zu 3-mal (api()); hier kommt eine zweite Runde dazu.
async function speichereVieleMitRetry(items, versuche) {
  versuche = versuche || 2;
  let spaeterLoeschen = [];
  if (BACKEND_API < 2) {
    spaeterLoeschen = items.filter(x => x && x.loeschen).map(x => x.key);
    items = items.filter(x => !(x && x.loeschen));
  }
  let letzterFehler;
  for (let i = 1; i <= versuche; i++) {
    try {
      const r = await window.storage.setMany(items, true);
      spaeterLoeschen.forEach(k => window.storage.delete(k, true).catch(() => {}));
      return r;
    } catch (e) {
      letzterFehler = e;
      if (i < versuche) await new Promise(r => setTimeout(r, wartezeitMitZufall(i + 1)));
    }
  }
  throw letzterFehler;
}

// ---------------- SAMMEL-ABFRAGE ----------------
// Holt viele Schlüssel auf einmal und liefert { schlüssel: wert | null }. Jede einzelne Anfrage ans Apps Script kostet
// 2–3 s (unter Last deutlich mehr), deshalb zuerst EINE Sammel-Anfrage ("getMany") versuchen. Kennt das Apps Script die
// Aktion noch nicht (Antwort "unknown_action"), gilt der alte Weg: einzelne get()-Aufrufe, alle gleichzeitig.
let getManyVerfuegbar = null; // null = noch nicht probiert, true/false = Ergebnis des ersten Versuchs
async function holeViele(keys) {
  keys = [...new Set(keys)];
  const out = {};
  if (!keys.length) return out;
  if (getManyVerfuegbar !== false) {
    try {
      const data = await api({ action: 'getMany', keys });
      if (data && data.values && typeof data.values === 'object') {
        getManyVerfuegbar = true;
        keys.forEach(k => { out[k] = data.values[k] != null ? data.values[k] : null; });
        return out;
      }
      getManyVerfuegbar = false; // Antwort ohne "values" -> Backend kennt die Aktion nicht
    } catch (e) {
      if (/unknown|unbekannt|\?/i.test(String(e && e.message))) getManyVerfuegbar = false;
      // sonst (Netzwerk o. Ä.): nur für diesen Aufruf auf Einzelabfragen ausweichen
    }
  }
  await Promise.all(keys.map(async (k) => {
    try { const r = await window.storage.get(k, true); out[k] = (r && r.value != null) ? r.value : null; }
    catch (e) { out[k] = null; }
  }));
  return out;
}

// ---------------- KORREKTUR-ABLAUF (berichte/ABLAUF_Korrektur_Rueckgabe.md, Lukas 04.10.2026) ----------------
// Zustände eines abgegebenen Tests (Feld "status" im Speicher):
//   'offen'             abgegeben, wird geprüft (Schritt 1 bzw. 4; bei 4 steht zusätzlich wiederholung: true)
//   'zettel_offen'      Rückgabe mit Fehlern: Korrektur auf Papier, KEINE digitale Wiederholung (Schritt 2)
//   'wiederholung_frei' Lehrkraft hat die Korrektur auf dem Blatt abgehakt: nur die falschen Aufgaben neu (Schritt 3)
//   'endgueltig'        fertig, keine Wiederholung mehr (Schritt 5)
// Ältere gespeicherte Werte werden übersetzt: 'wiederholen' -> Zettel noch offen (bzw. Wiederholung frei, wenn der
// Zettel schon abgehakt war); 'weiter' -> erledigt (bzw. Zettel offen, wenn eine Papier-Korrektur noch nicht abgehakt war).
const ABLAUF_STATUS = ['offen', 'zettel_offen', 'wiederholung_frei', 'endgueltig'];
function ablaufStatus(st) {
  if (!st || !st.status) return 'offen';
  if (ABLAUF_STATUS.indexOf(st.status) >= 0) return st.status;
  if (st.status === 'wiederholen') return st.zettel ? 'wiederholung_frei' : 'zettel_offen';
  if (st.status === 'weiter') return (st.korrektur && !st.zettel) ? 'zettel_offen' : 'endgueltig';
  return 'offen';
}
// Was nach dem Haken "Handschriftliche Korrektur ist ok" gilt: Wiederholung frei — außer bei alten Bewertungen, die
// nicht wissen, welche Aufgaben falsch waren (dann gibt es nichts gezielt zu wiederholen: erledigt).
function korrekturOkStatus(st) {
  const hatDaten = st && (st.wiederholenVokabel || st.wiederholenFelder || st.wiederholenGrammatik || (st.wiederholenTeile && st.wiederholenTeile.length) || (st.punkteWiederholen && st.punkteWiederholen.length));
  return hatDaten ? 'wiederholung_frei' : 'endgueltig';
}
// Soll eine Rückgabe (Zettel offen / Wiederholung frei) den NÄCHSTEN Schritt sperren? Bisher hat nur "Wiederholen nötig"
// gesperrt; jetzt geht jeder Test mit Fehlern in die Rückgabe. Standard: nicht sperren (Abgabe schaltet frei).
const KORREKTUR_SPERRT_WEITER = false;

// Fragetext einer Teil-4-Aufgabe: eigene Frage der Aufgabe (item.frage) > Frage des Tests (teil4Frage) > Standard
// "Gegenteil von …" (nur noch bei den echten Gegenteil-Tests). {word} = Wort der Aufgabe.
function teil4FrageText(t, item) {
  const vorlage = (item && item.frage) || (t && t.teil4Frage);
  return vorlage ? vorlage.replace('{word}', item.label || item.word) : `Gegenteil von „${item.word}"`;
}

// ---------------- ALTE AUFGABENNUMMERN UMRECHNEN ----------------
// Werden Aufgaben eingefügt (z. B. neue Bild-Aufgaben in Teil 1), verschieben sich die Nummern. Ein Test mit neuer
// Nummerierung hat "testVersion" (2, …) und "nummernAlt" = { teilX: { alteNummer: neueNummer } } (erzeugt von
// gen_schrittbilder.py gegen den Live-Stand). Daten aus einer Abgabe/einem Entwurf/einem Status OHNE diese Version
// (quelle.testVersion fehlt oder ist kleiner) werden umgerechnet; neue Daten bleiben, wie sie sind.
// daten: { teil1: [nummern] | { nummer: wert }, … }
// Mehrere Umbauten (A1.5, 07.10.2026): "nummernAltV" = { "<alteVersion>": { teilX: { alteNummer: neueNummer } } }; die Karte
// wird nach der Version der Quelle gewählt. Neue Nummer 0 = Aufgabe gibt es nicht mehr (Wert wird verworfen).
function alteNummernUmrechnen(testId, daten, quelle) {
  const t = TESTS[testId];
  if (!t || !daten || !(t.nummernAlt || t.nummernAltV)) return daten;
  const vQuelle = (quelle && quelle.testVersion) || 1;
  if (vQuelle >= (t.testVersion || 1)) return daten;
  const karte = t.nummernAltV ? t.nummernAltV[String(vQuelle)] : t.nummernAlt;
  if (!karte) return daten;
  const neu = Object.assign({}, daten);
  Object.keys(karte).forEach(tn => {
    const m = karte[tn], d = daten[tn];
    if (!d) return;
    const ziel = n => m[String(n)] != null ? m[String(n)] : n;
    if (Array.isArray(d)) neu[tn] = d.map(ziel).filter(n => n !== 0);
    else { neu[tn] = {}; Object.keys(d).forEach(n => { const z = ziel(n); if (z !== 0) neu[tn][z] = d[n]; }); }
  });
  return neu;
}

// ---------------- VERB-TABELLEN: VORGEGEBENER WORTSTAMM ----------------
// Im Endungsfeld steht der Stamm schon davor (z. B. „wohn|___“). Schreibt ein Kind trotzdem das ganze Verb („wohne“),
// wird der Stamm NICHT noch einmal davorgesetzt („wohnwohne“), sondern das Geschriebene als ganze Form bewertet.
// Richtig ist es nur, wenn die ganze Form stimmt („wohnen“ bei „ich“ bleibt falsch). (Lukas 06.10.2026)
function stammWert(meta, eingabe) {
  const stamm = (meta && meta.stem) || '';
  const e = eingabe == null ? '' : String(eingabe);
  if (!stamm) return e;
  const t = e.trim();
  if (t.length > stamm.length && normalize(t).startsWith(normalize(stamm))) return t;   // ganzes Verb geschrieben
  return stamm + e;
}

// ---------------- LÜCKENSÄTZE: MITGESCHRIEBENE SATZTEILE (Paket 1, Punkt 3, 17.10.2026) ----------------
// Schreibt ein Kind zur Lücke Teile des Satzes mit ab („fährt gegen“ statt „gegen“ bei „Das Auto fährt ___ den Baum“),
// war die Antwort bisher falsch. Jetzt: Ist die Eingabe nicht direkt richtig, werden die Wörter, die genau vor bzw. nach
// der Lücke im Satz stehen, vorn bzw. hinten von der Eingabe abgezogen, und der Rest wird noch einmal geprüft.
// Gilt für Lücken am Anfang, in der Mitte und am Ende. Falsches wird dadurch nie richtig: Übrig bleiben muss genau die Lösung.
function lueckenWort(w) { return normalize(w).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''); }
function lueckenWoerter(text) {
  return String(text || '').replace(/\([^)]*\)/g, ' ').split(/\s+/).map(lueckenWort).filter(Boolean);   // „(beliebt)“-Hinweise zählen nicht
}
function ohneMitgeschriebenes(wert, vor, nach) {
  const orig = String(wert || '').trim().split(/\s+/).filter(Boolean);
  const schl = orig.map(lueckenWort);
  const v = lueckenWoerter(vor), n = lueckenWoerter(nach);
  const gleich = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  let anf = 0, ende = schl.length;
  for (let k = Math.min(v.length, schl.length - 1); k > 0; k--) if (gleich(schl.slice(0, k), v.slice(v.length - k))) { anf = k; break; }
  for (let k = Math.min(n.length, ende - anf - 1); k > 0; k--) if (gleich(schl.slice(ende - k, ende), n.slice(0, k))) { ende -= k; break; }
  // Satzzeichen am Rand der übrig gebliebenen Wörter (Komma/Punkt aus dem Satz) weg
  return orig.slice(anf, ende).join(' ').replace(/^[,;:.!?]+|[,;:]+$/g, '').trim();
}
// Text vor und nach dem Eingabefeld in seiner Aufgabe. Steht die Lücke als „___“ im Text über dem Feld, wird dort geteilt.
function lueckenKontext(el) {
  const box = el && el.closest && el.closest('.grammatik-item, .gen-item, .gegenteil-row, .konj-person-row, .steiger-field, .item, li, tr, p, div');
  if (!box) return { vor: '', nach: '' };
  // Textbausteine einzeln mit Leerzeichen dazwischen ("33." "die Schule" "→" stehen in eigenen Elementen)
  const vorT = [], nachT = [];
  const gang = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  for (let n = gang.nextNode(); n; n = gang.nextNode()) {
    if (el.contains(n)) continue;
    (el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING ? vorT : nachT).push(n.nodeValue);
  }
  let vor = vorT.join(' '), nach = nachT.join(' ');
  const marken = [...vor.matchAll(/_{2,}|…|\.{3}/g)];
  if (marken.length) { const m = marken[marken.length - 1]; nach = vor.slice(m.index + m[0].length) + ' ' + nach; vor = vor.slice(0, m.index); }
  return { vor, nach };
}
// pruefen(wert) -> true/false. el = das Eingabefeld (für den Satz drumherum). Liefert true/false wie pruefen.
function mitLueckenKontext(el, wert, pruefen) {
  if (pruefen(wert)) return true;
  if (!el || el.type === 'hidden' || !String(wert || '').trim().includes(' ')) return false;   // ein einzelnes Wort: nichts abzuziehen
  let k;
  try { k = lueckenKontext(el); } catch (e) { return false; }
  const rest = ohneMitgeschriebenes(wert, k.vor, k.nach);
  return !!rest && rest !== String(wert).trim() && pruefen(rest);
}

// ---------------- GRAMMATIK-AUFGABE PRÜFEN (A1/A2/B1-Blöcke, B1-Wiederholung) ----------------
// item.woerter: Wortkarten — Reihenfolge zählt, Kommas/Satzzeichen und Groß/klein nicht (die Karten sind klein geschrieben)
// item.streng / item.satz: Rechtschreibung zählt (ß ≠ ss, Groß/klein), nur der erste Buchstabe ist egal, wenn die Lücke am
//   Satzanfang steht (item.anfang) bzw. bei ganzen Sätzen. item.exakt: alles zählt. Sonst: großzügig (checkAcceptable).
function pruefeGrammatikItem(item, w) {
  const liste = (Array.isArray(item.antwort) ? item.antwort : [item.antwort]).filter(a => a != null);
  if (item.woerter) {
    const n = s => normalize(s).replace(/[,.;:!?]/g, ' ').replace(/\s+/g, ' ').trim();
    return liste.some(a => n(a) === n(w));
  }
  if (item.exakt) return liste.some(a => normalizeExakt(a) === normalizeExakt(w));
  if (item.streng || item.satz) {
    const n = s => { const x = normalizeExakt(s); return (item.anfang || item.satz) ? x.charAt(0).toLowerCase() + x.slice(1) : x; };
    return liste.some(a => n(a) === n(w));
  }
  return checkAcceptable(w, item.antwort);
}

// ---------------- GRAMMATIK-WIEDERHOLUNG B1: THEMEN-AMPEL (Paket 3, 28.10.2026) ----------------
// paare: [{ sub, review }] — je Block die NEUESTE Abgabe und (falls vorhanden) die Bewertung genau dieser Abgabe.
// Gewertet wird je Aufgabe: deine Bewertung (review.ergebnisse), sonst die automatische Prüfung; null = noch nicht bewertet.
// vorgaben: { Kürzel: true (wiederholen) | false (nicht wiederholen) } — überschreibt die Ampel-Empfehlung.
function wdhAufgaben(sub, review) {
  const def = ACTIVITIES[sub.testId]; const out = [];
  if (!def || !def.punkte) return out;
  (sub.teilDetails || []).forEach(d => {
    const p = def.punkte.find(x => x.nr === d.punktNr); const it = p && p.uebung.items[d.itemIdx];
    if (!it || !it.thema) return;
    const k = d.punktNr + '-' + d.itemIdx;
    const korrekt = (review && review.ergebnisse && review.ergebnisse[k] !== undefined) ? review.ergebnisse[k] : d.korrekt;
    out.push({ thema: it.thema, korrekt: korrekt === undefined ? null : korrekt, frage: d.frage, antwort: d.antwort, loesung: d.korrektAntwort });
  });
  return out;
}
function wdhFarbe(t, richtig, falsch) {
  if (!richtig && !falsch) return 'grau';
  if (t.klein) return falsch <= 1 ? 'gruen' : falsch === 2 ? 'gelb' : 'rot';
  const q = richtig / (richtig + falsch);
  return q >= 0.8 ? 'gruen' : q >= 0.6 ? 'gelb' : 'rot';
}
function wdhStatistik(paare, vorgaben) {
  vorgaben = vorgaben || {};
  const stat = {};
  WDH_B1_THEMEN.forEach(t => { stat[t.kz] = { thema: t, richtig: 0, falsch: 0, offen: 0, fehler: [] }; });
  (paare || []).forEach(({ sub, review }) => wdhAufgaben(sub, review).forEach(a => {
    const s = stat[a.thema]; if (!s) return;
    if (a.korrekt === true) s.richtig++; else if (a.korrekt === false) { s.falsch++; s.fehler.push(a); } else s.offen++;
  }));
  Object.values(stat).forEach(s => {
    s.bearbeitet = s.richtig + s.falsch + s.offen;
    s.farbe = wdhFarbe(s.thema, s.richtig, s.falsch);
    s.vorgabe = vorgaben[s.thema.kz];
    s.wiederholen = s.vorgabe === true || (s.vorgabe !== false && (s.farbe === 'gelb' || s.farbe === 'rot'));
  });
  return stat;
}
// Neueste Abgabe je Block + passende Bewertung aus { schlüssel: wert } (holeViele) zusammensuchen
function wdhPaareAus(werte, subKeys, statusJe) {
  const neueste = {};
  subKeys.forEach(k => { const p = k.split(':'); if (!neueste[p[1]] || Number(p[3]) > Number(neueste[p[1]].split(':')[3])) neueste[p[1]] = k; });
  return Object.entries(neueste).map(([tid, k]) => {
    let sub = null, review = null;
    try { sub = JSON.parse(werte[k]); } catch (e) { return null; }
    const st = statusJe[tid];
    if (st && st.reviewKey && st.reviewKey === 'review:' + k.slice('submission:'.length) && werte[st.reviewKey]) { try { review = JSON.parse(werte[st.reviewKey]); } catch (e) { /* ohne */ } }
    return sub ? { sub: Object.assign({ testId: tid }, sub), review } : null;
  }).filter(Boolean);
}
const WDH_FARBTEXT = { gruen: 'kannst du', gelb: 'noch üben', rot: 'wiederholen', grau: 'noch nicht bearbeitet' };


// ---------------- TEIL 3 (EIGENE SÄTZE) OHNE KI PRÜFEN (Lukas 29.10.2026: es gibt keine KI-Schnittstelle) ----------------
// Möglichst viel automatisch, nur Unklares bewertet die Lehrkraft. Ergebnis: { korrekt: true | false | null, grund }.
//   false  = eindeutig: geforderte Angabe fehlt (Wort/Nomen, Angabe in Klammern, Zahl) oder der Satz ist zu kurz
//   true   = alles Geforderte steht drin und das Verb nach dem Satzanfang passt zum Subjekt (ich -e, du -st, er -t, wir -en …)
//   null   = unklar (z. B. unregelmäßiges Verb, freie Frage ohne Angabe) -> die Lehrkraft entscheidet
// Die Lehrkraft kann jedes automatische Urteil in der Bewertung umschalten.
const T3_WORT = s => String(s || '').toLowerCase().replace(/ß/g, 'ss').replace(/[ä]/g, 'a').replace(/[ö]/g, 'o').replace(/[ü]/g, 'u').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const T3_ARTIKEL = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|kein|keine|mein|meine|dein|deine|sein|seine|ihr|ihre|unser|unsere|euer|eure)$/;
const T3_FUELL = /^(und|oder|in|im|ins|am|an|auf|mit|zu|zum|zur|von|vom|fur|bei|nach|aus|um|es|sich|mich|dich|gut|sehr|gern|gerne|nicht)$/;
const T3_FINIT = { ich: /^(bin|habe|hab|kann|muss|will|darf|soll|mag|mochte|weiss|war|hatte|ging|kam|sah|las|lief|ass|trank|fuhr|gab|nahm|hiess|sass|stand|schlief|schrieb|fand|sprach|traf|wurde|werde)$|e$|te$/,
  du: /^(bist|hast|kannst|musst|willst|darfst|sollst|magst|weisst|warst|hattest|wirst)$|st$/,
  er: /^(ist|hat|kann|muss|will|darf|soll|mag|mochte|weiss|war|hatte|wird|gibt|nimmt|isst|liest|sieht|fahrt|lauft|schlaft|tragt|halt|hilft|spricht|trifft|wirft|gefallt|ging|kam|sah|las|lief|ass|trank|fuhr|gab|nahm|hiess|sass|stand|schlief|schrieb|fand|sprach|traf|wurde)$|t$|te$/,
  wir: /^(sind|haben|konnen|mussen|wollen|durfen|sollen|mogen|wissen|waren|hatten|werden)$|en$|n$|ten$/,
  ihr: /^(seid|habt|konnt|musst|wollt|durft|sollt|mogt|wisst|wart|hattet|werdet)$|t$|tet$/ };
// Person des Satzanfangs: 'ich' | 'du' | 'er' | 'wir' | 'ihr' | 'er|wir' (Einzahl oder Mehrzahl) | 'beliebig' (Zeitangabe vorn:
// irgendein gebeugtes Verb) | 'mitverb' (der Satzanfang enthält schon das Verb) | null (unklar, z. B. „Ja,“ oder leer)
const T3_ADVERB = /^(heute|morgen|gestern|mittags|abends|morgens|nachts|dann|danach|jetzt|am|im|in|um|uber|auf|nach|vor|seit|bei|trotzdem|zum|zur|ostersonntag|ostermontag)$/;
function t3Person(anfang) {
  const roh = String(anfang || '').trim().split(/\s+/).filter(Boolean);
  const w = roh.map(T3_WORT);
  if (!w.length || w[0] === 'ja' || w[0] === 'nein') return null;
  // Satzanfang enthält schon ein gebeugtes Verb (klein geschrieben, kein Artikel/keine Präposition): "Die Koalition hat", "Im Urlaub habe ich"
  if (roh.slice(1).some((x, i) => /^[a-zäöü]/.test(x) && !T3_ARTIKEL.test(w[i + 1]) && !T3_FUELL.test(w[i + 1]) && !/^(der|von|fur|uber)$/.test(w[i + 1]) &&
      Object.values(T3_FINIT).some(re => re.test(w[i + 1])))) return 'mitverb';
  const einzel = { ich: 'ich', du: 'du', er: 'er', es: 'er', man: 'er', das: 'er', wir: 'wir', ihr: 'ihr', mir: 'er', dir: 'er', ihm: 'er', sie: 'er|wir' };
  if (w.length === 1 && einzel[w[0]]) return einzel[w[0]];
  if (T3_ADVERB.test(w[0])) return 'beliebig';
  if (/^(viele|alle|einige|manche|beide)$/.test(w[0]) || w.indexOf('und') > 0) return 'wir';
  if (/^(der|das|ein|eine|kein|mein|dein|sein|unser|euer)$/.test(w[0])) return 'er';
  if (/^(die|meine|deine|seine|ihre|unsere|eure|keine)$/.test(w[0])) return /(in|ung|heit|keit|schaft|tion|ei)$/.test(w[1] || '') ? 'er' : 'er|wir';
  if (/^[A-ZÄÖÜ]/.test(roh[0])) return 'er';   // Name, Land: Peter, Deutschland, Martin Luther, Artikel 1
  return null;
}
function t3VerbPasst(person, v) {
  if (person === 'beliebig') return Object.values(T3_FINIT).some(re => re.test(v));
  return person.split('|').some(p => T3_FINIT[p].test(v));
}
// Pflichtwörter: bei "Wort"-Aufgaben das Wort (Nomen ohne Artikel; Verb über den Stamm), bei Fragen die Angabe in Klammern
function t3Pflicht(item) {
  const word = String(item.word || '');
  const klammer = (word.match(/\(([^)]*)\)/) || [])[1];
  if (klammer) return { art: 'angabe', woerter: T3_WORT(klammer).split(' ').filter(x => x && !T3_FUELL.test(x) && !T3_ARTIKEL.test(x)) };
  if (/[?.!]/.test(word) || word.split(' ').length > 3) return { art: 'frei', woerter: [] };   // freie Frage ohne Angabe
  const teile = T3_WORT(word).split(' ').filter(Boolean);
  const kern = teile.filter(x => !T3_ARTIKEL.test(x));
  const istVerb = kern.length === 1 && /^[a-zäöü]/.test(word.trim()) && /(en|ern|eln|n)$/.test(kern[0]) && !T3_ARTIKEL.test(teile[0]);
  return istVerb ? { art: 'verb', woerter: [kern[0]] } : { art: 'nomen', woerter: kern };
}
// Häufige unregelmäßige Formen (Anfänge, nach T3_WORT: ohne Umlaute, ß -> ss)
const T3_UNREGEL = { sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'war'], haben: ['hab', 'hat', 'hast', 'hatt'], werden: ['wird', 'wirst', 'wurd', 'werd'],
  wissen: ['weiss', 'wuss'], essen: ['iss', 'ass', 'ess'], nehmen: ['nimm', 'nahm', 'nehm'], geben: ['gib', 'gab', 'geb'], sehen: ['sieh', 'sah', 'seh'],
  lesen: ['lies', 'las', 'les'], sprechen: ['sprich', 'sprach', 'sprech'], treffen: ['triff', 'traf', 'treff'], helfen: ['hilf', 'half', 'helf'],
  fahren: ['fahr', 'fuhr'], schlafen: ['schlaf', 'schlief'], laufen: ['lauf', 'lief'], tragen: ['trag', 'trug'], gehen: ['geh', 'ging'], kommen: ['komm', 'kam'],
  schreiben: ['schreib', 'schrieb'], trinken: ['trink', 'trank'], finden: ['find', 'fand'], stehen: ['steh', 'stand'], sitzen: ['sitz', 'sass'],
  liegen: ['lieg', 'lag'], tun: ['tu', 'tat'], mogen: ['mag', 'mog', 'moch'], konnen: ['kann', 'konn'], mussen: ['muss'], durfen: ['darf', 'durf'], wollen: ['will', 'woll'] };
function t3VerbDa(tokens, w) {
  const formen = T3_UNREGEL[w];
  if (formen && tokens.some(t => formen.some(f => t.indexOf(f) === 0))) return true;
  const stamm = w.replace(/(en|n)$/, '').replace(/el$/, 'l').replace(/er$/, 'r');
  return tokens.some(t => t.indexOf(stamm.slice(0, Math.max(3, stamm.length - 1))) >= 0);
}
function t3Enthaelt(tokens, w, art) {
  if (art === 'verb') return t3VerbDa(tokens, w);
  if (/^\d+$/.test(w)) return tokens.indexOf(w) >= 0;
  if (/(en|ern|eln)$/.test(w) && t3VerbDa(tokens, w)) return true;   // Verb in einer Wortgruppe: „die Mauer bauen“ -> „gebaut“
  const k = w.slice(0, Math.max(3, w.length - 2));   // Nomen: Plural-/Kasusendungen erlaubt (Deo/Deos, Haus/Häuser)
  return tokens.some(t => t === w || (t.indexOf(k) === 0 && t.length <= w.length + 3));
}
function pruefeTeil3(item, satz) {
  if (typeof window !== 'undefined' && window.TEIL3_IMMER_RICHTIG) return { korrekt: true, grund: 'Testmodus' };   // nur in den automatischen Tests (test_site.py)
  const anfang = String(item.pronomen || '');
  const s = String(satz || '').trim();
  const rest = anfang && s.indexOf(anfang) === 0 ? s.slice(anfang.length).trim() : s;
  const tokens = T3_WORT(s).split(' ').filter(Boolean);
  const restTokens = T3_WORT(rest).split(' ').filter(Boolean);
  if (!restTokens.length) return { korrekt: false, grund: 'kein Satz geschrieben' };
  if (tokens.length < 3) return { korrekt: false, grund: 'zu kurz (kein ganzer Satz)' };
  const pf = t3Pflicht(item);
  const fehlt = pf.woerter.filter(w => !t3Enthaelt(tokens, w, pf.art));
  if (fehlt.length && pf.art !== 'verb') return { korrekt: false, grund: 'fehlt: ' + fehlt.join(', ') };
  if (fehlt.length) {
    // Verb in keiner Form erkannt: Teilt kein Wort die ersten zwei Buchstaben, fehlt es sicher; sonst unklar (trennbar, unregelmäßig)
    const anf = fehlt[0].slice(0, 2);
    if (!tokens.some(t => t.indexOf(anf) === 0)) return { korrekt: false, grund: 'Verb „' + item.word + '“ fehlt' };
    return { korrekt: null, grund: 'Verb „' + item.word + '“ nicht sicher erkannt (trennbar/unregelmäßig?)' };
  }
  if (pf.art === 'frei') return { korrekt: null, grund: 'freie Antwort' };
  // Verb an Position 2 passt zum Subjekt? (nur wenn der Satzanfang ein eindeutiges Subjekt ist und noch kein Verb enthält)
  const person = t3Person(anfang);
  if (person === 'mitverb') return { korrekt: true, grund: 'automatisch geprüft' };
  if (!person) return { korrekt: null, grund: 'Subjekt nicht eindeutig' };
  const v = restTokens[0];
  if (t3VerbPasst(person, v)) return { korrekt: true, grund: 'automatisch geprüft' };
  return { korrekt: null, grund: 'Verbform nach „' + anfang + '“ prüfen' };
}

// ---------------- FREIE SÄTZE IN GRAMMATIK-BLÖCKEN NACH FESTER REGEL (29.10.2026, keine KI) ----------------
// true = Regel klar erfüllt, false = klar verletzt, null = unklar -> die Lehrkraft entscheidet (kann jedes Urteil umschalten).
function pruefeRegel(item, wert) {
  const s = String(wert || '').trim();
  if (!s) return false;
  const tok = T3_WORT(s).split(' ').filter(Boolean);
  const finit = w => Object.values(T3_FINIT).some(re => re.test(w));
  if (item.regel === 'superlativ_am') {   // „Kartenspiele sind für mich am langweiligsten.“
    if (tok.length < 4) return false;
    const i = tok.indexOf('am');
    if (i < 0 || !tok[i + 1]) return false;
    return /(sten|besten|liebsten|meisten)$/.test(tok[i + 1]) ? true : false;
  }
  if (item.regel === 'dass_verb_ende') {   // Fortsetzung nach „dass“: Verb am Ende
    const nachDass = tok.indexOf('dass') >= 0 ? tok.slice(tok.indexOf('dass') + 1) : tok;
    if (nachDass.length < 2) return false;
    const letztes = nachDass[nachDass.length - 1];
    const letztesRoh = (s.replace(/[.!?…\s]+$/, '').split(/\s+/).pop() || '');
    if (/^[A-ZÄÖÜ]/.test(letztesRoh)) return false;   // großgeschrieben = Nomen: das Verb steht nicht am Ende
    // Hilfs-/Modalverb VOR dem letzten Wort ("dass ich bin eingeschlafen"): Verb nicht am Ende -> falsch
    const hilfs = /^(bin|bist|ist|sind|seid|habe|hast|hat|haben|habt|war|warst|waren|wurde|wurden|wird|werde|kann|kannst|konnen|muss|musst|mussen|will|willst|wollen|darf|soll|mag)$/;
    if (nachDass.slice(1, -1).some(w => hilfs.test(w))) return false;
    return finit(letztes) || /^(ge\w+t|ge\w+en|\w+en)$/.test(letztes) ? true : null;
  }
  if (item.regel === 'es_ist_zu') {   // „Es ist schön, mit meiner Familie zu kochen.“
    if (!(tok[0] === 'es' && tok[1] === 'ist')) return false;
    const teil = T3_WORT(item.teil || '').split(' ').filter(Boolean);
    const hatTeil = teil.every(w => tok.indexOf(w) >= 0);
    const zu = tok.some((w, i) => w === 'zu' && i < tok.length - 1 && i > 2) || tok.some(w => /\w+zu\w+en$/.test(w));
    if (!hatTeil || !zu) return false;
    const letztes = tok[tok.length - 1];
    return /(en|ern|eln|n)$/.test(letztes) ? true : null;
  }
  if (item.regel === 'als_verb_zuerst') {   // Fortsetzung nach „Als …, “: zuerst das Verb
    const rest = s.indexOf(',') >= 0 && /^als\b/i.test(s) ? s.slice(s.lastIndexOf(',') + 1) : s;
    const r = T3_WORT(rest).split(' ').filter(Boolean);
    if (r.length < 2) return false;
    return finit(r[0]) ? true : null;
  }
  return null;
}

