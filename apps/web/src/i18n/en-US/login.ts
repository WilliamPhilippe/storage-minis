export default {
  title: "Sign in",
  lead: "Manage your inventory, purchases, sales and public catalog.",
  action: "Continue with Google",
  helper: "Only Google accounts invited to an organization can sign in.",
  footer: "Shopping? Open the catalog link the seller shared with you.",
  // State 2: from the button press until the popup returns or the page
  // leaves for Google.
  opening: {
    action: "Opening Google…",
    helper: "You'll come back here after choosing your account.",
  },
  sessionEnded: "Your session ended. Sign in again.",
  errors: {
    popupBlocked:
      "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
    cancelled: "Sign-in was cancelled. Try again.",
    network: "Couldn't reach Google. Check your connection and try again.",
    failed: "Sign-in didn't work. Try again.",
  },
  // State 4. A custom-token test user has no email.
  noAccess: {
    title: "This account doesn't have access",
    withEmail:
      "You signed in as <bold>{{email}}</bold>, which isn't a member of any organization. Ask the administrator to add you, or use another Google account.",
    withoutEmail:
      "The account you signed in with isn't a member of any organization. Ask the administrator to add you, or use another Google account.",
    action: "Use another Google account",
  },
  // State 3: Google blocks sign-in inside apps' webviews.
  inApp: {
    title: "Open in your browser",
    lead: "Google sign-in doesn't work inside apps like Instagram or WhatsApp. Open this page in Safari or Chrome to continue.",
    steps: {
      menu: "Tap the menu button (<bold>•••</bold> or <bold>⋮</bold>) in the corner of the screen.",
      open: "Choose <bold>Open in browser</bold>, or copy the link and paste it into Safari or Chrome.",
    },
    action: "Copy link",
    copied: "Link copied",
    copyFailed:
      "Couldn't copy the link. Use Open in browser from the menu instead.",
    footer: "Shopping? The catalog works here without signing in.",
  },
} as const;
