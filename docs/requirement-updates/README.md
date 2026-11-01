# Requirement update logs

This folder records dated, owner-approved requirement changes and clarifications, plus their propagation into versioned documents, the schema, and backlog acceptance criteria.

[Requirements v0.8](../requirements/requirements-v0.8.md) and [entity map v0.9](../entities/entity-map-v0.9.md) consolidate every log below (2026-11-01); read those first. The logs remain the dated approval records, and a later log supersedes conflicting wording in an earlier one for the topics it covers. Unaffected requirements, Organization boundaries, and existing delivery ownership remain applicable.

## Log index

| Approval date | Record | Publication status |
| --- | --- | --- |
| 2026-11-01 | [Organization currency and nickname](../requirements/requirements-v0.8.md#16-change-record-and-requirement-continuity), recorded in the requirements v0.8 change record | One currency per Organization, BRL by default or USD, chosen once; a unique nickname identifies the catalog URL and is renamed only by a `global_admin`; invitations TBD. Published directly in requirements v0.8 (REQ-008, ORG-010–011, FIN-007) and entity map v0.9, as the owner asked; issue propagation pending. |
| 2026-10-23 (payment clarification) | [Partial expense payments and settled amounts](2026-10-23-partial-expense-payments.md) | Retains cumulative `settled_amount`, permits partial payments and preserves each installment; supersedes the preceding simplification recommendation. Applied to DBML/design guide; consolidated into requirements v0.8 (FIN-002) and entity map v0.9. |
| 2026-10-23 (follow-up) | [Indexes, rejected candidates, and expense fields](2026-10-23-dbml-indexes-and-candidates.md) | Applied to DBML/design guide; retains the approved four dedicated settlement tables. Its expense amount recommendation is superseded by the subsequent payment clarification. Consolidated into entity map v0.9. |
| 2026-10-23 | [DBML review — fields, access roles, and legacy purchases](2026-10-23-dbml-review.md) | Applied to DBML/design guide, including exclusive sale status, nullable conditions and the approved second-day import date. Consolidated into requirements v0.8 and entity map v0.9; issue propagation remains pending. |
| 2026-10-22 | [Schema review — decisions from Q1–Q61](2026-10-22-schema-review.md) | Entity map v0.8 and live issue requirements/criteria reconciled; Step 3B propagates permission/name/public/history shapes into the structural DBML/Drizzle schema. Consolidated into requirements v0.8 and ownership index v0.8 from the approved issue text; business writers remain pending. |

Dated approval logs preserve the state when recorded. This index and each later publication's change record track subsequent propagation without rewriting the original approval record.

## Propagation records

| Update date | Record | Completed scope |
| --- | --- | --- |
| 2026-11-01 | [Requirements v0.8](../requirements/requirements-v0.8.md), [entity map v0.9](../entities/entity-map-v0.9.md), [ownership index v0.8](../requirements/requirements-coverage-v0.8.md) | Consolidated baseline published. Live issue propagation of the 2026-10-23 and 2026-11-01 changes, the v0.8 tracker issue and the new E01 Organization settings issue remain pending. |
| 2026-10-22 | [Schema-review issue propagation](2026-10-22-issue-propagation.md) | All 82 project issues reviewed; 71 scope/requirements/criteria updates plus a baseline reference follow-up, with 10 issues unchanged. Live read-back, metadata, hierarchy, and ownership checks passed. |

The owner subsequently approved the [Step 3B structural schema and explicit writer deferrals](../database/step-3b-implementation-2026-10-25.md) on 2026-10-25. Its PostgreSQL evidence covers structural constraints, not completed business workflows or a newly published requirements baseline.

## Recording and applying updates

- Use a dated Markdown file for each review and record its owner, approval date, source, examples, affected references, and unresolved boundaries.
- Distinguish the owner's final decisions from rejected recommendations and implementation choices still to make. Record subsequent decisions in a new log that identifies what it supersedes.
- Preserve published historical baselines and stable requirement/entity IDs. A subsequent baseline adoption must reconcile requirements, entity relationships, accepted decisions, coverage/ownership, the schema/design guide, navigation, and affected issue acceptance criteria.
- A log records approved policy; it does not demonstrate implementation, complete propagation, or close delivery issues.
