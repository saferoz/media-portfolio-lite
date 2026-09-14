import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`Reel pairs keep equal sizes and confirmed order at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const ids = await page.locator('.reels-pair .project-card').evaluateAll(cards => cards.map(c => c.getAttribute('data-project')));
    expect(ids).toEqual(['eltacoria-app', 'eltacoria-translation', 'jury-cake', 'jury-eid', 'cadillac', 'cadillac-second']);
    const first = await page.locator('[data-project="eltacoria-app"] .project-visual').boundingBox();
    const cadillac = await page.locator('[data-project="cadillac"] .project-visual').boundingBox();
    expect(Math.abs(first!.width - cadillac!.width)).toBeLessThan(1);
    await page.locator('.cadillac-feature').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`reels-${width}.png`) });
    await expect(page.locator('[data-project="eltacoria-translation"] h3')).toContainText('Ramadan Campaign');
    await expect(page.locator('[data-project="jury-cake"] h3')).toContainText('Eid Showcase');
  });
}

test('expanded Reels preserve position, browse intentionally and restore focus', async ({ page }, info) => {
  const films: string[] = [];
  page.on('request', r => { if (/-(film)\.mp4/.test(r.url())) films.push(r.url()); });
  await page.goto('/');
  const opener = page.locator('[data-project="eltacoria-app"] .project-visual');
  await opener.click();
  const video = page.locator('.player-screen video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await video.evaluate((v: HTMLVideoElement) => { v.pause(); v.currentTime = 4; v.dataset.identity = 'same-video'; });
  await page.getByRole('button', { name: 'Expand reel', exact: true }).click();
  await expect(page.locator('.film-dialog')).toHaveClass(/is-reel-view/);
  await expect(video).toHaveAttribute('data-identity', 'same-video');
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(4, 0);
  await expect(page.locator('.player-heading, .player-footer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous reel', exact: true })).toBeDisabled();
  expect(films.every(u => u.includes('eltacoria-app-film.mp4'))).toBe(true);
  await page.getByRole('button', { name: 'Show reel details' }).click();
  await expect(video).toHaveAttribute('data-identity', 'same-video');
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(4, 0);
  await page.getByRole('button', { name: 'Expand reel' }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await expect(video).toHaveAttribute('src', '/media/eltacoria-translation-film.mp4');
  await expect(page.locator('.reel-context')).toContainText('Ramadan Campaign');
  await page.mouse.move(300, 300);
  await page.mouse.wheel(0, 120);
  await expect(video).toHaveAttribute('src', '/media/jury-cake-film.mp4');
  await page.mouse.wheel(0, 120);
  await expect(video).toHaveAttribute('src', '/media/jury-cake-film.mp4');
  expect(await page.locator('video').evaluateAll(videos => videos.filter(v => !(v as HTMLVideoElement).paused).length)).toBeLessThanOrEqual(1);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await page.screenshot({ path: info.outputPath('expanded-desktop.png') });
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(page.locator('.film-dialog')).toHaveCount(0);
});

test('touch Reel navigation and independent comparison sliders', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.locator('[data-project="cadillac"] .project-visual').tap();
  await page.getByRole('button', { name: 'Expand reel' }).tap();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 550 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 350 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.player-screen video')).toHaveAttribute('src', '/media/cadillac-film.mp4');
  await expect(page.locator('.reel-context')).toContainText('Walkthrough');
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await page.locator('.player-screen video').tap();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.locator('.player-screen video').tap();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.screenshot({ path: info.outputPath('expanded-mobile.png') });
  await page.getByRole('button', { name: 'Close film' }).tap();
  await expect(page.locator('.film-dialog')).toHaveCount(0);
  const original = page.getByRole('slider', { name: 'Reveal original image', exact: true });
  const interview = page.getByRole('slider', { name: 'Reveal original student interview image', exact: true });
  await original.fill('20'); await interview.fill('75');
  await expect(original).toHaveValue('20'); await expect(interview).toHaveValue('75');
  await interview.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('comparison-mobile.png') });
  await context.close();
});

test('reduced motion keeps expanded navigation immediate and caption excerpt complete', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await page.getByRole('button', { name: 'Expand reel' }).click();
  expect(await page.locator('.player-screen').evaluate(e => e.getAnimations().length)).toBe(0);
  await page.getByRole('button', { name: 'Next reel', exact: true }).click();
  expect(await page.locator('.player-screen').evaluate(e => e.getAnimations().length)).toBe(0);
  await page.getByRole('button', { name: 'Show reel details' }).click();
  await expect(page.locator('.player-heading')).not.toContainText('script');
  await expect(page.locator('.player-credit')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('[data-project="captains-intro"] .project-visual').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(8, 0);
});


test('AI order and launch copy reflect the confirmed brief', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.ai-pair .project-card').evaluateAll(cards => cards.map(c => c.getAttribute('data-project')))).toEqual(['spiderman', 'swiftsoft']);
  await expect(page.locator('.contact-region')).toContainText('Saudi Arabia, the UAE');
  await page.locator('[data-project="swiftsoft"] .project-visual').click();
  await expect(page.locator('.player-credit')).toContainText('based on a script from SwiftSoft for their launch');
});


test('contact invites the full craft and both roles and projects', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.contact-intro')).toContainText('filming, cinematography, editing, color grading and AI filmmaking');
  const action = page.getByRole('link', { name: 'Discuss a project or role', exact: true });
  await expect(action).toHaveAttribute('href', 'mailto:raden@radenhanifa.com?subject=Project%20or%20role%20enquiry');
  await expect(page.getByRole('link', { name: 'Request full portfolio', exact: true })).toHaveAttribute('href', /Full%20portfolio%20request/);
  await action.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('contact-mobile.png') });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
