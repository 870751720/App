import type { FastifyInstance } from "fastify";
import { getPublicAppStatus } from "@app/domain";
import { healthStatusSchema } from "@app/schemas";

export interface RegisterHealthRoutesOptions {
  healthCheck?: () => Promise<Record<string, "ok" | "error">>;
}

export async function registerHealthRoutes(app: FastifyInstance, { healthCheck }: RegisterHealthRoutesOptions = {}) {
  app.get("/health", async () => {
    const status = getPublicAppStatus(false);
    const checks = healthCheck ? await healthCheck() : undefined;

    return healthStatusSchema.parse({
      status: status === "ready" ? "ok" : "ok",
      service: "api",
      checkedAt: new Date().toISOString(),
      checks
    });
  });
}
