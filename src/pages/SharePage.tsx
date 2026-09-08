import { useParams } from "react-router-dom";

import { PlaceholderCard } from "@/components/PlaceholderCard";

export default function SharePage() {
  const { slug } = useParams();

  return (
    <div data-share-slug={slug}>
      <PlaceholderCard
        heading="Shared memory coming soon"
        body="Public share pages launch in a later phase."
      />
    </div>
  );
}
