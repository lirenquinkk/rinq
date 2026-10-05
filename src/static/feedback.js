// Reviews and complaints on the home page. Reads the shown reviews and writes new ones straight to
// Supabase with the publishable key, which may only add a review or a complaint and read back reviews
// of 4 or 5 stars (see supabase/migrations/20260930110000_feedback.sql in smart-calendar-mobile).
// Every piece of text a visitor wrote goes into the page as text, never as HTML.
const API = 'https://psesapmlbjukmdnxkcrv.supabase.co/rest/v1/feedback';
const KEY = 'sb_publishable_GDLkcWalNULyMfZBSd3g2w_-enOb8XP';
const HEADERS = { apikey: KEY, 'content-type': 'application/json' };
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function showReviews(list) {
  const lang = document.documentElement.lang;
  try {
    const query = (columns) => fetch(`${API}?select=${columns}&order=at.desc&limit=30`, { headers: HEADERS });
    // The badge column is newer than the page may be; without it, reviews still load.
    let response = await query('name,rating,message,at,badge');
    if (response.status === 400) response = await query('name,rating,message,at');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();
    list.replaceChildren();
    if (!rows.length) {
      list.append(el('p', 'muted', list.dataset.empty));
      return;
    }
    for (const row of rows) {
      const card = el('article', row.badge === 'founder' ? 'review is-founder' : 'review');
      const stars = el('p', 'review-stars', '★'.repeat(row.rating));
      stars.setAttribute('aria-label', list.dataset.stars.replace('{n}', row.rating));
      stars.setAttribute('role', 'img');
      const who = el('p', 'review-who');
      who.append(el('strong', '', row.name || list.dataset.anonymous));
      // Only the owner can set a badge in the database; a name a visitor types never earns one.
      if (row.badge === 'founder') who.append(' ', el('span', 'badge', `✓ ${list.dataset.founder}`));
      const when = new Date(row.at);
      if (!Number.isNaN(when.getTime())) {
        who.append(' · ', el('time', '', when.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })));
        who.lastChild.dateTime = row.at;
      }
      card.append(stars, el('p', 'review-text', row.message), who);
      list.append(card);
    }
  } catch {
    list.replaceChildren(el('p', 'muted', list.dataset.failed));
  }
}

function wire(form, list) {
  const status = form.querySelector('.status');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const message = String(data.get('message') ?? '').trim();
    const body = { kind: form.dataset.kind, message, language: form.dataset.lang };
    status.className = 'status';
    if (message.length < 2) {
      status.textContent = form.dataset.short;
      status.classList.add('is-error');
      form.elements.message.focus();
      return;
    }
    if (form.dataset.kind === 'review') {
      body.rating = Number(data.get('rating'));
      const name = String(data.get('name') ?? '').trim();
      if (name) body.name = name.slice(0, 40);
    } else {
      const email = String(data.get('email') ?? '').trim();
      if (email && !EMAIL.test(email)) {
        status.textContent = form.dataset.badEmail;
        status.classList.add('is-error');
        form.elements.email.focus();
        return;
      }
      if (email) body.email = email;
    }
    button.disabled = true;
    try {
      const response = await fetch(API, { method: 'POST', headers: { ...HEADERS, prefer: 'return=minimal' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.textContent = form.dataset.sent;
      if (form.dataset.kind === 'review' && body.rating >= 4 && list) showReviews(list);
    } catch {
      status.textContent = form.dataset.failed;
      status.classList.add('is-error');
    } finally {
      button.disabled = false;
    }
  });
}

const list = document.querySelector('.review-list');
if (list) showReviews(list);
for (const form of document.querySelectorAll('form.feedback')) wire(form, list);
