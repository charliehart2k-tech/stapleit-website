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
  if (!section || !progress) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;

  const setProgress = step => {
    const value = String(step);
    section.dataset.progress = value;
    progress.dataset.progress = value;
  };

  const start = () => {
    if (started) return;
    started = true;

    if (reducedMotion.matches) {
      setProgress(3);
      return;
    }

    [1, 2, 3].forEach((step, index) => {
      window.setTimeout(() => setProgress(step), index * 280);
    });
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    start();
    observer.disconnect();
  }, {
    threshold: .2,
    rootMargin: '0px 0px -8% 0px'
  });

  observer.observe(section);
})();
