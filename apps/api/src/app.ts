import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";

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

  return app;
}
