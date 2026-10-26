(function () {
  function initNavActive() {
    const navLinks = document.querySelectorAll('.links a');
    if (!navLinks.length) return;

    const sections = [...navLinks].map((link) => document.querySelector(link.getAttribute('href')));

    function updateActiveLink() {
      const y = window.scrollY + 140;
      sections.forEach((section, index) => {
        if (!section) return;
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        navLinks[index].classList.toggle('active', y >= top && y < bottom);
      });
    }

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.initNavActive = initNavActive;
})();
