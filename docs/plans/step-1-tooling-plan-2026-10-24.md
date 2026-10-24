# Step 1 implementation plan — Docker tooling environment

Proposal prepared 2026-10-24 for [guide Step 1](../technical/technical-foundation-implementation-guide.md#step-1--docker-tooling-environment) under [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26). This is a reviewable plan, not implementation evidence.
The owner requested implementation of this concrete plan on 2026-10-24, selected
`storage-minis` naming throughout, and confirmed disposable containers and the
documented host-editor limitation. Docker and real Doppler verification passed;
see the current decision record for evidence and handoff.
The Doppler project is `storage-minis`, config `dev`. The owner installed CLI
3.77.1 through Homebrew; use the explicit binary override instead of requiring
the standalone location. The original proposal below is retained as planning
history; current outcomes and evidence are in the
[decision record](../technical/technical-direction.md#step-1-docker-tooling-2026-10-24).
The installed CLI does not support the proposed `--no-interactive` flag; the
implementation closes stdin during verification instead.

## Starting state and inherited approvals

- At planning inspection, HEAD and local `origin/main` both resolved to
  `ba4ebf82697bb319addcc077339938dd7ec10e72`. The working tree was clean.
- The guide and predecessor PRs #98, #99 and #100 establish existing tooling,
  the six-step sequence and the approved Doppler provider selection. All three
  PRs are merged. There is no predecessor tooling-container delivery.
- Existing pins are Node.js 24.22.1 and pnpm 12.15.0, with strict engines,
  root development dependencies, API/DB packages and the shared lockfile.
- Existing Turbo 2.11.10 has six executable check tasks, strict environment
  filtering, local caching and no remote cache. Normal empty tests must fail.
- No Dockerfile, Compose service, Doppler integration, application source or
  permanent tests exist. This checkout has no host dependency or Turbo directories
  at inspection time; the implementation must also preserve such directories if
  they exist in another checkout or appear before implementation.
- Read-only checks confirm Docker Engine/client 29.9.2, Compose 5.6.1,
  `desktop-linux`, and a Linux arm64 daemon. Unlike the older setup record,
  this shell resolves Docker as `/Users/william/.docker/bin/docker`.
  The bundled `/Applications/Docker.app/Contents/Resources/bin/docker` also works.
  No image pull or container execution was performed for planning.
- Live #26 and #23 were read with their empty comment collections. #26 remains
  open and blocked by #21/#22/#23. Step 1 is partial bootstrap; its approval will
  not remove these dependencies or establish application acceptance.

New owner answers received during this planning session, 2026-10-24:

| Approved direction | Rationale and exact scope |
| --- | --- |
| Pinned host Doppler CLI | Narrow Docker-first exception so Doppler can launch host Compose with inherited environment. Exact pin/install location below still form part of the implementation proposal. |
| Disable encrypted secret fallback | Secret-bearing commands fail when Doppler cannot supply values; ordinary tooling remains independent of Doppler. No fallback snapshot is read or written. |
| Browser login scoped to this checkout | Local individual authentication with credential state outside the repository; no service-token provisioning is selected. |

At planning time, still awaiting owner input (resolved by the approval note above):

1. Existing Doppler account, project and config names, or whether setup is needed.
2. Disposable one-off containers versus a persistent development container.
3. Whether host editor diagnostics are a Step 1 completion requirement.

## Scope and approval boundaries

Deliver a Node tooling runner, its host Doppler launch path, infrastructure
verification and setup instructions. No PostgreSQL, application dependencies,
business code, migrations, frontend, production policy or CI are included.

| Foundation item | Step 1 subset |
| --- | --- |
| F01 | Approve only this isolated tooling bootstrap despite open T06 prerequisites. |
| F02 | Reuse the existing Docker runtime; no replacement or shell initialization. |
| F13 | Tooling image, container execution, mount isolation, user ownership and host orchestration. |
| F14 / F08 | Approved provider plus proposed local CLI pin, authentication, injection, precedence and no-fallback implementation. No Zod/config-validation package is introduced yet. |
| F11 | Infrastructure proof of this runner, including expected empty-suite failures. |
| F12 | Verify the existing Turbo graph and cache inside Docker. No new task or application environment pass-through is needed. |

F03–F07 and F09–F10 remain later work. Approval of Step 1 does not approve every
later command or dependency covered by a shared F item.

## Proposed implementation decisions

### Images and package provisioning

Use `docker/Dockerfile.tooling` with:

```text
node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
```

Registry inspection confirms Linux arm64/v8 and amd64 support. Retain the exact
Node/pnpm pins and install pnpm in the image with
`npm install --global pnpm@12.15.0`, clearing the image-build npm cache afterward.
Verify both versions during build. Do not install workspace dependencies into
the image; use the existing lockfile after mounting the checkout.

Build context is `docker/`, containing only the Dockerfile and volume initializer.
Application source, credentials and host dependency directories never enter that
context. No apt packages, Docker client, Git, Corepack or application packages
are proposed for the Node image.

This Debian image matches the existing proposal and avoids introducing Alpine's
different C library. Alpine is smaller; a full Debian Node image is larger and
includes tools this step does not need. Neither benefit warrants changing the
verified proposal pin.

### Services, files and storage

Recommended workflow, pending the owner's container preference:

- Root `compose.yaml` defines profile `tools` services `tooling` and
  `tooling-init`, using one checkout-scoped local image tag.
- `tooling` uses `/workspace`, a writable checkout bind mount, `user: node`
  (UID/GID 1000:1000), `init: true`, no restart policy, no published port and no
  database dependency. Commands use `run --rm --no-deps`.
- Five project-scoped named volumes cover `/workspace/node_modules`,
  `/workspace/apps/api/node_modules`, `/workspace/packages/db/node_modules`,
  `/pnpm/store` and `/workspace/.turbo`. Every mount sets `volume.nocopy: true`.
  Set `PNPM_CONFIG_STORE_DIR=/pnpm/store` in the container and verify the effective
  path with `pnpm store path`; do not change the host's pnpm settings. pnpm 12
  reads `pnpm_config_*` / `PNPM_CONFIG_*`, rather than the former `npm_config_*`
  variables. Other transient caches stay in the disposable container.
- `tooling-init` runs a short root command against those five volumes mounted
  under `/volumes/`. It has no checkout bind mount. It assigns their mount-root
  ownership to 1000:1000 and exits. It never recursively changes checkout
  ownership. Install and normal checks run exclusively as `node`.
- Re-running initialization is safe. It does not need secrets, a database or a
  functioning workspace install. Simultaneous dependency installations into the
  same checkout are unsupported; independent workspaces use separate projects.
- Reviewable generated files remain on the checkout bind mount. `node_modules`,
  the pnpm store and Turbo entries remain in Docker storage, surviving one-off
  container exit and ordinary `compose down`.

Require an explicit unique `COMPOSE_PROJECT_NAME`; propose
`storage-minis-beijing` for this checkout. Do not silently use the common repository
name or a global volume. A second workspace uses another name, such as
`storage-minis-step1-probe`. Examples must explain that names are unique per checkout,
even if two checkouts have the same directory basename.

The persistent-container alternative reduces startup overhead and supports
`exec`, but requires managing background lifetime and refreshed environments.
One-off execution makes each command's environment and exit code explicit while
preserving the expensive dependency/cache state in volumes.

### Host Doppler installation and authentication

Propose CLI **3.77.1**, the official stable release published 2026-10-22.
Install the release binary at:

```text
$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler
```

Use the official macOS arm64 archive and verify its SHA-256 before extraction:

```text
https://github.com/DopplerHQ/cli/releases/download/3.77.1/doppler_3.77.1_macOS_arm64.tar.gz
e0033d287811de122e7a353a4d548f72ff3103b3010147ce80299f28b5313df2
```

Document explicit invocation by path. No global PATH/profile edit or automatic
update is proposed. Homebrew is a convenient alternative but does not preserve
this exact patch without further version management. Linux/Intel users select
the matching official 3.77.1 artifact and recorded checksum; verification on this
machine establishes macOS arm64 support only.

Use a dedicated host configuration directory under
`$HOME/.config/storage-minis/doppler`, outside the checkout, with restrictive
permissions. Browser login is scoped to the checkout's absolute path. Specify
the approved project/config explicitly on every secret-bearing invocation,
rather than silently inheriting another checkout's selection. Reject an ambient
`DOPPLER_TOKEN` for this browser-login workflow so it cannot silently select a
different identity. Preserve existing global Doppler state if any exists.

The owner's browser authorization is a human prerequisite. Account/project
creation and actual project/config names await the owner's answer; do not invent
them. Step 1 needs only a development config and a harmless probe value. Test
database mapping is completed in Step 2, and production configuration remains
with T04. Do not create a test/production environment incidentally.

Proposed browser-login command, after approving and installing the exact artifact:

```sh
"$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler" \
  --config-dir "$HOME/.config/storage-minis/doppler" \
  --scope "$PWD" login
```

Run from the repository root. This authorizes the local CLI; adding the harmless
`FOUNDATION_TOOLING_PROBE=storage-minis-tooling-ok` entry to the actual development
config is a separate explicit part of the proposed implementation scope.

For comparison, the official container alternative was researched and supports
arm64/amd64 at this exact reference:

```text
dopplerhq/cli:3.77.1@sha256:955488ce31f51293e8f956fa1ce138664134699350d5ad690a5d7889ef92af87
```

That alternative would require a bridge to host Compose. The owner chose the
host CLI, so no Doppler image pull or CLI inside `tooling` is planned.

### Launch boundary, variable inventory and precedence

Add a small host Bash launcher, `scripts/tooling.sh`, with these proposed commands:

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
./scripts/tooling.sh build
./scripts/tooling.sh init
./scripts/tooling.sh run node --version
./scripts/tooling.sh run pnpm --version
./scripts/tooling.sh run pnpm install --frozen-lockfile
./scripts/tooling.sh run pnpm list --recursive --depth -1
./scripts/tooling.sh run pnpm typecheck
./scripts/tooling.sh run pnpm lint
./scripts/tooling.sh run pnpm format:check
./scripts/tooling.sh verify-env
./scripts/tooling.sh down
```

The launcher validates the project name, locates the checkout independently of
the caller's current directory and invokes the installed host Docker CLI.
Allow an explicit `DOCKER_BIN` path and otherwise discover the existing CLI,
including the known Docker Desktop location; never change shell initialization.

Offline payloads are equivalent to:

```sh
docker compose --env-file /dev/null --profile tools build tooling
docker compose --env-file /dev/null --profile tools run --rm --no-deps tooling-init
docker compose --env-file /dev/null --profile tools run --rm --no-deps tooling pnpm install --frozen-lockfile
docker compose --env-file /dev/null --profile tools down
```

Always pass the repository's Compose file/project directory explicitly. Disable
default `.env` loading, including ambient Compose env-file selection; never
source/evaluate a `.env`. Preserve Docker's existing host context/client settings
without forwarding them into Node. Propagate payload exit codes and signals.
No host launcher is a pnpm/Turbo leaf, and containers never invoke Docker.

| Variable | Source / intended consumer |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Explicit checkout-specific host setting; Compose resource scope, never Doppler-managed. |
| `DOCKER_BIN` | Optional host path override; launcher only. |
| Doppler binary/config directory | Fixed versioned host paths with documented explicit override if required. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Explicit nonsecret selection; exact approved names pending. |
| `FOUNDATION_TOOLING_PROBE` | Harmless fixed verification value in the approved Doppler development config; host verification and the one verification container. |
| `PNPM_CONFIG_STORE_DIR` | Fixed container-only setting, `/pnpm/store`; verify with `pnpm store path`. |
| Application/DB variables | Not introduced in Step 1; successors add named variables and consumers with their own approvals. |

The secret-bearing path wraps **host Compose** in `doppler run`, with
`--no-fallback`, `--no-check-version`, `--no-interactive`, `--forward-signals`,
`--no-liveness-ping`, `--timeout 10s`, `--attempts 1` and an explicit
`--only-secrets FOUNDATION_TOOLING_PROBE` allowlist for this step. It validates
the harmless marker on the host, then passes it by name through Compose into a
direct Node verification command. Print pass/fail only, never the environment.

Managed values win over ambient values; do not use blanket `--preserve-env`.
Checkout project selection remains outside the managed-key allowlist, so Doppler
cannot replace it. Missing marker, wrong project/config or failed access aborts
before the verification payload starts. Disable both reading and writing fallback
state; no plaintext secret file or encrypted snapshot is created. Authentication
state is distinct from a secret fallback snapshot.

Normal build/install/run/down commands do not invoke Doppler or receive its
credentials. New launches fetch current values; a running process does not
automatically receive rotations. Later DB provisioning must use the same host
injection boundary before Compose parses service settings, and allowlist only
the values its consumers need. No global Turbo pass-through is added now.

### Worktree and editor behavior

This worktree's `.git` points to a host-only absolute path. Do not rewrite it,
mount the shared Git metadata directory or install Git in the container just for
checks. Pinned Turbo source provides filesystem hashing when Git is unavailable,
including `.gitignore` handling. Verify task discovery, exclusions, stable hashes,
cache hits and invalidation in this mode. Git, commits and PR operations remain
on the host. Git-history-based filters are outside the runner's contract.

Host editor diagnostics do not automatically see dependency volumes. The current
recommendation is to document that limitation, retaining any existing host
dependency tree. Installing host dependencies or container editor support would
need a separate explicit decision. If diagnostics are required now, revise this
part before approving the plan.

## Implementation order

1. Resolve the outstanding owner answers and obtain approval of the concrete
   remaining choices. Record approved scope/date/rationale in technical direction.
2. Add the tooling Dockerfile, volume initializer and Compose services. Review
   rendered nonsecret configuration before pulling/building anything.
3. Build and initialize fresh checkout-scoped volumes; verify image versions and
   non-root write access before installing workspace dependencies.
4. Run frozen installation and discovery, then existing checks and focused cache
   evidence. Preserve the ordinary empty-suite failure.
5. Install the approved host Doppler artifact after checksum verification, complete
   browser authorization and confirm actual project/config mapping. Add the host
   launch path and harmless probe. Run its success/failure/precedence checks.
6. Verify isolation, generated output survival, watch events, signals and cleanup.
   Reproduce the README sequence with a fresh disposable verification project.
7. Update setup/approval/evidence documentation and prepare one Step 1 PR after
   implementation authorization. Do not merge it, start Step 2 or close T06.

## Verification matrix

These are planned checks. None has run inside a container during planning.

| Criterion/scenario | Planned command or probe | Expected result / resources / cleanup |
| --- | --- | --- |
| Exact runtime and provisioning | Build, then `run node --version`, `run pnpm --version` | 24.22.1 / 12.15.0; image digest recorded. Bound each network-heavy build/install attempt to 10 minutes and report progress while it runs. |
| Frozen install and discovery | `run pnpm install --frozen-lockfile`; `run pnpm list --recursive --depth -1` | Root/API/DB discovered, lockfile unchanged, Linux dependencies in named volumes. No Doppler or database required. |
| Existing successful checks | `run pnpm typecheck`, `run pnpm lint`, `run pnpm format:check` | All pass under the existing strict configuration. These remain tooling checks. |
| Missing application tests | `run pnpm test`; `run pnpm check` | Both fail with the documented empty-suite behavior; no permanent dummy test or altered policy. |
| Runner loading only | `run pnpm test --passWithNoTests` | Pass, explicitly labeled runner/configuration loading only. |
| Turbo graph/cache | `run pnpm check --dry=json`; force and repeat the existing five successful tasks with summaries | Six executable tasks, no new dependencies, strict filtering, five unchanged cache hits on the repeat; container cache isolated from host. Temporary source/config change invalidates the appropriate task and is restored byte for byte. |
| Host dependency/cache preservation | Temporary sentinel files in root/API/DB host dependency directories and host `.turbo`; inspect container mounts | Host sentinels are not visible through dependency/cache mounts; remain unchanged afterward. Remove only the unique probe files/directories created by verification. |
| Cross-workspace isolation | Run fresh primary and secondary project volumes with distinct markers | Different volume IDs, neither project sees the other's markers. Remove only the secondary probe project's resources after recording evidence. |
| Unprivileged writes/output survival | `id` plus a uniquely named generated probe on the bind mount; inspect after container exit | UID/GID 1000, dependency/store/cache writes succeed, generated output survives and is editable on host. Delete the unique generated probe. |
| Worktree hashing | Existing Turbo discovery/cache checks plus temporary input edit | Works without host Git metadata; ignored dependencies/caches/scratch are not hashed as source. If this fails, stop and propose a specific remedy instead of mounting more host state silently. |
| Bind-mount watch behavior | Temporary Node watcher under `.context`, edit and atomic-save from host | Events observed within 10 seconds; record ordinary edit and file-replacement behavior. Remove fixture and stop child. Actual API/DB watcher selection remains Step 4. |
| Exit and signal forwarding | Child exits 37; separate Node signal probe receives SIGTERM/SIGINT | Launcher preserves nonzero exit; handled signals reach child and container stops within 10 seconds. No application server/port needed. |
| Doppler success and scope | `verify-env`, host marker check and direct container assertion | Same harmless managed value reaches both boundaries; output is pass/fail, token absent from container environment/image/cache. |
| Missing/wrong/unreachable Doppler | No login, invalid project/config, missing marker and controlled failed API connection | Sanitized nonzero failure before payload. Request timeout 10 seconds with one attempt, no fallback snapshot read/written; allow 30 seconds for each negative verification. Preserve real login state during probes. |
| Value precedence | Stale `.env`, conflicting ambient marker and Doppler marker | `.env` ignored; managed marker wins; explicit checkout project stays selected. Remove only uniquely created fixtures and restore any prior file. |
| No-secret workflow | Build/install/check/down with Doppler selection/authentication unavailable | Operations do not contact Doppler. A truly network-offline install is possible only with populated dependencies/store; no initial offline-install promise. |
| Lifecycle and reproduction | Fresh verification project: build → init → install → check → down | No database service starts; normal down preserves volumes. Document separate explicitly named volume cleanup. Never run global pruning or delete another project's storage. |
| Documentation | Changed relative links/anchors, fences/tables and `git diff --check` | Setup sequence, version claims, approval status and evidence agree. |

If authentication/account setup cannot be completed, report the exact missing
prerequisite and seek an explicit deferral. Do not mark Doppler evidence or the
entire step complete by substituting a fixture for the real launch path.

## Handoff

Update README with actual build/init/install/check/down commands, host Doppler
bootstrap, nonsecret selection, editor limitation, watch/signal results and
separate destructive cleanup. Update technical direction with dated approved
outcomes and actual verification, retaining unapproved proposal items. Update
the implementation guide's Step 1 row with scope, evidence and PR; use partial
status if any criterion remains unverified or explicitly deferred.

Expected files: `compose.yaml`, `docker/Dockerfile.tooling`,
`docker/init-volumes.sh`, `scripts/tooling.sh`, `README.md`,
`docs/technical/technical-direction.md`, and the guide's progress row. Add a secret-free
variable inventory in the setup docs. Root/package manifests, lockfile, Turbo
tasks and ESLint/Prettier policy need no planned changes; any discovered need
outside the approved scope must be raised with evidence first.

Step 2 inherits the image/service, explicit project isolation, non-root volumes,
host Doppler injection, no-fallback policy, actual development config identifier
and resource lifecycle commands. It still owns PostgreSQL image/storage,
development/test config mapping, DB variables/ports and authenticated queries.

## Primary research sources

- Existing guide, technical direction and foundation proposal; live issues #26
  and #23; merged PRs #98–#100.
- [Official Node image guidance](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
  and direct Docker registry manifest inspection for the exact Node reference.
- [Published pnpm 12.15.0 metadata](https://registry.npmjs.org/pnpm/12.15.0).
- [pnpm configuration environment variables](https://pnpm.io/configuring).
- [Docker volumes](https://docs.docker.com/engine/storage/volumes/),
  [Compose one-off execution](https://docs.docker.com/reference/cli/docker/compose/run/),
  [Compose environment interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).
- [Doppler CLI 3.77.1 release](https://github.com/DopplerHQ/cli/releases/tag/3.77.1),
  release asset SHA-256 metadata and direct official image manifest inspection.
- [Doppler Compose integration](https://docs.doppler.com/docs/docker-compose),
  [CLI authentication](https://docs.doppler.com/docs/cli),
  [fallback behavior](https://docs.doppler.com/docs/automatic-fallbacks).
- [Pinned Doppler run implementation/flags](https://github.com/DopplerHQ/cli/blob/3.77.1/pkg/cmd/run.go)
  and [root timeout flags](https://github.com/DopplerHQ/cli/blob/3.77.1/pkg/cmd/root.go).
- [Turbo 2.11.10 SCM fallback](https://github.com/vercel/turborepo/blob/v2.11.10/crates/turborepo-scm/src/lib.rs)
  and [manual hashing](https://github.com/vercel/turborepo/blob/v2.11.10/crates/turborepo-scm/src/manual.rs).
- [Node 24.22.1 watcher caveats](https://nodejs.org/download/release/v24.22.1/docs/api/fs.html#caveats).
