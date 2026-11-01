import { MenuOutlined } from "@ant-design/icons";
import { Drawer, FloatButton } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import { NavMenu } from "./NavMenu";

// Below bp-md: an ink button at the bottom right opening the menu in a bottom
// drawer. antd traps focus in the drawer and returns it to the button. The
// button keeps antd's own position (24px from the right, 48px from the
// bottom): its two-class selector outranks a CSS Module class. The language
// switch sits in the drawer's footer, below the menu list.
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
      />
      <Drawer
        placement="bottom"
        size="auto"
        open={open}
        onClose={() => setOpen(false)}
        title={t("nav.menu")}
        footer={<LanguageSwitch label="code" placement="topLeft" />}
      >
        <nav aria-label={t("nav.label")}>
          <NavMenu onNavigate={() => setOpen(false)} />
        </nav>
      </Drawer>
    </>
  );
}
