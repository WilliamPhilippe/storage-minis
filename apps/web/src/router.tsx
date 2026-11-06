import type { QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { ErrorPage } from "./features/errors/ErrorPage";
import { PendingPage } from "./features/errors/PendingPage";
import type app from "./i18n/en-US/app";
import type { Session } from "./lib/session/session";
import { trpc } from "./lib/trpc";
import { routeTree } from "./routeTree.gen";

export type TitleKey = keyof typeof app.titles;

export function createAppRouter({
  queryClient,
  session,
  history,
}: {
  queryClient: QueryClient;
  session: Session;
  history?: RouterHistory;
}) {
  return createRouter({
    routeTree,
    context: { queryClient, trpc, session },
    ...(history ? { history } : {}),
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultPendingComponent: PendingPage,
    defaultErrorComponent: ErrorPage,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
  // Optional: router-core makes `staticData` required on every route once
  // this interface has a required member.
  interface StaticDataRouteOption {
    titleKey?: TitleKey;
  }
}
