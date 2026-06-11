import assert from "node:assert/strict";
import test from "node:test";
import { extractUploadText } from "./questionIngestion.js";
import type { OcrAdapter } from "./ocrAdapter.js";

function toBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

test("extractUploadText prefers provided OCR text", async () => {
  const extracted = await extractUploadText({
    fileName: "paper.png",
    mimeType: "image/png",
    contentBase64: toBase64("binary"),
    ocrText: "  已识别题干  "
  });

  assert.equal(extracted.status, "ocr_text_provided");
  assert.equal(extracted.extractedText, "已识别题干");
});

test("extractUploadText reads plain text uploads", async () => {
  const extracted = await extractUploadText({
    fileName: "paper.txt",
    mimeType: "text/plain",
    contentBase64: toBase64("1. 测试题目")
  });

  assert.equal(extracted.status, "text_extracted");
  assert.equal(extracted.extractedText, "1. 测试题目");
});

test("extractUploadText uses OCR adapter for binary uploads", async () => {
  const ocrAdapter: OcrAdapter = {
    async extractText() {
      return "AI OCR 题干";
    }
  };
  const extracted = await extractUploadText(
    {
      fileName: "paper.png",
      mimeType: "image/png",
      contentBase64: toBase64("binary")
    },
    ocrAdapter
  );

  assert.equal(extracted.status, "ai_ocr_extracted");
  assert.equal(extracted.extractedText, "AI OCR 题干");
});

test("extractUploadText keeps upload when OCR adapter fails", async () => {
  const ocrAdapter: OcrAdapter = {
    async extractText() {
      throw new Error("OCR unavailable");
    }
  };
  const extracted = await extractUploadText(
    {
      fileName: "paper.pdf",
      mimeType: "application/pdf",
      contentBase64: toBase64("binary")
    },
    ocrAdapter
  );

  assert.equal(extracted.status, "needs_manual_text");
  assert.equal(extracted.extractedText, "");
});
