FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile=false

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
RUN pnpm --filter @fieldshift/shared build
RUN pnpm --filter @fieldshift/server exec prisma generate
RUN pnpm --filter @fieldshift/server build

EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter @fieldshift/server db:migrate && node apps/server/dist/index.js"]
