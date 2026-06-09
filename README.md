# 当前演示账号

第一版登录系统使用本地演示账号跑通 Owner、管理员、普通用户三层角色，后续再接入数据库用户表和正式密码策略。

```text
Owner: owner@app.local / owner123
管理员: admin@app.local / admin123
普通用户: user@app.local / user123
```

# App

这是一个用于网站、移动 App 和后端 API 的 React 技术栈项目骨架。

## 技术栈

- Monorepo：pnpm workspace
- 网站：React、Vite、TypeScript、Tailwind CSS、shadcn/ui、Motion for React
- 移动 App：Expo、React Native、TypeScript
- 后端 API：Fastify、TypeScript
- 数据库：MySQL 8、Prisma
- 数据校验：Zod
- 图标：lucide-react
- 部署：Docker Compose、Caddy
- CI/CD：GitHub Actions、GitHub Container Registry

详细技术方案和决策记录见 [docs/architecture/technical-decisions.md](docs/architecture/technical-decisions.md)。

## 目录结构

```text
apps/
  web/        # React 网站
  mobile/     # Expo 移动 App
  api/        # Fastify 后端 API
packages/
  domain/     # 共享业务规则和类型
  schemas/    # 共享数据校验 schema
  api-client/ # Web/App 调用后端的 API 客户端
  config/     # 共享 TypeScript 配置
infra/
  compose/    # Docker Compose 配置
  caddy/      # Caddy 反向代理配置
```

## 常用命令

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```

单独启动应用：

```bash
pnpm --filter @app/web dev
pnpm --filter @app/api dev
pnpm --filter @app/mobile dev
```

本地默认地址：

- 网站：http://localhost:5173
- API 健康检查：http://localhost:3001/health

## 前端原则

Web 页面按 mobile-first 响应式设计实现，必须兼容手机浏览器。移动 App 使用 React Native 自己的 UI 和样式体系，不与 Web 强行共用界面组件。
