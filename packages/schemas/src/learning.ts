import { z } from "zod";

export const subjectSchema = z.enum(["chinese", "math", "english", "physics", "chemistry", "geography"]);
export const masteryLevelSchema = z.enum(["unstarted", "understood", "basic", "stable"]);
export const questionTypeSchema = z.enum(["single_choice", "multiple_choice", "fill_blank", "calculation", "essay", "experiment"]);
export const mistakeCauseSchema = z.enum([
  "concept_gap",
  "formula_memory",
  "reading_error",
  "calculation_error",
  "method_gap",
  "time_pressure",
  "expression_issue"
]);
export const questionSourceTypeSchema = z.enum(["manual", "image_ocr", "pdf_import", "web_import", "gaokao_paper", "ai_generated", "mistake_variant"]);
export const licenseScopeSchema = z.enum(["personal_only", "authorized", "public_reference", "ai_generated"]);

export const knowledgePointSchema = z.object({
  id: z.string().min(1),
  subject: subjectSchema,
  chapter: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  examWeight: z.number().min(1).max(5)
});

export const masteryRecordSchema = z.object({
  knowledgePointId: z.string().min(1),
  level: masteryLevelSchema,
  score: z.number().min(0).max(100),
  attempts: z.number().int().min(0),
  correctAttempts: z.number().int().min(0),
  lastPracticedAt: z.string().datetime().nullable()
});

export const questionSourceSchema = z.object({
  id: z.string().min(1),
  type: questionSourceTypeSchema,
  title: z.string().min(1),
  provider: z.string().min(1),
  licenseScope: licenseScopeSchema,
  importedAt: z.string().datetime(),
  note: z.string().min(1)
});

export const questionSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  subject: subjectSchema,
  knowledgePointIds: z.array(z.string().min(1)).min(1),
  type: questionTypeSchema,
  difficulty: z.number().min(1).max(5),
  stem: z.string().min(1),
  answer: z.string().min(1),
  analysis: z.string().min(1),
  createdAt: z.string().datetime()
});

export const mistakeSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1),
  subject: subjectSchema,
  knowledgePointIds: z.array(z.string().min(1)).min(1),
  studentAnswer: z.string().min(1),
  scoreLost: z.number().min(0),
  causes: z.array(mistakeCauseSchema).min(1),
  diagnosis: z.string().min(1),
  nextRule: z.string().min(1),
  reviewStage: z.number().int().min(0).max(3),
  createdAt: z.string().datetime()
});

export const studyTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subject: subjectSchema,
  knowledgePointId: z.string().min(1),
  minutes: z.number().int().min(5).max(180),
  priority: z.number().int().min(1).max(5),
  reason: z.string().min(1),
  status: z.enum(["pending", "done"])
});

export const examRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  takenAt: z.string().datetime(),
  scores: z.record(subjectSchema, z.number().min(0).max(150)),
  total: z.number().min(0).max(750),
  summary: z.string().min(1)
});

export const weeklyReportSchema = z.object({
  generatedAt: z.string().datetime(),
  focus: z.array(z.string().min(1)).min(1),
  progress: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1),
  nextWeek: z.array(z.string().min(1)).min(1)
});

export const questionAssetSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  byteSize: z.number().int().min(0),
  extractedText: z.string(),
  status: z.enum(["pending_review", "ocr_text_provided", "text_extracted", "ai_ocr_extracted", "needs_manual_text"]),
  createdAt: z.string().datetime()
});

export const learningOverviewSchema = z.object({
  generatedAt: z.string().datetime(),
  student: z.object({
    name: z.string().min(1),
    province: z.literal("四川"),
    track: z.string().min(1),
    targetScore: z.number().min(0).max(750),
    daysToExam: z.number().int().min(0)
  }),
  subjects: z.array(subjectSchema).min(1),
  knowledgePoints: z.array(knowledgePointSchema).min(1),
  mastery: z.array(masteryRecordSchema).min(1),
  questionSources: z.array(questionSourceSchema),
  questions: z.array(questionSchema),
  assets: z.array(questionAssetSchema),
  mistakes: z.array(mistakeSchema),
  dailyTasks: z.array(studyTaskSchema),
  exams: z.array(examRecordSchema),
  weeklyReport: weeklyReportSchema
});

export const analyzeMistakeRequestSchema = z.object({
  subject: subjectSchema,
  knowledgePointIds: z.array(z.string().min(1)).min(1),
  questionStem: z.string().min(1),
  standardAnswer: z.string().min(1),
  studentAnswer: z.string().min(1),
  scoreLost: z.number().min(0)
});

export const analyzeMistakeResponseSchema = z.object({
  causes: z.array(mistakeCauseSchema).min(1),
  diagnosis: z.string().min(1),
  nextRule: z.string().min(1),
  recommendedDrill: z.string().min(1)
});

export const importQuestionSourceRequestSchema = z.object({
  type: questionSourceTypeSchema,
  title: z.string().min(1),
  provider: z.string().min(1),
  rawText: z.string().min(1),
  url: z.string().url().optional(),
  subject: subjectSchema.optional(),
  knowledgePointId: z.string().min(1).optional()
});

export const importWebPageRequestSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).optional(),
  provider: z.string().min(1).default("web"),
  subject: subjectSchema.optional(),
  knowledgePointId: z.string().min(1).optional()
});

export const importWebPagesRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(20),
  provider: z.string().min(1).default("web"),
  subject: subjectSchema.optional(),
  knowledgePointId: z.string().min(1).optional()
});

export const questionSourceCatalogItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  provider: z.string().min(1),
  url: z.string().url(),
  subject: subjectSchema,
  knowledgePointId: z.string().min(1),
  sourceType: z.enum(["web_import", "gaokao_paper"]),
  note: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1)
});

export const questionSourceCatalogResponseSchema = z.object({
  sources: z.array(questionSourceCatalogItemSchema)
});

export const importQuestionSourceCatalogRequestSchema = z.object({
  sourceIds: z.array(z.string().min(1)).min(1).max(20)
});

export const uploadQuestionAssetRequestSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  contentBase64: z.string().min(1),
  ocrText: z.string().min(1).optional(),
  title: z.string().min(1).optional()
});

export const generateSimilarQuestionsRequestSchema = z.object({
  questionId: z.string().min(1),
  count: z.number().int().min(1).max(8).default(4)
});

export const generateKnowledgePointDrillRequestSchema = z.object({
  knowledgePointId: z.string().min(1),
  count: z.number().int().min(1).max(12).default(6)
});

export const generateWeakPointDrillsRequestSchema = z.object({
  pointCount: z.number().int().min(1).max(6).default(3),
  questionsPerPoint: z.number().int().min(1).max(12).default(4)
});

export const generateSubjectPracticeRequestSchema = z.object({
  subject: subjectSchema,
  count: z.number().int().min(4).max(30).default(12)
});

export const generateDailyPlanRequestSchema = z.object({
  availableMinutes: z.number().int().min(20).max(720).default(180)
});

export const upsertKnowledgePointRequestSchema = z.object({
  id: z.string().min(1).optional(),
  subject: subjectSchema,
  chapter: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).nullable().optional(),
  examWeight: z.number().int().min(1).max(5)
});

export const updateMasteryRequestSchema = z.object({
  knowledgePointId: z.string().min(1),
  level: masteryLevelSchema,
  score: z.number().int().min(0).max(100),
  attempts: z.number().int().min(0),
  correctAttempts: z.number().int().min(0)
});

export const updateQuestionRequestSchema = z.object({
  questionId: z.string().min(1),
  subject: subjectSchema,
  knowledgePointIds: z.array(z.string().min(1)).min(1),
  type: questionTypeSchema,
  difficulty: z.number().int().min(1).max(5),
  stem: z.string().min(1),
  answer: z.string().min(1),
  analysis: z.string().min(1)
});

export const createExamRecordRequestSchema = z.object({
  title: z.string().min(1),
  takenAt: z.string().datetime().optional(),
  scores: z.record(subjectSchema, z.number().min(0).max(150)),
  summary: z.string().min(1).optional()
});

export const completeStudyTaskRequestSchema = z.object({
  taskId: z.string().min(1)
});

export const updateMistakeReviewRequestSchema = z.object({
  mistakeId: z.string().min(1),
  reviewStage: z.number().int().min(0).max(3)
});

export const generatedQuestionSetSchema = z.object({
  source: questionSourceSchema,
  questions: z.array(questionSchema).min(1)
});

export const weakPointDrillsResponseSchema = z.object({
  imports: z.array(generatedQuestionSetSchema),
  selectedKnowledgePointIds: z.array(z.string().min(1))
});

export const importWebPagesResponseSchema = z.object({
  imports: z.array(generatedQuestionSetSchema),
  failed: z.array(z.object({
    url: z.string().url(),
    message: z.string().min(1)
  }))
});

export const uploadedQuestionAssetSchema = z.object({
  source: questionSourceSchema,
  asset: questionAssetSchema,
  questions: z.array(questionSchema)
});

export const aiLearningContextResponseSchema = z.object({
  studentEmail: z.string().email(),
  overview: learningOverviewSchema
});

export const aiLearningIngestRequestSchema = z.object({
  mistakes: z.array(analyzeMistakeRequestSchema).default([]),
  questionSources: z.array(importQuestionSourceRequestSchema).default([]),
  mastery: z.array(updateMasteryRequestSchema).default([]),
  exams: z.array(createExamRecordRequestSchema).default([])
});

export const aiLearningIngestResponseSchema = z.object({
  mistakes: z.array(analyzeMistakeResponseSchema),
  questionSources: z.array(generatedQuestionSetSchema),
  mastery: z.array(masteryRecordSchema),
  exams: z.array(examRecordSchema),
  overview: learningOverviewSchema
});

export type Subject = z.infer<typeof subjectSchema>;
export type MasteryLevel = z.infer<typeof masteryLevelSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type MistakeCause = z.infer<typeof mistakeCauseSchema>;
export type QuestionSourceType = z.infer<typeof questionSourceTypeSchema>;
export type KnowledgePoint = z.infer<typeof knowledgePointSchema>;
export type MasteryRecord = z.infer<typeof masteryRecordSchema>;
export type QuestionSource = z.infer<typeof questionSourceSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Mistake = z.infer<typeof mistakeSchema>;
export type StudyTask = z.infer<typeof studyTaskSchema>;
export type ExamRecord = z.infer<typeof examRecordSchema>;
export type WeeklyReport = z.infer<typeof weeklyReportSchema>;
export type LearningOverviewResponse = z.infer<typeof learningOverviewSchema>;
export type AnalyzeMistakeRequest = z.infer<typeof analyzeMistakeRequestSchema>;
export type AnalyzeMistakeResponse = z.infer<typeof analyzeMistakeResponseSchema>;
export type ImportQuestionSourceRequest = z.infer<typeof importQuestionSourceRequestSchema>;
export type ImportWebPageRequest = z.infer<typeof importWebPageRequestSchema>;
export type ImportWebPagesRequest = z.infer<typeof importWebPagesRequestSchema>;
export type QuestionSourceCatalogItem = z.infer<typeof questionSourceCatalogItemSchema>;
export type QuestionSourceCatalogResponse = z.infer<typeof questionSourceCatalogResponseSchema>;
export type ImportQuestionSourceCatalogRequest = z.infer<typeof importQuestionSourceCatalogRequestSchema>;
export type UploadQuestionAssetRequest = z.infer<typeof uploadQuestionAssetRequestSchema>;
export type QuestionAsset = z.infer<typeof questionAssetSchema>;
export type GenerateSimilarQuestionsRequest = z.infer<typeof generateSimilarQuestionsRequestSchema>;
export type GenerateKnowledgePointDrillRequest = z.infer<typeof generateKnowledgePointDrillRequestSchema>;
export type GenerateWeakPointDrillsRequest = z.infer<typeof generateWeakPointDrillsRequestSchema>;
export type GenerateSubjectPracticeRequest = z.infer<typeof generateSubjectPracticeRequestSchema>;
export type GenerateDailyPlanRequest = z.infer<typeof generateDailyPlanRequestSchema>;
export type UpsertKnowledgePointRequest = z.infer<typeof upsertKnowledgePointRequestSchema>;
export type UpdateMasteryRequest = z.infer<typeof updateMasteryRequestSchema>;
export type UpdateQuestionRequest = z.infer<typeof updateQuestionRequestSchema>;
export type CreateExamRecordRequest = z.infer<typeof createExamRecordRequestSchema>;
export type CompleteStudyTaskRequest = z.infer<typeof completeStudyTaskRequestSchema>;
export type UpdateMistakeReviewRequest = z.infer<typeof updateMistakeReviewRequestSchema>;
export type GeneratedQuestionSet = z.infer<typeof generatedQuestionSetSchema>;
export type WeakPointDrillsResponse = z.infer<typeof weakPointDrillsResponseSchema>;
export type ImportWebPagesResponse = z.infer<typeof importWebPagesResponseSchema>;
export type UploadedQuestionAsset = z.infer<typeof uploadedQuestionAssetSchema>;
export type AiLearningContextResponse = z.infer<typeof aiLearningContextResponseSchema>;
export type AiLearningIngestRequest = z.infer<typeof aiLearningIngestRequestSchema>;
export type AiLearningIngestResponse = z.infer<typeof aiLearningIngestResponseSchema>;
