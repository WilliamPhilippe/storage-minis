# Step 4 — cumulative implementation verification

This record starts on **2026-10-28** (America/Maceio) and is reused across
sessions. Follow the [stage guide](../plans/step-4-fastify-implementation-stages-2026-10-28.md)
and [parent contract](../plans/step-4-fastify-plan-2026-10-28.md).
Stage completion is distinct from full Step 4 acceptance.

## Stage 4.3 — Process lifecycle and entry point

**State: complete.** All required stage checks passed before the local completion
commit. Completion commit subject: `feat(api): add bounded process lifecycle and built entry`.
Resolve its hash with
`git log -1 --format=%H --grep="^feat(api): add bounded process lifecycle and built entry$"`.

### Initial checkpoint (2026-10-28, America/Maceio)

Saved in progress before implementation; the following snapshot is historical.
Current results and next action are in the completed handoff below.

- Checkout: `/Users/william/Documents/code/storage-minis`; verified branch
  `WilliamPhilippe/step-4-implementation-plan`; base
  `29509a3ca2cb4211af1cbb8275c53cad2e4de07a`. Initial Git status was clean.
- Prerequisites: stages 4.1 (`472e0a7`) and 4.2 (`29509a3`) are complete;
  their source/configuration/lockfile inputs match their recorded evidence.
  Read the stage card, execution/checkpoint rules, parent process/start/task
  contracts, approval records and live T06 #26 (open, no comments; unchanged
  #21/#22/#23 dependencies). No business acceptance is introduced.
- Approval: owner explicitly approved the presented P4-04 lifecycle/process
  contract and stage 4.3 start-task portions of P4-08/P4-09 in this session.
  This includes injectable factories/process hooks, early handlers, callback
  identity/order, cancellation, 17s startup/failure and 10s total shutdown bounds,
  HTTP-then-DB cleanup, forced deadline exit 1, successful signal exits 130/143,
  fixed safe diagnostics and the planned built-Node/Turbo start declarations.
- Implemented so far: checkpoint only; no code or task changes yet.
- Checks: branch/status/history and predecessor evidence inspected. Live issue
  read passed after the restricted-network attempt failed. Docker socket access
  requires the existing escalation; no build/test has run in this stage yet.
- Resources: saved Beijing project/ports 5433/5434 retained. No stage-owned
  container, pool, listener, watcher, temporary source fixture or Doppler fetch.
  Inspect actual Docker resource state before checks; do not start DB services.
- Remaining checks: focused lifecycle/API unit tests, finite builds, affected
  type/lint/format checks, start task/compiled-entry inspection, documentation
  consistency/links and Git diff checks. Real OS/DB process proof belongs to 4.4;
  aggregate milestones remain 4.4/4.8/4.11. No image/startup helper is in scope.
- Acceptance: AC4-04 pending lifecycle/route proof; AC4-08/AC4-09 process proof
  remains pending. Existing completed/partial criteria retain their state.
- Next action: record approval in technical direction, implement lifecycle,
  thin entry/start tasks and focused failure/cancellation/cleanup tests; verify
  before synchronizing completion summaries and making the local commit.

### Checkpoint history

- 2026-10-28: documentation validation passed for seven changed Markdown files,
  230 relative links/anchors, paired fences/consistent tables, all 18 distinct
  acceptance IDs and the exact completed set AC4-03/AC4-04/AC4-10. Current
  summaries/approval links agree: 4.3 complete, 4.4 not started, Step 4 in progress.
  Final Docker inspection confirms both original DB containers stopped and no
  running Beijing project container. `git diff --check` passed. Diff/branch
  reviewed; only the 13 stage code/test/task/documentation files will be staged.
  Next execute the local completion commit and verify Git status/hash, then stop.
- 2026-10-28: final API suite passed: 52 tests in 3 files, including 29 lifecycle
  cases. Finite build passed (2 tasks, unchanged DB build cache reused), strict
  typecheck passed (4 tasks), lint and formatting passed. Plain-Node inspection
  verified all 12 emitted API artifacts, compiled syntax/import without acquired
  resources and the exact start commands/Turbo dependencies/environment boundary.
  No API process/DB check ran. Completion summaries are being synchronized;
  next validate Markdown/links/acceptance state, inspect/stage the scoped diff,
  commit locally and verify Git status. Both existing DB containers remain stopped.
- 2026-10-28: focused API suite passed (50 tests, including 27 lifecycle tests),
  strict typecheck passed (4 tasks, 2 unchanged DB cache hits), lint passed.
  Narrow fake timers to lifecycle setTimeout/clearTimeout; real Node HTTP's
  unref'ed maintenance interval and injection stream immediates remain native.
  This resolves the timer fixture without suppressing lifecycle timer checks.
  HTTP/DB cleanup rejection now attempts both owners and forces exit 1 afterward,
  since rejection cannot certify resource release. Two further cancellation
  cases are being added before final checks. No live resources were acquired;
  next verify final focused/strict checks, finite builds and start-task graph,
  then complete documentation validation/staging/commit.
- 2026-10-28: Docker 29.9.2 and existing tooling image
  `sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`
  inspected; both pre-existing Beijing PostgreSQL containers remain stopped.
  Lifecycle/entry, actual start tasks and 27 focused lifecycle fixtures written.
  Initial API unit run: 49/50 passed; one fixture retained light-my-request's
  deferred request-destruction immediate. Initial typecheck found fixture user,
  overloaded Fastify method/factory types; lint found one unsafe matcher value.
  These are being corrected without relaxing checks. Installed dependency
  inspection used grep after confirming rg is absent inside the tooling image.
  No live DB/HTTP/OS-signal proof has run. Next rerun focused units/type/lint,
  then finite build, task/compiled-entry inspection and documentation checks.

### Completed handoff (2026-10-28)

Implemented `apps/api/src/lifecycle.ts`, `src/server.ts`, 29 focused lifecycle
tests and real API/root start declarations with the API-specific Turbo task.
The owner approved P4-04, process deadlines/exit behavior and only the start
portions of P4-08/P4-09; see the
[approval record](technical-direction.md#step-43-lifecycle-process-and-start-task-approval-2026-10-28).
No package/version, lockfile, DB implementation/schema/migration, launcher,
Compose, image, watcher or process-test command changed.

`startLifecycle(readConfig, options)` is inert on import. It installs both
signal handlers before lazy configuration and acquires one DB and one app.
It calls async `registerRoutes(app, database)` once with the same full owned
handle, awaits app readiness, the existing bounded DB identity check, then
listen. `server.ts` supplies `readApiConfig(process.env)` at that explicit entry.
The only delivered routes remain live/ready. A test-owned Fastify route proves
full DB/Drizzle identity and uses the same check capability through injection;
it adds no tRPC, identity, business query or second pool.

Cancellation marks closing immediately, skips later startup operations and
waits for pending acquisition/registration/readiness/listen to settle before
claiming cleanup or removing handlers. Repeated/mixed signals and manual close
calls share one close promise. Startup/failure cleanup has a referenced 17s
watchdog; signals or failure start a single referenced 10s cleanup deadline.
Successful listen removes the startup timer. HTTP drain precedes DB close,
with DB close in `finally` even if HTTP close rejects. Completed cleanup removes
both handlers/timers. Clean signal cleanup sets 130/143, startup failure sets 1;
later signals cannot replace the first result. Any close rejection attempts
both owners, destroys HTTP connections and forces exit 1 because release is
uncertain. A deadline likewise destroys HTTP connections and forces exit 1;
process termination closes remaining DB sockets. Runtime tests intercept exit
and signals and use virtual timeout advancement; they prove orchestration,
not OS termination or real pool/socket release.

Fixtures cover synchronous and async acquisition failure, construction,
registration, app readiness, DB readiness and listen failure; identity/order;
optional registration; cancellation before config and during each async phase;
late acquisition/rejection; repeated signals and first-result preservation;
HTTP/DB/both close rejection; stuck registration/startup cleanup; cancellation
during stuck acquisition; blocked HTTP/DB cleanup and the single total 10s
budget. Every fixture releases its timers/handlers and closes its real
injection-only app. Native Node HTTP maintenance/stream timers stay real while
only lifecycle timeout APIs are faked.

API `start` is `node --enable-source-maps dist/server.js`. Root `start` filters
Turbo to the API. The uncached persistent task depends on its own finite build,
which depends on DB build. Only the parent-listed 12 runtime variables pass
through; build/check tasks receive no new runtime environment or live resources.
Finite API output is exactly `app`, `config`, `lifecycle`, `server`, each with
`.js`, `.d.ts`, `.js.map`; tests are excluded. Direct built Node needs no loader.

All commands below ran from the repository root on 2026-10-28 with existing
`storage-minis-beijing-tooling:step1` image
`sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`,
pinned Node 24.22.1/pnpm 12.15.0, TypeScript 6.0.3, Turbo 2.11.10 and the
unchanged lockfile. Final results:

| Actual command | Result |
| --- | --- |
| `./scripts/tooling.sh run pnpm exec prettier --write apps/api/src/lifecycle.ts apps/api/src/server.ts apps/api/src/lifecycle.test.ts apps/api/package.json package.json turbo.json` | Passed; corrected source/test files also formatted with the same command on the affected paths. |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit` | Passed: 52 tests in 3 files; 29 lifecycle, 14 factory and 9 configuration. |
| `./scripts/tooling.sh run pnpm build` | Passed: 2 tasks, API compiled, unchanged DB build cache reused. Emits the real lifecycle/server entry. |
| `./scripts/tooling.sh run pnpm typecheck` | Passed: 4 tasks; 2 unchanged DB build/typecheck cache hits, root/API checks executed. |
| `./scripts/tooling.sh run pnpm lint` | Passed with zero warnings after the final fixture additions. |
| `./scripts/tooling.sh run pnpm format:check` | Passed; all matched source/configuration files formatted. |
| `./scripts/tooling.sh run node --input-type=module` with the exact stdin probe below | Passed: emitted artifact/syntax/import and actual start/task declarations, with no server process started. |
| `git diff --check` and `python3 /private/tmp/storage-minis-validate-stage-4.3-docs.py` | Passed: changed Markdown links/anchors, fences/tables, stage progress/approval consistency and only AC4-03/AC4-04/AC4-10 checked. |

Exact compiled-output/start-task inspection (no source fixture):

```sh
./scripts/tooling.sh run node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { Server, Socket } from "node:net";
const files = readdirSync("apps/api/dist").sort();
assert.deepEqual(files, ["app", "config", "lifecycle", "server"].flatMap(name => [`${name}.d.ts`, `${name}.js`, `${name}.js.map`]).sort());
for (const name of ["lifecycle", "server"]) execFileSync(process.execPath, ["--check", `apps/api/dist/${name}.js`]);
const api = JSON.parse(readFileSync("apps/api/package.json", "utf8"));
const root = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(api.scripts.start, "node --enable-source-maps dist/server.js");
assert.equal(root.scripts.start, "turbo run start --filter=@storage-minis/api");
const graph = JSON.parse(execFileSync("pnpm", ["exec", "turbo", "run", "start", "--filter=@storage-minis/api", "--dry=json"], { encoding: "utf8" }));
assert.deepEqual(graph.tasks.map(task => task.taskId).sort(), ["@storage-minis/api#build", "@storage-minis/api#start", "@storage-minis/db#build"]);
const task = graph.tasks.find(task => task.taskId === "@storage-minis/api#start");
assert.deepEqual(task.dependencies, ["@storage-minis/api#build"]);
assert.equal(task.command, api.scripts.start);
assert.equal(task.resolvedTaskDefinition.cache, false);
assert.equal(task.resolvedTaskDefinition.persistent, true);
assert.deepEqual(task.resolvedTaskDefinition.passThroughEnv.sort(), ["DB_TARGET", "PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "DATABASE_URL", "HOST", "PORT", "LOG_LEVEL", "NODE_ENV", "TZ"].sort());
const originalOn = process.on;
const originalListen = Server.prototype.listen;
const originalConnect = Socket.prototype.connect;
try {
  process.on = () => { throw new Error("Unexpected process handler during import"); };
  Server.prototype.listen = () => { throw new Error("Unexpected listener during import"); };
  Socket.prototype.connect = () => { throw new Error("Unexpected connection during import"); };
  const lifecycle = await import("./apps/api/dist/lifecycle.js");
  assert.equal(typeof lifecycle.startLifecycle, "function");
  assert.deepEqual(lifecycle.lifecycleLimits, { startupMs: 17000, shutdownMs: 10000 });
} finally {
  process.on = originalOn;
  Server.prototype.listen = originalListen;
  Socket.prototype.connect = originalConnect;
}
console.log("Passed: 12 emitted API artifacts, compiled syntax/import without resource acquisition, plain-Node start, finite build prerequisites, persistent uncached task and exact runtime environment passthrough. No server process started.");
NODE
```

Initial fixture/type/lint failures are retained above and resolved; no required
stage check remains failed or unrun. Frozen dependency installation, DB/schema
compiled consumers and dist-cleaning evidence from 4.1 remains current because
their source/lockfile/compiler/build-script inputs did not change. The actual
API build and affected strict checks were rerun. Full ordinary aggregate remains
scheduled for 4.4/4.8/4.11. Real OS/DB/config/listen/signal proof, API image,
watching, outage/recovery and Compose shutdown checks are unrun here by design.

Acceptance: **AC4-04 complete**, alongside inherited AC4-03/AC4-10. AC4-08 and
AC4-09 have partial lifecycle evidence only; 4.4/4.10 must prove actual built
process failure, signal/termination deadlines, socket/pool release and project
shutdown paths. AC4-12 has start-task inspection only; its final cache evidence
remains with 4.11. Other partial criteria and business/T06 deferrals are unchanged.
Overall Step 4 remains **in progress**; stages 4.4–4.11 are not started.

Resources: saved Beijing project/ports 5433/5434 retained. Both pre-existing
PostgreSQL containers remain stopped. No migration, Doppler fetch, live DB
client/pool, listening API, child server process, watcher or image probe ran.
One-off tooling containers self-removed. No temporary repository fixture or
unrelated uncommitted work remains; ignored dist/cache output is retained.
Necessary code/tests/tasks and seven current guidance/evidence documents are
included in the local completion commit. Its hash is resolved from the subject
above; final Git status is checked after committing.

Next action: stop after the stage 4.3 local commit and Git-status verification.
On a new assignment, begin **4.4** from its stage prompt: obtain uncovered
guarded-runner/process-test approvals, validate the exclusive exact test target,
implement the runner/tests and run the application-foundation aggregate.
No push/PR or automatic next-stage work is authorized by this assignment.

## Stage 4.1 — Configuration and finite builds

**State: complete.** Initial in-progress checkpoint was saved before coding;
all required stage checks passed before the completion commit. Resolve the hash
with `git log -1 --format=%H --grep="^feat(api): add validated configuration and finite builds$"`.
Completion commit subject: `feat(api): add validated configuration and finite builds`.

- Checkout: `/Users/william/Documents/code/storage-minis`; branch verified with
  `git branch --show-current`: `WilliamPhilippe/step-4-implementation-plan`.
  Base: `772f09fc04fccbb81cb14f69595985edada3fb4e`.
- Existing work: modified README, parent plan, technical direction and foundation
  guide; untracked stage guide and stage prompts. Preserve their contents and
  exclude unrelated planning hunks from the implementation commit. Initial diff
  retained at `/private/tmp/storage-minis-pre-4.1.patch` for staging comparison.
- Approval: owner explicitly approved P4-02 (Fastify 5.12.7, Zod 4.6.7 and DB
  workspace link), configuration validation/return contract, TypeScript API
  ESM/declaration/source-map builds, per-package native Node dist cleanup, broad
  API no-emit coverage and root unit-test DB build dependency on 2026-10-28.
  Scope is only the 4.1 portions of P4-08/P4-09; later recommendations remain
  pending. Inherit Step 3 toolchain, schema, DB exports and checks unchanged.
- Implemented: checkpoint/progress record only. No application code changed yet.
- Checks: branch/status/diffs, manifests, DB exports/configuration, TypeScript,
  Vitest, ESLint and Turbo inspected. Existing Docker Compose 5.6.1 is present;
  Docker daemon initially unavailable (missing socket), `.env.compose` and host
  dependency trees absent. No stage build/test result yet.
- Resources: no stage-owned container, listener, watcher, database client or
  temporary source fixture. Starting existing Docker Desktop for inspection;
  select tooling resources only after checking their existing ownership/state.
  No DB start/reset, migration or Doppler fetch is required by this stage.
- Remaining: install approved pins with container pnpm; implement/test config;
  finite builds and strict coverage; frozen install; focused units and affected
  type/lint/format checks; compiled DB/schema runtime/type and stale-output proof;
  documentation validation, selective staging and local Conventional Commit.
- Acceptance: configuration/build portions are pending. No AC4 criterion is
  complete; full acceptance owners remain in the stage guide.
- Next action: inspect live issues and Docker resources, record the approval in
  technical direction, then implement only 4.1 and run its required offline checks.

### Checkpoint history

- 2026-10-28: initial checkpoint above; implementation not yet started.
- 2026-10-28: live #26/#21/#22/#23 inspected with authenticated `gh issue view
  --json number,title,state,body,comments` (initial sandbox network attempt failed;
  escalated read succeeded). Their open business/auth/operations boundaries are
  unchanged. Docker Desktop started; daemon 29.9.2, existing tooling image
  `9654ab9e6cd6` and all six documented Beijing volumes found. Both existing DB
  containers were stopped and remain untouched. Restored missing `.env.compose`
  with existing `configure-local.sh --project storage-minis-beijing --port 5433
  --test-port 5434`; no resource identity replaced.
- 2026-10-28: container `pnpm install` succeeded with approved pins, 45 packages
  added and existing two esbuild-kit deprecation warnings; no build-script policy
  change. Config/tests, API build config, own-dist cleanup and root test build
  dependency implemented. Prettier applied to these files. Required verification
  now running. Before temporary stale-output/strict-coverage probes: no watchers,
  listeners or live DB consumers; use uniquely named source fixtures, remove them
  in `finally`, and leave clean finite outputs. Next run compiled import/type and
  deletion probes, then inspect all stage diffs and prepare evidence/commit.

### Completed handoff (2026-10-28)

Approved choices are recorded in [technical direction](technical-direction.md#step-41-configuration-and-finite-build-approval-2026-10-28).
Implemented configuration returns `http: { host, port, logLevel, nodeEnv }` and
`database` from compiled `readDatabaseConfig`. Defaults apply only to absent
HTTP fields; invalid values yield fixed errors with safe field names. Tests cover
both DB targets, missing/mixed components, URL refusal, blank/invalid HTTP values,
port boundaries, all supported levels/environments and secret-free errors.
Imports acquire no resources. No factory, server, listener, watcher, process
handler or future task placeholder was delivered.

API builds emit only `config.js`, `config.d.ts` and `config.js.map` at this stage.
Both package build scripts remove their own `dist` before TypeScript compilation;
DB output/schema/public API are unchanged. API no-emit checking includes scripts,
tests and all Vitest configs. `tests/consumer.ts` checks schema-aware Drizzle and
row types through compiled workspace exports. The existing Turbo build/type/lint
rules are retained; root unit tests now explicitly depend on DB build. Exact
runtime pins and shared lockfile are updated; existing versions and
`pnpm-workspace.yaml` build-script policy are unchanged.

All commands below ran from the repository root on 2026-10-28 with existing
`storage-minis-beijing-tooling:step1` image `9654ab9e6cd6`, Node 24.22.1,
pnpm 12.15.0, TypeScript 6.0.3 and Turbo 2.11.10. No live DB/Doppler fetch:

| Actual command | Result |
| --- | --- |
| `./scripts/tooling.sh run pnpm install` | Approved dependencies installed; 45 packages added, only existing esbuild-kit deprecations. |
| `./scripts/tooling.sh run pnpm install --frozen-lockfile` | Passed; lockfile current, resolution skipped. |
| `./scripts/tooling.sh run pnpm build` | Passed; finite DB then API builds, two successful tasks. |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit` | Passed: 9 tests. |
| `./scripts/tooling.sh run pnpm typecheck` | Passed across root/API/DB, including API compiled-schema consumer. Repeated after probes: passed. |
| `./scripts/tooling.sh run pnpm lint` | Passed, zero warnings; repeated after fixture cleanup. |
| `./scripts/tooling.sh run pnpm format:check` | Passed; repeated after fixture cleanup. |
| `./scripts/tooling.sh run node .context/verify-stage-4.1.mjs` | Passed final run: forced finite builds removed deleted API/DB source outputs; runtime ESM/declaration/maps exist, tests/server absent; intentionally invalid script/config each produced TS2322 without emit; plain Node compiled config/DB/schema imports succeeded with guarded config environment reads, Pool construction, network/listener calls and signal counts. |
| `./scripts/tooling.sh run pnpm test` | Passed: 36 tests across 8 files (9 API, 27 inherited DB). |
| `./scripts/tooling.sh run pnpm check --dry=json` | Passed graph inspection: root tests/lint and API typecheck depend on DB build; no persistent tasks or runtime env dependency introduced. Saved at `/private/tmp/storage-minis-4.1-graph.json`. |
| `git diff --check` plus local Markdown link/fence/table inspection | Passed for stage changes. |

The temporary probe script is retained only at
`/private/tmp/storage-minis-verify-stage-4.1.mjs` for this session. It wrote
`src/stage41-fixture.ts` in each package, built with `pnpm build --force`, removed
the sources and rebuilt to assert absence of `.js`/`.d.ts`/maps. It also wrote
`apps/api/scripts/stage41-probe.ts` and `apps/api/vitest.stage41.config.mts`,
asserted both type errors and no emit, and removed all fixtures in `finally`.
The first probe attempt expected pnpm status 2 rather than its wrapper status 1;
the second resolved `pg` from API instead of its owning DB workspace. These were
harness-only failures, corrected before the passing final run. No application
change was required. `.context` and the empty temporary scripts directory were
removed. No temporary source edits remain.

Resource handoff: Docker Desktop remains running; `.env.compose` selects existing
Beijing project/ports 5433/5434. Both pre-existing PostgreSQL containers remain
stopped. All one-off tooling containers were automatically removed. No watcher,
listener, DB client, migration, reset or Doppler invocation occurred. Dependencies
and caches remain in existing named volumes; generated clean `dist` is ignored.

Commit scope: API implementation/tests/config, DB build script, lockfile/Turbo,
stage-specific README/AGENTS/technical-direction updates, evidence and the
previously untracked execution guide/prompts needed to publish the required
progress/source packet. Pre-existing execution-document text is preserved.
Unrelated pre-existing README link, parent-plan, technical-direction review and
foundation-guide planning edits are left unstaged. The initial checkpoint above
records their original state.

Acceptance: AC4-05 has offline configuration evidence only; process rejection
before listen remains with 4.4. AC4-11 compiled-build portions, AC4-12 task-graph portions and AC4-14
unit-test portions are partial. All whole-Step-4 criteria retain their completion owners;
none is declared complete by this stage. The full aggregate is scheduled at 4.4,
4.8 and 4.11; live/process/image/watch/cache milestones remain pending by design.
No required 4.1 checks remain. Next action: stop after the local completion commit;
only an explicit next assignment starts 4.2.


## Documentation follow-up (2026-10-28)

The owner requested committing/pushing the four preserved planning-document
changes and updating all stage prompts to always report status and commit when
needed. The README, parent plan, technical direction and foundation guide now
reflect stage 4.1 complete in `472e0a7`, with stages 4.2–4.11 pending and overall
Step 4 in progress. Historical planning/approval records remain dated; pending
technical choices are not approved by this documentation change.

All eleven standalone prompts now require synchronization of affected current
status/approval summaries, inclusion of necessary stage documentation in the
verified completion commit, and an explicit final report of stage/overall status,
checks, actual commit hash or why no new commit was made, remaining uncommitted
files/reasons and next action. An unchanged completed stage reports its existing
commit; failed checks or a blocked commit keep the stage in progress. The stage
guide and technical-direction execution record carry the same rules.

Validation on 2026-10-28: `git diff --check` passed. A local Python inspection of
all seven affected Markdown files checked relative file links, heading anchors,
paired fences and table column structure; all passed. It extracted all eleven
`text` prompt blocks and verified their stage IDs and the new status,
documentation and conditional-commit instructions. Application code, dependencies
and task configuration are unchanged, so the passing 4.1 runtime/type/unit
results above remain applicable; no application tests or live experiments were
rerun for this documentation-only follow-up.

Completion commit subject: `docs: sync Step 4 status and stage handoffs`; resolve
its hash through Git history. Commit/push all seven affected documentation files
on `WilliamPhilippe/step-4-implementation-plan` as explicitly requested, then
verify remote branch identity and a clean working tree. No additional application
stage or resource changes are part of this follow-up. Next application work
remains stage 4.2 only when assigned.

## Stage 4.2 — HTTP factory, health and safe logs

**Current state: complete.** Required focused/strict/build checks passed on
2026-10-28. Overall Step 4 remains in progress; stages 4.3–4.11 are not started.
Completion commit subject: `feat(api): add injectable HTTP factory and safe health routes`.
Resolve its hash with
`git log -1 --format=%H --grep="^feat(api): add injectable HTTP factory and safe health routes$"`.

### Initial checkpoint (2026-10-28; historical)

**State: in progress.** Initial checkpoint saved before implementation on
2026-10-28. Overall Step 4 remains in progress.

- Checkout: `/Users/william/Documents/code/storage-minis`; verified branch
  `WilliamPhilippe/step-4-implementation-plan`; base
  `a7b14a8ca9abf95902035775c57965c06374c399`. Initial status/diff clean.
- Predecessor: 4.1 complete at `472e0a774f4a8e38249ea0f601794adbc859402a`;
  its source, lockfile, build and strict-check inputs are unchanged. Documentation
  follow-up is `a7b14a8`. Reuse its configuration/compiled DB/build evidence;
  rerun checks affected by the new factory/tests.
- Approval: owner explicitly approved P4-03/P4-05/P4-06 in this session on
  2026-10-28: narrow injected DB check/closing capability, unlistening factory,
  exact health and safe error behavior, 16 KiB/10s/idle-close/no-proxy settings,
  generated IDs and allowlisted Fastify JSON logging. No new dependency,
  lifecycle owner, listener, process handlers or later stage is approved here.
- Inspection: live #26/#21/#22/#23 and comments read; business/auth/operations
  boundaries remain open. Pinned Fastify server/logging documentation reviewed.
  No source/configuration change or stage test has run yet.
- Resources: existing `storage-minis-beijing` settings/ports 5433/5434 retained.
  Both pre-existing PostgreSQL containers are stopped; no DB/Doppler invocation
  is needed. Docker socket inspection required sandbox escalation and succeeded.
  No stage-owned listener, pool, watcher, client or temporary source fixture.
- Checks pending: focused API injection suite; affected type/lint/format/build;
  construction/import side-effect proof, documentation links/fences/tables and
  final diff review. No failed application check yet.
- Acceptance: AC4-03/AC4-10 pending; AC4-06/AC4-07 will remain partial until real
  HTTP/DB/outage proof in later stages. No full Step 4/T06 completion claim.
- Next action: record scoped approval in technical direction, implement only
  `apps/api/src/app.ts` and focused tests, then verify and update this checkpoint
  before any temporary fixture experiment. Commit only after all stage checks
  pass; stop after the local commit and status verification.

### Checkpoint history

- 2026-10-28: factory and 12 focused tests implemented; first API unit run had
  20 passes/one harness failure because the environment guard also counted Node's
  module-loader coverage/watch switches. Those two instrumentation reads are now
  explicitly distinguished; all application/DB environment keys remain guarded.
  Rerun passed all 21 API tests (12 factory, 9 configuration).
- Initial typecheck exposed Fastify's specialized error serializer type requiring
  raw message/stack fields and a narrower-than-supported response serializer
  parameter. Use Fastify's exported Pino serializer dictionary type, preserving
  strict checking and safe omission. Initial lint exposed unnecessary async test
  fixtures/liveness and a void-return framework callback. These are corrected;
  affected checks must pass again before completion. No DB or network resource
  was acquired by these checks.
- Before any temporary fixture proof: only committed-scope factory/tests/docs
  are edited; no temporary fixture exists. Remaining actions: rerun affected
  units/type/lint, finite build, any compiled import proof, synchronize current
  summaries, validate documentation/format/diff and commit the stage. No listener,
  watcher or DB service has been started; one-off tooling containers self-remove.
- 2026-10-28: expanded to 14 factory/23 total API tests, all passing. Typecheck
  now passes and finite DB/API build passes. The Pino dictionary type is shipped
  at `fastify/types/logger.js`, rather than re-exported from Fastify's root;
  the intermediate missing-root-export type/build failures are resolved. Lint
  also requires the intentional non-Error rejection fixture to use Vitest's
  typed rejection helper; rerun lint after that fixture correction.
- Before compiled import experiment: use only an inline plain-Node probe against
  current `dist/app.js`, with injected DB behavior, guarded environment/network/
  process methods and no file fixture. No listener or DB work will be started.
  Next: compiled probe and final affected checks, then documentation and commit.

### Completed handoff (2026-10-28)

The [approved P4-03/P4-05/P4-06 choices](technical-direction.md#step-42-factory-http-and-logging-approval-2026-10-28)
are implemented in `apps/api/src/app.ts` and 14 focused factory tests in
`apps/api/src/app.test.ts`. No dependency, package script, shared configuration,
DB schema/migration, lifecycle or process-entry change was needed. Construction
consumes explicit HTTP configuration and `Pick<Database, "check">`/`isClosing`;
its DB and API-config imports are type-only. The factory never calls `listen`,
creates a pool, registers process handlers or reads application environment.

Injection proves exact live 200/ready 200/unavailable 503 responses, no liveness
DB call, a fresh readiness check on every eligible request, failure/recovery and
closing before/during an in-flight check. Error/not-found handlers return fixed
bodies; malformed/empty JSON and malformed URLs are safe 400, oversized bodies
413, unsupported media 415, other client failures retain their 4xx status with a
fixed category, and unexpected/non-Error failures are safe 500. The exact 16 KiB
body boundary and disabled proxy trust are exercised. A 10s receive timeout is
configured; injection does not prove real socket timeout timing.

Fastify JSON logs use generated UUID request IDs with client IDs disabled,
method, matched route template/fixed unmatched label, status and elapsed time.
Envelope fields are level/time/fixed message; default PID/hostname bindings are
omitted. The supported native `LogController` disables default request logs
without its deprecated top-level option. Request/response/error serializers omit
raw data, with authorization/cookie redaction retained as defense in depth.
Tests capture stdout and assert the metadata key allowlist, distinct generated
IDs and absence of hostile URL/query/path/header/body/password/DB-URL/SQL/error/
stack/cause/client-ID sentinels. Temporary routes exist only in test-owned apps;
every test closes its instances. No diagnostic fixture route ships in the app.

The import/construction test guards environment access (except Node's two module
loader instrumentation switches), network calls and process registration, and
rejects any runtime DB-package import. A separate plain-Node compiled-output
probe confirms no configuration/DB runtime import and construction with those
guards enabled. This uses injected behavior only, not real DB/HTTP evidence.

Commands below ran from the repository root with the existing
`storage-minis-beijing-tooling:step1` image
`sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`,
pinned Node 24.22.1/pnpm 12.15.0 and
the unchanged lockfile on 2026-10-28. Final results:

| Actual command | Result |
| --- | --- |
| `./scripts/tooling.sh run pnpm exec prettier --write apps/api/src/app.ts apps/api/src/app.test.ts` | Passed; final run unchanged. |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit` | Passed: 23 tests in 2 files, including 14 factory tests and 9 unchanged configuration tests. |
| `./scripts/tooling.sh run pnpm typecheck` | Passed: 4 tasks, including broad API source/test checking; unchanged DB build/typecheck cache reused. |
| `./scripts/tooling.sh run pnpm lint` | Passed with zero warnings. |
| `./scripts/tooling.sh run pnpm format:check` | Passed; all matched source/configuration files formatted. |
| `./scripts/tooling.sh run pnpm build` | Passed: finite DB/API builds, 2 tasks. API output adds `app.js`, `app.d.ts`, `app.js.map`; tests/server are excluded. |
| Plain-Node inline command below | Passed; no unexpected environment read, runtime DB import, handler, listener, connection or construction-time DB check. App closed afterward. |
| `git diff --check` and `python3 /private/tmp/storage-minis-validate-stage-4.2-docs.py` | Passed: 7 changed Markdown files, 221 relative links/anchors, paired fences, consistent tables, 18 distinct acceptance IDs and only AC4-03/AC4-10 checked. |

Exact compiled-output probe command (no file fixture):

```sh
./scripts/tooling.sh run node --input-type=module -e 'import assert from "node:assert/strict"; import { Server, Socket } from "node:net"; import { readFileSync } from "node:fs"; import { createRequire } from "node:module"; const requireApi = createRequire(new URL("./apps/api/package.json", import.meta.url)); await import(requireApi.resolve("fastify")); const originalEnv = process.env; const originalOn = process.on; const originalConnect = Socket.prototype.connect; const originalListen = Server.prototype.listen; let app; let checks = 0; try { process.env = new Proxy(originalEnv, { get(target, key) { if (key === "WATCH_REPORT_DEPENDENCIES" || key === "NODE_V8_COVERAGE") return Reflect.get(target, key); throw new Error("Unexpected environment read: " + String(key)); } }); process.on = () => { throw new Error("Unexpected process handler"); }; Socket.prototype.connect = () => { throw new Error("Unexpected connection"); }; Server.prototype.listen = () => { throw new Error("Unexpected listener"); }; const source = readFileSync("apps/api/dist/app.js", "utf8"); assert(!source.includes("@storage-minis/db")); assert(!source.includes("./config.js")); const { buildApp } = await import("./apps/api/dist/app.js"); app = buildApp({ host: "127.0.0.1", port: 3000, logLevel: "silent", nodeEnv: "test" }, { database: { check: () => { checks++; return Promise.resolve(); } }, isClosing: () => false }); assert.equal(app.server.listening, false); assert.equal(checks, 0); } finally { process.env = originalEnv; process.on = originalOn; Socket.prototype.connect = originalConnect; Server.prototype.listen = originalListen; if (app) await app.close(); } console.log("Compiled factory import/construction passed: no app/DB config reads, runtime DB import, process handlers, listener or connection.");'
```

Initial failed harness/type/lint/build attempts are retained in checkpoint history
above; all are resolved by the final passing checks. No required stage check is
failed or unrun. Frozen installation and unchanged DB/schema/build-cleanup proof
remain current from 4.1; this stage changed none of their inputs. No temporary
source/dependency fixtures were written. The ordinary full aggregate remains
scheduled for 4.4/4.8/4.11; real HTTP/DB/process/image/watch/outage checks are unrun
here because they belong to subsequent stages.

Acceptance: **AC4-03 and AC4-10 complete**. AC4-06/AC4-07 remain **partial**:
injected exact health/failure/recovery/closing behavior is proven, but actual HTTP,
authenticated checks, the inherited 6s bound and real outage/recovery await
4.4/4.9. Existing AC4-05/AC4-11/AC4-12/AC4-14 portions remain partial. The other
criteria retain their existing completion owners. No business, authorization or
full T06 acceptance is claimed.

Resources: existing Beijing project/ports 5433/5434 and settings retained. Both
pre-existing PostgreSQL containers remain stopped. No migration, Doppler fetch,
real DB client, pool, listening server or watcher ran. One-off tooling containers
self-removed; ignored generated output/cache stays in place. No temporary source
fixture or unrelated uncommitted work remains. Necessary stage docs are included
with code/tests in the completion commit; final Git status must be verified after
committing.

Next action: stop after the local Conventional Commit and clean-status check.
Only a new assignment starts stage 4.3; first obtain its uncovered P4-04/process
approvals before implementing lifecycle/entry code. No push/PR action is part of
this stage assignment.
