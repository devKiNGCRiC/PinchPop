# Requirements: PinchPop

**Defined:** 2026-09-09
**Core Value:** The gesture-controlled capture → puzzle → polaroid experience must feel exactly as good (or better) after migration as it does in the prototype today — everything else (accounts, gallery, scoring, sharing) is built around that core loop, never at its expense.

## v1 Requirements

Requirements for the Web MVP milestone. Each maps to roadmap phases.

### Core Gameplay Migration

- [ ] **GAME-01**: User can access their webcam and see real-time hand tracking driving the game, ported into the React app
- [ ] **GAME-02**: User can frame a photo using two-hand index-finger gesture positioning
- [ ] **GAME-03**: User can pinch with both hands to trigger a 3-second countdown and capture a photo
- [ ] **GAME-04**: User can solve the resulting 3×3 puzzle by dragging pieces with one-hand pinch gestures
- [ ] **GAME-05**: User sees a shatter animation and polaroid presentation when the puzzle is completed and saved (closed-fist gesture)
- [ ] **GAME-06**: User hears procedural sound effects (Web Audio API) during framing, countdown, capture, puzzle interaction, and completion
- [ ] **GAME-07**: User can build a photo strip of up to 3 completed polaroids within a session
- [ ] **GAME-08**: User can download a WebM recording of their puzzle-solving gameplay
- [ ] **GAME-09**: The ported gesture/puzzle engine feels performance- and behavior-identical to the original prototype (no regression in responsiveness or feel)

### Web Application Shell

- [ ] **SHELL-01**: User can view a landing/home page introducing PinchPop
- [ ] **SHELL-02**: User can navigate to the game screen and start playing from the home page
- [ ] **SHELL-03**: User sees a results page after completing a puzzle, showing their photo and score
- [ ] **SHELL-04**: The application is responsive across desktop and common mobile viewport widths
- [ ] **SHELL-05**: User sees clear loading and error states (camera permission denied, no camera found, hand-tracking model failed to load) with a retry option

### Authentication & Guest Mode

- [ ] **AUTH-01**: User can play the full capture → puzzle → polaroid loop as a guest, with no signup required
- [ ] **AUTH-02**: User can sign up and sign in with email and password
- [ ] **AUTH-03**: User can sign in with Google OAuth
- [ ] **AUTH-04**: User's guest-session photos and scores are preserved automatically when they convert to a full account (no data loss)
- [ ] **AUTH-05**: User's session (guest or authenticated) persists across a page refresh
- [ ] **AUTH-06**: User can sign out from any page

### Personal Gallery

- [ ] **GALL-01**: User can save a completed photo to their personal gallery (requires an account)
- [ ] **GALL-02**: User can view their saved photos in a paginated personal gallery
- [ ] **GALL-03**: User can delete a photo from their personal gallery
- [ ] **GALL-04**: User's gallery is private and visible only to them, enforced by Row Level Security

### Scoring & Speed Run

- [ ] **SCORE-01**: User sees their score immediately after completing a puzzle
- [ ] **SCORE-02**: User can play Speed Run mode, which tracks completion time, move count, and accuracy
- [ ] **SCORE-03**: Speed Run score is computed from one fixed, documented formula combining time, moves, and accuracy
- [ ] **SCORE-04**: A submitted Speed Run score is validated server-side before being recorded, so it cannot be forged via client-side tampering

### Leaderboard

- [ ] **LEAD-01**: User can view an all-time leaderboard of top Speed Run scores
- [ ] **LEAD-02**: User can view a daily leaderboard (UTC-anchored day boundary) of top Speed Run scores
- [ ] **LEAD-03**: User can see their own rank on the leaderboard even when it is off-screen from the visible top entries
- [ ] **LEAD-04**: Guest scores do not appear on the persistent leaderboard until the guest converts to a full account

### Achievements

- [ ] **ACHV-01**: User unlocks achievements from a fixed set of ~6 (e.g. First Snap, Puzzle Master, Speed Demon, Photographer, Perfect Solve, Daily Champion)
- [ ] **ACHV-02**: User sees a visible notification the moment an achievement unlocks
- [ ] **ACHV-03**: User can view their unlocked achievements on their profile

### Profile

- [ ] **PROF-01**: User can view a profile page showing their stats (photos captured, puzzles completed, best time, achievements)

### Sharing

- [ ] **SHARE-01**: User can generate a public link to a saved photo that requires no login to view
- [ ] **SHARE-02**: User can revoke a previously shared link, immediately disabling public access
- [ ] **SHARE-03**: A shared link shows a rich social preview (Open Graph title/image) when pasted into iMessage, WhatsApp, Discord, or Slack
- [ ] **SHARE-04**: User (or a visitor) can download the photo directly from the share page
- [ ] **SHARE-05**: User can use the OS native share sheet on supported devices, with a copy-link fallback where unsupported

### Deployment & Production

- [ ] **DEPLOY-01**: The web app is deployed to Vercel and publicly reachable
- [ ] **DEPLOY-02**: Client-side routes (e.g. `/gallery`, `/share/:slug`) work correctly on direct navigation and page refresh, not only in-app navigation
- [ ] **DEPLOY-03**: Supabase Row Level Security policies are audited across every table before launch to confirm only intended data is exposed

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Gamification

- **DAILY-01**: Daily Challenge mode — a rotating daily puzzle/photo target (distinct from the in-scope daily leaderboard view)
- **ACHV-04**: Achievement progress indicators (e.g. "2/5 puzzles solved for Puzzle Master")

### Sharing & Trust

- **SHARE-06**: Time-based expiry on share links, beyond simple revoke
- **SCORE-05**: Replay/move-log storage for leaderboard dispute resolution

### Platform

- **MOBILE-01**: React Native + Expo mobile companion app, sharing the same Supabase backend

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Daily Challenge mode | Needs a scheduled/rotating backend job — deferred to v2; the daily *leaderboard* view is still in scope |
| Mobile application (React Native + Expo) | Separate future milestone, per PROJECT.md |
| Party mode / multiplayer | Real-time infra + compounds anti-cheat complexity; deferred per PROJECT.md |
| AI photo categorization / enhancement / face search | Carries consent/legal weight (biometric processing) this MVP has no policy infrastructure for |
| Public discovery/explore feed of all users' photos | Real privacy risk for face-photo content; sharing stays strictly link-based and unlisted |
| Additional puzzle sizes, custom photo frames, seasonal themes | Cosmetic scope, deferred per PROJECT.md |
| Pure client-side score submission with no server validation | Trivially fakeable via devtools; server-side validation is P1, not deferred |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAME-01 .. GAME-09 | TBD | Pending |
| SHELL-01 .. SHELL-05 | TBD | Pending |
| AUTH-01 .. AUTH-06 | TBD | Pending |
| GALL-01 .. GALL-04 | TBD | Pending |
| SCORE-01 .. SCORE-04 | TBD | Pending |
| LEAD-01 .. LEAD-04 | TBD | Pending |
| ACHV-01 .. ACHV-03 | TBD | Pending |
| PROF-01 | TBD | Pending |
| SHARE-01 .. SHARE-05 | TBD | Pending |
| DEPLOY-01 .. DEPLOY-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 0 (populated by roadmap creation)
- Unmapped: 42 ⚠️ (expected prior to roadmap)

---
*Requirements defined: 2026-09-09*
*Last updated: 2026-09-09 after initial definition*
