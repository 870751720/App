import type { PrismaClient } from "@prisma/client";
import {
  AssetProcessStatus,
  LicenseScope,
  MasteryLevel,
  QuestionSourceType,
  QuestionType,
  StudySubject,
  TaskStatus,
  UserRole
} from "@prisma/client";
import {
  buildDailyPlan,
  buildWeeklyReport,
  createInitialLearningOverview,
  createSupplementalQuestionBank,
  diagnoseMistake,
  generateKnowledgePointDrill,
  generateSimilarQuestions,
  getQuestionSourceCatalog,
  getQuestionSourceCatalogItem,
  parseImportedQuestions
} from "@app/domain";
import {
  analyzeMistakeRequestSchema,
  generateDailyPlanRequestSchema,
  generateKnowledgePointDrillRequestSchema,
  generateSimilarQuestionsRequestSchema,
  importQuestionSourceCatalogRequestSchema,
  importQuestionSourceRequestSchema,
  learningOverviewSchema,
  updateMasteryRequestSchema,
  updateMistakeReviewRequestSchema,
  updateQuestionRequestSchema,
  upsertKnowledgePointRequestSchema,
  createExamRecordRequestSchema,
  type AnalyzeMistakeRequest,
  type AnalyzeMistakeResponse,
  type CreateExamRecordRequest,
  type ExamRecord,
  type GeneratedQuestionSet,
  type GenerateKnowledgePointDrillRequest,
  type ImportWebPageRequest,
  type ImportWebPagesRequest,
  type ImportWebPagesResponse,
  type ImportQuestionSourceCatalogRequest,
  type ImportQuestionSourceRequest,
  type KnowledgePoint,
  type LearningOverviewResponse,
  type MasteryLevel as ApiMasteryLevel,
  type MasteryRecord,
  type Mistake,
  type MistakeCause,
  type Question,
  type QuestionAsset,
  type QuestionSourceCatalogItem,
  type QuestionSource,
  type QuestionSourceType as ApiQuestionSourceType,
  type QuestionType as ApiQuestionType,
  type StudyTask,
  type Subject,
  type UpdateMasteryRequest,
  type UpdateMistakeReviewRequest,
  type UpdateQuestionRequest,
  type UpsertKnowledgePointRequest,
  type UploadedQuestionAsset,
  type UploadQuestionAssetRequest,
  type UserAccountResponse,
  type WeeklyReport
} from "@app/schemas";
import type { OcrAdapter } from "./ocrAdapter.js";
import type { QuestionGenerationAdapter } from "./questionGenerationAdapter.js";
import type { MistakeDiagnosisAdapter } from "./mistakeDiagnosisAdapter.js";
import { extractUploadText, fetchReadableWebText } from "./questionIngestion.js";

export interface LearningRepository {
  getOverview(user: UserAccountResponse): Promise<LearningOverviewResponse>;
  getQuestionSourceCatalog(): Promise<QuestionSourceCatalogItem[]>;
  analyzeMistake(user: UserAccountResponse, input: AnalyzeMistakeRequest): Promise<AnalyzeMistakeResponse>;
  importQuestionSource(user: UserAccountResponse, input: ImportQuestionSourceRequest): Promise<GeneratedQuestionSet>;
  importWebPage(user: UserAccountResponse, input: ImportWebPageRequest): Promise<GeneratedQuestionSet>;
  importWebPages(user: UserAccountResponse, input: ImportWebPagesRequest): Promise<ImportWebPagesResponse>;
  importQuestionSourceCatalog(user: UserAccountResponse, input: ImportQuestionSourceCatalogRequest): Promise<ImportWebPagesResponse>;
  uploadQuestionAsset(user: UserAccountResponse, input: UploadQuestionAssetRequest): Promise<UploadedQuestionAsset>;
  generateSimilarQuestions(user: UserAccountResponse, questionId: string, count: number): Promise<GeneratedQuestionSet>;
  generateKnowledgePointDrill(user: UserAccountResponse, input: GenerateKnowledgePointDrillRequest): Promise<GeneratedQuestionSet>;
  generateDailyPlan(user: UserAccountResponse, availableMinutes: number): Promise<StudyTask[]>;
  getWeeklyReport(user: UserAccountResponse): Promise<WeeklyReport>;
  upsertKnowledgePoint(user: UserAccountResponse, input: UpsertKnowledgePointRequest): Promise<KnowledgePoint>;
  updateMastery(user: UserAccountResponse, input: UpdateMasteryRequest): Promise<MasteryRecord>;
  updateQuestion(user: UserAccountResponse, input: UpdateQuestionRequest): Promise<Question>;
  createExamRecord(user: UserAccountResponse, input: CreateExamRecordRequest): Promise<ExamRecord>;
  completeStudyTask(user: UserAccountResponse, taskId: string): Promise<StudyTask>;
  updateMistakeReview(user: UserAccountResponse, input: UpdateMistakeReviewRequest): Promise<Mistake>;
}

export interface CreatePrismaLearningRepositoryOptions {
  ocrAdapter?: OcrAdapter;
  questionGenerationAdapter?: QuestionGenerationAdapter;
  mistakeDiagnosisAdapter?: MistakeDiagnosisAdapter;
}

export function createPrismaLearningRepository(prisma: PrismaClient, options: CreatePrismaLearningRepositoryOptions = {}): LearningRepository {
  async function getOverview(user: UserAccountResponse) {
    const dbUser = await ensureLearningProfile(user);
    const profile = await readProfile(dbUser.id);
    return learningOverviewSchema.parse(profile);
  }

  async function readQuestionSourceCatalog() {
    return getQuestionSourceCatalog();
  }

  async function analyzeMistake(user: UserAccountResponse, rawInput: AnalyzeMistakeRequest) {
    const input = analyzeMistakeRequestSchema.parse(rawInput);
    let diagnosis: AnalyzeMistakeResponse;
    try {
      diagnosis = options.mistakeDiagnosisAdapter ? await options.mistakeDiagnosisAdapter.diagnoseMistake(input) : diagnoseMistake(input);
    } catch {
      diagnosis = diagnoseMistake(input);
    }
    const dbUser = await ensureLearningProfile(user);
    const now = new Date();
    const sourceId = createStableId("src-mistake");
    const questionId = createStableId("q-mistake");
    const mistakeId = createStableId("m");

    await prisma.$transaction(async (transaction) => {
      await transaction.questionSource.create({
        data: {
          id: sourceId,
          userId: dbUser.id,
          type: QuestionSourceType.MANUAL,
          title: "手动录入错题",
          provider: "personal",
          licenseScope: LicenseScope.PERSONAL_ONLY,
          importedAt: now,
          note: "由学生提交错题文本后生成。"
        }
      });
      await transaction.question.create({
        data: {
          id: questionId,
          sourceId,
          subject: toDbSubject(input.subject),
          type: QuestionType.CALCULATION,
          difficulty: Math.min(5, Math.max(1, Math.ceil(input.scoreLost / 2))),
          stem: input.questionStem,
          answer: input.standardAnswer,
          analysis: diagnosis.diagnosis,
          createdAt: now
        }
      });
      await transaction.questionKnowledgePoint.createMany({
        data: input.knowledgePointIds.map((knowledgePointId) => ({ questionId, knowledgePointId })),
        skipDuplicates: true
      });
      await transaction.mistake.create({
        data: {
          id: mistakeId,
          userId: dbUser.id,
          questionId,
          subject: toDbSubject(input.subject),
          studentAnswer: input.studentAnswer,
          scoreLost: input.scoreLost,
          causes: diagnosis.causes,
          diagnosis: diagnosis.diagnosis,
          nextRule: diagnosis.nextRule,
          reviewStage: 0,
          createdAt: now
        }
      });
      await transaction.mistakeKnowledgePoint.createMany({
        data: input.knowledgePointIds.map((knowledgePointId) => ({ mistakeId, knowledgePointId })),
        skipDuplicates: true
      });
    });
    await regenerateDailyTasks(dbUser.id, 180);

    return diagnosis;
  }

  async function importQuestionSource(user: UserAccountResponse, rawInput: ImportQuestionSourceRequest) {
    const input = importQuestionSourceRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const importPoint = await resolveImportPoint(input.subject, input.knowledgePointId);

    const now = new Date();
    const sourceId = createStableId("src-import");
    const source: QuestionSource = {
      id: sourceId,
      type: input.type,
      title: input.title,
      provider: input.provider,
      licenseScope: input.type === "ai_generated" ? "ai_generated" : "personal_only",
      importedAt: now.toISOString(),
      note: input.url ? `来自指定网址：${input.url}` : "来自个人上传文本。"
    };
    const questions = parseImportedQuestions({
      rawText: input.rawText,
      source,
      subject: input.subject ?? fromDbSubject(importPoint.subject),
      knowledgePointId: importPoint.id
    });
    if (questions.length === 0) {
      throw new Error("No question text found");
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.questionSource.create({
        data: {
          id: source.id,
          userId: dbUser.id,
          type: toDbQuestionSourceType(source.type),
          title: source.title,
          provider: source.provider,
          licenseScope: source.licenseScope === "ai_generated" ? LicenseScope.AI_GENERATED : LicenseScope.PERSONAL_ONLY,
          importedAt: now,
          note: source.note
        }
      });
      for (const question of questions) {
        await transaction.question.create({
          data: {
            id: question.id,
            sourceId: source.id,
            subject: toDbSubject(question.subject),
            type: toDbQuestionType(question.type),
            difficulty: question.difficulty,
            stem: question.stem,
            answer: question.answer,
            analysis: question.analysis,
            createdAt: now
          }
        });
        await transaction.questionKnowledgePoint.createMany({
          data: question.knowledgePointIds.map((knowledgePointId) => ({
            questionId: question.id,
            knowledgePointId
          })),
          skipDuplicates: true
        });
      }
    });

    return { source, questions };
  }

  async function importWebPage(user: UserAccountResponse, input: ImportWebPageRequest) {
    const rawText = await fetchReadableWebText(input.url);
    return importQuestionSource(user, {
      type: "web_import",
      title: input.title ?? new URL(input.url).hostname,
      provider: input.provider,
      rawText,
      url: input.url,
      subject: input.subject,
      knowledgePointId: input.knowledgePointId
    });
  }

  async function importWebPages(user: UserAccountResponse, input: ImportWebPagesRequest): Promise<ImportWebPagesResponse> {
    const imports: GeneratedQuestionSet[] = [];
    const failed: ImportWebPagesResponse["failed"] = [];

    for (const url of input.urls) {
      try {
        imports.push(await importWebPage(user, {
          url,
          title: new URL(url).hostname,
          provider: input.provider,
          subject: input.subject,
          knowledgePointId: input.knowledgePointId
        }));
      } catch (error) {
        failed.push({
          url,
          message: error instanceof Error ? error.message : "Import failed"
        });
      }
    }

    return { imports, failed };
  }

  async function importCatalogSources(user: UserAccountResponse, rawInput: ImportQuestionSourceCatalogRequest): Promise<ImportWebPagesResponse> {
    const input = importQuestionSourceCatalogRequestSchema.parse(rawInput);
    const imports: GeneratedQuestionSet[] = [];
    const failed: ImportWebPagesResponse["failed"] = [];

    for (const sourceId of input.sourceIds) {
      const catalogItem = getQuestionSourceCatalogItem(sourceId);
      if (!catalogItem) {
        failed.push({
          url: `https://catalog.local/${encodeURIComponent(sourceId)}`,
          message: "Catalog source not found"
        });
        continue;
      }

      try {
        imports.push(await importWebPage(user, {
          url: catalogItem.url,
          title: catalogItem.title,
          provider: catalogItem.provider,
          subject: catalogItem.subject,
          knowledgePointId: catalogItem.knowledgePointId
        }));
      } catch (error) {
        failed.push({
          url: catalogItem.url,
          message: error instanceof Error ? error.message : "Import failed"
        });
      }
    }

    return { imports, failed };
  }

  async function uploadQuestionAsset(user: UserAccountResponse, input: UploadQuestionAssetRequest): Promise<UploadedQuestionAsset> {
    const dbUser = await ensureLearningProfile(user);
    const firstPoint = await prisma.knowledgePoint.findFirst({ orderBy: [{ subject: "asc" }, { chapter: "asc" }, { name: "asc" }] });
    if (!firstPoint) {
      throw new Error("No knowledge point configured");
    }

    const now = new Date();
    const extracted = await extractUploadText(input, options.ocrAdapter);
    const source: QuestionSource = {
      id: createStableId("src-upload"),
      type: input.mimeType === "application/pdf" ? "pdf_import" : "image_ocr",
      title: input.title ?? input.fileName,
      provider: "personal-upload",
      licenseScope: "personal_only",
      importedAt: now.toISOString(),
      note: "来自个人上传文件。"
    };
    const asset: QuestionAsset = {
      id: createStableId("asset"),
      sourceId: source.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      byteSize: extracted.byteSize,
      extractedText: extracted.extractedText,
      status: extracted.status,
      createdAt: now.toISOString()
    };
    const questions = extracted.extractedText
      ? parseImportedQuestions({
          rawText: extracted.extractedText,
          source,
          subject: fromDbSubject(firstPoint.subject),
          knowledgePointId: firstPoint.id
        })
      : [];

    await prisma.$transaction(async (transaction) => {
      await transaction.questionSource.create({
        data: {
          id: source.id,
          userId: dbUser.id,
          type: toDbQuestionSourceType(source.type),
          title: source.title,
          provider: source.provider,
          licenseScope: LicenseScope.PERSONAL_ONLY,
          importedAt: now,
          note: source.note
        }
      });
      await transaction.questionAsset.create({
        data: {
          id: asset.id,
          userId: dbUser.id,
          sourceId: source.id,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          byteSize: asset.byteSize,
          extractedText: asset.extractedText,
          status: toDbAssetStatus(asset.status),
          createdAt: now
        }
      });

      for (const question of questions) {
        await transaction.question.create({
          data: {
            id: question.id,
            sourceId: source.id,
            subject: toDbSubject(question.subject),
            type: toDbQuestionType(question.type),
            difficulty: question.difficulty,
            stem: question.stem,
            answer: question.answer,
            analysis: question.analysis,
            createdAt: now
          }
        });
        await transaction.questionKnowledgePoint.create({
          data: {
            questionId: question.id,
            knowledgePointId: firstPoint.id
          }
        });
      }
    });

    return { source, asset, questions };
  }

  async function createSimilarQuestions(user: UserAccountResponse, questionId: string, count: number) {
    const parsed = generateSimilarQuestionsRequestSchema.parse({ questionId, count });
    const dbUser = await ensureLearningProfile(user);
    const profile = await readProfile(dbUser.id);
    const baseQuestion = profile.questions.find((question) => question.id === parsed.questionId);
    if (!baseQuestion) {
      throw new Error("Question not found");
    }

    const now = new Date();
    const source: QuestionSource = {
      id: createStableId("src-ai"),
      type: "mistake_variant",
      title: "AI 同类题",
      provider: "local-ai-adapter",
      licenseScope: "ai_generated",
      importedAt: now.toISOString(),
      note: "基于个人错题生成，仅用于个人训练。"
    };
    let generated: GeneratedQuestionSet;
    try {
      generated = options.questionGenerationAdapter
        ? await options.questionGenerationAdapter.generateSimilarQuestions({ baseQuestion, source, count: parsed.count })
        : generateSimilarQuestions(baseQuestion, source, parsed.count);
    } catch {
      generated = generateSimilarQuestions(baseQuestion, source, parsed.count);
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.questionSource.create({
        data: {
          id: source.id,
          userId: dbUser.id,
          type: QuestionSourceType.MISTAKE_VARIANT,
          title: source.title,
          provider: source.provider,
          licenseScope: LicenseScope.AI_GENERATED,
          importedAt: now,
          note: source.note
        }
      });

      for (const question of generated.questions) {
        await transaction.question.create({
          data: {
            id: question.id,
            sourceId: source.id,
            subject: toDbSubject(question.subject),
            type: toDbQuestionType(question.type),
            difficulty: question.difficulty,
            stem: question.stem,
            answer: question.answer,
            analysis: question.analysis,
            createdAt: now
          }
        });
        await transaction.questionKnowledgePoint.createMany({
          data: question.knowledgePointIds.map((knowledgePointId) => ({
            questionId: question.id,
            knowledgePointId
          })),
          skipDuplicates: true
        });
      }
    });

    return generated;
  }

  async function createKnowledgePointDrill(user: UserAccountResponse, rawInput: GenerateKnowledgePointDrillRequest) {
    const input = generateKnowledgePointDrillRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const profile = await readProfile(dbUser.id);
    const point = profile.knowledgePoints.find((candidate) => candidate.id === input.knowledgePointId);
    if (!point) {
      throw new Error("Knowledge point not found");
    }

    const now = new Date();
    const source: QuestionSource = {
      id: createStableId("src-ai-kp"),
      type: "ai_generated",
      title: `${getSubjectTitle(point.subject)}知识点训练题`,
      provider: "local-ai-adapter",
      licenseScope: "ai_generated",
      importedAt: now.toISOString(),
      note: `围绕“${point.name}”生成的个人训练题，进入正式训练前需要人工校对。`
    };
    const generated = generateKnowledgePointDrill(point, source, input.count);

    await prisma.$transaction(async (transaction) => {
      await transaction.questionSource.create({
        data: {
          id: source.id,
          userId: dbUser.id,
          type: QuestionSourceType.AI_GENERATED,
          title: source.title,
          provider: source.provider,
          licenseScope: LicenseScope.AI_GENERATED,
          importedAt: now,
          note: source.note
        }
      });

      for (const question of generated.questions) {
        await transaction.question.create({
          data: {
            id: question.id,
            sourceId: source.id,
            subject: toDbSubject(question.subject),
            type: toDbQuestionType(question.type),
            difficulty: question.difficulty,
            stem: question.stem,
            answer: question.answer,
            analysis: question.analysis,
            createdAt: now
          }
        });
        await transaction.questionKnowledgePoint.createMany({
          data: question.knowledgePointIds.map((knowledgePointId) => ({
            questionId: question.id,
            knowledgePointId
          })),
          skipDuplicates: true
        });
      }
    });

    return generated;
  }

  async function generateDailyPlan(user: UserAccountResponse, availableMinutes: number) {
    const input = generateDailyPlanRequestSchema.parse({ availableMinutes });
    const dbUser = await ensureLearningProfile(user);
    return regenerateDailyTasks(dbUser.id, input.availableMinutes);
  }

  async function getWeeklyReport(user: UserAccountResponse) {
    const dbUser = await ensureLearningProfile(user);
    return (await readProfile(dbUser.id)).weeklyReport;
  }

  async function upsertKnowledgePoint(user: UserAccountResponse, rawInput: UpsertKnowledgePointRequest) {
    const input = upsertKnowledgePointRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const id = input.id ?? createKnowledgePointId(input.subject, input.chapter, input.name);
    const saved = await prisma.knowledgePoint.upsert({
      where: { id },
      create: {
        id,
        subject: toDbSubject(input.subject),
        chapter: input.chapter,
        name: input.name,
        parentId: input.parentId ?? null,
        examWeight: input.examWeight
      },
      update: {
        subject: toDbSubject(input.subject),
        chapter: input.chapter,
        name: input.name,
        parentId: input.parentId ?? null,
        examWeight: input.examWeight
      }
    });

    await prisma.masteryRecord.upsert({
      where: {
        userId_knowledgePointId: {
          userId: dbUser.id,
          knowledgePointId: saved.id
        }
      },
      create: {
        userId: dbUser.id,
        knowledgePointId: saved.id,
        level: MasteryLevel.UNSTARTED,
        score: 0,
        attempts: 0,
        correctAttempts: 0,
        lastPracticedAt: null
      },
      update: {}
    });

    return toApiKnowledgePoint(saved);
  }

  async function updateMastery(user: UserAccountResponse, rawInput: UpdateMasteryRequest) {
    const input = updateMasteryRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const saved = await prisma.masteryRecord.upsert({
      where: {
        userId_knowledgePointId: {
          userId: dbUser.id,
          knowledgePointId: input.knowledgePointId
        }
      },
      create: {
        userId: dbUser.id,
        knowledgePointId: input.knowledgePointId,
        level: toDbMasteryLevel(input.level),
        score: input.score,
        attempts: input.attempts,
        correctAttempts: input.correctAttempts,
        lastPracticedAt: new Date()
      },
      update: {
        level: toDbMasteryLevel(input.level),
        score: input.score,
        attempts: input.attempts,
        correctAttempts: input.correctAttempts,
        lastPracticedAt: new Date()
      }
    });
    await regenerateDailyTasks(dbUser.id, 180);
    return toApiMasteryRecord(saved);
  }

  async function updateQuestion(user: UserAccountResponse, rawInput: UpdateQuestionRequest) {
    const input = updateQuestionRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const question = await prisma.question.findFirst({
      where: {
        id: input.questionId,
        source: { userId: dbUser.id }
      }
    });
    if (!question) {
      throw new Error("Question not found");
    }

    const saved = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.question.update({
        where: { id: input.questionId },
        data: {
          subject: toDbSubject(input.subject),
          type: toDbQuestionType(input.type),
          difficulty: input.difficulty,
          stem: input.stem,
          answer: input.answer,
          analysis: input.analysis
        }
      });
      await transaction.questionKnowledgePoint.deleteMany({ where: { questionId: input.questionId } });
      await transaction.questionKnowledgePoint.createMany({
        data: input.knowledgePointIds.map((knowledgePointId) => ({
          questionId: input.questionId,
          knowledgePointId
        })),
        skipDuplicates: true
      });

      return transaction.question.findUniqueOrThrow({
        where: { id: updated.id },
        include: { points: true }
      });
    });

    return toApiQuestion(saved);
  }

  async function createExamRecord(user: UserAccountResponse, rawInput: CreateExamRecordRequest) {
    const input = createExamRecordRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const total = Object.values(input.scores).reduce((sum, score) => sum + score, 0);
    const saved = await prisma.examRecord.create({
      data: {
        id: createStableId("exam"),
        userId: dbUser.id,
        title: input.title,
        takenAt: input.takenAt ? new Date(input.takenAt) : new Date(),
        scores: input.scores,
        total,
        summary: input.summary ?? createExamSummary(input.scores, total)
      }
    });

    return {
      id: saved.id,
      title: saved.title,
      takenAt: saved.takenAt.toISOString(),
      scores: saved.scores as Record<Subject, number>,
      total: saved.total,
      summary: saved.summary
    };
  }

  async function completeStudyTask(user: UserAccountResponse, taskId: string) {
    const dbUser = await ensureLearningProfile(user);
    const existing = await prisma.studyTask.findFirst({ where: { id: taskId, userId: dbUser.id } });
    if (!existing) {
      throw new Error("Task not found");
    }

    const task = await prisma.studyTask.update({
      where: { id: existing.id },
      data: { status: TaskStatus.DONE }
    });

    return toApiStudyTask(task);
  }

  async function updateMistakeReview(user: UserAccountResponse, rawInput: UpdateMistakeReviewRequest) {
    const input = updateMistakeReviewRequestSchema.parse(rawInput);
    const dbUser = await ensureLearningProfile(user);
    const existing = await prisma.mistake.findFirst({ where: { id: input.mistakeId, userId: dbUser.id } });
    if (!existing) {
      throw new Error("Mistake not found");
    }

    const saved = await prisma.mistake.update({
      where: { id: existing.id },
      data: { reviewStage: input.reviewStage },
      include: { points: true }
    });

    return toApiMistake(saved);
  }

  async function ensureLearningProfile(user: UserAccountResponse) {
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        role: toDbUserRole(user.role)
      },
      update: {
        name: user.name,
        role: toDbUserRole(user.role)
      }
    });
    const initial = createInitialLearningOverview();

    await seedKnowledgePoints(initial.knowledgePoints);

    await seedMissingMasteryRecords(dbUser.id, initial.mastery);

    const sourceCount = await prisma.questionSource.count({ where: { userId: dbUser.id } });
    if (sourceCount === 0) {
      await seedQuestionsAndMistakes(dbUser.id, initial);
    }
    await seedSupplementalQuestions(dbUser.id);

    const examCount = await prisma.examRecord.count({ where: { userId: dbUser.id } });
    if (examCount === 0) {
      await prisma.examRecord.createMany({
        data: initial.exams.map((exam) => ({
          id: exam.id,
          userId: dbUser.id,
          title: exam.title,
          takenAt: new Date(exam.takenAt),
          scores: exam.scores,
          total: exam.total,
          summary: exam.summary
        })),
        skipDuplicates: true
      });
    }

    const taskCount = await prisma.studyTask.count({ where: { userId: dbUser.id } });
    if (taskCount === 0) {
      await writeDailyTasks(dbUser.id, initial.dailyTasks);
    }

    return dbUser;
  }

  async function seedKnowledgePoints(points: KnowledgePoint[]) {
    for (const point of points) {
      await prisma.knowledgePoint.upsert({
        where: { id: point.id },
        create: {
          id: point.id,
          subject: toDbSubject(point.subject),
          chapter: point.chapter,
          name: point.name,
          parentId: point.parentId,
          examWeight: point.examWeight
        },
        update: {
          subject: toDbSubject(point.subject),
          chapter: point.chapter,
          name: point.name,
          parentId: point.parentId,
          examWeight: point.examWeight
        }
      });
    }
  }

  async function seedMissingMasteryRecords(userId: number, records: MasteryRecord[]) {
    for (const record of records) {
      await prisma.masteryRecord.upsert({
        where: {
          userId_knowledgePointId: {
            userId,
            knowledgePointId: record.knowledgePointId
          }
        },
        create: {
          userId,
          knowledgePointId: record.knowledgePointId,
          level: toDbMasteryLevel(record.level),
          score: record.score,
          attempts: record.attempts,
          correctAttempts: record.correctAttempts,
          lastPracticedAt: record.lastPracticedAt ? new Date(record.lastPracticedAt) : null
        },
        update: {}
      });
    }
  }

  async function seedQuestionsAndMistakes(userId: number, initial: LearningOverviewResponse) {
    await prisma.$transaction(async (transaction) => {
      for (const source of initial.questionSources) {
        await transaction.questionSource.create({
          data: {
            id: `${source.id}-${userId}`,
            userId,
            type: toDbQuestionSourceType(source.type),
            title: source.title,
            provider: source.provider,
            licenseScope: toDbLicenseScope(source.licenseScope),
            importedAt: new Date(source.importedAt),
            note: source.note
          }
        });
      }

      for (const question of initial.questions) {
        const sourceId = `${question.sourceId}-${userId}`;
        await transaction.question.create({
          data: {
            id: `${question.id}-${userId}`,
            sourceId,
            subject: toDbSubject(question.subject),
            type: toDbQuestionType(question.type),
            difficulty: question.difficulty,
            stem: question.stem,
            answer: question.answer,
            analysis: question.analysis,
            createdAt: new Date(question.createdAt)
          }
        });
        await transaction.questionKnowledgePoint.createMany({
          data: question.knowledgePointIds.map((knowledgePointId) => ({
            questionId: `${question.id}-${userId}`,
            knowledgePointId
          })),
          skipDuplicates: true
        });
      }

      for (const mistake of initial.mistakes) {
        const mistakeId = `${mistake.id}-${userId}`;
        await transaction.mistake.create({
          data: {
            id: mistakeId,
            userId,
            questionId: `${mistake.questionId}-${userId}`,
            subject: toDbSubject(mistake.subject),
            studentAnswer: mistake.studentAnswer,
            scoreLost: mistake.scoreLost,
            causes: mistake.causes,
            diagnosis: mistake.diagnosis,
            nextRule: mistake.nextRule,
            reviewStage: mistake.reviewStage,
            createdAt: new Date(mistake.createdAt)
          }
        });
        await transaction.mistakeKnowledgePoint.createMany({
          data: mistake.knowledgePointIds.map((knowledgePointId) => ({
            mistakeId,
            knowledgePointId
          })),
          skipDuplicates: true
        });
      }
    });
  }

  async function seedSupplementalQuestions(userId: number) {
    const sets = createSupplementalQuestionBank();

    await prisma.$transaction(async (transaction) => {
      for (const set of sets) {
        const sourceId = `${set.source.id}-${userId}`;
        const existingSource = await transaction.questionSource.findUnique({ where: { id: sourceId } });
        if (existingSource) {
          continue;
        }

        await transaction.questionSource.create({
          data: {
            id: sourceId,
            userId,
            type: toDbQuestionSourceType(set.source.type),
            title: set.source.title,
            provider: set.source.provider,
            licenseScope: toDbLicenseScope(set.source.licenseScope),
            importedAt: new Date(set.source.importedAt),
            note: set.source.note
          }
        });

        for (const question of set.questions) {
          const questionId = `${question.id}-${userId}`;
          await transaction.question.create({
            data: {
              id: questionId,
              sourceId,
              subject: toDbSubject(question.subject),
              type: toDbQuestionType(question.type),
              difficulty: question.difficulty,
              stem: question.stem,
              answer: question.answer,
              analysis: question.analysis,
              createdAt: new Date(question.createdAt)
            }
          });
          await transaction.questionKnowledgePoint.createMany({
            data: question.knowledgePointIds.map((knowledgePointId) => ({
              questionId,
              knowledgePointId
            })),
            skipDuplicates: true
          });
        }
      }
    });
  }

  async function resolveImportPoint(subject?: Subject, knowledgePointId?: string) {
    if (knowledgePointId) {
      const point = await prisma.knowledgePoint.findUnique({ where: { id: knowledgePointId } });
      if (point) {
        return point;
      }
    }

    const pointBySubject = subject
      ? await prisma.knowledgePoint.findFirst({
          where: { subject: toDbSubject(subject) },
          orderBy: [{ examWeight: "desc" }, { chapter: "asc" }, { name: "asc" }]
        })
      : null;
    if (pointBySubject) {
      return pointBySubject;
    }

    const fallback = await prisma.knowledgePoint.findFirst({ orderBy: [{ subject: "asc" }, { chapter: "asc" }, { name: "asc" }] });
    if (!fallback) {
      throw new Error("No knowledge point configured");
    }

    return fallback;
  }

  async function readProfile(userId: number): Promise<LearningOverviewResponse> {
    const [user, knowledgePoints, mastery, sources, questions, assets, mistakes, tasks, exams] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.knowledgePoint.findMany({ orderBy: [{ subject: "asc" }, { chapter: "asc" }, { name: "asc" }] }),
      prisma.masteryRecord.findMany({ where: { userId }, orderBy: { knowledgePointId: "asc" } }),
      prisma.questionSource.findMany({ where: { userId }, orderBy: { importedAt: "desc" } }),
      prisma.question.findMany({
        where: { source: { userId } },
        include: { points: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.questionAsset.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.mistake.findMany({
        where: { userId },
        include: { points: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.studyTask.findMany({ where: { userId }, orderBy: [{ priority: "desc" }, { id: "asc" }] }),
      prisma.examRecord.findMany({ where: { userId }, orderBy: { takenAt: "desc" } })
    ]);
    const generatedAt = new Date().toISOString();
    const apiKnowledgePoints = knowledgePoints.map(toApiKnowledgePoint);
    const apiMastery = mastery.map(toApiMasteryRecord);
    const apiMistakes = mistakes.map(toApiMistake);

    return {
      generatedAt,
      student: {
        name: user.name,
        province: "四川",
        track: "新高考 3+1+2：语文、数学、英语、物理、化学、地理",
        targetScore: 620,
        daysToExam: getDaysToNextGaokao(new Date())
      },
      subjects: ["chinese", "math", "english", "physics", "chemistry", "geography"],
      knowledgePoints: apiKnowledgePoints,
      mastery: apiMastery,
      questionSources: sources.map(toApiQuestionSource),
      questions: questions.map(toApiQuestion),
      assets: assets.map(toApiQuestionAsset),
      mistakes: apiMistakes,
      dailyTasks: tasks.map(toApiStudyTask),
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        takenAt: exam.takenAt.toISOString(),
        scores: exam.scores as Record<Subject, number>,
        total: exam.total,
        summary: exam.summary
      })),
      weeklyReport: buildWeeklyReport(apiKnowledgePoints, apiMastery, apiMistakes, generatedAt)
    };
  }

  async function regenerateDailyTasks(userId: number, availableMinutes: number) {
    const profile = await readProfile(userId);
    const tasks = buildDailyPlan(profile.knowledgePoints, profile.mastery, profile.mistakes, availableMinutes);
    await writeDailyTasks(userId, tasks);
    return tasks;
  }

  async function writeDailyTasks(userId: number, tasks: StudyTask[]) {
    await prisma.$transaction(async (transaction) => {
      await transaction.studyTask.deleteMany({ where: { userId } });
      if (tasks.length > 0) {
        await transaction.studyTask.createMany({
          data: tasks.map((task) => ({
            id: `${task.id}-${userId}`,
            userId,
            title: task.title,
            subject: toDbSubject(task.subject),
            knowledgePointId: task.knowledgePointId,
            minutes: task.minutes,
            priority: task.priority,
            reason: task.reason,
            status: task.status === "done" ? TaskStatus.DONE : TaskStatus.PENDING
          }))
        });
      }
    });
    return tasks;
  }

  return {
    getOverview,
    getQuestionSourceCatalog: readQuestionSourceCatalog,
    analyzeMistake,
    importQuestionSource,
    importWebPage,
    importWebPages,
    importQuestionSourceCatalog: importCatalogSources,
    uploadQuestionAsset,
    generateSimilarQuestions: createSimilarQuestions,
    generateKnowledgePointDrill: createKnowledgePointDrill,
    generateDailyPlan,
    getWeeklyReport,
    upsertKnowledgePoint,
    updateMastery,
    updateQuestion,
    createExamRecord,
    completeStudyTask,
    updateMistakeReview
  };
}

function toApiKnowledgePoint(point: {
  id: string;
  subject: StudySubject;
  chapter: string;
  name: string;
  parentId: string | null;
  examWeight: number;
}): KnowledgePoint {
  return {
    id: point.id,
    subject: fromDbSubject(point.subject),
    chapter: point.chapter,
    name: point.name,
    parentId: point.parentId,
    examWeight: point.examWeight
  };
}

function toApiMasteryRecord(record: {
  knowledgePointId: string;
  level: MasteryLevel;
  score: number;
  attempts: number;
  correctAttempts: number;
  lastPracticedAt: Date | null;
}): MasteryRecord {
  return {
    knowledgePointId: record.knowledgePointId,
    level: fromDbMasteryLevel(record.level),
    score: record.score,
    attempts: record.attempts,
    correctAttempts: record.correctAttempts,
    lastPracticedAt: record.lastPracticedAt?.toISOString() ?? null
  };
}

function toApiQuestionSource(source: {
  id: string;
  type: QuestionSourceType;
  title: string;
  provider: string;
  licenseScope: LicenseScope;
  importedAt: Date;
  note: string;
}): QuestionSource {
  return {
    id: source.id,
    type: fromDbQuestionSourceType(source.type),
    title: source.title,
    provider: source.provider,
    licenseScope: fromDbLicenseScope(source.licenseScope),
    importedAt: source.importedAt.toISOString(),
    note: source.note
  };
}

function toApiQuestion(question: {
  id: string;
  sourceId: string;
  subject: StudySubject;
  type: QuestionType;
  difficulty: number;
  stem: string;
  answer: string;
  analysis: string;
  createdAt: Date;
  points: Array<{ knowledgePointId: string }>;
}): Question {
  return {
    id: question.id,
    sourceId: question.sourceId,
    subject: fromDbSubject(question.subject),
    knowledgePointIds: question.points.map((point) => point.knowledgePointId),
    type: fromDbQuestionType(question.type),
    difficulty: question.difficulty,
    stem: question.stem,
    answer: question.answer,
    analysis: question.analysis,
    createdAt: question.createdAt.toISOString()
  };
}

function toApiQuestionAsset(asset: {
  id: string;
  sourceId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  extractedText: string;
  status: AssetProcessStatus;
  createdAt: Date;
}): QuestionAsset {
  return {
    id: asset.id,
    sourceId: asset.sourceId,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    extractedText: asset.extractedText,
    status: fromDbAssetStatus(asset.status),
    createdAt: asset.createdAt.toISOString()
  };
}

function toApiMistake(mistake: {
  id: string;
  questionId: string;
  subject: StudySubject;
  studentAnswer: string;
  scoreLost: number;
  causes: unknown;
  diagnosis: string;
  nextRule: string;
  reviewStage: number;
  createdAt: Date;
  points: Array<{ knowledgePointId: string }>;
}): Mistake {
  return {
    id: mistake.id,
    questionId: mistake.questionId,
    subject: fromDbSubject(mistake.subject),
    knowledgePointIds: mistake.points.map((point) => point.knowledgePointId),
    studentAnswer: mistake.studentAnswer,
    scoreLost: mistake.scoreLost,
    causes: Array.isArray(mistake.causes) ? (mistake.causes as MistakeCause[]) : ["method_gap"],
    diagnosis: mistake.diagnosis,
    nextRule: mistake.nextRule,
    reviewStage: mistake.reviewStage,
    createdAt: mistake.createdAt.toISOString()
  };
}

function toApiStudyTask(task: {
  id: string;
  title: string;
  subject: StudySubject;
  knowledgePointId: string;
  minutes: number;
  priority: number;
  reason: string;
  status: TaskStatus;
}): StudyTask {
  return {
    id: task.id,
    title: task.title,
    subject: fromDbSubject(task.subject),
    knowledgePointId: task.knowledgePointId,
    minutes: task.minutes,
    priority: task.priority,
    reason: task.reason,
    status: task.status === TaskStatus.DONE ? "done" : "pending"
  };
}

function toDbSubject(subject: Subject) {
  const map: Record<Subject, StudySubject> = {
    chinese: StudySubject.CHINESE,
    math: StudySubject.MATH,
    english: StudySubject.ENGLISH,
    physics: StudySubject.PHYSICS,
    chemistry: StudySubject.CHEMISTRY,
    geography: StudySubject.GEOGRAPHY
  };
  return map[subject];
}

function fromDbSubject(subject: StudySubject): Subject {
  const map: Record<StudySubject, Subject> = {
    CHINESE: "chinese",
    MATH: "math",
    ENGLISH: "english",
    PHYSICS: "physics",
    CHEMISTRY: "chemistry",
    GEOGRAPHY: "geography"
  };
  return map[subject];
}

function getSubjectTitle(subject: Subject) {
  const map: Record<Subject, string> = {
    chinese: "语文",
    math: "数学",
    english: "英语",
    physics: "物理",
    chemistry: "化学",
    geography: "地理"
  };
  return map[subject];
}

function toDbUserRole(role: UserAccountResponse["role"]) {
  const map: Record<UserAccountResponse["role"], UserRole> = {
    owner: UserRole.OWNER,
    admin: UserRole.ADMIN,
    user: UserRole.USER
  };
  return map[role];
}

function toDbMasteryLevel(level: ApiMasteryLevel) {
  const map: Record<ApiMasteryLevel, MasteryLevel> = {
    unstarted: MasteryLevel.UNSTARTED,
    understood: MasteryLevel.UNDERSTOOD,
    basic: MasteryLevel.BASIC,
    stable: MasteryLevel.STABLE
  };
  return map[level];
}

function fromDbMasteryLevel(level: MasteryLevel): ApiMasteryLevel {
  const map: Record<MasteryLevel, ApiMasteryLevel> = {
    UNSTARTED: "unstarted",
    UNDERSTOOD: "understood",
    BASIC: "basic",
    STABLE: "stable"
  };
  return map[level];
}

function toDbQuestionType(type: ApiQuestionType) {
  const map: Record<ApiQuestionType, QuestionType> = {
    single_choice: QuestionType.SINGLE_CHOICE,
    multiple_choice: QuestionType.MULTIPLE_CHOICE,
    fill_blank: QuestionType.FILL_BLANK,
    calculation: QuestionType.CALCULATION,
    essay: QuestionType.ESSAY,
    experiment: QuestionType.EXPERIMENT
  };
  return map[type];
}

function fromDbQuestionType(type: QuestionType): ApiQuestionType {
  const map: Record<QuestionType, ApiQuestionType> = {
    SINGLE_CHOICE: "single_choice",
    MULTIPLE_CHOICE: "multiple_choice",
    FILL_BLANK: "fill_blank",
    CALCULATION: "calculation",
    ESSAY: "essay",
    EXPERIMENT: "experiment"
  };
  return map[type];
}

function toDbQuestionSourceType(type: ApiQuestionSourceType) {
  const map: Record<ApiQuestionSourceType, QuestionSourceType> = {
    manual: QuestionSourceType.MANUAL,
    image_ocr: QuestionSourceType.IMAGE_OCR,
    pdf_import: QuestionSourceType.PDF_IMPORT,
    web_import: QuestionSourceType.WEB_IMPORT,
    gaokao_paper: QuestionSourceType.GAOKAO_PAPER,
    ai_generated: QuestionSourceType.AI_GENERATED,
    mistake_variant: QuestionSourceType.MISTAKE_VARIANT
  };
  return map[type];
}

function fromDbQuestionSourceType(type: QuestionSourceType): ApiQuestionSourceType {
  const map: Record<QuestionSourceType, ApiQuestionSourceType> = {
    MANUAL: "manual",
    IMAGE_OCR: "image_ocr",
    PDF_IMPORT: "pdf_import",
    WEB_IMPORT: "web_import",
    GAOKAO_PAPER: "gaokao_paper",
    AI_GENERATED: "ai_generated",
    MISTAKE_VARIANT: "mistake_variant"
  };
  return map[type];
}

function toDbLicenseScope(scope: QuestionSource["licenseScope"]) {
  const map: Record<QuestionSource["licenseScope"], LicenseScope> = {
    personal_only: LicenseScope.PERSONAL_ONLY,
    authorized: LicenseScope.AUTHORIZED,
    public_reference: LicenseScope.PUBLIC_REFERENCE,
    ai_generated: LicenseScope.AI_GENERATED
  };
  return map[scope];
}

function fromDbLicenseScope(scope: LicenseScope): QuestionSource["licenseScope"] {
  const map: Record<LicenseScope, QuestionSource["licenseScope"]> = {
    PERSONAL_ONLY: "personal_only",
    AUTHORIZED: "authorized",
    PUBLIC_REFERENCE: "public_reference",
    AI_GENERATED: "ai_generated"
  };
  return map[scope];
}

function toDbAssetStatus(status: QuestionAsset["status"]) {
  const map: Record<QuestionAsset["status"], AssetProcessStatus> = {
    pending_review: AssetProcessStatus.PENDING_REVIEW,
    ocr_text_provided: AssetProcessStatus.OCR_TEXT_PROVIDED,
    text_extracted: AssetProcessStatus.TEXT_EXTRACTED,
    ai_ocr_extracted: AssetProcessStatus.AI_OCR_EXTRACTED,
    needs_manual_text: AssetProcessStatus.NEEDS_MANUAL_TEXT
  };
  return map[status];
}

function fromDbAssetStatus(status: AssetProcessStatus): QuestionAsset["status"] {
  const map: Record<AssetProcessStatus, QuestionAsset["status"]> = {
    PENDING_REVIEW: "pending_review",
    OCR_TEXT_PROVIDED: "ocr_text_provided",
    TEXT_EXTRACTED: "text_extracted",
    AI_OCR_EXTRACTED: "ai_ocr_extracted",
    NEEDS_MANUAL_TEXT: "needs_manual_text"
  };
  return map[status];
}

function createStableId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createKnowledgePointId(subject: Subject, chapter: string, name: string) {
  return `kp-${subject}-${slugify(chapter)}-${slugify(name)}`.slice(0, 120);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "point";
}

function createExamSummary(scores: Record<Subject, number>, total: number) {
  const weakest = Object.entries(scores).sort(([, left], [, right]) => left - right)[0];
  return weakest ? `总分 ${total}，优先复盘 ${weakest[0]}。` : `总分 ${total}。`;
}

function getDaysToNextGaokao(now: Date) {
  const year = now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 7) ? now.getFullYear() + 1 : now.getFullYear();
  const examDate = new Date(year, 5, 7);
  return Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / 86_400_000));
}
