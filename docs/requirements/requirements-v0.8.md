# storage-minis — Full Requirements Specification

**Version:** 0.8

**Status:** Consolidated business requirements — core lifecycle decisions agreed; identified open decisions remain

**Supersedes:** [v0.7](requirements-v0.7.md)

**Product:** Inventory, sales, financial tracking, collection management, and customer catalog for 1/64 miniature sellers and collectors.

**Scope of this revision:** Consolidates the approved update logs published after v0.7 — the [2026-10-22 schema review](../requirement-updates/2026-10-22-schema-review.md), the [2026-10-23 DBML review](../requirement-updates/2026-10-23-dbml-review.md), its [index and candidate follow-up](../requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) and the [partial expense payment clarification](../requirement-updates/2026-10-23-partial-expense-payments.md) — and the owner's 2026-11-01 decisions on each Organization's currency and nickname. Adds ORG-010–011. There are 309 active and nine retired requirement IDs. No application implementation is implied.

**Historical source:** [GitHub issue #2 — storage-minis v0.5 requirements baseline](https://github.com/WilliamPhilippe/storage-minis/issues/2).

**Decision baseline:** The approved update logs above; the owner's 2026-11-01 decisions, recorded in [Section 16](#16-change-record-and-requirement-continuity); and the user-confirmed modeling, Product-scope and shared-PurchaseExpense decisions of 2026-10-21 ([accepted decisions](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/entities/model-review.md)).

**Repository edition:** 2026-11-01.

**Current baseline tracker:** [#119](https://github.com/WilliamPhilippe/storage-minis/issues/119); [#82](https://github.com/WilliamPhilippe/storage-minis/issues/82) tracks v0.7.

**Related documents:** [Entity and relationship map v0.9](../entities/entity-map-v0.9.md); [ownership index v0.8](requirements-coverage-v0.8.md); [approved update logs](../requirement-updates/README.md); [accepted entity-model decisions](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/entities/model-review.md).

> **Current consolidated baseline:** This edition supersedes v0.7. The approved logs' decisions are written into the requirements below, so the logs no longer need to be read alongside the baseline; they remain the dated approval records. Historical v0.5–v0.7 files and their baseline issues remain unchanged. Section 14 lists the decisions that remain open. Acceptance scenarios are requirements, not evidence of implemented behavior. Examples use an Organization whose currency is BRL, so amounts appear as R$.

## 1. Project objectives and principles

storage-minis manages a miniature business and its owner's personal collection in the same application. It tracks orders, incoming items, inventory, sales, customer reservations, payments, expenses, losses, supplier/customer accounts, and collection-cost recovery. Its public catalog shows only approved and available-for-sale physical items.

### General requirements

- **REQ-001 — Derived metrics:** Financial metrics, balances, quantities, average prices, profit/loss, and collection costs are calculated from authoritative source records, not manually maintained balances.
- **REQ-002 — Historical integrity:** Preserve original and corrected monetary/physical facts in shared before/after history. Permitted corrections replace mistaken source values used by reports; current Product metadata is displayed on historical screens. Eligible never-funded, unshipped SaleItems may be deleted with surviving Sale/Item audit; funded or shipped lines remain protected.
- **REQ-003 — Auditability:** Preserve one shared BusinessEvent/action/audit history with actor, actual UTC occurrence timestamp distinct from recording timestamp, reason, typed source links, before/after facts, and correction/reversal provenance. Audit survives permitted SaleItem deletion. Item timelines and financial views are derived; shared Product changes have global audit scope without Product ownership by an Organization.
- **REQ-004 — Multi-organization support:** The model supports multiple organizations, despite a single initial administrator.
- **REQ-005 — Manual sales:** Sales are initially entered by an authorized administrator; there are no external sales-platform integrations.
- **REQ-006 — Source of truth:** Authoritative sources include Purchases, individually identified InventoryItems, SaleItems, Payments and unit/line allocations, Organization-owned PurchaseExpenses, Sale-owned SaleExpenses, refunds, Losses, retained income and its model allocations, separate customer/supplier settlements and source allocations, and shared business history. PurchaseExpense links derive from selected unit allocations. No reusable customer/supplier credit or independent generic signed-adjustment money source exists.
- **REQ-007 — Consistency:** Source-record changes produce consistent downstream quantities, balances, and reports.
- **REQ-008 — One currency per Organization:** Each Organization's money is in its own currency (ORG-010), stored as integer cents: 1.56 is 156. Amounts carry no currency; use `amount` or descriptive money field names without a currency suffix. Merchandise acquisition and agreed Sale prices may be zero; Payment, refund, and expense sources must be positive. Confirmed-zero expenses are completeness facts. No currency conversion, FX rate or operational foreign-currency equivalent is supported; the administrator determines the correct amount in the Organization's currency before entry.
- **REQ-009 — Individual item identity:** Use integer database keys and a separate automatically assigned, immutable, short readable InventoryItem identifier (`inventoryId`), written on the physical box and assigned at ordinary Purchase registration including preorders. It is unique within its Organization, never reused, and may have gaps; its format is not fixed (ITEM-000001 was only an example). Keep it through receipt, removal, Sale, Return, and resale; legacy mapping remains T05.
- **REQ-010 — Atomic business events:** A single administrator action must generate all required corresponding inventory movements, financial changes, allocations, audit entries, and dependent recalculations as one logical, all-or-nothing operation. The administrator must not have to manually create multiple secondary records for a single event.
- **REQ-011 — Dated history and original-period results:** Preserve original and changed facts with each action's actual occurrence/recording time. Reports recompute current corrected Sale results, Returns, retained income, and actual SaleExpenses in the original Sale period; Loss removal and linked SupplierRefunds recompute the original Loss period. Actual cash keeps its actual occurrence date. Do not create generic independent signed financial-adjustment transactions or stored monthly report entities.
- **REQ-012 — Separated dimensions:** Physical possession, inventory eligibility, customer-sale commitment, payment status, purchase status, and shipment status must not be conflated merely because the UI presents concise labels.

## 2. Organizations and users

- **ORG-001:** Support multiple organizations.
- **ORG-002:** InventoryItems, Customers, Suppliers, transactions, allocations, expenses, and collection membership belong to one Organization. Product is a global shared catalog record with no owning Organization; User is an identity and Membership connects User to Organization.
- **ORG-003:** Users may belong to multiple organizations in a future version.
- **ORG-004:** The initial installation has one administrator.
- **ORG-005:** Authorized administrators operate business records within Membership/Organization scope. Existing shared Product edits additionally require global User can_edit_products, default false and granted to the initial administrator at bootstrap. Authorized Organization administrators can register new Products without that edit permission; unit-photo management uses the owning Organization authority.
- **ORG-006:** Public visitors cannot create or modify Sales, reservations, payments, inventory, or other system records.
- **ORG-007:** Exclude Customer/Supplier/private unit data, costs, accounts, and financial facts from public responses. Apply the approved Product/unit field allowlist and omit available stock counts and ordinary-unit lists that reveal quantities; internal shared Product access does not widen public visibility.
- **ORG-008:** Each Organization’s operational and private records are isolated from other Organizations. All Organizations may find, view, and select global Products; this exception grants no access to another Organization’s units or operations.
- **ORG-009:** Operational allocations, refunds, settlements, and Item commitments stay within one Organization. Every customer allocation targets exactly one SaleItem belonging to that Customer and Organization; one Payment may span several such Sales. Supplier funding stays with its Supplier. Global Product references are permitted without cross-account funding transfers.
- **ORG-010 — Organization currency:** Each Organization chooses its currency once, when it is created: BRL (the default) or USD. Nobody can change it afterwards, not even a `global_admin`, because every amount the Organization records is in that currency (REQ-008). The public catalog shows the currency's symbol with each price: `R$` for BRL and `US$` for USD.
- **ORG-011 — Organization nickname:** Each Organization has a unique nickname, set once when it is created. Regular users cannot change it; only a `global_admin` can rename it. The public catalog URL identifies its Organization by this nickname. Allowed characters, length, letter case, and whether old links redirect after a rename remain D04/E10.

The [technical direction record](../technical/technical-direction.md) captures the subsequently approved Google-only Firebase sign-in, ID tokens, active-use refresh, explicit logout, and initial administrator identity; on 2026-11-01 the owner added a 7-day session limit from the last Google sign-in. Users have a global role (`global_admin`, `editor`, `user`) and each Membership a role (`owner`, `editor`, `viewer`), approved on 2026-10-23; revoking a Membership deletes it while audit keeps the grant and revocation. T02 maps these roles' capabilities alongside the global `can_edit_products` permission. The bootstrap creates the first Organization, with its name, nickname and currency. How further Organizations are created, including invitations, is TBD until the website is developed (Section 14). Remaining session, bootstrap, recovery, and detailed authorization design belongs to T02; Membership and Organization isolation still apply.

## 3. Products and models

A **Product** is a global miniature-model identity shared by every Organization, independent from individually ordered or owned units. It has no owning Organization. Unit stock, prices, costs, private notes, and transactions remain within the owning Organization.

- **PRO-001:** Product name is mandatory.
- **PRO-002:** SKU is mandatory, **but not globally unique**; uniqueness is not enforced by this specification.
- **PRO-003:** Brand is mandatory.
- **PRO-004:** Other Product fields are optional unless specified otherwise.
- **PRO-005:** Each Product has a unique global integer database ID separate from its mandatory nonunique SKU; Product has no owning Organization.
- **PRO-006:** Optional shared descriptions and images (a list of image references) and a boolean `is_chase` flag are supported; scale and product codes were removed on 2026-10-23. The public Product allowlist is name, SKU, brand, description and images; whether `is_chase` appears publicly remains D04. Unit public descriptions/photos are separate from shared metadata and private unit notes.
- **PRO-007:** Multiple physical InventoryItems, including units owned by different Organizations, may reference the same global Product ID. Operational records reach Product through InventoryItem; a PurchaseItem groups units of the same Product.
- **PRO-008:** Product identity is separate from individual condition, acquisition cost, asking price, and transaction history.
- **PRO-009:** A Product need not have a collection InventoryItem in any Organization. Collection membership belongs to an InventoryItem, not Product.
- **PRO-010:** Separate shared Product metadata from Organization-private unit notes, condition, asking price, costs, and transactions. Unit-private notes are sufficient; no independent private Product annotation structure is required. Historical screens use current shared metadata with global change audit. Public unit descriptions/photos are distinct and managed by authorized Organization administrators without global Product-edit permission.
- **PRO-011:** Administrator Product quantities distinguish active ordered/owned, physically on-hand, and available units within the applicable Organization. Global model count is distinct from owned stock. Available stock quantities and ordinary-unit lists revealing counts are excluded from public catalog responses.
- **PRO-012:** Registering Product P through Organization A makes the same global Product ID immediately available to every Organization to find, view, and select for its own InventoryItems. No copy, sharing grant, or membership in A is needed.
- **PRO-013:** Product has no owning organization_id. Product registration and access require no owned InventoryItem; registration provenance does not confer ownership. InventoryItems and operational/private data remain organization-owned.

The public field allowlist is approved (PRO-006, INV-015); detailed search, filters and unknown-condition presentation remain D04.

## 4. Inventory and individually identified items

An **Inventory Item** represents exactly one ordered physical miniature. It receives its permanent Item ID upon inclusion in a Purchase, even if it will arrive months later. Identical Products can have different Item IDs, costs, conditions, prices, and histories.

### Required item information and relationships

- **INV-001:** Assign one integer database identity and one separate immutable readable Item identifier automatically at ordinary Purchase registration, including preorders. The readable identifier is unique per Organization, never reused, and gaps are allowed; receipt does not create a new identity.
- **INV-002:** Each InventoryItem belongs to exactly one Organization and references one global Product. Different Organizations may own distinct units of the same Product.
- **INV-003:** Items record sealed/open condition when known. An unknown condition stays unknown, and not-applicable counts as unknown (2026-10-23).
- **INV-004:** Items record whether they have damage when known, with an optional damage description. An unknown condition stays unknown, and not-applicable counts as unknown (2026-10-23).
- **INV-005:** Item state and collection designation are tracked without conflating ownership, possession, sale commitment, and eligibility.
- **INV-006:** Every Item retains its originating Purchase Item or equivalent acquisition relationship.
- **INV-007:** Retain funded/shipped SaleItem and Return/resale relationships for each physical Item. A never-funded SaleItem may be deleted only before dispatch with generated dependent Sale records removed and explanatory Sale/Item audit retained. Reintroduction creates a new SaleItem for the same InventoryItem; any past positive funding permanently blocks deletion.
- **INV-008:** Organization-private unit notes are supported on InventoryItem; a separate private unit description is not kept (2026-10-23). Sharing Product does not share these notes.
- **INV-009:** Current asking price is optional and is not an availability prerequisite. Public presentation uses a known price/range or Price on request as applicable; agreed SaleItem prices are separate and may be zero.
- **INV-010:** Current asking price is independent of agreed historical Sale Item prices.
- **INV-011:** Acquisition cost derives from the originating merchandise purchase price plus all applicable AcquisitionExpenseAllocations for that specific InventoryItem, including PurchaseExpenses shared across several Purchases. Linking an expense to a Purchase alone does not add cost to every unit in that Purchase.
- **INV-012:** Acquisition records and Item ID persist through receipt, sale, return, cancellation, collection changes, loss, and eligible soft deletion.

### Condition and approval

- **INV-013:** Damage is a condition attribute, not an availability status.
- **INV-014:** Updating damage information does not itself change sale availability.
- **INV-015:** Show condition/damage and relevant descriptions on administrator Item cards. Public unit descriptions and photos are optional, distinct from private notes and shared Product metadata. Perfect copies group by Product and sealed/open condition; special-condition units, including damage, receive individual cards without a separate manual special-condition flag.
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

Storage choices approved on 2026-10-23 represent these states without conflating them. A unit's sale disposition is one mutually exclusive `sale_status`: `unapproved`, `available`, `held` or `collection`. A collection unit is therefore never also approved for sale; moving to `available` ends collection membership and moving to `collection` ends sale eligibility, while first-approval and cost-finalization facts are kept. Incoming progress is a separate `status` (`china`, `brasil`, `eua`, `bolivia`, `shipped`, `received`); its transitions, and how its `shipped` relates to outgoing dispatch, remain T01.

- **INV-020:** Awaiting Arrival Items cannot appear as available and cannot be sold in v1; customer preorder sales are unsupported.
- **INV-021:** Items committed to **any** active Sale, whether Reserved or In Garage, must be absent from the available catalog.
- **INV-022:** Held-for-appreciation items remain owned inventory and count in applicable inventory-cost reporting.
- **INV-023:** Held items may be released for sale without losing their history.
- **INV-024:** A designated collection Item cannot be sold until the designation is removed and the Item is approved for sale.
- **INV-025:** The same Item ID cannot belong to more than one active Sale commitment. This must be enforced even under simultaneous operations.
- **INV-026:** Current state must be distinguishable from chronological historical events.
- **INV-027:** Atomically restore availability for an otherwise eligible approved physical unit after permitted never-funded unshipped SaleItem deletion or unshipped Sale cancellation. Retain its InventoryItem identity, identifier, condition, asking price, and locked acquisition cost. Funded SaleItems cannot be deleted merely to release stock; cancellation retains their funding/history.
- **INV-028:** Returning a shipped Item requires registration of physical receipt, its updated condition, and an administrator availability decision before it becomes available in the catalog.
- **INV-029:** Within each Organization, Item counts separately derive (a) active ordered/not received, (b) on hand including Received, Available, Held, Collection, Reserved and In Garage, (c) available for sale, (d) shipped/disposed, and (e) soft-deleted items excluded from active counts. Other Organizations’ units are excluded even when Product is shared.
- **INV-030:** First sale approval finalizes ordinary unit acquisition cost. Never-for-sale collection units may explicitly finalize once actual merchandise cost and applicable expenses are complete and settled. Finalized merchandise cost and acquisition-expense allocations lock permanently, including after sale approval or collection membership is removed.
- **INV-031:** Ordinary Open Purchase removal requires an unreceived unit with no unresolved supplier merchandise funding or acquisition-expense allocation. An expense allocation blocks removal even with zero merchandise payment; resolve it explicitly without automatic redistribution. Preserve the soft-removed physical identity/identifier and audit. Received units remain ineligible for ordinary removal.

### Permitted Item transitions

| From | To | Condition / event |
|---|---|---|
| Purchase registered | Awaiting Arrival | Assign one ID per ordered unit |
| Awaiting Arrival | Received — Not Approved | Full item supplier payment and applicable acquisition expenses settled; receive unit |
| Awaiting Arrival | Order Item Removed | Purchase Open; no receipt; supplier funding and acquisition-expense allocations resolved |
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
- **PUR-004:** Allocate a PurchaseItem merchandise total exactly across its generated units in integer cents, using exact arithmetic and largest fractional remainders with permanent Item ID tie-breaking. Allocations sum to the source total independently of screen order; zero merchandise prices are allowed.
- **PUR-005:** Bulk Purchase entry is supported.
- **PUR-006:** Creating a Purchase generates a permanent Item ID for every ordered unit, owned by the purchasing Organization and linked to its PurchaseItem and global Product. It does not wait for physical receipt.
- **PUR-007:** Retain each unit's merchandise acquisition allocation, including valid zero prices. New Purchases never replace older costs, and finalized unit merchandise costs and expense allocations remain permanently locked.
- **PUR-008:** Preorders with delayed/partial arrival are supported.
- **PUR-009:** Purchase and individual items support partial payment and partial receiving; units in the same Purchase may be paid/received months apart.
- **PUR-010:** Purchase lifecycle, receiving progress, supplier payment progress, and incoming shipping information are tracked separately.
- **PUR-011:** Received and outstanding ordered units are derived from individual active Item records.
- **PUR-012:** The administrator explicitly completes a Purchase only after **all remaining active ordered units have been received**. Missing units must first be removed under the applicable Item-removal rules; the system never silently treats them as received.
- **PUR-013:** Completion cannot leave unknown/unentered additional acquisition expenses for the completing Purchase. Evaluate its units and all applicable PurchaseExpenses, including shared expenses. Completing with no applicable expense allocations means confirmed zero additional expenses for that Purchase; an expense counts even if originally entered through another linked Purchase. Do not invent expense estimates or confirm zero for another Purchase.
- **PUR-014:** A Purchase with no applicable additional acquisition expenses can complete without PurchaseExpense records; this confirms an actual zero-expense case for its units only. A shared PurchaseExpense allocated to any of its units prevents treating that Purchase as having no additional expenses.
- **PUR-015:** Receipt does not itself approve an Item for sale.
- **PUR-034:** An individual ordered Item must have its **full supplier merchandise price paid and allocated** before physical receipt can be registered. Payment and receipt may be posted together in one atomic event.
- **PUR-035:** Physical receipt requires full merchandise funding and settlement of the expenses allocated to that unit, including shared sources. Receipt does not approve sale or by itself finalize cost. Expense allocation changes require an Open Purchase and an unfinalized unit; explicit collection finalization protects costs even without sale approval.
- **PUR-036:** Purchase Item edits are allowed while a Purchase is Open, but may remove only unreceived units; each unit's financial eligibility rules still apply.
- **PUR-037:** Soft-remove only an unreceived unit in an Open Purchase after both merchandise funding and acquisition-expense allocations are explicitly resolved. Preserve its permanent identity/identifier and audit while removing its active commitments/costs. An allocated expense blocks removal even if the unit has never received a supplier merchandise payment.
- **PUR-038:** Resolve applicable supplier payment and acquisition-expense allocations explicitly before ordinary unreceived-unit removal. Preserve shared sources, settlement, unaffected allocations, and permanent locks; do not automatically redistribute cost. A received unit is never eligible for ordinary Purchase removal.
- **PUR-039:** Replacing one removed ordered unit with another model/unit creates a **new** Item ID. The former ID remains soft-deleted and cannot be reused.
- **PUR-040:** First sale approval finalizes ordinary units even in an Open Purchase. Independently permit explicit finalization of never-for-sale collection units once actual merchandise/expense costs are complete and settled. Receipt/completion or another unit's approval does not finalize this unit; removing approval/membership never unlocks finalized costs.
- **PUR-041:** Completed Purchases are firmly locked against corrections. Eligible shared-expense changes confined to other Open Purchases may proceed only while preserving completed-Purchase facts, finalized unit costs, unaffected allocations, and exact source reconciliation. D06 does not authorize an implicit unlock.

### Additional acquisition expenses

Examples include actual freight, forwarding, import taxes, and other legitimate acquisition costs. **Insurance-related features are not within the agreed application scope.**

- **PUR-016:** Record each actual acquisition expense once as an organization-owned PurchaseExpense with its own identity, amount, date, category/context, and settlement information, separately from merchandise prices. It links to one or more Purchases and has unit-level AcquisitionExpenseAllocations; it is not exclusively owned by one Purchase. A standalone general expense-management module is not required.
- **PUR-017:** Record actual known expenses, never fabricated estimates.
- **PUR-018:** Allocate a PurchaseExpense directly to the specific InventoryItem IDs it concerns, tracing each unit through its PurchaseItem to its Purchase. A selected subset may span several linked Purchases. Do not allocate money to Purchase headers or automatically spread it over all units in those Purchases.
- **PUR-019:** Use merchandise-value-proportional allocation by default, equal per physical unit, or manual allocation over selected applicable units across Purchases. Automatic methods use exact arithmetic and largest fractional remainders with permanent Item ID tie-breaking. All-zero merchandise weights require explicit equal-unit/manual selection; do not silently change method.
- **PUR-020:** Proportional to merchandise value is the default, using only the merchandise values of the selected applicable InventoryItems, regardless of which linked Purchase each unit belongs to.
- **PUR-021:** All selected unit allocations reconcile once to their positive PurchaseExpense source in integer cents. Largest fractional remainders with permanent Item ID tie-breaking allocate exact cent remainders. R$100 over three equally weighted units is 3334, 3333, 3333 cents. Purchase subtotals derive from units; never duplicate the source across Purchase joins.
- **PUR-022:** While a Purchase is Open, distinguish unentered/unknown applicable expenses from expressly confirmed zero. Include shared PurchaseExpenses allocated to its units, regardless of the entry point. On completion, apply PUR-013 to this Purchase only; another linked Purchase retains its own completeness state.
- **PUR-023:** Track actual cost completeness and permanent finalization independently of sale eligibility. Known incomplete/unfinalized acquisition costs and recovery metrics are displayed as provisional; do not invent missing expenses. An eligible never-for-sale collection unit can explicitly finalize complete/settled costs.
- **PUR-024:** Unit landed cost is its merchandise cost plus its actual AcquisitionExpenseAllocations. An unselected unit receives none of a shared expense; incomplete known actual costs are provisional. Finalization permanently protects the contributing merchandise and expense allocations.

- **PUR-047:** A positive PurchaseExpense belongs to one Organization and can concern several Purchases. Derive its Purchase links exclusively from selected InventoryItem allocations and their originating Purchases; do not maintain an independent purchase_expense_purchases association. Record its source/settlement once.
- **PUR-048:** Each AcquisitionExpenseAllocation identifies exactly one PurchaseExpense and InventoryItem in the same Organization. Derive the linked Purchase through InventoryItem/PurchaseItem. For a saved fully allocated expense, Purchase context is exactly the distinct Purchases of allocated units; no duplicate current expense/unit cost line or independent association is maintained.
- **PUR-049:** Apply shared expense/allocation/completeness changes atomically with exact reconciliation and history. Expense allocations block ordinary unit removal until explicitly resolved. Preserve the shared source/settlement, unaffected allocations, completed-Purchase facts, and permanently finalized costs; changes confined to eligible other Open Purchases do not unlock protected facts. Exceptional unresolved disposition remains D06, without automatic refund, write-off, redistribution, transfer, or unlock.

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
- **SAL-007:** The agreed SaleItem price is separate from optional current asking price and may be zero. No separate discount entity is required: asking R$200 and agreement R$180 records R$180 on that SaleItem.
- **SAL-008:** Current asking-price changes do not alter prior agreed Sale Item prices.
- **SAL-009:** A Sale supports an optional shipment tracking code.
- **SAL-010:** Preserve original and changed Sale facts with actual occurrence and recording timestamps through creation, correction, cancellation, dispatch, and Return. Audit survives permitted never-funded pre-dispatch line deletion, with Sale/Item context. Historical screens display current Product metadata while transaction facts remain protected.
- **SAL-011:** Canceling an unshipped Sale immediately releases eligible Items to Available/catalog status and resolves affected customer funding through explicit refund, reassignment to eligible existing Sales/SaleItems, or legitimately earned retained income in the same business operation.
- **SAL-012:** **Cancellation** applies to an unshipped Sale; **Return** applies when a shipped Item has physically come back. These are distinct actions and histories.
- **SAL-038:** Before dispatch, correct agreed prices and eligible item membership while Reserved or In Garage. Only never-funded SaleItems may be deleted; any past positive funding blocks deletion even after refund/reassignment. Dispatch permanently locks agreement/shipment-status corrections. Actual SaleExpense recording/settlement remains allowed afterward.
- **SAL-039:** Deleting an eligible never-funded, unshipped SaleItem releases its otherwise eligible InventoryItem immediately and deletes generated dependent Sale records atomically while preserving action audit. Keep the physical Item identity, identifier, cost, condition, and asking price. Re-adding it creates a new SaleItem ID; funded/shipped lines cannot be deleted.
- **SAL-040:** Adding an Item through an unshipped Sale edit immediately commits it and removes it from the catalog; all item and financial changes occur atomically.
- **SAL-041:** Apply pre-dispatch corrections to source amounts, line funding, debt, status, original-period profit, and audit atomically. Resolve released money into a refund/pending obligation or eligible existing SaleItem reassignment of the same Customer/Organization; recognize legitimate retained income separately. Price corrections do not erase funded line history or create cash/wallet credit.
- **SAL-042:** An emptied Sale becomes Canceled and is retained. Operational hard deletion is permitted only for never-funded SaleItems before dispatch, with generated dependent Sale records deleted and audit retained. Any past positive funding permanently forbids deletion, even after complete refund/reassignment; shipped lines remain for Return identity.
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
- **SAL-021:** Cancel an unshipped Sale atomically while resolving funded amounts into refunds/pending obligations, reassignment to eligible existing SaleItems of the same Customer/Organization, or legitimate retained income. Keep funded SaleItems and audit; update the original Sale-period economics without creating generic later-period adjustment transactions.
- **SAL-022:** Cancellation supports no, partial, or full actual refund and separately records funding reassignment, any pending refund obligation, and legitimately retained income. Refund percentage and settlement completion are distinct.
- **SAL-023:** Cancellation releases only physically held, approved, otherwise eligible Items; Items that are not eligible must remain excluded from the catalog until appropriate approval.
- **SAL-044:** When a Sale's outstanding balance becomes zero, it immediately becomes **In Garage** (fully paid and eligible for dispatch), with no additional readiness confirmation.
- **SAL-045:** A Sale must be **In Garage** before it may be marked Shipped in the normal workflow.
- **SAL-046:** A payment or item/price edit that creates a positive outstanding balance on an unshipped In Garage Sale returns it to Reserved.
- **SAL-047:** A Sale recorded as Shipped cannot be canceled by the ordinary cancellation workflow; a shipped Item that returns is processed as a Return.

There is **no automatic reservation expiration** in v1.

### Sales and profit recognition

- **SAL-024:** An active Sale contributes booked merchandise amounts and specific finalized Item costs from its original business occurrence timestamp, even when unpaid/Reserved. This occurrence is distinct from technical recording time; UTC determines the reporting period.
- **SAL-025:** Receipt/completion of customer payment is **not** a prerequisite for recognizing Sale or collection-recovery profit.
- **SAL-026:** Permitted pre-dispatch item/price changes are corrections of the original Sale; cancellation/Return removes affected merchandise revenue and matched acquisition-cost contributions from that original Sale period. Retained income and actual SaleExpenses also belong there. Keep action audit times and actual cash dates separately; refund settlement does not reverse profit twice.
- **SAL-027:** Status and applicable date/filter controls are supported for administrator reports; precise launch set remains open.
- **SAL-028:** Administrator reporting distinguishes Reserved, In Garage, Shipped, Canceled, Partially Returned, and Returned Sales and their auditable source changes. Current source results recompute original Sale periods; there is no independent generic signed-adjustment transaction or stored monthly report entity.

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

**Exchange example:** An unshipped Sale initially contains Item A for R$100, fully paid. The customer switches to Item B for R$80. The administrator corrects the same Sale: A returns to Available and its funded SaleItem is retained with its funding history, because a once-funded line cannot be deleted; B is committed; R$80 of A's funding is reassigned to B's SaleItem, and R$20 is refunded or reassigned to an eligible existing SaleItem of the same Customer and Organization. A chosen but unpaid refund remains an explicit obligation, not future-Sale credit. If B costs R$120, all R$100 moves to B and the Sale becomes Reserved with R$20 outstanding instead.

## 8. Customer payments, allocations, reassignment, and refunds

A customer Payment represents the **merchandise portion** of incoming money recorded in storage-minis. Shipping amounts paid by customers are deliberately outside application scope and are not included in recorded customer Payment amounts, Sale dues, revenue, or expenses. The application is **not** a complete reconciliation of bank deposits containing customer-paid shipping.

### New customer payments and Sale allocations

- **PAY-001:** Each Payment records the actual **merchandise amount recognized by this application**, date, method, organization, and Customer.
- **PAY-002:** When a new Payment is entered, the administrator selects the Sale(s) it pays.
- **PAY-003:** Each CustomerPaymentAllocation must identify exactly one SaleItem; Sale-level-only allocation is forbidden. Reach Sale through the line or enforce any redundant Sale scope key against it. Customer/Organization must match the Payment; each allocation contributes once to Sale funding.
- **PAY-004:** One CustomerPayment may allocate across multiple SaleItems from multiple existing Sales of the same Customer and Organization, within source and line-obligation limits.
- **PAY-005:** One SaleItem may receive several CustomerPayments. Derive Sale funding through its mandatory line allocations and never count one allocation twice.
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
- **PAY-017:** Preserve original Payment provenance and dated before/after allocation facts through correction, refund, and reassignment. Any past positive allocation permanently protects its SaleItem from deletion even after active funding becomes zero; real cash and retained settlement history remain explainable.
- **PAY-018:** Internal allocation changes do not create or destroy real cash movements.
- **PAY-019:** Payment registration and allocation remain conceptually distinct, though they may share one administrator screen/atomic transaction.
- **PAY-020:** Sales that are canceled, edited, or returned retain payment history and financial reconciliation.
- **PAY-030:** Every allocation belongs to a Sale of the **same Customer and organization** as the underlying Payment. Cross-customer/organization transfers are not permitted.
- **PAY-032:** Resolve funding released by correction/cancellation/Return through explicit refunds/pending obligations or eligible existing SaleItem reassignment within the same Customer/Organization. Keep original Payment provenance and exact source/outcome reconciliation, with legitimate retention separate. Never create reusable credit or consume a portion twice.

**Shipping example:** The miniature sells for R$100; the customer transfers R$115 including R$15 shipping. storage-minis records a **R$100 Sale and R$100 customer Payment**. The R$15 shipping component is not tracked in storage-minis. Business-paid selling/delivery costs, however, are recorded separately where applicable.

### Refund and financial-settlement concepts

A **Refund** is money actually sent to a Customer. Reassignment moves existing Payment funding to an eligible existing Sale/SaleItem without new cash. A pending refund obligation is unavailable for future spending. There is no customer wallet or reusable credit. **Retained income** is an amount actually received and validly kept after a canceled or returned Sale, recorded as a separate economic result rather than retaining reversed Sale revenue.

- **PAY-021:** Refund classification is **None**, **Partial**, or **Full**, according to how much of the affected merchandise amount actually paid has been sent back. Track settlement completeness separately from refund percentage.
- **PAY-022:** Actual refunds create outgoing financial records.
- **PAY-023:** A chosen refund may return less than the original paid amount but must be paid in one cash transaction; refund installments are unsupported. A paid R$100 Return may resolve as one R$70 refund and R$30 legitimate retained income. Pending refund obligations remain explicit and unavailable for spending.
- **PAY-024:** A cancellation/Return may have no actual refund because nothing was paid, funding is reassigned to eligible existing SaleItems, legitimate retained income applies, or the chosen refund remains pending. Reconcile all outcomes without future-Sale credit and distinguish actual refund percentage from settlement completion.
- **PAY-025:** A CustomerRefund preserves original Sale/settlement and Payment-allocation provenance, amount, and actual cash timestamp. Consume applicable original Payments from oldest to newest, not proportionally; several original source portions may fund one single-disbursement refund. Equal-time tie-breaking and non-refund source order remain design work.
- **PAY-026:** A Refund is not a new incoming Customer Payment.
- **PAY-027:** Cash refunds, pending obligations, and reassignment update accounts without subtracting an already removed merchandise profit again. Economic source corrections recompute the original Sale period; actual refund cash retains its payment date.
- **PAY-028:** Partial refunds are not mislabeled as full refunds.
- **PAY-029:** Sale cancellation/return status, refund percentage status, and financial settlement completion are distinct.
- **PAY-033:** Represent customer settlement headers and source allocations in separate customer_settlements/customer_settlement_source_allocations storage, distinct from supplier settlement structures. Preserve actual cash Refund records, internal reassignment, pending obligations, and legitimate retention as distinct outcomes; none duplicates original merchandise-profit removal.
- **PAY-034:** Attribute legitimately retained income exactly to affected SaleItems/models of the same Organization and the original Sale reporting period. Multi-model administrator allocations sum to retained income; they never recover another Organization's collection cost.
- **PAY-035:** Refund/reassignment obligations and legitimately retained income with its model allocations arise within the originating Sale edit/cancellation/Return business operation, not duplicate manual steps. No customer-credit record or wallet is created.
- **PAY-036:** Refunds, cancellations, funding reassignments, and allocation corrections leave no negative Sale or Customer debt. Money owed to a Customer is a traceable refund obligation, never negative debt or reusable credit.
- **PAY-037:** Reassign released original funding only to eligible existing SaleItems of the same Customer/Organization up to their outstanding obligations. Preserve original Payment and source-allocation provenance, reject concurrent double consumption/refunding, and create no cash or profit. Source ordering for non-refund outcomes remains to be specified.
- **PAY-038:** Preserve a chosen unpaid refund as an explicit source-linked obligation and settlement state, unavailable for spending and distinct from actual CustomerRefund cash. Settle its chosen amount once in one cash transaction; installments are unsupported. Reserve/reconcile source portions so they cannot also be reassigned/refunded.

**Partial-refund example:** A Sale for R$100 is fully paid; after a shipped return the administrator physically receives the same Item and refunds R$70 in one payment. The returned line's revenue and matched acquisition cost leave the original Sale period, and the remaining R$30 is recorded once there as **retained return income** attributable to the Item's Product. The R$70 refund is cash on its actual payment date. The Item becomes physically owned inventory again, with availability as explicitly determined in the Return registration.

## 9. Customers and customer accounts

- **CUS-001:** Each Customer has a record.
- **CUS-002:** Require a nonblank Customer name. Telephone and address are optional; address remains embedded on Customer and private.
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
- **RET-006:** Preserve original shipped Sale/SaleItem and physical Item relationships through Return and later resale. A funded/shipped SaleItem is never deleted to represent an exchange; separate eligible never-funded pre-dispatch deletion retains its audit context.
- **RET-007:** A Return settles paid amounts through actual Refund, reassignment to eligible existing Sales/SaleItems of the same Customer and Organization, legitimate RetainedIncome, or an explicit combination. A pending refund is an obligation, not credit for future Sales.
- **RET-008:** Register Return occurrence, physical receipt/condition/eligibility, source changes, settlement, audit, and dependent reports atomically. Remove only returned lines' merchandise revenue and matched acquisition-cost contributions in the original Sale period, retaining actual action/cash timestamps.
- **RET-009:** A returned physical Item may become catalog Available immediately **when** the Return operation registers physical receipt, updates condition, and explicitly confirms its eligibility. Otherwise it remains physically held but unavailable until approved.
- **RET-010:** A returned Sale is distinguished from a canceled unshipped Sale.
- **RET-011:** Remove returned merchandise revenue and matched specific acquisition-cost contributions from the original Sale period. Attribute legitimate retained income there once, preserve actual SaleExpenses after Return/cancellation, and keep refund cash on its actual date without a duplicate profit reversal.
- **RET-012:** If only some Items are returned, adjustments apply to those Sale Items rather than indiscriminately reversing the full Sale.
- **RET-013:** Items returned from shipped Sales can later be sold again under the **same persistent Item IDs**, with complete original and subsequent Sale histories.

**Remaining return-accounting detail:** Every customer allocation identifies one SaleItem, and refunds consume original Payments oldest first (D01, 2026-10-22). Equal-time tie-breaking and the source order for non-refund outcomes (reassignment and retained income) still need an explicit rule. See Section 14.

## 11. Personal collection and collection-cost metrics

Each Organization has one implicit collection. Membership is on its InventoryItems. Within that Organization, a Product may have multiple units but at most one current collection unit; another Organization may collect its own copy of the same Product. All formulas below use only the applicable Organization’s costs and eligible profit.

- **COL-001:** Each Organization has exactly one implicit collection, defined by membership on its own InventoryItems (`sale_status = collection`, 2026-10-23). A Product may have no collection unit. No separate Collection or baseline CollectionDesignation entity is required.
- **COL-002:** At most one current collection InventoryItem per Organization + global Product is permitted, including under concurrent changes. Different Organizations may each designate one of their own units of the same Product.
- **COL-003:** When an administrator intentionally adds an Item of a Product to that Organization’s collection for the first time, that Item is designated. Registering Product alone creates no membership.
- **COL-004:** An administrator may explicitly replace the collection unit within their Organization. Remove the old designation before or atomically with the new designation and preserve dated history; other Organizations are unaffected.
- **COL-005:** A designated collection Item cannot be sold.
- **COL-006:** Before sale, remove the collection designation and explicitly make the Item Available.
- **COL-007:** Removing a designation does not automatically pick a replacement.
- **COL-008:** Preserve dated InventoryItem collection membership changes in shared business/audit history, with Organization scope. A separate designation table is not required.
- **COL-009:** The collection InventoryItem's original acquisition cost derives from its own merchandise acquisition amount and its specific AcquisitionExpenseAllocations, including shared PurchaseExpenses. Expenses allocated only to other units do not change this unit's cost.
- **COL-010:** Calculate per-model net collection cost from the current designated unit and signed eligible model gross profit/attributed retained income within its Organization, preserving the zero floor and separate excess. Negative R$20 recovery against a R$100 unit yields R$120 net model cost; it never changes locked acquisition cost.
- **COL-011:** Calculate pooled recovery independently from the current Organization collection base and signed eligible whole-collection profit, including applicable Sale-level expenses once, with a zero floor and separate excess. R$200 base, R$60 profit, and R$20 loss gives R$160 before other applicable expenses; another Organization never contributes.
- **COL-012:** Collection-cost metrics are management indicators; they do not replace acquisition cost or ordinary financial profit.
- **COL-013:** Net Collection Cost is never less than zero.
- **COL-014:** Profit exceeding a collection-cost floor remains separately visible rather than disappearing.
- **COL-015:** Current collection membership drives source-derived acquisition cost and recovery. Display known actual incomplete/unfinalized costs and recovery as provisional without inventing missing expenses; finalized acquisition costs remain permanently locked. No past-date designation/cost report is required. Preserve ordinary action audit and separate model/pool calculations using signed eligible profit.
- **COL-016:** Retain ordinary dated membership audit per Organization/InventoryItem/Product for addition, replacement, and removal. Metrics use current membership; this audit does not require a historical as-of-date collection report.
- **COL-017:** Recovery eligibility begins at the qualifying Sale's original business occurrence, independently of customer payment. Permitted corrections, cancellation/Return, and retained income recompute the original Sale-period contribution; preserve each later action's own audit/cash times.
- **COL-018:** Profits from other units of a model may count toward its collection cost even if those Sales occurred **before** the model's collection Item was designated.
- **COL-019:** Excess model-specific profit is **not transferred to the Net Collection Cost of another individual model**. Whole-collection recovery is a separate, independently calculated aggregate metric and may be zero even when the sum of per-model costs remains positive.
- **COL-020:** Use signed SaleItem gross profit plus attributed retained income and current source corrections for per-model recovery, including negative contributions. Shared Sale-level expenses remain at Sale level rather than being spread among models; original-period attribution follows the approved reporting rules.

### Per-model formula (conceptual)

**Net Collection Cost per model** = `max(0, original acquisition cost of that model's currently designated collection Item − eligible model-level profit from sales of other units of that Product)`.

Eligible model-level profit is signed. It includes current corrected booked gross Sale Item profits and attributed retained income; cancellations and returns remove the affected lines from the original Sale period. Payment receipt is irrelevant to profit eligibility.

### Whole-collection formula (conceptual)

**Net Whole Collection Cost** = `max(0, combined original acquisition costs of current designated collection Items − eligible whole-collection profit)`.

The whole-collection metric is independently pooled and need not equal the sum of per-model net costs. Whole-collection profit considers relevant Sale-level selling expenses rather than allocating them arbitrarily to models. Original acquisition costs, profit used for recovery, and excess profit remain separately visible.

**Example:** Two collection Items each cost R$100. Model A has R$200 eligible profit; model B has R$0. Model net costs are R$0 and R$100 respectively. Under pooled whole-collection recovery, the whole-collection net cost may be R$0. This is deliberate, not a reconciliation error.

**Decided (2026-10-22):** metrics use current collection membership, with no past-date designation report (D02). Eligible profit is signed, so negative profit can raise net collection cost above acquisition cost (D03): a R$100 collection unit with R$20 negative model profit has R$120 net model collection cost.

## 12. Expenses, losses, financial metrics, and reporting

### Expenses and currency scope

- **FIN-001:** Actual acquisition expenses are separate from merchandise purchase prices. A shared PurchaseExpense and its settlement are recorded once; unit costs and per-Purchase subtotals derive from allocations, so joining several Purchases must not duplicate expense amounts, cash, or acquisition cost.
- **FIN-002:** Selling expenses are Sale-owned SaleExpenses for the Sale as a whole, not individual SaleItems. PurchaseExpenses belong to one Organization, may link to several Purchases, and allocate cost to specific InventoryItems. Expense entry stays available within the applicable Purchase/Sale workflows. A PurchaseExpense or SaleExpense may be paid in several partial payments, each with its own amount, actual time and method; the cumulative paid amount never exceeds the expense, and receipt still needs full settlement (2026-10-23). No installment schedules, payment batching across expenses or general expense-management module is added.
- **FIN-003:** Customer-paid shipping amounts are **entirely out of scope**: not entered as customer Payment, Sale charge, shipping income, or associated shipping-cost line. A merchandise-only Payment can differ from the actual full bank transfer when shipping is included.
- **FIN-004:** Shipping paid by the business and other applicable Sale expenses are recorded at Sale level.
- **FIN-005:** Distinguish contractual amounts due from money actually received or paid.
- **FIN-006:** Preserve source amount, method, Organization, and typed relationships together with the actual business occurrence timestamp distinct from recording time. Capture input timezone and convert the instant to UTC; reports use UTC and timestamp display is visitor-local.
- **FIN-007:** Each Organization's amounts and reports are in its own currency (REQ-008, ORG-010). No in-app FX conversion; amounts are never combined across Organizations.
- **FIN-008:** Administrator financial reports use only the applicable Organization’s operational sources, even when grouped by global Product. Precise report list and filters remain D05.
- **FIN-009:** Keep selling expenses at Sale level without model gross-profit allocation. Actual SaleExpenses reduce the original Sale period's net result once, including expenses incurred/recorded after dispatch and after cancellation/Return. Keep actual expense/payment times for expense/cash views; customer-paid shipping stays outside recorded money.
- **FIN-010:** Recognized Sale profit is independent of Customer payment timing. Payment status changes Customer Debt / Total Customers Debt and cash/account records, but not earned Sale/collection profit by itself.
- **FIN-011:** Recompute original Sale/Loss periods from corrected current sources. October Sale R$120/cost R$80 corrected to R$100 in November has October merchandise profit R$20; the correction has its own audit time, not a generic November profit adjustment. Returns, retained income, later SaleExpenses, Loss removal, and linked SupplierRefunds use the approved original-period attribution; cash keeps actual dates.
- **FIN-012:** Actual refunds, pending refund obligations, and funding reassignments are reconciled settlement outcomes linked to original funding, not duplicate Sale revenue/profit. Original Sale-period source results include Return/retained-income effects once; actual refund cash remains dated when paid.

### Explicit losses and automatic consequences

- **LOS-001:** Explicit Loss events are not treated as ordinary Sales.
- **LOS-002:** A Loss event records amount, date, reason, and relevant Item/Purchase/Sale relationship.
- **LOS-003:** Removing a mistaken Loss removes its original-period report contribution with original facts, before/after audit, and consistent stock consequences retained; removal alone implies no cash. A later actual SupplierRefund linked to an October R$100 Loss for R$40 in November gives October net Loss R$60 and November incoming cash R$40. No LossRecovery entity, generic independent adjustment transaction, duplicate income, or insurance feature is introduced.
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
- **CALC-006:** Book agreed merchandise amounts less specific finalized Item costs from original Sale occurrence even while unpaid. Recompute its original-period result after corrections/cancellation/Return, retained income, and all actual SaleExpenses; deduct each component once and retain actual cash dates separately.
- **CALC-007:** Derive recovery from signed eligible booked Sale/model profit and attributed retention using current corrected sources, never customer-payment timing. Keep current collection membership, model versus pool formulas, zero floors, excess profit, and Organization isolation distinct.
- **CALC-008:** Average acquisition cost uses full merchandise-plus-allocated-expense costs of currently on-hand units, including received/unapproved, Available, Held, Collection, Reserved, and In Garage. Exclude awaiting, dispatched, removed, and disposed units. Label included incomplete known actual costs provisional; never pool other Organizations or invent missing expenses.
- **CALC-009:** Distinguish known provisional acquisition costs/recovery from complete permanently finalized costs. First sale approval requires finalized cost; never-for-sale collection units may independently finalize actual complete/settled costs without sale eligibility. Removing approval/membership does not unlock them.
- **CALC-010:** Source corrections atomically refresh dependent balances, quantities, recovery, and original-period Sale/Loss report results with preserved before/after action history. Derived caches reconcile to current authoritative sources; generic independent adjustment transactions are not selected.
- **CALC-011:** Provide average acquisition price, owned inventory cost, net model collection costs, net whole collection cost, accumulated profit/loss, available unit counts, Customer Debt, and Total Customers Debt.
- **CALC-012:** Derived caches must reconcile to sources. Shared Product metadata changes refresh affected permitted projections; stock, unit price, private facts, and financial caches retain Organization scope.
- **CALC-013:** Sales contribute to applicable metrics from the Sale's original business occurrence while Reserved, not from payment or shipment date.
- **CALC-014:** Provide administrator report filters within the applicable Organization by Item, global Product, Sale status, Customer, dates, and other D05 dimensions. A shared Product filter does not expose another Organization’s sources.
- **CALC-015:** Item gross profit is agreed price minus its specific finalized acquisition cost. Model-period gross profit derives current corrected merchandise results, removing returned/canceled lines' revenue and matched cost from the original Sale period and including model-attributed retained income there once. Sale-level expenses are not spread across models; negative eligible profit remains signed.
- **CALC-016:** Sale net profit in its original period is current corrected merchandise gross profit plus attributed legitimate retention minus its actual SaleExpenses once, including later expenses and expenses remaining after Return/cancellation. Whole-business results include distinct expenses and net Losses once; actual cash timestamps remain separate.
- **CALC-017:** Ordinary customer-payment timing changes debt and actual cash/settlement histories, not Sale profit, model profit, accumulated profit, Item cost, or collection recovery. Reassignment to another existing Sale creates no cash or profit event.
- **CALC-018:** Use actual UTC business occurrence instants distinct from recording timestamps. Original Sale periods recompute source corrections, cancellation/Returns, retained income, and SaleExpenses; original Loss periods recompute removal/linked SupplierRefund effects. Cash uses its actual date. October 31 22:00 UTC-03:00 is November 1 01:00 UTC and belongs to November. Reports/exports are queries, not monthly entities.

## 13. Data migration, backups, and technical requirements

### Spreadsheet migration

- **DATA-001:** Existing inventory is maintained in an Excel spreadsheet.
- **DATA-002:** Import existing spreadsheet data.
- **DATA-003:** Map spreadsheet rows to global Product identities and target-Organization InventoryItems, costs, condition, and collection membership. Reuse existing Products where explicitly matched; a repeated SKU alone does not establish identity.
- **DATA-004:** Preview invalid, missing, conflicting, and ambiguous global Product matches before import; SKU remains nonunique. Reuse never silently overwrites existing shared metadata. An approved metadata write requires global User can_edit_products and global audit; authorized new-Product registration does not require that edit permission. Actual source mapping remains T05.
- **DATA-005:** Preserve global integer Product identity versus Organization-owned integer InventoryItem identity and its separate readable identifier. Legacy readable identifier/date/cost mapping requires inspected T05 evidence; unknown historical facts remain explicit. Reconcile target units/referenced models separately from global Product growth.
- **DATA-006:** Validate the target Organization’s imported units, referenced Products, acquisition costs, condition, membership, and exceptions against the source spreadsheet before cutover. Reusing a global Product need not increase catalog count.
- **DATA-007:** Legacy units without Purchase history are grouped into one marked opening Purchase per Organization, Supplier and purchase year/month, using an Organization-owned unknown Supplier when the Supplier is missing. Each group is dated on the second day of its month at 00:00 UTC and stays identifiable as a migration convention (2026-10-23); this asserts no actual purchase date, and no payments or receipts are fabricated. Any other unavoidable assumption must be reviewed before import.

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

**Technical follow-up:** [Technical direction](../technical/technical-direction.md) records the selected monorepo stack (2026-10-21), PostgreSQL/Drizzle persistence, Google/Firebase authentication, UTC timestamp storage and financial reporting, and visitor-local timestamp display. The approved logs add integer keys and cents, exact largest-remainder allocation, and actual UTC occurrence timestamps. Numeric widths and overflow handling, input and period-filter contracts, the final schema, remaining session behavior, hosting, and operational targets still need their existing technical-task outputs. This is not implementation acceptance evidence.

## 14. Remaining open decisions (not yet approved business rules)

The core lifecycle decisions are agreed, and the approved logs resolved or narrowed D01–D08. The following **specific** matters remain unresolved and must not be silently treated as decided:

1. **Funding-source order (D01, [#15](https://github.com/WilliamPhilippe/storage-minis/issues/15)):** Refunds consume original Payments oldest first. Equal-time tie-breaking and the source order and attribution for non-refund outcomes (reassignment, retained income) remain to be specified.
2. **Collection history (D02, [#16](https://github.com/WilliamPhilippe/storage-minis/issues/16)):** Decided: current membership drives metrics, and no past-date designation report is required. Propagation and verification remain.
3. **Negative recovery (D03, [#17](https://github.com/WilliamPhilippe/storage-minis/issues/17)):** Decided: signed negative profit counts in per-model and pooled recovery, with zero floors and separately visible excess. Formula implementation and verification remain.
4. **Public catalog (D04, [#18](https://github.com/WilliamPhilippe/storage-minis/issues/18)):** Decided: one Organization per catalog URL, identified by its nickname (ORG-011); the field allowlist; grouping; optional prices shown with the Organization's currency symbol (ORG-010); unit photos; and hidden stock quantities. Open: detailed search and filters, unknown-condition presentation, whether `is_chase` and the damage description appear publicly, and the nickname's characters, length, letter case and redirects after a rename. Internal shared Product access does not approve cross-Organization public stock aggregation.
5. **Reports and dashboards (D05, [#19](https://github.com/WilliamPhilippe/storage-minis/issues/19)):** Decided: original-period recalculation and the on-hand average-cost basis. Open: the launch report and widget set, date ranges and filter contracts.
6. **Exceptional corrections (D06, [#20](https://github.com/WilliamPhilippe/storage-minis/issues/20)):** Decided: firm dispatch, completed-Purchase and finalized-cost locks, and deletion only of never-funded unshipped SaleItems. Open: exceptional correction authority and shared-expense disposition where ordinary resolution is insufficient; do not infer refunds, losses, transfers or unlocks.
7. **Shared Product maintenance (D07, [#79](https://github.com/WilliamPhilippe/storage-minis/issues/79)):** Decided: global `can_edit_products`, current metadata on historical screens, global audit and unit-only private notes. Open: typed audit, enforcement and bootstrap details. No archival, merge, deletion, or moderation feature is approved.
8. **Collection cost finalization (D08, [#80](https://github.com/WilliamPhilippe/storage-minis/issues/80)):** Decided: explicit finalization of complete, settled never-for-sale collection costs, permanent locks, and provisional display. Open: the concrete workflow and enforcement.
9. **Organization creation beyond the bootstrap:** How further Organizations are created, including invitations, is TBD until the website is developed (owner, 2026-11-01). The owner's first outline, not decided: a `global_admin` invites a person to a new Organization, and that person creates it on first sign-in, setting its name, nickname and currency once.

**Already decided; not open:** Item IDs at Purchase time, order payment before receipt, expense finalization on approval, confirmed-zero additional expenses on completion when no expense applies to that Purchase's units, including shared sources, only unpaid/unreceived units without unresolved expense allocations eligible for ordinary soft deletion, no selling preorders, one currency per Organization with no in-app FX, no readiness confirmation, same tracking number on several Sales, cash-payment-independent profit, original-period reporting, separate cancellation and Return, model-attributed retained income, and Sale-level selling expenses.

**Technical-phase rather than business-decision topics:** Complete remaining authentication/authorization design around the accepted choices, hosting, backups, browser support, performance, recovery targets, exact money/date contracts, and actual Excel import procedure. Accepted tools and UTC reporting are recorded in [Technical direction](../technical/technical-direction.md); these selections do not resolve D01–D08.

## 15. Readiness for implementation and acceptance scenarios

Before a production implementation, define the core entities and relationships, confirm remaining material financial edge cases, map the existing spreadsheet, and implement testable business invariants. The following representative scenarios must work as written:

| Test | Expected behavior |
|---|---|
| Purchase ten different units, some arriving months later | Ten persistent Item IDs exist; each unit independently shows awaiting/received and supplier payment status. |
| Pay and receive five of ten ordered units | Five paid/received units; five outstanding units; one still-Open Purchase, without requiring entire Purchase payment. |
| Attempt receipt of unpaid or partially paid Item | Reject receipt until its merchandise payment and applicable acquisition expenses are settled. |
| Soft-delete an unreceived, wholly unpaid ordered unit with no expense allocation | Preserve its Item ID and readable identifier as removed; exclude it from active quantity and supplier commitment. An unresolved expense allocation blocks the removal. |
| Attempt ordinary removal of received Item | Reject, even if the Purchase is Open. |
| Complete Purchase with no applicable additional expense allocations | Confirm zero for its units; include shared sources entered through another Purchase before deciding none apply. |
| P1 has I1/I2; P2 has I3/I4; I1 and I4 arrive together | One R$30 PurchaseExpense links P1/P2; allocate R$10 to I1 and R$20 to I4. I2/I3 receive none. Source/cash total is R$30; Purchase subtotals are R$10/R$20. |
| Apply value, equal-unit, or manual allocation to selected I1/I4 | Use only I1/I4 in the allocation basis; reconcile cents once across the expense. Do not include I2/I3 or split equally by Purchase. |
| Link/allocate shared expense to another Organization or an unlinked Purchase's unit | Reject atomically; no cost or settlement changes persist. |
| Receive I1/I4 with this shipping paid | Apply each unit's own merchandise/expense checks. I2/I3 remain outstanding; unrelated unit expenses do not block these receipts. |
| After I2 is also received, complete P1 while linked P2 remains Open | Count P1's actual allocated share; preserve P2's independent lifecycle/completeness. Changes confined to eligible P2 units preserve P1's locked facts and all finalized unit costs. |
| Remove/cancel a linked unit or attempt concurrent expense edits | Preserve the expense, settlement, history and unaffected allocations; require explicit valid resolution. Conflicting writes cannot overallocate or bypass Purchase/unit locks; unresolved exceptional disposition remains D06. |
| Approve Item for sale | Lock its acquisition cost; later ordinary acquisition expense changes for that Item are blocked. |
| Reserve available Item in unpaid Sale | Item disappears from catalog; Sale/item show Reserved; profit is recognized at the Sale's original business occurrence. |
| Fully pay a Reserved Sale | Sale and Item show In Garage; neither reappears in catalog; no readiness prompt. |
| Dispatch In Garage Sale | Sale/Item become Shipped; tracking code optional and may match another Sale's code. |
| Edit unshipped Sale from Item A to Item B | A immediately reappears in catalog; B is committed; payment allocations and released funding are refunded/reassigned explicitly without deleting A's funded SaleItem or its history. |
| Cancel an unshipped Sale | Eligible Items return to catalog; refunded/reassigned/legitimately retained amounts are recorded distinctly and auditable. |
| Return a shipped physical Item | Return references the original Sale Item and Item ID, the administrator updates condition/availability, and the returned line leaves the original Sale period's results; refund cash is dated when paid. |
| Return R$100 Item, refund R$70 | Remove the returned line's revenue and cost from the original Sale period and record R$30 retained model income there once; the R$70 is one cash refund on its own date, with no double subtraction. |
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
| Remove a mistaken October Loss in November; for another October R$100 Loss, receive a R$40 SupplierRefund in November | The removed Loss leaves October with no Loss and implies no cash. The other gives October a net Loss of R$60 and November incoming cash of R$40, counted once. |
| Lose a R$100 Item | One event creates Item write-off and R$100 economic loss only once. |
| Sale profit in October, cancellation in November | October's result is recomputed without the canceled merchandise profit, while actual SaleExpenses stay counted; the cancellation keeps its own audit time and refund cash its own date. Customer payment timing alone does not change profit. |
| Model A over-recovers collection cost, Model B does not | Model A floor is zero without transferring its excess to Model B; pooled whole-collection net cost is independently computed. |
| Delete a never-funded unshipped SaleItem, then try to delete a line that was once funded | The first is deleted with its audit kept, and re-adding the unit creates a new SaleItem; the second is rejected even after a full refund. |
| Refund R$70 for an item funded by an older R$40 and a newer R$60 Payment | Consume R$40 from the older and R$30 from the newer Payment, paid as one cash refund. |
| Pay a R$100 PurchaseExpense as R$30 and then R$70 | Expense cost is R$100 once; cash shows R$30 and R$70 on their own dates; receipt waits for full settlement. |
| A R$100 collection unit has R$20 negative model profit | Net model collection cost is R$120; the locked acquisition cost stays R$100. |
| An Organization is created with USD | Its amounts are USD cents and are never converted; its catalog shows US$; nobody can change its currency later. |
| A visitor opens an Organization's catalog by its nickname | Only that Organization's eligible units appear. A regular user cannot rename the nickname; a `global_admin` can. |

### Readiness statement

**The v0.8 core business lifecycle is consolidated, but the document is not a claim that every implementation/detail decision is finalized.** In particular, the open items in Section 14 — funding-source order beyond refunds, exceptional corrections, the catalog's search, filter and nickname details, launch reporting, shared Product and collection-cost enforcement, and Organization creation beyond the bootstrap — still need explicit closure or documented deferral.

## 16. Change record and requirement continuity

| Source | References | v0.8 change |
| --- | --- | --- |
| [2026-10-22 schema review](../requirement-updates/2026-10-22-schema-review.md), as propagated to the live issues that day | 82 IDs: REQ-002–003, REQ-006, REQ-008–009, REQ-011; ORG-005, ORG-007, ORG-009; PRO-005–006, PRO-010–011; INV-001, INV-007, INV-009, INV-015, INV-027, INV-030–031; PUR-004, PUR-007, PUR-019, PUR-021, PUR-023–024, PUR-035, PUR-037–038, PUR-040–041, PUR-047–049; SAL-007, SAL-010, SAL-021, SAL-024, SAL-026, SAL-028, SAL-038–039, SAL-041–042; PAY-003–005, PAY-017, PAY-023–025, PAY-027, PAY-032–034, PAY-037–038; CUS-002; RET-006, RET-008, RET-011; COL-010–011, COL-015–017, COL-020; FIN-006, FIN-009, FIN-011–012; LOS-003; CALC-006–010, CALC-015–016, CALC-018; DATA-004–005 | Each takes the approved current text from its delivery issues: integer keys and cents, readable unit identifiers, UTC occurrence timestamps, original-period reporting, SaleItem deletion and permanent locks, mandatory SaleItem funding, oldest-first refunds, separate settlements, allocation-derived expense links, signed collection recovery, the on-hand average basis, global Product-edit authority and the public catalog contract. |
| [2026-10-23 DBML review](../requirement-updates/2026-10-23-dbml-review.md) | REQ-009; INV-003–004, INV-008; PRO-006; COL-001; DATA-007; Sections 2 and 4 | Short `inventoryId` written on the box; nullable conditions and a damage description; no private unit description; Product images as a list, `is_chase`, no scale or codes; `sale_status` and incoming `status`; global and Membership roles; opening Purchases grouped by Supplier and month, dated on the second day. |
| [2026-10-23 index and candidate follow-up](../requirement-updates/2026-10-23-dbml-indexes-and-candidates.md) | PAY-033 | Confirms the four dedicated customer and supplier settlement structures already in PAY-033 and rejects the generic candidates; no further requirement wording changes. |
| [2026-10-23 partial expense payments](../requirement-updates/2026-10-23-partial-expense-payments.md) | FIN-002 | Expenses may be paid in parts, each payment with its own date and method; receipt still needs full settlement. |
| Owner, 2026-11-01 | REQ-008; ORG-010–011; FIN-007; PUR-004 and PUR-021 (cents); Sections 2 and 14 | One currency per Organization, BRL by default or USD, chosen once and never changed; amounts carry no currency; the catalog shows the currency's symbol. A unique Organization nickname, renamed only by a `global_admin`, identifies the catalog URL. Organization creation beyond the bootstrap, including invitations, is TBD. |
| Sections 4, 7, 8, 10, 11 and 15; CALC-013 | Examples, scenarios and consistency | Examples and acceptance scenarios follow original-period reporting, retained SaleItem funding, oldest-first refunds, partial expense payments, signed recovery, the Organization currency and the nickname URL. CALC-013 names the Sale's original business occurrence, as SAL-024 and CALC-018 already do. |

**Owner decisions of 2026-11-01.** During the review of the frontend foundation decisions ([PR #115](https://github.com/WilliamPhilippe/storage-minis/pull/115)), the owner decided that amounts carry no currency: each Organization decides once, when it is created, which currency its amounts are in — BRL by default, or USD — with no conversion. The back office shows `$`, and the public catalog shows the Organization's symbol, `R$` or `US$`. Each Organization also has a unique nickname, defined once when it is created; regular users cannot rename it, and only a `global_admin` can. Invitations and Organization creation beyond the bootstrap wait until the website is developed.

**Requirement inventory:** 309 active IDs = 307 v0.7 active + ORG-010–011. No newly retired IDs. Nine retired IDs remain SAL-029–035 (v0.5), PAY-031 and CUS-016 (v0.6); none is reused. All other v0.7 requirements carry forward. The [v0.8 ownership index](requirements-coverage-v0.8.md) assigns each active ID to one delivery issue; ORG-010–011 belong to [#117](https://github.com/WilliamPhilippe/storage-minis/issues/117). Historical change records remain in [v0.7](requirements-v0.7.md#16-change-record-and-requirement-continuity), [v0.6](requirements-v0.6.md#16-change-record-and-requirement-continuity) and [v0.5](requirements-v0.5.md).
