(() => {
  const toggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const details = [...document.querySelectorAll('.nav-details')];

  const closeMobile = () => {
    if (!toggle || !mobileMenu) return;
    mobileMenu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
  });

  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobile));
  details.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) details.forEach(other => { if (other !== item) other.open = false; });
  }));

  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.nav-details')) details.forEach(item => { item.open = false; });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    details.forEach(item => { item.open = false; });
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

  const slides = [...card.querySelectorAll('[data-service-slide]')];
  const indicators = [...card.querySelectorAll('.service-indicator button')];
  if (slides.length < 2) return;

  const desktop = window.matchMedia('(min-width: 981px)');
  let index = 0;
  let timer = null;
  let wheelLock = 0;
  let wheelTotal = 0;

  const paint = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    card.dataset.activeService = slides[index].dataset.service || '';
    indicators.forEach((indicator, indicatorIndex) => {
      if (indicatorIndex === index) indicator.setAttribute('aria-current', 'true');
      else indicator.removeAttribute('aria-current');
    });
  };

  const arm = () => {
    window.clearInterval(timer);
    timer = null;
    if (document.hidden) return;
    timer = window.setInterval(() => paint(index + 1), 15000);
  };

  const go = next => {
    paint(next);
    arm();
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
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const now = performance.now();
    event.preventDefault();
    if (now < wheelLock) return;
    wheelLock = now + 650;
    go(target);
  }, { passive: false });

  document.addEventListener('visibilitychange', arm);
  paint(0);
  arm();
})();

(() => {
  const setupReveal = ({ id, timeout = 1400, threshold = .15, rootMargin = '0px 0px -8% 0px' }) => {
    const section = document.getElementById(id);
    if (!section) return;

    section.classList.add('reveal-ready');
    const reveal = () => {
      if (section.classList.contains('is-visible')) return;
      section.classList.add('is-visible');
      window.setTimeout(() => section.classList.remove('reveal-ready'), timeout);
    };

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal();
        observer.disconnect();
        break;
      }
    }, { threshold, rootMargin });

    observer.observe(section);
  };

  setupReveal({ id: 'who-we-support', timeout: 1400 });
  setupReveal({ id: 'trust', timeout: 1900, threshold: .12, rootMargin: '0px 0px -10% 0px' });
  setupReveal({ id: 'free-it-audit', timeout: 1800, threshold: .10, rootMargin: '0px 0px -8% 0px' });
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
  const auditTitle = document.getElementById('audit-title');
  const formTitle = document.querySelector('.audit-form-heading h3');
  if (auditTitle) {
    auditTitle.innerHTML = 'Let us look over <span class="accent-orange">your</span> IT. <span>Completely free.</span>';
  }
  if (formTitle) {
    formTitle.innerHTML = 'Request <span class="accent-orange">your</span> free audit';
  }

  const audit = document.querySelector('.audit-section');
  const shell = audit?.querySelector('.audit-contact-shell');
  const oldPanel = audit?.querySelector('.audit-direct');
  if (!audit || !shell || !oldPanel) return;

  oldPanel.remove();

  const contact = document.createElement('section');
  contact.className = 'contact-section';
  contact.id = 'contact';
  contact.setAttribute('aria-labelledby', 'contact-title');

  contact.innerHTML = `
    <div class="contact-inner">
      <header class="contact-hero">
        <h2 id="contact-title">We’re here when <span class="accent-orange">you</span> need us.</h2>
      </header>
      <div class="contact-grid">
        <section class="contact-panel" aria-labelledby="contact-panel-title">
          <h3 id="contact-panel-title">Speak to Staple IT</h3>
          <p class="contact-panel-intro">Monday to Friday, 9am–5pm.</p>
          <dl class="contact-list">
            <div class="contact-row"><dt>Call us</dt><dd><a href="tel:+441372309707">01372 309 707</a></dd></div>
            <div class="contact-row"><dt>WhatsApp Business</dt><dd><a class="contact-whatsapp" href="https://wa.me/+441372309707" rel="noopener noreferrer" target="_blank">Click to chat</a></dd></div>
            <div class="contact-row"><dt>Email</dt><dd><a href="mailto:hello@stapleit.co.uk">hello@stapleit.co.uk</a></dd></div>
            <div class="contact-row"><dt>Hours</dt><dd>Monday to Friday, 9am–5pm</dd></div>
            <div class="contact-row contact-address"><dt>Address</dt><dd>88 Eastdean Avenue, Epsom, KT18 7SN</dd></div>
          </dl>
        </section>
        <section class="contact-map-card" aria-label="Staple IT location">
          <div class="contact-map-shell is-loaded" data-contact-map>
            <iframe data-contact-map-frame loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=51.3351004,-0.2637125&z=15&output=embed" title="Staple IT location in Epsom"></iframe>
          </div>
          <div class="contact-map-footer">
            <span>Epsom, Surrey</span>
            <a href="https://www.google.com/maps/search/?api=1&query=88+Eastdean+Avenue,+Epsom,+KT18+7SN" rel="noopener noreferrer" target="_blank">Open in Google Maps ↗</a>
          </div>
        </section>
      </div>
    </div>`;

  audit.insertAdjacentElement('afterend', contact);

  contact.classList.add('reveal-ready');
  const reveal = () => {
    contact.classList.add('is-visible');
    window.setTimeout(() => contact.classList.remove('reveal-ready'), 1200);
  };

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    reveal();
    observer.disconnect();
  }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });

  observer.observe(contact);
})();
