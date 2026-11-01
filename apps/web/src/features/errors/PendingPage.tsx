import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./PendingPage.module.css";

// Replaces whichever route is still loading: the whole page for /app and the
// catalog, the content area for a section.
export function PendingPage() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("loading")} className={styles.pending}>
      <Spin />
    </div>
  );
}
