const { test, expect } = require('@playwright/test');

const viewports = [
  ['320x720', 320, 720],
  ['360x800', 360, 800],
  ['390x844', 390, 844],
  ['430x932', 430, 932],
  ['768x1024', 768, 1024],
  ['820x1180', 820, 1180],
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
    await expect(page.locator('link[data-support-responsive]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Chat to Cora' })).toBeVisible();
    await page.getByRole('button', { name: 'Chat to Cora' }).click();
    await expect(page.getByRole('dialog', { name: 'Cora' })).toBeVisible();

    const contract = await page.evaluate(() => {
      const question = document.querySelector('[data-package-question]:not([hidden])');
      const lead = document.querySelector('.support-section-lead');
      const bodySize = lead ? Number.parseFloat(getComputedStyle(lead).fontSize) : 0;
      const controls = [...document.querySelectorAll('[data-support-planner] button, [data-support-planner] select, [data-support-planner] input[type="number"], [data-support-planner] .support-pack-choices label')]
        .filter(element => element.getClientRects().length)
        .map(element => element.getBoundingClientRect().height);
      const boundedSelectors = [
        '.support-hero-shell',
        '.support-standard',
        '.support-planner',
        '.support-package-finder',
        '.support-pack-finder-stage',
        '.support-pack-question:not([hidden])',
        '.support-package-card',
        '.support-extra-card',
        '.support-cta-panel',
        '.cora-panel'
      ];
      const escaped = [];
      boundedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (!element.getClientRects().length) return;
          const rect = element.getBoundingClientRect();
          if (rect.left < -1 || rect.right > innerWidth + 1 || rect.width > innerWidth + 1) {
            escaped.push({ selector, left: rect.left, right: rect.right, width: rect.width });
          }
        });
      });
      const packageGrid = document.querySelector('.support-package-grid');
      const packageColumns = packageGrid
        ? getComputedStyle(packageGrid).gridTemplateColumns.split(' ').filter(Boolean).length
        : 0;
      const publicCopy = document.body.innerText;
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodySize,
        questionVisible: Boolean(question),
        smallestControl: controls.length ? Math.min(...controls) : 0,
        escaped,
        packageColumns,
        coraPanelInsideViewport: (() => {
          const rect = document.querySelector('.cora-panel').getBoundingClientRect();
          return rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1;
        })(),
        coraPanelWidth: document.querySelector('.cora-panel').getBoundingClientRect().width,
        exposesImplementationCopy: /private local ai|safety guardrail|staple it knowledge guide|checking your answers against staple it’s service guide/i.test(publicCopy)
      };
    });

    expect(contract.overflow).toBeLessThanOrEqual(1);
    expect(contract.bodySize).toBeGreaterThanOrEqual(width <= 700 ? 16 : 17);
    expect(contract.questionVisible).toBe(true);
    expect(contract.smallestControl).toBeGreaterThanOrEqual(44);
    expect(contract.escaped).toEqual([]);
    expect(contract.coraPanelInsideViewport).toBe(true);
    expect(contract.coraPanelWidth).toBeGreaterThanOrEqual(width <= 320 ? 270 : width <= 840 ? 280 : 360);
    expect(contract.exposesImplementationCopy).toBe(false);
    if (width <= 840) expect(contract.packageColumns).toBe(1);

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
    await expect(page.locator('.cora-privacy')).not.toContainText(/local AI/i);
  });
}

test('Cora does not expose backend mode labels to visitors', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (body.includes('action=stapleit_cora_chat')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          mode: 'knowledge-guide',
          reply: 'For a team of ten, Standard is a sensible place to start if you want stronger managed security. A free IT audit can confirm the final fit.',
          suggestions: ['What is included?']
        })
      });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Chat to Cora' }).click();
  await page.getByLabel('Message Cora').fill('We have ten staff and want stronger security.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.cora-message--assistant').last()).toContainText('Standard');
  await expect(page.locator('.cora-messages')).not.toContainText(/knowledge guide|guardrail|local-ai|local ai/i);
});

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
  await packageForm.getByLabel('Support + stronger security & backup').check();
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

test('Cora keeps package context across a natural follow-up', async ({ page }) => {
  let chatCalls = 0;
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (!body.includes('action=stapleit_cora_chat')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    chatCalls += 1;
    const params = new URLSearchParams(body);
    if (chatCalls === 1) {
      expect(params.get('context')).toBe('');
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          mode: 'knowledge-guide',
          context: 'package_basic',
          reply: 'The cheapest published team package is Basic, starting from £35 per staff member, per month.',
          suggestions: ['What’s included?', 'How do the packages differ?']
        })
      });
      return;
    }

    expect(params.get('context')).toBe('package_basic');
    expect(params.get('history')).toContain('cheapest package');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        mode: 'knowledge-guide',
        context: 'package_basic',
        reply: 'Basic includes helpdesk support, monitoring, patching and remote device management.',
        suggestions: ['How do the packages differ?']
      })
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Chat to Cora' }).click();
  await page.getByLabel('Message Cora').fill("What's the cheapest package?");
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.cora-message--assistant').last()).toContainText('Basic');
  await page.getByLabel('Message Cora').fill('What does that include?');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.cora-message--assistant').last()).toContainText('Basic includes');
  expect(chatCalls).toBe(2);
});


test('mobile planner fallback stays useful and contextual Cora opens before the keyboard', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (body.includes('action=stapleit_cora_planner_explain')) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false }) });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const packageForm = page.locator('[data-package-finder]');
  await packageForm.getByLabel('2–4 people').check();
  await packageForm.locator('[data-package-next]').click();
  await packageForm.getByLabel('Day-to-day IT support').check();
  await packageForm.locator('[data-package-next]').click();
  await packageForm.getByLabel('No', { exact: true }).check();
  await packageForm.locator('[data-package-next]').click();

  const explanation = page.locator('[data-package-ai-copy]');
  await expect(explanation).toContainText('five-user minimum');
  await expect(explanation).not.toContainText(/recommendation above still stands|free IT audit/i);

  await packageForm.getByRole('button', { name: 'Ask Cora about this' }).click();
  const cora = page.getByRole('dialog', { name: 'Cora' });
  await expect(cora).toBeVisible();
  const state = await page.evaluate(() => {
    const panel = document.querySelector('.cora-panel').getBoundingClientRect();
    return {
      activeIsTextarea: document.activeElement?.matches?.('.cora-form textarea') || false,
      width: panel.width,
      left: panel.left,
      right: panel.right
    };
  });
  expect(state.activeIsTextarea).toBe(false);
  expect(state.width).toBeGreaterThan(300);
  expect(state.left).toBeGreaterThanOrEqual(-1);
  expect(state.right).toBeLessThanOrEqual(391);
});

test('add-on fallback explains the selected packs without generic audit copy', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (body.includes('action=stapleit_cora_planner_explain')) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false }) });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const form = page.locator('[data-pack-finder]');
  const answers = [
    ['server', 'no'],
    ['azure', 'no'],
    ['network', 'no'],
    ['security', 'no'],
    ['governance', 'yes'],
    ['cyber-essentials', 'no'],
    ['ai', 'yes'],
    ['strategy', 'no'],
    ['disaster-recovery', 'yes']
  ];

  for (let index = 0; index < answers.length; index += 1) {
    const [key, value] = answers[index];
    const question = form.locator(`[data-pack-question][data-pack-key="${key}"]`);
    await question.locator(`input[value="${value}"]`).check();
    await form.locator('[data-pack-finder-next]').click();
  }

  const explanation = page.locator('[data-packs-ai-copy]');
  await expect(explanation).toContainText('Governance & compliance');
  await expect(explanation).toContainText('AI');
  await expect(explanation).toContainText('Disaster recovery');
  await expect(explanation).not.toContainText(/recommendation above still stands|free IT audit/i);
});

test('touch-opened dialogs do not leave package cards glowing and use the mobile sheet treatment', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const card = page.locator('.support-package-basic');
  await card.locator('summary').click();
  const dialog = page.locator('#support-dialog');
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(550);
  const modalState = await page.evaluate(() => {
    const dialog = document.querySelector('#support-dialog');
    const rect = dialog.getBoundingClientRect();
    const backdrop = getComputedStyle(dialog, '::backdrop');
    return {
      bottomGap: innerHeight - rect.bottom,
      width: rect.width,
      backdropFilter: backdrop.backdropFilter || backdrop.webkitBackdropFilter || '',
      radius: getComputedStyle(dialog).borderTopLeftRadius
    };
  });
  expect(modalState.bottomGap).toBeGreaterThanOrEqual(0);
  expect(modalState.bottomGap).toBeLessThanOrEqual(8);
  expect(modalState.width).toBeLessThanOrEqual(384);
  expect(modalState.backdropFilter).toContain('blur(3px)');
  expect(Number.parseFloat(modalState.radius)).toBeGreaterThanOrEqual(20);

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(async () => card.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  await expect.poll(async () => card.evaluate(element => Number.parseFloat(getComputedStyle(element, '::before').opacity))).toBeLessThanOrEqual(0.16);
  await context.close();
});
