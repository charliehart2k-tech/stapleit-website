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
        cardRight: card.right
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.lockWidth).toBeGreaterThanOrEqual(44);
    expect(layout.lockHeight).toBeGreaterThanOrEqual(44);
    expect(layout.cardLeft).toBeGreaterThanOrEqual(0);
    expect(layout.cardRight).toBeLessThanOrEqual(width);

    await page.locator('.holding-access summary').click();
    await expect(page.locator('.holding-access-panel')).toBeVisible();

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
    rainbowAnimation: getComputedStyle(document.querySelector('.holding-rainbow')).animationName
  }));

  expect(motion.videoDisplay).toBe('none');
  expect(motion.rainbowAnimation).toBe('none');
});
