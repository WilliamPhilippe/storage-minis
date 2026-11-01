import type { Database } from "@storage-minis/db";
import { initTRPC } from "@trpc/server";
import { errorShape } from "./errors.js";

/**
 * Per-request tRPC context (Step 5 plan P5-06): the owned Drizzle handle and
 * the request ID, nothing else. T02 adds a verified principal in
 * `createContext`, never one read from unverified headers.
 */
export interface Context {
  db: Database["db"];
  requestId: string;
}

/**
 * tRPC's root object. It is not a procedure builder: routers derive
 * module-private or guarded builders from `t.procedure`, always through
 * `recordProcedure` (context.ts). No ready-made public builder is exported.
 */
export const t = initTRPC.context<Context>().create({
  isDev: false,
  errorFormatter: ({ error }) => errorShape(error),
});
