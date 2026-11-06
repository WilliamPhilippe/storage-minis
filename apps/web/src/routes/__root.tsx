import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { ErrorPage } from "../features/errors/ErrorPage";
import { NotFoundPage } from "../features/errors/NotFoundPage";
import { RootLayout } from "../features/shell/RootLayout";
import type { Session } from "../lib/session/session";
import type { trpc } from "../lib/trpc";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: typeof trpc;
  session: Session;
}>()({
  component: RootLayout,
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
});
