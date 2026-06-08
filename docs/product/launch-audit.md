# 首版上线验收审计

## 审计时间

2026-06-09

## 目标

验证“极客 IT 男生个人站”首版是否已经达到可体验状态：

- Web 有完整落地页。
- App 有对应信息架构和可编译首页。
- 自拟需求已文档化。
- 代码遵守现有架构边界。
- 服务器已部署并可访问。

## 当前线上版本

- Web：http://43.110.116.98
- API health：http://43.110.116.98/health
- Profile API：http://43.110.116.98/api/profile
- Profile API 兼容直连：http://43.110.116.98/profile

服务器容器：

```text
app-api-1     running
app-caddy-1   running
app-mysql-1   running healthy
app-web-1     running
```

## 验收项

| 验收项 | 证据 | 结论 |
| --- | --- | --- |
| Web 首屏和落地页完成 | `apps/web/src/App.tsx` 包含 Hero、Signal board、Stack、Projects、Journal、Contact；线上截图位于本地 `tmp/screenshots/online-mobile-profile.png` | 通过 |
| App 首页完成 | `apps/mobile/App.tsx` 包含 Hero、状态、Signals、Stack、Projects、Contact | 通过 |
| 需求文档化 | `docs/product/geek-it-profile.md` | 通过 |
| 展示内容集中管理 | `packages/domain/src/profile.ts` 暴露 `profileContent`，Web/App/API 共用 | 通过 |
| API 数据链路 | `GET /api/profile` 和 `GET /profile` 返回 profile 内容 | 通过 |
| 健康检查 | `GET /health` 返回 `{"status":"ok","service":"api"}` | 通过 |
| 构建验证 | `pnpm lint`、`pnpm typecheck`、`pnpm build` 通过 | 通过 |
| 服务器部署 | Docker Compose 中 web/api/mysql/caddy 均运行 | 通过 |
| CI 状态 | 最新 CI 成功；Docker Images workflow 成功完成 publish，并因 `DEPLOY_ENABLED` 未开启跳过 deploy | 通过 |

## 仍需后续处理

- GitHub Actions 自动部署需要在仓库配置 Secrets/Variables，并设置 `DEPLOY_ENABLED=true`。当前线上版本已通过手动兜底部署跑通。
- 移动 App 目前完成源码和类型检查，尚未进行 EAS/TestFlight/应用商店发布。
- 个人资料、项目链接、联系方式仍是首版占位内容，后续应替换为真实信息。
- 未接入域名和 HTTPS；当前使用服务器公网 IP 访问。

## 结论

首版已经达到“明天可体验”的最低完整版本：Web 在线可访问，API 和 profile 数据链路可用，App 首页可编译，需求和运维信息已文档化。
