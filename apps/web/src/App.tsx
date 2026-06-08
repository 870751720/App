import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Boxes,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Radio,
  Rocket,
  Terminal,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import { createApiClient } from "@app/api-client";
import {
  contactPreference,
  getPublicAppStatus,
  profileContent,
  type ProfileContent
} from "@app/domain";
import heroImage from "./assets/geek-workstation-hero.png";
import { Button } from "./components/ui/button";

type HealthView =
  | { state: "loading" }
  | { state: "ready"; checkedAt: string }
  | { state: "error"; message: string };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function App() {
  const [health, setHealth] = useState<HealthView>({ state: "loading" });
  const [profile, setProfile] = useState<ProfileContent>(profileContent);
  const publicStatus = getPublicAppStatus(false);
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getHealth()
      .then((result) => {
        if (isMounted) {
          setHealth({ state: "ready", checkedAt: result.checkedAt });
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

    apiClient
      .getProfile()
      .then((result) => {
        if (isMounted) {
          setProfile(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(profileContent);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  return (
    <main className="min-h-screen bg-[#0c1117] text-slate-100">
      <Hero health={health} profile={profile} publicStatus={publicStatus} />
      <SignalBoard health={health} profile={profile} publicStatus={publicStatus} />
      <StackSection profile={profile} />
      <ProjectsSection profile={profile} />
      <JournalSection profile={profile} />
      <ContactSection profile={profile} />
    </main>
  );
}

function Hero({
  health,
  profile,
  publicStatus
}: {
  health: HealthView;
  profile: ProfileContent;
  publicStatus: string;
}) {
  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden border-b border-white/10">
      <img
        src={heroImage}
        alt="Night workstation with code dashboards and server gear"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0c1117_0%,rgba(12,17,23,0.92)_34%,rgba(12,17,23,0.62)_68%,rgba(12,17,23,0.34)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0c1117] to-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col justify-between px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2 text-sm font-bold">
            <span className="grid size-9 place-items-center rounded-md bg-teal-400 text-slate-950">
              <Terminal aria-hidden="true" className="size-5" />
            </span>
            <span>Builder OS</span>
          </a>
          <div className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
            <a className="hover:text-white" href="#stack">
              Stack
            </a>
            <a className="hover:text-white" href="#projects">
              Projects
            </a>
            <a className="hover:text-white" href="#journal">
              Journal
            </a>
          </div>
        </nav>

        <div id="top" className="grid gap-8 pb-10 pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-[22rem] sm:max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-sm font-semibold text-teal-200">
              <Radio aria-hidden="true" className="size-4" />
              {profile.hero.handle}
            </p>
            <h1 className="text-[2rem] font-black leading-tight text-white [word-break:break-all] sm:text-5xl lg:text-7xl">
              {profile.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 [word-break:break-all] sm:text-lg">
              {profile.hero.summary}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#projects">
                  <Rocket aria-hidden="true" className="size-4" />
                  {profile.hero.primaryAction}
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#status">
                  <Activity aria-hidden="true" className="size-4" />
                  {profile.hero.secondaryAction}
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
            className="grid gap-3 rounded-lg border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur"
            aria-label="Live system status"
          >
            <StatusLine label="Public status" value={publicStatus} tone="ready" />
            <StatusLine
              label="API health"
              value={renderHealth(health)}
              tone={health.state === "error" ? "error" : "ready"}
            />
            <StatusLine label="Deploy target" value="43.110.116.98" tone="neutral" />
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function SignalBoard({
  health,
  profile,
  publicStatus
}: {
  health: HealthView;
  profile: ProfileContent;
  publicStatus: string;
}) {
  return (
    <section id="status" className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
      <Panel className="lg:col-span-1">
        <div className="flex items-center gap-3">
          <CheckCircle2 aria-hidden="true" className="size-5 text-teal-300" />
          <div>
            <p className="text-sm text-slate-400">Runtime</p>
            <p className="mt-1 font-semibold text-white">
              {publicStatus} / {renderHealth(health)}
            </p>
          </div>
        </div>
      </Panel>
      {profile.metrics.map((metric) => (
        <Panel key={metric.label}>
          <p className="text-sm text-slate-400">{metric.label}</p>
          <p className="mt-2 text-xl font-black text-white">{metric.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{metric.detail}</p>
        </Panel>
      ))}
    </section>
  );
}

function StackSection({ profile }: { profile: ProfileContent }) {
  return (
    <section id="stack" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        icon={<Cpu aria-hidden="true" className="size-5" />}
        title="技术栈"
        summary="偏实战的全栈组合，优先服务快速验证、清晰边界和单机部署。"
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {profile.stackAreas.map((area) => (
          <Panel key={area.title}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">{area.title}</h3>
                <p className="mt-2 leading-7 text-slate-300">{area.summary}</p>
              </div>
              <Boxes aria-hidden="true" className="size-5 flex-none text-amber-300" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {area.tools.map((tool) => (
                <span key={tool} className="rounded-md bg-white/[0.08] px-3 py-1 text-sm text-slate-200">
                  {tool}
                </span>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ profile }: { profile: ProfileContent }) {
  return (
    <section id="projects" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        icon={<Rocket aria-hidden="true" className="size-5" />}
        title="项目"
        summary="首版先展示可继续迭代的项目方向，后续可以替换为真实仓库、截图和线上地址。"
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {profile.projects.map((project) => (
          <Panel key={project.name} className="flex min-h-64 flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-200">{project.status}</p>
              <h3 className="mt-3 text-2xl font-black text-white">{project.name}</h3>
              <p className="mt-3 leading-7 text-slate-300">{project.summary}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-white/10 px-3 py-1 text-sm text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}

function JournalSection({ profile }: { profile: ProfileContent }) {
  return (
    <section id="journal" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        icon={<BookOpen aria-hidden="true" className="size-5" />}
        title="构建日志"
        summary="把关键迭代记录下来，方便第二天继续接着做，而不是靠记忆恢复上下文。"
      />
      <div className="mt-6 grid gap-3">
        {profile.journalEntries.map((entry) => (
          <Panel key={`${entry.date}-${entry.title}`} className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
            <time className="text-sm font-semibold text-amber-200">{entry.date}</time>
            <div>
              <h3 className="font-bold text-white">{entry.title}</h3>
              <p className="mt-2 leading-7 text-slate-300">{entry.summary}</p>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ profile }: { profile: ProfileContent }) {
  const contactPreference = profile.contactPreference;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="grid gap-5 rounded-lg border border-teal-300/20 bg-teal-300/10 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-200">
            <Zap aria-hidden="true" className="size-4" />
            Contact
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">{contactPreference.title}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{contactPreference.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {contactPreference.channels.map((channel) => (
              <span key={channel} className="rounded-md bg-slate-950/70 px-3 py-1 text-sm text-slate-200">
                {channel}
              </span>
            ))}
          </div>
        </div>
        <Button asChild size="lg">
          <a href="https://github.com/870751720/App" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" className="size-4" />
            GitHub
          </a>
        </Button>
      </div>
    </section>
  );
}

function SectionHeader({
  icon,
  title,
  summary
}: {
  icon: ReactNode;
  title: string;
  summary: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="flex items-center gap-2 text-sm font-semibold text-teal-200">
        {icon}
        {title}
      </p>
      <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 leading-7 text-slate-300">{summary}</p>
    </div>
  );
}

function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-5 ${className}`}>
      {children}
    </div>
  );
}

function StatusLine({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "ready" | "error" | "neutral";
}) {
  const toneClass =
    tone === "ready" ? "bg-teal-300" : tone === "error" ? "bg-rose-400" : "bg-amber-300";

  return (
    <div className="flex min-h-16 items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.04] px-4">
      <div className="min-w-0">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
      </div>
      <span className={`size-2.5 flex-none rounded-full ${toneClass}`} />
    </div>
  );
}

function renderHealth(health: HealthView) {
  if (health.state === "loading") {
    return "checking";
  }

  if (health.state === "error") {
    return health.message;
  }

  return `ok ${new Date(health.checkedAt).toLocaleTimeString()}`;
}
