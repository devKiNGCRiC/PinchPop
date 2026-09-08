# Codebase Concerns

**Analysis Date:** 2026-09-08

## Tech Debt

**No build tooling, package manifest, or dependency management:**
- Issue: The entire app is three static files (`index.html`, `app.js`, `css/styles.css`) plus `guide.html`. There is no `package.json`, `tsconfig.json`, bundler, or lockfile. The only dependency (`@mediapipe/tasks-vision@0.10.14`) is loaded at runtime from a CDN (`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14`) via a bare ESM `import` in `app.js:1-4`, and the hand-tracking model itself is fetched from `https://storage.googleapis.com/mediapipe-models/...hand_landmarker.task` (`app.js:449`, `app.js:469`).
- Files: `app.js:1-4`, `app.js:436-486`
- Impact: The app cannot run offline or in any environment without internet access to two specific third-party hosts. There's no dependency pinning/lockfile beyond the version string embedded in the URL, no local fallback bundle, and no way to audit/update the dependency via normal tooling (npm audit, Dependabot, etc.).
- Fix approach: Introduce a package manager (npm/pnpm) with the MediaPipe package installed locally and bundled (this aligns with the React/Vite migration already planned in `README.md:187-199`), or at minimum self-host the WASM/model assets with a documented fallback CDN.

**Monolithic single-file architecture:**
- Issue: `app.js` is 1283 lines and contains every concern of the app in one flat module-scope: audio synthesis, WebRTC/webcam setup, MediaPipe integration, gesture detection, puzzle game logic, drag-and-drop physics, canvas rendering, shatter particle animation, gallery/polaroid compositing, video recording, and DOM/UI wiring — all as free functions operating on shared top-level mutable state (`puzzle`, `drag`, `shatter`, `countdown`, `freezeGate`, `lastSeenFrame`, `galleryEntries`, `recorder`, `appState`).
- Files: `app.js` (entire file)
- Impact: There is no separation of concerns, no unit-testable modules, and every change risks touching unrelated behavior because state is shared implicitly across ~30 top-level functions. This directly contradicts the modular architecture the README says is planned (`README.md:464-508` — `gestureEngine.ts`, `puzzleEngine.ts`, `cameraEngine.ts`, etc.) but that migration has not started.
- Fix approach: Extract cohesive modules (audio engine, camera/tracking, puzzle state machine, renderer, gallery/export) with explicit interfaces before adding new features, per the roadmap in `README.md:464-530`.

**State machine implemented via ad-hoc string flag instead of formal FSM:**
- Issue: `appState` (`app.js:216`) is a bare string (`"tracking" | "countdown" | "puzzle" | "shattering"`) checked with scattered `if (appState === "...")` branches throughout `processResults()` (`app.js:1086-1191`) and other functions. Valid transitions are not centrally defined or validated.
- Files: `app.js:216`, `app.js:1086-1191`, `app.js:541-547`, `app.js:619-699`, `app.js:989-1027`, `app.js:1054-1064`
- Impact: It's easy to introduce an invalid state transition (e.g., forgetting to reset `appState` on an error path) that silently leaves the UI stuck; there is no exhaustive-check or default/error branch for unrecognized states.
- Fix approach: Model state transitions explicitly (e.g., a small state machine object with defined `enter`/`exit` handlers per state) so invalid transitions fail loudly during development.

**Hardcoded gameplay constants with no runtime configurability:**
- Issue: Core gameplay parameters — grid size (`GRID = 3`, `app.js:25`), photo strip capacity (`STRIP_MAX_PHOTOS = 3`, `app.js:236`), pinch/fist detection thresholds (`PINCH_THRESHOLD = 0.055`, `app.js:19`; `isFist()` heuristic, `app.js:498-511`) — are magic numbers baked into the module with no config surface, URL params, or settings UI.
- Files: `app.js:19-30`, `app.js:236`
- Impact: Any change to difficulty, puzzle size, or strip length requires editing source and redeploying. The `index.html:26` progress label also hardcodes the string `"0 / 9 pieces placed"` (9 = 3×3), which would silently go stale if `GRID` were changed without updating the HTML.
- Fix approach: Centralize gameplay config in one place (or expose via query params/settings) and derive any static HTML strings from the same constant rather than duplicating `9`.

## Known Bugs

**Hand identity is not tracked across frames, only array order:**
- Symptoms: During the puzzle phase, each detected hand is labeled `"A"` or `"B"` purely by its index in the per-frame `result.landmarks` array (`app.js:1170-1177`: `const label = i === 0 ? "A" : "B"`). MediaPipe's `HandLandmarker` does not guarantee stable ordering of hands between frames, especially when a hand briefly leaves the frame, hands cross, or detection confidence dips and one hand drops out.
- Files: `app.js:1169-1190`, `app.js:803-843`
- Trigger: Drag a piece with the left hand while both hands are visible, then briefly occlude/remove the right hand and reintroduce it, or cross hands over each other — array order can flip, causing `drag.activeHand` (bound to label `"A"`/`"B"`) to suddenly control the wrong physical hand's piece, or for the piece to be dropped/picked up unexpectedly.
- Workaround: None in code; a `handedness` field is available from the MediaPipe result (`result.handedness`) but is never consulted (`app.js:1093` only reads `result.landmarks`).

**Pending strip-modal popup can fire after a mid-flow reset without full guard against re-entry:**
- Symptoms: `showStripComplete()` (`app.js:252-256`) schedules `showStripModal()` via `setTimeout(..., 900)`. The timer handle is never stored, so `hideStripComplete()`/`resetEverything()` cannot cancel it. `buildStripCanvas()` happens to guard on `galleryEntries.length === 0` (`app.js:272`), so a full reset during the 900ms window doesn't currently crash — but if a user starts a *new* strip within that window and adds one photo before the timer fires, the modal will pop up prematurely showing an incomplete/wrong strip state.
- Files: `app.js:252-256`, `app.js:308-315`, `app.js:317-329`
- Trigger: Complete a strip, immediately click "reset all" and capture a new photo within under 900ms.
- Workaround: None; relies on timing coincidence rather than an explicit cancel token.

**`resetPuzzleOnly()` does not cancel in-flight `requestAnimationFrame` displacement animations:**
- Symptoms: `animateDisplacement()` (`app.js:765-785`) recursively schedules `requestAnimationFrame(step)` and mutates `piece` objects directly, with no cancellation handle. `resetPuzzleOnly()` (`app.js:362-381`) clears `puzzle.pieces = []` but any in-flight `step()` closures still hold references to the old `piece` object and will keep calling `clampPieceToBoard(piece)` (which reads `puzzle.boardBox`, now `null`) once the animation completes after a reset.
- Files: `app.js:762-785`, `app.js:362-381`, `app.js:845-849`
- Trigger: Trigger a piece displacement (drop a piece onto an occupied cell) and immediately make a fist to force a reset before the ~220ms animation (`DISPLACE_ANIM_MS`) completes.
- Workaround: `clampPieceToBoard` will throw (`box.x` on `null`) inside a `requestAnimationFrame` callback, which is silently swallowed by the browser (uncaught in rAF callbacks don't crash the app but do log a console error and abandon that piece's final position) — no user-visible crash, but a silent JS error and a piece left in a stale position.

## Security Considerations

**Third-party CDN and Google Cloud Storage URLs loaded with no Subresource Integrity (SRI):**
- Risk: `app.js` imports MediaPipe's runtime, WASM binaries, and the hand-tracking ML model directly from `cdn.jsdelivr.net` and `storage.googleapis.com` (`app.js:1-4`, `app.js:436`, `app.js:449`, `app.js:469`) with no SRI hashes and no self-hosted fallback. A compromised CDN or MITM on these hosts could serve modified JS/WASM that executes with full page privileges (including camera access already granted).
- Files: `app.js:1-4`, `app.js:431-486`
- Current mitigation: None (no `integrity` attribute possible on dynamic `import()`/fetch calls as used here; would need a Content-Security-Policy allowlist at minimum).
- Recommendations: Self-host the MediaPipe WASM/model assets and bundle the JS dependency locally (also solves the offline/tech-debt issue above), or add a strict CSP `script-src`/`connect-src` allowlist restricted to the exact hosts in use.

**No Content-Security-Policy or other security headers:**
- Risk: `index.html` has no `<meta http-equiv="Content-Security-Policy">` and there's no server configuration in the repo (this is a static site with no server code), so whatever host serves it determines headers. Given the app requests camera access and loads remote scripts, an XSS vector (however unlikely in this small, mostly-static codebase) would have unrestricted script execution.
- Files: `index.html`, `guide.html`
- Current mitigation: None visible in-repo.
- Recommendations: When deploying (per `README.md:214-228` — GitHub → Vercel), configure CSP, `X-Content-Type-Options`, and `Permissions-Policy` (to scope camera access) at the hosting layer.

**Planned Supabase/auth backend not yet scoped for secrets handling:**
- Risk: `README.md:200-213` and `README.md:598-606` describe a planned Supabase backend (auth, DB, storage) but there is no `.env.example`, no secrets-handling convention, and no RLS policy documentation yet in the repo. This isn't a current vulnerability (no backend code exists) but is a concern for the next phase of work.
- Files: `README.md:550-565` (privacy section acknowledges RLS is needed but nothing is implemented)
- Current mitigation: N/A — feature not built yet.
- Recommendations: When backend work begins, establish `.env.example`, ensure `.env` is gitignored from the start, and design RLS policies before any user data is written.

## Performance Bottlenecks

**Per-pixel JS loops run synchronously on the main thread for photo effects:**
- Problem: `applyPhotoboothEffect()` (`app.js:594-609`) iterates every pixel of the captured photo (`d.length / 4` pixels) calling `gaussianNoise()` (`app.js:587-592`, which itself does two `Math.random()` calls, a `sqrt`, `log`, `cos`) per channel per pixel. This runs twice per capture (once for the color version, once for the B&W puzzle version) at `app.js:641-653`, entirely on the main thread, blocking rendering and gesture-tracking during that window.
- Files: `app.js:594-609`, `app.js:587-592`, `app.js:640-653`
- Cause: No use of `OffscreenCanvas`/Web Worker, no vectorized/typed-array-optimized noise generation, no downsampled preview — full-resolution `getImageData`/`putImageData` cost scales with the cropped frame's pixel count (which itself scales with how far apart the user's hands are when framing the shot).
- Improvement path: Move the noise/contrast pass to a Web Worker via `OffscreenCanvas`, or precompute a noise texture once and reuse via canvas composite operations instead of per-pixel JS math.

**`getImageData`/`putImageData` on the live tracking box runs every animation frame:**
- Problem: `applyColorInsideBox()` (`app.js:915-924`) is called every frame during the `"tracking"` state whenever a valid two-hand frame box exists (`app.js:1139-1144`) or during the grace-period fallback (`app.js:1103-1105`, `app.js:1157-1161`) and during the entire 3-second countdown (`app.js:558`, called every frame from `drawCountdownOverlay`). Each call does a full `getImageData` + per-pixel `applyPhotoboothEffect` + `putImageData` over the live frame box, at up to 60fps.
- Files: `app.js:915-924`, `app.js:556-558`, `app.js:1139-1144`
- Cause: The canvas context is created with `willReadFrequently: true` (`app.js:43`, a reasonable mitigation) but the underlying per-pixel noise computation (see above) is still O(pixels) JS math executed continuously, not just at capture time — this is done purely for a live preview effect.
- Improvement path: Use a cheaper live-preview effect (CSS/canvas filter, e.g. `ctx.filter = "contrast(...) brightness(...)"` which is GPU-accelerated) for the real-time preview, and reserve the expensive per-pixel noise pass for the final captured stills only.

**No frame-rate or resolution throttling for low-end devices:**
- Problem: `initWebcam()` requests `1280x720` `ideal` (`app.js:408`) and `renderLoop()` runs unthrottled via `requestAnimationFrame` (`app.js:1193-1201`), performing hand detection (`handLandmarker.detectForVideo`) every frame regardless of device capability. The GPU→CPU delegate fallback (`app.js:462-485`) only affects the ML model, not overall canvas rendering load.
- Files: `app.js:403-421`, `app.js:1193-1201`
- Cause: No adaptive quality/frame-skipping logic.
- Improvement path: Add frame-skipping for hand detection on lower-end/CPU-delegate devices (e.g., detect every 2nd frame) and/or expose a lower resolution option.

## Fragile Areas

**Gesture-detection heuristics are simple Euclidean-distance thresholds with no calibration:**
- Files: `app.js:19` (`PINCH_THRESHOLD = 0.055`), `app.js:494-496` (`isPinching`), `app.js:498-511` (`isFist`)
- Why fragile: `isPinching` compares normalized (0–1) landmark distance between thumb and index tip to a single fixed threshold, with no adjustment for hand size, distance from camera, or per-user calibration. `isFist` uses a coarse heuristic (finger tip closer to wrist than its MCP joint, for ≥4 of 4 fingers) that can misfire for partially closed hands, hands at odd angles, or fast motion blur.
- Safe modification: Any change to camera resolution, `FRAME_PADDING`, or expected user distance from camera should be paired with re-testing gesture thresholds; there's no calibration UI to fall back on.
- Test coverage: None — there are no automated tests for gesture detection logic at all (see Test Coverage Gaps).

**Direct DOM manipulation mixed with imperative state arrays (no framework/reactivity):**
- Files: `app.js:317-329` (`resetEverything` — manually clears `innerHTML`, re-appends a specific empty-state node), `app.js:353-360` (`renderGalleryThumb` — inserts DOM nodes directly), `app.js:239-246` (`addToGallery`)
- Why fragile: Gallery state (`galleryEntries` array) and DOM (`galleryStrip` children) must be kept in sync manually. `resetEverything()` clears `galleryStrip.innerHTML = ""` then re-appends the specific `galleryEmpty` node reference (`app.js:319-324`) — if that node were ever removed/replaced elsewhere, this silently breaks the empty-state UI.
- Safe modification: Any new gallery feature must remember to update both the `galleryEntries` array and the DOM in the same place; there's no single source of truth/render function.
- Test coverage: None.

**Puzzle piece occupancy checks use pixel-center hit-testing with float positions, not a piece->cell map:**
- Files: `app.js:728-761` (`displaceCellOccupant`), `app.js:703-710` (`isNearOwnCell`)
- Why fragile: "Which piece occupies which cell" is recomputed on demand by checking whether a piece's center point falls within a cell's pixel bounds, rather than maintaining an explicit grid→piece index. Floating-point drift from animated displacement (`animateDisplacement`, `app.js:765-785`) or the jitter offset applied to displaced pieces (`app.js:758-759`) could in rare cases place a piece's center exactly on a cell boundary or in an ambiguous position between cells.
- Safe modification: Prefer deriving occupancy from a maintained `row,col -> piece` map rather than re-deriving from pixel geometry each time a piece moves.
- Test coverage: None.

## Scaling Limits

**Gallery/photo-strip capacity hardcoded to 3 photos, held entirely in memory as `<canvas>` elements:**
- Current capacity: `STRIP_MAX_PHOTOS = 3` (`app.js:236`); all captured canvases are retained in the `galleryEntries` array (`app.js:237`) and never released until `resetEverything()`.
- Limit: Increasing `STRIP_MAX_PHOTOS` without changes would keep proportionally more full-resolution `<canvas>` elements (each holding the cropped, effect-processed photo plus a polaroid render) in memory for the whole session — no pagination, compression, or eviction strategy exists.
- Scaling path: If the roadmap's "Personal Gallery" (README.md:341-366, storing many photos in Supabase Storage) is implemented, the in-memory-canvas model used here won't translate directly — captured images should be serialized (e.g., to blobs) and uploaded/discarded rather than held as live canvas objects indefinitely.

## Dependencies at Risk

**Single external dependency pinned only via CDN URL string, not a manifest:**
- Risk: `@mediapipe/tasks-vision@0.10.14` is referenced by hardcoded version string in three separate URLs (`app.js:4`, `app.js:436`, `app.js:449`/`469` for the model, which is unversioned in the URL path `.../hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`). There's no single place to bump the version, and no lockfile to pin exact resolved assets.
- Impact: If jsdelivr's cached copy of `0.10.14` is ever purged/deprecated, or if Google's model storage path changes, the app breaks at runtime with only the generic timeout error messages (`app.js:439`, `459`, `480`) surfaced to the user — no automated detection of this in CI (there is no CI).
- Migration plan: Move to an npm-installed, bundled copy of `@mediapipe/tasks-vision` (consistent with the Vite/React migration already planned in `README.md`), pin via `package-lock.json`, and self-host the `.task` model file with a version-stamped filename.

## Missing Critical Features

**No accessibility or non-gesture fallback control path:**
- Problem: 100% of interactions (framing, capture, drag/drop, save) require webcam-based hand gestures (`README.md:56-79`). There is no keyboard, mouse, or touch fallback anywhere in `app.js` or `index.html` for users without a webcam, with motor impairments, or on devices where gesture tracking fails.
- Blocks: Any user who cannot present clear hand gestures to a webcam (lighting conditions, camera quality, physical ability, browser without camera permission) is fully locked out of the app with only an error banner (`app.js:1203-1206`) and no alternative input method.

**No automated tests, linter, or CI pipeline of any kind:**
- Problem: No `package.json`, no test framework, no ESLint/Prettier config, no GitHub Actions workflow (`.github/` directory absent) exist in the repo. All the game logic — gesture thresholds, puzzle-piece snapping, occupant displacement, state transitions — is unverified except by manual play-testing.
- Blocks: Safe refactoring (e.g., extracting modules per the planned architecture in `README.md:464-508`) is high-risk without any regression safety net.

## Test Coverage Gaps

**Entire codebase — 0% automated test coverage:**
- What's not tested: Everything. Gesture detection (`isPinching`, `isFist`), puzzle state transitions (`finishCountdownAndCapture`, `handleDragForHand`, `displaceCellOccupant`, `reconcilePlacedState`), canvas compositing (`buildStripCanvas`, `makePolaroid`), and UI wiring are all untested.
- Files: `app.js` (entire file)
- Risk: Any refactor (including the planned React/TypeScript rewrite in `README.md:187-199`) risks silently regressing gameplay behavior (e.g., the pinch threshold, fist-hold-to-save gesture, or piece-snapping tolerance) with no automated way to detect it.
- Priority: High — should be addressed before or during the planned architecture migration, since a rewrite without characterization tests around the existing gesture/puzzle logic risks losing subtle tuned behavior (e.g., `SNAP_DISTANCE_RATIO`, `FIST_HOLD_FRAMES`, `FREEZE_HOLD_MS` were clearly tuned via playtesting per commit history — `git log` shows `894a111 Increase snap distance for easier puzzle solving`).

## Licensing / Attribution Concern

**No LICENSE file in the repository, while original author's branding remains embedded in the UI:**
- Issue: There is no `LICENSE`/`LICENSE.md` file anywhere in the repo. `README.md:669-679` states the project "was initially developed from the existing PuzzleCam prototype by Unnati-23" and that "the original project's license and attribution requirements should be reviewed and preserved where applicable" — indicating this review has not been completed. Meanwhile, `index.html:6,18,68` and all of `guide.html` (title, nav brand, hero label, footer copyright, and multiple outbound links) still display the original author's name, copyright notice ("© 2026 aiwithunnati — all rights reserved"), and original GitHub repo (`https://github.com/Unnati-23/puzzlecam`) rather than PinchPop's own branding.
- Files: `index.html:6`, `index.html:18`, `index.html:68`, `guide.html:6`, `guide.html:411`, `guide.html:421`, `guide.html:592-593`, `README.md:669-679`
- Impact: Legal ambiguity — the repo is being developed and presumably distributed under a new name ("PinchPop") without a resolved license, and the live UI's copyright notice contradicts the README's framing of this as a distinct project.
- Fix approach: Confirm the original PuzzleCam repository's license terms, add a `LICENSE` file to this repo reflecting compliant terms (and any required attribution notice, e.g., in a `NOTICE` or `THIRD_PARTY_LICENSES` file), and decide whether `index.html`/`guide.html` branding should be updated to reflect PinchPop as the current product name.

---

*Concerns audit: 2026-09-08*
