(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const reveal = (element) => {
    element.classList.add('is-golden-visible');
  };

  let observer = null;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.13,
      rootMargin: '0px 0px -7% 0px'
    });
  }

  const bind = () => {
    const elements = document.querySelectorAll(selectors.join(','));

    elements.forEach((element, index) => {
      if (element.dataset.goldenRevealBound === 'true') return;

      element.dataset.goldenRevealBound = 'true';
      element.classList.add('golden-reveal');
      element.style.setProperty('--golden-delay', `${(index % 4) * 70}ms`);

      if (reduceMotion || !observer) {
        reveal(element);
        return;
      }

      observer.observe(element);
    });
  };

  const start = () => {
    bind();

    /* app.js builds the audit/contact chapter at runtime, so bind again when it appears. */
    const mutationObserver = new MutationObserver(() => bind());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    /* Stop watching once all current runtime enhancements have settled. */
    window.setTimeout(() => mutationObserver.disconnect(), 4000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
