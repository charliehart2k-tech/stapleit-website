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
  const form = document.querySelector('[data-pack-finder]');
  if (!(form instanceof HTMLFormElement)) return;

  const stage = form.querySelector('[data-pack-finder-stage]');
  const questions = [...form.querySelectorAll('[data-pack-question]')];
  const count = form.querySelector('[data-pack-finder-count]');
  const progress = form.querySelector('[data-pack-finder-progress]');
  const backButton = form.querySelector('[data-pack-finder-back]');
  const nextButton = form.querySelector('[data-pack-finder-next]');
  const results = form.querySelector('[data-pack-results]');
  const resultsHeading = form.querySelector('#support-pack-results-title');
  const resultsSummary = form.querySelector('[data-pack-results-summary]');
  const resultsEmpty = form.querySelector('[data-pack-results-empty]');
  const reviewButton = form.querySelector('[data-pack-finder-review]');
  const resultRows = [...form.querySelectorAll('[data-pack-result]')];

  if (
    !stage || !questions.length || !count || !(progress instanceof HTMLProgressElement) ||
    !(backButton instanceof HTMLButtonElement) || !(nextButton instanceof HTMLButtonElement) ||
    !results || !resultsHeading || !resultsSummary || !resultsEmpty ||
    !(reviewButton instanceof HTMLButtonElement) || resultRows.length !== questions.length
  ) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentQuestion = 0;

  const selectedAnswer = question => question.querySelector('input[type="radio"]:checked')?.value || '';

  const updateControls = () => {
    count.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    progress.value = currentQuestion + 1;
    progress.textContent = `${currentQuestion + 1} of ${questions.length}`;
    backButton.hidden = currentQuestion === 0;
    nextButton.disabled = !selectedAnswer(questions[currentQuestion]);
    nextButton.textContent = currentQuestion === questions.length - 1 ? 'See my results' : 'Continue';
  };

  const showQuestion = (index, { direction = 'forward', focus = true } = {}) => {
    currentQuestion = Math.max(0, Math.min(questions.length - 1, index));
    form.dataset.packDirection = direction;

    questions.forEach((question, questionIndex) => {
      question.hidden = questionIndex !== currentQuestion;
    });

    stage.hidden = false;
    results.hidden = true;
    updateControls();

    if (focus) {
      window.requestAnimationFrame(() => questions[currentQuestion].querySelector('legend')?.focus());
    }
  };

  const resultSummaryText = (likelyCount, considerCount) => {
    const packWord = countValue => countValue === 1 ? 'pack' : 'packs';

    if (likelyCount && considerCount) {
      return `${likelyCount} ${packWord(likelyCount)} look relevant, with ${considerCount} more worth discussing. You can explore the reasoning below.`;
    }
    if (likelyCount) {
      return `${likelyCount} ${packWord(likelyCount)} look relevant to the way you work. You can explore the reasoning below.`;
    }
    if (considerCount) {
      return `${considerCount} ${packWord(considerCount)} may be worth discussing because you selected Not sure.`;
    }
    return 'Nothing in your answers points clearly to an add-on pack at the moment.';
  };

  const showResults = () => {
    let likelyCount = 0;
    let considerCount = 0;

    resultRows.forEach(row => {
      const key = row.dataset.packResult;
      const question = questions.find(candidate => candidate.dataset.packKey === key);
      const answer = question ? selectedAnswer(question) : 'no';
      const status = row.querySelector('[data-pack-result-status]');
      const matched = answer === 'yes' || answer === 'unsure';

      row.hidden = !matched;
      if (!matched || !status) return;

      if (answer === 'yes') {
        likelyCount += 1;
        row.dataset.match = 'likely';
        status.textContent = 'Likely useful';
      } else {
        considerCount += 1;
        row.dataset.match = 'consider';
        status.textContent = 'Worth discussing';
      }
    });

    resultsSummary.textContent = resultSummaryText(likelyCount, considerCount);
    resultsEmpty.hidden = likelyCount + considerCount > 0;
    stage.hidden = true;
    results.hidden = false;
    delete form.dataset.packDirection;
    window.requestAnimationFrame(() => resultsHeading.focus({ preventScroll: false }));
  };

  questions.forEach(question => {
    question.addEventListener('change', updateControls);
  });

  nextButton.addEventListener('click', () => {
    if (!selectedAnswer(questions[currentQuestion])) return;
    if (currentQuestion === questions.length - 1) {
      showResults();
      return;
    }
    showQuestion(currentQuestion + 1);
  });

  backButton.addEventListener('click', () => showQuestion(currentQuestion - 1, { direction: 'back' }));
  reviewButton.addEventListener('click', () => showQuestion(questions.length - 1, { direction: 'back' }));

  form.addEventListener('submit', event => event.preventDefault());

  questions.forEach((question, index) => {
    question.hidden = index !== 0;
  });
  results.hidden = true;
  form.classList.add('is-enhanced');
  showQuestion(0, { focus: false });

  if (reducedMotion.matches) delete form.dataset.packDirection;
})();

(() => {
  const packGrid = document.getElementById('support-packs-grid');
  const moreWrap = document.querySelector('.support-packs-more');
  const moreButton = document.getElementById('support-packs-more');
  const lateCards = [...document.querySelectorAll('[data-pack-late]')];

  if (!packGrid || !moreWrap || !moreButton || !lateCards.length) return;

  moreButton.setAttribute('aria-controls', packGrid.id);
  moreButton.setAttribute('aria-expanded', 'false');
  moreButton.textContent = `Show ${lateCards.length} more ${lateCards.length === 1 ? 'pack' : 'packs'}`;

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
