# Requirements update log — schema review, 2026-10-22

**Owner:** WilliamPhilippe, project owner. **Approval date:** 2026-10-22.

**Status:** owner-approved decisions; propagation to the next published baseline, DBML, and backlog is pending. No implementation or delivery completion is claimed.

**Review source:** the owner's answers to Q1–Q61 in the schema review. Later answers supersede earlier proposals where indicated below.

**Reviewed artifacts:** [DBML draft 1](../database/schema.dbml), [database design guide](../database/design.md), [requirements v0.7](../requirements-v0.7.md), [entity map v0.7](../entity-map-v0.7.md), and the relevant live decision issues. Related design owner: [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21). Published baseline tracker: [#82](https://github.com/WilliamPhilippe/storage-minis-be/issues/82).

This log records approved changes to the published v0.7 rules. Its explicit decisions supersede conflicting wording for the topics covered here; unaffected requirements remain applicable. It does not publish a consolidated v0.8 baseline or revise the schema. The propagation map and remaining boundaries below distinguish approved outcomes from follow-up work.

## 1. Database identity and monetary values

- Replace proposed UUID primary and foreign keys with integer keys throughout the schema. The owner considers UUIDs unnecessary unless iterating IDs becomes a problem. Integer width and generation mechanics remain implementation details. (Q49–Q50)
- Give InventoryItem a separate human-readable `itemIdentifier` / physical `item_identifier`, automatically assigned at ordinary Purchase registration. `ITEM-000001` is the accepted example format. It is immutable, unique within the Organization, never reused, and may have gaps. Legacy identifier mapping remains T05 work. (Q49–Q51)
- Store operational money as integer centavos: R$1.56 is `156`. Use `amount` for standalone amounts and descriptive names such as `agreed_price` without `_brl` currency suffixes. BRL remains the sole currency. (Q4)
- Purchase merchandise prices and agreed Sale prices may be zero. Payments, refunds, and recorded expense sources require positive amounts. Confirmed-zero expenses are completeness facts, not zero-value expense transactions. (Q14)
- Automatic proportional/equal-unit cost allocation uses exact arithmetic and largest fractional remainders, with permanent Item ID as the stable tie-breaker. R$100 across three equally weighted units produces 3334, 3333, 3333 centavos. Screen order must not change allocation results. (Q7)
- If all selected merchandise values are zero, proportional allocation requires explicit selection of equal-unit or manual allocation; do not silently switch methods. (Q17)

## 2. Occurrence time, recording time, and reports

- Business occurrence is an actual timestamp, separate from entity creation/recording time. Capture the input timezone and convert the instant to UTC. Reporting uses UTC; timestamp display uses the visitor's timezone. This supersedes Q5's initial calendar-date-only proposal. (Q5–Q6)
- October 31 at 22:00 UTC−03:00 is November 1 at 01:00 UTC and belongs to November's report. (Q6)
- Reports are queries over source records, not stored monthly report entities. Downloaded documents reflect the query result when exported. (Q11)
- Every permitted Sale item/price edit is a correction. No distinct later-agreement/renegotiation workflow is required. Corrections replace mistaken values used in the original Sale period. (Q10–Q11, Q15)
- A Return also changes the merchandise result of the original Sale period. Reverse the returned lines' revenue and matched acquisition-cost contribution in that original period's query. A partial Return changes only the affected lines. Preserve the original shipped lines for Return identity. (Q21, Q25)
- Attribute legitimately retained income after a Return to the original Sale's reporting period. (Q29)
- Actual Sale expenses remain counted after cancellation/Return. Expenses recorded/incurred later also enter the original Sale period's Sale net-profit calculation. Preserve their actual occurrence/payment dates for expense/cash views. Count each expense once. (Q42, Q58–Q59)
- Removing a mistaken Loss removes its contribution from its original reporting period, with audit retained and no implied cash receipt. A later actual SupplierRefund reduces the original period's net Loss, while its cash receipt stays dated when received. (Q45, Q60)
- Keep typed, queryable source/change facts and before/after history. Do not add independent generic signed financial-adjustment transactions for these corrections. Reporting derives the current source result. Q10–Q11 supersede the initially proposed signed-delta reporting model. (Q1, Q10–Q11)

### Approved reporting examples

| Scenario | Recomputed original period | Later period cash |
| --- | --- | --- |
| October Sale price R$120, cost R$80; November correction to R$100 | October merchandise profit R$20 | Determined by actual cash records |
| October Sale R$120, cost R$80; full November Return/refund | October merchandise profit R$0 | November refund R$120 |
| October Sale R$100; November Return, R$70 refund, R$30 retained | October returned merchandise contribution removed; retained income R$30 | November refund R$70 |
| October Sale R$100, cost R$60, selling expense R$10; full later Return | October Sale net result −R$10 | Actual refund on its payment date |
| October Sale receives a November R$20 selling expense | October Sale net profit includes the R$20 expense | Actual expense payment on its payment date |
| Mistaken October Loss R$100 removed in November | October Loss R$0 | No cash implied by removal |
| October Loss R$100; actual November SupplierRefund R$40 | October net Loss R$60 | November incoming cash R$40 |

## 3. Sale editing, deletion, and dispatch

- Only never-funded SaleItems may be deleted before dispatch. Delete the operational line and the Sale-related dependent records it generated; retain the audit of addition/removal. Re-adding the same physical unit creates a new SaleItem ID with the same InventoryItem ID. (Q13, Q16, Q19–Q20)
- Any positive partial funding blocks deletion. A previously funded line remains undeletable even after all funding has been refunded or reassigned. Q56 settles the lifetime rule beyond Q23's currently-applied-funding example. (Q23, Q56)
- Retained payment/refund/settlement records must remain explainable; a real cash movement does not disappear through deleting a line. (Q19, Q25, Q56)
- Shared audit must survive deletion without requiring the deleted operational SaleItem row to exist. Redesign the draft's restrictive history FK/subject shape accordingly. Preserve actor, timing, Sale/physical Item context, and explanatory facts. (Q16, Q20)
- Dispatch locks Sale agreement facts against corrections. Return is the subsequent Sale lifecycle operation. Actual SaleExpense recording/settlement is an explicitly approved exception after dispatch; it does not edit agreed lines, prices, or shipment status. (Q18, Q58)
- Existing baseline rules for authorized eligibility, one active commitment, physical Return, same-unit resale, and atomic cancellation/Return remain applicable unless explicitly changed here.

## 4. Customer payment allocation

- Each CustomerPaymentAllocation must identify exactly one SaleItem. Sale-level-only allocation is not permitted. Reach the Sale through that line, or retain a constrained scope key if useful for integrity. (Q24)
- One CustomerPayment may have allocations to multiple SaleItems across multiple Sales, within the same Customer and Organization. Multiple Payments may fund one SaleItem. (Q27)
- Fully allocate new Payments and enforce source/item obligation limits, with no reusable customer wallet. These baseline invariants continue to apply.
- The published v0.7 E21/PAY-003 wording still permits optional line attribution. The owner's Q24 answer explicitly supersedes that wording; do not implement it as optional.

## 5. Refunds and settlements

- Dedicated relational settlement/source-allocation storage is approved. Q61 confirms separation that was provisional in Q9. (Q2, Q9, Q61)
- Use separate `customer_settlements` / `customer_settlement_source_allocations` and `supplier_settlements` / `supplier_settlement_source_allocations`. Both sides use shared BusinessEvent history. Actual cash Refunds keep their own records. Replace the generic mixed customer/supplier candidate structures. (Q61)
- Each settlement source portion traces original payment allocation funding to one permitted outcome. Preserve same-party/Organization and original Payment provenance; do not consume funding twice. Reassignment creates no cash and targets eligible existing obligations.
- Refunds consume the oldest applicable original Payment first, proceeding to newer Payments. Do not distribute refund provenance proportionally. (Q28)
- A chosen refund amount may be less than the original Payment. It may remain explicitly pending, but must be paid in one cash transaction; refund installments are unsupported. The remainder must have an explicit permitted outcome. (Q8, Q12)
- Example: a R$100 paid Return can produce one R$70 refund and R$30 legitimate retained income. (Q12)
- Example: refunding R$70 from an item funded by older R$40 and newer R$60 Payments consumes R$40 from the older Payment and R$30 from the newer Payment. (Q28)
- Pending refund obligations are not cash already sent and are not money available for future Sales. Existing no-credit and exact reconciliation rules remain applicable.

## 6. Acquisition expenses and locks

- Derive PurchaseExpense–Purchase links from selected InventoryItem allocations. Remove the independently maintained `purchase_expense_purchases` relationship table, retaining equivalent Organization/acquisition integrity and history. (Q3)
- An acquisition-expense allocation blocks ordinary removal of an unreceived Purchase unit until explicitly resolved, even if no supplier merchandise payment exists. Preserve the shared expense and unaffected allocations; do not redistribute automatically. (Q44)
- Cost finalization permanently locks unit merchandise costs and acquisition-expense allocations. Removing sale approval or collection membership does not unlock them. (Q31)
- First sale approval still finalizes ordinary units. Permit explicit cost finalization of never-for-sale collection units once their actual merchandise cost and applicable expenses are complete and settled. Membership and sale eligibility stay independent. (Q22)
- Completed Purchases are firmly locked against corrections. Eligible shared-expense changes confined to other Open Purchases may proceed while preserving completed-Purchase facts, protected allocations, and finalized costs. (Q57)
- Unknown expenses and confirmed zero remain distinct. Existing receipt/payment requirements and one-source/shared-expense reconciliation continue to apply.

## 7. Collection metrics and acquisition averages

- Current collection membership drives collection metrics. A past-date collection-designation view is not required; do not add that report feature. Ordinary action audit remains applicable. (Q32)
- Display known actual acquisition costs as provisional until complete/finalized. Also display recovery metrics calculated from those costs, labeled provisional. Do not invent missing expenses. (Q26, Q30)
- Acquisition cost remains distinct from recovery: R$120 known unit costs minus R$40 eligible profit gives R$80 provisional net collection cost. Finalized acquisition cost stays locked while recovery continues changing with eligible profit. (Q30)
- Include signed negative profit in per-model recovery and pooled recovery. A R$100 collection unit with R$20 negative model profit has R$120 net model collection cost. (Q33)
- A R$200 collection base with R$60 profit and R$20 loss gives R$160 pooled net collection cost, before other applicable expenses. Preserve zero floors, separate excess profit, Organization isolation, and independent model versus pool calculations. (Q34)
- Average acquisition cost uses full merchandise-plus-allocated-expense costs of currently on-hand units, including received/unapproved, Available, Held, Collection, Reserved, and In Garage units. Exclude awaiting, dispatched, removed, and disposed units. Label included incomplete costs as provisional. (Q43)

## 8. Product authority, metadata, and private notes

- Product remains global, with nonunique SKU and no owning Organization. Global access does not grant access to another Organization's operations.
- Add a global `can_edit_products` User permission, denied by default and granted to the initial administrator during bootstrap. It applies to editing all existing shared Products. (Q35, Q39)
- Authorized Organization administrators may register new Products without that edit permission. (Q40)
- Historical transaction screens display current shared Product metadata. Keep global metadata change audit; do not require historical name/brand/image snapshots for transaction presentation. Monetary and physical transaction facts retain their own integrity. (Q41)
- Unit-private descriptions/notes are sufficient; no separate organization-private Product annotation structure is needed. (Q36)

## 9. Customers and public catalog

- Customer requires a nonblank name. Phone and address remain optional. (Q46)
- Each public catalog represents one Organization, identified through its URL. (Q37)
- Public fields: Product name, SKU, brand, description, scale, images; unit asking-price presentation, sealed/open and damage conditions, optional distinct public unit description, and optional public unit photos. Private descriptions/notes, costs, accounts, supplier/customer data, and financial records remain private. (Q38, Q54)
- Asking price is optional for availability. Show missing prices as price on request. Continue enforcing possession, approval, cost finalization, hold/collection exclusion, commitment, and removal rules. (Q47)
- Perfect copies share a card grouped by Product and sealed/open condition. Units with special conditions, explicitly including damage, receive individual cards. No extra manual special-condition marker is approved. (Q48, Q52, Q55)
- Grouped cards show one known price when equal or a range when different, identifying price-on-request availability as applicable. (Q53)
- Do not expose available stock quantities to visitors. Public responses should provide grouped presentation without count fields or ordinary-unit lists that disclose the hidden quantity. Individual cards still describe the approved special-condition units. (Q53)
- Unit photos are independent of shared Product images. Organization administrators can manage their own unit photos without global Product-edit permission. (Q54)

## 10. Applying this review and remaining boundaries

- This publication adds the requirement update log and navigation. The DBML, design guide, published v0.7 requirements/entity map, and GitHub issue acceptance criteria have not yet been reconciled with these decisions.
- During a subsequent baseline adoption, preserve v0.7 as historical and publish a new versioned baseline. Keep requirement/entity IDs stable; update accepted decisions, entity relationships, coverage/ownership, current navigation, and affected issue criteria consistently.
- In particular, replace conflicting event-dated financial adjustment rules in REQ-011, SAL-026, FIN-011, CALC-015–018, affected Return/Loss/collection text, examples, and shared-history design. Revise SaleItem deletion rules and mandatory payment-line attribution throughout the affected sources.
- Relevant decision owners remain D01 (refund funding provenance), D02 (historical collection view scope), D03 (negative recovery), D04 (public contract), D05 (averages/reporting), D06 (correction/lock boundaries), D07 (Product authority/labels/private notes), and D08 (collection cost completeness/finalization).
- These answers are not evidence that any issue is implemented or ready to close. Existing primary delivery ownership remains unchanged.
- T01/T06 still require a concrete schema/enforcement design: exact key/numeric widths, generator choices, typed history contracts that survive permitted deletion, complete scope FKs/checks, allocation reconciliation/limits, lock enforcement, and real transaction/rollback/concurrency evidence.
- Refund FIFO is selected. Equal-time tie-breaking and exact source attribution/order for non-refund outcomes were not independently selected; specify these without silently treating the rejected proportional-refund proposal as approved.
- Exceptional shared-expense disposition remains gated where ordinary permitted resolution is insufficient. Do not invent automatic expense refunds, write-offs, cost transfers, or unlocks.
- Actual spreadsheet mapping/opening-acquisition treatment remains T05 work. Preserve unknown costs/dates/times and do not fabricate historical facts. Import/opening table boundaries remain conditional.
- Remaining session/bootstrap mechanics, hosting/backups/deployment, detailed public search/filters and unknown-condition presentation, and the complete launch report/widget set remain with T02/T04/T06 and D04/D05. They were not settled merely by reviewing the schema.

## 11. Propagation map

This map identifies affected references and existing owners; it does not reassign delivery work or claim that propagation is complete. Requirement references are entry points into the affected sections, not an exhaustive impact inventory.

| Approved change | Published references to reconcile | Existing decision/design owner |
| --- | --- | --- |
| Original-period report recalculation, typed correction history, and actual cash dates | REQ-002–003, REQ-011; SAL-026; RET-006, RET-008, RET-011; FIN-006, FIN-011–012; CALC-015–018; LOS-003; E29, E32–E35; [technical direction](../technical-direction.md) | [D05 / #19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19), [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20), [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) |
| Mandatory SaleItem funding, FIFO refunds, single-disbursement refunds, and separate settlement structures | PAY-003, PAY-017, PAY-023, PAY-032, PAY-034; E20–E21, E24, E27–E28, E36–E37 | [D01 / #15](https://github.com/WilliamPhilippe/storage-minis-be/issues/15), [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) |
| Unpaid SaleItem deletion with retained audit, permanent funded-line protection, and firm dispatch/completion/cost locks | INV-007, INV-030–031; PUR-040–041; SAL-038–039, SAL-042; E05, E07, E19, E32–E35 | [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20), [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) |
| Derived PurchaseExpense links, exact cent allocation, and expense disposition before removal | PUR-004, PUR-019, PUR-021, PUR-048–049; E13–E15; [shared-expense impact](../purchase-expense-impact-v0.7.md) | [D06 / #20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20), [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) |
| Current collection membership, signed recovery, explicit collection cost finalization, provisional metrics, and on-hand average cost | COL-015, COL-017; CALC-008; INV-030; PUR-040; E05, E44 | [D02 / #16](https://github.com/WilliamPhilippe/storage-minis-be/issues/16), [D03 / #17](https://github.com/WilliamPhilippe/storage-minis-be/issues/17), [D05 / #19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19), [D08 / #80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80) |
| Global Product-edit permission, current Product labels, and unit-only private notes | ORG-005; PRO-010, PRO-012–013; E02–E05; [accepted model decisions](../model-review.md) | [D07 / #79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79), [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) |
| Nonblank Customer name, one-Organization catalog, grouped cards, optional asking prices, unit photos, and hidden stock quantities | CUS-002; INV-009, INV-015; PRO-006, PRO-010; E04–E05, E16, E42 | [D04 / #18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18), [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) |
| Integer keys, readable Item identifiers, integer centavos, and UTC occurrence timestamps | REQ-008–009; INV-001; E05; [DBML draft conventions](../database/design.md#draft-conventions-and-unresolved-types); [technical direction](../technical-direction.md) | [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24), [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) |

Follow-up publication must preserve requirement/entity IDs and historical files, reconcile [requirement coverage](../requirements-coverage-v0.7.md), update the current guide/navigation, and align the affected delivery issue acceptance criteria. Detailed unresolved policies listed in Section 10 remain open even where this log resolves part of their decision issue.
