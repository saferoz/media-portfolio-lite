import { test, expect } from '@playwright/test';

test('Cadillac follows the four commercials, previews silently and plays with credits', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.reels-pair:not(.cadillac-feature) .project-card')).toHaveCount(4);
  const card = page.locator('[data-project="cadillac"]');
  const row = await page.locator('.reels-pair:not(.cadillac-feature)').boundingBox();
  const bounds = await card.boundingBox();
  expect(bounds!.y).toBeGreaterThan(row!.y + row!.height);
  await expect(card.locator('.project-film-label')).toContainText('Showcase reel');
  await expect(card.locator('.project-film-label')).not.toContainText('F&B');
  await card.scrollIntoViewIfNeeded();
  await card.locator('.project-visual').hover();
  await expect(card.locator('video')).toHaveAttribute('src', '/media/cadillac-escalade-v2-preview.mp4');
  expect(await card.locator('video').evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await card.locator('.project-visual').click();
  await expect(page.locator('.player-credit')).toContainText('Cadillac Alghanim Kuwait');
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(13.6, 0);
  await page.keyboard.press('Escape');
  await expect(card.locator('.project-visual')).toBeFocused();
  await page.locator('[data-project="cadillac-second"] .project-visual').click();
  await expect(page.locator('.player-screen video')).toHaveAttribute('src', '/media/cadillac-film.mp4');
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.duration)).toBeGreaterThan(100);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reels', exact: true }).click();
  await expect(page.getByRole('button', { name: /Play Cadillac Escalade.*Showcase/ })).toBeVisible();
});

test('student title preview and film cover twelve seconds; SwiftSoft credits client script', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Motion', exact: true }).click();
  await page.locator('.work-grid').evaluate(async grid => { await new Promise(requestAnimationFrame); await Promise.all(grid.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  const card = page.locator('[data-project="students-intro"]');
  await card.locator('.project-visual').hover();
  await expect.poll(() => card.locator('video').evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(12, 0);
  await card.locator('.project-visual').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(12, 0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'AI filmmaking', exact: true }).click();
  await page.getByRole('button', { name: 'Play SwiftSoft', exact: true }).click();
  await expect(page.locator('.player-credit')).toContainText('based on a script from SwiftSoft for their launch');
  await expect(page.locator('.film-dialog')).not.toHaveClass(/is-immersive/);
});

for (const mobile of [false, true]) {
  test(`Ajdan immersive ${mobile ? 'touch' : 'keyboard'} controls and focus restoration`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: mobile, isMobile: mobile });
    const page = await context.newPage();
    await page.goto(testInfo.project.use.baseURL || process.env.TEST_URL || 'http://127.0.0.1:3000');
    const opener = page.locator('[data-project="founding-day"] .project-visual');
    await opener.scrollIntoViewIfNeeded();
    if (mobile) await opener.tap(); else { await opener.focus(); await page.keyboard.press('Enter'); }
    const dialog = page.getByRole('dialog', { name: 'Saudi Founding Day' });
    await expect(dialog).toHaveClass(/is-immersive/);
    await expect(dialog.locator('.player-heading, .player-footer')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Close film' })).toBeFocused();
    await expect.poll(() => dialog.locator('video').evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    await expect.poll(async () => Math.round((await dialog.locator('video').boundingBox())!.width)).toBe(mobile ? 390 : 1440);
    await expect.poll(async () => Math.round((await dialog.locator('video').boundingBox())!.height)).toBe(mobile ? 844 : 900);
    await expect(dialog.locator('video')).toHaveCSS('object-fit', 'contain');
    await expect(dialog.locator('.immersive-controls')).not.toHaveClass(/is-visible/, { timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Close film' })).toBeVisible();
    if (mobile) await dialog.locator('video').tap(); else await page.mouse.move(200, 200);
    await expect(dialog.locator('.immersive-controls')).toHaveClass(/is-visible/);
    await page.getByRole('button', { name: 'Pause film', exact: true }).click();
    await expect.poll(() => dialog.locator('video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    const seek = page.getByRole('slider', { name: 'Seek film' });
    await seek.focus(); await seek.press('ArrowRight');
    await expect(dialog.locator('.immersive-controls')).toHaveClass(/is-visible/);
    await page.getByRole('button', { name: 'Mute film', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Unmute film' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`ajdan-${mobile ? 'mobile' : 'desktop'}.png`) });
    if (mobile) await page.getByRole('button', { name: 'Close film' }).tap(); else await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await opener.click();
    await expect(dialog).toHaveCSS('animation-name', 'none');
    await context.close();
  });

  test(`hero ${mobile ? 'mobile' : 'desktop'} opening poster, cold/warm cache and one rendition`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', r => { if (r.url().includes('/media/hero-')) requests.push(r.url()); });
    const device = mobile ? 'mobile' : 'desktop';
    for (const cache of ['cold', 'warm']) {
      await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
      const poster = page.locator('.hero-poster');
      await expect.poll(() => poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      expect(await poster.evaluate((i: HTMLImageElement) => i.currentSrc)).toContain(`hero-v${device === 'mobile' ? 6 : 4}-${device}-poster.webp`);
      await expect.poll(() => page.locator('.hero-video').evaluate((v: HTMLVideoElement) => v.readyState >= 2)).toBe(true);
      await page.getByRole('button', { name: 'Pause background video' }).click();
      for (const time of [0, 3.8, 5, 7.5, 9, 11.1, 13]) {
        await page.locator('.hero-video').evaluate((v: HTMLVideoElement, t) => { v.currentTime = t; }, time);
        await expect.poll(() => page.locator('.hero-video').evaluate((v: HTMLVideoElement) => !v.seeking)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`${device}-${cache}-${time}.png`) });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(requests.some(u => u.includes(`hero-v${device === 'mobile' ? 6 : 4}-${device}.mp4`))).toBe(true);
    expect(requests.some(u => u.includes(mobile ? '-desktop' : '-mobile'))).toBe(false);
    expect(requests.some(u => u.includes('hero-personal') || u.includes('archi'))).toBe(false);
    await context.close();
  });
}

test('hero loading and failed playback keep the new TENET poster', async ({ page }, testInfo) => {
  await page.route('**/hero-v4-desktop.mp4', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.hero-poster')).toHaveAttribute('src', '/media/hero-v4-desktop-poster.webp');
  await expect(page.locator('.hero-video')).not.toHaveClass(/is-ready/);
  await page.screenshot({ path: testInfo.outputPath('hero-fallback.png') });
});

test('contact links to the established LinkedIn profile beside Instagram', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'LinkedIn: Raden Hanifa' })).toHaveAttribute('href', 'https://www.linkedin.com/in/radenhanifa');
  await expect(page.locator('.contact-socials a')).toHaveCount(2);
});
