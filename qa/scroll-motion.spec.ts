import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`continuous scroll keeps cards and captions stable at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, isMobile: width === 390 });
    const page = await context.newPage();
    await page.goto(process.env.TEST_URL!);
    await page.evaluate(() => {
      const audit = { running: true, violations: [] as string[], imageMotion: 0 };
      (window as any).__scrollAudit = audit;
      const positions = new Map<Element, number>();
      const sample = () => {
        for (const card of document.querySelectorAll<HTMLElement>('.project-card')) {
          const box = card.getBoundingClientRect();
          const top = box.top + scrollY;
          if (positions.has(card) && Math.abs(top - positions.get(card)!) > .5) audit.violations.push('card moved independently of scroll');
          positions.set(card, top);
          const style = getComputedStyle(card);
          if (style.clipPath !== 'none' || style.opacity !== '1' || style.transform !== 'none') audit.violations.push('card frame clipped, faded or transformed');
          if (card.querySelector('.project-visual > img')?.getAnimations().length) audit.imageMotion++;
        }
        if (audit.running) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.mouse.move(5, 400);
    for (const delta of [500, 500, 500, 500, -500, -500, 500, 500]) {
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(180);
    }
    const audit = await page.evaluate(() => { const a = (window as any).__scrollAudit; a.running = false; return a; });
    expect(audit.violations).toEqual([]);
    expect(audit.imageMotion).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.locator('.project-card img').evaluateAll(images => images.flatMap(image => image.getAnimations()).length)).toBe(0);
    await context.close();
  });
}
