# Technical direction

**Owner approval date:** 2026-10-21. **Status:** accepted choices with remaining design work explicitly listed below. Current implementation: Foundation Steps 1–5, the 2026-10-31 restructure, the 2026-11-01 API rework and frontend PRs 1–3 (web shell, Playwright and sign-in) are delivered, as recorded below. Foundation Step 6 (TBD), the web image (PR 4), business operations, production and CI remain pending.

This records the owner's stack and technical-policy decisions from the development-stack discussion, including the follow-up confirmation of active-use token refresh, explicit logout, the administrator email, and UTC reporting. It supplements the current [v0.8 requirements](../requirements/requirements-v0.8.md), [entity map v0.9](../entities/entity-map-v0.9.md), and [ownership index](../requirements/requirements-coverage-v0.8.md). It does not replace the business baseline or close delivery issues. Those documents govern domain invariants.

## Workspace bootstrap progress (2026-10-23)

The owner authorized the first setup step: a private pnpm workspace, lockfile,
pinned Node.js/pnpm versions, and initial `apps/api` (Fastify/tRPC) and
`packages/db` (Drizzle connection, schema, migrations) package directories. The
toolchain pins are recorded in the root `package.json` and `.nvmrc`; verified
installation commands and current scope are in [local setup](../../README.md#local-setup).
Node.js 24 LTS is the selected runtime line, with an exact patch pinned for
repeatable setup. The workspace uses one shared lockfile and exact versions for
future dependency additions.

Node.js version management is a local tooling choice. fnm was used for the
initial setup because Homebrew was available; both fnm and nvm can read the
repository's `.nvmrc`. The pinned Node.js/pnpm versions are required, while fnm
is optional. See [local setup](../../README.md#local-setup) for both workflows and
their validation status.

## Tooling setup decisions (2026-10-23)

**Owner approval:** On 2026-10-23, the owner approved all recommendations P01–P11
from the tooling setup proposal and explicitly authorized implementation. The
accepted outcomes below preserve that proposal's scope and rationale. This is a
second partial T06 bootstrap step for the existing API and DB packages.

| Proposal | Accepted outcome and rationale |
| --- | --- |
| P01 — Scope | Configure strict TypeScript, ESLint, Prettier, and Vitest for existing packages. Keep frontend scaffolding, Turborepo configuration, application frameworks, PostgreSQL provisioning, builds, migrations, CI, editor setup, and hooks as later decisions. This keeps tooling independent of unresolved application contracts. |
| P02 — Ownership | Root development-tool dependencies and shared configuration, with small per-package TypeScript/Vitest files. This avoids duplicate policy or premature configuration packages; checks assume a full workspace checkout. |
| P03 — Versions | Exact pins below, with the existing shared-lockfile policy. Select TypeScript 6.0.3 because the approved typescript-eslint release supports TypeScript below 6.1; add Vite as Vitest's required peer. Node types follow the Node 24 runtime line. |
| P04 — TypeScript | `strict` plus checked indexed access, exact optional properties, override/return/fallthrough checks, consistent file casing, explicit module syntax, isolated modules, no emit, and dependency declaration checking. Keep ambient types empty in the base. ESLint owns unused-variable checks. These safeguards apply to source, tests, and TS configuration. |
| P05 — Modules | ESM in all three manifests; NodeNext module/resolution, ES2024 target/library, and Node types in the Node profile. Use `.js` relative imports in application `.ts` files, `.mjs` for ESLint, and `.mts` for Vitest configurations. This models Node resolution; the frontend will need its own browser profile. Build output, aliases, exports, project references, and runtime runners remain later work. |
| P06 — ESLint | Root flat configuration with JavaScript recommended rules and TypeScript `recommendedTypeChecked`, using `projectService`. Allow `_`-prefixed intentionally unused parameters, retain unused-local errors, and fail on warnings. Apply type-aware rules to tests/configuration too; put the Prettier compatibility config last. The recommended preset avoids the broader opinionated strict preset. |
| P07 — Formatting | Prettier independently handles formatting: two spaces, no tabs, semicolons, double quotes, all trailing commas, width 80, always-parenthesized arrow arguments, LF, and preserved prose wrapping. Check supported root tooling and application/package source/configuration; exclude generated files and historical specifications. This avoids unrelated baseline reformatting. |
| P08 — Tests | Root `test.projects` discovery with `api-unit` and `db-unit` package configurations. Node environment, explicit Vitest imports, colocated `src/**/*.test.ts`, and integration-file exclusion. Clear/restore mocks, isolate test files, disable retries, and run TypeScript separately. Each project declares its settings explicitly. Future persistence evidence requires real PostgreSQL. |
| P09 — Empty suites | Keep normal tests failing when no tests exist. An explicit `--passWithNoTests` is only a bootstrap runner check. Typecheck the configuration files while source is absent; avoid permanent dummy application tests. This makes missing test discovery visible. |
| P10 — Coverage | Defer the coverage provider, source selection, and thresholds until meaningful application tests exist. A coverage percentage on scaffold files would not establish business correctness. |
| P11 — Commands/evidence | Root typecheck, lint/fix, format/check, and test/watch scripts use pnpm directly pending Turborepo configuration. Verify both successful and erroneous temporary fixtures, remove them afterward, and document actual command results. T06 stays open pending its application and persistence acceptance evidence. |

Approved root development dependencies:

| Package | Exact version |
| --- | --- |
| `typescript` | `6.0.3` |
| `@types/node` | `24.19.2` |
| `eslint` | `10.13.0` |
| `@eslint/js` | `10.0.1` |
| `typescript-eslint` | `8.72.0` |
| `globals` | `17.13.0` |
| `eslint-config-prettier` | `10.1.8` |
| `prettier` | `3.9.10` |
| `vitest` | `5.0.5` |
| `vite` | `8.3.5` |

The exact configurations live in [the shared TypeScript base](../../tsconfig.base.json),
[the Node profile](../../tsconfig.node.json), [ESLint](../../eslint.config.mjs),
[Prettier](../../.prettierrc.json), and [Vitest project discovery](../../vitest.config.mts).
The [root manifest](../../package.json) and shared lockfile record installed versions.
See [checks](../../README.md#checks) for command usage and
current empty-suite limitations.

Examples: reading `items[index]` requires handling an absent value; an optional
`name?: string` field may be omitted but cannot explicitly contain `undefined`
unless its type allows that. A dropped Promise is a lint error. Unit tests import
their assertions explicitly, and `*.integration.test.ts` files await dedicated
real-database projects rather than joining the unit run.

These compile/lint rules do not enforce monetary limits, authorization, or
transaction atomicity. T01/T02/T04 prerequisites and the rest of T06 remain open.

**Implementation verification (2026-10-23):** On macOS arm64 with Node 24.22.1
and pnpm 12.15.0, the exact dependencies installed successfully;
`pnpm install --frozen-lockfile`, workspace package discovery, `pnpm typecheck`,
`pnpm lint`, `pnpm lint:fix`, `pnpm format:check`, and `pnpm format` were verified.
Typecheck currently checks configuration files. Temporary fixtures confirmed
valid inputs pass, both packages reject unchecked lookups and invalid optional
fields, typed linting rejects unhandled promises, and formatting detects/repairs
style differences. Both Vitest projects discovered passing unit tests, excluded
integration fixtures, supported focused selection, and propagated deliberate
assertion failures. All temporary fixtures were removed afterward.

The final empty repository suite makes `pnpm test` exit 1 as approved.
`pnpm test --passWithNoTests` loads both project configurations and exits 0;
`pnpm test:watch --passWithNoTests` enters watch mode and accepts the quit command.
These are tooling checks, not application/persistence acceptance evidence.
Changed documentation links, anchors, Markdown fences/tables, and
`git diff --check` were also checked.

## Turborepo setup decisions (2026-10-23)

**Owner approval:** On 2026-10-23, the owner approved the Turborepo boilerplate
proposal with "Implement it" and requested adherence to Turborepo documentation
and recommendations. This authorizes the exact dependency, scripts, task/cache
configuration, validation, and documentation below. It extends the earlier
tooling setup's command orchestration while preserving its checking rules,
centralized tooling, and strict empty-suite behavior.

| Area | Approved outcome and rationale |
| --- | --- |
| Dependency | Pin `turbo` 2.11.10 as a root development dependency through pnpm and commit its generated lockfile changes. Keep Node.js 24.22.1 and pnpm 12.15.0. Repository installation provides one reproducible Turbo version without a global CLI or additional tooling packages. |
| Task ownership | Retain the package `typecheck` scripts. Extract the existing root TypeScript invocation into `typecheck:root`; `pnpm typecheck` schedules all three. Register the existing repository-wide lint, formatting check, and Vitest scripts as root tasks, preserving direct standalone commands and Vitest project selection. |
| Aggregate command | `pnpm check` schedules all six executable checks. Register only their real leaf scripts; orchestration scripts are outside root-task registration to avoid recursion. Normal tests and the aggregate command continue failing while tests are absent. |
| Dependencies | Omit `dependsOn` because the current package manifests declare no workspace dependencies and checks need no generated artifacts. Run independent checks concurrently. Revisit dependency hashes and ordering when real shared imports, package links, builds, or generated files are introduced. |
| Cache inputs | Retain default package/root inputs and include the shared configuration listed in `turbo.json` in every task hash. This conservatively covers workspace files consumed by root tools and root TypeScript settings consumed by packages. Root documentation edits may rerun root checks; narrower globs would require maintaining another copy of each tool's scope. |
| Cache outputs | Cache successful checks with `outputs: []`; current checks need only successful logs, with no build artifacts to restore. Failed tasks are never accepted as cached success. Coverage and build outputs await their real commands. |
| Cache location | Explicit `.turbo/cache` keeps the local cache within each worktree. Disable remote cache operations. Automatic local sharing across worktrees is available upstream but is outside this setup; existing Git/lint/formatter exclusions already cover Turbo artifacts. |
| Environment | Use strict filtering. Include `NODE_ENV` and `TZ` in unit-test hashes. Current checks need no application secrets or database variables. Declare additional result-affecting variables per task when introduced; pass-through values are unhashed, and tasks loading ignored `.env` files must declare those files as inputs. |
| Mutating and persistent work | Retain direct `lint:fix`, `format`, and `test:watch` commands. Future persistent tasks should use `cache: false` and `persistent: true`, outside finite task prerequisites. Future database mutations and, initially, real-database integration tests should be uncached because source hashes do not capture live database state. Concrete future tasks remain separate implementation decisions. |

The exact configuration is [turbo.json](../../turbo.json); command usage and the
cache demonstration live in the [Turborepo cache reference](local-development.md#turborepo-tasks-and-cache).
This adopts the documented [incremental installation](https://turborepo.dev/docs/getting-started/add-to-existing-repository),
[root tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks#registering-root-tasks),
[configuration](https://turborepo.dev/docs/reference/configuration),
[environment handling](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables),
and [worktree-cache behavior](https://turborepo.dev/docs/crafting-your-repository/caching#git-worktree-cache-sharing).
The [support policy](https://turborepo.dev/docs/support-policy) lists pnpm 8+ as
stable and describes core Turbo as independent of the active Node.js version.
The [2.11.10 release](https://github.com/vercel/turborepo/releases/tag/v2.11.10)
was the verified stable version at approval; its
[lockfile parser](https://github.com/vercel/turborepo/blob/v2.11.10/crates/turborepo-lockfiles/src/pnpm/data.rs)
supports this repository's multi-document pnpm lockfile format.

**Implementation verification (2026-10-23):** On macOS arm64 with Node.js
24.22.1 and pnpm 12.15.0, the frozen install and workspace discovery passed;
`pnpm exec turbo --version` reported 2.11.10. `pnpm check --dry=json` discovered
exactly six executable tasks, no dependency edges or recursive commands, and
strict environment handling. Turbo reported remote caching disabled and used
this worktree's `.turbo/cache` and `.turbo/runs` directories.

The documented forced run of typecheck, root typecheck, lint, and formatting
check completed five successful tasks; the unchanged second run reused all five
cache entries. `pnpm typecheck` also passed. Temporary shared-configuration edits
changed all six task hashes; an API-configuration edit changed API/root hashes
while preserving the DB typecheck hash. Changing `NODE_ENV` or `TZ` affected only
the unit-test task hash; an unrelated environment variable affected none.

A temporary TypeScript assignment error made `pnpm typecheck` fail with exit 2
on consecutive runs, with the invalid API task executed again each time. All
temporary configuration edits were restored byte for byte. Explicit
`--passWithNoTests` runner checks passed for both projects individually and
together. The Turbo bootstrap runner check passed and reused its own cache, but
ordinary Turbo tests still executed and failed on repeated runs. Normal
`pnpm test` and `pnpm check` exited 1 because tests remain absent. No permanent
test fixtures were added.

Documentation links, anchors, fences/tables, and `git diff --check` were checked.
These results establish tooling behavior only. T06 and its T01/T02/T04
prerequisites remain open; application, database, deployment, remote-cache, and CI
implementation evidence remains pending.

## Step 3A Drizzle implementation (2026-10-25)

**Partly superseded (2026-10-31):** The dependencies, factory, limits and
compiled exports remain. The fixed dev/test tuple, Doppler injection, `db:check`
and the command supervisors are replaced by `DATABASE_URL`, committed values,
`drizzle-kit generate` and `src/migrate.ts` (A1). See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** On 2026-10-24 the owner approved the
[two-part plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md),
requested a new branch from `main`, and instructed implementation. Branch
`chore/step-3-drizzle` starts at merged `origin/main` commit `acb9f05` and preserves
the planning documents. This delivers 3A; the plan's physical-schema review and
first-development-migration gates remain in force for 3B.

Two installation/compatibility findings required additional choices. The owner
explicitly answered “Approve exact-version allowlist” for esbuild 0.18.20,
0.25.12 and 0.28.2, and “Approve skipLibCheck:true” after Drizzle 0.45.4 failed
full dependency-declaration checking. These supersede P04's library-checking
choice for the shared compiler configuration. Strict checking of project source,
API use of library types, exact optional properties and indexed access remains;
no unused Gel/MySQL/native driver packages were added to hide declaration errors.
The esbuild allowlist is version-specific; future builds require review.

| Area | Implemented contract and rationale |
| --- | --- |
| Dependencies | DB runtime: Drizzle ORM 0.45.4, pg 8.23.1, Zod 4.6.7. Root tools: Drizzle Kit 0.31.11, @types/pg 8.23.1, tsx 4.23.15. Installation is inside existing Docker volumes, with a shared exact lockfile. |
| Environment | Verified project `storage-minis`, config/environment `test`, and key name `POSTGRES_TEST_PASSWORD`. Both PostgreSQL lifecycle and Node commands require `DOPPLER_CONFIG` equal to `dev` or `test` as selected. Dev keeps `POSTGRES_PASSWORD`; no test fallback to dev. Only the selected password is fetched. |
| Factory | Explicit validated configuration, lazy pg pool, typed Drizzle handle, bounded authenticated `check()`, idempotent `close()`, last-check readiness flag. Import has no environment/network side effect. Command process owns cleanup. |
| Limits | Pool max 5; idle 10s; connection/acquisition 2s; statement 3s; query 4s; complete check 6s; graceful pool cleanup 10s. Command watchdog and signal handlers provide final process cleanup. These remain local defaults, not production targets. |
| Exports | TypeScript emits ESM and declarations to `dist/`; normal Node and NodeNext consumers resolve compiled package exports. No source alias or API runtime was introduced. |
| Tasks | DB build emits cached `dist/**`. DB typecheck and root typed lint build required exports first. `db:check`, `db:generate`, `db:migrate`, and `test:integration` are uncached; only named DB environment values pass to secret-bearing tasks. |
| Migration state | Generation/application commands and direct CLI configs refuse before credentials or schema mutation. No placeholder schema, empty journal, dummy tables or migration exists. Config paths/history namespace are recorded; CLI execution and migration credentials will be completed with approved real artifacts in 3B. |
| Tests | Colocated unit tests validate configuration, target isolation and migration refusal. Separate real-PostgreSQL tests validate connection/rollback/timeouts, idle errors, process exports and cleanup. Integration requires the exact test tuple, 30s per test and 120s suite bound. |

No host tool was installed or upgraded. The setup documentation now explains the
separate Doppler configs, internal port 5432 on distinct containers, and host
ports 5433/5434. The final evidence and remaining schema work are recorded in the
[Step 3A handoff](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-3a-verification-2026-10-25.md). These checks do not establish
business atomicity, Organization authorization, schema constraints or T06 completion.

## Foundation Steps 1–4 (2026-10-24 to 2026-10-29)

Steps 1–4 built the first local foundation inside a tooling container, with
Doppler launchers and Bash helpers: Docker tooling (Step 1), development and test
PostgreSQL (Step 2), Drizzle and the base migration (Step 3, with
[Step 3A](#step-3a-drizzle-implementation-2026-10-25) above and
[Step 3B](#step-3b-structural-schema-2026-10-25) below), and the Fastify API
with its image (Step 4, [PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107)).
The [foundation restructure](#foundation-restructure-2026-10-31) replaced their
container execution model, Doppler launch path and helpers, and its
[evidence table](#step-14-evidence-after-the-restructure) lists what was
re-proven. The API runtime contracts Step 4 approved (health, the database
check, startup and shutdown bounds, exit codes and HTTP limits) are in the
[local development reference](local-development.md#api-runtime-behavior); the
[API rework](#api-composition-and-error-log-rework-2026-11-01) replaced its
composition and logging rules.

Two directions from that period stand: prefer standard tools and declarative
configuration over custom infrastructure code (owner, 2026-10-25, reaffirmed
2026-10-31; see [AGENTS.md](../../AGENTS.md#owner-approval-before-decisions)),
and Doppler is the provider for production values (2026-10-24). The step-by-step
approvals and evidence, and the 2026-10-24 planning checklist for these steps,
were removed on 2026-11-06; they are at [commit 55a61ab](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/technical-direction.md).

## Foundation restructure (2026-10-31)

**Owner approval:** On 2026-10-31 the owner approved the
[foundation restructure plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/foundation-restructure-plan-2026-10-31.md)
(PR #109): core decisions A1–A5, detailed decisions D1–D10, plan-review
amendments R1–R15 and the final verification V1–V7. During implementation the
owner answered four further questions on 2026-10-31 and 2026-11-01
(R16–R19), and on 2026-11-01 approved twelve implementation choices as
recommended (R20). The plan
is the authoritative record of alternatives and wording; its Section 4a
amendments win where wording conflicts. Rationale: prefer standard tool
workflows over custom code (owner direction 2026-10-25, reaffirmed
2026-10-31), make the same images and Compose model deployable to a single
Hostinger VPS, and give developers a fast host loop with working editor
tooling.

| Area | Approved outcome |
| --- | --- |
| Execution model (A4) | Node.js 24.22.1 and pnpm 12.15.0 run on the host, pinned by `.nvmrc` and `package.json`. The tooling image, its five dependency volumes and every Bash launcher are removed. PostgreSQL runs in containers locally; the API, a later `web` image and PostgreSQL run in containers in production and in the parity stack. |
| Database configuration (A1) | The DB package reads a standard `DATABASE_URL` (migrations: `MIGRATION_DATABASE_URL`), with TLS through `sslmode`. Hard-coded host/user/port/database literals are removed; tests are protected by a guard that requires a database name ending in `_test`. |
| Roles (A2, D2, D3, R6) | `storage_minis_owner` owns the database and schemas and runs migrations. `storage_minis_app` receives `SELECT, INSERT, UPDATE, DELETE` on tables, `USAGE, SELECT` on sequences and `EXECUTE` on functions through `ALTER DEFAULT PRIVILEGES`. The `postgres` superuser is used only by the image's init script, `docker/postgres/init/10-roles.sh`, a retained custom exception because SQL init files cannot read environment variables. Uniform app privileges; per-table restrictions are a T01 candidate. |
| Compose layout (D1, R2, R4, R13, R15, R17) | `compose.yaml` holds production-shaped `postgres`, `migrate` and `api` (later `web`) and is the only file used on the VPS. `compose.override.yaml` adds loopback ports, `postgres_test` (tmpfs) and a `stack` profile for `api`/`migrate`. `compose.stack.yaml` publishes the parity stack's API on `127.0.0.1:3100`; that stack runs as project `storage-minis-stack` with a throwaway volume and an unpublished database. |
| Values and secrets (A3, D4, R3, R8, R9, R12, R14) | Local development and test database values are committed in `.env.development` and `.env.test`; `.gitignore` allows exactly those names and `.dockerignore` excludes every `.env*` file. Local Compose commands pass `--env-file .env.development`; host Node loads the files with `--env-file-if-exists` or `process.loadEnvFile`, and real environment values take precedence. No Doppler is used locally until a real development secret exists. The VPS uses a read-only `prd` service token with `doppler run`; `prd` keys are created later under T04. |
| Migrations (A5, D6, D7, D8, R5, R19) | Schema and migrations may be reset freely. The baseline is regenerated as a Drizzle custom migration for `inventory_id_base36` followed by one generated migration. A `migrate` service runs the compiled `dist/migrate.js` from the API image as the owner role; `api` waits for it to complete successfully and never migrates itself. Brief deploy downtime is acceptable. Because a single `up` stops the running API before `migrate` finishes (verified), the stack and the later VPS deploy run `docker compose run --rm migrate` first and `up -d --wait` second, so a failed migration leaves the running API in place. Rotate a role password with `ALTER ROLE` before changing its secret: the secret also feeds the `postgres` service, so changing it recreates PostgreSQL and stops the API. Drizzle stays on 0.45.4 / Kit 0.31.11. |
| Parity check (R10) | `pnpm stack:up` / `stack:down` run the production model locally; `pnpm test:stack` is an opt-in Vitest smoke suite outside `pnpm check`. |
| Delivery (R1, R16, R18) | One PR in four ordered commit groups, stacked on PR #109. Each PR, not each commit, must leave a working state; host DB commands are unavailable between commit groups 1 and 2. |
| Implementation choices (R20) | Approved as recommended on 2026-11-01, completing V6. Every URL component is explicit, with `sslmode=disable` or `verify-full` only. Committed URLs use `127.0.0.1` and fixed ports 5433/5434. Every pool pins `search_path=public`, UTF-8 and standard SSL negotiation. The other choices cover migration names, owner-role migration tests, database-wide default privileges, the migrator's default signal handling, the API suite's config guard and the smoke-test design; the plan's R20 lists all twelve. |
| Direction only (D5, D9, D10) | A Caddy-based `web` image for the client-side SPA, image distribution through GitHub Container Registry and daily `pg_dump` backups with a tested restore. These remain T04 implementation work. |

The implementation, the commands each commit group ran with their output, and
the final verification V1–V7 are recorded in
[PR #110](https://github.com/WilliamPhilippe/storage-minis/pull/110). The sections
that recorded Steps 1–4 were removed on 2026-11-06 (see
[Foundation Steps 1–4](#foundation-steps-14-2026-10-24-to-2026-10-29)); this
record owns the current local workflow.

### Step 1–4 evidence after the restructure

| Earlier evidence | Status |
| --- | --- |
| Step 1 tooling image, dependency volumes, launcher signal forwarding, checkout-scoped Doppler login and `verify-env` probe | Superseded; the mechanisms no longer exist. |
| Step 2 services: health, persistent development data, discarded test data, loopback-only ports, separate credentials | Re-proven with the new roles: SCRAM from the host, wrong passwords and cross-server credentials rejected with `28P01`. |
| Step 2 Doppler injection, SQL client container, launcher deadlines and confirmed per-target resets | Superseded by committed values, `pnpm db:psql` and `pnpm db:reset`. |
| One-time setup and lifecycle helpers (`.env.compose`, volume-ownership checks) | Superseded by native Compose scripts; the ownership guard has nothing left to guard. |
| Step 3A connection factory, limits, compiled exports, plain consumer | Re-proven in the connection suite, plus a new test that ambient `PG*` values cannot redirect the URL. |
| Step 3A target tuple and `DATABASE_URL` rejection | Superseded by A1; URL validation has new unit tests. |
| Step 3B constraints, scope/party rejection, races, replay, repeat application, chain rollback, lock timeout, interrupted migration | Re-proven on the regenerated chain, with fixtures running as the app role and a new app-role DML/DDL test. |
| Step 3B supervisor bounds: 120 s process deadline, 130/143 signal exits, Kit zero-exit check | Superseded; the migrator relies on connection timeouts and Node's default signal handling, and the Kit behavior is documented. |
| Step 4 factory, HTTP, logging and lifecycle unit tests | Re-proven unchanged, apart from the configuration shape. |
| Step 4.4/4.9/4.10 real process tests: startup failures, signals, drain, 10 s/17 s watchdogs, socket outage and recovery | Re-proven: 26 process tests through `DATABASE_URL` and owned loopback listeners. |
| Step 4.5 runtime image packaging | Re-proven: nonroot `node`, no mounts, compiled API/DB plus `dist/migrate.js` and the migrations. |
| Step 4.6 Compose runtime with Doppler, 4.7 development image and reload, 4.8 image smoke | Superseded by the parity stack, `pnpm dev` on the host and `pnpm test:stack`. |
| Step 4.9 native test-service outage and 4.10 container drain through stop/down and volume deletion | Not re-proven; they used removed helpers. `pnpm test:stack` proves the containerized SIGTERM exit 143, and the process suite proves draining. |
| Step 4.11 task graph and cache reuse | Re-checked in V2 (dry runs and reuse). |

## API composition and error-log rework (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved two API changes before
Foundation Step 5, handled like the foundation restructure (one branch, one PR), and
then approved the ten implementation choices below as recommended. This is not a
numbered guide step. Implemented in
[PR #112](https://github.com/WilliamPhilippe/storage-minis/pull/112).

**Rationale.** (1) Fastify's plugin model makes one composition root natural; tests
then exercise exactly what production runs, and `buildApp` could not host tRPC with
only the readiness check. (2) Fixed categories discarded every detail, making tRPC
development and production 500s undiagnosable; an allowlist keeps secrets out, and
error-level 4xx logs were noise.

| Area | Approved outcome |
| --- | --- |
| Composition root | `buildApp(httpConfig, { database, isClosing })` assembles the whole app from Fastify plugins with `app.register`; the health routes are the encapsulated plugin `src/health.ts`. Production and `app.inject()` tests build the same app. It still acquires no pool, listener or process handlers. |
| Dependency shape | `AppDependencies.database` is `Pick<Database, "db" \| "check">`: Step 5 receives Drizzle, while `close` and `healthy` stay with the lifecycle so no plugin can end the pool. |
| Lifecycle | `startLifecycle`'s `registerRoutes` option and the `registration_failed` category are removed. Plugins load in `app.ready()`; a failure there is `app_readiness_failed`, and Fastify's default 10 s plugin timeout ends a hung plugin before the 17 s watchdog. Pool ownership, signals, the 17 s startup watchdog, the 10 s shutdown bound, drain-then-close ordering and exits 130/143/1 are unchanged. |
| Client responses | Unchanged fixed bodies; no messages, stacks, causes or values. |
| Error record | `err: { type, code?, message?, stack, cause? }`, Pino's field names. `type` is the constructor name (or `typeof` for a non-Error throw); `code` only if a string matching `^[A-Za-z0-9_]{1,64}$` (Node code or Postgres SQLSTATE such as `23505`, `28P01`); `stack` keeps only the `at` frame lines, at most 20, because a multi-line message would otherwise leak through the stack's header; `cause` is followed to depth 3, since the DB package wraps the driver error as its cause. No other property (Postgres `detail`, a URL parser's `input`) is read. The serializer is `apps/api/src/error-log.ts`, also Pino's `err` serializer. |
| Messages | Logged only when `NODE_ENV` is exactly `development`. Before configuration, the lifecycle reads `process.env.NODE_ENV`; afterwards the app uses `httpConfig.nodeEnv`. `readApiConfig` now defaults `NODE_ENV` to `production` (fail closed), so both agree, and `.env.development` sets `NODE_ENV=development` for `pnpm dev`/`start`. The image and `compose.yaml` already set `production`. |
| Configuration errors | The API's own `ConfigurationError` keeps its message in every mode: it names only variables (`Check PORT.`) and wraps the DB package's fixed `DATABASE_URL` texts without their cause. |
| Levels | `request_failed` logs at info for 4xx and error for 5xx, with `category`, `status` and `err`; `readiness_unavailable` (warn) also carries `err`. Request fields (method, matched route template, status, elapsed time), authorization/cookie redaction and generated request IDs are unchanged. Inputs, bodies, URLs and headers are never logged. |
| Lifecycle lines | One JSON line per event on stdout, the request logs' stream: `{"level":30\|50,"time":<epoch ms>,"msg":"<category>","err":{…}}`; `listening` is 30, every failure and timeout 50. Written with `JSON.stringify` (no new dependency) and independent of `LOG_LEVEL`, because startup can fail before configuration is read. |

**Step 5 planning inputs (approved 2026-11-01):** register the tRPC adapter as a
plugin in `buildApp`; the tRPC context exposes `database.db`, never the whole
`Database`; request logs include the tRPC procedure name.

**Test changes.** The shutdown fixture wraps `buildApp`, as it already did for
`onClose`, and holds startup pending in the first `database.check()` (a lifecycle
phase that no Fastify plugin timeout bounds) instead of a registration callback, so
cancelled-startup ownership and the real 17 s and 10 s watchdogs keep equivalent
coverage. Lifecycle unit tests moved their registration cases to `app.ready()`.
Tests still assert that responses carry no details, and now assert the log policy:
allowlisted fields only, SQLSTATE through the cause chain, messages only in
development, and no database password or `DATABASE_URL` in any process output.

**Evidence (2026-11-01, branch `refactor/api-composition-error-logs`):** `pnpm check`
83 unit tests in 9 files; `pnpm build`; `pnpm test:api` 27 real-process tests
(one new: wrong credentials in development mode); `pnpm test:db` 29 tests;
`pnpm test:stack` 5 tests on rebuilt image
`sha256:8176e03deff7f9a68cadc898aaf7ab971c6ed072b75ec81abe0f6047297bac36`. Sample lines
for a 500, a 413 and a startup database failure in both modes are in the PR. This
is tooling evidence, not business acceptance.

## Step 5 tRPC and Zod plan approval (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved the
[Step 5 plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/step-5-trpc-plan-2026-11-01.md) as recommended, P5-01–P5-10.
Implemented in [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114);
the outcome, six implementation-time approvals and the evidence follow the table.
Choices the plan does not settle, and deviations that implementation forces, still
need approval.

**Rationale.** The plan keeps Step 5 diagnostic and table-free on the reworked
composition root and the approved planning inputs. It also prepares the transport
for later business mutations: a realistic body limit, mutations without input, and
one error format the client understands. It gives the React client a types-only
contract. Reading tRPC 11.22.1's source showed two problems the plan addresses:
its client sends a JSON content type with no body for mutations without input,
which Fastify's default parser rejects, and its own error messages repeat text the
client controls.

| Item | Approved outcome |
| --- | --- |
| P5-01 Packages | `@trpc/server` 11.22.1 (API dependency) and `@trpc/client` 11.22.1 (API devDependency, tests only), exact pins. |
| P5-02 Transport | `/trpc`; plain JSON without a transformer; `allowBatching: false`; no method override; no subscriptions; clients use `httpLink`. |
| P5-03 Bodies | 1 MiB on the tRPC route through an `onRoute` hook, 16 KiB elsewhere; a JSON parser scoped to tRPC accepts an empty body as no input; every array and string input has a `.max()`. |
| P5-04 Errors | One tRPC envelope for everything under `/trpc`: fixed messages, `data` limited to `code`, `httpStatus` and validation `issues` (`path`, `code`), and no stack, cause or path. Failures handled before routing keep Fastify's client-error body. |
| P5-05 Logs | `procedure` in request logs for matched procedures only, recorded by a base middleware; one `request_failed` per tRPC failure with the allowlisted `err`; input never logged. |
| P5-06 Context | `{ db: database.db, requestId }`; a module-private diagnostic builder; no exported unguarded builder. T02 later adds identity verification in `createContext` and authorization middleware. |
| P5-07 Procedure | `diagnostics.echo`, a query with a strict `{ message }` of 1–100 characters as input and output. |
| P5-08 Type export | `@storage-minis/api/types`, a types-only export of `AppRouter`. |
| P5-09 Layout | `apps/api/src/trpc/` (`init`, `context`, `errors`, `plugin`, `router`, `routers/`) and `src/types.ts`. |
| P5-10 Tests | An `app.inject()` matrix, a loopback test with `@trpc/client`, and a compiled browser-profile consumer; `//#test` depends on `@storage-minis/api#build`. |

### Implementation-time approvals (2026-11-01)

Reading and running tRPC 11.22.1 and Fastify 5.12.7 showed six points the plan did
not settle or could not meet as written. The owner approved each recommendation
on 2026-11-01:

| Topic | Approved outcome | Why |
| --- | --- | --- |
| Adapter route | `trpcRoutes` declares its own `/:path` route that calls the official adapter's `fastifyRequestHandler`, instead of registering `fastifyTRPCPlugin`. The 1 MiB limit is that route's `bodyLimit` option, so P5-03's `onRoute` hook is unnecessary. | The stock plugin replaces its scope's JSON parser with a raw-string pass-through and forwards multipart bodies. A probe showed it bypassed Fastify's prototype-poisoning check, returned `BAD_REQUEST` for malformed bodies and 500 for multipart, against P5-03 and cases 18–19. |
| Query JSON code | A `BAD_REQUEST` whose cause is a `SyntaxError` is reported as `PARSE_ERROR` (case 7). The log keeps tRPC's own error, with category `parse_error`. | tRPC parses a query's `input` inside its input reader and wraps the failure as `BAD_REQUEST`; malformed bodies (case 18) are `PARSE_ERROR`. The mapping uses tRPC's public `TRPCError`. |
| HEAD | tRPC answers `HEAD /trpc/<anything>` with 204 and no body before resolving a procedure. Kept, tested and documented. | No procedure, context or data is involved. |
| Oversized uploads | Kept Fastify's behaviour: an over-limit `Content-Length` is rejected unread and the connection closed, so a client still uploading may see `ECONNRESET` instead of the 413 envelope. The loopback test accepts either outcome and asserts the procedure never runs; `app.inject()` (case 15) asserts the exact envelope. | Draining an over-limit body would let a client hold a connection. A probe saw resets for about a third of 2–8 MiB uploads. |
| JSON content type | tRPC's public `responseMeta` sets `content-type: application/json` on every tRPC response. | tRPC labels errors raised before a call resolves (batching, its own media-type check) `text/plain`. Only the object form of `headers` sets rather than appends in 11.22.1; tRPC deprecates that form for v12, so revisit it on that upgrade. |
| TypeScript peer | `packageExtensions` in `pnpm-workspace.yaml` marks `@trpc/server` 11.22.1's `typescript` peer optional. | tRPC declares TypeScript a required peer although it uses it only in declarations, so `pnpm deploy --prod` shipped ~24 MB of unused TypeScript in the image (`node_modules` 69 MB → 45 MB). The root devDependency still satisfies the peer for type-checking and tests. |

### Implemented outcome

- `buildApp` registers `trpcRoutes` at `/trpc` with `appRouter` and
  `database.db`; production and `app.inject()` tests build the same app. The plugin
  holds the route, the empty-body JSON parser, scoped error and not-found handlers
  and the adapter's `onError` log; the root `frameworkErrors` handler sends
  malformed `/trpc` URLs to the same envelope.
- `diagnostics.echo` is the only procedure. `init.ts` exports tRPC's root object
  `t` (with `isDev: false` and the envelope formatter), not a procedure builder.
  Each router derives a module-private builder from `t.procedure` through
  `recordProcedure` (`context.ts`).
- The envelope helper (`trpc/errors.ts`) is built from `TRPCError`,
  `getHTTPStatusCodeFromError` and `TRPC_ERROR_CODES_BY_KEY`. It has a fixed
  message for every tRPC code, and at most 20 validation issues, each
  `{ path, code }`.
- Request logs add `procedure` through the `trpcProcedure` request decorator.
  Each tRPC failure logs one `request_failed` with `category`, `status`,
  `procedure` when recorded, and the allowlisted `err` (a `TRPCError` and its
  cause chain). Development logs include tRPC and Zod messages under the
  existing policy; these can name unknown keys or a requested path.
- `@storage-minis/api/types` exports only the `AppRouter` type; the browser
  type-check loads no Fastify or plugin declarations.

**Evidence (2026-11-01, branch `feat/step-5-trpc`):**
- `pnpm install --frozen-lockfile` passes.
- `pnpm check`: 8 tasks, 120 unit tests in 12 files (from 83 in 9): 5 envelope,
  30 adapter (section 5 cases 1–22, HEAD and the loopback client) and 2 consumer
  tests.
- `pnpm build` emits `dist/types.d.ts` and `dist/trpc/`.
- `pnpm turbo run test --dry=json` lists `@storage-minis/api#build` and
  `@storage-minis/db#build` under `//#test`. An API source edit missed
  `@storage-minis/api#build` and `//#test`; restoring it hit both again (root test
  hash `058dc2bd2b5f997b`).
- `pnpm test:api` 27 and `pnpm test:db` 29, unchanged.
- `pnpm test:stack` 5 on rebuilt image
  `sha256:54798c608f2f722de2d9c904a3985dcaaaaedbe940c6cdf930f4a3bae6a03744`. A
  `docker run` listing shows `node_modules/@trpc` holding only `server`, with no
  `@trpc/client` or `typescript` package.

This is tooling evidence, not business acceptance.

## Frontend foundation decisions (2026-11-01)

**Owner approval:** On 2026-11-01 the owner decided every item, W1–W11, of the
[frontend foundation proposal](frontend-foundation-proposal-2026-11-01.md) over
two review rounds. Nothing is implemented yet; each W11 delivery step gets its
own plan for approval. W7 replaces the React Hook Form choice in the
[accepted application stack](#accepted-application-stack) (2026-10-21) with
TanStack Form, and W2–W4 settle the design system, styling conventions,
application language and UI locale that the stack record left open. A
[follow-up review](frontend-foundation-proposal-2026-11-01.md#follow-up-review-2026-11-01)
the same day refined W4–W6 and W8–W11; the table shows the result.

**Rationale.** One SPA keeps one build, one image and one origin. Ant Design
covers the back office's components first-party, with their en-US and pt-BR
texts. i18next is the most widely used translation library and needs no build
step. TanStack Form takes Zod schemas directly and documents how to register the
app's antd fields once. A Firebase dev project with custom-token test sign-ins
avoids the Auth emulator's boilerplate while tests still use real Firebase
sessions and real token verification. The app is mobile-first, because most use,
especially of the catalog, is on phones.

| Item | Approved outcome |
| --- | --- |
| W1 App shape | One SPA, `apps/web`, holding the public catalog and the signed-in back office, split by route. |
| W2 Design system | Ant Design 6. |
| W3 Styling | antd theme tokens plus CSS Modules; antd's zero-runtime mode is prototyped in the first step. |
| W4 Languages and money | i18next with react-i18next; en-US main, pt-BR second; strings live in the frontend, split by area, and only the active language loads. Amounts carry no currency: the back office shows `$` with separators that follow the language and cents only when not zero (`$1,234.50` and `-$400.50` in en-US, `$1.234,50` and `-$400,50` in pt-BR), and the public catalog shows the Organization's currency symbol, `R$` (the default) or `US$`. Each Organization chooses its currency once; requirements v0.8 publishes the rule. |
| W5 Active Organization | No Organization id in back-office URLs. A session context holds the user, Memberships and active Organization for the whole UI; nothing is persisted while each user has one Membership; the API receives the Organization in a request header, and switching Organization clears the query cache. Catalog URLs are `/catalog/<nickname>`, with a unique nickname set once when the Organization is created and renamed only by a `global_admin`. |
| W6 Data layer | `@trpc/tanstack-react-query` over same-origin `/trpc`, with `httpLink`, no batching and no transformer. The link calls `getIdToken()` before each request, and requests follow user activity only, with no refetch on reconnect and no polling, so tokens refresh only while the user is active. |
| W7 Forms | TanStack Form with the app's own antd field components, replacing React Hook Form. |
| W8 Sign-in | Redirect on phones and popup on desktops; redirect runs through a same-origin `/__/auth/` proxy behind Caddy, and development signs in by popup through the dev project's `firebaseapp.com` domain. A session ends 7 days after the last Google sign-in: the API rejects ID tokens whose `auth_time` is older, and the app does not refresh such a session. A test-only custom-token sign-in for Playwright is accepted only behind an opt-in setting that only the committed development and test env files set. T02 settles the remaining session policies in its own record before PR 3. |
| W9 Tests | Vitest component tests inside `pnpm check`; Playwright next, on phone and desktop projects; every component located by role and label; tests run in `America/Sao_Paulo`. |
| W10 Build and tooling | A Caddy `web` image proxying `/trpc` and `/__/auth/`; the production Firebase web config committed as public identifiers, with the web build never run under Doppler; a browser TypeScript profile; React and TanStack ESLint plugins; no React Compiler yet. |
| W11 Delivery | Four PRs: web shell, Playwright, sign-in end to end, web image. The parity stack runs signed-out Playwright checks, and real phones first sign in on a deployed HTTPS environment. Foundation Step 6 stays TBD until the app is validated locally. |

Deferred by the owner: the structure of the Playwright sign-in, big-table
behavior (filterable lists are the default), persisting the active
Organization once users can belong to several, the nickname's remaining rules
(D04/E10), Organization invitations (TBD until the website is developed) and
Foundation Step 6 (TBD until the app is validated locally). The session limit
replaces the [authentication](#authentication-and-initial-administrator)
record's "No absolute or idle session timeout has been chosen". The proposal
holds the options considered, candidate versions and sources; each step's plan
re-verifies its pins.

## Frontend PR 1 web shell plan approval (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved the
[web shell plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/web-shell-plan-2026-11-01.md), WS-01–WS-13, for PR 1 of the
frontend decisions (W11 item 1, [#118](https://github.com/WilliamPhilippe/storage-minis/issues/118)),
with the changes listed after the table. Implemented in
[PR #121](https://github.com/WilliamPhilippe/storage-minis/pull/121); the outcome, five implementation-time decisions and the
evidence follow the design reference. Choices the plan does not settle, and
deviations that implementation forces, still need approval.

**Rationale.** The plan keeps PR 1 to the shell that later PRs build on, using
the decided stack. Scratch prototypes found where antd 6.6.8, pnpm 12 and the
strict flags differ from the proposal's assumptions:

- zero-runtime mode does not allow a strict style policy;
- antd 6.6.8 differs from the approved design in ten places;
- pnpm's release-age rule blocks the newest pins;
- CSS Module class names fail the strict flags without per-module
  declarations.

The plan settles each one.

| Item | Approved outcome |
| --- | --- |
| WS-01 Pins | Exact pins, each the newest version at least 24 hours old (pnpm 12's release age), so no exclusion entry is needed. Adds `@trpc/server`, `@types/react`, `@types/react-dom`, `@testing-library/dom` and `@testing-library/user-event`; i18next 26.5.12, react-i18next 17.1.9, Query 5.105.0. |
| WS-02 Layout | `@storage-minis/web`; a root `tsconfig.browser.json`; a solution-style `apps/web/tsconfig.json` with browser and Node profiles; extensionless imports in web code (Node packages keep `.js`); route files hold only route definitions, with pages in `src/features/`; one declaration file per CSS Module. |
| WS-03 Vite | Bound to `127.0.0.1:5173`, documented as `http://localhost:5173` (W8's authorized origin); `/trpc/` proxied to the API; the router plugin before the React plugin. |
| WS-04 Routes | `/` → `/app`; the Login page from its design, with no working feature; a catalog placeholder; the `/app` shell with a home page and eight section placeholders; the home page calls `diagnostics.echo`; typed page titles; pending, error and not-found pages; `routeTree.gen.ts` committed. |
| WS-05 Data | A QueryClient factory: no retry for 4xx; no refetch on reconnect; mutations never retried and never queued offline (`networkMode: "always"`). Loaders use `queryClient.query({ …, staleTime: "static" })`. |
| WS-06 Styling | W3 outcome: antd's runtime styles stay. In a real browser under `style-src 'self'`, both modes rendered unstyled, so PR 4's policy allows inline styles. Light mode only. antd's reset and one body rule. |
| WS-07 Design corrections | Ten corrections to the approved design from antd 6.6.8's behavior, among them `componentSize="medium"`, `Drawer size`, solid ink text, header heights as tokens, an accessible sidebar toggle and the FAB shadow as a component token. The owner applies them to the Claude originals, and PR 1 refreshes `docs/design/`. |
| WS-08 Shell | The design's TopBar, SideNav and MenuFab; link-based menus in named `nav` landmarks; the safe-area inset; logo files resized to twice their largest use. |
| WS-09 Languages | `common`, `app`, `login` and `catalog` namespaces, loaded per language through `import()`; typed keys; pt-BR typed against en-US, including plural `_many` keys; detection and switch failures handled in our code. |
| WS-10 Formatting | Money from integer cents through exact decimal strings; dates through `Intl` in the visitor's zone. |
| WS-11 Tests | A `web-unit` jsdom project inside `pnpm check`, with a fresh app per test, stubbed `fetch` and a console policy with declared exceptions. |
| WS-12 Tooling | The React and TanStack ESLint rules for web code; Node globals forbidden there; `//#lint` waits for the API build; ignore entries for generated files. |
| WS-13 Delivery | This docs PR, then one implementation PR in four commit groups, "Part of #118". |

**Owner changes at approval (2026-11-01):**

1. **Release age:** the newest versions at least 24 hours old ("They release
   new versions very frequently"), rather than waiting or adding exclusions.
2. **Design copy:** the owner updates the Claude originals first, and the
   repository copy is refreshed from them.
3. **Login page:** the first UI page. PR 1 builds it from its approved design,
   with no working feature; PR 3 adds sign-in.
4. **Design-system direction:** the personal look comes mostly from colors
   that follow the logo's racing red, with antd's own design and small tweaks
   for everything else. The approved color roles stay: ink is the primary
   color, and racing red is kept for attention.
5. **Light mode only:** for now the app has only a light theme.

**Design reference.** The owner approved the design system and the Login page
design in [`docs/design/`](../design/README.md) on 2026-11-01. They are design
references: an approved technical or requirements document wins where they
disagree, and each implementation still follows its own approved plan.

### Implementation-time decisions (2026-11-01)

Building the shell raised five points the plan did not settle. The owner
decided each on 2026-11-01:

| Topic | Decided outcome | Why |
| --- | --- | --- |
| Heading size and spacing | `components.Typography` sets `fontSizeHeading1: 22`, `lineHeightHeading1: 30 / 22` and `titleMarginBottom: 0`, so every h1 is a `title-lg` page title. CSS Modules set the gaps; where a gap sets the spacing, a two-class selector on our own classes removes a Paragraph's margin. The Login lead's `body-lg` (phones) and `body` (desktop) size is a CSS Module class. No `.ant-*` selector. | antd styles titles as `h1.ant-typography` (38 px, 0.5 em bottom margin) and paragraphs with a 1 em margin, which a single CSS Module class cannot override. The design asks for `title-lg` h1s spaced by gaps. |
| QueryClient instance | `lib/trpc.ts` exports the app's `queryClient = createQueryClient()` beside the `trpc` options proxy, as in tRPC's Vite SPA setup; `main.tsx` imports it. Tests still create a fresh client per test. | The proxy needs its QueryClient when it is created. Its `queryOptions()` never uses that client (checked in the 11.22.1 source), so each test's client runs every query. |
| Hard-to-override styles | In the owner's words: "We don't really need to overwrite so many styles. If it's not easy to overwrite, just ignore." Where antd's own styling needs more than a theme token or a single CSS Module class, antd's default stays; where a component token is enough, the design is followed: the FAB's icon is 24 px through FloatButton's `fontSizeIcon`, `Menu.activeBarBorderWidth: 0` removes the inline Menu's own right border, which doubled the SideNav's and showed inside the drawer, and `Tooltip.controlHeight: 32` centers a tooltip's text, which sat at the top of a 40 px box because antd sizes the tooltip's padding for its 32 px default (owner, 2026-11-01). Three design details keep antd's default: the MenuFab's position (24 px from the right, 48 px from the bottom, clear of the iPhone home indicator) instead of `fab-offset` plus the safe-area inset; the drawer menu's 14 px text instead of 16 px; and the drawer's square top corners instead of `radius-lg`. | antd positions the FloatButton with a two-class selector and internal tokens, and rounding the drawer needs a class on its wrapper. |
| Selected backgrounds | `colorPrimaryBg` is `surface-sunken` (`#eef0f3`) and `colorPrimaryBgHover` is `line` (`#e3e6ea`). They feed `controlItemBgActive` and `controlItemBgActiveHover`, so a selected dropdown item is ink on `surface-sunken` (15.6:1) and a hovered one ink on `line` (about 14:1). A `theme.test.ts` case checks both values and their contrast in both themes. | antd derives these from steps 1 and 2 of `colorPrimary`'s palette. For ink they come out as `#5b5f61` and `#4f5254`, so the language switch's selected item read ink on mid-grey (2.7:1, below 4.5:1). The same tokens style selected rows, nodes and cells in Table, Tree, Cascader, DatePicker, Calendar, Transfer and Steps. Owner, 2026-11-01, after reviewing the PR. |
| Language switch placement | In the shell, the switch leaves the TopBar (WS-07 #10's interim place) for the bottom of the SideNav, right above the collapse button, and the footer of the MenuFab's drawer, below the menu list. Every switch, including the Login and catalog pages' header switch, shows the globe and the language code, "EN" or "PT"; the collapsed SideNav shows the globe alone. Its accessible name stays "Language: English", the dropdown still lists "English" and "Português", and it opens upward in the shell. PR 3's account menu therefore no longer takes the switch. | The owner's direction after reviewing the PR (2026-11-01). The TopBar holds only the logo on phones and the page title from `bp-md`. |

**Superseded in part (2026-11-02):** the
[web shell follow-up plan approval](#web-shell-follow-up-plan-approval-2026-11-02)
reverses the first default that "Hard-to-override styles" kept: the MenuFab
moves to `fab-offset` plus the safe-area inset, through FloatButton's
`marginLG` and `marginXXL` tokens and one CSS Module class, implemented in
[PR #125](https://github.com/WilliamPhilippe/storage-minis/pull/125).
The drawer menu's 14 px text, the drawer's square top corners and the rest of
this table are unchanged.

While the refresh was pending, `apps/web/src/ui/tokens.css` stayed a
byte-identical copy of `docs/design/system/tokens.css` (owner, 2026-11-01).
The owner applied the WS-07 corrections to the Claude originals during
implementation, and this PR refreshes `docs/design/` from them, so the copy now
includes `header-height` and `header-height-phone`.

### Implemented outcome

- **Package.** `apps/web` is `@storage-minis/web`, with the WS-01 pins and no
  `minimumReleaseAgeExclude` entry. Vite 8 runs the TanStack Router plugin
  before the React plugin, binds `127.0.0.1:5173` (preview `4173`) and proxies
  `/trpc/` to the API. The root `tsconfig.browser.json` and a solution-style
  `apps/web/tsconfig.json` give browser and Node profiles.
- **Routes.** `/` redirects to `/app`. `/login` is the Login page.
  `/catalog/$nickname` is a public placeholder. `/app` is the shell with a home
  page and eight section placeholders. Route files hold only definitions, and
  `routeTree.gen.ts` is committed. `staticData.titleKey` drives one h1 per page
  and `document.title` ("Inventory · StorageMinis").
- **Data.** `lib/trpc.ts` holds `createQueryClient`, the app's `queryClient`,
  the `httpLink` client, the options proxy and `describeError`. The home
  loader runs `queryClient.query({ ...echoQuery(trpc), staleTime: "static" })`
  and the page reads `diagnostics.echo` with `useSuspenseQuery`.
- **Languages.** The `common`, `app`, `login` and `catalog` namespaces load per
  language through `import()`. Boot loads `common` with the antd and dayjs
  locales. A switch loads the already loaded namespaces first; a failed
  switch keeps the language, and the last of overlapping switches wins.
- **Styling (W3 outcome).** antd's runtime CSS-in-JS stays, so PR 4's policy
  allows inline styles (`style-src 'self' 'unsafe-inline'`). antd's reset, the
  token copy, the allowed overrides and one body rule; light only, with
  `color-scheme: light`.
- **Shell.** TopBar, SideNav with its own toggle and a remembered choice
  (`storage-minis.sideNav`), MenuFab with a bottom drawer, and link-based menus
  in `nav` "Main menu" landmarks. The language switch ("EN" or "PT") sits at
  the bottom of the SideNav and in the drawer's footer. The logo, mark and favicon are resized
  copies.
- **Login page.** State 1 on phones and in the 400 px desktop card. The button
  has no action, nothing imports Firebase, and Google's "G" waits for PR 3.
- **Tests.** The `web-unit` project (jsdom, `America/Sao_Paulo`) runs inside
  `pnpm check`. `src/test/harness.ts` holds the browser stubs, the fetch guard
  and the console policy that `setup.ts` installs.
- **Design copy.** `docs/design/system/` is refreshed from the Claude originals:
  the WS-07 corrections, the two text fixes and the notes for later screens.

Implementation notes, not decisions: the home page's title is "Home"; the
pt-BR strings are first translations for the owner's review;
`viewport-fit=cover` lets the content's bottom padding include the safe-area
inset; and the generic error page shows a server message only for tRPC errors.
The design's `theme.ts` does not list the Typography tokens, FloatButton's
`fontSizeIcon`, `Menu.activeBarBorderWidth`, `Tooltip.controlHeight` or the
`colorPrimaryBg` pair yet, TopBar.md, SideNav.md and
MenuFab.md still place the language switch in the TopBar, the Login page's
README still labels it "English", and `ant-design.md` still names `main.tsx` as the
ConfigProvider's owner (the code puts it in `ui/AppProviders.tsx`, switching
between `theme` and `phoneTheme`), so a later refresh of the originals should
add them. The [web shell follow-up](#web-shell-follow-up-plan-approval-2026-11-02)
did so on 2026-11-03, apart from the Login page's README. The logo links and the not-found page's home link are current
(`aria-current`) only on `/app` itself.

**Evidence (2026-11-01, branch `feat/web-shell`):**

- `pnpm install --frozen-lockfile` passes. `pnpm-workspace.yaml` is unchanged:
  no `minimumReleaseAgeExclude` entry and no new `allowBuilds`. `pnpm peers
  check` finds no issue. The TanStack and tRPC agent skills stay unapproved.
- `pnpm check`: 9 tasks, 194 unit tests in 23 files (from 120 in 12). The
  `web-unit` project adds 74 tests in 11 files: money, dates, languages, a
  failed switch, the theme's selected backgrounds, the pending page, the
  shell, the document title, routes, the Login page and the echo card.
- `pnpm check --dry=json` lists `@storage-minis/web#typecheck`, and `//#lint`
  depends on `@storage-minis/api#build` and `@storage-minis/db#build`.
- Each guard was broken on purpose and failed: an undeclared console warning,
  an unstubbed `fetch`, a removed `aria-hidden` on a menu icon, the
  last-switch-wins check, the title fallback when the `app` strings fail, the
  selected-background tokens (the old theme gave `#5b5f61`), and
  in `tsc` a missing pt-BR key, an extra key, a missing `_many`, a wrong `t()`
  key and a wrong title key.
- `pnpm build` builds `apps/web/dist`. First catalog visit: about 282 KiB
  (gzip −9) of JavaScript and CSS (252.6 initial JavaScript, 2.2 CSS, 27.2 for
  the catalog page, plus the string chunks). The 22.5 KiB shell chunk loads
  only on `/app`.
- Without `routeTree.gen.ts`, `pnpm --filter @storage-minis/web build`
  regenerates it byte-identically. `cmp` finds `apps/web/src/ui/tokens.css`
  identical to `docs/design/system/tokens.css`.
- `pnpm test:api` 27 and `pnpm test:db` 29, unchanged. `pnpm test:stack` 5 on
  an image rebuilt with the new lockfile.
- Live echo: through `http://127.0.0.1:5173` and `http://localhost:5173`, the
  proxy returned the API's exact 200 and 400 bodies, and `/trpcx` returned the
  app's `index.html`. With the API stopped, the card showed "Can't reach the
  server" 7.6 s after navigation, after four requests (the first and three
  retries at about 1, 2 and 4 s). With the API restarted, "Try again" showed
  the echoed message.
- Browser pane at 375 × 812, 900 and 1280 wide: no sideways scroll; header 56
  and 64 px; 44 and 40 px controls; ink primary buttons and solid ink text
  (`rgb(22, 27, 33)`); the FAB's `shadow-fab`; the current item at weight 600;
  SideNav collapsed at 900 and expanded at 1280; one h1 per page; no console
  warning.
- The Login page at 390 × 844 and 1280 × 800 matches `screens/1-sign-in.png`
  and `screens/5-desktop.png`, apart from the "G" placeholder and the
  switch's "EN" label: h1 22/30/600,
  lead 16 px then 14 px, button 44 then 40 px, a 400 px card on desktop. At
  390 px it has no sideways scroll (`scrollWidth` 390). Its button does
  nothing, and the network list shows no external request.
- The SideNav's menu has no right border of its own (`border-inline-end`
  0px), leaving the SideNav's 1 px `line`; the drawer's menu has none either.
- A collapsed SideNav item's tooltip is 34 px tall with 6 px above and below
  its 22 px line (it was 40 px, with 12 px below).
- The language switch sits above "Collapse" in the SideNav at 1280 ("EN"),
  as a 40 px globe-only button above "Expand menu" at 900, and as a 44 px
  "EN" button in the drawer's footer at 375; the TopBar has no button.
- The language switch's selected item renders ink on `rgb(238, 240, 243)`,
  and on `rgb(227, 230, 234)` when hovered (it was `rgb(91, 95, 97)`).
- Under emulated dark mode, the page and the browser's controls stay light.
- On `vite preview`, `/catalog/demo` and `/app` load only the en-US string
  chunks. A switch to pt-BR adds only the pt-BR `common` and `app` strings and
  the antd and dayjs locales.

This is tooling evidence, not business acceptance.

## Frontend PR 2 Playwright plan approval (2026-11-02)

**Owner approval:** On 2026-11-02 the owner approved the
[Playwright plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/playwright-plan-2026-11-02.md), PW-01–PW-14, as recommended,
for PR 2 of the frontend decisions (W11 item 2,
[#118](https://github.com/WilliamPhilippe/storage-minis/issues/118)). It is
implemented in [PR #124](https://github.com/WilliamPhilippe/storage-minis/pull/124);
the [implementation-time decisions](#implementation-time-decisions-2026-11-02),
the [outcome and the evidence](#implemented-outcome-2026-11-02) follow this
record.

**Owner changes to W9 and W11 (2026-11-02),** made before the plan:

1. **Two projects instead of four, both in Chromium:** Desktop Chrome
   (1280 × 720) and Playwright's full `devices['Pixel 7']` profile (412 × 839,
   touch, mobile mode, device scale 2.625). No WebKit, no iPhone and no
   Desktop Safari. Both projects pin `locale` and
   `timezoneId: 'America/Sao_Paulo'`. This replaces W9's four projects
   (`iPhone 15`, `Pixel 7`, Desktop Chrome and Desktop Safari) and defines
   W11 item 2's phone and desktop projects.
2. **Phones are portrait only:** no landscape projects or tests.
3. **No iOS Simulator in PR 2:** Xcode with an iOS runtime takes about
   13–20 GB, and Playwright can't drive Safari on iPhone. iPhone and Safari
   checks stay with T04's real-device checks.
4. **Playwright stays before sign-in:** signed-out specs (Login, catalog) stay
   apart from the specs that will need a session (`/app`), and PR 3 plugs in a
   setup project, storage state with IndexedDB and project dependencies. The
   sign-in structure stays with PR 3 and T02 (W8).

**Rationale.** The plan gives PR 2 a harness that PR 3 and PR 4 extend without
restructuring, on the owner's two Chromium projects. A scratch prototype ran
all 45 smoke tests on both projects and broke each guard on purpose, and two
independent reviews corrected the plan before approval. The prototype showed
where the defaults would mislead:

- a reused server would run the tests against `pnpm dev` and the development
  database;
- loading `.env.test` into Playwright's environment would hand both servers
  the owner role's credentials;
- antd's and React's warnings exist only in development builds;
- W9's `playwright/.auth` entry would not match `apps/web/playwright/.auth/`
  from the root `.gitignore`;
- typed lint misses Playwright's own mistakes, such as assertions that never
  retry.

| Item | Approved outcome |
| --- | --- |
| PW-01 Pins | `@playwright/test` 1.64.1 in `apps/web`; `eslint-plugin-playwright` 2.12.1 at the root (2.12.2 was under 24 hours old); `@storage-minis/db` as a workspace devDependency of `apps/web`. No release-age exclusion, no install script. |
| PW-02 Browser | Chrome Headless Shell 156.0.8078.4 only, about 206 MiB with FFmpeg, installed once by the owner with `playwright install --only-shell chromium` into Playwright's default cache; `PLAYWRIGHT_BROWSERS_PATH` may name another folder. |
| PW-03 Projects | `desktop-chrome` and `pixel-7` with the full device descriptors; `locale: "en-US"` and `timezoneId` in the shared `use`; `@phone` and `@desktop` tags with `grepInvert` for the three layout-specific tests; the collapsed SideNav at 900 × 720 in the desktop project. |
| PW-04 Layout | `apps/web/playwright.config.mts`; `apps/web/e2e/` with `signed-out/`, `app/` and `support/`; `tsconfig.e2e.json` (Node types, DOM library, bundler resolution), referenced by the solution tsconfig and the `typecheck` script; the language names in an import-free `src/i18n/languages.ts`. |
| PW-05 Lint | `eslint-plugin-playwright`'s recommended rules for `apps/web/e2e/**`. |
| PW-06 Servers | Playwright starts the built API at `127.0.0.1:3000` (`NODE_ENV=test`, `TZ=UTC`, `LOG_LEVEL=warn`) with only the test database's URL, parsed from `.env.test` with `util.parseEnv`, and the Vite dev server at `http://localhost:5173`. It never reuses a running server, refuses databases not named `*_test`, and stops the API with `SIGTERM` and 15 s, Compose's grace period. The dev server, not a built preview. |
| PW-07 Turborepo | `@storage-minis/web#test:e2e` after `^build`, uncached, passing through `PLAYWRIGHT_BROWSERS_PATH` and `DATABASE_URL`; the root `pnpm test:e2e`, outside `pnpm check`. |
| PW-08 Run settings | `fullyParallel`, no retries, default workers, traces and screenshots on failure, the list and HTML reporters with `open: "never"`; `test-results/`, `playwright-report/` and `**/playwright/.auth/` ignored by git, Prettier and ESLint as each needs. |
| PW-09 Tap or click | A `tapOrClick` fixture (`tap()` with touch, `click()` without) and a `no-restricted-syntax` rule against direct `.click()` and `.tap()` in specs. |
| PW-10 Console policy | An automatic fixture with `expectConsole(kind, pattern)`: undeclared `error`, `warn` or uncaught `pageerror` output fails the test. |
| PW-11 Smoke tests | 23 desktop and 22 phone tests with names from the en-US catalogs: the Login page, the catalog placeholder, the language switch and its saved choice, pt-BR, the phone drawer, the expanded and collapsed SideNav, the echo round-trip, and no sideways scroll on every page. |
| PW-12 Echo error path | The echo request answered with the Vite proxy's own 502 (`text/plain`, empty body), then "Try again" against the real API. |
| PW-13 PR 3 plug-in | `/app` specs import `test` from `e2e/support/app.ts`. PR 3 adds a setup project with `dependencies`, saves `storageState` with `indexedDB: true` under `playwright/.auth/`, and sets it in `support/app.ts`. |
| PW-14 Delivery | This docs PR, then one implementation PR in four commit groups, "Part of #118". |

**What approval changes in approved documents:**

- W9's "Every end-to-end test runs on phones and desktops": three
  layout-specific tests run in one project only.
- W9's "`playwright/.auth` is ignored by git": the root entry is
  `**/playwright/.auth/`.
- W8's "Playwright's phone projects": one phone project, Pixel 7.
- Section 8 of the frontend decisions: `pnpm test:e2e` uses the test database
  and `.env.test`, and runs one at a time with `test:db` and `test:api`.
- WS-10's WebKit date-separator check moves to T04.

**Left to others.** T04's real-device checks take Safari and iOS WebKit, safe
areas, Safari's toolbars, the on-screen keyboard, a real Android phone, touch
tablets, classic scrollbars and in-app browsers. The `web-unit` jsdom tests keep
the exact breakpoints, the language detection order and the formatting rules.
Three known shell issues go to a separate follow-up: hover-only labels in the
collapsed SideNav, the bottom safe area for the menu button and the drawer, and
the drawer's height on small phones. The second revisits the 2026-11-01
"Hard-to-override styles" decision.

### Implementation-time decisions (2026-11-02)

Implementation raised three points the plan did not settle. The owner decided
each on 2026-11-02:

| Topic | Decided outcome | Why |
| --- | --- | --- |
| Who installs the browser | The implementing session ran PW-02's `playwright install --only-shell chromium` into Playwright's default cache, `~/Library/Caches/ms-playwright` (203 MiB shell, 2.9 MiB FFmpeg), instead of the owner. | The owner chose it over running the command themself or a scratchpad-only install, which would have needed a second install for their own runs. |
| The collapsed SideNav test's state | The test at 900 × 720 saves the `"collapsed"` choice (`storage-minis.sideNav`) with `page.addInitScript` before the page loads, instead of relying on today's default at that width. | The web shell follow-up's SF-01 proposes an expanded SideNav at every width from `bp-md`. The plan's version would have pinned today's default, which section 2 rules out. The suggestion came from the follow-up's hand-over note. |
| ESLint and session worktrees | The root ESLint config's global ignores add `.claude/**`, beside `.context/**`. | `pnpm lint` runs `eslint .` from the root. A Claude Code session worktree under `.claude/worktrees/` is a full copy of the repository without its packages built, so the owner's `pnpm check` on this branch reported 5230 typed-lint errors, all in another session's worktree; with that folder skipped, lint was clean. The checks in this PR had run inside a worktree, which contains no `.claude/worktrees`. |

### Implemented outcome (2026-11-02)

- **Packages.** `@playwright/test` 1.64.1 and `@storage-minis/db`
  (`workspace:*`) in `apps/web`, `eslint-plugin-playwright` 2.12.1 at the
  root. `pnpm-workspace.yaml` is unchanged.
- **Configuration.** `apps/web/playwright.config.mts` as PW-03, PW-06 and
  PW-08 write it; `tsconfig.e2e.json`, referenced by `apps/web/tsconfig.json`
  and run by the web `typecheck` script; `playwright.config.mts` in
  `tsconfig.node.json`.
- **Task.** `@storage-minis/web#test:e2e` after `^build`, uncached, passing
  through `PLAYWRIGHT_BROWSERS_PATH` and `DATABASE_URL`, and the root
  `pnpm test:e2e`. `pnpm check` is unchanged.
- **Harness.** `e2e/support/test.ts` (`tapOrClick`, the automatic console
  fixture with `expectConsole`, `expectNoSidewaysScroll`), `support/app.ts`
  (the `/app` specs' `test`, PR 3's plug-in point) and `support/names.ts`
  (`en` and `pt` from the catalogs, `fill`, `languageSwitchName`,
  `documentTitle`). The language names live in the import-free
  `src/i18n/languages.ts`, re-exported by `i18n.ts`.
- **Specs.** `signed-out/pages` and `signed-out/language`, and `app/navigation`,
  `app/echo` and `app/pages`, with the PW-11 tests: 23 in `desktop-chrome`
  and 22 in `pixel-7`.
- **Lint and ignores.** The plugin's recommended rules for
  `apps/web/e2e/**`, the `tapOrClick` restriction for specs, and the
  `.gitignore`, `.prettierignore` and ESLint ignore entries of PW-08, and
  `.claude/**` in the ESLint global ignores.

**Evidence (2026-11-02, branch `feat/playwright`):**

- `pnpm install --frozen-lockfile` passes; `pnpm-workspace.yaml` has no
  `minimumReleaseAgeExclude` entry and no new `allowBuilds`. `pnpm peers check`
  finds no issue.
- `pnpm check`: 9 tasks and 194 unit tests, unchanged, after each commit
  group. Right after an end-to-end run, 9 of 9 cached.
- `playwright test --list`: 45 tests in 5 files, 23 `desktop-chrome` and
  22 `pixel-7`, no other project.
- `pnpm db:up`, then `pnpm test:e2e` three times: 45 passed each time, in
  20.4, 21.7 and 21.2 s with 5 workers. A fourth run on the finished branch,
  with the host on `TZ=UTC`, passed 45 in 20.9 s.
  `pnpm test:e2e -- --project=pixel-7` ran 22 tests, none in `desktop-chrome`.
- With a failure's report (2.4 MB) and trace present, `pnpm lint` and
  `pnpm format:check` pass.
- `pnpm test:api` 27 and `pnpm test:db` 29, unchanged. `pnpm test:stack` 5 on
  an image rebuilt with the new lockfile.
- Each guard broken on purpose failed, and passed again when restored:

  | Guard | Broken by | Failed with |
  | --- | --- | --- |
  | Console policy | The `The above error occurred in` declaration removed; the 502 declaration removed; `height="auto"` on the drawer; an error thrown from a timer | `console output the test did not declare`, with React's error-boundary message, four `status of 502 (Bad Gateway)` errors, `` [antd: Drawer] `height` is deprecated `` and `pageerror: Error: deliberate page error` |
  | No sideways scroll | A 480 px minimum width on the Login logo | Pixel 7 only: `the page scrolls sideways`, 496 > 412 |
  | Time zone pin | `timezoneId` removed, host `TZ=UTC` | Both projects: `"timeZone": "UTC"` and `"day": "Nov 1"` |
  | Project tags | `grepInvert` removed from `desktop-chrome` | The `@phone` drawer test fails on desktop |
  | No server reuse | A server on 5173; a server on 3000 answering 200 at `/health/ready`, as `pnpm dev`'s API does | `http://localhost:5173 is already used` after `[api]` reports `listening`; `http://127.0.0.1:3000/health/ready is already used` before any server starts |
  | Test database only | `DATABASE_URL` naming `storage_minis_dev` | `Database integration tests require a database whose name ends in _test.`, no server started |
  | Databases stopped | `pnpm db:down` | Within about 1 s, `database_readiness_failed` with `ECONNREFUSED`, then `Process from config.webServer was not able to start. Exit code: 1` |
  | Browser path | `PLAYWRIGHT_BROWSERS_PATH` naming an empty folder | With the pass-through, `Executable doesn't exist at <folder>/chromium_headless_shell-1248/…`; with `PLAYWRIGHT_BROWSERS_PATH` removed from `passThroughEnv`, the variable is dropped and the run passes from the default cache |
  | Lint | `test.only`, `expect(await …isVisible()).toBe(true)`, `waitForTimeout`, a raw `.click()`, an unawaited `toBeVisible()` | `Unexpected focused test`, `Replace isVisible() with toBeVisible()`, the `waitForTimeout` warning (blocking under `--max-warnings 0`), the `tapOrClick` message, and `no-floating-promises` with `'toBeVisible' must be awaited` |
  | Ignores | The ESLint ignores removed while a report exists | 856 lint errors |
  | Types | A wrong catalog key in a spec | `TS2339`; a near miss such as `unavailabel` gives `TS2551` ("Did you mean") |

Implementation notes, not decisions: the browser-path guard was checked with an
empty folder rather than the prototype's custom install, so no second 206 MiB
download was needed; a server on port 3000 that answers 404 at
`/health/ready` is not reused either, and the API then exits on `EADDRINUSE`.
The verification ran in a separate git worktree; because Compose names its
project after the folder, `pnpm db:up` ran from the main checkout.

This is tooling evidence, not business acceptance.

## Web shell follow-up plan approval (2026-11-02)

**Owner approval:** On 2026-11-02 the owner approved the
[web shell follow-up plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/web-shell-follow-up-plan-2026-11-02.md), SF-02–SF-06,
as written, after ruling on the three shell issues that the
[PR 2 approval](#frontend-pr-2-playwright-plan-approval-2026-11-02) left to
this follow-up. It belongs to
[#118](https://github.com/WilliamPhilippe/storage-minis/issues/118) and is not
yet implemented; one implementation PR follows PR 2 and adds the outcome and
the evidence here. Choices the plan does not settle, and deviations that
implementation forces, still need approval.

**The owner's answers (2026-11-02):**

1. **Hover-only labels in the collapsed SideNav are not a defect.** In the
   owner's words: "Nothing depends on hover on mobile. The sidebar doesn't
   appear on mobile, it's replaced by the floating button at the bottom-right
   corner." The brand book's principle covers phones, where the MenuFab
   replaces the SideNav. From `bp-md` the SideNav stays as built: collapsed by
   default up to `bp-lg`, with antd's hover tooltips, as SideNav.md approved.
   SF-01 is withdrawn, and touch tablets stay with T04's device checks.
2. **The bottom safe area:** "Should be addressed" (SF-02, SF-03).
3. **The drawer's height on small phones:** "Should be addressed" (SF-04).

**Rationale.** antd 6.6.8 derives the FloatButton's offsets from the global
tokens `marginLG` and `marginXXL`, which `theme.components.FloatButton` can
set, so the design's position takes two component tokens and one CSS Module
class. That stays within the 2026-11-01 rule: antd's own styling unless a theme
token or one CSS Module class reaches the design. The drawer's footer and
height each take one class, on our own element or through antd's semantic
`classNames.section`.

| Item | Approved outcome |
| --- | --- |
| SF-01 | Withdrawn: the collapsed SideNav is not a defect. |
| SF-02 MenuFab position | `fab-offset` (16 px) from the right and bottom, plus `env(safe-area-inset-bottom)`: the FloatButton component tokens `marginLG: 16` and `marginXXL: 16`, and one CSS Module class that adds the inset as a bottom margin. |
| SF-03 Drawer footer | The language switch inside our own element, whose one CSS Module class adds the inset as bottom padding. |
| SF-04 Drawer height | At most `100dvh` minus `header-height-phone` (56 px), through one CSS Module class on antd's `classNames.section`; the menu list scrolls between the title and the footer. |
| SF-05 Tests | No new jsdom test. After PR 2, Playwright checks of the FAB's 16 px offsets and of the drawer at 412 × 500, and a safe-area test through the experimental CDP command `Emulation.setSafeAreaInsetsOverride` only if a prototype shows that it changes `env()`. Real devices under T04. |
| SF-06 Delivery | The owner updates the Claude originals first; the implementation PR refreshes `docs/design/` (MenuFab.md, `ant-design.md` and the items the 2026-11-01 record left pending). This docs PR, then one implementation PR after PR 2, "Part of #118". |

**What approval changes in approved documents:**

- The PR 1 [implementation-time decision](#implementation-time-decisions-2026-11-01)
  "Hard-to-override styles": its first kept default, the MenuFab at antd's
  24 px and 48 px, is reversed. The drawer menu's 14 px text and the drawer's
  square top corners stay. Until the implementation PR, the FAB keeps antd's
  position.
- The design reference: MenuFab.md's account of how the FAB is placed, and two
  additions to its drawer bullet (the footer's inset and the short-screen
  cap); the FloatButton entry in `ant-design.md`'s theme.
- WS-08's FAB text, which places the button `fab-offset` plus the inset from
  the bottom, becomes true again once implemented.

**Left to the implementation PR and T04.** The implementation measures the
drawer's height (about 555 px, computed from antd's source) and prototypes the
CDP override. T04 checks an iPhone with a home indicator in Safari, with its
bars shown and collapsed; an Android phone on Chrome 135 or later, with gesture
and three-button navigation; an SE-sized iPhone; and a phone in landscape below
`bp-md`. Outside the plan, and left to T04: landscape side insets under
`viewport-fit=cover`, and Chrome's bottom bar with content padded by the moving
inset.

**Owner change at implementation (2026-11-03):** instead of merging the
docs-only PR ([#123](https://github.com/WilliamPhilippe/storage-minis/pull/123)),
the owner had the plan implemented in one PR that carries the plan, this record
and the code ([#125](https://github.com/WilliamPhilippe/storage-minis/pull/125)),
and #123 was closed. PR 2 had merged as #124, so SF-05's Playwright checks are
part of it.

### Implemented outcome (2026-11-03)

- **FAB (SF-02).** `theme.ts` sets `FloatButton.marginLG` and `marginXXL` to
  16, `fab-offset`; `MenuFab.module.css`'s `fab` class adds
  `env(safe-area-inset-bottom)` as `margin-block-end`.
- **Drawer footer (SF-03).** The language switch sits in a `div` whose
  `drawerFooter` class pads its bottom by the inset, inside antd's 8 px footer
  padding.
- **Drawer height (SF-04).** `classNames={{ section: styles.drawer }}`, whose
  class caps the section at `calc(100dvh - var(--header-height-phone))`; antd's
  body scrolls the menu.
- **Tests (SF-05).** No new jsdom test. `e2e/app/navigation.spec.ts` adds three
  `@phone` tests: the FAB 16 px from the right and bottom; a 34 px bottom inset
  through `Emulation.setSafeAreaInsetsOverride`, with the FAB 50 px and the
  language switch 42 px from the bottom; and the drawer at 412 × 500, with
  Close and the switch in view, its top at 56 px and Settings reached by
  scrolling. The collapsed-SideNav test's comment no longer points to this
  follow-up.
- **Design (SF-06).** At the owner's request (2026-11-03), Claude updated the
  design system's original in Claude (version 15), and `docs/design/` is
  refreshed from it byte for byte: MenuFab.md (the position through the
  FloatButton tokens, the footer's inset, the short-screen cap and the page
  padding's inset), `ant-design.md` (the `fab-offset` mapping, the theme's
  missing tokens and `ui/AppProviders.tsx` as the ConfigProvider's owner), and
  SideNav.md and TopBar.md (the language switch's places). The same refresh
  carries the items the 2026-11-01 record left for later, apart from the Login
  page's README, whose own original still labels the switch "English".
  MenuFab.md still asks for `radius-lg` drawer corners and 16 px menu text,
  which the 2026-11-01 decision leaves at antd's defaults.

**Evidence (2026-11-03, branch `fix/web-shell-follow-up`):**

- `pnpm install --frozen-lockfile --offline` linked the worktree's packages and
  downloaded nothing.
- `pnpm check`: 9 tasks and 194 unit tests, unchanged. The four jsdom lines
  "Not implemented: Window's getComputedStyle() method: with pseudo-elements" in
  `AppShell.test.tsx` appear with and without this change: antd's scroll lock
  measures the scrollbar when a drawer opens.
- Browser pane, with Vite from this branch on port 5174 and no API (Chromium
  reports no inset):

  | Viewport | Drawer | Drawer top | Menu body |
  | --- | --- | --- | --- |
  | 375 × 812 | 554 px (title 57, body 436, footer 61), under its 756 px cap | 258 px | 436 of 436 px, no scroll |
  | 375 × 548 | 492 px, capped | 56 px, Close at 72 px | 374 of 436 px, scrolls |
  | 667 × 375 | 319 px, capped | 56 px, Close at 72 px | 201 of 436 px, scrolls |

  At each size the FAB sat 16 px from the right and the bottom, where antd's
  defaults had put it 24 and 48 px away, and the language switch ended 8 px
  above the bottom.
- A temporary CSS edit adding 34 px to the inset rules gave the FAB a computed
  34 px margin, 50 px from the bottom, and put the switch 42 px up, so the
  one-class rule wins over antd's `margin: 0`. With the cap removed at
  667 × 375, the drawer's top sat at −213 px and Close at −197 px.
- `pnpm test:e2e` after `pnpm db:up`: 48 passed in 21.4 s, 23 in
  `desktop-chrome` and 25 in `pixel-7`. The override changes `env()` in Chrome
  Headless Shell 156, so the safe-area test stays.
- Each fix broken on purpose failed its test, and passed again when restored:

  | Broken | Failed with |
  | --- | --- |
  | `marginLG`, `marginXXL` and the drawer cap removed | the offsets test, 24 for 16; the safe-area test, 82 for 50; the short-screen test, a drawer top of −54 for 56 |
  | The FAB's inset margin removed | the safe-area test, 16 for 50 |
  | The footer's inset padding removed | the safe-area test, 8 for 42 |

- `pnpm lint`, the web `typecheck` (with `tsconfig.e2e.json`) and Prettier
  pass. The change logged no console warning.

Implementation notes, not decisions: because Compose names its project after
the folder, the databases were started with `pnpm db:up` from the main
checkout, as for PR 2, and stopped again afterwards; the browser pane's server
came from a local, uncommitted `.claude/launch.json`.

This is tooling evidence, not business acceptance.

## T02 record and sign-in plan approval (2026-11-04)

**Owner approval:** On 2026-11-04 the owner approved, as recommended:

- [T02's record](t02-authentication-record-2026-11-03.md), AU-01–AU-12, for
  [T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22);
- the [sign-in plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/sign-in-plan-2026-11-03.md), SI-01–SI-19, for frontend PR 3
  ([#118](https://github.com/WilliamPhilippe/storage-minis/issues/118)), planned at
  the owner's request of 2026-11-02 as one feature across the API and the web app.

Before approving, the owner asked why the API verifies tokens with `jose` rather
than `firebase-admin`: it needs only verification. `firebase-admin` would add about
67 MiB and 172 packages to the API image, and its revocation and admin features need
a server credential this design avoids. Nothing is implemented yet: PRs 3a and 3b
follow, each adding its outcome and evidence here. Choices the plan does not settle,
and deviations that implementation forces, still need approval.

**Answered after approval (2026-11-04):**

- The development Organization is named `wipminis`, with the nickname `wipminis` and
  BRL; these are the `BOOTSTRAP_*` values of `.env.development` in PR 3a.
- AU-08's role capabilities and AU-10's no-access rule stay in T02's record only for
  now, not in requirements v0.9.

**Owner changes after the gap review (2026-11-04):**

- **New epic:** [Epic E14 / #127](https://github.com/WilliamPhilippe/storage-minis/issues/127),
  "Sign-in and session features", takes the follow-ups:
  - failed token refreshes in the browser ([#128](https://github.com/WilliamPhilippe/storage-minis/issues/128));
  - records of revocations and identity rebinds ([#129](https://github.com/WilliamPhilippe/storage-minis/issues/129));
  - the TopBar account menu, with the user badge (#1), "Sign out of all devices",
    `session.signOutEverywhere` and the design documents' update
    ([#130](https://github.com/WilliamPhilippe/storage-minis/issues/130));
  - Google's consent screen for production ([#131](https://github.com/WilliamPhilippe/storage-minis/issues/131)).
- **PR 3b's sign-out:** only a Sign out button, top right on desktop and at the bottom
  of the menu drawer on phones.
- **Google outages:** accepted; `/health/ready` stays database-only.
- **Translations:** every en-US string a PR creates gets its pt-BR translation in the
  same PR, written by the implementing agent (now in AGENTS.md's conventions).
- **Assumptions:** the plan's unverified assumptions are accepted, and PR 3b still
  checks them.
- **Personal data:** deletion on request is out of scope, because the system is for
  internal use.

**Owner answers in the plan review (2026-11-04):**

- **Access before invitations:** only the owner uses the app; no operator SQL grants
  Memberships.
- **Test-token signing:** the owner's main Google account, as SI-15 planned. The owner
  accepts that its login file can do anything that account can, production included.
  The file lives only in gcloud's default folder on this machine, never in the
  repository; agents' test runs read it, and agents never open it themselves.
- **Strangers in production:** their stray Firebase user records are accepted;
  disabling account creation is reconsidered with invitations.
- **Spreadsheet import (T05, #25):** an in-app feature in the active Organization that
  never creates an Organization; T05 decides its minimum role.
- **`E2E_SIGNER_SERVICE_ACCOUNT`** stays in `.env.test` rather than Doppler.
- **Database structure:** the plan gained section 3, which records why sign-in stores
  only `users.sessions_valid_after` (no token expiry, token ID, refresh token or
  session table). No decision changed.

**Rationale.** The record settles the session policies that the
[frontend decisions](#frontend-foundation-decisions-2026-11-01) left to T02, around the
approved Google-only Firebase sign-in, and the plan splits delivery so each PR works
on its own. A scratch prototype against `storage-minis-dev` (2026-11-03) confirmed:

- Google popup sign-in and keyless custom tokens, signed through IAM as the no-role
  `e2e-custom-tokens` service account with the owner's gcloud login;
- that the SDK refreshes a saved session before the app sees it, hence the startup
  check;
- that `jose` accepts a future `iat` unless checked;
- that `user.metadata.lastSignInTime` is not a reliable sign-in time.

An independent review against the sources and the prototype corrected both documents
before approval.

| Item | Approved outcome |
| --- | --- |
| AU-01 Identity | Firebase ID tokens of the configured project only; a User is its `firebase_uid`; email is never an authorization key after the bootstrap; providers `google.com`, and `custom` only under the test opt-in. |
| AU-02 Persistence | Local: IndexedDB, then localStorage; sessions survive browser restarts until sign-out, revocation or the 7-day limit. |
| AU-03 Session limit | Checked before Firebase loads a saved session, before each request, and by the API; no idle timeout. |
| AU-04 Logout | This browser only; other tabs follow. |
| AU-05 Revocation | `users.sessions_valid_after`, set by an operator now and by "Sign out of all devices" with #130; Membership deletion revokes that Organization at the next request. |
| AU-06 Recovery | Google's own; an operator procedure rebinds a lost account's new uid. |
| AU-07 Bootstrap | The configured owner email's first verified Google sign-in, while no Organization exists, creates the `global_admin` User with `can_edit_products`, the first Organization (name, nickname, BRL), the owner Membership and audit, in one transaction. |
| AU-08 Roles | Membership `viewer` reads, `editor` writes, `owner` also manages settings; `global_admin` holds platform actions only, with no implicit Organization access; global `editor` grants nothing yet; `can_edit_products` alone governs existing-Product edits. |
| AU-09 Procedures | Identity, User, Organization (minimum role) and platform builders; public builders stay module-private; the Organization comes from `x-organization-id` checked against Membership; another Organization's records behave as nonexistent. |
| AU-10 No Membership | No User row; the Login page's "No access" state; signed out of Firebase. |
| AU-11 Test sign-in | `AUTH_TEST_SIGN_IN=enabled` in `.env.test` only, refused with `NODE_ENV` `production` or unset, `e2e-` uids only, tokens minted by Playwright through keyless IAM signing. |
| AU-12 Acceptance | 25 cases mapped to tests. |
| SI-01 Delivery | PR 3a (API identity and authorization) and PR 3b (web sign-in and the Playwright session). |
| SI-02 Pins | `jose` 6.2.15 (API), `firebase` 13.2.0 (web), `firebase-admin` 14.5.0 and `zod` 4.6.7 (web devDependencies); `allowBuilds: false` for `@firebase/util@1.15.3` and `protobufjs@7.6.6`. |
| SI-03 Configuration | `FIREBASE_PROJECT_ID` (required), `AUTH_TEST_SIGN_IN`, `BOOTSTRAP_*` (development only until T04); committed `apps/web/.env.development` and `.env.production`, checked by `vite.config.mts`. |
| SI-04 Schema | `organizations.nickname` (unique; provisional rule until D04) and `currency` (`BRL` default, `USD`); `users.sessions_valid_after`. |
| SI-05–SI-08 API | `jose` verification against Google's JWK set with the claim, 7-day, provider and revocation checks; an identity store injected by the lifecycle; `session.get` and `session.signOutEverywhere`; the bootstrap under an advisory lock. |
| SI-09–SI-13 Web | Firebase loaded lazily with no resolver at startup; the startup check; popup unless `authDomain` is the app's host and the pointer is coarse; Login states 2–4; the `/app` guard and request headers; a Sign out button, top right on desktop and at the bottom of the menu drawer on phones. |
| SI-14 Keys | Both browser keys restricted to their sites and to the Identity Toolkit and Token Service APIs, applied by the owner during PR 3b. |
| SI-15 Credential | Each developer's gcloud Application Default Credentials and Service Account Token Creator on `e2e-custom-tokens`; no key file, no Doppler locally. |
| SI-16–SI-17 Tests | Verifier and config unit tests; an auth suite in `test:api`; a shared test-database helper kept out of the image; a Playwright setup project that seeds, mints, signs in and saves IndexedDB state. |
| SI-18 PR 4 | The `/__/auth/` proxy, the `authDomain` switch, the OAuth redirect URI, authorized domains, key referrers and the CSP. |

**What approval changes in approved documents:**

- **W11:** PR 3 becomes PRs 3a and 3b.
- **W6:** firebase 13.2.0 raised the SDK's refresh margin from 30 seconds to 5
  minutes.
- **W8:**
  - the startup mechanism is confirmed;
  - the custom-token opt-in narrows to `.env.test`, gains the `NODE_ENV` lock and
    the `e2e-` uid rule;
  - redirect follows a coarse primary pointer.
- **W10:** the web values live in Vite's committed mode files rather than in Turbo's
  `env` list.
- **P5-06:** identity is verified in guarded middleware, not in `createContext`;
  tRPC modules keep importing only types from `@storage-minis/db`.
- **Implementation guide gates:** T02's decisions are made. The nickname, currency and
  revocation columns cross the T01 gate for business schema migrations by this
  explicit approval.
- **#117:** its two columns arrive with PR 3a.
- **Login design:** state 4 omits the email for a test user without one.
- **TopBar design:** a Sign out button stands where the account menu will go (#130).

### PR 3a implemented outcome (2026-11-05)

PR 3a, API identity and authorization (SI-01), implemented in
[PR #132](https://github.com/WilliamPhilippe/storage-minis/pull/132) in four commit groups. The web app is unchanged and still calls only the public
`diagnostics.echo`.

**Implementation-time approvals (2026-11-05).** The plan did not settle two
points; the owner approved each recommendation:

| Topic | Approved outcome | Why |
| --- | --- | --- |
| Drizzle operators for the identity store | `@storage-minis/db` re-exports `and`, `asc`, `eq` and `sql` from `drizzle-orm`; `apps/api/src/auth/store.ts` imports them, with `schema`, from the package. | `apps/api` does not declare `drizzle-orm`. Declaring it without `pg` would make pnpm resolve a second peer variant of `drizzle-orm` (it has 29 optional peers), whose `SQL` types conflict with the DB package's. The re-export keeps one instance and adds no dependency. |
| The test-database helper in the image build | `docker/api.Dockerfile` copies `packages/db/testing` into the build stage. The DB package's `build` compiles it to `dist-testing/`, outside `files`, so `pnpm deploy --prod` leaves it out of the runtime image, as SI-16 requires; `test:stack` lists the shipped package. | The image's `pnpm build` compiles the DB package, now including the helper. The alternative, the source under `src/testing/`, would put test-only code in `src`. |

**Outcome:**

- **Configuration (SI-03):** `readApiConfig` reads `FIREBASE_PROJECT_ID`
  (required, Google Cloud's project ID format), `AUTH_TEST_SIGN_IN` (unset or
  `enabled`; the API refuses to start with it when `NODE_ENV` is `production` or
  unset) and `BOOTSTRAP_*` (all three or none; the email trimmed and lowercased,
  the currency BRL by default). Both committed env files name
  `storage-minis-dev`; `.env.development` carries the owner's `wipminis`
  bootstrap. `compose.yaml` maps `FIREBASE_PROJECT_ID` only. Turborepo passes the
  new names through the API's `dev`, `start` and `test:process` tasks, never
  `AUTH_TEST_SIGN_IN`; `test:process` also passes `MIGRATION_DATABASE_URL` for its
  new global setup.
- **Schema (SI-04):** migration `0002_organization_nickname_currency_session_revocation`
  adds the `organization_currency` enum, `organizations.currency` (default `BRL`),
  `organizations.nickname` (unique `organizations_key_1`, check
  `organizations_nickname_format`) and `users.sessions_valid_after`. The DB
  package exports the provisional rule as `organizationNicknameRule`, which builds
  the check constraint and validates the bootstrap nickname. The DBML matches.
- **Verification (SI-05):** `apps/api/src/auth/id-token.ts`, jose against Google's
  JWK set, with the plan's checks. One addition: `aud` must equal the project ID
  as a string. jose alone accepts an array containing it, Firebase always sends
  the string, and `firebase-admin` compares strings. A key-source failure is a
  500, through an internal `KeySetUnavailable` error; jose's verdict on the token
  is a 401 with an `IdentityRejected` cause.
- **Context and builders (SI-06):** the context is `{ db, requestId, auth }`;
  `auth` holds the raw `authorization` and `x-organization-id` headers, the
  verifier, the identity store and the bootstrap settings. `trpc/procedures.ts`
  exports `identityProcedure`, `userProcedure`, `organizationProcedure(minRole)`,
  `platformProcedure` and `requireCanEditProducts`. The 403 and 400 causes are
  `AccessDenied` with the reasons `user_missing`, `organization_header_invalid`,
  `membership_missing`, `role_too_low`, `global_admin_required` and
  `product_edit_required`. The lifecycle builds the verifier and the store
  (`auth/store.ts`), so tRPC modules still import only types from
  `@storage-minis/db`. The store has no `revokeSessions`: nothing calls it before
  #130's `session.signOutEverywhere`.
- **`session.get` and the bootstrap (SI-07, SI-08):** as planned. The bootstrap's
  advisory lock key is `0x534D424F4F543031` (the ASCII bytes of `SMBOOT01`); its
  change row uses `change_kind` `membership.grant`; `granted_at` and
  `occurred_at` take the transaction's `now()`.
- **Tests (SI-16):** `@storage-minis/db/testing` holds the former `test:db`
  preparation, now shared with `test:api`'s new global setup. Verifier, policy,
  builder, `session.get` and configuration unit tests run on fakes and a local key
  set; `apps/api/tests/auth.integration.test.ts` runs the database-backed AU-12
  cases on the real `buildApp`.
- **Documentation:** the [local development reference](local-development.md#sign-in-and-authorization)
  documents the contracts, the bootstrap and the AU-05 and AU-06 operator SQL;
  the README covers the configuration and the guarded builders.

**Evidence (2026-11-05, branch `feat/api-auth`):**

- `pnpm install --frozen-lockfile` passes; `jose` 6.2.15 (published
  2026-11-01 22:28 UTC, still the newest) is the only new package, and
  `pnpm-workspace.yaml` is unchanged.
- `pnpm check`: 242 unit tests in 27 files (from 194 in 23): 13 verifier, 5
  policy, 12 builder, 8 `session.get` and 10 configuration tests.
- `pnpm build` passes.
- `pnpm test:db`: 31 (from 29), through the shared helper; two new tests cover
  the nickname's uniqueness and format (against `organizationNicknameRule`), the
  currency and the revocation column.
- `pnpm test:api`: 50, from 27. The process suite has 32 (five configuration
  refusals added, among them the test opt-in with `NODE_ENV` `production` and
  unset); the auth suite has 18.
- `pnpm test:e2e`: 48, unchanged.
- `pnpm test:stack`: 5 on rebuilt image
  `sha256:ee333bb76945d5f5a1f76d13cc2bdbb3984509967bcd93165225ef44b65ec8ab`; the
  image's `node_modules/@storage-minis/db` holds only `dist`, `drizzle` and
  `package.json`.
- Google's live JWK set (two RS256 keys on 2026-11-05) loads through the built
  verifier, and a token signed by another key is refused as `token_invalid`
  (`JWKSNoMatchingKey`), not a 500.
- Guards broken on purpose, each caught: the 7-day check removed (verifier unit
  test), any provider accepted (two unit tests), the opt-in's `NODE_ENV` lock
  removed (configuration test), a runtime `@storage-minis/db` import in
  `routers/session.ts` (`app.test.ts` and `plugin.test.ts` fail on their mock),
  revocation compared with `<` instead of `≤ ⌈cutoff⌉` (policy test), the
  Membership lookup skipped (three integration tests), `sessions_valid_after`
  ignored (case 14), the `authorization` header logged (every integration test's
  log check), and the bootstrap's re-check under the lock removed (case 3).
- Not exercised in PR 3a: a live Google ID token and the manual development
  bootstrap, which need PR 3b's sign-in.

This is tooling and integration evidence; business acceptance of authorization
waits for the business procedures that use it.

### PR 3b implemented outcome (2026-11-06)

PR 3b, web sign-in and the Playwright session (SI-01), implemented on branch
`feat/web-sign-in` in the plan's five commit groups, plus one fix that
verification found. The pins were re-checked on
2026-11-06 and are unchanged: firebase 13.2.0, firebase-admin 14.5.0 and zod 4.6.7
were still the newest releases at least 24 hours old.

**Implementation-time approvals (2026-11-06).** The plan did not settle three
points; the owner approved each recommendation:

| Topic | Approved outcome | Why |
| --- | --- | --- |
| Google's "G" | Download Google's sign-in branding bundle (`signin-assets.zip`, 855,303 bytes, last modified 2026-06-29) into the session scratchpad and commit only its standard "G" as `apps/web/src/ui/assets/google-g.svg`: the web "Theme=Light, Show text=No, Shape=Square" button without its background and border, with the viewBox cropped to the G. The drawing is unchanged. | Google's rules require the standard-colour G and forbid an outdated one; the bundle carries the current gradient G only inside buttons, and Google says custom sizes start from the bundle. |
| The Google button | Keep the approved design: antd's primary ink button and the system font, with the G on a white circle. Google's custom-button font (Google Sans Medium 14/20) and its dark fill (#131314 with #E3E3E3 text) are a recorded gap. | The G keeps its colours on white, as Google requires. Following Google's font and fills would need a font download and overrides beyond the light-override rule. |
| Commits | Each group committed locally on `feat/web-sign-in` as finished; push and PR only on the owner's word. | Keeps section 5's groups separate. |

**Owner change during review (2026-11-06):** Sign out moves to the language
switch's places, right above it: the SideNav's footer from `bp-md` and the menu
drawer's footer below it, replacing SI-13's top right of the TopBar. The TopBar
keeps only the page title, or the logo on phones, until #130's account menu.
Like its neighbours it is a text button. In the collapsed SideNav it shows its
icon alone and keeps its name, as the language switch does, and at the owner's
request it shows that name in a tooltip on the right, as antd does for the
collapsed menu's items.

**Outcome:**

- **Configuration (SI-02, SI-03):** the pins and two `allowBuilds: false`
  entries; Vite's mode files `apps/web/.env.development` (`storage-minis-dev`)
  and `.env.production` (`storage-minis`), tracked through `.gitignore`;
  `vite.config.mts` checks the four `VITE_FIREBASE_*` values with Zod, naming
  variables, never values, and refusing unknown ones such as a
  `measurementId`; `vite-env.d.ts` types them with `strictImportMetaEnv`.
  `turbo.json` passes `MIGRATION_DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS`
  and `CLOUDSDK_CONFIG` to `test:e2e`. `.env.test` gains `AUTH_TEST_SIGN_IN`,
  which only Playwright's API receives, read from the file, and
  `E2E_SIGNER_SERVICE_ACCOUNT`.
- **Session layer (SI-09, SI-10, SI-12):** `apps/web/src/lib/session/`.
  `firebase.ts`, the only Firebase import, sits behind a small `AuthPort`;
  `savedSession.ts` is the startup check; `session.ts` loads Firebase when a
  route asks for the session, remembers `auth_time` and the active
  Organization, adds `Authorization` and `x-organization-id` through the tRPC
  link, signs out instead of refreshing past 7 days, signs out on
  `UNAUTHORIZED`, reloads the session on `FORBIDDEN`, never signs out on a 5xx,
  and turns Firebase sign-ins and sign-outs in other tabs into guard runs. The
  session reaches routes through the router context (TanStack's pattern for
  authentication); `useSession()` reads the member session under `/app`.
- **Login page and Sign out (SI-11, SI-13):** states 2–4, error alerts and an
  info alert for "Your session ended"; Google's G; the Sign out button right
  above the language switch, in the SideNav's footer from `bp-md` and in the
  menu drawer's footer below it (the owner's change below). en-US and pt-BR
  strings together.
- **Playwright (SI-15, SI-17):** a `setup` project that resets, migrates and
  seeds the test database, mints a custom token through IAM, signs in through
  the development-only hook and saves the IndexedDB session; an outside-origin
  fixture; new signed-out and signed-in specs (AU-12 cases 4, 7, 8, 10, 12 and
  24).

**Choices within the plan**, recorded for reviewers (no new decision):

- `/login`'s `redirect` is validated by a plain function, since SI-02 keeps Zod
  a web devDependency. The validator always returns the key, `undefined` when
  refused, because TanStack Router merges the URL's raw search into each match:
  a validator that omitted the key let `?redirect=https://example.com/app`
  through to a full-page redirect off the site, which a component test caught
  during implementation. The guard checks the target again before redirecting.
- State 4's email and "Your session ended" travel in the session's memory, never
  in the URL.
- `/login`'s guard keeps the page reachable when the session can't load (a
  server or network failure); signing in then reports it in an alert.
- Copy written during implementation, in both languages: state 4's variant for
  a user without an email, the Copy link failure, and "Sign out" ("Sair").
- **A fix found during verification** (`fix(web): title a page only once its
  strings have loaded`): the shell took the document title's key from a route
  match that was still loading. Once the `/app` guard outlasts the router's
  1 s pending delay, the root layout renders before `/app`'s loader adds the
  "app" strings, and the title kept the raw key ("titles.inventory ·
  StorageMinis"); `pnpm test:e2e` caught it once in the pt-BR shell test. A
  match now names the page only when it and every match above it have
  finished, or when it is the failed one. A `web-unit` test reproduces it with
  a guard slower than the pending delay; the pt-BR test then passed ten times in
  a row.

**Gaps kept as antd defaults (light-override rule):**

- State 2's button uses antd's loading style (ink at the `opacityLoading` 65%)
  rather than the ink-hover fill.
- The icon gap is antd's 8 px (`marginXS`) rather than the prototype's 12 px; a
  global `Button.iconGap` would change every icon button.
- The G is 18 px on a 24 px white circle; the prototype's 20 px circle held a
  placeholder letter.
- State 4's alert is antd's error alert: a filled icon and a red border.
- Google's button font and fills, as approved above.

**Evidence (2026-11-06, branch `feat/web-sign-in`):**

- A fresh `pnpm install --frozen-lockfile` (workspace `node_modules` removed)
  cloned 627 packages from the store and downloaded none. Only the two
  `allowBuilds: false` entries are new; no other build script was blocked and no
  `minimumReleaseAgeExclude` entry was written. Side effect: Vitest's optional
  `@opentelemetry/api` peer now resolves, brought by `@firebase/crashlytics`
  (inside firebase 13.2.0) and Firestore (inside firebase-admin); the app
  imports neither.
- `pnpm check`: 362 unit tests in 33 files (from 242 in 27); `web-unit` has 194
  in 17 (from 74 in 11): the startup check's decoding against the 13.2.0 record
  shape and the 7-day rule, popup or redirect, in-app detection, the redirect
  parameter, the session service, the link's headers, `UNAUTHORIZED`,
  `FORBIDDEN`, cross-tab sign-out, the guard, `useSession()`, the Login page's
  states, the Sign out button and the page title after a slow guard.
- `pnpm build` passes. The Firebase chunk is 95.22 kB (28.46 kB gzip); only the
  main entry references it, through the session layer's dynamic `import()`;
  `index.html` doesn't preload it and the catalog's route chunk doesn't import
  it. `grep -r __storageMinisTest apps/web/dist` finds nothing.
- On `vite preview`, `/catalog/demo` made 19 requests, all to
  `localhost:4173`: no Firebase chunk and no Google request. The catalog's
  Playwright test asserts the same in development.
- `pnpm test:db`: 31. `pnpm test:api`: 50. `pnpm test:e2e`: 67 (from 48): the
  setup, 32 in `desktop-chrome` and 34 in `pixel-7`; it passed again three
  times after the key restrictions.
- `pnpm test:stack`: 5 on rebuilt image
  `sha256:e7cb3f84a111cf42f70e6c933872587a862ab7c3758f5b19a2d082a76af89f62`.
- The popup spec's outside origins, observed in both projects:
  `https://storage-minis-dev.firebaseapp.com` (Firebase's iframe and handler)
  and `https://apis.google.com`. Closing the popup as its navigation commits
  keeps Google's account pages out.
- Guards broken on purpose, each caught:
  - the startup check skipped: the 8-day test saw
    `securetoken.googleapis.com/v1/token` and `accounts:lookup`;
  - `apis.google.com` undeclared: the outside-origin fixture failed;
  - Firebase loaded at startup: the catalog test listed `firebase.ts` and
    Vite's `firebase_app` and `firebase_auth`;
  - the hook's `import.meta.env.DEV` condition removed: the build emitted
    `testSignIn-*.js` with the name;
  - the link's 7-day check removed: the case 11 unit test failed;
  - the redirect validator omitting the key: the redirect tests failed.
- The owner's gcloud Application Default Credentials (SI-15) were set up on
  2026-11-06; the setup project then minted through IAM.
- **Key restrictions (SI-14), applied by the owner on 2026-11-06:** both
  browser keys allow only their sites and the Identity Toolkit and Token
  Service APIs. The console's page for these Firebase-created keys showed no
  API restrictions section (Firebase restricts its keys to Firebase-related
  APIs itself, since May 2024), so the owner set both with `gcloud services
  api-keys update KEY_ID --allowed-referrers=<every site>
  --api-target=service=identitytoolkit.googleapis.com
  --api-target=service=securetoken.googleapis.com`; each flag restates its
  whole list. For the dev key, Google first refused to drop the Firebase
  Installations API, which the key had used within 7 days: that use was one
  request an agent sent while checking the restrictions, which registered an
  anonymous installation; the app never calls that API. The owner then added
  `--no-check-existing-usage`. Results, by `curl` against
  `GET identitytoolkit.googleapis.com/v1/projects` and a read-only Firebase
  Management API call:

  | Key | Referrer | Result |
  | --- | --- | --- |
  | Dev | `https://example.com/`, the prototype's `http://localhost:5180/`, none | 403 `API_KEY_HTTP_REFERRER_BLOCKED` |
  | Dev | `http://localhost:5173/`, `https://storage-minis-dev.firebaseapp.com/` | 200 |
  | Dev | `http://127.0.0.1:5173/` | 403 ("Requests from referer http://127.0.0.1:5173/ are blocked."); Firebase doesn't authorize that host either |
  | Dev | Another Firebase API from an allowed site | 403 `API_KEY_SERVICE_BLOCKED` |
  | Production | `https://example.com/`, none | 403 `API_KEY_HTTP_REFERRER_BLOCKED` |
  | Production | `https://storage-minis.firebaseapp.com/` | 200 |
  | Production | Another Firebase API from its site | 403 `API_KEY_SERVICE_BLOCKED` |

  The `firebaseapp.com` entry stays as planned: popup sign-in works with it,
  and whether it could go was not tested. PR 4 or T04 adds the app's domain
  to the production key's referrers the same way.
- **Manual check (owner, 2026-11-06):** with `pnpm dev`, a Google popup
  sign-in at `http://localhost:5173/login` on the empty development database
  ran the bootstrap and opened `/app` with Sign out; Sign out returned to
  state 1; a second Google account saw "No access". The development database
  then held one User (`global_admin`, `can_edit_products`), the Organization
  `wipminis` (nickname `wipminis`, BRL), the owner Membership, one
  `organization.bootstrap` event with its change row, and no row for the second
  account. A first attempt from `http://127.0.0.1:5173`, the address Vite
  prints, got the key's 403: sign in on `localhost`.

**Not verified in PR 3b:** the redirect flow (PR 4's manual check through
Caddy); real phones and Safari, including how Safari renders the G's
`foreignObject` gradient (T04); Google's popup page beyond its URL.

This is tooling and integration evidence; business acceptance of the session
waits for the business screens that use it.

## Approval workflow (2026-10-23)

The owner requires agents to ask first, with a recommendation, before making any
new or changed technical or implementation decision. Follow the
[owner-approval workflow](../../AGENTS.md#owner-approval-before-decisions), including
for tooling, packages and versions, CLIs, architecture, configuration, and local
environment changes. Existing approved choices retain their recorded scope.

## Accepted application stack

| Area | Accepted choice | Scope |
| --- | --- | --- |
| Repository | One monorepo for backend/API and frontend | Applications may deploy independently to different providers. No provider has been selected. |
| Language | TypeScript with strict checking | Backend, frontend, and shared application packages. |
| Package management | pnpm workspaces | Dependency installation and internal package links. |
| Build tasks | Turborepo | Repository task scheduling and build caching; cross-provider deployment coordination remains a CI/CD decision. |
| Backend | Node.js with Fastify | Business operations remain subject to application authorization and database atomicity. |
| API contract | tRPC | Typed frontend/backend API; naming, errors, pagination, and mutation retry/idempotency conventions remain T06 design work. |
| Runtime validation | Zod | Validate API inputs; frontend validation does not replace backend validation or business constraints. |
| Frontend | React with Vite | Separate frontend application. |
| Routing | TanStack Router | Client navigation and URL state. |
| Server data | TanStack Query with the tRPC integration | Scope private caches by Organization and authentication context while preserving global Product reuse. |
| Forms | TanStack Form with Zod | Form handling and input validation; replaced React Hook Form on 2026-11-01 ([frontend foundation decisions](#frontend-foundation-decisions-2026-11-01)). |
| Database | PostgreSQL | Final schema, constraints, and transaction/concurrency design remain pending. |
| Persistence access | Drizzle ORM | Migration workflow and database-driver/version selection remain T06 work. |
| Development infrastructure | Docker Compose for PostgreSQL | Production direction (2026-10-31): the same Compose model on a single Hostinger VPS; hosting and operations details remain T04 work. |
| Environment variables | Doppler | Production values in config `prd` through a read-only VPS service token (keys created under T04). Local development and test values are committed (2026-10-31, R3/R8/R12). |
| Tests | Vitest and Playwright | Vitest for unit/integration tests, including real PostgreSQL for rollback, constraints, and concurrency; Playwright for core administrator and public-catalog workflows. |
| Lint and formatting | ESLint and Prettier | Concrete settings and commands approved in the 2026-10-23 tooling setup above. |

The choices provide shared TypeScript contracts within one repository while retaining independent frontend/backend deployment. They do not introduce additional domain features or settle unresolved business policies.

**Design system and UI conventions:** the owner preferred Ant Design on 2026-10-21 and confirmed Ant Design 6 on 2026-11-01, styled with antd theme tokens and CSS Modules, with en-US as the main UI language and pt-BR as the second, on a mobile-first layout. See the [frontend foundation decisions](#frontend-foundation-decisions-2026-11-01).

## Authentication and initial administrator

Accepted choices:

- Firebase Authentication with the Google provider only; email/password sign-in is excluded.
- Use Firebase ID tokens for API authentication. The API verifies those tokens and enforces User/Membership/Organization authorization for business access.
- Keep the user signed in through token refresh when a token expires during active use. Inactive users receive no refresh. Token expiry during active use does not require signing in again each hour.
- Support explicit logout.
- The initial administrator is the owner's personal Google account, `ctt.williamphilippe@gmail.com`, supplied on 2026-10-21 as the setup identity. The bootstrap is configured and runs on that account's first verified sign-in ([T02's record](t02-authentication-record-2026-11-03.md), AU-07, approved 2026-11-04). The owner created the Firebase projects `storage-minis` (production) and `storage-minis-dev` (development) on 2026-11-03.

Firebase documents that ID tokens last for an hour and refresh tokens can obtain new ones. Browser persistence is a separate setting. The public `getIdToken()` method can also refresh an expired or soon-expiring token when called; T02 must design token acquisition and any background activity around the accepted active-use policy. See [Firebase session management](https://firebase.google.com/docs/auth/admin/manage-sessions), [authentication-state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), and [token acquisition](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken).

Examples: while the administrator is using the system, token expiry triggers refresh and work continues without an hourly interactive sign-in. If the administrator is inactive, the client does not refresh the token. The administrator can explicitly log out. A valid Google/Firebase identity without the required application authorization does not grant access to private inventory or financial records.

**Session decisions (2026-11-01):** the [frontend foundation decisions](#frontend-foundation-decisions-2026-11-01) settled token acquisition and return after inactivity. The client requests a token only when a request needs one, and requests follow user activity only, so tokens refresh only while the user is active. Returning after inactivity refreshes on the first action. A session ends 7 days after the last Google sign-in: the API rejects ID tokens whose `auth_time` is older, and the client does not refresh such a session. There is no idle timeout. Until then no absolute or idle session timeout had been chosen.

**T02 record (2026-11-04):** the owner approved [T02's record](t02-authentication-record-2026-11-03.md), which settles the administrator bootstrap, browser persistence, logout scope and revocation, Google-account recovery, role capabilities, procedure classes and the expiry/recovery acceptance cases ([approval record](#t02-record-and-sign-in-plan-approval-2026-11-04)). Initial-admin selection uses the configured owner identity; an arbitrary first Google sign-in is not authorization. Frontend PRs 3a (2026-11-05) and 3b (2026-11-06) implement it on the API and in the web app.

## Money and dates

Accepted choices:

- Each Organization's amounts are in its own currency, chosen once when the Organization is created: BRL by default, or USD (REQ-008, ORG-010; owner, 2026-11-01). Amounts carry no currency themselves, and visitor timezone or locale does not introduce currency conversion.
- Store timestamp instants in UTC. The UI converts them for display in the visitor's timezone.
- Daily/monthly financial reports use the fixed business timezone `UTC` for all viewers, as confirmed by the owner on 2026-10-21. Visitor-local timestamp display does not change report periods.
- Preserve the distinction between the business event date and its recorded timestamp, as required by REQ-011, FIN-011, CALC-018, and the accepted shared-history model. Calendar-date input/storage semantics remain T03 work.

Example: `2026-11-01T01:00:00Z` may display as October 31 at 22:00 for a visitor in UTC-03:00. A business event dated November 1 in UTC remains in November's report for every viewer. Report membership follows UTC and the applicable source business date rather than the viewer's display timezone.

[T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) still needs exact integer-cent representation, intermediate precision and rounding, deterministic cent remainders, date-only/business-date semantics, period-filter semantics, and dated-adjustment acceptance examples. The storage and reporting timezone is settled as UTC. PostgreSQL plus Drizzle does not choose the remaining policies automatically.

## Step 3B structural schema (2026-10-25)

The owner approved the [S01–S10 schema review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/database/step-3b-schema-review-2026-10-25.md)
on 2026-10-25: “Schema is approved. Implement it.” The
[implementation/reconciliation record](../database/step-3b-implementation-2026-10-25.md)
is authoritative for the structural delivery and its named writer deferrals. At
approval the schema had 33 tables, 316 columns, 11 enums, 157 FKs, 76 row
checks, 48 unique constraints and 32 explicit indexes. The
[foundation restructure](#foundation-restructure-2026-10-31) regenerated the
migration chain as `0000_inventory_id_base36`, a custom migration, followed by
`0001_baseline`, which matches the reviewed chain except that it folds in the
customer name check (D8).

**Migration runner (owner approval, 2026-10-25):** migrations run through the
installed native `drizzle-orm/node-postgres/migrator`
([`packages/db/src/migrate.ts`](../../packages/db/src/migrate.ts)) rather than
`drizzle-kit migrate`, because Kit 0.31.11's progress renderer exits on a failed
migration without logging the error. Failures log their messages, nested causes
and driver codes with passwords redacted. Generation stays on Kit, offline.

The schema tests (`pnpm test:db`) preserve global Product reuse while rejecting
cross-Organization acquisition and event paths and cross-Customer or
cross-Supplier funding. They cover readable identity, zero and nonnegative
prices, positive cash, int32 overflow, UTC milliseconds, installment and
completion checks, opening and unknown-Supplier uniqueness, and retained
SaleItem audit identity. Overlapping PostgreSQL sessions prove one winner for
active commitments and collection membership. Full business writers, source and
cache reconciliation, permanent locks, authorization and reporting remain
deferred to their owners. The original evidence, run on the removed tooling
container, is at [commit 55a61ab](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/technical-direction.md#step-3b-structural-schema-2026-10-25).

## Remaining design and delivery boundaries

| Work item | Still required |
| --- | --- |
| [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) | Base structural keys/scope/commitment/collection uniqueness are implemented in Step 3B. Complete state-transition writers, permanent locks, aggregate/source reconciliation, typed history and actual business-operation races. |
| [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) | The record was approved on 2026-11-04 ([AU-01–AU-12](t02-authentication-record-2026-11-03.md)); frontend PR 3a implemented the API side on 2026-11-05 ([outcome](#pr-3a-implemented-outcome-2026-11-05)), and PR 3b the web side on 2026-11-06 ([outcome](#pr-3b-implemented-outcome-2026-11-06)). Invitations, role management, D06's exceptional privileges and typed identity audit remain. |
| [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) | Complete exact monetary, business-date, and period-filter rules around BRL, UTC storage/reporting, and visitor-local timestamp display. |
| [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) | Hosting, deployment and release coordination, Doppler access/integration/rotation/fallback policy, storage, daily backup retention/restore verification, recovery targets, browser/device support, performance targets, and operational monitoring. The [foundation restructure](#foundation-restructure-2026-10-31) sets direction only: single Hostinger VPS, `prd` keys, Caddy `web` image (D5), GHCR images (D9), daily `pg_dump` with tested restore (D10), and a deploy that runs `migrate` as a one-off before `up` (R19). |
| [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Inspect the real spreadsheet and agree on legacy acquisition treatment; source data is not supplied. |
| [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) | Steps 1–3B provide the workspace, local databases, typed Drizzle schema and migration replay. Step 4 delivered the diagnostic API/image/cache/lifecycle, the 2026-10-31 restructure moved them onto host Node, standard Compose, database roles and a parity stack, and Step 5 added the tRPC transport (2026-11-01). Remaining: Step 6 consolidated setup/verification (TBD until the app is validated locally), application authorization/isolation, representative business transactions/races and CI. |

T06's existing T01/T02/T04 prerequisites remain in force. The requirements continue to have their existing primary delivery owners; this record adds no duplicate delivery work. D01-D08 remain business-policy boundaries.

Hosting and operations are left to T04: the 2026-10-31 direction is a single Hostinger VPS, and no production infrastructure has been provisioned. The [documentation/backlog review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/technical-direction-review.md) records propagation to current documents and affected issue criteria. Decision and delivery issues remain open. The workspace, structural PostgreSQL tests, the API with its tRPC transport, the web shell and sign-in are implemented as recorded above; business workflows and their acceptance evidence remain pending.

### Gates before dependent work

These approved gates still apply to feature work. They moved here from the
foundation implementation guide on 2026-11-06.

| Before | Required decisions and evidence |
| --- | --- |
| Business schema migrations | [T01 / #21](https://github.com/WilliamPhilippe/storage-minis/issues/21) executable keys, constraints, transitions and transaction design; applicable [T03 / #24](https://github.com/WilliamPhilippe/storage-minis/issues/24) numeric, overflow, time and input contracts; later approved schema changes. Approved exception (2026-11-04): the sign-in plan's SI-04 added `organizations.nickname`, `organizations.currency` and `users.sessions_valid_after`. |
| Protected procedures or the administrator bootstrap | [T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22): verified identity, the configured-owner bootstrap, Membership/Organization access and global Product-edit permission. Decided in [T02's record](t02-authentication-record-2026-11-03.md) and implemented by frontend PRs 3a and 3b; business procedures start from the guarded builders. |
| Representative persistence operations | Applicable T01/T03 and business-policy decisions, then real rollback, scope, reconciliation and concurrent-session evidence for the approved operation. |
| Deployment and recovery acceptance | [T04 / #23](https://github.com/WilliamPhilippe/storage-minis/issues/23): Doppler production access, injection, rotation and fallback policy; releases and migrations; privileges; daily backups with a tested restore; operational targets. |
| Full T06 completion | The live issue's original dependencies and acceptance outputs, including real global Product reuse with private-data rejection, allocation and commitment integrity, and deletion-versus-funding or settlement-source race evidence, plus the remaining application and check delivery. |

The [Step 3B record](../database/step-3b-implementation-2026-10-25.md#deferred-writers-and-acceptance)
lists the enforcement each business writer still needs. Successful health
queries and HTTP validation do not establish business atomicity, Organization
isolation, authorization or concurrency correctness.

## Documentation cleanup (2026-10-29)

The owner selected A1–A8 and B1–B6 from the documentation map for deletion:
completed/replaced plans and prompts, completed reviews and verification records.
The six C baseline files remain. Current commands, approvals, implemented
contracts, summarized acceptance and pending Steps 5/6 remain in this repository.
Historical citations use immutable links to commit
`8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8`; completed stage instructions do not
apply to future assignments. This cleanup changes no technical or business policy.

## Documentation cleanup (2026-11-06)

**Owner approval:** On 2026-11-06, with the database, API, web shell and sign-in
in place and business features next, the owner reviewed a map of `docs/` and
approved removing two groups of files and trimming the documents that stay
("Yes, both groups").

- **Superseded or consolidated (18 files):** requirements v0.5–v0.7, ownership
  indexes v0.6–v0.7, entity maps v0.5–v0.8, the shared PurchaseExpense impact
  note v0.7, the `requirement-updates/` logs with their issue propagation
  records, and the T06 foundation proposal. Requirements v0.8, ownership index
  v0.8 and entity map v0.9 consolidate them.
- **Finished plans (7 files):** the foundation implementation guide and the
  foundation restructure, Step 5, web shell, web shell follow-up, Playwright and
  sign-in plans. This document records their approvals and outcomes, including
  every decision ID that code comments cite (P5, WS, SF, PW, SI); T02's record
  keeps the AU IDs.
- **Trims:** this document's records of the 2026-10-23 to 2026-10-29 foundation
  work that the restructure superseded, and its 2026-10-24 planning checklist;
  the local development reference's cleanup steps for checkouts made before
  2026-10-31.

This reverses the rule that preserved published historical baselines, which the
2026-10-29 cleanup still applied. Only the current version of each baseline
stays in the tree. Git history keeps the rest, and citations use links pinned to
commit `55a61ab996b4151c5f2a5dfb6df35237287e3963`, the last commit that contains
every removed file. The plans' template for a change plan moved into
[AGENTS.md](../../AGENTS.md#planning-a-change), the implementation guide's
gates into [Gates before dependent work](#gates-before-dependent-work), and the
restructure plan's T04 server checklist into the
[local development reference](local-development.md#production-direction).
What the plans left for PR 4 (SI-18 and the shell and Playwright handoffs)
belongs to [#118](https://github.com/WilliamPhilippe/storage-minis/issues/118),
and the restructure plan's server-rendered catalog options to
[D04 / #18](https://github.com/WilliamPhilippe/storage-minis/issues/18); the
pinned plans hold their full text.

**Rationale.** The older versions and finished plans repeated current rules in
outdated words, so a search for a business term returned several near-copies.
One of them, the v0.7 PurchaseExpense note, still allowed a table of
expense-to-Purchase links that PUR-047 rules out. This cleanup changes no
technical or business policy beyond that documentation rule.
