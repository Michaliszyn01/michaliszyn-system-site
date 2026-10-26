(function () {
  function initMouseEffects() {
    const orbs = document.querySelectorAll('.orb');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!orbs.length || reduceMotion) return;

    let ticking = false;
    window.addEventListener('mousemove', (event) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 18;
        const y = (event.clientY / window.innerHeight - 0.5) * 18;

        orbs.forEach((orb, index) => {
          const depth = index === 0 ? 1 : -0.8;
          orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
        });

        ticking = false;
      });
    }, { passive: true });
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.initMouseEffects = initMouseEffects;
})();
