import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const origin = 'https://media.radenhanifa.com';
const canonicalUrl = (path: string) => path === '/' ? origin : origin + path;
const pages = [
  ['/', 'Raden Hanifa — Media Producer & Cinematographer'],
  ['/color-grading', 'Color Grading Portfolio — Raden Hanifa'],
  ['/work/oxfordsaudia-interviews', 'OxfordSaudia Aviation Interviews — Raden Hanifa'],
  ['/work/oxfordsaudia-educational-series', 'OxfordSaudia Aviation Educational Videos — Raden Hanifa'],
] as const;

test('sitemap contains only the four canonical pages and robots advertises it', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toContain('xml');
  const xml = await sitemap.text();
  expect([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).sort())
    .toEqual(pages.map(([path]) => canonicalUrl(path)).sort());
  expect([...xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(match => match[1]))
    .toEqual([`${origin}/media/portrait.webp`]);
  expect(xml).not.toMatch(/lastmod|hreflang|\/ar|localhost|vercel\.app/);
  expect(xml).not.toMatch(/llms(?:-full)?\.txt/);
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await robots.text()).toContain('User-Agent: *');
  expect(await robots.text()).toContain('Allow: /');
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
});

for (const [path, title] of pages) {
  test(`server-rendered SEO is complete and self-canonical: ${path}`, async ({ page, request }) => {
    const response = await request.get(`${path}?utm_source=seo-check`);
    expect(response.status()).toBe(200);
    expect(response.headers()['x-robots-tag'] || '').not.toContain('noindex');
    const html = await response.text();
    // Inspect the response with JS disabled: metadata must not depend on hydration.
    await page.route('**/*', route => route.abort());
    await page.setContent(html);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalUrl(path));
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonicalUrl(path));
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Raden Hanifa');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Raden Hanifa/);
    await expect(page.locator('link[hreflang]')).toHaveCount(0);
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count()) expect(await robots.getAttribute('content')).not.toContain('noindex');
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText())['@graph'];
    const person = graph.find((entry: { '@type': string }) => entry['@type'] === 'Person');
    const website = graph.find((entry: { '@type': string }) => entry['@type'] === 'WebSite');
    const webPage = graph.find((entry: { '@type': string }) => entry['@type'] === 'WebPage');
    const portrait = graph.find((entry: { '@type': string }) => entry['@type'] === 'ImageObject');
    expect(person['@id']).toBe('https://radenhanifa.com/#person');
    expect(person.jobTitle).toBe('Media Producer & Cinematographer');
    expect(person.description).toBe('Raden Hanifa is a media producer and cinematographer whose portfolio includes commercial reels, aviation interviews and educational videos, color grading and AI filmmaking.');
    expect(person.sameAs).toContain('https://cv.radenhanifa.com');
    expect(person).not.toHaveProperty('address');
    expect(person).not.toHaveProperty('areaServed');
    expect(person).not.toHaveProperty('hasCredential');
    expect(website.creator['@id']).toBe(person['@id']);
    expect(webPage.url).toBe(canonicalUrl(path));
    expect(webPage.isPartOf['@id']).toBe(website['@id']);
    expect(webPage.author['@id']).toBe(person['@id']);
    expect(webPage.inLanguage).toBe('en');
    if (path === '/') {
      await expect(page.locator('link[rel="describedby"][href="/llms.txt"][type="text/plain"]')).toHaveCount(1);
      expect(person.image['@id']).toBe(`${origin}/media/portrait.webp#image`);
      expect(webPage.primaryImageOfPage['@id']).toBe(person.image['@id']);
      expect(portrait).toMatchObject({
        '@id': person.image['@id'], contentUrl: `${origin}/media/portrait.webp`,
        width: 900, height: 1153, representativeOfPage: true,
      });
      await expect(page.getByAltText('Portrait of Raden Hanifa, media producer and cinematographer')).toHaveCount(1);
      expect((await request.get('/media/portrait.webp')).status()).toBe(200);
    } else {
      expect(portrait).toBeUndefined();
      expect(webPage).not.toHaveProperty('primaryImageOfPage');
    }
    await expect(page.locator('main')).toContainText(path === '/' ? 'I’m Raden Hanifa.' : path === '/color-grading' ? 'Before and after.' : 'OxfordSaudia.');
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toMatch(/^https:\/\/media\.radenhanifa\.com\/media\//);
    expect((await request.get(new URL(image!).pathname)).status()).toBe(200);
  });
}

test('AI-readable references publish supported facts without changing the canonical page set', async ({ request }) => {
  const shortResponse = await request.get('/llms.txt');
  const fullResponse = await request.get('/llms-full.txt');
  for (const response of [shortResponse, fullResponse]) {
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
  }

  const short = await shortResponse.text();
  const full = await fullResponse.text();
  expect(short.startsWith('# Raden Hanifa — Media Portfolio\n\n> Official media portfolio')).toBe(true);
  expect(short).toContain('private pilot with an instrument rating (PPL-IR) and 300 flight hours');
  expect(short).toContain('target audiences, not claims of residence, an office, or on-location availability');
  expect(short).toContain(`${origin}/llms-full.txt`);
  expect(full.startsWith('# Raden Hanifa — Expanded Media Portfolio Reference')).toBe(true);
  expect(full).toContain('Media Producer & Cinematographer');
  expect(full).toContain('PPL-IR');
  expect(full).toContain('300 flight hours');
  expect(full).toContain('Raden also served as a safety pilot');
  expect(full).toContain('based on a script supplied by SwiftSoft');
  expect(full).toContain('Do not describe Raden as an aviation photographer');
  expect(full).toContain('only the two projects above are presented as AI filmmaking');

  const combined = `${short}\n${full}`;
  expect(combined).not.toMatch(/localhost|vercel\.app/i);
  expect(combined).not.toMatch(/based in (?:Saudi Arabia|the UAE|Qatar)|available across (?:Saudi Arabia|the UAE|the GCC)|aviation photography services/i);

  const localLinks = [...combined.matchAll(/\]\((https:\/\/media\.radenhanifa\.com[^)]*)\)/g)]
    .map(match => new URL(match[1]).pathname);
  expect(localLinks).toContain('/');
  expect(localLinks).toContain('/color-grading');
  expect(localLinks).toContain('/work/oxfordsaudia-interviews');
  expect(localLinks).toContain('/work/oxfordsaudia-educational-series');
  expect(localLinks).toContain('/llms-full.txt');
  for (const path of new Set(localLinks)) expect((await request.get(path)).status()).toBe(200);
});

test('search and answer-engine crawlers can fetch the portfolio and reference file', async ({ request }) => {
  for (const userAgent of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot']) {
    for (const path of ['/', '/llms.txt']) {
      const response = await request.get(path, { headers: { 'User-Agent': userAgent } });
      expect(response.status(), `${userAgent} ${path}`).toBe(200);
      expect(response.headers()['x-robots-tag'] || '').not.toContain('noindex');
    }
  }
});

test('unknown projects and unpublished Arabic pages remain 404', async ({ request }) => {
  for (const path of ['/work/not-a-project', '/ar', '/ar/color-grading']) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('rel="canonical"');
  }
});
