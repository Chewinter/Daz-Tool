/* ==========================================================================
   korrektur.js — Korrektur-Karten nach einem Test (Phase 1, Lukas 11./12.11.2026). Schüler- UND Lehrkraft-Seite.
   Für jede falsche Aufgabe eine Karte: die Aufgabe wie im Test (Bild, Lückensatz, Verbzeile …), „Das hast du geschrieben“,
   „So ist es richtig“, Hinweis zu Artikel / Fall / Groß- und Kleinschreibung (Lukas 12.11.: kommt IMMER vor), das Wort wie
   im Duden, „Warum?“ erst Deutsch, dann die Sprache des Kindes, ggf. der Regel-Kasten, „Ins Heft“.
   Texte: data/korrektur-<lernfeld>.js (gen_korrektur.py). Fehlt eine Karte, gibt es trotzdem Aufgabe + Lösung (nie leer).
   ========================================================================== */
const KORREKTUR_LERNFELDER = ['a2_lf5', 'a2_lf4', 'a2_lf3', 'a2_lf2', 'a2_lf1', 'a1_check', 'a2_grammatik', 'a2_lesen', 'a1_lf5'];   // a1_check = Einstufungstest (13.11.2026)   // Lernfelder mit fertigen Karten (Phase 1: A2 LF5 Muster, dann LF4)
const KK_SPRACHEN = { ar: 'Arabisch', uk: 'Ukrainisch', ru: 'Russisch', tr: 'Türkisch', fa: 'Persisch', sq: 'Albanisch', bg: 'Bulgarisch', es: 'Spanisch', so: 'Somali', am: 'Amharisch', ti: 'Tigrinya', ku: 'Kurdisch (Sorani)' };
const KK_PERSONEN = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const KK_ARTIKEL = ['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines'];
const KK_GENUS = { der: 'maskulin', die: 'feminin', das: 'neutral' };

function korrekturLernfeld(testId) {
  const lf = (typeof CURRICULUM !== 'undefined' ? CURRICULUM : []).find(s => s.items.indexOf(testId) >= 0);
  return lf && KORREKTUR_LERNFELDER.indexOf(lf.id) >= 0 ? lf.id : null;
}
const kkGeladen = {};
function kkSkript(pfad) {
  return kkGeladen[pfad] || (kkGeladen[pfad] = new Promise(res => {
    const s = document.createElement('script');
    s.src = pfad + '?v=' + (typeof APP_V !== 'undefined' ? APP_V : '');
    s.onload = res; s.onerror = res; document.head.appendChild(s);
  }));
}
// Karten eines Tests laden: data/korrektur-<test>.js (je Test eine Datei, Schul-WLAN) ruft korrekturDaten(...) auf.
// Rückgabe: Daten des Lernfelds (alle schon geladenen Tests) oder null (dann alte Liste)
window.KORREKTUR = window.KORREKTUR || {};
function korrekturDaten(lf, test, d) {
  const L = window.KORREKTUR[lf] || (window.KORREKTUR[lf] = { karten: {}, vok: {}, regeln: {}, begriffe: {} });
  L.karten[test] = d.karten; Object.assign(L.vok, d.vok); Object.assign(L.regeln, d.regeln); Object.assign(L.begriffe || (L.begriffe = {}), d.begriffe || {});
}
async function ladeKorrektur(testId) {
  const lf = korrekturLernfeld(testId);
  if (!lf) return null;
  await kkSkript('data/korrektur-' + testId + '.js');   // Regel-Kästen stehen mit drin (nicht die ganze grammatik-erklaerungen.js laden)
  return (window.KORREKTUR[lf] && window.KORREKTUR[lf].karten[testId]) ? window.KORREKTUR[lf] : null;
}
// Deutsche Wortgruppen in arabischer/persischer/kurdischer Schrift als EIN Block links-nach-rechts (13.11.2026: „Wie heißen Sie?“
// stand sonst verdreht, weil sich die einzelnen Wörter im Rechts-nach-links-Absatz umsortieren).
const KK_LATEIN = /[A-Za-zÄÖÜäöüß0-9*][A-Za-zÄÖÜäöüß0-9*\s,.:;?!'’„“"\-–…\/+=]*[A-Za-zÄÖÜäöüß0-9*?!…“"]|[A-Za-zÄÖÜäöüß0-9]/g;   // ohne Klammern/Endpunkt (gehören zum RTL-Satz)
// Fachwörter (Nomen, Dativ, Endung …) antippbar: kurze Erklärung, darunter die Sprache des Kindes (Merkliste 14.11.2026, Punkt 10)
function kkBegriffe(html, daten, schon) {
  const B = (daten && daten.begriffe) || {};
  Object.keys(B).forEach(k => {
    if (schon.has(k)) return;
    for (const f of (B[k].formen || [])) {
      const re = new RegExp('(^|[^\\wäöüÄÖÜß<>/=-])(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\wäöüß])');
      if (re.test(html)) { html = html.replace(re, (m, a, w) => `${a}<button type="button" class="kk-begriff" data-b="${escapeHtml(k)}">${w}</button>`); schon.add(k); break; }
    }
  });
  return html;
}
if (typeof document !== 'undefined') document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('.kk-begriff') : null;
  if (!b) return;
  const karte = b.closest('.kk-karte'), p = b.closest('p');
  const alt = p.nextElementSibling && p.nextElementSibling.classList.contains('kk-begriff-box') ? p.nextElementSibling : null;
  if (alt) { const gleich = alt.dataset.b === b.dataset.b; alt.remove(); if (gleich) return; }
  let R = null;
  Object.values(window.KORREKTUR || {}).forEach(L => { if (!R && L.begriffe && L.begriffe[b.dataset.b]) R = L.begriffe[b.dataset.b]; });
  if (!R) return;
  const sp = (karte && karte.dataset.sp ? karte.dataset.sp.split(',') : []).filter(Boolean);
  const box = document.createElement('div'); box.className = 'kk-begriff-box'; box.dataset.b = b.dataset.b;
  box.innerHTML = `<strong>${escapeHtml(b.dataset.b)}</strong><p>${escapeHtml(R.de)}</p>${(R.bsp || []).length ? `<p class="kk-bsp">${R.bsp.map(escapeHtml).join(' · ')}</p>` : ''}`
    + sp.map(k => R.sp && R.sp[k] ? `<div class="kk-sp-block" dir="auto"><div class="kk-sp-name">${KK_SPRACHEN[k]}: ${escapeHtml([].concat(R.sp[k])[0])}</div>${[].concat(R.sp[k]).slice(1).flat().map(x => `<p dir="auto">${escapeHtml(x)}</p>`).join('')}${typeof uebMeldenKnopf === 'function' ? uebMeldenKnopf('Fachwort: ' + b.dataset.b, k, [].concat(R.sp[k]).flat().join(' ')) : ''}</div>` : '').join('');
  p.insertAdjacentElement('afterend', box);
});
function kkInline(s) {   // **fett**; bdi: deutsche Wörter in arabischer/persischer Schrift richtig einordnen; [[Wort|Stichwort]] -> Wort
  let t = String(s || '');
  if (/[\u0600-\u06FF]/.test(t)) t = t.replace(KK_LATEIN, x => '\u0001' + x + '\u0002');
  return escapeHtml(t).replace(/\*\*([^*]+)\*\*/g, '<strong><bdi>$1</bdi></strong>').replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1')
    .replace(/\u0001/g, '<bdi dir="ltr">').replace(/\u0002/g, '</bdi>');
}
// Welche Karte gehört zu diesem Fehler? Schritt-Tests: „teil1:5“. Lernfeld-Test: aus dem Feld-Schlüssel.
function korrekturSchluessel(testId, f) {
  if (f.key) {
    let m = /^v\d+-\d+-(.+)-(praesens|perfekt)-(\d+)$/.exec(f.key); if (m) return m[2] + ':' + m[1];   // Lernfeld-Test 4: alle Personen
    m = /^besch\d*-(\d+)-[ap]$/.exec(f.key); if (m) return 'besch:' + m[1];                       // Einzahl + Mehrzahl = eine Karte
    m = /^dial-(\d+)$/.exec(f.key); if (m) return 'dial:' + m[1];
    m = /^v\d+-\d+-(.+)-perfekt$/.exec(f.key); if (m) return 'perfekt:' + m[1];
    m = /^v\d+-\d+-(.+)-(\d+)$/.exec(f.key); if (m) return 'praesens:' + m[1];
    m = /^gv-(\d+)$/.exec(f.key); if (m) return 'gv:' + m[1];
    m = /^sa\d*-(\d+)$/.exec(f.key); if (m) return 'sa:' + m[1];
    // Lernfeld-Tests A2 1–3 (13.11.2026): Konjugation je Verb (ganze Zeile), Steigern/Frage+Antwort/Körper je Zeile = eine Karte
    m = /^konj-[a-z0-9]+-(.+)-\d+$/.exec(f.key); if (m) return 'konj:' + m[1];   // auch „konj-a0g0-…“ (Lernfeld-Tests mit Abschnitten, A1.5)
    m = /^(steig|fa|fak)-(\d+)-[ksfa]$/.exec(f.key); if (m) return m[1] + ':' + m[2];
    m = /^koerper-(\d+)-[em]$/.exec(f.key); if (m) return 'koerper:' + m[1];
    m = /^satzbau-(\d+)-\d+$/.exec(f.key); if (m) return 'satzbau:' + m[1];
    m = /^(geg|farbe|praep|wa|vs|sb)-(\d+)$/.exec(f.key); if (m) return m[1] + ':' + m[2];
    return f.key;
  }
  const t = (typeof TESTS !== 'undefined' && TESTS[testId]) || {};
  if (t.bereiche) return einstufungSchluessel(t, f.frage, f.korrektAntwort);
  const gb = grammatikBlock(testId);
  if (gb) {   // Grammatik-Block (13.11.2026): „p<Aufgabe>:<Satz>“, ältere Bewertungen ohne itemIdx über den Fragetext
    const nr = Number((/^p(\d+)$/.exec(f.teilId || '') || [])[1]), p = gb.punkte.find(x => x.nr === nr);
    if (!p) return null;
    const i = f.itemIdx != null ? f.itemIdx : p.uebung.items.findIndex(it => it.frage === f.frage);
    return i >= 0 ? 'p' + nr + ':' + i : null;
  }   // Einstufungstest: über den Fragetext (Fragen werden je Runde gezogen)
  if (f.teilId && /^teil\d$/.test(f.teilId) && f.num != null) return f.teilId + ':' + f.num;
  // ältere Bewertungen ohne Teil/Nummer: über den Fragetext
  const such = (teil, fn) => { const it = (t[teil] || []).find(fn); return it ? teil + ':' + it.num : null; };
  return such('teil1', i => 'Bildzuordnung: ' + i.word === f.frage) || such('teil2', i => `${i.vor} ___ ${i.nach}` === f.frage)
    || such('teil4', i => typeof teil4FrageText === 'function' && teil4FrageText(t, i) === f.frage)
    || such('teil3', i => f.satz != null && (i.word === f.frage || (i.pronomen && f.frage && f.frage.indexOf(i.word) >= 0))) || null;
}

function grammatikBlock(id) { const a = typeof ACTIVITIES !== 'undefined' && ACTIVITIES[id]; return a && Array.isArray(a.punkte) ? a : null; }
// Lückensatz mit Lösung (wie heftSatz in bewertung.js): „Ich freue ___ auf die Ferien.“ + „mich“ -> ganzer Satz
function kkGrammatikSatz(it) {
  const a = [].concat(it.antwort)[0] || '', f = String(it.frage || '');
  if (f.indexOf('___') < 0) return a;
  let s = f.split('→').pop().trim();
  const teile = (s.match(/___/g) || []).length > 1 ? a.split(' ') : [a];
  teile.forEach(x => { s = s.replace('___', x); });
  return s.replace(/\s*\([^)]*\)/g, '').trim();
}
// Einstufungstest (13.11.2026): Schlüssel „b<Bereich>:<Index im Pool>“
function einstufungSchluessel(t, frage, korrekt) {   // gleiche Frage bei allen Uhren („Wie viel Uhr ist es?“) -> zusätzlich über die Lösung
  const k = String(korrekt || '').toLowerCase().split(' / ')[0].trim();
  for (let b = 0; b < t.bereiche.length; b++) {
    const pool = t.bereiche[b].pool, gleich = pool.map((q, i) => i).filter(i => pool[i].prompt === frage);
    if (!gleich.length) continue;
    const i = gleich.length === 1 ? gleich[0] : gleich.find(i => [].concat(pool[i].answer, pool[i].acceptable || []).some(a => String(a).toLowerCase() === k));
    return i == null ? null : 'b' + (b + 1) + ':' + i;
  }
  return null;
}
function einstufungFrage(t, key) {
  const m = /^b(\d+):(\d+)$/.exec(key || ''); return m && t.bereiche && t.bereiche[m[1] - 1] ? t.bereiche[m[1] - 1].pool[Number(m[2])] : null;
}
// Erklärungsuhr (Lukas 11.11.: „Erklärungsuhr wieder einblenden und mit Pfeil zeigen“): rechte Hälfte „nach“, linke „vor“,
// 12 = „Uhr“, 3 = „Viertel nach“, 6 = „halb“, 9 = „Viertel vor“; großer Zeiger rot mit Pfeil, kleiner Zeiger dunkel.
function kkUhr(h, m) {
  const cx = 160, cy = 132, r = 92, P = (a, l) => [cx + l * Math.sin(a * Math.PI / 180), cy - l * Math.cos(a * Math.PI / 180)].map(x => x.toFixed(1));
  const zahlen = Array.from({ length: 12 }, (_, i) => { const [x, y] = P((i + 1) * 30, r - 16); return `<text x="${x}" y="${(+y + 5).toFixed(1)}" font-size="15" text-anchor="middle">${i + 1}</text>`; }).join('');
  const an = { 0: 'uhr', 15: 'nach', 30: 'halb', 45: 'vor' }[m];
  const lab = (k, x, y, txt, anchor) => `<text x="${x}" y="${y}" font-size="${an === k ? 15 : 12}" font-weight="${an === k ? 700 : 400}" fill="${an === k ? '#c0392b' : 'currentColor'}" text-anchor="${anchor}">${txt}</text>`;
  const [mx, my] = P(m * 6, r - 22), [hx, hy] = P(((h % 12) + m / 60) * 30, r * 0.5);
  return `<svg class="kk-svg kk-uhr" viewBox="0 0 320 262" role="img" aria-label="Uhr ${h}:${String(m).padStart(2, '0')}">
    <defs><marker id="kkuz" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="12" refY="8" orient="auto"><path d="M0 0L16 8L0 16z" fill="#c0392b"/></marker></defs>
    <path d="M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}Z" fill="#e8f4ea"/><path d="M${cx} ${cy + r}A${r} ${r} 0 0 1 ${cx} ${cy - r}Z" fill="#fdf0e0"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="3"/>${zahlen}
    ${lab('uhr', cx, 24, '… Uhr', 'middle')}${lab('halb', cx, 254, 'halb', 'middle')}${lab('nach', 262, cy - 4, 'Viertel', 'start')}${lab('nach', 262, cy + 12, 'nach', 'start')}
    ${lab('vor', 58, cy - 4, 'Viertel', 'end')}${lab('vor', 58, cy + 12, 'vor', 'end')}
    <text x="${cx + 40}" y="${cy + 26}" font-size="12" fill="#2e7d32">nach</text><text x="${cx - 40}" y="${cy + 26}" font-size="12" fill="#b06000" text-anchor="end">vor</text>
    <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#1E4B45" stroke-width="7" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#c0392b" stroke-width="4" marker-end="url(#kkuz)"/><circle cx="${cx}" cy="${cy}" r="5" fill="currentColor"/></svg>
    <p class="kk-uhr-leg"><span style="color:#c0392b">━ großer Zeiger</span> · <span style="color:#1E4B45">━ kleiner Zeiger</span></p>`;
}

// ---- Artikel, Fall, Groß-/Kleinschreibung: ohne KI aus der Antwort ablesbar (Lukas 12.11.2026) ----
function kkNorm(s) { return String(s || '').trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, ''); }
function kkAbstand(a, b) {   // Levenshtein, klein
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i].concat(Array(n).fill(0)));
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function korrekturFormHinweis(antwort, richtig) {
  const a = kkNorm(antwort), r = kkNorm(String(richtig || '').split(' / ')[0]);
  if (!a || !r || a === r || /^\((keine Antwort|kein Satz|im Heft)/.test(a)) return [];
  const aw = a.split(' '), rw = r.split(' ');
  const out = [];
  const rArt = rw.length > 1 && KK_ARTIKEL.indexOf(rw[0].toLowerCase()) >= 0;
  if (rArt && rw.length === 2) {   // Beschriften: „der Döner“
    const nomen = rw[1], gen = KK_GENUS[rw[0].toLowerCase()];
    const aArt = aw.length > 1 && KK_ARTIKEL.indexOf(aw[0].toLowerCase()) >= 0;
    const aNomen = aArt ? aw.slice(1).join(' ') : a;
    const nomenGleich = aNomen.toLowerCase() === nomen.toLowerCase();
    const nomenFast = nomenGleich || kkAbstand(aNomen.toLowerCase(), nomen.toLowerCase()) <= 2;   // anderes Wort gewählt -> kein Artikel-Hinweis
    if (!aArt && nomenGleich) out.push(`Das Wort stimmt, aber der **Artikel fehlt**: **${rw[0]}** ${nomen}. Lerne jedes Nomen mit Artikel.`);
    else if (aArt && nomenFast && aw[0].toLowerCase() !== rw[0].toLowerCase()) {
      const fall = ['den', 'dem', 'des', 'einen', 'einem', 'einer', 'eines'].indexOf(aw[0].toLowerCase()) >= 0;
      out.push(fall ? `„${aw[0]}“ ist eine Form für einen anderen **Fall**. Beim Beschriften steht der Artikel im Nominativ: **${rw[0]}** ${nomen}${gen ? ' (' + gen + ')' : ''}.`
        : `**Falscher Artikel**: nicht „${aw[0]}“, sondern **${rw[0]}** ${nomen}${gen ? ' (' + gen + ')' : ''}.`);
    }
    if (nomenGleich && aNomen !== nomen && aNomen.toLowerCase() === nomen.toLowerCase()) out.push(`**Nomen schreibt man groß**: ${nomen}.`);
    if (!nomenGleich && kkAbstand(aNomen.toLowerCase(), nomen.toLowerCase()) <= 2) out.push(`Fast richtig. Achte auf die **Schreibweise**: ${nomen}.`);
    return out;
  }
  // Sätze und andere Antworten: Wort für Wort, wenn gleich lang
  if (aw.length === rw.length) {
    aw.forEach((w, i) => {
      const s = rw[i];
      if (w === s) return;
      if (w.toLowerCase() === s.toLowerCase()) {
        out.push(s[0] === s[0].toUpperCase() && s[0] !== s[0].toLowerCase()
          ? (i === 0 ? `Der Satz beginnt **groß**: ${s}.` : `**${s}** schreibt man groß (Nomen).`)
          : `**${s}** schreibt man klein.`);
      } else if (KK_ARTIKEL.indexOf(w.toLowerCase()) >= 0 && KK_ARTIKEL.indexOf(s.toLowerCase()) >= 0 && (aw[i + 1] || '').toLowerCase() === (rw[i + 1] || '').toLowerCase()) {
        out.push(`**Artikel**: nicht „${w}“, sondern **${s}** ${rw[i + 1] || ''}.`);
      }
    });
  } else if (aw.length === rw.length - 1 && rArt && aw.join(' ').toLowerCase() === rw.slice(1).join(' ').toLowerCase()) {
    out.push(`Der **Artikel fehlt**: **${rw[0]}** ${rw.slice(1).join(' ')}.`);
  }
  return out;
}

// ---- kleine Zeichnungen ----
function kkZeichnung(z) {
  if (!z) return '';
  const uz = /^uhr:(\d+):(\d+)$/.exec(z); if (uz) return kkUhr(Number(uz[1]), Number(uz[2]));
  if (z === 'treppe_hoch') return `<svg class="kk-svg" viewBox="0 0 260 130" role="img" aria-label="Treppe nach oben"><path d="M20 115h45v-28h45v-28h45v-28h80" fill="none" stroke="currentColor" stroke-width="4"/>
    <defs><marker id="kkp" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto"><path d="M0 0L14 7L0 14z" fill="#c0392b"/></marker></defs>
    <path d="M45 100 L170 30" stroke="#c0392b" stroke-width="4" marker-end="url(#kkp)"/>
    <text x="118" y="92" font-size="17" fill="#c0392b" font-weight="700">hinauf ↑</text><text x="190" y="22" font-size="14">2. Stock</text></svg>`;
  let m = /^tageslinie:(\w+)$/.exec(z);
  if (m) {
    const T = [['morgen', 'Morgen', 'Frühstück'], ['mittag', 'Mittag', 'Mittagessen'], ['nachmittag', 'Nachmittag', 'Kaffee und Kuchen'], ['abend', 'Abend', 'Abendessen']];
    return `<svg class="kk-svg" viewBox="0 0 320 90" role="img" aria-label="Tageslinie"><line x1="20" y1="45" x2="300" y2="45" stroke="currentColor" stroke-width="3"/>${T.map((t, i) => {
      const x = 30 + i * 85, an = t[0] === m[1];
      return `<circle cx="${x}" cy="45" r="${an ? 9 : 6}" fill="${an ? '#c0392b' : 'currentColor'}"/><text x="${x}" y="28" font-size="13" text-anchor="middle" font-weight="${an ? 700 : 400}">${t[1]}</text>
        <text x="${x}" y="72" font-size="${an ? 12 : 10}" text-anchor="middle" fill="${an ? '#c0392b' : 'currentColor'}" font-weight="${an ? 700 : 400}">${t[2]}</text>`;
    }).join('')}</svg>`;
  }
  m = /^muenze:(\w+)$/.exec(z);
  if (m) {   // alle Münzen von groß nach klein, die gesuchte mit Pfeil (Farben wie echt: 2 € / 1 € zweifarbig, gold, kupferrot)
    const M = [['2e', '2 €', 'silber', 'gold', 30], ['1e', '1 €', 'gold', 'silber', 28], ['50c', '50 ct', 'gold', 'gold', 27], ['20c', '20 ct', 'gold', 'gold', 25],
      ['10c', '10 ct', 'gold', 'gold', 22], ['5c', '5 ct', 'kupfer', 'kupfer', 24], ['2c', '2 ct', 'kupfer', 'kupfer', 21], ['1c', '1 ct', 'kupfer', 'kupfer', 18]];
    const F = { silber: '#c9ccd1', gold: '#d9b44a', kupfer: '#c0703f' };
    return `<svg class="kk-svg" viewBox="0 0 520 110" role="img" aria-label="Euro-Münzen">${M.map((x, i) => {
      const cx = 34 + i * 64, an = x[0] === m[1];
      return `<circle cx="${cx}" cy="58" r="${x[4]}" fill="${F[x[2]]}" stroke="#555" stroke-width="1.5"/><circle cx="${cx}" cy="58" r="${x[4] * 0.62}" fill="${F[x[3]]}"/>
        <text x="${cx}" y="62" font-size="11" text-anchor="middle" font-weight="700">${x[1]}</text>${an ? `<text x="${cx}" y="18" font-size="20" text-anchor="middle" fill="#c0392b">↓</text>` : ''}`;
    }).join('')}</svg>`;
  }
  return '';
}

// ---- Bausteine der Karte ----
let kkMitArasaac = false;   // zeigt eine Karte ein ARASAAC-Bild? -> Lizenz-Hinweis unter den Karten (13.11.2026)
function kkBild(n, cls) {
  if (!(n && typeof ICONS !== 'undefined' && ICONS[n])) return '';
  if ((window.ARASAAC_NAMEN || []).indexOf(n) >= 0) kkMitArasaac = true;
  return `<img class="${cls || 'kk-bild'}" src="${iconSrc(n)}" alt="">`;
}
function kkVokHtml(st, v, sprachen) {
  if (!st || !v) return '';
  const m = /^(der|die|das) (.+)$/.exec(st);
  const kopf = m ? `<strong>${escapeHtml(m[2])}, ${m[1]}</strong> <span class="kk-gram">${st === 'die Lebensmittel' ? 'meist Plural' : KK_GENUS[m[1]] + ' · ' + (v.pl ? 'Plural: ' + escapeHtml(v.pl) : 'kein Plural')}</span>`
    : `<strong>${escapeHtml(st)}</strong>`;
  const melden = (w, k, t) => typeof uebMeldenKnopf === 'function' ? uebMeldenKnopf(w, k, t) : '';   // nur auf der Seite des Kindes (Merkliste 14.11., Punkt 8)
  const ueb = sprachen.map(k => v.sp && v.sp[k] ? `<div class="kk-sp" dir="auto"><span class="kk-sp-name">${KK_SPRACHEN[k]}:</span> ${escapeHtml(v.sp[k])}${melden(st, k, v.sp[k])}</div>` : '').join('');
  return `<div class="kk-wort">${kopf}${v.erkl ? `<div class="kk-erkl">${escapeHtml(v.erkl)}</div>` : ''}${v.bsp ? `<div class="kk-bsp">${escapeHtml(v.bsp)}</div>` : ''}${ueb}</div>`;
}
function kkRegelHtml(key, sprachen, daten) {
  const R = ((daten && daten.regeln) || {})[key] || ((window.GRAMMATIK || {}).regeln || {})[key];
  if (!R) return '';
  return `<details class="kk-regel"><summary>💡 Regel: ${kkInline(R.titel)}</summary>${R.de.map(p => `<p>${kkInline(p)}</p>`).join('')}
    ${(R.bsp || []).length ? `<div class="kk-regel-bsp">${R.bsp.map(x => `<p>${escapeHtml(x)}</p>`).join('')}</div>` : ''}
    ${sprachen.map(k => { const t = R.sp && R.sp[k]; return t ? `<div class="kk-sp-block" dir="auto"><div class="kk-sp-name">${KK_SPRACHEN[k]}: ${escapeHtml(t[0])}</div>${[].concat(t[1]).map(x => `<p dir="auto">${escapeHtml(x)}</p>`).join('')}${typeof uebMeldenKnopf === 'function' ? uebMeldenKnopf('Erklärung: ' + R.titel, k, [].concat(t[1]).join(' ')) : ''}</div>` : ''; }).join('')}</details>`;
}
function kkIconWort(t, icon) {   // Name eines Bildes als Wort (über die Aufgabe, in der es die richtige Lösung ist)
  const it = (t.teil1 || []).find(i => i.icons[i.correct] === icon);
  return it ? it.word : String(icon || '').replace(/^S_lf\d+_schritt\d+_/, '').replace(/_\d+$/, '').replace(/_/g, ' ').replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü');
}
// Die Aufgabe so, wie sie im Test war. Liefert { html, deine, richtig } (deine/richtig ersetzen den Text, z. B. durch Bilder)
function korrekturAufgabe(testId, f, fehlerGruppe) {
  const t = (typeof TESTS !== 'undefined' && TESTS[testId]) || {};
  const key = korrekturSchluessel(testId, f) || '';
  const [teil, nr] = key.split(':');
  const it = /^teil\d$/.test(teil) ? (t[teil] || []).find(i => String(i.num) === nr) : null;
  const gb = grammatikBlock(testId), gm = gb && /^p(\d+):(\d+)$/.exec(key);
  if (gm) {   // Grammatik-Block: Aufgabe mit Anleitung, Satz mit Lösung in der Lücke
    const p = gb.punkte.find(x => x.nr === Number(gm[1])), it = p && p.uebung.items[Number(gm[2])];
    if (it) {
      const E = escapeHtml, loes = [].concat(it.antwort)[0], heft = /^\((im Heft|keine Antwort)\)$/.test(f.antwort || f.satz || '');
      const satz = it.frage.indexOf('___') >= 0 ? E(it.frage.split('→').pop().trim()).replace(/___/, `<span class="kk-luecke"><strong>${E(loes.split(' ')[0])}</strong></span>`) : E(it.frage);
      return { html: `<p class="kk-frage"><strong>Aufgabe ${p.nr}: ${E(p.titel || '')}</strong></p><p class="kk-anleitung">${E(p.uebung.anleitung || '')}</p><p class="kk-satz">${it.frage.indexOf('___') >= 0 ? satz : E(it.frage)}</p>`,
        deine: null, richtig: `${zitat(kkGrammatikSatz(it))}`, ohneDeine: heft };
    }
  }
  const ef = t.bereiche ? einstufungFrage(t, key) : null;
  if (ef) {   // Einstufungstest: Frage wie im Test (Uhr, Auswahl, Lückensatz)
    const E = escapeHtml, leer = !f.antwort || f.antwort === '(keine Antwort)';
    if (ef.type === 'mc') return { html: `<p class="kk-frage">${E(ef.prompt)}</p><div class="kk-optionen">${ef.options.map((o, i) =>
      `<span class="kk-opt${i === ef.correct ? ' kk-ok' : o === f.antwort ? ' kk-falsch' : ''}">${i === ef.correct ? '✓ ' : o === f.antwort ? '✗ ' : ''}${E(o)}</span>`).join('')}</div>`, deine: null, richtig: null, lab: 'Du hast gewählt:' };
    if (ef.type === 'clock') return { html: `<p class="kk-frage">${E(ef.prompt)}</p>${typeof renderClockSVG === 'function' ? renderClockSVG(ef.hour, ef.minute, 130) : ''}`, deine: null, richtig: null };
    const loes = [].concat(ef.answer)[0];
    if (ef.prompt.indexOf('___') >= 0) return { html: `<p class="kk-satz">${E(ef.prompt).replace('___', `<span class="kk-luecke">${leer ? '' : `<s>${E(f.antwort)}</s> `}<strong>${E(loes)}</strong></span>`)}</p>`, deine: null, richtig: null };
    return { html: `<p class="kk-frage">${E(ef.prompt)}</p>`, deine: null, richtig: null };
  }
  if (teil === 'teil1' && it) {
    const gewaehlt = it.icons.find(n => n.replace(/_/g, ' ') === f.antwort);
    return { html: `<p class="kk-frage">Welches Bild passt zu <strong>${escapeHtml(it.word)}</strong>?</p><div class="kk-bilder">${it.icons.map((n, i) =>
      `<figure class="kk-wahl${i === it.correct ? ' kk-ok' : n === gewaehlt ? ' kk-falsch' : ''}">${kkBild(n)}<figcaption>${i === it.correct ? '✓ richtig' : n === gewaehlt ? '✗ deine Wahl' : '&nbsp;'}</figcaption></figure>`).join('')}</div>`,
      deine: gewaehlt ? `${zitat(kkIconWort(t, gewaehlt))}` : null, richtig: `${zitat(it.word)}`, lab: 'Du hast gewählt:' };
  }
  if (teil === 'teil2' && it) {
    const r = it.options[it.correct];
    return { html: `${it.bildGross ? kkBild(it.bildGross, 'kk-bild-gross kk-bild-breit') : ''}<p class="kk-satz">${escapeHtml(it.vor)} <span class="kk-luecke">${f.antwort && f.antwort !== '(keine Antwort)' ? `<s>${escapeHtml(f.antwort)}</s> ` : ''}<strong>${escapeHtml(r)}</strong></span> ${escapeHtml(it.nach)}</p>`, deine: null, richtig: null };
  }
  if (teil === 'teil4' && it) return { html: `${kkBild(it.bild, 'kk-bild-gross')}<p class="kk-frage">${it.beschrifte ? 'Beschrifte das Bild.' : escapeHtml(typeof teil4FrageText === 'function' ? teil4FrageText(t, it) : it.word)}</p>`, deine: null, richtig: null };
  if (teil === 'teil3' && it) return { html: `<p class="kk-frage">Schreibe einen Satz: <strong>${escapeHtml(it.pronomen || '')} …</strong> (${escapeHtml(it.word)})</p>`, deine: null, richtig: null };
  if (teil === 'praesens' || teil === 'perfekt') {   // Lernfeld-Test: die ganze Verbzeile, die falschen Personen markiert
    const verb = nr, tab = (t.tabellen || []).find(x => (x.praesens && x.praesens[verb]) || (x.forms && x.forms[verb]));
    const formen = !tab ? null : tab.forms ? (tab.forms[verb] || {})[teil] : (teil === 'praesens' ? tab.praesens[verb] : null);
    if (formen) {
      const pers = g => Number((/-(\d+)$/.exec(g.key || '') || [])[1]);
      const falsch = new Set(fehlerGruppe.map(pers));
      return { html: `<p class="kk-frage"><strong>${escapeHtml(verb)}</strong> im ${teil === 'praesens' ? 'Präsens' : 'Perfekt'}</p><table class="kk-verb">${formen.map((form, i) =>
        `<tr class="${falsch.has(i) ? 'kk-verb-falsch' : ''}"><th>${KK_PERSONEN[i]}</th><td>${escapeHtml(form)}</td><td>${falsch.has(i) ? '✗ ' + escapeHtml((fehlerGruppe.find(g => pers(g) === i) || {}).antwort || '') : ''}</td></tr>`).join('')}</table>`, deine: null, richtig: null, gruppe: true };
    }
    if (tab) return { html: `<p class="kk-frage"><strong>${escapeHtml(verb)}</strong> im Perfekt (ich)</p>`, deine: null, richtig: null };
  }
  const LT = korrekturAufgabeLT(t, teil, nr, f, fehlerGruppe);
  if (LT) return LT;
  if (teil === 'besch' && t.beschriftung_items) {   // Bild mit Artikel in Einzahl und Mehrzahl beschriften
    const b = t.beschriftung_items[Number(nr)];
    if (b) {
      const ant = suf => (fehlerGruppe.find(g => (g.key || '').endsWith('-' + suf)) || {}).antwort;
      const zeile = (lab, suf) => ant(suf) != null ? `${lab}: ${zitat(ant(suf))}` : `${lab}: ✓`;
      return { html: `${kkBild(b.bild, 'kk-bild-gross')}<p class="kk-frage">Beschrifte mit Artikel in der Einzahl und Mehrzahl.</p>`,
        deine: zeile('Einzahl', 'a') + ' · ' + zeile('Mehrzahl', 'p'), richtig: `<strong>${escapeHtml(b.artikel + ' ' + b.wort)}</strong> · <strong>${escapeHtml(b.plural)}</strong>` };
    }
  }
  if (teil === 'dial' && t.dialog_luecken) {
    const d = t.dialog_luecken[Number(nr)];
    if (d) return { html: `${d.bild ? kkBild(d.bild, 'kk-bild') : ''}<p class="kk-satz"><strong>${escapeHtml(d.sprecher)}</strong> ${escapeHtml(d.start)} <span class="kk-luecke">…</span></p>`,
      deine: f.antwort ? `${zitat(d.start + ' ' + f.antwort)}` : null, richtig: `${zitat(d.start + ' ' + d.antwort)}` };
  }
  if (teil === 'gv' && t.verbinden_bilder) {
    const g = t.verbinden_bilder.geschaefte[Number(nr)], P = t.verbinden_bilder.produkte;
    if (g) {
      const bild = n => (P.find(p => p.name === n) || {}).bild;
      return { html: `<div class="kk-gv">${kkBild(g.bild)}<span class="kk-pfeil">→</span>${g.pflicht.concat(g.auch).map(n => `<figure class="kk-wahl kk-ok">${kkBild(bild(n))}<figcaption>${escapeHtml(n)}</figcaption></figure>`).join('')}</div>
        <p class="kk-frage">Was verkauft <strong>${escapeHtml(g.geschaeft)}</strong>?</p>`, deine: null, richtig: escapeHtml(g.pflicht.concat(g.auch).join(', ')) };
    }
  }
  if (f.bild) return { html: kkBild(f.bild, 'kk-bild-gross') + `<p class="kk-frage">${escapeHtml(f.frage || '')}</p>`, deine: null, richtig: null };
  return { html: `<p class="kk-frage">${escapeHtml(f.frage || '')}</p>`, deine: null, richtig: null };
}
function korrekturKarteHtml(testId, daten, f, sprachen, gruppe) {
  gruppe = gruppe || [f];
  const key = korrekturSchluessel(testId, f);
  const c = daten && daten.karten[testId] && daten.karten[testId][key];
  const A = korrekturAufgabe(testId, f, gruppe);
  const istSatz = f.satz != null;
  const antwort = istSatz ? f.satz : f.antwort, loesung = istSatz ? (f.loesung || f.vorschlag) : (f.loesung || f.korrektAntwort);
  const form = A.gruppe || A.ohneDeine ? [] : gruppe.length > 1 ? [].concat(...gruppe.map(g => korrekturFormHinweis(g.antwort, g.loesung || g.korrektAntwort))) : korrekturFormHinweis(antwort, loesung);
  const leer = !antwort || /^\((keine Antwort|kein Satz)/.test(antwort);
  let h = `<article class="kk-karte" data-kk="${escapeHtml(key || '')}" data-sp="${sprachen.join(',')}"${c ? '' : ' data-kk-fehlt="1"'}>`;
  h += `<div class="kk-aufgabe">${A.html}${kkZeichnung(c && c.zeige !== 'verbzeile' ? c.zeige : '')}</div>`;
  if (!A.gruppe) {
    if (!A.ohneDeine) h += `<div class="kk-zeile kk-deine"><span class="kk-lab">${A.lab || 'Das hast du geschrieben:'}</span> ${leer ? '<em>nichts</em>' : (A.deine || `${zitat(antwort)}`)}</div>`;
    if (loesung || A.richtig) h += `<div class="kk-zeile kk-richtig"><span class="kk-lab">So ist es richtig:</span> ${A.richtig || `${zitat(loesung)}`}</div>`;
  }
  if (form.length) h += `<div class="kk-form">${form.map(x => `<p>⚠ ${kkInline(x)}</p>`).join('')}</div>`;
  if (c && c.vok) h += kkVokHtml(c.vok, daten.vok[c.vok], sprachen);
  if (c) {
    const schon = new Set();
    h += `<div class="kk-warum"><div class="kk-warum-kopf">Warum?</div>${c.warum.map(p => `<p>${kkBegriffe(kkInline(p), daten, schon)}</p>`).join('')}`;
    sprachen.forEach(k => {
      const u = c.ueb && c.ueb[k];
      h += u ? `<div class="kk-sp-block" dir="auto"><div class="kk-sp-name">${KK_SPRACHEN[k]}</div>${u.map(p => `<p dir="auto">${kkInline(p)}</p>`).join('')}${typeof uebMeldenKnopf === 'function' ? uebMeldenKnopf('Korrektur-Karte ' + testId + ' ' + (key || ''), k, u.join(' ')) : ''}</div>`
        : `<div class="kk-sp-block kk-sp-fehlt">${KK_SPRACHEN[k]}: Diese Erklärung gibt es noch nicht in deiner Sprache.</div>`;
    });
    if (sprachen.some(k => c.ueb && c.ueb[k]) && typeof uebMeldenKnopf !== 'function') h += '<p class="kk-sp-fehlt">Übersetzung noch nicht geprüft. Stimmt etwas nicht? Sag es deiner Lehrkraft.</p>';
    h += `</div>`;
    if (c.regel) h += kkRegelHtml(c.regel, sprachen, daten);
  }
  if (f.hinweis) h += `<div class="kk-lehrkraft"><span class="kk-lab">Hinweis deiner Lehrkraft:</span> ${escapeHtml(f.hinweis)}</div>`;
  h += `<div class="kk-heft">✏️ <span class="kk-lab">Ins Heft:</span> ${c ? kkInline(c.heft) : 'Schreibe die richtige Lösung mit Artikel in dein Heft.'}</div></article>`;
  return h;
}
// Alle Karten einer Bewertung. Leerer Text = für diesen Test gibt es (noch) keine Karten -> alte Liste anzeigen.
function korrekturListeHtml(testId, rv, daten, sprachen) {
  if (!daten || !daten.karten[testId]) return '';
  const alle = (rv.fehler || []).concat((rv.saetze || []).map(s => Object.assign({ teilId: s.teilId || 'teil3' }, s)));
  if (!alle.length) return '';
  const gruppen = [], nachKey = {};
  alle.forEach(f => {   // gleiche Karte (z. B. mehrere Personen eines Verbs) nur einmal
    const k = korrekturSchluessel(testId, f);
    const zus = k && /^(praesens|perfekt|besch|konj|steig|fa|fak|koerper|satzbau):/.test(k);
    if (zus && nachKey[k]) { nachKey[k].push(f); return; }
    const g = [f]; gruppen.push(g); if (zus) nachKey[k] = g;
  });
  kkMitArasaac = false;
  const karten = gruppen.map(g => korrekturKarteHtml(testId, daten, g[0], sprachen, g)).join('');
  return `<h3 class="erg-h">Das war falsch — ${gruppen.length} ${gruppen.length === 1 ? 'Aufgabe' : 'Aufgaben'}</h3>
    <p class="kk-intro">Lies bei jeder Aufgabe, <strong>warum</strong> es so richtig ist. Dann schreibe die Korrektur in dein Heft.</p>` + karten
    + (kkMitArasaac ? '<details class="bild-quelle"><summary>Bildquelle</summary>Bilder: Piktogramm-Urheber Sergio Palao. Herkunft: ARASAAC (http://www.arasaac.org). Lizenz: CC (BY-NC-SA). Eigentümer: Regierung von Aragon (Spanien).</details>' : '');
}
// Für Prüfungen: Aufgaben eines Tests ohne Karte
function korrekturLuecken(testId, daten) {
  const t = TESTS[testId] || {}, k = (daten && daten.karten[testId]) || {}, fehlt = [];
  ['teil1', 'teil2', 'teil3', 'teil4'].forEach(teil => (t[teil] || []).forEach(i => { if (!k[teil + ':' + i.num]) fehlt.push(teil + ':' + i.num); }));
  const gb = grammatikBlock(testId);
  if (gb) { gb.punkte.forEach(p => p.uebung.items.forEach((_, i) => { if (!k['p' + p.nr + ':' + i]) fehlt.push('p' + p.nr + ':' + i); })); return fehlt; }
  korrekturLTSchluessel(t).forEach(x => { if (!k[x]) fehlt.push(x); });
  (t.abschnitte || []).forEach((ab, ai) => (ab.items || []).forEach((_, ii) => { if (!k['g' + ai + '-' + ii]) fehlt.push('g' + ai + '-' + ii); }));
  (t.abschnitte || []).filter(a => a.art === 'konjugation').forEach(a => (a.gruppen || []).forEach(g => g.verbs.forEach(v => { if (!k['konj:' + v]) fehlt.push('konj:' + v); })));   // Tests mit Abschnitten (A2 Lesen)
  (t.bereiche || []).forEach((b, bi) => b.pool.forEach((_, i) => { if (!k['b' + (bi + 1) + ':' + i]) fehlt.push('b' + (bi + 1) + ':' + i); }));
  return fehlt;
}
// Alle Karten-Schlüssel der Lernfeld-Tests A2 1–3 (für die Vollständigkeits-Prüfung)
function korrekturLTSchluessel(t) {
  const out = [], n = (pre, arr) => (arr || []).forEach((_, i) => out.push(pre + ':' + i));
  (t.konjugation || []).forEach(g => g.verbs.forEach(v => out.push('konj:' + v)));
  n('geg', t.gegenteile); n('steig', t.steigern); n('farbe', t.male_an); n('fa', t.frage_antwort); n('wa', t.wortarten_zeile);
  n('fak', t.frage_antwort_koerper); n('vs', t.vervollstaendige);
  if (t.praepositionen) n('praep', t.praepositionen.antworten);
  if (t.satzbau && t.satzbau.aufgaben) n('satzbau', t.satzbau.aufgaben); else if (Array.isArray(t.satzbau)) n('sb', t.satzbau);
  (t.koerper_items || []).forEach(it => out.push('koerper:' + it.nr));
  return out;
}
// Die Aufgabe eines Lernfeld-Tests A2 1–3, wie sie im Test war (13.11.2026)
function korrekturAufgabeLT(t, teil, nr, f, gruppe) {
  const i = Number(nr), E = escapeHtml, ant = suf => (gruppe.find(g => (g.key || '').endsWith('-' + suf)) || {}).antwort;
  const zeile = (lab, suf) => ant(suf) != null ? `${lab}: ${zitat(ant(suf))}` : `${lab}: ✓`;
  const KG = (t.konjugation || []).concat(...(t.abschnitte || []).filter(a => a.art === 'konjugation').map(a => a.gruppen || []));
  if (teil === 'konj' && KG.length) {
    const g = KG.find(x => x.forms[nr]);
    if (!g) return null;
    const pers = x => Number((/-(\d+)$/.exec(x.key || '') || [])[1]);
    const falsch = new Set(gruppe.map(pers));
    return { html: `<p class="kk-frage"><strong>${E(nr)}</strong> im Präsens</p><table class="kk-verb">${g.forms[nr].map((form, k) =>
      `<tr class="${falsch.has(k) ? 'kk-verb-falsch' : ''}"><th>${KK_PERSONEN[k]}</th><td>${E([].concat(form).join(' / '))}</td><td>${falsch.has(k) ? '✗ ' + E((gruppe.find(x => pers(x) === k) || {}).antwort || '') : ''}</td></tr>`).join('')}</table>`,
      deine: null, richtig: null, gruppe: true };
  }
  if (teil === 'geg' && t.gegenteile && t.gegenteile[i]) return { html: `<p class="kk-frage">Finde das Gegenteil: <strong>${E(t.gegenteile[i].word)}</strong> → …</p>`, deine: null, richtig: null };
  if (teil === 'steig' && t.steigern && t.steigern[i]) {
    const s = t.steigern[i];
    return { html: `<p class="kk-frage">Steigere: <strong>${E(s.positiv)}</strong> → … → …</p>`, deine: zeile('Komparativ', 'k') + ' · ' + zeile('Superlativ', 's'),
      richtig: `<strong>${E(s.positiv)}</strong> → <strong>${E(s.komparativ)}</strong> → <strong>${E(s.superlativ)}</strong>` };
  }
  if (teil === 'farbe' && t.male_an && t.male_an[i]) {
    const F = { Nomen: ['rot', '#B23B33'], Adjektiv: ['grün', '#3F7D50'], Verb: ['blau', '#2C5C9E'], Artikel: ['grau', '#6B6659'] }, w = t.male_an[i];
    const farbe = k => F[k] ? `<span style="color:${F[k][1]};font-weight:700">■ ${E(k)} (${F[k][0]})</span>` : '<em>keine Farbe</em>';
    return { html: `<p class="kk-frage">Male an: Welche Wortart ist <strong>${E(w.word)}</strong>?</p>`, deine: farbe(f.antwort), richtig: farbe(w.kategorie), lab: 'Du hast gewählt:' };
  }
  if (teil === 'fa' && t.frage_antwort && t.frage_antwort[i]) {
    const r = t.frage_antwort[i];
    return { html: `<p class="kk-frage">${E(r.person)} · <strong>${E(r.was)}</strong> · ${r.jaNein === 'ja' ? 'Ja ✓' : 'Nein ✗'}</p>`, deine: zeile('Frage', 'f') + '<br>' + zeile('Antwort', 'a'),
      richtig: `${zitat(r.frage)}<br>${zitat(r.antwort)}` };
  }
  if (teil === 'praep' && t.praepositionen) {
    const P = t.praepositionen;
    const satz = P.text_teile.map(x => { const m = /^___(\d)___$/.exec(x); if (!m) return E(x); const k = Number(m[1]) - 1;
      return k === i ? `<span class="kk-luecke">${f.antwort && f.antwort !== '(keine Antwort)' ? `<s>${E(f.antwort)}</s> ` : ''}<strong>${E(P.antworten[k])}</strong></span>` : E(P.antworten[k]); }).join(' ');
    return { html: `<p class="kk-satz">${satz}</p>`, deine: null, richtig: null };
  }
  if (teil === 'satzbau' && t.satzbau && t.satzbau.aufgaben && t.satzbau.aufgaben[i]) {
    const a = t.satzbau.aufgaben[i];
    const deine = gruppe.map(x => `${zitat(x.antwort || '')}`).join('<br>');
    const richtig = [0, 1, 2].map(k => typeof computeSatzbauAnswer === 'function' ? computeSatzbauAnswer(a.nomen, a.adjektiv, k) : '').filter(Boolean).map(x => `${zitat([].concat(x)[0])}`).join('<br>');
    return { html: `<p class="kk-frage">Bilde drei Sätze mit <strong>${E(a.nomen)}</strong> + <strong>${E(a.adjektiv)}</strong>.</p>`, deine, richtig: richtig || null };
  }
  if (teil === 'wa' && t.wortarten_zeile && t.wortarten_zeile[i]) {
    const z = t.wortarten_zeile;
    return { html: `<p class="kk-satz">${z.map((w, k) => k === i ? `<span class="kk-luecke"><strong>${E(w.word)}</strong></span>` : E(w.word)).join(' ')}.</p><p class="kk-frage">Welche Wortart ist <strong>${E(z[i].word)}</strong>?</p>`, deine: null, richtig: null };
  }
  if (teil === 'koerper' && t.koerper_items) {
    const it = t.koerper_items.find(x => String(x.nr) === nr);
    if (!it) return null;
    return { html: `${kkBild(t.koerper_bild, 'kk-bild-gross')}<p class="kk-frage">Nr. ${E(nr)}: Schreibe das Körperteil mit Artikel in der Einzahl und Mehrzahl.</p>`,
      deine: zeile('Einzahl', 'e') + ' · ' + zeile('Mehrzahl', 'm'), richtig: `<strong>${E(it.einzahl)}</strong> · <strong>${E(it.mehrzahl)}</strong>` };
  }
  if (teil === 'fak' && t.frage_antwort_koerper && t.frage_antwort_koerper[i]) {
    const r = t.frage_antwort_koerper[i];
    const frage = r.frageAntwortGegeben ? r.frageAntwortGegeben + ' ' + r.frageLuecke : r.frage;
    return { html: `${kkBild(r.bild, 'kk-bild')}<p class="kk-frage">${E(r.trait)}: Frage und antworte.</p>`, deine: zeile('Frage', 'f') + '<br>' + zeile('Antwort', 'a'),
      richtig: `${zitat(frage)}<br>${zitat(r.antwort)}` };
  }
  if (teil === 'vs' && t.vervollstaendige && t.vervollstaendige[i]) {
    const v = t.vervollstaendige[i];
    return { html: `<p class="kk-satz"><strong>${E(v.start)}</strong> <span class="kk-luecke">…</span></p>`, deine: f.antwort ? `${zitat(v.start + ' ' + f.antwort)}` : null, richtig: `${zitat(v.start + ' ' + v.antwort)}` };
  }
  if (teil === 'sb' && Array.isArray(t.satzbau) && t.satzbau[i]) return { html: `<p class="kk-frage">Bilde einen Satz aus: <em>${t.satzbau[i].woerter.map(E).join(' • ')}</em></p>`, deine: null, richtig: null };
  return null;
}
