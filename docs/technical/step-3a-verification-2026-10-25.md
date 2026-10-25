# Step 3A — verification and handoff

**Date:** 2026-10-25. **Branch:** `chore/step-3-drizzle`, created from current
`origin/main` (`acb9f05`, containing merged Step 2). **Scope:** Drizzle connection
and guarded migration tooling; no business schema or migration applied.

**Review:** [Draft PR #105](https://github.com/WilliamPhilippe/storage-minis/pull/105),
awaiting owner review; not merged.

The owner approved the [plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md)
and explicitly approved the esbuild exact-version build allowlist and shared
`skipLibCheck: true` after installation/compiler findings. Source strictness
remains. See [the decision record](technical-direction.md#step-3a-drizzle-implementation-2026-10-25).

## Delivered contracts

- DB runtime dependencies: Drizzle ORM 0.45.4, pg 8.23.1 and Zod 4.6.7. Root tools:
  Drizzle Kit 0.31.11, @types/pg 8.23.1 and tsx 4.23.15. No host installation.
- `createDatabase(config)` owns a lazy pool and returns typed Drizzle, authenticated
  readiness, idempotent bounded cleanup and last-check readiness state. Compiled
  exports resolve through normal ESM/NodeNext. Import needs no secrets or DB.
- `tooling.sh run-db` reuses the database launcher's validated target/Doppler path.
  `dev` / `test` config names must match the target. Only its password is fetched;
  component variables are generated from the fixed target and validated in Node.
- Separate, uncached connection/generation/application/integration tasks.
  Migration wrappers and direct configs deliberately refuse until Step 3B;
  neither an empty journal nor dummy application tables conceal the schema gate.
- Meaningful unit tests and separate real-PostgreSQL lifecycle tests. The API
  remains unimplemented; these tests are infrastructure evidence.

## Executed evidence

Commands use `COMPOSE_PROJECT_NAME=storage-minis-beijing` and the documented
Docker tooling/Doppler launcher. No secret values are recorded here. The actual
Doppler `test` environment/config and `POSTGRES_TEST_PASSWORD` key name were
inspected read-only, then authenticated queries verified injection.

| Check | Result |
| --- | --- |
| Container frozen installation | `tooling.sh run pnpm install --frozen-lockfile` passed. Only the approved esbuild versions ran install scripts. |
| CLI versions | `pnpm exec drizzle-kit --version` reported Kit 0.31.11 and ORM 0.45.4. |
| Build and workspace validation | `tooling.sh run pnpm check` passed all seven Turbo tasks: DB build, package/root typechecks, lint, formatting and unit tests. |
| Unit tests | 7 passed: exact/mixed/missing configuration, sanitized failures, test-target requirement, pending-schema gate and host launcher fixture checks. |
| Real PostgreSQL suite | `DOPPLER_CONFIG=test tooling.sh run-db test pnpm test:db`: 10 passed in approximately 21 seconds. |
| Real-DB cases | Drizzle query and transaction rollback using a session setting; 3s statement timeout/recovery; wrong-password failure/idempotent close; idle socket termination and recovery; draining active work; import without config; plain Node consumer exit; leaked-client shutdown bound; SIGINT and SIGTERM cleanup. No test table was created. |
| Leaked-client cleanup | `close()` rejected at approximately 10s and ended the socket; subsequent client query failed. |
| Signal cleanup | Both active-query subprocesses exited with the expected 130/143 codes in approximately 3.4s after the signal, under the 10s cleanup bound. |
| Both authenticated targets | `run-db dev pnpm db:check` and matching `test` command passed database/user/UTC identity checks. |
| Live checks are uncached | Repeated test `db:check` showed `cache bypass` while reusing the DB build. |
| Mismatched config | `DOPPLER_CONFIG=dev ... run-db test pnpm db:check` refused before injection, in approximately 0.02s. |
| Pending-schema refusal | `pnpm db:generate`, `pnpm db:migrate` and direct `drizzle-kit generate --config=packages/db/drizzle.config.ts` exited 1 with the pending-approval message. No schema/migration directory was created. |
| Host migration refusal | `run-db test pnpm db:migrate` refused before credential fetching in approximately 0.01s. |
| Unavailable database | Stopping only test PostgreSQL made test `db:check` fail with sanitized output in approximately 3.1s including launcher overhead. |
| Development isolation | Development SQL identity still passed while test was stopped. Test restart authenticated successfully through config `test`. |
| No application schema | Both targets reported zero non-system tables. No schema, migration history, seed or import was applied. |
| Shell/docs | Bash syntax, `git diff --check`, changed documentation links, Markdown fences/tables and DBML inventory counts were checked. |

Final review preserved interruption exit codes during cleanup failure and handled
the integration child exiting concurrently with a forwarded signal. Workspace
checks and all ten PostgreSQL tests passed again after these fixes. Both database
containers were then stopped; development storage was retained and test tmpfs
was discarded.

Unit launcher fixtures verify shell control flow and ambient-value rejection;
they are distinct from the real Doppler/authentication checks. Existing Step 2
infrastructure evidence remains in its record. No production network/role/TLS,
backup or release policy is established by these tests.

## Handoff and remaining work

Read [local development](local-development.md#drizzle-tooling) for commands,
environment, limits, resource ownership and cleanup. Ordinary unit/build checks
remain usable without Doppler. No host tool installation or shell changes are
required. Test tmpfs can be stopped after validation; development storage persists.

The [Step 3B review packet](../database/step-3b-schema-review-2026-10-25.md) inventories
33 tables, 310 fields, 11 enums and 158 references and lists recommendations
S01–S10. The packet is a proposal, not an approved executable schema. Before
lifting the explicit migration gate, obtain the physical-schema decisions and
finish the flagged audit/scope/enforcement shape checks. Then complete CLI
execution/credential handling with the real migration artifacts and prove fresh
replay, repeated application and structural constraints. Separate approval for
the first concrete development migration remains as recorded in the plan.

Business transaction rollback/concurrency, deletion-versus-funding, aggregate
limits, audit survival, authorization/privacy and API/browser acceptance remain
T01/T02/T03/T06 and their business delivery owners. The current transaction test
proves driver rollback, not a business action. Do not close T06 or claim Step 3B
complete from connection tests. Step 4 must consume the compiled factory with
one pool per process and retain explicit cleanup ownership.
