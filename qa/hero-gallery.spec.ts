import { test, expect } from '@playwright/test';

for (const viewport of [{width:1366,height:768},{width:1440,height:900},{width:1920,height:1080}]) {
 test(`desktop framing and galleries ${viewport.width}`, async ({ browser }, info) => {
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.location().url.includes('/_vercel/insights/')) errors.push(m.text()); });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/*.js*', async route => { await gate; await route.continue(); });
  await page.goto('/', {waitUntil:'commit'});
  await expect(page.locator('.hero-poster')).toBeVisible();
  const before = await page.locator('.hero-media').boundingBox();
  await expect(page.locator('.hero-media')).toHaveCSS('transform','none');
  await page.screenshot({path:info.outputPath('cold-poster.png')});
  release();
  await expect(page.locator('.hero-video')).toHaveClass(/is-ready/);
  expect(await page.locator('.hero-media').boundingBox()).toEqual(before);
  await page.getByRole('button',{name:'Pause background video'}).click();
  await page.screenshot({path:info.outputPath('hydrated-playback.png')});
  await page.unroute('**/*.js*');
  await page.reload();
  await expect(page.locator('.hero-video')).toHaveClass(/is-ready/);
  expect(await page.locator('.hero-media').boundingBox()).toEqual(before);
  await page.screenshot({path:info.outputPath('warm-playback.png')});
  for (const route of ['/color-grading','/work/oxfordsaudia-interviews','/work/oxfordsaudia-educational-series']) {
   await page.goto(route);
   await page.locator('details').evaluateAll(items => items.forEach(e => (e as HTMLDetailsElement).open = true));
   const frames = page.locator('.still-enlarge');
   expect(await frames.count()).toBeGreaterThan(0);
   for (const frame of await frames.all()) {
    expect((await frame.boundingBox())!.height).toBeCloseTo(Math.min(560,viewport.height*.55),0);
    await expect(frame.locator('img')).toHaveCSS('object-fit','contain');
   }
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await context.close();
 });
}

for (const reducedMotion of ['no-preference','reduce'] as const) {
 test(`grading navigation and history ${reducedMotion}`, async ({page}) => {
  await page.emulateMedia({reducedMotion});
  await page.goto('/');
  const link = page.getByRole('link',{name:'View color grading',exact:true});
  await link.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0,-100));
  if (reducedMotion === 'no-preference') { await expect(page.locator('html')).toHaveClass(/lenis/); await page.mouse.wheel(0,150); }
  await link.focus();
  const origin = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/color-grading#grading-intro$/);
  await expect.poll(() => page.locator('#grading-intro').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBe(78);
  await page.goBack();
  await expect(page).not.toHaveURL(/color-grading/);
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY)-origin)).toBeLessThan(160);
  await page.goForward();
  await expect.poll(() => page.locator('#grading-intro').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBe(78);
  await page.goto('/color-grading#student-interview');
  await expect(page.locator('#interview-heading')).toBeInViewport();
 });
}

for (const width of [320,390]) {
 test(`touch gallery swipe ${width}`, async ({browser},info) => {
  const context = await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,baseURL:info.project.use.baseURL});
  const page = await context.newPage();
  await page.goto('/color-grading');
  const gallery=page.getByRole('region',{name:'Color grading stills',exact:true});
  const track=gallery.locator('.stills-track');
  await track.scrollIntoViewIfNeeded();
  const box=(await track.boundingBox())!;
  const cdp=await context.newCDPSession(page);
  const y=Math.max(100,Math.min(600,box.y+box.height/2));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-50,y}]});
  for (let x=width-70;x>=40;x-=20) {
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
   await page.waitForTimeout(30);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(gallery.locator('.gallery-count')).toHaveText('2 / 4');
  // Wait for native momentum and scroll snapping before starting a new gesture.
  await expect.poll(() => track.evaluate(e => Math.abs(e.scrollLeft - (e.children[1] as HTMLElement).offsetLeft))).toBeLessThan(1);
  await page.waitForTimeout(350);
  await gallery.getByRole('button',{name:'Show Above the clouds',exact:true}).tap();
  await expect(gallery.locator('.gallery-count')).toHaveText('3 / 4');
  const opener=gallery.getByRole('button',{name:'Enlarge Above the clouds',exact:true});
  await opener.tap(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
 });
}

test('favicon and touch icon metadata respond successfully',async ({page,request}) => {
 await page.goto('/');
 for (const rel of ['icon','apple-touch-icon']) {
  const urls=await page.locator(`link[rel="${rel}"]`).evaluateAll(links => links.map(e => (e as HTMLLinkElement).href));
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) expect((await request.get(url)).ok()).toBe(true);
 }
 expect((await request.get('/favicon.ico')).headers()['content-type']).toMatch(/image/);
});
