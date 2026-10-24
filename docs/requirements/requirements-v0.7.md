# Estoque164 — Full Requirements Specification

**Version:** 0.7

**Status:** Consolidated business requirements — core lifecycle decisions agreed; identified open decisions remain

**Supersedes:** [v0.6](requirements-v0.6.md)

**Product:** Inventory, sales, financial tracking, collection management, and customer catalog for 1/64 miniature sellers and collectors.

**Scope of this revision:** A PurchaseExpense is an organization-owned entity linked to one or more Purchases, with amounts allocated directly to selected InventoryItems. Carries forward v0.6 decisions and D01–D08; adds PUR-047–049. There are 307 active and nine retired requirement IDs. No application implementation is implied.

**Historical source:** [GitHub issue #2 — Estoque164 v0.5 requirements baseline](https://github.com/WilliamPhilippe/storage-minis-be/issues/2).

**Decision baseline:** User-confirmed modeling, Product-scope and shared-PurchaseExpense decisions recorded on 2026-10-21; [accepted decisions](model-review.md).

**Repository edition:** 2026-10-21.

**Current baseline tracker:** [#82](https://github.com/WilliamPhilippe/storage-minis-be/issues/82).

**Related documents:** [Entity and relationship map v0.7](entity-map-v0.7.md); [accepted entity-model decisions](model-review.md).

> **Current consolidated baseline:** This edition supersedes the single-Purchase expense ownership in v0.6. Historical v0.5/v0.6 files and their baseline issues remain unchanged. Eight business decisions in Section 14 still require explicit outcomes. Acceptance scenarios are requirements, not evidence of implemented behavior.

## 1. Project objectives and principles

Estoque164 manages a miniature business and its owner's personal collection in the same application. It tracks orders, incoming items, inventory, sales, customer reservations, payments, expenses, losses, supplier/customer accounts, and collection-cost recovery. Its public catalog shows only approved and available-for-sale physical items.

### General requirements

- **REQ-001 — Derived metrics:** Financial metrics, balances, quantities, average prices, profit/loss, and collection costs are calculated from authoritative source records, not manually maintained balances.
- **REQ-002 — Historical integrity:** Current item status, condition, asking price, or sale edits must not overwrite historical transaction facts.
- **REQ-003 — Auditability:** Cancellations, Returns, refunds, allocations, Losses, and corrections preserve dated history. Use shared BusinessEvent/action/audit history with actor, business date, recorded time, reason, source links, changed facts, and reversal provenance. Item timelines and financial effects are derived views; separate history tables or event sourcing are not mandated. Shared Product changes have global scope and provenance without an owning Organization.
- **REQ-004 — Multi-organization support:** The model supports multiple organizations, despite a single initial administrator.
- **REQ-005 — Manual sales:** Sales are initially entered by an authorized administrator; there are no external sales-platform integrations.
- **REQ-006 — Source of truth:** Purchase records, individually identified InventoryItems, SaleItems, Payments, allocations, organization-owned PurchaseExpenses, Sale-owned SaleExpenses, refunds, Losses, retained income and its allocations, and business events are authoritative sources. A PurchaseExpense can concern several Purchases; its cost is allocated to InventoryItems. No reusable supplier or customer credit is supported.
- **REQ-007 — Consistency:** Source-record changes produce consistent downstream quantities, balances, and reports.
- **REQ-008 — Single currency:** All amounts entered and reported in Estoque164 are **BRL**. The application does not perform currency conversion, store operational foreign-currency equivalents, or select FX rates. The administrator is responsible for determining the correct BRL amount before entry.
- **REQ-009 — Individual item identity:** Each physical unit has one persistent Item ID, assigned **when ordered/purchased**, including a preorder or direct order; the ID is never reused. Sale Items identify particular Item IDs rather than only Product plus quantity.
- **REQ-010 — Atomic business events:** A single administrator action must generate all required corresponding inventory movements, financial changes, allocations, audit entries, and dependent recalculations as one logical, all-or-nothing operation. The administrator must not have to manually create multiple secondary records for a single event.
- **REQ-011 — Event-dated reversals:** Subsequent edits, cancellations, returns, and corrections preserve original dated activity and record their adjustments on the date the adjustment occurs. Historical reporting must not silently backdate or rewrite these effects.
- **REQ-012 — Separated dimensions:** Physical possession, inventory eligibility, customer-sale commitment, payment status, purchase status, and shipment status must not be conflated merely because the UI presents concise labels.

## 2. Organizations and users

- **ORG-001:** Support multiple organizations.
- **ORG-002:** InventoryItems, Customers, Suppliers, transactions, allocations, expenses, and collection membership belong to one Organization. Product is a global shared catalog record with no owning Organization; User is an identity and Membership connects User to Organization.
- **ORG-003:** Users may belong to multiple organizations in a future version.
- **ORG-004:** The initial installation has one administrator.
- **ORG-005:** Only authorized administrators may create or modify business records and financial facts. Authorized Product registration creates a shared Product; permissions for editing an existing shared Product require the D07 policy.
- **ORG-006:** Public visitors cannot create or modify Sales, reservations, payments, inventory, or other system records.
- **ORG-007:** Customer-private information is never publicly exposed.
- **ORG-008:** Each Organization’s operational and private records are isolated from other Organizations. All Organizations may find, view, and select global Products; this exception grants no access to another Organization’s units or operations.
- **ORG-009:** Payments, purchase/sale allocations, refunds, and Item commitments stay within the correct Organization. Customer funding can only pay Sales/SaleItems of that same Customer and Organization; cross-customer account transfers are unsupported. Referencing a global Product is permitted across Organizations.

The [technical direction record](technical-direction.md) captures the subsequently approved Google-only Firebase sign-in, ID tokens, active-use refresh, explicit logout, and initial administrator identity. Remaining session, bootstrap, recovery, and detailed authorization design belongs to T02; Membership and Organization isolation still apply.

## 3. Products and models

A **Product** is a global miniature-model identity shared by every Organization, independent from individually ordered or owned units. It has no owning Organization. Unit stock, prices, costs, private notes, and transactions remain within the owning Organization.

- **PRO-001:** Product name is mandatory.
- **PRO-002:** SKU is mandatory, **but not globally unique**; uniqueness is not enforced by this specification.
- **PRO-003:** Brand is mandatory.
- **PRO-004:** Other Product fields are optional unless specified otherwise.
- **PRO-005:** Each Product has a unique global internal Product ID, separate from SKU.
- **PRO-006:** Optional descriptions, images, scale, product codes, and other catalog information are supported.
- **PRO-007:** Multiple physical InventoryItems, including units owned by different Organizations, may reference the same global Product ID. Operational records reach Product through InventoryItem; a PurchaseItem groups units of the same Product.
- **PRO-008:** Product identity is separate from individual condition, acquisition cost, asking price, and transaction history.
- **PRO-009:** A Product need not have a collection InventoryItem in any Organization. Collection membership belongs to an InventoryItem, not Product.
- **PRO-010:** Shared Product metadata is separated from organization-private notes, costs, condition, unit asking prices, and transaction history. Store unit-private information on organization-owned records. D07 must decide any private model notes independent of a unit; D04 defines the public allowlist.
- **PRO-011:** Within the applicable Organization, Product counts distinguish active ordered/owned units, physically on-hand units, and units available for sale. Global catalog model count is a separate measure and does not imply owned stock.
- **PRO-012:** Registering Product P through Organization A makes the same global Product ID immediately available to every Organization to find, view, and select for its own InventoryItems. No copy, sharing grant, or membership in A is needed.
- **PRO-013:** Product has no owning organization_id. Product registration and access require no owned InventoryItem; registration provenance does not confer ownership. InventoryItems and operational/private data remain organization-owned.

The final list of public catalog fields and filters is still open.

## 4. Inventory and individually identified items

An **Inventory Item** represents exactly one ordered physical miniature. It receives its permanent Item ID upon inclusion in a Purchase, even if it will arrive months later. Identical Products can have different Item IDs, costs, conditions, prices, and histories.

### Required item information and relationships

- **INV-001:** Each ordered unit has a unique, persistent Item ID created at order/Purchase registration. Physical receipt does not create another identity for that same unit.
- **INV-002:** Each InventoryItem belongs to exactly one Organization and references one global Product. Different Organizations may own distinct units of the same Product.
- **INV-003:** Items record sealed/open condition when known or applicable.
- **INV-004:** Items record whether they have damage when known or applicable.
- **INV-005:** Item state and collection designation are tracked without conflating ownership, possession, sale commitment, and eligibility.
- **INV-006:** Every Item retains its originating Purchase Item or equivalent acquisition relationship.
- **INV-007:** Every Item retains its Sale Item relationships and prior sale/return history, including possible resale after return.
- **INV-008:** Organization-private unit notes and descriptions are supported on InventoryItem; sharing Product does not share these notes.
- **INV-009:** Current asking price is supported when applicable.
- **INV-010:** Current asking price is independent of agreed historical Sale Item prices.
- **INV-011:** Acquisition cost derives from the originating merchandise purchase price plus all applicable AcquisitionExpenseAllocations for that specific InventoryItem, including PurchaseExpenses shared across several Purchases. Linking an expense to a Purchase alone does not add cost to every unit in that Purchase.
- **INV-012:** Acquisition records and Item ID persist through receipt, sale, return, cancellation, collection changes, loss, and eligible soft deletion.

### Condition and approval

- **INV-013:** Damage is a condition attribute, not an availability status.
- **INV-014:** Updating damage information does not itself change sale availability.
- **INV-015:** Damage and descriptions appear in the administrator's item card and, when relevant, the catalog.
- **INV-016:** Identical Products can have individually different sealed/open and damaged/undamaged conditions.
- **INV-017:** The administrator decides whether a received/returned Item may be offered for sale regardless of its damage attribute.
- **INV-018:** Physical receipt does not automatically make an Item available for sale.
- **INV-019:** The administrator must explicitly approve a received Item before its first public sale listing; this may be presented as Mark Available. The Return workflow has its own explicit condition/availability confirmation. Approval of another unit never changes this unit’s cost.

### Item states and eligibility

| Conceptual state | Meaning | Public catalog |
|---|---|---|
| **Awaiting Arrival** | Purchased/ordered, permanent Item ID assigned, not physically received | No |
| **Received — Not Approved** | Physically received, not approved for sale | No |
| **Available** | Physically present, approved for sale, not committed elsewhere | Yes |
| **Held for Appreciation** | Owned and withheld from sale | No |
| **Personal Collection** | Designated collection Item, unavailable for ordinary sale | No |
| **Reserved** | Committed to an active Sale with outstanding customer debt | No |
| **In Garage** | Committed to a fully paid but unshipped Sale; still physically on hand | No |
| **Shipped** | Dispatched to a customer | No |
| **Lost / Disposed** | Removed from sellable stock through a recorded event | No |
| **Order Item Removed** | Unreceived, unpaid ordered Item soft-deleted from an Open Purchase | No |

The catalog displays Items only when their **effective** state is Available. Reserved and In Garage may be derived from the associated active Sale rather than independently editable item fields.

- **INV-020:** Awaiting Arrival Items cannot appear as available and cannot be sold in v1; customer preorder sales are unsupported.
- **INV-021:** Items committed to **any** active Sale, whether Reserved or In Garage, must be absent from the available catalog.
- **INV-022:** Held-for-appreciation items remain owned inventory and count in applicable inventory-cost reporting.
- **INV-023:** Held items may be released for sale without losing their history.
- **INV-024:** A designated collection Item cannot be sold until the designation is removed and the Item is approved for sale.
- **INV-025:** The same Item ID cannot belong to more than one active Sale commitment. This must be enforced even under simultaneous operations.
- **INV-026:** Current state must be distinguishable from chronological historical events.
- **INV-027:** Catalog availability is immediately restored for an eligible previously approved Item when it is removed from an **unshipped** Sale or its unshipped Sale is canceled, as part of the same atomic operation.
- **INV-028:** Returning a shipped Item requires registration of physical receipt, its updated condition, and an administrator availability decision before it becomes available in the catalog.
- **INV-029:** Within each Organization, Item counts separately derive (a) active ordered/not received, (b) on hand including Received, Available, Held, Collection, Reserved and In Garage, (c) available for sale, (d) shipped/disposed, and (e) soft-deleted items excluded from active counts. Other Organizations’ units are excluded even when Product is shared.
- **INV-030:** An Item's acquisition cost is finalized and locked against ordinary changes **when approved and first made available for sale**; sold Items retain that finalized cost.
- **INV-031:** Ordinary order editing may soft-delete only an unreceived Item with **zero allocated supplier payment**; the Item ID and history remain. Paid or partially paid unreceived Items require settlement/correction of their payments before removal. Received Items cannot be removed from their Purchase through ordinary editing.

### Permitted Item transitions

| From | To | Condition / event |
|---|---|---|
| Purchase registered | Awaiting Arrival | Assign one ID per ordered unit |
| Awaiting Arrival | Received — Not Approved | Full item supplier payment and applicable acquisition expenses settled; receive unit |
| Awaiting Arrival | Order Item Removed | Purchase Open; no receipt and no supplier payment allocated |
| Received — Not Approved | Available | Administrator approves; Item acquisition cost finalized |
| Available | Held for Appreciation | Administrator holds Item |
| Held for Appreciation | Available | Administrator releases Item |
| Received — Not Approved / Available | Personal Collection | Explicit designation; cannot be in active Sale; sale approval is not required solely to join the personal collection |
| Personal Collection | Available, or Received — Not Approved | Remove designation; enter Available only after sale approval (which also finalizes acquisition cost) |
| Available | Reserved | Added to unpaid active Sale |
| Available | In Garage | Added to fully paid Sale |
| Reserved | In Garage | Sale outstanding balance becomes zero |
| In Garage | Reserved | Authorized unshipped Sale edit increases outstanding balance |
| Reserved / In Garage | Available | Canceled Sale or Item removed by editing; Item remains eligible |
| In Garage | Shipped | Administrator records actual dispatch |
| Shipped | Available, or Received — Not Approved / otherwise withheld | Return physically received; condition updated; administrator selects eligibility |
| Eligible owned Item | Lost / Disposed | Explicit event and single corresponding financial write-off |

There is only one inventory location. **In Garage is a Sale/Item operational status, not a feature for managing stock locations.**

## 5. Suppliers

A Supplier can be a store/business or a private individual.

- **SUP-001:** Supplier name is required.
- **SUP-002:** Supplier phone number is required.
- **SUP-003:** Supplier type (person or store/business) is required.
- **SUP-004:** Every Purchase references exactly one Supplier.
- **SUP-005:** A Purchase cannot be created without its Supplier.
- **SUP-006:** A Supplier may have many Purchases.
- **SUP-007:** Historical Supplier–Purchase links persist.
- **SUP-008:** Administrators can review Supplier purchase history.
- **SUP-009:** Supplier balances derive from active commitments, actual supplier Payments, refunds, and dated adjustments. Supplier credit and future-Purchase credit applications are unsupported.
- **SUP-010:** A supplier payment may cover multiple Purchases and multiple individually ordered Items. Multiple supplier payments may fund one Item; item-level allocation is required to establish payment/receipt eligibility.
- **SUP-011:** Supplier payments and allocations preserve amounts, dates, supplier identity, organization, method, and correction history. Allocated amounts must reconcile with the payment amount.
- **SUP-012:** Supplier balances reflect only active outstanding commitments after valid Payments, canceled unreceived Items, refunds, and dated adjustments. Amounts owed back remain refund obligations until received or explicitly resolved under the Loss rules.

## 6. Purchases, receipt, supplier payments, and acquisition costs

A **Purchase** is one order from one Supplier. It may contain multiple Products, quantities, and individual Item IDs whose payment and arrival schedules differ.

### Purchase records and item-level receiving

- **PUR-001:** Each Purchase references one Supplier.
- **PUR-002:** A Purchase may contain multiple Purchase Items.
- **PUR-003:** Each PurchaseItem records quantity and total merchandise price for units of one global Product, selected even if registered through another Organization. Its Product relationship is through the generated InventoryItems.
- **PUR-004:** Unit price derives from Purchase Item total divided by quantity, subject to deterministic monetary rounding.
- **PUR-005:** Bulk Purchase entry is supported.
- **PUR-006:** Creating a Purchase generates a permanent Item ID for every ordered unit, owned by the purchasing Organization and linked to its PurchaseItem and global Product. It does not wait for physical receipt.
- **PUR-007:** Unit-specific acquisition costs are retained; later purchases cannot replace the cost of older Items.
- **PUR-008:** Preorders with delayed/partial arrival are supported.
- **PUR-009:** Purchase and individual items support partial payment and partial receiving; units in the same Purchase may be paid/received months apart.
- **PUR-010:** Purchase lifecycle, receiving progress, supplier payment progress, and incoming shipping information are tracked separately.
- **PUR-011:** Received and outstanding ordered units are derived from individual active Item records.
- **PUR-012:** The administrator explicitly completes a Purchase only after **all remaining active ordered units have been received**. Missing units must first be removed under the applicable Item-removal rules; the system never silently treats them as received.
- **PUR-013:** Completion cannot leave unknown/unentered additional acquisition expenses for the completing Purchase. Evaluate its units and all applicable PurchaseExpenses, including shared expenses. Completing with no applicable expense allocations means confirmed zero additional expenses for that Purchase; an expense counts even if originally entered through another linked Purchase. Do not invent expense estimates or confirm zero for another Purchase.
- **PUR-014:** A Purchase with no applicable additional acquisition expenses can complete without PurchaseExpense records; this confirms an actual zero-expense case for its units only. A shared PurchaseExpense allocated to any of its units prevents treating that Purchase as having no additional expenses.
- **PUR-015:** Receipt does not itself approve an Item for sale.
- **PUR-034:** An individual ordered Item must have its **full supplier merchandise price paid and allocated** before physical receipt can be registered. Payment and receipt may be posted together in one atomic event.
- **PUR-035:** Applicable acquisition expenses must have been paid for a unit before receipt. Evaluate the expenses allocated to that unit, including shared PurchaseExpenses; a Purchase link alone does not make an expense applicable to every unit. Already paid allocations may be entered/adjusted while the received unit is not yet approved, subject to Purchase and cost locks. No ordinary addition/change may alter an approved or sold unit's acquisition cost.
- **PUR-036:** Purchase Item edits are allowed while a Purchase is Open, but may remove only unreceived units; each unit's financial eligibility rules still apply.
- **PUR-037:** An **unreceived and wholly unpaid** unit may be soft-deleted during ordinary Open Purchase editing, retaining its Item ID and audit trail. It then ceases to contribute to active ordered quantities, unpaid commitments, or inventory costs.
- **PUR-038:** If a unit has any supplier payment allocated, removing it requires an explicit payment resolution before it becomes eligible for soft deletion; a received unit is never eligible for ordinary removal.
- **PUR-039:** Replacing one removed ordered unit with another model/unit creates a **new** Item ID. The former ID remains soft-deleted and cannot be reused.
- **PUR-040:** An Item's acquisition cost is finalized when the Item is approved and first listed for sale, even if its Purchase remains Open. Neither Purchase completion nor receipt alone is the cost-locking trigger.
- **PUR-041:** A completed Purchase is locked against ordinary edits. Exceptional corrections, if permitted, must use auditable adjustments rather than silent overwrite.

### Additional acquisition expenses

Examples include actual freight, forwarding, import taxes, and other legitimate acquisition costs. **Insurance-related features are not within the agreed application scope.**

- **PUR-016:** Record each actual acquisition expense once as an organization-owned PurchaseExpense with its own identity, amount, date, category/context, and settlement information, separately from merchandise prices. It links to one or more Purchases and has unit-level AcquisitionExpenseAllocations; it is not exclusively owned by one Purchase. A standalone general expense-management module is not required.
- **PUR-017:** Record actual known expenses, never fabricated estimates.
- **PUR-018:** Allocate a PurchaseExpense directly to the specific InventoryItem IDs it concerns, tracing each unit through its PurchaseItem to its Purchase. A selected subset may span several linked Purchases. Do not allocate money to Purchase headers or automatically spread it over all units in those Purchases.
- **PUR-019:** Supported allocation methods are proportional to merchandise value, equal per physical unit, and manual allocation. Each method operates only on the selected applicable InventoryItems across all linked Purchases; equal per Purchase and the redundant proportional-to-quantity method are not additional methods.
- **PUR-020:** Proportional to merchandise value is the default, using only the merchandise values of the selected applicable InventoryItems, regardless of which linked Purchase each unit belongs to.
- **PUR-021:** The unit allocations across all linked Purchases reconcile exactly once to the single recorded PurchaseExpense amount, including deterministic cent rounding. The full amount must not be allocated or counted again for each Purchase. Any per-Purchase expense subtotal is derived from its units' allocations.
- **PUR-022:** While a Purchase is Open, distinguish unentered/unknown applicable expenses from expressly confirmed zero. Include shared PurchaseExpenses allocated to its units, regardless of the entry point. On completion, apply PUR-013 to this Purchase only; another linked Purchase retains its own completeness state.
- **PUR-023:** Cost completeness and cost-finalization/lock status are identifiable per Item.
- **PUR-024:** Landed cost = the InventoryItem's merchandise acquisition price + the sum of its applicable actual AcquisitionExpenseAllocations. Units with no allocation from a given PurchaseExpense receive none of that expense, even when their Purchase is linked to it.

- **PUR-047:** A PurchaseExpense belongs to exactly one Organization and links to one or more Purchases in that same Organization. A Purchase may have multiple PurchaseExpenses. The relationship is many-to-many, with a single expense identity and settlement even when entered/viewed through different Purchases.
- **PUR-048:** Each AcquisitionExpenseAllocation references exactly one PurchaseExpense and one InventoryItem in the same Organization. Its InventoryItem's originating Purchase must be linked to that expense. For a saved, fully allocated expense, the linked Purchases correspond to the Purchases represented by its unit allocations; all units of a linked Purchase need not be selected. Repeated lines must not duplicate the same expense/unit cost.
- **PUR-049:** Shared-expense creation, allocation changes, and resulting cost/completeness updates are atomic, reconcile to the source amount, and preserve dated history. Purchase completion or item removal/cancellation must not cascade-delete a shared expense, erase its settlement, or silently redistribute its costs onto other units. Ordinary edits must preserve completed-Purchase locks and approved/sold unit costs across every linked Purchase; valid changes affecting only other eligible open-Purchase units may proceed without changing protected facts. Exceptional corrections and unresolved expense settlement/disposition follow D06, not an implicit refund, loss, or unlock policy.

### Shared PurchaseExpense example

Purchase P1 contains I1 and I2; Purchase P2 contains I3 and I4. I1 and I4 arrive together. Record one R$30 shipping PurchaseExpense linked to P1 and P2, with allocations of R$10 to I1 and R$20 to I4. For example, these are value-proportional shares when I1/I4 merchandise costs are R$100/R$200; equal-unit allocation would assign R$15 to each. I2 and I3 receive no part of this expense. P1's derived expense subtotal is R$10; P2's is R$20; the source expense and settlement remain R$30 once. Allocation methods operate over I1 and I4 only. Partial arrivals need no separate Shipment or package entity.

### Supplier payments and balances

- **PUR-025:** Supplier outstanding balance is the amount still owed, not total nominal Purchase value.
- **PUR-026:** Supplier balance derives from active commitments, actual supplier Payments, refunds, and applicable dated adjustments; no supplier credit is supported.
- **PUR-027:** The balance is not manually editable.
- **PUR-042:** Each supplier payment must be allocated to one or more specific **Item IDs / Purchase Items with unit-level traceability**; one payment can cover multiple items and purchases, while an Item can receive multiple payments.
- **PUR-043:** The supplier payment's allocated amounts must exactly equal its actual amount. No allocation may exceed the relevant outstanding item obligation; a paid Item is eligible for receipt only when its full merchandise obligation is settled.
- **PUR-044:** Supplier payment corrections and reallocation preserve audit history and cannot create or destroy cash movements.

**Example:** A Purchase contains ten units. Five arrive this month and five in three months. The administrator may pay and receive the first five while leaving the Purchase Open and the remaining five Awaiting Arrival and unpaid.

### Purchase states and cancellation

| Dimension | States / interpretation |
|---|---|
| Purchase lifecycle | **Open**, **Completed**, **Canceled** |
| Receiving progress | **Not Received**, **Partially Received**, **Fully Received** |
| Supplier payment progress | Derived from allocations to individual Items; mixed payment states within a Purchase are valid |

- **PUR-028:** An administrator explicitly initiates cancellation.
- **PUR-029:** Canceled Purchase, Payment, refund, refund-obligation, and Loss history is retained. No supplier-credit account is created.
- **PUR-030:** Cancellation generally cannot be finalized while an owed supplier refund is unresolved.
- **PUR-031:** An authorized exception permits finalization after explicitly recording an unrecovered prepaid amount as a loss.
- **PUR-032:** Canceled Purchase commitments are excluded from ordinary active-order and inventory-cost metrics, while associated past cash movements and losses remain reportable.
- **PUR-033:** Associated refunds and losses remain visible in audits and applicable reports.
- **PUR-045:** A Purchase **cannot be canceled once any of its units has been physically received**, even if the unit is later sold, lost, or otherwise no longer on hand. The Purchase stays Open until its remaining ordered units are received or validly removed and it is completed.
- **PUR-046:** If any units were received, ordinary Purchase editing may remove only eligible unreceived units, not historical received units or their acquisition relationships.

**Cancellation example:** An unreceived Purchase has a R$200 deposit and is canceled. If only R$150 is refunded, the remaining R$50 must be recorded as an explicit loss before authorized exception-based finalization.

## 7. Sales, reservations, editing, and shipment

A **Sale** belongs to one Customer and contains one or more specific Inventory Items. 'Reservation' is an unpaid Sale state, not an independent entity. Every active Sale removes its assigned Items from the public catalog, regardless of payment progress.

### Sale creation, identity, and editing

- **SAL-001:** A Sale may contain multiple Sale Items.
- **SAL-002:** Every Sale Item identifies one particular Item ID.
- **SAL-003:** Selecting only Product and quantity is insufficient; physical Item IDs must be chosen.
- **SAL-004:** **Every Sale must reference exactly one Customer.**
- **SAL-005:** Authorized administrators manually enter Sales.
- **SAL-006:** Sale Items retain their actual agreed merchandise selling prices.
- **SAL-007:** There is no separate discount requirement; an asking price of R$200 and agreed price of R$180 yields a Sale Item price of R$180.
- **SAL-008:** Current asking-price changes do not alter prior agreed Sale Item prices.
- **SAL-009:** A Sale supports an optional shipment tracking code.
- **SAL-010:** Sale creation, item edits, cancellation, dispatch, and returns preserve history.
- **SAL-011:** Canceling an unshipped Sale immediately releases eligible Items to Available/catalog status and resolves affected customer funding through explicit refund, reassignment to eligible existing Sales/SaleItems, or legitimately earned retained income in the same business operation.
- **SAL-012:** **Cancellation** applies to an unshipped Sale; **Return** applies when a shipped Item has physically come back. These are distinct actions and histories.
- **SAL-038:** The administrator may edit the specific Items and agreed prices of a Sale while it is **Reserved** or **In Garage**. Ordinary item/price editing is locked after dispatch.
- **SAL-039:** Removing an Item from an unshipped Sale immediately releases that approved eligible Item back to the catalog, keeping the same ID, cost, condition, asking price, and Sale Item history.
- **SAL-040:** Adding an Item through an unshipped Sale edit immediately commits it and removes it from the catalog; all item and financial changes occur atomically.
- **SAL-041:** When an unshipped Sale is edited, reconcile amount, debt, allocations, status, and dated adjustments. Refund released customer money or reassign it to an eligible existing Sale/SaleItem of the same Customer and Organization; any legitimately retained income is separate. No future-Sale customer credit is created.
- **SAL-042:** A Sale with all Items removed is canceled rather than erased. Historical Sales and Sale Items are never hard-deleted to accomplish customer exchanges.
- **SAL-043:** A Sale cannot include an Awaiting Arrival, Held, designated Collection, Lost/Disposed, soft-deleted, or already committed Item. Only an eligible approved Available Item may enter an active Sale in v1.

### Sale lifecycle and reservations

| Sale state | Condition | Associated Item effective state | Catalog |
|---|---|---|---|
| **Reserved** | Active, outstanding balance **> 0** | Reserved | No |
| **In Garage** | Active, fully paid, not shipped | In Garage | No |
| **Shipped** | Administrator recorded dispatch | Shipped | No |
| **Canceled** | Administrator canceled unshipped Sale | Released to Available if eligible | Yes, if eligible |
| **Partially Returned** | Some shipped Sale Items physically returned | Returned Items assessed individually | Returned eligible Items only |
| **Returned** | All shipped Sale Items physically returned | Returned Items assessed individually | Eligible Items only |

- **SAL-013:** Reservation is a state of Sale, not a separate Reservation record.
- **SAL-014:** Only administrators may create or edit Sales/reservations.
- **SAL-015:** Public visitors cannot place reservations.
- **SAL-016:** A non-canceled, unshipped Sale with a positive outstanding balance is Reserved, regardless of whether any amount has been paid.
- **SAL-017:** Reserved/In Garage derives from the active Sale's outstanding balance and shipment state, rather than an independently editable status.
- **SAL-018:** All active Sale Items—Reserved and In Garage—are excluded from catalog availability.
- **SAL-019:** One physical Item can belong to only one active Sale at a time.
- **SAL-020:** Payment-driven status changes preserve the prior history.
- **SAL-021:** Administrators can cancel an unshipped Sale while resolving allocations through outgoing refunds, reassignment to existing eligible Sales/SaleItems, or agreed legitimate retained income.
- **SAL-022:** Cancellation supports no, partial, or full actual refund and separately records funding reassignment, any pending refund obligation, and legitimately retained income. Refund percentage and settlement completion are distinct.
- **SAL-023:** Cancellation releases only physically held, approved, otherwise eligible Items; Items that are not eligible must remain excluded from the catalog until appropriate approval.
- **SAL-044:** When a Sale's outstanding balance becomes zero, it immediately becomes **In Garage** (fully paid and eligible for dispatch), with no additional readiness confirmation.
- **SAL-045:** A Sale must be **In Garage** before it may be marked Shipped in the normal workflow.
- **SAL-046:** A payment or item/price edit that creates a positive outstanding balance on an unshipped In Garage Sale returns it to Reserved.
- **SAL-047:** A Sale recorded as Shipped cannot be canceled by the ordinary cancellation workflow; a shipped Item that returns is processed as a Return.

There is **no automatic reservation expiration** in v1.

### Sales and profit recognition

- **SAL-024:** An active Sale contributes to applicable sales and profit metrics **on the Sale's creation date**, even if still Reserved and unpaid.
- **SAL-025:** Receipt/completion of customer payment is **not** a prerequisite for recognizing Sale or collection-recovery profit.
- **SAL-026:** Edits, cancellations, and returns reverse or adjust relevant booked Sale revenue/cost/profit; reversals appear on the adjustment event's date, without silently changing the original-period historical activity.
- **SAL-027:** Status and applicable date/filter controls are supported for administrator reports; precise launch set remains open.
- **SAL-028:** Reporting distinguishes Reserved, In Garage, Shipped, Canceled, Partially Returned, and Returned Sales, plus associated adjustments.

### Dispatch and tracking (replaces the old readiness workflow)

The following former requirements are **retired in v0.5**, rather than reused. Fully paid now means In Garage and ready to dispatch without a separate readiness stage:

- **SAL-029 — Retired:** Prompting for readiness confirmation.
- **SAL-030 — Retired:** Prohibiting automatic readiness on full payment.
- **SAL-031 — Retired:** Sale-level readiness confirmation.
- **SAL-032 — Retired:** Mandatory administrator readiness confirmation.
- **SAL-033 — Retired:** Notes for a separate 'not ready' workflow.
- **SAL-034 — Retired:** Blocking readiness for unconfirmed individual items.
- **SAL-035 — Retired:** Separate readiness/dispatch status boundary; dispatch remains distinct under SAL-036.
- **SAL-036:** Actual dispatch is recorded explicitly by the administrator and is separate from full payment / In Garage status.
- **SAL-037:** The Sale may store an optional tracking code.
- **SAL-048:** No shipping-method, packing, delivery-carrier, package-management, or multi-package workflow is required in v1. A tracking number is the only shipping-detail field specified in addition to recording dispatch.
- **SAL-049:** Two or more Sales may have the same tracking number; uniqueness must not be enforced on tracking codes.
- **SAL-050:** Dispatch is treated at the Sale level; separate partial-shipment management is not within the agreed v1 scope.

### Sale state transitions

| From | To | Trigger / precondition |
|---|---|---|
| New Sale | Reserved | Sale created with positive outstanding balance |
| New Sale | In Garage | Sale created fully paid in the same logical process |
| Reserved | In Garage | Outstanding balance reaches zero |
| In Garage | Reserved | Authorized unshipped edit creates positive outstanding balance |
| In Garage | Shipped | Administrator records dispatch |
| Reserved / In Garage | Canceled | Administrator cancels; releases Items and settles money |
| Shipped | Partially Returned | Physically receive a proper subset of original shipped Items |
| Shipped / Partially Returned | Returned | All shipped Items physically returned |

**Exchange example:** An unshipped Sale initially contains Item A for R$100, fully paid. The customer switches to Item B for R$80. The administrator edits the same Sale: A returns to Available, B is committed, R$80 remains applied to the Sale, and R$20 is refunded or reassigned to an eligible existing Sale/SaleItem of the same Customer and Organization. A chosen but unpaid refund remains an explicit obligation, not future-Sale credit. If B costs R$120, the Sale becomes Reserved with R$20 outstanding instead.

## 8. Customer payments, allocations, reassignment, and refunds

A customer Payment represents the **merchandise portion** of incoming money recorded in Estoque164. Shipping amounts paid by customers are deliberately outside application scope and are not included in recorded customer Payment amounts, Sale dues, revenue, or expenses. The application is **not** a complete reconciliation of bank deposits containing customer-paid shipping.

### New customer payments and Sale allocations

- **PAY-001:** Each Payment records the actual **merchandise amount recognized by this application**, date, method, organization, and Customer.
- **PAY-002:** When a new Payment is entered, the administrator selects the Sale(s) it pays.
- **PAY-003:** Record the amount allocated to each Sale and support attribution to a SaleItem where needed. A line-specific allocation must belong to that Sale and counts once toward Sale funding; physical table design remains open.
- **PAY-004:** A Payment may cover multiple Sales.
- **PAY-005:** One Sale may have multiple Payments.
- **PAY-006:** Payments may be split across several Sales or allocated entirely to one.
- **PAY-007:** Show each selected Sale's outstanding merchandise balance when allocating.
- **PAY-008:** All amounts allocated from a newly entered Payment must sum to that Payment's recorded merchandise amount.
- **PAY-009:** A **new** Payment cannot be saved with unallocated merchandise cash.
- **PAY-010:** Allocation cannot exceed its source Payment.
- **PAY-011:** Allocation cannot exceed an active Sale's outstanding merchandise balance.
- **PAY-012:** Excess new merchandise payment must be resolved before entry. Customer money released later by edit/cancellation/Return must be refunded or reassigned to an eligible existing Sale/SaleItem; it cannot become reusable future-Sale credit.
- **PAY-013:** Sale balance derives from its current obligation, allocated Payments, dated allocation changes, and valid cancellation/Return/edit adjustments. It cannot become negative.
- **PAY-014:** Sale outstanding balance cannot be manually overwritten.
- **PAY-015:** An active, unshipped Sale with balance > 0 is Reserved.
- **PAY-016:** On reaching a zero balance, an unshipped active Sale becomes In Garage automatically; no readiness confirmation is required.
- **PAY-017:** Payment-allocation corrections preserve prior versions/events in the audit history.
- **PAY-018:** Internal allocation changes do not create or destroy real cash movements.
- **PAY-019:** Payment registration and allocation remain conceptually distinct, though they may share one administrator screen/atomic transaction.
- **PAY-020:** Sales that are canceled, edited, or returned retain payment history and financial reconciliation.
- **PAY-030:** Every allocation belongs to a Sale of the **same Customer and organization** as the underlying Payment. Cross-customer/organization transfers are not permitted.
- **PAY-032:** When an edit, cancellation, or Return releases funded amounts, explicitly refund or reassign money owed to the Customer to eligible existing Sales/SaleItems. Separately recognize only legitimately earned retained income. Preserve original Payment and dated allocation history, with no orphan allocations or reusable credit.

**Shipping example:** The miniature sells for R$100; the customer transfers R$115 including R$15 shipping. Estoque164 records a **R$100 Sale and R$100 customer Payment**. The R$15 shipping component is not tracked in Estoque164. Business-paid selling/delivery costs, however, are recorded separately where applicable.

### Refund and financial-settlement concepts

A **Refund** is money actually sent to a Customer. Reassignment moves existing Payment funding to an eligible existing Sale/SaleItem without new cash. A pending refund obligation is unavailable for future spending. There is no customer wallet or reusable credit. **Retained income** is an amount actually received and validly kept after a canceled or returned Sale, recorded as a separate economic result rather than retaining reversed Sale revenue.

- **PAY-021:** Refund classification is **None**, **Partial**, or **Full**, according to how much of the affected merchandise amount actually paid has been sent back. Track settlement completeness separately from refund percentage.
- **PAY-022:** Actual refunds create outgoing financial records.
- **PAY-023:** Partial or full refunds are supported.
- **PAY-024:** A cancellation/Return may have no actual refund because no money was paid, funding is reassigned to eligible existing Sales/SaleItems, legitimate retained income applies, or a chosen refund remains explicitly pending. Resolve all amounts and distinguish settlement completion; no future-Sale credit is allowed.
- **PAY-025:** Refunds reference the original Sale and relevant transaction, amount, and date.
- **PAY-026:** A Refund is not a new incoming Customer Payment.
- **PAY-027:** Refunds and settlement adjustments update accounts and appropriate dated reports, **without subtracting the same reversed Sale profit twice**.
- **PAY-028:** Partial refunds are not mislabeled as full refunds.
- **PAY-029:** Sale cancellation/return status, refund percentage status, and financial settlement completion are distinct.
- **PAY-033:** Represent actual cash Refunds, internal allocation reassignments, pending refund obligations, and legitimately retained income separately. Refunds or reassignments do not preserve reversed merchandise revenue and do not duplicate its reversal.
- **PAY-034:** RetainedIncomeAllocation attributes retained income to affected SaleItems/models within the same Organization. For one model, attribution is direct; for multiple models, administrator allocations sum exactly to the total retained amount. Another Organization’s collection recovery cannot use it.
- **PAY-035:** Refund/reassignment obligations and legitimately retained income with its model allocations arise within the originating Sale edit/cancellation/Return business operation, not duplicate manual steps. No customer-credit record or wallet is created.
- **PAY-036:** Refunds, cancellations, funding reassignments, and allocation corrections leave no negative Sale or Customer debt. Money owed to a Customer is a traceable refund obligation, never negative debt or reusable credit.
- **PAY-037:** Reassign released funding only to an existing eligible Sale/SaleItem of the same Customer and Organization, up to its outstanding obligation. Preserve original Payment and dated allocation changes, prevent concurrent overuse and refunding the same amount, and create no incoming cash. No funds may be kept for a future Sale.
- **PAY-038:** If a chosen refund is not yet disbursed, preserve its explicit source-linked unpaid obligation and settlement status. It is unavailable for spending and is distinct from an actual outgoing CustomerRefund. Scheduling details remain workflow design, not reusable customer credit.

**Partial-refund example:** A Sale for R$100 is fully paid; after a shipped return the administrator physically receives the same Item and refunds R$70. The original Sale revenue and Item cost/profit are reversed on the Return date. The remaining R$30 is recorded once as **retained return income** attributable to the Item's Product. The Item becomes physically owned inventory again, with availability as explicitly determined in the Return registration.

## 9. Customers and customer accounts

- **CUS-001:** Each Customer has a record.
- **CUS-002:** Customer name and telephone are supported.
- **CUS-003:** Store address information as fields on Customer; a separate CustomerAddress entity is not required.
- **CUS-004:** Notes are supported.
- **CUS-005:** Administrators can inspect the Customer transaction history.
- **CUS-006:** Derive Customer Debt from active obligations and funding. Show any pending refund obligation separately; no customer credit for future Sales is supported.
- **CUS-007:** Debt and refund-obligation totals derive from source transactions and cannot be manually overwritten.
- **CUS-008:** Customer addresses and notes are not exposed publicly.
- **CUS-009:** Allocate new Customer Payments fully to Sale(s) as entered. Later released funding must be refunded or reassigned to eligible existing Sales/SaleItems; do not maintain a future-Sale wallet.
- **CUS-010:** Individual Customer Debt cannot be negative.
- **CUS-011:** Distinguish cash Refunds, internal payment-allocation reassignments, pending refund obligations, and legitimately earned RetainedIncome.
- **CUS-012:** Preserve Payment, dated allocation/reassignment, Refund, Sale-edit, cancellation, Return, and settlement history.
- **CUS-013:** Every Sale belongs to one Customer. Every Payment allocation, line attribution, reassignment, and Refund remains with that Customer and Organization.
- **CUS-014:** Customer Debt is the positive unpaid sum of active Sale obligations net of allocated Payments and valid dated adjustments. Total Customers Debt sums positive Customer Debt within the applicable Organization/reporting scope. Refund obligations are separate.
- **CUS-015:** Pending Customer payment changes Customer Debt and Total Customers Debt, not recognized Sale profit, collection recovery, or Item cost. Actual Payments/Refunds affect dated cash histories and traceable settlements; reallocation creates no cash.

## 10. Returns and cancellation treatment

**Cancellation** applies to an unshipped Sale and releases its eligible Items immediately. **Return** applies only after a previously shipped physical Item is received back. They are separate workflows, even if their financial adjustments use common concepts.

- **RET-001:** An administrator authorizes and registers Returns.
- **RET-002:** Every Return references the originating Sale.
- **RET-003:** Partial Returns are supported.
- **RET-004:** Each Return line references the **original Sale Item and its unique physical Item ID**; returned quantity is derived from the identified physical units. The same Sale Item cannot be returned twice as an additional new physical return.
- **RET-005:** During Return registration the administrator records the returned Item's condition and whether it is again approved for sale.
- **RET-006:** The original Sale and Sale Item history persists.
- **RET-007:** A Return settles paid amounts through actual Refund, reassignment to eligible existing Sales/SaleItems of the same Customer and Organization, legitimate RetainedIncome, or an explicit combination. A pending refund is an obligation, not credit for future Sales.
- **RET-008:** Return entries create corresponding dated changes in Sale revenue, Item-related acquisition cost/profit, financial settlements, Item state, and reports as one atomic business event.
- **RET-009:** A returned physical Item may become catalog Available immediately **when** the Return operation registers physical receipt, updates condition, and explicitly confirms its eligibility. Otherwise it remains physically held but unavailable until approved.
- **RET-010:** A returned Sale is distinguished from a canceled unshipped Sale.
- **RET-011:** A Return reverses the applicable original booked merchandise Sale income and matched specific Item acquisition-cost effect. Any amount retained is recorded **once** as separately attributable Return income; cash Refunds do not cause an additional duplicate profit reversal.
- **RET-012:** If only some Items are returned, adjustments apply to those Sale Items rather than indiscriminately reversing the full Sale.
- **RET-013:** Items returned from shipped Sales can later be sold again under the **same persistent Item IDs**, with complete original and subsequent Sale histories.

**Remaining return-accounting detail:** The exact allocation-reversal sequence when a **partially returned multi-item Sale has several historic customer Payments and dated allocation reassignments** needs an explicit rule. Its overall required outcomes—accurate Sale balance, valid reassignment/refund settlement, no duplicate cash movement, and dated reversal—are agreed. See Section 14.

## 11. Personal collection and collection-cost metrics

Each Organization has one implicit collection. Membership is on its InventoryItems. Within that Organization, a Product may have multiple units but at most one current collection unit; another Organization may collect its own copy of the same Product. All formulas below use only the applicable Organization’s costs and eligible profit.

- **COL-001:** Each Organization has exactly one implicit collection, defined by membership on its own InventoryItems (for example is_collection). A Product may have no collection unit. No separate Collection or baseline CollectionDesignation entity is required.
- **COL-002:** At most one current collection InventoryItem per Organization + global Product is permitted, including under concurrent changes. Different Organizations may each designate one of their own units of the same Product.
- **COL-003:** When an administrator intentionally adds an Item of a Product to that Organization’s collection for the first time, that Item is designated. Registering Product alone creates no membership.
- **COL-004:** An administrator may explicitly replace the collection unit within their Organization. Remove the old designation before or atomically with the new designation and preserve dated history; other Organizations are unaffected.
- **COL-005:** A designated collection Item cannot be sold.
- **COL-006:** Before sale, remove the collection designation and explicitly make the Item Available.
- **COL-007:** Removing a designation does not automatically pick a replacement.
- **COL-008:** Preserve dated InventoryItem collection membership changes in shared business/audit history, with Organization scope. A separate designation table is not required.
- **COL-009:** The collection InventoryItem's original acquisition cost derives from its own merchandise acquisition amount and its specific AcquisitionExpenseAllocations, including shared PurchaseExpenses. Expenses allocated only to other units do not change this unit's cost.
- **COL-010:** Calculate Net Collection Cost per Organization and model/Product using only that Organization’s designated unit and eligible source events.
- **COL-011:** Calculate Net Whole Collection Cost from that Organization’s single implicit collection and eligible profit only.
- **COL-012:** Collection-cost metrics are management indicators; they do not replace acquisition cost or ordinary financial profit.
- **COL-013:** Net Collection Cost is never less than zero.
- **COL-014:** Profit exceeding a collection-cost floor remains separately visible rather than disappearing.
- **COL-015:** Derive collection costs from the applicable Organization’s designated InventoryItems, their acquisition costs, Sales, reversals, eligible profit, and retained income. Cost presentation/finalization for never-approved collection units remains D08; historical designation presentation remains D02.
- **COL-016:** Retain historical membership per Organization/InventoryItem/Product in shared history, including replacement/removal.
- **COL-017:** Collection-cost profit eligibility begins when the qualifying Sale is **created**, not when the Customer pays. Valid edits/cancellations/returns adjust eligibility at their respective event dates.
- **COL-018:** Profits from other units of a model may count toward its collection cost even if those Sales occurred **before** the model's collection Item was designated.
- **COL-019:** Excess model-specific profit is **not transferred to the Net Collection Cost of another individual model**. Whole-collection recovery is a separate, independently calculated aggregate metric and may be zero even when the sum of per-model costs remains positive.
- **COL-020:** Per-model profit may use Sale Item **gross** profit plus model-attributed retained income and applicable reversals; shared Sale-level selling expenses remain at Sale level and are not arbitrarily allocated to individual models.

### Per-model formula (conceptual)

**Net Collection Cost per model** = `max(0, original acquisition cost of that model's currently designated collection Item − eligible model-level profit from sales of other units of that Product)`.

Eligible model-level profit includes applicable booked gross Sale Item profits and attributed retained income; cancellations and returns reverse the appropriate earlier Sale profit. Payment receipt is irrelevant to profit eligibility.

### Whole-collection formula (conceptual)

**Net Whole Collection Cost** = `max(0, combined original acquisition costs of current designated collection Items − eligible whole-collection profit)`.

The whole-collection metric is independently pooled and need not equal the sum of per-model net costs. Whole-collection profit considers relevant Sale-level selling expenses rather than allocating them arbitrarily to models. Original acquisition costs, profit used for recovery, and excess profit remain separately visible.

**Example:** Two collection Items each cost R$100. Model A has R$200 eligible profit; model B has R$0. Model net costs are R$0 and R$100 respectively. Under pooled whole-collection recovery, the whole-collection net cost may be R$0. This is deliberate, not a reconciliation error.

**Still open:** Historical presentation when designation changes, and treatment of negative model/whole-collection eligible profit in the cost-recovery formulas, should be specified before those edge cases are implemented.

## 12. Expenses, losses, financial metrics, and reporting

### Expenses and single-currency scope

- **FIN-001:** Actual acquisition expenses are separate from merchandise purchase prices. A shared PurchaseExpense and its settlement are recorded once; unit costs and per-Purchase subtotals derive from allocations, so joining several Purchases must not duplicate expense amounts, cash, or acquisition cost.
- **FIN-002:** Selling expenses are Sale-owned SaleExpenses for the Sale as a whole, not individual SaleItems. PurchaseExpenses belong to one Organization, may link to several Purchases, and allocate cost to specific InventoryItems. Expense entry stays available within the applicable Purchase/Sale workflows; a separate ExpensePayment entity is not baseline scope.
- **FIN-003:** Customer-paid shipping amounts are **entirely out of scope**: not entered as customer Payment, Sale charge, shipping income, or associated shipping-cost line. A merchandise-only Payment can differ from the actual full bank transfer when shipping is included.
- **FIN-004:** Shipping paid by the business and other applicable Sale expenses are recorded at Sale level.
- **FIN-005:** Distinguish contractual amounts due from money actually received or paid.
- **FIN-006:** Financial source records preserve amount, date, method, organization, and source relationships.
- **FIN-007:** All application amounts and reports are in BRL; no in-app FX conversion.
- **FIN-008:** Administrator financial reports use only the applicable Organization’s operational sources, even when grouped by global Product. Precise report list and filters remain D05.
- **FIN-009:** Sale-level expenses are not arbitrarily allocated among physical Items for per-model gross-profit reporting. Sale net profit deducts Sale-level expenses separately.
- **FIN-010:** Recognized Sale profit is independent of Customer payment timing. Payment status changes Customer Debt / Total Customers Debt and cash/account records, but not earned Sale/collection profit by itself.
- **FIN-011:** Profit corrections and reversals appear on the **actual adjustment date**, not silently as edits to prior-period profit. Example: a profit booked in October and reversed in November appears as a positive October event and a negative November event.
- **FIN-012:** Refund disbursements, pending refund obligations, and internal funding reassignments are settlements, not duplicate Sale revenue/profit effects when the originating Sale adjustment already records the economic reversal.

### Explicit losses and automatic consequences

- **LOS-001:** Explicit Loss events are not treated as ordinary Sales.
- **LOS-002:** A Loss event records amount, date, reason, and relevant Item/Purchase/Sale relationship.
- **LOS-003:** Removing a Loss uses an auditable dated void/reversal, preserving the original event and consistent stock/correction consequences. Actual later money uses an ordinary source such as SupplierRefund linked to the Loss. Voiding a Loss alone asserts no cash receipt; no LossRecovery entity or insurance feature is needed.
- **LOS-004:** Examples are lost items, damaged stock written off, lost shipments, or unrecovered supplier deposits.
- **LOS-005:** Losses from canceled Purchases remain reportable despite exclusion of the canceled order from active-purchase totals.
- **LOS-006:** Reports distinguish ordinary Sale profit/loss from explicit write-off losses.
- **LOS-007:** **One physical or financial Loss event creates its associated inventory write-off and financial effect once**. The administrator must not record a separate second loss for the same economic amount; business event processing and reporting must prevent double counting.
- **LOS-008:** No insurance-policy management, insurance-claim lifecycle, or insurance-based recovery feature is required.

### Metric rules

- **CALC-001:** All management metrics derive from source events and records.
- **CALC-002:** Derived totals cannot be edited directly as authoritative data.
- **CALC-003:** Derive Customer Debt, pending refund obligations, and settlements from Sales, Payments, dated allocations, refunds, and adjustments. Total Customers Debt aggregates positive debts within the applicable Organization; no reusable credit balance exists.
- **CALC-004:** Supplier balances derive from active ordered Item obligations, unit-level supplier Payment allocations, refunds, and dated adjustments. There is no supplier-credit account.
- **CALC-005:** Ordered, received/on-hand, available, committed, shipped, soft-deleted, and disposed quantities derive from Item state and events.
- **CALC-006:** At Sale creation, recognize its agreed merchandise Sale Item amounts and the finalized acquisition cost of its specific Items; subtract Sale-level selling expenses at Sale level, applying event-dated reversals and adjusted retained income as appropriate.
- **CALC-007:** Collection recovery derives from eligible Sale **booked** profit and appropriate reversals/retained income; it never waits for Customer payment.
- **CALC-008:** Average acquisition price derives from the applicable Organization’s source units/costs using the D05 aggregation basis; shared Product identity does not pool other Organizations’ costs.
- **CALC-009:** Missing/unfinished costs and finalized/locked costs are distinguishable, but items offered for sale must have finalized acquisition costs.
- **CALC-010:** Source events and their dated corrections must consistently affect dependent calculations.
- **CALC-011:** Provide average acquisition price, owned inventory cost, net model collection costs, net whole collection cost, accumulated profit/loss, available unit counts, Customer Debt, and Total Customers Debt.
- **CALC-012:** Derived caches must reconcile to sources. Shared Product metadata changes refresh affected permitted projections; stock, unit price, private facts, and financial caches retain Organization scope.
- **CALC-013:** Sales contribute to applicable metrics from creation date while Reserved, not from payment or shipment date.
- **CALC-014:** Provide administrator report filters within the applicable Organization by Item, global Product, Sale status, Customer, dates, and other D05 dimensions. A shared Product filter does not expose another Organization’s sources.
- **CALC-015:** **Item gross profit on original Sale recognition** = agreed Sale Item price − that specific Item's finalized acquisition cost. Subsequent edits/returns/cancellations post signed adjustment events instead of replacing the original event. **Model gross profit over a period** is the sum of the applicable original Item gross-profit events, signed model-specific adjustment/reversal events, and model-attributed retained-income events. Sale-level expenses are not spread across Items.
- **CALC-016:** **Sale net profit over a period** is derived by summing signed original Sale Item gross-profit events, signed subsequent Item-level adjustment/reversal events, Sale-level selling-expense events, and relevant retained-income events **once each**. Whole-business profit also accounts for other distinct business expenses and explicit Loss events without duplicate write-offs.
- **CALC-017:** Ordinary customer-payment timing changes debt and actual cash/settlement histories, not Sale profit, model profit, accumulated profit, Item cost, or collection recovery. Reassignment to another existing Sale creates no cash or profit event.
- **CALC-018:** A Sale's **creation date** is its original reporting date. Later edits/cancellations/returns use their own event dates. Historical period reports must show original and subsequent adjustment entries in their respective periods.

## 13. Data migration, backups, and technical requirements

### Spreadsheet migration

- **DATA-001:** Existing inventory is maintained in an Excel spreadsheet.
- **DATA-002:** Import existing spreadsheet data.
- **DATA-003:** Map spreadsheet rows to global Product identities and target-Organization InventoryItems, costs, condition, and collection membership. Reuse existing Products where explicitly matched; a repeated SKU alone does not establish identity.
- **DATA-004:** Preview missing, invalid, conflicting, and ambiguous matches before import. SKU remains nonunique. Reusing a Product must not silently overwrite shared metadata; changes follow D07 and the reviewed import policy.
- **DATA-005:** Preserve global Product versus organization-owned Item identity. Reconcile imported units and referenced models within the target Organization separately from global catalog growth.
- **DATA-006:** Validate the target Organization’s imported units, referenced Products, acquisition costs, condition, membership, and exceptions against the source spreadsheet before cutover. Reusing a global Product need not increase catalog count.
- **DATA-007:** If legacy items lack Purchase or financial transaction history, the migration design must explicitly establish the necessary source/acquisition relationships without fabricating original payments or dates; any unavoidable assumptions must be reviewed before import.

Exact field mapping, import format, and validation mechanics will follow review of the actual spreadsheet.

### Backup

- **BACKUP-001:** Create a daily backup.
- **BACKUP-002:** Specify backup retention, implementation, restoration, and verification in the technical phase.

### Technical phase

- **TECH-001:** Authentication and account recovery to be specified technically.
- **TECH-002:** Deployment and hosting to be specified technically.
- **TECH-003:** Backup implementation to be specified technically.
- **TECH-004:** Browser/device support, performance, and recovery targets to be specified technically.
- **TECH-005:** Enforce isolation of organization-owned records and atomic integrity while allowing authorized access to global Products. Global Product references must not be rejected by blanket same-Organization filtering.
- **TECH-006:** Concurrency prevents duplicate active commitments to one physical Item, payment overuse, inconsistent cross-record outcomes, and multiple collection units for one Organization/Product. Different Organizations may concurrently sell their own units of the same Product.

**Technical follow-up approved on 2026-10-21:** [Technical direction](technical-direction.md) records the selected monorepo stack, PostgreSQL/Drizzle persistence, Google/Firebase authentication, UTC timestamp storage and financial reporting, and visitor-local timestamp display. Exact monetary arithmetic, business-date semantics, the final schema, remaining session behavior, hosting, and operational targets still need their existing technical-task outputs. This supplement preserves the requirement wording and IDs above and is not implementation acceptance evidence.

## 14. Remaining open decisions (not yet approved business rules)

The core lifecycle decisions are agreed. The following **specific** matters remain unresolved and must not be silently treated as decided:

1. **Partial Return payment-allocation order:** For partial Returns of multi-item Sales funded by several Payments and dated allocation reassignments, which original allocations are reduced or reclassified first, and how are affected amounts attributed across returned Items? Required balances and audit invariants are agreed; this edge-case allocation procedure is not.
2. **Historical collection designation:** When a Product's designated collection Item changes, within an Organization, what historical as-of-period Net Collection Cost should be shown, and is the metric recalculated or frozen for prior reporting dates?
3. **Negative profit in collection recovery:** Whether negative eligible per-model or whole-collection profit increases net cost, is ignored for recovery, or is displayed separately without offsetting positive profit remains unspecified. Positive recovery and the zero floor are agreed.
4. **Public catalog (D04, #18):** Organization context, approved shared/unit fields, detail presentation, filters, search, and images. Internal shared Product access does not approve cross-Organization public stock aggregation.
5. **Reports and dashboards (D05, #19):** Definitive launch report set, date ranges, filters, and widgets; **average acquisition price aggregation basis** needs a precise definition.
6. **Exceptional corrections after completion/shipping (D06, #20):** Ordinary edits are locked as defined. The permitted authorization and treatment for exceptional mistakes in completed Purchases, shipped Sales, locked Item cost, or posted payments need a focused correction policy. Include shared PurchaseExpense corrections and expense-allocation/settlement disposition when a linked unit or Purchase is removed/canceled; do not infer refunds, losses, or redistribution.

7. **Shared Product maintenance (D07, [#79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79)):** Who may edit existing shared metadata/images, global audit provenance, any private model annotations independent of a unit, historical labels after edits, and reference preservation if lifecycle actions are ever proposed. No archival, merge, deletion, or moderation feature is approved by this question. Approved registration/read/reuse may proceed independently.
8. **Never-approved collection costs (D08, [#80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80)):** When the collection unit’s own acquisition costs become complete/locked and how provisional costs appear if it is never offered for sale. The existing first-sale-approval lock remains until explicitly superseded. Independent finalization is a recommendation, not an approved replacement. Approving another Item does not affect this cost.

**Already decided; not open:** Item IDs at Purchase time, order payment before receipt, expense finalization on approval, confirmed-zero additional expenses on completion when no expense applies to that Purchase's units, including shared sources, only unpaid/unreceived units eligible for ordinary soft deletion, no selling preorders, no in-app FX, no readiness confirmation, same tracking number on several Sales, cash-payment-independent profit, event-dated reporting reversals, separate cancellation and Return, model-attributed retained income, and Sale-level selling expenses.

**Technical-phase rather than business-decision topics:** Complete remaining authentication/authorization design around the accepted choices, hosting, backups, browser support, performance, recovery targets, exact BRL/date rules, and actual Excel import procedure. Accepted tools and UTC reporting are recorded in [Technical direction](technical-direction.md); these selections do not resolve D01–D08.

## 15. Readiness for implementation and acceptance scenarios

Before a production implementation, define the core entities and relationships, confirm remaining material financial edge cases, map the existing spreadsheet, and implement testable business invariants. The following representative scenarios must work as written:

| Test | Expected behavior |
|---|---|
| Purchase ten different units, some arriving months later | Ten persistent Item IDs exist; each unit independently shows awaiting/received and supplier payment status. |
| Pay and receive five of ten ordered units | Five paid/received units; five outstanding units; one still-Open Purchase, without requiring entire Purchase payment. |
| Attempt receipt of unpaid or partially paid Item | Reject receipt until its merchandise payment and applicable acquisition expenses are settled. |
| Soft-delete unreceived, wholly unpaid ordered unit | Preserve its Item ID as removed; exclude it from active quantity and supplier commitment. |
| Attempt ordinary removal of received Item | Reject, even if the Purchase is Open. |
| Complete Purchase with no applicable additional expense allocations | Confirm zero for its units; include shared sources entered through another Purchase before deciding none apply. |
| P1 has I1/I2; P2 has I3/I4; I1 and I4 arrive together | One R$30 PurchaseExpense links P1/P2; allocate R$10 to I1 and R$20 to I4. I2/I3 receive none. Source/cash total is R$30; Purchase subtotals are R$10/R$20. |
| Apply value, equal-unit, or manual allocation to selected I1/I4 | Use only I1/I4 in the allocation basis; reconcile cents once across the expense. Do not include I2/I3 or split equally by Purchase. |
| Link/allocate shared expense to another Organization or an unlinked Purchase's unit | Reject atomically; no cost or settlement changes persist. |
| Receive I1/I4 with this shipping paid | Apply each unit's own merchandise/expense checks. I2/I3 remain outstanding; unrelated unit expenses do not block these receipts. |
| After I2 is also received, complete P1 while linked P2 remains Open | Count P1's actual allocated share; preserve P2's independent lifecycle/completeness. Changes confined to eligible P2 units preserve P1's locked facts and all finalized unit costs. |
| Remove/cancel a linked unit or attempt concurrent expense edits | Preserve the expense, settlement, history and unaffected allocations; require explicit valid resolution. Conflicting writes cannot overallocate or bypass Purchase/unit locks; unresolved exceptional disposition remains D06. |
| Approve Item for sale | Lock its acquisition cost; later ordinary acquisition expense changes for that Item are blocked. |
| Reserve available Item in unpaid Sale | Item disappears from catalog; Sale/item show Reserved; profit recognized on Sale creation date. |
| Fully pay a Reserved Sale | Sale and Item show In Garage; neither reappears in catalog; no readiness prompt. |
| Dispatch In Garage Sale | Sale/Item become Shipped; tracking code optional and may match another Sale's code. |
| Edit unshipped Sale from Item A to Item B | A immediately reappears in catalog; B is committed; payment allocations and released funding are refunded/reassigned explicitly without deleting history. |
| Cancel an unshipped Sale | Eligible Items return to catalog; refunded/reassigned/legitimately retained amounts are recorded distinctly and auditable. |
| Return a shipped physical Item | Return references original Sale Item and Item ID, administrator updates condition/availability, and financial reversals are dated to Return. |
| Return R$100 Item, refund R$70 | Reverse original Sale's booked revenue/profit as applicable; record R$30 retained model income once; no double subtraction for R$70 refund. |
| Two Customers or organizations attempt cross-account allocation | Reject invalid payment/allocation reassignment. |
| Two operations attempt to sell the same Item concurrently | Only one active Sale commitment succeeds. |
| A registers P with no units; B searches/selects P | B can reuse the same Product ID without membership in A, copies, or sharing grants. |
| A owns two units of P; B owns one | Each sees only its own operational counts, costs, notes, and transactions. |
| A and B each designate one unit of P | Both are valid; a second collection unit within A is rejected or atomically replaces A’s first. |
| A sells its unit of P while B sells its own | Both may succeed; two claims on one physical Item still cannot both succeed. |
| A earns R$40 on P; B’s collection unit costs R$100 | A’s profit does not recover B’s collection cost. |
| A removes an eligible ordered Item of P | Preserve global P, B’s units, and dated removal history. |
| Import B’s unit using existing P | Reuse P; reconcile B’s stock independently from global Product count; repeated SKU alone is not a match. |
| Reassign R$20 released from A to existing Sale B for the same Customer | Preserve original Payment and dated allocations; create no cash or wallet; refund cannot reuse that R$20. |
| A R$20 refund is chosen but not yet sent | Show a source-linked unpaid refund obligation; no outgoing cash or future spending until the relevant action occurs. |
| Void a mistaken Loss; later receive an actual supplier refund | Preserve dated reversal; void alone asserts no cash. Use ordinary SupplierRefund for actual receipt and prevent duplicate adjustment. |
| Lose a R$100 Item | One event creates Item write-off and R$100 economic loss only once. |
| Sale profit in October, cancellation in November | October shows initial recognition; November shows corresponding reversal. Customer payment timing alone does not change that profit. |
| Model A over-recovers collection cost, Model B does not | Model A floor is zero without transferring its excess to Model B; pooled whole-collection net cost is independently computed. |

### Readiness statement

**The v0.7 core business lifecycle is consolidated, but the document is not a claim that every implementation/detail decision is finalized.** In particular, partial Return allocation mechanics, exceptional correction policy, collection history, public catalog, launch reporting, shared Product maintenance, and never-approved collection-cost finalization still need explicit closure or documented deferral.

## 16. Change record and requirement continuity

| References | v0.7 change |
| --- | --- |
| REQ-006; PUR-016; PUR-047 | PurchaseExpense is organization-owned and may link to several Purchases; SaleExpense remains Sale-owned. |
| INV-011; PUR-018–021; PUR-024; PUR-048; COL-009 | Allocate to selected InventoryItems only, across Purchase boundaries; reconcile once and derive Purchase subtotals. |
| PUR-013–014; PUR-022; PUR-035 | Include shared allocations in receipt and completion checks, with independent per-unit/per-Purchase progress. |
| PUR-049; FIN-001–002; Section 14 D06 | Preserve shared sources, cash, locks, dated history and unaffected costs during edits/removal/cancellation; exceptional disposition remains open. |
| Section 15 | Add shared-shipping, selected-unit allocation, isolation, receipt, completion and concurrent-change acceptance scenarios. |

**Requirement inventory:** 307 active IDs = 304 v0.6 active + PUR-047–049. No newly retired IDs. Nine retired IDs remain SAL-029–035 (v0.5), PAY-031 and CUS-016 (v0.6); none is reused. All other v0.6 requirements and D01–D08 carry forward. The [v0.7 ownership index](requirements-coverage-v0.7.md) assigns each active ID to one delivery issue. Historical change records remain in [v0.6](requirements-v0.6.md#16-change-record-and-requirement-continuity) and [v0.5](requirements-v0.5.md).
