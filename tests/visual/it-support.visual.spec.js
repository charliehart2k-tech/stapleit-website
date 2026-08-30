const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }, testInfo) => {
  if ([
    'Cora is parked by default while the site is being finished',
    'Cora activates from the server readiness endpoint'
  ].includes(testInfo.title)) return;
  await page.addInitScript(() => { window.STAPLEIT_CORA_ENABLED = true; });
});

const waitForCoraSettled = async page => {
  await expect.poll(async () => page.locator('.cora-panel').evaluate(element => getComputedStyle(element).transform)).toBe('none');
};

test('Cora is parked by default while the site is being finished', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const trigger = page.getByRole('button', { name: 'Cora · Coming soon' });
  await expect(trigger).toBeVisible();
  const parkedPill = await page.evaluate(() => {
    const toggle = document.querySelector('.cora-toggle').getBoundingClientRect();
    const label = document.querySelector('.cora-toggle-label').getBoundingClientRect();
    return { left: label.left - toggle.left, right: toggle.right - label.right, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  expect(parkedPill.left).toBeGreaterThanOrEqual(28);
  expect(parkedPill.right).toBeGreaterThanOrEqual(12);
  expect(parkedPill.overflow).toBeLessThanOrEqual(0);
  await trigger.click();
  const cora = page.getByRole('dialog', { name: 'Cora' });
  await expect(cora).toBeVisible();
  await expect(cora).toContainText('Coming soon');
  await expect(cora).toContainText('finishing the new Staple IT website first');
  await expect(cora.locator('textarea')).toHaveCount(0);
  await expect(cora.getByRole('button', { name: 'Send' })).toHaveCount(0);
});


test('Cora activates from the server readiness endpoint', async ({ page }) => {
  let statusChecks = 0;
  await page.route('**/wp-admin/admin-ajax.php?action=stapleit_cora_status', async route => {
    statusChecks += 1;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, enabled: true })
    });
  });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Chat to Cora' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cora · Coming soon' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Chat to Cora' }).click();
  const cora = page.getByRole('dialog', { name: 'Cora' });
  await expect(cora).toBeVisible();
  await expect(cora.getByLabel('Message Cora')).toBeVisible();
  expect(statusChecks).toBe(1);
});

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
    await waitForCoraSettled(page);

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
        '.support-packs-intro',
        '.support-pack-reel-shell',
        '.support-pack-reel-item.is-active',
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
  expect(initial.onboardingHeight).toBeLessThanOrEqual(1500);
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

test('mobile chapters keep breathing room between headings, controls and cards', async ({ page }) => {
  for (const [width, height] of [[320, 720], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const style = selector => getComputedStyle(document.querySelector(selector));
      const heading = style('#support-packages-title');
      return {
        gaps: {
          onboarding: rect('.support-step-grid').top - rect('.support-onboarding .support-section-heading').bottom,
          packageHeadingToCora: rect('.support-packages .support-package-cora').top - rect('.support-packages .support-section-heading').bottom,
          packageCoraToCards: rect('[data-package-grid]').top - rect('.support-packages .support-package-cora').bottom,
          addonHeadingToCora: rect('.support-packs .support-package-cora').top - rect('.support-packs-heading').bottom,
          addonCoraToReel: rect('.support-pack-reel-shell').top - rect('.support-packs .support-package-cora').bottom,
          extrasHeadingToCards: rect('#support-services-grid').top - rect('.support-extras .support-section-heading').bottom
        },
        cardGaps: {
          steps: Number.parseFloat(style('.support-step-grid').gap),
          packages: Number.parseFloat(style('.support-package-grid').gap),
          extras: Number.parseFloat(style('#support-services-grid').gap)
        },
        headingLineRatio: Number.parseFloat(heading.lineHeight) / Number.parseFloat(heading.fontSize),
        headingTracking: heading.letterSpacing === 'normal' ? 0 : Number.parseFloat(heading.letterSpacing),
        headingSize: Number.parseFloat(heading.fontSize),
        chapterMargins: ['.support-onboarding','.support-packages','.support-packs','.support-extras','.support-cta']
          .map(selector => Number.parseFloat(style(selector).marginTop)),
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    expect(Math.min(...Object.values(state.gaps))).toBeGreaterThanOrEqual(26);
    expect(state.cardGaps.steps).toBeGreaterThanOrEqual(16);
    expect(state.cardGaps.packages).toBeGreaterThanOrEqual(18);
    expect(state.cardGaps.extras).toBeGreaterThanOrEqual(14);
    expect(state.headingLineRatio).toBeGreaterThanOrEqual(1.1);
    expect(state.headingTracking).toBeGreaterThanOrEqual(-0.35);
    expect(state.headingSize).toBeGreaterThanOrEqual(31);
    expect(state.headingSize).toBeLessThanOrEqual(40);
    expect(Math.min(...state.chapterMargins)).toBeGreaterThanOrEqual(48);
    expect(state.overflow).toBeLessThanOrEqual(0);
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

test('desktop typography, chapter rhythm and colour containment stay consistent', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const state = await page.evaluate(() => {
    const headingSelectors = ['#support-onboarding-title','#support-packages-title','#support-packs-title','#support-extras-title'];
    const headings = headingSelectors.map(selector => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return { font: Number.parseFloat(style.fontSize), tracking: style.letterSpacing === 'normal' ? 0 : Number.parseFloat(style.letterSpacing), line: Number.parseFloat(style.lineHeight) };
    });
    const sections = ['.support-packages','.support-packs','.support-extras','.support-cta'].map(selector => {
      const element = document.querySelector(selector);
      return { border: Number.parseFloat(getComputedStyle(element).borderTopWidth), top: element.getBoundingClientRect().top };
    });
    return {
      headings,
      sections,
      onboardingBackground: getComputedStyle(document.querySelector('.support-onboarding')).backgroundImage,
      ctaAmbient: getComputedStyle(document.querySelector('.support-cta'), '::before').content,
      packAmbient: getComputedStyle(document.querySelector('.support-packs'), '::before').content,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  const fonts = state.headings.map(item => item.font);
  expect(Math.max(...fonts) - Math.min(...fonts)).toBeLessThanOrEqual(1);
  for (const heading of state.headings) {
    expect(heading.font).toBeGreaterThanOrEqual(80);
    expect(heading.font).toBeLessThanOrEqual(90);
    expect(heading.tracking).toBeGreaterThanOrEqual(-1);
    expect(heading.line / heading.font).toBeGreaterThanOrEqual(1.07);
  }
  expect(state.sections.every(section => section.border >= 1)).toBe(true);
  expect(state.onboardingBackground).toBe('none');
  expect(state.ctaAmbient).toBe('none');
  expect(state.packAmbient).toBe('none');
  expect(state.overflow).toBeLessThanOrEqual(0);
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
  await expect(cora.locator('.cora-message--assistant')).toHaveCount(1);
  await expect(cora.locator('.cora-messages')).not.toContainText('Hi, I’m Cora');
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

test('Cora carries the server-issued conversation token between turns', async ({ page }) => {
  const seenTokens = [];
  const token = '0123456789abcdef0123456789abcdef.' + 'a'.repeat(64);
  let turn = 0;
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (!body.includes('action=stapleit_cora_chat')) {
      await route.fulfill({ contentType:'application/json', body:JSON.stringify({ ok:true }) });
      return;
    }
    const params = new URLSearchParams(body);
    seenTokens.push(params.get('conversation_token') || '');
    turn += 1;
    await route.fulfill({
      contentType:'application/json',
      body:JSON.stringify({
        ok:true,
        mode:'hosted-ai',
        reply:turn === 1 ? 'We can talk through the Network pack.' : 'Yes — I remember we were discussing the Network pack.',
        context:'pack_network',
        conversation_token:token,
        suggestions:[]
      })
    });
  });

  await page.setViewportSize({ width:390, height:844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil:'networkidle' });
  await page.getByRole('button', { name:'Chat to Cora' }).click();
  const cora = page.getByRole('dialog', { name:'Cora' });
  const input = cora.getByLabel('Message Cora');
  const send = cora.getByRole('button', { name:'Send' });
  await input.fill('Tell me about the Network pack');
  await send.click();
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('Network pack');
  await input.fill('What does that include?');
  await send.click();
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('remember');

  expect(seenTokens).toEqual(['', token]);
});

test('desktop Cora gives replies and suggestions enough room without horizontal clipping', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil:'networkidle' });
  await page.getByRole('button', { name:'Chat to Cora' }).click();
  const cora = page.getByRole('dialog', { name:'Cora' });
  await expect(cora).toBeVisible();
  await page.waitForTimeout(600);

  const geometry = await cora.evaluate(element => {
    const panel = element;
    const suggestions = element.querySelector('.cora-suggestions');
    const buttons = [...element.querySelectorAll('.cora-suggestion')];
    const suggestionRect = suggestions.getBoundingClientRect();
    return {
      panelWidth: panel.getBoundingClientRect().width,
      suggestionDisplay: getComputedStyle(suggestions).display,
      suggestionOverflow: suggestions.scrollWidth - suggestions.clientWidth,
      buttonsInside: buttons.every(button => {
        const rect = button.getBoundingClientRect();
        return rect.left >= suggestionRect.left - 1 && rect.right <= suggestionRect.right + 1;
      }),
      maxButtonWidth: Math.max(...buttons.map(button => button.getBoundingClientRect().width)),
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  expect(geometry.panelWidth).toBeGreaterThanOrEqual(468);
  expect(geometry.panelWidth).toBeLessThanOrEqual(482);
  expect(geometry.suggestionDisplay).toBe('grid');
  expect(geometry.suggestionOverflow).toBeLessThanOrEqual(0);
  expect(geometry.buttonsInside).toBe(true);
  expect(geometry.maxButtonWidth).toBeLessThan(230);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
});

test('Cora recovers from package-flow interruptions and can change topic', async ({ page }) => {
  const requests = [];
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (!body.includes('action=stapleit_cora_chat')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }
    const params = new URLSearchParams(body);
    const prompt = params.get('prompt') || '';
    const flow = params.get('flow') || '';
    const state = JSON.parse(params.get('flow_state') || '{}');
    requests.push({ prompt, flow, state });

    let payload;
    if (/start package discovery/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'How many people need IT support?', flow:'package', flow_active:true, flow_state:{team:'',security:'',requirements:''}, suggestions:['Just me','2–4 people','5–19 people','20+ people'] };
    } else if (prompt === '39') {
      payload = { ok:true, mode:'package-flow', reply:'How much protection do you want included?', flow:'package', flow_active:true, flow_state:{team:'25',security:'',requirements:''}, suggestions:['Day-to-day support','Security + backup','Microsoft 365 Business Premium'] };
    } else if (/sorry what/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'I mean the level of cover you want us to manage: mainly day-to-day IT support, stronger security and backup, or Microsoft 365 Business Premium included.', flow:'package', flow_active:true, flow_state:{team:'25',security:'',requirements:''}, suggestions:['Day-to-day support','Security + backup','Microsoft 365 Business Premium'] };
    } else if (/this is odd/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'You’re right — that was too rigid. I mean the level of cover you want us to manage.', flow:'package', flow_active:true, flow_state:{team:'25',security:'',requirements:''}, suggestions:['Day-to-day support','Security + backup','Microsoft 365 Business Premium'] };
    } else if (/you.re broken/i.test(prompt)) {
      payload = { ok:true, mode:'package-flow', reply:'Fair point — I got stuck in the package finder. I can restart it, stop it, or carry on from the last useful answer.', flow:'package', flow_active:true, flow_state:{team:'25',security:'',requirements:''}, suggestions:['Start again','Stop package finder'] };
    } else if (/how much is microsoft 365 business premium/i.test(prompt)) {
      payload = { ok:true, mode:'knowledge-guide', reply:'Staple IT does not publish a standalone Microsoft 365 Business Premium licence price on this site.', flow:'', flow_active:false, flow_state:{}, suggestions:['What does Premium include?','Can you review our licences?'] };
    } else if (/700 licenses bespoke/i.test(prompt)) {
      payload = { ok:true, mode:'knowledge-guide', reply:'That is a business IT and licensing request. I can help narrow it down, but I will not invent a bulk price in chat.', suggestions:[] };
    } else {
      payload = { ok:true, mode:'knowledge-guide', reply:'Which part should I explain?', suggestions:[] };
    }
    await route.fulfill({ contentType:'application/json', body:JSON.stringify(payload) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil:'networkidle' });
  await page.locator('[data-cora-flow="package"]').click();
  const cora = page.getByRole('dialog', { name:'Cora' });
  const input = cora.getByLabel('Message Cora');
  const send = cora.getByRole('button', { name:'Send' });

  const sendText = async text => {
    await input.fill(text);
    await send.click();
  };

  await expect(cora.locator('.cora-message--assistant').last()).toContainText('How many people');
  await sendText('39');
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('How much protection');

  await sendText('sorry what?');
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('level of cover');
  await expect(cora.locator('.cora-message--assistant').last()).not.toHaveText('How much protection do you want included?');

  await sendText('this is odd?');
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('too rigid');

  await sendText("you're broken");
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('got stuck');
  await expect(cora.getByRole('button', { name:'Stop package finder' })).toBeVisible();

  await sendText('How much is Microsoft 365 Business Premium?');
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('does not publish a standalone');

  await sendText('I need 700 licenses bespoke');
  await expect(cora.locator('.cora-message--assistant').last()).toContainText('business IT and licensing request');

  expect(requests.find(request => request.prompt === '39')?.flow).toBe('package');
  expect(requests.find(request => /Business Premium/i.test(request.prompt))?.flow).toBe('package');
  expect(requests.find(request => /700 licenses bespoke/i.test(request.prompt))?.flow).toBe('');
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
    expect(Math.min(...state.cardGlowOpacity)).toBeGreaterThanOrEqual(.15);
    expect(Math.max(...state.cardGlowOpacity)).toBeLessThanOrEqual(.20);
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
        closeWidth: Math.round(close.width * 100) / 100,
        closeHeight: Math.round(close.height * 100) / 100,
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
  await waitForCoraSettled(page);
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

test('Add-on showcase matches the package chapter and keeps the active card readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const section = page.locator('.support-packs');
  const reel = section.locator('[data-pack-reel]');
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { level: 2 })).toContainText('Add-ons');
  await expect(section.getByText('We offer a variety of add-on packs')).toBeVisible();
  await expect(section.locator('.support-packs-eyebrow')).toHaveCount(0);
  await expect(section.locator('[data-pack-reel-count]')).toHaveCount(0);
  await expect(section.getByText('Available add-on packs')).toHaveCount(0);
  await expect(reel.locator('[data-pack-reel-item]')).toHaveCount(9);
  await expect(reel.locator('[data-pack-reel-item].is-active')).toHaveCount(1);
  await expect(reel.locator('[data-pack-reel-item].is-prev')).toHaveCount(1);
  await expect(reel.locator('[data-pack-reel-item].is-next')).toHaveCount(1);
  await expect(reel.locator('[data-pack-reel-item][aria-hidden="false"]')).toHaveCount(1);
  await expect(reel.locator('[data-pack-reel-item].is-active .support-pack-reel-features span')).toHaveCount(3);
  await expect(page.locator('#support-packs-grid [data-pack-card]:not([hidden])')).toHaveCount(0);
  await expect(section.getByRole('button', { name: 'View all add-ons' })).toBeVisible();

  await page.mouse.move(1, 1);
  const before = await reel.locator('[data-pack-reel-item].is-active').getAttribute('data-pack-reel-item');
  const state = await page.evaluate(() => {
    const section = document.querySelector('.support-packs');
    const reelShell = document.querySelector('.support-pack-reel-shell');
    const active = document.querySelector('[data-pack-reel-item].is-active');
    const name = active.querySelector('.support-pack-reel-name');
    const copy = active.querySelector('.support-pack-reel-copy');
    return {
      sectionHeight: section.getBoundingClientRect().height,
      reelHeight: document.querySelector('.support-pack-reel').getBoundingClientRect().height,
      shellHeight: reelShell.getBoundingClientRect().height,
      activeLeft: active.getBoundingClientRect().left,
      activeRight: active.getBoundingClientRect().right,
      prevOpacity: Number.parseFloat(getComputedStyle(document.querySelector('[data-pack-reel-item].is-prev')).opacity),
      nextOpacity: Number.parseFloat(getComputedStyle(document.querySelector('[data-pack-reel-item].is-next')).opacity),
      titleSize: Number.parseFloat(getComputedStyle(name).fontSize),
      copySize: Number.parseFloat(getComputedStyle(copy).fontSize),
      auraWidth: Number.parseFloat(getComputedStyle(reelShell, '::before').width),
      sectionBackground: getComputedStyle(section).backgroundImage,
      sectionAmbient: getComputedStyle(section, '::before').content,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
  expect(state.sectionHeight).toBeLessThanOrEqual(1120);
  expect(state.reelHeight).toBeGreaterThanOrEqual(390);
  expect(state.reelHeight).toBeLessThanOrEqual(420);
  expect(state.shellHeight).toBeLessThanOrEqual(510);
  expect(state.activeLeft).toBeGreaterThanOrEqual(18);
  expect(state.activeRight).toBeLessThanOrEqual(372);
  expect(state.prevOpacity).toBeGreaterThanOrEqual(0.18);
  expect(state.prevOpacity).toBeLessThanOrEqual(0.3);
  expect(state.nextOpacity).toBeGreaterThanOrEqual(0.18);
  expect(state.nextOpacity).toBeLessThanOrEqual(0.3);
  expect(state.titleSize).toBeGreaterThanOrEqual(28);
  expect(state.copySize).toBeGreaterThanOrEqual(15);
  expect(state.auraWidth).toBeLessThan(390);
  expect(state.sectionBackground).toBe('none');
  expect(state.sectionAmbient).toBe('none');
  expect(state.overflow).toBeLessThanOrEqual(0);

  await page.waitForTimeout(3900);
  const whileOffscreen = await reel.locator('[data-pack-reel-item].is-active').getAttribute('data-pack-reel-item');
  expect(whileOffscreen).toBe(before);

  await reel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3900);
  const afterVisible = await reel.locator('[data-pack-reel-item].is-active').getAttribute('data-pack-reel-item');
  expect(afterVisible).not.toBe(before);
});



test('mobile add-on deck keeps one active card, blurred neighbours and visible arrows', async ({ page }) => {
  for (const [width, height] of [[320, 720], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => {
      const active = document.querySelector('[data-pack-reel-item].is-active').getBoundingClientRect();
      const reel = document.querySelector('.support-pack-reel').getBoundingClientRect();
      const prev = getComputedStyle(document.querySelector('[data-pack-reel-item].is-prev'));
      const next = getComputedStyle(document.querySelector('[data-pack-reel-item].is-next'));
      const heading = getComputedStyle(document.querySelector('#support-packs-title'));
      return {
        activeLeft: active.left,
        activeRightGap: innerWidth - active.right,
        reelHeight: reel.height,
        activeBottomGap: reel.bottom - active.bottom,
        prevOpacity: Number.parseFloat(prev.opacity),
        nextOpacity: Number.parseFloat(next.opacity),
        prevFilter: prev.filter,
        nextFilter: next.filter,
        exposedCards: document.querySelectorAll('[data-pack-reel-item][aria-hidden="false"]').length,
        arrowsVisible: [...document.querySelectorAll('.support-pack-reel-arrow')].every(element => getComputedStyle(element).display !== 'none'),
        headingSize: Number.parseFloat(heading.fontSize),
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    expect(state.activeLeft).toBeGreaterThanOrEqual(18);
    expect(state.activeRightGap).toBeGreaterThanOrEqual(18);
    expect(state.reelHeight).toBeGreaterThanOrEqual(390);
    expect(state.reelHeight).toBeLessThanOrEqual(420);
    expect(state.activeBottomGap).toBeGreaterThanOrEqual(6);
    expect(state.prevOpacity).toBeGreaterThanOrEqual(0.18);
    expect(state.prevOpacity).toBeLessThanOrEqual(0.3);
    expect(state.nextOpacity).toBeGreaterThanOrEqual(0.18);
    expect(state.nextOpacity).toBeLessThanOrEqual(0.3);
    expect(state.prevFilter).toContain('blur');
    expect(state.nextFilter).toContain('blur');
    expect(state.exposedCards).toBe(1);
    expect(state.arrowsVisible).toBe(true);
    expect(state.headingSize).toBeGreaterThanOrEqual(31);
    expect(state.headingSize).toBeLessThanOrEqual(40);
    expect(state.overflow).toBeLessThanOrEqual(0);
  }
});


test('mobile add-on arrows cycle every pack without clipping the active card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  const next = page.locator('[data-pack-reel-next]');
  await expect(next).toBeVisible();
  const seen = new Set();
  for (let index = 0; index < 9; index += 1) {
    const state = await page.evaluate(() => {
      const active = document.querySelector('[data-pack-reel-item].is-active');
      const activeRect = active.getBoundingClientRect();
      const reelRect = document.querySelector('.support-pack-reel').getBoundingClientRect();
      return {
        pack: active.dataset.packReelItem,
        bottomGap: reelRect.bottom - activeRect.bottom,
        linkBottomGap: reelRect.bottom - active.querySelector('.support-pack-reel-link').getBoundingClientRect().bottom
      };
    });
    seen.add(state.pack);
    expect(state.bottomGap).toBeGreaterThanOrEqual(6);
    expect(state.linkBottomGap).toBeGreaterThanOrEqual(12);
    await next.click();
    await page.waitForTimeout(80);
  }
  expect(seen.size).toBe(9);
});

test('desktop add-on chapter uses the same typography and Cora geometry as packages', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const geometry = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect();
    const style = selector => getComputedStyle(document.querySelector(selector));
    const packs = rect('.support-packs');
    const packages = rect('.support-packages');
    const packHeading = style('#support-packages-title');
    const addonHeading = style('#support-packs-title');
    const packageCora = rect('.support-packages .support-package-cora-trigger');
    const addonCora = rect('.support-packs .support-package-cora-trigger');
    const active = document.querySelector('[data-pack-reel-item].is-active');
    return {
      leftDelta: Math.abs(packs.left - packages.left),
      rightDelta: Math.abs(packs.right - packages.right),
      sectionHeight: packs.height,
      headingSizeDelta: Math.abs(Number.parseFloat(packHeading.fontSize) - Number.parseFloat(addonHeading.fontSize)),
      headingTrackingDelta: Math.abs((packHeading.letterSpacing === 'normal' ? 0 : Number.parseFloat(packHeading.letterSpacing)) - (addonHeading.letterSpacing === 'normal' ? 0 : Number.parseFloat(addonHeading.letterSpacing))),
      coraWidthDelta: Math.abs(packageCora.width - addonCora.width),
      coraHeightDelta: Math.abs(packageCora.height - addonCora.height),
      activeTitle: Number.parseFloat(getComputedStyle(active.querySelector('.support-pack-reel-name')).fontSize),
      activeCopy: Number.parseFloat(getComputedStyle(active.querySelector('.support-pack-reel-copy')).fontSize),
      features: active.querySelectorAll('.support-pack-reel-features span').length,
      eyebrow: document.querySelectorAll('.support-packs-eyebrow').length,
      counter: document.querySelectorAll('[data-pack-reel-count]').length,
      nextSectionBorder: Number.parseFloat(style('.support-extras').borderTopWidth),
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  expect(geometry.leftDelta).toBeLessThanOrEqual(1);
  expect(geometry.rightDelta).toBeLessThanOrEqual(1);
  expect(geometry.sectionHeight).toBeLessThanOrEqual(940);
  expect(geometry.headingSizeDelta).toBeLessThanOrEqual(.5);
  expect(geometry.headingTrackingDelta).toBeLessThanOrEqual(.1);
  expect(geometry.coraWidthDelta).toBeLessThanOrEqual(1);
  expect(geometry.coraHeightDelta).toBeLessThanOrEqual(1);
  expect(geometry.activeTitle).toBeGreaterThanOrEqual(40);
  expect(geometry.activeCopy).toBeGreaterThanOrEqual(16);
  expect(geometry.features).toBe(3);
  expect(geometry.eyebrow).toBe(0);
  expect(geometry.counter).toBe(0);
  expect(geometry.nextSectionBorder).toBeGreaterThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
});

test('Add-on reel opens pack details and the catalogue can expand to all nine', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const section = page.locator('.support-packs');
  const activePack = section.locator('[data-pack-reel-item].is-active');
  await expect(activePack).toContainText('Server pack');
  const reel = section.locator('[data-pack-reel]');
  const box = await reel.boundingBox();
  await reel.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 71, isPrimary: true, clientX: box.x + box.width * .78, clientY: box.y + box.height / 2 });
  await reel.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 71, isPrimary: true, clientX: box.x + box.width * .22, clientY: box.y + box.height / 2 });
  await expect(section.locator('[data-pack-reel-item].is-active')).toContainText('Azure pack');
  await reel.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 72, isPrimary: true, clientX: box.x + box.width * .22, clientY: box.y + box.height / 2 });
  await reel.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 72, isPrimary: true, clientX: box.x + box.width * .78, clientY: box.y + box.height / 2 });
  await expect(section.locator('[data-pack-reel-item].is-active')).toContainText('Server pack');
  await section.locator('[data-pack-reel-item].is-active').click();
  await expect(page.getByRole('dialog', { name: 'Server pack' })).toBeVisible();
  await page.locator('#support-dialog-close').click();
  await expect(page.locator('#support-packs-grid [data-pack-card]:not([hidden])')).toHaveCount(9);
  await expect(page.locator('.support-pack-catalogue-head')).toBeVisible();

  const cardAccents = await page.locator('#support-packs-grid [data-pack-card]').evaluateAll(cards =>
    cards.map(card => getComputedStyle(card).getPropertyValue('--support-card-accent').trim())
  );
  expect(new Set(cardAccents).size).toBeGreaterThanOrEqual(7);

  await page.reload({ waitUntil: 'networkidle' });
  const viewAll = page.getByRole('button', { name: 'View all add-ons' });
  await expect(viewAll).toBeVisible();
  await viewAll.click();
  await expect(page.locator('#support-packs-grid [data-pack-card]:not([hidden])')).toHaveCount(9);
  await expect(page.locator('.support-pack-catalogue-head')).toBeVisible();
  await expect(viewAll).toBeHidden();
});

test('final services and CTA stay compact, distinct and contained', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  const mobile = await page.evaluate(() => {
    const extras = document.querySelector('.support-extras');
    const cta = document.querySelector('.support-cta');
    const panel = document.querySelector('.support-cta-panel');
    const cards = [...document.querySelectorAll('#support-services-grid .support-extra-card')];
    return {
      extrasHeight: extras.getBoundingClientRect().height,
      cardHeights: cards.map(card => card.getBoundingClientRect().height),
      accents: cards.map(card => getComputedStyle(card).getPropertyValue('--support-card-accent').trim()),
      ctaHeight: cta.getBoundingClientRect().height,
      panelHeight: panel.getBoundingClientRect().height,
      panelShadow: getComputedStyle(panel).boxShadow,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  expect(mobile.extrasHeight).toBeLessThanOrEqual(1150);
  expect(Math.max(...mobile.cardHeights)).toBeLessThanOrEqual(210);
  expect(mobile.accents).toEqual(['#4F85FF', '#F97316', '#22C55E', '#A855F7']);
  expect(mobile.ctaHeight).toBeLessThanOrEqual(525);
  expect(mobile.panelHeight).toBeLessThanOrEqual(430);
  expect(mobile.panelShadow).not.toBe('none');
  expect(mobile.overflow).toBeLessThanOrEqual(0);

  const closingCta = page.locator('.support-cta');
  await expect(closingCta.getByRole('link', { name: 'Start your free IT audit' })).toHaveAttribute('href', '/#free-it-audit');
  await expect(closingCta.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '/get-in-touch/');
});

test('homepage IT Solutions card keeps Solutions on its own line', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await expect(page.locator('.service-grid-card--solutions h2 br')).toHaveCount(1);
  await expect(page.locator('.service-grid-card--solutions h2')).toContainText(/We do IT\s*Solutions/);
});

test('IT Services landing page uses the four approved service cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/', { waitUntil: 'networkidle' });
  await expect(page.locator('main')).not.toContainText(/Page in progress|rebuilding this page/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Take your pick');
  await expect(page.locator('.it-services-pick')).toHaveText('pick');
  await expect(page.locator('.it-services-next')).toBeVisible();
  await expect(page.locator('.it-services-next-kicker')).toHaveCount(0);
  await expect(page.locator('.service-grid-card--solutions h2 br')).toHaveCount(1);
  await expect(page.locator('.service-grid-card')).toHaveCount(4);
  for (const href of ['/it-services/it-support/', '/it-services/it-solutions/', '/it-services/it-consultancy/', '/it-services/cybersecurity/']) {
    await expect(page.locator(`.service-grid-card a[href="${href}"]`)).toHaveCount(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('Remote Support is a real support dashboard with client portal and mobile containment', async ({ page }) => {
  for (const [width, height] of [[390, 844], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/remote-support/', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).not.toContainText(/Page in progress|rebuilding the remote support page/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Help is on the way');
    const heroGradient = await page.locator('.remote-support-copy h1').evaluate(el => {
      const style = getComputedStyle(el);
      return { image: style.backgroundImage, animation: style.animationName, fill: style.webkitTextFillColor || style.color };
    });
    expect(heroGradient.image).toContain('linear-gradient');
    expect(heroGradient.animation).toBe('remoteSupportHeroGradient');
    expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(heroGradient.fill);
    await expect(page.locator('.support-status-value--ok')).toHaveCSS('color', 'rgb(74, 222, 128)');
    await expect(page.locator('.support-action-card')).toHaveCount(4);
    await expect(page.locator('.support-action-card--portal')).toHaveAttribute('href', '/client-portal/');
    await expect(page.getByRole('link', { name: /Email support/i })).toHaveAttribute('href', 'mailto:support@stapleit.co.uk');
    await expect(page.getByRole('link', { name: /Call support/i })).toHaveAttribute('href', 'tel:+441372309707');
    await expect(page.getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', 'https://wa.me/441372309707');
    await expect(page.locator('.support-action-card--email .support-action-badge')).toHaveText('Fastest response');
    await expect(page.locator('.support-action-card--call .support-action-badge')).toHaveText('SELECT option 1');
    await expect(page.locator('[data-support-state]')).not.toHaveText('Checking…');
    await expect(page.locator('.support-save-button')).toHaveCount(3);
    await expect(page.locator('.support-save-button--iphone')).toContainText('iOS');
    await expect(page.locator('.support-save-button--android')).toBeVisible();
    await expect(page.locator('.support-save-button--outlook')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Keep our contact details handy' })).toBeVisible();
    const shader=page.locator('[data-shadergradient-root]');
    await expect(shader).toHaveCount(1);
    await page.locator('.support-save-panel').scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    const shaderState=await shader.getAttribute('data-shadergradient-state');
    expect(['active','static']).toContain(shaderState);
    await expect(shader.locator('canvas').first()).toBeVisible();
    expect(await page.locator('.support-save-panel').evaluate(el=>getComputedStyle(el).isolation)).toBe('isolate');
    const accents = await page.locator('.support-action-card').evaluateAll(cards => cards.map(card => getComputedStyle(card).getPropertyValue('--accent').trim()));
    expect(new Set(accents).size).toBe(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:4173/remote-support/', { waitUntil: 'networkidle' });
  const animatedPanel=page.locator('.support-save-panel');
  await animatedPanel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  const animatedShader=page.locator('[data-shadergradient-root]');
  if(await animatedShader.getAttribute('data-shadergradient-state')==='active') {
    const box=await animatedPanel.boundingBox();
    expect(box).not.toBeNull();
    const clip={x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(box.width,1280-Math.max(0,box.x)),height:Math.min(box.height,800-Math.max(0,box.y))};
    const firstFrame=await page.screenshot({clip,animations:'allow'});
    await page.waitForTimeout(700);
    const secondFrame=await page.screenshot({clip,animations:'allow'});
    expect(Buffer.compare(firstFrame,secondFrame)).not.toBe(0);
  }

  const holidayCheck = await page.evaluate(() => {
    const next = window.StapleSupportSchedule.nextOpenDate(new Date('2026-08-30T10:00:00Z'));
    const y2027 = window.StapleSupportSchedule.bankHolidaysForYear(2027);
    const y2028 = window.StapleSupportSchedule.bankHolidaysForYear(2028);
    const y2031 = window.StapleSupportSchedule.bankHolidaysForYear(2031);
    return {
      next: next.toISOString().slice(0, 10),
      checks: [y2027.has('2027-12-27'), y2027.has('2027-12-28'), y2028.has('2028-01-03'), y2031.has('2031-08-25')]
    };
  });
  expect(holidayCheck.next).toBe('2026-09-01');
  expect(holidayCheck.checks).toEqual([true, true, true, true]);
});

test('Get in Touch is a real contact route with working audit handoff', async ({ page }) => {
  await page.route('**/wp-admin/admin-ajax.php', async route => {
    const body = route.request().postData() || '';
    if (body.includes('stapleit_audit')) {
      await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ ok:true, message:'Thanks — your audit request has been received. We’ll get back to you within one working day.' }) });
      return;
    }
    await route.continue();
  });

  for (const [width, height] of [[390, 844], [1366, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/get-in-touch/', { waitUntil:'domcontentloaded' });
    await expect(page.getByRole('heading', { level:1, name:/Get in Touch/i })).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/Page in progress|rebuilding this page/i);
    await expect(page.getByRole('link', { name:'01372 309 707' })).toHaveAttribute('href', 'tel:+441372309707');
    await expect(page.getByRole('link', { name:'hello@stapleit.co.uk' })).toHaveAttribute('href', 'mailto:hello@stapleit.co.uk');
    await expect(page.getByRole('link', { name:'Click to chat' })).toHaveAttribute('href', 'https://wa.me/441372309707');
    await expect(page.locator('[data-contact-map-frame]')).toHaveCount(1);
    await expect(page.locator('[data-audit-form]')).toBeVisible();

    const geometry = await page.evaluate(() => {
      const observed = [...document.querySelectorAll('.contact-hero,.contact-panel,.contact-map-card,.audit-hero,.audit-form')];
      return {
        h1: document.querySelectorAll('main h1').length,
        overflow: document.documentElement.scrollWidth - innerWidth,
        hiddenObserved: observed.filter(element => Number.parseFloat(getComputedStyle(element).opacity) < .99).length,
        formRect: (() => {
          const rect = document.querySelector('[data-audit-form]')?.getBoundingClientRect();
          return rect ? { left:rect.left, right:rect.right, width:rect.width } : { left:0, right:0, width:0 };
        })(),
        clientWidth: document.documentElement.clientWidth
      };
    });
    expect(geometry.h1).toBe(1);
    expect(geometry.overflow).toBeLessThanOrEqual(0);
    expect(geometry.hiddenObserved).toBe(0);
    expect(geometry.formRect.left).toBeGreaterThanOrEqual(0);
    expect(geometry.formRect.right).toBeLessThanOrEqual(geometry.clientWidth + 1);
  }

  await page.setViewportSize({ width:390, height:844 });
  await page.goto('http://127.0.0.1:4173/get-in-touch/', { waitUntil:'domcontentloaded' });
  const form = page.locator('[data-audit-form]');
  await form.locator('input[name="name"]').fill('Test Visitor');
  await form.locator('input[name="email"]').fill('test@example.com');
  await form.locator('textarea[name="requirements"]').fill('General IT review');
  await form.locator('input[name="contact-consent"]').check();
  await form.getByRole('button', { name:'Request my free IT audit' }).click();
  await expect(form.locator('[data-audit-form-status]')).toContainText('received');
});

test('IT Audit is a real audit route and keeps contact fallback available', async ({ page }) => {
  for (const [width, height] of [[390, 844], [1366, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/get-in-touch/it-audit/', { waitUntil:'domcontentloaded' });
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toContainText(/Let us look over/i);
    await expect(page.locator('main')).not.toContainText(/Page in progress|rebuilding/i);
    await expect(page.locator('[data-audit-form]')).toBeVisible();
    await expect(page.locator('.contact-panel')).toBeVisible();
    await expect(page.getByRole('link', { name:'01372 309 707' })).toHaveAttribute('href', 'tel:+441372309707');
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      hidden: [...document.querySelectorAll('.audit-hero,.audit-form,.contact-hero,.contact-panel,.contact-map-card')].filter(element => Number.parseFloat(getComputedStyle(element).opacity) < .99).length,
      h1: document.querySelectorAll('main h1').length,
      h2: document.querySelectorAll('main h2').length
    }));
    expect(geometry.overflow).toBeLessThanOrEqual(0);
    expect(geometry.hidden).toBe(0);
    expect(geometry.h1).toBe(1);
    expect(geometry.h2).toBeGreaterThanOrEqual(2);
  }
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
  await expect.poll(async () => card.evaluate(element => Number.parseFloat(getComputedStyle(element, '::before').opacity))).toBeGreaterThanOrEqual(0.15);
  await expect.poll(async () => card.evaluate(element => Number.parseFloat(getComputedStyle(element, '::before').opacity))).toBeLessThanOrEqual(0.20);
  await context.close();
});


test('mobile tactile motion stays visual-only and never calls device vibration', async ({ page }) => {
  await page.addInitScript(() => {
    window.__stapleHaptics = [];
    Object.defineProperty(Navigator.prototype, 'vibrate', {
      configurable: true,
      value(pattern) {
        window.__stapleHaptics.push(pattern);
        return true;
      }
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-haptics', 'visual');

  const selector = '.support-packages .support-package-cora-trigger';
  const target = page.locator(selector);
  const box = await target.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  const dispatchTouch = async (type, { id, x, y, active = true }) => {
    await page.evaluate(({ selector, type, id, x, y, active }) => {
      const element = document.querySelector(selector);
      const touch = { identifier: id, clientX: x, clientY: y, pageX: x, pageY: y, screenX: x, screenY: y };
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        changedTouches: { value: [touch] },
        touches: { value: active ? [touch] : [] },
        targetTouches: { value: active ? [touch] : [] }
      });
      element.dispatchEvent(event);
    }, { selector, type, id, x, y, active });
  };

  await dispatchTouch('touchstart', { id: 41, x, y });
  await expect(target).toHaveClass(/is-tactile-pressed/);
  await dispatchTouch('touchend', { id: 41, x, y, active: false });
  await expect(target).not.toHaveClass(/is-tactile-pressed/);

  await page.evaluate(() => scrollBy(0, 500));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__stapleHaptics)).toEqual([]);
});

test('iOS does not inject native switch haptic overlays', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6 like Mac OS X) AppleWebKit/605.1.15 Version/26.6 Mobile/15E148 Safari/604.1'
    });
    Object.defineProperty(Navigator.prototype, 'platform', { configurable: true, get: () => 'iPhone' });
    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { configurable: true, get: () => 5 });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });

  await expect(page.locator('html')).toHaveAttribute('data-haptics', 'visual');
  await expect(page.locator('.staple-ios-haptic-switch')).toHaveCount(0);
  await page.locator('#menu-toggle').click();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
});


test('mobile motion remains compositor-first during a full-page interaction pass', async ({ page }) => {
  await page.addInitScript(() => {
    window.__staplePerf = { longTasks: [], cls: 0 };
    if (window.PerformanceObserver?.supportedEntryTypes?.includes('longtask')) {
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => window.__staplePerf.longTasks.push(entry.duration));
      }).observe({ type: 'longtask', buffered: true });
    }
    if (window.PerformanceObserver?.supportedEntryTypes?.includes('layout-shift')) {
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) window.__staplePerf.cls += entry.value;
        });
      }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/it-services/it-support/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 120));
    window.__staplePerf.longTasks = [];
    window.__staplePerf.cls = 0;
  });

  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    for (let step = 0; step <= 12; step += 1) {
      scrollTo(0, Math.round(max * (step / 12)));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    scrollTo(0, 0);
  });

  const performanceState = await page.evaluate(() => {
    const panel = document.querySelector('.cora-panel');
    const motion = document.querySelector('.motion-ready');
    return {
      maxLongTask: Math.max(0, ...window.__staplePerf.longTasks),
      cls: window.__staplePerf.cls,
      coraTransition: getComputedStyle(panel).transitionProperty,
      coraWillChange: getComputedStyle(panel).willChange,
      revealWillChange: motion ? getComputedStyle(motion).willChange : 'auto',
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  expect(performanceState.maxLongTask).toBeLessThanOrEqual(160);
  expect(performanceState.cls).toBeLessThanOrEqual(.03);
  expect(performanceState.coraTransition).not.toMatch(/filter|clip-path/);
  expect(performanceState.coraWillChange).toBe('auto');
  expect(performanceState.revealWillChange).toBe('auto');
  expect(performanceState.overflow).toBeLessThanOrEqual(0);
});


test('IT Services landing page uses a full premium canvas at desktop and stays contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:4173/it-services/', { waitUntil: 'networkidle' });
  const desktop = await page.evaluate(() => {
    const overview = document.querySelector('.it-services-overview').getBoundingClientRect();
    const hero = document.querySelector('#it-services-title');
    const firstCard = document.querySelector('.service-grid-card').getBoundingClientRect();
    const grid = document.querySelector('.service-card-grid');
    const next = document.querySelector('.it-services-next').getBoundingClientRect();
    const pick = getComputedStyle(document.querySelector('.it-services-pick'));
    return {
      overviewWidth: overview.width,
      heroSize: Number.parseFloat(getComputedStyle(hero).fontSize),
      firstCardWidth: firstCard.width,
      firstCardHeight: firstCard.height,
      gridGap: Number.parseFloat(getComputedStyle(grid).columnGap),
      nextWidth: next.width,
      pickFill: pick.webkitTextFillColor || pick.color,
      pickAnimation: pick.animationName,
      pickPaddingBottom: Number.parseFloat(pick.paddingBottom),
      heroOverflow: getComputedStyle(hero).overflow,
      heroTracking: Number.parseFloat(getComputedStyle(hero).letterSpacing),
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
  expect(desktop.overviewWidth).toBeGreaterThanOrEqual(1180);
  expect(desktop.heroSize).toBeGreaterThanOrEqual(91);
  expect(desktop.firstCardWidth).toBeGreaterThanOrEqual(560);
  expect(desktop.firstCardHeight).toBeGreaterThanOrEqual(480);
  expect(desktop.gridGap).toBeGreaterThanOrEqual(24);
  expect(desktop.nextWidth).toBeGreaterThanOrEqual(1180);
  expect(desktop.pickFill).not.toBe('rgb(255, 255, 255)');
  expect(desktop.pickAnimation).toContain('contactStapleShimmer');
  expect(desktop.pickPaddingBottom).toBeGreaterThanOrEqual(8);
  expect(desktop.heroOverflow).toBe('visible');
  expect(desktop.heroTracking).toBeGreaterThanOrEqual(-0.5);
  expect(desktop.overflow).toBeLessThanOrEqual(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const mobile = await page.evaluate(() => ({
    cards: [...document.querySelectorAll('.service-grid-card')].map(card => card.getBoundingClientRect().width),
    overview: document.querySelector('.it-services-overview').getBoundingClientRect().width,
    overflow: document.documentElement.scrollWidth - innerWidth,
    nextActions: getComputedStyle(document.querySelector('.it-services-next-actions')).gridTemplateColumns
  }));
  expect(mobile.cards).toHaveLength(4);
  expect(mobile.cards.every(width => width <= mobile.overview + 1)).toBe(true);
  expect(mobile.overflow).toBeLessThanOrEqual(0);
  expect(mobile.nextActions).not.toBe('none');
});
