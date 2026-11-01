import type { AppRouter } from "@storage-minis/api/types";
import { type DefaultOptions, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

// Same-origin /trpc with plain JSON: no batching and no transformer (P5-02).
export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpLink({ url: "/trpc" })],
});

function httpStatusOf(error: unknown): number | undefined {
  if (!(error instanceof TRPCClientError)) {
    return undefined;
  }
  const data: unknown = error.data;
  if (typeof data !== "object" || data === null || !("httpStatus" in data)) {
    return undefined;
  }
  return typeof data.httpStatus === "number" ? data.httpStatus : undefined;
}

// Requests follow user activity only (W6): no retry for 4xx, no refetch on
// reconnect, and mutations never retried or queued offline. Other query
// failures (no envelope, 5xx) keep TanStack's 3 retries at 1, 2 and 4 s.
export function createQueryClient(
  overrides: DefaultOptions["queries"] = {},
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const status = httpStatusOf(error);
          if (status !== undefined && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnReconnect: false,
        refetchOnWindowFocus: true,
        staleTime: 0,
        ...overrides,
      },
      // "always": a mutation started offline fails at once instead of
      // running later, on reconnect, as a write the user did not just make.
      mutations: { retry: false, networkMode: "always" },
    },
  });
}

// The app's one QueryClient and the options proxy, as module singletons
// (tRPC's Vite SPA setup; owner, 2026-11-01). Tests create a fresh client per
// test: `queryOptions()` never uses the proxy's bound client.
export const queryClient = createQueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export type ErrorMessageKey =
  "errors.network" | "errors.server" | "errors.request";

// No tRPC envelope (a network failure, or a proxy page) means the server
// wasn't reached.
export function describeError(error: unknown): ErrorMessageKey {
  const status = httpStatusOf(error);
  if (status === undefined) {
    return "errors.network";
  }
  return status >= 500 ? "errors.server" : "errors.request";
}
