/**
 * The causes of guarded procedures' rejections. The allowlisted error log
 * records a cause's constructor name and its `code` (the reason), never a
 * token, email or header value (sign-in plan SI-05, SI-06).
 */

/** AU-01's reasons for refusing a token: UNAUTHORIZED. */
export type IdentityRejection =
  | "token_missing"
  | "token_invalid"
  | "token_expired"
  | "session_limit"
  | "session_revoked"
  | "provider_rejected";

export class IdentityRejected extends Error {
  override name = "IdentityRejected";
  readonly code: IdentityRejection;

  constructor(code: IdentityRejection, options?: ErrorOptions) {
    super(`Identity rejected: ${code}.`, options);
    this.code = code;
  }
}

/** AU-09's reasons for FORBIDDEN, or BAD_REQUEST for the header. */
export type AccessRejection =
  | "user_missing"
  | "organization_header_invalid"
  | "membership_missing"
  | "role_too_low"
  | "global_admin_required"
  | "product_edit_required";

export class AccessDenied extends Error {
  override name = "AccessDenied";
  readonly code: AccessRejection;

  constructor(code: AccessRejection) {
    super(`Access denied: ${code}.`);
    this.code = code;
  }
}
