export interface ProfileMetric {
  label: string;
  value: string;
  detail: string;
}

export interface StackArea {
  title: string;
  summary: string;
  tools: string[];
}

export interface ProfileProject {
  name: string;
  summary: string;
  status: string;
  tags: string[];
}

export interface JournalEntry {
  date: string;
  title: string;
  summary: string;
}

export const profileHero = {
  handle: "Night-shift builder",
  title: "把想法打磨成能上线的产品系统",
  summary:
    "一个偏工程实战的 IT 男生个人站：关注 React、移动端、后端 API、Docker 部署和 AI 辅助开发，把灵感整理成可运行、可维护、可继续迭代的版本。",
  primaryAction: "查看项目",
  secondaryAction: "检查在线状态"
} as const;

export const profileMetrics: ProfileMetric[] = [
  {
    label: "当前节奏",
    value: "Ship nightly",
    detail: "小步构建、当天验证、持续部署"
  },
  {
    label: "技术偏好",
    value: "TypeScript first",
    detail: "共享契约、类型检查、清晰边界"
  },
  {
    label: "部署方式",
    value: "Single-node Docker",
    detail: "Caddy、Compose、GHCR、SSH 自动部署"
  }
];

export const stackAreas: StackArea[] = [
  {
    title: "Frontend",
    summary: "构建移动优先、可读性强、状态清晰的 Web 体验。",
    tools: ["React", "Vite", "Tailwind CSS", "Motion"]
  },
  {
    title: "Backend",
    summary: "用轻量 API 和共享 schema 保持前后端契约一致。",
    tools: ["Fastify", "Prisma", "MySQL", "Zod"]
  },
  {
    title: "Mobile",
    summary: "保留移动端原生交互，不强行复用 Web UI。",
    tools: ["Expo", "React Native", "TypeScript"]
  },
  {
    title: "Infra",
    summary: "用简单可迁移的单机部署承载早期产品验证。",
    tools: ["Docker", "Caddy", "GitHub Actions", "GHCR"]
  }
];

export const profileProjects: ProfileProject[] = [
  {
    name: "Personal Launchpad",
    summary: "个人主页、项目清单、状态面板和联系入口的统一入口。",
    status: "首版构建中",
    tags: ["Web", "Portfolio", "Deploy"]
  },
  {
    name: "AI Dev Console",
    summary: "记录需求、任务、部署和验证结果的工程工作台概念。",
    status: "需求整理",
    tags: ["AI", "Workflow", "Docs"]
  },
  {
    name: "Pocket Status",
    summary: "移动端查看服务状态、项目摘要和下一步计划的随身面板。",
    status: "App 同步",
    tags: ["Expo", "Mobile", "Status"]
  }
];

export const journalEntries: JournalEntry[] = [
  {
    date: "2026-06-09",
    title: "单机部署链路打通",
    summary: "用 GitHub Actions 构建 Web/API 镜像，再通过 SSH 在服务器拉取并重启 Compose。"
  },
  {
    date: "2026-06-09",
    title: "去掉临时业务命名",
    summary: "将猜测生成的项目命名替换为中性命名，为后续真实品牌留出空间。"
  },
  {
    date: "2026-06-09",
    title: "首版个人站内容归档",
    summary: "把自拟页面需求和展示内容集中管理，避免 UI 中散落不可追踪的文案。"
  }
];

export const contactPreference = {
  title: "异步优先，结果导向",
  summary:
    "适合聊产品原型、全栈实现、部署排障和 AI 辅助开发工作流。先把目标和当前阻塞说清楚，再进入实现细节。",
  channels: ["GitHub", "Email", "Issue-first collaboration"]
} as const;
