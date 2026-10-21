# AGENTS.md

## Project and repository state

Estoque164 manages inventory, purchases, sales, customer/supplier accounts, finances, a personal collection, and a public available-stock catalog for 1/64 miniature sellers and collectors. The model supports multiple Organizations, with one initial administrator.

This repository will contain the **full application**, including the backend/API and React frontend. It currently contains specifications and planning documents only. There is no application source, dependency manifest, database schema, test suite, CI workflow, or verified install/build/run command.

Use this file as a navigation and implementation guide. Detailed business rules and acceptance scenarios live in the versioned documents below. Update this guide when approved decisions or actual tooling change.

## Confirmed technical direction

The owner confirmed these choices on 2026-10-21. Read [Technical direction](docs/technical-direction.md) when scaffolding or changing API, frontend, authentication, persistence, or date handling; it records approval scope, examples, and remaining decisions.

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
| Tests | Vitest for unit/integration tests; real PostgreSQL for persistence invariants; Playwright for core browser workflows. |
| Money | BRL only; exact representation and rounding remain T03 work. |
| Dates | Store timestamp instants in UTC; UI displays them in the visitor's timezone. Financial reporting uses UTC for every viewer. |

Ant Design is the owner's preferred design system, pending final confirmation. Use pnpm when dependencies and scripts are introduced. Record supported versions and verified setup commands with the initial scaffold. Repository layout, migration workflow, and concrete transaction/concurrency implementation remain design choices under T06/T01; framework selection is not evidence that the foundation is implemented.

Hosting, deployment, backups, and operational targets remain T04 work. Database hosting remains separate from Firebase Authentication. T02 still owns bootstrap details, browser session persistence, activity detection, return-after-inactivity behavior, logout scope/revocation, and recovery behavior. Token expiry during active use does not require hourly sign-in. The application must enforce Membership and Organization authorization for business operations regardless of authentication provider.

## Read before making changes

| Source | Purpose |
| --- | --- |
| [README.md](README.md) | Entry point identifying the current and historical baselines. |
| [Requirements v0.7](docs/requirements-v0.7.md) | Current business requirements; Section 14 lists open decisions and Section 15 contains acceptance scenarios. |
| [Entity map v0.7](docs/entity-map-v0.7.md) | Conceptual relationships, invariants, and conditional design candidates. Entities do not automatically imply separate SQL tables. |
| [Accepted model decisions](docs/model-review.md) | User-confirmed structural decisions and their rationale; recommendations still awaiting approval are explicitly identified. |
| [Requirement ownership v0.7](docs/requirements-coverage-v0.7.md) | Maps every active requirement to its primary delivery issue and identifies decision/dependency boundaries. |
| [PurchaseExpense impact v0.7](docs/purchase-expense-impact-v0.7.md) | Shared expenses across Purchases, selected-unit allocation, affected workflows, and verification scope. |

The current baseline tracker is [#82](https://github.com/WilliamPhilippe/storage-minis-be/issues/82). The v0.5/v0.6 documents, their impact/publication records, and baseline issues #2/#78 are historical; some contain superseded credit and expense-ownership rules. Use them for history, not as current requirements, even if an older issue title still says “current.”

For a task, read its live issue, relevant requirement IDs, acceptance criteria, and dependencies. If the approved sources conflict or a needed business rule is unresolved, identify the exact conflict and ask the owner; do not silently pick a policy. Continue independent work that does not depend on that answer.

## Documentation and backlog workflow

- Preserve published historical baselines. When adopting a new baseline, publish new versioned files, state what they supersede, record changes, and update the current README/guide links.
- Preserve requirement and entity discussion IDs. Retire withdrawn IDs explicitly; never reuse them. The v0.7 baseline has 307 active requirements and nine retired requirements: SAL-029–035, PAY-031, and CUS-016.
- Keep requirement wording, accepted decisions, entity relationships, ownership mapping, and affected issue acceptance criteria consistent when changing agreed behavior. Every active requirement has one primary delivery owner.
- Follow the existing hierarchy: Epic → business workflow issue → optional implementation sub-issue. Extend the existing owner for changed requirements instead of creating duplicate delivery work.
- Respect the relevant prerequisites and unresolved-policy boundaries. D07 does not prevent approved Product registration/read/reuse or import inspection/preview; D08 does not prevent collection membership. Neither permits implementing its undecided behavior.
- Distinguish proposals, approved decisions, and implemented behavior. Decision outcomes need recorded owner approval, date, and examples. Delivery completion needs applicable acceptance evidence or an explicitly approved deferral; documentation alone is not implementation evidence.

## Business invariants to preserve

These are reminders of the current requirements, not a replacement for reading the affected sections.

### Identity, ownership, and privacy

- `Product` is a global model identity with no owning `organization_id`. Every Organization can find and reuse the same Product, even without owning units. Name, SKU, and brand are mandatory; SKU is **not unique** and is not an automatic import/deduplication key. Existing shared Product edits remain D07.
- `InventoryItem` identifies one physical unit, belongs to one Organization, and references one global Product. Assign its permanent Item ID at Purchase registration, including preorders; retain it through receipt, soft removal, Sale, Return, and resale. Transactions reach Product through InventoryItem; PurchaseItem groups units of the same Product.
- Operational/private records, costs, unit prices, notes, accounts, reports, and caches stay within their Organization. Customer funding also stays within the same Customer; supplier funding stays with the applicable Supplier. Shared Product access grants no access to another Organization's operations.
- Use `Membership` for User–Organization access. Store address fields on `Customer`. Each Organization has one implicit collection, with membership on InventoryItem and at most one current collection unit per Organization/Product, including under concurrent changes.
- Public visitors cannot write business records. Public availability comes only from the relevant Organization's physically present, approved, uncommitted Available units. The public field allowlist and catalog Organization context remain D04; shared internal Product access does not settle public visibility.

### Atomic operations and history

- Each business action applies all source, inventory, funding, financial, audit, and dependent changes as one all-or-nothing operation. Enforce concurrent item commitments, allocation limits, and collection uniqueness in persistence; an event row alone does not provide atomicity.
- Preserve dated source facts and one shared BusinessEvent/action/audit history with actor, business date, recorded timestamp, reason, source links, changed facts, and reversal provenance. Item timelines and financial views are derived. Neither event sourcing nor four separate history tables is mandated.
- Derive balances, quantities, costs, profit, and recovery from authoritative sources. Do not expose manually editable derived balances. Caches must reconcile with sources.
- Preserve original transaction dates and facts. Later edits, cancellations, Returns, Loss reversals, and corrections use their own event dates, without silently rewriting earlier reporting periods or duplicating economic effects.

### Purchases and costs

- Receipt requires the unit's full merchandise payment allocation and settlement of its applicable acquisition expenses. Receipt does not approve it for sale. First sale approval finalizes and locks that unit's acquisition cost, even while its Purchase is Open; never-approved collection-unit finalization remains D08.
- A PurchaseExpense belongs to one Organization and can link to several Purchases. Allocate its amount directly to selected InventoryItems in those Purchases and reconcile the source once. Value-proportional allocation is the default; equal-unit and manual methods are also supported. Purchase subtotals derive from unit allocations.
- Preserve shared expense sources, settlement, history, unaffected allocations, completed-Purchase locks, and approved/sold unit costs. Removing a linked unit/Purchase must not delete a shared expense or silently move its cost to other units. Exceptional disposition remains D06.
- Distinguish unknown expenses from confirmed zero. Complete a Purchase only after all remaining active units are received and its applicable expenses, including shared sources, are accounted for. Completed Purchases reject ordinary edits.
- Ordinary Open Purchase removal applies only to unreceived, wholly unpaid units; resolve any allocated payment first. Preserve removed IDs and create a new ID for a replacement. A Purchase cannot be canceled if any unit was ever received.

### Sales, funding, and reporting

- A Sale belongs to exactly one Customer and commits specific eligible Item IDs. One unit can have only one active Sale commitment, but may have multiple historical SaleItems after Return/resale. Current asking-price changes must not alter agreed historical prices.
- An active unshipped Sale with debt is Reserved; zero debt makes it In Garage automatically. Both states exclude its units from the catalog. Dispatch is explicit, at Sale level; tracking codes are optional and nonunique. Cancellation applies before dispatch; Return requires physical receipt of a shipped unit and a condition/availability decision.
- All operational money is BRL. New Payments must be fully allocated without exceeding source funds or outstanding obligations. Timestamp instants are stored in UTC and displayed in the visitor's timezone; financial reports use UTC. Exact monetary representation, cent-remainder rules, business-date representation, and period-filter semantics remain T03; do not infer them from the machine or visitor locale.
- No supplier credit or reusable customer wallet exists. Released customer funding must be refunded or reassigned to eligible existing Sales/SaleItems of the same Customer/Organization. A pending refund is a source-linked obligation, not cash already sent or future spending credit. Reassignment creates no new cash. Legitimate RetainedIncome is distinct, with reconciled model attribution.
- Book Sale profit at Sale creation, even while unpaid. Payment timing changes debt and cash, not booked profit or collection recovery. Refund settlement must not subtract a previously reversed profit twice.
- Customer-paid shipping is outside recorded Payments, Sale charges, income, and related cost lines. Business-paid selling expenses belong to the Sale and reduce Sale net profit once; do not spread them arbitrarily across models.
- Keep per-model gross-profit recovery separate from pooled whole-collection recovery. Both use the owning Organization's sources and a zero floor; pooled net cost need not equal the sum of per-model net costs. Historical designation, negative-profit treatment, and provisional collection costs remain D02/D03/D08.

### Scope boundaries

Do not add customer preorder sales, public reservations, automatic reservation expiry, a separate readiness-confirmation stage, FX conversion, insurance workflows, external sales-platform integrations, multiple stock locations, or package/carrier/partial-shipment management to the v1 baseline. “In Garage” is a status, not a location feature. General expense management, expense-payment batching, Product merge/archive/moderation, and conditional schema candidates are not approved features merely because they are discussed in the docs.

Excel migration must inspect the real source and preview invalid/ambiguous mappings before import. Do not fabricate historical Purchases, payments, or dates to fill missing data; establish reviewed opening-acquisition treatment under T05. Reconcile target-Organization units independently from global Product growth. Daily backups are required; retention and restore targets remain technical design work.

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

There are currently no install, dev, build, lint, typecheck, application-test, migration, or deployment commands to run. Do not invent commands or claim application tests passed. When tooling is introduced, replace this statement with verified commands, prerequisites, configuration, and relevant CI checks.

For future implementation, use the affected issue's acceptance criteria and requirements Section 15 to select tests. Include rollback on failure, real concurrent persistence operations, cross-Organization/Customer rejection, shared Product reuse without private-data leakage, exact allocation reconciliation, dated reversals, and catalog eligibility where relevant. Record evidence before claiming a workflow is delivered.

## Decisions still needed

Check the live issue before working on a dependent feature. These business policies were open when this guide was created:

| Decision | Unresolved policy |
| --- | --- |
| [D01 / #15](https://github.com/WilliamPhilippe/storage-minis-be/issues/15) | Payment-allocation reversal order for partial Returns funded by multiple Payments. |
| [D02 / #16](https://github.com/WilliamPhilippe/storage-minis-be/issues/16) | Historical collection-cost presentation after designation replacement/removal. |
| [D03 / #17](https://github.com/WilliamPhilippe/storage-minis-be/issues/17) | Negative-profit treatment in model and pooled recovery. |
| [D04 / #18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) | Public catalog Organization context, fields, images, search, and filters. |
| [D05 / #19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19) | Launch reports, filters, and average acquisition-price aggregation basis. |
| [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Exceptional correction authority and treatment, including shared-expense disposition. |
| [D07 / #79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79) | Existing shared Product edits, global audit provenance, private model notes, and historical labels. |
| [D08 / #80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80) | Cost finalization and provisional presentation for collection units never offered for sale. |

Technical choices also remain open; their issues define the required outputs:

- [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21): logical schema, state dimensions, and enforcement of the accepted conceptual invariants.
- [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22): finish persistence, activity detection, return-after-inactivity behavior, logout scope/revocation, recovery, administrator bootstrap, and authorization around Google-only Firebase sign-in, ID tokens, active-use refresh, and explicit logout. The owner has supplied the administrator email.
- [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24): exact BRL arithmetic, deterministic remainders, business-date representation, and period-filter semantics; UTC timestamp storage and reporting with visitor-local display are agreed.
- [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23): hosting, deployment, secrets/configuration, backup retention/restoration, supported devices, and performance/recovery targets.
- [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25): actual spreadsheet mapping and reviewed legacy acquisition treatment; no source spreadsheet is committed here.
- [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26): turn the selected frameworks into a runnable foundation, pin versions, choose layout/migration/API conventions, and demonstrate transaction/concurrency behavior; depends on T01/T02/T04. See the technical direction record for accepted choices and remaining outputs.

## Agreed conventions

The owner approved this baseline on 2026-10-21. Follow these conventions when implementing the application; tooling configuration and runnable commands are still pending the initial scaffold.

- Use English for code identifiers, comments, and project documentation. This does not choose the application's user-facing language or locale.
- Use TypeScript with strict checking for Node.js and React code, with ESLint and Prettier for linting and formatting.
- Use Vitest for unit/integration tests. Test database transactions, constraints, rollback, and concurrency against real PostgreSQL; mocks alone cannot demonstrate those invariants. Use Playwright for core administrator and public-catalog browser workflows.
- Use Conventional Commits. PRs should explain the resulting behavior, link the relevant issues/requirement IDs, and record validation results and remaining limitations.

Formatter settings, branch/review/merge policy, and concrete test/CI commands still need to be established with the implementation tooling.
