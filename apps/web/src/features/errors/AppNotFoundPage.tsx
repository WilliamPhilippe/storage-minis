import { CompassOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Result, Typography } from "antd";
import { useTranslation } from "react-i18next";

// Inside the shell, linking to /app.
export function AppNotFoundPage() {
  const { t } = useTranslation();
  return (
    <Result
      icon={<CompassOutlined aria-hidden />}
      title={
        <Typography.Title level={1}>{t("notFound.title")}</Typography.Title>
      }
      subTitle={t("notFound.description")}
      extra={<Link to="/app">{t("notFound.home")}</Link>}
    />
  );
}
