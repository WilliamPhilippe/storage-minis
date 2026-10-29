# Step 4 — Fastify server implementation plan

**Date:** 2026-10-28. **Status:** Step 4 in progress. Stage 4.1 is approved,
implemented and verified in commit `472e0a7`; stage 4.2 is approved, implemented and
verified in `29509a3`; stage 4.3 lifecycle/entry/start tasks are approved,
implemented and verified in `230a348`; stage 4.4 guarded process tests are approved,
implemented and verified in `2510bdd`; stage 4.5 runtime packaging is approved,
implemented and verified in `4fd7856`; stage 4.6 canonical runtime/startup is
approved, implemented and verified in `f92a8ed`; stage 4.7 development/reload is
approved, implemented and verified; stages 4.8–4.11 remain pending.
See the [cumulative evidence](../technical/step-4-verification-2026-10-28.md).
Remaining implementation recommendations retain their approval gates.
**Delivery owner:** [T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26).
This plans Step 4 of the [implementation guide](../technical/technical-foundation-implementation-guide.md#step-4--fastify-server-foundation).
This plan alone does not authorize dependency installation, runtime configuration changes,
implementation or database startup. Step 3B's structural delivery is inherited.

**Owner refinement, 2026-10-28:** Step 4 must supply explicit acceptance criteria,
a way to verify the application locally, and a repository-owned API Docker image
containing Fastify. The image requirement supersedes this plan's original use of
the generic tooling container as the application runtime. The detailed image and
packaging recommendations below remain pending implementation approval, subject
to the approved review amendments recorded next.

**Reviewed predecessor, 2026-10-28:** PR #106 is merged into `main` at
`db74a6541804b3ed04529427f018723a399d479b`. It supplies the approved Step 3B
structural schema/migrations and standard Compose one-time setup. This revision
replaces the earlier pre-#106 starting snapshot and retires P4-01.
See the [Step 3B implementation and writer deferrals](../database/step-3b-implementation-2026-10-25.md)
and [current local setup](../technical/local-development.md) for inherited behavior.
The owner accepted all eight review recommendations on 2026-10-28 and requested
this plan update. The rationale and scope are also recorded in
[technical direction](../technical/technical-direction.md#step-4-review-decisions-after-step-3-2026-10-28).

| Review item | Approved decision and rationale |
| --- | --- |
| 1 — Compose/lifecycle | Add profiled API services to canonical `compose.yaml`; use native Compose lifecycle operations and direct package aliases. Avoid a second Compose file or general API shell dispatcher to retain Step 3's standard tooling direction. |
| 2 — Configuration/security | Reuse saved `.env.compose` settings and Doppler's selected-target credential boundary. Routine startup needs no project/config/executable exports; security checks and no-fallback behavior remain mandatory. |
| 3 — Commands | Replace retired tooling build/init and database stop calls with existing native aliases or raw Compose equivalents, so the quickstart matches implemented Step 3 commands. |
| 4 — Prerequisites | Retire P4-01 without reusing its ID. Inherit Step 3B schema/migration/replay delivery; retain first-development-application ownership and the named business-writer deferrals. |
| 5 — Shutdown | Respect service grace periods on every project/API shutdown path; verify in-flight request cleanup through project-wide commands as well as direct signals. Prevent a global timeout from shortening API cleanup. |
| 6 — Diagnostics | Reuse Step 3's payload stderr forwarding and detailed redacted DB CLI diagnostics. Test the boundary; keep the proposed HTTP logging policy separate. |
| 7 — DB handoff | Include typed schema exports in API build/package/watch proof. Readiness proves current connection identity, not migration currency; startup never migrates. |
| 8 — Test isolation | Serialize schema tests, API process tests, smoke and outage experiments sharing a test target. Step 3 schema reset and service stop must not race another suite. |

These decisions approve the plan amendments, not every remaining P4 dependency,
packaging or application recommendation. This request changes documentation only.

## Starting state and dependency review

The entire six-step guide, technical direction, relevant foundation-proposal
sections, Step 3 plan/handoff, README, local-development reference, manifests,
TypeScript/Vitest configuration, Turbo graph, launchers and Compose files were
reviewed. The original planning review read live #21, #22, #23, #24 and #26;
the post-merge review reread live #26, which remains open with no comments and
the same #21/#22/#23 dependencies. This update changes no issue dependencies.

The original planning snapshot was PR #105 at `e788319`. The refreshed
`origin/main` reviewed after the merge is PR #106 at `db74a65`; the current branch
has merged that predecessor. Recheck remote main and the current checkout before
implementation rather than reusing the original environment observations.

| Predecessor or gate | Verified state | Effect on Step 4 |
| --- | --- | --- |
| Step 1 / [#103](https://github.com/WilliamPhilippe/storage-minis/pull/103) | Merged 2026-10-24; pinned tooling image, isolated volumes, unprivileged execution and Doppler launcher exist. | Reuse Docker execution, ownership and signal-forwarding conventions. |
| Step 2 / [#104](https://github.com/WilliamPhilippe/storage-minis/pull/104) | Merged 2026-10-24; separate persistent development and disposable test PostgreSQL services exist. | Supplies target addresses and lifecycle commands; requires no redesign. |
| Step 3A / [#105](https://github.com/WilliamPhilippe/storage-minis/pull/105) | Merged 2026-10-25; compiled DB exports, target validation, pool/check/close limits and tests exist. | The actual code prerequisite for the diagnostic API is delivered. |
| Step 3B / [#106](https://github.com/WilliamPhilippe/storage-minis/pull/106) | Approved 33-table structural schema, two committed migrations, typed schema exports and real PostgreSQL replay/constraint tests are implemented. Final recorded evidence is 27 unit tests and 30 DB integration tests. | Inherit compiled schema and working explicit migration commands. Startup/health remain table-free; first development application is still an owner action. |
| Local Compose/setup / #106 | One canonical file, native lifecycle aliases, `.env.compose`, automatic Doppler target selection and payload stderr forwarding are implemented. | Extend existing profiles/configuration/security instead of replacing their lifecycle with a dispatcher. |
| T01/T03 | Structural keys, int32 storage and UTC millisecond timestamps are selected/implemented. Writers, exact allocation/overflow enforcement and API/period contracts remain. | Keep business operations outside Step 4; diagnostic responses introduce no money/date contracts. |
| T02 | Firebase/session/bootstrap/authorization details remain open. | Expose only fixed diagnostic responses; create no identity or business-access bypass. |
| T04 | Production configuration, deployment, privileges and recovery targets remain open. | Propose local behavior only; do not claim production readiness. |
| Local execution | Original planning recorded an unavailable Docker socket. Step 3 has its own recorded execution evidence; this documentation review ran no new container/build/DB checks. | Inspect current daemon/settings/volumes before implementation. Historical environment observations are not current runtime evidence. |

**Dependency conclusion:** Steps 1–3B now provide the structural prerequisite
delivery for the diagnostic API. **P4-01 is retired:** no sequencing exception or
new prerequisite approval is needed. Its ID is preserved as retired. Business
writers, authorization and full T06 acceptance remain deferred under their
existing owners. First development migration application and Step 4
implementation are separate actions; neither is performed by this plan update.

## Inherited approvals and assigned scope

Reuse the [approved technical direction](../technical/technical-direction.md),
including the later [Step 3A amendments](../technical/technical-direction.md#step-3a-drizzle-implementation-2026-10-25):
Node 24.22.1, pnpm 12.15.0, TypeScript 6.0.3, Turbo 2.11.10, tsx 4.23.15,
strict ESM/NodeNext source checking, `.js` relative imports, existing Vitest
projects, exact versions/shared lockfile, Docker-first execution, Doppler
3.77.1 and compiled DB consumption. Retain approved `skipLibCheck: true` and
the exact esbuild build-script allowlist. Do not upgrade existing packages.

The existing DB public API exports `createDatabase`, `readDatabaseConfig`,
`validateDatabaseConfig`, `requireTestDatabase`, `databaseLimits`, the `schema`
namespace and their types. `Database` contains a schema-aware Drizzle `db`,
`check()`, `close()` and `healthy`. Its limits are 5 connections, 10s idle,
2s connect/acquisition, 3s statement, 4s query,
6s complete check and 10s pool close. `check()` already authenticates and checks
database/user/UTC identity; it is stronger than an unrelated `SELECT 1`.
`healthy` is last-check state, so it is insufficient as a current readiness probe.
The schema import opens no connection. Verify its compiled runtime/declaration
files and transitive imports in the image and watch tests, not only `dist/index`.
`check()` does not inspect migration history or table presence. Schema replay is
already demonstrated by Step 3B; it is not an API readiness requirement.

Deliver application construction, configuration, process lifecycle, health
routes, development/build/start commands, necessary launcher/Turbo changes and
Step 4 tests, a dedicated API Docker image and a local image smoke command.
Exclude business endpoints, schema/migration changes, tRPC,
Firebase, browser/client exports, frontend, CORS, CI, deployment and full T06
acceptance. Preserve the existing DB pool implementation unless a demonstrated
defect requires a separately approved change.

| Foundation decision | Step 4 subset proposed for approval |
| --- | --- |
| F01 | Diagnostic-server scope after delivered Steps 1–3B; P4-01 retired. |
| F04 | API runtime Fastify 5.12.7, Zod 4.6.7 and the DB workspace dependency only. |
| F05 | API process ownership of one existing DB factory result and cleanup. |
| F07 | API build/start, compiled dependency use, development watching and stale-output cleanup. Browser type exports stay with Step 5. |
| F08 / F14 | Local API entry validation and launcher injection using existing Doppler project/configs. Production policy stays open. |
| F09 | Factory, health, logging, startup and shutdown contracts below. |
| F11 | Step 4 unit/process/real-DB verification only. Step 6 still owns consolidated verification. |
| F12 | Actual API build/runtime/test tasks and their dependency/environment declarations. |
| F13 | Keep tooling for checks; add the owner-required API image with development/runtime targets and loopback API publication. |

## Proposed decisions

The dedicated API image and local verification are owner requirements. The eight
amendments above are approved. P4-02, the configuration contract and stage 4.1's
finite-build/strict-check portions of P4-08/P4-09 were subsequently approved and
implemented; see [technical direction](../technical/technical-direction.md#step-41-configuration-and-finite-build-approval-2026-10-28).
P4-03/P4-05/P4-06 and the factory/HTTP/logging contract were approved for stage
4.2 on 2026-10-28; implementation and focused checks are complete. See its
[approval record](../technical/technical-direction.md#step-42-factory-http-and-logging-approval-2026-10-28).
P4-04, the process/deadline/exit contract and stage 4.3 start-task portions of
P4-08/P4-09 were approved on 2026-10-28; implementation and offline checks are
complete. See the [stage 4.3 approval](../technical/technical-direction.md#step-43-lifecycle-process-and-start-task-approval-2026-10-28).
Stage 4.4 P4-09/P4-10 runner/task/test choices were approved on 2026-10-28;
implementation and guarded/aggregate checks are complete. See the
[4.4 approval](../technical/technical-direction.md#step-44-guarded-process-test-approval-2026-10-28).
Stage 4.5's P4-11 build/package/runtime and dist-only package boundaries were
approved on 2026-10-28; implementation and packaging checks are complete. See the
[4.5 approval](../technical/technical-direction.md#step-45-runtime-image-packaging-approval-2026-10-28).
Stage 4.6's runtime P4-07/P4-11 service/health/launcher/alias subset was approved
on 2026-10-29 and is implemented with native Compose/test-target evidence. See the
[4.6 approval](../technical/technical-direction.md#step-46-compose-runtime-and-startup-approval-2026-10-29).
Stage 4.7 P4-08/P4-09 watchers and P4-07/P4-11 development/injection details,
including native SIGINT stop after a verified TERM-chain drain failure, are
approved and implemented; see the [4.7 approval](../technical/technical-direction.md#step-47-development-image-and-reload-approval-2026-10-29).
Other details below remain recommendations until explicit implementation approval.
These labels are local plan references, not new business requirements or backlog
decisions. P4-01 remains retired.

| ID | Concrete recommendation and rationale | Alternative and tradeoff |
| --- | --- | --- |
| P4-02 — Dependencies | Add `fastify: 5.12.7`, `zod: 4.6.7` and `@storage-minis/db: workspace:*` to API runtime dependencies using container pnpm. Fastify supplies its own types/logger/injection support; Zod matches the existing DB pin. | Changing to another Fastify patch requires fresh compatibility research; adding a logger/CLI/bundler creates unnecessary dependencies. No tRPC package in this step. |
| P4-03 — Construction | `buildApp(httpConfig, dependencies)` returns an unlistening Fastify instance. Receive a narrow readiness capability typed from `Pick<Database, "check">` plus closing-state access. Factory imports read no environment and own no pool or process handlers. | A singleton or resource-owning factory is shorter but couples tests, startup and cleanup. The lifecycle callback supplies Step 5 with the full owned DB handle. |
| P4-04 — Lifecycle | A lifecycle module owns exactly one `Database`, one app and one idempotent close operation. Accept an optional async route-registration callback receiving that app and owned DB, before readiness/listen. A thin process entry validates configuration and installs signal handlers. Close resources on every partial-startup failure. | Listening while initially unready changes fail-fast behavior. Constructing another pool in Step 5 would duplicate ownership; the registration callback supplies an explicit extension point. |
| P4-05 — HTTP | Use the live/ready contracts below, 16 KiB body limit, 10s request-receive timeout, `forceCloseConnections: "idle"`, and `trustProxy: false`. Each readiness request uses a current bounded DB check. | One health route loses the process/dependency distinction. Cached readiness reduces queries but needs freshness and recovery policies. |
| P4-06 — Errors/logs | Use Fastify's JSON logger, server-generated request IDs, fixed failure categories and allowlisted request metadata. Disable default request logging, which includes raw URLs; never log environment objects, bodies, headers, raw errors or causes. | Header redaction alone leaves query strings and exception messages exposed. A second logging package is unnecessary. |
| P4-07 — Configuration/launch | Approved direction: reuse `.env.compose`, native Compose commands and existing Doppler injection. Stage 4.6 implements approved `api-up` in `database.sh` for runtime injection; stage 4.7 implements foreground `api-dev`; bounded `verify-api.sh` remains pending; ordinary build/logs/stop use Compose directly. Ordinary tooling/DB commands remain port-free. | A general API dispatcher or duplicated secret-fetch implementation adds maintenance and diverges from the accepted standard Compose direction. |
| P4-08 — Emit/watch | Approved/implemented through 4.7: use TypeScript for finite builds, compiled DB exports, a DB `tsc --watch` task and native Node watch with the already installed tsx loader for API source. Clean each package's own `dist` before finite builds. | `tsx watch` is the original candidate but has a 5s child-kill timer, shorter than the proposed API shutdown budget. Source DB exports break the agreed compiled boundary; bundling adds tooling. |
| P4-09 — Task graph | Approved/implemented tasks through 4.7 declare actual API dependencies, cached finite builds/checks and uncached persistent dev/start tasks. Add a separate uncached API process-test command; keep live resources outside ordinary checks. | Putting live checks into `pnpm check` adds DB/Doppler prerequisites to offline work. Making a persistent watcher a build prerequisite prevents finite completion. |
| P4-10 — Evidence | Test the factory/configuration offline; test built Node processes and current DB behavior against the explicit test target. Approved amendments require shared-target serialization and project-wide shutdown proof. Add only the harness needed to prove Step 4. | Injection tests alone cannot prove bind failures, ESM exports, signal forwarding or released process resources. Deferring all process tests to Step 6 leaves Step 4 incomplete. |
| P4-11 — API image | Approved layout: profiled API services in canonical `compose.yaml`. Stage 4.5 approves/implements `docker/Dockerfile.api` build/package/runtime, root `.dockerignore`, the existing pinned Node base, pnpm deploy and dist-only API/DB production packaging. Stage 4.6 adds the approved runtime Compose service/health and secure startup; stage 4.7 adds the approved nonroot development service/reload and native SIGINT stop. | A second Compose model fragments lifecycle/cleanup inventory. One image containing all build tools enlarges runtime scope; host pnpm links or tooling volumes make it incomplete. |

Published exact manifests were inspected without installing packages. At research
time Fastify 5.12.7 and Zod 4.6.7 were the registry's current stable releases.
Installation and strict compilation passed for stage 4.1; stage 4.5 proves
portable image packaging/imports. Stage 4.6 also verifies authenticated native
Compose runtime startup.
[Fastify manifest](https://registry.npmjs.org/fastify/5.12.7),
[Zod manifest](https://registry.npmjs.org/zod/4.6.7).

## Step 4 acceptance criteria

Every item below must be implemented and demonstrated before marking Step 4
complete. Check an item only after all its required scenarios have passing evidence;
stage-scoped or later-stage evidence remains explicitly partial.
The detailed scenarios and resource cleanup are in the verification matrix.
AC4-03/AC4-10 have [stage 4.2 evidence](../technical/step-4-verification-2026-10-28.md#stage-42--http-factory-health-and-safe-logs).
AC4-04 has [stage 4.3 lifecycle/route evidence](../technical/step-4-verification-2026-10-28.md#stage-43--process-lifecycle-and-entry-point).
AC4-05/AC4-08 have [stage 4.4 guarded process evidence](../technical/step-4-verification-2026-10-28.md#stage-44--guarded-built-process-tests),
including real startup failures, safe diagnostics and listener/pool cleanup.
AC4-09 has basic real SIGINT/SIGTERM proof; shutdown edge/project paths remain
with 4.10. AC4-06/AC4-07 have real healthy HTTP/authenticated-check proof, but
service-outage liveness/readiness bounds/recovery remain partial until 4.9.
AC4-11 has [stage 4.5 packaging evidence](../technical/step-4-verification-2026-10-28.md#stage-45--self-contained-runtime-image):
all compiled files/declarations and portable production links. AC4-01 now has
[4.6 native Compose/authenticated runtime evidence](../technical/step-4-verification-2026-10-28.md#stage-46--canonical-compose-and-doppler-startup).
AC4-02 has [4.7 development/reload evidence](../technical/step-4-verification-2026-10-28.md#stage-47--development-image-and-reload), including compiler isolation/recovery and in-flight foreground interruption.
AC4-13 has runtime/development proof and remains partial until the 4.8 smoke
credential path passes; project drain proof stays with 4.10.

- [x] **AC4-01 — API image:** the repository builds a dedicated API runtime image
  containing Fastify, compiled API/DB code and production dependencies. It starts
  with plain Node as a nonroot user without source/dependency mounts, a TS loader,
  an install at startup, live build credentials or access to tooling volumes.
- [x] **AC4-02 — Development image:** API development runs in the API Dockerfile's
  development target. API edits reload; DB edits rebuild compiled exports and
  reload the API. Dependency volumes stay isolated from host and other projects.
- [x] **AC4-03 — Application factory:** importing or constructing the app reads
  no environment, opens no listener/pool and installs no process handlers. Tests
  can use normal Fastify injection and close their own app.
- [x] **AC4-04 — Step 5 extension:** one process-owned DB instance is passed to an
  async route-registration callback before readiness/listen. A test route proves
  access to that same instance and registration failure triggers cleanup. No
  tRPC dependency, dummy identity or second pool is introduced.
- [x] **AC4-05 — Configuration:** explicit API/DB validation rejects invalid or
  missing settings before listening and exposes no supplied secret values.
- [ ] **AC4-06 — Liveness:** real HTTP `/health/live` returns 200 and exactly
  `{"status":"ok"}` without querying PostgreSQL, including during a DB outage.
- [ ] **AC4-07 — Readiness:** real HTTP `/health/ready` returns the specified
  200/503 body from a fresh authenticated check. DB failure is bounded by 6s plus
  HTTP scheduling margin, and recovery restores 200 without API restart. This
  checks connection identity, not migration currency; startup never migrates.
- [x] **AC4-08 — Startup failures:** wrong credentials, unavailable DB, invalid
  configuration and occupied ports fail nonzero with safe diagnostics and no
  leaked listener/pool; startup/failure cleanup respects the 17s outer deadline.
- [ ] **AC4-09 — Shutdown:** SIGINT/SIGTERM, repeated signals, startup interruption
  and failed/blocked cleanup have tested ownership and exit outcomes. Mark
  unready, drain HTTP and close the one pool within the 10s total process bound.
  Native API and project stop/down paths honor the 15s API service grace period,
  including during a bounded in-flight request; no global 10s override cuts it short.
- [x] **AC4-10 — Safe HTTP/logging:** route, framework and unexpected failures
  preserve documented safe status/body behavior; tests prove logs/responses omit
  credentials, raw queries/bodies, stacks, causes and untrusted request IDs.
- [x] **AC4-11 — Build contract:** NodeNext runtime/type exports work, finite
  builds remove stale emitted files, and API imports only compiled DB exports.
  Packaged workspace links resolve wholly within the API runtime image, including
  all compiled schema modules and declarations.
- [ ] **AC4-12 — Task graph:** actual build/typecheck/test dependencies and
  `dist/**` outputs are declared. Finite work restores/reuses valid cache entries;
  source changes invalidate consumers. Persistent/live work is uncached and no
  finite task depends on a persistent watcher.
- [ ] **AC4-13 — Environment boundary:** matching Doppler dev/test configs supply
  only the selected password at runtime. Missing access/config/key, stale ambient
  values and fallback attempts cannot run an unintended target or leak secrets.
  Reuse saved nonsecret settings without required exports, ignore plain `.env`,
  and preserve existing DB CLI diagnostics. Image builds and ordinary checks
  work without DB/Doppler access.
- [ ] **AC4-14 — Meaningful tests:** factory/config/lifecycle unit tests and the
  guarded real-test-DB process suite pass; dev/wrong targets are rejected before
  secret fetching/connecting. Schema resets, API tests, smoke and outages sharing
  a test target run sequentially. Normal empty suites still fail; unit checks
  require no live DB.
- [ ] **AC4-15 — Automated local proof:** `./scripts/database.sh api-verify test` exercises
  the built API image over host HTTP, checks exact health responses, signals
  shutdown and removes every owned probe container on success/failure. It exits
  0 only after all assertions pass and reports bounded, sanitized failures.
- [ ] **AC4-16 — Manual local proof:** README documents image build/start, browser
  or curl URLs, exact expected health bodies, logs, stop and development commands
  from a fresh checkout, with prerequisites and troubleshooting. No Step 5/6
  implementation is needed to follow it successfully.
- [ ] **AC4-17 — Resource isolation:** API publication is host-loopback-only;
  explicit occupied ports fail without probing another service. API stop/verify
  cleanup preserves development DB storage and unrelated worktree resources.
  All API services are profiled in canonical `compose.yaml`; default DB startup
  excludes them and native project status/stop/down includes them when selected.
- [ ] **AC4-18 — Handoff evidence:** the implementation PR records results for
  all these criteria, setup instructions, image identity and Step 5/6 contracts.
  Step 3B structural/replay evidence is inherited; remaining business writers,
  authorization and production acceptance stay explicitly deferred. Unresolved
  Step 4 criteria mean Step 4 is incomplete.

## Application and process contract

Source responsibilities (only assigned and verified stages are delivered):

| File | Responsibility |
| --- | --- |
| `apps/api/src/config.ts` | `readApiConfig(environment)` validates explicitly supplied values and calls the compiled DB package's `readDatabaseConfig`; returns separate HTTP and DB configuration. |
| `apps/api/src/app.ts` | Construct Fastify, safe error/not-found behavior and diagnostic routes; accept readiness/closing dependencies. |
| `apps/api/src/lifecycle.ts` | Own startup, the DB instance, app resource acquisition and idempotent bounded cleanup. Accept `registerRoutes(app, database): Promise<void>` before readiness/listen; test through injected constructors and registration failures. |
| `apps/api/src/server.ts` | Process entry: environment input, early signal registration, lifecycle invocation, sanitized failure output and exit status. |
| `apps/api/src/*.test.ts` | Configuration, route, logger and lifecycle tests with explicit fixtures; no DB/Doppler calls. |
| `apps/api/tests/*.integration.test.ts` | Built-process, authenticated DB and shutdown checks, excluded from unit discovery. |
| `apps/api/scripts/process-tests.ts` | Test-target guard, dedicated Vitest invocation, suite watchdog and child cleanup. |
| `apps/api/vitest.process.config.mts` | Separate `api-process` project with real-DB process tests. |
| `apps/api/tsconfig.build.json` | Emit runtime ESM/declarations from `src`, excluding tests; broad no-emit config also covers scripts and test/config files. |
| `docker/Dockerfile.api`, `.dockerignore`, existing `compose.yaml` | Build and run profiled API development/runtime targets with explicit context, dependency packaging and network contracts. |
| Existing `scripts/database.sh` and `scripts/local-config.sh` | Reuse the saved-settings reader and selected-target Doppler boundary; add only allowlisted API injection operations, keeping native lifecycle behavior in Compose. |
| `scripts/verify-api.sh` | Bounded local runtime-image/HTTP smoke, exact test guard and owned-container cleanup; credentials arrive through the existing host Doppler boundary. |

The lifecycle registration callback receives the same full `Database` instance
the process owns; `buildApp` itself only needs the narrow readiness capability.
Call the callback once, after factory construction and before app readiness or
listen. Registration failure enters the same cleanup path. Step 5 can register
its adapter/context using that handle without adding a pool, environment reads
or signal handlers. Step 4 tests this with an ordinary temporary test route;
the delivered server still exposes only health routes.

Configuration defaults: `HOST=127.0.0.1`, `PORT=3000`, `LOG_LEVEL=info`,
`NODE_ENV=development`; allow local bind hosts `127.0.0.1` and `0.0.0.0`,
decimal ports 1–65535 without leading zeroes and Fastify logger levels
`fatal/error/warn/info/debug/trace/silent`. Validate `NODE_ENV` against
`development/test/production`; that enum grants no production deployment scope.
Default absent values only; reject blank/invalid values. Unknown environment
keys are ignored rather than rejecting the entire inherited environment.
DB components retain their exact Step 3A target validation and URL rejection.
Report invalid field names/categories without supplied values or Zod issues.
Use explicit injected port 0 only in isolated factory/process test helpers,
never as a silently selected configured runtime port.

| Situation | HTTP/process result |
| --- | --- |
| `GET /health/live` while serving | 200, `{"status":"ok"}`; no database call. |
| `GET /health/ready` with successful current `database.check()` | 200, `{"status":"ready"}`. |
| `GET /health/ready` with DB failure | 503, `{"status":"unavailable"}`; DB work bounded by the inherited 6s check limit. |
| Database recovers | Next successful readiness check returns 200 without restarting API. |
| Startup DB/configuration/listen failure | Sanitized fixed category, nonzero exit, no remaining API-owned listener/pool. |
| Unknown route | 404, `{"error":"not_found"}`; never reflect requested URL/query. |
| Malformed/empty JSON, invalid content length or malformed URL | 400, `{"error":"bad_request"}`. |
| Oversized body | 413, `{"error":"payload_too_large"}`. |
| Unsupported content type | 415, `{"error":"unsupported_media_type"}`. |
| Other client failure | Preserve the 4xx status with `{"error":"request_error"}`; omit exception messages/headers. |
| Unexpected handler failure | 500, `{"error":"internal_error"}`; no stack/cause/input in response or log. |
| Shutdown begins | Mark closing first; readiness uses unavailable while still routed, then stop accepting connections. Already closing connections may receive Fastify's safe 503 or a transport closure. Do not promise an HTTP response after the listener closes. |

Normal DB loss leaves liveness 200. Reuse `check()` rather than querying business
tables or trusting the last `healthy` flag. Readiness failures log only request
ID, fixed category and result; no raw database exception.
An authenticated but unmigrated database can therefore report ready for this
diagnostic server. Preserve explicit `docker:migrate` and the owner's first
development application action; neither health nor API startup applies SQL.

Request logging allowlists generated ID, method, matched route template (or a
fixed unmatched label), status and elapsed time. Set `requestIdHeader: false`;
do not accept arbitrary header contents as a log identifier. Override error
serialization with safe categories and retain authorization/cookie redaction as
defense in depth. Pre-logger configuration failures use fixed stderr text.
Preserve safe malformed/oversized-body status codes rather than converting all
framework failures to 500. These are local diagnostics, not Step 5's tRPC errors.
This proposed HTTP policy does not replace Step 3's DB CLI policy: retain actual
messages, nested causes and driver codes with password/URL redaction for DB
commands. Do not reuse their formatter in HTTP responses or weaken their command
diagnostics while extending the shared injection helper.
[Fastify server options](https://github.com/fastify/fastify/blob/v5.12.7/docs/Reference/Server.md),
[logging](https://github.com/fastify/fastify/blob/v5.12.7/docs/Reference/Logging.md).

The 10s `requestTimeout` bounds receiving a request, not executing its handler;
readiness execution is bounded separately. Startup allows 6s for DB validation,
then bounded listener setup; use a 17s overall startup/failure-cleanup watchdog
(6s check + 10s cleanup + scheduling margin). Shutdown uses a single 10s total
deadline, not 10s separately for HTTP and DB. Mark closing, drain HTTP, then close
the pool in `finally` even if HTTP close fails. At the overall deadline, destroy
remaining HTTP sockets and force nonzero process exit; process termination closes
owned DB sockets even if the DB helper has not finished its own close deadline.

Successful signal cleanup reports conventional 130 for SIGINT and 143 for
SIGTERM, consistent with existing DB commands. Startup/cleanup/watchdog failure
reports 1. Repeated signals share the same close promise; they cannot start a
second pool close. A signal received during DB startup must prevent subsequent
`listen()`. Remove handlers/timers on completed cleanup without leaving a window
where unfinished startup can acquire an unowned resource.
Stage 4.3 implements this with handlers before configuration/acquisition and
cleanup waiting for pending startup to settle. If either resource close rejects,
it still attempts the other resource, destroys HTTP connections and forces exit
1 after both attempts; a rejected close cannot certify release. Only successful
cleanup uses natural exit with the documented signal code.
Assert these application/container outcomes separately from the Compose client's
native exit semantics. Ordinary Compose stop retains stopped service containers;
only the smoke harness must remove its one-off probe on every outcome.
[Fastify close implementation](https://github.com/fastify/fastify/blob/v5.12.7/fastify.js),
[Node 24 signal behavior](https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events).

## Docker and environment contract

### Dedicated API image

Stage 4.5 implements `docker/Dockerfile.api` build/package/runtime targets and
root `.dockerignore`, with the repository root as build context. Its
[approval](../technical/technical-direction.md#step-45-runtime-image-packaging-approval-2026-10-28)
and [verification](../technical/step-4-verification-2026-10-28.md#stage-45--self-contained-runtime-image)
cover portable production packaging. Stage 4.7 implements the approved nonroot
development target and reload; Compose/authenticated runtime startup is delivered in 4.6. Reuse
this exact base rather than choosing another Node distribution/version:

```text
node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
```

The named-stage contract below is implemented through stage 4.7:

1. `build`: provision pnpm 12.15.0, copy explicit workspace manifests, lockfile,
   compiler/task configuration and API/DB source, run frozen installation and
   `pnpm build`. No database, Doppler access, secret build arguments or migrations.
2. `development`: inherit the built workspace with development dependencies;
   default to `pnpm dev` in `/workspace`. Compose overlays the checkout and the
   existing five project-scoped dependency/store/cache volumes for live editing.
   Require the documented volume init/frozen install before using that overlay.
3. `package`: from `build`, run
   `pnpm --filter=@storage-minis/api --prod deploy /out`. API/DB manifests use
   `files: ["dist"]` so deployment includes their built files. Verification
   proves the output contains Fastify, Zod, the compiled DB and transitive runtime
   dependencies, with no links escaping the deployed tree.
4. `runtime`: start again from the pinned Node image, copy only `/out` to `/app`
   with `node` ownership, set `USER node`, and execute
   `CMD ["node", "--enable-source-maps", "dist/server.js"]`. Set `NODE_ENV=production`,
   port 3000 and container bind `0.0.0.0`. No pnpm/Turbo/tsx/compiler or repository
   bind mount is required to start this image.

The production dependency graph is packaged by pnpm rather than copying host
`node_modules` or workspace symlinks. The pnpm documentation says deploy includes
workspace dependencies in portable output and no longer requires injected
workspace dependencies since 12.2.0; retain 12.15.0 without changing workspace
injection policy. Stage 4.5 proves 64 production packages, compiled API/DB/schema
files/declarations and all 141 links resolving within `/app`. Multi-stage
packaging keeps build tools out of the final application stage.
[pnpm deploy](https://pnpm.io/cli/deploy),
[Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

Implemented root `.dockerignore` exclusions cover `.git`, `.context`, host
dependencies, generated `dist`, Turbo/test caches, logs, and local environment files including
`.env.compose`. Copy only required workspace inputs explicitly. Never copy the
host Doppler directory or credentials into any stage. The tooling Dockerfile
retains its existing `docker/` context and responsibilities.
[Docker build context](https://docs.docker.com/build/concepts/context/#dockerignore-files).

### Compose, saved settings and credential ownership

**Approved direction:** extend canonical `compose.yaml` with `api` (runtime
image, profile `api`) and `api-dev` (development image, profile `api-dev`). Do
not add a second Compose file or general API lifecycle shell dispatcher. Keep
PostgreSQL as the only default service: existing `docker:up` continues to start
and authenticate the database without implicitly starting API/watchers. Existing
DB service definitions, six volume identities and pins remain unchanged.

Implemented runtime (4.6) and development (4.7) details:
use project-scoped tags
`${COMPOSE_PROJECT_NAME}-api:step4` and `${COMPOSE_PROJECT_NAME}-api:step4-dev`.
Both services join the existing default network, use `init: true`,
`restart: "no"` and a 15s stop grace period, longer than the API's 10s process deadline.
Development uses `stop_signal: SIGINT`, approved after the pinned pnpm/Turbo
TERM chain cut off an in-flight response. Both outer TERM and INT now drain
through native Compose; runtime keeps default TERM. Runtime has no source/
dependency volumes; api-dev reuses the five existing
project-scoped tooling volumes. Add no persistent storage.

The runtime service publishes `127.0.0.1:${API_HOST_PORT:-3000}:3000`. Give it a
Node-based `/health/ready` healthcheck with a 7s HTTP abort, 8s Docker timeout,
2s interval, 5s start period and three retries; it needs no curl installation.
Database startup remains explicit. Credential-bearing API startup delegates to
native `up --detach --no-deps --no-build --pull never --wait --wait-timeout 30 api`.
Compose owns readiness waiting, idempotent service reuse/recreation and failure
status; no custom polling/replacement policy is needed for ordinary startup.
On failure, preserve safe diagnostics and inspect/stop the selected service with
native commands. API process startup failure must release its listener/pool;
a stopped service container may remain for diagnosis. For foreground dev use
native `up --no-deps --no-build --pull never api-dev`, after stopping built mode
if it owns the same host port. Both modes cannot publish the same port together.

Build, status, logs, stop and removal use direct Compose commands/package aliases
with `--env-file .env.compose --file compose.yaml`. Full-project commands retain
`--profile '*'` so optional API/test/tooling services are included. They run on
the host, outside Turbo, without a mounted Docker socket or fetching secrets.
Native aliases require Docker on PATH and the saved file, as in Step 3. Retain
the existing 600s allowance for build/install verification attempts.

**Approved shutdown amendment:** keep service-specific grace declarations rather
than a global 10s override. Remove `--timeout 10` from full-project stop/prune,
the confirmed volume helper's native down, and any new API stop/removal commands;
native Compose then uses 15s for API and the existing 10s for other services.
Explicit database-only stop/reset can retain their 10s contract. Verify direct
signals, API-only stop, full-profile stop/down and guarded volume teardown with
a bounded in-flight test request in a disposable project. Check clean drain,
exit status and no premature SIGKILL; never run destructive evidence on the
owner's development project. Normal stop/down preserves named volumes.

**Doppler remains mandatory for credential-bearing commands.** Reuse
`load_local_config`, `resolve_doppler` and the existing selected-password fetch
in `scripts/database.sh`. Recommend narrowly allowlisted operations
`api-up TARGET`, `api-dev TARGET` and `api-verify test`: map them only to the corresponding
native Compose payload or verifier, not arbitrary host callbacks. `api-up` is
implemented in 4.6; `api-dev` is implemented in 4.7; `api-verify` remains proposed for 4.8. Built startup
executes the image's Node CMD, never `tooling.sh _run-db` or root `pnpm start`.
Keep the tooling runner for checks/dependency maintenance and process tests.

The injection operation validates mode, target and nonsecret API settings before
Doppler/Docker work, clears ambient PG/URL/password settings and supplies only the
selected DB tuple to the selected API payload. Extend the existing pre-fetch
integration guard to recognize `test:api` and `test:process` as test-only commands;
the process runner and its Vitest config also enforce the exact test tuple.
No separate secret-fetch implementation, new Doppler key, raw secret arguments,
secret file or fallback is introduced. Build/status/logs/stop remain secret-free;
the declarative model must parse with empty runtime credential defaults.

| Input | Source, precedence and consumer |
| --- | --- |
| Compose project / DB host ports | Reuse `.env.compose` through `load_local_config` and native `--env-file` selection. Preserve Step 3's validated explicit environment overrides for deliberate disposable projects. Do not choose a replacement project name for an initialized checkout. |
| Saved settings schema | Keep exactly `COMPOSE_PROJECT_NAME`, `POSTGRES_PORT`, `POSTGRES_TEST_PORT`. The literal allowlist/duplicate/unknown-key checks remain; no shell sourcing or new API key in this file. |
| DB target/config | Explicit `dev` or `test`; the helper automatically selects Doppler `storage-minis` and the matching config. Contradictory overrides fail. Routine startup requires no exports. |
| DB password | Existing managed `POSTGRES_PASSWORD` or `POSTGRES_TEST_PASSWORD` only, selected before payload startup. Ambient passwords cannot satisfy a missing managed key. |
| DB components | Supply `DB_TARGET`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` using the existing approved tuples; ambient connection values cannot override them. |
| Doppler executable/login | Use existing automatic executable discovery and dedicated browser-login directory, enforcing 3.77.1. Preserve explicit approved overrides for troubleshooting; no required path export or new login mechanism. |
| `API_HOST_PORT` | Optional nonsecret invocation override, default 3000 for built/dev mode; validate 1–65535 without leading zeros before Doppler/Docker. No persistence change to `.env.compose`. Host loopback only; fail on collision. |
| `API_VERIFY_HOST_PORT` | Optional verifier-only port with the same bounds. If absent, deliberately request a Docker-assigned loopback port; do not inherit `API_HOST_PORT` into this choice. |
| `HOST` / `PORT` | Compose API services set container `0.0.0.0` / `3000`. Direct Node defaults remain loopback/3000. Host publication and process bind address are distinct. |
| `LOG_LEVEL` | Optional nonsecret invocation override, default `info`; validate before launch and again at process entry. |
| `NODE_ENV` / `TZ` | Development uses `development`, isolated tests use `test`, built runtime defaults to `production`; `TZ=UTC`. These flags choose no production infrastructure. |

Ordinary DB/API process tests use `run-db test` without publishing a host API
port. Pass only required variables by name to containers and runtime/live Turbo
tasks. Do not forward credentials to DB compiler watchers, finite builds or unit
tests. No Doppler credentials enter the image/container. Keep selected-key-only
fetching, dedicated browser login, token refusal, a 10s request timeout/one
attempt, `--no-fallback` and no live re-fetch on source reload. Missing login,
config/key or network access prevents credential-bearing payload startup.

Ordinary `.env` autoload stays disabled; explicit `.env.compose` is intentional
nonsecret configuration, not a credential fallback. Helpers clear ambient
`COMPOSE_FILE`, `COMPOSE_ENV_FILES` and `COMPOSE_PROFILES` as in Step 3. Document
native command equivalents with explicit canonical-file/saved-settings selection.
The [Doppler launch contract](../technical/local-development.md#doppler-host-setup-and-verification)
and [saved setup](../technical/local-development.md#docker-tooling) are inherited.

Step 3 already forwards payload stderr into stdout before suppressing Doppler's
own fetch diagnostics. Reuse this boundary and test both streams with sentinels;
API diagnostics must be visible and sanitized, DB CLI messages/causes/codes must
remain visible and redacted, and secret values must not appear. Do not add the
old proposed stderr fix again or print raw Doppler diagnostics.

Changing Doppler values requires relaunching the outer credential-bearing
command. Source reload reuses its environment. Password rotation does not change
an initialized PostgreSQL volume; retain the documented credential procedure.
Native Compose owns the foreground dev service lifecycle; test signal delivery
through Doppler/shell/Compose/pnpm/Turbo/Node as well as the built container's
Node path. Retain existing signal protection only where an actual verification
gap requires it, limited to the owned credential payload or smoke container.

## Build, development and Turbo contract

API build emits `dist/{app,config,lifecycle,server}.js`, corresponding `.d.ts`
and JavaScript source maps. Keep `noEmitOnError: true`, `rootDir: src`,
`outDir: dist`, declaration emit and test exclusion. No API export map is needed
until Step 5's type-only router export. Preserve the DB's existing output shape.
Both finite package builds first remove only their own `dist` with native Node
`fs.rmSync`, then run `tsc --project tsconfig.build.json`. This is a proposed DB
build-script amendment to avoid stale files after source deletion/rename; no
schema or DB public API change accompanies it. Clean builds must not run against
the same output while development watchers are active.

| Owner | Proposed command |
| --- | --- |
| API `build` | Native Node clean of its `dist`, then `tsc --project tsconfig.build.json`. |
| DB `build` | Same clean-before-compile amendment; existing compiler config retained. |
| API `dev` | `node --watch --watch-preserve-output --import tsx src/server.ts`. |
| DB `dev` | `tsc --project tsconfig.build.json --watch --preserveWatchOutput`. |
| API `start` | `node --enable-source-maps dist/server.js`. No TS loader or runner. |
| Root `dev` | `turbo run dev`. |
| Root `start` | `turbo run start --filter=@storage-minis/api`. |
| Root `test:api` | `turbo run test:process --filter=@storage-minis/api`. |
| API `test:process` | `tsx scripts/process-tests.ts`, which validates the test tuple and launches dedicated Vitest. |
| Host API lifecycle | Native Compose API build/logs/stop and existing project status/down, with direct package aliases; Doppler-backed `database.sh api-up dev` / `api-dev dev` for runtime injection. |
| Host API smoke | `./scripts/database.sh api-verify test`; injects the exact test tuple into `scripts/verify-api.sh` against the runtime image. |

The root/package Node commands remain available for tooling and process checks.
User-facing built startup uses the Doppler-backed native Compose payload. The
API image's Node CMD does not invoke Turbo, build or install at startup.
`database.sh api-dev dev` starts the API development service, whose command is
root `pnpm dev`. Native Compose manages its lifecycle with the approved SIGINT
stop signal. Use the canonical foreground path for verified shutdown; direct
TERM to the pinned pnpm/Turbo chain can trigger duplicate forwarding/force-stop.

Node watch observes imported modules, including the compiled DB schema files;
the tsx loader executes API source without changing the DB export boundary.
Unlike tsx's watcher, the pinned Node watch implementation waits for child exit
on restart, allowing the API's own 10s deadline to govern cleanup. Do not use
`--watch-path`, which is unsupported on Linux. Verify real dependency reload
through the Docker bind mount rather than assuming loader/watch integration.
[Node 24.22.1 watch documentation](https://github.com/nodejs/node/blob/v24.22.1/doc/api/cli.md#--watch),
[Node restart implementation](https://github.com/nodejs/node/blob/v24.22.1/lib/internal/main/watch_mode.js),
[tsx 4.23.15 loader usage](https://github.com/privatenumber/tsx/blob/v4.23.15/docs/dev-api/node-cli.md),
[published tsx CLI with its 5s child-kill timer](https://registry.npmjs.org/tsx/-/tsx-4.23.15.tgz).

DB watcher errors retain the last successfully compiled files and display the
compiler error; the last API process may keep running. Such a process is not
evidence that current source passes checks. Adding/removing/renaming DB source
requires stopping dev and performing the clean finite build before relaunch;
the compiler watcher does not remove stale emitted files. Watch mode is local
iteration; strict finite checks remain the delivery gate. Native Node watch can
remain waiting after a failed child startup; document the error and recovery
instead of treating the persistent watcher itself as a ready server.

| Turbo task | Dependencies and policy |
| --- | --- |
| API `build` | Existing `build: dependsOn ["^build"]`, cached `dist/**`; workspace link orders DB first. |
| API `typecheck` | Existing `^build`, cached `[]`; compiled DB declarations are required. |
| Root typed lint | Preserve explicit DB build dependency. |
| Root unit `test` | Add explicit DB build dependency because API config imports compiled DB exports; preserve `NODE_ENV`/`TZ` hashes. |
| API `dev` | `dependsOn: ["^build"]`, uncached, persistent. |
| DB `dev` | `dependsOn: ["build"]`, uncached, persistent. Both dev tasks wait for the same finite DB build; neither depends on a persistent task. |
| API `start` | Own finite `build`, uncached, persistent. |
| API `test:process` | Own finite `build`, uncached, finite, no outputs. |

API dev/start/process tests pass through only `DB_TARGET`, `PGHOST`, `PGPORT`,
`PGDATABASE`, `PGUSER`, `PGPASSWORD`, `DATABASE_URL` (to permit explicit rejection),
`HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV`, `TZ`. The DB dev task receives no DB secrets.
Keep application values out of global pass-through. Builds/checks neither fetch
Doppler values nor depend on runtime settings. Keep defaults for task inputs and
existing shared config dependencies; generated `dist` remains an output, not a
source input. Adding API `test:process`, rather than another `test:integration`,
preserves the existing root `test:db` command's DB-only scope.
[Turbo task configuration](https://turborepo.dev/docs/reference/configuration),
[environment filtering](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).

## Implementation order after approval

**Owner execution requirement, 2026-10-28:** implement this plan in small
sequential assignments because an agent may exhaust its usage allowance during
one session. Assign one stage at a time and stop at its documented handoff.
The [sequential implementation guide](step-4-fastify-implementation-stages-2026-10-28.md)
splits the work into **11 stages (4.1–4.11)** with bounded scope, files,
verification, acceptance completion owners and progress tracking. The owner
confirmed retaining these boundaries after the planning interview. Use the
[individual stage prompts](step-4-fastify-stage-prompts-2026-10-28.md) as the
starting packets for fresh or resumed sessions.
It replaces the earlier eight-item order; the technical contracts and all 18
acceptance criteria in this parent plan remain in force.

The sequence is configuration/build → HTTP factory → process lifecycle →
guarded process tests → runtime image → canonical Compose/Doppler startup →
development/reload → runtime-image smoke → DB recovery/isolation → native
project shutdown → cache/documentation/final handoff. Each stage requires its
predecessor's completed handoff. Do not implement the entire sequence in a single
assignment or start the next stage automatically.

Inspect the checkout, existing diff, approvals and saved configuration before each
assignment. Add commands/services only when their stage supplies the working
implementation; this document's final command inventory is not a requirement to
add placeholders early. Stage 4.1 emits configuration first, 4.3 adds the process
entry, 4.6 adds the runtime Compose service and 4.7 adds development mode.

Use the already-planned verification record as a cumulative checkpoint across
sessions. Write an initial in-progress entry before implementation, update it
after meaningful verified results and before live/temporary-fixture experiments,
and save exact checks, pending actions and nonsecret resource/cleanup state at
handoff. Resume an interrupted stage rather than splitting it or advancing.
Obtain remaining technical approvals before their consuming stage work. A
completed stage's agent stages its changes/evidence and executes a local
Conventional Commit on `WilliamPhilippe/step-4-implementation-plan` after required
checks pass, then reports the actual commit hash. It must perform the commit,
not leave it to the owner. Unfinished or commit-blocked work stays explicitly
in progress. This adds no automatic push
or PR-publication authorization.

Run focused tests and affected strict checks per stage. Full ordinary
`./scripts/tooling.sh run pnpm check` milestones are 4.4 (application foundation),
4.8 (container integration) and 4.11 (final integration); live checks remain
separate. Reuse predecessor evidence only while relevant source/configuration/
dependency/image/environment inputs remain valid; rerun affected checks after
changes, failures or gaps. Stage completion and acceptance completion are
separate: AC4-06 stays partial until outage proof in 4.9, and AC4-13 until all
runtime/development/smoke credential paths pass by 4.8.
The existing Step 4 PR boundary, approval requirements, shared-target test
serialization and Step 5/6 scope boundaries are unchanged. This planning request
starts no implementation and approves no additional technical choices.

## Verification matrix

The matrix defines required checks. None ran during the original planning update;
current stage results are recorded in the
[cumulative evidence](../technical/step-4-verification-2026-10-28.md).
Existing Step 1–3B evidence is inherited as historical evidence, not a fresh pass.
The API process suite validates the exact test tuple before creating clients,
starting children or performing any cleanup. It uses no business tables, resets,
migrations, seeds or imports. Step 3B already proves schema/replay separately;
API readiness remains valid against an authenticated unmigrated test database.

| Criterion/scenario | Check or command | Expected result, bound and cleanup |
| --- | --- | --- |
| Installation and strict compatibility | `tooling.sh run pnpm install --frozen-lockfile`; `tooling.sh run pnpm check --force` | Exact lockfile, unchanged strict source rules, meaningful API/DB unit tests and no relaxed empty-suite policy. Build/install attempts bounded to the existing 600s policy. |
| Imports/configuration | API unit tests through `pnpm test --project api-unit` after DB build | Imports without environment/network; missing, blank, invalid ports/levels/targets reject before resource creation; supplied secret sentinels absent from failures. |
| Factory/liveness/readiness | `app.inject()` unit tests | Live never invokes DB. Ready invokes current check, 200/503 bodies match contract, failure then success recovers, closing prevents a healthy ready result. Always `app.close()` in cleanup. |
| Logger/framework errors | Unit tests with captured logger output and secret sentinels in URL, headers/body/cause | No sentinel, stack, raw URL or supplied request ID; safe unmatched/error responses, malformed JSON 400 and oversized body 413. |
| Partial acquisition / Step 5 seam | Lifecycle tests: factory/registration failure, callback DB identity, readiness rejection, listen rejection, close rejection and signal during pending startup | Callback receives the one owned DB before readiness/listen; every acquired resource closes once, pool close still runs after HTTP close failure, no listen after cancellation. |
| Built Node consumption | `tooling.sh run pnpm build`; guarded `run-db test pnpm test:api` | Harness spawns `node --enable-source-maps dist/server.js` directly with no loader. Runtime resolves compiled DB, answers real HTTP and releases its listener/pool. |
| Self-contained API image | Native API image build; `database.sh api-verify test`; inspect runtime image/package files | Runtime has Fastify/Zod/compiled DB/schema modules/declarations and self-contained production dependencies; Node runs as `node`, without TS tooling, source/dependency mounts or an install at startup. No secret/local environment files or dangling workspace links enter the image. |
| Automated local smoke | `./scripts/database.sh api-verify test`, repeated unchanged | Actual runtime image is launched each time; owned host HTTP returns exact live/ready bodies, TERM exits cleanly, temporary container is removed. Deliberately invalid credentials cause nonzero exit and the same cleanup, never cached success. |
| Startup invalid credentials/config/unavailable DB | Guarded process suite with fixture environment and outer timeout | Nonzero sanitized failure, no startup-success marker or surviving child. Startup/failure cleanup at most 17s plus test scheduling margin. Do not mutate managed Doppler values. |
| Occupied application port | Harness owns an explicit competing listener inside the test container | API bind fails; harness never accepts a response from that listener as API readiness. Original listener remains under harness ownership until cleanup. |
| SIGINT and SIGTERM | Built children, API runtime container and full Doppler/Compose `database.sh api-dev dev` invocation checks | In-flight bounded diagnostic request drains; no running child/listener or leaked pool remains. Assert application/container signal code separately from native Compose client status; stopped service containers may remain. Cleanup failure is nonzero. API cleanup at most 10s; allow 5s outer launcher overhead. |
| Native project shutdown | API-only stop, full-profile `docker:stop` / `docker:prune`, and guarded volume teardown in a disposable project while a bounded test request is in flight | API gets its declared 15s grace, drains within the 10s application budget and is not prematurely killed by a global timeout. Verify exit/container state; ordinary down preserves volumes, confirmed disposable deletion removes only owned volumes. |
| Canonical model and saved settings | Secret-free service/profile/volume inspection; native aliases and raw equivalents from a fresh terminal | One model lists the profiled API services and same six volumes; default DB startup excludes API. Saved project/ports are reused; plain `.env` and conflicting helper Compose overrides cannot redirect resources. Build/logs/stop need no Doppler; missing runtime access/key fails before payload startup. |
| Shared test target scheduling | Run DB schema suite, API process suite, smoke and outage phases sequentially against a disposable project's target | No schema reset or test-service stop overlaps another consumer. Record target ownership, order and cleanup; per-file serial execution alone is insufficient. |
| Repeated signal/startup interruption | Unit and process checks | One close path; no listener opens after interruption and no later callback resurrects resources. |
| Hung cleanup | Subprocess fixture with intentionally unresolved close hook | Watchdog terminates nonzero within 10s plus scheduling margin; child resources released by process exit. No test-runner force-exit can conceal a lingering API child. |
| Real DB readiness failure and recovery | Test-only connection disruption/recovery using an owned DB client, then fresh HTTP probes | Live remains 200; ready becomes 503 within the inherited 6s DB budget plus HTTP scheduling margin, then 200 after recovery. Reuse Step 3A socket-termination technique; close admin client and API child. |
| Actual service outage/restart | Native `docker:stop:test`, then `database.sh up test`, with API running against test | Ready 503 during outage, live 200, ready recovers after test startup. Test tmpfs loss is intentional; no test run may be concurrent. Do not stop/reset development. |
| Correct target and process-test isolation | `tooling.sh run-db test pnpm test:api`; reject dev/mixed tuples before fetch and in runner/config | Dedicated suite passes only against `postgres_test/storage_minis_test`; test launcher/config both reject development before any connection. `pnpm check` remains offline. |
| Doppler and precedence | Existing launch fixtures extended for allowlisted API payloads; real missing-access/wrong-config checks when credentials exist | Mismatch/missing login/key/outage fail before payload; `.env`, ambient passwords/URLs and unrelated managed keys do not reach process. No fallback file created; special-character fixture password preserved by named injection. |
| Publication | `API_HOST_PORT=3001 ./scripts/database.sh api-up dev` and Docker binding inspection | Only host `127.0.0.1:3001` maps to container 3000. Occupied host port fails before usable API; unrelated `run`/`run-db` commands publish none. Remove only owned invocation. |
| Watcher handoff | `./scripts/database.sh api-dev dev`; temporary API and DB source edits from host | API development image runs the watchers. DB finite build precedes watchers; API edits reload; DB implementation and schema edits emit JS/declarations and reload the dependent API. Observe changed behavior/new generated PID, not just watcher output. Restore source byte for byte. |
| Watcher limits | Temporary DB compile error, rapid successive valid edits, dev TERM/INT | Error visible and no mistaken claim current code passed; correction rebuilds/reloads. No restart kills a legitimate >5s drain before the API's 10s deadline. Children close on outer signal. Restore source and stop watchers. |
| Turbo graph/caches | `pnpm check --dry=json`; forced build/check then unchanged repeat | Actual dependencies, no recursive orchestration or persistent finite prerequisite; cache reused for finite unchanged work. Live tests/start/dev stay uncached. |
| Artifact/source invalidation | Remove generated `dist` only while watchers stopped; repeat build; temporary DB implementation/type edit | Cache restores both declared outputs; DB changes invalidate API build/typecheck/root unit tests and lint. Compiler error prevents dependent success; deleted source leaves no stale finite-build output. Restore fixtures. |

**Shared-target scheduling:** `test:db` now includes a schema suite that drops
and recreates `public` and migration history on the exact test database. Run it
to completion before the API process suite, then smoke, then controlled outage
checks; close each phase's clients/children before the next. Do not run separate
commands concurrently against this target. `fileParallelism: false` only orders
files within one Vitest run. Outage experiments require exclusive use of the
test service because stopping it discards tmpfs. If exclusive use cannot be
established, defer that experiment or use a separately configured disposable
Compose project/ports; never reset a target to conceal interference. This plan
requires sequential execution, not a new distributed lock or test infrastructure.

Use 30s per process test and 10s hooks, with a 180s suite supervisor deadline and
an additional bounded child-termination cleanup path. Run process tests serially;
reserve distinct ports per child, capture output in memory with a size bound and
close owned sockets/clients/children in `finally`. Avoid tests that bind an
unreserved port and then probe whichever service answers. After the suite, run
ordinary DB checks as needed to confirm the fixture did not leave clients active.
If a daemon-level outage prevents recovery, record it as failed/deferred evidence
and preserve development storage; do not claim a pass or reset data to hide it.

## Local verification delivered by Step 4

The API commands in this section are the final planned Step 4 workflow. They
become available incrementally under the
[stage guide](step-4-fastify-implementation-stages-2026-10-28.md); each stage
documents only its working subset until the full quickstart is complete.
Existing Step 3 setup/DB commands already exist. Docker Desktop and the documented dedicated
Doppler browser login/configs/passwords are prerequisites. Runtime image build/
start needs neither host Node/pnpm nor tooling dependency volumes. Reuse existing
`.env.compose`; on a new checkout run `./scripts/configure-local.sh` once to save
a unique project and distinct available DB ports. Do not overwrite an initialized
checkout's settings or export a replacement project name.

Proposed package aliases follow Step 3's native lifecycle convention. The
security-bearing exceptions call only the existing Doppler boundary:

| Planned alias | Host command |
| --- | --- |
| `pnpm docker:api:build` | `docker compose --env-file .env.compose --file compose.yaml build api api-dev` |
| `pnpm docker:api:up` | `./scripts/database.sh api-up dev` |
| `pnpm docker:api:dev` | `./scripts/database.sh api-dev dev` |
| `pnpm docker:api:logs` | `docker compose --env-file .env.compose --file compose.yaml logs --follow api` |
| `pnpm docker:api:stop` | `docker compose --env-file .env.compose --file compose.yaml stop api api-dev` |
| `pnpm docker:api:verify` | `./scripts/database.sh api-verify test` |

Runtime is implemented in 4.6 and development in 4.7: build/stop select both real
services, `api-up`/`api-dev` select the explicit target, logs select `api` (use
native `logs --follow api-dev` for development), and existing `docker:ps` supplies
status. Only `api-verify` and its alias remain unavailable until 4.8. Current usable commands are in the
[README](../../README.md#api-runtime-image). There is no general dispatcher. Existing
`docker:ps`, `docker:stop` and `docker:prune` cover the API through full-profile
selection; their project-wide stop/down commands must honor service grace periods.
Use the raw commands above for Docker-only operation. The following quickstart
also needs no host pnpm, no required Doppler/project exports and no secret file:

```sh
# First checkout only; skip when .env.compose already exists:
./scripts/configure-local.sh

docker compose --env-file .env.compose --file compose.yaml build api api-dev
./scripts/database.sh up dev
./scripts/database.sh api-up dev
curl --fail --silent --show-error --max-time 8 \
  --write-out '\nHTTP %{http_code}\n' http://127.0.0.1:3000/health/live
curl --fail --silent --show-error --max-time 8 \
  --write-out '\nHTTP %{http_code}\n' http://127.0.0.1:3000/health/ready
```

Expected results, respectively:

```text
{"status":"ok"}
HTTP 200

{"status":"ready"}
HTTP 200
```

The same URLs work in a browser. Run
`API_HOST_PORT=3001 ./scripts/database.sh api-up dev` to deliberately override
publication for that invocation; use its explicit port in the URLs.
Routine default startup needs no export. API settings are not
added to the current three-key `.env.compose` schema. Doppler executable/config
discovery follows Step 3; contradictory explicit configs and an ambient
`DOPPLER_TOKEN` are rejected. Clear earlier experimental exports as documented
in the existing setup reference.

Native `up --wait` supplies the startup result. Follow safe API logs with
`docker compose --env-file .env.compose --file compose.yaml logs --follow api`;
interrupting the viewer leaves the service running. Startup and readiness do not
apply migrations or prove schema currency. Keep `pnpm docker:migrate` as a
separate owner action, with its existing Docker-only equivalent, after SQL review.
No development migration application is required for diagnostic health.

Automated proof uses the actual runtime image and exclusive use of the test DB.
It may coexist with the normal development API on port 3000, but not a schema
suite, another test consumer or a concurrent test-service outage:

```sh
./scripts/database.sh up test
./scripts/database.sh api-verify test
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
```

The verifier receives the exact test tuple through Doppler and launches a unique
one-off container from the canonical runtime service using native Compose run
with `--no-deps`, explicit loopback publication, no build/pull and no source/
dependency mounts. It overrides `NODE_ENV=test` and inspects that owned container's
image ID/running state before host HTTP probes. If `API_VERIFY_HOST_PORT` is
absent, deliberately request a Docker-assigned loopback port and discover it
from that container; an explicit port fails on collision. `API_HOST_PORT` never
selects the smoke port. The selected test password enters only named environment
variables, never command arguments or output.

`scripts/verify-api.sh` uses the existing host `/usr/bin/curl`, bounded requests
and exact status/body assertions. Give readiness polling 30s, each request at
most 8s, application shutdown 10s plus 5s Docker overhead, and the whole smoke
operation at most 60s. Capture the SIGTERM exit outcome and remove only the owned
probe in a trap on success/failure/interruption; force removal only after its
cleanup deadline. Print safe image/container identity and assertion results.
Exit 0 only after health and shutdown assertions pass. This is a narrow
verification harness; Step 6 extends it with tRPC checks.

For live editing after the existing one-time tooling setup, stop built mode and
run foreground development. The native build/init commands replace the retired
helper operations; repeat init/install only when needed:

```sh
docker compose --env-file .env.compose --file compose.yaml stop api api-dev
docker compose --env-file .env.compose --file compose.yaml build tooling
docker compose --env-file .env.compose --file compose.yaml run --rm --no-deps tooling-init
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/tooling.sh run pnpm check
./scripts/database.sh api-dev dev
```

Stop foreground dev before clean builds. For the complete process suite, after
DB/tooling setup and once the schema suite has finished, use
`./scripts/tooling.sh run-db test pnpm test:api`. It is separate required evidence
from the quick image smoke. Finish/clean it before smoke or outage checks. A
source edit requires rebuilding the runtime image before built-mode results
represent the changed source.

Use native API-only stop to preserve databases/tooling, and full-profile native
stop/down when deliberately shutting down this project. Native down retains
named volumes; confirmed volume deletion is reserved for disposable verification
here. Stop only owned verification resources and preserve initialized checkout
settings. No global prune or development data reset is part of Step 4.

## Handoff, documentation and approval

Implementation would change API source/tests/configuration and manifest, root
scripts/lockfile/Turbo, DB package build/dev/files settings, the selected-target
host credential boundary and canonical Compose API profiles. Add the API
Dockerfile/ignore/smoke files, native package aliases and service-aware project
shutdown changes. Keep the tooling Dockerfile, DB service definitions, settings
schema, migration chain and DB runtime factory. No general API dispatcher or
second Compose file is added.

Update README/local-development with actual commands, variable
inventory, watch limitations, logs and failure cleanup. Update AGENTS.md's
current-state/command guidance using its writing skill when that edit is made.
Record approved choices in technical direction. Start the cumulative
`docs/technical/step-4-verification-<implementation-date>.md` during stage 4.1;
write its initial in-progress checkpoint before implementation and update it
throughout the session and at every completed or interrupted handoff. Save results,
pending checks, current diff/resource state and the exact resume action. Completed
stages include evidence in their local Conventional Commit after required checks
pass. Update setup documentation incrementally, then complete the full
quickstart and the foundation guide's Step 4 PR/evidence row at 4.11. Earlier
stages remain partial Step 4 delivery, not completion of the whole plan.

### Verification of support for Steps 5 and 6

The outputs below were checked against every completion criterion in the
guide's Step 5 and Step 6. This establishes planned coverage, not runtime proof;
AC4-01–AC4-18 require actual evidence before handoff.

| Successor requirement | Step 4 output and proof | Successor work still required |
| --- | --- | --- |
| Step 5: actual Fastify HTTP adapter tests | Unlistening factory returns normal Fastify; injection tests and route-registration callback prove plugins can be added before listen. | Install/register the selected tRPC adapter and test real HTTP success, invalid input/output and unknown procedures. |
| Step 5: request context uses the existing DB | Registration callback receives the one process-owned full DB handle; identity/order/cleanup tests prove that contract. | Build tRPC request context and request information using that handle, with no fabricated principal/Organization. |
| Step 5: safe errors and bounded requests | Fastify body limit, receive timeout, safe logger/error boundary and existing framework-error tests. | Specify/verify tRPC envelopes, output-validation errors, batching and adapter-specific parser/error behavior; Fastify error handling alone does not prove these. |
| Step 5: future browser type contract | ESM/declaration builds and `files: ["dist"]` package built modules as they are added. The same API image rebuild includes future router output. | Add the type-only router export and prove emitted browser JavaScript imports no server/DB runtime. Step 4 provides no router type yet. |
| Step 6: built-process smoke and shutdown | API runtime image, exact health responses, direct Node CMD, guarded process suite and `database.sh api-verify test` with owned-container cleanup. | Extend the existing smoke with valid/invalid tRPC requests and final failure/redaction scenarios rather than inventing another server lifecycle. |
| Step 6: isolated PostgreSQL tests | Explicit test tuple guards, separate process/unit commands and known 6s check/10s shutdown limits. | Consolidate cross-package evidence in sequential shared-target phases. Inherit Step 3B schema/replay tests; business writers and their races remain deferred. |
| Step 6: repeatable clean setup and caches | Image build/dependency packaging, documented local workflow, offline checks and declared finite/persistent task graph. | Reproduce the complete Steps 1–5 setup from a clean checkout and verify integrated cache/artifact restoration and failure propagation. |
| Step 6: setup diagnostics and limitations | README local verification, logs/stop commands, image identity, acceptance results and explicit deferrals. | Publish final consolidated evidence and outstanding T06/business/operations limitations. |

The owner-required API image is an additional Step 4 deliverable; its packaging
and health smoke cannot be postponed to Step 6. Step 5 adds transport/routes to
this image, and Step 6 extends verification of that same application artifact.
Neither successor must rebuild pool ownership, the listener, local startup or
Docker packaging merely to begin its assigned work.

Step 3B structural schema/replay/constraint evidence is delivered and inherited.
Remaining deferred acceptance is T01/T03 business-writer integrity,
reconciliation and operation-level concurrency, T02 authorization/bootstrap,
T04 operations, and T06's global Product reuse/private-data rejection, atomic business rollback,
funding/deletion races, frontend/browser and CI outputs. Health and process tests
do not establish those requirements or justify closing #26.

**Approval state:** the owner approved the eight post-Step-3 review amendments
on 2026-10-28; their scope and rationale are recorded above and in technical
direction. P4-01 is retired. The later stage 4.1 approval covers P4-02, configuration
and the finite-build/strict-check portions of P4-08/P4-09, delivered in `472e0a7`.
The owner subsequently approved P4-03/P4-05/P4-06 for stage 4.2; that factory,
HTTP and logging work is complete with passing injection/strict/build checks.
Stage 4.3 P4-04/process/start choices and stage 4.4 P4-09/P4-10 runner/task/test
choices are also approved and implemented with offline and real process evidence.
Stage 4.5 P4-11 runtime packaging and stage 4.6 P4-07/P4-11 runtime Compose,
health, launcher and native aliases are also approved and implemented. Stage 4.7
watch/development/tasks/injection and its native SIGINT stop amendment are approved
and implemented. Later smoke recommendations retain their approval gates. Current
delivered scope is stages 4.1–4.7; the original planning update remains a dated
record of no installation or implementation.
Preserve existing approved Step 3 behavior and obtain
approval only for uncovered choices when implementation is requested.

Planning validation: the original review inspected issue/PR state, package
metadata and pinned upstream watch/server implementations. The post-merge review
refreshed `origin/main`, inspected Step 3 code/approval records and reread live
T06. This revision records the owner's eight accepted amendments, replaces
obsolete commands/prerequisites and aligns acceptance/verification/handoff text.
No dependencies, containers, secrets, migrations or application configuration
were changed during the documentation update; runtime evidence remains pending.
The owner's subsequent request and confirmed interview retain 11 sequential
session stages with individual prompts, ongoing checkpoints, local completion
commits and focused/milestone verification. These execution decisions are approved;
technical approval scope and all 18 acceptance requirements are unchanged.
