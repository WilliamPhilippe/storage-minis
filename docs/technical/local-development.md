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
  db/package.json      # @storage-minis/db; compiled schema/connection package and CLI
  db/tsconfig.json
  db/vitest.config.mts
```

Dependencies are saved with exact versions, and installs enforce engine
compatibility. Development tools are installed at the root for use from a full
workspace checkout. Turborepo 2.11.10 schedules and caches the existing checks.
Step 3A adds the DB runtime dependencies, build and connection check. Step 3B
adds the approved structural schema, migrations and constraint tests. Business
writers, API commands and the React frontend remain later deliveries.
Docker Compose provides the tooling runner
and separate [local PostgreSQL services](#local-postgresql).
This workspace setup is partial progress toward [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26);
its remaining prerequisites and acceptance criteria still apply.

## Docker tooling

Step 1 uses Docker Desktop's existing Linux engine and Compose. The image is
based on the Docker Official Image `node:24.22.1-bookworm-slim`, pinned by digest
in [Dockerfile.tooling](../../docker/Dockerfile.tooling), with pnpm 12.15.0. Docker is
needed on the host; Node, pnpm and application secrets are not.

After the [one-time Doppler browser login](#doppler-host-setup-and-verification),
run `pnpm docker:setup` with the pinned host Node/pnpm versions. First setup asks
for a unique project name and development/test ports, saving only those three
values in Git-ignored `.env.compose`. Choose `storage-minis-beijing`, `5433`, and
`5434` to reuse this checkout's existing resources. Repeated setup preserves the
file and data. Later startup needs only `pnpm docker:up`.

Docker-only users can execute the same sequence without host Node/pnpm:

```sh
./scripts/configure-local.sh
docker compose --env-file .env.compose --file compose.yaml build tooling
docker compose --env-file .env.compose --file compose.yaml pull postgres
docker compose --env-file .env.compose --file compose.yaml run --rm --no-deps tooling-init
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/database.sh up dev
```

For noninteractive configuration, first use:

```sh
./scripts/configure-local.sh --project UNIQUE_PROJECT --port 5433 --test-port 5434
```

This refuses to overwrite an existing file. Edit the saved nonsecret values
deliberately when necessary. For later startup and checks:

```sh
pnpm docker:up
./scripts/tooling.sh run node --version
./scripts/tooling.sh run pnpm --version
./scripts/tooling.sh run pnpm store path
./scripts/tooling.sh run pnpm list --recursive --depth -1
./scripts/tooling.sh run pnpm check
```

The setup package script chains configuration, native build/pull/init, frozen
installation and the existing database startup helper. It stops on the first
failed command. Startup itself performs none of the installation/migration steps.
Use `pnpm docker:migrate` explicitly to apply pending committed migrations after
review. Ordinary startup retains both development data and migration history.

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
settings remain on the host. Helpers load literal, allowlisted values from
`.env.compose`, then pass that explicit env file to Compose. Checkout `.env` and
ambient `COMPOSE_ENV_FILES` are ignored. The saved file is never executed as shell
code. Missing/duplicate/unknown keys and invalid values fail before Docker runs.

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
Use `run-db test` for live integration tests; it selects Doppler config `test`;
ordinary `run` does not inject database credentials.

### Doppler host setup and verification

Doppler runs on the **host** so it can supply values before host Compose parses
configuration. It is not installed in the Node image. The pinned CLI is 3.77.1;
this machine's owner installed it through Homebrew at `/opt/homebrew/bin/doppler`.
The launcher discovers that executable on PATH without an override. It rejects
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
From the repository root, create the parent directories **before** login, then
complete browser approval. For the standalone installation, substitute its full
executable path for `doppler`:

```sh
mkdir -p "$HOME/.config/storage-minis/doppler"
chmod 700 "$HOME/.config/storage-minis/doppler"
doppler --config-dir "$HOME/.config/storage-minis/doppler" login --scope "$PWD"
```

Use the Doppler project `storage-minis`, config `dev`, with the harmless entry
`FOUNDATION_TOOLING_PROBE=storage-minis-tooling-ok`. Account/project creation and
browser login require the owner's account. Do not provide tokens in chat or add
credentials to the checkout. Database commands use target-matching `dev` / `test`
configs as described below; production remains later work. Credential state stays
in the dedicated host directory, separate from
existing global Doppler state.

```sh
./scripts/tooling.sh verify-env
```

After local setup, this optional command validates the marker on the host before
launching Compose, then passes only that named value to a direct Node assertion. Output is pass/fail;
upstream diagnostics are suppressed, and a failed fetch exits nonzero before
the container starts. Check the selected project/config, login directory, pinned
CLI and network if verification fails. No token enters the container.
Managed values override conflicting ambient values; `.env` is never sourced.
`--no-fallback` disables reading and writing encrypted snapshots. Each launch
fetches current values; running processes do not receive rotations automatically.
The pinned `doppler run` has no `--no-interactive` flag; verification closes stdin
and performs browser authorization separately. Requests use a ten-second timeout
and one attempt. Ordinary build/init/run/down never invoke Doppler.

| Variable | Source and consumer |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Saved in `.env.compose` once; unique host Compose resource scope. |
| `POSTGRES_PORT`, `POSTGRES_TEST_PORT` | Saved nonsecret ports in `.env.compose`; distinct defaults 5433/5434. |
| `DOCKER_BIN` | Optional host Docker executable override; launcher only. |
| `TOOLING_DOPPLER_BIN` | Optional host CLI override; otherwise discover on PATH, then the approved standalone path. Version 3.77.1 is checked. |
| `TOOLING_DOPPLER_CONFIG_DIR` | Optional host credential-directory override; default `$HOME/.config/storage-minis/doppler`. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Normally omitted: target selects `storage-minis` / `dev` or `test`; contradictory explicit overrides fail. |
| `FOUNDATION_TOOLING_PROBE` | Doppler-managed harmless verification value; host assertion and one container only. |
| `PNPM_CONFIG_STORE_DIR` | Fixed inside tooling at `/pnpm/store`; no host configuration change. |

### Shutdown and explicit storage removal

Use the host [Docker lifecycle commands](../../README.md#docker-lifecycle-commands)
for the complete project. Docker Desktop supplies `docker compose`; a separate
`docker-compose` installation is unnecessary. Run native aliases from the root;
Docker must be on PATH. They follow normal Docker context behavior and use
`--env-file .env.compose --file compose.yaml` explicitly.
The remaining helpers select the canonical file/project explicitly, ignore
ambient file/profile overrides, and locate the checkout from their own path.

`docker:stop` stops services without removing containers or named volumes;
`docker:stop:test` affects only test PostgreSQL. Test tmpfs is discarded on stop.
`docker:prune` removes the project's containers (including orphans) and network,
preserving all named volumes and images. These operations, status, and logs work
without Doppler. They execute on the host, outside Turbo and the tooling runner.

To erase **development data and all dependency/cache volumes for one checkout**:

```sh
pnpm docker:prune:volumes --confirm storage-minis-beijing
# Docker-only equivalent:
./scripts/reset-volumes.sh --confirm storage-minis-beijing
```

The volume helper obtains declared keys from `docker compose config --volumes`,
prints their project-scoped names, and checks each existing volume's Compose project/logical-volume labels before changing any resources.
Missing/wrong confirmation, failed inventory/inspection, or an ownership mismatch
refuses teardown. Correct confirmation delegates removal to native full-profile
`down --volumes --remove-orphans --timeout 10`, covering the owned
`dependencies`, `api-dependencies`, `db-dependencies`,
`pnpm-store`, `turbo`, and `pgdata` volumes. Other projects and images are retained.
The supported local model has no external/custom-named volumes; adopting those
requires a reviewed ownership contract. An in-use volume fails deletion instead
of forcing another container to release it. Repeat cleanup tolerates missing resources.

After full deletion, rerun `pnpm docker:setup`; `.env.compose` survives Docker
volume deletion.
For narrower cleanup, `database.sh reset dev --confirm PROJECT` deletes only
development database storage; `reset test --confirm PROJECT` discards only test
state. Both preserve the five tooling volumes. With the canonical file,
`down --volumes` includes development storage even when the tools profile is
selected; use the confirmed helper for full deletion.

Never use global pruning for checkout cleanup. Ordinary lifecycle commands
preserve development storage; full volume deletion is a separate operation.
See the [approval and verification record](../../docs/technical/technical-direction.md#step-1-docker-tooling-2026-10-24)
for actual evidence and remaining limits.

## Local PostgreSQL

The canonical [compose.yaml](../../compose.yaml) contains all local services.
[database.sh](../../scripts/database.sh) supplies target/config/password guards.
PostgreSQL runs in
separate development and test containers, using the Docker Official Image
`postgres:18.6-bookworm` pinned by digest. The database is initially empty of
application tables; the existing DBML is not applied. Step 3A supplies the
[Drizzle connection package](#drizzle-tooling).

The helpers load the saved checkout settings. They use Doppler project
`storage-minis`: `POSTGRES_PASSWORD` in config `dev`, and
`POSTGRES_TEST_PASSWORD` in config `test`. The passwords must differ. The
config is selected from the command target; tests never fall back to `dev`.
Explicit contradictory Doppler environment overrides are rejected.
Use the [existing dedicated browser login](#doppler-host-setup-and-verification).
No host PostgreSQL client or additional Node dependencies are required.

```sh
pnpm docker:up
pnpm docker:up:test
./scripts/database.sh check dev
./scripts/database.sh check test
./scripts/database.sh psql dev -c 'SELECT current_database(), current_user;'
./scripts/database.sh psql test -c 'SELECT version();'
```

Setup pulls PostgreSQL explicitly before startup. Each `up`
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
| `POSTGRES_PORT` | Saved nonsecret setting in `.env.compose`, default 5433. |
| `POSTGRES_TEST_PORT` | Saved nonsecret setting in `.env.compose`, default 5434. Must differ from the development port. |
| `COMPOSE_PROJECT_NAME` | Saved unique checkout name in `.env.compose`; determines network and development volume ownership. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Selected automatically as `storage-minis` and the target (`dev`/`test`); contradictory explicit overrides are rejected. |
| Existing Docker/Doppler executable and credential-directory overrides | Same as Step 1. No new installation or shell initialization. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Generated for the client from its explicit target; ambient libpq configuration is ignored. |

For a second checkout, save a different project name and ports during setup,
for example 5435 and 5436. Never share a project name
between checkouts. An occupied port fails; the launcher does not choose another
port or database. Ports accept integers 1–65535 without leading zeros.

Doppler runs on the host before Compose interpolation. The launcher clears
ambient passwords, rejects service tokens, ignores `.env` and ambient Compose
file selections, and disables fallback snapshots. Missing secrets, wrong
project/config, missing browser login or failed network access stop the command.
Do not print resolved Compose configuration or pass passwords in command-line
URIs. Ordinary tooling, native stop/log/pull commands, and database reset need no
Doppler access. No credentials are baked into the Node image. `run-db` passes only
the selected connection components to the process and relevant uncached Turbo tasks; Doppler
login state remains on the host.

### Database lifecycle and reset

All commands now use the same Compose model. Development is the default service;
`test`, `tools`, and `db-tools` are optional profiles. Full-project stop/down/status
uses `--profile '*'` to include optional services.

```sh
docker compose --env-file .env.compose --file compose.yaml logs --follow postgres       # Follow selected service; Ctrl-C exits
docker compose --env-file .env.compose --file compose.yaml logs --follow postgres_test
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test      # Discards test data
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres       # Preserves development data
docker compose --env-file .env.compose --file compose.yaml --profile '*' down --remove-orphans --timeout 10           # Stops project; preserves named volumes
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
./scripts/database.sh reset test --confirm storage-minis-beijing
./scripts/database.sh reset dev --confirm storage-minis-beijing
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
./scripts/tooling.sh run-db test pnpm db:check
./scripts/tooling.sh run-db test pnpm test:db
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
processes enforce a final exit deadline and handle SIGINT/SIGTERM. Commands log
the actual error message, nested causes and driver codes, with password and
connection-URL credential redaction. Library errors retain their causes; future
API code still owns safe translation of errors. Production pool, TLS and role
policies remain T04 decisions.

The build emits ESM JavaScript and declarations to `packages/db/dist/`. Package
exports resolve `@storage-minis/db` through `dist/index.js` / `dist/index.d.ts`.
Build before direct package typechecks or typed lint; root `pnpm check` and
`pnpm typecheck` arrange the dependency automatically. Step 4 must add the actual
API workspace dependency and use these compiled exports, not source aliases.

### Schema generation and migration application

The owner approved S01–S10 on 2026-10-25. The compiled package exports `schema`
from `src/schema/index.ts`; SQL/snapshots/journal live in `packages/db/drizzle/`
and applied history lives in `drizzle.__drizzle_migrations`. See the
[schema reconciliation and deferred writer contracts](../database/step-3b-implementation-2026-10-25.md).

```sh
# Offline comparison/generation; review every changed artifact:
./scripts/tooling.sh run pnpm db:generate
./scripts/tooling.sh run pnpm db:generate -- --name describe_change
# Explicit pending migration application after first setup/review:
pnpm docker:migrate
# Disposable test target only:
./scripts/tooling.sh run-db test pnpm db:migrate
```

Commands remain uncached and separate. Startup applies no migrations; preserved
volumes keep both schema and history after a restart. Application skips committed
history already applied and validates local component credentials. Missing/empty
artifacts fail before connecting. The native Drizzle ORM runner receives 5s lock /
30s statement / 30s idle-in-transaction limits and a 2s connection limit; its supervisor
allows 120s, forwards signals and forces termination after 5s. On failure, the
wrapper logs actual messages, nested PostgreSQL causes and error codes with
password redaction. Application calls the installed
`drizzle-orm/node-postgres/migrator` directly in a supervised child process,
preserving native SQL/journal/history and transactions. The owner approved this
on 2026-10-25 because Kit 0.31.11's progress renderer discards migration errors.
Generation still uses Kit. The Doppler launcher forwards the command's stderr
while suppressing only Doppler's own fetch diagnostics.
Inspect history after interruption before retrying. Use these wrappers for
supervision; raw CLI or runner use bypasses the process bounds.

The wrapper fixes its working directory to the DB package and uses relative
`./drizzle` output for pinned Kit snapshot compatibility. It rejects generation
without the native success marker because Kit can catch an exception and exit
zero. Generation needs no DB/Doppler. No `push`, startup migration, seed, production
target or automatic down migration is supplied. Commit SQL/snapshots/journal
together; preserve applied history and make subsequent corrections with forward
migrations. The custom immutable base36 function is owned by the base SQL.

### Database integration tests

`pnpm test:db` dispatches `test:integration`, requires the exact test tuple, and
runs uncached. Individual tests have a 30s limit; the suite supervisor allows
120s, then terminates its process group, with a 10s forced-cleanup bound. Tests
exercise real PostgreSQL queries, transaction rollback, timeouts, wrong-password
failure, idle disconnection/recovery, bounded shutdown, normal ESM consumption
and signal cleanup. Schema tests reset disposable test schemas, apply the full
chain and check catalog coverage, repeat application, full-chain rollback,
generated identities, amount/date boundaries, scope/party rejection, typed audit
survival and real concurrent unique-index races. Fixtures are cleaned afterward.
These fixture SQL operations do not implement business writers. Unit launcher tests
use temporary CLI fixtures; they are not real Doppler authentication evidence.

The development target is rejected before an integration payload starts. Test
cleanup never drops development storage. Stop the test service when finished;
its tmpfs is discarded. Aggregate reconciliation, permanent locks, authorized
transitions, typed snapshot contracts and actual deletion-versus-funding races
remain T01/T06 business-operation acceptance work.

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
