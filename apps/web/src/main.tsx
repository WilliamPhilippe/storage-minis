import "antd/dist/reset.css";
import "./ui/tokens.css";
import "./ui/antd-overrides.css";
import "./ui/base.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { detectLanguage, initI18n } from "./i18n/i18n";
import { queryClient } from "./lib/trpc";
import { createAppRouter } from "./router";
import { AppProviders } from "./ui/AppProviders";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("The page has no #root element.");
}
const root = rootElement;

// Languages load before the first render (WS-09).
async function boot(): Promise<void> {
  await initI18n(detectLanguage());
  const router = createAppRouter({ queryClient });
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </QueryClientProvider>
    </StrictMode>,
  );
}

boot().catch(() => {
  // No catalog loaded, so the message is plain text in both languages.
  root.textContent =
    "StorageMinis couldn't load. Check your connection and reload the page. · " +
    "O StorageMinis não carregou. Verifique sua conexão e recarregue a página.";
});
