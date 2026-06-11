import { BarChart3, CalendarDays, CheckCircle2, FilePlus2, Target } from "lucide-react";
import type { LearningOverviewResponse } from "@app/schemas";
import { InfoLine, Metric, ReportBlock, Section } from "./ui";

export function Hero({ data }: { data: LearningOverviewResponse }) {
  return (
    <header id="总览" className="rounded-lg border border-[#d9ddd4] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-bold text-[#2e6f57]">{data.student.province} · {data.student.track}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">目标 {data.student.targetScore} 分，距离下一次 6 月 7 日约 {data.student.daysToExam} 天</h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#647069]">
            当前系统使用 MySQL 持久化学习画像，AI 只通过后台接口读写结构化数据。
          </p>
        </div>
        <div className="grid min-w-72 gap-2 rounded-md bg-[#f5f6f1] p-3 text-sm">
          <InfoLine label="知识点" value={`${data.knowledgePoints.length} 个`} />
          <InfoLine label="题目" value={`${data.questions.length} 道`} />
          <InfoLine label="错题" value={`${data.mistakes.length} 道`} />
        </div>
      </div>
    </header>
  );
}

export function MetricGrid({ data }: { data: LearningOverviewResponse }) {
  const averageMastery = Math.round(data.mastery.reduce((sum, item) => sum + item.score, 0) / Math.max(1, data.mastery.length));
  const latestExam = data.exams[0];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Target className="size-5" />} label="最近总分" value={`${latestExam?.total ?? 0}`} detail={latestExam?.summary ?? "暂无考试记录。"} />
      <Metric icon={<BarChart3 className="size-5" />} label="平均掌握度" value={`${averageMastery}%`} detail="由作答、错题和知识点权重综合估算。" />
      <Metric icon={<FilePlus2 className="size-5" />} label="题源数量" value={`${data.questionSources.length}`} detail={`${data.assets.length} 个上传文件，个人题源和 AI 变式统一记录。`} />
      <Metric icon={<CalendarDays className="size-5" />} label="今日任务" value={`${data.dailyTasks.length}`} detail="按薄弱度、错题频率和考试权重排序。" />
    </section>
  );
}

export function WeeklyReport({ data }: { data: LearningOverviewResponse }) {
  const report = data.weeklyReport;
  return (
    <Section id="周报" icon={<CheckCircle2 className="size-5" />} title="周复盘报告">
      <div className="grid gap-3 xl:grid-cols-4">
        <ReportBlock title="本周重点" items={report.focus} />
        <ReportBlock title="进步" items={report.progress} />
        <ReportBlock title="风险" items={report.risks} />
        <ReportBlock title="下周动作" items={report.nextWeek} />
      </div>
    </Section>
  );
}
