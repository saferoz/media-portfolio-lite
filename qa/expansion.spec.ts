import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';

test('interviews are long-form and project navigation preserves the correct BTS', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-project="interview-grade"]')).toHaveCount(1);
  await expect(page.locator('[data-project="diriyah"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'YouTube / Long-form', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await page.locator('[data-project="students"]').getByRole('link', { name: 'View project' }).click();
  await expect(page).toHaveURL(/work\/oxfordsaudia-interviews/);
  await expect(page.getByRole('heading', { name: 'On set with the students.' })).toBeVisible();
  await expect(page.locator('img[src*="students-bts"]')).toHaveCount(1);
  await expect(page.locator('img[src*="education-lighting"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore the interview grade' }).click();
  await expect(page).toHaveURL(/color-grading#student-interview/);
  const slider = page.getByRole('slider', { name: 'Reveal original student interview image' });
  await slider.fill('70');
  await expect.poll(() => page.locator('#student-interview .grade-original').evaluate(e => getComputedStyle(e).clipPath)).toBe('inset(0px 30% 0px 0px)');
  await slider.focus(); await page.keyboard.press('Home'); await expect(slider).toHaveValue('0');
  await page.keyboard.press('End'); await expect(slider).toHaveValue('100');
});

test('educational series has the featured episode and expandable production evidence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/oxfordsaudia-educational-series');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Aviation explained.');
  const gallery = page.getByRole('region', { name: 'Educational series behind the scenes' });
  await gallery.getByRole('button', { name: 'Show Planning the series' }).click();
  await expect(gallery.locator('.gallery-title')).toHaveText('Planning the series');
  const opener = gallery.getByRole('button', { name: 'Enlarge Planning the series' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', /education-planning/);
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  await expect(page.locator('img[src*="students-bts"]')).toHaveCount(0);
});

test('all new videos load and seek with one active player', async ({ page }) => {
  test.setTimeout(90_000);
  for (const [route, ids] of [['/', ['students','captains','hazardous','spiderman']], ['/color-grading', ['founding-day','diriyah','interview-grade','graduation']]] as const) {
    await page.goto(route);
    for (const id of ids) {
      const opener = page.locator(`[data-project="${id}"] .project-visual`);
      await opener.click();
      const video = page.locator('.player-screen video');
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState >= 2)).toBe(true);
      await video.evaluate((v: HTMLVideoElement) => { v.currentTime = Math.min(5, v.duration / 2); });
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.seeking && v.currentTime >= 4)).toBe(true);
      await expect.poll(() => page.locator('video').evaluateAll(v => v.filter(e => !(e as HTMLVideoElement).paused).length)).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
    }
  }
});

test('graduation is supporting grading work with optional BTS', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('[data-project="graduation"]')).toHaveCount(0);
  await page.goto('/color-grading');
  await expect(page.locator('.bts-disclosure')).not.toHaveAttribute('open');
  await page.locator('.bts-disclosure summary').click();
  await expect(page.locator('.disclosure-content')).toContainText('safety pilot');
  await expect(page.locator('.disclosure-content')).toContainText('Sony A7R IV');
  await page.getByRole('button', { name: 'Enlarge From the cockpit' }).click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', /graduation-bts/);
  await page.keyboard.press('Escape');
});

test('hero uses one bounded rendition without project credit boxes', async ({ page }) => {
  const media: string[] = [];
  page.on('request', request => { if (/hero-v4-(desktop|mobile)\.mp4/.test(request.url())) media.push(request.url()); });
  await page.goto('/');
  const hero = page.locator('.hero-video');
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => v.readyState >= 2)).toBe(true);
  await page.getByRole('button', { name: 'Pause background video' }).click();
  await hero.evaluate((v: HTMLVideoElement) => { v.currentTime = 5; });
  await expect(page.locator('.hero-feature, .hero-mobile-credit')).toHaveCount(0);
  await expect(page.locator('#hero-heading')).toContainText('final frame.');
  expect(await hero.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  expect(media.some(url => url.includes('hero-v4-mobile.mp4'))).toBe(false);
  expect(statSync('public/media/hero-v4-desktop.mp4').size).toBeLessThanOrEqual(3_500_000);
  expect(statSync('public/media/hero-v4-mobile.mp4').size).toBeLessThanOrEqual(1_800_000);
});

test('portfolio request uses the new address and prepared subject', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact')).toContainText('Want to');
  await expect(page.getByRole('link', { name: 'Instagram: @radenhanifa' })).toHaveAttribute('href', 'https://www.instagram.com/radenhanifa/');
  await expect(page.locator('#contact').getByRole('link', { name: 'Request full portfolio' })).toHaveAttribute('href', 'mailto:raden@radenhanifa.com?subject=Full%20portfolio%20request');
  await expect(page.getByRole('link', { name: 'raden@radenhanifa.com' })).toHaveAttribute('href', 'mailto:raden@radenhanifa.com');
});

for (const width of [320, 390, 1440]) {
  test(`new project pages fit both themes at ${width}px`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['/work/oxfordsaudia-interviews','/work/oxfordsaudia-educational-series']) {
      await page.goto(route);
      for (const theme of ['dark','light']) {
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });
}
