/* main.js — navigation & init */

function toggleMobileNav() {
  var nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

/* Close mobile nav when a nav link is tapped */
document.querySelectorAll('.mobile-nav a').forEach(function (a) {
  a.addEventListener('click', function () {
    var nav = document.getElementById('mobileNav');
    if (nav) nav.classList.remove('open');
  });
});

/* Expose for onclick attr in HTML */
window.toggleMobileNav = toggleMobileNav;
