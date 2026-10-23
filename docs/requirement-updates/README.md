# Requirement update logs

This folder records dated, owner-approved requirement changes and clarifications, plus their propagation into versioned documents, the schema, and backlog acceptance criteria.

Read these logs alongside the [published requirements v0.7](../requirements-v0.7.md) and [current entity map v0.8](../entity-map-v0.8.md). Explicit approved changes in a log supersede conflicting wording for the topics it covers. Unaffected requirements, Organization boundaries, and existing delivery ownership remain applicable.

## Log index

| Approval date | Record | Publication status |
| --- | --- | --- |
| 2026-10-23 (payment clarification) | [Partial expense payments and settled amounts](2026-10-23-partial-expense-payments.md) | Retains cumulative `settled_amount`, permits partial payments and preserves each installment; supersedes the preceding simplification recommendation. Applied to DBML/design guide. |
| 2026-10-23 (follow-up) | [Indexes, rejected candidates, and expense fields](2026-10-23-dbml-indexes-and-candidates.md) | Applied to DBML/design guide; retains the approved four dedicated settlement tables. Its expense amount recommendation is superseded by the subsequent payment clarification. |
| 2026-10-23 | [DBML review — fields, access roles, and legacy purchases](2026-10-23-dbml-review.md) | Applied to DBML/design guide, including exclusive sale status, nullable conditions and the approved second-day import date; consolidated baseline/backlog propagation remains pending. |
| 2026-10-22 | [Schema review — decisions from Q1–Q61](2026-10-22-schema-review.md) | Entity map v0.8 and live issue requirements/criteria reconciled; consolidated requirements/coverage and DBML/design guide remain pending. |

Dated approval logs preserve the state when recorded. This index and each later publication's change record track subsequent propagation without rewriting the original approval record.

## Propagation records

| Update date | Record | Completed scope |
| --- | --- | --- |
| 2026-10-22 | [Schema-review issue propagation](2026-10-22-issue-propagation.md) | All 82 project issues reviewed; 71 scope/requirements/criteria updates plus a baseline reference follow-up, with 10 issues unchanged. Live read-back, metadata, hierarchy, and ownership checks passed. |

## Recording and applying updates

- Use a dated Markdown file for each review and record its owner, approval date, source, examples, affected references, and unresolved boundaries.
- Distinguish the owner's final decisions from rejected recommendations and implementation choices still to make. Record subsequent decisions in a new log that identifies what it supersedes.
- Preserve published historical baselines and stable requirement/entity IDs. A subsequent baseline adoption must reconcile requirements, entity relationships, accepted decisions, coverage/ownership, the schema/design guide, navigation, and affected issue acceptance criteria.
- A log records approved policy; it does not demonstrate implementation, complete propagation, or close delivery issues.
