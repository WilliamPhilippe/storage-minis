import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import logoUrl from "../../ui/assets/logo.png";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import styles from "./CatalogPlaceholder.module.css";

// The public catalog's placeholder until D04/E10. It never imports the shell.
export function CatalogPlaceholder() {
  const { t } = useTranslation("catalog");
  const { t: tCommon } = useTranslation();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <LanguageSwitch />
      </header>
      <main className={styles.main}>
        <img
          src={logoUrl}
          alt={tCommon("brand")}
          width={263}
          height={28}
          className={styles.logo}
        />
        <Typography.Title level={1}>{t("unavailable")}</Typography.Title>
      </main>
    </div>
  );
}
