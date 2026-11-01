import { act, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import app from "../../i18n/en-US/app";
import common from "../../i18n/en-US/common";
import { languageCodes, languageNames } from "../../i18n/i18n";
import ptApp from "../../i18n/pt-BR/app";
import { setViewportWidth } from "../../test/harness";
import { documentTitle, languageSwitchName } from "../../test/names";
import { renderApp } from "../../test/renderApp";

const { nav, titles } = app;

async function renderInventory(width: number) {
  setViewportWidth(width);
  const view = renderApp("/app/inventory");
  await screen.findByRole("heading", { level: 1, name: titles.inventory });
  return view;
}

describe("the shell below bp-md", () => {
  it("opens the menu drawer from the MenuFab and closes it on navigation", async () => {
    const user = userEvent.setup();
    const { router } = await renderInventory(375);
    expect(screen.queryByRole("complementary")).toBeNull();

    const fab = screen.getByRole("button", { name: nav.open });
    expect(fab.getAttribute("aria-expanded")).toBe("false");
    await user.click(fab);
    expect(fab.getAttribute("aria-expanded")).toBe("true");

    const drawer = screen.getByRole("dialog", { name: nav.menu });
    const menu = within(drawer).getByRole("navigation", { name: nav.label });
    await user.click(within(menu).getByRole("link", { name: titles.sales }));

    expect(
      await screen.findByRole("heading", { level: 1, name: titles.sales }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app/sales");
    expect(fab.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes the drawer with its close button", async () => {
    const user = userEvent.setup();
    await renderInventory(375);
    const fab = screen.getByRole("button", { name: nav.open });
    await user.click(fab);
    await user.click(
      within(screen.getByRole("dialog", { name: nav.menu })).getByRole(
        "button",
        { name: "Close" },
      ),
    );
    expect(fab.getAttribute("aria-expanded")).toBe("false");
  });

  it("links the logo to /app, which is not the current page", async () => {
    await renderInventory(375);
    const logo = within(screen.getByRole("banner")).getByRole("link", {
      name: common.brand,
    });
    expect(logo.getAttribute("href")).toBe("/app");
    expect(logo.getAttribute("aria-current")).toBeNull();
  });
});

describe("the SideNav from bp-md", () => {
  it("is collapsed at 900px, and its items keep their names", async () => {
    await renderInventory(900);
    expect(screen.queryByRole("button", { name: nav.open })).toBeNull();
    const toggle = screen.getByRole("button", { name: nav.expand });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    const menu = screen.getByRole("navigation", { name: nav.label });
    for (const title of Object.values(titles).slice(1)) {
      expect(within(menu).getByRole("link", { name: title })).toBeTruthy();
    }
  });

  it("is expanded at 1024px", async () => {
    await renderInventory(1024);
    const toggle = screen.getByRole("button", { name: nav.collapse });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("follows the breakpoint until the person chooses", async () => {
    await renderInventory(1024);
    expect(screen.getByRole("button", { name: nav.collapse })).toBeTruthy();
    act(() => setViewportWidth(900));
    expect(screen.getByRole("button", { name: nav.expand })).toBeTruthy();
  });

  it("saves the person's choice, which wins over the breakpoint", async () => {
    const user = userEvent.setup();
    const { unmount } = await renderInventory(900);
    await user.click(screen.getByRole("button", { name: nav.expand }));
    expect(screen.getByRole("button", { name: nav.collapse })).toBeTruthy();
    expect(localStorage.getItem("storage-minis.sideNav")).toBe("expanded");

    unmount();
    await renderInventory(900);
    expect(screen.getByRole("button", { name: nav.collapse })).toBeTruthy();
  });

  it("ignores an unknown saved value", async () => {
    localStorage.setItem("storage-minis.sideNav", "wide");
    await renderInventory(900);
    expect(screen.getByRole("button", { name: nav.expand })).toBeTruthy();
  });

  it("marks the current section, and not the logo", async () => {
    await renderInventory(1280);
    const menu = screen.getByRole("navigation", { name: nav.label });
    // The menu item's name excludes its icon (aria-hidden).
    expect(
      within(menu).getByRole("menuitem", { name: titles.inventory }),
    ).toBeTruthy();
    expect(
      within(menu)
        .getByRole("link", { name: titles.inventory })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      within(menu)
        .getByRole("link", { name: titles.sales })
        .getAttribute("aria-current"),
    ).toBeNull();
    const logo = screen.getByRole("link", { name: common.brand });
    expect(logo.getAttribute("aria-current")).toBeNull();
  });
});

describe("the language switch in the shell", () => {
  it("sits in the MenuFab's drawer below bp-md, not in the top bar", async () => {
    const user = userEvent.setup();
    await renderInventory(375);
    expect(
      screen.queryByRole("button", { name: languageSwitchName() }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: nav.open }));
    const drawer = screen.getByRole("dialog", { name: nav.menu });
    const languageSwitch = within(drawer).getByRole("button", {
      name: languageSwitchName(),
    });
    expect(languageSwitch.textContent).toBe(languageCodes["en-US"]);
    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: languageSwitchName(),
      }),
    ).toBeNull();
  });

  it("switches the language from the drawer", async () => {
    const user = userEvent.setup();
    await renderInventory(375);
    await user.click(screen.getByRole("button", { name: nav.open }));
    await user.click(
      within(screen.getByRole("dialog", { name: nav.menu })).getByRole(
        "button",
        { name: languageSwitchName() },
      ),
    );
    await user.click(
      screen.getByRole("menuitem", { name: languageNames["pt-BR"] }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: ptApp.titles.inventory,
      }),
    ).toBeTruthy();
  });

  it("sits at the bottom of the SideNav, right above the collapse button", async () => {
    await renderInventory(1280);
    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: languageSwitchName(),
      }),
    ).toBeNull();
    const sideNav = screen.getByRole("complementary");
    const languageSwitch = within(sideNav).getByRole("button", {
      name: languageSwitchName(),
    });
    expect(languageSwitch.textContent).toBe(languageCodes["en-US"]);
    expect(languageSwitch.nextElementSibling).toBe(
      within(sideNav).getByRole("button", { name: nav.collapse }),
    );
  });

  it("shows only the globe in the collapsed SideNav, keeping its name", async () => {
    await renderInventory(900);
    const sideNav = screen.getByRole("complementary");
    const languageSwitch = within(sideNav).getByRole("button", {
      name: languageSwitchName(),
    });
    expect(languageSwitch.textContent).toBe("");
    expect(languageSwitch.nextElementSibling).toBe(
      within(sideNav).getByRole("button", { name: nav.expand }),
    );
  });
});

describe("page titles", () => {
  it.each([375, 1280])(
    "renders the title once, as the page's h1, at %ipx",
    async (width) => {
      await renderInventory(width);
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]?.textContent).toBe(titles.inventory);
    },
  );

  it("sets document.title, and updates it on navigation and on a language switch", async () => {
    const user = userEvent.setup();
    await renderInventory(1280);
    expect(document.title).toBe(documentTitle(titles.inventory));

    const menu = screen.getByRole("navigation", { name: nav.label });
    await user.click(within(menu).getByRole("link", { name: titles.reports }));
    await screen.findByRole("heading", { level: 1, name: titles.reports });
    expect(document.title).toBe(documentTitle(titles.reports));

    await user.click(
      screen.getByRole("button", { name: languageSwitchName() }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: languageNames["pt-BR"] }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: ptApp.titles.reports,
      }),
    ).toBeTruthy();
    expect(document.title).toBe(documentTitle(ptApp.titles.reports));
  });
});
