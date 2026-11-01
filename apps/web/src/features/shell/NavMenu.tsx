import {
  BarChartOutlined,
  CreditCardOutlined,
  InboxOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu } from "antd";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import styles from "./NavMenu.module.css";

type Section =
  | "inventory"
  | "purchases"
  | "sales"
  | "customers"
  | "payments"
  | "reports"
  | "catalog"
  | "settings";

// MenuFab.md order.
const sections: {
  key: Section;
  to: `/app/${Section}`;
  Icon: ComponentType<{ "aria-hidden": boolean }>;
}[] = [
  { key: "inventory", to: "/app/inventory", Icon: InboxOutlined },
  { key: "purchases", to: "/app/purchases", Icon: ShoppingCartOutlined },
  { key: "sales", to: "/app/sales", Icon: TagsOutlined },
  { key: "customers", to: "/app/customers", Icon: TeamOutlined },
  { key: "payments", to: "/app/payments", Icon: CreditCardOutlined },
  { key: "reports", to: "/app/reports", Icon: BarChartOutlined },
  { key: "catalog", to: "/app/catalog", Icon: ShopOutlined },
  { key: "settings", to: "/app/settings", Icon: SettingOutlined },
];

// Each label is a router link: a real href, intent preloading and the link
// role. Icons are hidden, or antd's icon label joins the name ("inbox
// Inventory"). The selected item is the first path segment after /app/.
export function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation("app");
  const current = useLocation({
    select: (location) => location.pathname.split("/")[2],
  });

  return (
    <Menu
      mode="inline"
      selectedKeys={current ? [current] : []}
      items={sections.map(({ key, to, Icon }) => ({
        key,
        icon: <Icon aria-hidden />,
        label: (
          <Link to={to} onClick={onNavigate}>
            {/* Menu has no weight token, so the current label is a span. */}
            {key === current ? (
              <span className={styles.current}>{t(`titles.${key}`)}</span>
            ) : (
              t(`titles.${key}`)
            )}
          </Link>
        ),
      }))}
    />
  );
}
