import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../..", import.meta.url));
let directory: string;
let environment: NodeJS.ProcessEnv;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "storage-minis-launcher-"));
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
[[ $selected == test && $secret == POSTGRES_TEST_PASSWORD ]] || exit 8
[[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${PGPASSWORD:-} ]] || exit 9
export POSTGRES_TEST_PASSWORD=fixture-test
exec "$@"
`,
  );
  writeFileSync(
    docker,
    `#!/bin/bash
set -eu
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

it("refuses migration commands and development integration tests before credentials", () => {
  for (const [target, command, message] of [
    ["test", "db:migrate", "Schema/migrations pending approval"],
    ["test", "db:generate", "Schema/migrations pending approval"],
    ["dev", "test:db", "explicit test target"],
  ]) {
    expect(() =>
      execFileSync(
        "/bin/bash",
        [
          join(root, "scripts/tooling.sh"),
          "run-db",
          target ?? "",
          "pnpm",
          command ?? "",
        ],
        {
          env: { COMPOSE_PROJECT_NAME: "storage-minis-fixture" },
          stdio: "pipe",
          timeout: 5_000,
        },
      ),
    ).toThrow(message);
  }
});
