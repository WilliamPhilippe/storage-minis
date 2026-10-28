import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";

const sourceRoot = fileURLToPath(new URL("../../..", import.meta.url));
let root: string;
let directory: string;
let environment: NodeJS.ProcessEnv;

beforeEach(() => {
  directory = realpathSync(
    mkdtempSync(join(tmpdir(), "storage-minis-launcher-")),
  );
  root = directory;
  mkdirSync(join(root, "scripts"));
  for (const script of [
    "database.sh",
    "tooling.sh",
    "reset-volumes.sh",
    "local-config.sh",
  ]) {
    copyFileSync(
      join(sourceRoot, "scripts", script),
      join(root, "scripts", script),
    );
    chmodSync(join(root, "scripts", script), 0o700);
  }
  const docker = join(directory, "docker");
  const doppler = join(directory, "doppler");
  writeFileSync(
    doppler,
    `#!/bin/bash
set -eu
if [[ \${1:-} == --version ]]; then echo v3.77.1; exit 0; fi
selected=""; secret=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) selected=$2; shift 2 ;;
    --only-secrets) secret=$2; shift 2 ;;
    --) shift; break ;;
    *) shift ;;
  esac
done
[[ ($selected == test && $secret == POSTGRES_TEST_PASSWORD) || ($selected == dev && $secret == POSTGRES_PASSWORD) ]] || exit 8
[[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${PGPASSWORD:-} ]] || exit 9
[[ \${FIXTURE_MISSING_KEY:-} != 1 ]] || exec "$@"
export "$secret=fixture-$selected"
exec "$@"
`,
  );
  writeFileSync(
    docker,
    `#!/bin/bash
set -eu
if [[ $1 == rm ]]; then
  printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/calls"
  exit 0
fi
[[ -z \${COMPOSE_FILE:-} && -z \${COMPOSE_PROFILES:-} && -z \${COMPOSE_ENV_FILES:-} ]] || exit 13
[[ $* != *compose.postgres.yaml* ]] || exit 14
[[ $* == *"--file "*compose.yaml* ]] || exit 15
if [[ \${FIXTURE_STARTUP:-} == 1 ]]; then
  printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/calls"
  if [[ $* == *" up "* ]]; then exit "\${FIXTURE_UP_STATUS:-0}"; fi
  if [[ $* == *" run "* ]]; then echo 1; exit "\${FIXTURE_SQL_STATUS:-0}"; fi
  exit 0
fi
[[ \${DB_TARGET:-} == test && \${PGHOST:-} == postgres_test && \${PGDATABASE:-} == storage_minis_test ]] || exit 10
[[ \${PGPASSWORD:-} == fixture-test && \${PGPORT:-} == 5432 && \${PGUSER:-} == postgres ]] || exit 11
[[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${DATABASE_URL:-} && -z \${PGOPTIONS:-} ]] || exit 12
printf '%s\\n' 'test target and secret isolation passed'
`,
  );
  chmodSync(docker, 0o700);
  chmodSync(doppler, 0o700);
  environment = {
    PATH: process.env.PATH,
    FIXTURE_DIRECTORY: directory,
    COMPOSE_FILE: "untrusted.yaml",
    COMPOSE_ENV_FILES: "untrusted.env",
    COMPOSE_PROFILES: "untrusted",
    COMPOSE_PROJECT_NAME: "storage-minis-launcher-fixture",
    DOCKER_BIN: docker,
    TOOLING_DOPPLER_BIN: doppler,
    TOOLING_DOPPLER_CONFIG_DIR: directory,
    DOPPLER_PROJECT: "storage-minis",
    DOPPLER_CONFIG: "test",
    POSTGRES_PASSWORD: "ambient-dev",
    POSTGRES_TEST_PASSWORD: "ambient-test",
    PGPASSWORD: "ambient-password",
    PGOPTIONS: "ambient-options",
    DATABASE_URL: "ambient-url",
  };
});
afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

it("selects only the test config/key and clears ambient connection overrides", () => {
  const output = execFileSync(
    "/bin/bash",
    [join(root, "scripts/tooling.sh"), "run-db", "test", "pnpm", "db:check"],
    { env: environment, encoding: "utf8", timeout: 5_000 },
  );
  expect(output).toContain("test target and secret isolation passed");
  expect(output).not.toContain("fixture-test");
});

it("rejects mismatched Doppler config before any injected payload", () => {
  expect(() =>
    execFileSync(
      "/bin/bash",
      [join(root, "scripts/tooling.sh"), "run-db", "test", "pnpm", "db:check"],
      {
        env: { ...environment, DOPPLER_CONFIG: "dev" },
        stdio: "pipe",
        timeout: 5_000,
      },
    ),
  ).toThrow("DOPPLER_CONFIG=test");
});

it("allows approved migrations through the selected test-target injection", () => {
  const output = execFileSync(
    "/bin/bash",
    [join(root, "scripts/tooling.sh"), "run-db", "test", "pnpm", "db:migrate"],
    { env: environment, encoding: "utf8", timeout: 5_000 },
  );
  expect(output).toContain("test target and secret isolation passed");
});

it("refuses development integration tests before credentials", () => {
  for (const command of ["test:db", "test:integration"]) {
    expect(() =>
      execFileSync(
        "/bin/bash",
        [join(root, "scripts/tooling.sh"), "run-db", "dev", "pnpm", command],
        {
          env: { COMPOSE_PROJECT_NAME: "storage-minis-fixture" },
          stdio: "pipe",
          timeout: 5_000,
        },
      ),
    ).toThrow("explicit test target");
  }
});

function startup(target: string) {
  return execFileSync(
    "/bin/bash",
    [join(root, "scripts/database.sh"), "up", target],
    {
      env: { ...environment, DOPPLER_CONFIG: target, FIXTURE_STARTUP: "1" },
      encoding: "utf8",
      stdio: "pipe",
      timeout: 5_000,
    },
  );
}

it("retains native startup failure and refuses missing managed passwords before Docker", () => {
  environment.FIXTURE_UP_STATUS = "17";
  expect(() => startup("test")).toThrow();
  expect(readFileSync(join(directory, "calls"), "utf8")).not.toContain(" run ");
  rmSync(join(directory, "calls"));
  environment.FIXTURE_MISSING_KEY = "1";
  expect(() => startup("test")).toThrow("Database command failed");
  expect(existsSync(join(directory, "calls"))).toBe(false);
});

it("starts default dev services and isolates test startup before authenticated SQL", () => {
  expect(startup("dev")).toContain(
    "dev database authentication and identity passed",
  );
  expect(startup("test")).toContain(
    "test database authentication and identity passed",
  );
  const calls = readFileSync(join(directory, "calls"), "utf8");
  expect(calls).toContain(
    "up --detach --pull never --wait --wait-timeout 60\n",
  );
  expect(calls).toContain(
    "up --detach --no-deps --pull never --wait --wait-timeout 60 postgres_test\n",
  );
  expect(calls).toContain("--env PGPASSWORD");
  expect(calls).not.toContain("fixture-test");
});

it("retains the SQL container name for EXIT cleanup after command failure on Bash 3.2", () => {
  environment.FIXTURE_SQL_STATUS = "17";
  expect(() => startup("test")).toThrow();
  const calls = readFileSync(join(directory, "calls"), "utf8");
  const name = /--name (\S+)/.exec(calls)?.[1];
  expect(name).toMatch(/^storage-minis-launcher-fixture-sql-\d+-\d+$/);
  expect(calls).toContain(`rm --force --volumes ${name ?? ""}\n`);
});
