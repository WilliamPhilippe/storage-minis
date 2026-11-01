import type { CatalogShape } from "../i18n";
import type en from "../en-US/login";

export default {
  title: "Entrar",
  lead: "Gerencie seu estoque, compras, vendas e catálogo público.",
  action: "Continuar com o Google",
  helper: "Somente contas Google convidadas para uma organização podem entrar.",
  footer:
    "Vai comprar? Abra o link do catálogo que o vendedor compartilhou com você.",
} satisfies CatalogShape<typeof en>;
