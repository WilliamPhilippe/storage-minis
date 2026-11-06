# Local development reference

Use the [README](../../README.md) for setup and everyday commands. This
reference explains configuration, limits, failure behavior and recovery for
the foundation restructured on 2026-10-31; the approved decisions are in
[technical direction](technical-direction.md#foundation-restructure-2026-10-31).
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
apps/web/.env.development, .env.production   Committed Firebase web configs (Vite mode files)
docker/api.Dockerfile   API image (also runs the migrator)
docker/postgres/init/   Role init script run on first volume initialization
apps/api                @storage-minis/api: Fastify API
apps/web                @storage-minis/web: React web app (Vite, antd, TanStack Router)
apps/web/e2e            Playwright: the auth.setup.ts setup project, signed-out/, app/ and support/
packages/db             @storage-minis/db: schema, migrations, client, migrator, test-database helper
tsconfig.browser.json   Browser TypeScript profile for apps/web (beside tsconfig.node.json)
```

Dependencies are saved with exact versions. The esbuild install scripts allowed
in `pnpm-workspace.yaml` are an owner-approved, version-specific list; review any
new build script rather than bypassing the check.

## Configuration

Local values live in two committed files, the single source for Compose and
Node (owner-approved 2026-10-31, R8/R9). `.gitignore` tracks exactly these two
`.env*` names plus the web app's [mode files](#web-configuration), and
`.dockerignore` keeps every `.env*` file out of images.

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
| `FIREBASE_PROJECT_ID` | `storage-minis-dev` in both files; `storage-minis` in production (T04) | API, required: the Firebase project whose ID tokens it accepts, in Google Cloud's project ID format. `compose.yaml` maps it with `${FIREBASE_PROJECT_ID:?}`. |
| `AUTH_TEST_SIGN_IN` | `enabled` in `.env.test` only | API: `enabled` also accepts `custom` test sign-ins of `e2e-` uids (T02 AU-11). Any other value is invalid, and the API refuses to start with it when `NODE_ENV` is `production` or unset. Only the API that Playwright starts receives it, read from `.env.test` and never from the environment; `compose.yaml` never maps it and no Turborepo task passes it through. |
| `E2E_SIGNER_SERVICE_ACCOUNT` | `.env.test`: `e2e-custom-tokens@storage-minis-dev.iam.gserviceaccount.com` | Playwright's setup: the no-role service account that signs test custom tokens through IAM ([end-to-end tests](#end-to-end-tests)). An identifier, not a secret (owner, 2026-11-04). |
| `BOOTSTRAP_OWNER_EMAIL`, `BOOTSTRAP_ORGANIZATION_NAME`, `BOOTSTRAP_ORGANIZATION_NICKNAME`, `BOOTSTRAP_ORGANIZATION_CURRENCY` | `.env.development`: the owner's email, `wipminis`, `wipminis` (currency unset, so BRL); none in `.env.test` | API: the [first-sign-in bootstrap](#bootstrap). The first three together or none; the email is trimmed and lowercased, the name 1–100 characters, the nickname under SI-04's provisional rule, the currency `BRL` (default) or `USD`. An empty value is invalid. `compose.yaml` maps none until T04. |

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
This is why both files set `FIREBASE_PROJECT_ID`, which only the stack-only
`api` uses. `postgres_test` receives every `.env.test` value through
`env_file:`, including the test sign-in's, and ignores them.
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
the URL or the login. Generate production values the same way (the restructure plan's [variable inventory](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/foundation-restructure-plan-2026-10-31.md#6-variable-inventory-d4)). Other parameters are rejected, and so
are `sslmode=require` and `verify-ca`, which pg 8.23.1 silently treats as
`verify-full`. Error messages name the variable and the expected shape, never
its value.

### Web configuration

The web app's values are the Firebase web configs (sign-in plan SI-03,
W10): public identifiers that every visitor's browser receives, committed in
Vite's mode files and never in Doppler.

| File | Mode | Project |
| --- | --- | --- |
| `apps/web/.env.development` | `vite` (`pnpm dev`, and the server `pnpm test:e2e` starts) | `storage-minis-dev` |
| `apps/web/.env.production` | `vite build`, `vite preview` | `storage-minis`; PR 4 sets its `VITE_FIREBASE_AUTH_DOMAIN` to the app's domain (SI-18) |

Each holds `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_APP_ID`, and no `measurementId`:
the app never loads Analytics. `vite.config.mts` checks them with Zod whenever
Vite serves, builds or previews, and stops with `Invalid web configuration.
Check <names> in apps/web/.env.<mode>.`, naming variables, never values; an
unknown `VITE_FIREBASE_*` name is refused too. `src/vite-env.d.ts` types them
with `strictImportMetaEnv`. The `web-unit` Vitest project doesn't read them:
component tests run the session layer over a fake Firebase.

Vite would let a shell `VITE_*` variable or a gitignored
`apps/web/.env.local` override a file value, and Turborepo would hash neither,
so don't use them. Both files are committed, so the web tasks' default inputs
hash them; `turbo.json` lists nothing for them. `.dockerignore` keeps them out
of the API image; PR 4's web image must let `.env.production` in.

The browser API keys are restricted to their sites and to the Identity
Toolkit and Token Service APIs (SI-14, applied 2026-11-06; see the
[technical direction](technical-direction.md#pr-3b-implemented-outcome-2026-11-06)).
The dev key accepts `http://localhost:5173/*` and
`https://storage-minis-dev.firebaseapp.com/*`, the production key
`https://storage-minis.firebaseapp.com/*`. Google refuses any other site with
403 `API_KEY_HTTP_REFERRER_BLOCKED`, including `http://127.0.0.1:5173`, the
address Vite prints. The Cloud console shows no API restrictions section for
these Firebase-created keys; change them with `gcloud services api-keys update
KEY_ID --project=<project> --allowed-referrers=<every site>
--api-target=service=identitytoolkit.googleapis.com
--api-target=service=securetoken.googleapis.com`, where each flag restates its
whole list, and check with `gcloud services api-keys describe KEY_ID`. PR 4 or
T04 adds the app's domain to the production key this way.

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
password on an existing development volume, either run `pnpm db:reset` or run
`ALTER ROLE` in place as `postgres`; the owner role cannot change another
role's password:

```sh
docker compose --env-file .env.development exec postgres \
  psql -U postgres -d storage_minis_dev \
  -c "ALTER ROLE storage_minis_app PASSWORD 'new-value'"
```

The test database is recreated on every start, so it always uses the current
`.env.test` values. In the parity stack and on the VPS, change the password in
the database **before** changing its secret: the password variables also feed
the `postgres` service, so a changed value makes Compose recreate PostgreSQL
and stop the API, and `migrate` then fails against the old password.

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
For SQL that Kit does not manage, such as a function, create an empty custom
migration with
`pnpm --filter @storage-minis/db exec drizzle-kit generate --custom --name describe_change`
and write the SQL into it.

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
`packages/db`. Its global setup calls `prepareTestDatabase` from
`@storage-minis/db/testing` (sign-in plan SI-16), which refuses, before any
connection, unless `DATABASE_URL` and `MIGRATION_DATABASE_URL` name the same
database ending in `_test`. As the owner it then drops the `drizzle` and
`public` schemas, recreates `public`, restores the app role's schema usage, and
applies the committed chain with the real `dist/migrate.js`. The tests connect
as the app role, so constraint and fixture tests also exercise its grants;
migration-behavior tests use the owner, which alone can read the history.

The helper's source is `packages/db/testing/`. The DB package's `build`
compiles it to `dist-testing/`, outside the package's `files`, so
`pnpm deploy --prod` leaves this schema-dropping code out of the API image;
`pnpm test:stack` lists the shipped package. It takes both URLs as arguments,
so a caller that parses `.env.test` instead of loading it (PR 3b's Playwright
setup) can pass them.

Vitest 5.0.5 cannot print the stack frames of an error thrown by a global setup
(`code.charCodeAt is not a function` inside Vite 8.3.5's module runner). The
setup therefore rethrows its failures with the message and causes only.

`pnpm test:api` runs the API's integration project with plain Vitest. Its
configuration refuses a non-`_test` database before starting any worker; its
global setup then prepares the test database with the same helper. Two files:

- `process.integration.test.ts`: real built API processes against the test
  database, including startup failures (configuration refusals included),
  signals, the 17 s startup and 10 s shutdown watchdogs, and database outage and
  recovery through owned loopback listeners. The suite owns its children with
  `apps/api/tests/owned-process.ts`, retained because Vitest does not own
  processes that a test spawns.
- `auth.integration.test.ts`: the real `buildApp`, jose verifier and identity
  store on the migrated database, with tokens signed by a local key set
  (`tests/tokens.ts`), so it never fetches Google's keys. It runs the T02
  record's database-backed AU-12 cases through `session.get` and probe routers
  that exist only in the test, runs the [operator SQL](#operator-sql) below,
  and checks that no token, email or header value reaches a log line. Each
  test empties the identity tables as the owner.

Run `test:db`, `test:api` and `test:e2e` one at a time; `test:db` and
`test:api` drop and recreate the test schemas.

## End-to-end tests

`pnpm test:e2e` runs `playwright test` in `apps/web` through the uncached
Turborepo task, after `^build` (the Playwright plan,
[approved 2026-11-02](technical-direction.md#frontend-pr-2-playwright-plan-approval-2026-11-02)).

| Area | Contract |
| --- | --- |
| Browser | Chrome Headless Shell 156 only, installed once with `playwright install --only-shell chromium` into Playwright's default cache, or into the folder `PLAYWRIGHT_BROWSERS_PATH` names (passed through by Turborepo). Headed runs, `--debug`, and `--ui` or `show-trace` without `--port 0` need the full Chrome for Testing, which is not installed. |
| Projects | `setup` (`e2e/auth.setup.ts`), then `desktop-chrome` and `pixel-7`, which depend on it, with Playwright's full device descriptors; `locale: "en-US"` and `timezoneId: "America/Sao_Paulo"` in the shared `use`. Tests tagged `@phone` or `@desktop` run in one project through each project's `grepInvert`. `--no-deps` skips the setup, for signed-out specs that need no session. |
| Servers | `apps/web/playwright.config.mts` starts the built API (`node --enable-source-maps dist/server.js` in `apps/api`) on `127.0.0.1:3000` with `NODE_ENV=test`, `TZ=UTC`, `LOG_LEVEL=warn`, `FIREBASE_PROJECT_ID`, `AUTH_TEST_SIGN_IN` (from `.env.test` only) and only the test database's `DATABASE_URL`, then the Vite dev server (`pnpm run dev`, the development mode file) on `http://localhost:5173`. `reuseExistingServer` is false for both. Playwright stops them in reverse order with `SIGTERM`, then `SIGKILL` after 15 s for the API (Compose's grace period) and 5 s for Vite. |
| Database | `DATABASE_URL` (and the API's `FIREBASE_PROJECT_ID`) from the real environment, else from `.env.test`, parsed with `util.parseEnv` rather than loaded, so the servers never receive the owner role's URL or the PostgreSQL passwords. `requireTestDatabase` from `@storage-minis/db` refuses any database not named `*_test` before a server starts. The setup project resets and migrates the test database with `prepareTestDatabase` from `@storage-minis/db/testing`, reading `MIGRATION_DATABASE_URL` itself, then seeds it as the app role: the Organization "E2E Garage" (`e2e-garage`, BRL), the User `e2e-owner` ("E2E Owner", role `user`) and its owner Membership. `e2e-outsider` has no row. |
| Test sign-in | The setup mints a Firebase custom token for `e2e-owner` with `firebase-admin`'s `createCustomToken`, signed through IAM as `E2E_SIGNER_SERVICE_ACCOUNT` with the developer's gcloud Application Default Credentials (sign-in plan SI-15; no key file). It opens `/login`, calls the development-only hook `window.__storageMinisTest.signIn(token)` (`src/lib/session/testSignIn.ts`, imported only inside `if (import.meta.env.DEV)`), waits for `/app` and saves `playwright/.auth/owner.json` with `indexedDB: true`. Firebase keeps its session in IndexedDB. The API accepts the resulting ID token only under `AUTH_TEST_SIGN_IN`, so `pnpm dev`'s API refuses it. Specs mint their own tokens through `support/session.ts`, such as `e2e-outsider`'s for state 4. |
| Credential | Google's lookup order: `GOOGLE_APPLICATION_CREDENTIALS`, then `$CLOUDSDK_CONFIG/application_default_credentials.json`, then gcloud's default `~/.config/gcloud/`. Turborepo's strict mode passes `HOME`, and `test:e2e` lists the other two. The login can act as the developer's Google account, production included (accepted by the owner, 2026-11-04); `gcloud auth application-default revoke` ends it. Agents run the suite, which reads it, but never open, list or copy it. |
| Specs | `e2e/signed-out/` imports `test` from `support/test.ts` and starts with empty storage; `e2e/app/` imports it from `support/app.ts`, which starts every test with the saved session. `support/names.ts` builds every name from the en-US and pt-BR catalogs and `src/i18n/languages.ts`. |
| Fixtures | `tapOrClick` taps where the project has touch and clicks elsewhere; a lint rule rejects direct `.click()` and `.tap()` in specs. The automatic console fixture fails a test on any `console.error`, `console.warn` or uncaught page error that it did not declare with `expectConsole(kind, pattern)`. The automatic outside-origin fixture fails a test whose pages, popups included, request any origin other than `http://localhost:5173`, `https://identitytoolkit.googleapis.com` and `https://securetoken.googleapis.com`, unless it declared it with `allowOrigin(origin)`: Firebase Analytics or Installations traffic would fail the run. The popup spec declares `https://storage-minis-dev.firebaseapp.com` and `https://apis.google.com`. `expectNoSidewaysScroll(page)` compares `documentElement.scrollWidth` with `clientWidth`. |
| Run settings | `fullyParallel`, no retries, Playwright's default workers (half the logical cores), traces and screenshots kept on failure, the list reporter and the HTML report with `open: "never"`. |
| Output | `apps/web/test-results/` (cleared at the start of every run) and `apps/web/playwright-report/`, both ignored by git, Prettier and ESLint; `apps/web/playwright/.auth/owner.json`, the saved session, is ignored through `**/playwright/.auth/`. Git-ignored output stays out of Turborepo's hashes. |
| Network and Firebase | The suite needs the network, Google's token service and the dev project: a Google outage fails the run, while Vitest stays offline. The first run in a dev project creates the Firebase users `e2e-owner` and `e2e-outsider`, well under Firebase's limit of 100 new accounts per hour per IP. |
| Lint and types | `eslint-plugin-playwright`'s recommended rules for `apps/web/e2e/**`; `tsconfig.e2e.json` (Node types, the DOM library, bundler resolution) in the web `typecheck` script. |

**Failure modes:**

| Situation | Result |
| --- | --- |
| Databases stopped | About 1 s after the start, `[api] {"level":50,…,"msg":"database_readiness_failed",…}` with `ECONNREFUSED`, then `Process from config.webServer was not able to start. Exit code: 1` |
| `pnpm dev` running, its API answering on port 3000 | Before any server starts: `http://127.0.0.1:3000/health/ready is already used, make sure that nothing is running on the port/url or set reuseExistingServer:true in config.webServer.` |
| A server on port 5173 only, such as a leftover Vite | `[api]` reports `listening`, then the same message for `http://localhost:5173`; the API stops |
| `DATABASE_URL` naming `storage_minis_dev` | `Database integration tests require a database whose name ends in _test.` before any server starts |
| The browser missing from the folder in use | `browserType.launch: Executable doesn't exist at …` for every test |
| The runner killed hard | Both servers keep running in their own process groups, and the next run fails with "already used" until they are stopped. `lsof -nP -iTCP:3000 -sTCP:LISTEN` (and `-iTCP:5173`) shows each listener's PID, `ps -o pid,command -p <PID>` shows whether it is the test API (`dist/server.js`) or Vite (`vite.js`), and `kill <PID>` stops it |
| No gcloud login | The setup project fails first: `Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error: "Could not load the default credentials. …"`, after a `MetadataLookupWarning`; every dependent test is skipped. Run `gcloud auth application-default login` (README) |
| A quota or "API not enabled" error while minting | `gcloud auth application-default set-quota-project storage-minis-dev` |
| A saved session that Firebase's internals no longer match | Every signed-in spec fails at once: the startup check discards the session (sign-in plan SI-10) |

## API runtime behavior

| Area | Contract |
| --- | --- |
| Health | `GET /health/live` returns 200 `{"status":"ok"}`. `GET /health/ready` returns 200 `{"status":"ready"}` after a fresh database check, or 503 `{"status":"unavailable"}`. A database outage keeps liveness at 200; readiness recovers without a restart. |
| Database check | Verifies the database name, the role and `TimeZone = UTC` within 6 s. The pool holds at most 5 connections, with a 2 s connection timeout, 3 s statement timeout, 4 s query timeout and 10 s idle timeout. |
| Startup | Configuration, database acquisition, plugin loading (`app.ready()`), the database check and listen must finish within 17 s, or the process exits 1. Fastify's 10 s plugin timeout ends a hung plugin earlier as `app_readiness_failed`. |
| Lifecycle lines | One JSON line per event on stdout, always written regardless of `LOG_LEVEL`: `{"level":30,"time":…,"msg":"listening"}`, or level 50 with a category such as `configuration_failed`, `database_readiness_failed`, `listen_failed`, `startup_timeout` and an `err` for failures. |
| Shutdown | SIGINT/SIGTERM drain HTTP, then close the pool, within one 10 s bound. Success exits 130/143; a failed or timed-out cleanup exits 1. Compose gives the API 15 s. |
| HTTP limits | 16 KiB bodies (1 MiB on the tRPC route), 10 s request receive time, no trusted proxy, generated request IDs. |
| tRPC | `/trpc/<procedure>`: plain JSON, no transformer, no batching, queries by GET and mutations by POST. The public `diagnostics.echo` and `session.get`. See the [tRPC HTTP contract](#trpc-http-contract) and [sign-in and authorization](#sign-in-and-authorization). |
| Sign-in | `Authorization: Bearer <Firebase ID token>`, verified in the guarded builders against Google's keys, fetched on first use and cached (no request at startup). `/health/ready` stays database-only, by the owner's choice (2026-11-04). |
| Logs | JSON lines on stdout. Request lines carry method, matched route template (`/trpc/:path` for tRPC), status, elapsed time, a generated request ID and, for a matched tRPC procedure only, `procedure`; never URLs, bodies, headers or other request inputs. Failures add an allowlisted `err`: constructor `type`, a string `code` (Node code or Postgres SQLSTATE such as `28P01`, `23505`), `stack` frames only (at most 20) and `cause` to depth 3. Messages appear only when `NODE_ENV=development`, except the API's own `ConfigurationError`, which names only variables. 4xx failures log at info, 5xx at error. Client responses stay fixed. |

### tRPC HTTP contract

Every response under `/trpc` uses one envelope with a fixed message per code; it
has no stack, cause, procedure path or client text:

```json
{"error":{"message":"Invalid request","code":-32600,"data":{"code":"BAD_REQUEST","httpStatus":400,"issues":[{"path":["message"],"code":"too_small"}]}}}
```

`issues` (at most 20, each `{ path, code }`) appears only for input validation.
Clients read `error.data.code`. Each failure logs one `request_failed`, at info
for 4xx and error for 5xx, with `category` (the lowercased code; 500 is
`internal_error`), `status`, `procedure` when matched, and the allowlisted `err`.

| Request | Response |
| --- | --- |
| `GET /trpc/diagnostics.echo?input={"message":"ok"}` (URL-encoded) | 200 `{"result":{"data":{"message":"ok"}}}` |
| `message` empty, over 100 characters or not a string; an unknown key; no `input` | 400 `BAD_REQUEST` with `too_small`, `too_big`, `invalid_type`, `unrecognized_keys` (path `[]`, key names not echoed) or `invalid_type` (path `[]`) |
| `input` that is not JSON, or a malformed or prototype-poisoned JSON body | 400 `PARSE_ERROR` |
| An unknown procedure, `/trpc`, `/trpc/` or `/trpc/a/b` | 404 `NOT_FOUND`; the path is neither echoed nor logged |
| A query by POST or PUT | 405 `METHOD_NOT_SUPPORTED` |
| A batch call (`?batch=1`) | 400 `BAD_REQUEST` |
| A malformed URL such as `/trpc/%E0%A4%A` | 400 `BAD_REQUEST` |
| A body over 1 MiB | 413 `PAYLOAD_TOO_LARGE` |
| A media type other than JSON (`text/plain`, `multipart/form-data`, …) | 415 `UNSUPPORTED_MEDIA_TYPE`; the header is not echoed |
| A POST with `content-type: application/json` and no body | Treated as no input; a mutation without input succeeds |
| An output that fails its schema, or an unexpected error | 500 `INTERNAL_SERVER_ERROR`, message `Internal server error` |

Documented exceptions:

- `HEAD` under `/trpc` returns 204 with no body. tRPC answers it before resolving a
  procedure, so it runs no procedure and logs no failure.
- An oversized upload may end in a connection reset instead of the 413 envelope.
  Fastify rejects an over-limit `Content-Length` unread and closes the connection,
  and a client still sending sees `ECONNRESET`. The tRPC client then reports a
  `TRPCClientError` without `data`.
- Node or Fastify handles some failures before routing (431 for oversized headers
  or URL, 408 for a receive timeout, malformed HTTP). They keep Fastify's
  client-error body, and the tRPC client reports them as plain HTTP errors. Query
  input travels in the URL, so it must stay well under Node's 16 KiB header limit.
- Development logs (`NODE_ENV=development`) include tRPC and Zod messages under
  the log policy; these can name unknown keys or a requested path. Other modes
  log no messages.

### Sign-in and authorization

The [T02 record](t02-authentication-record-2026-11-03.md) (AU-01–AU-12) and the
[sign-in plan](technical-direction.md#t02-record-and-sign-in-plan-approval-2026-11-04) (SI-05–SI-08) set these contracts;
PR 3a implemented them in `apps/api/src/auth/` and `trpc/procedures.ts`.

**Token verification** (`auth/id-token.ts`, jose 6.2.15). The header must be
`Bearer` and three base64url segments, at most 4096 characters. The token must be
RS256, signed by a key in
`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
(jose's 5 s timeout, 30 s cooldown and 10-minute cache), with issuer
`https://securetoken.google.com/<FIREBASE_PROJECT_ID>`, audience exactly the
project ID, `sub` of 1–128 characters, `exp` not past (5 s tolerance), `iat` and
`auth_time` no later than now plus 5 s, `auth_time` at most 604,800 s ago, and
`firebase.sign_in_provider` `google.com` (or `custom` for `e2e-` uids under
`AUTH_TEST_SIGN_IN`). The token is never logged or stored.

**Procedure classes.** Business procedures start from a guarded builder; a
public router derives its own module-private builder, as `diagnostics` does.

| Builder | Requires | Adds to `ctx` |
| --- | --- | --- |
| `identityProcedure` | A valid token | `identity` (uid, email, provider, `auth_time`) |
| `userProcedure` | Plus a User row for the uid and a session that is not revoked | `user` (`id`, `role`, `canEditProducts`) |
| `organizationProcedure(minRole)` | Plus `x-organization-id` (a positive int32 in decimal) and a Membership there with at least `viewer`, `editor` or `owner` | `organization` (`id`, `currency`), `membership` (`role`) |
| `platformProcedure` | Plus `role = global_admin`; no Membership needed or implied | — |

`requireCanEditProducts(ctx.user)` guards Product edits. Every query filters by
`ctx.organization.id`, and `ctx.user.id` is the actor of every write.

| Situation | Response | `err.cause.code` in `request_failed` |
| --- | --- | --- |
| No, malformed, wrong-project or expired token; past 7 days; another provider | 401 `UNAUTHORIZED` | `token_missing`, `token_invalid`, `token_expired`, `session_limit`, `provider_rejected` |
| A session revoked by `sessions_valid_after` | 401 `UNAUTHORIZED` | `session_revoked` |
| Google's keys cannot be read (timeout, failed fetch, invalid set) | 500 `INTERNAL_SERVER_ERROR`, so nobody is signed out | Cause type `KeySetUnavailable` |
| A valid token without a User row (User and narrower classes) | 403 `FORBIDDEN` | `user_missing` |
| `x-organization-id` missing or malformed | 400 `BAD_REQUEST` | `organization_header_invalid` |
| No Membership in that Organization, whether it exists or not; a lower role | 403 `FORBIDDEN`, identical bodies | `membership_missing`, `role_too_low` |
| Not `global_admin`; no `can_edit_products` | 403 `FORBIDDEN` | `global_admin_required`, `product_edit_required` |
| Another Organization's record ID | 404 `NOT_FOUND`, as for a nonexistent ID | The procedure's own |

Rejections log at info with the fixed category (`unauthorized`, `forbidden`,
`bad_request`); the cause's type is `IdentityRejected` or `AccessDenied`. No
user ID, email or header value is logged.

**`session.get`** (an `identityProcedure` query, no input) answers
`{ status: "member", user, memberships }` or `{ status: "noAccess" }`:

1. A User row for the uid: refuse a revoked session (401); for a Google token,
   copy a changed email (lowercased) or name into the row; answer its
   Memberships, or `noAccess` when it has none, a `global_admin` included.
2. Otherwise, run the [bootstrap](#bootstrap) when its trigger holds.
3. Otherwise answer `noAccess` and write nothing.

#### Bootstrap

With `BOOTSTRAP_*` set, a `session.get` from a Google token whose verified email
equals `BOOTSTRAP_OWNER_EMAIL` (ignoring case and surrounding spaces), for a uid
without a User row, runs one transaction (T02 AU-07):

1. `pg_advisory_xact_lock(6002526786755506225)`, the ASCII bytes of
   `SMBOOT01`, so concurrent first requests serialize;
2. answer the User that now has this uid, or `noAccess` if any Organization
   exists;
3. insert the User (`global_admin`, `can_edit_products`, the token's email and
   name), the Organization (the configured name, nickname and currency) and the
   owner Membership;
4. insert the `organization.bootstrap` event and its `membership.grant` change
   (`after_facts` `{"role":"owner"}`), with the new User as actor.

It never runs again once an Organization exists. After `pnpm db:reset` and
`pnpm db:migrate`, the owner's next Google sign-in (the Login page, PR 3b)
bootstraps the development database again. A failure rolls everything back and
answers 500 with the SQLSTATE in the log.

#### Operator SQL

Until a user-management screen or T04's operator workflow exists, operators run
these as the owner role: `pnpm db:psql` locally (add `-c '<SQL>'`). Find a User
with `SELECT id, firebase_uid, email, role FROM users;`. Neither statement is
audited in the database yet ([#129](https://github.com/WilliamPhilippe/storage-minis/issues/129)):
record it in the issue or PR that asked for it.

**Revoke a User's sessions (AU-05):** for a lost device or a suspected
compromise. Every session signed in at or before the cutoff's second gets 401 at
its next request; a new sign-in after it works.

```sql
UPDATE users SET sessions_valid_after = now() WHERE id = <user id>;
```

**Rebind a lost Google account (AU-06):** the person signs in with the new
account and sees "No access"; the operator finds the new uid in the Firebase
console (Authentication → Users, by email, in `storage-minis-dev` locally), then
moves the existing User to it and revokes the old account's sessions:

```sql
BEGIN;
UPDATE users
SET firebase_uid = '<new uid>',
    email = '<new email>',
    sessions_valid_after = now()
WHERE id = <user id>;
COMMIT;
```

The person signs in again and keeps their role and Memberships; the old uid has
no User row, so `session.get` answers `noAccess` and guarded procedures 403.
`apps/api/tests/auth.integration.test.ts` runs both statements.

#### Web session

PR 3b implemented the web side (sign-in plan SI-09 to SI-13) in
`apps/web/src/lib/session/`:

| Area | Contract |
| --- | --- |
| Firebase | `firebase.ts` is the only module that imports `firebase/app` and `firebase/auth`. The session layer loads it with `import()` when `/login` or `/app` asks for the session, so the catalog never downloads it (a lazy chunk of about 28 KiB gzip). `initializeAuth` uses local persistence (IndexedDB, then localStorage) and no `popupRedirectResolver`; each sign-in call passes `browserPopupRedirectResolver`. `auth.languageCode` follows the active language. |
| Startup check | `savedSession.ts`, once per page load before Firebase initializes: it opens IndexedDB `firebaseLocalStorageDb` only if it exists, reads `firebase:authUser:<apiKey>:[DEFAULT]` from store `firebaseLocalStorage` and the same key in localStorage, decodes `stsTokenManager.accessToken`'s `auth_time`, and deletes a record past 604,800 s or unreadable; the Login page then says "Your session ended. Sign in again." These names are Firebase internals of `@firebase/auth` 1.13.9; the check fails closed. |
| Guard | `/app`'s `beforeLoad` sends a signed-out visitor to `/login?redirect=<path>`, and an account without access (already signed out of Firebase) to `/login`, state 4; a member's session joins the router context, read with `useSession()` (the User, the Memberships, and the active Organization: the lowest Organization ID). `/login` sends a member on to `redirect`, an `/app` path only, checked again before use because TanStack Router merges the URL's raw search into each match. The guard is not an authorization boundary; the API is. |
| Requests | The tRPC link adds `Authorization: Bearer <getIdToken()>` once Firebase is loaded and someone is signed in, and `x-organization-id` once the session is loaded. Past 7 days by the remembered `auth_time`, it signs out instead of asking Firebase for a token (AU-03 check 2). |
| Errors | The QueryCache's and MutationCache's `onError`: `UNAUTHORIZED` signs out with "Your session ended"; `FORBIDDEN` reloads the session and lets the guard decide between the page and state 4; a 5xx or a network failure never signs anyone out. |
| Sign-out | The Sign out button (right above the language switch: in the SideNav's footer from `bp-md`, its icon alone with its name in a tooltip when collapsed, and in the menu drawer's footer below it) cancels queries, clears the cache, signs out of Firebase and opens `/login`. Firebase tells this browser's other tabs, which clear their cache and go to `/login`; other browsers stay signed in (AU-04). |
| Development hook | `testSignIn.ts`, imported only inside `if (import.meta.env.DEV)`, sets `window.__storageMinisTest.signIn(token)` for Playwright's setup. Production builds contain neither the module nor the name. |

After `pnpm db:reset` and `pnpm db:migrate`, sign in once with Google at
`http://localhost:5173/login`: the owner's first sign-in runs the
[bootstrap](#bootstrap) again.

## Web dev server

| Area | Contract |
| --- | --- |
| Address | `vite` (in `pnpm dev`) binds `127.0.0.1:5173`; `vite preview` binds `127.0.0.1:4173`. Both use `strictPort`, so an occupied port fails instead of moving. The documented URL is `http://localhost:5173`, which the Firebase dev project authorizes and the dev browser key accepts as a referrer: Google sign-in works there, not on `127.0.0.1` or another port. |
| Proxy | `/trpc/` (with the trailing slash, so `/trpcx` is not matched) goes to `http://127.0.0.1:3000`; `vite preview` reuses it. With the API down, Vite logs `http proxy error` and the browser gets 502 with no tRPC envelope, which the app reports as "Can't reach the server" after three retries. |
| Deep links | `appType` stays `spa`: any other path returns `index.html` in dev and preview. |
| Generated files | The router plugin writes `apps/web/src/routeTree.gen.ts` (committed) and uses `.tanstack/` (ignored) while it runs. |
| Environment | The Firebase web config from `apps/web/.env.development` (`vite`) or `.env.production` (`vite build`, `vite preview`), checked when Vite starts; see [web configuration](#web-configuration). |

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
compose.stack.yaml --env-file .env.test logs api`. Because the stack reads
`.env.test`, its API verifies tokens of `storage-minis-dev`, accepts Google
sign-ins only and never bootstraps. `pnpm stack:down` removes the
stack's containers, network and database volume; it keeps the built
`storage-minis-api:local` image for faster rebuilds, which
`docker image rm storage-minis-api:local` removes. `pnpm test:stack` runs
`apps/api/tests/stack.smoke.test.ts`: a clean `stack:up`, exact health bodies on
port 3100, a nonroot API without mounts whose DB package holds only `dist`,
`drizzle` and `package.json`, `migrate` finishing before `api` starts,
an unpublished database, a redeploy that changes the API but whose `migrate`
fails (a second session holds the history lock) leaving the same API container
serving, SIGTERM exit 143 within 10 s, and no start of a stopped API when
`migrate` fails. It always ends with `stack:down`.

## Turborepo tasks and cache

| Task | Depends on | Cache | Passes through |
| --- | --- | --- | --- |
| `build` | `^build` | `dist/**`, `dist-testing/**` | Nothing |
| `typecheck` | `^build` (DB `typecheck` waits for its own `build`) | Yes | Nothing |
| `//#lint`, `//#test` | DB and API `build` | Yes | `NODE_ENV`, `TZ` hashed for `//#test` |
| `//#typecheck:root`, `//#format:check` | None | Yes | Nothing |
| DB `db:generate` | None | No | Nothing |
| DB `db:migrate` | `build` | No | `MIGRATION_DATABASE_URL`, `TZ` |
| DB `test:integration` (`pnpm test:db`) | `build` | No | `DATABASE_URL`, `MIGRATION_DATABASE_URL` |
| API `test:process` (`pnpm test:api`) | `build` | No | `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `FIREBASE_PROJECT_ID`, `BOOTSTRAP_*`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ` |
| Web `test:e2e` (`pnpm test:e2e`) | `^build` | No | `PLAYWRIGHT_BROWSERS_PATH`, `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS`, `CLOUDSDK_CONFIG`; never `AUTH_TEST_SIGN_IN` |
| API `start`, API `dev` | `build` / `^build` | No, persistent | `DATABASE_URL`, `FIREBASE_PROJECT_ID`, `BOOTSTRAP_*`, `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ`; never `AUTH_TEST_SIGN_IN` |
| DB `dev` | `build` | No, persistent | Nothing |
| Web `dev` | None | No, persistent | Nothing |

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
restart policies is part of T04. Production's `FIREBASE_PROJECT_ID` is
`storage-minis`; T04 adds it and the `BOOTSTRAP_*` keys to `prd` and maps the
bootstrap in `compose.yaml`. The rest of the VPS remains T04 work, as the
restructure plan listed it:

- installing Docker, and a firewall that allows only ports 22, 80 and 443, with
  PostgreSQL never published;
- placing the service token and creating the `prd` keys;
- the Caddy `web` image (D5), image distribution through GitHub Container
  Registry (D9), and daily backups with a tested restore (D10);
- the deploy procedure: `docker compose run --rm migrate`, then
  `up -d --wait`, both under `doppler run` (R19).
