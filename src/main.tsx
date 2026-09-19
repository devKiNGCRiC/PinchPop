import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/unbounded/800.css";
import "@fontsource/bricolage-grotesque/400.css";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/caveat/700.css";
import "./index.css";

import { AppRouter } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
