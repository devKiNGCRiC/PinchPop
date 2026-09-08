# Roadmap: PinchPop

## Overview

PinchPop takes a working, single-file vanilla-JS gesture photobooth prototype and turns it into a production-ready Web MVP: a React + TypeScript + Vite application with a Supabase backend. The journey starts by proving the deployment pipeline and porting the performance-critical gesture/puzzle engine untouched in behavior, then builds an independent Supabase schema in parallel. Auth and guest mode unlock the save flow, which is the first point where gameplay output meets the backend. From there, read-heavy gallery pages, then the trust-sensitive scoring/leaderboard/achievements/profile cluster, then public sharing (with its unique SSR requirement) each build on real saved data. A final hardening phase audits security and performance before launch. Phase count (9) intentionally exceeds the "standard" granularity's typical 5-8 range because the architecture has genuine, independently-justified delivery boundaries: the engine port and Supabase schema are explicitly parallelizable with no shared code, anti-cheat scoring has a hard "design before UI" ordering constraint, and public sharing isolates a unique SSR/Open Graph requirement that doesn't fit cleanly into any other phase.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: App Shell & Deployment Pipeline** - Deployed React/Vite/Router shell with placeholder pages for every route
- [ ] **Phase 2: Game Engine Port** - Gesture capture → puzzle → polaroid loop ported into React, behavior-identical to the prototype
- [ ] **Phase 3: Supabase Schema & RLS** - RLS-protected Postgres schema, storage bucket, and leaderboard views
- [ ] **Phase 4: Auth & Guest Mode** - Guest play, email/Google sign-in, seamless guest→account data carryover
- [ ] **Phase 5: Capture → Save Integration (Results Flow)** - Completed photo/score flows end-to-end from engine into Supabase
- [ ] **Phase 6: Gallery** - Paginated, owner-scoped personal photo gallery with delete
- [ ] **Phase 7: Scoring, Speed Run, Leaderboard, Achievements & Profile** - Anti-cheat Speed Run scoring, leaderboards, achievements, profile stats
- [ ] **Phase 8: Public Sharing** - Revocable public share links with rich previews, download, and OS share sheet
- [ ] **Phase 9: Deployment Hardening** - Final RLS audit, image compression, performance pass, production config review

## Phase Details

### Phase 1: App Shell & Deployment Pipeline

**Goal**: Users can navigate a live, deployed React application shell with placeholder pages for every planned screen, and the deployment pipeline is proven before real feature work lands on top of it.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, DEPLOY-01, DEPLOY-02
**Success Criteria** (what must be TRUE):

  1. User can visit the live Vercel URL and see a landing/home page introducing PinchPop
  2. User can navigate from the home page to a game screen and see a results page after completing the (placeholder) flow
  3. The application layout adapts correctly across desktop and common mobile viewport widths
  4. Direct navigation or a page refresh on any client-side route (e.g. `/gallery`, `/share/:slug`) loads correctly instead of 404ing

**Plans**: 7 plans
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Move the legacy prototype into `legacy/`, scaffold Vite + React + TypeScript at the repo root, pin Node 22, and configure ESLint + Prettier

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Wire Tailwind v4 and the `@` alias, initialize shadcn/ui, generate the six primitives, and overlay the PinchPop brand tokens and self-hosted fonts

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Commit the `vercel.json` SPA catch-all rewrite and the GitHub Actions lint + typecheck + build workflow, dry-run locally

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-04-PLAN.md — Build the `NavBar`, `MobileNavSheet`, `AppShell`, and `PlaceholderCard` shell components

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 01-05-PLAN.md — Create the seven route pages, wire the `createBrowserRouter` tree, mount it, and verify SHELL-01..04 locally

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 01-06-PLAN.md — Run CI against the repo, enable branch protection on `main`, and link the Vercel project for the first production deploy

**Wave 7** *(blocked on Wave 6 completion)*

- [ ] 01-07-PLAN.md — Smoke-check and human-verify DEPLOY-01 and DEPLOY-02 on the live deployment

**UI hint**: yes

### Phase 2: Game Engine Port

**Goal**: The gesture-controlled capture → puzzle → polaroid loop works inside the React app, feeling exactly as good (or better) than the original prototype.
**Depends on**: Phase 1
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, GAME-08, GAME-09, SHELL-05
**Success Criteria** (what must be TRUE):

  1. User can grant webcam access and see real-time hand tracking driving the game, ported into the React app
  2. User can frame a photo using two-hand index-finger positioning, pinch with both hands to trigger a 3-second countdown, and capture a photo with the full-color + B&W photobooth split
  3. User can solve the resulting 3x3 puzzle via one-hand pinch drag gestures, hearing procedural sound effects throughout, and sees a shatter animation + polaroid presentation on closed-fist save
  4. User can build a photo strip of up to 3 completed polaroids within a session and download a WebM recording of their gameplay
  5. User sees a clear loading/error state with a retry option if camera permission is denied, no camera is found, or the hand-tracking model fails to load
  6. The ported engine feels performance- and behavior-identical to the original prototype, with no regression in responsiveness or feel

**Plans**: TBD
**UI hint**: yes

### Phase 3: Supabase Schema & RLS

**Goal**: A secure, RLS-protected Postgres schema and storage bucket exist to back every account-gated feature in later phases.
**Depends on**: Nothing (parallelizable with Phase 2)
**Requirements**: None — infrastructure phase enabling Phases 4-8
**Success Criteria** (what must be TRUE):

  1. `profiles`, `photos`, `game_sessions`, `achievements`, `user_achievements`, and `shares` tables exist with Row Level Security enabled from table creation
  2. A query executed as one user cannot read another user's private photos or sessions, verified directly against the RLS policies
  3. The Storage bucket accepts authenticated uploads and denies unauthorized access
  4. `leaderboard_alltime` and `leaderboard_daily` views return correctly shaped, aggregated data, with generated TypeScript types available to the frontend

**Plans**: TBD

### Phase 4: Auth & Guest Mode

**Goal**: Users can play as a guest with zero friction, or create/sign into a full account, with no data lost when converting.
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):

  1. User can play the full capture → puzzle → polaroid loop as a guest, with no signup required
  2. User can sign up and sign in with email/password, and separately with Google OAuth
  3. When a guest converts to a full account, their guest-session photos and scores are preserved automatically with no data loss, including the case where a conflicting account already exists
  4. User's session (guest or authenticated) persists across a page refresh, and user can sign out from any page

**Plans**: TBD

### Phase 5: Capture → Save Integration (Results Flow)

**Goal**: A completed puzzle's photo and score flow end-to-end from the game engine into Supabase, visible immediately on a results page.
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: GALL-01, SCORE-01
**Success Criteria** (what must be TRUE):

  1. User sees their score immediately after completing a puzzle, on the results page alongside their photo
  2. A signed-in user can save the completed photo to their personal gallery, and the photo/session rows persist correctly in Supabase (requires an account)
  3. If the photo upload fails, the user sees a clear failure state rather than a silently lost photo or an orphaned database row

**Plans**: TBD

### Phase 6: Gallery

**Goal**: Users can view and manage the photos they've saved, privately and securely.
**Depends on**: Phase 5
**Requirements**: GALL-02, GALL-03, GALL-04
**Success Criteria** (what must be TRUE):

  1. User can view their saved photos in a paginated personal gallery
  2. User can delete a photo from their personal gallery
  3. User's gallery is private and visible only to them, enforced end-to-end by Row Level Security

**Plans**: TBD
**UI hint**: yes

### Phase 7: Scoring, Speed Run, Leaderboard, Achievements & Profile

**Goal**: Users can compete on a trustworthy, anti-cheat-protected leaderboard, unlock achievements, and see their aggregated stats on a profile page.
**Depends on**: Phase 5, Phase 3
**Requirements**: SCORE-02, SCORE-03, SCORE-04, LEAD-01, LEAD-02, LEAD-03, LEAD-04, ACHV-01, ACHV-02, ACHV-03, PROF-01
**Success Criteria** (what must be TRUE):

  1. User can play Speed Run mode, which tracks completion time, move count, and accuracy, and computes a score from one fixed, documented formula
  2. A submitted Speed Run score is validated server-side (session-start/session-submit, not a raw client INSERT) and cannot be forged via client-side tampering
  3. User can view an all-time leaderboard and a UTC-anchored daily leaderboard of top Speed Run scores, and can always see their own rank even when off-screen from the visible top entries
  4. Guest scores do not appear on the persistent leaderboard until the guest converts to a full account
  5. User unlocks achievements from the fixed set of ~6, sees a visible notification the moment one unlocks, and can view their unlocked achievements and stats (photos captured, puzzles completed, best time) on their profile page

**Plans**: TBD
**UI hint**: yes

### Phase 8: Public Sharing

**Goal**: Users can share a saved photo publicly without requiring the viewer to log in, with rich social previews and download/native share support.
**Depends on**: Phase 3, Phase 6
**Requirements**: SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05
**Success Criteria** (what must be TRUE):

  1. User can generate a public link to a saved photo that requires no login to view
  2. User can revoke a previously shared link, immediately disabling public access
  3. A shared link shows a rich social preview (Open Graph title/image) when pasted into iMessage, WhatsApp, Discord, or Slack
  4. User or visitor can download the photo directly from the share page, and use the OS native share sheet on supported devices with a copy-link fallback where unsupported

**Plans**: TBD
**UI hint**: yes

### Phase 9: Deployment Hardening

**Goal**: The application is audited, secure, and performant under real-world conditions before public launch.
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: DEPLOY-03
**Success Criteria** (what must be TRUE):

  1. Every Supabase table's RLS policies have been audited (no `using (true)` or overly-broad `anon` SELECT) and confirmed to expose only intended data
  2. Uploaded images are compressed before storage, reducing bandwidth/storage cost without visibly degrading photo quality
  3. The game loop performs smoothly on real devices and networks, confirming no regression was introduced by product-layer additions
  4. Vercel production environment variables and build settings are reviewed and confirmed correct

**Plans**: TBD

## Progress

**Execution Order:**
Phases 2 and 3 are architecturally parallelizable (no shared code) but execute in numeric order by default: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. App Shell & Deployment Pipeline | 1/7 | In Progress|  |
| 2. Game Engine Port | 0/TBD | Not started | - |
| 3. Supabase Schema & RLS | 0/TBD | Not started | - |
| 4. Auth & Guest Mode | 0/TBD | Not started | - |
| 5. Capture → Save Integration | 0/TBD | Not started | - |
| 6. Gallery | 0/TBD | Not started | - |
| 7. Scoring, Speed Run, Leaderboard, Achievements & Profile | 0/TBD | Not started | - |
| 8. Public Sharing | 0/TBD | Not started | - |
| 9. Deployment Hardening | 0/TBD | Not started | - |
