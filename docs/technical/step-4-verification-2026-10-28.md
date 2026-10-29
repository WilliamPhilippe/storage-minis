# Step 4 — cumulative implementation verification

This record starts on **2026-10-28** (America/Maceio) and is reused across
sessions. Follow the [stage guide](../plans/step-4-fastify-implementation-stages-2026-10-28.md)
and [parent contract](../plans/step-4-fastify-plan-2026-10-28.md).
Stage completion is distinct from full Step 4 acceptance.

## Stage 4.11 — Cache verification, documentation and final handoff

**State: complete. Overall Step 4: complete.** Required checks and all eighteen
acceptance criteria passed on 2026-10-29 (America/Maceio), including authorized
implementation evidence on [PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107).
Completion commit subject: `docs(api): complete Fastify foundation verification and handoff`.
Resolve its actual hash through Git history; this avoids a self-referential commit.
The initial checkpoint and history below preserve earlier in-progress states.

### Initial checkpoint

- Checkout `/Users/william/Documents/code/storage-minis`; verified branch
  `WilliamPhilippe/step-4-implementation-plan`, base `d051a5a`; initial tree clean.
- Read AGENTS.md, stage execution/completion/checkpoint rules and 4.11 card,
  foundation execution rules/Step 4/5/6 contracts, parent task graph and all
  AC4-01–18. Progress table locates this cumulative record. Stages 4.1–4.10
  completion commits exist in history; inspect their source/image/environment
  identities before reusing results.
- Assigned scope: real task discovery, finite cache reuse/restoration/source
  invalidation, uncached live proof, final aggregate milestone, current setup/
  approval summaries and Step 5/6 handoff. No new dependency/configuration or
  business/auth/production/CI choice is approved by this assignment.
- Preserve `.env.compose` (`storage-minis-beijing`, ports 5433/5434), owner data,
  named volumes, historical records and unrelated work. No live resource or
  temporary source mutation has been started in this stage.
- Next: inspect current Docker/source identities, predecessor handoffs and live
  T06/existing PR; establish recorded delivery authorization. Checkpoint before
  temporary fixtures/live work; request approval for uncovered choices. Then
  execute existing approved checks, reconcile all eighteen criteria and update
  current summaries. Keep 4.11 in progress if required PR evidence is unmet;
  do not push, change PRs or start Step 5 without existing authorization.

### Checkpoint history

- Discovery passed: 16 implemented tasks across root/API/DB. Both builds declare
  `dist/**`; finite consumers depend on DB build; dev/start are persistent and
  uncached, process/integration/DB live commands are uncached. No finite task
  depends on a watcher. Aggregate dry run has seven real tasks.
- Forced `./scripts/tooling.sh run pnpm check --force --summarize` passed all
  seven tasks, 109 tests / 12 files, 53.722s. Unchanged repeat is recorded next.
- Current Docker identities match predecessor runtime `48aa5486d3e6`, dev
  `fc2c235b0878`, tooling `9654ab9e6cd6`; only original stopped DBs remain.
  Runtime modules/schema/lockfile match 4.4 (test-only additions excluded);
  Dockerfile/Compose/launch/smoke/task inputs match final 4.8. Reuse actual image,
  reload, outage, security, schema and shutdown scenarios where unchanged.
- Live T06 remains open with no comments and unchanged dependencies; PR #107
  is open at `d051a5a`, with planning-only title/body and no comments/reviews.
  Earlier authorization to push the seven planning docs did not authorize this
  stage's delivery. Prepare concrete local PR evidence; AC4-18 cannot complete
  without authorized update of the existing PR.
- Before temporary cache experiments: no watchers/live consumers. Use existing
  approved native Turbo/Node checks; inventory both dist trees, delete only those
  generated outputs, rebuild and compare hashes. Temporarily append an exported
  number/type fixture to DB index, verify consumer hashes/reexecution, then an
  intentional TS2322 fixture to verify build failure blocks the API. Back up
  original bytes in memory and restore in finally, then restore finite outputs.
  No live command runs while sources are altered. No persistent code/config choice.
  Next: cache restoration/invalidation, then sequential bounded test DB checks.

- Cache experiment: forced/repeated builds passed; after deleting both dist trees,
  both builds were cache hits and all 40 generated file hashes matched. DB source
  edit changed DB/API build, API typecheck, root lint/test hashes; all eight
  combined tasks executed. Seven passed, but one deadline assertion failed:
  `verify-api.test.ts` observed Date.now elapsed 614491ms while Vitest reported
  20325ms for that case (whole suite 42.98s, Turbo wall 10m38s). This suggests a
  host/VM clock discontinuity or suspension; it is not passing deadline evidence.
  No test threshold or implementation will change. Finally restored original
  index bytes and all 40 output hashes; no live consumer existed.
- Next temporary run uses a fresh fixture value and separate ignored logs under
  `.turbo/stage411-retry` to demonstrate invalidation/reexecution again, rerun the
  affected deadline case via the aggregate, and verify compiler failure blocks
  API build. Keep the same finally restoration and no-live-work boundary.

- Retry preflight hit a harness-only JSON parse failure: Turbo printed its
  telemetry notice on stderr after dry-run JSON. No source mutation occurred;
  finally still verified original outputs. Parse only the JSON object and retry;
  application/task/test policy remains unchanged.

- Source-invalidation retry passed eight tasks (all MISS/executed), 109 tests,
  53.5s, summary `3LMMNOpCVojBOnWdsZDz5QPGlvC`. Intentional TS2322 build returned
  1 with only the DB task executed (API blocked), summary
  `3LMMNRNSCjOUnIvdvJcggzVdVMm`. Finally restored original source bytes and all
  40 output hashes via two original cache hits (`3LMMNSW7WB9OXUBcI438DzlTBKJ`).
  Earlier deadline failure has passing affected evidence without relaxed checks.
- Before live work: sources restored; no watcher/process/schema/smoke consumer.
  Original test `dde80d86c88f` and development `7d69a3e26bab` are stopped. Next
  audit runtime image compiled files offline against restored dist, then own
  test startup → SQL identity/zero-clients → two uncached DB checks → one image
  smoke → SQL identity/zero-clients → native test stop in finally. Startup outer
  90s, DB commands 45s, smoke 65s, SQL 30s, stop 20s. Preserve development,
  image IDs, all six volumes/settings and initial stopped DB state. Reuse prior
  failure/reload/outage/native-shutdown scenarios: relevant source/image/task/
  environment inputs are unchanged; this phase verifies the final artifact and
  live uncached execution after restoration, not a new date for every scenario.

- Final exact aggregate passed seven tasks / 109 tests, 52.113s, with current
  final implementation and setup/handoff documentation. Real 30s deadline case
  passed at 29944ms; the earlier discontinuity-like result has no unresolved
  acceptance failure. Documentation gate passed eight Markdown files, 41 changed
  links/anchors, 69 tables and fences; `git diff --check` passed.
- Final resource audit was first attempted while the aggregate’s owned tooling
  container still ran; its no-running-container assertion correctly refused that
  premature inventory. After the aggregate exited, repeat audit passed: exactly
  two original stopped DB containers, six expected volumes with original ownership/
  creation identities, unchanged three image IDs/nonroot commands and saved
  settings. No live consumer, temporary source edit, listener or cleanup remains.
- Only AC4-18 is unmet. Prepared concrete PR title
  `feat(api): deliver Fastify server foundation` and body at
  `/private/tmp/storage-minis-stage411-pr.md`; no remote mutation has occurred.
  Next obtain owner delivery authorization; until then leave this stage/Step 4
  in progress and all eight stage documents uncommitted. No later step started.

### Final reconciliation (2026-10-29, America/Maceio)

**Stage 4.11: complete. Overall Step 4: complete.** AC4-12 and AC4-16 have
passing local evidence; AC4-18 has the owner-authorized implementation title/body
on existing [PR #107](https://github.com/WilliamPhilippe/storage-minis/pull/107).
The fetched remote title/body and branch match the prepared evidence exactly.
All eighteen criteria are complete; Steps 5/6 and full T06 remain separate.

Predecessor completion commits verified in this branch’s history:
`472e0a7` (4.1), `29509a3` (4.2), `230a348` (4.3), `2510bdd` (4.4),
`4fd7856` (4.5), `f92a8ed` (4.6), `0ac5a74` (4.7), `78078f6` (4.8),
`b2a4a81` (4.9), `d051a5a` (4.10). Existing choices cover this stage’s
verification; no package, lockfile, task, environment contract or runtime code
changed. The only tracked changes are eight necessary current documentation files.

| Check / exact entry point | Result |
| --- | --- |
| `./scripts/tooling.sh run pnpm check --dry=json` | Seven actual aggregate tasks; DB build precedes API/DB typecheck and root lint/unit tests. |
| `./scripts/tooling.sh run pnpm exec turbo run build typecheck typecheck:root lint format:check test dev start test:process test:integration db:check db:generate db:migrate --dry=json` | 16 implemented tasks; both builds declare `dist/**`, no finite task depends on persistent work, all persistent/live tasks uncached with narrow environment declarations. |
| `./scripts/tooling.sh run pnpm check --force --summarize`, then unchanged `pnpm check --summarize` through the same launcher | Seven tasks / 109 tests passed, 53.722s; unchanged repeat 7/7 HIT, 34ms. Summaries `3LMJsQIhO6pVapOeSDnJWoG4VoS`, `3LMJuo1JGsSiqd7w2COolKgFllP`. |
| `./scripts/tooling.sh run node --input-type=module < /private/tmp/storage-minis-stage411-cache.mjs` | Forced builds then unchanged 2/2 HIT. Deleted both dist trees with watchers stopped; next build 2/2 HIT restored all 40 file names/content hashes, including API maps and full DB schema declarations. Restoration summary `3LMK2WrDO1IpxKnFCX24KTkH20n`. Initial source-unit deadline failure is retained above. |
| `./scripts/tooling.sh run node --input-type=module < /private/tmp/storage-minis-stage411-cache-retry.mjs` | Temporary DB implementation/type export changed DB/API build, API typecheck, root lint/test hashes. Eight tasks executed as MISS; strict types/lint/format and all 109 tests passed. Deliberate TS2322 returned 1 before API build. Finally restored original source and all 40 original output hashes using two cache hits. |
| `python3 /private/tmp/storage-minis-stage411-live.py` | Runtime image’s 40 compiled file hashes equal restored current dist. Test startup → independent SQL → two DB checks → image smoke → independent SQL → native stop, exclusive and sequential, all passed. |
| `./scripts/tooling.sh run-db test pnpm db:check --summarize` twice | Same hash `a2758726d8fffdee`, both `cache bypass, force executing`; actual authenticated checks ran again (395ms/374ms Turbo, 1.368s/1.339s host). Finite build prerequisites reused. Summaries `3LMMW2PtJfOvlZ7hVhmATHiwGNV`, `3LMMWNj6clg039Jf9OI4OOlmBbr`. |
| `./scripts/database.sh api-verify test` | Final unchanged image success in 1.592s: exact host live/ready 200, TERM 143, owned probe removed. Container `0e5c3166ec56e88b72288ea79108c4b46ae448ced33b6a52e4d079def36f631e`, loopback port 55000. |
| `./scripts/database.sh psql test -At -c "SELECT current_database(), current_user, current_setting('TimeZone'); SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('public','drizzle'); SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid();"` before/after live checks | `storage_minis_test / postgres / UTC`, zero public/drizzle tables and zero other clients both times; no migration or business write. |
| `./scripts/tooling.sh run pnpm test --project api-unit stage411-no-such-test` | Expected exit 1, “No test files found”; normal empty-suite refusal preserved. |
| Final `./scripts/tooling.sh run pnpm check` and documentation/diff gate | Passed seven tasks, 109 tests / 12 files, 52.113s (three valid package cache hits). The affected real readiness deadline passed at 29944ms. Eight Markdown files, 41 changed relative links/anchors, 69 tables, paired fences, all eighteen criteria (17 complete) and `git diff --check` passed. |

Ignored local reports are under `.turbo/runs/` and `.turbo/stage411{,-retry}/`;
nonsecret host harnesses/logs are under `/private/tmp/storage-minis-*411*`.
These are verification artifacts, not new installed tooling or committed code.
Their source/output restoration and actual command assertions are described above
so later checks can reproduce the proof with existing native tools.

### Evidence identity and reuse

Current runtime image/index:
`sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`,
config `sha256:8b7a7d6fc7eb7f4aa2d6f3f2790f3986423b0972a361c6061fd87df3601a9320`.
Development index `sha256:fc2c235b087810fb2fa8909d3747e2e7b7b8c4721c82cb43bf4925958eb26ca0`;
tooling `sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`.
Node 24.22.1, pnpm 12.15.0, Turbo 2.11.10, Docker 29.9.2, Compose 5.6.1;
verified platform is Docker Desktop Linux/arm64 on this macOS checkout.

Runtime API modules, DB implementation/config/index/schema, migrations, DB
integration tests/scripts and lockfile have no diff from `2510bdd`. Dockerfile,
ignore rules, canonical Compose, launchers, smoke, manifests and Turbo have no
diff from final 4.8 `78078f6`. Image compiled bytes match current dist directly.
Accordingly reuse 4.4’s 30-test PostgreSQL replay/constraint/lifecycle phase,
4.5/4.6 packaging/security/publication proof, 4.7 API/compiled-schema reload and
signals, 4.8 full smoke failure/security/deadline matrix, 4.9 same-process socket/
service outage/recovery/unmigrated readiness, and 4.10’s current 25-process-case
startup/shutdown/watchdog and native stop/down/volume-isolation evidence.
No affected production input changed, so replaying every scenario adds no missing
coverage. Stage 4.11 repeated only the final artifact/uncached success integration
and affected source-invalidation/deadline evidence. Further relevant changes must
rerun their affected proof; documentation dates alone do not invalidate it.

Final live inventory equals the initial container identity set: stopped development
`7d69a3e26bab`, stopped test `dde80d86c88f`; no API/probe/watcher/SQL controller
remains. `.env.compose` bytes/project/ports are preserved. Test tmpfs loss on stop
is intentional; owner development never started or reset. Final six-volume
ownership/creation and nonroot image metadata audit passed after the aggregate. No fixture source remains.

### AC4-01–18 reconciliation

| Criterion | State | Actual evidence / remaining obligation |
| --- | --- | --- |
| AC4-01 | Complete | 4.5/4.6 portable nonroot image and authenticated native startup; final 4.11 byte identity/smoke. |
| AC4-02 | Complete | 4.7 API/DB/schema reload, error/correction, rapid saves and signal drain; unchanged dev image/model. |
| AC4-03 | Complete | 4.2 import/factory/injection ownership; current 109-unit aggregate. |
| AC4-04 | Complete | 4.3 same-owned-DB registration before listen and failure cleanup; current lifecycle units. |
| AC4-05 | Complete | 4.1 config units, 4.4 guarded process failures and current strict/unit checks. |
| AC4-06 | Complete | 4.9 exact live 200 through socket/service outage without API restart. |
| AC4-07 | Complete | 4.9 bounded ready 503/recovery with unchanged API and unmigrated DB; final authenticated zero-table proof. |
| AC4-08 | Complete | 4.4 startup config/credential/unavailable/occupied-port checks; inherited by 4.10’s 25-case run. |
| AC4-09 | Complete | 4.10 real repeated signals/startup cancellation/failed and hung close, 10s/17s watchdogs and native project drain. |
| AC4-10 | Complete | 4.2 HTTP/framework/log sentinels plus current 109 units. |
| AC4-11 | Complete | 4.1 clean ESM/declarations, 4.5 portable schema/type package; 4.11 all 40 compiled files match runtime image. |
| AC4-12 | Complete | 4.11 real task graph, 7/7 check cache reuse, 2/2 build reuse/output restoration, source invalidation and failed dependency propagation; repeated live check remains uncached. |
| AC4-13 | Complete | 4.6–4.8 selected-target Doppler refusal/redaction/precedence proof; final unchanged launcher/image smoke. |
| AC4-14 | Complete | 109 units, 4.10 25 guarded process cases and inherited schema suite; exact-target guards, empty-suite refusal and exclusive phase ownership. |
| AC4-15 | Complete | 4.8 full bounded smoke/failure/interruption matrix; final 4.11 success with confirmed removal. |
| AC4-16 | Complete | README Docker-only prerequisites, exact image/start/HTTP/log/stop/dev/test commands and local-development settings/failure/recovery/limits; commands backed by 4.6–4.11 actual proof. Final link/fence/table gate recorded below. |
| AC4-17 | Complete | 4.6 loopback/collision and 4.10 separate-project native stop/down/confirmed-delete isolation; final inventory unchanged. |
| AC4-18 | Complete | Owner explicitly approved push/PR update on 2026-10-29. Existing PR #107 now records all criteria, actual checks, setup/image identity and Step 5/6 contracts; fetched title/body/branch verified. |

### Step 5/6 handoff and limitations

- Step 5 receives `startLifecycle` with `LifecycleOptions.registerRoutes(app,
  database)` before readiness/listen, using the one owned full `Database`.
  `buildApp` receives only check/closing capabilities. Extend that callback for
  the actual Fastify tRPC adapter/context; preserve pool, listener, signals and
  safe HTTP boundaries. Add real HTTP input/output/unknown-procedure/parser/
  error tests and a type-only router export with emitted-browser-JS proof. No
  principal, Organization, authentication bypass or router contract is supplied.
- Step 6 extends the same runtime image and existing `verify-api.sh` with valid/
  invalid tRPC requests and adapter failure/redaction cases. Reproduce Steps 1–5
  from a clean checkout, reverify caches/artifacts/failure propagation after
  transport changes, and consolidate sequential DB/process/smoke evidence. It
  inherits the exact health, exit, deadlines, target guards and cleanup commands
  above; it does not need to invent a second process/container lifecycle.
- Step 3B’s schema/replay/constraint delivery is inherited, not full business
  acceptance. T01/T03 writers, exact allocation/overflow/period contracts,
  source reconciliation, business rollback/scope/races and T06’s Product-private
  data/deletion-funding cases remain deferred. T02 Firebase/session/bootstrap/
  Membership authorization, T04 production/secrets/backups/restore/operations,
  frontend/Playwright and CI remain under their existing owners. First development
  migration application stays an explicit owner action. No Step 5 work started.

**Delivery approval, 2026-10-29:** The owner answered “Approve push and PR update
(Recommended)” to the concrete title/body/same-branch proposal after local checks
passed. Updated existing PR #107 to `feat(api): deliver Fastify server foundation`
using the prepared body, then fetched and verified its exact title/body/branch.
The PR is attached to this chat. No merge, issue closure or Step 5 is authorized.
Current completion/approval summaries now agree in all eight stage documents;
dated checkpoints and earlier stage records retain their historical scope.

Final completion gate passed: all eight changed Markdown files, 45 changed
relative links/anchors, 69 tables, paired fences, all eighteen criteria/current
completion summaries and `git diff --check`. The final diff contains only those
eight assigned-stage documents, with no unrelated/source change. Completion-only
edits change no implementation/test/image/task input requiring new live scenarios. The final aggregate above already covers the restored final
implementation and completed setup/handoff content. Stage exactly the eight
changed documents, inspect the staged diff, execute the recorded Conventional
Commit, then push only `HEAD:WilliamPhilippe/step-4-implementation-plan`. Verify
remote PR head equals the resulting local commit and `git status --short` is
clean. Report hash/results/limitations and stop. Exact next action is owner review of
PR #107; foundation Step 5 planning requires the owner’s assignment and the
guide’s predecessor delivery gate. Do not start it here.

## Stage 4.10 — Shutdown through all project paths

**State: complete.** Required stage checks passed on 2026-10-29 (America/Maceio).
Overall Step 4 remains in progress; 4.11 is not started.
Completion commit subject: `test(api): verify bounded shutdown and project isolation`.
Resolve its hash with
`git log -1 --format=%H --grep="^test(api): verify bounded shutdown and project isolation$"`.

### Initial checkpoint (historical; state was in progress)

- Verified `git branch --show-current`: `WilliamPhilippe/step-4-implementation-plan`.
  Initial status/diff clean at `b2a4a81` (4.9 completion). Earlier stage commits:
  4.1 `472e0a7`, 4.2 `29509a3`, 4.3 `230a348`, 4.4 `2510bdd`,
  4.5 `4fd7856`, 4.6 `f92a8ed`, 4.7 `0ac5a74`, 4.8 `78078f6`.
  Their cumulative handoffs are present. Runtime/schema/lockfile and Compose
  inputs remain unchanged; inspect affected diffs before reusing their checks.
- Read AGENTS, README Docker/PostgreSQL/deletion guidance, stage execution and
  completion/checkpoint rules and 4.10 card, parent deadlines/grace/shutdown and
  isolation matrix, foundation guide, standard Compose maintenance and one-time
  setup amendment. Live T06 #26 remains open with no comments; no backlog change.
- Existing approval covers one owner, early handlers, idempotent cleanup,
  17s startup/10s total shutdown, failure 1 and signal 130/143, native 15s API
  grace, project-wide commands without global timeout and the volume guard.
  Concrete new shutdown child/container fixture choices await owner approval.
  No fixture code or live disruption has run.
- Initial Docker inventory (read-only, sandbox socket escalation succeeded):
  original `storage-minis-beijing-postgres-1` `7d69a3e26bab` and test
  `dde80d86c88f` both stopped; no running containers. All six Beijing volumes
  and default network remain, plus pre-existing anonymous volume
  `c6d7cdbbb7f749f9e264250206f404600ef6a2b6a8bc16d52a0379dfdd8e4807`.
  Runtime image `48aa5486d3e6`, dev `fc2c235b0878`, tooling `9654ab9e6cd6`.
  Saved settings/ports 5433/5434 unchanged. No stage-owned resource exists.
- Pending: approve fixtures; implement guarded startup/repeated-signal/failed and
  hung-cleanup/watchdog cases; run focused/strict/process checks sequentially;
  disposable API-only/full stop/down/guarded deletion and peer preservation;
  fixture cleanup and current-summary synchronization. AC4-09/17 remain partial.
- Exact next action: present concrete fixture choices with alternatives and
  obtain explicit owner approval before coding or creating disposable resources.
  No completion commit until required checks pass; no push/PR or 4.11 work.

### Checkpoint history

- Owner explicitly approved the recommended child/container fixtures in this
  session, before implementation/resource creation; recorded in technical
  direction. Added test-only `tests/fixtures/shutdown.ts` and process cases using
  the existing real-DB/port/child/pool ownership, unchanged suite supervisor and
  deadlines. Fixture imports compiled production modules; runtime source, images,
  schema, dependencies, Compose and reset guard are unchanged.
- Before focused checks: no live fixture, watcher or DB is running. Next format,
  strict-check and run focused shutdown/guard/unit tests through existing tooling;
  then checkpoint before starting exclusive test PostgreSQL/process verification.
  All original resources remain as inventoried. No temporary source edit exists.

- Initial strict API typecheck and two-file ESLint passed; Prettier applied to
  test sources. Unit/guard suite is finishing (owned one-off tooling only).
  Before real process experiments: start only Beijing `postgres_test` through
  `./scripts/database.sh up test` (90s outer); no schema/smoke/outage consumer may
  overlap. Run `./scripts/tooling.sh run-db test pnpm test:api` sequentially, with
  30s tests/10s hooks/180s suite supervisor; shutdown fixture children have 25s
  outer deadlines and 1s emergency kill. Their actual watchdogs remain 10s/17s.
  Owners register before spawn/listen/connect; after each case verify no pool or
  listener, after suite zero clients/schema identity. Finally stop only test
  with native 10s service grace, restoring its original stopped state. Development
  stays stopped and all storage/settings/images are preserved. Native teardown
  experiments follow only after the process phase fully releases this target.

- Focused checks passed: 109 API/DB unit tests (including seven reset-guard
  tests); strict API typecheck and two-file lint. Guarded real-DB process suite
  passed all 25 cases in 67.70s, with finite API build and uncached live task.
  Repeated INT/TERM drained at 6056/6044ms with 130/143, each close once; finite
  startup cancellation closed its late completion without listen. HTTP/DB close
  rejection exited 1 with both owners attempted. Hung HTTP/DB/startup cancellation
  exited 1 at 10038/10038/10040ms via application watchdog, no harness kill; the
  DB-hang case first drained 6s within the same total deadline. Startup watchdog
  exited 1 at 17304ms. Existing 16 startup/health/outage/basic-signal cases passed
  again; no pool/listener/schema leak. No application fix was required.
- Native host harness prepared under `/private/tmp`; initial syntax-only parse
  caught one unmatched parenthesis before execution, corrected and parse passed.
  No disposable resource or live native experiment yet. Next independent SQL
  inventory, stop only test back to initial state, then run native harness. It
  records exact resources/bounds before each experiment and cleans its projects
  even on failure; original images/application/source/config remain unchanged.

- Before disposable resources: native harness `/private/tmp/storage-minis-stage410-native.py`; project `storage-minis-stage410-20261029`, peer `storage-minis-stage410-20261029-peer`, reserved host ports `63729, 63730, 63731, 63732, 63733, 63734` (bind collision fails closed), fixture-only password in memory. Create temporary runtime/tooling tags from original images; canonical peer postgres owns its own pgdata sentinel. No managed credentials, image rebuild, fixture source edit or original project mutation. Each scenario checkpoints before shutdown; finally exact-confirmed guard cleans both projects and removes only new image tags. Never global prune/reset.

- Canonical model passed: default only postgres, both APIs 15s, api-dev SIGINT, all three real stop/down aliases and guard have no global timeout. Peer `3e3c048cae8196cea24496238c0d0838561e72d41285964302eb70fef701524a`, volume `storage-minis-stage410-20261029-peer_pgdata`, native identity/start captured and file sentinel installed; original Beijing services remain stopped. Next five native scenarios sequentially, restoring disposable project between cases.

- Before native **api-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy only test entry imports into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Actual missing/wrong guard confirmation refused with nonzero exit before teardown; same running disposable API `029708b895836922e274c13d3d5c8b4c8aedecd4502a074fc13ff8d66fd72be6` and container inventory. Seven offline guard tests cover every-candidate ownership/inspection refusal and native failure propagation.

- Native **api-stop** in-flight: API `029708b895836922e274c13d3d5c8b4c8aedecd4502a074fc13ff8d66fd72be6`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63731`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **api-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 stop api api-dev` client exit 0; separate docker-wait/die event API exit 143 in 6.022s, no OOM/SIGKILL. All six volumes preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **full-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy only test entry imports into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **full-stop** in-flight: API `6b75029ef1b4a1421dfdd2d536ad257c5706e6859f765ffa946007785a5d6053`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63731`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **full-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile * stop` client exit 0; separate docker-wait/die event API exit 143 in 6.015s, no OOM/SIGKILL. All six volumes preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **full-down**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy only test entry imports into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **full-down** in-flight: API `54d6487013091d266f122fa344791986f9c3fef32ba6d90c5a876baaa288f615`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63731`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **full-down PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile * down --remove-orphans` client exit 0; separate docker-wait/die event API exit 143 in 6.112s, no OOM/SIGKILL. All six volumes preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **guard-down**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy only test entry imports into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **guard-down** in-flight: API `9c06b5d686cea1d322db14e3534cee64edd75dfa00a18729a1f61c1586ef9f2b`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63731`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **guard-down PASS**: exact `200 {"drained":true}` survived; command `./scripts/reset-volumes.sh --confirm storage-minis-stage410-20261029` client exit 0; separate docker-wait/die event API exit 143 in 6.092s, no OOM/SIGKILL. Only disposable owned six volumes/containers/network deleted. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **hung-api-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy only test entry imports into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **hung-api-stop** in-flight: API `538ebfd2a44e54ab5ed5380cd5ab148c5caba424e897ce16f02b780415891a65`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63731`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **hung-api-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 stop api api-dev` client exit 0; separate docker-wait/die event API exit 1 in 10.225s, no OOM/SIGKILL. All six volumes preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Native final cleanup: both disposable projects have zero containers/volumes; exact-confirmed native guards succeeded, temporary image tags removed, original runtime image unchanged. Only original stopped Beijing DBs/settings/six volumes and unrelated anonymous volume remain. No watcher, API, SQL client, event/wait subscriber, host request or source fixture survives. Temporary copied entry is only under `/private/tmp/storage-minis-stage410`; no production delay route ships.

- All five first native runs passed, with disposable and peer resources fully
  removed. Final fixture review identified a clean-checkout typing dependency:
  static imports from API dist would require prior API build for no-emit checks.
  Within the approved test-entry scope, change to source-only type references
  and computed compiled-module runtime URLs. Native copy now retains the exact
  test path in the stopped container and a disposable JS entry imports that TS
  fixture via native Node, avoiding path rewriting. No production/config/task
  change. Before temporary ignored-output experiment: no watcher/resource is
  running; move only `apps/api/dist` to `.context/stage410-api-dist`, run API
  typecheck, and restore with shell EXIT trap. Never alter DB output or source.
  Rerun strict checks, process suite and native fixtures on final fixture inputs.

- Final source-typed/compiled-runtime fixture passes strict API typecheck with
  API dist absent; EXIT restoration succeeded, `.context` removed. Two-file lint
  passed again. Before reruns, both original DBs stopped, disposable resources
  absent. Native harness will also retain all six volume creation/ownership facts
  and a disposable pgdata file sentinel across ordinary stop/down; peer's separate
  data sentinel remains checked on every case. This strengthens preservation
  evidence without touching owner data. Next repeat process suite exclusively,
  independent SQL/stop, then final native fixture and image audit.

- Final fixture-input process rerun passed all 25 cases / 67.57s. Repeated
  INT/TERM each drained at 6047ms; HTTP/DB/startup-hang shutdown watchdogs exited
  1 at 10039/10037/10044ms; startup watchdog at 17331ms. No harness termination,
  schema/client/listener leak. Independent SQL again returned zero tables/other
  clients. Native test-only stop restored both original DBs to stopped state.
  Next final native rerun with exact-path typed fixture and volume data sentinel;
  existing 109 unit tests remain current (their inputs unchanged).

- Before disposable resources: native harness `/private/tmp/storage-minis-stage410-native.py`; project `storage-minis-stage410-20261029`, peer `storage-minis-stage410-20261029-peer`, reserved host ports `63860, 63861, 63862, 63863, 63864, 63865` (bind collision fails closed), fixture-only password in memory, disposable pgdata file sentinel for ordinary preservation proof. Create temporary runtime/tooling tags from original images; canonical peer postgres owns its own pgdata sentinel. No managed credentials, image rebuild, fixture source edit or original project mutation. Each scenario checkpoints before shutdown; finally exact-confirmed guard cleans both projects and removes only new image tags. Never global prune/reset.

- Canonical model passed: default only postgres, both APIs 15s, api-dev SIGINT, all three real stop/down aliases and guard have no global timeout. Peer `21aa75daf8e2ad1173fa5694d86bf84e477f5d6a121d8c4fd022ab68fabec956`, volume `storage-minis-stage410-20261029-peer_pgdata`, native identity/start captured and file sentinel installed; original Beijing services remain stopped. Next five native scenarios sequentially, restoring disposable project between cases.

- Before native **api-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy test fixture at its original path plus an importing entry into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Actual missing/wrong guard confirmation refused with nonzero exit before teardown; same running disposable API `6730ac1ef47a3da5dfb340bbf1b03d6948248654504850e934e4b1da878978d2` and container inventory. Seven offline guard tests cover every-candidate ownership/inspection refusal and native failure propagation.

- Native **api-stop** in-flight: API `6730ac1ef47a3da5dfb340bbf1b03d6948248654504850e934e4b1da878978d2`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63862`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **api-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 stop api api-dev` client exit 0; separate docker-wait/die event API exit 143 in 6.018s, no OOM/SIGKILL. All six volume names/creation times/labels and pgdata file sentinel preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **full-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy test fixture at its original path plus an importing entry into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Before final read-only image audit: use only new named
  `storage-minis-stage410-image-audit` with `--rm --network none --read-only`,
  original runtime image, Node/fs assertions and 20s outer bound. No ports,
  mounts, credentials, DB query or source edits; exit removes that owned probe.
  Assert original server has no fixture route/import and image has no tests or
  shutdown output. Final formatting runs offline through existing tooling.

- Native **full-stop** in-flight: API `e3530fc5d544ee52bf26c5183d6260a80a8192868510556f0aae68c19c7ba48c`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63862`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **full-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile * stop` client exit 0; separate docker-wait/die event API exit 143 in 5.998s, no OOM/SIGKILL. All six volume names/creation times/labels and pgdata file sentinel preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **full-down**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy test fixture at its original path plus an importing entry into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **full-down** in-flight: API `a90dfb57f942e876591c4834f3a9ea8e1541a32c02ab21158175906da0761b03`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63862`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **full-down PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile * down --remove-orphans` client exit 0; separate docker-wait/die event API exit 143 in 6.109s, no OOM/SIGKILL. All six volume names/creation times/labels and pgdata file sentinel preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **guard-down**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy test fixture at its original path plus an importing entry into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **guard-down** in-flight: API `dca06f10bea930aa84840bb7b6d104ff966fe63068f17451eca872a274f42e27`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63862`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **guard-down PASS**: exact `200 {"drained":true}` survived; command `./scripts/reset-volumes.sh --confirm storage-minis-stage410-20261029` client exit 0; separate docker-wait/die event API exit 143 in 6.121s, no OOM/SIGKILL. Only disposable owned six volumes/containers/network deleted. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Before native **hung-api-stop**: disposable project `storage-minis-stage410-20261029` owns six volumes; peer `storage-minis-stage410-20261029-peer` is running with its own pgdata sentinel. Exact bounds: startup 40s, host request 8s, native stop/down/guard 30s outer, API process 10s/service grace 15s. Next canonical create, copy test fixture at its original path plus an importing entry into stopped API writable layer, start, require exact health/owned request marker before shutdown. Finally native stop/down and existing exact-confirmed guard remove only owned disposable resources; original images/settings and Beijing data preserved. No source edits.

- Native **hung-api-stop** in-flight: API `10ac7a40c993e57fb8ce761f6fc997139e74bc4d64ebdf541d630be2d8f7a4c4`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, port `63862`, declared StopTimeout 15, no mounts; request marker observed. Owned docker-wait/events subscribers installed before shutdown; check their exit event separately from Compose client. Peer and original-resource identities verified. Execute selected native path now.

- Native **hung-api-stop PASS**: exact `200 {"drained":true}` survived; command `docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 stop api api-dev` client exit 0; separate docker-wait/die event API exit 1 in 10.203s, no OOM/SIGKILL. All six volume names/creation times/labels and pgdata file sentinel preserved. Peer container/PID/start/storage sentinel and original stopped Beijing DBs/six volumes/settings unchanged. API-only stop left test DB running; full paths included all profiles as selected. Port refuses connections.

- Native final cleanup: both disposable projects have zero containers/volumes; exact-confirmed native guards succeeded, temporary image tags removed, original runtime image unchanged. Only original stopped Beijing DBs/settings/six volumes and unrelated anonymous volume remain. No watcher, API, SQL client, event/wait subscriber, host request or source fixture survives. Temporary copied entry is only under `/private/tmp/storage-minis-stage410`; no production delay route ships.

### Completed handoff (2026-10-29, America/Maceio)

Implemented only the [approved stage 4.10 fixtures](technical-direction.md#step-410-shutdown-fixture-approval-2026-10-29).
Nine new real-process cases extend the inherited 16 cases. The existing owned
supervisor, output limits, exact test guard, real controller/pool inspection,
serial tests and reserved listener ownership are retained. Fixture children have
a 25s outer bound; the actual application watchdogs remain 10s shutdown and 17s
startup, with no accelerated timers or harness force-exit accepted as evidence.
Source-only type references keep no-emit checking independent of prior API output;
computed module URLs execute the compiled production config/factory/lifecycle.
The fixture uses the one owned DB; its delayed startup, handler and close hooks
are test-only and excluded from finite output/package/image.

| Exact command / check | Final result |
| --- | --- |
| `git branch --show-current`; initial status; predecessor history/diff | Required branch; clean start at `b2a4a81`; current completed 4.1–4.9 inputs/evidence verified. No new branch/worktree. |
| `gh issue view 26 --repo WilliamPhilippe/storage-minis-be --json number,title,state,body,comments` | Open, no comments; existing business/auth/operations boundaries preserved. |
| `./scripts/tooling.sh run pnpm exec prettier --write apps/api/tests/fixtures/shutdown.ts apps/api/tests/process.integration.test.ts` | Passed; final fixture-only format unchanged. |
| `./scripts/tooling.sh run pnpm --filter @storage-minis/api typecheck` | Passed. Repeated with API dist temporarily absent: passed; original dist restored with EXIT trap and `.context` removed. |
| `./scripts/tooling.sh run pnpm exec eslint apps/api/tests/process.integration.test.ts apps/api/tests/fixtures/shutdown.ts` | Passed twice, including final type-reference correction. |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit --project db-unit` | 109 tests / 12 files passed, including 29 lifecycle, six process-owner/target and seven confirmed-volume-guard cases. |
| `./scripts/database.sh up test` | Authenticated exact test target; development stayed stopped. Startup bounded by 90s outer. |
| `./scripts/tooling.sh run-db test pnpm test:api` | Final 25 cases / 67.57s passed; uncached live task, finite API build. Earlier 25-case run also passed before fixture type-reference correction. |
| Independent `psql test -At -c` inventory below, after each process phase | Zero public/drizzle tables and zero other client backends; no shared-target consumer survived. |
| Native `stop --timeout 10 postgres_test` | Passed after each phase; test returned to initial stopped state before disposable native phases. |
| `python3 /private/tmp/storage-minis-stage410-native.py` | Final five native scenarios passed; detailed commands/identities/timing below. Initial five runs passed before exact-path fixture correction; all were repeated on final fixture inputs. |
| `./scripts/tooling.sh run pnpm format:check` | Passed on final source/configuration. |
| Original runtime read-only/network-disabled Node audit | Passed: original production entry, no fixture route/import, no tests directory or shutdown output. Owned `storage-minis-stage410-image-audit` self-removed. |
| Independent Docker/Git resource and source audit | Original two stopped DBs, six volumes, network, images and unrelated anonymous volume preserved; no disposable/peer/probe resource/tag. Runtime/schema/Compose/reset guard/lockfile diff empty. |

Final process results: finite registration cancellation settled late, closed the
pool once and never listened; repeated mixed INT/TERM signals drained exact
`200 {"drained":true}` at 6047ms each and kept the first signal's 130/143 result.
Both close-rejection cases attempted HTTP and DB cleanup then forced exit 1.
Hung HTTP, hung DB after a 6s HTTP drain, and canceled hung startup forced exit 1
at 10039/10037/10044ms through the application shutdown watchdog. This demonstrates
one total deadline across HTTP and DB, including waiting for pending startup.
Unsignaled hung startup forced exit 1 at 17331ms. PID disappearance, port rebind,
zero API backends and controller pool release were verified; harness failure/signal
were absent. The inherited built-entry/startup/health/socket recovery cases passed
again. Existing injection/lifecycle checks establish closing readiness behavior.

Independent SQL command (no business/schema writes):

```sh
./scripts/database.sh psql test -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('public','drizzle'); SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid();"
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
```

Final native project: `storage-minis-stage410-20261029`, loopback API port **63862**;
DB port reservations 63860/63861, peer 63863/63864, unused peer API reservation
63865. Fixture credentials were confined to disposable project environments;
no managed Doppler value changed or fetched for native probes. All fixtures used
canonical `compose.yaml`, original runtime image
`sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`
and temporary project-scoped runtime/tooling tags. Both API services declare 15s;
actual runtime containers had `Config.StopTimeout = 15`, no mounts and exactly
`127.0.0.1:63862 -> 3000`. Default service selection remained only PostgreSQL.
All three native shutdown aliases and the reset helper have no global timeout.

Before each native experiment the harness saved ownership, request marker,
resources, bounds and restoration in checkpoints above. It created the API
stopped, copied `tests/fixtures/shutdown.ts` to the same path in its writable layer
and set only that container's `dist/server.js` to
`import "../tests/fixtures/shutdown.ts";`. No original image/source/configuration
was edited. Exact live/ready 200 preceded the 6s request. `docker wait` and filtered
Docker events subscribed before native shutdown, so container exit was observed
even after native down removed it. Host requests had an 8s bound; native startup
40s, shutdown/guard 30s outer. The 15s service deadline encloses the real 10s
application deadline. All phases were sequential and fully cleaned between cases.

| Native shutdown path (all final runs) | API container ID prefix | Compose/helper client | Separate API wait/die exit | Elapsed from native call |
| --- | --- | --- | --- | --- |
| API-only `stop api api-dev` | `6730ac1ef47a` | 0 | 143 | 6.018s |
| Full-profile `stop` | `e3530fc5d544` | 0 | 143 | 5.998s |
| Full-profile `down --remove-orphans` | `a90dfb57f942` | 0 | 143 | 6.109s |
| Guarded `--confirm storage-minis-stage410-20261029` | `dca06f10bea9` | 0 | 143 | 6.121s |
| API-only stop, deliberately hung DB close after 6s request | `10ac7a40c993` | 0 | 1 | 10.203s |

Every native request returned exact `200 {"drained":true}`. No OOM, signal 9,
137 exit or premature termination appeared in Docker events. Retained containers
also matched stopped state/exit/OOM inspection and one DB-close marker. The hung
case additionally logged `shutdown_timeout`; its Compose client 0 did not mask
application/container failure 1. API-only stop kept its disposable test DB running;
full stop included every service; down removed containers/network. Ordinary paths
preserved all six volume names, creation times, ownership labels and a file
sentinel in disposable pgdata. Guarded deletion removed all six owned volumes;
missing/wrong actual confirmations refused before teardown with the same API
container/inventory. The seven offline guard cases also verify ownership and
inspection refusal before mutation, exact candidates and native error propagation;
unchanged earlier real ownership-mismatch evidence remains applicable.

Exact native shutdown commands, from the root with disposable project/port
settings (no global timeout):

```sh
docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 stop api api-dev
docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile '*' stop
docker compose --env-file .env.compose --file compose.yaml --project-name storage-minis-stage410-20261029 --profile '*' down --remove-orphans
COMPOSE_PROJECT_NAME=storage-minis-stage410-20261029 POSTGRES_PORT=63860 POSTGRES_TEST_PORT=63861 ./scripts/reset-volumes.sh --confirm storage-minis-stage410-20261029
```

Canonical preflight used `config --format json`/`config --services` (only safe
assertions printed); temporary tags used native `docker tag`. Volume initialization
used canonical `run --rm --no-deps tooling-init` plus `create --no-build postgres`.
The pgdata sentinel was written only by a disposable canonical one-off shell and
read back through a network-disabled, read-only-volume container. API preparation
used canonical `create --no-build api`, `docker cp` while stopped and
`start --wait --wait-timeout 30 api`. Disposable test startup used native
`up --detach --no-deps --no-build --pull never --wait --wait-timeout 30 postgres_test`.
No new infrastructure command/service/dispatcher was introduced.

Isolation peer `storage-minis-stage410-20261029-peer` had running PostgreSQL
`21aa75daf8e2ad1173fa5694d86bf84e477f5d6a121d8c4fd022ab68fabec956` and its
own `pgdata` file sentinel. Its container/start/restart identity, running state,
volume and stored sentinel survived every primary project's native stop/down/
confirmed deletion. Only afterward was this stage-owned peer removed with its own
exact-confirmed guard. Both projects ended with zero containers/volumes/networks;
all temporary runtime/tooling tags and event/wait/HTTP/volume/image probes were
removed. API port 63862 refused connections. No temporary application source edit,
watcher or client remains; only nonsecret harness/copied fixture files under
`/private/tmp` and normal ignored build/cache output remain outside this commit.

Independent final Docker inventory equals the initial resources: original stopped
Beijing development `7d69a3e26bab`, stopped test `dde80d86c88f`, six project volumes,
`storage-minis-beijing_default`, original images and unrelated anonymous volume
`c6d7cdbbb7f749f9e264250206f404600ef6a2b6a8bc16d52a0379dfdd8e4807`.
Development never started/reset; no migration, business write, global prune or
owner storage deletion occurred. `.env.compose` bytes and resource identities
were preserved. The final original-image audit and empty runtime-source diff
prove no diagnostic endpoint ships.

**AC4-09 and AC4-17 complete.** Overall Step 4 remains in progress: only 4.11's
AC4-12/AC4-16/AC4-18 final integration/handoff gate remains. No business/T06 or
production acceptance is claimed. No required stage check remains failed/unrun.
The pre-execution temporary Python syntax failure was corrected before resources;
all live checks passed. The fixture type-reference issue was corrected and every
affected process/native path repeated. Full aggregate, fresh schema replay, image
rebuild, dev reload and smoke were unrun here: their relevant production inputs
are unchanged, the 109 unit checks are current, earlier evidence remains valid
and the final aggregate belongs to 4.11. No application fix invalidated those paths.

Current status/approval summaries are synchronized in the parent/stage plans,
foundation guide, README and technical direction, preserving dated history.
Commit scope: only the two test files and six necessary stage documents.
Exact next action: finish documentation/diff gate, stage those eight files and
run the recorded local Conventional Commit, resolve its hash and verify
`git status --short`; stop and await a separate stage 4.11 assignment. No push/PR.

- Final completion gate passed: six changed Markdown documents, 25 changed
  relative links/anchors, 58 tables/fences and all 18 acceptance IDs (15 complete;
  only AC4-12/16/18 remain). `git diff --check` passed. Final source/test/docs diff
  reviewed: exactly eight stage files including the new test fixture; no unrelated
  work. Required branch reverified. Final formatting/image/resource audits passed;
  no required check remains failed/unrun and no temporary application/resource
  restoration remains. Next stage these exact files, execute
  `test(api): verify bounded shutdown and project isolation`, resolve actual hash
  and verify clean `git status --short`; stop without push/PR or 4.11 work.

## Stage 4.9 — Database failure, recovery and test isolation

**State: complete.** Required stage checks passed on 2026-10-29 (America/Maceio).
Overall Step 4 remains in progress; 4.10–4.11 are not started.
Completion commit subject: `test(api): verify database outage and recovery`.
Resolve its hash with `git log -1 --format=%H --grep="^test(api): verify database outage and recovery$"`.

### Initial checkpoint (historical; state was in progress)

- Branch verified before edits: `WilliamPhilippe/step-4-implementation-plan`;
  clean tree at `78078f6`. Completed 4.1–4.8 commits and evidence present:
  `472e0a7`, `29509a3`, `230a348`, `2510bdd`, `4fd7856`, `f92a8ed`,
  `0ac5a74`, `78078f6`. Preserve this checkout and branch.
- Read AGENTS, README PostgreSQL/Drizzle/lifecycle guidance, foundation guide,
  stage execution/completion/checkpoints and 4.9 card, parent readiness,
  unmigrated-DB and shared-target/outage matrix, standard Compose/setup records.
  Live T06 #26 remains open, no comments; business prerequisites unchanged.
- Inspected Step 3B `freshSchema()`: drops/recreates `public`, drops `drizzle`,
  then applies committed migrations. Its afterAll truncates business tables and
  closes its pool. Never overlap that suite with process/smoke/outage consumers.
  Current schema/runtime/lockfile inputs retain predecessor evidence; no schema
  replay is needed unless those inputs change. New process tests require rerun,
  then unchanged image smoke, then actual outage, sequentially and uncached.
- Docker initial inventory: saved project `storage-minis-beijing`, ports
  5433/5434. Only original stopped development `7d69a3e26bab` and test
  `dde80d86c88f`; no running consumer/API/watcher/probe. Docker read required
  sandbox escalation, then passed. No service started or secret fetched.
- Pending owner approval: deterministic test-only TCP gate around real traffic
  using the existing DNS preload and backend termination; temporary host native
  API/test-service outage harness. Recommendation/alternatives presented in
  chat. No fixture implementation or disruption before explicit approval.
- Planned ownership/restoration: guarded suite owns controller, API child,
  loopback gate/ports/sockets before failures; closes them between phases.
  Native outage harness owns only a newly created canonical test-target API,
  with an explicit free loopback port. Close SQL probes before test stop.
  Preserve original DB identities, development storage, six volumes and saved
  settings. Test tmpfs loss is intentional. Restart test immediately after outage;
  finish by removing only the newly owned API and restoring test to stopped.
- Bounds: inherited 30s tests/10s hooks/180s suite supervisor; DB check 6s plus
  1s HTTP scheduling margin, request abort 8s; API child cleanup 10s. Native test
  stop 10s plus 5s overhead; test up outer 90s; API up 45s; recovery polling 30s.
  A failed restoration leaves exact `./scripts/database.sh up test` as next action.
- Exact next action: await fixture approval; record it, implement only 4.9 tests,
  run focused/affected strict checks, then checkpoint before each live phase.
  AC4-06/07/14 remain open. No stage-completion commit until all checks pass.

### Checkpoint history

- Owner explicitly approved both recommended fixture choices in this session
  on 2026-10-29, before implementation. Extend only the guarded test and use a
  temporary host native-service harness; no new dependencies or infrastructure.
- Implemented one process case: owned loopback gate forwards real authenticated
  PostgreSQL traffic using the existing child-only DNS preload; controller
  terminates the one observed API backend, gate refuses reconnects, two fresh
  readiness probes must return exact bounded 503 while live remains exact 200.
  Restore forwarding, require ready 200 with a new backend and the same API PID/
  one listening marker; close child/controller/gate/sockets via existing owners.
- Runtime/schema/lockfile diff since `2510bdd` is empty. Reuse current 4.1–4.8
  evidence and 30-test schema/replay phase; no destructive replay now. Pending:
  focused unit guards, API strict checking/lint/format, guarded real process suite,
  image smoke, native test stop/restart, docs and commit. Test remains stopped.
- Exact next action: run focused/affected offline checks, then inventory and
  checkpoint before test startup. No outage or migration has occurred.

- Offline gate passed: `./scripts/tooling.sh run pnpm exec vitest run --project api-unit`
  **58 tests/four files**, including preconnection runner/config guards;
  `./scripts/tooling.sh run pnpm --filter @storage-minis/api typecheck`,
  `./scripts/tooling.sh run pnpm exec eslint apps/api/tests/process.integration.test.ts`,
  and targeted Prettier passed. Initial sandbox-only Docker attempts were refused;
  reruns with scoped escalation passed, no auto-review rejection.
- Pre-live checkpoint: `docker ps` reports no running containers. Original DBs
  remain stopped; existing runtime image index
  `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`
  matches 4.8. No image rebuild needed: runtime/schema/dependency/config inputs
  unchanged. Next start only test (`./scripts/database.sh up test`, outer 90s),
  verify authenticated identity, zero business/migration tables and no other
  clients, then guarded `./scripts/tooling.sh run-db test pnpm test:api`
  (180s suite supervisor plus 10s termination/1s pipes). No concurrent consumer.
  Stop test back to initial stopped state after all phases, preserve development.

- Socket scenario verified: guarded `./scripts/tooling.sh run-db test pnpm test:api`
  passed **16 process tests / one file**, three successful Turbo tasks (only DB
  build cached, live process uncached), 6.44s. New scenario 385ms: same API PID
  **249**, backend **138 → 139**, exact ready 503 in **2ms** with one observed
  reconnect refusal; live exact 200 before/during/after, ready 200 on recovery.
  Only one listening marker; child exited 143, reserved listener/gate/sockets and
  controller pool closed. Existing startup/config/credentials/bind/basic signals
  still pass. No schema/migration writes; afterAll schema identity unchanged.
- Before smoke: test remains exclusively running, process tooling/children/clients
  released. Next `./scripts/database.sh api-verify test` (60s helper deadline,
  65s outer); same existing image, unique owned one-off probe, dynamic loopback
  port. Close/remove smoke probe before any native service-outage action.

- Post-process independent SQL passed: zero public/drizzle tables, zero other
  client backends. Smoke completed with exact host HTTP, SIGTERM 143 and owned
  removal: probe `storage-minis-beijing-api-verify-92416-22534-25477`, container
  `02e724e77b35a97a0222c4d26b0e1ecb15de7f66face4b91b52814bacbd5f803`,
  loopback **55000**, unchanged image index `48aa5486…`. Helper returned 0.
  Temporary native outage harness syntax checked with `ast.parse` (initial
  `py_compile` was blocked only by its host cache path; no live action ran). Next run it; its preflight
  verifies exclusivity and records API/port/DB ownership before disruption.

- First outage harness preflight failed before API creation/disruption because
  native `docker ps -q` abbreviates IDs while Compose returns full IDs. Inspected
  inventory and normalized with `docker ps --no-trunc -q`; no extra consumer or
  leaked resource. Test remains running and development stopped. Next rerun the
  same approved scenario; no implementation/runtime change or failed HTTP claim.

- Second preflight stopped before API creation: existing SQL helper intentionally
  merges safe Compose creation notices into stdout, so raw output was not just
  `0`. Safe probe confirmed table count 0; temporary harness now removes only
  the known project SQL-client creation lines before exact result comparison.
  No DB/schema change, no disruption, no surviving SQL client. A retry found
  the first notice had lost its leading space through `strip()`; normalized that
  whitespace too before the next preflight.

- Pre-service-outage checkpoint: test `dde80d86c88f` exclusively running; process and smoke phases closed. No API/dev service or other test client. Temporary host harness `/private/tmp/storage-minis-stage49-outage.py` owns the next canonical API, loopback port `63439`; bind collision fails closed. Commands: `API_HOST_PORT=63439 ./scripts/database.sh api-up test` (45s outer), SQL probes (25s outer), native test stop (10s + 5s), `./scripts/database.sh up test` (90s outer), HTTP 8s abort / 7s assertion / recovery 30s. Record state before/after stop; finally restart if needed, stop/remove only owned API, return test to initially stopped state. Development/six volumes/settings preserved.

- Service scenario healthy: API `80fb7560a19210c4595266dfa91cf367ac02df08f5f1c5f720380d60479757dd`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, host port `63439`, host PID `4948`, started `2026-10-29T06:41:59.581424461Z`, restart count 0. Exact live/ready 200 in 9.7/1.4ms. Authenticated SQL still reports zero public/drizzle tables after API startup; only API backends `970|storage-minis`. SQL probe exits/removes its own client before disruption. Next native stop of test only; API stays running.

- Test service is now STOPPED by native `docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test`; tmpfs intentionally discarded, API `80fb7560a19210c4595266dfa91cf367ac02df08f5f1c5f720380d60479757dd` remains running. Restoration action is `./scripts/database.sh up test` (90s outer), even if the next HTTP assertion fails/interruption occurs. No schema/smoke/process/SQL consumer overlaps.

- Stopped-service HTTP passed: live exact 200 before/after ready (1.1/3.1ms), ready exact 503 in 2005.9ms (<7s). Same API identity/PID/start time/restart count, still running. Next restore test with `./scripts/database.sh up test`; startup must not migrate.

- Service recovery passed: native test startup authenticated; exact ready/live 200 with the same API container/image/PID/start time and restart count 0. Ready request 1.5ms. Authenticated unmigrated identity remains `storage_minis_test|postgres|UTC`, zero public/drizzle tables; API startup/recovery applied no migrations. Test is RUNNING again. Next cleanup owned API and restore initial stopped test state.

- Native scenario demonstrated all healthy/outage/recovery assertions, then
  cleanup removed API (exit 143), verified zero other DB clients, stopped test,
  and verified original development/six volumes. Final immediate host port bind
  failed with `EADDRINUSE`; do not yet claim cleanup complete. Next independently
  inventory owned resources and check listener release (distinguish TCP TIME_WAIT
  from a surviving listener). Test has already returned to STOPPED, no restoration
  is pending. No need to repeat successful disruption unless the audit finds a leak.

- Independent cleanup audit passed: all-profile Compose inventory contains only
  original stopped development `7d69a3e26bab` and test `dde80d86c88f`; global
  `docker ps` is empty. Host connection to port 63439 returns **ECONNREFUSED (61)**;
  bind with `SO_REUSEADDR` succeeds, confirming TIME_WAIT rather than a listener.
  The final fixture check is resolved without another disruption. No recovery is
  pending. Six volumes and saved settings preserved; SQL clients removed.

### Completed handoff (2026-10-29, America/Maceio)

Implemented the [approved socket and native-service fixtures](technical-direction.md#step-49-db-failure-recovery-and-isolation-approval-2026-10-29).
The permanent guarded test forwards real PostgreSQL traffic through an owned TCP
gate, terminates the one observed API backend, checks live 200 and two fresh ready
503 responses under the 6s DB + 1s scheduling bound, then restores forwarding and
checks ready 200 with a new backend and unchanged API PID. Existing test owners
release child/controller/gate/listeners/sockets on success or failure. The only
preload edit updates its comment to describe both socket fixtures.

| Check / exact command | Final result |
| --- | --- |
| `git branch --show-current`; initial `git status --short`; `git log -12 --oneline` | Required branch, clean tree at `78078f6`, all completed 4.1–4.8 evidence present. No other branch/worktree. |
| `gh issue view 26 --repo WilliamPhilippe/storage-minis-be --json number,title,state,body,comments` | Open, no comments; inherited T01/T02/T04/business boundaries preserved. No backlog mutation. |
| `git diff 2510bdd..HEAD -- apps/api/src packages/db/src/client.ts packages/db/src/schema pnpm-lock.yaml` | Empty. Runtime/schema/dependencies/lockfile unchanged; inherit 4.4's sequential 30-test schema/replay evidence and 4.8's 109-test strict aggregate. Neither live reset nor full aggregate repeated in this focused stage. |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit` | 58 tests / four files passed, including target/runner/config preconnection guards and offline ownership/deadline fixtures. |
| `./scripts/tooling.sh run pnpm --filter @storage-minis/api typecheck` | Passed; strict source/scripts/test/config types checked. |
| `./scripts/tooling.sh run pnpm exec eslint apps/api/tests/process.integration.test.ts` | Passed; final lint also includes the updated preload comment. |
| `./scripts/tooling.sh run pnpm exec prettier --check apps/api/tests/process.integration.test.ts apps/api/tests/fixtures/unavailable-database.ts` | Passed on final test inputs. |
| `./scripts/database.sh up test`; authenticated SQL preflight | Test-only startup; `storage_minis_test / postgres / UTC`, zero public/drizzle tables, zero other client backends. Development stayed stopped. |
| `./scripts/tooling.sh run-db test pnpm test:api` | 16 tests / one file passed, 6.44s including finite builds; live task uncached. Socket case 385ms, same API PID 249, DB backend 138 → 139, ready 503 in 2ms; exact live 200 throughout and ready 200 on recovery. Schema identity/pool/listener cleanup passed. |
| Independent post-process SQL | Zero public/drizzle tables and zero other clients; process phase fully closed before smoke. |
| `./scripts/database.sh api-verify test` (65s outer) | Passed on unchanged image, owned container `02e724e77b35…`, host loopback 55000; exact live/ready, TERM 143 and confirmed probe removal. |
| `python3 /private/tmp/storage-minis-stage49-outage.py` | All HTTP/native service assertions passed: canonical API `80fb7560a192…`, port 63439, host PID 4948/start/restart count unchanged. Native DB stop: live 200, ready 503 in 2005.9ms; native DB startup: ready 200 in 1.5ms, live 200. Authenticated zero-table DB before/after startup and recovery. Final immediate bind assertion hit TIME_WAIT; independent inventory/refusal/rebind audit above resolved cleanup, so no unresolved failed check remains. |
| Native stop/removal and independent final inventory | API exit 143 then removal; zero DB clients before final test stop; only original stopped DB containers remain, six volumes/settings preserved, no running container or listener. |

Exact native outage sequence (performed only after process and smoke released
the exclusive disposable test target):

```sh
API_HOST_PORT=63439 ./scripts/database.sh api-up test
# Host HTTP live/ready each exact 200; SQL verifies zero public/drizzle tables.
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
# Same API: exact live 200, ready 503, live 200; each request <7s, abort 8s.
./scripts/database.sh up test
# Same API: exact ready/live 200; authenticated unmigrated identity still valid.
docker compose --env-file .env.compose --file compose.yaml stop api
docker compose --env-file .env.compose --file compose.yaml rm -f api
# Confirm zero other clients; return test to its original stopped state.
docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test
```

Authenticated nonmigration check, issued through the existing disposable SQL
client before/after API startup and after DB restart:

```sh
./scripts/database.sh psql test -At -c "SELECT current_database(), current_user, current_setting('TimeZone'); SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('public','drizzle');"
```

Result: `storage_minis_test|postgres|UTC`, then `0`. Fresh HTTP uses the fixed
`/health/live` body `{"status":"ok"}`, `/health/ready` healthy body
`{"status":"ready"}` and unavailable body `{"status":"unavailable"}`.
Each readiness result is current; no startup/recovery SQL or migration command
was introduced. The temporary harness reads injected environment/inspection only
in memory and prints allowlisted identities/results, never passwords/raw config.

AC4-06/AC4-07/AC4-14 are complete using current focused/process/smoke/outage
proof and unchanged predecessor unit/schema/security evidence. There was no
concurrent schema reset, process suite, smoke, SQL client or outage consumer.
No dependency/pin, runtime source, schema/migration, Compose model, environment
settings, new command, infrastructure or distributed lock was added. This is
local foundation evidence, not business workflow or production acceptance.
AC4-09/17 shutdown edges remain 4.10; caches/final integration remain 4.11.

Initial temporary harness ID/output-parser preflight failures and its host cache
syntax-check limitation are recorded above; they occurred before disruption.
The TIME_WAIT cleanup assertion is resolved by independent actual inventory,
connection refusal and port reuse. No failing HTTP scenario or required check is
deferred. Full aggregate/schema replay/image rebuild were unrun because their
inputs remain current; targeted checks are the stage's required verification.

No owned API/probe/controller/SQL client/port/source fixture remains. Both original
DB containers are stopped; test tmpfs was deliberately discarded, development
storage never started/reset. Six volumes and saved settings are unchanged.
Only nonsecret temporary Python scripts under `/private/tmp` and ignored normal
build/cache outputs remain outside Git; they are excluded from the stage commit.

Current summaries/approvals are synchronized in stage/parent plans, foundation
guide, README, technical direction and AGENTS, preserving dated history.
Commit scope: the process test/preload comment plus these necessary stage docs.
Exact next action: finish documentation/diff checks, stage these nine files,
execute the recorded Conventional Commit, resolve its hash and verify
`git status --short`; then stop. Stage 4.10 requires its own assignment;
no push/PR or 4.10 work is authorized here.

- Final gate passed: final two-file ESLint and Prettier checks; API strict
  typecheck and 58 focused tests remain current (only a preload comment changed
  afterward). `python3 /private/tmp/storage-minis-validate-stage49-docs.py`
  passed seven Markdown files, 26 changed relative links/anchors, 59 tables,
  fences and all 18 acceptance IDs (13 complete). `git diff --check` passed.
  Reviewed final code/docs diff: exactly nine stage files, no unrelated work;
  no runtime/schema/dependency/Compose change. No required check remains failed
  or unrun. Next stage these exact files and commit with the recorded subject,
  resolve actual hash and verify Git status; then stop before 4.10/push/PR.

## Stage 4.8 — Bounded runtime-image smoke

**State: complete.** Required stage checks passed on 2026-10-29 (America/Maceio).
Overall Step 4 remains in progress; stages 4.9–4.11 have not started.
Completion commit subject: `test(api): add bounded runtime image smoke verification`.
Resolve its hash with `git log -1 --format=%H --grep="^test(api): add bounded runtime image smoke verification$"`.

The following initial checkpoint/history preserves the session's earlier states.

### Initial checkpoint (2026-10-29, America/Maceio)

- Branch verified: `WilliamPhilippe/step-4-implementation-plan`; initial tree
  clean, HEAD `0ac5a74`. Completed 4.1–4.7 commits/evidence present. Current
  application/schema/lockfile/image inputs match the 4.7 handoff; inspect/recheck
  changed launcher paths rather than rerunning unrelated historical fixtures.
- Read AGENTS, README Docker/PostgreSQL/lifecycle, stage execution/completion/
  checkpoint rules and 4.8 card, parent local verification/bounds/credential/
  isolation matrix, foundation and standard Compose/one-time setup records.
  Live T06 #26 is open with no comments; prerequisites/business scope unchanged.
- Owner explicitly approved the concrete Bash/Compose verifier, direct alias,
  allowlisted diagnostics, bounded ownership/cleanup and focused/live fixture
  recommendation in this session. No dependency/pin/model/migration change.
- Docker inspection required sandbox escalation and passed: only original stopped
  development `7d69a3e26bab` and test `dde80d86c88f` containers; no active test
  consumers, API/watchers or owned fixture. Saved project `storage-minis-beijing`,
  ports 5433/5434. No secret fetched or source fixture applied.
- Pending: implement resource protection from the first version; focused security/
  shell/strict checks; repeat actual image smoke uncached, failure/collision/
  interruption/deadline fixtures; inspect identity/mounts/ports/secret boundaries;
  `./scripts/tooling.sh run pnpm check`; docs validation and local commit.
- Live plan: exclusively start/authenticate test PostgreSQL, no schema reset or
  migration; no concurrent schema/API/outage consumer. Probes get unique owned
  names and Docker-assigned loopback ports (explicit collision fixture separately).
  Requests <=8s, readiness <=30s, shutdown/cleanup <=15s, operation <=60s.
  Temporary host fixtures stay under `/private/tmp`; no managed Doppler edit.
  Stop only stage-owned probes/clients and return test DB to initial stopped state;
  preserve development container/data, six volumes and saved settings.
- Exact next action: record scoped approval and implement only 4.8, then focused
  tests. Checkpoint with exact fixture ownership/ports/deadlines/cleanup before
  every live scenario. AC4-13/15 stay open until all current evidence passes.

### Checkpoint history

- First focused attempt found a TypeScript template escaping error in the new
  fixture only; corrected before live work. Focused final command
  `./scripts/tooling.sh run pnpm exec vitest run --project db-unit src/verify-api.test.ts src/launcher.test.ts src/docker-launcher.test.ts src/local-setup.test.ts src/diagnostics.test.ts`
  passed **41 tests / five files** (18.42s). Includes exact tuple/pre-fetch guards,
  special-character selected password, missing key/network/config/token refusal,
  stream sentinels, owned/foreign cleanup, zero-mount refusal, exact bodies,
  request/overall watchdog cancellation and TERM/INT. Bash syntax passed.
- Pre-live checkpoint: no active test consumer or watcher; original test container
  `dde80d86c88f` and development `7d69a3e26bab` stopped. Current image tag/index
  `storage-minis-beijing-api:step4` / `sha256:5d920420abf84e5114c6e757665f011a0445c842015e16ea17b25fa43f66ad9c`
  matches final 4.7 packaging evidence. `git diff 2510bdd..HEAD -- apps/api/src packages/db/src/client.ts packages/db/src/schema pnpm-lock.yaml`
  is empty: inherited process/schema behavior still current. Live T04 #23 open,
  no comments, no changed operations decision. Next: `database.sh up test`
  (90s outer bound), then first `database.sh api-verify test` (65s outer bound).
  Unique label/name, deliberate dynamic loopback port; 8s request/30s readiness/
  15s cleanup/60s overall bounds installed. Helper removes only its owned probe;
  final harness stops only test DB back to initial state. No source fixture,
  managed-secret edit, migration, reset or development startup.

- First actual smoke authenticated and proved exact HTTP, image/mount/user/service
  and dynamic loopback publication: container
  `325a1df9f63f496114bcbc180a117b272e440f9805fcdd0d18729c91010fa149`, port 55000.
  Shutdown assertion failed; owned probe removed. Added strictly typed safe
  shutdown metadata to identify the observed failure; no acceptance claimed.
  Before next live probe: same exclusive running test DB, no surviving probe or
  source fixture, unchanged image. Rerun only smoke under the same bounds/cleanup
  to inspect numeric exit/running/OOM facts, never raw logs or environment.

- Second smoke identified `false 143 false` (stopped, conventional SIGTERM
  status, no OOM), container
  `a2b5b7587cbe0af49d00cae8cb7324a1c5863fdbe919bc4bc66523c8c48f8257`, port 55001,
  then removed it. Initial verifier/test expected 0 incorrectly; corrected to
  existing approved parent lifecycle contract/4.6 evidence: clean TERM is **143**.
  This changes no application behavior or decision. Before repeat success fixtures:
  test DB remains exclusively running, no owned probes; same image and deadlines.
  Next run two unchanged actual smoke commands sequentially and record both.

- Before live fixture **bad**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified bad: exit 1, 1.86s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-87963-15820-13303
Runtime image: sha256:5d920420abf84e5114c6e757665f011a0445c842015e16ea17b25fa43f66ad9c
Container: 4e4bb83cc6098f28dd3faed7c587ad08fcb1e98a404859d9767f05b75d435c9a
Loopback port: 55004
Probe exited before readiness (configuration or database authentication).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **collision**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Collision listener owned by host harness PID 87950, loopback port 62434; it remains open through launch refusal. No HTTP readiness accepted from it. Cleanup closes this socket only.

- Verified collision: exit 1, 0.84s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-88048-6193-22842
Probe launch failed (image, Docker or port collision).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **SIGTERM**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGTERM probe inspected in memory: `storage-minis-beijing-api-verify-88096-12070-6745`, container `033d13f3b66f4121b4dfa97e06872918070a5e646b754f66edee571818c9cd6b`, image `sha256:5d920420abf84e5114c6e757665f011a0445c842015e16ea17b25fa43f66ad9c`, loopback 55005, host launcher PID 88081. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGTERM to outer launcher now; cleanup owns only this probe.

- Verified SIGTERM: exit 143, 3.16s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-88096-12070-6745
Owned probe removed.

```

- Before live fixture **SIGINT**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGINT probe inspected in memory: `storage-minis-beijing-api-verify-88153-6560-14454`, container `a65d7f9eee311aa915fdd7af772c9d55fd9699a07f42b4903591af8158a5fb54`, image `sha256:5d920420abf84e5114c6e757665f011a0445c842015e16ea17b25fa43f66ad9c`, loopback 55006, host launcher PID 88144. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGINT to outer launcher now; cleanup owns only this probe.

- Verified SIGINT: exit 130, 3.07s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-88153-6560-14454
Owned probe removed.

```

- Live harness final resource inventory: no owned probe containers. Test DB remains running exclusively pending subsequent bounded deadline/check scenarios; development DB untouched/stopped. No source fixture exists.

- Two corrected unchanged actual commands passed with clean TERM **143** and
  helper exit 0: `be1b285f587c1807e0a189668f7745bca9fb156bb15b57cedafb0b1ed6cf347c`
  / 55002 and `07e15e91db0be346d9ad3d6ec768c39d87a5573e3c73551825220973b80566d9`
  / 55003. Both removed their owned probes. First milestone `pnpm check` passed
  105 tests/12 files, all seven tasks (20.282s); later cleanup/test strengthening
  requires affected rerun before completion.
- Strengthened final cleanup: exact-name inventory must succeed and show absence;
  Docker unavailability cannot masquerade as absence. A cancelled launch gets a
  bounded settle check; per-client deadlines are capped by the absolute operation
  budget. Added cleanup-inventory failure/force-after-deadline/explicit-port tests.
  No new architecture, runtime policy or credential boundary.
- Before final image build/live fixtures: the root alias changes a Docker build
  input even though runtime application/dependencies are unchanged. Test files
  themselves are excluded by `.dockerignore`. Rebuild
  canonical runtime `docker compose --env-file .env.compose --file compose.yaml build api`
  without DB/Doppler inputs, outer 600s bound; record final identity, then rerun
  success twice and failure/interruption paths against it. Test DB remains running
  exclusively; development stays stopped, no probe/watcher/source fixture. No
  pull/build occurs inside the verifier itself.

- Final secret-free native runtime rebuild passed frozen install, finite API/DB
  build and portable 64-package production deployment. Image index
  `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`,
  config `sha256:8b7a7d6fc7eb7f4aa2d6f3f2790f3986423b0972a361c6061fd87df3601a9320`.
  No dependency/pin/compiled application changes. Native `compose run --help`
  confirms no `--no-build` flag; explicit image preinspection, omitted `--build`
  and `--pull never` guarantee use of the existing local runtime.
  Next rerun all final live smoke paths under the strengthened cleanup guard;
  harness checkpoints every scenario with exact ownership/ports/cleanup.

- Before live fixture **success1**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified success1: exit 0, 2.15s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89558-7433-12879
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: 0fa3b6ff8c3a4d4f2c8a3b6420de2db61b0055f7c41be81a55db5f52f1950636
Loopback port: 55007
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **success2**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified success2: exit 0, 1.54s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89646-31482-23767
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: 06e140fdd6c6d19c39378b672a9476a2ef747896a5e83d82996e77d22cdd2de9
Loopback port: 55008
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **explicit**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Explicit free loopback port selected for this invocation: 63013; no listener retained. Collision would fail before HTTP.

- Verified explicit: exit 0, 1.88s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89733-22763-1887
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: 8eeaf7fc5785898be004d9245301bbb85a621abc48012ce5c113d05549949ca2
Loopback port: 63013
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **bad**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified bad: exit 1, 1.34s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89820-14045-12774
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: ae9e3ab77c481d6fb4c15c3e3c2ff844e6066a7e0320aaebeac498ee043ef43e
Loopback port: 55009
Probe exited before readiness (configuration or database authentication).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **collision**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Collision listener owned by host harness PID 89545, loopback port 63028; it remains open through launch refusal. No HTTP readiness accepted from it. Cleanup closes this socket only.

- Verified collision: exit 1, 0.90s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89900-1691-18265
Probe launch failed (image, Docker or port collision).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **SIGTERM**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGTERM probe inspected in memory: `storage-minis-beijing-api-verify-89955-27133-23275`, container `0cba2a3541f3eb8e58d49f22e9a856acf3df9662e70c22d5db77f3b156892b54`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, loopback 55010, host launcher PID 89940. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGTERM to outer launcher now; cleanup owns only this probe.

- Verified SIGTERM: exit 143, 3.17s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-89955-27133-23275
Owned probe removed.

```

- Before live fixture **SIGINT**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGINT probe inspected in memory: `storage-minis-beijing-api-verify-90017-7511-17972`, container `0e75b4905cb8692f3781ae1927e189facea430845675b48a22041010fa91d2e7`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, loopback 55011, host launcher PID 90008. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGINT to outer launcher now; cleanup owns only this probe.

- Verified SIGINT: exit 130, 3.17s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90017-7511-17972
Owned probe removed.

```

- Live harness final resource inventory: no owned probe containers. Test DB remains running exclusively pending subsequent bounded deadline/check scenarios; development DB untouched/stopped. No source fixture exists.

- Strengthened focused suite passed **44 tests / five files**, 20.77s. Added
  actual (unaccelerated) 30s readiness-deadline proof for the final milestone;
  earlier watchdog fixtures accelerate only timer scheduling, retaining real
  cancellation/cleanup paths and the real configured constants.
- Before host request-deadline fixture: `/usr/bin/curl` targets only an owned
  loopback TCP peer that accepts HTTP and deliberately withholds its response;
  no API/image/source/DB modification. Host harness selects a dynamic port,
  request flags match the verifier (`--disable --silent --noproxy '*' --max-time 8
  --max-filesize 1024`), outer process deadline 10s. Finally close accepted/listening
  sockets and join the peer thread. Expected curl 28 in approximately 8s.

- Initial host socket creation was sandbox-denied before any resource existed; escalated the same authorized fixture. Actual host curl deadline passed: exit 28, 8.02s, owned loopback port 63047; no response body printed. Accepted/listening sockets closed and peer joined.

- Final cleanup review caps every client by its phase deadline: 15s total,
  with the final three seconds reserved for force removal/verified absence after
  the graceful-cleanup deadline. This prevents cancelled-launch settle time from
  extending total cleanup. Ownership is checked before removal; unavailable
  exact-name inventory makes the command fail. No changed application contract.
  Before final rerun: same exclusive test DB, final rebuilt runtime image, no
  probe/host socket/source fixture; `/private/tmp/storage-minis-stage48-live.py`
  records each live fixture separately. Next final live run, required milestone,
  then stop test DB and prove original resources/settings/volumes preserved.

- Before live fixture **success1**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified success1: exit 0, 1.46s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90289-14432-25282
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: 5378553be5e7725738326278ce9907f4bd1fdec376469fd552d2b33ae2b03fac
Loopback port: 55012
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **success2**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified success2: exit 0, 1.88s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90381-24369-23159
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: c68424213643442b5d370a433655cd9ab4d0bc8b11338c2825b8986b9c2665d3
Loopback port: 55013
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **explicit**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Explicit free loopback port selected for this invocation: 63099; no listener retained. Collision would fail before HTTP.

- Verified explicit: exit 0, 2.13s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90466-14741-32698
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: fed552e56c6270062960da9103448cd819ccebed1666234b6164fc3de17a30c3
Loopback port: 63099
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.

```

- Before live fixture **bad**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Verified bad: exit 1, 2.53s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90600-10991-26140
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: a3dc5a51c57f12e2161bad3c2a631707c2fb9e2df672c624cdfb518d0485bc08
Loopback port: 55014
Probe exited before readiness (configuration or database authentication).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **collision**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Collision listener owned by host harness PID 90276, loopback port 63123; it remains open through launch refusal. No HTTP readiness accepted from it. Cleanup closes this socket only.

- Verified collision: exit 1, 1.00s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90704-26379-32112
Probe launch failed (image, Docker or port collision).
Owned probe removed.
Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.
```

- Before live fixture **SIGTERM**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGTERM probe inspected in memory: `storage-minis-beijing-api-verify-90761-19961-5703`, container `f3bffa4141a57983adcaff2dcbd006d5f677fcf46343f94be00aa44f17a8d1fa`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, loopback 55015, host launcher PID 90752. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGTERM to outer launcher now; cleanup owns only this probe.

- Verified SIGTERM: exit 143, 3.21s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90761-19961-5703
Owned probe removed.

```

- Before live fixture **SIGINT**: exclusive test DB `dde80d86c88f` running; no other consumer/probe. Host harness `/private/tmp/storage-minis-stage48-live.py`, wrapper changes only the selected process environment or delays one metadata read. No source/image/managed-Doppler changes. Unique probe ownership and dynamic loopback port, except collision with a harness-owned host socket. Helper request/readiness/cleanup/overall bounds 8/30/15/60s; harness outer 65s (signal path 20s after delivery). Finally verify no probe, close owned socket; preserve test DB until all smoke fixtures finish, then return it to stopped state. Next execute this fixture only.

- Fixture SIGINT probe inspected in memory: `storage-minis-beijing-api-verify-90823-17177-17458`, container `175a5d0a16177af99c1a5071cce5fec05adb30e75bc01d85cf7ba672f97e2f09`, image `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, loopback 55016, host launcher PID 90814. Exact test tuple/`NODE_ENV=test`, selected password only, nonroot/plain Node, zero mounts; no Doppler/raw managed keys. Deliver SIGINT to outer launcher now; cleanup owns only this probe.

- Verified SIGINT: exit 130, 3.18s, no owned probe; stdout/stderr sentinel absent. Safe helper transcript:

```text
API verification probe: storage-minis-beijing-api-verify-90823-17177-17458
Owned probe removed.

```

- Live harness final resource inventory: no owned probe containers. Test DB remains running exclusively pending subsequent bounded deadline/check scenarios; development DB untouched/stopped. No source fixture exists.

- Before final credential-refusal check `api-up test` / wrong-config: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-up test` wrong-config: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-up test` / token: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-up test` token: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-up test` / missing-login: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-up test` missing-login: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-dev test` / wrong-config: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-dev test` wrong-config: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-dev test` / token: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-dev test` token: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-dev test` / missing-login: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-dev test` missing-login: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-verify test` / wrong-config: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-verify test` wrong-config: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-verify test` / token: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-verify test` token: nonzero, sanitized refusal, no probe or payload created.

- Before final credential-refusal check `api-verify test` / missing-login: no new resource expected, existing exclusive test DB only. Fresh base HOME/PATH; deliberate nonsecret override selects failure. Deadline 15s; no managed edit/fallback, no API startup or cleanup action permitted.

- Verified `api-verify test` missing-login: nonzero, sanitized refusal, no probe or payload created.

- Before final fresh-environment smoke: `env -i HOME="$HOME" PATH="$PATH" ./scripts/database.sh api-verify test`; exact existing saved project/settings and dedicated managed login, no required exports/ambient PG or API settings. Exclusive test DB, dynamic loopback port, standard 8/30/15/60s bounds, outer 65s. Helper removes owned probe. Finally stop only original test service, verify original DB identities, six volumes, no probe/listener/source fixture.

- Final fresh-environment smoke passed; published listener refused after verified probe removal. Transcript:

```text
API verification probe: storage-minis-beijing-api-verify-91008-16520-6560
Runtime image: sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0
Container: 09e2e5a90b25f7d0539bc631c036a9b67b2ac6a564470e1f4289a290aae13327
Loopback port: 55017
Exact host HTTP 200 live/ready bodies passed.
SIGTERM exit 143 passed.
Owned probe removed.
```

- Final native `docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test` passed. Original development `7d69a3e26bab` and test `dde80d86c88f` both stopped; only those two project containers remain. All six expected volumes and saved settings preserved; no owned probe, API/dev watcher/client/peer/listener/source fixture remains. Test tmpfs loss on stop is intentional; no schema reset, migration, business-table write or managed secret change. Remaining work: final aggregate result, synchronized completion summaries/docs validation, local stage commit and post-commit status; no 4.9/push/PR.

### Completed handoff (2026-10-29, America/Maceio)

Implemented the [approved narrow smoke helper and tests](technical-direction.md#step-48-bounded-image-smoke-approval-2026-10-29).
`scripts/verify-api.sh` owns one unique labelled canonical runtime probe; it
checks the exact injected test tuple, existing image identity, nonroot/zero-mount
container identity, explicit dynamic loopback binding, exact host HTTP status/body
and inherited clean SIGTERM **143**. The helper exits **0** only after those
assertions and confirmed probe removal. `database.sh api-verify test` reuses the
single selected-key/no-fallback Doppler boundary; `pnpm docker:api:verify` calls it
directly outside Turbo. No Compose service/file/volume, dependency, pin, schema,
migration, business endpoint or lifecycle dispatcher was added.

| Check / exact command | Final result |
| --- | --- |
| `git branch --show-current`; `git status --short`; `git log -12 --oneline` | Required shared branch, initially clean tree, 4.1–4.7 complete through `0ac5a74`; no other branch/worktree. |
| `gh issue view 26 --repo WilliamPhilippe/storage-minis-be --json number,title,state,body,comments`; same for `23` | Open, no comments; technical/business/production prerequisites preserved. No backlog mutation. |
| `bash -n scripts/database.sh scripts/verify-api.sh`; `git diff --check` | Passed. Host Bash 3.2 actual smoke and container Bash fixture paths both exercised. |
| `./scripts/tooling.sh run pnpm exec vitest run --project db-unit src/verify-api.test.ts src/launcher.test.ts src/docker-launcher.test.ts src/local-setup.test.ts src/diagnostics.test.ts` | Focused 44 tests/five files passed after cleanup strengthening; final additional readiness test passes in the aggregate below. Missing key/fetch/config/token refusal, special-character password, runtime/dev/smoke boundaries and safe diagnostic fixtures remain current. |
| Fresh `HOME`/`PATH` only native `docker compose --env-file .env.compose --file compose.yaml build api` via Python `subprocess.run(..., timeout=600)` | Frozen install, finite API/DB builds and portable production package passed without DB/Doppler credentials. Final image index `sha256:48aa5486d3e649e8822b01eb4b5250f9d71654ba7de00830a257b3b4eb6ca2c0`, config `sha256:8b7a7d6fc7eb7f4aa2d6f3f2790f3986423b0972a361c6061fd87df3601a9320`. |
| `./scripts/database.sh up test`; sequential `./scripts/database.sh api-verify test` twice unchanged; `/private/tmp/storage-minis-stage48-live.py` | Final helper/image passed repeat success (1.46s/1.88s), explicit free port (2.13s), bad injected password (nonzero, 2.53s), collision (nonzero, 1.00s), outer TERM (143, 3.21s) and INT (130, 3.18s). Each scenario's probe IDs/ports/transcript/cleanup are checkpointed above; no cache/build/pull/dependency or schema consumer overlaps. |
| In-memory inspection of real interrupted probes | Actual expected image, plain Node/nonroot, `NODE_ENV=test`, exact test tuple, selected password only, no Doppler/raw managed keys or URL, zero source/dependency mounts and one host-loopback publication. Raw stdout/stderr password sentinels injected by the wrapper never reached either verifier stream. |
| Host `/usr/bin/curl` against owned nonresponding loopback peer | Actual request timeout exit 28 in 8.02s; peer/socket/thread cleaned. Unit scenarios exercise request-child cancellation, overall watchdog cancellation, foreign ownership refusal, force only after graceful-cleanup deadline, failed-inventory nonzero and explicit-port mismatch. Actual 30s readiness test passed in 30.095s. |
| `python3 /private/tmp/storage-minis-stage48-final.py` | Real wrong-config/token/missing-login refusals passed for runtime, dev and smoke. Fresh HOME/PATH-only smoke passed with saved settings, authenticated health, image/port/exit/removal and listener release. Original DB identities, six volumes and saved settings preserved. |
| `./scripts/tooling.sh run pnpm check` (final implementation) | **109 tests / 12 files passed**, all **seven tasks successful**, zero cached tasks, 54.651s. Strict API/DB/root types, ESLint, Prettier and DB finite build passed. No live DB/Doppler prerequisite for ordinary checks. |

AC4-13 and AC4-15 are complete: unchanged 4.5 packaging and 4.6/4.7 runtime/dev
proof remains applicable, both credential paths were rechecked, and the new smoke
path now has complete current security/image/HTTP/signal/cleanup/deadline evidence.
Initial template parsing and wrong zero-exit expectation failures were corrected
and rerun; none is deferred. AC4-06/07/14 outage/serialization completion remains
4.9, AC4-09/17 project drain remains 4.10, finite cache/final handoff remains 4.11.
Schema/process suites were not rerun: their application/schema/lockfile inputs
remain unchanged and predecessor evidence is current; this stage's test consumers
were exclusive and sequential. No new service-outage experiment was started.

All owned probes, API/dev workers, clients and host sockets are gone. Only original
stopped development/test DB containers remain; all six volumes and `.env.compose`
are preserved. Temporary nonsecret harness scripts remain under `/private/tmp`,
outside Git; they contain no managed credentials. No repository source fixture
was needed. Ignored finite outputs/cache remain as normal tooling artifacts.

Current status/approval summaries are synchronized in parent/stage plans,
foundation guide, README, technical direction, local-development and AGENTS;
dated predecessor records are preserved. Commit scope is exactly this stage's
helper/injection/direct alias, focused tests and those necessary documents.
Exact next action: finish documentation/diff validation, stage these files and
execute the recorded local Conventional Commit, resolve its hash, verify
`git status --short`, then stop. Stage 4.9 requires a new assignment; no push/PR
is authorized or performed.

- Final documentation/diff gate passed: `python3 /private/tmp/storage-minis-validate-stage48-docs.py`
  checked eight Markdown files, 30 changed relative links/anchors, 61 tables,
  paired fences, stage/approval summaries and all 18 acceptance IDs, exactly ten
  complete including AC4-13/15. `bash -n scripts/database.sh scripts/verify-api.sh`
  and `git diff --check` passed. Final diff scope is the 13 stage files below;
  initial tree was clean, no unrelated work exists. All required checks are
  complete, no live resources remain. Next stage exact files, inspect staged
  whitespace/stat, execute `test(api): add bounded runtime image smoke verification`,
  resolve actual hash and verify post-commit status; then stop.

## Stage 4.7 — Development image and reload

**State: complete.** Required stage checks passed on 2026-10-29 (America/Maceio).
Overall Step 4 remains in progress; 4.8–4.11 have not started. Completion commit
subject: `feat(api): add isolated development reload workflow`. Resolve its hash
with `git log -1 --format=%H --grep="^feat(api): add isolated development reload workflow$"`.

### Initial checkpoint (historical; before implementation)

**State at this checkpoint: in progress.**

- Verified required branch `WilliamPhilippe/step-4-implementation-plan`; clean
  initial status/diff. HEAD `f92a8ed` completes 4.6; current history contains the
  4.1–4.6 completion commits and their cumulative evidence. No new worktree.
- Read AGENTS, README Docker/PostgreSQL/lifecycle, stage execution/completion/
  checkpoint rules and 4.7 card, parent build/watch/Turbo, development image,
  volumes/security and reload verification contracts, foundation instructions,
  maintenance/one-time setup decisions, current launcher/manifests/task graph.
  Live T06 #26 remains open, no comments; inherited business/operations gates
  remain unchanged. Existing finite-build/runtime/process evidence is inherited
  for unchanged source/lockfile; affected declarations will receive new checks.
- Owner approved the concrete watcher, nonroot development image/service,
  task/environment, narrow injection/aliases and bounded fixture/live-verification
  recommendation in this session. No dependencies or pins change.
- Saved settings: `storage-minis-beijing`, ports 5433/5434. Docker read-only
  inspection passed after sandbox escalation. Only existing stopped development
  and test DB containers; six project volumes include the five tooling volumes.
  No API/watchers/fixture/client/listener owned yet. No managed secrets fetched.
- Required checks pending: focused launcher/security and actual Turbo graph/
  environment isolation, native development image build/model/mount proof,
  finite DB build before watchers, API/compiled DB implementation/schema reload,
  compiler-error recovery, rapid edits and >5s graceful restart, foreground
  TERM/INT cleanup through Doppler/Compose/pnpm/Turbo/Node, strict finite checks.
  AC4-02 pending; AC4-13 remains partial through 4.8.
- Live ownership plan: start/check existing development PostgreSQL without
  migration or reset; foreground `./scripts/database.sh api-dev dev` only after
  image build and another checkpoint. Back up temporary source bytes in
  `/private/tmp`, restore exactly, stop watchers before finite clean builds.
  Stop/remove only the stage-owned api-dev container; return PostgreSQL to its
  initial stopped state, preserving container identity/data/settings/volumes.
- Exact next action: record approval, implement only 4.7, focused checks, then
  checkpoint before bounded live experiments. Synchronize current summaries,
  record exact results/cleanup and commit locally only after required checks pass.
  No 4.8, push or PR work.

### Checkpoint history

- Added approved development Docker target/service, real watcher commands and
  persistent task prerequisites, narrow `api-dev` payload and native aliases.
  Focused launcher/security suite passed: 29 tests in four files, including both
  runtime/dev selected-key injection and special-character passwords, validation
  before fetch, missing keys/network refusal, safe streams and native failures.
  Bash syntax/whitespace passed. Live T04 #23 remains open with no comments.
- Before image build/model/live work: no stage-owned process or source fixture.
  Next run secret-free Compose model/default/volume checks, dev image build
  (600s bound), and actual Turbo dry graph. Then save fixture recovery manifest
  and checkpoint before starting `api-dev dev`. Development DB may be started
  and authenticated only; no migration/reset. Temporary slow route/markers will
  be restored before finite checks. API remains optional, using the existing
  saved project and five initialized tooling volumes.

- Secret-free native `api-dev` image build passed with frozen install and finite
  DB/API builds; image index `sha256:68b7dc57ad969456eace0d66f9a2bdaa02bdf681175ac5b3818feb23d3a240e7`,
  config `sha256:f65842c96d6071d86f58ab672f1cb2f596d7f9f46518df5cc5ca722d9f5ccba5`.
  Model comparison passed: inherited services identical, six identical volumes,
  only default postgres, nonroot dev with exact tooling mounts and loopback port.
- Before temporary/live experiments: prepared bounded host harness
  `/private/tmp/storage-minis-stage47-live.py`; it saves original server/client/
  schema-index/DB-manifest bytes and SHA-256 manifest in
  `/private/tmp/storage-minis-stage47-fixtures` before edits. Temporary diagnostic
  routes report PID/API/DB/schema markers; a 6.5s request proves graceful restart.
  DB finite task asserts no DB/Doppler keys, and live compiler environments are
  inspected without printing values. No business table is read/written.
  TERM and INT target the outer launcher separately; inspect container exit and
  listener release. Finally restore all four files byte for byte, stop/remove
  only api-dev, stop development PostgreSQL back to initial state. No migrations,
  resets, secret changes or test target consumer. On interruption use that backup
  manifest to restore fixtures, native stop api-dev before finite builds, remove
  owned api-dev and stop postgres; preserve its identity/data/volumes/settings.

- Actual Turbo dry graph passed: only finite DB build and two persistent
  uncached dev tasks; both depend on the same build; DB tasks have no credential
  pass-through. First live attempt reached authenticated dev/container startup,
  then the host harness inspected Docker `StopTimeout` under the wrong object
  (`HostConfig` instead of `Config`). Corrected that assertion. Finally cleanup
  restored all fixture bytes, removed api-dev and stopped development DB; no
  implementation failure or migration/reset. Next rerun the bounded live phase.

- Corrected bounded live phase passed. Outer launcher PID 83753, initial container
  host PID 2791. HTTP marker/PID sequence: `(api,db,schema,pid)` =
  `(1,5,101,228)`, API edit `(2,5,101,265)`, DB implementation
  `(2,6,101,285)`, schema `(2,6,102,309)`, corrected compiler error
  `(2,7,102,333)`, rapid API edits `(5,7,102,345)`, slow-drain restart
  `(6,7,102,365)`. Generated DB JS and schema JS/declarations checked.
  Compiler PID 207 had no DB/Doppler keys; actual finite build asserted the same
  and finished before both watchers started. Invalid DB source produced a visible
  TS error and retained byte-identical previous output/PID; correction recovered.
- A 6.5s HTTP request survived source-triggered restart, with new process ready
  after 6.90s. Exact live/ready responses passed. Outer TERM returned 143,
  container 143, listener released in 0.29s; separate outer INT PID 83919/
  container host PID 3479 returned client 130, container 143 in 0.27s. Both
  expected: native Compose translates foreground interruption to container TERM.
  Container image/nonroot/init/grace, five volume overlays, loopback publication,
  selected dev tuple/no Doppler or raw managed-key variables and safe logs passed.
- Finally restored all four fixture files byte for byte; removed only api-dev,
  stopped development PostgreSQL, retained settings/volumes and original DB
  container. Next unresolved check: exercise outer TERM/INT while the 6.5s
  diagnostic response is still in flight (idle signals already passed), using
  the same bounded fixture backup/cleanup contract before finite strict checks.

- Additional in-flight foreground TERM check **failed**: outer PID 84073,
  API PID 160, native client/container exit 143 after 0.28s; curl returned 52
  (empty reply) instead of the delayed response. This is an actual outer-chain
  drain gap, not a harness inspection error. Idle TERM/INT and source restart
  remain valid partial proof; do not mark 4.7 complete or commit completion.
  Fixtures restored and api-dev removed; development DB stopped, data preserved.
- Diagnosis next: minimise with a secret-free slow Node worker and compare the
  pnpm, Turbo and direct Node-watch layers, observing PIDs/parent exits. Ranked
  hypotheses: pnpm exits before children drain; Turbo terminates early; Node
  watch outer-signal path differs from restart. Any changed development command
  or retained signal protection needs concrete owner approval before coding.

- Prepared `/private/tmp/storage-minis-stage47-signal-probe.py`: secret-free
  single-worker reproduction using the built development image, an isolated
  `/private/tmp` fixture bind and unique owned probe containers. Compare direct
  Node, native Node watch, pnpm exec and pnpm run under Docker init with 15s grace;
  worker logs ready/signal/drained after 6.5s. No repository fixture edits or DB.
  Each probe is removed in finally. This isolates the failing outer-chain layer
  before proposing any command/protection amendment.

- Minimal diagnosis completed: direct Node 6.62s, Node watch 6.63s, pnpm exec
  6.63s, pnpm run 6.63s and direct Turbo 6.64s all drained; pnpm wrapping Turbo
  under TERM force-stopped after 0.09s. Native Node `--run` also exited early
  (0.09s) and was rejected. With native Docker SIGINT stop, pnpm exec/Turbo and
  pnpm run/Turbo each drained in 6.64s. Unique probe containers removed in finally;
  no DB, repository source or dependencies changed by diagnosis.
- Owner approved the declarative `api-dev`-only `stop_signal: SIGINT` amendment,
  recorded with rationale/alternatives in technical direction; implemented that
  one line. No custom signal helper or command/pin change. Next rerun canonical
  in-flight outer TERM and INT using the same backed-up 6.5s fixture; verify
  response completion, native client/container exit separately, no force kill,
  listener release, exact source restoration and initial DB/container state.

- Canonical in-flight foreground verification now **passed** with the approved
  SIGINT stop setting. Outer TERM PID 84481 / container host PID 6188 / API PID
  158 drained the full 6.5s response and stopped in 6.63s; client 143, container 0.
  Separate outer INT PID 84541 / container host PID 6550 / API PID 158 drained
  and stopped in 6.65s; client 130, container 0. Native Turbo completes its interrupted
  task shutdown normally; report container/client statuses separately from the
  inherited direct-Node 130/143 convention.
  No forced kill, listener or running child remains. Secret/log/mount/tuple
  assertions passed again. All four source fixtures restored byte for byte,
  api-dev removed and development DB returned to initial stopped state.
- Watchers are stopped before finite checks. Next run finite API/DB build,
  affected strict type/lint/format checks, final model/graph and cleanup/source
  restoration checks. Then synchronize current summaries/instructions/approval,
  validate documentation and final diff, stage only 4.7 files and commit locally.

- Finite DB/API build and strict typecheck/lint/format all passed after watchers
  stopped and fixtures restored. Before final verification, add one focused
  transitive schema-leaf scenario: temporary marker in `schema/enums.ts`, leaving
  `schema/index.ts` unchanged, prove emitted leaf JS/declarations and changed HTTP
  consumer PID/value. Use the same original-byte backup/finally restoration and
  owned development resource cleanup. Then finite build again because emitted
  fixture output must be replaced. No new implementation or dependency choice.

- Transitive schema-leaf scenario passed through unchanged `schema/index.ts`:
  outer PID 84918 / container host PID 7962; HTTP schema marker 101/API PID 228
  changed to 102/PID 266 after editing only `schema/enums.ts`. Both emitted leaf
  JS and declarations contained the new marker. Outer INT then stopped in 0.22s,
  client 130/container 0; all original bytes/resources restored again.
- Clean finite build after that fixture restored both packages from valid Turbo
  outputs. Final native `build api api-dev` passed with no credentials; frozen
  dependency policy/64-package production deploy retained. Dev content config
  remained `sha256:f65842c96d6071d86f58ab672f1cb2f596d7f9f46518df5cc5ca722d9f5ccba5`;
  final attested dev index `sha256:fc2c235b087810fb2fa8909d3747e2e7b7b8c4721c82cb43bf4925958eb26ca0`.
  Runtime index `sha256:5d920420abf84e5114c6e757665f011a0445c842015e16ea17b25fa43f66ad9c`,
  config `sha256:03b46340674fc0b8e7e407b8ae22bb6de74d51c600760550c284313bacff4a33`.
- Final model/security/cleanup assertions passed: real wrong-config, token,
  invalid-port and missing-login dev refusals occur before payload startup;
  inherited services/volumes/default selection unchanged; approved SIGINT and
  exact tooling overlays; original fixture SHA-256 values, no generated markers,
  original saved settings, only the two original stopped DB containers, no API,
  watcher, client, probe container or port-3000 listener. Documentation and final
  staged diff checks precede the local completion commit; no later-stage work.

- Final documentation validation passed: eight changed Markdown files, 293
  relative links/anchors, paired fences/consistent tables, all 18 distinct AC4
  IDs with exactly AC4-01/02/03/04/05/08/10/11 complete. Current status/approval
  summaries agree on 4.1–4.7 complete, 4.8–4.11 not started and AC4-13 partial.
  Final diff review contains only the 16 stage files; no application/schema/
  migration/lockfile or unrelated fixture changes. Next: stage that exact set,
  check staged whitespace, execute the recorded Conventional Commit, resolve
  actual hash and verify clean status, then stop.

### Completed handoff (2026-10-29, America/Maceio)

Implemented the [approved watcher/development/injection choices and SIGINT amendment](technical-direction.md#step-47-development-image-and-reload-approval-2026-10-29).
The API Dockerfile's nonroot development target runs root `pnpm dev`. Canonical
`api-dev` overlays the checkout and existing five nocopy tooling volumes; both
persistent uncached tasks wait for one finite DB build. Only API dev receives
named runtime settings. `database.sh api-dev dev|test` reuses the selected-key,
no-fallback host boundary and native foreground Compose. Build/stop aliases now
select both real services, and `docker:api:dev` is available. No new packages,
versions, host dependency mount, setting key, volume, dispatcher or migration.

| Check / exact command | Result |
| --- | --- |
| `git branch --show-current`; `git status --short`; `git diff --stat`; `git log -8 --oneline` | Required shared branch and clean initial tree; 4.1–4.6 completed evidence/commits present. Preserved existing checkout; no worktree or branch added. |
| `gh issue view 26 --repo WilliamPhilippe/storage-minis-be --json number,title,state,body,comments` and same for `23` | Open, no comments; delivery/production and business prerequisites unchanged. No issue mutation. |
| `bash -n scripts/database.sh`; `git diff --check` | Passed. |
| `./scripts/tooling.sh run pnpm exec vitest run --project db-unit src/launcher.test.ts src/docker-launcher.test.ts src/local-setup.test.ts src/diagnostics.test.ts` | 29 tests passed across four files. Both API operations cover selected dev/test key, special-character passwords, missing key/fetch refusal despite ambient credentials, pre-fetch validation, safe stdout/stderr and native failure propagation. |
| `env -i HOME="$HOME" PATH="$PATH" docker compose --env-file .env.compose --file compose.yaml build api-dev` (executed via Python `subprocess.run`, 600s bound); final same native command with `build api api-dev` | Passed frozen install, finite DB/API builds, nonroot dev and retained portable production packaging. Exact image identities above; no DB/Doppler credentials in builds. |
| `python3 /private/tmp/storage-minis-stage47-graph.py` (actual `./scripts/tooling.sh run pnpm dev --dry=json`) | Passed: one finite DB build shared by two uncached persistent watchers, no persistent finite prerequisite, no DB task credential pass-through. |
| `python3 /private/tmp/storage-minis-stage47-live.py` | Corrected harness passed finite-build-before-watch ordering, actual finite compiler environment assertion, live compiler PID 207 environment isolation, API/DB/schema reload/PIDs, JS/declaration output, visible compiler rejection and correction, rapid edits and 6.90s graceful restart with a complete delayed HTTP response. First inspection-only harness error preserved above. |
| Canonical `./scripts/database.sh up dev`; `./scripts/database.sh api-dev dev` inside bounded live harnesses | Matching real dev credentials, selected tuple/no Doppler/raw managed keys or URL variables in container; nonroot/init/grace/loopback/five-volume overlay checks; exact `/health/live` and `/health/ready` HTTP 200 bodies. No migration, reset or business-table change. |
| Minimal secret-free Node/watch/pnpm/Turbo probes and `python3 /private/tmp/storage-minis-stage47-signals.py` | Initial TERM-chain failure exposed and diagnosed; owner approved native SIGINT. Full canonical in-flight outer TERM and INT then passed, complete 6.5s responses, client 143/130 and container 0 in 6.63s/6.65s. PIDs and rejected alternatives recorded above. No force kill/listener/child leak. |
| `python3 /private/tmp/storage-minis-stage47-schema-leaf.py` | Compiled transitive `schema/enums.ts` marker and declaration changed through unchanged schema index, consumer PID/value changed; exact bytes restored and watchers stopped. |
| `./scripts/tooling.sh run pnpm build`; `./scripts/tooling.sh run pnpm typecheck`; `./scripts/tooling.sh run pnpm lint`; `./scripts/tooling.sh run pnpm format:check` | All passed after watchers stopped and source restoration: finite API/DB builds, four Turbo type/build tasks, strict ESLint and existing Prettier. Repeated finite build after the final schema fixture restored clean cached outputs; no fixture markers remain. |
| `python3 /private/tmp/storage-minis-stage47-final.py` | Final secret-free model/refusal/source/generated-output/resource/settings assertions passed. No running container/API listener; only original stopped development/test DB containers retained. |
| Native `stop api-dev`, `rm --force api-dev`, `stop --timeout 10 postgres` in each live harness's finally path | Removed only owned API/probe resources, returned development DB to initial stopped state, preserved its data/identity, six named volumes and saved settings. Test service remained untouched/stopped. |

AC4-02 is complete. AC4-13 now has runtime and development credential isolation/
refusal/compiler-boundary evidence and remains **partial** until the 4.8 smoke
path. AC4-09/AC4-17 have development foreground proof; full project drain/teardown
remains 4.10. AC4-12 has actual persistent-graph proof; final finite cache/source
invalidation remains 4.11. This is partial Step 4 delivery, not full Step 4, T06,
business or production acceptance.

Required 4.7 checks passed; initial harness/TERM failures were corrected and
verified, not deferred. Full `pnpm check` is next required at milestone 4.8;
schema/API process suites, runtime smoke, outage and project-wide teardown/cache
experiments were not rerun as part of this stage. Prior unchanged application/
schema/lockfile/process behavior retains its recorded 4.1–4.6 evidence; changed
launcher/manifests/task declarations received focused/strict/native checks here.
No test-target consumer or managed-secret modification occurred.

All temporary source fixtures are restored byte for byte; finite outputs contain
no diagnostic routes/markers. Diagnostic scripts/fixtures remain only under
`/private/tmp` (minimal prototypes archived in `storage-minis-stage47-debug`),
not in the commit. They contain no credentials; environment inspections stayed
in memory and output only safe assertion/PID results. No stage-owned live
resource remains. User-facing recovery/commands and current status/approval
summaries are synchronized in README, local-development, parent/stage plans,
foundation guide, technical direction and AGENTS; dated history is preserved.

Commit scope: only the 4.7 development declarations/launcher/watchers, focused
security tests and necessary documentation/evidence. No unrelated initial work.
Next action after final documentation/diff checks: stage those files, execute
`feat(api): add isolated development reload workflow`, resolve actual hash,
verify `git status --short`, then stop. Stage 4.8 requires its separate assignment;
no 4.8 implementation, push or PR is authorized here.

## Stage 4.6 — Canonical Compose and Doppler startup

**State: complete.** Required stage checks passed on 2026-10-29 (America/Maceio).
Overall Step 4 remains in progress; 4.7–4.11 have not started. Completion commit
subject: `feat(api): add guarded canonical Compose runtime startup`. Resolve its
hash with `git log -1 --format=%H --grep="^feat(api): add guarded canonical Compose runtime startup$"`.

### Initial checkpoint (historical; before implementation)

- Checkout/branch: `/Users/william/Documents/code/storage-minis`, verified
  `WilliamPhilippe/step-4-implementation-plan`; base `4fd7856` (stage 4.5).
  Initial Git status/diff clean. No branch/worktree created.
- Read AGENTS, README Docker/PostgreSQL/lifecycle guidance, approved maintenance
  and one-time setup records, foundation/stage execution and completion rules,
  4.6 card, parent Compose/saved-settings/credential/shutdown/security contracts,
  `database.sh`, `local-config.sh`, inherited launcher/diagnostic tests and
  predecessor evidence. Stages 4.1–4.5 are complete in current history; unchanged
  source/lockfile/image inputs retain their earlier build/process evidence.
- Existing runtime `storage-minis-api:stage4.5` is present, linux/arm64, image ID
  `sha256:2f4d52f5f1d63184f7f17c627387924722004431a01c3a144ea3665b32aca344`.
  Docker access requires sandbox escalation; read-only inspection passed.
  Saved settings remain exactly project `storage-minis-beijing`, ports 5433/5434.
  Both existing PostgreSQL containers are stopped. No stage-owned running resource,
  API port, fixture, watcher, DB client or credential fetch exists.
- Pending approval: concrete P4-07/P4-11 runtime service/health/injection/alias
  subset before coding. Inherited canonical model, three-key settings, selected
  secret/no-fallback boundary and service-grace amendment remain approved.
- Live issue JSON reads for T06/#26 and T04/#23 hit sandbox network restrictions;
  retry with network access. No issue mutation, migration or managed-secret change.
- Required checks pending: focused launcher/security plus affected strict checks;
  secret-free canonical model/build/status/log/stop; native runtime build;
  exclusive test DB preparation, authenticated API startup/exact loopback HTTP,
  explicit collision refusal, native stop and fresh-environment saved settings.
  AC4-01 pending; AC4-13 partial through 4.7–4.8; drain proof remains 4.10.
- Ownership/cleanup before live work: use only test PostgreSQL and runtime `api`
  in saved project; preserve stopped development container/volume. Stop owned API
  with `docker compose --env-file .env.compose --file compose.yaml stop api`;
  stop test only after all clients close with the same prefix plus
  `stop --timeout 10 postgres_test`. No full-project teardown or volume deletion.
  Checkpoint again before starting these resources or a collision listener.
- Exact next action: obtain uncovered 4.6 approval; meanwhile finish read-only
  prerequisite/command inspection. Implement only 4.6, verify, synchronize current
  summaries/evidence and make its local Conventional Commit. No push/PR.

### Checkpoint history

- 2026-10-29: owner approved the concrete runtime/service/health/launcher/alias
  scope; recorded in technical direction. Live T06/#26 and T04/#23 JSON reads
  succeeded after network escalation: both open, no comments, dependencies and
  deferred business/production boundaries unchanged. Added runtime service,
  `api-up`, direct runtime aliases and service-grace correction. Extended existing
  launcher fixtures; no new packages/settings/model/dispatcher or later service.
  No running resource or fixture edit yet. Next: focused tests/strict checks,
  then checkpoint and execute native model/build/live verification.
- Focused verification passed: 25 tests across launcher, volume guard, saved
  setup and diagnostic files; Bash syntax/diff whitespace passed. Secret-free
  model comparison against HEAD passed: only `api` added, five inherited services
  byte-equivalent after resolution, same six resolved volume identities, default
  selection only `postgres`, empty credentials and expected health/grace/port.
- Before native build/live experiments: no stage-owned service is running; DB
  consumers are absent and both original DB containers remain stopped. Build
  `docker compose --env-file .env.compose --file compose.yaml build api` in a
  fresh secret-free environment (600s attempt bound). Then exclusively own test
  PostgreSQL via `./scripts/database.sh up test` and runtime via
  `./scripts/database.sh api-up test`; no schema suite/process suite/outage runs
  concurrently. Probe only after image/container/publication ownership checks.
  A temporary host socket owns the explicit collision port and closes in finally.
  Cleanup: native `stop api`, remove only stage-created `api` container with
  `rm --force api`, then `stop --timeout 10 postgres_test`; preserve development,
  named volumes, saved settings and retained image. All experiments have bounded
  subprocesses and cleanup; no source fixtures or managed-secret edits.
- Native Compose runtime build passed with no credential environment, including
  frozen install, finite DB/API builds and 64-package production deployment.
  Tag `storage-minis-beijing-api:step4`, image/index
  `sha256:13a5e1e7b00a86537ad000dd1ee0142e867b3ccb5ea97d0c83e929a85296345e`.
  Typecheck (four Turbo tasks), lint and format all passed.
- First live attempt passed secret-free native status/log/stop, real wrong-config,
  token, invalid-port/level and missing-login refusal, test DB preparation,
  authenticated healthy API/image/nonroot/no-mount checks and both exact HTTP
  responses. The temporary harness then asserted an invented `startup_ready`
  marker; source emits `listening`. Its cleanup ran, but its final inspection
  guard also wrongly treated captured container environment JSON as printed
  command output. Corrected both harness assumptions; no application changes.
  Confirmed API removed and both original DB containers stopped. No credentials
  were printed/stored. Next: rerun the owned live phase to complete idempotence,
  native exit/listener release, collision, ambient-input and cleanup assertions.
- Corrected live phase passed in full. Native startup selected only the test
  DB tuple through matching managed credentials. Fresh-environment default port
  3000 and repeated idempotent startup used the same owned API container. Exact
  live/ready bodies returned HTTP 200. Inspection confirmed the built image,
  node user/plain Node CMD, init, 15s grace, no mounts, fixed container settings,
  only loopback publication and no Doppler/raw managed-key/URL variables.
  Native logs and health output contained no injected password.
- Native API-only stop returned application exit 143, released port 3000 in
  0.23s and preserved running test PostgreSQL. An owned listener on 60819 caused
  explicit startup failure while retaining that listener. Successful override
  on 60823 then proved ambient PG/URL/HTTP/Compose settings were discarded.
  All commands used fresh HOME/PATH-only environments plus deliberate fixture
  overrides. Cleanup removed only the stage-created API container and stopped
  test PostgreSQL; development container ID/state and saved settings unchanged.
  No running project consumer, collision listener, watcher or source fixture.
  Next: synchronize completion summaries, validate documentation/final diff,
  execute the local completion commit and verify hash/status.
- Final documentation validation passed: eight changed Markdown files, 281
  relative links/anchors, paired fences/consistent tables, 18 distinct acceptance
  IDs with exactly AC4-01/03/04/05/08/10/11 complete. Current summaries/approval
  links agree on 4.1–4.6 complete, 4.7–4.11 not started and AC4-13 partial.
  Final diff review covers only 14 stage files, with unchanged lockfile/schema/
  migration/API application source and no unrelated work. Resource cleanup is
  complete. Next: stage this exact diff, check staged whitespace, commit with
  the recorded subject, verify actual hash and clean status, then stop.

### Completed handoff (2026-10-29, America/Maceio)

Approved scope and rationale are in
[technical direction](technical-direction.md#step-46-compose-runtime-and-startup-approval-2026-10-29).
Canonical `compose.yaml` adds only runtime `api` under profile `api`, with native
runtime build, project-scoped image, loopback publication, Node readiness health,
init, no restart and 15s grace. It has no mounts or implicit DB startup.
`database.sh api-up dev|test` validates settings before fetch, clears ambient
connection inputs and reuses the selected-key/no-fallback Doppler boundary and
payload stderr forwarding. It delegates lifecycle/waiting to native Compose.
Native build/up/log/stop aliases are available; existing `docker:ps` covers status.
Project stop/prune and guarded full volume cleanup honor service grace; explicit
DB-only stop/reset retains 10s. No dependencies, general dispatcher, extra model,
settings keys, `api-dev` or `api-verify` placeholders were added.

| Check / exact command | Result |
| --- | --- |
| `git branch --show-current`; initial `git status --short`; `git log -8 --oneline` | Required shared branch, clean initial tree, 4.1–4.5 completion commits present; predecessor is `4fd7856`. |
| `docker image inspect storage-minis-api:stage4.5 --format '{{.Id}} {{.Os}}/{{.Architecture}}'` | Predecessor image present, ID recorded above. Prior unchanged configuration/lifecycle/package evidence remains applicable; current manifest/launcher changes received new checks/build. |
| `bash -n scripts/database.sh scripts/local-config.sh scripts/reset-volumes.sh`; `git diff --check` | Passed. |
| `./scripts/tooling.sh run pnpm exec vitest run --project db-unit src/launcher.test.ts src/docker-launcher.test.ts src/local-setup.test.ts src/diagnostics.test.ts` | 25 tests passed. Covers selected dev/test key, special-character password preservation, missing key/network refusal despite ambient passwords, pre-fetch target/config/token/port/level rejection, native failure propagation and safe stdout/stderr diagnostics, saved settings and guarded cleanup. |
| `./scripts/tooling.sh run pnpm typecheck`; `./scripts/tooling.sh run pnpm lint`; `./scripts/tooling.sh run pnpm format:check` | Passed: four Turbo build/type tasks, strict root/API/DB types, ESLint and existing Prettier. |
| `python3 /private/tmp/storage-minis-stage46-model.py` | Fresh secret-free native Compose comparison against `git show HEAD:compose.yaml`: only API added, all five inherited services unchanged, six resolved volumes identical, default service only postgres, empty credential defaults and correct runtime profile/health/grace/publication. |
| `env -i HOME="$HOME" PATH="$PATH" docker compose --env-file .env.compose --file compose.yaml build api` | Native build passed without DB/Doppler; frozen install, finite DB/API build and portable 64-package deployment. Tag `storage-minis-beijing-api:step4`, linux/arm64; image/index `sha256:13a5e1e7b00a86537ad000dd1ee0142e867b3ccb5ea97d0c83e929a85296345e`, config `sha256:8c169230d867460c977c5d1e415808ea1723a0083d70af74c531f065d5d7a556`. |
| `python3 /private/tmp/storage-minis-stage46-live.py` | Corrected bounded host harness passed all assertions; first harness-only failures/corrections recorded above. Uses only HOME/PATH plus deliberate nonsecret overrides, captures inspection in memory, prints only allowlisted results. |
| `./scripts/database.sh up test`; `./scripts/database.sh api-up test` (fresh environment, repeated) | Matching real Doppler test credentials; native API healthy with same container on repeated startup, correct image/node/plain Node/init/grace, no mounts or credential metadata. Default loopback port 3000. No build/pull/migration at startup. |
| `/usr/bin/curl --noproxy '*' --silent --show-error --max-time 8 --write-out '\n%{http_code}' http://127.0.0.1:3000/health/live` and same for `ready` | Exact `{"status":"ok"}` / `{"status":"ready"}` plus HTTP 200; override port 60823 also passed. Only owned API image/container was probed. |
| Native `logs --no-color api`, `stop api`, and `--profile '*' ps --all` with unavailable Doppler, contradictory config and fixture token | Passed without fetching secrets. Actual logs/health output checked against injected password in memory; no credentials printed or persisted. Stop exited 143, not OOM/SIGKILL, and released port in 0.23s; DB remained running. |
| `API_HOST_PORT=60819 ./scripts/database.sh api-up test` with an owned collision socket; then valid port 60823 with ambient PG/URL/HTTP/Compose sentinels | Collision failed nonzero, original listener retained, no API running. Subsequent startup discarded all ambient connection/HTTP/Compose inputs and published only selected loopback port. Listener closed in finally. |
| Native `stop api`, `rm --force api`, `stop --timeout 10 postgres_test` | Cleanup passed. API container removed, test stopped, no project consumer/listener/client/watcher; development container ID/state unchanged and saved settings byte-identical. No volume deletion or managed-secret change. |
| `python3 /private/tmp/storage-minis-validate-stage-4.6-docs.py`; `git diff --check` | Passed: eight Markdown files, 281 relative links/anchors, fences/tables, current summaries/approval links and all 18 criteria; exactly seven criteria complete. |

Build and live attempts stayed within the existing 600s/individual command bounds.
Temporary verification scripts remain only in `/private/tmp`, outside the commit;
they contain no credentials and created no source fixtures. No schema suite,
process suite, image-smoke or outage consumer overlapped this test phase. Prior
schema/process evidence is reused because application/schema/lockfile behavior
is unchanged. Full aggregate milestone is next required at 4.8; this stage ran
focused and affected strict checks. Development/reload, automated image smoke,
outage recovery, full project drain and final cache/aggregate checks remain unrun
for their assigned stages. No full Step 4/T06/business/production acceptance.

AC4-01 is complete. AC4-13 has runtime credential/refusal/safe-diagnostic evidence
but remains partial through 4.7–4.8. AC4-09/AC4-17 remain partial through 4.10;
native API-only immediate shutdown does not claim in-flight project drain proof.
AC4-11 packaging remains valid. Parent plan, stage table, foundation guide,
README, technical direction, current local-development reference and AGENTS are
synchronized; dated predecessor evidence remains historical.

Commit scope: only the 4.6 runtime/launcher/aliases/grace changes, their focused
tests and affected documentation; there was no unrelated initial diff. After
documentation/diff validation, stage these files and execute the completion
subject above, resolve hash, verify `git status --short` and stop. Next assigned
work is 4.7, beginning with its uncovered approvals; no push/PR is authorized.

## Stage 4.5 — Self-contained runtime image

**State: complete.** Required runtime packaging and affected build/strict checks
passed across 2026-10-28–29 (America/Maceio). Overall Step 4 remains in progress;
stages 4.6–4.11 are not started. Completion commit subject:
`build(api): package portable nonroot runtime image`. Resolve its hash with
`git log -1 --format=%H --grep="^build(api): package portable nonroot runtime image$"`.

### Initial checkpoint (2026-10-28, America/Maceio)

Historical snapshot saved in progress before implementation.

- Checkout: `/Users/william/Documents/code/storage-minis`; branch verified as
  `WilliamPhilippe/step-4-implementation-plan`; base
  `2510bddfc07b81991a8782f39ba1d5c874f415ab`. Initial status/diff clean.
- Predecessors: 4.1 `472e0a7`, 4.2 `29509a3`, 4.3 `230a348`, 4.4 `2510bdd`
  are complete. Current source/lockfile/build inputs match their handoffs.
  Reuse their configuration, compiled exports, lifecycle, 85-unit-test aggregate
  and real process/basic-signal evidence; rerun affected build/strict checks.
- Read AGENTS, README Docker tooling, stage execution/completion/checkpoint
  rules and 4.5 card, parent P4-11/image/package/compiled-export contract and
  foundation guide. Live T06/#26 and T04/#23 remain open with no comments;
  business writers, authorization and production operations remain deferred.
  Official pnpm deploy and Docker context/multi-stage documentation reviewed.
- Approval pending: recommended exact pinned Node/pnpm build/package/runtime
  stages, frozen install/build/pnpm deploy, API/DB `files: ["dist"]`, explicit
  copied inputs and local-file exclusions, node-owned `/app`, plain Node command
  and `HOST=0.0.0.0`, `PORT=3000`, `NODE_ENV=production`. No implementation
  before owner approval; development/Compose registration remain later stages.
- Resources: existing tooling image
  `sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`;
  existing Beijing PostgreSQL containers both stopped, ports 5433/5434 retained.
  Docker inspection succeeded after sandbox escalation. No stage image, probe,
  listener, watcher, DB/Doppler access or temporary fixture exists.
- Required checks pending: root-context runtime build, image configuration and
  production graph/compiled schema/declarations/internal-link inspection,
  environment/credential exclusion proof, affected build/type/lint/format,
  documentation/diff review and local Conventional Commit. AC4-11 is partial;
  authenticated image startup and AC4-01 remain 4.6.
- Next action: await scoped packaging approval; meanwhile inspect existing
  predecessor identities and prepare verification commands. Then record approval,
  implement only 4.5 and checkpoint before build/temporary probes. No push/PR.

### Checkpoint history

- 2026-10-28: owner approved the recommended packaging in this session;
  [scope and rationale](technical-direction.md#step-45-runtime-image-packaging-approval-2026-10-28)
  recorded before implementation. Added only the three Dockerfile targets,
  root exclusions and API/DB dist file lists. Tooling/Compose/lockfile/source
  unchanged. Before first image build: no temporary fixture, probe or new image;
  both PostgreSQL containers remain stopped. Next: root-context runtime build,
  offline image assertions and affected strict/build checks.

- 2026-10-28: first runtime build and existing-tooling finite DB/API build
  passed. pnpm 12.15.0 deployed 64 production packages without injection changes;
  runtime tag `storage-minis-api:stage4.5`, image/index
  `sha256:2c5830766572d41d1da886ad3a60a80cff80a6dc3af080826bcad6835d4c429a`,
  linux/arm64. Metadata confirms node `/app`, exact plain-Node CMD/defaults,
  port 3000 and no volumes. First metadata template assumed an optional Volumes
  field existed; corrected inspection passed without changing the image.
- Before exclusion fixtures/offline probes: create only known nonsecret sentinel
  files under root/API source (environment/credential patterns); rebuild runtime
  and expose the cached build target for inspection, then remove those exact
  fixtures. Preserve every original file. Probes use `--network none`, no mount,
  no port, no credentials and `--rm`; they import packaged modules and inspect
  files, without starting the API/DB. Both original DB containers stay stopped.
  Required next actions: offline assertions, fixture cleanup, strict check
  results, current-summary synchronization and completion commit.

- 2026-10-28: build-target exclusion assertions passed with all five nonsecret
  sentinels absent, including files inside the explicitly copied API source
  directory. All exact fixtures were removed afterward. Initial affected types
  and lint passed; formatting requested expansion of the two manifest file
  arrays. Applied existing Prettier, rebuilt the runtime from final inputs and
  reran build/type/lint/format successfully.
- Final offline runtime probe passed: UID 1000, 64 production packages, 141 links
  wholly inside `/app`, 4 API modules, 14 DB modules, their full declarations and
  33 imported schema tables. Metadata/layer assertions passed. An optional base
  inspection initially assumed BuildKit's base was registered as a local image;
  it was not. The corrected comparison uses the existing tooling image's shared
  pinned-base layers and requires exactly two additional runtime filesystem
  layers. Neither metadata harness correction required an application change.
- Current summaries and approval references synchronized; AC4-11 complete,
  AC4-01 still partial. Temporary build-image tag removed, runtime retained;
  both original PostgreSQL containers stopped and one-off probes self-removed.
  Final documentation/diff validation and local commit are the only handoff work.
- 2026-10-29: documentation validation passed for seven changed Markdown files,
  253 relative links/anchors, fences/tables and 18 distinct acceptance IDs.
  Current summaries agree on 4.1–4.5 complete, 4.6–4.11 not started and six
  complete criteria; AC4-01 remains partial. Final diff review is limited to
  eleven stage files. Next: stage those files, check the staged diff, execute
  the completion commit, verify hash/status and stop.

### Completed handoff (2026-10-29, America/Maceio)

Implemented the [approved stage 4.5 packaging](technical-direction.md#step-45-runtime-image-packaging-approval-2026-10-28)
in `docker/Dockerfile.api`, root `.dockerignore` and API/DB package `files`.
The existing Node digest and pnpm 12.15.0 are unchanged. Build copies explicit
workspace/compiler/task/source inputs, installs the frozen shared lockfile and
runs finite DB → API builds. Package uses
`pnpm --filter=@storage-minis/api --prod deploy /out`, without changing workspace
injection policy. Runtime copies only that output onto the fresh pinned Node
base; files belong to `node` and plain Node executes `dist/server.js` from `/app`.
Container defaults are production, `0.0.0.0`, port 3000. The inherited official
entrypoint execs the command. Base npm/Yarn remain inherited; pnpm/Turbo/tsx/
TypeScript/test/lint tools and the build store are absent from runtime.

Runtime inspection covered every expected compiler output: 4 API ESM modules,
their declarations and source maps (12 files), and 14 DB ESM modules with their
declarations (28 files), including every schema module. Plain Node imported
Fastify 5.12.7, Zod 4.6.7, DB exports and its 33-table schema plus API factory,
lifecycle and configuration. pg 8.23.1 and Drizzle 0.45.4 resolve from the DB
package. All 141 symlinks resolve, with no dangling or escaping links; all 64
production package directories are internal. DB resolves at
`/app/node_modules/.pnpm/@storage-minis+db@file++++workspace+packages+db/node_modules/@storage-minis/db/dist/index.js`.
The workspace deployment rewrites its link into the portable pnpm package tree.
No API/DB source, tests, scripts, migration data or compiler configuration is
packaged. The application never runs an install or migration at startup.

Local environment/credential patterns and host dependencies/dist/caches/logs
are excluded. Five known nonsecret fixtures tested root `.env.stage45`, API
source `.env.stage45`, `.npmrc`, `stage45-credentials.json` and
`.doppler/stage45-sentinel`. The copied-source layers stayed cached; build-target
inspection asserted all absent, along with `.env.compose`, Git history and
source tests. Runtime inspection scanned all 5,824 physical files and checked
local environment/credential names, production-tool exclusions, node-owned
package files and resolved links. No real credential was inspected or copied.
Fixtures were deleted only after confirming their exact sentinel bytes; no
original file was overwritten. All probes had network disabled, no mounts,
no published port, no DB/Doppler settings and automatic container removal.

Identity of final tested inputs: SHA256
`6681612f6d842b10b855a03e329d0853ae1ef39f18cb5e1bd270a3aa62d35cb7`.
This hashes sorted path + NUL + bytes + NUL for 38 files: Dockerfile/ignore,
root package/lock/workspace/Node pin, copied root compiler/task/check configuration,
API/DB manifests/compiler configuration and all non-test API/DB source modules.
Exact path inventory is also retained for this session at
`/private/tmp/storage-minis-stage45-inputs.json`. Unchanged lockfile SHA256:
`811388817ef6b9a342fd07dd4b2b6ef0659386bad5a917809c4f39c9743657f9`.
Final runtime tag `storage-minis-api:stage4.5`, linux/arm64:

- Image/index: `sha256:2f4d52f5f1d63184f7f17c627387924722004431a01c3a144ea3665b32aca344`.
- Platform manifest: `sha256:32d21ec2409e7915afe6287874323bab76121806393e9d568b3e00c340d12e57`.
- Image config: `sha256:4306892f035958b94055d3cc389370e036987697c4a09630718ed03a87d2d8af`.
- Base: `node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205`.
- Existing tooling: `sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`.

Commands ran from the repository root across 2026-10-28–29 with both DB services
stopped. Build registry access is needed; DB/Doppler access is not.

| Exact command | Final result |
| --- | --- |
| `docker build --file docker/Dockerfile.api --target runtime --tag storage-minis-api:stage4.5 .` | Passed initially, with exclusion fixtures, and after final manifest formatting. Frozen install uses pnpm 12.15.0; 2 finite build tasks pass; deploy includes 64 production packages. |
| `docker build --file docker/Dockerfile.api --target build --tag storage-minis-api-build:stage4.5 .` | Passed, reusing cached source/build layers while exclusion fixtures existed. Offline build-target assertions passed; temporary tag later removed. |
| `./scripts/tooling.sh run pnpm build` | Passed DB/API finite builds; repeated after manifest formatting. |
| `./scripts/tooling.sh run sh -c 'pnpm typecheck && pnpm lint && pnpm format:check'` | Initial type/lint pass; only manifest formatting failed, corrected below. |
| `./scripts/tooling.sh run pnpm exec prettier --write apps/api/package.json packages/db/package.json` | Passed; expanded `files` arrays using existing configuration. |
| `./scripts/tooling.sh run sh -c 'pnpm build && pnpm typecheck && pnpm lint && pnpm format:check'` | Final pass: 2 finite builds, 4 type tasks, zero-warning lint and all matched formatting. |
| `docker run --rm --network none --interactive --entrypoint node storage-minis-api:stage4.5 --input-type=module < /private/tmp/storage-minis-verify-stage45-image.mjs` | Passed all compiler inventory/runtime/production graph/link/file assertions. Exact probe below; SHA256 `5c3f939556dc663b3dcc5b0478ae7a3bdc1be61d4566919d25c56fbb99c7bd7f`. |
| `docker image inspect storage-minis-api:stage4.5 --format '{{.Id}} {{json .Config}} {{.Os}}/{{.Architecture}}'` and `docker history storage-minis-api:stage4.5 --no-trunc --format '{{.CreatedBy}}'` | Confirmed node user, `/app`, exact Node command/defaults/port, no volume declaration or credential configuration; runtime has only WORKDIR and deployed-tree filesystem layers above the shared pinned base. Host Python assertions against parsed image inspection also passed. |
| `docker image rm storage-minis-api-build:stage4.5` and `docker ps -a --format '{{.Names}} {{.Status}}'` | Temporary build tag removed; only original stopped development/test containers remain. Runtime retained for 4.6. |
| `git diff --check` and `python3 /private/tmp/storage-minis-validate-stage-4.5-docs.py` | Passed links/anchors/fences/tables and current summary/approval/stage/acceptance consistency; six criteria complete, including AC4-11. |

<details>
<summary>Exact offline runtime probe (save to the temporary command path above)</summary>

```js
import assert from "node:assert/strict";
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
const expected = {"api": ["app", "config", "lifecycle", "server"], "db": ["client", "config", "diagnostics", "index", "migrations", "schema/acquisition-and-selling-expenses", "schema/catalog-and-inventory", "schema/customer-funding-and-retention", "schema/enums", "schema/identity-and-access", "schema/index", "schema/losses-and-shared-history", "schema/purchasing-and-supplier-funding", "schema/sales-and-returns"]};
assert.equal(process.version, "v24.22.1");
assert.equal(process.getuid(), 1000);
assert.equal(process.cwd(), "/app");
assert.equal(process.env.HOST, "0.0.0.0");
assert.equal(process.env.PORT, "3000");
assert.equal(process.env.NODE_ENV, "production");
assert(!Object.keys(process.env).some(key => /^(PG|DB_TARGET|DATABASE_URL|DOPPLER)/.test(key)));
for (const path of ["/workspace", "/out", "/pnpm", "/usr/local/bin/pnpm", "/usr/local/bin/tsc", "/usr/local/bin/tsx", "/usr/local/bin/turbo", "/usr/local/bin/doppler"]) assert(!existsSync(path), path);
const dbEntry = fileURLToPath(import.meta.resolve("@storage-minis/db"));
const dbRoot = dirname(dirname(dbEntry));
assert(realpathSync(dbRoot).startsWith("/app/"));
for (const [kind, root] of [["api", "/app"], ["db", dbRoot]]) {
  const manifest = JSON.parse(readFileSync(join(root, "package.json")));
  assert.deepEqual(manifest.files, ["dist"]);
  const actual = readdirSync(join(root, "dist"), { recursive: true }).filter(path => statSync(join(root, "dist", path)).isFile()).sort();
  const suffixes = kind === "api" ? [".js", ".d.ts", ".js.map"] : [".js", ".d.ts"];
  assert.deepEqual(actual, expected[kind].flatMap(stem => suffixes.map(suffix => stem + suffix)).sort());
  for (const path of ["src", "tests", "scripts", "drizzle", "tsconfig.json", "tsconfig.build.json"]) assert(!existsSync(join(root, path)), root + "/" + path);
  assert.equal(statSync(join(root, "package.json")).uid, 1000);
}
const apiRequire = createRequire("/app/package.json");
const dbRequire = createRequire(dbEntry);
for (const [requireAt, name, version] of [[apiRequire, "fastify", "5.12.7"], [apiRequire, "zod", "4.6.7"], [dbRequire, "pg", "8.23.1"], [dbRequire, "drizzle-orm", "0.45.4"]]) {
  let root = dirname(requireAt.resolve(name));
  while (!existsSync(join(root, "package.json")) || JSON.parse(readFileSync(join(root, "package.json"))).name !== name) {
    const parent = dirname(root);
    assert.notEqual(parent, root);
    root = parent;
  }
  assert.equal(JSON.parse(readFileSync(join(root, "package.json"))).version, version);
  assert(realpathSync(root).startsWith("/app/"));
}
const manifests = [];
let links = 0, files = 0;
function walk(root) {
  for (const name of readdirSync(root)) {
    const path = join(root, name), stat = lstatSync(path);
    assert(!/^\.env(?:$|\.)|^\.(?:git|context|doppler|aws|ssh|npmrc|netrc)$|credentials.*\.json$/.test(name), relative("/app", path));
    if (stat.isSymbolicLink()) {
      links++;
      assert(realpathSync(path).startsWith("/app/"), path);
    } else if (stat.isDirectory()) walk(path);
    else {
      files++;
      if (name === "package.json") manifests.push(JSON.parse(readFileSync(path)));
    }
  }
}
walk("/app");
for (const name of ["pnpm", "turbo", "typescript", "tsx", "vitest", "eslint", "prettier", "drizzle-kit", "vite", "esbuild"]) assert(!manifests.some(pkg => pkg.name === name), name);
const productionPackages = readdirSync("/app/node_modules/.pnpm").filter(name => name !== "node_modules" && lstatSync(join("/app/node_modules/.pnpm", name)).isDirectory()).length;
assert.equal(productionPackages, 64);
const db = await import("@storage-minis/db");
const tables = Object.values(db.schema).filter(value => value && typeof value === "object" && Symbol.for("drizzle:Name") in value);
assert.equal(tables.length, 33);
assert.equal(typeof db.createDatabase, "function");
assert.equal(typeof (await import("fastify")).default, "function");
assert.equal(typeof (await import("zod")).z.object, "function");
assert.equal(typeof (await import("./dist/app.js")).buildApp, "function");
assert.equal(typeof (await import("./dist/lifecycle.js")).startLifecycle, "function");
await import("./dist/config.js");
console.log(JSON.stringify({ result: "passed", node: process.version, uid: process.getuid(), productionPackages, internalLinks: links, files, apiModules: expected.api.length, dbModules: expected.db.length, schemaTables: tables.length, dbEntry }));
```

</details>

The initial metadata-template/BuildKit-base inspection issues and manifest
format failure above were verification/setup issues; the documentation validator
also needed to recognize technical direction’s own approval heading rather than
requiring it to link to itself. Its corrected assertions pass; all final required checks
pass. No required stage check remains failed or unrun. Previous 85-unit-test
aggregate, real process/basic-signal and compiled-export/stale-file-removal
proof remain applicable: runtime source, dependencies, toolchain, DB public
exports and build commands are unchanged. This stage verifies the changed
production package/image directly. The ordinary full aggregate is next required
at 4.8; authenticated image startup, Compose, development reload, smoke, outage
and remaining shutdown/cache evidence intentionally await their assigned stages.

Acceptance: **AC4-11 complete** using prior NodeNext/type/stale-output proof and
current full packaged-file/import/link proof. AC4-01 remains **partial**: plain
Node/nonroot portable image is proven, but authenticated container startup is
required in 4.6. AC4-13 has DB/Doppler-free-build and local-file-exclusion proof;
remaining runtime credential paths are later stages. Other criteria retain their
previous state; no full Step 4/T06/business or production operational acceptance.

Resources: runtime tag above retained; stage-owned build tag removed. Docker
build cache and existing ignored workspace dist/dependency/cache volumes remain.
Both original Beijing DB containers are stopped, ports/settings unchanged;
development data untouched. Every one-off probe/tooling container self-removed;
no listener, watcher, DB client, published port or mounted probe. Five exact
sentinel fixtures removed; probe/inventory/validation scripts remain only in
`/private/tmp`. No unrelated pre-existing diff existed. Only the Dockerfile,
ignore/manifests and seven affected current guidance/evidence files are included
in the stage commit. Dated predecessor/approval history is preserved.

Next action: make the local Conventional Commit with the subject above, verify
its actual hash and `git status --short`, then stop. Only a new assignment starts
4.6, which must obtain any uncovered Compose/credential-launch choices before
implementation and prove authenticated runtime startup. No push/PR is authorized.

## Stage 4.4 — Guarded built-process tests

**State: complete.** Required guarded, strict and aggregate checks passed on
2026-10-28. Overall Step 4 remains in progress; stages 4.5–4.11 are not started.
Completion commit subject: `test(api): verify guarded built-process lifecycle`.
Resolve its hash with
`git log -1 --format=%H --grep="^test(api): verify guarded built-process lifecycle$"`.

### Initial checkpoint (2026-10-28, America/Maceio)

Saved in progress before implementation; this initial snapshot is historical.

- Owner: this stage's Codex session owns only its one-off tooling invocations,
  future test children/listeners/watchdogs and test-only controller pool. No
  development resource, business table, migration, schema reset or watcher is
  owned or authorized for modification by this stage.
- Checkout: `/Users/william/Documents/code/storage-minis`; verified branch
  `WilliamPhilippe/step-4-implementation-plan`; base
  `230a3486b8788162dbcc945cde5d86efcfb4d26c`. Initial Git status clean.
- Predecessors: 4.1 `472e0a7`, 4.2 `29509a3`, 4.3 `230a348`; their recorded
  completed evidence and relevant source/lockfile/build inputs match HEAD.
  Reuse configuration/factory/lifecycle evidence; rerun affected checks.
- Read stage execution/completion/checkpoint rules and 4.4 card, parent
  P4-09/P4-10, exact test tuple, verification matrix and deadline contracts;
  README Docker/PostgreSQL/Drizzle guidance and existing runner/prefetch guards.
- Approval pending: presented dedicated runner/tasks/serial process tests and
  ownership strategy, including a test-only loopback DNS/refusal fixture for
  unavailable-DB startup. No runner/test implementation before the owner reply.
  Existing approved 17s startup and 10s shutdown limits remain unchanged.
- Resources inspected: existing `storage-minis-beijing` PostgreSQL containers
  both stopped; saved host ports 5433/5434 retained. No live schema suite or
  other project consumer is running. No DB/Doppler fetch, process child, pool,
  listener, watchdog or temporary source fixture yet. Docker/issue read-only
  inspections required sandbox/network escalation; Docker inspection passed.
- Required checks pending: focused guard/ownership tests and affected strict
  checks, sequential test-target availability/schema-phase release inspection,
  `./scripts/tooling.sh run-db test pnpm test:api`, foundation milestone
  `./scripts/tooling.sh run pnpm check`, docs/diff review and local commit.
- Acceptance: AC4-05/AC4-08 pending real proof; AC4-06/AC4-07/AC4-09 remain
  partial until later assigned outage/shutdown evidence. No 4.5 work or push/PR.
- Exact next action: finish read-only issue/fixture inspection while awaiting
  scoped owner approval, then record approval and implement resource ownership
  before real scenarios. Checkpoint before live target/fixture changes.

### Checkpoint history

- Owner explicitly approved the scoped 4.4 recommendation in this session on
  2026-10-28: planned commands/build graph/guard, existing dependencies only,
  serial 30s tests/10s hooks/180s supervisor, bounded output and group cleanup,
  reserved distinct ports and listening-marker ownership, existing pool activity
  inspection and child-only loopback DNS/refusal preload. No service outage or
  later stage was approved. Live #26/#21/#22/#23 read; remaining business/auth/
  operations prerequisites unchanged. Ownership and refusal tests are implemented;
  offline checks are next, before real scenarios or test PostgreSQL startup.
- Before live fixture changes: ownership/guard tests passed (6 API plus 7 DB
  launcher tests), broad typecheck passed. Initial lint found an unsafe `any`
  return from the DNS overload delegation; typed the return using the existing
  lookup signature and reran lint. Prefetch fixture now explicitly records
  Doppler invocations and proves neither new command fetches on dev. No live
  resource yet. Next start **test only**, run the inherited schema suite to
  completion, confirm release, then run `run-db test pnpm test:api` sequentially.
  The API suite owns serial per-child reserved ports, a 64 KiB output bound,
  20s child watchdog plus 1s termination, 7s HTTP abort, controller pool and
  loopback port 5432 only for the DNS/refusal fixture. Natural failures must
  finish within 17s + 1s margin; basic signals must finish within 10s. Suite
  watchdog is 180s + 10s termination + 1s pipe fallback, with 512 KiB output.
  No development start/reset/stop, source replacement or managed-secret edit.
- First live command `./scripts/database.sh up test` failed before startup with
  the launcher's fixed Doppler/access/target diagnostic (exit 1). No credential
  output was exposed and no API process/pool/listener started. Inspect existing
  approved Doppler executable/login configuration without changing setup; stage
  remains in progress and both required live/aggregate checks are pending.
- Existing Doppler 3.77.1 is available; `doppler ... me` against the dedicated
  directory returns `you must provide a token`. Requested the owner's existing
  browser-login renewal, never a token in chat. No setup/package/configuration
  changes were made. Finish offline checks and current in-progress summaries
  while awaiting authentication. Test service is still stopped; no live owner.
- Owner renewed the existing login. Offline foundation aggregate
  `./scripts/tooling.sh run pnpm check` passed all 7 tasks and 85 unit tests in
  11 files, including explicit PID release assertions. Dry process graph
  inspection passed (DB build → API build → uncached finite process task).
  Retrying test-only startup now; no development action. After schema release,
  run the process suite, then rerun the required aggregate milestone with final
  documentation. No API child/pool/listener has run yet.
- Before the API live fixture phase: test-only startup passed authentication
  and identity. `./scripts/tooling.sh run-db test pnpm test:db` passed 30 tests
  (10 connection, 20 schema) in 34.19s, uncached; its tooling container exited.
  Follow-up `database.sh psql test --tuples-only --no-align -c "SELECT count(*)
  FROM pg_stat_activity WHERE datname = current_database() AND application_name
  = 'storage-minis';"` returned **0**. Only test PostgreSQL runs; development
  remains the original stopped container. The shared target is released.
  Next run the exact required API command; no other live consumer may start.
- Guarded `./scripts/tooling.sh run-db test pnpm test:api` passed **13 tests**
  in 4.42s (3 successful Turbo tasks; DB/API finite-build cache reused, process
  task explicitly bypassed cache). Real plain-Node children proved exact HTTP,
  eight invalid/missing/blank configuration variants, wrong credentials, owned
  real TCP refusal, occupied port and SIGINT/SIGTERM exits 130/143. Every child
  exited naturally within assertions; no harness timeout/forced cleanup.
  Per-scenario PID absence/port rebind/backend checks and final controller close/
  schema-identity check passed. No source or managed-secret fixture was changed.
  Before restoring live resources: inspect zero application backends, run test
  identity check, then stop only the stage-started test service to restore its
  initial stopped state (discarding only disposable tmpfs). Development unchanged.
- Post-suite independent activity count returned **0** and ordinary test DB
  authentication passed. Stopped only test PostgreSQL; development stayed stopped.
  Post-live `pnpm check` passed all 7 tasks/85 tests (3 unchanged build/type cache
  hits). Review identified two useful explicit missing-key process cases, beyond
  the existing unit/malformed/blank proof: absent DB_TARGET and PGPASSWORD. Added
  those before closing AC4-05. Before live fixture change: restart test only,
  rerun the guarded suite (now 15 cases) against fresh unmigrated test storage,
  then repeat activity/identity cleanup and the affected aggregate. The schema
  phase already released the target; no schema/reset consumer will overlap.
- Final guarded run passed **15 tests** in 4.89s, including absent DB_TARGET/
  PGPASSWORD, with no watchdog/forced termination. The API finite build reran for
  changed test input; process task bypassed cache again. Runtime source, lockfile
  and dependency pins are unchanged. Next perform independent zero-backend/
  unmigrated-schema inspection, stop test only, run the final aggregate, then
  finish current status/docs validation and commit. No child/controller remains.

### Completed handoff (2026-10-28, America/Maceio)

The [approved 4.4 runner/task/test choices](technical-direction.md#step-44-guarded-process-test-approval-2026-10-28)
are implemented. `apps/api/scripts/process-tests.ts` validates compiled DB
configuration and requires the exact test tuple before child/client/cleanup
acquisition, then launches the dedicated `api-process` Vitest config. That config
and the test module repeat the guard. Root `test:api` selects API `test:process`,
with DB → API finite builds and uncached, finite live execution/no outputs.
Only the parent-listed 12 runtime variables pass through. No dependency, lockfile,
runtime source, DB schema/migration or Compose configuration was changed.

`scripts/database.sh` refuses both new command names on dev before even Doppler
version/access lookup. Launcher fixtures record invocation and assert no fetch.
Offline runner/config fixtures prove dev, mixed host/database, wrong port and URL
refusal before spawn/socket acquisition; malformed imports cannot satisfy them.

`owned-process.ts` owns child handles before events, bounded combined output,
deadline, TERM/INT forwarding and bounded KILL fallback. The suite owns a detached
process group; API children remain in that group, so runner cancellation includes
descendants. Premature leader exit with survivors fails and cleans up the group;
test success cannot hide orphan children or forced cleanup. This narrow helper is
retained because Node/Vitest do not provide the whole suite's process-group,
output-limit and orphan cleanup contract. Six offline tests prove natural exit,
PID release, an ignored TERM/deadline, output overflow, descendant cleanup,
repeated cancellation and exact-target refusal. No general lifecycle dispatcher
or new infrastructure tool was added.

Every real scenario reserves a distinct loopback port. It transfers the port to
`node --enable-source-maps dist/server.js` with no loader, and requires **that
child's** listening marker before HTTP. A competing bind fails closed. The
occupied-port case keeps its listener, accepts no harness probes and releases it
explicitly. Healthy children prove exact HTTP 200 live `{"status":"ok"}` and
ready `{"status":"ready"}`, including repeat readiness. Ten configuration cases
cover invalid/blank HTTP values, missing target/password, blank password, mixed
DB host and URL refusal. Wrong credentials, unavailable socket and occupied port
produce only fixed safe categories/exit 1, with no startup-success marker.

The unavailable-DB child alone uses the test-only native Node preload
`tests/fixtures/unavailable-database.ts`: only `postgres_test` resolves to
loopback, where the suite owns port 5432 and records a real TCP connection before
closing it. The validated tuple stays
`test/postgres_test:5432/storage_minis_test/postgres`; shared PostgreSQL remains
running and authenticated. This is startup socket-failure proof, not 4.9's
service-outage/liveness/recovery proof. No preload ships in runtime `dist`.

Both healthy signal cases exit naturally with 130/143. Each scenario checks
child PID disappearance, listener rebind, and absence of API PostgreSQL backends
through the already-owned controller pool. Final schema-name identity and
controller `totalCount = 0` assertions pass. Business tables are never queried or
written by API process fixtures. No reset/migrate/seed/import occurs in the API
suite. Its final run against a fresh unmigrated test database proves diagnostic
readiness does not require or apply migrations.

All final commands below ran from the repository root on 2026-10-28, using
existing Beijing project/ports 5433/5434 and tooling image
`sha256:9654ab9e6cd60e6372f06f6d00ac59f19d92c956b3dac87facafb5c8423fcdad`,
Node 24.22.1, pnpm 12.15.0, TypeScript 6.0.3, Turbo 2.11.10, Vitest 5.0.5,
and PostgreSQL 18.6 image pinned in unchanged Compose. Base `230a348`; final
source/config/test SHA256 is
`0838df8a0ef568b5d9b6cd636d2e1001bade63bd1f1df88782617f2676b6c33f`.
This hashes sorted path + NUL + bytes + NUL for 25 files: API TS/MTS/JSON files
excluding dist/node_modules, root package/Turbo/lockfile, tooling/database/local
launchers and DB launcher test. The tested pre-format identity was
`a7644f6f2b706178505173cc4e8df869f16b735e546e2479ed7ceab27fba7436`;
the only subsequent code-file change was Prettier's call wrapping in the test.
Live evidence remains applicable: scenario values/logic, all runtime source,
dependencies, environment and fixture behavior are unchanged.

| Actual command | Final result |
| --- | --- |
| `./scripts/tooling.sh run pnpm exec vitest run --project api-unit --project db-unit apps/api/src/process-tests.test.ts packages/db/src/launcher.test.ts` | Passed 13 focused tests (6 API, 7 launcher), including refusal before fetch/connection. Final aggregate repeats these with PID-release assertions. |
| `./scripts/tooling.sh run pnpm typecheck` and `./scripts/tooling.sh run pnpm lint` | Passed broad source/test/script/config types and zero-warning lint; repeated in the final aggregate. |
| `./scripts/tooling.sh run pnpm exec prettier --write apps/api/scripts apps/api/src/process-tests.test.ts apps/api/tests apps/api/vitest.process.config.mts` | Passed; package/Turbo/launcher paths formatted separately with the same pinned command. Final integration-file format correction passed. |
| `./scripts/tooling.sh run node --input-type=module` (inline task assertions) | Passed exact three-task graph, own finite build dependency, uncached/nonpersistent/no-output process task, exact 12-variable allowlist and no build credentials. No DB access. |
| `./scripts/database.sh up test` | Passed authenticated database/user/UTC identity after the owner renewed the existing browser login. Development never started. |
| `./scripts/tooling.sh run-db test pnpm test:db` | Passed 30 tests/2 files in 34.19s; inherited schema phase ran alone and exited. Post-phase activity count 0 before API tests. |
| `./scripts/tooling.sh run-db test pnpm test:api` | Passed initial 13 and final 15 tests; final suite 4.89s/3 successful Turbo tasks, API finite build executed and live task explicitly bypassed cache. |
| `./scripts/database.sh psql test --tuples-only --no-align -c "SELECT (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name = 'storage-minis'), (SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('public', 'drizzle'));"` | Final independent result `0\|0`: no leaked app/controller backend and no application/migration table in fresh test storage. |
| `./scripts/database.sh check test` | Passed after both process runs. |
| `docker compose --env-file .env.compose --file compose.yaml stop --timeout 10 postgres_test` | Passed; restored only stage-started test service to its original stopped state. Test tmpfs intentionally discarded. |
| `./scripts/tooling.sh run pnpm check` | Final pass after live cleanup/format correction: 7 successful tasks, 85 unit tests/11 files, 2 unchanged DB build/type cache hits. Source/config/test/lint/format checks passed with both DB services stopped. |
| `git diff --check` and `python3 /private/tmp/storage-minis-validate-stage-4.4-docs.py` | Passed: 7 Markdown files, 239 relative links/anchors, paired fences/consistent tables, all 18 criteria and exactly AC4-03/04/05/08/10 complete; 4.4 complete/4.5 not started, current summaries/approval links synchronized. |

Deadlines: serial 30s process tests/10s hooks; 180s suite + 10s group termination
+ 1s pipe fallback, 512 KiB output. Each API child has 20s watchdog + 1s termination
+ 1s pipe fallback, 64 KiB output; HTTP aborts at 7s. Assertions require natural
startup-failure exit under 18s (17s application limit + 1s scheduling margin) and
signal cleanup under 10s. The controller inherits 2s connect/3s statement/4s
query/6s check/10s close limits. No passing scenario needed a harness watchdog,
runner force-exit or forced child cleanup.

Resolved attempts: initial Doppler startup failed safely because the dedicated
directory had no usable token; the owner renewed the existing browser login.
An initial lint failure on the test preload's delegated return was fixed using
the existing DNS signature. The aggregate after adding missing-key cases found
Prettier call wrapping; formatting was applied and the full aggregate passed
again. The adapted documentation validator initially assumed README must still
spell out `4.3`; it now checks the current 4.4 range and passes. No documentation
link, fence, table or acceptance mismatch was found. No required failed/unrun
stage check remains. Earlier frozen dependency,
compiled schema/export, build-cleaning and lifecycle evidence remains current;
those inputs/behaviors did not change. Later image/watch/outage/project-shutdown/
cache-completion checks remain intentionally unrun for their assigned stages.

Acceptance: **AC4-05 and AC4-08 complete**, alongside inherited AC4-03/04/10.
AC4-06/AC4-07 remain partial: exact healthy HTTP/authentication is real, but
liveness through a service outage and bounded readiness failure/recovery remain
4.9. AC4-09 has basic process-signal proof; later shutdown edge/project paths
remain 4.10. Graph/unit/process portions of AC4-12/AC4-14 remain partial.
No full Step 4, T06 or business acceptance is claimed.

Resources: both original PostgreSQL containers stopped; development storage and
container untouched. All one-off tooling/SQL containers self-removed; API children,
controller pool, HTTP sockets, reserved ports, watchdogs and refusal listener
released. No watcher, source replacement, temporary repository fixture or managed
secret edit. The permanent test-only preload is intentionally committed; ignored
dist/cache/dependency volumes remain. Necessary code/tests/tasks and seven current
guidance/evidence files comprise this stage; initial checkout had no unrelated work.

Final resource inspection confirms only the two original stopped DB containers,
with no tooling/SQL container. Branch and diff review passed. Documentation-only
completion summaries do not change the verified code/test inputs.

Next action: execute the local Conventional Commit with the subject above,
then verify its hash and `git status --short` and stop. Only a new assignment
starts 4.5, first obtaining its uncovered image/package choices. No push/PR work.

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
