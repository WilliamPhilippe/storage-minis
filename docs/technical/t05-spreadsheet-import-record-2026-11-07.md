# T05 record — spreadsheet import (2026-11-07)

**Status: proposed, awaiting the owner's approval.** The owner reviewed most of
these rules one by one on 2026-11-06 and 2026-11-07. The [decision table](#decisions)
marks which parts are approved and which are still proposals, and
[Open items](#9-open-items) lists what needs an answer. This is the record that
[T05 / #25](https://github.com/WilliamPhilippe/storage-minis/issues/25) owes. It
describes the real spreadsheet, maps it to the schema, and settles the assumptions,
exception handling and reconciliation for the legacy import. IM-01 to IM-16 are
references within this record, not requirement, issue or decision IDs.

The import is delivered under
[Epic E11 / #13](https://github.com/WilliamPhilippe/storage-minis/issues/13), by
[#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) (preview) and
[#74](https://github.com/WilliamPhilippe/storage-minis/issues/74) (controlled import),
plus the sales-history issue proposed with requirements v0.9. It can only be built
once the business procedures it calls exist ([section 7](#7-what-the-import-needs-from-the-api)).

**Privacy.** The spreadsheet holds customer names and phones, supplier names and
real amounts. Neither the file nor any of its rows belongs in this public
repository. The owner keeps the full definitions, their answers and the row-level
check reports privately. This record holds rules, structure and counts only.
Per-row choices that the import needs at run time, such as which spellings name the
same person, come from a private mapping file that the owner supplies (IM-14).

## Decisions

| ID | Decision | Status |
| --- | --- | --- |
| IM-01 | A script reads one frozen copy of the spreadsheet, transforms its rows and calls the API's Organization procedures as the signed-in owner. It never writes SQL and never creates an Organization. | Approved 2026-11-06. It replaces the 2026-11-04 "in-app feature" wording. The minimum role `owner` is proposed. |
| IM-02 | The import reads typed cells only. It never reads a formula cell; it computes totals, balances and profit from Qtd, Preço, Pago, Venda, Compra and Falta Receber. | Approved 2026-11-07 |
| IM-03 | Products: brand, code and chase mark identify a Product. A chase is its own Product. A missing code becomes SKU `N/A`. Accessories are Products. Kits, sets and cases become one Product per item. | Approved 2026-11-06; the brand tie rule is proposed |
| IM-04 | Suppliers: only the owner's merges join spellings; "Outro" is the unknown Supplier; a phone inside a name moves to the phone field. | Approved 2026-11-06 and 2026-11-07; an empty supplier type is proposed |
| IM-05 | Customers: only the owner's confirmed merges join buyers; a blank buyer goes to the placeholder customer "Desconhecido". | Approved 2026-11-06 and 2026-11-07; the name cleanup is proposed |
| IM-06 | Opening Purchases: consecutive rows with the same supplier, month and status form one Purchase, dated the 2nd at 00:00 UTC. | Approved 2026-11-06; the month for sales without a purchase line is proposed |
| IM-07 | Past payments and arrivals: each line's Pago becomes a Pix payment, and arrived units are received, both with estimated, marked dates. | Approved 2026-11-06; needs the DATA-007 change in v0.9 |
| IM-08 | Costs: unit cost is Preço; acquisition expenses are "confirmed zero" for arrived units and "unknown" in transit. | Approved 2026-11-06 (DATA-011 in v0.9) |
| IM-09 | Stock: arrived, unsold units start not approved for sale; condition unknown; no collection; new `inventoryId`s. | Approved 2026-11-06 |
| IM-10 | Sales: consecutive rows with the same buyer form one Sale; payments by Pix; delivered rows are dispatched; the Tipo column is ignored. | Approved 2026-11-06 (DATA-008 in v0.9); grouping additions, equal split and unit matching are proposed |
| IM-11 | Sale dates are estimated: no earlier than the sold units' purchase month, and in row order. | Approved 2026-11-06 (DATA-009 in v0.9); time of day and cap are proposed |
| IM-12 | Estimated dates carry a mark and can be corrected after dispatch until confirmed. | Approved for sales 2026-11-06 (DATA-010 in v0.9); other dates are waiting for the owner's answer |
| IM-13 | Customer pre-orders are not imported until their scope is decided. | Approved 2026-11-06 |
| IM-14 | The preview checks every row and blocks the import until the sheet is clean; the owner's per-row choices come from a private mapping file; a journal makes reruns safe. | Preview approved (DATA-004); mapping file and journal proposed |
| IM-15 | After the import, the app must match numbers computed from the typed columns. | Required by DATA-006; computing them from typed columns approved 2026-11-07 |
| IM-16 | Synthetic test workbooks cover every edge case below and are built with the importer. | Proposed |

## 1. The spreadsheet

The spreadsheet is a Google Sheets export with three tabs. Row 1 holds headers,
row 2 holds totals, and data starts at row 3. Rows follow the order in which things
happened: only 17 of 1,010 dated purchase rows were out of order in the first copy.
The corrected copy of 2026-11-06 has 1,139 purchase lines, 249 sale rows and 26
pre-order rows, all from February 2026 onward. There is no older history.

### Compras: one row per purchase line

| Column | Meaning | Import use |
| --- | --- | --- |
| A Tipo | Compra (a released model), Pré-venda (ordered from the supplier before release), Troca (received in a trade) | Every row is a purchase line; Troca counts as Compra |
| B Marca | Brand | Product brand |
| C, D | Colors only: the owner's listings on two external collection sites | Not read |
| E Qtd | Units bought | One app unit per physical item |
| F Código | Manufacturer code | Product SKU (IM-03) |
| G Descrição | Model name | Product name (IM-03) |
| H Data Compra | Purchase month; the day was not recorded | Purchase month (IM-06) |
| I Loja | Seller | Supplier (IM-04) |
| J Preço | Unit price in reais, merchandise only, already converted from foreign currency | Unit cost (IM-08) |
| K Pago | Amount paid so far for the line, by Pix | Supplier payment (IM-07) |
| L Restante, M Total | Formulas | Not read (IM-02) |
| N Venda | Typed sum of the sale prices of the line's sold units | Preview check only; sales come from Vendas |
| O Status | Entregue (with the owner), China, Bolivia, Brasil (in Brazil, not yet delivered), USA, Vendido (every unit of the line sold) | Location (IM-09) |
| P Vendido Pre | Units promised to pre-order buyers | Not read (IM-13) |
| Q Previsão | Expected arrival month | Import evidence and a preview check only |

The totals row, the per-store summary in columns S and T, the charts and the
colors are not read either.

### Vendas: one row per sale line

| Column | Meaning | Import use |
| --- | --- | --- |
| A Tipo | Venda, Rifa (raffle), Troca | Ignored: every row is a plain sale |
| B–E | Brand, quantity, code, name | Identify the sold units (IM-10) |
| F Compra | Unit cost copied from Compras; 1 means the unit was free | Unit matching only; a free unit costs R$0 |
| G Pago Total, I Lucro, J Lucro % | Formulas | Not read (IM-02) |
| H Venda | Agreed amount for the row's units | Agreed prices (IM-10) |
| K Falta Receber | What the buyer still owes | Paid amount = Venda − Falta Receber |
| L Comprador | Buyer, sometimes with a phone or a state code | Customer (IM-05) |
| M Telefone | Buyer's phone | Customer phone |
| N Status | Entregue (delivered to the buyer), Garagem (sold, still with the owner) | Dispatch (IM-10) |

The tab has no date column; IM-11 estimates one.

### Pré-Vendas: customer pre-orders

Each row holds the agreed unit price, the deposit paid, the balance, the buyer and
phone, which of the owner's two WhatsApp numbers the buyer uses, and the unit's
current location. It is not imported (IM-13).

## 2. Products (IM-03)

- **Identity.** Within the spreadsheet, the same brand, code and chase mark make
  one Product. When one code appears with different names, the longest name wins.
  *Proposed:* a code that appears under two brands takes the more frequent one.
  Production has no Products yet, so this first import registers every Product, and
  reusing another Organization's Product (DATA-003, DATA-004) does not arise.
- **Chase.** A code ending in `-CHASE`, or "CHASE" in the name, marks the chase
  version. The Product keeps the code without `-CHASE` and the name without
  "CHASE", and carries the chase mark, which only changes how it is shown. A chase
  and its regular model are two Products.
- **Missing code.** The SKU becomes `N/A`; brand and name then identify the
  Product.
- **Cleanup.** A trailing " N" carries no meaning and is dropped. "LTD" and "BLK"
  belong in the name, not the code. A Trends Hobby code keeps its variant letter.
  Tabs and repeated spaces are removed.
- **Accessories.** Racks, figures, plates, tents and trailers are Products.
- **Kits, sets and cases.** Each item becomes its own Product and unit. A purchase
  row that lists the item codes splits automatically. A sold kit's Vendas row lists
  the same codes, and its amount is split equally across the items.
- **Not imported:** photos, descriptions and public fields.

## 3. Suppliers and customers (IM-04, IM-05)

**Suppliers**

- The owner's merge list joins spellings of one seller. Names the owner did not
  pair are different suppliers, even when they share a first name.
- "Outro" is the Organization's unknown Supplier.
- A phone number inside a name moves to the phone field. Phone and type are
  optional since PR #139. *Proposed:* the type stays empty.
- Events, marketplaces and stores keep the names the sheet gives them.

**Customers**

- Only the owner's confirmed merges join buyers. Names the owner did not pair are
  different people, even when their cleaned names match; the phone then tells them
  apart.
- *Proposed cleanup:*
  - A full phone number moves to the phone field.
  - A digit fragment moves to the notes.
  - A trailing state code moves to the region field.
  - Everything else stays in the name, including "Colecionador", because it tells
    some different people apart.
- A blank buyer goes to one placeholder customer named "Desconhecido". Customers
  have no placeholder flag yet ([Open items](#9-open-items)).
- Events, companies and raffle labels are customers named as in the sheet.

## 4. Purchases, payments and arrivals (IM-06, IM-07)

- **Grouping.** Consecutive Compras rows with the same supplier, month and status
  form one opening Purchase, and Vendido counts as Entregue. Rows that are not next
  to each other are separate Purchases, so one supplier can have several Purchases
  in a month. PR #139 removed the index that allowed only one. The corrected copy
  gives 372 Purchases, 231 of them with a single line.
- **Date.** The 2nd of the month at 00:00 UTC, with the real month stored separately
  (DATA-007). Midnight UTC on the 1st is still the previous day in Brazil, so the 2nd
  keeps the purchase in its month.
- **Lines.** One Purchase line per Product (kits split), with quantity Qtd and a
  merchandise total of Qtd × Preço. A lot recorded as one amount over several single
  rows is split exactly across its units by the app's largest-remainder rule.
- **Free items** cost R$0.
- **Sales with no purchase line** get one opening Purchase from the unknown
  Supplier, each unit costed at its Vendas Compra. *Proposed:* it is dated in the
  month estimated for their first sale.
- **Payments.** Each line's Pago becomes one Pix payment. It is dated at its
  Purchase's timestamp, marked as estimated, and funds the line's units in order.
- **Arrivals.** Units the sheet shows as arrived (Entregue, or sold) are received
  at that same timestamp, marked as estimated.
- Nothing is created for a payment or an arrival that the sheet does not record.
  This replaces DATA-007's "no payments or receipts are fabricated" through the
  change proposed in v0.9.

## 5. Costs and stock (IM-08, IM-09)

- **Unit cost** is Preço, split exactly for lots and kits.
- **Acquisition expenses** (freight, forwarding, taxes) were never recorded.
  Arrived units get expense completeness "confirmed zero". Units still in transit
  stay "unknown", so freight paid on arrival can still be recorded (DATA-011 in
  v0.9).
- **Location.** Entregue becomes `received`; China, Bolivia, Brasil and USA become
  `china`, `bolivia`, `brasil` and `eua`. The `mexico` location exists since PR
  #139. Sold units take their state from Vendas.
- **Approval.** Arrived, unsold units start not approved for sale. They stay out of
  the public catalog until the owner approves them, after marking the personal
  collection by hand.
- **Unknowns.** Condition (sealed, damaged) stays unknown, nothing is in the
  collection, and there are no asking prices. The app assigns new `inventoryId`s;
  the sheet has no unit IDs.

## 6. Sales and their dates (IM-10, IM-11, IM-12)

**Sales (IM-10)**

- **Grouping.** Consecutive Vendas rows with the same buyer form one Sale.
  *Proposed:* the rows must also share a status, because a Sale is dispatched as a
  whole, and blank-buyer rows never combine. The corrected copy gives 153 Sales
  from 249 rows.
- **Lines.** One sale line per unit. *Proposed:* a row's Venda is split equally
  and exactly across its units.
- **Unit matching.** *Proposed:* among purchase units with the same code, or the
  same brand and name when the row has no code, the import picks in this order:
  1. the same cost (Vendas Compra = Compras Preço);
  2. a line already marked sold;
  3. the oldest month;
  4. the lowest row.
- **Before each sale,** the unit is approved and its cost locked, as the business
  writers require.
- **Payment.** Venda − Falta Receber becomes one Pix payment. It is dated with the
  sale, marked as estimated, and allocated to the sale's lines in order. Falta
  Receber stays as debt.
- **Dispatch.** Rows with status Entregue are dispatched on the sale date, marked
  as estimated. Garagem rows are not dispatched.

**Sale-date estimate (IM-11)**

1. Walk the sales in row order.
2. A sale's floor is the latest purchase month of the units it sold.
3. Its month is the later of its floor and the previous sale's month. A sale
   without a known purchase month takes the previous sale's month. The first sale
   starts at the earliest purchase month.
4. *Proposed:* the date is the 15th at 12:00 UTC, but never after the import
   moment. The import runs at or after 00:00 UTC on the 2nd of its month, because
   opening Purchases are pinned to the 2nd.

On the corrected copy, the 153 sales fall between February and October 2026, most
of them in August and September. The estimate leans early, since each sale lands
in the earliest month the data allows.

**Estimated-date mark and correction (IM-12)**

- Every date the import estimates carries an "estimated" mark.
- While the mark is there, an authorized user can correct the date, even after
  dispatch. The correction changes only that date, is audited, and recalculates the
  affected report periods. A corrected date counts as confirmed, and the normal
  locks apply from then on.
- The owner approved this for sale dates on 2026-11-06. Applying it to payment,
  arrival and dispatch dates waits for the owner's explicit answer in the v0.9
  review.
- The mark needs a schema change that the import plan will propose.

## 7. What the import needs from the API

The import calls these procedures. The business features build most of them; the
estimated variants and the opening Purchase are needed only by the import.
Designing the ordinary procedures with these variants in mind avoids reworking
them later.

| Area | Procedure |
| --- | --- |
| Products | Register a global Product (brand, SKU, name, chase mark) |
| Suppliers | Create a Supplier; find the Organization's unknown Supplier |
| Purchases | Register an opening Purchase with its month, evidence, lines and units |
| Supplier payments | Record a payment with its method and an estimated-date mark, allocated to units |
| Arrivals | Receive units with an estimated-date mark |
| Costs | Confirm zero acquisition expenses; first sale approval with cost finalization |
| Customers | Create a Customer; find the placeholder customer |
| Sales | Create a Sale with an estimated date, lines and agreed prices; record customer payments and dispatch with estimated-date marks |
| After the import | Correct an estimated date (DATA-010); read back the totals that reconciliation needs |

## 8. Running the import (IM-14, IM-15)

- **Order.** Deploy, the owner's first sign-in
  ([AU-07](t02-authentication-record-2026-11-03.md#au-07-administrator-bootstrap)),
  then the import, as decided on 2026-11-04.
- **Preview.** It writes nothing and lists every problem with its row number. The
  import refuses to write until the list is empty. It checks for:
  - lines marked arrived but not fully paid, or paid above their total;
  - lines without a brand or a month;
  - lots recorded without their items, and kits, sets or cases whose items are not
    listed;
  - a code and a name in the same cell;
  - Compras and Vendas disagreeing on sold units, status or the Venda column;
  - a sale whose purchase lines are all still in transit;
  - a sale cost that matches no purchase price for its model;
  - suspicious codes (one to three digits, a single letter, a `#`) and mixed
    Trends Hobby code formats;
  - pre-order counts that disagree with Pré-Vendas;
  - dates typed as text, and a purchase month later than its Previsão;
  - regular purchases in transit that are unpaid or part paid (a warning only).

  On the corrected copy of 2026-11-06, 38 such items remain for the owner to fix.
- **Private mapping file.** *Proposed:* the owner's per-row choices, such as which
  spellings are one person, live in a file the owner keeps and passes to the script.
  The repository never holds it.
- **Rerun safety.** *Proposed:* the script keeps a journal of what it created for
  each tab and row of the frozen copy. After a failure, the next run skips what the
  journal lists. No database index guards this since PR #139.
- **Reconciliation (IM-15).** After the import, the app must match these numbers,
  all computed from typed columns:
  - units by location and by model;
  - total merchandise cost: the sum of Qtd × Preço, plus the units added for sales
    with no purchase line;
  - the number of sales, their units and their revenue (the sum of Venda);
  - profit: the sum of Venda minus the cost of each sold unit, with free units at
    R$0;
  - customer debt (the sum of Falta Receber) and supplier debt (the sum of
    Qtd × Preço − Pago).

## 9. Open items

- **Proposals awaiting the owner's explicit approval:**
  - the minimum role `owner` (IM-01);
  - the brand tie rule (IM-03);
  - the empty supplier type (IM-04);
  - the customer name cleanup (IM-05);
  - the month for sales without a purchase line (IM-06);
  - the grouping additions, equal split and unit matching (IM-10);
  - the time of day and the cap (IM-11);
  - the private mapping file and the journal (IM-14);
  - the test workbooks (IM-16).
- **Correcting estimated dates other than sale dates** (IM-12), asked in the v0.9
  review.
- **The owner's sheet fixes** before the final copy: the remaining kits, sets and
  lots to itemize, one Vendas code cell, and the values to check.
- **Schema, for the import plan:** the estimated-date mark, and a placeholder flag
  for the "Desconhecido" customer.
- **Customer pre-orders and sale categories,** in a separate proposal.

### Test workbooks (IM-16)

Synthetic workbooks, built once the import's Excel reader is chosen, cover:

- month-only and exact-day dates, and a line without a month;
- a missing code; a chase with its regular model; a chase marked only in the name;
- one code with two spellings of its name, and one code under two brands;
- a kit row listing two codes, and a lot paid as one amount across many rows;
- a free unit;
- one supplier with several Purchases in a month: rows apart, a status change
  between rows, and Vendido next to Entregue;
- a partly paid pre-order in transit, and an unpaid regular purchase in transit;
- a line marked arrived but not fully paid, and one paid above its total;
- a multi-unit line partly sold, and a sale with no purchase line;
- consecutive rows of one buyer, the same buyer with two statuses, and blank buyers;
- a buyer name with a phone and a state, and two people whose cleaned names match;
- a sale that raises the estimated month, and an estimate capped at the import moment;
- customer debt on a Garagem sale;
- pre-order rows, which the import ignores;
- formula cells holding wrong values, which the import never reads.

## 10. Impact on approved documents and issues

- **Technical direction.** The 2026-11-04 answer "an in-app feature in the active
  Organization" becomes "a script that calls the API's Organization procedures"
  (IM-01). Its approval entry is added to technical direction once the owner
  approves this record.
- **Requirements v0.9** (proposed, not yet published): DATA-007 changes, and
  DATA-008 (sales history), DATA-009 (estimated sale dates), DATA-010 (correcting
  estimated dates) and DATA-011 (unknown past acquisition expenses) are new. The
  proposed owners are a new E11 issue for DATA-008 to DATA-010, and #53 for
  DATA-011.
- **[PR #139](https://github.com/WilliamPhilippe/storage-minis/pull/139)** (merged):
  the `mexico` location, optional Supplier phone and type, and no index limiting
  opening Purchases per supplier and month.
- **[T05 / #25](https://github.com/WilliamPhilippe/storage-minis/issues/25).** This
  record covers the inspection of the real spreadsheet, the opening records, the
  reviewed assumptions, the field map, product matching, the preview and exception
  handling, and the reconciliation. The test workbooks wait for the importer.
- **#53 and #74.** Their acceptance criteria take these rules when v0.9 is
  propagated to the issues.
- **The design guide's Import row** stays as PR #139 left it.

## Sources

- [Requirements v0.8, spreadsheet migration](../requirements/requirements-v0.8.md#spreadsheet-migration)
  (DATA-001 to DATA-007).
- [Entity map v0.9, conditional supporting records](../entities/entity-map-v0.9.md#102-conditional-supporting-records)
  (E39 to E41).
- [Database design guide, business writer obligations](../database/design.md#business-writer-obligations).
- [Technical direction, T02 record and sign-in plan approval](technical-direction.md#t02-record-and-sign-in-plan-approval-2026-11-04),
  for the 2026-11-04 import answer.
- [T02's record](t02-authentication-record-2026-11-03.md), AU-07 and AU-08.
- [PR #139](https://github.com/WilliamPhilippe/storage-minis/pull/139) and issues
  [#13](https://github.com/WilliamPhilippe/storage-minis/issues/13),
  [#25](https://github.com/WilliamPhilippe/storage-minis/issues/25),
  [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) and
  [#74](https://github.com/WilliamPhilippe/storage-minis/issues/74).
- The owner's spreadsheet, inspected in two copies on 2026-11-06, and the owner's
  answers in that review. Both stay private.
