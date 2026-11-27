// Reviews and complaints on the home page. The key is the project's publishable key and is meant to be
// public: anyone may write one, and the only rows it reads back are the reviews the page shows, four or
// five stars that have not been hidden. Complaints, lower ratings and the email someone leaves for an
// answer cannot be read with it at all. Everything sits in one block so nothing here becomes a global
// the page's other scripts could trip over.
{
  const ENDPOINT = 'https://psesapmlbjukmdnxkcrv.supabase.co/rest/v1/feedback';
  const PUBLISHABLE_KEY = 'sb_publishable_GDLkcWalNULyMfZBSd3g2w_-enOb8XP';
  const SHOWN = 12;

  const list = document.getElementById('review-list');
  const reviewForm = document.getElementById('review-form');
  const complaintForm = document.getElementById('complaint-form');

  if (list && reviewForm && complaintForm) {
    // The table keeps English or Russian; a review from the Ukrainian page is stored as Russian, the
    // closer of the two, and its date is still written in Ukrainian.
    const page = list.dataset.lang;
    const lang = page === 'en' ? 'en' : 'ru';
    const month = new Intl.DateTimeFormat({ en: 'en-GB', ru: 'ru-RU', uk: 'uk-UA' }[page] ?? 'en-GB', { month: 'long', year: 'numeric' });

    /** One review, built with textContent so what someone wrote can never become markup. */
    function card({ name, rating, message, at }) {
      const stars = Math.min(5, Math.max(1, Math.round(rating)));
      const article = document.createElement('article');
      article.className = 'review';

      const head = document.createElement('p');
      head.className = 'review-head';
      const shown = document.createElement('span');
      shown.className = 'review-stars';
      shown.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
      shown.setAttribute('role', 'img');
      shown.setAttribute('aria-label', list.dataset[`stars${stars}`] ?? String(stars));
      const who = document.createElement('span');
      who.className = 'review-who';
      who.textContent = (name ?? '').trim() || list.dataset.noname;
      head.append(shown, who);

      const said = document.createElement('p');
      said.className = 'review-text';
      said.textContent = message;

      const when = document.createElement('p');
      when.className = 'review-when';
      const date = new Date(at);
      if (!Number.isNaN(date.valueOf())) when.textContent = month.format(date);

      article.append(head, said, when);
      return article;
    }

    function show(reviews) {
      list.replaceChildren();
      if (!reviews.length) {
        const empty = document.createElement('p');
        empty.className = 'note';
        empty.textContent = list.dataset.none;
        list.append(empty);
        return;
      }
      for (const review of reviews) list.append(card(review));
    }

    async function load() {
      try {
        const response = await fetch(`${ENDPOINT}?select=name,rating,message,at&order=at.desc&limit=${SHOWN}`, {
          headers: { apikey: PUBLISHABLE_KEY },
        });
        if (!response.ok) throw new Error(String(response.status));
        show(await response.json());
      } catch {
        // Nothing to say here: the page keeps whatever it showed, and the forms still work.
        if (!list.querySelector('.review')) show([]);
      }
    }

    /** return=minimal matters: only shown reviews can be read back, so asking for the row would fail. */
    async function send(row) {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ ...row, language: lang }),
      });
      return response.ok;
    }

    async function submit(form, said, button, row) {
      button.disabled = true;
      said.textContent = '';
      try {
        return await send(row);
      } catch {
        return false;
      } finally {
        button.disabled = false;
      }
    }

    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      // A person never sees the hidden field; a simple bot fills in everything it finds.
      if (reviewForm.leave_empty.value) return;
      const said = document.getElementById('review-said');
      const chosen = reviewForm.querySelector('input[name="rating"]:checked');
      if (!chosen) {
        said.textContent = reviewForm.dataset.need;
        return;
      }
      const rating = Number(chosen.value);
      const name = reviewForm.name.value.trim();
      const ok = await submit(reviewForm, said, reviewForm.querySelector('button'), {
        kind: 'review',
        rating,
        name: name || null,
        message: reviewForm.message.value.trim(),
      });
      if (!ok) {
        said.textContent = reviewForm.dataset.bad;
        return;
      }
      reviewForm.reset();
      // Four and five stars are on the page at once; the rest went to the owner, so say which happened.
      said.textContent = rating >= 4 ? reviewForm.dataset.ok : reviewForm.dataset.quiet;
      if (rating >= 4) load();
    });

    complaintForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (complaintForm.leave_empty.value) return;
      const said = document.getElementById('complaint-said');
      const email = complaintForm.email.value.trim();
      const ok = await submit(complaintForm, said, complaintForm.querySelector('button'), {
        kind: 'complaint',
        message: complaintForm.message.value.trim(),
        email: email || null,
      });
      said.textContent = ok ? complaintForm.dataset.ok : complaintForm.dataset.bad;
      if (ok) complaintForm.reset();
    });

    load();
  }
}
