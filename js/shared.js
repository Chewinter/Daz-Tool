/* ==========================================================================
   shared.js — gemeinsam genutzt von index.html (Schüler) UND lehrkraft.html (Lehrkraft)

   Ladereihenfolge (steht als "Lader" am Ende beider HTML-Dateien):
     shared.js → data/*.js (Inhalte) → data/curriculum.js → tests-common.js → student.js | teacher.js

   Hier drin: PIN, Schülerliste, Inhalts-Register, Speicher-Anbindung (Google Apps Script),
   Hilfsfunktionen und die Lernfeld-Logik, die beide Seiten brauchen.
   ========================================================================== */

const DASH_PIN = "1234"; // Vorläufiger PIN, in Canva/Notion-Version durch echten Login ersetzen

// ---------------- SCHÜLERLISTE ----------------
// EINZIGE Stelle, an der Namen gepflegt werden (Schüler-Auswahl UND Lehrkraft-Ansicht füllen sich daraus).
// WICHTIG: Namen NIE ändern, wenn schon Abgaben existieren — der Speicher-Schlüssel wird aus dem Namen
// gebildet (slug). Neue Schüler einfach unten anhängen.
const STUDENTS = [
  "Anas Anis Adam",
  "Amar Ahmad",
  "Abdikafi Ahmed Dahir",
  "Amer Alhardan",
  "Samuel Alejandro Castro Ortiz",
  "Juliana Eibech",
  "Meryem A. Hassen",
  "Awab Hussin Barba",
  "Arber Karaj",
  "Amir Maimouni El Marzgioui",
  "Anna Myronenko",
  "Nazar Nakonechnyi",
  "Georgi Pashov",
  "Eyleen d. l. Canidad Romero Febles",
  "Dmytro Sizhko",
  "Judi Younis",
  "Abdelrahman Elhady"
];
function fillStudentSelect(selectEl, valueMode) {
  // valueMode "slug": value = slug(Name) (Lehrkraft-Filter), sonst value = voller Name
  STUDENTS.forEach(name => {
    const o = document.createElement('option');
    o.value = valueMode === 'slug' ? slug(name) : name;
    o.textContent = name;
    selectEl.appendChild(o);
  });
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
function normalize(s) { return (s || "").trim().toLowerCase().replace(/ß/g, "ss"); }

// ==================== SPEICHER-BACKEND (Google Apps Script) ====================
// Auf GitHub Pages gibt es kein window.storage mehr (das war eine Claude-Artifact-Funktion).
// Diese Schicht bildet dieselbe Schlüssel/Wert-API (get/set/delete/list) über ein kleines
// Google-Apps-Script nach, damit der komplette restliche Code unverändert weiterläuft.
//
// WICHTIG: Trage hier nach dem Deployment des Apps Scripts die Web-App-URL ein
// (Format: https://script.google.com/macros/s/AKfycb.../exec):
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbzhm6rkABGSotUfnubSLGAdgS7yPArfe6_9xvTicuDA-D6l9E91KNbACuqkDJDjKN/exec";

async function ascAnfrage(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error('Speicher-Server nicht erreichbar (Netzwerk).');
  }
  if (!res.ok) throw new Error('Speicher-Server-Fehler: ' + res.status);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

window.storage = {
  async get(key /*, shared */) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
      throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
    }
    const data = await ascAnfrage(`${APPS_SCRIPT_URL}?action=get&key=${encodeURIComponent(key)}`);
    return { key, value: data.value };
  },
  async set(key, value /*, shared */) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
      throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
    }
    await ascAnfrage(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // vermeidet CORS-Preflight bei Apps Script
      body: JSON.stringify({ action: 'set', key, value }),
    });
    return { key, value };
  },
  async delete(key /*, shared */) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
      throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
    }
    await ascAnfrage(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', key }),
    });
    return { key, deleted: true };
  },
  async list(prefix /*, shared */) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
      throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
    }
    const data = await ascAnfrage(`${APPS_SCRIPT_URL}?action=list&prefix=${encodeURIComponent(prefix || '')}`);
    return { keys: data.keys || [], prefix };
  },
    // NEU: liefert Schlüssel+Wert aller Einträge, die auf "suffix" enden, in EINEM Aufruf
  // (spart bei der Fortschrittsübersicht viele einzelne get()-Aufrufe für den Lehrkraft-Status).
  async listBySuffix(suffix /*, shared */) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
      throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
    }
    const data = await ascAnfrage(`${APPS_SCRIPT_URL}?action=listBySuffix&suffix=${encodeURIComponent(suffix || '')}`);
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
  if (id === 'eingangstest_a1') return { title: 'Eingangstest A1', kind: 'eingangstest' };
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
