# StorageMinis

StorageMinis manages inventory, purchases, sales, finances, collections, and a
public stock catalog for 1/64 miniature sellers and collectors.

This guide follows the implementation in
[PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107): Docker tooling,
PostgreSQL, Drizzle schema/migrations, and a Fastify API with development reload.
**tRPC, authentication, business endpoints, and the React frontend are still
pending.** The runnable API currently exposes diagnostic health routes.

Follow [first-time setup](#local-setup), then use the
[daily development loop](#api-development-and-reload). For a feature, follow
[database migrations](#drizzle-tooling), the [tRPC handoff](#developing-a-trpc-endpoint-pending),
and [checks](#development-checks). Detailed recovery and infrastructure evidence
live in the [local development reference](docs/technical/local-development.md)
and [technical direction](docs/technical/technical-direction.md).

## Local setup

Run all commands from the repository root. The Docker workflow needs:

- Git and a checkout of this repository.
- Docker Desktop with its Linux engine running and Docker Compose available
  (`docker compose version`). No separate `docker-compose` installation is needed.
- Doppler CLI **3.77.1** on the host, access to project `storage-minis`, and the
  dedicated browser login below. Doppler runs before Compose; it is not installed
  inside the application container.
- Network access for initial image builds, dependency installation, and Doppler.

Docker supplies Node.js **24.22.1** and pnpm **12.15.0**. Host Node/pnpm are optional;
if already installed at those versions, the `pnpm docker:*` shortcuts below are
available. See [host setup](docs/technical/local-development.md#local-setup) for the
approved fnm/nvm alternatives and
[Doppler installation](docs/technical/local-development.md#doppler-host-setup-and-verification)
for the pinned CLI. Installing tools or changing shell initialization follows the
[owner approval rules](AGENTS.md#owner-approval-before-decisions).

### Doppler host setup and verification

Ask the project owner for access and these managed entries. Password values stay
in Doppler; development and test passwords must differ.

| Project | Config | Entry | Consumer |
| --- | --- | --- | --- |
| `storage-minis` | `dev` | `POSTGRES_PASSWORD` | Development PostgreSQL and API |
| `storage-minis` | `test` | `POSTGRES_TEST_PASSWORD` | Disposable test PostgreSQL and test commands |
| `storage-minis` | `dev` | `FOUNDATION_TOOLING_PROBE=storage-minis-tooling-ok` | Optional environment verification |

Create the dedicated credential directory, then complete the browser login:

```sh
mkdir -p "$HOME/.config/storage-minis/doppler"
chmod 700 "$HOME/.config/storage-minis/doppler"
doppler --config-dir "$HOME/.config/storage-minis/doppler" login --scope "$PWD"
```

For the standalone CLI installation, use its full executable path for login as
shown in the reference. Helpers discover Doppler on PATH, then at that approved
location. They choose `dev` or `test` automatically; no `doppler setup`, exported
passwords, service token, or copied secret `.env` file is needed. Contradictory
`DOPPLER_PROJECT`/`DOPPLER_CONFIG` overrides and `DOPPLER_TOKEN` are rejected.
Only selected credentials enter containers; browser credentials remain on the host.

### Docker tooling

For a fresh checkout, run this sequence once; it requires no host Node/pnpm:

```sh
./scripts/configure-local.sh
docker compose --env-file .env.compose --file compose.yaml build tooling
docker compose --env-file .env.compose --file compose.yaml pull postgres
docker compose --env-file .env.compose --file compose.yaml run --rm --no-deps tooling-init
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/database.sh up dev
```

The first command asks for a **unique Compose project name** and two unused,
distinct database ports (defaults `5433`/`5434`). For an existing checkout, retain
its saved settings and project name to reuse its data. `.env.compose` is Git-ignored
and stores only `COMPOSE_PROJECT_NAME`, `POSTGRES_PORT`, and `POSTGRES_TEST_PORT`.
A different project name selects different volumes. Run one setup/install at a time.

With pinned host Node/pnpm, `pnpm docker:setup` runs that same sequence. Repeating
setup preserves existing settings and development data. It applies no migrations.
Dependencies/cache live in checkout-specific Linux volumes; host editors cannot
resolve those dependencies without the separately approved editor/host setup.

After reviewing the committed migrations, have the owner perform the first
application to development, as required by the existing migration approval gate:

```sh
./scripts/tooling.sh run-db dev pnpm db:migrate
```

The host shortcut is `pnpm docker:migrate`. This creates the approved application
schema and migration history; it performs no seed, administrator bootstrap, or
legacy import. Later explicit applications skip migrations already recorded.

Build the API images once, then check the workspace:

```sh
docker compose --env-file .env.compose --file compose.yaml build api api-dev
./scripts/tooling.sh run pnpm check
# Optional Doppler-to-container probe:
./scripts/tooling.sh verify-env
```

Continue with the daily loop below. Default startup starts PostgreSQL only.

## Local PostgreSQL

Start or verify the database without repeating setup:

```sh
./scripts/database.sh up dev
./scripts/database.sh check dev
./scripts/database.sh psql dev -c 'SELECT current_database(), current_user;'
```

`up dev` (host alias `pnpm docker:up`) waits for health and verifies authenticated
DB identity. `psql` runs in a disposable container; use `-c SQL`, not an interactive
prompt. A host PostgreSQL installation is unnecessary.

| Target | Host address with default ports | Container address | Database | Storage |
| --- | --- | --- | --- | --- |
| `dev` | `127.0.0.1:5433` | `postgres:5432` | `storage_minis_dev` | Named volume; survives stop/start and ordinary teardown |
| `test` | `127.0.0.1:5434` | `postgres_test:5432` | `storage_minis_test` | Temporary memory storage; discarded on stop/restart |

Both use PostgreSQL **18.6**, user `postgres`, and timezone `UTC`. Saved host ports
may differ. Containers use service names and port `5432`, never host ports.
The helpers construct the connection tuple; Doppler supplies the matching password.

Start test storage only when needed with `./scripts/database.sh up test`
(`pnpm docker:up:test`). Tests and image probes share this target and run
**sequentially**. Never point disposable tests at development. Changing a Doppler
password does not change the password in an initialized development volume; follow
the [credential recovery instructions](docs/technical/local-development.md#database-lifecycle-and-reset).

## API development and reload

After setup, start a normal working session:

```sh
./scripts/database.sh up dev
# Stop either API mode if it was left running:
docker compose --env-file .env.compose --file compose.yaml stop api api-dev
./scripts/database.sh api-dev dev
```

The last command stays in the foreground. Its host shortcut is
`pnpm docker:api:dev`. Open [liveness](http://127.0.0.1:3000/health/live) and
[readiness](http://127.0.0.1:3000/health/ready): expect HTTP 200 with
`{"status":"ok"}` and `{"status":"ready"}`. Readiness checks DB connectivity and
identity; **it does not prove migrations are current**.

Edit API files under `apps/api/src/` and schema/DB code under `packages/db/src/`.
API edits restart the server; the DB watcher emits compiled JS/types, and imported
DB changes restart the API. Reload performs no installation or migration.

- **Schema change:** stop development, follow the migration workflow below, then
  restart. TypeScript changes alone do not change PostgreSQL.
- **DB file added, renamed, or removed:** stop development and run
  `./scripts/tooling.sh run pnpm build` before restarting to remove stale output.
- **Dependency/lockfile change:** stop development, run
  `./scripts/tooling.sh run pnpm install --frozen-lockfile`, then rebuild API images.
  New dependencies/versions require owner approval; use pnpm for changes.
- **Doppler change:** restart the outer command to fetch current values.
- **Before finite builds or checks:** stop watchers; they share DB build output.

Ctrl+C stops foreground development; PostgreSQL remains running. An API/compiler
error can leave the watcher waiting or the previous compiled version serving.
Read the terminal output, fix the error, and run finite checks before trusting it.
For another port, use `API_HOST_PORT=3001 ./scripts/database.sh api-dev dev`.
See [development recovery](docs/technical/local-development.md#api-development).

## Implementing a feature

Read the feature's live issue, requirements, and approved updates before coding.
Obtain approval for new technical choices and unresolved business rules under
[AGENTS.md](AGENTS.md#owner-approval-before-decisions); the examples here introduce
no new business contract.

| Change | Where it belongs |
| --- | --- |
| Columns, enums, constraints, indexes | Existing domain file in `packages/db/src/schema/`; exports in `schema/index.ts` |
| Reviewed database upgrade | Generated SQL and metadata in `packages/db/drizzle/` |
| HTTP/lifecycle integration | `apps/api/src/`; preserve `app.ts`, `lifecycle.ts`, and `server.ts` ownership |
| New API procedure | Future tRPC router in `apps/api`; adapter/context conventions remain Step 5 work |
| Tests | Unit tests beside source; real PostgreSQL tests for persistence behavior |

A typical feature goes through approved contract → schema/migration if needed →
typed DB operation → validated/authorized API procedure → appropriate tests.
A feature using existing columns needs no migration.

For example, an approved Customer field change starts in
[`sales-and-returns.ts`](packages/db/src/schema/sales-and-returns.ts), gets a named
migration, and updates the inferred `schema.customers` types after a build. The
future endpoint must expose that field explicitly in its Zod contract.

### Drizzle tooling

A **migration** changes PostgreSQL's schema. A tRPC **mutation** handles an API
write; adding one does not inherently require a migration.

For an approved schema change, stop the development watcher and:

1. Edit the relevant TypeScript schema file. Export new schema definitions through
   `packages/db/src/schema/index.ts`; keep the DBML/design docs synchronized with
   approved model changes.
2. Generate a named migration offline, without PostgreSQL or Doppler:

   ```sh
   ./scripts/tooling.sh run pnpm db:generate -- --name describe_change
   git diff -- packages/db/src/schema packages/db/drizzle
   ```

3. Review the generated SQL, snapshot, and journal together. Check constraints,
   existing-row compatibility, data preservation, and any required backfill.
   Preserve applied history; correct it with a new forward migration. The project
   uses generate/review/apply, with no direct `drizzle-kit push` workflow.
4. Prove replay and affected persistence behavior on disposable test storage:

   ```sh
   ./scripts/database.sh up test
   ./scripts/tooling.sh run-db test pnpm test:db
   ```

   The existing suite resets test schemas and replays the committed chain. Add
   feature-specific real-PostgreSQL cases; the structural suite alone does not
   prove a new business operation. For explicit manual test application, use
   `./scripts/tooling.sh run-db test pnpm db:migrate`.
5. After review and the applicable approval, apply pending migrations to development
   and build current compiled exports:

   ```sh
   ./scripts/tooling.sh run-db dev pnpm db:migrate
   ./scripts/tooling.sh run pnpm build
   ```

6. Restart `./scripts/database.sh api-dev dev` and exercise the feature. Commit
   schema changes, all corresponding migration artifacts, and tests together.

| Artifact | How to use it | Commit? |
| --- | --- | --- |
| `packages/db/drizzle/NNNN_describe_change.sql` | Reviewed upgrade executed by `db:migrate` | Yes |
| `packages/db/drizzle/meta/NNNN_snapshot.json` | Schema state used by the next generation | Yes |
| `packages/db/drizzle/meta/_journal.json` | Ordered migration chain used by Drizzle | Yes |
| `packages/db/dist/` and `apps/api/dist/` | Compiled runtime JS and declarations emitted by `pnpm build` | No; ignored build output |

`NNNN` is the next generated sequence, not a literal filename. Migration SQL is
not imported into application code. Drizzle derives row/insert types from the
TypeScript schema; consuming code imports the compiled package:

```ts
import type { Database, schema } from "@storage-minis/db";

type CustomerRow = typeof schema.customers.$inferSelect;
type CustomerInsert = typeof schema.customers.$inferInsert;
```

Use the `Database` passed by the API lifecycle and its `database.db` Drizzle handle
for queries/transactions. Do not import `packages/db/src` through source aliases,
create another pool per request, or manually edit generated `dist` files.
Builds refresh code/types; migrations update the database. Neither substitutes for
the other. Application startup never runs migrations. For interrupted application,
inspect `drizzle.__drizzle_migrations` before retrying; see the
[migration reference](docs/technical/local-development.md#schema-generation-and-migration-application).

### Developing a tRPC endpoint (pending)

PR #107 does **not** install `@trpc/server`, mount a tRPC URL, export an `AppRouter`,
or implement protected procedures. Do not expect tRPC calls to work yet.
[Foundation Step 5](docs/technical/technical-foundation-implementation-guide.md#step-5--trpc-and-zod-integration)
first needs approved dependency pins, the Fastify adapter, request context, bounded
Zod input/output schemas, safe errors, and a type-only router export. Its initial
procedures are diagnostic and table-free. Business authorization remains T02 work.

The existing integration point is
[`startLifecycle`'s `registerRoutes(app, database)` callback](apps/api/src/lifecycle.ts).
Step 5 must wire that callback from `server.ts`, register the adapter before
readiness/listen, and give request context the **same owned `Database`** and request
information. Keep pool creation, listening, signals, and cleanup in the lifecycle.
The [official Fastify adapter documentation](https://trpc.io/docs/server/adapters/fastify)
explains adapter registration; local paths, URL prefix, and exports await that step.

Once the adapter and required business authorization exist, a normal endpoint
implementation follows this sequence:

1. Define the feature's input and safe output with Zod, including approved bounds
   and money/date rules. Database row types do not validate HTTP input or define
   which fields a caller may see.
2. Add a read `.query()` or write `.mutation()` to the established router. Use the
   approved authenticated context and verify Membership/Organization scope before
   accessing private records. A submitted Organization ID is not authorization;
   public catalog queries require their explicit field allowlist.
3. Read through `ctx.database.db`. For a business write, perform source, inventory,
   funding, financial, and audit changes in one transaction, including the required
   locks, scope checks, and invariant enforcement.
4. Return only the declared output and translate expected failures safely. Preserve
   the API's redacted error/log boundary for unexpected failures.
5. Test the procedure through the actual Fastify/tRPC HTTP adapter, including invalid
   input/output and denied access. Writes also need real PostgreSQL rollback,
   reconciliation, and relevant concurrency tests.
6. Consume the eventual `AppRouter` through `import type` in a client. There is no
   separate generated tRPC client in this checkout; the frontend is also pending.

Illustrative procedure shape **after those prerequisites**; all builder, schema,
and operation names below are placeholders, not existing repository exports:

```ts
const read = authorizedProcedure
  .input(readInputSchema)
  .output(readOutputSchema)
  .query(({ ctx, input }) =>
    readScopedData(ctx.database.db, ctx.organizationId, input),
  );

const write = authorizedProcedure
  .input(writeInputSchema)
  .output(writeOutputSchema)
  .mutation(({ ctx, input }) =>
    ctx.database.db.transaction((tx) =>
      writeScopedDataAndAudit(tx, ctx.organizationId, ctx.actor, input),
    ),
  );
```

See official [procedures](https://trpc.io/docs/server/procedures) and
[input/output validation](https://trpc.io/docs/server/validators) documentation for
these APIs. This sketch supplies no authentication implementation or business
writer; their decisions and tests must precede exposing a real operation.

## Development checks

Stop the development watcher before these finite commands:

```sh
./scripts/tooling.sh run pnpm check
./scripts/tooling.sh run pnpm build
```

`check` builds DB prerequisites and runs strict typechecks, lint, source/config
formatting, and unit tests. It needs no database or Doppler. `build` compiles both
packages. Focused commands use the same runner: `pnpm typecheck`, `pnpm lint`,
`pnpm format`, `pnpm test`, or `pnpm exec vitest run --project api-unit`.
README Markdown needs its own link/fence/table review; the root format script
checks source/configuration files.

For schema/persistence or API lifecycle changes, run affected live checks one at a
time, after all other test consumers release the target:

```sh
./scripts/database.sh up test
./scripts/tooling.sh run-db test pnpm test:db
./scripts/tooling.sh run-db test pnpm test:api
# If runtime/image behavior changed, build and run the image smoke below.
# Stop test storage only after every consumer has finished:
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
```

`test:db` resets disposable schemas. `test:api` builds and tests real API child
processes, with a 180s suite supervisor and bounded cleanup. Neither belongs in
ordinary DB-free checks. Keep schema/process/image/outage phases exclusive;
restore an interrupted test outage with `./scripts/database.sh up test`.
Future feature coverage must include its requirement acceptance criteria; current
health and schema tests do not establish business acceptance.

### API runtime image

Use built mode to check the packaged API. Stop development first; both modes
publish host port 3000 by default. Rebuild after source/lockfile changes:

```sh
docker compose --env-file .env.compose --file compose.yaml build api api-dev
./scripts/database.sh up dev
./scripts/database.sh api-up dev
curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3000/health/live
curl --fail --silent --show-error --max-time 8 http://127.0.0.1:3000/health/ready
docker compose --env-file .env.compose --file compose.yaml logs --follow api
docker compose --env-file .env.compose --file compose.yaml stop api
```

The runtime image runs compiled Node as nonroot, without source mounts or startup
installation. `api-up` fetches matching credentials and starts the existing image;
it does not build, install, or migrate. Interrupting logs leaves the API running.
A DB outage keeps live at 200 and changes ready to 503
`{"status":"unavailable"}`; recovery needs no API restart. See
[runtime settings and failures](docs/technical/local-development.md#api-runtime-settings-and-failures).

### Automated API image smoke

After building the runtime image and finishing other test consumers:

```sh
./scripts/database.sh up test
./scripts/database.sh api-verify test
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
```

The host alias is `pnpm docker:api:verify`. This uncached verifier uses an owned
one-off runtime container and a dynamic loopback port, checks exact health bodies,
requires successful SIGTERM cleanup (container exit 143), and confirms removal.
The verifier exits 0 on success and has a 60s total bound including cleanup.
It performs no migrations. If Docker prevents cleanup, restore access and inspect
only the reported probe; see [failure recovery](docs/technical/local-development.md#api-runtime-settings-and-failures).

### Turborepo checks and cache

Builds/finite checks use local `.turbo/cache`; live DB commands, generation,
migrations, process tests, and watchers are uncached. Use
`./scripts/tooling.sh run pnpm check --dry=json` to inspect tasks. Forced runs and
cache diagnostics are in the [cache reference](docs/technical/local-development.md#turborepo-checks-and-cache).

## Docker lifecycle commands

These native operations need Docker, but no Doppler login. Ctrl+C stops foreground
development; use the API stop command when switching modes.

| Task | Command from the repository root | Effect |
| --- | --- | --- |
| Inspect all services | `docker compose --env-file .env.compose --file compose.yaml --profile '*' ps --all` | Includes optional/test services |
| Follow DB logs | `docker compose --env-file .env.compose --file compose.yaml logs --follow postgres` | Ctrl+C exits the log viewer |
| Follow development logs | `docker compose --env-file .env.compose --file compose.yaml logs --follow api-dev` | Leaves the API running |
| Stop API modes | `docker compose --env-file .env.compose --file compose.yaml stop api api-dev` | Preserves PostgreSQL |
| Stop all services | `docker compose --env-file .env.compose --file compose.yaml --profile '*' stop` | Preserves named volumes; test tmpfs is discarded |
| Remove project containers/network | `docker compose --env-file .env.compose --file compose.yaml --profile '*' down --remove-orphans` | Preserves named development/dependency/cache volumes |

Host shortcuts include `pnpm docker:ps`, `pnpm docker:logs`, `pnpm docker:api:stop`,
`pnpm docker:stop`, and `pnpm docker:prune`. Always retain the explicit env-file/file
selection with raw Compose commands. To deliberately erase development data and
all dependency/cache volumes, use `./scripts/reset-volumes.sh --confirm PROJECT`
with the exact saved project name; see the
[reset reference](docs/technical/local-development.md#shutdown-and-explicit-storage-removal).
Ordinary development does not require a reset.

## Code conventions

Use English, strict TypeScript, ESM, `.js` extensions in relative TS imports, and
`import type` for types. Handle promises and missing indexed values. Unit tests
live beside source as `src/**/*.test.ts` and import Vitest APIs explicitly.
Use the pinned pnpm versions/lockfile, Prettier, and Conventional Commits.

## Documentation

Read [AGENTS.md](AGENTS.md) and approved updates with the published requirements;
later approved decisions take precedence over conflicting baseline text.

- [Requirements v0.7](docs/requirements/requirements-v0.7.md)
- [Entity map v0.8](docs/entities/entity-map-v0.8.md)
- [Approved updates and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership v0.7](docs/requirements/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md)
- Database schema: [DBML](docs/database/schema.dbml), [design guide](docs/database/design.md), and [implementation/evidence](docs/database/step-3b-implementation-2026-10-25.md)
- [Technical direction and approval records](docs/technical/technical-direction.md)
- [Local development reference](docs/technical/local-development.md)
- [Foundation implementation guide and remaining steps](docs/technical/technical-foundation-implementation-guide.md)

Keep links to the latest published document versions; preserve historical baselines.
