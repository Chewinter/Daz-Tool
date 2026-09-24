/* ==========================================================================
   student.js — Schüler-Seite (index.html): Startseite, Tests, Übungen, Spiele, Absenden.
   Geteilte Teile: shared.js, data/*.js, tests-common.js. Lehrkraft-Ansicht: lehrkraft.html + teacher.js.
   ========================================================================== */

fillStudentSelect(document.getElementById('startName'));

// Die Abschlusstest-Bausteine (tests-common.js) rufen updateProgress() auf — hier die echte Fortschrittsanzeige.
let currentTestId = null;
let currentStudentName = "";
let testState = {};

// ---------------- VIEW SWITCHING ----------------
function showView(id) {
  ['view-start','view-test','view-done','view-activity'].forEach(v => {
    document.getElementById(v).classList.toggle('hidden', v !== id);
  });
  window.scrollTo(0,0);
}

// ---------------- FORTSCHRITT (gemeinsam für Übersicht + Listen) ----------------
let progressCache = { name: null, doneTests: new Set(), doneActs: new Set(), unlocked: new Set(), loaded: false };
let progressRequestId = 0;

async function refreshProgress() {
  const myRequestId = ++progressRequestId;
  const name = document.getElementById('startName').value.trim();

  if (name !== progressCache.name) {
    // Anderer Schüler ausgewählt -> Niveau/Lernfeld-Auswahl zurücksetzen, nicht vom vorherigen Schüler übernehmen
    selectedNiveau = null;
    selectedLernfeldIdx = null;
  }

  if (!name) {
    progressCache = { name: "", doneTests: new Set(), doneActs: new Set(), unlocked: new Set(), loaded: false };
    renderAll();
    return;
  }

   const sl = slug(name);
  const doneTests = new Set();
  const doneActs = new Set();
  let manualAccessUpTo = -1;
  const testApproval = {}; // testId -> 'weiter' | 'wiederholen' | 'offen'
  const statusComments = {}; // testId -> Kommentartext der Lehrkraft
  const pausierteTests = new Set(); // testIds mit einem pausierten Entwurf (testprogress:)

  // Die vier unabhängigen Abfragen GLEICHZEITIG starten statt nacheinander — das ist der
  // entscheidende Geschwindigkeitsgewinn, weil jeder Aufruf ans Apps-Script-Backend spürbare
  // eigene Latenz hat.
  const [subRes, actRes, maRes, statusRes] = await Promise.allSettled([
    window.storage.list('submission:', true),
    window.storage.list('activitydone:', true),
    window.storage.get(`manualaccess:${sl}`, true),
    window.storage.listBySuffix(`:${sl}`, true),
  ]);

  if (subRes.status === 'fulfilled') {
    (subRes.value && subRes.value.keys ? subRes.value.keys : []).forEach(k => {
      const parts = k.split(':');
      if (parts.length < 3 || parts[2] !== sl) return;
      if (k.endsWith('_manuell')) return;
      doneTests.add(parts[1]);
    });
  }

  if (actRes.status === 'fulfilled') {
    (actRes.value && actRes.value.keys ? actRes.value.keys : []).forEach(k => {
      const parts = k.split(':');
      if (parts.length >= 3 && parts[2] === sl) doneActs.add(parts[1]);
    });
  }

  // Manuell freigeschalteter Zugriff (Quereinstieg) — NICHT als erledigt gewertet, nur zugänglich
  if (maRes.status === 'fulfilled' && maRes.value && maRes.value.value) {
    try { manualAccessUpTo = aufloeseManualAccessIndex(JSON.parse(maRes.value.value)); } catch (e) { /* skip */ }
  }

  // Lehrkraft-Freigabestatus je Test (nur für abgegebene Tests) + Kommentare + pausierte Entwürfe
  if (statusRes.status === 'fulfilled') {
    (statusRes.value.items || []).forEach(({ key: k, value }) => {
      const parts = k.split(':');
      if (parts[0] === 'status' && parts.length >= 3 && parts[2] === sl) {
        try {
          const obj = JSON.parse(value);
          if (doneTests.has(parts[1])) testApproval[parts[1]] = obj.status || 'offen';
          if (obj.comment) statusComments[parts[1]] = obj.comment;
        } catch (e) { /* skip */ }
      } else if (parts[0] === 'testprogress' && parts.length >= 3 && parts[2] === sl && value) {
        pausierteTests.add(parts[1]);
      }
    });
  }

  // Falls inzwischen eine neuere Anfrage (z.B. durch weiteres Tippen) gestartet wurde: dieses veraltete Ergebnis verwerfen
  if (myRequestId !== progressRequestId) return;

  // Freischaltung berechnen: Lernfelder sind SEQUENZIELL. Nur im aktuell aktiven Lernfeld
  // (erstes noch nicht komplett abgeschlossenes) wird der nächste Schritt freigeschaltet.
  // Bereits komplett abgeschlossene Lernfelder bleiben zur Wiederholung sichtbar.
  // Zusätzlich: manuell freigeschalteter Bereich (Quereinstieg) macht ALLE Items bis einschließlich
  // des gewählten Lernfelds zugänglich, aber ohne sie als erledigt zu markieren.
  // WICHTIG: Für die FREISCHALTUNG (welcher Schritt als Nächstes dran ist) zählt die bloße Abgabe —
  // sonst würde der ganze Kurs stocken, bis die Lehrkraft jede einzelne Abgabe durchgesehen hat.
  // Für die ANZEIGE ("erledigt" grün) zählt zusätzlich die Freigabe durch die Lehrkraft (siehe getDisplayStatus).
  const unlocked = new Set();
  let activeLernfeldFound = false;
  function isDoneLocal(id, kind) { return kind === 'activity' ? doneActs.has(id) : doneTests.has(id); }

  // Bestandsschutz: Wer in einem SPÄTEREN Lernfeld schon etwas abgegeben hat, ist an den früheren
  // Lernfeldern faktisch vorbeigekommen (die Reihenfolge ist sequenziell). Sonst würden Schüler, die schon
  // mitten in A2 stehen, durch neu davor eingefügte Lernfelder (z. B. die A1-Lernfelder) wieder gesperrt.
  // Solche früheren Lernfelder bleiben zum (freiwilligen) Üben sichtbar, zählen aber NICHT als erledigt.
  const lfHatFortschritt = CURRICULUM.map(lf => lf.items.some(id => isDoneLocal(id, curriculumItemInfo(id).kind)));
  const spaeterFortschritt = lfHatFortschritt.map((_, i) => lfHatFortschritt.slice(i + 1).some(Boolean));

  CURRICULUM.forEach((lf, lfIndex) => {
    const lfDoneCount = lf.items.filter(id => isDoneLocal(id, curriculumItemInfo(id).kind)).length;
    const lfComplete = lfDoneCount === lf.items.length || spaeterFortschritt[lfIndex];
    const manuellFreigeschaltet = lfIndex <= manualAccessUpTo;

    if (manuellFreigeschaltet) {
      lf.items.forEach(id => unlocked.add(id));
    }
    if (lfComplete) {
      // Ganzes Lernfeld fertig -> alles zur Wiederholung sichtbar
      lf.items.forEach(id => unlocked.add(id));
    } else if (!activeLernfeldFound) {
      // Das ist das aktuell aktive Lernfeld: erledigte Schritte + genau der nächste
      activeLernfeldFound = true;
      let nextFound = false;
      lf.items.forEach(id => {
        const done = isDoneLocal(id, curriculumItemInfo(id).kind);
        if (done) unlocked.add(id);
        else if (!nextFound) { unlocked.add(id); nextFound = true; }
      });
    }
    // Alle Lernfelder NACH dem aktiven bleiben komplett gesperrt (nichts hinzufügen), außer manuell freigeschaltet
  });

   progressCache = { name, doneTests, doneActs, unlocked, manualAccessUpTo, testApproval, statusComments, pausierteTests, loaded: true };
  renderAll();
}

function isItemDone(id, kind) {
  return kind === 'activity' ? progressCache.doneActs.has(id) : progressCache.doneTests.has(id);
}

// Vier-Zustands-Anzeige:
// 'unerledigt' (rot) — noch gar nicht wirklich abgegeben
// 'wirdgeprueft' (blau) — abgegeben, aber von der Lehrkraft noch nicht bewertet
// 'wiederholen' (gelb) — Lehrkraft hat explizit "Wiederholen nötig" gesetzt
// 'erledigt' (grün) — Lehrkraft hat explizit "Kann weitermachen" gesetzt
function getDisplayStatus(id, kind) {
  if (kind === 'activity') {
    return progressCache.doneActs.has(id) ? 'erledigt' : 'unerledigt';
  }
  if (!progressCache.doneTests.has(id)) return 'unerledigt';
  const status = progressCache.testApproval[id];
  if (status === 'weiter') return 'erledigt';
  if (status === 'wiederholen') return 'wiederholen';
  return 'wirdgeprueft'; // abgegeben, aber noch 'offen'/nicht gesetzt
}

function renderAll() {
  renderProgressOverview();
  renderItemBrowser();
}

document.getElementById('startName').addEventListener('input', refreshProgress);
document.getElementById('startName').addEventListener('change', refreshProgress);

function renderProgressOverview() {
  const el = document.getElementById('progressOverview');
  const name = document.getElementById('startName').value.trim();
  if (!name) {
    el.innerHTML = `<p class="overview-empty">Wähle deinen Namen aus, um deinen Fortschritt zu sehen.</p>`;
    return;
  }
  if (!progressCache.loaded) {
    el.innerHTML = `<p class="overview-empty">Lade Fortschritt …</p>`;
    return;
  }

  let html = `<div class="overview-wrap"><p class="overview-hint">← Zur Seite wischen, um alle Lernfelder zu sehen →</p><div class="overview-grid">`;
  CURRICULUM.forEach(lf => {
    html += `<div class="overview-col"><div class="overview-col-title">${lf.name}</div>`;
    lf.items.forEach((id, i) => {
      const info = curriculumItemInfo(id);
      const reichbar = progressCache.unlocked.has(id);
      let cls, icon;
      if (!reichbar) {
        cls = 'gesperrt'; icon = '○';
      } else {
        const status = getDisplayStatus(id, info.kind);
        if (status === 'erledigt') { cls = 'done'; icon = '✓'; }
        else if (status === 'wiederholen') { cls = 'wiederholen'; icon = '!'; }
        else if (status === 'wirdgeprueft') { cls = 'wirdgeprueft'; icon = '⏳'; }
        else { cls = 'unerledigt'; icon = '○'; }
      }
      const typLabel = info.kind === 'test-final' ? 'Abschlusstest' : info.kind === 'eingangstest' ? 'Einstufungstest' : info.kind === 'grammatik' ? 'Grammatikübung' : info.kind === 'activity' ? 'Übung' : 'Vokabeltest';
      const kurz = info.kind === 'test-final' ? 'Abschlusstest' : info.kind === 'eingangstest' ? info.title : `Schritt ${i+1}: ${info.title}`;
      html += `<div class="overview-item ${cls}"><span class="icon">${icon}</span><span><span class="overview-item-title">${kurz}</span><span class="overview-item-typ">${typLabel}</span></span></div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;
  el.innerHTML = html;
}

// ---------------- STARTSEITE: NIVEAU/LERNFELD-NAVIGATION ----------------
let selectedNiveau = null;
let selectedLernfeldIdx = null;

function findAktivesLernfeldIndex() {
  // Das erste Lernfeld, das noch nicht komplett VON DER LEHRKRAFT FREIGEGEBEN ist (oder das letzte, falls alles fertig).
  // Wichtig: hier zählt "erledigt" im vollen Sinn (abgegeben UND freigegeben), nicht nur abgegeben —
  // sonst würde die Ansicht automatisch von einem noch zu bewertenden Test wegspringen.
  // Lernfelder, bei denen der Schüler schon in einem späteren Lernfeld etwas abgegeben hat, zählen als vorbei
  // (Bestandsschutz, siehe refreshProgress) und werden nicht als "aktives" Lernfeld vorgeschlagen.
  const hatFortschritt = CURRICULUM.map(lf => lf.items.some(id => isItemDone(id, curriculumItemInfo(id).kind)));
  let natuerlicherIndex = CURRICULUM.length - 1;
  for (let i = 0; i < CURRICULUM.length; i++) {
    const lf = CURRICULUM[i];
    const alleFreigegeben = lf.items.every(id => getDisplayStatus(id, curriculumItemInfo(id).kind) === 'erledigt');
    const spaeterFortschritt = hatFortschritt.slice(i + 1).some(Boolean);
    if (!alleFreigegeben && !spaeterFortschritt) { natuerlicherIndex = i; break; }
  }
  // Manuell freigeschalteter Bereich (Quereinstieg) hat Vorrang für die Vorauswahl,
  // falls er weiter fortgeschritten ist als der natürliche Fortschritt (noch nichts wirklich erledigt).
  const manuellIndex = (progressCache.manualAccessUpTo != null) ? progressCache.manualAccessUpTo : -1;
  return Math.max(natuerlicherIndex, manuellIndex);
}

async function renderItemBrowser() {
  const name = document.getElementById('startName').value.trim();
  const niveauSelect = document.getElementById('niveauSelect');
  const lernfeldSelect = document.getElementById('lernfeldSelect');
  const listEl = document.getElementById('itemBrowserList');

  if (!name) {
    document.getElementById('itemBrowserFilters').classList.add('hidden');
    listEl.innerHTML = `<p class="overview-empty">Wähle deinen Namen aus, um deine Lerninhalte zu sehen.</p>`;
    return;
  }
  if (!progressCache.loaded) {
    listEl.innerHTML = `<p class="overview-empty">Lade …</p>`;
    return;
  }
  document.getElementById('itemBrowserFilters').classList.remove('hidden');

  // Welche Niveaus haben für diesen Schüler überhaupt zugängliche Inhalte?
  const niveausMitZugriff = NIVEAUS.filter(niv =>
    CURRICULUM.some(lf => lf.niveau === niv && lf.items.some(id => progressCache.unlocked.has(id)))
  );

  if (!niveausMitZugriff.length) {
    niveauSelect.innerHTML = '';
    lernfeldSelect.innerHTML = '';
    listEl.innerHTML = `<p class="overview-empty">Noch nichts freigeschaltet.</p>`;
    return;
  }

  // Aktives Lernfeld bestimmen (für Vorauswahl)
  const aktivIdx = findAktivesLernfeldIndex();
  const aktivNiveau = CURRICULUM[aktivIdx].niveau;

  if (!selectedNiveau || !niveausMitZugriff.includes(selectedNiveau)) {
    selectedNiveau = niveausMitZugriff.includes(aktivNiveau) ? aktivNiveau : niveausMitZugriff[0];
  }

  niveauSelect.innerHTML = niveausMitZugriff.map(niv => `<option value="${niv}" ${niv === selectedNiveau ? 'selected' : ''}>${niv}</option>`).join('');

  const lernfelderImNiveau = CURRICULUM
    .map((lf, idx) => ({ ...lf, idx }))
    .filter(lf => lf.niveau === selectedNiveau && lf.items.some(id => progressCache.unlocked.has(id)));

  if (selectedLernfeldIdx === null || !lernfelderImNiveau.some(lf => lf.idx === selectedLernfeldIdx)) {
    const passendAktiv = lernfelderImNiveau.find(lf => lf.idx === aktivIdx);
    selectedLernfeldIdx = passendAktiv ? passendAktiv.idx : lernfelderImNiveau[0].idx;
  }

  lernfeldSelect.innerHTML = lernfelderImNiveau.map(lf => `<option value="${lf.idx}" ${lf.idx === selectedLernfeldIdx ? 'selected' : ''}>${lf.name}</option>`).join('');

  await renderLernfeldItems(selectedLernfeldIdx, name);
}

async function renderLernfeldItems(lfIdx, name) {
  const listEl = document.getElementById('itemBrowserList');
  const lf = CURRICULUM[lfIdx];
  listEl.innerHTML = '';

  for (const id of lf.items) {
    if (!progressCache.unlocked.has(id)) continue;
    const info = curriculumItemInfo(id);
    const isActivity = info.kind === 'activity';
    const isGrammatik = info.kind === 'grammatik';
    const status = getDisplayStatus(id, info.kind); // 'erledigt' | 'wiederholen' | 'unerledigt'
    const typLabel = info.kind === 'test-final' ? 'Abschlusstest:' : info.kind === 'eingangstest' ? 'Einstufungstest:' : isGrammatik ? 'Grammatikübung:' : isActivity ? 'Übung:' : 'Vokabeltest:';

    let kommentar = '';
    if (!isActivity && status !== 'unerledigt') {
      kommentar = progressCache.statusComments[id] || '';
    }

    let hatPausiertenFortschritt = false;
    if (!isActivity && status === 'unerledigt') {
      hatPausiertenFortschritt = progressCache.pausierteTests.has(id);
    }

    const statusBadge = status === 'erledigt'
      ? `<span class="status-pill gruen">✓ erledigt</span>`
      : status === 'wiederholen'
        ? `<span class="status-pill gelb">muss wiederholt werden</span>`
        : status === 'wirdgeprueft'
          ? `<span class="status-pill blau">⏳ wird überprüft</span>`
          : hatPausiertenFortschritt
            ? `<span class="status-pill blau">⏸ pausiert</span>`
            : `<span class="status-pill rot">unerledigt</span>`;

    const card = document.createElement('div');
    card.className = 'ib-item-card';
    const sub = (isActivity || isGrammatik) ? ACTIVITIES[id].sub : TESTS[id].sub;
    card.innerHTML = `
      <div class="ib-item-info">
        <div class="ib-item-typ">${typLabel}</div>
        <h3>${info.title}</h3>
        <p>${sub || ''}</p>
        ${statusBadge}
        ${kommentar ? `<div class="repeat-badge">${escapeHtml(kommentar)}</div>` : ''}
      </div>
      <button class="btn small ${status !== 'unerledigt' ? 'secondary' : ''}">${status === 'wiederholen' ? 'Wiederholen' : (status === 'erledigt' || status === 'wirdgeprueft') ? 'Nochmal machen' : hatPausiertenFortschritt ? 'Fortsetzen' : (isActivity ? 'Üben' : 'Starten')}</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if (isActivity || isGrammatik) openActivity(id); else startTest(id, name);
    });
    listEl.appendChild(card);
  }
  if (!listEl.children.length) {
    listEl.innerHTML = `<p class="overview-empty">In diesem Lernfeld ist für dich noch nichts frei.</p>`;
  }
}

document.getElementById('niveauSelect').addEventListener('change', (e) => {
  selectedNiveau = e.target.value;
  selectedLernfeldIdx = null; // im neuen Niveau neu bestimmen
  renderItemBrowser();
});
document.getElementById('lernfeldSelect').addEventListener('change', (e) => {
  selectedLernfeldIdx = parseInt(e.target.value, 10);
  renderLernfeldItems(selectedLernfeldIdx, document.getElementById('startName').value.trim());
});

document.getElementById('actBack').addEventListener('click', () => { refreshProgress(); showView('view-start'); });

refreshProgress();

let currentActivityId = null;
let currentActivityName = "";

function markActivityDone(activityId) {
  const name = currentActivityName || document.getElementById('startName').value.trim();
  if (!name) return;
  try {
    window.storage.set(`activitydone:${activityId}:${slug(name)}`, JSON.stringify({ timestamp: new Date().toISOString() }), true).catch(() => {});
  } catch (e) { /* Speicher nicht verfügbar */ }
}

async function openActivity(actId) {
  const a = ACTIVITIES[actId];
  currentActivityId = actId;
  currentActivityName = document.getElementById('startName').value.trim();
  document.getElementById('actTitle').textContent = a.title;
  document.getElementById('actSub').textContent = a.sub;
  showView('view-activity');
  if (a.type === 'domino') buildDomino(a);
  else if (a.type === 'quartett') buildQuartett(a);
  else if (a.type === 'wortarten') buildWortarten(a);
  else if (a.type === 'brettspiel') buildBrettspiel(a);
  else if (a.type === 'quizkarten') buildQuizkarten(a);
  else if (a.type === 'schlangenbauen') buildSchlangenbauen(a);
  else if (a.type === 'memory') buildMemory(a);
  else if (a.type === 'wortbauen') buildWortbauen(a);
  else if (a.type === 'grammatikblock') {
    document.getElementById('actBody').innerHTML = '<p class="hint">Lädt …</p>';
    const wiederholung = await ermittleGrammatikWiederholungsfilter(actId, currentActivityName, a);
    buildGrammatikblock(a, wiederholung);
    if (!wiederholung.teilweise) restoreGrammatikProgressIfAny(actId, currentActivityName);
    else {
      // Bei gezielter Punkt-Wiederholung KEIN altes "später fortsetzen"-Draft laden — das würde die
      // vorausgefüllten/gesperrten Punkte wieder überschreiben. Ein evtl. alter Draft wird verworfen.
      try { await window.storage.delete(`testprogress:${actId}:${slug(currentActivityName)}`, true); } catch (e) { /* egal */ }
    }
  }
}

// Ermittelt, ob die Lehrkraft bei der letzten Kontrolle nur bestimmte Erklärungspunkte (1–9) zur
// Wiederholung markiert hat statt des ganzen Blocks. Falls ja: die übrigen Punkte werden aus der
// letzten Abgabe vorausgefüllt und gesperrt, nur die markierten Punkte bleiben editierbar — genau
// das gleiche Prinzip wie bei der Teil-Wiederholung normaler Vokabeltests.
async function ermittleGrammatikWiederholungsfilter(id, name, a) {
  const leer = { gesperrt: {}, daten: {}, hinweis: '', teilweise: false };
  try {
    const statusRes = await window.storage.get(`status:${id}:${slug(name)}`, true);
    if (!statusRes || !statusRes.value) return leer;
    const statusObj = JSON.parse(statusRes.value);
    if (statusObj.status !== 'wiederholen' || !Array.isArray(statusObj.punkteWiederholen) || !statusObj.punkteWiederholen.length) return leer;

    const alleNummern = a.punkte.map(p => p.nr);
    const ausgewaehlt = new Set(statusObj.punkteWiederholen);
    if (alleNummern.every(nr => ausgewaehlt.has(nr))) return leer; // effektiv alle Punkte -> normales Verhalten

    const listRes = await window.storage.list(`submission:${id}:${slug(name)}:`, true);
    const keys = (listRes && listRes.keys) || [];
    if (!keys.length) return leer;
    const letzterKey = keys.slice().sort().slice(-1)[0]; // Zeitstempel im Key -> alphabetisch = chronologisch
    const subRes = await window.storage.get(letzterKey, true);
    if (!subRes || !subRes.value) return leer;
    const sub = JSON.parse(subRes.value);
    const raState = sub.raState || {};

    const gesperrt = {}, daten = {};
    alleNummern.forEach(nr => {
      gesperrt[nr] = !ausgewaehlt.has(nr);
      daten[nr] = raState[nr] || [];
    });
    const nurDiese = alleNummern.filter(nr => ausgewaehlt.has(nr)).join(', ');
    return {
      gesperrt, daten, teilweise: true,
      hinweis: `<p style="color:var(--warn); font-size:14px;">Deine Lehrkraft möchte, dass du diesmal nur Punkt ${nurDiese} wiederholst — der Rest ist schon eingetragen.</p>`,
    };
  } catch (e) {
    return leer; // im Zweifel: normales Verhalten (ganzer Block wird abgefragt)
  }
}

// ---------------- ÜBUNG: GRAMMATIKBLOCK ----------------
// Verhält sich wie ein Test: kein Sofort-Feedback pro Feld, eine Abgabe für den ganzen Block,
// Lehrkraft-Kontrolle vor Freigabe, Speichern & später fortsetzen, gezielte Punkt-Wiederholung.
let currentGrammatikGesperrt = {};
let currentGrammatikVorherigeDaten = {};

function buildGrammatikblock(a, wiederholung) {
  const body = document.getElementById('actBody');
  currentGrammatikGesperrt = wiederholung.gesperrt || {};
  currentGrammatikVorherigeDaten = wiederholung.daten || {};

  let html = `<p class="hint">Lies jede Erklärung, dann bearbeite die passende Übung dazu. Am Ende schickst du den ganzen Block auf einmal ab — deine Lehrkraft bespricht ihn danach mit dir.</p>`;
  html += wiederholung.hinweis || '';

  a.punkte.forEach((p, pi) => {
    const gesperrt = !!currentGrammatikGesperrt[p.nr];
    const vorherige = currentGrammatikVorherigeDaten[p.nr] || [];
    html += `
      <div class="grammatik-erklaerung">
        <div class="grammatik-nr">${p.nr}</div>
        <div class="grammatik-inhalt">
          <h3>${escapeHtml(p.titel)}</h3>
          <div class="grammatik-text">${escapeHtml(p.erklaerung).replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      <div class="grammatik-uebung">
        <div class="grammatik-uebung-titel">✎ Übung ${p.nr}${gesperrt ? ' <span class="locked-tag">bereits erledigt</span>' : ''}</div>
        <p class="hint" style="margin-top:0;">${escapeHtml(p.uebung.anleitung)}</p>
    `;
    p.uebung.items.forEach((item, ii) => {
      const key = `gb-${pi}-${ii}`;
      if (gesperrt) {
        html += `
          <div class="grammatik-item">
            <div class="grammatik-frage">${escapeHtml(item.frage)}</div>
            <div style="color:var(--ink-soft); padding:8px 0;">„${escapeHtml(vorherige[ii] || '')}"</div>
          </div>
        `;
      } else {
        html += `
          <div class="grammatik-item">
            <div class="grammatik-frage">${escapeHtml(item.frage)}</div>
            <input type="text" class="text-input gb-input" data-key="${key}" style="width:100%;">
          </div>
        `;
      }
    });
    html += `</div>`;
  });

  html += `<div id="grammatikAbgabeBereich" style="margin-top:18px;"></div>`;
  body.innerHTML = html;
  renderGrammatikAbgabeBereich(a);
}

function renderGrammatikAbgabeBereich(a) {
  const bereich = document.getElementById('grammatikAbgabeBereich');
  bereich.innerHTML = `
    <button class="btn full" id="grammatikAbgebenBtn" style="font-size:16px; padding:14px;">Block abgeben</button>
    <button class="btn secondary full" id="grammatikSpaeterBtn" style="margin-top:10px;">Speichern &amp; später fortsetzen</button>
  `;
  document.getElementById('grammatikAbgebenBtn').addEventListener('click', () => submitGrammatikblock(a));
  document.getElementById('grammatikSpaeterBtn').addEventListener('click', async () => {
    const btn = document.getElementById('grammatikSpaeterBtn');
    btn.disabled = true;
    btn.textContent = 'Speichere …';
    const ok = await saveGrammatikProgressNow();
    if (ok) {
      await refreshProgress();
      showView('view-start');
    } else {
      btn.textContent = 'Fehler — nochmal versuchen';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = 'Speichern & später fortsetzen'; }, 2500);
    }
  });
}

async function saveGrammatikProgressNow() {
  const felder = {};
  document.querySelectorAll('#actBody .gb-input').forEach(input => {
    if (input.value.trim()) felder[input.getAttribute('data-key')] = input.value;
  });
  const payload = { kind: 'grammatik', felder, gespeichertAm: new Date().toISOString() };
  try {
    await window.storage.set(`testprogress:${currentActivityId}:${slug(currentActivityName)}`, JSON.stringify(payload), true);
    return true;
  } catch (e) {
    return false;
  }
}

async function restoreGrammatikProgressIfAny(id, name) {
  let res;
  try { res = await window.storage.get(`testprogress:${id}:${slug(name)}`, true); } catch (e) { return; }
  if (!res || !res.value) return;
  let payload;
  try { payload = JSON.parse(res.value); } catch (e) { return; }
  if (payload.kind !== 'grammatik') return;
  Object.entries(payload.felder || {}).forEach(([key, val]) => {
    const el = document.querySelector(`#actBody .gb-input[data-key="${CSS.escape(key)}"]`);
    if (el) el.value = val;
  });
  const bereich = document.getElementById('grammatikAbgabeBereich');
  if (bereich) {
    bereich.insertAdjacentHTML('beforebegin', `<div class="fortschritt-geladen-hinweis">↩️ Dein bisheriger Fortschritt von ${payload.gespeichertAm ? new Date(payload.gespeichertAm).toLocaleString('de-DE') : 'deinem letzten Versuch'} wurde geladen. Mach einfach weiter!</div>`);
  }
}

async function submitGrammatikblock(a) {
  const btn = document.getElementById('grammatikAbgebenBtn');
  btn.disabled = true;
  btn.textContent = 'Wird gesendet …';

  const teilDetails = [];
  const raState = {};
  let autoCorrect = 0, autoTotal = 0;

  a.punkte.forEach((p, pi) => {
    const gesperrt = !!currentGrammatikGesperrt[p.nr];
    const vorherige = currentGrammatikVorherigeDaten[p.nr] || [];
    const antworten = [];
    p.uebung.items.forEach((item, ii) => {
      autoTotal++;
      const korrektAnzeige = Array.isArray(item.antwort) ? item.antwort.join(' / ') : item.antwort;
      if (gesperrt) {
        // Unverändert aus der letzten Abgabe übernehmen — dieser Punkt wurde nicht neu bearbeitet
        const wert = vorherige[ii] || '';
        antworten.push(wert);
        teilDetails.push({ frage: item.frage, antwort: wert, korrekt: true, korrektAntwort: korrektAnzeige, punktNr: p.nr });
        autoCorrect++;
      } else {
        const input = document.querySelector(`#actBody .gb-input[data-key="gb-${pi}-${ii}"]`);
        const wert = input ? input.value.trim() : '';
        antworten.push(wert);
        const korrekt = wert !== '' && checkAcceptable(wert, item.antwort);
        if (korrekt) autoCorrect++;
        teilDetails.push({ frage: item.frage, antwort: wert || '(keine Antwort)', korrekt, korrektAntwort: korrektAnzeige, punktNr: p.nr });
      }
    });
    raState[p.nr] = antworten;
  });

  const submission = {
    name: currentActivityName, testId: currentActivityId, testTitle: a.title,
    timestamp: new Date().toISOString(), isGrammatikblock: true,
    autoCorrect, autoTotal, teilDetails, raState, teil3: [],
  };

  try {
    const key = `submission:${currentActivityId}:${slug(currentActivityName)}:${Date.now()}`;
    await speichereMitRetry(key, JSON.stringify(submission), true);
    await speichereMitRetry(`status:${currentActivityId}:${slug(currentActivityName)}`, JSON.stringify({ status: 'offen' }), true);
    try { await window.storage.delete(`testprogress:${currentActivityId}:${slug(currentActivityName)}`, true); } catch (e) { /* unkritisch */ }
    document.getElementById('doneName').textContent = currentActivityName;
    showView('view-done');
  } catch (e) {
    alert('Der Block konnte nicht gespeichert werden (' + (e && e.message ? e.message : 'Speicherfehler') + '). Bitte kurz warten und nochmal auf „Block abgeben" tippen — deine Antworten sind noch da.');
    btn.disabled = false;
    btn.textContent = 'Block abgeben';
  }
}

// ---------------- ÜBUNG: DOMINO-KETTE (echtes Legespiel mit 2-seitigen Steinen) ----------------
function buildDomino(a) {
  const body = document.getElementById('actBody');
  const pairs = a.pairs; // [[wordA, wordB], ...] in Lösungsreihenfolge

  // Gegenteil-Nachschlage-Tabelle aus den Paaren aufbauen
  const oppMap = {};
  pairs.forEach(([x,y]) => { oppMap[x] = y; oppMap[y] = x; });

  // Steine bauen: START + alle Paare abwechselnd verkettet + ZIEL
  const flat = ["START", ...pairs.flat(), "ZIEL"];
  const allTiles = [];
  for (let i = 0; i < flat.length; i += 2) {
    allTiles.push({ id: i/2, a: flat[i], b: flat[i+1] });
  }

  let board = [ { a: allTiles[0].a, b: allTiles[0].b } ]; // Startstein liegt schon
  let openEnd = allTiles[0].b; // "alt"
  let pool = allTiles.slice(1).sort(() => 0.5 - Math.random());

  function resetGame() {
    board = [ { a: allTiles[0].a, b: allTiles[0].b } ];
    openEnd = allTiles[0].b;
    pool = allTiles.slice(1).sort(() => 0.5 - Math.random());
    render();
  }

  function tileHtml(t, extraClass) {
    return `<div class="domino-piece ${extraClass||''}" data-id="${t.id}">
      <span class="half">${t.a}</span><span class="divider"></span><span class="half">${t.b}</span>
    </div>`;
  }

  function render() {
    const done = openEnd === "ZIEL";
    if (done) markActivityDone(currentActivityId);

    let boardHtml = board.map((t, i) => {
      const cls = i === 0 ? 'placed start' : 'placed';
      return `<div class="domino-piece ${cls}"><span class="half">${t.a}</span><span class="divider"></span><span class="half">${t.b}</span></div>`;
    }).join('<span class="domino-link">→</span>');

    let html = `
      <p class="hint">Tippe einen Stein an, der mit „<strong>${done ? 'ZIEL' : openEnd}</strong>" zusammenpasst (Gegenteil). Beide Seiten eines Steins kannst du nutzen.</p>
      <div class="domino-board"><div class="domino-track">${boardHtml}</div></div>
    `;

    if (done) {
      html += `
        <div class="domino-done">
          <div class="big-icon">🎉</div>
          <h2 style="font-family:Georgia,serif; margin:6px 0;">Ziel erreicht!</h2>
          <p style="color:var(--ink-soft);">Alle ${allTiles.length} Steine richtig angelegt.</p>
          <button class="btn" id="dominoRestart" style="margin-top:14px;">Nochmal spielen</button>
        </div>`;
    } else {
      html += `
        <div class="section-label" style="margin-top:22px;">Deine Steine (${pool.length})</div>
        <div class="domino-pool">${pool.map(t => tileHtml(t)).join('')}</div>
      `;
    }
    body.innerHTML = html;

    if (done) {
      document.getElementById('dominoRestart').addEventListener('click', resetGame);
      return;
    }

    body.querySelectorAll('.domino-pool .domino-piece').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.getAttribute('data-id'), 10);
        const tile = pool.find(t => t.id === id);
        const wantedNext = oppMap[openEnd];
        let orientedTile = null;
        if (tile.a === wantedNext) orientedTile = { a: tile.a, b: tile.b };
        else if (tile.b === wantedNext) orientedTile = { a: tile.b, b: tile.a };

        if (orientedTile) {
          el.classList.add('correct');
          setTimeout(() => {
            board.push(orientedTile);
            openEnd = orientedTile.b;
            pool = pool.filter(t => t.id !== id);
            render();
          }, 280);
        } else {
          el.classList.add('incorrect');
          setTimeout(() => el.classList.remove('incorrect'), 450);
        }
      });
    });
  }
  render();
}

// ---------------- ÜBUNG: ADJEKTIV-QUARTETT (Sammelspiel) ----------------
function buildQuartett(a) {
  const body = document.getElementById('actBody');
  const families = a.items.map((it, fIdx) => ({
    fIdx,
    label: it.positiv,
    cards: [
      { word: it.positiv, role: 'Positiv' },
      { word: it.komparativ, role: 'Komparativ' },
      { word: it.superlativ, role: 'Superlativ' },
      { word: it.gegenteil, role: 'Gegenteil' },
    ],
  }));

  let allCards = [];
  families.forEach(fam => fam.cards.forEach((c, ci) => {
    allCards.push({ id: `${fam.fIdx}-${ci}`, word: c.word, family: fam.fIdx });
  }));

  let pool = [];
  let selected = [];
  let collected = []; // family indices
  let shakeIds = [];

  function resetGame() {
    pool = allCards.slice().sort(() => 0.5 - Math.random());
    selected = [];
    collected = [];
    shakeIds = [];
    render();
  }

  function render() {
    const done = collected.length === families.length;
    if (done) markActivityDone(currentActivityId);

    let collectedHtml = collected.map(fIdx => `<span class="quartett-collected-badge">✓ ${families[fIdx].label}</span>`).join('');

    let poolHtml = pool.map(c => {
      const isSel = selected.includes(c.id);
      const isShake = shakeIds.includes(c.id);
      return `<div class="quartett-card${isSel ? ' selected' : ''}${isShake ? ' incorrect' : ''}" data-id="${c.id}">${c.word}</div>`;
    }).join('');

    let html = `
      <p class="hint">Finde die 4 zusammengehörigen Karten (Positiv, Komparativ, Superlativ, Gegenteil) und sammle die Familie.</p>
      ${collected.length ? `<div class="quartett-collected-row">${collectedHtml}</div>` : ''}
    `;

    if (done) {
      html += `
        <div class="domino-done">
          <div class="big-icon">🃏</div>
          <h2 style="font-family:Georgia,serif; margin:6px 0;">Alle Quartette gesammelt!</h2>
          <p style="color:var(--ink-soft);">Du hast alle ${families.length} Familien gefunden.</p>
          <button class="btn" id="quartettRestart" style="margin-top:14px;">Nochmal spielen</button>
        </div>`;
    } else {
      html += `
        <div class="quartett-pool">${poolHtml}</div>
        <div class="check-btn-row" style="margin-top:16px;">
          <button class="btn" id="quartettCheck" ${selected.length === 4 ? '' : 'disabled'}>Familie prüfen (${selected.length}/4)</button>
          <button class="btn secondary" id="quartettClear" ${selected.length ? '' : 'disabled'}>Auswahl leeren</button>
        </div>
      `;
    }
    body.innerHTML = html;

    if (done) {
      document.getElementById('quartettRestart').addEventListener('click', resetGame);
      return;
    }

    body.querySelectorAll('.quartett-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (selected.includes(id)) {
          selected = selected.filter(x => x !== id);
        } else if (selected.length < 4) {
          selected.push(id);
        }
        render();
      });
    });

    const checkBtn = document.getElementById('quartettCheck');
    if (checkBtn) checkBtn.addEventListener('click', () => {
      const cards = pool.filter(c => selected.includes(c.id));
      const sameFamily = cards.every(c => c.family === cards[0].family);
      if (sameFamily) {
        const fIdx = cards[0].family;
        collected.push(fIdx);
        pool = pool.filter(c => !selected.includes(c.id));
        selected = [];
        render();
      } else {
        shakeIds = selected.slice();
        render();
        setTimeout(() => { shakeIds = []; selected = []; render(); }, 550);
      }
    });

    const clearBtn = document.getElementById('quartettClear');
    if (clearBtn) clearBtn.addEventListener('click', () => { selected = []; render(); });
  }

  resetGame();
}

// ---------------- ÜBUNG: BRETTSPIEL "Wohnung einrichten" ----------------
function possessivForm(stamm, genus) {
  // mein/dein/sein/unser -> Endung je nach Genus: der/das -> keine Endung, die -> +e
  if (genus === 'die') return stamm === 'unser' ? 'unsere' : stamm + 'e';
  return stamm;
}

function berechneSpielfeldPositionen(anzahl) {
  // Schlangenpfad in einem 5-Spalten-Raster, von unten links beginnend
  const cols = 5;
  const positionen = [];
  for (let i = 0; i <= anzahl; i++) {
    const reiheVonUnten = Math.floor(i / cols);
    const posInReihe = i % cols;
    const col = (reiheVonUnten % 2 === 0) ? posInReihe : (cols - 1 - posInReihe);
    positionen.push({ row: reiheVonUnten, col });
  }
  const maxRow = Math.max(...positionen.map(p => p.row));
  return positionen.map(p => ({ gridRow: maxRow - p.row + 1, gridColumn: p.col + 1 }));
}

function renderSpielbrett(feldAnzahl, position) {
  const positionen = berechneSpielfeldPositionen(feldAnzahl);
  const maxRow = Math.max(...positionen.map(p => p.gridRow));
  let html = `<div class="spielbrett" style="grid-template-rows: repeat(${maxRow}, 1fr);">`;
  for (let i = 0; i <= feldAnzahl; i++) {
    const pos = positionen[i];
    const isStart = i === 0, isZiel = i === feldAnzahl, isBesucht = i < position, isHier = i === position;
    let cls = 'spielfeld-zelle';
    if (isStart) cls += ' start'; else if (isZiel) cls += ' ziel'; else if (isBesucht) cls += ' besucht';
    html += `<div class="${cls}" style="grid-row:${pos.gridRow}; grid-column:${pos.gridColumn};">`;
    html += isStart ? `<span>START</span>` : isZiel ? `<span>ZIEL</span>` : `<span class="zellnummer">${i}</span>`;
    if (isHier) html += `<span class="spielfigur">🧍</span>`;
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

// Artikel der Zimmer-Namen, für die Artikel-Pflicht bei der Eingabe im Brettspiel "Wohnung einrichten"
const ZIMMER_ARTIKEL = {
  Schlafzimmer: 'das', Kinderzimmer: 'das', Wohnzimmer: 'das', Arbeitszimmer: 'das', Badezimmer: 'das',
  Küche: 'die', Flur: 'der', Garten: 'der', Keller: 'der', Balkon: 'der'
};

function buildBrettspiel(a) {
  const body = document.getElementById('actBody');
  const moebelListe = Object.keys(a.moebel_zimmer);
  const feldAnzahl = a.feld_anzahl;

  let position = 0;
  let runde = null; // { moebel, person, genus, zimmer }
  let phase = 'ziehen';

  function neueKarte() {
    const moebel = moebelListe[Math.floor(Math.random() * moebelListe.length)];
    const person = a.personen[Math.floor(Math.random() * a.personen.length)];
    const info = a.moebel_zimmer[moebel];
    runde = { moebel, person, genus: info.genus, zimmer: info.zimmer };
    phase = 'antworten';
    render();
  }

  function render() {
    const done = position >= feldAnzahl;
    if (done) markActivityDone(currentActivityId);
    let html = `<p class="hint">Ziehe eine Karte, bilde den Satz und würfle bei richtiger Antwort weiter.</p>`;
    html += renderSpielbrett(feldAnzahl, position);

    if (done) {
      html += `<div class="domino-done"><div class="big-icon">🏠</div><h2 style="font-family:Georgia,serif;">Wohnung eingerichtet!</h2><p style="color:var(--ink-soft);">Du hast das Ziel erreicht.</p><button class="btn" id="spielRestart" style="margin-top:14px;">Nochmal spielen</button></div>`;
      body.innerHTML = html;
      document.getElementById('spielRestart').addEventListener('click', () => { position = 0; phase = 'ziehen'; render(); });
      return;
    }

    if (phase === 'ziehen') {
      html += `<div style="text-align:center; padding:10px 20px 20px;"><button class="btn" id="kartezBtn" style="font-size:16px; padding:14px 28px;">🃏 Karte ziehen</button></div>`;
      body.innerHTML = html;
      document.getElementById('kartezBtn').addEventListener('click', neueKarte);
      return;
    }

    if (phase === 'antworten') {
      const richtigePoss = possessivForm(runde.person.possessiv, runde.genus);
      const possOptions = a.personen.map(p => possessivForm(p.possessiv, runde.genus)).filter((v,i,arr) => arr.indexOf(v)===i).sort(() => 0.5 - Math.random());
      html += `
        <div class="item">
          <div class="item-label">Du ziehst: <strong>${runde.genus} ${runde.moebel}</strong> (${runde.person.pronomen})</div>
          <div style="margin-bottom:12px;">Das ist <span id="possBlank" style="display:inline-block; min-width:70px; border-bottom:2px solid var(--ink-soft); text-align:center; font-weight:700;">___</span> ${runde.moebel}. In welchem Zimmer?</div>
          <div class="mc-options" style="margin-bottom:14px;">${possOptions.map(p => `<div class="mc-opt" data-poss="${p}">${p}</div>`).join('')}</div>
          <input type="text" class="text-input" id="zimmerInput" placeholder="z. B. die Küche" style="width:100%; margin-bottom:10px;">
          <button class="btn" id="pruefenBtn">Prüfen</button>
          <div class="feedback" id="spielFeedback"></div>
        </div>
      `;
      body.innerHTML = html;

      let gewaehltePoss = null;
      body.querySelectorAll('[data-poss]').forEach(el => {
        el.addEventListener('click', () => {
          body.querySelectorAll('[data-poss]').forEach(o => o.classList.remove('selected'));
          el.classList.add('selected');
          gewaehltePoss = el.getAttribute('data-poss');
          document.getElementById('possBlank').textContent = gewaehltePoss;
        });
      });

      document.getElementById('pruefenBtn').addEventListener('click', () => {
        const fb = document.getElementById('spielFeedback');
        const zimmerRoh = document.getElementById('zimmerInput').value.trim();
        const zimmerNorm = normalize(zimmerRoh);
        // Der Artikel muss mit angegeben werden (z. B. "die Küche", nicht nur "Küche").
        const treffer = runde.zimmer.find(z => normalize(`${ZIMMER_ARTIKEL[z] || ''} ${z}`) === zimmerNorm);
        const nurOhneArtikel = !treffer && runde.zimmer.some(z => normalize(z) === zimmerNorm);
        const zielString = treffer ? `${ZIMMER_ARTIKEL[treffer] || ''} ${treffer}`.trim() : null;
        const grossKleinOk = treffer ? zimmerRoh === zielString : null;
        const possOk = gewaehltePoss === richtigePoss;
        const alleZimmerMitArtikel = runde.zimmer.map(z => `${ZIMMER_ARTIKEL[z] || ''} ${z}`.trim()).join(', ');
        if (treffer && grossKleinOk && possOk) {
          fb.className = 'feedback show good'; fb.style.background = 'var(--good-bg)'; fb.style.color='var(--good)';
          fb.textContent = `✓ Richtig! Mögliche Zimmer: ${alleZimmerMitArtikel}.`;
          phase = 'wuerfeln';
          setTimeout(render, 900);
        } else {
          fb.className = 'feedback show bad'; fb.style.background='var(--bad-bg)'; fb.style.color='var(--bad)';
          let hinweis = '';
          if (nurOhneArtikel) hinweis = ' Achtung: Schreib den Artikel mit dazu (z. B. „die Küche").';
          else if (treffer && !grossKleinOk) hinweis = ` Achtung: Nomen werden großgeschrieben (richtig: „${zielString}").`;
          fb.textContent = `✗ Nicht ganz.${hinweis} Richtig wäre: Das ist ${richtigePoss} ${runde.moebel}. Mögliche Zimmer: ${alleZimmerMitArtikel}.`;
        }
      });
      return;
    }

    if (phase === 'wuerfeln') {
      html += `<div style="text-align:center; padding:10px 20px 20px;">
        <div class="wuerfel-anzeige" id="wuerfelAnzeige">🎲</div><br>
        <button class="btn" id="wuerfelBtn" style="font-size:16px; padding:14px 28px;">Würfeln</button>
      </div>`;
      body.innerHTML = html;
      document.getElementById('wuerfelBtn').addEventListener('click', () => {
        const btn = document.getElementById('wuerfelBtn');
        const anzeige = document.getElementById('wuerfelAnzeige');
        btn.disabled = true;
        anzeige.classList.add('rolling');
        let tick = 0;
        const rollInterval = setInterval(() => {
          anzeige.textContent = String(1 + Math.floor(Math.random() * 6));
          tick++;
          if (tick > 8) {
            clearInterval(rollInterval);
            anzeige.classList.remove('rolling');
            const wurf = 1 + Math.floor(Math.random() * 6);
            anzeige.textContent = wurf;
            setTimeout(() => {
              position = Math.min(feldAnzahl, position + wurf);
              phase = 'ziehen';
              render();
            }, 500);
          }
        }, 80);
      });
    }
  }
  render();
}

// ---------------- ÜBUNG: SCHLANGENBAUEN (Perfekt-Sätze aus Kartensets bilden) ----------------
function buildSchlangenbauen(a) {
  const body = document.getElementById('actBody');
  const pronomenIdxMap = { "ich":0, "du":1, "er":2, "sie":2, "es":2, "wir":3, "ihr":4, "Sie":5 };
  const lastSieIdx = a.personalpronomen.lastIndexOf('sie');
  const pronomenListe = a.personalpronomen.map((p, i) => ({ text: p, idx: (p === 'sie' && i === lastSieIdx) ? 5 : pronomenIdxMap[p] }));
  const habenForm = ["habe","hast","hat","haben","habt","haben"];
  const seinForm = ["bin","bist","ist","sind","seid","sind"];

  let gesammelt = 0;
  let versuche = 0;
  let runde = null;

  function neueRunde() {
    const pron = pronomenListe[Math.floor(Math.random() * pronomenListe.length)];
    const verb = a.verbkarten[Math.floor(Math.random() * a.verbkarten.length)];
    const ergaenzung = a.ergaenzungskarten[Math.floor(Math.random() * a.ergaenzungskarten.length)];
    const hilfsform = (verb.hilfsverb === 'haben' ? habenForm : seinForm)[pron.idx];
    const korrekt = `${pron.text.charAt(0).toUpperCase()+pron.text.slice(1)} ${hilfsform} ${ergaenzung} ${verb.partizip}.`;
    runde = { pron: pron.text, verb, ergaenzung, korrekt };
    render();
  }

  function render() {
    let html = `
      <p class="hint">Ziehe drei Karten und bilde daraus einen Perfekt-Satz.</p>
      <div class="quiz-stapel-info"><span>Versuche: ${versuche}</span><span>Richtige Sätze: ${gesammelt} 🐍</span></div>
    `;
    if (!runde) {
      html += `<div style="text-align:center; padding:10px 0 20px;">
        <button class="btn" id="ziehenBtn" style="font-size:16px; padding:14px 28px;">Karten ziehen</button>
        ${gesammelt >= 3 ? `<div style="margin-top:14px;"><button class="btn secondary" id="schlangeFertigBtn">Fertig ✓</button></div>` : ''}
      </div>`;
      body.innerHTML = html;
      document.getElementById('ziehenBtn').addEventListener('click', neueRunde);
      const fertigBtn = document.getElementById('schlangeFertigBtn');
      if (fertigBtn) fertigBtn.addEventListener('click', () => {
        markActivityDone(currentActivityId);
        fertigBtn.textContent = 'Als erledigt gespeichert ✓';
        fertigBtn.disabled = true;
      });
      return;
    }

    html += `
      <div class="domino-board">
        <div class="domino-track">
          <div class="domino-piece placed start"><span class="half">Pronomen</span><span class="divider"></span><span class="half">${runde.pron}</span></div>
          <div class="domino-piece placed"><span class="half">Verb</span><span class="divider"></span><span class="half">${runde.verb.infinitiv}</span></div>
          <div class="domino-piece placed"><span class="half">Ergänzung</span><span class="divider"></span><span class="half">${runde.ergaenzung}</span></div>
        </div>
      </div>
      <p class="hint">Schreibe den ganzen Satz im Perfekt (Hilfsverb: <strong>${runde.verb.hilfsverb}</strong>, Partizip: <strong>${runde.verb.partizip}</strong>).</p>
      <input type="text" class="text-input" id="satzInput" placeholder="z. B. Ich habe gestern gekocht." style="width:100%; margin-bottom:10px;">
      <button class="btn" id="pruefenSatzBtn">Prüfen</button>
      <div class="feedback" id="schlangeFeedback"></div>
    `;
    body.innerHTML = html;

    document.getElementById('pruefenSatzBtn').addEventListener('click', () => {
      const fb = document.getElementById('schlangeFeedback');
      const val = document.getElementById('satzInput').value;
      versuche++;
      if (checkAcceptable(val, runde.korrekt)) {
        gesammelt++;
        fb.className = 'feedback show good'; fb.style.background = 'var(--good-bg)'; fb.style.color = 'var(--good)';
        fb.textContent = `✓ Richtig! „${runde.korrekt}"`;
      } else {
        fb.className = 'feedback show bad'; fb.style.background = 'var(--bad-bg)'; fb.style.color = 'var(--bad)';
        fb.textContent = `✗ Nicht ganz. Richtig wäre: „${runde.korrekt}"`;
      }
      setTimeout(() => { runde = null; render(); }, 1800);
    });
  }
  render();
}

// ---------------- ÜBUNG: KÖRPER-QUIZ (Selbstcheck-Sammelspiel) ----------------
function buildQuizkarten(a) {
  const body = document.getElementById('actBody');  let stapel = a.karten.slice().sort(() => 0.5 - Math.random());
  let gesammelt = 0;
  let zeigeAntwort = false;

  function resetGame() {
    stapel = a.karten.slice().sort(() => 0.5 - Math.random());
    gesammelt = 0;
    zeigeAntwort = false;
    render();
  }

  function render() {
    const done = stapel.length === 0;
    if (done) markActivityDone(currentActivityId);
    let html = `<div class="quiz-stapel-info"><span>Stapel: ${stapel.length} Karten</span><span>Gesammelt: ${gesammelt} 🏆</span></div>`;

    if (done) {
      html += `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Stapel geschafft!</h2><p style="color:var(--ink-soft);">Du hast ${gesammelt} von ${a.karten.length} Karten gewusst.</p><button class="btn" id="quizRestart" style="margin-top:14px;">Nochmal spielen</button></div>`;
      body.innerHTML = html;
      document.getElementById('quizRestart').addEventListener('click', resetGame);
      return;
    }

    const karte = stapel[0];
    html += `<div class="quiz-karte">
      <div class="quiz-frage">${karte.frage}</div>
      ${zeigeAntwort ? `<div class="quiz-antwort">${karte.antwort}</div>` : ''}
    </div>`;

    if (!zeigeAntwort) {
      html += `<div style="text-align:center;"><button class="btn secondary" id="antwortZeigenBtn">Antwort zeigen</button></div>`;
    } else {
      html += `<div class="quiz-buttons">
        <button class="btn danger" id="nichtGewusstBtn">Nicht gewusst</button>
        <button class="btn ok" id="gewusstBtn">Gewusst ✓</button>
      </div>`;
    }
    body.innerHTML = html;

    if (!zeigeAntwort) {
      document.getElementById('antwortZeigenBtn').addEventListener('click', () => { zeigeAntwort = true; render(); });
    } else {
      document.getElementById('gewusstBtn').addEventListener('click', () => {
        gesammelt++;
        stapel.shift();
        zeigeAntwort = false;
        render();
      });
      document.getElementById('nichtGewusstBtn').addEventListener('click', () => {
        const karte = stapel.shift();
        stapel.push(karte);
        zeigeAntwort = false;
        render();
      });
    }
  }
  render();
}

function buildWortarten(a) {
  const body = document.getElementById('actBody');
  body.innerHTML = `
    <div id="wortartenSortier"></div>
    <div class="section-label">Artikel &amp; Plural</div>
    <p class="hint">Ergänze bestimmten Artikel, unbestimmten Artikel und Plural.</p>
    <div id="artikelTabelle"></div>
    <div class="section-label">Verben bestimmen</div>
    <p class="hint">Bestimme die richtige Verbform.</p>
    <div id="verbenBestimmen"></div>
    <button class="btn full" id="wortartenFertigBtn" style="margin-top:18px;">Fertig ✓</button>
  `;
  buildWortartenSortier(a);
  buildArtikelTabelle(a);
  buildVerbenBestimmen(a);
  document.getElementById('wortartenFertigBtn').addEventListener('click', () => {
    markActivityDone(currentActivityId);
    const btn = document.getElementById('wortartenFertigBtn');
    btn.textContent = 'Als erledigt gespeichert ✓';
    btn.disabled = true;
  });
}

function buildWortartenSortier(a) {
  const mount = document.getElementById('wortartenSortier');
  const placed = {};
  let selectedWord = null;
  const catClass = { 'Nomen':'nomen', 'Adjektiv':'adjektiv', 'Verb':'verb' };

  function render() {
    const remaining = a.sortierItems.filter(it => !placed[it.word]);
    let poolHtml = remaining.map(it => `<div class="wortarten-chip ${selectedWord === it.word ? 'selected' : ''}" data-word="${it.word}">${it.word}</div>`).join('');
    let bucketsHtml = a.kategorien.map(kat => {
      const items = Object.entries(placed).filter(([w,p]) => p.kategorie === kat);
      const placedHtml = items.map(([w,p]) => `<span class="${p.correct ? '' : 'wrong'}">${w}</span>`).join('');
      return `<div class="wortarten-bucket ${catClass[kat]}" data-kat="${kat}"><h4>${kat}</h4><div class="placed">${placedHtml}</div></div>`;
    }).join('');

    mount.innerHTML = `
      <p class="hint">Tippe zuerst ein Wort an, dann die passende Wortart.</p>
      <div class="wortarten-pool">${poolHtml || '<span style="color:var(--good); font-weight:600;">Alle Wörter zugeordnet! 🎉</span>'}</div>
      <div class="wortarten-buckets">${bucketsHtml}</div>
    `;
    mount.querySelectorAll('.wortarten-chip').forEach(el => {
      el.addEventListener('click', () => { selectedWord = el.getAttribute('data-word'); render(); });
    });
    mount.querySelectorAll('.wortarten-bucket').forEach(el => {
      el.addEventListener('click', () => {
        if (!selectedWord) return;
        const kat = el.getAttribute('data-kat');
        const item = a.sortierItems.find(it => it.word === selectedWord);
        placed[selectedWord] = { kategorie: kat, correct: item.kategorie === kat };
        selectedWord = null;
        render();
      });
    });
  }
  render();
}

function buildArtikelTabelle(a) {
  const mount = document.getElementById('artikelTabelle');
  a.artikelItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'steiger-row';
    row.innerHTML = `
      <div class="pos">${item.nomen}</div>
      <div class="steiger-grid">
        <div class="steiger-field"><label>bestimmter Artikel</label><input type="text" data-field="artikel"></div>
        <div class="steiger-field"><label>unbestimmter Artikel</label><input type="text" data-field="unbestimmt"></div>
        <div class="steiger-field"><label>Plural</label><input type="text" data-field="plural"></div>
      </div>
    `;
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', () => {
        const field = input.getAttribute('data-field');
        const correct = normalize(input.value) === normalize(item[field]);
        input.style.borderColor = input.value.trim() === '' ? 'var(--line)' : (correct ? 'var(--good)' : 'var(--bad)');
      });
    });
    mount.appendChild(row);
  });
}

function buildVerbenBestimmen(a) {
  const mount = document.getElementById('verbenBestimmen');
  a.verbenItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'mc-row';
    row.style.display = 'block';
    row.innerHTML = `
      <div style="margin-bottom:6px;">${item.frage}</div>
      <input type="text" class="text-input verb-input" style="max-width:220px;">
    `;
    const input = row.querySelector('input');
    input.addEventListener('blur', () => {
      const correct = normalize(input.value) === normalize(item.antwort);
      input.style.borderColor = input.value.trim() === '' ? 'var(--line)' : (correct ? 'var(--good)' : 'var(--bad)');
    });
    mount.appendChild(row);
  });
}

document.getElementById('backToStart').addEventListener('click', () => { refreshProgress(); showView('view-start'); });
document.getElementById('toStartAgain').addEventListener('click', () => { refreshProgress(); showView('view-start'); });

// ---------------- WIEDERHOLUNG NUR AUSGEWÄHLTER TEILE ----------------
// Prüft, ob die Lehrkraft bei der letzten Kontrolle nur bestimmte Teile (Bereiche) zur Wiederholung
// markiert hat. Falls ja: die übrigen Teile werden aus der letzten Einreichung vorausgefüllt und
// nicht nochmal abgefragt; nur die markierten Teile sind beim erneuten Öffnen aktiv/eingabefähig.
async function ermittleWiederholungsfilter(testId, name, t) {
  const leer = { gesperrt: { teil1: false, teil2: false, teil3: false, teil4: false }, daten: {}, hinweis: '' };
  try {
    const statusRes = await window.storage.get(`status:${testId}:${slug(name)}`, true);
    if (!statusRes || !statusRes.value) return leer;
    const statusObj = JSON.parse(statusRes.value);
    if (statusObj.status !== 'wiederholen' || !Array.isArray(statusObj.wiederholenTeile) || !statusObj.wiederholenTeile.length) return leer;

    const vorhandeneTeile = ['teil1','teil2','teil3','teil4'].filter(tn => t[tn] && t[tn].length);
    const ausgewaehlt = new Set(statusObj.wiederholenTeile);
    // Wenn alle vorhandenen Teile ausgewählt sind, ist es effektiv eine volle Wiederholung -> normales Verhalten.
    if (vorhandeneTeile.every(tn => ausgewaehlt.has(tn))) return leer;

    const listRes = await window.storage.list(`submission:${testId}:${slug(name)}:`, true);
    const keys = (listRes && listRes.keys) || [];
    if (!keys.length) return leer;
    const letzterKey = keys.slice().sort().slice(-1)[0]; // Zeitstempel im Key -> alphabetisch = chronologisch
    const subRes = await window.storage.get(letzterKey, true);
    if (!subRes || !subRes.value) return leer;
    const sub = JSON.parse(subRes.value);
    const raState = sub.raState || {};

    const gesperrt = {}, daten = {};
    vorhandeneTeile.forEach(tn => {
      gesperrt[tn] = !ausgewaehlt.has(tn);
      daten[tn] = raState[tn] || {};
    });
    const teilNamen = { teil1: 'Teil 1', teil2: 'Teil 2', teil3: 'Teil 3', teil4: 'Teil 4' };
    const nurDiese = vorhandeneTeile.filter(tn => ausgewaehlt.has(tn)).map(tn => teilNamen[tn]).join(', ');
    return {
      gesperrt: { teil1: !!gesperrt.teil1, teil2: !!gesperrt.teil2, teil3: !!gesperrt.teil3, teil4: !!gesperrt.teil4 },
      daten,
      hinweis: `<p style="color:var(--warn); font-size:14px;">Deine Lehrkraft möchte, dass du diesmal nur ${nurDiese} wiederholst — der Rest ist schon eingetragen.</p>`,
    };
  } catch (e) {
    return leer; // im Zweifel: normales Verhalten (ganzer Test wird abgefragt)
  }
}

// ---------------- TEST STARTEN ----------------
// Standard-Hinweis eines Teils merken und pro Test ueberschreiben (z. B. Welches Bild zeigt den Buchstaben?)
function setzeTeilHinweis(secId, text) {
  const p = document.querySelector('#' + secId + ' p.hint'); if (!p) return;
  if (p.dataset.standard === undefined) p.dataset.standard = p.textContent;
  p.textContent = text || p.dataset.standard;
}
async function startTest(testId, name) {
  currentTestId = testId;
  currentStudentName = name;
  const t = TESTS[testId];
  document.getElementById('testTitle').textContent = t.title;
  document.getElementById('testSub').textContent = t.sub;

  const isAbschluss = istAbschlusstest(t); // alle Abschlusstest-Typen (siehe ABSCHLUSS_BUILDER in tests-common.js)
  const isEingangstest = t.type === 'eingangstest';
  document.getElementById('abschlussSec').classList.toggle('hidden', !isAbschluss && !isEingangstest);
  ['teil1sec','teil2sec','teil3sec','teil4sec'].forEach(id => document.getElementById(id).classList.toggle('hidden', isAbschluss || isEingangstest));
  document.getElementById('submitBtn').classList.toggle('hidden', isEingangstest);
  document.querySelector('.progress-bar').classList.toggle('hidden', isEingangstest);
  document.getElementById('progressRestoredNotice').innerHTML = '';
  let teilweiseGesperrt = false;

  if (isAbschluss) {
    abschlussState = { punkte: 0, felderGesamt: 0, felderBeantwortet: 0 };
    ABSCHLUSS_BUILDER[t.type](t);
  } else if (isEingangstest) {
    buildEingangstest(t);
  } else {
    testState = { teil1: {}, teil2: {}, teil3: {}, teil4: {} };
    const wiederholung = await ermittleWiederholungsfilter(testId, name, t);
    buildTeil1(t.teil1, wiederholung.gesperrt.teil1, wiederholung.daten.teil1);
    buildTeil2(t.teil2, wiederholung.gesperrt.teil2, wiederholung.daten.teil2);
    buildTeil3(t.teil3, wiederholung.gesperrt.teil3, wiederholung.daten.teil3);
    buildTeil4(t.teil4, t.teil4Label, t.teil4Hint, wiederholung.gesperrt.teil4, wiederholung.daten.teil4, !!t.teil4OhneWortbank);
    if (wiederholung.hinweis) document.getElementById('progressRestoredNotice').innerHTML = wiederholung.hinweis;
    teilweiseGesperrt = Object.values(wiederholung.gesperrt).some(Boolean);
    if (teilweiseGesperrt) {
      // Bei gezielter Teil-Wiederholung KEIN altes "später fortsetzen"-Draft laden — das würde die
      // vorausgefüllten/gesperrten Teile wieder überschreiben. Ein evtl. alter Draft wird verworfen.
      try { await window.storage.delete(progressKeyFor(testId, name), true); } catch (e) { /* egal */ }
    }
  }
  setzeTeilHinweis('teil1sec', t.teil1Hint);
  setzeTeilHinweis('teil2sec', t.teil2Hint);
  updateProgress();
  document.getElementById('saveLaterBtn').classList.toggle('hidden', isEingangstest);
  if (!isEingangstest && !teilweiseGesperrt) {
    restoreTestProgressIfAny(testId, name);
  }
  showView('view-test');
}

// ---------------- SPEICHERN & SPÄTER FORTSETZEN (für normale Tests und Abschlusstests) ----------------
function progressKeyFor(testId, name) {
  return `testprogress:${testId}:${slug(name)}`;
}

async function saveTestProgressNow(silent) {
  const t = TESTS[currentTestId];
  if (!t) return;
  const isAbschluss = t.type && t.type.startsWith('abschlusstest');
  let payload;
  if (isAbschluss) {
    const felder = {};
    document.querySelectorAll('#abschlussBody [data-key]').forEach(el => {
      if (el.value && el.value.trim()) felder[el.getAttribute('data-key')] = el.value;
    });
    payload = { kind: 'abschluss', felder, gespeichertAm: new Date().toISOString() };
  } else {
    // Teil3 zusätzlich direkt aus den Textfeldern sichern — die KI-Bewertung läuft asynchron im Hintergrund
    // und ist beim Klick auf "Speichern" möglicherweise noch nicht fertig; testState allein wäre dann unvollständig.
    const teil3Rohtext = {};
    document.querySelectorAll('#teil3items .item').forEach((itemEl, i) => {
      const ta = itemEl.querySelector('.satz-input');
      const item = (TESTS[currentTestId].teil3 || [])[i];
      if (ta && item && ta.value.trim()) teil3Rohtext[item.num] = ta.value.trim();
    });
    payload = { kind: 'normal', testState: JSON.parse(JSON.stringify(testState)), teil3Rohtext, gespeichertAm: new Date().toISOString() };
  }
  try {
    await window.storage.set(progressKeyFor(currentTestId, currentStudentName), JSON.stringify(payload), true);
    return true;
  } catch (e) {
    return false;
  }
}

async function restoreTestProgressIfAny(testId, name) {
  let res;
  try {
    res = await window.storage.get(progressKeyFor(testId, name), true);
  } catch (e) { return; }
  if (!res || !res.value) return;
  let payload;
  try { payload = JSON.parse(res.value); } catch (e) { return; }

  const t = TESTS[testId];
  const noticeEl = document.getElementById('progressRestoredNotice');

  if (payload.kind === 'abschluss') {
    Object.entries(payload.felder || {}).forEach(([key, val]) => {
      const el = document.querySelector(`#abschlussBody [data-key="${CSS.escape(key)}"]`);
      if (el) { el.value = val; el.dispatchEvent(new Event('blur')); }
    });
  } else if (payload.kind === 'normal' && payload.testState) {
    testState = payload.testState;
    // Teil1: Bild-Auswahl visuell wiederherstellen
    (t.teil1 || []).forEach((item, i) => {
      const gespeichert = testState.teil1[item.num];
      if (!gespeichert) return;
      const idx = item.icons.indexOf(gespeichert.chosen);
      const itemEl = document.querySelectorAll('#teil1items .item')[i];
      if (itemEl && idx >= 0) {
        const opt = itemEl.querySelectorAll('.img-opt')[idx];
        if (opt) opt.classList.add('selected');
      }
    });
    // Teil2: MC-Auswahl visuell wiederherstellen
    (t.teil2 || []).forEach((item, i) => {
      const gespeichert = testState.teil2[item.num];
      if (!gespeichert) return;
      const itemEl = document.querySelectorAll('#teil2items .item')[i];
      if (itemEl) {
        const opt = [...itemEl.querySelectorAll('.mc-opt')].find(o => o.textContent === gespeichert.gewaehlt);
        if (opt) opt.classList.add('selected');
      }
    });
    // Teil3: Satz-Text wiederherstellen (bevorzugt aus testState, sonst aus dem gesicherten Rohtext,
    // falls die KI-Bewertung beim Speichern noch nicht abgeschlossen war)
    (t.teil3 || []).forEach((item, i) => {
      const gespeichert = testState.teil3[item.num];
      const itemEl = document.querySelectorAll('#teil3items .item')[i];
      if (!itemEl) return;
      const textarea = itemEl.querySelector('.satz-input');
      const feedback = itemEl.querySelector('.feedback');
      if (gespeichert) {
        if (textarea) textarea.value = (gespeichert.satz || '').replace(gespeichert.pronomen + ' ', '');
      } else if (payload.teil3Rohtext && payload.teil3Rohtext[item.num]) {
        // KI-Bewertung war beim Speichern noch nicht fertig — Text trotzdem wiederherstellen,
        // die Bewertung läuft beim nächsten Verlassen des Feldes erneut.
        if (textarea) textarea.value = payload.teil3Rohtext[item.num];
      }
    });
    // Teil4: Gegenteile-Eingabe wiederherstellen
    (t.teil4 || []).forEach((item, i) => {
      const gespeichert = testState.teil4[item.num];
      if (!gespeichert) return;
      const rowEl = document.querySelectorAll('#teil4items .gegenteil-row')[i];
      if (rowEl) {
        const input = rowEl.querySelector('.gegenteil-input');
        const status = rowEl.querySelector('.status');
        if (input) { input.value = gespeichert.given || ''; input.style.borderColor = 'var(--line)'; }
      }
    });
  }

  noticeEl.innerHTML = `<div class="fortschritt-geladen-hinweis">↩️ Dein bisheriger Fortschritt von ${payload.gespeichertAm ? new Date(payload.gespeichertAm).toLocaleString('de-DE') : 'deinem letzten Versuch'} wurde geladen. Mach einfach weiter!</div>`;
  updateProgress();
}

document.getElementById('saveLaterBtn').addEventListener('click', async () => {
  const btn = document.getElementById('saveLaterBtn');
  btn.disabled = true;
  btn.textContent = 'Speichere …';
  const ok = await saveTestProgressNow();
  if (ok) {
    await refreshProgress();
    showView('view-start');
  } else {
    btn.textContent = 'Fehler — nochmal versuchen';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = 'Speichern & später fortsetzen'; }, 2500);
  }
});


function buildTeil1(items, gesperrt, vorherigeDaten) {
  const sec = document.getElementById('teil1sec');
  if (!items || !items.length) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  const wrap = document.getElementById('teil1items');
  wrap.innerHTML = "";
  const letters = ["A","B","C","D"];
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    if (gesperrt) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil1[item.num] = alt || null;
      div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.word} <span class="locked-tag">bereits erledigt</span></div>`;
      wrap.appendChild(div);
      return;
    }
    div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.word}</div>`;
    const optsWrap = document.createElement('div');
    optsWrap.className = 'img-options';
    item.icons.forEach((iconName, idx) => {
      const opt = document.createElement('div');
      opt.className = 'img-opt';
      opt.innerHTML = `<img src="${iconSrc(iconName)}" alt=""><div class="letter">${letters[idx]}</div>`;
      opt.addEventListener('click', () => {
        if (testState.teil1[item.num] && testState.teil1[item.num].locked) return;
        [...optsWrap.children].forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
        const isCorrect = idx === item.correct;
        testState.teil1[item.num] = { correct: isCorrect, locked: true, word: item.word, chosen: item.icons[idx], korrektAntwort: item.icons[item.correct] };
        updateProgress();
      });
      optsWrap.appendChild(opt);
    });
    div.appendChild(optsWrap);
    wrap.appendChild(div);
  });
}

function buildTeil2(items, gesperrt, vorherigeDaten) {
  const sec = document.getElementById('teil2sec');
  if (!items || !items.length) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  const wrap = document.getElementById('teil2items');
  wrap.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    if (gesperrt) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil2[item.num] = alt || null;
      div.innerHTML = `<div class="mc-row"><span class="item-num">${item.num}.</span>${item.vor} <strong>${(alt && alt.gewaehlt) || '…'}</strong> ${item.nach} <span class="locked-tag">bereits erledigt</span></div>`;
      wrap.appendChild(div);
      return;
    }
    const row = document.createElement('div');
    row.className = 'mc-row';
    const sp = item.zusammen ? '' : ' '; // zusammen:true = ohne Leerzeichen (z. B. Ma_a)
    row.innerHTML = `<span class="item-num">${item.num}.</span><span>${item.vor}${sp}<span class="mc-blank" id="blank-${item.num}"${item.zusammen ? ' style="min-width:36px;"' : ''}>______</span>${sp}${item.nach}</span>`;
    div.appendChild(row);
    const optsWrap = document.createElement('div');
    optsWrap.className = 'mc-options';
    item.options.forEach((opt, idx) => {
      const btn = document.createElement('div');
      btn.className = 'mc-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (testState.teil2[item.num] && testState.teil2[item.num].locked) return;
        [...optsWrap.children].forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');
        const isCorrect = idx === item.correct;
        testState.teil2[item.num] = { correct: isCorrect, locked: true, gewaehlt: opt, korrektAntwort: item.options[item.correct] };
        updateProgress();
      });
      optsWrap.appendChild(btn);
    });
    div.appendChild(optsWrap);
    wrap.appendChild(div);
  });
}

function buildTeil3(items, gesperrt, vorherigeDaten) {
  const sec = document.getElementById('teil3sec');
  if (!items || !items.length) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  const wrap = document.getElementById('teil3items');
  wrap.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    if (gesperrt) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil3[item.num] = alt || null;
      div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.word} <span style="font-weight:400; color:var(--ink-soft); font-size:14px;">(${item.pronomen} …)</span> <span class="locked-tag">bereits erledigt</span></div><div style="color:var(--ink-soft); font-size:14.5px;">„${escapeHtml((alt && alt.satz) || '')}"</div>`;
      wrap.appendChild(div);
      return;
    }
    div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.word} <span style="font-weight:400; color:var(--ink-soft); font-size:14px;">(${item.pronomen} …)</span></div>`;

    const row = document.createElement('div');
    row.className = 'satz-row';
    const startSpan = document.createElement('div');
    startSpan.className = 'satz-start';
    startSpan.textContent = item.pronomen;
    const textarea = document.createElement('textarea');
    textarea.className = 'satz-input';
    textarea.rows = 1;
    textarea.placeholder = '… Satz vervollständigen';
    row.appendChild(startSpan);
    row.appendChild(textarea);
    div.appendChild(row);

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    div.appendChild(feedback);

    textarea.addEventListener('blur', async () => {
      const satzRest = textarea.value.trim();
      if (!satzRest) { testState.teil3[item.num] = undefined; updateProgress(); return; }
      const vollerSatz = `${item.pronomen} ${satzRest}`;
      if (testState.teil3[item.num] && testState.teil3[item.num].satz === vollerSatz) return; // schon geprüft
      // Bewusst KEIN sichtbares Feedback während des Vokabeltests — die KI-Bewertung läuft im
      // Hintergrund und wird nur der Lehrkraft bei der Kontrolle angezeigt, nicht dem Schüler jetzt.
      try {
        const result = await bewerteSatz(item.pronomen, item.word, vollerSatz);
        testState.teil3[item.num] = {
          checked: true, word: item.word, pronomen: item.pronomen, satz: vollerSatz,
          korrekt: !!result.korrekt, feedback: result.feedback || '', verbesserung: result.verbesserung || ''
        };
      } catch (e) {
        // Kein Feedback-Text mit der technischen Fehlermeldung speichern — verwirrt in der
        // Lehrkraft-Ansicht nur. korrekt bleibt null ("noch nicht bewertet"), die Lehrkraft markiert
        // den Satz dort manuell als richtig/falsch.
        testState.teil3[item.num] = { checked: true, word: item.word, pronomen: item.pronomen, satz: vollerSatz, korrekt: null, feedback: '', verbesserung: '' };
      }
      feedback.className = 'feedback';
      feedback.textContent = '';
      updateProgress();
    });

    wrap.appendChild(div);
  });
}

// Ruft die KI-Bewertung über das eigene Apps-Script-Backend auf (statt direkt Anthropic), weil ein
// Schlüsselloser Direktaufruf zu api.anthropic.com nur innerhalb der Claude-Artefakt-Umgebung
// funktioniert. Das Apps Script hält den echten API-Schlüssel serverseitig (Script-Eigenschaften)
// und macht den eigentlichen Anthropic-Aufruf; der Prompt selbst lebt dadurch auch nur noch dort.
async function bewerteSatz(pronomen, vokabel, satz, versuch) {
  versuch = versuch || 1;
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('HIER_DEINE') === 0) {
    throw new Error('Speicher-Backend noch nicht eingerichtet (APPS_SCRIPT_URL fehlt).');
  }
  try {
    const data = await ascAnfrage(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'bewerteSatz', pronomen, vokabel, satz }),
    });
    return { korrekt: !!data.korrekt, feedback: data.feedback || '', verbesserung: data.verbesserung || '' };
  } catch (err) {
    if (versuch < 3) {
      await new Promise(r => setTimeout(r, 700 * versuch));
      return bewerteSatz(pronomen, vokabel, satz, versuch + 1);
    }
    throw err;
  }
}

function buildTeil4(items, labelOverride, hintOverride, gesperrt, vorherigeDaten, ohneWortbank) {
  const sec = document.getElementById('teil4sec');
  if (!items || !items.length) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  const h2 = sec.querySelector('h2');
  const hintP = sec.querySelector('p.hint');
  if (h2) h2.textContent = 'Teil 4 — ' + (labelOverride || 'Gegenteile');
  if (hintP) hintP.textContent = hintOverride || 'Schreibe das Gegenteil in die Lücke.';
  const words = items.map(i => i.correct);
  document.getElementById('teil4wordbank').textContent = ohneWortbank ? '' : words.slice().sort(() => 0.5 - Math.random()).join("  •  ");
  const wrap = document.getElementById('teil4items');
  wrap.innerHTML = "";
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'gegenteil-row';
    if (gesperrt) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil4[item.num] = alt || null;
      row.innerHTML = `<span class="item-num">${item.num}.</span>${item.bild ? `<img class="teil4-bild" src="${iconSrc(item.bild)}" alt="">` : `<span class="word">${item.word}</span>`}<span class="arrow">→</span><span style="color:var(--ink-soft);">${escapeHtml((alt && alt.given) || '')}</span><span class="locked-tag">bereits erledigt</span>`;
      wrap.appendChild(row);
      return;
    }
    row.innerHTML = `<span class="item-num">${item.num}.</span>${item.bild ? `<img class="teil4-bild" src="${iconSrc(item.bild)}" alt="">` : `<span class="word">${item.word}</span>`}<span class="arrow">→</span>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gegenteil-input';
    const status = document.createElement('span');
    status.className = 'status';
    row.appendChild(input);
    row.appendChild(status);

    function check() {
      const val = normalize(input.value);
      if (!val) { status.textContent = ''; input.style.borderColor = 'var(--line)'; testState.teil4[item.num] = undefined; updateProgress(); return; }
      // exakt:true = Groß-/Kleinschreibung und ß zählen (Schreibaufgaben in den A1-Tests)
      const korrekt = item.exakt ? input.value.trim() === item.correct : val === normalize(item.correct);
      // Bewusst KEIN sichtbares Feedback (kein Häkchen, keine Farbe) während des Vokabeltests —
      // der Rand bleibt neutral, damit nichts auf richtig/falsch hindeutet.
      status.textContent = '';
      input.style.borderColor = 'var(--line)';
      testState.teil4[item.num] = { korrekt, checked: true, word: item.word, given: input.value.trim(), korrektAntwort: item.correct };
      updateProgress();
    }
    input.addEventListener('blur', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { check(); input.blur(); } });
    wrap.appendChild(row);
  });
}

function updateProgress() {
  const t = TESTS[currentTestId];
  if (!t) return;

  if (istAbschlusstest(t)) {
    document.getElementById('progressText').textContent = `${abschlussState.felderBeantwortet} von ${abschlussState.felderGesamt} Feldern ausgefüllt`;
    document.getElementById('progressFill').style.width = (abschlussState.felderGesamt ? abschlussState.felderBeantwortet / abschlussState.felderGesamt * 100 : 0) + '%';
    document.getElementById('progressScore').textContent = '';
    autosaveTestProgressDebounced();
    return;
  }
  if (t.type === 'eingangstest') return;

  const totalItems = t.teil1.length + t.teil2.length + t.teil3.length + t.teil4.length;
  let done = 0, correct = 0;
  Object.values(testState.teil1).forEach(v => { if (v && v.locked) { done++; if (v.correct) correct++; } });
  Object.values(testState.teil2).forEach(v => { if (v && v.locked) { done++; if (v.correct) correct++; } });
  Object.values(testState.teil3).forEach(v => { if (v && v.checked) { done++; } });
  Object.values(testState.teil4).forEach(v => { if (v && v.checked) { done++; if (v.korrekt) correct++; } });

  document.getElementById('progressText').textContent = `${done} von ${totalItems} bearbeitet`;
  document.getElementById('progressFill').style.width = (done / totalItems * 100) + '%';
  document.getElementById('progressScore').textContent = '';
  autosaveTestProgressDebounced();
}

// Automatisches Speichern im Hintergrund nach jeder Antwort — schützt auch, wenn ein Schüler
// den Test einfach zumacht/verlässt, ohne aktiv auf "Speichern & später fortsetzen" zu klicken.
// Läuft leicht verzögert (nicht bei jedem einzelnen Tastendruck), um den Speicher nicht zu überlasten.
let autosaveTimer = null;
function autosaveTestProgressDebounced() {
  if (!currentTestId || !currentStudentName) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => { saveTestProgressNow(true); }, 1200);
}

// ---------------- EINGANGSTEST A1 (mehrstufig, pro Bereich mit Wiederholung) ----------------
let eingangsState = null;

function shuffleArr(arr) { return arr.slice().sort(() => 0.5 - Math.random()); }

function ziehRunde(pool, anzahl) {
  const shuffled = shuffleArr(pool);
  const out = [];
  for (let i = 0; i < anzahl; i++) out.push(shuffled[i % shuffled.length]);
  return out;
}

function buildEingangstest(t) {
  const mount = document.getElementById('abschlussBody');
  const name = document.getElementById('startName') ? document.getElementById('startName').value.trim() : currentActivityName;
  const progressKey = `eingangstest_progress:${slug(name)}`;

  const brauchtNeuenState = !eingangsState || eingangsState.testId !== 'eingangstest_a1' || eingangsState.name !== name;

  if (brauchtNeuenState) {
    mount.innerHTML = `<p class="hint">Lade deinen bisherigen Fortschritt …</p>`;
    (async () => {
      let gespeichert = null;
      try {
        const res = await window.storage.get(progressKey, true);
        if (res && res.value) gespeichert = JSON.parse(res.value);
      } catch (e) { /* kein gespeicherter Fortschritt vorhanden */ }

      if (gespeichert && gespeichert.bereichIndex < t.bereiche.length) {
        eingangsState = { testId: 'eingangstest_a1', name, bereichIndex: gespeichert.bereichIndex, ergebnisse: gespeichert.ergebnisse, runde: null };
      } else {
        eingangsState = { testId: 'eingangstest_a1', name, bereichIndex: 0, ergebnisse: t.bereiche.map(() => null), runde: null };
      }
      neueRunde();
    })();
    return;
  }

  function neueRunde() {
    const bereich = t.bereiche[eingangsState.bereichIndex];
    eingangsState.runde = ziehRunde(bereich.pool, t.fragenProRunde);
    render();
  }
  if (!eingangsState.runde) neueRunde();

  function render() {
    const alleFertig = eingangsState.bereichIndex >= t.bereiche.length;

    let html = `<div class="bereich-tabs">`;
    t.bereiche.forEach((b, i) => {
      let cls = 'bereich-tab';
      if (eingangsState.ergebnisse[i] !== null) cls += ' bestanden';
      else if (i === eingangsState.bereichIndex) cls += ' aktuell';
      html += `<div class="${cls}">${eingangsState.ergebnisse[i] !== null ? '✓ ' : ''}${b.name}</div>`;
    });
    html += `</div>`;

    if (alleFertig) {
      html += `<div class="et-ergebnis-box bestanden">
        <div style="font-size:40px;">✓</div>
        <h2 style="font-family:Georgia,serif; margin:8px 0;">Geschafft!</h2>
        <p style="color:var(--ink-soft);">Danke, du hast alle 5 Bereiche bearbeitet. Deine Lehrkraft schaut sich das an und bespricht es mit dir.</p>
      </div>`;
      mount.innerHTML = html;

      const name = document.getElementById('startName') ? document.getElementById('startName').value.trim() : currentActivityName;
      if (name) {
        const bereichsErgebnisse = t.bereiche.map((b, i) => ({
          name: b.name,
          richtig: eingangsState.ergebnisse[i].richtig,
          gesamt: eingangsState.ergebnisse[i].gesamt,
          prozent: eingangsState.ergebnisse[i].prozent,
          bestanden: eingangsState.ergebnisse[i].prozent >= t.schwelle,
          details: eingangsState.ergebnisse[i].details,
        }));
        try {
          const eingangsSubmission = {
            name, testId: 'eingangstest_a1', testTitle: t.title, timestamp: new Date().toISOString(),
            autoCorrect: bereichsErgebnisse.filter(b => b.bestanden).length, autoTotal: t.bereiche.length,
            isPunkteTest: false, teil3: [], bereichsErgebnisse,
          };
          window.storage.set(`submission:eingangstest_a1:${slug(name)}:${Date.now()}`, JSON.stringify(eingangsSubmission), true).catch(() => {});
          window.storage.delete(progressKey, true).catch(() => {});
        } catch (e) { /* Speicher nicht verfügbar */ }
      }
      return;
    }

    const bereich = t.bereiche[eingangsState.bereichIndex];
    html += `<h2 style="font-family:Georgia,serif; font-size:19px; color:var(--teal-dark); margin-bottom:4px;">${bereich.name}</h2>
    <p class="hint">Beantworte alle Fragen so gut du kannst und klicke dann auf „Abgeben“. Es gibt kein Feedback während des Tests — deine Lehrkraft bespricht die Ergebnisse später mit dir.</p>`;

    eingangsState.runde.forEach((f, i) => {
      html += `<div class="et-frage" data-idx="${i}">`;
      html += `<div class="et-prompt">${i+1}. ${f.prompt}</div>`;
      if (f.type === 'clock') {
        html += renderClockSVG(f.hour, f.minute, 130);
        html += `<input type="text" class="text-input et-input" data-idx="${i}" placeholder="z. B. halb sieben" style="margin-top:10px; width:100%; max-width:280px;">`;
      } else if (f.type === 'mc') {
        html += `<div class="mc-options">${f.options.map((o,oi) => `<div class="mc-opt et-mcopt" data-idx="${i}" data-oi="${oi}">${o}</div>`).join('')}</div>`;
      } else {
        html += `<input type="text" class="text-input et-input" data-idx="${i}" style="width:100%; max-width:320px;">`;
      }
      html += `</div>`;
    });

    html += `<button class="btn full" id="etAbgebenBtn" style="font-size:16px; padding:14px;">Abgeben</button>`;

    mount.innerHTML = html;

    // Multiple-Choice-Auswahl (nur Markierung, kein richtig/falsch sichtbar)
    const mcAnswers = {};
    mount.querySelectorAll('.et-mcopt').forEach(el => {
      el.addEventListener('click', () => {
        const idx = el.getAttribute('data-idx');
        mount.querySelectorAll(`.et-mcopt[data-idx="${idx}"]`).forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        mcAnswers[idx] = parseInt(el.getAttribute('data-oi'), 10);
      });
    });

    document.getElementById('etAbgebenBtn').addEventListener('click', () => {
      let richtig = 0;
      const details = [];
      eingangsState.runde.forEach((f, i) => {
        let istRichtig = false;
        let gegebeneAntwort = '';
        let moeglicherTippfehler = false;
        if (f.type === 'mc') {
          istRichtig = mcAnswers[i] === f.correct;
          gegebeneAntwort = mcAnswers[i] !== undefined ? f.options[mcAnswers[i]] : '(keine Antwort)';
        } else if (f.type === 'clock') {
          const input = mount.querySelector(`.et-input[data-idx="${i}"]`);
          gegebeneAntwort = input ? input.value.trim() : '';
          const val = normalize(gegebeneAntwort);
          const acc = f.acceptable || [normalize(f.answer)];
          istRichtig = acc.some(a => normalize(a) === val);
          if (!istRichtig) moeglicherTippfehler = istWahrscheinlichTippfehler(gegebeneAntwort, acc);
        } else {
          const input = mount.querySelector(`.et-input[data-idx="${i}"]`);
          gegebeneAntwort = input ? input.value.trim() : '';
          istRichtig = checkAcceptable(gegebeneAntwort, f.answer);
          if (!istRichtig) moeglicherTippfehler = istWahrscheinlichTippfehler(gegebeneAntwort, f.answer);
        }
        if (istRichtig) richtig++;
        details.push({
          frage: f.prompt,
          antwort: gegebeneAntwort || '(keine Antwort)',
          korrekt: f.type === 'mc' ? f.options[f.correct] : (Array.isArray(f.answer) ? f.answer.join(' / ') : f.answer),
          richtig: istRichtig,
          moeglicherTippfehler,
        });
      });
      const gesamt = eingangsState.runde.length;
      const prozent = Math.round((richtig / gesamt) * 100);
      eingangsState.ergebnisse[eingangsState.bereichIndex] = { richtig, gesamt, prozent, details };
      eingangsState.bereichIndex++;
      eingangsState.runde = null;
      try {
        window.storage.set(progressKey, JSON.stringify({
          bereichIndex: eingangsState.bereichIndex, ergebnisse: eingangsState.ergebnisse, timestamp: new Date().toISOString(),
        }), true).catch(() => {});
      } catch (e) { /* Speicher nicht verfügbar */ }
      if (eingangsState.bereichIndex < t.bereiche.length) neueRunde(); else render();
      mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  render();
}


// ---------------- SENDEN ----------------
document.getElementById('submitBtn').addEventListener('click', async () => {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Wird gesendet …';

  const t = TESTS[currentTestId];
  let submission;

  if (istAbschlusstest(t)) {
    // Einzelfelder mit sichern (nicht nur die Gesamtpunktzahl) — damit eine unvollständige Abgabe
    // später bei Bedarf trotzdem in einen fortsetzbaren Entwurf umgewandelt werden kann.
    const felderAntworten = {};
    document.querySelectorAll('#abschlussBody [data-key]').forEach(el => {
      if (el.value && el.value.trim()) felderAntworten[el.getAttribute('data-key')] = el.value;
    });

    // Detaillierte Aufschlüsselung pro Feld (Frage/Antwort/richtig-falsch) — genau wie bei den
    // normalen Vokabeltests, damit du auch bei Abschlusstests siehst, was konkret falsch war.
    const felderDetails = [];
    (abschlussState.fieldMeta || []).forEach(meta => {
      const gegebenerWert = felderAntworten[meta.key];
      if (gegebenerWert === undefined) return; // nicht beantwortet -> nicht in der Liste
      const vollerWert = (meta.stem || '') + gegebenerWert;
      const bewertung = (abschlussState.answered || {})[meta.key];
      let korrektAntwortAnzeige = meta.acceptable;
      if (Array.isArray(korrektAntwortAnzeige)) korrektAntwortAnzeige = korrektAntwortAnzeige.join(' / ');
      felderDetails.push({
        frage: meta.label || meta.key,
        antwort: vollerWert,
        korrekt: bewertung ? (bewertung.correct === null ? null : !!bewertung.correct) : null,
        korrektAntwort: korrektAntwortAnzeige,
      });
    });

    submission = {
      name: currentStudentName,
      testId: currentTestId,
      testTitle: t.title,
      timestamp: new Date().toISOString(),
      autoCorrect: Math.round(abschlussState.punkte * 10) / 10,
      autoTotal: (t.punkte_max != null ? t.punkte_max : abschlussState.punkteMax),
      isPunkteTest: true,
      teil3: [],
      felderAntworten,
      felderDetails,
    };
  } else {
    const autoTotal = t.teil1.length + t.teil2.length + t.teil4.length;
    let autoCorrect = 0;
    const teilDetails = [];
    t.teil1.forEach(item => {
      const v = testState.teil1[item.num];
      if (!v) return;
      if (v.correct) autoCorrect++;
      teilDetails.push({ frage: `Bildzuordnung: ${item.word}`, antwort: v.correct ? item.word : (v.chosen || '').replace(/_/g, ' '), korrekt: v.correct, korrektAntwort: item.word });
    });
    t.teil2.forEach(item => {
      const v = testState.teil2[item.num];
      if (!v) return;
      if (v.correct) autoCorrect++;
      teilDetails.push({ frage: `${item.vor} ___ ${item.nach}`, antwort: v.gewaehlt || '', korrekt: v.correct, korrektAntwort: v.korrektAntwort });
    });
    t.teil4.forEach(item => {
      const v = testState.teil4[item.num];
      if (!v) return;
      if (v.korrekt) autoCorrect++;
      teilDetails.push({ frage: t.teil4Frage ? t.teil4Frage.replace('{word}', item.label || item.word) : `Gegenteil von „${item.word}"`, antwort: v.given || '', korrekt: v.korrekt, korrektAntwort: v.korrektAntwort });
    });
    const teil3List = Object.values(testState.teil3).filter(Boolean);
    submission = {
      name: currentStudentName,
      testId: currentTestId,
      testTitle: t.title,
      timestamp: new Date().toISOString(),
      autoCorrect, autoTotal,
      teil3: teil3List,
      teilDetails,
      // Rohdaten pro Teil, damit eine spätere Wiederholung mit nur ausgewählten Teilen den Rest
      // aus dieser Einreichung vorausfüllen kann (Lehreransicht: "welche Bereiche nochmal machen").
      raState: { teil1: testState.teil1, teil2: testState.teil2, teil3: testState.teil3, teil4: testState.teil4 },
    };
  }

  try {
    const key = `submission:${currentTestId}:${slug(currentStudentName)}:${Date.now()}`;
    // Mit Wiederholversuchen speichern — bei gleichzeitiger Nutzung durch viele Schüler:innen kann
    // ein einzelner Speicherversuch am gemeinsamen Ratenlimit scheitern ("Message rate limit exceeded").
    await speichereMitRetry(key, JSON.stringify(submission), true);
    await speichereMitRetry(`status:${currentTestId}:${slug(currentStudentName)}`, JSON.stringify({ status: 'offen' }), true);
    try { await window.storage.delete(progressKeyFor(currentTestId, currentStudentName), true); } catch (e) { /* unkritisch */ }
    document.getElementById('doneName').textContent = currentStudentName;
    showView('view-done');
  } catch (e) {
    console.error('Speichern fehlgeschlagen', e);
    alert('Der Test konnte nicht gespeichert werden (' + (e && e.message ? e.message : 'Speicherfehler') + '). Bitte kurz warten und nochmal auf „Test abschicken" tippen — deine Antworten sind noch da.');
  }
  btn.disabled = false;
  btn.textContent = 'Test abschicken';
});

// ---------------- ÜBUNG: MEMORY (Paare finden) ----------------
// Daten: { type:'memory', title, sub, hinweis?, anzahl?, pairs: [[A, B], ...] }
// A und B sind Text ODER { bild: "Bildname" } (Original-Bild aus ICONS). Bei jedem Start werden `anzahl` zufällige
// Paare gezogen (Standard 8).
function buildMemory(a) {
  const body = document.getElementById('actBody');
  const anzahl = Math.min(a.anzahl || 8, a.pairs.length);
  let karten, offen, gesperrt, zuege, gefunden;

  function mischen(arr) { return arr.slice().sort(() => 0.5 - Math.random()); }
  function inhalt(x) { return (x && typeof x === 'object' && x.bild) ? `<img src="${iconSrc(x.bild)}" alt="" style="max-width:100%; max-height:84px;">` : escapeHtml(x); }
  function neuesSpiel() {
    const gezogen = mischen(a.pairs).slice(0, anzahl);
    karten = [];
    gezogen.forEach((p, i) => { karten.push({ paar: i, inhalt: p[0] }); karten.push({ paar: i, inhalt: p[1] }); });
    karten = mischen(karten).map((k, id) => ({ ...k, id, status: 'verdeckt' }));
    offen = []; gesperrt = false; zuege = 0; gefunden = 0;
    render();
  }
  function render() {
    const fertig = gefunden === anzahl;
    if (fertig) markActivityDone(currentActivityId);
    let html = `<p class="hint">${escapeHtml(a.hinweis || 'Decke zwei Karten auf. Finde alle Paare!')}</p>
      <div class="quiz-stapel-info"><span>Gefunden: ${gefunden} von ${anzahl}</span><span>Züge: ${zuege}</span></div>`;
    if (fertig) {
      html += `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Alle Paare gefunden!</h2><p style="color:var(--ink-soft);">Du hast ${zuege} Züge gebraucht.</p><button class="btn" id="memNeu">Nochmal spielen</button></div>`;
      body.innerHTML = html;
      document.getElementById('memNeu').addEventListener('click', neuesSpiel);
      return;
    }
    html += `<div class="memory-grid">` + karten.map(k => `<div class="memory-card ${k.status}" data-id="${k.id}">${k.status === 'verdeckt' ? '?' : inhalt(k.inhalt)}</div>`).join('') + `</div>`;
    body.innerHTML = html;
    body.querySelectorAll('.memory-card').forEach(el => el.addEventListener('click', () => klick(parseInt(el.getAttribute('data-id'), 10))));
  }
  function klick(id) {
    const k = karten[id];
    if (gesperrt || k.status !== 'verdeckt') return;
    k.status = 'offen'; offen.push(k);
    if (offen.length === 2) {
      zuege++;
      if (offen[0].paar === offen[1].paar) {
        offen.forEach(x => x.status = 'gefunden'); gefunden++; offen = [];
      } else {
        gesperrt = true;
        render();
        setTimeout(() => { offen.forEach(x => x.status = 'verdeckt'); offen = []; gesperrt = false; render(); }, 1000);
        return;
      }
    }
    render();
  }
  neuesSpiel();
}

// ---------------- ÜBUNG: WÖRTER LEGEN (Buchstaben-Bilder in die richtige Reihenfolge tippen) ----------------
// Daten: { type:'wortbauen', title, sub, hinweis?, woerter: ["Mama", "Nase", ...] }
// Das Wort steht oben als Vorlage. Die Buchstaben sind die ORIGINAL-Buchstabenbilder (Bildnamen "Groß_M" / "klein_a").
// Gibt es zu einem Zeichen kein Bild, erscheint es als Text.
function buildWortbauen(a) {
  const body = document.getElementById('actBody');
  let reihe, pos, erstVersuch, gewonnen, gewaehlt, meldung, tiles, hatFehler;

  function mischen(arr) { return arr.slice().sort(() => 0.5 - Math.random()); }
  function bildName(ch) { return (ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? 'Groß_' : 'klein_') + ch; }
  function tileInhalt(ch) { const n = bildName(ch); return ICONS[n] ? `<img src="${iconSrc(n)}" alt="${escapeHtml(ch)}" style="max-height:40px; max-width:44px;">` : escapeHtml(ch); }
  function neuesSpiel() { reihe = mischen(a.woerter); pos = 0; erstVersuch = 0; gewonnen = false; startWort(); }
  function startWort() {
    const w = reihe[pos], buchstaben = Array.from(w);
    let m = mischen(buchstaben.map((ch, i) => ({ ch, i, benutzt: false })));
    for (let n = 0; n < 5 && m.map(x => x.ch).join('') === w && new Set(buchstaben).size > 1; n++) m = mischen(m);
    tiles = m; gewaehlt = []; meldung = ''; hatFehler = false; render();
  }
  function render() {
    if (gewonnen) {
      markActivityDone(currentActivityId);
      body.innerHTML = `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Geschafft!</h2><p style="color:var(--ink-soft);">${erstVersuch} von ${reihe.length} Wörtern gleich beim ersten Mal richtig.</p><button class="btn" id="wbNeu">Nochmal spielen</button></div>`;
      document.getElementById('wbNeu').addEventListener('click', neuesSpiel);
      return;
    }
    const wort = reihe[pos], laenge = Array.from(wort).length, ok = meldung.startsWith('✓');
    body.innerHTML = `<p class="hint">${escapeHtml(a.hinweis || 'Lege das Wort. Tippe die Buchstaben in der richtigen Reihenfolge.')}</p>
      <div class="quiz-stapel-info"><span>Wort ${pos + 1} von ${reihe.length}</span><span>Richtig beim 1. Mal: ${erstVersuch}</span></div>
      <div class="wb-vorlage">${escapeHtml(wort)}</div>
      <div class="wb-antwort">${Array.from({ length: laenge }, (_, i) => `<span class="wb-slot">${gewaehlt[i] ? tileInhalt(gewaehlt[i].ch) : ''}</span>`).join('')}</div>
      <div class="wb-tiles">${tiles.map((t, i) => `<button class="wb-tile ${t.benutzt ? 'benutzt' : ''}" data-i="${i}" data-ch="${escapeHtml(t.ch)}">${tileInhalt(t.ch)}</button>`).join('')}</div>
      <div style="text-align:center; margin-top:14px; min-height:26px; font-weight:600; color:${ok ? 'var(--good)' : 'var(--bad)'};">${escapeHtml(meldung)}</div>
      <div style="text-align:center; margin-top:8px;"><button class="btn secondary small" id="wbZurueck">← Zurück</button> ${ok ? '<button class="btn small" id="wbWeiter">Weiter →</button>' : ''}</div>`;
    body.querySelectorAll('.wb-tile').forEach(b => b.addEventListener('click', () => tippe(parseInt(b.getAttribute('data-i'), 10))));
    document.getElementById('wbZurueck').addEventListener('click', zurueck);
    const w = document.getElementById('wbWeiter'); if (w) w.addEventListener('click', weiter);
  }
  function tippe(i) {
    const t = tiles[i];
    if (t.benutzt || meldung.startsWith('✓')) return;
    t.benutzt = true; gewaehlt.push(t); meldung = '';
    const soll = reihe[pos];
    if (gewaehlt.length === Array.from(soll).length) {
      if (gewaehlt.map(x => x.ch).join('') === soll) { meldung = '✓ Richtig!'; if (!hatFehler) erstVersuch++; }
      else { hatFehler = true; meldung = 'Nicht ganz — versuch es nochmal.'; setTimeout(() => { tiles.forEach(x => x.benutzt = false); gewaehlt = []; meldung = ''; render(); }, 1100); }
    }
    render();
  }
  function zurueck() { if (meldung.startsWith('✓')) return; const t = gewaehlt.pop(); if (t) t.benutzt = false; meldung = ''; render(); }
  function weiter() { if (pos + 1 >= reihe.length) { gewonnen = true; render(); } else { pos++; startWort(); } }
  neuesSpiel();
}
