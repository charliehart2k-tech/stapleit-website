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
  const aiPanel = form.querySelector('[data-packs-ai]');
  const aiCopy = form.querySelector('[data-packs-ai-copy]');

  if (
    !stage || !questions.length || !count || !(progress instanceof HTMLProgressElement) ||
    !(backButton instanceof HTMLButtonElement) || !(nextButton instanceof HTMLButtonElement) ||
    !results || !resultsHeading || !resultsSummary || !resultsEmpty ||
    !(reviewButton instanceof HTMLButtonElement) || resultRows.length !== questions.length || !aiPanel || !aiCopy
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
    aiPanel.hidden = true;
    updateControls();

    if (focus) {
      window.requestAnimationFrame(() => questions[currentQuestion].querySelector('legend')?.focus());
    }
  };

  const resultSummaryText = (likelyCount, considerCount) => {
    const packWord = countValue => countValue === 1 ? 'pack' : 'packs';

    if (likelyCount && considerCount) {
      return `${likelyCount} ${packWord(likelyCount)} look useful, with ${considerCount} more worth a chat. You can explore them below.`;
    }
    if (likelyCount) {
      return `${likelyCount} ${packWord(likelyCount)} look useful for the way you work. You can explore them below.`;
    }
    if (considerCount) {
      return `${considerCount} ${packWord(considerCount)} may be worth a chat because you selected Not sure.`;
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
        status.textContent = 'Looks useful';
      } else {
        considerCount += 1;
        row.dataset.match = 'consider';
        status.textContent = 'Worth a chat';
      }
    });

    resultsSummary.textContent = resultSummaryText(likelyCount, considerCount);
    resultsEmpty.hidden = likelyCount + considerCount > 0;
    const packSummary = resultRows
      .filter(row => !row.hidden)
      .map(row => `${row.querySelector('h4')?.textContent?.trim()}: ${row.querySelector('[data-pack-result-status]')?.textContent?.trim()}`)
      .filter(Boolean);
    window.stapleitPlanner = window.stapleitPlanner || {};
    window.stapleitPlanner.packs = packSummary;
    window.dispatchEvent(new CustomEvent('stapleit:planner-update'));
    window.stapleitTrack?.('pack_finder_completed');
    const answerPayload = Object.fromEntries(questions.map(question => [question.dataset.packKey, selectedAnswer(question)]));
    window.stapleitExplainPlanner?.('packs', answerPayload, aiPanel, aiCopy);
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
    if (currentQuestion === 0) window.stapleitTrack?.('pack_finder_started');
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
  const endpoint = '/wp-admin/admin-ajax.php';
  const sent = new Set();
  window.stapleitTrack = eventName => {
    if (!/^(package_finder_started|package_finder_completed|pack_finder_started|pack_finder_completed|cost_estimate_updated|planner_handoff_clicked|package_ai_explained|pack_ai_explained)$/.test(eventName) || sent.has(eventName)) return;
    sent.add(eventName);
    const body = new URLSearchParams({ action: 'stapleit_track_planner_event', event: eventName });
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, body);
    else fetch(endpoint, { method: 'POST', body, credentials: 'same-origin', keepalive: true }).catch(() => {});
  };
})();

(() => {
  const naturalList = items => {
    if (items.length < 2) return items[0] || '';
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
  };

  const packageExplanation = answers => {
    const team = String(answers?.team || '');
    const protection = String(answers?.security || '');
    const requirements = String(answers?.requirements || '');

    if (team === '1') {
      return 'Because it’s just you, a five-user package would not make sense. Tailored support can focus on the devices, Microsoft 365 and day-to-day help you actually use.';
    }
    if (team === '4') {
      return 'Because you have 2–4 people, the five-user minimum would not fit cleanly. A tailored plan can match support and security to the team you actually have.';
    }

    let recommended = protection;
    if (requirements === 'yes' && recommended === 'basic') recommended = 'standard';

    if (recommended === 'basic') {
      return 'Basic fits because you want straightforward day-to-day support, monitoring, patching and device management without extra managed security layers.';
    }
    if (recommended === 'standard') {
      return requirements === 'yes'
        ? 'Standard fits because you need stronger protection and security evidence, adding managed endpoint, email, backup and identity controls to day-to-day support.'
        : 'Standard fits because you want day-to-day support with stronger managed security, cloud backup and identity protection.';
    }
    return 'Premium fits because you want the fullest managed package, including Microsoft 365 Business Premium and enhanced Microsoft security and data protection.';
  };

  const packLabels = {
    server: 'Server',
    azure: 'Azure',
    network: 'Network',
    security: 'Security',
    governance: 'Governance & compliance',
    'cyber-essentials': 'Cyber Essentials',
    ai: 'AI',
    strategy: 'Strategy',
    'disaster-recovery': 'Disaster recovery'
  };
  const packReasons = {
    server: 'you run a physical Windows server',
    azure: 'you use systems or virtual machines in Azure',
    network: 'you rely on managed Wi-Fi, switches or a dedicated firewall',
    security: 'you want stronger protection beyond the core support package',
    governance: 'you need policies, documentation or security evidence',
    'cyber-essentials': 'Cyber Essentials is a requirement or goal',
    ai: 'you are introducing AI tools for staff',
    strategy: 'you want regular planning, budgeting or a technology roadmap',
    'disaster-recovery': 'you need a structured recovery plan for critical systems and data'
  };

  const packExplanation = answers => {
    const keys = Object.keys(packLabels);
    const likely = keys.filter(key => answers?.[key] === 'yes');
    const unsure = keys.filter(key => answers?.[key] === 'unsure');

    if (!likely.length && !unsure.length) {
      return 'Nothing in your answers points strongly to an add-on right now. That is a useful result in itself — it means the core support package may already cover what you need without adding extra services.';
    }

    const parts = [];
    if (likely.length) {
      const names = naturalList(likely.map(key => packLabels[key]));
      const reasons = naturalList(likely.slice(0, 3).map(key => packReasons[key]));
      parts.push(`${names} ${likely.length === 1 ? 'stands' : 'stand'} out because ${reasons}.`);
    }
    if (unsure.length) {
      const names = naturalList(unsure.map(key => packLabels[key]));
      parts.push(`You marked ${names} as Not sure, so ${unsure.length === 1 ? 'it is' : 'they are'} shown as worth discussing rather than a definite recommendation.`);
    }
    return parts.join(' ');
  };

  const deterministicExplanation = (plannerType, answers) => plannerType === 'package'
    ? packageExplanation(answers)
    : packExplanation(answers);

  window.stapleitExplainPlanner = async (plannerType, answers, panel, copy) => {
    if (!(panel instanceof HTMLElement) || !(copy instanceof HTMLElement)) return;
    const requestKey = JSON.stringify([plannerType, answers]);
    if (panel.dataset.requestKey === requestKey) {
      panel.hidden = false;
      return;
    }

    const immediateCopy = deterministicExplanation(plannerType, answers);
    panel.dataset.requestKey = requestKey;
    panel.hidden = false;
    panel.classList.remove('is-loading');
    copy.textContent = immediateCopy;

    try {
      const body = new URLSearchParams({
        action: 'stapleit_cora_planner_explain',
        planner_type: plannerType,
        answers: JSON.stringify(answers)
      });
      const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        credentials: 'same-origin'
      });
      const payload = await response.json();
      if (!response.ok || payload?.ok === false) throw new Error('Cora could not add an explanation.');

      if (payload?.mode === 'local-ai' && typeof payload.reply === 'string' && payload.reply.trim().length > 24) {
        copy.textContent = payload.reply.trim();
        panel.dataset.mode = 'local-ai';
        window.stapleitTrack?.(plannerType === 'package' ? 'package_ai_explained' : 'pack_ai_explained');
      } else {
        panel.dataset.mode = 'knowledge-guide';
      }
    } catch {
      panel.dataset.mode = 'unavailable';
    }
  };
})();

(() => {
  const form = document.querySelector('[data-package-finder]');
  if (!(form instanceof HTMLFormElement)) return;
  const questions = [...form.querySelectorAll('[data-package-question]')];
  const count = form.querySelector('[data-package-count]');
  const progress = form.querySelector('[data-package-progress]');
  const back = form.querySelector('[data-package-back]');
  const next = form.querySelector('[data-package-next]');
  const result = form.querySelector('[data-package-result]');
  const title = form.querySelector('[data-package-title]');
  const reason = form.querySelector('[data-package-reason]');
  const review = form.querySelector('[data-package-review]');
  const staff = form.querySelector('[data-cost-staff]');
  const tier = form.querySelector('[data-cost-tier]');
  const total = form.querySelector('[data-cost-total]');
  const note = form.querySelector('[data-cost-note]');
  const aiPanel = form.querySelector('[data-package-ai]');
  const aiCopy = form.querySelector('[data-package-ai-copy]');
  if (!questions.length || !count || !(progress instanceof HTMLProgressElement) || !(back instanceof HTMLButtonElement) || !(next instanceof HTMLButtonElement) || !result || !title || !reason || !(review instanceof HTMLButtonElement) || !(staff instanceof HTMLInputElement) || !(tier instanceof HTMLSelectElement) || !total || !note || !aiPanel || !aiCopy) return;

  const rates = { basic: 35, standard: 55, premium: 75 };
  let current = 0;
  const answer = question => question.querySelector('input:checked')?.value || '';
  const updateControls = () => {
    count.textContent = `Question ${current + 1} of ${questions.length}`;
    progress.value = current + 1;
    back.hidden = current === 0;
    next.disabled = !answer(questions[current]);
    next.textContent = current === questions.length - 1 ? 'See recommendation' : 'Continue';
  };
  const show = (index, focus = true) => {
    current = Math.max(0, Math.min(questions.length - 1, index));
    questions.forEach((question, questionIndex) => { question.hidden = questionIndex !== current; });
    result.hidden = true;
    aiPanel.hidden = true;
    updateControls();
    if (focus) requestAnimationFrame(() => questions[current].querySelector('legend')?.focus());
  };
  const calculate = () => {
    const people = Math.max(5, Math.min(500, Number.parseInt(staff.value, 10) || 5));
    staff.value = String(people);
    const monthly = people * rates[tier.value];
    total.textContent = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(monthly);
    window.stapleitPlanner = window.stapleitPlanner || {};
    window.stapleitPlanner.package = `${tier.options[tier.selectedIndex].text.split(' — ')[0]} for ${people} staff, estimated ${total.textContent} per month`;
    window.dispatchEvent(new CustomEvent('stapleit:planner-update'));
  };
  const showResult = () => {
    const team = answer(questions[0]);
    const protection = answer(questions[1]);
    const evidence = answer(questions[2]);
    if (team === '1' || team === '4') {
      title.textContent = team === '1' ? 'Sole trader support' : 'Tailored support';
      reason.textContent = 'Our published per-person packages start at five staff, so a short conversation will give you a more honest answer than a made-up online price.';
      staff.closest('[data-cost-calculator]').hidden = true;
      note.textContent = 'Price on application. We will confirm the scope before you commit to anything.';
      window.stapleitPlanner = window.stapleitPlanner || {};
      window.stapleitPlanner.package = `${title.textContent} — price on application`;
    } else {
      let recommended = protection;
      if (evidence === 'yes' && recommended === 'basic') recommended = 'standard';
      tier.value = recommended;
      staff.value = team === '25' ? '25' : '10';
      staff.closest('[data-cost-calculator]').hidden = false;
      note.textContent = 'Based on published per-person pricing. Add-ons and projects are priced separately; your written proposal confirms the final scope and price.';
      title.textContent = `${recommended[0].toUpperCase()}${recommended.slice(1)}`;
      reason.textContent = evidence === 'yes'
        ? 'Your need to provide security evidence makes managed protection and regular reviews important, as well as day-to-day support.'
        : recommended === 'basic' ? 'Your answers point to straightforward day-to-day support without unnecessary extras.'
          : recommended === 'standard' ? 'You want day-to-day support with stronger security, backup and identity protection.'
            : 'You want the most complete package, including Microsoft 365 Business Premium and enhanced protection.';
      calculate();
    }
    questions.forEach(question => { question.hidden = true; });
    result.hidden = false;
    const answerPayload = Object.fromEntries(questions.map(question => [question.dataset.packageKey, answer(question)]));
    window.stapleitExplainPlanner?.('package', answerPayload, aiPanel, aiCopy);
    window.dispatchEvent(new CustomEvent('stapleit:planner-update'));
    window.stapleitTrack?.('package_finder_completed');
    requestAnimationFrame(() => title.focus());
  };
  questions.forEach(question => question.addEventListener('change', updateControls));
  next.addEventListener('click', () => {
    if (!answer(questions[current])) return;
    if (current === 0) window.stapleitTrack?.('package_finder_started');
    if (current === questions.length - 1) showResult(); else show(current + 1);
  });
  back.addEventListener('click', () => show(current - 1));
  review.addEventListener('click', () => show(questions.length - 1));
  staff.addEventListener('change', () => { calculate(); window.stapleitTrack?.('cost_estimate_updated'); });
  tier.addEventListener('change', () => { calculate(); window.stapleitTrack?.('cost_estimate_updated'); });
  form.addEventListener('submit', event => event.preventDefault());
  form.classList.add('is-enhanced');
  show(0, false);
})();

(() => {
  const handoff = document.querySelector('[data-planner-handoff]');
  const consent = handoff?.querySelector('[data-planner-consent]');
  const audit = handoff?.querySelector('[data-planner-audit]');
  if (!handoff || !(consent instanceof HTMLInputElement) || !(audit instanceof HTMLAnchorElement)) return;
  const summary = () => {
    const planner = window.stapleitPlanner || {};
    const lines = ['IT Support planner summary'];
    if (planner.package) lines.push(`Package: ${planner.package}`);
    if (planner.packs?.length) lines.push(`Possible add-ons: ${planner.packs.join('; ')}`);
    if (planner.adviser) lines.push(`Service adviser: ${planner.adviser}`);
    return lines.length > 1 ? lines.join('\n') : '';
  };
  window.addEventListener('stapleit:planner-update', () => { handoff.hidden = !summary(); });
  audit.addEventListener('click', event => {
    if (!consent.checked) {
      event.preventDefault();
      consent.setCustomValidity('Please confirm that you want to include these recommendations.');
      consent.reportValidity();
      return;
    }
    consent.setCustomValidity('');
    sessionStorage.setItem('stapleitPlannerSummary', summary());
    window.stapleitTrack?.('planner_handoff_clicked');
  });
  consent.addEventListener('change', () => consent.setCustomValidity(''));
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
