# Feature Research

**Domain:** Gesture-controlled photobooth/puzzle web game with accounts, gallery, scoring, sharing
**Researched:** 2026-09-09
**Confidence:** MEDIUM-HIGH (patterns verified against Supabase official docs + cross-source agreement; some game-design specifics are industry-general, not PinchPop-specific competitor data)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Guest play with zero friction | Camera/gesture games live or die on first-touch trial; forcing signup before the "wow" moment kills conversion. Baymard research shows even a dominant-looking account option (without a true guest path) measurably drops completion. | LOW | Prototype already works with no auth — preserve that; auth must be additive, never gating the core loop. |
| Account required only to persist/save | Matches PROJECT.md decision. Users expect "try before you commit an identity." | LOW | Confirm at every save-triggering action (gallery save, leaderboard submit), not just at app load. |
| Guest session persists across a single visit without re-prompting | If guest state is lost on refresh/navigation mid-puzzle, it reads as a bug, not a feature. | LOW-MED | Use Supabase **anonymous sign-in**, not just local-only state (see Dependencies below) — gives a real, addressable user row from the first pixel captured. |
| Seamless guest→account upgrade that keeps existing data | Users who capture 2-3 photos as a guest and then decide to sign up expect those photos to "just be there," not lost. | MED | Supabase Auth's anonymous-user **identity linking** flow preserves the same `user.id` across the guest→permanent transition (see Dependencies). This is the correct primitive — do not build a custom "guest ID → merge on signup" migration script. |
| Email/password + Google OAuth sign-in | Both are named directly in PROJECT.md; Google OAuth in particular removes password friction, which matters for a casual/fun product where users won't tolerate account friction. | LOW | Standard Supabase Auth flows; well-documented. |
| Personal gallery of saved photos | Core promise of the product — "get back a polaroid-style photo memory" implies you can find it again later. | MED | Needs pagination/infinite-scroll from day one — even light users will accumulate dozens of polaroids over a few sessions given the strip-of-3 mechanic. |
| Delete / manage own saved photos | Users expect control over their own content, especially face photos. | LOW | RLS must scope delete to the owning `user_id`. |
| Score displayed immediately after solve | Immediate feedback loop is core to puzzle-game satisfaction; delaying it breaks the "polaroid reveal" moment already validated in the prototype. | LOW | Compute client-side for instant UX, but treat as provisional until server-side validation confirms (see Pitfalls). |
| Leaderboard shows the player's own rank even if off-screen | Users check "where do I stand" more than they browse the full list; a top-100-only leaderboard with no self-context feels dismissive. | LOW-MED | "You are #342" row pinned below or above the visible list is a near-universal pattern in casual game leaderboards. |
| Daily leaderboard resets predictably | If the "daily" leaderboard silently uses a rolling 24h window instead of a real day boundary, competitive users notice and complain (documented complaint pattern across GameSparks/Hypixel/PlayFab communities). | LOW-MED | Anchor to a fixed UTC boundary (00:00 UTC) rather than server-local or per-user timezone — avoids uneven competitive windows and is the dominant industry default. |
| Achievement unlock feedback (toast/notification) | Achievements that unlock silently in the background provide no dopamine hit and are frequently missed entirely by players. | LOW | Must be visible at the moment of unlock, not just buried in a profile page. |
| Public share link works with no login | Explicit requirement. Also table stakes for any "share this on social" feature — friction here (forcing the viewer to sign up) kills the viral loop entirely. | MED | See Pitfalls for scoping/expiry considerations. |
| Social preview (Open Graph image) on shared links | When a PinchPop share link is pasted into iMessage/WhatsApp/Discord/Slack, users expect a rich image preview, not a bare blue link. Without it the share feature feels broken even though the link technically "works." | MED | OG tags **must be server-rendered in the initial HTML response** — client-side React rendering via `useEffect` will NOT be picked up by social crawlers (they don't execute JS). This needs an SSR/prerender route or edge function per share page, not a pure SPA route. |
| Download button on share/result page | Named explicitly in PROJECT.md as a required capability alongside OS share-sheet. | LOW | Standard `<a download>` or blob download; no special API needed. |
| OS native share sheet on supported devices | Users on mobile expect the native share sheet (share to Instagram Story, Messages, etc.), not just a copy-link button. | LOW-MED | Web Share API (`navigator.share` / `navigator.canShare`) covers this, but support is inconsistent — mobile Safari/Chrome support file+image sharing, desktop support is spottier. Always feature-detect and fall back to copy-link + download. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable given PinchPop's specific mix (gesture control + puzzle + photobooth + score).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Gesture-controlled everything (capture, puzzle, save) | This is the actual core differentiator already validated in the prototype — no competitor photobooth or puzzle-leaderboard game combines hands-free gesture control with photo capture and puzzle-solving. Everything else in this file is scaffolding around this. | — (already built) | Don't let the product-layer work (auth/gallery/leaderboard) regress this; it's explicitly called out as non-negotiable in PROJECT.md's Core Value. |
| Speed Run mode with a composite score (time + moves + accuracy) | A pure "fastest time" leaderboard rewards recklessness (spamming moves); a pure "fewest moves" leaderboard rewards slow, careful play. Combining time, move-efficiency, and solve-accuracy into one score (similar to Puzzle Storm's combo-bonus model or POST VOID's multi-factor score) produces a more interesting, harder-to-game leaderboard and differentiates from a naive stopwatch. | MED | Needs a documented, fixed formula decided in requirements/design (not ad hoc later) since it becomes public-facing leaderboard logic once shipped — changing it later invalidates past scores. |
| Fixed, curated achievement set (~6) with meaningful first achievement | A small, hand-picked set (vs. sprawling 100+ achievement lists common in bloated gamified apps) keeps each one feeling significant — aligns with documented gamification guidance that a trivial-feeling first achievement cheapens the whole system. "First Snap" as the very first achievement is good design (rewards trying the core loop once) as long as it doesn't feel like a participation trophy. | LOW-MED | Perfect Solve / Speed Demon achievements should require genuinely non-trivial thresholds so the achievement retains prestige value. |
| Shareable "memory" page as a designed artifact, not just an image dump | Treating the public share page as a small branded moment (polaroid presentation, maybe the achievement/score context) rather than a bare `<img>` reinforces the "photo memory" framing from the Core Value statement, and gives social shares organic marketing value (every share is a PinchPop ad). | MED | Depends on OG image + share page work already required — this is "do the required thing well" rather than new scope. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific product, or that PROJECT.md has already correctly scoped out.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Public discovery feed / browsable gallery of everyone's photos | Feels like an obvious way to build community and virality ("Explore" tab of other users' polaroids). | These are photos of real people's faces, captured via webcam. A public discovery feed turns a private capture moment into involuntary public exposure, and once a link/image is public it can be indexed, cached, or reposted outside the platform — consent for "share with the people I choose" is very different from consent for "searchable by anyone." This is a materially different (and much riskier) privacy posture than the "unlisted share link" already scoped in PROJECT.md. | Keep sharing strictly link-based (unlisted, not indexed, not listed anywhere in-app) — matches what's already planned. If community/discovery is wanted later, it needs an explicit opt-in "make public" toggle per photo, off by default, not a default-public feed. |
| Pure client-side score submission with no server check | Simplest to build — client computes score, POSTs it straight into the leaderboard table. | For a decorative/portfolio leaderboard this would be fine, but PinchPop's leaderboard is a real competitive feature with achievements attached to score thresholds (Speed Demon, Perfect Solve) — anyone with browser devtools can submit an arbitrary score/time by editing the payload before it hits Supabase, since the "salt"/algorithm is necessarily shipped to the client. This is a well-documented, unfixable-client-side problem, not a hypothetical. | Server-side validation minimum bar (see Pitfalls below) — do not treat this as "we'll add anti-cheat later," design the score-write path with server-side checks from the first leaderboard implementation. |
| Daily Challenge mode | Named directly in PROJECT.md as Out of Scope this milestone. | Needs a daily-reset backend job (scheduled function generating/rotating the day's challenge), which is meaningfully more backend infrastructure than Speed Run's stateless per-session scoring. Building it half-heartedly now would mean redoing it properly later. | Speed Run mode alone carries MVP scoring depth, per existing decision. Daily leaderboard (not Daily *Challenge*) is still in scope and doesn't require this infra — it's just a time-windowed view over normal Speed Run scores. |
| Face recognition / AI photo tagging or "find yourself" search | Sounds like a nice-to-have discovery feature once there's a photo corpus. | Explicitly named as an anti-pattern in privacy guidance for selfie/event-photo apps — biometric processing of face photos carries real legal/consent weight (GDPR-adjacent obligations even outside the EU) that this MVP has no infrastructure or policy for. Also explicitly out of scope per PROJECT.md ("AI-based photo categorization"). | None needed for MVP — gallery is already scoped to "your own saved photos," which sidesteps this entirely as long as no public/shared corpus is built. |
| Party mode / multiplayer leaderboard rooms | Feels like a natural extension of "leaderboard + puzzle game." | Named Out of Scope in PROJECT.md; also implies real-time infra (presence, room state) that compounds with the anti-cheat problem above (now validating concurrent live sessions, not just discrete submissions). | Async, single-player Speed Run + global leaderboard already delivers the competitive hook without the real-time complexity. |
| Unlimited-lifetime, non-expiring public share links with no revoke | Simplest to build (just a permanent public URL per photo). | Users will eventually want to take a photo down (breakup, embarrassing capture, changed their mind) — a link that can never be revoked means PinchPop has no way to honor that, and "unguessable but permanent" URLs are a known weak privacy pattern once a link leaks past the intended audience (can be logged, crawled, or resurfaced later via browser history/analytics tools). | Make share links **revocable** (owner can unpublish/regenerate at will) at minimum. True time-based expiry is optional for MVP, but revocability is cheap (a boolean/flag flip + RLS check) and closes the worst failure mode. |

## Feature Dependencies

```
Supabase anonymous sign-in
    └──requires──> Guest mode play (photo capture/puzzle without visible signup)
                       └──enables──> Seamless guest→account data preservation (identity linking)
                                        └──requires──> Email/password OR Google OAuth signup during upgrade

Personal gallery
    └──requires──> Cloud photo storage (Supabase Storage)
    └──requires──> RLS scoping (owner-only read/write/delete)

Public share link
    └──requires──> Personal gallery (photo must already be saved/stored)
    └──requires──> A "public" flag or unlisted-slug row separate from private gallery RLS
    └──enhances──> OS share-sheet / download (share page is the surface those buttons live on)
    └──requires──> Server-rendered Open Graph tags (separate from the client SPA route)

Leaderboard (all-time + daily)
    └──requires──> Game sessions + score storage
    └──requires──> Server-side score validation (anti-cheat) ──BLOCKS launch-quality trust, not launch itself
    └──requires──> Account (guests should not be eligible for persistent leaderboard rank — see Pitfalls)

Speed Run mode
    └──requires──> Game sessions + score storage
    └──feeds──> Leaderboard
    └──feeds──> Achievements (Speed Demon, Perfect Solve depend on Speed Run score data)

Achievements
    └──requires──> Game sessions + score storage (source of truth for unlock conditions)
    └──requires──> Server-side (not purely client-side) unlock evaluation ──same anti-cheat rationale as leaderboard

Daily leaderboard view
    └──requires──> All-time leaderboard's underlying score storage (same table, time-windowed query)
    └──conflicts with──> "Daily Challenge mode" (out of scope) — daily *leaderboard* is just a filtered view, not a new game mode; do not conflate the two during roadmap planning
```

### Dependency Notes

- **Guest mode requires Supabase anonymous sign-in, not purely local/anonymous client state:** Supabase Auth's anonymous sign-in creates a real `auth.users` row with `is_anonymous = true` from the moment a guest starts playing. This is the mechanism that makes "seamless guest→account conversion" actually seamless — when the guest later signs up (email/password or Google), Supabase's identity-linking flow keeps the **same `user.id`**, so all Storage objects and Postgres rows already written under that guest session are automatically the signed-up user's data with zero migration code. Building a separate "local guest ID, merge on signup" system would be strictly worse and is not necessary — the platform primitive already solves this. Note per Supabase's own docs: enable CAPTCHA on anonymous sign-in to prevent automated abuse (bot-generated fake guest accounts), and gate anything sensitive (posting, saving publicly, leaderboard writes) behind `is_anonymous = false` via RLS.
- **Public share link requires a separate exposure surface from the private gallery:** RLS for the personal gallery must stay owner-only; the public share page needs its own row/flag/slug that a `to anon using (...)` policy can serve, scoped narrowly to "here's a share record with slug X" — never grant the `anon` role broad read access to the whole photos table. Keep these two RLS surfaces (private gallery vs. public share) architecturally distinct so a mistake in one doesn't leak the other.
- **Leaderboard and Achievements both require server-side validation, and both consume the same session/score data** — plan the "game session" write path once, correctly, rather than building leaderboard-write and achievement-check as two separate ad hoc paths that could disagree.
- **Daily leaderboard is NOT Daily Challenge mode:** the daily *leaderboard* (a time-windowed view of Speed Run scores) has none of the daily-reset backend-job complexity that got Daily Challenge (a distinct, rotating puzzle/photo target) explicitly deferred. Don't let roadmap phase estimates conflate the two.

## MVP Definition

### Launch With (v1)

Minimum viable product — matches PROJECT.md's Active requirements; these are already locked, not proposed here.

- [ ] Guest mode via Supabase anonymous sign-in — zero-friction trial of the validated core loop
- [ ] Email/password + Google OAuth signup, with seamless guest→account data carryover
- [ ] Personal gallery (Supabase Storage + Postgres, RLS-scoped to owner)
- [ ] Game sessions + score storage, with **server-side score validation on write** (not deferred — see Pitfalls)
- [ ] Speed Run mode with a documented, fixed scoring formula
- [ ] Leaderboard — all-time + daily (UTC-anchored) views, self-rank always visible
- [ ] Fixed set of ~6 achievements, evaluated server-side against stored session data
- [ ] Public, revocable share links with server-rendered OG preview tags
- [ ] Download + Web Share API (with feature-detected fallback to copy-link)

### Add After Validation (v1.x)

Features to add once the core product-layer is working and real usage data exists.

- [ ] Time-based share-link expiry (beyond simple revoke) — add if abuse/staleness becomes an observed problem, not preemptively
- [ ] Achievement progress indicators ("2/5 puzzles solved for Puzzle Master") — nice motivational layer once the base unlock system is proven correct
- [ ] Replay/move-log storage for leaderboard disputes — only worth the storage cost once there's an actual leaderboard worth defending (see Pitfalls, "lightweight" vs "full" anti-cheat tiers)

### Future Consideration (v2+)

Explicitly deferred; matches PROJECT.md's Out of Scope with added rationale.

- [ ] Daily Challenge mode — needs a scheduled/rotating backend job; defer until Speed Run + daily leaderboard usage validates appetite for more scoring depth
- [ ] Opt-in public discovery/explore feed — only if users actively request more visibility than "share the link myself"; must remain opt-in, never default-public, given webcam face-photo content
- [ ] Party mode / multiplayer — real-time infra; defer indefinitely per PROJECT.md
- [ ] AI photo categorization/enhancement, face search — explicitly out of scope; carries consent/legal weight this MVP has no policy infrastructure for
- [ ] Additional puzzle sizes, custom frames, seasonal themes — cosmetic scope, defer per PROJECT.md

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|----------------------|----------|
| Guest mode (anonymous sign-in) | HIGH | LOW | P1 |
| Guest→account conversion (identity linking) | HIGH | MEDIUM | P1 |
| Personal gallery | HIGH | MEDIUM | P1 |
| Game sessions/score storage | HIGH | MEDIUM | P1 |
| Server-side score validation | HIGH (trust) | MEDIUM | P1 |
| Speed Run mode + scoring formula | HIGH | MEDIUM | P1 |
| Leaderboard (all-time + daily) | HIGH | MEDIUM | P1 |
| Achievements (fixed ~6) | MEDIUM-HIGH | LOW-MEDIUM | P1 |
| Public share link (revocable) | HIGH | MEDIUM | P1 |
| OG preview tags on share page | MEDIUM-HIGH | MEDIUM (SSR requirement) | P1 |
| Download + Web Share API | MEDIUM | LOW | P1 |
| Time-based link expiry | LOW-MEDIUM | LOW | P2 |
| Achievement progress indicators | MEDIUM | LOW | P2 |
| Replay/move-log for dispute resolution | LOW | MEDIUM | P3 |
| Daily Challenge mode | MEDIUM | HIGH | P3 (out of scope this milestone) |
| Opt-in discovery feed | LOW-MEDIUM | HIGH (privacy design) | P3 |

**Priority key:**
- P1: Must have for launch (this milestone)
- P2: Should have, add when possible (post-MVP iteration)
- P3: Future consideration, deferred

## Pitfalls Surfaced for Requirements (feeds PITFALLS.md / roadmap)

These are the specific edge cases the downstream consumer asked to surface — details PROJECT.md's requirement list doesn't yet spell out.

1. **Client-side timing cannot be the leaderboard's source of truth.** Since the score algorithm necessarily ships to the browser (it has to, to compute a live score during play), a determined user can open devtools and submit any time/move-count/score they want directly to the write endpoint. This is a documented, structural limitation of client-side games, not a bug to patch. For PinchPop, recommend a **tiered response**: (a) minimum bar — validate submitted scores against sane bounds server-side (e.g., a Postgres function/RPC that checks time-per-move ratios, move counts against puzzle geometry limits, and rejects physically-impossible combinations) rather than a raw client INSERT into the leaderboard table; (b) do not treat this as "add anti-cheat later" — retrofitting validation after a leaderboard has public scores on it is much harder than designing the write path correctly from the first implementation. Full replay-verification (storing the move sequence and re-simulating server-side) is a reasonable v1.x addition once real leaderboard integrity issues are observed, not a P1 requirement.
2. **Guest mode needs to persist a real, addressable identity, not just localStorage.** "Persisting locally before account creation" should not mean client-only state that vanishes on a new device/browser or cleared storage — it should mean a Supabase anonymous-auth session (real `user.id`, real RLS-governed rows) from the moment of first capture, so that photos/scores captured as a guest survive browser refresh and convert cleanly to a permanent account. Plain localStorage-only guest state is a trap: it works until the user clears cookies, switches devices, or the tab closes unexpectedly mid-session, at which point "guest data" is just gone with no recovery path.
3. **Guest sessions should NOT count toward the persistent leaderboard until converted.** Anonymous users can be assigned scores, but a leaderboard full of throwaway anonymous entries (no display name, easy to spam via repeated anonymous sign-ins) degrades leaderboard trust and looks like bot noise. Recommend: guests can play Speed Run and see their own score/rank locally/provisionally, but a leaderboard row only becomes permanent/visible to others once `is_anonymous = false` (i.e., they've created an account) — this also gives a natural, non-annoying conversion nudge ("Sign up to save your rank on the leaderboard") tied to a moment of investment (they just got a good score) rather than an upfront gate.
4. **Public share links need an explicit scoping decision: unlisted vs. revocable vs. expiring.** "No login to view" (already required) is not the same as "public forever with no owner control." At minimum, share links should be **revocable** by the owner (unpublish flips a flag, RLS immediately stops serving it) — this is cheap and closes the worst failure mode (user regrets sharing something). True time-based expiry is a nice-to-have, not required for MVP. Critically, the share-link RLS/query surface must be **narrowly scoped** (a dedicated public-share table/view keyed by slug) rather than a broadly-permissive `anon` read policy on the main photos/gallery table — a mistake in the latter leaks the entire private gallery, not just shared items.
5. **Open Graph previews require server-rendered HTML, which has an architecture implication.** Because PROJECT.md specifies React + Vite (a client-rendered SPA by default), the public share page specifically needs either a prerendered/SSR route, a Vercel Edge/Serverless function that injects OG meta tags server-side, or a static-generation step per share slug — a pure client-side React route will produce blank/default previews when pasted into iMessage, WhatsApp, Discord, or Slack, since those crawlers don't execute JavaScript. This is worth flagging explicitly for the roadmap/architecture phase since it's the one feature in this set that doesn't fit the "just another React route" mental model.
6. **Daily leaderboard timezone boundary should be decided once, explicitly, and documented — not left as "whatever the database default does."** Recommend anchoring to a fixed UTC day boundary (00:00 UTC), matching the dominant pattern across GameSparks/PlayFab/Android Play Games. Avoid per-user-local-timezone daily boundaries — it's more complex to implement correctly and creates confusing "why did my leaderboard entry disappear" moments when a user's local day rolls over mid-session.
7. **Webcam/face-photo content raises the privacy bar above a generic "share a link" feature.** Because every photo is a real photo of the user's (and possibly bystanders') face, avoid any feature that makes photos discoverable beyond the specific link the owner chooses to share (see Anti-Features: no public discovery feed, no face search/tagging). This also argues for keeping the public share surface as "view this one specific photo via its link" rather than anything resembling a public profile page listing all of a user's shared photos — the latter meaningfully increases exposure surface per user.

## Sources

- [Supabase — Anonymous Sign-ins guide (RLS, is_anonymous claim, security notes)](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-anonymous.mdx) — Context7, HIGH confidence
- [Supabase — Anonymous Sign-ins blog post (identity linking, RLS policy examples)](https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-04-17-anonymous-sign-ins.mdx) — Context7, HIGH confidence
- [Supabase — Row Level Security guide (anon vs authenticated roles)](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/postgres/row-level-security.mdx) — Context7, HIGH confidence
- [Supabase Auth — anonymous sign-in and identity-linking API/test behavior](https://github.com/supabase/auth) — Context7, HIGH confidence
- [Baymard-cited guest checkout prominence research, via MojoAuth blog](https://mojoauth.com/blog/guest-checkout-vs-account-login-passwordless-patterns) — WebSearch, MEDIUM confidence (cross-referenced pattern, single-article citation of Baymard stat)
- [Cloud Leaderboard Kit — "Your leaderboard's anti-cheat probably does nothing"](https://marvinadvergames.itch.io/cloud-leaderboard-kit-for-construct-3/devlog/1642569/your-leaderboards-anti-cheat-probably-does-nothing-heres-what-actually-works) — WebSearch, MEDIUM confidence (practitioner devlog, consistent with general server-authoritative-game consensus)
- [PlayFab — Using resettable statistics and leaderboards](https://learn.microsoft.com/en-us/gaming/playfab/features/social/tournaments-leaderboards/using-resettable-statistics-and-leaderboards) — WebSearch/official docs, HIGH confidence
- [Android Developers — Play Games leaderboards (UTC-7 daily reset example)](https://developer.android.com/games/pgs/leaderboards) — WebSearch/official docs, HIGH confidence
- [Privacy Patterns — Private link pattern](https://privacypatterns.org/patterns/Private-link) — WebSearch, MEDIUM confidence
- [Pulse Security — "Sensitive data in URLs: why private links aren't private anymore"](https://pulsesecurity.co.nz/articles/unguessable_url_issues) — WebSearch, MEDIUM confidence
- [Microsoft Learn — Best practices for unauthenticated sharing](https://learn.microsoft.com/en-us/microsoft-365/solutions/best-practices-anonymous-sharing?view=o365-worldwide) — WebSearch/official docs, HIGH confidence
- [Yu-kai Chou — "Badge Gamification: Why Most Achievement Badges Fail"](https://yukaichou.com/gamification-study/badge-gamification-guide/) — WebSearch, MEDIUM confidence (single-author gamification-industry source, but consistent with broader game-design literature)
- [Lichess — Puzzle Storm scoring discussion (combo-bonus scoring model)](https://lichess.org/@/somethingpretentious/blog/whats-the-best-approach-for-top-puzzle-storm-scores/T3lzywM6) — WebSearch, LOW-MEDIUM confidence (community blog, illustrative not authoritative)
- [POST VOID scoring breakdown (multi-factor score formula)](https://steamcommunity.com/app/1285670/discussions/0/4198997399053104118) — WebSearch, LOW confidence (single community discussion, illustrative example only)
- [CSS-Tricks — How to Use the Web Share API](https://css-tricks.com/how-to-use-the-web-share-api/) — WebSearch, MEDIUM-HIGH confidence
- [Telerik — A Definitive Guide to Using the Web Share API](https://www.telerik.com/blogs/definitive-guide-using-web-share-api) — WebSearch, MEDIUM-HIGH confidence
- [johnnyreilly — Open Graph: a guide to sharable social media previews (SSR requirement)](https://johnnyreilly.com/open-graph-sharing-previews-guide) — WebSearch, MEDIUM confidence
- [Meta for Developers — Sharing/Webmasters docs](https://developers.facebook.com/docs/sharing/webmasters) — WebSearch/official docs, HIGH confidence
- [Kamero — Event Photo Privacy and GDPR Compliance guide](https://kamero.ai/resources/event-photo-privacy-gdpr-compliance) — WebSearch, MEDIUM confidence
- [ShowMyPhoto — Protect client privacy in online event photo galleries](https://showmyphoto.com/blog/protect-client-privacy-online-event-photo-gallery/) — WebSearch, MEDIUM confidence
- `.planning/PROJECT.md` — primary source for locked requirements and out-of-scope items

---
*Feature research for: PinchPop (gesture photobooth + puzzle web game, product layer milestone)*
*Researched: 2026-09-09*
