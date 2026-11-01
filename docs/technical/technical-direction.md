# Technical direction

**Owner approval date:** 2026-10-21. **Status:** accepted choices with remaining design work explicitly listed below. Current implementation: Steps 1–4 are complete (Step 4 with all eighteen criteria, evidence on PR #107), and the [foundation restructure](#foundation-restructure-2026-10-31) of 2026-10-31 (PR #110) replaced their tooling container and Doppler launchers with host Node, standard Compose, committed local values, owner/app database roles, a regenerated migration baseline and a parity stack. Steps 5/6 and full T06/business/production acceptance remain pending.

This records the owner's stack and technical-policy decisions from the development-stack discussion, including the follow-up confirmation of active-use token refresh, explicit logout, the administrator email, and UTC reporting. It supplements the current [v0.8 requirements](../requirements/requirements-v0.8.md), [entity map v0.9](../entities/entity-map-v0.9.md), and [ownership index](../requirements/requirements-coverage-v0.8.md). It does not replace the business baseline or close delivery issues. Those documents, the [approved updates](../requirement-updates/README.md) and the [PurchaseExpense impact](../requirements/purchase-expense-impact-v0.7.md) govern domain invariants.

## Workspace bootstrap progress (2026-10-23)

The owner authorized the first setup step: a private pnpm workspace, lockfile,
pinned Node.js/pnpm versions, and initial `apps/api` (Fastify/tRPC) and
`packages/db` (Drizzle connection, schema, migrations) package directories. The
toolchain pins are recorded in the root `package.json` and `.nvmrc`; verified
installation commands and current scope are in [local setup](../../README.md#local-setup).
Node.js 24 LTS is the selected runtime line, with an exact patch pinned for
repeatable setup. The workspace uses one shared lockfile and exact versions for
future dependency additions.

Node.js version management is a local tooling choice. fnm was used for the
initial setup because Homebrew was available; both fnm and nvm can read the
repository's `.nvmrc`. The pinned Node.js/pnpm versions are required, while fnm
is optional. See [local setup](../../README.md#local-setup) for both workflows and
their validation status.

This is partial T06 setup progress. The later tooling and Turborepo steps are
recorded below. Application code, framework dependencies, Docker Compose, and
frontend scaffolding remain later steps. T01/T02/T04 prerequisites and the
remaining T06 acceptance evidence still apply; this step does not close any
delivery or decision issue.

## Tooling setup decisions (2026-10-23)

**Owner approval:** On 2026-10-23, the owner approved all recommendations P01–P11
from the tooling setup proposal and explicitly authorized implementation. The
accepted outcomes below preserve that proposal's scope and rationale. This is a
second partial T06 bootstrap step for the existing API and DB packages.

| Proposal | Accepted outcome and rationale |
| --- | --- |
| P01 — Scope | Configure strict TypeScript, ESLint, Prettier, and Vitest for existing packages. Keep frontend scaffolding, Turborepo configuration, application frameworks, PostgreSQL provisioning, builds, migrations, CI, editor setup, and hooks as later decisions. This keeps tooling independent of unresolved application contracts. |
| P02 — Ownership | Root development-tool dependencies and shared configuration, with small per-package TypeScript/Vitest files. This avoids duplicate policy or premature configuration packages; checks assume a full workspace checkout. |
| P03 — Versions | Exact pins below, with the existing shared-lockfile policy. Select TypeScript 6.0.3 because the approved typescript-eslint release supports TypeScript below 6.1; add Vite as Vitest's required peer. Node types follow the Node 24 runtime line. |
| P04 — TypeScript | `strict` plus checked indexed access, exact optional properties, override/return/fallthrough checks, consistent file casing, explicit module syntax, isolated modules, no emit, and dependency declaration checking. Keep ambient types empty in the base. ESLint owns unused-variable checks. These safeguards apply to source, tests, and TS configuration. |
| P05 — Modules | ESM in all three manifests; NodeNext module/resolution, ES2024 target/library, and Node types in the Node profile. Use `.js` relative imports in application `.ts` files, `.mjs` for ESLint, and `.mts` for Vitest configurations. This models Node resolution; the frontend will need its own browser profile. Build output, aliases, exports, project references, and runtime runners remain later work. |
| P06 — ESLint | Root flat configuration with JavaScript recommended rules and TypeScript `recommendedTypeChecked`, using `projectService`. Allow `_`-prefixed intentionally unused parameters, retain unused-local errors, and fail on warnings. Apply type-aware rules to tests/configuration too; put the Prettier compatibility config last. The recommended preset avoids the broader opinionated strict preset. |
| P07 — Formatting | Prettier independently handles formatting: two spaces, no tabs, semicolons, double quotes, all trailing commas, width 80, always-parenthesized arrow arguments, LF, and preserved prose wrapping. Check supported root tooling and application/package source/configuration; exclude generated files and historical specifications. This avoids unrelated baseline reformatting. |
| P08 — Tests | Root `test.projects` discovery with `api-unit` and `db-unit` package configurations. Node environment, explicit Vitest imports, colocated `src/**/*.test.ts`, and integration-file exclusion. Clear/restore mocks, isolate test files, disable retries, and run TypeScript separately. Each project declares its settings explicitly. Future persistence evidence requires real PostgreSQL. |
| P09 — Empty suites | Keep normal tests failing when no tests exist. An explicit `--passWithNoTests` is only a bootstrap runner check. Typecheck the configuration files while source is absent; avoid permanent dummy application tests. This makes missing test discovery visible. |
| P10 — Coverage | Defer the coverage provider, source selection, and thresholds until meaningful application tests exist. A coverage percentage on scaffold files would not establish business correctness. |
| P11 — Commands/evidence | Root typecheck, lint/fix, format/check, and test/watch scripts use pnpm directly pending Turborepo configuration. Verify both successful and erroneous temporary fixtures, remove them afterward, and document actual command results. T06 stays open pending its application and persistence acceptance evidence. |

Approved root development dependencies:

| Package | Exact version |
| --- | --- |
| `typescript` | `6.0.3` |
| `@types/node` | `24.19.2` |
| `eslint` | `10.13.0` |
| `@eslint/js` | `10.0.1` |
| `typescript-eslint` | `8.72.0` |
| `globals` | `17.13.0` |
| `eslint-config-prettier` | `10.1.8` |
| `prettier` | `3.9.10` |
| `vitest` | `5.0.5` |
| `vite` | `8.3.5` |

The exact configurations live in [the shared TypeScript base](../../tsconfig.base.json),
[the Node profile](../../tsconfig.node.json), [ESLint](../../eslint.config.mjs),
[Prettier](../../.prettierrc.json), and [Vitest project discovery](../../vitest.config.mts).
The [root manifest](../../package.json) and shared lockfile record installed versions.
See [checks](../../README.md#checks) for command usage and
current empty-suite limitations.

Examples: reading `items[index]` requires handling an absent value; an optional
`name?: string` field may be omitted but cannot explicitly contain `undefined`
unless its type allows that. A dropped Promise is a lint error. Unit tests import
their assertions explicitly, and `*.integration.test.ts` files await dedicated
real-database projects rather than joining the unit run.

These compile/lint rules do not enforce monetary limits, authorization, or
transaction atomicity. T01/T02/T04 prerequisites and the rest of T06 remain open.

**Implementation verification (2026-10-23):** On macOS arm64 with Node 24.22.1
and pnpm 12.15.0, the exact dependencies installed successfully;
`pnpm install --frozen-lockfile`, workspace package discovery, `pnpm typecheck`,
`pnpm lint`, `pnpm lint:fix`, `pnpm format:check`, and `pnpm format` were verified.
Typecheck currently checks configuration files. Temporary fixtures confirmed
valid inputs pass, both packages reject unchecked lookups and invalid optional
fields, typed linting rejects unhandled promises, and formatting detects/repairs
style differences. Both Vitest projects discovered passing unit tests, excluded
integration fixtures, supported focused selection, and propagated deliberate
assertion failures. All temporary fixtures were removed afterward.

The final empty repository suite makes `pnpm test` exit 1 as approved.
`pnpm test --passWithNoTests` loads both project configurations and exits 0;
`pnpm test:watch --passWithNoTests` enters watch mode and accepts the quit command.
These are tooling checks, not application/persistence acceptance evidence.
Changed documentation links, anchors, Markdown fences/tables, and
`git diff --check` were also checked.

## Turborepo setup decisions (2026-10-23)

**Owner approval:** On 2026-10-23, the owner approved the Turborepo boilerplate
proposal with "Implement it" and requested adherence to Turborepo documentation
and recommendations. This authorizes the exact dependency, scripts, task/cache
configuration, validation, and documentation below. It extends the earlier
tooling setup's command orchestration while preserving its checking rules,
centralized tooling, and strict empty-suite behavior.

| Area | Approved outcome and rationale |
| --- | --- |
| Dependency | Pin `turbo` 2.11.10 as a root development dependency through pnpm and commit its generated lockfile changes. Keep Node.js 24.22.1 and pnpm 12.15.0. Repository installation provides one reproducible Turbo version without a global CLI or additional tooling packages. |
| Task ownership | Retain the package `typecheck` scripts. Extract the existing root TypeScript invocation into `typecheck:root`; `pnpm typecheck` schedules all three. Register the existing repository-wide lint, formatting check, and Vitest scripts as root tasks, preserving direct standalone commands and Vitest project selection. |
| Aggregate command | `pnpm check` schedules all six executable checks. Register only their real leaf scripts; orchestration scripts are outside root-task registration to avoid recursion. Normal tests and the aggregate command continue failing while tests are absent. |
| Dependencies | Omit `dependsOn` because the current package manifests declare no workspace dependencies and checks need no generated artifacts. Run independent checks concurrently. Revisit dependency hashes and ordering when real shared imports, package links, builds, or generated files are introduced. |
| Cache inputs | Retain default package/root inputs and include the shared configuration listed in `turbo.json` in every task hash. This conservatively covers workspace files consumed by root tools and root TypeScript settings consumed by packages. Root documentation edits may rerun root checks; narrower globs would require maintaining another copy of each tool's scope. |
| Cache outputs | Cache successful checks with `outputs: []`; current checks need only successful logs, with no build artifacts to restore. Failed tasks are never accepted as cached success. Coverage and build outputs await their real commands. |
| Cache location | Explicit `.turbo/cache` keeps the local cache within each worktree. Disable remote cache operations. Automatic local sharing across worktrees is available upstream but is outside this setup; existing Git/lint/formatter exclusions already cover Turbo artifacts. |
| Environment | Use strict filtering. Include `NODE_ENV` and `TZ` in unit-test hashes. Current checks need no application secrets or database variables. Declare additional result-affecting variables per task when introduced; pass-through values are unhashed, and tasks loading ignored `.env` files must declare those files as inputs. |
| Mutating and persistent work | Retain direct `lint:fix`, `format`, and `test:watch` commands. Future persistent tasks should use `cache: false` and `persistent: true`, outside finite task prerequisites. Future database mutations and, initially, real-database integration tests should be uncached because source hashes do not capture live database state. Concrete future tasks remain separate implementation decisions. |

The exact configuration is [turbo.json](../../turbo.json); command usage and the
cache demonstration live in the [Turborepo cache reference](local-development.md#turborepo-tasks-and-cache).
This adopts the documented [incremental installation](https://turborepo.dev/docs/getting-started/add-to-existing-repository),
[root tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks#registering-root-tasks),
[configuration](https://turborepo.dev/docs/reference/configuration),
[environment handling](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables),
and [worktree-cache behavior](https://turborepo.dev/docs/crafting-your-repository/caching#git-worktree-cache-sharing).
The [support policy](https://turborepo.dev/docs/support-policy) lists pnpm 8+ as
stable and describes core Turbo as independent of the active Node.js version.
The [2.11.10 release](https://github.com/vercel/turborepo/releases/tag/v2.11.10)
was the verified stable version at approval; its
[lockfile parser](https://github.com/vercel/turborepo/blob/v2.11.10/crates/turborepo-lockfiles/src/pnpm/data.rs)
supports this repository's multi-document pnpm lockfile format.

**Implementation verification (2026-10-23):** On macOS arm64 with Node.js
24.22.1 and pnpm 12.15.0, the frozen install and workspace discovery passed;
`pnpm exec turbo --version` reported 2.11.10. `pnpm check --dry=json` discovered
exactly six executable tasks, no dependency edges or recursive commands, and
strict environment handling. Turbo reported remote caching disabled and used
this worktree's `.turbo/cache` and `.turbo/runs` directories.

The documented forced run of typecheck, root typecheck, lint, and formatting
check completed five successful tasks; the unchanged second run reused all five
cache entries. `pnpm typecheck` also passed. Temporary shared-configuration edits
changed all six task hashes; an API-configuration edit changed API/root hashes
while preserving the DB typecheck hash. Changing `NODE_ENV` or `TZ` affected only
the unit-test task hash; an unrelated environment variable affected none.

A temporary TypeScript assignment error made `pnpm typecheck` fail with exit 2
on consecutive runs, with the invalid API task executed again each time. All
temporary configuration edits were restored byte for byte. Explicit
`--passWithNoTests` runner checks passed for both projects individually and
together. The Turbo bootstrap runner check passed and reused its own cache, but
ordinary Turbo tests still executed and failed on repeated runs. Normal
`pnpm test` and `pnpm check` exited 1 because tests remain absent. No permanent
test fixtures were added.

Documentation links, anchors, fences/tables, and `git diff --check` were checked.
These results establish tooling behavior only. T06 and its T01/T02/T04
prerequisites remain open; application, database, deployment, remote-cache, and CI
implementation evidence remains pending.

## Environment configuration — Doppler (2026-10-24)

**Partly superseded (2026-10-31):** The provider choice stands. Local
development and tests use committed values and no Doppler (R3/R8/R12); the VPS
uses a `prd` service token (A3). The wrapped, checkout-scoped launch path is
removed. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner decision:** Use Doppler to manage environment variables. This selects the
provider and supersedes the foundation proposal's copied-local-`.env` and native
env-file-loading approach. Application/CLI code receives environment values and
validates them at explicit entry points. This original provider decision is
implemented only for the [Step 1 verification path](#step-1-docker-tooling-2026-10-24); application integration remains pending.
An example file may document variable names; it is not a copied secret store or
automatic runtime fallback.

The Docker-first preference still applies. The Step 1 agent must research and
propose exact Doppler CLI/image pins and an authenticated launch path supplying
both host Compose interpolation and container processes. A CLI running only in
the Node container does not supply PostgreSQL initialization or host project/port
settings to Compose. Prefer containerized tooling; explain a necessary host
installation before requesting approval.

Actual Doppler project/config identifiers, development/test/production mapping,
credential bootstrap and access scope, injection placement, precedence for
checkout-specific nonsecret values, rotation/restart behavior and offline/fallback
policy remain decisions for the applicable step and T04. The provider selection
does not approve those details. Tests and development retain separate database
targets. Routine builds and DB-free checks stay independent of live secrets;
application secrets stay out of image layers, committed files and test/cache
artifacts.

Doppler documents [process environment injection](https://docs.doppler.com/docs/cli),
[Compose integration](https://docs.doppler.com/docs/docker-compose) and
[container runtime injection](https://docs.doppler.com/docs/dockerfile). Its CLI
also has [encrypted fallback behavior](https://docs.doppler.com/docs/automatic-fallbacks)
that must be addressed explicitly rather than treated as an approved offline
policy. No Doppler installation, credentials, project creation or account changes
were made when recording this decision.

## Local tooling preference (2026-10-24)

**Superseded (2026-10-31) by A4:** Node.js and pnpm run on the host with the
pinned versions; only PostgreSQL runs in containers during development. See
[Foundation restructure](#foundation-restructure-2026-10-31).

**Owner instruction:** Prefer Docker images for tools and supporting services
where practical, avoiding direct machine installations. A tool may run on the
host when it needs host access; explain that need and obtain approval before
installing it. Tell the owner about required apps before attempting installation
or an alternative setup. The owner installed Docker Desktop 4.96.3 (244472),
verified on 2026-10-24 with Engine/client 29.9.2, Compose 5.6.1 and a reachable
Linux arm64 daemon in `desktop-linux`. The current agent shell does not find
`docker` on PATH; the installed `~/.docker/bin/docker` and bundled CLI work by
explicit path, without shell-profile changes. No image was pulled or container
started during verification.

This preference does not remove the approved Node.js/pnpm pins, root dependency
ownership or existing tooling. The foundation proposal now recommends running
new development commands in a pinned Node tooling container, including workspace
dependency installation, Drizzle Kit, API development, builds and tests. Those
concrete execution changes remain pending approval, as do the other proposal
items. No host tooling replacement or application setup is authorized by this
record.

## Step 1 Docker tooling (2026-10-24)

**Superseded (2026-10-31):** A4 removes the tooling image, its five
dependency volumes, the launcher and the wrapped Doppler path. The decisions
and evidence below are historical. See
[Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly requested implementation of the
[Step 1 plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-1-tooling-plan-2026-10-24.md), preferred Docker Official
Images, confirmed the application/package/tooling name `storage-minis`, disposable
containers with persistent volumes, and accepted the documented host-editor limitation. The owner chose Doppler project
`storage-minis` with the proposed development config `dev`, and installed CLI
3.77.1 through Homebrew. This authorizes partial T06 bootstrap only; no T01/T02/T04
dependency is removed and Steps 2–6 remain separate assignments.

| Decision | Approved implementation and rationale |
| --- | --- |
| Image/runtime | Docker Official Image `node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205`; npm provisions pnpm 12.15.0 and clears its cache. Only `docker/` enters the build context; dependencies install afterward from the existing lockfile. Debian avoids a libc change. |
| Execution | Profile `tools`, disposable Compose commands, explicit unique `COMPOSE_PROJECT_NAME` (`storage-minis-beijing` here), no ports or DB dependency. Commands run as `node` 1000:1000. Reviewable generated files stay on the bind mount. |
| Storage | Five project-scoped named volumes for root/API/DB dependencies, pnpm store and Turbo; all use `nocopy`. A root-only initializer has no checkout mount and changes mount-root ownership only. Normal down preserves volumes. |
| Host orchestration | Bash launcher locates this checkout and the existing Docker CLI, preserves Docker host context, ignores `.env`/ambient Compose env-file selection, and propagates payload exits. TERM/INT traps signal only the invocation's named container; testing showed attached Compose alone leaves it running. No host shell/profile change. |
| Doppler | Host CLI 3.77.1 supplies values before Compose. The owner's Homebrew path uses `TOOLING_DOPPLER_BIN=/opt/homebrew/bin/doppler`; exact version checking rejects upgrades. Standalone release/checksum installation remains documented. Browser auth uses a dedicated host config directory and checkout scope, with explicit project/config on each fetch. |
| Injection/fallback | Only `FOUNDATION_TOOLING_PROBE` is fetched; validate on host, pass by name to direct container Node. Managed values win; ambient service tokens are rejected. No secret fallback reads/writes, no credentials in Node/image/cache, no global Turbo pass-through. Requests time out in 10 seconds with one attempt. |
| CLI compatibility | CLI 3.77.1's actual help has no proposed `--no-interactive` flag. Verification instead closes stdin, with browser login performed separately; this implements the approved noninteractive launch intent. Parent credential directories must be created before `doppler login`. |
| Editor/Git | Preserve host dependencies. Host editor diagnostics cannot see Docker volumes; additional editor setup remains separate. Git stays on host; container Turbo uses filesystem hashing. Git-history filters are outside this runner's contract. |

**Infrastructure verification on macOS arm64 / Docker Desktop:** Engine/client
29.9.2, Compose 5.6.1, `desktop-linux`. Local built tooling image manifest digest
`sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`
(build under the owner-corrected name; not a published image). Build/runtime
probes confirmed Node `v24.22.1`, pnpm `12.15.0`, UID/GID 1000:1000 and effective
store `/pnpm/store/v11`. No Git executable was installed.

| Scenario | Observed evidence |
| --- | --- |
| Build/install/discovery | Official image build passed; frozen install passed in primary and fresh secondary projects, with root/API/DB discovered and byte-identical lockfile. Each network-heavy attempt had a 600-second bound. |
| Checks | `pnpm typecheck`, `pnpm lint`, `pnpm format:check` passed. Ordinary `pnpm test` and `pnpm check` failed with exit 1 / no test files. Explicit `pnpm test --passWithNoTests` passed for runner loading only. |
| Turbo | Six executable tasks in dry JSON; five successful tasks forced, then five cache hits. Ignored `.context`/dependency changes preserved hashes. A temporary API tsconfig edit invalidated the API and root tasks while DB stayed unchanged; restoring bytes restored hashes. |
| Host/checkout isolation | Unique host sentinel files in all dependency/cache trees remained unchanged and invisible inside tooling. All five primary/secondary volume markers stayed separate. Node wrote volume roots and checkout output; output survived exit and was host-editable. |
| Watch/signals/exits | Directory watching observed both ordinary edit and atomic-save events within ten seconds. TERM/INT reached Node and exited within ten seconds after launcher forwarding was added. A child exit of 37 propagated as 37. |
| Reproduction/lifecycle | Fresh secondary build → init → frozen install → typecheck → down passed. Named volume inspection confirmed survival after down; only secondary project's volumes/network/image tag were removed. Primary dependencies survived down and a new container. |
| Doppler | Real `storage-minis` / `dev` launch passed both host/container assertions. Conflicting ambient marker and temporary `.env` were overridden/ignored. Invalid project/config, empty login state, failed API connection and ambient token all failed before payload. A direct CLI missing-allowlisted-key check failed without starting its payload. Dedicated credential-directory file inventory was unchanged: no fallback files created. Ordinary tooling received no Doppler variables. |

These are tooling checks, not application, persistence, authorization or business
acceptance. No schema, PostgreSQL, new workspace dependency/task, dummy test,
frontend, CI or production configuration is introduced. Setup and variable
inventory live in [historical README](https://github.com/WilliamPhilippe/storage-minis/blob/3f1ae6c8c105a56663d002e06f97f7843c57880c/README.md#docker-tooling). The dedicated host credential directory has mode 700; browser login completed
with scope set to this absolute checkout. The Homebrew CLI was exercised; the
standalone checksum installer is documented but was not executed. Probe files
and secondary resources were removed, and only the renamed primary tooling
volumes/image remain. [PR #103](https://github.com/WilliamPhilippe/storage-minis/pull/103)
contains the Step 1 handoff and was merged on 2026-10-24 as
`17771994adef99e6f575385266970d472c65b8b0`. T06 stays open.

## Step 2 local PostgreSQL planning (2026-10-24)

**Partly superseded (2026-10-31):** The separate development and test
services, the digest-pinned image, loopback-only ports, UTC, the persistent
development volume and the test tmpfs remain (R4). Superuser-only access,
Doppler-held passwords, `scripts/database.sh` and its SQL client container are
replaced by the D2/D3 roles, committed local values (R3/R8) and `db:*` package
scripts. The evidence below is historical. See
[Foundation restructure](#foundation-restructure-2026-10-31).

**Owner-approved scope:** PostgreSQL runs separately from the tooling container,
with Compose definitions delivered in Step 2. The existing DBML is not applied;
Drizzle schema and migrations remain later work. New required PostgreSQL
environment variables must be added by the owner before implementation starts.

During planning, the owner approved the `postgres` superuser in both local
development and test containers, different passwords, databases
`storage_minis_dev` / `storage_minis_test`, and both credential sets in the
existing Doppler `storage-minis` / `dev` config. This keeps local setup small
while separate servers/storage isolate test data. Separate application/migration
roles and production privilege policy remain T04 work.

The owner confirmed adding `POSTGRES_PASSWORD` and `POSTGRES_TEST_PASSWORD`
to that config on 2026-10-24. Secret values were not fetched during planning;
successful injection remains to be verified during implementation.

**Implementation approval:** On 2026-10-24, the owner approved the concrete
[Step 2 implementation plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-2-postgresql-plan-2026-10-24.md) with
“Approved. Implement it”. This authorizes its exact image pin, optional Compose
file, loopback ports, persistent development/disposable test storage, scoped host
Doppler launcher, SQL utilities, readiness/reset commands and verification.
No schema, application dependency or later foundation step is authorized.

The first secret-free content comparison confirmed both keys exist but hold
equal values. The owner was asked to change the test password before primary
database initialization, preserving the approved separate-password setup.
No secret value was displayed. The owner changed the test password, and a second
comparison verified that both keys exist and differ before primary initialization.

**Implemented outcome:** `compose.postgres.yaml` provides separate `postgres`,
`postgres_test` and disposable `postgres-client` services using
`postgres:18.6-bookworm@sha256:bbf83594798e144bff365a9c191c5d779f181fb3135902064ab8ff11918020fc`.
Pulled image inspection confirms Linux arm64. Development uses the project-scoped
`pgdata` volume; test uses a separate 512 MiB tmpfs. Both servers set UTC and SCRAM
host authentication. Defaults publish loopback ports 5433/5434.

`scripts/database.sh` implements the approved target-specific host Doppler
injection, explicit project/config/files, ambient-value clearing, SQL identity
checks, lifecycle commands and separately confirmed resets. The 60-second startup
deadline excludes explicit image pull; SQL checks have a 15-second outer deadline
and five-second connection/statement timeouts. SQL client cancellation also
removes its uniquely named container and anonymous image volume. The image's
declared anonymous client volume is transient and removed with `run --rm`; no
development volume is mounted by the client. Ordinary SQL commands are
noninteractive and have no global statement timeout.

### Step 2 verification evidence (2026-10-24)

Verified on Docker Desktop / Engine 29.9.2, Compose 5.6.1, Linux arm64. Primary
project `storage-minis-beijing` uses real Doppler `storage-minis` / `dev` values.
Disposable secondary project `storage-minis-step2-probe` used ports 5435/5436
and process-scoped CLI fixture credentials, without modifying account secrets.

| Scenario | Observed result |
| --- | --- |
| Image/start/authentication | Approved image pull completed within the 600-second bound; SQL reports 18.6. Both primary services reached health within 60 seconds and passed real password-authenticated role/database/UTC checks from the separate client service. |
| Host access and target separation | Both bindings inspected as exactly `127.0.0.1:5433/5434`. SQL through Desktop's `host.docker.internal` reached each intended database. Development credentials were rejected by the test server. The host-route probe is Docker Desktop-specific. |
| Persistent development / disposable tests | Empty probe schemas survived development stop/start and down/up in primary and secondary projects. Test schemas disappeared after test stop/start while development schemas remained. No business table was created. |
| Workspace isolation | The same temporary schema name existed independently in both projects; dropping it from the secondary did not affect primary. Distinct project volumes/networks were verified. |
| Port collision | A fresh collision project attempting the secondary's occupied port failed without choosing another port or reaching that existing DB as a successful startup. The original schema/data remained. Collision resources were removed. |
| Credential initialization semantics | In the secondary project, recreating a retained development volume with a changed fixture initialization password left the server healthy but made authenticated startup fail. Restoring its original fixture credential restored access and preserved the schema. |
| Resets | Both secondary resets required exact project confirmation. Development reset removed only `pgdata`, preserving a live test schema and markers in all five tooling volumes. Test reset discarded only test state, preserving development. Wrong confirmation failed without changes. |
| Real Doppler failures | Empty browser-login state failed; a missing allowlisted key prevented a harmless payload; a deliberately unreachable API failed without running its payload. No account secret was changed by verification. Credential-directory file inventory was unchanged; no fallback snapshot was created. |
| Fixture failures / validation | Process-scoped CLI fixtures separately proved missing/empty keys and outage failures despite ambient password placeholders. Invalid project/config, service token, equal ports, out-of-range ports and leading-zero ports were rejected. These fixture cases are distinct from real Doppler evidence above. |
| Stale configuration | Real primary checks passed despite contradictory temporary `.env`, ambient passwords, libpq service/host/database/timezone options and Compose file selections. The temporary `.env` was removed; existing files would be restored byte for byte. |
| SQL failures, identity and deadlines | Invalid SQL returned nonzero and removed its client. A secondary database timezone override caused the identity check to reject an empty result; resetting the override restored success. A delayed client-launch fixture failed at 15 seconds. |
| Signals | TERM and INT interrupted a 60-second SQL sleep within ten seconds and removed its client container. INT uses TERM for child cancellation because asynchronous shells may inherit ignored INT, while the launcher reports exit 130. |
| Cleanup | All temporary SQL schemas, secondary/collision containers, networks and volumes were removed. Primary development storage and all primary tooling volumes remain; both primary services are available. No global prune or primary reset ran. |
| Tooling | Shell syntax and Compose validation passed. Forced container checks completed all five typecheck/root-typecheck/lint/format tasks successfully. The new Compose file passed targeted Prettier checking. Ordinary `pnpm test` still exits 1 because no test files exist. No dummy test, dependency, manifest, lockfile or Turbo task was added. |

The existing tooling-only launcher may print Compose orphan warnings while the
optional DB services run. It does not remove them; README explains using the
combined database launcher for project shutdown. Host editor dependencies and
production operation remain outside this delivery.

The primary databases contain no application tables or probe schemas. These
results establish local infrastructure, not schema correctness, Organization
authorization, atomic business transactions or concurrency invariants. Step 3
receives the service addresses, database/role/password-key mapping and lifecycle
commands documented in [README](../../README.md#local-postgresql). It must begin
from this step's merged handoff and obtain separate approval for Drizzle work.
T06 and its T01/T02/T04 prerequisites remain open.

[PR #104](https://github.com/WilliamPhilippe/storage-minis/pull/104) contains the
Step 2 implementation and handoff. Its merged status was verified on 2026-10-24
during Step 3 planning. The merge does not approve Step 3's implementation choices.

## Step 3 planning direction (2026-10-24)

**Superseded in part (2026-10-31):** Drizzle and its CLI now run on the host.
The separate dev/test configuration sources became committed local values. See [Foundation restructure](#foundation-restructure-2026-10-31).

The owner requested a [two-part Step 3 plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md):
Drizzle installation/connection tooling, followed by base migration creation from
the existing DBML. The owner explicitly approved reconciliation with current
requirements before migration generation, then approved running Drizzle and its
CLI in the existing Docker tooling container with the `pg` driver and separate
generation/application commands. Generated artifacts remain in the mounted
repository; no host Drizzle installation is needed. This reuses the existing
tooling environment and keeps migration history reviewable.

The owner subsequently created a Doppler environment named `test` and authorized
its use. Step 3 planning now separates development and test configuration sources.
The actual test config slug and key inventory still require verification; the
plan recommends retaining the existing `POSTGRES_TEST_PASSWORD` key. Both database
lifecycle and Node-tooling launchers must use the same selected test config.
Implemented Step 2 still reads both passwords from `dev`; no runtime mapping was
changed during this planning update. Internal port 5432 remains valid for both
distinct container addresses; host ports remain separately mapped to 5433/5434.

Any required local-machine installation must be performed by the owner after
being asked. Exact dependency pins, package/configuration/command contracts,
physical-schema decisions and implementation remain pending as identified in the
plan. These direction approvals do not approve all recommendations in the older
foundation proposal or deliver an executable schema. No installation or database
mutation was performed during planning.

## Step 3A Drizzle implementation (2026-10-25)

**Partly superseded (2026-10-31):** The dependencies, factory, limits and
compiled exports remain. The fixed dev/test tuple, Doppler injection, `db:check`
and the command supervisors are replaced by `DATABASE_URL`, committed values,
`drizzle-kit generate` and `src/migrate.ts` (A1). See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** On 2026-10-24 the owner approved the
[two-part plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md),
requested a new branch from `main`, and instructed implementation. Branch
`chore/step-3-drizzle` starts at merged `origin/main` commit `acb9f05` and preserves
the planning documents. This delivers 3A; the plan's physical-schema review and
first-development-migration gates remain in force for 3B.

Two installation/compatibility findings required additional choices. The owner
explicitly answered “Approve exact-version allowlist” for esbuild 0.18.20,
0.25.12 and 0.28.2, and “Approve skipLibCheck:true” after Drizzle 0.45.4 failed
full dependency-declaration checking. These supersede P04's library-checking
choice for the shared compiler configuration. Strict checking of project source,
API use of library types, exact optional properties and indexed access remains;
no unused Gel/MySQL/native driver packages were added to hide declaration errors.
The esbuild allowlist is version-specific; future builds require review.

| Area | Implemented contract and rationale |
| --- | --- |
| Dependencies | DB runtime: Drizzle ORM 0.45.4, pg 8.23.1, Zod 4.6.7. Root tools: Drizzle Kit 0.31.11, @types/pg 8.23.1, tsx 4.23.15. Installation is inside existing Docker volumes, with a shared exact lockfile. |
| Environment | Verified project `storage-minis`, config/environment `test`, and key name `POSTGRES_TEST_PASSWORD`. Both PostgreSQL lifecycle and Node commands require `DOPPLER_CONFIG` equal to `dev` or `test` as selected. Dev keeps `POSTGRES_PASSWORD`; no test fallback to dev. Only the selected password is fetched. |
| Factory | Explicit validated configuration, lazy pg pool, typed Drizzle handle, bounded authenticated `check()`, idempotent `close()`, last-check readiness flag. Import has no environment/network side effect. Command process owns cleanup. |
| Limits | Pool max 5; idle 10s; connection/acquisition 2s; statement 3s; query 4s; complete check 6s; graceful pool cleanup 10s. Command watchdog and signal handlers provide final process cleanup. These remain local defaults, not production targets. |
| Exports | TypeScript emits ESM and declarations to `dist/`; normal Node and NodeNext consumers resolve compiled package exports. No source alias or API runtime was introduced. |
| Tasks | DB build emits cached `dist/**`. DB typecheck and root typed lint build required exports first. `db:check`, `db:generate`, `db:migrate`, and `test:integration` are uncached; only named DB environment values pass to secret-bearing tasks. |
| Migration state | Generation/application commands and direct CLI configs refuse before credentials or schema mutation. No placeholder schema, empty journal, dummy tables or migration exists. Config paths/history namespace are recorded; CLI execution and migration credentials will be completed with approved real artifacts in 3B. |
| Tests | Colocated unit tests validate configuration, target isolation and migration refusal. Separate real-PostgreSQL tests validate connection/rollback/timeouts, idle errors, process exports and cleanup. Integration requires the exact test tuple, 30s per test and 120s suite bound. |

No host tool was installed or upgraded. The setup documentation now explains the
separate Doppler configs, internal port 5432 on distinct containers, and host
ports 5433/5434. The final evidence and remaining schema work are recorded in the
[Step 3A handoff](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-3a-verification-2026-10-25.md). These checks do not establish
business atomicity, Organization authorization, schema constraints or T06 completion.

## Docker lifecycle commands (2026-10-25)

**Superseded (2026-10-31):** The `docker:*` scripts are replaced by `db:*`
and `stack:*` package scripts using native Compose. See
[Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner approved phase 1 and the staged approach in the
[application-container and lifecycle plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/docker-application-lifecycle-plan-2026-10-25.md),
then asked whether Docker Compose needs local installation. Docker Desktop
already supplies Compose 5.6.1 with Docker client/Engine 29.9.2; no installation,
dependency/image-pin change, or shell-profile change was needed.

**Historical implemented scope (superseded by the standard Compose revision below):**
Root `docker:*` scripts invoke the host tooling/lifecycle
launchers directly, outside Turbo. `scripts/docker.sh` delegates development/test
startup to the existing Doppler-aware database launcher, and supplies project
stop, status, logs, container/network cleanup and confirmed volume deletion.
Startup explicitly reports PostgreSQL infrastructure only. The existing Compose
definitions and the Step 3B migration gate are unchanged. Separate API/frontend
services remain attached to their later approved application implementations.

Project pruning preserves named volumes. Volume deletion requires the exact
project confirmation, inventories the six declared names and validates every
existing volume's Compose ownership before any teardown. It removes only those
owned volumes after project teardown and refuses forced release of in-use volumes.
Stop/cleanup/status/logs do not fetch Doppler secrets. Existing target-specific
database reset commands remain available for narrower cleanup.

| Executed check | Evidence |
| --- | --- |
| Workspace | `COMPOSE_PROJECT_NAME=storage-minis-beijing ./scripts/tooling.sh run pnpm check` passed all seven Turbo tasks, including strict typechecks, lint, formatting and 15 unit tests. |
| Guard tests | Eight new Vitest cases exercise argument/config refusal, exact volume selection, validation before mutation, ambient overrides, another working directory, repeated empty cleanup and Docker failure propagation through a fake executable. These fixtures delete no Docker resources. |
| Real startup | Disposable project `storage-minis-lifecycle-21959`, loopback ports 63506/63507: actual host pnpm commands initialized all five tooling volumes and started development/test PostgreSQL with real target-matching Doppler injection. Repeated development startup authenticated successfully; default startup excluded test services. |
| Persistence | A temporary probe table survived development stop/start and container/network pruning. Targeted test stop preserved development access; test restart had no probe table because tmpfs was discarded. Project-wide stop left no running project service. |
| Deletion guards | Missing/wrong confirmation through actual pnpm argument forwarding preserved container IDs. A real same-name volume bearing another project's label caused refusal before any container teardown. |
| Cleanup | Prune and repeated prune retained all six declared volumes. Exact confirmation removed all six; repeated confirmed deletion tolerated absent volumes under macOS Bash 3.2. A separate running sentinel project and its attached volume survived. |
| Secret-free operations | Status/prune/volume deletion succeeded with an unavailable Doppler executable, a fixture token, and contradictory ambient Compose file/env-file/profile settings. No secret value was printed. |
| Recovery and isolation | A direct shell invocation from `/private/tmp` succeeded without host pnpm. After volume deletion, initialization and frozen dependency installation in fresh volumes succeeded. All disposable project/sentinel containers, networks, volumes and the temporary image tag were removed; the existing development project was not stopped or reset. |
| Static/docs | `bash -n scripts/docker.sh`, `git diff --check`, and changed documentation links, tables and fences were checked. |

The startup/deadline/credential mechanics remain the previously verified database
launcher's contract; they were reused rather than reimplemented. These results
establish local lifecycle behavior, not business schema, authorization,
transaction/concurrency invariants, production readiness or T06 completion.
Read [historical Docker lifecycle commands](https://github.com/WilliamPhilippe/storage-minis/blob/3f1ae6c8c105a56663d002e06f97f7843c57880c/README.md#docker-lifecycle-commands) for
host/direct-shell usage and the storage-deletion warning.

## Standard infrastructure tooling direction (2026-10-25)

**Direction reaffirmed, implementation superseded (2026-10-31):** The owner
reaffirmed the preference for standard tools on 2026-10-31. Every retained
custom helper listed below is removed; the only remaining infrastructure
script is the role init script (D3). See
[Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** After reviewing the lifecycle implementation, the owner
approved replacing the general lifecycle wrapper with standard Compose commands,
retaining narrow helpers for the existing Doppler checks and confirmed volume
deletion. The owner then requested a drafted change plan and directed the project
to avoid custom infrastructure code where standard tools provide the behavior.
Rationale: easier maintenance, deployment reuse and familiarity for developers.

The owner requested implementation of the concrete
[standard Compose maintenance plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/standard-compose-maintenance-plan-2026-10-25.md)
on 2026-10-25. This approves its canonical layout, native aliases and narrow
exceptions; the earlier lifecycle evidence above remains historical.

**Implemented outcome:** One `compose.yaml` owns the existing services and six
logical volumes. Development `postgres` is the default; `postgres_test`, tooling,
and the SQL client use `test`, `tools`, and `db-tools` profiles. Service/image pins,
UTC, loopback ports, PostgreSQL 18 storage, persistent development data, test tmpfs,
and dependency-volume identities are preserved. Ordinary shutdown declares a
10-second grace period. `compose.postgres.yaml` and the general `scripts/docker.sh`
dispatcher are retired. Root `docker:*` scripts use native Compose directly except
for Doppler-aware startup and confirmed volume deletion; all run on the host,
outside Turbo. README supplies equivalent Docker-only commands.

Development startup delegates the default service selection and health wait to
native `up --detach --wait --wait-timeout 60`; test startup explicitly selects only
`postgres_test --no-deps`. The authenticated SQL check remains separate from
`pg_isready`. Secret-free tooling/configuration and teardown parse the same model
with empty password defaults. The startup helper still requires the selected
managed password before mutation and keeps the selected-key/config boundary.

| Retained custom code | Reason beyond native lifecycle behavior |
| --- | --- |
| `database.sh` Doppler entry point | Enforces pinned CLI/browser login, matching target/config/key, no fallback, ambient-password removal and selected container variables. |
| Database `run`, `check`, `psql`, and target reset | Supplies explicit test targeting, authenticated SQL identity, client deadlines/cleanup, guarded migrations and narrower confirmed storage reset. Native Compose owns startup health timing. |
| `tooling.sh` command/env runner | Preserves tested TERM/INT forwarding and workspace exit codes, DB injection, and the harmless environment probe; build/init/down dispatch is removed. |
| `reset-volumes.sh` | Confirms the exact project and validates every existing candidate's Compose ownership before native full-profile `down --volumes --remove-orphans --timeout 10`. Volume keys come from `config --volumes`, with no duplicate inventory or deletion loop. |
| `docker/init-volumes.sh` | Sets ownership only at declared mount roots for the existing non-root tooling user. |

The volume helper supports this local model's Compose-managed project names;
external/custom-named volumes require a separately reviewed ownership contract.
Compose inventories volumes referenced by selected services. The extra-volume
probe therefore attaches its declared volume to a disposable service. An unused
declaration alone is outside native cleanup's inventory. Ordinary `down` preserves
named volumes; confirmed full deletion erases development data and dependencies.

**Executed verification, 2026-10-25:** Live T06/#26 and T04/#23 were rechecked;
this remains local foundation work, with no issue closure or production changes.

| Check | Evidence |
| --- | --- |
| Configuration and identities | Secret-free default selection returned only `postgres`; all-profile inspection returned the five existing services and six volume keys. Compared the resolved model against HEAD `e7883196256d409bfa1dd46647101b41ff45261c`: volume identities, PostgreSQL image/environment/ports/mounts/tmpfs/health checks match. Optional profiles and 10-second grace declarations are present. No rendered secret-bearing configuration was printed. |
| Build and workspace | Native `docker:build` succeeded with the existing pinned image/toolchain. Native init, frozen installation and container `pnpm check` passed with no DB startup or Doppler access. Host `pnpm check` passed all seven Turbo tasks and 17 unit tests. |
| Guard tests | Seven volume-helper cases cover confirmation/project refusal, canonical-file/ambient-override handling, all-before-teardown inspection, inventory/inspection/ownership failures, repeated empty cleanup, native failure propagation and additional declared volumes. Six DB launcher cases cover selected target/key isolation, config mismatch, migration/integration gates, missing keys/native startup failure, authenticated default/test startup, and the SQL container name retained for EXIT cleanup. |
| Real startup and isolation | Disposable project `storage-minis-compose-verify-2510` used unique loopback ports and real matching Doppler configs. Default startup excluded test/tools. Test stop preserved the running development container and its probe; restarted test tmpfs contained no probe. Missing managed keys and config mismatch failed before startup. An occupied test port failed nonzero while development remained accessible. |
| Consolidation persistence | A probe created with HEAD's two-file Compose model and launcher survived switching to the canonical file in `storage-minis-compose-upgrade-2510`; the actual `pgdata` name/creation timestamp stayed identical. |
| Persistence and teardown | Probe data survived development stop/start and native container/network teardown. Native package aliases and raw commands addressed the same project. Full-profile stop included test; status/logs worked; shutdown with an unavailable Doppler executable preserved all six named volumes. |
| Real deletion guards | Wrong/missing confirmation preserved container IDs. An unmounted declared tooling volume with another project's ownership label caused refusal before teardown. Correct confirmation removed project containers/network and six volumes while a separately running sentinel project/volume remained intact. A declared, service-attached extra volume in a disposable source copy was discovered/removed without helper edits. |
| Recovery | After complete deletion, native init and a new frozen dependency installation succeeded. |
| Real DB tests | All 10 PostgreSQL connection/lifecycle integration tests passed through `tooling.sh run-db test pnpm test:db`, including query timeout, wrong credentials, rollback, socket recovery, cleanup, compiled consumer and signal behavior. |
| Signals and SQL cleanup | TERM reached a running SQL client and removed its temporary container; TERM reached a workspace process and preserved its exit code 42. Failed SQL readiness also removed its temporary client. After the Bash 3.2 fix below, a deliberately stalled real SQL client hit the retained 15-second host deadline, returned nonzero in 17.6 seconds including cancellation/cleanup, and left no temporary client. |
| Native health deadline | An intentionally unhealthy service using the pinned image/model returned nonzero in 60.3 seconds with native `--wait-timeout 60`. |

The deadline probe exposed an existing Bash 3.2 issue: EXIT traps cannot depend
on function locals after the frame unwinds. The SQL cleanup trap now binds the
validated generated container name at registration; a regression test verifies
that failed SQL commands still remove that exact temporary client. This preserves
the approved cleanup contract without adding lifecycle orchestration.

All disposable verification containers, networks, volumes, source copies and
tooling image tags were removed. The existing development project
`storage-minis-beijing` was not started, stopped or reset. Production hosting/backups, API/frontend services, application
reconnection/shutdown and business acceptance remain later work. Step 3B's schema
and migration gate is preserved. These checks establish local tooling behavior,
not completion of T06 or business persistence invariants.

## One-time local setup (2026-10-25)

**Superseded (2026-10-31):** `.env.compose`, `configure-local.sh`,
`docker:setup`, `docker:up` and `docker:migrate` are removed. A fresh checkout
now needs `pnpm install` and `pnpm db:up`, with migrations applied by
`pnpm db:migrate`. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** After reviewing the exact command expansion, the owner approved
implementing `docker:setup`, `docker:migrate`, and export-free `docker:up`. This
amends the earlier standard Compose plan's routine environment-selection contract.
The goal is one setup after Doppler browser login, then a short restart command
using preserved volumes. Native lifecycle aliases and all existing pins remain.

**Implemented outcome:** `pnpm docker:setup` chains the narrow
`configure-local.sh` helper, native Compose build/pull/init, frozen dependency
installation in tooling, and `database.sh up dev`. First use prompts for a unique
Compose project name and development/test ports; noninteractive configuration uses
`--project`, `--port`, and `--test-port`. Repeated setup validates/reuses the saved
file and stops at any failing command. It neither resets storage nor migrates.

Git-ignored `.env.compose` contains only `COMPOSE_PROJECT_NAME`, `POSTGRES_PORT`,
and `POSTGRES_TEST_PORT`. Compose uses its native explicit `--env-file` support;
plain `.env` loading remains disabled. A small shared `local-config.sh` reader
loads only those literal keys for the existing host helpers, validates distinct
ports and project syntax, and rejects missing/duplicate/unknown entries. It never
sources the user-editable file as shell code. Configuration creation refuses
concurrent overwrite. These are the only new custom responsibilities: saving and
validating checkout settings; service lifecycle remains native Compose.

`docker:up` loads the saved settings and starts/checks development PostgreSQL.
It performs no image build/pull, dependency installation or migration application.
The test command automatically selects test. Doppler's project remains
`storage-minis`, with config/key selected from the requested target; explicit
contradictory overrides still fail. The executable is discovered on PATH, falling
back to the approved standalone location, with version 3.77.1 enforced. The
existing dedicated login directory, selected-key allowlist, ambient-password
removal, no fallback, client deadlines and signal/cleanup behavior are retained.
No shell-profile change, package, host installation or credential file is added.

All existing native build/init/stop/status/log/down aliases now explicitly use
`.env.compose`, so restart and cleanup work after opening a fresh terminal.
Helpers retain explicit environment overrides for disposable verification and
can operate without the saved file when an explicit project is supplied; native
package aliases require the file. Clear earlier experimental exports once before
using saved settings. Full volume deletion preserves the settings file and still
requires the exact saved project name plus ownership validation before teardown.

`pnpm docker:migrate` delegates to `tooling.sh run-db dev pnpm db:migrate`.
The Step 3B gate remains first: it refuses before configuration, Docker or Doppler
work while physical schema approval is pending. No actual migration is created or
applied. Startup has no implicit schema changes; future approved migration
application continues to use the separate entry point.

**Executed validation, 2026-10-25:** A disposable source copy and project
`storage-minis-setup-2510` used free loopback ports and the existing scoped Doppler
browser login. Project, port, Doppler-selection and executable-override variables
were removed from the test environment; the real commands discovered the host
Doppler executable. No secret-bearing configuration was printed.

| Check | Evidence |
| --- | --- |
| First configuration | A real terminal session prompted for project/dev/test ports and saved exactly the three nonsecret values. Unit cases also verify malformed/duplicate/unknown-key refusal, no shell execution and existing-file preservation. |
| First setup | Actual `pnpm docker:setup` built the pinned image, pulled PostgreSQL, initialized dependency volumes, installed from the frozen lockfile, and started/authenticated only development PostgreSQL. |
| Workspace | Host and container `pnpm check` passed all seven Turbo tasks and 21 unit tests. Launcher fixtures use isolated source copies so developer-local `.env.compose` cannot affect tests. |
| Later startup | A fresh environment ran stop/up and authenticated successfully without exports. A conflicting plain `.env` was ignored; the development probe survived. |
| Explicit migration | `pnpm docker:migrate` returned nonzero with the Step 3B approval message and preserved running container identities; no schema was applied. |
| Test target | `pnpm docker:up:test` selected matching real Doppler test credentials without an export; all 10 PostgreSQL integration tests passed through `run-db test pnpm test:db`. Stopping test preserved development. |
| Repeated setup | A second actual setup ran noninteractively, preserved the settings bytes and retained the development probe. |
| Native aliases and cleanup | Status/stop/down addressed the same saved project; ordinary teardown retained six volumes and probe data. Wrong reset confirmation preserved containers; correct confirmation deleted project volumes while retaining `.env.compose`. |
| Static checks | Bash syntax, changed Markdown relative links/fences/table shapes, ignored-file selection and `git diff --check` passed. |

All disposable containers, networks, volumes, source copies and tooling image tags
were removed. Existing `storage-minis-beijing` container identities were unchanged.
This remains T06 local foundation work, with API/frontend services, production
operations and business acceptance outside this change. The preceding standard
Compose evidence records the earlier revision; this section owns the updated
saved-settings workflow.

## Step 4 planning refinements (2026-10-28)

**Owner requirements:** During review of the
[Step 4 plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-plan-2026-10-28.md), the owner required
verification of the Step 5/6 handoff, an explicit acceptance-criteria list, a
working local verification path, and Fastify inside this repository's API
Docker image. The API image is therefore part of Step 4 delivery rather than
an optional later packaging task. This makes the running application artifact
and its local verification available to the transport and integration steps.

The plan proposes development/runtime Dockerfile targets, portable production
dependencies, a bounded image smoke and 18 acceptance criteria. The post-Step-3
review decisions below amend its Compose, setup and verification direction.
Remaining dependency, packaging and application recommendations await explicit
implementation approval. No API image, application code or runtime configuration
has been implemented during planning. Business writers, authorization, deployment
and full T06 acceptance remain outside this diagnostic delivery.

## Step 4 review decisions after Step 3 (2026-10-28)

**Partly superseded (2026-10-31):** Items 1–3 (profiled API services, `.env.compose`
saved settings and the Doppler launch boundary) are replaced by the restructure's
Compose model and committed local values; items 4–8 remain historical context.
See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** After the Step 3 merge and review of its divergence from the
[Step 4 plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-plan-2026-10-28.md), the owner accepted all
eight recommendations and requested a plan update. This approves the following
amendments; it does not request application implementation or approve every
remaining dependency/packaging/application recommendation in that plan.

| Review item | Approved outcome and rationale |
| --- | --- |
| 1 — Native Compose | Add profiled API services to canonical `compose.yaml`. Prefer native lifecycle commands/direct aliases; keep custom code limited to Doppler injection and bounded verification. This preserves the accepted standard tooling direction and one project inventory. |
| 2 — Saved settings/security | Reuse `.env.compose` and existing automatic Doppler project/config/executable selection. Preserve selected-key injection, target matching, dedicated browser login, no fallback and ambient-secret rejection; routine startup needs no exports. The three-key nonsecret settings schema stays unchanged. |
| 3 — Current commands | Replace retired tooling build/init and database stop calls with implemented native aliases/raw Compose equivalents. Local instructions must match the inherited setup. |
| 4 — Delivered prerequisites | Retire P4-01 without reusing its ID. Inherit Step 3B structural schema/migrations/replay and retain first-development-application ownership plus named writer/business acceptance deferrals. No sequencing exception remains necessary. |
| 5 — Shutdown | Honor per-service grace periods across API and full-project stop/down, including the guarded disposable volume-cleanup path. Remove global overrides that truncate the API's proposed 15s grace and test bounded in-flight draining against its 10s application deadline. |
| 6 — Existing diagnostics | Reuse implemented payload stderr forwarding. Preserve detailed redacted DB CLI messages/causes/codes and keep the proposed HTTP log policy separate; extending injection must not hide command errors. |
| 7 — Typed DB handoff | Include compiled schema runtime/declaration modules in build, package and reload proof. Readiness checks connection identity, not migration currency; API startup never migrates. |
| 8 — Shared-target isolation | Run schema, API process, smoke and outage phases sequentially when sharing a test target. A schema reset or test-service stop must not race another consumer; use disposable resources for destructive evidence. |

**Recorded outcome:** The plan, acceptance matrix, local command examples and
handoff have been revised to these decisions. Narrow payload names and direct
API package aliases are documented as proposed implementation details. Existing
Compose files/scripts, dependencies, schema/migrations and running resources are
unchanged by this documentation update. These amendments are approved inputs for
later implementation, not runtime evidence or T06 completion.

**Owner execution request, 2026-10-28:** The owner subsequently requested small
sequential implementation assignments because an AI agent may run out of usage
allowance mid-implementation. The
[stage guide](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-implementation-stages-2026-10-28.md) divides
the existing scope into 11 stages, each with checks, a stopping point and durable
checkpoint/resume instructions. Assign one stage per session and preserve
incomplete work with an exact next action when interrupted. The parent plan
remains the acceptance/technical contract, and the Step 4 PR boundary is unchanged.
This decomposes the delivery work without approving pending technical choices or
starting implementation.

## Step 4 execution interview decisions (2026-10-28)

**Owner approval:** After the planning interview, the owner confirmed the shared
execution agreement and authorized the documentation update. Retain the existing
**11 stages**, with one [copyable prompt per stage](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-stage-prompts-2026-10-28.md)
as its starting packet. An earlier option to subdivide further was considered;
the final agreement keeps the prepared boundaries and resumes the same stage
after interruption rather than automatically creating substages.

| Execution decision | Approved outcome and rationale |
| --- | --- |
| Durable restart state | Write an initial in-progress checkpoint before implementation, then update after meaningful verified results, before live/temporary-fixture experiments and at handoff. Credit exhaustion must not leave the final chat response as the only restart record. |
| Local completion commits | After a stage's required checks pass, its implementing agent stages the changes/evidence and executes `git commit` with a Conventional Commit message; it reports the actual hash instead of leaving the commit to the owner. Incomplete or commit-blocked work stays in progress. Record the commit subject before committing and resolve its hash through Git history; no self-referential evidence commit is needed. Existing push/PR authorization remains separate. |
| Stage versus acceptance completion | A stage can finish its scoped checks while a criterion needing later proof stays partial. AC4-06 closes only with outage liveness in 4.9; AC4-13 waits for the runtime/development/smoke security paths by 4.8. A progress label is not acceptance evidence. |
| Verification cost | Run meaningful focused tests and affected strict checks at each stage. Run full ordinary aggregate checks at 4.4, 4.8 and 4.11. Reuse earlier evidence only while its relevant inputs remain valid; changes, failures or gaps require affected reruns. This retains verification while avoiding unnecessary full-suite repetition for every stage. |
| Approval timing | Identify and obtain uncovered technical approvals before their consuming stage work. Reuse existing scoped approvals without requesting them again. The starting prompt identifies decisions to inspect; assigning a stage does not approve pending P4 recommendations. |
| Status reporting and documentation (owner follow-up) | On 2026-10-28 the owner requested an explicit status report at every stage handoff, synchronization of affected current documentation, and a commit when verified stage changes exist. Report stage/overall status, checks, actual commit hash or why no new commit was made, remaining files/reasons and next action. Verify Git status; an unchanged completed stage reports its existing commit without an empty commit. Incomplete or commit-blocked stages remain in progress. |
| Session boundary | Assign one stage/prompt per session and stop after its handoff/local commit. The owner named `WilliamPhilippe/step-4-implementation-plan` as the unique branch for all stages; verify it before changes and create no branch/worktree per stage. Keep the same evidence path across sessions and record exact remaining work/resources when interrupted. The eleven-stage sequence and full Step 4 PR boundary remain intact. |

The stage guide, parent plan and foundation guide apply these decisions. No API
code, dependencies, containers or migrations were implemented during the interview
or documentation update. Remaining technical recommendations still need their
recorded approval before implementation.

## Step 4.1 configuration and finite-build approval (2026-10-28)

**Owner approval:** In the stage 4.1 implementation session, the owner explicitly
approved the pending configuration, dependency and finite-build choices below.
This covers P4-02 and only the stage 4.1 portions of P4-08/P4-09 in the
[parent plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-plan-2026-10-28.md). Remaining Step 4
recommendations retain their existing approval gates.

| Choice | Approved outcome and rationale |
| --- | --- |
| API runtime dependencies | Pin Fastify 5.12.7 and Zod 4.6.7; link `@storage-minis/db` with `workspace:*` using container pnpm and the shared lockfile. Fastify supplies its own types/logger/injection support, and Zod matches the DB pin. Alternative patches need compatibility research; no extra logger, bundler, cleanup package or tRPC dependency is needed here. |
| Configuration | Implement `readApiConfig(environment)` returning separate HTTP and DB configuration. Apply the parent plan's absent-only defaults, exact host/port/level/environment validation, ignored unknown keys and secret-free failures. Delegate DB component/URL validation to the existing compiled DB package. Explicit input keeps imports free of environment reads and resource acquisition. |
| Finite builds | Use the existing TypeScript compiler for API ESM, declarations and JavaScript source maps; retain strict NodeNext and no-emit-on-error. Remove only each package's own `dist` with native Node `fs.rmSync` before its finite build. This prevents stale output after deletion/rename without adding a package or changing DB output/schema. Stop watchers before clean builds. |
| Strict checks and graph | Cover API source, tests, scripts and Vitest configurations in no-emit checking. Reuse existing build/typecheck/lint dependencies and `dist/**` outputs; add a DB build dependency to root unit tests, which now consume compiled DB exports. Add only declarations for existing commands; dev/start/process/image tasks wait for their stages. |

At the stage 4.1 handoff, it was implemented and verified in commit `472e0a7`,
with stages 4.2–4.11 pending and full Step 4 in progress. See the later stage 4.2/4.3
record below for current progress. Implementation and executed checks
are tracked in the
[cumulative evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-41--configuration-and-finite-builds).
Stage 4.1 does not deliver an HTTP factory/listener or claim full Step 4/T06
acceptance.

## Step 4.2 factory, HTTP and logging approval (2026-10-28)

**Owner approval:** In the stage 4.2 session, the owner explicitly approved
P4-03/P4-05/P4-06 and the application/HTTP contracts in the
[parent plan](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-plan-2026-10-28.md#application-and-process-contract).

| Choice | Approved outcome and rationale |
| --- | --- |
| Construction | `buildApp(httpConfig, { database, isClosing })` returns an unlistening Fastify instance. Type readiness as `Pick<Database, "check">`; read no application environment and own no pool or process handlers. Explicit dependencies isolate tests and leave ownership with stage 4.3; a resource-owning singleton would couple construction and cleanup. |
| HTTP | Fixed live/ready/not-found/internal-error responses, fresh existing bounded DB checks, closing-aware readiness, 16 KiB bodies, 10s receive timeout, `forceCloseConnections: "idle"` and `trustProxy: false`. Preserve safe framework statuses including malformed JSON 400 and oversized payload 413. A combined/cached probe would obscure dependency loss or recovery. |
| Logs | Fastify's existing JSON logger, generated request IDs with `requestIdHeader: false`, disabled default request logging, fixed failure categories and only method/matched-template/status/elapsed request metadata. Safe serializers and authorization/cookie redaction provide defense in depth; redaction-only default logging still exposes URLs and exception messages. No additional logger dependency. |

Stage 4.2 is complete with AC4-03/AC4-10 and injected health evidence;
implementation/checks are tracked in the
[same cumulative evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-42--http-factory-health-and-safe-logs).
At its handoff, this approval covered only the assigned factory/tests and necessary
documentation; process lifecycle, real HTTP/DB/outage proof and later-stage
recommendations retained their gates. The separate 4.3 approval follows below.
No production or business acceptance is implied.

**Superseded in part (2026-11-01):** the
[API composition and error-log rework](#api-composition-and-error-log-rework-2026-11-01)
replaces the Construction row's `Pick<Database, "check">` with
`Pick<Database, "db" | "check">` and health routes registered as a plugin, and the
Logs row's fixed failure categories with an allowlisted error record. The HTTP row
and the rest of this record are unchanged.

## Step 4.3 lifecycle, process and start-task approval (2026-10-28)

**Owner approval:** In the stage 4.3 session, the owner explicitly approved the
presented P4-04 process/lifecycle contract and only the stage 4.3 start portions
of P4-08/P4-09. This follows the same
[parent contract](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/plans/step-4-fastify-plan-2026-10-28.md#application-and-process-contract).

| Choice | Approved outcome and rationale |
| --- | --- |
| Ownership and extension | One lifecycle owns one full DB handle and one app, with injectable factories/process hooks for focused unit fixtures. An optional async callback receives those same instances before app readiness, DB check and listen. A second pool or resource-owning singleton duplicates ownership. |
| Early cancellation | Install SIGINT/SIGTERM handlers before configuration/acquisition. Signals mark closing and prevent subsequent listen; pending startup settles before completed cleanup removes handlers, so late acquired resources remain owned. Repeated signals share the first close promise. |
| Deadlines and exits | Retain the 17s overall startup/failure watchdog and a single 10s total shutdown bound. Drain HTTP, then close DB even if HTTP close fails. On deadline destroy HTTP connections and force exit 1. Successful SIGINT/SIGTERM cleanup uses 130/143; startup/cleanup/deadline failures use 1. Separate budgets or listening before DB validation change the approved fail-fast contract. |
| Diagnostics | Fixed safe categories only; no raw exception, configuration or registration input. No additional logger dependency. |
| Built start | API `node --enable-source-maps dist/server.js`; root filtered Turbo start; API start is uncached/persistent, depends on its finite build and passes through only the parent-listed runtime variables. Direct built Node remains available without a loader. Dev/process/image tasks wait for their stages. |

Stage 4.3 is complete with AC4-04 and 52 passing API tests (29 lifecycle tests),
finite builds, affected strict checks and start-task/compiled-entry inspection. Its
[checkpoint and evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-43--process-lifecycle-and-entry-point)
record the local completion commit subject and exact commands. Cleanup rejection
attempts both closes, destroys HTTP connections and forces exit 1 because it
cannot certify release. OS signals, actual listener/pool release and DB process
proof remain with 4.4/4.10; mocks do not establish those results. Later-stage
recommendations retain their approval gates.

**Superseded in part (2026-11-01):** the
[API composition and error-log rework](#api-composition-and-error-log-rework-2026-11-01)
removes the Ownership row's optional async callback (`registerRoutes`) and its
`registration_failed` category, because `buildApp` now assembles every plugin, and
replaces the Diagnostics row's fixed text categories with JSON lifecycle lines that
carry an allowlisted error record. Ownership, early cancellation, deadlines, exit
codes and the built start are unchanged.

## Step 4.4 guarded process-test approval (2026-10-28)

**Partly superseded (2026-10-31):** The process tests remain and were re-proven
with `DATABASE_URL`. The 180s suite supervisor became plain Vitest with a config
guard, and the DNS preload became owned loopback listeners. `owned-process.ts` is
retained. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the scoped recommendation in
the 4.4 session, covering the consuming P4-09/P4-10 details below. Later-stage
recommendations retain their approval gates.

| Choice | Approved scope and rationale |
| --- | --- |
| Commands/graph | API `test:process` uses existing tsx to run a dedicated Vitest supervisor; root `test:api` selects only that task. Its own finite build orders compiled DB/API output; live execution is uncached and outside ordinary `pnpm check`. Both names join the prefetch test-only guard. Injection alone cannot prove OS startup/shutdown; another runner package adds no needed capability. |
| Ownership | Serial 30s tests, 10s hooks, 180s suite supervisor, then at most 10s termination plus a 1s pipe fallback. Bounded in-memory output, process-group cancellation, distinct reserved ports, child listening marker before HTTP, and existing DB-pool activity inspection establish resource ownership. No new dependency or business/schema fixture is needed. |
| Unavailable startup | A test-only Node preload resolves only `postgres_test` to an owned loopback TCP refusal fixture. This exercises real socket/startup failure while retaining the exact validated test tuple and leaving shared PostgreSQL running. Stopping the actual test service with an already running API remains 4.9's separate outage proof. |

Stage 4.4 is **complete**; see its
[checkpoint and evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-44--guarded-built-process-tests).
Fifteen real process tests and the 85-test offline foundation aggregate passed,
along with the sequential 30-test schema phase and independent zero-backend
cleanup checks. AC4-05/AC4-08 are complete. AC4-06/07 remain partial until 4.9's
real service outage; AC4-09 has basic signals only until later shutdown proof.
The existing 17s startup/failure and 10s shutdown contracts remain unchanged.
Both original DB services are stopped; development was preserved. No dependency,
runtime source, schema/migration or Compose change was needed. Later-stage
choices retain their approval gates; overall Step 4 is in progress.

## Step 4.5 runtime-image packaging approval (2026-10-28)

**Owner approval:** In the stage 4.5 session, the owner explicitly approved the
recommended packaging approach before implementation. This approves P4-11's
build/package/runtime subset and API/DB package boundaries; development and
Compose registration remain stages 4.7 and 4.6 respectively.

| Area | Approved choice and rationale |
| --- | --- |
| Build | Root context, `docker/Dockerfile.api` with `build`, `package`, `runtime`; exact existing Node 24.22.1 Bookworm slim digest and pnpm 12.15.0. Explicit input copies, frozen installation and finite `pnpm build`; no DB/Doppler/secret build input. Reuse the selected toolchain rather than introducing a bundler or another base. |
| Package | API/DB `files: ["dist"]`; `pnpm --filter=@storage-minis/api --prod deploy /out`. Keep workspace injection policy unchanged. pnpm packages production dependencies and workspace files portably; copying workspace node_modules risks external links and retains build tooling. |
| Runtime | Fresh pinned Node base; copy only `/out` into node-owned `/app`, `USER node`, `CMD ["node", "--enable-source-maps", "dist/server.js"]`, `HOST=0.0.0.0`, `PORT=3000`, `NODE_ENV=production`. No install, compiler, source/dependency mount or tooling-volume prerequisite at startup. |
| Context | Root `.dockerignore` excludes local environment/credential files, history/agent state, dependencies, generated output, caches, logs and test fixtures. Explicit required-input copies provide an additional boundary. Preserve the tooling Dockerfile and its existing `docker/` context. |
| Proof | Build the runtime from root; inspect production graph, compiled API/DB/schema/declarations, internal workspace links, nonroot/plain-Node defaults and local-file exclusion without networking, mounts or DB credentials. Authenticated runtime startup and AC4-01 completion remain 4.6. |

Implementation status and exact evidence are maintained in the
[stage 4.5 checkpoint](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-45--self-contained-runtime-image).
The approved subset is implemented and verified: AC4-11 complete, including
all compiled schema/declaration files and internal production links. AC4-01
remains partial until authenticated startup in 4.6. Build needs no DB/Doppler;
tooling/Compose, dependency versions and workspace injection policy are unchanged.
Production hosting, release operations and T04 acceptance remain open.

## Step 4.6 Compose runtime and startup approval (2026-10-29)

**Superseded (2026-10-31):** The profiled runtime service and the Doppler
`api-up` launcher are replaced by the production-shaped `migrate`/`api` services
and the parity stack (`pnpm stack:up`, R2/R15/R19). See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the recommended 4.6 scope in
this session. This covers only the runtime P4-07/P4-11 subset below. Development,
automated image smoke and remaining task choices keep their later-stage gates.

| Choice | Approved outcome and rationale |
| --- | --- |
| Runtime service | Only `api`, profile `api`, in canonical Compose; project-scoped `-api:step4` tag, existing runtime build target, no mounts, `init: true`, no restart, 15s grace. Retain the default PostgreSQL selection and all six volume identities. |
| Publication/health | Loopback host port 3000 by default with a validated invocation override. Node readiness healthcheck uses 7s HTTP abort, 8s Docker timeout, 2s interval, 5s start and three retries. Native Compose waits up to 30s; no custom polling policy. |
| Credential operation | Only `api-up dev\|test`, with validated port/log level, cleared ambient DB inputs and the inherited selected-key Doppler/no-fallback/diagnostic boundary. Execute native `up --detach --no-deps --no-build --pull never --wait --wait-timeout 30 api`; runtime retains production mode and container `0.0.0.0:3000`. No migration or secret change. |
| Native aliases/grace | Add build/up/log/stop aliases for runtime only; reuse `docker:ps`. Remove project-wide 10s overrides from stop/down/confirmed volume cleanup so per-service grace applies; retain DB-only 10s bounds. |
| Verification | Extend inherited fixture security/diagnostic tests and affected strict checks. Native build, model/volume/default-selection checks, real test-target startup/exact HTTP/collision/native stop and fresh-environment settings proof. Keep AC4-13 partial until 4.7–4.8 and full project drain proof for 4.10. |

**Implemented and verified:** Native Compose builds and starts the profiled runtime
with selected test credentials; exact host HTTP health, image/user/command/mount
inspection, collision refusal, idempotent fresh-environment startup and native
exit/listener cleanup passed. Focused launcher/security and strict checks passed.
AC4-01 is complete; AC4-13 remains partial through 4.7–4.8 and full project drain
proof remains 4.10. No development migration, secret edit or dependency change.

This preserves native lifecycle ownership and needs no dependency, dispatcher or
extra settings/model file. Manual startup would lose the short guarded launch;
custom polling/dispatch would add maintenance. Implementation evidence is tracked
in the [4.6 checkpoint](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-46--canonical-compose-and-doppler-startup).

## Step 4.7 development image and reload approval (2026-10-29)

**Superseded (2026-10-31):** The development image, `api-dev` service and its
SIGINT amendment are removed; `pnpm dev` runs the same watchers on the host. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the concrete 4.7 recommendation
in this session, before implementation. The scope is P4-08/P4-09 watchers and
P4-07/P4-11 development service/injection only. No dependency or pin changes.

| Choice | Approved outcome and rationale |
| --- | --- |
| Watchers | API `node --watch --watch-preserve-output --import tsx src/server.ts`; DB `tsc --project tsconfig.build.json --watch --preserveWatchOutput`; root `turbo run dev`. Preserve compiled DB exports. Native Node waits for child exit on restart; tsx watch's 5s kill limit is shorter than the 10s application cleanup budget. |
| Task graph | Persistent uncached API `dev` depends on `^build`; DB `dev` depends on its finite `build`. Both share that prerequisite; no persistent task is a finite prerequisite. Only API gets the existing named runtime allowlist; DB compiler/builds get no DB credentials. |
| Development image/service | Nonroot `development` inherits the pinned build stage, runs `pnpm dev` in `/workspace`. Optional canonical `api-dev` uses the checkout bind and existing five tooling volumes with nocopy, `init`, no restart, 15s grace and loopback publication. Existing init/frozen install remains prerequisite. No host dependencies or extra storage. |
| Launcher/aliases | Extend existing selected-key/no-fallback boundary with `api-dev dev\|test`, native foreground `up --no-deps --no-build --pull never api-dev`. Extend native build/stop to both actual services and add the dev alias. One model and one credential boundary avoid duplicated maintenance. |
| Verification | Bounded live `./scripts/database.sh api-dev dev` with temporary API/DB/schema, error/rapid-edit and >5s drain fixtures, restored byte for byte; inspect PIDs, compiled outputs, environment and cleanup. Focused security/graph and affected strict finite checks after watchers stop. No migration/reset or managed-secret changes. |

**Implemented and verified:** Development image, compiled DB reload, compiler
error/correction, rapid edits, >5s restart drain, compiler secret isolation and
canonical in-flight TERM/INT passed; see the
[4.7 evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-47--development-image-and-reload).
AC4-02 is complete and AC4-13 remains partial until the 4.8 smoke path also passes.
Source exports, a new watcher package or a separate launcher/model would change
the compiled boundary or add maintenance and are not selected.

**Approved amendment (same date):** After actual in-flight outer TERM failed,
the owner approved `stop_signal: SIGINT` on `api-dev` only, retaining 15s grace.
The secret-free minimal worker drained in 6.6s under direct Node watch, pnpm and
direct Turbo; pnpm wrapping Turbo under TERM force-stopped immediately. The
pinned Turbo wrapper forwards TERM, and combined forwarding triggers native
Turbo's repeated-signal force-stop path. SIGINT through the same pnpm/Turbo chain
drained in 6.6s. Native Compose's service stop signal avoids a custom wrapper or
bypassing pnpm. Runtime `api` retains default TERM. The full canonical foreground
TERM/INT path subsequently passed, draining in 6.63s/6.65s with container exit 0
and native client statuses 143/130 respectively. See
[Turbo's pinned wrapper](https://github.com/vercel/turborepo/blob/v2.11.10/packages/turbo/bin/turbo)
and [Compose stop_signal](https://docs.docker.com/reference/compose-file/services/#stop_signal).

## Step 4.8 bounded image smoke approval (2026-10-29)

**Superseded (2026-10-31):** `scripts/verify-api.sh` is replaced by the opt-in
`pnpm test:stack` Vitest suite (R10). See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the concrete recommendation
before implementation in the 4.8 session. This covers only the narrow smoke
helper, exact-test injection/alias and its verification; no new dependencies.

| Choice | Approved outcome and rationale |
| --- | --- |
| Harness | Bash `scripts/verify-api.sh`, canonical runtime `compose run` with unique owned name/label, no dependencies/build/pull/mounts, `NODE_ENV=test`. Native Compose keeps image/service configuration authoritative. No extra service/file or lifecycle dispatcher. |
| Boundary | `database.sh api-verify test` validates before fetch, reuses selected-key Doppler injection and exact tuple; direct `docker:api:verify` alias stays outside Turbo. Reject ambient overrides; named password injection only. |
| Proof/bounds | Docker-assigned loopback port by default, validated explicit port/collision refusal; exact host HTTP bodies/status, image/container identity and SIGTERM exit. Requests 8s, readiness 30s, shutdown/cleanup 15s and total 60s. Install ownership/deadlines/interruption cleanup first; suppress raw Docker/curl streams and print allowlisted diagnostics. |
| Tests | Existing Vitest launcher fixtures plus bounded temporary host scenarios for repeat uncached success, bad injected credentials without managed edits, collisions, interruption and deadlines. Restore owned resources; serialize shared-test consumers; run container integration `pnpm check`. |

A Node harness adds another host runtime; another Compose service duplicates
configuration. The narrow shell exception supplies exact assertions/owned cleanup
that ordinary native startup does not. **Implemented and verified:** repeated
actual image smoke, dynamic/explicit loopback publication, collision/bad-password
refusal, real outer TERM/INT cleanup and sanitized streams passed. The inherited
runtime TERM status is 143; the verifier returns 0 after assertions/removal.
Requests use an 8s bound, readiness 30s and a 45s work watchdog reserves final
cleanup within the absolute 60s operation. Cleanup has a 15s phase budget with
reserved bounded force-removal/absence proof; failed inventory cannot certify
absence. The final milestone passed 109 tests and all strict checks.
[Checkpoint and evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-48--bounded-runtime-image-smoke)
close AC4-13/15 with current runtime/development/smoke evidence. Overall Step 4
remains in progress; service outages and native project drain remain later stages.

## Step 4.10 shutdown fixture approval (2026-10-29)

**Partly superseded (2026-10-31):** The shutdown fixtures and real watchdog tests
remain and were re-proven. The container drain through native stop/down and the
confirmed volume deletion used removed services and helpers; `pnpm test:stack`
now proves the API's SIGTERM exit. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the recommended shutdown
fixtures in the 4.10 session before coding or disposable resource creation.
Use a test-only entry importing the compiled lifecycle and real test DB, through
the existing owned-process supervisor: finite/pending startup, repeated signals,
6s in-flight HTTP drain, failed/hung closes and actual 10s/17s watchdog timing.
No diagnostic delay endpoint enters application source, dist or runtime images.

For native API stop, full-profile stop/down and confirmed volume teardown, use
a distinct disposable canonical Compose project. Copy the test entry only into
stopped API containers' writable layers, then start them. Keep another disposable
project/container with attached storage as an isolation sentinel. Record resource
identity, bounds and cleanup before each experiment; remove all owned probes,
volumes and temporary image tags afterward. Preserve original images, canonical
configuration, Beijing containers/data/settings and unrelated resources. A fixture
image rebuild adds restoration/build work; unit-only fixtures cannot establish
actual process/container drain. Existing 10s total process budget, 15s API service
grace and exact-confirmation/ownership guard remain unchanged.

Stage 4.10 is **complete**; see its
[shutdown and isolation evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-410--shutdown-through-all-project-paths).
No new dependency, runtime policy, infrastructure service or later-stage choice
is selected. AC4-09/17 are complete: 25 real process cases, six-second requests
through native API/full-project stop/down and confirmed deletion, real 10s/17s
watchdogs, separate application/container/client exits and preserved peer/owner
storage. Strict checks also pass without prior API dist; fixtures execute compiled
modules and use source-only type references. The container fixture retains its
original test path and a temporary importing entry; neither enters the image.

## Step 4.9 DB failure, recovery and isolation approval (2026-10-29)

**Partly superseded (2026-10-31):** The socket recovery test remains, pointed at
an owned loopback gate through `DATABASE_URL` instead of the DNS preload. The
native-service outage harness used the removed launcher; it was not re-run. See [Foundation restructure](#foundation-restructure-2026-10-31).

**Owner approval:** The owner explicitly approved the recommended socket and
native-service fixtures in the 4.9 session before implementation. This covers
only test/evidence work within P4-10; inherited runtime/deadline/target contracts
remain unchanged.

| Choice | Approved outcome and rationale |
| --- | --- |
| Socket fixture | Extend the guarded process suite with an owned loopback TCP gate using the existing child-only DNS preload. Forward real PostgreSQL traffic, terminate the observed API backend with `pg_terminate_backend`, refuse reconnects for exact 503 probes, then restore forwarding. A single idle termination may reconnect before HTTP sees failure; repeated termination would be timing-sensitive. No mocked PostgreSQL replies or new dependency. |
| Native service fixture | Temporary host harness uses existing `api-up test`, native `stop --timeout 10 postgres_test` and `database.sh up test`. Exact HTTP and unchanged container/PID/start/restart identity prove recovery. Another Compose project adds unnecessary setup when this disposable target is exclusive. |
| Isolation/restoration | Reuse unchanged schema evidence; process → image smoke → outage, all exclusive and sequential. Close SQL/probes/clients between phases. Record ownership/restoration before stop; preserve development/six volumes/settings; return test to its initially stopped state and remove only the newly owned API. No lock/infrastructure/schema change. |
| Bounds | Existing 30s tests/10s hooks/180s process supervisor; requests abort at 8s and assert below DB 6s + 1s scheduling margin. Native test stop 10s + 5s overhead, startup outer 90s, API startup 45s, recovery polling 30s. |

**Implemented and verified:** 58 focused unit tests and API strict checks passed;
16 guarded process tests passed, including real socket failure (ready 503 in 2ms)
and recovery with the same PID. Current runtime image smoke passed. Native test
stop produced exact ready 503 in 2005.9ms while live stayed 200; native restart
restored exact ready 200 with the same API container/PID/start time/restart count.
Authenticated test identity and zero public/drizzle tables before/after API
startup/recovery prove diagnostic readiness without migrations. Final independent
inventory/port checks closed cleanup after the host harness's immediate bind hit
TCP TIME_WAIT; no listener or owned API/probe/client remains. Both original DBs
are stopped, development and six volumes preserved.
[Checkpoint and evidence](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-49--database-failure-recovery-and-test-isolation)
close AC4-06/AC4-07/AC4-14. Overall Step 4 remains in progress; 4.10–4.11 remain
pending. Dated earlier-stage statements retain their historical scope.

## Step 4.11 final verification and handoff (2026-10-29)

The owner assigned only stage 4.11 on the existing branch, requiring real task
cache/restoration/invalidation proof, the final ordinary aggregate, current
setup/approval summaries, all eighteen criteria and the Step 5/6 handoff.
This executes existing approved P4-08/P4-09/P4-10 contracts; no package/version,
runtime configuration, infrastructure or business policy changed. Native
Turbo/Node temporary output/source fixtures use finally restoration; live phases
remain sequential on test only. Earlier dated approval/results keep their scope.

The [stage checkpoint and final reconciliation](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-411--cache-verification-documentation-and-final-handoff)
record results and current delivery state. README/local-development now describe
implemented API/DB builds/tests/watchers, exact commands/variables, health/log/
failure cleanup limits and successor extensions. AGENTS.md points agents to the
current verification and future change triggers. Actual runtime/image/source
identity governs reuse of earlier evidence, not the date alone.

After local checks and the concrete PR draft were ready, the owner explicitly
approved pushing this stage on the existing branch and updating PR #107 on
2026-10-29: “Approve push and PR update (Recommended).” The PR now records
implementation evidence with the title `feat(api): deliver Fastify server
foundation`; fetched title/body/branch match the reviewed draft. This completes
AC4-18 alongside AC4-12/16’s cache/setup evidence. Stage 4.11 and Step 4 are
complete; no merge, issue closure or successor implementation is included.
Business writers, Firebase/bootstrap, tRPC, frontend, CI, production and full T06
acceptance remain deferred.

### Recorded acceptance and successor contracts

All AC4-01–AC4-18 passed on 2026-10-29 for implementation commit
`8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8`. These are recorded results, not a
new run against later changes.

| Criteria | Recorded evidence |
| --- | --- |
| AC4-01–AC4-05 | Portable runtime, API/compiled-DB reload, inert injectable factory, one owned DB for route registration, and validated configuration. |
| AC4-06–AC4-10 | Exact health through DB loss/recovery, bounded startup failures, repeated-signal cleanup, real 10s/17s watchdogs, safe HTTP errors and log exclusion tests. |
| AC4-11–AC4-12 | Compiled ESM/schema/declarations and portable package links. Seven unchanged aggregate tasks reused cache. Both builds restored all 40 output file hashes; DB edits invalidated API consumers, and a deliberate TS2322 blocked API build. |
| AC4-13–AC4-15 | Selected-target Doppler/security checks, 109 unit tests across 12 files, 25 guarded real-PostgreSQL API process cases, empty-suite refusal and bounded image smoke. Step 3B's 30 schema/replay tests are inherited evidence. Live checks execute uncached and sequentially. |
| AC4-16–AC4-18 | Verified setup/failure/cleanup instructions, loopback collision and project/storage isolation, complete handoff and owner-authorized evidence on PR #107. |

The final image verifier observed exact live/ready 200, SIGTERM 143 and confirmed
owned-container removal. The runtime image was
`sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`;
the development image was
`sha256:fc2c235b087810fb2fa8909d3747e2e7b7b8c4721c82cb43bf4925958eb26ca0`.
All 40 runtime compiled-file hashes matched the source builds. Full original
commands, identities, failed attempts and final results remain in the
[historical verification](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/step-4-verification-2026-10-28.md#stage-411--cache-verification-documentation-and-final-handoff).

Step 5 extends `startLifecycle`'s async `registerRoutes(app, database)` callback
with the real tRPC adapter/context and a type-only router export. *(Superseded on
2026-11-01: the callback is removed; Step 5 registers the adapter as a plugin in
`buildApp`. See the
[API composition and error-log rework](#api-composition-and-error-log-rework-2026-11-01).)* It reuses the
single owned DB and existing image. Step 6 extends the same image verifier with
valid/invalid tRPC HTTP requests, reproduces clean setup and rechecks affected
cache/integration proof. Read the [current guide](technical-foundation-implementation-guide.md#step-4--fastify-server-foundation)
for these inherited contracts. Rerun affected proof after source/task/image changes;
shared test consumers remain exclusive and sequential.

## Foundation restructure (2026-10-31)

**Owner approval:** On 2026-10-31 the owner approved the
[foundation restructure plan](foundation-restructure-plan-2026-10-31.md)
(PR #109): core decisions A1–A5, detailed decisions D1–D10, plan-review
amendments R1–R15 and the final verification V1–V7. During implementation the
owner answered four further questions on 2026-10-31 and 2026-11-01
(R16–R19), and on 2026-11-01 approved twelve implementation choices as
recommended (R20). The plan
is the authoritative record of alternatives and wording; its Section 4a
amendments win where wording conflicts. Rationale: prefer standard tool
workflows over custom code (owner direction 2026-10-25, reaffirmed
2026-10-31), make the same images and Compose model deployable to a single
Hostinger VPS, and give developers a fast host loop with working editor
tooling.

| Area | Approved outcome |
| --- | --- |
| Execution model (A4) | Node.js 24.22.1 and pnpm 12.15.0 run on the host, pinned by `.nvmrc` and `package.json`. The tooling image, its five dependency volumes and every Bash launcher are removed. PostgreSQL runs in containers locally; the API, a later `web` image and PostgreSQL run in containers in production and in the parity stack. |
| Database configuration (A1) | The DB package reads a standard `DATABASE_URL` (migrations: `MIGRATION_DATABASE_URL`), with TLS through `sslmode`. Hard-coded host/user/port/database literals are removed; tests are protected by a guard that requires a database name ending in `_test`. |
| Roles (A2, D2, D3, R6) | `storage_minis_owner` owns the database and schemas and runs migrations. `storage_minis_app` receives `SELECT, INSERT, UPDATE, DELETE` on tables, `USAGE, SELECT` on sequences and `EXECUTE` on functions through `ALTER DEFAULT PRIVILEGES`. The `postgres` superuser is used only by the image's init script, `docker/postgres/init/10-roles.sh`, a retained custom exception because SQL init files cannot read environment variables. Uniform app privileges; per-table restrictions are a T01 candidate. |
| Compose layout (D1, R2, R4, R13, R15, R17) | `compose.yaml` holds production-shaped `postgres`, `migrate` and `api` (later `web`) and is the only file used on the VPS. `compose.override.yaml` adds loopback ports, `postgres_test` (tmpfs) and a `stack` profile for `api`/`migrate`. `compose.stack.yaml` publishes the parity stack's API on `127.0.0.1:3100`; that stack runs as project `storage-minis-stack` with a throwaway volume and an unpublished database. |
| Values and secrets (A3, D4, R3, R8, R9, R12, R14) | Local development and test database values are committed in `.env.development` and `.env.test`; `.gitignore` allows exactly those names and `.dockerignore` excludes every `.env*` file. Local Compose commands pass `--env-file .env.development`; host Node loads the files with `--env-file-if-exists` or `process.loadEnvFile`, and real environment values take precedence. No Doppler is used locally until a real development secret exists. The VPS uses a read-only `prd` service token with `doppler run`; `prd` keys are created later under T04. |
| Migrations (A5, D6, D7, D8, R5, R19) | Schema and migrations may be reset freely. The baseline is regenerated as a Drizzle custom migration for `inventory_id_base36` followed by one generated migration. A `migrate` service runs the compiled `dist/migrate.js` from the API image as the owner role; `api` waits for it to complete successfully and never migrates itself. Brief deploy downtime is acceptable. Because a single `up` stops the running API before `migrate` finishes (verified), the stack and the later VPS deploy run `docker compose run --rm migrate` first and `up -d --wait` second, so a failed migration leaves the running API in place. Rotate a role password with `ALTER ROLE` before changing its secret: the secret also feeds the `postgres` service, so changing it recreates PostgreSQL and stops the API. Drizzle stays on 0.45.4 / Kit 0.31.11. |
| Parity check (R10) | `pnpm stack:up` / `stack:down` run the production model locally; `pnpm test:stack` is an opt-in Vitest smoke suite outside `pnpm check`. |
| Delivery (R1, R16, R18) | One PR in four ordered commit groups, stacked on PR #109. Each PR, not each commit, must leave a working state; host DB commands are unavailable between commit groups 1 and 2. |
| Implementation choices (R20) | Approved as recommended on 2026-11-01, completing V6. Every URL component is explicit, with `sslmode=disable` or `verify-full` only. Committed URLs use `127.0.0.1` and fixed ports 5433/5434. Every pool pins `search_path=public`, UTF-8 and standard SSL negotiation. The other choices cover migration names, owner-role migration tests, database-wide default privileges, the migrator's default signal handling, the API suite's config guard and the smoke-test design; the plan's R20 lists all twelve. |
| Direction only (D5, D9, D10) | A Caddy-based `web` image for the client-side SPA, image distribution through GitHub Container Registry and daily `pg_dump` backups with a tested restore. These remain T04 implementation work. |

The implementation, the commands each commit group ran with their output, and
the final verification V1–V7 are recorded in
[PR #110](https://github.com/WilliamPhilippe/storage-minis/pull/110). The sections
marked superseded keep their historical evidence; this record owns the current
local workflow.

### Step 1–4 evidence after the restructure

| Earlier evidence | Status |
| --- | --- |
| Step 1 tooling image, dependency volumes, launcher signal forwarding, checkout-scoped Doppler login and `verify-env` probe | Superseded; the mechanisms no longer exist. |
| Step 2 services: health, persistent development data, discarded test data, loopback-only ports, separate credentials | Re-proven with the new roles: SCRAM from the host, wrong passwords and cross-server credentials rejected with `28P01`. |
| Step 2 Doppler injection, SQL client container, launcher deadlines and confirmed per-target resets | Superseded by committed values, `pnpm db:psql` and `pnpm db:reset`. |
| One-time setup and lifecycle helpers (`.env.compose`, volume-ownership checks) | Superseded by native Compose scripts; the ownership guard has nothing left to guard. |
| Step 3A connection factory, limits, compiled exports, plain consumer | Re-proven in the connection suite, plus a new test that ambient `PG*` values cannot redirect the URL. |
| Step 3A target tuple and `DATABASE_URL` rejection | Superseded by A1; URL validation has new unit tests. |
| Step 3B constraints, scope/party rejection, races, replay, repeat application, chain rollback, lock timeout, interrupted migration | Re-proven on the regenerated chain, with fixtures running as the app role and a new app-role DML/DDL test. |
| Step 3B supervisor bounds: 120 s process deadline, 130/143 signal exits, Kit zero-exit check | Superseded; the migrator relies on connection timeouts and Node's default signal handling, and the Kit behavior is documented. |
| Step 4 factory, HTTP, logging and lifecycle unit tests | Re-proven unchanged, apart from the configuration shape. |
| Step 4.4/4.9/4.10 real process tests: startup failures, signals, drain, 10 s/17 s watchdogs, socket outage and recovery | Re-proven: 26 process tests through `DATABASE_URL` and owned loopback listeners. |
| Step 4.5 runtime image packaging | Re-proven: nonroot `node`, no mounts, compiled API/DB plus `dist/migrate.js` and the migrations. |
| Step 4.6 Compose runtime with Doppler, 4.7 development image and reload, 4.8 image smoke | Superseded by the parity stack, `pnpm dev` on the host and `pnpm test:stack`. |
| Step 4.9 native test-service outage and 4.10 container drain through stop/down and volume deletion | Not re-proven; they used removed helpers. `pnpm test:stack` proves the containerized SIGTERM exit 143, and the process suite proves draining. |
| Step 4.11 task graph and cache reuse | Re-checked in V2 (dry runs and reuse). |

## API composition and error-log rework (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved two API changes before
Foundation Step 5, handled like the foundation restructure (one branch, one PR), and
then approved the ten implementation choices below as recommended. This is not a
numbered guide step. Implemented in
[PR #112](https://github.com/WilliamPhilippe/storage-minis/pull/112).

**Rationale.** (1) Fastify's plugin model makes one composition root natural; tests
then exercise exactly what production runs, and `buildApp` could not host tRPC with
only the readiness check. (2) Fixed categories discarded every detail, making tRPC
development and production 500s undiagnosable; an allowlist keeps secrets out, and
error-level 4xx logs were noise.

| Area | Approved outcome |
| --- | --- |
| Composition root | `buildApp(httpConfig, { database, isClosing })` assembles the whole app from Fastify plugins with `app.register`; the health routes are the encapsulated plugin `src/health.ts`. Production and `app.inject()` tests build the same app. It still acquires no pool, listener or process handlers. |
| Dependency shape | `AppDependencies.database` is `Pick<Database, "db" \| "check">`: Step 5 receives Drizzle, while `close` and `healthy` stay with the lifecycle so no plugin can end the pool. |
| Lifecycle | `startLifecycle`'s `registerRoutes` option and the `registration_failed` category are removed. Plugins load in `app.ready()`; a failure there is `app_readiness_failed`, and Fastify's default 10 s plugin timeout ends a hung plugin before the 17 s watchdog. Pool ownership, signals, the 17 s startup watchdog, the 10 s shutdown bound, drain-then-close ordering and exits 130/143/1 are unchanged. |
| Client responses | Unchanged fixed bodies; no messages, stacks, causes or values. |
| Error record | `err: { type, code?, message?, stack, cause? }`, Pino's field names. `type` is the constructor name (or `typeof` for a non-Error throw); `code` only if a string matching `^[A-Za-z0-9_]{1,64}$` (Node code or Postgres SQLSTATE such as `23505`, `28P01`); `stack` keeps only the `at` frame lines, at most 20, because a multi-line message would otherwise leak through the stack's header; `cause` is followed to depth 3, since the DB package wraps the driver error as its cause. No other property (Postgres `detail`, a URL parser's `input`) is read. The serializer is `apps/api/src/error-log.ts`, also Pino's `err` serializer. |
| Messages | Logged only when `NODE_ENV` is exactly `development`. Before configuration, the lifecycle reads `process.env.NODE_ENV`; afterwards the app uses `httpConfig.nodeEnv`. `readApiConfig` now defaults `NODE_ENV` to `production` (fail closed), so both agree, and `.env.development` sets `NODE_ENV=development` for `pnpm dev`/`start`. The image and `compose.yaml` already set `production`. |
| Configuration errors | The API's own `ConfigurationError` keeps its message in every mode: it names only variables (`Check PORT.`) and wraps the DB package's fixed `DATABASE_URL` texts without their cause. |
| Levels | `request_failed` logs at info for 4xx and error for 5xx, with `category`, `status` and `err`; `readiness_unavailable` (warn) also carries `err`. Request fields (method, matched route template, status, elapsed time), authorization/cookie redaction and generated request IDs are unchanged. Inputs, bodies, URLs and headers are never logged. |
| Lifecycle lines | One JSON line per event on stdout, the request logs' stream: `{"level":30\|50,"time":<epoch ms>,"msg":"<category>","err":{…}}`; `listening` is 30, every failure and timeout 50. Written with `JSON.stringify` (no new dependency) and independent of `LOG_LEVEL`, because startup can fail before configuration is read. |

**Step 5 planning inputs (approved 2026-11-01):** register the tRPC adapter as a
plugin in `buildApp`; the tRPC context exposes `database.db`, never the whole
`Database`; request logs include the tRPC procedure name.

**Test changes.** The shutdown fixture wraps `buildApp`, as it already did for
`onClose`, and holds startup pending in the first `database.check()` (a lifecycle
phase that no Fastify plugin timeout bounds) instead of a registration callback, so
cancelled-startup ownership and the real 17 s and 10 s watchdogs keep equivalent
coverage. Lifecycle unit tests moved their registration cases to `app.ready()`.
Tests still assert that responses carry no details, and now assert the log policy:
allowlisted fields only, SQLSTATE through the cause chain, messages only in
development, and no database password or `DATABASE_URL` in any process output.

**Evidence (2026-11-01, branch `refactor/api-composition-error-logs`):** `pnpm check`
83 unit tests in 9 files; `pnpm build`; `pnpm test:api` 27 real-process tests
(one new: wrong credentials in development mode); `pnpm test:db` 29 tests;
`pnpm test:stack` 5 tests on rebuilt image
`sha256:8176e03deff7f9a68cadc898aaf7ab971c6ed072b75ec81abe0f6047297bac36`. Sample lines
for a 500, a 413 and a startup database failure in both modes are in the PR. This
is tooling evidence, not business acceptance.

## Step 5 tRPC and Zod plan approval (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved the
[Step 5 plan](step-5-trpc-plan-2026-11-01.md) as recommended, P5-01–P5-10.
Implemented in [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114);
the outcome, six implementation-time approvals and the evidence follow the table.
Choices the plan does not settle, and deviations that implementation forces, still
need approval.

**Rationale.** The plan keeps Step 5 diagnostic and table-free on the reworked
composition root and the approved planning inputs. It also prepares the transport
for later business mutations: a realistic body limit, mutations without input, and
one error format the client understands. It gives the React client a types-only
contract. Reading tRPC 11.22.1's source showed two problems the plan addresses:
its client sends a JSON content type with no body for mutations without input,
which Fastify's default parser rejects, and its own error messages repeat text the
client controls.

| Item | Approved outcome |
| --- | --- |
| P5-01 Packages | `@trpc/server` 11.22.1 (API dependency) and `@trpc/client` 11.22.1 (API devDependency, tests only), exact pins. |
| P5-02 Transport | `/trpc`; plain JSON without a transformer; `allowBatching: false`; no method override; no subscriptions; clients use `httpLink`. |
| P5-03 Bodies | 1 MiB on the tRPC route through an `onRoute` hook, 16 KiB elsewhere; a JSON parser scoped to tRPC accepts an empty body as no input; every array and string input has a `.max()`. |
| P5-04 Errors | One tRPC envelope for everything under `/trpc`: fixed messages, `data` limited to `code`, `httpStatus` and validation `issues` (`path`, `code`), and no stack, cause or path. Failures handled before routing keep Fastify's client-error body. |
| P5-05 Logs | `procedure` in request logs for matched procedures only, recorded by a base middleware; one `request_failed` per tRPC failure with the allowlisted `err`; input never logged. |
| P5-06 Context | `{ db: database.db, requestId }`; a module-private diagnostic builder; no exported unguarded builder. T02 later adds identity verification in `createContext` and authorization middleware. |
| P5-07 Procedure | `diagnostics.echo`, a query with a strict `{ message }` of 1–100 characters as input and output. |
| P5-08 Type export | `@storage-minis/api/types`, a types-only export of `AppRouter`. |
| P5-09 Layout | `apps/api/src/trpc/` (`init`, `context`, `errors`, `plugin`, `router`, `routers/`) and `src/types.ts`. |
| P5-10 Tests | An `app.inject()` matrix, a loopback test with `@trpc/client`, and a compiled browser-profile consumer; `//#test` depends on `@storage-minis/api#build`. |

### Implementation-time approvals (2026-11-01)

Reading and running tRPC 11.22.1 and Fastify 5.12.7 showed six points the plan did
not settle or could not meet as written. The owner approved each recommendation
on 2026-11-01:

| Topic | Approved outcome | Why |
| --- | --- | --- |
| Adapter route | `trpcRoutes` declares its own `/:path` route that calls the official adapter's `fastifyRequestHandler`, instead of registering `fastifyTRPCPlugin`. The 1 MiB limit is that route's `bodyLimit` option, so P5-03's `onRoute` hook is unnecessary. | The stock plugin replaces its scope's JSON parser with a raw-string pass-through and forwards multipart bodies. A probe showed it bypassed Fastify's prototype-poisoning check, returned `BAD_REQUEST` for malformed bodies and 500 for multipart, against P5-03 and cases 18–19. |
| Query JSON code | A `BAD_REQUEST` whose cause is a `SyntaxError` is reported as `PARSE_ERROR` (case 7). The log keeps tRPC's own error, with category `parse_error`. | tRPC parses a query's `input` inside its input reader and wraps the failure as `BAD_REQUEST`; malformed bodies (case 18) are `PARSE_ERROR`. The mapping uses tRPC's public `TRPCError`. |
| HEAD | tRPC answers `HEAD /trpc/<anything>` with 204 and no body before resolving a procedure. Kept, tested and documented. | No procedure, context or data is involved. |
| Oversized uploads | Kept Fastify's behaviour: an over-limit `Content-Length` is rejected unread and the connection closed, so a client still uploading may see `ECONNRESET` instead of the 413 envelope. The loopback test accepts either outcome and asserts the procedure never runs; `app.inject()` (case 15) asserts the exact envelope. | Draining an over-limit body would let a client hold a connection. A probe saw resets for about a third of 2–8 MiB uploads. |
| JSON content type | tRPC's public `responseMeta` sets `content-type: application/json` on every tRPC response. | tRPC labels errors raised before a call resolves (batching, its own media-type check) `text/plain`. Only the object form of `headers` sets rather than appends in 11.22.1; tRPC deprecates that form for v12, so revisit it on that upgrade. |
| TypeScript peer | `packageExtensions` in `pnpm-workspace.yaml` marks `@trpc/server` 11.22.1's `typescript` peer optional. | tRPC declares TypeScript a required peer although it uses it only in declarations, so `pnpm deploy --prod` shipped ~24 MB of unused TypeScript in the image (`node_modules` 69 MB → 45 MB). The root devDependency still satisfies the peer for type-checking and tests. |

### Implemented outcome

- `buildApp` registers `trpcRoutes` at `/trpc` with `appRouter` and
  `database.db`; production and `app.inject()` tests build the same app. The plugin
  holds the route, the empty-body JSON parser, scoped error and not-found handlers
  and the adapter's `onError` log; the root `frameworkErrors` handler sends
  malformed `/trpc` URLs to the same envelope.
- `diagnostics.echo` is the only procedure. `init.ts` exports tRPC's root object
  `t` (with `isDev: false` and the envelope formatter), not a procedure builder.
  Each router derives a module-private builder from `t.procedure` through
  `recordProcedure` (`context.ts`).
- The envelope helper (`trpc/errors.ts`) is built from `TRPCError`,
  `getHTTPStatusCodeFromError` and `TRPC_ERROR_CODES_BY_KEY`. It has a fixed
  message for every tRPC code, and at most 20 validation issues, each
  `{ path, code }`.
- Request logs add `procedure` through the `trpcProcedure` request decorator.
  Each tRPC failure logs one `request_failed` with `category`, `status`,
  `procedure` when recorded, and the allowlisted `err` (a `TRPCError` and its
  cause chain). Development logs include tRPC and Zod messages under the
  existing policy; these can name unknown keys or a requested path.
- `@storage-minis/api/types` exports only the `AppRouter` type; the browser
  type-check loads no Fastify or plugin declarations.

**Evidence (2026-11-01, branch `feat/step-5-trpc`):**
- `pnpm install --frozen-lockfile` passes.
- `pnpm check`: 8 tasks, 120 unit tests in 12 files (from 83 in 9): 5 envelope,
  30 adapter (section 5 cases 1–22, HEAD and the loopback client) and 2 consumer
  tests.
- `pnpm build` emits `dist/types.d.ts` and `dist/trpc/`.
- `pnpm turbo run test --dry=json` lists `@storage-minis/api#build` and
  `@storage-minis/db#build` under `//#test`. An API source edit missed
  `@storage-minis/api#build` and `//#test`; restoring it hit both again (root test
  hash `058dc2bd2b5f997b`).
- `pnpm test:api` 27 and `pnpm test:db` 29, unchanged.
- `pnpm test:stack` 5 on rebuilt image
  `sha256:54798c608f2f722de2d9c904a3985dcaaaaedbe940c6cdf930f4a3bae6a03744`. A
  `docker run` listing shows `node_modules/@trpc` holding only `server`, with no
  `@trpc/client` or `typescript` package.

This is tooling evidence, not business acceptance.

## Frontend foundation decisions (2026-11-01)

**Owner approval:** On 2026-11-01 the owner decided every item, W1–W11, of the
[frontend foundation proposal](frontend-foundation-proposal-2026-11-01.md) over
two review rounds. Nothing is implemented yet; each W11 delivery step gets its
own plan for approval. W7 replaces the React Hook Form choice in the
[accepted application stack](#accepted-application-stack) (2026-10-21) with
TanStack Form, and W2–W4 settle the design system, styling conventions,
application language and UI locale that the stack record left open. A
[follow-up review](frontend-foundation-proposal-2026-11-01.md#follow-up-review-2026-11-01)
the same day refined W4–W6 and W8–W11; the table shows the result.

**Rationale.** One SPA keeps one build, one image and one origin. Ant Design
covers the back office's components first-party, with their en-US and pt-BR
texts. i18next is the most widely used translation library and needs no build
step. TanStack Form takes Zod schemas directly and documents how to register the
app's antd fields once. A Firebase dev project with custom-token test sign-ins
avoids the Auth emulator's boilerplate while tests still use real Firebase
sessions and real token verification. The app is mobile-first, because most use,
especially of the catalog, is on phones.

| Item | Approved outcome |
| --- | --- |
| W1 App shape | One SPA, `apps/web`, holding the public catalog and the signed-in back office, split by route. |
| W2 Design system | Ant Design 6. |
| W3 Styling | antd theme tokens plus CSS Modules; antd's zero-runtime mode is prototyped in the first step. |
| W4 Languages and money | i18next with react-i18next; en-US main, pt-BR second; strings live in the frontend, split by area, and only the active language loads. Amounts carry no currency: the back office shows `$` with separators that follow the language and cents only when not zero (`$1,234.50` and `-$400.50` in en-US, `$1.234,50` and `-$400,50` in pt-BR), and the public catalog shows the Organization's currency symbol, `R$` (the default) or `US$`. Each Organization chooses its currency once; requirements v0.8 publishes the rule. |
| W5 Active Organization | No Organization id in back-office URLs. A session context holds the user, Memberships and active Organization for the whole UI; nothing is persisted while each user has one Membership; the API receives the Organization in a request header, and switching Organization clears the query cache. Catalog URLs are `/catalog/<nickname>`, with a unique nickname set once when the Organization is created and renamed only by a `global_admin`. |
| W6 Data layer | `@trpc/tanstack-react-query` over same-origin `/trpc`, with `httpLink`, no batching and no transformer. The link calls `getIdToken()` before each request, and requests follow user activity only, with no refetch on reconnect and no polling, so tokens refresh only while the user is active. |
| W7 Forms | TanStack Form with the app's own antd field components, replacing React Hook Form. |
| W8 Sign-in | Redirect on phones and popup on desktops; redirect runs through a same-origin `/__/auth/` proxy behind Caddy, and development signs in by popup through the dev project's `firebaseapp.com` domain. A session ends 7 days after the last Google sign-in: the API rejects ID tokens whose `auth_time` is older, and the app does not refresh such a session. A test-only custom-token sign-in for Playwright is accepted only behind an opt-in setting that only the committed development and test env files set. T02 settles the remaining session policies in its own record before PR 3. |
| W9 Tests | Vitest component tests inside `pnpm check`; Playwright next, on phone and desktop projects; every component located by role and label; tests run in `America/Sao_Paulo`. |
| W10 Build and tooling | A Caddy `web` image proxying `/trpc` and `/__/auth/`; the production Firebase web config committed as public identifiers, with the web build never run under Doppler; a browser TypeScript profile; React and TanStack ESLint plugins; no React Compiler yet. |
| W11 Delivery | Four PRs: web shell, Playwright, sign-in end to end, web image. The parity stack runs signed-out Playwright checks, and real phones first sign in on a deployed HTTPS environment. Foundation Step 6 stays TBD until the app is validated locally. |

Deferred by the owner: the structure of the Playwright sign-in, big-table
behavior (filterable lists are the default), persisting the active
Organization once users can belong to several, the nickname's remaining rules
(D04/E10), Organization invitations (TBD until the website is developed) and
Foundation Step 6 (TBD until the app is validated locally). The session limit
replaces the [authentication](#authentication-and-initial-administrator)
record's "No absolute or idle session timeout has been chosen". The proposal
holds the options considered, candidate versions and sources; each step's plan
re-verifies its pins.

## Frontend PR 1 web shell plan approval (2026-11-01)

**Owner approval:** On 2026-11-01 the owner approved the
[web shell plan](web-shell-plan-2026-11-01.md), WS-01–WS-13, for PR 1 of the
frontend decisions (W11 item 1, [#118](https://github.com/WilliamPhilippe/storage-minis/issues/118)),
with the changes listed after the table. Implemented in
[PR #121](https://github.com/WilliamPhilippe/storage-minis/pull/121); the outcome, five implementation-time decisions and the
evidence follow the design reference. Choices the plan does not settle, and
deviations that implementation forces, still need approval.

**Rationale.** The plan keeps PR 1 to the shell that later PRs build on, using
the decided stack. Scratch prototypes found where antd 6.6.8, pnpm 12 and the
strict flags differ from the proposal's assumptions:

- zero-runtime mode does not allow a strict style policy;
- antd 6.6.8 differs from the approved design in ten places;
- pnpm's release-age rule blocks the newest pins;
- CSS Module class names fail the strict flags without per-module
  declarations.

The plan settles each one.

| Item | Approved outcome |
| --- | --- |
| WS-01 Pins | Exact pins, each the newest version at least 24 hours old (pnpm 12's release age), so no exclusion entry is needed. Adds `@trpc/server`, `@types/react`, `@types/react-dom`, `@testing-library/dom` and `@testing-library/user-event`; i18next 26.5.12, react-i18next 17.1.9, Query 5.105.0. |
| WS-02 Layout | `@storage-minis/web`; a root `tsconfig.browser.json`; a solution-style `apps/web/tsconfig.json` with browser and Node profiles; extensionless imports in web code (Node packages keep `.js`); route files hold only route definitions, with pages in `src/features/`; one declaration file per CSS Module. |
| WS-03 Vite | Bound to `127.0.0.1:5173`, documented as `http://localhost:5173` (W8's authorized origin); `/trpc/` proxied to the API; the router plugin before the React plugin. |
| WS-04 Routes | `/` → `/app`; the Login page from its design, with no working feature; a catalog placeholder; the `/app` shell with a home page and eight section placeholders; the home page calls `diagnostics.echo`; typed page titles; pending, error and not-found pages; `routeTree.gen.ts` committed. |
| WS-05 Data | A QueryClient factory: no retry for 4xx; no refetch on reconnect; mutations never retried and never queued offline (`networkMode: "always"`). Loaders use `queryClient.query({ …, staleTime: "static" })`. |
| WS-06 Styling | W3 outcome: antd's runtime styles stay. In a real browser under `style-src 'self'`, both modes rendered unstyled, so PR 4's policy allows inline styles. Light mode only. antd's reset and one body rule. |
| WS-07 Design corrections | Ten corrections to the approved design from antd 6.6.8's behavior, among them `componentSize="medium"`, `Drawer size`, solid ink text, header heights as tokens, an accessible sidebar toggle and the FAB shadow as a component token. The owner applies them to the Claude originals, and PR 1 refreshes `docs/design/`. |
| WS-08 Shell | The design's TopBar, SideNav and MenuFab; link-based menus in named `nav` landmarks; the safe-area inset; logo files resized to twice their largest use. |
| WS-09 Languages | `common`, `app`, `login` and `catalog` namespaces, loaded per language through `import()`; typed keys; pt-BR typed against en-US, including plural `_many` keys; detection and switch failures handled in our code. |
| WS-10 Formatting | Money from integer cents through exact decimal strings; dates through `Intl` in the visitor's zone. |
| WS-11 Tests | A `web-unit` jsdom project inside `pnpm check`, with a fresh app per test, stubbed `fetch` and a console policy with declared exceptions. |
| WS-12 Tooling | The React and TanStack ESLint rules for web code; Node globals forbidden there; `//#lint` waits for the API build; ignore entries for generated files. |
| WS-13 Delivery | This docs PR, then one implementation PR in four commit groups, "Part of #118". |

**Owner changes at approval (2026-11-01):**

1. **Release age:** the newest versions at least 24 hours old ("They release
   new versions very frequently"), rather than waiting or adding exclusions.
2. **Design copy:** the owner updates the Claude originals first, and the
   repository copy is refreshed from them.
3. **Login page:** the first UI page. PR 1 builds it from its approved design,
   with no working feature; PR 3 adds sign-in.
4. **Design-system direction:** the personal look comes mostly from colors
   that follow the logo's racing red, with antd's own design and small tweaks
   for everything else. The approved color roles stay: ink is the primary
   color, and racing red is kept for attention.
5. **Light mode only:** for now the app has only a light theme.

**Design reference.** The owner approved the design system and the Login page
design in [`docs/design/`](../design/README.md) on 2026-11-01. They are design
references: an approved technical or requirements document wins where they
disagree, and each implementation still follows its own approved plan.

### Implementation-time decisions (2026-11-01)

Building the shell raised five points the plan did not settle. The owner
decided each on 2026-11-01:

| Topic | Decided outcome | Why |
| --- | --- | --- |
| Heading size and spacing | `components.Typography` sets `fontSizeHeading1: 22`, `lineHeightHeading1: 30 / 22` and `titleMarginBottom: 0`, so every h1 is a `title-lg` page title. CSS Modules set the gaps; where a gap sets the spacing, a two-class selector on our own classes removes a Paragraph's margin. The Login lead's `body-lg` (phones) and `body` (desktop) size is a CSS Module class. No `.ant-*` selector. | antd styles titles as `h1.ant-typography` (38 px, 0.5 em bottom margin) and paragraphs with a 1 em margin, which a single CSS Module class cannot override. The design asks for `title-lg` h1s spaced by gaps. |
| QueryClient instance | `lib/trpc.ts` exports the app's `queryClient = createQueryClient()` beside the `trpc` options proxy, as in tRPC's Vite SPA setup; `main.tsx` imports it. Tests still create a fresh client per test. | The proxy needs its QueryClient when it is created. Its `queryOptions()` never uses that client (checked in the 11.22.1 source), so each test's client runs every query. |
| Hard-to-override styles | In the owner's words: "We don't really need to overwrite so many styles. If it's not easy to overwrite, just ignore." Where antd's own styling needs more than a theme token or a single CSS Module class, antd's default stays; where a component token is enough, the design is followed (the FAB's icon is 24 px through FloatButton's `fontSizeIcon`). Four design details keep antd's default: the MenuFab's position (24 px from the right, 48 px from the bottom, clear of the iPhone home indicator) instead of `fab-offset` plus the safe-area inset; the drawer menu's 14 px text instead of 16 px; the drawer's square top corners instead of `radius-lg`; and the inline Menu's own right border next to the SideNav's. | antd positions the FloatButton with a two-class selector and internal tokens, draws the inline Menu's border with a three-class selector, and rounding the drawer needs a class on its wrapper. |
| Selected backgrounds | `colorPrimaryBg` is `surface-sunken` (`#eef0f3`) and `colorPrimaryBgHover` is `line` (`#e3e6ea`). They feed `controlItemBgActive` and `controlItemBgActiveHover`, so a selected dropdown item is ink on `surface-sunken` (15.6:1) and a hovered one ink on `line` (about 14:1). A `theme.test.ts` case checks both values and their contrast in both themes. | antd derives these from steps 1 and 2 of `colorPrimary`'s palette. For ink they come out as `#5b5f61` and `#4f5254`, so the language switch's selected item read ink on mid-grey (2.7:1, below 4.5:1). The same tokens style selected rows, nodes and cells in Table, Tree, Cascader, DatePicker, Calendar, Transfer and Steps. Owner, 2026-11-01, after reviewing the PR. |
| Language switch placement | In the shell, the switch leaves the TopBar (WS-07 #10's interim place) for the bottom of the SideNav, right above the collapse button, and the footer of the MenuFab's drawer, below the menu list. It shows the globe and the language code, "EN" or "PT", and the globe alone in the collapsed SideNav; its accessible name stays "Language: English", and the dropdown opens upward. The Login and catalog pages keep the switch in their header with the language's name. PR 3's account menu therefore no longer takes the switch. | The owner's direction after reviewing the PR (2026-11-01). The TopBar holds only the logo on phones and the page title from `bp-md`. |

While the refresh was pending, `apps/web/src/ui/tokens.css` stayed a
byte-identical copy of `docs/design/system/tokens.css` (owner, 2026-11-01).
The owner applied the WS-07 corrections to the Claude originals during
implementation, and this PR refreshes `docs/design/` from them, so the copy now
includes `header-height` and `header-height-phone`.

### Implemented outcome

- **Package.** `apps/web` is `@storage-minis/web`, with the WS-01 pins and no
  `minimumReleaseAgeExclude` entry. Vite 8 runs the TanStack Router plugin
  before the React plugin, binds `127.0.0.1:5173` (preview `4173`) and proxies
  `/trpc/` to the API. The root `tsconfig.browser.json` and a solution-style
  `apps/web/tsconfig.json` give browser and Node profiles.
- **Routes.** `/` redirects to `/app`. `/login` is the Login page.
  `/catalog/$nickname` is a public placeholder. `/app` is the shell with a home
  page and eight section placeholders. Route files hold only definitions, and
  `routeTree.gen.ts` is committed. `staticData.titleKey` drives one h1 per page
  and `document.title` ("Inventory · StorageMinis").
- **Data.** `lib/trpc.ts` holds `createQueryClient`, the app's `queryClient`,
  the `httpLink` client, the options proxy and `describeError`. The home
  loader runs `queryClient.query({ ...echoQuery(trpc), staleTime: "static" })`
  and the page reads `diagnostics.echo` with `useSuspenseQuery`.
- **Languages.** The `common`, `app`, `login` and `catalog` namespaces load per
  language through `import()`. Boot loads `common` with the antd and dayjs
  locales. A switch loads the already loaded namespaces first; a failed
  switch keeps the language, and the last of overlapping switches wins.
- **Styling (W3 outcome).** antd's runtime CSS-in-JS stays, so PR 4's policy
  allows inline styles (`style-src 'self' 'unsafe-inline'`). antd's reset, the
  token copy, the allowed overrides and one body rule; light only, with
  `color-scheme: light`.
- **Shell.** TopBar, SideNav with its own toggle and a remembered choice
  (`storage-minis.sideNav`), MenuFab with a bottom drawer, and link-based menus
  in `nav` "Main menu" landmarks. The language switch ("EN" or "PT") sits at
  the bottom of the SideNav and in the drawer's footer. The logo, mark and favicon are resized
  copies.
- **Login page.** State 1 on phones and in the 400 px desktop card. The button
  has no action, nothing imports Firebase, and Google's "G" waits for PR 3.
- **Tests.** The `web-unit` project (jsdom, `America/Sao_Paulo`) runs inside
  `pnpm check`. `src/test/harness.ts` holds the browser stubs, the fetch guard
  and the console policy that `setup.ts` installs.
- **Design copy.** `docs/design/system/` is refreshed from the Claude originals:
  the WS-07 corrections, the two text fixes and the notes for later screens.

Implementation notes, not decisions: the home page's title is "Home"; the
pt-BR strings are first translations for the owner's review;
`viewport-fit=cover` lets the content's bottom padding include the safe-area
inset; and the generic error page shows a server message only for tRPC errors.
The design's `theme.ts` does not list the Typography tokens, FloatButton's
`fontSizeIcon` or the `colorPrimaryBg` pair yet, TopBar.md, SideNav.md and
MenuFab.md still place the language switch in the TopBar, and `ant-design.md` still names `main.tsx` as the
ConfigProvider's owner (the code puts it in `ui/AppProviders.tsx`, switching
between `theme` and `phoneTheme`), so a later refresh of the originals should
add them. The logo links and the not-found page's home link are current
(`aria-current`) only on `/app` itself.

**Evidence (2026-11-01, branch `feat/web-shell`):**

- `pnpm install --frozen-lockfile` passes. `pnpm-workspace.yaml` is unchanged:
  no `minimumReleaseAgeExclude` entry and no new `allowBuilds`. `pnpm peers
  check` finds no issue. The TanStack and tRPC agent skills stay unapproved.
- `pnpm check`: 9 tasks, 194 unit tests in 23 files (from 120 in 12). The
  `web-unit` project adds 74 tests in 11 files: money, dates, languages, a
  failed switch, the theme's selected backgrounds, the pending page, the
  shell, the document title, routes, the Login page and the echo card.
- `pnpm check --dry=json` lists `@storage-minis/web#typecheck`, and `//#lint`
  depends on `@storage-minis/api#build` and `@storage-minis/db#build`.
- Each guard was broken on purpose and failed: an undeclared console warning,
  an unstubbed `fetch`, a removed `aria-hidden` on a menu icon, the
  last-switch-wins check, the title fallback when the `app` strings fail, the
  selected-background tokens (the old theme gave `#5b5f61`), and
  in `tsc` a missing pt-BR key, an extra key, a missing `_many`, a wrong `t()`
  key and a wrong title key.
- `pnpm build` builds `apps/web/dist`. First catalog visit: about 282 KiB
  (gzip −9) of JavaScript and CSS (252.6 initial JavaScript, 2.2 CSS, 27.2 for
  the catalog page, plus the string chunks). The 22.5 KiB shell chunk loads
  only on `/app`.
- Without `routeTree.gen.ts`, `pnpm --filter @storage-minis/web build`
  regenerates it byte-identically. `cmp` finds `apps/web/src/ui/tokens.css`
  identical to `docs/design/system/tokens.css`.
- `pnpm test:api` 27 and `pnpm test:db` 29, unchanged. `pnpm test:stack` 5 on
  an image rebuilt with the new lockfile.
- Live echo: through `http://127.0.0.1:5173` and `http://localhost:5173`, the
  proxy returned the API's exact 200 and 400 bodies, and `/trpcx` returned the
  app's `index.html`. With the API stopped, the card showed "Can't reach the
  server" 7.6 s after navigation, after four requests (the first and three
  retries at about 1, 2 and 4 s). With the API restarted, "Try again" showed
  the echoed message.
- Browser pane at 375 × 812, 900 and 1280 wide: no sideways scroll; header 56
  and 64 px; 44 and 40 px controls; ink primary buttons and solid ink text
  (`rgb(22, 27, 33)`); the FAB's `shadow-fab`; the current item at weight 600;
  SideNav collapsed at 900 and expanded at 1280; one h1 per page; no console
  warning.
- The Login page at 390 × 844 and 1280 × 800 matches `screens/1-sign-in.png`
  and `screens/5-desktop.png`, apart from the "G" placeholder: h1 22/30/600,
  lead 16 px then 14 px, button 44 then 40 px, a 400 px card on desktop. At
  390 px it has no sideways scroll (`scrollWidth` 390). Its button does
  nothing, and the network list shows no external request.
- The language switch sits above "Collapse" in the SideNav at 1280 ("EN"),
  as a 40 px globe-only button above "Expand menu" at 900, and as a 44 px
  "EN" button in the drawer's footer at 375; the TopBar has no button.
- The language switch's selected item renders ink on `rgb(238, 240, 243)`,
  and on `rgb(227, 230, 234)` when hovered (it was `rgb(91, 95, 97)`).
- Under emulated dark mode, the page and the browser's controls stay light.
- On `vite preview`, `/catalog/demo` and `/app` load only the en-US string
  chunks. A switch to pt-BR adds only the pt-BR `common` and `app` strings and
  the antd and dayjs locales.

This is tooling evidence, not business acceptance.

## Next foundation steps — planning checklist (2026-10-24)

**Status: proposed implementation checklist, not approved technical decisions or
implemented behavior.** On 2026-10-24, the owner identified the next five steps:
development PostgreSQL through Docker Compose, Drizzle connection/migration
tooling, Fastify boilerplate, tRPC/Zod integration, and smoke checks/setup
documentation. The owner requested prerequisite guidance and documentation of
important details. This authorizes this planning update; unspecified versions,
tools, configuration, and implementation approaches still require approval.

The existing checks-only Turbo setup remains the accepted starting point. Add
real tasks and their dependency/cache declarations alongside the functionality
they execute. A separate speculative Turbo expansion is not a prerequisite.
Frontend scaffolding, remote caching, CI and production deployment remain later
work; these five steps alone do not deliver the full frontend/backend foundation.

For agent assignments, use the [technical foundation implementation guide](technical-foundation-implementation-guide.md).
It organizes this scope into six sequential agent steps by separating the Node
tooling container from PostgreSQL setup, and defines the research, plan,
completion and handoff expected of each agent. It preserves the approval and
prerequisite boundaries below.

### Before implementation: approve the foundation proposal

The [2026-10-24 foundation proposal](t06-foundation-proposal-2026-10-24.md)
records inspected local prerequisites, exact candidate versions, F01–F14 approval
items, the proposed commands/task graph, and deferred schema/security/acceptance
gates. **Remaining implementation choices are pending approval. Doppler's provider
selection is approved, and Docker Desktop availability is verified.**

Prepare one concrete proposal under [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26)
covering compatible exact dependency/image versions, the PostgreSQL driver,
development runner, build/start approach, package exports, migration workflow,
environment loading/validation, and the commands/task graph for these steps.
Preserve the existing Node.js/pnpm pins, ESM/NodeNext conventions, centralized
tooling, and approved strict checks. Give a recommendation, alternatives,
tradeoffs and verification plan for each new choice before asking for approval.
Record actual approved outcomes separately, with date and rationale.

Read the live issues and comments before implementation. Their existing
dependencies and delivery ownership remain in force:

| Checkpoint | Required boundary |
| --- | --- |
| Before any new installation or configuration | Obtain approval for the concrete T06 proposal. Identify the explicitly approved partial-bootstrap scope and its deferred outputs; this checklist does not waive T06's T01/T02/T04 prerequisites or move/close issues. |
| Before business schema migrations or representative persistence operations | Reconcile [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), applicable [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) contracts, the [database design guide](../database/design.md), and the [approved updates](../requirement-updates/README.md). The DBML still has deferred uniqueness/scope keys and conceptual composite references without executable FK targets. It cannot be translated mechanically into migrations. |
| Before protected business procedures or administrator bootstrap | Obtain the applicable [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) authorization/bootstrap decisions. Diagnostic scaffolding must not introduce business access through a temporary authentication bypass. |
| Before operational/deployment acceptance | Resolve applicable [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) configuration, release/migration and recovery decisions. Local Compose does not select production hosting, backup retention or restore targets. |

The proposal should distinguish infrastructure-only connection/migration-tool
setup from business-schema delivery. If schema approval remains pending, state
which checks can run without application tables and what migration evidence is
deferred. Do not invent permanent sample domain tables to make the scaffold pass.

### Step 1: Docker Compose with PostgreSQL

Items to resolve and verify in the implementation proposal:

- Pin the PostgreSQL image and document supported local architecture and Compose
  requirements. Inspect the existing Docker runtime first; any runtime install
  or developer-environment change needs its own concrete approval.
- Define development database/user settings, host binding and configurable port,
  persistent storage, and workspace-specific project/volume naming. Multiple
  checkouts must have a documented way to avoid port collisions and unintended
  database sharing. Keep test database/storage ownership explicit.
- Document variable names and Doppler config mapping without secret values.
  Specify how Compose and container Node commands receive required values,
  including host versus Compose-network addresses. The copied `.env` setup path
  is superseded.
- Define a bounded readiness check and verify a real connection. Container
  startup alone does not establish database readiness; see [Compose startup and
  readiness](https://docs.docker.com/compose/how-tos/startup-order/).
- Document start, readiness, stop, logs and separately invoked destructive reset
  commands. Verify ordinary stop/start preserves data. Database lifecycle/reset
  commands must execute uncached; database storage is outside Turbo outputs.

### Step 2: Drizzle connection and migration tooling

- Compare supported PostgreSQL drivers and propose exact Drizzle/driver/tooling
  versions. Define connection/pool ownership, initialization, timeouts, cleanup
  and error behavior so importing a package does not unexpectedly start database
  work. Reuse the same agreed environment contract in CLI and API entry points.
- Propose the migration source of truth, generation/review/application workflow,
  file locations and metadata, repeat-application behavior, and failure/recovery
  procedure. Compare reviewed versioned SQL with direct schema push and choose
  explicitly; Drizzle supports multiple [migration workflows](https://orm.drizzle.team/docs/migrations).
  State whether migration application is a separate command or startup action;
  do not select automatic startup migration implicitly.
- Keep committed migration SQL/metadata distinct from disposable build output.
  Applying migrations changes external state and must run uncached. The proposal
  should initially keep migration generation uncached too, with its files
  reviewed as source changes rather than restored as build artifacts.
- Establish the DB package's public runtime/type exports and the API's declared
  workspace dependency when it imports them. Decide whether consumers use source
  or compiled output, how development observes DB package edits, and which
  prerequisites and dependency inputs builds/typechecks actually require.
- Include new Drizzle/CLI TypeScript configuration in strict typecheck and typed
  lint coverage; existing package includes cover source, tests and Vitest config
  only. Verify a real connection and client shutdown. After schema approval,
  verify migration replay on a fresh database and a second application without
  duplicate changes. Preserve the latest partial-expense-payment approval and
  all scope/uniqueness invariants when implementing business tables.

### Step 3: Fastify server boilerplate

- Propose a testable application factory separately from the process entry point,
  with explicit configuration and DB-resource ownership. Define host/port,
  startup failure, signal handling, graceful server close and pool cleanup.
  Fastify documents [application construction and request injection for tests](https://fastify.dev/docs/latest/Guides/Testing/).
- Specify development, build and start commands, runtime dependencies, emitted
  files and package exports. Current TypeScript profiles use `noEmit`; they do
  not produce a runnable build. Verify the approved built entry point resolves
  the DB package under Node.js without relying on the development runner.
- Propose health endpoint paths, response contracts and availability semantics:
  distinguish whether the process is alive from whether required dependencies
  are ready. Define behavior when PostgreSQL is unavailable, including bounded
  failures, useful logs and responses that omit credentials/private details.
- Add real root/package commands to Turbo with ordering based on imports and
  required artifacts. Persistent development tasks use `cache: false` and
  `persistent: true`; keep them outside finite task prerequisites. Declare actual
  build outputs and verify restoration. See [Turbo task configuration](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks).
- Preserve strict environment filtering. Account for Doppler injection placement:
  declare variables before Turbo computes cached-task hashes, or keep a task
  uncached when its inputs cannot be captured. Document precedence and any
  approved fallback storage. See [Turbo environment handling](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).

### Step 4: tRPC integration with Zod

- Verify compatibility of the proposed Fastify/tRPC/Zod versions and use the
  documented [Fastify adapter](https://trpc.io/docs/server/adapters/fastify).
  Propose the route prefix, router layout, request context, error mapping and
  response/serialization contracts rather than inheriting example defaults.
- Use a minimal diagnostic procedure to exercise runtime [Zod input validation](https://trpc.io/docs/server/validators)
  and typed responses. Verify both accepted and rejected input through the
  actual HTTP adapter; calling a router directly does not verify its transport.
  Keep domain-specific money/date filters subject to T03 contracts.
- Define how the request context receives the DB dependency and later verified
  identity/Organization authorization. Keep diagnostics distinct from business
  procedures. Firebase identity alone does not grant Membership access; any
  protected operation requires the applicable approved T02 enforcement.
- Propose a type export for the future React client that preserves independent
  application builds and keeps server initialization, database code and secrets
  out of the browser runtime. Frontend HTTP calls alone do not create a Turbo
  build dependency; declared package imports and required artifacts determine it.
  Frontend scaffolding and final CORS policy remain explicit later decisions.

### Step 5: smoke checks and setup documentation

- Document a verified path from frozen install and example configuration through
  PostgreSQL readiness, approved migration application, build/start, health and
  valid/invalid tRPC requests, then normal shutdown. Record actual versions,
  commands, expected results and limitations in the README. Include database
  unavailable, invalid configuration and occupied-port behavior.
- Add meaningful Vitest tests for the implemented configuration/server/adapter
  behavior. Create separate real-PostgreSQL test configuration with explicit
  database targeting, isolation/reset mechanics and cleanup; existing unit
  projects intentionally exclude integration files. Keep live-database and
  running-service smoke checks uncached, outside ordinary database-free checks
  unless a different aggregate contract is explicitly approved.
- Verify Turbo task discovery, dependency invalidation after DB package edits,
  strict environment handling, successful reuse for unchanged cacheable tasks,
  artifact restoration after deleting build output, repeated execution of
  uncached database tasks, and nonzero exit propagation on failures.
- Keep the ordinary empty-suite failure policy. A DB connection query, health
  response or passing bootstrap test does not establish transaction atomicity,
  Organization isolation or concurrency correctness. Record those checks as
  scaffold evidence and identify the remaining T06 acceptance work explicitly.
- Before T06 completion, supply the issue's real-PostgreSQL rollback,
  Organization isolation, global Product reuse/private-data rejection and
  deletion-versus-funding or settlement-source race evidence, together with the
  applicable broader concurrency cases. Frontend/Playwright, CI and production
  readiness stay tracked under their existing owners and prerequisites.

### Prompt for the prerequisite planning agent

```text
Prepare an approval-ready foundation implementation proposal for T06 / #26.
Read AGENTS.md, docs/technical-direction.md (especially the 2026-10-24 planning
checklist), docs/agents/issue-tracker.md, docs/database/design.md, the approved
update logs, and live issues #21, #22, #23, #24 and #26 including comments.

Inspect the current workspace, package scripts, Turbo configuration and local
Docker availability without installing or changing tools. For the five planned
steps, recommend compatible exact dependency/image versions, a PostgreSQL
driver, development/build/start approach, package exports and dependencies,
migration workflow, environment contract, and Turbo task/cache behavior. Give
alternatives, tradeoffs and concrete validation for each unapproved choice.

Identify the T01/T02/T03/T04 decisions required before each affected operation,
especially DBML keys/constraints before business migrations and authorization
before business procedures. Separate infrastructure-only bootstrap from pending
business schema and full T06 acceptance. Preserve existing issue dependencies.

Write the proposal as pending approval in technical documentation, then present
the concrete decisions for owner approval. Do not implement new choices,
install/configure tools, change issue state, or treat this prompt as approval.
```

## Approval workflow (2026-10-23)

The owner requires agents to ask first, with a recommendation, before making any
new or changed technical or implementation decision. Follow the
[owner-approval workflow](../../AGENTS.md#owner-approval-before-decisions), including
for tooling, packages and versions, CLIs, architecture, configuration, and local
environment changes. Existing approved choices retain their recorded scope.

## Accepted application stack

| Area | Accepted choice | Scope |
| --- | --- | --- |
| Repository | One monorepo for backend/API and frontend | Applications may deploy independently to different providers. No provider has been selected. |
| Language | TypeScript with strict checking | Backend, frontend, and shared application packages. |
| Package management | pnpm workspaces | Dependency installation and internal package links. |
| Build tasks | Turborepo | Repository task scheduling and build caching; cross-provider deployment coordination remains a CI/CD decision. |
| Backend | Node.js with Fastify | Business operations remain subject to application authorization and database atomicity. |
| API contract | tRPC | Typed frontend/backend API; naming, errors, pagination, and mutation retry/idempotency conventions remain T06 design work. |
| Runtime validation | Zod | Validate API inputs; frontend validation does not replace backend validation or business constraints. |
| Frontend | React with Vite | Separate frontend application. |
| Routing | TanStack Router | Client navigation and URL state. |
| Server data | TanStack Query with the tRPC integration | Scope private caches by Organization and authentication context while preserving global Product reuse. |
| Forms | TanStack Form with Zod | Form handling and input validation; replaced React Hook Form on 2026-11-01 ([frontend foundation decisions](#frontend-foundation-decisions-2026-11-01)). |
| Database | PostgreSQL | Final schema, constraints, and transaction/concurrency design remain pending. |
| Persistence access | Drizzle ORM | Migration workflow and database-driver/version selection remain T06 work. |
| Development infrastructure | Docker Compose for PostgreSQL | Production direction (2026-10-31): the same Compose model on a single Hostinger VPS; hosting and operations details remain T04 work. |
| Environment variables | Doppler | Production values in config `prd` through a read-only VPS service token (keys created under T04). Local development and test values are committed (2026-10-31, R3/R8/R12). |
| Tests | Vitest and Playwright | Vitest for unit/integration tests, including real PostgreSQL for rollback, constraints, and concurrency; Playwright for core administrator and public-catalog workflows. |
| Lint and formatting | ESLint and Prettier | Concrete settings and commands approved in the 2026-10-23 tooling setup above. |

The choices provide shared TypeScript contracts within one repository while retaining independent frontend/backend deployment. They do not introduce additional domain features or settle unresolved business policies.

**Design system and UI conventions:** the owner preferred Ant Design on 2026-10-21 and confirmed Ant Design 6 on 2026-11-01, styled with antd theme tokens and CSS Modules, with en-US as the main UI language and pt-BR as the second, on a mobile-first layout. See the [frontend foundation decisions](#frontend-foundation-decisions-2026-11-01).

## Authentication and initial administrator

Accepted choices:

- Firebase Authentication with the Google provider only; email/password sign-in is excluded.
- Use Firebase ID tokens for API authentication. The API verifies those tokens and enforces User/Membership/Organization authorization for business access.
- Keep the user signed in through token refresh when a token expires during active use. Inactive users receive no refresh. Token expiry during active use does not require signing in again each hour.
- Support explicit logout.
- The initial administrator is the owner's personal Google account, `ctt.williamphilippe@gmail.com`, supplied on 2026-10-21 as the setup identity. The bootstrap/configuration mechanism remains pending. Firebase credentials have not been supplied.

Firebase documents that ID tokens last for an hour and refresh tokens can obtain new ones. Browser persistence is a separate setting. The public `getIdToken()` method can also refresh an expired or soon-expiring token when called; T02 must design token acquisition and any background activity around the accepted active-use policy. See [Firebase session management](https://firebase.google.com/docs/auth/admin/manage-sessions), [authentication-state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), and [token acquisition](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken).

Examples: while the administrator is using the system, token expiry triggers refresh and work continues without an hourly interactive sign-in. If the administrator is inactive, the client does not refresh the token. The administrator can explicitly log out. A valid Google/Firebase identity without the required application authorization does not grant access to private inventory or financial records.

**Session decisions (2026-11-01):** the [frontend foundation decisions](#frontend-foundation-decisions-2026-11-01) settled token acquisition and return after inactivity. The client requests a token only when a request needs one, and requests follow user activity only, so tokens refresh only while the user is active. Returning after inactivity refreshes on the first action. A session ends 7 days after the last Google sign-in: the API rejects ID tokens whose `auth_time` is older, and the client does not refresh such a session. There is no idle timeout. Until then no absolute or idle session timeout had been chosen.

[T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) still needs the administrator bootstrap mechanism, browser persistence policy, logout scope/revocation, Google-account recovery expectations, and expiry/recovery acceptance cases, in its own approved record before the frontend's sign-in step. Initial-admin selection must use the configured owner identity; an arbitrary first Google sign-in is not authorization.

## Money and dates

Accepted choices:

- Each Organization's amounts are in its own currency, chosen once when the Organization is created: BRL by default, or USD (REQ-008, ORG-010; owner, 2026-11-01). Amounts carry no currency themselves, and visitor timezone or locale does not introduce currency conversion.
- Store timestamp instants in UTC. The UI converts them for display in the visitor's timezone.
- Daily/monthly financial reports use the fixed business timezone `UTC` for all viewers, as confirmed by the owner on 2026-10-21. Visitor-local timestamp display does not change report periods.
- Preserve the distinction between the business event date and its recorded timestamp, as required by REQ-011, FIN-011, CALC-018, and the accepted shared-history model. Calendar-date input/storage semantics remain T03 work.

Example: `2026-11-01T01:00:00Z` may display as October 31 at 22:00 for a visitor in UTC-03:00. A business event dated November 1 in UTC remains in November's report for every viewer. Report membership follows UTC and the applicable source business date rather than the viewer's display timezone.

[T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) still needs exact integer-cent representation, intermediate precision and rounding, deterministic cent remainders, date-only/business-date semantics, period-filter semantics, and dated-adjustment acceptance examples. The storage and reporting timezone is settled as UTC. PostgreSQL plus Drizzle does not choose the remaining policies automatically.

## Step 3B structural schema (2026-10-25)

**Partly superseded (2026-10-31):** The approved structure stands. The
`0000_base` + `0001_customer_name_whitespace` chain was regenerated as
`0000_inventory_id_base36` (custom) + `0001_baseline`; the baseline matches the
reviewed chain except the folded constraint (D8). The generation wrapper is
removed. See [Foundation restructure](#foundation-restructure-2026-10-31).

The owner approved the [S01–S10 schema review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/database/step-3b-schema-review-2026-10-25.md)
on 2026-10-25: “Schema is approved. Implement it.” The resulting
[implementation/reconciliation record](../database/step-3b-implementation-2026-10-25.md)
is authoritative for the structural delivery and named writer deferrals. This
supersedes the earlier Step 3A migration gate and its pending-schema statements.
The one-time Compose/setup behavior remains; `pnpm docker:migrate` now applies
pending committed development migrations through native Drizzle.

Implemented scope is 33 tables, 316 columns, 11 enums, 157 FKs, 76 row checks,
48 unique constraints and 32 explicit indexes. The 310-column/158-reference draft
is preserved in the review packet; the synchronized DBML includes the approved
permission/public fields, Customer name and generated scope representation.
The migration chain is `0000_base` plus `0001_customer_name_whitespace`, with
native snapshots/journal and history at `drizzle.__drizzle_migrations`. The
immutable base36 function is the only custom migration function. No dependency
or version changes were needed. Compiled exports now include the typed `schema`.

Generation remains offline and application remains explicit. The wrapper fixes
Kit's package working directory/relative snapshot path, checks its native terminal
success marker because some generation errors exit zero, and bounds live CLI
connections/processes with sanitized failures. A temporary failing-schema test
reproduces the upstream zero exit and proves the wrapper returns nonzero. The
SQL-client watchdog installs cleanup before its delay and closes inherited output
pipes, correcting an immediate-client-exit race exposed by setup checks.

Validation, on the pinned Docker toolchain and disposable PostgreSQL 18.6:

| Check | Result |
| --- | --- |
| `./scripts/tooling.sh run pnpm check` | All seven Turbo tasks passed; 24 unit tests. Strict source/config types, lint and formatting passed. |
| `./scripts/tooling.sh run-db test pnpm test:db` | 29 tests passed: 19 schema/migration checks and 10 connection/lifecycle checks. Includes fresh replay, catalog coverage, repeat no-op, full-chain rollback, real uniqueness races and interrupted migration backend cleanup. |
| No-change `db:generate` | Native “No schema changes” result; hashes of all five SQL/snapshot/journal artifacts unchanged. |
| SQL client / documentation | Authenticated test identity check passed after watchdog fix; Bash syntax, diff whitespace, changed relative Markdown paths/fences and diagram field/reference reconciliation passed. |

The schema tests preserve global Product reuse while rejecting cross-Organization
acquisition/event paths and cross-Customer/Supplier funding. They cover readable
identity, zero/nonnegative prices, positive cash, int32 overflow, UTC milliseconds,
installment/completion checks, opening/unknown-Supplier uniqueness and retained
SaleItem audit identity. Separate overlapping PostgreSQL sessions prove one
winner for active commitments and collection membership. A copied full migration
chain with an invalid final statement rolls back source DDL/function and history
entries; a real CLI lock wait fails at five seconds. Full business writers,
source/cache reconciliation, permanent locks, authorization and reporting remain
explicitly deferred to their owners. First development application is an owner
command after reviewing these artifacts; no development schema/data, seed,
spreadsheet import or production state was changed.

### DB command error visibility follow-up (2026-10-25)

**Partly superseded (2026-10-31):** The direct native migrator and its detailed
redacted errors remain in `src/migrate.ts`; the supervising child process and
`db:check` are removed. See [Foundation restructure](#foundation-restructure-2026-10-31).

The owner requested that DB scripts log their actual error messages. Command
handlers now retain messages, nested causes and driver codes, redacting the
injected password and PostgreSQL URL credentials. Check/shutdown/artifact errors
preserve their causes. The Doppler launcher forwards payload stderr before
suppressing its own fetch diagnostics; errors from Docker and the DB commands
reach the terminal.

**Owner approval, 2026-10-25:** “Approve the direct Drizzle ORM runner
(recommended).” Kit 0.31.11 bundles Hanji's `renderWithTask`, whose rejection
handler calls `process.exit(1)` without logging or rethrowing the error. Capturing
its streams therefore cannot recover migration authentication/lock errors. The
application now invokes the same installed
`drizzle-orm/node-postgres/migrator` used internally by Kit, retaining the existing
commands, SQL/journal/history, native transactions, process supervision and timeout
settings. This avoids a third-party patch or dependency/version change and
supersedes the earlier `drizzle-kit migrate` application entrypoint. Generation
remains on Kit. The separate runner owns and closes a single-connection pg pool;
the existing supervisor still bounds its process and forwards signals.

`pnpm check` passes all seven tasks and 27 unit tests (strict types, lint and
formatting included). `./scripts/tooling.sh run-db test pnpm test:db` passes all
30 real-PostgreSQL tests: 20 schema/migration checks and 10 connection/lifecycle
checks. The two migration message assertions that failed with Kit now pass:
authentication failures and lock timeouts include the actual message/code while
passwords remain absent. Fresh replay, repeat application, native rollback and
interrupted backend cleanup also pass. Bash syntax and diff whitespace pass.
No development migration or data reset was performed; SQL/snapshot/journal
artifacts and dependency versions are unchanged.

## Remaining design and delivery boundaries

| Work item | Still required |
| --- | --- |
| [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) | Base structural keys/scope/commitment/collection uniqueness are implemented in Step 3B. Complete state-transition writers, permanent locks, aggregate/source reconciliation, typed history and actual business-operation races. |
| [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) | Complete bootstrap, persistence, activity/inactivity handling, return behavior, logout scope/revocation, and recovery around the accepted Google/ID-token/active-use-refresh/logout choices and supplied administrator email. |
| [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) | Complete exact monetary, business-date, and period-filter rules around BRL, UTC storage/reporting, and visitor-local timestamp display. |
| [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) | Hosting, deployment and release coordination, Doppler access/integration/rotation/fallback policy, storage, daily backup retention/restore verification, recovery targets, browser/device support, performance targets, and operational monitoring. The [foundation restructure](#foundation-restructure-2026-10-31) sets direction only: single Hostinger VPS, `prd` keys, Caddy `web` image (D5), GHCR images (D9), daily `pg_dump` with tested restore (D10), and a deploy that runs `migrate` as a one-off before `up` (R19). |
| [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Inspect the real spreadsheet and agree on legacy acquisition treatment; source data is not supplied. |
| [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) | Steps 1–3B provide the workspace, local databases, typed Drizzle schema and migration replay. Step 4 delivered the diagnostic API/image/cache/lifecycle, and the 2026-10-31 restructure moved them onto host Node, standard Compose, database roles and a parity stack. Complete Step 5 tRPC, Step 6 consolidated setup/verification, application authorization/isolation, representative business transactions/races and CI. |

T06's existing T01/T02/T04 prerequisites remain in force. The requirements continue to have their existing primary delivery owners; this record adds no duplicate delivery work. D01-D08 remain business-policy boundaries.

Hosting and operations are deliberately left open. Railway was discussed as an example, not selected. The [documentation/backlog review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/technical-direction-review.md) records propagation to current documents and affected issue criteria. Decision and delivery issues remain open; no production infrastructure has been provisioned. Workspace/tooling checks and structural PostgreSQL tests are implemented as recorded above; the Step 4 API build/runtime foundation is delivered; frontend, later API integration, business workflows and their acceptance evidence remain pending.

## Documentation cleanup (2026-10-29)

The owner selected A1–A8 and B1–B6 from the documentation map for deletion:
completed/replaced plans and prompts, completed reviews and verification records.
The six C baseline files remain. Current commands, approvals, implemented
contracts, summarized acceptance and pending Steps 5/6 remain in this repository.
Historical citations use immutable links to commit
`8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8`; completed stage instructions do not
apply to future assignments. This cleanup changes no technical or business policy.
