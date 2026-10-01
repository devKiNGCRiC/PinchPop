import type { SocialLink } from "@/lib/social";
import { CORE_LINKS } from "@/lib/social";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  links?: SocialLink[];
  /** Icon-only (default, for a quiet footer accent) or icon-plus-label pills (to tell the two
   * Instagram accounts apart on the About page). */
  showLabels?: boolean;
  className?: string;
}

/** Links to the maker's profiles. Icon-only by default; pass `showLabels` where two links could
 * otherwise look identical (the two Instagram accounts). */
export function SocialLinks({
  links = CORE_LINKS,
  showLabels = false,
  className,
}: SocialLinksProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
            aria-label={link.label}
            className={cn(
              "flex items-center transition-colors hover:text-marigold",
              showLabels
                ? "sticker gap-2 rounded-full border-[2.5px] border-ink bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-marigold hover:text-ink"
                : "size-9 justify-center rounded-full",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={link.path} />
            </svg>
            {showLabels ? <span>{link.label}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
