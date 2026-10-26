(function () {
  function updateThemeButton(themeBtn, isLight) {
    document.body.classList.toggle('light', isLight);
    themeBtn.setAttribute('aria-label', isLight ? 'Alternar para tema escuro' : 'Alternar para tema claro');
    themeBtn.querySelector('.theme-label').textContent = isLight ? 'Tema claro' : 'Tema escuro';
  }

  function initTheme() {
    const themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('marcos-theme');
    updateThemeButton(themeBtn, savedTheme === 'light');

    themeBtn.addEventListener('click', () => {
      const isLight = !document.body.classList.contains('light');
      localStorage.setItem('marcos-theme', isLight ? 'light' : 'dark');
      updateThemeButton(themeBtn, isLight);
    });
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.initTheme = initTheme;
})();
