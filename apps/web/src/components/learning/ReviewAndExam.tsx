import { useState } from "react";
import { Edit3, Save } from "lucide-react";
import type { createApiClient } from "@app/api-client";
import { getSubjectLabel } from "@app/domain";
import type { LearningOverviewResponse, QuestionType, Subject } from "@app/schemas";
import { getErrorMessage } from "../../lib/errors";
import { Button } from "../ui/button";
import { subjectOptions } from "./constants";
import { Label, Panel, Section } from "./ui";

export function ReviewAndExam({
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
  const firstQuestion = data.questions[0];
  const [message, setMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    questionId: firstQuestion?.id ?? "",
    subject: firstQuestion?.subject ?? "math" as Subject,
    knowledgePointId: firstQuestion?.knowledgePointIds[0] ?? data.knowledgePoints[0]?.id ?? "",
    type: (firstQuestion?.type ?? "calculation") as QuestionType,
    difficulty: firstQuestion?.difficulty ?? 3,
    stem: firstQuestion?.stem ?? "",
    answer: firstQuestion?.answer ?? "",
    analysis: firstQuestion?.analysis ?? ""
  });
  const [examForm, setExamForm] = useState({
    title: "阶段测试",
    chinese: 100,
    math: 100,
    english: 100,
    physics: 70,
    chemistry: 70,
    geography: 70,
    summary: ""
  });

  function loadQuestion(questionId: string) {
    const question = data.questions.find((candidate) => candidate.id === questionId);
    if (!question) {
      return;
    }
    setReviewForm({
      questionId: question.id,
      subject: question.subject,
      knowledgePointId: question.knowledgePointIds[0] ?? data.knowledgePoints[0]?.id ?? "",
      type: question.type,
      difficulty: question.difficulty,
      stem: question.stem,
      answer: question.answer,
      analysis: question.analysis
    });
  }

  async function saveQuestion() {
    setMessage("保存题目中");
    try {
      await apiClient.updateQuestion(token, {
        questionId: reviewForm.questionId,
        subject: reviewForm.subject,
        knowledgePointIds: [reviewForm.knowledgePointId],
        type: reviewForm.type,
        difficulty: reviewForm.difficulty,
        stem: reviewForm.stem,
        answer: reviewForm.answer,
        analysis: reviewForm.analysis
      });
      setMessage("题目已校对。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function saveExam() {
    setMessage("保存考试中");
    try {
      await apiClient.createExamRecord(token, {
        title: examForm.title,
        takenAt: new Date().toISOString(),
        scores: {
          chinese: examForm.chinese,
          math: examForm.math,
          english: examForm.english,
          physics: examForm.physics,
          chemistry: examForm.chemistry,
          geography: examForm.geography
        },
        summary: examForm.summary || undefined
      });
      setMessage("考试记录已保存。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <Section id="题目校对" icon={<Edit3 className="size-5" />} title="题目校对与考试录入">
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel>
          <h3 className="text-xl font-black">题目人工校对</h3>
          <Label text="题目">
            <select className="field" value={reviewForm.questionId} onChange={(event) => loadQuestion(event.target.value)}>
              {data.questions.map((question) => <option key={question.id} value={question.id}>{question.stem.slice(0, 48)}</option>)}
            </select>
          </Label>
          <div className="grid gap-3 md:grid-cols-3">
            <Label text="科目">
              <select className="field" value={reviewForm.subject} onChange={(event) => setReviewForm({ ...reviewForm, subject: event.target.value as Subject })}>
                {subjectOptions.map((subject) => <option key={subject} value={subject}>{getSubjectLabel(subject)}</option>)}
              </select>
            </Label>
            <Label text="题型">
              <select className="field" value={reviewForm.type} onChange={(event) => setReviewForm({ ...reviewForm, type: event.target.value as QuestionType })}>
                <option value="single_choice">单选</option>
                <option value="multiple_choice">多选</option>
                <option value="fill_blank">填空</option>
                <option value="calculation">计算</option>
                <option value="essay">作文/论述</option>
                <option value="experiment">实验</option>
              </select>
            </Label>
            <Label text="难度">
              <input className="field" type="number" min={1} max={5} value={reviewForm.difficulty} onChange={(event) => setReviewForm({ ...reviewForm, difficulty: Number(event.target.value) })} />
            </Label>
          </div>
          <Label text="知识点">
            <select className="field" value={reviewForm.knowledgePointId} onChange={(event) => setReviewForm({ ...reviewForm, knowledgePointId: event.target.value })}>
              {data.knowledgePoints.map((point) => <option key={point.id} value={point.id}>{getSubjectLabel(point.subject)} · {point.name}</option>)}
            </select>
          </Label>
          <Label text="题干">
            <textarea className="field min-h-24" value={reviewForm.stem} onChange={(event) => setReviewForm({ ...reviewForm, stem: event.target.value })} />
          </Label>
          <Label text="答案">
            <textarea className="field min-h-20" value={reviewForm.answer} onChange={(event) => setReviewForm({ ...reviewForm, answer: event.target.value })} />
          </Label>
          <Label text="解析">
            <textarea className="field min-h-20" value={reviewForm.analysis} onChange={(event) => setReviewForm({ ...reviewForm, analysis: event.target.value })} />
          </Label>
          <Button className="mt-4" type="button" onClick={() => void saveQuestion()}>
            <Save className="size-4" />
            保存校对
          </Button>
        </Panel>

        <Panel id="考试">
          <h3 className="text-xl font-black">考试成绩录入</h3>
          <Label text="考试名称">
            <input className="field" value={examForm.title} onChange={(event) => setExamForm({ ...examForm, title: event.target.value })} />
          </Label>
          <div className="grid gap-3 md:grid-cols-3">
            {subjectOptions.map((subject) => (
              <Label key={subject} text={getSubjectLabel(subject)}>
                <input
                  className="field"
                  type="number"
                  min={0}
                  max={150}
                  value={examForm[subject]}
                  onChange={(event) => setExamForm({ ...examForm, [subject]: Number(event.target.value) })}
                />
              </Label>
            ))}
          </div>
          <Label text="总结，可空">
            <textarea className="field min-h-20" value={examForm.summary} onChange={(event) => setExamForm({ ...examForm, summary: event.target.value })} />
          </Label>
          <Button className="mt-4" type="button" onClick={() => void saveExam()}>
            <Save className="size-4" />
            保存考试
          </Button>
          {message ? <p className="mt-3 text-sm font-bold text-[#2e6f57]">{message}</p> : null}
        </Panel>
      </div>
    </Section>
  );
}
