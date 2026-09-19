import { test, expect, chromium } from '@playwright/test';

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`project introductions and history ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    for (const id of ['students', 'captains', 'hazardous', 'students-intro', 'captains-intro']) {
      await page.goto('/');
      const link = page.locator(`[data-project="${id}"] .project-detail-link`);
      await link.scrollIntoViewIfNeeded();
      if (reducedMotion === 'no-preference') await page.mouse.wheel(0, 150);
      await link.click();
      await expect(page).toHaveURL(/#project-intro$/);
      await expect.poll(() => page.locator('#project-intro').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBe(78);
      const position = await page.evaluate(() => scrollY);
      await page.waitForTimeout(350);
      expect(await page.evaluate(() => scrollY)).toBe(position);
    }
    await page.goto('/');
    await page.getByRole('button', { name: 'YouTube / Long-form', exact: true }).click();
    const link = page.locator('[data-project="students"] .project-detail-link');
    await link.scrollIntoViewIfNeeded();
    await link.focus();
    const origin = await page.evaluate(() => scrollY);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#project-intro$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await page.goBack();
    await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - origin)).toBeLessThan(160);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await page.getByRole('link', { name: 'Explore the interview grade' }).click();
    await expect(page).toHaveURL(/#student-interview$/);
    await expect(page.locator('#interview-heading')).toBeInViewport();
    await page.goto('/');
    await page.getByRole('link', { name: 'Behind the series' }).click();
    await expect(page).toHaveURL(/educational-series#project-intro$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await page.goto('/work/oxfordsaudia-interviews#project-intro');
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  });
}

test('native scrollbar drag takes over from wheel momentum without snap-back', async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--disable-features=OverlayScrollbar'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const width = await page.evaluate(() => document.documentElement.clientWidth);
    expect(width).toBeLessThan(1440);
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(30);
    const initial = await page.evaluate(() => ({ top: scrollY, height: document.documentElement.scrollHeight }));
    const x = (width + 1440) / 2;
    const thumb = 17 + 866 * initial.top / initial.height + 20;
    await page.mouse.move(x, thumb);
    await page.mouse.down();
    await page.mouse.move(x, 400, { steps: 12 });
    const down = await page.evaluate(() => scrollY);
    expect(down).toBeGreaterThan(2500);
    await page.mouse.move(x, 180, { steps: 12 });
    const up = await page.evaluate(() => scrollY);
    expect(up).toBeLessThan(down - 1000);
    await page.mouse.up();
    await page.waitForTimeout(500);
    expect(Math.abs(await page.evaluate(() => scrollY) - up)).toBeLessThan(2);
    await page.mouse.move(5, 400);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(up + 200);
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  } finally { await browser.close(); }
});

test('studio light stays decorative, bounded and static under reduced motion', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const wash = page.locator('#work .studio-light-wash');
  await expect(wash).not.toHaveCSS('transform', 'none');
  await page.locator('#work').scrollIntoViewIfNeeded();
  const first = await wash.evaluate(e => getComputedStyle(e).transform);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => wash.evaluate(e => getComputedStyle(e).transform)).not.toBe(first);
  expect(Math.abs(await wash.evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m42))).toBeLessThanOrEqual(12);
  await expect(page.locator('#work .studio-light')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#work .studio-light')).toHaveCSS('pointer-events', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(wash).toHaveCSS('transform', 'none');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`about-${width}-${theme}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('touch and data-saving backgrounds remain static without disabling native scrolling', async ({ browser }) => {
  for (const saveData of [false, true]) {
    const context = await browser.newContext({ viewport: { width: saveData ? 1440 : 390, height: 900 }, hasTouch: !saveData, isMobile: !saveData });
    if (saveData) await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: Object.assign(new EventTarget(), { saveData: true }) }));
    const page = await context.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
    await page.waitForTimeout(350);
    await expect(page.locator('#work .studio-light-wash')).toHaveCSS('transform', 'none');
    await page.evaluate(() => window.scrollTo({ top: 1800, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1800);
    await expect(page.locator('#work .studio-light-wash')).toHaveCSS('transform', 'none');
    await context.close();
  }
});
