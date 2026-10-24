# Step 2 implementation plan — development and test PostgreSQL

Prepared 2026-10-24 for [guide Step 2](../technical/technical-foundation-implementation-guide.md#step-2--development-and-test-postgresql), under [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26).
**Status: owner-approved for implementation on 2026-10-24.**
The owner approved this concrete plan and requested implementation. The proposal
below records the approved scope; actual results are recorded in technical
direction and remain distinct from the planned verification.

The owner requested PostgreSQL in separate containers, Compose definitions in this
step, local development and testing access using the PostgreSQL user, and no
application of [schema.dbml](../database/schema.dbml). The owner subsequently
approved the `postgres` superuser in both containers, different passwords,
databases `storage_minis_dev` / `storage_minis_test`, and both credential sets in
the existing Doppler `storage-minis` / `dev` config. The owner confirmed adding
`POSTGRES_PASSWORD` and `POSTGRES_TEST_PASSWORD` on 2026-10-24. Their contents were
not fetched during planning; actual injection remains implementation verification.

## Starting state and boundaries

- Working tree was clean at inspection. HEAD is `17771994adef99e6f575385266970d472c65b8b0`,
  the merge commit of [Step 1 PR #103](https://github.com/WilliamPhilippe/storage-minis/pull/103).
  GitHub confirms that PR is merged, resolving the guide's stale pending-merge note.
- Step 1 provides `compose.yaml`, `scripts/tooling.sh`, a pinned Node image,
  isolated dependencies/caches, and authenticated host Doppler verification.
  Its recorded checks establish predecessor evidence; they were not rerun here.
- Read-only inspection reconfirmed Docker Engine 29.9.2, Compose 5.6.1, and a
  reachable Linux arm64 daemon. The bundled Docker executable works without
  changing PATH. No PostgreSQL image was pulled and no container was started.
- Live #21, #22, #23 and #26, including their empty comment collections, were
  inspected. T06 remains open and blocked by T01/T02/T04. This plan requests only
  local infrastructure bootstrap; those dependencies and business acceptance remain.
- The database design guide, update-log index, DBML context and foundation
  proposal were inspected. The DBML remains a design input for later Drizzle
  schema work. This step adds no domain tables, migrations, initialization SQL,
  driver, ORM, API, production infrastructure, backup policy or business tests.

Inherited approvals cover Docker Desktop, Node/pnpm/tooling pins, Doppler CLI
3.77.1, dedicated host browser-login state, no encrypted fallback, checkout
project naming and strict checks. The new approval covers the local role,
database names and Doppler mapping above. The owner then approved the remaining
recommendations below with “Approved. Implement it”.

| Foundation decision | Exact Step 2 subset |
| --- | --- |
| F01 | Local database bootstrap despite open business prerequisites. |
| F03 | PostgreSQL image, services, ports, storage and lifecycle. |
| F08 / F14 | DB-specific Doppler allowlists, validation and host-to-Compose injection; no Zod dependency yet. |
| F11 | Infrastructure persistence, authentication, isolation and failure probes. |
| F12 / F13 | Host orchestration and image-bundled SQL utilities; no new Turbo task or Node dependency. |

F04–F07 and F09–F10 remain outside this assignment. Approval of these subsets
does not select the later driver, migration implementation or production roles.

## Approved recommendations

| Choice | Recommendation and rationale | Alternatives and tradeoffs |
| --- | --- | --- |
| Image | Docker Official Image `postgres:18.6-bookworm` at the digest below, matching the existing researched proposal and Debian tooling base. | Alpine reduces image size but introduces a different libc; PostgreSQL 17 is supported but an older major; 19 is a prerelease. Mutable tags lose reproducibility. |
| Compose organization | Add `compose.postgres.yaml`, explicitly combined with existing `compose.yaml` for database operations. Keep database services separate from Node tooling. | Adding required DB interpolation directly to `compose.yaml` makes even tooling-only commands parse DB credentials. Profiles alone do not avoid interpolation. A separate optional file preserves DB-free tooling. |
| Storage | Project-scoped development volume `pgdata`; independent test service with a 512 MiB tmpfs mount. | Two databases in one server share server lifetime and privileged access. A test named volume survives stop and needs explicit disposal. Tmpfs is disposable but consumes Docker VM memory and bounds test size. |
| Publishing | Development at `127.0.0.1:5433`, testing at `127.0.0.1:5434`, configurable per checkout. | No host publishing reduces access paths but prevents ordinary host database tools. Binding all interfaces unnecessarily exposes local services. |
| SQL utilities | Add a disposable `postgres-client` Compose service using the same image, with no data mounts. Use bundled `psql`/`pg_isready`; no host installation. | Installing a client in Node changes its image; adding `pg` now crosses into Step 3. Running queries only inside the DB container fails to exercise service-network access. |
| Launcher | Add `scripts/database.sh` with explicit `dev` / `test` targets and separate reset operations. | Raw Compose commands repeat secret handling and make target/cleanup mistakes easier. A shared launcher refactor adds unrelated changes to the verified Step 1 runner. |
| Readiness | Bounded Compose health wait followed by password-authenticated SQL from the client service. | Container startup and `pg_isready` alone do not establish successful authentication or the intended database identity. |

Exact image reference, reconfirmed through registry manifest inspection without
pulling image layers:

```text
postgres:18.6-bookworm@sha256:bbf83594798e144bff365a9c191c5d779f181fb3135902064ab8ff11918020fc
```

The manifest includes Linux arm64/v8 and amd64. See the
[official image metadata](https://github.com/docker-library/official-images/blob/master/library/postgres)
and [version policy](https://www.postgresql.org/support/versioning/).
Pin updates will require review rather than silently following tag changes.

## Compose definitions and ownership

`compose.postgres.yaml` will define these services and the `pgdata` volume, with
no fixed container names, external volumes, build context or application source:

| Setting | `postgres` | `postgres_test` | `postgres-client` |
| --- | --- | --- | --- |
| Profile | `db` | `test` | `db-tools` |
| Image | Pinned image above | Same | Same |
| Database role | `postgres` | `postgres` | Selected target's role |
| Database | `storage_minis_dev` | `storage_minis_test` | Selected target's database |
| Initialization password | Doppler `POSTGRES_PASSWORD` | Doppler `POSTGRES_TEST_PASSWORD`, mapped to container `POSTGRES_PASSWORD` | No server initialization; `PGPASSWORD` passed by name at execution |
| Storage | `pgdata:/var/lib/postgresql` | tmpfs `/var/lib/postgresql`, 536870912 bytes | No database mount |
| Host binding | `127.0.0.1:${POSTGRES_PORT:-5433}:5432` | `127.0.0.1:${POSTGRES_TEST_PORT:-5434}:5432` | None |
| Process | Image entrypoint and `postgres -c timezone=UTC` | Same | Entrypoint `psql` |
| Automatic restart | Disabled | Disabled | One-off `run --rm --no-deps` |

Set `POSTGRES_USER` and `POSTGRES_DB` explicitly for each server. Set
`POSTGRES_HOST_AUTH_METHOD=scram-sha-256`; all verification uses TCP. Do not
enable host `trust` authentication. Retain the official entrypoint, which prepares
storage and switches to the image's Linux `postgres` account. It owns DB storage;
Step 1's Node volume initializer must never touch it.

The PostgreSQL 18 image sets `PGDATA=/var/lib/postgresql/18/docker`; mount its
parent, `/var/lib/postgresql`, for both services. This avoids an accidental
anonymous data volume and uses the versioned layout from the
[pinned Dockerfile](https://github.com/docker-library/postgres/blob/e00e1bd34ec5c8a8e7ad89b273b3d42efaf6d5bc/18/bookworm/Dockerfile).
The named volume resolves to `<COMPOSE_PROJECT_NAME>_pgdata`; test storage never
mounts that volume. Stopping the test container discards its tmpfs contents.
[Docker tmpfs lifecycle](https://docs.docker.com/engine/storage/tmpfs/).

Use healthcheck `pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t 2`,
escaping variable expansion as `$$` in Compose. Set interval 2 seconds, timeout
3 seconds, 20 retries and start period 5 seconds. Startup uses
`up -d --wait --wait-timeout 60 <service>`, followed by SQL verification.
[Compose wait options](https://docs.docker.com/reference/cli/docker/compose/up/).

## Environment and connection contract

No additional owner-managed Doppler entries are proposed beyond the two already
confirmed. Do not create a test or production Doppler config in this step.

| Variable | Source | Consumer / rule |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | Doppler `storage-minis` / `dev` | Development initialization and development SQL client only. |
| `POSTGRES_TEST_PASSWORD` | Same config; different value | Test initialization and test SQL client only. |
| `COMPOSE_PROJECT_NAME` | Explicit host checkout setting | Reuse `storage-minis-beijing` here; unique for every checkout. |
| `POSTGRES_PORT` | Optional nonsecret host setting; default 5433 | Development host binding only. |
| `POSTGRES_TEST_PORT` | Optional nonsecret host setting; default 5434 | Test host binding only. |
| Existing `DOCKER_BIN`, `TOOLING_DOPPLER_BIN`, `TOOLING_DOPPLER_CONFIG_DIR` | Existing host settings | Reuse Step 1 discovery, pin and credential-directory conventions. |
| `DOPPLER_PROJECT`, `DOPPLER_CONFIG` | Explicit host selection | Require `storage-minis` / `dev` for this local workflow; reject another mapping before payload. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Launcher-generated target mapping | Only the SQL client; ignore ambient libpq settings. No secret URI construction. |

The launcher validates project-name syntax and port integers in 1–65535 and
rejects equal development/test ports. Checkout settings take precedence over
managed configuration by being validated/captured before Doppler execution.

For `up`, `check` and `psql`, run pinned Doppler on the host before Compose
parses configuration. Unset both ambient managed password keys before fetching;
allowlist only the selected target's key with `--only-secrets`. Require a
nonempty fetched value. This prevents an absent managed key from falling back to
an inherited password. Preserve the dedicated browser login, reject ambient
`DOPPLER_TOKEN`, disable fallback, close stdin for noninteractive execution, and
retain the ten-second request timeout / one attempt. Suppress upstream secret
diagnostics and report sanitized failures. No Doppler state enters containers.

Compose password expressions use empty defaults for unselected services so
secret-free lifecycle commands can parse the combined files. Empty values are
not usable credentials: the launcher rejects missing selected credentials before
starting a service, and the official image requires a password for fresh setup.
Only the selected service starts. Never print resolved secret-bearing Compose
configuration or put passwords in command arguments, files or Turbo inputs.
This extends the existing [Doppler-to-Compose boundary](https://docs.doppler.com/docs/docker-compose).

Use explicit `--file` arguments for both Compose files, explicit checkout/project
directories and project name, `--env-file /dev/null`, and
`COMPOSE_DISABLE_ENV_FILE=1`. Clear ambient Compose file/profile/env-file
selection, as in Step 1. Stop/log/reset operations use no Doppler fetch and do not
need credentials. Each secret-bearing invocation fetches current values.

| Connection origin | Development | Test |
| --- | --- | --- |
| Compose network, including future Node commands | `postgres:5432` | `postgres_test:5432` |
| Host database tool | `127.0.0.1:${POSTGRES_PORT:-5433}` | `127.0.0.1:${POSTGRES_TEST_PORT:-5434}` |
| Database / role | `storage_minis_dev` / `postgres` | `storage_minis_test` / `postgres` |

Host tools receive the corresponding password through the owner's existing
secret access; none is installed here. Containers never use host-mapped ports.
Step 3 receives these connection components and owns their Node/Drizzle injection
and configuration validation. No `DATABASE_URL` or general secret-bearing Node
runner is introduced in Step 2.

Changing an initialization password in Doppler does not change the role password
on an existing development volume. A subsequent authenticated check must fail
clearly; never reset data or silently restore the old secret. Document restoring
the matching credential or performing an explicitly reviewed SQL password change;
discarding development storage remains a separate deliberate action. Test
storage can be reset and initialized with its current credential.

## Implementation order and command interface

1. Record approval of the remaining choices in technical direction. The required
   Doppler entries are owner-confirmed; validate injection without printing them
   during implementation, before starting PostgreSQL.
2. Add `compose.postgres.yaml` with the definitions above. Validate the combined
   configuration quietly. Confirm the original tooling file still parses and
   runs independently without Doppler or DB variables.
3. Add `scripts/database.sh`, preserving the Step 1 launcher. Implement exact
   target validation, scoped environment injection, bounded checks and the
   following command interface. No package manifest, lockfile or Turbo change.
4. Pull the approved image explicitly, allowing at most 600 seconds. Image
   download is separate from the 60-second readiness bound. Start only the
   selected database, then perform authenticated SQL verification.
5. Run the infrastructure probes below; remove temporary SQL objects and
   secondary-project resources. Update README setup, variable inventory,
   lifecycle/reset instructions, actual evidence and guide progress.
6. Prepare one reviewable Step 2 PR and handoff. Do not merge it, start Step 3,
   close T06 or apply the DBML as part of this assignment.

Proposed host commands, from the checkout root:

```sh
export COMPOSE_PROJECT_NAME=storage-minis-beijing
export DOPPLER_PROJECT=storage-minis
export DOPPLER_CONFIG=dev
export TOOLING_DOPPLER_BIN=/opt/homebrew/bin/doppler
unset DOPPLER_TOKEN

./scripts/database.sh pull
./scripts/database.sh up dev
./scripts/database.sh up test
./scripts/database.sh check dev
./scripts/database.sh check test
./scripts/database.sh psql dev -c 'SELECT current_database(), current_user;'
./scripts/database.sh logs dev
./scripts/database.sh stop test
./scripts/database.sh stop dev
./scripts/database.sh down
```

`psql` is a noninteractive SQL utility command with stdin closed, not an
interactive terminal. It uses `-X`, `--no-password` and `ON_ERROR_STOP=1`;
`PGCONNECT_TIMEOUT=5`. The `check` query additionally uses a five-second
statement timeout and a 15-second outer process deadline, checking `SELECT 1`,
database name, role and UTC timezone. `up` succeeds only if both readiness and
that identity check succeed. Query the service over the shared project network
from `postgres-client`, with credentials passed as environment names, never URI
arguments. Arbitrary `psql` commands have no global statement deadline so future
manual inspection is not constrained by the smoke-check timeout.

`logs` follows only the selected service and exits on interruption. Stop operations
use a ten-second graceful shutdown timeout. `down` uses the combined service
definitions with all defined profiles and removes project containers/network,
preserving development and tooling volumes. Existing `tooling.sh down` uses only
the tooling file; document the combined database launcher for whole-project
shutdown once these services exist. No automatic restart or port fallback.

Destructive commands are distinct and never run during normal startup/shutdown:

```sh
./scripts/database.sh reset test --confirm "$COMPOSE_PROJECT_NAME"
./scripts/database.sh reset dev --confirm "$COMPOSE_PROJECT_NAME"
```

Both require an exact project confirmation and show the affected resource.
Test reset stops/removes only `postgres_test`, discarding its tmpfs. Development
reset stops/removes only `postgres`, verifies Compose ownership labels, and removes
only `<project>_pgdata`. It preserves the five tooling volumes and the test
container. Reset never restarts a database automatically. Do not use broad
`down --volumes` as a DB reset; that also deletes tooling dependencies/caches.

## Verification and completion evidence

Use a uniquely named empty probe schema such as `foundation_step2_probe_<nonce>`
to test persistence, with no domain tables. Remove it in cleanup even after a
failed probe. Run resets and deliberately broken credentials only in disposable
verification projects; retain the owner's development storage. Each finite probe
has an outer deadline; ordinary startup is at most 60 seconds plus the 15-second
SQL check after image download. Record command, exit status and sanitized outcome.

| Completion criterion / failure case | Command or probe | Expected evidence |
| --- | --- | --- |
| Image and architecture | Registry manifest inspection, image inspection after `pull`, then `up dev` / `up test`. | Approved digest, native arm64 image, healthy within bound, PostgreSQL 18.6 SQL version. |
| Authentication and identity | `check dev` / `check test`; repeated check using an intentionally wrong client password in a disposable project. | Correct database, `postgres`, UTC and `SELECT 1`; wrong password exits nonzero within deadline. Healthcheck success alone is insufficient. |
| Host access | Inspect loopback bindings; query each published endpoint from the client image through Docker Desktop's `host.docker.internal`. | Published dev/test ports each reach the intended DB. No wildcard binding. Document that this host-route probe is Desktop-specific. |
| Development persistence | Create probe schema; `stop dev`, `up dev`, query; then `down`, `up dev`, query again; drop schema. | Schema survives both ordinary lifecycle paths; no domain table or reset involved. |
| Disposable test storage | Create a test probe schema, stop/start test, query schema existence. | Test reinitializes empty; development probe and tooling-volume sentinels remain. |
| Workspace isolation | Start a second unique project on ports 5435/5436; create the same schema name independently and drop it in only one project. Inspect volume/network ownership. | Distinct project resources and independent SQL state. Development data from neither project appears in the other. |
| Port collision | In a fresh project, attempt to bind an already occupied dev port; wrap with a 75-second deadline. | Nonzero bind failure; no automatic alternate port or connection to the other project's DB. Existing DB remains reachable and unchanged. |
| Missing/wrong environment | Empty/missing allowlisted key, invalid project/config, absent login, ambient token, Doppler outage; use isolated test state or a process-scoped CLI test double without changing account secrets. | Fail before service startup; bounded, sanitized output and no fallback snapshots. Label test-double evidence separately from real Doppler injection. |
| Ambient and stale-file isolation | Put contradictory nonsecret placeholders in a temporary `.env` and ambient password/libpq variables; repeat target checks, restoring prior file bytes in cleanup. | Managed credentials and explicit targets win; stale values cannot select another DB or supply a missing secret. |
| Credential change on retained data | In a disposable persistent project, initialize with one process-scoped test password, recreate with a different value, authenticate with the latter. | Container readiness may pass; authenticated `up` fails without deleting the volume. Restore the original test credential and verify retained probe. |
| Reset ownership | Exercise `reset dev` and `reset test` only in secondary disposable projects, with tooling and DB sentinels. Also try incorrect confirmation. | Only named target storage removed; incorrect confirmation changes nothing; dev reset preserves tooling volumes and test data. |
| Failure cleanup | Fail a probe deliberately; inspect remaining schemas, containers, volumes and networks. | Temporary objects and secondary resources removed; existing primary resources retained. No global Docker prune. |
| Tooling regression | `bash -n scripts/database.sh scripts/tooling.sh`; existing tooling typecheck, lint and format checks; targeted format check of new Compose file; original tooling command without DB env. | Existing checks pass and DB-free tooling still works. Preserve normal empty-suite failure; do not add dummy Vitest tests. |

The [PostgreSQL readiness documentation](https://www.postgresql.org/docs/18/app-pg-isready.html)
explicitly distinguishes accepting connections from authentication. The
[pinned entrypoint](https://github.com/docker-library/postgres/blob/e00e1bd34ec5c8a8e7ad89b273b3d42efaf6d5bc/docker-entrypoint.sh)
is the source for initialization and existing-data behavior.

## Files, approval record and handoff

Implementation changes: new `compose.postgres.yaml` and `scripts/database.sh`;
README commands/inventory/reset guidance; dated approved decisions and actual
evidence in technical direction; Step 2 guide progress and this plan's status.
No host packages, shell setup, application dependencies, business schema or
permanent application test suite are added.

The Step 3 handoff includes the pinned image, project/network/volume names,
container and host connection components, Doppler mapping, credential-init
semantics, lifecycle commands and actual verification results. Its agent must
start from the merged Step 2 result and separately plan Drizzle connection and
migration tooling. The existing DBML is not applied here. Business schema,
authorization, transaction/concurrency guarantees and production role separation
remain with T01/T02/T03/T04 and later delivery; infrastructure evidence does not
satisfy those acceptance criteria.
