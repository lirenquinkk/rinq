// Numbers that roll like a counter, digit by digit (the idea of NumberFlow and Coinbase's
// RollingNumber): each digit is a column 0–9 that slides to its value, the ones on the left a moment
// before the ones on the right. The column's edges fade, so a digit passing by looks soft, not cut.
// Screen readers get the plain number. Loaded in the head with defer, before the scripts that use it.
window.rinqRoll = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDigit = (ch) => ch >= '0' && ch <= '9';

  function column() {
    const box = document.createElement('span');
    box.className = 'roll-d';
    const col = document.createElement('span');
    for (let d = 0; d <= 9; d++) {
      const cell = document.createElement('span');
      cell.textContent = String(d);
      col.append(cell);
    }
    box.append(col);
    return box;
  }

  /**
   * Shows `text` in `el`. The first time, the digits start at 0 and roll to their values; afterwards
   * only the digits that changed move. `decimal` marks where the fraction starts (shown lighter).
   */
  function set(el, text, { decimal = null, delay = 60, step = 45 } = {}) {
    const chars = [...String(text)];
    let line = el.querySelector(':scope > .roll-n');
    let label = el.querySelector(':scope > .sr-only');
    const shape = chars.map((ch) => (isDigit(ch) ? 'd' : ch)).join('');
    const fresh = !line || line.dataset.shape !== shape;
    if (fresh) {
      el.textContent = '';
      label = document.createElement('span');
      label.className = 'sr-only';
      line = document.createElement('span');
      line.className = 'roll-n';
      line.setAttribute('aria-hidden', 'true');
      line.dataset.shape = shape;
      let frac = false;
      for (const ch of chars) {
        if (decimal && ch === decimal) frac = true;
        const part = isDigit(ch) ? column() : Object.assign(document.createElement('span'), { className: 'roll-s', textContent: ch });
        if (frac) part.classList.add('roll-frac');
        line.append(part);
      }
      el.append(label, line);
    }
    label.textContent = String(text);
    const parts = [...line.children];
    const move = () => {
      parts.forEach((part, i) => {
        if (!part.classList.contains('roll-d')) return;
        const col = part.firstElementChild;
        col.style.transitionDelay = `${delay + i * step}ms`;
        col.style.transform = `translateY(-${Number(chars[i]) * 10}%)`;
      });
    };
    if (fresh && !reduced) {
      // Start from zero, then roll: the browser has to draw the zeros once first.
      void line.offsetHeight;
      requestAnimationFrame(() => requestAnimationFrame(move));
    } else {
      move();
    }
  }

  return { set };
})();
