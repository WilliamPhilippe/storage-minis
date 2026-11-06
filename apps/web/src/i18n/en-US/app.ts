export default {
  nav: {
    label: "Main menu",
    open: "Open menu",
    menu: "Menu",
    collapse: "Collapse",
    expand: "Expand menu",
  },
  titles: {
    home: "Home",
    inventory: "Inventory",
    purchases: "Purchases",
    sales: "Sales",
    customers: "Customers",
    payments: "Payments",
    reports: "Reports",
    catalog: "Catalog",
    settings: "Settings",
  },
  // A Sign out button for now (SI-13): top right of the TopBar on desktop,
  // in the menu drawer's footer on phones. The account menu follows (#130).
  account: {
    signOut: "Sign out",
  },
  placeholder: "This section isn't built yet.",
  echo: {
    title: "API connection",
    connected: "Connected",
    reply: "The API replied: {{message}}",
  },
} as const;
