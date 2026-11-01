import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// A temporary browser-profile consumer of `@storage-minis/api/types` (Step 5
// plan P5-10). It reads the compiled declarations, so `//#test` depends on
// `@storage-minis/api#build`.
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const consumerPath = `${packageRoot}browser-consumer.ts`;
const consumerSource = `
import { TRPCClientError, createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@storage-minis/api/types";

const client = createTRPCClient<AppRouter>({
  links: [httpLink({ url: "/trpc" })],
});

export async function echo(message: string): Promise<string> {
  const result = await client.diagnostics.echo.query({ message });
  return result.message;
}

export function errorCode(error: unknown): string | undefined {
  if (!(error instanceof TRPCClientError)) return undefined;
  const typed = error as TRPCClientError<AppRouter>;
  const issues: { path: (string | number)[]; code: string }[] | undefined =
    typed.data?.issues;
  return issues === undefined ? typed.data?.code : issues[0]?.code;
}

// The contract is real types, not any: these must fail to type-check.
// @ts-expect-error message must be a string
void client.diagnostics.echo.query({ message: 1 });
// @ts-expect-error echo is a query, not a mutation
void client.diagnostics.echo.mutate({ message: "ok" });
`;

/** The repository's strict flags with a browser profile instead of Node. */
function browserOptions(): ts.CompilerOptions {
  const configPath = fileURLToPath(
    new URL("../../../tsconfig.base.json", import.meta.url),
  );
  const { config } = ts.readConfigFile(configPath, (path) =>
    ts.sys.readFile(path),
  ) as { config: unknown };
  const base = ts.parseJsonConfigFileContent(config, ts.sys, packageRoot);
  return {
    ...base.options,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2024,
    lib: ["lib.es2024.d.ts", "lib.dom.d.ts"],
    types: [],
    noEmit: false,
    declaration: false,
  };
}

describe("browser consumer of @storage-minis/api/types", () => {
  it("type-checks strictly and emits JavaScript that imports only @trpc/client", () => {
    const options = browserOptions();
    const host = ts.createCompilerHost(options);
    const emitted = new Map<string, string>();
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (fileName, languageVersion, ...rest) =>
      fileName === consumerPath
        ? ts.createSourceFile(fileName, consumerSource, languageVersion, true)
        : getSourceFile(fileName, languageVersion, ...rest);
    const fileExists = host.fileExists.bind(host);
    host.fileExists = (fileName) =>
      fileName === consumerPath || fileExists(fileName);
    host.writeFile = (fileName, text) => emitted.set(fileName, text);

    const program = ts.createProgram([consumerPath], options, host);
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    expect(diagnostics).toEqual([]);

    // The contract resolves to the compiled declaration, through exports.
    const files = program.getSourceFiles().map((file) => file.fileName);
    expect(files).toContain(`${packageRoot}dist/types.d.ts`);
    // Routers import no Fastify or plugin types, so the client loads neither.
    expect(files.filter((file) => /\/fastify\//.test(file))).toEqual([]);
    expect(files.filter((file) => /dist\/trpc\/plugin/.test(file))).toEqual([]);

    expect(program.emit().emitSkipped).toBe(false);
    const javascript = emitted.get(`${packageRoot}browser-consumer.js`);
    expect(javascript).toBeDefined();
    const imports = ts
      .preProcessFile(javascript ?? "", true, true)
      .importedFiles.map((file) => file.fileName);
    expect(imports).toEqual(["@trpc/client"]);
  });

  it("cannot be imported at runtime by Node's resolver", async () => {
    const run = promisify(execFile);
    const failure = await run(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        'await import("@storage-minis/api/types");',
      ],
      { cwd: packageRoot },
    ).then(
      () => undefined,
      (error: unknown) => error as { stderr?: string },
    );
    expect(failure?.stderr).toContain("ERR_PACKAGE_PATH_NOT_EXPORTED");
  });
});
