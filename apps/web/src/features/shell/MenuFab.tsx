import { MenuOutlined } from "@ant-design/icons";
import { Drawer, FloatButton } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import styles from "./MenuFab.module.css";
import { NavMenu } from "./NavMenu";
import { SignOutButton } from "./SignOutButton";

// Below bp-md: an ink button at the bottom right opening the menu in a bottom
// drawer. antd traps focus in the drawer and returns it to the button. The
// button sits fab-offset plus the safe-area inset from the bottom edge; the
// language switch and the Sign out button (SI-13) sit in the drawer's footer,
// above the inset, and on short screens the menu scrolls inside the drawer
// (SF-02 to SF-04).
export function MenuFab() {
  const { t } = useTranslation("app");
  const [open, setOpen] = useState(false);
  return (
    <>
      <FloatButton
        type="primary"
        icon={<MenuOutlined aria-hidden />}
        aria-label={t("nav.open")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={styles.fab}
      />
      <Drawer
        placement="bottom"
        size="auto"
        open={open}
        onClose={() => setOpen(false)}
        title={t("nav.menu")}
        classNames={{ section: styles.drawer }}
        footer={
          <div className={styles.drawerFooter}>
            <LanguageSwitch placement="topLeft" />
            <SignOutButton />
          </div>
        }
      >
        <nav aria-label={t("nav.label")}>
          <NavMenu onNavigate={() => setOpen(false)} />
        </nav>
      </Drawer>
    </>
  );
}
