import { CheckCircleOutlined } from "@ant-design/icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { echoQuery } from "./echoQuery";

// The API connection card: diagnostics.echo through the /trpc proxy. The
// loader fills the cache; this reads the same entry.
export function HomePage() {
  const { t } = useTranslation("app");
  const { data } = useSuspenseQuery(echoQuery(trpc));
  return (
    <Card title={t("echo.title")}>
      <Space orientation="vertical">
        <Typography.Text type="success">
          <CheckCircleOutlined aria-hidden /> {t("echo.connected")}
        </Typography.Text>
        <Typography.Text>
          {t("echo.reply", { message: data.message })}
        </Typography.Text>
      </Space>
    </Card>
  );
}
