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
      return 'Nothing you’ve told me so far points strongly to an add-on. That does not rule out other needs — it just means I would not add something based on this conversation alone.';
    }

    const parts = [];
    if (likely.length) {
      const names = naturalList(likely.map(key => packLabels[key]));
      const reasons = naturalList(likely.slice(0, 3).map(key => packReasons[key]));
      parts.push(`${names} ${likely.length === 1 ? 'stands' : 'stand'} out from what you’ve told me because ${reasons}.`);
    }
    if (unsure.length) {
      const names = naturalList(unsure.map(key => packLabels[key]));
      parts.push(`You were not sure about ${names}, so I’m treating ${unsure.length === 1 ? 'it' : 'them'} as worth clarifying rather than a definite recommendation.`);
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
