import { execFileSync, spawnSync } from "node:child_process";
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
import { afterEach, beforeEach, describe, expect, it } from "vitest";

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
printf '%s\\n' invoked >> "$FIXTURE_DIRECTORY/fetches"
if [[ \${1:-} == --version ]]; then echo v3.77.1; exit 0; fi
printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/fetch-arguments"
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
if [[ \${FIXTURE_FETCH_FAILURE:-} == 1 ]]; then
  echo 'fixture-fetch-secret' >&2
  exit 19
fi
[[ \${FIXTURE_MISSING_KEY:-} != 1 ]] || exec "$@"
export "$secret=\${FIXTURE_PASSWORD:-fixture-$selected}"
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
if [[ \${FIXTURE_API_TARGET:-} != '' ]]; then
  target=$FIXTURE_API_TARGET
  host=postgres; [[ $target != test ]] || host=postgres_test
  [[ \${DB_TARGET:-} == "$target" && \${PGHOST:-} == "$host" && \${PGDATABASE:-} == "storage_minis_$target" ]] || exit 20
  [[ \${PGUSER:-} == postgres && \${PGPORT:-} == 5432 && \${PGPASSWORD:-} == "$FIXTURE_PASSWORD" ]] || exit 21
  [[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${DATABASE_URL:-} && -z \${PGOPTIONS:-} && -z \${PGSERVICE:-} && -z \${PGSSLMODE:-} ]] || exit 22
  [[ \${API_HOST_PORT:-} == "$FIXTURE_PORT" && \${LOG_LEVEL:-} == "$FIXTURE_LEVEL" ]] || exit 23
  printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/calls"
  echo 'safe API stdout diagnostic'
  echo 'safe API stderr diagnostic' >&2
  exit "\${FIXTURE_UP_STATUS:-0}"
fi
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
  for (const command of [
    "test:db",
    "test:integration",
    "test:api",
    "test:process",
  ]) {
    expect(() =>
      execFileSync(
        "/bin/bash",
        [join(root, "scripts/tooling.sh"), "run-db", "dev", "pnpm", command],
        {
          env: { ...environment, DOPPLER_CONFIG: "dev" },
          stdio: "pipe",
          timeout: 5_000,
        },
      ),
    ).toThrow("explicit test target");
  }
  expect(existsSync(join(directory, "fetches"))).toBe(false);
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

describe.each(["api-up", "api-dev"])("%s credential boundary", (operation) => {
  function apiUp(target = "test", extra: string[] = []) {
    return spawnSync(
      "/bin/bash",
      [join(root, "scripts/database.sh"), operation, target, ...extra],
      { env: environment, encoding: "utf8", timeout: 5_000 },
    );
  }

  it("rejects API arguments, target, port, level, token and config before fetching", () => {
    const original = { ...environment };
    for (const overrides of [
      { API_HOST_PORT: "" },
      { API_HOST_PORT: "0" },
      { API_HOST_PORT: "03000" },
      { API_HOST_PORT: "65536" },
      { API_HOST_PORT: "3000;sentinel" },
      { LOG_LEVEL: "" },
      { LOG_LEVEL: "invalid-secret-level" },
      { DOPPLER_TOKEN: "token-secret-sentinel" },
      { DOPPLER_CONFIG: "dev" },
      { DOPPLER_PROJECT: "other-project" },
    ]) {
      environment = { ...original, ...overrides };
      const result = apiUp();
      expect(result.status).not.toBe(0);
      expect(result.stdout + result.stderr).not.toMatch(/secret|sentinel/);
      expect(existsSync(join(directory, "fetches"))).toBe(false);
      expect(existsSync(join(directory, "calls"))).toBe(false);
    }
    environment = original;
    expect(apiUp("production").status).not.toBe(0);
    expect(apiUp("test", ["arbitrary-command"]).status).not.toBe(0);
    expect(existsSync(join(directory, "fetches"))).toBe(false);
  });

  it("uses saved settings and selected API credentials with native startup and visible safe diagnostics", () => {
    writeFileSync(
      join(root, ".env.compose"),
      "COMPOSE_PROJECT_NAME=saved-api-project\nPOSTGRES_PORT=6433\nPOSTGRES_TEST_PORT=6434\n",
    );
    delete environment.COMPOSE_PROJECT_NAME;
    environment.FIXTURE_PASSWORD = "selected p@ss'$\\;&=secret";
    environment.PGSERVICE = "ambient-service";
    environment.PGSSLMODE = "ambient-tls";
    environment.DB_TARGET = "ambient-target";
    for (const target of ["test", "dev"]) {
      environment.DOPPLER_CONFIG = target;
      environment.FIXTURE_API_TARGET = target;
      environment.FIXTURE_PORT = target === "test" ? "3000" : "65535";
      environment.FIXTURE_LEVEL = target === "test" ? "info" : "warn";
      if (target === "dev") {
        environment.API_HOST_PORT = "65535";
        environment.LOG_LEVEL = "warn";
      }
      const result = apiUp(target);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("safe API stdout diagnostic");
      expect(result.stdout).toContain("safe API stderr diagnostic");
      expect(result.stderr).toBe("");
      expect(result.stdout).not.toContain(environment.FIXTURE_PASSWORD);
    }
    const calls = readFileSync(join(directory, "calls"), "utf8");
    expect(calls).toContain("--project-name saved-api-project");
    expect(calls).toContain(`--env-file ${join(root, ".env.compose")}`);
    expect(calls).toContain(
      operation === "api-up"
        ? "up --detach --no-deps --no-build --pull never --wait --wait-timeout 30 api\n"
        : "up --no-deps --no-build --pull never api-dev\n",
    );
    expect(calls).not.toMatch(/secret|ambient|tooling|migrate/);
    const fetches = readFileSync(join(directory, "fetch-arguments"), "utf8");
    expect(fetches).toContain(
      "--no-fallback --forward-signals --no-liveness-ping --only-secrets POSTGRES_TEST_PASSWORD",
    );
    expect(fetches).toContain("--only-secrets POSTGRES_PASSWORD");
    expect(fetches).toContain("--timeout 10s --attempts 1");
  });

  it("refuses missing managed API keys and fetch failures despite ambient passwords, without Docker", () => {
    for (const failure of ["FIXTURE_MISSING_KEY", "FIXTURE_FETCH_FAILURE"]) {
      environment[failure] = "1";
      const result = apiUp();
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Database command failed");
      expect(result.stdout + result.stderr).not.toMatch(
        /fixture-fetch-secret|ambient-/,
      );
      expect(existsSync(join(directory, "calls"))).toBe(false);
      delete environment[failure];
    }
  });

  it("preserves native API failure and its diagnostics without printing credentials", () => {
    environment.FIXTURE_API_TARGET = "test";
    environment.FIXTURE_PASSWORD = "fixture-test";
    environment.FIXTURE_PORT = "3000";
    environment.FIXTURE_LEVEL = "info";
    environment.FIXTURE_UP_STATUS = "17";
    const result = apiUp();
    expect(result.status).toBe(17);
    expect(result.stdout).toContain("safe API stderr diagnostic");
    expect(result.stdout + result.stderr).not.toContain("fixture-test");
  });
});

// Smoke injects into its narrow verifier, never the tooling dispatcher.
describe("api-verify injection", () => {
  function verify(target = "test", extra: string[] = []) {
    return spawnSync(
      "/bin/bash",
      [join(root, "scripts/database.sh"), "api-verify", target, ...extra],
      {
        env: environment,
        encoding: "utf8",
        timeout: 5_000,
      },
    );
  }
  it("rejects non-test targets, invalid verifier ports, config/token/log values and callbacks before fetch", () => {
    for (const target of ["dev", "production", ""])
      expect(verify(target).status).not.toBe(0);
    expect(verify("test", ["callback"]).status).not.toBe(0);
    const original = { ...environment };
    for (const overrides of [
      { API_VERIFY_HOST_PORT: "" },
      { API_VERIFY_HOST_PORT: "0" },
      { API_VERIFY_HOST_PORT: "03000" },
      { API_VERIFY_HOST_PORT: "65536" },
      { API_VERIFY_HOST_PORT: "secret-sentinel" },
      { LOG_LEVEL: "secret-sentinel" },
      { DOPPLER_CONFIG: "dev" },
      { DOPPLER_TOKEN: "secret-sentinel" },
    ]) {
      environment = { ...original, ...overrides };
      const result = verify();
      expect(result.status).not.toBe(0);
      expect(result.stdout + result.stderr).not.toContain("secret-sentinel");
    }
    expect(existsSync(join(directory, "fetches"))).toBe(false);
  });
  it("injects only the selected special-character test password, ignoring ordinary API port and ambient PG inputs", () => {
    environment.FIXTURE_PASSWORD = "selected p@ss'$\\;&=secret";
    environment.API_HOST_PORT = "invalid-ignored";
    environment.PGSERVICE = "ambient-service";
    environment.PGSSLMODE = "ambient-tls";
    writeFileSync(
      join(root, "scripts/verify-api.sh"),
      `#!/bin/bash
set -eu
[[ $DB_TARGET == test && $PGHOST == postgres_test && $PGDATABASE == storage_minis_test && $PGPORT == 5432 && $PGUSER == postgres ]] || exit 21
[[ $PGPASSWORD == "$FIXTURE_PASSWORD" && -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${DATABASE_URL:-} && -z \${PGSERVICE:-} && -z \${PGSSLMODE:-} ]] || exit 22
printf '%s\\n' 'safe verifier payload'
`,
    );
    chmodSync(join(root, "scripts/verify-api.sh"), 0o700);
    const result = verify();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("safe verifier payload");
    expect(result.stdout + result.stderr).not.toContain(
      environment.FIXTURE_PASSWORD,
    );
    expect(readFileSync(join(directory, "fetch-arguments"), "utf8")).toContain(
      "--only-secrets POSTGRES_TEST_PASSWORD",
    );
    expect(existsSync(join(directory, "calls"))).toBe(false);
  });
  it("refuses missing keys/network despite ambient passwords without entering the verifier", () => {
    for (const failure of ["FIXTURE_MISSING_KEY", "FIXTURE_FETCH_FAILURE"]) {
      environment[failure] = "1";
      const result = verify();
      expect(result.status).not.toBe(0);
      expect(result.stdout + result.stderr).not.toMatch(
        /fixture-fetch-secret|ambient-/,
      );
      expect(existsSync(join(directory, "calls"))).toBe(false);
      delete environment[failure];
    }
  });
});
