import { Outlet } from "@tanstack/react-router";
import { Grid, Layout, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AppShell.module.css";
import { MenuFab } from "./MenuFab";
import { usePageTitleKey } from "./pageTitle";
import { SideNav } from "./SideNav";
import { readSideNavChoice, saveSideNavChoice } from "./sideNavChoice";
import { TopBar } from "./TopBar";

// The /app layout (WS-08). Below bp-md: TopBar with the logo, the title at
// the top of the content and the MenuFab. From bp-md: SideNav, and the title
// in the TopBar. The title renders once, as the page's h1.
export function AppShell() {
  const { t } = useTranslation("app");
  const screens = Grid.useBreakpoint();
  const isPhone = !screens.md;
  const [choice, setChoice] = useState(readSideNavChoice);
  // Collapsed by default from bp-md to bp-lg; a saved choice wins.
  const collapsed = choice ? choice === "collapsed" : !screens.lg;
  const titleKey = usePageTitleKey();
  const title = titleKey ? t(`titles.${titleKey}`) : undefined;

  function toggleSideNav() {
    const next = collapsed ? "expanded" : "collapsed";
    setChoice(next);
    saveSideNavChoice(next);
  }

  return (
    <Layout hasSider={!isPhone} className={styles.shell}>
      {!isPhone && <SideNav collapsed={collapsed} onToggle={toggleSideNav} />}
      <Layout>
        <TopBar isPhone={isPhone} title={title} />
        <Layout.Content className={styles.content}>
          <div className={styles.inner}>
            {isPhone && title !== undefined && (
              <Typography.Title level={1}>{title}</Typography.Title>
            )}
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
      {isPhone && <MenuFab />}
    </Layout>
  );
}
