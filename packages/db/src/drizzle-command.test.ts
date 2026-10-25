import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { expect, it } from "vitest";

it("propagates native Kit generation errors even when Kit exits zero", async () => {
  const require = createRequire(import.meta.url);
  const execute = promisify(execFile);
  const fixture = await mkdtemp(join(tmpdir(), "storage-minis-generation-"));
  try {
    await mkdir(join(fixture, "node_modules"));
    await mkdir(join(fixture, "scripts"));
    await mkdir(join(fixture, "src"));
    // Reuse pinned installed packages; the fixture has no installation or DB.
    for (const name of ["drizzle-kit", "drizzle-orm"]) {
      await symlink(
        dirname(require.resolve(name)),
        join(fixture, "node_modules", name),
      );
    }
    for (const name of ["generate.ts", "drizzle-command.ts"]) {
      await copyFile(
        fileURLToPath(new URL(`../scripts/${name}`, import.meta.url)),
        join(fixture, "scripts", name),
      );
    }
    await copyFile(
      fileURLToPath(new URL("./migrations.ts", import.meta.url)),
      join(fixture, "src/migrations.ts"),
    );
    await writeFile(join(fixture, "package.json"), '{"type":"module"}');
    await writeFile(
      join(fixture, "drizzle.config.ts"),
      'export default { dialect: "postgresql", schema: "./invalid.ts", out: "./drizzle" };',
    );
    await writeFile(
      join(fixture, "invalid.ts"),
      'throw new Error("intentional generation failure");',
    );
    const options = {
      cwd: fixture,
      env: { PATH: process.env.PATH },
      timeout: 10_000,
    };
    const native = await execute(
      process.execPath,
      [
        join(dirname(require.resolve("drizzle-kit")), "bin.cjs"),
        "generate",
        "--config",
        "drizzle.config.ts",
      ],
      options,
    );
    expect(native.stdout + native.stderr).toContain(
      "intentional generation failure",
    );
    // Native execution above resolves with status zero despite that exception.
    const supervised = execute(
      process.execPath,
      [
        "--import",
        pathToFileURL(require.resolve("tsx")).href,
        "scripts/generate.ts",
      ],
      options,
    );
    await expect(supervised).rejects.toMatchObject({ code: 1 });
    await expect(supervised).rejects.toThrow("Migration generation failed");
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
