import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppNotFoundPage } from "../../features/errors/AppNotFoundPage";
import { AppShell } from "../../features/shell/AppShell";
import { ensureNamespace } from "../../i18n/i18n";

export const Route = createFileRoute("/app")({
  // The guard (SI-12): a member's session joins the router context for every
  // /app route and `useSession()`. It is not an authorization boundary; the
  // API is.
  beforeLoad: async ({ context, location }) => {
    const state = await context.session.ensure();
    if (state.status === "member") {
      return { member: state.member };
    }
    // Signed out: back here after signing in. No access: state 4.
    throw redirect({
      to: "/login",
      search: state.status === "signedOut" ? { redirect: location.href } : {},
    });
  },
  loader: () => ensureNamespace("app"),
  component: AppShell,
  notFoundComponent: AppNotFoundPage,
});
