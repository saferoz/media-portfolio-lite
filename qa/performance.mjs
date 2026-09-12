import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const session = await page.context().newCDPSession(page);
await session.send('Network.enable');
await session.send('Network.setCacheDisabled', { cacheDisabled: true });
await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 });
await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => {
  window.__portfolioMetrics = { lcp: 0, cls: 0 };
  new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__portfolioMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__portfolioMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
const results = await page.evaluate(() => ({ ...window.__portfolioMetrics, resources: performance.getEntriesByType('resource').map(entry => ({ name: entry.name.split('/').pop(), transferSize: entry.transferSize, duration: Math.round(entry.duration) })), fullFilmFetched: performance.getEntriesByType('resource').some(entry => entry.name.includes('swiftsoft-film')) }));
const report = { environment: 'Local production build, Chromium, 390x844, cold browser cache, 4x CPU throttle, 1.6Mbps down, 150ms latency; single lab run, not field data.', ...results };
await mkdir('.local', { recursive: true });
await writeFile('.local/performance.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ lcpMs: Math.round(report.lcp), cls: report.cls, totalTransferBytes: report.resources.reduce((total, entry) => total + entry.transferSize, 0), fullFilmFetched: report.fullFilmFetched }));
await browser.close();
