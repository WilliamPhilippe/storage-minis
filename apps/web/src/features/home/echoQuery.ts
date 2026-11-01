import type { trpc as trpcProxy } from "../../lib/trpc";

// The home page's diagnostic call, shared by its loader and its page.
export function echoQuery(trpc: typeof trpcProxy) {
  return trpc.diagnostics.echo.queryOptions({ message: "ping" });
}
