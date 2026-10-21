# Technical direction — documentation and backlog review

**Review date:** 2026-10-21. **Decision record:** merged [#85](https://github.com/WilliamPhilippe/storage-minis/pull/85). **Documentation/backlog follow-up:** [#86](https://github.com/WilliamPhilippe/storage-minis/pull/86).

The owner requested a PR, a review of affected documentation, and updates to technical-constraint issues after confirming the choices in [Technical direction](technical-direction.md). This review carries those approved decisions into the existing backlog. It does not introduce a new business baseline or provide application acceptance evidence.

## Documentation review

| Documents | Result |
| --- | --- |
| [AGENTS.md](../AGENTS.md), [README](../README.md) | Record the selected stack, link the detailed decisions/review, and retain remaining design and implementation prerequisites. |
| [Technical direction](technical-direction.md) | Canonical decision record: stack, preferred Ant Design candidate, Google-only authentication, supplied administrator identity, active-use refresh, logout, BRL, UTC storage/reporting, and visitor-local timestamp display. |
| [Requirements v0.7](requirements-v0.7.md) | Add technical-follow-up references and distinguish accepted choices from remaining T02/T03 outputs; preserve every requirement ID and its source wording. |
| [Entity map v0.7](entity-map-v0.7.md) | Replace the outdated engine/ORM-neutral statement with PostgreSQL/Drizzle context, reference accepted authentication, and distinguish UTC reporting from pending business-date representation. Conceptual entities still do not mandate table boundaries. |
| [Ownership v0.7](requirements-coverage-v0.7.md) | Record accepted technical inputs and remaining T01–T06 outputs. Keep all 307 active primary owners and nine retired IDs unchanged. |
| [Model review](model-review.md) | Link the accepted technical choices while preserving structural decisions and D01–D08. |
| [PurchaseExpense impact v0.7](purchase-expense-impact-v0.7.md) | Reviewed; shared-source, selected-unit, settlement, lock, and concurrency behavior is unaffected. No change needed. |
| Requirements/entity maps v0.5/v0.6, ownership v0.6, and [global Product publication record](global-product-impact-v0.6.md) | Reviewed as historical sources; preserve their published content. The current entry points identify the technical supplement. |

## Issue review and propagation

All 79 existing issue bodies were scanned for technical constraints, including the historical baseline trackers. The 23 directly related technical, delivery, epic, and baseline issues were also read with comments; each had no comments at review time. The following 19 bodies were updated and re-read for verification. Historical baseline issues #2/#78, unrelated workflow issues, and native hierarchy/dependency links remain unchanged.

| Issues | Approved constraint or correction |
| --- | --- |
| [#14](https://github.com/WilliamPhilippe/storage-minis/issues/14) | Correct the stale 304-active-v0.7 count to 307 and reference the selected verification tools without selecting operational targets. |
| [#19](https://github.com/WilliamPhilippe/storage-minis/issues/19) | D05 report/filter design uses UTC periods; report selection and average-cost policy remain open. |
| [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21) | T01 targets PostgreSQL/Drizzle and the accepted UTC/auth context; final physical schema and constraints remain open. |
| [#22](https://github.com/WilliamPhilippe/storage-minis/issues/22) | T02 incorporates Google-only Firebase/ID tokens, supplied administrator identity, active-use refresh, no refresh while inactive, and explicit logout; incomplete session/bootstrap details stay explicit. |
| [#23](https://github.com/WilliamPhilippe/storage-minis/issues/23) | T04 takes the selected stack and independent-deployment capability as inputs; production hosting, backups, and operational targets remain undecided. |
| [#24](https://github.com/WilliamPhilippe/storage-minis/issues/24) | T03 uses BRL, UTC storage/reporting, and visitor-local timestamp display; monetary precision/rounding and business-date/filter semantics remain open. |
| [#25](https://github.com/WilliamPhilippe/storage-minis/issues/25), [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53) | Inspect/preview source timestamp and timezone ambiguity before mapping to UTC; preserve date-only semantics and never fabricate historical facts. |
| [#26](https://github.com/WilliamPhilippe/storage-minis/issues/26) | T06 implements the selected tools and defines remaining versions/layout/migrations/CI; keep T01/T02/T04 prerequisites and acceptance proofs. |
| [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) | Implement the accepted authentication/session/logout requirements with Membership enforcement and reviewed bootstrap. |
| [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28), [#54](https://github.com/WilliamPhilippe/storage-minis/issues/54) | Verify transaction rollback and concurrent constraints with Vitest against real PostgreSQL; preserve UTC timestamps/business history and tRPC error boundaries. |
| [#29](https://github.com/WilliamPhilippe/storage-minis/issues/29), [#33](https://github.com/WilliamPhilippe/storage-minis/issues/33) | Deploy the selected monorepo applications and restore PostgreSQL under the future T04 plan; local Compose is not a production-hosting decision. |
| [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45), [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) | Financial recognition/reversals and report periods use UTC consistently across viewer timezones. |
| [#73](https://github.com/WilliamPhilippe/storage-minis/issues/73), [#75](https://github.com/WilliamPhilippe/storage-minis/issues/75) | Record Playwright browser evidence and Vitest/real-PostgreSQL acceptance; include active/inactive refresh, logout, privacy, and UTC-boundary cases after their remaining designs are accepted. |
| [#82](https://github.com/WilliamPhilippe/storage-minis/issues/82) | Link the technical supplement/PR separately from the published v0.7 business-baseline snapshots. |

The remaining reviewed related issues (#1, #3, #10, and #74) need no direct amendment: their outcomes remain valid and dependent issues carry the new constraints. No issue is closed, no implementation checkbox is marked complete, and primary delivery ownership is unchanged. Ant Design remains a preference rather than a finalized dependency.

## Validation and limits

Validation passed:

- Checked local Markdown links/fragments, fences, and table columns across all 15 repository Markdown documents, plus `git diff --check`.
- Compared every requirement source line with `origin/main`: unchanged. Verified 307 active IDs with one primary owner each, the unchanged nine retired IDs, and preserved entity discussion IDs.
- Verified historical v0.5/v0.6 files and the shared PurchaseExpense impact record are unchanged.
- Re-read all 79 issue bodies after publication: exactly the planned 19 changed; the other 60, including historical baseline trackers, are unchanged. Titles, open states, assignments, labels, and milestones are unchanged.
- Compared amended issue bodies against the prepared updates and verified unchanged requirement excerpts, dependency sections, and completed-checkbox counts. Updates use issue-body edits only; no hierarchy, native prerequisite, or Project changes were requested or made.

There is no application, schema, dependency manifest, test suite, or CI workflow in this repository. These checks establish documentation/backlog consistency only. Remaining session choices, exact BRL/date rules, schema/concurrency design, T04 operational choices, and D01–D08 continue to require their existing work items.
