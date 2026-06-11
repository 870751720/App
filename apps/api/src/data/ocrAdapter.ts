import { z } from "zod";

const ocrResponseSchema = z
  .object({
    text: z.string().optional(),
    extractedText: z.string().optional()
  })
  .passthrough();

export interface OcrRequest {
  fileName: string;
  mimeType: string;
  contentBase64: string;
}

export interface OcrAdapter {
  extractText(input: OcrRequest): Promise<string>;
}

export interface HttpOcrAdapterOptions {
  endpoint: string;
  apiKey?: string;
  fetcher?: typeof fetch;
}

export function createHttpOcrAdapter(options: HttpOcrAdapterOptions): OcrAdapter {
  const fetcher = options.fetcher ?? fetch;

  return {
    async extractText(input) {
      const response = await fetcher(options.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {})
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`OCR request failed with status ${response.status}`);
      }

      const payload = ocrResponseSchema.parse(await response.json());
      return normalizeOcrText(payload.text ?? payload.extractedText ?? "");
    }
  };
}

function normalizeOcrText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
