import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerOperationsRoutes } from "./routes/operations.js";

export interface CreateApiAppOptions {
  webOrigin: string;
}

export async function createApiApp({ webOrigin }: CreateApiAppOptions) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: webOrigin
  });

  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerOperationsRoutes(app);

  return app;
}
