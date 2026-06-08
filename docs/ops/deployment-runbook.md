# 部署运行手册

## 当前线上入口

- Web：http://43.110.116.98
- API 健康检查：http://43.110.116.98/health
- 个人站内容接口：http://43.110.116.98/api/profile
- 兼容直连内容接口：http://43.110.116.98/profile

服务器 SSH：

```powershell
ssh root@43.110.116.98
```

服务器部署目录：

```text
/root/app/infra/compose
/root/app/infra/caddy
```

## GitHub Actions 部署模型

`Docker Images` workflow 的职责：

- 构建 Web/API Docker 镜像。
- 推送镜像到 GHCR。
- 通过 SSH 同步生产 `.env`、`docker-compose.prod.yml` 和 `Caddyfile`。
- 在服务器执行 `docker compose pull` 和 `docker compose up -d`。

当前 CI 和镜像发布已经跑通。自动 deploy job 由仓库变量 `DEPLOY_ENABLED` 控制，只有设置为 `true` 时才会执行；未配置生产密钥前保持关闭，避免镜像发布成功后因为缺少部署密钥导致整个 workflow 标红。

## GitHub Secrets

需要配置到仓库 Actions Secrets：

- `SERVER_HOST`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`
- `DATABASE_URL`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

本机已生成一份 ignored 记录，用于配置 GitHub Secrets 时读取：

```text
D:\App\.secrets\github-actions.env
```

其中 `SSH_PRIVATE_KEY_PATH` 指向：

```text
C:\Users\Gavin\.ssh\id_rsa
```

## GitHub Variables

需要配置到仓库 Actions Variables：

- `API_HOST`
- `API_PORT`
- `COMPOSE_PROJECT_NAME`
- `DEPLOY_ENABLED`
- `DEPLOY_PATH`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `SERVER_PORT`
- `SITE_ADDRESS`
- `WEB_ORIGIN`

当前推荐值：

```text
API_HOST=0.0.0.0
API_PORT=3001
COMPOSE_PROJECT_NAME=app
DEPLOY_ENABLED=true
DEPLOY_PATH=app
MYSQL_DATABASE=app
MYSQL_USER=app
SERVER_PORT=22
SITE_ADDRESS=:80
WEB_ORIGIN=http://43.110.116.98
```

## 当前阻塞

本地保存的 GitHub PAT 可以读取仓库和 workflow 状态，但 GitHub API 拒绝写入 Actions Secrets/Variables，错误为：

```text
Resource not accessible by personal access token
```

需要在 GitHub PAT 权限中补齐当前仓库的 Actions Secrets/Variables 写权限，或手动在 GitHub 仓库 Settings 中填入上述 Secrets/Variables。配置完成前不要设置 `DEPLOY_ENABLED=true`；配置完成后再开启自动部署。

## 手动兜底部署

当 GHCR 镜像已经发布，但 deploy job 因 Secrets/Variables 未配置失败时，可以用本地 `.secrets` 记录手动部署当前提交：

```powershell
$record = Get-Content D:\App\.secrets\github-actions.env
$values = @{}
foreach ($line in $record) {
  if ($line.Trim() -eq '' -or $line.StartsWith('#')) { continue }
  $parts = $line.Split('=', 2)
  $values[$parts[0]] = $parts[1]
}

$sha = (git rev-parse HEAD).Trim()
$envLines = @(
  "COMPOSE_PROJECT_NAME=$($values['COMPOSE_PROJECT_NAME'])",
  "SITE_ADDRESS=$($values['SITE_ADDRESS'])",
  "MYSQL_ROOT_PASSWORD=$($values['MYSQL_ROOT_PASSWORD'])",
  "MYSQL_DATABASE=$($values['MYSQL_DATABASE'])",
  "MYSQL_USER=$($values['MYSQL_USER'])",
  "MYSQL_PASSWORD=$($values['MYSQL_PASSWORD'])",
  "DATABASE_URL=$($values['DATABASE_URL'])",
  "WEB_ORIGIN=$($values['WEB_ORIGIN'])",
  "API_HOST=$($values['API_HOST'])",
  "API_PORT=$($values['API_PORT'])",
  "WEB_IMAGE=ghcr.io/870751720/app-web:$sha",
  "API_IMAGE=ghcr.io/870751720/app-api:$sha"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText('D:\App\.secrets\compose-prod.env', ($envLines -join "`n") + "`n", $utf8NoBom)
scp D:\App\.secrets\compose-prod.env root@43.110.116.98:/root/app/infra/compose/.env
scp D:\App\infra\compose\docker-compose.prod.yml root@43.110.116.98:/root/app/infra/compose/docker-compose.prod.yml
scp D:\App\infra\caddy\Caddyfile root@43.110.116.98:/root/app/infra/caddy/Caddyfile
ssh root@43.110.116.98 "cd /root/app/infra/compose && docker compose -f docker-compose.prod.yml pull api web && docker compose -f docker-compose.prod.yml up -d --remove-orphans"
```

## 线上验证

```powershell
Invoke-WebRequest -UseBasicParsing http://43.110.116.98/health
Invoke-WebRequest -UseBasicParsing http://43.110.116.98/api/profile
Invoke-WebRequest -UseBasicParsing http://43.110.116.98/profile
ssh root@43.110.116.98 "cd /root/app/infra/compose && docker compose -f docker-compose.prod.yml ps"
```
