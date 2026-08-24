(() => {
  const standard=document.querySelector('.support-standard');
  const toggle=standard?.querySelector('[data-standard-toggle]');
  if(!standard||!toggle)return;
  standard.classList.add('is-enhanced');
  toggle.addEventListener('click',()=>{
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    standard.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show fewer inclusions' : 'Show all standard inclusions';
  });
})();

(() => {
  const dialog = document.getElementById('support-dialog');
  const closeButton = document.getElementById('support-dialog-close');
  const title = document.getElementById('support-dialog-title');
  const price = document.getElementById('support-dialog-price');
  const body = document.getElementById('support-dialog-body');
  const note = document.getElementById('support-dialog-note');

  if (!(dialog instanceof HTMLDialogElement) || !closeButton || !title || !price || !body || !note) return;

  const tierClasses = [
    'support-dialog--sole',
    'support-dialog--basic',
    'support-dialog--standard',
    'support-dialog--premium',
    'support-dialog--service'
  ];

  let previousFocus = null;
  let movedContentSource = null;
  let movedContentNodes = [];

  const resetDialog = () => {
    if (movedContentSource && movedContentNodes.length) {
      movedContentSource.append(...movedContentNodes);
    }
    movedContentSource = null;
    movedContentNodes = [];
    dialog.classList.remove(...tierClasses);
    body.classList.remove('support-dialog-body--single', 'support-dialog-body--form');
    body.replaceChildren();
    title.textContent = '';
    price.textContent = '';
    price.hidden = true;
    note.textContent = '';
    note.hidden = true;
  };

  const openDialog = ({
    heading,
    priceText = '',
    noteText = '',
    tier = 'service',
    content,
    single = false,
    moveContent = false,
    form = false
  }) => {
    if (!heading || !content) return;

    previousFocus = document.activeElement;
    resetDialog();

    dialog.classList.add(`support-dialog--${tier}`);
    if (single) body.classList.add('support-dialog-body--single');
    if (form) body.classList.add('support-dialog-body--form');

    title.textContent = heading;
    price.textContent = priceText;
    price.hidden = !priceText;
    note.textContent = noteText;
    note.hidden = !noteText;

    if (moveContent) {
      movedContentSource = content;
      movedContentNodes = [...content.childNodes];
      body.append(...movedContentNodes);
    } else {
      const clone = content.cloneNode(true);
      clone.querySelectorAll?.('.support-package-note').forEach(element => element.remove());
      body.append(...clone.childNodes);
    }

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
        single: details.dataset.dialogForm === 'true',
        moveContent: details.dataset.dialogForm === 'true',
        form: details.dataset.dialogForm === 'true'
      });
    });
  });

  document.querySelectorAll('.support-extra-details').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const copy = details.querySelector('.support-extra-copy');
    const card = details.closest('.support-extra-card');
    if (!summary || !copy || !card) return;
    const isPack = copy.classList.contains('support-pack-copy');

    summary.setAttribute('aria-haspopup', 'dialog');

    summary.addEventListener('click', event => {
      event.preventDefault();
      details.open = false;

      const wrapper = document.createElement('div');
      wrapper.className = isPack
        ? 'support-dialog-source support-dialog-source--pack'
        : 'support-dialog-source';
      wrapper.append(copy.cloneNode(true));

      openDialog({
        heading: card.querySelector('h3')?.textContent?.trim() || 'Service details',
        priceText: isPack ? 'Priced on application' : '',
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
  const endpoint = '/wp-admin/admin-ajax.php';
  const sent = new Set();
  window.stapleitTrack = eventName => {
    if (!/^(pack_finder_started|pack_finder_completed)$/.test(eventName) || sent.has(eventName)) return;
    sent.add(eventName);
    const body = new URLSearchParams({ action: 'stapleit_track_planner_event', event: eventName });
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, body);
    else fetch(endpoint, { method: 'POST', body, credentials: 'same-origin', keepalive: true }).catch(() => {});
  };
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

  const revealLatePacks = ({ focusFirst = false } = {}) => {
    lateCards.forEach(card => {
      card.hidden = false;
      if (card.classList.contains('motion-ready')) card.classList.add('motion-in');
    });

    moreButton.setAttribute('aria-expanded', 'true');
    moreWrap.hidden = true;

    const firstRevealedControl = focusFirst
      ? lateCards[0]?.querySelector('summary, button, a[href], [tabindex]:not([tabindex="-1"])')
      : null;
    if (firstRevealedControl instanceof HTMLElement) {
      window.requestAnimationFrame(() => firstRevealedControl.focus());
    }
  };

  moreButton.addEventListener('click', () => revealLatePacks({ focusFirst: true }));

  document.querySelectorAll('a[href^="#support-pack-"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target instanceof HTMLElement && target.hidden) revealLatePacks();
    });
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
    timelineTimers.push(window.setTimeout(() => setProgress(2), 1800));
    timelineTimers.push(window.setTimeout(() => setProgress(3), 3600));
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

  let narrowProgressFrame = 0;
  const updateNarrowProgress = () => {
    narrowProgressFrame = 0;
    if (desktopLayout.matches) return;
    const readingLine = window.innerHeight * .48;
    const visibleCards = cards
      .map(card => {
        const rect = card.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        return { card, visible, distance: Math.abs((rect.top + rect.bottom) / 2 - readingLine) };
      })
      .filter(item => item.visible)
      .sort((a, b) => a.distance - b.distance);
    if (visibleCards[0]) setProgress(Number(visibleCards[0].card.dataset.step));
  };
  const scheduleNarrowProgress = () => {
    if (narrowProgressFrame) return;
    narrowProgressFrame = window.requestAnimationFrame(updateNarrowProgress);
  };

  window.addEventListener('scroll', scheduleNarrowProgress, { passive: true });
  window.addEventListener('resize', scheduleNarrowProgress, { passive: true });
  desktopLayout.addEventListener?.('change', scheduleNarrowProgress);
  scheduleNarrowProgress();
})();

(() => {
  const more = document.querySelector('[data-package-more]');
  const tailored = document.querySelector('[data-package-tailored-wrap]');
  if (!(more instanceof HTMLButtonElement) || !(tailored instanceof HTMLElement)) return;
  tailored.hidden = true;
  more.hidden = false;
  const setExpanded = expanded => {
    tailored.hidden = !expanded;
    more.setAttribute('aria-expanded', String(expanded));
    more.textContent = expanded ? 'Show less' : 'See more';
  };
  more.addEventListener('click', () => setExpanded(more.getAttribute('aria-expanded') !== 'true'));
})();
