# Step 4 — cumulative implementation verification

This record starts on **2026-10-28** (America/Maceio) and is reused across
sessions. Follow the [stage guide](../plans/step-4-fastify-implementation-stages-2026-10-28.md)
and [parent contract](../plans/step-4-fastify-plan-2026-10-28.md).
Stage completion is distinct from full Step 4 acceptance.

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
