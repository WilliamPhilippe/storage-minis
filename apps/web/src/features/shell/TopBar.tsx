import { Link } from "@tanstack/react-router";
import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";
import logoUrl from "../../ui/assets/logo.png";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import styles from "./TopBar.module.css";

// Phones: the logo, linking to /app. From bp-md: the page title (the logo
// lives in the SideNav). Until PR 3 builds the account menu, the language
// switch stands alone on the right (WS-07 #10).
export function TopBar({
  isPhone,
  title,
}: {
  isPhone: boolean;
  title: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <Layout.Header className={styles.header}>
      {isPhone ? (
        <Link
          to="/app"
          activeOptions={{ exact: true }}
          className={styles.logoLink}
        >
          <img
            src={logoUrl}
            alt={t("brand")}
            width={188}
            height={20}
            className={styles.logo}
          />
        </Link>
      ) : (
        title !== undefined && (
          <Typography.Title level={1}>{title}</Typography.Title>
        )
      )}
      <div className={styles.actions}>
        <LanguageSwitch />
      </div>
    </Layout.Header>
  );
}
