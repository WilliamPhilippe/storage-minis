import type { CatalogShape } from "../i18n";
import type en from "../en-US/login";

export default {
  title: "Entrar",
  lead: "Gerencie seu estoque, compras, vendas e catálogo público.",
  action: "Continuar com o Google",
  helper: "Somente contas Google convidadas para uma organização podem entrar.",
  footer:
    "Vai comprar? Abra o link do catálogo que o vendedor compartilhou com você.",
  opening: {
    action: "Abrindo o Google…",
    helper: "Você voltará para cá depois de escolher sua conta.",
  },
  sessionEnded: "Sua sessão terminou. Entre novamente.",
  errors: {
    popupBlocked:
      "Seu navegador bloqueou a janela de login. Permita pop-ups para este site e tente novamente.",
    cancelled: "O login foi cancelado. Tente novamente.",
    network:
      "Não foi possível conectar ao Google. Verifique sua conexão e tente novamente.",
    failed: "O login não funcionou. Tente novamente.",
  },
  noAccess: {
    title: "Esta conta não tem acesso",
    withEmail:
      "Você entrou como <bold>{{email}}</bold>, que não é membro de nenhuma organização. Peça ao administrador para adicionar você ou use outra conta Google.",
    withoutEmail:
      "A conta com que você entrou não é membro de nenhuma organização. Peça ao administrador para adicionar você ou use outra conta Google.",
    action: "Usar outra conta Google",
  },
  inApp: {
    title: "Abra no seu navegador",
    lead: "O login com o Google não funciona dentro de apps como Instagram ou WhatsApp. Abra esta página no Safari ou no Chrome para continuar.",
    steps: {
      menu: "Toque no botão de menu (<bold>•••</bold> ou <bold>⋮</bold>) no canto da tela.",
      open: "Escolha <bold>Abrir no navegador</bold> ou copie o link e cole no Safari ou no Chrome.",
    },
    action: "Copiar link",
    copied: "Link copiado",
    copyFailed:
      "Não foi possível copiar o link. Use a opção Abrir no navegador do menu.",
    footer: "Vai comprar? O catálogo funciona aqui sem entrar.",
  },
} satisfies CatalogShape<typeof en>;
