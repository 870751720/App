import { createApiApp } from "./app.js";
import { loadApiEnv } from "./config/env.js";
import { createPrismaAuthRepository } from "./data/authRepository.js";
import { createPrismaLearningRepository } from "./data/learningRepository.js";
import { createHttpMistakeDiagnosisAdapter } from "./data/mistakeDiagnosisAdapter.js";
import { createHttpOcrAdapter } from "./data/ocrAdapter.js";
import { createHttpQuestionGenerationAdapter } from "./data/questionGenerationAdapter.js";
import { createPrismaClient } from "./db/prisma.js";

const env = loadApiEnv();
const prisma = createPrismaClient(env.DATABASE_URL);
const ocrAdapter = env.OCR_ENDPOINT
  ? createHttpOcrAdapter({
      endpoint: env.OCR_ENDPOINT,
      apiKey: env.OCR_API_KEY
    })
  : undefined;
const questionGenerationAdapter = env.AI_QUESTION_ENDPOINT
  ? createHttpQuestionGenerationAdapter({
      endpoint: env.AI_QUESTION_ENDPOINT,
      apiKey: env.AI_QUESTION_API_KEY
    })
  : undefined;
const mistakeDiagnosisAdapter = env.AI_DIAGNOSIS_ENDPOINT
  ? createHttpMistakeDiagnosisAdapter({
      endpoint: env.AI_DIAGNOSIS_ENDPOINT,
      apiKey: env.AI_DIAGNOSIS_API_KEY
    })
  : undefined;
const app = await createApiApp({
  authRepository: createPrismaAuthRepository(prisma),
  healthCheck: async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { database: "ok" };
    } catch {
      return { database: "error" };
    }
  },
  jwtSecret: env.JWT_SECRET,
  learningRepository: createPrismaLearningRepository(prisma, { ocrAdapter, questionGenerationAdapter, mistakeDiagnosisAdapter }),
  webOrigin: env.WEB_ORIGIN
});

try {
  await app.listen({
    host: env.API_HOST,
    port: env.API_PORT
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
