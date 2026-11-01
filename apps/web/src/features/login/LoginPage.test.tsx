import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import login from "../../i18n/en-US/login";
import { setViewportWidth } from "../../test/harness";
import { renderApp } from "../../test/renderApp";

describe("the Login page", () => {
  it.each([
    ["phone", 390, true],
    ["desktop", 1280, false],
  ])("shows state 1 on %s (%i px)", async (_layout, width, largeControls) => {
    setViewportWidth(width);
    renderApp("/login");

    const heading = await screen.findByRole("heading", {
      level: 1,
      name: login.title,
    });
    const section = heading.closest("section");
    expect(section).toBeTruthy();
    const button = within(section as HTMLElement).getByRole("button", {
      name: login.action,
    });
    // componentSize: 44px controls below bp-md, 40px from it.
    expect(button.classList.contains("ant-btn-lg")).toBe(largeControls);
    expect(screen.getByText(login.lead)).toBeTruthy();
    expect(screen.getByText(login.helper)).toBeTruthy();
    expect(screen.getByText(login.footer)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Language: English" }),
    ).toBeTruthy();
    expect(screen.getByRole("img", { name: "StorageMinis" })).toBeTruthy();
  });

  it("has no working feature yet: the button does nothing", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/login");
    await user.click(await screen.findByRole("button", { name: login.action }));
    // The fetch guard fails the test on any request.
    expect(router.state.location.pathname).toBe("/login");
  });

  it("switches to pt-BR", async () => {
    const user = userEvent.setup();
    renderApp("/login");
    await user.click(
      await screen.findByRole("button", { name: "Language: English" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Português" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Entrar" }),
    ).toBeTruthy();
  });
});
