import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import common from "../../i18n/en-US/common";
import { AppProviders } from "../../ui/AppProviders";
import { PendingPage } from "./PendingPage";

// The router waits defaultPendingMs (1 s) before it shows the spinner, so the
// page is tested directly.
describe("PendingPage", () => {
  it("shows a spinner named Loading", () => {
    render(
      <AppProviders>
        <PendingPage />
      </AppProviders>,
    );
    expect(screen.getByRole("status", { name: common.loading })).toBeTruthy();
  });
});
