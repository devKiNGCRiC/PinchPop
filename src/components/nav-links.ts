// Labels follow the travel metaphor: the gallery is your album, the profile is your passport.
export const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/game", label: "Play", end: false },
  { to: "/polaroid", label: "Make a polaroid", end: false },
  { to: "/leaderboard", label: "Leaderboard", end: false },
  { to: "/gallery", label: "Album", end: false },
  { to: "/profile", label: "Passport", end: false },
];

// Help pages that live in the footer and mobile menu rather than the top bar. Camera mode already
// gets its own prominent CTA button in the desktop nav bar (see NavBar.tsx), so it isn't repeated
// here as a plain link on desktop — only the mobile menu lists it, via ALL_LINKS below.
export const EXTRA_LINKS = [
  { to: "/account", label: "Account", end: false },
  { to: "/camera", label: "Camera mode", end: false },
  { to: "/how-to-play", label: "How to play", end: false },
  { to: "/about", label: "About", end: false },
  { to: "/privacy", label: "Privacy", end: false },
];

const BY_PATH = new Map([...NAV_LINKS, ...EXTRA_LINKS].map((item) => [item.to, item]));
function link(to: string) {
  const found = BY_PATH.get(to);
  if (!found) throw new Error(`Unknown nav link: ${to}`);
  return found;
}

// The mobile menu and footer's own order — not a plain NAV_LINKS+EXTRA_LINKS concatenation.
// Camera mode is promoted up near the top (right after Play), since mobile has no separate
// dedicated Camera mode button the way desktop does; everything else keeps its existing order.
export const ALL_LINKS = [
  link("/"),
  link("/game"),
  link("/camera"),
  link("/polaroid"),
  link("/profile"),
  link("/leaderboard"),
  link("/gallery"),
  link("/account"),
  link("/how-to-play"),
  link("/about"),
  link("/privacy"),
];
