import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
for (const section of ['about', 'contact', 'footer']) {
  await page.locator(section === 'footer' ? '.site-footer' : '#' + section).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '.local/cinematic/review-' + section + '.jpg', quality: 55 });
}
await browser.close();
const mobileBrowser = await chromium.launch();
const mobile = await mobileBrowser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
for (const theme of ['dark', 'light']) {
  await mobile.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
  for (const section of ['about', 'contact']) {
    await mobile.locator('#' + section).scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(1000);
    await mobile.screenshot({ path: '.local/cinematic/review-' + section + '-mobile-' + theme + '.jpg', quality: 65 });
  }
}
await mobileBrowser.close();
