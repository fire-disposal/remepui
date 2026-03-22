import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import { router } from "./app/router";
import { AppProviders } from "./app/providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
