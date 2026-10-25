import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
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

const root = fileURLToPath(new URL("../../..", import.meta.url));
let checkout: string;
let environment: NodeJS.ProcessEnv;

beforeEach(() => {
  checkout = realpathSync(mkdtempSync(join(tmpdir(), "storage-minis-setup-")));
  mkdirSync(join(checkout, "scripts"));
  for (const script of [
    "configure-local.sh",
    "local-config.sh",
    "database.sh",
    "tooling.sh",
    "reset-volumes.sh",
  ]) {
    copyFileSync(
      join(root, "scripts", script),
      join(checkout, "scripts", script),
    );
    chmodSync(join(checkout, "scripts", script), 0o700);
  }
  environment = { PATH: `${checkout}:${process.env.PATH ?? ""}` };
});

afterEach(() => {
  rmSync(checkout, { recursive: true, force: true });
});

function run(script: string, ...args: string[]) {
  return spawnSync("/bin/bash", [join(checkout, "scripts", script), ...args], {
    env: environment,
    cwd: tmpdir(),
    encoding: "utf8",
    timeout: 5_000,
  });
}

function configure() {
  return run(
    "configure-local.sh",
    "--project",
    "saved-project",
    "--port",
    "6433",
    "--test-port",
    "6434",
  );
}

it("saves only nonsecret settings and preserves them on repeated setup from a fresh shell", () => {
  expect(configure().status).toBe(0);
  const saved = readFileSync(join(checkout, ".env.compose"), "utf8");
  expect(saved).toBe(
    "COMPOSE_PROJECT_NAME=saved-project\nPOSTGRES_PORT=6433\nPOSTGRES_TEST_PORT=6434\n",
  );
  expect(run("configure-local.sh").stdout).toContain("Reusing saved");
  expect(run("configure-local.sh", "--project", "different").status).not.toBe(
    0,
  );
  expect(readFileSync(join(checkout, ".env.compose"), "utf8")).toBe(saved);
});

it("rejects invalid or missing project/port selections before writing configuration", () => {
  for (const args of [
    [],
    ["--project", "Invalid/Project"],
    ["--project", "valid", "--port", "05433"],
    ["--project", "valid", "--port", "65536"],
    ["--project", "valid", "--port", "5434"],
  ]) {
    expect(run("configure-local.sh", ...args).status).not.toBe(0);
    expect(existsSync(join(checkout, ".env.compose"))).toBe(false);
  }
});

it("rejects unknown keys, duplicate keys and shell expressions without executing the file", () => {
  expect(configure().status).toBe(0);
  const config = join(checkout, ".env.compose");
  const saved = readFileSync(config, "utf8");
  for (const invalid of [
    `${saved}POSTGRES_PASSWORD=forbidden\n`,
    `${saved}COMPOSE_PROJECT_NAME=duplicate\n`,
    saved.replace("saved-project", `$(touch ${join(checkout, "executed")})`),
    saved.replace("6434", "6433"),
  ]) {
    writeFileSync(config, invalid);
    expect(run("configure-local.sh").status).not.toBe(0);
    expect(readFileSync(config, "utf8")).toBe(invalid);
    expect(existsSync(join(checkout, "executed"))).toBe(false);
  }
});

it("loads saved settings and discovers Doppler for dev/test startup without manual exports", () => {
  expect(configure().status).toBe(0);
  writeFileSync(
    join(checkout, "doppler"),
    `#!/bin/bash
set -eu
if [[ $1 == --version ]]; then echo v3.77.1; exit 0; fi
target=''; key=''
while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) target=$2; shift 2 ;;
    --only-secrets) key=$2; shift 2 ;;
    --) shift; break ;;
    *) shift ;;
  esac
done
[[ ($target == dev && $key == POSTGRES_PASSWORD) || ($target == test && $key == POSTGRES_TEST_PASSWORD) ]] || exit 8
[[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${PGPASSWORD:-} ]] || exit 9
export "$key=fixture-secret"
exec "$@"
`,
  );
  writeFileSync(
    join(checkout, "docker"),
    `#!/bin/bash
set -eu
[[ \${COMPOSE_PROJECT_NAME:-} == saved-project && \${POSTGRES_PORT:-} == 6433 && \${POSTGRES_TEST_PORT:-} == 6434 ]] || exit 10
printf '%s\\n' "$*" >> "$FIXTURE_CALLS"
if [[ $* == *" run "* ]]; then echo 1; fi
`,
  );
  chmodSync(join(checkout, "doppler"), 0o700);
  chmodSync(join(checkout, "docker"), 0o700);
  environment.TOOLING_DOPPLER_CONFIG_DIR = checkout;
  environment.FIXTURE_CALLS = join(checkout, "calls");
  environment.POSTGRES_PASSWORD = "ambient-dev";
  environment.POSTGRES_TEST_PASSWORD = "ambient-test";
  environment.PGPASSWORD = "ambient-password";
  for (const target of ["dev", "test"]) {
    const result = run("database.sh", "up", target);
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      `${target} database authentication and identity passed`,
    );
    expect(result.stdout).not.toContain("fixture-secret");
  }
  expect(run("tooling.sh", "run", "node", "--version").status).toBe(0);
  expect(
    run("reset-volumes.sh", "--confirm", "different-project").status,
  ).not.toBe(0);
  const calls = readFileSync(join(checkout, "calls"), "utf8");
  expect(calls).toContain(`--env-file ${join(checkout, ".env.compose")}`);
  expect(calls).toContain("--project-name saved-project");
  expect(calls).toContain(
    "up --detach --no-deps --pull never --wait --wait-timeout 60 postgres_test",
  );
  expect(calls).not.toContain(" down ");
});
