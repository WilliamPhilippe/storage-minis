import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import en from "./en-US/common";
import { AppProviders } from "../ui/AppProviders";
import { LanguageSwitch } from "../ui/LanguageSwitch";
import { languageSwitchName } from "../test/names";
import { getLocaleState, languageNames } from "./i18n";

// The pt-BR antd locale chunk fails to load, as it would offline.
vi.mock("antd/es/locale/pt_BR", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("a failed language switch", () => {
  it("keeps the current language and says so", async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <LanguageSwitch />
      </AppProviders>,
    );

    await user.click(
      screen.getByRole("button", { name: languageSwitchName() }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: languageNames["pt-BR"] }),
    );

    expect(await screen.findByText(en.language.failed)).toBeTruthy();
    expect(getLocaleState().language).toBe("en-US");
    expect(document.documentElement.lang).toBe("en-US");
    expect(
      screen.getByRole("button", { name: languageSwitchName() }),
    ).toBeTruthy();
    expect(localStorage.getItem("storage-minis.language")).toBeNull();
  });
});
