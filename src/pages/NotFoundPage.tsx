import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-md border border-danger/40 bg-paper text-ink">
        <CardHeader>
          <CardTitle className="text-[22px] leading-[1.2] font-semibold text-danger md:text-[28px]">
            Page not found.
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-6">
          <p className="text-base leading-[1.5] text-ink-soft">
            We couldn't find that page. Head back and keep exploring PinchPop.
          </p>
          <Button asChild variant="secondary">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
