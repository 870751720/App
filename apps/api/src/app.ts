import cors from "@fastify/cors";
import Fastify from "fastify";
import type { AuthRepository } from "./data/authRepository.js";
import type { LearningRepository } from "./data/learningRepository.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerAiLearningRoutes } from "./routes/aiLearning.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerLearningRoutes } from "./routes/learning.js";
import { registerOperationsRoutes } from "./routes/operations.js";

export interface CreateApiAppOptions {
  authRepository: AuthRepository;
  aiAccessToken?: string;
  aiStudentEmail?: string;
  healthCheck?: () => Promise<Record<string, "ok" | "error">>;
  jwtSecret: string;
  learningRepository: LearningRepository;
  webOrigin: string;
}

export async function createApiApp({ authRepository, aiAccessToken, aiStudentEmail, healthCheck, jwtSecret, learningRepository, webOrigin }: CreateApiAppOptions) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: webOrigin
  });

  await registerHealthRoutes(app, { healthCheck });
  await registerAuthRoutes(app, { authRepository, jwtSecret });
  if (aiAccessToken) {
    await registerAiLearningRoutes(app, { authRepository, learningRepository, accessToken: aiAccessToken, studentEmail: aiStudentEmail ?? "user@app.local" });
  }
  await registerLearningRoutes(app, { jwtSecret, learningRepository });
  await registerOperationsRoutes(app, { jwtSecret });

  return app;
}
