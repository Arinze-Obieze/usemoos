FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/lib/package.json ./packages/lib/
COPY packages/adapters/package.json ./packages/adapters/
RUN npm ci

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# node_modules includes tsx and workspace symlinks to packages/
COPY --from=deps /app/node_modules ./node_modules

# Package source — workspace symlinks in node_modules point here
COPY --chown=apiuser:nodejs packages ./packages
COPY --chown=apiuser:nodejs apps/api/src ./apps/api/src
COPY --chown=apiuser:nodejs apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY --chown=apiuser:nodejs apps/api/package.json ./apps/api/package.json

USER apiuser
EXPOSE 3001

CMD ["node_modules/.bin/tsx", "apps/api/src/index.ts"]
