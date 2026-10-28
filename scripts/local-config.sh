#!/bin/bash
# Shared by the narrow host helpers. Read literal, allowlisted settings only;
# never source a user-editable env file as shell code.

validate_local_config() {
  [[ $1 =~ ^[a-z0-9][a-z0-9_-]*$ ]] ||
    fail 'Set COMPOSE_PROJECT_NAME to a unique lowercase name for this checkout.'
  local port
  for port in "$2" "$3"; do
    [[ $port =~ ^[1-9][0-9]{0,4}$ ]] && ((port <= 65535)) ||
      fail 'Database ports must be integers in 1–65535 without leading zeros.'
  done
  [[ $2 != "$3" ]] || fail 'Development and test ports must differ.'
}

load_local_config() {
  local line key value seen='|' saved_project='' saved_port='' saved_test_port=''
  compose_env_file=/dev/null
  if [[ -f "$checkout/.env.compose" ]]; then
    compose_env_file="$checkout/.env.compose"
    while IFS= read -r line || [[ -n $line ]]; do
      case "$line" in ''|'#'*) continue ;; esac
      [[ $line == *=* ]] || fail 'Invalid .env.compose setting; expected KEY=value.'
      key=${line%%=*}; value=${line#*=}
      [[ $seen != *"|$key|"* ]] || fail 'Duplicate setting in .env.compose.'
      seen="$seen$key|"
      case "$key" in
        COMPOSE_PROJECT_NAME) saved_project=$value ;;
        POSTGRES_PORT) saved_port=$value ;;
        POSTGRES_TEST_PORT) saved_test_port=$value ;;
        *) fail '.env.compose supports only COMPOSE_PROJECT_NAME, POSTGRES_PORT and POSTGRES_TEST_PORT.' ;;
      esac
    done < "$compose_env_file"
    validate_local_config "$saved_project" "$saved_port" "$saved_test_port"
  fi
  export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-$saved_project}
  export POSTGRES_PORT=${POSTGRES_PORT:-${saved_port:-5433}}
  export POSTGRES_TEST_PORT=${POSTGRES_TEST_PORT:-${saved_test_port:-5434}}
  [[ -n $COMPOSE_PROJECT_NAME ]] || fail 'Run pnpm docker:setup once, or set COMPOSE_PROJECT_NAME for an explicit disposable project.'
  validate_local_config "$COMPOSE_PROJECT_NAME" "$POSTGRES_PORT" "$POSTGRES_TEST_PORT"
}

resolve_doppler() {
  doppler_bin=${TOOLING_DOPPLER_BIN:-}
  if [[ -z $doppler_bin ]]; then
    doppler_bin=$(command -v doppler || true)
    if [[ -z $doppler_bin ]]; then
      doppler_bin="$HOME/.local/share/storage-minis/tools/doppler/3.77.1/doppler"
    fi
  fi
  doppler_config_dir=${TOOLING_DOPPLER_CONFIG_DIR:-"$HOME/.config/storage-minis/doppler"}
  [[ -x $doppler_bin ]] || fail 'Pinned Doppler CLI unavailable; see README.'
  [[ $("$doppler_bin" --version 2>/dev/null) == v3.77.1 ]] || fail 'Doppler CLI 3.77.1 is required.'
  [[ -d $doppler_config_dir ]] || fail 'Complete browser login in the dedicated Doppler directory.'
}
