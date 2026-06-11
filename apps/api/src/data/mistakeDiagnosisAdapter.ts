import { analyzeMistakeResponseSchema, type AnalyzeMistakeRequest, type AnalyzeMistakeResponse } from "@app/schemas";

export interface MistakeDiagnosisAdapter {
  diagnoseMistake(input: AnalyzeMistakeRequest): Promise<AnalyzeMistakeResponse>;
}

export interface HttpMistakeDiagnosisAdapterOptions {
  endpoint: string;
  apiKey?: string;
  fetcher?: typeof fetch;
}

export function createHttpMistakeDiagnosisAdapter(options: HttpMistakeDiagnosisAdapterOptions): MistakeDiagnosisAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    async diagnoseMistake(input) {
      const response = await fetcher(options.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {})
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Mistake diagnosis request failed with status ${response.status}`);
      }

      return analyzeMistakeResponseSchema.parse(await response.json());
    }
  };
}
