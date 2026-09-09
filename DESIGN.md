# PinchPop — Visual Design System

**Status:** Recommended direction, pending developer approval. Not yet implemented.
**Source:** Independent analysis of three Google Stitch concept explorations in `design-exploration/` (concept-01, concept-02, concept-03), evaluated against PinchPop's core identity: a gesture-controlled photobooth puzzle game (Camera → Hand Gestures → Capture → Photo Puzzle → Solve → Polaroid Memory → Gallery → Score).
**Relationship to existing work:** This is an independent recommendation built from the three new references, not a restatement of the in-flight `01-UI-SPEC.md` Revision 2 (cream/coral/Space Grotesk, still awaiting its own browser checkpoint approval). There is real overlap — both land on a warm cream base and a coral primary — because that combination is a genuinely good fit for this brief, not because one was copied into the other. Where this document's specifics diverge from Revision 2, this document is the newer, more deeply-considered recommendation.

---

## 1. Design Philosophy

PinchPop is a **coin-op photobooth arcade cabinet, rebuilt for the browser.** Every surface should feel like it was designed by the same small team that built a physical arcade kiosk: warm paper and instant film on the outside, a live optical sensor HUD on the inside, a shutter-red button in the middle that you actually want to press.

Four ideas govern every screen:

1. **There is always one hero.** Every screen has one dominant element it exists to show off — a live camera feed, a puzzle grid, a captured Polaroid — and that element must visually dominate the page: largest, most central, most colorful. Live gesture feedback (pinch state, tracking confidence, shutter countdown) is the most important visual content on any screen where it's relevant, never a decorative afterthought.
2. **Physical media, not files.** Every photo is treated as an object — a Polaroid, a contact print, a print strip — with weight, a border, a slight rotation, a piece of tape. Never a plain `<img>` in a plain card.
3. **Arcade, not laboratory.** HUD chrome (brackets, readouts, monospace data) exists to communicate *this machine is watching your hands right now* — a feeling of aliveness — not to simulate a technical control panel. If a screen has more than two live readouts fighting for attention, cut it down. See §17.
4. **Toolkit, not checklist.** Every motif described in this document (HUD brackets, Polaroid treatment, puzzle-grid language, decorative gradients) belongs to a specific context, not to every screen. Camera and Puzzle get HUD chrome; Results, Gallery, and captured moments get Polaroid treatment; Home and other promotional surfaces get quiet, sparing decoration and no HUD at all. A screen that reaches for every motif at once has lost the plot — see the per-section scoping in §11–§14 and the summary in §21.

## 2. Brand Personality

Playful, energetic, photographic, tactile, slightly nostalgic, arcade-inspired, social, premium, memorable — per the brief. In practice:

- **Playful, not childish:** bold color and motion, but structured layouts, real typographic discipline, no bubble fonts, no cartoon mascots.
- **Nostalgic, not retro-kitsch:** instant film and coin-op cues (Polaroid borders, print-strip chutes, "insert token") used as *material*, not as a costume — no fake VHS noise, no scanline gimmicks layered over everything.
- **Premium, not precious:** confident color, generous imagery, real contrast — never the hushed, museum-quiet, cream-and-serif "gallery website" register. If a screen would feel at home as a fine-art photography portfolio, it has drifted too far from *game*.

## 3. Color Palette

Warm paper base, one confident accent for action, three secondary accents each with a **specific, non-interchangeable job.** No accent is ever used decoratively outside its job — that's what keeps the palette legible instead of noisy.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#FBF1E4` | Primary page background. Warm, not sterile. |
| `paper-raised` | `#FFFFFF` | Card/print surfaces sitting on `paper` — the "physical print" white. |
| `paper-border` | `#E7DCC8` | Hairline borders, dividers, print-edge lines. |
| `ink` | `#221A14` | "Darkroom" near-black — nav bar, footer, camera/HUD chrome, body text on paper. Warm brown-black, never pure `#000`/`#111`. |
| `ink-soft` | `#6B5E4F` | Secondary/muted text on paper. |
| `shutter` | `#FF5A3C` | **The** primary accent — one job: the single primary action per screen (Start Playing, Snap, Save). Never used for anything else. |
| `shutter-ink` | `#221A14` | Text/icon color *on* `shutter` fills (dark-on-bright reads better than white-on-coral and matches `ink`). |
| `viewfinder` | `#1E9E8C` | **Live-tracking teal** — reserved exclusively for gesture/optical HUD state: pinch confirmed, tracking lock, camera-ready dot. If it's not reporting a live sensor state, it isn't this color. |
| `token-gold` | `#FFC531` | **Score/currency/reward** — points, tokens, streak counters, "new high score," badge unlock glow. Never used for a button or a link. |
| `neon-violet` | `#7B5CF0` | **Puzzle-active state** — the tile currently being dragged/solved, active puzzle-piece highlight, rare/epic badge tier. The one "night-arcade neon" note in an otherwise warm palette. |
| `danger` | `#C81E3A` | Errors, destructive actions, mis-drop/failure state. Distinct from `shutter` (cooler, more red than orange) so success/action and failure are never confusable. |

**60/30/10 discipline:** `paper` + `paper-raised` carry ~60% of any screen. `ink` (chrome bands: nav, footer, camera viewport frame, puzzle mat) carries ~30%. `shutter` + the three job-specific accents together never exceed ~10% of a screen's area.

**Explicitly avoided:** the "warm cream + terracotta-clay serif" combination (too close to a well-known generic AI-design default) and pure `#0B0B0B`/`#111` near-blacks (same reason) — `ink` is deliberately a warm brown-black instead.

## 4. Typography

Three families, three jobs — never interchangeable:

| Role | Family | Weight(s) | Job |
|---|---|---|---|
| Display / Heading | **Space Grotesk** | 700 | Headlines, page titles, big score numbers. Geometric, slightly technical, has personality without being a novelty face. |
| Body | **Inter** | 400, 600 | Paragraphs, descriptions, UI copy, button labels. Maximum legibility. |
| HUD / Data | **IBM Plex Mono** | 400 | *Only* for things that are genuinely data: sensor readouts, timers, EXIF-style metadata, scoreboard numbers in a table, nav labels. Uppercase + letter-spacing (`0.08em`) here is a structural device (this text is machine-reported), not decoration — it must not appear anywhere else in the UI. |

**Type scale:** Display 56/34 (desktop/mobile), Heading 30/22, Body 16/16, Label (mono) 13/13. Two weights per family maximum. Body line-height 1.6; Display/Heading 1.05–1.15.

**Avoid:** accenting a single word mid-headline with italic/color (a known AI-generated tell); an eyebrow label above every heading; numbered step markers unless the content is an actual sequence (the "How PinchPop Works" 3-step flow legitimately is one — don't add numbering anywhere else).

## 5. Spacing

Standard 8-point scale: `4 · 8 · 16 · 24 · 32 · 48 · 64px`. One accessibility exception: interactive touch targets (hamburger, icon buttons) floor at `44×44px` regardless of their visual icon size.

## 6. Layout Principles

- **Centered arcade-kiosk composition with one dominant hero and supporting information around it** — not a multi-panel dashboard. The hero (live camera feed, puzzle grid, captured Polaroid) must always visually dominate the page: it is bigger, more central, and more colorful than anything around it. Supporting cards and panels frame the hero — they announce themselves quietly at the edges, they never compete with it for size, color weight, or attention. See §14 for the mobile collapse rule; that section is not license to skip mobile design.
- **Center-weighted, not edge-to-edge.** Max content width ~1200px, centered, generous outer margin — echoes an arcade cabinet's bezel, keeps the "screen inside a machine" feeling.
- **One hero element per screen.** Landing: the live-camera hero card. Puzzle: the 3×3 grid. Results: the Polaroid. Never let a HUD panel or a supporting card visually compete with the hero for size or color weight. If a layout starts to look like a control panel with many equally-weighted boxes, that's the signal to cut panels, not to shrink them.
- Left-aligned reading columns; hero visuals and score numbers may center.

## 7. Navigation

Persistent top bar, `ink` background, 64px tall, centered content column.

- Left: wordmark, `Space Grotesk` bold, `shutter` color.
- Center/right: four links (Home, Play, Gallery, Profile) in the mono Label style, uppercase, letter-spaced. Active link gets a 2px `shutter`-colored underline.
- Right-most: the primary CTA in `shutter`, shown only where it's contextually useful (e.g. "Start Playing" on Home) — the nav is not required to carry a CTA on every screen, and never carries more than one.
- The nav bar carries no live gameplay state. Token counts, scores, streaks, and any other live/session status belong inside the Game experience itself, never in the persistent global chrome — a player who isn't in a game shouldn't see a scoreboard following them around the site.
- Below 768px: link row collapses to a 44×44px hamburger opening a right-side drawer on the `ink` surface; drawer links dismiss on tap.

## 8. Buttons

- **Primary (`shutter`):** filled `#FF5A3C`, `shutter-ink` text, `rounded-2xl`. Exactly one per screen — this *is* the shutter button, literally and figuratively. Hover: scale `1.03` + soft coral shadow bloom. Active/press: scale `0.97`. This press-feedback recipe is shared by every button variant for consistency (see below) — only the glow is primary-exclusive.
- **Secondary:** `paper-raised` fill or transparent, 1.5px `ink` border, `ink` text, same scale-on-press feedback, no glow.
- **Tertiary/link:** text-only, `ink-soft`, underline on hover.
- Icon-only buttons (camera controls, gallery filters): 44×44px minimum, always paired with `aria-label`.

## 9. Cards

Two card families, never mixed:

- **Print cards** (photos, Polaroid results, gallery items): `paper-raised` fill, thin `paper-border`, soft asymmetric shadow (never the generic flat `rgba(0,0,0,.1)` under every card — vary shadow direction/blur slightly per card to feel hand-placed), optional 1–3° rotation, optional washi-tape corner accent (used sparingly — at most one or two tape accents per screen, not on every card).
- **Info/stat cards** (puzzle sidebar, profile stats, badge tiles): `paper-raised` fill, `paper-border`, flat (no rotation/tape — these are UI chrome, not physical objects), `rounded-2xl`, lift + very slight rotate on hover only if the card is itself interactive (clickable), not on static stat tiles.

## 10. Photography Treatment

**The user's own captured photos are the product's hero imagery.** The moment someone frames a shot and pinches to snap it, that photo — not a curated reference image — is the most important visual content on the page it appears on: largest, most central, given the full print treatment in §11. Nothing in this system is implemented in a way that depends on stock or licensed photography.

Decorative and promotional imagery (Home, empty states, marketing surfaces) is built from things that don't require a photo library: soft abstract gradients, geometric shapes, a sparing halftone-dot or lens-aperture-ring motif, or — once they exist — real captured photos pulled from the gallery. These decorative devices are reserved for landing/promotional surfaces per §21 — they are seasoning for a page that doesn't yet have a live camera or a real photo to show, not a texture layered onto every screen. A screen is not "finished" if it only looks good with a hand-picked hero photo in place; it must read as complete, confident, and on-brand on day one, before a single user photo has been captured. Where a captured-photo treatment (§11) is shown without a real photo yet, use a plain color/gradient card in the same frame shape rather than a placeholder image or lorem-picture.

When a captured photo *is* shown (Puzzle source image, Results, Gallery), apply a consistent light grade so it reads as "shot on the PinchPop booth": slightly lifted shadows, warm white balance, mild grain at low opacity — enough to feel like instant film, not enough to look degraded. Every photo that represents a captured moment is framed as a **print**, per §11 — it never floats as a bare rectangle.

## 11. Polaroid / Print Treatment

The single most important recurring motif. Every captured/saved photo:

- White print border, thicker at the bottom (classic Polaroid proportions).
- 1–4° rotation, randomized per instance but capped (never fully sideways).
- A soft drop shadow suggesting it's resting on the `paper` surface, not stuck to it.
- A caption zone in the bottom white margin: score, timestamp, or handwritten-style note, set in mono Label type (not italic script — keeps it "arcade kiosk," not "boutique atelier").
- Optional single tape accent at one corner (sage or dusty-rose tape color, used as a rare accent, not a system-wide decoration).

## 12. Puzzle UI

- The 3×3 grid is the unambiguous visual center of the puzzle screen — largest single element, framed like a camera viewfinder (thin `viewfinder`-teal corner brackets, not a full box border).
- Active/dragging tile: `neon-violet` glow ring — this is the *only* place `neon-violet` appears, making "something is being manipulated right now" instantly legible.
- Solved tiles: a small `viewfinder`-teal check, not a full color change (avoid color-only status — pair with an icon).
- Exactly two live HUD numbers beside the grid: **time remaining** and **moves/par**. Everything else (accuracy, combo multiplier, streak) belongs on the *Results* screen, not fighting for attention mid-solve.
- Primary action: a single `shutter`-colored "Shuffle" or contextual action button; no secondary colored buttons competing with it.

## 13. Camera / Viewfinder UI

- Full-bleed live video framed inside an `ink`-chrome bezel (the "machine" containing the "screen").
- Exactly two live overlays: a center framing reticle and a pinch-state indicator (idle → `viewfinder` teal "ready" → `shutter` red "capturing"). No simultaneous ISO/shutter-speed/latency readout wall — one honest signal, not six.
- Countdown, when active, is the single largest element on screen — big mono numerals, `shutter` color, centered over the frame.
- Post-capture: an immediate, satisfying "print ejects" motion (see §16) into a Polaroid frame — this is the emotional payoff moment of the whole product and deserves its own deliberate animation, not a generic fade.

## 14. HUD Elements

HUD chrome (brackets, mono readouts, status dots) is PinchPop's signature texture — but it is a **spice, not the meal.** It appears only where live interaction genuinely requires it: the Camera and Puzzle experiences, where something real is being tracked in real time. It does not appear on Home, Gallery, Profile, Leaderboard, or Results — those screens communicate through typography, color, and the Polaroid treatment instead, never through simulated sensor readouts.

Within Camera and Puzzle, hard rule: **no screen may show more than two simultaneous live-updating HUD readouts.** Everything else is either (a) not shown, (b) moved to a results/summary screen where the moment has passed and detail is welcome, or (c) tucked behind a "details" disclosure. This is the direct, deliberate correction against the most HUD-dense reference concept, which read as a technical dashboard rather than a game.

Every HUD status must pair color with an icon or text label — never color alone.

## 15. Badges & Score Displays

- Badges: square icon chip (color-filled per rarity: `paper-border` gray = common, `viewfinder` teal = rare, `neon-violet` = epic, `token-gold` = legendary) with a dark icon glyph inside — glyph is always `ink`, never white-on-bright (contrast + consistency with the rest of the palette).
- Score numbers: always mono, always `token-gold` when representing points/currency, set large (Display scale) on results/leaderboard screens, small (Label scale) inline elsewhere.
- Leaderboard podium: top-3 as physical "print" cards (per §11) at graduated sizes, rank 4+ as a plain mono-numeric table — avoid over-decorating the full list, save the visual weight for the podium.

## 16. Gallery

Pinboard/wall metaphor: prints (per §11) arranged with slight independent rotation on a `paper` "corkboard" background, not a rigid grid — but keep an underlying grid for scroll/reflow sanity (rotation is visual only, layout stays orderly). Filter/sort controls live in a single flat toolbar row above the wall, mono Label style, no HUD chrome (this is a browsing screen, not a live-sensor screen).

## 17. Responsive Behavior

The centered arcade-kiosk composition's supporting panels are a desktop **enhancement**, not the baseline — the hero element itself (camera, grid, print) is present and dominant at every width. Mobile rule, applied consistently:

1. Identify each screen's one hero element (camera feed, puzzle grid, Polaroid).
2. Stack everything else below it in priority order.
3. Collapse any panel with more than 2 live readouts into a single-line summary with a tap-to-expand disclosure.
4. Never shrink HUD text below 13px mono / 16px body — reduce readout *count*, not text size, to fit small screens.

Breakpoints: mobile <768px (single column, hamburger nav), tablet/desktop ≥768px (supporting panels return around the dominant hero), wide ≥1280px (content stays centered at max-width, never stretches edge-to-edge).

## 18. Interaction States

- Focus-visible: 2px `shutter` outline ring on every interactive element, no exceptions, never suppressed.
- Hover: primary buttons scale + glow; secondary buttons scale only; print cards lift ~4px and straighten slightly toward 0° rotation (suggests picking the print up).
- Active/press: scale down (`0.97`), immediate — this is the "shutter click" tactile signature, applied to every clickable element, not just the primary CTA.
- Loading/processing (e.g., "print developing"): a determinate progress indicator with real percentage/time when known, never an indefinite spinner — ties into the "instant film developing" motif honestly instead of decoratively.

## 19. Animation Principles

One deliberate, orchestrated moment per major flow — not scattered fade-ins:

- **Capture:** shutter flash (single bright frame), then the photo "ejects" and settles into its Polaroid frame with a slight overshoot rotation before resting.
- **Puzzle solve:** the completed grid has one clear celebratory beat (brief scale-pulse + `token-gold` flash), not a shatter/confetti overload.
- **Page load:** no per-section scroll-triggered fade-and-slide-up (the generic default) — the camera/puzzle/print hero can have one entrance beat; everything else is present immediately.
- Respect `prefers-reduced-motion` everywhere: press-scale, hover-lift, and celebratory beats all reduce to instant/near-instant state changes with no motion.

## 20. Accessibility Principles

- Body text minimum 16px; mono HUD/label text minimum 13px, and never the *only* carrier of critical information (always paired with icon/shape/position).
- Color contrast: `ink` on `paper`/`paper-raised` and `shutter-ink` on `shutter` both verified ≥ 4.5:1; `token-gold` and `viewfinder` text is decorative/accent only, never body copy on `paper`.
- Every icon-only control has `aria-label`; every image that conveys information (not purely decorative) has real alt text describing the moment, not "photo.png."
- 44×44px minimum touch targets throughout, not just on the mobile nav.
- `prefers-reduced-motion` respected everywhere per §19.
- Live HUD status changes (pinch confirmed, tile solved) get a polite `aria-live` announcement for screen-reader users, since the primary signal is otherwise purely visual/gestural.

## 21. Things to Avoid

- More than two simultaneous live HUD readouts on any one screen (§14) — the single biggest risk this system corrects for.
- The cream-background + terracotta-accent + serif-display combination as a whole (too close to a recognizable generic AI-design default) — this system uses cream *with* a coral/teal/gold/violet system and mono+geometric-sans typography specifically to avoid that read.
- Pure black (`#000`/`#111`) anywhere — always the warm `ink` brown-black.
- Color-only status communication (always pair with icon/label).
- Decorative-only monospace or uppercase tracked labels outside the HUD/Label role — if it's not reporting live data or a nav/section label, it isn't mono uppercase.
- Fake CRT/scanline/VHS texture layered over everything — nostalgia comes from the physical print motif and coin-op language, not a screen filter.
- Flat, identical-shadow SaaS card grids — every print card should feel individually placed (§9, §11).
- A children's-game register: no bubble fonts, no cartoon mascots, no oversaturated primary-only palette.
- Numbered step markers on anything that isn't a genuine sequence.
- Scroll-triggered fade-and-slide-up on every section (§19).
- A multi-panel dashboard composition anywhere in the app (§6) — the hero always dominates; supporting panels frame it and stay quiet.
- A persistent, always-visible token/score/status chip in the global navigation (§7) — live gameplay state belongs inside the Game experience only.
- Any motif used outside its scoped context: HUD chrome outside Camera/Puzzle (§14); Polaroid/print treatment on something that isn't a captured photo (§11); puzzle-grid language outside the Puzzle screen (§12); halftone/aperture/gradient decoration anywhere but Home and other promotional surfaces, and even there, sparingly (§10). Treat every motif in this document as a toolkit entry with one home, not a default to sprinkle everywhere.
- Making any screen's visual identity depend on a specific stock or reference photo being present — the design must hold up with only abstract/generated decoration and no user photos yet (§10).

---

*This document is a design recommendation only. No application code has been modified. See the accompanying chat response for the concept-by-concept comparison this recommendation is based on.*
