import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const destination = '.local/screenshots';
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:3000';
async function capture(page, name, fullPage = false) {
  await page.locator('img').evaluateAll(async images => {
    await Promise.all(images.filter(image => { const rect = image.getBoundingClientRect(); return rect.bottom > 0 && rect.top < innerHeight; }).map(image => {
      image.loading = 'eager';
      return Promise.race([image.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 5000))]);
    }));
  });
  await page.screenshot({ path: `${destination}/${name}.png`, fullPage });
}
await mkdir(destination, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await capture(page, `${name}-hero-dark`);
  for (const id of ['work', 'about', 'contact']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await capture(page, `${name}-${id}-dark`);
  }
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await capture(page, `${name}-contact-light`);
  for (const id of ['about', 'work']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await capture(page, `${name}-${id}-light`);
  }
  await capture(page, `${name}-full-light`, true);
  await page.getByRole('button', { name: 'Play SwiftSoft', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.locator('.player-screen video').evaluate(video => { video.pause(); video.currentTime = 1; });
  await capture(page, `${name}-player`);
  await page.goto(`${baseURL}/color-grading`);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await capture(page, `${name}-grading-${theme}`);
    await page.locator('.grading-gallery-section').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await capture(page, `${name}-gallery-${theme}`);
  }
  await page.close();
}
console.log(JSON.stringify({ errors, screenshots: destination }));
await browser.close();
