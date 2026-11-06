import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Sign out of this browser (T02 AU-04, sign-in plan SI-13): top right of the
// TopBar from bp-md, in the menu drawer's footer below it. The account menu
// with "Sign out of all devices" replaces it in #130.
export function SignOutButton() {
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

  return (
    <Button
      icon={<LogoutOutlined aria-hidden />}
      loading={busy}
      onClick={() => {
        void signOut();
      }}
    >
      {t("account.signOut")}
    </Button>
  );
}
