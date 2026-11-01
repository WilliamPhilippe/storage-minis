import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePageTitleKey } from "./pageTitle";

// "Inventory · StorageMinis", or "StorageMinis" without a title; updates on
// navigation and on a language switch.
export function RootLayout() {
  const { t } = useTranslation();
  const titleKey = usePageTitleKey();
  const title = titleKey
    ? `${t(`titles.${titleKey}`, { ns: "app" })} · ${t("brand")}`
    : t("brand");

  useEffect(() => {
    document.title = title;
  }, [title]);

  return <Outlet />;
}
