import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerAiLearningRoutes } from "./aiLearning.js";
import type { AuthRepository } from "../data/authRepository.js";
import type { LearningRepository } from "../data/learningRepository.js";
import type { LearningOverviewResponse, UserAccountResponse } from "@app/schemas";

const user: UserAccountResponse = {
  id: "1",
  email: "user@app.local",
  name: "复读学生",
  role: "user",
  title: "复读学生"
};

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
  exams: [],
  weeklyReport: {
    generatedAt: "2026-06-12T00:00:00.000Z",
    focus: ["函数性质"],
    progress: ["已接入"],
    risks: ["样本少"],
    nextWeek: ["补题"]
  }
};

test("AI learning context requires the configured access token", async () => {
  const app = Fastify();
  await registerAiLearningRoutes(app, {
    accessToken: "ai-token",
    authRepository: createAuthRepository(),
    learningRepository: createLearningRepository(),
    studentEmail: user.email
  });

  const response = await app.inject({ method: "GET", url: "/ai/learning/context" });

  assert.equal(response.statusCode, 401);
});

test("AI learning context returns the bound student overview", async () => {
  const app = Fastify();
  await registerAiLearningRoutes(app, {
    accessToken: "ai-token",
    authRepository: createAuthRepository(),
    learningRepository: createLearningRepository(),
    studentEmail: user.email
  });

  const response = await app.inject({
    method: "GET",
    url: "/ai/learning/context",
    headers: { authorization: "Bearer ai-token" }
  });
  const payload = response.json() as { studentEmail: string; overview: LearningOverviewResponse };

  assert.equal(response.statusCode, 200);
  assert.equal(payload.studentEmail, user.email);
  assert.equal(payload.overview.subjects.includes("geography"), true);
});

test("AI learning ingest writes supported learning inputs", async () => {
  const repository = createLearningRepository();
  const app = Fastify();
  await registerAiLearningRoutes(app, {
    accessToken: "ai-token",
    authRepository: createAuthRepository(),
    learningRepository: repository,
    studentEmail: user.email
  });

  const response = await app.inject({
    method: "POST",
    url: "/ai/learning/ingest",
    headers: { "x-ai-access-token": "ai-token" },
    payload: {
      mistakes: [
        {
          subject: "math",
          knowledgePointIds: ["math-function"],
          questionStem: "求函数零点。",
          standardAnswer: "先分析单调性。",
          studentAnswer: "直接代入。",
          scoreLost: 4
        }
      ],
      mastery: [
        {
          knowledgePointId: "math-function",
          level: "stable",
          score: 85,
          attempts: 10,
          correctAttempts: 8
        }
      ]
    }
  });
  const payload = response.json() as { mistakes: unknown[]; mastery: unknown[] };

  assert.equal(response.statusCode, 200);
  assert.equal(payload.mistakes.length, 1);
  assert.equal(payload.mastery.length, 1);
});

function createAuthRepository(): AuthRepository {
  return {
    async authenticate() {
      return user;
    },
    async findByEmail(email) {
      return email === user.email ? user : null;
    }
  };
}

function createLearningRepository(): LearningRepository {
  return {
    async getOverview() {
      return overview;
    },
    async analyzeMistake() {
      return {
        causes: ["method_gap"],
        diagnosis: "需要补齐方法。",
        nextRule: "先列条件。",
        recommendedDrill: "做 3 道同类题。"
      };
    },
    async importQuestionSource() {
      return {
        source: {
          id: "src",
          type: "manual",
          title: "AI 输入题源",
          provider: "ai",
          licenseScope: "personal_only",
          importedAt: "2026-06-12T00:00:00.000Z",
          note: "AI 输入"
        },
        questions: [
          {
            id: "q",
            sourceId: "src",
            subject: "math",
            knowledgePointIds: ["math-function"],
            type: "calculation",
            difficulty: 3,
            stem: "题干",
            answer: "答案",
            analysis: "解析",
            createdAt: "2026-06-12T00:00:00.000Z"
          }
        ]
      };
    },
    async importWebPage() {
      throw new Error("not used");
    },
    async importWebPages() {
      return { imports: [], failed: [] };
    },
    async uploadQuestionAsset() {
      throw new Error("not used");
    },
    async generateSimilarQuestions() {
      throw new Error("not used");
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
      return { knowledgePointId: "math-function", level: "stable", score: 85, attempts: 10, correctAttempts: 8, lastPracticedAt: "2026-06-12T00:00:00.000Z" };
    },
    async updateQuestion() {
      throw new Error("not used");
    },
    async createExamRecord() {
      return {
        id: "exam",
        title: "阶段测试",
        takenAt: "2026-06-12T00:00:00.000Z",
        scores: { chinese: 100, math: 100, english: 100, physics: 70, chemistry: 70, geography: 70 },
        total: 510,
        summary: "阶段测试"
      };
    },
    async completeStudyTask() {
      throw new Error("not used");
    },
    async updateMistakeReview() {
      throw new Error("not used");
    }
  };
}
