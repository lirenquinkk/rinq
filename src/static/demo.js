// The home page's motion: sections fade in as they scroll into view, and the quick-add demo types a plan,
// shows what rinq understood, and lights up the places it reminds you. With reduced motion asked for (or no
// script), the first example simply stays on screen.
const motion = document.documentElement.classList.contains('motion');

// Scroll-in.
const revealed = document.querySelectorAll('.reveal, .chat');
if (motion && 'IntersectionObserver' in window) {
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      watcher.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  revealed.forEach((el) => watcher.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('is-in'));
}

// The typing demo.
const demo = document.querySelector('.demo');
if (demo && motion) {
  const examples = JSON.parse(demo.dataset.examples);
  const typed = demo.querySelector('.demo-typed');
  const card = demo.querySelector('.demo-card');
  const title = demo.querySelector('.demo-title');
  const when = demo.querySelector('.demo-when');
  const remind = demo.querySelector('.demo-remind span');
  const devices = [...demo.querySelectorAll('.device')];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(demo);

  async function play() {
    for (let i = 0; ; i = (i + 1) % examples.length) {
      while (!visible || document.hidden) await wait(500);
      const [input, t, w, r] = examples[i];
      card.classList.remove('is-shown');
      devices.forEach((d) => d.classList.remove('is-on'));
      typed.textContent = '';
      await wait(500);
      for (const ch of input) {
        typed.textContent += ch;
        await wait(ch === ' ' ? 70 : 38 + Math.random() * 40);
      }
      await wait(450);
      title.textContent = t;
      when.textContent = w;
      remind.textContent = r;
      card.classList.add('is-shown');
      await wait(650);
      for (const d of devices) {
        d.classList.add('is-on');
        await wait(280);
      }
      await wait(2600);
    }
  }
  // Start from an empty box rather than the static first example.
  setTimeout(play, 900);
}
