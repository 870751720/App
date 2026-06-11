import { useState } from "react";
import { ClipboardCheck, LibraryBig, Save } from "lucide-react";
import type { createApiClient } from "@app/api-client";
import { getSubjectLabel } from "@app/domain";
import type { LearningOverviewResponse, MasteryLevel, Subject } from "@app/schemas";
import { getErrorMessage } from "../../lib/errors";
import { Button } from "../ui/button";
import { subjectOptions } from "./constants";
import { Label, Panel, Section } from "./ui";

export function KnowledgeMap({
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
  const [message, setMessage] = useState("");
  const [pointForm, setPointForm] = useState({
    subject: "math" as Subject,
    chapter: "函数与导数",
    name: "",
    examWeight: 4
  });
  const firstPoint = data.knowledgePoints[0];
  const firstRecord = firstPoint ? data.mastery.find((record) => record.knowledgePointId === firstPoint.id) : null;
  const [masteryForm, setMasteryForm] = useState({
    knowledgePointId: firstPoint?.id ?? "",
    level: (firstRecord?.level ?? "basic") as MasteryLevel,
    score: firstRecord?.score ?? 60,
    attempts: firstRecord?.attempts ?? 0,
    correctAttempts: firstRecord?.correctAttempts ?? 0
  });

  async function savePoint() {
    setMessage("保存中");
    try {
      await apiClient.upsertKnowledgePoint(token, pointForm);
      setMessage("知识点已保存。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function saveMastery() {
    setMessage("更新中");
    try {
      await apiClient.updateMastery(token, masteryForm);
      setMessage("掌握度已更新，计划已重新计算。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <Section id="知识点" icon={<LibraryBig className="size-5" />} title="知识点掌握图">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.knowledgePoints.map((point) => {
          const record = data.mastery.find((item) => item.knowledgePointId === point.id);
          const score = record?.score ?? 0;
          return (
            <Panel key={point.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#2e6f57]">{getSubjectLabel(point.subject)} · {point.chapter}</p>
                  <h3 className="mt-2 text-xl font-black">{point.name}</h3>
                </div>
                <span className="rounded-md bg-[#eef2ec] px-2 py-1 text-sm font-black">{score}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#e5e9e2]">
                <div className={`h-2 rounded-full ${score >= 80 ? "bg-[#2e6f57]" : score >= 60 ? "bg-[#b7791f]" : "bg-[#c2410c]"}`} style={{ width: `${score}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#647069]">权重 {point.examWeight} · 作答 {record?.attempts ?? 0} 次 · 正确 {record?.correctAttempts ?? 0} 次</p>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Panel>
          <h3 className="text-xl font-black">新增/维护知识点</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Label text="科目">
              <select className="field" value={pointForm.subject} onChange={(event) => setPointForm({ ...pointForm, subject: event.target.value as Subject })}>
                {subjectOptions.map((subject) => <option key={subject} value={subject}>{getSubjectLabel(subject)}</option>)}
              </select>
            </Label>
            <Label text="权重 1-5">
              <input className="field" type="number" min={1} max={5} value={pointForm.examWeight} onChange={(event) => setPointForm({ ...pointForm, examWeight: Number(event.target.value) })} />
            </Label>
          </div>
          <Label text="章节">
            <input className="field" value={pointForm.chapter} onChange={(event) => setPointForm({ ...pointForm, chapter: event.target.value })} />
          </Label>
          <Label text="知识点名称">
            <input className="field" value={pointForm.name} onChange={(event) => setPointForm({ ...pointForm, name: event.target.value })} />
          </Label>
          <Button className="mt-4" type="button" onClick={() => void savePoint()}>
            <Save className="size-4" />
            保存知识点
          </Button>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black">更新掌握度</h3>
          <Label text="知识点">
            <select className="field" value={masteryForm.knowledgePointId} onChange={(event) => setMasteryForm({ ...masteryForm, knowledgePointId: event.target.value })}>
              {data.knowledgePoints.map((point) => <option key={point.id} value={point.id}>{getSubjectLabel(point.subject)} · {point.name}</option>)}
            </select>
          </Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Label text="状态">
              <select className="field" value={masteryForm.level} onChange={(event) => setMasteryForm({ ...masteryForm, level: event.target.value as MasteryLevel })}>
                <option value="unstarted">未开始</option>
                <option value="understood">听懂但不稳</option>
                <option value="basic">基础会做</option>
                <option value="stable">稳定拿分</option>
              </select>
            </Label>
            <Label text="掌握度">
              <input className="field" type="number" min={0} max={100} value={masteryForm.score} onChange={(event) => setMasteryForm({ ...masteryForm, score: Number(event.target.value) })} />
            </Label>
            <Label text="作答次数">
              <input className="field" type="number" min={0} value={masteryForm.attempts} onChange={(event) => setMasteryForm({ ...masteryForm, attempts: Number(event.target.value) })} />
            </Label>
            <Label text="正确次数">
              <input className="field" type="number" min={0} value={masteryForm.correctAttempts} onChange={(event) => setMasteryForm({ ...masteryForm, correctAttempts: Number(event.target.value) })} />
            </Label>
          </div>
          <Button className="mt-4" type="button" onClick={() => void saveMastery()}>
            <ClipboardCheck className="size-4" />
            更新掌握度
          </Button>
          {message ? <p className="mt-3 text-sm font-bold text-[#2e6f57]">{message}</p> : null}
        </Panel>
      </div>
    </Section>
  );
}
