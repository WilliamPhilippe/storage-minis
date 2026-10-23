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
apps/
  api/package.json     # @estoque164/api; future Fastify/tRPC server
packages/
  db/package.json      # @estoque164/db; future Drizzle connection/schema/migrations
```

Future dependencies are saved with exact versions, and installs enforce engine
compatibility. There are no application dependencies or build, dev, lint,
typecheck, test, or migration scripts yet. Turborepo, Docker Compose/PostgreSQL,
application scaffolding, and the React frontend belong to subsequent setup steps.
This workspace setup is partial progress toward [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26);
its remaining prerequisites and acceptance criteria still apply.

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
- [Technical direction review — documentation and backlog propagation](docs/technical-direction-review.md)

Keep this index linked only to the latest published version of each document. Versioned documents preserve change records and references to earlier versions. Read approved requirement update logs alongside published documents; explicit later decisions supersede conflicting wording.

The [2026-10-23 DBML review](docs/requirement-updates/2026-10-23-dbml-review.md) records later field/role/import decisions and confirmed follow-up answers. Apply it to covered topics while reviewing the draft, followed by the [index/candidate follow-up](docs/requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) and [partial-payment clarification](docs/requirement-updates/2026-10-23-partial-expense-payments.md).

The current entity map incorporates the owner-approved [2026-10-22 schema review](docs/requirement-updates/2026-10-22-schema-review.md). Its [change record](docs/entity-map-v0.8.md#16-v07--v08-comparison-and-publication-record) identifies the changed relationships and remaining work. The requirements specification, ownership index, DBML/design guide, and GitHub issue criteria still await reconciliation with those decisions.
