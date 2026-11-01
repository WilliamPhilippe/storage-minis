import { createFileRoute } from "@tanstack/react-router";
import { echoQuery } from "../../features/home/echoQuery";
import { HomeErrorPage } from "../../features/home/HomeErrorPage";
import { HomePage } from "../../features/home/HomePage";

export const Route = createFileRoute("/app/")({
  staticData: { titleKey: "home" },
  // Resolves at once from the cache; the page's useSuspenseQuery refreshes
  // stale data in the background (WS-05).
  loader: async ({ context: { queryClient, trpc } }) => {
    await queryClient.query({ ...echoQuery(trpc), staleTime: "static" });
  },
  component: HomePage,
  errorComponent: HomeErrorPage,
});
