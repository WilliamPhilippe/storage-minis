import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { describeError } from "../../lib/trpc";

// Renders where the failing route would, so a section error keeps the shell;
// as the root error page, it covers failures in the shell itself.
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryErrorReset = useQueryErrorResetBoundary();
  const unknownError: unknown = error;
  return (
    <Result
      status="error"
      title={t("errors.page")}
      subTitle={
        unknownError instanceof TRPCClientError
          ? t(describeError(unknownError))
          : undefined
      }
      extra={
        <Button
          type="primary"
          onClick={() => {
            queryErrorReset.reset();
            reset();
            void router.invalidate();
          }}
        >
          {t("actions.tryAgain")}
        </Button>
      }
    />
  );
}
