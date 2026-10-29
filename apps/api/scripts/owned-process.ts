import { spawn } from "node:child_process";
import type { SpawnOptions } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export interface ProcessResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  failure: string | undefined;
}

/** Test infrastructure only. Install ownership before the child can emit/exit. */
export function ownProcess(
  args: string[],
  options: Pick<SpawnOptions, "cwd" | "env"> & {
    deadlineMs: number;
    maxBytes?: number;
    group?: boolean;
    killAfterMs?: number;
  },
) {
  const child = spawn(process.execPath, args, {
    cwd: options.cwd,
    env: options.env,
    detached: options.group ?? false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const completion = Promise.withResolvers<ProcessResult>();
  let output = "";
  let bytes = 0;
  let failure: string | undefined;
  let settled = false;
  let termination: ReturnType<typeof setTimeout> | undefined;
  let fallback: ReturnType<typeof setTimeout> | undefined;
  const deadline = setTimeout(() => {
    failure ??= "process deadline";
    stop();
  }, options.deadlineMs);

  function send(signal: NodeJS.Signals) {
    if (!child.pid) return;
    try {
      if (options.group) process.kill(-child.pid, signal);
      else child.kill(signal);
    } catch {
      // The owned process/group may have exited between observation and signal.
    }
  }
  function groupExists() {
    if (!options.group || !child.pid) return false;
    try {
      process.kill(-child.pid, 0);
      return true;
    } catch {
      return false;
    }
  }
  function finish(code: number | null, signal: NodeJS.Signals | null) {
    if (settled) return;
    settled = true;
    clearTimeout(deadline);
    clearTimeout(termination);
    clearTimeout(fallback);
    if (groupExists()) {
      failure ??= "surviving process group";
      send("SIGKILL");
    }
    completion.resolve({ code, signal, failure });
  }
  function stop(signal: NodeJS.Signals = "SIGTERM") {
    if (settled || termination) return;
    send(signal);
    termination = setTimeout(() => {
      failure ??= "forced process cleanup";
      send("SIGKILL");
      // Even broken inherited pipes cannot keep the supervisor alive forever.
      fallback = setTimeout(() => {
        child.stdout.destroy();
        child.stderr.destroy();
        finish(child.exitCode, child.signalCode);
      }, 1_000);
    }, options.killAfterMs ?? 10_000);
  }
  function capture(chunk: Buffer) {
    const limit = options.maxBytes ?? 65_536;
    const remaining = Math.max(0, limit - bytes);
    output += chunk.subarray(0, remaining).toString("utf8");
    bytes += chunk.length;
    if (bytes > limit) {
      failure ??= "process output limit";
      stop();
    }
  }
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  child.once("error", () => {
    failure ??= "process spawn failed";
  });
  child.once("exit", () => {
    if (groupExists()) {
      failure ??= "surviving process group";
      stop();
    }
  });
  child.once("close", finish);

  return {
    child,
    result: completion.promise,
    get output() {
      return output;
    },
    get failure() {
      return failure;
    },
    get settled() {
      return settled;
    },
    stop,
    async waitForOutput(marker: string, timeoutMs = 10_000) {
      const end = performance.now() + timeoutMs;
      while (!output.includes(marker)) {
        if (settled || failure || performance.now() >= end)
          throw new Error(
            "Owned process did not reach the expected checkpoint.",
          );
        await delay(10);
      }
      if (failure || settled)
        throw new Error("Owned process failed before its checkpoint.");
    },
  };
}

export type OwnedProcess = ReturnType<typeof ownProcess>;
