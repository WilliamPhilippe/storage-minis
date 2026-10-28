import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";

const sourceRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
let root: string;
const project = "storage-minis-docker-fixture";
let directory: string;
let environment: NodeJS.ProcessEnv;

beforeEach(() => {
  directory = realpathSync(
    mkdtempSync(join(tmpdir(), "storage-minis-docker-")),
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
  writeFileSync(join(directory, "calls"), "");
  writeFileSync(
    docker,
    `#!/bin/bash
set -eu
[[ -z \${COMPOSE_FILE:-} && -z \${COMPOSE_ENV_FILES:-} && -z \${COMPOSE_PROFILES:-} ]] || exit 90
[[ \${COMPOSE_DISABLE_ENV_FILE:-} == 1 ]] || exit 91
[[ -z \${POSTGRES_PASSWORD:-} && -z \${POSTGRES_TEST_PASSWORD:-} && -z \${PGPASSWORD:-} && -z \${DATABASE_URL:-} ]] || exit 92
printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/calls"
if [[ $* == *"config --volumes" ]]; then
  [[ \${FIXTURE_FAILURE:-} != config ]] || exit 14
  printf '%s\\n' dependencies pgdata "\${FIXTURE_EXTRA_VOLUME:-}"
elif [[ $1 == volume && $2 == ls ]]; then
  [[ \${FIXTURE_FAILURE:-} != list ]] || exit 10
  printf '%s' "\${FIXTURE_VOLUMES:-}"
elif [[ $1 == volume && $2 == inspect ]]; then
  [[ \${FIXTURE_FAILURE:-} != inspect ]] || exit 11
  volume=\${!#}
  logical=\${volume#"\${COMPOSE_PROJECT_NAME}_"}
  if [[ \${FIXTURE_FAILURE:-} == ownership && $logical == pgdata ]]; then
    printf '%s\\n' 'another-project/pgdata'
  else
    printf '%s/%s\\n' "$COMPOSE_PROJECT_NAME" "$logical"
  fi
elif [[ \${FIXTURE_FAILURE:-} == compose ]]; then
  exit 12
fi
`,
  );
  chmodSync(docker, 0o700);
  environment = {
    PATH: process.env.PATH,
    COMPOSE_PROJECT_NAME: project,
    DOCKER_BIN: docker,
    FIXTURE_DIRECTORY: directory,
    COMPOSE_FILE: "untrusted.yaml",
    COMPOSE_ENV_FILES: "untrusted.env",
    COMPOSE_PROFILES: "untrusted",
    POSTGRES_PASSWORD: "ambient-dev",
    POSTGRES_TEST_PASSWORD: "ambient-test",
    PGPASSWORD: "ambient-password",
    DATABASE_URL: "ambient-url",
  };
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

function run(...args: string[]) {
  return spawnSync(
    "/bin/bash",
    [join(root, "scripts/reset-volumes.sh"), ...args],
    {
      env: environment,
      cwd: directory,
      encoding: "utf8",
      timeout: 5_000,
    },
  );
}

function calls() {
  return readFileSync(join(directory, "calls"), "utf8");
}

it("rejects missing/wrong confirmations and invalid project names before Docker", () => {
  for (const args of [
    [],
    ["unknown"],
    ["--confirm"],
    ["--confirm", "other"],
    ["--confirm", project, "extra"],
  ]) {
    expect(run(...args).status).not.toBe(0);
  }
  environment.COMPOSE_PROJECT_NAME = "";
  expect(run("--confirm", "").status).not.toBe(0);
  environment.COMPOSE_PROJECT_NAME = "Invalid/Project";
  expect(run("--confirm", "Invalid/Project").stderr).toContain(
    "Set COMPOSE_PROJECT_NAME",
  );
  expect(calls()).toBe("");
});

it("uses the canonical checkout model despite ambient overrides and another cwd", () => {
  expect(run("--confirm", project).status).toBe(0);
  expect(calls()).toContain(`--file ${join(root, "compose.yaml")}`);
  expect(calls()).toContain(`--project-directory ${root}`);
  expect(calls()).toContain(`--project-name ${project}`);
  expect(calls()).toContain("--env-file /dev/null");
  expect(calls()).toContain("--profile *");
  expect(calls()).not.toContain("untrusted");
});

it("validates every owned volume before teardown and deletes only exact candidates", () => {
  environment.FIXTURE_VOLUMES = [
    `${project}_dependencies`,
    `${project}_pgdata`,
    `${project}_pgdata-copy`,
    `${project}-other_pgdata`,
    "unrelated_pgdata",
  ].join("\n");
  expect(run("--confirm", project).status).toBe(0);
  const output = calls();
  expect(output.indexOf(`volume inspect`)).toBeLessThan(
    output.indexOf("down --volumes --remove-orphans"),
  );
  expect(output.lastIndexOf("volume inspect")).toBeLessThan(
    output.indexOf("down --volumes --remove-orphans"),
  );
  expect(output).toContain(`volume inspect --format`);
  expect(output).toContain(`${project}_dependencies\n`);
  expect(output).toContain(`${project}_pgdata\n`);
  expect(output).not.toContain("volume rm");
  expect(output).not.toContain("pgdata-copy");
  expect(output).not.toContain("unrelated_pgdata");
  expect(output).not.toContain("--force");
});

it("refuses ownership or inspection failures before any teardown", () => {
  environment.FIXTURE_VOLUMES = `${project}_dependencies\n${project}_pgdata`;
  for (const failure of ["config", "list", "inspect", "ownership"]) {
    environment.FIXTURE_FAILURE = failure;
    expect(run("--confirm", project).status).not.toBe(0);
    expect(calls()).not.toContain("down ");
    expect(calls()).not.toContain("volume rm");
  }
});

it("allows repeated cleanup with no volumes, including under host Bash 3.2", () => {
  expect(run("--confirm", project).status).toBe(0);
  expect(run("--confirm", project).status).toBe(0);
  expect(calls()).not.toContain("volume rm");
});

it("propagates native teardown failure without attempting separate volume removal", () => {
  environment.FIXTURE_FAILURE = "compose";
  expect(run("--confirm", project).status).toBe(12);
  expect(calls()).not.toContain("volume rm");
});

it("checks additional declared volumes without a second inventory in the helper", () => {
  environment.FIXTURE_EXTRA_VOLUME = "probe";
  environment.FIXTURE_VOLUMES = `${project}_probe`;
  expect(run("--confirm", project).status).toBe(0);
  expect(calls()).toContain(`${project}_probe\n`);
  expect(calls().lastIndexOf("volume inspect")).toBeLessThan(
    calls().indexOf("down --volumes"),
  );
});
