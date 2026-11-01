import { Button, Typography } from "antd";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import logoUrl from "../../ui/assets/logo.png";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import styles from "./LoginPage.module.css";

// State 1, "Sign in", from docs/design/pages/login: one column on phones, a
// 400px card from bp-md. No working feature yet (owner, 2026-11-01): the
// button has no action, nothing imports Firebase, and Google's "G" artwork
// arrives with sign-in in PR 3.
export function LoginPage() {
  const { t } = useTranslation("login");
  const { t: tCommon } = useTranslation();
  const titleId = useId();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <LanguageSwitch />
      </header>
      <main className={styles.main}>
        <section aria-labelledby={titleId} className={styles.card}>
          <img
            src={logoUrl}
            alt={tCommon("brand")}
            width={263}
            height={28}
            className={styles.logo}
          />
          <div className={styles.titleBlock}>
            <Typography.Title level={1} id={titleId}>
              {t("title")}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className={styles.lead}>
              {t("lead")}
            </Typography.Paragraph>
          </div>
          <div className={styles.actionBlock}>
            <Button type="primary" block>
              {t("action")}
            </Button>
            <Typography.Text type="secondary" className={styles.caption}>
              {t("helper")}
            </Typography.Text>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Typography.Text type="secondary" className={styles.caption}>
          {t("footer")}
        </Typography.Text>
      </footer>
    </div>
  );
}
