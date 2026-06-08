import type { FastifyInstance } from "fastify";
import { getPublicAppStatus } from "@g18/domain";
import { healthStatusSchema } from "@g18/schemas";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const status = getPublicAppStatus(false);

    return healthStatusSchema.parse({
      status: status === "ready" ? "ok" : "ok",
      service: "g18-api",
      checkedAt: new Date().toISOString()
    });
  });
}
