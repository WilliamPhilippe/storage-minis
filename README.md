# StorageMinis

StorageMinis manages inventory, purchases, sales, finances, collections, and a
public stock catalog for 1/64 miniature sellers and collectors.

The repository is a pnpm/Turborepo workspace: the Drizzle schema and migrations
in `packages/db`; a Fastify API in `apps/api` that currently serves diagnostic
health routes and one diagnostic tRPC procedure; and the React web app in
`apps/web`, with the responsive shell, the en-US and pt-BR catalogs, placeholder
pages, the Login page without sign-in, and a card that calls the diagnostic
procedure. Node.js runs on the host; PostgreSQL runs in Docker.
**Authentication, business endpoints and business screens are still pending.**

Follow [local setup](#local-setup), then the [daily loop](#daily-development).
For a feature, read [implementing a feature](#implementing-a-feature) and
[checks](#checks). The [local development reference](docs/technical/local-development.md)
covers configuration, limits, failures and recovery;
[technical direction](docs/technical/technical-direction.md) records the approved
decisions.

## Local setup

Run all commands from the repository root. You need:

- Git and a checkout of this repository.
- Docker Desktop, or another Docker Engine with Compose v2 or later
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
pnpm db:migrate
```

`pnpm db:up` starts the development and test databases and waits until both
are healthy. `pnpm db:migrate` applies the committed migrations to the
development database. No Doppler login is needed: local database values are
committed in [`.env.development`](.env.development) and [`.env.test`](.env.test).
They are local-only values, not secrets; both databases publish only on
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
| `pnpm db:reset` | **Destructive.** Remove the project's containers, network and development volume. Run `pnpm db:up` and `pnpm db:migrate` afterwards. |

Raw Compose commands need the same values file, for example
`docker compose --env-file .env.development logs --follow postgres` or
`docker compose --env-file .env.development ps`. Without it, Compose stops
with a `required variable ... is missing a value` error and changes nothing.

The project name is the checkout's directory name, so checkouts in
directories with different names get separate volumes. The published ports
are fixed: stop one checkout's databases (`pnpm db:down`) before starting
another's.

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

## Daily development

```sh
pnpm db:up   # if the databases are not running
pnpm dev     # API on http://127.0.0.1:3000, web on http://localhost:5173; Ctrl+C stops both
```

`pnpm dev` builds the DB package once, then watches both packages: API edits
restart the server, and DB package edits recompile it and restart the server.
It also runs the web app's Vite server on `http://localhost:5173` (bound to
`127.0.0.1`; it fails rather than move to another port), which proxies `/trpc/`
to the API. Open [`/app`](http://localhost:5173/app): the API connection card
shows the echoed message. With the API stopped, the card's error appears after
about 7 s of retries.
Open [liveness](http://127.0.0.1:3000/health/live) and
[readiness](http://127.0.0.1:3000/health/ready): expect HTTP 200 with
`{"status":"ok"}` and `{"status":"ready"}`. Readiness checks the database
connection and identity; **it does not prove migrations are current**, and the
API never migrates.

- **Schema change:** follow [database migrations](#database-migrations).
  TypeScript edits alone do not change PostgreSQL.
- **Route file added, renamed, or removed:** the router plugin regenerates
  `apps/web/src/routeTree.gen.ts` while `pnpm dev` or `pnpm build` runs. Commit
  the regenerated file with the route; typecheck, lint and tests read it.
- **DB file added, renamed, or removed:** stop `pnpm dev` and run `pnpm build`
  first; watch mode does not delete stale output.
- **Dependency or lockfile change:** stop `pnpm dev`, run
  `pnpm install --frozen-lockfile`, then restart. New dependencies or versions
  need owner approval; use pnpm for changes.
- **Before finite builds or checks:** stop `pnpm dev`; both write the DB
  package's `dist`.

A compiler error can leave the previous build serving. Read the terminal, fix
the error and confirm a fresh readiness response.

## Implementing a feature

Read the feature's live issue, requirements, and approved updates before coding.
Obtain approval for new technical choices and unresolved business rules under
[AGENTS.md](AGENTS.md#owner-approval-before-decisions); the examples here introduce
no new business contract.

| Change | Where it belongs |
| --- | --- |
| Columns, enums, constraints, indexes | Existing domain file in `packages/db/src/schema/`; exports in `schema/index.ts` |
| Reviewed database upgrade | Generated SQL and metadata in `packages/db/drizzle/` |
| HTTP/lifecycle integration | `apps/api/src/`; add routes as plugins registered in `app.ts` (see `health.ts`); preserve `lifecycle.ts` and `server.ts` ownership |
| New API procedure | Router module in `apps/api/src/trpc/routers/`, attached in `trpc/router.ts`; see [developing a tRPC endpoint](#developing-a-trpc-endpoint) |
| Web page | Route definition only in `apps/web/src/routes/`; the page component, its CSS Module (with a `.module.d.css.ts` declaration) and its tests in `apps/web/src/features/<area>/`. Follow the page's design in [`docs/design/`](docs/design/README.md) |
| Web strings | Both catalogs: `apps/web/src/i18n/en-US/<namespace>.ts` and the pt-BR file typed against it with `satisfies CatalogShape<typeof en>`. A route's loader calls `ensureNamespace` for its area |
| Money and dates in the web app | `formatMoney` and the date helpers in `apps/web/src/lib/format/` |
| Tests | Unit tests beside source; real PostgreSQL tests for persistence behavior; web component tests by role and label |

A typical feature goes through approved contract → schema/migration if needed →
typed DB operation → validated/authorized API procedure → appropriate tests.
A feature using existing columns needs no migration.

For example, an approved Customer field change starts in
[`sales-and-returns.ts`](packages/db/src/schema/sales-and-returns.ts), gets a named
migration, and updates the inferred `schema.customers` types after a build. The
future endpoint must expose that field explicitly in its Zod contract.

### Database migrations

A **migration** changes PostgreSQL's schema. A tRPC **mutation** handles an API
write; adding one does not inherently require a migration.

For an approved schema change, stop `pnpm dev` and:

1. Edit the relevant TypeScript schema file. Export new schema definitions
   through `packages/db/src/schema/index.ts`; keep the DBML/design docs
   synchronized with approved model changes.
2. Generate a named migration offline, without a database:

   ```sh
   pnpm db:generate -- --name describe_change
   git diff -- packages/db/src/schema packages/db/drizzle
   ```

   Drizzle Kit 0.31.11 can exit 0 after a generation error, so confirm that its
   last line reads `Your SQL migration file ➜ …` or
   `No schema changes, nothing to migrate`. For SQL that Kit does not manage,
   such as a function, create an empty custom migration with
   `pnpm --filter @storage-minis/db exec drizzle-kit generate --custom --name describe_change`
   and write the SQL into it.
3. Review the generated SQL, snapshot, and journal together. Check constraints,
   existing-row compatibility, data preservation, and any required backfill.
   Correct an applied migration with a new forward migration; the project has no
   `drizzle-kit push` workflow.
4. Prove replay and the affected persistence behavior on the test database:

   ```sh
   pnpm test:db
   ```

   Its setup resets the test database and replays the committed chain as the
   owner role; the tests then run as the app role. Add feature-specific
   real-PostgreSQL cases; the structural suite alone does not prove a new
   business operation.
5. Apply pending migrations to the development database, then restart
   `pnpm dev`:

   ```sh
   pnpm db:migrate
   ```

6. Commit schema changes, all corresponding migration artifacts, and tests
   together.

| Artifact | How to use it | Commit? |
| --- | --- | --- |
| `packages/db/drizzle/NNNN_describe_change.sql` | Reviewed upgrade applied by `db:migrate` and the `migrate` service | Yes |
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

Use the database the API lifecycle passes to `buildApp`: application code receives its
`database.db` Drizzle handle for queries/transactions, never the pool's `close`. Do not import `packages/db/src` through source aliases,
create another pool per request, or manually edit generated `dist` files.
Builds refresh code/types; migrations update the database. Neither substitutes for
the other. If a migration run is interrupted, inspect `drizzle.__drizzle_migrations`
before retrying; see the
[migration reference](docs/technical/local-development.md#migrations).

### Developing a tRPC endpoint

The API serves tRPC at `/trpc` with plain JSON (no transformer), no batching,
queries by GET and mutations by POST. The only procedure is the diagnostic
`diagnostics.echo`; protected procedures and business authorization are T02
work. With `pnpm dev` running:

```sh
curl 'http://127.0.0.1:3000/trpc/diagnostics.echo?input=%7B%22message%22%3A%22ok%22%7D'
# 200 {"result":{"data":{"message":"ok"}}}
curl 'http://127.0.0.1:3000/trpc/diagnostics.echo?input=%7B%22message%22%3A%22%22%7D'
# 400 {"error":{"message":"Invalid request","code":-32600,"data":{"code":"BAD_REQUEST","httpStatus":400,"issues":[{"path":["message"],"code":"too_small"}]}}}
curl -X POST -H 'content-type: application/json' -d '{"message":"ok"}' \
  http://127.0.0.1:3000/trpc/diagnostics.echo
# 405 METHOD_NOT_SUPPORTED: a query is GET only
```

Every failure under `/trpc` uses one envelope with a fixed message; the
[tRPC HTTP contract](docs/technical/local-development.md#trpc-http-contract) lists
each case and the documented exceptions. Request logs add `procedure` for a
matched procedure.

Where things live, under `apps/api/src/trpc/`:

| File | Holds |
| --- | --- |
| `init.ts` | `Context` (`{ db, requestId }`) and tRPC's root object `t` |
| `context.ts` | `createContext` and the `recordProcedure` middleware |
| `errors.ts` | The error envelope |
| `plugin.ts` | The Fastify route, body limit, JSON parser and failure handlers; `buildApp` registers it |
| `router.ts` | `appRouter`, which attaches each router module |
| `routers/` | One module per router, such as `diagnostics.ts` |

A new procedure follows this sequence:

1. Define the input and safe output with Zod. Bound **every string and array with
   `.max()`**: the 1 MiB body limit is only the outer bound, and query input
   travels in the URL (16 KiB header limit). Use `z.strictObject` so unknown keys
   are rejected. Database row types do not validate HTTP input or define which
   fields a caller may see.
2. Build from a module-private builder derived from `t.procedure` through
   `recordProcedure`, as `routers/diagnostics.ts` does; that middleware supplies
   the `procedure` log field. No public builder is exported. Business procedures
   wait for T02's protected builder, which verifies identity and
   Membership/Organization scope before private records are read. A submitted
   Organization ID is not authorization.
3. Read through `ctx.db`, the lifecycle's owned Drizzle handle. A business write
   performs source, inventory, funding, financial and audit changes in one
   transaction, with the required locks, scope checks and invariant enforcement.
4. Throw `TRPCError` with a fitting code for expected failures; clients see only
   the code and its fixed message. Unexpected errors become 500s whose log
   records the error type, code and stack frames, with messages only in
   development.
5. Test through `buildApp` and `app.inject()`, as `trpc/plugin.test.ts` does, not
   only by calling the router. Include invalid input and output and, for business
   procedures, denied access, plus real PostgreSQL rollback, reconciliation and
   concurrency tests for writes.

A client imports only the router type, and runtime imports of
`@storage-minis/api/types` fail by design:

```ts
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@storage-minis/api/types";

const client = createTRPCClient<AppRouter>({
  links: [httpLink({ url: "/trpc" })],
});
const { message } = await client.diagnostics.echo.query({ message: "ok" });
```

Read errors through `error.data.code` (and `error.data.issues` for validation).
The web app's client, QueryClient and options proxy live in
`apps/web/src/lib/trpc.ts`. Sharing runtime Zod schemas with the browser needs
a separate package, because this export carries types only. See the official
[procedures](https://trpc.io/docs/server/procedures) and
[validation](https://trpc.io/docs/server/validators) documentation.

## Checks

Stop `pnpm dev` before these finite commands:

```sh
pnpm check   # build DB and API exports; strict typechecks, lint, formatting, unit tests
pnpm build   # compile the packages and build apps/web/dist
```

`pnpm check` needs no database or Docker. Focused commands are `pnpm typecheck`,
`pnpm lint`, `pnpm format`, `pnpm test`, `pnpm exec vitest run --project api-unit`,
or `pnpm exec vitest run --project web-unit`. The `web-unit` project runs the web
app's component tests in jsdom, in `America/Sao_Paulo`, with a fresh app per
test. Its harness fails a test on any `fetch` the test did not stub and on any
`console.error` or `console.warn` it did not declare with `expectConsole`.
`pnpm --filter @storage-minis/web preview` serves `apps/web/dist` on
`http://localhost:4173` with the same proxy.
Prettier does not format Markdown; review changed links, fences and tables by hand.

The live suites run uncached. Start the databases first with `pnpm db:up`:

```sh
pnpm test:db     # schema, migration and connection tests on the test database
pnpm test:api    # real built API processes against the test database
pnpm test:stack  # parity stack smoke test; needs Docker
```

`test:db` and `test:api` share the test database: run them **one at a time**.
`test:db` drops and recreates the test schemas. Both refuse any database whose
name does not end in `_test` before connecting. Feature work must add its
requirement acceptance tests; the current health and schema tests do not
establish business acceptance.

### Parity stack

The parity stack runs the production image and `compose.yaml` locally, as the
separate Compose project `storage-minis-stack` with its own throwaway database:

```sh
pnpm stack:up     # build the API image, run migrate, start the API
curl http://127.0.0.1:3100/health/ready   # expect HTTP 200 {"status":"ready"}
pnpm stack:down   # remove the stack, including its database volume
```

`stack:up` runs `migrate` as a one-off container first and starts `api` only
after it succeeds. The VPS deploy uses the same order, so a failed migration
leaves a running API in place. The stack API listens on `127.0.0.1:3100` and
its PostgreSQL is not published, so the stack can run alongside `pnpm dev`.
`pnpm test:stack` starts a fresh stack, checks health, user, mounts, migration
order, a failed redeploy and shutdown, and always removes the stack afterwards.
`stack:down` keeps the built `storage-minis-api:local` image for faster
rebuilds; remove it with `docker image rm storage-minis-api:local`.

### Turborepo cache

Finite tasks cache in `.turbo/cache`, with remote caching disabled. Database,
migration, process-test and watch tasks never cache. Inspect the task graph with
`pnpm check --dry=json`; see the
[cache reference](docs/technical/local-development.md#turborepo-tasks-and-cache).

## Code conventions

Use English, strict TypeScript, ESM, `.js` extensions in relative TS imports in
the Node packages, and `import type` for types. Web code in `apps/web` uses
extensionless relative imports (`./lib/trpc`). Handle promises and missing
indexed values. Unit tests live beside source as `src/**/*.test.ts`
(`.test.tsx` in web code, never under `src/routes/`) and import Vitest APIs
explicitly.
Use the pinned pnpm versions/lockfile, Prettier, and Conventional Commits.

## Documentation

Read [AGENTS.md](AGENTS.md) and approved updates with the published requirements;
later approved decisions take precedence over conflicting baseline text.

- [Requirements v0.8](docs/requirements/requirements-v0.8.md)
- [Entity map v0.9](docs/entities/entity-map-v0.9.md)
- [Approved updates and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership v0.8](docs/requirements/requirements-coverage-v0.8.md)
- [Shared PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md)
- Database schema: [DBML](docs/database/schema.dbml), [design guide](docs/database/design.md), and [implementation/evidence](docs/database/step-3b-implementation-2026-10-25.md)
- [Technical direction and approval records](docs/technical/technical-direction.md)
- [Foundation restructure plan](docs/technical/foundation-restructure-plan-2026-10-31.md)
- [Local development reference](docs/technical/local-development.md)
- [Foundation implementation guide and remaining steps](docs/technical/technical-foundation-implementation-guide.md)
- [Frontend foundation decisions](docs/technical/frontend-foundation-proposal-2026-11-01.md) and the [PR 1 web shell plan](docs/technical/web-shell-plan-2026-11-01.md)
- [Design system and page designs](docs/design/README.md)

Keep links to the latest published document versions; preserve historical baselines.
