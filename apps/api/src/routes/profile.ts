import type { FastifyInstance } from "fastify";
import { profileContent } from "@app/domain";
import { profileContentSchema } from "@app/schemas";

export async function registerProfileRoutes(app: FastifyInstance) {
  app.get("/profile", async () => profileContentSchema.parse(profileContent));
}
