import { z } from "zod";
import { recordProcedure } from "../context.js";
import { t } from "../init.js";

// Module-private: diagnostics read no table, environment or principal.
const diagnosticProcedure = t.procedure.use(recordProcedure);

const echo = z.strictObject({ message: z.string().min(1).max(100) });

export const diagnosticsRouter = t.router({
  echo: diagnosticProcedure
    .input(echo)
    .output(echo)
    .query(({ input }) => ({ message: input.message })),
});
