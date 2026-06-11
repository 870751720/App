import { useState } from "react";
import { BookOpenCheck, Brain, Layers3, LockKeyhole, Target } from "lucide-react";
import type { HealthStatus } from "@app/schemas";
import { Button } from "../ui/button";
import { Alert, Badge, Feature, Label } from "./ui";
import type { DataState, SessionState } from "./types";

export function LoginScreen({
  health,
  session,
  onLogin
}: {
  health: DataState<HealthStatus>;
  session: SessionState;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("user@app.local");
  const [password, setPassword] = useState("user123");

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-8 px-4 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
      <div>
        <Badge icon={<BookOpenCheck className="size-4" />}>四川新高考复读学习系统</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">把错题、知识点和每日训练连成闭环</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#647069]">
          网站不提供聊天入口，AI 作为后台接口参与错因诊断、题源导入、同类题生成、每日计划和周报复盘。
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Feature icon={<Layers3 className="size-5" />} title="知识点画像" text="按科目、章节、题型和掌握度持续跟踪。" />
          <Feature icon={<Brain className="size-5" />} title="AI 后台教练" text="接口化诊断和推荐，不做聊天依赖。" />
          <Feature icon={<Target className="size-5" />} title="个人题库" text="支持上传、网页文本、真题目录和 AI 变式。" />
        </div>
      </div>

      <form
        className="rounded-lg border border-[#d9ddd4] bg-white p-5 shadow-xl shadow-[#304034]/10"
        onSubmit={(event) => {
          event.preventDefault();
          void onLogin(email, password);
        }}
      >
        <div className="flex items-center justify-between border-b border-[#ecefe9] pb-5">
          <div>
            <h2 className="text-xl font-black">登录学习档案</h2>
            <p className="mt-1 text-sm text-[#647069]">演示账号已预填，可直接进入。</p>
          </div>
          <span className="grid size-11 place-items-center rounded-md bg-[#17201b] text-white">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </span>
        </div>

        <Label text="邮箱">
          <input className="field" value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
        </Label>
        <Label text="密码">
          <input className="field" value={password} type="password" onChange={(event) => setPassword(event.target.value)} />
        </Label>

        {session.state === "error" ? <Alert>{session.message}</Alert> : null}

        <Button className="mt-5 w-full bg-[#17201b] hover:bg-[#2f3d35]" size="lg" type="submit" disabled={session.state === "loading"}>
          <LockKeyhole aria-hidden="true" className="size-4" />
          {session.state === "loading" ? "登录中" : "进入系统"}
        </Button>

        <div className="mt-5 rounded-md bg-[#f5f6f1] p-3 text-sm text-[#647069]">
          API 状态：{health.state === "ready" ? `正常 ${new Date(health.data.checkedAt).toLocaleTimeString()} · 数据库 ${health.data.checks?.database ?? "未知"}` : health.state}
        </div>
      </form>
    </section>
  );
}
