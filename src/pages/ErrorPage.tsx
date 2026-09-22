import { useRouteError } from "react-router-dom";

import { PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { Wordmark } from "@/components/Wordmark";

/** Last-resort screen for an unexpected render or loader error; rendered outside AppShell. */
export default function ErrorPage() {
  const error = useRouteError();
  console.warn("[PinchPop] Route error:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ivory px-5 text-center text-ink">
      <Seo
        title="Something went wrong"
        description="PinchPop hit an unexpected error."
        path="/error"
        noIndex
      />
      <Wordmark />
      <div className="sticker-lg max-w-md rounded-3xl bg-cloud p-8">
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-[-0.04em] text-sindoor">
          Something went wrong.
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          PinchPop hit an unexpected error. Reload the page, or head back home and try again.
        </p>
        <div className="mt-6">
          <PopLink to="/" reloadDocument tone="saffron" size="lg">
            Back to home
          </PopLink>
        </div>
      </div>
    </div>
  );
}
