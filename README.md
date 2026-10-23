# storage-minis-be

## Agent guidance

See [AGENTS.md](AGENTS.md) for repository context, current requirements, validation guidance, and decisions still needed before implementation.

## Documentation

- [Requirements specification v0.7 — read with approved update logs](docs/requirements-v0.7.md)
- [Entity and relationship map v0.8 — current](docs/entity-map-v0.8.md)
- [Database schema — visual DBML draft 1](docs/database/schema.dbml)
- [Database design — entity mapping, proposals, and open decisions](docs/database/design.md)
- [Requirement update logs — approved decisions and propagation status](docs/requirement-updates/README.md)
- [Requirement ownership and backlog v0.7](docs/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/purchase-expense-impact-v0.7.md)
- [Earlier accepted entity-model decisions — read with the latest map](docs/model-review.md)
- [Technical direction — accepted stack, authentication, and date choices](docs/technical-direction.md)
- [Technical direction review — documentation and backlog propagation](docs/technical-direction-review.md)
- [Entity and relationship map v0.7 — historical](docs/entity-map-v0.7.md)
- [Requirements specification v0.6 — historical](docs/requirements-v0.6.md)
- [Entity and relationship map v0.6 — historical](docs/entity-map-v0.6.md)
- [Requirement ownership and backlog v0.6 — historical](docs/requirements-coverage-v0.6.md)
- [Global Product impact and publication record v0.6 — historical](docs/global-product-impact-v0.6.md)
- [Requirements specification v0.5 — historical](docs/requirements-v0.5.md)
- [Entity and relationship map v0.5 — historical](docs/entity-map-v0.5.md)

Requirements and entity maps include their version in the filename. Publish a new versioned file when adopting changes, record what it supersedes, and preserve stable requirement and entity IDs. Retired IDs are not reused. Read approved requirement update logs alongside published documents; explicit later decisions supersede conflicting wording.

The v0.8 entity map consolidates v0.7 with the owner-approved [2026-10-22 schema review](docs/requirement-updates/2026-10-22-schema-review.md). Its [comparison and publication record](docs/entity-map-v0.8.md#16-v07--v08-comparison-and-publication-record) identifies the changed relationships and remaining work. This is an entity-map publication; the requirements specification, ownership index, DBML/design guide, and GitHub issue criteria still await reconciliation. It does not publish a complete v0.8 requirements baseline or claim implemented behavior.
