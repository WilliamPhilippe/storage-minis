import "antd/dist/reset.css";
import "./ui/tokens.css";
import "./ui/antd-overrides.css";
import "./ui/base.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { detectLanguage, initI18n } from "./i18n/i18n";
import { firebaseWebConfig } from "./lib/session/config";
import { checkSavedSession } from "./lib/session/savedSession";
import { createSession, type Session } from "./lib/session/session";
import { connectSession, queryClient, trpcClient } from "./lib/trpc";
import { createAppRouter } from "./router";
import { AppProviders } from "./ui/AppProviders";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("The page has no #root element.");
}
const root = rootElement;

// The page's session (sign-in plan SI-09 to SI-12). Firebase loads only when
// /login or /app asks for the session, after the startup check.
function createAppSession(): Session {
  const config = firebaseWebConfig();
  const session = createSession({
    queryClient,
    checkSavedSession: () => checkSavedSession(config.apiKey),
    loadAuth: async () =>
      (await import("./lib/session/firebase")).createFirebaseAuth(),
    fetchSession: () => trpcClient.session.get.query(),
    signInContext: () => ({
      authDomain: config.authDomain,
      host: window.location.host,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    }),
  });
  connectSession(session);
  return session;
}

// Languages load before the first render (WS-09).
async function boot(): Promise<void> {
  await initI18n(detectLanguage());
  const session = createAppSession();
  const router = createAppRouter({ queryClient, session });
  session.connectRouter(router);
  // Playwright's test sign-in (SI-17): development builds only, so a
  // production build contains neither the hook nor its name.
  if (import.meta.env.DEV) {
    void import("./lib/session/testSignIn").then(({ installTestSignIn }) => {
      installTestSignIn(session);
    });
  }
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
