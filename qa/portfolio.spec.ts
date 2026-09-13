import { test, expect } from '@playwright/test';

test('dark default, light persistence and no runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('theme remains usable when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage unavailable'); } }); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('hover previews only; click plays full film, Escape stops it and restores focus', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.mp4')) requests.push(request.url()); });
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Play SwiftSoft', exact: true });
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect.poll(() => page.locator('[data-project="swiftsoft"] .card-preview').evaluate((video: HTMLVideoElement) => !video.paused && video.readyState >= 2)).toBe(true);
  expect(requests.some(url => url.includes('swiftsoft-preview.mp4'))).toBe(true);
  expect(requests.some(url => url.includes('swiftsoft-film.mp4'))).toBe(false);
  await card.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.player-screen video')).toHaveAttribute('src', '/media/swiftsoft-film.mp4');
  await expect.poll(() => page.locator('video').evaluateAll(videos => videos.filter(v => !(v as HTMLVideoElement).paused).length)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).not.toHaveAttribute('src', /./);
});

test('leaving hover stops and unloads preview', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Play SwiftSoft', exact: true });
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).toHaveAttribute('src', '/media/swiftsoft-preview.mp4');
  await page.locator('#work-heading').hover();
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).not.toHaveAttribute('src', /./);
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).not.toHaveClass(/is-ready/);
});

test('filters and playable motion intros', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reels', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(5);
  await expect(page.locator('.project-card button')).toHaveCount(5);
  await expect(page.locator('.placeholder-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'AI filmmaking', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Play SwiftSoft', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Color grading', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Color grading.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View color grading' })).toHaveAttribute('href', '/color-grading');
  await page.getByRole('button', { name: 'All work', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(13);
  await page.getByRole('button', { name: 'Motion', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(page.locator('.placeholder-card')).toHaveCount(0);
  for (const id of ['students-intro', 'captains-intro']) {
    await page.locator(`[data-project="${id}"] .project-visual`).click();
    await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState >= 2)).toBe(true);
    await page.keyboard.press('Escape');
  }
  await expect(page.locator('.placeholder-card button')).toHaveCount(0);
});

test('reduced motion loads no decorative video; keyboard playback works', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.mp4')) requests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Play SwiftSoft', exact: true });
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(page.locator('.hero-video')).not.toHaveAttribute('src', /./);
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).not.toHaveAttribute('src', /./);
  expect(requests).toEqual([]);
  await card.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close film' })).toBeFocused();
  await page.getByRole('button', { name: 'Close film' }).click();
  await expect(card).toBeFocused();
});

test('failed film offers recovery', async ({ page }) => {
  await page.route('**/swiftsoft-film.mp4', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Play SwiftSoft', exact: true }).click({ force: true });
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('The film couldn’t load');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.getByRole('button', { name: 'Close film' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`no horizontal overflow at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    for (const theme of ['dark', 'light']) {
      if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode' }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('#hero-heading')).toBeVisible();
    }
  });
}

test('data saving keeps static posters', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g', addEventListener() {}, removeEventListener() {} }, configurable: true }); });
  await page.goto('/');
  const card = page.getByRole('button', { name: 'Play SwiftSoft', exact: true });
  await card.scrollIntoViewIfNeeded(); await card.hover();
  await expect(page.locator('.hero-video')).not.toHaveAttribute('src', /./);
  await expect(page.locator('[data-project="swiftsoft"] .card-preview')).not.toHaveAttribute('src', /./);
});

test('mobile touch opens film in one tap and never requests a hover preview', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000/');
  const card = page.getByRole('button', { name: 'Play SwiftSoft', exact: true });
  await card.scrollIntoViewIfNeeded();
  await card.tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.locator('.player-screen video').evaluate((video: HTMLVideoElement) => video.readyState >= 2)).toBe(true);
  expect(requests.some(url => url.includes('swiftsoft-preview.mp4'))).toBe(false);
  await page.getByRole('button', { name: 'Close film' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await context.close();
});

test('pausing an opening film does not show a false error', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play SwiftSoft', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.locator('.player-screen video').evaluate((video: HTMLVideoElement) => video.pause());
  await expect(page.locator('.player-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close film' }).click();
});
