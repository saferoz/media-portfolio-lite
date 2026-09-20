import { test, expect } from '@playwright/test';

test('Reels open without native chrome, reveal controls and settle navigation', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.locator('[data-project="eltacoria-app"] .project-visual').tap();
  const video = page.locator('.player-screen video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2)).toBe(true);
  await expect(video).not.toHaveAttribute('controls');
  await expect(page.locator('.immersive-controls')).not.toHaveClass(/is-visible/);
  const close = page.getByRole('button', { name: 'Close film' });
  await expect(close).toHaveCSS('width', '44px');
  await page.locator('.film-dialog').evaluate(async el => { await Promise.allSettled(el.getAnimations().map(a => a.finished)); });
  await page.screenshot({ path: info.outputPath('compact-details.png') });
  await video.tap();
  await expect(page.locator('.immersive-controls')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Play film', exact: true }).tap();
  await expect(page.locator('.film-dialog')).toHaveClass(/is-reel-view/);
  await page.getByRole('button', { name: 'Next reel', exact: true }).tap();
  await expect(page.locator('.player-screen')).toHaveAttribute('data-active-project', 'eltacoria-translation');
  await expect(page.locator('.reel-outgoing')).toHaveCount(0);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await expect(page.locator('.reel-navigation')).toHaveCSS('opacity', '0.18');
  await page.screenshot({ path: info.outputPath('quiet-reel.png') });
  await close.tap();
  await expect(page.locator('.film-dialog')).toHaveCount(0);
  await context.close();
});

test('desktop comparisons fit the viewport and hero copy separates AI work', async ({ page }, info) => {
  await page.setViewportSize({ width: 1795, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-description')).toContainText('I also make AI films.');
  const comparison = page.locator('.interview-comparison .grade-comparison');
  await comparison.scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
  const size = await comparison.boundingBox();
  expect(size!.height).toBeLessThanOrEqual(680);
  expect(size!.width / size!.height).toBeCloseTo(16 / 9, 1);
  await page.screenshot({ path: info.outputPath('comparison-desktop.png') });
});
