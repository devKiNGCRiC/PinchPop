import { Gavel, ShieldAlert, Siren, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Seo } from "@/components/Seo";
import { CONTACT_EMAIL } from "@/lib/social";

interface Section {
  title: string;
  body: string;
  Icon: LucideIcon;
}

const SECTIONS: Section[] = [
  {
    title: "13 or older to sign in",
    body: "Camera mode and playing without an account have no age gate — it's just a browser game. An account needs you to be at least 13, with a parent or guardian's permission if you're under 18.",
    Icon: UserCheck,
  },
  {
    title: "Your photos stay yours",
    body: "Saving or sharing a photo in PinchPop never transfers ownership. You're only giving PinchPop permission to store and display it back to you, and to anyone you choose to share it with.",
    Icon: ShieldAlert,
  },
  {
    title: "Report a copyright problem",
    body: "If someone shared a photo on PinchPop that's yours and they didn't have the right to post it, email the copyright contact below with the details — see the notice-and-takedown section.",
    Icon: Siren,
  },
  {
    title: "One person to contact, two roles",
    body: "The same person handles both copyright complaints and user grievances under India's IT Rules. Contact details are in both sections below.",
    Icon: Gavel,
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Terms"
        description="Who can use PinchPop, what happens to content you share, and how to report a copyright problem."
        path="/terms"
      />
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
        Terms
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        PinchPop is a small, independently-run project. These terms cover who can use it, what
        happens to photos you choose to share, and how to report a problem. They're written in plain
        language on purpose — see the detailed sections below for the full process.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {SECTIONS.map(({ title, body, Icon }) => (
          <li key={title} className="sticker-lg rounded-3xl bg-white p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-saffron text-white shadow-pop-sm">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-2 text-lg leading-snug text-ink-soft">{body}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="age-heading" className="mt-12">
        <h2 id="age-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Who can use PinchPop
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Playing without an account — including camera mode — has no minimum age; it's a browser
          game that keeps everything on your own device. Creating an account requires you to be at
          least 13 years old. If you're between 13 and 18, you confirm you have a parent or
          guardian's permission to use it. If the law where you live sets a higher minimum age for
          creating an online account without parental consent (for example, several countries set
          this at 16), that higher age applies to you instead.
        </p>
      </section>

      <section aria-labelledby="content-heading" className="mt-10">
        <h2 id="content-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Your content
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          You keep ownership of every photo you take or upload. Using PinchPop to store, display, or
          share a photo only grants PinchPop the limited permission needed to operate the features
          you use — for example, showing your own polaroid back to you, or displaying it on a public
          share link you've chosen to turn on. You're responsible for only uploading or sharing
          photos you have the right to use. Turning off public sharing for a run (or deleting it)
          removes it from any link you'd shared.
        </p>
      </section>

      <section aria-labelledby="copyright-heading" className="mt-10">
        <h2 id="copyright-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Copyright complaints (notice and takedown)
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          If you believe a photo shared on PinchPop infringes your copyright, send a notice to the
          copyright contact below. To be valid, it should include:
        </p>
        <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-6 text-lg leading-relaxed text-ink-soft">
          <li>Your physical or electronic signature.</li>
          <li>A description of the copyrighted work you claim is infringed.</li>
          <li>The URL or other specific location of the material on PinchPop.</li>
          <li>Your contact information — address, phone number, and email.</li>
          <li>
            A statement that you have a good-faith belief the use isn't authorized by the copyright
            owner, its agent, or the law.
          </li>
          <li>
            A statement, made under penalty of perjury, that the above is accurate and that you're
            authorized to act for the copyright owner.
          </li>
        </ul>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Send notices to the copyright contact:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-chakra underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          . Valid notices are acted on promptly, which may include removing or disabling access to
          the reported content. If you believe content was removed in error, you can send a
          counter-notice to the same address identifying the material and explaining why. Accounts
          found to be repeat infringers may be suspended or terminated.
        </p>
      </section>

      <section aria-labelledby="grievance-heading" className="mt-10">
        <h2 id="grievance-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Grievance Officer (India)
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Under India's Information Technology (Intermediary Guidelines and Digital Media Ethics
          Code) Rules, 2021, complaints about content on PinchPop — copyright or otherwise — can
          also be raised with the Grievance Officer:
        </p>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Raj Roy
          <br />
          Email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-chakra underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Complaints are acknowledged within 24 hours and resolved within 15 days, as the Rules
          require.
        </p>
      </section>

      <section aria-labelledby="liability-heading" className="mt-10">
        <h2 id="liability-heading" className="font-display text-2xl font-extrabold tracking-tight">
          No warranty, and a reasonable limit on liability
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          PinchPop is provided "as is", as a free, independently-run project, without warranties of
          any kind. To the extent the law allows, PinchPop and the person who runs it aren't liable
          for indirect, incidental, or consequential damages arising from your use of it. Nothing
          here limits liability where the law doesn't allow it to be limited.
        </p>
      </section>

      <section aria-labelledby="law-heading" className="mt-10">
        <h2 id="law-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Governing law and changes to these terms
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          These terms are governed by the laws of India, where PinchPop is operated from. They may
          be updated from time to time; the version here is always the current one. For anything not
          covered here, see the{" "}
          <Link to="/privacy" className="font-semibold text-chakra underline underline-offset-4">
            Privacy
          </Link>{" "}
          page, or write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-chakra underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
