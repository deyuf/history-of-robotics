/* =============================================================
   History of Robot — application script
   Vanilla JS. Loads /data/timeline.json and renders the entire
   page bilingually (zh / en) with theme and language toggles.
   ============================================================= */

(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const state = {
    lang: document.documentElement.getAttribute('data-lang') || 'zh',
    data: null,
  };

  // ── Helpers ──────────────────────────────────────────────────
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const t = (zh, en) => (state.lang === 'en' ? (en || zh) : (zh || en));
  const pick = (obj, key) =>
    state.lang === 'en' ? (obj[key + 'En'] || obj[key]) : obj[key];

  const imageURL = (file, width) =>
    'https://commons.wikimedia.org/wiki/Special:FilePath/' +
    encodeURIComponent(file) + '?width=' + (width || 800);

  const commonsPage = file =>
    'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file);

  // ── Render UI strings ───────────────────────────────────────
  function renderStaticUI(data) {
    const ui = data.ui[state.lang];

    // i18n data-attribute swaps
    $$('[data-i18n-zh]').forEach(el => {
      el.textContent = state.lang === 'en'
        ? (el.dataset.i18nEn || el.dataset.i18nZh)
        : el.dataset.i18nZh;
    });

    // Hero
    $('#hero-kicker').textContent = ui.hero_kicker;
    $('#hero-title').innerHTML = ui.hero_title;
    $('#lead').textContent = pick(data.meta, 'lead');

    const eventCount = data.eras.reduce((a, e) => a + e.events.length, 0);
    const sourceCount = data.eras.reduce((a, e) =>
      a + e.events.reduce((b, ev) => b + (ev.sources || []).length, 0), 0);
    $('#hero-meta').innerHTML = `
      <span>${escapeHTML(ui.events)} · <b>${eventCount}</b></span>
      <span>${escapeHTML(ui.sources)} · <b>${sourceCount}</b></span>
      <span>${escapeHTML(ui.span)} · <b>${escapeHTML(ui.spanValue)}</b></span>
      <span>${escapeHTML(ui.updated)} · <b>${escapeHTML(data.meta.updated)}</b></span>
    `;
    $('#issue-date').textContent = data.meta.updated;

    // Rail
    $('#rail-head').textContent = ui.contents;
    $('#rail-foot').innerHTML = `
      <div>${escapeHTML(ui.edition)}</div>
      <div>${escapeHTML(ui.updated)} · ${escapeHTML(data.meta.updated)}</div>
      <div>${escapeHTML(ui.license)} · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></div>
      <div style="margin-top:10px;">${escapeHTML(ui.rail_foot)}</div>
    `;

    // Charts section
    $('#chart-eyebrow').textContent = ui.chart_eyebrow;
    $('#chart-section-title').textContent = ui.chart_section;
    $('#chart-lead').textContent = ui.chart_lead;

    // People section
    $('#people-eyebrow').textContent = ui.people_eyebrow;
    $('#people-section-title').textContent = ui.people_section;

    // Methods
    $('#methods-eyebrow').textContent = ui.methods_eyebrow;
    $('#methods-section-title').textContent = ui.methods_section;
    $('#methods-p1').innerHTML = ui.methods_para_1;
    $('#methods-p2').innerHTML = ui.methods_para_2;
    $('#methods-p3').innerHTML = ui.methods_para_3;
    $('#methods-sources-head').textContent = ui.methods_sources_head;

    // Footer
    $('#footer-left').innerHTML = ui.footer_left;
    $('#footer-right').innerHTML = ui.footer_right;

    // Language toggle button label
    $('#lang-toggle').textContent = ui.lang_toggle;
  }

  // ── Render TOC ──────────────────────────────────────────────
  function renderTOC(data) {
    $('#toc').innerHTML = data.eras.map(e => `
      <li><a href="#${e.id}" data-target="${e.id}">${escapeHTML(pick(e, 'title'))}</a></li>
    `).join('');
  }

  // ── Render eras + events ────────────────────────────────────
  function renderEras(data) {
    const ui = data.ui[state.lang];
    $('#eras').innerHTML = data.eras.map(era => `
      <section class="era" id="${era.id}">
        <header class="era-head">
          <div class="era-num">${escapeHTML(era.number)}</div>
          <div class="era-title-block">
            <div class="era-eyebrow">${escapeHTML(ui.era_eyebrow)} ${escapeHTML(era.number)} · ${escapeHTML(pick(era, 'range'))}</div>
            <h2>${escapeHTML(pick(era, 'title'))}<span class="en">${escapeHTML(state.lang === 'en' ? era.title : era.titleEn)} · ${escapeHTML(state.lang === 'en' ? era.range : era.rangeEn)}</span></h2>
          </div>
        </header>
        <p class="era-lead">${escapeHTML(pick(era, 'lead'))}</p>
        <ol class="events">
          ${era.events.map(ev => renderEvent(ev, ui)).join('')}
        </ol>
      </section>
    `).join('');
  }

  function renderEvent(ev, ui) {
    const sources = (ev.sources || []).map(s =>
      `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${escapeHTML(s.label)}</a>`
    ).join('');
    const img = ev.image ? `
      <figure class="event-img">
        <a href="${commonsPage(ev.image.file)}" target="_blank" rel="noopener">
          <img src="${imageURL(ev.image.file, 800)}" alt="${escapeHTML(ev.image.alt || pick(ev, 'title'))}" loading="lazy" />
        </a>
        <figcaption>${state.lang === 'en' ? 'Image' : '图'} · ${escapeHTML(ev.image.credit)} · Wikimedia Commons</figcaption>
      </figure>
    ` : '';
    return `
      <li class="event">
        <div class="event-year tnum">${escapeHTML(ev.year)}</div>
        <div class="event-body">
          <h3>${escapeHTML(pick(ev, 'title'))}</h3>
          <p class="event-desc">${escapeHTML(pick(ev, 'desc'))}</p>
          ${img}
          ${sources ? `<div class="event-sources">${sources}</div>` : ''}
        </div>
      </li>
    `;
  }

  // ── Render people ───────────────────────────────────────────
  function renderPeople(data) {
    $('#people-grid').innerHTML = (data.people || []).map(p => `
      <article class="person-card">
        <h3 class="name">${escapeHTML(p.name)}</h3>
        <div class="years tnum">${escapeHTML(p.years)}</div>
        <div class="role">${escapeHTML(pick(p, 'role'))}</div>
        <div class="quote">${escapeHTML(pick(p, 'quote'))}</div>
      </article>
    `).join('');
  }

  // ── Charts ──────────────────────────────────────────────────
  const getVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function renderIndustrialChart(stats) {
    const c = stats.industrialInstalls;
    if (!c) return;
    const W = 880, H = 340;
    const m = { l: 50, r: 16, t: 18, b: 36 };
    const innerW = W - m.l - m.r, innerH = H - m.t - m.b;
    const years = c.data.map(d => d.year);
    const vals = c.data.map(d => d.value);
    const xMin = Math.min(...years), xMax = Math.max(...years);
    const yMax = Math.ceil(Math.max(...vals) / 100) * 100;
    const x = y => m.l + (innerW * (y - xMin) / (xMax - xMin));
    const y = v => m.t + innerH - (innerH * v / yMax);
    const ink = getVar('--ink') || '#1A1814';
    const inkMute = getVar('--ink-mute') || '#5A5246';
    const gold = getVar('--gold') || '#B08B3E';
    const rule = getVar('--rule') || 'rgba(0,0,0,0.15)';

    const grid = [];
    for (let i = 0; i <= 5; i++) {
      const v = (yMax / 5) * i, yy = y(v);
      grid.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" stroke="${rule}" stroke-dasharray="2 4"/>`);
      grid.push(`<text x="${m.l - 6}" y="${yy + 4}" text-anchor="end" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${v}</text>`);
    }
    const xTicks = [];
    for (let yr = Math.ceil(xMin / 5) * 5; yr <= xMax; yr += 5) {
      const xx = x(yr);
      xTicks.push(`<line x1="${xx}" x2="${xx}" y1="${m.t + innerH}" y2="${m.t + innerH + 4}" stroke="${inkMute}"/>`);
      xTicks.push(`<text x="${xx}" y="${m.t + innerH + 18}" text-anchor="middle" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${yr}</text>`);
    }
    const path = c.data.map((d, i) =>
      (i === 0 ? 'M' : 'L') + x(d.year).toFixed(1) + ',' + y(d.value).toFixed(1)
    ).join(' ');
    const area = path + ' L' + x(xMax).toFixed(1) + ',' + y(0).toFixed(1) +
                 ' L' + x(xMin).toFixed(1) + ',' + y(0).toFixed(1) + ' Z';
    const labelYears = [1995, 2009, 2017, 2021, 2023];
    const points = c.data.map(d => {
      const isLabel = labelYears.includes(d.year);
      return `<circle cx="${x(d.year)}" cy="${y(d.value)}" r="${isLabel ? 4 : 2.5}" fill="${gold}" stroke="${ink}" stroke-width="1"/>` +
        (isLabel ? `<text x="${x(d.year)}" y="${y(d.value) - 10}" text-anchor="middle" font-size="11" font-weight="600" font-family="JetBrains Mono, monospace" fill="${ink}">${d.value}</text>` : '');
    }).join('');
    const ann2009X = x(2009), ann2009Y = y(60);
    const crisisLabel = pick(c, 'annotationCrisis');
    const annotation = `
      <line x1="${ann2009X}" x2="${ann2009X}" y1="${ann2009Y - 14}" y2="${ann2009Y + 80}" stroke="${inkMute}" stroke-dasharray="2 3"/>
      <text x="${ann2009X + 6}" y="${ann2009Y + 95}" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${escapeHTML(crisisLabel)}</text>
    `;

    const svg = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHTML(pick(c, 'title'))}">
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${gold}" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="${gold}" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${grid.join('')}
        <path d="${area}" fill="url(#areaGrad)"/>
        <path d="${path}" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>
        ${points}
        ${xTicks.join('')}
        ${annotation}
        <text x="${m.l}" y="${m.t - 4}" font-size="11" font-family="JetBrains Mono, monospace" fill="${inkMute}">${escapeHTML(pick(c, 'unitLabel'))}</text>
      </svg>
    `;

    $('#chart-industrial').innerHTML = `
      <div class="chart-head">
        <h3>${escapeHTML(pick(c, 'title'))}</h3>
        <div class="chart-sub">${escapeHTML(pick(c, 'subtitle'))}</div>
      </div>
      <figure>${svg}</figure>
      <div class="chart-source">${state.lang === 'en' ? 'Data' : '数据'} · <a href="${escapeHTML(c.sourceUrl)}" target="_blank" rel="noopener">${escapeHTML(c.source)}</a></div>
    `;
  }

  function renderFundingChart(stats) {
    const c = stats.humanoidFunding;
    if (!c) return;
    const items = c.data.slice().sort((a, b) => a.value - b.value);
    const W = 880, H = 28 * items.length + 60;
    const m = { l: 220, r: 60, t: 24, b: 28 };
    const innerW = W - m.l - m.r;
    const max = Math.max(...items.map(d => d.value));
    const x = v => m.l + (innerW * v / max);
    const ink = getVar('--ink') || '#1A1814';
    const inkMute = getVar('--ink-mute') || '#5A5246';
    const inkSoft = getVar('--ink-soft') || '#2E2A24';
    const gold = getVar('--gold') || '#B08B3E';
    const navy = getVar('--navy') || '#1F2A44';
    const rule = getVar('--rule') || 'rgba(0,0,0,0.15)';
    const bars = items.map((d, i) => {
      const yy = m.t + i * 28;
      const bw = x(d.value) - m.l;
      const fill = d.value >= 500 ? gold : navy;
      return `
        <text x="${m.l - 10}" y="${yy + 14}" text-anchor="end" font-size="12" font-family="Inter, sans-serif" fill="${inkSoft}">${escapeHTML(d.label)}</text>
        <text x="${m.l - 10}" y="${yy + 26}" text-anchor="end" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">${d.year}</text>
        <rect x="${m.l}" y="${yy + 6}" width="${bw}" height="16" fill="${fill}" fill-opacity="0.82"/>
        <text x="${m.l + bw + 6}" y="${yy + 18}" font-size="11" font-weight="600" font-family="JetBrains Mono, monospace" fill="${ink}">$${d.value}M</text>
      `;
    }).join('');
    const ticks = [0, 250, 500, 1000, 1500];
    const tickStr = ticks.filter(tt => tt <= max).map(tt => `
      <line x1="${x(tt)}" x2="${x(tt)}" y1="${m.t}" y2="${H - m.b + 4}" stroke="${rule}" stroke-dasharray="2 3"/>
      <text x="${x(tt)}" y="${H - m.b + 18}" text-anchor="middle" font-size="10" font-family="JetBrains Mono, monospace" fill="${inkMute}">$${tt}M</text>
    `).join('');
    const svg = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHTML(pick(c, 'title'))}">
        ${tickStr}${bars}
      </svg>
    `;
    $('#chart-funding').innerHTML = `
      <div class="chart-head">
        <h3>${escapeHTML(pick(c, 'title'))}</h3>
        <div class="chart-sub">${escapeHTML(pick(c, 'subtitle'))}</div>
      </div>
      <figure>${svg}</figure>
      <div class="chart-source">${state.lang === 'en' ? 'Data' : '数据'} · <a href="${escapeHTML(c.sourceUrl)}" target="_blank" rel="noopener">${escapeHTML(c.source)}</a></div>
    `;
  }

  // ── Toggles ─────────────────────────────────────────────────
  function setupThemeToggle() {
    const btn = $('#theme-toggle');
    function update() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.textContent = isDark ? '☀ LIGHT' : '☾ DARK';
    }
    update();
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('hor-theme', 'light'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('hor-theme', 'dark'); } catch (e) {}
      }
      update();
      if (state.data) {
        renderIndustrialChart(state.data.stats);
        renderFundingChart(state.data.stats);
      }
    });
  }

  function setupLangToggle() {
    const btn = $('#lang-toggle');
    btn.addEventListener('click', () => {
      state.lang = state.lang === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('hor-lang', state.lang); } catch (e) {}
      document.documentElement.setAttribute('lang', state.lang === 'zh' ? 'zh-CN' : 'en');
      document.documentElement.setAttribute('data-lang', state.lang);
      renderAll();
    });
  }

  // ── Scroll progress + TOC active ────────────────────────────
  function setupScroll() {
    const progress = $('#progress');
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
      const tocLinks = $$('#toc a');
      const byId = new Map(tocLinks.map(a => [a.dataset.target, a]));
      const eras = $$('.era');
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          const a = byId.get(en.target.id);
          if (!a) return;
          if (en.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('active'));
            a.classList.add('active');
          }
        });
      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
      eras.forEach(e => io.observe(e));
    }
  }

  // ── Render all ──────────────────────────────────────────────
  function renderAll() {
    if (!state.data) return;
    renderStaticUI(state.data);
    renderTOC(state.data);
    renderEras(state.data);
    renderPeople(state.data);
    renderIndustrialChart(state.data.stats);
    renderFundingChart(state.data.stats);
    setupScroll();
  }

  // ── Boot ────────────────────────────────────────────────────
  async function boot() {
    try {
      const res = await fetch('./data/timeline.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('failed to load timeline.json: ' + res.status);
      state.data = await res.json();

      renderAll();
      setupThemeToggle();
      setupLangToggle();

      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + id);
        }
      });
    } catch (err) {
      console.error(err);
      const msg = state.lang === 'en'
        ? `Load failed: ${err.message}. Please serve via HTTP (file:// won't work).`
        : `加载失败：${err.message}。请通过 HTTP 服务器访问（不能直接打开 file://）。`;
      $('#eras').innerHTML = `<p style="color:var(--crimson);padding:24px;border:1px solid var(--rule);">${escapeHTML(msg)}</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
