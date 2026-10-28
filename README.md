# StorageMinis

StorageMinis manages inventory, purchases, sales, finances, collections, and a
public stock catalog for 1/64 miniature sellers and collectors.

This repository contains workspace tooling, local PostgreSQL services, and
application specifications. The Drizzle connection package and its tests are
implemented. Business tables, the API, the React frontend, and CI are pending.
Application startup commands are not available.

## Structure

```text
apps/api/              Fastify and tRPC workspace package; configuration only
packages/db/           Drizzle connection package, commands and tests
docker/                Tooling image and volume initializer
scripts/tooling.sh     Run workspace commands in Docker
scripts/database.sh    Manage development and test PostgreSQL
compose.yaml           Tooling services and volumes
compose.postgres.yaml  PostgreSQL services
docs/                  Requirements, models, plans, and technical decisions
AGENTS.md              Agent instructions and approval rules
```

The root contains shared TypeScript, ESLint, Prettier, Vitest, and Turborepo
configuration. All packages use one pnpm lockfile.

## Local setup

Use Docker Desktop with a running Linux engine and Docker Compose. Run the
commands below from the repository root. Docker supplies Node.js 24.22.1 and
pnpm 12.15.0.

For an existing host installation, use the
[host setup instructions](docs/technical/local-development.md#local-setup).
Both fnm and nvm support [.nvmrc](.nvmrc).

### Docker tooling

Set a unique project name for each checkout. Replace the example if another
checkout uses this name.

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
./scripts/tooling.sh build
./scripts/tooling.sh init
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/tooling.sh run pnpm list --recursive --depth -1
./scripts/tooling.sh run pnpm typecheck
./scripts/tooling.sh run pnpm lint
./scripts/tooling.sh run pnpm format:check
```

Build before you initialize volumes. Run one dependency installation at a time
per checkout. The workspace list must show three private packages.

Each command uses a temporary container. Dependencies and caches remain in
checkout-specific volumes. Host editors cannot resolve dependencies in these
volumes.

For runtime checks, storage cleanup, and launcher settings, see the
[local development reference](docs/technical/local-development.md#docker-tooling).

### Doppler host setup and verification

Database commands require Doppler CLI 3.77.1 on the host and a browser login.
Use the [Doppler setup instructions](docs/technical/local-development.md#doppler-host-setup-and-verification)
before you start PostgreSQL. Ordinary tooling commands do not require Doppler.

## Local PostgreSQL

Complete the Doppler setup first. In Doppler project `storage-minis`, keep
`POSTGRES_PASSWORD` in config `dev` and `POSTGRES_TEST_PASSWORD` in config `test`.
Use different passwords. The launcher requires the config to match its target.

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
export DOPPLER_PROJECT=storage-minis
export DOPPLER_CONFIG=dev
export TOOLING_DOPPLER_BIN=/opt/homebrew/bin/doppler
unset DOPPLER_TOKEN

./scripts/database.sh pull
./scripts/database.sh up dev
DOPPLER_CONFIG=test ./scripts/database.sh up test
./scripts/database.sh check dev
DOPPLER_CONFIG=test ./scripts/database.sh check test
./scripts/database.sh psql dev -c 'SELECT current_database(), current_user;'
```

The Doppler executable setting above selects the existing Homebrew installation.
For the standalone installation, omit that setting.

| Target | Host address | Container address | Database |
| --- | --- | --- | --- |
| Development | `127.0.0.1:5433` | `postgres:5432` | `storage_minis_dev` |
| Test | `127.0.0.1:5434` | `postgres_test:5432` | `storage_minis_test` |

Both services use PostgreSQL 18.6, user `postgres`, and timezone `UTC`.
Development data persists. Test data is deleted when its container stops.
The databases contain no application tables. The DBML draft is not applied.

To stop the services:

```sh
./scripts/database.sh stop test
./scripts/database.sh stop dev
./scripts/database.sh down
```

Use `database.sh down` for project shutdown when databases have been started.
For logs, port conflicts, password changes, or data deletion, see the
[database reference](docs/technical/local-development.md#local-postgresql).

## Drizzle tooling

No host Drizzle installation is needed. After Docker dependency installation:

```sh
./scripts/tooling.sh run pnpm build
./scripts/tooling.sh run-db dev pnpm db:check
DOPPLER_CONFIG=test ./scripts/tooling.sh run-db test pnpm db:check
DOPPLER_CONFIG=test ./scripts/tooling.sh run-db test pnpm test:db
```

These commands reuse the project/Doppler settings above. `build` emits the DB
package; `db:check` verifies an authenticated query; `test:db` requires the test
service and runs uncached integration tests. Stop test storage only after tests
finish; it is discarded on stop.

`pnpm db:generate` and `pnpm db:migrate` currently refuse with
“Schema/migrations pending approval (Step 3B)” before connecting or creating files.
The first business migration requires the separate schema reconciliation review.
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

`pnpm check` builds the DB package and checks types, lint, formatting and meaningful
DB unit tests. Integration tests run separately with `pnpm test:db` and require
PostgreSQL. Empty suites still fail; do not use `--passWithNoTests` as evidence.

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
database drafts still need consolidation.

- [Requirements v0.7](docs/requirements/requirements-v0.7.md)
- [Entity map v0.8](docs/entities/entity-map-v0.8.md)
- [Approved updates and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership v0.7](docs/requirements/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md)
- Database drafts: [DBML](docs/database/schema.dbml), [design guide](docs/database/design.md), and [Step 3B schema review](docs/database/step-3b-schema-review-2026-10-25.md)
- [Technical direction and approval records](docs/technical/technical-direction.md)
- [Local development reference](docs/technical/local-development.md)
- [Foundation implementation guide](docs/technical/technical-foundation-implementation-guide.md)
- Approved plans: [Docker tooling](docs/plans/step-1-tooling-plan-2026-10-24.md), [PostgreSQL](docs/plans/step-2-postgresql-plan-2026-10-24.md), and [Drizzle and base migration](docs/plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md)
- [Step 4 Fastify plan and dependency review — approval pending](docs/plans/step-4-fastify-plan-2026-10-28.md)
- [Foundation proposal — approval pending](docs/technical/t06-foundation-proposal-2026-10-24.md)
- [Technical direction review](docs/technical/technical-direction-review.md)

Keep links to the latest published document versions. Preserve earlier versions
as historical records.
