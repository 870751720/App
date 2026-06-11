import type { UserRole } from "./identity.js";

export type OperationState = "healthy" | "warning" | "offline";

export interface OperationMetric {
  label: string;
  value: string;
  detail: string;
  state: OperationState;
}

export interface ManagedService {
  name: string;
  target: string;
  state: OperationState;
  detail: string;
}

export interface ProjectEntry {
  name: string;
  stage: string;
  summary: string;
  ownerRole: UserRole;
}

export interface OperationAction {
  label: string;
  description: string;
  minimumRole: UserRole;
}

export interface RuntimeEnvironment {
  name: string;
  publicUrl: string;
  serverHost: string;
  deployMode: string;
}

export interface ReleaseSnapshot {
  version: string;
  source: string;
  imageTag: string;
  deployedAt: string;
}

export type IncidentSeverity = "info" | "warning" | "critical";

export interface OperationsIncident {
  title: string;
  severity: IncidentSeverity;
  status: string;
  updatedAt: string;
  summary: string;
}

export interface OperationsOverview {
  generatedAt: string;
  environment: RuntimeEnvironment;
  release: ReleaseSnapshot;
  metrics: OperationMetric[];
  services: ManagedService[];
  projects: ProjectEntry[];
  incidents: OperationsIncident[];
  actions: OperationAction[];
}

export const roleRank: Record<UserRole, number> = {
  user: 1,
  admin: 2,
  owner: 3
};

export function canUseAction(role: UserRole, minimumRole: UserRole) {
  return roleRank[role] >= roleRank[minimumRole];
}

export function getOperationsOverview(checkedAt = new Date()): OperationsOverview {
  return {
    generatedAt: checkedAt.toISOString(),
    environment: {
      name: "Local",
      publicUrl: "http://localhost:5173",
      serverHost: "localhost",
      deployMode: "pnpm workspace"
    },
    release: {
      version: "development",
      source: "local worktree",
      imageTag: "not-built",
      deployedAt: checkedAt.toISOString()
    },
    metrics: [
      {
        label: "API",
        value: "online",
        detail: "Fastify health check is available.",
        state: "healthy"
      }
    ],
    services: [
      {
        name: "learning-api",
        target: "/learning/*",
        state: "healthy",
        detail: "Learning profile, question source, mistake diagnosis and planning APIs."
      }
    ],
    projects: [
      {
        name: "复读学习系统",
        stage: "active",
        summary: "围绕知识点画像、错题归因、题源导入和每日计划构建。",
        ownerRole: "owner"
      }
    ],
    incidents: [],
    actions: [
      {
        label: "学习数据维护",
        description: "导入题源、生成计划和查看周报。",
        minimumRole: "user"
      }
    ]
  };
}
