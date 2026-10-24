# AGENTS.md

## Project and repository state

StorageMinis manages inventory, purchases, sales, customer/supplier accounts, finances, a personal collection, and a public available-stock catalog for 1/64 miniature sellers and collectors. The model supports multiple Organizations, with one initial administrator.

This repository will contain the **full application**, including the backend/API and React frontend. It currently contains specifications, planning documents, a DBML draft, and a private pnpm workspace with `apps/api`, `packages/db`, a shared lockfile, strict TypeScript/ESLint/Prettier/Vitest configuration, and Turborepo checks with local caching. Docker tooling is implemented for existing workspace commands; see [Docker setup](README.md#docker-tooling) before running container checks or troubleshooting Doppler. There is no application source, implemented database schema, permanent test suite, or CI workflow. Application build/run commands remain pending.

Use this file as a navigation and implementation guide. Detailed business rules and acceptance scenarios live in the versioned documents below. Update this guide when approved decisions or actual tooling change.

## Owner approval before decisions

The owner requires prior approval for every new or changed technical or implementation decision, including tools, packages/dependencies and versions, CLIs, architecture, implementation approaches, configuration, infrastructure, and local developer-environment setup.

- Before selecting an option, present a concrete recommendation, explain why it fits, summarize relevant alternatives and tradeoffs, and ask the owner to approve it.
- Wait for explicit approval before installing, adopting, configuring, or implementing the proposed choice. This also applies to reversible changes and tools installed outside the repository, including shell-profile changes. A general request to start work does not approve unspecified choices.
- Research, inspect existing state, and prepare comparisons while awaiting approval; continue independent work covered by existing approval. Execute previously approved choices within their recorded scope, and ask again when a new or changed decision is needed.
- Record approved outcomes with their date and rationale in the relevant documentation. Keep proposals distinct from approved decisions and implemented behavior.

For Node.js version management, fnm and nvm are both compatible with the repository's `.nvmrc`; the repository requires the pinned Node.js/pnpm versions. fnm is the current local setup, not a mandatory project tool. Read [local setup](README.md#local-setup) before changing or troubleshooting the version manager, and obtain approval before replacing it or changing shell initialization.

## Confirmed technical direction

The owner confirmed the stack on 2026-10-21 and refined money, identity, and dates in the [2026-10-22 schema review](docs/requirement-updates/2026-10-22-schema-review.md). Read [Technical direction](docs/technical/technical-direction.md) when scaffolding or changing API, frontend, authentication, persistence, or date handling, applying the later log where wording conflicts.

| Area | Agreed choice |
| --- | --- |
| Application scope | Full application in one monorepo: backend/API and frontend, with independent deployments supported. |
| Application language | TypeScript with strict checking for backend and frontend code. |
| Backend | Node.js with Fastify and tRPC. |
| Frontend | React with Vite, TanStack Router, and TanStack Query. |
| Forms and validation | React Hook Form and Zod; runtime API validation with Zod. |
| Database and persistence | PostgreSQL with Drizzle ORM; Docker Compose for development PostgreSQL. Production hosting remains open. |
| Authentication | Firebase Authentication with Google sign-in only and Firebase ID tokens; refresh during active use, no refresh while inactive, and explicit logout. |
| Initial administrator | Owner's Google email is recorded in the technical direction document; setup/bootstrap mechanism remains pending. |
| Package manager | pnpm. |
| Build tasks | Turborepo. |
| Environment variables | Doppler, selected on 2026-10-24; Step 1 supplies host Compose verification for `storage-minis` / `dev`; application/test/production mapping remains later work. Read [environment configuration](docs/technical/technical-direction.md#environment-configuration--doppler-2026-10-24). |
| Tests | Vitest for unit/integration tests; real PostgreSQL for persistence invariants; Playwright for core browser workflows. |
| Money | BRL integer centavos; exact largest-remainder cost allocation with permanent Item ID tie-breaking. Numeric widths and detailed contracts remain T03 work. |
| Dates | Actual occurrence timestamps distinct from recording time, converted from input timezone to UTC; visitor-local display and UTC report periods. Original-period Sale/Loss results recalculate from current sources. |

Ant Design is the owner's preferred design system, pending final confirmation. Use pnpm for dependency changes. Toolchain pins live in `.nvmrc` and `package.json`; see [local setup](README.md#local-setup) for verified installation commands. The owner approved initial `apps/api` and `packages/db` workspace directories, the [tooling setup decisions](docs/technical/technical-direction.md#tooling-setup-decisions-2026-10-23), and the [Turborepo setup decisions](docs/technical/technical-direction.md#turborepo-setup-decisions-2026-10-23) on 2026-10-23. Read those records before changing shared configuration, module conventions, or task caching. The remaining layout, migration workflow, and concrete transaction/concurrency implementation remain design choices under T06/T01; workspace tooling is not evidence that the application foundation is implemented.

Hosting, deployment, backups, and operational targets remain T04 work. Database hosting remains separate from Firebase Authentication. T02 still owns bootstrap details, browser session persistence, activity detection, return-after-inactivity behavior, logout scope/revocation, and recovery behavior. Token expiry during active use does not require hourly sign-in. The application must enforce Membership and Organization authorization for business operations regardless of authentication provider.

## Read before making changes

| Source | Purpose |
| --- | --- |
| [README.md](README.md) | Entry point listing only the latest published version of each document. |
| [Technical foundation implementation guide](docs/technical/technical-foundation-implementation-guide.md) | For T06 planning or implementation, read the assigned agent step, research/plan instructions, completion criteria and handoff boundaries before proposing changes. |
| [Requirements v0.7](docs/requirements/requirements-v0.7.md) | Published requirements and acceptance scenarios; apply the later approved update log to conflicting wording. |
| [Entity map v0.8](docs/entities/entity-map-v0.8.md) | Current relationships, approved storage choices, invariants, and remaining boundaries; Section 16 compares v0.7. Entities do not automatically imply SQL tables. |
| [Approved update logs](docs/requirement-updates/README.md) | Read for schema/model or business-rule work. Apply dated decisions in order, including the 2026-10-23 DBML review; the index tracks propagation. |
| [Issue propagation record](docs/requirement-updates/2026-10-22-issue-propagation.md) | Read for backlog/acceptance work. Maps all 82 project issues, completed live updates, preserved ownership/dependencies, and remaining consolidation. |
| [Earlier model decisions](docs/entities/model-review.md) | Prior structural rationale, qualified by the later approved log and current entity map. |
| [Requirement ownership v0.7](docs/requirements/requirements-coverage-v0.7.md) | Maps every active requirement to its primary delivery issue and identifies decision/dependency boundaries. |
| [PurchaseExpense impact v0.7](docs/requirements/purchase-expense-impact-v0.7.md) | Shared expenses across Purchases, selected-unit allocation, affected workflows, and verification scope. |

The published requirements baseline tracker remains [#82](https://github.com/WilliamPhilippe/storage-minis-be/issues/82). Entity map v0.8 consolidates the approved schema review but does not publish a complete v0.8 requirements baseline. Live project issue requirements/criteria now apply the approved review; requirements/coverage and DBML/design-guide consolidation remain pending. The issue propagation record reports current status; older versioned publication records retain their original pending-state notes. Entity maps v0.5–v0.7 and baseline issues #2/#78 remain historical; use current requirements with the later approved log rather than superseded wording.

For a task, read its live issue, relevant requirement IDs, acceptance criteria, and dependencies. If the approved sources conflict or a needed business rule is unresolved, identify the exact conflict and ask the owner; do not silently pick a policy. Continue independent work that does not depend on that answer.

## Documentation and backlog workflow

- Preserve published historical baselines. When adopting a new baseline, publish new versioned files, state what they supersede, record changes, and update the current README/guide links.
- Preserve requirement and entity discussion IDs. Retire withdrawn IDs explicitly; never reuse them. The v0.7 baseline has 307 active requirements and nine retired requirements: SAL-029–035, PAY-031, and CUS-016.
- Keep requirement wording, accepted decisions, entity relationships, ownership mapping, and affected issue acceptance criteria consistent when changing agreed behavior. Every active requirement has one primary delivery owner.
- Follow the existing hierarchy: Epic → business workflow issue → optional implementation sub-issue. Extend the existing owner for changed requirements instead of creating duplicate delivery work.
- Respect prerequisites and the [remaining boundaries in entity map v0.8](docs/entities/entity-map-v0.8.md#15-approved-policies-and-remaining-design-boundaries). Distinguish decisions now approved by the log from remaining design work; preserve existing delivery ownership during propagation.
- Distinguish proposals, approved decisions, and implemented behavior. Decision outcomes need recorded owner approval, date, and examples. Delivery completion needs applicable acceptance evidence or an explicitly approved deferral; documentation alone is not implementation evidence.

## Business invariants to preserve

These are reminders of the current requirements, not a replacement for reading the affected sections.

### Identity, ownership, and privacy

- `Product` is global, with no owning `organization_id`; every Organization can find/reuse it. Name, SKU, and brand are mandatory; SKU is nonunique and not an automatic import key. Existing edits require global User `can_edit_products`, default false and granted to the initial administrator. Authorized Organization administrators can register new Products without it. Historical screens use current Product metadata, with global metadata audit and protected transaction facts.
- Database keys are integers. `InventoryItem` identifies one physical unit in one Organization referencing one global Product. Automatically assign its separate immutable readable identifier at Purchase registration, including preorders; it is unique within the Organization, never reused, and gaps are allowed. Retain it through receipt, soft removal, Sale, Return, and resale. Transactions reach Product through InventoryItem; PurchaseItem groups same-Product units.
- Operational/private records, costs, unit prices, notes, accounts, reports, and caches stay within their Organization. Customer funding also stays within the same Customer; supplier funding stays with the applicable Supplier. Shared Product access grants no access to another Organization's operations.
- Use `Membership` for User–Organization access. Store address fields on `Customer`. Each Organization has one implicit collection through InventoryItem `sale_status = collection`, with at most one current collection unit per Organization/Product, including under concurrent changes. The 2026-10-23 review selects mutually exclusive `unapproved`, `available`, `held`, `collection` statuses.
- Public visitors cannot write business records. Each catalog URL identifies one Organization; availability uses its physically present, approved, uncommitted Available units. Apply the approved allowlist/grouping rules in the current map, optional asking prices, and hidden stock quantities. Unit public descriptions/photos are separate from private notes; unit photo management needs no global Product-edit permission. Detailed filters and unknown-condition presentation remain D04.

### Atomic operations and history

- Each business action applies all source, inventory, funding, financial, audit, and dependent changes as one all-or-nothing operation. Enforce concurrent item commitments, allocation limits, and collection uniqueness in persistence; an event row alone does not provide atomicity.
- Preserve typed source/change facts and one shared BusinessEvent/action/audit history with actor, occurrence/recording timestamps, reason, source links, before/after facts, and correction provenance. Audit survives permitted SaleItem deletion. Item timelines and financial views are derived; generic independent signed-adjustment transactions are not selected.
- Derive balances, quantities, costs, profit, and recovery from authoritative sources. Do not expose manually editable derived balances. Caches must reconcile with sources.
- Preserve original and changed facts with each action's actual time. Reports query current corrected sources: corrections, Returns, retained income, and SaleExpenses recompute the original Sale period; Loss removal/linked SupplierRefunds recompute the original Loss period. Cash keeps its actual occurrence date. Reports/exports are query results, not monthly entities.

### Purchases and costs

- Receipt requires full merchandise funding and settled applicable acquisition expenses; it does not approve sale. First sale approval finalizes ordinary units; a never-for-sale collection unit can explicitly finalize complete/settled costs. Finalized merchandise costs and acquisition allocations lock permanently, including after approval or collection membership removal.
- A PurchaseExpense belongs to one Organization and links to Purchases exclusively through selected InventoryItem allocations; omit an independent `purchase_expense_purchases` association. Reconcile the source once and derive Purchase subtotals. Value-proportional is default, with equal-unit/manual alternatives; all-zero proportional weights require explicit method selection.
- Preserve shared expense sources, settlement, history, unaffected allocations, completed-Purchase locks, and approved/sold unit costs. Removing a linked unit/Purchase must not delete a shared expense or silently move its cost to other units. Exceptional disposition remains D06.
- Distinguish unknown expenses from confirmed zero. Complete only after all remaining active units are received and applicable expenses, including shared sources, are accounted for. Completed Purchases are firmly locked against corrections.
- Ordinary Open Purchase removal applies only to unreceived, wholly unpaid units; resolve both payment and acquisition-expense allocations first. Expense allocation blocks removal even without merchandise funding. Preserve removed IDs and create a new ID for a replacement. A Purchase cannot be canceled if any unit was ever received.

### Sales, funding, and reporting

- A Sale belongs to exactly one Customer and commits specific eligible Item IDs. One unit can have only one active Sale commitment, but may have multiple historical SaleItems after Return/resale. Current asking-price changes must not alter agreed historical prices.
- Delete SaleItems only before dispatch and only if never funded; any past positive funding permanently blocks deletion, even after refund/reassignment. Delete generated dependent Sale records with surviving audit; reintroduction makes a new SaleItem for the same InventoryItem. Dispatch permanently locks agreement corrections, while actual later SaleExpense recording/settlement remains allowed.
- An active unshipped Sale with debt is Reserved; zero debt makes it In Garage automatically. Both states exclude its units from the catalog. Dispatch is explicit, at Sale level; tracking codes are optional and nonunique. Cancellation applies before dispatch; Return requires physical receipt of a shipped unit and a condition/availability decision.
- All money uses integer BRL centavos; zero merchandise/Sale prices are allowed, cash/expense sources are positive. New Payments are fully allocated within source/obligation limits; every customer allocation targets exactly one SaleItem. A Payment may span multiple Sales of the same Customer/Organization. UTC occurrence/reporting and largest-remainder cost allocation are selected; widths, detailed period contracts, and enforcement remain design work.
- No supplier credit or reusable customer wallet exists. Released customer funding must be refunded or reassigned to eligible existing Sales/SaleItems of the same Customer/Organization. A pending refund is a source-linked obligation, not cash already sent or future spending credit. Reassignment creates no new cash. Legitimate RetainedIncome is distinct, with reconciled model attribution.
- Use separate customer/supplier settlement headers and source allocations. Refund funding is consumed oldest Payment first; one chosen refund amount may be smaller than the original Payment but must be paid once without installments. Equal-time tie-breaking and non-refund source ordering remain unspecified.
- Book Sale profit at its original business occurrence, even while unpaid. Payment timing changes debt and cash, not booked profit or collection recovery. Refund settlement must not subtract a previously reversed profit twice.
- Customer-paid shipping stays outside recorded Payments, Sale charges, income, and cost lines. Business-paid selling expenses belong to the Sale and reduce its original-period net result once, including after cancellation/Return; preserve actual expense/cash times and do not spread them across models.
- Keep per-model gross-profit recovery separate from pooled recovery using the owning Organization's current collection membership, signed eligible profit, zero floors, and separate excess profit. Negative profit may increase net collection cost above acquisition cost. Show known incomplete costs/recovery as provisional. Average acquisition cost uses full costs of currently on-hand units; no past-date collection-designation report is required.

### Scope boundaries

Do not add customer preorder sales, public reservations, automatic reservation expiry, a separate readiness-confirmation stage, FX conversion, insurance workflows, external sales-platform integrations, multiple stock locations, or package/carrier/partial-shipment management to the v1 baseline. “In Garage” is a status, not a location feature. General expense management, expense-payment batching, Product merge/archive/moderation, and conditional schema candidates are not approved features merely because they are discussed in the docs.

Excel migration must inspect the real source and preview invalid/ambiguous mappings before import. Apply the approved Supplier/year-month grouped opening Purchases and second-day date convention from the 2026-10-23 review, retaining source precision/provenance. Do not fabricate historical payments or receipt facts; finish actual source mapping under T05. Reconcile target-Organization units independently from global Product growth. Daily backups are required; retention and restore targets remain technical design work.

## Validation and commands

Run commands from the repository root. Git and authenticated GitHub CLI access are useful for documentation/backlog work:

```sh
git status --short
git diff --check
git diff --stat
gh issue view 82 --repo WilliamPhilippe/storage-minis-be
```

Use `gh issue view <number> --repo WilliamPhilippe/storage-minis-be --comments` for the relevant task and decision discussions. Read-only issue inspection does not require changing the backlog.

For documentation changes, check changed relative links, Markdown fences/tables, referenced IDs, and consistency with the current baseline and affected issues. For baseline changes, verify active/retired IDs and unique primary ownership. Report what was checked and any unresolved gaps.

Use `./scripts/tooling.sh run <command>` with the explicit checkout project and initialized volumes from [Docker setup](README.md#docker-tooling). The owner installed Doppler 3.77.1 through Homebrew; its explicit launcher override and dedicated browser login are documented there.

With the pinned toolchain active, `pnpm install --frozen-lockfile` verifies installation and `pnpm list --recursive --depth -1` lists the root, API, and database workspace packages. Use [development checks](README.md#development-checks) for typecheck, lint, format, and Vitest commands, and [Turborepo checks](README.md#turborepo-checks-and-cache) for dry runs, cache reuse, and forced execution. Typecheck currently covers tooling configuration; normal `pnpm test` and aggregate `pnpm check` fail with no test files until meaningful tests exist. An explicit test-only `--passWithNoTests` verifies runner loading only. There are no dev, build, migration, deployment, or CI checks. Report tooling validation separately from application acceptance evidence.

For future implementation, use the affected issue's acceptance criteria and requirements Section 15 to select tests. Include rollback on failure, real concurrent persistence operations, cross-Organization/Customer rejection, shared Product reuse without private-data leakage, exact allocation reconciliation, dated reversals, and catalog eligibility where relevant. Record evidence before claiming a workflow is delivered.

## Decisions still needed

Read the live issue together with the approved log before dependent work. The review resolved or narrowed these topics; the current entity map records details and remaining boundaries. Issue closure and specification/backlog propagation remain separate work.

| Decision | Approved scope and remaining work |
| --- | --- |
| [D01 / #15](https://github.com/WilliamPhilippe/storage-minis-be/issues/15) | Refund FIFO selected; equal-time tie-breaking and non-refund source attribution remain. |
| [D02 / #16](https://github.com/WilliamPhilippe/storage-minis-be/issues/16) | Current membership only; past-date report excluded. Propagate the approved outcome. |
| [D03 / #17](https://github.com/WilliamPhilippe/storage-minis-be/issues/17) | Signed negative profit selected for model/pool recovery. Propagate and verify formulas. |
| [D04 / #18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) | Context/allowlist/grouping/prices/photos/privacy selected; detailed filters and unknown-condition presentation remain. |
| [D05 / #19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19) | Original-period reporting and on-hand average-cost basis selected; full launch report/widget set and filter contracts remain. |
| [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Sale deletion/dispatch and permanent cost/Purchase locks selected; exceptional correction authority/shared-expense disposition remain. |
| [D07 / #79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79) | Global edit permission, current metadata, unit-only private notes, and global audit selected; typed audit/enforcement/bootstrap remain. |
| [D08 / #80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80) | Explicit complete/settled collection finalization and provisional metrics selected; concrete workflow/enforcement remain. |

Technical choices also remain open; their issues define the required outputs:

- [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21): logical schema, state dimensions, and enforcement of the accepted conceptual invariants.
- [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22): finish persistence, activity detection, return-after-inactivity behavior, logout scope/revocation, recovery, administrator bootstrap, and authorization around Google-only Firebase sign-in, ID tokens, active-use refresh, and explicit logout. The owner has supplied the administrator email.
- [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24): finalize numeric widths, intermediate precision/overflow, and input/period-filter contracts around agreed integer centavos, exact largest-remainder cost allocation, UTC occurrence timestamps/reporting, visitor-local display, and original-period recalculation.
- [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23): hosting, deployment, secrets/configuration, backup retention/restoration, supported devices, and performance/recovery targets.
- [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25): actual spreadsheet mapping and reviewed legacy acquisition treatment; no source spreadsheet is committed here.
- [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26): turn the selected frameworks into a runnable foundation, pin versions, choose layout/migration/API conventions, and demonstrate transaction/concurrency behavior; depends on T01/T02/T04. See the technical direction record for accepted choices and remaining outputs.

## Agreed conventions

The owner approved this baseline on 2026-10-21 and the concrete tooling setup on 2026-10-23. Follow these conventions when implementing the application.

- Use English for code identifiers, comments, and project documentation. This does not choose the application's user-facing language or locale.
- Use TypeScript with strict checking for Node.js and React code, with ESLint and Prettier for linting and formatting.
- Use Vitest for unit/integration tests. Test database transactions, constraints, rollback, and concurrency against real PostgreSQL; mocks alone cannot demonstrate those invariants. Use Playwright for core administrator and public-catalog browser workflows.
- Use Conventional Commits. PRs should explain the resulting behavior, link the relevant issues/requirement IDs, and record validation results and remaining limitations.

Formatter settings and unit-runner commands are recorded in the tooling setup. Branch/review/merge policy, integration/browser test setup, and CI remain open.

## Agent skills

### Issue tracker

Use GitHub Issues for this repository; read [issue-tracker conventions](docs/agents/issue-tracker.md) before fetching or publishing tickets through an engineering skill.

### Triage labels

Use the five default triage roles; read the [label mapping](docs/agents/triage-labels.md) before triaging or changing triage labels.

### Domain docs

Use a single-context layout: root `GLOSSARY.md` and `docs/adr/`. Read the [domain documentation rules](docs/agents/domain.md) before exploring domain concepts or decisions.
