import { Share2 } from "lucide-react";
import { useParams } from "react-router-dom";

import { PlaceholderCard, StubLayout } from "@/components/PlaceholderCard";

export default function SharePage() {
  const { slug } = useParams();

  return (
    <div data-share-slug={slug}>
      <StubLayout>
        <PlaceholderCard
          icon={Share2}
          heading="Shared memory coming soon"
          body="Public share pages launch in a later phase."
        />
      </StubLayout>
    </div>
  );
}
