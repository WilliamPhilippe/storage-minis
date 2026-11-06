import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Button, Tooltip } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Sign out of this browser (T02 AU-04): right above the language switch, in
// the SideNav's footer from bp-md and the menu drawer's footer below it
// (owner, 2026-11-06; sign-in plan SI-13 had it at the right of the TopBar).
// A text button like its neighbours; the collapsed SideNav shows the icon
// alone, keeps the name, and shows it in a tooltip on the right, as antd does
// for the menu's items (owner, 2026-11-06). The account menu with "Sign out of
// all devices" follows in #130.
export function SignOutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const { t } = useTranslation("app");
  const session = useRouteContext({
    from: "/app",
    select: (context) => context.session,
  });
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      // Cancels queries, clears the cache and signs out of Firebase.
      await session.signOut();
    } finally {
      // State 1; other tabs follow through Firebase.
      await navigate({ to: "/login" });
    }
  }

  const button = (
    <Button
      type="text"
      icon={<LogoutOutlined aria-hidden />}
      aria-label={iconOnly ? t("account.signOut") : undefined}
      loading={busy}
      onClick={() => {
        void signOut();
      }}
    >
      {!iconOnly && t("account.signOut")}
    </Button>
  );
  return iconOnly ? (
    <Tooltip title={t("account.signOut")} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}
