# Raden Hanifa — portfolio lite

A standalone cinematic portfolio showcase built with Next.js, React, TypeScript, Tailwind, Motion, and Lenis. Dark navy/cyan by default, with a persisted light theme. The work is the main content; the CV remains a secondary link.

## Run locally

Requires Node.js 20.9+ (built here with Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. On Windows PowerShell with scripts restricted, use `npm.cmd` in place of `npm`.

Production preview:

```sh
npm run build
npm run start
```

## Replace or add work

Edit `src/lib/portfolio.ts`. This is the content source of truth, including public contact details and the CV link.

Each project has:

| Field | Purpose |
| --- | --- |
| `id`, `title`, `category` | Unique project key, display title, and work filter |
| `description`, `contribution` | Short context and what Raden actually did |
| `poster` | Static WebP thumbnail |
| `preview` | Optional short silent MP4 for desktop hover |
| `film` | Full MP4, requested only after clicking Play |
| `aspect` | `portrait` or `landscape` |
| `captions` | Optional English WebVTT caption file |
| `duration`, `credits` | Display duration and collaborator attribution |
| `projectHref`, `cardLabel` | Optional project-page link and accurate card overlay |
| `immersive` | Optional viewport player; enabled only for Ajdan / Saudi Founding Day |
| `placeholder` | Keep true until the work and its claims are ready |

Put assets under `public/media/` and reference them with `/media/filename`. Direct hosted file URLs also work for videos. Remote posters require a matching `images.remotePatterns` configuration in `next.config.ts`.

Set `placeholder: false` and provide `film` for playable work. `projects` contains twelve playable films, including two extracted interview title intros; `gradingFilms` contains two color-work clips; `supportingFilms` contains the interview grading steps, graduation trailer, and previous ARCHI commercial. The two Motion examples appear in All work and under Motion.

The homepage leads with four F&B commercials, both Cadillac films on their own row directly below, followed by YouTube / Long-form interviews, the educational series, AI filmmaking, and color grading. Project images preview on desktop hover; clicking plays the full film. Separate View project links open production breakdowns.

## Project pages

- `/work/oxfordsaudia-interviews`: Students and Captains, with the group BTS photo attributed specifically to the student interview.
- `/work/oxfordsaudia-educational-series`: OxfordSaudia - Aviation Explained, featuring 5 Hazardous Attitudes, with series-level planning, lighting and simulator BTS.
- `/color-grading`: original graduation comparison and stills, the supporting graduation film and optional BTS, student interview comparison and steps, Saudi Founding Day and Diriyah Colors.

The graduation trailer has no separate homepage card and is excluded from the hero. No synthetic grades or CSS color filters are applied to comparisons. Gallery assets can be enlarged; scripts and photos retain their supplied compositions.

The contact section follows About. Request full portfolio opens `raden@radenhanifa.com` with the subject Full portfolio request. There is no submission backend or email delivery service.

## Media

Original media remain unchanged outside this repo. Browser derivatives are in `public/media/`.

- `tools/media/prepare.py`: original SwiftSoft film, preview, stills and profile photo.
- `tools/media/prepare-selected.py`: four commercial films and original grading images.
- `tools/media/prepare-expansion.py`: eight additional videos and nine BTS/comparison images. Converts HEVC and PCM-audio sources to H.264/AAC, including explicit full-to-limited range conversion for the Spider-Man concept.
- `tools/media/prepare-hero.py`: 14.95-second silent four-shot loop, rendered as one file per device. Only hero videos and matching posters are generated.

These scripts require Pillow and imageio-ffmpeg; source paths are machine-specific. Adjacent manifests record provenance and current derivative sizes. Full films are at most 1080p with original audio; all current full-video files are under 44 MB. Source 4K files are not served directly.

Read [PROJECT_STATE.md](PROJECT_STATE.md) first for the current site, confirmed credits, per-device timelines, validation and deployment status. Update that document after meaningful changes.

The hero uses four-second shots and 0.35-second dissolves (14.95-second timeline). Desktop: TENET, simulator, Rakan preflight, Diriyah. Mobile: authored TENET, vertical preflight, Spider-Man, ARCHI. The opening TENET framing is unchanged. See `tools/media/hero-manifest.json` for source in-points and crop values.

`hero-v4-desktop.mp4` stays within 3.5 MB at 1280x720; `hero-v4-mobile.mp4` stays within 1.8 MB at 540x960. Matching versioned posters load first and only the matching video rendition is requested.

`tools/media/prepare-refinement.py` prepares the 12?24s student title excerpt, 41s hazardous poster, and Cadillac film/poster/silent preview; `refinement-manifest.json` records provenance and sizes. The hazardous hover still starts at 75s.

## Playback and motion

- Fine-pointer desktop hover begins after 150 ms and never requests the full film.
- Leaving hover unloads the preview. Only one media element plays at once.
- Full film opens in a native dialog, with native video controls and focus restoration. Ajdan alone uses an immersive, uncropped viewport with accessible controls that hide after inactivity.
- Touch devices open with one tap. Autoplay rejection has an explicit Play fallback.
- Hidden/offscreen background media pauses. Reduced motion and data saving retain posters.
- Native touch scrolling; Lenis enhances desktop wheel scrolling only, with restrained hero depth. Anchor spacing follows the CSS scroll padding.

## Validation

```sh
npm run typecheck
npm test
npm run test:webkit
npm run qa:capture
npm run qa:performance
```

Build first. `npm test` runs Chromium against an existing preview or starts the production server. Set `TEST_URL` to target a different running preview. `qa:capture` also honors `TEST_URL` and captures the grading page in both themes. `qa:performance` also honors `TEST_URL`.

Browser setup on another machine: `npx playwright install chromium webkit`.

The preceding pass had 38 Chromium tests passing on 2026-09-14; the production build also passed. WebKit was attempted but exits before page creation on this Windows host, including outside the sandbox; it is **not** claimed as tested. `test:webkit` remains available for a working host. Browser emulation is not a physical-phone test.

Screenshots and the single-run lab performance report are under `.local/` (ignored). The performance script uses a cold Chromium cache, 4× CPU throttle and 1.6 Mbps down/150 ms latency. This is a local lab measurement, not a production performance guarantee; resource timing totals can omit ongoing streaming transfers.

## Deployment preparation

No deployment was performed. Set `NEXT_PUBLIC_SITE_URL` to the final origin before a production build so social-preview URLs resolve correctly. See `.env.example`. This site has no analytics, login, backend, or CMS.

`PRODUCT.md` and `DESIGN.md` preserve the scope and built design. `AGENT_HANDOFF.md` records the latest verified state.

Motion intro extracts use seconds 12-17 of the student and captain interview derivatives, with five-second audio-enabled films and separate silent previews. Their posters use source time 15 seconds.

The primary Escalade sample is rendered by `tools/media/prepare-cadillac.py` (see `cadillac-manifest.json`); the prior long film remains Film 2. Hero-v3 uses Diriyah 7?11s with its embedded bars cropped out, and the user-specified Spider-Man-v2 source at 3?7s.

The polish pass adds an expandable Reels viewer with swipe/wheel/keyboard navigation, equally sized mobile commercial pairs, the homepage interview comparison, captain question-card completion and revised GCC-focused copy. See `docs/COPY_STRATEGY.md` for the audience and writing framework. `PROJECT_STATE.md` owns current validation results.

Polish validation: production build and 45 Chromium tests passed. Throttled local mobile run: LCP 720ms, CLS 0.0007794, no full-film request. See PROJECT_STATE.md for conditions and limits.
