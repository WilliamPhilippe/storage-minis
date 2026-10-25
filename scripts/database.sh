#!/bin/bash
set -euo pipefail

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}
usage() {
  printf '%s\n' \
    'Usage: database.sh {pull|down|up TARGET|check TARGET|psql TARGET ARGS...|run TARGET COMMAND...|logs TARGET|stop TARGET|reset TARGET --confirm PROJECT}' \
    'TARGET is dev or test. psql is noninteractive; use -c SQL.'
}

# Every deadline also cancels its Docker CLI. Client callers separately remove
# their uniquely named container, including on TERM/INT or a deadline expiry.
bounded() {
  local seconds=$1 child timer="" result
  shift
  "$@" &
  child=$!
  if ((seconds > 0)); then
    (
      sleep "$seconds" &
      delay=$!
      trap 'kill "$delay" 2>/dev/null || true' EXIT
      trap 'exit 0' TERM INT
      wait "$delay"
      kill -TERM "$child" 2>/dev/null || exit 0
      sleep 2
      kill -KILL "$child" 2>/dev/null || true
    ) &
    timer=$!
  fi
  trap 'kill -TERM "$child" ${timer:+"$timer"} 2>/dev/null || true; wait "$child" 2>/dev/null || true; exit 143' TERM
  # Background shells may inherit SIGINT as ignored. TERM reliably cancels the
  # child chain; report the original user interruption as exit 130.
  trap 'kill -TERM "$child" ${timer:+"$timer"} 2>/dev/null || true; wait "$child" 2>/dev/null || true; exit 130' INT
  if wait "$child"; then result=0; else result=$?; fi
  if [[ -n $timer ]]; then
    kill "$timer" 2>/dev/null || true
    wait "$timer" 2>/dev/null || true
  fi
  trap - TERM INT
  return "$result"
}

# Reentry is used only as the payload of the host Doppler invocation. It keeps
# secrets in the environment rather than shell source, arguments or files.
injected=0
if [[ ${1:-} == _injected ]]; then injected=1; shift; fi
[[ $# -gt 0 ]] || { usage >&2; exit 2; }
operation=$1; shift
target=""
case "$operation" in
  -h|--help) usage; exit 0 ;;
  pull|down) [[ $# -eq 0 ]] || { usage >&2; exit 2; } ;;
  up|check|logs|stop|psql|reset|run)
    [[ $# -ge 1 ]] || { usage >&2; exit 2; }
    target=$1; shift
    [[ $target == dev || $target == test ]] || fail 'Target must be dev or test.'
    case "$operation" in
      psql|run) [[ $# -gt 0 ]] || { usage >&2; exit 2; } ;;
      reset) [[ $# -eq 2 && $1 == --confirm && $2 == "${COMPOSE_PROJECT_NAME:-}" && -n $2 ]] ||
        fail 'Reset requires --confirm with the exact COMPOSE_PROJECT_NAME.' ;;
      *) [[ $# -eq 0 ]] || { usage >&2; exit 2; } ;;
    esac ;;
  *) usage >&2; exit 2 ;;
esac
# Step 3B must deliberately replace this gate after physical-schema approval.
# Refuse even without Docker/Doppler setup, before any secret fetch or mutation.
if [[ $operation == run ]]; then
  for argument in "$@"; do
    case "$argument" in
      db:migrate|db:generate)
        fail 'Schema/migrations pending approval (Step 3B). No database or migration files were changed.' ;;
      test:db|test:integration)
        [[ $target == test ]] || fail 'Database integration tests require the explicit test target.' ;;
    esac
  done
fi
[[ ${COMPOSE_PROJECT_NAME:-} =~ ^[a-z0-9][a-z0-9_-]*$ ]] ||
  fail 'Set COMPOSE_PROJECT_NAME to a unique lowercase name for this checkout.'
export POSTGRES_PORT=${POSTGRES_PORT:-5433}
export POSTGRES_TEST_PORT=${POSTGRES_TEST_PORT:-5434}
for port in "$POSTGRES_PORT" "$POSTGRES_TEST_PORT"; do
  [[ $port =~ ^[1-9][0-9]{0,4}$ ]] && ((port <= 65535)) ||
    fail 'Database ports must be integers in 1–65535 without leading zeros.'
done
[[ $POSTGRES_PORT != "$POSTGRES_TEST_PORT" ]] || fail 'Development and test ports must differ.'

checkout=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
docker_bin=${DOCKER_BIN:-}
if [[ -z $docker_bin ]]; then
  docker_bin=$(command -v docker || true)
  if [[ -z $docker_bin && -x /Applications/Docker.app/Contents/Resources/bin/docker ]]; then
    docker_bin=/Applications/Docker.app/Contents/Resources/bin/docker
  fi
fi
[[ -n $docker_bin && -x $docker_bin ]] || fail 'Docker CLI unavailable; start Docker Desktop or set DOCKER_BIN.'
unset COMPOSE_ENV_FILES COMPOSE_FILE COMPOSE_PROFILES
export COMPOSE_DISABLE_ENV_FILE=1
compose=("$docker_bin" compose --env-file /dev/null --file "$checkout/compose.yaml"
  --file "$checkout/compose.postgres.yaml" --project-directory "$checkout"
  --project-name "$COMPOSE_PROJECT_NAME" --profile '*')

service=postgres
database=storage_minis_dev
secret_key=POSTGRES_PASSWORD
if [[ $target == test ]]; then
  service=postgres_test; database=storage_minis_test; secret_key=POSTGRES_TEST_PASSWORD
fi

# Only DB-bearing commands fetch secrets. Remove ambient values before Doppler
# runs so a missing managed key cannot inherit an old password.
case "$operation" in
  up|check|psql|run)
    if [[ $injected -eq 0 ]]; then
      [[ -z ${DOPPLER_TOKEN:-} ]] || fail 'Unset DOPPLER_TOKEN; checkout-scoped browser login is required.'
      [[ ${DOPPLER_PROJECT:-} == storage-minis && ${DOPPLER_CONFIG:-} == "$target" ]] ||
        fail "Set DOPPLER_PROJECT=storage-minis and DOPPLER_CONFIG=$target for this target."
      doppler_bin=${TOOLING_DOPPLER_BIN:-"$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler"}
      doppler_config_dir=${TOOLING_DOPPLER_CONFIG_DIR:-"$HOME/.config/storage-minis/doppler"}
      [[ -x $doppler_bin ]] || fail 'Pinned Doppler CLI unavailable; see README.'
      [[ $("$doppler_bin" --version 2>/dev/null) == v3.77.1 ]] || fail 'Doppler CLI 3.77.1 is required.'
      [[ -d $doppler_config_dir ]] || fail 'Complete browser login in the dedicated Doppler directory.'
      unset POSTGRES_PASSWORD POSTGRES_TEST_PASSWORD PGPASSWORD
      # Diagnostics from the fetch are suppressed; payload errors below are
      # sanitized and use stdout so useful Docker errors remain visible.
      if bounded 0 "$doppler_bin" --config-dir "$doppler_config_dir" --scope "$checkout" \
        --project storage-minis --config "$target" --no-check-version --timeout 10s --attempts 1 \
        run --no-fallback --forward-signals --no-liveness-ping --only-secrets "$secret_key" \
        -- /bin/bash -c '
          key=$1; shift
          if [[ -z ${!key:-} ]]; then
            printf "%s\n" "Required Doppler database password is missing."
            exit 1
          fi
          exec "$@"
        ' database-env "$secret_key" "$checkout/scripts/database.sh" _injected "$operation" "$target" "$@" \
        </dev/null 2>/dev/null; then
        exit 0
      else
        status=$?
        printf '%s\n' 'Database command failed. Check target, Doppler login/config/key/network, Docker and retained-volume credentials.' >&2
        exit "$status"
      fi
    fi
    [[ -n ${!secret_key:-} ]] || fail 'Required injected database password is missing.'
    ;;
  *) unset POSTGRES_PASSWORD POSTGRES_TEST_PASSWORD PGPASSWORD ;;
esac

sql_client() {
  local client_name="${COMPOSE_PROJECT_NAME}-sql-$$-$RANDOM" result
  # Never inherit host libpq options (service files, TLS, startup options, etc.).
  for key in ${!PG@}; do unset "$key"; done
  export PGHOST=$service PGPORT=5432 PGDATABASE=$database PGUSER=postgres
  export PGPASSWORD=${!secret_key} PGCONNECT_TIMEOUT=5 PGOPTIONS=""
  [[ $operation != check && $operation != up ]] || export PGOPTIONS='-c statement_timeout=5000'
  cleanup_client() { "$docker_bin" rm --force --volumes "$client_name" >/dev/null 2>&1 || true; }
  trap cleanup_client EXIT
  if [[ $operation == check || $operation == up ]]; then
    if bounded 15 "${compose[@]}" run --rm --no-deps -T --name "$client_name" \
      --env PGHOST --env PGPORT --env PGDATABASE --env PGUSER --env PGPASSWORD \
      --env PGCONNECT_TIMEOUT --env PGOPTIONS postgres-client \
      -X --no-password --set ON_ERROR_STOP=1 --tuples-only --no-align \
      -c "SELECT 1 WHERE current_database() = '$database' AND current_user = 'postgres' AND current_setting('TimeZone') = 'UTC';" \
      2>&1; then result=0; else result=$?; fi
  else
    if bounded 0 "${compose[@]}" run --rm --no-deps -T --name "$client_name" \
      --env PGHOST --env PGPORT --env PGDATABASE --env PGUSER --env PGPASSWORD \
      --env PGCONNECT_TIMEOUT --env PGOPTIONS postgres-client \
      -X --no-password --set ON_ERROR_STOP=1 "$@" 2>&1; then result=0; else result=$?; fi
  fi
  exit "$result"
}

case "$operation" in
  pull) bounded 600 "${compose[@]}" pull postgres 2>&1 ;;
  up)
    bounded 60 "${compose[@]}" up -d --no-deps --pull never --wait --wait-timeout 60 "$service" 2>&1 || exit $?
    # psql exits zero for an empty result, so assert the exact identity result.
    output=$(sql_client) || { printf '%s\n' "$output"; exit 1; }
    [[ $(printf '%s\n' "$output" | tail -n 1) == 1 ]] || fail 'Database identity check failed.'
    printf '%s\n' "$target database authentication and identity passed."
    ;;
  check)
    output=$(sql_client) || { printf '%s\n' "$output"; exit 1; }
    [[ $(printf '%s\n' "$output" | tail -n 1) == 1 ]] || fail 'Database identity check failed.'
    printf '%s\n' "$target database authentication and identity passed."
    ;;
  psql) sql_client "$@" ;;
  run)
    password=${!secret_key}
    for key in ${!PG@}; do unset "$key"; done
    unset DATABASE_URL POSTGRES_PASSWORD POSTGRES_TEST_PASSWORD
    export DB_TARGET=$target PGHOST=$service PGPORT=5432 PGDATABASE=$database PGUSER=postgres
    export PGPASSWORD=$password
    unset password
    exec "$checkout/scripts/tooling.sh" _run-db "$target" "$@"
    ;;
  logs) exec "${compose[@]}" logs --follow "$service" ;;
  stop) exec "${compose[@]}" stop --timeout 10 "$service" ;;
  down) exec "${compose[@]}" down --timeout 10 ;;
  reset)
    printf 'Resetting %s for project %s.\n' "$service" "$COMPOSE_PROJECT_NAME"
    volume="${COMPOSE_PROJECT_NAME}_pgdata"
    if [[ $target == dev ]]; then
      printf 'Affected development volume: %s\n' "$volume"
      if "$docker_bin" volume inspect "$volume" >/dev/null 2>&1; then
        owner=$("$docker_bin" volume inspect --format '{{index .Labels "com.docker.compose.project"}}/{{index .Labels "com.docker.compose.volume"}}' "$volume")
        [[ $owner == "$COMPOSE_PROJECT_NAME/pgdata" ]] || fail 'Volume ownership mismatch; refusing reset.'
      else
        # Distinguish a missing volume from an unavailable daemon.
        "$docker_bin" info >/dev/null 2>&1 || fail 'Docker daemon unavailable.'
      fi
    else
      printf '%s\n' 'Affected storage: test container tmpfs only.'
    fi
    "${compose[@]}" stop --timeout 10 "$service"
    "${compose[@]}" rm --force "$service"
    if [[ $target == dev ]] && "$docker_bin" volume inspect "$volume" >/dev/null 2>&1; then
      "$docker_bin" volume rm "$volume"
    fi
    ;;
esac
