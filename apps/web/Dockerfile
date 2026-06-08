FROM node:24-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/schemas/package.json packages/schemas/package.json
RUN pnpm install --frozen-lockfile=false

COPY apps/web apps/web
COPY packages/api-client packages/api-client
COPY packages/config packages/config
COPY packages/domain packages/domain
COPY packages/schemas packages/schemas
RUN pnpm --filter @app/schemas build
RUN pnpm --filter @app/domain build
RUN pnpm --filter @app/api-client build
RUN pnpm --filter @app/web build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
