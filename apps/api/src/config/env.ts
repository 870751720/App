import { z } from "zod";

const optionalNonEmptyString = z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional());
const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());

const envSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  AI_DIAGNOSIS_ENDPOINT: optionalUrl,
  AI_DIAGNOSIS_API_KEY: optionalNonEmptyString,
  AI_QUESTION_ENDPOINT: optionalUrl,
  AI_QUESTION_API_KEY: optionalNonEmptyString,
  OCR_ENDPOINT: optionalUrl,
  OCR_API_KEY: optionalNonEmptyString
});

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(source);
}
