import { t } from "./init.js";
import { diagnosticsRouter } from "./routers/diagnostics.js";

export const appRouter = t.router({
  diagnostics: diagnosticsRouter,
});

export type AppRouter = typeof appRouter;
