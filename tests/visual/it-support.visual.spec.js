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
    await expect(page.getByRole('button', { name: 'Chat to Cora' })).toBeVisible();
    await page.getByRole('button', { name: 'Chat to Cora' }).click();
    await expect(page.getByRole('dialog', { name: 'Cora' })).toBeVisible();
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
        smallestControl: Math.min(...controls),
        coraPanelInsideViewport: (() => {
          const rect = document.querySelector('.cora-panel').getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight;
        })()
      };
    });
    expect(contract.overflow).toBeLessThanOrEqual(1);
    expect(contract.bodySize).toBeGreaterThanOrEqual(width <= 700 ? 16 : 17);
    expect(contract.questionVisible).toBe(true);
    expect(contract.smallestControl).toBeGreaterThanOrEqual(44);
    expect(contract.coraPanelInsideViewport).toBe(true);
    await page.getByRole('button', { name: 'Close Cora' }).click();
    await expect(page.getByRole('dialog', { name: 'Cora' })).toBeHidden();
    await page.screenshot({ path: `test-results/it-support-${name}.png`, fullPage: true, animations: 'disabled' });
  });
}

for (const route of ['/', '/about-us/', '/it-services/it-support/']) {
  test(`Cora is usable on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Chat to Cora' });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Cora' })).toBeVisible();
    await expect(page.getByLabel('Message Cora')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close Cora' })).toBeVisible();
  });
}

test('package recommendation stays deterministic while Cora explains it', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (body.includes('action=stapleit_cora_planner_explain')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, mode: 'local-ai', reply: 'Standard fits because you selected stronger managed protection for a team of five or more. A free IT audit will confirm the final scope.' })
      });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const packageForm = page.locator('[data-package-finder]');
  await packageForm.getByLabel('5–19 people').check();
  await packageForm.getByRole('button', { name: 'Continue' }).click();
  await packageForm.getByLabel('Support plus stronger security').check();
  await packageForm.getByRole('button', { name: 'Continue' }).click();
  await packageForm.getByLabel('No', { exact: true }).check();
  await packageForm.getByRole('button', { name: 'See my recommendation' }).click();

  await expect(page.locator('[data-package-title]')).toContainText('Standard');
  await expect(page.locator('[data-package-ai-copy]')).toContainText('stronger managed protection');
  const surfaces = await page.evaluate(() => {
    const planner = document.querySelector('[data-support-planner]');
    const form = planner?.querySelector(':scope > [data-package-finder]');
    return {
      formIsDirectChild: Boolean(form),
      outerBorder: planner ? getComputedStyle(planner).borderTopStyle : '',
      formBorder: form ? Number.parseFloat(getComputedStyle(form).borderTopWidth) : 0
    };
  });
  expect(surfaces.formIsDirectChild).toBe(true);
  expect(surfaces.outerBorder).toBe('none');
  expect(surfaces.formBorder).toBeGreaterThan(0);
});
