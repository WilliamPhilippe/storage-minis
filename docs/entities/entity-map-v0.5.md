# storage-minis v0.5 — entity and relationship map

**Status:** Proposed conceptual model for review, before physical database design.

**Reviewed:** 2026-10-21.

**Source:** [Full Requirements Specification v0.5](requirements-v0.5.md), imported from [GitHub issue #2](https://github.com/WilliamPhilippe/storage-minis-be/issues/2).

**Related task:** [T01 — core entities, state dimensions, and invariants](https://github.com/WilliamPhilippe/storage-minis-be/issues/21).

**Review clarifications:** [Entity-model review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/entities/model-review.md). Subsequent user decisions name the User/Organization association **Membership**, embed the address on **Customer**, exclude supplier/customer credit balances and a separate LossRecovery entity, keep expenses inside Purchases/Sales, and place collection membership on **InventoryItem**. Each Organization has one implicit collection, with at most one collection InventoryItem per Product. A shared business/action/audit history supports derived item timelines and financial views. These decisions supersede conflicting v0.5 proposals and requirements; the snapshot itself is preserved.

This map identifies the business information the application must preserve and the relationships needed to explain it. An entity or record type here does not imply a separate SQL table. Embedded values, typed transactions, event details, and normalized tables are physical-design options to evaluate afterward.

The map distinguishes business concepts, required historical/financial information, and conditional storage structures. Discussion IDs remain stable; removed proposals E12, E17, E22, E23, E30, E31, and E38 are intentionally absent. E33–E35 identify derived/history responsibilities rather than separate baseline entities. Record boundaries and database table boundaries are separate decisions.

No database engine, ORM, event-sourcing architecture, or double-entry accounting system is assumed. The six existing business-decision tickets remain open as of this review.

## 1. Organizations and access

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E01 | **Organization** | Ownership and isolation boundary for business records, including its single implicit collection. | Has memberships and all organization-owned business records below. No separate Collection entity or multiple-collection relationship. | REQ-004; ORG-001–002, ORG-008–009; user-confirmed collection scope |
| E02 | **User** | Administrator identity and attribution for actions. Authentication details follow the technical design. | May have memberships in several Organizations; acts on business events and audit entries. | ORG-003–005; TECH-001 |
| E03 | **Membership** | Connects a User with an Organization and authorized administrative access. | Exactly one User and one Organization per membership. | ORG-003–005, ORG-008; user-confirmed name |

Membership is a recommended association to accommodate the stated future multiple-organization membership. It does not add invitations, a role-management interface, or a separate Permission/Role catalog to launch scope. Users can be global identities; their access and all business data remain organization-scoped.

## 2. Products and physical units

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E04 | **Product** | Miniature model: internal ID, required name/SKU/brand, optional descriptions/images/scale/codes, separated public and private information. SKU is not a unique identity. | One Product has many InventoryItems. Other business transactions reach Product through InventoryItem; Product has no collection flag or collection-item pointer. | PRO-001–010; user-confirmed relationship boundary |
| E05 | **InventoryItem** | One ordered physical unit with its permanent Item ID. Holds current condition, asking price, ownership/possession and eligibility information, acquisition provenance, cost-finalization information, and collection membership such as `is_collection`. | Exactly one Product and Organization; one originating PurchaseItem or approved equivalent opening-acquisition source; many historical SaleItems, history facts, expense allocations, and payment allocations. | REQ-009, REQ-012; INV-001–031; user-confirmed collection membership |

Create the Item ID at Purchase registration, including a preorder. Receiving, removal, return, and resale reuse that identity. Sealed/open and damaged/undamaged information must allow the specification's unknown/not-applicable cases. Damage is a condition attribute and does not independently determine availability.

InventoryItem is the connection between a Product and its operational history. A PurchaseItem groups units of the same Product, but a direct PurchaseItem → Product foreign key is not part of this baseline: the Product is reached through its generated InventoryItems. Preserve removed units so the original line's model remains identifiable. Multiple units of the same Product may exist, but at most one may belong to that Organization's collection at a time; collection membership remains optional.

The v0.5 first-sale-approval rule preserves the finalized unit cost and its approval date. That information may be fields and preserved source allocations on InventoryItem or a separate cost snapshot; E44 identifies the optional record boundary. Acquisition cost exists independently of sale availability. The review recommends separating cost completeness/finalization from eligibility, so a collection unit never needs to be offered for sale merely to have a meaningful acquisition cost; the finalization policy remains to be confirmed.

## 3. Purchasing and supplier settlement

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E06 | **Supplier** | Person/business identity, required name/telephone/type, and purchase relationships. Its balance is derived. | Has Purchases, supplier Payments, Refunds, and applicable adjustments. | SUP-001–012, with supplier-credit references superseded by user clarification |
| E07 | **Purchase** | One Supplier order with lifecycle Open/Completed/Canceled, dates, explicit completion and expense-completeness confirmation. | Exactly one Supplier; has PurchaseItems and related business events/expenses. | PUR-001–015, PUR-028–041, PUR-045–046 |
| E08 | **PurchaseItem** | Order line grouping ordered units of one Product, with quantity and total merchandise price. Preserves the source of per-unit merchandise cost. | Exactly one Purchase; generates one InventoryItem per ordered unit. The Product is reached through those units, which must all share the same Product. | PUR-002–007; INV-006; user-confirmed Product linkage |
| E09 | **SupplierPayment** | Actual outgoing supplier merchandise payment: amount, date, method, Supplier, Organization. | Has SupplierPaymentAllocations across specific units, potentially from several Purchases of the same Supplier. | SUP-010–011; PUR-042–044 |
| E10 | **SupplierPaymentAllocation** | Amount of one SupplierPayment assigned to one identified ordered unit. Preserves allocation and correction history. | Exactly one SupplierPayment and InventoryItem; PurchaseItem/Purchase are traceable through the Item. | PUR-034, PUR-042–044 |
| E11 | **SupplierRefund** | Actual money received back from a Supplier, preserving its source and date. An expected refund remains an obligation until actually received. | Exactly one Supplier; links to affected payment/order funding through typed source relationships or settlement-source records. | SUP-009, SUP-011–012; PUR-029–033 |

SupplierPaymentAllocation must resolve to an individual Item ID even if entry is presented as a PurchaseItem allocation. A line-only allocation is insufficient when identical ordered units have different funding and receipt dates.

**Confirmed removal:** SupplierCredit and SupplierCreditApplication are outside the user's business model. Funding before receipt is established by SupplierPayments allocated to the physical unit. Money owed back by a Supplier remains traceable as an unresolved refund/settlement obligation until refunded or explicitly resolved under the loss rules; it is not a reusable supplier-credit balance. Supplier-credit references in SUP-009, SUP-012, PUR-026, PUR-029, and CALC-004 are superseded by this clarification.

## 4. Expenses and acquisition costing

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E13 | **PurchaseExpense / SaleExpense** | Actual costs owned by their Purchase or Sale, with amount/date/category and source context. This accepted ownership structure is part of the parent workflow, not a separate expense-management module. | A PurchaseExpense belongs to one Purchase and has unit cost allocations; a SaleExpense belongs to one Sale. Shared versus separate physical tables remains a schema choice. | PUR-016–024, PUR-035; FIN-001–007, FIN-009; user-confirmed ownership |
| E14 | **AcquisitionExpenseAllocation** | Amount of one PurchaseExpense assigned to one InventoryItem; records the chosen allocation method and exact result. | Exactly one PurchaseExpense and InventoryItem, with traceable PurchaseItem/Purchase. | PUR-018–021, PUR-024; INV-011 |
| E15 | **Expense payment information** | Evidence of actual settlement, including amount/date/method. Prefer embedded settlement fields on the owned expense when one settlement is sufficient. | Additional payment records are a conditional physical-design option if partial/batched expense settlement is actually required. | PUR-035; FIN-005–006 |

Acquisition and selling expenses are separate roles even if they share a physical Expense table. The accepted ownership model is Purchase → PurchaseExpenses and Sale → SaleExpenses. Both remain entered and displayed as part of their parent operation. Only acquisition expenses are allocated into individual acquisition costs. Selling expenses remain at Sale level and are not spread across models for model gross profit.

For example, R$200 merchandise plus R$20 freight across two equally priced units gives R$110 acquisition cost per unit. Preserving the R$20 expense and its allocation explains that cost without replacing the merchandise price. A business-paid R$10 selling expense reduces that Sale's net profit. One total expense field on a parent may be sufficient for a simpler approved workflow, but the existing specification explicitly requires individual acquisition-expense allocation and exact reconciliation.

The specification requires knowing that acquisition expenses are paid; it does not prescribe partial or batched expense-payment entry. A separate ExpensePayment table is therefore not a baseline recommendation. Add payment/allocation records only if the approved settlement workflow requires them. CALC-016 also mentions other business expenses without defining their entry workflow; this map does not assume a standalone operating-expense module.

## 5. Customers and sales

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E16 | **Customer** | Customer identity, contact information, address field(s), notes, and transaction relationships. Debt and refund obligations are derived; no reusable credit balance. | Has Sales, Payments, Refunds, and settlement history. Address is stored directly on Customer, per the user's confirmed decision. | CUS-001–016, with reusable-credit policy superseded; SAL-004 |
| E18 | **Sale** | Merchandise agreement for exactly one Customer, with dated lifecycle activity, whole-Sale dispatch facts, optional nonunique tracking code, and Sale-level expenses. | Has SaleItems, PaymentAllocations, Returns, and adjustment/settlement events. | SAL-001–028, SAL-036–050; retired SAL-029–035 excluded |
| E19 | **SaleItem** | One specific physical Item committed/sold in a Sale. Preserves agreed unit price, the finalized cost used in recognition, and its active/released/returned history. | Exactly one Sale and InventoryItem; may be referenced by CustomerPaymentAllocations, one physical ReturnItem, retained-income attribution, and financial adjustments. | SAL-001–008, SAL-019, SAL-038–043; INV-007; RET-004, RET-013; CALC-015; user-confirmed line-level funding support |

One InventoryItem can have many SaleItems over its lifetime because of cancellation, edits, Returns, and resale. There may be only one active Sale commitment for it at a time. Do not impose lifetime uniqueness on InventoryItem in SaleItem, or assume one permanent Sale relationship per physical unit.

A Sale's original item/price/cost facts must remain explainable after an edit. Preserve removed SaleItems and post dated changes or preserve versions; do not erase an old SaleItem to represent an exchange. The exact versioning structure follows the history design.

## 6. Customer funding, reallocation, and refunds

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E20 | **CustomerPayment** | Actual incoming merchandise amount recognized by the application, with date/method/Customer/Organization. Excludes customer-paid shipping. | Has CustomerPaymentAllocations across existing Sales and, where specified, their SaleItems, all of the same Customer/Organization. | PAY-001–012, PAY-019, PAY-030; FIN-003; user clarification |
| E21 | **CustomerPaymentAllocation** | Amount of a CustomerPayment applied to one Sale, optionally identifying a specific SaleItem within it, including auditable subsequent changes. | Exactly one CustomerPayment and Sale; optional SaleItem must belong to that Sale. Remains traceable through edits, cancellation, reallocation, and Returns. | PAY-002–020, PAY-030; user-confirmed Sale/SaleItem targets |
| E24 | **CustomerRefund** | Actual outgoing money to a Customer, with amount/date and original Sale/transaction provenance. An owed but unpaid refund remains pending settlement, not actual cash or reusable credit. | References the originating Sale and relevant original funding, potentially through several typed source allocations. | PAY-021–029, PAY-033, PAY-036; CUS-011–012, with credit policy superseded |

SupplierPaymentAllocation targets an ordered physical unit. CustomerPaymentAllocation targets a Sale and may identify one of its SaleItems. One conceptual representation is mandatory `sale_id` plus optional `sale_item_id`, enforced to belong to that Sale; the physical design may choose equivalent typed relationships. A line-specific allocation contributes once to its Sale's funding, never as both a Sale allocation and a second line allocation. Sale-level and line-level allocations together must not overfund either applicable obligation.

CustomerRefund cannot be limited to a single original Payment foreign key: a Sale can have several Payments and prior reallocations. Preserve funding provenance across settlement; E36–E37 describe a possible structure. Reassigning an allocation preserves the original CustomerPayment and creates no incoming cash.

**Confirmed removal:** CustomerCredit and CustomerCreditApplication are not supported. New Payments must be fully allocated at entry. When an edit, cancellation, or Return releases a previously allocated amount owed to the Customer, it must be refunded or explicitly reallocated to another eligible existing Sale/SaleItem of that same Customer and Organization as part of resolving the operation. It cannot be parked for an unknown future Sale. RetainedIncome remains a separate, agreed economic outcome for amounts legitimately earned by the business, not customer money held for future use.

A R$40 Payment against a R$100 Sale creates R$60 debt and no credit. A fully paid R$100 Sale later reduced to R$80 frees R$20: refund it or transfer its allocation to an eligible existing Sale/SaleItem. The R$20 cannot be refunded and reallocated simultaneously. If refund disbursement is not instantaneous, preserve an explicit pending refund obligation within the originating settlement, exclude it from available funding, and record actual CustomerRefund cash only when paid. This is a refund obligation, not a wallet. Refund scheduling details remain a workflow choice.

Reusable-credit wording in PAY-012–013, PAY-031–036, CUS-006–016, SAL-021–022, RET-007, ORG-009, and CALC-003 is superseded where it conflicts with this policy; their allocation, audit, refund, and retained-income requirements otherwise remain.

## 7. Returns and retained income

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E25 | **Return** | Authorized registration of physically returned units from one original shipped Sale; records date, actor, and the business operation tying inventory and financial effects together. | Exactly one Sale; contains ReturnItems and related settlement/financial events. | RET-001–003, RET-006–012 |
| E26 | **ReturnItem** | One original SaleItem physically received back, with return-time condition and explicit eligibility decision. The original persistent Item ID remains traceable. | Exactly one Return and original SaleItem; that SaleItem identifies the InventoryItem. | RET-004–005, RET-008–009, RET-012–013; INV-028 |
| E27 | **RetainedIncome** | Amount actually received and validly retained after a Sale cancellation/Return or applicable edit, separately from reversed Sale revenue. | References its originating business/settlement event and Sale; has model attribution records. | PAY-024, PAY-033–035; RET-011 |
| E28 | **RetainedIncomeAllocation** | Part of RetainedIncome attributed to an affected SaleItem and therefore its Product/model. | Exactly one RetainedIncome and affected SaleItem; allocations reconcile to the retained total. | PAY-034; COL-020; CALC-015–016 |

A ReturnItem refers to the original SaleItem, not just a Product or an Item ID. This disambiguates returns after the same physical Item has been sold, returned, and sold again. The same original SaleItem cannot have two physical Returns. A later resale creates another SaleItem which may independently be returned.

Cancellation and Return remain different business events. An unshipped cancellation has no ReturnItem or invented physical receipt. Partial Returns only affect the referenced original SaleItems.

RetainedIncome and RetainedIncomeAllocation are accepted. For a paid R$100 Return with R$70 actually refunded and R$30 legitimately retained by agreement, the R$30 is earned income. The original Sale economics are reversed and the retained amount is recognized once. RetainedIncomeAllocation explains which affected model earned that R$30 when several models are involved. The allocation can be represented by income lines instead of a separate header-plus-allocation pair of tables. Retention is never an automatic substitute for refunding customer money.

## 8. Losses and item-level collection membership

| ID | Entity | Information and responsibility | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E29 | **Loss** | Explicit physical/financial write-off: amount/date/reason, source relationships, and one linked inventory/financial consequence. Preserves any later dated void/reversal. | Relates to the relevant InventoryItem, Purchase, Sale, or lost funding. Actual later refunds reference the original source/Loss where applicable. | LOS-001–008; PUR-031–033; user removal of LossRecovery |

**Collection membership is an InventoryItem property**, such as `InventoryItem.is_collection`. Each Organization has exactly one implicit collection: the set of its designated InventoryItems. There is no Collection entity, collection selector, Product collection flag/pointer, or standalone CollectionDesignation entity in the baseline.

Collection additions/removals preserve their business date, actor, and previous/current membership through shared history. InventoryItem identifies the Product and Organization; no separate Product-to-collection relationship is required. A collection item cannot have an active Sale commitment. Removing membership does not by itself grant sale eligibility or choose a replacement.

**Confirmed cardinality:** within an Organization, at most one InventoryItem of a given Product may have `is_collection = true` at a time, preserving COL-002. Enforce uniqueness of the Organization/Product pair among current collection members, including concurrent designation operations. Changing the designated copy must remove the previous membership before or atomically with adding the replacement, while preserving both dated changes. A Product may have no collection item, and removing one does not select a replacement automatically. Historical cost presentation on membership changes remains D02.

**LossRecovery is removed.** The user's delete/remove-loss operation is represented by a dated void/reversal of the Loss and its applicable consequences, preserving audit and prior-period facts. Physical stock consequences must be resolved consistently under the correction rules. A physical Loss and its cost write-off describe the same economic loss and are recorded once.

If actual money is later received, retain its ordinary source record rather than inventing a recovery entity. For example, a R$100 supplier deposit written off and later refunded by R$40 is represented by the original Loss and a linked, dated R$40 SupplierRefund with the appropriate loss adjustment: net loss across both dates is R$60. A void/reversal alone never claims cash was received, and the same adjustment must not be counted again as a second refund or income. No insurance functionality is introduced.

## 9. Required history and financial information

The accepted direction is preserved dated source transactions/adjustments plus **one shared BusinessEvent/action/audit history structure**. Item timelines and financial views derive from those facts. A current-state table plus a generic technical audit log is insufficient unless historical business facts and dates remain reliably queryable.

| ID | Record concept | Information to preserve | Main relationships | Requirement basis |
| --- | --- | --- | --- | --- |
| E32 | **BusinessEvent / shared action history** | A dated administrator business action, its type, Organization, actor, recording time, reason/context, changed facts, typed source references, and adjustment/reversal provenance. Covers purchase/receipt/approval/edit/cancellation/dispatch/Return/Loss/collection actions. | Connects the authoritative sources, affected InventoryItems, allocation changes, and settlement consequences. Typed detail/link records can supplement shared storage where necessary. | REQ-003, REQ-006–007, REQ-010–012; INV-026; FIN-011; accepted shared-history recommendation |
| E33 | **ItemHistoryEntry — derived timeline** | Item-specific dated facts: receipt, condition change, approval, hold/release, commitment/release, dispatch, Return, order removal, collection membership, or disposition. | Query/view over InventoryItem-linked source facts and shared history; no independent baseline entity/table. | INV-012–019, INV-026–031; SAL-010; RET-005–009 |
| E34 | **FinancialEffect — derived reporting view** | Dated signed economic components: merchandise revenue, matched unit cost, selling expense, retained income, explicit loss, and adjustments, with attribution through source InventoryItems/SaleItems. | Derives from dated source facts and reversals; no independent editable ledger or mandatory table. | SAL-024–026; FIN-005–012; CALC-006, CALC-010, CALC-015–018 |
| E35 | **AuditEntry — shared-history responsibility** | Who recorded or authorized a change, when, why, and the original/changed facts needed for audit. | Stored with E32's action history and typed details as needed, rather than a second mandatory audit entity/table. | REQ-002–003, REQ-010; SUP-011; PAY-017–020; COL-008 |

FinancialEffect describes required dated reporting information. It can be represented by typed source-event facts or a rigorously derived projection; it does not require an additional independent editable ledger. If financial effects are materialized, they must reconcile to the authoritative sources and must not be counted a second time alongside those sources.

**Accepted implementation direction:** BusinessEvent and AuditEntry share action/history storage with distinct business-date, recorded-time, actor, and change details. ItemHistoryEntry is a timeline query; FinancialEffect is a reporting projection over preserved dated sources. A materialized financial projection is conditional on a demonstrated implementation need. This does not mandate event sourcing or four history tables. Database transactions enforce atomicity; merely recording a BusinessEvent does not make the operation atomic.

Separate **business event date** from **recorded timestamp**. In particular, October Sale recognition and a November reversal remain separate dated facts. A technical audit timestamp alone does not replace that distinction. Decide the representation of corrected original records and links to reversal components under the exceptional correction policy.

## 10. Supporting and conditional design candidates

These records may make the eventual schema clearer. Their existence as separate entities/tables is not approved business scope.

| ID | Candidate | When it is useful | Boundary / unresolved choice |
| --- | --- | --- | --- |
| E36 | **FinancialSettlement** | Groups the resolution of an edit, cancellation, Return, or supplier-order adjustment: affected funding and its refund, reallocation, retained-income, or unrecovered-loss outcomes. Can hold an explicit pending refund obligation, never reusable credit. | Could be typed BusinessEvent details. Keep customer and supplier contexts explicit and preserve actual settlement completion separately from refund percentage. |
| E37 | **SettlementSourceAllocation** | Traces the amount resolved from each original PaymentAllocation into a refund, reallocation to an existing Sale/SaleItem, retention, or write-off. | Typed funding/source relationships can replace a generic entity. Must support several sources without choosing D01's partial-Return allocation order. Avoid unchecked string-based `source_type/source_id` links as the only referential-integrity mechanism. |
| E39 | **OpeningAcquisition** | Provides an explicit acquisition source for imported units that have no reliable historical Purchase records. | Conditional on actual spreadsheet data and the approved migration design. A marked opening Purchase structure is another option. Preserve unknown historical dates and do not fabricate cash transactions. |
| E40 | **ImportBatch** | Identifies a spreadsheet import attempt, source, validation/execution status, actor, and reconciliation results. | Recommended migration-operation record; does not add an ongoing user-facing import-management product. |
| E41 | **ImportRow** | Stores source-row mapping, validation errors, approved assumptions, and created Item/acquisition references; Product is traceable through Item. | Can be a validation artifact instead of a permanent table if it still supports source reconciliation and rerun safety. |
| E42 | **Product image values** | Optional images stored as Product catalog information. | No standalone ProductImage entity in the baseline. Image presentation/storage follows D04 and technical design. |
| E43 | **Brand value** | Required Product field. | No standalone Brand entity or brand-management feature in the baseline. |
| E44 | **ItemCostSnapshot** | Holds the finalized unit acquisition amount, first-approval date/event, and the contributing source/allocation version. | Could be preserved fields and locked allocations on InventoryItem. Snapshot/version records become useful if D06 permits later exceptional cost corrections. |

General shared abstractions such as Party, MoneyTransaction, PaymentMethod, ExpenseCategory, Address, or MediaAsset can be evaluated during physical design. They are not additional business requirements. If money records share storage, retain their distinct meaning and count each actual cash movement once.

Authentication sessions/recovery tokens and backup/deployment metadata belong to technical implementation. No additional inventory-business entity is implied by the authentication, hosting, or daily-backup requirements.

## 11. Core relationship map

This diagram shows the persistent identity and transaction relationships. All business records belong to the same applicable Organization; most ownership edges are omitted, while InventoryItem ownership is shown to explain collection scope. Diagram relationships include historical rows, including removed SaleItems and ordered units.

```mermaid
erDiagram
    USER ||--o{ MEMBERSHIP : has
    ORGANIZATION ||--o{ MEMBERSHIP : authorizes
    SUPPLIER ||--o{ PURCHASE : supplies
    PURCHASE ||--|{ PURCHASE_ITEM : contains
    PURCHASE_ITEM ||--|{ INVENTORY_ITEM : creates
    PRODUCT ||--o{ INVENTORY_ITEM : identifies_model
    ORGANIZATION ||--o{ INVENTORY_ITEM : owns
    INVENTORY_ITEM {
        boolean is_collection
    }
    CUSTOMER ||--o{ SALE : purchases
    SALE ||--|{ SALE_ITEM : preserves
    INVENTORY_ITEM ||--o{ SALE_ITEM : sold_and_resold_as
    SALE ||--o{ RETURN : has
    RETURN ||--|{ RETURN_ITEM : contains
    SALE_ITEM ||--o| RETURN_ITEM : physically_returned_as
```

For imported units, PURCHASE_ITEM → INVENTORY_ITEM may be replaced by the approved equivalent opening-acquisition relationship. An ordinary ordered unit always has its originating PurchaseItem. Purchase and Sale historical lines are retained even when no active units remain.

An Organization's single collection is its InventoryItems where `is_collection` is true, with at most one such item per Product in that Organization. Membership changes live in shared dated history; a collection table is unnecessary. Every transactional path to Product runs through InventoryItem.

## 12. Payment, cost, and income relationships

```mermaid
erDiagram
    SUPPLIER ||--o{ SUPPLIER_PAYMENT : receives
    SUPPLIER_PAYMENT ||--|{ SUPPLIER_PAYMENT_ALLOCATION : distributes
    INVENTORY_ITEM ||--o{ SUPPLIER_PAYMENT_ALLOCATION : funded_by
    PURCHASE ||--o{ PURCHASE_EXPENSE : owns
    PURCHASE_EXPENSE ||--|{ ACQUISITION_EXPENSE_ALLOCATION : distributes
    INVENTORY_ITEM ||--o{ ACQUISITION_EXPENSE_ALLOCATION : receives_cost
    SALE ||--o{ SALE_EXPENSE : owns
    CUSTOMER ||--o{ CUSTOMER_PAYMENT : makes
    CUSTOMER_PAYMENT ||--|{ CUSTOMER_PAYMENT_ALLOCATION : distributes
    SALE ||--o{ CUSTOMER_PAYMENT_ALLOCATION : funded_by
    SALE_ITEM |o--o{ CUSTOMER_PAYMENT_ALLOCATION : optionally_identifies_line
    CUSTOMER ||--o{ CUSTOMER_REFUND : receives
    SUPPLIER ||--o{ SUPPLIER_REFUND : sends
    RETAINED_INCOME ||--|{ RETAINED_INCOME_ALLOCATION : attributed_through
    SALE_ITEM ||--o{ RETAINED_INCOME_ALLOCATION : explains_model
```

Allocation diagrams show the existence and traceability of historical allocations. The **entry-time** requirement is that every new customer or supplier Payment is fully allocated. Later corrections/reclassification must preserve original allocations and their subsequent consequences; this diagram does not require an adjusted Payment to retain the original set of *active* allocations unchanged.

Additional important relationships:

- PurchaseExpense → its Purchase context; AcquisitionExpenseAllocation → specific units from the applicable acquisition context. The specification does not yet define a special cross-Purchase freight-allocation workflow.
- Sale → its SaleExpenses. These expenses have no model-allocation relationship.
- CustomerPaymentAllocation → a Sale and optionally a SaleItem within that Sale; Sale totals count the allocation only once.
- CustomerRefund → original Sale and relevant funding transactions; SupplierRefund → Supplier and original order/payment funding, and Loss when applicable.
- Customer funding reallocation → original allocation and the replacement allocation on an eligible existing Sale/SaleItem. No new cash or credit source is created.
- RetainedIncome → originating settlement/event and Sale; attribution goes through affected SaleItems to Products.
- Shared BusinessEvent history → typed sources, affected InventoryItems, and allocation/settlement consequences.
- Dated source reversal → original source component, enabling partial reversal without destroying history. FinancialEffect is the derived reporting view of these facts.

## 13. Information that is derived rather than an independent source entity

| Concept | Representation |
| --- | --- |
| Reservation | A Sale with positive outstanding balance before dispatch. No separate Reservation entity. |
| In Garage | Derived fully funded, unshipped Sale/Item state. No Garage or stock-location entity. |
| Active Item commitment | Enforced relationship between an InventoryItem and active SaleItem. A separate commitment table is optional, not a second reservation source. |
| Current catalog availability | Projection of physical presence, approval/eligibility, collection/hold/disposition, and active commitment. |
| Public catalog listing | Projection of approved public Product/InventoryItem data. A merchandising Listing entity is not required. |
| Customer account / balance | View of Sales, Payments, allocations/reallocations, refunds, pending refund obligations, and adjustments. No reusable customer credit or manually editable balance authority. |
| Supplier account / balance | View of active unit commitments, Payments, allocations, Refunds, and adjustments. Supplier credit is excluded by the user's clarification. |
| Purchase payment/receipt progress | Derived from individual active units and their funding/receipt facts, separately from Purchase lifecycle. |
| Sale refund percentage | Derived None/Partial/Full classification, separately from cancellation/Return and settlement-completion state. |
| Inventory/Product quantities | Aggregations of active ordered/on-hand/available/committed/shipped/disposed/removed units. |
| Organization's collection | Its InventoryItems with collection membership set; one implicit collection per Organization and at most one collection item per Product. Product/model totals group these units through InventoryItem.product_id. |
| Item acquisition/landed cost | Merchandise allocation plus applicable actual acquisition-expense allocations; finalized information is preserved at first sale approval. |
| Profit and model/whole-collection recovery | Dated calculations over agreed source facts and corrections. No manually maintained Profit or CollectionCost balance entity. |
| Dispatch | Sale-level dispatch facts and event, with optional nonunique tracking code. No independent parcel/carrier/location hierarchy is required. |
| Purchase/Sale cancellation | Typed business event with preserved source and financial consequences; a standalone cancellation header is an optional physical boundary. |
| Approval, hold, receipt, soft removal | Dated item/business facts, which may be typed history records rather than separate aggregate roots. |
| Item timeline and audit view | Queries over preserved dated sources and shared BusinessEvent/action/audit history. |
| Loss removal | Dated void/reversal of Loss and its applicable consequences. No separate LossRecovery entity. |

Derived values can be cached for performance, but source records remain authoritative and caches must reconcile. The public catalog is read-only for visitors.

## 14. Relationship constraints to preserve during schema design

1. Every business reference stays within one Organization. Customer funding, reallocation, and refunds also stay within one Customer; supplier allocations stay with the applicable Supplier.
2. An InventoryItem retains its identity, one Product, and exactly one valid acquisition provenance. Units generated by a PurchaseItem share the same Product; transactions reach that Product through InventoryItem.
3. One PurchaseItem generates one physical Item identity per ordered unit. Soft removal retains historical identities and decreases active quantities without deleting source relationships.
4. One physical Item has at most one active Sale commitment, enforced under concurrency. Historical SaleItems and resale remain allowed.
5. One original SaleItem can be physically returned only once. ReturnItem must belong to the same original Sale as its Return header.
6. Supplier payment allocations resolve to individual units; customer payment allocations resolve to Sales and may identify a SaleItem within the same Sale. A line allocation counts once toward Sale funding. Both preserve exact amounts and correction history.
7. At Payment entry, allocations reconcile exactly to the new amount and do not exceed relevant outstanding obligations. Internal reallocations never create cash.
8. Acquisition-expense and retained-income allocations reconcile exactly to their respective source totals, using deterministic BRL rounding.
9. No customer funds may remain as reusable credit. Released funding owed back must be refunded or reallocated to an eligible existing Sale/SaleItem, never consumed twice or counted as new cash. Any pending refund is tied to the originating settlement and unavailable for future spending. Debt remains nonnegative.
10. Each Organization has one implicit collection, with membership on InventoryItem and dated changes in shared history. At most one current collection item exists per Organization/Product pair, enforced under concurrency. Collection membership is optional for a Product. A collection item cannot have an active Sale commitment.
11. First approval preserves the finalized cost and blocks ordinary later cost changes; Sale recognition keeps the specific cost basis used. Exceptional correction mechanics remain D06.
12. Physical receipt requires merchandise funding and applicable acquisition expenses to be settled. Receipt does not imply sale approval.
13. Purchase cancellation must be rejected if any unit was ever physically received; current stock alone cannot establish eligibility.
14. Each edit, cancellation, Return, Loss, and settlement operation preserves originals and creates all required consequences atomically, once.
15. Original recognition and adjustment dates remain independently queryable. Actual Customer cash timing does not change recognized Sale/collection profit.
16. Removing a Loss preserves a dated void/reversal and resolves applicable stock/financial consequences atomically. An actual later refund uses the existing money-source record; neither reversal nor reporting may duplicate that cash or its economic adjustment.

Some constraints require transaction-level validation as well as foreign keys or unique indexes. This map defines the invariant; engine-specific enforcement belongs to physical schema design.

## 15. Open boundaries before finalizing columns and constraints

| Open topic | Affected records | What remains unresolved |
| --- | --- | --- |
| [D01 — partial-Return funding order](https://github.com/WilliamPhilippe/storage-minis-be/issues/15) | ReturnItem, CustomerPaymentAllocation, settlement-source relationships | Which original Payment allocations are reduced/reclassified first and how amounts are attributed to returned units, particularly where funding was only Sale-level. No reusable credit sources remain. Do not choose FIFO/LIFO implicitly. |
| [D02 — historical collection membership](https://github.com/WilliamPhilippe/storage-minis-be/issues/16) | InventoryItem membership history and report projections | Which historical collection cost is presented after membership changes; a shared history implementation does not settle this reporting policy. |
| [D03 — negative recovery profit](https://github.com/WilliamPhilippe/storage-minis-be/issues/17) | Dated financial source facts and collection projections | Negative eligible profit's treatment in model and pooled recovery formulas. |
| [D04 — catalog contract](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) | Product catalog values and InventoryItem | Exact public fields, image presentation, search, and filters. |
| [D05 — reports and average-cost basis](https://github.com/WilliamPhilippe/storage-minis-be/issues/19) | Cost source/snapshot data and report projections | Launch reports and which costs/units form the average acquisition-price basis. |
| [D06 — exceptional corrections](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Cost snapshots, allocations, BusinessEvent, original source records and financial projections | Permitted corrections, authority, version/reversal links, and dated consequences, including valid Loss removal when later activity exists. |
| Collection cost completeness before any sale approval | InventoryItem cost information and collection membership history | Acquisition cost exists independently of eligibility. The remaining issue is when a never-for-sale collection unit's cost becomes complete/locked, not whether another unit's approval changes its collection cost. A separate completeness/finalization policy is proposed. |
| Legacy acquisition representation | OpeningAcquisition or marked opening Purchase structure, import records | Actual spreadsheet evidence and approved treatment of missing acquisition/payment history. |
| Money and business dates | All money, allocation, and dated-history records | Exact precision/remainder allocation, business timezone, and effective/recorded-date representation. All operational amounts remain BRL. |

Entity discovery can proceed with these boundaries identified. A subsequent logical-schema pass should choose keys, column ownership, nullability, relationship enforcement, history representation, and indexes, followed by the engine/ORM-specific schema.
