import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Layout } from "antd";
import { useTranslation } from "react-i18next";
import logoUrl from "../../ui/assets/logo.png";
import markUrl from "../../ui/assets/mark.png";
import { NavMenu } from "./NavMenu";
import styles from "./SideNav.module.css";

// From bp-md. antd's built-in trigger is a div with no role, focus or label,
// so the toggle is our own button (WS-07 #6): "Collapse" with its icon when
// expanded, an icon-only "Expand menu" when collapsed.
export function SideNav({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const { t: tApp } = useTranslation("app");
  return (
    <Layout.Sider
      theme="light"
      collapsed={collapsed}
      trigger={null}
      width={240}
      collapsedWidth={72}
      className={styles.sider}
    >
      <div className={styles.column}>
        <Link
          to="/app"
          activeOptions={{ exact: true }}
          className={collapsed ? styles.markLink : styles.logoLink}
        >
          {collapsed ? (
            <img src={markUrl} alt={t("brand")} width={32} height={21} />
          ) : (
            <img src={logoUrl} alt={t("brand")} width={188} height={20} />
          )}
        </Link>
        <nav aria-label={tApp("nav.label")} className={styles.nav}>
          <NavMenu />
        </nav>
        <div className={styles.toggle}>
          {collapsed ? (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined aria-hidden />}
              aria-label={tApp("nav.expand")}
              aria-expanded={false}
              onClick={onToggle}
            />
          ) : (
            <Button
              type="text"
              icon={<MenuFoldOutlined aria-hidden />}
              aria-expanded
              onClick={onToggle}
            >
              {tApp("nav.collapse")}
            </Button>
          )}
        </div>
      </div>
    </Layout.Sider>
  );
}
