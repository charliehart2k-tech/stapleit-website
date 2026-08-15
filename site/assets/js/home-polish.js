(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 640px)');

  /* Build a cleaner mobile navigation from the existing accessible links. */
  const organiseMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    if (!menu || menu.querySelector('.mobile-services-group')) return;

    const serviceLinks = [...menu.querySelectorAll('a')].filter(link => {
      const href = link.getAttribute('href') || '';
      return href.includes('it-services/');
    });

    if (!serviceLinks.length) return;

    const group = document.createElement('details');
    group.className = 'mobile-services-group';

    const summary = document.createElement('summary');
    summary.className = 'nav-pill';
    summary.textContent = 'IT Services';

    const grid = document.createElement('div');
    grid.className = 'mobile-services-grid';

    serviceLinks.forEach(link => grid.append(link));
    group.append(summary, grid);

    const firstLink = menu.querySelector('a');
    if (firstLink) firstLink.insertAdjacentElement('afterend', group);
    else menu.prepend(group);

    const toggle = document.getElementById('menu-toggle');
    toggle?.addEventListener('click', () => {
      if (toggle.getAttribute('aria-expanded') === 'false') group.open = false;
    });
  };

  /* Make the service carousel feel native on touch screens. */
  const enableServiceSwipe = () => {
    const card = document.querySelector('[data-service-carousel]');
    if (!card || card.dataset.swipeBound === 'true') return;

    card.dataset.swipeBound = 'true';

    const indicators = [...card.querySelectorAll('.service-indicator button')];
    if (indicators.length < 2) return;

    let startX = 0;
    let startY = 0;
    let started = false;

    const activeIndex = () => {
      const index = indicators.findIndex(button => button.getAttribute('aria-current') === 'true');
      return index < 0 ? 0 : index;
    };

    card.addEventListener('touchstart', event => {
      if (!phone.matches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      started = true;
    }, { passive: true });

    card.addEventListener('touchend', event => {
      if (!phone.matches || !started || !event.changedTouches.length) return;
      started = false;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.15) return;

      event.preventDefault();

      const current = activeIndex();
      const next = dx < 0
        ? Math.min(current + 1, indicators.length - 1)
        : Math.max(current - 1, 0);

      if (next !== current) indicators[next].click();
    }, { passive: false });
  };

  /* Correct the audit flow created by app.js without changing its desktop layout. */
  const repairAuditFlow = () => {
    const form = document.querySelector('[data-audit-form]');
    const heading = form?.querySelector('.audit-form-heading');
    const submit = form?.querySelector('.audit-submit');
    const explainer = form?.querySelector('.audit-explainer');

    if (!form || !heading || !submit || !explainer) return;

    const toggle = explainer.querySelector('.audit-explainer-toggle');
    const body = explainer.querySelector('.audit-explainer-body');

    if (phone.matches) {
      if (explainer.previousElementSibling !== submit) {
        submit.insertAdjacentElement('afterend', explainer);
      }

      /* app.js auto-opens the drawer; on phones we deliberately start compact. */
      window.setTimeout(() => {
        explainer.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
        body?.setAttribute('aria-hidden', 'true');
      }, 650);
    } else if (explainer.parentElement !== heading) {
      heading.append(explainer);
    }
  };

  /* Consistent entrance motion across static and runtime-built sections. */
  let observer = null;

  const reveal = element => element.classList.add('is-polish-visible');

  const bindReveals = () => {
    const selectors = [
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
    ];

    document.querySelectorAll(selectors.join(',')).forEach((element, index) => {
      if (element.dataset.polishRevealBound === 'true') return;

      element.dataset.polishRevealBound = 'true';
      element.classList.add('polish-reveal');
      element.style.setProperty('--polish-delay', `${(index % 4) * 55}ms`);

      if (reduceMotion || !observer) reveal(element);
      else observer.observe(element);
    });
  };

  const start = () => {
    organiseMobileMenu();
    enableServiceSwipe();

    if (!reduceMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
      });
    }

    repairAuditFlow();
    bindReveals();

    /* app.js creates the contact section dynamically; catch it once it arrives. */
    const mutationObserver = new MutationObserver(() => {
      repairAuditFlow();
      bindReveals();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => mutationObserver.disconnect(), 3500);

    const onViewportChange = () => {
      repairAuditFlow();
      const group = document.querySelector('.mobile-services-group');
      if (!phone.matches && group) group.open = false;
    };

    phone.addEventListener?.('change', onViewportChange);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
