# SEO foundation and Arabic preparation

## Release scope

Technical SEO only. Preserve all visitor-facing English text, layouts, controls, media and credits. The media portfolio is independently canonical at https://media.radenhanifa.com. The Adobe site at radenhanifa.com and CV at cv.radenhanifa.com remain untouched. A future main-domain replacement does not automatically move the media portfolio.

Primary positioning: Media Producer & Cinematographer for general agencies, brands and employers, with aviation as a demonstrated specialty through the OxfordSaudia projects. The CV connects aviation and media experience; the future main domain acts as a hybrid personal-brand home. Clients and employers have equal priority. Saudi Arabia, UAE and Qatar are research priorities, then the wider GCC; these are not published office, residence or availability claims. Keep availability private.

## Unpublished Arabic drafts

These drafts are documentation only, not runtime metadata. Keep Raden Hanifa in Latin script until the preferred Arabic spelling is confirmed. Do not emit Arabic URLs, hreflang, structured descriptions or language claims before equivalent visible pages exist.

| English URL | Future Arabic URL | Draft Arabic title |
| --- | --- | --- |
| / | /ar | Raden Hanifa — منتج محتوى مرئي ومصور سينمائي |
| /color-grading | /ar/color-grading | أعمال تصحيح الألوان والتلوين السينمائي — Raden Hanifa |
| /work/oxfordsaudia-interviews | /ar/work/oxfordsaudia-interviews | مقابلات طلاب وطياري أكاديمية أكسفورد السعودية — Raden Hanifa |
| /work/oxfordsaudia-educational-series | /ar/work/oxfordsaudia-educational-series | فيديوهات تعليمية للطيران لأكاديمية أكسفورد السعودية — Raden Hanifa |

Draft homepage description: استكشف أفلام ومحتوى العلامات التجارية من إنتاج Raden Hanifa، وأعمال التصوير السينمائي والمونتاج والتلوين في مشاريع تجارية ومقابلات وفيديوهات تعليمية للطيران.

Draft grading description: استكشف أعمال Raden Hanifa في تصحيح الألوان والتلوين لمقابلات أكاديمية أكسفورد السعودية وفيلم التخرج، وقارن اللقطات الأصلية بالنتيجة النهائية.

Draft interviews description: مقابلات طلاب وطياري أكاديمية أكسفورد السعودية، من كتابة النص والإخراج والتصوير إلى المونتاج والعناوين المتحركة ومعالجة الحوار، بتنفيذ Raden Hanifa.

Draft educational description: دروس مصورة لطلاب الطيران، منها المواقف الخطرة الخمسة. كتابة النص والإخراج والتصوير والمونتاج ومعالجة الصوت من تنفيذ Raden Hanifa.

Arabic release gate: translate body text, navigation, captions, accessible names and controls; implement RTL with agent editorial and visual QA. English URLs remain unchanged. Arabic pages self-canonicalize. Add reciprocal en/ar alternates plus x-default pointing to English only when both pages return 200. Provide equivalent-page language switching; no IP/language redirect. Add only published Arabic pages to the sitemap. Metadata describes the same visible content, not extra claims.

## Growth work deferred from this release

1. A substantial aviation service page and deeper case studies, with verified project roles and supporting evidence. Cover aviation media/video production naturally; target aviation photography only when a relevant still-photo portfolio and confirmed credits are published. Do not imply photography coverage from video work alone.
2. Full Arabic pages with the release gate above.
3. Relevant links from existing profiles and authentic client/project credits; no automated outreach or backlink-network publishing.
4. Video metadata only after publication dates and crawler-visible playback are verified. Preserve interaction-only full-film loading.
5. Main-domain migration only after its role is decided: inventory old URLs, map equivalent replacements, implement permanent redirects, retain useful content and verify canonical/sitemap consistency.

## Deployment and monitoring checklist

- Build and test locally, then independently verify the deployed custom domain. Git push is not proof of deployment.
- Check production HTTP status, robots headers/meta, canonical, JSON-LD, social artwork, sitemap and robots.txt. Inspect preview deployment headers separately; retain hosting-provided preview protection. Do not add global index directives that could conflict with it.
- Validate deployed structured data with https://validator.schema.org/. Valid Person/WebSite/WebPage data does not promise a Google rich result.
- Submit https://media.radenhanifa.com/sitemap.xml in the verified radenhanifa.com Search Console Domain property after the endpoint is live. The homepage indexing request has already been submitted; do not repeatedly request it.
- After 7 and 28 days, record sitemap processing and all four pages' indexing and selected canonical. Compare impressions/clicks by query, page and country; sparse data is inconclusive.
- Separate branded queries (Raden Hanifa) from service queries (aviation media producer, aviation video production). Search volumes and ranking improvements are unmeasured.
- For AI observations record date, platform, exact prompt, locale, answer, cited URLs and sample count. Separate retrieval/citation, name recognition and actual recommendation. Repeat a small fixed prompt set; one answer is not a stable ranking.

## Baseline supplied by the user, 2026-09-20

Search Console DNS ownership verified for radenhanifa.com. The media homepage was unknown to Google, with no crawl/referring sitemap recorded. Live test then fetched successfully, with crawling/indexing allowed and no declared canonical. Indexing requested. User observed /sitemap.xml returning 404. Google AI Overview screenshot recognized Raden as an aviation media producer/private pilot and cited LinkedIn; it does not establish service-query recommendations or credentials independently verified by this implementation.

## Tooling and evidence boundaries

Installed local skills: seo-audit 2.0.1, schema 2.0.0 and ai-seo 2.5.0 from coreyhaines31/marketingskills. They are agent guidance, not website dependencies. Use official search-engine guidance over speculative skill claims; do not repeat unverified visibility percentages or conflate training crawlers with search crawlers. No llms.txt, synthetic statistics, fabricated freshness dates, hidden Arabic content or unsupported local-business markup.

References: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
