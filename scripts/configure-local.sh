#!/bin/bash
set -euo pipefail

fail() { printf '%s\n' "$*" >&2; exit 1; }
usage() {
  printf '%s\n' 'Usage: configure-local.sh [--project NAME] [--port PORT] [--test-port PORT]'
}
checkout=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
source "$checkout/scripts/local-config.sh"
project=${COMPOSE_PROJECT_NAME:-}
port=${POSTGRES_PORT:-5433}
test_port=${POSTGRES_TEST_PORT:-5434}
explicit=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --project|--port|--test-port)
      [[ $# -ge 2 && -n $2 ]] || { usage >&2; exit 2; }
      case "$1" in --project) project=$2 ;; --port) port=$2 ;; --test-port) test_port=$2 ;; esac
      explicit=1; shift 2 ;;
    *) usage >&2; exit 2 ;;
  esac
done

if [[ -e "$checkout/.env.compose" ]]; then
  [[ $explicit -eq 0 ]] || fail '.env.compose already exists; edit its nonsecret settings deliberately instead of overwriting it.'
  load_local_config
  printf '%s\n' 'Reusing saved .env.compose settings.'
  exit 0
fi

if [[ -t 0 && $explicit -eq 0 ]]; then
  project=${project:-$(basename "$checkout")}
  printf '%s\n' 'Choose a unique Compose project name. Reuse the existing name to retain its volumes.'
  read -r -p "Compose project [$project]: " answer
  project=${answer:-$project}
  read -r -p "Development PostgreSQL port [$port]: " answer
  port=${answer:-$port}
  read -r -p "Test PostgreSQL port [$test_port]: " answer
  test_port=${answer:-$test_port}
fi
[[ -n $project ]] || fail 'First setup needs a project name: run interactively or configure-local.sh --project NAME [--port PORT] [--test-port PORT].'
validate_local_config "$project" "$port" "$test_port"

# Refuse concurrent overwrite; this file contains no credentials or shell code.
(
  umask 077
  set -o noclobber
  printf 'COMPOSE_PROJECT_NAME=%s\nPOSTGRES_PORT=%s\nPOSTGRES_TEST_PORT=%s\n' \
    "$project" "$port" "$test_port" > "$checkout/.env.compose"
) || fail 'Cannot create .env.compose; no existing settings were overwritten.'
printf 'Saved .env.compose for project %s.\n' "$project"
