(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 720px)');

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

  let observer = null;

  const reveal = element => element.classList.add('is-golden-visible');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px'
    });
  }

  const bindReveals = () => {
    document.querySelectorAll(selectors.join(',')).forEach((element, index) => {
      if (element.dataset.goldenRevealBound === 'true') return;

      element.dataset.goldenRevealBound = 'true';
      element.classList.add('golden-reveal');
      element.style.setProperty('--golden-delay', `${(index % 3) * 75}ms`);

      if (reduceMotion || !observer) reveal(element);
      else observer.observe(element);
    });
  };

  const fixAuditFlow = () => {
    const form = document.querySelector('[data-audit-form]');
    const explainer = form?.querySelector('.audit-explainer');
    const submit = form?.querySelector('.audit-submit');
    if (!form || !explainer || !submit) return false;

    /* The original runtime code puts the explainer inside the heading. That works
       on desktop because display:contents flattens it, but on iPhone it places a
       large drawer before the fields. Make it a real form child after the CTA. */
    if (explainer.parentElement !== form) {
      submit.insertAdjacentElement('afterend', explainer);
    }

    if (mobile.matches && explainer.dataset.mobileFlowBound !== 'true') {
      explainer.dataset.mobileFlowBound = 'true';

      const toggle = explainer.querySelector('.audit-explainer-toggle');
      const body = explainer.querySelector('.audit-explainer-body');
      let userIntent = false;

      toggle?.addEventListener('click', () => {
        userIntent = true;
      }, { capture: true });

      /* app.js intentionally auto-opens the drawer. Keep that behaviour on desktop,
         but on a phone start compact unless the user has already interacted. */
      window.setTimeout(() => {
        if (userIntent) return;
        explainer.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
        body?.setAttribute('aria-hidden', 'true');
      }, 720);
    }

    return true;
  };

  const bind = () => {
    fixAuditFlow();
    bindReveals();
  };

  const start = () => {
    bind();

    /* app.js creates the audit explainer/contact chapter synchronously at the end
       of the document, but keep this observer as a safety net for runtime changes. */
    const mutationObserver = new MutationObserver(bind);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => mutationObserver.disconnect(), 3500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
