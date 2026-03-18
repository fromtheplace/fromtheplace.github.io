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

/* ── DARK MODE TOGGLE ── */
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
