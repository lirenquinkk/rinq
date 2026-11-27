// The Studio page. Until a channel of your own is connected it shows an example, "your channel", with
// made-up numbers that add up: 180 days of daily views to 27 November 2026, so every period has one
// before it to compare with. Everything is drawn with textContent and DOM calls, never with HTML from
// strings. The account part signs in to the same rinq account the app and the bot use (Supabase, with
// the project's publishable key, which is public by design: row-level security decides what anyone gets).
{
  const SUPABASE_URL = 'https://psesapmlbjukmdnxkcrv.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_GDLkcWalNULyMfZBSd3g2w_-enOb8XP';
  const SESSION_KEY = 'rinq.session';
  const SVG = 'http://www.w3.org/2000/svg';

  const stringsEl = document.getElementById('st-strings');
  if (stringsEl) {
    const t = JSON.parse(stringsEl.textContent);
    const locale = t.stLocale;
    const dec = t.stDecimal;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
    const nf = (n, digits = 0) => n.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });
    const compact = (n) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const $ = (id) => document.getElementById(id);
    const el = (tag, props = {}, ...kids) => {
      const node = Object.assign(document.createElement(tag), props);
      node.append(...kids);
      return node;
    };
    const svgEl = (tag, attrs = {}) => {
      const node = document.createElementNS(SVG, tag);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      return node;
    };
    const roll = (node, text) => (window.rinqRoll ? window.rinqRoll.set(node, text, { decimal: dec }) : (node.textContent = text));

    // ---- The example's numbers ----
    const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    function daily(seed, spikes, total28) {
      const r = rng(seed);
      const raw = Array.from({ length: 180 }, (_, i) => {
        const ago = 179 - i;
        const d = new Date(2026, 10, 27 - ago);
        const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.12 : 1;
        let v = (0.8 + 0.2 * (i / 179) ** 1.4) * weekend * (0.88 + 0.24 * r());
        for (const [at, h, w] of spikes) if (ago <= at) v += h * Math.exp(-(at - ago) / w);
        return v;
      });
      const last28 = sum(raw.slice(-28));
      return raw.map((v) => (v * total28) / last28);
    }
    const derive = (base, seed, rate, spread) => { const r = rng(seed); return base.map((v) => v * rate * (1 - spread / 2 + spread * r())); };
    const ytViews = daily(11, [[20, 1.5, 3], [13, 0.7, 2.2], [8, 0.6, 2], [3, 1.1, 2.4], [45, 0.8, 3], [70, 0.6, 3]], 248310);
    const ttViews = daily(29, [[34, 3.6, 2.8], [20, 1.2, 2.2], [8, 0.7, 1.6], [2, 0.9, 1.5], [60, 1.2, 2.5]], 1204500);
    const CH = {
      yt: { label: t.stChYt, color: '#e4583f', name: t.stName, handle: '@vash_kanal', subs: 12840, tabs: ['views', 'watch', 'subs'],
        series: { views: ytViews, watch: derive(ytViews, 5, 2.3 / 60, 0.3), subs: derive(ytViews, 7, 0.0052, 0.6) },
        rows: [[t.stY1, [10, 7, '12:00'], 48210, 2310], [t.stY2, [10, 14, '18:00'], 31870, 1420], [t.stY3, [10, 19, '18:00'], 27440, 1700],
          [t.stY4, [10, 1, '18:00'], 19960, 690], [t.stY5, [10, 24, '18:00'], 15320, 470], [t.stY6, [10, 11, '18:00'], 12105, 455],
          [t.stY7, [10, 4, '12:00'], 8740, 410], [t.stY8, [10, 26, '19:00'], 6215, 520]],
        plan: [[[10, 28, '12:00'], t.stPy1], [[10, 29, '18:00'], t.stPy2], [[11, 1, '18:00'], t.stPy3]],
        gradient: '#f08a6f, #c8402a' },
      tt: { label: t.stChTt, color: '#111113', name: t.stName, handle: '@vash_kanal', subs: 86300, tabs: ['views', 'likes', 'subs'],
        series: { views: ttViews, likes: derive(ttViews, 13, 0.078, 0.3), subs: derive(ttViews, 17, 0.0057, 0.7) },
        rows: [[t.stT1, [10, 7, '13:00'], 312400, 28100], [t.stT2, [10, 14, '19:00'], 188900, 12300], [t.stT3, [10, 20, '19:00'], 154200, 15800],
          [t.stT4, [10, 24, '19:00'], 97600, 5100], [t.stT5, [10, 2, '19:00'], 64300, 3900], [t.stT6, [10, 12, '19:00'], 41800, 2700],
          [t.stT7, [10, 5, '13:00'], 22500, 1900], [t.stT8, [10, 26, '20:00'], 9800, 1200]],
        plan: [[[10, 28, '13:00'], t.stPt1], [[10, 28, '20:00'], t.stPt2]],
        gradient: '#3a3a40, #111113' },
      zk: { label: t.stCh2, color: '#3f6fd1', name: t.stName2, handle: '@vtoroy_kanal', subs: 214, tabs: ['views', 'watch', 'subs'], empty: true, rows: [],
        plan: [[[10, 29, '15:00'], t.stPz1]], gradient: '#6f95e8, #2f56b3' },
    };
    // Breakdowns in the example, for the 1st and 3rd YouTube videos.
    const AI = {
      0: { verdict: t.stA0Verdict, reasons: [t.stA0R1, t.stA0R2, t.stA0R3], repeat: t.stA0Repeat, ideas: [t.stA0I1, t.stA0I2] },
      2: { verdict: t.stA2Verdict, reasons: [t.stA2R1, t.stA2R2, t.stA2R3], repeat: t.stA2Repeat, ideas: [t.stA2I1, t.stA2I2] },
    };
    const LABELS = { views: t.stViews, watch: t.stWatch, likes: t.stLikes, subs: t.stSubs };

    const state = { channel: 'yt', range: 28, tab: 'views', video: 0, showAi: false, added: new Set(), live: 0, liveSubs: 0 };
    const fmtOf = (tab) => (tab === 'watch' ? (v) => nf(v, 1) : (v) => nf(Math.round(v)));
    const dateOf = (n, i) => new Date(2026, 10, 27 - (n - 1 - i)).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const whenOf = ([m, d, time]) => `${new Date(2026, m, d).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
    const hue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    function thumb(title, size) {
      const box = el('span', { className: 'thumb' });
      box.style.cssText = `width:${(size * 16) / 9}px;height:${size}px;background:linear-gradient(135deg,hsl(${hue(title)},42%,42%),hsl(${(hue(title) + 40) % 360},52%,28%))`;
      const icon = svgEl('svg', { viewBox: '0 0 14 14', width: size > 40 ? 18 : 14, height: size > 40 ? 18 : 14, 'aria-hidden': 'true' });
      icon.append(svgEl('path', { d: 'M4.5 3v8l6.5-4z', fill: '#fff' }));
      box.append(icon);
      return box;
    }

    // ---- Header: channels, name, period ----
    function renderChannels() {
      const box = $('channels');
      box.textContent = '';
      for (const key of ['yt', 'tt', 'zk']) {
        const pill = el('button', { type: 'button', className: 'channel-pill' }, el('i'), CH[key].label);
        pill.style.setProperty('--c', CH[key].color);
        pill.setAttribute('aria-pressed', String(state.channel === key));
        pill.addEventListener('click', () => {
          Object.assign(state, { channel: key, video: 0, showAi: false });
          if (!CH[key].tabs.includes(state.tab)) state.tab = 'views';
          renderAll(true);
        });
        box.append(pill);
      }
      const add = el('a', { className: 'channel-pill channel-add', href: '#account', textContent: `+ ${t.stConnect}` });
      box.append(add);
    }

    function swapIn(node) {
      if (reduced) return;
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = 'blurin 900ms var(--ease) both';
    }

    function renderHead() {
      const ch = CH[state.channel];
      const avatar = $('avatar');
      avatar.textContent = ch.name[0];
      avatar.style.background = `radial-gradient(120% 120% at 30% 20%, ${ch.gradient})`;
      $('ch-name').textContent = ch.name;
      $('ch-handle').textContent = `${ch.handle} · ${fill(t.stSubsWord, { n: nf(ch.subs + (ch.empty ? 0 : state.liveSubs)) })}`;
      swapIn($('ch-name'));
      const range = $('range');
      range.textContent = '';
      for (const n of [7, 28, 90]) {
        const button = el('button', { type: 'button', textContent: fill(t.stDays, { n }) });
        button.setAttribute('aria-pressed', String(state.range === n));
        button.addEventListener('click', () => { state.range = n; renderAll(true); });
        range.append(button);
      }
    }

    // ---- Overview: tabs with rolling totals and a YouTube-style chart ----
    function renderTabs() {
      const ch = CH[state.channel];
      const n = state.range;
      const box = $('tabs');
      const existing = [...box.children];
      ch.tabs.forEach((key, i) => {
        const all = ch.empty ? null : ch.series[key];
        const cur = all ? sum(all.slice(-n)) : 0;
        const prev = all ? sum(all.slice(-2 * n, -n)) : 0;
        const value = ch.empty ? '0' : fmtOf(key)(cur);
        const change = prev ? (cur / prev - 1) * 100 : 0;
        let tab = existing[i];
        if (!tab) {
          tab = el('button', { type: 'button', className: 'tab' }, el('span', { className: 'tab-label' }), el('span', { className: 'tab-value' }),
            el('span', { className: 'tab-sub' }, el('span', { className: 'delta' }), el('span')));
          tab.setAttribute('role', 'tab');
          tab.addEventListener('click', () => { state.tab = tab.dataset.key; renderTabs(); renderChart(true); });
          box.append(tab);
        }
        tab.dataset.key = key;
        tab.setAttribute('aria-selected', String(state.tab === key));
        tab.children[0].textContent = LABELS[key];
        roll(tab.children[1], value);
        const delta = tab.children[2].children[0];
        delta.className = `delta${ch.empty ? '' : change >= 0 ? ' up' : ' down'}`;
        delta.textContent = ch.empty ? '—' : `${change >= 0 ? '↑' : '↓'} ${nf(Math.abs(change), 1)} %`;
        tab.children[2].children[1].textContent = ch.empty ? '' : fill(t.stVsPrev, { n });
      });
    }

    const smooth = (P) => P.reduce((d, p, i) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const a = P[i - 2] ?? P[i - 1], b = P[i - 1], c = p, e = P[i + 1] ?? p;
      const c1 = [b[0] + (c[0] - a[0]) / 6, Math.min(100, b[1] + (c[1] - a[1]) / 6)];
      const c2 = [c[0] - (e[0] - b[0]) / 6, Math.min(100, c[1] - (e[1] - b[1]) / 6)];
      return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${c[0]},${c[1]}`;
    }, '');
    let drawFrame = 0;

    function renderChart(animate) {
      const ch = CH[state.channel];
      const wrap = $('chart-wrap');
      wrap.textContent = '';
      cancelAnimationFrame(drawFrame);
      if (ch.empty) {
        wrap.append(el('div', { className: 'chart-empty' }, el('p', { textContent: t.stEmpty })));
        return;
      }
      const n = state.range;
      const all = ch.series[state.tab];
      const vals = all.slice(-n);
      const vmax = Math.max(...vals) * 1.12;
      const pts = vals.map((v, i) => [(i / (vals.length - 1)) * 100, 100 - (v / vmax) * 100]);
      // The usual range is a rolling median of the two weeks before each day, so a spike stands out of it.
      const typical = vals.map((_, i) => {
        const end = all.length - n + i;
        const win = all.slice(Math.max(0, end - 14), end).sort((x, y) => x - y);
        return win[Math.floor(win.length / 2)] ?? 0;
      });
      const up = typical.map((v, i) => [pts[i][0], 100 - ((v * 1.2) / vmax) * 100]);
      const lo = typical.map((v, i) => [pts[i][0], 100 - ((v * 0.8) / vmax) * 100]).reverse();
      const line = smooth(pts);
      const fmt = fmtOf(state.tab);

      const chart = el('div', { className: 'chart' });
      for (let k = 0; k <= 3; k++) {
        const v = (vmax / 1.12) * (k / 3);
        const y = 100 - (v / vmax) * 100;
        const grid = el('div', { className: 'chart-grid' });
        grid.style.top = `${y}%`;
        const label = el('span', { className: 'chart-y', textContent: state.tab === 'watch' ? nf(Math.round(v)) : compact(v) });
        label.style.top = `${y}%`;
        chart.append(grid, label);
      }
      const svg = svgEl('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', role: 'img', 'aria-label': `${LABELS[state.tab]}: ${fmt(sum(vals))}` });
      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'area-fill', x1: 0, y1: 0, x2: 0, y2: 1 });
      grad.append(svgEl('stop', { offset: 0, 'stop-color': '#e4583f', 'stop-opacity': 0.22 }), svgEl('stop', { offset: 1, 'stop-color': '#e4583f', 'stop-opacity': 0 }));
      const clip = svgEl('clipPath', { id: 'draw-clip' });
      const clipRect = svgEl('rect', { x: 0, y: -10, height: 120, width: animate && !reduced ? 0 : 100 });
      clip.append(clipRect);
      defs.append(grad, clip);
      const band = svgEl('path', { d: `${smooth(up)} L${lo[0][0]},${lo[0][1]} ${smooth(lo).slice(1)} Z`, fill: '#ecece8' });
      const g = svgEl('g', { 'clip-path': 'url(#draw-clip)' });
      g.append(svgEl('path', { d: `${line} L100,100 L0,100 Z`, fill: 'url(#area-fill)' }),
        svgEl('path', { d: line, fill: 'none', stroke: '#e4583f', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }));
      svg.append(defs, band, g);
      chart.append(svg);
      const head = el('div', { className: 'chart-head' });
      chart.append(head);
      // Five dates on a wide chart, three on a phone, so the labels never run into each other.
      const ticks = (wrap.clientWidth < 520 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]).map((f) => Math.round(f * (vals.length - 1)));
      ticks.forEach((i, k) => {
        const x = el('span', { className: 'chart-x', textContent: dateOf(n, i) });
        x.style.left = `${pts[i][0]}%`;
        x.style.transform = `translateX(${k === 0 ? '0' : k === ticks.length - 1 ? '-100%' : '-50%'})`;
        chart.append(x);
      });
      const hoverLine = el('div', { className: 'chart-hover', hidden: true });
      const hoverDot = el('div', { className: 'chart-dot', hidden: true });
      const tip = el('div', { className: 'chart-tip', hidden: true }, el('span'), el('b'));
      chart.append(hoverLine, hoverDot, tip);
      const point = (e) => {
        const box = chart.getBoundingClientRect();
        const i = Math.round(Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * (vals.length - 1));
        const [x, y] = pts[i];
        hoverLine.hidden = hoverDot.hidden = tip.hidden = false;
        hoverLine.style.left = `${x}%`;
        hoverDot.style.left = `${x}%`;
        hoverDot.style.top = `${y}%`;
        tip.style.left = `${x}%`;
        tip.style.top = `${Math.max(0, y - 30)}%`;
        tip.style.transform = `translate(${x > 70 ? 'calc(-100% - 12px)' : '12px'}, -50%)`;
        tip.children[0].textContent = dateOf(n, i);
        tip.children[1].textContent = `${fmt(vals[i])} · ${LABELS[state.tab].toLowerCase()}`;
      };
      chart.addEventListener('pointermove', point);
      chart.addEventListener('pointerdown', point);
      chart.addEventListener('pointerleave', () => { hoverLine.hidden = hoverDot.hidden = tip.hidden = true; });

      const legend = el('div', { className: 'chart-legend' },
        el('span', {}, el('span', {}, el('i', { className: 'legend-line' }), LABELS[state.tab]), ' ', el('span', {}, el('i', { className: 'legend-band' }), t.stTypical)),
        el('span', { textContent: t.stShapeNote }));
      wrap.append(chart, legend);

      // Drawn in from the left, the way YouTube Studio does when a tab opens, a dot riding the line's end.
      const at = (p) => {
        const f = Math.max(0, Math.min(1, p)) * (vals.length - 1);
        const i0 = Math.floor(f);
        const y = i0 >= vals.length - 1 ? pts[pts.length - 1][1] : pts[i0][1] + (pts[i0 + 1][1] - pts[i0][1]) * (f - i0);
        head.style.left = `${p * 100}%`;
        head.style.top = `${y}%`;
        head.style.opacity = p < 1 ? '1' : '0';
        clipRect.setAttribute('width', String(p * 100));
      };
      if (!animate || reduced) { at(1); return; }
      const start = performance.now();
      const step = (now) => {
        // The first frame's time can come in a hair before the start; never let it run backwards.
        const x = Math.min(1, Math.max(0, (now - start) / 1100));
        at(1 - (1 - x) ** 3);
        if (x < 1) drawFrame = requestAnimationFrame(step);
      };
      drawFrame = requestAnimationFrame(step);
    }

    // ---- Top content ----
    function ordered() {
      return CH[state.channel].rows.map((row, i) => [row, i]).sort((a, b) => b[0][2] - a[0][2]);
    }
    function renderTop() {
      const box = $('top');
      box.textContent = '';
      const rows = ordered();
      if (!rows.length) { box.append(el('p', { className: 'muted', textContent: t.stNoRows })); return; }
      const most = rows[0][0][2];
      rows.forEach(([[title, , views], idx], i) => {
        const bar = el('i');
        bar.style.width = `${(views / most) * 100}%`;
        bar.style.animationDelay = `${200 + i * 70}ms`;
        const row = el('button', { type: 'button', className: 'vrow' },
          el('span', { className: 'vrow-rank', textContent: String(i + 1) }), thumb(title, 30),
          el('span', { className: 'vrow-mid' }, el('b', { textContent: title }), el('span', { className: 'vrow-bar' }, bar)),
          el('span', { className: 'vrow-views', textContent: nf(views) }));
        row.style.animationDelay = `${150 + i * 60}ms`;
        row.setAttribute('aria-pressed', String(state.video === i));
        row.dataset.idx = String(idx);
        row.addEventListener('click', () => { state.video = i; state.showAi = false; renderTop(); renderSel(); });
        box.append(row);
      });
    }

    // ---- Realtime ----
    function renderRealtime(first) {
      const ch = CH[state.channel];
      const last2 = ch.empty ? 0 : sum(ch.series.views.slice(-2));
      roll($('rt-subs'), nf(ch.subs + (ch.empty ? 0 : state.liveSubs)));
      roll($('rt-views'), nf(ch.empty ? 0 : Math.round(last2) + state.live * (state.channel === 'tt' ? 7 : 1)));
      if (!first) return;
      const r = rng(state.channel === 'yt' ? 3 : 19);
      const shape = Array.from({ length: 48 }, (_, h) => Math.max(0.12, 0.5 + 0.5 * Math.sin((((11 - 47 + h + 48) % 24 - 15) / 24) * 2 * Math.PI)) * (0.8 + 0.4 * r()));
      const most = Math.max(...shape);
      const bars = $('rt-bars');
      bars.textContent = '';
      shape.forEach((v, h) => {
        const bar = el('i');
        bar.style.height = `${ch.empty ? 4 : Math.max(4, (v / most) * 100)}%`;
        bar.style.animationDelay = `${h * 16}ms`;
        bars.append(bar);
      });
    }

    // ---- The selected video, and its breakdown ----
    function renderSel() {
      const box = $('sel');
      box.textContent = '';
      const rows = ordered();
      box.hidden = !rows.length;
      if (!rows.length) return;
      const i = Math.min(state.video, rows.length - 1);
      const [[title, when, views, likes], idx] = rows[i];
      const sorted = rows.map(([row]) => row[2]).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      const cells = el('div', { className: 'rank-cells' });
      rows.forEach((_, k) => cells.append(el('i', { className: k === i ? 'on' : k < i ? 'before' : '' })));
      const facts = el('dl', { className: 'facts-dl' });
      for (const [label, value] of [[t.stViews, nf(views)], [t.stLikes, nf(likes)], [t.stPerK, nf((likes / views) * 1000)], [t.stToMedian, `×${nf(views / median, 2)}`]]) {
        facts.append(el('dt', { textContent: label }), el('dd', { textContent: value }));
      }
      const ask = el('button', { type: 'button', className: 'btn btn-dark btn-big', textContent: t.stWhy });
      ask.addEventListener('click', () => { state.showAi = true; renderSel(); });
      box.append(
        el('div', { className: 'sel-head' }, thumb(title, 46), el('div', {}, el('h2', { id: 'sel-h', textContent: title }), el('small', { textContent: `${t.stPublished} ${whenOf(when)}` }))),
        el('div', {}, el('div', { className: 'big-label', textContent: fill(t.stRank, { n: i + 1, of: rows.length }) }), cells),
        facts, ask);
      if (!state.showAi) return;
      const found = state.channel === 'yt' ? AI[idx] : null;
      const ai = el('div', { className: 'ai' }, el('div', { className: 'card-row' }, el('span', { className: 'pill-dark', textContent: t.stAiTag }), el('small', { textContent: t.stExample })));
      if (!found) {
        ai.append(el('p', { className: 'muted', textContent: t.stAiNone }));
      } else {
        const list = el('ol');
        found.reasons.forEach((text, k) => {
          const item = el('li', { textContent: text });
          item.style.animationDelay = `${120 + k * 90}ms`;
          list.append(item);
        });
        ai.append(el('p', { className: 'ai-verdict', textContent: found.verdict }), list,
          el('p', {}, el('span', { className: 'muted', textContent: `${t.stRepeat} ` }), found.repeat));
        for (const idea of found.ideas) {
          const add = el('button', { type: 'button' });
          const show = () => {
            const done = state.added.has(idea);
            add.textContent = done ? t.stAddedIdea : t.stAdd;
            add.setAttribute('aria-pressed', String(done));
          };
          add.addEventListener('click', () => { state.added.add(idea); show(); });
          show();
          ai.append(el('div', { className: 'idea' }, el('span', { textContent: idea }), add));
        }
      }
      box.append(ai);
    }

    function renderPlan() {
      const box = $('plan');
      box.textContent = '';
      for (const [when, title] of CH[state.channel].plan) {
        const day = new Date(2026, when[0], when[1]).toLocaleDateString(locale, { weekday: 'short' });
        box.append(el('div', { className: 'plan-row' }, el('b', { textContent: `${day} ${when[2]}` }), el('span', { textContent: title })));
      }
    }

    function renderAll(animate) {
      renderChannels();
      renderHead();
      renderTabs();
      renderChart(animate);
      renderTop();
      renderRealtime(true);
      renderSel();
      renderPlan();
    }

    renderAll(true);
    if (!reduced) {
      setInterval(() => {
        state.live += 1 + Math.floor(Math.random() * 6);
        if (Math.random() < 0.3) state.liveSubs += 1;
        renderRealtime(false);
      }, 2400);
    }

    // ---- The rinq account ----
    const authForm = $('auth-form');
    const authSaid = $('auth-said');
    const signed = $('signed');
    const addForm = $('add-form');
    const addSaid = $('add-said');
    const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    const readSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; } };
    const writeSession = (session) => { try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch { /* kept for this visit only */ } };
    const sessionOf = (data) => (typeof data?.access_token === 'string' && typeof data?.refresh_token === 'string'
      ? { access: data.access_token, refresh: data.refresh_token, until: Date.now() + (Number(data.expires_in) || 3600) * 1000, email: data.user?.email ?? '' }
      : null);

    class Failure extends Error {}
    async function call(path, { body, token } = {}) {
      let response;
      try {
        response = await fetch(`${SUPABASE_URL}${path}`, {
          method: 'POST',
          headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body ?? {}),
        });
      } catch {
        throw new Failure('offline');
      }
      const data = await response.json().catch(() => null);
      if (response.ok) return data;
      const code = String(data?.error_code ?? data?.code ?? data?.error ?? '');
      if (response.status === 429 || code.startsWith('over_')) throw new Failure('rate');
      if (code === 'PGRST202' || response.status === 404) throw new Failure('missing');
      if (code === 'email_address_invalid' || code === 'validation_failed') throw new Failure('email');
      if (code === 'weak_password') throw new Failure('weak');
      if (code === 'user_already_exists' || code === 'email_exists') throw new Failure('exists');
      if (code === 'invalid_credentials' || code === 'invalid_grant' || response.status === 400) throw new Failure('credentials');
      throw new Failure('server');
    }
    const say = (node, text, tone = '') => { node.textContent = text; node.className = `said${tone ? ` ${tone}` : ''}`; };
    const errorText = (kind) => ({ email: t.stErrEmail, weak: t.stErrWeak, credentials: t.stErrCreds, exists: t.stErrExists, rate: t.stErrRate }[kind] ?? t.stErrNet);

    async function token() {
      let session = readSession();
      if (!session) return null;
      if (session.until - Date.now() < 60_000) {
        try {
          session = { ...sessionOf(await call('/auth/v1/token?grant_type=refresh_token', { body: { refresh_token: session.refresh } })), email: session.email };
          writeSession(session);
        } catch (error) {
          if (error.message === 'credentials') { writeSession(null); showSignedOut(); }
          return null;
        }
      }
      return session.access;
    }

    function showSignedOut() {
      authForm.hidden = false;
      signed.hidden = true;
      $('demo-note').hidden = false;
    }

    async function showSignedIn() {
      const session = readSession();
      authForm.hidden = true;
      signed.hidden = false;
      $('signed-who').textContent = fill(t.stSignedIn, { email: session?.email ?? '' });
      $('signed-plan').textContent = '';
      const access = await token();
      if (!access) return;
      try {
        const [plan] = (await call('/rest/v1/rpc/my_plan', { token: access })) ?? [];
        $('signed-plan').textContent = plan?.plan === 'pro' && plan.paid_until
          ? fill(t.stPlanPro, { date: new Date(plan.paid_until).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) })
          : t.stPlanFree;
      } catch { /* the plan line stays empty */ }
      await showChannels(access);
    }

    async function showChannels(access) {
      const list = $('my-channel-list');
      try {
        const rows = (await call('/rest/v1/rpc/studio_my_channels', { token: access })) ?? [];
        list.textContent = '';
        $('my-channels').hidden = !rows.length;
        for (const row of rows) {
          list.append(el('li', {}, el('b', { textContent: row.title || row.ref }), ' · ', el('span', { className: 'muted', textContent: row.status === 'ok' ? row.platform : t.stPending })));
        }
      } catch (error) {
        $('my-channels').hidden = true;
        if (error.message === 'missing') say(addSaid, t.stSoon);
      }
    }

    authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const act = event.submitter?.dataset.act === 'up' ? 'up' : 'in';
      const email = authForm.email.value.trim().toLowerCase();
      const password = authForm.password.value;
      if (!EMAIL.test(email)) return say(authSaid, t.stErrEmail, 'bad');
      if (password.length < 6) return say(authSaid, t.stErrWeak, 'bad');
      const buttons = authForm.querySelectorAll('button');
      buttons.forEach((b) => { b.disabled = true; });
      say(authSaid, '');
      try {
        const data = await call(act === 'up' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password', { body: { email, password } });
        const session = sessionOf(data);
        if (!session) throw new Failure('server');
        writeSession(session);
        authForm.reset();
        await showSignedIn();
      } catch (error) {
        say(authSaid, errorText(error.message), 'bad');
      } finally {
        buttons.forEach((b) => { b.disabled = false; });
      }
    });

    $('sign-out').addEventListener('click', async () => {
      const access = readSession()?.access;
      writeSession(null);
      showSignedOut();
      if (access) fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, { method: 'POST', headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${access}` } }).catch(() => {});
    });

    // A YouTube channel link: @handle, /channel/UC…, /c/name or /user/name. Anything else is refused here.
    function channelRef(text) {
      let url;
      try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
      if (!/^(www\.|m\.)?youtube\.com$/i.test(url.hostname)) return null;
      const match = /^\/(@[\w.-]{3,30}|channel\/UC[\w-]{22}|c\/[\w.-]{1,100}|user\/[\w.-]{1,100})\/?/.exec(url.pathname);
      return match ? match[1] : null;
    }

    addForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const ref = channelRef(addForm.link.value.trim());
      if (!ref) return say(addSaid, t.stErrLink, 'bad');
      const access = await token();
      if (!access) return showSignedOut();
      say(addSaid, '');
      try {
        await call('/rest/v1/rpc/studio_follow', { token: access, body: { p_platform: 'youtube', p_ref: ref } });
        addForm.reset();
        say(addSaid, t.stLinkOk, 'good');
        await showChannels(access);
      } catch (error) {
        say(addSaid, error.message === 'missing' ? t.stSoon : errorText(error.message), error.message === 'missing' ? '' : 'bad');
      }
    });

    if (readSession()) showSignedIn();
    else showSignedOut();
  }
}
