import { useLocation } from "@tanstack/react-router";
import { App, Button, Typography } from "antd";
import { Trans, useTranslation } from "react-i18next";
import styles from "./LoginPage.module.css";

// State 3 (docs/design/pages/login): Google blocks sign-in inside apps'
// webviews, so the page explains how to open it in the browser and offers
// the link instead of the Google button.
export function InAppBrowserState({ titleId }: { titleId: string }) {
  const { t } = useTranslation("login");
  const { message } = App.useApp();
  // This page's address, with its `redirect`; shown without the scheme and
  // the search. The real domain is T04's.
  const location = useLocation();
  const link = new URL(location.href, window.location.origin);
  const shownLink = `${link.host}${link.pathname}`;

  async function copyLink() {
    try {
      // Absent outside secure contexts and in some webviews.
      await navigator.clipboard.writeText(link.href);
      void message.success(t("inApp.copied"));
    } catch {
      void message.error(t("inApp.copyFailed"));
    }
  }

  const bold = { bold: <strong className={styles.strong} /> };
  return (
    <>
      <div className={styles.titleBlock}>
        <Typography.Title level={1} id={titleId}>
          {t("inApp.title")}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className={styles.lead}>
          {t("inApp.lead")}
        </Typography.Paragraph>
      </div>
      {/* role="list": Safari drops list semantics with list-style: none. */}
      <ol role="list" className={styles.steps}>
        <li className={styles.step}>
          <span aria-hidden className={styles.stepNumber}>
            1
          </span>
          <span className={styles.stepText}>
            <Trans t={t} i18nKey="inApp.steps.menu" components={bold} />
          </span>
        </li>
        <li className={styles.step}>
          <span aria-hidden className={styles.stepNumber}>
            2
          </span>
          <span className={styles.stepText}>
            <Trans t={t} i18nKey="inApp.steps.open" components={bold} />
          </span>
        </li>
      </ol>
      <div className={styles.actionBlock}>
        <Button
          type="primary"
          block
          onClick={() => {
            void copyLink();
          }}
        >
          {t("inApp.action")}
        </Button>
        <Typography.Text type="secondary" className={styles.caption}>
          {shownLink}
        </Typography.Text>
      </div>
    </>
  );
}
