import { createFileRoute } from "@tanstack/react-router";
import { CatalogPlaceholder } from "../../features/catalog/CatalogPlaceholder";
import { ensureNamespace } from "../../i18n/i18n";

export const Route = createFileRoute("/catalog/$nickname")({
  loader: () => ensureNamespace("catalog"),
  component: CatalogPlaceholder,
});
