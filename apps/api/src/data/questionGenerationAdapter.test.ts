import assert from "node:assert/strict";
import test from "node:test";
import { createHttpQuestionGenerationAdapter } from "./questionGenerationAdapter.js";
import type { Question, QuestionSource } from "@app/schemas";

const source: QuestionSource = {
  id: "src-ai",
  type: "mistake_variant",
  title: "AI 同类题",
  provider: "test",
  licenseScope: "ai_generated",
  importedAt: "2026-06-12T00:00:00.000Z",
  note: "测试"
};

const baseQuestion: Question = {
  id: "q-base",
  sourceId: "src-base",
  subject: "math",
  knowledgePointIds: ["math-function"],
  type: "calculation",
  difficulty: 3,
  stem: "求函数零点。",
  answer: "待定",
  analysis: "待定",
  createdAt: "2026-06-12T00:00:00.000Z"
};

test("HTTP question generation adapter normalizes generated questions", async () => {
  const adapter = createHttpQuestionGenerationAdapter({
    endpoint: "https://example.test/generate",
    fetcher: async () =>
      new Response(JSON.stringify({
        questions: [
          {
            id: "q-generated",
            sourceId: "wrong-source",
            subject: "english",
            knowledgePointIds: ["math-function"],
            type: "calculation",
            difficulty: 4,
            stem: "变式题",
            answer: "答案",
            analysis: "解析",
            createdAt: "2020-01-01T00:00:00.000Z"
          }
        ]
      }))
  });

  const generated = await adapter.generateSimilarQuestions({ baseQuestion, source, count: 1 });

  assert.equal(generated.source.id, source.id);
  assert.equal(generated.questions[0]?.sourceId, source.id);
  assert.equal(generated.questions[0]?.subject, baseQuestion.subject);
  assert.equal(generated.questions[0]?.createdAt, source.importedAt);
});
