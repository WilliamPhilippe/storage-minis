import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Empty } from "antd";
import { useTranslation } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import en from "./en-US/common";
import pt from "./pt-BR/common";
import { AppProviders } from "../ui/AppProviders";
import { LanguageSwitch } from "../ui/LanguageSwitch";
import { languageSwitchName } from "../test/names";
import {
  detectLanguage,
  getLocaleState,
  languageCodes,
  languageNames,
  subscribeLocale,
  switchLanguage,
} from "./i18n";

function Probe() {
  const { t } = useTranslation();
  return <p>{t("notFound.title")}</p>;
}

function renderSwitch() {
  render(
    <AppProviders>
      <LanguageSwitch />
      <Probe />
      <Empty />
    </AppProviders>,
  );
}

describe("languages", () => {
  it("switches visible text, <html lang>, the saved choice and antd's texts to pt-BR", async () => {
    const user = userEvent.setup();
    renderSwitch();
    expect(screen.getByText(en.notFound.title)).toBeTruthy();
    // Empty shows its text twice: the image title and the description.
    expect(screen.getAllByText("No data")).not.toHaveLength(0);

    await user.click(
      screen.getByRole("button", {
        name: languageSwitchName(),
      }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: languageNames["pt-BR"] }),
    );

    expect(await screen.findByText(pt.notFound.title)).toBeTruthy();
    expect(screen.getAllByText("Não há dados")).not.toHaveLength(0);
    expect(screen.queryAllByText("No data")).toHaveLength(0);
    expect(
      screen.getByRole("button", {
        name: languageSwitchName("pt-BR", pt.language.switch),
      }).textContent,
    ).toBe(languageCodes["pt-BR"]);
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(localStorage.getItem("storage-minis.language")).toBe("pt-BR");
  });

  it("marks each option with its own language", async () => {
    const user = userEvent.setup();
    renderSwitch();
    await user.click(
      screen.getByRole("button", {
        name: languageSwitchName(),
      }),
    );
    expect(
      screen
        .getByRole("menuitem", { name: languageNames["en-US"] })
        .querySelector("[lang]")
        ?.getAttribute("lang"),
    ).toBe("en-US");
    expect(
      screen
        .getByRole("menuitem", { name: languageNames["pt-BR"] })
        .querySelector("[lang]")
        ?.getAttribute("lang"),
    ).toBe("pt-BR");
  });

  // Records every applied language, whichever load finishes first.
  function recordApplied() {
    const applied: string[] = [];
    const stop = subscribeLocale(() => {
      applied.push(getLocaleState().language);
    });
    return { applied, stop };
  }

  it("lets a request for the current language cancel a pending switch", async () => {
    const { applied, stop } = recordApplied();
    await Promise.all([switchLanguage("pt-BR"), switchLanguage("en-US")]);
    stop();
    expect(applied).toEqual([]);
    expect(getLocaleState().language).toBe("en-US");
    expect(document.documentElement.lang).toBe("en-US");
    expect(localStorage.getItem("storage-minis.language")).toBeNull();
  });

  it("lets the last of overlapping switches win", async () => {
    const { applied, stop } = recordApplied();
    await Promise.all([
      switchLanguage("pt-BR"),
      switchLanguage("en-US"),
      switchLanguage("pt-BR"),
    ]);
    stop();
    expect(applied).toEqual(["pt-BR"]);
    expect(document.documentElement.lang).toBe("pt-BR");
  });
});

describe("detectLanguage", () => {
  function stubBrowserLanguages(tags: string[]) {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(tags);
  }

  it("prefers the saved choice", () => {
    stubBrowserLanguages(["en-US"]);
    localStorage.setItem("storage-minis.language", "pt-BR");
    expect(detectLanguage()).toBe("pt-BR");
  });

  it("ignores an unknown saved value", () => {
    stubBrowserLanguages(["pt-PT"]);
    localStorage.setItem("storage-minis.language", "fr-FR");
    expect(detectLanguage()).toBe("pt-BR");
  });

  it("falls back to the browser's languages when storage throws", () => {
    stubBrowserLanguages(["pt"]);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(detectLanguage()).toBe("pt-BR");
  });

  it.each([
    [["fr-FR", "pt-PT", "en"], "pt-BR"],
    [["fr", "en-GB", "pt-BR"], "en-US"],
    [["fr", "de"], "en-US"],
    [[], "en-US"],
  ])("maps the browser's languages %j to %s", (tags, expected) => {
    stubBrowserLanguages(tags);
    expect(detectLanguage()).toBe(expected);
  });
});
