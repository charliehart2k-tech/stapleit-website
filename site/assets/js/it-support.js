(() => {
  const dialog = document.getElementById('support-dialog');
  const closeButton = document.getElementById('support-dialog-close');
  const title = document.getElementById('support-dialog-title');
  const price = document.getElementById('support-dialog-price');
  const body = document.getElementById('support-dialog-body');
  const note = document.getElementById('support-dialog-note');

  if (!(dialog instanceof HTMLDialogElement) || !closeButton || !title || !price || !body || !note) return;

  const tierClasses = [
    'support-dialog--basic',
    'support-dialog--standard',
    'support-dialog--premium',
    'support-dialog--service'
  ];

  let previousFocus = null;

  const resetDialog = () => {
    dialog.classList.remove(...tierClasses);
    body.classList.remove('support-dialog-body--single');
    body.replaceChildren();
    title.textContent = '';
    price.textContent = '';
    price.hidden = true;
    note.textContent = '';
    note.hidden = true;
  };

  const openDialog = ({ heading, priceText = '', noteText = '', tier = 'service', content, single = false }) => {
    if (!heading || !content) return;

    previousFocus = document.activeElement;
    resetDialog();

    dialog.classList.add(`support-dialog--${tier}`);
    if (single) body.classList.add('support-dialog-body--single');

    title.textContent = heading;
    price.textContent = priceText;
    price.hidden = !priceText;
    note.textContent = noteText;
    note.hidden = !noteText;

    const clone = content.cloneNode(true);
    clone.querySelectorAll?.('.support-package-note').forEach(element => element.remove());
    body.append(...clone.childNodes);

    dialog.showModal();
    document.body.classList.add('support-dialog-open');
    closeButton.focus();
  };

  document.querySelectorAll('.support-package-details').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const content = details.querySelector('.support-package-fallback');
    const card = details.closest('.support-package-card');
    if (!summary || !content || !card) return;

    summary.setAttribute('aria-haspopup', 'dialog');

    summary.addEventListener('click', event => {
      event.preventDefault();
      details.open = false;

      openDialog({
        heading: details.dataset.dialogTitle || `${card.querySelector('h3')?.textContent?.trim() || 'Package'} inclusions`,
        priceText: details.dataset.dialogPrice || '',
        noteText: details.dataset.dialogNote || '',
        tier: details.dataset.tier || 'service',
        content,
        single: false
      });
    });
  });

  document.querySelectorAll('.support-extra-details').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const copy = details.querySelector('.support-extra-copy');
    const card = details.closest('.support-extra-card');
    if (!summary || !copy || !card) return;

    summary.setAttribute('aria-haspopup', 'dialog');

    summary.addEventListener('click', event => {
      event.preventDefault();
      details.open = false;

      const wrapper = document.createElement('div');
      wrapper.className = 'support-dialog-source';
      wrapper.append(copy.cloneNode(true));

      openDialog({
        heading: card.querySelector('h3')?.textContent?.trim() || 'Service details',
        priceText: card.querySelector('.support-extra-price')?.textContent?.trim() || '',
        tier: 'service',
        content: wrapper,
        single: true
      });
    });
  });

  closeButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('support-dialog-open');
    resetDialog();
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
  });
})();

(() => {
  const packGrid = document.getElementById('support-packs-grid');
  const moreWrap = document.querySelector('.support-packs-more');
  const moreButton = document.getElementById('support-packs-more');
  const lateCards = [...document.querySelectorAll('[data-pack-late]')];

  if (!packGrid || !moreWrap || !moreButton || !lateCards.length) return;

  moreButton.setAttribute('aria-controls', packGrid.id);
  moreButton.setAttribute('aria-expanded', 'false');

  lateCards.forEach(card => {
    card.hidden = true;
  });

  moreWrap.hidden = false;

  moreButton.addEventListener('click', () => {
    lateCards.forEach(card => {
      card.hidden = false;
      if (card.classList.contains('motion-ready')) card.classList.add('motion-in');
    });

    moreButton.setAttribute('aria-expanded', 'true');
    moreWrap.hidden = true;

    const firstRevealedControl = lateCards[0]?.querySelector('summary, button, a[href], [tabindex]:not([tabindex="-1"])');
    if (firstRevealedControl instanceof HTMLElement) {
      window.requestAnimationFrame(() => firstRevealedControl.focus());
    }
  });
})();

(() => {
  const section = document.querySelector('.support-onboarding[data-progress]');
  const progress = section?.querySelector('[data-support-progress]');
  const cards = section ? [...section.querySelectorAll('.support-step-card[data-step]')] : [];
  if (!section || !progress || cards.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopLayout = window.matchMedia('(min-width: 981px)');
  const timelineTimers = [];
  let timelinePlayed = false;

  const setProgress = step => {
    const value = String(Math.max(1, Math.min(cards.length, step)));
    section.dataset.progress = value;
    progress.dataset.progress = value;
  };

  const stopTimeline = () => {
    while (timelineTimers.length) window.clearTimeout(timelineTimers.pop());
  };

  const playTimeline = () => {
    if (timelinePlayed || reducedMotion.matches || !desktopLayout.matches) return;
    timelinePlayed = true;
    setProgress(1);
    timelineTimers.push(window.setTimeout(() => setProgress(2), 1200));
    timelineTimers.push(window.setTimeout(() => setProgress(3), 2400));
  };

  setProgress(1);

  cards.forEach(card => {
    const step = Number(card.dataset.step);
    const selectStep = () => {
      timelinePlayed = true;
      stopTimeline();
      setProgress(step);
    };
    card.addEventListener('pointerenter', selectStep);
    card.addEventListener('focusin', selectStep);
  });

  if (!('IntersectionObserver' in window)) return;

  const sectionObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      playTimeline();
      sectionObserver.disconnect();
    }
  }, { threshold: .36, rootMargin: '0px 0px -8% 0px' });
  sectionObserver.observe(section);

  const observer = new IntersectionObserver(entries => {
    if (desktopLayout.matches) return;

    const visibleCard = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleCard) setProgress(Number(visibleCard.target.dataset.step));
  }, {
    threshold: [.35, .55, .75],
    rootMargin: '-10% 0px -25% 0px'
  });

  cards.forEach(card => observer.observe(card));
})();

(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.support-step-card.motion-ready, .support-card.motion-ready').forEach(element => {
    element.addEventListener('transitionend', event => {
      if (event.propertyName === 'opacity') element.classList.add('motion-settled');
    }, { once: true });
  });
})();
