# T06 foundation proposal — 2026-10-24

**Status: proposed; awaiting owner approval.** This document recommends the five
steps in the [planning checklist](technical-direction.md#next-foundation-steps--planning-checklist-2026-10-24).
It authorizes no installation, application configuration, schema migration or
business access. Approval date and implementation evidence are pending.

For the current six-agent execution sequence, planning instructions and per-step
completion criteria, read the [technical foundation implementation guide](technical-foundation-implementation-guide.md).
This proposal remains the reference for candidate technical choices, versions,
alternatives and detailed contracts; its original five-step grouping is mapped
to the guide's assignments rather than treated as a second execution sequence.

**Recommendation:** approve a local infrastructure bootstrap with a table-free
API, then gate business migrations and protected operations on their existing
design owners. The owner has installed Docker Desktop and its daemon/Compose
availability is now verified below. The owner asked to be told about app
prerequisites before any installation attempt; no agent installation or runtime
workaround was attempted.

**Owner refinement (2026-10-24):** Prefer Docker images for tools where practical;
host installation needs a demonstrated reason and prior notice. The owner
subsequently installed Docker; verified availability is recorded below. This
approves the preference, not the entire proposal. F13 below revises the
initial host-execution recommendation; concrete implementation remains pending.

## 1. Inspected state and governing inputs

Inspection on 2026-10-24 found macOS 27.0.1, arm64, Node.js 24.22.1 and pnpm
12.15.0. The existing private root, `@estoque164/api` and `@estoque164/db` packages
have checks/configuration but no application source, runtime dependencies,
business schema, migrations, Compose file or permanent tests. Existing uncommitted
tooling/documentation changes, including `turbo.json`, predate this proposal.

Preserve the approved Node/pnpm pins, TypeScript 6.0.3, Turbo 2.11.10, all other
approved tooling versions/settings, ESM/NodeNext, ES2024, `.js` relative imports,
root development-tool ownership, exact dependencies/shared lockfile, strict
checking with `skipLibCheck: false`, local-only cache and strict empty suites.
This proposal adds no frontend or design-system decision.

At the initial inspection, Docker, Docker Compose, Colima, OrbStack and Podman executables were absent from
PATH. `/Applications/Docker.app`, `/Applications/OrbStack.app`, the standard
Docker CLI paths and the standard system/user Docker sockets were absent; no
Docker host/context override was set. Homebrew listed none of the queried Docker,
Compose, Colima or OrbStack packages. Therefore no usable local Docker runtime
was established. No container, image pull or real PostgreSQL check ran.

**Follow-up verification (2026-10-24, after owner installation):** Docker Desktop
4.96.3 (244472), Docker client/Engine 29.9.2 and Compose 5.6.1 respond successfully.
The active context is `desktop-linux`; the reachable daemon reports Linux arm64
(`aarch64`). Version, Compose, context and daemon-info checks passed using the
installed CLI. The agent shell's PATH still does not resolve `docker`; use
`~/.docker/bin/docker` or
`/Applications/Docker.app/Contents/Resources/bin/docker` explicitly in that shell.
The host command examples below use `docker` as shorthand for that installed
executable; no PATH/profile change is needed to run them. No images were pulled,
containers started or PostgreSQL connections attempted by these checks.

Read the repository guidance, technical direction/checklist, issue-tracker
conventions, [database design](database/design.md),
[approved logs](requirement-updates/README.md), relevant entity-map constraints,
ownership and acceptance scenarios. Later approvals take precedence in this order:
October 22 schema review; October 23 field review; index/candidate follow-up;
partial-expense-payment clarification. In particular, keep authoritative expense
installments and reconciled `settled_amount`; the older full-payment-only
recommendation is superseded.

Live issues and comments were fetched through authenticated `gh` on 2026-10-24:

| Issue | Observed state and dependency boundary |
| --- | --- |
| [T01 / #21](https://github.com/WilliamPhilippe/storage-minis/issues/21) | Open; no comments; no prerequisite ticket. Owns executable schema, states, integrity and transaction design. |
| [T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22) | Open; no comments; no prerequisite ticket. Owns authorization, bootstrap and remaining Firebase/session policies. |
| [T04 / #23](https://github.com/WilliamPhilippe/storage-minis/issues/23) | Open; no comments; no prerequisite ticket. Owns operations, deployment, recovery and measurable targets. |
| [T03 / #24](https://github.com/WilliamPhilippe/storage-minis/issues/24) | Open; no comments; blocked by #21. Owns detailed numeric/time/input contracts. |
| [T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26) | Open; no comments; blocked by #21, #22 and #23. Owns the runnable foundation and representative integrity evidence. |

Native blocked-by relationships for #24 and #26 match their issue bodies. The
legacy repository name redirects to `WilliamPhilippe/storage-minis`; this does
not create new issue identities. No issue body, status, relationship or ownership
was changed. Approval below must explicitly cover partial bootstrap despite open
prerequisites; it does not unblock or complete T06.

## 2. Approval register and exact versions

F02 is owner-completed and verified. The remaining F decisions are proposals;
approve them individually or together. Installing Docker does not approve the
application/container configuration or other implementation choices.

| Decision | Concrete recommendation |
| --- | --- |
| F01 — Scope | Implement only the five local bootstrap steps below. Defer business tables/procedures and full T06 completion to their prerequisite gates. |
| F02 — Local runtime | **Owner-completed; verified 2026-10-24:** Docker Desktop **4.96.3**, build **244472**, Apple Silicon; bundled Engine/client 29.9.2 and Compose 5.6.1 work. No agent version-manager, shell-profile or alternative-runtime changes. |
| F03 — PostgreSQL | Official `postgres:18.6-bookworm` pinned to the multi-platform digest below; loopback-only ports, project-scoped persistent development volume and separate disposable test service. |
| F04 — Dependencies | Add the exact runtime and root development dependencies in the next table using pnpm; retain every existing pin. |
| F05 — Driver/lifecycle | Drizzle's `node-postgres` adapter with one explicitly owned `pg.Pool` per API process; bounded connection/query/shutdown behavior. |
| F06 — Migrations | Reviewed Drizzle-generated SQL plus metadata committed as source; separate explicit application command, initially guarded while schema approval is pending. |
| F07 — Modules/commands | Compiled ESM DB exports, TypeScript builds, `tsx` API development, DB compiler watch, Node built start, and a type-only API export. |
| F08 — Environment | One ignored root `.env` for local tools, native Node loading plus Zod validation; injected production environment; explicit test targeting. |
| F09 — Server | Application factory/process-entry separation, `/health/live` and `/health/ready`, structured redacted logs and graceful shutdown. |
| F10 — tRPC | `/trpc`, JSON transport, bounded `diagnostics.echo` input/output validation, explicit context and safe errors; diagnostic access only. |
| F11 — Verification | Meaningful unit tests, separate uncached database tests and built-process smoke, plus documented failures/cleanup and deferred acceptance. |
| F12 — Turbo | Add only real tasks; builds and checks cache with dependency ordering; live-state work stays uncached; development/start tasks are persistent. |
| F13 — Container execution | Run dependency installation, Drizzle Kit, API development, builds and tests in a pinned Node tooling container; use Docker/Compose on the host for lifecycle commands. Keep Linux dependencies/cache isolated from host dependencies. |

| New package | Exact version | Dependency owner and reason | Primary version evidence |
| --- | --- | --- | --- |
| `fastify` | `5.12.7` | API runtime; selected server framework, stable v5 line. | [Published manifest](https://registry.npmjs.org/fastify/5.12.7) |
| `@trpc/server` | `11.19.0` | API runtime; includes the Fastify adapter. | [Published manifest](https://registry.npmjs.org/@trpc/server/11.19.0) |
| `zod` | `4.6.7` | API and DB runtime dependencies; API inputs/outputs and each package's configuration boundary. | [Published manifest](https://registry.npmjs.org/zod/4.6.7) |
| `drizzle-orm` | `0.45.4` | DB runtime; stable release rather than the current 1.0 RC. | [Published manifest](https://registry.npmjs.org/drizzle-orm/0.45.4) |
| `pg` | `8.23.1` | DB runtime; pure JavaScript PostgreSQL driver/pool. | [Published manifest](https://registry.npmjs.org/pg/8.23.1) |
| `drizzle-kit` | `0.31.11` | Root development dependency installed/executed in the tooling container; stable migration CLI. | [Published manifest](https://registry.npmjs.org/drizzle-kit/0.31.11) |
| `@types/pg` | `8.23.1` | Root development tool, consistent with the approved full-checkout tooling policy. | [Published manifest](https://registry.npmjs.org/@types/pg/8.23.1) |
| `tsx` | `4.23.15` | Root development tool; API watch and small DB command wrappers. | [Published manifest](https://registry.npmjs.org/tsx/4.23.15) |

Metadata and published package declarations were read without installing them.
tRPC 11's adapter requires Fastify 5+, and its published TypeScript peer is
`>=5.7.2`; the retained TypeScript 6.0.3 satisfies it. Zod supports strict
TypeScript 5.5+, `pg` requires Node 16+, and `tsx` requires Node 18+. Drizzle's
`pg >=8` peer accepts the selected driver. These are compatibility checks, not a
claim that this combination has compiled or run locally.
[tRPC adapter](https://trpc.io/docs/server/adapters/fastify),
[Zod requirements](https://zod.dev/#requirements).

The published Drizzle 0.45.4 declaration accepts `drizzle({ client: pool })`.
Current Drizzle tutorials now show `@rc`; use the pinned stable artifacts and
verify their APIs rather than copying RC-only examples. Package versions need
not share a version number. Alternatives are the 1.0 RC pair (newer API with
prerelease/migration churn) or older stable patches (less current fixes). Prefer
the stable pair; after approval, frozen installation, strict declaration
checking, CLI loading and real adapter tests are mandatory. If they fail, report
the precise incompatibility and propose a changed pin; do not silently enable
`skipLibCheck`, add optional drivers, or adopt an RC.

Do not add `pg-native`, dotenv, a bundler, Fastify CLI, Firebase SDK, CORS,
WebSockets, SuperJSON or frontend dependencies in this scope. Fastify's own
logger is sufficient. The tRPC Fastify export's published declarations were
checked and do not require installing a WebSocket plugin for HTTP-only use.

### Container execution recommendation (F13)

Use a small `docker/Dockerfile.tooling` based on the official multi-platform
image below, retaining Node 24.22.1 exactly. Registry metadata was inspected
without pulling it; Linux arm64/v8 and amd64 are available.

```text
node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
```

Install only `pnpm@12.15.0` into that image using its npm; this is an image build
step, not a machine/global-host install. Install workspace dependencies with
pnpm and the shared lockfile in container-owned storage. Do not use an unpinned
third-party Drizzle image or download CLI versions on each invocation. All
package ownership/version and TypeScript build choices below remain unchanged.
[Official Node images](https://github.com/nodejs/docker-node/blob/main/README.md),
[Published image tags](https://github.com/docker-library/official-images/blob/master/library/node).

Add a profile-`tools` service `tooling`, working at `/workspace`, with the checkout
bind-mounted there. Use separate project-scoped named volumes at root/API/DB
`node_modules`, a container-only pnpm store and `/workspace/.turbo`. Set
`volume.nocopy: true` on dependency/cache mounts so existing macOS files are not
copied into fresh Linux volumes. Never reuse host `node_modules` or Turbo entries
inside Linux; leave the existing host toolchain and cache untouched. Generated
`dist`, migration SQL and other reviewable source changes remain on the checkout
bind mount. Initialize volume ownership for the image's `node` user in a short
container-only setup step, then run workspace commands as that user; do not
recursively change host checkout ownership.
[Volume mounting behavior](https://docs.docker.com/engine/storage/volumes/).

Keep Docker orchestration on the host. The tooling service does not install the
Docker CLI, mount the daemon socket or launch sibling containers. Explicit host
Compose commands start the DB before a DB-dependent command. Root/package pnpm
scripts remain normal Node/Turbo commands *inside* `tooling`; no recursive Docker
wrapper is added to the root check scripts. Host entry points are:

| Operation | Proposed host command, from the repository root |
| --- | --- |
| Build tooling image | `docker compose --env-file .env --profile tools build tooling` |
| Install locked dependencies | `docker compose --env-file .env --profile tools run --rm --no-deps tooling pnpm install --frozen-lockfile` |
| Build / check / migration command | `docker compose --env-file .env --profile tools run --rm --no-deps tooling pnpm <command>` |
| Development / built start | `docker compose --env-file .env --profile tools run --rm --no-deps --service-ports tooling pnpm dev` (or `pnpm start`). |
| PostgreSQL lifecycle | Direct host `docker compose --env-file .env ...` actions from Step 1. |
| SQL inspection | `docker compose --env-file .env exec postgres psql -U estoque164 -d estoque164_dev`; no host PostgreSQL client install. |

Compose one-off commands do not publish service ports unless requested. Publish
only `127.0.0.1:${API_PORT:-3000}:3000` for interactive API development/start.
Inside tooling, bind the API to `0.0.0.0:3000`; use `postgres:5432` for DB access.
Smoke tests launch and query a child API inside the same container on
`127.0.0.1:3000`, without publishing it. The test DB is `postgres_test:5432`;
host DB ports remain optional diagnostic access, never container connection
ports. Stop one interactive API before starting another in the same checkout.
[Compose one-off port handling](https://docs.docker.com/reference/cli/docker/compose/run/).

The alternative is the original host-run Node workflow with project-local tools,
which gives easier host-editor dependency discovery and fewer bind-mount/watcher
layers. The container approach better meets the owner's installation preference
and standardizes the Linux runtime, at the cost of Docker startup, disk use and
editor integration. Host editor language services cannot assume Docker-volume
dependencies are visible; if needed, separately propose container editor support
or a justified project-local host install. Do not install extensions/tools or
change the approved host setup implicitly.

Verify the container's Node/pnpm versions, frozen install, non-root source writes,
dependency-volume isolation, workspace exports, bind-mount watch reloads, graceful
signal forwarding, port collisions and uncached DB commands. Compare cache reuse
within the container, not between macOS and Linux. No tooling image build, pull,
container install or host setup is authorized until the revised proposal is
approved. Docker availability is confirmed; this alone does not authorize those
implementation actions.

## 3. Step 1 — local PostgreSQL through Compose

F02 selected Docker Desktop 4.96.3, now installed by the owner, because it packages the macOS VM, Engine,
CLI and Compose in one maintained installation. Its official Apple Silicon feed
specifies build 244472 and minimum macOS 14; this machine clears that minimum.
The release line records Engine 29.9.2 and Compose 5.6.1; verify the installed
versions instead of installing a second CLI/plugin. Record any bundle mismatch
before changing the proposal.
[Release notes](https://docs.docker.com/desktop/release-notes/#4963),
[Apple Silicon release feed](https://desktop.docker.com/mac/main/arm64/appcast.xml).

Colima 0.10.3 with separate Docker/Compose tools is an alternative with a smaller
CLI-oriented setup but more VM/plugin configuration; OrbStack is another local
runtime with its own app and licensing. Prefer the single Desktop bundle for this
machine. Existing working Compose installations on other machines need no forced
runtime replacement; validate the required commands there. Installing any app,
changing Docker context, or adding shell initialization requires explicit owner
approval and is outside the act of writing this proposal.
[Colima release](https://github.com/abiosoft/colima/releases/tag/v0.10.3).

F03 pins this exact image reference:

```text
postgres:18.6-bookworm@sha256:bbf83594798e144bff365a9c191c5d779f181fb3135902064ab8ff11918020fc
```

The public registry manifest was inspected without pulling the image; it includes
Linux arm64/v8 and amd64. PostgreSQL 18.6 is a supported stable minor; 19 is
currently an RC. Debian Bookworm avoids introducing Alpine/musl differences;
Alpine is smaller, while PostgreSQL 17.11 offers an older supported major.
Prefer 18.6 with the existing project's unconstrained PostgreSQL choice. Digest
pinning requires explicit review for image security updates, but prevents a tag
rebuild from silently changing local infrastructure.
[Official image tag/architecture metadata](https://github.com/docker-library/official-images/blob/master/library/postgres),
[PostgreSQL support policy](https://www.postgresql.org/support/versioning/).

Proposed root `compose.yaml` has `postgres` and profile-`test` service
`postgres_test`, plus F13's Node tooling service, no fixed `container_name` and no external
volumes. Development uses role `estoque164`, database `estoque164_dev`, container
port 5432, host `127.0.0.1:${POSTGRES_PORT}` (default 5433), and named volume
`pgdata`, scoped as `<COMPOSE_PROJECT_NAME>_pgdata`. Mount it at
`/var/lib/postgresql`, retaining the image's PostgreSQL 18 versioned PGDATA.
Use password authentication, no trust mode; the official initialization role is
local-only and privileged, not the production API role design.
[PostgreSQL image storage contract](https://hub.docker.com/_/postgres).

Require an explicit `COMPOSE_PROJECT_NAME`, initially `estoque164-budapest`, and
document changing it for every checkout. A second checkout can use
`estoque164-other`, PostgreSQL ports 5435/5436 and `API_PORT=3001`. Names isolate
volumes/networks; distinct host ports prevent bind collisions. Keep project and
ports in that checkout's ignored `.env`; never share a global named volume.
[Compose project isolation](https://docs.docker.com/compose/how-tos/project-name/).

`postgres_test` uses database `estoque164_test`, host port 5434 by default and
tmpfs at `/var/lib/postgresql`; it never mounts `pgdata`. Tests are disposable
and must not use the development database. Both services use the pinned image,
explicit UTC server timezone, the local configured password and healthcheck
`pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"` inside the
container (escape `$` as `$$` in Compose). Propose interval 2s, timeout 3s,
20 retries and 5s start period, with `up --wait --wait-timeout 60` as the outer
deadline. `pg_isready` alone does not prove password authentication; follow it
with the tooling-container driver's authenticated `SELECT 1`.
[Compose readiness](https://docs.docker.com/compose/how-tos/startup-order/).

Proposed host lifecycle commands, always run from the root. They execute directly
and are never Turbo-cached; F13 supersedes the original host-pnpm/Turbo wrappers:

| Purpose | Host Compose action, with `--env-file .env` |
| --- | --- |
| Start development DB | `up -d --wait --wait-timeout 60 postgres` |
| Stop development DB | `stop postgres`; preserve development volume. |
| Stop project | `down`; preserve named volumes, stop the project's services. |
| Follow DB logs | `logs --follow postgres`; persistent, uncached. |
| Start test DB | `--profile test up -d --wait --wait-timeout 60 postgres_test` |
| Stop test DB | `stop postgres_test`; test tmpfs is disposable. |
| Destructive reset | Separately invoked `down --volumes`, after displaying the project and destructive effect; removes development data and tooling dependency/cache volumes. Never part of startup, checks or ordinary shutdown. |

Verification after approval: check CLI/daemon/Compose, image identity and readiness;
authenticate from tooling Node; check both host bindings; start a second project with
different ports and verify isolation. Create a disposable empty
`foundation_volume_probe` schema on the local development DB, stop/start, verify
it survives, and drop it afterward. This is storage evidence without an
application table or business migration. Check an occupied port fails usefully.
Do not run a destructive reset as ordinary validation.

## 4. Step 2 — DB package and migration workflow

F05 selects `pg` over `postgres`/postgres.js. Both have Drizzle adapters; `pg`
provides an explicit pool/client model suitable for forthcoming multi-connection
tests and per-query parsers. postgres.js has concise tagged SQL and default
prepared statements, with different deployment/pooling implications. Native pg
adds local compilation for an unproven benefit. Production pool/proxy/SSL policy
remains T04 work.
[Drizzle driver comparison](https://orm.drizzle.team/docs/get-started-postgresql).

`createDatabase(config)` returns a typed Drizzle handle, a bounded `check()` and
an idempotent `close()` backed by `pool.end()`. No connection or environment read
occurs at package import. The API entry creates one pool and owns its shutdown;
the application factory receives dependencies. DB command/test processes create
and close their own resources in `finally`. Proposed local limits: max 5 pool
connections, 10s idle timeout, 2s connection/acquisition timeout, 3s server
statement timeout and 4s client query timeout. Health/startup has a 6s total
deadline; shutdown has 10s. These are bootstrap defaults, not approved production
performance targets. Handle idle pool errors with sanitized code/category logs
and failed readiness; no unbounded retry or global type-parser changes.
[Pool lifecycle/options](https://node-postgres.com/apis/pool).

Future transactional work uses Drizzle's transaction handle throughout one
action, including audit; never split it into unrelated pool queries. This is a
connection seam, not a choice of isolation level, lock ordering, retry policy,
constraints or business transaction boundaries. T01 must approve those for each
affected operation; the driver does not enforce them automatically.
[Single-client transaction requirement](https://node-postgres.com/features/transactions).

F06 recommends code-first migration generation from the approved Drizzle schema
at `packages/db/src/schema/index.ts`, with committed SQL, snapshots and journal
under `packages/db/drizzle/`. `drizzle.config.ts` specifies PostgreSQL, that schema
path and output directory without requiring credentials for generation;
`drizzle.migrate.config.ts` adds validated credentials and an explicit history
location `drizzle.__drizzle_migrations`. Both configs and `scripts/**/*.ts` join
the DB's strict TypeScript project and typed ESLint coverage. Paths in CLI
wrappers resolve from the DB package, regardless of the caller's cwd.
[Drizzle configuration](https://orm.drizzle.team/docs/drizzle-config-file).

| Command | Proposed behavior |
| --- | --- |
| `pnpm db:check` | Use the compiled DB factory for authenticated `SELECT 1`, close the client, return nonzero on failure; no tables required. |
| `pnpm db:generate` | DB wrapper checks that approved schema source exists, then invokes the root dependency `drizzle-kit generate --config=drizzle.config.ts` inside tooling; no live DB needed. |
| `pnpm db:migrate` | DB wrapper validates the local target and committed journal, then invokes `drizzle-kit migrate --config=drizzle.migrate.config.ts`; explicit external-state mutation. |

Generate and apply are separate uncached tasks. Review SQL, metadata, constraints
and deletion/rename effects before committing; retain already applied migrations,
and make subsequent corrections through new reviewed migrations. No `push`,
automatic startup migration, automatic rollback or shared-database reset is
selected. A single migration runner per target is required; production runner
serialization, privilege separation, release ordering and failure recovery are
T04 decisions before deployment. The alternative `push` is convenient for
throwaway prototyping but bypasses the reviewed history. A programmatic migrator
would need another application runner; SQL-first tooling adds a second schema
workflow. Prefer the selected framework's explicit generate/review/migrate path.
[Generation](https://orm.drizzle.team/docs/drizzle-kit-generate),
[Application](https://orm.drizzle.team/docs/drizzle-kit-migrate).

While T01 is pending, do not create `schema/index.ts`, an empty migration journal
or a sample business table merely to make commands pass. Configure the tooling
and guards: generation/application return a clear nonzero "schema/migrations
pending approval" result before touching the DB when their artifacts are absent.
`db:check`, the API and diagnostics still work without tables. Migration history
itself is infrastructure metadata once real migrations are approved; it is not a
business entity. Report this initial state as migration tooling only.

Verification: typecheck/lint the configs and wrappers; verify CLI version and
configuration loading, wrong credentials, timeout and pool closure without open
handles. After schema approval, generate/review the first real migration; replay
the entire committed chain on a fresh disposable PostgreSQL DB, apply twice with
no duplicate changes, inspect actual constraints, and exercise an invalid
migration/transaction with cleanup and useful failure. Those replay/integrity
results are deferred until executable schema exists.

## 5. Step 3 — modules, development and Fastify

F07 preserves the approved directories and adds only these responsibilities:

```text
compose.yaml / .env.example                    local infrastructure/config contract
docker/Dockerfile.tooling                       pinned container Node/pnpm runtime
apps/api/src/{app,server,config}.ts              factory, process entry, validation
apps/api/src/trpc/{context,router}.ts            diagnostic adapter contract
apps/api/src/types.ts                           type-only AppRouter export
apps/api/tsconfig.build.json                    emitted runtime/declarations
packages/db/src/{index,client,config}.ts         explicit factory and configuration
packages/db/scripts/                           check/generate/migrate wrappers
packages/db/drizzle*.config.ts                  strictly checked CLI configuration
packages/db/tsconfig.build.json                 emitted runtime/declarations
scripts/smoke.mjs                               built-process smoke harness
vitest.integration.config.mts                   separate live-DB project discovery
```

The DB's `src/schema/` and committed `drizzle/` history arrive only after the
business-schema gate. Do not create a generic repositories/services hierarchy,
shared configuration package or browser app as incidental scaffolding.

Use `tsc --project tsconfig.build.json` in both packages. Build configurations
extend existing strict profiles, set `noEmit: false`, `noEmitOnError: true`,
`rootDir: src`, `outDir: dist`, declarations, declaration maps and source maps,
and exclude tests/configs from runtime output. Keep broad no-emit typechecks for
source, tests and tool configuration. Clean the package's own `dist` with a small
native Node command before a finite build so removed source cannot leave runnable
stale output. No new clean/bundle package or project references are necessary.
[TypeScript emit controls](https://www.typescriptlang.org/tsconfig/).

DB package exports are compiled-only:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  }
}
```

The API declares runtime dependency `"@estoque164/db": "workspace:*"` and imports
its public factory/types. It does not reach into `packages/db/src`. Keep DB
schema/migration files out of the public export surface. The API exposes only
`"./types": { "types": "./dist/types.d.ts" }`, whose source contains
`export type { AppRouter } from "./trpc/router.js"`; no runtime root export.
Keep both packages private. Type-only browser consumption erases the import;
accidental runtime imports have no executable export target. Declarations may
reference server dependency types, but must not start the server, load credentials
or bundle DB code. A future frontend must declare the type dependency and matching
tRPC client version through its own approved setup.

Compiled exports keep development/Node build resolution consistent at the cost
of a DB build prerequisite. Source exports/custom development conditions avoid
that build but make consumers responsible for TypeScript and condition-specific
behavior. Bundling via tsup/esbuild adds another tool and declaration strategy.
Prefer existing TypeScript and explicit built exports. Browser bundling and
production packaging remain separate validation, not assumed completed here.

| Entry | Proposed package/root command, executed inside tooling |
| --- | --- |
| API `dev` | `tsx watch --clear-screen=false --include '../../packages/db/dist/**/*.js' --include '../../.env' src/server.ts` |
| DB `dev` | `tsc --project tsconfig.build.json --watch --preserveWatchOutput` |
| Both package `build` | Native Node clean of own `dist`, then `tsc --project tsconfig.build.json`. |
| API `start` | `node --enable-source-maps dist/server.js` |
| Root `dev` / `build` | `turbo run dev` / `turbo run build`. |
| Root `start` | `turbo run start --filter=@estoque164/api`, with a finite API build prerequisite. |

`tsx` ignores `dist`/`node_modules` by default, so explicitly watch the DB output
and local env file. The initial DB build completes before API watch starts;
subsequent DB compilation causes API reload. DB watch compilation errors keep
the last successful output and show an error; successful checks remain the
delivery gate. Native Node type stripping/watch is an alternative, but changes
the TypeScript execution/resolution contract and offers no emitted declarations.
[tsx watch rules](https://github.com/privatenumber/tsx/blob/master/docs/watch-mode.md).

F09 recommends `buildApp(config, dependencies)` with no listener, environment
loading or signal registration. `server.ts` validates configuration, creates the
DB resource, completes an authenticated readiness check, builds the app and
listens. On failure it logs a sanitized category, closes created resources and
exits nonzero. The code default remains `127.0.0.1`, port 3000; the tooling
service explicitly sets `HOST=0.0.0.0` for its container, publishing only the
host's loopback interface. Propose a 16 KiB body limit and 10s request
timeout for these small diagnostics. Use Fastify's structured JSON logger,
configured log level, request IDs and redaction of authorization/cookie headers;
avoid raw input bodies, query strings, connection URLs and driver error dumps.

| Route | Public diagnostic contract |
| --- | --- |
| `GET /health/live` | HTTP 200, `{"status":"ok"}` while the process is serving; no DB query. |
| `GET /health/ready` | Authenticated `SELECT 1`, HTTP 200, `{"status":"ready"}`; HTTP 503, `{"status":"unavailable"}` on DB failure or shutdown, within the 6s deadline. |

Responses omit database names, credentials, versions and business records. Startup
fails before listening if the DB is unavailable. If the DB fails later, liveness
stays 200 and readiness becomes 503; probes may recover after DB recovery.
SIGINT/SIGTERM share one idempotent shutdown path: mark unready, drain Fastify,
then close the owned pool, with a 10s overall deadline and nonzero forced failure
if cleanup cannot finish. Do not register process handlers in factories/tests.
Alternatives are one health route (less diagnostic distinction) or constructor
side effects (harder isolated testing). The factory and separate process entry
support meaningful injection and lifecycle tests.
[Fastify testing](https://fastify.dev/docs/latest/Guides/Testing/),
[Server controls](https://fastify.dev/docs/latest/Reference/Server/).

Verification: test routes with `app.inject()`, then start compiled output with
plain Node, prove its DB import resolves and check real HTTP readiness. Verify
startup with bad config/credentials, occupied port, DB loss/recovery and SIGTERM
leaves no listener/pool. Verify editing DB source recompiles/reloads the API.
No development runner is allowed to mask a broken built entry point.

## 6. Shared environment contract

F08 recommends a committed, secret-free root `.env.example`, copied manually to
ignored `.env`. It contains the following names/defaults; the password is a
replacement marker and must be changed locally, not a working credential.

| Variable | Local meaning / precedence |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Required checkout-specific value; example `estoque164-budapest`. |
| `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD` | `estoque164`, `estoque164_dev`, replacement marker; reject missing/blank/unchanged marker. |
| `POSTGRES_PORT`, `POSTGRES_TEST_PORT` | 5433 and 5434; integer ports 1–65535, distinct within one checkout. |
| `API_PORT` | Host's loopback API mapping, default 3000; a second checkout can use 3001 without changing the internal API port. |
| `DATABASE_HOST`, `DATABASE_PORT` | Tooling injects `postgres`, 5432. Code defaults to `127.0.0.1` and the mapped PostgreSQL port only for a separately approved host run. |
| `DATABASE_URL` | Optional explicit override; otherwise construct from validated DB host/port and PostgreSQL fields with URL-encoded credentials. Required injected value in production. |
| `TEST_DATABASE_URL` | Explicit required target for integration tests, with database name `estoque164_test`; no fallback to `DATABASE_URL`. |
| `NODE_ENV` | `development` locally; permit `development`, `test`, `production`. |
| `HOST`, `PORT`, `LOG_LEVEL` | Code defaults `127.0.0.1`, 3000, `info`; tooling injects `0.0.0.0`, 3000. Validate the host/port and supported logger level. |
| `SMOKE_BASE_URL` | Optional HTTP harness target; default `http://127.0.0.1:3000` inside tooling regardless of the listener's bind-all address; reject nonloopback targets. |

The example documents a placeholder test URL for the separate test service;
the developer substitutes the local password using `postgres_test:5432` inside
tooling, not the host-mapped port. Tests reject that marker,
the development DB name, equality with the development URL, hosts other than the
explicit test service or loopback, and
any database name other than `estoque164_test`. This bootstrap supports one
integration runner per checkout; parallel checkouts have separate service ports
and projects. Broader CI target rules require a later approved configuration.

At explicit API/DB command boundaries in development, resolve the root `.env`
relative to the module location, never arbitrary cwd, and load it using Node
24's native `process.loadEnvFile` if present. Existing process values win over
file values. Missing files are allowed only if the required environment is
already supplied; other file errors fail. Unit tests pass explicit config values
and do not read developer files. Production skips file loading and requires an
injected `DATABASE_URL`, with T04 still owning TLS/secret provisioning. Neither
the DB factory nor the app/router import loads an environment file.
[Native Node env loading](https://nodejs.org/docs/latest-v24.x/api/process.html#processloadenvfilepath).

Compose reads root `.env` explicitly through `--env-file`; interpolate only the
needed PostgreSQL fields into each DB service. Tooling explicitly receives the
runtime fields it needs, including container DB addresses, rather than the whole
host environment. Shell
overrides take precedence there as well. Compose must require the password and
project name rather than silently falling back to a shared setup. Avoid Compose
variable expansion/quotes in password values; document a literal local value
compatible with both parsers. Node tooling uses `postgres:5432` on the Compose
network. A separately approved host client uses `127.0.0.1` and the mapped host
port; it cannot resolve the Compose service name. Changing init credentials on
an existing volume does not reinitialize it;
report authentication failure and resolve deliberately.
[Compose interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).

Zod validates runtime values and reports field names/categories without echoing
secrets. Package builds/typechecks never read environment files or connect to a
DB. `dotenv` is a familiar alternative but adds a dependency for behavior already
available in the pinned Node; shell-only loading avoids code but is inconsistent
across package working directories and test invocations. Prefer native loading
at explicit entry points plus package-owned validation. Verify overrides, missing
files, malformed ports/URLs, placeholder rejection, special-character password
encoding and redaction. No Firebase credential or administrator bypass variable
is introduced.

## 7. Step 4 — tRPC with Zod

F10 uses `@trpc/server/adapters/fastify` at `/trpc`, a small root router and
request context created from injected dependencies. Context carries the typed DB
handle and request ID; the bootstrap has no authenticated principal, Membership
or Organization selection. Expose only `diagnostics.echo`: a read-only query with
strict input `{ message: string }`, length 1–100, and strict output of the same
shape. It must not access business tables or write records. Do not expose a
reusable unguarded business-procedure helper or trust headers as identities.
[Context](https://trpc.io/docs/server/context),
[Input/output validation](https://trpc.io/docs/server/validators).

Use the adapter's ordinary HTTP JSON envelopes, no custom transformer, no
subscriptions and `allowBatching: false` initially. Keep diagnostics to JSON
primitives; money/date serialization waits for T03. Zod input failures map to
tRPC `BAD_REQUEST`/HTTP 400; unknown procedures to `NOT_FOUND`/404; invalid output
or unexpected failures to `INTERNAL_SERVER_ERROR`/500 with generic text. Preserve
the standard tRPC error envelope/code and safe procedure/request identification;
omit stacks, cause dumps and input values, including in development responses.
If structured validation details are returned, allow only path/code/message,
never raw submitted values. Fastify-level malformed JSON/body-limit errors retain
their appropriate HTTP failure and safe payload. Future business error classes,
idempotency/retries and pagination require separate approved contracts.
[Error semantics](https://trpc.io/docs/server/error-handling),
[Error formatting](https://trpc.io/docs/server/error-formatting).

Plain JSON minimizes bootstrap dependencies; SuperJSON adds Date/BigInt support
before their contracts are settled. A REST-only probe does not verify the chosen
adapter. A fabricated authenticated user would grant unspecified authority.
Prefer the diagnostic query with actual transport tests and later verified T02
middleware. The final browser CORS/origin policy is deferred with independent
frontend hosting; no CORS plugin or permissive origin policy is added now.

Verify through `app.inject()` and real HTTP, not only `router.createCaller()`:
`GET /trpc/diagnostics.echo?input=%7B%22message%22%3A%22ok%22%7D` returns HTTP 200
and `result.data.message = "ok"`; empty/oversized/non-string/unknown-key inputs
return 400; unknown procedures return 404; an invalid-output test returns a safe
500. Verify malformed/oversized requests and batching rejection. Compile a
temporary type consumer of `@estoque164/api/types` and confirm its emitted JS
contains no server import; a real browser-bundle assertion accompanies later
frontend delivery. Health/tRPC tests establish transport scaffolding only.

## 8. Step 5 — verification and documentation

F11 keeps the existing unit projects and strict no-tests policy, adding meaningful
tests for config validation/redaction, health semantics, resource ownership and
adapter validation/errors. Config fixtures are explicit objects; DB-free tests
do not load `.env`, contact PostgreSQL or fabricate a domain workflow. Normal
tests can pass when these real tests exist; do not globally enable
`passWithNoTests` or leave a dummy test to satisfy checks.

Add package `vitest.integration.config.mts` files and root
`vitest.integration.config.mts`, explicitly discovered separately from existing
unit configurations. Expand TypeScript includes for the new root/package config
files. Use the pinned Vitest, `*.integration.test.ts`, real test service and
validated `TEST_DATABASE_URL`. Initially run integration files serially, one
runner per checkout; release clients/close pools in `finally`, and never truncate,
migrate or reset development storage. Connection/readiness/lifecycle checks can
run without tables. Once approved business migrations exist, rebuild the
dedicated test DB from reviewed migrations before the suite, with per-case
fixtures and cleanup. Do not wrap concurrency proof cases in a single rollback
transaction: use distinct checked-out connections and an explicit barrier.

`pnpm smoke` uses a native Node harness to launch the built API on the configured
local port, wait within a deadline, exercise both health routes and valid/invalid
tRPC HTTP calls, send SIGTERM and assert process exit. It owns and cleans up its
child on success/failure; it must fail on an occupied port rather than connect to
an unrelated existing process. It requires the local development DB but creates
no business data. Keep it and live-DB tests outside ordinary `pnpm check`.
Alternatives are manual curl checks (useful debugging, weaker repeatability) or
Testcontainers (another dependency/runtime lifecycle before needed). Prefer the
existing test runner, Compose and a small native harness.

After implementation approval, document the actually verified README sequence:

1. Owner completes the Docker prerequisite; verify CLI/daemon/Compose. The host's
   existing Node/pnpm setup is untouched.
2. Copy `.env.example` to `.env`, choose a unique project/ports and local password;
   set the explicit disposable test URL with the test service's container address.
3. Build the approved tooling image, verify its Node/pnpm pins, then run frozen
   install, workspace discovery and configuration validation inside tooling,
   without printing secrets. Start PostgreSQL through the explicit host Compose
   command, then run `pnpm db:check` inside tooling; exercise persistence
   stop/start checks.
4. While business schema is pending, record the guarded migration commands as
   deferred. After approval and real artifacts, review/generate/apply migrations,
   replay on fresh test storage and apply a second time.
5. Run `pnpm build`, `pnpm check`, `pnpm smoke` inside tooling; independently run
   `pnpm start` with `--service-ports` and normal shutdown. Run `pnpm dev` the same
   way to verify API/DB edit feedback.
6. Start the test service through host Compose, run `pnpm test:integration` inside
   tooling, then stop the test service through host Compose.
7. Exercise invalid config, bad credentials, DB outage/recovery, occupied port,
   malformed HTTP and shutdown failures. Verify nonzero exits and redacted logs.
8. Stop PostgreSQL or bring down the project through host Compose; document
   logs/restart and the separately invoked destructive reset. Record evidence
   and remaining acceptance gaps.

No command in this proposed sequence has been claimed as application acceptance.
Frontend/Playwright, CI, operational deployment, backup/restore and representative
business operations retain their existing owners and prerequisite work.

## 9. Turbo task graph and cache contract

F12 retains the accepted `.turbo/cache` path, strict environment mode, broad default
inputs/shared configuration, root check ownership and disabled remote cache.
Add tasks together with their real scripts; do not register root orchestration
scripts as leaves. Under F13, Turbo runs inside the tooling container. The named
volume mounted at `.turbo` gives it separate project-scoped cache storage without
changing the existing host cache. Compose lifecycle commands run directly on the
host, so no Docker CLI/socket or recursive Docker wrapper is needed inside Turbo.
[Task configuration](https://turborepo.dev/docs/reference/configuration).

| Task ID | Dependencies | Cache / outputs / persistence |
| --- | --- | --- |
| `build` | `^build` | Cached, `dist/**`; DB builds before API because of declared `workspace:*`. |
| `typecheck` | `^build` | Cached, `[]`; API requires DB declarations. DB has no workspace dependency. |
| `//#typecheck:root` | None | Preserve cached `[]`; root tooling does not import DB. |
| `//#lint` | `@estoque164/db#build` | Cached, `[]`; typed API lint needs DB declarations. |
| `//#format:check` | None | Preserve cached `[]`. |
| `//#test` | `@estoque164/db#build` | Cached, `[]`; retain `env: ["NODE_ENV", "TZ"]`. DB-free tests import compiled DB exports without connection side effects. |
| `dev` | `^build` | `cache: false`, `persistent: true`; API watcher and DB compiler watcher. |
| API `start` | Own `build` (which requires DB build) | `cache: false`, `persistent: true`; local root start builds first. Direct built deployment is T04 work. |
| DB `db:check` | Own `build` | `cache: false`, `[]`; live database state. |
| DB `db:generate`, `db:migrate` | None; source/config-based CLI wrappers | `cache: false`, `[]`; SQL/metadata are reviewed source, never restored outputs. |
| `//#test:integration` | `@estoque164/db#build` | `cache: false`, `[]`; uses TS API tests plus built DB exports and the externally ready test service. |
| `//#smoke` | `@estoque164/api#build` | `cache: false`, `[]`; built-process/live-DB result. |
| PostgreSQL start/stop/down/reset/logs | Outside Turbo; direct host Compose | Always executed; no volume is a cached build output. No root lifecycle task is registered. |

Root `check` continues orchestrating its existing finite
checks; finite builds may now be prerequisites. Persistent tasks are never
dependencies of finite tasks. Host DB startup and container migrations remain explicit commands,
not hidden prerequisites of build/check/start. The root formatter already covers
root YAML/JSON and package TypeScript; new root JS scripts join ESLint coverage.

`build` and checks use default source inputs plus existing shared inputs. They
must not load `.env` or embed runtime values. Unit tests only hash their approved
`NODE_ENV`/`TZ`; config tests inject values explicitly. Uncached runtime tasks
allow the variables they actually read through task-scoped `passThroughEnv`:

| Tasks | Additional allowed names |
| --- | --- |
| API `dev`/`start`, `smoke` | `DATABASE_URL`, `DATABASE_HOST`, `DATABASE_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ`; smoke also `SMOKE_BASE_URL`. |
| `db:check`/`db:migrate` | Database URL/host/port/local PostgreSQL fields, `NODE_ENV`, `TZ`. |
| `test:integration` | `TEST_DATABASE_URL`, `DATABASE_URL` for wrong-target rejection, `NODE_ENV`, `TZ`. |
| Host Compose commands | Outside Turbo filtering; Compose interpolation uses the explicit root env file and host overrides. Do not forward Docker client selectors or the Docker socket into tooling. |

Declare the ignored root `.env` explicitly as an input of tasks that load it:
`$TURBO_DEFAULT$` plus `$TURBO_ROOT$/.env` for root tasks, or the equivalent
`../../.env` for API/DB tasks. This includes generation if its wrapper loads the
file; prefer offline generation without loading it. These tasks are uncached,
but the declaration documents their real inputs. Do not add secrets globally or
rely on pass-through values to invalidate cached results. If future cached code
reads configuration, add both its env names to `env` and its loaded files to
`inputs` before enabling caching. Turbo itself does not load `.env`.
[Environment and cache rules](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).

Verify dry-run task IDs/ordering and absence of recursion; force a successful
build/check then repeat for cache reuse; remove only generated `dist` and confirm
artifact restoration. Edit DB source and confirm DB build/API build/typecheck,
root typed lint and tests invalidate; ensure a compiler error blocks consumers.
Repeat DB checks/integration/smoke with identical source and confirm actual
execution each time. Verify inherited override values reach runtime tasks,
unrelated env values are filtered, runtime secrets do not affect offline builds,
and deliberately failing child tasks propagate nonzero exits. Persistent tasks
and uncached mutations cannot demonstrate cached success.

## 10. Prerequisite gates and full acceptance

| Before | Required approved outputs and evidence |
| --- | --- |
| Any installation/configuration | Owner approval of the applicable F decisions. F02's owner app prerequisite is complete; remaining proposal items still require approval. This document's existence is not approval. |
| First business migration | T01 executable keys/FKs/checks, all applicable T03 types/bounds/contracts and reconciliation of the DBML with later logs. Review explicit target keys for conceptual scoped references before SQL generation. |
| Protected procedure/admin bootstrap | Applicable T02 token verification, configured-owner bootstrap, role/capability/Membership and `can_edit_products` defaults; reject cross-Organization requests independently of Firebase identity. No placeholder principal. |
| Representative business operation | T01 action/transaction boundaries, constraint/locking/isolation/retry decisions and deletion-safe typed audit; relevant D01/D06/D08 outcomes and T03 money/time contracts. |
| Deployment/operational acceptance | T04 production role/TLS/secrets, hosting, migration serialization/release/failure handling, daily backup coverage/retention/restore proof and operational targets. Local defaults do not select them. |
| T06 completion | Its original required outputs and live prerequisites, including representative real-PostgreSQL integrity/race evidence and the remaining application/check setup, are satisfied or explicitly deferred by the owner. |

The current DBML cannot be translated mechanically. Its removed supporting
unique indexes leave conceptual composite FKs without executable targets. T01
must obtain approval for the concrete enforcement design without treating the
index-removal review as withdrawal of invariants. Required cases include unique
Firebase identity/Membership, readable Item IDs, one collection unit per
Organization/Product, one active commitment, unique expense/unit allocation,
Return identity and same-party/Organization funding/source limits.

Also reconcile the draft's restrictive SaleItem audit FK/deletion wording,
missing global `can_edit_products`/public-unit fields, mandatory nonblank Customer
name, status transition semantics, permanent finalized-cost/completed-Purchase
locks and original-period source reporting. Preserve four dedicated settlement
tables, mandatory SaleItem funding, allocation-derived PurchaseExpense links,
nullable conditions and partial expense payment history/overpayment enforcement.
Opening imports retain approved Supplier/year-month grouping and second-day UTC
convention, with actual mapping/evidence under T05. No import is part of this
bootstrap.

T03 must finalize numeric widths and overflow/intermediate precision, timestamp
precision/input and UTC period filters before affected migrations/contracts.
The diagram's `integer` and `timestamptz` are approved direction, not a complete
safe-input/arithmetic contract. Refund FIFO is approved; equal-time and non-refund
source ordering still need their owners. Do not revive superseded optional line
funding, full-payment-only expenses or later-period generic profit adjustments.

Full T06 evidence must go beyond connection/HTTP probes:

- Prove representative all-or-nothing changes and audit rollback on failure.
- Prove Organization A can reuse B's global Product ID while private units,
  parties, allocations and transactions remain isolated, including rejection of
  cross-Customer/Supplier funding. Scoped caches stay separate from global metadata.
- Prove distinct concurrent sessions cannot double-commit an Item, overconsume
  funding, overpay an expense, duplicate collection membership or bypass permanent
  locks; separate Organizations may commit their own units of the same Product.
- Prove deletion-versus-funding or settlement-source races with full rollback,
  lifetime-funded deletion protection and audit surviving permitted line deletion.
- Replay the real migration chain on fresh PostgreSQL; preserve exact cent
  reconciliation and dated original-period results for affected operations.
- Supply remaining runnable frontend/Playwright and repeatable-check/CI work
  required by T06 and the technical direction, with T04 deployment/recovery
  acceptance under its existing owners. These five steps alone do not provide it.

Primary delivery ownership remains unchanged: for example ORG-008 belongs to
#27, REQ-010/TECH-005 to #28 and TECH-006 to #54. T06's representative proof does
not duplicate or close their full workflows.

## 11. Approval and validation record

**Owner decision:** F02 owner-completed; all other implementation items pending.
**Owner installation/verification date:** 2026-10-24. **Application implementation
evidence:** pending. On approval, record exactly which F items and partial scope
were approved, with date and rationale; preserve unapproved items as proposals.
Record actual runtime/package versions and command outcomes after implementation.

**Approved preference, 2026-10-24:** the owner requested Docker images in preference
to direct host tooling installs where practical, retaining host tools where
needed, and said they will install Docker. Rationale: minimize machine setup.
F13 and the accompanying command/network/storage revisions are a concrete
recommendation under that preference and still need implementation approval.
F01 and F03–F13 have not been collectively approved. The owner's subsequent
Docker installation and successful read-only verification complete F02 only;
they do not approve image pulls, tooling builds or application configuration.

Completed for this proposal: local read-only environment/tool inspection; all five
live issues including their empty comment collections; native #24/#26 blockers;
first-party documentation and published registry/artifact metadata; image digest
and arm64/amd64 manifest verification. Dependency manifests, scripts, lockfile,
Turbo configuration, app/runtime setup, schema and live backlog were not changed
by this proposal. Relative documentation links/anchors, Markdown fences/table
structure, all 45 external source URLs and `git diff --check` passed after the
F13 refinement. F13 adds verified Node image metadata and official
Node/volume/Compose-command references. Pre-existing
non-documentation changes were verified byte for byte against the initial
inspection. No install, frozen-install rerun, build,
application test, migration or PostgreSQL execution is represented as completed.
The follow-up Docker version/Compose/context/info checks are runtime availability
evidence only, not container or application acceptance evidence.
