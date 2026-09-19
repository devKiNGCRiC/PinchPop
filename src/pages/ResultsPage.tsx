import { Sparkles } from "lucide-react";

import { PlaceholderCard, StubLayout } from "@/components/PlaceholderCard";

export default function ResultsPage() {
  return (
    <StubLayout>
      <PlaceholderCard
        icon={Sparkles}
        heading="Results coming soon"
        body="Your photo and score will appear here once the capture flow is built."
      />
    </StubLayout>
  );
}
