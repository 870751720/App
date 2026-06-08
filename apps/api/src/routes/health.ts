import type { FastifyInstance } from "fastify";
import { getPublicAppStatus } from "@app/domain";
import { healthStatusSchema } from "@app/schemas";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const status = getPublicAppStatus(false);

    return healthStatusSchema.parse({
      status: status === "ready" ? "ok" : "ok",
      service: "api",
      checkedAt: new Date().toISOString()
    });
  });
}
