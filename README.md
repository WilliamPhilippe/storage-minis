# storage-minis-be

## Local setup

The first bootstrap step establishes a private pnpm workspace. The exact Node.js
version is pinned in [.nvmrc](.nvmrc) and the Node.js/pnpm requirements in
[package.json](package.json). Use Node.js 24.22.1 LTS and pnpm 12.15.0.

Use a Node.js version manager that reads `.nvmrc`. Both
[fnm](https://github.com/Schniz/fnm) and [nvm](https://github.com/nvm-sh/nvm#nvmrc)
are compatible; the repository requires the pinned Node.js/pnpm versions rather
than a specific version manager. fnm was installed for the initial local setup
because Homebrew was already available. Existing nvm users can keep using nvm.

From the repository root, activate Node.js with your installed, initialized
version manager. For fnm:

```sh
fnm install
fnm use
```

For nvm:

```sh
nvm install
nvm use
```

Then install the pnpm tool and workspace dependencies:

```sh
npm install --global pnpm@12.15.0
pnpm install --frozen-lockfile
pnpm list --recursive --depth -1
```

fnm supports Homebrew installation with `brew install fnm` and automatic version
switching with `eval "$(fnm env --use-on-cd --shell zsh)"` in `~/.zshrc`. That
initialization is already configured on the initial development machine. Both
managers need shell initialization; a shell that has not loaded the manager may
report `node: command not found` even when Node.js is installed. The npm command
above installs the pnpm tool; use pnpm for all repository dependency changes.

The fnm, install, and workspace-list commands have been verified on macOS arm64;
the nvm alternative has not been executed on that machine. The workspace
currently contains three private packages:

```text
package.json           # Workspace root and toolchain pins
pnpm-workspace.yaml     # apps/* and packages/* membership and install settings
pnpm-lock.yaml         # Shared lockfile
tsconfig.base.json     # Shared strictness; no runtime globals
tsconfig.node.json     # Node ESM profile for tooling/API/DB
tsconfig.json          # Root tooling typecheck
eslint.config.mjs      # Shared lint rules
.prettierrc.json       # Shared formatting settings
vitest.config.mts      # Package test project discovery
turbo.json             # Cached checks and shared task inputs
apps/
  api/package.json     # @estoque164/api; future Fastify/tRPC server
  api/tsconfig.json
  api/vitest.config.mts
packages/
  db/package.json      # @estoque164/db; future Drizzle connection/schema/migrations
  db/tsconfig.json
  db/vitest.config.mts
```

Dependencies are saved with exact versions, and installs enforce engine
compatibility. Development tools are installed at the root for use from a full
workspace checkout. Turborepo 2.11.10 schedules and caches the existing checks.
Application dependencies, build/dev/migration commands, Docker Compose/PostgreSQL,
and the React frontend belong to subsequent setup steps.
This workspace setup is partial progress toward [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26);
its remaining prerequisites and acceptance criteria still apply.

## Development checks

Run these commands from the repository root with the pinned toolchain active:

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | Check root tooling and both packages concurrently through Turborepo |
| `pnpm check` | Run cached typechecks, lint, formatting check, and unit tests through Turborepo |
| `pnpm lint` | Check JavaScript/TypeScript with ESLint; warnings fail |
| `pnpm lint:fix` | Apply ESLint automatic fixes |
| `pnpm format:check` | Check formatting of supported source/configuration files |
| `pnpm format` | Rewrite those files with Prettier |
| `pnpm test` | Run the API and DB unit-test projects once |
| `pnpm test:watch` | Watch unit tests during development |

The [approved tooling decisions](docs/technical-direction.md#tooling-setup-decisions-2026-10-23)
and [Turborepo setup decisions](docs/technical-direction.md#turborepo-setup-decisions-2026-10-23)
record versions, settings, rationale, and scope. TypeScript's shared base carries
correctness checks; the Node profile adds Node globals and NodeNext resolution.
Use explicit type-only imports and `.js` extensions for relative imports in
application `.ts` files. The future React application will need a browser profile.

ESLint uses type information for TypeScript source, tests, and configuration.
An intentionally unused parameter may start with `_`; unused locals remain
errors. Prettier runs separately and checks root tooling plus supported files
under `apps` and `packages`. Existing specifications, DBML, the generated lockfile,
and workspace scratch files are outside the formatter command scope.

Unit tests belong alongside source as `src/**/*.test.ts`. Import `test`, `expect`,
and other APIs from `vitest`; test globals are disabled. The Node projects are
named `api-unit` and `db-unit`. For a focused run:

```sh
pnpm test --project api-unit
pnpm test --project db-unit
```

There are no application source files or permanent tests yet. Consequently,
`pnpm typecheck` currently checks tooling configuration, and `pnpm test` exits
with code 1 and "No test files found". The explicit bootstrap command
`pnpm test --passWithNoTests` verifies runner configuration loading only; it is
not application-test evidence. Keep the normal command strict when adding tests.

Files named `*.integration.test.ts` are excluded from these unit projects.
Real-PostgreSQL integration setup, isolation/reset mechanics, Playwright browser
workflows, coverage reporting/thresholds, and CI remain future work. PostgreSQL
tests must demonstrate rollback, constraints, and concurrent operations when the
persistence foundation is implemented. Vitest execution does not replace
`pnpm typecheck`.

### Turborepo checks and cache

Use the repository's pinned Turbo through pnpm. `pnpm typecheck` schedules the
two package typechecks and the real root `typecheck:root` script. `pnpm check`
adds the existing root lint, formatting check, and Vitest scripts. It currently
exits 1 because there are no test files; successful tooling checks do not make
the application suite complete.

The standalone lint, formatting, and test commands still run their tools directly.
`pnpm lint:fix`, `pnpm format`, and `pnpm test:watch` also run directly. To inspect
the six executable tasks without running them:

```sh
pnpm exec turbo --version
pnpm check --dry=json
```

To verify cache reuse for the five checks that can pass in the current checkout:

```sh
pnpm exec turbo run typecheck typecheck:root lint format:check --force --summarize
pnpm exec turbo run typecheck typecheck:root lint format:check --summarize
```

The first command executes every selected task and writes successful results.
The unchanged second run should report five cache hits. Summaries in
`.turbo/runs/` record task hashes, inputs, and cache status. Use `--force` on a
Turbo command when a fresh execution is needed.

The explicit `.turbo/cache` directory keeps the cache inside each worktree;
remote caching is disabled. All current tasks cache successful logs with no
declared file outputs. Default inputs cover each package's files and, for root
tasks, repository files including both workspaces. Shared tooling configuration
changes invalidate every task. Documentation edits can also invalidate root
checks because their inputs deliberately remain broad.

Turbo uses strict environment filtering. Unit-test cache hashes include
`NODE_ENV` and `TZ`; application environment variables and `.env` loading are not
configured. Review task inputs and environment declarations when introducing
code that depends on additional values or external state.

The Turbo bootstrap runner check is separate from the aggregate command:

```sh
pnpm exec turbo run test -- --passWithNoTests
```

This verifies runner loading only. A cached bootstrap run does not change the
normal empty-suite failure. See the [Turborepo decision record](docs/technical-direction.md#turborepo-setup-decisions-2026-10-23)
for dependency, persistent-task, and future database-task boundaries.

## Agent guidance

See [AGENTS.md](AGENTS.md) for repository context, current requirements, validation guidance, and decisions still needed before implementation.

Agents must recommend an option and obtain the owner's explicit approval before
making any new or changed technical or implementation decision. This includes
tools, packages, versions, CLIs, architecture, and local environment changes; the
[approval workflow](AGENTS.md#owner-approval-before-decisions) defines the process.

## Documentation

- [Requirements specification v0.7 — read with approved update logs](docs/requirements-v0.7.md)
- [Entity and relationship map v0.8 — current](docs/entity-map-v0.8.md)
- [Database schema — visual DBML draft 1](docs/database/schema.dbml)
- [Database design — entity mapping, proposals, and open decisions](docs/database/design.md)
- [Requirement update logs — approved decisions and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership and backlog v0.7](docs/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/purchase-expense-impact-v0.7.md)
- [Technical direction — accepted stack, authentication, and date choices](docs/technical-direction.md)
- [Technical foundation implementation guide — agent steps, planning and expected results](docs/technical-foundation-implementation-guide.md)
- [T06 foundation proposal — pending owner approval (2026-10-24)](docs/t06-foundation-proposal-2026-10-24.md)
- [Technical direction review — documentation and backlog propagation](docs/technical-direction-review.md)

Keep this index linked only to the latest published version of each document. Versioned documents preserve change records and references to earlier versions. Read approved requirement update logs alongside published documents; explicit later decisions supersede conflicting wording.

The [2026-10-23 DBML review](docs/requirement-updates/2026-10-23-dbml-review.md) records later field/role/import decisions and confirmed follow-up answers. Apply it to covered topics while reviewing the draft, followed by the [index/candidate follow-up](docs/requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) and [partial-payment clarification](docs/requirement-updates/2026-10-23-partial-expense-payments.md).

The current entity map incorporates the owner-approved [2026-10-22 schema review](docs/requirement-updates/2026-10-22-schema-review.md). Its [change record](docs/entity-map-v0.8.md#16-v07--v08-comparison-and-publication-record) identifies the changed relationships and remaining work. The [issue propagation record](docs/requirement-updates/2026-10-22-issue-propagation.md) maps the completed live requirements/acceptance-criteria updates. The requirements specification, ownership index, and DBML/design guide still await consolidation with those decisions.
