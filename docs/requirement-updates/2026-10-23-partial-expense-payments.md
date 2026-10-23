# DBML clarification — retain settled amounts and support partial payments

**Owner:** WilliamPhilippe. **Approval date:** 2026-10-23, after the [index/candidate review](2026-10-23-dbml-indexes-and-candidates.md). **Source:** The owner rejected removing the settled amount because Purchases and Sales are often paid in parts.

**Status:** Applied to the visual DBML and design guide. No runtime implementation is delivered. This supersedes the preceding agent recommendation and full-payment-only expense checks; older published baselines remain historical.

## Decision and scope

Keep `settled_amount` as the cumulative amount paid so far, distinct from the obligation's total `amount`. Apply this clarification to the PurchaseExpense and SaleExpense fields under review: partial payments are supported, not restricted to one full payment. Ordinary Purchase/Sale merchandise payments already support multiple SupplierPayments/CustomerPayments and remain separate from expense payments.

Expense cost and cash remain distinct. AcquisitionExpenseAllocation distributes the full actual expense cost among selected units; it does not distribute or duplicate each installment. SaleExpense reduces its original Sale period's net result once, regardless of how many actual payments settle it. Each payment contributes once to cash on its own actual occurrence timestamp.

This does not introduce planned installment schedules, expense-payment batching across expenses, a general expense-management module, or refund installments. Existing single-disbursement CustomerRefund/SupplierRefund rules remain applicable.

## Reviewable schema representation

The draft models the existing E15 expense-payment responsibility with `purchase_expense_payments` and `sale_expense_payments`. Each row belongs to one same-Organization expense and preserves a positive amount, actual `paid_on` timestamp, method and shared creation event. These are supporting cash-source shapes for the approved partial-payment behavior, not resurrected rejected candidate tables or new E-IDs.

On both expense headers:

- `amount` remains the total positive expense cost in integer BRL centavos.
- `settled_amount` remains and starts at zero. It is a reconciled cache of the authoritative payment rows, never a manually editable independent balance. Enforce `0 <= settled_amount <= amount`.
- `settled_on` is NULL until fully paid, then records the actual completion payment's timestamp. Earlier installments retain their own timestamps.
- A single header method/event cannot represent several payments. Remove those single-payment fields and retain each installment's method/event on its payment source, linked to shared audit.

T01 must atomically insert/correct a payment and audit, reconcile the header total, preserve payment history, enforce Organization scope and reject overpayment under concurrent writes. Partial acquisition-expense payment does not satisfy the existing full-settlement requirement for receipt/cost finalization. Completed Purchase and finalized unit-cost protections remain in force.

## Example

For an R$100 expense:

| Action | `amount` | `settled_amount` | Remaining | `settled_on` |
| --- | --- | --- | --- | --- |
| Record expense | 10000 | 0 | 10000 | NULL |
| Pay R$30 on October 23 | 10000 | 3000 | 7000 | NULL |
| Pay R$70 on October 26 | 10000 | 10000 | 0 | October 26 payment timestamp |

The two payment sources preserve 3000/7000 centavos and their own dates/methods. Expense cost is R$100 once. Cash shows R$30 on October 23 and R$70 on October 26; the second payment does not replace the first.

## Traceability and remaining work

Keep all active/retired requirement and entity IDs unchanged. E15 now has multiple actual payment sources. Existing owners remain [PurchaseExpense #37](https://github.com/WilliamPhilippe/storage-minis-be/issues/37), [SaleExpense #52](https://github.com/WilliamPhilippe/storage-minis-be/issues/52), [receipt #38](https://github.com/WilliamPhilippe/storage-minis-be/issues/38), [cash/reporting #45](https://github.com/WilliamPhilippe/storage-minis-be/issues/45), and [schema T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21). Entry references are PUR-016, PUR-035, PUR-047–049 and FIN-001–006, FIN-009–010; primary ownership remains unchanged.

The earlier conditional restriction on additional expense-payment storage in E15/FIN-002 is superseded for this partial-payment use case. Consolidated requirements/entity-map/coverage and affected issue acceptance criteria still require later propagation. No delivery issue is closed by this record, and parser checks do not demonstrate runtime transaction or concurrency enforcement.
