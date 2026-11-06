import { useMatches } from "@tanstack/react-router";
import type { TitleKey } from "../../router";

// The deepest settled match's title key, from the routes' static data. A
// route's strings load in its own or a parent's loader, so a match counts
// only when it and every match above it have finished, or it is the failed
// one, whose error renders under parents that loaded. A pending match (the
// /app sign-in guard can outlast the router's 1 s pending delay) and anything
// below a failed one may not have their strings yet.
export function usePageTitleKey(): TitleKey | undefined {
  return useMatches({
    select: (matches) => {
      const stop = matches.findIndex((match) => match.status !== "success");
      const failed =
        matches[stop]?.status === "error" ||
        matches[stop]?.status === "notFound";
      const settled =
        stop === -1 ? matches : matches.slice(0, failed ? stop + 1 : stop);
      return settled.findLast((match) => match.staticData.titleKey)?.staticData
        .titleKey;
    },
  });
}
