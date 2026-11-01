import { Empty } from "antd";
import { useTranslation } from "react-i18next";

// One placeholder per menu item, until business issues replace them.
export function SectionPlaceholder() {
  const { t } = useTranslation("app");
  return <Empty description={t("placeholder")} />;
}
