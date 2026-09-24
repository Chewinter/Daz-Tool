/* ==========================================================================
   tests-common.js — Abschlusstest-Bausteine, die BEIDE Seiten brauchen

   Die Schüler-Seite baut damit die Abschlusstests auf. Die Lehrkraft-Seite baut denselben Test
   unsichtbar auf (in #abschlussBody), um bei älteren Abgaben die Einzelantworten aufzuschlüsseln.

   Die Builder rufen updateProgress() auf — jede Seite stellt diese Funktion selbst bereit
   (student.js: echte Fortschrittsanzeige, teacher.js: leere Funktion).
   ========================================================================== */

let abschlussState = { punkte: 0, felderGesamt: 0, felderBeantwortet: 0 };

// ---------------- ABSCHLUSSTEST (Konjugation, Gegenteile, Steigern, Male an) ----------------
// Standard-Endungsmuster für Präsens Singular/Plural: ich=e, du=st, er/sie/es=t, wir=en, ihr=t, sie/Sie=en.
// Das gilt für schwache UND die meisten starken Verben (auch mit Vokalwechsel, z. B. fahre/fährst/fährt),
// NICHT aber für trennbare Verben ("mache sauber"), Mehrwort-Wendungen ("Filme anschauen"),
// reflexive Verben mit Pronomen ("notiere (mir)") oder mehrere gültige Varianten (Arrays). Diese bleiben
// bewusst als volles Eingabefeld bestehen, weil ein Wortstamm dort sprachlich keinen sauberen Sinn ergibt.
const KONJ_ENDUNGEN = ['e', 'st', 't', 'en', 't', 'en'];
function bestimmeStammUndEndung(form, personIndex) {
  if (typeof form !== 'string') return null; // Array (mehrere Varianten) -> nicht aufteilen
  if (form.includes(' ')) return null; // Mehrwort-Wendung / trennbares Verb -> nicht aufteilen
  const endung = KONJ_ENDUNGEN[personIndex];
  if (!form.endsWith(endung)) return null; // passt nicht ins Standardmuster -> nicht aufteilen
  const stamm = form.slice(0, form.length - endung.length);
  if (stamm.length < 2) return null; // zu kurzer Rest -> lieber volles Feld
  return { stamm, endung };
}

function renderKonjugationBlock(gruppe, gi, fieldMeta) {
  const persons = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  let out = `<div class="konj-verb-grid">`;
  gruppe.verbs.forEach(v => {
    out += `<div class="konj-verb-card"><div class="konj-verb-title">${v}</div>`;
    persons.forEach((p, pi) => {
      const key = `konj-${gi}-${v}-${pi}`;
      const form = gruppe.forms[v][pi];
      // gruppe.ohneStamm: Verben, bei denen kein Wortstamm vorgegeben wird (z. B. unregelmaessiges "sein": bin/bist/ist)
      const aufteilung = (gruppe.ohneStamm && gruppe.ohneStamm.indexOf(v) >= 0) ? null : bestimmeStammUndEndung(form, pi);
      if (aufteilung) {
        out += `<div class="konj-person-row"><span class="konj-person-label">${p}</span><span class="konj-stamm">${escapeHtml(aufteilung.stamm)}</span><input type="text" class="text-input abschluss-field konj-endung-input" data-key="${key}" placeholder="…" maxlength="8"></div>`;
        fieldMeta.push({ key, points: 0.5, acceptable: form, stem: aufteilung.stamm, label: `${v} (${p})` });
      } else {
        out += `<div class="konj-person-row"><span class="konj-person-label">${p}</span><input type="text" class="text-input abschluss-field" data-key="${key}"></div>`;
        fieldMeta.push({ key, points: 0.5, acceptable: form, stem: '', label: `${v} (${p})` });
      }
    });
    out += `</div>`;
  });
  out += `</div>`;
  return out;
}

// ---------------- UHR-SVG (für Eingangstest) ----------------
function renderClockSVG(hour, minute, size) {
  size = size || 150;
  const cx = size/2, cy = size/2, r = size/2 - 10;
  const hourAngle = ((hour % 12) + minute/60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  const hourLen = r * 0.5, minLen = r * 0.75;
  const hx = cx + hourLen * Math.cos(hourAngle * Math.PI/180);
  const hy = cy + hourLen * Math.sin(hourAngle * Math.PI/180);
  const mx = cx + minLen * Math.cos(minuteAngle * Math.PI/180);
  const my = cy + minLen * Math.sin(minuteAngle * Math.PI/180);
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = i * 30 - 90;
    const rad = a * Math.PI/180;
    const x1 = cx + (r-6) * Math.cos(rad), y1 = cy + (r-6) * Math.sin(rad);
    const x2 = cx + r * Math.cos(rad), y2 = cy + r * Math.sin(rad);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#26312E" stroke-width="2"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block; margin:0 auto;">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#26312E" stroke-width="3"/>
    ${ticks}
    <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#1E4B45" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#2C6B62" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4" fill="#26312E"/>
  </svg>`;
}

function checkAcceptable(value, acceptable) {
  const v = normalize(value);
  const list = Array.isArray(acceptable) ? acceptable : [acceptable];
  return list.some(a => normalize(a) === v);
}

// Levenshtein-Distanz: Anzahl der Einzelzeichen-Änderungen (einfügen/löschen/ersetzen) zwischen zwei Wörtern
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[a.length][b.length];
}

// Prüft, ob eine falsche Antwort ein wahrscheinlicher TIPPFEHLER ist (sehr nah dran) statt ein echter Sprachfehler.
// Grenzwert wächst leicht mit der Wortlänge, bleibt aber streng (max. 2 Zeichen Unterschied).
function istWahrscheinlichTippfehler(gegeben, korrektListe) {
  const v = normalize(gegeben);
  if (!v) return false; // keine Antwort ist kein Tippfehler, sondern schlicht nicht beantwortet
  const liste = Array.isArray(korrektListe) ? korrektListe : [korrektListe];
  return liste.some(k => {
    const kn = normalize(k);
    const dist = levenshtein(v, kn);
    const grenze = kn.length <= 4 ? 1 : kn.length <= 8 ? 2 : 3;
    return dist > 0 && dist <= grenze;
  });
}

function buildAbschlusstest(t) {
  const mount = document.getElementById('abschlussBody');
  const persons = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  const fieldMeta = []; // {key, points, getEl, acceptable}

  let html = `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:0 0 4px;">Ergänze.</h2>
  <p class="hint">je 0,5 Punkte (60 P.)</p>`;

  t.konjugation.forEach((gruppe, gi) => {
    html += renderKonjugationBlock(gruppe, gi, fieldMeta);
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Finde das Gegenteil.</h2>
  <p class="hint">5 Punkte</p>
  <div style="margin-bottom:8px; color:var(--ink-soft); font-size:14px;"><strong>gut</strong> → schlecht <em>(Beispiel)</em></div>`;
  t.gegenteile.forEach((it, i) => {
    const key = `geg-${i}`;
    html += `<div class="gegenteil-row"><span class="word">${it.word}</span><span class="arrow">→</span><input type="text" class="gegenteil-input abschluss-field" data-key="${key}"><span class="status" id="status-${key}"></span></div>`;
    fieldMeta.push({ key, points: 1, acceptable: it.correct, label: `Gegenteil von „${it.word}"` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Steigere die Adjektive.</h2>
  <p class="hint">12 Punkte</p>
  <div style="margin-bottom:8px; color:var(--ink-soft); font-size:14px;"><strong>dick</strong> → dicker → am dicksten <em>(Beispiel)</em></div>`;
  t.steigern.forEach((it, i) => {
    const kKey = `steig-${i}-k`, sKey = `steig-${i}-s`;
    html += `<div class="steiger-row"><div class="pos">${it.positiv}</div><div class="steiger-grid">
      <div class="steiger-field"><label>Komparativ (++)</label><input type="text" class="abschluss-field" data-key="${kKey}"></div>
      <div class="steiger-field"><label>Superlativ (+++)</label><input type="text" class="abschluss-field" data-key="${sKey}"></div>
    </div></div>`;
    fieldMeta.push({ key: kKey, points: 0.5, acceptable: it.komparativ, label: `Komparativ von „${it.positiv}"` });
    fieldMeta.push({ key: sKey, points: 0.5, acceptable: it.superlativ, label: `Superlativ von „${it.positiv}"` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Male an.</h2>
  <p class="hint">8 Punkte — Nomen = rot · Adjektive = grün · Verben = blau · Artikel = grau</p>
  <div class="wortarten-buckets" style="margin-bottom:10px;">
    <div style="font-size:12.5px; color:#B23B33;">■ Nomen</div>
    <div style="font-size:12.5px; color:#3F7D50;">■ Adjektive</div>
    <div style="font-size:12.5px; color:#2C5C9E;">■ Verben</div>
    <div style="font-size:12.5px; color:#6B6659;">■ Artikel</div>
  </div>
  <div class="quartett-pool" style="grid-template-columns:repeat(4,1fr);">`;
  const colorMap = { Nomen:'#B23B33', Adjektiv:'#3F7D50', Verb:'#2C5C9E', Artikel:'#6B6659' };
  t.male_an.forEach((it, i) => {
    const key = `farbe-${i}`;
    html += `<div class="quartett-card" data-key="${key}" data-word="${it.word}" style="cursor:pointer;">${it.word}</div>`;
    fieldMeta.push({ key, points: 0.5, kategorie: it.kategorie, isColor: true, label: `Wortart von „${it.word}"` });
  });
  html += `</div>
  <div style="display:flex; gap:8px; margin:12px 0 4px; flex-wrap:wrap;">
    <button class="btn small" data-farbwahl="Nomen" style="background:#B23B33;">Nomen (rot)</button>
    <button class="btn small" data-farbwahl="Adjektiv" style="background:#3F7D50;">Adjektiv (grün)</button>
    <button class="btn small" data-farbwahl="Verb" style="background:#2C5C9E;">Verb (blau)</button>
    <button class="btn small" data-farbwahl="Artikel" style="background:#6B6659;">Artikel (grau)</button>
  </div>
  <p class="hint" id="farbHinweis">Tippe zuerst ein Wort an, dann die Farbe.</p>`;

  mount.innerHTML = html;

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) {
        beantwortet++;
        if (answered[f.key].correct) punkte += f.points;
      }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  mount.querySelectorAll('input.abschluss-field').forEach(input => {
    input.addEventListener('blur', () => {
      const key = input.getAttribute('data-key');
      const meta = fieldMeta.find(f => f.key === key);
      if (input.value.trim() === '') { delete answered[key]; input.style.borderColor = 'var(--line)'; recompute(); return; }
      const effektiverWert = (meta.stem || '') + input.value;
      const correct = checkAcceptable(effektiverWert, meta.acceptable);
      answered[key] = { correct };
      input.style.borderColor = 'var(--teal)';
      const statusEl = document.getElementById(`status-${key}`);
      if (statusEl) { statusEl.textContent = '✓'; statusEl.style.color = 'var(--ink-soft)'; }
      recompute();
    });
  });

  let selectedWordKey = null;
  mount.querySelectorAll('.quartett-card').forEach(el => {
    el.addEventListener('click', () => {
      mount.querySelectorAll('.quartett-card').forEach(c => c.classList.remove('selected'));
      selectedWordKey = el.getAttribute('data-key');
      el.classList.add('selected');
      document.getElementById('farbHinweis').textContent = `Ausgewählt: „${el.getAttribute('data-word')}" — jetzt Farbe wählen.`;
    });
  });
  mount.querySelectorAll('[data-farbwahl]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedWordKey) return;
      const meta = fieldMeta.find(f => f.key === selectedWordKey);
      const chosen = btn.getAttribute('data-farbwahl');
      const correct = chosen === meta.kategorie;
      answered[selectedWordKey] = { correct };
      const card = mount.querySelector(`.quartett-card[data-key="${selectedWordKey}"]`);
      card.style.background = colorMap[chosen] + '22';
      card.style.borderColor = colorMap[chosen];
      card.style.color = correct ? colorMap[chosen] : 'var(--bad)';
      card.classList.remove('selected');
      selectedWordKey = null;
      document.getElementById('farbHinweis').textContent = 'Tippe zuerst ein Wort an, dann die Farbe.';
      recompute();
    });
  });
}

// ---------------- ABSCHLUSSTEST 2 (Konjugation, Frage&Antwort, Präpositionen, Satzbau) ----------------
function buildAbschlusstest2(t) {
  const mount = document.getElementById('abschlussBody');
  const persons = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  const fieldMeta = [];

  let html = `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:0 0 4px;">Ergänze.</h2>
  <p class="hint">je 0,5 Punkte (36 P.)</p>`;

  t.konjugation.forEach((gruppe, gi) => {
    html += renderKonjugationBlock(gruppe, gi, fieldMeta);
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Frage und antworte. Ist das ...?</h2>
  <p class="hint">16 Punkte</p>
  <div style="margin-bottom:10px; color:var(--ink-soft); font-size:13.5px;"><strong>Beispiel:</strong> 1. Person Singular, die Wohnung, Ja → Ist das meine Wohnung? → Ja, das ist meine Wohnung.</div>`;

  t.frage_antwort.forEach((row, i) => {
    const fKey = `fa-${i}-f`, aKey = `fa-${i}-a`;
    html += `<div style="border:1px solid var(--line); border-radius:8px; padding:12px 14px; margin-bottom:10px;">
      <div style="font-size:13px; color:var(--ink-soft); margin-bottom:6px;">${row.person} · <strong>${row.was}</strong> · ${row.jaNein === 'ja' ? 'Ja ✓' : 'Nein ✗'}</div>
      <div style="margin-bottom:6px;"><label style="font-size:12px; color:var(--ink-soft);">Frage</label><input type="text" class="text-input abschluss-field" data-key="${fKey}" style="width:100%;"></div>
      <div><label style="font-size:12px; color:var(--ink-soft);">Antwort</label><input type="text" class="text-input abschluss-field" data-key="${aKey}" style="width:100%;"></div>
    </div>`;
    fieldMeta.push({ key: fKey, points: 1, acceptable: row.frage, label: `Frage bilden: ${row.person} — ${row.was}` });
    fieldMeta.push({ key: aKey, points: 1, acceptable: row.antwort, label: `Antwort: ${row.person} — ${row.was}` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Ergänze. Setze die Wörter in die Lücken.</h2>
  <p class="hint">6 Punkte</p>
  <div style="margin-bottom:12px; font-style:italic; font-weight:700;">${t.praepositionen.wortbank.join('   •   ')}</div>
  <div style="line-height:2.4; font-size:16px;">`;
  t.praepositionen.text_teile.forEach(part => {
    const m = part.match(/^___(\d)___$/);
    if (m) {
      const idx = parseInt(m[1], 10) - 1;
      const key = `praep-${idx}`;
      html += ` <input type="text" class="text-input abschluss-field" data-key="${key}" style="width:110px; display:inline-block;"> `;
      fieldMeta.push({ key, points: 1, acceptable: t.praepositionen.antworten[idx], label: `Lücke ${idx+1} im Text (Präposition)` });
    } else {
      html += ` ${part}`;
    }
  });
  html += `</div>`;

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Bilde eigene Sätze. Unterstreiche die Adjektive.</h2>
  <p class="hint">9 Punkte</p>
  <div style="margin-bottom:6px; color:var(--ink-soft); font-size:13.5px;"><strong>Beispiel (${t.satzbau.beispiel.nomen} + ${t.satzbau.beispiel.adjektiv}):</strong><br>${t.satzbau.beispiel.saetze.join(' · ')}</div>
  <div style="margin-bottom:14px; font-style:italic; font-weight:700;">${t.satzbau.wortbank.join('   •   ')}</div>`;
  t.satzbau.aufgaben.forEach((auf, i) => {
    html += `<div style="margin-bottom:16px;"><div style="font-weight:700; margin-bottom:6px;">${auf.nomen} + ${auf.adjektiv}</div>`;
    ['satz1','satz2','satz3'].forEach((sk, si) => {
      const key = `satzbau-${i}-${si}`;
      html += `<input type="text" class="text-input abschluss-field" data-key="${key}" placeholder="Satz ${si+1}" style="width:100%; margin-bottom:6px;">`;
      fieldMeta.push({ key, points: 1, acceptable: computeSatzbauAnswer(auf.nomen, auf.adjektiv, si), label: `Satz ${si+1} mit „${auf.nomen}" + „${auf.adjektiv}"` });
    });
    html += `</div>`;
  });

  mount.innerHTML = html;

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) { beantwortet++; if (answered[f.key].correct) punkte += f.points; }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  mount.querySelectorAll('input.abschluss-field').forEach(input => {
    input.addEventListener('blur', () => {
      const key = input.getAttribute('data-key');
      const meta = fieldMeta.find(f => f.key === key);
      if (input.value.trim() === '') { delete answered[key]; input.style.borderColor = 'var(--line)'; recompute(); return; }
      const effektiverWert = (meta.stem || '') + input.value;
      const correct = checkAcceptable(effektiverWert, meta.acceptable);
      answered[key] = { correct };
      input.style.borderColor = 'var(--teal)';
      recompute();
    });
  });
}

// Berechnet die grammatisch korrekte Antwort für "Nomen ist Adjektiv" / "ein Adjektiv-er Nomen" / "der Adjektiv-e Nomen"
function computeSatzbauAnswer(nomenMitArtikel, adj, satzIndex) {
  const [artikel, ...rest] = nomenMitArtikel.split(' ');
  const nomen = rest.join(' ');
  const nomenGross = nomen.charAt(0).toUpperCase() + nomen.slice(1);
  const endungen = { der: ['er','e'], die: ['e','e'], das: ['es','e'] };
  const [unbestEnd, bestEnd] = endungen[artikel] || ['e','e'];
  const unbestArtikel = { der:'ein', die:'eine', das:'ein' }[artikel] || 'ein';
  if (satzIndex === 0) return `${artikel.charAt(0).toUpperCase()+artikel.slice(1)} ${nomenGross} ist ${adj}.`;
  if (satzIndex === 1) return `Das ist ${unbestArtikel} ${adj}${unbestEnd} ${nomenGross}.`;
  return `Das ist ${artikel} ${adj}${bestEnd} ${nomenGross}.`;
}

// ---------------- ABSCHLUSSTEST 3 (Konjugation, Wortarten, Beschriftung, Frage&Antwort, Sätze) ----------------
function buildAbschlusstest3(t) {
  const mount = document.getElementById('abschlussBody');
  const fieldMeta = [];

  let html = `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:0 0 4px;">Ergänze.</h2>
  <p class="hint">je 0,5 Punkte (65,5 P.)</p>`;

  t.konjugation.forEach((gruppe, gi) => {
    html += renderKonjugationBlock(gruppe, gi, fieldMeta);
    if (gruppe.gegebenBeispiel) {
      // Das gegebene Beispiel aus fieldMeta wieder entfernen (nicht gewertet) und im HTML als gelöst markieren
      const { verb, person } = gruppe.gegebenBeispiel;
      const key = `konj-${gi}-${verb}-${person}`;
      const idx = fieldMeta.findIndex(f => f.key === key);
      if (idx > -1) fieldMeta.splice(idx, 1);
    }
  });
  // Beispiel-Feld im DOM nach dem Rendern vorbefüllen (siehe unten nach mount.innerHTML)

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Schreibe die Wortarten unter die Wörter.</h2>
  <p class="hint">6 Punkte</p>
  <div class="quartett-pool" style="grid-template-columns:repeat(3,1fr); margin-bottom:16px;">`;
  t.wortarten_zeile.forEach((it, i) => {
    const key = `wa-${i}`;
    html += `<div style="text-align:center;"><div style="font-weight:700; margin-bottom:6px;">${it.word}</div><input type="text" class="text-input abschluss-field" data-key="${key}" style="font-size:13px; padding:6px 8px; width:100%;"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: it.antwort, label: `Wortart von „${it.word}"` });
  });
  html += `</div>`;

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Körperteile.</h2>
  <p class="hint">19 Punkte — Im Original wird eine Körperzeichnung beschriftet. Hier: Schreibe die passenden Körperteile mit Artikel.</p>`;
  t.beschriftung_woerter.forEach((w, i) => {
    const key = `besch-${i}`;
    html += `<div class="gegenteil-row"><span class="word">${i+1}.</span><span class="arrow"></span><input type="text" class="gegenteil-input abschluss-field" data-key="${key}" placeholder="z. B. der Kopf"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: w, label: `Körperteil ${i+1}` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Frage und antworte.</h2>
  <p class="hint">5,5 Punkte</p>`;
  t.frage_antwort_koerper.forEach((row, i) => {
    if (row.frageAntwortGegeben) {
      const fKey = `fak-${i}-f`, aKey = `fak-${i}-a`;
      html += `<div style="border:1px solid var(--line); border-radius:8px; padding:12px 14px; margin-bottom:10px;">
        <div style="font-size:13px; color:var(--ink-soft); margin-bottom:6px;">${row.trait}</div>
        <div style="margin-bottom:6px;"><input type="text" class="text-input abschluss-field" data-key="${fKey}" style="width:110px; display:inline-block;"> ${row.frageLuecke}</div>
        <div><label style="font-size:12px; color:var(--ink-soft);">Antwort</label><input type="text" class="text-input abschluss-field" data-key="${aKey}" style="width:100%;"></div>
      </div>`;
      fieldMeta.push({ key: fKey, points: 0.5, acceptable: row.frageAntwortGegeben, label: `Frage-Lücke: ${row.trait}` });
      fieldMeta.push({ key: aKey, points: 1, acceptable: row.antwort, label: `Antwort: ${row.trait}` });
    } else {
      const fKey = `fak-${i}-f`, aKey = `fak-${i}-a`;
      html += `<div style="border:1px solid var(--line); border-radius:8px; padding:12px 14px; margin-bottom:10px;">
        <div style="font-size:13px; color:var(--ink-soft); margin-bottom:6px;">${row.trait}</div>
        <div style="margin-bottom:6px;"><label style="font-size:12px; color:var(--ink-soft);">Frage</label><input type="text" class="text-input abschluss-field" data-key="${fKey}" style="width:100%;"></div>
        <div><label style="font-size:12px; color:var(--ink-soft);">Antwort</label><input type="text" class="text-input abschluss-field" data-key="${aKey}" style="width:100%;"></div>
      </div>`;
      fieldMeta.push({ key: fKey, points: 1, acceptable: row.frage, label: `Frage bilden: ${row.trait}` });
      fieldMeta.push({ key: aKey, points: 1, acceptable: row.antwort, label: `Antwort: ${row.trait}` });
    }
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Vervollständige die Sätze.</h2>
  <p class="hint">3 Punkte</p>`;
  t.vervollstaendige.forEach((it, i) => {
    const key = `vs-${i}`;
    html += `<div style="margin-bottom:10px;"><strong>${it.start}</strong> <input type="text" class="text-input abschluss-field" data-key="${key}" style="width:70%;"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: it.antwort, label: `Satz vervollständigen: „${it.start}…"` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Bilde aus den Wörtern Sätze.</h2>
  <p class="hint">2 Punkte</p>`;
  t.satzbau.forEach((it, i) => {
    const key = `sb-${i}`;
    html += `<div style="margin-bottom:12px;"><div style="font-style:italic; color:var(--ink-soft); margin-bottom:6px;">${it.woerter.join(' • ')}</div><input type="text" class="text-input abschluss-field" data-key="${key}" style="width:100%;"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: it.antwort, label: `Satz bilden aus: ${it.woerter.join(', ')}` });
  });

  mount.innerHTML = html;

  // Gegebenes Beispiel (geröntgt werden, ich) vorbefüllen und sperren
  t.konjugation.forEach((gruppe, gi) => {
    if (gruppe.gegebenBeispiel) {
      const { verb, person } = gruppe.gegebenBeispiel;
      const cards = mount.querySelectorAll('.konj-verb-card');
      cards.forEach(card => {
        const title = card.querySelector('.konj-verb-title');
        if (title && title.textContent === verb) {
          const rows = card.querySelectorAll('.konj-person-row');
          const input = rows[person].querySelector('input');
          input.value = gruppe.forms[verb][person];
          input.disabled = true;
          input.style.background = '#EEE9DA';
          input.style.borderColor = 'var(--good)';
        }
      });
    }
  });

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) { beantwortet++; if (answered[f.key].correct) punkte += f.points; }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  mount.querySelectorAll('input.abschluss-field').forEach(input => {
    input.addEventListener('blur', () => {
      const key = input.getAttribute('data-key');
      const meta = fieldMeta.find(f => f.key === key);
      if (!meta || input.value.trim() === '') { if(meta) delete answered[key]; input.style.borderColor = 'var(--line)'; recompute(); return; }
      const effektiverWert = (meta.stem || '') + input.value;
      const correct = checkAcceptable(effektiverWert, meta.acceptable);
      answered[key] = { correct };
      input.style.borderColor = 'var(--teal)';
      recompute();
    });
  });
}

// ---------------- ABSCHLUSSTEST 4 (26 Verben Präsens+Perfekt, Dialog, Beschriftung) ----------------
function buildAbschlusstest4(t) {
  const mount = document.getElementById('abschlussBody');
  const persons = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  const fieldMeta = [];
  const gegebenSet = new Set(t.gegeben.map(g => `${g[0]}|${g[1]}|${g[2]}`));

  let html = `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:0 0 4px;">Ergänze.</h2>
  <p class="hint">je 0,5 Punkte (147,5 P.)</p>`;

  t.tabellen.forEach((tab, ti) => {
    html += `<div class="konj-verb-grid">`;
    tab.verbs.forEach(v => {
      html += `<div class="konj-verb-card"><div class="konj-verb-title">${v}</div>`;
      persons.forEach((p, pi) => {
        ['praesens','perfekt'].forEach(form => {
          const key = `v4-${ti}-${v}-${form}-${pi}`;
          const isGegeben = gegebenSet.has(`${v}|${form}|${pi}`);
          const val = tab.forms[v][form][pi];
          const label = form === 'praesens' ? '' : ' (Perfekt)';
          if (isGegeben) {
            html += `<div class="konj-person-row"><span class="konj-person-label">${p}${label}</span><input type="text" class="text-input" data-key="${key}" value="${val}" disabled style="background:#EEE9DA; border-color:var(--good);"></div>`;
          } else {
            const aufteilung = form === 'praesens' ? bestimmeStammUndEndung(val, pi) : null;
            if (aufteilung) {
              html += `<div class="konj-person-row"><span class="konj-person-label">${p}${label}</span><span class="konj-stamm">${escapeHtml(aufteilung.stamm)}</span><input type="text" class="text-input abschluss-field konj-endung-input" data-key="${key}" placeholder="…" maxlength="8"></div>`;
              fieldMeta.push({ key, points: 0.5, acceptable: val, stem: aufteilung.stamm, label: `${v} (${p}${label})` });
            } else {
              html += `<div class="konj-person-row"><span class="konj-person-label">${p}${label}</span><input type="text" class="text-input abschluss-field" data-key="${key}"></div>`;
              fieldMeta.push({ key, points: 0.5, acceptable: val, stem: '', label: `${v} (${p}${label})` });
            }
          }
        });
      });
      html += `</div>`;
    });
    html += `</div>`;
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Ergänze.</h2>
  <p class="hint">6 Punkte — Dialog vervollständigen</p>`;
  t.dialog_luecken.forEach((d, i) => {
    const key = `dial-${i}`;
    html += `<div style="margin-bottom:10px;"><strong>${d.sprecher}</strong> ${d.start} <input type="text" class="text-input abschluss-field" data-key="${key}" style="width:60%;"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: d.antwort, label: `Dialog: ${d.sprecher} — „${d.start}…"` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Beschrifte mit Artikel in der Einzahl und Mehrzahl.</h2>
  <p class="hint">19 Punkte — Original zeigt Bilder; hier als Wortliste.</p>
  <div style="margin-bottom:10px; font-style:italic; color:var(--ink-soft);">Beispiel: der Apfel — die Äpfel</div>`;
  t.beschriftung_items.forEach((it, i) => {
    const key = `besch4-${i}`;
    html += `<div class="steiger-row"><div class="pos">${it.wort}</div><div class="steiger-grid" style="grid-template-columns:1fr 1fr;">
      <div class="steiger-field"><label>Artikel + Wort</label><input type="text" class="abschluss-field" data-key="${key}-a" placeholder="z. B. der Apfel"></div>
      <div class="steiger-field"><label>Plural</label><input type="text" class="abschluss-field" data-key="${key}-p" placeholder="z. B. die Äpfel"></div>
    </div></div>`;
    fieldMeta.push({ key: `${key}-a`, points: 0.5, acceptable: `${it.artikel} ${it.wort}`, label: `Artikel + Wort: ${it.wort}` });
    fieldMeta.push({ key: `${key}-p`, points: 0.5, acceptable: it.plural, label: `Plural von: ${it.wort}` });
  });

  mount.innerHTML = html;

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) { beantwortet++; if (answered[f.key].correct) punkte += f.points; }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  mount.querySelectorAll('input.abschluss-field').forEach(input => {
    input.addEventListener('blur', () => {
      const key = input.getAttribute('data-key');
      const meta = fieldMeta.find(f => f.key === key);
      if (!meta || input.value.trim() === '') { if(meta) delete answered[key]; input.style.borderColor = 'var(--line)'; recompute(); return; }
      const effektiverWert = (meta.stem || '') + input.value;
      const correct = checkAcceptable(effektiverWert, meta.acceptable);
      answered[key] = { correct };
      input.style.borderColor = 'var(--teal)';
      recompute();
    });
  });
}

// ---------------- ABSCHLUSSTEST 5 (Verben Präsens + 1x Perfekt, Geschäfte-Zuordnung, Sätze) ----------------
function buildAbschlusstest5(t) {
  const mount = document.getElementById('abschlussBody');
  const persons = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  const fieldMeta = [];
  const gegebenSet = new Set(t.gegeben.map(g => `${g[0]}|${g[1]}`));

  let html = `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:0 0 4px;">Ergänze.</h2>
  <p class="hint">je 0,5 Punkte (38 P.)</p>`;

  t.tabellen.forEach((tab, ti) => {
    html += `<div class="konj-verb-grid">`;
    tab.verbs.forEach(v => {
      html += `<div class="konj-verb-card"><div class="konj-verb-title">${v}</div>`;
      persons.forEach((p, pi) => {
        const key = `v5-${ti}-${v}-${pi}`;
        const val = tab.praesens[v][pi];
        const aufteilung = bestimmeStammUndEndung(val, pi);
        if (aufteilung) {
          html += `<div class="konj-person-row"><span class="konj-person-label">${p}</span><span class="konj-stamm">${escapeHtml(aufteilung.stamm)}</span><input type="text" class="text-input abschluss-field konj-endung-input" data-key="${key}" placeholder="…" maxlength="8"></div>`;
          fieldMeta.push({ key, points: 0.5, acceptable: val, stem: aufteilung.stamm, label: `${v} (${p})` });
        } else {
          html += `<div class="konj-person-row"><span class="konj-person-label">${p}</span><input type="text" class="text-input abschluss-field" data-key="${key}"></div>`;
          fieldMeta.push({ key, points: 0.5, acceptable: val, stem: '', label: `${v} (${p})` });
        }
      });
      const pkey = `v5-${ti}-${v}-perfekt`;
      const isGegeben = gegebenSet.has(`${v}|perfekt_ich`);
      const pval = tab.perfekt_ich[v];
      html += `<div class="konj-person-row"><span class="konj-person-label">Perfekt</span><input type="text" class="text-input ${isGegeben ? '' : 'abschluss-field'}" data-key="${pkey}" ${isGegeben ? `value="${pval}" disabled style="background:#EEE9DA; border-color:var(--good);"` : ''}></div>`;
      if (!isGegeben) fieldMeta.push({ key: pkey, points: 0.5, acceptable: pval, stem: '', label: `${v} (Perfekt, ich)` });
      html += `</div>`;
    });
    html += `</div>`;
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Welches Geschäft verkauft was? Verbinde.</h2>
  <p class="hint">5 Punkte</p>
  <div style="margin-bottom:8px; color:var(--ink-soft); font-size:14px;"><strong>${t.supermarkt_beispiel.geschaeft}</strong> → ${t.supermarkt_beispiel.produkt} <em>(Beispiel)</em></div>`;
  t.geschaefte_verbinden.forEach((g, i) => {
    const key = `gv-${i}`;
    html += `<div class="gegenteil-row"><span class="word">${g.geschaeft}</span><span class="arrow">→</span><input type="text" class="gegenteil-input abschluss-field" data-key="${key}"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: g.produkt, label: `Was verkauft: ${g.geschaeft}?` });
  });

  html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:26px 0 4px;">Schreibe zu jedem Geschäft einen Satz.</h2>
  <p class="hint">5 Punkte</p>
  <div style="margin-bottom:8px; color:var(--ink-soft); font-size:14px;"><strong>${t.satz_beispiel.geschaeft}</strong>: ${t.satz_beispiel.antwort} <em>(Beispiel)</em></div>`;
  t.satz_aufgaben.forEach((s, i) => {
    const key = `sa5-${i}`;
    html += `<div style="margin-bottom:10px;"><strong>${s.geschaeft}</strong>: <input type="text" class="text-input abschluss-field" data-key="${key}" style="width:100%; margin-top:4px;"></div>`;
    fieldMeta.push({ key, points: 1, acceptable: s.antwort, label: `Satz zu: ${s.geschaeft}` });
  });

  mount.innerHTML = html;

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) { beantwortet++; if (answered[f.key].correct) punkte += f.points; }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  mount.querySelectorAll('input.abschluss-field').forEach(input => {
    input.addEventListener('blur', () => {
      const key = input.getAttribute('data-key');
      const meta = fieldMeta.find(f => f.key === key);
      if (!meta || input.value.trim() === '') { if(meta) delete answered[key]; input.style.borderColor = 'var(--line)'; recompute(); return; }
      const effektiverWert = (meta.stem || '') + input.value;
      const correct = checkAcceptable(effektiverWert, meta.acceptable);
      answered[key] = { correct };
      input.style.borderColor = 'var(--teal)';
      recompute();
    });
  });
}

// ---------------- ABSCHLUSSTEST GENERISCH (für die A1-Lernfelder) ----------------
// Ein einziger, konfigurierbarer Abschlusstest-Typ. Die Aufgaben stehen komplett in den Daten
// (type: 'abschlusstest_generisch', abschnitte: [...]) — dadurch braucht ein neuer Abschlusstest KEINEN neuen Code.
//
// Jeder Abschnitt: { titel, kurz?, hinweis?, beispiel?, art, punkte?, items: [...] }
//   art 'eingabe'   : Eingabefeld.   Item: { frage?, bild? (Bildname aus ICONS), antwort (Text oder Liste), exakt?, punkte?, label? }
//                     exakt:true = Groß-/Kleinschreibung UND ß/ss zählen (für Buchstaben/Rechtschreibung)
//   art 'auswahl'   : Antwort antippen. Item: { vor?, nach?, frage?, optionen:[...], antwort, zusammen?, punkte? }
//   art 'zuordnung' : Aufklappliste.    Item: { frage, antwort, optionen? }  (optionen auch auf Abschnittsebene)
//   art 'konjugation': Verbtabellen wie in den A2-Abschlusstests. Abschnitt: { gruppen: [{ verbs:[...], forms:{ verb:[6 Formen] } }] } (je Feld 0,5 Punkte)
//   Item-Option manuell:true (bei 'eingabe'): Antwort wird NICHT automatisch bewertet — die Lehrkraft bewertet sie (zählt nicht in punkte_max).
//   art 'uhr'       : Uhr-Bild + Eingabe. Item: { hour, minute, antwort: [gültige Schreibweisen] }
// Die Feld-Schlüssel (g<Abschnitt>-<Item>) hängen an der REIHENFOLGE — bestehende Tests deshalb nicht umsortieren,
// wenn schon Abgaben existieren.
function escAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

function pruefeFeld(meta, wert) {
  if (meta.exakt) {
    const v = (wert || '').trim();
    const liste = Array.isArray(meta.acceptable) ? meta.acceptable : [meta.acceptable];
    return liste.some(a => (a || '').trim() === v);
  }
  return checkAcceptable(wert, meta.acceptable);
}

function buildAbschlussGenerisch(t) {
  const mount = document.getElementById('abschlussBody');
  const fieldMeta = [];
  let html = '';
  let nr = 0;

  (t.abschnitte || []).forEach((ab, ai) => {
    html += `<h2 style="font-family:Georgia,serif; font-size:20px; color:var(--teal-dark); margin:${ai ? '26px' : '0'} 0 4px;">${escapeHtml(ab.titel || '')}</h2>`;
    if (ab.hinweis) html += `<p class="hint">${escapeHtml(ab.hinweis)}</p>`;
    if (ab.beispiel) html += `<div style="margin-bottom:10px; color:var(--ink-soft); font-size:14px;">${escapeHtml(ab.beispiel)} <em>(Beispiel)</em></div>`;

    if (ab.art === 'konjugation') {
      (ab.gruppen || []).forEach((gruppe, gk) => { html += renderKonjugationBlock(gruppe, `a${ai}g${gk}`, fieldMeta); });
    }

    (ab.items || []).forEach((it, ii) => {
      const key = `g${ai}-${ii}`;
      nr++;
      const punkte = it.punkte != null ? it.punkte : (ab.punkte != null ? ab.punkte : 1);
      const kurz = ab.kurz || ab.titel || '';
      const nrHtml = `<span class="item-num">${nr}.</span>`;

      if (ab.art === 'auswahl') {
        const trenner = it.zusammen ? '' : ' ';
        const lueckeZeile = it.frage != null
          ? `${nrHtml}<span>${escapeHtml(it.frage)}</span>`
          : `${nrHtml}<span>${escapeHtml(it.vor || '')}${trenner}<span class="mc-blank" style="min-width:${it.zusammen ? '36px' : '90px'};">______</span>${trenner}${escapeHtml(it.nach || '')}</span>`;
        html += `<div class="gen-item gen-auswahl"><div class="mc-row">${lueckeZeile}</div>
          <div class="mc-options gen-chip-gruppe">${(it.optionen || []).map(o => `<div class="mc-opt" data-wert="${escAttr(o)}">${escapeHtml(o)}</div>`).join('')}
          <input type="hidden" class="abschluss-field" data-key="${key}"></div></div>`;
        const lueckenLabel = it.frage != null ? it.frage : `${it.vor || ''}${trenner}___${trenner}${it.nach || ''}`;
        fieldMeta.push({ key, points: punkte, acceptable: it.antwort, exakt: !!it.exakt, stem: '', label: it.label || `${kurz}: ${lueckenLabel}` });
      } else if (ab.art === 'zuordnung') {
        const opts = it.optionen || ab.optionen || [];
        html += `<div class="gen-item">${nrHtml}<span class="gen-frage">${escapeHtml(it.frage || '')}</span>
          <select class="text-input abschluss-field gen-select" data-key="${key}"><option value="">— wählen —</option>${opts.map(o => `<option value="${escAttr(o)}">${escapeHtml(o)}</option>`).join('')}</select></div>`;
        fieldMeta.push({ key, points: punkte, acceptable: it.antwort, exakt: !!it.exakt, stem: '', label: it.label || `${kurz}: ${it.frage || ''}` });
      } else if (ab.art === 'uhr') {
        html += `<div class="gen-item gen-uhr">${nrHtml}<div class="gen-clock">${renderClockSVG(it.hour, it.minute, 120)}</div>
          <input type="text" class="text-input abschluss-field gen-input" data-key="${key}" placeholder="z. B. halb sieben"></div>`;
        const zeit = `${String(it.hour).padStart(2, '0')}:${String(it.minute).padStart(2, '0')}`;
        fieldMeta.push({ key, points: punkte, acceptable: it.antwort, exakt: !!it.exakt, stem: '', label: it.label || `${kurz}: Uhr ${zeit}` });
      } else { // 'eingabe' (Standard)
        const bildHtml = it.bild ? `<img class="gen-bild" src="${iconSrc(it.bild)}" alt="">` : '';
        const frageHtml = it.frage ? `<span class="gen-frage">${escapeHtml(it.frage)}</span>` : '';
        html += `<div class="gen-item">${nrHtml}${bildHtml}${frageHtml}<input type="text" class="text-input abschluss-field gen-input" data-key="${key}"></div>`;
        fieldMeta.push({ key, points: punkte, acceptable: it.manuell ? undefined : it.antwort, manuell: !!it.manuell, exakt: !!it.exakt, stem: '', label: it.label || `${kurz}: ${it.frage || (it.bild ? 'Bild ' + it.bild.replace(/_/g, ' ') : '')}`.trim() });
      }
    });
  });

  mount.innerHTML = html;

  abschlussState.felderGesamt = fieldMeta.length;
  abschlussState.felderBeantwortet = 0;
  abschlussState.punkte = 0;
  abschlussState.punkteMax = Math.round(fieldMeta.filter(f => !f.manuell).reduce((s, f) => s + f.points, 0) * 100) / 100;
  const answered = {};
  abschlussState.fieldMeta = fieldMeta;
  abschlussState.answered = answered;

  function recompute() {
    let punkte = 0, beantwortet = 0;
    fieldMeta.forEach(f => {
      if (answered[f.key]) { beantwortet++; if (answered[f.key].correct) punkte += f.points; }
    });
    abschlussState.punkte = punkte;
    abschlussState.felderBeantwortet = beantwortet;
    updateProgress();
  }

  function auswerten(el) {
    const key = el.getAttribute('data-key');
    const meta = fieldMeta.find(f => f.key === key);
    if (!meta) return;
    const wert = el.value;
    if (el.type === 'hidden') { // Antippen-Auswahl: Markierung passend zum gespeicherten Wert setzen (auch beim Wiederherstellen)
      const gruppe = el.closest('.gen-chip-gruppe');
      if (gruppe) gruppe.querySelectorAll('.mc-opt').forEach(o => o.classList.toggle('selected', o.getAttribute('data-wert') === wert && wert !== ''));
    }
    if (!wert || wert.trim() === '') {
      delete answered[key];
      if (el.type !== 'hidden') el.style.borderColor = 'var(--line)';
      recompute();
      return;
    }
    answered[key] = { correct: meta.manuell ? null : pruefeFeld(meta, (meta.stem || '') + wert) }; // manuell: null = von der Lehrkraft zu bewerten
    if (el.type !== 'hidden') el.style.borderColor = 'var(--teal)';
    recompute();
  }

  mount.querySelectorAll('.abschluss-field').forEach(el => {
    el.addEventListener('blur', () => auswerten(el));
    if (el.tagName === 'SELECT') el.addEventListener('change', () => auswerten(el));
  });
  mount.querySelectorAll('.gen-chip-gruppe').forEach(gruppe => {
    const hidden = gruppe.querySelector('input.abschluss-field');
    gruppe.querySelectorAll('.mc-opt').forEach(opt => {
      opt.addEventListener('click', () => { hidden.value = opt.getAttribute('data-wert'); auswerten(hidden); });
    });
  });
}

// ---------------- TEILE EINES ABSCHLUSSTESTS ----------------
// Ein "Teil" ist ein Abschnitt mit eigener Überschrift (<h2>) im aufgebauten Test. Jedes Feld (data-key) gehört zum Teil,
// unter dessen Überschrift es steht. Funktioniert für alle Abschlusstest-Typen (alte Builder und generischer Builder).
function abschlussTeileInfo() {
  const mount = document.getElementById('abschlussBody');
  const teile = [], keyTeil = {};
  if (!mount) return { teile, keyTeil };
  mount.querySelectorAll('h2, [data-key]').forEach(el => {
    if (el.tagName === 'H2') { teile.push({ nr: teile.length + 1, titel: el.textContent.trim() }); }
    else {
      if (!teile.length) teile.push({ nr: 1, titel: '' });
      keyTeil[el.getAttribute('data-key')] = teile.length;
    }
  });
  return { teile, keyTeil };
}

// ---------------- REGISTER: Abschlusstest-Typ -> Builder ----------------
// Beide Seiten schlagen hier nach (statt langer if/else-Ketten). Neuer Typ = hier eine Zeile ergänzen.
const ABSCHLUSS_BUILDER = {
  abschlusstest: buildAbschlusstest,
  abschlusstest2: buildAbschlusstest2,
  abschlusstest3: buildAbschlusstest3,
  abschlusstest4: buildAbschlusstest4,
  abschlusstest5: buildAbschlusstest5,
  abschlusstest_generisch: buildAbschlussGenerisch,
};
