# Project state

Read this first. This is the canonical tracked handover for the media portfolio. Re-read relevant source before editing; update this document after meaningful code, media, credit, or validation changes. `AGENTS.md` preserves the installed Next.js guide requirement; `CLAUDE.md` links here. The ignored local `AGENT_HANDOFF.md` is only a pointer.

## Verified repository state — 2026-09-14

Next.js 16.3.5 App Router, React 19.3, TypeScript, Motion and Lenis. Static routes: `/`, `/color-grading`, `/work/oxfordsaudia-interviews`, `/work/oxfordsaudia-educational-series`. Local installed framework guides in `node_modules/next/dist/docs/` take precedence over remembered framework behavior. No backend, CMS, analytics, login, or email delivery service.

The site is a dark/light cinematic portfolio for Raden Hanifa. Preserve the current hero headline, authored opening framing, standalone About portrait, accessibility and media lifecycle. All work has 14 cards: the four F&B commercials together, Cadillac on its own row immediately below, the two interviews, hazardous education feature, two AI films, two motion intros and two grading clips. Reels has six cards. Grading detail includes Diriyah and graduation work in addition to homepage grading.

Contact: `raden@radenhanifa.com`; portfolio request is a mailto with subject `Full portfolio request`. Instagram `https://www.instagram.com/radenhanifa/`. LinkedIn `https://www.linkedin.com/in/radenhanifa`, verified against the existing CV site's `frontend/src/components/cv/Contact.jsx`. CV: `https://cv.radenhanifa.com`.

## Confirmed attribution

- SwiftSoft: an AI film for a SaaS ERP client. Raden: AI video production and editing. Script supplied by the client; do not imply Raden wrote it.
- Cadillac Escalade: concept, production, cinematography and editing by Raden; collaboration with Cadillac Alghanim Kuwait. Uses the complete `D:/Downloads/Cadillac.mp4` (101.08s), not the separate 14s sample.
- El Tacoria Translation and App: concept, script, production and edit. Arabic script: Abdullah Alzahrani.
- Jury Chocolate Eid Gift and Cake: planning, cinematography and edit.
- OxfordSaudia student/captain interviews: script, direction, cinematography, edit and audio, including title graphics and dialogue polishing. Student set image belongs with student interviews.
- 5 Hazardous Attitudes / educational series: script, direction, filming, edit and audio finishing. Keep its simulator, lighting, filming and planning BTS separate from interview BTS.
- Spider-Man: personal AI filmmaking fan concept, Seedance 2.0; no commissioned-client claim.
- Saudi Founding Day (Ajdan), Diriyah Colors, student interview grading: color grading. Ajdan is the only immersive player project (`founding-day`).
- Graduation trailer: planning, cinematography, editing and color grading. Confirmed production details: airside-approved Sony A7R IV, planned camera positions, low-light 8-bit footage, Raden also served as a safety pilot. Supporting grading-page film, excluded from the hero.
- ARCHI supporting record: commercial filmmaking. No hero attribution/play box is present.

## Hero recipe and timeline

`tools/media/prepare-hero.py` renders each device independently. Four 4s shots overlap by 0.35s at 3.65, 7.30 and 10.95s; timeline length 14.95s (24fps output quantization may yield 14.96s). Both are silent H.264/yuv420p with faststart. `tools/media/hero-manifest.json` records exact source paths, crop fractions, dimensions, timelines, output names and byte counts.

| Timeline start | Desktop source and in-point | Mobile source and in-point |
| --- | --- | --- |
| 0.00s | TENET PERFECT, 0.25–4.25s; previous left-anchored crop retained | Authored TENET vertical, 0–4s; previous framing retained |
| 3.65s | `D:/Downloads/sim room v2.mp4`, 0–4s | `E:/TEMPP DELL optionss/preflight inspection clip vertical.mp4`, 0–4s |
| 7.30s | `E:/V1-0014_Rakan Brolls149555201.mov`, 8–12s | `E:/TEMPP DELL optionss/Eating Final.mp4`, 3–7s |
| 10.95s | Original Diriyah Colors, 6–10s | Original `D:/Downloads/IMG_8769.MP4` Spider-Man, 3–7s |

Output: `hero-v2-desktop.mp4` (1280×720, 2,883,888 bytes, budget 3,500,000), `hero-v2-mobile.mp4` (540×960, 1,681,772 bytes, budget 1,800,000). Matching `hero-v2-*-poster.webp` images are extracted from each encoded opening frame. Every live hero reference uses this version so old cached ARCHI/personal exports cannot act as loading posters. The mobile breakpoint is 767px. No CSS framing/headline changes were made.

## Other media recipes

Original source footage stays untouched outside the repository. Browser derivatives live in `public/media/`. Install Pillow and imageio-ffmpeg; on this machine set `PYTHONPATH=C:/Users/User/AppData/Local/Temp/portfolio-media-tools` before running Python media recipes. Source locations are machine-specific and may move; verify them before rerendering.

- `prepare.py` / `manifest.json`: initial SwiftSoft media and portrait.
- `prepare-selected.py` / `selected-work-manifest.json`: four F&B commercials and grading images.
- `prepare-expansion.py` / `expansion-manifest.json`: interviews, education, grading/supporting films and BTS. Historical manifest sizes may describe preceding derivatives; the refinement manifest below owns changed outputs.
- `prepare-refinement.py` / `refinement-manifest.json`: student title excerpt, hazardous poster and Cadillac. Also updates `motion-manifest.json`.
- Student title: source `public/media/students-film.mp4`, 12–24s, playable `students-intro-v2-film.mp4` (12s, original audio) and silent `students-intro-v2-preview.mp4` (12s). Existing poster at source 15s retained. Captain intro remains 12–17s, 5s long.
- Hazardous: `hazardous-v2-poster.webp` from full-film 41s, including the project Open Graph image. Existing silent hover preview still starts at 75s; full film unchanged.
- Cadillac: full portrait H.264/AAC 1080×1920 export, 36,835,417 bytes; six-second silent hover at 3–9s, poster at 3s. Full-film encoding uses CRF 23 with maxrate 2.8 Mbps. No full-film bytes load until the visitor activates playback.
- Superseded files may remain as historical assets; live component references select the new versions.

## Key implementation and constraints

- `src/lib/portfolio.ts`: shared project metadata, credits, categories and contact links. Preserve attribution when changing copy.
- `hero.tsx`: responsive opening picture, delayed single video source (350ms), pause/resume. Pauses offscreen, in hidden tabs, on user pause, during card previews and film playback.
- `portfolio-runtime.tsx`: reduced-motion/save-data policy, one active preview, dynamic film-player import, synchronous pause of other videos, source release and focus restoration.
- `project-card.tsx`: fine-pointer hover waits 150ms and attaches only a silent preview; inactive previews release sources. Touch opens films directly.
- `film-player.tsx`: native modal dialog, playback/error/retry handling, Escape, scroll locking and persistent close. Standard projects retain descriptive heading/footer and native controls.
- Ajdan alone sets `immersive: true`. Its video fills the browser viewport with `object-fit: contain`, no heading/footer space. Entrance uses existing 220ms animation, disabled under reduced motion. Controls reveal on pointer movement, tap or keyboard focus; hide after 2400ms of inactivity while playing. Keyboard-focused controls remain visible. Includes play/pause, seeking, mute and a separate always-available close button. This fills the browser viewport rather than invoking the OS Fullscreen API.
- `work.tsx`: collection order and filters; Cadillac lives outside the four-commercial grid.
- `grading.tsx`, `grading-comparison.tsx`: still gallery, enlarge dialog and original/final slider. Preserve supplied image compositions and keep production-story BTS attributed correctly.
- `globals.css`: responsive visual system; no horizontal overflow, visible keyboard focus, reduced-motion overrides. New controls have at least 44px interaction areas.

Performance requirements: hero ≤3.5MB desktop / ≤1.8MB mobile; full films ≤1080p and under 44MB; full films on intentional activation only; one playing video; no auto media with reduced motion, Save-Data or reported 2G connection. Load only the matching hero rendition. Keep custom player code lazy-loaded.

## Validation

Production build passed after UI/media changes. The new viewport checks found a desktop scrollbar-gutter gap and early animation measurements. The immersive dialog now uses explicit viewport units and block layout to avoid inherited grid intrinsic-height expansion; assertions wait for the settled entrance. Both focused desktop/touch immersive tests pass. Final production build passed and all 38 Chromium tests passed (1.1 minutes). `git diff --check` passed.

Visual review inspected desktop/mobile TENET opening posters, all four shots and three dissolves at 0, 3.8, 5, 7.5, 9, 11.1 and 13 seconds. Cold/warm cache captures were reviewed and are generated by `qa/refinement.spec.ts` in `test-results/`; poster fallback is tested with video requests aborted. Both poster sources show TENET, not ARCHI. Cadillac and hazardous posters were inspected. Desktop/mobile Ajdan screenshots confirm uncropped viewport playback with discreet controls and no descriptive heading/footer. Encoded stream inspection confirms silent heroes/previews, 14.96s hero files and 12.01s student excerpts (frame quantization). The student excerpt ends after the transition into the interview. Largest full film remains 43,738,039 bytes. The 38-test suite covers Cadillac placement/preview/full film/credits, LinkedIn, student duration, SwiftSoft credit, keyboard/touch immersive controls, focus return, reduced motion, data saving, cold/warm device-only hero loading, poster failure fallback, and horizontal overflow at 320/390/768/1440px in both themes.

Single throttled mobile lab run: LCP 712ms, CLS 0.0007794, reported transferred bytes 2,177,376, no full film requested. This is local production-build Chromium at 390?844, cold cache, 4? CPU throttle, 1.6Mbps down and 150ms latency; not production field data. Streaming transfers may be incomplete in resource timing totals.

The required Impeccable detector ran once (69 advisory findings, no blocking findings); its advisory findings describe the existing design documentation/type/color/radius drift, not a clean design-system audit. The stale local DESIGN.md / .impeccable sidecar is not authoritative for current media, collection counts or deployment status. Refreshing that optional design documentation is outside this change.

## Delivery and outstanding items

Branch `main`, origin `https://github.com/saferoz/media-portfolio-lite.git`. User authorized committing and pushing this plan. Commit convention: imperative subject, concise change/validation body, `Authored by saferoz (#g6)`, no co-author trailer.

Repository verification and deployment are separate. The final commit and remote alignment are evidenced by Git history and remote refs rather than a hard-coded self-referential hash here. No hosting deployment is claimed from a build, commit or push. Confirm the remote branch hash after pushing; verify a hosting deployment independently before calling it live.

No WebKit or physical-device verification in this pass; earlier WebKit attempts exited before creating a page on this Windows host. Speech caption coverage and listening verification are not established; no new caption tracks supplied. Media sources are external and not portable. Local production preview for this pass: `http://127.0.0.1:3013`. Default sandbox terminal, image viewer and in-app browser setup failed before execution (`helper_unknown_error: setup refresh had errors`); approved terminal commands, local FFmpeg and the repository Playwright suite supplied the verification fallback.
