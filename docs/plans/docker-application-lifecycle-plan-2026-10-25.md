# Local application containers and lifecycle commands

**Superseded direction, 2026-10-25:** The owner subsequently approved standard
Compose configuration/direct lifecycle commands in preference to the general
wrapper. Use the [standard Compose maintenance plan](standard-compose-maintenance-plan-2026-10-25.md)
for the replacement implementation. This document preserves the earlier plan and its
approval; its wrapper strategy and future file layout are no longer the target.

Prepared 2026-10-25 for [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26).
**Status: owner-approved on 2026-10-25.** The owner approved phase 1's lifecycle
commands and the staged API/frontend approach, then requested notice if a local
Compose installation is needed. Docker Desktop already supplies Compose 5.6.1;
no installation is required. Later application choices retain their own gates.
Actual verification is recorded in technical direction, separately from this plan.

## Starting state

- Inspected HEAD: `e7883196256d409bfa1dd46647101b41ff45261c`.
  Live [PR #105](https://github.com/WilliamPhilippe/storage-minis-be/pull/105)
  confirms Step 3A merged on 2026-10-25. The working tree was clean.
- [compose.yaml](../../compose.yaml) defines disposable Node tooling and its
  volume initializer. [historical compose.postgres.yaml](https://github.com/WilliamPhilippe/storage-minis-be/blob/e7883196256d409bfa1dd46647101b41ff45261c/compose.postgres.yaml)
  defines persistent development PostgreSQL, disposable test PostgreSQL, and a
  SQL client. There are six named volumes in total; test data uses tmpfs.
- [tooling.sh](../../scripts/tooling.sh) and
  [database.sh](../../scripts/database.sh) already implement the underlying
  build, initialization, database startup, readiness, stop, and reset operations.
  The root [package.json](../../package.json) exposes no Docker lifecycle scripts.
- The API package has only a typecheck command and configuration. No frontend
  package exists. A full application cannot start until those processes exist.
- Step 3B's business migration remains separately gated. The
  [foundation guide](../technical/technical-foundation-implementation-guide.md)
  and README still describe PR #105 as awaiting review; implementation should
  reconcile these current-status notes without rewriting historical records.
- Live #26 and [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23),
  including comments, were inspected. Their dependencies and ownership remain.
  Local Compose does not settle production hosting, backups, or deployment.

Inherited approvals cover Docker Desktop, the existing Node/pnpm/PostgreSQL image
pins, host Doppler 3.77.1, target-matching `dev`/`test` configs, checkout-specific
project names, loopback publishing, and isolated Linux dependency volumes.
No dependency, image pin, host installation, or shell-profile change is proposed.

## Approved scope and decisions

Deliver this in stages: lifecycle commands for implemented services first, then
attach real API and frontend services as their application work is delivered.
The first stage must explicitly describe itself as infrastructure startup.
Do not report a runnable full application before the final stage passes.

| Approved phase-1 choice / staged direction | Recommendation and rationale | Alternatives and tradeoffs |
| --- | --- | --- |
| Compose layout | Retain the tooling and PostgreSQL files; add `compose.app.yaml` when the API becomes runnable. All files share the explicit checkout project and its network. | One merged file is easier to invoke manually but changes the verified tooling boundary and exposes tooling-only commands to application configuration interpolation. |
| Application processes | Give PostgreSQL, API, and frontend separate services. Reuse the pinned tooling image for local Node services. | Running everything inside tooling obscures service ownership and shutdown. Production images are a separate T04 decision. |
| Host launcher | Add `scripts/docker.sh` as the public lifecycle entry point. Delegate existing operations rather than copying their secret handling or refactoring verified launchers. | Raw Compose snippets in package scripts are shorter initially but duplicate project, secret, file-selection, and cleanup rules. |
| Short commands | Add root `docker:*` scripts that call the host launchers directly, outside Turbo. | Turbo adds no useful caching to external Docker state and runs in the tooling container in the current workflow. |
| Meaning of prune | `docker:prune` stops/removes this project's containers and network while preserving named volumes. `docker:prune:volumes` additionally deletes this project's declared named volumes after exact project confirmation. | Docker-wide prune commands can affect other projects; volume pruning alone may omit volumes still attached to containers. |
| Delivery order | Implement infrastructure lifecycle now; add API with guide Step 4 and frontend with its own approved scaffold. | Implementing all application code in this change expands scope into unresolved server, frontend, and authentication choices. Empty placeholder containers would not satisfy startup. |

These choices extend the local F03/F13 lifecycle conventions and F08/F14
environment boundary. API work also needs the applicable F07/F09/F12 approvals.
They do not approve the foundation proposal as a whole.

## Compose service layout

| File / service | Lifetime and purpose | Network and storage |
| --- | --- | --- |
| `compose.yaml`: `tooling`, `tooling-init` | Existing one-off workspace commands and volume initialization. Neither is a continuously running application service. | Existing five dependency/store/cache volumes; no published ports. |
| `compose.postgres.yaml`: `postgres` | Development database; default development dependency. | Existing loopback port 5433, internal `postgres:5432`, persistent `pgdata`. |
| `compose.postgres.yaml`: `postgres_test` | Explicit test startup only. | Existing loopback port 5434, isolated tmpfs discarded on stop. |
| `compose.postgres.yaml`: `postgres-client` | Existing one-off authenticated SQL checks. | No published port or database storage. |
| Future `compose.app.yaml`: `api` | Long-running API development process after Step 4 approval and delivery. | Internal port 3000; proposed host binding `127.0.0.1:${API_PORT:-3000}:3000`; PostgreSQL service address rather than host mapping. |
| Future `compose.app.yaml`: `web` | Long-running Vite frontend after its scaffold is approved and delivered. | Proposed binding `127.0.0.1:${WEB_PORT:-5173}:5173`; browser accesses the published address. |

Keep existing profiles. The launcher selects an explicit service list on startup;
it must not use an unqualified wildcard-profile `up` that also starts test/client
or initializer services. Cleanup may enable all profiles across the full list of
delivered Compose files so it can remove the complete project.

API and frontend containers should run as `node`, use `init: true`, bind their
servers to `0.0.0.0` inside Docker, and retain loopback-only host publication.
Reuse the source bind mount and Linux dependency isolation. Frontend delivery
adds its own dependency volume and extends `tooling-init` and the cleanup inventory.
Use project-derived names; do not add fixed container names or external volumes.

The frontend's browser cannot resolve the Docker hostname `api`. Recommend a
Vite proxy for the approved API paths to `api:3000`, allowing relative browser
requests. Its exact paths, HMR settings, command, strict port behavior, health
check, and dependency pins belong in the frontend approval. Firebase Authentication
remains an external service; no Firebase, Redis, proxy server, or other service
container is needed by the currently approved stack.

## Command contract

Approved root scripts and their phase-1 behavior:

| Command | Script payload | Result |
| --- | --- | --- |
| `pnpm docker:build` | `./scripts/tooling.sh build` | Build the existing pinned tooling image. |
| `pnpm docker:init` | `./scripts/tooling.sh init` | Initialize dependency/cache volume ownership. |
| `pnpm docker:up` | `./scripts/docker.sh up dev` | Start/check development PostgreSQL now; expand to the delivered development application services later. |
| `pnpm docker:up:test` | `./scripts/docker.sh up test` | Start/check only test PostgreSQL. Requires caller-selected Doppler config `test`. |
| `pnpm docker:stop` | `./scripts/docker.sh stop` | Stop this project's delivered services without removing containers or named volumes. Test tmpfs data is lost. |
| `pnpm docker:stop:test` | `./scripts/docker.sh stop test` | Stop only test PostgreSQL. |
| `pnpm docker:prune` | `./scripts/docker.sh prune` | Project-wide `down --remove-orphans --timeout 10`; preserve named volumes and images. |
| `pnpm docker:prune:volumes --confirm PROJECT` | `./scripts/docker.sh prune-volumes` with forwarded arguments | Confirm and remove project containers/network, then delete the exact owned named volumes. |
| `pnpm docker:ps` | `./scripts/docker.sh ps` | Show this project's service status. |
| `pnpm docker:logs` | `./scripts/docker.sh logs` | Follow development service logs; accept `test` to follow only test PostgreSQL. |

`stop` has Docker's stop semantics; `prune` deliberately includes running
project containers. It is project teardown, not a scan for globally unused
resources. Docker documents the distinction between
[stop](https://docs.docker.com/reference/cli/docker/compose/stop/) and
[down](https://docs.docker.com/reference/cli/docker/compose/down/).

These package commands run on the host and therefore need the already-approved
host Node/pnpm alternative. They must not be invoked inside `tooling.sh run`.
Docker-only users use the identical direct shell entry points, with no host
Node/pnpm requirement and no Docker socket mounted inside containers.

First-time setup remains explicit: select project/Doppler settings, build, init,
run the existing frozen dependency installation, and pull PostgreSQL through
`database.sh pull` before `docker:up`. Startup does not silently install
dependencies, change image pins, or generate/apply migrations.

## Environment and destructive-operation rules

- Require explicit `COMPOSE_PROJECT_NAME`; preserve existing validation and Docker
  executable discovery. Resolve paths from the launcher, not the caller's directory.
- Use explicit files, project directory/name, and no `.env` loading. Clear ambient
  Compose file/profile/env-file overrides as existing launchers do.
- Phase 1 delegates `up dev` / `up test` to `database.sh`, preserving its selected
  target checks, Doppler key allowlist, authenticated SQL probe, deadlines, and
  error handling. The caller selects `DOPPLER_CONFIG=dev` or `test`; commands must
  reject mismatches rather than silently replacing that selection.
- Stop, prune, volume deletion, status, and logs require Docker but no Doppler
  login or secret retrieval, including during a Doppler outage.
- Future API startup must reuse the approved DB configuration boundary and obtain
  only its approved runtime variables from host Doppler. Pass values by environment,
  never literal command arguments or generated secret files. Never expose DB
  credentials in frontend environment variables, including Vite public variables.
- Before any volume-deletion mutation, require `--confirm` with the exact project
  name, print the resource inventory without secrets, and verify all existing
  candidate volumes' Compose project and logical-volume labels. Refuse a mismatch.
  Distinguish absent resources from a failed Docker daemon connection.
- Phase 1's deletion inventory is exactly `dependencies`, `api-dependencies`,
  `db-dependencies`, `pnpm-store`, `turbo`, and `pgdata`, with project prefixes.
  After validation, tear down the project and remove those exact named volumes.
  Never use Docker-wide container, volume, or system pruning. An in-use volume
  deletion fails; do not force removal of unrelated containers to free it.
- Document that full volume deletion erases development PostgreSQL and requires
  `init` plus frozen dependency installation before reuse. Existing target-specific
  `database.sh reset dev/test` remains available for narrower cleanup.

## Implementation sequence

1. **Lifecycle PR:** add `scripts/docker.sh`, package aliases, and documentation.
   Preserve existing Compose definitions and delegate database starts. Add complete
   project stop/status/logs/teardown and ownership-checked volume deletion. No new
   Node packages or Turbo tasks are required. Describe startup as infrastructure-only.
2. **API PR with guide Step 4:** approve/deliver the actual server commands,
   compiled DB dependency/watch behavior, health endpoints and shutdown contract.
   Add `compose.app.yaml` with `api`; extend development startup to database then
   API. Require bounded readiness and an authenticated DB check, not just a running
   container. Proposed API health wait: 60 seconds after database readiness.
   Keep migration application explicit and preserve Step 3B's gate. If beginning
   Step 4 before 3B conflicts with the guide's prerequisite, obtain that specific
   sequencing approval first.
3. **Frontend PR:** approve/deliver the real React/Vite package and commands,
   dependency isolation/init support, proxy/HMR behavior, and frontend health check.
   Extend `compose.app.yaml` and `docker:up` to start database, API, and frontend.
   Verify browser-to-API requests through the published frontend address.
4. **Handoff:** update README, local-development reference, technical-direction
   approval/evidence records, and the guide's current status where applicable.
   Record each delivered stage and its limitations. Preserve existing issue
   ownership; do not close T06 or alter prerequisite relationships.

Future startup failures should return nonzero, identify the failed service without
secrets, and retain diagnostic state and volumes. Avoid automatic destructive
rollback that could stop services already running before the invocation. Ordinary
shutdown gives processes ten seconds before Compose's forced stop behavior.

## Verification and completion criteria

Use a unique disposable project for destructive checks. Do not stop/reset the
owner's active development project. Test the launcher contracts with a fake Docker
executable and run the consequential lifecycle checks against real Docker.

| Check | Expected evidence |
| --- | --- |
| Static checks | `bash -n scripts/docker.sh`; repository formatting/lint/type/unit checks using the existing tooling runner; `git diff --check`. |
| Argument and configuration guards | Missing/invalid project, invalid operation, mismatched Doppler target, missing confirmation, or wrong project confirmation exits nonzero before mutation. |
| Compose isolation | Nonsecret Compose inspection proves the intended service list and volume mounts. Tooling-only checks still need no DB secret; ambient `.env`, Compose file/profile overrides cannot change the target. |
| Startup | Phase 1 starts only `postgres`; test startup starts only `postgres_test`. Existing authenticated identity checks pass. Repeat startup is successful without data loss. Later phases show API/frontend health separately. |
| Failure propagation | Missing Docker/daemon, Doppler failure, bad credentials, occupied ports, and unhealthy dependencies fail within inherited startup deadlines; later frontend/API checks have explicit deadlines. |
| Persistence and stop | A disposable DB probe survives development stop/start. Test data does not. Targeted test stop leaves development running. |
| Container cleanup | `docker:prune` removes the disposable project's running/stopped containers and network, preserves named volumes, and can be repeated. A fresh startup recovers the development probe. |
| Volume cleanup | Missing/wrong confirmation and ownership mismatch leave all resources untouched. Correct confirmation removes exactly the six declared owned volumes; a second unrelated project remains intact. Reinitialization/install succeeds afterward. |
| No-secret cleanup | Stop/prune/status and an approved disposable volume cleanup work without Doppler. No credentials appear in command arguments or output. |
| Host invocation | Verify actual pnpm argument forwarding for `--confirm`; direct shell commands work without host pnpm, including invocation from another directory. |
| Application phases | API shutdown releases its DB pool; API source/DB edits reload; Vite edits/HMR work; browser API calls succeed; database outage affects readiness; stopping the full stack leaves no application processes running. |

The implementation must record actual results, Docker/Compose versions, resource
names, deadlines, and cleanup evidence. Planning inspection started no containers,
fetched no secrets, and deleted no resources. Business atomicity, isolation,
concurrency, migration replay, Playwright workflows, CI, and production acceptance
are separate evidence under their existing owners.

Official Compose references supporting this plan:
[explicit service/profile selection](https://docs.docker.com/compose/how-tos/profiles/),
[startup and bounded wait](https://docs.docker.com/reference/cli/docker/compose/up/),
and [project teardown and volume behavior](https://docs.docker.com/reference/cli/docker/compose/down/).
