import type { CatalogShape } from "../i18n";
import type en from "../en-US/app";

export default {
  nav: {
    label: "Menu principal",
    open: "Abrir menu",
    menu: "Menu",
    collapse: "Recolher",
    expand: "Expandir menu",
  },
  titles: {
    home: "Início",
    inventory: "Estoque",
    purchases: "Compras",
    sales: "Vendas",
    customers: "Clientes",
    payments: "Pagamentos",
    reports: "Relatórios",
    catalog: "Catálogo",
    settings: "Configurações",
  },
  account: {
    signOut: "Sair",
  },
  placeholder: "Esta seção ainda não foi construída.",
  echo: {
    title: "Conexão com a API",
    connected: "Conectado",
    reply: "A API respondeu: {{message}}",
  },
} satisfies CatalogShape<typeof en>;
