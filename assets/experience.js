(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('[data-hero-photo]');
  const slides = hero ? Array.from(hero.querySelectorAll('.scene-slide')) : [];
  const selectors = Array.from(document.querySelectorAll('[data-scene]'));
  const pause = document.querySelector('.scene-pause');
  const motionToggles = Array.from(document.querySelectorAll('.motion-toggle'));
  let scene = 0;
  let paused = reducedMotion.matches;
  let sceneTimer;
  const showScene = (index) => {
    if (!slides.length) return;
    scene = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === scene);
      slide.setAttribute('aria-hidden', String(i !== scene));
    });
    selectors.forEach((selector, i) => selector.setAttribute('aria-pressed', String(i === scene)));
    hero.dataset.image = slides[scene].getAttribute('src');
    hero.dataset.caption = slides[scene].alt;
    hero.setAttribute('aria-label', `Voir la photo : ${slides[scene].alt}`);
  };
  const updatePause = () => {
    const stopped = paused || reducedMotion.matches;
    if (pause) {
      pause.setAttribute('aria-pressed', String(stopped));
      pause.setAttribute(
        'aria-label',
        reducedMotion.matches
          ? 'Animations réduites'
          : stopped
            ? 'Relancer le diaporama'
            : 'Mettre le diaporama en pause'
      );
      pause.querySelector('span').textContent = stopped ? '▷' : 'Ⅱ';
      pause.disabled = reducedMotion.matches;
    }
    for (const toggle of motionToggles) {
      toggle.setAttribute('aria-pressed', String(stopped));
      toggle.textContent = reducedMotion.matches
        ? 'Animations réduites'
        : stopped
          ? 'Relancer les animations'
          : 'Mettre les animations en pause';
      toggle.disabled = reducedMotion.matches;
    }
    document.documentElement.classList.toggle('scene-paused', stopped);
    document.documentElement.classList.toggle('motion-paused', stopped);
  };
  const runSlideshow = () => {
    clearInterval(sceneTimer);
    if (slides.length && !paused && !document.hidden && !reducedMotion.matches) {
      sceneTimer = setInterval(() => {
        if (
          !document.querySelector('.photo-dialog')?.open &&
          !document.querySelector('.hero-visual')?.contains(document.activeElement)
        )
          showScene(scene + 1);
      }, 7000);
    }
    updatePause();
  };
  for (const selector of selectors)
    selector.addEventListener('click', () => {
      showScene(Number(selector.dataset.scene));
      runSlideshow();
    });
  pause?.addEventListener('click', () => {
    paused = !paused;
    runSlideshow();
  });
  for (const toggle of motionToggles)
    toggle.addEventListener('click', () => {
      paused = !paused;
      runSlideshow();
    });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) paused = true;
    runSlideshow();
  });
  document.addEventListener('visibilitychange', runSlideshow);
  showScene(0);
  runSlideshow();

  for (const gallery of document.querySelectorAll('[data-media-gallery]')) {
    const track = gallery.querySelector('.gallery-track');
    const previous = gallery.querySelector('[data-gallery-previous]');
    const next = gallery.querySelector('[data-gallery-next]');
    const count = gallery.querySelector('.gallery-count');
    const cards = Array.from(track.querySelectorAll('.media-card'));
    const refreshControls = () => {
      previous.disabled = track.scrollLeft < 3;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 3;
    };
    const move = (direction) =>
      track.scrollBy({
        left: direction * Math.max(260, track.clientWidth * 0.78),
        behavior: reducedMotion.matches || paused ? 'auto' : 'smooth',
      });
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', refreshControls, { passive: true });
    track.addEventListener('keydown', (event) => {
      if (event.target !== track) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });
    for (const filter of gallery.querySelectorAll('[data-filter]'))
      filter.addEventListener('click', () => {
        for (const other of gallery.querySelectorAll('[data-filter]'))
          other.setAttribute('aria-pressed', String(filter === other));
        const selected = filter.dataset.filter;
        cards.forEach((card) => {
          card.hidden = selected !== 'all' && card.dataset.category !== selected;
        });
        const visible = cards.filter((card) => !card.hidden).length;
        count.textContent = `${visible} photo${visible === 1 ? '' : 's'}`;
        track.scrollTo({ left: 0, behavior: 'auto' });
        refreshControls();
      });
    let start = null;
    let dragged = false;
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      start = { x: event.clientX, left: track.scrollLeft };
      dragged = false;
    });
    track.addEventListener('pointermove', (event) => {
      if (!start || !(event.buttons & 1)) return;
      const delta = event.clientX - start.x;
      if (Math.abs(delta) > 8) dragged = true;
      if (dragged) {
        event.preventDefault();
        track.classList.add('is-dragging');
        track.scrollLeft = start.left - delta;
      }
    });
    const endDrag = () => {
      start = null;
      track.classList.remove('is-dragging');
    };
    window.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('dragstart', (event) => event.preventDefault());
    track.addEventListener(
      'click',
      (event) => {
        if (dragged) {
          event.preventDefault();
          event.stopPropagation();
          dragged = false;
        }
      },
      true
    );
    window.addEventListener('resize', refreshControls, { passive: true });
    refreshControls();
  }

  const progress = document.querySelector('.reading-progress');
  let progressFrame = null;
  const renderProgress = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (progress)
      progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    progressFrame = null;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (progressFrame === null) progressFrame = requestAnimationFrame(renderProgress);
    },
    { passive: true }
  );
  window.addEventListener('resize', renderProgress, { passive: true });
  renderProgress();
})();
