import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// typescript-eslint turns off `no-undef` for TypeScript, so these rules are the
// lint guard against Node code in browser files. The API's declarations still
// bring Node types into the web type check (`@types/pg` references `node`).
const nodeGlobals = [
  "process",
  "Buffer",
  "global",
  "__dirname",
  "__filename",
  "require",
  "module",
  "exports",
  "setImmediate",
  "clearImmediate",
];
const nodeMessage = "Browser code runs without Node.js globals and modules.";

export default defineConfig([
  globalIgnores([
    ".context/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/.vite/**",
    "**/.vitest/**",
    "**/routeTree.gen.ts",
    "**/.tanstack/**",
  ]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite({
        extraHOCs: ["createFileRoute", "createRootRouteWithContext"],
      }),
      pluginQuery.configs["flat/recommended"],
      pluginRouter.configs["flat/recommended"],
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-restricted-globals": [
        "error",
        ...nodeGlobals.map((name) => ({ name, message: nodeMessage })),
      ],
      "no-restricted-properties": [
        "error",
        ...["globalThis", "window", "self"].flatMap((object) =>
          nodeGlobals.map((property) => ({
            object,
            property,
            message: nodeMessage,
          })),
        ),
      ],
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["node:*"], message: nodeMessage }] },
      ],
      // TanStack Router's documented `throw redirect(...)` and
      // `throw notFound()` throw these router-core objects.
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/router-core",
              name: ["Redirect", "NotFoundError"],
            },
          ],
        },
      ],
    },
  },
  prettier,
]);
