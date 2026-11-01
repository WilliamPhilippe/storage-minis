# Local development reference

Use the [README](../../README.md) for setup and everyday commands. This
reference explains configuration, limits, failure behavior and recovery for
the foundation restructured on 2026-10-31; the approved decisions are in
[technical direction](technical-direction.md#foundation-restructure-2026-10-31)
and the [restructure plan](foundation-restructure-plan-2026-10-31.md).
The previous container-only workflow is preserved in the
[historical reference](https://github.com/WilliamPhilippe/storage-minis/blob/3f1ae6c8c105a56663d002e06f97f7843c57880c/docs/technical/local-development.md).

## Toolchain

Node.js 24.22.1 and pnpm 12.15.0 run on the host. `.nvmrc` pins Node.js;
`package.json` pins both through `engines` and `packageManager`, and
`engineStrict` in `pnpm-workspace.yaml` makes installation refuse other
versions. fnm and nvm both read `.nvmrc`; fnm is the current local setup, not a
required tool. fnm installs with `brew install fnm` and switches versions
automatically with `eval "$(fnm env --use-on-cd --shell zsh)"` in `~/.zshrc`.
Both managers need shell initialization. Replacing the version manager or
changing shell initialization needs owner approval.

```text
package.json            Workspace root, scripts and toolchain pins
pnpm-workspace.yaml     apps/* and packages/* membership and install settings
turbo.json              Task graph, cache and environment filtering
compose.yaml            Production-shaped services (the only file on the VPS)
compose.override.yaml   Development: loopback ports, postgres_test, stack profile
compose.stack.yaml      Parity stack: API on 127.0.0.1:3100
.env.development        Committed local development values
.env.test               Committed local test values
docker/api.Dockerfile   API image (also runs the migrator)
docker/postgres/init/   Role init script run on first volume initialization
apps/api                @storage-minis/api: Fastify API
packages/db             @storage-minis/db: schema, migrations, client, migrator
```

Dependencies are saved with exact versions. The esbuild install scripts allowed
in `pnpm-workspace.yaml` are an owner-approved, version-specific list; review any
new build script rather than bypassing the check.

## Configuration

Local values live in two committed files, the single source for Compose and
Node (owner-approved 2026-10-31, R8/R9). `.gitignore` tracks exactly these two
`.env*` names, and `.dockerignore` keeps every `.env*` file out of images.

| Variable | Local source | Consumer |
| --- | --- | --- |
| `DATABASE_URL` | `.env.development`; `.env.test` for tests | API, as `storage_minis_app` |
| `MIGRATION_DATABASE_URL` | `.env.development`; `.env.test` for tests | `pnpm db:migrate` and test setup, as `storage_minis_owner` |
| `POSTGRES_DB`, `POSTGRES_PASSWORD` | Both files | PostgreSQL image: database name and superuser password |
| `DB_OWNER_PASSWORD`, `DB_APP_PASSWORD` | Both files | Role init script; `compose.yaml` builds in-network URLs from them |
| `HOST`, `PORT` | Defaults `127.0.0.1`, `3000` | API; `HOST` accepts `127.0.0.1` or `0.0.0.0`, `PORT` 1–65535 |
| `LOG_LEVEL` | Default `info` | API: `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |
| `NODE_ENV` | `development` in `.env.development`; default `production` when unset | API: `development`, `test` or `production`. Only exactly `development` adds error messages to logs (2026-11-01). |
| `TZ` | Unset locally; `UTC` in containers | Node processes |

**Loading and precedence.** Host Node processes load the files with Node's
built-in loaders: `node --env-file-if-exists=../../.env.development` in the API
`dev` and `start` scripts and in `db:migrate`, and `process.loadEnvFile` for
`.env.test` in the Vitest integration configurations. A variable already set
in the real environment always wins, so `DATABASE_URL=... pnpm dev` or a later
`doppler run -- ...` overrides the file. Turborepo runs in strict environment
mode and passes only the variables listed per task in `turbo.json`.

**Compose interpolation.** Compose fills every `${VAR:?}` in `compose.yaml`
before it merges the override, for all services, including the stack-only
`migrate` and `api` (verified on Compose 5.6.1). Every local Compose command
therefore passes `--env-file .env.development`; `postgres_test` takes its own
values from `.env.test` through `env_file:`. A missing value stops Compose with
`required variable X is missing a value: Set X` before any container changes.
An optional gitignored `.env` may hold nonsecret Compose settings such as
`COMPOSE_PROJECT_NAME`; secrets never go there.

**Database URLs.** The format is
`postgres://USER:PASSWORD@HOST:PORT/DATABASE`, optionally followed by
`?sslmode=disable` (the default) or `?sslmode=verify-full`. Every component is
required, so the driver never falls back to ambient `PGHOST`, `PGUSER`,
`PGPASSWORD`, `PGPORT` or `PGSSLMODE` values; the pool also pins `search_path`,
the client encoding and SSL negotiation against `PGOPTIONS`,
`PGCLIENT_ENCODING` and `PGSSLNEGOTIATION`. Leave `PGBINARY` and
`PGREPLICATION` unset: pg 8.23.1 honors them and they cannot be pinned.
Percent-encode special characters in a hand-written URL.

**Role passwords must be URL-safe** (letters, digits and `-._~`; for example
`openssl rand -hex 16`). `compose.yaml` embeds `DB_OWNER_PASSWORD` and
`DB_APP_PASSWORD` in its in-network URLs without encoding, and the init script
sets the same raw values, so a password containing `@`, `/`, `:` or `%` breaks
the URL or the login. Generate production values the same way (plan Section 6). Other parameters are rejected, and so
are `sslmode=require` and `verify-ca`, which pg 8.23.1 silently treats as
`verify-full`. Error messages name the variable and the expected shape, never
its value.

## Compose model

| File | Loaded by | Contents |
| --- | --- | --- |
| `compose.yaml` | Every command | `postgres`, `migrate` and `api`, production-shaped: no published ports, secrets as `${VAR:?}` with no defaults, in-network URLs |
| `compose.override.yaml` | Compose automatically, next to `compose.yaml` | Development: `postgres` on `127.0.0.1:5433`, `postgres_test` on `127.0.0.1:5434` with tmpfs storage, and a `stack` profile on `migrate`/`api` |
| `compose.stack.yaml` | `stack:*` scripts only | Parity stack: `api` on `127.0.0.1:3100` |

The development project is named after the checkout directory, and a bare
`docker compose --env-file .env.development up` starts only the two databases.
`postgres_test` extends `postgres`, so both share the digest-pinned image, UTC
setting, healthcheck and init script. The parity stack is the fixed project
`storage-minis-stack`: two checkouts share it, and the image tag
`storage-minis-api:local`.

## Database roles

`docker/postgres/init/10-roles.sh` runs once, when the official image
initializes an empty data directory (D2/D3). It creates:

- `storage_minis_owner`, which owns the database and therefore the `public`
  schema, can create schemas, and runs migrations. It is not a superuser and
  cannot create roles.
- `storage_minis_app`, which receives `SELECT, INSERT, UPDATE, DELETE` on
  tables, `USAGE, SELECT` on sequences and `EXECUTE` on functions through
  database-wide `ALTER DEFAULT PRIVILEGES` for objects the owner creates. It has
  no `TRUNCATE`, cannot run DDL and has no access to the `drizzle` history
  schema. Per-table restrictions are a T01 candidate (R6).

The script is a retained custom exception: SQL init files cannot read
environment variables. Inside the container the image trusts socket and
loopback connections, which `pnpm db:psql` relies on; connections from the
host arrive through the published port and require SCRAM passwords.

Roles and passwords exist only from first initialization. To change a role
password on an existing volume, run `ALTER ROLE` as `postgres` (see the
README); the owner role cannot change another role's password. In the parity
stack and on the VPS, change the password in the database **before** changing
its secret: the password variables also feed the `postgres` service, so a
changed value makes Compose recreate PostgreSQL and stop the API, and
`migrate` then fails against the old password.

## Database lifecycle

`pnpm db:up` waits up to 60 seconds for both healthchecks. Health means the
server accepts connections after initialization, including the roles. Stopping
the test database discards its tmpfs, which counts against the Docker VM's
memory (512 MiB limit). Development storage is the named volume
`<project>_pgdata`; `pnpm db:down`, `docker compose ... down` and restarts keep
it. Only `pnpm db:reset` (`down --volumes`) deletes it.

An occupied port fails `db:up` with Compose's port error; no other port is
chosen. Use `docker compose --env-file .env.development logs postgres` (or
`postgres_test`) to diagnose startup failures.

## Migrations

`pnpm db:generate` runs `drizzle-kit generate` offline in `packages/db` with the
single `drizzle.config.ts`; keep its relative `./drizzle` output, because Kit
0.31.11 prepends `./` when it reopens snapshots. The baseline is a custom
migration for the `inventory_id_base36` function followed by one generated
migration (D8). Kit can exit 0 after a generation error, so read its final line.

`pnpm db:migrate` builds the DB package and runs `node dist/migrate.js`, which
calls Drizzle's native migrator as the owner role. Kit's own `migrate` command
is not used, because its 0.31.11 progress renderer exits without printing the
migration error. The migrator:

- refuses before connecting when the migration files are missing or empty, or
  when `MIGRATION_DATABASE_URL` is missing or invalid;
- sets a 2 s connection timeout, a 5 s lock timeout and 30 s statement and
  idle-in-transaction timeouts on its connection;
- applies every pending migration in one transaction and records it in
  `drizzle.__drizzle_migrations`; a repeat run applies nothing;
- prints the actual error message, nested causes and PostgreSQL codes, with the
  password and URL credentials redacted, and exits 1 on failure.

There is no wrapping process supervisor. An interrupted run ends with Node's
default signal handling; PostgreSQL rolls back the open transaction once it
notices the closed connection, at the latest when the lock timeout expires.
Inspect `drizzle.__drizzle_migrations` (`pnpm db:psql`) before retrying. Startup
never migrates, and readiness does not prove migrations are current.

## Integration tests

`pnpm test:db` runs `vitest run --config vitest.integration.config.mts` in
`packages/db`. Its global setup refuses, before any connection, unless
`DATABASE_URL` and `MIGRATION_DATABASE_URL` name the same database ending in
`_test`. As the owner it then drops the `drizzle` and `public` schemas,
recreates `public`, restores the app role's schema usage, and applies the
committed chain with the real `dist/migrate.js`. The tests connect as the app
role, so constraint and fixture tests also exercise its grants;
migration-behavior tests use the owner, which alone can read the history.

Vitest 5.0.5 cannot print the stack frames of an error thrown by a global setup
(`code.charCodeAt is not a function` inside Vite 8.3.5's module runner). The
setup therefore rethrows its failures with the message and causes only.

`pnpm test:api` runs the API process suite with plain Vitest: real built API
processes against the test database, including startup failures, signals, the
17 s startup and 10 s shutdown watchdogs, and database outage and recovery
through owned loopback listeners. Its configuration refuses a non-`_test`
database before starting any worker. The suite owns its children with
`apps/api/tests/owned-process.ts`, retained because Vitest does not own
processes that a test spawns.

Run `test:db` and `test:api` one at a time; `test:db` drops the test schemas.

## API runtime behavior

| Area | Contract |
| --- | --- |
| Health | `GET /health/live` returns 200 `{"status":"ok"}`. `GET /health/ready` returns 200 `{"status":"ready"}` after a fresh database check, or 503 `{"status":"unavailable"}`. A database outage keeps liveness at 200; readiness recovers without a restart. |
| Database check | Verifies the database name, the role and `TimeZone = UTC` within 6 s. The pool holds at most 5 connections, with a 2 s connection timeout, 3 s statement timeout, 4 s query timeout and 10 s idle timeout. |
| Startup | Configuration, database acquisition, plugin loading (`app.ready()`), the database check and listen must finish within 17 s, or the process exits 1. Fastify's 10 s plugin timeout ends a hung plugin earlier as `app_readiness_failed`. |
| Lifecycle lines | One JSON line per event on stdout, always written regardless of `LOG_LEVEL`: `{"level":30,"time":…,"msg":"listening"}`, or level 50 with a category such as `configuration_failed`, `database_readiness_failed`, `listen_failed`, `startup_timeout` and an `err` for failures. |
| Shutdown | SIGINT/SIGTERM drain HTTP, then close the pool, within one 10 s bound. Success exits 130/143; a failed or timed-out cleanup exits 1. Compose gives the API 15 s. |
| HTTP limits | 16 KiB bodies, 10 s request receive time, no trusted proxy, generated request IDs. |
| Logs | JSON lines on stdout. Request lines carry method, matched route template, status, elapsed time and a generated request ID; never URLs, bodies, headers or other request inputs. Failures add an allowlisted `err`: constructor `type`, a string `code` (Node code or Postgres SQLSTATE such as `28P01`, `23505`), `stack` frames only (at most 20) and `cause` to depth 3. Messages appear only when `NODE_ENV=development`, except the API's own `ConfigurationError`, which names only variables. 4xx failures log at info, 5xx at error. Client responses stay fixed. |

## Parity stack

`pnpm stack:up` runs `docker compose --project-name storage-minis-stack --file
compose.yaml --file compose.stack.yaml --env-file .env.test`, first
`run --rm --build migrate`, then `up --detach --wait`. The second step reruns
the `migrate` service, which finds nothing pending, and starts `api` after it
completes. The one-off comes first because a single `up` recreates, and so
stops, a running `api` before `migrate` finishes (verified 2026-11-01, R19).
`up --wait migrate` cannot replace it: it exits 1 even when `migrate`
succeeds.

To inspect a running stack, use the same project flags, for example
`docker compose --project-name storage-minis-stack --file compose.yaml --file
compose.stack.yaml --env-file .env.test logs api`. `pnpm stack:down` removes the
stack's containers, network and database volume. `pnpm test:stack` runs
`apps/api/tests/stack.smoke.test.ts`: a clean `stack:up`, exact health bodies on
port 3100, a nonroot API without mounts, `migrate` finishing before `api` starts,
an unpublished database, a redeploy that changes the API but whose `migrate`
fails (a second session holds the history lock) leaving the same API container
serving, SIGTERM exit 143 within 10 s, and no start of a stopped API when
`migrate` fails. It always ends with `stack:down`.

## Turborepo tasks and cache

| Task | Depends on | Cache | Passes through |
| --- | --- | --- | --- |
| `build` | `^build` | `dist/**` | Nothing |
| `typecheck`, `//#lint`, `//#test` | DB `build` | Yes | `NODE_ENV`, `TZ` hashed for `//#test` |
| `//#typecheck:root`, `//#format:check` | None | Yes | Nothing |
| DB `db:generate` | None | No | Nothing |
| DB `db:migrate` | `build` | No | `MIGRATION_DATABASE_URL`, `TZ` |
| DB `test:integration` (`pnpm test:db`) | `build` | No | `DATABASE_URL`, `MIGRATION_DATABASE_URL` |
| API `test:process` (`pnpm test:api`) | `build` | No | `DATABASE_URL`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ` |
| API `start`, API `dev` | `build` / `^build` | No, persistent | `DATABASE_URL`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ` |
| DB `dev` | `build` | No, persistent | Nothing |

`pnpm check --dry=json` shows the graph; `pnpm check --force --summarize`
followed by `pnpm check --summarize` shows a full run and its cache reuse.
Summaries go to `.turbo/runs/` and the local cache to `.turbo/cache`; remote
caching is disabled. Root documentation edits can invalidate root checks.
The `stack:*` and `test:stack` scripts and the `db:up`/`db:down`/`db:psql`/
`db:reset` scripts call Docker directly, outside Turborepo.

## Production direction

The VPS runs `compose.yaml` alone, with values from Doppler config `prd`
through a read-only service token (`doppler run -- ...`), in the same two steps
as the parity stack. Use Doppler CLI 3.77.1 or later, the version verified with
this project; the CLI authenticates there with `DOPPLER_TOKEN`, and no exact
version check or dedicated login directory is required. Never write secrets to
a `.env` file on the VPS. `compose.yaml` still sets no restart policy for
PostgreSQL and `restart: "no"` for `migrate` and `api`; choosing production
restart policies is part of T04. The `prd` keys, Caddy `web` image, image distribution,
backups and the deploy procedure remain T04 work; see the
[plan's T04 list](foundation-restructure-plan-2026-10-31.md#later-under-t04-not-part-of-this-restructure).

## Removing the previous tooling setup

Checkouts that used the container-only workflow have resources the new model
never uses. `PROJECT` below is the old `COMPOSE_PROJECT_NAME` from that
checkout's `.env.compose` (for example `storage-minis-beijing`). These commands
delete only that old project's resources.

```sh
docker rm PROJECT-postgres-1 PROJECT-postgres_test-1
docker volume rm PROJECT_dependencies PROJECT_api-dependencies \
  PROJECT_db-dependencies PROJECT_pnpm-store PROJECT_turbo
docker image rm PROJECT-tooling:step1 PROJECT-api:step4 PROJECT-api:step4-dev
docker network rm PROJECT_default
rm .env.compose
```

The old `PROJECT_pgdata` volume holds the old development database, which was
initialized without the new roles. Remove it with
`docker volume rm PROJECT_pgdata` once its data is no longer needed. The
dedicated Doppler login directory `~/.config/storage-minis/doppler` is no longer
read by any command; its owner may delete it.
