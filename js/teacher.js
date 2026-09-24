/* ==========================================================================
   teacher.js — Lehrkraft-Ansicht (lehrkraft.html): PIN, Einreichungen prüfen, Freigaben,
   manuelle Freischaltung (Quereinstieg), Export.
   Geteilte Teile: shared.js, data/*.js, tests-common.js.
   ========================================================================== */

// Die Abschlusstest-Bausteine rufen updateProgress() auf; auf dieser Seite gibt es keine Fortschrittsanzeige.
function updateProgress() {}

// Alle Abgabe-Schlüssel ("submission:<testId>:<schüler>:<zeit>") in EINEM Aufruf. null = fehlgeschlagen (dann alter Weg).
async function listeAlleAbgabeKeys() {
  for (let versuch = 1; versuch <= 2; versuch++) {
    try {
      const res = await window.storage.list('submission:', true);
      if (res && Array.isArray(res.keys)) return res.keys;
    } catch (e) { /* nochmal versuchen */ }
    await new Promise(r => setTimeout(r, 400));
  }
  return null;
}

// ---------------- DASHBOARD ----------------
document.getElementById('pinSubmit').addEventListener('click', () => {
  const val = document.getElementById('pinInput').value;
  if (val === DASH_PIN) {
    document.getElementById('pinGate').classList.add('hidden');
    document.getElementById('dashContent').classList.remove('hidden');
    initDashStudentFilter();
    loadSubmissions(false);
  } else {
    document.getElementById('pinError').style.display = 'block';
  }
});
document.getElementById('refreshBtn').addEventListener('click', () => loadSubmissions(false));

function initDashStudentFilter() {
  const filterSelect = document.getElementById('dashStudentFilter');
  if (filterSelect.dataset.filled) return; // nur einmal befüllen
  fillStudentSelect(filterSelect, 'slug');
  filterSelect.dataset.filled = '1';
}
document.getElementById('dashStudentFilter').addEventListener('change', () => loadSubmissions(false));

// ---------------- FORTSCHRITT MANUELL SETZEN (Quereinstieg) ----------------
document.getElementById('toggleManualProgress').addEventListener('click', () => {
  const body = document.getElementById('manualProgressBody');
  body.classList.toggle('hidden');
});

(function initManualProgressPanel() {
  const studentSelect = document.getElementById('manualStudentSelect');
  fillStudentSelect(studentSelect);

  const stageSelect = document.getElementById('manualStageSelect');
  CURRICULUM.forEach((lf, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = lf.name;
    stageSelect.appendChild(o);
  });
  // Default: "A1-Check" (= Zugriff auf alles davor, so kann der Schüler direkt mit A2 Lernfeld 1 starten)
  stageSelect.value = stageIndexById('a1_check');
})();

document.getElementById('manualProgressBtn').addEventListener('click', async () => {
  const name = document.getElementById('manualStudentSelect').value;
  const stageIdx = parseInt(document.getElementById('manualStageSelect').value, 10);
  const resultEl = document.getElementById('manualProgressResult');
  resultEl.className = '';
  resultEl.textContent = '';

  if (!name) {
    resultEl.className = 'err';
    resultEl.textContent = 'Bitte einen Schüler auswählen.';
    return;
  }

  const sl = slug(name);
  const btn = document.getElementById('manualProgressBtn');
  btn.disabled = true;
  btn.textContent = 'Schalte frei …';

  try {
    const key = `manualaccess:${sl}`;
    // Stage-ID ist maßgeblich (bleibt richtig, auch wenn später Lernfelder eingefügt werden); der Index bleibt nur zur Info.
    const value = JSON.stringify({ uptoStageId: CURRICULUM[stageIdx].id, uptoStageIndex: stageIdx, timestamp: new Date().toISOString() });
    await window.storage.set(key, value, true);
    // Sofort zur Kontrolle zurücklesen, damit wir sicher wissen, dass es wirklich gespeichert wurde
    const check = await window.storage.get(key, true);
    if (!check || check.value !== value) {
      throw new Error('Speichern konnte nicht bestätigt werden (beim Rücklesen kam etwas anderes zurück).');
    }
    resultEl.className = 'ok';
    resultEl.textContent = `✓ Fertig und bestätigt! ${name} hat jetzt Zugriff auf alles bis einschließlich „${CURRICULUM[stageIdx].name}" — nichts davon ist als erledigt markiert.`;
  } catch (e) {
    resultEl.className = 'err';
    resultEl.textContent = 'Fehler beim Speichern: ' + (e && e.message ? e.message : 'unbekannter Fehler') + '. Bitte nochmal versuchen.';
  }
  btn.disabled = false;
  btn.textContent = 'Zugriff freischalten';
});

// Kein Zeit-Intervall mehr (störte beim Lesen) — nur noch aktualisieren, wenn man den Tab/das Fenster wieder aktiviert
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !document.getElementById('dashContent').classList.contains('hidden')) {
    loadSubmissions(true);
  }
});

let lastLoadedSubmissions = [];

// Ordnet jedem Eingangstest-Bereich das passende A1-Lernfeld + die konkreten Schritte zu,
// damit die Lehrkraft direkt weiß, was der Schüler im Original-Material wiederholen sollte.
const BEREICH_LERNPFAD = {
  "Begrüßung & Personalpronomen": { lernfeld: "A1.2 Begrüßung", schritte: ["Schritt 1: Hallo!", "Schritt 2: Wie heißt du?"] },
  "Zahlen, Alter & Telefonnummer": { lernfeld: "A1.2 Begrüßung", schritte: ["Schritt 3: Wie alt bist du?", "Spiel: Zahlen-Memory"] },
  "Familie & Possessivartikel": { lernfeld: "A1.3 Personen", schritte: ["Schritt 1: Wo wohnst du?", "Schritt 2: Wie geht es dir?", "Schritt 5: Meine Familie"] },
  "Zeit (Uhr, Wochentage, Monate)": { lernfeld: "A1.4 Zahlen und Zeiten", schritte: ["Schritt 1: Tageszeiten", "Schritt 3: Was machst du morgen?", "Schritt 5: Wie spät ist es?", "Schritt 7: Welcher Tag ist heute?"] },
  "Schule, Farben & Adjektive": { lernfeld: "A1.5 Schule", schritte: ["Schritt 1: Meine Schule", "Schritt 2: Was ist das?"] },
};

// Baut einen Abschlusstest EINMALIG unsichtbar im Hintergrund auf (in #abschlussBody, das während
// der Dashboard-Ansicht versteckt ist), nur um die vollständige Feld-Beschreibung (fieldMeta mit
// Labels) zu bekommen — ohne dass die Test-Ansicht selbst sichtbar wird. So lassen sich auch alte
// Einreichungen, die noch vor der Detail-Funktion gemacht wurden, nachträglich aufschlüsseln,
// solange die rohen Antworten (felderAntworten) bereits gespeichert waren.
function rekonstruiereFelderDetails(sub) {
  const t = TESTS[sub.testId];
  if (!t || !sub.felderAntworten) return [];
  const gespeicherterAbschlussState = abschlussState;
  try {
    if (!ABSCHLUSS_BUILDER[t.type]) return [];
    ABSCHLUSS_BUILDER[t.type](t);

    const fieldMeta = abschlussState.fieldMeta || [];
    const felderDetails = [];
    fieldMeta.forEach(meta => {
      const gegebenerWert = sub.felderAntworten[meta.key];
      if (gegebenerWert === undefined) return;
      const vollerWert = (meta.stem || '') + gegebenerWert;
      let korrektAntwortAnzeige = meta.acceptable;
      if (Array.isArray(korrektAntwortAnzeige)) korrektAntwortAnzeige = korrektAntwortAnzeige.join(' / ');
      let korrekt = null;
      if (meta.acceptable !== undefined) {
        korrekt = pruefeFeld(meta, vollerWert); // berücksichtigt auch "exakt" (Groß-/Kleinschreibung)
      }
      felderDetails.push({ frage: meta.label || meta.key, antwort: vollerWert, korrekt, korrektAntwort: korrektAntwortAnzeige });
    });
    return felderDetails;
  } catch (e) {
    return [];
  } finally {
    abschlussState = gespeicherterAbschlussState;
  }
}

function generiereLernbericht(bereichsErgebnisse) {
  if (!bereichsErgebnisse) return '';
  const offen = bereichsErgebnisse.filter(b => !b.bestanden);
  if (!offen.length) {
    return `<div class="lernbericht ok"><strong>✓ Alle Bereiche bestanden.</strong> A1 sitzt — bereit für A2.</div>`;
  }
  const zeilen = offen.map(b => {
    const pfad = BEREICH_LERNPFAD[b.name];
    const themen = (b.details || []).filter(d => !d.richtig && !d.manuellUeberschrieben).map(d => d.frage);
    return `
      <div class="lernbericht-zeile">
        <div class="lernbericht-bereich">${escapeHtml(b.name)} — ${b.prozent}%</div>
        ${pfad ? `<div class="lernbericht-empfehlung">→ Wiederholen: <strong>${escapeHtml(pfad.lernfeld)}</strong>, ${pfad.schritte.map(escapeHtml).join(' · ')}</div>` : ''}
      </div>`;
  }).join('');
  return `<div class="lernbericht">
    <div class="lernbericht-titel">📋 Empfehlung vor der Wiederholung</div>
    ${zeilen}
  </div>`;
}

async function loadSubmissions(isBackgroundRefresh) {
  const listEl = document.getElementById('submissionList');
  const scrollY = window.scrollY;

  const filterVal = document.getElementById('dashStudentFilter').value;
  if (!filterVal) {
    listEl.innerHTML = '<p class="empty-state">Wähle oben einen Schüler aus, um seine Ergebnisse zu sehen.</p>';
    document.getElementById('lastUpdated').textContent = 'Aktualisiert: ' + new Date().toLocaleTimeString('de-DE');
    return;
  }

  if (!isBackgroundRefresh) listEl.innerHTML = '<p class="empty-state">Lade …</p>';

  // Gezielt NUR die Einreichungen dieses einen Schülers abfragen (ein kleiner list()-Aufruf pro Test,
  // statt eines einzigen riesigen list()-Aufrufs über ALLE Schüler und ALLE Tests hinweg).
  // Das vermeidet "Unexpected response type"-Fehler, die bei sehr vielen Einträgen auf einmal auftreten können.
  const alleTestIds = alleAbgabeIds(); // echte Tests + Grammatikblöcke, die ebenfalls abgeben
  let keys = [];
  let fehlerAnzahl = 0;
  const MAX_VERSUCHE = 2;

  async function listeMitRetry(prefix) {
    for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
      try {
        const res = await window.storage.list(prefix, true);
        return (res && Array.isArray(res.keys)) ? res.keys : [];
      } catch (e) {
        if (versuch === MAX_VERSUCHE) { fehlerAnzahl++; return []; }
        await new Promise(r => setTimeout(r, 400));
      }
    }
    return [];
  }

  // In kleinen Gruppen abfragen statt alle ~30 Testarten auf einmal parallel — das überlastet bei
  // gleichzeitiger Nutzung durch mehrere Schüler:innen sonst leicht das gemeinsame Speicherlimit
  // ("Message rate limit exceeded").
  // NEU: erst EINE Abfrage für alle Abgaben-Schlüssel (schnell, unabhängig von der Zahl der Tests).
  // Nur wenn die scheitert, gilt der alte Weg (eine kleine Abfrage pro Test).
  const alleKeys = await listeAlleAbgabeKeys();
  if (alleKeys) {
    const erlaubt = new Set(alleTestIds);
    keys = alleKeys.filter(k => { const p = k.split(':'); return p[2] === filterVal && erlaubt.has(p[1]); });
  } else {
    const LISTE_GRUPPENGROESSE = 5;
    for (let i = 0; i < alleTestIds.length; i += LISTE_GRUPPENGROESSE) {
      const gruppe = alleTestIds.slice(i, i + LISTE_GRUPPENGROESSE);
      const gruppenKeys = await Promise.all(gruppe.map(tid => listeMitRetry(`submission:${tid}:${filterVal}:`)));
      gruppenKeys.forEach(ks => { keys = keys.concat(ks); });
    }
  }

  if (fehlerAnzahl > 0 && !keys.length) {
    listEl.innerHTML = `
      <p class="empty-state" style="color:var(--bad);">Konnte Einreichungen nicht laden (mehrere Teilabfragen fehlgeschlagen).<br>
      <span style="font-size:12.5px; color:var(--ink-soft);">${fehlerAnzahl} von ${alleTestIds.length} Teilabfragen betroffen.</span></p>
      <button class="btn secondary small" id="retryLoadBtn" style="margin-top:8px;">Nochmal versuchen</button>
    `;
    const retryBtn = document.getElementById('retryLoadBtn');
    if (retryBtn) retryBtn.addEventListener('click', () => loadSubmissions(false));
    return;
  }

  if (!keys.length) {
    listEl.innerHTML = '<p class="empty-state">Noch keine Einreichungen von diesem Schüler.</p>';
    document.getElementById('lastUpdated').textContent = 'Aktualisiert: ' + new Date().toLocaleTimeString('de-DE');
    return;
  }

  const submissions = [];
  const submissionResults = await Promise.allSettled(keys.map(k => window.storage.get(k, true)));
  submissionResults.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value && res.value.value) {
      try { submissions.push({ _key: keys[i], ...JSON.parse(res.value.value) }); } catch (e) { /* korrupter Eintrag, überspringen */ }
    }
  });
  submissions.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Lehrkraft-Freigabestatus für diese Einreichungen laden (parallel)
  const statusKeys = submissions.map(sub => `status:${sub.testId}:${slug(sub.name)}`);
  const statusResults = await Promise.allSettled(statusKeys.map(k => window.storage.get(k, true)));
  const gefiltert = submissions.map((sub, i) => {
    let sObj = { status: 'offen' };
    const res = statusResults[i];
    if (res.status === 'fulfilled' && res.value && res.value.value) {
      try { sObj = JSON.parse(res.value.value); } catch (e) { /* offen */ }
    }
    return { ...sub, lehrkraftStatus: sObj.status, lehrkraftKommentar: sObj.comment || '', bewertetAm: sObj.reviewedAt || null };
  });
  lastLoadedSubmissions = gefiltert; // für Export DIESES Schülers (Export lädt bei Bedarf zusätzlich alle anderen)

  listEl.innerHTML = '';
  for (const sub of gefiltert) {
    // Status wurde bereits oben für alle Einreichungen geladen (enrichedAll) — kein erneuter Einzelabruf nötig.
    const statusObj = { status: sub.lehrkraftStatus || 'offen', comment: sub.lehrkraftKommentar || '', reviewedAt: sub.bewertetAm };
    const statusKey = `status:${sub.testId}:${slug(sub.name)}`;

    const div = document.createElement('div');
    div.className = 'submission';
    const dt = new Date(sub.timestamp);
    const dateStr = dt.toLocaleDateString('de-DE') + ' ' + dt.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});

    let teil3Html = '';
    (sub.teil3 || []).forEach((s3, i) => {
      const urteil = s3.korrekt === true ? '<span class="urteil good">✓ Richtig</span>' : s3.korrekt === false ? '<span class="urteil bad">✗ Falsch</span>' : '<span class="urteil">— noch nicht bewertet</span>';
      teil3Html += `
        <div class="satzblock">
          <div class="vokabel">${escapeHtml(s3.word)}</div>
          <div class="satztext">„${escapeHtml(s3.satz)}"</div>
          ${urteil}
          ${s3.feedback ? `<div class="kifeedback">${escapeHtml(s3.feedback)}</div>` : ''}
          ${s3.verbesserung ? `<div class="verbesserung">Vorschlag: ${escapeHtml(s3.verbesserung)}</div>` : ''}
          <div style="margin-top:6px; display:flex; gap:6px;">
            <button class="btn small ${s3.korrekt === true ? 'ok' : 'secondary'} teil3-marker-btn" data-i="${i}" data-wert="true">✓ Richtig</button>
            <button class="btn small ${s3.korrekt === false ? 'danger' : 'secondary'} teil3-marker-btn" data-i="${i}" data-wert="false">✗ Falsch</button>
          </div>
        </div>`;
    });

    let teilDetailsHtml = '';
    // Falls die Einreichung noch keine gespeicherten Details hat (ältere Einreichung, von vor
    // dieser Funktion), aber die rohen Antworten vorhanden sind, jetzt nachträglich rekonstruieren.
    const felderDetailsEffektiv = (sub.felderDetails && sub.felderDetails.length)
      ? sub.felderDetails
      : rekonstruiereFelderDetails(sub);

    [...(sub.teilDetails || []), ...felderDetailsEffektiv].forEach((d, di) => {
      let status = 'correct';
      if (d.korrekt === null || d.korrekt === undefined) {
        status = 'ungeprueft';
      } else if (!d.korrekt) {
        const optionen = (d.korrektAntwort || '').toString().split(' / ').map(s => s.trim()).filter(Boolean);
        status = istWahrscheinlichTippfehler(d.antwort, optionen.length ? optionen : d.korrektAntwort) ? 'typo' : 'wrong';
      }
      if (status === 'correct') {
        teilDetailsHtml += `<div class="antwortzeile antwort-correct">✓ ${escapeHtml(d.frage)} — „${escapeHtml(d.antwort)}"</div>`;
      } else if (status === 'typo') {
        teilDetailsHtml += `<div class="antwortzeile antwort-typo">⚠ ${escapeHtml(d.frage)} — Antwort: „${escapeHtml(d.antwort)}", richtig wäre: „${escapeHtml(d.korrektAntwort)}" <em>(evtl. nur Tippfehler)</em></div>`;
      } else if (status === 'ungeprueft') {
        teilDetailsHtml += `<div class="antwortzeile">— ${escapeHtml(d.frage)} — „${escapeHtml(d.antwort)}" (nicht automatisch geprüft)</div>`;
      } else {
        teilDetailsHtml += `<div class="antwortzeile antwort-wrong">✗ ${escapeHtml(d.frage)} — Antwort: „${escapeHtml(d.antwort)}", richtig wäre: „${escapeHtml(d.korrektAntwort)}"</div>`;
      }
    });

    let bereicheHtml = '';
    (sub.bereichsErgebnisse || []).forEach((b, bi) => {
      const cls = b.bestanden ? 'good' : 'bad';
      // Live nachrechnen (wichtig für ältere Einreichungen, die das Tippfehler-Flag noch nicht gespeichert hatten)
      const bewertet = (b.details || []).map(d => {
        let status = 'wrong';
        if (d.manuellUeberschrieben) status = 'overridden';
        else if (d.richtig) status = 'correct';
        else {
          const optionen = (d.korrekt || '').split(' / ').map(s => s.trim()).filter(Boolean);
          const tippfehler = d.moeglicherTippfehler || istWahrscheinlichTippfehler(d.antwort, optionen.length ? optionen : d.korrekt);
          status = tippfehler ? 'typo' : 'wrong';
        }
        return { ...d, status };
      });
      const tippfehlerCount = bewertet.filter(d => d.status === 'typo').length;
      bereicheHtml += `
        <div class="satzblock">
          <div class="vokabel">${escapeHtml(b.name)} <span class="urteil ${cls}">${b.prozent}% (${b.richtig}/${b.gesamt}) ${b.bestanden ? '✓' : '✗'}</span>
          ${tippfehlerCount ? `<span class="urteil tippfehler">${tippfehlerCount}× evtl. nur Tippfehler</span>` : ''}</div>
          ${bewertet.map((d, di) => {
            if (d.status === 'correct') {
              return `<div class="antwortzeile antwort-correct">✓ ${escapeHtml(d.frage)} — „${escapeHtml(d.antwort)}"</div>`;
            }
            if (d.status === 'overridden') {
              return `<div class="antwortzeile antwort-correct">✓ ${escapeHtml(d.frage)} — „${escapeHtml(d.antwort)}" <em>(von dir als richtig gewertet)</em></div>`;
            }
            if (d.status === 'typo') {
              return `<div class="antwortzeile antwort-typo">⚠ ${escapeHtml(d.frage)} — Antwort: „${escapeHtml(d.antwort)}", richtig wäre: „${escapeHtml(d.korrekt)}" <em>(evtl. nur Tippfehler)</em>
                <button class="btn small ok override-btn" data-bi="${bi}" data-di="${di}" style="margin-left:8px; padding:3px 10px; font-size:12px;">Als richtig werten</button></div>`;
            }
            return `<div class="antwortzeile antwort-wrong">✗ ${escapeHtml(d.frage)} — Antwort: „${escapeHtml(d.antwort)}", richtig wäre: „${escapeHtml(d.korrekt)}"</div>`;
          }).join('')}
        </div>`;
    });

    const berichtHtml = generiereLernbericht(sub.bereichsErgebnisse);

    // Auswahl, welche Teile/Punkte bei "Wiederholen nötig" erneut abgefragt werden sollen — der
    // Rest wird beim nächsten Öffnen aus dieser Einreichung vorausgefüllt und nicht nochmal verlangt.
    // Bei normalen Vokabeltests sind das die Teile 1–4, bei Grammatikblöcken die Erklärungspunkte 1–9.
    const testDef = TESTS[sub.testId];
    const grammatikDef = (ACTIVITIES[sub.testId] && ACTIVITIES[sub.testId].type === 'grammatikblock') ? ACTIVITIES[sub.testId] : null;
    const teilLabels = { teil1: 'Teil 1', teil2: 'Teil 2', teil3: 'Teil 3', teil4: 'Teil 4' };
    const wiederholenOptionen = grammatikDef
      ? grammatikDef.punkte.map(p => p.nr)
      : (!sub.bereichsErgebnisse && testDef) ? ['teil1','teil2','teil3','teil4'].filter(tn => testDef[tn] && testDef[tn].length) : [];
    const wiederholenFeldName = grammatikDef ? 'punkteWiederholen' : 'wiederholenTeile';
    const wiederholenLabel = opt => grammatikDef ? `Punkt ${opt}` : teilLabels[opt];
    const vorherigeAuswahl = new Set(Array.isArray(statusObj[wiederholenFeldName]) && statusObj[wiederholenFeldName].length ? statusObj[wiederholenFeldName] : wiederholenOptionen);
    const teilCheckboxenHtml = wiederholenOptionen.length > 1 ? `
      <div class="teil-wiederholen-auswahl" style="margin-top:10px; font-size:13.5px; color:var(--ink-soft);">
        Bei „Wiederholen nötig" nur diese ${grammatikDef ? 'Punkte' : 'Teile'} erneut abfragen:
        <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:6px;">
          ${wiederholenOptionen.map(opt => `<label style="display:flex; align-items:center; gap:5px; cursor:pointer; font-weight:400;">
            <input type="checkbox" class="teil-wiederholen-cb" value="${opt}" ${vorherigeAuswahl.has(opt) ? 'checked' : ''}> ${wiederholenLabel(opt)}
          </label>`).join('')}
        </div>
      </div>` : '';

    div.innerHTML = `
      <div class="head">
        <h3>${escapeHtml(sub.name)}</h3>
        <span class="meta">${escapeHtml(sub.testTitle)} · ${dateStr}</span>
      </div>
      <span class="status-tag ${statusObj.status}">${statusObj.status === 'wiederholen' ? 'Wiederholen nötig' : statusObj.status === 'weiter' ? 'Kann weitermachen' : 'Noch nicht bewertet'}</span>
      ${sub.bereichsErgebnisse ? `<div class="autoscore">${sub.autoCorrect} von ${sub.autoTotal} Bereichen mit ≥85% bestanden</div>${berichtHtml}${bereicheHtml}` : `<div class="autoscore">${(sub.isPunkteTest || sub.isGrammatikblock) ? 'Automatisch ausgewertet' : 'Teil 1/2/4 automatisch ausgewertet'}: <strong>${sub.autoCorrect} / ${sub.autoTotal}</strong> ${sub.isPunkteTest ? 'Punkte' : 'richtig'}</div>${teilDetailsHtml}${teil3Html}`}
      <textarea class="comment-input" placeholder="Kommentar für den Schüler (optional)">${escapeHtml(statusObj.comment || '')}</textarea>
      ${teilCheckboxenHtml}
      <div class="status-controls">
        <button class="btn ok small status-ok-btn">Kann weitermachen</button>
        <button class="btn danger small status-danger-btn">Wiederholen nötig</button>
      </div>
    `;

    const commentInput = div.querySelector('.comment-input');
    div.querySelector('.status-ok-btn').addEventListener('click', async () => {
      await window.storage.set(statusKey, JSON.stringify({ status: 'weiter', comment: commentInput.value.trim(), reviewedAt: new Date().toISOString() }), true);
      loadSubmissions(false);
    });
    div.querySelector('.status-danger-btn').addEventListener('click', async () => {
      const angehakt = [...div.querySelectorAll('.teil-wiederholen-cb:checked')].map(cb => cb.value);
      const payload = { status: 'wiederholen', comment: commentInput.value.trim(), reviewedAt: new Date().toISOString() };
      // Nur speichern, wenn NICHT alle vorhandenen Teile/Punkte angehakt sind — sonst ist es eine
      // normale volle Wiederholung (bestehendes Verhalten, kein Vorausfüllen nötig).
      if (wiederholenOptionen.length > 1 && angehakt.length && angehakt.length < wiederholenOptionen.length) {
        payload[wiederholenFeldName] = grammatikDef ? angehakt.map(Number) : angehakt;
      }
      await window.storage.set(statusKey, JSON.stringify(payload), true);
      loadSubmissions(false);
    });

    div.querySelectorAll('.override-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bi = parseInt(btn.getAttribute('data-bi'), 10);
        const di = parseInt(btn.getAttribute('data-di'), 10);
        const { _key, lehrkraftStatus, lehrkraftKommentar, bewertetAm, ...subOhneKey } = sub;
        const bereich = subOhneKey.bereichsErgebnisse[bi];
        const detail = bereich.details[di];
        if (detail.richtig) return; // schon korrekt
        detail.richtig = true;
        detail.manuellUeberschrieben = true;
        bereich.richtig = bereich.details.filter(d => d.richtig).length;
        bereich.prozent = Math.round((bereich.richtig / bereich.gesamt) * 100);
        bereich.bestanden = bereich.prozent >= 85;
        subOhneKey.autoCorrect = subOhneKey.bereichsErgebnisse.filter(b => b.bestanden).length;
        btn.disabled = true;
        btn.textContent = 'Gespeichert ✓';
        try {
          await window.storage.set(_key, JSON.stringify(subOhneKey), true);
        } catch (e) { /* Speicher nicht verfügbar */ }
        setTimeout(() => loadSubmissions(true), 400);
      });
    });

    div.querySelectorAll('.teil3-marker-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const i = parseInt(btn.getAttribute('data-i'), 10);
        const neuerWert = btn.getAttribute('data-wert') === 'true';
        const { _key, lehrkraftStatus, lehrkraftKommentar, bewertetAm, ...subOhneKey } = sub;
        if (!subOhneKey.teil3 || !subOhneKey.teil3[i]) return;
        if (subOhneKey.teil3[i].korrekt === neuerWert) return; // schon so markiert
        subOhneKey.teil3[i].korrekt = neuerWert;
        div.querySelectorAll(`.teil3-marker-btn[data-i="${i}"]`).forEach(b => b.disabled = true);
        try {
          await window.storage.set(_key, JSON.stringify(subOhneKey), true);
        } catch (e) { /* Speicher nicht verfügbar */ }
        setTimeout(() => loadSubmissions(true), 300);
      });
    });

    listEl.appendChild(div);
  }
  document.getElementById('lastUpdated').textContent = 'Zuletzt aktualisiert: ' + new Date().toLocaleTimeString('de-DE');
  if (isBackgroundRefresh) window.scrollTo(0, scrollY);
}

async function sammleAlleEinreichungenFuerExport(fortschrittCallback) {
  const alleTestIds = alleAbgabeIds(); // echte Tests + Grammatikblöcke, die ebenfalls abgeben
  const alleSchuelerSlugs = STUDENTS.map(n => slug(n));

  const alle = [];
  // NEU: EINE Abfrage für alle Schlüssel, danach je Schüler nur noch filtern (statt Schüler × Tests Einzelabfragen).
  const alleKeys = await listeAlleAbgabeKeys();
  const erlaubteIds = new Set(alleTestIds);
  // In kleinen Gruppen (nicht alle 16 Schüler gleichzeitig), um die Speicherfunktion nicht zu überlasten
  const GRUPPENGROESSE = 4;
  for (let i = 0; i < alleSchuelerSlugs.length; i += GRUPPENGROESSE) {
    const gruppe = alleSchuelerSlugs.slice(i, i + GRUPPENGROESSE);
    if (fortschrittCallback) fortschrittCallback(i, alleSchuelerSlugs.length);
    const gruppenErgebnisse = await Promise.all(gruppe.map(async (sl) => {
      if (alleKeys) return alleKeys.filter(k => { const p = k.split(':'); return p[2] === sl && erlaubteIds.has(p[1]); });
      const perTest = await Promise.all(alleTestIds.map(async (tid) => {
        try {
          const res = await window.storage.list(`submission:${tid}:${sl}:`, true);
          return (res && Array.isArray(res.keys)) ? res.keys : [];
        } catch (e) { return []; }
      }));
      return perTest.flat();
    }));
    const gruppenKeys = gruppenErgebnisse.flat();
    if (gruppenKeys.length) {
      const werte = await Promise.allSettled(gruppenKeys.map(k => window.storage.get(k, true)));
      werte.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value && res.value.value) {
          try { alle.push({ _key: gruppenKeys[idx], ...JSON.parse(res.value.value) }); } catch (e) { /* skip */ }
        }
      });
    }
  }

  // Lehrkraft-Status für alle gefundenen Einreichungen ergänzen
  const statusResults = await Promise.allSettled(alle.map(sub => window.storage.get(`status:${sub.testId}:${slug(sub.name)}`, true)));
  return alle.map((sub, i) => {
    let sObj = { status: 'offen' };
    const res = statusResults[i];
    if (res.status === 'fulfilled' && res.value && res.value.value) {
      try { sObj = JSON.parse(res.value.value); } catch (e) { /* offen */ }
    }
    return { ...sub, lehrkraftStatus: sObj.status, lehrkraftKommentar: sObj.comment || '', bewertetAm: sObj.reviewedAt || null };
  });
}

document.getElementById('exportBtn').addEventListener('click', async () => {
  const btn = document.getElementById('exportBtn');
  btn.disabled = true;
  const originalText = btn.textContent;

  let alleEinreichungen;
  try {
    alleEinreichungen = await sammleAlleEinreichungenFuerExport((done, total) => {
      btn.textContent = `Sammle Daten … (${done}/${total} Schüler)`;
    });
  } catch (e) {
    document.getElementById('exportMeldung').innerHTML = `<p style="color:var(--bad);">Fehler beim Sammeln der Einreichungen: ${escapeHtml(e.message || 'unbekannt')}</p>`;
    btn.disabled = false;
    btn.textContent = originalText;
    return;
  }
  btn.disabled = false;
  btn.textContent = originalText;

  if (!alleEinreichungen.length) {
    document.getElementById('exportMeldung').innerHTML = `<p style="color:var(--ink-soft);">Keine Einreichungen gefunden.</p>`;
    return;
  }

  let letzterExport = null;
  try {
    const res = await window.storage.get('export:letzterZeitstempel', true);
    if (res && res.value) letzterExport = JSON.parse(res.value).zeitstempel;
  } catch (e) { /* noch nie exportiert */ }

  const neueEinreichungen = letzterExport
    ? alleEinreichungen.filter(s => new Date(s.timestamp) > new Date(letzterExport))
    : alleEinreichungen;

  if (!neueEinreichungen.length) {
    document.getElementById('exportMeldung').innerHTML = `<p style="color:var(--ink-soft);">Keine neuen Ergebnisse seit dem letzten Export. Die Datei wäre leer.</p>`;
    return;
  }
  document.getElementById('exportMeldung').innerHTML = '';

  const payload = {
    exportiertAm: new Date().toISOString(),
    seitLetztemExport: letzterExport || '(erster Export)',
    anzahlNeueEinreichungen: neueEinreichungen.length,
    einreichungen: neueEinreichungen,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `DaZ_Testergebnisse_NEU_${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Zeitpunkt merken, damit der NÄCHSTE Export nur noch danach kommende Ergebnisse enthält
  const neuesterZeitstempel = neueEinreichungen.reduce((max, s) => new Date(s.timestamp) > new Date(max) ? s.timestamp : max, neueEinreichungen[0].timestamp);
  try {
    await window.storage.set('export:letzterZeitstempel', JSON.stringify({ zeitstempel: neuesterZeitstempel }), true);
  } catch (e) { /* Speicher nicht verfügbar */ }
});

let resetExportBestaetigungAusstehend = false;
document.getElementById('resetExportMarker').addEventListener('click', async () => {
  const link = document.getElementById('resetExportMarker');
  if (!resetExportBestaetigungAusstehend) {
    resetExportBestaetigungAusstehend = true;
    link.textContent = 'Wirklich? Nochmal klicken (setzt zurück auf: alles beim nächsten Export)';
    link.style.color = 'var(--bad)';
    setTimeout(() => {
      if (resetExportBestaetigungAusstehend) {
        resetExportBestaetigungAusstehend = false;
        link.textContent = 'Export-Zähler zurücksetzen';
        link.style.color = '';
      }
    }, 4000);
    return;
  }
  resetExportBestaetigungAusstehend = false;
  try {
    await window.storage.delete('export:letzterZeitstempel', true);
    link.textContent = '✓ Zurückgesetzt — nächster Export enthält wieder alles';
    link.style.color = 'var(--good)';
    setTimeout(() => { link.textContent = 'Export-Zähler zurücksetzen'; link.style.color = ''; }, 3000);
  } catch (e) {
    link.textContent = 'Fehler beim Zurücksetzen — nochmal versuchen';
    link.style.color = 'var(--bad)';
  }
});
