import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import { router } from "./app/router";
import { AppProviders } from "./app/providers";

// 生产环境也保留基础启动期错误日志，便于定位白屏问题
window.addEventListener("error", (event) => {
  console.error("[BOOTSTRAP] Uncaught error:", event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[BOOTSTRAP] Unhandled promise rejection:", event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('[BOOTSTRAP] Missing #root container in index.html');
  throw new Error('Missing #root container in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
