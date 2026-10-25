# Step 3B — approved structural schema

**Owner:** WilliamPhilippe. **Approval date:** 2026-10-25. **Source:** the owner
reviewed the [schema packet](step-3b-schema-review-2026-10-25.md) and stated,
“Schema is approved. Implement it.” This approves S01–S10, including the bounded
structural delivery and its workflow deferrals. It supersedes the Step 3A
approval gate for schema generation. Existing issue ownership remains unchanged.

## Implemented representation

[Drizzle source](../../packages/db/src/schema/index.ts) is grouped by the seven
DBML domain families, with explicit TypeScript-to-SQL column mappings and shared
enums. The compiled package exports `schema`; `createDatabase` supplies its typed
Drizzle handle. Importing the package opens no connection.

The migration chain is [0000_base.sql](../../packages/db/drizzle/0000_base.sql)
and [0001_customer_name_whitespace.sql](../../packages/db/drizzle/0001_customer_name_whitespace.sql),
with the native Drizzle snapshots and journal committed together. The second
migration extends the Customer name check to tabs/newlines as well as spaces;
the already-tested base artifact is preserved. History is stored in
`drizzle.__drizzle_migrations`. No development application, seed, administrator
bootstrap, import, API or production migration was performed in this delivery.

| Reviewed inventory | Implemented disposition |
| --- | --- |
| 33 tables / 11 enums | All retained, with the same SQL names and enum values. No rejected candidates. |
| 310 original columns | Retained, with S02–S07 overrides below; 316 columns total. |
| S02 keys / money | Positive int32 `GENERATED ALWAYS AS IDENTITY` keys. Nonnegative merchandise/cost/asking/agreed amounts; positive cash, refund, expense, funding and retention amounts. Acquisition cost shares and Loss amounts may be zero. PostgreSQL rejects int32 overflow. Future allocation arithmetic uses exact bigint intermediates and rejects persisted overflow. |
| S03 instants | `timestamptz(3)`, Drizzle Date mode. Defaults only on Organization/User creation and event recording times; business occurrence inputs remain required. |
| S04 readable identity | Stored generated `inventoryId`, using the immutable, strict, parallel-safe `public.inventory_id_base36(integer)` function installed before its table. `1 / 35 / 36 / 2147483647` map to `1 / Z / 10 / ZIK0ZJ`. Zero/negative function inputs fail. |
| S05 scope | Retain composite Organization/Customer/Supplier acquisition/funding paths and add their 48 required unique target/invariant keys. Preserve 28 ordinary Organization lookup indexes and add four partial unique indexes. |
| S05 NULL-sensitive audit | Add generated `scope_organization_id = coalesce(organization_id, 0)` on event/change tables. Positive Organization IDs reserve zero for global scope. Composite event/reversal references now use this nonnullable discriminator. |
| S05 Product provenance | Add generated constant `products.registration_scope = 0` and a composite registration-event/scope FK. A global Product can record Organization context through its global event, without acquiring ownership. |
| S06 fields | Add `users.can_edit_products NOT NULL DEFAULT false`, optional unit `public_description` / `public_images`, and require a nonblank Customer name. No administrator is seeded. |
| S07 deletion | Retain typed `sale_id` / `sale_item_id` audit subjects and JSON snapshots without their two live-subject FKs. All other subject FKs remain restrictive. |
| S08 expenses / settlements | Retain installment rows, reconciled header cache/completion checks, dedicated four-table settlement families and allocation-derived PurchaseExpense links. |

All 158 draft reference declarations are accounted for: 153 are retained
unchanged, three (`event_reversal_owner`, `change_event_owner`,
`change_reversal_owner`) use generated nonnullable scope, and two (`change_sale`,
`change_sale_item`) become deletion-safe historical subjects under S07. One
additional FK enforces global Product registration scope: **157 executable FKs**.
The final schema has **76 CHECK constraints, 48 unique constraints and 32 explicit
indexes**, plus its primary keys/identity sequences. Foreign-key deletes are
restrictive and updates use NO ACTION.

The four partial unique predicates are:

| Table / key | Predicate |
| --- | --- |
| InventoryItem `(organization_id, product_id)` | `sale_status = 'collection'` |
| SaleItem `(organization_id, inventory_item_id)` | `released_event_id IS NULL` |
| Supplier `(organization_id)` | `is_unknown` |
| Purchase `(organization_id, supplier_id, opening_month)` | `is_opening` |

The opening-month format and second-day UTC checks remain. Nullable conditions
and unknown legacy merchandise amounts remain nullable. There is no country
default, unique SKU/email/tracking code or independent PurchaseExpense–Purchase
association. All 38 entity responsibilities and retired IDs in the
[design map](design.md#stable-entity-responsibilities) retain their destinations.

## Storage cycles and deletion boundary

Tables are created before foreign keys. Data insertion requires no deferred
constraints: create Organization/User, then the event header, then its source
and typed change. Global Product registration follows event → Product → change.
Settlement headers precede actual Refund/RetainedIncome and source portions;
payments and target allocations precede portions referencing them. Returns
precede ReturnItems and the optional settlement context.

Sale headers remain after their last line is removed. A permitted deleted line
has never had positive funding and is pre-dispatch, so it has no customer payment
allocation, settlement/retention allocation or ReturnItem. Those later source
records retain restrictive FKs and block deletion. SaleExpense belongs to the
retained Sale, not the deleted line; it and its payment/audit rows survive. The
current schema therefore needs only the two approved audit FK removals. A future
writer introducing another removable dependent must review its audit lifecycle.

The deletion writer must lock the line/Sale, validate historical funding and
dispatch, snapshot Sale/Item/Product/amount context, delete the permitted line
and record all changes in the same transaction. The base DDL does not authorize
arbitrary SQL deletion, subject-ID changes or edits to audit snapshots.

## Command contract

After one-time Docker/Doppler setup:

```sh
pnpm docker:up
pnpm docker:migrate
```

Startup preserves storage and performs no migrations. The explicit migration
command applies only unapplied committed SQL to the development target. Repeating
it is safe. First development application remains a separate owner action after
reviewing SQL and the test evidence, as required by the approved Step 3 plan.

Generation is offline:

```sh
./scripts/tooling.sh run pnpm db:generate
# For a later named change:
./scripts/tooling.sh run pnpm db:generate -- --name describe_change
```

Generation executes the pinned native Drizzle CLI from `packages/db`, using a
relative `./drizzle` output path. Kit 0.31.11 incorrectly prepends `./` to absolute
snapshot paths on repeat generation; keeping the package working directory
fixed avoids that upstream behavior. Its generation handler also catches some
exceptions with status zero, so the supervisor requires the native terminal
success message in addition to status zero. No-change generation must preserve
all artifacts.

Application validates the exact approved dev/test tuple, checks that the native
SQL/journal chain exists and is nonempty before connecting, and passes only
component credentials to the runner. The migrator's actual pg connection receives
5s lock / 30s statement / 30s idle-in-transaction timeouts through replaced
`PGOPTIONS`, plus a 2s connection timeout. The supervisor bounds the process at
120s, forwards SIGINT/SIGTERM and forces termination after 5s. Failed commands
log actual messages and nested causes/codes with password redaction. On
2026-10-25 the owner approved calling the installed native
`drizzle-orm/node-postgres/migrator` directly through the supervised
[application runner](../../packages/db/scripts/apply-migrations.ts). Kit 0.31.11's
progress renderer otherwise discards migration failures before logging them.
The native SQL/journal/history and transaction semantics are unchanged; no custom
SQL executor or dependency change is introduced. The host launcher forwards
command stderr across the Doppler boundary.
An interrupted run requires inspecting history before retry; no automatic
down migration or destructive recovery is supplied. Use the wrapper commands
for these bounds; a raw CLI invocation bypasses their process supervision.

The single custom SQL function is required because the selected Drizzle Kit
version does not manage functions. It performs only positive integer/base36
conversion, has no table reads, and is installed within the native migration
transaction. Its body lives in the base SQL; future function changes require a
reviewed forward migration. Stored generated expressions remain in Drizzle's
snapshot, so normal generation retains their dependency without schema drift.

## Deferred writers and acceptance

S09/S10 approve a structural foundation with no exposed business writer. Direct
database access is currently a local development capability, not an authorized
application business interface. SQL scope constraints are not API read privacy
or Membership authorization.

| Required later operation | Enforcement / missing evidence | Owner |
| --- | --- | --- |
| Purchase registration/amendment | Lock the Purchase/line and affected units; enforce same-Product grouping, ordinary merchandise completeness, exact quantity/cost distribution, permanent identity retention and no ID/sequence rewriting. Test concurrent registration/amendment and rollback. | T01/T03/T06 |
| Expense allocation/payment | Lock the source and affected Purchases/units in deterministic order; reconcile selected-unit allocation and installment/cache sums, reject source overuse/concurrent overpayment and preserve unaffected shared allocations. | T01; #37/#52/#45 |
| Receipt, first approval, collection finalization and Purchase completion | Enforce funding/settlement/completeness, physical transitions, permanent costs and completed-Purchase locks on every relevant writer. Test corrections after approval/membership removal. | T01; D06/D08 |
| Sale creation/release/Return | Maintain `released_event_id IS NULL` exactly while a commitment is active, including post-dispatch until a valid release/Return; atomically update physical/financial/audit consequences. The partial index alone cannot validate eligibility or release authority. | T01/T06 |
| SaleItem deletion versus funding | Serialize on Sale/line, inspect all past positive funding and dispatch, preserve typed Sale/Item snapshots and remove only permitted dependents. Test the actual funding-versus-deletion race. | T01/T06/D06 |
| Customer/supplier settlement | Lock source allocations and party/Sale/Purchase contexts; validate same party and original Payment across source/header/target/outcome, optional Supplier Purchase/Loss context, exact amounts, one disbursement, FIFO and eligible reassignment. The retained portion-table FKs enforce Organization but do not by themselves compare every party/source path. Equal-time/non-refund ordering remains D01. | T01/D01 |
| Typed audit and reporting | Validate historical subject IDs before deletions, prohibit audit mutation, version snapshots and enforce same-action facts. Recompute original Sale/Loss periods without duplicate cash/profit effects. | T01/T03/T06/D07 |
| Authentication/bootstrap/catalog | Firebase/Membership checks, initial administrator permission, public field projection/private-data rejection, media hosting and actual spreadsheet mapping are outside this migration. | T02/D04/T04/T05 |

No trigger, allocator, bootstrap or unapproved exceptional-correction policy is
introduced. Structural fixture SQL is not evidence that these operations exist.

## Validation

The schema integration suite runs only on the validated disposable test target:

```sh
pnpm docker:up:test
./scripts/tooling.sh run-db test pnpm test:db
./scripts/tooling.sh run pnpm check
```

It resets only test schemas at suite startup, replays the complete committed
chain, compares catalog coverage, verifies repeat application, and cleans its
fixtures. It exercises scope/check/unique failures, maximum int32 and UTC Date
round trips, generated identity, retained audit, expense installments and opening
provenance. Two overlapping sessions wait on unique-index locks before one loses
each commitment/collection race. A copied full chain with an invalid final
statement rolls back its tables, enums/function and migration history entries.
An actual CLI blocked on migration-history access fails at the 5s lock bound;
wrong tuple/password failures are sanitized. A blocked CLI interruption ends its
backend within the lock-timeout bound and preserves migration history. Existing connection/lifecycle tests
continue separately in the same suite. Final execution results are recorded in
[technical direction](../technical/technical-direction.md#step-3b-structural-schema-2026-10-25).
