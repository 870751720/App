import assert from "node:assert/strict";
import test from "node:test";
import { createInitialLearningOverview, generateKnowledgePointDrill, parseImportedQuestions, selectWeakKnowledgePoints } from "./learning.js";
import { createSupplementalQuestionBank } from "./questionBank.js";
import { getQuestionSourceCatalog } from "./questionSourceCatalog.js";
import { generatedQuestionSetSchema, questionSourceCatalogItemSchema, type QuestionSource } from "@app/schemas";

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

test("createSupplementalQuestionBank returns valid six-subject training sets", () => {
  const sets = createSupplementalQuestionBank(new Date("2026-06-12T00:00:00.000Z"));

  assert.equal(sets.length, 6);
  assert.equal(sets.reduce((sum, set) => sum + set.questions.length, 0), 48);
  for (const set of sets) {
    generatedQuestionSetSchema.parse(set);
    assert.equal(set.source.licenseScope, "ai_generated");
    assert.ok(set.questions.every((question) => question.knowledgePointIds.length > 0));
  }
});

test("createInitialLearningOverview gives every knowledge point a mastery record", () => {
  const overview = createInitialLearningOverview(new Date("2026-06-12T00:00:00.000Z"));
  const masteryIds = new Set(overview.mastery.map((record) => record.knowledgePointId));

  assert.equal(overview.knowledgePoints.length, 21);
  for (const point of overview.knowledgePoints) {
    assert.equal(masteryIds.has(point.id), true, `missing mastery for ${point.id}`);
  }
});

test("generateKnowledgePointDrill returns valid AI generated candidates", () => {
  const overview = createInitialLearningOverview(new Date("2026-06-12T00:00:00.000Z"));
  const point = overview.knowledgePoints.find((candidate) => candidate.id === "physics-electric")!;
  const drillSource: QuestionSource = {
    id: "src-ai-kp-test",
    type: "ai_generated",
    title: "知识点训练题",
    provider: "local-ai-adapter",
    licenseScope: "ai_generated",
    importedAt: "2026-06-12T00:00:00.000Z",
    note: "测试"
  };

  const generated = generateKnowledgePointDrill(point, drillSource, 6);

  generatedQuestionSetSchema.parse(generated);
  assert.equal(generated.questions.length, 6);
  assert.ok(generated.questions.every((question) => question.knowledgePointIds.includes(point.id)));
  assert.ok(generated.questions.every((question) => question.sourceId === drillSource.id));
});

test("selectWeakKnowledgePoints prioritizes low mastery and high weight points", () => {
  const overview = createInitialLearningOverview(new Date("2026-06-12T00:00:00.000Z"));
  const selected = selectWeakKnowledgePoints(overview.knowledgePoints, overview.mastery, overview.mistakes, 3);

  assert.equal(selected.length, 3);
  assert.equal(selected[0]?.point.id, "physics-electric");
  assert.ok(selected.every((item) => item.point.id && item.mastery.knowledgePointId === item.point.id));
});

test("getQuestionSourceCatalog returns importable public source entries", () => {
  const sources = getQuestionSourceCatalog();

  assert.ok(sources.length >= 6);
  assert.ok(sources.some((source) => source.tags.includes("四川")));
  for (const source of sources) {
    questionSourceCatalogItemSchema.parse(source);
    assert.match(source.url, /^https:\/\//);
  }
});
