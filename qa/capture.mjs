import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const destination = '.local/screenshots';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3000/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${destination}/${name}-hero-dark.png` });
  for (const id of ['work', 'about', 'contact']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `${destination}/${name}-${id}-dark.png` });
  }
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.screenshot({ path: `${destination}/${name}-contact-light.png` });
  for (const id of ['about', 'work']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `${destination}/${name}-${id}-light.png` });
  }
  await page.screenshot({ path: `${destination}/${name}-full-light.png`, fullPage: true });
  await page.getByRole('button', { name: 'Play SwiftSoft', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.locator('.player-screen video').evaluate(video => { video.pause(); video.currentTime = 1; });
  await page.screenshot({ path: `${destination}/${name}-player.png` });
  await page.close();
}
console.log(JSON.stringify({ errors, screenshots: destination }));
await browser.close();
