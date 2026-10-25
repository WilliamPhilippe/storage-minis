import { expect, it } from "vitest";
import { requireApprovedSchema } from "./migrations.js";

it("refuses generation and application until the physical schema is approved", () => {
  expect(requireApprovedSchema).toThrow(
    "Schema/migrations pending approval (Step 3B)",
  );
});
