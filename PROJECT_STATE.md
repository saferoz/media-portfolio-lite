# Project state

Read this first. This is the canonical tracked handover for the media portfolio. Re-read relevant source before editing; update this document after meaningful code, media, credit, or validation changes. `AGENTS.md` preserves the installed Next.js guide requirement; `CLAUDE.md` links here. The ignored local `AGENT_HANDOFF.md` is only a pointer.

## Verified repository state — 2026-09-14

Next.js 16.3.5 App Router, React 19.3, TypeScript, Motion and Lenis. Static routes: `/`, `/color-grading`, `/work/oxfordsaudia-interviews`, `/work/oxfordsaudia-educational-series`. Local installed framework guides in `node_modules/next/dist/docs/` take precedence over remembered framework behavior. No backend, CMS, login, or email delivery service. Vercel Web Analytics was added by the user through the Vercel bot; deployment and dashboard collection status are unverified.

The site is a dark/light cinematic portfolio for Raden Hanifa. Preserve the current hero headline, authored opening framing, standalone About portrait, accessibility and media lifecycle. All work has 15 cards: the four F&B commercials together, two Cadillac films on a separate row immediately below, the two interviews, hazardous education feature, two AI films, two motion intros and two grading clips. Reels has seven cards. Grading detail includes Diriyah and graduation work in addition to homepage grading.

Contact: `raden@radenhanifa.com`; portfolio request is a mailto with subject `Full portfolio request`. Instagram `https://www.instagram.com/radenhanifa/`. LinkedIn `https://www.linkedin.com/in/radenhanifa`, verified against the existing CV site's `frontend/src/components/cv/Contact.jsx`. CV: `https://cv.radenhanifa.com`.

Audience: hiring teams and commissioning clients equally, primarily Saudi Arabia and the UAE, then the wider GCC. `docs/COPY_STRATEGY.md` records the applied marketing frameworks, voice, and supported claims.

## Confirmed attribution

- SwiftSoft: an AI launch film for a SaaS ERP platform. Credit: AI filmmaking and editing by Raden Hanifa, based on a script from SwiftSoft for their launch. Do not imply Raden wrote it. Spider-Man precedes SwiftSoft in both All work and the AI filter.
- Cadillac Escalade: concept, production, cinematography and editing by Raden; collaboration with Cadillac Alghanim Kuwait. Primary: the user-confirmed `D:/Downloads/CADILLAC ESCALADE 2ND SAMPLE BY RADEN (With CAR Sound) (1).mp4` (13.59s). The previously selected `D:/Downloads/Cadillac.mp4` (101.08s) is retained as Film 2 at the user's request. The earlier choice of the long film as primary was incorrect. Cards distinguish Showcase and Walkthrough reels; the latter features a salesperson introducing the then-new Escalade. They are short-form Reels, not long-form films. Primary poster uses cadillac-escalade-v3-poster.webp to avoid the previously cached transition frame.
- El Tacoria App comes first: concept, script, production and edit; Arabic script: Abdullah Alzahrani. The former Translation entry is Ramadan Campaign: concept, production and edit; the user removed its script credit. Stable media filenames/IDs retain the historical translation name.
- Jury Chocolate Eid Showcase comes before Eid Gift; both credit planning, cinematography and edit. The former Cake entry keeps its historical jury-cake ID and source filenames.
- OxfordSaudia student/captain interviews: script, direction, cinematography, edit and audio, including title graphics and dialogue polishing. Student set image belongs with student interviews.
- 5 Hazardous Attitudes / educational series: script, direction, filming, edit and audio finishing. Keep its simulator, lighting, filming and planning BTS separate from interview BTS.
- Spider-Man: personal AI filmmaking fan concept, Seedance 2.0; no commissioned-client claim.
- Saudi Founding Day (Ajdan), Diriyah Colors, student interview grading: color grading. Ajdan is the only immersive player project (`founding-day`).
- Graduation trailer: planning, cinematography, editing and color grading. Confirmed production details: airside-approved Sony A7R IV, planned camera positions, low-light 8-bit footage, Raden also served as a safety pilot. Supporting grading-page film, excluded from the hero.
- ARCHI supporting record: commercial filmmaking. No hero attribution/play box is present.

## Hero recipe and timeline

`tools/media/prepare-hero.py` renders mobile directly from original sources in one filter graph, with a single final lossy encode. Desktop v4 video, poster and manifest remain unchanged. Both renditions are silent H.264/yuv420p with faststart. The mobile breakpoint remains 767px.

| Mobile timeline start | Source excerpt |
| --- | --- |
| 0.00s | Authored TENET vertical, 0-4s; original framing |
| 3.65s | Preflight inspection vertical, 0-4s; incoming dissolve 0.35s |
| 7.50s | Spider-Man original, second 3 through the last decoded frame (121 frames); incoming dissolve 0.15s |
| 12.5417s nominal | ARCHI/Eating, 3-7s; Spider-Man's last frame is cloned for the 0.35s outgoing dissolve |

Mobile output: `hero-v6-mobile.mp4`, 540x960, 24fps, 396 encoded frames / 16.50s, 1,748,343 bytes (budget 1,800,000). Encoding retains 900k bitrate/maxrate, 2M buffer and slow preset. ARCHI retains all 96 frames; no shortening was needed. Frame timestamps quantize the nominal transition offsets to 24fps. The source container reports approximately 8.08s including audio; the recipe counts decoded video frames to retain the true video ending. `hero-v6-mobile-poster.webp` is extracted from the encoded opening frame. Original sources and superseded derivatives remain untouched.

Desktop output remains `hero-v4-desktop.mp4` (1280x720, 3,000,530 bytes, budget 3,500,000), with `hero-v4-desktop-poster.webp`. Its four source shots remain TENET 0.25-4.25s, Simulator 0-4s, Rakan preflight 8-12s and Diriyah 7-11s; 0.35s overlaps at 3.65, 7.30 and 10.95s. Exact source paths and crop fractions remain in `tools/media/hero-manifest.json`.

Diriyah uses the complete existing 1080p derivative because the original F: drive is unavailable. Its source timeline is unchanged from the original; the baked-in 132px top/bottom bars are cropped before the centered fill. No original footage is modified. The new Spider-Man source uses its native range; the full-range conversion for the previous IMG_8769 export does not apply.

## Other media recipes

Original source footage stays untouched outside the repository. Browser derivatives live in `public/media/`. Install Pillow and imageio-ffmpeg; on this machine set `PYTHONPATH=C:/Users/User/AppData/Local/Temp/portfolio-media-tools` before running Python media recipes. Source locations are machine-specific and may move; verify them before rerendering.

- `prepare.py` / `manifest.json`: initial SwiftSoft media and portrait.
- `prepare-selected.py` / `selected-work-manifest.json`: four F&B commercials and grading images.
- `prepare-expansion.py` / `expansion-manifest.json`: interviews, education, grading/supporting films and BTS. Historical manifest sizes may describe preceding derivatives; the refinement manifest below owns changed outputs.
- `prepare-refinement.py` / `refinement-manifest.json`: student title excerpt, hazardous poster and Cadillac. Also updates `motion-manifest.json`.
- Student title: source `public/media/students-film.mp4`, 12–24s, playable `students-intro-v2-film.mp4` (12s, original audio) and silent `students-intro-v2-preview.mp4` (12s). Existing poster at source 15s retained. Captain intro is now source 12-20s (8s), including the completed question card; prepare-captains-intro.py renders captains-intro-v2-film/preview.mp4 with the existing 15s poster.
- Hazardous: `hazardous-v2-poster.webp` from full-film 41s, including the project Open Graph image. Existing silent hover preview still starts at 75s; full film unchanged.
- `prepare-cadillac.py` / `cadillac-manifest.json`: primary Escalade sample, versioned `cadillac-escalade-v2-*`; 4,781,830-byte full film with audio, six-second silent preview at 3-9s, clear front-of-car poster at 1s.
- Cadillac Film 2: full portrait H.264/AAC 1080×1920 export, 36,835,417 bytes; six-second silent hover at 3–9s, poster at 3s. Full-film encoding uses CRF 23 with maxrate 2.8 Mbps. No full-film bytes load until the visitor activates playback.
- Superseded files may remain as historical assets; live component references select the new versions.

## Key implementation and constraints

- `src/lib/portfolio.ts`: shared project metadata, credits, categories and contact links. Preserve attribution when changing copy.
- `hero.tsx`: responsive opening picture, delayed single video source (350ms), pause/resume. Pauses offscreen, in hidden tabs, on user pause, during card previews and film playback.
- `portfolio-runtime.tsx`: reduced-motion/save-data policy, one active preview, dynamic film-player import, synchronous pause of other videos, source release and focus restoration.
- `project-card.tsx`: fine-pointer hover waits 150ms and attaches only a silent preview; inactive previews release sources. Touch opens films directly.
- `film-player.tsx`: native modal dialog, playback/error/retry handling, Escape, scroll locking and persistent close. Standard view retains descriptive heading/footer. Reels use custom controls in both views, hidden on initial playback; other standard films retain native controls. Reels initially focus the dialog, preventing an oversized automatic close-button focus ring; other players preserve close-button focus. Reels expose an explicit Reel view / Details toggle: the same video node expands to the viewport without restarting. Expanded mode loops the selected Reel and allows vertical swipe, wheel, arrow keys and next/previous buttons through the seven homepage Reels in order. Only the selected full source is attached. Boundaries disable navigation; no full-film prefetching. Native non-passive touch dismissal avoids a suppressed compatibility click after swiping, and focus returns to the original card.
- Ajdan alone sets `immersive: true`. Its video fills the browser viewport with `object-fit: contain`, no heading/footer space. Entrance uses existing 220ms animation, disabled under reduced motion. Controls reveal on pointer movement, tap or keyboard focus; hide after 2400ms of inactivity while playing. Keyboard-focused controls remain visible. Includes play/pause, seeking, mute and a separate always-available close button. This fills the browser viewport rather than invoking the OS Fullscreen API.
- `work.tsx`: collection order and filters; Cadillac uses the same Reel card widths as the four-commercial grid. All commercial cards stay two-up on mobile and use four-column-sized tracks on desktop. Filters stop residual smooth scrolling and use a 220ms pointer-only opacity transition, without moving the grid. Homepage adds the interview comparison below the preflight comparison, with independent native range inputs and preserved 16:9 interview framing. No swipe carousel competes with the dividers.
- `grading.tsx`, `grading-comparison.tsx`: still gallery, enlarge dialog and original/final slider. Preserve supplied image compositions and keep production-story BTS attributed correctly.
- Motion: retain mobile hero depth; desktop hero media has no transform at any hydration/playback stage; use a full transform string for hero content. Project frames and captions stay fixed. Only their images settle from scale 1.08 to 1 over 850ms, without delays, masks or opacity changes. Headings enter over 600ms with a 28px translation; About copy and contact heading use the existing reveal system. Reel expansion uses a 260ms transform animation; Reel changes use a 280ms full-height vertical slide, with a temporary outgoing canvas still and one incoming video source. Side navigation dims to 18% when inactive, except for visible keyboard focus or fine-pointer hover. Keyboard navigation and reduced motion bypass these effects. Existing Motion/WAAPI/CSS and Lenis suffice; no extra animation library was added.
- `globals.css`: responsive visual system; no horizontal overflow, visible keyboard focus, reduced-motion overrides. New controls have at least 44px interaction areas.

Performance requirements: hero ≤3.5MB desktop / ≤1.8MB mobile; full films ≤1080p and under 44MB; full films on intentional activation only; one playing video; no auto media with reduced motion, Save-Data or reported 2G connection. Load only the matching hero rendition. Keep custom player code lazy-loaded.

## Validation

Polish pass: final production build passed. All 45 Chromium tests passed on the final production build (1.3 minutes), including the final contact wording/action hierarchy. Final visual review confirmed equal mobile Reel sizes, the correct Cadillac front-view poster, touch viewer controls, independent comparison framing, AI order and hero/captain edit boundaries. The SwiftSoft overlay uses the compact AI launch film label to keep its longer description out of the image overlay. The first pass found hover timing during filtering, suppressed post-swipe touch dismissal and a cached Cadillac poster; these were addressed. Design detector ran once: 70 advisory findings, no non-advisory findings; these mostly concern existing design-document drift. Do not treat this as a clean design-system audit.

Correction pass: production build and all 38 Chromium tests passed (1.1 minutes). Updated tests verify the 13.6s primary Cadillac, automotive label, separate 101s Film 2, 15 All work cards / seven Reels, and hero-v4 cache/rendition behavior. Reviewed encoded opening frames, final dissolves and fourth shots on both devices; Diriyah fills the image without letterboxing. Primary Cadillac poster changed to the clear 1s front view after visual review. The final build and focused Cadillac regression passed again after poster/title cleanup. Both new heroes remain silent and within budgets.

Production build passed after UI/media changes. The new viewport checks found a desktop scrollbar-gutter gap and early animation measurements. The immersive dialog now uses explicit viewport units and block layout to avoid inherited grid intrinsic-height expansion; assertions wait for the settled entrance. Both focused desktop/touch immersive tests pass. Final production build passed and all 38 Chromium tests passed (1.1 minutes). `git diff --check` passed.

Visual review inspected desktop/mobile TENET opening posters, all four shots and three dissolves at 0, 3.8, 5, 7.5, 9, 11.1 and 13 seconds. Cold/warm cache captures were reviewed and are generated by `qa/refinement.spec.ts` in `test-results/`; poster fallback is tested with video requests aborted. Both poster sources show TENET, not ARCHI. Cadillac and hazardous posters were inspected. Desktop/mobile Ajdan screenshots confirm uncropped viewport playback with discreet controls and no descriptive heading/footer. Encoded stream inspection confirms silent heroes/previews, 14.96s hero files and 12.01s student excerpts (frame quantization). The student excerpt ends after the transition into the interview. Largest full film remains 43,738,039 bytes. The 38-test suite covers Cadillac placement/preview/full film/credits, LinkedIn, student duration, SwiftSoft credit, keyboard/touch immersive controls, focus return, reduced motion, data saving, cold/warm device-only hero loading, poster failure fallback, and horizontal overflow at 320/390/768/1440px in both themes.

Single throttled mobile lab run: LCP 712ms, CLS 0.0007794, reported transferred bytes 2,177,376, no full film requested. This is local production-build Chromium at 390?844, cold cache, 4? CPU throttle, 1.6Mbps down and 150ms latency; not production field data. Streaming transfers may be incomplete in resource timing totals.

The required Impeccable detector ran once (69 advisory findings, no blocking findings); its advisory findings describe the existing design documentation/type/color/radius drift, not a clean design-system audit. The stale local DESIGN.md / .impeccable sidecar is not authoritative for current media, collection counts or deployment status. Refreshing that optional design documentation is outside this change.

## Delivery and outstanding items

Branch `main`, origin `https://github.com/saferoz/media-portfolio-lite.git`. User authorized committing and pushing this plan. Commit convention: imperative subject, concise change/validation body, `Authored by saferoz (#g6)`, no co-author trailer.

Repository verification and deployment are separate. The final commit and remote alignment are evidenced by Git history and remote refs rather than a hard-coded self-referential hash here. No hosting deployment is claimed from a build, commit or push. Confirm the remote branch hash after pushing; verify a hosting deployment independently before calling it live.

No WebKit or physical-device verification in this pass; earlier WebKit attempts exited before creating a page on this Windows host. Speech caption coverage and listening verification are not established; no new caption tracks supplied. Media sources are external and not portable. Local production preview for this pass: `http://127.0.0.1:3022`. Default sandbox terminal, image viewer and in-app browser setup failed before execution (`helper_unknown_error: setup refresh had errors`); approved terminal commands, local FFmpeg and the repository Playwright suite supplied the verification fallback.

## Local disk footprint

Measured before these correction exports: node_modules 442 MB, .git 311 MB, public 299 MB, .next 258 MB, .local 53 MB and test-results 20 MB; src about 0.10 MB. This is local disk usage, not browser download size. Dependencies, build caches and QA artifacts are ignored by Git. Videos dominate tracked assets and accumulate in Git history; a media CDN/object store can be considered if the portfolio grows. No cleanup or history rewrite was performed. The earlier throttled load result above is from the preceding pass, not a new measurement of hero-v4.

Latest decisions: the existing ARCHI/Eating 3-7s shot is moved to fourth, with Spider-Man third. This interpretation was announced while the exact-source clarification remained unanswered. All seven Reels are browsable in the focused viewer; the optional same-client-only alternative was not selected. No new original footage, library, analytics or contact backend was introduced.

Polish mobile lab result (before the final contact wording adjustment): LCP 720ms, CLS 0.0007794, reported transfer 2,162,054 bytes, no full film requested. Conditions: local production build, Chromium 390x844, cold browser cache, 4x CPU, 1.6Mbps down, 150ms latency; one lab run, not deployed field data. Streaming resource timing can omit unfinished transfers. Heroes: desktop 3,000,530 bytes; mobile 1,624,310 bytes. No new dependencies.

Contact refinement: invite projects and roles across filming, cinematography, editing, color grading and AI filmmaking. User confirmed keeping Want to see more? and Request full portfolio as the primary invitation because more work is available. The user subsequently removed Discuss a project or role; only the primary portfolio action remains. GCC audience line is separate from the craft description.

Final delivery checks: production build, all 45 Chromium tests and git diff --check passed. Final mobile contact screenshot confirms the approved Want to see more? heading, full-range craft description, primary Request full portfolio and secondary project/role enquiry. Push status and deployment remain separate; no hosting deployment is asserted.

## Feedback refinement, 2026-09-14

- Hero copy: I shoot and edit commercial reels, interviews and aviation stories. I also make AI films. This separates conventional production from the two AI projects.
- Mobile hero v5 comes from original source footage, using the same CRF 18 intermediates and 900 kbps final settings as v4. No recompression of the prior hero derivative. Desktop v4 video and poster are unchanged in Git. Frame review at 7.50, 7.67, 10.90, 11.42, 11.58 and 12.00s confirms the shorter incoming dissolve, visible Spider-Man face and direct ARCHI cut. Opening framing is unchanged.
- Cards show an icon-only play affordance while retaining project-specific accessible button labels. Compact expand/close icons retain 44px targets. Reels avoid native control chrome; play, seek and mute reveal on interaction and hide when playing after inactivity. The always-available close and expand controls remain separate.
- Desktop comparison width is capped from available viewport height; the interview remains 16:9 and fits a 1795x900 viewport at no more than 680px high. Mobile framing is preserved.
- Validation: production build passed. Full Chromium run passed 46/47; the remaining test measured a 44px control during its entrance transform and observed 43.996px. The assertion now checks CSS sizing and awaits animation completion; both focused feedback tests passed on the same production build, covering the remaining case. All 47 test cases therefore passed across these runs. No additional production change after that build. Reviewed mobile detail/quiet Reel and desktop comparison captures in .local/feedback-results plus encoded hero frames. git diff --check passed. Physical iOS and WebKit remain unverified; do not claim Safari validation from Chromium touch emulation.
- Final preview for this pass: http://127.0.0.1:3024. Commit/push authorized by the user; hosting deployment must still be checked independently. No new animation dependency or automatic full-film preload added.

## Scroll correction, 2026-09-14

The user rejected the delayed, cropped card entrances as buggy. The prior WAAPI stagger had no backwards fill: fully visible cards could wait, then abruptly fade/translate/clip when their delay elapsed. Whole-card transforms also moved hover targets and masked captions. Removed those whole-card effects and all stagger delays. Entrances now arm only for content initially below the viewport and trigger at first intersection, once. Image-only scale settling leaves hit targets and captions stationary, cancels on pointer entry/focus, and respects reduced motion. Already-visible/restored content never re-enters. The interview comparison has no entrance effect; filtering changes opacity only. Hero media and the established hero/Lenis movement were not modified.

Validation: production build and all 49 Chromium tests passed in one run (1.3 minutes). New continuous-scroll tests sample every animation frame on 390px touch and 1440px desktop during scrolling and reversal; verify no independent card movement, clipping or opacity change, confirm image motion occurs, and verify live reduced-motion cleanup. Existing hover, filters, keyboard, playback and media-budget checks also pass. Reviewed screenshot captures and saved local scroll recordings in .local/scroll-review. Browser automation is not a claim of physical iOS feel testing. git diff --check passed. Local production preview: http://127.0.0.1:3025. Push and hosting deployment remain separate.

## Marketing skills and copy review, 2026-09-14

Reviewed the user-supplied https://github.com/coreyhaines31/marketingskills collection. Existing local copywriting 2.0.1 is close to upstream 2.0.2; retained without a duplicate. Installed copy-editing 2.0.0 and product-marketing 2.1.0 in C:/Users/User/.codex/skills. Skill files are local agent tooling, not runtime dependencies. Added tracked .agents/product-marketing.md with established audience, voice, conversion action and evidence boundaries; it points to this canonical state and docs/COPY_STRATEGY.md.

Applied focused clarity, evidence and specificity review. Four commercial cards now have precise labels: App promo, Ramadan campaign, Eid showcase and Eid gift reel. Search/share descriptions explicitly cover color grading and the breadth of the work. Confirmed credits, hero wording, About and approved contact invitation were preserved. Corrected stale copy-strategy entries that still described the superseded AI wording and removed secondary CTA. Generic upstream conversion percentages are not portfolio evidence or promised results.

Validation: production build passed; all nine polish/feedback Chromium tests passed (15.9 seconds). Checked all four new labels plus color-grading/portfolio-request metadata in production HTML. An earlier test attempt started before the longer build completed and could not reach a production server; it was stopped and rerun only after build completion. git diff --check passed. No media or animation code changed. Local preview: http://127.0.0.1:3026. Hosting deployment remains unverified.


Concurrent integration: the user confirmed merging Vercel bot PR #1 while this pass was in progress (remote merge 24fbc7a). Rebased the copy commit onto it without conflicts, preserving @vercel/analytics and Analytics in the root layout. The combined production build and nine focused Chromium tests passed again. Local final preview: http://127.0.0.1:3027. Analytics being present in code does not establish dashboard enablement or live event collection.

## Plain-language copy and visible entrances, completed 2026-09-19

Reviewed homepage, grading page, galleries and both OxfordSaudia project pages with the copy-editing skill. Replaced abstract headings such as A natural presence and The look, across frames with Student interview and Stills and grading stages. About now starts I shoot, edit and color grade, avoiding a repeated cinematic eye claim. Production copy names the work performed. Retained the approved homepage headline, About heading and portfolio invitation. Confirmed credits and media remain unchanged. docs/COPY_STRATEGY.md contains before/after examples; .agents/product-marketing.md is version v2.

The user clarified that buggy scroll motion should be fixed, not made imperceptible. The optional choice between entrances and scroll-linked motion received no response; announced the assumption of noticeable entrances. Images now settle from scale 1.08 over 850ms and headings enter 28px over 600ms. Paused WAAPI animations with fill both prepare the initial frame while offscreen, then play at 10% intersection. This avoids the former visible-then-faded delay. Frames, captions and comparison sliders stay stationary; interactions and reduced motion cancel animations. Hero video assets and existing hero movement remain untouched.

Validation before the interruption: production build and all 50 Chromium tests passed in one run (1.3 minutes). Continuous-scroll tests now require running image animations, not merely registered ones; added coverage for offscreen preparation, actual playback, stable card frames and focus cancellation. Reviewed updated grading/About screenshots. On resumption, confirmed source diff and git diff --check; only additional workspace change was Next.js-generated next-env.d.ts pointing at dev types. That local generated change is excluded from this commit. Physical iOS and hosting deployment remain unverified. Last production preview used http://127.0.0.1:3028; availability after the interruption is not asserted.

## Hero, icons and desktop galleries, 2026-09-19

Removed desktop hero media scaling with a desktop-only CSS override that applies before hydration. Preserved desktop video/poster, cover framing, mobile media transform and content animation. Page backgrounds remain solid; no texture or glow was introduced.

Desktop inline still frames, including BTS galleries, now use min(560px, 55svh), min-height 0 and no aspect-ratio sizing. Images remain contained; mobile swipe layouts, captions, thumbnails and enlargement controls are unchanged. View color grading navigates to /color-grading#grading-intro and settles pending Lenis motion through Link onNavigate. The introduction has a 78px header offset. Student-interview deep links and native Next.js history restoration remain intact.

Replaced the icon with a vector lowercase rh monogram on a rounded navy tile, white strokes and cyan underline. Added 180px apple-icon.png and a 16/32/48px favicon.ico. Reviewed 16px and 32px raster legibility. No body hydration suppression or extension-injected attribute was added.

Validation: production build and all 58 Chromium tests passed in one full run (1.8 minutes). Desktop sizes: 1366x768, 1440x900 and 1920x1080; touch galleries: 320x844 and 390x844. Cold pre-hydration, hydrated playback and warm playback captures confirm stable desktop media bounds and no scaling jump. Verified gallery heights/containment, swipe, thumbnails, enlargement, Escape/focus return, navigation during Lenis motion, reduced motion, Back/Forward, student deep links, matching hero rendition only, pause, save-data, icon responses and overflow. No application hydration or runtime errors were found. Physical iOS/WebKit remain unverified. Encoded media inspected for resolution, 24fps, silence, duration and ending/dissolve frames. Browser checks run on local production http://127.0.0.1:3029 using extension-free Playwright Chromium. The local-only Vercel Analytics script endpoint returns 404; tests explicitly classify that URL separately from application/hydration errors. No analytics collection claim follows from these checks. Initial touch automation sent unpaced moves and failed native snap settling; paced touch events verified normal swipe and subsequent thumbnail behavior. git diff --check passed. Preserved the pre-existing local next-env.d.ts development-type references outside the commit. Delivery: commit/push authorized; deployment verification follows the push and is not inferred from it.
