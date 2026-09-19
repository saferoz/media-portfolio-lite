import { test, expect } from '@playwright/test';

test('grading entry, original/final slider and keyboard control', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Color grading', exact: true }).click();
  const homeSlider = page.getByRole('slider', { name: 'Reveal original image' });
  await homeSlider.fill('25');
  await expect.poll(() => page.locator('.grade-original').first().evaluate(e => getComputedStyle(e).clipPath)).toBe('inset(0px 75% 0px 0px)');
  await expect(page).not.toHaveURL(/color-grading/);
  await page.getByRole('link', { name: 'View color grading' }).click();
  await expect(page).toHaveURL(/color-grading/);
  const slider = page.getByRole('slider', { name: 'Reveal original image' });
  await slider.fill('80');
  await expect.poll(() => page.locator('.grade-original').first().evaluate(e => getComputedStyle(e).clipPath)).toBe('inset(0px 20% 0px 0px)');
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(slider).toHaveValue('0');
  await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  await expect(page.locator('.grade-comparison > img').first()).toHaveAttribute('src', /grading-after/);
  await expect(page.locator('.grade-original img').first()).toHaveAttribute('src', /grading-before/);
});

test('stills carousel, keyboard navigation, enlarge and focus return', async ({ page }) => {
  await page.goto('/color-grading');
  await expect(page.getByRole('region', { name: 'Color grading stills', exact: true }).getByRole('button', { name: 'Previous still', exact: true })).toBeDisabled();
  await page.getByRole('region', { name: 'Color grading stills', exact: true }).getByRole('button', { name: 'Next still', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Color grading stills', exact: true }).locator('.gallery-count')).toHaveText('2 / 4');
  const opener = page.getByRole('button', { name: 'Enlarge From log to the final look' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.getByRole('button', { name: 'Show Daylight grading' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Color grading stills', exact: true }).locator('.gallery-count')).toHaveText('4 / 4');
  await expect(page.getByRole('region', { name: 'Color grading stills', exact: true }).getByRole('button', { name: 'Next still', exact: true })).toBeDisabled();
});

test('commercial films preview and play independently with attribution', async ({ page }) => {
  await page.goto('/');
  for (const id of ['eltacoria-translation', 'eltacoria-app', 'jury-eid', 'jury-cake']) {
    const card = page.locator(`[data-project="${id}"]`);
    await card.locator('button').hover();
    await expect(card.locator('video')).toHaveAttribute('src', `/media/${id}-preview.mp4`);
    await card.locator('button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.player-screen video')).toHaveAttribute('src', `/media/${id}-film.mp4`);
    await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState >= 2)).toBe(true);
    if (id === 'eltacoria-app') await expect(page.locator('.player-credit')).toContainText('Abdullah Alzahrani');
    await expect.poll(() => page.locator('video').evaluateAll(videos => videos.filter(v => !(v as HTMLVideoElement).paused).length)).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(card.locator('button')).toBeFocused();
  }
});

for (const width of [320, 390, 1440]) {
  test(`grading remains usable in both themes at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/color-grading');
    for (const theme of ['dark', 'light']) {
      if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode' }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Show Above the clouds' }).click();
      await expect(page.getByRole('region', { name: 'Color grading stills', exact: true }).locator('.gallery-count')).toHaveText('3 / 4');
      await expect(page.locator('html')).not.toHaveClass(/lenis/);
    }
    expect(errors).toEqual([]);
  });
}

test('desktop glide, reversal, anchor landing and live reduced-motion toggle', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.mouse.wheel(0, 480);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(470);
  await page.mouse.wheel(0, -240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(250);
  await page.locator('nav a[href="#work"]').click();
  await expect.poll(() => page.locator('#work').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBe(110);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('.hero-content')).toHaveCSS('transform', 'none');
});
