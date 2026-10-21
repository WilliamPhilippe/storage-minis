# Technical direction

**Owner approval date:** 2026-10-21. **Status:** accepted choices with remaining design work explicitly listed below; no application implementation exists yet.

This records the owner's stack and technical-policy decisions from the development-stack discussion, including the follow-up confirmation of active-use token refresh, explicit logout, the administrator email, and UTC reporting. It supplements the current [v0.7 requirements](requirements-v0.7.md), [entity map](entity-map-v0.7.md), and [ownership index](requirements-coverage-v0.7.md). It does not replace the business baseline or close delivery issues. The [model review](model-review.md) and [PurchaseExpense impact](purchase-expense-impact-v0.7.md) continue to govern domain invariants.

## Accepted application stack

| Area | Accepted choice | Scope |
| --- | --- | --- |
| Repository | One monorepo for backend/API and frontend | Applications may deploy independently to different providers. No provider has been selected. |
| Language | TypeScript with strict checking | Backend, frontend, and shared application packages. |
| Package management | pnpm workspaces | Dependency installation and internal package links. |
| Build tasks | Turborepo | Repository task scheduling and build caching; cross-provider deployment coordination remains a CI/CD decision. |
| Backend | Node.js with Fastify | Business operations remain subject to application authorization and database atomicity. |
| API contract | tRPC | Typed frontend/backend API; naming, errors, pagination, and mutation retry/idempotency conventions remain T06 design work. |
| Runtime validation | Zod | Validate API inputs; frontend validation does not replace backend validation or business constraints. |
| Frontend | React with Vite | Separate frontend application. |
| Routing | TanStack Router | Client navigation and URL state. |
| Server data | TanStack Query with the tRPC integration | Scope private caches by Organization and authentication context while preserving global Product reuse. |
| Forms | React Hook Form with Zod | Form handling and input validation. |
| Database | PostgreSQL | Final schema, constraints, and transaction/concurrency design remain pending. |
| Persistence access | Drizzle ORM | Migration workflow and database-driver/version selection remain T06 work. |
| Development infrastructure | Docker Compose for PostgreSQL | Production database hosting remains undecided. |
| Tests | Vitest and Playwright | Vitest for unit/integration tests, including real PostgreSQL for rollback, constraints, and concurrency; Playwright for core administrator and public-catalog workflows. |
| Lint and formatting | ESLint and Prettier | Previously accepted conventions; concrete settings and commands remain pending. |

The choices provide shared TypeScript contracts within one repository while retaining independent frontend/backend deployment. They do not introduce additional domain features or settle unresolved business policies.

**Design-system preference:** the owner leans toward Ant Design. Keep it as the preferred candidate until explicitly finalized. Styling conventions, application language, and UI locale remain open.

## Authentication and initial administrator

Accepted choices:

- Firebase Authentication with the Google provider only; email/password sign-in is excluded.
- Use Firebase ID tokens for API authentication. The API verifies those tokens and enforces User/Membership/Organization authorization for business access.
- Keep the user signed in through token refresh when a token expires during active use. Inactive users receive no refresh. Token expiry during active use does not require signing in again each hour.
- Support explicit logout.
- The initial administrator is the owner's personal Google account, `ctt.williamphilippe@gmail.com`, supplied on 2026-10-21 as the setup identity. The bootstrap/configuration mechanism remains pending. Firebase credentials have not been supplied.

Firebase documents that ID tokens last for an hour and refresh tokens can obtain new ones. Browser persistence is a separate setting. The public `getIdToken()` method can also refresh an expired or soon-expiring token when called; T02 must design token acquisition and any background activity around the accepted active-use policy. See [Firebase session management](https://firebase.google.com/docs/auth/admin/manage-sessions), [authentication-state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), and [token acquisition](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken).

Examples: while the administrator is using the system, token expiry triggers refresh and work continues without an hourly interactive sign-in. If the administrator is inactive, the client does not refresh the token. The administrator can explicitly log out. A valid Google/Firebase identity without the required application authorization does not grant access to private inventory or financial records.

[T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) still needs the administrator bootstrap mechanism, browser persistence policy, activity signals/inactivity threshold, return-after-inactivity behavior, logout scope/revocation, Google-account recovery expectations, and expiry/recovery acceptance cases. In particular, deciding not to refresh while inactive does not settle whether returning after token expiry refreshes the token or requires interactive sign-in. Initial-admin selection must use the configured owner identity; an arbitrary first Google sign-in is not authorization. No absolute or idle session timeout has been chosen.

## Money and dates

Accepted choices:

- All operational amounts remain BRL, consistent with REQ-008; visitor timezone or locale does not introduce currency conversion.
- Store timestamp instants in UTC. The UI converts them for display in the visitor's timezone.
- Daily/monthly financial reports use the fixed business timezone `UTC` for all viewers, as confirmed by the owner on 2026-10-21. Visitor-local timestamp display does not change report periods.
- Preserve the distinction between the business event date and its recorded timestamp, as required by REQ-011, FIN-011, CALC-018, and the accepted shared-history model. Calendar-date input/storage semantics remain T03 work.

Example: `2026-11-01T01:00:00Z` may display as October 31 at 22:00 for a visitor in UTC-03:00. A business event dated November 1 in UTC remains in November's report for every viewer. Report membership follows UTC and the applicable source business date rather than the viewer's display timezone.

[T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) still needs exact BRL representation, intermediate precision and rounding, deterministic cent remainders, date-only/business-date semantics, period-filter semantics, and dated-adjustment acceptance examples. The storage and reporting timezone is settled as UTC. PostgreSQL plus Drizzle does not choose the remaining policies automatically.

## Remaining design and delivery boundaries

| Work item | Still required |
| --- | --- |
| [T01 / #21](https://github.com/WilliamPhilippe/storage-minis-be/issues/21) | Final logical schema and state dimensions, transaction boundaries, Organization constraints, active-commitment/collection uniqueness, and allocation concurrency enforcement. |
| [T02 / #22](https://github.com/WilliamPhilippe/storage-minis-be/issues/22) | Complete bootstrap, persistence, activity/inactivity handling, return behavior, logout scope/revocation, and recovery around the accepted Google/ID-token/active-use-refresh/logout choices and supplied administrator email. |
| [T03 / #24](https://github.com/WilliamPhilippe/storage-minis-be/issues/24) | Complete exact monetary, business-date, and period-filter rules around BRL, UTC storage/reporting, and visitor-local timestamp display. |
| [T04 / #23](https://github.com/WilliamPhilippe/storage-minis-be/issues/23) | Hosting, deployment and release coordination, secrets/configuration, storage, daily backup retention/restore verification, recovery targets, browser/device support, performance targets, and operational monitoring. |
| [T05 / #25](https://github.com/WilliamPhilippe/storage-minis-be/issues/25) | Inspect the real spreadsheet and agree on legacy acquisition treatment; source data is not supplied. |
| [T06 / #26](https://github.com/WilliamPhilippe/storage-minis-be/issues/26) | Pin supported versions, choose package layout and migration/API conventions, establish repeatable setup and CI, and prove rollback and Organization isolation with the selected stack. |

T06's existing T01/T02/T04 prerequisites remain in force. The requirements continue to have their existing primary delivery owners; this record adds no duplicate delivery work. D01-D08 remain business-policy boundaries.

Hosting and operations are deliberately left open. Railway was discussed as an example, not selected. No GitHub issue has been closed or amended by this local record, no infrastructure has been provisioned, and no install/build/test commands have been verified.
