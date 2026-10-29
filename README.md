# StorageMinis

StorageMinis manages inventory, purchases, sales, finances, collections, and a
public stock catalog for 1/64 miniature sellers and collectors.

This repository contains workspace tooling, local PostgreSQL services, and
application specifications. The Drizzle connection package and its tests are
implemented, along with the approved structural schema and replayable migrations.
API configuration, the injectable HTTP factory, process lifecycle and built entry
are implemented and verified with guarded real-DB process tests. Stage 4.5 adds
a verified portable API runtime image; overall Step 4 remains in progress.
Stage 4.6 adds optional Compose runtime startup with matching Doppler credentials.
Stage 4.7 adds the development image and verified API/compiled-DB reload.
Business operations, the React frontend, automated image smoke and CI remain pending.
Default Docker startup still selects only PostgreSQL.

## Structure

```text
apps/api/                 Configuration, HTTP factory, lifecycle, entry and tests
packages/db/              Drizzle schema, migrations, connection package and tests
docker/                   Tooling/API images and volume initializer
scripts/tooling.sh        Run workspace commands in Docker
scripts/database.sh       Inject selected DB credentials and start PostgreSQL/API
scripts/reset-volumes.sh  Confirmed project volume deletion
compose.yaml              PostgreSQL, optional runtime/development API/test/tools, and volumes
docs/                     Requirements, models, plans, and technical decisions
AGENTS.md                 Agent instructions and approval rules
```

The root contains shared TypeScript, ESLint, Prettier, Vitest, and Turborepo
configuration. All packages use one pnpm lockfile.

## Local setup

Use Docker Desktop with a running Linux engine and Docker Compose. Run the
commands below from the repository root. Docker supplies Node.js 24.22.1 and
pnpm 12.15.0.

Docker Desktop includes `docker compose`; no separate `docker-compose`
installation is needed. Verify availability with `docker compose version`.

For an existing host installation, use the
[host setup instructions](docs/technical/local-development.md#local-setup).
Both fnm and nvm support [.nvmrc](.nvmrc).

### Docker tooling

After completing the Doppler browser login below, run the one-time setup:

```sh
pnpm docker:setup
```

On first use, choose a unique Compose project name and development/test ports.
For this existing checkout, choose `storage-minis-beijing`, `5433`, and `5434` to
reuse its volumes. The command saves those three nonsecret values in Git-ignored
`.env.compose`, builds the tooling image, pulls PostgreSQL, initializes dependency
volumes, installs frozen dependencies, and starts/checks development PostgreSQL.
Rerunning setup preserves the file and existing data. Run one setup/install at a
time per checkout.

For later startup, including after restarting your computer:

```sh
pnpm docker:up
```

No environment exports are needed. Keep Docker Desktop running. Commands select
Doppler project `storage-minis` and the target's `dev`/`test` config automatically.
Doppler is discovered on PATH, then at the approved standalone location; version
3.77.1 remains required. Passwords and browser credentials stay outside the checkout.
Startup performs no build, dependency installation or migration application.

After first-time setup, apply the committed schema with:

```sh
pnpm docker:migrate
```

The schema was approved on 2026-10-25. This explicit command applies only pending
migrations; repeat runs skip applied migrations. Ordinary startup needs only
`pnpm docker:up`, with the volume preserved. The diagnostic API starts separately;
business endpoints and frontend services remain pending. See the [schema implementation and boundaries](docs/database/step-3b-implementation-2026-10-25.md).

The package shortcuts require the pinned host Node/pnpm versions. For Docker-only
setup and command expansions, see the
[local development reference](docs/technical/local-development.md#docker-tooling).
Workspace commands run in temporary containers, with dependencies/cache in
checkout-specific Linux volumes. Host editors cannot resolve those dependencies.

### API runtime image

Stage 4.5 supplies the self-contained production package using the
[approved packaging](docs/technical/technical-direction.md#step-45-runtime-image-packaging-approval-2026-10-28).
From the repository root, build it without PostgreSQL or Doppler access:

```sh
docker compose --env-file .env.compose --file compose.yaml build api api-dev
```

The pinned Node/pnpm build compiles API/DB, then pnpm deploy packages production
dependencies and their dist files. The fresh Node runtime uses user `node`,
`/app` and `node --enable-source-maps dist/server.js`, with container bind
`0.0.0.0:3000`. It requires no source/dependency mounts or startup installation.
Local environment/credential files, host dependencies and generated output are
excluded from the build context. Image inspection proves compiled schema/type
files and portable internal links; see the
[commands, identities and evidence](docs/technical/step-4-verification-2026-10-28.md#stage-45--self-contained-runtime-image).

Stage 4.6 registers runtime `api` under the optional `api` profile, with project
image `${COMPOSE_PROJECT_NAME}-api:step4`. After the existing setup/login, start
the database and API separately:

```sh
./scripts/database.sh up dev
./scripts/database.sh api-up dev
curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3000/health/live
curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3000/health/ready
docker compose --env-file .env.compose --file compose.yaml logs --follow api
docker compose --env-file .env.compose --file compose.yaml stop api
```

The responses are HTTP 200 with exact bodies `{"status":"ok"}` and
`{"status":"ready"}`. Interrupting the log viewer leaves the API running.
`api-up` uses saved settings, automatically selects matching Doppler credentials,
and waits up to 30s for native readiness. It performs no build, pull, install or
migration. Use `API_HOST_PORT=3001 ./scripts/database.sh api-up dev` for an explicit
loopback port override; an occupied port fails. `LOG_LEVEL` defaults to `info`.
Neither setting is saved in the three-key `.env.compose`. Container binding stays
`0.0.0.0:3000`; only `127.0.0.1` is published on the host.

For exclusive test-target verification, use `up test` followed by `api-up test`;
finish all schema/process consumers first. Stop API before stopping test storage.
Wrong config/token, missing managed password/login and invalid settings refuse
startup; ambient PG/URL/password settings cannot replace managed credentials.
Native model/build/status/log/stop require no Doppler. On startup failure inspect
safe logs and run native `stop api`; a stopped container may remain for diagnosis.
Readiness checks authenticated DB identity, independently of migration currency.

Host aliases are `pnpm docker:api:build`, `pnpm docker:api:up` (dev target),
`pnpm docker:api:logs`, `pnpm docker:api:stop` and existing `pnpm docker:ps`.
The API gets 15s native stop grace around its 10s application cleanup deadline;
project-wide commands honor service grace. Full project drain proof remains 4.10.
Automated smoke remains 4.8; `api-verify` is not available yet. See the
[runtime startup evidence](docs/technical/step-4-verification-2026-10-28.md#stage-46--canonical-compose-and-doppler-startup).

### API development and reload

Stage 4.7 runs the nonroot API Dockerfile `development` target through the optional
`api-dev` service, using the checkout and the same five initialized tooling
volumes. After the existing one-time volume init/frozen install and API image
build above, stop built mode and start foreground development:

```sh
docker compose --env-file .env.compose --file compose.yaml stop api api-dev
./scripts/database.sh up dev
./scripts/database.sh api-dev dev
```

Open [liveness](http://127.0.0.1:3000/health/live) and
[readiness](http://127.0.0.1:3000/health/ready), or use the curl commands above.
The same exact HTTP 200 bodies apply. `pnpm docker:api:dev` is the host shortcut;
`docker:api:build` and `docker:api:stop` now select both real API services.
For another log viewer use
`docker compose --env-file .env.compose --file compose.yaml logs --follow api-dev`.

The finite DB build finishes before both persistent uncached watchers. API source
runs with native Node watch and the pinned tsx loader; DB TypeScript watch emits
compiled JS/declarations and imported DB/schema changes reload the API. Only the
API task receives the selected DB tuple; compilers receive no DB credentials.
No migration, install or secret fetch occurs on reload. Relaunch the outer command
to obtain changed Doppler values. Both modes default to loopback port 3000 and
cannot publish that same port together; `API_HOST_PORT` also applies to dev.

Ctrl+C stops foreground development. The development service uses native SIGINT
and 15s grace: the pinned pnpm/Turbo TERM chain cut off an in-flight response;
SIGINT preserved it through both outer TERM and Ctrl+C. Runtime retains TERM.
Use the canonical foreground command for this verified shutdown path. A stopped
service container can remain for diagnosis; native API-only stop preserves DBs.

A DB compiler error is visible and retains the last valid compiled output/API;
that running process does not prove current source passes checks. Correct the
error and verify readiness again. Failed API startup can leave Node watch waiting
for an edit. Adding/removing/renaming DB files requires stopping dev and running
`./scripts/tooling.sh run pnpm build` before restarting; watch emit does not remove
stale output. Stop watchers before any finite clean build or strict check that
can build DB. No migrations or data resets are required for diagnostic health.
See the [reload, recovery and signal evidence](docs/technical/step-4-verification-2026-10-28.md#stage-47--development-image-and-reload).

### Doppler host setup and verification

Database commands require Doppler CLI 3.77.1 and a one-time browser login. Use the
[Doppler setup instructions](docs/technical/local-development.md#doppler-host-setup-and-verification).
The existing Homebrew installation is discovered without an executable export.
An expired login requires signing in again, without repeating setup.
Ordinary tooling commands do not require Doppler.

## Local PostgreSQL

In Doppler project `storage-minis`, keep `POSTGRES_PASSWORD` in config `dev` and
`POSTGRES_TEST_PASSWORD` in config `test`. Use different passwords. After setup:

```sh
pnpm docker:up
pnpm docker:up:test
./scripts/database.sh check dev
./scripts/database.sh check test
./scripts/database.sh psql dev -c 'SELECT current_database(), current_user;'
```

Explicit contradictory `DOPPLER_PROJECT`/`DOPPLER_CONFIG` overrides are rejected;
normal commands choose the correct config without them.

| Target | Default host address | Container address | Database |
| --- | --- | --- | --- |
| Development | `127.0.0.1:5433` | `postgres:5432` | `storage_minis_dev` |
| Test | `127.0.0.1:5434` | `postgres_test:5432` | `storage_minis_test` |

Both services use PostgreSQL 18.6, user `postgres`, and timezone `UTC`.
Development data persists. Test data is deleted when its container stops.
Apply the approved schema separately with `pnpm docker:migrate`. Change only the
three documented nonsecret settings
in `.env.compose` deliberately; changing the project name selects different volumes.
For logs, port conflicts, password changes, or target-specific data deletion, see
the [database reference](docs/technical/local-development.md#local-postgresql).

## Docker lifecycle commands

The canonical `compose.yaml` defines development PostgreSQL by default. Test,
tooling, the SQL client and API services use optional `test`, `tools`, `db-tools`,
`api` and `api-dev` profiles.
Run package scripts on the host from the repository root. In the table,
`docker compose …` means
`docker compose --env-file .env.compose --file compose.yaml`.

| Host command | Raw equivalent | Behavior |
| --- | --- | --- |
| `pnpm docker:setup` | See the [setup expansion](docs/technical/local-development.md#docker-tooling) | Save settings once, build/pull, init, frozen install and start dev |
| `pnpm docker:build` | `docker compose … build tooling` | Build the tooling image |
| `pnpm docker:init` | `docker compose … run --rm --no-deps tooling-init` | Initialize dependency/cache volumes |
| `pnpm docker:up` | `./scripts/database.sh up dev` | Start default services and verify database authentication |
| `pnpm docker:up:test` | `./scripts/database.sh up test` | Start/check only test PostgreSQL |
| `pnpm docker:migrate` | `./scripts/tooling.sh run-db dev pnpm db:migrate` | Apply pending committed migrations to development PostgreSQL |
| `pnpm docker:stop` | `docker compose … --profile '*' stop` | Stop all services; retain containers and named volumes |
| `pnpm docker:stop:test` | `docker compose … stop --timeout 10 postgres_test` | Stop only test PostgreSQL |
| `pnpm docker:prune` | `docker compose … --profile '*' down --remove-orphans` | Remove project containers/network; preserve named volumes |
| `pnpm docker:prune:volumes --confirm PROJECT` | `./scripts/reset-volumes.sh --confirm PROJECT` | Also erase development data, dependencies and caches |
| `pnpm docker:ps` | `docker compose … --profile '*' ps --all` | List all service containers |
| `pnpm docker:logs` | `docker compose … logs --follow postgres` | Follow development logs; use `postgres_test` for test logs |

Native aliases use Docker on PATH and its normal context. All helpers locate the
saved settings from the checkout, even when invoked from another directory.
Plain `.env` files remain ignored. Raw Compose commands must retain the explicit
`--env-file .env.compose --file compose.yaml` selection. If you previously exported
project, port or Doppler selections, clear them once in that terminal; explicit
environment overrides otherwise take precedence over the saved settings.

Stop, teardown, status and logs need no Doppler. Ordinary teardown preserves data:

```sh
pnpm docker:prune
```

Full volume deletion requires the exact project name from `.env.compose` and
checks ownership before teardown. For this checkout:

```sh
pnpm docker:prune:volumes --confirm storage-minis-beijing
```

This erases development data and dependency/cache volumes. The saved settings file
remains; rerun `pnpm docker:setup` to rebuild dependencies and start with fresh
storage. See the [cleanup reference](docs/technical/local-development.md#shutdown-and-explicit-storage-removal)
for narrower resets and the [technical record](docs/technical/technical-direction.md#one-time-local-setup-2026-10-25)
for approval, command contracts and verification.

## Drizzle tooling

No host Drizzle installation is needed. After Docker dependency installation:

```sh
./scripts/tooling.sh run pnpm build
./scripts/tooling.sh run-db dev pnpm db:check
./scripts/tooling.sh run-db test pnpm db:check
./scripts/tooling.sh run-db test pnpm test:db
```

These commands reuse the project/Doppler settings above. `build` emits API
configuration and the DB package; `db:check` verifies an authenticated query; `test:db` requires the test
service and runs uncached integration tests. Stop test storage only after tests
finish; it is discarded on stop.

Generation and application are separate uncached commands:

```sh
./scripts/tooling.sh run pnpm db:generate
pnpm docker:migrate
```

Generation compares the approved TypeScript schema with committed snapshots,
without connecting. Review generated SQL/snapshots/journal before applying.
Application validates the explicit local target, skips applied history, and has
bounded connection/lock/statement/process waits. It runs no seed or import.
See [Drizzle setup and lifecycle](docs/technical/local-development.md#drizzle-tooling).

## Development checks

Prefix each command with `./scripts/tooling.sh run` when you use Docker.

| Command | Function |
| --- | --- |
| `pnpm typecheck` | Check TypeScript in root tooling and both packages |
| `pnpm lint` | Run ESLint; warnings cause failure |
| `pnpm lint:fix` | Apply automatic lint fixes |
| `pnpm format:check` | Check source and configuration formatting |
| `pnpm format` | Apply Prettier formatting |
| `pnpm test` | Run unit tests once |
| `pnpm test:watch` | Run unit tests in watch mode |
| `pnpm check` | Run type, lint, format, and unit-test checks |

`pnpm check` builds the DB package and checks types, lint, formatting and API/DB
unit tests. `pnpm build` emits API configuration/factory/lifecycle/server ESM/declarations/source maps and
DB ESM/declarations, cleaning each package’s own `dist` first. Stop watchers before
finite builds. Stages 4.1–4.7 are complete. The factory uses explicit HTTP
configuration and injected DB-check/closing capabilities; the lifecycle owns one
DB/app and passes that full DB to async route registration before readiness/listen.
Injection and lifecycle fixtures cover health/errors/logs, partial failures,
cancellation and bounded cleanup. Run
`./scripts/tooling.sh run pnpm exec vitest run --project api-unit` for the focused
API suite; it requires no database or Doppler. See the
[cumulative evidence](docs/technical/step-4-verification-2026-10-28.md).
Integration tests run separately with `pnpm test:db` and require PostgreSQL. Empty suites still fail; do not use `--passWithNoTests` as evidence.

Stage 4.4 adds root `pnpm test:api` and API `test:process`, outside ordinary
unit checks. Run the schema suite to completion and release its clients before
the process suite against the same test service:

```sh
./scripts/tooling.sh run-db test pnpm test:db
./scripts/tooling.sh run-db test pnpm test:api
```

The process task builds DB/API finitely, then runs uncached serial tests against
the exact test tuple. Both command names refuse development before credential
fetch; runner/config guards also reject dev/mixed tuples. Tests own their
children, reserved loopback ports and controller pool, and preserve schema and
business data. Tests/hooks allow 30s/10s; the suite has a 180s supervisor plus
10s termination and a 1s pipe fallback, with bounded in-memory output. No other
schema/process/smoke/outage consumer may overlap. The 15 process cases and
foundation aggregate passed; real service-outage proof remains stage 4.9.
See the [evidence and cleanup record](docs/technical/step-4-verification-2026-10-28.md#stage-44--guarded-built-process-tests).

With an explicitly supplied, validated runtime environment, root `pnpm start`
builds DB/API through Turbo and runs the API's
`node --enable-source-maps dist/server.js`. After `pnpm build`, direct Node from
`apps/api` uses that same entry without a TS loader. The uncached persistent
start task passes only the [listed runtime settings](docs/plans/step-4-fastify-plan-2026-10-28.md#build-development-and-turbo-contract).
Startup has a 17s failure/cleanup watchdog; signals share one 10s cleanup bound.
Successful SIGINT/SIGTERM cleanup returns 130/143; failures return 1.
Real OS/DB startup-failure and basic signal proof is complete; the user-facing
Doppler/Compose API startup path is available through `api-up` (above). Default
Docker startup still selects PostgreSQL only.

### Turborepo checks and cache

Turborepo caches successful checks in `.turbo/cache`. Remote caching is disabled.
Use `pnpm check --dry=json` to inspect tasks. See the
[cache verification commands](docs/technical/local-development.md#turborepo-checks-and-cache)
for forced runs and cache checks.

## Code patterns

- Use English for identifiers, comments, and documentation.
- Use strict TypeScript and ESM modules.
- Use `import type` for type-only imports.
- Use `.js` extensions for relative imports in application `.ts` files.
- Handle missing values from indexed access.
- Do not assign `undefined` to optional properties unless their types permit it.
- Handle promises. ESLint rejects unhandled promises.
- Prefix intentionally unused parameters with `_`. Remove unused local variables.
- Use two spaces, double quotes, semicolons, and trailing commas. Let Prettier format code.
- Put unit tests beside source files as `src/**/*.test.ts`.
- Import `test`, `expect`, and other APIs from `vitest`. Test globals are disabled.
- Use pnpm for dependency changes. Keep exact dependency versions and the shared lockfile.
- Use Conventional Commits.

The unit projects are `api-unit` and `db-unit`. They exclude
`*.integration.test.ts` files. The separate DB integration suite uses real PostgreSQL. Playwright setup,
business persistence tests, coverage, and CI remain pending.

## Agent guidance

Read [AGENTS.md](AGENTS.md) before making changes. Obtain owner approval before
new technical decisions. Use the existing
[approval process](AGENTS.md#owner-approval-before-decisions).

## Documentation

Read approved update logs with the published requirements. Later approved
decisions take precedence over conflicting text. Requirements, ownership, and
the versioned requirements baseline still needs consolidation; the database
diagram now matches the approved structural schema.

- [Requirements v0.7](docs/requirements/requirements-v0.7.md)
- [Entity map v0.8](docs/entities/entity-map-v0.8.md)
- [Approved updates and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership v0.7](docs/requirements/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md)
- Database schema: [DBML](docs/database/schema.dbml), [design guide](docs/database/design.md), [approved review](docs/database/step-3b-schema-review-2026-10-25.md), and [implementation/evidence](docs/database/step-3b-implementation-2026-10-25.md)
- [Technical direction and approval records](docs/technical/technical-direction.md)
- [Local development reference](docs/technical/local-development.md)
- [Foundation implementation guide](docs/technical/technical-foundation-implementation-guide.md)
- Approved plans: [Docker tooling](docs/plans/step-1-tooling-plan-2026-10-24.md), [PostgreSQL](docs/plans/step-2-postgresql-plan-2026-10-24.md), and [Drizzle and base migration](docs/plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md)
- [Step 4 Fastify plan — stages 4.1–4.7 complete; later stages pending](docs/plans/step-4-fastify-plan-2026-10-28.md), [sequential implementation stages](docs/plans/step-4-fastify-implementation-stages-2026-10-28.md) and [one prompt per stage](docs/plans/step-4-fastify-stage-prompts-2026-10-28.md)
- [Current Compose maintenance plan — implemented](docs/plans/standard-compose-maintenance-plan-2026-10-25.md)
- [Earlier application-container and lifecycle plan — superseded direction](docs/plans/docker-application-lifecycle-plan-2026-10-25.md)
- [Foundation proposal — approval pending](docs/technical/t06-foundation-proposal-2026-10-24.md)
- [Technical direction review](docs/technical/technical-direction-review.md)

Keep links to the latest published document versions. Preserve earlier versions
as historical records.
