// Source: https://github.com/remix-run/react-router/blob/main/docs/start/data/routing.md (Context7)
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { Chakra } from "@/components/Chakra";
import ErrorPage from "@/pages/ErrorPage";
import GalleryPage from "@/pages/GalleryPage";
import GamePage from "@/pages/GamePage";
import HomePage from "@/pages/HomePage";
import HowToPlayPage from "@/pages/HowToPlayPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProfilePage from "@/pages/ProfilePage";
import ResultsPage from "@/pages/ResultsPage";
import SharePage from "@/pages/SharePage";

// Shown while a lazily loaded route (such as camera mode) downloads on a direct page load.
function BootFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-ivory">
      <Chakra spokes={24} className="size-16 animate-spin text-chakra" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <ErrorPage />,
    HydrateFallback: BootFallback,
    children: [
      { index: true, element: <HomePage /> },
      { path: "game", element: <GamePage /> },
      {
        path: "camera",
        // Loaded on demand so the hand-tracking code only downloads when someone opens camera mode.
        lazy: async () => ({ Component: (await import("@/pages/CameraPage")).default }),
      },
      { path: "results", element: <ResultsPage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "how-to-play", element: <HowToPlayPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "share/:slug", element: <SharePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
