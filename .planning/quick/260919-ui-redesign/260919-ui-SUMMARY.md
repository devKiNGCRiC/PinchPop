---
status: complete
---

# Quick task 260919-ui: Code audit fixes and "sticker booth" UI/UX redesign

Executed inline (no subagents, no commits). The user explicitly lifted the DESIGN.md / 01-UI-SPEC.md
visual constraints for this pass, so `DESIGN.md` no longer describes the shipped UI.

## Fixed
- `npm run lint` failed on every file (worktree copies confused typescript-eslint); `eslint.config.js` and `.prettierignore` fixed.
- Forced `class="dark"`, Vite template favicon, missing meta description, tiny/invisible mobile drawer close button.
- Added skip link, scroll restoration, per-route titles, route error page.

## Rebuilt (Gen-Z "sticker booth" identity)
- Tokens: ultraviolet/lilac base, lemon/bubblegum/mint/tangerine stickers, 3px ink outlines, hard offset shadows. Fonts: Unbounded 800 (display), Bricolage Grotesque (body), Caveat (polaroid captions).
- Working product loop with no backend: playable 3x3 swap puzzle (drag, tap, keyboard, touch) on Home and Play; solves auto-save to localStorage; Results shows the polaroid and score; Gallery is a wall with sort/delete/clear; Profile derives stats and badges; Share reads a local memory.
- Camera mode is shown honestly as "coming soon"; nothing fabricates users, counts or photos.

## Verified
lint, typecheck, format:check, build all exit 0. Real-browser test (headless Chrome via CDP): mouse drag, tap-tap swap, touch drag (page does not scroll), full solve, memory saved, Results/Gallery/Profile render, no horizontal overflow at 375px.

## Not done
- Webcam/MediaPipe gesture game still lives only in `legacy/` (roadmap Phase 2).
- Accounts, Supabase storage and public share links (memories are per-browser localStorage).

## Follow-up pass: India / travel / photography identity
- Palette re-based on India's colours, each with one job: saffron (primary action), Ashoka chakra blue (structure), leaf green (success/saved), marigold (highlight), gold (score), coral (secondary), sindoor red (danger only), ivory/white surfaces, ink outlines.
- Puzzle art replaced with four illustrated destinations (Taj Mahal, Hawa Mahal, Kerala backwaters, Ladakh prayer flags). Each solve pins a postmarked polaroid to the Album and stamps the Passport (gallery = Album, profile = Passport).
- Custom scrollbar (saffron sticker thumb; Firefox gets a colour-only fallback), rebuilt multi-column footer with a tricolour stripe, destination deep links (`/game?art=<id>`), album filter by destination, hover hints on stats.
- Verified: lint, typecheck, format:check, build exit 0; mouse/touch drag solve in headless Chrome; no horizontal overflow at 375px.

## Follow-up pass: Leaderboard and How to play pages
- `/leaderboard`: All time / Today (UTC) tabs, destination filter, gold/silver/bronze podium with open spots, ranked table for 4th onward, score rules, and an honest note that online rankings need accounts. Ranks the player's own runs from localStorage (`src/lib/leaderboard.ts`).
- `/how-to-play`: current controls (mouse, touch, keyboard), the five camera-mode gestures from the legacy guide (marked coming soon), scoring tips with a worked example, and an FAQ.
- Nav now has 5 links (Leaderboard added); How to play lives in the footer and mobile menu and is linked from Home and Play.

## Follow-up pass: Camera mode (Phase 2 game engine port)
- `/camera` (lazy-loaded): webcam + free MediaPipe Hand Landmarker (Apache-2.0, runs in the browser, WASM from jsDelivr, model from Google's public bucket), so no server cost.
- Ported the prototype's loop: raise both hands to frame with the two index fingertips, pinch both hands to arm and count down 3-2-1, capture with photobooth effect, solve the 3x3 puzzle by pinching and dragging pieces, hold a fist to save (or reset if unsolved).
- Also works without hands: Snap now button, mouse/touch dragging of pieces, Save and Start over buttons; procedural Web Audio sounds with a mute toggle; clear permission, no-camera, busy-camera and load-failure messages.
- Architecture: pure, unit-tested engine (`src/lib/camera/{gestures,pieces,engine}.ts`, 12 Vitest tests run in CI) separated from browser code (tracker, effects, render, sound, `useCameraGame`).
- Camera photos are saved as small JPEGs in localStorage with an album/leaderboard/passport integration; if storage is full the oldest photo is dropped, never the newest run.
- Verified in headless Chrome with a fake webcam: model load, snap, countdown, capture, mouse solve, save, results photo. Not verified: real hand gestures on a real webcam (covered by synthetic-landmark unit tests only).

## Follow-up pass: finishing the local core loop
- GAME-05: the saved photo shatters into 40 fragments (canvas animation + sound) before the results page.
- GAME-07: photo strip of the 3 latest camera photos on the Album page, downloadable as PNG.
- GAME-08: WebM replay of the puzzle recorded in-browser (MediaRecorder on the canvas), downloadable from Results until the tab closes.
- SCORE-02/03: every run is a Speed Run with moves, time and accuracy. One documented formula: base = max(100, 2000 - 40 x moves - 8 x seconds); score = round(base x (0.5 + 0.5 x accuracy)). Unit-tested; documented on How to play and Leaderboard.
- ACHV-02: milestone unlock toast (grouped when a run earns several).
- SHARE-04/05 (local): download the polaroid as PNG and open the OS share sheet (falls back to download). Works for camera photos and illustrated destinations.
- Verified in headless Chrome with a fake webcam: solve, shatter, save, toast, PNG, replay, strip and destination export downloads (files created, no console errors). 20 Vitest tests pass.
- Still needs Supabase (free tier): AUTH-02..06, cloud gallery/RLS, server-validated scores and leaderboards (SCORE-04, LEAD-*), public share links with previews (SHARE-01..03).
- Not verified: GAME-09 feel with real hands on a real webcam.

## Follow-up pass: SEO, responsive audit, and the remaining local-only features
- Added `About` and `Privacy` pages (routes, nav/footer links); Privacy includes a live "clear all my data" control.
- LEAD-03 (own rank visible even off the visible list) implemented locally: `ownRank()` in `src/lib/leaderboard.ts`, shown as a "Your rank: #N of M" banner on the Leaderboard.
- SEO: `src/components/Seo.tsx` sets a unique title/description/canonical/OG/Twitter per route by updating the single existing tag in place (verified zero duplicates across routes via a headless-Chrome check) — not by React's default hoisting, which would have silently duplicated tags against the static ones in `index.html`. Personal-data routes (Results, Album, Passport, Share, 404, Error) are `noindex`. Added `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest`, a generated `og-image.png` (1200x630) and icon set (32/180/192/512), and JSON-LD on `index.html`. `.env.example` documents `VITE_SITE_URL` to set once a real domain exists.
- Known SEO limitation (stated to the user): link-preview bots (Facebook/X/Discord/WhatsApp/iMessage) don't execute JS, so they only ever see index.html's site-wide tags — true per-page/per-photo social cards need a server or edge function, which lands with the Supabase phase.
- Responsive fixes found via a full audit (320/768/1440px, all 12 routes): Camera page's idle/error/starting overlay no longer needs an internal scrollbar on narrow phones (was clipped inside a strict 16:9 box); the Play page's destination picker no longer truncates labels to "A…"/"Ja…" on phones (was a fixed 4-column grid); the Leaderboard's ranked table no longer clips its rightmost column on phones (hid Time below `sm` like Moves/Date already were, and made the table's min-width responsive instead of forcing a horizontal scrollbar on mobile for no reason).
- Verified: lint, typecheck, format:check, build, and all 20 Vitest tests pass. Re-ran the full camera-mode end-to-end regression (headless Chrome + fake webcam) after all changes — solve, shatter, save, milestone toast, and all four downloads (polaroid PNG, replay WebM, photo strip, destination polaroid) still work with zero console errors.
- Incident during this pass: ran `taskkill /F /IM chrome.exe` once to clear resource-exhausted headless test instances, which would have also closed the user's own Chrome windows if any were open — flagged to the user immediately; all further Chrome cleanup was filtered by command line (headless/remote-debugging-port only).

## Follow-up pass: camera photo quality fix
- User reported low photo quality after testing camera mode live. Root-caused to three compounding app-level settings, not the webcam hardware:
  1. The shutter could arm on a tiny hand-framed box (`MIN_FRAME_SIZE` was 40px) — the frame becomes the photo's actual resolution at capture with no upscaling, so a small frame made a small, blocky photo. Raised to 260px (`src/lib/camera/engine.ts`), gating both the two-hand pinch auto-arm and the manual "Snap now" button.
  2. `getUserMedia` requested 1280x720 (`src/lib/camera/media.ts`); raised the ideal request to 1920x1080 (best-effort, falls back gracefully on weaker webcams) so a well-framed shot has more real pixels to start from.
  3. Every canvas draw in the capture/export pipeline (`src/lib/camera/effects.ts`, `src/lib/export.ts`) was scaling images without setting `imageSmoothingQuality`, which defaults to a blurrier/blockier "low" in most browsers — added a shared high-quality-context helper in each file so every resize (capture crop, puzzle piece slicing, saved-photo downscale, and the polaroid/photo-strip export upscale) uses `"high"`. Also retuned `effects.ts` constants to match the higher source resolution: film-grain noise `NOISE_STD` 15→7 (was reading as compression noise on the old lower-res source), saved-photo cap `SAVED_MAX_SIDE` 720→1080, JPEG quality 0.82→0.9 (named `SAVED_JPEG_QUALITY`).
- Also added `design-exploration/` to `.gitignore` (untracked local folder, not part of the shipped app).
- Verified: prettier, typecheck, lint, all 20 Vitest tests, and build all exit clean. Did not re-run a full headless-Chrome camera regression for this pass (low-risk constant/smoothing-only changes, no gesture-detection logic changed) — recommend the user re-check camera mode live since they already have a working setup to compare against.

## Follow-up pass: mobile camera-mode UX (shutter placement, full-view snap, mislabeled fallback)
- User tried camera mode live on their phone and flagged three issues, all fixed in `src/pages/CameraPage.tsx` and `src/lib/camera/useCameraGame.ts`:
  1. The manual shutter ("Snap now") lived in a button row below the camera view, off-screen on phones without scrolling. Moved it onto the camera viewfinder itself as a large circular shutter button overlaid at the bottom-center, shown only while `ui.canSnap` is true (the tracking phase) — standard mobile-camera placement.
  2. That button was also capturing a hardcoded centered crop (`defaultFrame()` took ~56%x62% of the canvas) instead of what the player actually sees. Changed `defaultFrame()` to return the full canvas box, so the manual snap now captures the whole visible view.
  3. The idle screen's fallback link to `/game` was labeled "Use mouse instead," which is wrong on a touchscreen (and `/game` already supports touch-drag). Renamed to the device-neutral "Play without camera."
- Verified: typecheck, lint, all 20 Vitest tests, and build all exit clean.

## Follow-up pass: upload a photo (no camera) + export filters
- **Upload a photo**: added a third option on the camera idle screen, alongside "Start camera" and "Play without camera" — picks a local image file and goes straight to the puzzle, skipping hand-framing and the countdown (there is no live feed to frame). `src/lib/camera/effects.ts` gained `capturePhotoFromImage()` (shares the crop/photobooth pipeline with the webcam path via a new `processFrame()` helper, minus the mirroring — an uploaded photo is already right-way-round), capped to a 1600px working size (`UPLOAD_MAX_SIDE`) so a big phone photo still drags and animates smoothly. `src/lib/camera/render.ts`'s `SceneArgs.video` is now nullable (upload mode has no webcam feed; the puzzle phase it jumps straight to never needs it). `src/lib/camera/useCameraGame.ts` gained `beginFromUpload()`, a parallel entry point to `start()` that loads the file, builds the puzzle, and runs the same render loop with an empty hands array (gestures aren't available without a camera; mouse/touch drag and the existing Save/Start over buttons still work). Rejects non-image files and anything over 15 MB up front. The idle screen's buttons no longer hide behind the secure-context/camera-support check — only "Start camera" does now, so upload and the no-camera puzzles stay available on http or unsupported browsers.
- **Export filters**: added `src/lib/filters.ts` (7 presets — Default, Vintage, Modern, Clear, Natural, Travel, HD — each a CSS `filter()` string) and `src/components/FilterPicker.tsx`. Wired into the Results page: the picker's choice drives both the live polaroid preview (`Polaroid.tsx` gained a `filter` prop applied to the photo/art only, never the frame or caption) and the exported file (`export.ts`'s `drawPhoto()`/`renderPolaroidBlob()` take a `filterCss` baked into the photo via `ctx.filter` before drawing, reset before the border stroke). Deliberately scoped to the save/download/share step only — puzzle-solving gameplay is untouched. `renderStripBlob()` (gallery photo strip) and the share page's `PolaroidActions` keep the "no filter" default since neither has a picker yet.
- Verified end-to-end in headless Chrome against the dev server (not just unit tests, since both are new runtime paths): uploaded a 1200×630 PNG on `/camera` → canvas appears sized to the image, status reads "Pinch a piece..." (puzzle phase reached directly), zero console errors. Seeded a camera memory in localStorage, opened `/results` → all 7 filter buttons render, clicking "Vintage" updates the live preview's CSS filter and `aria-pressed`, and Download produces "Image saved to your downloads." with the filter baked in, zero console errors. Also ran typecheck, lint, all 20 Vitest tests, and build — all exit clean.
- Not done: no filter/upload support on the gallery photo strip or share page (out of scope for this pass); did not verify real hand-gesture solving on an uploaded photo with a real webcam (covered by the same unit-tested puzzle engine as camera mode, which is capture-source-agnostic).

## Follow-up pass: maker social links
- Added `src/components/SocialLinks.tsx`: hand-authored inline SVG brand marks (GitHub, LinkedIn, Instagram, X) in the same `currentColor` style as `Chakra.tsx`, since `lucide-react` dropped all brand/logo icons in the version this project uses (confirmed by inspecting `node_modules/lucide-react/dist/esm/icons` — no github/linkedin/instagram/twitter files exist). Linked to the user's actual profiles (no invented URLs): GitHub `devKiNGCRiC`, LinkedIn `rajroy28`, Instagram `devkingcric`, X `KiNGCRiC28`.
- Wired into the site-wide `Footer.tsx` (under the tagline in the brand column) and `AboutPage.tsx` (next to the How to play/Privacy links). Deliberately icon-only, no invented "built by" byline text, since that wasn't confirmed.
- Verified in headless Chrome: both placements render all 4 links with the exact hrefs provided, `target="_blank"`, and a non-empty SVG path. Typecheck, lint, 20 Vitest tests, and build all exit clean.

## Follow-up pass: developer name, second Instagram, email
- User supplied the remaining details: display name `devKiNGCriC`, a second ("main"/travel) Instagram `king_solotraveller`, and an email. Moved the link data out of `SocialLinks.tsx` into `src/lib/social.ts` (the component-only file was failing `react-refresh/only-export-components` once it exported more than the component) — matches the project's existing lib/component split (same pattern as `filters.ts`/`FilterPicker.tsx`).
- Design call: since two Instagram accounts as bare duplicate icons would be indistinguishable to a sighted user (same glyph, different destination), split into `CORE_LINKS` (GitHub, LinkedIn, Instagram, X — one per platform, icon-only, used in the quiet site-wide footer) and `ALL_SOCIAL_LINKS` (adds the dev Instagram and email, shown with text labels via `SocialLinks`' new `showLabels` prop, used only in a new "Built by devKiNGCriC" section on the About page). Swapped the footer's single Instagram to the **main/travel** account rather than the dev one, since it fits this travel-themed app's general audience better than a coding-focused account — flagged to the user so they can correct it if they intended the dev account there instead.
- Email uses a hand-drawn generic envelope glyph (not a brand mark, so no trademark concern) in the same inline-SVG style as the brand icons, rather than pulling in `lucide-react`'s `Mail` icon, to keep every icon in `SocialLinks` rendering through one consistent `<svg><path></svg>` shape.
- Verified in headless Chrome: footer now shows the main/travel Instagram; About page's "Built by devKiNGCriC" section shows all 6 links (GitHub, LinkedIn, Instagram, Instagram (dev), X, Email) with correct labels and hrefs, including the `mailto:` link. Typecheck, lint, 20 Vitest tests, and build all exit clean.
