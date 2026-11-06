import { Link } from "@tanstack/react-router";
import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";
import logoUrl from "../../ui/assets/logo.png";
import { SignOutButton } from "./SignOutButton";
import styles from "./TopBar.module.css";

// Phones: the logo, linking to /app. From bp-md: the page title (the logo
// lives in the SideNav) and the Sign out button on the right, where the
// account menu will go (#130). The language switch lives in the SideNav and
// the MenuFab's drawer (owner, 2026-11-01), with Sign out on phones.
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
        <>
          {title !== undefined && (
            <Typography.Title level={1}>{title}</Typography.Title>
          )}
          <div className={styles.actions}>
            <SignOutButton />
          </div>
        </>
      )}
    </Layout.Header>
  );
}
