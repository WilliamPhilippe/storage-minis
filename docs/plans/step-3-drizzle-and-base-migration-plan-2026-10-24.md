# Step 3 — Drizzle installation and base migration

**Date:** 2026-10-24. **Status:** Owner approved the plan and instructed implementation
on 2026-10-24. Step 3A is implemented on `chore/step-3-drizzle`; the separate 3B
physical-schema approval gate remains. See [implementation and evidence](../technical/technical-direction.md#step-3a-drizzle-implementation-2026-10-25).

**Approved implementation amendments:** The owner subsequently approved an exact
esbuild build-script allowlist (`0.18.20`, `0.25.12`, `0.28.2`) and shared
`skipLibCheck: true` after the pinned Drizzle types failed declaration checking.
All project source strictness remains. Doppler config `test` and its
`POSTGRES_TEST_PASSWORD` key were verified; both database and tooling launchers
now require the target-matching config. These outcomes supersede pending wording
and the original `skipLibCheck: false` assumption below. The original proposal
is retained to explain its alternatives; no business schema has been applied.

This plan divides [foundation Step 3](../technical/technical-foundation-implementation-guide.md#step-3--drizzle-connection-and-migration-tooling)
into two sequential deliveries:

1. **3A — Drizzle installation, connection and migration tooling.**
2. **3B — Base migration creation from the reconciled DBML schema.**

The owner requested this split and a saved Markdown plan. No dependency was
installed, schema implemented, migration generated or database changed during
planning. Each delivery should have its own reviewable PR and evidence; 3A can
finish while 3B's schema decisions remain open. Keep guide Steps 4–6 numbered as
they are. This extends Step 3 with an explicitly gated schema delivery; it does
not waive the guide's separate schema approvals.

## Owner instructions and approvals

| Date | Outcome | Scope and rationale |
| --- | --- | --- |
| 2026-10-24 | Split Step 3 into installation and base migration creation. | Separate tool readiness from schema correctness. |
| 2026-10-24 | Owner performs anything requiring installation on the local machine. | The agent must explain the prerequisite and ask the owner to install it. No host package installation, global CLI installation, version-manager replacement or shell-profile changes by the agent. |
| 2026-10-24 | “Approve reconciliation first.” | Reconcile DBML with approved requirements and obtain the remaining schema decisions before generating the base migration. This does not approve individual schema changes. |
| 2026-10-24 | “Approve Docker tooling (recommended).” | Run Drizzle and its CLI in the existing tooling container, use the `pg` adapter, and separate generation from application. The owner invokes commands from the host terminal; generated files remain in the mounted checkout. |

**Additional owner direction, 2026-10-24:** The owner created a Doppler environment
named `test` and authorized its use. Development keeps the existing `dev`
environment; tests use the new `test` environment. Verify the concrete test config
slug and secret key names before implementation; those details are not established
by the environment name alone.

The owner does **not** need a host or globally installed Drizzle CLI to generate
or apply migrations. The project dependencies live in the existing Linux
dependency volumes; `packages/db/drizzle/` will live in the bind-mounted repository.
The tooling container connects to the separate PostgreSQL container over the
checkout's Compose network. Existing host-editor dependency-resolution limits
remain; Docker installation does not make those dependencies visible to a host
TypeScript editor automatically.

The owner approved the detailed 3A recommendations below. The 3B physical-schema
choices retain their explicit separate review gate. Ask again only for an
uncovered or changed version, configuration or approach.
Record approved outcomes, dates and rationale in
[technical direction](../technical/technical-direction.md). No new host tool is
currently proposed; if one becomes necessary, the owner installs it.

## Starting state and prerequisites

Read-only inspection on 2026-10-24 established:

- The checkout has Step 1 tooling and Step 2 PostgreSQL files, a shared lockfile,
  strict TypeScript/ESLint/Vitest configuration, and an empty `@storage-minis/db`
  package with only a typecheck command. There is no executable application
  schema, build/export contract, migration history or permanent test suite.
- [Step 2 PR #104](https://github.com/WilliamPhilippe/storage-minis/pull/104) is
  **merged**, verified through GitHub. The guide's “awaiting review/merge” text is
  stale. Begin implementation from its merged result; this checkout contains the
  Step 2 implementation and subsequent documentation commits.
- Node.js **24.22.1**, pnpm **12.15.0**, TypeScript **6.0.3**, existing tooling
  versions, ESM/NodeNext, `.js` relative imports and `skipLibCheck: false` remain.
- Existing database targets are user `postgres`, database `storage_minis_dev`
  at `postgres:5432` and database `storage_minis_test` at `postgres_test:5432`
  inside Docker. Host access uses loopback ports 5433/5434 by default. Both use
  PostgreSQL 18.6 and UTC; keep the existing image digest and Compose definitions.
- Implemented Step 2 currently fetches both targets' credentials from Doppler
  `storage-minis` / `dev`, using separate `POSTGRES_PASSWORD` and
  `POSTGRES_TEST_PASSWORD` keys. The owner has since authorized a separate `test`
  environment. Step 3 must update database lifecycle and Node-tooling launchers
  consistently to use it for tests. Preserve the host CLI/browser-login boundary,
  selected-key injection, disabled fallback, explicit project name and test tmpfs.
  Existing scripts have not yet adopted this change.
- [schema.dbml](../database/schema.dbml) contains **33 table declarations, 11 enums
  and 158 reference declarations**. These are an inventory of the draft, not
  acceptance criteria requiring a literal conversion.
- Live T01/#21, T02/#22, T03/#24, T04/#23 and T06/#26 were inspected; all remain
  open with no comments at inspection. T06 retains its T01/T02/T04 prerequisites.
  Local bootstrap approval is not permission to close those issues.

No containers were started and no credentials were fetched during this planning
task. Previous runtime evidence is recorded in
[Step 2 technical direction](../technical/technical-direction.md#step-2-local-postgresql-planning-2026-10-24).
Recheck the tooling volumes and database readiness before implementation tests.

Apply these sources in order: [requirements v0.7](../requirements/requirements-v0.7.md),
[entity map v0.8](../entities/entity-map-v0.8.md), and the subsequent approved
[schema review](../requirement-updates/2026-10-22-schema-review.md),
[field review](../requirement-updates/2026-10-23-dbml-review.md),
[index/candidate review](../requirement-updates/2026-10-23-dbml-indexes-and-candidates.md)
and [partial-expense-payment clarification](../requirement-updates/2026-10-23-partial-expense-payments.md).
Use [database design](../database/design.md) for the known gaps. Older full-payment-only
expense wording and later-period profit reversals are superseded.

## 3A — Drizzle installation and tooling

### Dependency recommendation — approved for 3A

Reuse the exact candidates from the
[foundation proposal](../technical/t06-foundation-proposal-2026-10-24.md#2-approval-register-and-exact-versions).
Their published npm manifests were rechecked without installation on 2026-10-24.
Availability and declared engine/peer compatibility do not prove strict compilation.

| Package | Exact pin | Owner and purpose | Published metadata |
| --- | --- | --- | --- |
| `drizzle-orm` | `0.45.4` | `packages/db` runtime; typed PostgreSQL adapter. | [Manifest](https://registry.npmjs.org/drizzle-orm/0.45.4) |
| `pg` | `8.23.1` | `packages/db` runtime; explicit pool/client ownership. | [Manifest](https://registry.npmjs.org/pg/8.23.1) |
| `zod` | `4.6.7` | `packages/db` runtime; validate configuration at explicit entry points. | [Manifest](https://registry.npmjs.org/zod/4.6.7) |
| `drizzle-kit` | `0.31.11` | Root development tool; generate and apply migrations. | [Manifest](https://registry.npmjs.org/drizzle-kit/0.31.11) |
| `@types/pg` | `8.23.1` | Root development dependency; driver declarations. | [Manifest](https://registry.npmjs.org/@types/pg/8.23.1) |
| `tsx` | `4.23.15` | Root development tool; execute checked TypeScript command wrappers. | [Manifest](https://registry.npmjs.org/tsx/4.23.15) |

Prefer this stable Drizzle pair over a prerelease migration format/API. The
approved `pg` choice gives explicit client ownership; postgres.js is a supported
alternative with a different connection API. Zod reuses the selected validation
stack; handwritten validation avoids a dependency but adds another convention.
`tsx` keeps command wrappers in TypeScript; compiling wrappers before each CLI
operation avoids that dependency but adds build coordination. No Fastify, tRPC,
Firebase, frontend, native `pg` or DBML-conversion package is needed here.

Proposed commands, **only after exact dependency approval**, using initialized
Step 1 tooling volumes and an explicit checkout `COMPOSE_PROJECT_NAME`:

```sh
./scripts/tooling.sh run pnpm --filter @storage-minis/db add --save-exact drizzle-orm@0.45.4 pg@8.23.1 zod@4.6.7
./scripts/tooling.sh run pnpm add --workspace-root --save-dev --save-exact drizzle-kit@0.31.11 @types/pg@8.23.1 tsx@4.23.15
./scripts/tooling.sh run pnpm install --frozen-lockfile
```

These install project dependencies inside Docker, not host tools. If strict
compatibility fails, report the incompatibility and seek approval for a new pin;
do not loosen compiler rules or install unrelated optional drivers.

### Configuration, package and command recommendations — approved for 3A

| Choice | Recommendation and rationale | Alternative / tradeoff |
| --- | --- | --- |
| Connection boundary | `createDatabase(config)` returns a typed `db`, `check(): Promise<void>` and idempotent `close(): Promise<void>`. Export `DatabaseConfig` and `Database` types. Construction reads no ambient environment; import opens no connections. Entrypoint owns the pool and closes it in `finally`. | A module singleton is shorter but hides ownership and makes isolated tests/shutdown harder. |
| Local pool limits | Maximum 5 connections; 10s idle timeout; 2s connection/acquisition timeout; 3s server statement timeout; 4s client query timeout; 6s total check deadline; 10s shutdown deadline. Handle idle errors safely. | Driver defaults require less configuration but include unbounded waits. These are local starting values, not T04 production targets. |
| Build and exports | `src/index.ts` exports the factory/config types. `tsconfig.build.json` emits `dist/**/*.js` and declarations from `src`, excluding tests. Package `exports` resolves `types` to `dist/index.d.ts` and `import` to `dist/index.js`. | Source exports require a runtime TS loader in consumers. Compiled exports support ordinary Node ESM. |
| Files | `src/{index,client,config}.ts`, `scripts/{check,generate,migrate}.ts`, `drizzle.config.ts`, `drizzle.migrate.config.ts`, build config and meaningful unit/integration tests in `packages/db`. | One combined CLI/config is smaller but mixes offline generation with secret-bearing operations. |
| Migration source | After 3B approval, TypeScript schema at `src/schema/index.ts`; reviewed SQL, snapshots and journal in `packages/db/drizzle/`. DBML remains the design reference and is reconciled alongside changes. | DBML-to-SQL conversion lacks the required reconciliation; SQL-first adds another schema maintenance workflow. |
| Generation/application | Separate explicit commands, both uncached. Generation needs no DB or secrets. Application validates target and committed history; use `drizzle-kit migrate` with history at `drizzle.__drizzle_migrations`. | Direct `push` skips reviewable migration history; startup migration couples server boot to schema mutation. Neither is proposed. |
| Initial guards | Until approved schema/history exists, generation/application fail clearly and nonzero before Doppler fetch, connection or filesystem mutation. No sample table, placeholder schema or empty journal. | A dummy migration makes tooling look complete while concealing the schema prerequisite. |
| Turbo | Add DB `build` with `dist/**` outputs, build dependencies for consumers of compiled exports, and uncached `db:check`, `db:generate`, `db:migrate`, `test:integration` tasks. Root scripts dispatch these commands. | Keep live operations outside Turbo entirely if preferred; caching them is unsuitable because DB state is external. |

Use [node-postgres pool lifecycle](https://node-postgres.com/apis/pool) and
[client options](https://node-postgres.com/apis/client) for implementation.
A timeout must cancel/terminate owned work and release resources; merely racing
a promise does not establish cleanup. Classify errors without logging credentials,
connection strings, raw parameter values or full driver errors. Use a bounded
command supervisor for termination if graceful cleanup fails, and test that path.

Include both Drizzle config files, command wrappers and test configs in strict
typechecking and typed linting. Build only runtime source; schema files join it
in 3B. Keep build/import/config-free checks usable without Doppler or a live DB.
Verify runtime and declaration exports with a temporary workspace consumer using
normal Node ESM and TypeScript resolution, without adding API application code.
Step 4 adds the actual API `workspace:*` dependency and its build ordering.

### Proposed environment and launcher contract

Extend `scripts/tooling.sh` with `run-db <dev|test> <command...>`, reusing the
approved `scripts/database.sh` injection behavior and explicit Compose files.
Keep ordinary `run` offline-capable and secret-free. Do not introduce a host
`.env` or a Docker image containing Doppler credentials. Use the owner's existing
`dev` and newly created `test` Doppler environments in project `storage-minis`.
Inspect config metadata without exposing values to identify the actual config
slug within `test`; do not assume an environment name is also the CLI config name.

Recommend retaining `POSTGRES_TEST_PASSWORD` as the test secret key to minimize
changes to Step 2's Compose contract. Verify the key exists in the selected test
config; if not, ask the owner to populate it or approve an alternative key mapping.
Update `scripts/database.sh` target-to-config validation at the same time as
`run-db`, so test initialization and Drizzle use the same credential source.
Test commands must not fall back to `dev` for missing configuration or credentials.

The launcher selects only the appropriate password from Doppler on the host,
clears ambient connection overrides, then injects a component-based configuration
into the tooling container. Pass secret variables by name, not literal command
arguments. Retain explicit project/config checks and no fallback files. Config
validation in Node must reject mismatched tuples, not rely only on shell checks.

| Container variable | Development | Test |
| --- | --- | --- |
| `DB_TARGET` | `dev` | `test` |
| `PGHOST` | `postgres` | `postgres_test` |
| `PGPORT` | `5432` | `5432` |
| `PGDATABASE` | `storage_minis_dev` | `storage_minis_test` |
| `PGUSER` | `postgres` | `postgres` |
| `PGPASSWORD` | From `POSTGRES_PASSWORD` | From `POSTGRES_TEST_PASSWORD` |

The development secret comes from the existing `dev` config; the test secret
comes from the verified config in the new `test` environment. These are Doppler
configuration choices, independent of Docker service names and network ports.

Both `PGPORT` values intentionally remain **5432**: each PostgreSQL server has
its own container network address. The tooling container selects the database
using `postgres:5432` or `postgres_test:5432`. From the host machine, use
`127.0.0.1:5433` for development and `127.0.0.1:5434` for tests by default.
The host ports must differ because they share the same host address; internal
container ports do not. Host port overrides do not change the internal `PGPORT`.

Validate all components explicitly and reject blank values. Do not accept a
fallback `DATABASE_URL`, ambient libpq configuration, or arbitrary remote host.
Do not forward the other target's password. The test runner requires `DB_TARGET=test`
and the exact test tuple before connecting or cleaning up. Check authenticated
`current_database()`, `current_user` and UTC before migration/test mutation.
Generation never requires these variables. Migration config uses validated
components rather than printing an assembled URL.

Keep existing local password-authenticated network behavior; production TLS,
privilege separation and credentials remain T04 work. Migration application is
one runner per target, explicitly invoked. No concurrent migration-runner support
or production application is claimed in this local step.

Proposed commands after implementation:

```sh
./scripts/tooling.sh run pnpm build
./scripts/tooling.sh run-db dev pnpm db:check
./scripts/tooling.sh run-db test pnpm db:check
./scripts/tooling.sh run pnpm db:generate
./scripts/tooling.sh run-db test pnpm db:migrate
./scripts/tooling.sh run-db test pnpm test:db
```

`pnpm test:db` dispatches the DB `test:integration` task. Declare the exact
allowlisted DB environment for relevant uncached Turbo tasks; ordinary unit
tests keep their current secret-free environment. The launcher must perform the
pending-schema guard before fetching secrets for `db:migrate`. Paths resolve
relative to `packages/db`, regardless of invocation directory.

### Implementation order and completion evidence

1. Obtain approval for the dependency pins and detailed contracts above; record
   the approved F04/F05/F06/F07/F08/F11/F12 subsets. F13 container execution and
   F14 provider choice are inherited only within their existing scopes.
2. Install approved dependencies in Docker and commit manifest/lockfile changes.
3. Implement the explicit factory, validation, build/exports and bounded cleanup.
4. Implement checked CLI configs, guarded commands, target-specific launcher and
   the real Turbo tasks. Preserve existing Step 1/2 commands and isolation.
5. Add meaningful unit tests for config/guard behavior and a separate real-DB
   suite for connection/lifecycle behavior. Use `SELECT 1`; no business table is
   needed in 3A. Integration tests must not be cached or discovered as unit tests.
6. Update setup instructions and record actual evidence in the 3A PR. Do not
   claim fresh migration replay until 3B has delivered a real schema.

| Guide criterion | Verification and expected result |
| --- | --- |
| Installed versions and strict compatibility | Frozen install, CLI version check, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`; no relaxed rules or missing peers hidden by casts/config. |
| Authenticated connection | `db:check` against both explicit targets returns success and verifies database/user/timezone. |
| Bounded failures | Missing config fails before connection; wrong password and unavailable DB fail within the 6s check deadline; query timeout test uses bounded `pg_sleep` on test only. No secrets in captured output. |
| Lifecycle | Import without config/live DB succeeds; repeated `close()` is safe; success, query failure, idle-client error and SIGINT/SIGTERM release resources and end within the 10s shutdown bound. |
| Compiled consumption | Clean build followed by a normal Node ESM consumer and strict type consumer resolves package exports, without a TS runtime or source alias. |
| CLI safety | Configs/wrappers pass typed checks; missing approval artifacts cause nonzero refusal with no created schema/journal/history table and no secret fetch. |
| Environment isolation | Missing Doppler key/login, wrong config, ambient password/URL, mismatched target tuple and attempted development target for integration tests are rejected; selected-key injection reaches only the intended container. |
| Task behavior | Turbo dry run shows actual dependencies and uncached live/generation tasks; a second DB check executes again. Cached builds remain independent of live DB state. |

Use 30s individual integration-test and 120s suite limits as proposed outer
bounds; cleanup runs on failure. Keep an uncached plain-process check for leaked
handles, since test-runner termination can conceal them. Do not change ordinary
no-tests failure policy; the new meaningful DB unit tests supply real evidence.

## 3B — Base migration creation

### Reconciliation gate

The [Step 3B review packet](../database/step-3b-schema-review-2026-10-25.md) now
inventories the DBML and presents the physical-schema recommendations for review.
Its existence does not lift the approval gate.

The approved starting point is the current DBML plus later requirements, not an
automatic export. First prepare a review matrix mapping each table, enum, column,
default, check, reference and required uniqueness rule to its approved source,
proposed Drizzle representation and validation case. Account for all 38 active
entity responsibilities, including derived/embedded responsibilities with no table.
Preserve IDs and existing issue ownership; rejected candidate tables stay absent.

Present the following decisions before editing the executable schema. These are
concrete starting recommendations, **not approved physical-schema choices**:

| Decision / owner | Recommended solution | Alternative and tradeoff |
| --- | --- | --- |
| SQL representation and modules — T01/T06 | Preserve existing snake_case SQL names and enum values; map TS properties explicitly. Keep the draft `inventoryId` SQL spelling for this first migration unless a rename is separately approved. Group schema files by existing domain families and export through one index. | Renaming or splitting tables during conversion expands review; one large file is simpler initially but harder to navigate. Review every deviation. |
| Key generation — T01/T03 | PostgreSQL integer identity keys, generated always; database assigns IDs and does not recycle retained business identities. | `serial` is older sequence syntax; application-assigned integers add coordination; `bigint` increases range but changes JS boundaries. Confirm range and exceptional import handling first. |
| Money and timestamp precision — T03 | Retain `integer` centavos with explicit bounds and zero/positive checks; use exact `bigint` intermediate arithmetic where multiplication/sums require it. Recommend `timestamptz(3)` and JS `Date` for millisecond fidelity, with explicit actual occurrence inputs and recording defaults only where appropriate. | PostgreSQL integer limits a positive amount to 2,147,483,647 centavos (R$21,474,836.47). Wider integer/numeric money permits more range but changes parsing/API contracts. Microsecond timestamps require a representation preserving precision beyond `Date`. Obtain explicit decisions before DDL. |
| Scoped foreign keys — T01 | Add the composite unique target keys required by the diagram's scoped references; enforce same Organization and applicable Customer/Supplier context in SQL. Review nullable composite paths explicitly. | Single-column FKs alone do not enforce party/scope consistency; triggers add procedural complexity. Required supporting indexes need approval because October 23 deliberately deferred them. |
| Uniqueness — T01/T02 | Unique Firebase UID, Membership pair, Organization/readable ID, current expense/unit pair and original returned SaleItem; partial unique indexes for current collection membership, active commitments, unknown Supplier and opening Purchase group. Specify every predicate and scope in the matrix. | Transaction-only uniqueness requires correct locking on every writer. Plain unique Item constraints would wrongly prevent Return/resale history. Keep SKU/tracking nonunique and Product global. |
| Readable Item ID — T01 | Derive immutable uppercase base36 text from the generated permanent Item integer, retaining scoped uniqueness and never reusing removed identities. Confirm this exact encoding with the owner. | An Organization-local counter gives shorter independent sequences but needs additional serialized counter storage. Neither encoding nor generator was previously approved. |
| Missing approved fields — T01/T02/D04/D07 | Add `users.can_edit_products` default false; nonblank required Customer name; distinct optional public unit description/photos. Recommend text and text-array fields consistent with the Product image representation, subject to review. | Role-only edit authority conflicts with the approved separate permission. A media table adds metadata/lifecycle decisions; hosting and catalog projection remain separate. No administrator seed is implied. |
| Deletion-safe audit — T01/D06 | Preserve immutable typed Sale/SaleItem subject IDs and before/after facts independently of live-row existence, linked to a surviving BusinessEvent; validate live subjects within the creating transaction. Review removal of restrictive subject FKs only for deletable subjects. | `ON DELETE CASCADE` loses audit; bare `SET NULL` loses subject identity and can violate the one-subject check; soft deletion changes the approved workflow. Decide the exact typed shape before migration. |
| Cross-row invariants — T01 | Use SQL constraints for declarative rules and explicit transactions/locks for aggregate/source reconciliation; document each required lock, writer and test. Approve any trigger/function separately. | Cross-row sums cannot safely be expressed as ordinary CHECK constraints. Putting all rules in triggers complicates correction workflows; unchecked application-only writes cannot prove concurrent integrity. |

PostgreSQL requires valid unique targets for foreign keys and supports partial
unique indexes for conditional uniqueness. Nullable composite references need
careful handling, and CHECK constraints cannot provide general cross-row
enforcement. These facts explain why the DBML cannot be translated mechanically.
See [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html).

Additional schema review must resolve cyclic Product/event/change references,
same-Product PurchaseItem enforcement, immutable IDs/finalized costs, completed
Purchase locks, permanent funding history, approved physical-status transitions,
source/outcome party matching and refund limits. State whether each is enforced
in base DDL or remains dependent on a named future transactional operation.
Do not invent D01 tie-breaking, D06 exceptional corrections or legacy receipt facts.
If a rule affects the base storage shape, resolve it before generation. If a
workflow can safely remain unimplemented, obtain an explicit scoped deferral and
record its owner and missing evidence; a successful migration does not deliver it.

Preserve partial expense payments and reconciled `settled_amount`; four dedicated
customer/supplier settlement tables; allocation-derived PurchaseExpense links;
global Products; nullable condition booleans; mutually exclusive sale status;
and second-day UTC opening Purchase provenance. Do not restore rejected generic
settlement/import tables or add ledger/balance/collection entities.

### Generation and application workflow

1. Review and approve the reconciliation matrix, concrete T01/T03 choices and
   any explicitly bounded deferrals. Record outcomes and synchronize the current
   DBML/design guide without rewriting historical published requirements/logs.
2. Implement the approved tables/enums/checks/keys in `packages/db/src/schema/`.
   Use explicit SQL names and FK names. Handle circular declarations with checked
   Drizzle patterns; do not suppress typing or omit required constraints.
3. Generate the first real migration, proposed name `base`, through the guarded
   offline `db:generate` command. Let the pinned CLI choose its normal filename
   and metadata format. Commit SQL and all required snapshots/journal together.
4. Review every generated statement against the matrix: nullable/default behavior,
   money/timestamps, delete/update actions, unique predicates, table creation and
   FK ordering. Any required custom SQL is a separately reviewed migration
   artifact; ensure later generation retains declarative schema consistency.
5. On explicit test target, apply to a fresh disposable PostgreSQL database,
   inspect resulting catalog definitions, apply again and confirm a no-op.
   Regenerate without source changes and confirm no new SQL or snapshot drift.
6. Test rollback/failure and implemented constraints against real PostgreSQL.
   Use a disposable copy of the migration chain for a deliberately invalid later
   statement; verify no partial DDL/history success remains. Do not corrupt
   committed migrations or edit the journal to make failures pass.
7. Present the reviewed SQL and test evidence before first development application.
   Request approval for that concrete external-state change unless already
   explicitly authorized. Apply with `run-db dev pnpm db:migrate`, preserving
   existing development storage. No production run, seed or spreadsheet import.
8. Record the migration identifier, schema coverage, commands/results, remaining
   limitations and 3B handoff. After application, corrections use new migrations;
   never rewrite applied history or reset a shared/development DB as a shortcut.

Use a proposed 120s migration-process deadline with 5s lock timeout and 30s
statement timeout, distinct from short connection/readiness limits; verify these
reach the CLI's actual connections. On interruption/failure, inspect the database
and history and establish transaction outcome before retrying. No automatic
down migration or destructive recovery is selected. Test cleanup uses only Step
2's disposable test service, whose stop discards tmpfs; never use `down --volumes`.

The recommended command protocol follows Drizzle's
[migration workflows](https://orm.drizzle.team/docs/migrations),
[configuration](https://orm.drizzle.team/docs/drizzle-config-file),
[generation](https://orm.drizzle.team/docs/drizzle-kit-generate) and
[application](https://orm.drizzle.team/docs/drizzle-kit-migrate).
Validate behavior against the pinned stable packages, since current tutorials
may include prerelease APIs.

### Base migration acceptance

| Evidence | Expected result / requirement boundary |
| --- | --- |
| Inventory and catalog comparison | All approved schema objects are present; 33 draft tables/11 enums/158 reference declarations are individually accounted for, including explicitly changed representations. No rejected candidates appear. |
| Fresh replay and repeat application | Full chain succeeds on fresh test storage; second application changes neither schema nor migration count; no-change generation produces no drift. |
| Scope constraints | Invalid cross-Organization and cross-Customer/Supplier references fail atomically; distinct Organizations can reference the same global Product. TECH-005 / ORG-008 / PRO-012–013. FK tests do not prove API read authorization. |
| Concurrent uniqueness | Two connections racing for one active Item commitment or one Organization/Product collection membership cannot both commit. Separate Organizations' valid units remain independent. TECH-006 / REQ-012. |
| Identity, amounts and dates | Duplicate IDs/UID/Membership rejected; readable IDs survive removal; positive cash/expense and nonnegative merchandise prices enforced; bounds and precision round-trip as approved. Test a timezone-crossing UTC instant. REQ-008–009 / T03. |
| Audit and rollback | Approved never-funded pre-dispatch deletion leaves identifiable audit; injected failure rolls back all writes in the tested transaction. Funding-versus-deletion race requires the approved transactional implementation or an explicit pending-evidence record. REQ-010 / T01 / T06. |
| Expense and source reconciliation | Structural scope/checks pass; exact allocation, partial-payment cache reconciliation and concurrent overpayment need approved transactional enforcement before claiming delivery. PUR-047–049 and the October 23 payment clarification. |
| Guards and cleanup | Missing/unapproved artifacts, wrong targets, wrong credentials, lock timeout and failed SQL return bounded errors. Test cleanup preserves development storage. |

Tests exercise the real PostgreSQL engine, using separate clients and coordinated
overlap for concurrency cases. A helper that bypasses a future business operation
cannot prove that operation. Full Sale/Purchase/Return/reporting/API authorization
acceptance stays with its existing owner unless explicitly included and delivered.

## Documentation and handoff

Likely changes in 3A: root/DB manifests and lockfile; DB source, scripts, configs,
build exports and tests; `scripts/tooling.sh` and `scripts/database.sh`; actual
Turbo tasks; a separate
integration-test config; secret-free variable inventory and setup instructions.
Keep existing `compose.yaml` / `compose.postgres.yaml` topology unless a concrete
approved launcher change requires an edit. 3B adds reviewed schema/migrations,
reconciliation evidence and corresponding integration tests.

Update [README](../../README.md),
[local development](../technical/local-development.md),
[technical direction](../technical/technical-direction.md) and
[foundation guide](../technical/technical-foundation-implementation-guide.md)
as each delivery is approved/implemented. Update `AGENTS.md` when actual tooling
changes. Mark 3A and 3B separately in the Step 3 progress row and correct Step 2's
merged status. Preserve older plan/approval records and current requirement IDs.

3A hands Step 4 a compiled DB factory, ownership/cleanup contract and authenticated
readiness command. 3B hands later persistence work a replayable approved base
schema, exact history location and tested structural constraints. Keep open
T01/T02/T03/T04/T05/T06 decisions and approved deferrals visible. Neither PR
authorizes merging, production deployment, starting another guide step or issue
closure. No GitHub issues or PRs are changed by this planning task.

## Approval sequence

1. **Recorded:** the two-part split, owner-run host installations, Docker-based
   Drizzle/`pg` execution with separate generation/application, and reconciliation
   before migration creation; use of the owner's new Doppler `test` environment.
2. **Approved:** 3A's dependency pins, files/exports, configuration, launcher,
   limits, commands and validation scope, with the implementation amendments
   recorded above. This approval covers tooling only.
3. **Before 3B DDL:** review and approve each schema decision and the full
   reconciliation matrix, including any explicitly deferred workflow enforcement.
4. **Before first development application:** review actual migration SQL and
   test evidence, then approve the specific target-changing command if it has
   not already been expressly authorized.

Questions should include the recommended option, why it fits and the relevant
alternative. Do not treat silence, a draft plan, or approval of the general
Drizzle stack as approval of the remaining technical details.
