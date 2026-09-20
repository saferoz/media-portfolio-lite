import { test, expect } from '@playwright/test';

test('mobile drag follows the finger and destination poster survives delayed loading', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: Object.assign(new EventTarget(), { saveData: true }) }));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.locator('[data-project="eltacoria-app"] .project-visual').tap();
  await expect(page.locator('.film-dialog')).toHaveClass(/is-reel-view/);
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await page.route('**/eltacoria-translation-film.mp4*', async route => { await gate; await route.continue(); });
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 380 }] });
  await expect.poll(() => page.locator('.reel-track').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBeLessThan(-150);
  await expect(page.locator('.reel-next [data-poster-project]')).toHaveAttribute('data-poster-project', 'eltacoria-translation');
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-translation');
  await expect(page.locator('.active-reel-poster')).toHaveAttribute('data-poster-project', 'eltacoria-translation');
  await expect(page.locator('.active-reel-poster img')).toHaveAttribute('src', '/media/eltacoria-translation-poster.webp');
  await page.screenshot({ path: '.local/cinematic/destination-loading.png' });
  release();
  await expect(page.locator('.active-reel-poster')).toHaveCount(0);
  expect(await page.locator('video').evaluateAll(videos => videos.filter(v => !(v as HTMLVideoElement).paused).length)).toBe(1);
  await context.close();
});

test('short and cancelled swipes settle, mute persists, keyboard can reverse', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.locator('[data-project="eltacoria-app"] .project-visual').tap();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 580 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-app');
  await expect.poll(() => page.locator('.reel-track').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBe(0);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 300 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect.poll(() => page.locator('.reel-track').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBe(0);
  await page.locator('.player-screen video').tap();
  await page.getByRole('button', { name: 'Mute film', exact: true }).tap();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-translation');
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-app');
  await expect(page.getByRole('button', { name: 'Previous reel', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Close film' }).tap();
  await expect(page.locator('.film-dialog')).toHaveCount(0);
  await context.close();
});

test('Reel caching starts only in expanded playback and survives reopening', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /same key|hydration/i.test(message.text())) errors.push(message.text()); });
  const files: string[] = [];
  page.on('request', request => { if (request.url().includes('-film.mp4')) files.push(request.url()); });
  await page.goto('/');
  expect(files).toHaveLength(0);
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  expect(files.every(url => url.includes('eltacoria-app-film.mp4'))).toBe(true);
  await page.getByRole('button', { name: 'Expand reel', exact: true }).click();
  await expect.poll(() => page.evaluate(async () => (await (await caches.open('raden-reels-v1')).keys()).some(key => key.url.includes('eltacoria-translation-film.mp4'))), { timeout: 20000 }).toBe(true);
  expect(files.every(url => /eltacoria-(app|translation)-film/.test(url))).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.player-screen video')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('.active-reel-poster')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.reload();
  await page.locator('[data-project="eltacoria-translation"] .project-visual').click();
  await expect(page.locator('.player-screen video')).toHaveAttribute('src', /^blob:/);
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  expect(errors).toEqual([]);
});

test('cinematic light responds to scroll without moving the reading layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('#about').scrollIntoViewIfNeeded();
  const light = page.locator('#about .studio-light-wash');
  const first = await light.evaluate(node => getComputedStyle(node).transform);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => light.evaluate(node => getComputedStyle(node).transform)).not.toBe(first);
  const offset = await light.evaluate(node => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
  expect(Math.abs(offset.x)).toBeLessThanOrEqual(40);
  expect(Math.abs(offset.y)).toBeLessThanOrEqual(12);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(light).toHaveCSS('transform', 'none');
});

test('failed destination artwork uses its own title and film retry remains available', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await page.route('**/eltacoria-translation-poster.webp', route => route.abort());
  await page.route('**/eltacoria-translation-film.mp4*', route => route.abort());
  await page.getByRole('button', { name: 'Expand reel', exact: true }).click();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.active-reel-poster')).toContainText('Ramadan Campaign');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.keyboard.press('Escape');
});

test('autoplay rejection exposes a working manual play action', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.closest('.player-screen') && !this.hasAttribute('data-allow-play')) return Promise.reject(new DOMException('Gesture required', 'NotAllowedError'));
      return original.call(this);
    };
  });
  await page.goto('/');
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await expect(page.locator('.player-retry')).toBeVisible();
  await page.locator('.player-screen video').evaluate(video => video.setAttribute('data-allow-play', 'true'));
  await page.locator('.player-retry').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((video: HTMLVideoElement) => !video.paused)).toBe(true);
  await expect(page.locator('.active-reel-poster')).toHaveCount(0);
});

test('closing while next Reel downloads cancels caching and all playback', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/eltacoria-translation-film.mp4*', async route => { await hold; await route.abort().catch(() => {}); });
  const request = page.waitForRequest('**/eltacoria-translation-film.mp4*');
  await page.getByRole('button', { name: 'Expand reel', exact: true }).click();
  await request;
  await page.getByRole('button', { name: 'Close film' }).click();
  release();
  await expect(page.locator('.film-dialog')).toHaveCount(0);
  expect(await page.evaluate(async () => (await (await caches.open('raden-reels-v1')).keys()).some(key => key.url.includes('eltacoria-translation-film')))).toBe(false);
});

for (const width of [320, 390, 1440]) {
  test(`closing sequence readable and contained at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /same key|hydration/i.test(message.text())) errors.push(message.text()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(page.locator('#about-heading')).toBeVisible();
    await expect(page.locator('.about-image')).toHaveCSS('border-radius', '12px');
    await expect(page.locator('.portrait-caption, .footer-signature, .section-eyebrow')).toHaveCount(0);
    await page.screenshot({ path: `.local/cinematic/about-${width}.png` });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `.local/cinematic/contact-${width}.png` });
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `.local/cinematic/footer-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.site-footer .wordmark').evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeLessThanOrEqual(23);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#about').scrollIntoViewIfNeeded();
    expect(await page.locator('.reveal-line > span').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).transform === 'none'))).toBe(true);
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await page.screenshot({ path: `.local/cinematic/about-light-${width}.png` });
    expect(errors).toEqual([]);
  });
}
