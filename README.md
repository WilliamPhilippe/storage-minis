# storage-minis-be

## Local setup

Use the [Docker tooling workflow](#docker-tooling) for dependency installation and
checks. It retains the pinned runtime and isolates Linux dependencies from host
copies. The following host setup is the earlier approved alternative; existing
host installations remain usable. Host Node/pnpm are not required by Docker.

The first bootstrap step establishes a private pnpm workspace. The exact Node.js
version is pinned in [.nvmrc](.nvmrc) and the Node.js/pnpm requirements in
[package.json](package.json). Use Node.js 24.22.1 LTS and pnpm 12.15.0.

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
  db/package.json      # @storage-minis/db; future Drizzle connection/schema/migrations
  db/tsconfig.json
  db/vitest.config.mts
```

Dependencies are saved with exact versions, and installs enforce engine
compatibility. Development tools are installed at the root for use from a full
workspace checkout. Turborepo 2.11.10 schedules and caches the existing checks.
Application dependencies, build/dev/migration commands, PostgreSQL, and the React
frontend belong to subsequent setup steps. Docker Compose currently provides
only the tooling runner.
This workspace setup is partial progress toward [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26);
its remaining prerequisites and acceptance criteria still apply.

## Docker tooling

Step 1 uses Docker Desktop's existing Linux engine and Compose. The image is
based on the Docker Official Image `node:24.22.1-bookworm-slim`, pinned by digest
in [Dockerfile.tooling](docker/Dockerfile.tooling), with pnpm 12.15.0. Docker is
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
`./scripts/tooling.sh run`. Normal `pnpm test` and `pnpm check` still fail with
"No test files found"; `pnpm test --passWithNoTests` is runner-loading evidence
only. Use the same prefix for the documented Turbo dry runs and cache probes.

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
credentials to the checkout. Test/production mapping and DB variables are later
steps. Credential state stays in the dedicated host directory, separate from
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

`./scripts/tooling.sh down` stops the selected project's resources and preserves
all five volumes. There is no background tooling container after a finished
command. To discard **all tooling dependencies and caches for one checkout**, use
the separate destructive command below from its repository root. Confirm the
project name first; subsequent use needs init and frozen install again.

```sh
docker compose --env-file /dev/null --file compose.yaml \
  --project-directory "$PWD" --project-name "$COMPOSE_PROJECT_NAME" \
  --profile tools down --volumes
```

Never use global pruning for checkout cleanup. Step 1 adds no database volumes.
See the [approval and verification record](docs/technical/technical-direction.md#step-1-docker-tooling-2026-10-24)
for actual evidence and remaining limits.

## Development checks

Run these commands from the repository root with the pinned toolchain active:

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | Check root tooling and both packages concurrently through Turborepo |
| `pnpm check` | Run cached typechecks, lint, formatting check, and unit tests through Turborepo |
| `pnpm lint` | Check JavaScript/TypeScript with ESLint; warnings fail |
| `pnpm lint:fix` | Apply ESLint automatic fixes |
| `pnpm format:check` | Check formatting of supported source/configuration files |
| `pnpm format` | Rewrite those files with Prettier |
| `pnpm test` | Run the API and DB unit-test projects once |
| `pnpm test:watch` | Watch unit tests during development |

The [approved tooling decisions](docs/technical/technical-direction.md#tooling-setup-decisions-2026-10-23)
and [Turborepo setup decisions](docs/technical/technical-direction.md#turborepo-setup-decisions-2026-10-23)
record versions, settings, rationale, and scope. TypeScript's shared base carries
correctness checks; the Node profile adds Node globals and NodeNext resolution.
Use explicit type-only imports and `.js` extensions for relative imports in
application `.ts` files. The future React application will need a browser profile.

ESLint uses type information for TypeScript source, tests, and configuration.
An intentionally unused parameter may start with `_`; unused locals remain
errors. Prettier runs separately and checks root tooling plus supported files
under `apps` and `packages`. Existing specifications, DBML, the generated lockfile,
and workspace scratch files are outside the formatter command scope.

Unit tests belong alongside source as `src/**/*.test.ts`. Import `test`, `expect`,
and other APIs from `vitest`; test globals are disabled. The Node projects are
named `api-unit` and `db-unit`. For a focused run:

```sh
pnpm test --project api-unit
pnpm test --project db-unit
```

There are no application source files or permanent tests yet. Consequently,
`pnpm typecheck` currently checks tooling configuration, and `pnpm test` exits
with code 1 and "No test files found". The explicit bootstrap command
`pnpm test --passWithNoTests` verifies runner configuration loading only; it is
not application-test evidence. Keep the normal command strict when adding tests.

Files named `*.integration.test.ts` are excluded from these unit projects.
Real-PostgreSQL integration setup, isolation/reset mechanics, Playwright browser
workflows, coverage reporting/thresholds, and CI remain future work. PostgreSQL
tests must demonstrate rollback, constraints, and concurrent operations when the
persistence foundation is implemented. Vitest execution does not replace
`pnpm typecheck`.

### Turborepo checks and cache

Use the repository's pinned Turbo through pnpm. `pnpm typecheck` schedules the
two package typechecks and the real root `typecheck:root` script. `pnpm check`
adds the existing root lint, formatting check, and Vitest scripts. It currently
exits 1 because there are no test files; successful tooling checks do not make
the application suite complete.

The standalone lint, formatting, and test commands still run their tools directly.
`pnpm lint:fix`, `pnpm format`, and `pnpm test:watch` also run directly. To inspect
the six executable tasks without running them:

```sh
pnpm exec turbo --version
pnpm check --dry=json
```

To verify cache reuse for the five checks that can pass in the current checkout:

```sh
pnpm exec turbo run typecheck typecheck:root lint format:check --force --summarize
pnpm exec turbo run typecheck typecheck:root lint format:check --summarize
```

The first command executes every selected task and writes successful results.
The unchanged second run should report five cache hits. Summaries in
`.turbo/runs/` record task hashes, inputs, and cache status. Use `--force` on a
Turbo command when a fresh execution is needed.

The explicit `.turbo/cache` directory keeps the cache inside each worktree;
remote caching is disabled. All current tasks cache successful logs with no
declared file outputs. Default inputs cover each package's files and, for root
tasks, repository files including both workspaces. Shared tooling configuration
changes invalidate every task. Documentation edits can also invalidate root
checks because their inputs deliberately remain broad.

Turbo uses strict environment filtering. Unit-test cache hashes include
`NODE_ENV` and `TZ`; application environment injection is not configured yet.
The owner selected [Doppler for environment variables](docs/technical/technical-direction.md#environment-configuration--doppler-2026-10-24).
Step 1 implements the allowlisted host-to-Compose verification path above.
Application injection and task-scoped environment declarations remain later work.

The Turbo bootstrap runner check is separate from the aggregate command:

```sh
pnpm exec turbo run test -- --passWithNoTests
```

This verifies runner loading only. A cached bootstrap run does not change the
normal empty-suite failure. See the [Turborepo decision record](docs/technical/technical-direction.md#turborepo-setup-decisions-2026-10-23)
for dependency, persistent-task, and future database-task boundaries.

## Agent guidance

See [AGENTS.md](AGENTS.md) for repository context, current requirements, validation guidance, and decisions still needed before implementation.

Agents must recommend an option and obtain the owner's explicit approval before
making any new or changed technical or implementation decision. This includes
tools, packages, versions, CLIs, architecture, and local environment changes; the
[approval workflow](AGENTS.md#owner-approval-before-decisions) defines the process.

## Documentation

- [Requirements specification v0.7 — read with approved update logs](docs/requirements/requirements-v0.7.md)
- [Entity and relationship map v0.8 — current](docs/entities/entity-map-v0.8.md)
- [Database schema — visual DBML draft 1](docs/database/schema.dbml)
- [Database design — entity mapping, proposals, and open decisions](docs/database/design.md)
- [Requirement update logs — approved decisions and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership and backlog v0.7](docs/requirements/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md)
- [Technical direction — accepted stack, authentication, and date choices](docs/technical/technical-direction.md)
- [Technical foundation implementation guide — agent steps, planning and expected results](docs/technical/technical-foundation-implementation-guide.md)
- [Step 1 Docker tooling implementation plan — approved scope and handoff (2026-10-24)](docs/plans/step-1-tooling-plan-2026-10-24.md)
- [T06 foundation proposal — pending owner approval (2026-10-24)](docs/technical/t06-foundation-proposal-2026-10-24.md)
- [Technical direction review — documentation and backlog propagation](docs/technical/technical-direction-review.md)

Keep this index linked only to the latest published version of each document. Versioned documents preserve change records and references to earlier versions. Read approved requirement update logs alongside published documents; explicit later decisions supersede conflicting wording.

The [2026-10-23 DBML review](docs/requirement-updates/2026-10-23-dbml-review.md) records later field/role/import decisions and confirmed follow-up answers. Apply it to covered topics while reviewing the draft, followed by the [index/candidate follow-up](docs/requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) and [partial-payment clarification](docs/requirement-updates/2026-10-23-partial-expense-payments.md).

The current entity map incorporates the owner-approved [2026-10-22 schema review](docs/requirement-updates/2026-10-22-schema-review.md). Its [change record](docs/entities/entity-map-v0.8.md#16-v07--v08-comparison-and-publication-record) identifies the changed relationships and remaining work. The [issue propagation record](docs/requirement-updates/2026-10-22-issue-propagation.md) maps the completed live requirements/acceptance-criteria updates. The requirements specification, ownership index, and DBML/design guide still await consolidation with those decisions.
