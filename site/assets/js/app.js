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
    title.textContent = open ? 'Support is open' : 'Support is closed';

    if (open) {
      message.textContent = 'Our support team is available until 5pm today.';
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
  const card = document.querySelector('[data-service-carousel]');
  if (!card) return;

  const stage = card.querySelector('.service-stage');
  const slides = [...card.querySelectorAll('[data-service-slide]')];
  const indicators = [...card.querySelectorAll('.service-indicator button')];
  if (!stage || slides.length < 2 || indicators.length !== slides.length) return;

  const touchLayout = window.matchMedia('(max-width: 980px)');
  const desktop = window.matchMedia('(min-width: 981px)');

  let index = 0;
  let timer = null;
  let wheelLock = 0;
  let wheelTotal = 0;
  let scrollFrame = 0;

  const setActive = next => {
    index = (next + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));

      slide.querySelectorAll('a,button,input,textarea,select,[tabindex]').forEach(control => {
        if (active) control.removeAttribute('tabindex');
        else control.setAttribute('tabindex', '-1');
      });
    });

    card.dataset.activeService = slides[index].dataset.service || '';

    indicators.forEach((indicator, indicatorIndex) => {
      if (indicatorIndex === index) indicator.setAttribute('aria-current', 'true');
      else indicator.removeAttribute('aria-current');
    });
  };

  const clearTimer = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const arm = () => {
    clearTimer();
    if (!desktop.matches || document.hidden) return;
    timer = window.setInterval(() => setActive(index + 1), 15000);
  };

  const scrollToIndex = (next, behavior = 'smooth') => {
    const targetIndex = (next + slides.length) % slides.length;
    setActive(targetIndex);

    if (!touchLayout.matches) return;

    stage.scrollTo({
      left: slides[targetIndex].offsetLeft,
      behavior
    });
  };

  const go = next => {
    if (touchLayout.matches) {
      clearTimer();
      scrollToIndex(next, 'smooth');
    } else {
      setActive(next);
      arm();
    }
  };

  indicators.forEach((indicator, indicatorIndex) => {
    indicator.addEventListener('click', () => go(indicatorIndex));
  });

  card.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      go(index + 1);
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      go(index - 1);
    }
  });

  card.addEventListener('wheel', event => {
    if (!desktop.matches) return;

    wheelTotal += event.deltaY;
    if (Math.abs(wheelTotal) < 35) return;

    const direction = wheelTotal > 0 ? 1 : -1;
    wheelTotal = 0;

    const now = performance.now();
    event.preventDefault();
    if (now < wheelLock) return;
    wheelLock = now + 650;
    go(index + direction);
  }, { passive: false });

  /* Native touch scrolling is the source of truth on phone/tablet. */
  stage.addEventListener('scroll', () => {
    if (!touchLayout.matches) return;

    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, slideIndex) => {
        const currentDistance = Math.abs(stage.scrollLeft - slide.offsetLeft);
        if (currentDistance < distance) {
          distance = currentDistance;
          nearest = slideIndex;
        }
      });

      if (nearest !== index) setActive(nearest);
    });
  }, { passive: true });

  const applyMode = () => {
    clearTimer();
    setActive(index);

    if (touchLayout.matches) {
      window.requestAnimationFrame(() => {
        stage.scrollTo({ left: slides[index].offsetLeft, behavior: 'auto' });
      });
    } else {
      stage.scrollLeft = 0;
      arm();
    }
  };

  touchLayout.addEventListener?.('change', applyMode);
  document.addEventListener('visibilitychange', arm);

  setActive(0);
  applyMode();
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = [...document.querySelectorAll([
    '.home-statement-card',
    '.home-services-card',
    '.audience-header',
    '.audience-item',
    '.trust-sticky',
    '.trust-proof',
    '.audit-hero',
    '.audit-form',
    '.contact-hero',
    '.contact-panel',
    '.contact-map-card',
    '.footer-panel',
    '.footer-legal-bar'
  ].join(','))];

  if (!elements.length) return;

  elements.forEach((element, elementIndex) => {
    element.classList.add('motion-ready');
    element.style.setProperty('--motion-delay', `${(elementIndex % 4) * 50}ms`);
  });

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
    threshold: .10,
    rootMargin: '0px 0px -5% 0px'
  });

  elements.forEach(element => observer.observe(element));
})();
