/**
 * Shapes shared by the API's sign-in modules (T02 record AU-01–AU-11, sign-in
 * plan SI-03–SI-08). Types only: the tRPC context refers to them, so this
 * module must never import runtime code or server libraries into the
 * browser's `@storage-minis/api/types` contract.
 */

import type { schema } from "@storage-minis/db";

export type OrganizationCurrency =
  (typeof schema.organizationCurrency.enumValues)[number];

/**
 * AU-07: the configured owner's first verified Google sign-in, while no
 * Organization exists, creates the administrator and this Organization.
 */
export interface BootstrapSettings {
  /** Trimmed and lowercased; compared with the token's email the same way. */
  ownerEmail: string;
  organization: {
    name: string;
    nickname: string;
    currency: OrganizationCurrency;
  };
}
