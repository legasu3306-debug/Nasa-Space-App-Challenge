FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/client/package.json ./apps/client/
RUN pnpm install --frozen-lockfile=false

COPY packages/shared ./packages/shared
COPY apps/client ./apps/client
RUN pnpm --filter @fieldshift/shared build
RUN pnpm --filter @fieldshift/client build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
