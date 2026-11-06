import type { AppRouter } from "@storage-minis/api/types";
import {
  type DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

/** What the app's session adds to every request (sign-in plan SI-12). */
export interface SessionConnection {
  /** The ID token and the active Organization, once Firebase has loaded. */
  requestHeaders(): Promise<Record<string, string>>;
  /** Handles UNAUTHORIZED and FORBIDDEN from any query or mutation. */
  handleRequestError(error: unknown): void;
}

// The page's one session, connected at startup (and by each component test).
// Until then, and on the catalog, which never loads Firebase, requests carry
// no headers.
let connection: SessionConnection | undefined;

export function connectSession(next: SessionConnection | undefined): void {
  connection = next;
}

// Same-origin /trpc with plain JSON: no batching and no transformer (P5-02).
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "/trpc",
      headers: () => connection?.requestHeaders() ?? {},
    }),
  ],
});

function errorData(error: unknown): object | undefined {
  if (!(error instanceof TRPCClientError)) {
    return undefined;
  }
  const data: unknown = error.data;
  return typeof data === "object" && data !== null ? data : undefined;
}

function httpStatusOf(error: unknown): number | undefined {
  const data = errorData(error);
  return data !== undefined &&
    "httpStatus" in data &&
    typeof data.httpStatus === "number"
    ? data.httpStatus
    : undefined;
}

/** The envelope's `error.data.code`, such as "UNAUTHORIZED". */
export function errorCodeOf(error: unknown): string | undefined {
  const data = errorData(error);
  return data !== undefined && "code" in data && typeof data.code === "string"
    ? data.code
    : undefined;
}

// Requests follow user activity only (W6): no retry for 4xx, no refetch on
// reconnect, and mutations never retried or queued offline. Other query
// failures (no envelope, 5xx) keep TanStack's 3 retries at 1, 2 and 4 s.
// Failures reach the connected session, which signs out on UNAUTHORIZED and
// reloads the session on FORBIDDEN, never on a 5xx (SI-12).
export function createQueryClient(
  overrides: DefaultOptions["queries"] = {},
): QueryClient {
  const onError = (error: unknown) => {
    connection?.handleRequestError(error);
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
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
