<!-- refreshed: 2026-09-08 -->
# Architecture

**Analysis Date:** 2026-09-08

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                         Browser Runtime                      │
├──────────────────────────┬────────────────────────────────────┤
│      DOM / HTML Shell     │        `index.html`                │
│  video, canvas, HUD, aside│                                     │
└──────────────┬───────────┴────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Single Module: `app.js`                    │
│  ┌───────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │  Capture   │ │  Gesture   │ │   Puzzle     │ │  Gallery /│ │
│  │  Pipeline  │ │  Detection │ │   Engine     │ │  Strip    │ │
│  └─────┬──────┘ └─────┬──────┘ └──────┬───────┘ └─────┬─────┘ │
│        └──────────────┴───────────────┴───────────────┘       │
│                     `renderLoop()` (rAF)                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│         External CDN Dependency (loaded at runtime)           │
│   `@mediapipe/tasks-vision` (FilesetResolver, HandLandmarker) │
│   WASM + hand_landmarker.task model fetched from Google CDN   │
└─────────────────────────────────────────────────────────────┘
```

There is no build step, bundler, server, or backend. The entire application is a static HTML page (`index.html`) that loads one ES module (`app.js`) via `<script type="module">`, styled by one stylesheet (`css/styles.css`). MediaPipe's vision SDK is imported directly from a CDN URL inside `app.js` — there is no `package.json`, no `node_modules`, and no local dependency management.

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

**Overall:** Single-file finite-state-machine pattern driven by a `requestAnimationFrame` render loop, operating directly on the DOM/Canvas with no framework, no components, and no build tooling.

**Key Characteristics:**
- Everything lives in one module-scoped closure (`app.js`) — functions, mutable state objects (`puzzle`, `drag`, `shatter`, `countdown`, `recorder`, `galleryEntries`), and DOM references are all top-level `const`/`let` bindings.
- State is explicit and centralized in a single string variable, `appState`, with four values: `"tracking"`, `"countdown"`, `"puzzle"`, `"shattering"`.
- Rendering is imperative and immediate-mode: every frame, `drawVideoFrame()` repaints the full canvas and then state-specific draw functions (`drawCountdownOverlay`, `drawBoardAndPieces`, `updateAndDrawShatter`) paint on top. There is no retained scene graph or virtual DOM.
- All computer-vision logic (hand landmark inference) happens per-frame via `handLandmarker.detectForVideo(videoEl, nowMs)`, called synchronously inside the render loop.
- No routing, no components, no client-side state management library (despite `README.md` describing Zustand/React/Supabase as **planned, not yet implemented** — see Anti-Patterns/Notes below).

## Layers

**Presentation (DOM/HUD):**
- Purpose: Static structural shell — video element, canvas stage, HUD badges, gallery sidebar, strip modal.
- Location: `index.html`
- Contains: Element IDs referenced by `app.js` via `document.getElementById`.
- Depends on: `css/styles.css` for visuals; `app.js` for all behavior.
- Used by: Nothing above it — this is the outermost layer.

**Application logic (`app.js`):**
- Purpose: All business logic — capture, gesture recognition, puzzle mechanics, audio, recording, gallery.
- Location: `app.js` (single 1283-line module)
- Contains: Constants/config (lines 6-30), audio engine, recorder, app state, webcam/model init, gesture math, puzzle engine, shatter FX, gallery/strip builder, main loop, boot sequence.
- Depends on: DOM elements from `index.html`, MediaPipe SDK from CDN, browser APIs (`getUserMedia`, `MediaRecorder`, `AudioContext`, `Canvas 2D`).
- Used by: Loaded directly by `index.html` as the sole script.

**Styling (`css/styles.css`):**
- Purpose: Visual design system — color tokens (CSS custom properties), layout (flex stage + gallery), HUD components, animations (flash, shatter, loader).
- Location: `css/styles.css`
- Contains: `:root` design tokens, layout rules, component-scoped classes matching `index.html` IDs/classes.
- Depends on: Nothing (no preprocessor, no CSS framework).
- Used by: `index.html` via `<link>`.

## Data Flow

### Primary Request Path (capture → puzzle → save)

1. `boot()` initializes webcam (`initWebcam`, `app.js:403`) and hand tracking model (`initHandLandmarker`, `app.js:431`), then starts `renderLoop()` (`app.js:1193`).
2. Each animation frame, `renderLoop()` draws the mirrored video frame and calls `handLandmarker.detectForVideo()`, passing the result to `processResults()` (`app.js:1086`).
3. In `"tracking"` state, `processResults()` looks for two hands, computes a frame box from both index fingertips (`computeHandFrame`, `app.js:521`), tints that region with the photobooth filter live (`applyColorInsideBox`, `app.js:915`), and watches for a sustained two-hand pinch (`freezeGate`) to trigger `startCountdown()` (`app.js:541`).
4. In `"countdown"` state, `drawCountdownOverlay()` (`app.js:549`) ticks down 3→1 with beeps, then calls `finishCountdownAndCapture()` (`app.js:619`) once the timer elapses.
5. `finishCountdownAndCapture()` mirrors and crops the current video frame, applies the photobooth filter twice (color version for the final photo, B&W version for puzzle pieces), slices the crop into a `GRID × GRID` (3×3) tile array, shuffles tile positions, and transitions `appState` to `"puzzle"`. It also calls `startRecording()` (`app.js:174`) to begin capturing the canvas as video.
6. In `"puzzle"` state, per-hand pinch state drives `handleDragForHand()` (`app.js:803`), which picks up/drags/drops puzzle pieces, snapping to the correct cell (`snapPieceToCell`, `app.js:721`) or displacing an occupying piece (`displaceCellOccupant`, `app.js:728`). `drawBoardAndPieces()` (`app.js:851`) repaints the board and pieces every frame.
7. When all pieces are `placed`, `puzzle.solved` becomes `true`. A closed-fist gesture held for `FIST_HOLD_FRAMES` (`isFist`, `app.js:498`) calls `handleFistReset()` (`app.js:1066`), which — if solved — triggers `startShatter()` (`app.js:989`), transitioning `appState` to `"shattering"`.
8. `updateAndDrawShatter()` (`app.js:1029`) animates fragment physics each frame until `SHATTER_DURATION_MS` elapses, then `finishShatter()` (`app.js:1054`) adds the full-color photo to `galleryEntries` via `addToGallery()` (`app.js:239`) and resets puzzle state (`resetPuzzleOnly`, `app.js:362`), returning `appState` to `"tracking"`.
9. Once 3 photos are collected (`STRIP_MAX_PHOTOS`), `showStripComplete()` (`app.js:252`) enables the strip modal, which composites all polaroids into a single canvas (`buildStripCanvas`, `app.js:271`) for preview/download.

### Recording Flow (parallel side-effect)

1. `startRecording()` is called when a puzzle begins (`finishCountdownAndCapture`) — captures `canvas.captureStream(30)` into a `MediaRecorder`.
2. `stopRecording()` is called on shatter start (`startShatter`) or puzzle reset (`resetPuzzleOnly`).
3. On `MediaRecorder.onstop`, the recorded blob is stored on the module-level `recorder` object and the "download video" button is enabled.

**State Management:**
- All state lives in plain JS objects/variables at module scope: `appState` (string), `puzzle` (board/pieces/solved), `drag` (active pinch-drag), `shatter` (fragment animation), `countdown`, `freezeGate`, `lastSeenFrame`, `galleryEntries` (array, max 3), `recorder`.
- No persistence layer — all state is in-memory and lost on page reload. No localStorage/sessionStorage usage detected.

## Key Abstractions

**appState (finite state machine):**
- Purpose: Single source of truth for which "mode" the app is in, gating which draw/input-handling branch runs in `processResults()`.
- Examples: `app.js:216` (declaration), branches at `app.js:1101,1110,1111,1167,1169`.
- Pattern: String-typed state machine with 4 states: `tracking → countdown → puzzle → shattering → (tracking)`.

**puzzle.pieces (tile model):**
- Purpose: Represents each of the 9 puzzle tiles with position, canvas image data, and placement status.
- Examples: created in `finishCountdownAndCapture` (`app.js:667-673`), consumed throughout drag/snap/render functions.
- Pattern: Array of plain objects `{ row, col, canvas, w, h, x, y, placed, dragging }`.

**Landmark index constants (`LM`):**
- Purpose: Named indices into MediaPipe's 21-point hand landmark array (wrist, fingertips, MCP joints) for gesture math.
- Examples: `app.js:6-17`, used by `isPinching` (`app.js:494`), `isFist` (`app.js:498`).
- Pattern: Flat lookup object mapping semantic names to landmark indices.

**Mirroring convention:**
- Purpose: The video/canvas is drawn horizontally mirrored (`drawVideoFrame`, `app.js:907`) to feel like a mirror to the user, so all landmark coordinates must be mirrored (`mirrorLandmarkX`, `app.js:517`) before being used for hit-testing against the mirrored canvas.
- Examples: Every landmark consumed for interaction (frame box, drag position, skeleton overlay) is passed through `mirrorLandmarkX()` first.
- Pattern: Coordinate-space adapter function applied consistently before any pixel-space calculation.

## Entry Points

**`index.html` → `app.js` (module script):**
- Location: `index.html:81`
- Triggers: Page load.
- Responsibilities: Instantiates the `<script type="module" src="./app.js">` which runs top-level code (DOM lookups, constant definitions, event listener registration) and calls `boot()` (`app.js:1283`) at the bottom of the file.

**`boot()`:**
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

**What happens:** All 1283 lines of application logic — audio, recording, gesture math, puzzle engine, gallery, state machine, boot sequence — live in one `app.js` file with no internal module boundaries.
**Why it's wrong:** Any change (e.g., tweaking puzzle snap tolerance) requires understanding the entire file's shared mutable state; there's no way to test or reason about one subsystem (e.g., the audio engine) in isolation.
**Do this instead:** If/when this codebase is split into modules (per the "Planned Project Structure" in `README.md`: `game/gestureEngine.ts`, `puzzleEngine.ts`, `audioEngine.ts`, etc.), keep functions in their target files pure with respect to shared state — pass `puzzle`/`appState` explicitly rather than importing them as globals.

### Unencapsulated shared mutable state

**What happens:** Objects like `puzzle`, `drag`, and `shatter` are read and written directly by many unrelated functions (e.g., `handleFistReset` mutates `shatter.pendingCanvas`, `finishShatter` reads it, `resetPuzzleOnly` mutates `puzzle.*` and `drag.*` and `shatter.*` all at once — `app.js:362-381`).
**Why it's wrong:** There is no single place that owns a given piece of state's lifecycle, making it easy to introduce inconsistent state (e.g., forgetting to reset `fistHoldCounter` in a new code path) as the file grows.
**Do this instead:** Group related state and its mutators together (e.g., a `PuzzleController` object/module with methods), rather than scattering `puzzle.x = y` assignments throughout unrelated functions.

## Error Handling

**Strategy:** Try/catch around async initialization (`boot()`, `app.js:1222`) with a watchdog timeout and user-facing retry button; no error handling for per-frame runtime errors (a thrown exception inside `renderLoop()` or `processResults()` would silently stop the render loop with no recovery).

**Patterns:**
- `withTimeout()` (`app.js:423`) wraps promises (WASM load, model load) with a race against a timeout, converting hangs into rejected promises with descriptive messages.
- `initHandLandmarker()` (`app.js:431`) tries GPU delegate first, falls back to CPU delegate on failure, and only throws if both fail.
- `boot()` catches all init errors and maps known `DOMException` names (`NotAllowedError`, `NotFoundError`) to user-friendly messages via `showLoaderError()` (`app.js:1208`); unknown errors fall back to `err.message`.
- `MediaRecorder` creation is wrapped in try/catch with a `console.warn` fallback (`app.js:178-194`) — recording failure does not block gameplay.

## Cross-Cutting Concerns

**Logging:** `console.warn` only, used for two non-fatal failure paths (GPU delegate fallback `app.js:463`, MediaRecorder init failure `app.js:193`). No structured logging, no log levels, no remote error reporting.

**Validation:** Minimal — mostly geometric guards (e.g., `frameBox.width > 4 && frameBox.height > 4` at `app.js:1139`, `frameBox.width > 40 && frameBox.height > 40` at `app.js:1146`) to avoid acting on degenerate hand-frame boxes. No input validation in the traditional sense since there is no user-supplied data beyond camera frames.

**Authentication:** None implemented. `README.md` describes planned Supabase Auth as future work; current code has no accounts, sessions, or auth of any kind.

---

*Architecture analysis: 2026-09-08*
