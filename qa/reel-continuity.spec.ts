import { test, expect } from '@playwright/test';

test('interrupting a Reel slide does not strand playback, and successive swipes play', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.locator('[data-project="eltacoria-app"] .project-visual').tap();
  const video = page.locator('.player-screen video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => ({
    advancing: !v.paused && v.currentTime > 0,
    paused: v.paused, time: v.currentTime, ready: v.readyState,
    network: v.networkState, error: v.error?.message,
  }))).toMatchObject({ advancing: true });
  const session = await context.newCDPSession(page);
  const start = () => session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
  const move = () => session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 320 }] });
  const end = () => session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await start(); await move(); await end();
  // Interrupt while the outgoing panel is still settling, then cancel the new gesture.
  await start();
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-app');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await expect.poll(() => page.locator('.reel-track').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBe(0);
  for (const id of ['eltacoria-translation', 'jury-cake', 'jury-eid', 'cadillac', 'cadillac-second']) {
    await start(); await move(); await end();
    await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', id);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > .05)).toBe(true);
    expect(await page.locator('video').evaluateAll(nodes => nodes.filter(v => !(v as HTMLVideoElement).paused).length)).toBe(1);
  }
  await video.tap();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await video.evaluate((v: HTMLVideoElement) => { v.currentTime = 65; v.dispatchEvent(new Event('timeupdate')); });
  await expect(page.locator('.playback-time')).toHaveText('1:05 / 1:41');
  await expect(page.locator('.reel-context')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.screenshot({ path: '.local/rewarding/reel-mobile.png' });
  await context.close();
});

test('reveal waits until the content is noticeably inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(1, 100);
  const heading = page.locator('.education-feature-copy h3');
  const line = heading.locator('.reveal-line > span').first();
  await expect.poll(() => line.evaluate(el => el.getAnimations().some(a => a.playState === 'paused'))).toBe(true);
  await heading.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .92, behavior: 'instant' }));
  await page.waitForTimeout(150);
  expect(await line.evaluate(el => el.getAnimations().some(a => a.playState === 'paused'))).toBe(true);
  await heading.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .65, behavior: 'instant' }));
  await expect.poll(() => line.evaluate(el => el.getAnimations().some(a => a.playState === 'running'))).toBe(true);
  await expect.poll(() => line.evaluate(el => el.getAnimations().length)).toBe(0);
  await page.screenshot({ path: '.local/rewarding/aviation-desktop.png' });
});

test('project arrival animates after homepage navigation and respects reduced motion', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Behind the series' }).click();
  await expect(page).toHaveURL(/oxfordsaudia-educational-series/);
  const heading = page.locator('.grading-intro h1');
  await expect(heading).toHaveCSS('animation-name', 'project-arrive');
  await expect.poll(() => heading.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(70);
  await page.screenshot({ path: '.local/rewarding/project-arrival.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(heading).toHaveCSS('animation-name', 'none');
  await expect(heading).toHaveCSS('transform', 'none');
});
