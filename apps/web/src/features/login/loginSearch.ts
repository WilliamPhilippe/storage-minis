// The Login page's search parameters. `redirect` is where a member goes after
// signing in: an /app path only, so a link can't send anyone elsewhere.
export interface LoginSearch {
  readonly redirect?: string | undefined;
}

const appPath = /^\/app(?:[/?#]|$)/;

/** An /app path on this origin, or undefined. */
export function appRedirect(value: unknown): string | undefined {
  return typeof value === "string" &&
    value.length <= 2048 &&
    appPath.test(value) &&
    !value.includes("\\")
    ? value
    : undefined;
}

// The key is always present: TanStack Router merges the URL's raw search
// into each match, so omitting a refused value would let it through.
export function validateLoginSearch(
  search: Record<string, unknown>,
): LoginSearch {
  return { redirect: appRedirect(search.redirect) };
}
