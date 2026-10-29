# Technical foundation implementation guide

**Purpose:** This is the working guide for every agent planning or implementing
the local technical foundation for [T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26).
Assign one step to one agent, deliver one PR, and hand off before the next step.

**Current status, 2026-10-28:** Workspace tooling, Turborepo checks, Step 1's
Docker tooling/Doppler verification and Step 2's development/test PostgreSQL are
implemented. Step 3A supplies Drizzle connection/tooling; Step 3B now supplies
the approved structural schema, migration chain and PostgreSQL constraint tests.
Step 4 is in progress: [stage 4.1 configuration and finite builds](step-4-verification-2026-10-28.md#stage-41--configuration-and-finite-builds)
is complete in `472e0a7`; stage 4.2 factory/HTTP/logging is complete in `29509a3`.
[Stage 4.3 lifecycle/entry/start tasks](step-4-verification-2026-10-28.md#stage-43--process-lifecycle-and-entry-point)
is complete with AC4-04 evidence. Stages 4.4–4.11,
Steps 5–6 and business writers remain pending. The
[Step 4 plan](../plans/step-4-fastify-plan-2026-10-28.md) incorporates the owner's
[approved post-Step-3 review amendments](technical-direction.md#step-4-review-decisions-after-step-3-2026-10-28).
P4-01 is retired; stage 4.1 choices are approved and implemented. Stage 4.2
P4-03/P4-05/P4-06 and stage 4.3's P4-04/process/start-task contract are approved
and implemented; remaining
implementation recommendations await approval.
The owner requested [11 sequential session stages](../plans/step-4-fastify-implementation-stages-2026-10-28.md)
with [individual assignment prompts](../plans/step-4-fastify-stage-prompts-2026-10-28.md),
ongoing checkpoints and local completion commits. Assign one internal stage at a
time and stop at its handoff. Focused checks apply per stage; full aggregate
milestones are 4.4, 4.8 and 4.11. These retain the Step 4 PR/acceptance boundary.
The owner approved the
[split Step 3 plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md)
with its separate schema gate. The owner approved both earlier concrete
plans and selected `storage-minis` naming. Step 1 PR #103 is merged. Step 2's
[approved plan](../plans/step-2-postgresql-plan-2026-10-24.md) and
[verification record](technical-direction.md#step-2-local-postgresql-planning-2026-10-24)
cover local database infrastructure only. Step 3B replay uses disposable test
storage; first development application is an explicit owner action.
Later implementation choices follow the approval process
in [AGENTS.md](../../AGENTS.md#owner-approval-before-decisions).

**Lifecycle follow-up, 2026-10-25:** The owner approved the
[application-container and lifecycle plan](../plans/docker-application-lifecycle-plan-2026-10-25.md).
Its first stage supplies host `docker:*` commands for existing infrastructure and
guarded project cleanup. API/frontend Compose services follow their runnable
application deliveries; this does not change Step 3B or later-step prerequisites.
The owner subsequently approved replacing the general wrapper with standard
Compose commands; use the [maintenance plan](../plans/standard-compose-maintenance-plan-2026-10-25.md)
for the implemented canonical configuration, direct package aliases and retained
Doppler/confirmed-deletion helpers. Current verification is recorded in
[technical direction](technical-direction.md#standard-infrastructure-tooling-direction-2026-10-25),
separately from the earlier lifecycle evidence. The owner then approved the
[one-time setup amendment](technical-direction.md#one-time-local-setup-2026-10-25):
saved nonsecret checkout settings, automatic Doppler target selection, setup/start
commands and a separate migration command. The subsequent 2026-10-25 schema
approval lifts the physical-schema gate; see the Step 3 progress row.

This guide owns the step sequence, planning instructions and completion criteria.
[Technical direction](technical-direction.md) owns approved technical outcomes;
the [foundation proposal](t06-foundation-proposal-2026-10-24.md) supplies candidate
versions, alternatives and detailed contracts. A recommendation in that proposal,
or its publication in a merged PR, is not implementation approval. Apply approved
decisions within their recorded scope without asking for the same approval again.

## Execution order and progress

The six assignments separate the Node tooling container from the original
five-step checklist. Guide step numbers are workflow references, not new issue,
requirement or F-decision IDs. Existing issue ownership and dependencies remain.

| Step | Agent assignment | Prerequisite delivery | Progress / evidence |
| --- | --- | --- | --- |
| 1 | Docker tooling environment | Existing workspace/tooling | [Implemented and verified](technical-direction.md#step-1-docker-tooling-2026-10-24). [Approved plan](../plans/step-1-tooling-plan-2026-10-24.md); [PR #103](https://github.com/WilliamPhilippe/storage-minis/pull/103), merged. |
| 2 | Development and test PostgreSQL | Step 1 | [Approved plan](../plans/step-2-postgresql-plan-2026-10-24.md); [implemented and verified](technical-direction.md#step-2-local-postgresql-planning-2026-10-24). [PR #104](https://github.com/WilliamPhilippe/storage-minis/pull/104), merged. |
| 3 | 3A: Drizzle tooling; 3B: base migration | Steps 1–2; schema approval for 3B | [Approved plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md). [3A implementation/evidence](technical-direction.md#step-3a-drizzle-implementation-2026-10-25); [PR #105](https://github.com/WilliamPhilippe/storage-minis/pull/105), merged 2026-10-25. 3B S01–S10 approved 2026-10-25; [structural implementation and writer deferrals](../database/step-3b-implementation-2026-10-25.md), merged in [PR #106](https://github.com/WilliamPhilippe/storage-minis/pull/106). [Final evidence](technical-direction.md#db-command-error-visibility-follow-up-2026-10-25): fresh replay, 27 unit and 30 PostgreSQL tests passing. First development application remains an explicit owner action. |
| 4 | Fastify server foundation | Steps 1–3 | [Revised plan and dependency review](../plans/step-4-fastify-plan-2026-10-28.md); eight review amendments approved 2026-10-28. [Sequential stages 4.1–4.11 and checkpoints](../plans/step-4-fastify-implementation-stages-2026-10-28.md) bound each implementation session. P4-01 retired. Stage 4.1 complete in `472e0a7` with [configuration/build evidence](step-4-verification-2026-10-28.md#stage-41--configuration-and-finite-builds); [Stage 4.2 factory/HTTP/logging](step-4-verification-2026-10-28.md#stage-42--http-factory-health-and-safe-logs) complete in `29509a3` with AC4-03/AC4-10; [stage 4.3 lifecycle/entry/start](step-4-verification-2026-10-28.md#stage-43--process-lifecycle-and-entry-point) complete with AC4-04 and offline lifecycle evidence. Real process/DB proof begins at 4.4; stages 4.4–4.11 remain pending. Remaining implementation recommendations await approval; full Step 4 acceptance is incomplete. |
| 5 | tRPC and Zod integration | Steps 1–4 | Not started |
| 6 | Repeatable verification and handoff | Steps 1–5 | Not started |

Begin the next assignment from the previous step's merged result, unless the
owner explicitly approves another branch arrangement. Reinspect the repository
and predecessor evidence rather than assuming this table proves readiness.
For Step 4's internal stages, the owner explicitly selected
`WilliamPhilippe/step-4-implementation-plan` for every stage. Each stage's agent
executes its local Conventional Commit after required checks pass; no merge or
new branch between internal stages is required.
Update the assigned row with its approval/evidence reference and PR when handing
off; describe partial completion and deferrals explicitly.

## Instructions for every agent's plan

### Read and inspect before proposing changes

Read [AGENTS.md](../../AGENTS.md), this guide's assigned step, the applicable
[technical decisions](technical-direction.md) and
[proposal sections](t06-foundation-proposal-2026-10-24.md). Read
[issue-tracker conventions](../agents/issue-tracker.md) before fetching the live
#26 issue, comments and applicable prerequisites. Inspect the predecessor PR,
current manifests, lockfile, scripts, environment examples and Turbo graph.
Use files and actual command results to establish implemented behavior; reconcile
discrepancies with approved decisions rather than treating setup notes as evidence.

For persistence planning, also read the [database design guide](../database/design.md)
and [approved update logs](../requirement-updates/README.md), following their current
links to requirements and entity constraints. For protected access or operations,
read the applicable T02/T04 issue before planning dependent behavior. Use the
existing delivery owner rather than creating duplicate tickets.

Research against official documentation, published package/image metadata and
upstream source. Follow version-sensitive claims to sources matching the proposed
pins. Reuse verified proposal research where still applicable, and investigate
the assigned step's unresolved questions. Do not install a tool just to research
it; identify any required image pull, build or external-state change in the plan.

### Present one concrete plan for the assigned step

The plan must contain:

1. **Starting state:** What exists, which preceding outputs were verified, and
   which owner approvals already cover the work. Identify any real blocker.
2. **Scope:** The assigned result, affected files/packages and exclusions. Map
   applicable F decisions to the exact subset needed in this step; approval of
   one package or command does not approve every later use of a shared F item.
3. **Decisions:** For each new or changed choice, state a concrete recommendation,
   rationale, alternatives, tradeoffs and primary sources. Include exact new
   versions/image pins, commands, configuration and resource ownership where
   relevant. Separate inherited approvals from pending choices.
4. **Implementation order:** Small verifiable changes, the contracts consumed
   from predecessors, and any contract additions supplied to successors. Describe
   package dependencies, environment handling and Turbo changes with the real
   commands they accompany.
5. **Verification:** Map every completion criterion below to a command or test and
   its expected result. Cover the relevant failure cases, external resources,
   time bounds and cleanup. Identify evidence deferred by business prerequisites.
6. **Handoff:** Documentation and approval records to update, remaining limitations
   and the information needed by the next agent.

Present the plan for approval before adopting pending choices. If the owner has
already approved the exact scope, proceed within it. Raise a new question only
for an uncovered choice, a source conflict or an unmet prerequisite. Record the
date, scope and rationale of approved outcomes in technical direction.

### Keep each implementation independently reviewable

Use the approved [Doppler direction](technical-direction.md#environment-configuration--doppler-2026-10-24)
when planning configuration. The copied-`.env`/native-loader proposal is
superseded. Distinguish injection into host Compose from injection into container
processes. Keep the variable inventory secret-free; identify the actual Doppler
project/config and credential bootstrap without inventing account details.

Prefer Docker images for new tools and services. Preserve existing host tools;
explain a necessary host installation and obtain approval before attempting it.
Keep host Compose orchestration separate from Node commands inside the tooling
container. Follow the proposal's distinction between host-mapped ports and
container service addresses.

Implement only the assigned scope and the tests needed to prove it. Each agent
owns verification of its change; Step 6 consolidates the workflow rather than
postponing all tests until the end. Preserve strict checks and empty-suite
behavior, and label runner-loading checks separately from application evidence.
Add Turbo tasks, inputs, outputs, environment and dependency declarations only
when their real commands exist. Live-state checks and mutations execute uncached.

Every handoff includes one PR with actual verification results and limitations,
updated setup instructions, approval/evidence pointers, and the progress row
above. Record newly approved decisions in technical direction; keep candidate
choices distinct in the proposal. Stop at the assigned step's handoff. A PR
does not authorize merging, the next step or closing T06.

## Step 1 — Docker tooling environment

### Why this step is necessary

Later agents need one repeatable place to install dependencies and run Node
commands without adding development tools to the host. Separate Linux dependency
storage also prevents container commands from consuming macOS native binaries.

### Expected result and completion criteria

A documented tooling image/service can run the existing workspace independently
of PostgreSQL or application source. Completion requires evidence that:

- The container uses the approved Node.js/pnpm pins, and frozen installation plus
  workspace discovery succeed inside it.
- Existing typechecks, lint and formatting checks pass there. If application
  tests are still absent, their ordinary failure remains visible and documented.
- Root/API/DB dependencies and container caches are isolated from host copies
  and from other workspaces; existing host files are preserved.
- Normal workspace commands run as the intended unprivileged user, can write
  required generated files, and preserve those files after the container exits.
- Another person can build, install, run a check and stop the tooling environment
  using the documented commands, with no database prerequisite.
- The approved Doppler launch path supplies a harmless verification value to its
  intended consumers without logging secrets. Routine dependency installation
  and offline checks remain usable without application secrets. Missing Doppler
  setup/access is identified as a prerequisite or explicitly approved deferral.

### Research and planning focus

Read the proposal's [container execution recommendation](t06-foundation-proposal-2026-10-24.md#container-execution-recommendation-f13)
and the approved workspace/tooling decisions. Concentrate on:

- Official image architecture support, exact pins and pnpm provisioning inside
  the image; verify compatibility with strict package engines.
- Doppler CLI/image pins, container authentication and credential bootstrap,
  the host-Compose versus container-runtime injection boundary, and encrypted
  fallback behavior. Research these before proposing a host CLI installation.
- Bind mounts versus named volumes, `nocopy`, volume initialization/ownership,
  pnpm storage and isolation of native dependencies and Turbo cache entries.
- One-off versus persistent Compose execution, exit/signal behavior and how
  source/build outputs remain accessible for review. Check bind-mount watch
  behavior relevant to later API development without adding application source.
- Host editor access to container-only dependencies: describe the limitation and
  any required later decision rather than installing editor tools implicitly.

The agent's plan must specify the proposed Dockerfile/service, variable inventory,
Doppler launch/authentication boundary, first-install/volume initialization
sequence, commands and cleanup. Specify how checkout settings and secret-bearing
runtime commands receive values, including precedence and fallback. Keep
tooling-only commands usable before DB credentials or API variables exist.
Address the Linux container's view of this worktree and the actual Docker
executable available in the agent environment.

**Scope boundary:** Establish the runner with existing package dependencies.
PostgreSQL and new application framework/driver dependencies belong to their
later steps. Do not replace the host Node version manager or shell setup.

### How this helps the other steps

Step 2 gains a consistent environment for network/database checks. Steps 3–5
reuse it for pnpm changes, CLI execution, compilation and tests. Step 6 can verify
the complete workflow from a clean container dependency installation.

## Step 2 — Development and test PostgreSQL

### Why this step is necessary

The persistence layer needs a real PostgreSQL instance, and tests need separate
disposable storage. Clear workspace naming, ports and lifecycle commands prevent
accidental data sharing and distinguish a running container from a ready database.

### Expected result and completion criteria

Development and test services are independently reachable through the documented
Docker setup. Completion requires evidence that:

- The selected image runs on the local architecture and reaches readiness within
  a bounded wait. An authenticated SQL query succeeds; container startup alone
  is insufficient evidence.
- Development storage survives ordinary stop/start. Test storage is disposable
  and separate; test cleanup preserves development data.
- Two workspace projects with different host ports do not share database data.
  An occupied port fails clearly rather than selecting another database silently.
- Doppler supplies DB values to the correct consumers, keeping development and
  test targets separate. The variable inventory contains no working secret.
  Documentation explains
  container addresses, host addresses, logs, restart and initialization behavior.
- Destructive reset is a separate, clearly documented action with its affected
  volumes identified; ordinary commands preserve development storage.

### Research and planning focus

Read the proposal's [PostgreSQL step](t06-foundation-proposal-2026-10-24.md#3-step-1--local-postgresql-through-compose)
and inherit Step 1's service/volume conventions. Concentrate on:

- Official PostgreSQL image pins, version-specific data directories, initialization
  variables, password authentication and bundled SQL/readiness utilities.
- Compose project/network/volume scope, loopback publishing, healthchecks, bounded
  readiness, test tmpfs lifecycle and collisions between workspaces.
- Doppler-to-Compose injection and precedence, credential changes on existing
  volumes, and which values a tooling container needs to reach each service.
  Fetching values only after Node starts cannot initialize PostgreSQL.
- The difference between local initialization privileges and future production
  application/migration roles, which remain subject to T04.

The plan must specify service definitions, development/test storage ownership,
variable/config mapping, connection examples and lifecycle/failure checks,
including missing/wrong Doppler config and stale local `.env` values that must
not silently supply credentials. Plan a
disposable infrastructure-only persistence probe with cleanup; business tables
are unnecessary. Use SQL utilities from the image instead of installing a host
PostgreSQL client.

**Scope boundary:** Supply databases and connection contracts. Business schema,
data import, production hosting and backup policy remain with their existing
owners. Drizzle implementation begins in Step 3.

### How this helps the other steps

Step 3 receives stable development/test connection targets. Step 4 can distinguish
process health from DB readiness. Steps 5–6 can exercise the actual adapter and
test environment without using operational storage as a disposable fixture.

## Step 3 — Drizzle connection and migration tooling

### Why this step is necessary

The API needs a typed DB dependency with explicit ownership and cleanup. Migration
tooling needs a reviewed, repeatable workflow before business schema is delivered;
tool availability and schema correctness are separate milestones.

### Expected result and completion criteria

`packages/db` supplies the approved connection/configuration boundary and commands.
Completion requires evidence that:

- The chosen Drizzle/driver/tooling versions install inside the tooling container
  and pass strict checking without weakening the approved compiler/lint rules.
- A real authenticated query succeeds through the DB package. Invalid config,
  wrong credentials and unavailable DBs produce bounded, sanitized failures.
- Importing the package starts no connection. Command processes release clients
  and close their owned pools on success and failure.
- Compiled runtime/type exports resolve from a consumer using Node's normal ESM
  resolution; build/typecheck ordering reflects the actual dependency.
- CLI configuration participates in strict checks. Generation and application
  are separate uncached commands with reviewed source artifacts as their output.
- While schema approval is pending, migration commands refuse clearly before
  modifying external state; no dummy table or empty migration disguises the gap.

### Research and planning focus

Read the proposal's [DB/migration step](t06-foundation-proposal-2026-10-24.md#4-step-2--db-package-and-migration-workflow),
[module choices](t06-foundation-proposal-2026-10-24.md#5-step-3--modules-development-and-fastify),
the database design guide and later approved logs. Concentrate on:

- Stable-version APIs and declaration compatibility for the selected PostgreSQL
  adapter, pool behavior, timeouts, cleanup and error handling.
- Code-first generation versus direct push; SQL/snapshot/journal review,
  explicit application, target validation and failure behavior.
- Compiled package exports under ESM/NodeNext, dependency ownership and how
  consumers obtain current declarations without importing package source.
- Validation of injected environment at explicit entry points and reuse of
  Step 2's Doppler mapping/container addresses. Builds and imports remain
  independent of live DB or Doppler access; `.env` autoload is superseded.

The plan must define the public factory/types, resource owner, precise config
contract, Doppler injection boundary for DB commands, compiled output, CLI paths
and guarded migration behavior. Add only the
dependencies used by this step. List the remaining T01/T03 decisions before any
business migration; the conceptual DBML is not executable migration input.

**Scope boundary:** Deliver connection and migration-tool infrastructure. First
real schema generation/application needs its separate prerequisite approvals.
When that gate is satisfied, demonstrate fresh replay and repeat application;
until then, record those checks as deferred rather than passed.

### How this helps the other steps

Step 4 receives an injected, compiled DB dependency and reliable readiness check.
Step 5 can build request context without creating a second pool. Step 6 can test
resource lifecycle and database targeting through the real package, while later
schema delivery inherits the reviewed migration workflow.

## Step 4 — Fastify server foundation

**Execution:** copy one [stage-specific prompt](../plans/step-4-fastify-stage-prompts-2026-10-28.md)
from the [sequential implementation guide](../plans/step-4-fastify-implementation-stages-2026-10-28.md)
per session. Keep its fixed boundary, obtain uncovered approvals before its work,
and checkpoint before implementation and throughout the session. After required
checks pass, save evidence and a local Conventional Commit, then stop. Incomplete
work resumes the same stage. Run focused checks per stage and full ordinary
aggregate checks at 4.4, 4.8 and 4.11; live checks remain separate. The completion
criteria below cover the full Step 4 delivery across all stages. Stage completion
does not close acceptance criteria still awaiting later evidence.

### Why this step is necessary

A testable API process connects configuration, the DB dependency and HTTP
lifecycle. Separate construction and startup make failures, health and shutdown
testable without giving every test control of global process resources.

### Expected result and completion criteria

`apps/api` supplies an application factory, process entry, a dedicated API Docker
image and working development/build/start/local-verification commands. The
owner explicitly required the API image and local verification on 2026-10-28;
the [Step 4 plan](../plans/step-4-fastify-plan-2026-10-28.md) contains the proposed
implementation and its [acceptance checklist](../plans/step-4-fastify-plan-2026-10-28.md#step-4-acceptance-criteria).
Completion requires evidence that:

- Fastify, compiled API/DB code and runtime dependencies are contained in the
  repository's API runtime image. Plain Node starts it without a development
  runner, source/dependency mounts or installation at startup.
- Liveness and readiness have distinct documented responses. Database outage and
  recovery affect readiness as specified, with bounded failures and safe logs.
- Configuration errors, invalid credentials and occupied ports fail cleanly;
  SIGINT/SIGTERM drain the server and close the owned pool without hanging.
- Meaningful factory/configuration/lifecycle tests run, and source changes in the
  DB package trigger the required rebuild and API reload during development.
- The API workspace dependency, emitted files and Turbo ordering/outputs are
  explicit; persistent tasks are outside finite task prerequisites.
- Local setup documents image build/start, browser/curl URLs with exact expected
  responses, logs and stop commands. A bounded automated smoke command verifies
  the actual API image's health/shutdown and cleans up its owned container on
  success and failure; this delivery does not wait for Step 6.
- Route registration before listen can receive the already-owned DB instance,
  giving Step 5 a tested extension point without another pool or process owner.

### Research and planning focus

Read the proposal's [Fastify/module step](t06-foundation-proposal-2026-10-24.md#5-step-3--modules-development-and-fastify)
and the DB handoff. Concentrate on:

- Fastify construction, injection testing, health routes, error/log serialization,
  startup behavior and graceful close hooks for the selected release.
- TypeScript no-emit checks versus build configurations, `.js` relative imports,
  declarations, package resolution and stale generated files.
- Watch behavior across compiled workspace dependencies, Docker bind mounts,
  signal forwarding and the distinction between container bind address and host
  loopback publication.
- Dedicated API Dockerfile/build context, development versus self-contained
  runtime targets, production dependency packaging and image verification that
  does not rely on tooling volumes. New concrete packaging choices require
  approval within the owner-required API-image scope.
- Doppler injection before startup, validated environment and redaction,
  signal forwarding through any Doppler wrapper, and pool ownership when startup
  fails partway through resource creation. Specify restart behavior when Doppler
  values change; do not assume a running process updates automatically.

The plan must define factory/entry responsibilities, health response contracts,
timeouts, cleanup ordering, commands and build artifacts. Map each failure case
to a unit, process or real-DB check. Extend environment and Turbo declarations
only for the code introduced here.

**Scope boundary:** This is a diagnostic server. Business routes, Firebase
bootstrap and protected procedures await their own decisions; authentication
bypasses are not a scaffold prerequisite. tRPC integration belongs to Step 5.

### How this helps the other steps

| Consumer | Step 4 handoff | Work left to the consumer |
| --- | --- | --- |
| Step 5 | Testable Fastify host, route-registration extension using the owned DB, safe HTTP boundaries and the API image/build path. | Add tRPC adapter, diagnostic schemas/context, adapter-specific errors and type-only router export; rebuild the same application image. |
| Step 6 | Working local image smoke, exact health/exit contracts, isolated process-test command, task graph and setup/log/stop instructions. | Extend verification with tRPC success/failure, clean-checkout reproduction and final cache/integration evidence. |

The [detailed successor coverage](../plans/step-4-fastify-plan-2026-10-28.md#verification-of-support-for-steps-5-and-6)
maps these outputs to both steps' completion criteria. Step 4 owns proof of its
image, local health verification and resource lifecycle. Later steps extend
those deliveries. Future authorization/workflow modules can reuse the factory
without taking over process startup.

## Step 5 — tRPC and Zod integration

### Why this step is necessary

The selected API stack needs a verified transport and runtime-validation path.
A bounded diagnostic procedure proves those interfaces before domain contracts
or application authorization are ready.

### Expected result and completion criteria

The Fastify adapter exposes the agreed diagnostic router and typed contract.
Completion requires evidence that:

- A valid request succeeds through the actual HTTP adapter, with both input and
  output validation exercised. Invalid shape/value and unknown-procedure cases
  return the specified safe HTTP/tRPC errors.
- Unexpected/output-validation failures omit stacks, secret values and raw causes;
  malformed/oversized requests follow documented behavior.
- Context reuses the injected DB dependency and request information without
  manufacturing a principal, Organization or application permission.
- The future client can consume a type-only router export; a temporary consumer's
  emitted JavaScript introduces no server initialization or DB runtime import.
- The endpoints remain diagnostic and table-free. Adapter tests establish more
  than a successful direct router call.

### Research and planning focus

Read the proposal's [tRPC/Zod step](t06-foundation-proposal-2026-10-24.md#7-step-4--trpc-with-zod)
and inherit Step 4's lifecycle/error boundaries. Concentrate on:

- Compatibility of the exact Fastify adapter, tRPC, Zod and TypeScript releases;
  HTTP envelopes, validation, batching and error formatting.
- Router/context construction, explicit input/output schemas and where eventual
  verified identity/Membership enforcement must enter under T02.
- Type-only package exports and the distinction between declaration dependencies
  and executable browser imports.
- Separation of server Doppler values from public responses/types and future
  browser configuration. Diagnostic output must not expose environment contents.
- The boundary between JSON diagnostic values and T03's future monetary/time
  contracts; additional serializers and browser/CORS policy remain decisions.

The plan must specify the route/procedure, schema bounds, context contract,
error/serialization behavior and type export. List accepted/rejected HTTP
examples and how the client type contract will be verified. Read T02 if proposing
anything beyond the diagnostic context; do not silently expand this step into
authentication or business API conventions.

**Scope boundary:** Frontend scaffolding, protected procedures, bootstrap,
pagination, idempotency policy and production origin policy are separate work.

### How this helps the other steps

Step 6 receives a concrete HTTP success/failure contract for end-to-end smoke
checks. Future frontend work can consume API types, and future protected routers
can add approved authorization to a proven adapter rather than inventing a second
transport or resource lifecycle.

## Step 6 — Repeatable verification and handoff

### Why this step is necessary

Individually working components must form a reproducible setup. This step proves
their interaction and documents what the scaffold establishes, including its
remaining business and operational acceptance gaps.

### Expected result and completion criteria

A new checkout can follow the README from approved image build/dependency install
to a verified diagnostic API. Completion requires evidence that:

- A built-process smoke harness starts the API, bounds readiness waiting, checks
  health and valid/invalid tRPC requests, signals shutdown and cleans up its child
  on both success and failure. Occupied-port behavior does not probe an unrelated
  service accidentally.
- Dedicated real-PostgreSQL tests target only approved disposable storage, reject
  development/wrong targets and release resources after failures. They remain
  separate from DB-free checks and execute uncached.
- Current meaningful unit tests pass under normal strict execution. A deliberately
  empty suite still fails; bootstrap flags are not the aggregate-test policy.
- Turbo discovery/dependencies are correct, unchanged cacheable work reuses its
  results, deleting build output restores declared artifacts, and DB source edits
  invalidate affected consumers. Live-state commands execute again and child
  failures propagate nonzero exits.
- Setup, logs, failure diagnosis, shutdown, test isolation and reset instructions
  match actual commands. Documentation states precisely which acceptance results
  remain deferred.

### Research and planning focus

Read the proposal's [verification step](t06-foundation-proposal-2026-10-24.md#8-step-5--verification-and-documentation),
[Turbo contract](t06-foundation-proposal-2026-10-24.md#9-turbo-task-graph-and-cache-contract)
and all five predecessor handoffs. Concentrate on:

- Gaps between existing component tests and a real built process: readiness
  deadlines, child ownership, logs, process signals and cleanup.
- Vitest project discovery, Doppler test-config/database targeting, setup/isolation
  and cleanup; unit tests use explicit fixtures without contacting Doppler or a DB.
- Turbo hashes, injection timing, strict environment filtering, artifact
  restoration and external state that source hashes cannot cover. Cached tasks
  must not fetch untracked configuration after their hash is computed.
- A clean-install reproduction and the distinction between operational bootstrap
  evidence and schema/application integrity evidence.

The plan must provide a verification matrix of scenario, command/test, expected
outcome, resources and cleanup. Include missing/invalid Doppler credentials, wrong
config/test target, approved offline/fallback behavior, precedence and redaction.
Identify which checks already exist, which need
automation and which are gated; avoid merely rerunning every predecessor check
without a specific integration concern. Include a final evidence and limitations
record for the next business-foundation work.

**Scope boundary:** Automate and verify the approved scaffold. Real migration
replay and representative business races require approved schema/operations;
label them deferred if unavailable. Synthetic domain tables do not prove T06's
business acceptance. Frontend/Playwright, CI and deployment are not added
incidentally by this verification assignment.

### How this helps the other steps

It gives subsequent feature agents a repeatable starting workflow, failure
signals and usable evidence rather than a collection of manual setup notes.
Business schema, authorization and operational delivery can then extend the
existing checks with their own approved acceptance cases.

## Gates beyond these six assignments

These assignments are partial T06 bootstrap, with these existing gates intact:

| Before proceeding to | Required decisions / existing owners |
| --- | --- |
| Business schema migrations | [T01 / #21](https://github.com/WilliamPhilippe/storage-minis/issues/21) executable keys, constraints, transitions and transaction design; applicable [T03 / #24](https://github.com/WilliamPhilippe/storage-minis/issues/24) numeric/overflow/time/input contracts; later approved schema logs. |
| Protected procedures or administrator bootstrap | [T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22) verified identity, configured-owner bootstrap, Membership/Organization access and global Product-edit permission enforcement. |
| Representative persistence operations | Applicable T01/T03 and business-policy decisions, followed by actual rollback, scope, reconciliation and concurrent-session evidence for the approved operation. |
| Deployment and recovery acceptance | [T04 / #23](https://github.com/WilliamPhilippe/storage-minis/issues/23) Doppler production access/injection/rotation/fallback policy, releases/migrations, privileges, daily backups/restore and operational targets. |
| Full T06 completion | The live issue's original dependencies and acceptance outputs, including real global Product reuse/private-data rejection, allocation/commitment integrity and deletion-versus-funding or settlement-source race evidence, plus remaining application/check delivery. |

Read the [proposal's prerequisite analysis](t06-foundation-proposal-2026-10-24.md#10-prerequisite-gates-and-full-acceptance)
for the concrete DBML/enforcement gaps. Keep T06's #21/#22/#23 dependencies and
T03's #21 dependency unchanged. Decision research can proceed under those owners
while the local bootstrap is developed within explicitly approved partial scope.
Successful health queries and HTTP validation do not establish business atomicity,
Organization isolation, authorization or concurrency correctness.

## Prompt for assigning an agent

For Step 4 implementation, use the
[individual stage prompts](../plans/step-4-fastify-stage-prompts-2026-10-28.md),
selecting only the assigned stage such as `4.1`. Each is also its resume prompt;
the progress table supplies the existing evidence path. The general prompt below
applies to whole-step planning; its implementation clause must not expand a Step 4 stage
assignment into the complete plan.

```text
Plan Step <number> of docs/technical-foundation-implementation-guide.md.
Read AGENTS.md, the assigned step, its linked decisions/proposal sections,
the relevant live issues/comments and the predecessor's merged PR/evidence.

Inspect the current implementation and research the step's unresolved choices
against primary sources. Present the concrete plan required by the guide,
including scope, approvals, alternatives, implementation order, verification
and handoff. Use existing approvals within their scope; obtain approval for
uncovered choices before implementing them.

Once approved, implement only this step, verify its completion criteria,
record decisions/evidence, update the guide's progress row and setup docs,
and open one PR. Leave later steps and existing issue dependencies intact.
```
