import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  aiLearningContextResponseSchema,
  aiLearningIngestRequestSchema,
  aiLearningIngestResponseSchema
} from "@app/schemas";
import type { AuthRepository } from "../data/authRepository.js";
import type { LearningRepository } from "../data/learningRepository.js";

export interface RegisterAiLearningRoutesOptions {
  accessToken: string;
  authRepository: AuthRepository;
  learningRepository: LearningRepository;
  studentEmail: string;
}

export async function registerAiLearningRoutes(
  app: FastifyInstance,
  { accessToken, authRepository, learningRepository, studentEmail }: RegisterAiLearningRoutesOptions
) {
  async function resolveAiStudent(request: FastifyRequest) {
    if (!isAuthorizedAiRequest(request, accessToken)) {
      return null;
    }

    return authRepository.findByEmail(studentEmail);
  }

  app.get("/ai/learning/context", async (request, reply) => {
    const user = await resolveAiStudent(request);
    if (!user) {
      return reply.code(401).send({ message: "AI access token is invalid or student account is not configured" });
    }

    return aiLearningContextResponseSchema.parse({
      studentEmail,
      overview: await learningRepository.getOverview(user)
    });
  });

  app.post("/ai/learning/ingest", async (request, reply) => {
    const user = await resolveAiStudent(request);
    if (!user) {
      return reply.code(401).send({ message: "AI access token is invalid or student account is not configured" });
    }

    const input = aiLearningIngestRequestSchema.parse(request.body);
    const mistakes = [];
    const questionSources = [];
    const mastery = [];
    const exams = [];

    for (const mistake of input.mistakes) {
      mistakes.push(await learningRepository.analyzeMistake(user, mistake));
    }
    for (const source of input.questionSources) {
      questionSources.push(await learningRepository.importQuestionSource(user, source));
    }
    for (const record of input.mastery) {
      mastery.push(await learningRepository.updateMastery(user, record));
    }
    for (const exam of input.exams) {
      exams.push(await learningRepository.createExamRecord(user, exam));
    }

    return aiLearningIngestResponseSchema.parse({
      mistakes,
      questionSources,
      mastery,
      exams,
      overview: await learningRepository.getOverview(user)
    });
  });
}

function isAuthorizedAiRequest(request: FastifyRequest, expectedToken: string) {
  const suppliedToken = readAiAccessToken(request);
  if (!suppliedToken) {
    return false;
  }

  const supplied = Buffer.from(suppliedToken);
  const expected = Buffer.from(expectedToken);
  return supplied.byteLength === expected.byteLength && timingSafeEqual(supplied, expected);
}

function readAiAccessToken(request: FastifyRequest) {
  const headerToken = request.headers["x-ai-access-token"];
  if (typeof headerToken === "string") {
    return headerToken;
  }

  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return null;
}
