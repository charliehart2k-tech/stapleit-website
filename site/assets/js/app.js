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
    title.textContent = open ? 'We are open' : 'We are asleep';

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

  const syncPlayback = () => {
    if (reducedMotion.matches || document.hidden) {
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
  const form = document.querySelector('[data-audit-form]');
  const status = form?.querySelector('[data-audit-form-status]');
  if (!form || !status) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    status.hidden = false;
    status.textContent = 'This staging form is not connected to a mail endpoint yet. Please email hello@stapleit.co.uk or call 01372 309 707 for now.';
  });
})();

(() => {
  const backdrop = document.getElementById('support-modal-backdrop');
  const modal = document.getElementById('support-modal');
  const closeBtn = document.getElementById('support-modal-close');
  const tierEl = document.getElementById('support-modal-tier');
  const titleEl = document.getElementById('support-modal-title');
  const priceEl = document.getElementById('support-modal-price');
  const bodyEl = document.getElementById('support-modal-body');
  const noteEl = document.getElementById('support-modal-note');

  if (!backdrop || !modal || !closeBtn || !tierEl || !titleEl || !priceEl || !bodyEl || !noteEl) return;

  const packages = {
    basic: {
      tier: 'Basic',
      title: 'Basic package inclusions',
      price: 'From £35 per staff member, per month',
      note: '* Microsoft 365 & Google Workspace licensing is billed separately at cost.',
      groups: [
        {
          heading: 'Helpdesk & support',
          items: [
            'Real engineer, no call centres',
            'Day-to-day IT issue resolution during business hours',
            'Microsoft 365 & Google Workspace support',
            'Email, Teams & calendar issues',
            'Password resets & account access',
            'Printer & peripheral support',
            'Wi-Fi & VPN troubleshooting',
            'Browser, plugin & web application issues',
            'Mobile device support',
            'Software faults & configuration queries',
            'Most issues resolved remotely, same day'
          ]
        },
        {
          heading: 'Monitoring & patching',
          items: [
            '24/7 device monitoring',
            'Proactive issue resolution before you notice',
            'Automated Windows & macOS patching',
            'Third-party application patching',
            'Device health & asset register'
          ]
        },
        {
          heading: 'User & device management',
          items: [
            'New user setup — accounts, email & application access',
            'Secure leaver process — deactivation, data preservation & licence reallocation',
            'Mobile device management — MDM enrolment & policy',
            'Personal device support on a best-efforts basis — something most IT providers won\'t offer',
            'Physical device setup quoted separately'
          ]
        },
        {
          heading: 'Platform management',
          items: [
            'Microsoft 365 or Google Workspace management',
            'Licence management & reallocation',
            'Microsoft licensing managed on your behalf via CSP*'
          ]
        },
        {
          heading: 'Protection',
          items: [
            'Enterprise-grade antivirus & anti-malware',
            'Hardware fault diagnosis & warranty management'
          ]
        },
        {
          heading: 'Pricing & contract',
          items: [
            'Fixed monthly price per staff member',
            'No hidden costs or surprise call-out charges',
            '3-month rolling agreement — no long-term lock-in'
          ]
        }
      ]
    },
    standard: {
      tier: 'Standard',
      title: 'Standard package inclusions',
      price: 'From £55 per staff member, per month',
      note: '* Microsoft 365 & Google Workspace licensing is billed separately at cost.',
      groups: [
        {
          heading: 'Security',
          items: [
            'Endpoint Detection & Response (EDR) — advanced threat detection & remediation on every device',
            'Threat quarantine & automated response',
            'Security alerting & incident notification',
            'Anti-phishing & spam filtering',
            'Malicious attachment & link scanning',
            'Email impersonation & spoofing protection',
            'DKIM, DMARC & SPF configuration & management',
            'Email flow monitoring & quarantine management'
          ]
        },
        {
          heading: 'Identity & access',
          items: [
            'Multi-Factor Authentication (MFA) enforcement across Microsoft 365 & Google Workspace',
            'Conditional Access policies — restricting access by device, location & risk',
            'Privileged account management',
            'SSO configuration where applicable',
            'Access reviews & permission audits'
          ]
        },
        {
          heading: 'Mobile device management',
          items: [
            'MDM enrolment & policy enforcement',
            'Device compliance management',
            'Remote wipe capability',
            'Work application setup & management'
          ]
        },
        {
          heading: 'Backup',
          items: [
            'Microsoft 365 or Google Workspace backup',
            'Exchange, SharePoint, OneDrive, Teams & Gmail data protection',
            'Backup monitoring & failure alerting',
            'Periodic restore testing'
          ]
        },
        {
          heading: 'Proactive partnership',
          items: [
            'Proactive technology recommendations',
            'Regular environment health reviews'
          ]
        },
        {
          heading: 'Pricing & contract',
          items: [
            'Fixed monthly price per staff member',
            'No hidden costs or surprise call-out charges',
            '3-month rolling agreement — no long-term lock-in'
          ]
        }
      ]
    },
    premium: {
      tier: 'Premium',
      title: 'Premium package inclusions',
      price: 'From £75 per staff member, per month — Microsoft 365 Business Premium included',
      note: '',
      groups: [
        {
          heading: 'Advanced security',
          items: [
            'DNS filtering & web content control',
            'Policy configuration by user group or device',
            'Vulnerability scanning across your entire environment',
            'Remediation recommendations & prioritisation',
            'Dark web monitoring — credential & email exposure alerts',
            'Security incident response treated as P1 — highest priority',
            'Microsoft Defender — advanced threat protection across devices, identity & email'
          ]
        },
        {
          heading: 'Compliance & data protection',
          items: [
            'Microsoft Purview — data classification & sensitivity labelling',
            'Information protection policies',
            'Data loss prevention (DLP) policies',
            'Compliance reporting & audit trails',
            'Cyber Essentials assistance & gap analysis',
            'Acceptable Use Policy documentation',
            'IT Security Policy documentation',
            'BYOD Policy documentation',
            'Disaster recovery planning & documentation'
          ]
        },
        {
          heading: 'Included licensing',
          items: [
            'Microsoft 365 Business Premium — included in your monthly price',
            'Microsoft Defender Suite — included in your monthly price',
            'Microsoft Purview Suite — included in your monthly price'
          ]
        },
        {
          heading: 'Pricing & contract',
          items: [
            'Fixed monthly price per staff member — includes Microsoft 365 Business Premium licensing',
            'No hidden costs or surprise call-out charges',
            '3-month rolling agreement — no long-term lock-in'
          ]
        }
      ]
    }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previousFocus = null;
  let closeTimer = 0;

  const modalClasses = ['support-modal--basic', 'support-modal--standard', 'support-modal--premium'];

  const renderGroups = groups => {
    const fragments = groups.map(group => {
      const card = document.createElement('section');
      card.className = 'support-modal-group';

      const heading = document.createElement('h4');
      heading.textContent = group.heading;

      const list = document.createElement('ul');
      const items = group.items.map(item => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      });

      list.append(...items);
      card.append(heading, list);
      return card;
    });

    bodyEl.replaceChildren(...fragments);
  };

  const revealModal = () => {
    backdrop.hidden = false;
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('support-modal-open');

    window.requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      closeBtn.focus();
    });
  };

  const finishClose = () => {
    window.clearTimeout(closeTimer);
    backdrop.hidden = true;
    backdrop.setAttribute('aria-hidden', 'true');
    modal.classList.remove(...modalClasses);
    bodyEl.classList.remove('support-modal-body--single');
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
  };

  const closeModal = () => {
    if (backdrop.hidden) return;

    backdrop.classList.remove('is-open');
    document.body.classList.remove('support-modal-open');

    if (reducedMotion.matches) {
      finishClose();
      return;
    }

    const onTransitionEnd = event => {
      if (event.target !== backdrop || event.propertyName !== 'opacity') return;
      backdrop.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    };

    backdrop.addEventListener('transitionend', onTransitionEnd);
    closeTimer = window.setTimeout(() => {
      backdrop.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }, 300);
  };

  const openPackageModal = key => {
    const data = packages[key];
    if (!data) return;

    window.clearTimeout(closeTimer);
    previousFocus = document.activeElement;

    modal.classList.remove(...modalClasses);
    modal.classList.add(`support-modal--${key}`);
    bodyEl.classList.remove('support-modal-body--single');
    tierEl.textContent = data.tier;
    titleEl.textContent = data.title;
    priceEl.textContent = data.price;
    priceEl.hidden = false;
    noteEl.textContent = data.note;
    noteEl.hidden = !data.note;
    renderGroups(data.groups);
    revealModal();
  };

  const openCatalogueModal = card => {
    const title = card.querySelector('h3')?.textContent?.trim();
    const category = card.querySelector('.support-extra-category')?.textContent?.trim();
    const price = card.querySelector('.support-extra-price')?.textContent?.trim() || '';
    const copy = card.querySelector('.support-extra-copy');
    if (!title || !copy) return;

    window.clearTimeout(closeTimer);
    previousFocus = document.activeElement;

    modal.classList.remove(...modalClasses);
    bodyEl.classList.add('support-modal-body--single');
    tierEl.textContent = category || 'Service';
    titleEl.textContent = title;
    priceEl.textContent = price;
    priceEl.hidden = !price;
    noteEl.textContent = '';
    noteEl.hidden = true;

    const group = document.createElement('section');
    group.className = 'support-modal-group';
    group.append(copy.cloneNode(true));
    bodyEl.replaceChildren(group);
    revealModal();
  };

  document.querySelectorAll('[data-package-open]').forEach(button => {
    button.addEventListener('click', () => openPackageModal(button.dataset.packageOpen));
  });

  document.querySelectorAll('.support-extra-details > summary').forEach(summary => {
    summary.addEventListener('click', event => {
      const details = summary.parentElement;
      const card = summary.closest('.support-extra-card');
      if (!details || !card) return;

      event.preventDefault();
      details.open = false;
      openCatalogueModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (backdrop.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hasAttribute('disabled') && !element.hidden);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const moreBtn = document.getElementById('support-packs-more');
  if (!moreBtn) return;

  const hiddenCards = [...document.querySelectorAll('[data-pack-hidden]')];
  if (!hiddenCards.length) return;

  moreBtn.addEventListener('click', () => {
    hiddenCards.forEach(card => {
      card.hidden = false;
      card.removeAttribute('data-pack-hidden');
      if (card.classList.contains('motion-ready')) card.classList.add('motion-in');
    });
    moreBtn.setAttribute('aria-expanded', 'true');
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
    '.support-section-heading',
    '.support-card',
    '.footer-panel',
    '.footer-legal-bar'
  ].join(','))];

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