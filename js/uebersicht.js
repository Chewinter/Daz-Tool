/* ==========================================================================
   uebersicht.js — Startseite der Lehrkraft-Ansicht
   * „Wartet auf dich“: alle Abgaben, die noch nicht bewertet sind (älteste zuerst)
   * „Liegt beim Schüler“: Wiederholung nötig · Korrektur auf Papier (Haken „Zettel kontrolliert“) · angefangen/pausiert
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
  return { stufe: i >= 0 ? CURRICULUM[i].name : '', titel: titelMitSchritt(id, info.title) };
}

// Zettel-Haken (Korrektur auf Papier): am Status-Eintrag des Tests speichern
async function setzeZettel(testId, slugName, wert) {
  const key = `status:${testId}:${slugName}`;
  let obj = null;
  try { const r = await window.storage.get(key, true); obj = JSON.parse(r.value); } catch (e) { return false; }
  if (!obj) return false;
  if (wert) { obj.zettel = true; obj.zettelAm = new Date().toISOString(); } else { delete obj.zettel; delete obj.zettelAm; }
  try { await window.storage.set(key, JSON.stringify(obj), true); return true; } catch (e) { return false; }
}

async function ladeUebersichtsdaten() {
  const erlaubt = new Set(alleAbgabeIds());
  const [subRes, actRes] = await Promise.all([window.storage.list('submission:', true), window.storage.list('activitydone:', true)]);
  const schueler = STUDENTS.map(n => ({ name: n, slug: slug(n), done: new Set(), doneActs: new Set(), latest: {}, status: {}, pausiert: {}, manualIdx: -1 }));
  const bySlug = {}; schueler.forEach(s => { bySlug[s.slug] = s; });
  ((subRes && subRes.keys) || []).forEach(k => {
    const p = k.split(':'); const s = bySlug[p[2]];
    if (!s || !erlaubt.has(p[1]) || k.endsWith('_manuell')) return;
    s.done.add(p[1]);
    if (!s.latest[p[1]] || Number(p[3]) > Number(s.latest[p[1]])) s.latest[p[1]] = p[3];
  });
  ((actRes && actRes.keys) || []).forEach(k => { const p = k.split(':'); const s = bySlug[p[2]]; if (s) s.doneActs.add(p[1]); });
  // Status, pausierte Entwürfe, manuelle Freischaltung: eine Abfrage pro Schüler (in Gruppen)
  const GRUPPE = 4;
  for (let i = 0; i < schueler.length; i += GRUPPE) {
    await Promise.all(schueler.slice(i, i + GRUPPE).map(async (s) => {
      try {
        const res = await window.storage.listBySuffix(':' + s.slug, true);
        ((res && res.items) || []).forEach(({ key, value }) => {
          const p = key.split(':');
          try {
            if (p[0] === 'status' && p[2] === s.slug) s.status[p[1]] = JSON.parse(value);
            else if (p[0] === 'testprogress' && p[2] === s.slug) { const o = JSON.parse(value); s.pausiert[p[1]] = o && o.gespeichertAm ? new Date(o.gespeichertAm).getTime() : null; }
            else if (p[0] === 'manualaccess') s.manualIdx = aufloeseManualAccessIndex(JSON.parse(value));
          } catch (e) { /* kaputter Eintrag */ }
        });
      } catch (e) { s.fehler = true; }
    }));
  }
  schueler.forEach(s => { s.pos = berechnePosition(s); });
  return schueler;
}

// Aktuelle Station eines Schülers — gleiche Regel wie auf der Schüler-Seite (sequenziell, Bestandsschutz, manuelle Freischaltung)
function berechnePosition(s) {
  const istAct = id => curriculumItemInfo(id).kind === 'activity';
  const erledigt = id => istAct(id) ? s.doneActs.has(id) : (s.done.has(id) && s.status[id] && s.status[id].status === 'weiter');
  const hat = CURRICULUM.map(lf => lf.items.some(id => istAct(id) ? s.doneActs.has(id) : s.done.has(id)));
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
  const wartet = [], wiederholen = [], zettel = [], pausiert = [];
  schueler.forEach(s => {
    Object.keys(s.latest).forEach(tid => {
      if (curriculumItemInfo(tid).kind === 'activity') return;
      const st = s.status[tid];
      const a = testAnzeige(tid);
      const basis = { name: s.name, slug: s.slug, testId: tid, stufe: a.stufe, titel: a.titel };
      if (!st || !st.status || st.status === 'offen') wartet.push({ ...basis, ts: s.latest[tid] });
      else if (st.status === 'wiederholen') wiederholen.push({ ...basis, ts: st.reviewedAt ? new Date(st.reviewedAt).getTime() : s.latest[tid], kommentar: st.comment || '',
        teile: st.wiederholenTeile || st.punkteWiederholen || null });
      else if (st.status === 'weiter' && st.korrektur && !st.zettel) zettel.push({ ...basis, ts: st.reviewedAt ? new Date(st.reviewedAt).getTime() : s.latest[tid] });
    });
    Object.keys(s.pausiert).forEach(tid => {
      const a = testAnzeige(tid);
      pausiert.push({ name: s.name, slug: s.slug, testId: tid, stufe: a.stufe, titel: a.titel, ts: s.pausiert[tid] });
    });
  });
  const alt = (a, b) => Number(a.ts) - Number(b.ts);
  wartet.sort(alt); wiederholen.sort(alt); zettel.sort(alt); pausiert.sort(alt);
  return { wartet, wiederholen, zettel, pausiert };
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
    <span class="ub-chip ${A.wartet.length ? 'gelb' : ''}"><strong>${A.wartet.length}</strong> warten auf dich</span>
    <span class="ub-chip ${A.wiederholen.length ? 'rot' : ''}"><strong>${A.wiederholen.length}</strong> Wiederholung${A.wiederholen.length === 1 ? '' : 'en'} offen</span>
    <span class="ub-chip ${A.zettel.length ? 'orange' : ''}"><strong>${A.zettel.length}</strong> Zettel offen</span>
    <span class="ub-chip"><strong>${A.pausiert.length}</strong> angefangen</span></div>`;

  h += `<h2 class="ub-h">Wartet auf dich</h2>`;
  h += A.wartet.length ? A.wartet.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small ub-bewerten">Bewerten</button>')).join('') : '<p class="ub-leer">Nichts offen. Alles bewertet.</p>';

  h += `<h2 class="ub-h">Liegt beim Schüler</h2>`;
  h += `<h3 class="ub-h3">Wiederholung nötig (${A.wiederholen.length})</h3>`;
  h += A.wiederholen.length ? A.wiederholen.map(x => zeileHtmlUeb(x, '<button type="button" class="btn small secondary ub-bewerten">Ansehen</button>',
        x.kommentar ? `<div class="ub-komm">„${escapeHtml(x.kommentar)}“</div>` : '')).join('') : '<p class="ub-leer">Keine.</p>';
  h += `<h3 class="ub-h3">Korrektur auf Papier (${A.zettel.length})</h3>`;
  h += A.zettel.length ? A.zettel.map(x => zeileHtmlUeb(x, '<label class="ub-zettel"><input type="checkbox" class="ub-zettel-cb"> Zettel kontrolliert ✓</label>')).join('') : '<p class="ub-leer">Keine.</p>';
  h += `<h3 class="ub-h3">Angefangen / pausiert (${A.pausiert.length})</h3>`;
  h += A.pausiert.length ? A.pausiert.map(x => zeileHtmlUeb(x, '')).join('') : '<p class="ub-leer">Keine.</p>';

  // Spielbrett
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
  h += `</div><p class="ub-legende"><span class="fig wartet klein">gelb</span> wartet auf deine Bewertung · <span class="fig wdh klein">rot</span> muss wiederholen · Zahl = Anzahl offener Bewertungen</p>`;
  body.innerHTML = h;

  body.querySelectorAll('.fig').forEach(b => b.addEventListener('click', () => oeffneSchueler(b.getAttribute('data-slug'))));
  body.querySelectorAll('.ub-bewerten').forEach(b => b.addEventListener('click', () => { const z = b.closest('.ub-zeile'); oeffneSchueler(z.getAttribute('data-slug'), z.getAttribute('data-test')); }));
  body.querySelectorAll('.ub-zettel-cb').forEach(cb => cb.addEventListener('change', async () => {
    const z = cb.closest('.ub-zeile'); cb.disabled = true;
    const ok = await setzeZettel(z.getAttribute('data-test'), z.getAttribute('data-slug'), true);
    if (ok) {
      const s = uebersichtDaten.find(x => x.slug === z.getAttribute('data-slug'));
      if (s && s.status[z.getAttribute('data-test')]) s.status[z.getAttribute('data-test')].zettel = true;
      rendereUebersicht();
    } else { cb.disabled = false; cb.checked = false; alert('Der Haken konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
  }));
}

async function ladeUebersicht(still) {
  const body = document.getElementById('uebersichtBody');
  if (!still) body.innerHTML = '<p class="ub-leer">Übersicht wird geladen …</p>';
  try {
    uebersichtDaten = await ladeUebersichtsdaten();
    rendereUebersicht();
    document.getElementById('lastUpdated').textContent = 'Zuletzt aktualisiert: ' + new Date().toLocaleTimeString('de-DE');
  } catch (e) {
    body.innerHTML = '<p class="ub-leer" style="color:var(--bad);">Die Übersicht konnte nicht geladen werden. <button type="button" class="btn small secondary" id="ubNochmal">Nochmal versuchen</button></p>';
    const b = document.getElementById('ubNochmal'); if (b) b.addEventListener('click', () => ladeUebersicht(false));
  }
}

function zeigeUebersicht() {
  document.getElementById('detailView').classList.add('hidden');
  document.getElementById('uebersichtView').classList.remove('hidden');
  ladeUebersicht(false);
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
    const karte = [...document.querySelectorAll('#submissionList .submission')].find(c => c.dataset.test === testId);
    if (karte) karte.scrollIntoView({ block: 'start' });
  }
}
document.getElementById('zurUebersicht').addEventListener('click', () => zeigeUebersicht());
