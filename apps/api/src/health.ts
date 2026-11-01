import type { Database } from "@storage-minis/db";
import type { FastifyPluginAsync } from "fastify";

export interface HealthOptions {
  database: Pick<Database, "check">;
  isClosing: () => boolean;
}

/**
 * Liveness and readiness as an encapsulated plugin. `buildApp` registers it
 * like every other route plugin; the root error/not-found handlers apply.
 */
export const healthRoutes: FastifyPluginAsync<HealthOptions> = (
  app,
  { database, isClosing },
) => {
  app.get("/health/live", (_request, reply) => reply.send({ status: "ok" }));
  app.get("/health/ready", async (request, reply) => {
    if (!isClosing()) {
      try {
        await database.check();
        // Shutdown may have begun while the current check was in flight.
        if (!isClosing()) return { status: "ready" };
      } catch (error) {
        request.log.warn(
          { category: "database_unavailable", status: 503, err: error },
          "readiness_unavailable",
        );
      }
    }
    return reply.code(503).send({ status: "unavailable" });
  });
  return Promise.resolve();
};
