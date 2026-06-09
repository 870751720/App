import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Gauge,
  LockKeyhole,
  LogOut,
  Server,
  ShieldCheck
} from "lucide-react";
import { createApiClient } from "@app/api-client";
import {
  canUseAction,
  roleDescriptions,
  roleLabels,
  type UserRole
} from "@app/domain";
import type { AuthSessionResponse, HealthStatus, OperationsOverviewResponse } from "@app/schemas";
import { Button } from "./components/ui/button";

type SessionState =
  | { state: "anonymous" }
  | { state: "loading"; token: string }
  | { state: "authenticated"; session: AuthSessionResponse }
  | { state: "error"; message: string };

type HealthView =
  | { state: "loading" }
  | { state: "ready"; data: HealthStatus }
  | { state: "error"; message: string };

type OverviewView =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; data: OperationsOverviewResponse }
  | { state: "error"; message: string };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
const sessionStorageKey = "app.session.token";

export function App() {
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), []);
  const [session, setSession] = useState<SessionState>({ state: "anonymous" });
  const [health, setHealth] = useState<HealthView>({ state: "loading" });
  const [overview, setOverview] = useState<OverviewView>({ state: "idle" });

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth({ state: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealth({
            state: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

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
      .then((user) => {
        if (isMounted) {
          setSession({ state: "authenticated", session: { token, user } });
        }
      })
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
      setOverview({ state: "idle" });
      return;
    }

    let isMounted = true;
    setOverview({ state: "loading" });

    apiClient
      .getOperationsOverview(session.session.token)
      .then((data) => {
        if (isMounted) {
          setOverview({ state: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setOverview({
            state: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient, session]);

  async function handleLogin(email: string, password: string) {
    setSession({ state: "loading", token: "" });

    try {
      const nextSession = await apiClient.login(email, password);
      window.localStorage.setItem(sessionStorageKey, nextSession.token);
      setSession({ state: "authenticated", session: nextSession });
    } catch (error) {
      setSession({
        state: "error",
        message: error instanceof Error ? error.message : "登录失败"
      });
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(sessionStorageKey);
    setSession({ state: "anonymous" });
    setOverview({ state: "idle" });
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#17202a]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {session.state === "authenticated" ? (
          <Dashboard
            health={health}
            overview={overview}
            session={session.session}
            onLogout={handleLogout}
          />
        ) : (
          <LoginScreen health={health} session={session} onLogin={handleLogin} />
        )}
      </div>
    </main>
  );
}

function LoginScreen({
  health,
  session,
  onLogin
}: {
  health: HealthView;
  session: SessionState;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = session.state === "loading";

  return (
    <section className="grid content-center gap-6 py-6 lg:grid-cols-2 lg:items-center">
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#1f6feb]/20 bg-white px-3 py-2 text-sm font-bold text-[#1f6feb] shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Personal Ops Console
        </div>
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-normal text-[#101820] sm:text-5xl lg:text-6xl">
          访问控制台
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#516071] sm:text-lg">
          使用授权账号登录，进入受保护的运维工作区。
        </p>
        <div className="mt-8 grid max-w-xl gap-3">
          <div className="rounded-lg border border-[#d7dee8] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#66758a]">Access</p>
            <p className="mt-2 text-xl font-black text-[#101820]">Owner / Admin / User</p>
            <p className="mt-2 text-sm leading-6 text-[#66758a]">权限由后端会话解析，登录后按角色显示可用操作。</p>
          </div>
        </div>
      </div>

      <form
        className="w-full max-w-[440px] rounded-lg border border-[#d7dee8] bg-white p-5 shadow-xl shadow-[#223044]/10 lg:justify-self-end"
        onSubmit={(event) => {
          event.preventDefault();
          void onLogin(email, password);
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#edf1f5] pb-5">
          <div>
            <h2 className="text-xl font-black text-[#101820]">登录</h2>
            <p className="mt-1 text-sm text-[#66758a]">输入账号凭据继续。</p>
          </div>
          <span className="grid size-11 place-items-center rounded-md bg-[#101820] text-white">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </span>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-[#344054]">邮箱</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#cfd8e3] px-3 text-base outline-none transition focus:border-[#1f6feb] focus:ring-4 focus:ring-[#1f6feb]/10"
            value={email}
            type="email"
            autoComplete="username"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-[#344054]">密码</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#cfd8e3] px-3 text-base outline-none transition focus:border-[#1f6feb] focus:ring-4 focus:ring-[#1f6feb]/10"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {session.state === "error" ? (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-[#fda29b] bg-[#fff1f0] p-3 text-sm text-[#b42318]">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 flex-none" />
            <span>{session.message}</span>
          </div>
        ) : null}

        <Button className="mt-5 h-12 w-full" size="lg" type="submit" disabled={isLoading}>
          <LockKeyhole aria-hidden="true" className="size-4" />
          {isLoading ? "登录中" : "进入控制台"}
        </Button>

        <div className="mt-5 rounded-md bg-[#f7f9fb] p-3">
          <StatusRow label="API Health" value={renderHealth(health)} tone={health.state === "error" ? "error" : "ready"} />
        </div>
      </form>
    </section>
  );
}

function Dashboard({
  health,
  overview,
  session,
  onLogout
}: {
  health: HealthView;
  overview: OverviewView;
  session: AuthSessionResponse;
  onLogout: () => void;
}) {
  const user = session.user;

  return (
    <section className="grid gap-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[#d7dee8] bg-[#101820] p-4 text-white lg:min-h-[calc(100vh-2rem)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-[#1f6feb]">
            <Gauge aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-black">Ops Console</p>
            <p className="truncate text-sm text-[#b8c3cf]">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-white/8 p-4">
          <p className="text-sm text-[#b8c3cf]">当前身份</p>
          <p className="mt-2 text-2xl font-black">{roleLabels[user.role]}</p>
          <p className="mt-2 text-sm leading-6 text-[#d7dee8]">{roleDescriptions[user.role]}</p>
        </div>

        <nav className="mt-6 grid gap-2 text-sm font-bold text-[#d7dee8]">
          <a className="rounded-md bg-white/10 px-3 py-3 text-white" href="#overview">
            状态总览
          </a>
          <a className="rounded-md px-3 py-3 hover:bg-white/10" href="#services">
            服务
          </a>
          <a className="rounded-md px-3 py-3 hover:bg-white/10" href="#projects">
            项目
          </a>
          <a className="rounded-md px-3 py-3 hover:bg-white/10" href="#actions">
            权限动作
          </a>
        </nav>

        <Button className="mt-6 w-full bg-white text-[#101820] hover:bg-[#edf1f5]" type="button" onClick={onLogout}>
          <LogOut aria-hidden="true" className="size-4" />
          退出登录
        </Button>
      </aside>

      <div className="grid content-start gap-4">
        <header id="overview" className="rounded-lg border border-[#d7dee8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-[#1f6feb]">你好，{user.name}</p>
              <h1 className="mt-2 text-3xl font-black text-[#101820] sm:text-4xl">个人运维系统</h1>
              <p className="mt-2 max-w-2xl leading-7 text-[#66758a]">
                管理服务器运行状态、部署链路、项目阶段和按角色开放的操作入口。
              </p>
            </div>
            <div className="grid gap-2 rounded-md bg-[#f7f9fb] p-3 sm:min-w-72">
              <StatusRow label="API" value={renderHealth(health)} tone={health.state === "error" ? "error" : "ready"} />
              <StatusRow label="Role" value={roleLabels[user.role]} tone="neutral" />
            </div>
          </div>
        </header>

        {overview.state === "ready" ? (
          <>
            <MetricGrid overview={overview.data} />
            <ServicesSection overview={overview.data} />
            <ProjectsSection overview={overview.data} />
            <ActionsSection overview={overview.data} role={user.role} />
          </>
        ) : (
          <LoadingOverview overview={overview} />
        )}
      </div>
    </section>
  );
}

function MetricGrid({ overview }: { overview: OperationsOverviewResponse }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {overview.metrics.map((metric) => (
        <Panel key={metric.label}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#66758a]">{metric.label}</p>
              <p className="mt-2 text-2xl font-black text-[#101820]">{metric.value}</p>
              <p className="mt-2 text-sm leading-6 text-[#66758a]">{metric.detail}</p>
            </div>
            <StateIcon state={metric.state} />
          </div>
        </Panel>
      ))}
    </section>
  );
}

function ServicesSection({ overview }: { overview: OperationsOverviewResponse }) {
  return (
    <Section id="services" icon={<Server aria-hidden="true" className="size-5" />} title="服务状态">
      <div className="grid gap-3 lg:grid-cols-2">
        {overview.services.map((service) => (
          <Panel key={service.name}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="break-words text-xl font-black text-[#101820]">{service.name}</h3>
                <p className="mt-2 text-sm font-bold text-[#1f6feb]">{service.target}</p>
                <p className="mt-2 leading-7 text-[#66758a]">{service.detail}</p>
              </div>
              <StateIcon state={service.state} />
            </div>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

function ProjectsSection({ overview }: { overview: OperationsOverviewResponse }) {
  return (
    <Section id="projects" icon={<Boxes aria-hidden="true" className="size-5" />} title="项目">
      <div className="grid gap-3 xl:grid-cols-3">
        {overview.projects.map((project) => (
          <Panel key={project.name}>
            <p className="text-sm font-bold text-[#1f6feb]">{project.stage}</p>
            <h3 className="mt-3 text-xl font-black text-[#101820]">{project.name}</h3>
            <p className="mt-3 leading-7 text-[#66758a]">{project.summary}</p>
            <p className="mt-4 inline-flex rounded-md bg-[#eef5ff] px-3 py-1 text-sm font-bold text-[#1f6feb]">
              {roleLabels[project.ownerRole]}
            </p>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

function ActionsSection({ overview, role }: { overview: OperationsOverviewResponse; role: UserRole }) {
  return (
    <Section id="actions" icon={<ShieldCheck aria-hidden="true" className="size-5" />} title="权限动作">
      <div className="grid gap-3 lg:grid-cols-3">
        {overview.actions.map((action) => {
          const isAllowed = canUseAction(role, action.minimumRole);

          return (
            <button
              key={action.label}
              type="button"
              disabled={!isAllowed}
              className="min-h-44 rounded-lg border border-[#d7dee8] bg-white p-5 text-left shadow-sm transition enabled:hover:border-[#1f6feb] enabled:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#66758a]">需要 {roleLabels[action.minimumRole]}</p>
                  <h3 className="mt-3 text-xl font-black text-[#101820]">{action.label}</h3>
                </div>
                <ChevronRight aria-hidden="true" className="size-5 text-[#1f6feb]" />
              </div>
              <p className="mt-4 leading-7 text-[#66758a]">{action.description}</p>
              <p className="mt-4 text-sm font-black text-[#101820]">{isAllowed ? "可用" : "权限不足"}</p>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function LoadingOverview({ overview }: { overview: OverviewView }) {
  return (
    <Panel>
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <Activity aria-hidden="true" className="size-7 animate-pulse text-[#1f6feb]" />
        <p className="font-black text-[#101820]">
          {overview.state === "error" ? "运维数据加载失败" : "正在加载运维数据"}
        </p>
        <p className="max-w-md text-sm leading-6 text-[#66758a]">
          {overview.state === "error" ? overview.message : "正在从 API 获取登录后的控制台数据。"}
        </p>
      </div>
    </Panel>
  );
}

function Section({
  id,
  icon,
  title,
  children
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="grid gap-3">
      <div className="flex items-center gap-2 text-[#101820]">
        <span className="grid size-9 place-items-center rounded-md bg-[#e8eef5]">{icon}</span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-[#d7dee8] bg-white p-5 shadow-sm">{children}</div>;
}

function StatusRow({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "ready" | "error" | "neutral";
}) {
  const toneClass = tone === "ready" ? "bg-[#12b76a]" : tone === "error" ? "bg-[#f04438]" : "bg-[#f79009]";

  return (
    <div className="flex min-h-10 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm font-bold text-[#66758a]">{label}</span>
      <span className="inline-flex min-w-0 items-center gap-2 text-left text-sm font-black text-[#101820] sm:text-right">
        <span className={`size-2.5 flex-none rounded-full ${toneClass}`} />
        <span className="break-words">{value}</span>
      </span>
    </div>
  );
}

function StateIcon({ state }: { state: "healthy" | "warning" | "offline" }) {
  if (state === "healthy") {
    return <CheckCircle2 aria-hidden="true" className="size-5 flex-none text-[#12b76a]" />;
  }

  if (state === "warning") {
    return <CircleAlert aria-hidden="true" className="size-5 flex-none text-[#f79009]" />;
  }

  return <CircleAlert aria-hidden="true" className="size-5 flex-none text-[#f04438]" />;
}

function renderHealth(health: HealthView) {
  if (health.state === "loading") {
    return "checking";
  }

  if (health.state === "error") {
    return health.message;
  }

  return `ok ${new Date(health.data.checkedAt).toLocaleTimeString()}`;
}
