# SEO foundation and Arabic preparation

## Search appearance audit follow-up, 2026-09-22

The live audit found all four canonical pages, robots, sitemap and both AI references accessible. The About portrait is already the homepage primary image and Person image; the portrait and navy white/cyan RH icon files matched local assets. The user explicitly retained cinematic social-sharing artwork. Do not replace it or remove legitimate student/client images to try to force Google's thumbnail.

Next authenticated check: inspect Search Console's last crawl, indexed HTML, selected canonical and sitemap processing. Compare the crawled portrait/favicon references with production. If the indexed copy predates the release and no indexing request is pending, request indexing once. Record dates and subsequent appearance rather than repeatedly changing stable image URLs. If current signals are processed and the student remains selected, record Google's selection despite preferred-image signals; no guaranteed image switch is claimed.

Keep branded appearance separate from service discovery. Future commercial case studies can balance the existing aviation-specific pages, but no new page, credential, geographic coverage or visible copy is authorized by this technical follow-up. Continue the fixed prompt observations below; private Search Console results and cross-platform citation observations remain pending, not inferred from successful HTTP requests.

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

## AI-readable portfolio phase, 2026-09-21

This phase adds public, non-visual reference files at `/llms.txt` and `/llms-full.txt`. The short file supplies discovery, positioning and canonical links; the expanded file records supported project credits, identity URLs, the owner-approved PPL-IR credential and 300 flight hours, and explicit evidence boundaries. The root layout advertises `/llms.txt` with `rel="describedby"`. These files are supplementary discovery aids for compatible agents, not canonical HTML pages, and remain outside the visible navigation and four-page XML sitemap.

No visible aviation landing page is added in this phase. The media portfolio remains Media Producer & Cinematographer first, with aviation as demonstrated work. The CV remains hybrid, while the future main domain will revisit the broader personal-brand architecture. Do not add LocalBusiness, address, `areaServed`, region-wide availability or hidden credential schema. Do not target aviation photography until supporting still-photo work is published.

Google states that AI Overviews and AI Mode use the same core SEO requirements as Search and require no special AI file or markup. Accordingly, `llms.txt` is not represented as a Google ranking factor, an indexing instruction, or a guarantee of AI citation. The strongest signals remain useful visible pages, crawlability, accurate entity consistency and genuine third-party references.

Fixed observation prompts for 2-, 4- and 8-week checks:

1. Who is Raden Hanifa?
2. Raden Hanifa media producer
3. Aviation media producer Saudi Arabia
4. Aviation videographer Saudi Arabia
5. Who produced the OxfordSaudia interview videos?

Run each prompt three to five times where practical across Google, ChatGPT and Perplexity. Record exact prompt, locale, date, mention, recommendation wording, citation URL and sample count. In PostHog, review referrals containing `utm_source=chatgpt.com`; a referral is evidence of a visit, not of stable recommendation rank.

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

Installed local skills: seo-audit 2.0.1, schema 2.0.0 and ai-seo 2.5.0 from coreyhaines31/marketingskills. They are agent guidance, not website dependencies. Use official search-engine guidance over speculative skill claims; do not repeat unverified visibility percentages or conflate training crawlers with search crawlers. Public llms reference files are supplemental only; do not add synthetic statistics, fabricated freshness dates, hidden Arabic content or unsupported local-business markup.

References: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
