# Step 4 — Fastify server implementation plan

**Date:** 2026-10-28. **Status:** proposal; owner approval pending.
**Delivery owner:** [T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26).
This plans Step 4 of the [implementation guide](../technical/technical-foundation-implementation-guide.md#step-4--fastify-server-foundation).
It does not authorize dependency installation, runtime configuration changes,
implementation, database startup, or completion of Step 3B.

**Owner refinement, 2026-10-28:** Step 4 must supply explicit acceptance criteria,
a way to verify the application locally, and a repository-owned API Docker image
containing Fastify. The image requirement supersedes this plan's original use of
the generic tooling container as the application runtime. The detailed image and
launcher recommendations below remain pending implementation approval.

**Merge reconciliation, 2026-10-28:** PR #106 is now merged into `main` at
`db74a6541804b3ed04529427f018723a399d479b`. It supplies the approved Step 3B
structural schema/migrations and standard Compose one-time setup. The starting
snapshot and P4-01 sequencing exception below describe the earlier planning
state; that exception is no longer needed for the delivered structural scope.
See the [Step 3B implementation and writer deferrals](../database/step-3b-implementation-2026-10-25.md)
and [current local setup](../technical/local-development.md) for inherited behavior.
Before implementation, reconcile the proposed launcher, Compose and migration
handling below with those approved records. Step 4 recommendations still await
approval; this merge adopts no new API implementation choices.

## Starting state and dependency review

The entire six-step guide, technical direction, relevant foundation-proposal
sections, Step 3 plan/handoff, README, local-development reference, manifests,
TypeScript/Vitest configuration, Turbo graph, launchers and Compose files were
reviewed. Live #21, #22, #23, #24 and #26 and their comments were read on this date;
all remain open, with no comments. Native #26 blockers remain #21/#22/#23.

The checkout was clean before planning. `HEAD` and local `origin/main` both point
to `e7883196256d409bfa1dd46647101b41ff45261c`, the merge of PR #105. GitHub confirms
that Steps 1 and 2 and Step 3A are merged. Remote `main` was not fetched or changed;
recheck its current tip before implementation.

| Predecessor or gate | Verified state | Effect on Step 4 |
| --- | --- | --- |
| Step 1 / [#103](https://github.com/WilliamPhilippe/storage-minis/pull/103) | Merged 2026-10-24; pinned tooling image, isolated volumes, unprivileged execution and Doppler launcher exist. | Reuse Docker execution, ownership and signal-forwarding conventions. |
| Step 2 / [#104](https://github.com/WilliamPhilippe/storage-minis/pull/104) | Merged 2026-10-24; separate persistent development and disposable test PostgreSQL services exist. | Supplies target addresses and lifecycle commands; requires no redesign. |
| Step 3A / [#105](https://github.com/WilliamPhilippe/storage-minis/pull/105) | Merged 2026-10-25; compiled DB exports, target validation, pool/check/close limits and tests exist. | The actual code prerequisite for the diagnostic API is delivered. |
| Step 3B | No business schema or migrations; migration commands deliberately refuse. The physical-schema packet is unapproved. | Neither startup nor health routes require application tables. Keep migration guards intact. |
| T01/T03 | Executable business constraints, numeric/time contracts and migration approval remain open. | Gate schema and business operations; health responses introduce none of those contracts. |
| T02 | Firebase/session/bootstrap/authorization details remain open. | Expose only fixed diagnostic responses; create no identity or business-access bypass. |
| T04 | Production configuration, deployment, privileges and recovery targets remain open. | Propose local behavior only; do not claim production readiness. |
| Local execution | Docker CLI exists, but daemon inspection failed because the Desktop socket was absent. This worktree has no installed package dependencies or DB build output. | No fresh container/build/DB evidence was obtained. Running Docker and checkout-specific initialization are required for implementation verification. |

**Dependency conclusion:** there is no missing predecessor implementation needed
for the table-free diagnostic server after Step 3A. There is a documentation and
approval ambiguity: the guide says “Steps 1–3,” requires the previous merged
handoff, and also explicitly describes schema-dependent evidence as deferrable.
Do not silently interpret the whole of Step 3 as complete.

**Recommendation requiring approval (P4-01):** permit Step 4 after merged Steps
1, 2 and 3A, leaving Step 3B separately gated. On approval, clarify that exact
prerequisite in the guide. Waiting for all of 3B is the alternative: it preserves
a literal sequential reading but delays an independent HTTP/lifecycle delivery.
This exception changes no issue dependencies and does not authorize Step 5.

The guide and historical Step 3A handoff still described #105 as awaiting review.
This planning change corrects the guide's current status; preserve the handoff's
original dated verification record.

## Inherited approvals and assigned scope

Reuse the [approved technical direction](../technical/technical-direction.md),
including the later [Step 3A amendments](../technical/technical-direction.md#step-3a-drizzle-implementation-2026-10-25):
Node 24.22.1, pnpm 12.15.0, TypeScript 6.0.3, Turbo 2.11.10, tsx 4.23.15,
strict ESM/NodeNext source checking, `.js` relative imports, existing Vitest
projects, exact versions/shared lockfile, Docker-first execution, Doppler
3.77.1 and compiled DB consumption. Retain approved `skipLibCheck: true` and
the exact esbuild build-script allowlist. Do not upgrade existing packages.

The existing DB public API exports `createDatabase`, `readDatabaseConfig`,
`validateDatabaseConfig`, `requireTestDatabase`, `databaseLimits` and their types.
`Database` contains typed `db`, `check()`, `close()` and `healthy`. Its limits
are 5 connections, 10s idle, 2s connect/acquisition, 3s statement, 4s query,
6s complete check and 10s pool close. `check()` already authenticates and checks
database/user/UTC identity; it is stronger than an unrelated `SELECT 1`.
`healthy` is last-check state, so it is insufficient as a current readiness probe.

Deliver application construction, configuration, process lifecycle, health
routes, development/build/start commands, necessary launcher/Turbo changes and
Step 4 tests, a dedicated API Docker image and a local image smoke command.
Exclude business endpoints, schema/migration changes, tRPC,
Firebase, browser/client exports, frontend, CORS, CI, deployment and full T06
acceptance. Preserve the existing DB pool implementation unless a demonstrated
defect requires a separately approved change.

| Foundation decision | Step 4 subset proposed for approval |
| --- | --- |
| F01 | Diagnostic-server scope and the explicit Step 3B sequencing clarification. |
| F04 | API runtime Fastify 5.12.7, Zod 4.6.7 and the DB workspace dependency only. |
| F05 | API process ownership of one existing DB factory result and cleanup. |
| F07 | API build/start, compiled dependency use, development watching and stale-output cleanup. Browser type exports stay with Step 5. |
| F08 / F14 | Local API entry validation and launcher injection using existing Doppler project/configs. Production policy stays open. |
| F09 | Factory, health, logging, startup and shutdown contracts below. |
| F11 | Step 4 unit/process/real-DB verification only. Step 6 still owns consolidated verification. |
| F12 | Actual API build/runtime/test tasks and their dependency/environment declarations. |
| F13 | Keep tooling for checks; add the owner-required API image with development/runtime targets and loopback API publication. |

## Proposed decisions

The dedicated API image and local verification are owner requirements. Their
concrete implementation choices below remain recommendations until explicitly
approved. These labels are local plan references, not new business requirements
or backlog decisions.

| ID | Concrete recommendation and rationale | Alternative and tradeoff |
| --- | --- | --- |
| P4-02 — Dependencies | Add `fastify: 5.12.7`, `zod: 4.6.7` and `@storage-minis/db: workspace:*` to API runtime dependencies using container pnpm. Fastify supplies its own types/logger/injection support; Zod matches the existing DB pin. | Changing to another Fastify patch requires fresh compatibility research; adding a logger/CLI/bundler creates unnecessary dependencies. No tRPC package in this step. |
| P4-03 — Construction | `buildApp(httpConfig, dependencies)` returns an unlistening Fastify instance. Receive a narrow readiness capability typed from `Pick<Database, "check">` plus closing-state access. Factory imports read no environment and own no pool or process handlers. | A singleton or resource-owning factory is shorter but couples tests, startup and cleanup. The lifecycle callback supplies Step 5 with the full owned DB handle. |
| P4-04 — Lifecycle | A lifecycle module owns exactly one `Database`, one app and one idempotent close operation. Accept an optional async route-registration callback receiving that app and owned DB, before readiness/listen. A thin process entry validates configuration and installs signal handlers. Close resources on every partial-startup failure. | Listening while initially unready changes fail-fast behavior. Constructing another pool in Step 5 would duplicate ownership; the registration callback supplies an explicit extension point. |
| P4-05 — HTTP | Use the live/ready contracts below, 16 KiB body limit, 10s request-receive timeout, `forceCloseConnections: "idle"`, and `trustProxy: false`. Each readiness request uses a current bounded DB check. | One health route loses the process/dependency distinction. Cached readiness reduces queries but needs freshness and recovery policies. |
| P4-06 — Errors/logs | Use Fastify's JSON logger, server-generated request IDs, fixed failure categories and allowlisted request metadata. Disable default request logging, which includes raw URLs; never log environment objects, bodies, headers, raw errors or causes. | Header redaction alone leaves query strings and exception messages exposed. A second logging package is unnecessary. |
| P4-07 — Configuration/launch | Add `scripts/api.sh` for image build, development, built start, logs, stop and verification. Reuse the database launcher's selected-password injection through a host callback; run the new API Compose services. Ordinary tooling/DB commands remain port-free. | Raw Compose commands repeat credential/target handling. The former tooling-only runtime proposal does not satisfy the owner's API-image requirement. |
| P4-08 — Emit/watch | Use TypeScript for finite builds, compiled DB exports, a DB `tsc --watch` task and native Node watch with the already installed tsx loader for API source. Clean each package's own `dist` before finite builds. | `tsx watch` is the original candidate but has a 5s child-kill timer, shorter than the proposed API shutdown budget. Source DB exports break the agreed compiled boundary; bundling adds tooling. |
| P4-09 — Task graph | Declare actual API dependencies, cached finite builds/checks and uncached persistent dev/start tasks. Add a separate uncached API process-test command; keep live resources outside ordinary checks. | Putting live checks into `pnpm check` adds DB/Doppler prerequisites to offline work. Making a persistent watcher a build prerequisite prevents finite completion. |
| P4-10 — Evidence | Test the factory/configuration offline; test built Node processes and current DB behavior against the explicit test target. Add only the harness needed to prove Step 4. | Injection tests alone cannot prove bind failures, ESM exports, signal forwarding or released process resources. Deferring all process tests to Step 6 leaves Step 4 incomplete. |
| P4-11 — API image | Add `docker/Dockerfile.api`, a root `.dockerignore` and `compose.api.yaml`. Use the existing pinned official Node base, a development target and a self-contained runtime target with compiled API/DB and production dependencies. | One image containing all build tools is easier to assemble but enlarges runtime scope. Copying host pnpm links or depending on tooling volumes makes the image incomplete. |

Published exact manifests were inspected without installing packages. At research
time Fastify 5.12.7 and Zod 4.6.7 were the registry's current stable releases.
Installation/strict compilation remain required compatibility evidence.
[Fastify manifest](https://registry.npmjs.org/fastify/5.12.7),
[Zod manifest](https://registry.npmjs.org/zod/4.6.7).

## Step 4 acceptance criteria

Every item below must be implemented and demonstrated before marking Step 4
complete. These are planned acceptance criteria, not checked delivery evidence.
The detailed scenarios and resource cleanup are in the verification matrix.

- [ ] **AC4-01 — API image:** the repository builds a dedicated API runtime image
  containing Fastify, compiled API/DB code and production dependencies. It starts
  with plain Node as a nonroot user without source/dependency mounts, a TS loader,
  an install at startup, live build credentials or access to tooling volumes.
- [ ] **AC4-02 — Development image:** API development runs in the API Dockerfile's
  development target. API edits reload; DB edits rebuild compiled exports and
  reload the API. Dependency volumes stay isolated from host and other projects.
- [ ] **AC4-03 — Application factory:** importing or constructing the app reads
  no environment, opens no listener/pool and installs no process handlers. Tests
  can use normal Fastify injection and close their own app.
- [ ] **AC4-04 — Step 5 extension:** one process-owned DB instance is passed to an
  async route-registration callback before readiness/listen. A test route proves
  access to that same instance and registration failure triggers cleanup. No
  tRPC dependency, dummy identity or second pool is introduced.
- [ ] **AC4-05 — Configuration:** explicit API/DB validation rejects invalid or
  missing settings before listening and exposes no supplied secret values.
- [ ] **AC4-06 — Liveness:** real HTTP `/health/live` returns 200 and exactly
  `{"status":"ok"}` without querying PostgreSQL, including during a DB outage.
- [ ] **AC4-07 — Readiness:** real HTTP `/health/ready` returns the specified
  200/503 body from a fresh authenticated check. DB failure is bounded by 6s plus
  HTTP scheduling margin, and recovery restores 200 without API restart.
- [ ] **AC4-08 — Startup failures:** wrong credentials, unavailable DB, invalid
  configuration and occupied ports fail nonzero with safe diagnostics and no
  leaked listener/pool; startup/failure cleanup respects the 17s outer deadline.
- [ ] **AC4-09 — Shutdown:** SIGINT/SIGTERM, repeated signals, startup interruption
  and failed/blocked cleanup have tested ownership and exit outcomes. Mark
  unready, drain HTTP and close the one pool within the 10s total process bound.
- [ ] **AC4-10 — Safe HTTP/logging:** route, framework and unexpected failures
  preserve documented safe status/body behavior; tests prove logs/responses omit
  credentials, raw queries/bodies, stacks, causes and untrusted request IDs.
- [ ] **AC4-11 — Build contract:** NodeNext runtime/type exports work, finite
  builds remove stale emitted files, and API imports only compiled DB exports.
  Packaged workspace links resolve wholly within the API runtime image.
- [ ] **AC4-12 — Task graph:** actual build/typecheck/test dependencies and
  `dist/**` outputs are declared. Finite work restores/reuses valid cache entries;
  source changes invalidate consumers. Persistent/live work is uncached and no
  finite task depends on a persistent watcher.
- [ ] **AC4-13 — Environment boundary:** matching Doppler dev/test configs supply
  only the selected password at runtime. Missing access/config/key, stale ambient
  values and fallback attempts cannot run an unintended target or leak secrets.
  Image builds and ordinary checks work without DB/Doppler access.
- [ ] **AC4-14 — Meaningful tests:** factory/config/lifecycle unit tests and the
  guarded real-test-DB process suite pass; dev/wrong targets are rejected before
  connecting. Normal empty suites still fail. Unit checks require no live DB.
- [ ] **AC4-15 — Automated local proof:** `./scripts/api.sh verify test` exercises
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
- [ ] **AC4-18 — Handoff evidence:** the implementation PR records results for
  all these criteria, setup instructions, image identity and Step 5/6 contracts.
  Schema, business, authorization and production acceptance stay explicitly
  deferred; unresolved Step 4 criteria mean Step 4 is incomplete.

## Application and process contract

Proposed source responsibilities:

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
| `docker/Dockerfile.api`, `.dockerignore`, `compose.api.yaml` | Build and run API development/runtime targets with explicit context, dependency packaging and network contracts. |
| `scripts/api.sh`, `scripts/verify-api.sh` | Host Docker lifecycle and bounded local image/HTTP smoke; reuse selected-target injection in `scripts/database.sh`. |

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
| Unexpected handler failure | 500, `{"error":"internal_error"}`; no stack/cause/input in response or log. |
| Shutdown begins | Mark closing first; readiness uses unavailable while still routed, then stop accepting connections. Already closing connections may receive Fastify's safe 503 or a transport closure. Do not promise an HTTP response after the listener closes. |

Normal DB loss leaves liveness 200. Reuse `check()` rather than querying business
tables or trusting the last `healthy` flag. Readiness failures log only request
ID, fixed category and result; no raw database exception.

Request logging allowlists generated ID, method, matched route template (or a
fixed unmatched label), status and elapsed time. Set `requestIdHeader: false`;
do not accept arbitrary header contents as a log identifier. Override error
serialization with safe categories and retain authorization/cookie redaction as
defense in depth. Pre-logger configuration failures use fixed stderr text.
Preserve safe malformed/oversized-body status codes rather than converting all
framework failures to 500. These are local diagnostics, not Step 5's tRPC errors.
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
[Fastify close implementation](https://github.com/fastify/fastify/blob/v5.12.7/fastify.js),
[Node 24 signal behavior](https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events).

## Docker and environment contract

### Dedicated API image

The repository currently has only `docker/Dockerfile.tooling`; Step 4 creates
`docker/Dockerfile.api` using the repository root as its build context. Reuse
this exact base rather than choosing another Node distribution/version:

```text
node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
```

Propose these named stages:

1. `build`: provision pnpm 12.15.0, copy explicit workspace manifests, lockfile,
   compiler/task configuration and API/DB source, run frozen installation and
   `pnpm build`. No database, Doppler access, secret build arguments or migrations.
2. `development`: inherit the built workspace with development dependencies;
   default to `pnpm dev` in `/workspace`. Compose overlays the checkout and the
   existing five project-scoped dependency/store/cache volumes for live editing.
   Require the documented volume init/frozen install before using that overlay.
3. `package`: from `build`, run
   `pnpm --filter=@storage-minis/api --prod deploy /out`. Add `files: ["dist"]`
   to API/DB manifests so deployment includes their built files. Verify the
   deploy output contains Fastify, Zod, the compiled DB and transitive runtime
   dependencies, with no links escaping `/out`.
4. `runtime`: start again from the pinned Node image, copy only `/out` to `/app`
   with `node` ownership, set `USER node`, and execute
   `CMD ["node", "--enable-source-maps", "dist/server.js"]`. Use port 3000 and
   container bind `0.0.0.0`. No pnpm/Turbo/tsx/compiler or repository bind mount
   is required to start this image.

The production dependency graph is packaged by pnpm rather than copying host
`node_modules` or workspace symlinks. The pnpm documentation says deploy includes
workspace dependencies in portable output and no longer requires injected
workspace dependencies since 12.2.0; retain 12.15.0 without changing workspace
injection policy. Prove its actual output during implementation before claiming
the image is self-contained. Multi-stage packaging keeps build tools out of the
final application stage. [pnpm deploy](https://pnpm.io/cli/deploy),
[Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

Add root `.dockerignore` exclusions for `.git`, `.context`, host dependencies,
generated `dist`, Turbo/test caches, logs, and local environment files including
`.env.compose`. Copy only required workspace inputs explicitly. Never copy the
host Doppler directory or credentials into any stage. The tooling Dockerfile
retains its existing `docker/` context and responsibilities.
[Docker build context](https://docs.docker.com/build/concepts/context/#dockerignore-files).

### Compose and launcher ownership

Add `compose.api.yaml` with `api` (runtime image, profile `api`) and `api-dev`
(development image, profile `api-dev`). Use project-scoped tags
`${COMPOSE_PROJECT_NAME}-api:step4` and `${COMPOSE_PROJECT_NAME}-api:step4-dev`.
Both services join the existing project's default network and use `init: true`,
`restart: "no"` and a 15s stop grace period, longer than the API's 10s deadline.
The runtime service has no source/dependency volumes. Only api-dev reuses the
five tooling volume definitions; add no new persistent storage.

The runtime service publishes `127.0.0.1:${API_HOST_PORT:-3000}:3000`. Give it a
Node-based `/health/ready` healthcheck with a 7s HTTP abort, 8s Docker timeout,
2s interval, 5s start period and three retries; it needs no curl installation
inside the image. Explicit DB startup remains the database launcher's job.
`api.sh start` uses `--no-deps --no-build --pull never --wait --wait-timeout 30`;
an unready/failed owned startup returns nonzero and removes its failed API
container, preserving the database and other running resources. Reject an
already-running API rather than replacing it implicitly. For dev Compose run,
publish loopback explicitly because `run` does not inherit service publication.
[Compose run](https://docs.docker.com/reference/cli/docker/compose/run/).

`scripts/api.sh` owns these host commands: `build`, `dev TARGET`, `start TARGET`,
`logs`, `stop` and `verify test`. Its Compose invocations use explicit project
and file arguments, disable env-file loading, and never run through Turbo or a
container-mounted Docker socket. `build` builds both image targets without
Doppler; it allows the existing 600s build bound. `dev` is foreground, `start`
is detached with bounded readiness, and `logs`/`stop` require no secret fetch.

Extend `scripts/database.sh` with a narrowly validated API callback operation
that supplies the existing selected-target tuple to host `api.sh`; do not route
the built API back through `tooling.sh _run-db`. Reuse project/config/password
validation and the existing Doppler fetch block, rather than adding another
secret-fetch implementation. Keep the tooling runner for dependency maintenance
and tests. In particular, built start executes the API image's Node CMD rather
than calling root `pnpm start` inside the tooling image.

| Input | Source, precedence and consumer |
| --- | --- |
| Compose project | Explicit unique checkout setting. Propose `storage-minis-topeka` for this checkout; verify it is unused before creating resources. |
| DB target/config | Explicit `dev` or `test`, matching Doppler project `storage-minis` and config of the same name. |
| DB password | Existing managed `POSTGRES_PASSWORD` or `POSTGRES_TEST_PASSWORD` only; no new Doppler keys or account mutation required. |
| DB components | Generate `DB_TARGET`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` exactly as Step 3A. Ambient connection values never override them. |
| `API_HOST_PORT` | Nonsecret checkout override, default 3000 for start/dev; validate 1–65535 before Doppler/Docker. Host loopback publication only. Fail on collision; do not choose another port. |
| `API_VERIFY_HOST_PORT` | Optional nonsecret verifier-only port, validated with the same bounds. If absent, deliberately request a Docker-assigned loopback port. Do not inherit `API_HOST_PORT` into this choice. |
| `HOST` / `PORT` | API launcher sets container `0.0.0.0` / `3000`. Host publication and process bind address are distinct. Direct Node defaults remain loopback/3000. |
| `LOG_LEVEL` | Explicit nonsecret launcher override, default `info`; validate before launch and again at process entry. |
| `NODE_ENV` / `TZ` | Development uses `development`, isolated tests use `test`, and built runtime defaults to `production`; `TZ=UTC`. These flags do not choose production infrastructure. |

Ordinary DB process tests use `run-db test` without publishing a host API port.
Pass only required variables by name to Docker and only to actual runtime/live
Turbo tasks. Do not forward credentials to the DB compiler watcher, finite
builds or unit tests. Do not place secret values in arguments, files or logs.
Keep `.env` loading disabled, selected-key-only fetching, dedicated host browser
login, 10s Doppler request timeout/one attempt and `--no-fallback` behavior.
Do not forward Doppler credentials into the container. A failure to fetch must
prevent process startup. These inherited choices follow the
[Doppler launch contract](../technical/local-development.md#doppler-host-setup-and-verification).

The existing Doppler wrapper suppresses its stderr, which also hides child
stderr. For the API callback, redirect validated payload stderr into its stdout
inside the payload shell before executing the child. This preserves sanitized
API startup diagnostics while retaining suppression of Doppler's own errors.
Test these streams explicitly; do not print raw upstream diagnostics to recover
application visibility.

Changing Doppler values requires stopping and relaunching the outer command.
Automatic source reload reuses the launch environment; it does not refetch
secrets. Password rotation does not change an initialized PostgreSQL volume;
use the existing documented credential procedure. The foreground API launcher
reuses the named-container signal-forwarding approach and removes only its own
invocation. Verify the dev Doppler/shell/Compose/pnpm/Turbo/Node chain and the
built container's direct Node signal path separately.

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
| Host API lifecycle | `./scripts/api.sh build`, `dev dev`, `start dev`, `logs`, `stop`. |
| Host API smoke | `./scripts/api.sh verify test`; invokes `scripts/verify-api.sh` against the runtime image. |

The root/package Node commands remain available for tooling and process checks.
User-facing local runtime commands use `api.sh start`; the API image's Node CMD
does not invoke Turbo, build the source or install dependencies at startup.
`api.sh dev` runs the root dev command in the API development service.

Node watch observes imported modules, including the compiled DB dependency;
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

1. Record approved P4 decisions, date/rationale and the limited Step 3B prerequisite
   clarification in technical direction/the guide. Recheck remote main and merged
   predecessor. Keep the current branch name unless the owner instructs otherwise.
2. Once Docker is running, inspect resource ownership, choose unused checkout
   project/host ports, build the existing tooling image and initialize only this
   checkout's volumes. Do not reuse another worktree's project or reset its data.
3. Add API dependencies through container pnpm, inspect transitive/build-script
   changes, and verify frozen installation. Unexpected compatibility or install
   policy changes require a concrete follow-up recommendation.
4. Add clean finite builds, workspace consumption and the minimum Turbo ordering
   needed for API source/configuration tests. Demonstrate compiled DB resolution.
5. Implement configuration, factory/health/logging, lifecycle and thin process
   entry with meaningful unit tests, including partial startup and closing races.
6. Add the approved API launcher and dev/start tasks; verify explicit injection,
   dedicated Dockerfile targets, portable runtime packaging, Compose services,
   loopback publication, watcher behavior and end-to-end signal delivery.
7. Add the guarded process-test runner and local runtime-image verifier. Run the
   Step 4 matrix and acceptance checklist, including host curl/browser access.
   Use the test DB for failure/timeout/shutdown experiments; development gets
   only an ordinary authenticated startup/health check.
8. Record actual commands/results and limitations, update setup references/current
   status and deliver one Step 4 PR when implementation is requested. Stop at its
   handoff; opening a PR grants no merge or next-step authorization.

## Verification matrix

All commands below are future implementation checks. None ran during this plan.
Existing Step 1–3A evidence is inherited as historical evidence, not a fresh pass.
The API process suite validates the exact test tuple before creating clients,
starting children or performing any cleanup. It uses no business tables, resets,
migrations, seeds or imports.

| Criterion/scenario | Check or command | Expected result, bound and cleanup |
| --- | --- | --- |
| Installation and strict compatibility | `tooling.sh run pnpm install --frozen-lockfile`; `tooling.sh run pnpm check --force` | Exact lockfile, unchanged strict source rules, meaningful API/DB unit tests and no relaxed empty-suite policy. Build/install attempts bounded to the existing 600s policy. |
| Imports/configuration | API unit tests through `pnpm test --project api-unit` after DB build | Imports without environment/network; missing, blank, invalid ports/levels/targets reject before resource creation; supplied secret sentinels absent from failures. |
| Factory/liveness/readiness | `app.inject()` unit tests | Live never invokes DB. Ready invokes current check, 200/503 bodies match contract, failure then success recovers, closing prevents a healthy ready result. Always `app.close()` in cleanup. |
| Logger/framework errors | Unit tests with captured logger output and secret sentinels in URL, headers/body/cause | No sentinel, stack, raw URL or supplied request ID; safe unmatched/error responses, malformed JSON 400 and oversized body 413. |
| Partial acquisition / Step 5 seam | Lifecycle tests: factory/registration failure, callback DB identity, readiness rejection, listen rejection, close rejection and signal during pending startup | Callback receives the one owned DB before readiness/listen; every acquired resource closes once, pool close still runs after HTTP close failure, no listen after cancellation. |
| Built Node consumption | `tooling.sh run pnpm build`; guarded `run-db test pnpm test:api` | Harness spawns `node --enable-source-maps dist/server.js` directly with no loader. Runtime resolves compiled DB, answers real HTTP and releases its listener/pool. |
| Self-contained API image | `api.sh build`; `DOPPLER_CONFIG=test api.sh verify test`; inspect runtime image/package files | Runtime has Fastify/Zod/compiled DB and self-contained production dependencies; Node runs as `node`, without TS tooling, source/dependency mounts or an install at startup. No secret/local environment files or dangling workspace links enter the image. |
| Automated local smoke | `DOPPLER_CONFIG=test ./scripts/api.sh verify test`, repeated unchanged | Actual runtime image is launched each time; owned host HTTP returns exact live/ready bodies, TERM exits cleanly, temporary container is removed. Deliberately invalid credentials cause nonzero exit and the same cleanup, never cached success. |
| Startup invalid credentials/config/unavailable DB | Guarded process suite with fixture environment and outer timeout | Nonzero sanitized failure, no startup-success marker or surviving child. Startup/failure cleanup at most 17s plus test scheduling margin. Do not mutate managed Doppler values. |
| Occupied application port | Harness owns an explicit competing listener inside the test container | API bind fails; harness never accepts a response from that listener as API readiness. Original listener remains under harness ownership until cleanup. |
| SIGINT and SIGTERM | Built children, API runtime container and full outer `api.sh dev` invocation checks | In-flight bounded diagnostic request drains, pool closes, no child/listener/container remains; conventional process signal code on success, 1 on cleanup failure. API cleanup at most 10s; allow 5s outer launcher overhead. |
| Repeated signal/startup interruption | Unit and process checks | One close path; no listener opens after interruption and no later callback resurrects resources. |
| Hung cleanup | Subprocess fixture with intentionally unresolved close hook | Watchdog terminates nonzero within 10s plus scheduling margin; child resources released by process exit. No test-runner force-exit can conceal a lingering API child. |
| Real DB readiness failure and recovery | Test-only connection disruption/recovery using an owned DB client, then fresh HTTP probes | Live remains 200; ready becomes 503 within the inherited 6s DB budget plus HTTP scheduling margin, then 200 after recovery. Reuse Step 3A socket-termination technique; close admin client and API child. |
| Actual service outage/restart | Controlled `database.sh stop test`, then matching `DOPPLER_CONFIG=test database.sh up test`, with API running against test | Ready 503 during outage, live 200, ready recovers after test startup. Test tmpfs loss is intentional; no test run may be concurrent. Do not stop/reset development. |
| Correct target and process-test isolation | `DOPPLER_CONFIG=test tooling.sh run-db test pnpm test:api`; reject dev/mixed tuples | Dedicated suite passes only against `postgres_test/storage_minis_test`; test launcher/config both reject development before any connection. `pnpm check` remains offline. |
| Doppler and precedence | Existing launch fixtures extended for the API callback; real missing-access/wrong-config checks when credentials exist | Mismatch/missing login/key/outage fail before payload; `.env`, ambient passwords/URLs and unrelated managed keys do not reach process. No fallback file created; special-character fixture password preserved by named injection. |
| Publication | `API_HOST_PORT=3001 ./scripts/api.sh start dev` and Docker binding inspection | Only host `127.0.0.1:3001` maps to container 3000. Occupied host port fails before usable API; unrelated `run`/`run-db` commands publish none. Remove only owned invocation. |
| Watcher handoff | `./scripts/api.sh dev dev`; temporary API and DB source edits from host | API development image runs the watchers. DB finite build precedes watchers; API edits reload; DB edits emit JS and reload the dependent API. Observe changed behavior/new generated PID, not just watcher output. Restore source byte for byte. |
| Watcher limits | Temporary DB compile error, rapid successive valid edits, dev TERM/INT | Error visible and no mistaken claim current code passed; correction rebuilds/reloads. No restart kills a legitimate >5s drain before the API's 10s deadline. Children close on outer signal. Restore source and stop watchers. |
| Turbo graph/caches | `pnpm check --dry=json`; forced build/check then unchanged repeat | Actual dependencies, no recursive orchestration or persistent finite prerequisite; cache reused for finite unchanged work. Live tests/start/dev stay uncached. |
| Artifact/source invalidation | Remove generated `dist` only while watchers stopped; repeat build; temporary DB implementation/type edit | Cache restores both declared outputs; DB changes invalidate API build/typecheck/root unit tests and lint. Compiler error prevents dependent success; deleted source leaves no stale finite-build output. Restore fixtures. |

Use 30s per process test and 10s hooks, with a 180s suite supervisor deadline and
an additional bounded child-termination cleanup path. Run process tests serially;
reserve distinct ports per child, capture output in memory with a size bound and
close owned sockets/clients/children in `finally`. Avoid tests that bind an
unreserved port and then probe whichever service answers. After the suite, run
ordinary DB checks as needed to confirm the fixture did not leave clients active.
If a daemon-level outage prevents recovery, record it as failed/deferred evidence
and preserve development storage; do not claim a pass or reset data to hide it.

## Local verification delivered by Step 4

These commands are part of the implementation's required README quickstart;
they do not exist yet. Running Docker Desktop and the documented dedicated
Doppler login/configs/passwords are prerequisites. Runtime build/start requires
neither host Node/pnpm nor initialized tooling dependency volumes. From the root:

```sh
export COMPOSE_PROJECT_NAME=storage-minis-topeka
export DOPPLER_PROJECT=storage-minis
export DOPPLER_CONFIG=dev
export TOOLING_DOPPLER_BIN=/opt/homebrew/bin/doppler
export API_HOST_PORT=3000
unset DOPPLER_TOKEN

./scripts/api.sh build
./scripts/database.sh up dev
./scripts/api.sh start dev
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

The same URLs can be opened in a browser. If `API_HOST_PORT` changes, use that
explicit port in the URLs. `api.sh start` reports readiness failure rather than
treating a created container as success. `./scripts/api.sh logs` follows safe API
logs; interrupting the log viewer leaves the API running.

Automated proof uses the actual runtime image, with the separate test DB already
started. It can run while the normal development API remains on port 3000:

```sh
DOPPLER_CONFIG=test ./scripts/database.sh up test
DOPPLER_CONFIG=test ./scripts/api.sh verify test
./scripts/database.sh stop test
```

`verify test` requires the exact test tuple and invokes `scripts/verify-api.sh`
on the host. It launches a uniquely named container from the built runtime image
on the same Compose network, with no source/dependency volumes. Without an
explicit `API_VERIFY_HOST_PORT`, request a Docker-assigned loopback host
port, discover it from that owned container, and assert its image ID and running
state before probing. This intentional isolated port is not collision fallback.
The script uses the existing host `/usr/bin/curl` (confirmed present; no host
tool installation) with bounded requests and exact status/body assertions.
An explicit `API_VERIFY_HOST_PORT` must fail on collision. The usual exported
`API_HOST_PORT=3000` does not prevent an isolated smoke run alongside that API.

Give readiness polling 30s, each HTTP request at most 8s, signal cleanup 10s plus
5s Docker overhead, and the whole smoke operation at most 60s. Send SIGTERM,
capture the exit outcome and remove the owned container in a trap on every
success/failure/interruption path; use forced removal only after its cleanup
deadline. No unrelated API or database is stopped. Print image/container
identity and assertion results without environment contents. Exit 0 only after
health and shutdown assertions pass; failure exits nonzero. This bounded
health-only smoke is required in Step 4; Step 6 will extend it with tRPC checks.

For live editing, stop the built API, initialize this checkout's tooling volumes
and dependencies, then run the API development image:

```sh
./scripts/api.sh stop
./scripts/tooling.sh build
./scripts/tooling.sh init
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/tooling.sh run pnpm check
./scripts/api.sh dev dev
```

Stop foreground dev before clean builds. For the complete process-test suite,
after the volume/dependency setup and with test PostgreSQL available, use
`DOPPLER_CONFIG=test ./scripts/tooling.sh run-db test pnpm test:api`. The quick
image smoke and the broader process suite are separate required evidence.
`api.sh stop` stops/removes only this project's built API container, preserving
both database storage and tooling volumes; a source edit requires rebuilding
the runtime image before built-mode results represent the changed source.

Use distinct available `POSTGRES_PORT`/`POSTGRES_TEST_PORT` for this checkout if
another project owns 5433/5434; inspect before startup. Do not arbitrarily reuse
the historical `storage-minis-beijing` resources. Stop only resources started for
verification, using the existing lifecycle commands; preserve development and
tooling volumes. No global prune or destructive reset is part of Step 4.

## Handoff, documentation and approval

Implementation would change API source/tests/configuration and manifest, root
scripts/lockfile/Turbo, DB package build/dev/files settings, the selected-target
host launcher, and add the API Dockerfile/Compose/ignore/lifecycle/smoke files.
Keep the tooling Dockerfile, Compose DB definitions and DB runtime factory.
Update README/local-development with actual commands, variable
inventory, watch limitations, logs and failure cleanup. Update AGENTS.md's
current-state/command guidance using its writing skill when that edit is made.
Record approved choices in technical direction and observed results in a new
`docs/technical/step-4-verification-<implementation-date>.md`; then update the
guide's Step 4 row with the PR/evidence link and actual completion status.

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
| Step 6: built-process smoke and shutdown | API runtime image, exact health responses, direct Node CMD, guarded process suite and `api.sh verify test` with owned-container cleanup. | Extend the existing smoke with valid/invalid tRPC requests and final failure/redaction scenarios rather than inventing another server lifecycle. |
| Step 6: isolated PostgreSQL tests | Explicit test tuple guards, separate process/unit commands and known 6s check/10s shutdown limits. | Consolidate cross-package integration evidence and any remaining cleanup/injection cases; real schema/business tests stay gated. |
| Step 6: repeatable clean setup and caches | Image build/dependency packaging, documented local workflow, offline checks and declared finite/persistent task graph. | Reproduce the complete Steps 1–5 setup from a clean checkout and verify integrated cache/artifact restoration and failure propagation. |
| Step 6: setup diagnostics and limitations | README local verification, logs/stop commands, image identity, acceptance results and explicit deferrals. | Publish final consolidated evidence and outstanding T06/business/operations limitations. |

The owner-required API image is an additional Step 4 deliverable; its packaging
and health smoke cannot be postponed to Step 6. Step 5 adds transport/routes to
this image, and Step 6 extends verification of that same application artifact.
Neither successor must rebuild pool ownership, the listener, local startup or
Docker packaging merely to begin its assigned work.

Deferred acceptance remains explicit: Step 3B schema/replay, T01/T03 business
integrity and concurrency, T02 authorization/bootstrap, T04 operations, and
T06's global Product reuse/private-data rejection, atomic business rollback,
funding/deletion races, frontend/browser and CI outputs. Health and process tests
do not establish those requirements or justify closing #26.

**Approval requested:** P4-01's limited prerequisite clarification and P4-02–P4-11
as the concrete Step 4 implementation scope, incorporating the owner's API-image,
acceptance and local-verification requirements. The repository's
[approval rule](../../AGENTS.md#owner-approval-before-decisions) says, “Wait for
explicit approval before installing, adopting, configuring, or implementing the
proposed choice.” Planning is complete; implementation remains pending that
approval and Docker runtime availability.

Planning validation: live issue/PR state and native #26 blockers were inspected;
package metadata and pinned upstream watch/server implementations were read.
Changed local links/anchors, Markdown fences/table delimiters, whitespace and
`git diff --check` passed. No dependencies were installed, containers started,
secrets fetched, tests run or application/configuration files changed.
