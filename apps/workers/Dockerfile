FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/lib/package.json ./packages/lib/
COPY packages/adapters/package.json ./packages/adapters/
RUN npm ci

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

# node_modules includes tsx and workspace symlinks to packages/
COPY --from=deps /app/node_modules ./node_modules

# Package source — workspace symlinks in node_modules point here
COPY --chown=worker:nodejs packages ./packages
COPY --chown=worker:nodejs apps/workers/src ./apps/workers/src
COPY --chown=worker:nodejs apps/workers/tsconfig.json ./apps/workers/tsconfig.json
COPY --chown=worker:nodejs apps/workers/package.json ./apps/workers/package.json

USER worker

CMD ["node_modules/.bin/tsx", "apps/workers/src/index.ts"]
