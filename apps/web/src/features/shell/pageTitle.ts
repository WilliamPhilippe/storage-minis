import { useMatches } from "@tanstack/react-router";
import type { TitleKey } from "../../router";

// The deepest match's title key, from the routes' static data.
export function usePageTitleKey(): TitleKey | undefined {
  return useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.titleKey)?.staticData
        .titleKey,
  });
}
