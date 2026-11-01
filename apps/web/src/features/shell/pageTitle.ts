import { useMatches } from "@tanstack/react-router";
import type { TitleKey } from "../../router";

// The deepest rendered match's title key, from the routes' static data.
// Matches below a failed one don't render, and their strings may not have
// loaded.
export function usePageTitleKey(): TitleKey | undefined {
  return useMatches({
    select: (matches) => {
      const failed = matches.findIndex(
        (match) => match.status === "error" || match.status === "notFound",
      );
      const rendered = failed === -1 ? matches : matches.slice(0, failed + 1);
      return rendered.findLast((match) => match.staticData.titleKey)?.staticData
        .titleKey;
    },
  });
}
