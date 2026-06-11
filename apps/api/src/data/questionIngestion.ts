import type { OcrAdapter } from "./ocrAdapter.js";

export interface ExtractedUpload {
  byteSize: number;
  extractedText: string;
  status: "ocr_text_provided" | "text_extracted" | "ai_ocr_extracted" | "needs_manual_text";
}

export async function fetchReadableWebText(url: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(url, {
    headers: {
      "user-agent": "AppLearningBot/0.1 personal-study-import"
    }
  });

  if (!response.ok) {
    throw new Error(`Web page fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  return normalizeText(stripHtml(html)).slice(0, 6000);
}

export async function extractUploadText(
  input: { fileName: string; contentBase64: string; mimeType: string; ocrText?: string },
  ocrAdapter?: OcrAdapter
): Promise<ExtractedUpload> {
  const buffer = Buffer.from(input.contentBase64, "base64");
  const providedText = normalizeText(input.ocrText ?? "");

  if (providedText.length > 0) {
    return {
      byteSize: buffer.byteLength,
      extractedText: providedText,
      status: "ocr_text_provided"
    };
  }

  if (input.mimeType.startsWith("text/")) {
    return {
      byteSize: buffer.byteLength,
      extractedText: normalizeText(buffer.toString("utf8")),
      status: "text_extracted"
    };
  }

  if (ocrAdapter) {
    try {
      const extractedText = normalizeText(await ocrAdapter.extractText(input));
      if (extractedText.length > 0) {
        return {
          byteSize: buffer.byteLength,
          extractedText,
          status: "ai_ocr_extracted"
        };
      }
    } catch {
      return {
        byteSize: buffer.byteLength,
        extractedText: "",
        status: "needs_manual_text"
      };
    }
  }

  return {
    byteSize: buffer.byteLength,
    extractedText: "",
    status: "needs_manual_text"
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
