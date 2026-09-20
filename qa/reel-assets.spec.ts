import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { reelAssets } from '../src/lib/reel-assets';
import { projects } from '../src/lib/portfolio';

test('cache manifest matches every Reel playback file without changing media', async () => {
  const paths = projects.filter(project => project.category === 'Reels').map(project => project.film!);
  expect(Object.keys(reelAssets).sort()).toEqual(paths.sort());
  for (const path of paths) {
    const bytes = await readFile('public' + path);
    expect(bytes.length).toBe(reelAssets[path].bytes);
    expect(createHash('sha256').update(bytes).digest('hex').slice(0, 16)).toBe(reelAssets[path].revision);
  }
});

// Exercise the actual cache module against real browser Cache Storage, with
// deterministic media responses; no production-only testing endpoint.
async function installCache(page: import('@playwright/test').Page) {
  await page.goto('/');
  const source = (await readFile('src/lib/reel-cache.ts', 'utf8'))
    .replace("import { reelAssets } from './reel-assets';", 'const reelAssets = ' + JSON.stringify(reelAssets) + ';')
    .replace(/^export /gm, '');
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  await page.addScriptTag({ content: code + '\nwindow.reelTest = { cachedReel, prepareReel, reelSource, allowReelPrefetch };' });
}
declare global {
  interface Window { reelTest: {
    cachedReel(path: string): Promise<Blob | undefined>;
    prepareReel(path: string, signal: AbortSignal): Promise<Blob | undefined>;
    reelSource(path: string): string;
    allowReelPrefetch(): boolean;
  }; }
}

test('cache evicts by file count and bytes, then expires stale revisions', async ({ page }) => {
  test.setTimeout(60000);
  await installCache(page);
  const paths = ['/media/eltacoria-app-film.mp4', '/media/eltacoria-translation-film.mp4', '/media/jury-cake-film.mp4', '/media/jury-eid-film.mp4'];
  for (const path of paths) {
    expect(await page.evaluate(async path => (await window.reelTest.prepareReel(path, new AbortController().signal))?.size, path)).toBe(reelAssets[path].bytes);
  }
  const index = () => page.evaluate(async () => (await (await caches.open('raden-reels-v1')).match('/__reel_cache__/index'))!.json());
  let entries = await index();
  expect(entries).toHaveLength(3);
  expect(entries.some((entry: {path: string}) => entry.path === paths[0])).toBe(false);
  for (const path of ['/media/cadillac-film.mp4', '/media/hazardous-film.mp4']) {
    expect(await page.evaluate(async path => (await window.reelTest.prepareReel(path, new AbortController().signal))?.size, path)).toBe(reelAssets[path].bytes);
  }
  entries = await index();
  expect(entries.reduce((sum: number, entry: {bytes: number}) => sum + entry.bytes, 0)).toBeLessThanOrEqual(64 * 1024 * 1024);
  await page.evaluate(async () => {
    const cache = await caches.open('raden-reels-v1');
    const entries = await (await cache.match('/__reel_cache__/index'))!.json();
    for (const entry of entries) entry.saved = 0;
    await cache.put('/__reel_cache__/index', new Response(JSON.stringify(entries)));
    await window.reelTest.cachedReel('/media/hazardous-film.mp4');
  });
  expect(await index()).toEqual([]);
  await page.evaluate(async () => {
    const cache = await caches.open('raden-reels-v1');
    const key = '/media/eltacoria-app-film.mp4?v=old';
    await cache.put(key, new Response('old'));
    await cache.put('/__reel_cache__/index', new Response(JSON.stringify([{ path: '/media/eltacoria-app-film.mp4', key, bytes: 3, saved: Date.now(), used: Date.now() }])));
    await window.reelTest.cachedReel('/media/eltacoria-app-film.mp4');
  });
  expect(await index()).toEqual([]);
});

test('cache denial, data saving and cancellation never require a download to play', async ({ page }) => {
  await installCache(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
  });
  expect(await page.evaluate(() => window.reelTest.allowReelPrefetch())).toBe(false);
  expect(await page.evaluate(async () => (await window.reelTest.prepareReel('/media/eltacoria-app-film.mp4', new AbortController().signal))?.size)).toBeUndefined();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '3g' } });
  });
  expect(await page.evaluate(() => window.reelTest.allowReelPrefetch())).toBe(false);
  expect(await page.evaluate(async () => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g' } });
    const controller = new AbortController(); controller.abort();
    return (await window.reelTest.prepareReel('/media/eltacoria-app-film.mp4', controller.signal))?.size;
  })).toBeUndefined();
  await page.evaluate(() => { Object.defineProperty(window, 'caches', { value: { open: () => Promise.reject(new DOMException('Denied', 'QuotaExceededError')) } }); });
  expect(await page.evaluate(async () => (await window.reelTest.cachedReel('/media/eltacoria-app-film.mp4'))?.size)).toBeUndefined();
  await page.locator('[data-project="eltacoria-app"] .project-visual').click();
  await expect.poll(() => page.locator('.player-screen video').evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2)).toBe(true);
});
