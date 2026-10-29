#!/bin/bash
set -euo pipefail

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

[[ $# -eq 2 && $1 == --confirm && -n $2 ]] ||
  fail 'Volume deletion requires --confirm with the exact COMPOSE_PROJECT_NAME.'
checkout=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
source "$checkout/scripts/local-config.sh"
load_local_config
[[ $2 == "$COMPOSE_PROJECT_NAME" ]] || fail 'Volume deletion requires --confirm with the exact COMPOSE_PROJECT_NAME.'
docker_bin=${DOCKER_BIN:-}
if [[ -z $docker_bin ]]; then
  docker_bin=$(command -v docker || true)
  if [[ -z $docker_bin && -x /Applications/Docker.app/Contents/Resources/bin/docker ]]; then
    docker_bin=/Applications/Docker.app/Contents/Resources/bin/docker
  fi
fi
[[ -n $docker_bin && -x $docker_bin ]] || fail 'Docker CLI unavailable; start Docker Desktop or set DOCKER_BIN.'

unset COMPOSE_ENV_FILES COMPOSE_FILE COMPOSE_PROFILES
unset POSTGRES_PASSWORD POSTGRES_TEST_PASSWORD PGPASSWORD DATABASE_URL
export COMPOSE_DISABLE_ENV_FILE=1
compose=("$docker_bin" compose --env-file "$compose_env_file" --file "$checkout/compose.yaml"
  --project-directory "$checkout" --project-name "$COMPOSE_PROJECT_NAME" --profile '*')

# This local model uses only Compose-managed, project-scoped volumes. External
# or custom-named volumes require a different ownership contract before adoption.
logical_volumes=$("${compose[@]}" config --volumes) || fail 'Cannot read declared volumes; no resources were changed.'
existing_volumes=$("$docker_bin" volume ls --format '{{.Name}}') || fail 'Cannot list Docker volumes; no resources were changed.'
printf 'Removing containers/network and declared volumes for project %s.\n' "$COMPOSE_PROJECT_NAME"
while IFS= read -r logical; do
  [[ -n $logical ]] || continue
  [[ $logical =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]] || fail 'Unsupported volume key; no resources were changed.'
  volume="${COMPOSE_PROJECT_NAME}_$logical"
  printf 'Affected volume: %s\n' "$volume"
  while IFS= read -r candidate; do
    [[ $candidate == "$volume" ]] || continue
    owner=$("$docker_bin" volume inspect --format '{{index .Labels "com.docker.compose.project"}}/{{index .Labels "com.docker.compose.volume"}}' "$volume") ||
      fail "Cannot inspect $volume; no resources were changed."
    [[ $owner == "$COMPOSE_PROJECT_NAME/$logical" ]] ||
      fail "Volume ownership mismatch for $volume; no resources were changed."
    break
  done <<< "$existing_volumes"
done <<< "$logical_volumes"

# All existing candidates have passed inspection before native Compose teardown.
exec "${compose[@]}" down --volumes --remove-orphans
