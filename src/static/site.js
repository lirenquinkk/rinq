// Every page: the current section in the header, the header's edge once the page has moved, sections
// that rise into view, headings whose words come out of a blur, and numbers that roll. The home page
// also draws the rinq window: November 2026 as the app shows it, a plan typed into quick add, the
// plan landing on Saturday, and the reminder toast. Reduced motion shows the end state at once.
{
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const watch = 'IntersectionObserver' in window && !reduced;
  root.classList.add('motion-ready');

  const page = document.body.dataset.page;
  for (const link of document.querySelectorAll('.nav a[data-nav]')) {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
  }

  const header = document.querySelector('.site-header');
  const sentinel = document.querySelector('.top-sentinel');
  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting)).observe(sentinel);
  }

  /** Calls `fn` once, when `el` comes into view (or at once, without an observer or with reduced motion). */
  function whenSeen(el, fn, threshold = 0.15) {
    if (!watch) return fn();
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      seen.disconnect();
      fn();
    }, { rootMargin: '0px 0px -8% 0px', threshold });
    seen.observe(el);
  }
  window.rinqWhenSeen = whenSeen;

  for (const el of document.querySelectorAll('.reveal')) whenSeen(el, () => el.classList.add('in'));

  // Headings marked .words: each word (and a <mark> as one word) comes out of a blur, one after another.
  for (const heading of document.querySelectorAll('.words')) {
    let n = 0;
    for (const node of [...heading.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const word = document.createElement('span');
          word.className = 'w';
          word.style.setProperty('--d', String(80 + n++ * 80));
          word.textContent = part;
          frag.append(word);
        }
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const word = document.createElement('span');
        word.className = 'w';
        word.style.setProperty('--d', String(80 + n++ * 80));
        node.replaceWith(word);
        word.append(node);
      }
    }
    whenSeen(heading, () => heading.classList.add('go'), 0.3);
  }

  for (const el of document.querySelectorAll('.roll[data-roll]')) {
    whenSeen(el, () => window.rinqRoll?.set(el, el.dataset.roll, { delay: 120, step: 70 }), 0.4);
  }

  // ---- The rinq window on the home page ----
  const grid = document.getElementById('grid');
  const stringsEl = document.getElementById('grid-strings');
  if (grid && stringsEl) {
    const t = JSON.parse(stringsEl.textContent);
    const stage = document.querySelector('.win-stage');
    const qa = document.getElementById('qa');
    const qaText = document.getElementById('qa-text');
    const snack = document.getElementById('snack');
    const toast = document.getElementById('toast');

    // Drawn at 1300px wide, scaled down to whatever room there is.
    const fit = () => stage.style.setProperty('--s', String(Math.min(1, stage.clientWidth / 1300)));
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
    else window.addEventListener('resize', fit);

    const weekdays = document.getElementById('weekdays');
    for (const name of t.wgWeekdays.split(',')) {
      const cell = document.createElement('span');
      cell.textContent = name;
      weekdays.append(cell);
    }

    const C = { blue: '#2f6fdb', green: '#2f9a57', tomato: '#d9472e', amber: '#c98a00', pink: '#d0467a', teal: '#13908f', violet: '#7a5ad8', graphite: '#6b7079' };
    const NOW = 11 * 60 + 45;
    const mins = (time) => (time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : 0);
    // November 2026, Monday first, six rows from 26 October. Today is Friday the 27th, 11:45.
    const extra = {
      '10-4': [{ all: true, title: t.wgDayOff, c: C.graphite }],
      '10-7': [{ time: '12:00', title: t.wgShoot, c: C.tomato }],
      '10-12': [{ time: '15:00', title: t.wgHaircut, c: C.teal }],
      '10-14': [{ all: true, title: t.wgMom, c: C.pink }],
      '10-20': [{ time: '19:00', title: t.wgEdit, c: C.tomato }],
      '10-21': [{ time: '12:00', title: t.wgShoot, c: C.tomato }],
      '10-26': [{ all: true, title: t.wgAlgebra, c: C.amber }],
      '10-27': [{ folder: true, time: '08:55', title: t.wgFolder, span: '08:55–22:25', c: C.tomato }, { time: '12:00', title: t.wgTest, c: C.amber },
        { time: '15:00', title: t.wgCall, c: C.violet }, { time: '20:00', title: t.wgMovie, c: C.pink }],
      '10-28': [{ time: '12:00', title: t.wgShoot, c: C.tomato }],
    };
    const dentist = { time: '15:00', title: t.wgDentist, c: C.teal, fresh: true };
    const cells = [];

    const SVG = 'http://www.w3.org/2000/svg';
    function folderIcon() {
      const svg = document.createElementNS(SVG, 'svg');
      for (const [k, v] of Object.entries({ viewBox: '0 0 16 16', width: '11', height: '11', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(k, v);
      const path = document.createElementNS(SVG, 'path');
      path.setAttribute('d', 'M1.5 4h4.5l1.5 1.5h7V13h-13z');
      svg.append(path);
      return svg;
    }

    function chip(e, past, n) {
      const el = document.createElement('span');
      el.className = `w-chip${e.all ? ' is-allday' : ''}${e.folder ? ' is-folder' : ''}${past ? ' is-past' : ''}${e.fresh ? ' is-fresh' : ''}`;
      el.style.setProperty('--c', e.c);
      el.style.setProperty('--n', String(n));
      if (e.folder) {
        el.append(folderIcon());
      } else if (!e.all) {
        el.append(Object.assign(document.createElement('time'), { textContent: e.time }));
      }
      el.append(Object.assign(document.createElement('b'), { textContent: e.title }));
      if (e.span) el.append(Object.assign(document.createElement('em'), { textContent: e.span }));
      return el;
    }

    function fill(cell, i, list) {
      const d = new Date(2026, 9, 26 + i);
      const isToday = d.getMonth() === 10 && d.getDate() === 27;
      const before = d.getMonth() < 10 || (d.getMonth() === 10 && d.getDate() < 27);
      list.sort((a, b) => (b.all ? 1 : 0) - (a.all ? 1 : 0) || mins(a.time) - mins(b.time));
      const fits = list.length <= 3 ? list : list.slice(0, 2);
      for (const e of fits) {
        const past = before || (isToday && !e.all && !e.folder && mins(e.time) < NOW);
        cell.append(chip(e, past, i));
      }
      if (list.length > fits.length) {
        const more = document.createElement('span');
        more.className = 'w-more';
        more.style.setProperty('--n', String(i));
        more.textContent = t.wgMore.replace('{n}', String(list.length - fits.length));
        cell.append(more);
      }
    }

    function plansOf(i) {
      const d = new Date(2026, 9, 26 + i);
      const list = [...(extra[`${d.getMonth()}-${d.getDate()}`] ?? [])];
      const wd = i % 7;
      if (wd === 0 || wd === 4) list.push({ time: '10:00', title: t.wgEnglish, c: C.blue });
      if (wd === 1 || wd === 3) list.push({ time: '18:30', title: t.wgGym, c: C.green });
      return list;
    }

    for (let i = 0; i < 42; i++) {
      const d = new Date(2026, 9, 26 + i);
      const cell = document.createElement('div');
      cell.className = `w-cell${d.getMonth() !== 10 ? ' is-out' : ''}${d.getMonth() === 10 && d.getDate() === 27 ? ' is-today' : ''}`;
      const num = document.createElement('span');
      num.className = 'w-num';
      num.textContent = d.getDate() === 1 ? (d.getMonth() === 10 ? t.wgNov1 : t.wgDec1) : String(d.getDate());
      cell.append(num);
      fill(cell, i, plansOf(i));
      grid.insertBefore(cell, snack);
      cells.push(cell);
    }
    // Saturday the 28th is cell 33: 26 October + 33 days.
    const saturday = cells[33];

    function addDentist(on) {
      saturday.querySelectorAll('.w-chip, .w-more').forEach((el) => el.remove());
      fill(saturday, 33, on ? [...plansOf(33), dentist] : plansOf(33));
    }

    let timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const typed = t.wgTyped;
    const placeholder = qaText.dataset.placeholder;

    function play() {
      timers.forEach(clearTimeout);
      timers = [];
      addDentist(false);
      snack.classList.remove('is-on');
      toast.classList.remove('is-on');
      qa.classList.remove('is-typing');
      qaText.textContent = placeholder;
      if (reduced) {
        addDentist(true);
        toast.classList.add('is-on');
        return;
      }
      let n = 0;
      // Typed the way a person types: uneven, with a breath after a comma.
      const key = () => {
        n += 1;
        qaText.textContent = typed.slice(0, n);
        if (n < typed.length) { later(34 + Math.random() * 70 + (typed[n - 1] === ',' ? 160 : 0), key); return; }
        later(560, () => {
          qa.classList.remove('is-typing');
          qaText.textContent = placeholder;
          addDentist(true);
          snack.classList.add('is-on');
          later(2600, () => snack.classList.remove('is-on'));
          later(1700, () => toast.classList.add('is-on'));
        });
      };
      later(1900, () => {
        qa.classList.add('is-typing');
        qaText.textContent = '';
        later(160, key);
      });
    }
    qa.addEventListener('click', play);
    whenSeen(stage, play, 0.2);
  }
}
