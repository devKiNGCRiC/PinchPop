import { useEffect } from "react";

import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_NAME,
} from "@/lib/seo";

interface SeoProps {
  /** Rendered as "{title} · PinchPop". Pass the page name only, not the full site title. */
  title: string;
  description?: string;
  /** The route this page lives at, e.g. "/how-to-play". Used for the canonical link and og:url. */
  path: string;
  /**
   * True for pages that hold this device's own data (album, passport, results, a share link) or
   * are utility chrome (404, error) — real content for the visitor, not something worth a search
   * result, and every device would otherwise show Google the same URL with different content.
   */
  noIndex?: boolean;
}

type MetaSelector = { attr: "name" | "property"; key: string } | { rel: string };

function upsert(selector: MetaSelector, valueAttr: "content" | "href", value: string): void {
  const query =
    "attr" in selector ? `meta[${selector.attr}="${selector.key}"]` : `link[rel="${selector.rel}"]`;
  let el = document.head.querySelector<HTMLElement>(query);
  if (!el) {
    el = document.createElement("attr" in selector ? "meta" : "link");
    if ("attr" in selector) el.setAttribute(selector.attr, selector.key);
    else el.setAttribute("rel", selector.rel);
    document.head.appendChild(el);
  }
  el.setAttribute(valueAttr, value);
}

/**
 * Per-route title, description, canonical link and social-preview tags.
 *
 * React 19 hoists a rendered <title> for us and correctly replaces it on navigation, but it does
 * not dedupe rendered <meta>/<link> tags against ones already sitting in the static index.html —
 * it just adds a second copy alongside them, and tools that read "the" og:title etc. (including
 * some crawlers) take whichever comes first in the document, which would be the wrong, site-wide
 * one. So title uses JSX (React's native handling is correct for it); everything else is written
 * by updating the single existing tag from index.html in place, via an effect.
 *
 * Caveat that doesn't change with this fix: only real browsers and crawlers that execute
 * JavaScript (Googlebot does) ever see the update at all. Link-preview bots (Facebook, X,
 * Discord, WhatsApp, iMessage) fetch the static index.html only, so they always see the
 * site-wide title/description/image from index.html, not this per-page one. Per-page social
 * cards (for a shared photo, say) need a server or edge function to render — that lands with the
 * Supabase phase, not before.
 */
export function Seo({ title, description = DEFAULT_DESCRIPTION, path, noIndex = false }: SeoProps) {
  const fullTitle = `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE_PATH);

  useEffect(() => {
    upsert({ attr: "name", key: "description" }, "content", description);
    upsert(
      { attr: "name", key: "robots" },
      "content",
      noIndex ? "noindex, follow" : "index, follow",
    );
    upsert({ rel: "canonical" }, "href", url);

    upsert({ attr: "property", key: "og:title" }, "content", fullTitle);
    upsert({ attr: "property", key: "og:description" }, "content", description);
    upsert({ attr: "property", key: "og:url" }, "content", url);
    upsert({ attr: "property", key: "og:image" }, "content", image);
    upsert({ attr: "property", key: "og:image:width" }, "content", String(OG_IMAGE_WIDTH));
    upsert({ attr: "property", key: "og:image:height" }, "content", String(OG_IMAGE_HEIGHT));

    upsert({ attr: "name", key: "twitter:title" }, "content", fullTitle);
    upsert({ attr: "name", key: "twitter:description" }, "content", description);
    upsert({ attr: "name", key: "twitter:image" }, "content", image);
  }, [description, fullTitle, image, noIndex, url]);

  return <title>{fullTitle}</title>;
}
