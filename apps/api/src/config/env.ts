import { z } from "zod";

const envSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173")
});

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(source);
}
