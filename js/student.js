/* ==========================================================================
   student.js — Schüler-Seite (index.html): Startseite, Tests, Übungen, Spiele, Absenden.
   Geteilte Teile: shared.js, data/*.js, tests-common.js. Lehrkraft-Ansicht: lehrkraft.html + teacher.js.
   ========================================================================== */

// Die Namensliste kommt nach der Anmeldung vom Backend — siehe starteZugang() am Ende dieser Datei.

// Die Abschlusstest-Bausteine (tests-common.js) rufen updateProgress() auf — hier die echte Fortschrittsanzeige.
let currentTestId = null;
let currentStudentName = "";
let testState = {};

// ---------------- VIEW SWITCHING ----------------
// Jeder Ansichtswechsel wird in die Browser-History eingetragen. Dadurch geht "Zurück" — der Link im Tool genauso wie
// die Zurück-Taste oder -Geste des Geräts — genau einen Schritt zurück (z. B. vom Wiederholen zum Ergebnis) statt
// immer zur Startseite bzw. ganz aus dem Tool heraus.
const SITZUNG = String(Date.now()); // nach einem Neuladen sind alte History-Einträge (Test-Ansicht ohne Inhalt) ungültig
let aktuelleView = 'view-start';
const ungueltigeViews = new Set();  // Ansichten, in die man nicht zurückspringen soll (z. B. der gerade abgegebene Test)
function zeigeViewNur(id) {
  ['view-start','view-test','view-done','view-activity','view-ergebnis'].forEach(v => {
    document.getElementById(v).classList.toggle('hidden', v !== id);
  });
  aktuelleView = id;
  window.scrollTo(0,0);
}
function showView(id, opt) {
  if (id !== aktuelleView) {
    try {
      if (opt && opt.ersetzen) history.replaceState({ view: id, sitzung: SITZUNG }, '');
      else history.pushState({ view: id, sitzung: SITZUNG }, '');
    } catch (e) { /* History nicht verfügbar — Ansicht wechselt trotzdem */ }
  }
  ungueltigeViews.delete(id);
  zeigeViewNur(id);
}
try { history.replaceState({ view: 'view-start', sitzung: SITZUNG }, ''); } catch (e) { /* egal */ }
window.addEventListener('popstate', (ev) => {
  const st = ev.state;
  const ok = st && st.sitzung === SITZUNG && st.view !== 'view-done' && !ungueltigeViews.has(st.view);
  const ziel = ok ? st.view : 'view-start';
  if (aktuelleView === 'view-test') autosaveFallsGeplant();
  if (ziel === 'view-start') refreshProgress();
  zeigeViewNur(ziel);
});
function geheZurueck() {
  const st = history.state;
  if (st && st.sitzung === SITZUNG && st.view === aktuelleView && aktuelleView !== 'view-start') history.back();
  else { refreshProgress(); zeigeViewNur('view-start'); }
}
// Nach einer Abgabe: weder in den abgegebenen Test noch in das alte Ergebnis zurückspringen.
function nachAbgabe() {
  ungueltigeViews.add('view-test'); ungueltigeViews.add('view-activity'); ungueltigeViews.add('view-ergebnis');
  // Fortschritts-Cache sofort nachziehen: Der Test gilt jetzt als abgegeben, sein alter Status (z. B. "wiederholen") ist überholt.
  const id = aktuelleView === 'view-activity' ? currentActivityId : currentTestId;
  if (id && progressCache.doneTests) { progressCache.doneTests.add(id); if (progressCache.statusInfo) delete progressCache.statusInfo[id]; }
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
  const statusInfo = {}; // testId -> komplettes Status-Objekt (u. a. reviewKey für "Ergebnis ansehen")
  const statusReviewedAt = {}; // testId -> Zeitstempel (Zahl) der letzten Lehrkraft-Bewertung
  const pausierteTests = new Set(); // testIds mit einem pausierten Entwurf (testprogress:)

  // Die vier unabhängigen Abfragen GLEICHZEITIG starten statt nacheinander — das ist der
  // entscheidende Geschwindigkeitsgewinn, weil jeder Aufruf ans Apps-Script-Backend spürbare
  // eigene Latenz hat.
  // ZWEI Anfragen statt vier: listBySuffix(":<schüler>") liefert samt Wert alles, was auf den Schüler endet — neben
  // status:/testprogress: auch activitydone:<id>:<schüler> und manualaccess:<schüler>. Jede Anfrage ans Apps Script
  // kostet 2–3 s (unter Last deutlich mehr), und alle Schüler:innen teilen sich dasselbe Backend.
  const [subRes, statusRes] = await ladeSchuelerStand(sl);
  let actRes, maRes;
  if (statusRes.status === 'fulfilled') {
    const eigene = (statusRes.value && statusRes.value.items) || [];
    const ma = eigene.find(x => x.key === `manualaccess:${sl}`);
    actRes = { status: 'fulfilled', value: { keys: eigene.map(x => x.key).filter(k => k.indexOf('activitydone:') === 0) } };
    maRes = { status: 'fulfilled', value: { value: ma ? ma.value : null } };
  } else { // Sammelabfrage gescheitert -> alter Weg mit Einzelabfragen
    [actRes, maRes] = await Promise.allSettled([window.storage.list('activitydone:', true), window.storage.get(`manualaccess:${sl}`, true)]);
  }

  const letzteAbgabeAm = {}; // testId -> Zeitstempel (Zahl) der neuesten Abgabe dieses Schülers
  if (subRes.status === 'fulfilled') {
    (subRes.value && subRes.value.keys ? subRes.value.keys : []).forEach(k => {
      const parts = k.split(':');
      if (parts.length < 3 || parts[2] !== sl) return;
      if (k.endsWith('_manuell')) return;
      doneTests.add(parts[1]);
      const ts = Number(parts[3]);
      if (!Number.isNaN(ts) && (!letzteAbgabeAm[parts[1]] || ts > letzteAbgabeAm[parts[1]])) letzteAbgabeAm[parts[1]] = ts;
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
          statusInfo[parts[1]] = obj;
          if (obj.reviewedAt) statusReviewedAt[parts[1]] = Date.parse(obj.reviewedAt) || 0;
        } catch (e) { /* skip */ }
      } else if (parts[0] === 'testprogress' && parts.length >= 3 && parts[2] === sl && value) {
        pausierteTests.add(parts[1]);
      }
    });
  }

  // Falls inzwischen eine neuere Anfrage (z.B. durch weiteres Tippen) gestartet wurde: dieses veraltete Ergebnis verwerfen
  // Arbeitsblätter zählen erst als erledigt, wenn die Lehrkraft „Heft ok“ gesetzt hat (oder das Blatt noch auf Papier
  // gemacht wurde: der Test zu diesem Schritt ist schon abgegeben)
  CURRICULUM.forEach(lf => lf.items.forEach(id => { if (istArbeitsblatt(id) && blattZustand(id, statusInfo[id], doneTests) === 'erledigt') doneTests.add(id); }));
  // Abgaben, die noch im Postausgang auf Internet warten, zählen hier schon als abgegeben (sonst würde der Test wieder angeboten)
  postausgangIds(sl).forEach(id => { if (!istArbeitsblatt(id)) doneTests.add(id); });

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
  function isDoneLocal(id, kind) {
    if (kind === 'activity') return doneActs.has(id);
    if (!doneTests.has(id)) return false;
    const ab = ablaufStatus(statusInfo[id]);
    if (!KORREKTUR_SPERRT_WEITER || (ab !== 'zettel_offen' && ab !== 'wiederholung_frei')) return true;
    // "Muss wiederholt werden": zählt erst wieder als erledigt (schaltet den nächsten Schritt frei),
    // wenn seit der Bewertung neu abgegeben wurde.
    return !!(letzteAbgabeAm[id] && statusReviewedAt[id] && letzteAbgabeAm[id] > statusReviewedAt[id]);
  }

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
      if (FREIE_REIHENFOLGE.indexOf(lf.id) >= 0) { lf.items.forEach(id => unlocked.add(id)); return; }   // alle Blöcke gleichzeitig offen
      let nextFound = false;
      lf.items.forEach(id => {
        const done = isDoneLocal(id, curriculumItemInfo(id).kind);
        if (done) unlocked.add(id);
        else if (!nextFound) { unlocked.add(id); nextFound = true; }
      });
    }
    // Alle Lernfelder NACH dem aktiven bleiben komplett gesperrt (nichts hinzufügen), außer manuell freigeschaltet
  });

   progressCache = { name, doneTests, doneActs, unlocked, manualAccessUpTo, testApproval, statusComments, statusInfo, pausierteTests, loaded: true };
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
  if (kind === 'blatt') {   // Heft: offen -> „Fertig“ (Lehrkraft prüft) -> erledigt; „Noch nicht ok“ wie eine Rückgabe
    const z = blattZustand(id, (progressCache.statusInfo || {})[id], progressCache.doneTests);
    return z === 'erledigt' ? 'erledigt' : z === 'heft_zeigen' ? 'wirdgeprueft' : z === 'nochmal' ? 'zettel' : 'unerledigt';
  }
  if (kind === 'activity') {
    return progressCache.doneActs.has(id) ? 'erledigt' : 'unerledigt';
  }
  if (!progressCache.doneTests.has(id)) return 'unerledigt';
  const si = (progressCache.statusInfo || {})[id];
  if (id === 'eingangstest_a1') { // Einstufungstest: eigener Ablauf (Bereiche), unverändert
    const s = si && si.status;
    return (s === 'weiter' || s === 'endgueltig') ? 'erledigt' : s === 'wiederholen' ? 'wiederholen' : 'wirdgeprueft';
  }
  const ab = ablaufStatus(si);
  return ab === 'endgueltig' ? 'erledigt' : ab === 'wiederholung_frei' ? 'wiederholen' : ab === 'zettel_offen' ? 'zettel' : 'wirdgeprueft';
}

function renderAll() {
  renderJetztDran();
  renderProgressOverview();
  renderItemBrowser();
}

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

  const aktivLf = CURRICULUM[findAktivesLernfeldIndex()] || CURRICULUM[0];
  const zeigNiv = selectedNiveau || aktivLf.niveau;
  let html = `<div class="overview-wrap"><p class="overview-hint">Deine Lernfelder in ${zeigNiv} · zur Seite wischen →</p><div class="overview-grid">`;
  CURRICULUM.filter(lf => lf.niveau === zeigNiv).forEach(lf => {
    html += `<div class="overview-col${lf === aktivLf ? ' overview-col-aktuell' : ''}"><div class="overview-col-title">${lf.name}</div>`;
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
        else if (status === 'zettel') { cls = 'zettel'; icon = '✎'; }
        else if (status === 'wirdgeprueft') { cls = 'wirdgeprueft'; icon = '⏳'; }
        else { cls = 'unerledigt'; icon = '○'; }
      }
      const typLabel = (ACTIVITIES[id] && ACTIVITIES[id].type === 'wdhauswertung') ? 'Auswertung' : typBezeichnung(info.kind);
      const kurz = info.kind === 'test-final' ? 'Lernfeld-Test' : info.kind === 'eingangstest' ? info.title : titelMitSchritt(id, info.title);
      html += `<div class="overview-item ${cls}"><span class="icon">${icon}</span><span><span class="overview-item-title">${kurz}</span><span class="overview-item-typ">${typLabel}</span></span></div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;
  el.innerHTML = html;
  const wrap = el.querySelector('.overview-wrap'), col = el.querySelector('.overview-col-aktuell');
  if (wrap && col) wrap.scrollLeft = Math.max(0, col.offsetLeft - wrap.offsetLeft - 8);
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
    const typLabel = (info.kind === 'test' || info.kind === 'activity') ? '' : typBezeichnung(info.kind) + ':'; // bei Test/Spiel steht die Art schon im Titel

    let kommentar = '';
    if (!isActivity && status !== 'unerledigt') {
      kommentar = progressCache.statusComments[id] || '';
    }

    let hatPausiertenFortschritt = false;
    if (!isActivity && status === 'unerledigt') {
      hatPausiertenFortschritt = progressCache.pausierteTests.has(id);
    }

    const statusBadge = info.kind === 'blatt'
      ? (status === 'erledigt' ? `<span class="status-pill gruen">✓ Heft ist ok</span>` : status === 'wirdgeprueft' ? `<span class="status-pill blau">✏️ Zeig dein Heft deiner Lehrkraft</span>`
         : status === 'zettel' ? `<span class="status-pill gelb">✏️ Überarbeite dein Heft</span>` : `<span class="status-pill rot">noch offen</span>`)
      : isActivity
      ? (status === 'erledigt' ? `<span class="status-pill gruen">✓ erledigt</span>` : `<span class="status-pill rot">noch offen</span>`)
      : status === 'erledigt'
        ? `<span class="status-pill gruen">✓ Fertig! Dieser Test ist erledigt.</span>`
        : status === 'wiederholen'
          ? `<span class="status-pill gelb">Mache nur die falschen Aufgaben noch einmal.</span>`
          : status === 'zettel'
            ? `<span class="status-pill gelb">✎ Schreibe die richtigen Antworten auf dein Blatt.</span>`
            : status === 'wirdgeprueft'
              ? `<span class="status-pill blau">⏳ wird geprüft</span>`
              : hatPausiertenFortschritt
                ? `<span class="status-pill blau">⏸ pausiert</span>`
                : `<span class="status-pill rot">noch offen</span>`;

    // Knöpfe je Zustand (Ablauf Korrektur/Rückgabe): erledigt und "wird geprüft" haben keinen Knopf mehr,
    // bei der Rückgabe gibt es nur "Ergebnis ansehen", erst nach dem Haken der Lehrkraft auch "Wiederholen".
    const si = (progressCache.statusInfo || {})[id];
    const ergebnisBtnHtml = (!isActivity && si && si.reviewKey && (status === 'zettel' || status === 'wiederholen')) ? '<button type="button" class="btn small secondary ergebnis-btn" style="margin-top:8px;">Ergebnis ansehen</button>' : '';
    const hauptKnopf = info.kind === 'blatt' ? (status === 'erledigt' ? 'Ansehen' : 'Öffnen') : (ACTIVITIES[id] && ACTIVITIES[id].type === 'wdhauswertung') ? 'Ansehen' : isActivity ? (status !== 'unerledigt' ? 'Nochmal machen' : 'Üben')
      : status === 'unerledigt' ? (hatPausiertenFortschritt ? 'Fortsetzen' : 'Starten')
      : status === 'wiederholen' ? 'Wiederholen' : '';
    const card = document.createElement('div');
    card.className = 'ib-item-card';
    const sub = (isActivity || isGrammatik || info.kind === 'blatt') ? ACTIVITIES[id].sub : TESTS[id].sub;
    card.innerHTML = `
      <div class="ib-item-info">
        <div class="ib-item-typ">${typLabel}</div>
        <h3>${anzeigeTitel(id, info.title)}</h3>
        <p>${sub || ''}</p>
        ${statusBadge}
        ${kommentar ? `<div class="repeat-badge">${escapeHtml(kommentar)}</div>` : ''}
        ${ergebnisBtnHtml}
      </div>
      ${hauptKnopf ? `<button class="btn small haupt-btn ${status !== 'unerledigt' ? 'secondary' : ''}">${hauptKnopf}</button>` : ''}
    `;
    const hb = card.querySelector('.haupt-btn');
    if (hb) hb.addEventListener('click', () => {
      if (isActivity || isGrammatik || info.kind === 'blatt') openActivity(id); else startTest(id, name);
    });
    const eb = card.querySelector('.ergebnis-btn'); if (eb) eb.addEventListener('click', () => zeigeErgebnis(id, name));
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
  renderProgressOverview();   // Karte zeigt das gewählte Niveau
});
document.getElementById('lernfeldSelect').addEventListener('change', (e) => {
  selectedLernfeldIdx = parseInt(e.target.value, 10);
  renderLernfeldItems(selectedLernfeldIdx, document.getElementById('startName').value.trim());
});

document.getElementById('actBack').addEventListener('click', geheZurueck);

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
  wiederholungsRunde = false;
  currentActivityId = actId;
  currentActivityName = document.getElementById('startName').value.trim();
  document.getElementById('actTitle').textContent = anzeigeTitel(actId, a.title);
  document.getElementById('actSub').textContent = a.sub;
  setzeKopfzeile('view-activity', actId);
  showView('view-activity');
  if (!basisBilderDa()) { document.getElementById('actBody').innerHTML = '<p class="hint">Bilder werden geladen …</p>'; }
  await ladeSchrittBilder(actId);
  if (currentActivityId !== actId) return;
  if (a.type === 'domino') buildDomino(a);
  else if (a.type === 'quartett') buildQuartett(a);
  else if (a.type === 'wortarten') buildWortarten(a);
  else if (a.type === 'brettspiel') buildBrettspiel(a);
  else if (a.type === 'quizkarten') buildQuizkarten(a);
  else if (a.type === 'schlangenbauen') buildSchlangenbauen(a);
  else if (a.type === 'memory') buildMemory(a);
  else if (a.type === 'wortbauen') buildWortbauen(a);
  else if (a.type === 'dreier' || a.type === 'vierer') buildDreier(a);
  else if (a.type === 'vierseitenpuzzle') buildVierseitenpuzzle(a);
  else if (a.type === 'lesespur') buildLesespur(a);
  else if (a.type === 'wdhauswertung') zeigeWdhAuswertung(a);
  else if (a.type === 'arbeitsblatt') zeigeArbeitsblatt(a, actId);
  else if (a.type === 'grammatikblock') {
    document.getElementById('actBody').innerHTML = '<p class="hint">Lädt …</p>';
    const wiederholung = await ermittleGrammatikWiederholungsfilter(actId, currentActivityName, a);
    buildGrammatikblock(a, wiederholung);
    grammatikAutosaveStarten();
    if (!wiederholung.teilweise) restoreGrammatikProgressIfAny(actId, currentActivityName);
    else {
      lokalLoeschen(`testprogress:${actId}:${slug(currentActivityName)}`);
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
    const statusRes = await holeStatus(id, name);
    if (!statusRes || !statusRes.value) return leer;
    const statusObj = JSON.parse(statusRes.value);
    wiederholungsRunde = ablaufStatus(statusObj) === 'wiederholung_frei'; // merkt sich: diese Abgabe ist eine Wiederholung
    if (!wiederholungsRunde) return leer;
    const alleNummern = a.punkte.map(p => p.nr);

    if (statusObj.wiederholenGrammatik && typeof statusObj.wiederholenGrammatik === 'object') {
      const wg = statusObj.wiederholenGrammatik;
      const wrongCount = alleNummern.reduce((s, nr) => s + ((wg[nr] || []).length), 0);
      if (!wrongCount) return leer;
      const totalCount = a.punkte.reduce((s, p) => s + p.uebung.items.length, 0);
      if (wrongCount >= totalCount) return leer;

      const listRes2 = await window.storage.list(`submission:${id}:${slug(name)}:`, true);
      const keys2 = (listRes2 && listRes2.keys) || [];
      if (!keys2.length) return leer;
      const letzterKey2 = keys2.slice().sort().slice(-1)[0];
      const subRes2 = await window.storage.get(letzterKey2, true);
      if (!subRes2 || !subRes2.value) return leer;
      const sub2 = JSON.parse(subRes2.value);
      const raState2 = sub2.raState || {};

      const gesperrt2 = {}, daten2 = {};
      a.punkte.forEach(p => {
        const wrongIdx = new Set((wg[p.nr] || []).map(Number));
        daten2[p.nr] = raState2[p.nr] || [];
        if (!wrongIdx.size) { gesperrt2[p.nr] = true; return; }
        gesperrt2[p.nr] = new Set(p.uebung.items.map((_, ii) => ii).filter(ii => !wrongIdx.has(ii)));
      });
      return {
        gesperrt: gesperrt2, daten: daten2, teilweise: true,
        hinweis: `<p style="color:var(--warn); font-size:14px;">Deine Lehrkraft möchte, dass du nur die ${wrongCount} markierte${wrongCount === 1 ? '' : 'n'} Aufgabe${wrongCount === 1 ? '' : 'n'} wiederholst — der Rest ist schon eingetragen.</p>`,
      };
    }

    if (!Array.isArray(statusObj.punkteWiederholen) || !statusObj.punkteWiederholen.length) return leer;
    const ausgewaehlt = new Set(statusObj.punkteWiederholen);
    if (alleNummern.every(nr => ausgewaehlt.has(nr))) return leer;

    const listRes = await window.storage.list(`submission:${id}:${slug(name)}:`, true);
    const keys = (listRes && listRes.keys) || [];
    if (!keys.length) return leer;
    const letzterKey = keys.slice().sort().slice(-1)[0];
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
      hinweis: `<p style="color:var(--warn); font-size:14px;">Deine Lehrkraft möchte, dass du diesmal nur Aufgabe ${nurDiese} wiederholst — der Rest ist schon eingetragen.</p>`,
    };
  } catch (e) {
    return leer;
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

  let html = a.wiederholungB1 ? `<p class="hint">Bearbeite alle Aufgaben. Am Ende schickst du den ganzen Block auf einmal ab — deine Lehrkraft bespricht ihn danach mit dir.</p>` : `<p class="hint">Lies jede Erklärung, dann bearbeite die passende Aufgabe dazu. Am Ende schickst du den ganzen Block auf einmal ab — deine Lehrkraft bespricht ihn danach mit dir.</p>`;
  html += wiederholung.hinweis || '';

  a.punkte.forEach((p, pi) => {
    const gesperrtInfo = currentGrammatikGesperrt[p.nr];
    const gesperrtGanz = gesperrtInfo === true;
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
        <div class="grammatik-uebung-titel">✎ Aufgabe ${p.nr}${gesperrtGanz ? ' <span class="locked-tag">bereits erledigt</span>' : ''}</div>
        <p class="hint" style="margin-top:0;">${escapeHtml(p.uebung.anleitung)}</p>
    `;
    p.uebung.items.forEach((item, ii) => {
      const key = `gb-${pi}-${ii}`;
      if (istGesperrt(gesperrtInfo, ii)) {
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
            ${item.woerter ? wortkartenHtml(key, item.woerter) : item.optionen ? `<select class="text-input gb-input gb-auswahl" data-key="${key}" style="width:100%;"><option value="">– bitte wählen –</option>${item.optionen.map(o => `<option value="${escAttr(o)}">${escapeHtml(o)}</option>`).join('')}</select>` : `<input type="text" class="text-input gb-input" data-key="${key}" style="width:100%;">`}
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
  const payload = baueGrammatikEntwurf();
  lokalSichern(`testprogress:${currentActivityId}:${slug(currentActivityName)}`, payload);
  try {
    await window.storage.set(`testprogress:${currentActivityId}:${slug(currentActivityName)}`, JSON.stringify(payload), true);
    return true;
  } catch (e) {
    return false;
  }
}

async function restoreGrammatikProgressIfAny(id, name) {
  let res = null;
  try { res = await window.storage.get(`testprogress:${id}:${slug(name)}`, true); } catch (e) { /* kein Entwurf auf dem Server oder kein Netz */ }
  let payload = null;
  try { payload = res && res.value ? JSON.parse(res.value) : null; } catch (e) { payload = null; }
  payload = neuererEntwurf(payload, lokalLesen(`testprogress:${id}:${slug(name)}`));
  if (!payload || payload.kind !== 'grammatik' || currentActivityId !== id) return;
  Object.entries(payload.felder || {}).forEach(([key, val]) => {
    const el = document.querySelector(`#actBody .gb-input[data-key="${CSS.escape(key)}"]`);
    if (el) { el.value = val; if (el.closest && el.closest('.wo-feld')) wortkartenAusWert(el); }
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
    const gesperrtInfo = currentGrammatikGesperrt[p.nr];   // true (ganze Aufgabe) oder Menge der gesperrten Teilaufgaben
    const vorherige = currentGrammatikVorherigeDaten[p.nr] || [];
    const antworten = [];
    p.uebung.items.forEach((item, ii) => {
      if (!item.manuell) autoTotal++;
      const korrektAnzeige = Array.isArray(item.antwort) ? (item.satz ? item.antwort[0] : item.antwort.join(' / ')) : item.antwort;   // Satz: ein Lösungsvorschlag
      if (istGesperrt(gesperrtInfo, ii)) {
        // Unverändert aus der letzten Abgabe übernehmen — dieser Punkt wurde nicht neu bearbeitet
        const wert = vorherige[ii] || '';
        antworten.push(wert);
        teilDetails.push({ frage: item.frage, antwort: wert, korrekt: item.manuell ? null : true, korrektAntwort: korrektAnzeige, punktNr: p.nr, itemIdx: ii });
        if (!item.manuell) autoCorrect++;
      } else {
        const input = document.querySelector(`#actBody .gb-input[data-key="gb-${pi}-${ii}"]`);
        const wert = input ? input.value.trim() : '';
        antworten.push(wert);
        const korrektRoh = item.regel ? pruefeRegel(item, wert) : item.manuell ? (wert === '' ? false : null) : wert !== '' && mitLueckenKontext(input, wert, w => pruefeGrammatikItem(item, w));
        const korrekt = (item.satz && wert !== '' && korrektRoh === false) ? null : korrektRoh;   // Satz ohne passende Variante: Lehrkraft entscheidet
        if (korrekt) autoCorrect++;
        teilDetails.push({ frage: item.frage, antwort: wert || '(keine Antwort)', korrekt, korrektAntwort: korrektAnzeige, punktNr: p.nr, itemIdx: ii });
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
    const entwurfKey = `testprogress:${currentActivityId}:${slug(currentActivityName)}`;
    await grammatikAutosaveBeenden();
    const wie = await abgabeSichernUndSenden([{ key, value: JSON.stringify(submission) }, { key: `status:${currentActivityId}:${slug(currentActivityName)}`, value: JSON.stringify(neuerStatusNachAbgabe()) }, { key: entwurfKey, loeschen: true }], entwurfKey);
    zeigeAbgabeHinweis(wie);   // lokal geloescht wird erst nach dem Senden
    document.getElementById('doneName').textContent = currentActivityName;
    nachAbgabe(); showView('view-done', { ersetzen: true });
  } catch (e) {
    alert('Der Block konnte nicht gespeichert werden (' + (e && e.message ? e.message : 'Speicherfehler') + '). Bitte kurz warten und nochmal auf „Block abgeben" tippen — deine Antworten sind noch da.');
    btn.disabled = false;
    btn.textContent = 'Block abgeben';
  }
}

// ---------------- ÜBUNG: DOMINO-KETTE (echtes Legespiel mit 2-seitigen Steinen) ----------------
function dominoHaelfte(w) {
  return String(w).indexOf('BILD:') === 0 ? `<span class="half half-bild" data-bild="${String(w).slice(5)}"><img src="${iconSrc(String(w).slice(5))}" alt=""></span>` : `<span class="half">${w}</span>`;
}
function buildDomino(a) {
  const body = document.getElementById('actBody');
  const pairs = a.anzahl ? gemischt(a.pairs).slice(0, a.anzahl) : a.pairs; // [[wordA, wordB], ...]; anzahl: zufällige Auswahl je Spiel

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
      ${dominoHaelfte(t.a)}<span class="divider"></span>${dominoHaelfte(t.b)}
    </div>`;
  }

  function render() {
    const done = openEnd === "ZIEL";
    if (done) markActivityDone(currentActivityId);

    let boardHtml = board.map((t, i) => {
      const cls = i === 0 ? 'placed start' : 'placed';
      return `<div class="domino-piece ${cls}">${dominoHaelfte(t.a)}<span class="divider"></span>${dominoHaelfte(t.b)}</div>`;
    }).join('<span class="domino-link">→</span>');

    let html = `
      <p class="hint">Tippe einen Stein an, der mit „<strong>${done ? 'ZIEL' : openEnd}</strong>" zusammenpasst${a.passtText != null ? a.passtText : ' (Gegenteil)'}. Beide Seiten eines Steins kannst du nutzen.</p>
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
  const families = (a.anzahl ? gemischt(a.items).slice(0, a.anzahl) : a.items).map((it, fIdx) => ({
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
      <div class="quiz-stapel-info"><span>Richtige Sätze: ${gesammelt} 🐍</span></div>
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

document.getElementById('backToStart').addEventListener('click', () => { autosaveFallsGeplant(); geheZurueck(); });
document.getElementById('toStartAgain').addEventListener('click', () => { refreshProgress(); showView('view-start'); });

// ---------------- WIEDERHOLUNG NUR AUSGEWÄHLTER TEILE ----------------
// Prüft, ob die Lehrkraft bei der letzten Kontrolle nur bestimmte Teile (Bereiche) zur Wiederholung
// markiert hat. Falls ja: die übrigen Teile werden aus der letzten Einreichung vorausgefüllt und
// nicht nochmal abgefragt; nur die markierten Teile sind beim erneuten Öffnen aktiv/eingabefähig.
function istGesperrt(g, num) { return g === true || (g && typeof g.has === 'function' && g.has(num)); }
async function ermittleWiederholungsfilter(testId, name, t) {
  const leer = { gesperrt: { teil1: false, teil2: false, teil3: false, teil4: false }, daten: {}, hinweis: '' };
  try {
    const statusRes = await holeStatus(testId, name);
    if (!statusRes || !statusRes.value) return leer;
    const statusObj = JSON.parse(statusRes.value);
    wiederholungsRunde = ablaufStatus(statusObj) === 'wiederholung_frei'; // merkt sich: diese Abgabe ist eine Wiederholung
    if (!wiederholungsRunde) return leer;
    const vorhandeneTeile = ['teil1','teil2','teil3','teil4'].filter(tn => t[tn] && t[tn].length);

    // NEU (praezise): genau die Aufgaben, die als Kreuz markiert waren -- Rest wird automatisch gesperrt.
    if (statusObj.wiederholenVokabel && typeof statusObj.wiederholenVokabel === 'object') {
      const wv = alteNummernUmrechnen(testId, statusObj.wiederholenVokabel, statusObj);
      const wrongCount = vorhandeneTeile.reduce((s, tn) => s + ((wv[tn] || []).length), 0);
      if (!wrongCount) return leer;
      const totalCount = vorhandeneTeile.reduce((s, tn) => s + t[tn].length, 0);
      if (wrongCount >= totalCount) return leer;

      const listRes2 = await window.storage.list(`submission:${testId}:${slug(name)}:`, true);
      const keys2 = (listRes2 && listRes2.keys) || [];
      if (!keys2.length) return leer;
      const letzterKey2 = keys2.slice().sort().slice(-1)[0];
      const subRes2 = await window.storage.get(letzterKey2, true);
      if (!subRes2 || !subRes2.value) return leer;
      const sub2 = JSON.parse(subRes2.value);
      const raState2 = alteNummernUmrechnen(testId, sub2.raState || {}, sub2);

      const gesperrt2 = {}, daten2 = {};
      vorhandeneTeile.forEach(tn => {
        const wrongNums = new Set((wv[tn] || []).map(Number));
        daten2[tn] = raState2[tn] || {};
        // Nur sperren, was beim letzten Mal wirklich beantwortet wurde — leer gelassene Aufgaben bleiben offen
        // (sonst stehen sie leer und gesperrt als "bereits erledigt" da).
        gesperrt2[tn] = new Set(t[tn].map(i => i.num).filter(n => !wrongNums.has(n) && daten2[tn][n]));
      });
      if (!vorhandeneTeile.some(tn => gesperrt2[tn].size)) return leer; // nichts zum Sperren -> ganz normal neu machen
      return {
        gesperrt: gesperrt2, daten: daten2,
        hinweis: `<p style="color:var(--warn); font-size:14px;">Deine Lehrkraft möchte, dass du nur die ${wrongCount} markierte${wrongCount === 1 ? '' : 'n'} Aufgabe${wrongCount === 1 ? '' : 'n'} wiederholst — der Rest ist schon eingetragen.</p>`,
      };
    }

    // ALT (Bestandsschutz fuer bereits gespeicherte Bewertungen von vor diesem Update): ganze Teile
    if (!Array.isArray(statusObj.wiederholenTeile) || !statusObj.wiederholenTeile.length) return leer;
    const ausgewaehlt = new Set(statusObj.wiederholenTeile);
    if (vorhandeneTeile.every(tn => ausgewaehlt.has(tn))) return leer;

    const listRes = await window.storage.list(`submission:${testId}:${slug(name)}:`, true);
    const keys = (listRes && listRes.keys) || [];
    if (!keys.length) return leer;
    const letzterKey = keys.slice().sort().slice(-1)[0];
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
    return leer;
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
  autosaveAbbrechen(); autosaveZuletzt = 0; autosaveNutzerAktiv = false; wiederholungsRunde = false;
  currentTestId = testId;
  currentStudentName = name;
  await ladeSchrittBilder(testId);
  const t = TESTS[testId];
  document.getElementById('testTitle').textContent = anzeigeTitel(testId, t.title);
  document.getElementById('testSub').textContent = t.sub;
  setzeKopfzeile('view-test', testId);

  const isAbschluss = istAbschlusstest(t); // alle Abschlusstest-Typen (siehe ABSCHLUSS_BUILDER in tests-common.js)
  const isEingangstest = t.type === 'eingangstest';
  document.getElementById('abschlussSec').classList.toggle('hidden', !isAbschluss && !isEingangstest);
  ['teil1sec','teil2sec','teil3sec','teil4sec'].forEach(id => document.getElementById(id).classList.toggle('hidden', isAbschluss || isEingangstest));
  document.getElementById('submitBtn').classList.toggle('hidden', isEingangstest);
  document.querySelector('.progress-bar').classList.toggle('hidden', isEingangstest);
  document.getElementById('progressRestoredNotice').innerHTML = '';
  document.getElementById('repeatNotice').innerHTML = '';
  let teilweiseGesperrt = false;

  if (isAbschluss) {
    abschlussState = { punkte: 0, felderGesamt: 0, felderBeantwortet: 0 };
    ABSCHLUSS_BUILDER[t.type](t);
    teilweiseGesperrt = await wendeAbschlussWiederholungAn(t, testId, name);
  } else if (isEingangstest) {
    buildEingangstest(t);
  } else {
    testState = { teil1: {}, teil2: {}, teil3: {}, teil4: {} };
    const wiederholung = await ermittleWiederholungsfilter(testId, name, t);
    buildTeil1(t.teil1, wiederholung.gesperrt.teil1, wiederholung.daten.teil1);
    buildTeil2(t.teil2, wiederholung.gesperrt.teil2, wiederholung.daten.teil2);
    buildTeil3(t.teil3, wiederholung.gesperrt.teil3, wiederholung.daten.teil3);
    buildTeil4(t.teil4, t.teil4Label, t.teil4Hint, wiederholung.gesperrt.teil4, wiederholung.daten.teil4, !!t.teil4OhneWortbank);
    teilweiseGesperrt = !!wiederholung.hinweis;
    if (teilweiseGesperrt) zeigeWiederholungsHinweis(offeneVokabelAufgaben()); // oben im Test, nicht mehr unter dem Abschicken-Knopf
    if (teilweiseGesperrt) {
      // Bei gezielter Teil-Wiederholung KEIN altes "später fortsetzen"-Draft laden — das würde die
      // vorausgefüllten/gesperrten Teile wieder überschreiben. Ein evtl. alter Draft wird verworfen.
      lokalLoeschen(progressKeyFor(testId, name));
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
  const payload = baueTestEntwurf();
  if (!payload) return;
  const key = progressKeyFor(currentTestId, currentStudentName);
  lokalSichern(key, payload);   // auf dem Gerät: übersteht Netzabbruch und Neuladen
  try {
    await window.storage.set(key, JSON.stringify(payload), true);
    return true;
  } catch (e) {
    return false;
  }
}
function baueTestEntwurf() {
  const t = TESTS[currentTestId];
  if (!t) return null;
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
    payload = { kind: 'normal', testVersion: TESTS[currentTestId].testVersion || 1, testState: JSON.parse(JSON.stringify(testState)), teil3Rohtext, gespeichertAm: new Date().toISOString() };
  }
  return payload;
}

async function restoreTestProgressIfAny(testId, name) {
  let res = null;
  try { res = await window.storage.get(progressKeyFor(testId, name), true); } catch (e) { /* kein Entwurf auf dem Server oder kein Netz */ }
  let payload = null;
  try { payload = res && res.value ? JSON.parse(res.value) : null; } catch (e) { payload = null; }
  payload = neuererEntwurf(payload, lokalLesen(progressKeyFor(testId, name)));
  if (!payload || currentTestId !== testId) return;

  const t = TESTS[testId];
  const noticeEl = document.getElementById('progressRestoredNotice');

  if (payload.kind === 'abschluss') {
    Object.entries(payload.felder || {}).forEach(([key, val]) => {
      const el = document.querySelector(`#abschlussBody [data-key="${CSS.escape(key)}"]`);
      if (el) { el.value = val; el.dispatchEvent(new Event('blur')); }
    });
  } else if (payload.kind === 'normal' && payload.testState) {
    testState = alteNummernUmrechnen(testId, payload.testState, payload);   // Entwurf von vor einer Neunummerierung
    if (payload.teil3Rohtext) payload.teil3Rohtext = alteNummernUmrechnen(testId, { teil3: payload.teil3Rohtext }, payload).teil3;
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
    if (istGesperrt(gesperrt, item.num)) {
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
  let letztesGrossbild = null;
  items.forEach(item => {
    if (item.bildGross && item.bildGross !== letztesGrossbild) {   // großes Bild mit Nummern vor seinen Fragen
      letztesGrossbild = item.bildGross;
      wrap.insertAdjacentHTML('beforeend', `<div class="teil-grossbild">${item.bildTitel ? `<h3>${escapeHtml(item.bildTitel)}</h3>` : ''}<img src="${iconSrc(item.bildGross)}" alt=""></div>`);
    }
    const div = document.createElement('div');
    div.className = 'item';
    if (istGesperrt(gesperrt, item.num)) {
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
    if (istGesperrt(gesperrt, item.num)) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil3[item.num] = alt || null;
      div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.word} <span style="font-weight:400; color:var(--ink-soft); font-size:14px;">(${item.pronomen} …)</span> <span class="locked-tag">bereits erledigt</span></div><div style="color:var(--ink-soft); font-size:14.5px;">„${escapeHtml((alt && alt.satz) || '')}"</div>`;
      wrap.appendChild(div);
      return;
    }
    div.innerHTML = `<div class="item-label"><span class="item-num">${item.num}.</span>${item.bild ? `<img class="teil4-bild" src="${iconSrc(item.bild)}" alt="">` : ''}${item.word}${item.pronomen ? ` <span style="font-weight:400; color:var(--ink-soft); font-size:14px;">(${item.pronomen} …)</span>` : ''}</div>`;

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
      const vollerSatz = item.pronomen ? `${item.pronomen} ${satzRest}` : satzRest;
      if (testState.teil3[item.num] && testState.teil3[item.num].satz === vollerSatz) return; // schon geprüft
      // Bewusst KEIN sichtbares Feedback während des Tests. Geprüft wird nach festen Regeln (pruefeTeil3): eindeutig falsch,
      // eindeutig richtig oder unklar (null) — Unklares und jedes Urteil kann die Lehrkraft in der Bewertung ändern.
      const pr = pruefeTeil3(item, vollerSatz);
      testState.teil3[item.num] = { checked: true, word: item.word, pronomen: item.pronomen, satz: vollerSatz, korrekt: pr.korrekt, feedback: 'Automatische Prüfung: ' + pr.grund, verbesserung: '' };
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
    const data = await api({ action: 'bewerteSatz', pronomen, vokabel, satz });
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
  if (h2) h2.textContent = 'Teil 4' + (labelOverride ? ' — ' + labelOverride : '');
  if (hintP) hintP.textContent = hintOverride || '';
  const words = items.filter(i => !i.beschrifte).map(i => i.correct);   // Beschrifte-Wörter nicht verraten
  document.getElementById('teil4wordbank').textContent = ohneWortbank ? '' : words.slice().sort(() => 0.5 - Math.random()).join("  •  ");
  const wrap = document.getElementById('teil4items');
  wrap.innerHTML = "";
  let beschrifteKopf = false;
  items.forEach(item => {
    if (item.beschrifte && !beschrifteKopf && items.some(i => !i.beschrifte)) {
      beschrifteKopf = true;
      wrap.insertAdjacentHTML('beforeend', '<p class="teil4-zwischen"><b>Beschrifte das Bild.</b> Schreibe das Wort mit Artikel (der, die, das).</p>');
    }
    const row = document.createElement('div');
    row.className = 'gegenteil-row';
    if (istGesperrt(gesperrt, item.num)) {
      const alt = (vorherigeDaten || {})[item.num];
      testState.teil4[item.num] = alt || null;
      row.innerHTML = `<span class="item-num">${item.num}.</span>${item.bild ? `<img class="teil4-bild" src="${iconSrc(item.bild)}" alt="">` : `${item.bildNeben ? `<img class="teil4-bild-neben" src="${iconSrc(item.bildNeben)}" alt="">` : ''}<span class="word">${item.word}</span>`}<span class="arrow">→</span><span style="color:var(--ink-soft);">${escapeHtml((alt && alt.given) || '')}</span><span class="locked-tag">bereits erledigt</span>`;
      wrap.appendChild(row);
      return;
    }
    row.innerHTML = `<span class="item-num">${item.num}.</span>${item.bild ? `<img class="teil4-bild" src="${iconSrc(item.bild)}" alt="">` : `${item.bildNeben ? `<img class="teil4-bild-neben" src="${iconSrc(item.bildNeben)}" alt="">` : ''}<span class="word">${item.word}</span>`}<span class="arrow">→</span>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gegenteil-input';
    if (item.beschrifte) input.placeholder = 'der / die / das …';
    const status = document.createElement('span');
    status.className = 'status';
    row.appendChild(input);
    row.appendChild(status);

    function check() {
      const val = normalize(input.value);
      if (!val) { status.textContent = ''; input.style.borderColor = 'var(--line)'; testState.teil4[item.num] = undefined; updateProgress(); return; }
      // exakt:true = Groß-/Kleinschreibung und ß zählen (Schreibaufgaben in den A1-Tests)
      const korrekt = mitLueckenKontext(input, input.value, w => item.exakt ? normalizeExakt(w) === normalizeExakt(item.correct)
        : [item.correct].concat(item.akzeptiert || []).some(a => normalize(a) === normalize(w))); // akzeptiert: weitere richtige Antworten
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
  if (!testState || !testState.teil1 || !testState.teil2 || !testState.teil3 || !testState.teil4) return;

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
  if (!autosaveNutzerAktiv) return; // bloßes Öffnen eines Tests schreibt noch keinen Entwurf
  testEntwurfLokalSichern();         // sofort auf dem Gerät; ans Apps Script höchstens alle 20 s (unten)
  if (autosaveTimer) return;        // es ist schon ein Speichern geplant
  autosaveTimer = setTimeout(autosaveJetzt, Math.max(1200, AUTOSAVE_ABSTAND_MS - (Date.now() - autosaveZuletzt)));
}
// Höchstens alle AUTOSAVE_ABSTAND_MS ans Apps Script schreiben (vorher: 1,2 s nach JEDER Antwort). Bei einer ganzen
// Klasse waren das Hunderte Schreibzugriffe pro Stunde auf ein Backend, das für jede Anfrage 2–3 s braucht.
const AUTOSAVE_ABSTAND_MS = 20000;
let autosaveZuletzt = 0;
let autosaveLaufend = Promise.resolve();
let autosaveNutzerAktiv = false;
function autosaveJetzt() {
  clearTimeout(autosaveTimer); autosaveTimer = null;
  autosaveZuletzt = Date.now();
  autosaveLaufend = saveTestProgressNow(true);
  return autosaveLaufend;
}
function autosaveFallsGeplant() { if (autosaveTimer) autosaveJetzt(); }        // beim Verlassen: nichts verlieren
function autosaveAbbrechen() { clearTimeout(autosaveTimer); autosaveTimer = null; }
['click', 'input', 'change', 'keydown', 'blur'].forEach(ev => document.getElementById('view-test').addEventListener(ev, () => { autosaveNutzerAktiv = true; }, true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') autosaveFallsGeplant(); });

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
          istRichtig = mitLueckenKontext(input, gegebeneAntwort, w => checkAcceptable(w, f.answer));
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
  autosaveAbbrechen(); // sonst schreibt ein Nachzügler den Entwurf NACH der Abgabe wieder hin

  const t = TESTS[currentTestId];
  let submission;
  if (!doppelteAuswahlOk(t)) { btn.disabled = false; btn.textContent = 'Test abschicken'; return; }

  if (istAbschlusstest(t)) {
    // Einzelfelder mit sichern (nicht nur die Gesamtpunktzahl) — damit eine unvollständige Abgabe
    // später bei Bedarf trotzdem in einen fortsetzbaren Entwurf umgewandelt werden kann.
    const felderAntworten = {};
    document.querySelectorAll('#abschlussBody [data-key]').forEach(el => {
      if (el.value && el.value.trim()) felderAntworten[el.getAttribute('data-key')] = el.value;
    });

    // Detaillierte Aufschlüsselung pro Feld (Frage/Antwort/richtig-falsch) — genau wie bei den
    // normalen Vokabeltests, damit du auch bei Abschlusstests siehst, was konkret falsch war.
    const teileInfo = abschlussTeileInfo();
    const felderDetails = [];
    (abschlussState.fieldMeta || []).forEach(meta => {
      const gegebenerWert = felderAntworten[meta.key];
      if (gegebenerWert === undefined) return; // nicht beantwortet -> nicht in der Liste
      const vollerWert = stammWert(meta, gegebenerWert);
      const bewertung = (abschlussState.answered || {})[meta.key];
      let korrektAntwortAnzeige = meta.loesungText || meta.acceptable;
      if (Array.isArray(korrektAntwortAnzeige)) korrektAntwortAnzeige = korrektAntwortAnzeige.join(' / ');
      let korrekt = bewertung ? (bewertung.correct === null ? null : !!bewertung.correct) : null;
      const uebernommen = !!(abschlussState.uebernommen && abschlussState.uebernommen[meta.key] !== undefined);
      if (uebernommen) korrekt = abschlussState.uebernommen[meta.key];   // gesperrter Teil: bisherige Bewertung übernehmen
      const d = { key: meta.key, teil: teileInfo.keyTeil[meta.key] || 0, punkte: meta.points, frage: meta.label || meta.key, antwort: vollerWert, korrekt, korrektAntwort: korrektAntwortAnzeige };
      if (uebernommen) d.uebernommen = true;
      felderDetails.push(d);
    });
    const punkteGesamt = Math.round((abschlussState.fieldMeta || []).reduce((s, m) => s + m.points, 0) * 100) / 100;
    const hatUebernommene = !!(abschlussState.uebernommen && Object.keys(abschlussState.uebernommen).length);
    const punkteAuto = hatUebernommene ? felderDetails.reduce((s, d) => s + (d.korrekt === true ? d.punkte : 0), 0) : abschlussState.punkte;

    submission = {
      name: currentStudentName,
      testId: currentTestId,
      testTitle: t.title,
      timestamp: new Date().toISOString(),
      autoCorrect: Math.round(punkteAuto * 10) / 10,
      autoTotal: (t.punkte_max != null ? t.punkte_max : abschlussState.punkteMax),
      punkteGesamt,
      isPunkteTest: true,
      testVersion: t.testVersion || 1,   // Fassung des Tests (Feld-Schlüssel)
      teil3: [],
      felderAntworten,
      felderDetails,
      teileInfo: teileInfo.teile,
    };
  } else {
    const autoTotal = t.teil1.length + t.teil2.length + t.teil4.length;
    let autoCorrect = 0;
    const teilDetails = [];
    t.teil1.forEach(item => {
      const v = testState.teil1[item.num];
      if (!v) { teilDetails.push({ teil: 'teil1', num: item.num, frage: `Bildzuordnung: ${item.word}`, antwort: '(keine Antwort)', korrekt: false, korrektAntwort: item.word }); return; }
      if (v.correct) autoCorrect++;
      teilDetails.push({ teil: 'teil1', num: item.num, frage: `Bildzuordnung: ${item.word}`, antwort: v.correct ? item.word : (v.chosen || '').replace(/_/g, ' '), korrekt: v.correct, korrektAntwort: item.word });
    });
    t.teil2.forEach(item => {
      const v = testState.teil2[item.num];
      if (!v) { teilDetails.push({ teil: 'teil2', num: item.num, frage: `${item.vor} ___ ${item.nach}`, antwort: '(keine Antwort)', korrekt: false, korrektAntwort: item.options[item.correct] }); return; }
      if (v.correct) autoCorrect++;
      teilDetails.push({ teil: 'teil2', num: item.num, frage: `${item.vor} ___ ${item.nach}`, antwort: v.gewaehlt || '', korrekt: v.correct, korrektAntwort: v.korrektAntwort });
    });
    t.teil4.forEach(item => {
      const v = testState.teil4[item.num];
      if (!v) { teilDetails.push({ teil: 'teil4', num: item.num, frage: teil4FrageText(t, item), antwort: '(keine Antwort)', korrekt: false, korrektAntwort: item.correct }); return; }
      if (v.korrekt) autoCorrect++;
      teilDetails.push({ teil: 'teil4', num: item.num, frage: teil4FrageText(t, item), antwort: v.given || '', korrekt: v.korrekt, korrektAntwort: v.korrektAntwort });
    });
    // Sätze, deren KI-Bewertung beim Abschicken noch läuft, nicht verlieren: Text direkt aus dem Feld nehmen
    // (korrekt: null -> die Lehrkraft bewertet von Hand).
    t.teil3.forEach((item, i) => {
      if (testState.teil3[item.num]) return;
      const itemEl = document.querySelectorAll('#teil3items .item')[i];
      const ta = itemEl && itemEl.querySelector('.satz-input');
      if (ta && ta.value.trim()) { const vs = item.pronomen ? `${item.pronomen} ${ta.value.trim()}` : ta.value.trim(); const pr = pruefeTeil3(item, vs);
        testState.teil3[item.num] = { checked: true, word: item.word, pronomen: item.pronomen, satz: vs, korrekt: pr.korrekt, feedback: 'Automatische Prüfung: ' + pr.grund, verbesserung: '' }; }
    });
    const teil3List = t.teil3.map(item => testState.teil3[item.num]
      ? { ...testState.teil3[item.num], num: item.num }
      : { num: item.num, word: item.word, pronomen: item.pronomen, satz: '(kein Satz geschrieben)', korrekt: false, feedback: '', verbesserung: '', leer: true });
    submission = {
      name: currentStudentName,
      testId: currentTestId,
      testTitle: t.title,
      timestamp: new Date().toISOString(),
      autoCorrect, autoTotal,
      testVersion: t.testVersion || 1,   // Stand der Aufgabennummern
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
    // Abgabe + Status in EINER Anfrage (setMany) statt zwei nacheinander — halbiert die Wartezeit beim Abschicken.
    const entwurfKey = progressKeyFor(currentTestId, currentStudentName);
    await autosaveLaufend.catch(() => {});   // ein gerade laufendes Autosave darf den Entwurf nicht nach dem Löschen wieder anlegen
    const wie = await abgabeSichernUndSenden([{ key, value: JSON.stringify(submission) }, { key: `status:${currentTestId}:${slug(currentStudentName)}`, value: JSON.stringify(neuerStatusNachAbgabe()) }, { key: entwurfKey, loeschen: true }], entwurfKey);
    zeigeAbgabeHinweis(wie);   // lokal geloescht wird erst nach dem Senden
    document.getElementById('doneName').textContent = currentStudentName;
    nachAbgabe(); showView('view-done', { ersetzen: true });
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
      <div class="quiz-stapel-info"><span>Gefunden: ${gefunden} von ${anzahl}</span></div>`;
    if (fertig) {
      html += `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Alle Paare gefunden!</h2><button class="btn" id="memNeu">Nochmal spielen</button></div>`;
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

// ---------------- SPIEL: ZUSAMMENGEHÖRENDE KARTEN (3er-Gruppen "Immer 3!" und 4er-Gruppen "Vier-Seiten-Puzzle") ----------------
// Daten: { type:'dreier', title, sub, hinweis?, runde?, saetze: [[A, B, C], ...] }  (A/B/C = Text ODER { bild: "Bildname" })
// Pro Runde werden `runde` (Standard 4) zufällige Dreiergruppen gemischt. Tippe drei Karten an, die zusammengehören.
function buildDreier(a) {
  const body = document.getElementById('actBody');
  const anzahl = Math.min(a.runde || 4, a.saetze.length);
  const gr = a.saetze[0].length; // Karten pro Gruppe (3 oder 4)
  let karten, gewaehlt, gefunden, versuche, sperre;

  function mischen(arr) { return arr.slice().sort(() => 0.5 - Math.random()); }
  function inhalt(x) { return (x && typeof x === 'object' && x.bild) ? `<img src="${iconSrc(x.bild)}" alt="" style="max-width:100%; max-height:84px;">` : escapeHtml(x); }
  function neuesSpiel() {
    karten = [];
    mischen(a.saetze).slice(0, anzahl).forEach((s, i) => s.forEach(x => karten.push({ satz: i, inhalt: x })));
    karten = mischen(karten).map((k, id) => ({ ...k, id, status: 'frei' }));
    gewaehlt = []; gefunden = 0; versuche = 0; sperre = false;
    render();
  }
  function render() {
    const fertig = gefunden === anzahl;
    if (fertig) markActivityDone(currentActivityId);
    let html = `<p class="hint">${escapeHtml(a.hinweis || ('Finde immer ' + gr + ' Karten, die zusammengehören.'))}</p>
      <div class="quiz-stapel-info"><span>Gefunden: ${gefunden} von ${anzahl}</span></div>`;
    if (fertig) {
      html += `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Alle Gruppen gefunden!</h2><button class="btn" id="drNeu">Nochmal spielen</button></div>`;
      body.innerHTML = html;
      document.getElementById('drNeu').addEventListener('click', neuesSpiel);
      return;
    }
    html += `<div class="memory-grid">` + karten.map(k => `<div class="memory-card ${k.status === 'gewaehlt' ? 'offen' : k.status === 'gefunden' ? 'gefunden' : ''}" data-id="${k.id}">${inhalt(k.inhalt)}</div>`).join('') + `</div>`;
    body.innerHTML = html;
    body.querySelectorAll('.memory-card').forEach(el => el.addEventListener('click', () => klick(parseInt(el.getAttribute('data-id'), 10))));
  }
  function klick(id) {
    const k = karten[id];
    if (sperre || k.status === 'gefunden') return;
    if (k.status === 'gewaehlt') { k.status = 'frei'; gewaehlt = gewaehlt.filter(x => x !== k); render(); return; }
    k.status = 'gewaehlt'; gewaehlt.push(k);
    if (gewaehlt.length === gr) {
      versuche++;
      if (gewaehlt.every(x => x.satz === gewaehlt[0].satz)) {
        gewaehlt.forEach(x => x.status = 'gefunden'); gefunden++; gewaehlt = [];
      } else {
        sperre = true; render();
        setTimeout(() => { gewaehlt.forEach(x => x.status = 'frei'); gewaehlt = []; sperre = false; render(); }, 1000);
        return;
      }
    }
    render();
  }
  neuesSpiel();
}

// ---------------- SPIEL: LESESPURGESCHICHTE (Krimi-Lesespur, textbasiert statt mit Landkarte) ----------------
// a.knoten: { id: { text, choices:[{label,next}] } }  ODER  { id: { sackgasse:true, text, zurueck } }  ODER  { id: { text, ende:true } }
// Start ist a.start. Bei falscher Wahl: kurzer Sackgassen-Text + „Zurück“-Knopf zur letzten Station.
function buildLesespur(a) {
  const body = document.getElementById('actBody');
  let pfad, aktuell, fehlversuche;
  const karteHtml = a.karte ? `<div class="lesespur-karte-wrap"><img src="${iconSrc(a.karte)}" alt="Lesespurlandkarte" class="lesespur-karte"></div>` : '';
  function neuesSpiel() { pfad = [a.start]; aktuell = a.start; fehlversuche = 0; render(); }
  function render() {
    const k = a.knoten[aktuell];
    if (k.ende) {
      markActivityDone(currentActivityId);
      body.innerHTML = `<div class="lesespur-station"><p class="lesespur-text">${escapeHtml(k.text)}</p></div>
        <div class="domino-done"><div class="big-icon">🕵️</div><h2 style="font-family:Georgia,serif;">Fall gelöst!</h2>
        <p style="color:var(--ink-soft);">Du hast den richtigen Weg gefunden${fehlversuche ? ' — mit ' + fehlversuche + ' Umweg' + (fehlversuche === 1 ? '' : 'en') : ' ganz ohne Umweg'}.</p>
        <button type="button" class="btn full" id="lsNeu">Noch einmal spielen</button></div>`;
      document.getElementById('lsNeu').addEventListener('click', neuesSpiel);
      return;
    }
    if (k.sackgasse) {
      body.innerHTML = `<p class="hint">${escapeHtml(a.hinweis || '')}</p>
        <div class="lesespur-fortschritt">Station ${pfad.length}</div>
        ${karteHtml}
        <div class="lesespur-station lesespur-sackgasse"><p class="lesespur-text">${escapeHtml(k.text)}</p></div>
        <button type="button" class="btn full" id="lsZurueck">Noch einmal überlegen</button>`;
      document.getElementById('lsZurueck').addEventListener('click', () => { fehlversuche++; aktuell = k.zurueck; pfad.pop(); render(); });
      return;
    }
    body.innerHTML = `<p class="hint">${escapeHtml(a.hinweis || '')}</p>
      <div class="lesespur-fortschritt">Station ${pfad.length}</div>
      ${karteHtml}
      <div class="lesespur-station"><p class="lesespur-text">${escapeHtml(k.text)}</p></div>
      <p class="lesespur-frage">${escapeHtml(a.frage || 'Wohin geht die Spur? Wähle die richtige Ziffer.')}</p>
      <div class="lesespur-choices lesespur-choices-ziffer">${k.choices.map((c, i) => `<button type="button" class="lesespur-choice lesespur-choice-ziffer" data-i="${i}">${escapeHtml(c.ziffer)}</button>`).join('')}</div>`;
    body.querySelectorAll('.lesespur-choice').forEach(btn => btn.addEventListener('click', () => {
      const c = k.choices[parseInt(btn.getAttribute('data-i'), 10)];
      aktuell = c.next; pfad.push(aktuell); render();
      document.querySelector('.lesespur-karte-wrap')?.scrollIntoView({ block: 'nearest' });
    }));
  }
  neuesSpiel();
}

// ---------------- SPIEL: VIER-SEITEN-PUZZLE (Zeitformen, B1.1 Schritt 2, nach dem Original S. 25–27) ----------------
// Daten: { type:'vierseitenpuzzle', zeilen:6, spalten:4, karten:{ <verb>: {o,r,u,l: {zeit,text}}, Z: Beschriftungskarte },
//          loesung:[[verb|'Z'|'J', …], …], vorgelegtEinfach:[[zeile, spalte, karte], …] } — erzeugt aus puzzle_zeitformen.py
// Regel: Wo zwei Karten sich berühren, muss dieselbe Zeitform stehen. Karten dürfen gedreht werden. Der Joker passt überall.
// Bedienung (auch am Tablet): Karte im Vorrat antippen -> freies Feld antippen. "Drehen" dreht die gewählte Karte um 90°.
function buildVierseitenpuzzle(a) {
  const body = document.getElementById('actBody');
  const SEITEN = ['o', 'r', 'u', 'l'];
  const Z = a.zeilen, S = a.spalten;
  let stufe = 'einfach', feld, vorrat, gewaehlt, zuege;

  // Was liegt nach 'drehung' Vierteldrehungen (im Uhrzeigersinn) auf Seite pos? (wie seiten_von in puzzle_zeitformen.py)
  function seiteText(karte, drehung, pos) {
    if (karte === 'J') return { zeit: null, text: 'Joker' };
    const org = SEITEN[(SEITEN.indexOf(pos) - drehung + 4) % 4];
    return a.karten[karte][org];
  }
  function neuesSpiel(neueStufe) {
    if (neueStufe) stufe = neueStufe;
    feld = Array.from({ length: Z }, () => Array(S).fill(null));
    const anzahl = {};
    a.loesung.forEach(reihe => reihe.forEach(k => { anzahl[k] = (anzahl[k] || 0) + 1; }));
    if (stufe === 'einfach') a.vorgelegtEinfach.forEach(([z, s, k]) => { feld[z][s] = { karte: k, drehung: 0, fest: true }; anzahl[k]--; });
    vorrat = [];
    Object.keys(anzahl).forEach(k => {
      for (let i = 0; i < anzahl[k]; i++) vorrat.push({ karte: k, drehung: (k === 'Z' || k === 'J') ? 0 : Math.floor(Math.random() * 4) });
    });
    vorrat.sort(() => 0.5 - Math.random());
    gewaehlt = null; zuege = 0;
    render();
  }
  function nachbarFalsch(z, s, pos) {
    const d = { o: [-1, 0, 'u'], u: [1, 0, 'o'], l: [0, -1, 'r'], r: [0, 1, 'l'] }[pos];
    const zz = z + d[0], ss = s + d[1];
    if (zz < 0 || zz >= Z || ss < 0 || ss >= S || !feld[zz][ss]) return false;
    const ich = seiteText(feld[z][s].karte, feld[z][s].drehung, pos).zeit;
    const du = seiteText(feld[zz][ss].karte, feld[zz][ss].drehung, d[2]).zeit;
    return ich !== null && du !== null && ich !== du;
  }
  function karteHtml(k, opt) {
    opt = opt || {};
    const art = k.karte === 'Z' ? ' vsp-zeitform' : k.karte === 'J' ? ' vsp-joker' : '';
    return `<div class="vsp-karte${art}${k.fest ? ' vsp-fest' : ''}${opt.gewaehlt ? ' vsp-gewaehlt' : ''}">` +
      SEITEN.map(pos => `<span class="vsp-${pos}${opt.imFeld && nachbarFalsch(opt.z, opt.s, pos) ? ' vsp-falsch' : ''}">${escapeHtml(seiteText(k.karte, k.drehung, pos).text)}</span>`).join('') +
      `</div>`;
  }
  function stand() {
    let gelegt = 0, falsch = 0;
    for (let z = 0; z < Z; z++) for (let s = 0; s < S; s++) {
      if (!feld[z][s]) continue;
      gelegt++;
      if (nachbarFalsch(z, s, 'r')) falsch++;
      if (nachbarFalsch(z, s, 'u')) falsch++;
    }
    return { gelegt, falsch };
  }
  function render() {
    const st = stand();
    if (st.gelegt === Z * S && st.falsch === 0) {
      markActivityDone(currentActivityId);
      body.innerHTML = `<div class="domino-done"><div class="big-icon">🏆</div><h2 style="font-family:Georgia,serif;">Geschafft!</h2>
        <p style="color:var(--ink-soft);">Alle Seiten passen zusammen.</p>
        <button class="btn" id="vspNochmal">Nochmal spielen</button>
        <button class="btn secondary" id="vspStufe">${stufe === 'einfach' ? 'Jetzt die schwere Stufe' : 'Einfache Stufe'}</button></div>`;
      document.getElementById('vspNochmal').addEventListener('click', () => neuesSpiel());
      document.getElementById('vspStufe').addEventListener('click', () => neuesSpiel(stufe === 'einfach' ? 'schwer' : 'einfach'));
      return;
    }
    let h = `<p class="hint">${escapeHtml(a.hinweis || '')}</p>
      <div class="vsp-stufen">
        <button class="btn small ${stufe === 'einfach' ? '' : 'secondary'}" data-stufe="einfach">Einfach</button>
        <button class="btn small ${stufe === 'schwer' ? '' : 'secondary'}" data-stufe="schwer">Schwer</button></div>
      <div class="quiz-stapel-info"><span>Gelegt: ${st.gelegt} von ${Z * S}</span><span>${st.falsch ? `<strong style="color:var(--bad);">Passt nicht: ${st.falsch}</strong>` : 'Alles passt'}</span></div>
      <div class="vsp-feld" style="grid-template-columns:repeat(${S}, var(--vsp-gr));">`;
    for (let z = 0; z < Z; z++) for (let s = 0; s < S; s++) {
      const k = feld[z][s];
      const istGew = !!(gewaehlt && gewaehlt.ort === 'feld' && gewaehlt.z === z && gewaehlt.s === s);
      h += `<div class="vsp-zelle${k ? '' : ' vsp-leer'}" data-z="${z}" data-s="${s}">${k ? karteHtml(k, { imFeld: true, z, s, gewaehlt: istGew }) : ''}</div>`;
    }
    h += `</div>
      <div class="vsp-knoepfe">
        <button class="btn small" id="vspDrehen" ${gewaehlt ? '' : 'disabled'}>⟳ Drehen</button>
        <button class="btn small secondary" id="vspZurueck" ${gewaehlt && gewaehlt.ort === 'feld' ? '' : 'disabled'}>Karte zurück in den Vorrat</button></div>
      <p class="hint" style="margin-top:4px;">${gewaehlt ? 'Tippe ein freies Feld an, um die Karte hinzulegen.' : 'Tippe eine Karte an.'}</p>
      <div class="vsp-vorrat">` +
      vorrat.map((k, i) => `<div class="vsp-vorratplatz" data-i="${i}">${karteHtml(k, { gewaehlt: !!(gewaehlt && gewaehlt.ort === 'vorrat' && gewaehlt.i === i) })}</div>`).join('') +
      `</div>`;
    body.innerHTML = h;
    body.querySelectorAll('[data-stufe]').forEach(b => b.addEventListener('click', () => neuesSpiel(b.getAttribute('data-stufe'))));
    body.querySelectorAll('.vsp-vorratplatz').forEach(el => el.addEventListener('click', () => {
      const i = Number(el.getAttribute('data-i'));
      gewaehlt = (gewaehlt && gewaehlt.ort === 'vorrat' && gewaehlt.i === i) ? null : { ort: 'vorrat', i };
      render();
    }));
    body.querySelectorAll('.vsp-zelle').forEach(el => el.addEventListener('click', () => {
      const z = Number(el.getAttribute('data-z')), s = Number(el.getAttribute('data-s'));
      const k = feld[z][s];
      if (k) {                       // gelegte Karte auswählen (zum Drehen oder Umlegen); vorgelegte Karten bleiben liegen
        if (k.fest) return;
        gewaehlt = (gewaehlt && gewaehlt.ort === 'feld' && gewaehlt.z === z && gewaehlt.s === s) ? null : { ort: 'feld', z, s };
      } else if (gewaehlt) {         // freies Feld: gewählte Karte hinlegen
        if (gewaehlt.ort === 'vorrat') { feld[z][s] = vorrat[gewaehlt.i]; vorrat.splice(gewaehlt.i, 1); }
        else { feld[z][s] = feld[gewaehlt.z][gewaehlt.s]; feld[gewaehlt.z][gewaehlt.s] = null; }
        gewaehlt = null; zuege++;
      }
      render();
    }));
    document.getElementById('vspDrehen').addEventListener('click', () => {
      if (!gewaehlt) return;
      const k = gewaehlt.ort === 'vorrat' ? vorrat[gewaehlt.i] : feld[gewaehlt.z][gewaehlt.s];
      k.drehung = (k.drehung + 1) % 4;
      render();
    });
    document.getElementById('vspZurueck').addEventListener('click', () => {
      if (!gewaehlt || gewaehlt.ort !== 'feld') return;
      vorrat.push(feld[gewaehlt.z][gewaehlt.s]); feld[gewaehlt.z][gewaehlt.s] = null; gewaehlt = null;
      render();
    });
  }
  neuesSpiel('einfach');
}

// ---------------- ERGEBNIS ANSEHEN (nach der Bewertung durch die Lehrkraft) ----------------
// Der Schüler sieht hier erst NACH deiner Bewertung: Punkte/Note (Abschlusstests) bzw. „korrigiert“ (Vokabeltests,
// Grammatik), deinen Kommentar, seine falschen Antworten und was er auf Papier korrigieren oder wiederholen muss.
async function zeigeErgebnis(id, name) {
  const si = (progressCache.statusInfo || {})[id];
  if (!si || !si.reviewKey) return;
  const body = document.getElementById('ergBody');
  document.getElementById('ergTitel').textContent = 'Ergebnis';
  document.getElementById('ergSub').textContent = '';
  body.innerHTML = '<p>Wird geladen …</p>';
  setzeKopfzeile('view-ergebnis', id);
  showView('view-ergebnis');
  await ladeSchrittBilder(id);
  let rv;
  try { const r = await window.storage.get(si.reviewKey, true); rv = JSON.parse(r.value); }
  catch (e) { body.innerHTML = '<p>Das Ergebnis konnte gerade nicht geladen werden. Bitte später nochmal versuchen.</p>'; return; }

  document.getElementById('ergTitel').textContent = rv.titel || 'Ergebnis';
  document.getElementById('ergSub').textContent = rv.reviewedAt ? 'Bewertet am ' + new Date(rv.reviewedAt).toLocaleDateString('de-DE') : '';
  let h = '';
  if (rv.art === 'abschluss' && rv.max) {
    h += rv.note ? `<div class="erg-punkte"><div class="erg-note">Note ${escapeHtml(String(rv.note))}</div><div>${rv.punkte} von ${rv.max} Punkten · ${rv.prozent} %</div></div>`
      : !rv.max ? `<div class="erg-punkte"><div class="erg-note">bewertet</div></div>` : `<div class="erg-punkte"><div class="erg-note">${rv.punkte} von ${rv.max} Punkten</div>${(rv.teile || []).length > 1 ? rv.teile.map(x => `<div>${escapeHtml(x.titel || '')}: ${x.punkte} von ${x.max}</div>`).join('') : ''}</div>`;   // ohne Note (Modelltest)
  } else {
    h += `<div class="erg-punkte"><div class="erg-note">korrigiert</div><div>${rv.richtig} von ${rv.gesamt} richtig</div></div>`;
  }
  // Text je Zustand (Ablauf Korrektur/Rückgabe, Texte A8): Rückgabe -> nur auf Papier korrigieren; erst nach dem Haken
  // der Lehrkraft gibt es die digitale Wiederholung; danach "Fertig!".
  const ab = ablaufStatus(si);
  const hatFehler = !!((rv.fehler && rv.fehler.length) || (rv.saetze && rv.saetze.length));
  if (ab === 'zettel_offen') {
    h += `<div class="erg-box erg-schritte"><strong>Du hast Fehler gemacht.</strong> Schreibe die richtigen Antworten auf dein Blatt. Zeige dein Blatt deiner Lehrkraft.</div>`;
  } else if (ab === 'wiederholung_frei') {
    h += `<div class="erg-box erg-schritte"><strong>Mache nur diese Aufgaben noch einmal.</strong></div>`;
  } else if (ab === 'endgueltig') {
    h += `<div class="erg-box gut"><strong>Fertig! Dieser Test ist erledigt.</strong></div>`;
  } else if (!hatFehler) {
    h += `<div class="erg-box gut"><strong>Alles richtig. Gut gemacht!</strong></div>`;
  }
  if (rv.kommentar) h += `<div class="erg-kommentar"><strong>Hinweis von deiner Lehrkraft:</strong><br>${escapeHtml(rv.kommentar).replace(/\n/g, '<br>')}</div>`;
  if (rv.fehler && rv.fehler.length) {
    h += `<h3 class="erg-h">Das war falsch</h3>`;
    let letzterTeil = null;
    const grossGezeigt = new Set();   // großes Bild (z. B. Körperfigur) nur einmal
    rv.fehler.forEach(f => {
      if (f.bildGross && ICONS[f.bildGross] && !grossGezeigt.has(f.bildGross)) { grossGezeigt.add(f.bildGross); h += `<div class="lt-bild-gross-wrap"><img class="lt-bild-gross" src="${iconSrc(f.bildGross)}" alt=""></div>`; }
      if (f.teil !== letzterTeil) { h += `<div class="erg-teil">${escapeHtml(f.teil || '')}</div>`; letzterTeil = f.teil; }
      const b = bilderFuerFehler(id, f); // ohne die Bilder ist bei Bild-Aufgaben weder die Frage noch die Lösung verständlich
      h += `<div class="erg-fehler"><div>${escapeHtml(f.frage)}</div>${b.aufgabe}<div class="erg-deine">Deine Antwort: ${b.deine || `„${escapeHtml(f.antwort)}“`}</div>${(f.loesung || f.korrektAntwort) ? `<div class="erg-richtig">Richtig: ${b.richtig}„${escapeHtml(f.loesung || f.korrektAntwort)}“</div>` : ''}${f.hinweis ? `<div class="erg-hinweis">Hinweis: ${escapeHtml(f.hinweis)}</div>` : ''}</div>`;
    });
  }
  if (rv.saetze && rv.saetze.length) {
    h += `<h3 class="erg-h">Diese Sätze bitte verbessern</h3>`;
    rv.saetze.forEach(s => { h += `<div class="erg-fehler"><div>${escapeHtml(s.frage)}</div><div class="erg-deine">Dein Satz: „${escapeHtml(s.satz)}“</div>${(s.loesung || s.vorschlag) ? `<div class="erg-richtig">So heißt der Satz richtig: „${escapeHtml(s.loesung || s.vorschlag)}“</div>` : ''}${s.hinweis ? `<div class="erg-hinweis">Hinweis: ${escapeHtml(s.hinweis)}</div>` : ''}</div>`; });
  }
  if (ab === 'wiederholung_frei') {
    h += `<div style="margin-top:18px;"><button class="btn" id="ergWiederholen">Jetzt wiederholen</button></div>`;
  }
  body.innerHTML = h;
  const wb = document.getElementById('ergWiederholen');
  if (wb) wb.addEventListener('click', () => {
    const info = curriculumItemInfo(id);
    if (info.kind === 'grammatik') openActivity(id); else startTest(id, name || currentStudentName || document.getElementById('startName').value);
  });
}
document.getElementById('ergebnisBack').addEventListener('click', geheZurueck);

// Bilder zu einer falschen Aufgabe eines Vokabeltests: Teil 1 (Bildzuordnung) = gewähltes + richtiges Bild,
// Teil 4 mit Bild-Aufgabe = das Aufgabenbild. Neue Bewertungen bringen teilId+num mit; ältere werden über den
// Fragetext zugeordnet. Findet sich nichts, bleibt es beim reinen Text.
function bilderFuerFehler(id, f) {
  const out = { aufgabe: '', deine: '', richtig: '' };
  const t = TESTS[id];
  const img = n => (n && ICONS[n]) ? `<img class="erg-bild" src="${iconSrc(n)}" alt="">` : '';
  if (f.bild) { out.aufgabe = img(f.bild); return out; }          // Lernfeld-Test: Bild zur Aufgabe (seit Paket C2 in der Bewertung)
  if (!t || !Array.isArray(t.teil1)) return out;
  const frage4 = i => teil4FrageText(t, i);
  const perNum = (teil) => (f.teilId === teil && f.num != null) ? (t[teil] || []).find(i => i.num === f.num) : null;
  const i1 = perNum('teil1') || (f.teilId ? null : t.teil1.find(i => `Bildzuordnung: ${i.word}` === f.frage));
  if (i1) {
    out.richtig = img(i1.icons[i1.correct]);
    out.deine = img(i1.icons.find(n => n.replace(/_/g, ' ') === f.antwort));
    return out;
  }
  const i4 = perNum('teil4') || (f.teilId ? null : (t.teil4 || []).find(i => frage4(i) === f.frage));
  if (i4 && i4.bild) out.aufgabe = img(i4.bild);
  return out;
}

// ---------------- KOPFZEILE: NIVEAU · LERNFELD · SCHRITT ----------------
// "B1.1 Unterwegs", Schritt 1 -> "B1 · Lernfeld 1 · Schritt 1"; "Lernfeld 3: Körper" (A2) -> "A2 · Lernfeld 3 · Schritt 2";
// Lernfeld-Test -> "… · Lernfeld-Test"; Stufen ohne Lernfeld-Nummer (z. B. Grammatik-Training) -> "A1 · Grammatik-Training".
function lernfeldZeile(id) {
  const lf = CURRICULUM.find(s => s.items.indexOf(id) >= 0);
  if (!lf) return 'Werkstattarbeit DaZ';
  const nr = (/^[AB]\d\.(\d+)\s/.exec(lf.name) || /^Lernfeld (\d+)/.exec(lf.name) || [])[1];
  const teile = [lf.niveau, nr ? 'Lernfeld ' + nr : lf.name];
  const schritt = schrittLabel(id);
  if (schritt) teile.push(schritt);
  else if (curriculumItemInfo(id).kind === 'test-final') teile.push('Lernfeld-Test');
  return teile.join(' · ');
}
function setzeKopfzeile(viewId, id) {
  const e = document.querySelector('#' + viewId + ' .eyebrow');
  if (e) { e.textContent = lernfeldZeile(id); e.classList.add('eyebrow-lernfeld'); }
}

// ---------------- ZURÜCK = EIN SCHRITT ZURÜCK ----------------
['backToStart', 'actBack', 'ergebnisBack'].forEach(bid => { document.getElementById(bid).textContent = '← Zurück'; });

// ---------------- GEZIELTE WIEDERHOLUNG EINZELNER ABSCHLUSSTEST-TEILE ----------------
// Bei „Wiederholen nötig“ mit ausgewählten Teilen: alle ANDEREN Teile werden aus der letzten Abgabe vorausgefüllt und gesperrt;
// ihre Bewertung (inkl. deiner Änderungen) wird in die neue Abgabe übernommen. Rückgabe: true, wenn Teile gesperrt wurden.
async function wendeAbschlussWiederholungAn(t, testId, name) {
  const sl = slug(name);
  let status = null;
  try { const r = await holeStatus(testId, name); status = (r && r.value) ? JSON.parse(r.value) : null; } catch (e) { return false; }
  const neuFelder = Array.isArray(status && status.wiederholenFelder) ? status.wiederholenFelder : null;
  const altTeile = Array.isArray(status && status.wiederholenTeile) ? status.wiederholenTeile : null;
  const hatAngabe = (neuFelder && neuFelder.length) || (!neuFelder && altTeile && altTeile.length);
  wiederholungsRunde = ablaufStatus(status) === 'wiederholung_frei';
  if (!status || !wiederholungsRunde || !hatAngabe) return false;
  let keys = [];
  try { const r = await window.storage.list(`submission:${testId}:${sl}:`, true); keys = (r && r.keys) || []; } catch (e) { return false; }
  if (!keys.length) return false;
  keys.sort((a, b) => Number(b.split(':')[3]) - Number(a.split(':')[3]));
  let sub = null;
  try { const r = await window.storage.get(keys[0], true); sub = JSON.parse(r.value); } catch (e) { return false; }
  if (!sub || !sub.felderAntworten) return false;
  if ((sub.testVersion || 1) !== ((TESTS[testId] && TESTS[testId].testVersion) || 1)) return false;   // Abgabe zu einer älteren Fassung des Tests -> volle Wiederholung (07.10.2026)
  let review = null;
  try { const r = await window.storage.get(status.reviewKey || `review:${testId}:${sl}:${keys[0].split(':')[3]}`, true); if (r && r.value) review = JSON.parse(r.value); } catch (e) { /* ohne Review */ }
  const eff = {};
  if (review && review.felder) review.felder.forEach(f => { eff[f.key] = !!f.korrekt; });
  else (sub.felderDetails || []).forEach(d => { if (d.key) eff[d.key] = d.korrekt === true; });

  const info = abschlussTeileInfo();
  const alleKeys = Object.keys(info.keyTeil);
  // mussWiederholen = Menge der Feld-Schlüssel, die offen bleiben (neu beantwortet werden müssen).
  let mussWiederholen;
  if (neuFelder) {
    mussWiederholen = new Set(neuFelder); // präzise: genau diese Aufgaben waren als ✗ markiert
  } else {
    const wdh = new Set(altTeile.map(Number)); // Bestandsschutz für ältere, noch teilbasierte Bewertungen
    mussWiederholen = new Set(alleKeys.filter(k => wdh.has(info.keyTeil[k])));
  }
  const gesperrtAnzahl = alleKeys.length - mussWiederholen.size;
  if (gesperrtAnzahl <= 0 || !mussWiederholen.size) return false; // nichts zu sperren -> normale volle Wiederholung
  abschlussState.uebernommen = {};
  document.querySelectorAll('#abschlussBody [data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (mussWiederholen.has(key)) return;                    // diese Aufgabe wird wiederholt
    const alt = sub.felderAntworten[key];
    if (alt === undefined) return;                           // beim letzten Mal leer gelassen -> bleibt offen (nicht leer sperren)
    el.value = alt; el.dispatchEvent(new Event('blur'));
    if (eff[key] !== undefined) abschlussState.uebernommen[key] = eff[key];
    el.disabled = true; el.classList.add('abschluss-gesperrt');
    const chips = el.closest('.gen-chip-gruppe'); if (chips) chips.classList.add('abschluss-gesperrt');
  });
  const offene = [...document.querySelectorAll('#abschlussBody [data-key]:not(.abschluss-gesperrt)')];
  if (!document.querySelector('#abschlussBody .abschluss-gesperrt[data-key]')) return false; // nichts gesperrt -> normale volle Wiederholung
  zeigeWiederholungsHinweis(offene.map(el => el.closest('.gen-chip-gruppe') || el), offene.length);
  return true;
}

// ---------------- WIEDERHOLUNG: HINWEIS OBEN + OFFENE AUFGABEN MARKIEREN ----------------
// Beim gezielten Wiederholen ist fast alles schon eingetragen und grau. Damit niemand denkt, es gäbe nichts zu tun:
// OBEN steht, wie viele Aufgaben neu zu machen sind, die offenen sind gelb markiert, und ein Knopf springt zur ersten.
function zeigeWiederholungsHinweis(offeneElemente, anzahl) {
  const n = anzahl === undefined ? offeneElemente.length : anzahl;
  offeneElemente.forEach(el => el.classList.add('wdh-offen'));
  document.querySelectorAll('#view-test .locked-tag').forEach(tag => { const r = tag.closest('.item, .gegenteil-row'); if (r) r.classList.add('wdh-fertig'); });
  document.getElementById('repeatNotice').innerHTML = `<div class="repeat-badge repeat-hinweis-oben"><strong>Wiederholung:</strong> Du musst nur noch ${n} Aufgabe${n === 1 ? '' : 'n'} neu machen. ${n === 1 ? 'Sie ist' : 'Sie sind'} gelb markiert.<br><span style="font-weight:400;">Alle anderen Aufgaben sind schon fertig — sie sind grau und bleiben so.</span><br><button type="button" class="btn small" id="wdhSprung" style="margin-top:8px;">Zur ersten offenen Aufgabe</button></div>`;
  document.getElementById('wdhSprung').addEventListener('click', () => { if (offeneElemente[0]) offeneElemente[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); });
}
// Offene (nicht gesperrte) Aufgaben eines Vokabeltests — ohne Reste in ausgeblendeten Teilen
function offeneVokabelAufgaben() {
  return [...document.querySelectorAll('#teil1items .item, #teil2items .item, #teil3items .item, #teil4items .gegenteil-row')]
    .filter(el => !el.querySelector('.locked-tag') && !el.closest('.teil.hidden'));
}

// ---------------- STATUS EINES TESTS BEIM ÖFFNEN ----------------
// Liefert { value: '<Status-JSON>' } wie window.storage.get — aber ohne Backend-Anfrage, wenn der gerade geladene
// Fortschritt der Startseite die Antwort schon eindeutig kennt (jede Anfrage kostet 2–3 s):
//   · Test wurde noch nie abgegeben  -> es gibt nichts zu wiederholen
//   · Wiederholung ist freigegeben  -> steht vollständig im Cache (samt der zu wiederholenden Aufgaben)
// In allen anderen Fällen (abgegeben, aber noch "offen"/"weiter") wird frisch gefragt — die Lehrkraft könnte den
// Test inzwischen auf "Wiederholen nötig" gesetzt haben.
async function holeStatus(id, name) {
  const c = progressCache;
  if (c && c.loaded && c.name === name) {
    const si = (c.statusInfo || {})[id];
    if (!si && !(c.doneTests && c.doneTests.has(id))) return null;
    if (si && ablaufStatus(si) === 'wiederholung_frei') return { value: JSON.stringify(si) };
  }
  return window.storage.get(`status:${id}:${slug(name)}`, true);
}

// ---------------- ZUGANG: KLASSEN-CODE + NAMENSLISTE VOM BACKEND ----------------
// Die Namen der Klasse stehen nicht mehr im (öffentlich abrufbaren) Seiten-Code. Sie kommen vom Apps Script — und das
// antwortet nur, wenn der Klassen-Code stimmt. Der Code wird einmal pro Gerät eingegeben und dort gespeichert; die
// zuletzt geladene Namensliste ebenfalls, damit die Auswahl beim nächsten Öffnen sofort da ist.
function zeigeNamen(namen) {
  STUDENTS = ohneTestkonten(namen, true);
  fillStudentSelect(document.getElementById('startName'));
}
function setzeNamenPlatzhalter(text) {
  const o = document.querySelector('#startName option[value=""]'); if (o) o.textContent = text;
}
async function starteZugang() {
  let cache = null;
  try { cache = JSON.parse(localStorage.getItem('daz_namen') || 'null'); } catch (e) { /* kein Cache */ }
  if (Array.isArray(cache) && cache.length) zeigeNamen(cache); else setzeNamenPlatzhalter('Namen werden geladen …');
  try {
    const d = await anmelden(ZUGANGS_CODE);
    zeigeNamen(d.namen);
    setzeNamenPlatzhalter('— Bitte wählen —');
    try { localStorage.setItem('daz_namen', JSON.stringify(d.namen || [])); } catch (e) { /* egal */ }
    zugangFertig();
  } catch (e) {
    if (e && e.message === 'zugang_verweigert') beiZugangVerweigert();
    else {
      if (!(Array.isArray(cache) && cache.length)) setzeNamenPlatzhalter('Keine Verbindung — bitte Seite neu laden');
      // ohne Netz: mit gespeicherter Sitzung weiterarbeiten (lokale Entwürfe), sonst nichts anhalten
      if (ANMELDUNG) BACKEND_API = 3;
      zugangFertig();
    }
  }
}
// Wird auch von ascAnfrage() aufgerufen, sobald IRGENDEINE Anfrage mit "zugang_verweigert" zurückkommt
// (z. B. wenn die Lehrkraft den Klassen-Code geändert hat).
function beiZugangVerweigert() {
  if (document.getElementById('codeGate')) return;
  try { localStorage.removeItem('daz_namen'); } catch (e) { /* egal */ }
  zeigeNamen([]);
  const gate = document.createElement('div');
  gate.id = 'codeGate';
  gate.innerHTML = `<div class="code-gate-box">
      <p class="eyebrow" style="color:var(--ink-soft);">Werkstattarbeit DaZ</p>
      <h2>Klassen-Code</h2>
      <p>Bitte gib den Code deiner Klasse ein. Deine Lehrkraft sagt ihn dir.</p>
      <input type="text" id="codeInput" placeholder="Klassen-Code" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="btn full" id="codeSubmit" style="margin-top:12px;">Weiter</button>
      <p id="codeError" class="code-gate-fehler"></p>
    </div>`;
  document.body.appendChild(gate);
  const input = document.getElementById('codeInput'), btn = document.getElementById('codeSubmit'), err = document.getElementById('codeError');
  async function pruefen() {
    const code = input.value.trim();
    if (!code) return;
    btn.disabled = true; btn.textContent = 'Prüfe …'; err.textContent = '';
    try {
      const d = await anmelden(code);
      ZUGANGS_CODE = code;
      try { localStorage.setItem('daz_code', code); localStorage.setItem('daz_namen', JSON.stringify(d.namen || [])); } catch (e) { /* egal */ }
      gate.remove();
      zeigeNamen(d.namen);
      setzeNamenPlatzhalter('— Bitte wählen —');
      zugangFertig();
    } catch (e) {
      err.textContent = (e && e.message === 'zugang_verweigert') ? 'Der Code stimmt nicht. Bitte noch einmal versuchen.' : 'Keine Verbindung. Bitte noch einmal versuchen.';
      btn.disabled = false; btn.textContent = 'Weiter';
    }
  }
  btn.addEventListener('click', pruefen);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
  input.focus();
}

// ---------------- ANMELDUNG MIT PIN JE KIND (ab BACKEND_API 3, Stand 29.10.2026) ----------------
// Name wählen -> das Apps Script prüft die PIN (Tabellenblatt "Schueler", Spalte B). Kinder ohne PIN kommen ohne Abfrage
// weiter. Die Sitzung bleibt auf dem Gerät (jedes Kind hat ein eigenes), bis es auf „Abmelden“ tippt; beim nächsten
// Öffnen ist der eigene Name schon gewählt. Erst mit gültiger Sitzung wird der Stand geladen (refreshProgress).
let zugangGeprueft = false, zugangWarten = [], nameDurchlassen = false;
function zugangFertig() { zugangGeprueft = true; zugangWarten.splice(0).forEach(f => f()); sitzungWiederherstellen(); }
function nameSelect() { return document.getElementById('startName'); }
function nameWeiter() { nameDurchlassen = true; nameSelect().dispatchEvent(new Event('change')); nameDurchlassen = false; zeigeAbmelden(); }
function nameZurueck() { const s = nameSelect(); s.value = ANMELDUNG && STUDENTS.indexOf(ANMELDUNG.name) >= 0 ? ANMELDUNG.name : ''; zeigeAbmelden(); }
// Läuft vor refreshProgress (Erfassungsphase am Dokument) und hält die Auswahl an, bis die Anmeldung stimmt
document.addEventListener('change', e => {
  if (nameDurchlassen || !e.target || e.target.id !== 'startName') return;
  const name = e.target.value.trim();
  if (zugangGeprueft && (BACKEND_API < 3 || !name || (ANMELDUNG && ANMELDUNG.name === name))) { zeigeAbmelden(); return; }
  e.stopImmediatePropagation();
  if (!zugangGeprueft) { zugangWarten.push(() => { if (nameSelect().value.trim() === name) nameSelect().dispatchEvent(new Event('change')); }); return; }
  anmeldeKind(name);
}, true);
async function anmeldeKind(name) {
  try {
    const d = await schuelerAnmelden(name, '');
    setzeSitzung({ name, token: d.token }); merkeSprache(d.sprache);
    nameWeiter();
  } catch (e) {
    const f = e && e.message;
    if (f === 'pin_noetig' || f === 'pin_gesperrt') zeigePinAbfrage(name, f === 'pin_gesperrt' ? PIN_TEXTE.pin_gesperrt : '');
    else if (f !== 'zugang_verweigert') { nameZurueck(); alert('Keine Verbindung. Bitte noch einmal versuchen.'); }
  }
}
const PIN_TEXTE = {
  pin_falsch: 'Die PIN stimmt nicht. Bitte noch einmal versuchen.',
  pin_gesperrt: 'Zu viele falsche Versuche. Warte 10 Minuten oder frag deine Lehrkraft.',
  name_unbekannt: 'Diesen Namen gibt es nicht mehr. Bitte lade die Seite neu.',
};
function zeigePinAbfrage(name, fehlerText) {
  if (document.getElementById('pinGate')) return;
  const gate = document.createElement('div');
  gate.id = 'pinGate';
  gate.innerHTML = `<div class="code-gate-box">
      <p class="eyebrow" style="color:var(--ink-soft);">Anmelden</p>
      <h2>${escapeHtml(name)}</h2>
      <p>Bitte gib deine PIN ein (4 Ziffern). Deine Lehrkraft gibt sie dir.</p>
      <input type="password" id="pinInput" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="PIN" autocomplete="off">
      <button class="btn full" id="pinSubmit" style="margin-top:12px;">Weiter</button>
      <button class="btn secondary full" id="pinAbbrechen" style="margin-top:8px;">Das bin ich nicht</button>
      <p id="pinError" class="code-gate-fehler">${escapeHtml(fehlerText || '')}</p>
    </div>`;
  document.body.appendChild(gate);
  const input = document.getElementById('pinInput'), btn = document.getElementById('pinSubmit'), err = document.getElementById('pinError');
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 4); });
  async function pruefen() {
    const pin = input.value.trim();
    if (!/^\d{4}$/.test(pin)) { err.textContent = 'Die PIN hat 4 Ziffern.'; return; }
    btn.disabled = true; btn.textContent = 'Prüfe …'; err.textContent = '';
    try {
      const d = await schuelerAnmelden(name, pin);
      setzeSitzung({ name, token: d.token }); merkeSprache(d.sprache);
      gate.remove();
      nameWeiter();
    } catch (e) {
      err.textContent = PIN_TEXTE[e && e.message] || 'Keine Verbindung. Bitte noch einmal versuchen.';
      input.value = ''; btn.disabled = false; btn.textContent = 'Weiter'; input.focus();
    }
  }
  btn.addEventListener('click', pruefen);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
  document.getElementById('pinAbbrechen').addEventListener('click', () => { gate.remove(); nameZurueck(); });
  input.focus();
}
// Das Apps Script kennt die Sitzung nicht mehr (z. B. neue PIN): abmelden und für den gewählten Namen neu fragen
function beiAnmeldungNoetig() {
  const name = ANMELDUNG ? ANMELDUNG.name : nameSelect().value.trim();
  setzeSitzung(null);
  zeigeAbmelden();
  if (name && STUDENTS.indexOf(name) >= 0) zeigePinAbfrage(name, 'Bitte melde dich neu an.');
}
// Beim Öffnen: eigener Name schon gewählt, wenn das Gerät eine Sitzung hat
function sitzungWiederherstellen() {
  if (BACKEND_API < 3) return;
  const s = nameSelect();
  if (ANMELDUNG && STUDENTS.indexOf(ANMELDUNG.name) >= 0) { if (s.value !== ANMELDUNG.name) { s.value = ANMELDUNG.name; nameWeiter(); } }
  else if (ANMELDUNG && STUDENTS.length) setzeSitzung(null);
  zeigeAbmelden();
}
function zeigeAbmelden() {
  let b = document.getElementById('abmeldenKnopf');
  const an = BACKEND_API >= 3 && !!ANMELDUNG && nameSelect().value.trim() === ANMELDUNG.name;
  if (!an) { if (b) b.remove(); return; }
  if (b) return;
  b = document.createElement('button');
  b.id = 'abmeldenKnopf'; b.type = 'button'; b.className = 'btn secondary small'; b.textContent = 'Abmelden';
  b.addEventListener('click', () => {
    setzeSitzung(null);
    const s = nameSelect(); s.value = '';
    nameDurchlassen = true; s.dispatchEvent(new Event('change')); nameDurchlassen = false;
    zeigeAbmelden();
    if (typeof showView === 'function') showView('view-start');
  });
  nameSelect().insertAdjacentElement('afterend', b);
}
starteZugang();

// ---------------- ABGABE EINER WIEDERHOLUNG ----------------
// true, solange gerade die freigegebene Wiederholung eines Tests bearbeitet wird (gesetzt von den Wiederholungs-Filtern).
var wiederholungsRunde = false;
// Status nach einer Abgabe: "offen" (wird geprüft); bei einer Wiederholung mit Merker, damit die Lehrkraft
// "Endgültig erledigt" oder "Nochmal Korrektur auf Zettel" angeboten bekommt.
function neuerStatusNachAbgabe() { return wiederholungsRunde ? { status: 'offen', wiederholung: true } : { status: 'offen' }; }

// ---------------- BILDER DER SCHRITT-TESTS NACHLADEN ----------------
// data/icons-schritte-<lernfeld>.js wird erst geladen, wenn ein Test dieses Lernfelds geöffnet (oder sein Ergebnis
// angesehen) wird — so bleibt der Seitenstart schnell. SCHRITT_BILD_GRUPPEN kommt aus data/icons-schritte-gruppen.js.
const schrittBilderGeladen = {};
function schrittBildGruppe(id) {
  const m = /^(b1|a1)_lf(\d)/.exec(id) || null;
  if (m) return m[1] + '_lf' + m[2];
  const a2 = /^lf(\d)/.exec(id);
  return a2 ? 'a2_lf' + a2[1] : null;
}
function ladeSkript(pfad) {
  return new Promise(res => {
    const s = document.createElement('script');
    s.src = pfad + '?v=' + (typeof APP_V !== 'undefined' ? APP_V : '');
    s.onload = res; s.onerror = res;   // ohne Bilder geht es trotzdem weiter
    document.head.appendChild(s);
  });
}
function ladeSchrittBilder(id) {
  const g = schrittBildGruppe(id);
  if (!g || typeof SCHRITT_BILD_GRUPPEN === 'undefined' || SCHRITT_BILD_GRUPPEN.indexOf(g) < 0) return basisBilder(id);
  if (!schrittBilderGeladen[g]) schrittBilderGeladen[g] = ladeSkript('data/icons-schritte-' + g + '.js');
  return Promise.all([basisBilder(id), schrittBilderGeladen[g]]);
}

// Bilder je Lernfeld (31.10.2026, Lukas: Schul-WLAN schwach): Statt ALLER Bilder (~3 MB) lädt ein Test, ein Spiel oder ein
// Ergebnis nur die Bilddatei seines Lernfelds (data/icons-gruppe-<stufe>.js, erzeugt von gen_bildgruppen.js; BILD_GRUPPEN
// aus data/icons-gruppen.js). Die „Jetzt dran“-Karte lädt die Bilder der nächsten Aufgabe schon im Hintergrund vor.
// Nur für IDs außerhalb des Lernpfads gilt der alte Weg (alle Bilder).
const BASIS_BILDER = ['data/icons-a1.js', 'data/icons-a2.js', 'data/icons-lesespur.js'];
let basisBilderVersprechen = null, basisBilderFertig = false;
const gruppenBilderGeladen = {};
function basisBilder(id) {
  const st = id && typeof BILD_GRUPPEN !== 'undefined' ? CURRICULUM.find(s => s.items.indexOf(id) >= 0) : null;
  if (st && Object.prototype.hasOwnProperty.call(BILD_GRUPPEN, st.id)) {
    if (!BILD_GRUPPEN[st.id]) return Promise.resolve();   // dieses Lernfeld hat keine Bilder
    return gruppenBilderGeladen[st.id] || (gruppenBilderGeladen[st.id] = ladeSkript('data/icons-gruppe-' + st.id + '.js'));
  }
  if (!basisBilderVersprechen) basisBilderVersprechen = Promise.all(BASIS_BILDER.map(ladeSkript)).then(() => { basisBilderFertig = true; });
  return basisBilderVersprechen;
}
function basisBilderDa() { return basisBilderFertig; }

// ---------------- ZWISCHENSPEICHERN AUF DEM GERÄT (Auftrag 11.10.2026, H.5) ----------------
// Jede Antwort wird sofort im Browser gesichert (localStorage), zusätzlich wie bisher höchstens alle 20 s ans Apps Script.
// Bricht das Internet ab und wird die Seite neu geladen, ist nichts verloren: Beim Öffnen gilt der NEUERE Stand
// (Server oder Gerät). Nach erfolgreicher Abgabe wird die Sicherung auf dem Gerät gelöscht; Reste verfallen nach 30 Tagen.
const LOKAL_PREFIX = 'daz_entwurf:';
function lokalSichern(key, payload) {
  if (!key || !payload) return;
  try { localStorage.setItem(LOKAL_PREFIX + key, JSON.stringify(payload)); } catch (e) { /* Speicher voll/gesperrt: Server-Autosave bleibt */ }
}
function lokalLesen(key) {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(LOKAL_PREFIX + key) || 'null'); } catch (e) { return null; }
  if (!o) return null;
  if (o.gespeichertAm && Date.now() - Date.parse(o.gespeichertAm) > 30 * 864e5) { lokalLoeschen(key); return null; }
  return o;
}
function lokalLoeschen(key) { try { localStorage.removeItem(LOKAL_PREFIX + key); } catch (e) { /* egal */ } }
function neuererEntwurf(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return (Date.parse(b.gespeichertAm) || 0) > (Date.parse(a.gespeichertAm) || 0) ? b : a;
}

// Tests: bei jeder ausgewerteten Antwort (über autosaveTestProgressDebounced) und beim Tippen (kurz entprellt)
function testEntwurfLokalSichern() {
  if (!currentTestId || !currentStudentName) return;
  const p = baueTestEntwurf();
  if (p) lokalSichern(progressKeyFor(currentTestId, currentStudentName), p);
}
let testTippTimer = null;
document.getElementById('view-test').addEventListener('input', () => {
  if (!autosaveNutzerAktiv) return;
  clearTimeout(testTippTimer);
  testTippTimer = setTimeout(testEntwurfLokalSichern, 400);
}, true);

// Grammatik-Blöcke: bisher nur per Knopf „Speichern & später fortsetzen“ — jetzt wie Tests: sofort lokal, alle 20 s ans Apps Script
function baueGrammatikEntwurf() {
  const felder = {};
  document.querySelectorAll('#actBody .gb-input').forEach(input => {
    if (input.value.trim()) felder[input.getAttribute('data-key')] = input.value;
  });
  return { kind: 'grammatik', felder, gespeichertAm: new Date().toISOString() };
}
let gbAutosave = { aktiv: false, id: '', name: '', timer: null, zuletzt: 0, laufend: Promise.resolve() };
function gbEntwurfKey() { return `testprogress:${gbAutosave.id}:${slug(gbAutosave.name)}`; }
function gbNochOffen() { return gbAutosave.aktiv && currentActivityId === gbAutosave.id && !!document.querySelector('#actBody .gb-input'); }
function grammatikAutosaveStarten() {
  clearTimeout(gbAutosave.timer);
  gbAutosave = { aktiv: true, id: currentActivityId, name: currentActivityName, timer: null, zuletzt: 0, laufend: gbAutosave.laufend };
}
function grammatikAutosaveJetzt() {
  clearTimeout(gbAutosave.timer); gbAutosave.timer = null;
  if (!gbNochOffen()) return gbAutosave.laufend;   // Block schon verlassen: der Stand liegt lokal, nichts Falsches schreiben
  gbAutosave.zuletzt = Date.now();
  const payload = baueGrammatikEntwurf();
  lokalSichern(gbEntwurfKey(), payload);
  gbAutosave.laufend = window.storage.set(gbEntwurfKey(), JSON.stringify(payload), true).catch(() => {});
  return gbAutosave.laufend;
}
async function grammatikAutosaveBeenden() {
  clearTimeout(gbAutosave.timer); gbAutosave.timer = null; gbAutosave.aktiv = false;
  await gbAutosave.laufend.catch(() => {});
}
document.getElementById('actBody').addEventListener('input', ev => {
  if (!ev.target.classList || !ev.target.classList.contains('gb-input') || !gbNochOffen()) return;
  lokalSichern(gbEntwurfKey(), baueGrammatikEntwurf());
  if (gbAutosave.timer) return;
  gbAutosave.timer = setTimeout(grammatikAutosaveJetzt, Math.max(1200, AUTOSAVE_ABSTAND_MS - (Date.now() - gbAutosave.zuletzt)));
});
// Beim Verlassen (Zurück, Tab/App wechseln) den ausstehenden Stand sofort schicken — VOR dem Seitenwechsel (Capture)
document.getElementById('actBack').addEventListener('click', () => { if (gbAutosave.timer) grammatikAutosaveJetzt(); }, true);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && gbAutosave.timer) grammatikAutosaveJetzt(); });

// ---------------- STARTSEITE: STAND EINES KINDES IN EINER ANFRAGE (Auftrag 11.10.2026, H.3) ----------------
// Liefert dasselbe wie vorher Promise.allSettled([list('submission:'), listBySuffix(':<slug>')]).
async function ladeSchuelerStand(sl) {
  if (BACKEND_API >= 2) {
    try {
      const d = await window.storage.schuelerStand(sl);
      return [{ status: 'fulfilled', value: { keys: d.abgaben } }, { status: 'fulfilled', value: { items: d.items } }];
    } catch (e) { /* alter Weg mit zwei Anfragen */ }
  }
  return Promise.allSettled([window.storage.list('submission:', true), window.storage.listBySuffix(`:${sl}`, true)]);
}


// ---------------- GRAMMATIK-WIEDERHOLUNG B1 (Paket 3, 28.10.2026) ----------------
// Stufen, deren Schritte in beliebiger Reihenfolge bearbeitet werden dürfen (alle gleichzeitig offen)
var FREIE_REIHENFOLGE = ['b1_wdh', 'b1_modelltest'];   // Modelltest: keine Sperre (Paket 4)

// Wortkarten: antippen = in den Satz legen, im Satz antippen = zurücklegen. Das versteckte Feld hält den Satz (Speichern, Abgabe).
function wortkartenHtml(key, woerter) {
  const karten = woerter.map((w, i) => `<button type="button" class="wo-karte" data-i="${i}">${escapeHtml(w)}</button>`).join('');
  return `<div class="wo-feld"><div class="wo-satz" aria-label="Dein Satz"><span class="wo-leer">Tippe die Wörter in der richtigen Reihenfolge an.</span></div>
    <div class="wo-karten">${karten}</div><input type="hidden" class="gb-input" data-key="${key}"></div>`;
}
function wortkartenWert(feld) {
  return [...feld.querySelectorAll('.wo-satz .wo-karte')].map(k => k.textContent).join(' ').replace(/\s+([,.?!])/g, '$1');
}
function wortkartenAktualisieren(feld) {
  const leer = feld.querySelector('.wo-leer');
  if (leer) leer.style.display = feld.querySelector('.wo-satz .wo-karte') ? 'none' : '';
  const inp = feld.querySelector('input.gb-input');
  inp.value = wortkartenWert(feld);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}
// Gespeicherten Satz (Entwurf) wieder in Karten legen
function wortkartenAusWert(inp) {
  const feld = inp.closest('.wo-feld'); if (!feld) return;
  const satz = feld.querySelector('.wo-satz'), ablage = feld.querySelector('.wo-karten');
  [...satz.querySelectorAll('.wo-karte')].forEach(k => ablage.appendChild(k));
  String(inp.value || '').replace(/([,.?!])/g, ' $1').split(/\s+/).filter(Boolean).forEach(w => {
    const k = [...ablage.querySelectorAll('.wo-karte')].find(x => x.textContent === w); if (k) satz.appendChild(k);
  });
  const leer = feld.querySelector('.wo-leer'); if (leer) leer.style.display = satz.querySelector('.wo-karte') ? 'none' : '';
}
document.getElementById('actBody').addEventListener('click', ev => {
  const k = ev.target.closest('.wo-karte'); if (!k) return;
  const feld = k.closest('.wo-feld');
  (k.parentElement.classList.contains('wo-satz') ? feld.querySelector('.wo-karten') : feld.querySelector('.wo-satz')).appendChild(k);
  wortkartenAktualisieren(feld);
});

// Gesamtauswertung „Das musst du wiederholen“ (Abschnitt 6 des Bauplans). Keine Note, nur Vorschlag; Lukas entscheidet.
async function zeigeWdhAuswertung(a) {
  const body = document.getElementById('actBody');
  const name = currentActivityName, sl = slug(name);
  body.innerHTML = '<p class="hint">Deine Ergebnisse werden geladen …</p>';
  let subKeys = [], werte = {};
  try {
    const res = await window.storage.list('submission:b1wdh_', true);
    subKeys = ((res && res.keys) || []).filter(k => k.split(':')[2] === sl && WDH_B1_BLOECKE.indexOf(k.split(':')[1]) >= 0);
    const si = progressCache.statusInfo || {};
    const reviewKeys = WDH_B1_BLOECKE.map(t => si[t] && si[t].reviewKey).filter(Boolean);
    werte = await holeViele(subKeys.concat(reviewKeys, ['wdhthemen:' + sl]));
  } catch (e) { body.innerHTML = '<p>Die Ergebnisse konnten gerade nicht geladen werden. Bitte später noch einmal versuchen.</p>'; return; }
  if (currentActivityId !== 'b1wdh_auswertung') return;
  let vorgaben = {}; try { vorgaben = JSON.parse(werte['wdhthemen:' + sl] || '{}') || {}; } catch (e) { /* keine */ }
  const paare = wdhPaareAus(werte, subKeys, progressCache.statusInfo || {});
  const stat = wdhStatistik(paare, vorgaben);
  const fertig = paare.length;
  let h = '<h2 class="wdh-kopf">Dein Ergebnis in der Grammatik-Wiederholung B1</h2>';
  if (fertig < WDH_B1_BLOECKE.length) h += `<p class="wdh-hinweis">Du hast erst ${fertig} von ${WDH_B1_BLOECKE.length} Blöcken gemacht. Die Auswertung ist noch nicht vollständig.</p>`;
  h += '<div class="wdh-liste">';
  WDH_B1_THEMEN.forEach(t => {
    const s = stat[t.kz];
    const zahl = s.bearbeitet ? `${s.richtig} von ${s.bearbeitet} richtig${s.offen ? ` (${s.offen} noch nicht bewertet)` : ''}` : 'noch nicht bearbeitet';
    h += `<div class="wdh-zeile"><span class="wdh-ampel wdh-${s.farbe}" title="${WDH_FARBTEXT[s.farbe]}"></span><span class="wdh-name">${escapeHtml(t.name)}</span><span class="wdh-zahl">${zahl}</span></div>`;
  });
  h += '</div>';
  const wdh = WDH_B1_THEMEN.map(t => stat[t.kz]).filter(s => s.wiederholen && s.bearbeitet)
    .sort((x, y) => (x.farbe === 'rot' ? 0 : 1) - (y.farbe === 'rot' ? 0 : 1));
  h += '<h3 class="wdh-kopf2">Das musst du wiederholen</h3>';
  if (!wdh.length && fertig) h += '<p class="wdh-gut">Du kannst alle Themen. Gut gemacht!</p>';
  else if (!wdh.length) h += '<p>Mach zuerst einen Block. Dann siehst du hier, was du wiederholen solltest.</p>';
  wdh.forEach(s => {
    h += `<div class="wdh-thema wdh-rand-${s.farbe === 'rot' ? 'rot' : 'gelb'}"><div class="wdh-thema-kopf"><span class="wdh-ampel wdh-${s.farbe}"></span><strong>${escapeHtml(s.thema.name)}</strong> <span class="wdh-seite">Buch S. ${escapeHtml(s.thema.seite)}</span></div>
      <p class="wdh-merk">${escapeHtml(s.thema.merksatz)}</p>`;
    s.fehler.slice(0, 3).forEach(f => {
      h += `<div class="wdh-fehler"><div>${escapeHtml(f.frage || '')}</div><div>Deine Antwort: <span class="wdh-falsch">${escapeHtml(f.antwort || '(keine Antwort)')}</span></div><div>Richtig: <span class="wdh-richtig">${escapeHtml(f.loesung || '')}</span></div></div>`;
    });
    h += '</div>';
  });
  h += '<p class="wdh-hinweis">Das ist ein Vorschlag. Deine Lehrkraft entscheidet, was du wiederholst.</p>';
  body.innerHTML = h;
  if (fertig >= WDH_B1_BLOECKE.length && !(progressCache.doneActs && progressCache.doneActs.has('b1wdh_auswertung'))) markActivityDone('b1wdh_auswertung');
}

// ---------------- MODELLTEST FIT B1 (Paket 4, 28.10.2026) ----------------
// Abschnitt "einmalig": jede Auswahl darf nur einmal vorkommen (Lesen Teil 3: jede Anzeige nur einmal; „0“ darf öfter).
// Nicht verbieten, nur beim Abschicken warnen.
function doppelteAuswahlOk(t) {
  if (!t || !Array.isArray(t.abschnitte)) return true;
  const doppelt = [];
  t.abschnitte.forEach((ab, ai) => {
    if (!ab.einmalig) return;
    const n = {};
    (ab.items || []).forEach((it, ii) => { const el = document.querySelector(`#abschlussBody [data-key="g${ai}-${ii}"]`); const v = el && el.value; if (v && v !== '0') n[v] = (n[v] || 0) + 1; });
    Object.entries(n).forEach(([v, k]) => { if (k > 1) doppelt.push(v); });
  });
  if (!doppelt.length) return true;
  return confirm(doppelt.map(v => `Anzeige ${v} kommt ${'zweimal'} vor.`).join('\n') + '\n\nJede Anzeige passt nur einmal. Trotzdem abschicken?');
}
// Wortzähler unter den Schreibfeldern (nur Anzeige, kein Zwang)
function wortzaehlerAktualisieren(ta) {
  if (!ta.matches || !ta.matches('#abschlussBody textarea.gen-lang')) return;
  let z = ta.nextElementSibling;
  if (!z || !z.classList.contains('wortzaehler')) { z = document.createElement('div'); z.className = 'wortzaehler'; ta.insertAdjacentElement('afterend', z); }
  const n = (ta.value.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
  z.textContent = n + (n === 1 ? ' Wort' : ' Wörter') + (ta.dataset.ziel ? ` (circa ${ta.dataset.ziel})` : '');
}
['input', 'blur'].forEach(ev => document.addEventListener(ev, e => { if (e.target && e.target.tagName === 'TEXTAREA') wortzaehlerAktualisieren(e.target); }, true));


// ---------------- „JETZT DRAN“: NUR DIE NÄCHSTE AUFGABE (Lukas 31.10.2026) ----------------
// Für alle Schüler und alle Inhalte: Oben bleibt die Lernpfad-Karte (wo stehe ich?), darunter steht genau eine Karte
// mit dem, was jetzt zu tun ist. Die bisherige Liste aller Lerninhalte ist nur noch über „Alle Lerninhalte ansehen“ da.
// Reihenfolge: Heft überarbeiten > Wiederholung > nächster offener Schritt > Heft zeigen > nichts zu tun.
function jetztDranBereich() {
  let el = document.getElementById('jetztDran');
  if (el) return el;
  el = document.createElement('div'); el.id = 'jetztDran';
  const liste = document.getElementById('itemBrowserList');
  const label = liste.parentNode.querySelector('.section-label');
  const alles = document.createElement('div'); alles.id = 'allesBereich';
  let offen = false; try { offen = sessionStorage.getItem('daz_alles') === '1'; } catch (e) { /* egal */ }   // gilt nur in diesem Tab
  if (!offen) alles.className = 'hidden';
  const karte = document.getElementById('progressOverview');
  karte.parentNode.insertBefore(el, karte);                 // ganz oben, direkt unter dem Namen: sofort sichtbar
  liste.parentNode.insertBefore(alles, label || liste);
  const sub = document.querySelector('#view-start header .sub');
  if (sub) sub.textContent = 'Wähle deinen Namen. Dann siehst du, was jetzt dran ist.';
  [label, document.getElementById('itemBrowserFilters'), liste].forEach(n => { if (n) alles.appendChild(n); });
  return el;
}
function jetztAufgaben() {
  const pc = progressCache, liste = [];
  CURRICULUM.forEach((lf, li) => lf.items.forEach((id, i) => {
    if (!pc.unlocked.has(id)) return;
    const kind = curriculumItemInfo(id).kind;
    liste.push({ id, lf, li, nr: i + 1, kind, st: getDisplayStatus(id, kind) });
  }));
  const aktiv = findAktivesLernfeldIndex();
  // Nächster Schritt in Lernpfad-Reihenfolge. Ein Arbeitsblatt ohne „Heft ok“ ist ein Riegel — auch wenn die Lehrkraft das
  // Lernfeld von Hand freigeschaltet hat (Quereinstieg): dahinter wird nichts als „Jetzt dran“ vorgeschlagen.
  let naechste = null;
  for (const x of liste) {
    if (x.li < aktiv) continue;
    if (x.kind === 'blatt' && x.st !== 'erledigt') { if (x.st === 'unerledigt') naechste = x; break; }
    if (x.st === 'unerledigt') { naechste = x; break; }
  }
  return {
    nochmal: liste.filter(x => x.kind === 'blatt' && x.st === 'zettel'),
    wdh: liste.filter(x => x.st === 'wiederholen'),
    naechste,
    heft: liste.filter(x => x.kind === 'blatt' && x.st === 'wirdgeprueft'),
    zettel: liste.filter(x => x.kind !== 'blatt' && x.st === 'zettel'),
  };
}
function jetztOeffnen(x) {
  const name = document.getElementById('startName').value.trim();
  if (x.kind === 'activity' || x.kind === 'grammatik' || x.kind === 'blatt') openActivity(x.id); else startTest(x.id, name);
}
// kopf = Zustand („Zeig dein Heft“ …): steht als fetter erster Satz im Text, nicht als Etikett über der Überschrift
function jetztKarteHtml(x, kopf, text, knopf) {
  const info = curriculumItemInfo(x.id);
  const zustand = kopf && kopf !== 'Jetzt dran' ? `<strong class="jetzt-zustand">${escapeHtml(kopf)}.</strong> ` : '';
  return `<section class="jetzt-karte" aria-label="Jetzt dran">
    <h2 class="jetzt-titel">${escapeHtml(anzeigeTitel(x.id, info.title))}</h2>
    <div class="jetzt-wo">${escapeHtml(x.lf.name)} · ${x.nr} von ${x.lf.items.length} · ${escapeHtml(typBezeichnung(info.kind))}</div>
    ${text || zustand ? `<p class="jetzt-text">${zustand}${text}</p>` : ''}
    ${knopf ? `<button type="button" class="btn jetzt-los">${escapeHtml(knopf)}</button>` : ''}
  </section>`;
}
function renderJetztDran() {
  const el = jetztDranBereich();
  const name = document.getElementById('startName').value.trim();
  if (!name) { el.innerHTML = ''; return; }
  if (!progressCache.loaded) { el.innerHTML = '<p class="overview-empty">Lade …</p>'; return; }
  const A = jetztAufgaben();
  let haupt = null, html = '';
  if (A.nochmal.length) {
    haupt = A.nochmal[0];
    const k = ((progressCache.statusInfo || {})[haupt.id] || {}).comment;
    html = jetztKarteHtml(haupt, 'Überarbeite dein Heft', (k ? `Deine Lehrkraft sagt: „${escapeHtml(k)}“<br>` : '') + 'Verbessere es im Heft und tippe dann wieder auf „Fertig“.', 'Arbeitsblatt öffnen');
  } else if (A.wdh.length) {
    haupt = A.wdh[0];
    html = jetztKarteHtml(haupt, 'Wiederholung', 'Mache nur die falschen Aufgaben noch einmal.', 'Wiederholen');
  } else if (A.naechste) {
    haupt = A.naechste;
    const p = progressCache.pausierteTests && progressCache.pausierteTests.has(haupt.id);
    const sub = haupt.kind === 'blatt' ? 'Lies und schreibe in dein Heft. Am Ende zeigst du dein Heft deiner Lehrkraft.'
      : escapeHtml(((ACTIVITIES[haupt.id] || TESTS[haupt.id] || {}).sub) || '');
    html = jetztKarteHtml(haupt, 'Jetzt dran', sub, haupt.kind === 'activity' ? 'Spielen' : haupt.kind === 'blatt' ? 'Arbeitsblatt öffnen' : p ? 'Fortsetzen' : 'Starten');
  } else if (A.heft.length) {
    haupt = A.heft[0];
    html = jetztKarteHtml(haupt, 'Zeig dein Heft', 'Geh mit deinem Heft und deinem Vokabelheft zu deiner Lehrkraft. Danach geht es weiter.', 'Arbeitsblatt noch einmal ansehen');
  } else {
    html = '<section class="jetzt-karte jetzt-leer" aria-label="Jetzt dran"><h2 class="jetzt-titel">Gerade nichts zu tun</h2><p class="jetzt-text">Deine Lehrkraft schaut sich deine Arbeit an. Danach geht es weiter.</p></section>';
  }
  // Was sonst noch offen ist, aber nicht die Hauptaufgabe: kurze Erinnerungen
  const extra = [];
  A.heft.filter(x => x !== haupt).forEach(x => extra.push(`Zeig deiner Lehrkraft dein Heft: ${escapeHtml(anzeigeTitel(x.id, curriculumItemInfo(x.id).title))}`));
  A.zettel.forEach(x => extra.push(`Korrigiere auf deinem Blatt: ${escapeHtml(anzeigeTitel(x.id, curriculumItemInfo(x.id).title))} <button type="button" class="btn small secondary jetzt-ergebnis" data-id="${x.id}">Ergebnis ansehen</button>`));
  if (extra.length) html += `<div class="jetzt-extra"><div class="jetzt-extra-kopf">Außerdem noch offen</div>${extra.map(t => `<div class="jetzt-extra-zeile">${t}</div>`).join('')}</div>`;
  const wartend = postausgang().length;
  if (wartend) html = `<div class="jetzt-post">${WO_SYMBOL.post}<span>${wartend === 1 ? 'Eine Abgabe wartet' : wartend + ' Abgaben warten'} auf Internet und ${wartend === 1 ? 'wird' : 'werden'} automatisch gesendet.</span></div>` + html;
  const alles = document.getElementById('allesBereich');
  html += `<button type="button" class="jetzt-alles" id="jetztAlles">${alles && !alles.classList.contains('hidden') ? 'Liste wieder ausblenden' : 'Alle Lerninhalte ansehen'}</button>`;
  el.innerHTML = html;
  const los = el.querySelector('.jetzt-los'); if (los && haupt) los.addEventListener('click', () => jetztOeffnen(haupt));
  if (haupt) setTimeout(() => ladeSchrittBilder(haupt.id), 400);   // Bilder der nächsten Aufgabe schon vorladen (klein, nur dieses Lernfeld)
  el.querySelectorAll('.jetzt-ergebnis').forEach(b => b.addEventListener('click', () => zeigeErgebnis(b.getAttribute('data-id'), name)));
  document.getElementById('jetztAlles').addEventListener('click', () => {
    const zu = alles.classList.toggle('hidden');
    try { sessionStorage.setItem('daz_alles', zu ? '0' : '1'); } catch (e) { /* egal */ }
    renderJetztDran();
  });
}

// ---------------- ARBEITSBLATT IM HEFT ----------------
// Inhalt: blatt:<id> vom Apps Script (nur mit Klassen-Code). Wird auf dem Gerät zwischengespeichert, damit ein Blatt
// auch bei wackligem Internet sofort wieder da ist. Seite für Seite; am Ende „Fertig“ -> Lehrkraft prüft das Heft.
const blattCache = {}, blattBilder = {};
function ladeBlattBilder(id) { const g = schrittBildGruppe(id); return blattBilder[g] || (blattBilder[g] = ladeSkript('data/icons-blaetter-' + g + '.js')); }
async function ladeBlatt(id) {
  if (blattCache[id]) return blattCache[id];
  const lk = 'daz_blatt:' + id;
  try {
    const r = await window.storage.get('blatt:' + id, true);
    if (r && r.value) { blattCache[id] = JSON.parse(r.value); try { localStorage.setItem(lk, r.value); } catch (e) { /* voll */ } return blattCache[id]; }
  } catch (e) {
    try { const v = localStorage.getItem(lk); if (v) return (blattCache[id] = JSON.parse(v)); } catch (e2) { /* nichts */ }
    if (!(e && e.message === 'not_found')) throw e;
  }
  return null;
}
function blattSeiteKey(id) { return 'daz_blattseite:' + id + ':' + slug(currentActivityName); }
function blattInline(t) {   // Text sicher machen, **fett**, [[Wort|Stichwort]] als antippbare Vokabel
  return escapeHtml(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (m, a, b) => `<button type="button" class="vok" data-vok="${b}">${a}</button>`);
}
function blattVokKnopf(text, stichwort) {
  const t = escapeHtml(text).replace(/\n/g, '<br>');
  return stichwort ? `<button type="button" class="vok" data-vok="${escapeHtml(stichwort)}">${t}</button>` : `<span>${t}</span>`;
}
const SYM = p => `<svg class="sym" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const WO_SYMBOL = {
  heft: SYM('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>'),
  vokabelheft: SYM('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18"/><path d="M12.5 8h3.5M12.5 12h3.5"/>'),
  lesen: SYM('<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>'),
  post: SYM('<path d="M12 15V4"/><path d="M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>'),
};
const WO_TEXT = { heft: 'Ins Heft', vokabelheft: 'Ins Vokabelheft', lesen: 'Lesen' };
function blattTabelleHtml(t) {
  return `<div class="blatt-tab-wrap"><table class="blatt-tab"><thead><tr>${t.kopf.map(k => `<th>${blattInline(k)}</th>`).join('')}</tr></thead>
    <tbody>${t.zeilen.map(z => `<tr>${z.map((c, i) => i ? `<td>${blattInline(c)}</td>` : `<th>${blattInline(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function blattBlockHtml(b) {
  if (b.art === 'auftrag') return `<div class="blatt-auftrag wo-${b.wo}">${WO_SYMBOL[b.wo] || ''}<p><strong class="blatt-wo">${WO_TEXT[b.wo] || ''}:</strong> ${blattInline(b.text)}</p></div>`;
  if (b.art === 'text') return `<div class="blatt-text">${b.absaetze.map(a => `<p>${blattInline(a)}</p>`).join('')}</div>`;
  if (b.art === 'blasen') return `<div class="blatt-blasen">${b.blasen.map(x => `<span class="blatt-blase">${blattInline(x)}</span>`).join('')}</div>`;
  if (b.art === 'merk') return `<div class="blatt-merk"><div class="blatt-merk-kopf">ⓘ ${blattInline(b.titel)}</div>${(b.zeilen || []).map(z => `<p>${blattInline(z)}</p>`).join('')}${(b.tabellen || []).map(blattTabelleHtml).join('')}</div>`;
  if (b.art === 'tabelle') return blattTabelleHtml(b);
  if (b.art === 'saetze') return `<ol class="blatt-saetze">${b.zeilen.map(z => `<li>${blattInline(z)}</li>`).join('')}</ol>`;
  if (b.art === 'hinweis') return `<p class="blatt-hinweis">${blattInline(b.text)}</p>`;
  if (b.art === 'checkliste') return `<ul class="blatt-check">${b.punkte.map(p => `<li>${blattInline(p)}</li>`).join('')}</ul>`;
  if (b.art === 'bildwoerter') return `${b.titel ? `<h3 class="blatt-h3">${blattInline(b.titel)}</h3>` : ''}<div class="blatt-bilder">${b.woerter.map(x =>
    `<button type="button" class="blatt-bild vok" data-vok="${escapeHtml(x.stichwort || x.de)}">${iconSrc(x.bild) ? `<img src="${iconSrc(x.bild)}" alt="">` : ''}<span>${escapeHtml(x.de)}</span></button>`).join('')}</div>`;
  if (b.art === 'bild') return `<figure class="blatt-figur">${iconSrc(b.bild) ? `<img src="${iconSrc(b.bild)}" alt="">` : '<p class="hint">Bild wird geladen …</p>'}<figcaption>${b.unter ? blattInline(b.unter) + ' · ' : ''}Tippe auf das Bild, um es groß zu sehen.</figcaption></figure>`;
  if (b.art === 'bildreihe') return `<div class="blatt-bildreihe">${b.bilder.map(x => `<figure>${iconSrc(x.bild) ? `<img src="${iconSrc(x.bild)}" alt="">` : ''}<figcaption>${escapeHtml(x.label)}</figcaption></figure>`).join('')}</div>`;
  if (b.art === 'dialog') return `<div class="blatt-dialog">${b.zeilen.map(([wer, was]) => `<div class="blatt-dialog-zeile"><span class="blatt-wer">${escapeHtml(wer)}:</span><span>${blattInline(was)}</span></div>`).join('')}</div>`;
  if (b.art === 'buchstabentexte') return `<div class="blatt-btexte">${b.texte.map((t, i) => `<div class="blatt-btext"><span class="blatt-buchstabe">${'ABCDEFGHIJ'[i]}</span><p>${blattInline(t)}</p></div>`).join('')}</div>`;
  if (b.art === 'wortliste') return `<div class="blatt-wortliste">${b.woerter.map(x => `<div class="blatt-wort">${blattVokKnopf(x.de, x.stichwort)}</div>`).join('')}</div>`;
  return '';
}
async function zeigeArbeitsblatt(a, id) {
  const body = document.getElementById('actBody');
  body.innerHTML = '<p class="hint">Das Arbeitsblatt wird geladen …</p>';
  let b = null, fehler = false;
  try { [b] = await Promise.all([ladeBlatt(id), ladeBlattBilder(id)]); } catch (e) { fehler = true; }   // Bilder der Blätter erst jetzt laden
  if (currentActivityId !== id) return;
  if (!b) {
    body.innerHTML = fehler ? '<p class="hint">Keine Verbindung. Bitte gleich noch einmal versuchen.</p><button type="button" class="btn" id="blattNochmal">Nochmal laden</button>'
      : '<p class="hint">Dieses Arbeitsblatt ist noch nicht da. Sag deiner Lehrkraft Bescheid.</p>';
    const n = document.getElementById('blattNochmal'); if (n) n.addEventListener('click', () => zeigeArbeitsblatt(a, id));
    return;
  }
  let seite = 0;
  try { seite = Math.min(b.seiten.length - 1, Math.max(0, parseInt(localStorage.getItem(blattSeiteKey(id)) || '0', 10) || 0)); } catch (e) { /* egal */ }
  const zeichne = () => {
    try { localStorage.setItem(blattSeiteKey(id), String(seite)); } catch (e) { /* egal */ }
    const s = b.seiten[seite], letzte = seite === b.seiten.length - 1;
    const st = (progressCache.statusInfo || {})[id];
    const z = blattZustand(id, st, progressCache.doneTests);
    const hinweisOben = z === 'nochmal' && st.comment ? `<div class="blatt-auftrag wo-heft">${WO_SYMBOL.heft}<p><strong class="blatt-wo">Deine Lehrkraft:</strong> „${escapeHtml(st.comment)}“</p></div>` : '';
    let fertigHtml = '';
    if (letzte) fertigHtml = z === 'heft_zeigen' ? '<p class="blatt-status">✓ Du hast auf „Fertig“ getippt. Zeig dein Heft und dein Vokabelheft deiner Lehrkraft.</p>'
      : z === 'erledigt' ? '<p class="blatt-status">✓ Dieses Arbeitsblatt ist erledigt.</p>'
      : '<button type="button" class="btn ok" id="blattFertig">Fertig – ich zeige mein Heft</button>';
    body.innerHTML = `${hinweisOben}
      <div class="blatt-punkte">${b.seiten.map((_, i) => `<span class="${i === seite ? 'an' : i < seite ? 'vorbei' : ''}"></span>`).join('')}</div>
      <div class="blatt-seitenkopf">Teil ${seite + 1} von ${b.seiten.length}</div>
      <h2 class="blatt-h2">${blattInline(s.titel)}</h2>
      ${s.bloecke.map(blattBlockHtml).join('')}
      <div class="blatt-nav">
        ${seite > 0 ? '<button type="button" class="btn secondary" id="blattZurueck">← Zurück</button>' : '<span></span>'}
        ${letzte ? fertigHtml : '<button type="button" class="btn" id="blattWeiter">Weiter →</button>'}
      </div>`;
    body.querySelectorAll('.vok').forEach(v => v.addEventListener('click', () => zeigeVokabel(b, v.getAttribute('data-vok'))));
    body.querySelectorAll('.blatt-figur img').forEach(img => img.addEventListener('click', () => {   // Bild groß ansehen (Handy)
      const box = document.createElement('div'); box.id = 'bildGross';
      box.innerHTML = `<button type="button" class="vok-zu" aria-label="Schließen">×</button><img src="${img.src}" alt="">`;
      box.addEventListener('click', () => box.remove()); document.body.appendChild(box);
    }));
    const zb = document.getElementById('blattZurueck'); if (zb) zb.addEventListener('click', () => { seite--; zeichne(); window.scrollTo(0, 0); });
    const wb = document.getElementById('blattWeiter'); if (wb) wb.addEventListener('click', () => { seite++; zeichne(); window.scrollTo(0, 0); });
    const fb = document.getElementById('blattFertig'); if (fb) fb.addEventListener('click', async () => {
      fb.disabled = true;
      const st2 = { status: 'offen', heft: true, am: new Date().toISOString(), runde: ((st && st.runde) || 0) + 1 };
      try {
        const wie = await abgabeSichernUndSenden([{ key: `status:${id}:${slug(currentActivityName)}`, value: JSON.stringify(st2) }], null);
        if (progressCache.statusInfo) progressCache.statusInfo[id] = st2;
        zeichne();
      } catch (e) { fb.disabled = false; alert('Das hat nicht geklappt (keine Verbindung). Bitte noch einmal auf „Fertig“ tippen.'); }
    });
  };
  zeichne();
}

// Vokabel antippen: Englisch, einfache Erklärung und (sobald eingetragen) die eigene Sprache. Die Sprache wählt das
// Kind einmal; sie bleibt auf dem Gerät gespeichert.
const SPRACHEN = { ar: 'Arabisch', uk: 'Ukrainisch', ru: 'Russisch', tr: 'Türkisch', fa: 'Persisch', sq: 'Albanisch', bg: 'Bulgarisch', es: 'Spanisch', so: 'Somali', ti: 'Tigrinya', ku: 'Kurdisch' };
// Sprache aus der Tabelle (Spalte C, kommt bei der Anmeldung mit): Name ("Arabisch") oder Kürzel ("ar")
function merkeSprache(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return;
  const code = Object.keys(SPRACHEN).find(k => k === t || SPRACHEN[k].toLowerCase() === t);
  if (code) { try { localStorage.setItem('daz_sprache', code); } catch (e) { /* egal */ } }
}
function meineSprache() { try { return localStorage.getItem('daz_sprache') || ''; } catch (e) { return ''; } }
function zeigeVokabel(b, stichwort) {
  const v = (b.vokabeln || {})[stichwort];
  if (!v) return;
  let box = document.getElementById('vokBox');
  if (!box) { box = document.createElement('div'); box.id = 'vokBox'; document.body.appendChild(box); }
  const zeichne = () => {
    const sp = meineSprache(), ueb = sp && v.sp && v.sp[sp];
    const zweit = { uk: 'ru', ru: 'uk' }[sp], ueb2 = zweit && v.sp && v.sp[zweit];   // Ukrainisch und Russisch zusammen zeigen
    box.innerHTML = `<div class="vok-karte" role="dialog" aria-label="Vokabel">
      <button type="button" class="vok-zu" aria-label="Schließen">×</button>
      <div class="vok-wort">${escapeHtml(stichwort)}</div>${v.pl ? `<div class="vok-pl">Mehrzahl: ${escapeHtml(v.pl)}</div>` : ''}
      ${v.erkl ? `<div class="vok-zeile"><span class="vok-lab">Einfach erklärt</span>${escapeHtml(v.erkl)}</div>` : ''}
      <div class="vok-zeile"><span class="vok-lab">Englisch</span>${escapeHtml(v.en)}</div>
      <div class="vok-zeile"><span class="vok-lab">Meine Sprache <select id="vokSprache"><option value="">— wählen —</option>${Object.keys(SPRACHEN).map(k => `<option value="${k}" ${k === sp ? 'selected' : ''}>${SPRACHEN[k]}</option>`).join('')}</select></span>
        ${sp ? (ueb ? `<span dir="auto" class="vok-ueb">${escapeHtml(ueb)}</span>${ueb2 ? `<span dir="auto" class="vok-ueb2">${SPRACHEN[zweit]}: ${escapeHtml(ueb2)}</span>` : ''}<span class="vok-fehlt">Stimmt etwas nicht? Sag es deiner Lehrkraft.</span>` : '<span class="vok-fehlt">Noch keine Übersetzung — frag deine Lehrkraft.</span>') : ''}</div>
    </div>`;
    box.querySelector('.vok-zu').addEventListener('click', () => box.remove());
    box.querySelector('#vokSprache').addEventListener('change', e => { try { localStorage.setItem('daz_sprache', e.target.value); } catch (x) { /* egal */ } zeichne(); });
  };
  box.onclick = e => { if (e.target === box) box.remove(); };
  zeichne();
}

// ---------------- POSTAUSGANG: KEINE ABGABE GEHT VERLOREN (Lukas 31.10.2026: Schul-WLAN reißt oft ab) ----------------
// Jede Abgabe (Test, Grammatik-Block, „Fertig“ beim Arbeitsblatt) liegt ZUERST auf dem Gerät (localStorage) und wird dann
// gesendet. Klappt das Senden nicht, bleibt sie im Postausgang und wird automatisch nachgeschickt: sobald das Gerät wieder
// online ist, alle 20 s und bei jedem Öffnen der Seite. Derselbe Schlüssel bei jedem Versuch -> nie doppelt gespeichert.
const POSTAUSGANG = 'daz_postausgang';
function postausgang() { try { return JSON.parse(localStorage.getItem(POSTAUSGANG) || '[]') || []; } catch (e) { return []; } }
function postausgangSetzen(l) { try { localStorage.setItem(POSTAUSGANG, JSON.stringify(l)); return true; } catch (e) { return false; } }
function postausgangIds(sl) {   // Tests/Blätter dieses Kindes, die noch im Postausgang liegen
  const ids = new Set();
  postausgang().forEach(x => x.items.forEach(it => { const t = String(it.key).split(':'); if ((t[0] === 'submission' || t[0] === 'status') && t[2] === sl) ids.add(t[1]); }));
  return ids;
}
// Unter Last dauert das Senden bis zu ~14 s (Messung 12.10.2026). Liegt die Abgabe sicher auf dem Gerät, wartet das Kind
// höchstens ABGABE_WARTEN_MS; danach erscheint „Danke“ und das Senden läuft im Hintergrund weiter („wird gesendet …“).
const ABGABE_WARTEN_MS = 2500;
const unterwegs = new Set();   // Postausgang-Einträge, die gerade gesendet werden (nicht doppelt anstoßen)
async function abgabeSichernUndSenden(items, entwurfKey) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  const gemerkt = postausgangSetzen(postausgang().concat([{ id, items, entwurfKey, am: Date.now() }]));
  if (!gemerkt) {                     // Gerät kann nichts speichern (z. B. privates Fenster): wie bisher warten und melden
    await speichereVieleMitRetry(items, 3);
    if (entwurfKey) lokalLoeschen(entwurfKey);
    return 'gesendet';
  }
  unterwegs.add(id);
  const senden = speichereVieleMitRetry(items, 3).then(() => {
    postausgangSetzen(postausgang().filter(x => x.id !== id));
    if (entwurfKey) lokalLoeschen(entwurfKey);
    return 'gesendet';
  }, () => { nachsendenPlanen(20000); return 'wartet'; }).finally(() => unterwegs.delete(id));
  const ergebnis = await Promise.race([senden, new Promise(r => setTimeout(() => r('unterwegs'), ABGABE_WARTEN_MS))]);
  if (ergebnis === 'unterwegs') senden.then(w => { zeigeAbgabeHinweis(w); if (typeof renderJetztDran === 'function' && aktuelleView === 'view-start') renderJetztDran(); });
  return ergebnis;
}
let nachsendenTimer = null, nachsendenLaeuft = false;
function nachsendenPlanen(ms) { clearTimeout(nachsendenTimer); if (postausgang().length) nachsendenTimer = setTimeout(nachsenden, ms); }
async function nachsenden() {
  if (nachsendenLaeuft || typeof zugangGeprueft !== 'undefined' && !zugangGeprueft) { nachsendenPlanen(5000); return; }
  nachsendenLaeuft = true;
  let geschickt = 0;
  for (const x of postausgang()) {
    if (unterwegs.has(x.id)) continue;   // wird gerade schon gesendet
    try {
      await speichereVieleMitRetry(x.items, 1);
      postausgangSetzen(postausgang().filter(y => y.id !== x.id));
      if (x.entwurfKey) lokalLoeschen(x.entwurfKey);
      geschickt++;
    } catch (e) { break; }   // immer noch kein Netz: später weiter (Reihenfolge bleibt erhalten)
  }
  nachsendenLaeuft = false;
  if (geschickt && document.getElementById('startName').value) refreshProgress();
  else if (typeof renderJetztDran === 'function') renderJetztDran();
  nachsendenPlanen(20000);
}
window.addEventListener('online', () => nachsendenPlanen(500));
if (zugangGeprueft) nachsendenPlanen(1500); else zugangWarten.push(() => nachsendenPlanen(1500));   // nach dem Seitenstart liegengebliebene Abgaben schicken
function zeigeAbgabeHinweis(wie) {
  let el = document.getElementById('doneHinweis');
  if (!el) { el = document.createElement('p'); el.id = 'doneHinweis'; document.querySelector('#view-done .summary').appendChild(el); }
  el.className = wie === 'wartet' ? 'done-wartet' : wie === 'unterwegs' ? 'done-unterwegs' : wie === 'gesendet' && el.textContent ? 'done-angekommen' : 'hidden';
  el.textContent = wie === 'wartet' ? 'Das Internet ist gerade weg. Deine Abgabe ist sicher auf diesem Gerät gespeichert und wird automatisch gesendet, sobald das Internet wieder da ist. Öffne die Seite dafür einfach später wieder.'
    : wie === 'unterwegs' ? 'Deine Abgabe ist auf diesem Gerät gespeichert und wird gerade gesendet …'
    : wie === 'gesendet' && el.textContent ? '✓ Angekommen.' : '';
}
