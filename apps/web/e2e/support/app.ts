import { ownerStatePath } from "./session";
import { test as base } from "./test";

// The /app specs import their test from here: each starts signed in as the
// e2e owner, with the session the setup project saved (PW-13, SI-17).
export const test = base.extend({ storageState: ownerStatePath });

export { expect, expectNoSidewaysScroll } from "./test";
