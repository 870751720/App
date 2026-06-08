FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/schemas/package.json packages/schemas/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY apps/api apps/api
COPY packages/config packages/config
COPY packages/domain packages/domain
COPY packages/schemas packages/schemas
RUN pnpm --filter @app/domain build
RUN pnpm --filter @app/schemas build
RUN pnpm --filter @app/api prisma:generate
RUN pnpm --filter @app/api build

FROM base AS runtime
ENV NODE_ENV="production"
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build /app/packages/domain/dist /app/packages/domain/dist
COPY --from=build /app/packages/domain/package.json /app/packages/domain/package.json
COPY --from=build /app/packages/schemas/dist /app/packages/schemas/dist
COPY --from=build /app/packages/schemas/package.json /app/packages/schemas/package.json
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/server.js"]
