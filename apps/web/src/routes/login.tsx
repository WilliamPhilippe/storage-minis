import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/login/LoginPage";
import {
  appRedirect,
  validateLoginSearch,
} from "../features/login/loginSearch";
import { ensureNamespace } from "../i18n/i18n";

export const Route = createFileRoute("/login")({
  validateSearch: validateLoginSearch,
  // Loads Firebase (SI-09); a member goes on to /app or the page they asked
  // for. `noAccess` has already signed out and left state 4's notice. The
  // target is checked again here: an `href` outside the app would leave it.
  beforeLoad: async ({ context, search }) => {
    const state = await context.session.ensure();
    if (state.status === "member") {
      throw redirect({ href: appRedirect(search.redirect) ?? "/app" });
    }
  },
  loader: () => ensureNamespace("login"),
  component: LoginPage,
});
