import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { getQuestionSourceCatalog } from "@app/domain";
import type { LearningOverviewResponse, UserAccountResponse } from "@app/schemas";
import type { LearningRepository } from "../data/learningRepository.js";
import { registerLearningRoutes } from "./learning.js";
import { createSessionToken } from "./sessionToken.js";

const jwtSecret = "test-secret";
const user: UserAccountResponse = {
  id: "1",
  email: "user@app.local",
  name: "复读学生",
  role: "user",
  title: "复读学生"
};

test("question source catalog requires authentication", async () => {
  const app = Fastify();
  await registerLearningRoutes(app, {
    jwtSecret,
    learningRepository: createLearningRepository()
  });

  const response = await app.inject({ method: "GET", url: "/learning/question-source-catalog" });

  assert.equal(response.statusCode, 401);
});

test("question source catalog returns public import sources", async () => {
  const app = Fastify();
  await registerLearningRoutes(app, {
    jwtSecret,
    learningRepository: createLearningRepository()
  });

  const response = await app.inject({
    method: "GET",
    url: "/learning/question-source-catalog",
    headers: { authorization: `Bearer ${createSessionToken(user, jwtSecret)}` }
  });
  const payload = response.json() as { sources: Array<{ id: string; url: string; subject: string }> };

  assert.equal(response.statusCode, 200);
  assert.ok(payload.sources.length >= 6);
  assert.ok(payload.sources.every((source) => source.url.startsWith("https://")));
});

function createLearningRepository(): LearningRepository {
  return {
    async getOverview() {
      return overview;
    },
    async getQuestionSourceCatalog() {
      return getQuestionSourceCatalog();
    },
    async analyzeMistake() {
      throw new Error("not used");
    },
    async importQuestionSource() {
      throw new Error("not used");
    },
    async importWebPage() {
      throw new Error("not used");
    },
    async importWebPages() {
      throw new Error("not used");
    },
    async importQuestionSourceCatalog() {
      return { imports: [], failed: [] };
    },
    async uploadQuestionAsset() {
      throw new Error("not used");
    },
    async generateSimilarQuestions() {
      throw new Error("not used");
    },
    async generateKnowledgePointDrill() {
      throw new Error("not used");
    },
    async generateWeakPointDrills() {
      return { imports: [], selectedKnowledgePointIds: [] };
    },
    async generateDailyPlan() {
      return [];
    },
    async getWeeklyReport() {
      return overview.weeklyReport;
    },
    async upsertKnowledgePoint() {
      return overview.knowledgePoints[0]!;
    },
    async updateMastery() {
      return overview.mastery[0]!;
    },
    async updateQuestion() {
      throw new Error("not used");
    },
    async createExamRecord() {
      return overview.exams[0]!;
    },
    async completeStudyTask() {
      throw new Error("not used");
    },
    async updateMistakeReview() {
      throw new Error("not used");
    }
  };
}

const overview: LearningOverviewResponse = {
  generatedAt: "2026-06-12T00:00:00.000Z",
  student: {
    name: "复读学生",
    province: "四川",
    track: "新高考 3+1+2：语文、数学、英语、物理、化学、地理",
    targetScore: 620,
    daysToExam: 360
  },
  subjects: ["chinese", "math", "english", "physics", "chemistry", "geography"],
  knowledgePoints: [{ id: "math-function", subject: "math", chapter: "函数", name: "函数性质", parentId: null, examWeight: 5 }],
  mastery: [{ knowledgePointId: "math-function", level: "basic", score: 60, attempts: 1, correctAttempts: 1, lastPracticedAt: null }],
  questionSources: [],
  questions: [],
  assets: [],
  mistakes: [],
  dailyTasks: [],
  exams: [
    {
      id: "exam",
      title: "阶段测试",
      takenAt: "2026-06-12T00:00:00.000Z",
      scores: { chinese: 100, math: 100, english: 100, physics: 70, chemistry: 70, geography: 70 },
      total: 510,
      summary: "阶段测试"
    }
  ],
  weeklyReport: {
    generatedAt: "2026-06-12T00:00:00.000Z",
    focus: ["函数性质"],
    progress: ["已接入"],
    risks: ["样本少"],
    nextWeek: ["补题"]
  }
};
