import { t } from "./init.js";
import { diagnosticsRouter } from "./routers/diagnostics.js";
import { sessionRouter } from "./routers/session.js";

export const appRouter = t.router({
  diagnostics: diagnosticsRouter,
  session: sessionRouter,
});

export type AppRouter = typeof appRouter;
