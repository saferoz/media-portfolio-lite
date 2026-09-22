# Focused portfolio analytics

PostHog initializes only on `media.radenhanifa.com` when both public configuration variables exist. Localhost, preview domains and missing configuration do not initialize collection. Vercel Analytics remains independent.

The pinned `2026-05-30` SDK defaults provide history-change pageviews and existing anonymous persistence/referral attribution. Autocapture and session recording are explicitly disabled. No manual pageview tracker or identification call is added.

| Event | Meaning | Properties added by the portfolio |
| --- | --- | --- |
| `portfolio_request_clicked` | Full-portfolio mailto activated | `page_path`, `action_location` |
| `contact_email_clicked` | Direct email link activated | `page_path`, `action_location` |
| `cv_clicked` | CV link activated | `page_path`, `action_location` |
| `film_started` | Selected full film successfully starts | `page_path`, `action_location`, `project_id`, `project_category` |

Link locations are `about` or `contact`; the page path distinguishes the homepage, grading and project closing sections. Film location is `film_viewer`. Playback is counted once per project per viewer opening; pausing, resuming, looping and returning to an already-viewed Reel within that opening do not duplicate it. Closing and reopening starts a new viewing opportunity. Hover previews and automatic hero playback are excluded.

These explicit properties contain no arbitrary DOM text or email contents. Standard PostHog URL/referrer and campaign properties remain enabled. A mailto click measures intent, never an email delivered or a qualified lead.

## Verification and dashboard follow-up

Run `npx playwright test qa/analytics.spec.ts qa/seo.spec.ts qa/reel-continuity.spec.ts --project=chromium` against a production build. The analytics browser test mirrors the local build under the production hostname and intercepts external requests; it must not send test data to the real project. It simulates ordinary browser identity because the installed SDK filters webdriver and headless client hints. Production bot filtering remains enabled.

After deployment, confirm an ordinary visit and each explicit action in PostHog activity. Check event properties and absence of replay. Inspect existing historical localhost/internal-test filtering before comparing periods. Configure an intent funnel from pageview to `portfolio_request_clicked`, and a separate film-engagement breakdown by project. Do not sum Vercel and PostHog counts or treat AI referral visits as citation rankings.

SDK requests, intercepted local event batches, deployed code and dashboard receipt are separate evidence levels. Dashboard receipt requires authenticated project access.
