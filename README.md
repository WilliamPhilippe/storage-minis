# StorageMinis

StorageMinis manages inventory, purchases, sales, finances, collections and a
public stock catalog for 1/64 miniature sellers and collectors.

**Status:** The application shell and Google sign-in are available. Business
procedures, business screens, CI and production are not available yet.

Do the [local setup](#local-setup) one time. Then use the
[daily development](#daily-development) commands. Before you change code, read
[feature work](#feature-work) and [checks](#checks).

## Repository layout

The repository is a pnpm workspace with Turborepo tasks. Node.js runs on the
host, and PostgreSQL runs in Docker.

| Path | Package | Contents |
| --- | --- | --- |
| `apps/api` | `@storage-minis/api` | Fastify API: health routes, tRPC at `/trpc` and Firebase sign-in |
| `apps/web` | `@storage-minis/web` | React web app: Vite, Ant Design, TanStack Router, en-US and pt-BR |
| `packages/db` | `@storage-minis/db` | Drizzle schema, migrations, database client and test-database helper |
| `docker/` | — | API image and PostgreSQL role script |
| `docs/` | — | Requirements, entity map, database design, technical records and page designs |

The [toolchain reference](docs/technical/local-development.md#toolchain) lists
the root files, for example `turbo.json` and the Compose files.

## Local setup

Run all commands from the repository root. Install these tools first:

- Git.
- Docker Desktop, or Docker Engine with Compose v2 or later.
- Node.js **24.22.1** and pnpm **12.15.0**. [`.nvmrc`](.nvmrc) and
  [`package.json`](package.json) pin these versions. Installation stops with
  other versions.
- A Node.js version manager that reads `.nvmrc`: fnm (the current setup) or
  nvm. The [toolchain reference](docs/technical/local-development.md#toolchain)
  shows the shell setup.

Start Docker. Then run these commands:

```sh
fnm install && fnm use        # or: nvm install && nvm use
npm install --global pnpm@12.15.0
pnpm install --frozen-lockfile
pnpm db:up                    # start the development and test databases
pnpm db:migrate               # apply the migrations to the development database
```

The local values are in the committed files
[`.env.development`](.env.development) and [`.env.test`](.env.test). They are
not secrets, and a Doppler login is not necessary. Production values are only in
Doppler. The [configuration reference](docs/technical/local-development.md#configuration)
describes each variable.

### End-to-end test setup

`pnpm test:e2e` uses a headless browser and a Google login. Do these steps one
time:

1. Install Playwright's Chrome Headless Shell. It writes about 206 MiB outside
   the repository.

   ```sh
   pnpm --filter @storage-minis/web exec playwright install --only-shell chromium
   ```

   Run this command again after each Playwright upgrade.

2. Install the [gcloud CLI](https://docs.cloud.google.com/sdk/docs/install).
3. Sign in with your Google account for Application Default Credentials. The
   second command shows `ok` if the login is valid.

   ```sh
   gcloud auth application-default login
   gcloud auth application-default print-access-token >/dev/null && echo ok
   ```

   gcloud keeps the login in `~/.config/gcloud/`. Do not copy it into the
   repository.

4. Ask the owner to give your account the **Service Account Token Creator** role
   on `e2e-custom-tokens@storage-minis-dev.iam.gserviceaccount.com`.

The tests use this login to sign Firebase custom tokens through IAM. The login
can act as your Google account. To end it, run
`gcloud auth application-default revoke`.

## Local PostgreSQL

| Database | Address | Name | Data |
| --- | --- | --- | --- |
| Development (`postgres`) | `127.0.0.1:5433` | `storage_minis_dev` | Named volume. The data stays after `pnpm db:down`. |
| Test (`postgres_test`) | `127.0.0.1:5434` | `storage_minis_test` | Memory (tmpfs). The database loses its data when it stops. |

Both databases run PostgreSQL 18.6 in UTC. The owner role,
`storage_minis_owner`, applies migrations. The application role,
`storage_minis_app`, can read and write rows but cannot change the schema.

| Command | Result |
| --- | --- |
| `pnpm db:up` | Starts both databases and waits until they are healthy (60 s limit) |
| `pnpm db:down` | Stops both databases |
| `pnpm db:psql` | Opens `psql` on the development database as the owner role. Add `-c 'SQL'` for one statement. |
| `pnpm db:reset` | Deletes the containers, the network and the development volume |

> [!CAUTION]
> Do not run `pnpm db:reset` if you must keep the development data. The command
> deletes the development volume.

After a reset, run these commands:

```sh
pnpm db:up
pnpm db:migrate
pnpm dev      # then sign in with Google at http://localhost:5173/login
```

The first sign-in of the owner's account creates the administrator and the
`wipminis` Organization again. Other Google accounts get "No access".

Add `--env-file .env.development` to each raw `docker compose` command, for
example `docker compose --env-file .env.development logs postgres`.

The ports are fixed. Before you start the databases of a different checkout, run
`pnpm db:down` in the first checkout.

## Daily development

```sh
pnpm db:up   # if the databases are stopped
pnpm dev     # API on http://127.0.0.1:3000, web app on http://localhost:5173
```

`pnpm dev` watches the DB package, the API and the web app. Press Ctrl+C to stop
all of them.

Open `http://localhost:5173/app`. Sign in with Google. Use `localhost`, not the
`127.0.0.1` address that Vite shows. The Firebase development project accepts
sign-in only from `localhost`.

To examine the API, open `http://127.0.0.1:3000/health/ready`. A ready API
answers HTTP 200 with `{"status":"ready"}`. The API never applies migrations, so
readiness does not show that the migrations are current.

Some changes have more steps:

| Change | Steps |
| --- | --- |
| You pull commits or change the branch | Stop `pnpm dev`. Run `pnpm install --frozen-lockfile`. Run `pnpm db:migrate`. Start `pnpm dev` again. |
| You change the database schema | Follow [database migrations](#database-migrations). A TypeScript edit alone does not change PostgreSQL. |
| You add, rename or remove a route file | Commit the regenerated `apps/web/src/routeTree.gen.ts` with the route. `pnpm dev` and `pnpm build` regenerate it. |
| You add, rename or remove a DB package file | Stop `pnpm dev`. Run `pnpm build`. Watch mode does not delete old output. |
| You build or run checks | Stop `pnpm dev` first. Both write `packages/db/dist`. |

A compiler error can keep the previous build in service. Read the terminal
output after each change.

## Feature work

Before you write code:

1. Read the feature's live
   [GitHub issue](https://github.com/WilliamPhilippe/storage-minis/issues) and
   the current requirements.
2. Get owner approval for each new technical choice and each unresolved
   business rule. Technical choices include tools, dependencies, versions and
   configuration. See [owner approval](AGENTS.md#owner-approval-before-decisions).

A typical feature has these parts, in this order: approved contract → schema and
migration, if necessary → typed database operation → validated and authorized
API procedure → tests.

Put each change in its location:

| Change | Location |
| --- | --- |
| Tables, columns, enums, constraints, indexes | The domain file in `packages/db/src/schema/`. Export new items from `schema/index.ts`. |
| Migration | Generated SQL and metadata in `packages/db/drizzle/` |
| HTTP route or lifecycle code | `apps/api/src/`. Register a route as a plugin in `app.ts`, as `health.ts` does. Keep startup, shutdown and the database pool in `lifecycle.ts` and `server.ts`. |
| API procedure | A router module in `apps/api/src/trpc/routers/`, attached in `trpc/router.ts`. See [tRPC procedures](#trpc-procedures). |
| Web page | The route definition only in `apps/web/src/routes/`. The page component, its CSS Module and its tests in `apps/web/src/features/<area>/`. Follow the page design in [`docs/design/`](docs/design/README.md). |
| Web strings | Both catalogs: `apps/web/src/i18n/en-US/<namespace>.ts` and the pt-BR file |
| Money and dates in the web app | `formatMoney` and the date helpers in `apps/web/src/lib/format/` |
| Signed-in User, Memberships and active Organization in the web app | `useSession()` from `apps/web/src/lib/session/`, under `/app`. The tRPC link sends the ID token and `x-organization-id`. |
| Tests | Unit tests next to the source. Real PostgreSQL tests for persistence. Web component tests that find elements by role and label. |

### Database migrations

A **migration** changes the database schema. A tRPC **mutation** is an API
write. A mutation alone does not change the schema.

For an approved schema change, stop `pnpm dev`. Then do these steps:

1. Edit the schema file. Export new definitions from
   `packages/db/src/schema/index.ts`. Update the
   [DBML](docs/database/schema.dbml) and the
   [design guide](docs/database/design.md) to agree with the change.
2. Generate a named migration. This step does not use a database.

   ```sh
   pnpm db:generate -- --name describe_change
   ```

   Drizzle Kit can exit with code 0 after an error. Make sure that its last line
   is `Your SQL migration file ➜ …` or `No schema changes, nothing to migrate`.

3. Review the SQL file, the snapshot and the journal together. Examine the
   constraints, the effect on current rows, data preservation and backfills.
4. Run `pnpm test:db`. It resets the test database and applies all migrations
   again. Add real PostgreSQL tests for the new behavior.
5. Run `pnpm db:migrate` to apply the migration to the development database.
   Then start `pnpm dev` again.
6. Commit the schema change, the migration files and the tests together. The
   migration files are `drizzle/NNNN_describe_change.sql`,
   `drizzle/meta/NNNN_snapshot.json` and `drizzle/meta/_journal.json`.

Correct an applied migration only with a new forward migration. Do not use
`drizzle-kit push`. For SQL that Drizzle Kit does not manage, for example a
function, write a custom migration. The
[migration reference](docs/technical/local-development.md#migrations) shows the
command and the recovery after an interrupted run.

### tRPC procedures

The API serves tRPC at `/trpc` with plain JSON: no transformer and no batching.
Queries use GET, and mutations use POST. Failures use one error envelope with a
fixed message. The
[tRPC HTTP contract](docs/technical/local-development.md#trpc-http-contract)
lists each case and the exceptions.

To add a procedure, do these steps:

1. Define the input and the safe output with Zod. Do not use database row types
   as input or output contracts.
   - Give each string and array a `.max()` limit. The 1 MiB body limit is only
     an outer limit. Query input goes in the URL, which has a 16 KiB header
     limit.
   - Use `z.strictObject` to reject unknown keys.
2. Start from a guarded builder in `apps/api/src/trpc/procedures.ts`:
   - `organizationProcedure(minRole)` for the records of an Organization.
     `viewer` can read. `editor` and `owner` can write. `owner` manages
     settings.
   - `userProcedure` with `requireCanEditProducts(ctx.user)` to edit a Product.
   - `platformProcedure` for `global_admin` actions.
3. Get the Organization only from `ctx.organization`. The API reads it from the
   `x-organization-id` header. Filter each query by `ctx.organization.id`.
   Record `ctx.user.id` as the actor. Do not put an Organization ID in the
   input.
4. Use `ctx.db` for queries. Do each business write in one transaction. The
   transaction includes the source, inventory, funding, financial and audit
   changes, with the necessary locks, scope checks and invariant checks.
5. For an expected failure, throw a `TRPCError` with the applicable code. The
   client gets only the code and its fixed message.
6. Write the tests with `buildApp` and `app.inject()`, as `trpc/plugin.test.ts`
   does. Include invalid input and output. For a business procedure, include
   denied access: a different Organization, a lower role and no token. See
   `trpc/procedures.test.ts` for examples. For a write, add real PostgreSQL
   tests for rollback, reconciliation and concurrency.

The web app's tRPC client is in `apps/web/src/lib/trpc.ts`. Import only types
from `@storage-minis/api/types`, because a runtime import from it fails. Read
errors through `error.data.code` and `error.data.issues`. A separate package is
necessary to share runtime Zod schemas with the browser.

## Checks

Stop `pnpm dev` before you run these commands:

```sh
pnpm check   # typecheck, lint, format check, unit tests (no database)
pnpm build   # compile the packages and build apps/web/dist
```

For one part only, run `pnpm typecheck`, `pnpm lint`, `pnpm format` or
`pnpm test`. For one Vitest project, run
`pnpm exec vitest run --project api-unit` (or `db-unit`, `web-unit`).

`web-unit` runs in jsdom, in the `America/Sao_Paulo` time zone. A test fails on
an unstubbed `fetch`, or on a `console.error` or `console.warn` that it does not
declare with `expectConsole`.

Prettier does not format Markdown. Examine changed links, code fences and tables
manually.

The live suites use real services and no cache. Start the databases first with
`pnpm db:up`.

```sh
pnpm test:db     # schema, migration and connection tests on the test database
pnpm test:api    # built API processes and the auth suite on the test database
pnpm test:e2e    # Playwright tests (see End-to-end tests)
pnpm test:stack  # parity stack smoke test with Docker
```

- Run `test:db`, `test:api` and `test:e2e` one at a time. They share the test
  database, and `test:db` and `test:api` drop and recreate its schemas.
- All three refuse a database whose name does not end in `_test`.
- Run `test:stack` after changes to the API image, the Compose files or the
  migrations.
- Add the requirement acceptance tests for each feature. The current health,
  schema and smoke tests do not prove business acceptance.

### End-to-end tests

`pnpm test:e2e` builds the API. Then Playwright starts the built API on
`127.0.0.1:3000` with the test database, and the Vite dev server on
`http://localhost:5173`. It runs the specs in `apps/web/e2e` and stops both
servers.

Before a run, make sure that:

- The databases run (`pnpm db:up`).
- The [end-to-end test setup](#end-to-end-test-setup) is complete.
- The network is available. The tests use Google's token service and the
  Firebase development project.
- `pnpm dev` is stopped, and ports 3000 and 5173 are free. Playwright does not
  reuse a server. It stops with "is already used".

A `setup` project runs first. It seeds the test database and saves a signed-in
session for the specs in `e2e/app/`.

Each test runs in two projects: `desktop-chrome` (1280 × 720) and `pixel-7`. A
test with the tag `@phone` or `@desktop` runs in one project only.

Arguments after `--` go to `playwright test`. The `--no-deps` option does not
run the setup project. Use it for signed-out specs.

```sh
pnpm test:e2e -- --project=pixel-7 e2e/app/echo.spec.ts
```

A failed run keeps traces and screenshots in `apps/web/test-results/`. To open
its HTML report, run
`pnpm --filter @storage-minis/web exec playwright show-report`.

Declare expected console output with `expectConsole` and other origins with
`allowOrigin`. Undeclared output, page errors and origins make the test fail.

If a killed run leaves servers on ports 3000 or 5173, see the
[end-to-end reference](docs/technical/local-development.md#end-to-end-tests).

### Parity stack

The parity stack runs the production API image and `compose.yaml` on your
computer. It is a separate Compose project, `storage-minis-stack`, with its own
temporary database.

```sh
pnpm stack:up                            # build the API image, run migrate, start the API
curl http://127.0.0.1:3100/health/ready  # expect HTTP 200 {"status":"ready"}
pnpm stack:down                          # remove the stack and its database volume
```

`stack:up` uses the order of the VPS deploy: `migrate` first, then the API. The
stack API uses port 3100, and its database has no published port. You can run
the stack and `pnpm dev` at the same time.

### Turborepo cache

Finite tasks keep a local cache in `.turbo/cache`. The remote cache is off.
Database, migration, live-test and watch tasks do not use the cache. The
[cache reference](docs/technical/local-development.md#turborepo-tasks-and-cache)
lists each task.

## Code conventions

TypeScript and ESLint enforce strict types, ESM, `import type`, `.js` extensions
in Node package imports, handled promises and checked indexed values. Also obey
these rules:

- Write code, comments and documentation in English.
- In `apps/web`, write relative imports without an extension (`./lib/trpc`).
- Put unit tests next to the source as `*.test.ts` or `*.test.tsx`, never in
  `apps/web/src/routes/`.
- Import `@storage-minis/db`, never `packages/db/src`.
- Use pnpm, Prettier and Conventional Commits.

## Documentation

Read [AGENTS.md](AGENTS.md) and the published requirements. A later approved
decision wins over different text in a baseline.

- [Requirements v0.8](docs/requirements/requirements-v0.8.md)
- [Entity map v0.9](docs/entities/entity-map-v0.9.md)
- [Requirement ownership v0.8](docs/requirements/requirements-coverage-v0.8.md)
- Database schema: [DBML](docs/database/schema.dbml) and
  [design guide](docs/database/design.md)
- [Technical direction and approval records](docs/technical/technical-direction.md)
- [Local development reference](docs/technical/local-development.md)
- [Frontend foundation decisions](docs/technical/frontend-foundation-proposal-2026-11-01.md)
- [T02 authentication record](docs/technical/t02-authentication-record-2026-11-03.md)
- [Design system and page designs](docs/design/README.md)

Link only to the latest published version of each document. Git history keeps
the earlier versions and the finished plans. Cite them with commit-pinned links.
