# DBML review — fields, access roles, and legacy purchases

**Owner:** WilliamPhilippe. **Approval date:** 2026-10-23. **Source:** Owner's review of `docs/database/schema.dbml` in the Conductor workspace.

**Status:** Owner field decisions and follow-up answers applied to the visual draft; runtime enforcement remains design work. This record supplements the [2026-10-22 review](2026-10-22-schema-review.md) and [entity map v0.8](../entity-map-v0.8.md); it supersedes conflicting wording only for the decisions listed here. Published baselines and stable requirement/entity IDs remain unchanged. No application behavior is implemented.

## Confirmed changes

| Area | Owner decision | Existing references and delivery owners |
| --- | --- | --- |
| Money | Replace every `brl_amount` placeholder with an integer. Continue storing BRL centavos, as approved on October 22. | REQ-008; T01 / [#21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21), T03 / [#24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) |
| Business time | Replace `business_date` placeholders with timestamps. Preserve actual occurrence separately from recording time, UTC reporting and visitor-local display. DBML uses PostgreSQL `timestamptz` for these instants. | REQ-003, REQ-011; T01, T03 |
| Membership | Remove `revoked_at`. Revocation deletes the current Membership. Add `role`: `owner`, `editor`, `viewer`. Preserve grants/revocations in audit independently of the deleted row. | E03; ORG-003–005, ORG-008; T02 / [#22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) |
| User | Add global `role`: `global_admin`, `editor`, `user`. | E02; ORG-003–005; T02 |
| BusinessEvent | Defer explicit index definitions. The review applies this to the shared header and change details; primary keys remain. | E32, E35; T01 |
| ImportBatch | Delete the proposed table and its references. Import validation, reconciliation and rerun evidence remain T05 responsibilities; removing storage does not waive them. | E40; DATA-001–007; T05 / [#25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) |
| Shared Product metadata | Remove `scale` and `product_codes`; store `images` as an array of strings; add boolean `is_chase`. Product remains global. | E04, E42; PRO-001–013; T01, D04 / [#18](https://github.com/WilliamPhilippe/storage-minis-be/issues/18) |
| Physical unit condition | Replace seal/damage condition enums with nullable `sealed` and `damaged` booleans; collapse `not_applicable` into unknown (NULL). Add `damage_description`; remove `private_description`, retaining `private_notes`. | E05, E26; INV-002–004, INV-028; T01, D04 |
| Physical unit progress | Replace `possession` with `status`: `china`, `brasil`, `eua`, `bolivia`, `shipped`, `received`. | E05; INV-005; T01 |
| Sale disposition | Replace `is_sale_approved`, `is_held_for_appreciation`, `is_collection` with mutually exclusive `sale_status`: `unapproved`, `available`, `held`, `collection`. A collection item is not independently approved for sale. This explicitly supersedes the earlier independent-flags model. | E05; REQ-012, INV-005, INV-030, COL-001–009; T01, D08 / [#80](https://github.com/WilliamPhilippe/storage-minis-be/issues/80) |
| Readable identity | Add `inventoryId`, a short identifier written on the physical box. Preserve the earlier automatically assigned, immutable, Organization-unique, never-reused identity contract. The earlier `ITEM-000001` was an example, not a mandatory prefix. | E05; REQ-009, INV-001; T01, T05 |
| Unit indexes | Keep only the explicit `organization_id` lookup index on InventoryItem. Global Product has no Organization index because it has no owning Organization. Primary keys remain. Required uniqueness/scope enforcement is deferred to T01, rather than removed as a business invariant. | E04–E05; TECH-005–006; T01 |
| Legacy acquisition grouping | Group imported units into one Purchase per Organization, Supplier and purchase year/month. Use the known Supplier where available; assign an Organization-owned unknown Supplier where it is missing. Date each group on the second day of its month under the explicit follow-up approval. Example: October units from A form one Purchase; November units from A and October units from B form separate Purchases. | E06–E08, E39–E41; DATA-003–007; T05 |

The owner's “Products” section includes both global Product metadata and Organization-owned physical-unit fields. The review preserves that ownership split; condition, progress, asking price and `inventoryId` belong on InventoryItem.

## Follow-up answers and examples

The owner answered all three review questions on 2026-10-23:

- **Sale status:** `unapproved`, `available`, `held`, `collection`, mutually exclusive. Current collection membership is `sale_status = collection`. A transition to `available` removes collection membership; a transition to `collection` removes current sale eligibility. Historical first-approval and permanent cost-finalization facts remain preserved. Collection units may still finalize complete/settled costs without becoming available.
- **Month-only history:** Use the second day of the known purchase month. The DBML normalizes this conventional timestamp to **00:00 UTC**, retaining `opening_month` and the opening marker so it is identifiable as a migration convention. For October 2026, store `2026-10-02T00:00:00Z`. This expressly permits a conventional import date where the earlier log required an unknown exact instant; it does not assert the historical purchase happened then or authorize invented cash/receipt records.
- **Unknown condition:** Allow NULL for `sealed` / `damaged`; collapse `not_applicable` into unknown. False still means a known open/undamaged condition. The same boolean representation applies to preserved ReturnItem conditions.

Role names alone do not define their full capability matrix. T02 must map them to Organization operations and the already approved global `can_edit_products` authority; the owner has not explicitly replaced that authority with a role-only policy. Country/progress transitions, the meaning of `shipped` relative to incoming/outgoing shipment, and Loss/Return effects still need a transition contract. Sale dispatch, Loss and removal facts remain independently traceable.

## Implementation proposals and propagation

An unpadded uppercase base36 sequence (`1`, `Z`, `10`) is proposed for short `inventoryId` values. The owner approved a short readable identifier; this exact encoding is a proposal; generator/range decisions remain T01. Concurrent generation must preserve Organization uniqueness and never reuse removed identifiers.

Marked `purchases` replace the separate E39 table; all units now reference PurchaseItems. The unknown Supplier placeholder has no fabricated phone/type, while known Suppliers keep those requirements through checks. Opening merchandise amounts can remain unknown; ordinary required amounts, source/month grouping and one unknown Supplier per Organization require cross-record enforcement. No historical cash or receipt is manufactured; the second-day date is the explicitly approved exception for month-only source dates.

The DBML remains a visual draft. Removing supporting indexes leaves some conceptual composite references without executable PostgreSQL target keys; T01 must design equivalent scope and uniqueness enforcement before migrations. BRL integer storage does not establish overflow handling, exact intermediate arithmetic or input/period-filter contracts.

Requirements v0.7, entity map v0.8, coverage and GitHub acceptance criteria still require a coordinated later publication. Existing primary ownership and issue dependencies remain unchanged. The older draft's unrelated October 22 gaps—settlement separation, allocation-derived expense links, mandatory SaleItem funding, deletion-safe audit and original-period reporting—also remain visible design work; this field review does not approve their stale representations or close their delivery issues.
