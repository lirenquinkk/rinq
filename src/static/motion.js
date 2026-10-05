// Runs before the page is drawn, so nothing flashes:
// - the theme the visitor picked with the switch in the header, if any (otherwise their system's);
// - scroll-in animations, unless the visitor asked their system for less motion.
// Wrapped in a block: classic scripts share one scope, and the page's other scripts have their own names.
{
const root = document.documentElement;
const KEY = 'rinq-theme';
try {
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
} catch { /* storage blocked: follow the system */ }
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('motion');

// The switch flips between light and dark from whatever is showing now, and remembers the choice.
document.addEventListener('click', (event) => {
  if (!event.target.closest('.theme-switch')) return;
  const showing = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = showing === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem(KEY, next); } catch { /* fine: it lasts for this page */ }
});
}
