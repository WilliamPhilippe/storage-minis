import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { createQueryClient } from "../lib/trpc";
import { createAppRouter } from "../router";
import { AppProviders } from "../ui/AppProviders";

// The real route tree at `path`, with a memory history and a fresh
// QueryClient whose retries don't wait.
export function renderApp(path: string) {
  const queryClient = createQueryClient({ retryDelay: 0 });
  const router = createAppRouter({
    queryClient,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </QueryClientProvider>,
  );
  return { ...view, router, queryClient };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// The API's reply to diagnostics.echo({ message: "ping" }).
export function echoResponse(): Response {
  return jsonResponse(200, { result: { data: { message: "ping" } } });
}
