# Entity-model review

This records the user's structural corrections and the explanations requested after the first entity map, including the decisions confirmed on 2026-10-21. It supplements the current [entity map v0.6](entity-map-v0.6.md), which supersedes the historical [entity map v0.5](entity-map-v0.5.md). The [consolidated requirements v0.6](requirements-v0.6.md) incorporates these decisions. The original [v0.5 requirements snapshot](requirements-v0.5.md) remains historical source material.

## Confirmed structural decisions

- Use **Membership** for the User ↔ Organization relationship.
- Keep Organization, User, Product, InventoryItem, Supplier, Purchase, PurchaseItem, SupplierPayment, SupplierPaymentAllocation, SupplierRefund, Customer, Sale, SaleItem, Return, ReturnItem, and Loss.
- **Product is global.** A Product registered through one Organization is available to every Organization to find, view, and use for its own InventoryItems. Product has no owning Organization or `organization_id`; InventoryItems and operational records remain organization-owned.
- Store address information directly as field(s) on **Customer**. Remove the proposed CustomerAddress entity.
- Remove **SupplierCredit** and **SupplierCreditApplication**. The user has no supplier-credit concept. Receipt funding comes from actual supplier payments allocated to the physical unit, plus settlement of applicable acquisition expenses.
- Keep **PurchaseExpense** and **SaleExpense** as records owned by their parent operation, with **AcquisitionExpenseAllocation** for unit acquisition costs. A standalone expense-management module is not required.
- Keep **CustomerPayment**, **CustomerPaymentAllocation**, and **CustomerRefund**. Remove **CustomerCredit** and **CustomerCreditApplication**: funds owed back after a Sale change must be refunded or allocated to another eligible existing Sale/SaleItem of the same Customer and Organization.
- Keep **RetainedIncome** and **RetainedIncomeAllocation** for legitimately earned amounts and their model attribution.
- Remove **LossRecovery**. Removing a Loss uses the Loss's dated void/reversal and shared audit history, rather than a separate recovery entity.
- Store collection membership on **InventoryItem**, with dated changes in shared history. Each Organization has one implicit collection, with at most one collection InventoryItem per Product. Remove the baseline **CollectionDesignation** entity and Product-level collection pointer/flag.
- Treat **InventoryItem** as the link between **Product** and operational records; Purchase/Sale/financial workflows reach Product through their units.
- Use **one shared BusinessEvent/action/audit history structure**, with item timelines and financial reporting as derived views. Four standalone history tables are not required.

These are accepted business/modeling directions. Exact SQL tables, keys, indexes, and typed history details remain for the schema-design pass.

## Global Product catalog and organization-owned inventory

Product represents a shared model identity. When Organization A registers Product P, Organization B can access that same Product P and reference it from B's own InventoryItems. Access does not require a separate Product copy, explicit sharing grant, or membership in the registering Organization. The registering Organization is action provenance, not the owner of Product P. Sharing does not imply SKU uniqueness or automatic merging of similar catalog entries.

The conceptual keys are `Product.id`, with no owning `organization_id`, and `InventoryItem.organization_id` plus `InventoryItem.product_id`. The same global Product ID can appear on units owned by different Organizations. Operational access and same-Organization validation use InventoryItem and transaction ownership rather than attempting to match a Product organization field.

Only the shared Product catalog data becomes available across Organizations. Each Organization retains its own stock, asking prices, acquisition costs, condition details, private notes, Customers, Suppliers, transactions, allocations, and collection membership. Organization-private notes belong to organization-owned records, such as InventoryItem; any need for unit-independent private model annotations remains a schema-design question. The broad ORG-002 ownership wording is qualified by this global Product exception, while ORG-008 continues to protect operational data.

Collection uniqueness stays on the Organization/Product pair. Organization A and Organization B may each designate one of their own units of Product P. Quantities, acquisition costs, model profit, and collection recovery are calculated within the relevant Organization; A's Sales do not reduce B's collection cost.

Registering a Product through an Organization and making it available to all Organizations are confirmed. Permissions for editing an existing shared Product and the audit scope for those global changes still need an explicit policy. Organization access to the shared Product catalog does not by itself determine which Product fields are exposed to public visitors; the public projection remains D04.

The [global Product impact review](global-product-impact-v0.6.md) covers all 75 repository issues and all 302 active v0.5 requirements. It identifies the specific requirement and ticket amendments, shared Product lifecycle and historical-label questions, import matching, cache invalidation, and multi-Organization acceptance examples. Removing one's own eligible Item must preserve the shared Product and other Organizations' references. The publication record documents the corrected credit-policy drift and the updated live backlog. The [ownership index](requirements-coverage-v0.6.md) tracks all 304 active v0.6 requirements.

## Supplier credit

Supplier credit would mean a Supplier keeps money or issues an allowance for use against a future Purchase, such as R$100 retained after canceling an order and applied to the next order. That differs from an actual refund and from an unpaid refund obligation.

The user does not use this arrangement, so it is removed. An outstanding Supplier refund remains traceable until actually paid or resolved as an explicit unrecovered loss. The supplier-credit wording in SUP-009, SUP-012, PUR-026, PUR-029, and CALC-004 is superseded accordingly.

## Expenses belong to their Purchase or Sale

An expense record can be a child of the Purchase or Sale and be entered in the same workflow. It does not require a separate expense-management module or an additional manual accounting step.

Accepted ownership relationships:

```text
Purchase → PurchaseExpense → AcquisitionExpenseAllocation → InventoryItem
Sale     → SaleExpense
```

For example, R$200 merchandise plus R$20 freight across two equally priced units gives R$110 per unit. Recording freight separately preserves the merchandise amount, explains the extra R$10 allocated to each unit, and supports different allocation methods. A R$10 business-paid selling expense belongs to its Sale and reduces Sale net profit once.

The existing rules require exact unit-level acquisition-expense allocation and paid acquisition expenses before receipt. Payment date/method/settled amount can be expense fields when a single settlement suffices. A separate ExpensePayment table is conditional on a genuinely required payment workflow. General operating-expense entry is not assumed merely because the requirements mention other business expenses in whole-business reporting.

Shared versus separate SQL expense tables remains a physical-design choice; their ownership and business responsibilities are agreed.

## Fully allocated customer Payments, transfers, and refunds

These examples separate the two cases:

| Situation | Result |
| --- | --- |
| Customer pays R$40 against a R$100 Sale | PaymentAllocation R$40; Sale debt R$60; no credit. |
| Customer pays R$100 against a R$100 Sale | PaymentAllocation R$100; Sale debt zero; no credit. |
| That fully paid Sale later becomes R$80 | Refund the freed R$20 or reallocate it to another eligible existing Sale/SaleItem. No reusable credit is created. |

The user's confirmed policy excludes customer credit held for a future Sale. There is no customer wallet or CustomerCreditApplication. RetainedIncome is a separately agreed economic outcome where the business legitimately earns an amount; it is never an automatic substitute for refunding customer funds.

Preserve the original CustomerPayment and dated allocation changes when moving funding. Reallocating R$20 from Sale A to Sale B creates no incoming cash. Both Sales must belong to the same Customer and Organization, and the receiving Sale/SaleItem must have an eligible outstanding obligation. The same released amount cannot fund another Sale and also be refunded.

CustomerPaymentAllocation supports a Sale and, where specified, a SaleItem within that Sale. A conceptual representation is mandatory `sale_id` plus optional `sale_item_id` with same-Sale enforcement. A line-specific allocation counts once toward Sale funding. The physical schema may use an equivalent typed structure; the business capability is agreed. The partial-Return funding-source order remains D01 where several historical Payments fund the affected units, especially if funding was only Sale-level.

If a chosen refund is not disbursed instantly, its unpaid obligation must be explicit in the originating settlement, unavailable for future spending, and distinct from an actual CustomerRefund cash record. This preserves a refund liability without introducing a future-sale credit balance. Refund scheduling details still belong to workflow design.

The reusable-credit rules in v0.5 are superseded by this decision and consolidated in v0.6; PAY-031 and CUS-016 are retired. The historical specification is not rewritten.

## Retained income and model attribution

RetainedIncome represents an amount legitimately kept after a cancellation/Return, rather than owed to the Customer or reusable by them.

Example: a R$100 Sale is paid and then returned. The business refunds R$70 and validly keeps R$30. Reverse the original Sale economics, record R$70 outgoing cash, and recognize the R$30 retained income once. The original Sale is not left booked at R$100, and the refund does not subtract profit a second time.

If several returned/canceled models are involved, RetainedIncomeAllocation attributes the R$30 between affected SaleItems/models, for example R$10 to model A and R$20 to model B. That supports per-model reporting and collection recovery. A one-model settlement needs only one direct attribution. Separate header/allocation tables are optional; retained-income lines tied to the originating event can hold the same information.

The user accepted RetainedIncome and RetainedIncomeAllocation. Their storage may share source-event details or use dedicated records, but exact model attribution and reconciliation remain required.

## Loss removal without a LossRecovery entity

The user does not need a separate LossRecovery concept. Keep Loss and support its removal as an auditable dated void/reversal of the original Loss and applicable consequences. Preserve the original record and its date so removing a Loss does not silently rewrite previous financial periods. Any physical-stock reversal must remain consistent with later item activity under the correction policy.

An actual later refund remains an ordinary source transaction. For a R$100 supplier deposit written off and R$40 subsequently received, link the SupplierRefund to the original Loss/source and recognize the appropriate dated adjustment once. Net loss across both events is R$60. Voiding a mistaken Loss alone does not assert that cash was received. Neither action needs a separate recovery entity or insurance functionality.

## Collection membership belongs to InventoryItem

Each Organization has exactly one collection. Its membership is the set of its InventoryItems with a field such as `is_collection = true`. Product describes the model; membership is a property of an individually identified unit. There is no Collection entity, multiple-collection feature, Product collection pointer, or baseline CollectionDesignation entity.

Add/remove operations preserve dated membership changes in shared history. A collection unit is excluded from ordinary sale; removing its collection flag does not automatically approve it for sale. Product is reached through InventoryItem, including when collection metrics group by model.

The user confirmed the original COL-002 limit: at most one InventoryItem per Product may belong to an Organization's collection at a time. A Product may have no designated collection unit. Multiple copies may exist in inventory, but a second copy cannot be marked for the same Organization's collection while another is designated. The future schema must enforce uniqueness of the Organization/Product pair among current collection members, including concurrent changes. An explicit replacement removes the old membership before or atomically with adding the new one and preserves the dated history. The existing single-unit per-model collection-cost formula therefore needs no multiple-copy extension; historical presentation after replacement remains D02.

Product is directly referenced by InventoryItem in the business model. A PurchaseItem groups same-model units and reaches their Product through those InventoryItems; it does not need its own Product foreign key. SaleItem, allocations, Returns, and losses similarly reach Product through the identified unit. Product brand and image information remain catalog values; separate Brand/ProductImage business entities are not needed for the baseline.

## Shared history and derived views

| Concept | Question it answers | Example |
| --- | --- | --- |
| BusinessEvent | What business action happened, and on what business date? | Sale #50 was canceled on November 3. |
| ItemHistoryEntry — derived timeline | What happened to this physical unit over time? | Unit #101 was released from commitment and became Available. |
| FinancialEffect — derived reporting view | What signed economic change belongs to this reporting period? | Reverse R$40 originally booked Sale profit in November, preserving October's original R$40 recognition. |
| AuditEntry — shared history details | Who recorded/authorized the change, when, and what facts changed? | Administrator William recorded the cancellation and its reason at a particular timestamp. |

The user accepted the recommendation: preserve dated business transactions/adjustments and one shared BusinessEvent/action/audit history structure, with item timelines and financial projections as derived views. Shared history includes the business date, recorded timestamp, actor, type, reason/context, typed source references, changed facts, and reversal provenance. Typed detail/link records may still be needed for referential integrity; this is not a promise that every historical fact fits one generic row.

Materialized financial projections are optional if later needed, must reconcile to authoritative sources, and must not duplicate financial totals. Atomicity comes from the database transaction and enforcement, not from the existence of an event row. No event-sourcing or double-entry architecture is mandated.

## Sale approval, acquisition cost, and collection recovery

In v0.5, **approved for sale** means the administrator explicitly makes a physically received unit eligible to be sold/listed after considering its condition and acquisition costs. The same action may be presented as **Mark Available**; a separate approval screen or authority tier is not required. Other conditions, such as collection designation, a hold, or active Sale commitment, still determine effective availability.

Relevant source rules are INV-017–019, INV-024, INV-030, and PUR-040. V0.5 additionally uses first sale approval as the cost-lock trigger. It is distinct from the retired Sale-readiness confirmation: fully paid unshipped Sales become In Garage automatically.

A collection unit's own acquisition cost is its merchandise acquisition amount plus its allocated actual acquisition expenses. It exists regardless of whether the unit is ever made available for sale. Approving another unit for sale alone changes neither this acquisition cost nor collection recovery.

Example: a designated collection unit costs R$100. Another unit of the same Product costs R$80. Making the latter Available does not change collection cost. Creating its Sale for R$120 books R$40 eligible model gross profit, so model net collection cost becomes R$60 under the agreed positive-profit formula. The designated unit's original acquisition cost stays R$100; ordinary customer-payment timing does not change that recovery.

The earlier question about unfinished costs concerned the **collection unit's own** costs: it may never be offered for sale, so a rule that locks costs only at sale approval does not specify when its costs become complete/locked. Recommended refinement: track cost completeness/finalization independently of eligibility; sale approval can require final costs, while a collection unit can have complete costs and remain unavailable. Whether provisional collection costs are displayed and exactly when they lock still needs an explicit rule. This recommendation has not yet been approved as a replacement for v0.5's trigger.

## Remaining design boundaries

The global Product identity and availability to all Organizations, credit, expense ownership, retained-income attribution, collection-per-Organization, one-collection-item-per-Product, LossRecovery removal, and shared-history choices above are settled. The next schema pass must still account for the original D01–D06 decisions, cost finalization for units never offered for sale, shared Product maintenance/audit and historical-label rules, global identity matching during import, and any private model annotation storage. The existing decision tickets are not automatically resolved by these structural choices.

## Current backlog and open policies

The current baseline is [#78](https://github.com/WilliamPhilippe/storage-minis-be/issues/78). Shared Product maintenance is tracked by D07 [#79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79); never-approved collection-cost finalization is D08 [#80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80). D01–D06 remain open. Approved global Product registration/read/reuse and collection membership may proceed without inventing the unresolved policies. The [publication record](global-product-impact-v0.6.md#9-publication-record) identifies the issue updates and verification limits.
