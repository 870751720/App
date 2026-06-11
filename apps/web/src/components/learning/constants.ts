import type { LearningOverviewResponse, Subject } from "@app/schemas";

export const subjectOptions: Subject[] = ["chinese", "math", "english", "physics", "chemistry", "geography"];

export function getAssetStatusLabel(status: LearningOverviewResponse["assets"][number]["status"]) {
  const labels: Record<LearningOverviewResponse["assets"][number]["status"], string> = {
    pending_review: "待处理",
    ocr_text_provided: "已用手工 OCR 文本",
    text_extracted: "已提取文本",
    ai_ocr_extracted: "AI OCR 已提取",
    needs_manual_text: "需人工补文本"
  };
  return labels[status];
}
