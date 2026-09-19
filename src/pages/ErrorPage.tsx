import { Link, useRouteError } from "react-router-dom";

import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";

/** Last-resort screen for an unexpected render or loader error; rendered outside AppShell. */
export default function ErrorPage() {
  const error = useRouteError();
  console.warn("[PinchPop] Route error:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper px-4 text-ink">
      <title>Something went wrong · PinchPop</title>
      <Wordmark className="text-shutter" />
      <div className="w-full max-w-md rounded-2xl border-[1.5px] border-danger/40 bg-paper-raised p-6 text-left shadow-xl shadow-ink/8 sm:p-8">
        <h1 className="font-heading text-[22px] leading-[1.15] font-bold text-danger md:text-[30px]">
          Something went wrong.
        </h1>
        <p className="mt-3 font-sans text-base leading-[1.6] font-normal text-ink-soft">
          PinchPop hit an unexpected error. Reload the page, or head back home and try again.
        </p>
        <Button
          asChild
          variant="outline"
          className="press mt-6 h-12 min-h-11 rounded-2xl border-[1.5px] border-ink bg-paper-raised px-6 font-sans text-base font-semibold text-ink hover:bg-paper-raised hover:text-ink"
        >
          <Link to="/" reloadDocument>
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
