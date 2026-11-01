import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../features/login/LoginPage";
import { ensureNamespace } from "../i18n/i18n";

export const Route = createFileRoute("/login")({
  loader: () => ensureNamespace("login"),
  component: LoginPage,
});
