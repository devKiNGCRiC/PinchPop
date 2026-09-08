---
phase: 01-app-shell-deployment-pipeline
plan: 04
subsystem: ui
tags: [react, react-router-dom, shadcn, radix, tailwind-v4, navigation]

# Dependency graph
requires:
  - phase: 01-app-shell-deployment-pipeline (plan 02)
    provides: Tailwind v4 theme tokens, shadcn Button/Card/Sheet/Separator primitives, cn() helper
provides:
  - "src/components/NavBar.tsx — 64px ink header with signal-colored PINCHPOP wordmark, desktop link row with active-route signal underline, mobile hamburger swap at md breakpoint"
  - "src/components/MobileNavSheet.tsx — Radix-backed shadcn Sheet mobile nav drawer with 44x44px accessible trigger and link-dismiss-on-navigate behavior"
  - "src/components/AppShell.tsx — single nested-layout route (NavBar + Outlet + Separator + PuzzleCam attribution footer), the only place chrome renders"
  - "src/components/PlaceholderCard.tsx — shared paper-surface empty-state card (heading/body props) for every Phase 1 stub route"
affects: [01-05, all remaining Phase 1 plans and Phase 2+ UI work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NAV_LINKS array (to/label/end) duplicated identically in NavBar.tsx and MobileNavSheet.tsx rather than extracted to a shared constants file — kept local per plan's fixed 4-file scope; a future plan may extract if a third consumer appears"
    - "NavLink's isActive render-prop className used for active-route styling (border-b-2 border-signal vs border-transparent) instead of a manual pathname comparison"
    - "44x44px accessibility hit-target override applied via Tailwind h-11 w-11 on top of shadcn Button's size='icon' (size-9) — tailwind-merge resolves the size/height/width utility conflict correctly"

key-files:
  created: [src/components/NavBar.tsx, src/components/MobileNavSheet.tsx, src/components/AppShell.tsx, src/components/PlaceholderCard.tsx]
  modified: []

key-decisions:
  - "Worktree base was stale at spawn time (only wave 1 commits present, missing wave 2 shadcn/Tailwind work and wave 3 deployment pipeline work). Corrected per the mandatory worktree_branch_check step: git reset --hard to the orchestrator-specified base commit 6b73ca7 (tip of main after wave 3) before any task work began. Working tree was clean at the time, so no work was at risk."
  - "Did not mark SHELL-01/SHELL-02/SHELL-04 complete in REQUIREMENTS.md. This plan only builds the shell components in isolation — the plan's own objective states 'Nothing renders these yet — plan 01-05 wires them into the router.' None of the three requirements (view a landing page, navigate to game screen, responsive app) are literally satisfiable until 01-05 wires AppShell/NavBar into src/router.tsx and pages exist. Left REQUIREMENTS.md untouched per this plan's explicit instruction to avoid the wave-3 mistake of marking requirements complete based on scaffolding existing rather than end-to-end verification."

patterns-established: []

requirements-completed: []

# Metrics
duration: ~15min
completed: 2026-09-09
---

# Phase 1 Plan 04: App Shell Components Summary

**Responsive NavBar with Radix-backed mobile Sheet drawer, a single nested-layout AppShell carrying the once-only PuzzleCam attribution footer, and a shared PlaceholderCard for every Phase 1 stub route — none of it wired into routing yet (that's plan 01-05).**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2/2 completed
- **Files modified:** 4 (4 created, 0 modified)

## Accomplishments

- `NavBar.tsx`: 64px-tall ink `header`, signal-colored `PINCHPOP` wordmark linking to `/`, and a `md:flex` horizontal link row (Home/Play/Gallery/Profile) with a 2px signal bottom-border on the active route via `NavLink`'s `isActive` render prop
- `MobileNavSheet.tsx`: built entirely on the shadcn `Sheet` (Radix Dialog) — no hand-rolled `useState`/`aria-*` — with an `aria-label="Open navigation menu"` 44x44px hamburger trigger, an `sr-only` `SheetTitle` for the required accessible name, and every link wrapped in `SheetClose` so navigation auto-dismisses the drawer
- `AppShell.tsx`: the sole nested layout — `NavBar` + `<Outlet />` + a `Separator` + the exact attribution string `PinchPop — built on PuzzleCam by Unnati-23`, appearing exactly once in `src/`
- `PlaceholderCard.tsx`: a two-prop (`heading`, `body`) shared component wrapping the shadcn `Card` as a paper-white "photo tray" surface — zero hardcoded page copy
- All four quality gates green throughout both tasks: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`

## Task Commits

Each task was committed atomically:

1. **Task 1: Build NavBar and MobileNavSheet** - `d07a1d1` (feat)
2. **Task 2: Build AppShell and PlaceholderCard** - `81ccfa7` (feat)

_No TDD tasks in this plan — both tasks are `type="auto"` component-building work with no `<behavior>` blocks._

## Files Created/Modified

- `src/components/NavBar.tsx` - Desktop/mobile-responsive top navigation chrome (Task 1)
- `src/components/MobileNavSheet.tsx` - Radix Sheet-backed mobile nav drawer (Task 1)
- `src/components/AppShell.tsx` - Nested layout route: nav + outlet + attribution footer (Task 2)
- `src/components/PlaceholderCard.tsx` - Shared empty-state card for stub pages (Task 2)

## Decisions Made

- Kept the 4-link `NAV_LINKS` array duplicated in both `NavBar.tsx` and `MobileNavSheet.tsx` rather than introducing a shared constants module — the plan's `files_modified` list is fixed to exactly these 4 files, and the duplication is small (4 short objects) and low-risk to drift since both lists are locked by 01-UI-SPEC.md's Navigation Pattern.
- Overrode the shadcn `Button`'s `size="icon"` (`size-9`, 36px) with `h-11 w-11` (44px) on the hamburger trigger to satisfy the WCAG touch-target floor — verified `tailwind-merge` resolves the `size-*` vs `h-*`/`w-*` conflict correctly (confirmed via lint/build passing and literal `h-11` grep check).
- Did not extract a shared `nav-links.ts` constants file, per D-09 (this plan builds exactly the 4 named components, no new files beyond them).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking, worktree infrastructure] Worktree spawned from a stale base commit**
- **Found during:** Mandatory `worktree_branch_check` step, before any task work
- **Issue:** This worktree's branch (`worktree-agent-ae710cd5b4b2ed52b`) was based on commit `99a36bb` ("update tracking after wave 1"), which predates wave 2 (Tailwind v4 + shadcn/ui, plan 01-02) and wave 3 (deployment pipeline, plan 01-03) entirely. `git merge-base HEAD 6b73ca7a522be5e11c4985c6ae08980c600d71ef` did not equal the expected base, and `6b73ca7` was confirmed to be the current tip of `main` (post-wave-3), not an ancestor of the stale worktree HEAD. Executing plan 01-04 against the stale base would have meant building `NavBar`/`AppShell`/`PlaceholderCard` against a repo with no Tailwind, no shadcn primitives, and no `src/components/ui/*` — all of which this plan's Task 1/2 `read_first` steps depend on.
- **Fix:** Verified `git status --short` was clean (no uncommitted work at risk), then ran `git reset --hard 6b73ca7a522be5e11c4985c6ae08980c600d71ef` exactly as the mandatory setup step specifies, bringing the worktree branch to the correct post-wave-3 base before any file was read or written.
- **Files modified:** none (branch pointer only)
- **Verification:** `git rev-parse HEAD` confirmed exact match to the expected base commit; `src/components/ui/{button,card,sheet,separator}.tsx` and `src/index.css` (Tailwind v4 + brand tokens) were then confirmed present via the subsequent `read_first` reads.
- **Committed in:** N/A (pre-work branch correction, not a code change)

**2. [Rule 1 - Bug] `npx prettier --write` reformatted the two Task 1 files before commit**
- **Found during:** Task 1, running the plan's own `npm run format:check` gate proactively before committing
- **Issue:** The hand-written `NavBar.tsx`/`MobileNavSheet.tsx` used a single-line multi-import statement and lacked trailing commas in a multi-line array, both of which `format:check` flagged.
- **Fix:** Ran `npx prettier --write` on both files; re-ran `lint`/`typecheck`/`format:check`/`build` and the task's grep-based acceptance criteria — all passed unchanged (formatting-only diff).
- **Files modified:** `src/components/NavBar.tsx`, `src/components/MobileNavSheet.tsx`
- **Verification:** `npm run format:check` reports "All matched files use Prettier code style!"; grep-based acceptance criteria re-verified post-format
- **Committed in:** `d07a1d1` (Task 1 commit, formatting applied before commit)

---

**Total deviations:** 2 auto-fixed (1 blocking worktree-infrastructure correction, 1 formatting bug) — neither affects the plan's functional scope.
**Impact on plan:** No scope creep. Every must_have and acceptance criterion is satisfied on its own literal terms.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required.

## Known Stubs

- `NavBar`, `MobileNavSheet`, `AppShell`, and `PlaceholderCard` are all built and fully functional in isolation, but **none are rendered anywhere yet** — `src/App.tsx` still renders the Vite scaffold default, and no `src/router.tsx` exists. This is intentional and explicitly called out in this plan's own objective ("Nothing renders these yet — plan 01-05 wires them into the router"), not an oversight. `npm run typecheck`/`build` cover these files because `tsconfig.app.json` includes all of `src/`, but there is no visual or end-to-end verification possible until 01-05 lands.
- Consequence: SHELL-01, SHELL-02, and SHELL-04 remain unmarked (`[ ]`) in `REQUIREMENTS.md` after this plan — see Decisions Made above.

## Next Phase Readiness

- All four shell components exist, typecheck/lint/build clean, and expose exactly the props/exports plan 01-05 needs (`AppShell`, `NavBar`, `MobileNavSheet`, `PlaceholderCard` with `heading`/`body` props).
- Plan 01-05 can now build `src/router.tsx` (nested route under `AppShell`) and the six `src/pages/*.tsx` files per 01-PATTERNS.md's `router.tsx` snippet — no blockers.
- SHELL-01/02/04 completion is deferred to 01-05's verification (first plan where these components actually render and are reachable via a URL).

---
*Phase: 01-app-shell-deployment-pipeline*
*Completed: 2026-09-09*

## Self-Check: PASSED

All claimed files verified present (`src/components/NavBar.tsx`, `src/components/MobileNavSheet.tsx`, `src/components/AppShell.tsx`, `src/components/PlaceholderCard.tsx`, this SUMMARY.md). All claimed commit hashes verified in `git log` (`d07a1d1`, `81ccfa7`, `c641ee6`).
