import { describe, expect, it } from "vitest";
import { googleIdentity } from "../../tests/auth-fakes.js";
import {
  bootstrapApplies,
  hasRole,
  isRevoked,
  parseOrganizationId,
  profileOf,
} from "./policy.js";
import type { BootstrapSettings, MembershipRole } from "./types.js";

const signedIn = 1_793_800_000;
const settings: BootstrapSettings = {
  ownerEmail: "owner@example.com",
  organization: { name: "Garage", nickname: "garage", currency: "BRL" },
};

describe("T02 policy rules", () => {
  it("revokes a session signed in no later than the cutoff rounded up to the second", () => {
    const revoked = (cutoff: Date | null, authTime = signedIn) =>
      isRevoked({ authTime }, { sessionsValidAfter: cutoff });
    expect(revoked(null)).toBe(false);
    // A whole-second cutoff: that second's sign-ins are revoked.
    expect(revoked(new Date(signedIn * 1000))).toBe(true);
    expect(revoked(new Date((signedIn - 1) * 1000))).toBe(false);
    // A cutoff inside a second rounds up: a sign-in in the cutoff's second,
    // or in the next one, cannot be told apart from an earlier one.
    expect(revoked(new Date(signedIn * 1000 - 600))).toBe(true);
    expect(revoked(new Date(signedIn * 1000 + 1))).toBe(true);
    expect(revoked(new Date(signedIn * 1000 + 1), signedIn + 1)).toBe(true);
    expect(revoked(new Date(signedIn * 1000 + 1), signedIn + 2)).toBe(false);
    expect(revoked(new Date(signedIn * 1000 + 3_600_000))).toBe(true);
  });

  it("parses x-organization-id as a positive int32 in plain decimal", () => {
    expect(parseOrganizationId("1")).toBe(1);
    expect(parseOrganizationId("42")).toBe(42);
    expect(parseOrganizationId("2147483647")).toBe(2_147_483_647);
    for (const header of [
      undefined,
      "",
      " ",
      "0",
      "-1",
      "+1",
      "01",
      "1.0",
      "1e3",
      "0x1",
      " 1",
      "1 ",
      "1, 2",
      "abc",
      "2147483648",
      "99999999999",
      "١",
    ]) {
      expect(parseOrganizationId(header)).toBeUndefined();
    }
  });

  it("orders Membership roles viewer < editor < owner", () => {
    const roles: MembershipRole[] = ["viewer", "editor", "owner"];
    const allowed = roles.flatMap((role) =>
      roles
        .filter((minimum) => hasRole(role, minimum))
        .map((minimum) => `${role}>=${minimum}`),
    );
    expect(allowed).toEqual([
      "viewer>=viewer",
      "editor>=viewer",
      "editor>=editor",
      "owner>=viewer",
      "owner>=editor",
      "owner>=owner",
    ]);
  });

  it("bootstraps only a verified Google email equal to the configured owner's", () => {
    expect(
      bootstrapApplies(
        googleIdentity({ email: "owner@example.com" }),
        settings,
      ),
    ).toBe(true);
    expect(
      bootstrapApplies(
        googleIdentity({ email: "  Owner@Example.COM " }),
        settings,
      ),
    ).toBe(true);
    for (const identity of [
      googleIdentity({ email: "someone@example.com" }),
      googleIdentity({ email: null }),
      googleIdentity({ email: "owner@example.com", emailVerified: false }),
      googleIdentity({ email: "owner@example.com", provider: "custom" }),
    ]) {
      expect(bootstrapApplies(identity, settings)).toBe(false);
    }
  });

  it("copies Google's profile with the email trimmed and lowercased", () => {
    expect(
      profileOf(googleIdentity({ email: " Member@Example.com", name: "Ana" })),
    ).toEqual({ email: "member@example.com", displayName: "Ana" });
    expect(profileOf(googleIdentity({ email: null, name: null }))).toEqual({
      email: null,
      displayName: null,
    });
  });
});
