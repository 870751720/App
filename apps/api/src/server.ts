import { createApiApp } from "./app.js";
import { loadApiEnv } from "./config/env.js";

const env = loadApiEnv();
const app = await createApiApp({ webOrigin: env.WEB_ORIGIN });

try {
  await app.listen({
    host: env.API_HOST,
    port: env.API_PORT
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
