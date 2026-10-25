# Local development reference

Use the [README](../../README.md) for startup commands and code conventions.
This reference contains detailed setup, troubleshooting, storage, and cache
instructions. Approved technical choices and command behavior remain unchanged.

## Local setup

Use the [Docker tooling workflow](#docker-tooling) for dependency installation and
checks. It retains the pinned runtime and isolates Linux dependencies from host
copies. The following host setup is the earlier approved alternative; existing
host installations remain usable. Host Node/pnpm are not required by Docker.

The first bootstrap step establishes a private pnpm workspace. The exact Node.js
version is pinned in [.nvmrc](../../.nvmrc) and the Node.js/pnpm requirements in
[package.json](../../package.json). Use Node.js 24.22.1 LTS and pnpm 12.15.0.

Use a Node.js version manager that reads `.nvmrc`. Both
[fnm](https://github.com/Schniz/fnm) and [nvm](https://github.com/nvm-sh/nvm#nvmrc)
are compatible; the repository requires the pinned Node.js/pnpm versions rather
than a specific version manager. fnm was installed for the initial local setup
because Homebrew was already available. Existing nvm users can keep using nvm.

From the repository root, activate Node.js with your installed, initialized
version manager. For fnm:

```sh
fnm install
fnm use
```

For nvm:

```sh
nvm install
nvm use
```

Then install the pnpm tool and workspace dependencies:

```sh
npm install --global pnpm@12.15.0
pnpm install --frozen-lockfile
pnpm list --recursive --depth -1
```

fnm supports Homebrew installation with `brew install fnm` and automatic version
switching with `eval "$(fnm env --use-on-cd --shell zsh)"` in `~/.zshrc`. That
initialization is already configured on the initial development machine. Both
managers need shell initialization; a shell that has not loaded the manager may
report `node: command not found` even when Node.js is installed. The npm command
above installs the pnpm tool; use pnpm for all repository dependency changes.

The fnm, install, and workspace-list commands have been verified on macOS arm64;
the nvm alternative has not been executed on that machine. The workspace
currently contains three private packages:

```text
package.json           # Workspace root and toolchain pins
pnpm-workspace.yaml     # apps/* and packages/* membership and install settings
pnpm-lock.yaml         # Shared lockfile
tsconfig.base.json     # Shared strictness; no runtime globals
tsconfig.node.json     # Node ESM profile for tooling/API/DB
tsconfig.json          # Root tooling typecheck
eslint.config.mjs      # Shared lint rules
.prettierrc.json       # Shared formatting settings
vitest.config.mts      # Package test project discovery
turbo.json             # Cached checks and shared task inputs
apps/
  api/package.json     # @storage-minis/api; future Fastify/tRPC server
  api/tsconfig.json
  api/vitest.config.mts
packages/
  db/package.json      # @storage-minis/db; compiled connection package and guarded CLI
  db/tsconfig.json
  db/vitest.config.mts
```

Dependencies are saved with exact versions, and installs enforce engine
compatibility. Development tools are installed at the root for use from a full
workspace checkout. Turborepo 2.11.10 schedules and caches the existing checks.
Step 3A adds the DB runtime dependencies, build, connection check and guarded
migration commands. API commands, business schema and the React frontend remain
later deliveries. Docker Compose provides the tooling runner
and separate [local PostgreSQL services](#local-postgresql).
This workspace setup is partial progress toward [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26);
its remaining prerequisites and acceptance criteria still apply.

## Docker tooling

Step 1 uses Docker Desktop's existing Linux engine and Compose. The image is
based on the Docker Official Image `node:24.22.1-bookworm-slim`, pinned by digest
in [Dockerfile.tooling](../../docker/Dockerfile.tooling), with pnpm 12.15.0. Docker is
needed on the host; Node, pnpm and application secrets are not.

Choose a **unique project name for each checkout**, including checkouts with the
same directory basename. This checkout uses `storage-minis-beijing`; another
checkout could use `storage-minis-feature-x`. Never share a name between checkouts.
From the repository root:

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
./scripts/tooling.sh build
./scripts/tooling.sh init
./scripts/tooling.sh run node --version
./scripts/tooling.sh run pnpm --version
./scripts/tooling.sh run pnpm store path
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/tooling.sh run pnpm list --recursive --depth -1
./scripts/tooling.sh run pnpm typecheck
./scripts/tooling.sh run pnpm lint
./scripts/tooling.sh run pnpm format:check
./scripts/tooling.sh down
```

Expected versions are `v24.22.1` and `12.15.0`, store `/pnpm/store/v11`, and three
private workspace packages. Build before init; repeat init safely when creating
fresh volumes. Build/install need network access initially. Allow up to ten
minutes for each build/install attempt; stop a stalled attempt before retrying.
Populated dependencies/store can support later offline work. Run one dependency
installation at a time per checkout.

Each `run` starts a disposable container as `node` (1000:1000), preserves command
arguments/exit codes, and forwards TERM/INT to that invocation's named container.
No ports are published and no database starts. The launcher locates the checkout
from its own path, so later invocations may run from another working directory.
It discovers Docker on PATH, then the Docker Desktop bundled path. Set
`DOCKER_BIN` to an explicit executable path if needed. Docker context/client
settings remain on the host. Checkout `.env` and `COMPOSE_ENV_FILES` are ignored.

Five project-scoped named volumes store root/API/DB dependencies, the pnpm store
and Turbo cache. `nocopy` preserves host trees without importing their native
binaries. Init changes only volume-root ownership, with no checkout bind mount.
Reviewable generated files remain on the writable checkout and survive exit.
The host editor cannot resolve dependencies stored only in Docker volumes;
container editor support or a host install requires a separate decision.
Git stays on the host. Turbo hashing works without Git in the image; Git-history
filters are outside this runner's contract. Ordinary edits and atomic saves were
observed by a directory watcher on the macOS bind mount; later API watchers still
need their own verification.

Run any [development check](#development-checks) by prefixing it with
`./scripts/tooling.sh run`. `pnpm check` now includes meaningful DB unit tests.
Use `run-db test` with the matching Doppler config for live integration tests;
ordinary `run` does not inject database credentials.

### Doppler host setup and verification

Doppler runs on the **host** so it can supply values before host Compose parses
configuration. It is not installed in the Node image. The pinned CLI is 3.77.1;
this machine's owner installed it through Homebrew at `/opt/homebrew/bin/doppler`.
Use the explicit override below for that installation. The launcher rejects
other versions, including an incidental Homebrew upgrade.

For a fresh macOS arm64 setup, the approved standalone installation avoids PATH
and shell-profile edits. Verify the official release checksum before extraction:

```sh
(
  set -eu
  archive="$(mktemp)"
  curl -fL --connect-timeout 10 --max-time 120 \
    https://github.com/DopplerHQ/cli/releases/download/3.77.1/doppler_3.77.1_macOS_arm64.tar.gz \
    -o "$archive"
  printf '%s  %s\n' \
    e0033d287811de122e7a353a4d548f72ff3103b3010147ce80299f28b5313df2 \
    "$archive" | shasum -a 256 -c -
  install_dir="$HOME/.local/share/storage-minis/tools/doppler/3.77.1"
  mkdir -p "$install_dir"
  tar -xzf "$archive" -C "$install_dir" doppler
  chmod 755 "$install_dir/doppler"
  "$install_dir/doppler" --version
  rm "$archive"
)
```

Linux/Intel require the corresponding official 3.77.1 artifact/checksum; only
macOS arm64 is verified here. No automatic installation or upgrade is performed.
For the standalone path, omit `TOOLING_DOPPLER_BIN` below. From the repository root,
create the parent directories **before** login, then complete browser approval:

```sh
export TOOLING_DOPPLER_BIN=/opt/homebrew/bin/doppler
mkdir -p "$HOME/.config/storage-minis/doppler"
chmod 700 "$HOME/.config/storage-minis/doppler"
"${TOOLING_DOPPLER_BIN:-$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler}" \
  --config-dir "$HOME/.config/storage-minis/doppler" login --scope "$PWD"
```

Use the Doppler project `storage-minis`, config `dev`, with the harmless entry
`FOUNDATION_TOOLING_PROBE=storage-minis-tooling-ok`. Account/project creation and
browser login require the owner's account. Do not provide tokens in chat or add
credentials to the checkout. Database commands use target-matching `dev` / `test`
configs as described below; production remains later work. Credential state stays
in the dedicated host directory, separate from
existing global Doppler state.

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
export DOPPLER_PROJECT=storage-minis
export DOPPLER_CONFIG=dev
unset DOPPLER_TOKEN
./scripts/tooling.sh verify-env
```

The command validates the marker on the host before launching Compose, then
passes only that named value to a direct Node assertion. Output is pass/fail;
upstream diagnostics are suppressed, and a failed fetch exits nonzero before
the container starts. Check the selected project/config, login directory, pinned
CLI and network if verification fails. No token enters the container.
Managed values override conflicting ambient values; `.env` is never sourced.
`--no-fallback` disables reading and writing encrypted snapshots. Each launch
fetches current values; running processes do not receive rotations automatically.
The pinned CLI has no `--no-interactive` flag; verification instead closes stdin
and performs browser authorization separately. Requests use a ten-second timeout
and one attempt. Ordinary build/init/run/down never invoke Doppler.

| Variable | Source and consumer |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Explicit unique checkout setting; host Compose resource scope. |
| `DOCKER_BIN` | Optional host Docker executable override; launcher only. |
| `TOOLING_DOPPLER_BIN` | Optional pinned host CLI override; default standalone path above. |
| `TOOLING_DOPPLER_CONFIG_DIR` | Optional host credential-directory override; default `$HOME/.config/storage-minis/doppler`. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Explicit nonsecret selection: `storage-minis` / `dev`. |
| `FOUNDATION_TOOLING_PROBE` | Doppler-managed harmless verification value; host assertion and one container only. |
| `PNPM_CONFIG_STORE_DIR` | Fixed inside tooling at `/pnpm/store`; no host configuration change. |

### Shutdown and explicit storage removal

`./scripts/tooling.sh down` stops the tooling-file resources and preserves
all five volumes. Use `./scripts/database.sh down` for whole-project shutdown
when PostgreSQL services have been started. There is no background tooling
container after a finished
command. To discard **all tooling dependencies and caches for one checkout**, use
the separate destructive command below from its repository root. Confirm the
project name first; subsequent use needs init and frozen install again.

```sh
docker compose --env-file /dev/null --file compose.yaml \
  --project-directory "$PWD" --project-name "$COMPOSE_PROJECT_NAME" \
  --profile tools down --volumes
```

Never use global pruning for checkout cleanup. Step 1 adds no database volumes.
See the [approval and verification record](../../docs/technical/technical-direction.md#step-1-docker-tooling-2026-10-24)
for actual evidence and remaining limits.

## Local PostgreSQL

Step 2 adds [compose.postgres.yaml](../../compose.postgres.yaml), explicitly combined
with the tooling file by [database.sh](../../scripts/database.sh). PostgreSQL runs in
separate development and test containers, using the Docker Official Image
`postgres:18.6-bookworm` pinned by digest. The database is initially empty of
application tables; the existing DBML is not applied. Step 3A supplies the
[Drizzle connection package](#drizzle-tooling).

Reuse the checkout project name from Docker tooling. Use Doppler project
`storage-minis`: `POSTGRES_PASSWORD` in config `dev`, and
`POSTGRES_TEST_PASSWORD` in config `test`. The passwords must differ. The
config must match the command target; tests never fall back to `dev`.
Use the [existing dedicated browser login](#doppler-host-setup-and-verification).
No host PostgreSQL client or additional Node dependencies are required.

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
DOPPLER_CONFIG=test ./scripts/database.sh psql test -c 'SELECT version();'
```

Pull explicitly before startup; the pull deadline is ten minutes. Each `up`
waits up to 60 seconds for health, then performs a password-authenticated SQL
identity check with a 15-second deadline. Success means the selected database,
role `postgres` and timezone `UTC` match. `pg_isready` health alone does not prove
authentication. A failed SQL check leaves storage intact and returns nonzero.

| Target | From another container in this project | From a host database tool | Database / user | Doppler config / password key |
| --- | --- | --- | --- | --- |
| Development | `postgres:5432` | `127.0.0.1:5433` | `storage_minis_dev` / `postgres` | `dev` / `POSTGRES_PASSWORD` |
| Test | `postgres_test:5432` | `127.0.0.1:5434` | `storage_minis_test` / `postgres` | `test` / `POSTGRES_TEST_PASSWORD` |

Both local roles are superusers. Future production/application/migration roles
remain T04 work. TCP authentication uses SCRAM; host ports bind only to loopback.
Containers use service DNS and port 5432, never a host-mapped port. A host
database tool can use the corresponding password from Doppler; none is installed
by this setup. `psql` runs noninteractively in a disposable image container: use
`-c SQL`, not an interactive prompt. It propagates SQL errors and has a five-second
connection timeout. Its general SQL commands have no statement timeout; readiness
checks use five seconds.

| Setting | Source / behavior |
| --- | --- |
| `POSTGRES_PASSWORD`, `POSTGRES_TEST_PASSWORD` | Owner-managed Doppler keys; no values in this repository. Only the selected key is fetched and passed to the matching service/client. |
| `POSTGRES_PORT` | Nonsecret host override, default 5433. |
| `POSTGRES_TEST_PORT` | Nonsecret host override, default 5434. Must differ from the development port. |
| `COMPOSE_PROJECT_NAME` | Explicit unique checkout name; determines network and development volume ownership. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Must explicitly select project `storage-minis` and config matching the target: `dev` or `test`. Another mapping is rejected. |
| Existing Docker/Doppler executable and credential-directory overrides | Same as Step 1. No new installation or shell initialization. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Generated for the client from its explicit target; ambient libpq configuration is ignored. |

For a second checkout, choose a different project name and export, for example,
`POSTGRES_PORT=5435` and `POSTGRES_TEST_PORT=5436`. Never share a project name
between checkouts. An occupied port fails; the launcher does not choose another
port or database. Ports accept integers 1–65535 without leading zeros.

Doppler runs on the host before Compose interpolation. The launcher clears
ambient passwords, rejects service tokens, ignores `.env` and ambient Compose
file selections, and disables fallback snapshots. Missing secrets, wrong
project/config, missing browser login or failed network access stop the command.
Do not print resolved Compose configuration or pass passwords in command-line
URIs. Ordinary tooling and database stop/log/reset/pull commands need no Doppler
access. No credentials are baked into the Node image. `run-db` passes only the selected
connection components to the process and relevant uncached Turbo tasks; Doppler
login state remains on the host.

### Database lifecycle and reset

Tooling-only commands may report the DB containers as “orphans” because they
read only `compose.yaml`. This is expected with the optional database file;
keep those containers and use the combined launcher for project shutdown.

```sh
./scripts/database.sh logs dev       # Follow selected service; Ctrl-C exits
./scripts/database.sh logs test
./scripts/database.sh stop test      # Discards test data
./scripts/database.sh stop dev       # Preserves development data
./scripts/database.sh down           # Stops project; preserves named volumes
```

Development storage is `<COMPOSE_PROJECT_NAME>_pgdata`, mounted at
`/var/lib/postgresql`; PostgreSQL 18 uses `/var/lib/postgresql/18/docker` inside it.
Ordinary stop/start and down/up preserve it. Test storage is a separate 512 MiB
tmpfs, discarded on stop, restart, recreation or project shutdown. Its memory
counts against the Docker VM's resources. Never use the development target as a
disposable test fixture.

Initialization runs only on empty storage. Changing a Doppler password does not
change the role password in an existing development volume. A recreated server
can be healthy while the authenticated check fails. Restore the matching Doppler
credential or perform a separately reviewed SQL password change; the launcher
does not change passwords or reset data automatically. Reinitialize disposable
test storage to pick up its current credential.

To deliberately discard one target, confirm the exact project name:

```sh
./scripts/database.sh reset test --confirm "$COMPOSE_PROJECT_NAME"
./scripts/database.sh reset dev --confirm "$COMPOSE_PROJECT_NAME"
```

Test reset stops/removes only the test container and its tmpfs. Development
reset checks Compose ownership labels, stops/removes only the development
container and removes only `<project>_pgdata`. Both preserve the five tooling
volumes; development reset preserves a running test database. Reset never
restarts a service. Run `up <target>` explicitly afterward. Avoid
`down --volumes` for DB reset because it also deletes tooling dependencies/cache.

See [Step 2 approval and verification](../../docs/technical/technical-direction.md#step-2-local-postgresql-planning-2026-10-24)
for infrastructure evidence and the remaining application/schema boundaries.

## Drizzle tooling

Step 3A installs Drizzle ORM 0.45.4, `pg` 8.23.1 and Zod 4.6.7 in the DB
package, with Drizzle Kit 0.31.11, `@types/pg` 8.23.1 and `tsx` 4.23.15 as root
development tools. Use the existing Docker dependency volumes. No host Drizzle,
PostgreSQL client or extra global CLI is needed.

The approved `pnpm-workspace.yaml` allowlist permits only esbuild 0.18.20, 0.25.12
and 0.28.2 install scripts. Frozen installation must succeed; do not bypass
unreviewed future build scripts or change package pins implicitly.

With PostgreSQL started and the project/login settings above:

```sh
./scripts/tooling.sh run pnpm build
./scripts/tooling.sh run-db dev pnpm db:check
DOPPLER_CONFIG=test ./scripts/tooling.sh run-db test pnpm db:check
DOPPLER_CONFIG=test ./scripts/tooling.sh run-db test pnpm test:db
```

`run-db` delegates target validation and selected-key Doppler injection to the
same launcher used to initialize PostgreSQL. It forwards `DB_TARGET`, `PGHOST`,
`PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD` by name into the tooling container.
The tuple is fixed to the selected local service/database and validated again by
Node. Host `.env`, ambient passwords, `DATABASE_URL` and other libpq overrides
cannot select another database. Doppler entries with these component names are
not injected; the selected target determines them, and Doppler supplies only its
password. Both internal ports remain 5432 because the container addresses differ.

`createDatabase(config)` validates explicit input and returns `db` (typed Drizzle),
`check()`, idempotent `close()`, and a `healthy` flag reflecting the last readiness
check/idle error. Importing the package reads no environment and opens no socket;
creating it constructs a lazy pool. Each process owns its instance and must close
it in `finally`; transactions must finish/release before shutdown. Do not share
one process's cleanup with another process or instantiate a second API pool.

The local pool has at most five clients, a 10s idle timeout, 2s acquisition/connect
timeout, 3s statement timeout and 4s query timeout. `check()` verifies authenticated
database/user/UTC within 6s. `close()` drains owned work for up to 10s, then ends
tracked sockets and rejects if a caller leaked a checked-out client. Command
processes enforce a final exit deadline and handle SIGINT/SIGTERM. Check errors
are sanitized; future API code still owns safe translation of ordinary query
errors. Production pool, TLS and role policies remain T04 decisions.

The build emits ESM JavaScript and declarations to `packages/db/dist/`. Package
exports resolve `@storage-minis/db` through `dist/index.js` / `dist/index.d.ts`.
Build before direct package typechecks or typed lint; root `pnpm check` and
`pnpm typecheck` arrange the dependency automatically. Step 4 must add the actual
API workspace dependency and use these compiled exports, not source aliases.

### Migration approval gate

`pnpm db:generate` and `pnpm db:migrate` are separate uncached commands. Both
currently return nonzero with “Schema/migrations pending approval (Step 3B)”.
The host launcher refuses a migration request before fetching Doppler secrets;
package wrappers and direct Drizzle configs also enforce the gate. There is no
placeholder schema, dummy table, migration folder or empty journal.

Step 3B must deliberately replace the gate after physical-schema approval,
complete the CLI execution wrappers/validated migration credentials, and prove
replay before first development application. The checked configuration records
`src/schema/index.ts`, output `packages/db/drizzle/` and history location
`drizzle.__drizzle_migrations`. Generation will be offline; application will be
explicit. No `push`, automatic startup migration, seed or production migration
is available. Preserve SQL/snapshots/journal as reviewed source once delivered.

### Database integration tests

`pnpm test:db` dispatches `test:integration`, requires the exact test tuple, and
runs uncached. Individual tests have a 30s limit; the suite supervisor allows
120s, then terminates its process group, with a 10s forced-cleanup bound. Tests
exercise real PostgreSQL queries, transaction rollback, timeouts, wrong-password
failure, idle disconnection/recovery, bounded shutdown, normal ESM consumption
and signal cleanup. They create no business or dummy tables. Unit launcher tests
use temporary CLI fixtures; they are not real Doppler authentication evidence.

The development target is rejected before an integration payload starts. Test
cleanup never drops development storage. Stop the test service when finished;
its tmpfs is discarded. Business constraints, concurrent commitments, audit
survival and migration replay remain Step 3B/T01/T06 acceptance work.

## Development checks

Run from the root, prefixed with `./scripts/tooling.sh run` for Docker:

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build the DB package's runtime and declarations. |
| `pnpm typecheck` | Build required DB exports, then check root and package source/configuration types. |
| `pnpm check` | Run build prerequisites, typechecks, lint, formatting and unit tests. |
| `pnpm lint` / `pnpm lint:fix` | Typed ESLint checks / automatic fixes; warnings fail. |
| `pnpm format:check` / `pnpm format` | Check / rewrite supported source and config formatting. |
| `pnpm test` / `pnpm test:watch` | Run / watch unit projects; no database prerequisite. |

The shared compiler retains strict source checks, exact optional properties,
checked indexed access and ESM/NodeNext. The owner approved `skipLibCheck: true`
after Drizzle's published declarations failed full library checking; source use
of its types remains checked. See the [Step 3A record](technical-direction.md#step-3a-drizzle-implementation-2026-10-25).

Unit tests live beside source as `src/**/*.test.ts`; import Vitest APIs explicitly.
The `api-unit` and `db-unit` projects exclude integration files. The API has no
tests yet; the root suite now passes because the DB has meaningful tests. An
explicit empty suite still fails. Playwright, coverage thresholds and CI remain
future work. Passing infrastructure tests does not deliver business workflows.

### Turborepo checks and cache

`build` caches `dist/**`; DB typechecks and root typed lint depend on that build.
Consumer builds/typechecks depend on dependency builds when a real workspace
edge exists. Root unit tests remain independent of database availability.

Inspect the graph and verify cache reuse with:

```sh
pnpm check --dry=json
pnpm check --force --summarize
pnpm check --summarize
```

Unchanged second runs reuse successful build/check results. Summaries live in
`.turbo/runs/`; local cache stays in `.turbo/cache`, with remote caching disabled.
Default package inputs include source/tests/configuration; broad root inputs
include documentation, so documentation changes may invalidate root checks.

`db:check`, `db:generate`, `db:migrate` and `test:integration` always execute and
never cache results. Secret-bearing tasks allow only named DB environment values
through strict Turbo filtering; those values are not added to cache hashes.
Unit tests retain `NODE_ENV` / `TZ` hashing. API startup/watch tasks remain pending.
