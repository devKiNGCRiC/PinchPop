# Stack Research

**Domain:** React + TypeScript + Vite web app migrating an imperative MediaPipe/Canvas game engine, adding Supabase-backed auth/social/scoring features, deployed to Vercel
**Researched:** 2026-09-09
**Confidence:** HIGH (versions verified live against the npm registry and Context7/official docs on 2026-09-09; a few forward-looking ecosystem calls are MEDIUM, flagged individually)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.8 | UI layer for all new product surfaces (auth, gallery, leaderboard, results) | Current stable major; matches PROJECT.md's decision. React 19's `useSyncExternalStore` (used internally by Zustand) is what makes cleanly bridging an external imperative engine into React state safe and tear-free — verified via Zustand docs (Context7 `/pmndrs/zustand`). |
| TypeScript | **5.9.3** (latest 5.x — do NOT use 7.x yet) | Static typing across the whole app, including the ported game engine | TypeScript 7.0 GA'd July 2026 as a from-scratch Go-native compiler ("tsgo") — real, but it ships **without a stable programmatic API** (expected in 7.1), so `typescript-eslint` cannot run on it yet. Verified directly: `npm view typescript-eslint peerDependencies` → `typescript: '>=4.8.4 <6.1.0'` (checked 2026-09-09, package `typescript-eslint@8.70.0`). Installing TS 7 today silently breaks ESLint type-aware linting. Pin `typescript@^5.9.3` until `typescript-eslint` publishes TS7 support. HIGH confidence — verified against live npm peer-dependency metadata, not training data. |
| Vite | 8.2.2 | Dev server + build tool | Current stable major. Vite 8 replaced the old esbuild(dev)/Rollup(build) split with **Rolldown**, a single Rust-based bundler, unifying dev and prod pipelines and cutting build times significantly (MEDIUM confidence on exact speedup figures — sourced from vite.dev blog and press coverage, not independently benchmarked). Directly relevant here: faster cold starts matter because this app already ships a heavy WASM payload (MediaPipe) — a fast dev loop while iterating on the engine wrapper is a real ergonomic win. |
| @vitejs/plugin-react | 6.1.1 | React Fast Refresh + JSX transform for Vite | v6 switched its transform from Babel to **Oxc** (Rust) and dropped Babel as a dependency — smaller install, faster HMR. Peer-verified compatible with `vite@^8.0.0` (`npm view @vitejs/plugin-react peerDependencies`). Use this over `@vitejs/plugin-react-swc` — with Vite 8's default plugin already Oxc-based, the old "SWC is faster than Babel" rationale for the swc variant no longer applies; there's no reason to add a second Rust toolchain (SWC) alongside Oxc/Rolldown. MEDIUM confidence (based on Vite 8 announcement + community write-ups, not independently benchmarked). |
| Zustand | 5.0.15 | Client state management — UI-facing state (auth session, current game/UI mode, gallery cache) AND the escape-hatch bridge from the imperative engine into React | Matches the "planned" choice already recorded in the prototype's README/PROJECT.md. Critically, Zustand stores are usable **outside React entirely** via `store.getState()` / `store.setState()` / `store.subscribe()` (verified via Context7 `/pmndrs/zustand` docs) — this is the exact mechanism needed to let the rAF/MediaPipe loop push state updates without going through React re-renders on every frame. See Architecture Note below. |
| @mediapipe/tasks-vision | **1.0.1** | Hand landmark detection (HandLandmarker) | The prototype currently imports this from a jsdelivr CDN URL at version `0.10.14`. As of 2026, the package has reached a stable **1.0.x** line (`1.0.1`, published ~3 weeks before this research, per `npm view @mediapipe/tasks-vision versions`) — install it as a real npm dependency instead of a CDN `<script>`/dynamic-import string. This gives you type declarations, lockfile-pinned reproducible builds, and Vite's dependency pre-bundling/asset handling for the `.wasm` files. Keep the model `.task` file loaded from Google's CDN at runtime (unchanged) OR self-host it in `public/` for offline resilience (see Pitfalls in ARCHITECTURE research). MEDIUM confidence on "1.0.x has no breaking API changes vs 0.10.x" — official changelog for the JS package specifically was not found; treat the migration as a controlled upgrade requiring a smoke test of `FilesetResolver.forVisionTasks()` and `HandLandmarker.createFromOptions()` signatures, not a blind bump. |
| @supabase/supabase-js | 2.116.0 | Auth (email/password + Google OAuth), Postgres queries, Storage | Official isomorphic client, current v2 line (verified live via `npm view @supabase/supabase-js version` and Context7 `/supabase/supabase-js`). Because this is a pure client-side Vite SPA (no SSR, no Next.js), use the **plain** `@supabase/supabase-js` client with `createClient()` and its default `localStorage`-backed session persistence — do **not** reach for `@supabase/ssr` (that package exists specifically for cookie-based session sync in SSR frameworks like Next.js/SvelteKit and is irrelevant/overkill here). |
| React Router | 7.18.3 (`react-router-dom` on npm) | Client-side routing: landing, game, results, profile, gallery, leaderboard, public share pages | Current stable major and the de facto standard for React SPA routing. v7's data APIs (loaders/actions) are optional — for this app, straightforward route components + Zustand/Supabase calls in effects/handlers is simpler than adopting the full data-router pattern, given the game route needs an escape hatch from React's render model anyway. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss + @tailwindcss/vite | 4.3.3 | Utility-first styling for all new product-layer UI (landing, auth forms, gallery, leaderboard, profile) | Fastest path to a "polished, responsive UI across the whole app" (explicit PROJECT.md requirement) without hand-rolling a design system. Use the official `@tailwindcss/vite` plugin (Tailwind v4's Vite-native integration, no PostCSS config file needed) rather than the old `postcss.config.js` + `tailwind.config.js` v3 setup. Keep the **existing hand-authored `css/styles.css`** design tokens (CSS custom properties) for the game screen itself — the puzzle/HUD/polaroid visuals are already tuned and canvas-adjacent; don't rip that out. Layer Tailwind for the new pages/chrome around it. |
| react-hook-form | 7.87.0 | Auth forms (sign up, sign in), profile edit form | Minimal re-renders, built-in validation wiring — standard choice for React forms in 2026. Only needed for the handful of real forms (auth, profile); game UI has no forms. |
| zod | 4.5.4 | Schema validation for form inputs and Supabase row shapes at the client boundary | Pairs with react-hook-form (`@hookform/resolvers`) for auth/profile forms; also useful to validate/parse rows coming back from Supabase (e.g., `game_sessions`, `achievements`) so a malformed row fails loudly instead of silently breaking the UI. |
| date-fns | 4.4.0 | Daily leaderboard bucketing (UTC day boundaries), relative timestamps ("2 days ago") in gallery/profile | Needed specifically because "Leaderboard — all-time and daily views" requires consistent day-boundary math; don't hand-roll `Date` arithmetic for this, it's a common source of off-by-one-day bugs across timezones. |
| @supabase/auth-ui-react | *(evaluate; not required)* | Pre-built auth form components | Optional — PROJECT.md wants a specific, polished, branded UI ("polished, responsive UI across the whole app"), and this project already needs custom Google OAuth + guest-mode flows. Recommend building auth forms by hand with react-hook-form + `supabase.auth.signInWithPassword` / `signInWithOAuth` rather than pulling in a pre-styled component library that will need heavy overriding anyway. Listed here only to explicitly rule it out — see "What NOT to Use". |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 10.10.0 + typescript-eslint 8.70.0 | Linting, TS-aware rules | Confirms the TypeScript 5.9.x pin above — `typescript-eslint@8.70.0`'s peer range (`>=4.8.4 <6.1.0`) is the hard constraint. Re-check this peer range before ever bumping to TS 7 later in the project's life. |
| Vitest | Unit/component testing | Not currently used (prototype has zero tests per STACK.md/TESTING.md), but it's the natural pairing with Vite (shares config/transform pipeline) if/when the roadmap adds test coverage for the puzzle engine's pure functions (snap-to-cell math, gesture thresholds) — these are the most valuable, cheapest things to unit test since they're pure math extracted from the DOM/canvas loop. |
| Vercel CLI / Git integration | Deployment | Vite is a first-class supported framework preset on Vercel (zero-config build detection). The **only** manual step needed for a client-routed SPA is a `vercel.json` rewrite so deep links don't 404 on refresh (see Installation section). Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Vercel project dashboard per environment (Production/Preview/Development) — never commit them. |

## Architecture Note: Wrapping the Imperative Engine in React

This is the highest-risk integration point in the migration, so it gets explicit treatment here (STACK-level, not just ARCHITECTURE-level) because the *library choices above are what make the pattern work*.

**The problem:** `app.js`'s `renderLoop()` runs a `requestAnimationFrame` loop calling `handLandmarker.detectForVideo()` and repainting a `<canvas>` with `drawImage`/`fillRect` every frame (potentially 30-60 times/sec). React's render model is not built for 30-60 state updates/sec — if the engine's per-frame state (hand landmarks, drag position, shatter particle positions) is pushed into `useState`, React will re-render the whole component tree every frame and the app will visibly stutter.

**The pattern (verified against Zustand's own documented API, Context7 `/pmndrs/zustand`):**

1. **Port the engine's logic almost verbatim** into a plain TypeScript class or closure factory (e.g. `createGameEngine(videoEl, canvasEl): GameEngine`) that owns the `HandLandmarker` instance, the rAF handle, and all the mutable objects the prototype already has (`puzzle`, `drag`, `shatter`, `countdown`, `freezeGate`, `galleryEntries` equivalents). This is *not* React code — it's the same finite-state-machine/closure pattern already validated in `app.js`, just typed and given real module boundaries per file (per the existing ARCHITECTURE.md's own recommendation to split into `gestureEngine.ts`, `puzzleEngine.ts`, `audioEngine.ts`).
2. **All per-frame drawing stays inside the engine**, drawing directly to the canvas via `getContext('2d')` — never route per-frame pixel/landmark data through React state or props.
3. **Create a Zustand store for only the *coarse-grained, UI-relevant* transitions** the surrounding React chrome needs to react to: `appState` (`'tracking' | 'countdown' | 'puzzle' | 'shattering'`), `countdownValue`, `solvedPhotoDataUrl`, `score`, `galleryStripFull`. The engine calls `useGameStore.getState().setAppState(...)` (or a vanilla store's `.setState()`) imperatively from inside its own loop **only when a coarse transition actually happens** (e.g., once when countdown reaches 0, not every frame) — not on every rAF tick. React components subscribed to `useGameStore` re-render only on those infrequent transitions, not at 60fps.
4. **The React component (`<GameCanvas />`) is a thin mount point**: it holds `videoRef`/`canvasRef` via `useRef`, calls `createGameEngine(...)` and `engine.start()` inside a `useEffect` on mount, and `engine.stop()`/cleanup on unmount (critical: React 19 StrictMode double-invokes effects in dev, so `start()`/`stop()` must be idempotent and cheap to call twice — verify this explicitly when porting `boot()`). All HUD overlays that need React (score display, buttons, modals) live as siblings/children reading from `useGameStore`, positioned absolutely over the canvas — they do not touch the canvas drawing code at all.
5. Use the store's **vanilla API** (`createStore` from `zustand/vanilla`, or just `useGameStore.getState()/.setState()` on a store created with `create()`) inside the engine module, and the **React hook API** (`useGameStore((s) => s.appState)`) only inside actual components. This keeps the engine module free of any React import — it should compile and be testable with zero React runtime, which also makes the puzzle-math/gesture-math functions unit-testable in isolation (a gap called out in the prototype's own TESTING.md).

This pattern directly satisfies the downstream consumer's requirement: it wraps the working gesture/puzzle math with **zero rewrite of the math itself** — only the state-transition boundary changes (module-scoped `let` → Zustand store setter), and the render loop's canvas-drawing code is untouched.

## Installation

```bash
# Scaffold (Vite's official React+TS template)
npm create vite@latest pinchpop -- --template react-ts

# Core runtime deps
npm install zustand @mediapipe/tasks-vision @supabase/supabase-js react-router-dom

# Styling
npm install tailwindcss @tailwindcss/vite

# Forms/validation (auth + profile)
npm install react-hook-form zod @hookform/resolvers

# Dates (leaderboard day-bucketing)
npm install date-fns

# Dev dependencies — pin TypeScript below the typescript-eslint ceiling
npm install -D typescript@5.9.3 eslint typescript-eslint @vitejs/plugin-react vite@8.2.2
```

```jsonc
// vercel.json — required for SPA client-side routing to survive refresh/deep links
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Zustand | React Context + `useReducer` | If the team wants zero extra dependencies and state needs are trivial. Rejected here because the engine-bridge pattern above specifically needs the non-React `getState()/setState()` API that Context doesn't provide without extra plumbing (refs to dispatch, etc.) — Zustand gives this for free and matches the prototype README's stated plan already. |
| Zustand | Redux Toolkit | RTK is heavier machinery than this app's state needs (no complex normalized entity graphs, no time-travel debugging requirement mentioned). Consider only if the team already has deep Redux DevTools workflows they want to keep. |
| npm-installed `@mediapipe/tasks-vision` | CDN `<script>`/dynamic `import()` from jsdelivr (current prototype approach) | Only if you deliberately want to avoid bundling the WASM/JS into your own build (e.g., to always get upstream's latest patch without a redeploy). Not recommended for this migration — Vite's whole value proposition (typed deps, reproducible builds, offline dev) is undermined by keeping a CDN import for the single heaviest dependency in the app. |
| `@supabase/supabase-js` direct client | `@supabase/ssr` | Only if a server-rendering framework (Next.js, Remix, SvelteKit) enters the picture later — irrelevant for a Vite SPA with no server component. |
| Tailwind CSS v4 | CSS Modules / vanilla CSS (current approach) | If the team strongly prefers keeping the existing hand-rolled design-token system for *everything*, not just the game screen. Valid choice — the prototype's `css/styles.css` is already well-organized with CSS custom properties. Tailwind is recommended here specifically because the *new* surface area (auth, gallery, leaderboard, profile — several full pages) is large enough that utility classes will meaningfully speed up delivery versus hand-writing a full second design system from scratch. |
| React Router v7 | TanStack Router | TanStack Router has stronger type-safe routing but a steeper learning curve and smaller ecosystem familiarity. Not worth the switch for this app's route complexity (a handful of top-level routes, one dynamic public-share route). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| TypeScript 7.0.x/7.1.x today | `typescript-eslint@8.70.0`'s peer range caps at `<6.1.0` (verified live via npm), and TS 7.0 itself ships without a stable programmatic API until 7.1 — tools built on the TS compiler API (including framework tooling for various ecosystems) aren't ready. Installing it now silently breaks type-aware ESLint rules. | `typescript@^5.9.3` — re-evaluate the TS7 jump in a later milestone once `typescript-eslint` publishes explicit support. |
| `@vitejs/plugin-react-swc` alongside Vite 8 | Adds a second Rust-based transform toolchain (SWC) when Vite 8's default `@vitejs/plugin-react` (v6) already uses Oxc — redundant, and the historical "SWC > Babel" speed argument no longer applies since Babel isn't in the default path anymore. | `@vitejs/plugin-react@6.1.1` (default) |
| Loading MediaPipe from a CDN `<script>` tag inside a Vite/React app | Defeats Vite's dependency pre-bundling and TypeScript typing; makes the build non-reproducible (upstream CDN changes silently change your running app); the exact failure mode already called out in the prototype's own ARCHITECTURE.md ("non-functional offline or if CDN unreachable"). | `npm install @mediapipe/tasks-vision`, import normally; keep only the large `.task` model file on a CDN (or self-host in `public/`) since that's a large binary asset, not code. |
| `@supabase/auth-helpers-*` / Next.js-specific Supabase packages | These are framework adapters for Next.js/SvelteKit SSR session handling — there is no server in this Vite SPA, so they add irrelevant complexity and wrong assumptions about cookie-based session sync. | Plain `@supabase/supabase-js` `createClient()` with default localStorage session persistence. |
| Redux (classic, not Toolkit) | Excessive boilerplate for this app's actual state surface (auth session, coarse game-state, UI toggles). | Zustand |
| Putting per-frame hand-landmark or drag-position data into React `useState`/Zustand on every rAF tick | Causes 30-60 re-renders/sec of the surrounding React tree — the exact "fighting React's render model" failure mode the milestone context explicitly warns about. | Keep per-frame data inside the engine's own closures; only push *coarse state transitions* (state-machine changes, not continuous positions) into the Zustand store, as described in the Architecture Note above. |

## Stack Patterns by Variant

**If the team wants to keep the game screen's CSS entirely separate from Tailwind (recommended):**
- Scope Tailwind's `@import "tailwindcss"` to only the app-chrome stylesheet, and keep `css/styles.css` (ported, still hand-authored) imported separately and scoped to the game route only.
- Because Tailwind v4 has no PurgeCSS-style content-scanning conflicts with plain CSS files sitting alongside it, this coexistence is safe by default — no extra config needed.

**If offline resilience for the MediaPipe model becomes a hard requirement later (not in this milestone's scope per PROJECT.md, but worth flagging):**
- Self-host `hand_landmarker.task` in `public/models/` and point `FilesetResolver`/`HandLandmarker.createFromOptions()` at the local path instead of `storage.googleapis.com`. This is a one-line config change once the npm package is in place — worth noting in PITFALLS/roadmap as a cheap future improvement, not a blocker now.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `typescript@5.9.3` | `typescript-eslint@8.70.0` | Verified: peer range `>=4.8.4 <6.1.0` accepts 5.9.3, rejects 7.0.x. Re-check this range before any future TS major bump. |
| `vite@8.2.2` | `@vitejs/plugin-react@6.1.1` | Verified: plugin's peer dep is `vite: ^8.0.0`. |
| `vite@8.2.2` | `@types/node@^20.19.0 \|\| >=22.12.0` | Verified via `npm view vite peerDependencies` — ensure the Node version used in CI/Vercel build matches (Vercel's default Node runtime for new projects is currently 22.x — confirm in Vercel project settings, not assumed here). |
| `react@19.2.8` | `react-dom@19.2.8` | Keep these two in lockstep (same version) — standard React requirement, not specific to this project. |
| `@supabase/supabase-js@2.116.0` | Any modern browser with `fetch`/`WebSocket` (no Node-only APIs used client-side) | No SSR-specific compatibility concerns since this is a pure client SPA. |

## Sources

- Context7 `/pmndrs/zustand` — verified vanilla store API (`getState`/`setState`/`subscribe`), external-store-outside-React usage pattern, `zustand/vanilla`. HIGH confidence.
- Context7 `/supabase/supabase` and `/websites/supabase` — verified RLS policy patterns for `profiles` + `storage.objects`, `signInWithOAuth` (Google) client-side flow, signed-URL storage upload patterns. HIGH confidence.
- `npm view <pkg> version / versions / peerDependencies / dist-tags` (live registry queries, run 2026-09-09) — verified exact current versions for react, react-dom, vite, typescript, zustand, @supabase/supabase-js, @mediapipe/tasks-vision, @vitejs/plugin-react, react-router-dom, @types/react, @types/react-dom, typescript-eslint, eslint, tailwindcss, react-hook-form, zod, date-fns. HIGH confidence — this is ground-truth registry data, not training data.
- WebSearch: "TypeScript 7.0 native compiler tsgo release stable 2026" (InfoQ, Visual Studio Magazine, DigitalApplied coverage of TS 7.0 GA, July 2026) — MEDIUM confidence, corroborated by the direct npm peer-dependency check above (HIGH confidence data point) which is the load-bearing fact.
- WebSearch: "Vite 8 release notes Rolldown default bundler" (vite.dev/blog/announcing-vite8, InfoQ) — MEDIUM confidence on Rolldown architecture change and plugin-react v6's Oxc-based transform.
- WebSearch: "Vercel deploy Vite React SPA vercel.json rewrites" (vercel.com/docs/frameworks/frontend/vite, vercel.com/docs/project-configuration/vercel-json) — MEDIUM-HIGH confidence, cross-referenced against Vercel's own docs domain.
- Existing project files read: `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STACK.md` — ground truth for what the prototype currently does and what must be preserved.

---
*Stack research for: React + TypeScript + Vite gesture-controlled photobooth game with Supabase backend, deployed to Vercel*
*Researched: 2026-09-09*
