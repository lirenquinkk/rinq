// Runs before the page is drawn: marks it for scroll-in animations, unless the visitor asked their system
// for less motion. Without this script (or with reduced motion) everything is simply shown.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
