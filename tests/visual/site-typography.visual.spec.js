const { test, expect } = require('@playwright/test');

const routes = [
  '/', '/it-services/', '/it-services/it-support/', '/it-services/it-solutions/',
  '/it-services/it-consultancy/', '/it-services/cybersecurity/', '/it-services/ai-integrations/',
  '/about-us/', '/about-us/who-we-support/', '/about-us/our-partners/', '/about-us/privacy-policy/',
  '/about-us/legal/', '/get-in-touch/', '/get-in-touch/it-audit/', '/client-portal/',
  '/remote-support/', '/the-staple-blog/', '/holding/', '/404.html'
];

const majorHeadingSelector = [
  '.section-heading h2', '.services-header h2', '.audience-header h2', '.trust-sticky h2',
  '.google-review-hero h2', '.partners-header h2', '.audit-hero h2', '.contact-hero h2',
  '.support-section-heading h2', '.remote-support-section-head h2'
].join(',');

const featureHeadingSelector = [
  '.home-statement-card h2', '.service-grid-card .service-slide h2',
  '.audit-form-heading h2', '.audit-form-heading h3', '.support-standard h2',
  '.support-pack-catalogue-head h3', '.support-pack-reel-item.is-active .support-pack-reel-name',
  '.support-save-copy h2'
].join(',');

const cardHeadingSelector = [
  '.audience-item h3', '.trust-proof h3', '.google-review-copy h3',
  '.contact-panel h2', '.contact-panel h3', '.support-package-card h3',
  '.support-step-card h3', '.support-extra-card h3', '.support-action-copy strong'
].join(',');

const uiSelector = [
  '.button', '.service-cta', '.support-hero-cta', '.support-package-cora-trigger',
  '.support-packs-more-btn', '.audit-submit', '.contact-whatsapp'
].join(',');

for (const [width, height, expected] of [
  [390, 844, { hero: [44, 46], section: [36, 37.5], feature: [29, 31], card: [24, 26], ui: [14.5, 15.5], heroTrack: -0.6, sectionTrack: -0.35 }],
  [768, 1024, { hero: [64, 66], section: [53, 55], feature: [37.5, 39.5], card: [30, 32], ui: [14.5, 15.5], heroTrack: -1.3, sectionTrack: -0.8 }],
  [1440, 1000, { hero: [91, 93], section: [80, 82], feature: [45, 47], card: [31, 33], ui: [14.5, 15.5], heroTrack: -1.8, sectionTrack: -1.1 }]
]) {
  test(`site-wide typography contract holds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
      const state = await page.evaluate(selector => {
        const metric = element => {
          const style = getComputedStyle(element);
          const font = Number.parseFloat(style.fontSize);
          const line = Number.parseFloat(style.lineHeight);
          const track = style.letterSpacing === 'normal' ? 0 : Number.parseFloat(style.letterSpacing);
          return { font, line, track };
        };
        const visibleMetrics = selector => [...document.querySelectorAll(selector)]
          .filter(element => {
            if (!element.getClientRects().length || element.getAttribute('aria-hidden') === 'true') return false;
            const style = getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > .05;
          }).map(metric);
        const h1 = visibleMetrics('h1');
        const h2 = visibleMetrics(selector.major);
        const feature = visibleMetrics(selector.feature);
        const card = visibleMetrics(selector.card);
        const ui = visibleMetrics(selector.ui);
        const headings = visibleMetrics('h1,h2,h3,h4');
        return { h1, h2, feature, card, ui, headings, overflow: document.documentElement.scrollWidth - innerWidth };
      }, { major: majorHeadingSelector, feature: featureHeadingSelector, card: cardHeadingSelector, ui: uiSelector });

      for (const heading of state.h1) {
        expect(heading.font, `${route} H1 size`).toBeGreaterThanOrEqual(expected.hero[0]);
        expect(heading.font, `${route} H1 size`).toBeLessThanOrEqual(expected.hero[1]);
        expect(heading.line / heading.font, `${route} H1 line-height`).toBeGreaterThanOrEqual(1.01);
        expect(heading.track, `${route} H1 tracking`).toBeGreaterThanOrEqual(expected.heroTrack);
      }
      for (const heading of state.h2) {
        expect(heading.font, `${route} H2 size`).toBeGreaterThanOrEqual(expected.section[0]);
        expect(heading.font, `${route} H2 size`).toBeLessThanOrEqual(expected.section[1]);
        expect(heading.line / heading.font, `${route} H2 line-height`).toBeGreaterThanOrEqual(1.05);
        expect(heading.track, `${route} H2 tracking`).toBeGreaterThanOrEqual(expected.sectionTrack);
      }
      for (const heading of state.feature) {
        expect(heading.font, `${route} feature size`).toBeGreaterThanOrEqual(expected.feature[0]);
        expect(heading.font, `${route} feature size`).toBeLessThanOrEqual(expected.feature[1]);
        expect(heading.line / heading.font, `${route} feature line-height`).toBeGreaterThanOrEqual(1.08);
      }
      for (const heading of state.card) {
        expect(heading.font, `${route} card size`).toBeGreaterThanOrEqual(expected.card[0]);
        expect(heading.font, `${route} card size`).toBeLessThanOrEqual(expected.card[1]);
        expect(heading.line / heading.font, `${route} card line-height`).toBeGreaterThanOrEqual(1.1);
      }
      for (const control of state.ui) {
        expect(control.font, `${route} UI size`).toBeGreaterThanOrEqual(expected.ui[0]);
        expect(control.font, `${route} UI size`).toBeLessThanOrEqual(expected.ui[1]);
      }
      for (const heading of state.headings) {
        expect(heading.line / heading.font, `${route} heading line-height quality`).toBeGreaterThanOrEqual(.98);
        expect(heading.track / heading.font, `${route} heading tracking quality`).toBeGreaterThanOrEqual(-.006);
      }
      expect(state.overflow, `${route} overflow`).toBeLessThanOrEqual(0);
    }
  });
}
