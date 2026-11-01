# Foundation restructure plan (2026-10-31)

**Status:** **Approved by the owner on 2026-10-31.** The owner approved A1–A5
in response to the infrastructure review, then reviewed the full plan and
approved every recommendation in D1–D10 and the final verification in
Section 10. The plan is approved but **not yet implemented**. Implementation
evidence is recorded in the restructure PR. Choices not listed here (for example CI) still need
their own approval. The owner's answers in the plan review (R1–R7, Section 4a)
(R1–R15) amend the plan on the same date; where wording conflicts, Section 4a wins.

**Supersedes, once the restructure PR merges:** the Step 1 container-only Node execution model, the
wrapped Doppler launch path, the local-only database configuration contract and
the Drizzle command supervisors recorded in
[technical direction](technical-direction.md). Historical records remain; the
PR marks the affected sections as superseded rather than deleting them.

**Sequencing:** This restructure runs before
[Step 5](technical-foundation-implementation-guide.md#step-5--trpc-and-zod-integration).
Steps 5 and 6 are then re-planned against the simplified foundation.

## 1. Goals

1. Prefer standard tool workflows over custom code (owner direction,
   2026-10-25, reaffirmed 2026-10-31). Keep a custom script only when the
   selected tools cannot do the job, and document the reason next to it.
2. Make the same images and Compose model deployable to a single VPS
   (Hostinger, owner-selected 2026-10-31) without rework.
3. Give developers a fast loop with working editor tooling.
4. Keep the safety properties that matter: tests never touch development or
   production data, secrets never land in the repository or logs, and migrations
   run only on explicit request.

## 2. Answers to the review questions

### Should FE, BE and PostgreSQL run as containers?

**In production: yes.** Containers are a good fit for a VPS. The server needs
only Docker, each release is an immutable image, rollback means running the
previous tag, and Compose provides restart policies and private networking.

**In daily development: only PostgreSQL.** The common pattern is:

| Mode | API | Frontend | PostgreSQL | Purpose |
| --- | --- | --- | --- | --- |
| Daily development (default) | Host, `node --watch` | Host, Vite dev server | Container | Fast reload, editor/TypeScript sees `node_modules`, debugger attaches directly |
| Production parity check | Container (production image) | Container (production image) | Container | Proves the exact images and Compose model before deployment; later used by CI |
| VPS | Container | Container | Container | Production |

You are not required to always run the backend on the host. The rule is one
default loop (host processes plus containerized PostgreSQL) and one parity
command (`pnpm stack:up`) that runs everything in containers. A
container-based dev loop (bind mounts plus dependency volumes) is the source of
most of today's scripts and of the editor limitation, so this plan removes it.

### Frontend in production

The frontend is not built yet. It will be a fully client-side single-page React
application (owner, 2026-10-31): React with Vite and TanStack Router, as already
approved, with no server-side rendering. This restructure does not scaffold it;
it only keeps the Compose and deployment model ready for a later `web` service.

A Vite SPA compiles to static files, so it does not need a Node server.
Approved (D5): one `web` image based on Caddy that:

- serves the built assets, with long-lived caching for hashed files under
  `assets/` and no caching for `index.html`;
- falls back to `index.html` for unknown paths (`try_files {path} /index.html`),
  so client-side routes such as `/purchases/12` load correctly on refresh or
  direct links;
- reverse-proxies `/trpc` (and health routes, if they are public) to the `api`
  container. The browser then calls the API on the same origin, so no CORS policy
  is needed;
- obtains and renews HTTPS certificates automatically.

This gives the VPS a single public container on ports 80/443. In development,
the Vite dev server's `server.proxy` sends `/trpc` to the host API, which keeps
the same-origin model. Browser configuration is limited to public build-time
values (`VITE_*`); server secrets from Doppler are never passed to the frontend
build.

### Doppler: what is the best strategy?

Use Doppler's standard model with one authentication method per environment:

| Where | Authentication | How values reach processes |
| --- | --- | --- |
| Developer machine | None today (R12). When the first real development secret exists: `doppler login` plus a committed `doppler.yaml` selecting project `storage-minis` / config `dev` | Committed `.env.development`/`.env.test` (R8/R9); later, `doppler run -- <command>` only for commands that need real secrets |
| CI (later) | None for tests (R3). A read-only service token only if a CI job ever needs real secrets | Committed test values |
| VPS | Read-only service token for config `prd`, stored in a root-only file (for example `/etc/storage-minis/doppler-token`, mode `0600`) | `doppler run -- docker compose up -d` at deploy time |

Notes:

- Docker keeps each container's environment after creation, so automatic
  restarts work while Doppler is unreachable. Doppler is needed only to
  (re)deploy. If that becomes a concern, `doppler run --fallback` keeps an
  encrypted local snapshot; this is a later T04 choice.
- `DOPPLER_TOKEN` must be allowed, because it is how CI and the VPS authenticate.
- Drop the exact CLI version check and the dedicated config directory. Document
  a minimum CLI version instead.
- Compose files reference variables with `${VAR:?message}` so a missing secret
  fails loudly and nothing silently falls back to an empty value.
- Never write secrets to `.env` files on the VPS. `doppler secrets download`
  to disk is allowed only as an approved, encrypted fallback.

## 3. Core decisions (approved 2026-10-31)

| ID | Decision | Approved |
| --- | --- | --- |
| A1 | The DB package accepts a standard `DATABASE_URL`; TLS is controlled through standard URL parameters (`sslmode`). Remove the hard-coded host/user/port/database literals. Tests are protected by a small guard rather than by restricting values. | 2026-10-31 |
| A2 | Separate PostgreSQL roles locally and in production: a migration owner and a least-privilege application role, created by the PostgreSQL image's standard init mechanism. | 2026-10-31 |
| A3 | Use Doppler's standard workflow (`doppler.yaml`, `doppler run`, service tokens) instead of the wrapped launch path. | 2026-10-31 |
| A4 | Node.js and pnpm run on the host for development, with the pinned versions from `.nvmrc` and `package.json`. The tooling container is removed. API, frontend and PostgreSQL run as containers in production and in the parity check. | 2026-10-31 |
| A5 | The schema and migrations may be reset freely; no environment has applied them except local disposable images. | 2026-10-31 (owner statement) |

## 4. Detailed decisions (approved 2026-10-31)

The owner approved each recommendation below as written on 2026-10-31. The
alternatives are kept for the record. D9 and D10 set direction only;
implementation remains T04 work.

| ID | Approved recommendation | Alternatives and tradeoffs |
| --- | --- | --- |
| D1 | **Compose layout:** `compose.yaml` defines production-shaped services (`postgres`, `migrate`, `api`, later `web`). `compose.override.yaml` (loaded automatically by Compose) adds development-only settings: localhost port publishing for PostgreSQL, the `postgres_test` tmpfs service and build targets. On the VPS, use `docker compose -f compose.yaml up -d`, so the override is never loaded. | Profiles in one file (current approach): fewer files, but production and development settings interleave and every command needs `--profile`. Separate `compose.dev.yaml` plus `COMPOSE_FILE` in `.env`: more explicit, one extra setting. |
| D2 | **Role names and privileges:** `storage_minis_owner` owns the schemas and runs migrations; `storage_minis_app` gets `SELECT, INSERT, UPDATE, DELETE` on tables and `USAGE, SELECT` on sequences through `ALTER DEFAULT PRIVILEGES`, plus `EXECUTE` on functions. The superuser `postgres` is used only by the image's init script. | Single role: simpler, but hides privilege errors until production. Read-only reporting role: not needed yet. |
| D3 | **Init script:** one `docker/postgres/init/10-roles.sh` that the official image runs on first volume initialization, reading role passwords from the environment. This is a retained custom exception: SQL init files cannot read environment variables. Rotating a password on an existing volume is a documented `ALTER ROLE`. | Manual role creation: not reproducible. A migration that creates roles: mixes cluster-level setup into the schema history and needs superuser access during migration. |
| D4 | **Variable inventory** (see Section 6): Doppler holds passwords, database names and host-side URLs; Compose builds in-network URLs for containers. | Doppler holds every URL per consumer: needs a separate config for "containers on a developer machine". |
| D5 | **Frontend and edge:** a Caddy-based `web` image for the fully client-side SPA: static assets, `index.html` fallback for client routes, same-origin `/trpc` reverse proxy and automatic HTTPS. Development uses the Vite proxy. Scaffolded only when frontend work starts. | Nginx plus Certbot: more configuration. A Node static server: an unnecessary runtime. Separate proxy and web containers: more moving parts for one app. Separate API origin (`api.` subdomain): needs a CORS policy and extra TLS names. |
| D6 | **Migrations in deployment:** the API image also contains the compiled migrator (`dist/migrate.js`). A `migrate` Compose service runs it as the owner role, and `api` declares `depends_on: migrate: condition: service_completed_successfully`. The API never migrates itself. | Manual `docker compose run --rm migrate` before `up`: explicit, but easy to forget. A separate migrator image: duplicate build. |
| D7 | **Drizzle versions:** stay on stable `drizzle-orm` 0.45.4 / `drizzle-kit` 0.31.11 (npm `latest` on 2026-10-31). `1.0.0-beta.22` is beta-tagged and is not adopted. Revisit when 1.0 is stable; migrations can be regenerated cheaply until the first real deployment. | Adopt 1.0 beta now to avoid a later migration-format conversion: risk of beta breakage in the persistence layer. |
| D8 | **Migration baseline:** delete and regenerate the migrations as one clean `0000` generated migration. Move `inventory_id_base36` into a Drizzle custom migration created with `drizzle-kit generate --custom`, ordered before the table that uses it (or generated first and the tables regenerated after it). Fold `0001_customer_name_whitespace` into the baseline. | Keep the hand-edited `0000`: works, but diverges from Drizzle's snapshot model. |
| D9 | **Image distribution (deployment, owned by T04):** build images in CI later and push to GitHub Container Registry; the VPS pulls tagged images. Until CI exists, building on the VPS from a tagged checkout is acceptable. | Build on the VPS permanently: no registry, but needs build tools and the source on the server and gives slower, non-reproducible rollbacks. |
| D10 | **Backups (T04):** a daily `pg_dump` job (scheduled container or host cron) copied off the VPS, with a tested restore. Required by the baseline; details stay with T04. | Hostinger VPS snapshots only: whole-machine, not database-consistent at an exact point in time. |

## 4a. Plan review amendments (approved 2026-10-31)

The owner answered the plan-review rounds on 2026-10-31 (R1–R7 in round 1,
R8–R11 in round 2, R12–R15 in round 3) and three implementation questions on
the same date (R16–R18). These answers amend the sections that follow.

| ID | Decision | Effect on the plan |
| --- | --- | --- |
| R1 | **Deliver the whole restructure in one PR**, with commits ordered so that every commit leaves a working state. The previous PR split would have broken host DB commands between PR 1 and PR 2. | Section 7 becomes four ordered commit groups in one PR. Split into more than one PR only if a problem appears, and record the reason. |
| R2 | **The parity stack is isolated from development data.** `pnpm stack:up` uses its own Compose project (`storage-minis-stack`) with a throwaway database volume; `pnpm stack:down` removes it, volume included. | Its automatic `migrate` (D6) never touches the development database. |
| R3 | **Local test database credentials are committed** as fixed values: the test database is disposable, in memory and bound to `127.0.0.1`. `pnpm test:db` and future CI need no Doppler. The owner also allows committing development database values if needed (adopted as R8). | Section 6 `test` values become committed; the Doppler `test` config is no longer required for tests. |
| R4 | **Keep two local PostgreSQL containers:** `postgres` (named volume) and `postgres_test` (tmpfs), both using the same role init script. | Unchanged from Section 5. |
| R5 | **Brief downtime on deploy is acceptable for v1** (single VPS, single API container). If `migrate` fails, the running API is left in place. Migrations should be additive where reasonable, so rolling back to the previous image stays possible. | Applies to D6. Zero-downtime deploys (expand/contract, multiple instances) are not required. |
| R6 | **Uniform app-role privileges** in this restructure. Per-table restrictions, such as an insert-only `business_events` table, are a recorded T01 candidate, not part of this plan. | Applies to D2. |
| R8 | **Local development database values are committed too.** Doppler `dev` holds only real third-party secrets (none today). Production values stay in Doppler `prd` and are always freshly generated. | Supersedes the `dev` column of Section 6 for database values. |
| R9 | **Committed values live in `.env.development` and `.env.test`**, the single source for both sides: Compose loads them into the PostgreSQL containers through `env_file:` (development override only), and host Node processes load them with Node's built-in `--env-file-if-exists` (Vitest uses `.env.test`). Values already in the real environment take precedence, so `doppler run` can override them. `.gitignore` allows exactly these two names; every other `.env*` stays ignored, and `.dockerignore` keeps all of them out of images. | Replaces the host-side URL rows of Section 6 for `dev`/`test`. |
| R10 | **The image smoke check is an opt-in Vitest suite**, `pnpm test:stack`: it runs the parity stack, asserts the health responses, stops the API, checks exit 143 and always tears the stack down. It needs Docker, stays outside `pnpm check` and is uncached. | Replaces `scripts/verify-api.sh` in commit group 3. |
| R11 | **`pnpm db:up` starts both `postgres` and `postgres_test`; `pnpm db:down` stops both.** | Applies to commit group 1. |
| R12 | **No Doppler in local development yet.** This PR adds no `doppler.yaml` and no `doppler run` to local scripts. The first real development secret adds both, plus a README step. Until then Doppler is used only on the VPS (`prd`, service token). | Narrows A3 and the developer-machine row of Section 2. |
| R13 | **Committed values are kept out of production by structure, not runtime checks.** `compose.yaml` (the only file used on the VPS) never references `.env.development`/`.env.test`; only `compose.override.yaml` does. Production secrets use `${VAR:?}` with no default. `.dockerignore` keeps every `.env*` file out of images. | Verified by V3/V4. No runtime password check in the API. |
| R14 | **Production Doppler keys are created later, under T04.** The plan lists the required `prd` keys (Section 6); creating them waits for deployment work. | No `prd` changes in this PR. |
| R15 | **Parity stack ports:** the stack API publishes on `127.0.0.1:3100`; the stack's PostgreSQL is not published (only `migrate` and `api` reach it). `pnpm dev` and `pnpm stack:up` can run at the same time. `test:stack` targets the stack's published port. | Applies to R2/R10 and commit group 3. |
| R7 | **Leave the unused Doppler configs** (`dev_personal`, `stg`) untouched. Existing configs: `dev`, `dev_personal`, `stg`, `prd`, `test` (checked 2026-10-31). | No Doppler config changes beyond keys. |
| R16 | **Every PR leaves a working state, not every commit** (implementation question, 2026-10-31). Group 1 removes the tooling container before group 2 switches the DB package to `DATABASE_URL`, so host `pnpm dev`, `db:migrate`, `test:db` and `test:api` are unavailable between those groups. | Amends R1 and Section 7. The groups keep their order; the PR as a whole must pass Section 10. |
| R17 | **Compose model with a stack overlay** (implementation question, 2026-10-31). Compose interpolates every `${VAR:?}` in all loaded files, including `api`/`migrate`, before merging (verified on Compose 5.6.1), so an override `env_file:` cannot supply them. Local scripts therefore pass `--env-file .env.development`; `postgres_test` loads `.env.test` through `env_file:`. A small `compose.stack.yaml` publishes the stack API on `127.0.0.1:3100`, and the stack uses `.env.test` values. `build:` lives in `compose.yaml` because group 3 drops the development target. The override puts `api`/`migrate` in a `stack` profile so a bare `docker compose up` never migrates the development database. | Amends D1, R9 (Compose side) and R15; adds `compose.stack.yaml` to Section 5. `compose.yaml` still never names a committed `.env` file (R13). |
| R18 | **The restructure PR is stacked on PR #109** (implementation question, 2026-10-31). Branch `feat/foundation-restructure` starts at this plan's commit; GitHub retargets the PR to `main` when #109 merges. | Applies to R1. |

## 5. Target layout

```text
compose.yaml              postgres, migrate, api, (later) web — production-shaped
compose.override.yaml     dev only: published ports, postgres_test (tmpfs), build targets
compose.stack.yaml        parity stack only: API on 127.0.0.1:3100 (R17)
.env.development         committed local dev values (R8/R9)
.env.test                committed local test values (R3/R9)
docker/
  api.Dockerfile          build → runtime (nonroot), includes dist/migrate.js
  web.Dockerfile          later: Vite build → Caddy runtime
  Caddyfile               later
  postgres/init/10-roles.sh
packages/db/
  drizzle.config.ts       single config; reads MIGRATION_DATABASE_URL only for migrate/studio
  drizzle/                regenerated baseline + custom function migration
  src/                    client, config (DATABASE_URL), schema, migrate entry
  tests/                  integration tests with globalSetup guard
apps/api/                 unchanged structure
```

Removed: `docker/Dockerfile.tooling`, `docker/init-volumes.sh`, the `tooling`,
`tooling-init`, `api-dev` and `postgres-client` services, the five dependency
volumes, `scripts/*.sh`, `.env.compose`, `packages/db/drizzle.migrate.config.ts`,
`packages/db/scripts/*` (except, if still needed, one small migrate entry), and
the Vitest suites that test the Bash scripts (`launcher`, `docker-launcher`,
`local-setup`, `verify-api` tests).

## 6. Variable inventory (D4)

Passwords are generated as URL-safe values (for example 32 hex characters), so
they can be embedded in URLs without encoding. Doppler secret references
(`${NAME}`) avoid duplicating passwords inside URLs.

| Name | `dev` | `test` | `prd` | Consumer |
| --- | --- | --- | --- | --- |
| `POSTGRES_PASSWORD` | yes | yes | yes | Image superuser, init only |
| `POSTGRES_DB` | `storage_minis_dev` | `storage_minis_test` | `storage_minis` | Image and Compose |
| `DB_OWNER_PASSWORD` | yes | yes | yes | Init script, migrator |
| `DB_APP_PASSWORD` | yes | yes | yes | Init script, API |
| `DATABASE_URL` | `postgres://storage_minis_app:${DB_APP_PASSWORD}@localhost:5433/storage_minis_dev` | same pattern, port 5434, `_test` | not stored | Host processes (API dev, tests) |
| `MIGRATION_DATABASE_URL` | owner role, port 5433 | owner role, port 5434 | not stored | Host migrate/generate checks, test setup |
| `LOG_LEVEL` etc. | optional | optional | yes | API |

**Amended by R3, R8 and R9:** the `dev` and `test` database values are fixed,
committed local values in `.env.development` and `.env.test`, not Doppler
secrets. Only the `prd` column remains in Doppler.

Inside Compose, `api` receives
`DATABASE_URL: postgres://storage_minis_app:${DB_APP_PASSWORD:?}@postgres:5432/${POSTGRES_DB:?}`
and `migrate` receives the owner equivalent. In production that is the only
place URLs exist. Non-secret Compose settings (`COMPOSE_PROJECT_NAME`, host
ports) may live in a gitignored `.env` read natively by Compose; secrets never
go there.

## 7. Implementation sequence

All work lands in one PR (R1). Its commits follow the four groups below, in
order, and every commit leaves the repository working.

### Commit group 1: Host Node, standard Compose, committed local values

1. Record A1–A5 and the approved D items in technical direction, and mark the
   superseded Step 1/2 sections.
2. Remove the tooling image, tooling services, dependency volumes and
   `scripts/tooling.sh`; document `fnm use` + `pnpm install` on the host.
3. Restructure Compose per D1. PostgreSQL services keep the digest-pinned image,
   localhost-only ports, healthchecks, UTC and test tmpfs.
4. Add `docker/postgres/init/10-roles.sh` (D2/D3).
5. Add the committed `.env.development` and `.env.test` (R8/R9) and allow
   exactly those names in `.gitignore`. No `doppler.yaml` yet (R12).
6. Replace `database.sh`, `configure-local.sh`, `local-config.sh` and
   `reset-volumes.sh` with package scripts, for example:

   ```jsonc
   "db:up":     "docker compose up -d --wait postgres postgres_test",
   "db:down":   "docker compose stop postgres postgres_test",
   "db:psql":   "docker compose exec postgres psql -U storage_minis_owner -d storage_minis_dev",
   "db:reset":  "docker compose down --volumes",   // documented as destructive
   "dev":       "turbo run dev",   // Node loads .env.development itself
   ```

7. Rewrite the README setup section around these commands.

**Verify:** a fresh clone reaches a healthy PostgreSQL with `pnpm install` +
`pnpm db:up` and no Doppler login; a missing required value fails with the `:?` message; dev data
survives `db:down`/`db:up`; test data does not survive a stop; ports bind only
to `127.0.0.1`; `pnpm check` passes on the host.

### Commit group 2: DB configuration, roles and migrations

1. Replace `config.ts` with a Zod-validated `DATABASE_URL` reader (URL scheme,
   required database name, optional `sslmode`), keeping the redacted error
   messages and pool limits.
2. Add a test guard in the integration `globalSetup`: refuse unless the
   database name ends in `_test`. Setup migrates as the owner role and resets
   only test schemas; tests run as the app role, so the grants are exercised.
3. Regenerate migrations per D8; delete `drizzle.migrate.config.ts`.
4. Replace `drizzle-command.ts`, `generate.ts` and `command.ts` with direct
   `drizzle-kit generate`, plus a small `src/migrate.ts` that calls the native
   migrator with `lock_timeout`/`statement_timeout` set on its connection.
5. Replace `scripts/integration.ts` with plain
   `vitest run --config vitest.integration.config.mts`, using Vitest's own
   `testTimeout`/`hookTimeout`.
6. Shrink the Turbo `passThroughEnv` lists to `DATABASE_URL`,
   `MIGRATION_DATABASE_URL`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ`.

**Verify:** fresh replay and repeat application on test storage; the app role
can perform DML but not DDL; the guard rejects a non-`_test` database before
any connection; invalid URLs and wrong passwords fail with redacted messages;
existing schema/constraint integration tests pass.

### Commit group 3: Production-shaped API image and parity stack

1. Rename `docker/Dockerfile.api` to `docker/api.Dockerfile`; add BuildKit
   cache mounts for the pnpm store; include `dist/migrate.js` and the migration
   files; drop the `development` target.
2. Add the `migrate` service and the `api` dependency per D6; replace step-name
   tags (`:step4`) with `storage-minis-api:local`.
3. Add `pnpm stack:up` / `stack:down` under the separate Compose project
   `storage-minis-stack` with a throwaway volume (R2); `stack:down` runs
   `down --volumes` for that project only.
4. Replace `scripts/verify-api.sh` with a Vitest smoke test (or a short
   documented command sequence) that runs `stack:up`, checks `/health/live`
   and `/health/ready`, stops the API and asserts the exit code.
5. Review `apps/api/scripts/process-tests.ts` and `owned-process.ts`; keep only
   what Vitest cannot provide and document why.

**Verify:** the parity stack starts from a clean Docker state; the API runs as
nonroot with no source mounts; `migrate` completes before `api` starts; a failed
migration prevents API startup; SIGTERM shutdown stays within the existing
bounds.

### Commit group 4: Documentation and guide update

1. Reduce `README.md` and `local-development.md` to the new commands; move
   historical detail into the dated records.
2. Update `AGENTS.md` (validation commands, Docker/Doppler sections) and the
   implementation guide (progress table, Step 5/6 criteria that referred to the
   tooling container or wrapped Doppler).
3. Record which previous evidence is superseded and which was re-proven.

### Later, under T04 (not part of this restructure)

The VPS: Docker install, firewall (22/80/443 only, PostgreSQL never
published), service token placement, the `web`/Caddy image (D5), image
distribution (D9), backups and restore (D10), and the deploy procedure
(`doppler run -- docker compose -f compose.yaml pull && ... up -d`).

## 8. Expected size after the restructure

| Area | Now | Target |
| --- | --- | --- |
| Host Bash (`scripts/`, `docker/init-volumes.sh`) | ~735 lines | ~30 lines (the role init script only) |
| DB command wrappers (`packages/db/scripts/`) | ~320 lines | ~40 lines (migrate entry) |
| Tests of Bash scripts | ~1,085 lines | 0 |
| Compose services | 7 | 4 dev (`postgres`, `postgres_test`, `migrate`, `api`), plus `web` later |

## 9. Risks and limitations

- Host Node depends on fnm/nvm honoring `.nvmrc`; `engine-strict` already
  rejects mismatched versions.
- Removing the bounded wrappers relies on the tools' own timeouts (Compose
  `--wait-timeout`, Vitest timeouts, pg connection/statement timeouts) rather
  than custom process deadlines. This is an intentional simplification.
- Some Step 1–4 evidence (wrapper signal handling, volume ownership,
  checkout-scoped Doppler) becomes obsolete rather than re-proven; commit group 4 records
  this explicitly.
- Business invariants, authentication and production operations remain
  governed by T01–T06; this plan changes infrastructure only.
- Without CI, Section 10 proves the state only on the day it runs. A minimal CI
  workflow (`pnpm check` and `pnpm test:db` on each PR) is recommended as a
  separate decision. It is not approved by this plan.

## 10. Final verification (approved 2026-10-31)

Each commit group runs its own checks from Section 7. After commit group 4, one final pass confirms
the restructure is complete and left nothing broken. All steps must pass before
the restructure is reported as complete.

| # | Check | Pass condition |
| --- | --- | --- |
| V1 | **Clean-slate reproduction.** Fresh clone into a new directory under a new Compose project name, with no existing project volumes or images. Follow only the README, with no Doppler login: `pnpm install`, `db:up`, migrate, `check`, `test:db`, `dev`, `stack:up`. Run by a fresh agent with no prior conversation context. | Every step succeeds using only the README. Any step that needs undocumented knowledge fails the check. |
| V2 | **Command inventory.** List every root and workspace `package.json` script and Turbo task, run each one and record its expected result. Run `turbo run <task> --dry` for each task. | Every listed command behaves as documented. No script or task refers to a removed file. The dry runs show no missing tasks or dependencies. |
| V3 | **Leftover-reference sweep.** Search the repository for removed names: `tooling.sh`, `database.sh`, `local-config.sh`, `configure-local.sh`, `reset-volumes.sh`, `verify-api.sh`, `.env.compose`, `tooling-init`, `postgres-client`, `api-dev`, `init-volumes`, `DB_TARGET`, `PGHOST`, `:step1`, `:step4`, `FOUNDATION_TOOLING_PROBE`, `drizzle.migrate.config`. Check every changed relative Markdown link. | Matches appear only in dated historical records that are marked superseded. All links resolve. |
| V4 | **Deliberate failure cases.** A missing required value in `compose.yaml` (no default); production Compose (`-f compose.yaml` only) resolving no committed `.env` file; the test guard on a non-`_test` database; DDL attempted by the app role; a failing migration; port publishing. | Missing value fails with the Compose `:?` message. `docker compose -f compose.yaml config` shows no reference to `.env.development`/`.env.test`. The guard refuses before connecting. DDL is denied. A failed migration prevents API startup. PostgreSQL publishes only on `127.0.0.1`. |
| V5 | **External cleanup.** Delete superseded Doppler keys from `dev`/`test` (`POSTGRES_PASSWORD`, `POSTGRES_TEST_PASSWORD`, `FOUNDATION_TOOLING_PROBE`) only after V3 shows no consumer. The owner may also remove the old dedicated login directory `~/.config/storage-minis/doppler`. Run the documented commands that remove old tooling volumes and images from developer machines. | No unused Doppler keys remain. `docker volume ls` and `docker image ls` show no old tooling volumes or step-tagged images for the project. |
| V6 | **Review against the plan.** Run `/code-review` on the full restructure diff, with this plan as the spec. | No unresolved correctness findings. Any deviation from this plan is recorded and approved by the owner. |
| V7 | **Evidence record.** The PR lists, per commit group, the commands it ran and their actual output, and which Step 1–4 evidence is superseded versus re-proven. The implementation guide's progress table and technical direction link to it. | The evidence exists for every commit group and for V1–V6. |

## 11. Future server-rendered or catalog pages

The SPA decision does not rule out server-rendered pages later, and adding them
does not require nginx. Caddy routes by path in the same way. For example, it
can send `/catalog/*` to an added server-rendering Node container and serve the
SPA for every other path. That adds one Compose service and one `Caddyfile`
route.

The public catalog is the likely candidate. Options, from least to most work:

1. **Link previews only:** server-generated Open Graph meta tags for catalog
   URLs, with the SPA rendering the page.
2. **Server-rendered catalog routes:** a few HTML routes rendered by Fastify, or
   TanStack Start (TanStack Router's full-stack framework) with SSR only on
   selected routes. Check Start's maturity when this work begins.
3. **Build-time static generation:** a poor fit, because catalog availability
   changes with every Sale.

To keep this option open, the API stays on reserved same-origin prefixes
(`/trpc`, `/health`), and the catalog receives its own path prefix when D04 is
decided. Choosing an option is future work under D04 and is not approved here.
