import { Link } from "react-router-dom";

import { StubLayout } from "@/components/PlaceholderCard";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <StubLayout>
      <div className="w-full max-w-md rounded-2xl border-[1.5px] border-danger/40 bg-paper-raised p-6 text-left shadow-xl shadow-ink/8 sm:p-8">
        <title>Page not found · PinchPop</title>
        <h1 className="font-heading text-[22px] leading-[1.15] font-bold text-danger md:text-[30px]">
          Page not found.
        </h1>
        <p className="mt-3 font-sans text-base leading-[1.6] font-normal text-ink-soft">
          We couldn't find that page. Head back and keep exploring PinchPop.
        </p>
        <Button
          asChild
          variant="outline"
          className="press mt-6 h-12 min-h-11 rounded-2xl border-[1.5px] border-ink bg-paper-raised px-6 font-sans text-base font-semibold text-ink hover:bg-paper-raised hover:text-ink"
        >
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </StubLayout>
  );
}
