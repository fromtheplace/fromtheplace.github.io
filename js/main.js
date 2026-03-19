/* main.js — navigation & init */

function toggleMobileNav() {
  var nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

document.querySelectorAll('.mobile-nav a').forEach(function (a) {
  a.addEventListener('click', function () {
    var nav = document.getElementById('mobileNav');
    if (nav) nav.classList.remove('open');
  });
});

window.toggleMobileNav = toggleMobileNav;

/* ── SHARE BUTTON ── */
(function () {
  var btn = document.getElementById('modalShareBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var url = window.location.href;

    // Use native share sheet if available (mobile)
    if (navigator.share) {
      navigator.share({ title: document.getElementById('modal-title').textContent, url: url });
      return;
    }

    // Fallback: copy URL to clipboard
    navigator.clipboard.writeText(url).then(function () {
      var orig = btn.innerHTML;
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.innerHTML = orig;
        btn.classList.remove('copied');
      }, 2000);
    });
  });
})();

(function () {
  var btn = document.getElementById('themeToggle');
  var root = document.documentElement;

  // Restore saved preference
  if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (btn) btn.textContent = '☀';
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        btn.textContent = '☾';
        localStorage.setItem('theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        btn.textContent = '☀';
        localStorage.setItem('theme', 'dark');
      }
    });
  }
})();
