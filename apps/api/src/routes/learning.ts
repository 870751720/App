import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  analyzeMistakeRequestSchema,
  analyzeMistakeResponseSchema,
  completeStudyTaskRequestSchema,
  createExamRecordRequestSchema,
  examRecordSchema,
  generateDailyPlanRequestSchema,
  generateKnowledgePointDrillRequestSchema,
  generateSimilarQuestionsRequestSchema,
  generatedQuestionSetSchema,
  importQuestionSourceCatalogRequestSchema,
  importWebPageRequestSchema,
  importWebPagesRequestSchema,
  importWebPagesResponseSchema,
  importQuestionSourceRequestSchema,
  knowledgePointSchema,
  learningOverviewSchema,
  masteryRecordSchema,
  mistakeSchema,
  questionSchema,
  questionSourceCatalogResponseSchema,
  studyTaskSchema,
  updateMasteryRequestSchema,
  updateMistakeReviewRequestSchema,
  updateQuestionRequestSchema,
  upsertKnowledgePointRequestSchema,
  uploadedQuestionAssetSchema,
  uploadQuestionAssetRequestSchema,
  weeklyReportSchema
} from "@app/schemas";
import type { LearningRepository } from "../data/learningRepository.js";
import { resolveSessionUser } from "./auth.js";

function requireUser(request: FastifyRequest, jwtSecret: string) {
  return resolveSessionUser(request, jwtSecret);
}

export interface RegisterLearningRoutesOptions {
  jwtSecret: string;
  learningRepository: LearningRepository;
}

export async function registerLearningRoutes(app: FastifyInstance, { jwtSecret, learningRepository }: RegisterLearningRoutesOptions) {
  app.get("/learning/overview", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    return learningOverviewSchema.parse(await learningRepository.getOverview(user));
  });

  app.post("/learning/ai/analyze-mistake", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = analyzeMistakeRequestSchema.parse(request.body);
    return analyzeMistakeResponseSchema.parse(await learningRepository.analyzeMistake(user, input));
  });

  app.post("/learning/question-sources/import", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = importQuestionSourceRequestSchema.parse(request.body);
    try {
      return generatedQuestionSetSchema.parse(await learningRepository.importQuestionSource(user, input));
    } catch (error) {
      if (error instanceof Error && error.message === "No question text found") {
        return reply.code(400).send({ message: "No question text found" });
      }

      throw error;
    }
  });

  app.post("/learning/question-sources/import-web", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = importWebPageRequestSchema.parse(request.body);
    try {
      return generatedQuestionSetSchema.parse(await learningRepository.importWebPage(user, input));
    } catch (error) {
      if (error instanceof Error && error.message === "No question text found") {
        return reply.code(400).send({ message: "No question text found" });
      }

      throw error;
    }
  });

  app.post("/learning/question-sources/import-web-batch", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = importWebPagesRequestSchema.parse(request.body);
    return importWebPagesResponseSchema.parse(await learningRepository.importWebPages(user, input));
  });

  app.get("/learning/question-source-catalog", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    return questionSourceCatalogResponseSchema.parse({
      sources: await learningRepository.getQuestionSourceCatalog()
    });
  });

  app.post("/learning/question-source-catalog/import", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = importQuestionSourceCatalogRequestSchema.parse(request.body);
    return importWebPagesResponseSchema.parse(await learningRepository.importQuestionSourceCatalog(user, input));
  });

  app.post("/learning/question-sources/upload", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = uploadQuestionAssetRequestSchema.parse(request.body);
    return uploadedQuestionAssetSchema.parse(await learningRepository.uploadQuestionAsset(user, input));
  });

  app.post("/learning/ai/generate-similar-questions", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = generateSimilarQuestionsRequestSchema.parse(request.body);

    try {
      return generatedQuestionSetSchema.parse(await learningRepository.generateSimilarQuestions(user, input.questionId, input.count));
    } catch (error) {
      if (error instanceof Error && error.message === "Question not found") {
        return reply.code(404).send({ message: "Question not found" });
      }

      throw error;
    }
  });

  app.post("/learning/ai/generate-knowledge-point-drill", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = generateKnowledgePointDrillRequestSchema.parse(request.body);

    try {
      return generatedQuestionSetSchema.parse(await learningRepository.generateKnowledgePointDrill(user, input));
    } catch (error) {
      if (error instanceof Error && error.message === "Knowledge point not found") {
        return reply.code(404).send({ message: "Knowledge point not found" });
      }

      throw error;
    }
  });

  app.post("/learning/ai/generate-daily-plan", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = generateDailyPlanRequestSchema.parse(request.body);
    return studyTaskSchema.array().parse(await learningRepository.generateDailyPlan(user, input.availableMinutes));
  });

  app.get("/learning/weekly-report", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    return weeklyReportSchema.parse(await learningRepository.getWeeklyReport(user));
  });

  app.post("/learning/knowledge-points", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = upsertKnowledgePointRequestSchema.parse(request.body);
    return knowledgePointSchema.parse(await learningRepository.upsertKnowledgePoint(user, input));
  });

  app.post("/learning/mastery", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = updateMasteryRequestSchema.parse(request.body);
    return masteryRecordSchema.parse(await learningRepository.updateMastery(user, input));
  });

  app.post("/learning/questions/review", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = updateQuestionRequestSchema.parse(request.body);

    try {
      return questionSchema.parse(await learningRepository.updateQuestion(user, input));
    } catch (error) {
      if (error instanceof Error && error.message === "Question not found") {
        return reply.code(404).send({ message: "Question not found" });
      }

      throw error;
    }
  });

  app.post("/learning/exams", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = createExamRecordRequestSchema.parse(request.body);
    return examRecordSchema.parse(await learningRepository.createExamRecord(user, input));
  });

  app.post("/learning/tasks/complete", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = completeStudyTaskRequestSchema.parse(request.body);

    try {
      return studyTaskSchema.parse(await learningRepository.completeStudyTask(user, input.taskId));
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return reply.code(404).send({ message: "Task not found" });
      }

      throw error;
    }
  });

  app.post("/learning/mistakes/review", async (request, reply) => {
    const user = requireUser(request, jwtSecret);
    if (!user) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const input = updateMistakeReviewRequestSchema.parse(request.body);

    try {
      return mistakeSchema.parse(await learningRepository.updateMistakeReview(user, input));
    } catch (error) {
      if (error instanceof Error && error.message === "Mistake not found") {
        return reply.code(404).send({ message: "Mistake not found" });
      }

      throw error;
    }
  });
}
