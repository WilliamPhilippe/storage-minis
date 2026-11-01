import "i18next";
import type app from "./en-US/app";
import type catalog from "./en-US/catalog";
import type common from "./en-US/common";
import type login from "./en-US/login";

// Typed keys: a wrong key fails `tsc`. A missing interpolation value is caught
// only by i18next 26.6.0's `strictInterpolationChecks`; turn it on with that
// upgrade (WS-09).
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      app: typeof app;
      login: typeof login;
      catalog: typeof catalog;
    };
  }
}
