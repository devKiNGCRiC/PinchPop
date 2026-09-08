# Architecture Research

**Domain:** Gesture-controlled browser game (real-time Canvas/MediaPipe) embedded in a routed React data app (accounts, gallery, leaderboard, sharing) on Supabase + Vercel
**Researched:** 2026-09-09
**Confidence:** HIGH (React imperative-canvas pattern, Zustand transient-update pattern, Supabase Auth/Storage/RLS APIs, Vercel SPA rewrite requirement — all confirmed against official docs/Context7) / MEDIUM (specific sharing-link and achievement-trigger design — synthesized recommendation, not a single documented "correct" pattern)

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                          Browser Runtime (Vercel SPA)                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     React Router Shell (declarative)                  │  │
│  │  Landing │ Auth │ Game │ Results │ Gallery │ Profile │ Leaderboard   │  │
│  │                          │ Share/:slug (public)                       │  │
│  └───────────────┬────────────────────────────┬─────────────────────────┘  │
│                  │ mounts only on /game        │ reads/writes              │
│                  ▼                              ▼                          │
│  ┌───────────────────────────┐   ┌─────────────────────────────────────┐  │
│  │   GameCanvasHost (bridge)  │   │        Data Layer (src/lib/*)        │  │
│  │  useRef<canvas/video>      │   │  authClient, galleryApi, scoresApi,  │  │
│  │  useEffect(() => {         │   │  achievementsApi, leaderboardApi,    │  │
│  │    engine = new GameEngine │   │  storageApi — thin typed wrappers    │  │
│  │    engine.start()          │   │  around supabase-js                 │  │
│  │  }, [])                    │   └───────────────┬─────────────────────┘  │
│  └───────────────┬─────────────────────────────────┼────────────────────┘  │
│                  │ imperative, owns refs            │                      │
│                  ▼                                  │                      │
│  ┌────────────────────────────────────────────────┐ │                      │
│  │         src/game/ — framework-agnostic engine     │ │                      │
│  │  ┌─────────┐┌─────────┐┌─────────┐┌───────────┐│ │                      │
│  │  │ Capture ││ Gesture ││ Puzzle  ││ Shatter/  ││ │                      │
│  │  │Pipeline ││Detection││ Engine  ││ Audio/Rec ││ │                      │
│  │  └────┬────┘└────┬────┘└────┬────┘└─────┬─────┘│ │                      │
│  │       └──────────┴───────────┴───────────┘      │ │                      │
│  │              GameEngine.renderLoop() (rAF)       │ │                      │
│  └───────────────────┬───────────────────────────────┘ │                      │
│                       │ publishes                       │                      │
│                       ▼                                 │                      │
│  ┌────────────────────────────────┐                     │                      │
│  │  gameStore (zustand vanilla)    │◄────────────────────┘ (session/auth store  │
│  │  transient: state, countdown,   │   normal React reactivity is fine —        │
│  │  score; HUD subscribes w/       │   low-frequency updates)                   │
│  │  selectors, not full re-render  │                                             │
│  └────────────────────────────────┘                                             │
└───────────────────────────┬──────────────────────────────────────────────────┘
                             │ HTTPS (auth, REST/RPC, Storage)
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                Supabase                                    │
│  Auth (email/pw, Google OAuth, guest = no session)                        │
│  Postgres: profiles, photos, game_sessions, achievements,                 │
│            user_achievements, shares  (+ RLS on every table)              │
│  Storage: photos bucket (private, owner-scoped RLS)                       │
│  Views: leaderboard_alltime, leaderboard_daily                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| React Router shell | URL → page mapping, auth-gated routes, lazy-loads heavy pages | `react-router` (v6/v7 declarative mode — no need for full "framework mode" data routers for an app this size) with `React.lazy()` on `/game` so MediaPipe's WASM/model never loads on the landing page |
| `GameCanvasHost` (bridge component) | The **only** place React and the imperative engine touch. Owns the `<video>`/`<canvas>` refs, instantiates `GameEngine` once, renders a thin HUD driven by store selectors | `useEffect(() => { const engine = new GameEngine(refs, cfg); engine.start(); return () => engine.destroy(); }, [])` with an empty dependency array; **must** guard against React 18 StrictMode's dev-mode double-invoke of effects (mount→cleanup→mount) so webcam/model init isn't requested twice |
| `src/game/` engine modules | Ported, framework-agnostic port of `app.js` subsystems (capture, gesture math, puzzle, shatter, audio, recorder) — same logic, now typed and split into files, but still operating directly on canvas/video via passed-in refs, not React state | Plain TS classes/functions, zero React imports, unit-testable in isolation for the first time |
| `gameStore` (Zustand vanilla store) | The one-way bridge from imperative engine → declarative UI. Engine calls `gameStore.setState(...)` on state transitions (tracking→countdown→puzzle→shattering), score changes, capture completion | Created with `zustand/vanilla` or `create()`; HUD components subscribe with narrow selectors (`useGameStore(s => s.countdown)`) so a per-frame landmark update never re-renders unrelated React trees |
| `src/lib/supabase/` data layer | Typed, RLS-aware query functions per domain — nothing outside this layer calls `supabase.from(...)` directly | `createClient()` once, `Database` types generated via `supabase gen types typescript`, one file per domain (`gallery.ts`, `scores.ts`, `achievements.ts`, `leaderboard.ts`, `storage.ts`) |
| `AuthProvider` / `useAuth()` | Session state, `onAuthStateChange` subscription, exposes `session`, `isGuest`, `signIn`, `signOut` to the whole route tree | React Context wrapping a `supabase.auth.onAuthStateChange` listener, unsubscribed on unmount |
| Pages (`src/pages/`) | Route-level screens; each composes data-layer calls + presentational components; only `Game.tsx` mounts `GameCanvasHost` | Function components, data fetched via the typed API layer, not raw Supabase calls |
| Supabase Postgres | Source of truth for accounts, saved photos metadata, sessions/scores, achievements, share links; enforces per-row ownership via RLS | Tables + RLS policies + 2 read-only leaderboard views |
| Supabase Storage | Binary photo assets (polaroid PNGs, optional WebM recordings) | Private bucket, path-namespaced by `user_id`, owner-only RLS by default |

## Recommended Project Structure

```
src/
├── game/                        # Framework-agnostic engine (ported from app.js)
│   ├── GameEngine.ts             # Orchestrator: owns appState, renderLoop, exposes start()/stop()/destroy()
│   ├── capture.ts                # Webcam bootstrap, photobooth filter, frame slicing
│   ├── handTracking.ts           # MediaPipe init (GPU→CPU fallback, timeout), gesture math (pinch/fist)
│   ├── puzzle.ts                 # Tile model, drag/snap/displace, solve detection
│   ├── shatter.ts                # Fragment physics animation
│   ├── audio.ts                  # Web Audio procedural SFX
│   ├── recorder.ts               # MediaRecorder canvas capture
│   └── types.ts                  # Shared engine types (AppState, PuzzlePiece, GestureFrame, etc.)
├── store/
│   ├── gameStore.ts               # Zustand vanilla store — engine→UI bridge (transient updates)
│   └── authStore.ts               # (or Context) — low-frequency, normal React reactivity is fine
├── components/
│   ├── game/
│   │   ├── GameCanvasHost.tsx      # THE bridge component (imperative mount of GameEngine)
│   │   └── GameHud.tsx             # Countdown/score overlay, subscribes via selectors
│   ├── gallery/, leaderboard/, profile/, share/   # Presentational, data-driven components
│   └── ui/                        # Buttons, modals, polaroid card, etc. (dumb, reusable)
├── pages/
│   ├── Landing.tsx, Game.tsx, Results.tsx, Gallery.tsx,
│   ├── Profile.tsx, Leaderboard.tsx, Share.tsx (public), Auth.tsx
├── lib/
│   └── supabase/
│       ├── client.ts               # createClient() singleton
│       ├── database.types.ts       # Generated via `supabase gen types typescript`
│       ├── gallery.ts, scores.ts, achievements.ts, leaderboard.ts, storage.ts, shares.ts
├── routes/
│   └── router.tsx                  # react-router route tree, lazy(() => import('../pages/Game'))
├── hooks/
│   └── useAuth.ts, useGameStore selectors, useLeaderboard.ts (fetch + cache)
└── App.tsx
```

### Structure Rationale

- **`src/game/` has zero React imports:** this is the single most important structural rule. It is the direct successor to `app.js`'s subsystems, and keeping it framework-agnostic (a) makes the port a mechanical, low-risk refactor (extract functions into files, add types, pass state explicitly instead of module globals — per the existing codebase's own documented anti-pattern fix), (b) makes it unit-testable for the first time, (c) guarantees React's reconciler never becomes a bottleneck for a 30-60fps loop.
- **Exactly one bridge component (`GameCanvasHost`):** every other React component talks to the game only through `gameStore`, never through refs or direct engine calls. This keeps the React/imperative boundary auditable — if performance regresses, there is one file to check.
- **`store/` split by update frequency:** `gameStore` is written by the engine dozens of times per second and must be consumed via narrow Zustand selectors (or `subscribe()` + manual DOM/canvas text updates for the HUD, bypassing React entirely for the highest-frequency fields like a live countdown ring). `authStore`/session state changes rarely, so ordinary Context + `useState` reactivity is fine there — don't over-engineer session state with the same transient-update pattern.
- **`lib/supabase/` centralizes all backend I/O:** no component or page calls `supabase.from(...)` directly. This is what makes RLS-driven access patterns (owner-only gallery, public share reads, leaderboard views) reviewable in one place, and is exactly what the mobile companion app (future milestone, same backend) will need to reuse or mirror.
- **Pages are route-level, thin:** `pages/` composes `lib/supabase/*` + `components/*`; only `Game.tsx` ever imports `GameCanvasHost`, so the MediaPipe/game bundle can be code-split behind `React.lazy()` and never loads on `/`, `/gallery`, `/profile`, etc.

## Architectural Patterns

### Pattern 1: Imperative engine, declarative shell (React "escape hatch" via refs + effect)

**What:** The real-time game (rAF loop, canvas drawing, per-frame MediaPipe inference) is instantiated once in a `useEffect` with an empty dependency array and torn down on unmount. It never stores its per-frame state in `useState`/props — doing so would force a React re-render every animation frame (up to 60/sec), which the existing prototype's architecture doesn't do today and shouldn't be introduced now.
**When to use:** Any subsystem whose update frequency (video/canvas/WebGL/audio) is fundamentally incompatible with React's render cycle.
**Trade-offs:** You give up React DevTools visibility into engine internals and must manually manage cleanup (cancel `requestAnimationFrame`, close `MediaRecorder`, stop the `MediaStream`, and release the `HandLandmarker` on unmount) — the existing prototype's `boot()`/cleanup logic must be ported carefully since there was previously no unmount case to handle (a static page never "unmounts").

**Example:**
```typescript
// src/components/game/GameCanvasHost.tsx
function GameCanvasHost() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const engine = new GameEngine({ video: videoRef.current!, canvas: canvasRef.current! });
    engine.start(); // begins webcam init -> model load -> renderLoop
    return () => engine.destroy(); // cancels rAF, stops stream, closes recorder
  }, []); // never re-run — StrictMode will still double-invoke in dev, engine.destroy() must be idempotent-safe

  return (
    <>
      <video ref={videoRef} className="sr-only" />
      <canvas ref={canvasRef} />
      <GameHud /> {/* reads gameStore via selectors, not props from here */}
    </>
  );
}
```

### Pattern 2: Transient store as the engine↔UI bridge (Zustand outside React)

**What:** The engine calls `gameStore.setState({...})` directly (no hooks, since it runs outside any component) whenever something UI-relevant happens: `appState` transitions, countdown tick, puzzle solved, final photo blob ready. React components subscribe with `useGameStore(selector)` so only the fields they read cause a re-render; a handful of very-high-frequency values (e.g., a live hand-skeleton debug overlay, if kept) should use `store.subscribe()` inside a `useEffect` and mutate the DOM/canvas text directly, bypassing React re-renders altogether — Zustand's own docs recommend this "transient update" pattern specifically for high-frequency changes.
**When to use:** Any time non-React code needs to hand data to React without going through props/context, especially at frame-rate frequency.
**Trade-offs:** Slightly more boilerplate than lifting state into `useState`; the payoff is that the HUD's countdown/score/status text can update at 60fps without triggering React reconciliation on the surrounding page.

**Example:**
```typescript
// src/store/gameStore.ts
export const gameStore = createStore<GameStoreState>()((set) => ({
  appState: 'tracking', countdown: 0, score: 0, lastPhoto: null,
}));
export const useGameStore = <T,>(selector: (s: GameStoreState) => T) =>
  useStore(gameStore, selector);

// inside GameEngine (no React import)
this.startCountdown = () => {
  gameStore.setState({ appState: 'countdown', countdown: 3 });
};
```

### Pattern 3: Layered Supabase data access with RLS as the security boundary, not the UI boundary

**What:** Every table (`profiles`, `photos`, `game_sessions`, `user_achievements`, `shares`) has RLS enabled with owner-scoped policies (`auth.uid() = user_id`). Public surfaces (leaderboard, share pages) are separate read paths — either a dedicated view with a permissive `SELECT` policy, or a `shares` table with an explicit "make public" row, rather than loosening RLS on the private tables themselves.
**When to use:** Any Supabase app mixing private user data with intentionally public views of a subset of that data (exactly this project's gallery-vs-share and personal-vs-leaderboard split).
**Trade-offs:** More tables/policies to write up front vs. a single loosely-scoped table, but it means a bug in the Share page's UI code can never leak a user's full private gallery — the database enforces the boundary regardless of what the client sends.

**Example:**
```sql
-- photos: private by default
alter table photos enable row level security;
create policy "owner can select own photos" on photos
  for select using (auth.uid() = user_id);

-- shares: explicit opt-in public exposure, one row per shared photo
create table shares (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- unguessable short id used in /share/:slug
  photo_id uuid references photos(id) not null,
  created_at timestamptz default now()
);
alter table shares enable row level security;
create policy "anyone can read a share by slug" on shares
  for select using (true);

-- leaderboard: read-only aggregated view, safe to expose broadly
create view leaderboard_alltime as
  select user_id, max(score) as best_score
  from game_sessions group by user_id order by best_score desc;
```

## Data Flow

### Request Flow — Capture → Save (the critical integration point)

```
[User completes puzzle in GameCanvasHost]
    ↓ engine calls gameStore.setState({ lastPhoto: blob, score, moves, durationMs })
[Results page reads gameStore.lastPhoto via selector]
    ↓ user clicks "Save" (only shown if session exists; guest sees "Sign up to save")
[storageApi.uploadPhoto(userId, blob)] → Supabase Storage: photos/{user_id}/{uuid}.png
    ↓ on success, returns storage path
[galleryApi.insertPhoto({ path, userId })] → Postgres `photos` row
    ↓
[scoresApi.insertSession({ userId, score, moves, durationMs, mode })] → `game_sessions` row
    ↓ (Postgres trigger on insert, or a follow-up client call)
[achievements check] → inserts into `user_achievements` if a fixed condition is newly met
    ↓
[Results page shows saved confirmation + any newly unlocked achievement]
```

If the Storage upload succeeds but the subsequent `photos` insert fails, the client must delete the just-uploaded object (or accept it as an orphan cleaned up later) — there is no cross-service transaction between Storage and Postgres, so this ordering (upload → insert → cleanup-on-failure) needs to be explicit in `galleryApi`.

### Request Flow — Public Share

```
[Gallery/Results: user clicks "Share"]
    ↓ sharesApi.createShare(photoId) → inserts `shares` row, returns slug
[Client navigates to /share/:slug or copies link / triggers OS share sheet]
    ↓ (no auth required to view)
[Share.tsx page] → sharesApi.getBySlug(slug) → RLS-permitted anon SELECT on `shares` + joined `photos` row
    ↓
[Photo rendered from Storage] — recommend either (a) a signed URL generated at share-creation time and
stored on the `shares` row with a long expiry, refreshed lazily if expired, or (b) copying the shared
object into a separate public-read bucket at share time, keeping the primary `photos` bucket private.
Option (b) is simpler to reason about for MVP: the private bucket's RLS never needs to special-case
"shared" objects, and public bucket exposure is opt-in per-object, not per-policy.
```

### State Management

```
[GameEngine (imperative)]
    ↓ setState() (no hooks, runs outside React)
[gameStore (Zustand vanilla)]
    ↓ subscribe (selector) — most components         ↓ subscribe (raw) — highest-frequency HUD bits
[React components re-render on selected slice only]  [Direct DOM/canvas text mutation, no re-render]

[Supabase session]
    ↓ onAuthStateChange
[AuthProvider / authStore] — normal React state, low frequency
    ↓ useAuth()
[Route guards, Save/Gallery/Profile pages]
```

### Key Data Flows

1. **Gesture/capture loop (client-only, no network):** webcam → MediaPipe `detectForVideo()` → gesture math → canvas draw, entirely inside `src/game/`, never touches Supabase. This is the performance-critical path the prototype already validated; the port must not introduce any async/network call into this loop.
2. **Save/persist (client → Supabase, auth-gated):** described above — the only place gameplay output crosses into the backend, and only when the user has a session.
3. **Read-heavy pages (Supabase → client):** Gallery, Profile, Leaderboard, Share are standard fetch-on-mount (or React Query/SWR-style) reads through the typed `lib/supabase/*` layer; none of these pages touch `src/game/` at all.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|---------------------------|
| 0-1k users | Current design as-is: client-computed achievement checks, direct Storage uploads, unindexed `game_sessions` table, `leaderboard_alltime` as a plain view. Fine at this scale. |
| 1k-100k users | Add indexes on `game_sessions(user_id, score)` and `game_sessions(created_at)` for the daily leaderboard; move achievement evaluation into a Postgres trigger/function (avoids relying on the client to always run the check, closes an easy exploit); resize/compress polaroid images client-side before upload to control Storage egress costs; consider a materialized view refreshed on a schedule for `leaderboard_daily` instead of a live view if it gets expensive. |
| 100k+ users | Move leaderboard aggregation and achievement evaluation fully server-side (Supabase Edge Functions or scheduled jobs) rather than per-request views; add a CDN/cache layer in front of public share pages and their images (Vercel's edge network + Supabase Storage's CDN already cover most of this); evaluate whether `shares` need rate-limiting to prevent abuse of the public, unauthenticated read path. |

### Scaling Priorities

1. **First bottleneck:** Storage cost/bandwidth from unoptimized full-resolution polaroid PNGs — resize/compress on the client before upload from day one; cheap to add early, expensive to retrofit once users have thousands of saved photos.
2. **Second bottleneck:** Leaderboard query cost as `game_sessions` grows — add the indexes above before this becomes visible; the daily view is the one most likely to get slow first since it filters by a rolling date window.

## Anti-Patterns

### Anti-Pattern 1: Driving the render loop with React state

**What people do:** Store `appState`, hand landmarks, or puzzle piece positions in `useState` and let a `useEffect`-driven `requestAnimationFrame` call `setState` every frame to "keep React in sync."
**Why it's wrong:** Forces a full component re-render up to 60 times/sec, fights React's batching/scheduling, and reintroduces exactly the performance risk this migration is explicitly required not to regress on (`PROJECT.md`: "must feel exactly as good... as the prototype today").
**Do this instead:** Keep all per-frame state in the engine (plain objects/refs, not React state) and only publish UI-relevant, low-frequency transitions to `gameStore`, consumed via narrow selectors or `subscribe()`.

### Anti-Pattern 2: Re-initializing MediaPipe / re-requesting the webcam on every render or on StrictMode's double effect

**What people do:** Put `HandLandmarker` creation or `getUserMedia()` directly in the component body, or don't guard the `useEffect` cleanup against React 18 StrictMode's dev-mode mount→unmount→mount cycle, resulting in two concurrent webcam streams or two model loads racing each other.
**Why it's wrong:** Wastes GPU/CPU, can leave a dangling `MediaStream` track running (browser shows the camera indicator as active after the component "settles"), and is a common, well-documented React 18 pitfall for any effect that acquires an external resource.
**Do this instead:** Instantiate the engine (which owns webcam + model init) inside `useEffect(() => { ...; return () => engine.destroy() }, [])`, and make `engine.destroy()` fully idempotent and synchronous-safe so StrictMode's extra mount/unmount cycle in development doesn't leave orphaned resources.

### Anti-Pattern 3: Loosening table-level RLS to make the Share feature "just work"

**What people do:** Make the `photos` table (or bucket) fully public-readable so the share link and leaderboard queries are simpler to write.
**Why it's wrong:** Directly exposes every user's private gallery, not just the photos they explicitly chose to share — a bug or oversight in a totally unrelated feature (or just an enumerable primary key) becomes a privacy leak.
**Do this instead:** Keep `photos`/Storage owner-scoped by RLS; expose sharing through a separate, explicit-opt-in `shares` table/row (Pattern 3 above) and leaderboard through a dedicated read-only view, never by relaxing the base table's policy.

### Anti-Pattern 4: Calling `supabase.*` directly from page/component code

**What people do:** Scatter `supabase.from('photos').select()` calls inside individual page components as the app grows.
**Why it's wrong:** Makes RLS-dependent query shapes (owner filters, joins for share pages, leaderboard aggregation) hard to audit or change consistently, and duplicates logic the future mobile app (same backend, per `PROJECT.md`) will need to reimplement from scratch instead of reusing.
**Do this instead:** Route every Supabase call through `src/lib/supabase/*` typed functions; pages/components only call those.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| MediaPipe `@mediapipe/tasks-vision` | `FilesetResolver.forVisionTasks()` + `HandLandmarker.createFromOptions()`, GPU→CPU fallback, called once inside the engine's init, not per render | Install as an npm dependency (Vite-bundled) rather than the prototype's raw CDN `<script>`; the WASM binary and `.task` model asset can still be fetched from the same Google-hosted CDN at runtime, or self-hosted under `public/` to remove the external-CDN single point of failure the existing prototype's `ARCHITECTURE.md`/`PITFALLS` flags as a risk — decide during the STACK/Pitfalls phase, not here. |
| Supabase Auth | `supabase.auth.onAuthStateChange()` in a top-level `AuthProvider`; email/password + Google OAuth via `signInWithOAuth({ provider: 'google' })` | Guest mode is simplest implemented as "no session at all" (per `PROJECT.md`'s "account required only to save/persist") rather than Supabase's anonymous-auth feature — anonymous auth (`signInAnonymously()` + later `linkIdentity`/`updateUser` to convert) is a documented, supported upgrade path if guest score/session persistence across page reloads is later desired, but adds an identity-linking flow not required for MVP. |
| Supabase Storage | Private bucket, `upload()` from a `canvas.toBlob()`-derived `File`/`Blob`, path-namespaced `{user_id}/{uuid}.png`; `createSignedUrl()` for any private-read access; public share flow per Pattern 3 | Resize/compress before upload (see Scaling). |
| Supabase Postgres | RLS-enabled tables, generated TS types via `supabase gen types typescript` for end-to-end type safety from schema → `lib/supabase/*` → components | Schema must exist before any gallery/score/leaderboard UI can be built against real types — see Build Order below. |
| Vercel | Static SPA build (`vite build`) + `vercel.json` rewrite (`{"source":"/(.*)","destination":"/index.html"}`) so deep links (`/gallery`, `/share/:slug`) don't 404 on refresh | This is required, not optional, the moment client-side routing is introduced — confirmed via Vercel community docs; a Vite/React SPA without it will 404 on any non-root route on first load or refresh. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| `src/game/*` ↔ `GameCanvasHost` | Direct instantiation + refs (`new GameEngine({video, canvas})`) | One-directional: engine never imports React; host owns lifecycle. |
| `GameCanvasHost`/engine ↔ rest of React app | `gameStore` (Zustand vanilla store), one-directional writes from engine, selector reads elsewhere | No component reaches into the engine directly; no engine code imports a component. |
| Pages/components ↔ Supabase | `lib/supabase/*` typed functions only | Never `supabase.from(...)` inline in a page/component. |
| `AuthProvider` ↔ everything auth-gated | React Context (`useAuth()`), standard reactivity (not transient — auth changes are rare) | Route guards and Save/Gallery/Profile pages consume this, not `gameStore`. |

## Suggested Build Order

This is the dependency graph the roadmap should follow; items on the same line are parallelizable.

1. **Vite + React + TS + React Router shell, deployed to Vercel with the SPA rewrite in place.** No game logic yet — placeholder pages for every route. Do this first: it proves the deploy pipeline early and gives every subsequent piece a place to land, and it's the cheapest phase to get wrong (better to discover a Vercel routing/build issue on an empty shell than after the engine port).
2. *(parallelizable with 3)* **Port the game engine into `src/game/` + build the one `GameCanvasHost` bridge**, verified behavior-identical to the prototype (same gesture thresholds, same puzzle mechanics, same photobooth filter). This is the highest-risk phase — do it early, isolated, before any Supabase work depends on its output shape (what a "captured photo" object looks like: blob + score + moves + duration).
3. *(parallelizable with 2)* **Supabase project + schema**: `profiles`, `photos`, `game_sessions`, `achievements`, `user_achievements`, `shares` tables, RLS policies on all of them, Storage bucket(s), `leaderboard_alltime`/`leaderboard_daily` views, generated TS types. Doesn't depend on the engine at all — can be designed and stood up in parallel by a second thread of work.
4. **Auth** (`AuthProvider`, sign up/in, Google OAuth, guest = no session, route guards) — needs Supabase (step 3) but not the engine; unlocks every auth-gated feature after this point.
5. **Results/Save flow** — the first true integration point: engine output (2) + Storage/DB (3) + auth gating (4) all meet here. This is where the "capture → save" data flow above gets built and is the natural place to validate the whole vertical slice end-to-end before building out read-heavy pages.
6. **Gallery + Profile pages** — read from Supabase via `lib/supabase/*`, depend on step 5 having produced real saved-photo rows to display.
7. **Scoring depth (Speed Run mode) + Achievements + Leaderboard** — extends `game_sessions` writes from the engine/Results flow and adds the achievement-check step (trigger or client call) plus the leaderboard read pages; depends on 5 and the schema from 3.
8. **Public share pages** — depends on the `shares` table (3) and on real saved photos existing (5/6); last because it's the feature most tolerant of shipping slightly later without blocking the core loop.
9. **Deployment hardening** — RLS policy audit (confirm no table is more permissive than intended), image compression before upload, Vercel production env vars/build settings, performance pass on the game loop under real network/device conditions.

## Sources

- [Zustand README — transient updates and external state access](https://github.com/pmndrs/zustand/blob/main/README.md) — Context7 `/pmndrs/zustand`, HIGH confidence
- [Zustand `useShallow` docs](https://github.com/pmndrs/zustand/blob/main/README.md) — Context7, HIGH confidence
- [Supabase Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security) — Context7 `/websites/supabase`, HIGH confidence
- [Supabase Storage signed URLs reference](https://supabase.com/docs/reference/javascript/using-filters-gt) — Context7, HIGH confidence
- [Supabase Auth `onAuthStateChange` reference](https://supabase.com/docs/reference/javascript/analytics-buckets-deletebucket) — Context7, HIGH confidence
- [Supabase React auth tutorial pattern](https://supabase.com/docs/guides/getting-started/tutorials/with-react) — Context7, HIGH confidence
- [Supabase anonymous auth / identity linking guide](https://supabase.com/docs/guides/auth/auth-anonymous) — Context7, HIGH confidence (guide itself); MEDIUM confidence in applying it as *not needed* for this MVP's guest mode (project-specific judgment call)
- [Vercel rewrite requirement for Vite SPA client routing](https://community.vercel.com/t/rewrite-to-index-html-ignored-for-react-vite-spa-404-on-routes/8412) and [Vite on Vercel docs](https://vercel.com/docs/frameworks/frontend/vite) — MEDIUM confidence (community-sourced, but consistent across multiple independent threads and matches Vercel's own SPA-rewrite documentation pattern)
- [Building Snake in React — Canvas RAF loop, mutable refs to avoid stale closures](https://dev.to/shaishav_patel_271fdcd61a/building-snake-in-react-canvas-raf-loop-mutable-refs-to-avoid-stale-closures-and-wall-wrap-3gbg) — MEDIUM confidence (community source, but pattern matches React's own documented ref-vs-state guidance)
- [Integrating @mediapipe/tasks-vision for Hand Landmark Detection in React](https://dev.to/kiyo/integrating-mediapipetasks-vision-for-hand-landmark-detection-in-react-2lbg) — MEDIUM confidence (community source confirming standard `useEffect`/`useRef` init pattern, consistent with the existing prototype's own already-proven init sequence)
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md` — existing prototype analysis (this milestone's port target), HIGH confidence (primary source, already verified against the actual codebase)

---
*Architecture research for: React + TypeScript + Vite + Supabase gesture-controlled photobooth game migration*
*Researched: 2026-09-09*
