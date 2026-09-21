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
