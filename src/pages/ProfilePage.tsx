import { Camera } from "lucide-react";

import { PlaceholderCard, StubLayout } from "@/components/PlaceholderCard";

export default function ProfilePage() {
  return (
    <StubLayout>
      <PlaceholderCard
        icon={Camera}
        heading="Profile coming soon"
        body="Your stats and achievements will appear here in a later phase."
      />
    </StubLayout>
  );
}
