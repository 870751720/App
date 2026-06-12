import { useEffect, useState } from "react";
import { Brain, FlaskConical, UploadCloud } from "lucide-react";
import type { createApiClient } from "@app/api-client";
import { getSubjectLabel } from "@app/domain";
import type { AnalyzeMistakeResponse, LearningOverviewResponse, Question, QuestionSourceCatalogItem, Subject } from "@app/schemas";
import { getErrorMessage } from "../../lib/errors";
import { readFileAsBase64 } from "../../lib/files";
import { Button } from "../ui/button";
import { getAssetStatusLabel, subjectOptions } from "./constants";
import type { DataState } from "./types";
import { Alert, Label, Panel, Section } from "./ui";

export function AiWorkflows({
  apiClient,
  data,
  token,
  onRefresh
}: {
  apiClient: ReturnType<typeof createApiClient>;
  data: LearningOverviewResponse;
  token: string;
  onRefresh: () => void;
}) {
  const firstPoint = data.knowledgePoints[1] ?? data.knowledgePoints[0];
  const firstQuestion = data.questions[0];
  const [diagnosis, setDiagnosis] = useState<DataState<AnalyzeMistakeResponse>>({ state: "idle" });
  const [importMessage, setImportMessage] = useState("");
  const [variantMessage, setVariantMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [catalogSources, setCatalogSources] = useState<QuestionSourceCatalogItem[]>([]);
  const [selectedCatalogSourceIds, setSelectedCatalogSourceIds] = useState<string[]>([]);
  const [mistakeForm, setMistakeForm] = useState({
    subject: firstPoint?.subject ?? "math" as Subject,
    knowledgePointId: firstPoint?.id ?? "math-derivative",
    questionStem: firstQuestion?.stem ?? "",
    standardAnswer: firstQuestion?.answer ?? "",
    studentAnswer: "",
    scoreLost: 5
  });
  const [sourceForm, setSourceForm] = useState({
    title: "个人上传题源",
    provider: "personal",
    rawText: "在这里粘贴教辅、试卷或网页中的题目文本。",
    url: "",
    subject: firstPoint?.subject ?? "math" as Subject,
    knowledgePointId: firstPoint?.id ?? "math-derivative"
  });
  const [batchUrls, setBatchUrls] = useState("");

  useEffect(() => {
    let isActive = true;

    void apiClient.getQuestionSourceCatalog(token)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setCatalogSources(result.sources);
        setSelectedCatalogSourceIds(result.sources.slice(0, 2).map((source) => source.id));
      })
      .catch((error) => {
        if (isActive) {
          setImportMessage(getErrorMessage(error));
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiClient, token]);

  async function submitMistake() {
    setDiagnosis({ state: "loading" });
    try {
      const result = await apiClient.analyzeMistake(token, {
        subject: mistakeForm.subject,
        knowledgePointIds: [mistakeForm.knowledgePointId],
        questionStem: mistakeForm.questionStem,
        standardAnswer: mistakeForm.standardAnswer,
        studentAnswer: mistakeForm.studentAnswer || "未完整作答",
        scoreLost: mistakeForm.scoreLost
      });
      setDiagnosis({ state: "ready", data: result });
      onRefresh();
    } catch (error) {
      setDiagnosis({ state: "error", message: getErrorMessage(error) });
    }
  }

  async function importSource() {
    setImportMessage("导入中");
    try {
      const result = await apiClient.importQuestionSource(token, {
        type: sourceForm.url ? "web_import" : "manual",
        title: sourceForm.title,
        provider: sourceForm.provider,
        rawText: sourceForm.rawText,
        url: sourceForm.url || undefined,
        subject: sourceForm.subject,
        knowledgePointId: sourceForm.knowledgePointId
      });
      setImportMessage(`已导入 ${result.questions.length} 道候选题，需要人工核对。`);
      onRefresh();
    } catch (error) {
      setImportMessage(getErrorMessage(error));
    }
  }

  async function importWebPage() {
    if (!sourceForm.url) {
      setImportMessage("请先填写公开网页地址。");
      return;
    }

    setImportMessage("正在抓取网页");
    try {
      const result = await apiClient.importWebPage(token, {
        url: sourceForm.url,
        title: sourceForm.title,
        provider: sourceForm.provider || "web",
        subject: sourceForm.subject,
        knowledgePointId: sourceForm.knowledgePointId
      });
      setImportMessage(`已从网页导入 ${result.questions.length} 道候选题。`);
      onRefresh();
    } catch (error) {
      setImportMessage(getErrorMessage(error));
    }
  }

  async function importWebPages() {
    const urls = batchUrls
      .split(/\s+/)
      .map((url) => url.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      setImportMessage("请先填写至少一个公开网页地址。");
      return;
    }

    setImportMessage("正在批量抓取网页");
    try {
      const result = await apiClient.importWebPages(token, {
        urls,
        provider: sourceForm.provider || "web",
        subject: sourceForm.subject,
        knowledgePointId: sourceForm.knowledgePointId
      });
      const questionCount = result.imports.reduce((sum, item) => sum + item.questions.length, 0);
      setImportMessage(`批量导入完成：成功 ${result.imports.length} 页、${questionCount} 道候选题，失败 ${result.failed.length} 页。`);
      onRefresh();
    } catch (error) {
      setImportMessage(getErrorMessage(error));
    }
  }

  async function importCatalogSources() {
    if (selectedCatalogSourceIds.length === 0) {
      setImportMessage("请先选择至少一个公开题源。");
      return;
    }

    setImportMessage("正在导入公开题源目录");
    try {
      const result = await apiClient.importQuestionSourceCatalog(token, {
        sourceIds: selectedCatalogSourceIds
      });
      const questionCount = result.imports.reduce((sum, item) => sum + item.questions.length, 0);
      setImportMessage(`目录导入完成：成功 ${result.imports.length} 个来源、${questionCount} 道候选题，失败 ${result.failed.length} 个来源。`);
      onRefresh();
    } catch (error) {
      setImportMessage(getErrorMessage(error));
    }
  }

  function toggleCatalogSource(sourceId: string) {
    setSelectedCatalogSourceIds((current) => (
      current.includes(sourceId) ? current.filter((id) => id !== sourceId) : [...current, sourceId]
    ));
  }

  async function uploadAsset(file: File | null) {
    if (!file) {
      return;
    }

    setUploadMessage("上传处理中");
    try {
      const contentBase64 = await readFileAsBase64(file);
      const result = await apiClient.uploadQuestionAsset(token, {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64,
        title: sourceForm.title || file.name,
        ocrText: sourceForm.rawText.trim() === "在这里粘贴教辅、试卷或网页中的题目文本。" ? undefined : sourceForm.rawText
      });
      setUploadMessage(`已保存上传文件：${result.asset.status}，生成 ${result.questions.length} 道候选题。`);
      onRefresh();
    } catch (error) {
      setUploadMessage(getErrorMessage(error));
    }
  }

  async function generateVariants(question: Question) {
    setVariantMessage("生成中");
    try {
      const result = await apiClient.generateSimilarQuestions(token, { questionId: question.id, count: 4 });
      setVariantMessage(`已生成 ${result.questions.length} 道同类题。`);
      onRefresh();
    } catch (error) {
      setVariantMessage(getErrorMessage(error));
    }
  }

  return (
    <Section id="错题诊断" icon={<Brain className="size-5" />} title="AI 接口工作台">
      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <h3 className="text-xl font-black">错题诊断接口</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Label text="科目">
              <select className="field" value={mistakeForm.subject} onChange={(event) => setMistakeForm({ ...mistakeForm, subject: event.target.value as Subject })}>
                {subjectOptions.map((subject) => <option key={subject} value={subject}>{getSubjectLabel(subject)}</option>)}
              </select>
            </Label>
            <Label text="知识点">
              <select className="field" value={mistakeForm.knowledgePointId} onChange={(event) => setMistakeForm({ ...mistakeForm, knowledgePointId: event.target.value })}>
                {data.knowledgePoints.map((point) => <option key={point.id} value={point.id}>{getSubjectLabel(point.subject)} · {point.name}</option>)}
              </select>
            </Label>
          </div>
          <Label text="题干">
            <textarea className="field min-h-24" value={mistakeForm.questionStem} onChange={(event) => setMistakeForm({ ...mistakeForm, questionStem: event.target.value })} />
          </Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Label text="标准答案">
              <textarea className="field min-h-20" value={mistakeForm.standardAnswer} onChange={(event) => setMistakeForm({ ...mistakeForm, standardAnswer: event.target.value })} />
            </Label>
            <Label text="学生答案">
              <textarea className="field min-h-20" value={mistakeForm.studentAnswer} onChange={(event) => setMistakeForm({ ...mistakeForm, studentAnswer: event.target.value })} />
            </Label>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
            <Label text="失分">
              <input className="field md:w-28" type="number" min={0} value={mistakeForm.scoreLost} onChange={(event) => setMistakeForm({ ...mistakeForm, scoreLost: Number(event.target.value) })} />
            </Label>
            <Button type="button" onClick={() => void submitMistake()}>
              <Brain aria-hidden="true" className="size-4" />
              分析并入库
            </Button>
          </div>
          {diagnosis.state === "ready" ? (
            <div className="mt-4 rounded-md bg-[#f5f6f1] p-4 text-sm leading-7">
              <p className="font-black">诊断：{diagnosis.data.diagnosis}</p>
              <p>下次规则：{diagnosis.data.nextRule}</p>
              <p>训练建议：{diagnosis.data.recommendedDrill}</p>
            </div>
          ) : diagnosis.state === "error" ? <Alert>{diagnosis.message}</Alert> : null}
        </Panel>

        <Panel id="题源">
          <h3 className="text-xl font-black">题源导入与同类题</h3>
          <Label text="题源标题">
            <input className="field" value={sourceForm.title} onChange={(event) => setSourceForm({ ...sourceForm, title: event.target.value })} />
          </Label>
          <Label text="来源">
            <input className="field" value={sourceForm.provider} onChange={(event) => setSourceForm({ ...sourceForm, provider: event.target.value })} />
          </Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Label text="科目">
              <select
                className="field"
                value={sourceForm.subject}
                onChange={(event) => {
                  const subject = event.target.value as Subject;
                  const point = data.knowledgePoints.find((candidate) => candidate.subject === subject);
                  setSourceForm({ ...sourceForm, subject, knowledgePointId: point?.id ?? sourceForm.knowledgePointId });
                }}
              >
                {subjectOptions.map((subject) => <option key={subject} value={subject}>{getSubjectLabel(subject)}</option>)}
              </select>
            </Label>
            <Label text="知识点">
              <select className="field" value={sourceForm.knowledgePointId} onChange={(event) => setSourceForm({ ...sourceForm, knowledgePointId: event.target.value })}>
                {data.knowledgePoints
                  .filter((point) => point.subject === sourceForm.subject)
                  .map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}
              </select>
            </Label>
          </div>
          <Label text="公开网页地址，可空">
            <input className="field" value={sourceForm.url} onChange={(event) => setSourceForm({ ...sourceForm, url: event.target.value })} />
          </Label>
          <Label text="批量网页地址，每行一个">
            <textarea className="field min-h-20" value={batchUrls} onChange={(event) => setBatchUrls(event.target.value)} />
          </Label>
          <Label text="题目文本">
            <textarea className="field min-h-28" value={sourceForm.rawText} onChange={(event) => setSourceForm({ ...sourceForm, rawText: event.target.value })} />
          </Label>
          {catalogSources.length > 0 ? (
            <div className="mt-4 rounded-md border border-[#e0e4dd] bg-[#f8f9f5] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-black text-[#27332d]">公开题源目录</h4>
                <Button type="button" variant="secondary" onClick={() => void importCatalogSources()}>
                  <UploadCloud aria-hidden="true" className="size-4" />
                  导入所选
                </Button>
              </div>
              <div className="space-y-2">
                {catalogSources.map((source) => (
                  <label key={source.id} className="flex gap-3 rounded-md border border-[#e0e4dd] bg-white p-3 text-sm">
                    <input
                      className="mt-1 size-4"
                      type="checkbox"
                      checked={selectedCatalogSourceIds.includes(source.id)}
                      onChange={() => toggleCatalogSource(source.id)}
                    />
                    <span className="min-w-0">
                      <span className="block font-black text-[#27332d]">{source.title}</span>
                      <span className="mt-1 block text-[#647069]">{getSubjectLabel(source.subject)} · {source.provider} · {source.note}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void importSource()}>
              <UploadCloud aria-hidden="true" className="size-4" />
              导入题源
            </Button>
            <Button type="button" variant="secondary" onClick={() => void importWebPage()}>
              <UploadCloud aria-hidden="true" className="size-4" />
              抓取网页
            </Button>
            <Button type="button" variant="secondary" onClick={() => void importWebPages()}>
              <UploadCloud aria-hidden="true" className="size-4" />
              批量抓取
            </Button>
            {firstQuestion ? (
              <Button type="button" variant="secondary" onClick={() => void generateVariants(firstQuestion)}>
                <FlaskConical aria-hidden="true" className="size-4" />
                生成同类题
              </Button>
            ) : null}
          </div>
          <Label text="上传图片/PDF/文本">
            <input
              className="field"
              type="file"
              accept="image/*,application/pdf,text/plain"
              onChange={(event) => void uploadAsset(event.target.files?.[0] ?? null)}
            />
          </Label>
          {importMessage || variantMessage ? <p className="mt-3 text-sm font-bold text-[#2e6f57]">{importMessage || variantMessage}</p> : null}
          {uploadMessage ? <p className="mt-3 text-sm font-bold text-[#2e6f57]">{uploadMessage}</p> : null}
          {data.assets.length > 0 ? (
            <div className="mt-4 space-y-2">
              {data.assets.slice(0, 4).map((asset) => (
                <div key={asset.id} className="rounded-md border border-[#e0e4dd] bg-[#f8f9f5] p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-black">
                    <span>{asset.fileName}</span>
                    <span className="text-[#2e6f57]">{getAssetStatusLabel(asset.status)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[#647069]">{asset.extractedText || "未提取到文本，等待人工补充或 OCR 服务处理。"}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>
    </Section>
  );
}
