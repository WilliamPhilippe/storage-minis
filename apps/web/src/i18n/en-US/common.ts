export default {
  brand: "StorageMinis",
  language: {
    switch: "Language: {{name}}",
    failed:
      "Couldn't change the language. Check your connection and try again.",
  },
  loading: "Loading",
  actions: {
    tryAgain: "Try again",
  },
  errors: {
    network: "Can't reach the server. Check your connection and try again.",
    server: "The server had a problem. Try again in a moment.",
    request: "The server couldn't accept this request.",
    page: "Something went wrong",
  },
  notFound: {
    title: "Page not found",
    description: "Check the address, or open the link you were given again.",
    home: "Go to home",
  },
} as const;
