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

Run all commands from the repository root. You need:

- Git and a checkout of this repository.
- Docker Desktop, or another Docker Engine with Compose v2
  (`docker compose version`), running. PostgreSQL runs in containers; no host
  PostgreSQL installation is needed.
- Node.js **24.22.1** and pnpm **12.15.0** on the host. The versions are pinned in
  [`.nvmrc`](.nvmrc) and [`package.json`](package.json); installation refuses
  other versions.

Use a Node.js version manager that reads `.nvmrc`. fnm and nvm both work; fnm is
the current local setup. A shell that has not initialized the manager reports
`node: command not found` even when Node.js is installed.

```sh
fnm install && fnm use        # or: nvm install && nvm use
npm install --global pnpm@12.15.0
pnpm install --frozen-lockfile
pnpm db:up
```

`pnpm db:up` starts the development and test databases and waits until both
are healthy. No Doppler login is needed: local database values are committed
in [`.env.development`](.env.development) and [`.env.test`](.env.test). They
are local-only values, not secrets; both databases publish only on
`127.0.0.1`. Production values exist only in Doppler. Installing tools or
changing shell initialization follows the
[owner approval rules](AGENTS.md#owner-approval-before-decisions).

## Local PostgreSQL

| Database | Host address | Database name | Storage |
| --- | --- | --- | --- |
| Development (`postgres`) | `127.0.0.1:5433` | `storage_minis_dev` | Named volume; survives `db:down`/`db:up` |
| Test (`postgres_test`) | `127.0.0.1:5434` | `storage_minis_test` | Memory (tmpfs); discarded whenever it stops |

Both run PostgreSQL **18.6** in UTC. On first initialization each creates two
roles:

- `storage_minis_owner` owns the database and runs migrations
  (`MIGRATION_DATABASE_URL`).
- `storage_minis_app` is the application's least-privilege role
  (`DATABASE_URL`). It can read and write table rows but cannot change the
  schema.

| Command | Effect |
| --- | --- |
| `pnpm db:up` | Start both databases and wait for health (60 s limit). |
| `pnpm db:down` | Stop both. Development data is kept; test data is discarded. |
| `pnpm db:psql` | Open `psql` in the development container as the owner. Add `-c 'SQL'` for one statement. |
| `pnpm db:reset` | **Destructive.** Remove the project's containers, network and development volume. Run `pnpm db:up` afterwards for empty databases. |

Raw Compose commands need the same values file, for example
`docker compose --env-file .env.development logs --follow postgres` or
`docker compose --env-file .env.development ps`. Without it, Compose stops
with a `required variable ... is missing a value` error and changes nothing.

The project name is the checkout's directory name, so separate checkouts in
directories with different names get separate volumes. The published ports
are fixed, so stop one checkout's databases before starting another's.

Roles are created only when a volume is first initialized. If you change a
password in `.env.development` for an existing development volume, either run
`pnpm db:reset` or change it in place as the `postgres` superuser:

```sh
docker compose --env-file .env.development exec postgres \
  psql -U postgres -d storage_minis_dev \
  -c "ALTER ROLE storage_minis_app PASSWORD 'new-value'"
```

The test database is recreated on every start, so it always uses the current
`.env.test` values.

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
