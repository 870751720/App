import { useState } from "react";
import { CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";
import type { createApiClient } from "@app/api-client";
import { getSubjectLabel } from "@app/domain";
import type { LearningOverviewResponse } from "@app/schemas";
import { getErrorMessage } from "../../lib/errors";
import { Button } from "../ui/button";
import { Label, Panel, Section } from "./ui";

export function DailyPlan({
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
  const [minutes, setMinutes] = useState(180);
  const [message, setMessage] = useState("");

  async function regenerate() {
    setMessage("生成中");
    try {
      await apiClient.generateDailyPlan(token, { availableMinutes: minutes });
      setMessage("今日计划已按最新薄弱点重新生成。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function completeTask(taskId: string) {
    setMessage("更新任务中");
    try {
      await apiClient.completeStudyTask(token, { taskId });
      setMessage("任务已完成。");
      onRefresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <Section id="每日计划" icon={<CalendarDays className="size-5" />} title="每日补弱计划">
      <Panel>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Label text="今日可学习分钟数">
            <input className="field md:w-40" type="number" min={20} max={720} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
          </Label>
          <Button type="button" onClick={() => void regenerate()}>
            <RefreshCw aria-hidden="true" className="size-4" />
            重新生成计划
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm font-bold text-[#2e6f57]">{message}</p> : null}
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {data.dailyTasks.map((task) => {
            const point = data.knowledgePoints.find((item) => item.id === task.knowledgePointId);
            return (
              <div key={task.id} className="rounded-lg border border-[#d9ddd4] bg-[#fbfcf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#2e6f57]">优先级 {task.priority} · {getSubjectLabel(task.subject)}</p>
                    <h3 className="mt-2 text-lg font-black">{task.title}</h3>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-sm font-black">{task.status === "done" ? "已完成" : `${task.minutes} 分钟`}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#647069]">{task.reason}</p>
                <p className="mt-2 text-sm font-bold text-[#17201b]">知识点：{point?.name ?? task.knowledgePointId}</p>
                {task.status !== "done" ? (
                  <Button className="mt-3" size="sm" type="button" variant="secondary" onClick={() => void completeTask(task.id)}>
                    <CheckCircle2 className="size-4" />
                    标记完成
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </Panel>
    </Section>
  );
}
