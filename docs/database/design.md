# Database design — draft 1

**Date:** 2026-10-22. **Status:** proposed visual schema for owner review, before the first migration.

**Diagram source:** [schema.dbml](schema.dbml). **Draft publication:** [E12.05 / #87](https://github.com/WilliamPhilippe/storage-minis/issues/87), under [Epic E12 / #14](https://github.com/WilliamPhilippe/storage-minis/issues/14). **Broader design task:** [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21).

The owner requested a first DBML version mapping the existing entity document so entities, fields and relationships can be reviewed before installing Drizzle and PostgreSQL. This authorizes a design draft, not approval of every proposed column or physical table boundary. The [v0.7 entity map](../entity-map-v0.7.md), [requirements](../requirements-v0.7.md), [accepted model decisions](../model-review.md), [shared-expense impact](../purchase-expense-impact-v0.7.md) and [technical direction](../technical-direction.md) remain the governing sources. The [ownership index](../requirements-coverage-v0.7.md) continues to assign delivery work; this draft does not close T01 or any decision issue.

## Viewing and reviewing the diagram

Open the complete `schema.dbml` file in a DBML-compatible viewer such as [dbdiagram](https://dbdiagram.io/). The file is self-contained. Its table notes retain E-IDs, requirement references and open-policy boundaries, so those annotations remain available with the diagram.

There are **34 proposed table shapes**: 26 representations of accepted entity concepts, two supporting relationship/history structures, and six explicitly conditional structures. Nine visual groups organize identity, catalog/inventory, purchasing, expenses, sales/Returns, customer funding, history, and the two candidate areas. Notes on the diagram cover embedded/derived concepts and the shared-expense example.

The `candidate` namespace and amber/gray headers distinguish optional storage choices. They are visual review markers, not an approved PostgreSQL namespace or permission to implement additional workflows. A required relationship drawn into a candidate means “this is the relationship if this storage option is selected”; it does not make that candidate a mandatory baseline table.

The first review should cover each group's entities, fields, mandatory/optional values and relationship cardinality. Exact key generation, naming conventions, storage boundaries and constraints can then be finalized alongside the relevant T01/T02/T03/T05/T06 work.

## Draft conventions and unresolved types

| Convention | Meaning in this draft |
| --- | --- |
| UUID primary keys | Proposed consistent identifier representation, without selecting a UUID version or generation mechanism. The permanent Item identity requirement is already accepted. |
| Lowercase plural table names / snake_case columns | Proposed physical naming, mapped to the existing domain names below. `retained_income` retains the uncountable domain noun. |
| `brl_amount` | Deliberate diagram-only placeholder for exact BRL values. It is not PostgreSQL `money`, floating point, a chosen decimal precision, or an approved integer-cent representation. T03 must decide representation and rounding. |
| `business_date` | Deliberate diagram-only placeholder for business dates. It does not choose PostgreSQL `date`, a timestamp, an input timezone or period-filter behavior; those remain T03. |
| `timestamptz` | Proposed PostgreSQL representation of timestamp instants. UTC storage/reporting and visitor-local timestamp display are accepted. |
| Nullability / enum values | Explicit source requirements are preserved. Other field shapes and enum spellings are review proposals. For example, Supplier name/phone/type and Product name/SKU/brand are mandatory; CUS-002 only says Customer name/phone are supported, so the draft does not invent mandatory Customer-contact rules. |
| Scope/context columns | Some references repeat `organization_id`, `customer_id`, `supplier_id`, `purchase_id` or `sale_id` to express composite integrity constraints. They are constrained relationship keys, not independent editable facts. |
| `created_event_id` and other event links | Connect source facts to shared action provenance. Source business dates and the event's recorded timestamp remain distinct. Their exact input/correction contract still needs T03. |
| `jsonb` values | Proposed encoding for optional catalog values, reviewed import evidence and typed history snapshots. Exact payloads, validation and versioning remain design work. Public visibility is not implied. |
| Restrictive deletion references | Preserve source/history identities. Ordinary removal is an explicit dated soft-removal/release action; no cascade deletion of Products, expense sources or transaction history is introduced. |

The two placeholder types intentionally make this a **design artifact, not executable migration SQL**. Translating the approved design to Drizzle must resolve them and add all constraints/transaction behavior that the diagram cannot establish.

## Complete entity-map coverage

All **38 non-retired E-IDs** in the v0.7 map have a destination. A diagram box is a proposed storage boundary; an entity-map entry does not automatically require its own SQL table.

| ID | Source concept | Draft representation |
| --- | --- | --- |
| E01 | Organization | `organizations`; one implicit collection via its units. |
| E02 | User | `users`; global Firebase identity, with remaining authentication/bootstrap design in T02. |
| E03 | Membership | `memberships`; unique User–Organization association. |
| E04 | Product | `products`; global, no owning Organization, nonunique SKU. |
| E05 | InventoryItem | `inventory_items`; persistent identity, acquisition, condition, possession, eligibility, private values and collection membership. |
| E06 | Supplier | `suppliers`; Organization-owned party. |
| E07 | Purchase | `purchases`; Supplier, lifecycle and explicit expense completeness. |
| E08 | PurchaseItem | `purchase_items`; quantity/merchandise total, with Product reached through generated units. |
| E09 | SupplierPayment | `supplier_payments`; actual outgoing merchandise cash. |
| E10 | SupplierPaymentAllocation | `supplier_payment_allocations`; individual unit funding. |
| E11 | SupplierRefund | `supplier_refunds`; actual incoming refund with settlement/source and optional Loss provenance. |
| E13 | PurchaseExpense | `purchase_expenses`; shared Purchase context through `purchase_expense_purchases`. |
| E14 | AcquisitionExpenseAllocation | `acquisition_expense_allocations`; selected physical units, not Purchase-header cost allocation. |
| E15 | Expense payment information | Embedded `settled_amount_brl`, `settled_on`, `settlement_method` and `settlement_event_id` on each expense. No separate ExpensePayment table. |
| E16 | Customer | `customers`; address fields embedded directly, with private notes. |
| E18 | Sale | `sales`; one Customer, original recognition date and whole-Sale dispatch facts. |
| E19 | SaleItem | `sale_items`; specific Item, agreed price, recognized cost and release history. |
| E20 | CustomerPayment | `customer_payments`; actual incoming merchandise cash, excluding customer-paid shipping. |
| E21 | CustomerPaymentAllocation | `customer_payment_allocations`; mandatory Sale and optional matching SaleItem. |
| E24 | CustomerRefund | `customer_refunds`; actual outgoing cash, with multiple original funding sources through the E37 candidate. |
| E25 | Return | `returns`; physically received units from one shipped Sale. |
| E26 | ReturnItem | `return_items`; one original SaleItem, condition and explicit availability decision. |
| E27 | RetainedIncome | `retained_income`; legitimately earned retention, separately from reversed Sale revenue. |
| E28 | RetainedIncomeAllocation | `retained_income_allocations`; exact attribution to affected SaleItems/models. |
| E29 | Loss | `losses`; one write-off and its original context, with dated reversal provenance. |
| E32 | BusinessEvent / shared action history | `business_events` plus proposed typed `business_event_changes`. |
| E33 | ItemHistoryEntry | Derived timeline over Item-linked source facts and shared history; no separate table. |
| E34 | FinancialEffect | Derived dated reporting projection; no independent editable ledger/table. |
| E35 | AuditEntry | Actor, dates, reasons, changed facts and reversals in E32's shared storage; no second audit table. |
| E36 | FinancialSettlement | **Candidate:** `candidate.financial_settlements`; alternatively typed BusinessEvent details. |
| E37 | SettlementSourceAllocation | **Candidate:** `candidate.settlement_source_allocations`; alternatively specific typed funding/provenance structures. |
| E39 | OpeningAcquisition | **Candidate:** `candidate.opening_acquisitions`; T05 may instead choose a marked opening Purchase. |
| E40 | ImportBatch | **Candidate:** `candidate.import_batches`; migration-operation evidence, not a new import-management product. |
| E41 | ImportRow | **Candidate:** `candidate.import_rows` and `candidate.import_row_inventory_items`; may remain validation artifacts instead of permanent storage. |
| E42 | Product image values | Embedded `products.images`; no ProductImage entity. Encoding/storage/public presentation remain open. |
| E43 | Brand value | Embedded required `products.brand`; no Brand entity. |
| E44 | ItemCostSnapshot | Proposed embedded `inventory_items.finalized_acquisition_cost_brl` / `cost_finalized_event_id`, first-approval provenance and preserved source allocations. A separate versioned snapshot remains conditional on D06. |
| E45 | SaleExpense | `sale_expenses`; belongs to one Sale, with no arbitrary model allocation. |

Retired **E12, E17, E22, E23, E30, E31 and E38** remain absent and are not reused. Supplier/customer credit, CustomerAddress, Collection/CollectionDesignation and LossRecovery are excluded. Reservation, In Garage, catalog availability, account balances, quantities, profit and collection-recovery metrics remain derived responsibilities. No extra table is introduced for them.

The two supporting structures outside the candidate namespace are:

- `purchase_expense_purchases`: the explicit many-to-many relationship permitted by the entity map. It has no monetary amount. Links could instead be derived from allocations with equivalent guarantees.
- `business_event_changes`: typed source references and changed business facts within the single shared history. Its exact payload/storage contract needs further review; it is not a second audit or financial-effects domain.

## Relationships and state dimensions

Global Product is referenced by `inventory_items` and its global action history. Operational paths reach Product through the unit. In particular, `purchase_items`, `sale_items`, allocations, Returns and Losses do not gain independent Product foreign keys. Units from one PurchaseItem must share the same Product, including retained removed units.

An ordinary unit has one PurchaseItem acquisition path. `inventory_items.purchase_id` is a proposed redundant relationship key constrained to that same line, allowing an expense/payment allocation to prove its target unit belongs to the relevant Purchase. The candidate opening path is mutually exclusive. Opening units cannot silently receive ordinary Purchase-based funding/expense links; T05 must first approve any equivalent acquisition treatment.

| Dimension | Draft source |
| --- | --- |
| Physical possession | `inventory_items.possession`, original receipt event, Sale dispatch and physical Return facts. A removed order unit retains its acquisition identity and separate removal event. |
| Administrator sale eligibility | `is_sale_approved`; first approval is preserved. Return records carry their own explicit condition/availability decision. |
| Hold / collection | Separate `is_held_for_appreciation` and `is_collection` flags with dated changes; no new stock-location concept. |
| Active Sale commitment | A `sale_items` row without `released_event_id`. Dispatch keeps its history/commitment; a valid Return releases it so a subsequent SaleItem can reference the same Item. |
| Payment status / debt | Derived from obligations, original Payments, allocations and dated funding resolutions. No editable balance columns. |
| Purchase lifecycle | Open/Completed/Canceled, independent of payment and receipt progress. |
| Sale lifecycle labels | Derived from cancellation, dispatch, debt and Return facts. Reserved and In Garage are not independently writable statuses. |
| Cost completeness / lock | Known unit merchandise amount plus `acquisition_expense_completeness`; finalized snapshot/event is separate. First sale approval locks ordinary costs. D08 still governs units never approved for sale. |

The diagram expresses the SaleItem–ReturnItem relationship as one-to-one with unique original SaleItem ownership: zero or one ReturnItem per historical SaleItem, while each ReturnItem must reference one original SaleItem. A later resale creates a new SaleItem that may itself be returned once. A Sale/Purchase/Return must have the required lines when the business action commits; child foreign keys alone do not enforce a parent's minimum child count.

## Shared expenses and exact unit attribution

For P1 containing I1/I2 and P2 containing I3/I4, one R$30 expense has two context links and only two unit allocations: R$10 to I1, R$20 to I4. I2/I3 receive none. The relationship table holds no amount; Purchase subtotals derive as R$10/R$20, and the original expense and cash settlement remain R$30 once.

Composite references ensure an allocation's Purchase is both linked to the expense and the target unit's originating Purchase. The unique expense/unit pair prevents duplicate current cost lines. Preserved allocation and method changes belong to the source's dated history. Matching the complete Purchase-link set to the allocated-unit set, exact amount reconciliation, deterministic remainders and all Purchase/unit locks still require transactional enforcement.

E15 is embedded as one full settlement per expense: all four settlement fields are absent or present together, and the actual settled amount must equal the expense amount. This draft does not add partial or batched expense payments. Confirmed zero is an explicit completeness fact, not a fabricated zero expense record. Receipt, completion and edits inspect the applicable shared sources and each affected unit independently.

## Funding, obligations and the settlement candidates

Original Payment allocations retain their source identity and amounts. Effective funding is calculated from those facts and their dated releases/reclassifications. Reassignment creates a new target allocation against the **same original Payment**, while the source resolution explains which original allocation released that portion. Reporting must not sum historical allocation rows as though they were all still active.

The E36/E37 tables illustrate one possible structure for required funding provenance. They can be replaced by typed action details without changing the business rules. Each source portion has exactly one outcome. Several portions can fund one actual refund, and a paid/pending split must preserve its dated prior form in shared history. Cross-record matching must enforce the same Customer/Supplier, Organization, original Payment and originating settlement context.

| Situation | Representation in this proposal |
| --- | --- |
| R$20 is owed back, but has not been sent | Refund outcome on a source-allocation portion, with no actual Refund reference. It is unavailable for spending. |
| R$20 is actually refunded from two original Payments | One actual Refund record with two source portions whose amounts total R$20. Each portion points to its original PaymentAllocation. |
| R$20 is reassigned to an existing eligible Sale | Source portion points to the replacement PaymentAllocation. It retains the same original Payment; no new cash or wallet is created. |
| R$30 is legitimately retained | Source portion points to RetainedIncome; its allocations explain the affected SaleItems/models and sum to R$30. |
| A supplier deposit is explicitly written off | Source portion identifies the original unit funding and its Loss. Authorization/finalization must follow the agreed workflow. |
| Some written-off supplier money is later received | Actual SupplierRefund references the prior Loss/source. A dated reclassification/adjustment resolves the original loss portion; it cannot consume the same funding twice or count two economic recoveries. |

Customer cash Refund records reference the originating Sale. Supplier settlement context can span funding from several Purchases of the same Supplier through the source allocations. An optional Purchase on its settlement header supplies additional order context. D01 still chooses how a partial Return selects funding sources; D06 still governs exceptional correction and shared-expense disposition. Neither is decided by the candidate columns.

## Shared history and dated reporting

The proposal has one BusinessEvent header with typed source-change details. A change references exactly one real source through a foreign key; a single action can contain many changes. It does not use an unchecked `source_type/source_id` pair as its only integrity mechanism. `reverses_event_id` and `reverses_change_id` preserve whole-action and source-component provenance.

`before_facts` and `after_facts` propose immutable, versioned **business** snapshots validated by `change_kind`, including the original values necessary to explain revenue, recognized unit cost, funding, membership, condition and other source facts. Their exact schemas, version discriminator and historical query contract must be specified before implementation. Arbitrary unvalidated JSON or a technical `updated_at` log would not meet the requirements. Changes to relationship-only records, such as expense/Purchase links, must also be preserved as validated source details.

For example, Sale creation preserves its original price and matched cost in source history on the Sale date. A later price change, cancellation or Return records its own dated change with the original source/component reference. Financial projections derive the appropriate signed difference once. Customer Payment/Refund timing affects cash and debt; it does not change the original profit date or subtract a reversal twice.

E33 item timelines derive from Item subjects and other typed sources that reach an Item. E34 financial views derive from dated authoritative source facts and their adjustments. E35 audit responsibility shares those records. A projection must count a source once, not both its current row and its creation-history snapshot as independent income/expense. No event-sourcing, separate editable ledger or four-history-table architecture is selected.

## Integrity work beyond the diagram

The references/checks are proposed constraints, not runtime evidence. Before the first migration, review the following enforcement obligations alongside the [entity map's 18 constraints](../entity-map-v0.7.md#14-relationship-constraints-to-preserve-during-schema-design).

| Invariant | Represented now | Still needed before implementation acceptance |
| --- | --- | --- |
| Global Product / private Organization data | Global Product with no owner; composite ownership references for operational paths. | Membership authorization for reads/writes and private caches; global Product registration scope and D07 governance. |
| Persistent acquisition identity | One ordinary PurchaseItem path or conditional opening path; unit-scoped references. | Atomic one-ID-per-unit creation, same-Product line invariant, original quantity/merchandise-share reconciliation and T05 review. |
| One collection unit per Organization/Product | Membership field and an explicitly nonunique lookup index. | PostgreSQL partial unique index on `(organization_id, product_id)` for current collection members; atomic designation replacement and sale exclusion. |
| One active Sale commitment | Released-event field and historical SaleItems. | PostgreSQL partial unique index on `(organization_id, inventory_item_id)` where `released_event_id IS NULL`; eligibility checks and competing-write tests. |
| Physical Return identity | Unique original SaleItem and matching Return/Sale composite paths. | Require a shipped original line and physical receipt; apply condition, release and financial consequences atomically. |
| Same-customer/supplier funding | Composite Payment/Sale customer keys and Supplier/Payment/Purchase/unit keys. | Complete candidate settlement-party matching, same-original-Payment reassignment, source/target limits and concurrent overuse prevention. |
| Exact allocations | Source amounts, selected targets and unique current expense/unit pairs. | Full new-Payment allocation, nonnegative obligations, exact expense/retention totals and T03 rounding/remainders. |
| Shared expense integrity | Explicit context links, Item allocations and one embedded cash settlement. | Exact link-set equality, full settlement amounts, completed-Purchase/finalized-unit locks and no implicit redistribution/deletion. |
| Receipt / removal / completion / cancellation | Independent possession, first receipt, lifecycle, removal and completeness facts. | Paid merchandise/expenses before receipt; only unpaid/unreceived ordinary removal; all active units received before completion; ever-received cancellation rejection. |
| Preserved cost and Sale recognition | First-approval/snapshot fields, specific recognized SaleItem cost and original source dates. | Lock authoritative source allocations, validated dated price/cost changes, D06 corrections and D08 boundaries. |
| History scope and provenance | FK-backed subjects, business/recorded dates and reversal links. | Matching global versus private header/detail scope, typed snapshot validation/versioning, same-source reversal validation and historical queries. |
| Atomic outcomes / derived totals | Dated source facts and one shared action context. | Real PostgreSQL transaction, rollback and concurrency design; reconcile projections and prevent duplicated economic effects. |

The partial uniqueness requirements are notes, not misleading plain unique indexes. DBML supports index definitions and notes, but this draft does not encode PostgreSQL partial predicates as executable index settings. Aggregate/cross-row rules similarly cannot be established by drawing a relationship. Database/Drizzle installation and these runtime checks remain future implementation work.

## Decisions deliberately left open

| Decision | Boundary in the draft |
| --- | --- |
| [D01 / #15](https://github.com/WilliamPhilippe/storage-minis-be/issues/15) | Partial-Return funding selection and reversal order. Source relationships permit several Payments without choosing an order. |
| [D02 / #16](https://github.com/WilliamPhilippe/storage-minis-be/issues/16) | Historical collection-cost presentation after designation changes. Membership history is preserved without choosing a report formula. |
| [D03 / #17](https://github.com/WilliamPhilippe/storage-minis-be/issues/17) | Negative eligible profit in model/pooled recovery. No stored recovery balance or formula policy is added. |
| [D04 / #18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) | Public Organization context, allowed fields, search/filter/image contract. Global Product fields are not automatically public. |
| [D05 / #19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19) | Launch reports, filters and average-cost basis. Reporting remains derived. |
| [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Correction authority, protected-cost adjustments, Loss reversals and shared-expense disposition. Provenance fields do not grant permission. |
| [D07 / #79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79) | Existing shared Product edits, global audit governance, private model annotations and historical labels. No merge/archive/moderation workflow is added. |
| [D08 / #80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80) | Never-approved collection-unit cost finalization/provisional display. The existing first-sale-approval lock remains. |
| [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) | Remaining Firebase session behavior, bootstrap, recovery and authorization. UUID/User/Membership field proposals do not close it. |
| [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) | Exact BRL arithmetic, remainders, business-date representation and period semantics. Placeholder types keep these visible. |
| [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Real spreadsheet mapping, opening acquisition, missing facts and rerun rules. No source data or historical cash/dates are fabricated. |

## Validation and tooling references

This draft was parsed with the official **`@dbml/core` 10.3.1** `dbmlv2` parser using temporary validation tooling under the ignored `.context/` directory. The parser recognized 34 tables, nine enums and 157 references. No application dependency manifest, database installation or migration was introduced.

Documentation checks cover all 38 active E-IDs, the seven absent retired IDs, referenced requirement IDs, relationship endpoints/target keys and changed relative Markdown links. PostgreSQL transactions, constraints and application tests have not been run; a valid DBML file is evidence of a readable design artifact, not runtime business integrity.

The syntax follows the official [dbdiagram introduction](https://docs.dbdiagram.io/), [DBML structural syntax](https://dbml.dbdiagram.io/docs/), [visual grouping/notes documentation](https://dbml.dbdiagram.io/syntax/enrichment-visualization/) and [`@dbml/core` parser API](https://dbml.dbdiagram.io/js-module/core/). These document the format and validation interface; the v0.7 project sources determine the business model.
