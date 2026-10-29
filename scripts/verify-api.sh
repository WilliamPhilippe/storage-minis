#!/bin/bash
# Narrow host proof for the canonical runtime image, never a lifecycle dispatcher.
set -euo pipefail
fail() { printf '%s\n' "$*" >&2; exit 1; }
[[ $# == 0 ]] || fail 'Usage: verify-api.sh (via database.sh api-verify test)'
[[ ${DB_TARGET:-} == test && ${PGHOST:-} == postgres_test && ${PGPORT:-} == 5432 &&
   ${PGDATABASE:-} == storage_minis_test && ${PGUSER:-} == postgres && -n ${PGPASSWORD:-} ]] ||
  fail 'API verification requires the exact injected test tuple.'
verify_port=${API_VERIFY_HOST_PORT-0}
[[ $verify_port == 0 && ! ${API_VERIFY_HOST_PORT+x} ]] || {
  [[ $verify_port =~ ^[1-9][0-9]{0,4}$ ]] && ((verify_port <= 65535)) ||
    fail 'API_VERIFY_HOST_PORT must be an integer in 1–65535 without leading zeros.'
}
checkout=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
source "$checkout/scripts/local-config.sh"
load_local_config
unset COMPOSE_ENV_FILES COMPOSE_FILE COMPOSE_PROFILES DATABASE_URL POSTGRES_PASSWORD POSTGRES_TEST_PASSWORD
export COMPOSE_DISABLE_ENV_FILE=1
# Pass only the explicitly selected tuple into the container.
selected_password=$PGPASSWORD
for key in ${!PG@}; do unset "$key"; done
export DB_TARGET=test PGHOST=postgres_test PGPORT=5432 PGDATABASE=storage_minis_test PGUSER=postgres PGPASSWORD=$selected_password
unset selected_password
# The ordinary service publication is irrelevant to Compose run's explicit port.
unset API_HOST_PORT
export LOG_LEVEL=${LOG_LEVEL-info}
case "$LOG_LEVEL" in fatal|error|warn|info|debug|trace|silent) ;; *) fail 'Invalid LOG_LEVEL.' ;; esac
docker_bin=${DOCKER_BIN:-$(command -v docker || true)}
if [[ -z $docker_bin && -x /Applications/Docker.app/Contents/Resources/bin/docker ]]; then
  docker_bin=/Applications/Docker.app/Contents/Resources/bin/docker
fi
[[ -x $docker_bin && -x /usr/bin/curl ]] || fail 'Docker CLI and /usr/bin/curl are required.'
compose=("$docker_bin" compose --env-file "$compose_env_file" --file "$checkout/compose.yaml"
  --project-directory "$checkout" --project-name "$COMPOSE_PROJECT_NAME")
name="${COMPOSE_PROJECT_NAME}-api-verify-$$-$RANDOM-$RANDOM"
label=storage-minis.api-verify
active=""; timer=""; watchdog=""; attempted=0; launch_settled=0; cleaning=0
operation_end=$((SECONDS + 45))
absolute_end=$((SECONDS + 60))
budget_end=$absolute_end

# Bound each client, cancel its timer and reap both, including on interruption.
# Metadata callers use command substitution, whose own trap cancels that client.
limit() {
  local seconds=$1 result
  shift
  local available=$((budget_end - SECONDS - 1))
  ((available > 0)) || return 124
  ((seconds <= available)) || seconds=$available
  "$@" 2>/dev/null & active=$!
  (
    delay=""
    trap '[[ -z $delay ]] || kill "$delay" 2>/dev/null || true' EXIT
    trap 'exit 0' TERM INT
    sleep "$seconds" & delay=$!; wait "$delay"
    kill -TERM "$active" 2>/dev/null || exit 0
    sleep 0.2
    kill -KILL "$active" 2>/dev/null || true
  ) </dev/null >/dev/null 2>&1 & timer=$!
  if wait "$active"; then result=0; else result=$?; fi
  kill "$timer" 2>/dev/null || true
  wait "$timer" 2>/dev/null || true
  active=""; timer=""
  return "$result"
}
cancel_client() {
  if [[ -n $active ]]; then
    kill -TERM "$active" 2>/dev/null || true
    kill -KILL "$active" 2>/dev/null || true
    wait "$active" 2>/dev/null || true
  fi
  [[ -z $timer ]] || { kill "$timer" 2>/dev/null || true; wait "$timer" 2>/dev/null || true; }
  active=""; timer=""
}
# In Bash command substitutions clear EXIT but inherit this explicit signal trap.
trap 'cancel_client; exit 143' TERM
trap 'cancel_client; exit 130' INT
owned() {
  local owner
  owner=$(limit 1 "$docker_bin" inspect --format "{{index .Config.Labels \"$label\"}}" "$name") || return 1
  [[ $owner == "$name" ]]
}
inventory() {
  remaining=$(limit 1 "$docker_bin" container ls --all --filter "name=^/$name$" --format '{{.ID}}') || return 1
  [[ -z $remaining || $remaining =~ ^[a-f0-9]{12,64}$ ]]
}
cleanup() {
  local result=$? cleanup_end=$((SECONDS + 15)) grace_end
  ((cleanup_end <= absolute_end)) || cleanup_end=$absolute_end
  # Reserve three seconds for force removal and verified absence after the
  # graceful-cleanup deadline; every client also respects this phase budget.
  grace_end=$((cleanup_end - 3))
  budget_end=$grace_end
  [[ $cleaning == 0 ]] || return
  cleaning=1
  trap '' TERM INT USR1
  cancel_client
  if [[ $attempted == 1 ]]; then
    # A cancelled Compose run may have submitted its create/start request already.
    # Allow that owned name to settle before deciding that no probe was created.
    if [[ $launch_settled == 0 ]]; then
      settle_end=$((SECONDS + 2))
      while ! owned && ((SECONDS < settle_end)); do sleep 0.1; done
    fi
    if owned; then
      # A graceful stop always precedes removal. Force is reserved for expiry.
      limit 11 "$docker_bin" stop --timeout 10 "$name" >/dev/null || true
      if ! limit 1 "$docker_bin" rm --volumes "$name" >/dev/null; then
        while ((SECONDS < grace_end)); do sleep 0.1; done
        budget_end=$cleanup_end
        limit 1 "$docker_bin" rm --force --volumes "$name" >/dev/null || result=1
      fi
      budget_end=$cleanup_end
      if inventory && [[ -z $remaining ]]; then
        printf '%s\n' 'Owned probe removed.'
      else
        printf '%s\n' 'API verification cleanup failed: probe absence unverified.' >&2; result=1
      fi
    else
      # A failed launch may have created no container; never delete a foreign one.
      budget_end=$cleanup_end
      if ! inventory || [[ -n $remaining ]]; then
        printf '%s\n' 'API verification ownership/absence check failed; no foreign removal attempted.' >&2; result=1
      fi
    fi
  fi
  [[ -z $watchdog ]] || { kill "$watchdog" 2>/dev/null || true; wait "$watchdog" 2>/dev/null || true; }
  exit "$result"
}
trap cleanup EXIT
trap 'cancel_client; exit 143' TERM
trap 'cancel_client; exit 130' INT
trap 'cancel_client; fail "API verification overall deadline exceeded."' USR1
# Reserve the final 15 seconds of the 60s operation for cleanup.
main=$$
(
  delay=""
  trap '[[ -z $delay ]] || kill "$delay" 2>/dev/null || true' EXIT
  trap 'exit 0' TERM INT
  sleep 45 & delay=$!; wait "$delay"
  kill -USR1 "$main" 2>/dev/null || true
) </dev/null >/dev/null 2>&1 & watchdog=$!
printf 'API verification probe: %s\n' "$name"
expected=$(limit 3 "$docker_bin" image inspect --format '{{.Id}}' "${COMPOSE_PROJECT_NAME}-api:step4") ||
  fail 'Runtime image unavailable; build api first.'
[[ $expected =~ ^sha256:[a-f0-9]{64}$ ]] || fail 'Invalid runtime image identity.'
attempted=1
limit 8 "${compose[@]}" run --detach --no-deps --pull never -T --name "$name" \
  --label "$label=$name" --publish "127.0.0.1:$verify_port:3000" \
  --env NODE_ENV=test --env DB_TARGET --env PGHOST --env PGPORT --env PGDATABASE --env PGUSER --env PGPASSWORD api >/dev/null ||
  fail 'Probe launch failed (image, Docker or port collision).'
launch_settled=1
owned || fail 'Probe ownership assertion failed.'
identity=$(limit 3 "$docker_bin" inspect --format '{{.Id}} {{.Image}} {{.State.Running}} {{len .Mounts}} {{.Config.User}} {{index .Config.Labels "com.docker.compose.service"}} {{index .Config.Labels "com.docker.compose.project"}}' "$name") || fail 'Probe inspection failed.'
read -r id image running mounts user service project <<< "$identity"
[[ $id =~ ^[a-f0-9]{64}$ && $image == "$expected" && $running == true && $mounts == 0 && $user == node && $service == api && $project == "$COMPOSE_PROJECT_NAME" ]] ||
  fail 'Probe image/running/mount/user/service assertions failed.'
binding=$(limit 3 "$docker_bin" inspect --format '{{range (index .NetworkSettings.Ports "3000/tcp")}}{{.HostIp}} {{.HostPort}}{{end}}' "$name") || fail 'Probe port inspection failed.'
read -r address port <<< "$binding"
[[ $address == 127.0.0.1 && $port =~ ^[1-9][0-9]{0,4}$ ]] && ((port <= 65535)) || fail 'Probe loopback publication assertion failed.'
[[ $verify_port == 0 || $verify_port == "$port" ]] || fail 'Probe explicit port assertion failed.'
printf 'Runtime image: %s\nContainer: %s\nLoopback port: %s\n' "$image" "$id" "$port"
# Curl has its own 8s timeout plus a client watchdog. Never display response data,
# URLs, raw client/container errors, logs or environment values.
ready_end=$((SECONDS + 30))
((ready_end <= operation_end)) || ready_end=$operation_end
request() {
  local path=$1 expected_body=$2 remaining=$3 response
  ((remaining > 0)) || return 1
  ((remaining <= 8)) || remaining=8
  response=$(limit "$remaining" /usr/bin/curl --disable --silent --noproxy '*' \
    --max-time "$remaining" --max-filesize 1024 --write-out '|%{http_code}' "http://127.0.0.1:$port/health/$path") || return 1
  [[ $response == "$expected_body|200" ]]
}
while ! request ready '{"status":"ready"}' "$((ready_end - SECONDS))"; do
  ((SECONDS < ready_end)) || fail 'Readiness HTTP assertion/deadline failed.'
  state=$(limit 1 "$docker_bin" inspect --format '{{.State.Running}}' "$name") || fail 'Probe state inspection failed.'
  [[ $state == true ]] || fail 'Probe exited before readiness (configuration or database authentication).'
  sleep 0.2
done
request live '{"status":"ok"}' "$((operation_end - SECONDS))" || fail 'Liveness HTTP assertion/deadline failed.'
printf '%s\n' 'Exact host HTTP 200 live/ready bodies passed.'
limit 12 "$docker_bin" stop --timeout 10 "$name" >/dev/null || fail 'SIGTERM shutdown deadline failed.'
state=$(limit 2 "$docker_bin" inspect --format '{{.State.Running}} {{.State.ExitCode}} {{.State.OOMKilled}}' "$name") || fail 'Shutdown inspection failed.'
[[ $state =~ ^(true|false)' '[0-9]+' '(true|false)$ ]] || fail 'Invalid shutdown state metadata.'
[[ $state == 'false 143 false' ]] || fail "SIGTERM exit assertion failed (running/exit/OOM: $state)."
printf '%s\n' 'SIGTERM exit 143 passed.'
