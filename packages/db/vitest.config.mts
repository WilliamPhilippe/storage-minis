import { fileURLToPath } from "node:url";
import { configDefaults, defineProject } from "vitest/config";

export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "db-unit",
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "**/*.integration.test.ts"],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    isolate: true,
    retry: 0,
  },
});
