/* AUTO-GENERATED from src/app.js. Run `npm run build` to refresh. */
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
  const eventAnchor = (era, event) => `${era.id}-${String(event.titleEn || event.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || era.events.indexOf(event)}`;

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

    // Left lede: the meta.lead in full. Right column: an independent
    // editorial standfirst plus a cross-publication link. Splitting the
    // lead into halves used to leave the right column near-empty.
    $('#hero-lede').textContent = pick(d.meta, 'lead') || '';

    const standfirst = page === 'humanoid'
      ? (state.lang === 'en'
          ? [
              "Of all the kinds of machine a chronicle could track, the humanoid is the most stubborn — and, since 2023, the most funded. WABOT-1 took its first awkward step in 1973; in fifty-three years it has become a venture-scale race between Atlas, Optimus, Figure, NEO, Apollo and Unitree.",
              "This edition narrows the lens to the two-legged, two-armed machine: how the engineering crystallised across the Honda P-series, the DARPA Robotics Challenge and the LLM-and-actuator boom of the mid-2020s. Every milestone here is anchored to a primary source."
            ]
          : [
              "在编年史能追踪的所有机器中，人形是最固执的一种——也是 2023 年之后融资最密集的一种。WABOT-1 在 1973 年迈出第一步；五十三年之后，它已经变成 Atlas、Optimus、Figure、NEO、Apollo 与宇树之间的资本竞赛。",
              "本卷把镜头收窄到双足双臂的机器：工程是怎样在 Honda P 系列、DARPA Robotics Challenge 与 2020 年代中期 LLM × 驱动器浪潮里逐步成形的。每一个里程碑都附原始来源。"
            ])
      : (state.lang === 'en'
          ? [
              "Across ninety generations of engineers and three thousand years of mechanical imagination, the robot has been reinvented as oracle, marvel, factory hand, companion and now — finally — as a body for a foundation model.",
              "This chronicle compresses that arc into eight eras and eighty-one milestones. Every entry is sourced; every chart is dated. The companion volume narrows in on humanoids."
            ]
          : [
              "九十代工程师、三千年机械想象之间，机器人被一次次重新发明：先是神谕，再是奇技，再是工厂里的手臂、家庭中的伴侣，如今——终于——成为基础模型的肉身。",
              "这份编年史把这条弧线压成八个时代、八十一个里程碑。每一条都有来源，每一张图都有日期。姊妹卷则把镜头收窄到人形机器人。"
            ]);

    const crossLink = page === 'humanoid'
      ? { href: './index.html', label: state.lang === 'en' ? '← Back to the main chronicle' : '← 回到主编年史' }
      : { href: './humanoid.html', label: state.lang === 'en' ? 'Read the humanoid edition →' : '阅读人形机器人特刊 →' };

    $('#hero-body').innerHTML =
      standfirst.map(p => `<p>${esc(p)}</p>`).join('') +
      `<p style="margin-top:18px"><a href="${crossLink.href}">${esc(crossLink.label)}</a></p>`;

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

  // ── Render: right-side rail TOC ──────────────────────────────
  function renderRailRight() {
    const rail = $('#rail-right');
    if (!rail) return;
    const d = state.data;
    const eraItems = d.eras.map((e, i) => ({
      target: e.id, roman: roman(i + 1), title: tabLabel(e)
    }));
    const sectionItems = (page === 'humanoid'
      ? [
          { target: 'roster',  title: state.lang === 'en' ? 'Roster'     : '机型档案' },
          { target: 'compare', title: state.lang === 'en' ? 'Compare'    : '对照表' },
          { target: 'people',  title: state.lang === 'en' ? 'People'     : '人物' },
          { target: 'method',  title: state.lang === 'en' ? 'Method'     : '方法' }
        ]
      : [
          { target: 'data',    title: state.lang === 'en' ? 'Data'       : '数据' },
          { target: 'people',  title: state.lang === 'en' ? 'People'     : '人物' },
          { target: 'method',  title: state.lang === 'en' ? 'Method'     : '方法' }
        ]);
    const startRoman = eraItems.length;
    const sectionHTML = sectionItems.map((s, i) => `
      <li><a href="#${s.target}" data-target="${s.target}">
        <span class="roman">§ ${esc(roman(startRoman + i + 1))}</span>
        <span class="ttl">${esc(s.title)}</span>
      </a></li>`).join('');
    const eraHTML = eraItems.map(e => `
      <li><a href="#${e.target}" data-target="${e.target}">
        <span class="roman">§ ${esc(e.roman)}</span>
        <span class="ttl">${esc(e.title)}</span>
      </a></li>`).join('');

    const sister = page === 'humanoid'
      ? { href: './index.html', title: state.lang === 'en' ? 'Main chronicle' : '主编年史' }
      : { href: './humanoid.html', title: state.lang === 'en' ? 'Humanoid edition' : '人形机器人特刊' };

    rail.innerHTML = `
      <ol>${eraHTML}${sectionHTML}</ol>
      <div class="sister-block">
        <a href="${sister.href}"><span>${esc(sister.title)}</span></a>
      </div>
    `;
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
          </div>
          <p class="era-lead">${esc(pick(era, 'lead'))}</p>
        </header>
        <ol class="events">
          ${era.events.map(ev => renderEvent(ev, eventAnchor(era, ev))).join('')}
        </ol>
      </section>
    `).join('');
  }

  function renderEvent(ev, id) {
    const sources = (ev.sources || []).map(s =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
    ).join('');
    const isLogo = ev.image && /\.svg$/i.test(ev.image.file);
    const img = ev.image ? `
      <figure class="event-img${isLogo ? ' is-logo' : ''}">
        <a href="${commonsPage(ev.image.file)}" target="_blank" rel="noopener">
          <img src="${imageURL(ev.image.file, 800)}" alt="${esc(ev.image.alt || pick(ev, 'title'))}" loading="lazy" />
        </a>
        <figcaption>${esc(ev.image.credit)} <span class="source">Wikimedia</span></figcaption>
      </figure>` : '';
    return `
      <li class="event"${id ? ` id="${esc(id)}"` : ''}>
        <div class="event-year tnum">${esc(pick(ev, 'year'))}</div>
        <div class="event-body">
          <h3>${esc(pick(ev, 'title'))}</h3>
          <p class="event-desc">${esc(pick(ev, 'desc'))}</p>
          ${img}
          ${sources ? `<div class="event-sources"><span class="sources-label">${esc(state.lang === 'en' ? 'SOURCES' : '来源')}</span>${sources}</div>` : ''}
        </div>
      </li>
    `;
  }

  // ── Render: people grid (text only — portraits intentionally omitted) ─
  function renderPeople() {
    const d = state.data;
    if (!d.people) return;
    $('#people-grid').innerHTML = d.people.map(p => `
      <article class="person">
        <h3 class="name">${esc(p.name)}</h3>
        <div class="years">${esc(p.years)}</div>
        <div class="role">${esc(pick(p, 'role'))}</div>
        <div class="quote">${esc(pick(p, 'quote'))}</div>
      </article>
    `).join('');
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
        const url = new URL(location.href);
        url.searchParams.set('lang', state.lang);
        history.replaceState(null, '', url);
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
      const bilingual = obj => Object.entries(obj).filter(([key, value]) =>
        typeof value === 'string' && /^(title|desc|role|range|name|company|year)(En)?$/.test(key)
      ).map(([, value]) => value).join(' ').toLowerCase();
      const datasets = {
        main: window.__HOR_DATA__?.timeline,
        humanoid: window.__HOR_DATA__?.humanoid
      };
      datasets[page] = state.data;
      Object.entries(datasets).forEach(([edition, data]) => {
        if (!data) return;
        const hrefFor = id => edition === page ? '#' + id :
          `./${edition === 'main' ? 'index' : 'humanoid'}.html?lang=${state.lang}#${id}`;
        const editionLabel = edition === 'main'
          ? (state.lang === 'en' ? 'Main chronicle' : '主编年史')
          : (state.lang === 'en' ? 'Humanoid edition' : '人形机器人特刊');
        data.eras.forEach((e, i) => {
          items.push({
            kind: 'era',
            key: `§ ${roman(i + 1)}`,
            title: pick(e, 'title'),
            sub: editionLabel + ' · ' + pick(e, 'range'),
            href: hrefFor(e.id),
            search: bilingual(e)
          });
          (e.events || []).forEach(ev => {
            items.push({
              kind: 'event',
              key: ev.year,
              title: pick(ev, 'title'),
              sub: editionLabel + ' · ' + pick(e, 'title'),
              href: hrefFor(eventAnchor(e, ev)),
              search: bilingual(ev)
            });
          });
        });
        (data.people || []).forEach(p => {
          items.push({
            kind: 'person',
            key: state.lang === 'en' ? 'PERSON' : '人物',
            title: p.name,
            sub: editionLabel + ' · ' + pick(p, 'role'),
            href: hrefFor('people'),
            search: bilingual(p)
          });
        });
        (data.roster || []).forEach(r => {
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
      state.cmd.results = search(input.value);
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
      const url = new URL(location.href);
      url.searchParams.delete('q');
      history.replaceState(null, '', url);
      if (it.external) { window.open(it.href, '_blank', 'noopener'); }
      else if (it.href.startsWith('#')) {
        const id = it.href.replace(/^#/, '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      } else { location.assign(it.href); }
    }

    $('#cmd-open').addEventListener('click', open);
    input.addEventListener('input', () => {
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set('q', input.value.trim());
      else url.searchParams.delete('q');
      history.replaceState(null, '', url);
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
    const query = new URLSearchParams(location.search).get('q');
    if (query) { input.value = query; open(); }
  }

  // ── Scroll → top tabs + right-rail active state ──────────────
  function setupScroll() {
    if (!('IntersectionObserver' in window)) return;
    const tabs = $$('#tabs a');
    const railLinks = $$('#rail-right a[data-target]');
    const tabsById = new Map(tabs.map(a => [a.dataset.target, a]));
    const railById = new Map(railLinks.map(a => [a.dataset.target, a]));
    const targets  = $$('[id]').filter(el =>
      el.matches('.era, .section, #data, #people, #method, #roster, #compare')
    );
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        tabs.forEach(l => l.classList.toggle('active', l.dataset.target === id));
        railLinks.forEach(l => l.classList.toggle('active', l.dataset.target === id));
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    targets.forEach(t => io.observe(t));
  }

  // ── Smooth scroll for hash links ─────────────────────────────
  function setupHashLinks() {
    document.addEventListener('click', e => {
      // Ignore middle/right click and modifier-clicks so the user can still
      // open the link in a new tab.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      // Set the hash FIRST (synchronous) so anything observing
      // `location.hash` sees the update even if scrollIntoView throws
      // or is silently dropped (some headless / reduced-motion runtimes).
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
      // Honour the CSS `scroll-behavior` (smooth in normal mode, auto
      // under prefers-reduced-motion) by not overriding it from JS.
      try { el.scrollIntoView({ block: 'start' }); } catch (_) {}
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
    renderRailRight();
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
      // Event anchors are rendered dynamically; restore deep links after boot.
      if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
      }

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
