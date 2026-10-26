(function () {
  const app = window.MarcosSite || {};
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  app.initTheme?.();
  app.initReveal?.();
  app.initCounters?.();
  app.initNavActive?.();
  app.initMouseEffects?.();
  app.initDynamicCosmicBackground?.();
  app.initDemo?.();
})();
