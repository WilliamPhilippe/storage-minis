import type { Database } from "@storage-minis/db";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { FastifyRequest } from "fastify";
import { t } from "./init.js";
import type { Context } from "./init.js";

declare module "fastify" {
  interface FastifyRequest {
    /** The matched tRPC procedure, set by `recordProcedure` (P5-05). */
    trpcProcedure: string | null;
  }
}

// Context to request, so the context type stays `{ db, requestId }` while the
// middleware can still reach the request it belongs to.
const requests = new WeakMap<Context, FastifyRequest>();

export function createContextFactory(db: Database["db"]) {
  return ({ req }: CreateFastifyContextOptions): Context => {
    const context: Context = { db, requestId: req.id };
    requests.set(context, req);
    return context;
  };
}

/**
 * The base middleware of every procedure builder. tRPC runs middleware only
 * for a procedure that exists, so the recorded name is always a router path,
 * never URL text the client chose.
 */
export const recordProcedure = t.middleware(({ ctx, path, next }) => {
  const request = requests.get(ctx);
  if (request) request.trpcProcedure = path;
  return next();
});
