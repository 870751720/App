import type { FastifyInstance } from "fastify";
import { getOperationsOverview } from "@app/domain";
import { operationsOverviewSchema } from "@app/schemas";
import { resolveSessionUser } from "./auth.js";

export async function registerOperationsRoutes(app: FastifyInstance) {
  app.get("/operations/overview", async (request, reply) => {
    const user = resolveSessionUser(request);

    if (!user) {
      return reply.code(401).send({
        message: "Authentication required"
      });
    }

    return operationsOverviewSchema.parse(getOperationsOverview());
  });
}
