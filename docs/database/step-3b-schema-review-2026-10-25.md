# Step 3B — schema reconciliation review

**Date:** 2026-10-25. **Status:** Review packet; no executable schema or migration.
The owner approved the [implementation plan](../plans/step-3-drizzle-and-base-migration-plan-2026-10-24.md)
with a separate physical-schema review gate. Step 3A does not remove that gate.
This packet inventories the current DBML and makes the next choices reviewable.
It does not claim that all cross-record enforcement is already designed.

## Sources and precedence

Start with [schema.dbml](schema.dbml) and [database design](design.md). Apply
[requirements v0.7](../requirements/requirements-v0.7.md) with
[entity map v0.8](../entities/entity-map-v0.8.md), then the October 22 schema review
and October 23 field, index/candidate and partial-expense-payment decisions in
[the update index](../requirement-updates/README.md). Later approvals prevail.
Preserve all 38 active entity responsibilities and retired IDs; the inventory
below covers physical draft declarations, not one SQL table per entity.

## Decisions for owner review

The following remain **recommendations**. Approval of 3A and selection of Drizzle
are not approval of these physical-schema changes.

| ID | Recommendation | Why / alternative | Primary owner |
| --- | --- | --- | --- |
| S01 | Keep the 33 draft table names and 11 enum names/values. Use snake_case SQL names as drawn, including the existing exceptional `inventoryId` spelling, with explicit TS property mappings. Group TS schema modules by the diagram's domain families. | Avoid unrelated renaming during the first conversion. A wholesale naming cleanup would increase the review scope. | T01/T06 |
| S02 | Integer primary keys use PostgreSQL `GENERATED ALWAYS AS IDENTITY`, positive IDs. Money stays integer centavos with nonnegative merchandise/agreed-price/cost checks and positive Payment/refund/expense checks. | Positive int32 amounts cap at R$21,474,836.47. Wider bigint/numeric storage changes the JS/input contract. Use exact bigint intermediate arithmetic in later allocation code, with overflow rejection before persistence. | T01/T03 |
| S03 | Use `timestamptz(3)` with Drizzle Date mode. Supply business occurrence timestamps explicitly; default only recording timestamps (`recorded_at`, Organization/User `created_at`) to current time. | Millisecond precision matches JS Date. Microsecond preservation requires a different representation. Keep occurrence distinct from recording and the approved UTC opening-date convention. | T03 |
| S04 | Derive readable uppercase base36 `inventoryId` from the permanent integer ID. Recommend a reviewed immutable SQL conversion function and a stored generated column so the readable value cannot be edited independently. | A global sequence can produce gaps within an Organization, which is allowed; an Organization-local counter is shorter but needs separate serialized storage. Example IDs 1/35/36 become `1`/`Z`/`10`. Review function SQL before migration. | T01/T03 |
| S05 | Add only the scoped unique target keys required by retained composite references, plus the invariant indexes listed below. Resolve NULL-sensitive global-event references with explicit scope compatibility, not only an optional composite FK. | October 23 deferred indexes for review; it did not waive isolation or uniqueness. Required uniqueness adds indexes even when it is not a performance optimization. Single-column FKs alone leave scope gaps. | T01/T02 |
| S06 | Add `users.can_edit_products boolean NOT NULL DEFAULT false`; make Customer name nonnull/nonblank; add `inventory_items.public_description text` and `public_images text[]`, both optional. | These propagate approved rules. Role-only authority conflicts with the permission decision; a separate media table adds unselected lifecycle fields. No administrator row or Firebase bootstrap is seeded. | T01/T02/D04/D07 |
| S07 | Keep immutable typed audit subject IDs and before/after facts for deletable Sale/SaleItem subjects, without restrictive live-subject FKs on those columns. Retain the BusinessEvent FK and scope checks. Validate the subject and preserve Sale/Item context within the action transaction. | Cascade loses history; SET NULL alone loses the subject and conflicts with exactly-one-subject checks. Soft deletion changes the selected workflow. Enumerate all permitted generated dependent-record deletions before finalizing other audit FKs. | T01/D06 |
| S08 | Preserve expense payment rows, `settled_amount` as reconciled cache, positive installment checks and completion timestamps. Preserve the four dedicated settlement tables and allocation-derived PurchaseExpense links. | A single expense-payment field cannot represent installments; a second Purchase association duplicates the selected-unit source. No generic wallet/ledger/import candidate tables. These are already approved policies; only physical enforcement remains. | T01/PurchaseExpense/SaleExpense |
| S09 | Keep declarative row/scope/uniqueness enforcement in the migration. Specify transactional locks and writers separately for sums, source reuse, same-Product PurchaseItems, permanent locks, deletion-vs-funding and history attribution; review any trigger/function explicitly. | Ordinary CHECK constraints cannot enforce cross-row aggregates. A migration alone cannot prove a business operation. Resolve storage-shape consequences before generation; do not infer D01 tie-breaking or D06 exception policy. | T01/T03/D01/D06 |
| S10 | Deliver a base structural schema with no exposed business write API, no seed and no import. Explicitly defer workflow acceptance until its real transaction implementation exists; retain the test obligations below. | This allows a replayable foundation without claiming all purchases/sales/funding behavior. If the owner requires complete transaction enforcement in the base delivery, extend 3B's reviewed scope before generating it. | T01/T06 |

### Invariant keys to include in the S05 review

- `users(firebase_uid)` and `memberships(organization_id, user_id)` unique.
- `inventory_items(organization_id, inventoryId)` unique; a partial unique key on
  `(organization_id, product_id)` where `sale_status = 'collection'`.
- `sale_items(organization_id, inventory_item_id)` unique where
  `released_event_id IS NULL`, preserving historical Return/resale lines.
- `acquisition_expense_allocations(organization_id, purchase_expense_id,
  inventory_item_id)` unique for the current allocation representation.
- `return_items(organization_id, sale_item_id)` unique.
- `suppliers(organization_id)` unique where `is_unknown`; marked opening Purchases
  unique on `(organization_id, supplier_id, opening_month)` where `is_opening`.
- `business_event_changes(business_event_id, sequence)` unique for deterministic
  within-action facts. Supporting `(organization_id, id)` and longer party/source
  target keys follow the actual retained composite FK column order below.
- Retain ordinary Organization lookup indexes from the draft. No SKU, tracking
  code or email uniqueness is inferred; Product remains global.

### Remaining shape checks before SQL generation

The reference inventory is deliberately not a mechanical FK translation.
Specifically, nullable `organization_id` makes an ordinary composite FK insufficient
for matching global audit detail scope to its event. Recommend a generated scope
column and an additional event-ID/scope FK, with a corresponding event target key;
review its exact columns together with Product registration/global-action scope.
Event/change reversal links also need same-scope/Organization validation. Product
registration can insert the event header before Product and typed detail, keeping
all three in one transaction; check all other insert cycles explicitly.

For S07, preserve typed subject identifiers and historical snapshots even after
permitted deletion. Determine the full list of dependent records removable with
a never-funded line before removing any additional live FKs. This packet does
not authorize broadly dropping audit referential integrity.

The current `released_event_id IS NULL` representation must remain equivalent to
an active commitment across cancellation, Return and deletion; otherwise revise
the partial predicate before creating the key. Cost-finalization, Completed
Purchase locks and the approved physical status transitions need a concrete writer
contract. No country default or invented incoming/outgoing shipment semantics is
selected here.

### Validation ownership

S01–S08 require catalog comparison, fresh replay, second-apply no-op, no-change
generation, FK/check/unique rejection and real concurrent uniqueness tests. Test
cross-Organization and cross-Customer/Supplier references separately; global
Product reuse remains allowed. Audit deletion must retain identifiable facts.
S09/S10 deferrals must name the operation/owner and missing tests: aggregate
reconciliation/overpayment, source reuse, permanent locks and deletion-vs-funding
races require real concurrent transactions, not fixture SQL that bypasses them.
No migration or workflow is accepted by this review packet alone.

## Inventory and common mapping

Every field below inherits its draft nullability/default except the explicit
proposed overrides S02–S07. `id integer` maps to integer identity primary key;
other integer columns map to Drizzle `integer`, text to `text`, boolean to
`boolean`, text arrays to `text().array()`, JSONB to `jsonb`, varchar to its declared
length, and timestamps to `timestamp(..., { withTimezone: true, precision: 3,
mode: 'date' })`. Enumerated columns use the matching `pgEnum`. Row checks are
listed separately. Defaults are never fabricated for missing legacy facts.
JSONB before/after shapes still need typed action contracts before business writes.

The per-table requirement/entity notes in [DBML](schema.dbml) and the
[38-responsibility map](design.md#stable-entity-responsibilities) supply traceability.
E33/E34 are derived; E39 is marked Purchases; E40/E41 remain import artifacts;
E42/E43/E44 are embedded values. Retired E12/E17/E22/E23/E30/E31/E38 stay absent.

DBML SHA-256 at inventory: `94fae16f6af7a67c99fb23c89aed7adefe7ddf2a3d6beb04716c2d03478922ef`.

### Enums

| Enum | Values retained (S01) |
| --- | --- |
| `supplier_type` | `person`, `business` |
| `inventory_status` | `china`, `brasil`, `eua`, `bolivia`, `shipped`, `received` |
| `sale_status` | `unapproved`, `available`, `held`, `collection` |
| `purchase_lifecycle` | `open`, `completed`, `canceled` |
| `expense_completeness` | `unknown`, `confirmed_zero`, `accounted_for` |
| `acquisition_allocation_method` | `proportional_to_value`, `equal_per_unit`, `manual` |
| `business_event_scope` | `organization`, `global_product` |
| `customer_settlement_outcome` | `refund`, `reassignment`, `retained_income` |
| `supplier_settlement_outcome` | `refund`, `reassignment`, `loss` |
| `membership_role` | `owner`, `editor`, `viewer` |
| `user_role` | `global_admin`, `editor`, `user` |

### `organizations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `name` | `text` | not null; no default |
| `created_at` | `timestamptz` | not null; no default |

### `users`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `firebase_uid` | `text` | not null; no default |
| `email` | `text` | nullable; no default |
| `display_name` | `text` | nullable; no default |
| `role` | `user_role` | not null, default: 'user' |
| `created_at` | `timestamptz` | not null; no default |

### `memberships`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `user_id` | `integer` | not null; no default |
| `granted_at` | `timestamptz` | not null; no default |
| `role` | `membership_role` | not null; no default |

### `products`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `name` | `text` | not null; no default |
| `sku` | `text` | not null; no default |
| `brand` | `text` | not null; no default |
| `description` | `text` | nullable; no default |
| `images` | `text[]` | nullable; no default |
| `is_chase` | `boolean` | not null, default: false |
| `registration_event_id` | `integer` | not null; no default |

### `inventory_items`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `inventoryId` | `text` | not null; no default |
| `organization_id` | `integer` | not null; no default |
| `product_id` | `integer` | not null; no default |
| `purchase_id` | `integer` | not null; no default |
| `purchase_item_id` | `integer` | not null; no default |
| `merchandise_cost` | `integer` | nullable; no default |
| `sealed` | `boolean` | nullable; no default |
| `damaged` | `boolean` | nullable; no default |
| `damage_description` | `text` | nullable; no default |
| `private_notes` | `text` | nullable; no default |
| `asking_price` | `integer` | nullable; no default |
| `status` | `inventory_status` | not null; no default |
| `sale_status` | `sale_status` | not null, default: 'unapproved' |
| `first_received_event_id` | `integer` | nullable; no default |
| `first_sale_approval_event_id` | `integer` | nullable; no default |
| `removed_event_id` | `integer` | nullable; no default |
| `acquisition_expense_completeness` | `expense_completeness` | not null, default: 'unknown' |
| `finalized_acquisition_cost` | `integer` | nullable; no default |
| `cost_finalized_event_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `cost_snapshot_has_event`: `((finalized_acquisition_cost IS NULL) = (cost_finalized_event_id IS NULL))`.

### `suppliers`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `name` | `text` | not null; no default |
| `phone` | `text` | nullable; no default |
| `type` | `supplier_type` | nullable; no default |
| `is_unknown` | `boolean` | not null, default: false |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `known_supplier_has_contact_and_type`: `(is_unknown OR (phone IS NOT NULL AND type IS NOT NULL))`.
- `unknown_supplier_has_no_fabricated_details`: `(NOT is_unknown OR (phone IS NULL AND type IS NULL))`.

### `purchases`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `supplier_id` | `integer` | not null; no default |
| `ordered_on` | `timestamptz` | not null; no default |
| `is_opening` | `boolean` | not null, default: false |
| `opening_month` | `varchar(7)` | nullable; no default |
| `opening_source_description` | `text` | nullable; no default |
| `opening_evidence` | `jsonb` | nullable; no default |
| `lifecycle` | `purchase_lifecycle` | not null, default: 'open' |
| `expense_completeness` | `expense_completeness` | not null, default: 'unknown' |
| `expenses_confirmed_event_id` | `integer` | nullable; no default |
| `incoming_shipping_notes` | `text` | nullable; no default |
| `completed_event_id` | `integer` | nullable; no default |
| `canceled_event_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `opening_purchase_has_month`: `((opening_month IS NOT NULL) = is_opening)`.
- `valid_opening_month`: `(opening_month IS NULL OR (opening_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' AND left(opening_month, 4) <> '0000'))`.
- `opening_purchase_uses_second_day`: `(NOT is_opening OR ordered_on = (opening_month || '-02T00:00:00Z')::timestamptz)`.

### `purchase_items`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `purchase_id` | `integer` | not null; no default |
| `ordered_quantity` | `integer` | not null; no default |
| `merchandise_total` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_ordered_quantity`: `ordered_quantity > 0`.

### `supplier_payments`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `supplier_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `paid_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `supplier_payment_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `supplier_id` | `integer` | not null; no default |
| `supplier_payment_id` | `integer` | not null; no default |
| `purchase_id` | `integer` | not null; no default |
| `inventory_item_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `supplier_refunds`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `supplier_id` | `integer` | not null; no default |
| `settlement_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `received_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `related_loss_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `purchase_expenses`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `incurred_on` | `timestamptz` | not null; no default |
| `category` | `text` | not null; no default |
| `context` | `text` | nullable; no default |
| `allocation_method` | `acquisition_allocation_method` | not null, default: 'proportional_to_value' |
| `settled_amount` | `integer` | not null, default: 0 |
| `settled_on` | `timestamptz` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_purchase_expense`: `amount > 0`.
- `purchase_expense_payment_bounds`: `(settled_amount >= 0 AND settled_amount <= amount)`.
- `purchase_expense_fully_paid_timestamp`: `((settled_on IS NOT NULL) = (settled_amount = amount))`.

### `purchase_expense_payments`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `purchase_expense_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `paid_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_purchase_expense_payment`: `amount > 0`.

### `acquisition_expense_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `purchase_expense_id` | `integer` | not null; no default |
| `purchase_id` | `integer` | not null; no default |
| `inventory_item_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `sale_expenses`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `incurred_on` | `timestamptz` | not null; no default |
| `category` | `text` | not null; no default |
| `context` | `text` | nullable; no default |
| `settled_amount` | `integer` | not null, default: 0 |
| `settled_on` | `timestamptz` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_sale_expense`: `amount > 0`.
- `sale_expense_payment_bounds`: `(settled_amount >= 0 AND settled_amount <= amount)`.
- `sale_expense_fully_paid_timestamp`: `((settled_on IS NOT NULL) = (settled_amount = amount))`.

### `sale_expense_payments`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `sale_expense_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `paid_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_sale_expense_payment`: `amount > 0`.

### `customers`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `name` | `text` | nullable; no default |
| `phone` | `text` | nullable; no default |
| `address_line_1` | `text` | nullable; no default |
| `address_line_2` | `text` | nullable; no default |
| `address_neighborhood` | `text` | nullable; no default |
| `address_city` | `text` | nullable; no default |
| `address_region` | `text` | nullable; no default |
| `address_postal_code` | `text` | nullable; no default |
| `address_country` | `text` | nullable; no default |
| `notes` | `text` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `sales`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `customer_id` | `integer` | not null; no default |
| `sold_on` | `timestamptz` | not null; no default |
| `dispatched_on` | `timestamptz` | nullable; no default |
| `dispatch_event_id` | `integer` | nullable; no default |
| `tracking_code` | `text` | nullable; no default |
| `canceled_event_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `dispatch_has_date_and_event`: `((dispatched_on IS NULL) = (dispatch_event_id IS NULL))`.
- `ordinary_cancellation_before_dispatch`: `(canceled_event_id IS NULL OR dispatch_event_id IS NULL)`.

### `sale_items`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `inventory_item_id` | `integer` | not null; no default |
| `agreed_price` | `integer` | not null; no default |
| `recognized_acquisition_cost` | `integer` | not null; no default |
| `released_event_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `returns`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `received_on` | `timestamptz` | not null; no default |
| `reason` | `text` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `return_items`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `return_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `sale_item_id` | `integer` | not null; no default |
| `sealed` | `boolean` | nullable; no default |
| `damaged` | `boolean` | nullable; no default |
| `damage_description` | `text` | nullable; no default |
| `approved_for_sale` | `boolean` | not null; no default |
| `condition_notes` | `text` | nullable; no default |

### `customer_payments`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `customer_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `paid_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `customer_payment_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `customer_id` | `integer` | not null; no default |
| `customer_payment_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `sale_item_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `customer_refunds`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `customer_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `settlement_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `refunded_on` | `timestamptz` | not null; no default |
| `method` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `retained_income`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `settlement_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `recognized_on` | `timestamptz` | not null; no default |
| `reason` | `text` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `retained_income_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `retained_income_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `sale_item_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `created_event_id` | `integer` | not null; no default |

### `losses`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `inventory_item_id` | `integer` | nullable; no default |
| `purchase_id` | `integer` | nullable; no default |
| `sale_id` | `integer` | nullable; no default |
| `amount` | `integer` | not null; no default |
| `occurred_on` | `timestamptz` | not null; no default |
| `reason` | `text` | not null; no default |
| `reversed_event_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `business_events`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `scope` | `business_event_scope` | not null; no default |
| `organization_id` | `integer` | nullable; no default |
| `context_organization_id` | `integer` | nullable; no default |
| `actor_user_id` | `integer` | not null; no default |
| `action_type` | `text` | not null; no default |
| `occurred_at` | `timestamptz` | not null; no default |
| `recorded_at` | `timestamptz` | not null; no default |
| `reason` | `text` | nullable; no default |
| `reverses_event_id` | `integer` | nullable; no default |

Draft row checks to retain/reconcile under S02–S09:

- `business_event_scope_matches_owner`: `((scope = 'organization' AND organization_id IS NOT NULL) OR (scope = 'global_product' AND organization_id IS NULL))`.

### `business_event_changes`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `business_event_id` | `integer` | not null; no default |
| `organization_id` | `integer` | nullable; no default |
| `sequence` | `integer` | not null; no default |
| `change_kind` | `text` | not null; no default |
| `product_id` | `integer` | nullable; no default |
| `membership_user_id` | `integer` | nullable; no default |
| `inventory_item_id` | `integer` | nullable; no default |
| `supplier_id` | `integer` | nullable; no default |
| `purchase_id` | `integer` | nullable; no default |
| `purchase_item_id` | `integer` | nullable; no default |
| `supplier_payment_id` | `integer` | nullable; no default |
| `supplier_payment_allocation_id` | `integer` | nullable; no default |
| `supplier_refund_id` | `integer` | nullable; no default |
| `purchase_expense_id` | `integer` | nullable; no default |
| `purchase_expense_payment_id` | `integer` | nullable; no default |
| `acquisition_expense_allocation_id` | `integer` | nullable; no default |
| `customer_id` | `integer` | nullable; no default |
| `sale_id` | `integer` | nullable; no default |
| `sale_item_id` | `integer` | nullable; no default |
| `sale_expense_id` | `integer` | nullable; no default |
| `sale_expense_payment_id` | `integer` | nullable; no default |
| `customer_payment_id` | `integer` | nullable; no default |
| `customer_payment_allocation_id` | `integer` | nullable; no default |
| `customer_refund_id` | `integer` | nullable; no default |
| `return_id` | `integer` | nullable; no default |
| `return_item_id` | `integer` | nullable; no default |
| `retained_income_id` | `integer` | nullable; no default |
| `retained_income_allocation_id` | `integer` | nullable; no default |
| `loss_id` | `integer` | nullable; no default |
| `customer_settlement_id` | `integer` | nullable; no default |
| `customer_settlement_source_allocation_id` | `integer` | nullable; no default |
| `supplier_settlement_id` | `integer` | nullable; no default |
| `supplier_settlement_source_allocation_id` | `integer` | nullable; no default |
| `before_facts` | `jsonb` | nullable; no default |
| `after_facts` | `jsonb` | nullable; no default |
| `reverses_change_id` | `integer` | nullable; no default |

Draft row checks to retain/reconcile under S02–S09:

- `one_typed_business_subject`: `num_nonnulls(product_id, membership_user_id, inventory_item_id, supplier_id, purchase_id, purchase_item_id, supplier_payment_id, supplier_payment_allocation_id, supplier_refund_id, purchase_expense_id, purchase_expense_payment_id, acquisition_expense_allocation_id, customer_id, sale_id, sale_item_id, sale_expense_id, sale_expense_payment_id, customer_payment_id, customer_payment_allocation_id, customer_refund_id, return_id, return_item_id, retained_income_id, retained_income_allocation_id, loss_id, customer_settlement_id, customer_settlement_source_allocation_id, supplier_settlement_id, supplier_settlement_source_allocation_id) = 1`.
- `change_subject_matches_scope`: `((organization_id IS NULL AND product_id IS NOT NULL) OR (organization_id IS NOT NULL AND product_id IS NULL))`.
- `preserved_business_facts`: `(before_facts IS NOT NULL OR after_facts IS NOT NULL)`.
- `positive_change_sequence`: `sequence > 0`.

### `customer_settlements`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `customer_id` | `integer` | not null; no default |
| `sale_id` | `integer` | not null; no default |
| `return_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `customer_settlement_source_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `settlement_id` | `integer` | not null; no default |
| `source_customer_payment_allocation_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `outcome` | `customer_settlement_outcome` | not null; no default |
| `customer_refund_id` | `integer` | nullable; no default |
| `target_customer_payment_allocation_id` | `integer` | nullable; no default |
| `retained_income_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_customer_settlement_portion`: `amount > 0`.
- `one_customer_settlement_outcome`: `((outcome = 'refund' AND target_customer_payment_allocation_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'reassignment' AND target_customer_payment_allocation_id IS NOT NULL AND customer_refund_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'retained_income' AND retained_income_id IS NOT NULL AND customer_refund_id IS NULL AND target_customer_payment_allocation_id IS NULL))`.

### `supplier_settlements`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `supplier_id` | `integer` | not null; no default |
| `purchase_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

### `supplier_settlement_source_allocations`

| Field | Draft type | Draft nullability / default / key |
| --- | --- | --- |
| `id` | `integer` | pk, not null; no default |
| `organization_id` | `integer` | not null; no default |
| `settlement_id` | `integer` | not null; no default |
| `source_supplier_payment_allocation_id` | `integer` | not null; no default |
| `amount` | `integer` | not null; no default |
| `outcome` | `supplier_settlement_outcome` | not null; no default |
| `supplier_refund_id` | `integer` | nullable; no default |
| `target_supplier_payment_allocation_id` | `integer` | nullable; no default |
| `loss_id` | `integer` | nullable; no default |
| `related_prior_loss_id` | `integer` | nullable; no default |
| `created_event_id` | `integer` | not null; no default |

Draft row checks to retain/reconcile under S02–S09:

- `positive_supplier_settlement_portion`: `amount > 0`.
- `one_supplier_settlement_outcome`: `((outcome = 'refund' AND target_supplier_payment_allocation_id IS NULL AND loss_id IS NULL) OR (outcome = 'reassignment' AND target_supplier_payment_allocation_id IS NOT NULL AND supplier_refund_id IS NULL AND loss_id IS NULL) OR (outcome = 'loss' AND loss_id IS NOT NULL AND supplier_refund_id IS NULL AND target_supplier_payment_allocation_id IS NULL))`.

## Reference inventory

All 158 draft reference declarations are accounted for below. Retain scope and
restrictive deletion unless S07's reviewed audit representation replaces the live
subject link. The one-to-one ReturnItem reference requires its original SaleItem
FK plus uniqueness. Add the required target keys under S05; review nullable paths
and source/outcome context under S09. Reference names are preserved for traceability.

| Reference | Draft relationship and deletion action | Review |
| --- | --- | --- |
| `owner_memberships` | `memberships.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_inventory_items` | `inventory_items.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_suppliers` | `suppliers.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_purchases` | `purchases.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_purchase_items` | `purchase_items.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_supplier_payments` | `supplier_payments.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_supplier_payment_allocations` | `supplier_payment_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_supplier_refunds` | `supplier_refunds.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_purchase_expenses` | `purchase_expenses.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_acquisition_expense_allocations` | `acquisition_expense_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_sale_expenses` | `sale_expenses.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customers` | `customers.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_sales` | `sales.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_sale_items` | `sale_items.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_returns` | `returns.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_return_items` | `return_items.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customer_payments` | `customer_payments.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customer_payment_allocations` | `customer_payment_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customer_refunds` | `customer_refunds.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_retained_income` | `retained_income.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_retained_income_allocations` | `retained_income_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_losses` | `losses.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_business_events` | `business_events.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_business_event_changes` | `business_event_changes.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `membership_user` | `memberships.user_id > users.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `unit_global_product` | `inventory_items.product_id > products.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `product_registration` | `products.registration_event_id > business_events.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `unit_purchase` | `inventory_items.(organization_id, purchase_id) > purchases.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `unit_purchase_line` | `inventory_items.(organization_id, purchase_id, purchase_item_id) > purchase_items.(organization_id, purchase_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchase_supplier` | `purchases.(organization_id, supplier_id) > suppliers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchase_line_header` | `purchase_items.(organization_id, purchase_id) > purchases.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_payment_party` | `supplier_payments.(organization_id, supplier_id) > suppliers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_allocation_payment_party` | `supplier_payment_allocations.(organization_id, supplier_id, supplier_payment_id) > supplier_payments.(organization_id, supplier_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_allocation_purchase_party` | `supplier_payment_allocations.(organization_id, supplier_id, purchase_id) > purchases.(organization_id, supplier_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_allocation_unit_purchase` | `supplier_payment_allocations.(organization_id, purchase_id, inventory_item_id) > inventory_items.(organization_id, purchase_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_refund_party` | `supplier_refunds.(organization_id, supplier_id) > suppliers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_refund_original_loss` | `supplier_refunds.(organization_id, related_loss_id) > losses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `expense_allocation_source` | `acquisition_expense_allocations.(organization_id, purchase_expense_id) > purchase_expenses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `expense_allocation_unit_purchase` | `acquisition_expense_allocations.(organization_id, purchase_id, inventory_item_id) > inventory_items.(organization_id, purchase_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `selling_expense_sale` | `sale_expenses.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sale_customer` | `sales.(organization_id, customer_id) > customers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sale_line_header` | `sale_items.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sale_line_unit` | `sale_items.(organization_id, inventory_item_id) > inventory_items.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `return_original_sale` | `returns.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `return_line_header_sale` | `return_items.(organization_id, sale_id, return_id) > returns.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `return_line_original_sale_line` | `sale_items.(organization_id, sale_id, id) - return_items.(organization_id, sale_id, sale_item_id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_payment_party` | `customer_payments.(organization_id, customer_id) > customers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_allocation_payment_party` | `customer_payment_allocations.(organization_id, customer_id, customer_payment_id) > customer_payments.(organization_id, customer_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_allocation_sale_party` | `customer_payment_allocations.(organization_id, customer_id, sale_id) > sales.(organization_id, customer_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_allocation_sale_line` | `customer_payment_allocations.(organization_id, sale_id, sale_item_id) > sale_items.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_refund_sale_party` | `customer_refunds.(organization_id, customer_id, sale_id) > sales.(organization_id, customer_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `retained_income_sale` | `retained_income.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `retained_allocation_income_sale` | `retained_income_allocations.(organization_id, sale_id, retained_income_id) > retained_income.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `retained_allocation_affected_sale_line` | `retained_income_allocations.(organization_id, sale_id, sale_item_id) > sale_items.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `loss_inventory_item` | `losses.(organization_id, inventory_item_id) > inventory_items.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `loss_purchase` | `losses.(organization_id, purchase_id) > purchases.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `loss_sale` | `losses.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `event_actor` | `business_events.actor_user_id > users.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `event_context` | `business_events.context_organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `event_reversal_identity` | `business_events.reverses_event_id > business_events.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `event_reversal_owner` | `business_events.(organization_id, reverses_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_event_identity` | `business_event_changes.business_event_id > business_events.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_event_owner` | `business_event_changes.(organization_id, business_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_global_product` | `business_event_changes.product_id > products.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_membership_user` | `business_event_changes.membership_user_id > users.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_reversal_identity` | `business_event_changes.reverses_change_id > business_event_changes.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_reversal_owner` | `business_event_changes.(organization_id, reverses_change_id) > business_event_changes.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_inventory_item` | `business_event_changes.(organization_id, inventory_item_id) > inventory_items.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier` | `business_event_changes.(organization_id, supplier_id) > suppliers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_purchase` | `business_event_changes.(organization_id, purchase_id) > purchases.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_purchase_item` | `business_event_changes.(organization_id, purchase_item_id) > purchase_items.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier_payment` | `business_event_changes.(organization_id, supplier_payment_id) > supplier_payments.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier_payment_allocation` | `business_event_changes.(organization_id, supplier_payment_allocation_id) > supplier_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier_refund` | `business_event_changes.(organization_id, supplier_refund_id) > supplier_refunds.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_purchase_expense` | `business_event_changes.(organization_id, purchase_expense_id) > purchase_expenses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_acquisition_expense_allocation` | `business_event_changes.(organization_id, acquisition_expense_allocation_id) > acquisition_expense_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer` | `business_event_changes.(organization_id, customer_id) > customers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_sale` | `business_event_changes.(organization_id, sale_id) > sales.(organization_id, id) [delete: restrict]` | S07: replace restrictive live-subject FK with preserved typed identity |
| `change_sale_item` | `business_event_changes.(organization_id, sale_item_id) > sale_items.(organization_id, id) [delete: restrict]` | S07: replace restrictive live-subject FK with preserved typed identity |
| `change_sale_expense` | `business_event_changes.(organization_id, sale_expense_id) > sale_expenses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer_payment` | `business_event_changes.(organization_id, customer_payment_id) > customer_payments.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer_payment_allocation` | `business_event_changes.(organization_id, customer_payment_allocation_id) > customer_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer_refund` | `business_event_changes.(organization_id, customer_refund_id) > customer_refunds.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_return` | `business_event_changes.(organization_id, return_id) > returns.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_return_item` | `business_event_changes.(organization_id, return_item_id) > return_items.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_retained_income` | `business_event_changes.(organization_id, retained_income_id) > retained_income.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_retained_income_allocation` | `business_event_changes.(organization_id, retained_income_allocation_id) > retained_income_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_loss` | `business_event_changes.(organization_id, loss_id) > losses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_inventory_items` | `inventory_items.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_suppliers` | `suppliers.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_purchases` | `purchases.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_purchase_items` | `purchase_items.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_supplier_payments` | `supplier_payments.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_supplier_payment_allocations` | `supplier_payment_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_supplier_refunds` | `supplier_refunds.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_purchase_expenses` | `purchase_expenses.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_acquisition_expense_allocations` | `acquisition_expense_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_sale_expenses` | `sale_expenses.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customers` | `customers.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_sales` | `sales.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_sale_items` | `sale_items.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_returns` | `returns.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customer_payments` | `customer_payments.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customer_payment_allocations` | `customer_payment_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customer_refunds` | `customer_refunds.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_retained_income` | `retained_income.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_retained_income_allocations` | `retained_income_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_losses` | `losses.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `inventory_items_first_received` | `inventory_items.(organization_id, first_received_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `inventory_items_first_sale_approval` | `inventory_items.(organization_id, first_sale_approval_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `inventory_items_removed` | `inventory_items.(organization_id, removed_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `inventory_items_cost_finalized` | `inventory_items.(organization_id, cost_finalized_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchases_expenses_confirmed` | `purchases.(organization_id, expenses_confirmed_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchases_completed` | `purchases.(organization_id, completed_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchases_canceled` | `purchases.(organization_id, canceled_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sales_dispatch` | `sales.(organization_id, dispatch_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sales_canceled` | `sales.(organization_id, canceled_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sale_items_released` | `sale_items.(organization_id, released_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `losses_reversed` | `losses.(organization_id, reversed_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customer_settlements` | `customer_settlements.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_customer_settlement_sources` | `customer_settlement_source_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_supplier_settlements` | `supplier_settlements.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_supplier_settlement_sources` | `supplier_settlement_source_allocations.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_customer` | `customer_settlements.(organization_id, customer_id) > customers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_sale` | `customer_settlements.(organization_id, customer_id, sale_id) > sales.(organization_id, customer_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_return` | `customer_settlements.(organization_id, sale_id, return_id) > returns.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_source_header` | `customer_settlement_source_allocations.(organization_id, settlement_id) > customer_settlements.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_source_payment` | `customer_settlement_source_allocations.(organization_id, source_customer_payment_allocation_id) > customer_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_source_refund` | `customer_settlement_source_allocations.(organization_id, customer_refund_id) > customer_refunds.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_source_target` | `customer_settlement_source_allocations.(organization_id, target_customer_payment_allocation_id) > customer_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_settlement_source_retention` | `customer_settlement_source_allocations.(organization_id, retained_income_id) > retained_income.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_supplier` | `supplier_settlements.(organization_id, supplier_id) > suppliers.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_purchase` | `supplier_settlements.(organization_id, supplier_id, purchase_id) > purchases.(organization_id, supplier_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_header` | `supplier_settlement_source_allocations.(organization_id, settlement_id) > supplier_settlements.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_payment` | `supplier_settlement_source_allocations.(organization_id, source_supplier_payment_allocation_id) > supplier_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_refund` | `supplier_settlement_source_allocations.(organization_id, supplier_refund_id) > supplier_refunds.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_target` | `supplier_settlement_source_allocations.(organization_id, target_supplier_payment_allocation_id) > supplier_payment_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_loss` | `supplier_settlement_source_allocations.(organization_id, loss_id) > losses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_settlement_source_prior_loss` | `supplier_settlement_source_allocations.(organization_id, related_prior_loss_id) > losses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `supplier_refund_settlement_party` | `supplier_refunds.(organization_id, supplier_id, settlement_id) > supplier_settlements.(organization_id, supplier_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `customer_refund_settlement_sale_party` | `customer_refunds.(organization_id, customer_id, sale_id, settlement_id) > customer_settlements.(organization_id, customer_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `retained_income_settlement_sale` | `retained_income.(organization_id, sale_id, settlement_id) > customer_settlements.(organization_id, sale_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customer_settlements` | `customer_settlements.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_customer_settlement_source_allocations` | `customer_settlement_source_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_supplier_settlements` | `supplier_settlements.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_supplier_settlement_source_allocations` | `supplier_settlement_source_allocations.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer_settlement_id` | `business_event_changes.(organization_id, customer_settlement_id) > customer_settlements.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_customer_settlement_source_allocation_id` | `business_event_changes.(organization_id, customer_settlement_source_allocation_id) > customer_settlement_source_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier_settlement_id` | `business_event_changes.(organization_id, supplier_settlement_id) > supplier_settlements.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_supplier_settlement_source_allocation_id` | `business_event_changes.(organization_id, supplier_settlement_source_allocation_id) > supplier_settlement_source_allocations.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_purchase_expense_payments` | `purchase_expense_payments.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `purchase_expense_payment_source` | `purchase_expense_payments.(organization_id, purchase_expense_id) > purchase_expenses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_purchase_expense_payments` | `purchase_expense_payments.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_purchase_expense_payment` | `business_event_changes.(organization_id, purchase_expense_payment_id) > purchase_expense_payments.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `owner_sale_expense_payments` | `sale_expense_payments.organization_id > organizations.id [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `sale_expense_payment_source` | `sale_expense_payments.(organization_id, sale_expense_id) > sale_expenses.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `created_sale_expense_payments` | `sale_expense_payments.(organization_id, created_event_id) > business_events.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |
| `change_sale_expense_payment` | `business_event_changes.(organization_id, sale_expense_payment_id) > sale_expense_payments.(organization_id, id) [delete: restrict]` | S05/S09: scope, target key and nullability review |

Inventory totals: **33 tables, 310 columns, 11 enums and 158 references**.

Before generation, record the owner's decisions above, finish the flagged shape
checks, update DBML/design consistently, and record the explicit workflow
deferrals or their implementation scope. Do not lift Step 3A's migration gate
merely because this inventory exists.
