FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Copy workspace manifest + all package manifests for caching
COPY pnpm-workspace.yaml package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/types/package.json ./packages/types/
COPY packages/types/src ./packages/types/src

# Copy api source + schema
COPY packages/api/prisma ./packages/api/prisma
COPY packages/api/src ./packages/api/src
COPY packages/api/tsconfig.json packages/api/nest-cli.json ./packages/api/

RUN pnpm install --no-frozen-lockfile
RUN cd packages/api && npx prisma generate

WORKDIR /app/packages/api

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && pnpm exec nest start --watch"]
