/* ==========================================================================
   bewertung.js — Lehrkraft-Ansicht: Antworten prüfen und bewerten

   * Jede Antwort hat einen Schalter ✓ / ✗. Voreingestellt ist das automatische Ergebnis; du kannst es überschreiben.
   * Abschlusstests: Punkte → Note (Sockel-Prinzip, siehe shared.js). Die Note wird nur angezeigt, sie entscheidet nichts.
   * Ablauf (berichte/ABLAUF_Korrektur_Rueckgabe.md): Bewertung abschließen → mit Fehlern Rückgabe (Korrektur auf dem
     Blatt) → „Handschriftliche Korrektur ist ok“ → Schüler wiederholt nur die ✗-Aufgaben → „Endgültig erledigt“ oder
     „Nochmal Korrektur auf Zettel“. Ohne Fehler direkt „erledigt“.
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
  const A = { art: 'vokabel', items: [], teile: [], keineNote: !!(t && t.keineNote) };   // keineNote: Modelltest Fit B1 (Paket 4)

  if (sub.isPunkteTest) {
    A.art = 'abschluss';
    // Abgabe zu einer älteren Fassung des Tests (testVersion, z. B. A1.5 Lernfeld-Test seit 07.10.2026): nur die gespeicherten Details zeigen
    const meta = ((sub.testVersion || 1) === ((t && t.testVersion) || 1)) ? abschlussMetaFuer(sub.testId) : null;
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
      // Ältere Abgaben: Kind hat im Endungsfeld das ganze Verb geschrieben, damals wurde der Stamm doppelt
      // davorgesetzt („wohnwohne“, falsch). Jetzt wie bei neuen Abgaben bewerten (stammWert, Lukas 06.10.2026).
      let antwort = d.antwort, auto = d.korrekt === undefined ? null : d.korrekt;
      const roh = m && m.stem && sub.felderAntworten ? sub.felderAntworten[key] : undefined;
      if (roh != null && !d.uebernommen && stammWert(m, roh) !== d.antwort) { antwort = stammWert(m, roh); auto = pruefeFeld(m, antwort); }
      A.items.push({ id: 'd' + i, key, teil: teilId, frage: d.frage, antwort, auto,
        korrektAntwort: d.korrektAntwort, punkte: (d.punkte != null ? d.punkte : (m ? m.points : 1)), manuell: m ? !!m.manuell : d.korrekt === null,
        bild: m && m.bild, bildGross: m && m.bildGross });   // Bild zur Aufgabe (Paket C2)
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
    A.teile = nrs.map(nr => { const p = def && def.punkte ? def.punkte.find(x => x.nr === nr) : null; return { id: 'p' + nr, nr, titel: `Aufgabe ${nr}${p && p.titel ? ' — ' + p.titel : ''}` }; });
    (sub.teilDetails || []).forEach((d, i) => {
      const defItem = def && def.punkte ? ((def.punkte.find(x => x.nr === d.punktNr) || {}).uebung || { items: [] }).items[d.itemIdx] : null;
      const frei = !!(defItem && (defItem.manuell || defItem.regel));   // freie Sätze: nur Beispiel/Regel zum Vergleich, keine feste Lösung
      const satz = d.heft && defItem && !frei ? heftSatz(defItem) : '';  // Lückensatz im Heft: ganzen Satz mit Lösung zeigen
      A.items.push({ id: 'd' + i, teil: 'p' + d.punktNr, itemIdx: d.itemIdx, frage: d.frage, antwort: d.antwort, auto: d.korrekt === undefined ? null : d.korrekt, korrektAntwort: d.korrektAntwort, punkte: 1, heft: !!d.heft, frei, satz });
    });
    return A;
  }

  // Vokabeltest: Teil 1 / 2 / 3 (Sätze) / 4
  const teilTitel = {
    teil1: 'Teil 1 — Bildzuordnung', teil2: 'Teil 2 — Lücken füllen', teil3: 'Teil 3 — Eigene Sätze',
    teil4: 'Teil 4' + (t && t.teil4Label ? ' — ' + t.teil4Label : ''),
  };
  const teilVon = d => d.teil || (String(d.frage).indexOf('Bildzuordnung') === 0 ? 'teil1' : String(d.frage).indexOf('___') >= 0 ? 'teil2' : 'teil4');
  // Teil 4: Fragetext aus dem aktuellen Test nehmen (teil4Frage), damit auch schon abgegebene Tests nicht mehr
  // "Gegenteil von …" zeigen, wo gar keine Gegenteile gefragt sind (Paket B / C3).
  const frage4 = d => {
    const it = (t && d.num != null && teilVon(d) === 'teil4') ? (t.teil4 || []).find(x => x.num === d.num) : null;
    return (it && (it.frage || t.teil4Frage)) ? teil4FrageText(t, it) : d.frage;
  };
  // Abgaben von vor einer Neunummerierung (ohne testVersion): Nummern auf den aktuellen Stand bringen
  const nn = (teil, num) => { if (num == null) return num; const r = alteNummernUmrechnen(sub.testId, { [teil]: [num] }, sub); return r[teil][0]; };
  (sub.teilDetails || []).forEach((d0, i) => {
    const d = Object.assign({}, d0, { num: nn(teilVon(d0), d0.num) });
    A.items.push({ id: 'd' + i, teil: teilVon(d), num: d.num, frage: frage4(d), antwort: d.antwort, auto: d.korrekt === undefined ? null : d.korrekt, korrektAntwort: d.korrektAntwort, punkte: 1, ...vokabelBilder(t, d) });
  });
  (sub.teil3 || []).forEach((s, i) => {
    const it3 = t && (t.teil3 || []).find(x => x.num === nn('teil3', s.num));
    A.items.push({ id: 's' + i, teil: 'teil3', num: nn('teil3', s.num), satz: true, bild: (it3 && it3.bild) || undefined, frage: s.word + (s.pronomen ? ' (' + s.pronomen + ' …)' : ''), antwort: s.satz,
      auto: s.korrekt === undefined ? null : s.korrekt, korrektAntwort: s.verbesserung || '', feedback: s.feedback || '', punkte: 1 });
  });
  ['teil1', 'teil2', 'teil3', 'teil4'].forEach(k => { if (A.items.some(it => it.teil === k)) A.teile.push({ id: k, nr: k, titel: teilTitel[k] }); });
  return A;
}

// Bilder einer Vokabeltest-Antwort: Teil 1 = gewähltes und richtiges Bild, Teil 4 mit Bild-Aufgabe = Aufgabenbild (Paket C2)
function vokabelBilder(t, d) {
  if (!t || d.num == null) return {};
  const teil = d.teil || '';
  const it = (t[teil] || []).find(x => x.num === d.num);
  if (!it) return {};
  if (teil === 'teil1') return { bilder: [it.icons.find(n => n.replace(/_/g, ' ') === d.antwort) || (d.antwort === it.word ? it.icons[it.correct] : null), it.icons[it.correct]] };
  if (teil === 'teil4' && (it.bild || it.bildNeben)) return { bild: it.bild || it.bildNeben };
  if (teil === 'teil2' && it.bildGross) return { bildGross: it.bildGross };
  return {};
}
// Bild-HTML zu einer Antwort; das große Bild (z. B. Körperfigur) nur beim ersten Vorkommen je Karte (gezeigt-Set)
function antwortBilderHtml(it, gezeigt) {
  const img = (n, cls) => (n && ICONS[n]) ? `<img class="${cls}" src="${iconSrc(n)}" alt="">` : '';
  let h = '';
  if (it.bildGross && gezeigt && !gezeigt.has(it.bildGross)) { gezeigt.add(it.bildGross); h += `<div class="bw-bild-gross-wrap">${img(it.bildGross, 'bw-bild-gross')}</div>`; }
  if (it.bild) h += img(it.bild, 'bw-bild');
  if (it.bilder) h += `<span class="bw-bilder">${img(it.bilder[0], 'bw-bild')}${it.bilder[1] && it.bilder[1] !== it.bilder[0] ? '<span class="bw-pfeil">richtig:</span>' + img(it.bilder[1], 'bw-bild') : ''}</span>`;
  return h;
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
  const note = (A.art === 'abschluss' && max && !A.keineNote) ? berechneNote(punkte, max) : null;
  return { teile, punkte, max, prozent, note, offen, falsch };
}

// Grammatik-Hybrid: Das Kind schreibt Lückensätze ganz ins Heft — die Lehrkraft sieht den ganzen Satz mit eingesetzter Lösung
// („Ich stehe um sieben Uhr ___. (aufstehen)“ + „auf“ -> „Ich stehe um sieben Uhr auf.“). Passt die Lösung nicht sicher, bleibt sie, wie sie ist.
function heftSatz(item) {
  const frage = String(item.frage || '').split('→').pop().trim();   // „Satz → Lotte gibt ___ den Ball.“: nur die rechte Seite
  const LUECKE = /([A-Za-zÄÖÜäöüß]*)(_{2,}|…|\.\.\.)/g;              // Lücke, ggf. mit Wortanfang davor („originell__“, „speziell…“)
  const luecken = frage.match(LUECKE) || [];
  if (!luecken.length) return '';
  const varianten = (Array.isArray(item.antwort) ? item.antwort : [item.antwort]).map(a => String(a).replace(/^[a-f]\)\s*/, ''));
  if (/[.!?]$/.test(varianten[0].trim())) return '';                  // Lösung ist schon ein ganzer Satz: so zeigen, wie sie ist
  const teile = luecken.length === 1 ? [varianten[0]] : varianten[0].split(/\s+/);
  if (teile.length !== luecken.length) return '';
  let i = 0;
  let satz = frage.replace(LUECKE, (m, stamm) => { const t = teile[i++]; return stamm && t.toLowerCase().startsWith(stamm.toLowerCase()) ? t : stamm + t; })
    .replace(/\s*\([^)]*\)\s*/g, ' ')                   // Hinweise in Klammern („(fahren)“, „(der Hund)“, „(s/S)“) weg
    .replace(/\b(\p{L}{3,})\s+\1\b/gu, '$1')             // „auf dem Sofa Sofa“: Lösung enthält schon das Wort danach
    .replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  satz = satz.charAt(0).toUpperCase() + satz.slice(1);
  if (/(…|\.\.\.)\s*$/.test(frage) && !/[.!?“"]$/.test(satz)) satz += '.';   // „Laís fährt nach Recife, …“ + Ergänzung: Satzende
  const andere = luecken.length === 1 ? varianten.slice(1).filter(v => v && !/[,/]/.test(v)) : [];
  return satz + (andere.length ? ` (auch: ${andere.join(', ')})` : '');
}
function zeileHtml(it, ov, fb, fbOffen, gezeigt) {
  const e = effektiv(it, ov);
  const geaendert = ov && ov[it.id] !== undefined && ov[it.id] !== it.auto;
  const opt = (it.korrektAntwort || '').toString().split(' / ').map(s => s.trim()).filter(Boolean);
  const tipp = (e === false && !it.satz && typeof istWahrscheinlichTippfehler === 'function') ? istWahrscheinlichTippfehler(it.antwort, opt.length ? opt : it.korrektAntwort) : false;
  const cls = e === true ? 'antwort-correct' : e === false ? (tipp ? 'antwort-typo' : 'antwort-wrong') : '';
  const zeichen = e === true ? '✓' : e === false ? (tipp ? '⚠' : '✗') : '—';
  let text = `${antwortBilderHtml(it, gezeigt)}${zeichen} ${escapeHtml(it.frage)} — „${escapeHtml(it.antwort)}“`;
  if (it.heft) {   // Grammatik-Hybrid (02.11.2026): im Heft geschrieben — Lösung immer daneben, ✓/✗ = abhaken
    text = `<span class="bw-heft">Heft</span>${zeichen} ${escapeHtml(it.frage)}<div class="bw-heft-loesung">${it.frei ? 'Freie Antwort, zum Vergleich' : 'Lösung'}: „${escapeHtml(it.satz || it.korrektAntwort || '')}“</div>`;
    if (e === null || e === undefined) text += ' <em>(im Heft ansehen und abhaken)</em>';
    if (geaendert) text += ' <em class="geaendert">(von dir abgehakt)</em>';
    return `<div class="antwortzeile bw-zeile ${cls} bw-heftzeile" data-id="${it.id}"><div class="bw-text">${text}</div>
      <div class="bw-toggle" role="group" aria-label="Im Heft richtig oder falsch">
        <button type="button" class="bw-btn ${e === true ? 'an-ok' : ''}" data-wert="true" title="im Heft richtig">✓</button>
        <button type="button" class="bw-btn ${e === false ? 'an-bad' : ''}" data-wert="false" title="im Heft falsch">✗</button>
      </div></div>`;
  }
  if (e === false && it.korrektAntwort) text += `, ${it.satz ? 'Vorschlag' : 'richtig wäre'}: „${escapeHtml(it.korrektAntwort)}“`;
  if (tipp) text += ' <em>(evtl. nur Tippfehler)</em>';
  if (e === null || e === undefined) text += ' <em>(nicht automatisch geprüft — bitte bewerten)</em>';
  if (it.satz && it.feedback) text += `<div class="kifeedback">${escapeHtml(it.feedback)}</div>`;
  if (geaendert) text += ' <em class="geaendert">(von dir geändert)</em>';
  const zeile = `<div class="antwortzeile bw-zeile ${cls}" data-id="${it.id}">
      <div class="bw-text">${text}</div>
      <div class="bw-toggle" role="group" aria-label="Richtig oder falsch">
        <button type="button" class="bw-btn ${e === true ? 'an-ok' : ''}" data-wert="true" title="als richtig werten">✓</button>
        <button type="button" class="bw-btn ${e === false ? 'an-bad' : ''}" data-wert="false" title="als falsch werten">✗</button>
      </div></div>`;
  // Hinweis für den Schüler (richtige Lösung + Fehler) — bei Sätzen/eigenen Antworten sofort offen, sonst per Link
  const f = (fb && fb[it.id]) || null;
  const offen = e === false;
  let fbHtml = '';
  if (offen) {
    fbHtml = `<div class="bw-fb" data-id="${it.id}"><input type="text" class="bw-fb-loesung" placeholder="So heißt es richtig …" value="${escapeHtml(f ? f.loesung || '' : '')}"><select class="bw-fb-preset" title="Fehlerart wählen"><option value="">Fehlerart …</option><option>Groß- und Kleinschreibung</option><option>Falsche Verbform</option><option>Falscher Satzbau</option></select><input type="text" class="bw-fb-fehler" placeholder="Wo war der Fehler? Auswahl links oder eigener Text" value="${escapeHtml(f ? f.fehler || '' : '')}"></div>`;
  } else if (e === false) {
    fbHtml = `<div class="bw-fb-zu"><button type="button" class="bw-fb-link" data-id="${it.id}">+ Hinweis für den Schüler</button></div>`;
  }
  return zeile + fbHtml;
}

// Baut den kompletten Bewertungsbereich einer Abgabe (ersetzt die alte Karte für alle Nicht-Eingangstests)
async function baueBewertung(div, sub, statusObj, statusKey) {
  const A = analysiereAbgabe(sub);
  const draft = sub._draft || {};
  const ov = Object.assign({}, draft.overrides || {});
  let teilWdh = Array.isArray(draft.teilWdh) ? draft.teilWdh.slice() : null;
  let teilWdhDirty = !!teilWdh;
  const fb = Object.assign({}, draft.fb || {});      // Hinweise pro Antwort: { id: { loesung, fehler } }
  // Checkliste je Kriterium (Modelltest Schreiben, Paket 4): { Index: true/false } — nur für die Lehrkraft, keine Punkte
  const checkDef = (TESTS[sub.testId] && TESTS[sub.testId].checkliste) || null;
  const ck = Object.assign({}, draft.checkliste || {});
  const fbOffen = new Set();
  const dt = new Date(sub.timestamp);
  const dateStr = dt.toLocaleDateString('de-DE') + ' ' + dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const titelAnzeige = anzeigeTitel(sub.testId, sub.testTitle);
  const stufeAnzeige = (typeof testAnzeige === 'function' ? testAnzeige(sub.testId).stufe : '') || '';
  const istAbschluss = A.art === 'abschluss';
  const ab = ablaufStatus(statusObj);
  const istWdhAbgabe = ab === 'offen' && !!statusObj.wiederholung;   // Abgabe der digitalen Wiederholung (Schritt 4)
  const statusText = ab === 'zettel_offen' ? 'Rückgabe — Korrektur auf dem Blatt offen'
    : ab === 'wiederholung_frei' ? 'Korrektur ok — Wiederholung liegt beim Schüler'
    : ab === 'endgueltig' ? 'Endgültig erledigt'
    : istWdhAbgabe ? 'Wiederholung abgegeben — bitte prüfen' : 'Noch nicht bewertet';

  function standardTeilWdh(erg) {
    // Voreinstellung: Teile mit Fehlern (Abschlusstest: unter 70 % der Teilpunkte); bei Abschluss + schlechter Note mindestens alle mit Fehlern
    let ids = erg.teile.filter(x => istAbschluss ? (x.max && x.quote < 0.7) : x.falsch > 0).map(x => x.id);
    return ids;
  }

  div.classList.add('collapsed');
  div.innerHTML = `
    <div class="head"><h3>${escapeHtml(sub.name)}</h3><span class="meta">${stufeAnzeige ? `<strong>${escapeHtml(stufeAnzeige)}</strong> · ` : ''}${escapeHtml(titelAnzeige)} · ${dateStr}</span></div>
    <span class="status-tag ${ab}">${statusText}</span><span class="bw-chevron">▾</span>
    <div class="bw-details">
    <div class="bw-summe"></div>
    <div class="bw-teile"></div>
    <div class="bw-checkliste"></div>
    <label class="bw-label">Kommentar für den Schüler (optional) <span class="bw-pflicht"></span></label>
    <textarea class="comment-input" placeholder="optional – z. B. was noch intensiv geübt werden muss"></textarea>
    <div class="bw-vorschau"></div>
    <div class="bw-aktion"></div>
    </div>`;
  const toggleKarte = () => { div.classList.toggle('collapsed'); if (div.classList.contains('collapsed')) kartenOffen.delete(sub.testId); else kartenOffen.add(sub.testId); };
  div.querySelector('.head').addEventListener('click', toggleKarte);
  div.querySelector('.status-tag').addEventListener('click', toggleKarte);
  const summeEl = div.querySelector('.bw-summe');
  const teileEl = div.querySelector('.bw-teile');
  const kommentarEl = div.querySelector('.comment-input');
  const vorschauEl = div.querySelector('.bw-vorschau');
  const aktionEl = div.querySelector('.bw-aktion');
  kommentarEl.value = (draft.kommentar != null ? draft.kommentar : statusObj.comment) || '';
  const pflichtEl = div.querySelector('.bw-pflicht');

  function aktualisiere() {
    const erg = berechneErgebnis(A, ov);
    if (!teilWdhDirty) teilWdh = standardTeilWdh(erg);
    const gezeigt = new Set();   // große Bilder (Körperfigur) nur einmal je Karte
    // Teile + Zeilen
    teileEl.innerHTML = A.teile.map(tl => {
      const te = erg.teile.find(x => x.id === tl.id);
      const its = A.items.filter(it => it.teil === tl.id);
      const zahl = istAbschluss ? `${te.punkte} von ${te.max} Punkten` : `${te.richtig} von ${te.gesamt} richtig`;
      return `<div class="bw-teil" data-teil="${tl.id}">
        <h4>${escapeHtml(tl.titel)} <span class="bw-teilzahl ${te.falsch ? 'hat-fehler' : ''}">${zahl}</span></h4>
        ${its.length ? its.map(it => zeileHtml(it, ov, fb, fbOffen, gezeigt)).join('') : '<div class="bw-leer">Keine Antworten in diesem Teil.</div>'}
        ${(te.falsch && ab === 'offen') ? '<div class="bw-wdh-hinweis">Nach der Korrektur auf dem Blatt wählst du: endgültig erledigt oder digitale Wiederholung genau dieser ✗-Aufgaben.</div>' : ''}
      </div>`;
    }).join('');
    // Summe
    if (istAbschluss) {
      summeEl.innerHTML = `<div class="bw-ergebnis"><strong>${erg.punkte} von ${erg.max} Punkten</strong> · ${erg.prozent} % · Note <strong>${erg.note || '–'}</strong>${erg.offen ? ` <em>(noch ${erg.offen} Antwort${erg.offen === 1 ? '' : 'en'} unbewertet)</em>` : ''}</div>`;
    } else {
      summeEl.innerHTML = `<div class="bw-ergebnis"><strong>${erg.teile.reduce((s, x) => s + x.richtig, 0)} von ${erg.teile.reduce((s, x) => s + x.gesamt, 0)} richtig</strong> — ${erg.falsch} falsch${erg.offen ? `, ${erg.offen} unbewertet` : ''}</div>`;
    }
    // Vorschau + Knöpfe je Zustand (Ablauf Korrektur/Rückgabe). Die Note bei Lernfeld-Tests ist nur Information.
    vorschauEl.innerHTML = (istAbschluss && !A.keineNote ? `<div class="bw-hinweis">Note ${erg.note || '–'} — nur zur Information, die Note entscheidet nichts.</div>` : '') +
      (erg.falsch ? `<div class="bw-hinweis">${erg.falsch} Antwort${erg.falsch === 1 ? '' : 'en'} falsch oder leer.</div>` : `<div class="bw-hinweis gut">Alles richtig.</div>`);
    if (ab === 'offen' && istWdhAbgabe) {
      aktionEl.innerHTML = `<div class="status-controls">
        <button type="button" class="btn ok small bw-endgueltig">Endgültig erledigt</button>
        <button type="button" class="btn danger small bw-nochmal-zettel" ${erg.falsch ? '' : 'disabled title="Keine Antwort ist mit ✗ markiert."'}>Nochmal Korrektur auf Zettel (die ✗-Aufgaben)</button></div>`;
    } else if (ab === 'offen') {
      const heftOffen = A.items.some(it => it.heft && effektiv(it, ov) == null);
      aktionEl.innerHTML = `<div class="status-controls">${heftOffen ? '<button type="button" class="btn ok small bw-heft-alle">Alle Heft-Aufgaben ✓</button>' : ''}
        <button type="button" class="btn ok small bw-abschliessen">${erg.falsch
        ? 'Bewertung abschließen — Rückgabe: Korrektur auf dem Blatt' : 'Bewertung abschließen — alles richtig, erledigt'}</button> <button type="button" class="btn secondary small bw-endgueltig-direkt">Endgültig erledigt</button></div>`;
    } else if (ab === 'zettel_offen') {
      aktionEl.innerHTML = `<div class="bw-hinweis">Der Schüler schreibt die richtigen Antworten auf sein Blatt und zeigt es dir.</div>
        <div class="status-controls"><button type="button" class="btn ok small bw-korrektur-ok" data-wdh="0">Korrektur ok — endgültig erledigt</button>
        <button type="button" class="btn secondary small bw-korrektur-ok" data-wdh="1">Korrektur ok — Wiederholung</button></div>`;
    } else if (ab === 'wiederholung_frei') {
      aktionEl.innerHTML = '<div class="bw-hinweis">Korrektur ok. Der Schüler macht jetzt nur die falschen Aufgaben noch einmal.</div><div class="status-controls"><button type="button" class="btn secondary small bw-endgueltig-direkt">Endgültig erledigt</button></div>';
    } else {
      aktionEl.innerHTML = '<div class="bw-hinweis gut">Endgültig erledigt. Keine Wiederholung mehr.</div>';
    }
    // Korrektur-Karten (12.11.2026): so sieht das Kind die Rückgabe
    if (ab !== 'offen' && statusObj.reviewKey && sub._neueste !== false && typeof korrekturLernfeld === 'function' && korrekturLernfeld(sub.testId))
      aktionEl.insertAdjacentHTML('beforeend', '<div class="status-controls"><button type="button" class="btn secondary small bw-karten">So sieht das Kind die Korrektur</button></div><div class="bw-karten-box"></div>');
    pflichtEl.textContent = '';
    if (sub._neueste === false) { aktionEl.innerHTML = '<div class="bw-hinweis">Ältere Abgabe — nur zum Ansehen. Bewertet wird immer die neueste Abgabe dieses Tests.</div>' + (ab !== 'endgueltig' ? '<div class="status-controls"><button type="button" class="btn secondary small bw-endgueltig-direkt">Endgültig erledigt</button></div>' : ''); vorschauEl.innerHTML = ''; }
  }

  function speichereEntwurf() {
    clearTimeout(speichereEntwurf._t);
    speichereEntwurf._t = setTimeout(async () => {
      const draftObj = { overrides: ov, fb, teilWdh: teilWdhDirty ? teilWdh : null, kommentar: kommentarEl.value, checkliste: ck, savedAt: new Date().toISOString() };
      try { await window.storage.set(draftKeyFuer(sub), JSON.stringify(draftObj), true); } catch (e) { /* Entwurf nicht kritisch */ }
    }, 350);
  }

  // Nach dem Abschließen sind die ✓/✗-Schalter gesperrt (die Rückgabe ist beim Schüler); ältere Abgaben sowieso.
  const nurAnsicht = sub._neueste === false || ab !== 'offen';
  const checkEl = div.querySelector('.bw-checkliste');
  if (TESTS[sub.testId] && TESTS[sub.testId].schluesselVorlaeufig) checkEl.insertAdjacentHTML('beforebegin', '<div class="bw-hinweis">Lösungsschlüssel vorläufig: aus den Texten abgeleitet, noch nicht mit dem offiziellen Schlüssel abgeglichen.</div>');
  if (checkDef) {
    checkEl.innerHTML = '<div class="bw-label">Checkliste (nur für dich, ergibt keine Punkte und keine Note)</div>' +
      checkDef.map((k, i) => `<label class="bw-check"><input type="checkbox" data-i="${i}"${ck[i] ? ' checked' : ''}${nurAnsicht ? ' disabled' : ''}> ${escapeHtml(k)}</label>`).join('');
    checkEl.addEventListener('change', ev => { const i = ev.target.getAttribute('data-i'); if (i == null) return; ck[i] = ev.target.checked; speichereEntwurf(); });
  }
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
  teileEl.addEventListener('change', (ev) => {
    if (!ev.target.classList.contains('bw-fb-preset') || nurAnsicht) return;
    const box = ev.target.closest('.bw-fb'); const feld = box.querySelector('.bw-fb-fehler');
    const wahl = ev.target.value; if (!wahl) return;
    const alt = feld.value.trim();
    feld.value = alt && alt.indexOf(wahl) < 0 ? (wahl + ' – ' + alt) : (alt || wahl);
    ev.target.value = '';
    feld.dispatchEvent(new Event('input', { bubbles: true }));
  });
  teileEl.addEventListener('input', (ev) => {
    const box = ev.target.closest('.bw-fb');
    if (!box || nurAnsicht) return;
    const id = box.getAttribute('data-id');
    const l = box.querySelector('.bw-fb-loesung').value, f = box.querySelector('.bw-fb-fehler').value;
    if (l.trim() || f.trim()) fb[id] = { loesung: l, fehler: f }; else delete fb[id];
    speichereEntwurf();
  });
  teileEl.addEventListener('click', (ev) => {
    const link = ev.target.closest('.bw-fb-link');
    if (!link || nurAnsicht) return;
    fbOffen.add(link.getAttribute('data-id'));
    aktualisiere();
  });
  kommentarEl.addEventListener('input', speichereEntwurf);

  // aktion: 'abschliessen' (erste Bewertung: mit Fehlern -> Rückgabe, sonst erledigt) | 'endgueltig' | 'zettel' (nochmal Korrektur)
  async function abschliessen(aktion) {
    const erg = berechneErgebnis(A, ov);
    if (erg.offen > 0) { alert('Bitte zuerst alle Antworten bewerten, die noch „nicht automatisch geprüft“ sind (mit ✓ oder ✗).'); return; }
    const kommentar = kommentarEl.value.trim();
    // "Rückgabe" heißt automatisch: alles, was gerade als ✗ markiert ist (falsch oder leer), kommt später noch einmal.
    const falscheItems = A.items.filter(it => effektiv(it, ov) === false);
    const neu = aktion === 'endgueltig' ? 'endgueltig' : aktion === 'zettel' ? 'zettel_offen' : (falscheItems.length ? 'zettel_offen' : 'endgueltig');
    if (neu === 'zettel_offen' && !falscheItems.length) { alert('Es ist gerade keine Antwort als ✗ markiert — eine Korrektur auf dem Zettel ergibt so keinen Sinn.'); return; }
    const gewaehlt = [...new Set(falscheItems.map(it => it.teil))];
    const teileErg = erg.teile.map(x => ({ id: x.id, titel: x.titel, richtig: x.richtig, gesamt: x.gesamt, punkte: x.punkte, max: x.max, wiederholen: neu === 'zettel_offen' && gewaehlt.indexOf(x.id) >= 0 }));
    const hinw = it => { const f = fb[it.id]; return f ? { loesung: (f.loesung || '').trim(), hinweis: (f.fehler || '').trim() } : { loesung: '', hinweis: '' }; };
    const fehler = A.items.filter(it => !it.satz && effektiv(it, ov) === false).map(it => ({ teil: (A.teile.find(x => x.id === it.teil) || {}).titel || '', frage: it.frage, antwort: it.antwort, korrektAntwort: it.korrektAntwort || '', teilId: it.teil, num: it.num, itemIdx: it.itemIdx, key: it.key || null, bild: it.bild || null, bildGross: it.bildGross || null, ...hinw(it) })); // teilId+num: damit die Schüler-Seite das Bild zur Aufgabe findet
    const saetze = A.items.filter(it => it.satz && effektiv(it, ov) === false).map(it => ({ frage: it.frage, satz: it.antwort, vorschlag: it.korrektAntwort || '', teilId: it.teil, num: it.num, itemIdx: it.itemIdx, ...hinw(it) }));   // teilId+num: Korrektur-Karte (12.11.2026)
    const felder = istAbschluss ? A.items.filter(it => it.key).map(it => ({ key: it.key, korrekt: effektiv(it, ov) === true })) : [];
    const ergebnis = neu === 'zettel_offen' ? 'zettel' : 'erledigt';
    const review = { v: 2, testId: sub.testId, name: sub.name, titel: titelAnzeige, art: A.art, reviewedAt: new Date().toISOString(), kommentar, ergebnis, korrektur: neu === 'zettel_offen',
      punkte: istAbschluss ? erg.punkte : null, max: istAbschluss ? erg.max : null, prozent: istAbschluss ? erg.prozent : null, note: erg.note,
      richtig: erg.teile.reduce((s, x) => s + x.richtig, 0), gesamt: erg.teile.reduce((s, x) => s + x.gesamt, 0),
      teile: teileErg, fehler, saetze, felder,
      checkliste: checkDef ? checkDef.map((k, i) => ({ kriterium: k, ok: !!ck[i] })) : undefined,
      // Grammatik-Blöcke: Ergebnis jeder Aufgabe nach deiner Bewertung ("<Aufgabe>-<Nr.>": true/false), für die Themen-Ampel
      // des B1-Wiederholungstests (Paket 3, 28.10.2026)
      ergebnisse: A.art === 'grammatik' ? Object.fromEntries(A.items.map(it => [String(it.teil).slice(1) + '-' + it.itemIdx, effektiv(it, ov)])) : undefined };
    const status = { status: neu, comment: kommentar, reviewedAt: review.reviewedAt, reviewKey: reviewKeyFuer(sub), ergebnis, note: erg.note || null,
      testVersion: (TESTS[sub.testId] && TESTS[sub.testId].testVersion) || 1 };   // Nummern in wiederholenVokabel sind aktuelle
    if (neu === 'zettel_offen') {
      // Genaue Einzelaufgaben merken — nach "Handschriftliche Korrektur ist ok" wird genau das noch einmal abgefragt,
      // was hier gerade als ✗ markiert ist. (Alte teilbasierte Felder lesen die Wiederholungs-Funktionen weiterhin.)
      if (A.art === 'grammatik') {
        const g = {};
        let wdhItems = falscheItems;
        // B1-Wiederholung (Paket 3): digital wiederholt wird nur, was in einem Thema mit „wiederholen“ (gelb/rot bzw. deine
        // Entscheidung) falsch war. Auf dem Zettel korrigiert das Kind trotzdem alle ✗.
        if (/^b1wdh_/.test(sub.testId) && window.wdhLehrkraft && window.wdhLehrkraft.slug === slug(sub.name)) {
          const dieses = { sub, review: { ergebnisse: Object.fromEntries(A.items.map(it => [String(it.teil).slice(1) + '-' + it.itemIdx, effektiv(it, ov)])) } };
          const stat = wdhStatistik(window.wdhLehrkraft.paare.filter(p => p.sub.testId !== sub.testId).concat([dieses]), window.wdhLehrkraft.vorgaben);
          const def = ACTIVITIES[sub.testId];
          wdhItems = falscheItems.filter(it => {
            const p = def && def.punkte.find(x => x.nr === Number(String(it.teil).slice(1)));
            const th = p && p.uebung.items[it.itemIdx] && p.uebung.items[it.itemIdx].thema;
            return !th || !stat[th] || stat[th].wiederholen;
          });
        }
        wdhItems.forEach(it => { const nr = Number(String(it.teil).slice(1)); (g[nr] = g[nr] || []).push(it.itemIdx); });
        if (Object.keys(g).length) status.wiederholenGrammatik = g;   // leer: nach dem Zettel-Haken gleich „endgültig erledigt“
      } else if (A.art === 'abschluss') {
        status.wiederholenFelder = falscheItems.map(it => it.key).filter(Boolean);
      } else {
        const v = {};
        falscheItems.forEach(it => { (v[it.teil] = v[it.teil] || []).push(it.num); });
        status.wiederholenVokabel = v;
      }
      status.wiederholenTeile = gewaehlt; // zeigt der Lehrkraft-Ansicht, welche Teile betroffen sind
    }
    try {
      // Bewertung, Status und Entwurf in EINER Anfrage
      await window.storage.setMany([
        { key: reviewKeyFuer(sub), value: JSON.stringify(review) },
        { key: statusKey, value: JSON.stringify(status) },
        { key: draftKeyFuer(sub), value: JSON.stringify({ overrides: ov, fb, teilWdh: gewaehlt, kommentar, checkliste: ck, savedAt: review.reviewedAt }) },
      ], true);
    } catch (e) { alert('Konnte die Bewertung nicht speichern (' + (e && e.message ? e.message : 'Speicherfehler') + '). Bitte nochmal versuchen.'); return; }
    loadSubmissions(false);
  }
  aktionEl.addEventListener('click', async (ev) => {
    if (ev.target.closest('.bw-karten')) { zeigeKartenLehrkraft(sub, statusObj, aktionEl.querySelector('.bw-karten-box')); return; }
    if (ev.target.closest('.bw-endgueltig-direkt')) {   // Lukas 03.11.: in jedem Zustand, auch bei älteren Abgaben
      const erg = berechneErgebnis(A, ov);
      if (sub._neueste !== false && ab === 'offen' && !erg.offen) { abschliessen('endgueltig'); return; }   // alles bewertet: mit Punkten speichern
      if (ab === 'offen' && sub._neueste !== false && !confirm('Diese Abgabe ist noch nicht fertig bewertet. Trotzdem endgültig erledigt? (Es werden dann keine Punkte gespeichert.)')) return;
      const b = ev.target.closest('.bw-endgueltig-direkt'); b.disabled = true;
      if (await setzeEndgueltig(sub.testId, slug(sub.name))) loadSubmissions(false); else { b.disabled = false; alert('Konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
      return;
    }
    if (sub._neueste === false) return;
    if (ev.target.closest('.bw-heft-alle')) {   // alle noch nicht abgehakten Heft-Teilaufgaben ✓ (Falsches danach einzeln ✗)
      A.items.forEach(it => { if (it.heft && effektiv(it, ov) == null) ov[it.id] = true; });
      speichereEntwurf(); aktualisiere(); return;
    }
    if (ev.target.closest('.bw-abschliessen')) abschliessen('abschliessen');
    else if (ev.target.closest('.bw-endgueltig')) abschliessen('endgueltig');
    else if (ev.target.closest('.bw-nochmal-zettel')) abschliessen('zettel');
    else if (ev.target.closest('.bw-korrektur-ok')) {
      const b = ev.target.closest('.bw-korrektur-ok'); b.disabled = true;
      const ok = await setzeKorrekturOk(sub.testId, slug(sub.name), b.getAttribute('data-wdh') === '1');
      if (ok) loadSubmissions(false); else { b.disabled = false; alert('Konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
    }
  });
  if (sub._neueste === false) { aktionEl.innerHTML = '<div class="bw-hinweis">Ältere Abgabe — nur zum Ansehen. Bewertet wird immer die neueste Abgabe dieses Tests.</div>' + (ab !== 'endgueltig' ? '<div class="status-controls"><button type="button" class="btn secondary small bw-endgueltig-direkt">Endgültig erledigt</button></div>' : ''); vorschauEl.innerHTML = ''; }
}

// ---------------- EINSTUFUNGSTEST IM KORREKTUR-ABLAUF (Lukas 11.11.2026, Phase 0.3) ----------------
// Wie bei jedem Test: Bewertung abschließen (mit Fehlern: Rückgabe, das Kind korrigiert im Heft) -> „Korrektur ok —
// endgültig erledigt“ oder „Korrektur ok — Wiederholung“ (nur die falschen Fragen, wiederholenFragen wie seit 09.11.).
// Die Bereichs-Ansicht mit „Als richtig werten“ bleibt in teacher.js; hier nur Status-Text, Knöpfe und Speichern.
function einstufungFalsche(sub) {
  const f = [];
  (sub.bereichsErgebnisse || []).forEach((b, bi) => (b.details || []).forEach(d => { if (!d.richtig) f.push({ b: bi, bereich: b.name || '', d }); }));
  return f;
}
function einstufungStatusText(sub, st) {
  const ab = ablaufStatus(st, sub.testId);
  return ab === 'zettel_offen' ? 'Rückgabe — Korrektur im Heft offen' : ab === 'wiederholung_frei' ? 'Korrektur ok — Wiederholung liegt beim Kind'
    : ab === 'endgueltig' ? 'Endgültig erledigt' : (st && st.wiederholung) ? 'Wiederholung abgegeben — bitte prüfen' : 'Noch nicht bewertet';
}
function einstufungAktionHtml(sub, st) {
  if (sub._neueste === false) return '<div class="bw-hinweis">Ältere Abgabe — nur zum Ansehen. Bewertet wird immer die neueste Abgabe.</div>';
  const ab = ablaufStatus(st, sub.testId), n = einstufungFalsche(sub).length;
  if (ab === 'offen') return `<div class="bw-hinweis${n ? '' : ' gut'}">${n ? n + ' Antwort' + (n === 1 ? '' : 'en') + ' falsch.' : 'Alles richtig.'}</div><div class="status-controls">
    <button type="button" class="btn ok small einst-abschliessen">${n ? 'Bewertung abschließen — Rückgabe: Korrektur im Heft' : 'Bewertung abschließen — alles richtig, erledigt'}</button>
    <button type="button" class="btn secondary small einst-endgueltig">Endgültig erledigt</button></div>`;
  if (ab === 'zettel_offen') return `<div class="bw-hinweis">Das Kind schreibt die richtigen Antworten ins Heft und zeigt es dir.</div><div class="status-controls">
    <button type="button" class="btn ok small einst-korrektur-ok" data-wdh="0">Korrektur ok — endgültig erledigt</button>
    <button type="button" class="btn secondary small einst-korrektur-ok" data-wdh="1">Korrektur ok — Wiederholung</button></div>`;
  if (ab === 'wiederholung_frei') return '<div class="bw-hinweis">Korrektur ok. Das Kind macht jetzt nur die falschen Fragen noch einmal.</div><div class="status-controls"><button type="button" class="btn secondary small einst-endgueltig">Endgültig erledigt</button></div>';
  return '<div class="bw-hinweis gut">Endgültig erledigt. Keine Wiederholung mehr.</div>';
}
// Korrektur-Karten auch beim Einstufungstest (13.11.2026): so sieht das Kind die Rückgabe
function einstufungKartenKnopf(sub, st) {
  return ablaufStatus(st, sub.testId) !== 'offen' && st && st.reviewKey && sub._neueste !== false
    ? '<div class="status-controls"><button type="button" class="btn secondary small bw-karten">So sieht das Kind die Korrektur</button></div><div class="bw-karten-box"></div>' : '';
}
function einstufungAktionenVerbinden(div, sub, st, statusKey, commentInput) {
  div.addEventListener('click', async ev => {
    if (ev.target.closest('.bw-karten')) { zeigeKartenLehrkraft(sub, st, div.querySelector('.bw-karten-box')); return; }
    const b = ev.target.closest('.einst-abschliessen, .einst-endgueltig, .einst-korrektur-ok');
    if (!b || b.disabled) return;
    b.disabled = true;
    let ok = false;
    if (b.classList.contains('einst-endgueltig')) ok = !!(await setzeEndgueltig(sub.testId, slug(sub.name)));
    else if (b.classList.contains('einst-korrektur-ok')) ok = !!(await setzeKorrekturOk(sub.testId, slug(sub.name), b.getAttribute('data-wdh') === '1'));
    else {   // Bewertung abschließen: Ergebnis für das Kind („Ergebnis ansehen“) + Status in EINER Anfrage
      const falsche = einstufungFalsche(sub), kommentar = commentInput.value.trim(), jetzt = new Date().toISOString();
      const alle = (sub.bereichsErgebnisse || []).reduce((s, x) => s + ((x.details || []).length), 0);
      const review = { v: 2, testId: sub.testId, name: sub.name, titel: anzeigeTitel(sub.testId, sub.testTitle), art: 'einstufung', reviewedAt: jetzt, kommentar,
        ergebnis: falsche.length ? 'zettel' : 'erledigt', korrektur: !!falsche.length, richtig: alle - falsche.length, gesamt: alle,
        fehler: falsche.map(x => ({ teil: x.bereich, frage: x.d.frage, antwort: x.d.antwort, korrektAntwort: x.d.korrekt || '' })), saetze: [] };
      const status = { status: falsche.length ? 'zettel_offen' : 'endgueltig', comment: kommentar, reviewedAt: jetzt, reviewKey: reviewKeyFuer(sub), ergebnis: review.ergebnis };
      if (falsche.length) status.wiederholenFragen = falsche.map(x => ({ b: x.b, frage: x.d.frage }));
      try { await window.storage.setMany([{ key: reviewKeyFuer(sub), value: JSON.stringify(review) }, { key: statusKey, value: JSON.stringify(status) }], true); ok = true; }
      catch (e) { ok = false; }
    }
    if (ok) loadSubmissions(false);
    else { b.disabled = false; alert('Konnte nicht gespeichert werden. Bitte nochmal versuchen.'); }
  });
}

// ---------------- KORREKTUR-KARTEN AUS SICHT DES KINDES (Lukas 12.11.2026, Phase 1) ----------------
async function zeigeKartenLehrkraft(sub, st, box) {
  if (!box) return;
  if (box.innerHTML) { box.innerHTML = ''; return; }   // zweiter Klick: wieder zu
  box.innerHTML = '<p class="bw-hinweis">Lädt …</p>';
  let rv = null;
  try { rv = JSON.parse((await window.storage.get(st.reviewKey, true)).value); } catch (e) { rv = null; }
  const daten = await ladeKorrektur(sub.testId);
  const zeichne = sp => {
    box.innerHTML = `<div class="bw-karten-kopf">So sieht ${escapeHtml(sub.name)} die Korrektur. Sprache dazu: <select class="bw-karten-sp"><option value="">nur Deutsch</option>${Object.keys(KK_SPRACHEN).map(k => `<option value="${k}"${k === sp ? ' selected' : ''}>${KK_SPRACHEN[k]}</option>`).join('')}</select></div>`
      + (rv ? (korrekturListeHtml(sub.testId, rv, daten, sp ? [sp] : []) || '<p class="bw-hinweis gut">Keine Fehler.</p>') : '<p class="bw-hinweis">Die Bewertung konnte nicht geladen werden.</p>');
    box.querySelector('.bw-karten-sp').addEventListener('change', e => zeichne(e.target.value));
  };
  zeichne('');
}
