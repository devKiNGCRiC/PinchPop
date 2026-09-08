// Source: https://github.com/remix-run/react-router/blob/main/docs/start/data/routing.md (Context7)
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import GalleryPage from "@/pages/GalleryPage";
import GamePage from "@/pages/GamePage";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProfilePage from "@/pages/ProfilePage";
import ResultsPage from "@/pages/ResultsPage";
import SharePage from "@/pages/SharePage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "game", element: <GamePage /> },
      { path: "results", element: <ResultsPage /> },
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
