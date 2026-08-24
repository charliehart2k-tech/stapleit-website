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
      const packageChooser = document.querySelector('[data-cora-flow="package"]');
      const lead = document.querySelector('.support-section-lead');
      const bodySize = lead ? Number.parseFloat(getComputedStyle(lead).fontSize) : 0;
      const controls = [...document.querySelectorAll('[data-support-planner] button')]
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
      const heroStage = document.querySelector('.support-hero-shell');
      const heroCopy = document.querySelector('.support-hero-copy');
      const standard = document.querySelector('.support-standard');
      const heroCta = document.querySelector('.support-hero-cta');
      const heroProposition = document.querySelector('.support-hero-proposition');
      const tierBasic = document.querySelector('.support-package-basic');
      const tierStandard = document.querySelector('.support-package-standard');
      const tierPremium = document.querySelector('.support-package-premium');
      const publicCopy = document.body.innerText;
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodySize,
        packageChooserVisible: Boolean(packageChooser),
        smallestControl: controls.length ? Math.min(...controls) : 0,
        escaped,
        packageColumns,
        heroMotionPresent: Boolean(document.querySelector('.support-hero-motion')),
        heroStageOverflow: getComputedStyle(heroStage).overflow,
        heroCopyRadius: Number.parseFloat(getComputedStyle(heroCopy).borderTopLeftRadius),
        standardRadius: Number.parseFloat(getComputedStyle(standard).borderTopLeftRadius),
        heroCopyBlur: getComputedStyle(heroCopy).backdropFilter || getComputedStyle(heroCopy).webkitBackdropFilter || '',
        standardBlur: getComputedStyle(standard).backdropFilter || getComputedStyle(standard).webkitBackdropFilter || '',
        ctaCentered: Math.abs((heroCta.getBoundingClientRect().left + heroCta.getBoundingClientRect().width / 2) - (heroProposition.getBoundingClientRect().left + heroProposition.getBoundingClientRect().width / 2)) < 2,
        packageAccents: [tierBasic,tierStandard,tierPremium].map(el => getComputedStyle(el).getPropertyValue('--support-card-accent').trim()),
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
    expect(contract.packageChooserVisible).toBe(true);
    expect(contract.smallestControl).toBeGreaterThanOrEqual(44);
    expect(contract.escaped).toEqual([]);
    expect(contract.heroMotionPresent).toBe(false);
    expect(contract.heroStageOverflow).toBe('visible');
    expect(contract.heroCopyRadius).toBeGreaterThanOrEqual(width <= 700 ? 20 : 28);
    expect(contract.standardRadius).toBeGreaterThanOrEqual(width <= 700 ? 20 : 28);
    expect(contract.ctaCentered).toBe(true);
    expect(contract.heroCopyBlur).toContain('blur');
    expect(contract.standardBlur).toContain('blur');
    expect(contract.packageAccents).toEqual(['#F82822','#004AAD','#5E17EB']);
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

test('mobile top chapters keep deliberate rhythm and standard inclusions progressively disclose', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const initial = await page.evaluate(() => {
    const hero = document.querySelector('.support-hero').getBoundingClientRect();
    const copy = document.querySelector('.support-hero-copy').getBoundingClientRect();
    const standard = document.querySelector('.support-standard').getBoundingClientRect();
    const onboarding = document.querySelector('.support-onboarding').getBoundingClientRect();
    const packageHeading = document.querySelector('.support-packages > .support-section-heading h2');
    const visibleItems = [...document.querySelectorAll('.support-standard-group li')]
      .filter(element => element.getClientRects().length).length;
    return {
      heroHeight: hero.height,
      standardHeight: standard.height,
      onboardingHeight: onboarding.height,
      separation: standard.top - copy.bottom,
      packageHeadingSize: Number.parseFloat(getComputedStyle(packageHeading).fontSize),
      visibleItems
    };
  });

  expect(initial.heroHeight).toBeLessThan(1120);
  expect(initial.standardHeight).toBeLessThan(680);
  expect(initial.onboardingHeight).toBeLessThanOrEqual(1005);
  expect(initial.separation).toBeGreaterThanOrEqual(12);
  expect(initial.packageHeadingSize).toBeLessThanOrEqual(40);
  expect(initial.visibleItems).toBe(8);

  const toggle = page.locator('[data-standard-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveText('Show fewer inclusions');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const expandedItems = await page.locator('.support-standard-group li').evaluateAll(items => items.filter(item => item.getClientRects().length).length);
  expect(expandedItems).toBe(16);
});

test('mobile onboarding progress follows the reading position without generic reveal classes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const onboarding = page.locator('.support-onboarding');
  await expect(onboarding.locator('.motion-ready')).toHaveCount(0);
  const bodyFont = await onboarding.locator('.support-step-copy p').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(bodyFont).toBeGreaterThanOrEqual(16);

  for (const step of [1, 2, 3]) {
    await onboarding.locator(`.support-step-card[data-step="${step}"]`).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(onboarding).toHaveAttribute('data-progress', String(step));
  }
});

test('tablet chapter headings stay below hero scale', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const sizes = await page.evaluate(() => ({
    onboarding: Number.parseFloat(getComputedStyle(document.querySelector('.support-onboarding h2')).fontSize),
    packages: Number.parseFloat(getComputedStyle(document.querySelector('.support-packages > .support-section-heading h2')).fontSize)
  }));
  expect(sizes.onboarding).toBeLessThanOrEqual(58);
  expect(sizes.packages).toBeLessThanOrEqual(58);
});

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

test('Cora leads package discovery and only asks questions that can change the result', async ({ page }) => {
  const requests = [];
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (!body.includes('action=stapleit_cora_chat')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }
    const params = new URLSearchParams(body);
    const state = JSON.parse(params.get('flow_state') || '{}');
    requests.push({ flow: params.get('flow'), prompt: params.get('prompt'), state });
    const prompt = params.get('prompt') || '';
    let payload;
    if (/start package discovery/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'How many people need IT support?', flow:'package', flow_active:true, flow_state:{team:'',security:'',requirements:''}, suggestions:['Just me','2–4 people','5–19 people','20+ people'] };
    } else if (/5–19 people/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'How much protection do you want included?', flow:'package', flow_active:true, flow_state:{team:'10',security:'',requirements:''}, suggestions:['Day-to-day support','Security + backup','Microsoft 365 Business Premium'] };
    } else {
      payload = { ok:true, mode:'package-flow', reply:'Standard is the starting point. It starts from £55 per staff member, per month for teams of 5+.', context:'package_standard', flow:'package', flow_active:false, flow_state:{team:'10',security:'standard',requirements:''}, suggestions:['What’s included?','How do the packages differ?','Start again'] };
    }
    await route.fulfill({ contentType:'application/json', body:JSON.stringify(payload) });
  });

  await page.setViewportSize({ width:390, height:844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil:'networkidle' });
  await expect(page.locator('[data-package-finder]')).toHaveCount(0);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /interactive-widget=resizes-content/);
  await page.locator('[data-cora-flow="package"]').click();
  const cora = page.getByRole('dialog', { name:'Cora' });
  await expect(cora).toBeVisible();
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('How many people');
  await expect(cora.locator('.cora-suggestion')).toHaveCount(4);
  await expect(cora.getByRole('button', { name:'20+ people' })).toBeVisible();
  await cora.getByRole('button', { name:'5–19 people' }).click();
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('How much protection');
  await cora.getByRole('button', { name:'Security + backup' }).click();
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('Standard is the starting point');
  expect(requests).toHaveLength(3);
  expect(requests.every(request => request.flow === 'package')).toBe(true);
  expect(requests[1].state.team).toBe('');
  expect(requests[2].state.team).toBe('10');
});

test('package discovery is visually led by Cora and tier glows stay visible', async ({ page }) => {
  for (const [width, height] of [[390, 844], [1366, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => {
      const lead = document.querySelector('.support-package-cora');
      const trigger = document.querySelector('.support-package-cora-trigger');
      const cards = [...document.querySelectorAll('[data-package-grid] > .support-package-card')];
      const leadRect = lead.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      return {
        triggerRatio: triggerRect.width / leadRect.width,
        triggerHeight: triggerRect.height,
        orbVisible: getComputedStyle(trigger, '::before').backgroundImage !== 'none',
        cardGlowOpacity: cards.map(card => Number.parseFloat(getComputedStyle(card, '::before').opacity)),
        cardShadows: cards.map(card => getComputedStyle(card).boxShadow),
        taglines: document.querySelectorAll('.support-package-fit').length,
        badges: document.querySelectorAll('.support-package-badge').length,
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    expect(state.triggerRatio).toBeGreaterThanOrEqual(.99);
    expect(state.triggerHeight).toBeGreaterThanOrEqual(width <= 700 ? 72 : 88);
    expect(state.orbVisible).toBe(true);
    expect(Math.min(...state.cardGlowOpacity)).toBeGreaterThanOrEqual(.28);
    expect(state.cardShadows.every(shadow => shadow !== 'none')).toBe(true);
    expect(state.taglines).toBe(0);
    expect(state.badges).toBe(0);
    expect(state.overflow).toBeLessThanOrEqual(0);
  }
});

test('mobile package dialogs stay contained and collapse dense inclusion groups', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  for (const tier of ['standard', 'premium']) {
    await page.locator(`.support-package-${tier} summary`).click();
    const dialog = page.locator('#support-dialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(460);

    const geometry = await dialog.evaluate(element => {
      const body = element.querySelector('.support-dialog-body');
      const close = element.querySelector('.support-dialog-close').getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        closeWidth: close.width,
        closeHeight: close.height,
        accordionCount: body.querySelectorAll(':scope > .support-dialog-detail').length,
        scrollRatio: body.scrollHeight / body.clientHeight
      };
    });

    expect(geometry.top).toBeGreaterThanOrEqual(5);
    expect(geometry.bottom).toBeLessThanOrEqual(839);
    expect(geometry.closeWidth).toBeGreaterThanOrEqual(46);
    expect(geometry.closeHeight).toBeGreaterThanOrEqual(46);
    expect(geometry.accordionCount).toBe(8);
    expect(geometry.scrollRatio).toBeLessThanOrEqual(tier === 'premium' ? 1.3 : 1.15);

    const disclosures = dialog.locator('.support-dialog-detail');
    await disclosures.nth(0).locator('summary').click();
    await page.waitForTimeout(40);
    await disclosures.nth(1).locator('summary').click();
    await expect.poll(async () => disclosures.evaluateAll(items => items.filter(item => item.open).length)).toBe(1);
    await expect(disclosures.nth(0)).not.toHaveAttribute('open', '');
    await expect(disclosures.nth(1)).toHaveAttribute('open', '');

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.locator('.support-package-standard summary').click();
  const desktopDialog = page.locator('#support-dialog');
  await expect(desktopDialog).toBeVisible();
  const desktopState = await desktopDialog.evaluate(element => ({
    accordionCount: element.querySelectorAll('.support-dialog-detail').length,
    columns: getComputedStyle(element.querySelector('.support-dialog-body')).gridTemplateColumns.split(' ').filter(Boolean).length,
    backdropBlur: getComputedStyle(element, '::backdrop').backdropFilter || getComputedStyle(element, '::backdrop').webkitBackdropFilter || '',
    dialogBlur: getComputedStyle(element).backdropFilter || getComputedStyle(element).webkitBackdropFilter || ''
  }));
  expect(desktopState.accordionCount).toBe(0);
  expect(desktopState.columns).toBe(2);
  expect(desktopState.backdropBlur).toContain('blur(3px)');
  expect(desktopState.dialogBlur).toContain('blur(18px)');
});

test('primary packages lead and tailored support stays behind See more', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const more = page.locator('[data-package-more]');
  const tailored = page.locator('[data-package-tailored-wrap]');
  await expect(page.locator('[data-package-grid] > .support-package-card h3')).toHaveText(['Basic','Standard','Premium']);
  await expect(tailored).toBeHidden();
  await expect(more).toBeVisible();
  await more.click();
  await expect(tailored).toBeVisible();
  await expect(tailored.getByText('Tailored', { exact: true })).toBeVisible();
  await expect(more).toHaveText('Show less');
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


test('mobile Cora tracks a keyboard-resized viewport and keeps the composer visible', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil:'networkidle' });
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /interactive-widget=resizes-content/);
  await page.getByRole('button', { name:'Chat to Cora' }).click();
  const input = page.getByLabel('Message Cora');
  await input.focus();
  await expect(page.locator('.cora')).toHaveClass(/is-input-focused/);
  await page.setViewportSize({ width:390, height:500 });
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.cora-panel').getBoundingClientRect();
    const composer = document.querySelector('.cora-form').getBoundingClientRect();
    const suggestions = document.querySelector('.cora-suggestions');
    const privacy = document.querySelector('.cora-privacy');
    return {
      panelTop: panel.top,
      panelBottom: panel.bottom,
      panelHeight: panel.height,
      composerBottom: composer.bottom,
      suggestionsHidden: getComputedStyle(suggestions).display === 'none',
      privacyHidden: getComputedStyle(privacy).display === 'none',
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
  expect(geometry.panelTop).toBeGreaterThanOrEqual(7);
  expect(geometry.panelBottom).toBeLessThanOrEqual(501);
  expect(geometry.composerBottom).toBeLessThanOrEqual(501);
  expect(geometry.suggestionsHidden).toBe(true);
  expect(geometry.privacyHidden).toBe(true);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
});

test('Cora add-on conversation adapts and suggests without a nine-question checklist', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const form = page.locator('[data-pack-finder]');

  await expect(form).not.toContainText(/Question \d+ of 9/i);
  await expect(form.locator('progress')).toHaveCount(0);
  await expect(form.locator('[data-pack-question]:visible')).toHaveAttribute('data-pack-key', 'focus');
  await form.getByLabel('Security or compliance').check();
  await expect(form.locator('[data-pack-cora-line]')).toHaveCount(0);
  await form.getByRole('button', { name: 'Start there' }).click();

  await expect(form.locator('[data-pack-question]:visible')).toHaveAttribute('data-pack-key', 'security');
  await form.locator('[data-pack-question]:visible input[value="yes"]').check();
  await form.getByRole('button', { name: 'Keep chatting' }).click();
  await expect(form.locator('[data-pack-question]:visible')).toHaveAttribute('data-pack-key', 'governance');
  await form.locator('[data-pack-question]:visible input[value="yes"]').check();

  await expect(form.getByRole('button', { name: 'See what Cora suggests' })).toBeEnabled();
  await expect(form.getByRole('button', { name: 'Show suggestions now' })).toBeVisible();
  await form.getByRole('button', { name: 'See what Cora suggests' }).click();

  await expect(form.locator('[data-pack-results]')).toBeVisible();
  await expect(form.locator('[data-pack-results-summary]')).toContainText('Security');
  await expect(form.locator('[data-pack-results-summary]')).toContainText('Governance & compliance');
  await expect(form.locator('[data-pack-result="security"]')).toBeVisible();
  await expect(form.locator('[data-pack-result="governance"]')).toBeVisible();
  await expect(form.locator('[data-pack-result="cyber-essentials"]')).toBeHidden();
  await expect(form.locator('[data-pack-result="server"]')).toBeHidden();
  await expect(form.locator('#support-pack-results-title')).toHaveText('Suggestions');
  await expect(form.locator('[data-pack-result]:visible')).toHaveCount(2);
  await expect(form.locator('[data-pack-result]:visible').first().getByRole('link', { name: 'View pack details' })).toBeVisible();
  await expect(page.locator('#support-packs-grid .support-extra-card:not([hidden])')).toHaveCount(6);
  const viewAll = page.getByRole('button', { name: /View all 9 packs/i });
  await expect(viewAll).toBeVisible();
  const continuation = await viewAll.evaluate(element => ({
    width: element.getBoundingClientRect().width,
    parentWidth: element.parentElement?.getBoundingClientRect().width || 0
  }));
  expect(continuation.width).toBeGreaterThan(continuation.parentWidth - 2);
  const pass4bGeometry = await page.evaluate(() => ({
    resultHeight: document.querySelector('[data-pack-results]')?.getBoundingClientRect().height || 0,
    resultCardHeights: [...document.querySelectorAll('[data-pack-result]:not([hidden])')].map(card => card.getBoundingClientRect().height),
    catalogueCardHeights: [...document.querySelectorAll('#support-packs-grid .support-extra-card:not([hidden])')].slice(0, 6).map(card => card.getBoundingClientRect().height),
    overflow: document.documentElement.scrollWidth - innerWidth
  }));
  expect(pass4bGeometry.resultHeight).toBeLessThanOrEqual(930);
  expect(Math.max(...pass4bGeometry.resultCardHeights)).toBeLessThanOrEqual(280);
  expect(Math.max(...pass4bGeometry.catalogueCardHeights)).toBeLessThanOrEqual(270);
  expect(pass4bGeometry.overflow).toBeLessThanOrEqual(0);

  await viewAll.click();
  await expect(page.locator('#support-packs-grid .support-extra-card:not([hidden])')).toHaveCount(9);
  await expect(form.locator('.support-pack-results-note')).toContainText('not a complete assessment');

  const answeredPackTopics = await form.locator('[data-pack-question]:not([data-pack-gateway]) input:checked').count();
  expect(answeredPackTopics).toBe(2);
});

test('Cora add-on conversation can stop early and leaves unasked areas unknown', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false }) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const form = page.locator('[data-pack-finder]');

  await form.getByLabel('Servers, cloud or network').check();
  await form.getByRole('button', { name: 'Start there' }).click();
  await expect(form.locator('[data-pack-question]:visible')).toHaveAttribute('data-pack-key', 'server');
  await form.locator('[data-pack-question]:visible input[value="no"]').check();
  await form.getByRole('button', { name: 'Keep chatting' }).click();
  await expect(form.locator('[data-pack-question]:visible')).toHaveAttribute('data-pack-key', 'azure');
  await form.locator('[data-pack-question]:visible input[value="no"]').check();

  const stop = form.getByRole('button', { name: 'Show suggestions now' });
  await expect(stop).toBeVisible();
  await stop.click();

  await expect(form.locator('[data-pack-results]')).toBeVisible();
  await expect(form.locator('[data-pack-results-summary]')).toContainText('Nothing you’ve told me so far');
  await expect(form.locator('[data-pack-results-empty]')).toBeVisible();
  await expect(form.locator('[data-pack-result]:visible')).toHaveCount(0);
  await expect(form.locator('[data-pack-question][data-pack-key="network"] input:checked')).toHaveCount(0);
  await expect(form.locator('.support-pack-results-note')).toContainText('not a complete assessment');

  const chat = form.getByRole('button', { name: 'Ask Cora about this' });
  await chat.click();
  await expect(page.getByRole('dialog', { name: 'Cora' })).toBeVisible();
  await expect(page.getByLabel('Message Cora')).toHaveValue(/Nothing stood out/i);
});

test('mobile support content never disappears behind scroll reveal and unapproved filler copy stays absent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const state = await page.evaluate(() => {
    const targets = [
      ...document.querySelectorAll('.support-package-card, #support-packs-grid .support-extra-card, .support-section-heading')
    ];
    targets.forEach(target => {
      target.classList.add('motion-ready');
      target.classList.remove('motion-in');
    });
    window.scrollTo(0, document.documentElement.scrollHeight);
    const hidden = targets.filter(target => {
      const style = getComputedStyle(target);
      return Number.parseFloat(style.opacity) < .99;
    }).map(target => target.className);
    return {
      hidden,
      copy: document.body.innerText,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  expect(state.hidden).toEqual([]);
  expect(state.copy).not.toMatch(/Have a quick chat with Cora|What made you stop here|Cora · start wherever feels closest|Browse the full catalogue|More specialist packs/i);
  expect(state.overflow).toBeLessThanOrEqual(0);
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
  await expect.poll(async () => card.evaluate(element => Number.parseFloat(getComputedStyle(element, '::before').opacity))).toBeGreaterThanOrEqual(0.28);
  await expect.poll(async () => card.evaluate(element => Number.parseFloat(getComputedStyle(element, '::before').opacity))).toBeLessThanOrEqual(0.31);
  await context.close();
});
