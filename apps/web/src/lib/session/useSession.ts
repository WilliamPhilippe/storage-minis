import { useRouteContext } from "@tanstack/react-router";
import type { MemberSession } from "./session";

/**
 * The signed-in member's session (W5): the User, the Memberships and the
 * active Organization. Only for components under /app, whose guard loaded it.
 */
export function useSession(): MemberSession {
  return useRouteContext({
    from: "/app",
    select: (context) => context.member,
  });
}
