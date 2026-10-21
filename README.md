# storage-minis-be

## Agent guidance

See [AGENTS.md](AGENTS.md) for repository context, current requirements, validation guidance, and decisions still needed before implementation.

## Documentation

- [Requirements specification v0.7 — current](docs/requirements-v0.7.md)
- [Entity and relationship map v0.7 — current](docs/entity-map-v0.7.md)
- [Requirement ownership and backlog v0.7](docs/requirements-coverage-v0.7.md)
- [Shared PurchaseExpense impact v0.7](docs/purchase-expense-impact-v0.7.md)
- [Accepted entity-model decisions](docs/model-review.md)
- [Technical direction — accepted stack, authentication, and date choices](docs/technical-direction.md)
- [Technical direction review — documentation and backlog propagation](docs/technical-direction-review.md)
- [Requirements specification v0.6 — historical](docs/requirements-v0.6.md)
- [Entity and relationship map v0.6 — historical](docs/entity-map-v0.6.md)
- [Requirement ownership and backlog v0.6 — historical](docs/requirements-coverage-v0.6.md)
- [Global Product impact and publication record v0.6 — historical](docs/global-product-impact-v0.6.md)
- [Requirements specification v0.5 — historical](docs/requirements-v0.5.md)
- [Entity and relationship map v0.5 — historical](docs/entity-map-v0.5.md)

Requirements and entity maps include their baseline version in the filename. Publish a new versioned file when adopting a new baseline, record its changes and the version it supersedes, and preserve stable requirement and entity IDs. Retired IDs are not reused.

V0.7 supports one organization-owned PurchaseExpense across one or more Purchases, with cost allocated directly to selected InventoryItems. It carries forward v0.6 global Product access and organization-owned operational/private data. The linked decision tickets identify policies still to resolve before affected implementation work.
