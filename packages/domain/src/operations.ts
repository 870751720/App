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

export interface OperationsOverview {
  generatedAt: string;
  metrics: OperationMetric[];
  services: ManagedService[];
  projects: ProjectEntry[];
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
    metrics: [
      {
        label: "API",
        value: "在线",
        detail: "Fastify health check 正常响应",
        state: "healthy"
      },
      {
        label: "Web",
        value: "运行中",
        detail: "Caddy 正在转发到 Web 容器",
        state: "healthy"
      },
      {
        label: "部署",
        value: "GHCR",
        detail: "镜像由 GitHub Actions 构建并推送",
        state: "healthy"
      },
      {
        label: "服务器",
        value: "43.110.116.98",
        detail: "单机 Docker Compose 部署",
        state: "warning"
      }
    ],
    services: [
      {
        name: "caddy",
        target: "80 -> web/api",
        state: "healthy",
        detail: "入口反向代理"
      },
      {
        name: "web",
        target: "nginx static",
        state: "healthy",
        detail: "React 管理界面"
      },
      {
        name: "api",
        target: "3001",
        state: "healthy",
        detail: "认证、健康检查和运维数据"
      },
      {
        name: "mysql",
        target: "internal",
        state: "warning",
        detail: "预留给用户、权限和审计记录"
      }
    ],
    projects: [
      {
        name: "个人运维系统",
        stage: "第一版",
        summary: "先完成登录、角色和状态面板，再接真实数据库与部署记录。",
        ownerRole: "owner"
      },
      {
        name: "CI/CD 自动部署",
        stage: "已打通",
        summary: "GitHub Actions 构建镜像，服务器只拉取镜像并运行。",
        ownerRole: "admin"
      },
      {
        name: "移动端状态查看",
        stage: "雏形",
        summary: "手机端保留健康检查和角色视图，后续可做推送提醒。",
        ownerRole: "user"
      }
    ],
    actions: [
      {
        label: "成员管理",
        description: "创建账号、调整角色、停用访问权限。",
        minimumRole: "owner"
      },
      {
        label: "部署控制",
        description: "查看版本、触发部署、回滚到上一镜像。",
        minimumRole: "admin"
      },
      {
        label: "服务巡检",
        description: "查看服务健康、容器状态和最近异常。",
        minimumRole: "user"
      }
    ]
  };
}
