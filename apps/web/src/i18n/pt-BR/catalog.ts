import type { CatalogShape } from "../i18n";
import type en from "../en-US/catalog";

export default {
  unavailable: "Este catálogo ainda não está disponível",
} satisfies CatalogShape<typeof en>;
