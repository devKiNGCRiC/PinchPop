<!-- GSD:project-start source:PROJECT.md -->
## Project

**PinchPop**

PinchPop is a gesture-controlled photobooth game: users frame a photo with their hands, pinch to capture it, solve the resulting 3×3 puzzle with gestures, and get back a polaroid-style photo memory. It currently exists as a working single-file vanilla-JavaScript prototype (forked from PuzzleCam) with no build tooling, backend, or accounts. This milestone turns it into a complete, production-ready, deployable Web MVP — an independent standalone product, not just a tech migration.

**Core Value:** The gesture-controlled capture → puzzle → polaroid experience must feel exactly as good (or better) after migration as it does in the prototype today — everything else (accounts, gallery, scoring, sharing) is built around that core loop, never at its expense.

### Constraints

- **Attribution**: No PuzzleCam/original-author attribution is displayed in the app or README (explicit user decision, 2026-09-09) — do not reintroduce it in future phases
- **Backend**: Supabase only, for Auth, Postgres, and Storage — explicit user choice, matches README's planned architecture
- **Platform**: Web only for this milestone — the mobile companion app is explicitly excluded and comes later
- **Browser support**: Chrome/Edge primary targets, Firefox supported, Safari limited — per existing README
- **Camera requirement**: Core gameplay requires a working webcam — inherent to the gesture-capture mechanic, not a limitation to work around
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES2020+ modules, no transpilation) - `app.js` (1283 lines), the entire application logic
- HTML5 - `index.html`, `guide.html`
- CSS3 - `css/styles.css` (495 lines)
- None. No TypeScript, no server-side language. This is a pure client-side, static, single-page vanilla-JS application (no build step, no bundler).
## Runtime
- Browser only. No Node.js runtime is required to run the app — `index.html` is opened/served directly and loads `app.js` as a native ES module (`<script type="module" src="./app.js">` in `index.html:81`).
- No server-side runtime exists in this repo (no Express/Next/Flask/etc.).
- None present. There is no `package.json`, `package-lock.json`, `yarn.lock`, or `node_modules/` in the repo. All third-party code is loaded at runtime from a CDN (see Key Dependencies below), not installed locally.
- Lockfile: missing (not applicable — no package manager in use).
## Frameworks
- None. No UI framework (no React/Vue/Svelte). The UI is hand-written DOM manipulation directly against `index.html` elements from `app.js`.
- None detected. No test runner config, no `*.test.js`/`*.spec.js` files, no `jest.config.*`/`vitest.config.*`.
- None. No `vite.config.*`, `webpack.config.*`, `tsconfig.json`, `.eslintrc*`, or `.prettierrc*` found. Files are served/opened as-is.
## Key Dependencies
- `@mediapipe/tasks-vision@0.10.14` — imported directly from `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14` in `app.js:1-4` (`FilesetResolver`, `HandLandmarker`). Provides real-time hand landmark detection used to drive all gesture-based interactions (framing, pinch-to-capture, puzzle-piece dragging).
- MediaPipe WASM runtime — fetched from `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm` (`app.js:436`).
- HandLandmarker model asset — downloaded at runtime from `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` (`app.js:449`, `app.js:470`; the second reference is a retry path).
- None (no database client, no auth SDK, no analytics SDK currently wired in).
## Configuration
- No environment variable system (no `.env`, no build-time config injection). All constants (thresholds, timeouts, grid size) are hard-coded at the top of `app.js` (e.g., `PINCH_THRESHOLD`, `FRAME_PADDING`, `COUNTDOWN_SECONDS`, `GRID` in `app.js:19-30`).
- No secrets are used or required by the current implementation.
- No build config files present. The app runs directly from source; opening `index.html` in a browser (or serving the static directory) is sufficient.
## Platform Requirements
- Any static file server or direct file-open in a modern browser. No install step (`npm install` not applicable).
- A webcam is required for local testing of the core gesture/camera features.
- Static hosting only (current state is a plain static site, no server logic). `README.md` (`README.md:214-228`) documents a **planned** deployment path of GitHub → Vercel, but no Vercel config (`vercel.json`) or CI/CD workflow exists yet in the repo.
- Browser support per `README.md:534-544`: Chrome/Edge recommended, Firefox supported, Safari limited, mobile experimental/limited. Camera (and optionally microphone) permission is required at runtime via `navigator.mediaDevices.getUserMedia` (`app.js:404-407`).
## Planned (Not Yet Implemented) Stack
- Frontend: React, TypeScript, Vite, Zustand
- Backend/data: Supabase (Auth, PostgreSQL, Storage)
- Deployment: Vercel
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Project Shape
## Naming Patterns
- Lowercase, no separators for top-level files: `app.js`, `index.html`, `guide.html`, `README.md`.
- CSS lives at `css/styles.css` (lowercase directory, lowercase file).
- No `.test.js`, `.spec.js`, `.module.css`, or other suffix conventions exist yet — if added, follow the flat, lowercase style already established (e.g. `app.test.js` alongside `app.js`, not nested in a `__tests__/` folder, to match the codebase's flat-file preference).
- `camelCase`, verb-first, intention-revealing: `startCountdown`, `finishCountdownAndCapture`, `drawBoardAndPieces`, `applyPhotoboothEffect`, `resetPuzzleOnly`, `resetEverything` (`app.js:541,619,851,594,362,317`).
- Boolean-returning predicates use `is`/`has` prefixes: `isPinching`, `isFist`, `isStripFull`, `isNearOwnCell`, `isPointInBoard` (`app.js:494,498,248,703,949`).
- Sound-effect functions are grouped under a `sound` prefix: `soundCountdownBeep`, `soundSnap`, `soundShatter`, `soundComplete`, `soundSaved` (`app.js:112-145`).
- Draw/render functions use a `draw` prefix: `drawBoardAndPieces`, `drawVideoFrame`, `drawLiveFrameOverlay`, `drawHandSkeleton`, `drawHandSkeletonsOverBoard`, `drawCountdownOverlay` (`app.js:851,907,926,954,980,549`).
- Show/hide UI toggle functions use `show`/`hide`/`update` prefixes: `showStripModal`, `showStripComplete`, `hideStripComplete`, `updateStripDownloadAvailability`, `updateProgressBadge` (`app.js:308,252,258,262,899`).
- `camelCase` throughout: `galleryEntries`, `handsLandmarks`, `lastSeenFrame`, `fistHoldCounter`.
- Short pixel-coordinate temporaries use terse names consistently: `dx`, `dy`, `cx`, `cy`, `sx`, `sy`, `w`, `h` — always paired, never mixed with longer names in the same scope.
- DOM element references are named exactly after their `id` attribute, `camelCase`-ified: `galleryStrip` ← `#galleryStrip`, `downloadStripBtn` ← `#downloadStripBtn`, `stripModalDownload` ← `#stripModalDownload` (`app.js:41-66` mirrors `index.html` ids).
- `SCREAMING_SNAKE_CASE` for true constants/tuning knobs, declared at module top or immediately above the code that uses them: `PINCH_THRESHOLD`, `FRAME_PADDING`, `FREEZE_HOLD_MS`, `COUNTDOWN_SECONDS`, `GRID`, `LOAD_TIMEOUT_MS`, `STRIP_MAX_PHOTOS`, `SHATTER_COLS`, `DISPLACE_ANIM_MS` (`app.js:19-30, 226-236, 267, 763`).
- Landmark indices are grouped in a single `LM` object rather than scattered constants: `const LM = { WRIST: 0, THUMB_TIP: 4, ... }` (`app.js:6-17`). Follow this pattern when adding a related group of index/id constants — prefer a namespaced object over a flat list of prefixed constants.
- Tuning constants are colocated with the feature they affect (e.g. `SHATTER_COLS`/`SHATTER_ROWS`/`SHATTER_DURATION_MS` declared right before the `shatter` state object at `app.js:226-228`) rather than centralized in one config block. New features should follow this local-colocation pattern, not introduce a separate `config.js`.
- No TypeScript, no JSDoc type annotations, no runtime schema validation (no Zod/Yup/PropTypes). Shapes are implicit via object literal construction, e.g. a "piece" object: `{ row, col, canvas, w, h, x, y, placed: false, dragging: false }` (`app.js:671`). When adding new object shapes, follow this pattern: construct the full literal in one place with all fields explicit (including boolean flags defaulted), rather than building objects incrementally with optional/missing keys.
## Code Style
- No Prettier/ESLint config present in the repo. Style is hand-maintained but consistent:
- No linter configured (no `.eslintrc*`, no `eslint.config.*`, no `biome.json` found). New code should still avoid unused variables and follow the existing patterns manually since there's no automated enforcement.
- Large logical sections within `app.js` are marked with box-drawing comment banners:
## Import Organization
- Single external import block at the very top of `app.js`, sourced directly from a CDN URL (no local `node_modules`, no package manager):
- No path aliases exist (no bundler to support them). All references are either imported ES module bindings or `document.getElementById(...)` lookups cached once near the top of the file (`app.js:41-66`).
## Error Handling
- Network/model loading uses a `withTimeout(promise, ms, timeoutMessage)` wrapper that races a promise against a timeout and rejects with a descriptive `Error` (`app.js:423-429`). Use this helper for any new async operation that could hang (e.g. fetching a new external resource).
- Graceful degradation over hard failure: `initHandLandmarker` tries GPU delegate first, falls back to CPU delegate on failure, logging a warning via `console.warn("[PuzzleCam] ...", err)` before retrying (`app.js:431-486`). This tagged-warning pattern (`console.warn("[PuzzleCam] <message>:", err)`) is the established convention for non-fatal, logged failures — reuse the `[PuzzleCam]` tag prefix for any new warning logs.
- User-facing errors during boot are surfaced through dedicated UI functions rather than thrown/left unhandled: `showError(message)` sets `errorBanner.textContent` and displays it; `showLoaderError(message)` updates the loader text, turns it red, and reveals a retry button (`app.js:1203-1220`).
- `boot()` wraps the entire startup sequence in `try/catch`, differentiates errors by `err.name` (`"NotAllowedError"`, `"NotFoundError"`) to show tailored messages, and falls back to `err.message` or a generic string otherwise (`app.js:1222-1248`).
- A watchdog `setTimeout` guards against silent hangs during boot, firing a "taking too long" message if the try/catch hasn't resolved within `(LOAD_TIMEOUT_MS * 2) + 5000` ms, using a `settled` boolean flag to avoid firing after success (`app.js:1224-1247`). Reuse this settled-flag-plus-watchdog pattern for other long-running async flows that need a "stuck" fallback.
- Recoverable/optional operations use silent early-return guards rather than throwing: `if (!recorder.blob) return;`, `if (galleryEntries.length === 0) return null;` (`app.js:204, 272`).
- `MediaRecorder` setup is wrapped in `try/catch` with a `console.warn` fallback since recording is a non-critical enhancement — the app continues to function without video export if it fails (`app.js:178-194`).
## Logging
- All logs seen are `console.warn` tagged with `[PuzzleCam]`, used only for non-fatal, recoverable situations (GPU→CPU fallback, MediaRecorder unsupported) (`app.js:193, 463`).
- No logging library, no structured/JSON logging, no log levels beyond `warn`.
## Comments
- Sparse, purposeful comments — not comment-per-line. Comments explain *why*, not *what*, e.g. `// color version — saved to strip at the end` / `// B&W version — used for puzzle pieces while solving` (`app.js:640, 649`) clarify intent behind two near-identical code blocks that would otherwise look redundant.
- Section-banner comments (see Code Style above) substitute for a table of contents in the absence of multiple files.
- No JSDoc/TSDoc usage anywhere in the codebase. Do not introduce JSDoc annotations unless establishing a new project-wide convention deliberately.
## Function Design
- Simple functions take positional parameters (`dist2D(a, b)`, `toPixel(landmarkNorm)`).
- Functions with many optional/tunable inputs take a single destructured options object with defaults: `function playTone({ freq = 440, type = "sine", gain = 0.18, attack = 0.005, decay = 0.12, duration = 0.15 } = {})` (`app.js:73`). Use this pattern for any new function accepting more than ~3 optional parameters.
- Guard clauses return early with `null`/`false`/`undefined`/void rather than throwing, for expected "nothing to do" states: `if (galleryEntries.length === 0) return null;` (`app.js:272`), `function isStripFull() { return galleryEntries.length >= STRIP_MAX_PHOTOS; }` (`app.js:248-250`).
- Boolean predicate functions return a plain `true`/`false`, never truthy/falsy objects.
## Module Design (State, not Classes)
- No `class` declarations anywhere in `app.js`. Application state is modeled as plain mutable object literals declared with `const` (the object is const-bound but its properties are freely mutated): `const puzzle = { boardBox: null, pieces: [], solved: false, tileW: 0, tileH: 0 }`, `const drag = { activeHand: null, piece: null, offsetX: 0, offsetY: 0 }`, `const shatter = { active: false, startedAt: 0, fragments: [], pendingCanvas: null }`, `const recorder = { instance: null, chunks: [], blob: null }` (`app.js:168-172, 218-224, 229-234, 701`). When adding a new stateful subsystem, follow this exact pattern: one `const` object literal per subsystem, mutated in place by dedicated functions, rather than introducing a class or a global state-management library.
- A single top-level `let appState = "tracking";` string acts as the primary finite-state-machine variable, with allowed values `"tracking"`, `"countdown"`, `"puzzle"`, `"shattering"` (`app.js:216`, checked throughout `processResults`). New app-level states must be added as a new string literal checked in the same `if (appState === "...")` branching style inside `processResults` — do not introduce a separate state library.
- No exports at all — `app.js` is the sole module, self-contained, executed for its side effects (it calls `boot()` at the bottom, `app.js:1283`). There is no public API surface to document.
- DOM event listeners are attached at the bottom of the file after all function declarations, each guarded with an existence check on the element before attaching: `if (downloadVideoBtn) { downloadVideoBtn.addEventListener("click", downloadVideo); }` (`app.js:1256-1281`). Follow this guarded-attachment pattern for any new optional UI element (elements that may not exist in every markup variant, e.g. `guide.html` vs `index.html`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| DOM shell | Layout: video/canvas stage, HUD overlays, gallery sidebar, strip modal | `index.html` |
| Visual styling | All CSS (variables, layout, animations, HUD/gallery/modal styles) | `css/styles.css` |
| Audio engine | Procedural sound effects via Web Audio API (`playTone`, `playNoise`, `sound*`) | `app.js:69-145` |
| Video recorder | Captures canvas stream to WebM via `MediaRecorder` | `app.js:168-213` |
| Webcam bootstrap | Acquires `getUserMedia` stream, sizes canvas to video | `app.js:403-421` |
| Hand tracking init | Loads MediaPipe WASM + model, GPU→CPU fallback, timeout guard | `app.js:431-486` |
| Gesture detection | Pinch/fist detection from landmark distances | `app.js:494-511` |
| Framing logic | Computes bounding box from two index-finger tips | `app.js:521-533` |
| Countdown flow | 3-second countdown with beep + live color-preview inside frame | `app.js:541-585` |
| Photo capture & FX | Mirrors frame, crops, applies photobooth noise/contrast + vignette, splits into B&W (puzzle) and color (final) canvases | `app.js:594-699` |
| Puzzle engine | Tile slicing, shuffling, drag/snap/displace logic, solve detection | `app.js:701-905` |
| Shatter animation | Physics-like fragment explosion effect on puzzle completion | `app.js:989-1064` |
| Gallery / photo strip | Accumulates up to 3 solved photos as polaroids, renders strip, builds downloadable PNG | `app.js:236-360` |
| Main state machine | `processResults()` dispatches behavior per `appState` each frame | `app.js:1086-1191` |
| Render loop | Drives video draw + hand detection + state dispatch every animation frame | `app.js:1193-1201` |
| Boot / error handling | Orchestrates webcam + model init, loader UI, retry on failure | `app.js:1203-1283` |
## Pattern Overview
- Everything lives in one module-scoped closure (`app.js`) — functions, mutable state objects (`puzzle`, `drag`, `shatter`, `countdown`, `recorder`, `galleryEntries`), and DOM references are all top-level `const`/`let` bindings.
- State is explicit and centralized in a single string variable, `appState`, with four values: `"tracking"`, `"countdown"`, `"puzzle"`, `"shattering"`.
- Rendering is imperative and immediate-mode: every frame, `drawVideoFrame()` repaints the full canvas and then state-specific draw functions (`drawCountdownOverlay`, `drawBoardAndPieces`, `updateAndDrawShatter`) paint on top. There is no retained scene graph or virtual DOM.
- All computer-vision logic (hand landmark inference) happens per-frame via `handLandmarker.detectForVideo(videoEl, nowMs)`, called synchronously inside the render loop.
- No routing, no components, no client-side state management library (despite `README.md` describing Zustand/React/Supabase as **planned, not yet implemented** — see Anti-Patterns/Notes below).
## Layers
- Purpose: Static structural shell — video element, canvas stage, HUD badges, gallery sidebar, strip modal.
- Location: `index.html`
- Contains: Element IDs referenced by `app.js` via `document.getElementById`.
- Depends on: `css/styles.css` for visuals; `app.js` for all behavior.
- Used by: Nothing above it — this is the outermost layer.
- Purpose: All business logic — capture, gesture recognition, puzzle mechanics, audio, recording, gallery.
- Location: `app.js` (single 1283-line module)
- Contains: Constants/config (lines 6-30), audio engine, recorder, app state, webcam/model init, gesture math, puzzle engine, shatter FX, gallery/strip builder, main loop, boot sequence.
- Depends on: DOM elements from `index.html`, MediaPipe SDK from CDN, browser APIs (`getUserMedia`, `MediaRecorder`, `AudioContext`, `Canvas 2D`).
- Used by: Loaded directly by `index.html` as the sole script.
- Purpose: Visual design system — color tokens (CSS custom properties), layout (flex stage + gallery), HUD components, animations (flash, shatter, loader).
- Location: `css/styles.css`
- Contains: `:root` design tokens, layout rules, component-scoped classes matching `index.html` IDs/classes.
- Depends on: Nothing (no preprocessor, no CSS framework).
- Used by: `index.html` via `<link>`.
## Data Flow
### Primary Request Path (capture → puzzle → save)
### Recording Flow (parallel side-effect)
- All state lives in plain JS objects/variables at module scope: `appState` (string), `puzzle` (board/pieces/solved), `drag` (active pinch-drag), `shatter` (fragment animation), `countdown`, `freezeGate`, `lastSeenFrame`, `galleryEntries` (array, max 3), `recorder`.
- No persistence layer — all state is in-memory and lost on page reload. No localStorage/sessionStorage usage detected.
## Key Abstractions
- Purpose: Single source of truth for which "mode" the app is in, gating which draw/input-handling branch runs in `processResults()`.
- Examples: `app.js:216` (declaration), branches at `app.js:1101,1110,1111,1167,1169`.
- Pattern: String-typed state machine with 4 states: `tracking → countdown → puzzle → shattering → (tracking)`.
- Purpose: Represents each of the 9 puzzle tiles with position, canvas image data, and placement status.
- Examples: created in `finishCountdownAndCapture` (`app.js:667-673`), consumed throughout drag/snap/render functions.
- Pattern: Array of plain objects `{ row, col, canvas, w, h, x, y, placed, dragging }`.
- Purpose: Named indices into MediaPipe's 21-point hand landmark array (wrist, fingertips, MCP joints) for gesture math.
- Examples: `app.js:6-17`, used by `isPinching` (`app.js:494`), `isFist` (`app.js:498`).
- Pattern: Flat lookup object mapping semantic names to landmark indices.
- Purpose: The video/canvas is drawn horizontally mirrored (`drawVideoFrame`, `app.js:907`) to feel like a mirror to the user, so all landmark coordinates must be mirrored (`mirrorLandmarkX`, `app.js:517`) before being used for hit-testing against the mirrored canvas.
- Examples: Every landmark consumed for interaction (frame box, drag position, skeleton overlay) is passed through `mirrorLandmarkX()` first.
- Pattern: Coordinate-space adapter function applied consistently before any pixel-space calculation.
## Entry Points
- Location: `index.html:81`
- Triggers: Page load.
- Responsibilities: Instantiates the `<script type="module" src="./app.js">` which runs top-level code (DOM lookups, constant definitions, event listener registration) and calls `boot()` (`app.js:1283`) at the bottom of the file.
- Location: `app.js:1222`
- Triggers: Called unconditionally at module load, and again from the loader's retry button (`app.js:1250`).
- Responsibilities: Orchestrates webcam permission request, MediaPipe model download (with GPU→CPU fallback and timeout watchdog), and starts the render loop on success; shows contextual error messages on failure (`NotAllowedError`, `NotFoundError`, timeout).
## Architectural Constraints
- **Threading:** Single-threaded. All hand detection, canvas drawing, and gesture logic run synchronously on the main thread inside `requestAnimationFrame` callbacks — no Web Workers. MediaPipe's WASM inference itself may use GPU delegate internally, but orchestration is main-thread.
- **Global state:** The entire app is one large module-level closure. Mutable singletons: `puzzle`, `drag`, `shatter`, `countdown`, `freezeGate`, `lastSeenFrame`, `recorder`, `galleryEntries`, `appState`, `handLandmarker`, `fistHoldCounter`, `lastCountdownN` — all declared at top level of `app.js` and mutated freely by many functions. There is no encapsulation boundary between subsystems (audio, puzzle, gallery, recording all read/write shared globals).
- **Circular imports:** None — single file, no internal module graph.
- **External runtime dependency:** MediaPipe (`FilesetResolver`, `HandLandmarker`) is imported from a CDN URL at the top of `app.js` (`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14`), and the hand-landmarker model itself is fetched at runtime from `storage.googleapis.com`. The app is non-functional offline or if either CDN is unreachable (mitigated only by `LOAD_TIMEOUT_MS` + retry UI, not by a fallback/local copy).
## Anti-Patterns
### Monolithic single-file module
### Unencapsulated shared mutable state
## Error Handling
- `withTimeout()` (`app.js:423`) wraps promises (WASM load, model load) with a race against a timeout, converting hangs into rejected promises with descriptive messages.
- `initHandLandmarker()` (`app.js:431`) tries GPU delegate first, falls back to CPU delegate on failure, and only throws if both fail.
- `boot()` catches all init errors and maps known `DOMException` names (`NotAllowedError`, `NotFoundError`) to user-friendly messages via `showLoaderError()` (`app.js:1208`); unknown errors fall back to `err.message`.
- `MediaRecorder` creation is wrapped in try/catch with a `console.warn` fallback (`app.js:178-194`) — recording failure does not block gameplay.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
