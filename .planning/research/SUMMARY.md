# Project Research Summary

**Project:** PinchPop
**Domain:** Gesture-controlled photobooth/puzzle web game — real-time MediaPipe/Canvas engine migrated into a routed React + TypeScript SPA, with a new Supabase backend (auth, gallery, scoring, sharing) deployed to Vercel
**Researched:** 2026-09-09
**Confidence:** HIGH

## Executive Summary

PinchPop is a "migrate, don't rewrite" project: a working, tuned vanilla-JS gesture game (webcam → MediaPipe hand tracking → canvas puzzle → polaroid) needs to be ported into React 19 + TypeScript + Vite 8 while an entirely new product layer — Supabase-backed auth, guest mode, personal gallery, Speed Run scoring, leaderboards, achievements, and public sharing — is built around it. All four research streams converge on one structural insight: **the real-time game engine and the React/Supabase product shell must be architecturally separate**, connected only through a single bridge component and a Zustand vanilla store used as a one-way, coarse-grained event channel. Every other decision (state management choice, project structure, phase order) follows from protecting that boundary.

The recommended approach ports the engine's finite-state-machine/closure logic almost verbatim into a framework-agnostic `src/game/` module (zero React imports, unit-testable for the first time), mounts it through exactly one `GameCanvasHost` component via `useRef`/`useEffect`, and publishes only infrequent state-machine transitions (not per-frame landmark/drag data) to a Zustand store that React's HUD subscribes to with narrow selectors. In parallel, a standard Supabase schema (RLS-protected `profiles`/`photos`/`game_sessions`/`achievements`/`shares` tables, Storage bucket, two leaderboard views) is designed independently of the engine port, since the two workstreams don't share code until the "Save" flow connects them.

The two dominant risk categories are performance regression and trust/security. Performance risk: routing per-frame engine state through React `useState`, or mishandling React 19 Strict Mode's double-invoke of effects, will either visibly degrade gameplay feel (the explicit non-negotiable requirement) or leave duplicate camera streams/model instances running. Trust/security risk: this app handles real webcam face photos and a competitive leaderboard — both RLS misconfiguration (leaking private galleries) and naive client-side score submission (trivially fakeable via devtools) are well-documented, structural failure modes that must be designed correctly from the first implementation, not retrofitted after real user data exists. A third, lower-severity but easy-to-miss risk is that public share pages require server-rendered Open Graph tags, which a pure client-rendered SPA route cannot provide — this needs an explicit SSR/edge-function/prerender solution, not "just another React route."

## Key Findings

### Recommended Stack

The stack is React 19.2.8 + TypeScript 5.9.3 (pinned below TS 7.x due to a hard `typescript-eslint` peer-dependency ceiling, verified live against npm) + Vite 8.2.2 with the Oxc-based `@vitejs/plugin-react` v6. Zustand 5.0.15 is the load-bearing state library — not just for UI state, but specifically because its vanilla `getState()`/`setState()`/`subscribe()` API (usable entirely outside React) is the mechanism that lets the rAF/MediaPipe loop push coarse state transitions into React without triggering 60fps re-renders. `@mediapipe/tasks-vision` should move from the prototype's CDN `<script>` import to a real npm dependency (now at a stable 1.0.x line) for typed, reproducible, Vite-bundled builds. `@supabase/supabase-js` (plain client, not `@supabase/ssr`) handles auth/Postgres/Storage for this pure client SPA. Tailwind v4 (via `@tailwindcss/vite`) is recommended for the large amount of new product-layer UI (auth, gallery, leaderboard, profile) while the existing hand-authored `css/styles.css` design tokens stay scoped to the game screen. React Router v7 (declarative mode, not full data-router) handles the handful of top-level routes.

**Core technologies:**
- React 19 + TypeScript 5.9.3 + Vite 8: UI layer and build tooling — current stable majors, verified compatible via live npm peer-dependency checks
- Zustand (vanilla + hook API): the engine↔React bridge — its non-React `getState()/setState()` API is what makes the imperative-engine-in-React pattern safe
- `@mediapipe/tasks-vision` (npm, not CDN): hand landmark detection — gains typing, reproducible builds, offline dev capability
- `@supabase/supabase-js`: auth (email/password + Google OAuth), Postgres, Storage — plain client, no SSR package needed
- Tailwind v4 + React Router v7 + react-hook-form/zod + date-fns: product-layer UI, forms, and UTC-anchored leaderboard date math

### Expected Features

**Must have (table stakes):**
- Zero-friction guest play (via Supabase anonymous sign-in, not local-only state) with seamless guest→account data carryover on signup
- Personal gallery (paginated, owner-scoped via RLS) with delete/manage controls
- Immediate score display, Speed Run mode with a fixed documented scoring formula
- Leaderboard (all-time + UTC-anchored daily) with the player's own rank always visible even off-screen
- Fixed set of ~6 achievements with visible unlock feedback
- Public, no-login-required share link with download + OS share sheet (feature-detected fallback)
- Server-rendered Open Graph preview tags on share pages (client SPA rendering alone will not work for social crawlers)

**Should have (competitive):**
- The gesture-controlled core loop itself is the actual differentiator — protect it, don't regress it
- Composite Speed Run scoring (time + moves + accuracy) rather than a naive stopwatch, to resist gaming and create a more interesting leaderboard
- A designed, branded share page ("memory" artifact) rather than a bare image dump — turns every share into organic marketing

**Defer (v2+):**
- Daily Challenge mode (distinct from the in-scope daily leaderboard view) — needs scheduled backend infra
- Public discovery/explore feed — real privacy risk given face-photo content; only ever opt-in, never default-public
- Party/multiplayer mode, AI photo tagging/face search — explicitly out of scope per PROJECT.md, correctly so

### Architecture Approach

The system is a client-only Vite SPA with two cleanly separated halves: a framework-agnostic `src/game/` engine (ported almost verbatim from `app.js`, zero React imports, owns the rAF loop and all per-frame mutable state) mounted through exactly one `GameCanvasHost` bridge component, and a standard React Router + Supabase product shell (auth, gallery, leaderboard, profile, share pages) that never touches the canvas directly. The two communicate one-way through a Zustand vanilla store carrying only coarse, UI-relevant transitions (`appState`, `countdown`, `score`, `lastPhoto`) — never per-frame landmark or drag data. All Supabase access is centralized in a typed `src/lib/supabase/*` layer so RLS-dependent query shapes are reviewable in one place and reusable by a future mobile app on the same backend.

**Major components:**
1. `src/game/` engine modules (capture, hand tracking, puzzle, shatter, audio, recorder) — plain TypeScript, unit-testable, owns the performance-critical loop
2. `GameCanvasHost` + `gameStore` (Zustand vanilla) — the single audited bridge between imperative engine and declarative React UI
3. `src/lib/supabase/*` typed data layer — the only code that calls `supabase.from(...)`, enforcing RLS-aware, reviewable access patterns for gallery, scores, achievements, leaderboard, and shares
4. React Router shell + pages — thin, route-level composition of the data layer and presentational components, with `/game` code-split via `React.lazy()` so the MediaPipe bundle never loads on other routes

### Critical Pitfalls

1. **rAF loop driven by React state causes re-render thrashing or stale closures** — keep all per-frame mutable state in refs/plain controller objects, never `useState`; only publish infrequent, human-timescale transitions to the store. This is the single highest-priority risk given the "must feel exactly as good as the prototype" requirement.
2. **React Strict Mode double-invoke breaks camera/MediaPipe/rAF initialization** — every resource-acquiring effect must have a real, idempotent cleanup (stop `MediaStream` tracks, `handLandmarker.close()`, `cancelAnimationFrame`); verify with Strict Mode ON, not disabled.
3. **Over-permissive or contradictory RLS policies leak private gallery data (or silently break public pages)** — enable RLS at table-creation time, model shareability as an explicit column/table rather than inferring it, never grant broad `anon` SELECT on tables holding private fields; write RLS as row-level, not table-level, decisions.
4. **Client-reported Speed Run scores are trivially fakeable** — do not allow direct client `INSERT` of final score values; route submission through a session-start/session-submit RPC pair that computes elapsed time server-side and bounds-checks moves, designed before the leaderboard UI is built (retrofitting after real scores exist requires a leaderboard reset).
5. **Guest-mode data migration loses data or crashes on the "returning user already has an account" conflict** — use Supabase Anonymous Auth (not local-only state) for durable guest identity, and explicitly handle the identity-already-linked error case rather than letting it surface as a raw failure.

## Implications for Roadmap

Based on research, suggested phase structure (adapted from ARCHITECTURE.md's "Suggested Build Order," cross-checked against FEATURES.md dependencies and PITFALLS.md phase mapping):

### Phase 1: App Shell & Deployment Pipeline
**Rationale:** Cheapest phase to get wrong; proves the Vercel/Vite/SPA-routing pipeline (including the required `vercel.json` rewrite) before any real feature work lands on top of it.
**Delivers:** Vite + React + TS + React Router shell deployed to Vercel, placeholder pages for every route, no game logic yet.
**Addresses:** Foundational — unblocks every later phase.
**Avoids:** Discovering a routing/build/env-var misconfiguration only after the app is feature-complete.

### Phase 2: Game Engine Port (parallelizable with Phase 3)
**Rationale:** Highest-risk, highest-priority phase — must be validated as behavior-identical and performance-identical to the prototype before any backend feature depends on its output shape (what a "captured photo" object looks like).
**Delivers:** `src/game/` framework-agnostic engine + single `GameCanvasHost` bridge + `gameStore`, with known prototype bugs (hand-identity flip, uncancelled displacement animations) explicitly fixed during the port, not carried forward.
**Addresses:** Core Value requirement — gesture capture → puzzle → polaroid loop.
**Avoids:** Pitfalls 1, 2, 3, 8 (re-render thrashing, Strict Mode double-init, HandLandmarker recreation, carried-forward bugs).

### Phase 3: Supabase Schema & RLS (parallelizable with Phase 2)
**Rationale:** Fully independent of the engine; doing it early and correctly avoids the "RLS retrofitted after frontend works" trap.
**Delivers:** `profiles`, `photos`, `game_sessions`, `achievements`, `user_achievements`, `shares` tables with RLS on every table from creation, Storage bucket(s), `leaderboard_alltime`/`leaderboard_daily` views, generated TS types.
**Addresses:** Backend foundation for gallery, scoring, achievements, sharing.
**Avoids:** Pitfall 4 (over/under-permissive RLS) — designed and tested before any UI depends on it.

### Phase 4: Auth & Guest Mode
**Rationale:** Depends on Phase 3's schema but not on the engine; unlocks every auth-gated feature downstream.
**Delivers:** `AuthProvider`, email/password + Google OAuth sign-in, Supabase Anonymous Auth for guest mode, identity-linking upgrade flow (including the "existing account" conflict case), route guards.
**Addresses:** Guest play, account-required-to-save, seamless guest→account carryover (FEATURES.md P1 items).
**Avoids:** Pitfall 7 (guest migration data loss/conflict) — conflict path explicitly designed and tested here, not discovered post-launch.

### Phase 5: Capture → Save Integration (Results Flow)
**Rationale:** The first true vertical-slice integration point — engine output (Phase 2) + Storage/DB (Phase 3) + auth gating (Phase 4) all meet here; validates the whole pipeline end-to-end before building read-heavy pages on top of it.
**Delivers:** Results page, photo upload to Storage, `photos`/`game_sessions` row writes, upload-failure cleanup handling.
**Addresses:** Personal gallery's data source; the moment gameplay output crosses into the backend.
**Uses:** Zustand store (`lastPhoto`) + `lib/supabase/*` data layer.

### Phase 6: Gallery & Profile
**Rationale:** Read-only pages that depend on Phase 5 having produced real saved-photo rows; no new architectural risk.
**Delivers:** Paginated personal gallery, delete/manage controls, profile page.
**Addresses:** FEATURES.md P1 gallery requirements.
**Implements:** `lib/supabase/*` read paths, RLS owner-scoping from Phase 3.

### Phase 7: Scoring, Speed Run & Leaderboard
**Rationale:** Extends the Phase 5 write path; must not be built as a naive client-INSERT leaderboard given the anti-cheat requirement.
**Delivers:** Session-start/session-submit RPC pair with server-side elapsed-time computation and bounds checks, Speed Run composite scoring formula, all-time + daily (UTC-anchored) leaderboard views with self-rank visibility, achievement unlock evaluation (server-side, not purely client-side).
**Addresses:** FEATURES.md P1 scoring/leaderboard/achievement requirements.
**Avoids:** Pitfall 6 (fakeable client scores) — designed before the leaderboard UI is built, per explicit PITFALLS.md guidance that retrofitting requires a leaderboard reset.

### Phase 8: Public Sharing
**Rationale:** Depends on the `shares` table (Phase 3) and real saved photos (Phase 5/6); most tolerant of shipping slightly later since it doesn't block the core loop.
**Delivers:** Revocable public share links via unguessable slug, narrow public-only data query (never `select *` on the private table), server-rendered/edge-function-injected Open Graph tags, download + Web Share API with fallback.
**Addresses:** FEATURES.md P1 sharing requirements.
**Avoids:** Pitfall 5 (share pages leaking private fields) — dedicated narrow view/RPC, `noindex` by default given face-photo content.

### Phase 9: Deployment Hardening
**Rationale:** Final pass once all features exist — cross-cutting concerns are cheaper to audit once, at the end, than to re-verify per-phase.
**Delivers:** RLS policy audit across all tables (grep for `using (true)`), image compression before upload, Vercel production env var/build settings review, performance pass on the game loop under real device/network conditions.
**Addresses:** Production-readiness requirement ("complete, production-ready, deployable Web MVP").
**Avoids:** All Security Mistakes and Performance Traps tables from PITFALLS.md, applied as a final systematic check rather than trusting per-phase vigilance alone.

### Phase Ordering Rationale

- Engine port (Phase 2) and Supabase schema (Phase 3) are deliberately parallelizable — they share no code and the ARCHITECTURE.md build order explicitly calls this out, which shortens the critical path.
- Auth (Phase 4) must precede the Save flow (Phase 5) because save-gating logic depends on knowing whether a session exists; but Auth itself only needs the schema (Phase 3), not the engine.
- Anti-cheat score validation (Phase 7) is deliberately positioned as "design before UI," per PITFALLS.md's explicit warning that retrofitting after a public leaderboard exists requires a reset and damages trust — this is a hard ordering constraint, not a preference.
- Sharing (Phase 8) is last among features because FEATURES.md and ARCHITECTURE.md both independently conclude it's the most tolerant of shipping later without blocking the core loop, and it has a unique cross-cutting requirement (SSR/OG tags) worth isolating in its own phase rather than bundling into gallery work.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 7 (Scoring/Leaderboard):** The session-start/session-submit RPC anti-cheat pattern is a synthesized recommendation (MEDIUM confidence per PITFALLS.md), not a single canonical documented pattern — worth a focused `--research-phase` pass on Postgres `security definer` RPC design and rate-limiting specifics before implementation.
- **Phase 8 (Public Sharing):** The Open Graph/SSR requirement is architecturally the one feature that doesn't fit "just another React route" — needs research into the specific Vercel Edge Function or prerender approach compatible with a Vite SPA (not just Next.js-style solutions) before implementation.
- **Phase 2 (Game Engine Port):** MediaPipe npm migration (CDN → `@mediapipe/tasks-vision@1.0.1`) is flagged MEDIUM confidence on "no breaking API changes vs 0.10.x" — treat as a controlled upgrade requiring a smoke test, not a blind bump; may warrant a quick research check if issues surface.

Phases with standard patterns (skip research-phase):
- **Phase 1 (App Shell/Deployment):** Well-documented Vercel + Vite SPA pattern, HIGH confidence sources.
- **Phase 3 (Supabase Schema/RLS):** Standard, officially-documented Supabase RLS patterns, HIGH confidence.
- **Phase 4 (Auth/Guest Mode):** Supabase Anonymous Auth + identity linking is officially documented and HIGH confidence, though the "existing account conflict" UX flow should still get explicit design attention during planning.
- **Phase 6 (Gallery/Profile):** Standard read-heavy CRUD pages against the typed data layer, no novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified live against the npm registry and Context7 docs on 2026-09-09, not training data; a few forward-looking ecosystem claims (Vite 8/Rolldown speedup figures, MediaPipe 1.0.x API stability vs 0.10.x) are individually flagged MEDIUM |
| Features | MEDIUM-HIGH | Core patterns (guest→account, RLS-scoped sharing, UTC leaderboard resets) verified against official Supabase/PlayFab/Android docs (HIGH); some game-design specifics (scoring formula inspiration, achievement psychology) are industry-general single-source citations, not PinchPop-specific competitor data (MEDIUM-LOW) |
| Architecture | HIGH | React imperative-canvas pattern, Zustand transient-update pattern, Supabase Auth/Storage/RLS APIs, Vercel SPA rewrite requirement all confirmed against official docs/Context7; sharing-link and achievement-trigger specifics are synthesized recommendations (MEDIUM) rather than single documented "correct" patterns |
| Pitfalls | HIGH (React/Supabase mechanics) / MEDIUM (anti-cheat and MediaPipe-in-React specifics) | React Strict Mode and RLS mechanics verified via official React repo issues and Supabase docs; the anti-cheat RPC pattern and MediaPipe-in-React cleanup pattern are corroborated across multiple independent community sources but have no single canonical doc |

**Overall confidence:** HIGH

### Gaps to Address

- **MediaPipe 1.0.x vs 0.10.x API compatibility:** No official changelog found confirming zero breaking changes for the JS package specifically — Phase 2 should include an explicit smoke test of `FilesetResolver.forVisionTasks()` and `HandLandmarker.createFromOptions()` before committing to the port.
- **Open Graph/SSR mechanism for a Vite SPA on Vercel:** ARCHITECTURE.md and FEATURES.md both flag this as needing a concrete implementation decision (prerender step vs. Edge Function vs. static-generation-per-slug) that wasn't resolved to a single recommendation during research — needs a `--research-phase` pass at Phase 8 planning.
- **Anti-cheat RPC design specifics:** The session-start/session-submit pattern is directionally clear and right-sized for this project's scale (per PITFALLS.md's explicit scoping to "stop devtools cheating, not a scripted headless player"), but exact Postgres function signatures, plausibility-bound thresholds, and rate-limiting configuration need design work during Phase 7 planning, not assumed from research alone.
- **Guest anonymous-account lifecycle policy:** Supabase does not auto-delete abandoned anonymous users; PITFALLS.md flags this as needing an explicit cleanup policy decision (e.g., scheduled deletion after N days) that research did not resolve to a specific number — a product/ops decision needed during Phase 4 planning.

## Sources

### Primary (HIGH confidence)
- Context7 `/pmndrs/zustand` — vanilla store API, transient-update pattern, external-store-outside-React usage
- Context7 `/supabase/supabase`, `/websites/supabase`, `/supabase/auth` — RLS policy patterns, anonymous sign-in/identity linking, Storage signed URLs, `onAuthStateChange`
- `npm view <pkg> version/versions/peerDependencies` live registry queries (run 2026-09-09) — exact current versions and compatibility for the full core/supporting stack
- React GitHub issue #24455 — official Strict Mode double-invoke behavior
- `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONCERNS.md` — primary source for existing prototype behavior, known bugs, and locked requirements

### Secondary (MEDIUM confidence)
- WebSearch coverage of TypeScript 7.0 GA and Vite 8/Rolldown release notes (InfoQ, Visual Studio Magazine, vite.dev blog)
- Vercel community threads on SPA rewrite requirements, cross-referenced against Vercel's own docs
- Community write-ups on MediaPipe-in-React integration and Canvas/rAF-in-React patterns (dev.to, Medium) — cross-checked against official React Strict Mode behavior
- AccelByte anti-cheat industry pattern, applied and scoped down for this project's size
- Baymard-cited guest-checkout research (via secondary blog citation), PlayFab/Android Play Games daily-reset documentation

### Tertiary (LOW confidence)
- Lichess Puzzle Storm and POST VOID community scoring discussions — illustrative examples for composite scoring design, not authoritative
- Yu-kai Chou gamification badge guidance — single-author industry source, needs validation against actual user behavior post-launch

---
*Research completed: 2026-09-09*
*Ready for roadmap: yes*
