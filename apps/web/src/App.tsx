import { useEffect, useMemo, useState } from "react";
import { Gauge, LogOut, RefreshCw } from "lucide-react";
import { createApiClient } from "@app/api-client";
import { roleDescriptions, roleLabels } from "@app/domain";
import type {
  AuthSessionResponse,
  HealthStatus,
  LearningOverviewResponse
} from "@app/schemas";
import { Button } from "./components/ui/button";
import { AiWorkflows } from "./components/learning/AiWorkflows";
import { DailyPlan } from "./components/learning/DailyPlan";
import { KnowledgeMap } from "./components/learning/KnowledgeMap";
import { LoginScreen } from "./components/learning/LoginScreen";
import { Hero, MetricGrid, WeeklyReport } from "./components/learning/OverviewSections";
import { ReviewAndExam } from "./components/learning/ReviewAndExam";
import type { DataState, SessionState } from "./components/learning/types";
import { Panel } from "./components/learning/ui";
import { getErrorMessage } from "./lib/errors";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
const sessionStorageKey = "app.session.token";

export function App() {
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), []);
  const [session, setSession] = useState<SessionState>({ state: "anonymous" });
  const [health, setHealth] = useState<DataState<HealthStatus>>({ state: "loading" });
  const [learning, setLearning] = useState<DataState<LearningOverviewResponse>>({ state: "idle" });

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getHealth()
      .then((data) => isMounted && setHealth({ state: "ready", data }))
      .catch((error: unknown) => isMounted && setHealth({ state: "error", message: getErrorMessage(error) }));
    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  useEffect(() => {
    const token = window.localStorage.getItem(sessionStorageKey);
    if (!token) {
      return;
    }

    let isMounted = true;
    setSession({ state: "loading", token });
    apiClient
      .getCurrentUser(token)
      .then((user) => isMounted && setSession({ state: "authenticated", session: { token, user } }))
      .catch(() => {
        window.localStorage.removeItem(sessionStorageKey);
        if (isMounted) {
          setSession({ state: "anonymous" });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  useEffect(() => {
    if (session.state !== "authenticated") {
      setLearning({ state: "idle" });
      return;
    }

    void loadLearning(session.session.token);
  }, [session]);

  async function loadLearning(token: string) {
    setLearning({ state: "loading" });
    try {
      setLearning({ state: "ready", data: await apiClient.getLearningOverview(token) });
    } catch (error) {
      setLearning({ state: "error", message: getErrorMessage(error) });
    }
  }

  async function handleLogin(email: string, password: string) {
    setSession({ state: "loading", token: "" });
    try {
      const nextSession = await apiClient.login(email, password);
      window.localStorage.setItem(sessionStorageKey, nextSession.token);
      setSession({ state: "authenticated", session: nextSession });
    } catch (error) {
      setSession({ state: "error", message: getErrorMessage(error) });
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(sessionStorageKey);
    setSession({ state: "anonymous" });
    setLearning({ state: "idle" });
  }

  return (
    <main className="min-h-screen bg-[#f5f6f1] text-[#17201b]">
      {session.state === "authenticated" ? (
        <LearningDashboard
          apiClient={apiClient}
          learning={learning}
          session={session.session}
          onLogout={handleLogout}
          onRefresh={() => void loadLearning(session.session.token)}
        />
      ) : (
        <LoginScreen health={health} session={session} onLogin={handleLogin} />
      )}
    </main>
  );
}

function LearningDashboard({
  apiClient,
  learning,
  session,
  onLogout,
  onRefresh
}: {
  apiClient: ReturnType<typeof createApiClient>;
  learning: DataState<LearningOverviewResponse>;
  session: AuthSessionResponse;
  onLogout: () => void;
  onRefresh: () => void;
}) {
  if (learning.state !== "ready") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Panel className="max-w-lg text-center">
          <RefreshCw aria-hidden="true" className="mx-auto size-8 animate-spin text-[#2e6f57]" />
          <h1 className="mt-4 text-2xl font-black">{learning.state === "error" ? "学习数据加载失败" : "正在加载学习数据"}</h1>
          <p className="mt-2 text-[#647069]">{learning.state === "error" ? learning.message : "正在从 MySQL 读取知识点、错题、计划和报告。"}</p>
        </Panel>
      </div>
    );
  }

  const data = learning.data;

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-lg bg-[#17201b] p-4 text-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-[#2e6f57]">
            <Gauge aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-black">复读驾驶舱</p>
            <p className="truncate text-sm text-[#c4cec7]">{session.user.email}</p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-white/8 p-4">
          <p className="text-sm text-[#c4cec7]">当前身份</p>
          <p className="mt-2 text-2xl font-black">{roleLabels[session.user.role]}</p>
          <p className="mt-2 text-sm leading-6 text-[#dbe3dd]">{roleDescriptions[session.user.role]}</p>
        </div>
        <nav className="mt-6 grid gap-2 text-sm font-bold text-[#dbe3dd]">
          {["总览", "知识点", "错题诊断", "题源", "题目校对", "考试", "每日计划", "周报"].map((item) => (
            <a key={item} className="rounded-md px-3 py-3 hover:bg-white/10" href={`#${item}`}>
              {item}
            </a>
          ))}
        </nav>
        <div className="mt-6 grid gap-2">
          <Button className="bg-white text-[#17201b] hover:bg-[#eef2ec]" type="button" onClick={onRefresh}>
            <RefreshCw aria-hidden="true" className="size-4" />
            刷新数据
          </Button>
          <Button className="bg-[#2f3d35] text-white hover:bg-[#3d4b43]" type="button" onClick={onLogout}>
            <LogOut aria-hidden="true" className="size-4" />
            退出登录
          </Button>
        </div>
      </aside>

      <div className="grid content-start gap-4">
        <Hero data={data} />
        <MetricGrid data={data} />
        <KnowledgeMap apiClient={apiClient} data={data} token={session.token} onRefresh={onRefresh} />
        <AiWorkflows apiClient={apiClient} data={data} token={session.token} onRefresh={onRefresh} />
        <ReviewAndExam apiClient={apiClient} data={data} token={session.token} onRefresh={onRefresh} />
        <DailyPlan apiClient={apiClient} data={data} token={session.token} onRefresh={onRefresh} />
        <WeeklyReport data={data} />
      </div>
    </section>
  );
}
