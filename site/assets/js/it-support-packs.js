/* Compact rotating add-on pack showcase. */
(() => {
  const reel = document.querySelector('[data-pack-reel]');
  const count = document.querySelector('[data-pack-reel-count]');
  const items = reel ? [...reel.querySelectorAll('[data-pack-reel-item]')] : [];
  if (!reel || !count || items.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = Math.max(0, items.findIndex(item => item.classList.contains('is-active')));
  let timer = 0;
  let paused = false;

  const render = index => {
    activeIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-hidden', active ? 'false' : 'true');
      item.tabIndex = active ? 0 : -1;
    });
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (paused || reducedMotion.matches || document.hidden) return;
    timer = window.setInterval(() => render(activeIndex + 1), 3000);
  };

  reel.classList.add('is-enhanced');
  render(activeIndex);
  start();

  reel.addEventListener('pointerenter', () => {
    paused = true;
    stop();
  });
  reel.addEventListener('pointerleave', () => {
    paused = false;
    start();
  });
  reel.addEventListener('focusin', () => {
    paused = true;
    stop();
  });
  reel.addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && reel.contains(event.relatedTarget)) return;
    paused = false;
    start();
  });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener?.('change', start);
})();
