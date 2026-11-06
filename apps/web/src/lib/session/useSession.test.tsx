import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { memberAnswer } from "../../test/fakeAuth";
import type { MemberSession } from "./session";
import { useSession } from "./useSession";

function SessionProbe() {
  const { user, organization, role } = useSession();
  return (
    <p>
      {user.displayName} · {organization.name} · {role}
    </p>
  );
}

describe("useSession", () => {
  it("reads the member session that the /app route's guard returned", async () => {
    const answer = memberAnswer();
    if (answer.status !== "member") throw new Error("member expected");
    const member: MemberSession = {
      user: answer.user,
      memberships: answer.memberships,
      organization: answer.memberships[0]!.organization,
      role: "owner",
    };
    const rootRoute = createRootRoute();
    const appRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "app",
      beforeLoad: () => ({ member }),
      component: SessionProbe,
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([appRoute]),
      history: createMemoryHistory({ initialEntries: ["/app"] }),
    });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Owner · Test Garage · owner")).toBeTruthy();
  });
});
