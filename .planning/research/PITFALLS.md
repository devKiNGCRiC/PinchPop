# Pitfalls Research

**Domain:** Migrating a real-time MediaPipe/Canvas2D gesture game from vanilla JS to React + TypeScript + Vite, with a new Supabase backend (Auth, Postgres, Storage, RLS), leaderboards, and public share links.
**Researched:** 2026-09-09
**Confidence:** HIGH (React/Supabase mechanics — verified via Context7/official docs), MEDIUM (anti-cheat and MediaPipe-in-React specifics — verified via multiple independent sources, no single canonical doc)

## Critical Pitfalls

### Pitfall 1: rAF loop driven by React state causes re-render thrashing or stale closures

**What goes wrong:**
The prototype's `renderLoop()` runs at 60fps doing `detectForVideo()` + canvas draws inside a single `requestAnimationFrame` recursion, mutating module-scoped objects (`puzzle`, `drag`, `shatter`, `appState`) directly. A naive port stores this same state in `useState`/`useReducer` and reads/writes it from inside the rAF callback. Two failure modes result: (a) if the loop calls `setState` every frame, React re-renders 60x/second, tanking performance and fighting the imperative Canvas2D draw calls that don't need React at all; (b) if the rAF callback is captured once (e.g., scheduled inside a `useEffect` with `[]` deps) and reads `puzzle`/`appState` from closure, it sees the values from the render that scheduled it — not the latest ones — because each `requestAnimationFrame(loop)` recursion keeps reusing the *original* closure unless the effect re-runs.

**Why it happens:**
React's mental model (state drives render) is the opposite of a game loop's mental model (loop drives state, render is a side effect of the loop, not of state changes). Teams try to make the rAF loop "React-idiomatic" by routing all mutable game state through `useState`, which is the wrong tool for something that changes every frame.

**How to avoid:**
- Keep all per-frame mutable state (`puzzle`, `drag`, `shatter`, `countdown`, `freezeGate`, `appState`) in `useRef` objects or a state object owned by a plain class/controller instantiated once via `useRef(new GameController())`, never in `useState`.
- The rAF callback should always read the *current* ref value (`stateRef.current`), never a value destructured at effect-setup time.
- Only call `setState`/dispatch for things React actually needs to re-render on a human timescale (HUD text like score/moves-placed, puzzle-solved banner, gallery count) — and batch/throttle those (e.g., update HUD state only when the displayed value actually changes, not every frame).
- Canvas drawing itself should stay 100% imperative (`ctx.draw...`) inside the rAF callback — do not try to represent puzzle pieces as React-rendered DOM/canvas-via-props; React should not re-render to update a single pixel-frame.
- Start the loop in one `useEffect` with an empty dependency array that owns the `requestAnimationFrame` id and cancels it on cleanup; the loop function itself should be defined so it never needs to be recreated (i.e., it takes no closed-over reactive values, only refs).

**Warning signs:**
- React DevTools Profiler shows the game component (or its parent) re-rendering every frame during gameplay.
- Puzzle drag feels laggy/rubber-banded compared to the vanilla prototype.
- A gesture recognized this frame appears to act on last frame's hand position ("input lag" that wasn't in the original).

**Phase to address:**
Core migration/porting phase (before any backend work touches the game loop) — this must be validated with a working, smooth gameplay port before layering Supabase features on top.

---

### Pitfall 2: React Strict Mode double-invoke breaks camera/MediaPipe/rAF initialization

**What goes wrong:**
In development, React 18/19 Strict Mode intentionally mounts → unmounts → re-mounts every component to surface effect-cleanup bugs. A `useEffect` that calls `getUserMedia()`, initializes `HandLandmarker` (WASM + model download), and kicks off `requestAnimationFrame(loop)` — mirroring the prototype's `boot()` — will run twice. Without correct cleanup this can: request camera permission twice (sometimes surfacing a stale/duplicate `MediaStream` that never gets its tracks stopped, leaving the camera light on after navigating away), create two `HandLandmarker` instances (each loads the ~10MB+ WASM/model, doubling load time and GPU/CPU delegate contention), or schedule two overlapping rAF loops (visible as doubled draw calls, flickering, or ghosted puzzle pieces).

**Why it happens:**
The original prototype's `boot()` was designed to run exactly once, at module load, with no concept of "unmount." Porting it verbatim into a `useEffect(() => { boot() }, [])` without a cleanup function ignores React's mount/unmount contract, which Strict Mode is specifically designed to catch.

**How to avoid:**
- Every resource-acquiring effect (camera stream, `HandLandmarker`, rAF loop) must return a cleanup function: stop all `MediaStream` tracks (`stream.getTracks().forEach(t => t.stop())`), call `handLandmarker.close()` (MediaPipe tasks-vision exposes `.close()` to free WASM memory), and `cancelAnimationFrame(id)`.
- Use an `isCancelled`/`isMounted` ref flag inside the async init chain so that if unmount happens mid-await (e.g., during WASM download), the second-phase `.then()` doesn't touch refs/DOM after teardown started.
- Guard against double-initialization explicitly: if `handLandmarkerRef.current` or `streamRef.current` is already set when the effect re-runs, skip re-acquiring and only re-attach.
- Test the full boot sequence with Strict Mode ON in dev (do not disable Strict Mode to "make the bug go away" — that hides real production remount bugs, e.g. from React Router transitions or Vite HMR).
- Verify manually: navigate away from the game route and confirm the browser's camera-in-use indicator turns off.

**Warning signs:**
- Camera permission prompt fires twice on first load.
- Browser tab/camera indicator stays active after leaving the game page.
- Console shows two "GPU delegate" or "CPU fallback" log lines from a single page load.
- Model load takes noticeably longer in dev than the vanilla prototype did.

**Phase to address:**
Core migration/porting phase — specifically the camera/MediaPipe bootstrap sub-task. Must be verified with Strict Mode enabled before merging, not deferred to a "polish" phase.

---

### Pitfall 3: MediaPipe HandLandmarker instance recreated every render or component re-mount

**What goes wrong:**
`HandLandmarker` creation (`FilesetResolver.forVisionTasks(...)` then `HandLandmarker.createFromOptions(...)`) is asynchronous and expensive (WASM download + model fetch, hundreds of milliseconds to seconds). If the initialization is triggered from a dependency array that changes on every render (e.g., depends on a non-memoized options object, or the parent re-renders and remounts the game component via a changing `key`), the app repeatedly tears down and reinitializes the model — visible as a loader flicker or, worse, a race where an old async init resolves after a newer one and overwrites `handLandmarkerRef.current` with a stale/closed instance.

**Why it happens:**
Teams new to integrating an imperative SDK inside React often pass a fresh object/array literal as an effect dependency (e.g., `useEffect(() => {...}, [{gpu: true}])`), which is a new reference every render, or they don't realize a parent route/page re-render can remount the child game component (React key changes, conditional rendering toggling the subtree).

**How to avoid:**
- Depend on primitive/stable values only (or `[]` if init should happen exactly once per mount).
- Track an async generation counter or `AbortController`-style flag so a late-resolving init from a previous mount cannot clobber the ref if a newer one has already started/finished.
- Keep the game page component high and stable in the route tree (don't nest it under state that toggles it in and out of the tree, e.g., don't conditionally render `{showGame && <GamePage/>}` where `showGame` flips during normal interaction — use routing instead).

**Warning signs:**
- Loader/spinner flashes more than once per page visit.
- Console shows multiple "HandLandmarker created" logs per navigation.
- Detection occasionally stops working after an unrelated state update elsewhere in the app.

**Phase to address:**
Core migration/porting phase.

---

### Pitfall 4: Over-permissive or contradictory RLS policies leak private gallery data

**What goes wrong:**
Two opposite mistakes are both common. (a) **Over-permissive:** a `select using (true)` policy (or RLS left disabled entirely — RLS is OFF by default on new tables) is applied to the `photos`/`game_sessions`/`scores` tables "to get the frontend working," which means every authenticated (or even anonymous) client can read every user's private gallery, not just their own, since the anon/publishable key is exposed client-side and Supabase's REST/PostgREST layer executes queries directly against Postgres subject only to RLS. (b) **Overly-restrictive:** a blanket `using (auth.uid() = user_id)` policy is applied to a table that also needs to serve public data (leaderboard rows, publicly shared photo pages), so the public share-link page or leaderboard silently returns empty results in production because the anonymous visitor's `auth.uid()` is null and no policy grants them access — this is often masked in development because the developer is always signed in.

**Why it happens:**
RLS policies are per-table and per-operation (select/insert/update/delete), not per-column, and it's easy to think in terms of "is this table private or public" instead of "is this *row* private or public" — which matters here because a single `photos` table holds both private gallery photos and the subset the owner has explicitly made public via a share link.

**How to avoid:**
- Enable RLS on every table the moment it's created — never leave a window where a new table is unprotected in a shared/staging environment.
- Model share-ability as an explicit column (e.g., `photos.is_public boolean default false`, or a separate `share_links` table with its own unguessable token) rather than trying to infer "shareable" from other state. Write the SELECT policy as `using (user_id = auth.uid() OR is_public = true)` so public rows are visible to anonymous visitors while private rows require ownership.
- For leaderboards, put only the columns needed for public display (username/display name, score, achieved_at) in a dedicated public-readable view or table — do not grant broad SELECT on the full `game_sessions`/`profiles` table just to expose the leaderboard; a `security definer` Postgres function or a narrow public view avoids exposing emails, auth metadata, or unrelated private fields.
- Never use the `service_role` key in any client-shipped code (browser bundle, mobile app) — it bypasses RLS entirely. It belongs only in server-side contexts (Vercel serverless/edge functions, if used for score validation — see Pitfall 6).
- Add automated policy tests (even simple ones): as an anonymous client, assert you cannot read another user's private photo row and can read a row marked public; as authenticated user A, assert you cannot read user B's private rows.
- Remember table owners bypass RLS by default — if any migration/seed script runs as the table owner/superuser, use `FORCE ROW LEVEL SECURITY` on tables where this matters, or ensure app queries always run as `authenticated`/`anon` roles, not the owner role.

**Warning signs:**
- A quick manual test: open the app in an incognito window (unauthenticated) and try fetching another user's photo ID directly via the Supabase client — if it returns data, the policy is too permissive.
- Public share-link page or leaderboard shows empty/loading forever in a fresh incognito session even though data exists — sign of an overly-restrictive policy.
- Any `for select using (true)` or `for all using (true)` policy present on a table containing user-owned data — an immediate red flag in code review.

**Phase to address:**
Backend/database schema phase — RLS policies must be designed and tested *before* the gallery, sharing, or leaderboard features are wired to the frontend, not retrofitted after. Re-verify at the sharing phase specifically, since that's when the "leak via public link" surface is introduced.

---

### Pitfall 5: Public share-link pages leak more than the shared photo

**What goes wrong:**
A "shareable photo page" is commonly implemented by just exposing the row by primary key (`/share/:photoId`) with a public-read RLS policy on the whole row. If the `photos`/`game_sessions` row also contains fields like `user_id`, raw score internals, device/session metadata, or a foreign key that (via a join the frontend performs) pulls in the owner's profile (display name is usually fine, but email or other profile fields might not be), all of that becomes visible to anyone with the link — including search engines and scrapers, since public share pages are typically unauthenticated and crawlable unless explicitly blocked.

**Why it happens:**
"Make this one thing public" is implemented at the row level instead of the field level, and the frontend query for the share page (`select *`) is copy-pasted from the authenticated gallery query, which was never designed to be safe for anonymous eyes.

**How to avoid:**
- The share page's data query should hit a narrow, purpose-built view/RPC that returns only the fields meant to be public (photo URL, puzzle grid preview, achieved_at, public display name) — never `select *` on a table that also has private columns.
- Use an unguessable share token (UUID v4 or similar, not the sequential/incrementing primary key) as the public identifier so links can't be enumerated to discover other users' photos even if a row happened to be public by mistake.
- Decide explicitly whether share pages should be indexable (robots meta tag) — default to `noindex` unless product intent says otherwise, since photo pages containing a player's face are personal content.
- Confirm Supabase Storage photo URLs referenced by the share page are either in a public bucket by deliberate design (fine for content the user has explicitly opted to share) or are short-lived signed URLs — do not put private-gallery photos and shared photos in the same bucket path/prefix if the bucket itself is public, since a public bucket makes every object in it fetchable by URL regardless of RLS on the database row that references it.

**Warning signs:**
- Network tab on the share page shows a response payload containing `user_id`, email, or fields not rendered in the UI.
- The share URL is a small sequential number that can be incremented to view other users' photos.
- Photos meant to stay private are reachable via a guessed/enumerated Storage URL even without the DB row being public.

**Phase to address:**
Sharing phase (public photo pages) — treat this as a security review checkpoint, not just a feature-complete checkpoint.

---

### Pitfall 6: Client-reported Speed Run scores are trivially fakeable with no server-side validation

**What goes wrong:**
The natural port of the existing client-only game is: browser measures elapsed time/moves in JS, then calls `supabase.from('scores').insert({...})` directly from the client with whatever numbers the client computed. Because the Supabase anon key and table structure are visible in the browser, any user can open devtools and call `supabase.from('scores').insert({ time_ms: 1, moves: 1, user_id: <their-id> })` directly, bypassing gameplay entirely — RLS can restrict *whose* row they insert (their own `user_id`) but cannot, by itself, validate that the *values* in that row correspond to a real play session.

**Why it happens:**
Supabase's direct-from-client Postgres access model (the whole appeal for solo/small teams) makes "just insert the row from the client" the path of least resistance, but it inherits the general problem that a database with only ownership-based RLS trusts whatever data the client sends, not whether that data is truthful.

**How to avoid (right-sized for this project — no dedicated game server exists):**
- Do not let the client `INSERT` directly into the `scores`/`game_sessions` table with client-computed final values. Instead, route score submission through a Postgres function (`security definer` RPC, callable via `supabase.rpc('submit_score', {...})`) that performs sanity checks the client cannot bypass:
  - A session must have been started server-side first: on puzzle/game start, call an RPC (`start_session()`) that records a `started_at` timestamp and returns a session id; `submit_score(session_id, moves, ...)` computes elapsed time itself as `now() - started_at` server-side rather than trusting a client-sent `time_ms`, and rejects if the session was already completed (prevents replay/resubmission) or if elapsed time is implausibly short (e.g., under some floor like 2-3 seconds for a 3x3 puzzle) or implausibly long/stale (abandoned session hours ago).
  - Validate `moves` and other reported counters are within plausible bounds server-side (e.g., moves >= number of pieces, moves below some sane ceiling) — reject obviously impossible values rather than trying to fully re-simulate the puzzle server-side (full server-side puzzle-state replay is disproportionate effort for an MVP; bounds-checking plus server-timed duration meaningfully raises the bar without requiring a real-time authoritative server).
  - Do not grant client-side INSERT/UPDATE privileges on the scores table at all — only the security-definer function can write, called via RPC.
- Be explicit with the team/stakeholders about the resulting guarantee: this stops casual/devtools cheating and API replay, not a determined attacker running a fully scripted headless "player" that calls the RPCs with fabricated-but-plausible timing — that level of defense (full server-authoritative gameplay simulation) is out of scope for a solo photobooth game's MVP leaderboard and should be named as an accepted risk, not silently assumed away.
- Rate-limit/throttle score submission RPCs (Supabase supports this at the Postgres/Edge Function layer) to blunt brute-force leaderboard-flooding.

**Warning signs:**
- Any code path where the client computes the final `time_ms`/`score` value and that exact value is written to the database unchanged.
- Leaderboard shows implausible entries (0-second solves, negative move counts) shortly after launch — usually the first sign real users found the devtools exploit.
- No RPC/function boundary between "client believes it solved the puzzle" and "row exists in scores table."

**Phase to address:**
Backend/scoring phase (Speed Run + leaderboard). Design the session-start/session-submit RPC pair *before* building the leaderboard UI, since retrofitting server-side timing after direct-insert is live requires a data migration/backfill and a leaderboard reset (bad user experience once real users have entries).

---

### Pitfall 7: Guest-mode data migration to authenticated account loses data or crashes on conflict

**What goes wrong:**
Guest mode is commonly implemented one of two ways, each with its own migration trap: (a) purely local (no Supabase row at all until sign-up) — "migration" means bulk-uploading whatever's in memory/localStorage at sign-up time, and if the user closes the tab before signing up, everything is lost with no warning; (b) Supabase Anonymous Auth (`signInAnonymously()`) creating a real `auth.users` row and real game-session/photo rows tied to that anonymous `user_id`, then later "upgrading" via `linkIdentity()`/`updateUser({email})` — this preserves the user id and thus all foreign-keyed data automatically **only in the simple case**. It breaks when: the user tries to link an email/Google identity that already belongs to an *existing* permanent account (common — a returning user forgets they have an account and plays as guest first) — Supabase does not automatically merge the anonymous user's data into the existing account; without explicit handling this either fails outright (identity already exists) or silently orphans the anonymous account's game history.

**Why it happens:**
Teams test the "happy path" (brand-new email, no prior account) and never test the "returning user who already has an account plays as guest first" path, which is extremely likely for a photobooth app people revisit.

**How to avoid:**
- Prefer Supabase Anonymous Auth over purely-local guest state — it gives guests a real, RLS-protected `user_id` from the first frame, so photos/sessions captured as a guest are durable (survive tab close/reopen on the same device) without requiring a design change later, and "upgrading" is then a well-defined identity-linking operation rather than an ad-hoc bulk upload.
- Explicitly handle the "identity already linked to another account" error from `linkIdentity()`/`updateUser()`: detect it, and present the user a clear choice — sign in to the existing account (in which case the guest session's data should be explicitly re-associated: e.g., reassign `user_id` on the guest's rows to the existing account's id via a server-side function, or offer to discard the guest session) rather than letting the error surface as a raw failure toast.
- Because anonymous users are real `auth.users` rows subject to the same RLS as everyone else, apply the same RLS review to them — don't accidentally treat `auth.uid() is not null` as "trusted permanent user" in any policy or business logic (e.g., achievement/leaderboard eligibility) if guests should be excluded from certain features (decide explicitly: can a guest appear on the leaderboard? Recommend requiring a permanent account for leaderboard submission, both for anti-abuse and because anonymous accounts can be cleaned up/expired).
- Add CAPTCHA or rate-limiting on anonymous sign-in (Supabase's own guidance) since it's an open, unauthenticated endpoint that can otherwise be scripted to mint unlimited accounts.
- Decide and document anonymous-account lifecycle: Supabase does not auto-delete abandoned anonymous users — plan a cleanup policy (e.g., a scheduled job deleting anonymous accounts with no linked identity after N days) or they accumulate indefinitely in `auth.users` and in any tables their guest sessions touched.

**Warning signs:**
- No test exists for "sign up with an email/Google account that already exists, while currently in a guest session."
- Photos/scores captured as a guest disappear after the user later creates a "new" account with the same email (symptom of local-only guest state, not anonymous auth).
- `auth.users` table grows large numbers of anonymous rows with no corresponding real activity months later.

**Phase to address:**
Auth/guest-mode phase — design the anonymous-to-permanent linking flow (including the conflict case) before building the gallery/profile UI that assumes a stable `user_id`. Leaderboard-eligibility rule (guest vs. permanent) should be decided in the same phase as leaderboard design.

---

### Pitfall 8: Carrying forward the prototype's known gesture/state bugs into the "production" React version unexamined

**What goes wrong:**
`CONCERNS.md` documents several latent bugs in the current prototype (hand-identity flips between frames because hands are labeled by array index `"A"/"B"` rather than MediaPipe's `handedness` field; in-flight `requestAnimationFrame` displacement animations not cancelled on puzzle reset, causing a silent error and a piece left in a stale position; a strip-modal `setTimeout` with no stored handle that can't be cancelled on rapid reset). A straight line-for-line port carries these bugs into the new codebase, where they're now harder to spot because they're buried inside React effects/refs instead of a single readable file, and they'll resurface under the *same* rare interaction sequences (hand occlusion/crossing, resetting mid-animation) — except now users may report them as fresh regressions.

**Why it happens:**
"Migrate, don't rewrite" (the project's own strategy) is correct for preserving tuned gameplay feel, but it's easy to conflate "preserve the gameplay feel" with "preserve every implementation detail including bugs," especially with no automated tests as a safety net to distinguish intentional behavior from accidental bugs.

**How to avoid:**
- Before porting, write a short list of "known quirks to fix during migration" (pulled directly from `CONCERNS.md`'s Known Bugs section) vs. "tuned values to preserve exactly" (pinch threshold, snap distance, fist-hold frames, freeze-hold ms) — treat these as two different categories with different handling during the port.
- Fix the hand-identity bug during migration by switching to MediaPipe's `handedness` result field (or a landmark-distance-based re-association heuristic) instead of array index — this is a good, cheap opportunity since the port already touches every line of gesture-handling code.
- When porting the drag/displacement animation logic into a React-managed structure (refs/controller), explicitly design cancellation: any in-flight animation must be cancelled (not just have its target object nulled) when the puzzle resets — this is naturally easier to get right in the new architecture if it's called out as a requirement, not left implicit.
- Since there are zero existing automated tests, write a small set of characterization tests (unit tests for `isPinching`/`isFist`/snap-distance math, not full E2E) before/during the port specifically for the logic being moved, so behavior changes (intentional or not) are visible in a diff instead of only discovered by manual playtesting.

**Warning signs:**
- Puzzle piece "teleports" or gets stuck in a wrong position after a fast reset — same symptom as the documented `resetPuzzleOnly` bug.
- Wrong hand suddenly controls a dragged piece after hands cross or one hand briefly leaves frame.
- No test file exists anywhere touching gesture math or puzzle state transitions by the time the migration phase is marked complete.

**Phase to address:**
Core migration/porting phase — explicitly call out "fix known bugs from CONCERNS.md" as an in-scope task of this phase, not deferred to a later "polish" phase (deferring risks it being forgotten since the bugs are hard to reproduce and not currently reported by any user).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Client-side `INSERT` of final score values (no session-start RPC) | Faster to ship leaderboard | Trivially cheatable via devtools; requires leaderboard reset + migration to fix later | Never for a public leaderboard; acceptable only for a purely personal/private stats view with no ranking |
| Single public Storage bucket for all photos (private + shared) | Simplest Storage setup, no signed-URL plumbing | Any "private" photo becomes guessable/fetchable if its URL leaks (e.g., via logs, referrer headers, or an accidentally-public share) | Only if truly all photos are meant to be public by design; not for a "personal gallery" feature explicitly described as private-by-default |
| Local-only (non-Supabase) guest state, uploaded in bulk at sign-up | Skips designing anonymous-auth RLS early | Guest work-in-progress lost on tab close; sign-up flow has to handle large bulk uploads and partial-failure states | Acceptable only if guest mode is explicitly "session only, nothing persists," and the product decision documents that tradeoff |
| Porting `app.js`'s module-scoped mutable objects directly into `useState` | Looks like idiomatic React quickly | Every-frame re-renders, dropped frames, worse feel than the prototype it's replacing | Never for the per-frame hot state (puzzle/drag/shatter); fine for genuinely low-frequency UI state (auth status, gallery list) |
| Deferring RLS policy writing until "after the frontend works" (dev with RLS disabled) | Faster local iteration | High risk of shipping with RLS off or with a placeholder `using (true)` policy forgotten in production | Only acceptable in a fully local/throwaway dev branch never pointed at shared data; must be closed out before any phase that involves real user data |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|------------------|-------------------|
| `@mediapipe/tasks-vision` in Vite/React | Loading it from a CDN `import` (as the prototype does) instead of an npm dependency, causing Vite dev/build inconsistencies and no offline/local dev capability | `npm install @mediapipe/tasks-vision`, bundle it, and self-host (or explicitly vendor) the WASM + `.task` model asset so the build isn't dependent on `storage.googleapis.com`/`cdn.jsdelivr.net` availability at runtime |
| Supabase Auth (Google OAuth) | Redirect URL / site URL misconfigured for local dev vs. Vercel preview vs. production, causing OAuth callback failures that only show up post-deploy | Configure all three redirect URLs (localhost, Vercel preview domain pattern, production domain) in the Supabase Auth provider settings before the auth phase is considered done; test OAuth specifically on a deployed Vercel preview, not just localhost |
| Supabase client in Vite | Using the `service_role` key (or accidentally prefixing a secret env var with `VITE_`, which Vite inlines into the client bundle) | Only the `anon`/publishable key may be prefixed `VITE_`; `service_role` key must never exist in any `VITE_`-prefixed env var or client-reachable code path |
| Supabase Storage uploads from the browser | Uploading directly with the anon key and no bucket-level RLS/policy, or no file-size/type validation, allowing arbitrary uploads | Set Storage RLS policies scoping uploads to `auth.uid()`-owned paths (e.g., `photos/{user_id}/...`), and validate file type/size both client-side (UX) and via a Storage policy or Postgres check (defense in depth) |
| Vercel deployment | Treating Supabase env vars as build-time only and forgetting to set them per-environment (Preview vs Production) in Vercel, causing preview deployments to point at production data or vice versa | Explicitly configure separate Supabase env var values (or at minimum separate Supabase projects for staging/prod if budget allows) per Vercel environment |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Per-pixel JS photo effect (`applyPhotoboothEffect`) run every frame during live preview, not just at capture | Main thread janks during the framing/countdown phase, worse on low-end devices; carried over as-is from the prototype (already flagged in CONCERNS.md) | Use a cheap GPU-accelerated CSS/canvas `filter` (contrast/brightness) for the live preview; reserve the expensive per-pixel noise pass for the final captured still only | Noticeable on mid/low-end laptops and most phones even at current resolution; gets worse if capture resolution is ever increased |
| Re-running `handLandmarker.detectForVideo()` every rAF frame regardless of device tier | Frame rate drops on CPU-delegate fallback devices | Frame-skip detection (e.g., every 2nd frame) when GPU delegate isn't available; keep canvas draw at full rAF rate, throttle only the ML inference | Becomes visible on devices that fall back to the CPU delegate — flag this as a QA device-matrix item, not just a desktop Chrome check |
| Leaderboard/gallery queries with no pagination (`select *` over an ever-growing table) | Slow gallery/leaderboard load as user base and photo count grow | Paginate all list queries from day one (limit/offset or keyset pagination), especially the "all-time leaderboard" which only grows | Not a problem at MVP scale, but retrofitting pagination after a UI is built without it is disproportionately expensive later — build it in now |
| Full-resolution `<canvas>` elements held in memory for the whole session (gallery/strip) | Memory growth over a long session, more pronounced once gallery persists to Supabase and could show many more than 3 photos | Serialize captured photos to blobs and upload/discard rather than retaining live canvases; when rendering a persisted gallery, use thumbnails/`<img>` with real URLs, not retained canvas objects | Was capped at 3 photos in-memory in the prototype; breaks as soon as "Personal Gallery" shows an unbounded history from Supabase |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| RLS disabled or `using (true)` left on a user-data table "temporarily" | Full private-gallery data leak to any client holding the public anon key | Enable RLS at table-creation time as a non-negotiable step; add a pre-launch checklist item to grep all migrations for `using (true)`/`for all` policies on user-data tables |
| `service_role` key present in any client-bundled code or `VITE_`-prefixed env var | Total RLS bypass, full database read/write from a stolen key found in the shipped JS bundle | Keep `service_role` exclusively in server-side/serverless contexts if used at all; audit the built bundle for the string before each deploy |
| Public Storage bucket used for private gallery photos | Any private photo becomes fetchable by anyone who obtains/guesses its URL, independent of DB-level RLS | Use a private bucket + RLS-gated signed URLs (or a private bucket with owner-scoped storage policies) for gallery photos; only photos the user explicitly shares go through a separate, deliberately-public path |
| Score-submission RPC with no session/timing validation | Fake leaderboard entries, undermining the entire Speed Run feature's credibility at launch | Session-start/session-submit RPC pair with server-computed elapsed time and plausibility bounds (see Pitfall 6) |
| No CAPTCHA/rate-limit on anonymous sign-in or score submission endpoints | Scripted mass account creation or leaderboard flooding | Enable Supabase's recommended CAPTCHA on auth flows; rate-limit RPC calls at the Postgres/Edge Function layer |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Guest plays through the full capture+puzzle loop, only discovers "sign up to save" after investing time and gets no clear path to keep that specific photo | Feels like wasted effort; guests abandon rather than sign up | Prompt for account creation contextually at the save/results moment, and (per Pitfall 7) actually persist the guest's session via Supabase Anonymous Auth so nothing is lost between "played as guest" and "decided to sign up" |
| Public share-link page requires no login but has no clear indication of what's shared vs. private (e.g., shows the same UI as the owner's private gallery view) | Owner may not realize additional data/links are exposed to visitors | Build a dedicated, visually distinct public share-page component that only ever renders the intentionally-public fields — never reuse the authenticated gallery detail view for the public route |
| Leaderboard shows only "all-time" with no daily reset context, or shows entries with clearly-cheated (near-zero) times | Erodes trust in the leaderboard immediately | Ship anti-cheat validation (Pitfall 6) before or alongside the leaderboard UI, not after; consider flagging/filtering outlier times even post-validation as a belt-and-suspenders UX safeguard |

## "Looks Done But Isn't" Checklist

- [ ] **Camera/MediaPipe boot in React:** Often missing proper cleanup — verify by toggling Strict Mode on in dev and confirming exactly one camera permission prompt, one model load, and that the camera indicator turns off on navigating away.
- [ ] **RLS on every new table:** Often missing or left as `using (true)` — verify by attempting reads/writes as an anonymous client and as a different authenticated user against every table holding user data.
- [ ] **Public share link:** Often exposes more than the intended photo — verify by inspecting the network response payload on the public share page for `user_id`, email, or unrelated fields, and by checking whether the underlying Storage URL is guessable/enumerable.
- [ ] **Speed Run score submission:** Often just a client `INSERT` — verify by opening devtools on the deployed app and attempting to submit a score with `time_ms: 1` directly via the Supabase client; it must be rejected.
- [ ] **Guest-to-account migration:** Often only tested for the brand-new-email happy path — verify by starting a guest session, then signing up with an email/Google account that already has an existing PinchPop account, and confirming a defined (not crashed/silent-data-loss) outcome.
- [ ] **Game loop performance parity:** Often "works" but feels laggier than the prototype — verify with React DevTools Profiler that gameplay-critical state (puzzle/drag/shatter) does not trigger component re-renders during active play.
- [ ] **Known prototype bugs:** Often silently ported forward — verify hand-identity stability (cross hands mid-drag), and puzzle-reset-during-animation (reset via fist immediately after triggering a piece displacement) no longer reproduce the documented bugs.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| RLS leak discovered post-launch | HIGH | Immediately tighten/patch the policy, rotate any keys if `service_role` was exposed, audit logs (if available) for anomalous access patterns, notify affected users if legally/ethically required depending on data sensitivity |
| Leaderboard found to be cheat-flooded | MEDIUM | Add server-side validation retroactively (Pitfall 6), then reset or manually prune implausible entries; communicate a leaderboard reset to users if credibility was already damaged |
| Guest data loss reported (local-only guest state) | MEDIUM–HIGH depending on how much data | Migrate guest storage strategy to Supabase Anonymous Auth going forward; for already-lost sessions, there is typically no recovery (data was never persisted) — communicate transparently rather than attempt unreliable recovery |
| Game loop performance regression found late (React re-render thrashing) | MEDIUM | Refactor hot-path state from `useState` to `useRef`-backed controller (Pitfall 1) — mechanical but touches most of the game component; budget a dedicated cleanup pass rather than patching incrementally |
| Public share page found to leak private fields | LOW–MEDIUM | Swap the query to a narrow view/RPC (Pitfall 5), rotate/regenerate share tokens if they were sequential/guessable, add `noindex` retroactively (though already-crawled pages may persist in search caches) |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| rAF/React re-render thrashing & stale closures | Core migration/porting phase | React DevTools Profiler shows no re-renders during active gameplay; drag/puzzle feel matches prototype |
| Strict Mode double-invoke on camera/MediaPipe boot | Core migration/porting phase | Strict Mode enabled in dev; single permission prompt, single model load, camera indicator off on unmount |
| HandLandmarker re-created on unrelated re-renders | Core migration/porting phase | Console logging confirms exactly one HandLandmarker instance per game-page visit |
| Over/under-permissive RLS policies | Backend/database schema phase (re-verified at sharing phase) | Cross-user and anonymous read/write tests against every table pass/fail as expected |
| Public share-link data leakage | Sharing phase | Network payload inspection on public share page contains only intended fields; share token is unguessable |
| Client-fakeable Speed Run scores | Backend/scoring (leaderboard) phase | Attempted devtools score-injection is rejected by the RPC; session-start/submit pair enforced |
| Guest-to-account migration data loss/conflicts | Auth/guest-mode phase | Test matrix includes "existing account + guest session" conflict path with a defined resolution |
| Carrying forward known prototype bugs | Core migration/porting phase | Manual repro of the two documented bugs (hand-identity flip, reset-during-displacement) confirmed fixed, ideally backed by a characterization test |

## Sources

- [Supabase RLS official docs — security definer functions, search_path pinning](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/postgres/row-level-security.mdx) — HIGH confidence (Context7/official)
- [Supabase Anonymous Sign-ins security overview](https://github.com/supabase/supabase/blob/master/apps/docs/content/troubleshooting/security-of-anonymous-sign-ins-iOrGCL.mdx) — HIGH confidence (Context7/official)
- [Supabase Anonymous Sign-ins blog post](https://supabase.com/blog/anonymous-sign-ins) — MEDIUM confidence
- [Supabase Discussion #29017 — converting anonymous user to permanent user](https://github.com/orgs/supabase/discussions/29017) — MEDIUM confidence (community, cross-checked against official anonymous auth docs)
- [Supabase Discussion #6458 — Storage public bucket vs signed URL tradeoffs](https://github.com/orgs/supabase/discussions/6458) — MEDIUM confidence
- [Supabase Discussion #3564 — abuse of signed URLs from storage](https://github.com/orgs/supabase/discussions/3564) — MEDIUM confidence
- [Supabase Security: Hidden Dangers of RLS](https://dev.to/fabio_a26a4e58d4163919a53/supabase-security-the-hidden-dangers-of-rls-and-how-to-audit-your-api-29e9) — MEDIUM confidence (community, corroborated by official docs)
- [Precursor Security — Row Level Recklessness: Testing Supabase Security](https://www.precursorsecurity.com/blog/row-level-recklessness-testing-supabase-security) — MEDIUM confidence
- [React issue #24455 — useEffect double-invoke in Strict Mode](https://github.com/facebook/react/issues/24455) — HIGH confidence (official React repo)
- [Building Snake in React — Canvas RAF Loop, Refs to Avoid Stale Closures](https://dev.to/shaishav_patel_271fdcd61a/building-snake-in-react-canvas-raf-loop-mutable-refs-to-avoid-stale-closures-and-wall-wrap-3gbg) — MEDIUM confidence, directly analogous game-loop-in-React pattern
- [Integrating @mediapipe/tasks-vision for Hand Landmark Detection in React (Medium/DEV)](https://medium.com/@kiyo07/integrating-mediapipe-tasks-vision-for-hand-landmark-detection-in-react-a2cfb9d543c7) — MEDIUM confidence, cross-checked cleanup pattern against React Strict Mode official behavior
- [AccelByte — Server-Authoritative Game Logic to Prevent Cheating](https://accelbyte.io/blog/server-authoritative-logic-to-prevent-cheating) — MEDIUM confidence, general anti-cheat industry pattern applied and scoped down for this project's size
- Internal: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md` (2026-09-08 codebase analysis) — HIGH confidence, primary source for known bugs/anti-patterns carried into Pitfall 1, 8

---
*Pitfalls research for: React/TypeScript/Vite migration of a real-time MediaPipe gesture game + new Supabase backend (Auth, Postgres, Storage, RLS), leaderboards, and public sharing*
*Researched: 2026-09-09*
