# Global Product — requirements and backlog impact review v0.6

**Reviewed:** 2026-10-21.

**Status:** Propagated to consolidated requirements v0.6 and the GitHub backlog on 2026-10-21. Sections 1–8 preserve the initial audit findings; Section 9 records publication. No unresolved policy is approved and no application behavior is claimed implemented.

**Model:** [Entity map v0.6](entity-map-v0.6.md), with [accepted decisions](model-review.md).

**Historical source:** [Requirements v0.5](requirements-v0.5.md) and [issue #2](https://github.com/WilliamPhilippe/storage-minis-be/issues/2).

## 1. Review coverage and result

Reviewed all 75 repository issues: the 74 originally published backlog items (#2–75) and pre-existing issue #1. This includes the source baseline, all 12 epics, six business decisions, six design tasks, and 49 delivery issues. Issue bodies, requirement references, and prerequisite lists were inspected. There were no issue comments at the time of review.

Reviewed all 302 active requirements and seven retired IDs in v0.5. The historical baseline is preserved. The amendments are now consolidated in [requirements v0.6](requirements-v0.6.md); the [ownership index](requirements-coverage-v0.6.md) maps its 304 active IDs. This audit remains supporting evidence rather than the specification or implementation acceptance.

| Disposition | Issue count | Meaning |
| --- | ---: | --- |
| Acceptance criteria or design outputs need amendment | 26 | Explicitly capture global Product access, ownership exceptions, or consequences in the ticket. |
| Epic summary and scope alignment | 8 | Align parent descriptions with the amended children. |
| Integration or regression validation | 27 | Existing business behavior remains, with shared-Product cases added to the relevant validation evidence. |
| No Product-specific rewrite identified | 13 | Includes unrelated #1 and operational tickets whose rules remain valid. Earlier credit-policy drift is tracked separately below. |
| Preserve historical baseline | 1 | Keep #2 as the original v0.5 snapshot; link a new baseline when published. |

The complete issue-by-issue disposition is recorded in Section 7.

The tables in Sections 1–8 describe the initial review and proposed actions at that point. Ticket titles in Section 7 reflect the original snapshot; current titles and acceptance criteria are on GitHub. Publication includes earlier approved modeling corrections as well as Product scope.

## 2. Accepted change

- Product is a global model identity with shared catalog metadata and no owning `organization_id`.
- Registering Product P through Organization A makes that same Product P available to every Organization to find, view, and select, even if A has no InventoryItems for P. No copy or sharing approval is required.
- Each InventoryItem has one owning Organization and references one global Product. Customers, Suppliers, transactions, funding, expenses, private notes, and collection membership remain organization-owned.
- Each Organization has one implicit collection and may designate at most one of its own InventoryItems per Product. Different Organizations can each collect the same Product.
- Shared Product access does not grant access to another Organization's operational records. Public catalog disclosure still follows the approved public contract.

The read/reuse rule is settled. Editing, archiving, deleting, or merging existing shared Products requires an explicit policy; this review does not approve those workflows.

## 3. Requirement impact

The references below identify the clauses to amend, clarify, or validate in the next requirements edition. A reference here does not mean its existing financial or lifecycle formula changes.

| Requirement references | Impact and required clarification | Principal tickets |
| --- | --- | --- |
| ORG-002, ORG-008, TECH-005 | Qualify organization isolation: Product is global; inventory and operational references remain organization-owned. A blanket organization filter or reference-rejection rule must allow global Product access. | #21, #26, #27 |
| ORG-005, TECH-001 | Authorized registration creates a shared Product. Distinguish that approved capability from the still-open permission policy for changing an existing shared Product. | #22, #27, #30 |
| PRO-005, PRO-007, INV-002 | State global Product identity explicitly. Units owned by different Organizations may reference the same Product ID; Product registration does not require owning a unit. Add explicit global-access clauses and traceability ownership in the next edition. | #21, #30, #34, #35 |
| PRO-001–006 | Required fields, optional metadata, and repeated SKUs remain supported. Global scope does not make SKU unique, define duplicate identity, or approve automatic merging. | #30, #25, #53 |
| PRO-008, PRO-010, INV-008–010 | Keep unit prices, condition, costs, and organization-private notes on organization-owned records. Decide where private model notes independent of a unit belong; do not expose them through shared Product metadata. | #21, #30, #35, #18, #71 |
| PRO-009, COL-001–004, COL-007–008, COL-016 | Optional collection membership, first designation, replacement, removal, and history are evaluated within each Organization. Uniqueness is Organization + Product among collection units, not Product alone. | #49, #72 |
| PRO-011, INV-029, CALC-005 | Operational quantities are calculated from the requesting Organization's InventoryItems. The number of global catalog models is distinct from an Organization's stock or owned-model counts. | #42, #59 |
| PUR-003, PUR-005–006, INV-001, INV-006 | Purchase entry can select a Product registered through another Organization, while generated units and acquisition provenance belong to the purchasing Organization. | #34 |
| CALC-006–008, CALC-011, CALC-014–016, FIN-008, SAL-027 | Model profit, averages, costs, report filters, and drill-down remain limited to the applicable Organization's source records, even when Product IDs are shared. The average-cost basis itself remains D05. | #19, #45, #59 |
| COL-010–011, COL-015, COL-017–020, PAY-034 | Model and pooled collection recovery and retained-income attribution use only the owning Organization's collection and Sale facts. Another Organization's profit cannot recover this Organization's collection cost. | #58, #68, #70, #72 |
| REQ-002–003, REQ-011, SAL-010, INV-012 | Product maintenance needs actor, scope, timestamp, and change provenance without inventing Product ownership. Preserve transaction facts; decide how historical labels are presented after shared metadata changes. | #20, #28, #30 |
| REQ-007, CALC-010, CALC-012 | Shared metadata changes can affect several catalogs. Cache invalidation must reach affected projections, while stock, prices, counts, and financial caches retain organization scope. | #26, #59, #66, #69, #71 |
| PRO-006, PRO-010, INV-015–021, ORG-006–007, CUS-008 | Organization access to Product does not automatically publish it or another Organization's stock. D04 must define catalog organization context and approved shared versus unit fields, images, list/detail/search results, and unavailable links. | #18, #66, #69, #71 |
| DATA-003–007 | Map spreadsheet rows to global Product identities and organization-owned units. Resolve ambiguous or repeated SKUs explicitly. Reusing Product must not overwrite shared metadata without the applicable policy. Reconcile imported units and referenced models within the target Organization rather than against the global catalog total. | #25, #53, #74 |
| INV-025, SAL-019, TECH-006 | Commitment remains per physical Item ID. Different Organizations may sell their own units of the same Product concurrently. Collection uniqueness includes Organization; Product identity is not a global commitment lock. | #49, #54, #75 |
| BACKUP-001–002, TECH-002–004 | Verify deployment, performance, and full restoration with both global Product records/media and organization-owned references. This does not add per-Organization restore functionality. | #23, #29, #33, #73 |
| ORG-009, PAY-030, FIN-006 | Existing Customer, Supplier, organization, allocation, and cash boundaries remain. Reusing a Product grants no permission to transfer another Organization's unit or funding. | #36, #47, #51, #54 and operational regression cases |

BRL rules, payment-gated receipt, Sale recognition dates, event-dated reversals, returns under the same Item ID, and the existing positive-profit collection formulas do not change because Product is global. Prior decisions excluding supplier/customer credit still supersede the historical baseline separately.

## 4. Targeted ticket amendments

| Tickets | Required amendment |
| --- | --- |
| [#21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), [#26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26), [#27](https://github.com/WilliamPhilippe/storage-minis-be/issues/27) | Model global Product separately from organization-owned records. Qualify blanket cross-organization rejection and persistence filtering. Prove permitted Product reuse alongside rejected private-record access. |
| [#22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22), [#28](https://github.com/WilliamPhilippe/storage-minis-be/issues/28), [#30](https://github.com/WilliamPhilippe/storage-minis-be/issues/30) | Specify shared catalog access and registration, global audit scope, and organization-private fields. Add registration-through-A/use-through-B without unit ownership or sharing approval. Track existing-Product editing and destructive changes as an unresolved policy. |
| [#34](https://github.com/WilliamPhilippe/storage-minis-be/issues/34), [#35](https://github.com/WilliamPhilippe/storage-minis-be/issues/35), [#42](https://github.com/WilliamPhilippe/storage-minis-be/issues/42) | Select global Product in Purchases and item views; keep unit ownership, condition, asking price, history, and counts within the active Organization. |
| [#19](https://github.com/WilliamPhilippe/storage-minis-be/issues/19), [#45](https://github.com/WilliamPhilippe/storage-minis-be/issues/45), [#58](https://github.com/WilliamPhilippe/storage-minis-be/issues/58), [#59](https://github.com/WilliamPhilippe/storage-minis-be/issues/59) | Scope model aggregates, average costs, retained-income attribution, filters, drill-down, and caches by Organization as well as Product. Financial recognition timing and attribution through original SaleItems remain. |
| [#49](https://github.com/WilliamPhilippe/storage-minis-be/issues/49), [#68](https://github.com/WilliamPhilippe/storage-minis-be/issues/68), [#70](https://github.com/WilliamPhilippe/storage-minis-be/issues/70), [#72](https://github.com/WilliamPhilippe/storage-minis-be/issues/72) | Make collection uniqueness, current/historical designation, model recovery, and pooled recovery organization-specific. Allow A and B to designate their own copies of P simultaneously. |
| [#18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18), [#66](https://github.com/WilliamPhilippe/storage-minis-be/issues/66), [#69](https://github.com/WilliamPhilippe/storage-minis-be/issues/69), [#71](https://github.com/WilliamPhilippe/storage-minis-be/issues/71) | Define public catalog organization context, global metadata allowlists, organization-owned availability/prices/condition, and shared metadata cache invalidation. Product registration alone never creates available stock in another Organization. |
| [#25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25), [#53](https://github.com/WilliamPhilippe/storage-minis-be/issues/53), [#74](https://github.com/WilliamPhilippe/storage-minis-be/issues/74) | Define global identity matching and import conflicts, preserve SKU non-uniqueness, restrict shared metadata updates to the approved policy, and reconcile organization-owned units separately from global catalog growth. |
| [#20](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Distinguish organization-owned transaction corrections from global catalog changes. Record the historical-fact/display implications of shared Product changes without silently extending D06 permissions to every Organization. |
| [#75](https://github.com/WilliamPhilippe/storage-minis-be/issues/75) | Include approved global Product clauses and two-Organization acceptance cases in coverage. The original 302-requirement checklist alone is insufficient once a new baseline introduces explicit global-access requirements. |

Align epic descriptions #3, #4, #5, #10, #11, #12, #13, and #14 with these amended children. Existing dependency links remain useful. A shared Product maintenance decision should explicitly feed #22/#28/#30 and import writes in #25/#53; it need not block documenting or validating the already-approved read/reuse rule. D04 and D05 retain their existing catalog and report decision responsibilities.

## 5. Policies still to decide

| Policy | Why it matters | Suggested tracking |
| --- | --- | --- |
| Existing shared Product editing and lifecycle | Who may change metadata/images, archive, delete, or merge an entry used by other Organizations? Preserve references and audit history; removing one's own eligible Item must not cascade into a shared Product. No new lifecycle workflow is approved here. | D07 [#79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79), linked from the affected auth/audit/Product/import tickets. The read/reuse scope remains approved. |
| Private model annotations | PRO-010 mentions private notes. Decide whether item notes suffice or private model notes independent of a unit are needed and where they belong. They cannot become shared merely by sitting on Product. | Same decision, coordinated with #21/#30 and D04. |
| Historical Product presentation | Shared name/brand/image edits affect multiple consumers. Decide whether old transaction/report displays use original labels or current metadata; historical monetary and physical facts remain preserved. | Shared-catalog decision with #20/#28/#30 and reporting contracts. |
| Product identity matching during import | SKU is not unique. Decide how existing IDs, names, brands, codes, and ambiguous matches are reviewed, and when a new Product may be registered. Do not infer automatic deduplication or a merge feature. | #25/#53; shared metadata changes follow the editing policy. |
| Public catalog context and projection | Internal cross-Organization access is agreed; a combined marketplace or unrestricted public stock aggregation is not. Define the catalog's applicable Organization and shared/unit field allowlists. | D04 #18. |

These questions qualify write and presentation behavior; they do not reopen the accepted global Product visibility and reuse policy.

## 6. Required acceptance examples

These are future acceptance criteria, not executed application tests. The repository currently contains documentation rather than a running application.

| Scenario | Required result |
| --- | --- |
| A registers P without owning a unit; B looks up P | B can find, view, and select the same global Product ID without a sharing grant or duplicate Product. |
| A owns two units of P; B owns one | Operational counts show two for A and one for B. Private costs, notes, and transaction drill-down follow the owning Organization. |
| A and B each sell their own unit of P concurrently | Both can succeed. Two Sales claiming the same physical Item ID still cannot both succeed. |
| A and B each designate one of their own copies of P | Both designations are valid. A second designation within A is rejected or handled as an explicit atomic replacement, without affecting B. |
| A books R$40 eligible profit; B has a R$100 collection unit of P | A's eligible recovery changes; B's cost is unaffected by A's Sale. |
| A has an Available unit of P; B has none | Shared Product access gives B catalog metadata. It does not invent B stock or include A's operational facts in B's available-unit projection. Public behavior follows D04. |
| B imports a row mapped to existing P | Create B's unit under the existing Product ID. Reconcile B's imported stock without requiring global Product count growth or treating repeated SKU alone as a duplicate decision. |
| An import preview finds different metadata for existing P | Flag the conflict for the approved matching/edit policy; preview does not silently change a shared Product for other Organizations. |
| A removes an eligible unpaid/unreceived ordered unit referencing P | Preserve the unit's soft-removal history. P and B's references remain intact. This is not shared Product deletion. |
| A shared Product is edited under the eventual approved policy | Enforce that policy, record global change provenance, refresh affected approved metadata projections, and preserve unit ownership and historical monetary facts. Label presentation follows the recorded historical policy. |
| Public and administrative responses reuse caches for P | Shared metadata can be reused only at its permitted visibility; organization-owned stock, private fields, prices, and financial data retain their required scope. |
| Restore a full backup containing P and A/B units | Preserve shared Product identity, both sets of unit references, authorization boundaries, history, and derived organization totals consistently. |

## 7. Complete issue disposition

The following inventory records every issue examined. “No rewrite” refers only to this global Product change; it does not clear unrelated stale requirements or mark the ticket complete.

| Issue | Disposition |
| --- | --- |
| [#1 — Show user logged badge at the top of the app](https://github.com/WilliamPhilippe/storage-minis-be/issues/1) | No Product-specific rewrite identified |
| [#2 — storage-minis v0.5 — requirements baseline](https://github.com/WilliamPhilippe/storage-minis-be/issues/2) | Preserve historical baseline |
| [#3 — [Epic E01] Organization administration and business integrity](https://github.com/WilliamPhilippe/storage-minis-be/issues/3) | Align epic summary / scope |
| [#4 — [Epic E02] Products and individual inventory](https://github.com/WilliamPhilippe/storage-minis-be/issues/4) | Align epic summary / scope |
| [#5 — [Epic E03] Purchase ordering and receipt](https://github.com/WilliamPhilippe/storage-minis-be/issues/5) | Align epic summary / scope |
| [#6 — [Epic E04] Supplier settlements and acquisition costs](https://github.com/WilliamPhilippe/storage-minis-be/issues/6) | No Product-specific rewrite identified |
| [#7 — [Epic E05] Sales, reservations, and dispatch](https://github.com/WilliamPhilippe/storage-minis-be/issues/7) | No Product-specific rewrite identified |
| [#8 — [Epic E06] Customer accounts, payments, and credits](https://github.com/WilliamPhilippe/storage-minis-be/issues/8) | No Product-specific rewrite identified |
| [#9 — [Epic E07] Sale edits, cancellations, and returns](https://github.com/WilliamPhilippe/storage-minis-be/issues/9) | No Product-specific rewrite identified |
| [#10 — [Epic E08] Expenses, losses, and financial reporting](https://github.com/WilliamPhilippe/storage-minis-be/issues/10) | Align epic summary / scope |
| [#11 — [Epic E09] Personal collection and cost recovery](https://github.com/WilliamPhilippe/storage-minis-be/issues/11) | Align epic summary / scope |
| [#12 — [Epic E10] Public available-stock catalog](https://github.com/WilliamPhilippe/storage-minis-be/issues/12) | Align epic summary / scope |
| [#13 — [Epic E11] Excel migration and opening records](https://github.com/WilliamPhilippe/storage-minis-be/issues/13) | Align epic summary / scope |
| [#14 — [Epic E12] Deployment, backups, and production readiness](https://github.com/WilliamPhilippe/storage-minis-be/issues/14) | Align epic summary / scope |
| [#15 — [D01] Decide partial Return allocation order across Payments and Customer Credit](https://github.com/WilliamPhilippe/storage-minis-be/issues/15) | No Product-specific rewrite identified |
| [#16 — [D02] Decide historical collection-cost presentation after designation changes](https://github.com/WilliamPhilippe/storage-minis-be/issues/16) | Integration / regression validation |
| [#17 — [D03] Decide negative-profit treatment in model and pooled collection recovery](https://github.com/WilliamPhilippe/storage-minis-be/issues/17) | Integration / regression validation |
| [#18 — [D04] Define launch public catalog fields, images, search, and filters](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) | Amend acceptance criteria / design outputs |
| [#19 — [D05] Define launch reports and the average acquisition-price aggregation basis](https://github.com/WilliamPhilippe/storage-minis-be/issues/19) | Amend acceptance criteria / design outputs |
| [#20 — [D06] Define exceptional correction authority and financial treatment](https://github.com/WilliamPhilippe/storage-minis-be/issues/20) | Amend acceptance criteria / design outputs |
| [#21 — [T01] Model core entities, state dimensions, and cross-record invariants](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) | Amend acceptance criteria / design outputs |
| [#22 — [T02] Specify authentication, account recovery, and administrator authorization](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) | Amend acceptance criteria / design outputs |
| [#23 — [T04] Specify hosting, backup retention, restore targets, and launch support targets](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) | Integration / regression validation |
| [#24 — [T03] Specify exact BRL rounding, allocation remainders, and reporting dates](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) | No Product-specific rewrite identified |
| [#25 — [T05] Inspect the real spreadsheet and define legacy opening acquisition records](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Amend acceptance criteria / design outputs |
| [#26 — [T06] Choose implementation architecture and bootstrap transaction-capable application foundations](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) | Amend acceptance criteria / design outputs |
| [#27 — [E01.01] Establish administrator access and isolated organization-scoped records](https://github.com/WilliamPhilippe/storage-minis-be/issues/27) | Amend acceptance criteria / design outputs |
| [#28 — [E01.02] Implement atomic dated business operations with preserved audit history](https://github.com/WilliamPhilippe/storage-minis-be/issues/28) | Amend acceptance criteria / design outputs |
| [#29 — [E12.01] Deploy the application through the approved repeatable hosting process](https://github.com/WilliamPhilippe/storage-minis-be/issues/29) | Integration / regression validation |
| [#30 — [E02.01] Maintain Product identity, required fields, and public/private information](https://github.com/WilliamPhilippe/storage-minis-be/issues/30) | Amend acceptance criteria / design outputs |
| [#31 — [E03.01] Maintain Suppliers and their Purchase history](https://github.com/WilliamPhilippe/storage-minis-be/issues/31) | No Product-specific rewrite identified |
| [#32 — [E06.01] Maintain private Customer records and transaction relationships](https://github.com/WilliamPhilippe/storage-minis-be/issues/32) | No Product-specific rewrite identified |
| [#33 — [E12.02] Create daily backups and demonstrate restoration within approved targets](https://github.com/WilliamPhilippe/storage-minis-be/issues/33) | Integration / regression validation |
| [#34 — [E03.02] Register bulk Purchases and assign permanent Item IDs at order time](https://github.com/WilliamPhilippe/storage-minis-be/issues/34) | Amend acceptance criteria / design outputs |
| [#35 — [E02.02] Inspect individual Item identity, condition, asking price, and complete history](https://github.com/WilliamPhilippe/storage-minis-be/issues/35) | Amend acceptance criteria / design outputs |
| [#36 — [E04.01] Allocate supplier payments across specific units and Purchases](https://github.com/WilliamPhilippe/storage-minis-be/issues/36) | Integration / regression validation |
| [#37 — [E04.02] Record paid acquisition expenses and allocate exact costs to physical units](https://github.com/WilliamPhilippe/storage-minis-be/issues/37) | Integration / regression validation |
| [#38 — [E03.03] Receive selected fully funded units while leaving other order units outstanding](https://github.com/WilliamPhilippe/storage-minis-be/issues/38) | Integration / regression validation |
| [#39 — [E03.04] Edit Open Purchases and soft-delete only eligible ordered units](https://github.com/WilliamPhilippe/storage-minis-be/issues/39) | Integration / regression validation |
| [#40 — [E04.03] Derive unit landed costs and distinguish unknown, zero, and finalized costs](https://github.com/WilliamPhilippe/storage-minis-be/issues/40) | Integration / regression validation |
| [#41 — [E02.03] Approve received units for sale and finalize their acquisition costs](https://github.com/WilliamPhilippe/storage-minis-be/issues/41) | Integration / regression validation |
| [#42 — [E02.05] Show distinct ordered, on-hand, available, committed, and disposed quantities](https://github.com/WilliamPhilippe/storage-minis-be/issues/42) | Amend acceptance criteria / design outputs |
| [#43 — [E03.05] Complete fully received Purchases and lock ordinary edits](https://github.com/WilliamPhilippe/storage-minis-be/issues/43) | No Product-specific rewrite identified |
| [#44 — [E04.04] Derive Supplier balances and record refunds, credits, and settlement history](https://github.com/WilliamPhilippe/storage-minis-be/issues/44) | No Product-specific rewrite identified |
| [#45 — [E08.02] Recognize and reverse dated financial facts independently of customer payment](https://github.com/WilliamPhilippe/storage-minis-be/issues/45) | Amend acceptance criteria / design outputs |
| [#46 — [E02.04] Hold and release owned units for appreciation](https://github.com/WilliamPhilippe/storage-minis-be/issues/46) | Integration / regression validation |
| [#47 — [E05.01] Create Customer Sales for specific eligible Item IDs and book profit immediately](https://github.com/WilliamPhilippe/storage-minis-be/issues/47) | Integration / regression validation |
| [#48 — [E08.03] Register explicit Losses, inventory write-offs, and later recoveries once](https://github.com/WilliamPhilippe/storage-minis-be/issues/48) | Integration / regression validation |
| [#49 — [E09.01] Designate individual collection units and preserve designation changes](https://github.com/WilliamPhilippe/storage-minis-be/issues/49) | Amend acceptance criteria / design outputs |
| [#50 — [E03.06] Cancel entirely unreceived Purchases with reconciled supplier settlement](https://github.com/WilliamPhilippe/storage-minis-be/issues/50) | No Product-specific rewrite identified |
| [#51 — [E06.02] Record merchandise-only Payments and allocate them to Customer Sales](https://github.com/WilliamPhilippe/storage-minis-be/issues/51) | Integration / regression validation |
| [#52 — [E08.01] Record Sale-level selling expenses and preserve shipping scope boundaries](https://github.com/WilliamPhilippe/storage-minis-be/issues/52) | Integration / regression validation |
| [#53 — [E11.01] Build a validated Excel import preview using approved field and acquisition mapping](https://github.com/WilliamPhilippe/storage-minis-be/issues/53) | Amend acceptance criteria / design outputs |
| [#54 — [E01.03] Enforce concurrent item commitments and allocation integrity](https://github.com/WilliamPhilippe/storage-minis-be/issues/54) | Integration / regression validation |
| [#55 — [E05.02] Derive Reserved and In Garage status from outstanding balance](https://github.com/WilliamPhilippe/storage-minis-be/issues/55) | Integration / regression validation |
| [#56 — [E06.04] Show separate Customer Debt, Credit, and auditable account histories](https://github.com/WilliamPhilippe/storage-minis-be/issues/56) | Integration / regression validation |
| [#57 — [E05.03] Record explicit dispatch with optional nonunique tracking](https://github.com/WilliamPhilippe/storage-minis-be/issues/57) | Integration / regression validation |
| [#58 — [E07.03] Settle adjustments with distinct refunds, Customer Credit, and retained income](https://github.com/WilliamPhilippe/storage-minis-be/issues/58) | Amend acceptance criteria / design outputs |
| [#59 — [E08.04] Deliver approved source-derived inventory, debt, cost, and profit reports](https://github.com/WilliamPhilippe/storage-minis-be/issues/59) | Amend acceptance criteria / design outputs |
| [#60 — [E05.04] Inspect Sale status, agreed prices, and dated activity history](https://github.com/WilliamPhilippe/storage-minis-be/issues/60) | Integration / regression validation |
| [#61 — [E06.03] Apply existing Customer Credit to later Sales without recording new cash](https://github.com/WilliamPhilippe/storage-minis-be/issues/61) | No Product-specific rewrite identified |
| [#62 — [E07.01] Edit unshipped Sale items and prices with atomic credit reconciliation](https://github.com/WilliamPhilippe/storage-minis-be/issues/62) | Integration / regression validation |
| [#63 — [E07.02] Cancel unshipped Sales and release only eligible stock](https://github.com/WilliamPhilippe/storage-minis-be/issues/63) | Integration / regression validation |
| [#64 — [E07.04] Receive full physical Returns and support resale under the same Item IDs](https://github.com/WilliamPhilippe/storage-minis-be/issues/64) | Integration / regression validation |
| [#65 — [E07.05] Process partial Returns of multi-item Sales with reconciled allocations](https://github.com/WilliamPhilippe/storage-minis-be/issues/65) | Integration / regression validation |
| [#66 — [E10.01] Publish only approved effectively Available stock in the public catalog](https://github.com/WilliamPhilippe/storage-minis-be/issues/66) | Amend acceptance criteria / design outputs |
| [#67 — [E08.05] Implement approved exceptional correction workflows with dated adjustments](https://github.com/WilliamPhilippe/storage-minis-be/issues/67) | Integration / regression validation |
| [#68 — [E09.02] Calculate per-model collection recovery using booked gross profit](https://github.com/WilliamPhilippe/storage-minis-be/issues/68) | Amend acceptance criteria / design outputs |
| [#69 — [E10.02] Deliver approved catalog details, condition display, images, search, and filters](https://github.com/WilliamPhilippe/storage-minis-be/issues/69) | Amend acceptance criteria / design outputs |
| [#70 — [E09.03] Calculate pooled whole-collection recovery independently of model totals](https://github.com/WilliamPhilippe/storage-minis-be/issues/70) | Amend acceptance criteria / design outputs |
| [#71 — [E10.03] Validate public privacy and atomic catalog availability across lifecycle changes](https://github.com/WilliamPhilippe/storage-minis-be/issues/71) | Amend acceptance criteria / design outputs |
| [#72 — [E09.04] Present historical collection costs under the approved designation policy](https://github.com/WilliamPhilippe/storage-minis-be/issues/72) | Amend acceptance criteria / design outputs |
| [#73 — [E12.03] Verify supported browsers, devices, performance, and recovery behavior](https://github.com/WilliamPhilippe/storage-minis-be/issues/73) | Integration / regression validation |
| [#74 — [E11.02] Execute a controlled import and reconcile source inventory before cutover](https://github.com/WilliamPhilippe/storage-minis-be/issues/74) | Amend acceptance criteria / design outputs |
| [#75 — [E12.04] Complete v0.5 requirement coverage and production acceptance](https://github.com/WilliamPhilippe/storage-minis-be/issues/75) | Amend acceptance criteria / design outputs |

## 8. Earlier decision drift found during the initial audit

The initial audit found the following drift in older issue text. These are historical findings; the stale acceptance criteria and copied source excerpts have now been replaced, as recorded in Section 9:

- Customer-credit carryover remains explicit in #8, #15, #51, #56, #58, #61, #62, #63, and #65. In particular, #61 still asks for future-Sale credit use, while #62 still turns an R$20 exchange remainder into Customer Credit. Those outcomes must be replaced or retired according to the refund/reallocation policy; keep the underlying partial-Return funding-order decision open.
- Supplier credit remains in #44 and #50 and their quoted source requirements. Apply the already-approved no-SupplierCredit decision.
- #21 still lists older credit/designation concepts. Align its required model outputs with the accepted entity map rather than treating every original concept as a separate entity.
- #48's recovery wording needs to align with Loss void/reversal history and ordinary refund source records; it does not require a separate LossRecovery entity. Do not erase original dated facts or duplicate actual cash.

The publication below preserves the v0.5 snapshots and applies those corrections directly to current acceptance criteria and source excerpts. It does not rely on appending an override to contradictory active criteria.

## 9. Publication record

**Published:** 2026-10-21.

- Refreshed all 73 active existing backlog issues (#3–75): 12 epics, six existing decisions, six design tasks and 49 delivery issues. Updated source references, acceptance criteria, integration cases and requirement ownership to v0.6. Existing issue identities, parents and milestone assignments remain.
- Created current baseline [#78](https://github.com/WilliamPhilippe/storage-minis-be/issues/78), D07 shared Product maintenance [#79](https://github.com/WilliamPhilippe/storage-minis-be/issues/79) and D08 never-approved collection costs [#80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80), all in [Project 2](https://github.com/users/WilliamPhilippe/projects/2). The new decisions have native epic parents, M1 milestones, an owner and Ready/P0 fields.
- Replaced #61’s future-Sale credit outcome with existing eligible Sale/SaleItem funding reassignment. Rewrote the R$100 → R$80 swap example to refund/reassignment. Removed supplier-credit acceptance and corrected Membership, embedded address, parent-owned expenses, shared history, collection membership and Loss reversal behavior.
- Published 304 active requirements: 302 previous − PAY-031/CUS-016 + PRO-012/PRO-013/PAY-037/PAY-038. Nine retired IDs are explicit and excluded from delivery acceptance. Every active ID has one primary delivery owner in the [coverage index](requirements-coverage-v0.6.md).
- Added six native dependencies: #62/#63/#64 require #61; #68 requires D08; #75 requires D07 and D08. The graph has 63 parent links and 117 dependency links. D07 is a related policy gate for existing Product edits, not a whole-ticket blocker on auth, registration/read/reuse, or import preview.
- Updated the Project description, README, requirement ownership table and four storage-minis view filters to v0.6. Added `spec:v0.6` to current work; #2 retains `spec:v0.5`. Refreshed M3/M4 descriptions without moving existing milestones or changing estimates/statuses on existing items.
- Preserved issue #1, issue #2’s complete source snapshot, both repository v0.5 documents and the existing 111 prerequisite links. No delivery work was marked complete.

Verification compares every live current issue body/title to its prepared v0.6 draft; checks source excerpts, unique ownership of 304 IDs, retired-ID exclusion, Project membership, new decision fields/parents, native dependency equality and cycle absence; checks historical snapshots and unrelated issue #1; and checks documentation links, IDs, fences and whitespace. These are documentation/backlog checks. Application acceptance examples remain pending implementation, and D01–D08 remain open.
