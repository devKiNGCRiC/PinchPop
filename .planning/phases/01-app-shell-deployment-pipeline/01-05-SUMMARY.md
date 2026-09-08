---
phase: 01-app-shell-deployment-pipeline
plan: 05
subsystem: ui
tags: [react-router-dom, routing, shadcn, tailwind-v4, app-shell]
status: AWAITING HUMAN CHECKPOINT

# Dependency graph
requires:
  - phase: 01-app-shell-deployment-pipeline (plan 04)
    provides: AppShell, NavBar, MobileNavSheet, PlaceholderCard components (built but unwired)
provides:
  - "src/pages/*.tsx (7 files) — route-level page components with 01-UI-SPEC.md's locked copy"
  - "src/router.tsx — createBrowserRouter Data-mode route tree, AppShell as the single parent layout route, exports AppRouter"
  - "src/main.tsx — mounts AppRouter (Vite demo App removed)"
affects: [01-05 Task 3 (blocked), all remaining Phase 1 plans, Phase 2+ UI work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SharePage reads :slug via useParams and surfaces it only as a data-share-slug attribute on its outermost element — satisfies noUnusedLocals without interpolating the value into HTML/URL/script context (XSS-safe per threat register T-01-14)"
    - "NotFoundPage composed directly from shadcn Card primitives (not PlaceholderCard, which has no CTA slot), using the danger token as its accent and a secondary-variant Button for Back to Home"
    - "HomePage's Button default variant (bg-primary/text-primary-foreground) resolves to the signal-filled/ink-text CTA automatically via the theme token mapping in src/index.css — no manual color override needed"

key-files:
  created: [src/pages/HomePage.tsx, src/pages/GamePage.tsx, src/pages/ResultsPage.tsx, src/pages/GalleryPage.tsx, src/pages/ProfilePage.tsx, src/pages/SharePage.tsx, src/pages/NotFoundPage.tsx, src/router.tsx]
  modified: [src/main.tsx, index.html]
  deleted: [src/App.tsx, src/assets/react.svg]

key-decisions:
  - "Did NOT mark SHELL-01/SHELL-02/SHELL-03/DEPLOY-02 complete in REQUIREMENTS.md, and did NOT touch STATE.md/ROADMAP.md — Task 3 (the blocking human-verify checkpoint) has not run yet. This plan's own success criteria require human confirmation in a browser before the requirements are truly satisfied; the parallel-executor contract for this run also explicitly reserves STATE.md/ROADMAP.md writes for the orchestrator after the wave and the checkpoint both resolve."
  - "[Rule 1 - Bug] Reformatted src/pages/HomePage.tsx with Prettier during Task 2 — Task 1's own automated verify block (lint/typecheck/build/greps) does not run format:check, so the paragraph's line-wrapping violation wasn't caught until Task 2's format:check gate. Fixed via npx prettier --write, content unchanged, re-verified all four gates green, included in the Task 2 commit."

patterns-established: []

requirements-completed: []

# Metrics
duration: ~25min (Tasks 1-2 only; Task 3 not started)
completed: PENDING (blocked on human checkpoint)
---

# Phase 1 Plan 05: Route-Level Pages + Router Wiring Summary

**Seven route-level pages built and wired into a single `createBrowserRouter` Data-mode route tree nested under `AppShell`, with the Vite demo scaffolding removed — Tasks 1 and 2 complete, Task 3 (blocking human-verify checkpoint) has NOT been started and requires the developer to visually inspect the running app in a browser.**

## STATUS: AWAITING HUMAN CHECKPOINT

This plan has 3 tasks. Tasks 1 and 2 (`type="auto"`) are complete, verified, and committed. Task 3 is `type="checkpoint:human-verify"` with `gate="blocking"` — it requires a human to run `npm run dev`, open the app in a real browser, and manually confirm SHELL-01 through SHELL-04 against the checklist below. This is not something an agent can self-approve, infer from a clean build, or fabricate. **The plan is not complete until Task 3 is run and approved by the developer.**

## Performance

- **Tasks:** 2/3 completed (Task 3 not started — blocked on human)
- **Files modified:** 10 (8 created, 2 modified, 2 deleted)

## Accomplishments (Tasks 1-2 only)

- All seven route-level page components exist under `src/pages/` with 01-UI-SPEC.md's locked copy reproduced verbatim (verified via grep in Task 1's automated check).
- `HomePage` is a full-bleed hero (not a `PlaceholderCard` usage): Display-role headline "Capture. Solve. Remember." (32px → 48px at `md`), a Body-role premise paragraph in warm paper color, and exactly one signal-filled CTA ("Start Playing", `Button asChild` wrapping a `Link` to `/game`).
- `GamePage`, `ResultsPage`, `GalleryPage`, `ProfilePage`, `SharePage` are one-line `PlaceholderCard` consumers with the exact locked heading/body copy.
- `SharePage` consumes `:slug` via `useParams` and exposes it as `data-share-slug` on its outermost `div` — satisfies `noUnusedLocals` and gives DEPLOY-02 verification a concrete DOM hook.
- `NotFoundPage` is composed directly from the shadcn `Card` set (heading "Page not found.", body copy, "Back to Home" CTA), using the danger token as its accent since it can't use `PlaceholderCard` (no CTA slot).
- `src/router.tsx` created: `createBrowserRouter` Data mode (D-01), one `AppShell` parent route (D-04), children in order `index`/`game`/`results`/`gallery`/`profile`/`share/:slug`/`*` (D-03's catch-all rendering inside the shell).
- `src/main.tsx` rewritten to mount `AppRouter`, retaining all three `@fontsource` imports and `./index.css`; `App` import/usage removed.
- `src/App.tsx` and `src/assets/react.svg` deleted (Vite demo scaffolding). `src/App.css` was already removed in plan 01-02.
- `index.html` document title changed from `vite-scaffold` to `PinchPop`; `lang="en"` and `class="dark"` confirmed intact; no OG/Twitter meta tags added (out of scope, Phase 8).
- All four quality gates green after both tasks: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`.
- Plan-level verification also confirmed: `built on PuzzleCam by Unnati-23` appears exactly once, in `src/components/AppShell.tsx`; zero matches for `react-router/dom` anywhere in `src/`.

## Task Commits

1. **Task 1: Create the seven route-level page components** - `620aaa6` (feat)
2. **Task 2: Wire the createBrowserRouter route tree and mount it from main.tsx** - `a45c08a` (feat, includes a Rule 1 Prettier fix to `HomePage.tsx`)
3. **Task 3: Verify the running app against SHELL-01 through SHELL-04** - NOT STARTED (blocking human checkpoint)

## Files Created/Modified

- `src/pages/HomePage.tsx` - Landing hero: Display headline, Body premise paragraph, single signal CTA to `/game` (Task 1, reformatted in Task 2)
- `src/pages/GamePage.tsx` - `PlaceholderCard` consumer, "Game screen coming soon" (Task 1)
- `src/pages/ResultsPage.tsx` - `PlaceholderCard` consumer, "Results coming soon" (Task 1)
- `src/pages/GalleryPage.tsx` - `PlaceholderCard` consumer, "Gallery coming soon" (Task 1)
- `src/pages/ProfilePage.tsx` - `PlaceholderCard` consumer, "Profile coming soon" (Task 1)
- `src/pages/SharePage.tsx` - `PlaceholderCard` consumer + `useParams`/`data-share-slug`, "Shared memory coming soon" (Task 1)
- `src/pages/NotFoundPage.tsx` - Direct shadcn `Card` composition, danger accent, "Back to Home" CTA (Task 1)
- `src/router.tsx` - `createBrowserRouter` Data-mode route tree, exports `AppRouter` (Task 2)
- `src/main.tsx` - Mounts `AppRouter`, `App` import/usage removed (Task 2)
- `index.html` - Title changed to `PinchPop` (Task 2)
- `src/App.tsx` - Deleted, Vite demo scaffold (Task 2)
- `src/assets/react.svg` - Deleted, orphaned demo asset (Task 2)

## Decisions Made

- Used the shadcn `Button`'s default variant for the `HomePage` CTA rather than a manual color override — `src/index.css`'s `--primary`/`--primary-foreground` tokens are already mapped to signal/ink, so `<Button asChild>` produces the exact signal-filled, ink-text treatment 01-UI-SPEC.md requires with zero extra classes.
- `SharePage`'s `data-share-slug` attribute lives on a wrapper `div` around `PlaceholderCard` rather than passed as a prop into `PlaceholderCard` itself, since `PlaceholderCard`'s props are fixed to `{ heading, body }` and don't forward arbitrary DOM attributes (confirmed by reading the component before use, per Task 1's `read_first`).
- Left `src/assets/hero.png` in place even though it's now unreferenced (its only importer, `App.tsx`, was deleted) — it is not named in this plan's `files_modified` list and removing it is out of this task's scope per the deviation rules' scope boundary; noted here rather than silently deleted.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prettier formatting violation in `HomePage.tsx`**
- **Found during:** Task 2, running `npm run format:check` (part of Task 2's automated verify — Task 1's verify block does not include `format:check`, so this wasn't caught when Task 1 was committed)
- **Issue:** The hero paragraph's JSX text wrapped across lines in a way that exceeded Prettier's configured print width, flagged as a style violation.
- **Fix:** Ran `npx prettier --write src/pages/HomePage.tsx`. Content unchanged (formatting-only diff, text re-wrapped). Re-ran `lint`, `typecheck`, `format:check`, and `build` — all green.
- **Files modified:** `src/pages/HomePage.tsx`
- **Verification:** `npm run format:check` reports "All matched files use Prettier code style!"
- **Committed in:** `a45c08a` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (formatting only, no functional or copy change).
**Impact on plan:** None on scope. Every Task 1 and Task 2 acceptance criterion is satisfied on its own literal terms.

## Issues Encountered

None beyond the deviation above.

## User Setup Required

**BLOCKING — Task 3 has not been run.** The developer must:

1. Run `npm run dev` (from the plan's project root) and open the printed local URL (typically `http://localhost:5173`).
2. Walk through the full checklist below (reproduced verbatim from `01-05-PLAN.md` Task 3's `how-to-verify` block) in a real browser.
3. Report back either "approved" or a description of any defects found.

### How to verify (verbatim from the plan)

Start the dev server with `npm run dev` and open the printed local URL (typically `http://localhost:5173`). Then check the following:

1. **SHELL-01 — landing page.** At `/` you should see the headline "Capture. Solve. Remember.", one paragraph describing the gesture-photobooth premise, and a single amber ("signal", #f5c518) button labeled "Start Playing". Background is near-black ink (#0a0a08). The top bar shows the amber "PINCHPOP" wordmark on the left.
2. **SHELL-02 — navigate to the game screen.** Click "Start Playing". The URL becomes `/game` and a white card reads "Game screen coming soon" with the body "The gesture capture and puzzle engine lands in the next phase." Then click "Play" in the top nav — same destination. Confirm the active nav link has a 2px amber underline and that the underline moves as you navigate.
3. **SHELL-03 — results page.** Enter `/results` in the address bar. A white card reads "Results coming soon" with the body "Your photo and score will appear here once the capture flow is built."
4. **Remaining routes.** Visit `/gallery`, `/profile`, and `/share/anything` — each shows its own "coming soon" card. Then visit a nonsense path like `/does-not-exist` — you should see "Page not found." with a "Back to Home" button that returns you to `/`. The nav bar and the footer line "PinchPop — built on PuzzleCam by Unnati-23" must be visible on every one of these pages, including the 404.
5. **SHELL-04 — responsive layout.** Open DevTools' device toolbar. At 375px wide (iPhone SE) the horizontal nav links must be gone, replaced by a hamburger button on the right; tapping it opens a drawer from the right side containing Home, Play, Gallery, Profile stacked vertically, and tapping any link both navigates and closes the drawer. Press Escape — the drawer closes. At 768px and above the hamburger disappears and the horizontal link row returns. At 1280px the content stays centered rather than stretching edge to edge. Confirm no horizontal scrollbar appears and no text is clipped at 375px, 768px, and 1280px.
6. **Typography and fonts.** The nav links, wordmark, and footer render in IBM Plex Mono (monospace, uppercase, letter-spaced). Headings and body copy render in Inter. Neither should fall back to a generic system font — the fonts are bundled locally, so this works offline.

Report anything that does not match, especially: wrong or paraphrased copy, missing footer attribution, nav underline on the wrong link, drawer that does not close on navigation, or any layout breakage at 375px.

### Resume signal (verbatim from the plan)

> Type "approved" to continue, or describe the issues found.

If defects are reported, they must be fixed in the owning file (`src/pages/*` for copy, `src/components/NavBar.tsx`/`MobileNavSheet.tsx` for nav behavior, `src/components/AppShell.tsx` for the footer, `src/index.css` for tokens/fonts), re-verified with `lint`/`typecheck`/`build`, and this checkpoint re-presented — the plan is not complete on an unresolved defect.

## Known Stubs

None introduced beyond what 01-UI-SPEC.md's placeholder pages intentionally specify (each "coming soon" card is a deliberate stub for a feature landing in a later phase, per the Route & Placeholder Page Inventory).

## Next Phase Readiness

- Tasks 1 and 2 are fully committed and independently verified (lint/typecheck/format/build all green, all grep-based acceptance criteria pass).
- Task 3 is the sole remaining blocker for this plan. Once the developer confirms the checklist in a real browser (or reports defects for a fix-and-recheck loop), this plan can be marked complete and SHELL-01/SHELL-02/SHELL-03/DEPLOY-02 can be marked complete in `REQUIREMENTS.md` — that update, along with `STATE.md`/`ROADMAP.md`, is intentionally deferred to the orchestrator, not made by this executor.
- No code changes are anticipated to be needed for Task 3 unless the developer reports a specific defect.

---
*Phase: 01-app-shell-deployment-pipeline*
*Status: AWAITING HUMAN CHECKPOINT — Task 3 not started*

## Self-Check: PASSED

All claimed files verified present: `src/pages/{HomePage,GamePage,ResultsPage,GalleryPage,ProfilePage,SharePage,NotFoundPage}.tsx`, `src/router.tsx`, `src/main.tsx`, `index.html`. Both claimed deletions confirmed absent: `src/App.tsx`, `src/assets/react.svg`. Both claimed commit hashes verified in `git log` (`620aaa6`, `a45c08a`).
