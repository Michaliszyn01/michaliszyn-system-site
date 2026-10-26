(function () {
  class DynamicCosmicBackground {
    constructor() {
      this.root = null;
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.rafId = 0;
      this.resizeId = 0;
      this.pointerId = 0;
      this.scrollId = 0;
      this.lastTime = 0;
      this.currentTheme = '';
      this.isRunning = false;
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.mobileMotion = window.matchMedia('(max-width: 720px)');

      this.handleResize = this.handleResize.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.handleVisibility = this.handleVisibility.bind(this);
      this.handleMotionPreference = this.handleMotionPreference.bind(this);
      this.animate = this.animate.bind(this);
    }

    init() {
      const existing = document.querySelector('[data-dynamic-cosmic-background]');
      if (existing) {
        this.root = existing;
        this.canvas = existing.querySelector('canvas');
      } else {
        this.root = this.createRoot();
        document.body.insertBefore(this.root, document.body.firstChild);
        this.canvas = this.root.querySelector('canvas');
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.currentTheme = this.getTheme();

      this.themeObserver = new MutationObserver(() => this.syncTheme());
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

      window.addEventListener('resize', this.handleResize, { passive: true });
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      document.addEventListener('visibilitychange', this.handleVisibility);

      if (!this.reduceMotion.matches) {
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      }

      this.addMediaListener(this.reduceMotion, this.handleMotionPreference);
      this.addMediaListener(this.mobileMotion, this.handleResize);

      this.resize();
      this.updateScrollState();
      this.start();

      return this;
    }

    createRoot() {
      const root = document.createElement('div');
      root.className = 'dynamic-cosmic-background';
      root.dataset.dynamicCosmicBackground = 'DynamicCosmicBackground';
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = [
        '<div class="cosmic-image cosmic-image--dark"></div>',
        '<div class="cosmic-image cosmic-image--light"></div>',
        '<div class="cosmic-bg"></div>',
        '<div class="universe-depth"></div>',
        '<div class="noise"></div>',
        '<div class="grid-glow"></div>',
        '<div class="star-field"></div>',
        '<div class="star-dust"></div>',
        '<div class="constellation-layer"></div>',
        '<div class="cosmic-mist"></div>',
        '<div class="cosmic-glow"></div>',
        '<canvas class="cosmic-canvas"></canvas>',
        '<div class="cosmic-sparkles"></div>',
        '<div class="holographic-lines"></div>',
        '<div class="holo-smoke"></div>',
        '<div class="cosmic-vignette"></div>'
      ].join('');
      return root;
    }

    addMediaListener(mediaQuery, handler) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return;
      }

      mediaQuery.addListener(handler);
    }

    removeMediaListener(mediaQuery, handler) {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handler);
        return;
      }

      mediaQuery.removeListener(handler);
    }

    getTheme() {
      return document.body.classList.contains('light') ? 'light' : 'dark';
    }

    syncTheme() {
      const nextTheme = this.getTheme();
      if (nextTheme === this.currentTheme) return;

      this.currentTheme = nextTheme;
      this.seedParticles();
      this.draw(performance.now());
    }

    handleMotionPreference() {
      this.seedParticles();

      if (this.reduceMotion.matches) {
        window.removeEventListener('pointermove', this.handlePointerMove);
        this.stop();
        this.draw(performance.now());
        return;
      }

      window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.start();
    }

    handleVisibility() {
      if (document.hidden) {
        this.stop();
        return;
      }

      this.start();
    }

    handleResize() {
      if (this.resizeId) return;

      this.resizeId = requestAnimationFrame(() => {
        this.resizeId = 0;
        this.resize();
      });
    }

    handleScroll() {
      if (this.scrollId) return;

      this.scrollId = requestAnimationFrame(() => {
        this.scrollId = 0;
        this.updateScrollState();
      });
    }

    handlePointerMove(event) {
      if (this.pointerId || this.mobileMotion.matches) return;

      this.pointerId = requestAnimationFrame(() => {
        this.pointerId = 0;
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        const style = document.documentElement.style;

        style.setProperty('--mouse-x', `${(x * 34).toFixed(2)}px`);
        style.setProperty('--mouse-y', `${(y * 30).toFixed(2)}px`);
        style.setProperty('--mouse-x-soft', `${(x * 18).toFixed(2)}px`);
        style.setProperty('--mouse-y-soft', `${(y * 16).toFixed(2)}px`);
        style.setProperty('--mouse-x-reverse', `${(x * -22).toFixed(2)}px`);
        style.setProperty('--mouse-y-reverse', `${(y * -18).toFixed(2)}px`);
      });
    }

    updateScrollState() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const depth = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const layer = Math.min(5, Math.floor(depth * 6));
      const style = document.documentElement.style;

      document.body.dataset.spaceLayer = String(layer);
      style.setProperty('--scroll-depth', depth.toFixed(3));
      style.setProperty('--space-y', `${(-depth * 70).toFixed(2)}px`);
      style.setProperty('--space-y-soft', `${(-depth * 34).toFixed(2)}px`);
      style.setProperty('--space-y-deep', `${(-depth * 108).toFixed(2)}px`);
      style.setProperty('--space-y-dust', `${(-depth * 142).toFixed(2)}px`);
      style.setProperty('--space-hue', `${(depth * 18).toFixed(2)}deg`);
      style.setProperty('--grid-opacity', (0.12 + depth * 0.16).toFixed(3));
      style.setProperty('--constellation-opacity', (0.17 + depth * 0.18).toFixed(3));
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
      }

      this.seedParticles();
      this.draw(performance.now());
    }

    getParticleTarget() {
      const isLight = this.currentTheme === 'light';
      const isMobile = this.mobileMotion.matches;

      if (this.reduceMotion.matches) {
        return isMobile ? 34 : 58;
      }

      if (isMobile) {
        return isLight ? 58 : 76;
      }

      return isLight ? 148 : 210;
    }

    seedParticles() {
      const width = this.canvas.width || 1;
      const height = this.canvas.height || 1;
      const target = this.getParticleTarget();

      this.particles = Array.from({ length: target }, (_, index) => {
        const rightBias = Math.random() > 0.42;
        return {
          x: rightBias ? 0.34 + Math.random() * 0.66 : Math.random() * 0.42,
          y: Math.random(),
          z: 0.35 + Math.random() * 0.95,
          size: 0.55 + Math.random() * 1.95,
          speed: 0.014 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.35 + Math.random() * 0.65,
          link: index % 4 === 0,
          streak: index % 8 === 0,
          width,
          height
        };
      });
    }

    start() {
      if (this.reduceMotion.matches || document.hidden || this.isRunning) {
        this.draw(performance.now());
        return;
      }

      this.isRunning = true;
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.animate);
    }

    stop() {
      this.isRunning = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }

    animate(time) {
      if (!this.isRunning) return;

      this.draw(time);
      this.rafId = requestAnimationFrame(this.animate);
    }

    draw(time) {
      if (!this.ctx) return;

      const width = this.canvas.width;
      const height = this.canvas.height;
      const ctx = this.ctx;
      const isLight = this.currentTheme === 'light';
      const motionScale = this.reduceMotion.matches ? 0 : 1;
      const t = time * 0.001;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      this.drawEnergyWaves(ctx, width, height, t, isLight, motionScale);
      this.drawParticles(ctx, width, height, t, isLight, motionScale);
      this.drawMeteors(ctx, width, height, t, isLight, motionScale);
      this.drawMicroFlares(ctx, width, height, t, isLight, motionScale);

      ctx.restore();
    }

    drawEnergyWaves(ctx, width, height, t, isLight, motionScale) {
      const centerX = width * (isLight ? 0.78 : 0.76);
      const centerY = height * (isLight ? 0.28 : 0.36);
      const colors = isLight
        ? ['rgba(255, 183, 49, 0.16)', 'rgba(0, 169, 207, 0.12)', 'rgba(255, 247, 193, 0.2)']
        : ['rgba(88, 154, 255, 0.12)', 'rgba(154, 110, 255, 0.13)', 'rgba(0, 212, 255, 0.14)'];

      for (let i = 0; i < 5; i += 1) {
        const offset = (i - 2) * height * 0.075;
        const phase = t * (0.08 + i * 0.01) * motionScale + i;

        ctx.beginPath();
        ctx.moveTo(-width * 0.08, height * (0.74 + i * 0.025) + Math.sin(phase) * 18);
        ctx.bezierCurveTo(
          width * 0.22,
          height * (0.62 + i * 0.02) + offset,
          width * 0.52,
          height * (0.68 - i * 0.04) - offset,
          centerX,
          centerY + offset * 0.55
        );
        ctx.bezierCurveTo(
          width * 0.92,
          centerY - height * 0.18 + offset,
          width * 1.05,
          height * (0.2 + i * 0.08),
          width * 1.12,
          height * (0.1 + i * 0.11)
        );
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = (isLight ? 1.2 : 0.9) * (1 + i * 0.15);
        ctx.globalAlpha = 0.52 + Math.sin(phase) * 0.16;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    drawParticles(ctx, width, height, t, isLight, motionScale) {
      const primary = isLight ? '255, 244, 204' : '190, 222, 255';
      const accent = isLight ? '0, 166, 198' : '0, 212, 255';
      const warm = isLight ? '255, 181, 54' : '151, 110, 255';

      this.particles.forEach((particle, index) => {
        const drift = t * particle.speed * motionScale;
        const x = ((particle.x + drift * 0.018) % 1) * width;
        const wave = Math.sin(t * 0.24 * motionScale + particle.phase) * 13 * particle.z;
        const y = ((particle.y + drift * 0.01) % 1) * height + wave;
        const flicker = 0.55 + Math.sin(t * (0.9 + particle.twinkle) * motionScale + particle.phase) * 0.32;
        const alpha = ((isLight ? 0.15 : 0.22) + particle.z * (isLight ? 0.2 : 0.34)) * flicker;
        const radius = particle.size * particle.z * (window.devicePixelRatio || 1) * (0.88 + flicker * 0.22);
        const color = index % 7 === 0 ? accent : index % 4 === 0 ? warm : primary;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (particle.streak && motionScale > 0) {
          ctx.beginPath();
          ctx.moveTo(x - 14 * particle.z, y + 5 * particle.z);
          ctx.lineTo(x + 26 * particle.z, y - 10 * particle.z);
          ctx.strokeStyle = `rgba(${color}, ${alpha * (isLight ? 0.38 : 0.5)})`;
          ctx.lineWidth = Math.max(0.75, radius * 0.42);
          ctx.stroke();
        }

        if (particle.link && index + 1 < this.particles.length) {
          const next = this.particles[index + 1];
          const nextX = ((next.x + drift * 0.014) % 1) * width;
          const nextY = ((next.y + drift * 0.008) % 1) * height;
          const distance = Math.hypot(nextX - x, nextY - y);

          if (distance < width * 0.18) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = `rgba(${accent}, ${isLight ? 0.045 : 0.075})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });
    }

    drawMeteors(ctx, width, height, t, isLight, motionScale) {
      if (motionScale === 0) return;

      const color = isLight ? '255, 222, 125' : '126, 196, 255';
      const accent = isLight ? '0, 166, 198' : '151, 110, 255';
      const count = this.mobileMotion.matches ? 2 : 4;

      for (let i = 0; i < count; i += 1) {
        const progress = ((t * (0.12 + i * 0.015) + i * 0.27) % 1);
        const ease = Math.sin(progress * Math.PI);
        const x = width * (0.08 + progress * 1.05);
        const y = height * (0.18 + i * 0.18 + progress * 0.12);
        const length = width * (0.05 + i * 0.012);
        const alpha = ease * (isLight ? 0.16 : 0.22);

        if (progress < 0.08 || progress > 0.92) continue;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - length, y + length * 0.28);
        ctx.strokeStyle = `rgba(${i % 2 ? accent : color}, ${alpha})`;
        ctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1) * (1.1 + i * 0.18));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 1.6 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha * 1.8})`;
        ctx.fill();
      }
    }

    drawMicroFlares(ctx, width, height, t, isLight, motionScale) {
      if (motionScale === 0) return;

      const points = isLight
        ? [
            [0.72, 0.34, '255, 228, 135'],
            [0.84, 0.18, '0, 174, 205'],
            [0.42, 0.72, '255, 189, 67']
          ]
        : [
            [0.76, 0.38, '142, 171, 255'],
            [0.88, 0.22, '0, 212, 255'],
            [0.32, 0.78, '143, 107, 255']
          ];

      points.forEach(([xRatio, yRatio, color], index) => {
        const pulse = 0.5 + Math.sin(t * (0.7 + index * 0.17) + index * 1.8) * 0.5;
        const x = width * xRatio + Math.sin(t * 0.18 + index) * width * 0.012;
        const y = height * yRatio + Math.cos(t * 0.16 + index) * height * 0.018;
        const radius = (26 + pulse * 34) * (window.devicePixelRatio || 1);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        gradient.addColorStop(0, `rgba(${color}, ${isLight ? 0.22 : 0.26})`);
        gradient.addColorStop(0.28, `rgba(${color}, ${isLight ? 0.12 : 0.16})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      this.removeMediaListener(this.reduceMotion, this.handleMotionPreference);
      this.removeMediaListener(this.mobileMotion, this.handleResize);

      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }

      if (this.root) {
        this.root.remove();
      }
    }
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.DynamicCosmicBackground = DynamicCosmicBackground;
  window.MarcosSite.initDynamicCosmicBackground = function () {
    if (window.MarcosSite.dynamicCosmicBackground) return window.MarcosSite.dynamicCosmicBackground;

    window.MarcosSite.dynamicCosmicBackground = new DynamicCosmicBackground().init();
    return window.MarcosSite.dynamicCosmicBackground;
  };
  window.MarcosSite.initCosmicLive = window.MarcosSite.initDynamicCosmicBackground;
  window.MarcosSite.initUniverseBackground = window.MarcosSite.initDynamicCosmicBackground;
})();
