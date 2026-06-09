export type UserRole = "owner" | "admin" | "user";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export interface LoginCredential {
  email: string;
  password: string;
}

export const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  admin: "管理员",
  user: "普通用户"
};

export const roleDescriptions: Record<UserRole, string> = {
  owner: "拥有系统设置、部署入口和成员管理的最高权限。",
  admin: "负责日常运维、项目维护和服务巡检。",
  user: "查看个人项目、服务状态和基础运行信息。"
};

export const demoAccounts: Array<UserAccount & { password: string }> = [
  {
    id: "owner-gavin",
    name: "Gavin",
    email: "owner@app.local",
    password: "owner123",
    role: "owner",
    title: "系统所有者"
  },
  {
    id: "admin-ops",
    name: "Ops Admin",
    email: "admin@app.local",
    password: "admin123",
    role: "admin",
    title: "运维管理员"
  },
  {
    id: "user-demo",
    name: "Demo User",
    email: "user@app.local",
    password: "user123",
    role: "user",
    title: "普通成员"
  }
];

export function authenticateDemoAccount({ email, password }: LoginCredential) {
  return demoAccounts.find((account) => account.email === email && account.password === password) ?? null;
}

export function toPublicAccount(account: UserAccount): UserAccount {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    title: account.title
  };
}
