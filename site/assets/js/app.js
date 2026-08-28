(() => {
  const toggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopDetails = [...document.querySelectorAll('.primary-nav .nav-details')];
  const mobileDetails = [...document.querySelectorAll('.mobile-menu details')];

  const closeMobile = () => {
    if (!toggle || !mobileMenu) return;
    mobileMenu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    mobileDetails.forEach(item => { item.open = false; });
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
    if (open) mobileDetails.forEach(item => { item.open = false; });
  });

  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobile));

  desktopDetails.forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    desktopDetails.forEach(other => { if (other !== item) other.open = false; });
  }));

  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.nav-details')) {
      desktopDetails.forEach(item => { item.open = false; });
    }

    if (
      toggle?.getAttribute('aria-expanded') === 'true' &&
      !event.target.closest('.site-header')
    ) {
      closeMobile();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    desktopDetails.forEach(item => { item.open = false; });
    closeMobile();
  });
})();

(async () => {
  if (document.querySelector('[data-cora]')) return;

  let coraEnabled = window.STAPLEIT_CORA_ENABLED === true;
  if (!coraEnabled && window.STAPLEIT_CORA_ENABLED !== false) {
    try {
      const statusResponse = await fetch('/wp-admin/admin-ajax.php?action=stapleit_cora_status', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const statusPayload = await statusResponse.json();
      coraEnabled = statusResponse.ok && statusPayload?.ok === true && statusPayload?.enabled === true;
    } catch {
      coraEnabled = false;
    }
  }

  if (!coraEnabled) {
    const e = (tag, className, text = '') => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };

    const root = e('aside', 'cora cora--paused');
    root.dataset.cora = '';
    root.setAttribute('aria-label', 'Cora — coming soon');

    const panel = e('section', 'cora-panel');
    panel.id = 'cora-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'cora-title');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;

    const header = e('header', 'cora-header');
    const orb = e('span', 'cora-orb cora-orb--header');
    orb.setAttribute('aria-hidden', 'true');
    const identity = e('div', 'cora-identity');
    const title = e('strong', '', 'Cora');
    title.id = 'cora-title';
    const subtitle = e('span', '', 'Coming soon');
    identity.append(title, subtitle);
    const close = e('button', 'cora-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close Cora');
    header.append(orb, identity, close);

    const messages = e('div', 'cora-messages');
    messages.setAttribute('role', 'status');
    messages.setAttribute('aria-live', 'polite');
    messages.append(e('div', 'cora-message cora-message--assistant', 'Cora is coming soon. We’re finishing the new Staple IT website first, then we’ll bring her back online.'));

    const toggle = e('button', 'cora-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    const toggleOrb = e('span', 'cora-orb cora-orb--toggle');
    toggleOrb.setAttribute('aria-hidden', 'true');
    const label = e('span', 'cora-toggle-label', 'Cora · Coming soon');
    toggle.append(toggleOrb, label);

    panel.append(header, messages);
    root.append(panel, toggle);
    document.body.append(root);

    let previousFocus = null;
    const setOpen = open => {
      if (root.classList.contains('is-open') === open) return;
      root.classList.toggle('is-open', open);
      root.classList.toggle('is-closed', !open);
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        previousFocus = document.activeElement;
        requestAnimationFrame(() => close.focus({ preventScroll: true }));
      } else if (previousFocus instanceof HTMLElement) {
        setTimeout(() => previousFocus?.focus({ preventScroll: true }), 260);
        previousFocus = null;
      }
    };

    root.classList.add('is-closed');
    toggle.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-cora-open]');
      if (!trigger) return;
      event.preventDefault();
      setOpen(true);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
    });
    return;
  }

  const element = (tag, className, text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const root = element('aside', 'cora');
  root.dataset.cora = '';
  root.setAttribute('aria-label', 'Chat to Cora');

  const panel = element('section', 'cora-panel');
  panel.id = 'cora-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'cora-title');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;

  const header = element('header', 'cora-header');
  const headerOrb = element('span', 'cora-orb cora-orb--header');
  headerOrb.setAttribute('aria-hidden', 'true');
  const identity = element('div', 'cora-identity');
  const title = element('strong', '', 'Cora');
  title.id = 'cora-title';
  const subtitle = element('span', '', 'Ask me about support, security or Microsoft 365');
  identity.append(title, subtitle);
  const close = element('button', 'cora-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close Cora');
  header.append(headerOrb, identity, close);

  const messages = element('div', 'cora-messages');
  messages.setAttribute('role', 'log');
  messages.setAttribute('aria-live', 'polite');
  messages.setAttribute('aria-relevant', 'additions');

  const suggestions = element('div', 'cora-suggestions');
  const initialSuggestions = [
    'Which support package suits us?',
    'How could you improve our security?',
    'We need help with Microsoft 365'
  ];

  const form = element('form', 'cora-form');
  const input = element('textarea', '');
  input.name = 'message';
  input.rows = 1;
  input.maxLength = 800;
  input.required = true;
  input.placeholder = 'Ask Cora about your IT…';
  input.setAttribute('aria-label', 'Message Cora');
  const send = element('button', 'cora-send', 'Send');
  send.type = 'submit';
  const privacy = element('p', 'cora-privacy', 'Please don’t share passwords or sensitive information. Anything specific to your setup will be confirmed by a person.');
  form.append(input, send, privacy);

  const toggle = element('button', 'cora-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  const toggleOrb = element('span', 'cora-orb cora-orb--toggle');
  toggleOrb.setAttribute('aria-hidden', 'true');
  const toggleLabel = element('span', 'cora-toggle-label', 'Chat to Cora');
  toggle.append(toggleOrb, toggleLabel);

  panel.append(header, messages, suggestions, form);
  root.append(panel, toggle);
  document.body.append(root);

  const conversation = [];
  let conversationContext = '';
  let conversationFlow = '';
  let conversationFlowState = {};
  let conversationToken = '';
  let suppressNextUserMessage = false;
  const tracked = new Set();
  let previousFocus = null;
  let responsePending = false;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const narrowViewport = window.matchMedia('(max-width:600px)');
  const canAutoFocus = () => finePointer.matches && !narrowViewport.matches;

  const track = eventName => {
    if (tracked.has(eventName)) return;
    tracked.add(eventName);
    const body = new URLSearchParams({ action: 'stapleit_track_planner_event', event: eventName });
    if (navigator.sendBeacon) navigator.sendBeacon('/wp-admin/admin-ajax.php', body);
    else fetch('/wp-admin/admin-ajax.php', { method: 'POST', body, credentials: 'same-origin', keepalive: true }).catch(() => {});
  };

  const addMessage = (role, copy, status = '') => {
    const message = element('div', `cora-message cora-message--${role}`, copy);
    message.classList.add('cora-message--new');
    messages.append(message);
    if (status) messages.append(element('p', 'cora-message-status', status));
    messages.scrollTop = messages.scrollHeight;
    return message;
  };

  const renderSuggestions = copies => {
    suggestions.replaceChildren();
    copies.slice(0, 4).forEach(copy => {
      const button = element('button', 'cora-suggestion', copy);
      button.type = 'button';
      suggestions.append(button);
    });
  };

  const addThinking = () => {
    const thinking = element('div', 'cora-message cora-message--assistant cora-thinking');
    thinking.setAttribute('role', 'status');
    thinking.setAttribute('aria-label', 'Cora is thinking about your question');
    const label = element('span', 'cora-thinking-label', 'Thinking about that');
    const dots = element('span', 'cora-thinking-dots');
    dots.setAttribute('aria-hidden', 'true');
    dots.append(element('i', ''), element('i', ''), element('i', ''));
    thinking.append(label, dots);
    messages.append(thinking);
    messages.scrollTop = messages.scrollHeight;
    return thinking;
  };

  addMessage('assistant', 'Hi, I’m Cora. What can I help with?');
  renderSuggestions(initialSuggestions);

  const setOpen = (open, { focusInput = canAutoFocus() } = {}) => {
    if (root.classList.contains('is-open') === open) return;
    root.classList.toggle('is-open', open);
    root.classList.toggle('is-closed', !open);
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      track('cora_opened');
      previousFocus = document.activeElement;
      window.requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
        if (focusInput) input.focus({ preventScroll: true });
      });
    } else if (previousFocus instanceof HTMLElement) {
      window.setTimeout(() => previousFocus?.focus({ preventScroll: true }), 260);
      previousFocus = null;
    }
  };

  root.classList.add('is-closed');
  toggle.addEventListener('click', () => setOpen(!root.classList.contains('is-open'), { focusInput: canAutoFocus() }));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('click', event => {
    const contextualTrigger = event.target.closest('[data-cora-open]');
    if (!contextualTrigger) return;
    const seededMessage = contextualTrigger.dataset.coraMessage?.trim();
    const flow = contextualTrigger.dataset.coraFlow?.trim();
    if (seededMessage && !input.value.trim()) input.value = seededMessage;
    setOpen(true, { focusInput: false });
    if (flow === 'package') {
      if (conversation.length === 0) messages.replaceChildren();
      conversationFlow = 'package';
      conversationFlowState = {};
      suppressNextUserMessage = true;
      input.value = 'Start package discovery';
      window.requestAnimationFrame(() => form.requestSubmit());
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
  });

  suggestions.addEventListener('click', event => {
    const button = event.target.closest('.cora-suggestion');
    if (!(button instanceof HTMLButtonElement)) return;
    const copy = button.textContent.trim();
    if (!conversationFlow && (/(?:which|what).*package|choose.*package/i.test(copy) || /^start again$/i.test(copy))) {
      conversationFlow = 'package';
      conversationFlowState = {};
    }
    input.value = copy;
    form.requestSubmit();
  });

  input.addEventListener('focus', () => root.classList.add('is-input-focused'));
  input.addEventListener('blur', () => window.setTimeout(() => {
    if (document.activeElement !== input) root.classList.remove('is-input-focused');
  }, 80));

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || responsePending) return;
    const prompt = input.value.trim();
    if (!prompt) return;

    const showUserMessage = !suppressNextUserMessage;
    suppressNextUserMessage = false;
    if (showUserMessage) {
      addMessage('user', prompt);
      conversation.push({ role: 'user', content: prompt });
    }
    track('cora_conversation_started');
    input.value = '';
    responsePending = true;
    send.disabled = true;
    send.classList.add('is-thinking');
    send.textContent = 'Thinking';
    subtitle.textContent = 'Thinking about that…';
    const thinking = addThinking();

    try {
      const priorUserTurns = conversation
        .filter(message => message.role === 'user')
        .slice(-6, -1);
      const body = new URLSearchParams({
        action: 'stapleit_cora_chat',
        prompt,
        history: JSON.stringify(priorUserTurns),
        context: conversationContext,
        flow: conversationFlow,
        flow_state: JSON.stringify(conversationFlowState),
        page: window.location.pathname,
        conversation_token: conversationToken
      });
      const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        credentials: 'same-origin'
      });
      const payload = await response.json();
      if (!response.ok || payload?.ok === false || !payload?.reply) {
        throw new Error(payload?.message || 'Cora cannot respond at the moment.');
      }
      thinking.remove();
      conversationContext = typeof payload.context === 'string' ? payload.context : conversationContext;
      if (typeof payload.conversation_token === 'string' && payload.conversation_token) conversationToken = payload.conversation_token;
      if (Object.prototype.hasOwnProperty.call(payload, 'flow')) {
        if (payload.flow === 'package' && payload.flow_state && typeof payload.flow_state === 'object') {
          conversationFlowState = payload.flow_state;
          conversationFlow = payload.flow_active ? 'package' : '';
        } else {
          conversationFlowState = {};
          conversationFlow = '';
        }
      }
      conversation.push({ role: 'assistant', content: payload.reply });
      if (conversation.length > 8) conversation.splice(0, conversation.length - 8);
      addMessage('assistant', payload.reply);
      renderSuggestions(Array.isArray(payload.suggestions) ? payload.suggestions : initialSuggestions);
    } catch (error) {
      thinking.remove();
      addMessage('assistant', error instanceof Error ? error.message : 'Cora cannot respond at the moment. Please call 01372 309 707 or email hello@stapleit.co.uk.');
    } finally {
      responsePending = false;
      send.disabled = false;
      send.classList.remove('is-thinking');
      send.textContent = 'Send';
      subtitle.textContent = 'Ask me about support, security or Microsoft 365';
      if (canAutoFocus()) input.focus();
    }
  });
})();

(() => {
  const holidays = new Set([
    '2026-01-01','2026-04-03','2026-04-06','2026-05-04','2026-05-25','2026-08-31','2026-12-25','2026-12-28',
    '2027-01-01','2027-03-26','2027-03-29','2027-05-03','2027-05-31','2027-08-30','2027-12-27','2027-12-28'
  ]);

  const londonParts = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return {
      weekday: values.weekday,
      date: `${values.year}-${values.month}-${values.day}`,
      hour: Number(values.hour)
    };
  };

  const weekdayName = date => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', weekday: 'long'
  }).format(new Date(`${date}T12:00:00Z`));

  const nextWorkingDay = date => {
    const cursor = new Date(`${date}T12:00:00Z`);
    for (let offset = 1; offset < 10; offset += 1) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const nextDate = cursor.toISOString().slice(0, 10);
      const name = weekdayName(nextDate);
      if (name !== 'Saturday' && name !== 'Sunday' && !holidays.has(nextDate)) {
        return { offset, name };
      }
    }
    return null;
  };

  const updateSupportStatus = () => {
    const panel = document.getElementById('support-status');
    const title = document.getElementById('status-title');
    const message = document.getElementById('status-message');
    if (!panel || !title || !message) return;

    const now = londonParts();
    const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(now.weekday);
    const open = weekday && !holidays.has(now.date) && now.hour >= 9 && now.hour < 17;

    panel.classList.toggle('offline', !open);
    title.textContent = open ? 'We’re open' : 'We’re closed';

    if (open) {
      const copy = document.createElement('span');
      copy.className = 'status-message-copy';
      copy.textContent = 'Our support team is available until 5pm today.';

      const call = document.createElement('a');
      call.className = 'status-callout';
      call.href = 'tel:+441372309707';
      call.setAttribute('aria-label', 'Call Staple IT on 01372 309707');

      const icon = document.createElement('span');
      icon.className = 'status-callout-icon';
      icon.setAttribute('aria-hidden', 'true');

      const number = document.createElement('span');
      number.className = 'status-callout-number';
      number.textContent = '01372 309707';

      call.append(icon, number);
      message.replaceChildren(copy, call);
    } else if (weekday && !holidays.has(now.date) && now.hour < 9) {
      message.textContent = 'Our support team is available from 9am today.';
    } else {
      const next = nextWorkingDay(now.date);
      message.textContent = next
        ? (next.offset === 1 ? 'Support reopens tomorrow at 9am.' : `Support reopens ${next.name} at 9am.`)
        : 'Support will reopen during our next support window.';
    }
  };

  updateSupportStatus();
  window.setInterval(updateSupportStatus, 60000);
})();

(() => {
  const video = document.querySelector('.hero-liquid-motion');
  if (!(video instanceof HTMLVideoElement)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection?.saveData);

  const syncPlayback = () => {
    if (reducedMotion.matches || saveData || document.hidden) {
      video.pause();
      return;
    }

    const play = video.play();
    play?.catch?.(() => {});
  };

  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener?.('change', syncPlayback);
  syncPlayback();
})();

(() => {
  const audit = document.querySelector('.audit-section');
  const explainer = document.querySelector('[data-audit-explainer]');
  if (!audit || !explainer) return;

  const toggle = explainer.querySelector('.audit-explainer-toggle');
  const body = explainer.querySelector('.audit-explainer-body');
  const desktop = window.matchMedia('(min-width: 981px)');
  let userToggled = false;
  let autoOpened = false;

  const setOpen = open => {
    explainer.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    body?.setAttribute('aria-hidden', String(!open));
  };

  toggle?.addEventListener('click', () => {
    userToggled = true;
    setOpen(!explainer.classList.contains('is-open'));
  });

  const maybeAutoOpen = () => {
    if (!desktop.matches || userToggled || autoOpened) return;
    autoOpened = true;
    window.setTimeout(() => {
      if (desktop.matches && !userToggled) setOpen(true);
    }, 700);
  };

  setOpen(false);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      maybeAutoOpen();
      observer.disconnect();
    }, { threshold: .18, rootMargin: '0px 0px -8% 0px' });
    observer.observe(audit);
  } else {
    maybeAutoOpen();
  }

  desktop.addEventListener?.('change', event => {
    if (!event.matches) setOpen(false);
  });
})();

(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = [...document.querySelectorAll([
    '.services-header',
    '.home-services-card',
    '.audience-header',
    '.audience-item',
    '.trust-sticky',
    '.trust-proof',
    '.google-review-hero',
    '.google-review-card',
    '.partners-header',
    '.partners-conveyor',
    '.audit-hero',
    '.audit-form',
    '.contact-hero',
    '.contact-panel',
    '.contact-map-card',
    '.support-standard > h2',
    '.support-standard-group',
    '.support-section-heading',
    '.support-step-card',
    '.support-package-cora',
    '.support-package-card',
    '.support-pack-finder',
    '.support-extra-card',
    '.support-cta-panel',
    '.footer-panel',
    '.footer-legal-bar'
  ].join(','))].filter(element => {
    const supportReveal = element.matches([
      '.support-standard > h2',
      '.support-standard-group',
      '.support-section-heading',
      '.support-step-card',
      '.support-package-cora',
      '.support-package-card',
      '.support-pack-finder',
      '.support-extra-card',
      '.support-cta-panel'
    ].join(','));
    return !supportReveal || window.matchMedia('(min-width:701px)').matches;
  });

  if (!elements.length) return;

  elements.forEach(element => element.classList.add('motion-ready'));

  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('motion-in'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-in');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: .08,
    rootMargin: '0px 0px -4% 0px'
  });

  elements.forEach(element => observer.observe(element));
})();