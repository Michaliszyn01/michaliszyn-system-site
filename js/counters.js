(function () {
  function animateCounter(entry) {
    const target = Number(entry.target.dataset.counter);
    const duration = 1050;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      entry.target.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = 'true';
        animateCounter(entry);
      });
    }, { threshold: 0.45 });

    counters.forEach((el) => counterObserver.observe(el));
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.initCounters = initCounters;
})();
