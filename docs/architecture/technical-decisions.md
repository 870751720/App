# 技术方案与决策记录

本文档记录当前项目的技术选型、架构边界和暂不采用的方案。后续如果发生重要变更，应同步更新这里。

## 项目目标

当前目标是为个人使用 AI 辅助开发搭建一个可维护的基础工程，覆盖网站、移动 App、后端 API、数据库、CI/CD 和单机 Docker 部署。

项目不追求一开始就做成复杂平台，优先保证：

- 代码边界清楚。
- Web、App、API 可以独立开发和部署。
- 共享业务规则和接口契约，避免重复实现。
- GitHub 上可以自动检查、构建和发布镜像。
- 将来接入域名和服务器时不推翻现有结构。

## 总体架构

采用 pnpm workspace 管理的 monorepo：

```text
apps/
  web/
  mobile/
  api/
packages/
  domain/
  schemas/
  api-client/
  config/
infra/
  compose/
  caddy/
```

选择 monorepo 的原因：

- 个人开发时上下文集中，AI 更容易理解整体代码。
- Web、App、API 修改接口时可以在同一个提交里同步调整。
- 共享类型、校验 schema 和业务规则更直接。
- CI/CD 和工程配置可以统一维护。

## 应用分层

### apps/web

网站使用 React、Vite、TypeScript、Tailwind CSS、shadcn/ui、Radix UI、Motion for React 和 lucide-react。

职责：

- 页面展示。
- 浏览器交互。
- 调用 `packages/api-client` 访问后端。
- 按 mobile-first 响应式方式支持手机、平板和桌面浏览器。

不放：

- 数据库访问。
- 后端业务流程。
- 可复用的核心业务规则。

样式和组件决策：

- Tailwind CSS 作为 Web 主样式方案。
- shadcn/ui 作为 Web 组件组织方式，组件源码归项目所有。
- Radix UI 作为可访问交互组件的底层基础。
- Motion for React 作为 Web 动效方案。
- lucide-react 作为 Web 图标方案。

响应式原则：

- 默认先实现手机布局，再通过断点增强到平板和桌面。
- 按钮、表单、导航和弹层必须支持触屏操作。
- 避免只依赖 hover 的交互。
- 重要页面需要在手机宽度下验证文字不溢出、内容不重叠。
- Web UI 和移动 App UI 不强行共用；共享范围限于业务类型、schema、业务规则和 API client。

### apps/mobile

移动 App 使用 Expo、React Native 和 TypeScript。

职责：

- iOS/Android 端 UI。
- 移动端交互。
- 调用 `packages/api-client` 访问后端。

移动 App 不进入 Docker Compose 部署链路，后续发布走 Expo/EAS、TestFlight 或应用商店。

### apps/api

后端使用 Fastify 和 TypeScript。

职责：

- 对外提供 HTTP API。
- 连接 MySQL。
- 执行业务用例。
- 隔离数据库、外部服务和后端运行时细节。

选择 Fastify 的原因：

- 对个人项目足够轻量。
- 启动快，结构清晰。
- 不需要 NestJS 那种偏团队协作和大型模块体系的框架重量。

## 共享包

### packages/domain

放共享业务规则和领域类型。

适合放：

- 权限判断。
- 状态计算。
- 可被 Web、App、API 共用的纯业务逻辑。

不适合放：

- UI 组件。
- 数据库访问。
- HTTP 请求。
- 平台 API。

### packages/schemas

使用 Zod 管理共享数据校验 schema。

适合放：

- 请求参数 schema。
- 响应数据 schema。
- 表单校验 schema。

这样 Web、App、API 可以共享同一套数据契约。

### packages/api-client

封装 Web 和 App 调用后端 API 的客户端。

职责：

- 统一 API 请求路径。
- 解析和校验 API 响应。
- 隔离 fetch 调用细节。

### packages/config

放共享工程配置，例如 TypeScript 基础配置。

## 数据库与 ORM

数据库选择 MySQL 8。

ORM 选择 Prisma。

选择 Prisma 的原因：

- schema 文件直观，适合个人和 AI 协作阅读。
- TypeScript 类型生成友好。
- 数据库结构迁移更规范。
- 早期能减少手写 SQL 的重复和字段错误。

复杂统计或性能敏感查询后续可以补充原生 SQL，但默认业务读写优先走 Prisma。

## 部署方案

采用单机 Docker Compose，不使用 Kubernetes。

生产部署目标：

```text
Caddy
  -> web
  -> api
api
  -> mysql
```

选择 Docker Compose 的原因：

- 单机部署足够。
- 运维成本低。
- 服务关系清楚。
- 未来换服务器也容易迁移。

## 反向代理

选择 Caddy。

选择 Caddy 的原因：

- 配置短。
- 接入域名后自动 HTTPS。
- 适合个人项目和单机部署。

当前没有正式域名时，可以先用 IP 或 localhost。域名确定后再更新 Caddyfile 和服务器环境变量。

## CI/CD 与镜像仓库

CI/CD 使用 GitHub Actions。

镜像仓库使用 GitHub Container Registry，也就是 `ghcr.io`。

当前流水线分两类：

- `ci.yml`：安装依赖、lint、typecheck、build。
- `docker.yml`：构建 Web/API Docker 镜像并推送到 GHCR，然后通过 SSH 自动部署到单机服务器。

自动部署流程由 GitHub Actions 负责：

- 在 GitHub Actions 中生成生产 `.env`。
- 同步 `docker-compose.prod.yml` 和 `Caddyfile` 到服务器部署目录。
- 在服务器上登录 GHCR、拉取当前提交的镜像并重启 Docker Compose 服务。

服务器只保留运行时状态和 Docker volume，不手动维护生产 `.env`，也不手动执行 GHCR 登录。

## 配置与密钥管理

项目统一使用 GitHub Actions 的 Secrets 和 Variables 管理 CI/CD 配置，类似 GitLab 的 CI/CD Variables。

个人访问令牌（PAT）用于本机持续 GitHub 操作时，存放在仓库根目录外观路径下的本地文件 `D:\App\.secrets\github.env`。该文件使用 `GITHUB_TOKEN=...` 格式，只保存在本机，`.secrets/` 已加入 `.gitignore`，禁止提交到仓库，也不复制到服务器部署目录。

需要在 PowerShell 中使用该令牌时，从本地文件读取到当前进程环境变量：

```powershell
$env:GITHUB_TOKEN = (Get-Content D:\App\.secrets\github.env | Where-Object { $_ -like 'GITHUB_TOKEN=*' }).Split('=', 2)[1]
```

文档只记录存储位置和读取方式，不记录令牌明文。仓库推送优先使用本机 SSH 凭据；需要调用 GitHub API 或配置仓库资源时，再从该文件读取 PAT。

敏感信息放 GitHub Actions Secrets，例如：

- `DATABASE_URL`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `SERVER_HOST`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`

非敏感配置放 GitHub Actions Variables，例如：

- `API_PORT`
- `COMPOSE_PROJECT_NAME`
- `DEPLOY_ENABLED`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `SERVER_PORT`
- `SITE_ADDRESS`
- `WEB_ORIGIN`
- `DEPLOY_PATH`
- `WEB_IMAGE`
- `API_IMAGE`

`DEPLOY_ENABLED` 用于控制 `docker.yml` 的自动部署 job。未配置生产 Secrets 时保持关闭；配置完成后设为 `true`，镜像发布成功后才会通过 SSH 部署到服务器。

后续如果区分开发、测试和生产环境，使用 GitHub Environments 管理环境级 secrets 和 variables。生产环境可以开启部署审批，避免生产密钥在非生产流程中暴露。

本地开发仍使用 `.env.example` 说明需要哪些配置，真实 `.env` 文件不提交到 Git。
