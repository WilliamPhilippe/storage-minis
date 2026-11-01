import "antd/dist/reset.css";
import "./ui/tokens.css";
import "./ui/antd-overrides.css";
import "./ui/base.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { detectLanguage, initI18n } from "./i18n/i18n";
import { AppProviders } from "./ui/AppProviders";
import { LanguageSwitch } from "./ui/LanguageSwitch";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("The page has no #root element.");
}
const root = rootElement;

// Languages load before the first render (WS-09).
async function boot(): Promise<void> {
  await initI18n(detectLanguage());
  createRoot(root).render(
    <StrictMode>
      <AppProviders>
        <LanguageSwitch />
      </AppProviders>
    </StrictMode>,
  );
}

boot().catch(() => {
  // No catalog loaded, so the message is plain text in both languages.
  root.textContent =
    "StorageMinis couldn't load. Check your connection and reload the page. · " +
    "O StorageMinis não carregou. Verifique sua conexão e recarregue a página.";
});
