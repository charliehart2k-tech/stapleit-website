/* Horizontal add-on card deck. */
(() => {
  const reel = document.querySelector('[data-pack-reel]');
  const items = reel ? [...reel.querySelectorAll('[data-pack-reel-item]')] : [];
  if (!reel || items.length < 3) return;
  const previousButton = reel.querySelector('[data-pack-reel-prev]');
  const nextButton = reel.querySelector('[data-pack-reel-next]');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactDeck = window.matchMedia('(max-width: 700px)');
  let activeIndex = Math.max(0, items.findIndex(item => item.classList.contains('is-active')));
  let timer = 0;
  let paused = false;
  let inViewport = !('IntersectionObserver' in window);
  let pointerStartX = null;

  const wrap = index => (index + items.length) % items.length;
  const render = index => {
    activeIndex = wrap(index);
    const previous = wrap(activeIndex - 1);
    const next = wrap(activeIndex + 1);

    items.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      const prev = itemIndex === previous;
      const nextItem = itemIndex === next;
      item.classList.toggle('is-active', active);
      item.classList.toggle('is-prev', prev);
      item.classList.toggle('is-next', nextItem);
      const visible = active || (!compactDeck.matches && (prev || nextItem));
      item.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if (active) item.setAttribute('aria-current', 'true'); else item.removeAttribute('aria-current');
      item.tabIndex = visible ? 0 : -1;
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };
  const start = () => {
    stop();
    if (paused || !inViewport || reducedMotion.matches || document.hidden) return;
    timer = window.setInterval(() => render(activeIndex + 1), 3600);
  };

  reel.classList.add('is-enhanced');
  render(activeIndex);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inViewport = entries.some(entry => entry.isIntersecting);
      start();
    }, { threshold: .12, rootMargin: '80px 0px 80px' });
    observer.observe(reel);
  }

  start();

  items.forEach((item, itemIndex) => {
    item.addEventListener('click', event => {
      if (itemIndex === activeIndex) return;
      event.preventDefault();
      event.stopPropagation();
      render(itemIndex);
      start();
    });
  });

  const move = delta => {
    render(activeIndex + delta);
    window.StapleTactile?.snap?.(items[activeIndex]);
    start();
  };
  previousButton?.addEventListener('click', () => move(-1));
  nextButton?.addEventListener('click', () => move(1));

  reel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    render(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    items[activeIndex].focus();
    start();
  });
  reel.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') pointerStartX = event.clientX;
  });
  reel.addEventListener('pointerup', event => {
    if (pointerStartX === null || event.pointerType !== 'touch') return;
    const delta = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(delta) < 38) return;
    move(delta < 0 ? 1 : -1);
  });
  reel.addEventListener('pointercancel', () => { pointerStartX = null; });
  reel.addEventListener('pointerenter', () => { paused = true; stop(); });
  reel.addEventListener('pointerleave', () => { paused = false; start(); });
  reel.addEventListener('focusin', () => { paused = true; stop(); });
  reel.addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && reel.contains(event.relatedTarget)) return;
    paused = false;
    start();
  });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener?.('change', start);
  compactDeck.addEventListener?.('change', () => render(activeIndex));
})();
