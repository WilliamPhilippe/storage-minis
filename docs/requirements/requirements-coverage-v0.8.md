# storage-minis v0.8 — requirement ownership and backlog

**Version:** 0.8. **Published:** 2026-11-01.

**Current baseline:** requirements v0.8, tracked by a v0.8 tracker issue created with this publication. [Specification](requirements-v0.8.md) · [Entity map](../entities/entity-map-v0.9.md) · [PurchaseExpense impact](purchase-expense-impact-v0.7.md).

**Supersedes:** [v0.7 ownership index](requirements-coverage-v0.7.md). Historical documents and baseline issues are preserved.

Every active requirement has one primary delivery owner. Other tickets may share requirements as integration constraints. Ownership is planning traceability; application acceptance evidence remains pending.

**Inventory:** 309 active IDs; 13 epics; 49 delivery issues plus the new Organization settings issue; eight design issues, five of them open; eight open business decisions. Existing work identities, statuses, milestones and dependencies are preserved in [Project 2](https://github.com/users/WilliamPhilippe/projects/2).

ORG-010–011 are new in v0.8. Their primary owner is a new delivery issue under [Epic E01 / #3](https://github.com/WilliamPhilippe/storage-minis/issues/3) for Organization settings: the nickname and the currency, both set when an Organization is created. It links to [D04 / #18](https://github.com/WilliamPhilippe/storage-minis/issues/18) and [Epic E10 / #12](https://github.com/WilliamPhilippe/storage-minis/issues/12) for the catalog URL and price symbol. No other primary owner changes. The baseline is a reference item, not completed implementation.

## Active requirement ownership

| Requirement | Primary delivery owner |
| --- | --- |
| `ORG-001` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-002` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-003` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-004` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-005` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-008` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-009` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `ORG-010` | New E01 issue, created with this publication — Organization settings: nickname and currency |
| `ORG-011` | New E01 issue, created with this publication — Organization settings: nickname and currency |
| `TECH-001` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `REQ-004` | [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) — Establish administrator access and isolated organization-scoped records |
| `REQ-001` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-002` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-003` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-006` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-007` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-008` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-010` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-011` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `REQ-012` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `TECH-005` | [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28) — Implement atomic dated business operations with preserved audit history |
| `TECH-006` | [#54](https://github.com/WilliamPhilippe/storage-minis/issues/54) — Enforce concurrent item commitments and allocation integrity |
| `INV-025` | [#54](https://github.com/WilliamPhilippe/storage-minis/issues/54) — Enforce concurrent item commitments and allocation integrity |
| `SAL-019` | [#54](https://github.com/WilliamPhilippe/storage-minis/issues/54) — Enforce concurrent item commitments and allocation integrity |
| `PRO-001` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-002` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-003` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-004` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-005` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-006` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-007` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-008` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-009` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-010` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `INV-002` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-003` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-004` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-005` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-006` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-007` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-008` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-009` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-010` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-012` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-013` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-014` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-015` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-016` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-026` | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) — Inspect individual Item identity, condition, asking price, and complete history |
| `INV-017` | [#41](https://github.com/WilliamPhilippe/storage-minis/issues/41) — Approve received units for sale and finalize their acquisition costs |
| `INV-018` | [#41](https://github.com/WilliamPhilippe/storage-minis/issues/41) — Approve received units for sale and finalize their acquisition costs |
| `INV-019` | [#41](https://github.com/WilliamPhilippe/storage-minis/issues/41) — Approve received units for sale and finalize their acquisition costs |
| `INV-030` | [#41](https://github.com/WilliamPhilippe/storage-minis/issues/41) — Approve received units for sale and finalize their acquisition costs |
| `PUR-040` | [#41](https://github.com/WilliamPhilippe/storage-minis/issues/41) — Approve received units for sale and finalize their acquisition costs |
| `INV-022` | [#46](https://github.com/WilliamPhilippe/storage-minis/issues/46) — Hold and release owned units for appreciation |
| `INV-023` | [#46](https://github.com/WilliamPhilippe/storage-minis/issues/46) — Hold and release owned units for appreciation |
| `PRO-011` | [#42](https://github.com/WilliamPhilippe/storage-minis/issues/42) — Show distinct ordered, on-hand, available, committed, and disposed quantities |
| `INV-029` | [#42](https://github.com/WilliamPhilippe/storage-minis/issues/42) — Show distinct ordered, on-hand, available, committed, and disposed quantities |
| `CALC-005` | [#42](https://github.com/WilliamPhilippe/storage-minis/issues/42) — Show distinct ordered, on-hand, available, committed, and disposed quantities |
| `SUP-001` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-002` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-003` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-004` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-005` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-006` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-007` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `SUP-008` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `PUR-001` | [#31](https://github.com/WilliamPhilippe/storage-minis/issues/31) — Maintain Suppliers and their Purchase history |
| `PUR-002` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-003` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-004` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-005` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-006` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-007` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-008` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `INV-001` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `REQ-009` | [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) — Register bulk Purchases and assign permanent Item IDs at order time |
| `PUR-009` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-010` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-011` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-015` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-034` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-035` | [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38) — Receive selected fully funded units while leaving other order units outstanding |
| `PUR-036` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `PUR-037` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `PUR-038` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `PUR-039` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `PUR-046` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `INV-031` | [#39](https://github.com/WilliamPhilippe/storage-minis/issues/39) — Edit Open Purchases and soft-delete only eligible ordered units |
| `PUR-012` | [#43](https://github.com/WilliamPhilippe/storage-minis/issues/43) — Complete fully received Purchases and lock ordinary edits |
| `PUR-013` | [#43](https://github.com/WilliamPhilippe/storage-minis/issues/43) — Complete fully received Purchases and lock ordinary edits |
| `PUR-014` | [#43](https://github.com/WilliamPhilippe/storage-minis/issues/43) — Complete fully received Purchases and lock ordinary edits |
| `PUR-041` | [#43](https://github.com/WilliamPhilippe/storage-minis/issues/43) — Complete fully received Purchases and lock ordinary edits |
| `PUR-028` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-029` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-030` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-031` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-032` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-033` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `PUR-045` | [#50](https://github.com/WilliamPhilippe/storage-minis/issues/50) — Cancel entirely unreceived Purchases with reconciled supplier settlement |
| `SUP-010` | [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36) — Allocate supplier payments across specific units and Purchases |
| `SUP-011` | [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36) — Allocate supplier payments across specific units and Purchases |
| `PUR-042` | [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36) — Allocate supplier payments across specific units and Purchases |
| `PUR-043` | [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36) — Allocate supplier payments across specific units and Purchases |
| `PUR-044` | [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36) — Allocate supplier payments across specific units and Purchases |
| `PUR-016` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-017` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-018` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-019` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-020` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-021` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `FIN-001` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-022` | [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) — Derive unit landed costs and distinguish unknown, zero, and finalized costs |
| `PUR-023` | [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) — Derive unit landed costs and distinguish unknown, zero, and finalized costs |
| `PUR-024` | [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) — Derive unit landed costs and distinguish unknown, zero, and finalized costs |
| `INV-011` | [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) — Derive unit landed costs and distinguish unknown, zero, and finalized costs |
| `CALC-009` | [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) — Derive unit landed costs and distinguish unknown, zero, and finalized costs |
| `SUP-009` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `SUP-012` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `PUR-025` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `PUR-026` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `PUR-027` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `CALC-004` | [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) — Derive Supplier balances, refunds, and settlement obligations without credit |
| `SAL-001` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-002` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-003` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-004` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-005` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-006` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-007` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-008` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-013` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-014` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-015` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-016` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-018` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-024` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-025` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-043` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `REQ-005` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `INV-020` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `INV-021` | [#47](https://github.com/WilliamPhilippe/storage-minis/issues/47) — Create Customer Sales for specific eligible Item IDs and book profit immediately |
| `SAL-017` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `SAL-020` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `SAL-044` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `SAL-045` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `SAL-046` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `PAY-015` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `PAY-016` | [#55](https://github.com/WilliamPhilippe/storage-minis/issues/55) — Derive Reserved and In Garage status from outstanding balance |
| `SAL-009` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-036` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-037` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-048` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-049` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-050` | [#57](https://github.com/WilliamPhilippe/storage-minis/issues/57) — Record explicit dispatch with optional nonunique tracking |
| `SAL-010` | [#60](https://github.com/WilliamPhilippe/storage-minis/issues/60) — Inspect Sale status, agreed prices, and dated activity history |
| `SAL-027` | [#60](https://github.com/WilliamPhilippe/storage-minis/issues/60) — Inspect Sale status, agreed prices, and dated activity history |
| `SAL-028` | [#60](https://github.com/WilliamPhilippe/storage-minis/issues/60) — Inspect Sale status, agreed prices, and dated activity history |
| `CUS-001` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-002` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-003` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-004` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-005` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-008` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `CUS-013` | [#32](https://github.com/WilliamPhilippe/storage-minis/issues/32) — Maintain private Customer records and transaction relationships |
| `PAY-001` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-002` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-003` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-004` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-005` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-006` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-007` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-008` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-009` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-010` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-011` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-012` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-019` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-030` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `CUS-009` | [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51) — Record merchandise-only Payments and allocate them to Customer Sales |
| `PAY-013` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `PAY-014` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `PAY-017` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `PAY-018` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `PAY-020` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `PAY-036` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-006` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-007` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-010` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-011` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-012` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-014` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CUS-015` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `CALC-003` | [#56](https://github.com/WilliamPhilippe/storage-minis/issues/56) — Show Customer Debt, refund obligations, and auditable account histories |
| `SAL-038` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `SAL-039` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `SAL-040` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `SAL-041` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `SAL-042` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `INV-027` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `PAY-032` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `PAY-035` | [#62](https://github.com/WilliamPhilippe/storage-minis/issues/62) — Edit unshipped Sale items and prices with atomic funding reconciliation |
| `SAL-011` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `SAL-012` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `SAL-021` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `SAL-022` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `SAL-023` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `SAL-047` | [#63](https://github.com/WilliamPhilippe/storage-minis/issues/63) — Cancel unshipped Sales and release only eligible stock |
| `PAY-021` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-022` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-023` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-024` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-025` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-026` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-027` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-028` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-029` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-033` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PAY-034` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `FIN-012` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `RET-001` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-002` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-004` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-005` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-006` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-007` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-008` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-009` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-010` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-011` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-013` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `INV-028` | [#64](https://github.com/WilliamPhilippe/storage-minis/issues/64) — Receive full physical Returns and support resale under the same Item IDs |
| `RET-003` | [#65](https://github.com/WilliamPhilippe/storage-minis/issues/65) — Process partial Returns of multi-item Sales with reconciled allocations |
| `RET-012` | [#65](https://github.com/WilliamPhilippe/storage-minis/issues/65) — Process partial Returns of multi-item Sales with reconciled allocations |
| `FIN-002` | [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) — Record Sale-level selling expenses and preserve shipping scope boundaries |
| `FIN-003` | [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) — Record Sale-level selling expenses and preserve shipping scope boundaries |
| `FIN-004` | [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) — Record Sale-level selling expenses and preserve shipping scope boundaries |
| `FIN-009` | [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) — Record Sale-level selling expenses and preserve shipping scope boundaries |
| `SAL-026` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `FIN-005` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `FIN-006` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `FIN-007` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `FIN-010` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `FIN-011` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `CALC-006` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `CALC-015` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `CALC-016` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `CALC-017` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `CALC-018` | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) — Recognize and reverse dated financial facts independently of customer payment |
| `LOS-001` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-002` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-003` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-004` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-005` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-006` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-007` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `LOS-008` | [#48](https://github.com/WilliamPhilippe/storage-minis/issues/48) — Register explicit Losses, dated reversals, and linked ordinary refunds once |
| `FIN-008` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-001` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-002` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-008` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-010` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-011` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-012` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-013` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `CALC-014` | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) — Deliver approved source-derived inventory, debt, cost, and profit reports |
| `COL-001` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-002` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-003` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-004` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-005` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-006` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-007` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-008` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-009` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-016` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `INV-024` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) — Designate individual collection units and preserve designation changes |
| `COL-010` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-012` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-013` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-014` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-015` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-017` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-018` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-020` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `CALC-007` | [#68](https://github.com/WilliamPhilippe/storage-minis/issues/68) — Calculate per-model collection recovery using booked gross profit |
| `COL-011` | [#70](https://github.com/WilliamPhilippe/storage-minis/issues/70) — Calculate pooled whole-collection recovery independently of model totals |
| `COL-019` | [#70](https://github.com/WilliamPhilippe/storage-minis/issues/70) — Calculate pooled whole-collection recovery independently of model totals |
| `ORG-006` | [#66](https://github.com/WilliamPhilippe/storage-minis/issues/66) — Publish only approved effectively Available stock in the public catalog |
| `ORG-007` | [#66](https://github.com/WilliamPhilippe/storage-minis/issues/66) — Publish only approved effectively Available stock in the public catalog |
| `DATA-001` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-002` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-003` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-004` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-005` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-007` | [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) — Build a validated Excel import preview using approved field and acquisition mapping |
| `DATA-006` | [#74](https://github.com/WilliamPhilippe/storage-minis/issues/74) — Execute a controlled import and reconcile source inventory before cutover |
| `TECH-002` | [#29](https://github.com/WilliamPhilippe/storage-minis/issues/29) — Deploy the application through the approved repeatable hosting process |
| `BACKUP-001` | [#33](https://github.com/WilliamPhilippe/storage-minis/issues/33) — Create daily backups and demonstrate restoration within approved targets |
| `BACKUP-002` | [#33](https://github.com/WilliamPhilippe/storage-minis/issues/33) — Create daily backups and demonstrate restoration within approved targets |
| `TECH-003` | [#33](https://github.com/WilliamPhilippe/storage-minis/issues/33) — Create daily backups and demonstrate restoration within approved targets |
| `TECH-004` | [#73](https://github.com/WilliamPhilippe/storage-minis/issues/73) — Verify supported browsers, devices, performance, and recovery behavior |
| `PRO-012` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PRO-013` | [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30) — Maintain Product identity, required fields, and public/private information |
| `PAY-037` | [#61](https://github.com/WilliamPhilippe/storage-minis/issues/61) — Reassign released Payment funding to existing eligible Sales without new cash |
| `PAY-038` | [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58) — Settle adjustments with refunds, funding reassignments, and retained income |
| `PUR-047` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-048` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |
| `PUR-049` | [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) — Record shared PurchaseExpenses and allocate exact costs to selected units |

## Retired IDs

| IDs | Retired in | Disposition |
| --- | --- | --- |
| SAL-029–035 | v0.5 | Separate readiness confirmation withdrawn; zero-balance unshipped Sales become In Garage automatically. |
| PAY-031 | v0.6 | Future-Sale credit application withdrawn; PAY-037 covers reassignment to eligible existing Sales/SaleItems. |
| CUS-016 | v0.6 | Future-Sale customer wallet withdrawn; refund/reassign, with PAY-038 for pending refund obligations. |

No IDs newly retired in v0.8. IDs are never reused.

## Open decisions

| Decision | Issue | Status in v0.8 |
| --- | --- | --- |
| D01 | [#15](https://github.com/WilliamPhilippe/storage-minis/issues/15) — Specify FIFO refund provenance and remaining funding-attribution details | Refunds consume original Payments oldest first. Equal-time tie-breaking and non-refund source order remain. |
| D02 | [#16](https://github.com/WilliamPhilippe/storage-minis/issues/16) — Record current-membership collection reporting and retained audit scope | Decided: current membership; no past-date designation report. Propagation remains. |
| D03 | [#17](https://github.com/WilliamPhilippe/storage-minis/issues/17) — Record signed-profit treatment in model and pooled collection recovery | Decided: signed negative profit in both formulas. Verification remains. |
| D04 | [#18](https://github.com/WilliamPhilippe/storage-minis/issues/18) — Define launch public catalog fields, images, search, and filters | One Organization per URL by nickname, allowlist, grouping, prices with the currency symbol, photos and hidden quantities decided. Search, filters, unknown-condition presentation, `is_chase` and damage-description visibility, and nickname rules remain. |
| D05 | [#19](https://github.com/WilliamPhilippe/storage-minis/issues/19) — Define launch reports and the average acquisition-price aggregation basis | Original-period reporting and the on-hand average basis decided. Launch report set and filter contracts remain. |
| D06 | [#20](https://github.com/WilliamPhilippe/storage-minis/issues/20) — Define exceptional correction authority and financial treatment | Firm locks and SaleItem deletion rules decided. Exceptional authority and shared-expense disposition remain. |
| D07 | [#79](https://github.com/WilliamPhilippe/storage-minis/issues/79) — Record shared Product-edit authority, audit, and current metadata presentation | Decided. Typed audit, enforcement and bootstrap details remain. |
| D08 | [#80](https://github.com/WilliamPhilippe/storage-minis/issues/80) — Specify independent collection cost finalization and provisional metrics | Decided. Workflow and enforcement remain. |
| Organization creation | None yet | Invitations and creating Organizations beyond the bootstrap are TBD until the website is developed (owner, 2026-11-01). |

The approved logs resolved or narrowed D01–D08; each issue stays open until its remaining outputs and propagation are complete.

## Dependency and implementation boundaries

Existing native parent and prerequisite links are unchanged; the new Organization settings issue adds one parent link to E01. The working hierarchy remains Epic → business workflow issue → optional implementation sub-issue. Shared PurchaseExpense support extends existing #37 and dependent receipt/cost/completion/reporting work. The owner selected PostgreSQL with Drizzle and the application stack in [Technical direction](../technical/technical-direction.md); physical schema design remains open. Payment batching, a Shipment entity, and event sourcing are not prescribed.

## Technical decision follow-up

The technical choices supplement the business baseline without changing its requirement IDs or primary delivery owners. See the [technical documentation/backlog review](https://github.com/WilliamPhilippe/storage-minis/blob/8629f22ef9a9ca8ad694b98eaf8f976cbfd467f8/docs/technical/technical-direction-review.md) for propagation and verification.

| Design task | Accepted inputs | Remaining outputs |
| --- | --- | --- |
| T01 / #21 | PostgreSQL with Drizzle; global Product/private operations; UTC timestamps/reporting | Final schema, state transitions, constraints, and transaction/concurrency design. |
| T02 / #22 | Google-only Firebase, ID tokens, configured owner administrator, active-use refresh, no inactive refresh, logout; User and Membership roles (2026-10-23); on-demand token refresh from user activity and a 7-day session limit from the last Google sign-in (2026-11-01) | Bootstrap, persistence, logout scope/revocation, recovery, and role capabilities, in its own record before the frontend sign-in step. |
| T03 / #24 | Integer cents of each Organization's currency; exact largest-remainder allocation; UTC occurrence timestamps and financial reporting; visitor-local timestamp display | Numeric widths, overflow handling, input contracts, and period-filter contracts. |
| T04 / #23 | One monorepo, independent application deployments, local PostgreSQL via Compose, selected test tools | Production hosting, release/configuration process, backups/restore, and measurable support/performance/recovery targets. |
| T05 / #25 | UTC target timestamps/reporting | Inspect the actual source, preview ambiguous dates/timezones, and approve legacy acquisition mapping. |
| T06 / #26 | Node/Fastify/tRPC/Zod; React/Vite/TanStack Router/Query/TanStack Form (replacing React Hook Form on 2026-11-01) with Ant Design 6; pnpm/Turborepo; Drizzle/PostgreSQL; Vitest/Playwright | Versions, layout, migrations, CI/setup commands, and persistence acceptance evidence after existing prerequisites. |
