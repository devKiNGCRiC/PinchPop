export const SITE_NAME = "PinchPop";
export const DEFAULT_DESCRIPTION =
  "PinchPop is a gesture-controlled photobooth game: frame a photo with your hands, pinch to capture it, then solve the puzzle to reveal your polaroid.";

/**
 * The deployed site's origin, with no trailing slash. Set VITE_SITE_URL once the app has a real
 * domain (see .env.example) — until then this placeholder keeps canonical/OG URLs well-formed.
 */
export const SITE_URL: string = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://pinchpop.vercel.app"
).replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
