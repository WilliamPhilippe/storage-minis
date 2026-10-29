import { spawn, spawnSync } from "node:child_process";
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

const sourceRoot = fileURLToPath(new URL("../../..", import.meta.url));
let directory: string;
let environment: NodeJS.ProcessEnv;
function executable(name: string, content: string) {
  writeFileSync(join(directory, name), content);
  chmodSync(join(directory, name), 0o700);
}
beforeEach(() => {
  directory = realpathSync(mkdtempSync(join(tmpdir(), "api-verify-")));
  mkdirSync(join(directory, "scripts"));
  copyFileSync(
    join(sourceRoot, "scripts/local-config.sh"),
    join(directory, "scripts/local-config.sh"),
  );
  // Substitute only the fixed curl executable in the copied test subject.
  executable(
    "scripts/verify-api.sh",
    readFileSync(join(sourceRoot, "scripts/verify-api.sh"), "utf8").replaceAll(
      "/usr/bin/curl",
      join(directory, "curl"),
    ),
  );
  executable(
    "docker",
    `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/calls"
id=$(printf 'a%.0s' {1..64}); image=sha256:$(printf 'b%.0s' {1..64})
case "$1" in
  image) echo "$image" ;;
  container)
    [[ \${FIXTURE_MODE:-} != inventory ]] || exit 1
    [[ ! -e $FIXTURE_DIRECTORY/container ]] || echo "$id"
    exit 0 ;;
  compose)
    [[ $* == *'--no-deps --pull never'* && $* == *'--env NODE_ENV=test'* && $* != *'--service-ports'* ]] || exit 91
    [[ $DB_TARGET == test && $PGHOST == postgres_test && $PGPORT == 5432 && $PGDATABASE == storage_minis_test && $PGUSER == postgres && $PGPASSWORD == "$FIXTURE_PASSWORD" ]] || exit 92
    [[ -z \${PGSERVICE:-} && -z \${DATABASE_URL:-} && -z \${API_HOST_PORT:-} ]] || exit 93
    while [[ $# -gt 0 ]]; do
      if [[ $1 == --name ]]; then echo "$2" > "$FIXTURE_DIRECTORY/name"; fi
      shift
    done
    [[ \${FIXTURE_MODE:-} != collision ]] || { echo 'raw-secret-stdout'; echo 'raw-secret-stderr' >&2; exit 1; }
    touch "$FIXTURE_DIRECTORY/container"
    ;;
  inspect)
    [[ -e $FIXTURE_DIRECTORY/container ]] || exit 1
    case "$3" in
      *Config.Labels*api-verify*)
        if [[ \${FIXTURE_MODE:-} == foreign ]]; then echo other; else cat "$FIXTURE_DIRECTORY/name"; fi ;;
      *NetworkSettings*) echo '127.0.0.1 45678' ;;
      *State.ExitCode*) echo 'false 143 false' ;;
      *len*)
        mounts=0; [[ \${FIXTURE_MODE:-} != mounts ]] || mounts=1
        echo "$id $image true $mounts node api fixture" ;;
      *State.Running*) [[ \${FIXTURE_MODE:-} == exited ]] && echo false || echo true ;;
      *) echo "$id" ;;
    esac ;;
  stop) touch "$FIXTURE_DIRECTORY/stopped" ;;
  rm)
    if [[ \${FIXTURE_MODE:-} == force && $* != *--force* ]]; then exit 1; fi
    rm -f "$FIXTURE_DIRECTORY/container" ;;
  *) exit 94 ;;
esac
`,
  );
  executable(
    "curl",
    `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$FIXTURE_DIRECTORY/requests"
case "\${FIXTURE_MODE:-}" in
  response) printf 'raw-secret-stdout|200'; echo 'raw-secret-stderr' >&2; exit 0 ;;
  exited) exit 7 ;;
  hanging) echo $$ > "$FIXTURE_DIRECTORY/client"; exec /bin/sleep 90 ;;
esac
[[ $* == *'/health/ready' ]] && printf '{"status":"ready"}|200' || printf '{"status":"ok"}|200'
`,
  );
  environment = {
    PATH: process.env.PATH,
    FIXTURE_DIRECTORY: directory,
    DOCKER_BIN: join(directory, "docker"),
    COMPOSE_PROJECT_NAME: "fixture",
    DB_TARGET: "test",
    PGHOST: "postgres_test",
    PGPORT: "5432",
    PGDATABASE: "storage_minis_test",
    PGUSER: "postgres",
    PGPASSWORD: "selected p@ss'$\\;&=secret",
    FIXTURE_PASSWORD: "selected p@ss'$\\;&=secret",
    API_HOST_PORT: "invalid-ignored",
    PGSERVICE: "ambient-service",
    DATABASE_URL: "ambient-url",
  };
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));
function run(overrides: NodeJS.ProcessEnv = {}) {
  return spawnSync("/bin/bash", [join(directory, "scripts/verify-api.sh")], {
    env: { ...environment, ...overrides },
    encoding: "utf8",
    timeout: 5_000,
  });
}
function calls() {
  return readFileSync(join(directory, "calls"), "utf8");
}
function accelerateWatchdog() {
  // Exercise the real watchdog/cancellation path without a 45s unit test.
  executable(
    "sleep",
    `#!/bin/bash
if [[ $1 == 45 ]]; then exec /bin/sleep 0.5; fi
exec /bin/sleep "$@"
`,
  );
  environment.PATH = `${directory}:${process.env.PATH ?? ""}`;
}
it("asserts actual identity, zero mounts, exact health and TERM exit on each uncached invocation", () => {
  for (let repeat = 0; repeat < 2; repeat++) {
    const result = run();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("SIGTERM exit 143 passed");
    expect(result.stdout).toContain("Owned probe removed");
    expect(result.stdout + result.stderr).not.toContain(environment.PGPASSWORD);
    expect(existsSync(join(directory, "container"))).toBe(false);
  }
  expect(calls().match(/ run --detach/g)).toHaveLength(2);
  expect(calls()).toContain("--publish 127.0.0.1:0:3000");
  expect(calls()).not.toMatch(/--force|--build|secret/); // rm --volumes checked separately
  expect(readFileSync(join(directory, "requests"), "utf8")).toContain(
    "--max-time 8 --max-filesize 1024",
  );
});
it("rejects wrong tuples and invalid explicit ports before Docker", () => {
  for (const overrides of [
    { DB_TARGET: "dev" },
    { PGHOST: "postgres" },
    { PGPORT: "5433" },
    { PGDATABASE: "storage_minis_dev" },
    { PGUSER: "other" },
    { PGPASSWORD: "" },
    { API_VERIFY_HOST_PORT: "0" },
    { API_VERIFY_HOST_PORT: "65536" },
  ]) {
    expect(run(overrides).status).not.toBe(0);
    expect(existsSync(join(directory, "calls"))).toBe(false);
  }
});
it("fails collision before HTTP and suppresses both raw streams", () => {
  const result = run({
    FIXTURE_MODE: "collision",
    API_VERIFY_HOST_PORT: "45678",
  });
  expect(result.status).not.toBe(0);
  expect(result.stdout + result.stderr).not.toMatch(/raw-secret|selected/);
  expect(existsSync(join(directory, "requests"))).toBe(false);
  expect(calls()).not.toContain("rm ");
});
it("rejects mounts and foreign ownership before HTTP, removing only owned probes", () => {
  expect(run({ FIXTURE_MODE: "mounts" }).status).not.toBe(0);
  expect(existsSync(join(directory, "container"))).toBe(false);
  expect(existsSync(join(directory, "requests"))).toBe(false);
  writeFileSync(join(directory, "calls"), "");
  const foreign = run({ FIXTURE_MODE: "foreign" });
  expect(foreign.status).not.toBe(0);
  expect(foreign.stderr).toContain("no foreign removal");
  expect(calls()).not.toMatch(/stop |rm /);
});
it("cleans up a process that exits before readiness without leaking diagnostics", () => {
  const result = run({ FIXTURE_MODE: "exited" });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("exited before readiness");
  expect(existsSync(join(directory, "container"))).toBe(false);
});
it("rejects wrong HTTP bodies and enforces the overall watchdog with safe diagnostics", () => {
  accelerateWatchdog();
  const result = run({ FIXTURE_MODE: "response" });
  expect(result.status).not.toBe(0);
  expect(result.stdout + result.stderr).toContain("overall deadline");
  expect(result.stdout + result.stderr).not.toMatch(/raw-secret|selected/);
  expect(existsSync(join(directory, "container"))).toBe(false);
});
it("cancels hung HTTP clients at the request deadline and cleans up after the overall deadline", () => {
  accelerateWatchdog();
  // Make the request watchdog expire before the overall one.
  executable(
    "sleep",
    `#!/bin/bash
case "$1" in 45) exec /bin/sleep 0.8 ;; 8) exec /bin/sleep 0.2 ;; *) exec /bin/sleep "$@" ;; esac
`,
  );
  const result = run({ FIXTURE_MODE: "hanging" });
  expect(result.status).not.toBe(0);
  expect(result.stdout + result.stderr).toContain("overall deadline");
  const pid = Number(readFileSync(join(directory, "client"), "utf8"));
  expect(() => process.kill(pid, 0)).toThrow();
  expect(existsSync(join(directory, "container"))).toBe(false);
});
it.each(["SIGTERM", "SIGINT"] as const)(
  "cleans owned probe on %s and releases the HTTP client",
  async (signal) => {
    const child = spawn(
      "/bin/bash",
      [join(directory, "scripts/verify-api.sh")],
      {
        env: { ...environment, FIXTURE_MODE: "hanging" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const completion = new Promise<number | null>((resolve) =>
      child.on("exit", resolve),
    );
    try {
      const end = Date.now() + 2_000;
      while (!existsSync(join(directory, "client")) && Date.now() < end)
        await new Promise((resolve) => setTimeout(resolve, 10));
      expect(existsSync(join(directory, "client"))).toBe(true);
      child.kill(signal);
      // Bash defers the main trap while waiting for a bounded substitution.
      expect(await completion).toBe(signal === "SIGTERM" ? 143 : 130);
      expect(existsSync(join(directory, "container"))).toBe(false);
      const pid = Number(readFileSync(join(directory, "client"), "utf8"));
      expect(() => process.kill(pid, 0)).toThrow();
    } finally {
      child.kill("SIGKILL");
    }
  },
  12_000,
);

it("requires confirmed absence even after a successful removal", () => {
  const result = run({ FIXTURE_MODE: "inventory" });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("absence unverified");
  expect(existsSync(join(directory, "container"))).toBe(false);
});
it("defers force removal until the cleanup deadline when graceful removal fails", () => {
  const path = join(directory, "scripts/verify-api.sh");
  // Shorten only the cleanup wait in this isolated fixture, preserving its logic.
  writeFileSync(
    path,
    readFileSync(path, "utf8").replace(
      "cleanup_end=$((SECONDS + 15))",
      "cleanup_end=$((SECONDS + 5))",
    ),
  );
  const start = Date.now();
  const result = run({ FIXTURE_MODE: "force" });
  expect(result.status, result.stdout + result.stderr).toBe(0);
  expect(Date.now() - start).toBeGreaterThan(300);
  expect(calls().indexOf("rm --force --volumes")).toBeGreaterThan(
    calls().indexOf("rm --volumes"),
  );
  expect(existsSync(join(directory, "container"))).toBe(false);
});
it("honors an explicit free port and rejects a different actual port", () => {
  expect(run({ API_VERIFY_HOST_PORT: "45678" }).status).toBe(0);
  expect(calls()).toContain("--publish 127.0.0.1:45678:3000");
  const failure = run({ API_VERIFY_HOST_PORT: "45679" });
  expect(failure.status).not.toBe(0);
  expect(failure.stderr).toContain("explicit port assertion");
  expect(existsSync(join(directory, "container"))).toBe(false);
});

it("stops readiness polling at its real 30s deadline and removes the owned probe", () => {
  const start = Date.now();
  const result = spawnSync(
    "/bin/bash",
    [join(directory, "scripts/verify-api.sh")],
    {
      env: { ...environment, FIXTURE_MODE: "response" },
      encoding: "utf8",
      timeout: 35_000,
    },
  );
  expect(result.status).toBe(1);
  expect(result.stdout + result.stderr).toContain(
    "Readiness HTTP assertion/deadline failed",
  );
  expect(result.stdout + result.stderr).not.toMatch(/raw-secret|selected/);
  expect(Date.now() - start).toBeGreaterThan(28_000);
  expect(Date.now() - start).toBeLessThan(33_000);
  expect(existsSync(join(directory, "container"))).toBe(false);
}, 36_000);
