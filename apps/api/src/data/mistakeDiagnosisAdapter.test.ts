import assert from "node:assert/strict";
import test from "node:test";
import { createHttpMistakeDiagnosisAdapter } from "./mistakeDiagnosisAdapter.js";
import type { AnalyzeMistakeRequest } from "@app/schemas";

const input: AnalyzeMistakeRequest = {
  subject: "math",
  knowledgePointIds: ["math-function"],
  questionStem: "求函数零点。",
  standardAnswer: "先判断单调性再定位零点。",
  studentAnswer: "直接代入。",
  scoreLost: 4
};

test("HTTP mistake diagnosis adapter validates diagnosis response", async () => {
  const adapter = createHttpMistakeDiagnosisAdapter({
    endpoint: "https://example.test/diagnose",
    apiKey: "secret",
    fetcher: async (url, init) => {
      assert.equal(url, "https://example.test/diagnose");
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(String(init?.body)), input);
      assert.equal((init?.headers as Record<string, string>).authorization, "Bearer secret");

      return new Response(
        JSON.stringify({
          causes: ["concept_gap", "method_gap"],
          diagnosis: "概念识别和解题路径都有缺口。",
          nextRule: "先标出题型，再列出必要条件。",
          recommendedDrill: "做 3 道同知识点基础题。"
        })
      );
    }
  });

  const diagnosis = await adapter.diagnoseMistake(input);

  assert.deepEqual(diagnosis.causes, ["concept_gap", "method_gap"]);
  assert.equal(diagnosis.nextRule, "先标出题型，再列出必要条件。");
});

test("HTTP mistake diagnosis adapter rejects failed response", async () => {
  const adapter = createHttpMistakeDiagnosisAdapter({
    endpoint: "https://example.test/diagnose",
    fetcher: async () => new Response("failed", { status: 502 })
  });

  await assert.rejects(() => adapter.diagnoseMistake(input), /status 502/);
});
