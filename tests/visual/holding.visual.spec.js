const { test, expect } = require('@playwright/test');

for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1440, 1000]
]) {
  test(`holding page remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/holding/', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toHaveText('We’re having a makeover...');
    await expect(page.locator('.holding-rainbow')).toHaveText('makeover...');
    await expect(page.locator('.holding-card')).toBeVisible();

    const layout = await page.evaluate(() => {
      const lock = document.querySelector('.holding-access summary').getBoundingClientRect();
      const card = document.querySelector('.holding-card').getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        lockWidth: lock.width,
        lockHeight: lock.height,
        cardLeft: card.left,
        cardRight: card.right,
        cardCenter: (card.left + card.right) / 2
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.lockWidth).toBeGreaterThanOrEqual(44);
    expect(layout.lockHeight).toBeGreaterThanOrEqual(44);
    expect(layout.cardLeft).toBeGreaterThanOrEqual(0);
    expect(layout.cardRight).toBeLessThanOrEqual(width);

    await page.locator('.holding-access summary').click();
    await expect(page.locator('.holding-access-panel')).toBeVisible();
    await expect.poll(() => page.locator('.holding-main').evaluate(element =>
      Number.parseFloat(getComputedStyle(element).opacity)
    )).toBeLessThan(0.35);

    const openLayout = await page.evaluate(() => {
      const card = document.querySelector('.holding-card').getBoundingClientRect();
      const panel = document.querySelector('.holding-access-panel').getBoundingClientRect();
      const main = document.querySelector('.holding-main');
      return {
        cardCenter: (card.left + card.right) / 2,
        panelCenter: (panel.left + panel.right) / 2,
        mainOpacity: Number.parseFloat(getComputedStyle(main).opacity),
        entryAnimation: getComputedStyle(document.body, '::before').animationName
      };
    });

    expect(Math.abs(openLayout.cardCenter - layout.cardCenter)).toBeLessThanOrEqual(1);
    expect(Math.abs(openLayout.panelCenter - width / 2)).toBeLessThanOrEqual(1);
    expect(openLayout.mainOpacity).toBeLessThanOrEqual(0.35);
    expect(openLayout.entryAnimation).toBe('holdingPageEntry');

    const controls = await page.locator('.holding-access input, .holding-access button').evaluateAll(elements =>
      elements.map(element => element.getBoundingClientRect().height)
    );
    controls.forEach(controlHeight => expect(controlHeight).toBeGreaterThanOrEqual(44));

    const video = page.locator('.holding-motion');
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
  });
}

test('holding page respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4173/holding/', { waitUntil: 'networkidle' });

  const motion = await page.evaluate(() => ({
    videoDisplay: getComputedStyle(document.querySelector('.holding-motion')).display,
    rainbowAnimation: getComputedStyle(document.querySelector('.holding-rainbow')).animationName,
    entryDisplay: getComputedStyle(document.body, '::before').display
  }));

  expect(motion.videoDisplay).toBe('none');
  expect(motion.rainbowAnimation).toBe('none');
  expect(motion.entryDisplay).toBe('none');
});
