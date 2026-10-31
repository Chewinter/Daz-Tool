/* ==========================================================================
   uebersicht.js — Startseite der Lehrkraft-Ansicht
   * „Wartet auf dich“: alle Abgaben, die noch nicht bewertet sind (älteste zuerst)
   * „Liegt beim Schüler“: Korrektur auf dem Blatt (Knopf „Handschriftliche Korrektur ist ok“) · Wiederholung frei · angefangen/pausiert
   * Spielbrett: der Lernpfad als Weg; jeder Schüler ist eine Figur an seiner aktuellen Station
   Klick auf eine Figur / „Bewerten“ öffnet den Schüler (Einzelansicht mit den ✓/✗-Schaltern).
   ========================================================================== */

let uebersichtDaten = null;

function altersText(ts) {
  const ms = Date.now() - Number(ts);
  if (!isFinite(ms) || ms < 0) return '';
  const min = Math.round(ms / 60000);
  if (min < 60) return `vor ${Math.max(min, 1)} Min.`;
  const h = Math.round(min / 60);
  if (h < 48) return `vor ${h} Std.`;
  return `vor ${Math.round(h / 24)} Tagen`;
}
function kurzName(name) {
  const w = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  return w.length > 1 ? `${w[0]} ${w[w.length - 1][0]}.` : w[0];
}
function stufeFuerTest(id) { const i = CURRICULUM.findIndex(s => s.items.indexOf(id) >= 0); return i; }
function testAnzeige(id) {
  const i = stufeFuerTest(id); const info = curriculumItemInfo(id);
  const lf = i >= 0 ? CURRICULUM[i] : null;
  // Niveau davor, wenn der Name es nicht schon enthält (A1/A2/B1 haben alle ein „Grammatik-Training“)
  return { stufe: lf ? (lf.niveau && lf.name.indexOf(lf.niveau) < 0 ? lf.niveau + ' ' + lf.name : lf.name) : '', titel: anzeigeTitel(id, info.title) };
}

// "Handschriftliche Korrektur ist ok" (Ablauf Schritt 2 -> 3): gibt die digitale Wiederholung der ✗-Aufgaben frei
async function setzeKorrekturOk(testId, slugName) {
  const key = `status:${testId}:${slugName}`;
  let obj = null;
  try { const r = await window.storage.get(key, true); obj = JSON.parse(r.value); } catch (e) { return false; }
  if (!obj || ablaufStatus(obj) !== 'zettel_offen') return false;
  const neu = Object.assign({}, obj, { status: korrekturOkStatus(obj), zettel: true, zettelAm: new Date().toISOString() });
  try { await window.storage.set(key, JSON.stringify(neu), true); return true; } catch (e) { return false; }
}

// Arbeitsblatt im Heft: Lehrkraft hat das Heft angesehen. ok -> erledigt (nächster Schritt frei), sonst überarbeiten.
async function setzeHeftStatus(id, slugName, ok, kommentar) {
  const key = `status:${id}:${slugName}`;
  let alt = {};
  try { const r = await window.storage.get(key, true); alt = JSON.parse(r.value) || {}; } catch (e) { /* noch kein Status */ }
  const neu = Object.assign({}, alt, ok ? { status: 'endgueltig', comment: '' } : { status: 'heft_nochmal', comment: (kommentar || '').trim() }, { reviewedAt: new Date().toISOString() });
  try { await window.storage.set(key, JSON.stringify(neu), true); return neu; } catch (e) { return null; }
}
// Lösung eines Arbeitsblatts (loesung:<id>, nur für die Lehrkraft lesbar)
const loesungCache = {};
async function zeigeLoesung(id, box) {
  box.innerHTML = '<p class="ub-leer">Lösung wird geladen …</p>';
  try {
    if (!loesungCache[id]) { const r = await window.storage.get('loesung:' + id, true); loesungCache[id] = JSON.parse(r.value); }
    box.innerHTML = loesungCache[id].teile.map(t => `<div class="ub-loesung-teil"><strong>${escapeHtml(t.titel)}</strong><ol>${t.zeilen.map(z => `<li>${escapeHtml(z)}</li>`).join('')}</ol></div>`).join('');
  } catch (e) { box.innerHTML = '<p class="ub-leer">Keine Lösung gefunden (noch nicht hochgeladen?).</p>'; }
}

async function ladeUebersichtsdaten() {
  const erlaubt = new Set(alleAbgabeIds());
  // ZWEI Anfragen für die ganze Klasse (vorher 2 + eine je Schüler:in, in Vierergruppen nacheinander):
  // die Abgabe-Schlüssel und — samt Wert — alles, was mit status:/testprogress:/manualaccess:/activitydone: beginnt.
  const [subRes, sammel] = await Promise.all([
    window.storage.list('submission:', true),
    window.storage.listByPrefix(['status:', 'testprogress:', 'manualaccess:', 'activitydone:'], true).catch(() => null),
  ]);
  const sammelItems = sammel && Array.isArray(sammel.items) ? sammel.items : null;
  const actRes = sammelItems ? { keys: sammelItems.map(x => x.key).filter(k => k.indexOf('activitydone:') === 0) } : await window.storage.list('activitydone:', true);
  const schueler = STUDENTS.map(n => ({ name: n, slug: slug(n), done: new Set(), doneActs: new Set(), latest: {}, status: {}, pausiert: {}, manualIdx: -1 }));
  const bySlug = {}; schueler.forEach(s => { bySlug[s.slug] = s; });
  ((subRes && subRes.keys) || []).forEach(k => {
    const p = k.split(':'); const s = bySlug[p[2]];
    if (!s || !erlaubt.has(p[1]) || k.endsWith('_manuell')) return;
    s.done.add(p[1]);
    if (!s.latest[p[1]] || Number(p[3]) > Number(s.latest[p[1]])) s.latest[p[1]] = p[3];
  });
  ((actRes && actRes.keys) || []).forEach(k => { const p = k.split(':'); const s = bySlug[p[2]]; if (s) s.doneActs.add(p[1]); });
  // Status, pausierte Entwürfe, manuelle Freischaltung
  const uebernimm = (s, key, value) => {
    const p = key.split(':');
    try {
      if (p[0] === 'status' && p[2] === s.slug) s.status[p[1]] = JSON.parse(value);
      else if (p[0] === 'testprogress' && p[2] === s.slug) { const o = JSON.parse(value); s.pausiert[p[1]] = o && o.gespeichertAm ? new Date(o.gespeichertAm).getTime() : null; }
      else if (p[0] === 'manualaccess' && p[1] === s.slug) s.manualIdx = aufloeseManualAccessIndex(JSON.parse(value));
    } catch (e) { /* kaputter Eintrag */ }
  };
  if (sammelItems) {
    sammelItems.forEach(({ key, value }) => {
      const p = key.split(':');
      const s = bySlug[p[0] === 'manualaccess' ? p[1] : p[2]];
      if (s) uebernimm(s, key, value);
    });
  } else {
    // Ersatzweg, falls die Sammel-Abfrage scheitert: eine Abfrage pro Schüler (in Gruppen)
    const GRUPPE = 4;
    for (let i = 0; i < schueler.length; i += GRUPPE) {
      await Promise.all(schueler.slice(i, i + GRUPPE).map(async (s) => {
        try {
          const res = await window.storage.listBySuffix(':' + s.slug, true);
          ((res && res.items) || []).forEach(({ key, value }) => uebernimm(s, key, value));
        } catch (e) { s.fehler = true; }
      }));
    }
  }
  // Arbeitsblätter im Heft (31.10.2026): Zustand je Kind (erledigt / heft_zeigen / nochmal / offen)
  schueler.forEach(s => {
    s.blatt = {};
    CURRICULUM.forEach(lf => lf.items.forEach(id => { if (istArbeitsblatt(id)) s.blatt[id] = blattZustand(id, s.status[id], s.done); }));
  });
  schueler.forEach(s => { s.pos = berechnePosition(s); });
  return schueler;
}

// Aktuelle Station eines Schülers — gleiche Regel wie auf der Schüler-Seite (sequenziell, Bestandsschutz, manuelle Freischaltung)
function berechnePosition(s) {
  const istAct = id => curriculumItemInfo(id).kind === 'activity';
  const erledigt = id => istArbeitsblatt(id) ? s.blatt[id] === 'erledigt' : istAct(id) ? s.doneActs.has(id) : (s.done.has(id) && ablaufStatus(s.status[id]) === 'endgueltig');
  const hat = CURRICULUM.map(lf => lf.items.some(id => istArbeitsblatt(id) ? s.blatt[id] !== 'offen' : istAct(id) ? s.doneActs.has(id) : s.done.has(id)));
  const spaeter = hat.map((_, i) => hat.slice(i + 1).some(Boolean));
  let pos = CURRICULUM.length - 1;
  for (let i = 0; i < CURRICULUM.length; i++) {
    const fertig = CURRICULUM[i].items.every(erledigt);
    if (!fertig && !spaeter[i]) { pos = i; break; }
  }
  const begonnen = hat.some(Boolean) || s.manualIdx >= 0;
  if (s.manualIdx > pos) pos = s.manualIdx;
  const lf = CURRICULUM[pos];
  return { index: begonnen ? pos : -1, begonnen, fertig: lf.items.filter(erledigt).length, gesamt: lf.items.length };
}

function sammleAufgaben(schueler) {
  const wartet = [], wiederholen = [], zettel = [], pausiert = [], heft = [];
  schueler.forEach(s => {
    Object.keys(s.blatt || {}).forEach(id => {
      if (s.blatt[id] !== 'heft_zeigen') return;
      const a = testAnzeige(id), st = s.status[id] || {};
      heft.push({ name: s.name, slug: s.slug, testId: id, stufe: a.stufe, titel: a.titel, ts: Date.parse(st.am) || null, runde: st.runde || 1 });
    });
    Object.keys(s.latest).forEach(tid => {
      if (curriculumItemInfo(tid).kind === 'activity') return;
      const st = s.status[tid];
      const a = testAnzeige(tid);
      const basis = { name: s.name, slug: s.slug, testId: tid, stufe: a.stufe, titel: a.titel };
      const ab = ablaufStatus(st);
      const bewertetTs = st && st.reviewedAt ? new Date(st.reviewedAt).getTime() : s.latest[tid];
      if (ab === 'offen') wartet.push({ ...basis, ts: s.latest[tid], wdh: !!(st && st.wiederholung) });
      else if (ab === 'wiederholung_frei') wiederholen.push({ ...basis, ts: bewertetTs, kommentar: st.comment || '', teile: st.wiederholenTeile || st.punkteWiederholen || null });
      else if (ab === 'zettel_offen') zettel.push({ ...basis, ts: bewertetTs });
    });
    Object.keys(s.pausiert).forEach(tid => {
      const a = testAnzeige(tid);
      pausiert.push({ name: s.name, slug: s.slug, testId: tid, stufe: a.stufe, titel: a.titel, ts: s.pausiert[tid] });
    });
  });
  const alt = (a, b) => Number(a.ts) - Number(b.ts);
  wartet.sort(alt); wiederholen.sort(alt); zettel.sort(alt); pausiert.sort(alt); heft.sort(alt);
  return { wartet, wiederholen, zettel, pausiert, heft };
}


// ---------------- SCHRITT-MATRIX ----------------
// Zeilen = Schüler, Spalten = jeder Schritt/Test/Spiel/Lernfeld-Test/Einstufungstest/Grammatik-Block in Lernpfad-Reihenfolge.
function zellStatus(s, id) {
  const kind = curriculumItemInfo(id).kind;
  if (kind === 'activity') return s.doneActs.has(id) ? { cls: 'fertig', t: 'gespielt' } : { cls: 'leer', t: 'noch nicht gespielt' };
  if (kind === 'blatt') {
    const z = (s.blatt || {})[id];
    return z === 'erledigt' ? { cls: 'fertig', t: 'Heft ok' } : z === 'heft_zeigen' ? { cls: 'wartet', t: 'fertig — will dir das Heft zeigen' }
      : z === 'nochmal' ? { cls: 'zettel', t: 'Heft wird überarbeitet' } : { cls: 'leer', t: 'nicht begonnen' };
  }
  const st = s.status[id];
  if (s.done.has(id)) {
    const ab = ablaufStatus(st);
    if (ab === 'wiederholung_frei') return { cls: 'wdh', t: 'Wiederholung frei (liegt beim Schüler)' };
    if (ab === 'zettel_offen') return { cls: 'zettel', t: 'Korrektur auf dem Blatt offen' };
    if (ab === 'endgueltig') return { cls: 'fertig', t: 'endgültig erledigt' };
    return { cls: 'wartet', t: (st && st.wiederholung) ? 'Wiederholung abgegeben — wartet auf dich' : 'wartet auf deine Bewertung' };
  }
  if (Object.prototype.hasOwnProperty.call(s.pausiert, id)) return { cls: 'angefangen', t: 'angefangen (pausiert)' };
  return { cls: 'leer', t: 'nicht begonnen' };
}
function spaltenLabel(id) {
  const kind = curriculumItemInfo(id).kind;
  if (kind === 'test-final') return 'LT';
  if (kind === 'schreiben') return 'SA';
  if (kind === 'lesen') return 'LA';
  if (kind === 'eingangstest') return 'E';
  if (kind === 'grammatik') { const m = /block(\d+)/.exec(id); return 'G' + (m ? m[1] : ''); }
  if (kind === 'blatt') { const l = schrittLabel(id); return 'AB' + (l ? l.replace('Schritt ', '') : ''); }
  const l = schrittLabel(id);
  const nr = l ? l.replace('Schritt ', '') : '';
  return kind === 'activity' ? (nr ? 'Sp' + nr : 'Sp') : (nr ? 'S' + nr : '•');
}
function rendereMatrixHtml(schueler) {
  let kopf1 = '<tr><th class="mx-name"></th>', kopf2 = '<tr><th class="mx-name">Schüler</th>';
  CURRICULUM.forEach(st => {
    kopf1 += `<th colspan="${st.items.length}" class="mx-stufe niveau-${st.niveau}">${escapeHtml(st.name)}</th>`;
    st.items.forEach(id => { kopf2 += `<th class="mx-spalte" title="${escapeHtml(anzeigeTitel(id, curriculumItemInfo(id).title))}">${escapeHtml(spaltenLabel(id))}</th>`; });
  });
  let zeilen = '';
  schueler.forEach(s => {
    zeilen += `<tr><th class="mx-name"><button type="button" class="mx-namebtn" data-slug="${s.slug}">${escapeHtml(s.name)}</button></th>`;
    CURRICULUM.forEach(st => st.items.forEach(id => {
      const z = zellStatus(s, id);
      zeilen += `<td class="mx-zelle ${z.cls}" data-slug="${s.slug}" data-test="${id}" title="${escapeHtml(s.name + ' — ' + anzeigeTitel(id, curriculumItemInfo(id).title) + ': ' + z.t)}"></td>`;
    }));
    zeilen += '</tr>';
  });
  return `<h2 class="ub-h">Schritt für Schritt</h2>
    <div class="mx-legende"><span class="mx-zelle leer"></span> nicht begonnen <span class="mx-zelle angefangen"></span> angefangen <span class="mx-zelle wartet"></span> wartet auf dich <span class="mx-zelle zettel"></span> Korrektur auf dem Blatt <span class="mx-zelle wdh"></span> Wiederholung frei <span class="mx-zelle fertig"></span> erledigt / gespielt
      · S = Test zu Schritt · Sp = Spiel · AB = Arbeitsblatt (Heft) · G = Grammatik-Block · LT = Lernfeld-Test · SA = Schreibaufgabe · LA = Leseaufgabe · E = Einstufungstest</div>
    <div class="mx-wrap"><table class="mx"><thead>${kopf1}</tr>${kopf2}</tr></thead><tbody>${zeilen}</tbody></table></div>`;
}

function zeileHtmlUeb(x, knopf, extra) {
  return `<div class="ub-zeile" data-slug="${x.slug}" data-test="${x.testId}">
    <div class="ub-info"><strong>${escapeHtml(x.name)}</strong> · ${escapeHtml(x.stufe)} · ${escapeHtml(x.titel)}
      <span class="ub-alter">${x.ts ? altersText(x.ts) : ''}</span>${extra || ''}</div>
    <div class="ub-knopf">${knopf}</div></div>`;
}

function rendereUebersicht() {
  const body = document.getElementById('uebersichtBody');
  const schueler = uebersichtDaten;
  const A = sammleAufgaben(schueler);
  const anzahlWartet = {}; A.wartet.forEach(x => { anzahlWartet[x.slug] = (anzahlWartet[x.slug] || 0) + 1; });
  const hatWdh = new Set(A.wiederholen.map(x => x.slug));

  let h = `<div class="ub-chips">
    <span class="ub-chip ${A.wartet.length + A.heft.length ? 'gelb' : ''}"><strong>${A.wartet.length + A.heft.length}</strong> warten auf dich</span>
    <span class="ub-chip ${A.zettel.length ? 'orange' : ''}"><strong>${A.zettel.length}</strong> Korrektur auf dem Blatt</span>
    <span class="ub-chip ${A.wiederholen.length ? 'rot' : ''}"><strong>${A.wiederholen.length}</strong> Wiederholung${A.wiederholen.length === 1 ? '' : 'en'} frei</span>
    <span class="ub-chip"><strong>${A.pausiert.length}</strong> angefangen</span></div>`;

  // Spielbrett — ganz oben (Lukas 31.10.), danach die einzelnen Listen
  h += `<h2 class="ub-h">Wo stehen alle?</h2><div class="brett">`;
  const stationen = [{ name: 'Start', niveau: 'S' }].concat(CURRICULUM.map(s => ({ name: s.name, niveau: s.niveau })));
  stationen.forEach((st, si) => {
    const idx = si - 1;
    const figuren = schueler.filter(s => s.pos.index === idx);
    h += `<div class="station niveau-${st.niveau}"><div class="st-kopf">${si ? `<span class="st-nr">${si}</span>` : ''}${escapeHtml(st.name)}</div><div class="st-figuren">` +
      (figuren.length ? figuren.map(s => {
        const w = anzahlWartet[s.slug] || 0;
        const cls = w ? 'wartet' : hatWdh.has(s.slug) ? 'wdh' : '';
        const fort = s.pos.gesamt ? ` — ${s.pos.fertig}/${s.pos.gesamt} in dieser Station` : '';
        return `<button type="button" class="fig ${cls}" data-slug="${s.slug}" title="${escapeHtml(s.name)}${fort}${w ? ' — ' + w + ' zu bewerten' : ''}">${escapeHtml(kurzName(s.name))}${w ? `<span class="fig-badge">${w}</span>` : ''}</button>`;
      }).join('') : '<span class="st-leer">–</span>') + `</div></div>`;
  });
  h += `</div><p class="ub-legende"><span class="fig wartet klein">gelb</span> wartet auf deine Bewertung · <span class="fig wdh klein">rot</span> Wiederholung frei · Zahl = Anzahl offener Bewertungen</p>`;

  h += `<h2 class="ub-h">Wartet auf dich</h2>`;
  if (A.heft.length) {
    h += `<h3 class="ub-h3">Heft zeigen (${A.heft.length})</h3>`;
    h += A.heft.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small ok ub-heft-ok">Heft ok</button> <button type="button" class="btn small secondary ub-heft-nein">Noch nicht ok</button> <button type="button" class="btn small secondary ub-loesung">Lösung</button>',
      x.runde > 1 ? '<div class="ub-komm">überarbeitet</div>' : '') + '<div class="ub-loesung-box hidden"></div>').join('');
    h += `<h3 class="ub-h3">Abgaben</h3>`;
  }
  h += A.wartet.length ? A.wartet.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small ub-bewerten">Bewerten</button>', x.wdh ? '<div class="ub-komm">Wiederholung abgegeben</div>' : '')).join('') : '<p class="ub-leer">Nichts offen. Alles bewertet.</p>';

  h += `<h2 class="ub-h">Liegt beim Schüler</h2>`;
  h += `<h3 class="ub-h3">Korrektur auf dem Blatt (${A.zettel.length})</h3>`;
  h += A.zettel.length ? A.zettel.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small ok ub-korrektur-ok">Handschriftliche Korrektur ist ok</button>')).join('') : '<p class="ub-leer">Keine.</p>';
  h += `<h3 class="ub-h3">Wiederholung frei (${A.wiederholen.length})</h3>`;
  h += A.wiederholen.length ? A.wiederholen.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small secondary ub-bewerten">Ansehen</button>',
        x.kommentar ? `<div class="ub-komm">„${escapeHtml(x.kommentar)}“</div>` : '')).join('') : '<p class="ub-leer">Keine.</p>';
  h += `<h3 class="ub-h3">Angefangen / pausiert (${A.pausiert.length})</h3>`;
  h += A.pausiert.length ? A.pausiert.map(x => zeileHtmlUeb(x, '')).join('') : '<p class="ub-leer">Keine.</p>';

  h += rendereMatrixHtml(schueler);
  body.innerHTML = h;

  body.querySelectorAll('.mx-zelle[data-test]').forEach(c => c.addEventListener('click', () => oeffneSchueler(c.getAttribute('data-slug'), c.getAttribute('data-test'))));
  body.querySelectorAll('.mx-namebtn').forEach(b => b.addEventListener('click', () => oeffneSchueler(b.getAttribute('data-slug'))));
  body.querySelectorAll('.fig').forEach(b => b.addEventListener('click', () => oeffneSchueler(b.getAttribute('data-slug'))));
  body.querySelectorAll('.ub-bewerten').forEach(b => b.addEventListener('click', () => { const z = b.closest('.ub-zeile'); oeffneSchueler(z.getAttribute('data-slug'), z.getAttribute('data-test')); }));
  body.querySelectorAll('.ub-heft-ok, .ub-heft-nein').forEach(b => b.addEventListener('click', async () => {
    const z = b.closest('.ub-zeile'), ok = b.classList.contains('ub-heft-ok');
    const kommentar = ok ? '' : prompt('Was soll im Heft noch verbessert werden? (Das Kind sieht diesen Satz.)', '');
    if (!ok && kommentar === null) return;
    z.querySelectorAll('button').forEach(x => { x.disabled = true; });
    const id = z.getAttribute('data-test'), sl = z.getAttribute('data-slug');
    const neu = await setzeHeftStatus(id, sl, ok, kommentar);
    if (neu) {
      const s = uebersichtDaten.find(x => x.slug === sl);
      if (s) { s.status[id] = neu; s.blatt[id] = ok ? 'erledigt' : 'nochmal'; s.pos = berechnePosition(s); }
      rendereUebersicht();
    } else { z.querySelectorAll('button').forEach(x => { x.disabled = false; }); alert('Konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
  }));
  body.querySelectorAll('.ub-loesung').forEach(b => b.addEventListener('click', () => {
    const z = b.closest('.ub-zeile'), box = z.nextElementSibling;
    if (box.classList.toggle('hidden')) return;
    zeigeLoesung(z.getAttribute('data-test'), box);
  }));
  body.querySelectorAll('.ub-korrektur-ok').forEach(b => b.addEventListener('click', async () => {
    const z = b.closest('.ub-zeile'); b.disabled = true;
    const ok = await setzeKorrekturOk(z.getAttribute('data-test'), z.getAttribute('data-slug'));
    if (ok) {
      const s = uebersichtDaten.find(x => x.slug === z.getAttribute('data-slug'));
      const st = s && s.status[z.getAttribute('data-test')];
      if (st) { st.status = korrekturOkStatus(st); st.zettel = true; }
      rendereUebersicht();
    } else { b.disabled = false; alert('Konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
  }));
}

async function ladeUebersicht(still) {
  const body = document.getElementById('uebersichtBody');
  if (!still) body.innerHTML = '<p class="ub-leer">Übersicht wird geladen …</p>';
  try {
    uebersichtDaten = await ladeUebersichtsdaten();
    rendereUebersicht();
    wdhMatrixKnopf();
    document.getElementById('lastUpdated').textContent = 'Zuletzt aktualisiert: ' + new Date().toLocaleTimeString('de-DE');
  } catch (e) {
    body.innerHTML = '<p class="ub-leer" style="color:var(--bad);">Die Übersicht konnte nicht geladen werden. <button type="button" class="btn small secondary" id="ubNochmal">Nochmal versuchen</button></p>';
    const b = document.getElementById('ubNochmal'); if (b) b.addEventListener('click', () => ladeUebersicht(false));
  }
}

function zeigeUebersicht() {
  document.getElementById('detailView').classList.add('hidden');
  document.getElementById('uebersichtView').classList.remove('hidden');
  // Bekannten Stand sofort zeigen, still im Hintergrund nachladen (eine Bewertung kann sich gerade geändert haben)
  if (uebersichtDaten) { rendereUebersicht(); ladeUebersicht(true); } else ladeUebersicht(false);
}
function aktualisiereAnsicht() {
  if (!document.getElementById('detailView').classList.contains('hidden')) loadSubmissions(false); else ladeUebersicht(false);
}
async function oeffneSchueler(slugName, testId) {
  const sel = document.getElementById('dashStudentFilter');
  sel.value = slugName;
  const name = (STUDENTS.find(n => slug(n) === slugName)) || slugName;
  document.getElementById('detailName').textContent = name;
  document.getElementById('uebersichtView').classList.add('hidden');
  document.getElementById('detailView').classList.remove('hidden');
  window.scrollTo(0, 0);
  await loadSubmissions(false);
  if (testId) {
    kartenOffen.add(testId);
    const karte = [...document.querySelectorAll('#submissionList .submission')].find(c => c.dataset.test === testId);
    if (karte) { karte.classList.remove('collapsed'); karte.scrollIntoView({ block: 'start' }); }
  }
}
document.getElementById('zurUebersicht').addEventListener('click', () => zeigeUebersicht());


// ---------------- GRAMMATIK-WIEDERHOLUNG B1: THEMEN JE KIND UND KLASSENÜBERSICHT (Paket 3, 28.10.2026) ----------------
// Je Kind: Ampel je Thema (gleiche Rechnung wie auf der Schüler-Seite, wdhStatistik) und deine Entscheidung je Thema
// ("wdhthemen:<slug>" = { Kürzel: true | false }). Die Entscheidung überschreibt die Empfehlung und bestimmt, welche falschen
// Aufgaben nach der Zettel-Korrektur digital wiederholt werden (bewertung.js).
window.wdhLehrkraft = null;   // { slug, paare, vorgaben } des gerade geöffneten Kindes
async function zeigeWdhPanel(listEl, gefiltert, slugName) {
  const neueste = gefiltert.filter(s => s._neueste !== false && /^b1wdh_/.test(s.testId));
  if (!neueste.length) { window.wdhLehrkraft = null; return; }
  const panel = document.createElement('div');
  panel.className = 'wdh-panel';
  panel.innerHTML = '<h3>Grammatik-Wiederholung B1: Themen</h3><p class="hint">Wird geladen …</p>';
  const umschalter = listEl.querySelector('.aeltere-umschalter');
  listEl.insertBefore(panel, umschalter ? umschalter.nextSibling : listEl.firstChild);
  const reviewKeys = neueste.map(s => s.lehrkraftStatusObj && s.lehrkraftStatusObj.reviewKey).filter(Boolean);
  const werte = await holeViele(reviewKeys.concat(['wdhthemen:' + slugName]));
  let vorgaben = {}; try { vorgaben = JSON.parse(werte['wdhthemen:' + slugName] || '{}') || {}; } catch (e) { /* keine */ }
  const paare = neueste.map(s => {
    const rk = s.lehrkraftStatusObj && s.lehrkraftStatusObj.reviewKey;
    let review = null;
    if (rk && rk === reviewKeyFuer(s) && werte[rk]) { try { review = JSON.parse(werte[rk]); } catch (e) { /* ohne */ } }
    return { sub: s, review };
  });
  window.wdhLehrkraft = { slug: slugName, paare, vorgaben };
  function zeichne() {
    const stat = wdhStatistik(paare, vorgaben);
    let h = `<h3>Grammatik-Wiederholung B1: Themen</h3><p class="hint">${paare.length} von ${WDH_B1_BLOECKE.length} Blöcken abgegeben. Ampel = Empfehlung; deine Entscheidung je Thema überschreibt sie (das Kind sieht sie in „Das musst du wiederholen“).</p>
      <table class="wdh-tab"><tr><th></th><th>Thema</th><th>richtig</th><th>Wiederholen?</th></tr>`;
    WDH_B1_THEMEN.forEach(t => {
      const s = stat[t.kz];
      const wert = s.vorgabe === true ? 'ja' : s.vorgabe === false ? 'nein' : '';
      h += `<tr><td><span class="wdh-ampel wdh-${s.farbe}" title="${WDH_FARBTEXT[s.farbe]}"></span></td><td>${escapeHtml(t.name)} <span class="hint">(${t.kz})</span></td>
        <td>${s.bearbeitet ? `${s.richtig}/${s.bearbeitet}${s.offen ? ' · ' + s.offen + ' offen' : ''}` : '–'}</td>
        <td><select data-kz="${t.kz}"><option value=""${wert === '' ? ' selected' : ''}>Empfehlung (${s.farbe === 'gelb' || s.farbe === 'rot' ? 'ja' : 'nein'})</option><option value="ja"${wert === 'ja' ? ' selected' : ''}>ja</option><option value="nein"${wert === 'nein' ? ' selected' : ''}>nein</option></select></td></tr>`;
    });
    h += '</table><p class="hint" id="wdhGespeichert"></p>';
    panel.innerHTML = h;
    panel.querySelectorAll('select[data-kz]').forEach(sel => sel.addEventListener('change', async () => {
      const kz = sel.getAttribute('data-kz');
      if (sel.value === 'ja') vorgaben[kz] = true; else if (sel.value === 'nein') vorgaben[kz] = false; else delete vorgaben[kz];
      const info = panel.querySelector('#wdhGespeichert'); if (info) info.textContent = 'Speichere …';
      try { await speichereMitRetry('wdhthemen:' + slugName, JSON.stringify(vorgaben), true); zeichne(); const i2 = panel.querySelector('#wdhGespeichert'); if (i2) i2.textContent = 'Gespeichert.'; }
      catch (e) { if (info) info.textContent = 'Konnte nicht gespeichert werden. Bitte nochmal versuchen.'; }
    }));
  }
  zeichne();
}

// Klassenübersicht: Kinder × Themen mit Ampelfarben (für die Unterrichtsplanung). Lädt erst auf Knopfdruck (2 Anfragen).
function wdhMatrixKnopf() {
  const view = document.getElementById('uebersichtView');
  if (!view || document.getElementById('wdhMatrixBtn')) return;
  const box = document.createElement('div');
  box.className = 'wdh-matrix-box';
  box.innerHTML = '<button type="button" class="btn secondary small" id="wdhMatrixBtn">Grammatik-Wiederholung B1: Themen der Klasse</button><div id="wdhMatrix"></div>';
  const body = document.getElementById('uebersichtBody');
  view.insertBefore(box, body ? body.nextSibling : null);
  document.getElementById('wdhMatrixBtn').addEventListener('click', ladeWdhMatrix);
}
async function ladeWdhMatrix() {
  const ziel = document.getElementById('wdhMatrix');
  ziel.innerHTML = '<p class="hint">Wird geladen …</p>';
  let subKeys = [];
  try { const r = await window.storage.list('submission:b1wdh_', true); subKeys = (r && r.keys) || []; }
  catch (e) { ziel.innerHTML = '<p class="hint">Konnte nicht geladen werden.</p>'; return; }
  const kinder = (uebersichtDaten || []).filter(s => subKeys.some(k => k.split(':')[2] === s.slug));
  if (!kinder.length) { ziel.innerHTML = '<p class="hint">Noch keine Abgaben in der Grammatik-Wiederholung B1.</p>'; return; }
  const neueste = {};
  subKeys.forEach(k => { const p = k.split(':'); const g = p[2] + ':' + p[1]; if (!neueste[g] || Number(p[3]) > Number(neueste[g].split(':')[3])) neueste[g] = k; });
  const reviewKeys = kinder.flatMap(s => WDH_B1_BLOECKE.map(t => s.status[t] && s.status[t].reviewKey).filter(Boolean));
  const werte = await holeViele(Object.values(neueste).concat(reviewKeys, kinder.map(s => 'wdhthemen:' + s.slug)));
  const zahl = {}; WDH_B1_THEMEN.forEach(t => { zahl[t.kz] = 0; });
  let h = '<div class="wdh-matrix-wrap"><table class="wdh-matrix"><tr><th class="wdh-kind">Kind</th>' + WDH_B1_THEMEN.map(t => `<th title="${escAttr(t.name)}">${t.kz}</th>`).join('') + '</tr>';
  kinder.forEach(s => {
    const keys = Object.values(neueste).filter(k => k.split(':')[2] === s.slug);
    let vorgaben = {}; try { vorgaben = JSON.parse(werte['wdhthemen:' + s.slug] || '{}') || {}; } catch (e) { /* keine */ }
    const stat = wdhStatistik(wdhPaareAus(werte, keys, s.status), vorgaben);
    h += `<tr><th class="wdh-kind">${escapeHtml(s.name)}</th>` + WDH_B1_THEMEN.map(t => {
      const x = stat[t.kz]; if (x.wiederholen && x.bearbeitet) zahl[t.kz]++;
      const marke = x.vorgabe === true ? '!' : x.vorgabe === false ? '✓' : '';
      return `<td class="wdh-zelle wdh-${x.farbe}" title="${escAttr(t.name)}: ${x.bearbeitet ? x.richtig + '/' + x.bearbeitet : 'noch nicht bearbeitet'}${x.vorgabe !== undefined ? ' — deine Entscheidung: ' + (x.vorgabe ? 'wiederholen' : 'nicht wiederholen') : ''}">${marke}</td>`;
    }).join('') + '</tr>';
  });
  h += '<tr><th class="wdh-kind">wiederholen</th>' + WDH_B1_THEMEN.map(t => `<td>${zahl[t.kz] || ''}</td>`).join('') + '</tr></table></div>';
  h += '<p class="hint">Grün = kann es, Gelb = noch üben, Rot = wiederholen, Grau = noch nicht bearbeitet. „!“/„✓“ = deine Entscheidung (wiederholen/nicht). Letzte Zeile: so viele Kinder sollten das Thema wiederholen.</p>';
  ziel.innerHTML = h;
}
