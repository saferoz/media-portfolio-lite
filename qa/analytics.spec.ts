import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { gunzipSync } from 'node:zlib';

function loadModule(file: string, globals: Record<string, unknown>) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  runInNewContext(code, { exports, ...globals });
  return exports as typeof import('../src/lib/analytics');
}

test('initialization is production-host only and fails closed for missing configuration', () => {
  for (const hostname of ['localhost', '127.0.0.1', 'preview.vercel.app', 'media.radenhanifa.com']) {
    for (const configured of [true, false]) {
      const calls: Record<string, unknown>[] = [];
      let enabled = false;
      loadModule('instrumentation-client.ts', {
        window: { location: { hostname } },
        process: { env: { NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: configured ? 'test-token' : '', NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com' } },
        require: (name: string) => name === 'posthog-js'
          ? { default: { init: (_token: string, config: Record<string, unknown>) => calls.push(config) } }
          : { enableAnalytics: () => { enabled = true; } },
      });
      const allowed = hostname === 'media.radenhanifa.com' && configured;
      expect(calls).toHaveLength(allowed ? 1 : 0);
      expect(enabled).toBe(allowed);
      if (allowed) expect(calls[0]).toMatchObject({ autocapture: false, disable_session_recording: true, defaults: '2026-05-30' });
    }
  }
});

test('explicit events are inert until enabled, include pathname, and isolate SDK failures', () => {
  const analytics = loadModule('src/lib/analytics.ts', { window: { location: { pathname: '/color-grading' } } });
  const events: unknown[] = [];
  analytics.trackEvent('cv_clicked', { action_location: 'about' });
  analytics.enableAnalytics((name, properties) => { events.push({ name, properties }); });
  analytics.trackEvent('film_started', { action_location: 'film_viewer', project_id: 'cadillac', project_category: 'Reels' });
  expect(events).toEqual([{ name: 'film_started', properties: { page_path: '/color-grading', action_location: 'film_viewer', project_id: 'cadillac', project_category: 'Reels' } }]);
  analytics.enableAnalytics(() => { throw new Error('blocked analytics'); });
  expect(() => analytics.trackEvent('cv_clicked', { action_location: 'about' })).not.toThrow();
});

test('local navigation and film playback make no PostHog requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (/posthog\.com/.test(request.url())) requests.push(request.url()); });
  await page.goto('/');
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  const video = page.locator('.player-screen video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await page.goto('/color-grading');
  expect(requests).toEqual([]);
});

test('production events track navigation, keyboard contact intent and actual playback once', async ({ browser, baseURL }) => {
  test.setTimeout(90000);
  const context = await browser.newContext({ reducedMotion: 'reduce', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
  // Simulate an ordinary visitor; keep production bot filtering intact.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined });
  });
  const events: { event: string; properties: Record<string, unknown> }[] = [];
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === 'media.radenhanifa.com') {
      const response = await context.request.get(`${baseURL}${url.pathname}${url.search}`);
      await route.fulfill({ response });
    } else if (url.hostname.endsWith('posthog.com')) {
      if (url.pathname.endsWith('.js')) {
        await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
        return;
      }
      const body = request.postDataBuffer();
      if (body) {
        try {
          const decoded = body[0] === 0x1f && body[1] === 0x8b ? gunzipSync(body).toString() : body.toString();
          const parsed = JSON.parse(url.searchParams.get('compression') === 'base64' ? Buffer.from(new URLSearchParams(decoded).get('data')!, 'base64').toString() : decoded);
          events.push(...(Array.isArray(parsed) ? parsed : parsed.batch ?? [parsed]).filter((item: { event?: string }) => item.event));
        } catch { /* Configuration requests are not event batches. */ }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, featureFlags: {}, sessionRecording: false }) });
    } else await route.abort();
  });
  const page = await context.newPage();
  const count = (event: string) => events.filter(item => item.event === event).length;
  await page.goto('https://media.radenhanifa.com');
  await expect.poll(() => count('$pageview'), { timeout: 15000 }).toBe(1);
  const requestLink = page.getByRole('link', { name: 'Request full portfolio' });
  await requestLink.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => count('portfolio_request_clicked'), { timeout: 15000 }).toBe(1);
  await page.locator('a.contact-email').click();
  await page.getByRole('link', { name: /The longer story/ }).click();
  await expect.poll(() => count('contact_email_clicked'), { timeout: 15000 }).toBe(1);
  await expect.poll(() => count('cv_clicked'), { timeout: 15000 }).toBe(1);
  const films = /\.mp4(?:\?|$)/;
  await context.route(films, route => route.abort());
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => Boolean(v.error))).toBe(true);
  expect(count('film_started')).toBe(0);
  await page.keyboard.press('Escape');
  await context.unroute(films);
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  const video = page.locator('.player-screen video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await expect.poll(() => count('film_started'), { timeout: 15000 }).toBe(1);
  await video.evaluate(async (v: HTMLVideoElement) => { v.pause(); await v.play(); });
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'View color grading' }).first().click();
  await expect(page).toHaveURL(/color-grading/);
  await expect.poll(() => count('$pageview'), { timeout: 15000 }).toBe(2);
  await page.goBack();
  await expect.poll(() => count('$pageview'), { timeout: 15000 }).toBe(3);
  await page.goForward();
  await expect.poll(() => count('$pageview'), { timeout: 15000 }).toBe(4);
  await page.goBack();
  await expect.poll(() => count('$pageview'), { timeout: 15000 }).toBe(5);
  expect(count('film_started')).toBe(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await expect.poll(() => count('film_started'), { timeout: 15000 }).toBe(2);
  await page.getByRole('button', { name: 'Next reel', exact: true }).click();
  await expect.poll(() => count('film_started'), { timeout: 15000 }).toBe(3);
  await page.getByRole('button', { name: 'Previous reel', exact: true }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Request full portfolio' }).click();
  await expect.poll(() => count('portfolio_request_clicked'), { timeout: 15000 }).toBe(2);
  expect(count('film_started')).toBe(3);
  expect(events.find(item => item.event === 'film_started')?.properties).toMatchObject({ project_id: 'eltacoria-app', project_category: 'Reels', page_path: '/', action_location: 'film_viewer' });
  expect(count('$autocapture')).toBe(0);
  expect(count('$snapshot')).toBe(0);
  await context.close();
});
