import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { Alert, Button, Card } from "antd";
import { useTranslation } from "react-i18next";
import { describeError } from "../../lib/trpc";

// The card's error state, for a failed loader or query.
export function HomeErrorPage({ error }: ErrorComponentProps) {
  const { t } = useTranslation("app");
  const { t: tCommon } = useTranslation();
  const router = useRouter();
  const queryErrorReset = useQueryErrorResetBoundary();
  return (
    <Card title={t("echo.title")}>
      <Alert
        type="error"
        showIcon
        title={tCommon(describeError(error))}
        action={
          <Button
            onClick={() => {
              queryErrorReset.reset();
              void router.invalidate();
            }}
          >
            {tCommon("actions.tryAgain")}
          </Button>
        }
      />
    </Card>
  );
}
