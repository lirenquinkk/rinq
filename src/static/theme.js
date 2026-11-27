// Runs in the head, before the page is drawn: marks that scripts run, so sections can wait out of
// sight until they scroll into view. If site.js never arrives, it lifts the wait after a moment, so
// nothing stays hidden.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  setTimeout(function () {
    if (!root.classList.contains('motion-ready')) root.classList.add('no-reveal');
  }, 2500);
})();
