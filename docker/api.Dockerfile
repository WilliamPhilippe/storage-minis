# API image (owner-approved 2026-10-31, A4/D6). The same image runs the API
# (default command) and the `migrate` Compose service, which executes the
# compiled DB migrator: node node_modules/@storage-minis/db/dist/migrate.js.
FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS build

RUN npm install --global pnpm@12.15.0 \
    && npm cache clean --force \
    && test "$(node --version)" = "v24.22.1" \
    && test "$(pnpm --version)" = "12.15.0"

WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .nvmrc ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
# BuildKit cache mount: the pnpm store persists across builds on the builder
# but never enters an image layer.
RUN --mount=type=cache,id=storage-minis-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY tsconfig*.json turbo.json eslint.config.mjs .prettierrc.json .prettierignore vitest.config.mts ./
COPY apps/api/tsconfig*.json ./apps/api/
COPY packages/db/tsconfig*.json ./packages/db/
COPY apps/api/src ./apps/api/src
COPY packages/db/src ./packages/db/src
RUN pnpm build

FROM build AS package
# Copied after the build, so a migration-only change keeps the compile layer.
COPY packages/db/drizzle ./packages/db/drizzle
# Production dependencies plus each workspace package's `files` (DB: dist and
# drizzle migrations).
RUN --mount=type=cache,id=storage-minis-pnpm-store,target=/pnpm/store \
    pnpm --filter=@storage-minis/api --prod deploy --store-dir /pnpm/store /out

FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=package --chown=node:node /out/ ./
USER node
EXPOSE 3000
CMD ["node", "--enable-source-maps", "dist/server.js"]
