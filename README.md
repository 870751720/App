# G18 App

这是一个用于网站、移动 App 和后端 API 的 React 技术栈项目骨架。

## 技术栈

- Monorepo：pnpm workspace
- 网站：React、Vite、TypeScript
- 移动 App：Expo、React Native、TypeScript
- 后端 API：Fastify、TypeScript
- 数据库：MySQL 8、Prisma
- 数据校验：Zod
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
pnpm --filter @g18/web dev
pnpm --filter @g18/api dev
pnpm --filter @g18/mobile dev
```

本地默认地址：

- 网站：http://localhost:5173
- API 健康检查：http://localhost:3001/health
