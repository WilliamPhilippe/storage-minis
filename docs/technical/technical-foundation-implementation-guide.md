# Technical foundation implementation guide

**Purpose:** This is the working guide for every agent planning or implementing
the local technical foundation for [T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26).
Assign one step to one agent, deliver one PR, and hand off before the next step.

**Current status, 2026-11-01:** Steps 1–4 are implemented, and the
[foundation restructure](technical-direction.md#foundation-restructure-2026-10-31)
replaced their tooling container and Doppler launchers with host Node, standard
Compose, committed local values, owner/app database roles, regenerated migrations
and a parity stack ([PR #110](https://github.com/WilliamPhilippe/storage-minis/pull/110)).
The [API composition and error-log rework](technical-direction.md#api-composition-and-error-log-rework-2026-11-01)
(2026-11-01, [PR #112](https://github.com/WilliamPhilippe/storage-minis/pull/112))
made `buildApp` the single plugin composition root and made failure logs
diagnosable. Steps 5–6 are re-planned against this foundation. Full T06/business/production
acceptance remains pending. Frontend work follows the
[frontend foundation decisions](frontend-foundation-proposal-2026-11-01.md)
(2026-11-01): its four delivery steps sit outside this guide's six, and each
needs its own plan.

Use [README setup and commands](../../README.md) and the
[local development reference](local-development.md) for current operation.
Read the [foundation restructure record](technical-direction.md#foundation-restructure-2026-10-31)
before changing local commands, Compose files or configuration. Migrations apply
only on explicit request; test setup replays them on the disposable test database.

This guide owns the remaining step sequence, planning instructions and completion
criteria. [Technical direction](technical-direction.md) owns approved outcomes;
the [foundation proposal](t06-foundation-proposal-2026-10-24.md) supplies candidate
versions, alternatives and detailed contracts. A recommendation in that proposal
is not implementation approval. Reuse recorded approvals within their scope.

## Execution order and progress

The six assignments separated the Node tooling container (removed on 2026-10-31)
from the original five-step checklist. Guide step numbers are workflow references, not new issue,
requirement or F-decision IDs. Existing issue ownership and dependencies remain.

| Step | Agent assignment | Prerequisite delivery | Progress / evidence |
| --- | --- | --- | --- |
| 1 | Docker tooling environment | Existing workspace/tooling | [Implemented and verified](technical-direction.md#step-1-docker-tooling-2026-10-24); [PR #103](https://github.com/WilliamPhilippe/storage-minis/pull/103), merged. |
| 2 | Development and test PostgreSQL | Step 1 | [Implemented and verified](technical-direction.md#step-2-local-postgresql-planning-2026-10-24); [PR #104](https://github.com/WilliamPhilippe/storage-minis/pull/104), merged. |
| 3 | 3A: Drizzle tooling; 3B: base migration | Steps 1–2; schema approval for 3B | [3A implementation](technical-direction.md#step-3a-drizzle-implementation-2026-10-25), [PR #105](https://github.com/WilliamPhilippe/storage-minis/pull/105), merged. [Approved structural implementation and writer deferrals](../database/step-3b-implementation-2026-10-25.md), [PR #106](https://github.com/WilliamPhilippe/storage-minis/pull/106), merged. [Recorded results](technical-direction.md#db-command-error-visibility-follow-up-2026-10-25): 27 unit and 30 PostgreSQL tests. First development application was an explicit owner action until the 2026-10-31 restructure; its approved clean-slate check (V1) makes `pnpm db:migrate` part of local setup. |
| 4 | Fastify server foundation | Steps 1–3 | Complete: all eighteen criteria passed with [final verification/handoff](technical-direction.md#step-411-final-verification-and-handoff-2026-10-29) and authorized evidence on [PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107). Step 6 and full T06 remain pending. |
| — | [Foundation restructure](foundation-restructure-plan-2026-10-31.md) (not a numbered step) | Steps 1–4 | Implemented in [PR #110](https://github.com/WilliamPhilippe/storage-minis/pull/110), stacked on #109; per-group evidence, V1–V7 and superseded-versus-re-proven Step 1–4 evidence are in the PR and the [technical direction record](technical-direction.md#foundation-restructure-2026-10-31). |
| — | [API composition and error-log rework](technical-direction.md#api-composition-and-error-log-rework-2026-11-01) (not a numbered step) | Steps 1–4, restructure | Implemented in [PR #112](https://github.com/WilliamPhilippe/storage-minis/pull/112): plugin composition root, `registerRoutes` removed, allowlisted error logs and JSON lifecycle lines; evidence in the record and the PR. |
| 5 | tRPC and Zod integration | Steps 1–4, restructure, API rework | Implemented in [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114) from the [approved plan](step-5-trpc-plan-2026-11-01.md) (P5-01–P5-10) and six implementation-time approvals: `/trpc` adapter, `diagnostics.echo`, one error envelope, `procedure` log field and the types-only `AppRouter` export. Outcome and evidence are in the [approval record](technical-direction.md#step-5-trpc-and-zod-plan-approval-2026-11-01); the [Step 6 handoff](#handoff-to-step-6) lists what Step 6 receives. |
| 6 | Repeatable verification and handoff | Steps 1–5 | Not started; re-plan against the restructured foundation and the Step 5 handoff. |

Begin the next assignment from the previous step's merged result, unless the
owner explicitly approves another branch arrangement. Reinspect the repository
and predecessor evidence rather than assuming this table proves readiness.
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

Plan configuration with the [restructure's configuration model](local-development.md#configuration):
committed local development/test values, real environment values taking
precedence, Compose `${VAR:?}` for production secrets, and Doppler `prd` on the
VPS only. A real development secret adds `doppler.yaml` and `doppler run`, which
needs its own approval. Keep production values out of committed files, images and
test/cache artifacts.

Node.js and pnpm run on the host; PostgreSQL and the production images run in
Docker. Explain any new host installation and obtain approval before attempting
it. Keep host-side URLs (`127.0.0.1:5433/5434`) distinct from the in-network
URLs that `compose.yaml` builds.

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

**State: complete 2026-10-24; superseded 2026-10-31.** The
[foundation restructure](technical-direction.md#foundation-restructure-2026-10-31)
runs Node.js and pnpm on the host and removed this tooling image. The text below
is the historical assignment.

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

**State: complete 2026-10-24; partly superseded 2026-10-31.** The two
services remain; the restructure replaced superuser-only access, Doppler-held
passwords and the Bash launcher with owner/app roles, committed local values and
`db:*` package scripts. The text below is the historical assignment.

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

**State: complete 2026-10-25; partly superseded 2026-10-31.** The factory,
compiled exports and generate/review/apply workflow remain. The restructure
replaced the fixed target tuple with `DATABASE_URL`, the command supervisors
with `drizzle-kit generate` and `src/migrate.ts`, and regenerated the
migration baseline. The text below is the historical assignment.

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

**State: complete, 2026-10-29.** The
[approval and verification record](technical-direction.md#step-411-final-verification-and-handoff-2026-10-29)
and [PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107) record the
completed diagnostic foundation. The completed stage assignments and prompts
are no longer execution instructions.

### Delivered contracts

- `buildApp` is the single composition root (2026-11-01 rework): it constructs
  Fastify from explicit configuration and registers every route group as a
  plugin, starting with the health routes (`apps/api/src/health.ts`). It receives
  `Pick<Database, "db" | "check">` and closing state, and acquires no pool,
  listener or process handlers. Production and `app.inject()` tests build the same app.
- `startLifecycle` owns one app and one full `Database`; plugins load during its
  `app.ready()` phase, before the database check and listen. Future routes reuse
  that database instead of creating a second pool. (The former
  `registerRoutes(app, database)` callback was removed on 2026-11-01.)
- `/health/live` returns 200 with `{"status":"ok"}`. `/health/ready` returns
  200 with `{"status":"ready"}` or 503 with `{"status":"unavailable"}`.
  Readiness checks authenticated DB identity, including an unmigrated database;
  startup never migrates. Outage/recovery preserves the API process.
- Fixed HTTP error bodies omit every detail. Failure logs (2026-11-01) carry an
  allowlisted `err` (type, code such as SQLSTATE, stack frames, causes to depth 3),
  with messages only when `NODE_ENV=development`; 4xx log at info, 5xx at error.
  Lifecycle events are JSON lines on stdout, independent of `LOG_LEVEL`. Bodies are
  limited to 16 KiB and receive time to 10s; client request IDs are disabled.
- Startup has a 17s watchdog. Repeated SIGINT/SIGTERM share a 10s cleanup bound:
  drain HTTP, then close DB. Successful signal exits are 130/143; failures use 1.
  Compose gives the API service 15s grace.
- Plain Node starts the compiled nonroot runtime image without source mounts or
  startup installation. Since the restructure, `pnpm dev` on the host reloads API
  and compiled DB changes. Stop watchers before clean finite builds; live checks
  remain uncached.
- Since the restructure, the `pnpm test:stack` parity suite asserts exact health
  responses, a nonroot API without mounts, `migrate` before `api` and SIGTERM 143,
  then removes the stack. The schema and process suites share the test database
  and run one at a time.

Use the [daily development loop](../../README.md#daily-development),
[checks](../../README.md#checks) and [parity stack](../../README.md#parity-stack)
instructions. For later source/task/image changes, rerun affected proof against
the changed artifacts.

### Successor handoff

| Consumer | Existing contract | Remaining work |
| --- | --- | --- |
| Step 5 | `buildApp` composition root (register the adapter with `app.register`), `database.db` through `AppDependencies`, fixed client errors with allowlisted error logs, and the existing API image/build path. | Delivered in [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114). |
| Step 6 | Parity stack suite (`pnpm test:stack`), exact health/exits/deadlines, guarded process tests, task graph and setup/log/stop instructions; the [Step 5 handoff](#handoff-to-step-6). | Add valid/invalid tRPC HTTP checks, reproduce Steps 1–5 from a clean checkout and recheck affected cache/integration evidence. |

Business routes, Firebase/bootstrap, Membership authorization, frontend,
production and CI remain under their existing decision and delivery owners.

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

**Planning inputs approved on 2026-11-01** (with the
[API rework](technical-direction.md#api-composition-and-error-log-rework-2026-11-01)):

- Register the tRPC Fastify adapter as a plugin in `buildApp`; do not add a
  lifecycle callback or a second composition path.
- The tRPC context exposes `database.db`, never the whole `Database`.
- Request logs include the tRPC procedure name. Failures keep the existing
  allowlisted `err` record and fixed client bodies.

**Approved plan (2026-11-01):** the [Step 5 plan](step-5-trpc-plan-2026-11-01.md)
settles P5-01–P5-10: packages, transport, body limits, error envelope, logs,
context, procedure, type export, layout and tests. Implement it as written and
bring any deviation back for approval.

**Implemented (2026-11-01):** [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114)
meets the five completion criteria with the plan's evidence, as recorded in the
[approval record](technical-direction.md#step-5-trpc-and-zod-plan-approval-2026-11-01).
The record also lists six implementation-time approvals: the adapter route, the
query JSON code, HEAD, oversized uploads, the JSON content type and the
TypeScript peer.

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

### Handoff to Step 6

- **HTTP contract:** the `/trpc` rows and documented exceptions in the
  [HTTP contract](local-development.md#trpc-http-contract). For example,
  `GET /trpc/diagnostics.echo?input=%7B%22message%22%3A%22ok%22%7D` returns 200
  `{"result":{"data":{"message":"ok"}}}`, and an empty `message` returns 400
  `BAD_REQUEST` with `issues: [{"path":["message"],"code":"too_small"}]`.
- **Client:** `@trpc/client` 11.22.1 is an API devDependency, usable with
  `httpLink` and `type AppRouter` from `@storage-minis/api/types` for smoke checks
  against the built process or the parity stack (port 3100). It is not in the
  image.
- **Logs:** `request_completed` and `request_failed` carry `procedure` only for
  matched procedures. Each tRPC failure logs one `request_failed` with a category
  named after the code (`bad_request`, `not_found`, `internal_error`, …).
- **Tests already in place:** `apps/api/src/trpc/plugin.test.ts` runs cases 1–22
  through `app.inject()` plus one loopback client test; `src/types.test.ts`
  compiles the browser-profile consumer. Step 6 adds the built-process and
  parity-stack checks, which this step deliberately left out.
- **Task graph:** `//#test` depends on `@storage-minis/api#build`, so an API
  source edit reruns root tests.

## Step 6 — Repeatable verification and handoff

### Why this step is necessary

Individually working components must form a reproducible setup. This step proves
their interaction and documents what the scaffold establishes, including its
remaining business and operational acceptance gaps.

### Expected result and completion criteria

A new checkout can follow the README from host dependency install and database
startup to a verified diagnostic API, both on the host and in the parity stack. Completion requires evidence that:

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
- Vitest project discovery, committed test values and the `*_test` guard,
  setup/isolation and cleanup; unit tests use explicit fixtures without a DB.
- Turbo hashes, injection timing, strict environment filtering, artifact
  restoration and external state that source hashes cannot cover. Cached tasks
  must not fetch untracked configuration after their hash is computed.
- A clean-install reproduction and the distinction between operational bootstrap
  evidence and schema/application integrity evidence.

The plan must provide a verification matrix of scenario, command/test, expected
outcome, resources and cleanup. Include missing/invalid database URLs, a non-test
target, environment precedence and redaction.
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

Use the general prompt below for the assigned remaining foundation step.

```text
Plan Step <number> of docs/technical/technical-foundation-implementation-guide.md.
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
