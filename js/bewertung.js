/* ==========================================================================
   bewertung.js — Lehrkraft-Ansicht: Antworten prüfen und bewerten

   * Jede Antwort hat einen Schalter ✓ / ✗. Voreingestellt ist das automatische Ergebnis; du kannst es überschreiben.
   * Abschlusstests: Punkte → Note (Sockel-Prinzip, siehe shared.js). Unter jedem Teil steht „Teil wiederholen lassen“.
   * Vokabeltests / Grammatikblöcke: keine Note; „korrigiert“ (Schüler schreibt falsche Antworten auf Papier neu)
     oder „Wiederholen nötig“ (digital, ausgewählte Teile).
   * Deine Schalter werden sofort als ENTWURF gespeichert (reviewdraft:…). Erst „Bewertung abschließen“ macht das Ergebnis
     für den Schüler sichtbar (review:… und status:…). Gilt auch rückwirkend für bereits eingereichte Tests.
   ========================================================================== */

function abgabeTs(sub) { return String(sub._key).split(':')[3]; }
function draftKeyFuer(sub) { return `reviewdraft:${sub.testId}:${slug(sub.name)}:${abgabeTs(sub)}`; }
function reviewKeyFuer(sub) { return `review:${sub.testId}:${slug(sub.name)}:${abgabeTs(sub)}`; }

// Baut den Abschlusstest unsichtbar auf und liefert Feld-Beschreibung + Teile (Teil = Abschnitt mit Überschrift)
function abschlussMetaFuer(testId) {
  const t = TESTS[testId];
  if (!t || !ABSCHLUSS_BUILDER[t.type]) return null;
  const gespeichert = abschlussState;
  try {
    abschlussState = { punkte: 0, felderGesamt: 0, felderBeantwortet: 0 };
    ABSCHLUSS_BUILDER[t.type](t);
    const info = abschlussTeileInfo();
    return { fieldMeta: abschlussState.fieldMeta || [], teile: info.teile, keyTeil: info.keyTeil };
  } catch (e) { return null; } finally { abschlussState = gespeichert; }
}

const runde2 = x => Math.round(x * 100) / 100;

// Bereitet eine Abgabe zur Bewertung auf: Einzelantworten (items), Teile, Punktgewichte
function analysiereAbgabe(sub) {
  const t = TESTS[sub.testId];
  const A = { art: 'vokabel', items: [], teile: [] };

  if (sub.isPunkteTest) {
    A.art = 'abschluss';
    const meta = abschlussMetaFuer(sub.testId);
    const details = (sub.felderDetails && sub.felderDetails.length) ? sub.felderDetails : rekonstruiereFelderDetails(sub);
    const metaByKey = {};
    if (meta) meta.fieldMeta.forEach(m => { metaByKey[m.key] = m; });
    let keys = details.map(d => d.key);
    if (keys.some(k => !k) && meta && sub.felderAntworten) {   // ältere Abgaben: Schlüssel über die Reihenfolge zuordnen
      const beantwortet = meta.fieldMeta.filter(m => sub.felderAntworten[m.key] !== undefined).map(m => m.key);
      if (beantwortet.length === details.length) keys = beantwortet;
    }
    if (meta && meta.teile.length) {
      A.teile = meta.teile.map(x => ({ id: 't' + x.nr, nr: x.nr, titel: `Teil ${x.nr}${x.titel ? ' — ' + x.titel : ''}`, max: 0 }));
      meta.fieldMeta.forEach(m => { const tt = A.teile.find(x => x.nr === meta.keyTeil[m.key]); if (tt) tt.max += m.points; });
      A.hatGewichtung = true;
    } else {
      A.teile = [{ id: 't0', nr: 0, titel: 'Alle Aufgaben', max: 0 }];
    }
    details.forEach((d, i) => {
      const key = keys[i];
      const m = key ? metaByKey[key] : null;
      const teilId = (m && meta) ? 't' + meta.keyTeil[key] : A.teile[0].id;
      A.items.push({ id: 'd' + i, key, teil: teilId, frage: d.frage, antwort: d.antwort, auto: d.korrekt === undefined ? null : d.korrekt,
        korrektAntwort: d.korrektAntwort, punkte: (d.punkte != null ? d.punkte : (m ? m.points : 1)), manuell: m ? !!m.manuell : d.korrekt === null });
    });
    if (!A.hatGewichtung) A.teile[0].max = A.items.reduce((s, it) => s + it.punkte, 0);
    A.max = runde2(A.teile.reduce((s, x) => s + x.max, 0));
    return A;
  }

  if (sub.isGrammatikblock) {
    A.art = 'grammatik';
    const def = ACTIVITIES[sub.testId];
    const nrs = [];
    (sub.teilDetails || []).forEach(d => { if (nrs.indexOf(d.punktNr) < 0) nrs.push(d.punktNr); });
    A.teile = nrs.map(nr => { const p = def && def.punkte ? def.punkte.find(x => x.nr === nr) : null; return { id: 'p' + nr, nr, titel: `Punkt ${nr}${p && p.titel ? ' — ' + p.titel : ''}` }; });
    (sub.teilDetails || []).forEach((d, i) => {
      A.items.push({ id: 'd' + i, teil: 'p' + d.punktNr, frage: d.frage, antwort: d.antwort, auto: d.korrekt === undefined ? null : d.korrekt, korrektAntwort: d.korrektAntwort, punkte: 1 });
    });
    return A;
  }

  // Vokabeltest: Teil 1 / 2 / 3 (Sätze) / 4
  const teilTitel = {
    teil1: 'Teil 1 — Bildzuordnung', teil2: 'Teil 2 — Lücken füllen', teil3: 'Teil 3 — Eigene Sätze',
    teil4: 'Teil 4' + (t && t.teil4Label ? ' — ' + t.teil4Label : ' — Gegenteile'),
  };
  const teilVon = d => d.teil || (String(d.frage).indexOf('Bildzuordnung') === 0 ? 'teil1' : String(d.frage).indexOf('___') >= 0 ? 'teil2' : 'teil4');
  (sub.teilDetails || []).forEach((d, i) => {
    A.items.push({ id: 'd' + i, teil: teilVon(d), frage: d.frage, antwort: d.antwort, auto: d.korrekt === undefined ? null : d.korrekt, korrektAntwort: d.korrektAntwort, punkte: 1 });
  });
  (sub.teil3 || []).forEach((s, i) => {
    A.items.push({ id: 's' + i, teil: 'teil3', satz: true, frage: s.word + (s.pronomen ? ' (' + s.pronomen + ' …)' : ''), antwort: s.satz,
      auto: s.korrekt === undefined ? null : s.korrekt, korrektAntwort: s.verbesserung || '', feedback: s.feedback || '', punkte: 1 });
  });
  ['teil1', 'teil2', 'teil3', 'teil4'].forEach(k => { if (A.items.some(it => it.teil === k)) A.teile.push({ id: k, nr: k, titel: teilTitel[k] }); });
  return A;
}

function effektiv(it, ov) { return (ov && ov[it.id] !== undefined) ? ov[it.id] : it.auto; }

function berechneErgebnis(A, ov) {
  const teile = A.teile.map(tl => {
    const its = A.items.filter(it => it.teil === tl.id);
    const richtig = its.filter(it => effektiv(it, ov) === true).length;
    const offen = its.filter(it => effektiv(it, ov) === null || effektiv(it, ov) === undefined).length;
    const falsch = its.filter(it => effektiv(it, ov) === false).length;
    let punkte = 0; its.forEach(it => { if (effektiv(it, ov) === true) punkte += it.punkte; });
    const max = A.art === 'abschluss' ? tl.max : its.length;
    return { id: tl.id, titel: tl.titel, richtig, falsch, offen, gesamt: its.length, punkte: runde2(punkte), max: runde2(max),
             quote: max ? punkte / max : 1 };
  });
  const punkte = runde2(teile.reduce((s, x) => s + x.punkte, 0));
  const max = runde2(teile.reduce((s, x) => s + x.max, 0));
  const offen = teile.reduce((s, x) => s + x.offen, 0);
  const falsch = teile.reduce((s, x) => s + x.falsch, 0);
  const prozent = max ? Math.round(punkte / max * 1000) / 10 : 0;
  const note = (A.art === 'abschluss' && max) ? berechneNote(punkte, max) : null;
  return { teile, punkte, max, prozent, note, offen, falsch };
}

function zeileHtml(it, ov) {
  const e = effektiv(it, ov);
  const geaendert = ov && ov[it.id] !== undefined && ov[it.id] !== it.auto;
  const opt = (it.korrektAntwort || '').toString().split(' / ').map(s => s.trim()).filter(Boolean);
  const tipp = (e === false && !it.satz && typeof istWahrscheinlichTippfehler === 'function') ? istWahrscheinlichTippfehler(it.antwort, opt.length ? opt : it.korrektAntwort) : false;
  const cls = e === true ? 'antwort-correct' : e === false ? (tipp ? 'antwort-typo' : 'antwort-wrong') : '';
  const zeichen = e === true ? '✓' : e === false ? (tipp ? '⚠' : '✗') : '—';
  let text = `${zeichen} ${escapeHtml(it.frage)} — „${escapeHtml(it.antwort)}“`;
  if (e === false && it.korrektAntwort) text += `, ${it.satz ? 'Vorschlag' : 'richtig wäre'}: „${escapeHtml(it.korrektAntwort)}“`;
  if (tipp) text += ' <em>(evtl. nur Tippfehler)</em>';
  if (e === null || e === undefined) text += ' <em>(nicht automatisch geprüft — bitte bewerten)</em>';
  if (it.satz && it.feedback) text += `<div class="kifeedback">${escapeHtml(it.feedback)}</div>`;
  if (geaendert) text += ' <em class="geaendert">(von dir geändert)</em>';
  return `<div class="antwortzeile bw-zeile ${cls}" data-id="${it.id}">
      <div class="bw-text">${text}</div>
      <div class="bw-toggle" role="group" aria-label="Richtig oder falsch">
        <button type="button" class="bw-btn ${e === true ? 'an-ok' : ''}" data-wert="true" title="als richtig werten">✓</button>
        <button type="button" class="bw-btn ${e === false ? 'an-bad' : ''}" data-wert="false" title="als falsch werten">✗</button>
      </div></div>`;
}

// Baut den kompletten Bewertungsbereich einer Abgabe (ersetzt die alte Karte für alle Nicht-Eingangstests)
async function baueBewertung(div, sub, statusObj, statusKey) {
  const A = analysiereAbgabe(sub);
  const draft = sub._draft || {};
  const ov = Object.assign({}, draft.overrides || {});
  let teilWdh = Array.isArray(draft.teilWdh) ? draft.teilWdh.slice() : null;
  let teilWdhDirty = !!teilWdh;
  const dt = new Date(sub.timestamp);
  const dateStr = dt.toLocaleDateString('de-DE') + ' ' + dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const titelAnzeige = titelMitSchritt(sub.testId, sub.testTitle);
  const istAbschluss = A.art === 'abschluss';
  const statusText = statusObj.status === 'wiederholen' ? 'Wiederholen nötig' : statusObj.status === 'weiter' ? (statusObj.korrektur ? (statusObj.zettel ? 'Korrektur auf Papier — Zettel kontrolliert ✓' : 'Korrektur auf Papier — Zettel noch offen') : 'Bewertet — kann weitermachen') : 'Noch nicht bewertet';

  function standardTeilWdh(erg) {
    // Voreinstellung: Teile mit Fehlern (Abschlusstest: unter 70 % der Teilpunkte); bei Abschluss + schlechter Note mindestens alle mit Fehlern
    let ids = erg.teile.filter(x => istAbschluss ? (x.max && x.quote < 0.7) : x.falsch > 0).map(x => x.id);
    if (istAbschluss && !ids.length && erg.note && noteMussWiederholt(erg.note)) ids = erg.teile.filter(x => x.falsch > 0).map(x => x.id);
    return ids;
  }

  div.innerHTML = `
    <div class="head"><h3>${escapeHtml(sub.name)}</h3><span class="meta">${escapeHtml(titelAnzeige)} · ${dateStr}</span></div>
    <span class="status-tag ${statusObj.status}">${statusText}</span>
    ${(statusObj.korrektur && sub._neueste !== false) ? `<label class="bw-zettel"><input type="checkbox" class="bw-zettel-cb" ${statusObj.zettel ? 'checked' : ''}> Zettel kontrolliert ✓ (Korrektur auf Papier)</label>` : ''}
    <div class="bw-summe"></div>
    <div class="bw-teile"></div>
    <label class="bw-label">Kommentar für den Schüler <span class="bw-pflicht"></span></label>
    <textarea class="comment-input" placeholder="z. B. was noch intensiv geübt werden muss"></textarea>
    <div class="bw-vorschau"></div>
    <div class="bw-aktion"></div>`;
  const summeEl = div.querySelector('.bw-summe');
  const teileEl = div.querySelector('.bw-teile');
  const kommentarEl = div.querySelector('.comment-input');
  const vorschauEl = div.querySelector('.bw-vorschau');
  const aktionEl = div.querySelector('.bw-aktion');
  kommentarEl.value = (draft.kommentar != null ? draft.kommentar : statusObj.comment) || '';
  const pflichtEl = div.querySelector('.bw-pflicht');

  function ergebnisModus() { const s = div.querySelector('.bw-modus'); return s ? s.value : 'auto'; }

  function aktualisiere() {
    const erg = berechneErgebnis(A, ov);
    if (!teilWdhDirty) teilWdh = standardTeilWdh(erg);
    // Teile + Zeilen
    teileEl.innerHTML = A.teile.map(tl => {
      const te = erg.teile.find(x => x.id === tl.id);
      const its = A.items.filter(it => it.teil === tl.id);
      const zahl = istAbschluss ? `${te.punkte} von ${te.max} Punkten` : `${te.richtig} von ${te.gesamt} richtig`;
      return `<div class="bw-teil" data-teil="${tl.id}">
        <h4>${escapeHtml(tl.titel)} <span class="bw-teilzahl ${te.falsch ? 'hat-fehler' : ''}">${zahl}</span></h4>
        ${its.length ? its.map(it => zeileHtml(it, ov)).join('') : '<div class="bw-leer">Keine Antworten in diesem Teil.</div>'}
        <label class="bw-wdh"><input type="checkbox" class="teil-wdh-cb" value="${tl.id}" ${teilWdh.indexOf(tl.id) >= 0 ? 'checked' : ''}> ${istAbschluss ? 'Diesen Teil wiederholen lassen' : 'Diesen Teil wiederholen lassen (nur bei „Wiederholen nötig“)'}</label>
      </div>`;
    }).join('');
    // Summe
    if (istAbschluss) {
      summeEl.innerHTML = `<div class="bw-ergebnis"><strong>${erg.punkte} von ${erg.max} Punkten</strong> · ${erg.prozent} % · Note <strong>${erg.note || '–'}</strong>${erg.offen ? ` <em>(noch ${erg.offen} Antwort${erg.offen === 1 ? '' : 'en'} unbewertet)</em>` : ''}</div>`;
    } else {
      summeEl.innerHTML = `<div class="bw-ergebnis"><strong>${erg.teile.reduce((s, x) => s + x.richtig, 0)} von ${erg.teile.reduce((s, x) => s + x.gesamt, 0)} richtig</strong> — ${erg.falsch} falsch${erg.offen ? `, ${erg.offen} unbewertet` : ''}</div>`;
    }
    // Vorschau des Ergebnisses + Aktionen
    const auto = istAbschluss ? (erg.note && noteMussWiederholt(erg.note) ? 'wiederholen' : 'weiter') : 'weiter';
    if (istAbschluss) {
      vorschauEl.innerHTML = auto === 'wiederholen'
        ? `<div class="bw-hinweis schlecht">Note ${erg.note}: <strong>muss wiederholt werden</strong> (ab 3− und schlechter). Bitte Teile wählen und im Kommentar schreiben, was intensiv geübt werden muss.</div>`
        : `<div class="bw-hinweis gut">Note ${erg.note || '–'}: <strong>bestanden</strong>${erg.falsch ? ' — der Schüler schreibt alle falschen Aufgaben auf Papier ab (Korrektur).' : '.'}</div>`;
      aktionEl.innerHTML = `
        <div class="bw-modusbox">Ergebnis: <select class="bw-modus"><option value="auto">automatisch nach Note (Standard)</option><option value="weiter">trotzdem: kann weitermachen</option><option value="wiederholen">trotzdem: Wiederholen nötig</option></select></div>
        <div class="status-controls"><button type="button" class="btn ok small bw-abschliessen">Bewertung abschließen &amp; freigeben</button></div>`;
    } else {
      vorschauEl.innerHTML = erg.falsch
        ? `<div class="bw-hinweis">Es gibt ${erg.falsch} falsche Antwort${erg.falsch === 1 ? '' : 'en'}. Bei „Korrigiert“ sieht der Schüler sie und schreibt sie handschriftlich richtig auf einen Zettel.</div>`
        : `<div class="bw-hinweis gut">Alles richtig — der Schüler kann weitermachen.</div>`;
      aktionEl.innerHTML = `<div class="status-controls">
        <button type="button" class="btn ok small bw-abschliessen">${erg.falsch ? 'Korrigiert — freigeben' : 'Alles richtig — freigeben'}</button>
        <button type="button" class="btn danger small bw-wiederholen">Wiederholen nötig (angehakte Teile)</button></div>`;
    }
    pflichtEl.textContent = '';
    if (sub._neueste === false) { aktionEl.innerHTML = '<div class="bw-hinweis">Ältere Abgabe — nur zum Ansehen. Bewertet wird immer die neueste Abgabe dieses Tests.</div>'; vorschauEl.innerHTML = ''; }
  }

  function speichereEntwurf() {
    clearTimeout(speichereEntwurf._t);
    speichereEntwurf._t = setTimeout(async () => {
      const draftObj = { overrides: ov, teilWdh: teilWdhDirty ? teilWdh : null, kommentar: kommentarEl.value, savedAt: new Date().toISOString() };
      try { await window.storage.set(draftKeyFuer(sub), JSON.stringify(draftObj), true); } catch (e) { /* Entwurf nicht kritisch */ }
    }, 350);
  }

  const zb = div.querySelector('.bw-zettel-cb');
  if (zb) zb.addEventListener('change', async () => { zb.disabled = true; const ok = await setzeZettel(sub.testId, slug(sub.name), zb.checked); zb.disabled = false; if (!ok) { zb.checked = !zb.checked; alert('Der Haken konnte nicht gespeichert werden.'); } else { const tag = div.querySelector('.status-tag'); if (tag) tag.textContent = zb.checked ? 'Korrektur auf Papier — Zettel kontrolliert ✓' : 'Korrektur auf Papier — Zettel noch offen'; } });
  const nurAnsicht = sub._neueste === false;
  if (nurAnsicht) div.classList.add('nur-ansicht');

  aktualisiere();

  // Schalter ✓/✗ (Delegation)
  teileEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.bw-btn');
    if (!btn || nurAnsicht) return;
    const id = btn.closest('.bw-zeile').getAttribute('data-id');
    const wert = btn.getAttribute('data-wert') === 'true';
    const it = A.items.find(x => x.id === id);
    if (wert === it.auto) delete ov[id]; else ov[id] = wert;
    aktualisiere();
    speichereEntwurf();
  });
  teileEl.addEventListener('change', (ev) => {
    if (!ev.target.classList.contains('teil-wdh-cb')) return;
    teilWdhDirty = true;
    teilWdh = [...teileEl.querySelectorAll('.teil-wdh-cb:checked')].map(cb => cb.value);
    speichereEntwurf();
  });
  kommentarEl.addEventListener('input', speichereEntwurf);

  async function abschliessen(gewuenscht) {
    const erg = berechneErgebnis(A, ov);
    if (erg.offen > 0) { alert('Bitte zuerst alle Antworten bewerten, die noch „nicht automatisch geprüft“ sind (mit ✓ oder ✗).'); return; }
    let ergebnis = gewuenscht;
    if (istAbschluss) {
      const modus = ergebnisModus();
      const auto = (erg.note && noteMussWiederholt(erg.note)) ? 'wiederholen' : 'weiter';
      ergebnis = modus === 'auto' ? auto : modus;
    }
    const kommentar = kommentarEl.value.trim();
    const gewaehlt = [...teileEl.querySelectorAll('.teil-wdh-cb:checked')].map(cb => cb.value);
    if (ergebnis === 'wiederholen') {
      if (!gewaehlt.length) { alert('Bitte mindestens einen Teil zum Wiederholen ankreuzen (Kästchen unter dem jeweiligen Teil).'); return; }
      if (!kommentar) { pflichtEl.textContent = '(Pflicht bei „Wiederholen“)'; kommentarEl.focus(); alert('Bitte im Kommentarfeld schreiben, was noch intensiv geübt werden muss.'); return; }
    }
    const korrektur = ergebnis === 'weiter' && erg.falsch > 0;
    const teileErg = erg.teile.map(x => ({ id: x.id, titel: x.titel, richtig: x.richtig, gesamt: x.gesamt, punkte: x.punkte, max: x.max, wiederholen: ergebnis === 'wiederholen' && gewaehlt.indexOf(x.id) >= 0 }));
    const fehler = A.items.filter(it => !it.satz && effektiv(it, ov) === false).map(it => ({ teil: (A.teile.find(x => x.id === it.teil) || {}).titel || '', frage: it.frage, antwort: it.antwort, korrektAntwort: it.korrektAntwort }));
    const saetze = A.items.filter(it => it.satz && effektiv(it, ov) === false).map(it => ({ frage: it.frage, satz: it.antwort, vorschlag: it.korrektAntwort }));
    const felder = istAbschluss ? A.items.filter(it => it.key).map(it => ({ key: it.key, korrekt: effektiv(it, ov) === true })) : [];
    const review = { v: 1, testId: sub.testId, name: sub.name, titel: titelAnzeige, art: A.art, reviewedAt: new Date().toISOString(), kommentar, ergebnis, korrektur,
      punkte: istAbschluss ? erg.punkte : null, max: istAbschluss ? erg.max : null, prozent: istAbschluss ? erg.prozent : null, note: erg.note,
      richtig: erg.teile.reduce((s, x) => s + x.richtig, 0), gesamt: erg.teile.reduce((s, x) => s + x.gesamt, 0),
      teile: teileErg, fehler, saetze, felder };
    const status = { status: ergebnis === 'wiederholen' ? 'wiederholen' : 'weiter', comment: kommentar, reviewedAt: review.reviewedAt, reviewKey: reviewKeyFuer(sub), ergebnis, korrektur, note: erg.note || null };
    if (ergebnis === 'wiederholen') {
      if (A.art === 'grammatik') status.punkteWiederholen = gewaehlt.map(id => Number(String(id).slice(1)));
      else if (A.art === 'abschluss') status.wiederholenTeile = gewaehlt.map(id => Number(String(id).slice(1)));
      else status.wiederholenTeile = gewaehlt;
      // Nur speichern, wenn NICHT alle Teile gewählt sind — sonst ist es eine normale volle Wiederholung
      const feld = A.art === 'grammatik' ? 'punkteWiederholen' : 'wiederholenTeile';
      if (status[feld].length >= A.teile.length) delete status[feld];
    }
    try {
      await window.storage.set(reviewKeyFuer(sub), JSON.stringify(review), true);
      await window.storage.set(statusKey, JSON.stringify(status), true);
      await window.storage.set(draftKeyFuer(sub), JSON.stringify({ overrides: ov, teilWdh: gewaehlt, kommentar, savedAt: review.reviewedAt }), true);
    } catch (e) { alert('Konnte die Bewertung nicht speichern (' + (e && e.message ? e.message : 'Speicherfehler') + '). Bitte nochmal versuchen.'); return; }
    loadSubmissions(false);
  }
  aktionEl.addEventListener('click', (ev) => {
    if (nurAnsicht) return;
    if (ev.target.closest('.bw-abschliessen')) abschliessen('weiter');
    else if (ev.target.closest('.bw-wiederholen')) abschliessen('wiederholen');
  });
  if (nurAnsicht) { aktionEl.innerHTML = '<div class="bw-hinweis">Ältere Abgabe — nur zum Ansehen. Bewertet wird immer die neueste Abgabe dieses Tests.</div>'; vorschauEl.innerHTML = ''; }
}
