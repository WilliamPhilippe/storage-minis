# Requirements v0.8 issue propagation — 2026-11-01

**Status:** Applied and read-back verified on GitHub.

**Approval:** WilliamPhilippe, 2026-11-01, approving the drafted issue texts and asking to "update what is needed". Sources: [requirements v0.8](../requirements/requirements-v0.8.md), [entity map v0.9](../entities/entity-map-v0.9.md) and [ownership index v0.8](../requirements/requirements-coverage-v0.8.md), which consolidate the [2026-10-22 schema review](2026-10-22-schema-review.md), the three 2026-10-23 logs and the owner's 2026-11-01 Organization currency and nickname decisions.

**Scope:** 35 live issues updated and three created. Each updated issue gains a dated "Requirements v0.8 inputs (2026-11-01)" section at the top, and quoted requirement text that v0.8 changed is replaced in place. Earlier dated sections stay as recorded. No primary owner, parent link or dependency changes, except that the new [#117](https://github.com/WilliamPhilippe/storage-minis/issues/117) owns ORG-010–011. Historical baselines #2 and #78 are unchanged.

## Created

| Issue | Purpose |
| --- | --- |
| [#117](https://github.com/WilliamPhilippe/storage-minis/issues/117) — [E01.04] Set each Organization's unique nickname and currency at creation | Primary owner of ORG-010–011. Parent #3, blocked by #21 and #22, milestone M1. |
| [#118](https://github.com/WilliamPhilippe/storage-minis/issues/118) — [E13.02] Deliver the frontend foundation: web shell, Playwright, sign-in and web image | The four frontend PRs. Parent #89; only its sign-in PR waits for T02 / #22. |
| [#119](https://github.com/WilliamPhilippe/storage-minis/issues/119) — storage-minis v0.8 — current requirements baseline | Reference tracker that supersedes #82; it closes when the publication PR merges. |

The `spec:v0.8` label was added, and the three issues joined the MiniStorage project.

## Topics added to the dated section

| Topic | Issues |
| --- | --- |
| Money: integer cents in each Organization's currency, never converted | [#3](https://github.com/WilliamPhilippe/storage-minis/issues/3), [#6](https://github.com/WilliamPhilippe/storage-minis/issues/6), [#13](https://github.com/WilliamPhilippe/storage-minis/issues/13), [#19](https://github.com/WilliamPhilippe/storage-minis/issues/19), [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21), [#24](https://github.com/WilliamPhilippe/storage-minis/issues/24), [#25](https://github.com/WilliamPhilippe/storage-minis/issues/25), [#26](https://github.com/WilliamPhilippe/storage-minis/issues/26), [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28), [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34), [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36), [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37), [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38), [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40), [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44), [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45), [#51](https://github.com/WilliamPhilippe/storage-minis/issues/51), [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52), [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53), [#58](https://github.com/WilliamPhilippe/storage-minis/issues/58), [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59), [#74](https://github.com/WilliamPhilippe/storage-minis/issues/74), [#75](https://github.com/WilliamPhilippe/storage-minis/issues/75), [#89](https://github.com/WilliamPhilippe/storage-minis/issues/89) |
| Catalog URL by nickname; prices with the currency symbol | [#12](https://github.com/WilliamPhilippe/storage-minis/issues/12), [#18](https://github.com/WilliamPhilippe/storage-minis/issues/18), [#66](https://github.com/WilliamPhilippe/storage-minis/issues/66), [#69](https://github.com/WilliamPhilippe/storage-minis/issues/69) |
| Product metadata: no scale or codes, images as a list, `is_chase` | [#12](https://github.com/WilliamPhilippe/storage-minis/issues/12), [#18](https://github.com/WilliamPhilippe/storage-minis/issues/18), [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30), [#66](https://github.com/WilliamPhilippe/storage-minis/issues/66), [#69](https://github.com/WilliamPhilippe/storage-minis/issues/69) |
| Readable identifier: short `inventoryId` | [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21), [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) |
| Collection membership: `sale_status = collection` | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) |
| Expenses paid in parts | [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21), [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37), [#38](https://github.com/WilliamPhilippe/storage-minis/issues/38), [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45), [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) |
| Legacy units in grouped opening Purchases; no import tables | [#13](https://github.com/WilliamPhilippe/storage-minis/issues/13), [#25](https://github.com/WilliamPhilippe/storage-minis/issues/25), [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53), [#74](https://github.com/WilliamPhilippe/storage-minis/issues/74) |
| Frontend: TanStack Form and Ant Design 6 | [#23](https://github.com/WilliamPhilippe/storage-minis/issues/23), [#26](https://github.com/WilliamPhilippe/storage-minis/issues/26) |
| Sessions and Organization bootstrap | [#22](https://github.com/WilliamPhilippe/storage-minis/issues/22), [#27](https://github.com/WilliamPhilippe/storage-minis/issues/27) |
| New child issue | [#3](https://github.com/WilliamPhilippe/storage-minis/issues/3), [#89](https://github.com/WilliamPhilippe/storage-minis/issues/89) |

[#26](https://github.com/WilliamPhilippe/storage-minis/issues/26) also gains a dated line in its approved technical constraints, and [#82](https://github.com/WilliamPhilippe/storage-minis/issues/82) a note that v0.8 supersedes it.

## Requirement text replaced

| Requirement | Issues |
| --- | --- |
| CALC-013 | [#59](https://github.com/WilliamPhilippe/storage-minis/issues/59) |
| COL-001 | [#49](https://github.com/WilliamPhilippe/storage-minis/issues/49) |
| DATA-007 | [#25](https://github.com/WilliamPhilippe/storage-minis/issues/25), [#53](https://github.com/WilliamPhilippe/storage-minis/issues/53), [#74](https://github.com/WilliamPhilippe/storage-minis/issues/74) |
| FIN-002 | [#52](https://github.com/WilliamPhilippe/storage-minis/issues/52) |
| FIN-007 | [#45](https://github.com/WilliamPhilippe/storage-minis/issues/45) |
| INV-003 | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) |
| INV-004 | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) |
| INV-008 | [#35](https://github.com/WilliamPhilippe/storage-minis/issues/35) |
| PRO-006 | [#18](https://github.com/WilliamPhilippe/storage-minis/issues/18), [#30](https://github.com/WilliamPhilippe/storage-minis/issues/30), [#69](https://github.com/WilliamPhilippe/storage-minis/issues/69) |
| PUR-004 | [#24](https://github.com/WilliamPhilippe/storage-minis/issues/24), [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34), [#40](https://github.com/WilliamPhilippe/storage-minis/issues/40) |
| PUR-021 | [#24](https://github.com/WilliamPhilippe/storage-minis/issues/24), [#37](https://github.com/WilliamPhilippe/storage-minis/issues/37) |
| REQ-008 | [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21), [#24](https://github.com/WilliamPhilippe/storage-minis/issues/24), [#28](https://github.com/WilliamPhilippe/storage-minis/issues/28), [#36](https://github.com/WilliamPhilippe/storage-minis/issues/36), [#44](https://github.com/WilliamPhilippe/storage-minis/issues/44) |
| REQ-009 | [#21](https://github.com/WilliamPhilippe/storage-minis/issues/21), [#34](https://github.com/WilliamPhilippe/storage-minis/issues/34) |

## Verification

Each issue body was re-read immediately before its edit, and none had changed since the fetch. Each was read back afterwards, and all 35 matched the intended body.

## Remaining

- The DBML draft and design guide still lack the Organization nickname and currency (T01 / #21).
- The open decisions in [requirements v0.8 Section 14](../requirements/requirements-v0.8.md#14-remaining-open-decisions-not-yet-approved-business-rules) remain open.
- Implementation acceptance evidence is pending for every delivery issue.
