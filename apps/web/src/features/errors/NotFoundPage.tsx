import { CompassOutlined } from "@ant-design/icons";
import { Result, Typography } from "antd";
import { useTranslation } from "react-i18next";

// Outside the back office, so it offers no back-office links.
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Result
      icon={<CompassOutlined aria-hidden />}
      title={
        <Typography.Title level={1}>{t("notFound.title")}</Typography.Title>
      }
      subTitle={t("notFound.description")}
    />
  );
}
