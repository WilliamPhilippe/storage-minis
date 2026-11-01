import type { CatalogShape } from "../i18n";
import type en from "../en-US/common";

export default {
  brand: "StorageMinis",
  language: {
    switch: "Idioma: {{name}}",
    failed:
      "Não foi possível mudar o idioma. Verifique sua conexão e tente novamente.",
  },
  loading: "Carregando",
  actions: {
    tryAgain: "Tentar novamente",
  },
  errors: {
    network:
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    server: "O servidor teve um problema. Tente novamente em instantes.",
    request: "O servidor não aceitou esta solicitação.",
    page: "Algo deu errado",
  },
  notFound: {
    title: "Página não encontrada",
    description: "Confira o endereço ou abra de novo o link que você recebeu.",
    home: "Ir para o início",
  },
} satisfies CatalogShape<typeof en>;
