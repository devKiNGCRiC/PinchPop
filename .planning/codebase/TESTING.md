# Testing Patterns

**Analysis Date:** 2026-09-08

## Test Framework

**Runner:**
- None. There is no `package.json`, no `node_modules`, no test runner configuration of any kind (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `karma.conf.*` — none present in the repository).
- No `.test.js`, `.spec.js`, `__tests__/`, or `test/` directory exists anywhere in the repo (confirmed via `find . -iname "*.test.*" -o -iname "*.spec.*"` returning no results).

**Assertion Library:**
- Not applicable — no test framework installed.

**Run Commands:**
```bash
# No test command exists. There is no package.json / npm scripts.
# To run the app locally for manual verification, serve the static files, e.g.:
python -m http.server 8000
# or
npx serve .
# then open http://localhost:8000/index.html and grant camera permission.
```

## Test File Organization

**Location:** Not applicable — no tests exist.

**Naming:** Not applicable.

**Structure:** Not applicable.

## Current Verification Method

This project is verified manually/visually, not through automated tests:
- `index.html` is opened directly in a browser (must be served over HTTP/HTTPS, or `localhost`, since `getUserMedia` requires a secure context — `app.js:403-421`).
- Correctness is checked by physically performing the gestures the app detects: two-hand pinch to frame a photo (`app.js:1132-1164`), single-hand pinch-drag to move puzzle pieces (`app.js:803-843`), and a held fist to reset/save (`app.js:1066-1081`, `FIST_HOLD_FRAMES = 12` frames, `app.js:23`).
- `guide.html` (repo root) serves as a human-facing setup/usage walkthrough, not an automated test artifact.
- There is a `loaderRetry` button and a boot watchdog (`app.js:1222-1248`) that act as the only "self-check" mechanism in the app: if MediaPipe fails to load within `LOAD_TIMEOUT_MS` (20000 ms) or the overall watchdog window (`(LOAD_TIMEOUT_MS * 2) + 5000` ms), a user-visible error state is shown instead of a silent hang. This is a runtime safeguard, not a test.

## Mocking

Not applicable — no test framework, no mocks/stubs/spies present.

**If tests are introduced**, be aware the codebase has heavy, tightly-coupled dependencies on browser-only APIs that will need mocking or a browser-based test runner (rather than pure Node/jsdom) to exercise meaningfully:
- `navigator.mediaDevices.getUserMedia` (`app.js:407`)
- `HTMLCanvasElement` 2D context drawing (`ctx.drawImage`, `ctx.getImageData`, `ctx.putImageData`) used pervasively for photo capture and effects (`app.js:594-609, 641-653, 915-924`)
- `MediaRecorder` and `canvas.captureStream` for video export (`app.js:179-201`)
- `AudioContext`/`OfflineAudioContext` for all sound effects (`app.js:69-145`)
- `requestAnimationFrame`-driven render loop (`app.js:1193-1201`) coupling detection, drawing, and game-state updates in a single per-frame function (`processResults`, `app.js:1086-1191`), which is not currently decomposed into independently-testable pure functions.
- The `@mediapipe/tasks-vision` `HandLandmarker`, loaded from a CDN URL at runtime rather than a local dependency (`app.js:1-4, 431-486`) — would need to be mocked or run in an actual browser (e.g. Playwright) with camera permission stubbed.

**Recommended approach if adding tests:**
- Favor Playwright (or another real-browser runner) over jsdom, given the canvas/video/audio/WebRTC surface area — jsdom does not implement `getUserMedia`, `MediaRecorder`, or meaningful `<canvas>` 2D context behavior.
- Pure-logic helpers that don't touch the DOM/canvas are the best first candidates for unit testing without a browser, since they are already side-effect-free: `dist2D` (`app.js:488-492`), `isPinching`/`isFist` (`app.js:494-511`), `shuffle` (`app.js:611-617`), `isNearOwnCell` (`app.js:703-710`), `computeHandFrame` (`app.js:521-533`), `gaussianNoise` (`app.js:587-592`). These would need to be extracted/exported (currently nothing is exported — see CONVENTIONS.md "Module Design") before they can be imported into a test file.

## Fixtures and Factories

Not applicable — none exist.

## Coverage

**Requirements:** None enforced (no CI, no coverage tool configured).

**View Coverage:**
```bash
# Not applicable — no coverage tooling installed.
```

## Test Types

**Unit Tests:** None. See "Recommended approach" above for viable candidates if introduced.

**Integration Tests:** None.

**E2E Tests:** None. Manual gesture-based verification in a real browser with a real webcam is currently the only end-to-end check performed (see "Current Verification Method").

## CI/CD

No CI configuration exists (no `.github/workflows/`, no other CI provider config found in the repo root or `.claude/`). Git hooks present are only the default Git sample hooks (`.git/hooks/*.sample`), none of which are active (no `.sample` extension stripped, so none execute).

## Common Patterns

Not applicable — no test code exists to draw patterns from. If this project adopts automated testing in the future, align new test file naming and location with the flat, no-nested-folder style already used for source files (see `CONVENTIONS.md`), e.g. a single `app.test.js` at the repo root rather than a `__tests__/` directory, unless a test runner's conventions require otherwise.

---

*Testing analysis: 2026-09-08*
