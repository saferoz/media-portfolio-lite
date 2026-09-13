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
| `placeholder` | Keep true until the work and its claims are ready |

Put assets under `public/media/` and reference them with `/media/filename`. Direct hosted file URLs also work for videos. Remote posters require a matching `images.remotePatterns` configuration in `next.config.ts`.

Set `placeholder: false` and provide `film` for playable work. `projects` contains nine playable films and the honest Motion placeholder; `gradingFilms` contains two color-work clips; `supportingFilms` contains the interview grading steps and graduation trailer. The Motion placeholder is available under its filter.

The homepage leads with four F&B commercials, followed by YouTube / Long-form interviews, the educational series, AI filmmaking, and color grading. Project images preview on desktop hover; clicking plays the full film. Separate View project links open production breakdowns.

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
- `tools/media/prepare-hero.py`: ten-second silent montage, rendered as one file per device. Run after the commercial and expansion derivatives exist.

These scripts require Pillow and imageio-ffmpeg; source paths are machine-specific. Adjacent manifests record provenance and current derivative sizes. Full films are at most 1080p with original audio; all current full-video files are under 44 MB. Source 4K files are not served directly.

The hero uses Jury Chocolate, the student interview, aviation education, Diriyah grading work, and the personal Seedance 2.0 Spider-Man concept. Each shot is two seconds. Keep `heroShotIds` in the portfolio data aligned with `SHOTS` in the preparation script. The visible credit opens the corresponding full film. AI footage is labeled.

`hero-montage-desktop.mp4` targets at most 3 MB at 1600x900; `hero-montage-mobile.mp4` targets at most 1.3 MB at 540x720. Both versions have independent crops. Responsive WebP posters load first; only the matching video rendition is requested, and full source films are never loaded to assemble the hero in-browser.

## Playback and motion

- Fine-pointer desktop hover begins after 150 ms and never requests the full film.
- Leaving hover unloads the preview. Only one media element plays at once.
- Full film opens in a native dialog, with native video controls and focus restoration.
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

30 Chromium tests passed on 2026-09-13. WebKit was attempted but exits before page creation on this Windows host, including outside the sandbox; it is **not** claimed as tested. `test:webkit` remains available for a working host. Browser emulation is not a physical-phone test.

Screenshots and the single-run lab performance report are under `.local/` (ignored). The performance script uses a cold Chromium cache, 4× CPU throttle and 1.6 Mbps down/150 ms latency. This is a local lab measurement, not a production performance guarantee; resource timing totals can omit ongoing streaming transfers.

## Deployment preparation

No deployment was performed. Set `NEXT_PUBLIC_SITE_URL` to the final origin before a production build so social-preview URLs resolve correctly. See `.env.example`. This site has no analytics, login, backend, or CMS.

`PRODUCT.md` and `DESIGN.md` preserve the scope and built design. `AGENT_HANDOFF.md` records the latest verified state.
