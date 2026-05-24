/* AUTO-GENERATED from app.js. Run `npm run build` to refresh. */
(function () { 'use strict';
/* =============================================================
   History of Robot — main application script (ES module)
   - Shared between index.html (main chronicle) and humanoid.html
   - Modern web platform: View Transitions API, <dialog>, ⌘K
     command palette, scroll-driven progress (via CSS), animated
     section reveals.
   - Default language: English. Persisted in localStorage.
   ============================================================= */

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const page = document.body.dataset.page || 'main';
  const dataURL = document.body.dataset.data || './data/timeline.json';

  const state = {
    lang: document.documentElement.dataset.lang || 'en',
    data: null,
    cmd: { open: false, query: '', results: [], selected: 0 }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // Pick zh / en field by current language; fall back to base key
  const pick = (obj, key) => {
    if (!obj) return '';
    if (state.lang === 'en' && obj[key + 'En'] != null) return obj[key + 'En'];
    return obj[key] != null ? obj[key] : (obj[key + 'En'] || '');
  };

  const ui = () => state.data && state.data.ui ? state.data.ui[state.lang] : {};

  const imageURL = (file, w) =>
    'https://commons.wikimedia.org/wiki/Special:FilePath/' +
    encodeURIComponent(file) + '?width=' + (w || 800);
  const commonsPage = file =>
    'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file);

  const isRomanIndex = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const roman = n => isRomanIndex[n - 1] || String(n);

  // ── Render: i18n swap of static text ─────────────────────────
  function renderStaticI18n() {
    $$('[data-i18n-en]').forEach(el => {
      el.textContent = state.lang === 'en'
        ? (el.dataset.i18nEn || el.dataset.i18nZh || el.textContent)
        : (el.dataset.i18nZh || el.dataset.i18nEn || el.textContent);
    });
  }

  // ── Render: cover (hero) ─────────────────────────────────────
  function renderCover() {
    const d = state.data;
    if (!d) return;
    const u = ui();

    // Title — supports inline HTML (em / br) from the data
    const titleHTML = state.lang === 'en'
      ? (page === 'humanoid'
          ? 'The Humanoid<br/>Robot<span style="color:var(--ink-mute)">,</span> <em>From One Step</em><br/>to Ten Thousand Units'
          : 'From the <em>Temple</em> and the Factory<span style="color:var(--ink-mute)">,</span><br/>to <em>Embodied</em> General Intelligence')
      : (page === 'humanoid'
          ? '<em>从一步</em>到一万台<span style="color:var(--ink-mute)">：</span><br/>人形机器人五十年'
          : '从神殿与工厂<span style="color:var(--ink-mute)">，</span><br/>到具身的<em>通用智能</em>');
    $('#hero-title').innerHTML = titleHTML;

    // Split the lead between left lede and right body
    const lead = pick(d.meta, 'lead') || '';
    const sentences = lead.split(/(?<=[。.！？!?])\s+/);
    const half = Math.ceil(sentences.length / 2);
    const leftText = sentences.slice(0, half).join(' ');
    const rightText = sentences.slice(half).join(' ');
    $('#hero-lede').textContent = leftText;
    $('#hero-body').innerHTML = (rightText
      ? `<p>${esc(rightText)}</p>`
      : '') + (page === 'humanoid'
      ? `<p style="margin-top:18px"><a href="./index.html">${esc(state.lang === 'en' ? '← Back to the main chronicle' : '← 回到主编年史')}</a></p>`
      : `<p style="margin-top:18px"><a href="./humanoid.html">${esc(state.lang === 'en' ? 'Read the humanoid edition →' : '阅读人形机器人特刊 →')}</a></p>`);

    // Stats grid
    const eventCount = d.eras.reduce((a, e) => a + e.events.length, 0);
    const sourceCount = d.eras.reduce((a, e) =>
      a + e.events.reduce((b, ev) => b + (ev.sources || []).length, 0), 0);
    const span = u.spanValue || (page === 'humanoid' ? '~53 yr' : '~2,700 yr');

    $('#hero-stats').innerHTML = `
      <div class="stat">
        <div class="lbl">${esc(state.lang === 'en' ? 'Events' : '事件')}</div>
        <div class="val tnum">${eventCount}</div>
      </div>
      <div class="stat">
        <div class="lbl">${esc(state.lang === 'en' ? 'Sources' : '来源')}</div>
        <div class="val tnum">${sourceCount}</div>
      </div>
      <div class="stat">
        <div class="lbl">${esc(state.lang === 'en' ? 'Span' : '跨度')}</div>
        <div class="val tnum">${esc(span)}</div>
      </div>
    `;

    // Issue date
    $('#issue-date').textContent = d.meta.updated;
    if ($('#mast-date')) $('#mast-date').textContent = formatMastDate(d.meta.updated);
  }

  function formatMastDate(yyyymmdd) {
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    try {
      const d = new Date(yyyymmdd);
      return `${days[d.getUTCDay()]} · ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    } catch (e) { return yyyymmdd; }
  }

  // ── Render: tabs (top section nav) ───────────────────────────
  const TAB_LABELS = {
    'era-1-automata':            { en: 'Myth',         zh: '神话' },
    'era-2-pre-industrial':      { en: 'Mechanism',    zh: '机械' },
    'era-3-cybernetics':         { en: 'Cybernetics',  zh: '控制论' },
    'era-4-industrial':          { en: 'Industrial',   zh: '工业' },
    'era-5-mobility-humanoids':  { en: 'Mobility',     zh: '人形' },
    'era-6-service-cobots':      { en: 'Service',      zh: '服务' },
    'era-7-deep-learning':       { en: 'Deep L.',      zh: '深度学习' },
    'era-8-embodied-ai':         { en: 'Embodied',     zh: '具身' },
    'era-h1-pioneers':           { en: 'Pioneers',     zh: '先驱' },
    'era-h2-honda-secret':       { en: 'P-Series',     zh: 'P 系列' },
    'era-h3-platforms':          { en: 'Platforms',    zh: '研究平台' },
    'era-h4-drc':                { en: 'DRC',          zh: 'DRC' },
    'era-h5-commercial':         { en: 'Commercial',   zh: '商用' },
    'era-h6-embodied':           { en: 'LLM × Body',   zh: 'LLM × 体' }
  };

  function tabLabel(era) {
    const t = TAB_LABELS[era.id];
    if (t) return t[state.lang] || t.en;
    return pick(era, 'title').split(/[\s&,·]+/).slice(0, 2).join(' ');
  }

  function renderTabs() {
    const d = state.data;
    $('#tabs').innerHTML = d.eras.map((e, i) => `
      <a class="tab" href="#${e.id}" data-target="${e.id}">
        <span class="roman">§ ${esc(roman(i + 1))}</span>
        <span class="label">${esc(tabLabel(e))}</span>
      </a>
    `).join('');
  }

  // ── Render: era index ────────────────────────────────────────
  function renderEraIndex() {
    const d = state.data;
    $('#era-index').innerHTML = d.eras.map((e, i) => `
      <a href="#${e.id}">
        <span class="roman">§ ${esc(roman(i + 1))}</span>
        <div>
          <span class="ttl">${esc(pick(e, 'title'))}</span>
          <span class="sub">${esc(pick(e, 'range'))}</span>
        </div>
      </a>
    `).join('');
  }

  // ── Render: eras + events ────────────────────────────────────
  function renderEras() {
    const d = state.data;
    $('#eras').innerHTML = d.eras.map((era, i) => `
      <section class="era" id="${era.id}">
        <header class="era-head">
          <div>
            <div class="era-marker">§ ${esc(roman(i + 1))} &middot; ${esc(pick(era, 'range'))}</div>
            <h2>${esc(pick(era, 'title'))}</h2>
            <div class="era-range">${esc(state.lang === 'en' ? era.title : era.titleEn || '')}</div>
          </div>
          <p class="era-lead">${esc(pick(era, 'lead'))}</p>
        </header>
        <ol class="events">
          ${era.events.map(ev => renderEvent(ev)).join('')}
        </ol>
      </section>
    `).join('');
  }

  function renderEvent(ev) {
    const sources = (ev.sources || []).map(s =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
    ).join('');
    const img = ev.image ? `
      <figure class="event-img">
        <a href="${commonsPage(ev.image.file)}" target="_blank" rel="noopener">
          <img src="${imageURL(ev.image.file, 800)}" alt="${esc(ev.image.alt || pick(ev, 'title'))}" loading="lazy" />
        </a>
        <figcaption>${esc(state.lang === 'en' ? 'IMAGE' : '图')} &middot; ${esc(ev.image.credit)} &middot; WIKIMEDIA</figcaption>
      </figure>` : '';
    return `
      <li class="event">
        <div class="event-year tnum">${esc(ev.year)}</div>
        <div class="event-body">
          <h3>${esc(pick(ev, 'title'))}</h3>
          <p class="event-desc">${esc(pick(ev, 'desc'))}</p>
          ${img}
          ${sources ? `<div class="event-sources"><span class="sources-label">${esc(state.lang === 'en' ? 'SOURCES' : '来源')}</span>${sources}</div>` : ''}
        </div>
      </li>
    `;
  }

  // ── Render: people grid ──────────────────────────────────────
  function renderPeople() {
    const d = state.data;
    if (!d.people) return;
    $('#people-grid').innerHTML = d.people.map(p => {
      const portrait = p.image ? `
        <div class="person-portrait">
          <a href="${commonsPage(p.image)}" target="_blank" rel="noopener">
            <img src="${imageURL(p.image, 320)}" alt="${esc(p.name)}" loading="lazy" />
          </a>
        </div>` : '';
      return `
        <article class="person${p.image ? ' has-portrait' : ''}">
          ${portrait}
          <div class="person-text">
            <h3 class="name">${esc(p.name)}</h3>
            <div class="years">${esc(p.years)}</div>
            <div class="role">${esc(pick(p, 'role'))}</div>
            <div class="quote">${esc(pick(p, 'quote'))}</div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ── Render: humanoid roster + compare ────────────────────────
  function renderRoster() {
    if (!state.data.roster) return;
    const r = state.data.roster;
    const headers = state.lang === 'en'
      ? ['Robot', 'Year', 'Origin', 'Height', 'Weight', 'DOF', 'Payload', 'Drive', 'Status']
      : ['机型', '年份', '国家', '身高', '体重', '自由度', '负载', '动力', '状态'];
    const head = `<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>`;
    const body = '<tbody>' + r.map(item => `
      <tr>
        <td class="name"><a href="${esc(item.source)}" target="_blank" rel="noopener">${esc(item.name)}</a><span class="company">${esc(item.company)}</span></td>
        <td class="num">${esc(item.year)}</td>
        <td>${esc(item.country)}</td>
        <td class="num">${esc(item.height)}</td>
        <td class="num">${esc(item.weight)}</td>
        <td class="num">${esc(item.dof)}</td>
        <td class="num">${esc(item.payload)}</td>
        <td>${esc(item.drive)}</td>
        <td>${esc(item.status)}</td>
      </tr>`).join('') + '</tbody>';
    $('#roster-table').innerHTML = head + body;
  }

  function renderCompare() {
    if (!state.data.compare) return;
    const c = state.data.compare;
    const head = `<thead><tr>${c.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>`;
    const body = '<tbody>' + c.rows.map(row => `
      <tr>
        <td>${esc(row.label)}</td>
        ${row.values.map(v => `<td>${esc(v)}</td>`).join('')}
      </tr>`).join('') + '</tbody>';
    $('#compare-table').innerHTML = head + body;
  }

  // ── Render: data section (charts) ────────────────────────────
  function renderDataSection() {
    if (!state.data.stats) return;
    const u = ui();
    if ($('#data-title') && u.chart_section) $('#data-title').textContent = u.chart_section;
    if ($('#data-marker') && u.chart_eyebrow) $('#data-marker').textContent = u.chart_eyebrow + ' · ' + (state.lang === 'en' ? 'INSTALLATIONS & FUNDING' : '安装量与融资');
    if ($('#data-lead') && u.chart_lead) $('#data-lead').textContent = u.chart_lead;
    renderIndustrialChart();
    renderFundingChart();
  }

  const getVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function renderIndustrialChart() {
    const c = state.data.stats.industrialInstalls;
    if (!c) return;
    const W = 880, H = 320;
    const m = { l: 56, r: 16, t: 18, b: 36 };
    const innerW = W - m.l - m.r, innerH = H - m.t - m.b;
    const years = c.data.map(d => d.year), vals = c.data.map(d => d.value);
    const xMin = Math.min(...years), xMax = Math.max(...years);
    const yMax = Math.ceil(Math.max(...vals) / 100) * 100;
    const x = y => m.l + (innerW * (y - xMin) / (xMax - xMin));
    const y = v => m.t + innerH - (innerH * v / yMax);
    const ink = getVar('--ink'), inkMute = getVar('--ink-mute'), rule = getVar('--rule-soft');

    const grid = [];
    for (let i = 0; i <= 5; i++) {
      const v = (yMax / 5) * i, yy = y(v);
      grid.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" stroke="${rule}" stroke-dasharray="1 4"/>`);
      grid.push(`<text x="${m.l - 8}" y="${yy + 4}" text-anchor="end" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${v}</text>`);
    }
    const xTicks = [];
    for (let yr = Math.ceil(xMin / 5) * 5; yr <= xMax; yr += 5) {
      const xx = x(yr);
      xTicks.push(`<line x1="${xx}" x2="${xx}" y1="${m.t + innerH}" y2="${m.t + innerH + 4}" stroke="${inkMute}"/>`);
      xTicks.push(`<text x="${xx}" y="${m.t + innerH + 18}" text-anchor="middle" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${yr}</text>`);
    }
    const path = c.data.map((d, i) =>
      (i === 0 ? 'M' : 'L') + x(d.year).toFixed(1) + ',' + y(d.value).toFixed(1)).join(' ');
    const labelYears = [1995, 2009, 2017, 2021, 2023];
    const points = c.data.map(d => {
      const isL = labelYears.includes(d.year);
      return `<circle cx="${x(d.year)}" cy="${y(d.value)}" r="${isL ? 4 : 2.4}" fill="${ink}"/>` +
        (isL ? `<text x="${x(d.year)}" y="${y(d.value) - 10}" text-anchor="middle" font-size="11" font-weight="600" font-family="JetBrains Mono, monospace" fill="${ink}">${d.value}</text>` : '');
    }).join('');
    const ann2009X = x(2009);
    const crisisLabel = pick(c, 'annotationCrisis');
    const annotation = `
      <line x1="${ann2009X}" x2="${ann2009X}" y1="${y(60) - 14}" y2="${y(60) + 80}" stroke="${inkMute}" stroke-dasharray="2 3"/>
      <text x="${ann2009X + 6}" y="${y(60) + 95}" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${esc(crisisLabel)}</text>`;

    const svg = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">
        ${grid.join('')}
        <path d="${path}" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>
        ${points}
        ${xTicks.join('')}
        ${annotation}
        <text x="${m.l}" y="${m.t - 4}" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}" letter-spacing="0.1em">${esc(pick(c, 'unitLabel'))}</text>
      </svg>`;

    $('#chart-industrial').innerHTML = `
      <div class="chart-head">
        <h3>${esc(pick(c, 'title'))}</h3>
        <div class="chart-sub">${esc(pick(c, 'subtitle'))}</div>
      </div>
      <figure>${svg}</figure>
      <div class="chart-source">${esc(state.lang === 'en' ? 'DATA' : '数据')} &middot; <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">${esc(c.source)}</a></div>`;
  }

  function renderFundingChart() {
    const c = state.data.stats.humanoidFunding;
    if (!c) return;
    const items = c.data.slice().sort((a, b) => a.value - b.value);
    const W = 880, H = 30 * items.length + 60;
    const m = { l: 220, r: 80, t: 24, b: 28 };
    const innerW = W - m.l - m.r;
    const max = Math.max(...items.map(d => d.value));
    const x = v => m.l + (innerW * v / max);
    const ink = getVar('--ink'), inkMute = getVar('--ink-mute'), rule = getVar('--rule-soft');

    const bars = items.map((d, i) => {
      const yy = m.t + i * 30;
      const bw = x(d.value) - m.l;
      return `
        <text x="${m.l - 12}" y="${yy + 14}" text-anchor="end" font-size="12" font-family="Inter, sans-serif" fill="${ink}">${esc(d.label)}</text>
        <text x="${m.l - 12}" y="${yy + 26}" text-anchor="end" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${d.year}</text>
        <rect x="${m.l}" y="${yy + 6}" width="${bw}" height="16" fill="${ink}" fill-opacity="${d.value >= 500 ? 1 : 0.55}"/>
        <text x="${m.l + bw + 6}" y="${yy + 18}" font-size="11" font-weight="600" font-family="JetBrains Mono, monospace" fill="${ink}">$${d.value}M</text>`;
    }).join('');
    const ticks = [0, 250, 500, 1000, 1500].filter(t => t <= max);
    const tickStr = ticks.map(t => `
      <line x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${H - m.b + 4}" stroke="${rule}" stroke-dasharray="1 4"/>
      <text x="${x(t)}" y="${H - m.b + 18}" text-anchor="middle" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">$${t}M</text>`).join('');

    $('#chart-funding').innerHTML = `
      <div class="chart-head">
        <h3>${esc(pick(c, 'title'))}</h3>
        <div class="chart-sub">${esc(pick(c, 'subtitle'))}</div>
      </div>
      <figure><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">${tickStr}${bars}</svg></figure>
      <div class="chart-source">${esc(state.lang === 'en' ? 'DATA' : '数据')} &middot; <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">${esc(c.source)}</a></div>`;
  }

  // ── Render: method + footer ──────────────────────────────────
  function renderMethod() {
    const u = ui();
    if ($('#method-title') && u.methods_section) $('#method-title').textContent = u.methods_section;
    if ($('#method-marker') && u.methods_eyebrow) $('#method-marker').textContent = u.methods_eyebrow;
    if ($('#method-sources-head') && u.methods_sources_head) $('#method-sources-head').textContent = u.methods_sources_head;
    if ($('#method-body')) {
      $('#method-body').innerHTML = [u.methods_para_1, u.methods_para_2, u.methods_para_3]
        .filter(Boolean).map(p => `<p>${p}</p>`).join('');
    }
    if ($('#method-sources')) {
      $('#method-sources').innerHTML = primaryReferences().map(r =>
        `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>${r.note ? ' — ' + esc(r.note) : ''}</li>`
      ).join('');
    }
  }

  function primaryReferences() {
    return [
      { label: 'IFR · World Robotics', url: 'https://ifr.org', note: 'industrial installations' },
      { label: 'IEEE Spectrum — Robotics', url: 'https://spectrum.ieee.org/topic/robotics/' },
      { label: 'IEEE Robotics & Automation Society', url: 'https://www.ieee-ras.org' },
      { label: 'Computer History Museum', url: 'https://www.computerhistory.org' },
      { label: 'Science Museum, London', url: 'https://www.sciencemuseum.org.uk' },
      { label: 'Smithsonian (NMAH)', url: 'https://americanhistory.si.edu' },
      { label: 'SRI International', url: 'https://www.sri.com' },
      { label: 'CMU Robotics Institute', url: 'https://www.ri.cmu.edu' },
      { label: 'Stanford AI Lab', url: 'https://ai.stanford.edu' },
      { label: 'DARPA', url: 'https://www.darpa.mil' },
      { label: 'Boston Dynamics', url: 'https://www.bostondynamics.com' },
      { label: 'Honda Worldwide', url: 'https://global.honda' },
      { label: 'NASA', url: 'https://www.nasa.gov' },
      { label: 'Wikimedia Commons', url: 'https://commons.wikimedia.org' }
    ];
  }

  function renderRosterUI() {
    if (!$('#roster-title')) return;
    const u = ui();
    $('#roster-title').textContent = u.roster_section || 'Living Humanoids — A Field Guide';
    $('#roster-marker').textContent = u.roster_eyebrow + ' · ' + (state.lang === 'en' ? 'CURRENT MODELS' : '当代型号');
    $('#roster-lead').textContent = u.roster_lead || '';
    $('#compare-title').textContent = u.compare_section || 'Six Commercial Humanoids at a Glance';
    $('#compare-marker').textContent = u.compare_eyebrow + ' · ' + (state.lang === 'en' ? 'SIX MODELS' : '六款机型');
    $('#compare-lead').textContent = u.compare_lead || '';
    $('#people-title').textContent = u.people_section || 'Builders of the Walking Robot';
    $('#people-marker').textContent = u.people_eyebrow;
  }

  function renderFooter() {
    const u = ui();
    if ($('#footer-left'))  $('#footer-left').innerHTML  = u.footer_left || '';
    if ($('#footer-right')) $('#footer-right').innerHTML = u.footer_right || '';
  }

  // ── Toggles ──────────────────────────────────────────────────
  function setupThemeToggle() {
    const btn = $('#theme-toggle');
    if (!btn) return;
    const update = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      btn.textContent = dark ? 'NIGHT' : 'DAY';
    };
    update();
    btn.addEventListener('click', () => {
      const swap = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        if (dark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('hor-theme', 'light'); }
        else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('hor-theme', 'dark'); }
        update();
        // re-render charts to pick up new colours
        if (state.data && state.data.stats) {
          renderIndustrialChart();
          renderFundingChart();
        }
      };
      if (document.startViewTransition) document.startViewTransition(swap);
      else swap();
    });
  }

  function setupLangToggle() {
    const btn = $('#lang-toggle');
    if (!btn) return;
    const update = () => { btn.textContent = state.lang === 'en' ? 'EN ▾' : '中文 ▾'; };
    update();
    btn.addEventListener('click', () => {
      const swap = () => {
        state.lang = state.lang === 'en' ? 'zh' : 'en';
        localStorage.setItem('hor-lang', state.lang);
        document.documentElement.setAttribute('lang', state.lang === 'zh' ? 'zh-CN' : 'en');
        document.documentElement.setAttribute('data-lang', state.lang);
        renderAll();
        update();
      };
      if (document.startViewTransition) document.startViewTransition(swap);
      else swap();
    });
  }

  // ── Command palette (⌘K) ─────────────────────────────────────
  function setupCommandPalette() {
    const dlg = $('#cmd-palette');
    const input = $('#cmd-input');
    const results = $('#cmd-results');
    const count = $('#cmd-count');
    if (!dlg || !input || !results) return;

    function buildIndex() {
      const items = [];
      state.data.eras.forEach((e, i) => {
        items.push({
          kind: 'era',
          key: `§ ${roman(i + 1)}`,
          title: pick(e, 'title'),
          sub: pick(e, 'range'),
          href: '#' + e.id
        });
        (e.events || []).forEach(ev => {
          items.push({
            kind: 'event',
            key: ev.year,
            title: pick(ev, 'title'),
            sub: pick(e, 'title'),
            href: '#' + e.id,
            search: (pick(ev, 'title') + ' ' + pick(ev, 'desc') + ' ' + ev.year).toLowerCase()
          });
        });
      });
      (state.data.people || []).forEach(p => {
        items.push({
          kind: 'person',
          key: state.lang === 'en' ? 'PERSON' : '人物',
          title: p.name,
          sub: pick(p, 'role'),
          href: '#people',
          search: (p.name + ' ' + pick(p, 'role')).toLowerCase()
        });
      });
      (state.data.roster || []).forEach(r => {
        items.push({
          kind: 'roster',
          key: r.year,
          title: r.name,
          sub: r.company,
          href: r.source,
          external: true,
          search: (r.name + ' ' + r.company).toLowerCase()
        });
      });
      return items;
    }

    function search(q) {
      const idx = state.cmd.index || (state.cmd.index = buildIndex());
      q = (q || '').trim().toLowerCase();
      if (!q) return idx.slice(0, 12);
      return idx.filter(it =>
        it.title.toLowerCase().includes(q) ||
        (it.sub || '').toLowerCase().includes(q) ||
        (it.search || '').includes(q) ||
        String(it.key).toLowerCase().includes(q)
      ).slice(0, 30);
    }

    function render() {
      const list = state.cmd.results;
      results.innerHTML = list.length
        ? list.map((it, i) => `
          <li role="option" aria-selected="${i === state.cmd.selected}" data-idx="${i}">
            <span class="key">${esc(String(it.key))}</span>
            <span class="ttl">${esc(it.title)}</span>
            <span class="sub">${esc(it.sub || '')}</span>
          </li>`).join('')
        : `<li class="cmd-empty">${esc(state.lang === 'en' ? 'No results.' : '无结果。')}</li>`;
      count.textContent = `${list.length} ${state.lang === 'en' ? 'RESULTS' : '条结果'}`;
    }

    function open() {
      state.cmd.index = buildIndex();
      state.cmd.results = search('');
      state.cmd.selected = 0;
      render();
      dlg.showModal();
      setTimeout(() => input.focus(), 0);
    }
    function close() { try { dlg.close(); } catch (e) {} }

    function select(idx) {
      state.cmd.selected = Math.max(0, Math.min(state.cmd.results.length - 1, idx));
      render();
      const sel = results.querySelector(`[data-idx="${state.cmd.selected}"]`);
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
    function activate(idx) {
      const it = state.cmd.results[idx];
      if (!it) return;
      close();
      if (it.external) { window.open(it.href, '_blank', 'noopener'); }
      else {
        const id = it.href.replace(/^#/, '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      }
    }

    $('#cmd-open').addEventListener('click', open);
    input.addEventListener('input', () => {
      state.cmd.results = search(input.value);
      state.cmd.selected = 0;
      render();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(state.cmd.selected + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(state.cmd.selected - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(state.cmd.selected); }
      else if (e.key === 'Escape') { close(); }
    });
    results.addEventListener('click', e => {
      const li = e.target.closest('li[data-idx]');
      if (li) activate(+li.dataset.idx);
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });

    window.addEventListener('keydown', e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); open();
      }
    });
  }

  // ── Scroll → TOC active state ────────────────────────────────
  function setupScroll() {
    if (!('IntersectionObserver' in window)) return;
    const tabs = $$('#tabs a');
    const byId = new Map(tabs.map(a => [a.dataset.target, a]));
    const eras = $$('.era');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = byId.get(en.target.id);
        if (!a) return;
        if (en.isIntersecting) {
          tabs.forEach(l => l.classList.remove('active'));
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    eras.forEach(e => io.observe(e));
  }

  // ── Smooth scroll for hash links ─────────────────────────────
  function setupHashLinks() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      }
    });
  }

  // ── Render all ───────────────────────────────────────────────
  function renderAll() {
    if (!state.data) return;
    renderStaticI18n();
    renderTabs();
    renderEraIndex();
    renderCover();
    renderEras();
    renderPeople();
    if (page === 'humanoid') {
      renderRoster();
      renderCompare();
      renderRosterUI();
    } else {
      renderDataSection();
    }
    renderMethod();
    renderFooter();
    setupScroll();
  }

  // ── Data loader ──────────────────────────────────────────────
  // Loading strategies, in order:
  //   1. Global injected by sibling <script src="./data/*.data.js"> (works on file://)
  //   2. Inline <script type="application/json" id="hor-data"> embed
  //   3. fetch(dataURL) — needs HTTP
  async function loadData() {
    const key = page === 'humanoid' ? 'humanoid' : 'timeline';
    if (window.__HOR_DATA__ && window.__HOR_DATA__[key]) {
      return window.__HOR_DATA__[key];
    }
    const inline = document.getElementById('hor-data');
    if (inline && inline.textContent.trim()) {
      try { return JSON.parse(inline.textContent); } catch (e) { /* fall through */ }
    }
    const res = await fetch(dataURL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + dataURL);
    return res.json();
  }

  // ── Boot ─────────────────────────────────────────────────────
  async function boot() {
    try {
      state.data = await loadData();

      renderAll();
      setupThemeToggle();
      setupLangToggle();
      setupCommandPalette();
      setupHashLinks();

      // Expose minimal hooks for tests (no-op in production usage)
      window.__HOR__ = {
        state,
        rerender: renderAll,
        version: '1.0.0'
      };
    } catch (err) {
      console.error(err);
      const isFile = err && /fetch|file/i.test(err.message || '');
      const msg = state.lang === 'en'
        ? `Load failed: ${err.message}. ${isFile ? 'Use a static HTTP server (e.g. python3 -m http.server) instead of opening the file directly.' : ''}`
        : `加载失败：${err.message}。${isFile ? '请使用静态 HTTP 服务器访问（如 python3 -m http.server），不要直接双击 HTML。' : ''}`;
      const eras = $('#eras');
      if (eras) eras.innerHTML = `<p style="color:var(--negative); padding:24px; border:1px solid var(--rule-soft);">${esc(msg)}</p>`;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();


})();
