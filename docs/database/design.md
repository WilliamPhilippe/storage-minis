# Database design — DBML review

**Status:** Visual design draft, updated during the owner's 2026-10-23 review. No migration or application schema is implemented.

**Diagram:** [schema.dbml](schema.dbml). **Design owner:** [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21). **Original draft publication:** [E12.05 / #87](https://github.com/WilliamPhilippe/storage-minis/issues/87).

Read [requirements v0.7](../requirements-v0.7.md), [entity map v0.8](../entity-map-v0.8.md), and the dated [approved update logs](../requirement-updates/README.md), applying later decisions to covered topics. The [October 23 field review](../requirement-updates/2026-10-23-dbml-review.md) records field decisions; the later [index/candidate follow-up](../requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) records global index removal, rejected candidates and retained Q61 settlement separation. Apply the subsequent [partial-payment clarification](../requirement-updates/2026-10-23-partial-expense-payments.md) to expense payment fields. The [ownership index](../requirements-coverage-v0.7.md) retains delivery ownership. A diagram box does not automatically establish a SQL table or close an issue.

## Current review changes

- Money columns use `integer` BRL centavos, without `_brl` suffixes: R$1.56 is `156`. Keys also use `integer`, reflecting the October 22 approval. T03 still owns bounds, intermediate precision/overflow and API input contracts.
- All former `business_date` types use PostgreSQL `timestamptz`. BusinessEvent's field is now `occurred_at`, separate from `recorded_at`. Input timezone conversion, UTC report periods and visitor-local display remain required. Timestamps represent actual known instants.
- Membership has `role` (`owner`, `editor`, `viewer`); revocation deletes the row. Grant/revocation audit survives independently. User has a separate global `role` (`global_admin`, `editor`, `user`), defaulting to `user` in this proposal. Role capabilities and their relationship to approved `can_edit_products` authority remain T02 work.
- Global Product removes `scale` and `product_codes`, stores `images` as `text[]`, and adds `is_chase`. Shared Product ownership stays global; condition, progress and box identity stay on Organization-owned InventoryItem.
- InventoryItem uses mutually exclusive `sale_status`: `unapproved` (default), `available`, `held`, `collection`. Collection membership is `sale_status = collection`; it cannot coexist with approval/hold. First-approval and permanent cost-finalization provenance remain separate. InventoryItem removes `private_description`, retaining `private_notes`. Its separate `inventoryId` is immutable, Organization-unique and never reused, including after removal or resale. Unpadded uppercase base36 (`1`, `Z`, `10`) is a compact encoding proposal; the exact generator remains T01 work.
- InventoryItem replaces `possession` with `status`: `china`, `brasil`, `eua`, `bolivia`, `shipped`, `received`, without a fabricated default country. Transition semantics must distinguish incoming progress from Sale dispatch, Return, Loss and removal facts. These enum values do not add multiple stock locations or package-management scope.
- All explicit secondary indexes are now standalone `organization_id` lookups. BusinessEvent and its typed change details still have no index blocks; global Product/User have no secondary indexes, including no inline Firebase UID unique index. Primary keys remain. Composite references in the diagram express required scope; some target keys are deferred and cannot yet become executable PostgreSQL FKs. Readable-ID/collection uniqueness and concurrent enforcement remain required.
- Every `candidate.*` table and reference is removed. Import operation/row evidence remains in T05 migration artifacts. The earlier Q61 approval is retained: dedicated customer/supplier settlement headers and source-allocation tables replace the mixed generic placeholders. T05 still owns source identity, preview, reconciliation and rerun safety.

`sealed` and `damaged` are nullable booleans, preserving unknown evidence without asserting open/undamaged. The owner confirmed that `not_applicable` collapses into unknown. ReturnItem preserves the same boolean condition facts plus `damage_description`. Actual source mappings still require import preview; no data conversion has been performed.

For imports, one marked `purchases.is_opening` Purchase per Organization, Supplier and purchase year/month represents E39, replacing `candidate.opening_acquisitions` and its alternative unit path. All units now reach one PurchaseItem. `opening_month` stores `YYYY-MM`; `ordered_on` uses the approved second day of that month, normalized to 00:00 UTC. For October 2026, store `2026-10-02T00:00:00Z`. Both ordinary and opening Purchases require a timestamp; the opening marker and month evidence distinguish conventional import dates from actual known instants. `opening_source_description` / `opening_evidence` preserve reviewed provenance, and missing opening merchandise amounts may remain null.

Use the known Supplier or an Organization-owned `suppliers.is_unknown` placeholder. Known Suppliers retain required phone/type through a check; the unknown placeholder leaves both null. Group uniqueness, placeholder uniqueness, ordinary nonnull merchandise costs and reviewed legacy receipt/funding treatment require T01/T05 cross-record enforcement. The second-day timestamp is an explicitly approved import convention. Supplier details, costs, historical Payments and receipts are not invented. The actual spreadsheet has not been inspected.

## Stable entity responsibilities

All 38 active E-IDs retain destinations below. E40/E41 remain import-evidence responsibilities without persistent tables; no IDs are reused. Retired E12, E17, E22, E23, E30, E31 and E38 remain absent.

| ID | Concept | Current diagram destination |
| --- | --- | --- |
| E01 | Organization | `organizations`; one implicit collection through units. |
| E02 | User | `users`; global Firebase identity and global role. Product-edit authority needs propagation/enforcement. |
| E03 | Membership | `memberships`; current User–Organization association and scoped role; deleted on revocation, with audit subject pointing to User rather than the deleted Membership. |
| E04 | Product | `products`; global metadata, nonunique SKU, string-array images, chase flag. |
| E05 | InventoryItem | `inventory_items`; physical unit, integer key, readable `inventoryId`, acquisition, condition, physical `status`, exclusive `sale_status` and cost facts. |
| E06 | Supplier | `suppliers`; Organization-owned known party or unknown-import placeholder with no fabricated phone/type. |
| E07 | Purchase | `purchases`; Supplier, lifecycle, expense completeness, and marked year/month-grouped openings. |
| E08 | PurchaseItem | `purchase_items`; same-Product units and merchandise total; Product reached through units. |
| E09 | SupplierPayment | `supplier_payments`; actual outgoing merchandise cash. |
| E10 | SupplierPaymentAllocation | `supplier_payment_allocations`; source funding of one physical unit. |
| E11 | SupplierRefund | `supplier_refunds`; actual incoming refund and original funding/Loss provenance. |
| E13 | PurchaseExpense | `purchase_expenses`; Purchase links derive exclusively from selected-unit allocations, with no independent association table. |
| E14 | AcquisitionExpenseAllocation | `acquisition_expense_allocations`; selected-unit costs, exact source reconciliation. |
| E15 | Expense payment information | `purchase_expense_payments` / `sale_expense_payments` preserve each actual installment; headers retain reconciled cumulative `settled_amount` and final `settled_on`. |
| E16 | Customer | `customers`; embedded address, private notes. Mandatory nonblank name still needs October 22 propagation. |
| E18 | Sale | `sales`; one Customer, original occurrence and whole-Sale dispatch. |
| E19 | SaleItem | `sale_items`; persistent physical Item, agreed price, specific cost and commitment. Deletion/audit shape still needs propagation. |
| E20 | CustomerPayment | `customer_payments`; actual incoming merchandise cash. |
| E21 | CustomerPaymentAllocation | `customer_payment_allocations`; exactly one mandatory SaleItem and original Payment provenance. |
| E24 | CustomerRefund | `customer_refunds`; actual outgoing cash and funding provenance. |
| E25 | Return | `returns`; physical receipt from one originally shipped Sale. |
| E26 | ReturnItem | `return_items`; original SaleItem and preserved condition/eligibility decision. |
| E27 | RetainedIncome | `retained_income`; earned retention, separate from cash and returned merchandise. |
| E28 | RetainedIncomeAllocation | `retained_income_allocations`; exact affected-line/model attribution. |
| E29 | Loss | `losses`; original write-off and correction/refund provenance. |
| E32 | BusinessEvent | `business_events` and typed `business_event_changes`; explicit indexes deferred. |
| E33 | ItemHistoryEntry | Derived Item timeline over sources and shared history. |
| E34 | FinancialEffect | Derived reports over current corrected sources; no independent ledger table. |
| E35 | AuditEntry | Shared E32 actor, timing, reason, before/after and correction provenance. |
| E36 | FinancialSettlement | `customer_settlements` and `supplier_settlements`; dedicated same-party action contexts, not mixed candidates. |
| E37 | SettlementSourceAllocation | `customer_settlement_source_allocations` and `supplier_settlement_source_allocations`; one source portion and permitted outcome. |
| E39 | OpeningAcquisition | Marked `purchases` with `opening_month` and evidence; no separate table. |
| E40 | ImportBatch | No persistent table; operation evidence remains a T05 migration artifact responsibility. |
| E41 | ImportRow | T05 source-row mapping/reconciliation artifacts; rejected persistent table proposals are absent. |
| E42 | Product image values | Embedded `products.images` string array; no ProductImage entity. |
| E43 | Brand value | Embedded required `products.brand`; no Brand entity. |
| E44 | ItemCostSnapshot | Embedded `finalized_acquisition_cost` / `cost_finalized_event_id`, with source allocations and finalization provenance. |
| E45 | SaleExpense | `sale_expenses`; one Sale, no allocation across models/units. |

## Relationships and enforcement

Every physical unit belongs to one Organization and references one global Product. PurchaseItems group same-Product units; transactions reach Product through InventoryItem. Shared Product access grants no access to another Organization's inventory, notes, parties or finances. Scope/context columns are constrained relationship keys, not independently editable facts.

Reserved and In Garage derive from active commitment, debt and dispatch. One physical unit may have historical SaleItems after Return/resale but only one active commitment. A Return requires a shipped original line and physical receipt; it updates condition, eligibility, commitment and financial sources atomically. At most one current unit with `sale_status = collection` may exist per Organization/Product, enforced under concurrent changes. `available` remains subject to physical presence, finalized cost, no active commitment and no removal/disposition; changing the label alone does not prove eligibility.

Every unit requires one PurchaseItem acquisition path, including marked opening Purchases. Unknown legacy facts remain explicit, with conventional second-day Purchase timestamps identified as such. All created units require permanent internal and readable identities; target-Organization stock reconciliation is independent of global Product growth.

A shared PurchaseExpense is counted once and allocated only to selected units. For P1 containing I1/I2 and P2 containing I3/I4, an R$30 expense allocated R$10 to I1 and R$20 to I4 yields Purchase subtotals R$10/R$20. No cost is assigned to I2/I3. The approved design derives Purchase links from allocations, without a separately maintained association. Exact allocation uses largest remainders with permanent Item ID tie-breaking; all-zero proportional weights require explicit equal-unit/manual selection.

The dedicated customer/supplier settlement families keep separate party contexts, permitted outcomes and original funding references. Actual Refunds and RetainedIncome point to their applicable settlement; shared audit has typed subjects for each header/source portion.

Source/target funding must preserve Organization, Customer/Supplier and original Payment scope. New Payments are fully allocated. Released customer funding is refunded or reassigned to eligible existing SaleItems of the same Customer; pending refunds are source-linked obligations. There is no reusable wallet or supplier credit. One chosen refund amount is settled once; original funding is consumed FIFO for refunds, with equal-time tie-breaking still open.

First sale approval or explicit eligible collection-unit finalization permanently locks merchandise costs and acquisition allocations. Removing approval/membership never unlocks them. Completed Purchases are firmly locked. Receipt requires merchandise funding and settled applicable expenses, independently of approval. Expense allocations also block ordinary unpaid/unreceived unit removal until explicitly resolved; shared sources and unaffected allocations survive.

Each business action commits sources, inventory, funding, history and dependent changes atomically. Typed before/after facts must survive permitted never-funded SaleItem deletion. Reports recompute corrected Sales, Returns, retention and SaleExpenses in the original Sale period; Loss corrections and linked SupplierRefunds affect the original Loss period. Cash retains its actual occurrence timestamp. Generic later-period signed-adjustment transactions are not approved.

## Expense values and payments

`amount` is the full incurred expense cost. `settled_amount` is the cumulative amount paid so far, starting at zero and reconciled to authoritative payment rows; it can be less than `amount`. It is retained under the owner's partial-payment clarification and is not a manually editable independent balance. The former full-payment-only equality/tuple checks are removed.

`purchase_expense_payments` and `sale_expense_payments` preserve each installment's positive amount, actual cash timestamp, method and shared creation/audit event. One header date/method cannot replace that history. `settled_on` is the completion timestamp and stays NULL while partially paid; the single header method/event fields are replaced by payment-source metadata.

For an R$100 expense, payments of R$30 and R$70 yield `settled_amount` values of 0, 3000 and 10000 centavos. Cash shows two outgoing movements on their actual dates, while cost remains R$100 once. AcquisitionExpenseAllocation still distributes the expense cost among units; it is not another payment. Purchase receipt and cost finalization still require applicable expenses to be fully settled.

T01 must atomically reconcile header caches, payment sources and audit, reject overpayment and cross-Organization references, preserve every payment's history, and serialize concurrent payments. Ordinary merchandise payments remain in SupplierPayment/CustomerPayment; refund single-disbursement rules and the exclusion of expense-payment batching remain applicable.

## Remaining propagation and design work

| Remaining gap | Required approved outcome / owner |
| --- | --- |
| Partial expense payment integrity | Reconcile cumulative settled amounts to payment rows, enforce positive amounts and obligation limits, preserve separate cash dates/methods and reject concurrent overpayment/cross-Organization changes; T01 / #37 / #52 / #45. |
| Settlement limits and attribution enforcement | Same party/Organization/original Payment, eligible target, exact source reconciliation, FIFO refunds, single disbursement and concurrency; T01 / D01. |
| Restrictive SaleItem audit FK and deletion wording | Never-funded pre-dispatch deletion with surviving audit; any past positive funding permanently blocks deletion; T01 / D06. |
| Missing `can_edit_products`, current-label and public-unit fields | Approved global edit authority and global audit; distinct public unit descriptions/photos and private notes; T01 / T02 / D04 / D07. |
| Older reporting notes | Explicit collection-unit finalization, permanent locks, current-membership signed recovery, provisional metrics and original-period queries; T01 / D02 / D03 / D05 / D08. |
| Customer name nullability | Require a nonblank name, optional telephone/address; T01. |
| Deferred keys and index enforcement | Implement Organization isolation, unique Firebase UID, unique Membership pair, readable-ID/collection uniqueness, unique expense/unit allocation, one Return per original SaleItem, one active commitment and valid scoped FK targets; T01 / T02. |
| Current review enforcement and role capabilities | Enforce exclusive sale-status transitions, approved import condition/date mappings, legacy evidence and access matrix; T01 / T02 / T05. |

T03 still owns numeric bounds/overflow and detailed timestamp/period contracts. T05 must inspect the actual source, preview invalid/ambiguous mappings, approve exceptions, preserve evidence and define rerun safety. T02 retains bootstrap/session/recovery and authorization work. T04/T06 retain hosting, migrations, tooling and operational readiness. Existing issue ownership and dependencies remain unchanged.

## Validation

DBML parsing and structural checks validate the visual artifact only. No PostgreSQL migration, runtime transaction/concurrency test or application test suite exists yet. Conceptual composite references lack executable target keys because supporting indexes were explicitly deferred.

This revision has 33 table shapes, 11 enums and 158 references, and parses with official `@dbml/core` 10.3.1 (`dbmlv2`) using temporary tooling under ignored `.context/`. Validation covers removed-table/reference cleanup, field types, enum values, key/reference endpoints, the global index policy, partial-expense payment bounds/completion checks and dated payment-source links, changed Markdown links and whitespace. No application dependency manifest was introduced.
