import { createFileRoute } from "@tanstack/react-router";
import { AppNotFoundPage } from "../../features/errors/AppNotFoundPage";
import { AppShell } from "../../features/shell/AppShell";
import { ensureNamespace } from "../../i18n/i18n";

export const Route = createFileRoute("/app")({
  loader: () => ensureNamespace("app"),
  component: AppShell,
  notFoundComponent: AppNotFoundPage,
});
