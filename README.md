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
| `placeholder` | Keep true until the work and its claims are ready |

Put assets under `public/media/` and reference them with `/media/filename`. Direct hosted file URLs also work for videos. Remote posters require a matching `images.remotePatterns` configuration in `next.config.ts`.

Set `placeholder: false` and provide `film` for playable work. Missing preview is supported: the poster remains visible and the full film still plays. SwiftSoft, two El Tacoria commercials and two Jury Chocolate films are supplied. Aviation, Films/YouTube and Motion retain explicitly labeled placeholders from the owner's CV assets.

The All work layout features SwiftSoft, a four-film portrait grid, pending selections, and an interactive before/after comparison linking to Color Grading. Keep selections concise: currently two El Tacoria and two Jury Chocolate films. Portrait films open in a matching tall player rather than cropping their content.

## Media

Original video and portrait remain unchanged outside this repo. Web derivatives are in `public/media/`.

| File | Size | Purpose |
| --- | --- | --- |
| `hero-desktop.mp4` | 2.65 MB | Silent 10-second hero loop |
| `hero-mobile.mp4` | 1.19 MB | Smaller portrait crop |
| `swiftsoft-preview.mp4` | 0.76 MB | Silent 7-second hover preview |
| `swiftsoft-film.mp4` | 24.84 MB | Full 55.51-second 1080p film with audio |
| `hero-poster.webp` | 41 KB | First paint and fallback |
| `portrait.webp` | 56 KB | Supplied portrait, optimized |

`tools/media/manifest.json` records dimensions and sizes. `tools/media/prepare.py` regenerates the exports with Pillow and imageio-ffmpeg; update its source paths for another machine. The three extra SwiftSoft stills are reserved for future process highlights, not separate portfolio projects.

## Color grading

`/color-grading` presents the supplied original/final pair as a keyboard-accessible range comparison, followed by four grading sheets in a swipeable carousel with thumbnails and an enlarged still viewer. No synthetic grades or color filters are applied. Carousel data lives in `src/components/grading.tsx`.

`tools/media/prepare-selected.py` prepares the four commercial films and six grading images. It requires Pillow and imageio-ffmpeg; its source paths are machine-specific. `selected-work-manifest.json` records provenance and file sizes. Full commercial videos total about 35 MB; the four silent hover previews total about 1.2 MB.

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

Build first. `npm test` runs Chromium against an existing preview or starts the production server. Set `TEST_URL` to target a different running preview. `qa:capture` also honors `TEST_URL` and captures the grading page in both themes. `qa:performance` expects the production server at port 3000.

Browser setup on another machine: `npx playwright install chromium webkit`.

21 Chromium tests passed on 2026-09-13. WebKit was attempted but exits before page creation on this Windows host, including outside the sandbox; it is **not** claimed as tested. `test:webkit` remains available for a working host. Browser emulation is not a physical-phone test.

Screenshots and the single-run lab performance report are under `.local/` (ignored). The performance script uses a cold Chromium cache, 4× CPU throttle and 1.6 Mbps down/150 ms latency. This is a local lab measurement, not a production performance guarantee; resource timing totals can omit ongoing streaming transfers.

## Deployment preparation

No deployment was performed. Set `NEXT_PUBLIC_SITE_URL` to the final origin before a production build so social-preview URLs resolve correctly. See `.env.example`. This site has no analytics, login, backend, or CMS.

`PRODUCT.md` and `DESIGN.md` preserve the scope and built design. `AGENT_HANDOFF.md` records the latest verified state.
