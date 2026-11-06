import { useRouteContext } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { Alert, Button, Typography } from "antd";
import {
  type ReactNode,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLocale } from "../../i18n/useLocale";
import type { SignInResult } from "../../lib/session/session";
import {
  isInAppBrowser,
  isRedirecting,
  type SignInFailure,
} from "../../lib/session/signInMethod";
import { describeError, type ErrorMessageKey } from "../../lib/trpc";
import logoUrl from "../../ui/assets/logo.png";
import { LanguageSwitch } from "../../ui/LanguageSwitch";
import { GoogleMark } from "./GoogleMark";
import { InAppBrowserState } from "./InAppBrowserState";
import styles from "./LoginPage.module.css";

// docs/design/pages/login, sign-in plan SI-11: state 1 (sign in), 2 (opening
// Google), 3 (in-app browser) and 4 (no access), with an alert for failures
// and for a session that ended. Phones get one column; from bp-md, a 400px
// card. Where a member goes after signing in is the route guard's job.

type Failure =
  | { readonly source: "signIn"; readonly failure: SignInFailure }
  /** Signed in with Google, but the API couldn't be reached. */
  | { readonly source: "request"; readonly key: ErrorMessageKey };

type Phase =
  | { readonly kind: "idle"; readonly failure?: Failure }
  | { readonly kind: "opening" };

const failureKeys = {
  popupBlocked: "errors.popupBlocked",
  cancelled: "errors.cancelled",
  network: "errors.network",
  other: "errors.failed",
} as const satisfies Record<SignInFailure, string>;

function phaseAfter(result: SignInResult): Phase {
  switch (result.status) {
    // The page is leaving: for /app, or for Google.
    case "member":
    case "redirecting":
      return { kind: "opening" };
    // State 4 comes from the session's notice.
    case "noAccess":
      return { kind: "idle" };
    case "failed":
      return {
        kind: "idle",
        failure: { source: "signIn", failure: result.failure },
      };
  }
}

function phaseAfterError(error: unknown): Phase {
  return {
    kind: "idle",
    failure:
      error instanceof TRPCClientError
        ? { source: "request", key: describeError(error) }
        : { source: "signIn", failure: "other" },
  };
}

export function LoginPage() {
  const { t } = useTranslation("login");
  const { t: tCommon } = useTranslation();
  const titleId = useId();
  const { language } = useLocale();
  const session = useRouteContext({
    from: "/login",
    select: (context) => context.session,
  });
  const notice = useSyncExternalStore(
    session.subscribeNotice,
    session.getNotice,
  );
  const [inApp] = useState(() => isInAppBrowser(navigator.userAgent));
  // Back from a redirect sign-in, state 2 shows at once: no flash of state 1.
  const [phase, setPhase] = useState<Phase>(() =>
    isRedirecting() ? { kind: "opening" } : { kind: "idle" },
  );

  useEffect(() => {
    if (!isRedirecting()) {
      return;
    }
    let active = true;
    session.completeRedirect().then(
      (result) => {
        if (active) setPhase(phaseAfter(result));
      },
      (error: unknown) => {
        if (active) setPhase(phaseAfterError(error));
      },
    );
    return () => {
      active = false;
    };
  }, [session]);

  async function signIn(selectAccount: boolean) {
    setPhase({ kind: "opening" });
    try {
      setPhase(
        phaseAfter(await session.signInWithGoogle({ language, selectAccount })),
      );
    } catch (error) {
      setPhase(phaseAfterError(error));
    }
  }

  const opening = phase.kind === "opening";
  const noAccess = !opening && notice?.kind === "noAccess" ? notice : undefined;

  let alert: ReactNode = null;
  if (noAccess) {
    alert = (
      <Alert
        type="error"
        showIcon
        title={t("noAccess.title")}
        description={
          noAccess.email === null ? (
            t("noAccess.withoutEmail")
          ) : (
            <Trans
              t={t}
              i18nKey="noAccess.withEmail"
              values={{ email: noAccess.email }}
              components={{ bold: <strong className={styles.strong} /> }}
            />
          )
        }
      />
    );
  } else if (phase.kind === "idle" && phase.failure !== undefined) {
    const { failure } = phase;
    alert = (
      <Alert
        type="error"
        showIcon
        title={
          failure.source === "signIn"
            ? t(failureKeys[failure.failure])
            : tCommon(failure.key)
        }
      />
    );
  } else if (!opening && notice?.kind === "sessionEnded") {
    alert = <Alert type="info" showIcon title={t("sessionEnded")} />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <LanguageSwitch placement="bottomRight" disabled={opening} />
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
          {inApp ? (
            <InAppBrowserState titleId={titleId} />
          ) : (
            <>
              <div className={styles.titleBlock}>
                <Typography.Title level={1} id={titleId}>
                  {t("title")}
                </Typography.Title>
                <Typography.Paragraph type="secondary" className={styles.lead}>
                  {t("lead")}
                </Typography.Paragraph>
              </div>
              {alert}
              <div className={styles.actionBlock}>
                <Button
                  type="primary"
                  block
                  loading={opening}
                  icon={opening ? undefined : <GoogleMark />}
                  onClick={() => {
                    void signIn(noAccess !== undefined);
                  }}
                >
                  {opening
                    ? t("opening.action")
                    : noAccess
                      ? t("noAccess.action")
                      : t("action")}
                </Button>
                {noAccess === undefined && (
                  // A live region from the start, so the change to state 2's
                  // helper is announced.
                  <Typography.Text
                    type="secondary"
                    role="status"
                    className={styles.caption}
                  >
                    {opening ? t("opening.helper") : t("helper")}
                  </Typography.Text>
                )}
              </div>
            </>
          )}
        </section>
      </main>
      <footer className={styles.footer}>
        <Typography.Text type="secondary" className={styles.caption}>
          {inApp ? t("inApp.footer") : t("footer")}
        </Typography.Text>
      </footer>
    </div>
  );
}
