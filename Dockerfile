# cache-bust: 1
FROM node:20-alpine AS base
RUN apk add --no-cache openssl python3 make g++
RUN npm install -g pnpm@9

# -- Install dependencies ---------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @englishflow/api...

# -- Build ------------------------------------------------------------------
FROM base AS build
WORKDIR /app
COPY .npmrc pnpm-workspace.yaml package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY packages/shared-types packages/shared-types
COPY apps/api apps/api
WORKDIR /app/packages/shared-types
RUN npx tsc && ls dist/index.js
RUN mkdir -p /app/node_modules/@englishflow/shared-types && \
    cp package.json /app/node_modules/@englishflow/shared-types/ && \
    cp -r dist /app/node_modules/@englishflow/shared-types/
WORKDIR /app/apps/api
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN pnpm build

# -- Production image -------------------------------------------------------
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/shared-types ./packages/shared-types
COPY apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
