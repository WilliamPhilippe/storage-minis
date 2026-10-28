# Technical direction

**Owner approval date:** 2026-10-21. **Status:** accepted choices with remaining design work explicitly listed below; no application implementation exists yet.

This records the owner's stack and technical-policy decisions from the development-stack discussion, including the follow-up confirmation of active-use token refresh, explicit logout, the administrator email, and UTC reporting. It supplements the current [v0.7 requirements](../requirements/requirements-v0.7.md), [entity map](../entities/entity-map-v0.7.md), and [ownership index](../requirements/requirements-coverage-v0.7.md). It does not replace the business baseline or close delivery issues. The [model review](../entities/model-review.md) and [PurchaseExpense impact](../requirements/purchase-expense-impact-v0.7.md) continue to govern domain invariants.

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
See [development checks](../../README.md#development-checks) for command usage and
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
cache demonstration live in [Turborepo checks](../../README.md#turborepo-checks-and-cache).
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

**Owner approval:** The owner explicitly requested implementation of the
[Step 1 plan](../plans/step-1-tooling-plan-2026-10-24.md), preferred Docker Official
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
inventory live in [README](../../README.md#docker-tooling). The dedicated host credential directory has mode 700; browser login completed
with scope set to this absolute checkout. The Homebrew CLI was exercised; the
standalone checksum installer is documented but was not executed. Probe files
and secondary resources were removed, and only the renamed primary tooling
volumes/image remain. [PR #103](https://github.com/WilliamPhilippe/storage-minis/pull/103)
contains the Step 1 handoff and was merged on 2026-10-24 as
`17771994adef99e6f575385266970d472c65b8b0`. T06 stays open.

## Step 2 local PostgreSQL planning (2026-10-24)

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
[Step 2 implementation plan](../plans/step-2-postgresql-plan-2026-10-24.md) with
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

The owner requested a [two-part Step 3 plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md):
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

**Owner approval:** On 2026-10-24 the owner approved the
[two-part plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md),
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
[Step 3A handoff](step-3a-verification-2026-10-25.md). These checks do not establish
business atomicity, Organization authorization, schema constraints or T06 completion.

## Docker lifecycle commands (2026-10-25)

**Owner approval:** The owner approved phase 1 and the staged approach in the
[application-container and lifecycle plan](../plans/docker-application-lifecycle-plan-2026-10-25.md),
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
Read [Docker lifecycle commands](../../README.md#docker-lifecycle-commands) for
host/direct-shell usage and the storage-deletion warning.

## Standard infrastructure tooling direction (2026-10-25)

**Owner approval:** After reviewing the lifecycle implementation, the owner
approved replacing the general lifecycle wrapper with standard Compose commands,
retaining narrow helpers for the existing Doppler checks and confirmed volume
deletion. The owner then requested a drafted change plan and directed the project
to avoid custom infrastructure code where standard tools provide the behavior.
Rationale: easier maintenance, deployment reuse and familiarity for developers.

The owner requested implementation of the concrete
[standard Compose maintenance plan](../plans/standard-compose-maintenance-plan-2026-10-25.md)
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
| Forms | React Hook Form with Zod | Form handling and input validation. |
| Database | PostgreSQL | Final schema, constraints, and transaction/concurrency design remain pending. |
| Persistence access | Drizzle ORM | Migration workflow and database-driver/version selection remain T06 work. |
| Development infrastructure | Docker Compose for PostgreSQL | Production database hosting remains undecided. |
| Environment variables | Doppler | Step 1 provides local host-to-Compose verification; application/test/production mapping and operational policy remain later decisions. |
| Tests | Vitest and Playwright | Vitest for unit/integration tests, including real PostgreSQL for rollback, constraints, and concurrency; Playwright for core administrator and public-catalog workflows. |
| Lint and formatting | ESLint and Prettier | Concrete settings and commands approved in the 2026-10-23 tooling setup above. |

The choices provide shared TypeScript contracts within one repository while retaining independent frontend/backend deployment. They do not introduce additional domain features or settle unresolved business policies.

**Design-system preference:** the owner leans toward Ant Design. Keep it as the preferred candidate until explicitly finalized. Styling conventions, application language, and UI locale remain open.

## Authentication and initial administrator

Accepted choices:

- Firebase Authentication with the Google provider only; email/password sign-in is excluded.
- Use Firebase ID tokens for API authentication. The API verifies those tokens and enforces User/Membership/Organization authorization for business access.
- Keep the user signed in through token refresh when a token expires during active use. Inactive users receive no refresh. Token expiry during active use does not require signing in again each hour.
- Support explicit logout.
- The initial administrator is the owner's personal Google account, `ctt.williamphilippe@gmail.com`, supplied on 2026-10-21 as the setup identity. The bootstrap/configuration mechanism remains pending. Firebase credentials have not been supplied.

Firebase documents that ID tokens last for an hour and refresh tokens can obtain new ones. Browser persistence is a separate setting. The public `getIdToken()` method can also refresh an expired or soon-expiring token when called; T02 must design token acquisition and any background activity around the accepted active-use policy. See [Firebase session management](https://firebase.google.com/docs/auth/admin/manage-sessions), [authentication-state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), and [token acquisition](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken).

Examples: while the administrator is using the system, token expiry triggers refresh and work continues without an hourly interactive sign-in. If the administrator is inactive, the client does not refresh the token. The administrator can explicitly log out. A valid Google/Firebase identity without the required application authorization does not grant access to private inventory or financial records.

[T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) still needs the administrator bootstrap mechanism, browser persistence policy, activity signals/inactivity threshold, return-after-inactivity behavior, logout scope/revocation, Google-account recovery expectations, and expiry/recovery acceptance cases. In particular, deciding not to refresh while inactive does not settle whether returning after token expiry refreshes the token or requires interactive sign-in. Initial-admin selection must use the configured owner identity; an arbitrary first Google sign-in is not authorization. No absolute or idle session timeout has been chosen.

## Money and dates

Accepted choices:

- All operational amounts remain BRL, consistent with REQ-008; visitor timezone or locale does not introduce currency conversion.
- Store timestamp instants in UTC. The UI converts them for display in the visitor's timezone.
- Daily/monthly financial reports use the fixed business timezone `UTC` for all viewers, as confirmed by the owner on 2026-10-21. Visitor-local timestamp display does not change report periods.
- Preserve the distinction between the business event date and its recorded timestamp, as required by REQ-011, FIN-011, CALC-018, and the accepted shared-history model. Calendar-date input/storage semantics remain T03 work.

Example: `2026-11-01T01:00:00Z` may display as October 31 at 22:00 for a visitor in UTC-03:00. A business event dated November 1 in UTC remains in November's report for every viewer. Report membership follows UTC and the applicable source business date rather than the viewer's display timezone.

[T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) still needs exact BRL representation, intermediate precision and rounding, deterministic cent remainders, date-only/business-date semantics, period-filter semantics, and dated-adjustment acceptance examples. The storage and reporting timezone is settled as UTC. PostgreSQL plus Drizzle does not choose the remaining policies automatically.

## Step 3B structural schema (2026-10-25)

The owner approved the [S01–S10 schema review](../database/step-3b-schema-review-2026-10-25.md)
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
| [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) | Hosting, deployment and release coordination, Doppler access/integration/rotation/fallback policy, storage, daily backup retention/restore verification, recovery targets, browser/device support, performance targets, and operational monitoring. |
| [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Inspect the real spreadsheet and agree on legacy acquisition treatment; source data is not supplied. |
| [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) | Steps 1–3B provide pinned tooling, local databases, typed Drizzle schema and migration replay. Complete API/framework integration, application authorization/isolation, representative business transactions/races, CI and full setup acceptance. |

T06's existing T01/T02/T04 prerequisites remain in force. The requirements continue to have their existing primary delivery owners; this record adds no duplicate delivery work. D01-D08 remain business-policy boundaries.

Hosting and operations are deliberately left open. Railway was discussed as an example, not selected. The [documentation/backlog review](technical-direction-review.md) records propagation to current documents and affected issue criteria. Decision and delivery issues remain open; no production infrastructure has been provisioned. Workspace/tooling checks and structural PostgreSQL tests are implemented as recorded above; API/frontend builds, business workflows and their acceptance evidence remain pending.
