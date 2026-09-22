import { Cookie, Database, Eye, ShieldCheck, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { PopButton } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { clearMemories, useMemories } from "@/lib/memories";
import { formatDate } from "@/lib/stats";

interface Section {
  title: string;
  body: string;
  Icon: LucideIcon;
}

const SECTIONS: Section[] = [
  {
    title: "Your camera video never leaves your browser",
    body: "Hand tracking (MediaPipe) runs entirely on your device. PinchPop has no server to send video to, and never records or uploads your camera feed.",
    Icon: ShieldCheck,
  },
  {
    title: "Only what you save is kept",
    body: "When you save a polaroid, a small copy of that one photo — plus your score, moves and time — is stored in this browser's local storage. Nothing is kept unless you save it.",
    Icon: Database,
  },
  {
    title: "Everything stays on this device",
    body: "Your album, passport stamps and leaderboard runs live only in this browser. They are not sent anywhere, and switching devices or browsers starts you fresh. Accounts and cross-device sync are planned but not built yet.",
    Icon: Eye,
  },
  {
    title: "No cookies, no trackers, no ads",
    body: "PinchPop does not use analytics, advertising or tracking cookies. The one thing kept in storage is your own game data, described above.",
    Icon: Cookie,
  },
];

export default function PrivacyPage() {
  const memories = useMemories();
  const hasData = memories.length > 0;
  const oldestLabel = hasData ? formatDate(Math.min(...memories.map((m) => m.createdAt))) : "";

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Privacy"
        description="What PinchPop stores, where it stores it, and what camera mode does and doesn't do with your video."
        path="/privacy"
      />
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
        Privacy
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        PinchPop is built to need as little as possible from you. Here is exactly what happens to
        your camera and your data.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {SECTIONS.map(({ title, body, Icon }) => (
          <li key={title} className="sticker-lg rounded-3xl bg-white p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-leaf text-white shadow-pop-sm">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-2 text-lg leading-snug text-ink-soft">{body}</p>
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="data-heading"
        className="sticker-lg mt-12 rounded-3xl bg-cloud p-6 sm:p-8"
      >
        <h2 id="data-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Your data on this device
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {hasData
            ? `You have ${memories.length} saved run${memories.length === 1 ? "" : "s"}, the oldest from ${oldestLabel}. You can review them in your `
            : "You have no saved runs on this device yet. Once you do, you can review them in your "}
          {hasData ? (
            <>
              <Link
                to="/gallery"
                className="font-semibold text-chakra underline underline-offset-4"
              >
                album
              </Link>
              , or clear everything below.
            </>
          ) : (
            <Link to="/gallery" className="font-semibold text-chakra underline underline-offset-4">
              album
            </Link>
          )}
          {!hasData ? "." : null}
        </p>
        {hasData ? (
          <div className="mt-5">
            <PopButton
              tone="coral"
              onClick={() => {
                if (
                  window.confirm("Delete every saved polaroid, stamp and score on this device?")
                ) {
                  clearMemories();
                }
              }}
            >
              <Trash2 className="size-5" aria-hidden="true" />
              Clear all my data
            </PopButton>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="future-heading" className="mt-10">
        <h2
          id="future-heading"
          className="font-display text-xl font-extrabold tracking-tight text-ink-soft"
        >
          If accounts arrive later
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Signing in will move your saved runs to secure, private cloud storage so they follow you
          across devices. This page will be updated to describe exactly what changes before that
          ships — nothing about how your data is handled today will change without notice here.
        </p>
      </section>
    </div>
  );
}
