// Labels follow the travel metaphor: the gallery is your album, the profile is your passport.
export const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/game", label: "Play", end: false },
  { to: "/leaderboard", label: "Leaderboard", end: false },
  { to: "/gallery", label: "Album", end: false },
  { to: "/profile", label: "Passport", end: false },
];

// Help pages that live in the footer and mobile menu rather than the top bar.
export const EXTRA_LINKS = [{ to: "/how-to-play", label: "How to play", end: false }];

export const ALL_LINKS = [...NAV_LINKS, ...EXTRA_LINKS];
