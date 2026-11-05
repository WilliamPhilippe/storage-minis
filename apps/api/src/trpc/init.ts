import type { Database } from "@storage-minis/db";
import { initTRPC } from "@trpc/server";
import type { AuthDependencies } from "../auth/types.js";
import { errorShape } from "./errors.js";

/**
 * The sign-in part of the context (sign-in plan SI-06): the raw headers,
 * unverified input like procedure input, and the services that check them.
 * Only the guarded builders (procedures.ts) read the headers.
 */
export interface AuthContext extends AuthDependencies {
  /** The raw `authorization` header. */
  authorization: string | undefined;
  /** The raw `x-organization-id` header. */
  organizationHeader: string | undefined;
}

/**
 * Per-request tRPC context: the owned Drizzle handle, the request ID and the
 * sign-in inputs. Identity is verified in the guarded builders' middleware,
 * never in `createContext` (SI-06, changing P5-06's note), so public
 * procedures never pay for, or fail on, a bad token.
 */
export interface Context {
  db: Database["db"];
  requestId: string;
  auth: AuthContext;
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
