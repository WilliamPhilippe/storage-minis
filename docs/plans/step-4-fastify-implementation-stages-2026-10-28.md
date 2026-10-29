# Step 4 — Sequential implementation stages

**Date:** 2026-10-28. **Status:** execution rules approved by the owner;
stages 4.1–4.11 and all eighteen Step 4 criteria are complete, including
[authorized PR #107 evidence](https://github.com/WilliamPhilippe/storage-minis/pull/107). The
[Step 4 plan](step-4-fastify-plan-2026-10-28.md) remains authoritative for technical
contracts, approved amendments, pending choices and AC4-01–AC4-18.

The owner requested small sequential assignments because an AI agent may exhaust
its usage allowance during implementation. Each assignment below has a concrete
result, checks and a stopping point. These are internal stages of foundation
Step 4, not foundation Steps 5/6, new backlog issues or new technical decisions.
The existing Step 4 PR/delivery boundary remains unchanged. After the planning
interview, the owner confirmed retaining these **11 stages** and requested a
[copyable prompt for every stage](step-4-fastify-stage-prompts-2026-10-28.md).
Those prompts are the starting packets for fresh and resumed sessions.

## How to execute one stage

1. Use the assigned stage's [prompt](step-4-fastify-stage-prompts-2026-10-28.md).
   Assign exactly one stage by ID, such as `4.2`. Read `AGENTS.md`, the current
   progress/handoff, that stage's card and the linked parent-plan sections it
   needs. Reuse recorded predecessor evidence rather than researching the whole
   foundation again. Inspect live T06 and relevant prerequisites as required by
   the repository guide. Existing approval requirements remain; the breakdown
   itself does not approve pending dependencies or implementation choices.
   Identify those choices before implementation, present concrete recommendations
   with alternatives/tradeoffs, and obtain approval before their consuming work.
   Record existing approval rather than asking again for the same scoped choice.
2. Confirm earlier stages are complete against the current checkout. Use only
   `WilliamPhilippe/step-4-implementation-plan` for all stages; verify it with
   `git branch --show-current` before changing files and against the checkpoint
   on resume. Do not create a branch or worktree per stage. Reuse
   saved settings and approved tooling. Inspect any uncommitted work before
   continuing; a previous agent may have stopped mid-stage.
3. Before implementation, save an initial **in progress** checkpoint in the
   cumulative evidence file. Update it after each meaningful verified result,
   before live experiments or temporary fixture edits, and before stopping. Give
   exact next actions even when no check has passed yet; do not rely on a final
   response as the only restart record.
4. Implement only the assigned scope, including its meaningful tests and the
   minimum task/configuration declarations used by real code. Add no placeholder
   commands/services for later stages. Run focused tests and affected strict
   checks; use the integration milestones below for ordinary aggregate checks.
   Live checks remain separate from offline `pnpm check`.
5. Update the progress row and cumulative evidence file with results, exact next
   action, pending checks and resources. Only after required stage checks pass,
   prepare its completion record. The implementing agent is responsible for
   staging the stage's changes/evidence and executing `git commit` with a
   Conventional Commit message on the named branch. A suggested message or
   instruction for the owner to commit is not a completed handoff. Inspect the
   diff first and exclude unrelated existing work. Synchronize affected current
   status/approval summaries in the parent plan, foundation guide, README and
   technical direction alongside progress/evidence; preserve dated history.
   If an already completed stage needs no changes, verify/report its existing
   commit instead of creating an empty commit. If committing is blocked,
   record why and leave the stage in progress. Record the intended commit subject
   in the evidence, resolve its hash
   through Git history, and report the resulting hash in the handoff. This avoids
   needing a second commit solely to record a commit's own hash. Pushing/PR work
   remains subject to the implementation assignment's existing authorization.
   Verify `git status --short` after committing. Every handoff reports the assigned
   stage state and overall Step 4 state, checks passed/failed/unrun, actual commit
   hash or why no new commit was made, remaining uncommitted files with reasons,
   and the exact next action. Then stop; do not start the next stage merely
   because allowance remains.

Stage sizes are bounded by deliverables, not promised token/credit amounts. If a
stage cannot finish within the available allowance, save an **in progress**
handoff at the current checkpoint. Leave completed work intact, identify failing
or unrun checks precisely, and resume the same stage before moving forward. Do
not claim completion or postpone a required stage check just to fit an allowance.
Keep the prepared boundaries fixed: resume an interrupted stage instead of
automatically creating substages. Incomplete work stays explicitly **in progress**
and receives no stage-completion commit.

## Verification and completion rules

Every stage verifies its own changes with meaningful focused tests plus affected
type, lint, formatting, build or documentation checks. Changes to shared settings
may require broader checks even outside a milestone. Do not weaken checks or hide
empty suites to reduce usage. Run the full ordinary aggregate command
`./scripts/tooling.sh run pnpm check` at these integration milestones:

| Milestone | Stage | Required aggregate timing |
| --- | --- | --- |
| Application foundation | 4.4 | After configuration, factory, lifecycle and guarded process integration |
| Container integration | 4.8 | After runtime, development and automated image smoke integration |
| Final integration | 4.11 | Against the final implementation before full Step 4 handoff |

Use current earlier evidence when its relevant source, configuration, dependency,
image and environment inputs still match. Rerun affected checks after changed
inputs, failures or unresolved gaps; record why a prior result remains applicable.
Shared-target live phases remain sequential and uncached.

A **complete stage** has fulfilled its assigned scope and checks. An acceptance
criterion spanning later stages remains **partial**, even if that stage is
complete. The completion-owner table is the earliest planned gate, not evidence
by itself. No criterion is complete until all its required scenarios pass, and a
later relevant change can invalidate that evidence.

## Progress and order

Execute in this exact order. Each stage requires the preceding stages' completed
handoffs. Earlier stages can supply partial evidence for a criterion; only its
completion owner below can mark the whole criterion complete.

| Stage | Deliverable | Prompt | State | Handoff / evidence |
| --- | --- | --- | --- | --- |
| [4.1](#41--configuration-and-finite-builds) | Validated configuration and compiled workspace builds | [Copy 4.1](step-4-fastify-stage-prompts-2026-10-28.md#prompt-41--configuration-and-finite-builds) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-41--configuration-and-finite-builds) |
| [4.2](#42--http-factory-health-and-safe-logs) | Testable HTTP factory, health and safe logs | [Copy 4.2](step-4-fastify-stage-prompts-2026-10-28.md#prompt-42--http-factory-health-and-safe-logs) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-42--http-factory-health-and-safe-logs) |
| [4.3](#43--process-lifecycle-and-entry-point) | One DB owner, route extension and process entry | [Copy 4.3](step-4-fastify-stage-prompts-2026-10-28.md#prompt-43--process-lifecycle-and-entry-point) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-43--process-lifecycle-and-entry-point) |
| [4.4](#44--guarded-built-process-tests) | Real-DB process tests and basic signal proof | [Copy 4.4](step-4-fastify-stage-prompts-2026-10-28.md#prompt-44--guarded-built-process-tests) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-44--guarded-built-process-tests) |
| [4.5](#45--self-contained-runtime-image) | Portable API runtime image | [Copy 4.5](step-4-fastify-stage-prompts-2026-10-28.md#prompt-45--self-contained-runtime-image) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-45--self-contained-runtime-image) |
| [4.6](#46--canonical-compose-and-doppler-startup) | Profiled runtime service and secure native startup | [Copy 4.6](step-4-fastify-stage-prompts-2026-10-28.md#prompt-46--canonical-compose-and-doppler-startup) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-46--canonical-compose-and-doppler-startup) |
| [4.7](#47--development-image-and-reload) | Development service and API/DB reload | [Copy 4.7](step-4-fastify-stage-prompts-2026-10-28.md#prompt-47--development-image-and-reload) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-47--development-image-and-reload) |
| [4.8](#48--bounded-runtime-image-smoke) | Automated host HTTP/image/shutdown smoke | [Copy 4.8](step-4-fastify-stage-prompts-2026-10-28.md#prompt-48--bounded-runtime-image-smoke) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-48--bounded-runtime-image-smoke) |
| [4.9](#49--database-failure-recovery-and-test-isolation) | Real outage/recovery and shared-target sequencing | [Copy 4.9](step-4-fastify-stage-prompts-2026-10-28.md#prompt-49--database-failure-recovery-and-test-isolation) | Complete | [Cumulative evidence](../technical/step-4-verification-2026-10-28.md#stage-49--database-failure-recovery-and-test-isolation) |
| [4.10](#410--shutdown-through-all-project-paths) | Native project shutdown and cleanup proof | [Copy 4.10](step-4-fastify-stage-prompts-2026-10-28.md#prompt-410--shutdown-through-all-project-paths) | Complete | [Shutdown / isolation evidence](../technical/step-4-verification-2026-10-28.md#stage-410--shutdown-through-all-project-paths) |
| [4.11](#411--cache-verification-documentation-and-final-handoff) | Cache evidence, complete documentation and delivery handoff | [Copy 4.11](step-4-fastify-stage-prompts-2026-10-28.md#prompt-411--cache-verification-documentation-and-final-handoff) | Complete | [Final verification / delivered evidence](../technical/step-4-verification-2026-10-28.md#stage-411--cache-verification-documentation-and-final-handoff) |

### 4.1 — Configuration and finite builds

**Read:** parent plan's [inherited scope](step-4-fastify-plan-2026-10-28.md#inherited-approvals-and-assigned-scope),
[proposed decisions](step-4-fastify-plan-2026-10-28.md#proposed-decisions),
[configuration contract](step-4-fastify-plan-2026-10-28.md#application-and-process-contract)
and [build contract](step-4-fastify-plan-2026-10-28.md#build-development-and-turbo-contract).

**Implement:** approved API dependency pins/workspace link, `src/config.ts` with
configuration tests, API build configuration, clean finite API/DB builds and only
the Turbo dependencies needed by those actual commands. Include API scripts/test
configuration in strict no-emit checking. The configuration module is meaningful
initial build output; do not invent a dummy server to make the build succeed.

**Verify:** frozen dependency installation, valid/invalid HTTP and DB inputs,
secret-free validation failures, import without environment/network side effects,
compiled DB/schema runtime/type resolution and stale-file removal. Run the
available build/type/lint/format/unit checks inside existing tooling. No live DB
or Doppler fetch is needed for these checks.

**Stop with:** configuration/build code checked and usable by 4.2/4.3. Record
actual changed dependency/build-script policy, if any, and checks. No factory,
listener, process handlers, Docker API image or watcher is added here.

### 4.2 — HTTP factory, health and safe logs

**Read:** parent [application/HTTP contract](step-4-fastify-plan-2026-10-28.md#application-and-process-contract),
P4-03/P4-05/P4-06 and the relevant verification-matrix rows.

**Implement:** `src/app.ts` and focused factory tests. Build an unlistening Fastify
instance from explicit configuration, a narrow DB-check capability and closing
state. Add live/ready routes, safe framework/error/not-found responses, generated
request IDs and the allowlisted logger contract.

**Verify:** Fastify injection proves exact responses, no liveness DB call, fresh
readiness checks, failure/recovery/closing behavior, malformed/oversized requests
and omission of secret/request sentinels. Constructing the factory opens no pool
or listener and installs no process handlers. Tests close their own instances.

**Stop with:** AC4-03/AC4-10 evidence and injected health proof. Real HTTP, DB and
process evidence remains for later stages; no lifecycle owner is introduced here.

### 4.3 — Process lifecycle and entry point

**Read:** parent [application/process contract](step-4-fastify-plan-2026-10-28.md#application-and-process-contract),
P4-04 and API start task/build declarations.

**Implement:** `src/lifecycle.ts`, `src/server.ts`, meaningful lifecycle tests and
actual built start commands/tasks. One lifecycle owns one DB handle and app;
the registration callback receives that same handle before readiness/listen.
Install early signal handling, bounded startup and idempotent cleanup. Preserve
the configured startup/shutdown deadlines and failure exit behavior.

**Verify:** unit fixtures cover acquisition/registration/readiness/listen/close
failure, callback identity/order, repeated signals and startup cancellation.
Pool cleanup still runs after HTTP close failure. Strict checks and finite build
emit the real server entry. Real OS/DB behavior is proved in 4.4, not inferred
from mocks.

**Stop with:** AC4-04 evidence and a built process entry ready for the guarded
runner. No image or credential-launch operation is required in this stage.

### 4.4 — Guarded built-process tests

**Read:** parent [verification matrix](step-4-fastify-plan-2026-10-28.md#verification-matrix),
its test tuple/deadline contract, existing DB runner and launcher guards.

**Implement:** API process runner, dedicated Vitest configuration/integration
tests, API `test:process`, root `test:api` and the uncached finite-build dependency.
Extend the existing pre-fetch test-only guard for both command names. Implement
child/watchdog/output/port ownership before adding real process scenarios.

**Verify:** exact test target refusal before fetch/connection, normal direct
built-Node startup and real HTTP health, invalid config/credentials/unavailable
DB at startup, occupied-port failure, SIGINT/SIGTERM and no leaked children,
listeners or pool. Keep fixtures isolated from business tables and development
storage. Run only after the DB schema suite has released the shared target.

**Stop with:** AC4-05/AC4-08 evidence and the basic guarded process suite. Run
the application-foundation aggregate milestone. AC4-06 remains partial until
4.9 proves liveness during an outage; 4.10 closes shutdown edge cases. No Docker
API packaging or source watcher is added here.

### 4.5 — Self-contained runtime image

**Read:** parent [dedicated image contract](step-4-fastify-plan-2026-10-28.md#dedicated-api-image),
P4-11, compiled exports and package file/deploy boundaries.

**Implement:** root `.dockerignore`, API Dockerfile build/package/runtime stages
and API/DB package `files` needed by portable production deployment. Keep the
existing Node/pnpm pins and tooling Dockerfile. Development-specific image work
waits for 4.7. Canonical Compose service registration waits for 4.6.

**Verify:** build the runtime target from the repository root, inspect portable
runtime dependencies and compiled API/DB/schema/declaration files, and check that
workspace links stay inside the packaged tree. Build needs no DB/Doppler access
and excludes local environment/credential files. Confirm plain Node/nonroot
runtime configuration. Real authenticated container startup is required in 4.6.

**Stop with:** AC4-11 packaging evidence, image identity and exact build command.
Do not mark AC4-01 complete on successful image construction alone.

### 4.6 — Canonical Compose and Doppler startup

**Read:** parent [Compose/security contract](step-4-fastify-plan-2026-10-28.md#compose-saved-settings-and-credential-ownership),
native alias examples, approved setup/maintenance direction and existing launcher.

**Implement:** runtime `api` profile/service in canonical `compose.yaml`, narrow
`api-up` Doppler payload and only the native build/log/stop/status aliases now
usable. Preserve `.env.compose`, selected-key injection and stderr forwarding.
Declare API grace/health settings and remove project-wide timeout overrides that
would truncate that grace. Keep test-only database stop/reset bounds unchanged.
Add launcher/security tests where behavior exceeds native Compose guarantees.

**Verify:** default service selection excludes API; one model/six volume identities
are preserved; DB-free model/build/logs/stop require no secrets. Test config/key/
token/ambient-value refusal and diagnostic redaction. Start the built runtime via
matching Doppler credentials, probe exact health over loopback HTTP, then stop
it natively. Verify explicit port collision failure and saved settings from a
fresh environment. No migration runs. Use the test target for failure probes.

**Stop with:** AC4-01 evidence, partial AC4-13 evidence and minimal usable runtime
start/log/stop instructions. AC4-13 closes only after the development/smoke
credential paths also pass in 4.7–4.8. `api-dev` and `api-verify` operations/aliases
wait for their stages; full project drain/teardown proof waits for 4.10.

### 4.7 — Development image and reload

**Read:** parent [watch/task contract](step-4-fastify-plan-2026-10-28.md#build-development-and-turbo-contract)
and development image/volume/security sections.

**Implement:** Dockerfile development target, canonical `api-dev` profile/service,
API/DB/root watcher commands, persistent uncached Turbo tasks and the narrow
`api-dev` injection operation. Extend native build/stop aliases to the now-existing
development service. Reuse the existing five tooling volumes; compilers receive
no DB credentials.

**Verify:** finite DB build precedes watchers, API edits reload, compiled DB
implementation/schema edits reload consumers, error/correction and rapid edit
behavior is visible, and foreground interruption releases the running process.
Observe actual changed behavior rather than watcher output alone. Restore edited
fixtures byte for byte and stop watchers before finite clean builds.

**Stop with:** AC4-02 evidence and development/recovery instructions. Do not add
a second launcher or postpone watcher proof to the final integration stage.

### 4.8 — Bounded runtime-image smoke

**Read:** parent [local verification contract](step-4-fastify-plan-2026-10-28.md#local-verification-delivered-by-step-4)
and smoke/isolation rows in the verification matrix.

**Implement:** `scripts/verify-api.sh`, the exact-test-only `api-verify` injection
operation and its direct alias. Use the built runtime service for an owned one-off
probe; no separate Compose file/service or general lifecycle dispatcher.

**Verify:** exact live/ready HTTP bodies, image/container identity, deliberate
dynamic loopback port selection, explicit collision failure, SIGTERM exit and
owned-probe cleanup on success/failure/interruption. Exercise invalid credentials
without changing managed Doppler values. Verify bounded requests/overall deadline,
sanitized streams, repeated uncached execution and no source/dependency mounts.

**Stop with:** AC4-13/AC4-15 evidence and the working smoke command. Run the
container-integration aggregate milestone. Run after process tests release the
test target; do not stop unrelated development resources.

### 4.9 — Database failure, recovery and test isolation

**Read:** parent [shared-target sequencing and outage matrix](step-4-fastify-plan-2026-10-28.md#verification-matrix)
and Step 3B schema-suite reset behavior.

**Implement:** extend the process/live verification evidence with DB socket
failure/recovery and the controlled test-service outage/restart scenario. Reuse
existing target validation, DB termination techniques and native stop/start
commands. Record sequential ownership of schema, API, smoke and outage phases;
add no distributed lock or new test infrastructure.

**Verify:** while API remains running, live stays 200, ready becomes bounded 503,
and readiness recovers to 200 without API restart. An authenticated unmigrated
test DB still satisfies diagnostic readiness. Close each phase's clients/probes
before the next and leave development storage untouched. Reuse valid earlier
schema/process/smoke evidence where current; rerun only changed or uncertain paths.

**Stop with:** AC4-06/AC4-07/AC4-14 evidence and no ambiguous shared-target consumers.
If interrupted after stopping test PostgreSQL, record that state immediately;
restore it when possible, or leave the restoration command as the next action.

### 4.10 — Shutdown through all project paths

**Read:** parent process deadline, service-grace amendment and project shutdown/
isolation verification rows. Use a distinct disposable project for teardown.

**Implement/verify:** close the remaining shutdown cases: startup interruption,
repeated signals, pending/failed cleanup and the process watchdog. Then verify
API-only native stop, full-profile stop/down and guarded disposable volume teardown
with a bounded in-flight fixture request. Reuse the owned test harness; do not
ship a new diagnostic delay endpoint to make the test possible.

**Verify:** application cleanup respects its 10s bound, the API container gets
15s grace, no global override causes early SIGKILL, app/container exit is checked
separately from Compose client status, ordinary teardown preserves volumes and
confirmed disposable deletion affects only owned resources. Preserve a separate
project's resources and the owner's development data. Every running fixture has
cleanup ownership before the experiment starts.

**Stop with:** AC4-09/AC4-17 evidence, restored fixtures and an exact resource
inventory/cleanup result. Record each completed shutdown scenario independently
so an interrupted stage resumes the remaining cases without repeating them all.

### 4.11 — Cache verification, documentation and final handoff

**Read:** parent task graph, [successor handoff](step-4-fastify-plan-2026-10-28.md#verification-of-support-for-steps-5-and-6)
and the evidence from 4.1–4.10.

**Verify:** task discovery, finite build/check cache reuse, deleted-output
restoration, source invalidation and noncached live tasks against the completed
implementation. Run current ordinary aggregate checks. Reuse earlier live results
unless later changes invalidate them; targeted reruns must cite the change/gap
being checked. Resolve missing evidence against every parent acceptance criterion.

**Finish:** complete README/local-development instructions, the cumulative
verification record, approval/implemented-state documentation and guide progress.
Include exact image/start/log/stop/dev/test commands, bounds, isolation, known
limitations and Step 5/6 extension contracts. Update AGENTS.md when its actual
tooling guidance changes, following its applicable writing skill. Deliver the
existing Step 4 PR with staged results when authorized by the implementation task.

**Stop with:** AC4-12/AC4-16/AC4-18 evidence and all 18 criteria reconciled.
Step 4 is complete only when every required criterion has actual passing evidence.
Otherwise record the gap; do not declare success or begin foundation Step 5.

## Acceptance completion owners

The parent checklist is the single acceptance record. This mapping assigns the
stage that closes each criterion; it does not move verification out of the stage
where code is introduced or allow an earlier regression to be ignored.

| Completion stage | Parent acceptance IDs | Earlier evidence consumed |
| --- | --- | --- |
| 4.2 | AC4-03, AC4-10 | Configuration/build from 4.1 |
| 4.3 | AC4-04 | Factory from 4.2 |
| 4.4 | AC4-05, AC4-08 | Configuration/HTTP/lifecycle unit evidence from 4.1–4.3 |
| 4.5 | AC4-11 | Compiled source/build behavior from 4.1–4.4 |
| 4.6 | AC4-01 | Portable image from 4.5; inherited Step 3 security |
| 4.7 | AC4-02 | Image/Compose/build contracts from 4.1–4.6 |
| 4.8 | AC4-13, AC4-15 | Runtime/development/security from 4.5–4.7 |
| 4.9 | AC4-06, AC4-07, AC4-14 | Guarded process/unit/smoke results from 4.1–4.8 |
| 4.10 | AC4-09, AC4-17 | Signals, publication, security and smoke from 4.3–4.9 |
| 4.11 | AC4-12, AC4-16, AC4-18 | All preceding stage evidence and incremental setup docs |

## Durable checkpoint and resume prompt

At 4.1 create the already-planned cumulative
`docs/technical/step-4-verification-<implementation-date>.md`; keep using that same
file across later dates/sessions. Save the exact path in the progress table.
Each stage writes its initial in-progress section before implementation and
updates it after each meaningful verified result, before live/temporary-fixture
experiments, and at handoff. On resume, inspect the checkout and resource state
before trusting that record. Store no credentials or secret-bearing output.
Do not create an implementation evidence file during this planning update.

Use this handoff for a completed or interrupted stage:

```text
Stage: 4.N — title
State: not started / in progress / complete
Checkout, branch and base commit; current uncommitted diff:
Completion commit subject (complete stages only; resolve hash in Git history):
Approved choices used; remaining decisions:
Implemented files and behavior:
Checks: exact command, result, date, relevant image/source identity:
Failed/unrun checks and why:
Resources: project, nonsecret ports, owned running containers/watchers, cleanup:
Temporary edits/fixtures to restore:
Acceptance IDs: complete / partial / still pending, with evidence:
Next action: exact remaining action in this stage, or next assigned stage:
```

Use the matching [stage-specific prompt](step-4-fastify-stage-prompts-2026-10-28.md)
when assigning or resuming work. Each prompt identifies its stage and predecessor,
source sections, scope, checks, approvals and checkpoint/commit/stop rules. The
progress table supplies the cumulative evidence path; only stage 4.1 creates it
if missing. No prompt authorizes another stage or any pending technical choice.
