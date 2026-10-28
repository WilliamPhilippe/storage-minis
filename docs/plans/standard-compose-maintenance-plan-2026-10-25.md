# Standard Compose maintenance plan

**Date:** 2026-10-25. **Status:** Owner requested implementation on 2026-10-25, approving the concrete
plan below. Implemented behavior and executed evidence are recorded in
[technical direction](../technical/technical-direction.md#standard-infrastructure-tooling-direction-2026-10-25).
The following sections preserve the original approved implementation plan.
A later owner-approved [one-time setup amendment](../technical/technical-direction.md#one-time-local-setup-2026-10-25)
supersedes manual environment exports and `/dev/null` selection for routine local
commands with saved nonsecret `.env.compose` settings and setup/start/migrate commands.

The owner approved replacing the general lifecycle wrapper with standard Compose
commands, retaining narrow helpers for Doppler and confirmed volume deletion.
The owner also directed the project to prefer standard infrastructure tooling over
custom infrastructure code for familiarity, maintainability, and deployment reuse.
This supersedes the wrapper strategy and future file layout in the
[earlier lifecycle plan](docker-application-lifecycle-plan-2026-10-25.md).
The earlier implementation/evidence remains a historical record.

## Starting state and scope

HEAD remains merged Step 3A, `e7883196256d409bfa1dd46647101b41ff45261c`.
The working tree contains the previous lifecycle implementation, its tests and
documentation. It has not been committed or published as a PR. Refactor that
work in place; preserve unrelated edits. Current Compose files still define
tooling separately from PostgreSQL. The API and frontend are not runnable.

Deliver standard local Compose configuration and short commands for the services
that exist. Preserve the approved image/toolchain pins, PostgreSQL credentials
and databases, UTC, loopback ports, test tmpfs, development storage, Linux
dependency volumes, strict checks, and Step 3B migration gate. No packages,
host installations, production services, migrations, or application scaffolds
are needed for this refactor. Docker Desktop already supplies Compose 5.6.1.

This remains local foundation work under [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26).
Production deployment, roles, backups and recovery remain [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23).
Their live issues were inspected during the preceding lifecycle work; the
implementation agent should recheck them if scope or prerequisites change.

## Recommended Compose layout

Use one canonical `compose.yaml` for the current local setup. Move the existing
PostgreSQL definitions into it and retire `compose.postgres.yaml` after updating
its active consumers. Services, volumes, health checks and eventual application
dependency ordering then have one source of truth.

| Service | Selection and ownership |
| --- | --- |
| `postgres` | Default development service, without a profile; existing persistent `pgdata` and host port 5433. |
| `postgres_test` | Opt-in `test` profile; existing independent tmpfs and host port 5434. |
| `tooling`, `tooling-init` | Opt-in `tools` profile; existing image, user, mounts and ownership initialization. Invoke as one-off services. |
| `postgres-client` | Opt-in `db-tools` profile; existing disposable SQL client. |
| Future `api`, `web` | Default development services when their actual code is delivered; no placeholder processes in this refactor. |

Keep service keys, logical volume keys, project naming and image references
unchanged. In particular, preserve the PostgreSQL 18 mount at `/var/lib/postgresql`.
Do not add fixed container names, external volumes, an explicit network duplicating
the default bridge, or deployment restart policies to local development.

Use native profiles for optional services, `healthcheck` for readiness,
`depends_on: condition: service_healthy` for future application dependencies, and
`stop_grace_period: 10s` for ordinary shutdown. Future API/frontend commands,
health endpoints, proxy/HMR and production Dockerfiles retain their own approvals.
Native dependency ordering does not provide runtime database reconnection or
application shutdown logic; those remain application responsibilities.

**Why this layout:** A developer can inspect one familiar YAML and use standard
Compose commands. Retaining multiple files is valid Compose and reduces immediate
file movement, but would retain repeated file-selection flags in this small setup.
Add an override later only when a real environment difference justifies it.

## Package scripts and direct commands

Ordinary package scripts should be thin aliases to Docker Compose. Use the
explicit prefix `docker compose --env-file /dev/null --file compose.yaml` below;
the table abbreviates it as `docker compose …`. No Turbo tasks, shared command
dispatcher, shell startup loops, or custom container inventory are needed.

| Package command | Intended implementation |
| --- | --- |
| `docker:build` | `docker compose … build tooling` |
| `docker:init` | `docker compose … run --rm --no-deps tooling-init` |
| `docker:up` | Existing narrow Doppler entry point `database.sh up dev`, ending in native Compose startup of the default development services. |
| `docker:up:test` | Existing narrow Doppler entry point `database.sh up test`, starting only `postgres_test` with `--no-deps`. Caller selects config `test`. |
| `docker:stop` | `docker compose … --profile '*' stop --timeout 10` |
| `docker:stop:test` | `docker compose … stop --timeout 10 postgres_test` |
| `docker:prune` | `docker compose … --profile '*' down --remove-orphans --timeout 10` |
| `docker:prune:volumes --confirm PROJECT` | Narrow volume-reset helper: validate confirmation/ownership, then native `down --volumes --remove-orphans --timeout 10` with all profiles enabled. |
| `docker:ps` | `docker compose … --profile '*' ps --all` |
| `docker:logs` | `docker compose … logs --follow postgres`; callers may use ordinary Compose to select other services. |

Require the existing explicit unique `COMPOSE_PROJECT_NAME`. Preserve the YAML's
required project interpolation so missing project selection fails even for direct
aliases. Compose validates project names. Standard CLI flags select the file and
disable `.env` loading; Docker's ordinary project/network/volume handling supplies
isolation. Package scripts run from the repository root on the host.

Document equivalent raw Compose commands for Docker-only users. They need no host
Node/pnpm. For interactive `docker compose up` / `down`, first select the project,
disable `.env` loading with standard `COMPOSE_DISABLE_ENV_FILE=1`, and clear
unintended `COMPOSE_FILE`, `COMPOSE_ENV_FILES`, and `COMPOSE_PROFILES`. Full-project
shutdown uses `--profile '*'` to include optional test/tooling services. Startup
still needs Doppler-provided variables before Compose runs.

Direct aliases require `docker` on PATH and follow normal Docker context behavior.
Do not reproduce the old launcher's executable discovery in every alias. This
machine already resolves Docker; no PATH or shell-profile change is proposed.
Existing helpers can retain their current executable override where still needed.

## Boundaries for remaining custom code

| Existing responsibility | Planned treatment |
| --- | --- |
| General dispatch in `scripts/docker.sh` | Delete it after replacing its package aliases and references. |
| Doppler target/config/key checks | Retain the existing `database.sh` boundary: pinned CLI, dedicated browser login, no fallback, selected-key allowlist, removal of ambient passwords, and matching `dev`/`test` config. Host secrets reach only declared container variables. |
| Database startup | Delegate service lifecycle and the 60s health wait to `docker compose up --detach --wait --wait-timeout 60`; preserve the existing authenticated SQL check as a separate verification step within the current entry point. Do not add a new orchestration engine. |
| Database command targeting | Retain `run`, `check`, `psql`, explicit integration-test targeting, guarded migrations and resource cleanup needed by those commands. These provide DB-specific behavior. |
| Legacy database lifecycle options | Replace plain pull/stop/logs/down dispatch with documented Compose equivalents. Keep only target-specific reset behavior that still adds approved confirmation/data-isolation checks, and update callers/documentation together. |
| `tooling.sh` | Preserve `run`, `run-db`, environment verification and tested signal/container cleanup. Update it to the canonical file; retire build/init/down aliases from this helper once their consumers use Compose. |
| `docker/init-volumes.sh` | Keep the existing mount-root ownership operation. Compose declares its one-off service; the operation is not lifecycle orchestration. |
| Confirmed volume deletion | Extract a single-purpose helper from the current dispatcher, retaining exact project confirmation and ownership validation before mutation. Obtain the declared volume inventory from `docker compose config --volumes`; use native `down --volumes` for deletion instead of implementing a deletion loop. Keep ordinary `down` available without this helper. |

Preserve the distinction between Compose health and successful application
authentication: `pg_isready` alone does not prove the password works. Existing
authenticated connection checks remain; future API readiness owns its own DB check.

Keep unset database passwords as empty interpolation defaults in the combined
model so DB-free tooling and secret-free shutdown can parse it. The startup
helper still rejects a missing managed password before mutation. Builds/imports
and ordinary checks require no Doppler access. Do not print secret-bearing
rendered configuration during verification.

The volume helper must derive project-scoped names only for the supported local
model (no external/custom-named volumes), inspect all existing candidates before
teardown, and fail on ownership/inspection errors. Compose remains responsible
for removal. No hardcoded second list of volumes, global prune, forced removal
of other projects, or replacement Docker parser is needed.

Retain existing tested deadline/signal code only where it protects a running
workspace command or SQL client beyond Compose's own guarantees. Review it against
the CLI's native timeout behavior before removal; do not expand this refactor
into an unverified rewrite of Steps 1–3.

## Implementation order and affected files

1. Consolidate `compose.yaml` while preserving resource names and storage. Update
   file selections in `database.sh` and `tooling.sh`, then retire
   `compose.postgres.yaml`. Verify default/optional service selection and DB-free
   parsing before running any service.
2. Replace ordinary `package.json` aliases with direct Compose commands; extract
   the volume-reset helper; remove `scripts/docker.sh`. Reduce superseded helper
   operations and update every active caller in the same change.
3. Update `packages/db/src/docker-launcher.test.ts` to test the remaining
   confirmation/ownership helper, rather than an obsolete dispatcher. Preserve
   and adapt `launcher.test.ts` coverage for DB target and secret isolation. Add
   no unit tests that merely reproduce Compose's documented implementation.
4. Update README, the local-development reference, technical direction,
   foundation guide and AGENTS.md to describe actual implemented behavior. Include
   raw Compose equivalents and the distinction between ordinary teardown and
   data deletion. Preserve historical evidence; replace broken links to retired
   files with immutable historical references where needed.
5. Verify in a disposable project and deliver a focused reviewable change with
   actual results. The current planning request does not publish a PR, change
   containers, or implement the refactor.

## Acceptance evidence required for implementation

- Secret-free Compose configuration inspection shows default development
  PostgreSQL, opt-in test/tools, unchanged pins/mounts/ports, and the expected six
  volume keys. Tooling-only build/init/run/checks work without fetching DB secrets.
- Existing development data survives configuration consolidation, stop/start,
  and native container/network teardown. Compare service/volume identities;
  use disposable probe data and avoid resetting the owner's project.
- Development/test startup obtains the matching Doppler key and authenticates;
  a mismatch/missing key fails before startup. Test-only startup/stop leaves
  development unaffected, and stopped test tmpfs is discarded.
- Native `--wait` fails within 60s for unhealthy startup; occupied ports fail
  nonzero. Changed wrappers retain SQL deadline, signal forwarding and temporary
  client cleanup evidence. Shutdown/status/logs require no Doppler.
- Direct package aliases and documented raw Compose equivalents operate on the
  same project. Full-profile shutdown includes optional services; normal startup
  excludes them when no optional profile is requested.
- Ordinary down preserves named volumes. Wrong/missing reset confirmation and
  ownership mismatch leave every resource untouched. Correct confirmation removes
  declared project volumes while another running project remains intact. Adding
  a disposable declared volume proves cleanup follows Compose's inventory.
- Fresh init plus frozen dependency installation succeeds after full deletion.
  All verification resources are removed afterward.
- `pnpm check`, relevant real-PostgreSQL launcher checks, shell syntax,
  documentation links/fences/tables, and `git diff --check` pass. Report retained
  custom code with its specific reason and any deferred evidence.

## Primary references

- [Compose profiles](https://docs.docker.com/compose/how-tos/profiles/): default application services and optional one-off/test services.
- [Compose service configuration](https://docs.docker.com/reference/compose-file/services/): health/dependency/shutdown declarations.
- [Compose environment controls](https://docs.docker.com/compose/how-tos/environment-variables/envvars/): project selection and env-file behavior.
- [Doppler with Compose](https://docs.doppler.com/docs/docker-compose): host injection and explicit service environment mappings.
- [Compose configuration inspection](https://docs.docker.com/reference/cli/docker/compose/config/): supported service/profile/volume inventory.
- [Compose teardown](https://docs.docker.com/reference/cli/docker/compose/down/): native container/network removal and optional volume deletion.
