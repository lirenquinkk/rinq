// The plans page: month or year. A year costs ten months; the prices roll to their new values.
{
  const plans = document.querySelector('.plans');
  const period = document.getElementById('period');
  if (plans && period) {
    const { perMonth, perYear, saveYear, saveMix, locale } = plans.dataset;
    const format = (n) => n.toLocaleString(locale);

    function show(which) {
      for (const button of period.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.period === which));
      }
      for (const price of plans.querySelectorAll('b[data-month]')) {
        const month = Number(price.dataset.month);
        const value = format(which === 'year' ? month * 10 : month);
        if (window.rinqRoll) window.rinqRoll.set(price, value, { delay: 0, step: 40 });
        else price.textContent = value;
        price.nextElementSibling.textContent = which === 'year' ? perYear : perMonth;
      }
      for (const note of plans.querySelectorAll('[data-save="year"]')) {
        note.textContent = which === 'year' ? saveYear : '';
        note.classList.toggle('is-good', which === 'year');
      }
      for (const note of plans.querySelectorAll('[data-save="mix"]')) note.textContent = saveMix;
    }

    period.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-period]');
      if (button) show(button.dataset.period);
    });
  }
}
