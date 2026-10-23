# DBML follow-up — indexes, rejected candidates, and expense fields

**Owner:** WilliamPhilippe. **Approval date:** 2026-10-23, after the [field review and follow-up answers](2026-10-23-dbml-review.md). **Source:** Owner's next DBML review notes and explicit answer about Q61.

**Status:** Applied to the visual DBML and design guide. No application implementation or migration is delivered. This record supersedes the earlier review's narrower index policy and its remaining candidate-table proposals. Published historical baselines and stable requirement/entity IDs remain unchanged.

## Approved changes

- **Indexes:** Remove explicit secondary/unique index definitions globally except standalone `organization_id` lookups. Primary keys remain. BusinessEvent/header-detail indexes were already deferred and remain absent. This includes deferring the inline Firebase UID unique index; unique external identity remains a required T01/T02 invariant.
- **Candidates:** Remove all `candidate.*` tables currently drawn, their groups, and every dependent reference. This rejects the generic mixed `financial_settlements` / `settlement_source_allocations` and persistent `import_rows` / `import_row_inventory_items` proposals; ImportBatch and separate OpeningAcquisition tables were already removed.
- **Q61 clarification:** The owner explicitly retained the earlier four-table approval: `customer_settlements`, `customer_settlement_source_allocations`, `supplier_settlements`, `supplier_settlement_source_allocations`. The rejected generic mixed tables are replaced by these dedicated structures. Customer outcomes are refund, reassignment or retained income; supplier outcomes are refund, permitted allocation correction or Loss. These structures preserve source provenance and pending obligations independently of actual cash Refunds.

Reconcile exact same-party/Organization/Payment/source limits and scope through T01; removing indexes is a review-stage storage decision, not withdrawal of uniqueness or isolation requirements. No replacement indexes are selected here. The retained conceptual composite references need executable target keys/enforcement before migrations.

## Related previously approved propagation

The October 22 Q3 decision already rejected the independently maintained `purchase_expense_purchases` association. That table is now removed, and AcquisitionExpenseAllocation references its expense source and target unit directly. Derive linked Purchases through the units, including when one expense spans Purchases.

CustomerPaymentAllocation now requires exactly one SaleItem under the earlier Q24 approval. This supports the dedicated customer settlement's original source attribution. The owner is retaining those previous decisions; no requirement IDs, ownership or issue dependencies are reassigned.

E36/E37 retain their original responsibilities across the dedicated customer/supplier table families. E40/E41 import operation/row evidence becomes T05 migration artifacts, without persistent application tables. Preview, source-to-unit reconciliation and rerun safety are still required. E39 remains marked month/Supplier-grouped Purchases with the approved second-day timestamp convention.

## Expense explanation — current design, not an additional owner decision

A **PurchaseExpense** is the actual expense source, including its value, category, occurrence and payment information. An **AcquisitionExpenseAllocation** is the share of that source assigned to one InventoryItem's acquisition cost. It is not another expense or cash payment.

Example: one R$30 shipping expense is stored as `purchase_expenses.amount = 3000`. Two allocations of 1000 and 2000 centavos add R$10/R$20 to the chosen units, possibly across Purchases. Source expense and actual cash are each counted once; allocation totals reconcile to 3000.

Both PurchaseExpense and SaleExpense currently distinguish:

| Field | Meaning |
| --- | --- |
| `amount` | Expense value, whether unpaid or paid. |
| `settled_amount` | Actual full payment amount; NULL while unpaid, equal to `amount` when paid. |
| `settled_on`, `settlement_method`, `settlement_event_id` | Actual payment time, method and action provenance; absent while unpaid. |

For an unpaid R$20 SaleExpense: `amount = 2000`, `settled_amount = NULL`. Once paid in full: both amounts are 2000, with the actual payment metadata. This is one expense and one cash outflow, not R$40 of cost. Customer-paid shipping remains outside recorded SaleExpenses.

The accepted model permits one full expense payment and no partial/batched expense payments. Therefore `settled_amount` is redundant after payment. The agent recommends removing that duplicate column and retaining `amount` plus payment metadata. **The owner asked for an explanation and has not yet approved that simplification.** Both columns remain, with checks requiring a complete payment tuple and equal source/payment values.

## Remaining work

T01/T02 still own final keys, constraints, transaction/concurrency enforcement and authorization. T05 still owns inspection of the real source and migration artifacts. The other October 22 gaps listed in the [design guide](../database/design.md) remain explicit; this review does not close implementation or decision issues. Requirements/entity-map consolidation, coverage and backlog propagation remain a later publication step.
