import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderCardProps {
  heading: string;
  body: string;
}

export function PlaceholderCard({ heading, body }: PlaceholderCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-md border border-paper-border bg-paper text-ink">
        <CardHeader>
          <CardTitle className="text-[22px] leading-[1.2] font-semibold text-ink md:text-[28px]">
            {heading}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-[1.5] text-ink-soft">{body}</p>
        </CardContent>
      </Card>
    </div>
  );
}
