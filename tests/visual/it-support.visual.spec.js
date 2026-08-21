const { test, expect } = require('@playwright/test');

const viewports = [
  ['360x800', 360, 800],
  ['430x932', 430, 932],
  ['768x1024', 768, 1024],
  ['1024x1366', 1024, 1366],
  ['1366x768', 1366, 768],
  ['1920x1080', 1920, 1080]
];

for (const [name, width, height] of viewports) {
  test(`${name} preserves the IT Support visual contract`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Unlimited');
    await expect(page.locator('[data-support-planner]')).toBeVisible();
    const contract = await page.evaluate(() => {
      const body = document.body;
      const question = document.querySelector('[data-package-question]:not([hidden])');
      const bodySize = Number.parseFloat(getComputedStyle(document.querySelector('.support-section-lead')).fontSize);
      const controls = [...document.querySelectorAll('[data-support-planner] button, [data-support-planner] select, [data-support-planner] input[type="number"], [data-support-planner] .support-pack-choices label')]
        .filter(element => element.getClientRects().length)
        .map(element => element.getBoundingClientRect().height);
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodySize,
        questionVisible: Boolean(question),
        smallestControl: Math.min(...controls)
      };
    });
    expect(contract.overflow).toBeLessThanOrEqual(1);
    expect(contract.bodySize).toBeGreaterThanOrEqual(width <= 700 ? 16 : 17);
    expect(contract.questionVisible).toBe(true);
    expect(contract.smallestControl).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: `test-results/it-support-${name}.png`, fullPage: true, animations: 'disabled' });
  });
}
