// The Studio page. Until a channel of your own is connected it shows an example, "your channel", with
// made-up numbers that add up: 180 days of daily views to 27 November 2026, so every period has one
// before it to compare with. Signed in with channels, the same page shows yours: the numbers the bot
// reads every hour (studio_channel_days, studio_channel_videos), the subscriber forecast it works out
// once a day (studio_forecast_of, rerun on the page by forecast.js when the slider moves) and the AI
// breakdown of a video on request (studio_ask_breakdown, studio_breakdown_of). Everything is drawn with
// textContent and DOM calls, never with HTML from strings. The account part signs in to the same rinq
// account the app and the bot use (Supabase, with the project's publishable key, which is public by
// design: row-level security and the functions' own checks decide what anyone gets).
{
  const SUPABASE_URL = 'https://psesapmlbjukmdnxkcrv.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_GDLkcWalNULyMfZBSd3g2w_-enOb8XP';
  const SESSION_KEY = 'rinq.session';
  const SVG = 'http://www.w3.org/2000/svg';

  const stringsEl = document.getElementById('st-strings');
  if (stringsEl) {
    const t = JSON.parse(stringsEl.textContent);
    const locale = t.stLocale;
    const LANG = ['en', 'ru', 'uk'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
    const plural = new Intl.PluralRules(locale);
    const daysWord = (n) => `${n} ${t[`stD_${plural.select(n)}`] ?? t.stD_other}`;
    const withSign = (n) => (n < 0 ? `−${Math.abs(n).toLocaleString(locale)}` : `+${n.toLocaleString(locale)}`);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
    // The example's forecasts: inputs as the bot saves them, and how the one a month ago came out.
    CH.yt.forecast = { horizon: 30, inputs: { ready: true, K: 5.2, P: 0.2857, N: 10000, Nlow: 7000, Nhigh: 15500, F: 6000, T: 1.03 },
      past: { made: new Date(2026, 9, 28), expected: 1310, low: 1180, high: 1520, actual: 1384 } };
    CH.tt.forecast = { horizon: 30, inputs: { ready: true, K: 5.7, P: 0.4286, N: 60000, Nlow: 30000, Nhigh: 110000, F: 17000, T: 1.05 },
      past: { made: new Date(2026, 9, 28), expected: 7100, low: 5200, high: 9400, actual: 7630 } };
    CH.zk.forecast = { wait: 5 };
    const LABELS = { views: t.stViews, watch: t.stWatch, likes: t.stLikes, subs: t.stSubs };

    const state = { mode: 'demo', channel: 'yt', range: 28, tab: 'views', video: 0, showAi: false, added: new Set(), live: 0, liveSubs: 0, slider: null };
    // The channels on show: the example's, or the signed-in person's own (keyed by their Studio id).
    let shown = CH;
    const current = () => shown[state.channel];
    const fmtOf = (tab) => (tab === 'watch' ? (v) => nf(v, 1) : (v) => nf(Math.round(v)));
    // The date of point i of the last `len` days: the example ends on 27 November, a live channel on its last reading.
    const dateOf = (ch, len, i) => (ch.dates ? ch.dates[ch.dates.length - len + i] : new Date(2026, 10, 27 - (len - 1 - i)))
      .toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const whenOf = (when) => (Array.isArray(when)
      ? `${new Date(2026, when[0], when[1]).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}, ${when[2]}`
      : `${when.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}, ${when.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`);
    const hue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const VIDEO_ID = /^[\w-]{11}$/;
    function thumb(title, size, videoId) {
      const box = el('span', { className: 'thumb' });
      box.style.cssText = `width:${(size * 16) / 9}px;height:${size}px;background:linear-gradient(135deg,hsl(${hue(title)},42%,42%),hsl(${(hue(title) + 40) % 360},52%,28%))`;
      if (videoId && VIDEO_ID.test(videoId)) {
        box.append(el('img', { src: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, alt: '', loading: 'lazy', decoding: 'async' }));
        return box;
      }
      const icon = svgEl('svg', { viewBox: '0 0 14 14', width: size > 40 ? 18 : 14, height: size > 40 ? 18 : 14, 'aria-hidden': 'true' });
      icon.append(svgEl('path', { d: 'M4.5 3v8l6.5-4z', fill: '#fff' }));
      box.append(icon);
      return box;
    }

    // ---- Header: channels, name, period ----
    function renderChannels() {
      const box = $('channels');
      box.textContent = '';
      for (const key of Object.keys(shown)) {
        const pill = el('button', { type: 'button', className: 'channel-pill' }, el('i'), shown[key].label);
        pill.style.setProperty('--c', shown[key].color);
        pill.setAttribute('aria-pressed', String(state.channel === key));
        pill.addEventListener('click', async () => {
          Object.assign(state, { channel: key, video: 0, showAi: false, slider: null });
          // A live channel's numbers come first, so its page never flashes as empty.
          if (shown[key].live && !shown[key].loaded) {
            pill.setAttribute('aria-busy', 'true');
            await load(shown[key]);
            pill.removeAttribute('aria-busy');
            if (state.channel !== key) return;
          }
          if (!shown[key].tabs.includes(state.tab)) state.tab = 'views';
          renderAll(true);
        });
        box.append(pill);
      }
      if (Object.keys(shown).length < 3 || state.mode === 'demo') box.append(el('a', { className: 'channel-pill channel-add', href: '#account', textContent: `+ ${t.stConnect}` }));
      $('demo-note').hidden = state.mode !== 'demo';
    }

    function swapIn(node) {
      if (reduced) return;
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = 'blurin 900ms var(--ease) both';
    }

    function renderHead() {
      const ch = current();
      const avatar = $('avatar');
      avatar.textContent = '';
      if (ch.avatar) avatar.append(el('img', { src: ch.avatar, alt: '', decoding: 'async' }));
      else avatar.textContent = [...ch.name][0] ?? '';
      avatar.style.background = `radial-gradient(120% 120% at 30% 20%, ${ch.gradient})`;
      $('ch-name').textContent = ch.name;
      const subs = Number.isFinite(ch.subs) ? fill(t.stSubsWord, { n: nf(ch.subs + (ch.empty || ch.live ? 0 : state.liveSubs)) }) : '';
      $('ch-handle').textContent = [ch.handle, subs].filter(Boolean).join(' · ');
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
      const ch = current();
      const n = state.range;
      const box = $('tabs');
      const existing = [...box.children];
      existing.slice(ch.tabs.length).forEach((tab) => tab.remove());
      ch.tabs.forEach((key, i) => {
        const all = ch.empty || !ch.series[key].length ? null : ch.series[key];
        const cur = all ? sum(all.slice(-n)) : 0;
        const prev = all && all.length >= 2 * n ? sum(all.slice(-2 * n, -n)) : 0;
        const value = all ? fmtOf(key)(cur) : ch.live ? '—' : '0';
        const change = prev ? (cur / prev - 1) * 100 : 0;
        const compared = Boolean(all && prev);
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
        delta.className = `delta${!compared ? '' : change >= 0 ? ' up' : ' down'}`;
        delta.textContent = !compared ? '—' : `${change >= 0 ? '↑' : '↓'} ${nf(Math.abs(change), 1)} %`;
        tab.children[2].children[1].textContent = !compared ? '' : fill(t.stVsPrev, { n });
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
      const ch = current();
      const wrap = $('chart-wrap');
      wrap.textContent = '';
      cancelAnimationFrame(drawFrame);
      const all = ch.empty ? [] : ch.series[state.tab].map((v) => Math.max(0, v));
      if (all.length < 2) {
        const text = ch.status === 'pending' ? t.stReading : ch.status === 'not_found' ? t.stNotFound : t.stEmpty;
        wrap.append(el('div', { className: 'chart-empty' }, el('p', { textContent: text })));
        return;
      }
      const n = state.range;
      const vals = all.slice(-n);
      const vmax = Math.max(1, ...vals) * 1.12;
      const pts = vals.map((v, i) => [(i / (vals.length - 1)) * 100, 100 - (v / vmax) * 100]);
      // The usual range is a rolling median of the two weeks before each day, so a spike stands out of it.
      const typical = vals.map((_, i) => {
        const end = all.length - n + i;
        const win = all.slice(Math.max(0, end - 14), end).sort((x, y) => x - y);
        return win.length >= 3 ? win[Math.floor(win.length / 2)] : vals[i];
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
        const x = el('span', { className: 'chart-x', textContent: dateOf(ch, vals.length, i) });
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
        tip.children[0].textContent = dateOf(ch, vals.length, i);
        tip.children[1].textContent = `${fmt(vals[i])} · ${LABELS[state.tab].toLowerCase()}`;
      };
      chart.addEventListener('pointermove', point);
      chart.addEventListener('pointerdown', point);
      chart.addEventListener('pointerleave', () => { hoverLine.hidden = hoverDot.hidden = tip.hidden = true; });

      const legend = el('div', { className: 'chart-legend' },
        el('span', {}, el('span', {}, el('i', { className: 'legend-line' }), LABELS[state.tab]), ' ', el('span', {}, el('i', { className: 'legend-band' }), t.stTypical)),
        el('span', { textContent: ch.live ? t.stLiveNote : t.stShapeNote }));
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
      return current().rows.map((row, i) => [row, i]).sort((a, b) => b[0][2] - a[0][2]);
    }
    const TOP = 8;
    function renderTop() {
      const box = $('top');
      box.textContent = '';
      const rows = ordered();
      if (!rows.length) { box.append(el('p', { className: 'muted', textContent: t.stNoRows })); return; }
      const most = Math.max(1, rows[0][0][2]);
      rows.slice(0, TOP).forEach(([[title, , views, , , videoId], idx], i) => {
        const bar = el('i');
        bar.style.width = `${(views / most) * 100}%`;
        bar.style.animationDelay = `${200 + i * 70}ms`;
        const row = el('button', { type: 'button', className: 'vrow' },
          el('span', { className: 'vrow-rank', textContent: String(i + 1) }), thumb(title, 30, videoId),
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
      const ch = current();
      const last2 = ch.empty ? 0 : sum(ch.series.views.slice(-2));
      if (ch.live) {
        // The bot reads a live channel every hour: the card says when, and shows the last two days.
        roll($('rt-subs'), Number.isFinite(ch.subs) ? nf(ch.subs) : '—');
        roll($('rt-views'), ch.series.views.length ? nf(Math.round(last2)) : '—');
        $('rt-views-label').textContent = t.stViews2d;
        $('rt-live').textContent = ch.checkedAt ? fill(t.stUpdated, { time: ch.checkedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) }) : t.stPending;
        $('rt-bars').hidden = $('rt-axis').hidden = true;
        return;
      }
      $('rt-views-label').textContent = t.stViews48;
      $('rt-live').textContent = t.stLive;
      $('rt-bars').hidden = $('rt-axis').hidden = false;
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
      const ch = current();
      const rows = ordered();
      box.hidden = !rows.length;
      if (!rows.length) return;
      const i = Math.min(state.video, rows.length - 1, TOP - 1);
      const [[title, when, views, likes, comments, videoId], idx] = rows[i];
      // A video an hour old has not had its chance yet: yours are compared with videos at least as old
      // (up to a week), the way the AI's breakdown compares them.
      let pool = rows.map(([row]) => row);
      if (when instanceof Date) {
        const age = Math.min(Date.now() - when.getTime(), 604_800_000);
        const older = pool.filter((row) => row !== rows[i][0] && Date.now() - row[1].getTime() >= age);
        pool = older.length >= 3 ? older : pool.filter((row) => row !== rows[i][0]);
      }
      const sorted = pool.map((row) => row[2]).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = !sorted.length ? 0 : sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      const cells = el('div', { className: 'rank-cells' });
      rows.slice(0, TOP).forEach((_, k) => cells.append(el('i', { className: k === i ? 'on' : k < i ? 'before' : '' })));
      const facts = el('dl', { className: 'facts-dl' });
      const known = (n) => Number.isFinite(n);
      const lines = [[t.stViews, nf(views)], [t.stLikes, known(likes) ? nf(likes) : '—']];
      if (ch.live) lines.push([t.stComments, known(comments) ? nf(comments) : '—']);
      lines.push([t.stPerK, known(likes) && views > 0 ? nf((likes / views) * 1000, ch.live ? 1 : 0) : '—'], [t.stToMedian, median > 0 ? `×${nf(views / median, 2)}` : '—']);
      for (const [label, value] of lines) facts.append(el('dt', { textContent: label }), el('dd', { textContent: value }));
      const entry = ch.live ? ch.ai[videoId] : null;
      const busy = entry && ['asking', 'waiting'].includes(entry.status);
      const ask = el('button', { type: 'button', className: 'btn btn-dark btn-big', textContent: t.stWhy, disabled: Boolean(busy) });
      ask.addEventListener('click', () => {
        if (ch.live) { askLive(ch, videoId); return; }
        state.showAi = true;
        renderSel();
      });
      box.append(
        el('div', { className: 'sel-head' }, thumb(title, 46, videoId), el('div', {}, el('h2', { id: 'sel-h', textContent: title }), el('small', { textContent: `${t.stPublished} ${whenOf(when)}` }))),
        el('div', {}, el('div', { className: 'big-label', textContent: fill(t.stRank, { n: i + 1, of: rows.length }) }), cells),
        facts, ask);
      if (ch.live) {
        if (entry) box.append(liveAi(entry));
        return;
      }
      if (!state.showAi) return;
      const found = state.channel === 'yt' ? AI[idx] : null;
      const ai = el('div', { className: 'ai' }, el('div', { className: 'card-row' }, el('span', { className: 'pill-dark', textContent: t.stAiTag }), el('small', { textContent: t.stExample })));
      if (!found) ai.append(el('p', { className: 'muted', textContent: t.stAiNone }));
      else answer(ai, found, (idea, button) => {
        const show = () => {
          const done = state.added.has(idea);
          button.textContent = done ? t.stAddedIdea : t.stAdd;
          button.setAttribute('aria-pressed', String(done));
        };
        button.addEventListener('click', () => { state.added.add(idea); show(); });
        show();
      });
      box.append(ai);
    }

    /** A breakdown's verdict, reasons, what to repeat and change, and its ideas, each idea with a button. */
    function answer(box, found, ideaButton) {
      const list = el('ol');
      (found.reasons ?? []).forEach((text, k) => {
        const item = el('li', { textContent: text });
        item.style.animationDelay = `${120 + k * 90}ms`;
        list.append(item);
      });
      box.append(el('p', { className: 'ai-verdict', textContent: found.verdict }), list);
      if (found.repeat) box.append(el('p', {}, el('span', { className: 'muted', textContent: `${t.stRepeat} ` }), found.repeat));
      if (found.change) box.append(el('p', {}, el('span', { className: 'muted', textContent: `${t.stChange} ` }), found.change));
      for (const idea of found.ideas ?? []) {
        const button = el('button', { type: 'button' });
        ideaButton(idea, button);
        box.append(el('div', { className: 'idea' }, el('span', { textContent: idea }), button));
      }
    }

    function liveAi(entry) {
      const left = entry.left === null || entry.left === undefined ? '' : fill(t.stAiLeft, { n: entry.left });
      const ai = el('div', { className: 'ai' }, el('div', { className: 'card-row' }, el('span', { className: 'pill-dark', textContent: t.stAiTag }), el('small', { textContent: left })));
      const say = (text) => ai.append(el('p', { className: 'muted', textContent: text }));
      if (entry.status === 'asking' || entry.status === 'waiting') ai.append(el('p', { className: 'ai-wait', textContent: t.stAiWorking }));
      else if (entry.status === 'limit') say(t.stAiLimit);
      else if (entry.status === 'unknown') say(t.stAiUnknown);
      else if (entry.status === 'failed') say(t.stAiFailed);
      else if (entry.status === 'slow') say(t.stAiSlow);
      else if (entry.status === 'error') say(errorText(entry.error));
      else if (entry.status === 'done') {
        answer(ai, entry.result, (idea, button) => {
          button.textContent = t.stCopy;
          button.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(idea); } catch { return; }
            button.textContent = t.stCopied;
            button.setAttribute('aria-pressed', 'true');
          });
        });
        ai.append(el('p', { className: 'ai-note', textContent: t.stAiNote }));
      }
      return ai;
    }

    /** Redraws the selected video's card if it still shows that channel and video. */
    function redrawSel(ch, videoId) {
      const rows = ordered();
      const i = Math.min(state.video, rows.length - 1, TOP - 1);
      if (current()?.id === ch.id && rows[i]?.[0][5] === videoId) renderSel();
    }

    // A breakdown already made is shown for free; otherwise it is asked for (the database counts it)
    // and the page waits for the bot's answer, a few seconds as a rule.
    async function askLive(ch, videoId) {
      const entry = { status: 'asking', left: ch.ai[videoId]?.left };
      ch.ai[videoId] = entry;
      redrawSel(ch, videoId);
      const body = { p_channel: ch.id, p_video: videoId, p_lang: LANG };
      try {
        const access = await token();
        if (!access) { showSignedOut(); return; }
        const [seen] = (await call('/rest/v1/rpc/studio_breakdown_of', { token: access, body })) ?? [];
        if (seen?.status === 'done' && seen.result) {
          Object.assign(entry, { status: 'done', result: seen.result });
          return;
        }
        const [asked] = (await call('/rest/v1/rpc/studio_ask_breakdown', { token: access, body })) ?? [];
        entry.left = asked?.left_this_month ?? null;
        if (asked?.status === 'limit' || asked?.status === 'unknown') { entry.status = asked.status; return; }
        entry.status = 'waiting';
        redrawSel(ch, videoId);
        for (const started = Date.now(); Date.now() - started < 120_000;) {
          await sleep(2500);
          const fresh = await token();
          if (!fresh) break;
          const [row] = (await call('/rest/v1/rpc/studio_breakdown_of', { token: fresh, body })) ?? [];
          if (row?.status === 'done' && row.result) { Object.assign(entry, { status: 'done', result: row.result }); return; }
          if (row?.status === 'failed') { entry.status = 'failed'; return; }
        }
        entry.status = 'slow';
      } catch (error) {
        Object.assign(entry, { status: 'error', error: error.message });
      } finally {
        redrawSel(ch, videoId);
      }
    }

    // ---- The subscriber forecast ----
    function renderForecast() {
      const box = $('fc');
      box.textContent = '';
      const ch = current();
      const fc = ch.forecast;
      box.append(el('div', { className: 'fc-head' }, el('h2', { id: 'fc-h', textContent: t.stFcH }), el('small', { textContent: t.stFcNote })));
      const note = (text) => box.append(el('p', { className: 'muted', textContent: text }));
      if (!fc || fc.wait !== undefined) return note(fill(t.stFcWait, { days: daysWord(fc?.wait ?? 7) }));
      if (fc.hidden) return note(t.stFcHidden);
      const pace = (fc.inputs.P ?? 0) * 7;
      const now = Math.round(pace);
      const result = () => window.rinqForecast.forecastOf(fc.inputs, { horizon: fc.horizon, perDay: state.slider === null || state.slider === now ? undefined : state.slider / 7 });
      if (fc.soon || !window.rinqForecast || !result()) return note(t.stFcSoon);

      const big = el('span', { className: 'big-n' });
      const range = el('div', { className: 'big-label' });
      const perDay = el('div', { className: 'fc-day' });
      const show = () => {
        const r = result();
        roll(big, withSign(r.expected));
        range.textContent = fill(t.stFcRange, { low: withSign(r.low), high: withSign(r.high) });
        perDay.textContent = fill(t.stFcPerDay, { n: nf(r.viewsPerDay) });
      };
      const value = state.slider ?? now;
      const slider = el('input', { type: 'range', id: 'fc-slider', min: '0', max: String(Math.max(14, Math.ceil(pace * 2))), step: '1', value: String(value) });
      const out = el('output', { htmlFor: 'fc-slider', textContent: String(value) });
      slider.addEventListener('input', () => {
        state.slider = Number(slider.value);
        out.textContent = slider.value;
        show();
      });
      box.append(el('div', {}, big, range), perDay,
        el('div', { className: 'fc-slide' },
          el('div', { className: 'card-row' }, el('label', { htmlFor: 'fc-slider', textContent: t.stFcSlider }), el('span', {}, out, el('small', { textContent: ` · ${fill(t.stFcPace, { n: nf(pace, 1) })}` }))),
          slider));
      show();
      if (fc.inputs.approximate) note(t.stFcApprox);
      if (fc.past) {
        const { made, expected, low, high, actual } = fc.past;
        const verdict = actual < low ? t.stFcBelow : actual > high ? t.stFcAbove : t.stFcIn;
        box.append(el('p', { className: `fc-past${actual >= low && actual <= high ? ' is-in' : ''}`, textContent: fill(t.stFcPast, {
          date: made.toLocaleDateString(locale, { day: 'numeric', month: 'long' }), expected: withSign(expected), low: withSign(low), high: withSign(high), actual: withSign(actual), verdict,
        }) }));
      }
      box.append(el('details', { className: 'fc-how' }, el('summary', { textContent: t.stFcHow }), el('p', { textContent: t.stFcHowText })));
    }

    function renderPlan() {
      const box = $('plan');
      box.textContent = '';
      $('plan-card').hidden = state.mode !== 'demo';
      for (const [when, title] of current().plan) {
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
      renderForecast();
      renderSel();
      renderPlan();
    }

    renderAll(true);
    if (!reduced) {
      setInterval(() => {
        if (state.mode !== 'demo') return;
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
      if (code === 'P0001' && /studio_limit/.test(String(data?.message ?? ''))) throw new Failure('limit');
      if (code === '23514') throw new Failure('link');
      if (code === 'email_address_invalid' || code === 'validation_failed') throw new Failure('email');
      if (code === 'weak_password') throw new Failure('weak');
      if (code === 'user_already_exists' || code === 'email_exists') throw new Failure('exists');
      if (code === 'invalid_credentials' || code === 'invalid_grant' || response.status === 400) throw new Failure('credentials');
      throw new Failure('server');
    }
    const say = (node, text, tone = '') => { node.textContent = text; node.className = `said${tone ? ` ${tone}` : ''}`; };
    const errorText = (kind) => ({ email: t.stErrEmail, weak: t.stErrWeak, credentials: t.stErrCreds, exists: t.stErrExists, rate: t.stErrRate, limit: t.stErrLimit, link: t.stErrLink }[kind] ?? t.stErrNet);

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
      leaveLive();
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
      let rows;
      try {
        rows = (await call('/rest/v1/rpc/studio_my_channels', { token: access })) ?? [];
      } catch (error) {
        $('my-channels').hidden = true;
        if (error.message === 'missing') say(addSaid, t.stSoon);
        return;
      }
      list.textContent = '';
      $('my-channels').hidden = !rows.length;
      for (const row of rows) {
        const status = row.status === 'ok' ? 'YouTube' : row.status === 'not_found' ? t.stNotFound : t.stPending;
        const remove = el('button', { type: 'button', className: 'link-btn', textContent: t.stRemove });
        remove.addEventListener('click', async () => {
          remove.disabled = true;
          try {
            const fresh = await token();
            if (!fresh) return showSignedOut();
            await call('/rest/v1/rpc/studio_unfollow', { token: fresh, body: { p_channel: row.id } });
            await showChannels(fresh);
          } catch (error) {
            remove.disabled = false;
            say(addSaid, errorText(error.message), 'bad');
          }
        });
        list.append(el('li', {}, el('b', { textContent: row.title || row.ref }), ' · ', el('span', { className: 'muted', textContent: status }), ' ', remove));
      }
      await enterLive(rows);
    }

    // ---- Your own channels on the dashboard ----
    const AVATAR = /^https:\/\/yt3\.ggpht\.com\//;
    const DAY_MS = 86_400_000;
    let refreshTimer = 0;

    function liveChannel(row, before) {
      const name = row.title || row.ref;
      return {
        ...(before ?? { series: { views: [], subs: [] }, dates: [], rows: [], ai: {}, loaded: false }),
        id: row.id, live: true, label: name, name, color: '#e4583f', gradient: '#f08a6f, #c8402a',
        handle: row.ref.startsWith('@') ? row.ref : 'YouTube',
        avatar: typeof row.avatar === 'string' && AVATAR.test(row.avatar) ? row.avatar : null,
        subs: row.subscribers === null || row.subscribers === undefined ? null : Number(row.subscribers),
        status: row.status, checkedAt: row.checked_at ? new Date(row.checked_at) : null,
        tabs: row.subscribers === null || row.subscribers === undefined ? ['views'] : ['views', 'subs'],
        plan: [], empty: row.status !== 'ok',
      };
    }

    /** A live channel's days, videos and forecast, in the shapes the example uses. */
    async function load(ch) {
      if (ch.status !== 'ok') return;
      const access = await token();
      if (!access) return;
      const body = { p_channel: ch.id };
      try {
        const [days, videos, forecasts] = await Promise.all([
          call('/rest/v1/rpc/studio_channel_days', { token: access, body: { ...body, p_days: 180 } }),
          call('/rest/v1/rpc/studio_channel_videos', { token: access, body: { ...body, p_limit: 50 } }),
          call('/rest/v1/rpc/studio_forecast_of', { token: access, body }),
        ]);
        const sortedDays = (days ?? []).filter((d) => d?.day && Number.isFinite(Number(d.views))).sort((a, b) => (a.day < b.day ? -1 : 1));
        const series = { views: [], subs: [] };
        const dates = [];
        for (let i = 1; i < sortedDays.length; i++) {
          const [a, b] = [sortedDays[i - 1], sortedDays[i]];
          dates.push(new Date(`${b.day}T12:00:00`));
          series.views.push(Number(b.views) - Number(a.views));
          series.subs.push(a.subscribers === null || b.subscribers === null ? 0 : Number(b.subscribers) - Number(a.subscribers));
        }
        const num = (x) => (x === null || x === undefined ? null : Number(x));
        const rows = (videos ?? []).filter((v) => v?.video_id).map((v) => [
          v.title || v.video_id, new Date(v.published_at), Number(v.views) || 0, num(v.likes), num(v.comments), v.video_id,
        ]);
        const span = sortedDays.length ? Math.round((Date.parse(sortedDays.at(-1).day) - Date.parse(sortedDays[0].day)) / DAY_MS) : 0;
        const f = (forecasts ?? [])[0];
        let forecast;
        if (f?.made_on && f.inputs) {
          forecast = { horizon: f.horizon_days ?? 30, inputs: f.inputs };
          if (f.past_made_on && f.subscribers_now !== null && f.past_subscribers_at !== null) {
            forecast.past = { made: new Date(`${f.past_made_on}T12:00:00`), expected: f.past_expected, low: f.past_low, high: f.past_high,
              actual: Number(f.subscribers_now) - Number(f.past_subscribers_at) };
          }
        } else if (span < 7) forecast = { wait: Math.max(1, 7 - span) };
        else if (ch.subs === null) forecast = { hidden: true };
        else forecast = { soon: true };
        Object.assign(ch, { series, dates, rows, forecast, loaded: true, empty: false });
      } catch {
        ch.loaded = false;
      }
    }

    async function enterLive(rows) {
      clearTimeout(refreshTimer);
      if (!rows.length) return leaveLive();
      const before = state.mode === 'live' ? shown : {};
      const next = {};
      for (const row of rows) {
        const old = before[row.id];
        const ch = liveChannel(row, old);
        // A newer reading than the one on show: its numbers are fetched again (the AI answers are kept).
        if (old && old.checkedAt?.getTime() !== ch.checkedAt?.getTime()) ch.loaded = false;
        next[row.id] = ch;
      }
      const fresh = state.mode !== 'live' || !next[state.channel];
      shown = next;
      if (fresh) Object.assign(state, { mode: 'live', channel: rows[0].id, video: 0, showAi: false, slider: null, tab: 'views' });
      if (!current().tabs.includes(state.tab)) state.tab = 'views';
      const ch = current();
      if (!ch.loaded) await load(ch);
      if (current()?.id === ch.id) renderAll(fresh);
      // A channel just connected is read within minutes: look again until it is; otherwise every ten minutes.
      const waiting = rows.some((row) => row.status === 'pending');
      refreshTimer = setTimeout(async () => {
        const access = await token();
        if (access && state.mode === 'live') showChannels(access);
      }, waiting ? 20_000 : 10 * 60_000);
    }

    function leaveLive() {
      clearTimeout(refreshTimer);
      $('my-channels').hidden = true;
      if (state.mode === 'demo') return;
      shown = CH;
      Object.assign(state, { mode: 'demo', channel: 'yt', video: 0, showAi: false, slider: null, tab: 'views' });
      renderAll(true);
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
