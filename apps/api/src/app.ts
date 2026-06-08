import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerProfileRoutes } from "./routes/profile.js";

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
  await registerProfileRoutes(app);

  return app;
}
