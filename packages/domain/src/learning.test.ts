import assert from "node:assert/strict";
import test from "node:test";
import { parseImportedQuestions } from "./learning.js";
import type { QuestionSource } from "@app/schemas";

const source: QuestionSource = {
  id: "src-test",
  type: "manual",
  title: "测试题源",
  provider: "test",
  licenseScope: "personal_only",
  importedAt: "2026-06-12T00:00:00.000Z",
  note: "测试"
};

test("parseImportedQuestions splits numbered source text into candidates", () => {
  const questions = parseImportedQuestions({
    rawText: "1. 下列函数中，哪一项为偶函数？A. x B. x^2 C. x^3 D. x+1\n2. 已知 f'(x)=2x，求 f(x) 的单调区间。",
    source,
    subject: "math",
    knowledgePointId: "math-function"
  });

  assert.equal(questions.length, 2);
  assert.equal(questions[0]?.type, "single_choice");
  assert.equal(questions[1]?.type, "calculation");
  assert.deepEqual(questions[0]?.knowledgePointIds, ["math-function"]);
});

test("parseImportedQuestions uses paragraph fallback for unnumbered text", () => {
  const questions = parseImportedQuestions({
    rawText: "阅读下面材料，概括文章主旨。\n\n实验中观察到明显沉淀，请分析原因并写出离子方程式。",
    source,
    subject: "chemistry",
    knowledgePointId: "chem-balance"
  });

  assert.equal(questions.length, 2);
  assert.equal(questions[1]?.type, "experiment");
});

test("parseImportedQuestions returns no candidates for blank text", () => {
  const questions = parseImportedQuestions({
    rawText: "   \n\n   ",
    source,
    subject: "math",
    knowledgePointId: "math-function"
  });

  assert.deepEqual(questions, []);
});
