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
  user: "学生"
};

export const roleDescriptions: Record<UserRole, string> = {
  owner: "拥有系统配置、学习档案和数据导入的最高权限。",
  admin: "负责复读计划维护、题源整理和学习报告查看。",
  user: "查看个人学习任务、错题、掌握度和复盘报告。"
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
    name: "Learning Admin",
    email: "admin@app.local",
    password: "admin123",
    role: "admin",
    title: "学习管理员"
  },
  {
    id: "user-demo",
    name: "复读学生",
    email: "user@app.local",
    password: "user123",
    role: "user",
    title: "复读学生"
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
