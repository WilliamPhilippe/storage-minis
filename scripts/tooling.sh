#!/bin/bash
set -euo pipefail

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

usage() {
  printf '%s\n' 'Usage: tooling.sh {build|init|run COMMAND [ARG...]|run-db TARGET COMMAND [ARG...]|verify-env|down}'
}

if [[ $# -eq 0 ]]; then
  usage >&2
  exit 2
fi
operation=$1
shift
case "$operation" in
  build|init|verify-env|down) [[ $# -eq 0 ]] || { usage >&2; exit 2; } ;;
  run) [[ $# -gt 0 ]] || { usage >&2; exit 2; } ;;
  run-db|_run-db) [[ $# -ge 2 && ( $1 == dev || $1 == test ) ]] || { usage >&2; exit 2; } ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

[[ ${COMPOSE_PROJECT_NAME:-} =~ ^[a-z0-9][a-z0-9_-]*$ ]] ||
  fail 'Set COMPOSE_PROJECT_NAME to a unique lowercase name for this checkout.'

checkout=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
if [[ $operation == run-db ]]; then
  # Reuse exactly the database lifecycle's target validation and secret injection.
  exec "$checkout/scripts/database.sh" run "$@"
fi
docker_bin=${DOCKER_BIN:-}
if [[ -z "$docker_bin" ]]; then
  docker_bin=$(command -v docker || true)
  if [[ -z "$docker_bin" && -x /Applications/Docker.app/Contents/Resources/bin/docker ]]; then
    docker_bin=/Applications/Docker.app/Contents/Resources/bin/docker
  fi
fi
[[ -n "$docker_bin" && -x "$docker_bin" ]] ||
  fail 'Docker CLI unavailable. Start Docker Desktop or set DOCKER_BIN to its executable path.'

# Explicit files/project take precedence over ambient Compose settings. Never
# load a checkout .env or an ambient COMPOSE_ENV_FILES selection.
unset COMPOSE_ENV_FILES COMPOSE_FILE COMPOSE_PROFILES
export COMPOSE_DISABLE_ENV_FILE=1
compose=("$docker_bin" compose --env-file /dev/null
  --file "$checkout/compose.yaml" --project-directory "$checkout"
  --project-name "$COMPOSE_PROJECT_NAME" --profile tools)
container_environment=(--no-deps)
if [[ $operation == _run-db ]]; then
  [[ ${DB_TARGET:-} == "$1" && -n ${PGPASSWORD:-} ]] || fail 'Missing injected database configuration.'
  shift
  compose=("$docker_bin" compose --env-file /dev/null --file "$checkout/compose.yaml"
    --file "$checkout/compose.postgres.yaml" --project-directory "$checkout"
    --project-name "$COMPOSE_PROJECT_NAME" --profile '*')
  container_environment+=(--env DB_TARGET --env PGHOST --env PGPORT --env PGDATABASE --env PGUSER --env PGPASSWORD)
fi

# Compose run does not forward host TERM/INT reliably in attached pipe mode.
# Name only this invocation so traps can signal its container directly.
run_tooling() {
  local container_name="${COMPOSE_PROJECT_NAME}-tooling-run-$$-$RANDOM"
  local child="" status interrupted signal_to_forward="" attempt
  interrupted=0

  forward_signal() {
    interrupted=1
    signal_to_forward=$1
    [[ -n "$child" ]] || return 0
    # A signal can arrive while Docker is still creating the container.
    for ((attempt=0; attempt<50; attempt++)); do
      if "$docker_bin" kill --signal "$1" "$container_name" >/dev/null 2>&1; then
        return 0
      fi
      kill -0 "$child" 2>/dev/null || return 0
      sleep 0.1
    done
    kill -s "$1" "$child" 2>/dev/null || true
  }

  trap 'forward_signal SIGTERM' TERM
  trap 'forward_signal SIGINT' INT
  "${compose[@]}" run --rm --name "$container_name" "${container_environment[@]}" tooling "$@" <&0 &
  child=$!
  if [[ -n "$signal_to_forward" ]]; then forward_signal "$signal_to_forward"; fi
  while true; do
    interrupted=0
    if wait "$child"; then status=0; else status=$?; fi
    [[ "$interrupted" -eq 1 ]] || break
  done
  trap - TERM INT
  return "$status"
}

case "$operation" in
  build) exec "${compose[@]}" build tooling ;;
  init) exec "${compose[@]}" run --rm --no-deps tooling-init ;;
  run|_run-db) run_tooling "$@" ;;
  down) exec "${compose[@]}" down ;;
  verify-env)
    [[ -z ${DOPPLER_TOKEN:-} ]] ||
      fail 'Unset DOPPLER_TOKEN; this workflow requires checkout-scoped browser login.'
    [[ -n ${DOPPLER_PROJECT:-} && -n ${DOPPLER_CONFIG:-} ]] ||
      fail 'Set DOPPLER_PROJECT and DOPPLER_CONFIG explicitly (see README).'
    doppler_bin=${TOOLING_DOPPLER_BIN:-"$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler"}
    doppler_config_dir=${TOOLING_DOPPLER_CONFIG_DIR:-"$HOME/.config/storage-minis/doppler"}
    [[ -x "$doppler_bin" ]] || fail 'Install the pinned Doppler CLI using the README instructions.'
    [[ $("$doppler_bin" --version 2>/dev/null) == v3.77.1 ]] ||
      fail 'This launcher requires Doppler CLI 3.77.1.'
    [[ -d "$doppler_config_dir" ]] ||
      fail 'Complete browser login in the dedicated Doppler config directory (see README).'

    # The only managed key is a harmless marker. Doppler fetches it before
    # starting host Compose; no credential/config directory enters the image.
    # Suppress upstream diagnostics so errors cannot print configuration values.
    if "$doppler_bin" --config-dir "$doppler_config_dir" --scope "$checkout" \
      --project "$DOPPLER_PROJECT" --config "$DOPPLER_CONFIG" \
      --no-check-version --timeout 10s --attempts 1 \
      run --no-fallback --forward-signals --no-liveness-ping \
      --only-secrets FOUNDATION_TOOLING_PROBE -- /bin/bash -c '
        if [[ ${FOUNDATION_TOOLING_PROBE:-} != storage-minis-tooling-ok ]]; then
          printf "%s\n" "Host environment verification failed." >&2
          exit 1
        fi
        printf "%s\n" "Host environment verification passed."
        exec "$@"
      ' tooling-env "${compose[@]}" run --rm --no-deps \
      --env FOUNDATION_TOOLING_PROBE tooling node -e '
        const valid = process.env.FOUNDATION_TOOLING_PROBE === "storage-minis-tooling-ok"
          && !Object.keys(process.env).some((key) => key.startsWith("DOPPLER_"));
        console.log(valid ? "Container environment verification passed." : "Container environment verification failed.");
        process.exitCode = valid ? 0 : 1;
      ' </dev/null 2>/dev/null; then
      exit 0
    else
      status=$?
      printf '%s\n' 'Environment verification failed. Check login, project/config, marker and network (README).' >&2
      exit "$status"
    fi
    ;;
esac
