# Step 4 — Prompts for individual implementation stages

**Date:** 2026-10-28. **Status:** owner-approved execution instructions;
implementation has not started. Copy only the prompt for the stage being assigned.
Each prompt also resumes that same stage after an interruption; no placeholder
stage number or evidence path needs replacing.

The [stage guide](step-4-fastify-implementation-stages-2026-10-28.md) defines the
eleven fixed boundaries, progress table, verification milestones and checkpoint
format. The [parent plan](step-4-fastify-plan-2026-10-28.md) remains authoritative
for technical contracts and acceptance criteria. These prompts approve no pending
technical choices and do not start implementation. Commands for new API features
become available only in their assigned stages.

## Prompt 4.1 — Configuration and finite builds

```text
From the repository root, implement or resume ONLY stage 4.1 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, that guide's execution/completion/checkpoint rules and 4.1 card.
In docs/plans/step-4-fastify-plan-2026-10-28.md read inherited scope, proposed
decisions, application/configuration contract and build/development/Turbo contract.
Inspect current manifests, API/DB exports, build/test configuration and git diff.
Inherit delivered Step 3 work. Present any uncovered dependency, build or task
choices for owner approval before implementation; use recorded approvals as-is.

Find the cumulative evidence path in the progress table. If missing, create
docs/technical/step-4-verification-<implementation-date>.md using the actual date
and save its path there. Write an initial in-progress checkpoint before coding;
update it after meaningful verified results and before stopping.

Implement approved dependencies, src/config.ts and its tests, finite API/DB
builds, strict no-emit coverage and only task declarations used by those commands.
Emit meaningful configuration output; add no dummy server, listener or watcher.
Verify valid/invalid inputs, secret-free failures, side-effect-free imports,
compiled DB/schema runtime/type resolution and removal of stale build output.
Use existing container tooling. Check frozen installation and finite builds;
run focused API unit tests plus affected type/lint/format checks. For example,
./scripts/tooling.sh run pnpm exec vitest run --project api-unit runs that subset.
Record actual commands/results; these checks need no live DB or Doppler fetch.

Finish the progress/evidence entry and a local Conventional Commit only after
required checks pass. Include this stage's files and evidence, excluding unrelated
work; record the commit subject and report the resulting hash. Then stop.
If interrupted, leave 4.1 in progress with exact remaining checks, diff/resource
state and next action. Resume 4.1; do not split it or begin 4.2 automatically.
```

## Prompt 4.2 — HTTP factory, health and safe logs

```text
From the repository root, implement or resume ONLY stage 4.2 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, that guide's execution/completion/checkpoint rules and 4.2 card.
In docs/plans/step-4-fastify-plan-2026-10-28.md read the application/HTTP contract,
P4-03/P4-05/P4-06 and factory, health, error and logging verification rows.
Require current completed 4.1 evidence. Locate the existing cumulative evidence
file through the progress table; inspect the checkout/diff before relying on it.
Obtain approval for uncovered factory, HTTP or logging choices before coding.
Write an initial in-progress checkpoint and update it after verified results.

Implement src/app.ts and focused injection tests: an unlistening Fastify factory,
narrow DB-check/closing dependencies, exact live/ready routes, safe errors and
not-found responses, generated request IDs and the allowlisted logger contract.
Construction must read no environment and open no listener/pool/process handlers.
Verify no liveness DB calls, fresh readiness checks, failure/recovery/closing,
malformed/oversized requests and omission of hostile request/secret sentinels.
Tests close their own instances. Run
./scripts/tooling.sh run pnpm exec vitest run --project api-unit
and affected type/lint/format/build checks. Record exact commands and results.
Use injected DB behavior here; real HTTP/outage proof remains partial for later.

Record AC4-03/AC4-10 evidence and remaining partial criteria. Update the checkpoint
before temporary fixtures and at handoff. When all stage checks pass, update its
progress and make a local Conventional Commit of its changes/evidence, excluding
unrelated work; record the subject and report the hash. Then stop.
If interrupted, keep 4.2 in progress with exact next action and failed/unrun
checks. Resume this stage without splitting it or starting 4.3 automatically.
```

## Prompt 4.3 — Process lifecycle and entry point

```text
From the repository root, implement or resume ONLY stage 4.3 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, that guide's execution/completion/checkpoint rules and 4.3 card.
In docs/plans/step-4-fastify-plan-2026-10-28.md read application/process contracts,
P4-04, API start declarations and relevant lifecycle verification rows.
Require completed 4.1-4.2 with current evidence. Find the cumulative evidence file
in the progress table; inspect the checkout/diff and approval record. Obtain
approval for uncovered lifecycle/deadline/task choices before implementing them.
Save an initial in-progress checkpoint; update after meaningful verified results.

Implement src/lifecycle.ts, src/server.ts, focused lifecycle tests and actual
built start commands. Own one DB handle and one app. Pass that same full DB to
the registration callback before readiness/listen. Install early signal handling,
bounded startup and idempotent cleanup under the parent deadlines/exit contract.
Verify acquisition/registration/readiness/listen/close failures, callback identity
and order, repeated signals, startup cancellation and pool cleanup after HTTP
close failure. Run focused API unit tests through existing tooling, finite builds
and affected strict checks; record exact commands/results. Real OS/DB proof
belongs to 4.4, so do not claim it from mocks or introduce image/startup helpers.

Record AC4-04 evidence and the remaining process proof. Update progress/evidence
and create a local Conventional Commit only when stage checks pass, excluding
unrelated work. Record the commit subject and report its hash. Then stop.
If interrupted, leave 4.3 in progress with exact remaining work, checks and
resource state. Resume it without splitting it or starting 4.4 automatically.
```

## Prompt 4.4 — Guarded built-process tests

```text
From the repository root, implement or resume ONLY stage 4.4 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker/PostgreSQL/Drizzle guidance, the stage guide's
execution/completion/checkpoint rules and 4.4 card. In the parent plan
docs/plans/step-4-fastify-plan-2026-10-28.md read P4-09/P4-10, the verification
matrix and exact test-target/deadline contracts. Inspect existing DB runner and
prefetch guards. Require current completed 4.1-4.3 evidence; use the cumulative
evidence path in the progress table. Obtain owner approval for uncovered
runner/task/test choices before coding. Save the initial checkpoint and record
ownership before live work.

Implement the dedicated process runner/Vitest suite, test:process, root test:api
and uncached finite-build prerequisite. Add both names to the prefetch test-only
guard. Establish child/output/port/watchdog ownership before real scenarios.
Verify wrong/dev targets refuse before fetching or connecting; healthy built
Node startup and exact HTTP; invalid config/credentials/unavailable DB/occupied
port; basic SIGINT/SIGTERM; no leaked children, listener or pool. Use only the
explicit test target after the schema suite releases it. Preserve development.

Run focused guards/strict checks, then the guarded suite using
./scripts/tooling.sh run-db test pnpm test:api
and the foundation milestone ./scripts/tooling.sh run pnpm check.
Record commands, deadlines, source identity and cleanup. AC4-05/AC4-08 may close
with complete evidence; AC4-06 remains partial until 4.9's real outage proof.
Save checkpoints after verified scenarios and before live fixture changes.

After required checks pass, update progress/evidence and make a local Conventional
Commit of this stage's files/evidence, excluding unrelated work. Record its subject
and report the hash; stop. On interruption keep 4.4 in progress with exact next
scenario and owned-resource state. Do not split it or begin 4.5 automatically.
```

## Prompt 4.5 — Self-contained runtime image

```text
From the repository root, implement or resume ONLY stage 4.5 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker tooling, the stage guide's execution/completion/
checkpoint rules and 4.5 card. In docs/plans/step-4-fastify-plan-2026-10-28.md
read the dedicated-image contract, P4-11, package files/deploy and compiled-export
requirements. Require current completed 4.1-4.4 evidence; locate the existing
cumulative evidence file through the progress table. Inspect the diff and current
packaging inputs. Obtain approval for uncovered packaging choices before coding.
Write an initial checkpoint and update it after meaningful verified results.

Implement docker/Dockerfile.api build/package/runtime targets, root .dockerignore
and API/DB package files for portable production deployment. Preserve approved
Node/pnpm pins and tooling image; development and Compose registration come later.
Build from the repository root using the approved runtime target, for example
docker build --file docker/Dockerfile.api --target runtime .
Inspect the resulting image: plain Node/nonroot runtime, production dependencies,
compiled API/DB/schema/declaration files, workspace links resolving inside the
packaged tree, and no environment/credential files or escaping workspace links.
Build requires no DB/Doppler access. Run affected build/type/lint/format checks.
Record exact commands, image/source identities and AC4-11 packaging evidence.
Authenticated container startup and AC4-01 completion remain for 4.6.

Update progress/checkpoint and make a local Conventional Commit only after stage
checks pass, including its evidence and excluding unrelated work. Record the
subject and report the hash, then stop. If interrupted, keep 4.5 in progress
with exact next action, checks and image/resource state; resume this stage without
splitting it or starting 4.6 automatically.
```

## Prompt 4.6 — Canonical Compose and Doppler startup

```text
From the repository root, implement or resume ONLY stage 4.6 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker/PostgreSQL guidance, approved setup/maintenance
records, the stage guide's execution/completion/checkpoint rules and 4.6 card.
In docs/plans/step-4-fastify-plan-2026-10-28.md read Compose/saved-settings/
credential ownership, shutdown amendments, native aliases and relevant security
matrix rows. Inspect database.sh/local-config.sh and inherited diagnostic tests.
Require current completed 4.1-4.5 evidence and its image. Use the progress table's
cumulative evidence file; inspect the diff. Obtain owner approval for uncovered
P4-07/P4-11/task details before coding. Checkpoint initially, after verified
results and before live experiments, recording ownership and cleanup commands.

Add only the runtime api profile/service to canonical compose.yaml, narrow api-up
Doppler operation and native aliases for commands now usable. Preserve saved
three-key settings, selected-key injection, diagnostic forwarding and no fallback.
Apply service grace/health and remove conflicting project-wide timeout overrides;
preserve DB-only bounds. Add no general dispatcher or extra Compose/settings file.

Verify default exclusion, shared volume identities, secret-free model/build/log/
stop, target/key/token/ambient-value refusal and safe diagnostics. Build api with
native Compose and start it through ./scripts/database.sh api-up test after test
DB preparation. Probe exact loopback HTTP, explicit collision failure, native
stop and fresh-environment saved settings. Never migrate or change managed secrets.
Run focused launcher/security and affected strict checks; record image/commands
and cleanup. AC4-01 may close; AC4-13 stays partial through 4.7-4.8. Full project
drain proof remains for 4.10; add no api-dev/api-verify placeholders here.

When required checks pass, update progress/evidence and make a local Conventional
Commit of this stage's changes/evidence, excluding unrelated work. Record its
subject and report the hash; stop. If interrupted, leave 4.6 in progress with
resource state and exact next action. Resume it; do not split or start 4.7.
```

## Prompt 4.7 — Development image and reload

```text
From the repository root, implement or resume ONLY stage 4.7 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker/PostgreSQL guidance, the stage guide's execution/
completion/checkpoint rules and 4.7 card. In the parent plan
docs/plans/step-4-fastify-plan-2026-10-28.md read build/development/Turbo contracts,
development image/volume/security rules and reload verification rows. Require
current completed 4.1-4.6 evidence. Locate the cumulative evidence file through
the progress table and inspect the diff. Obtain approval for uncovered watcher,
development image or api-dev details before coding. Save an initial checkpoint;
update after verified results and before temporary edits/live experiments.

Implement the development Dockerfile target, canonical api-dev profile/service,
API/DB/root watchers, persistent uncached task graph and narrow api-dev injection.
Extend native aliases only for real services. Reuse the five existing tooling
volumes, with no DB credentials reaching compilers or host dependency mounts.
Verify finite DB build precedes watchers; API edits visibly reload; compiled DB
implementation/schema edits visibly change/reload consumers; compiler errors
recover after correction; rapid edits and foreground interruption behave safely.
Use ./scripts/database.sh api-dev dev for the approved development path, without
migrations or data resets. Record actual behavior/PIDs and secret-boundary checks,
restore fixtures byte for byte, then stop watchers before finite clean builds.
Run focused reload/security and affected strict checks; record exact commands.

Save AC4-02 evidence and partial AC4-13 results, instructions and cleanup state.
After required checks pass, update progress and make a local Conventional Commit
of stage changes/evidence, excluding unrelated work. Record the subject and
report its hash; stop. If interrupted, leave 4.7 in progress with exact remaining
scenario and fixture/resource restoration actions. Resume it; do not split or
begin 4.8 automatically.
```

## Prompt 4.8 — Bounded runtime-image smoke

```text
From the repository root, implement or resume ONLY stage 4.8 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker/PostgreSQL guidance, the stage guide's execution/
completion/checkpoint rules and 4.8 card. In the parent plan
docs/plans/step-4-fastify-plan-2026-10-28.md read local verification, smoke bounds,
credential ownership and isolation matrix rows. Require current completed
4.1-4.7 evidence. Find the cumulative evidence path in the progress table and
inspect the diff/image inputs. Obtain owner approval for uncovered smoke/helper/
test choices before coding. Checkpoint initially, after verified results and
before each live fixture; record probes/ports/deadlines/cleanup before starting.

Implement scripts/verify-api.sh, exact-test-only api-verify and its direct alias.
Use the canonical runtime service as an owned one-off probe; do not add another
Compose service/file or general lifecycle dispatcher. Bounds, sanitization,
ownership and interruption cleanup must exist from the first implementation.
Run ./scripts/database.sh api-verify test only after other test consumers finish.
Prove exact host HTTP bodies, image/container identity, deliberate dynamic
loopback port or explicit collision failure, SIGTERM exit, repeated uncached
runs and cleanup on success/failure/interruption. Exercise bad credentials without
changing managed Doppler values. Verify request/overall deadlines, sanitized
streams and no source/dependency mounts. Recheck changed credential paths.

Run focused script/security/strict checks and the container integration milestone
./scripts/tooling.sh run pnpm check. Record all commands, identities and cleanup;
close AC4-13/AC4-15 only with complete current evidence across runtime/dev/smoke.
After required checks pass, update progress/evidence and make a local Conventional
Commit of this stage's files/evidence, excluding unrelated work. Record its subject
and report the hash; stop. On interruption keep 4.8 in progress with exact next
scenario/resource state. Resume it; do not split or begin 4.9 automatically.
```

## Prompt 4.9 — Database failure, recovery and test isolation

```text
From the repository root, implement or resume ONLY stage 4.9 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README PostgreSQL/Drizzle guidance, the stage guide's execution/
completion/checkpoint rules and 4.9 card. In the parent plan
docs/plans/step-4-fastify-plan-2026-10-28.md read readiness, shared-target/outage
matrix rows and unmigrated-DB behavior. Inspect Step 3B schema-suite reset behavior.
Require current completed 4.1-4.8 evidence. Locate the cumulative evidence through
the progress table, inspect current checkout/resources and obtain owner approval
for uncovered test-fixture choices before implementation. Checkpoint initially
and after each scenario; record ownership/restoration before test disruption.

Extend the existing real-process/live verification for DB socket disruption and
controlled test-service stop/restart. Reuse target validation and termination
techniques; add no distributed lock or new infrastructure. While the API stays
running, prove live 200, bounded ready 503, then ready 200 without API restart.
An authenticated unmigrated test DB must satisfy diagnostic readiness; startup
never migrates. Keep schema replay, guarded process, image smoke and outages
exclusive and sequential on a shared disposable target. Close clients/probes
between phases and preserve development storage/unrelated resources.

Use existing guarded test commands and native test-service stop/start; record
exact commands, identities, deadlines, test state and restoration. Run focused
tests and affected strict checks; reuse valid prior evidence unless inputs change.
Close AC4-06/AC4-07/AC4-14 only when all scenarios are actually demonstrated.
After required checks pass, update progress/evidence and make a local Conventional
Commit of its changes/evidence, excluding unrelated work. Record the subject and
report the hash; stop. If interrupted, leave 4.9 in progress with exact next action,
especially restoring stopped test PostgreSQL. Resume it; do not split/start 4.10.
```

## Prompt 4.10 — Shutdown through all project paths

```text
From the repository root, implement or resume ONLY stage 4.10 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, README Docker/PostgreSQL/volume-reset guidance, the stage guide's
execution/completion/checkpoint rules and 4.10 card. In the parent plan
docs/plans/step-4-fastify-plan-2026-10-28.md read process deadlines, per-service
grace and project shutdown/isolation matrix rows. Require current completed
4.1-4.9 evidence. Locate the cumulative evidence path through the progress table;
inspect the diff/current resources and obtain owner approval for uncovered
fixture/test choices before coding. Use a distinct disposable project for teardown.
Save the initial checkpoint and each result; before experiments record resources,
temporary edits, bounds and restoration/cleanup actions.

Close startup-interruption, repeated-signal, failed/hung-cleanup and watchdog
cases using the existing harness. Verify API-only stop, full-profile stop/down
and guarded disposable volume deletion with a bounded in-flight fixture request.
Ship no diagnostic delay route. Prove the 10s process bound and 15s API service
grace, no conflicting global timeout, correct process/container exit separately
from Compose client status, ordinary volume preservation and owned-only deletion.
Preserve another project's resources and the owner's development data. Use native
Compose and the existing confirmed volume-reset guard; no global prune/reset.

Run focused shutdown/guard tests and affected strict checks; rerun any earlier
process/smoke paths invalidated by fixes. Restore fixtures and clean owned probes.
Record exact commands/outcomes/resources and AC4-09/AC4-17 evidence. When required
checks pass, update progress/evidence and make a local Conventional Commit of this
stage's files/evidence, excluding unrelated work. Record the subject and report
the hash; stop. If interrupted, keep 4.10 in progress with completed scenarios,
remaining cases and exact cleanup/resume action. Do not split it or start 4.11.
```

## Prompt 4.11 — Cache verification, documentation and final handoff

```text
From the repository root, implement or resume ONLY stage 4.11 of
docs/plans/step-4-fastify-implementation-stages-2026-10-28.md.

Use only branch WilliamPhilippe/step-4-implementation-plan for every stage.
Verify it with git branch --show-current before changing files. Preserve
existing work; do not create another branch or worktree per stage.

You are responsible for staging this stage's files and running git commit
with a Conventional Commit message after required checks pass. Do not stop
at a suggested message or leave the commit to the owner. Report the actual
commit hash. If committing is blocked, record why and keep the stage
in progress instead of claiming completion.

Read AGENTS.md, that guide's execution/completion/checkpoint rules and 4.11 card.
In docs/plans/step-4-fastify-plan-2026-10-28.md read task graph, all AC4-01-18,
handoff/documentation and Step 5/6 extension contracts. Require current completed
4.1-4.10 evidence. Locate the existing cumulative record through the progress
table; inspect checkout/diff, approvals and source/image/environment identities.
Obtain owner approval for uncovered changes before implementation. Write the
initial checkpoint; update after results and before temporary/live experiments.

Verify real task discovery, finite cache reuse, deleted-output restoration,
source invalidation and uncached live work against the complete implementation.
Run the final aggregate milestone ./scripts/tooling.sh run pnpm check and affected
live checks when later changes invalidate prior evidence. Do not repeat every
unchanged live scenario merely to obtain a new date; justify reused results.
Resolve every acceptance gap. Full Step 4 completion needs all eighteen criteria.

Finish README/local-development commands, variables, logs, failure cleanup and
limits; approval/implemented-state records; cumulative evidence/progress and the
Step 5/6 handoff. If actual tooling requires AGENTS.md changes, use its applicable
writing skill. Preserve deferred business/auth/production/CI work. Deliver the
existing Step 4 PR/evidence within the assignment's recorded authorization;
otherwise leave unmet PR evidence explicit rather than claiming AC4-18 complete.
Run documentation links/fences/tables and git diff --check after final edits.

Record AC4-12/AC4-16/AC4-18 and final reconciliation. When required stage checks
and handoff obligations pass, update progress/evidence and create a local
Conventional Commit, excluding unrelated work. Record its subject and report the
hash, results and limitations; stop. If incomplete, keep 4.11 in progress with
exact gaps/next action. Do not split it, declare Step 4 complete prematurely or
start foundation Step 5 automatically.
```
