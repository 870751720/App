import { z } from "zod";
import { questionSchema, type GeneratedQuestionSet, type Question, type QuestionSource } from "@app/schemas";

const questionGenerationResponseSchema = z.object({
  questions: z.array(questionSchema).min(1)
});

export interface QuestionGenerationInput {
  baseQuestion: Question;
  source: QuestionSource;
  count: number;
}

export interface QuestionGenerationAdapter {
  generateSimilarQuestions(input: QuestionGenerationInput): Promise<GeneratedQuestionSet>;
}

export interface HttpQuestionGenerationAdapterOptions {
  endpoint: string;
  apiKey?: string;
  fetcher?: typeof fetch;
}

export function createHttpQuestionGenerationAdapter(options: HttpQuestionGenerationAdapterOptions): QuestionGenerationAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    async generateSimilarQuestions(input) {
      const response = await fetcher(options.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {})
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Question generation request failed with status ${response.status}`);
      }

      const payload = questionGenerationResponseSchema.parse(await response.json());
      return {
        source: input.source,
        questions: payload.questions.map((question, index) => ({
          ...question,
          id: question.id || `${input.baseQuestion.id}-ai-${index + 1}`,
          sourceId: input.source.id,
          subject: input.baseQuestion.subject,
          knowledgePointIds: question.knowledgePointIds.length > 0 ? question.knowledgePointIds : input.baseQuestion.knowledgePointIds,
          createdAt: input.source.importedAt
        }))
      };
    }
  };
}
