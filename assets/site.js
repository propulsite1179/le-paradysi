(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    toggle.querySelector('.menu-label').textContent = 'Menu';
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    toggle.querySelector('.menu-label').textContent = open ? 'Fermer' : 'Menu';
  });
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1061px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    }, {threshold: 0.12});
    document.querySelectorAll('.world, .section-heading, .signature-copy, .about-copy, .massage-feature, .spa-editorial, .gift-section, .treatment, .care-story-copy, .care-story-photo, .media-heading, .gift-photo-section, .result-preview, .treatment-visuals, .document-pair, .spa-documents').forEach(element => observer.observe(element));
  }

  const dialog = document.querySelector('.photo-dialog');
  let photoTrigger = null;
  let collection = [];
  let photoIndex = 0;
  const renderPhoto = index => {
    photoIndex = (index + collection.length) % collection.length;
    const source = collection[photoIndex];
    const photo = document.querySelector('#photo-full');
    photo.src = source.dataset.image;
    photo.alt = source.dataset.caption;
    document.querySelector('#photo-caption').textContent = source.dataset.caption;
    document.querySelector('#photo-counter').textContent = `${photoIndex + 1} / ${collection.length}`;
    dialog.querySelector('.photo-navigation').hidden = collection.length < 2;
  };
  const closePhoto = () => dialog?.close();
  for (const trigger of document.querySelectorAll('.image-zoom')) {
    trigger.addEventListener('click', event => {
      if (event.defaultPrevented) return;
      const group = trigger.closest('[data-gallery-group]');
      collection = group ? Array.from(group.querySelectorAll('.image-zoom')).filter(item => !item.closest('[hidden]')) : [trigger];
      if (!collection.length) collection = [trigger];
      photoTrigger = trigger;
      renderPhoto(collection.indexOf(trigger));
      dialog.showModal();
      document.body.classList.add('photo-is-open');
    });
  }
  dialog?.querySelector('.photo-previous').addEventListener('click', () => renderPhoto(photoIndex - 1));
  dialog?.querySelector('.photo-next').addEventListener('click', () => renderPhoto(photoIndex + 1));
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); renderPhoto(photoIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); renderPhoto(photoIndex + 1); }
  });
  dialog?.querySelector('.photo-close').addEventListener('click', closePhoto);
  dialog?.addEventListener('click', event => { if (event.target === dialog) closePhoto(); });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('photo-is-open');
    photoTrigger?.focus({preventScroll: true});
  });

  const form = document.querySelector('#appointment-form');
  if (!form) return;
  const service = form.elements.namedItem('service');
  const preferred = new URLSearchParams(window.location.search).get('soin');
  if (preferred) {
    const known = Array.from(service.options).find(option => option.value === preferred);
    if (known) {
      service.value = known.value;
    } else {
      // Query parameters can describe a specific care, but never become markup.
      const option = new Option(preferred.slice(0, 100), preferred.slice(0, 100), true, true);
      service.add(option);
    }
  }
  const result = document.querySelector('#sms-result');
  const output = document.querySelector('#sms-text');
  const smsLink = document.querySelector('#sms-link');
  const resetResult = () => {
    result.hidden = true;
    smsLink.href = 'sms:+33629531608';
    output.textContent = '';
  };
  form.addEventListener('input', resetResult);
  form.addEventListener('change', resetResult);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.namedItem('firstName').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    form.elements.namedItem('firstName').setCustomValidity(name ? '' : 'Indiquez votre prénom.');
    form.elements.namedItem('message').setCustomValidity(message ? '' : 'Ajoutez votre demande ou vos disponibilités.');
    if (!form.reportValidity()) return;
    const text = `Bonjour Ysidia, je m’appelle ${name}. Je vous contacte pour : ${service.value}. ${message}`;
    output.textContent = text;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    smsLink.href = `sms:+33629531608${iOS ? '&' : '?'}body=${encodeURIComponent(text)}`;
    result.hidden = false;
    result.setAttribute('tabindex', '-1');
    result.focus({preventScroll: true});
    result.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest'});
  });
  for (const field of form.querySelectorAll('input, textarea')) {
    field.addEventListener('input', () => field.setCustomValidity(''));
  }
})();
