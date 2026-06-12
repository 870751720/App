import {
  authSessionSchema,
  analyzeMistakeResponseSchema,
  examRecordSchema,
  generatedQuestionSetSchema,
  importWebPagesResponseSchema,
  knowledgePointSchema,
  learningOverviewSchema,
  healthStatusSchema,
  masteryRecordSchema,
  operationsOverviewSchema,
  questionSchema,
  questionSourceCatalogResponseSchema,
  studyTaskSchema,
  uploadedQuestionAssetSchema,
  userAccountSchema,
  weakPointDrillsResponseSchema,
  weeklyReportSchema,
  type AnalyzeMistakeRequest,
  type AnalyzeMistakeResponse,
  type AuthSessionResponse,
  type CompleteStudyTaskRequest,
  type CreateExamRecordRequest,
  type ExamRecord,
  type GeneratedQuestionSet,
  type GenerateDailyPlanRequest,
  type GenerateKnowledgePointDrillRequest,
  type GenerateSimilarQuestionsRequest,
  type GenerateSubjectPracticeRequest,
  type GenerateWeakPointDrillsRequest,
  type HealthStatus,
  type ImportWebPageRequest,
  type ImportWebPagesRequest,
  type ImportWebPagesResponse,
  type ImportQuestionSourceRequest,
  type ImportQuestionSourceCatalogRequest,
  type KnowledgePoint,
  type LearningOverviewResponse,
  type MasteryRecord,
  type OperationsOverviewResponse,
  type Question,
  type QuestionSourceCatalogResponse,
  type StudyTask,
  type UpdateMasteryRequest,
  type UpdateMistakeReviewRequest,
  type UpdateQuestionRequest,
  type UpsertKnowledgePointRequest,
  type UploadedQuestionAsset,
  type UploadQuestionAssetRequest,
  type UserAccountResponse,
  type WeakPointDrillsResponse
} from "@app/schemas";

export interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export function createApiClient({ baseUrl, fetcher = fetch }: ApiClientOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async getHealth(): Promise<HealthStatus> {
      const response = await fetcher(`${normalizedBaseUrl}/health`);

      if (!response.ok) {
        throw new Error(`Health request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return healthStatusSchema.parse(payload);
    },

    async login(email: string, password: string): Promise<AuthSessionResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`Login request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return authSessionSchema.parse(payload);
    },

    async getCurrentUser(token: string): Promise<UserAccountResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/auth/me`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Current user request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return userAccountSchema.parse(payload);
    },

    async getOperationsOverview(token: string): Promise<OperationsOverviewResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/operations/overview`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Operations overview request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return operationsOverviewSchema.parse(payload);
    },

    async getLearningOverview(token: string): Promise<LearningOverviewResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/overview`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Learning overview request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return learningOverviewSchema.parse(payload);
    },

    async analyzeMistake(token: string, input: AnalyzeMistakeRequest): Promise<AnalyzeMistakeResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/ai/analyze-mistake`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Mistake diagnosis request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return analyzeMistakeResponseSchema.parse(payload);
    },

    async importQuestionSource(token: string, input: ImportQuestionSourceRequest): Promise<GeneratedQuestionSet> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/question-sources/import`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Question source import failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return generatedQuestionSetSchema.parse(payload);
    },

    async importWebPage(token: string, input: ImportWebPageRequest): Promise<GeneratedQuestionSet> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/question-sources/import-web`, token, input, "Web import failed");
      return generatedQuestionSetSchema.parse(payload);
    },

    async importWebPages(token: string, input: ImportWebPagesRequest): Promise<ImportWebPagesResponse> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/question-sources/import-web-batch`, token, input, "Web batch import failed");
      return importWebPagesResponseSchema.parse(payload);
    },

    async getQuestionSourceCatalog(token: string): Promise<QuestionSourceCatalogResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/question-source-catalog`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Question source catalog request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return questionSourceCatalogResponseSchema.parse(payload);
    },

    async importQuestionSourceCatalog(token: string, input: ImportQuestionSourceCatalogRequest): Promise<ImportWebPagesResponse> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/question-source-catalog/import`, token, input, "Catalog import failed");
      return importWebPagesResponseSchema.parse(payload);
    },

    async uploadQuestionAsset(token: string, input: UploadQuestionAssetRequest): Promise<UploadedQuestionAsset> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/question-sources/upload`, token, input, "Question asset upload failed");
      return uploadedQuestionAssetSchema.parse(payload);
    },

    async generateSimilarQuestions(token: string, input: GenerateSimilarQuestionsRequest): Promise<GeneratedQuestionSet> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/ai/generate-similar-questions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Similar question generation failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return generatedQuestionSetSchema.parse(payload);
    },

    async generateKnowledgePointDrill(token: string, input: GenerateKnowledgePointDrillRequest): Promise<GeneratedQuestionSet> {
      const payload = await postJson(
        fetcher,
        `${normalizedBaseUrl}/learning/ai/generate-knowledge-point-drill`,
        token,
        input,
        "Knowledge point drill generation failed"
      );
      return generatedQuestionSetSchema.parse(payload);
    },

    async generateWeakPointDrills(token: string, input: GenerateWeakPointDrillsRequest): Promise<WeakPointDrillsResponse> {
      const payload = await postJson(
        fetcher,
        `${normalizedBaseUrl}/learning/ai/generate-weak-point-drills`,
        token,
        input,
        "Weak point drill generation failed"
      );
      return weakPointDrillsResponseSchema.parse(payload);
    },

    async generateSubjectPractice(token: string, input: GenerateSubjectPracticeRequest): Promise<GeneratedQuestionSet> {
      const payload = await postJson(
        fetcher,
        `${normalizedBaseUrl}/learning/ai/generate-subject-practice`,
        token,
        input,
        "Subject practice generation failed"
      );
      return generatedQuestionSetSchema.parse(payload);
    },

    async generateDailyPlan(token: string, input: GenerateDailyPlanRequest): Promise<StudyTask[]> {
      const response = await fetcher(`${normalizedBaseUrl}/learning/ai/generate-daily-plan`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Daily plan generation failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return studyTaskSchema.array().parse(payload);
    },

    async getWeeklyReport(token: string) {
      const response = await fetcher(`${normalizedBaseUrl}/learning/weekly-report`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Weekly report request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return weeklyReportSchema.parse(payload);
    },

    async upsertKnowledgePoint(token: string, input: UpsertKnowledgePointRequest): Promise<KnowledgePoint> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/knowledge-points`, token, input, "Knowledge point save failed");
      return knowledgePointSchema.parse(payload);
    },

    async updateMastery(token: string, input: UpdateMasteryRequest): Promise<MasteryRecord> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/mastery`, token, input, "Mastery update failed");
      return masteryRecordSchema.parse(payload);
    },

    async updateQuestion(token: string, input: UpdateQuestionRequest): Promise<Question> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/questions/review`, token, input, "Question review failed");
      return questionSchema.parse(payload);
    },

    async createExamRecord(token: string, input: CreateExamRecordRequest): Promise<ExamRecord> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/exams`, token, input, "Exam save failed");
      return examRecordSchema.parse(payload);
    },

    async completeStudyTask(token: string, input: CompleteStudyTaskRequest): Promise<StudyTask> {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/tasks/complete`, token, input, "Task completion failed");
      return studyTaskSchema.parse(payload);
    },

    async updateMistakeReview(token: string, input: UpdateMistakeReviewRequest) {
      const payload = await postJson(fetcher, `${normalizedBaseUrl}/learning/mistakes/review`, token, input, "Mistake review update failed");
      return payload;
    }
  };
}

async function postJson(fetcher: typeof fetch, url: string, token: string, input: unknown, errorMessage: string) {
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(`${errorMessage} with status ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}
