# T02 record — authentication, sessions and authorization (2026-11-03)

**Status: approved by the owner on 2026-11-04 as recommended; not yet
implemented.** The approval record is in
[technical direction](technical-direction.md#t02-record-and-sign-in-plan-approval-2026-11-04).
This is the record that
[T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22) owes before
the frontend's sign-in step
([frontend foundation decisions](frontend-foundation-proposal-2026-11-01.md), W8).
It settles the session, recovery, bootstrap and authorization policies around the
approved Google-only Firebase sign-in. The [sign-in plan](sign-in-plan-2026-11-03.md)
delivers it across the API and the web app. AU-01–AU-12 are references within this
record, not requirement, issue or F-decision IDs.

The record draws on requirements v0.8 (Section 2, TECH-001), entity map v0.9 (E01–E03),
the 2026-10-23 DBML review, the
[technical direction](technical-direction.md#authentication-and-initial-administrator),
the frontend foundation decisions W5, W6 and W8, issues #22, #117, #26 and #118, the
`identity-and-access` schema, and a scratch prototype against the `storage-minis-dev`
project. The plan's [research and evidence](sign-in-plan-2026-11-03.md#research-and-evidence-2026-11-03)
lists the prototype's commands and results.

## Recommended decisions

| ID | Recommendation |
| --- | --- |
| AU-01 | The API accepts only Firebase ID tokens from its configured project. A User is identified by the token's `sub` (`users.firebase_uid`) alone; email is never an authorization key after the bootstrap. Only `google.com` sign-ins are accepted, plus `custom` under the test opt-in (AU-11). |
| AU-02 | Local browser persistence: IndexedDB, with localStorage as the fallback. A session survives closing the tab or the browser, until sign-out or the 7-day limit. |
| AU-03 | The 7-day limit is enforced three times: before Firebase loads a saved session, before each request, and by the API. Within the 7 days there is no idle timeout. |
| AU-04 | "Sign out" signs out this browser only: Firebase's `signOut`, the query cache cleared, every open tab sent to `/login`. |
| AU-05 | Revocation by the API: a per-User `sessions_valid_after` time rejects every older session. "Sign out of all devices" sets it for yourself; an operator can set it for anyone. Deleting a Membership revokes that Organization at the next request. |
| AU-06 | Recovery is Google's: the app keeps no password, code or recovery email. A lost Google account is rebound to its User by a documented operator procedure. |
| AU-07 | The first verified Google sign-in of the configured owner email, while no Organization exists, creates the administrator, the first Organization (name, nickname, BRL) and its owner Membership, with audit, in one transaction. It never runs again. |
| AU-08 | Role capabilities: Membership `owner` and `editor` write, `viewer` reads; `global_admin` holds platform actions only, with no implicit access to any Organization; global `editor` grants nothing yet; `can_edit_products` stays the only authority for editing existing Products. |
| AU-09 | Four guarded procedure classes (identity, User, Organization with a minimum role, platform) plus module-private public procedures. Organization comes only from a header checked against Membership; another Organization's records behave as nonexistent. |
| AU-10 | A Google account without a User row or Membership gets no row, sees the Login page's "No access" state, and is signed out of Firebase. |
| AU-11 | Custom-token sign-ins only with an explicit opt-in in `.env.test`, refused at startup with `NODE_ENV=production`, minted only by Playwright on a developer's machine through keyless IAM signing. |
| AU-12 | Twenty-five acceptance cases for bootstrap, sessions, expiry, logout, revocation, recovery and authorization, each mapped to a test or a manual check. |

## 1. Carried forward (approved, not reopened)

| Source | What it settles |
| --- | --- |
| [Authentication and initial administrator](technical-direction.md#authentication-and-initial-administrator) (2026-10-21) | Firebase Authentication with Google only; Firebase ID tokens for the API; refresh during active use and none while inactive; explicit logout; the owner's Google account `ctt.williamphilippe@gmail.com` as the initial administrator; an arbitrary first sign-in is not authorization. |
| [Frontend decisions](technical-direction.md#frontend-foundation-decisions-2026-11-01) W5 (2026-11-01) | A session context with the User, Memberships and active Organization; nothing persisted while each User has one Membership; the Organization travels in a request header; switching Organization clears the query cache. |
| W6 | `getIdToken()` before each request; requests follow user activity only (navigation, actions, return to the tab), never polling or reconnect. |
| W8 | Popup on desktops, redirect on phones through a same-origin `/__/auth/` proxy behind Caddy; development by popup through `storage-minis-dev.firebaseapp.com`; `localhost` authorized only in the dev project; no Auth emulator; a session ends 7 days after the last Google sign-in, enforced by the API through `auth_time`; a test-only custom-token sign-in behind an opt-in set only in the committed env files; the parity stack signed-out only. |
| W10 | Both projects' web configs committed as public identifiers; the web build never runs under Doppler. |
| 2026-10-23 DBML review | User `role` (`global_admin`, `editor`, `user`) and Membership `role` (`owner`, `editor`, `viewer`); revoking a Membership deletes it while audit keeps the grant and revocation; role names alone do not define capabilities. |
| ORG-004, ORG-005, ORG-008, ORG-010, ORG-011; PRO-012, PRO-013 | One initial administrator; Membership-scoped operation; global `can_edit_products`, default false and granted at bootstrap; Organization isolation with the global Product exception; currency chosen once; a unique nickname renamed only by a `global_admin`. |
| Firebase projects (owner, 2026-11-03) | `storage-minis` for production and `storage-minis-dev` for development; `localhost`, test users and the test signing credential stay out of production. |

## 2. Decisions

### AU-01 Identity and accepted tokens

**Recommendation.**

- The API accepts `Authorization: Bearer <Firebase ID token>` only, verified against
  the project named by `FIREBASE_PROJECT_ID` (`storage-minis-dev` locally,
  `storage-minis` in production). No cookie, no session table, no token of our own.
- A User is the row whose `firebase_uid` equals the token's `sub`, the Firebase uid.
  It is unique within the project and stays the same while the Firebase user exists;
  Firebase links it to Google's account ID, which Google never changes or reuses.
  Deleting the Firebase user (for example while tidying the console) gives that Google
  account a new uid at its next sign-in, which AU-06's procedure handles.
- Email and display name are profile data, never an authorization key, with one
  exception: the bootstrap (AU-07) matches the configured email once. `session.get`
  copies a Google token's `email` and `name` into the User row when they differ, so
  the account menu shows current values; custom tokens carry neither and change
  nothing.
- Accepted `firebase.sign_in_provider` values: `google.com` always, and `custom` only
  under the test opt-in (AU-11). Any other provider (`anonymous`, `password`, `phone`,
  …) is rejected, even though the console has none of them enabled.
- Every rejected token is `UNAUTHORIZED` with the fixed envelope. The log line carries
  a reason code (`token_missing`, `token_invalid`, `token_expired`,
  `session_limit`, `session_revoked`, `provider_rejected`), never the token or the
  email.

**Why:** the token is the only credential, and the uid is the only stable key Google
and Firebase guarantee. Emails can change on Google's side.

**Prototype:** a Google popup sign-in gave `sign_in_provider: "google.com"`,
`email_verified: true` and the email; a custom-token sign-in gave `"custom"`, no
email and empty `identities`.

### AU-02 Browser persistence

**Recommendation: local persistence,** `[indexedDBLocalPersistence,
browserLocalPersistence]`. A session survives closing the tab or restarting the
browser, until sign-out, revocation or the 7-day limit. This is Firebase's web default
minus the session-storage fallback. Firebase keeps the session in sync across tabs of
the same browser.

| Option | Effect | Why not |
| --- | --- | --- |
| **Local (recommended)** | Signed in across restarts for up to 7 days | — |
| Session (`browserSessionPersistence`) | Signed out when the tab closes | Phones discard background tabs, so people would sign in again many times a day; redirect sign-in needs the session to survive a page load anyway |
| In memory | Signed out on every reload | Unusable with a back office |
| A "shared device" choice on the Login page | Session persistence when ticked | A choice almost nobody needs in a seller's back office; sign-out covers a shared device |

**Shared devices:** people sign out (AU-04) or, from another device, sign out of all
devices (AU-05).

### AU-03 Session limit and the startup check

**Carried forward:** a session ends 7 days (604,800 s) after its last Google sign-in,
whatever its refresh history: a refresh keeps the original `auth_time`. No idle
timeout. Returning after inactivity refreshes on the first action.

**Recommendation, three checks of the same rule:**

1. **Before Firebase loads a saved session.** The prototype confirmed W8's concern in
   the `@firebase/auth` 1.13.9 source and in a browser: when Auth initializes with a
   saved user, the SDK calls `getIdToken()` (a refresh when the saved token has
   expired) and `accounts:lookup` before the app sees the user, and Auth's
   `beforeAuthStateChanged` middleware does not run for a saved user. So the app reads
   the saved record first and deletes it when its sign-in is older than 7 days or
   unreadable. The app then starts signed out, and Firebase makes no request. The
   plan's SI-10 has the mechanism and its risk.
2. **Before each request.** The app remembers the session's `auth_time` from the token
   it received at sign-in or startup. Past 7 days, the tRPC link signs out instead of
   calling `getIdToken()`, so an open tab never refreshes an expired session. The
   prototype showed that `user.metadata.lastSignInTime` is not a substitute: it kept
   the previous sign-in's time after a new sign-in.
3. **By the API**, authoritatively: `now − auth_time > 604,800 s` is
   `UNAUTHORIZED` (`session_limit`). The API's clock decides; a browser clock that is
   wrong only changes when the app notices.

After any of the three, the app shows `/login` with "Your session ended. Sign in
again." (AU-12 cases 10–11).

### AU-04 Logout scope

**Recommendation: "Sign out" signs out this browser.** The account menu's Sign out:

1. cancels in-flight queries and clears the query cache;
2. calls Firebase's `signOut`, which deletes the saved session in this browser;
3. goes to `/login`, state 1.

Other tabs of the same browser follow: Firebase notifies them, and the app clears
their cache and sends them to `/login`. Other browsers and devices stay signed in.
Ordinary sign-out does not revoke anything on the server: Firebase documents that
`signOut` does not revoke the ID token, which stays valid for at most an hour but is
gone from this browser. AU-05 covers the other devices.

**Alternative:** sign-out that always revokes every session (AU-05's action as the
only sign-out). Rejected: signing out a shared laptop would also sign the owner out of
their phone.

### AU-05 Revocation

**Recommendation: revocation in the API's own database.**

- New column `users.sessions_valid_after` (`timestamptz`, null by default). The API
  rejects a token whose `auth_time` (whole seconds) is not later than this time
  rounded up to the second (`session_revoked`). This follows the pattern Firebase
  documents for storing a revocation time yourself, and is stricter than
  `checkRevoked`'s `auth_time × 1000 < tokensValidAfterTime`: no session from the
  cutoff's own second survives, at the cost of refusing once a sign-in made in that
  same second.
- **"Sign out of all devices"** in the account menu sets it to now for the signed-in
  User. Every session, this one included, ends at its next request; the app then
  signs this browser out.
- **Operators** can set it for any User with one documented SQL statement (lost phone,
  suspected compromise), until a user-management screen exists.
- **Membership deletion** (the DBML review's revocation) removes access to that
  Organization at the next request (`FORBIDDEN`), without touching the session.
- **Firebase's console** can still disable an account, which stops new refreshes within
  the hour; the API does not depend on it.

| Option | Effect | Cost |
| --- | --- | --- |
| **API cutoff (recommended)** | Immediate, at the next request; works offline from Firebase | One nullable column; read with the User row that every guarded request already loads |
| Firebase `revokeRefreshTokens` + `verifyIdToken(…, checkRevoked)` | Firebase-side revocation | A service-account credential on the VPS (the prototype's `checkRevoked` failed without one), one extra Firebase call per request, and `firebase-admin` (about 67 MiB) in the API image |
| No revocation | A stolen session lasts up to 7 days | Console disable and Membership deletion only, with up to an hour of delay |

### AU-06 Account recovery

**Recommendation:**

- **No credentials of our own:** no password, recovery email, code or magic link.
  Access to a Google account is recovered only through Google's account recovery.
- **Google-side changes** (a new email address, a new name, a new password) do not
  affect access, because the uid stays the same. The bootstrap's email match has
  already happened by then.
- **A compromised Google account:** recover it with Google, then use "Sign out of all
  devices" (AU-05) from a fresh sign-in.
- **A lost Google account, or a deleted Firebase user** (either way, a new uid):
  1. The person signs in with the new account and sees "No access".
  2. An operator finds the new uid in the dev or production console (Authentication →
     Users, by email).
  3. The operator runs the documented SQL transaction as the owner role: set
     `users.firebase_uid` and `email` of the existing row to the new account, and set
     `sessions_valid_after` to now.
  4. The person signs in again and keeps their role and Memberships.

  The procedure lives in the README's operations notes once T04 has an operator
  workflow; until then, in `local-development.md`. Shared history has no global
  identity scope yet (`business_events.scope` is `organization` or
  `global_product`), so the rebind is not audited in the database; the operator
  records it in the PR or issue that asked for it. T01's typed history owns closing
  that gap.
- **Single administrator risk:** ORG-004 starts with one administrator, so a lost
  Google account without the procedure would lock the installation. A second
  `global_admin` needs invitations, which stay TBD.

### AU-07 Administrator bootstrap

**Recommendation: configured bootstrap on the first verified sign-in.**

- **Configuration** (API environment, all three or none):
  `BOOTSTRAP_OWNER_EMAIL`, `BOOTSTRAP_ORGANIZATION_NAME`,
  `BOOTSTRAP_ORGANIZATION_NICKNAME`, plus optional `BOOTSTRAP_ORGANIZATION_CURRENCY`
  (`BRL` by default, or `USD`). `.env.development` sets the owner's email and the
  owner's chosen name and nickname for the development database; T04 maps them in
  `compose.yaml` and sets them in Doppler `prd`. `.env.test` sets none; tests pass
  their own values.
- **Trigger:** the session procedure receives a verified token whose
  `sign_in_provider` is `google.com`, whose `email_verified` is true, and whose email
  equals `BOOTSTRAP_OWNER_EMAIL` (trimmed, compared in lowercase), while no User has
  that uid and **no Organization exists**.
- **One transaction:**
  1. take a transaction-scoped advisory lock and re-check that no Organization exists;
  2. insert the User with `role = global_admin` and `can_edit_products = true`, and the
     token's email and name;
  3. insert the Organization with the configured name, nickname and currency;
  4. insert the owner Membership;
  5. insert one Organization-scoped `business_events` row (`organization.bootstrap`,
     the new User as actor) with one `business_event_changes` row for the Membership
     grant (`membership_user_id`, `after_facts` `{ "role": "owner" }`). A change row
     names exactly one subject and the schema has no Organization subject, so the
     event itself records the Organization's creation; T01's typed history can add an
     Organization subject later.
- **Once only:** after the first Organization exists, the configuration does nothing,
  even for the owner's email. Concurrent first requests serialize on the lock: one
  creates the rows, the other reads them.
- **Everyone else** gets "No access" (AU-10), including a non-Google provider or an
  unverified email that claims the owner's address.

| Option | Why not |
| --- | --- |
| **Configured, first sign-in (recommended)** | — |
| An operator command after the owner's first sign-in (`node dist/bootstrap.js --uid …`) | Two steps; the owner must look up their uid; a custom command where configuration suffices |
| A first-run setup screen where the configured owner types the name and nickname | A form before forms exist (TanStack Form arrives with the first business form); the owner already knows the values |
| A seed migration | Environment-specific values in migrations |

**Needs:** `organizations.nickname` and `organizations.currency`, which #117 assigns to
T01. The plan adds them now (SI-04), with a provisional nickname rule, as an exception
to the implementation guide's T01 gate for business schema migrations.

### AU-08 Role capabilities

**Recommendation:**

| Capability | `viewer` | `editor` | `owner` | `global_admin` (global) | `can_edit_products` (global) |
| --- | --- | --- | --- | --- | --- |
| Read the Organization's private records (units, Purchases, Sales, Customers, Payments, reports, collection) | Yes | Yes | Yes | No, unless also a member | — |
| Create, change or delete its business records, unit photos and collection membership | No | Yes | Yes | No, unless also a member | — |
| Register a new global Product (ORG-005) | No | Yes | Yes | No, unless also a member | Not needed |
| Edit an existing global Product (PRO-012, D07) | — | — | — | — | Required, with no Membership condition |
| Change the Organization's settings, such as its name (later), and manage its Memberships (later, with invitations) | No | No | Yes | No | — |
| Rename the Organization's nickname (ORG-011) | No | No | No | Yes | — |
| Change the Organization's currency (ORG-010) | No | No | No | No | — |
| Create Organizations, invite people, grant global roles or `can_edit_products` | TBD with invitations; `global_admin` when built | | | | |

- **Global roles.** `global_admin` holds platform actions only and has no implicit
  access to any Organization's private data (ORG-008). The bootstrap also gives the
  owner an owner Membership, so the owner works in their Organization as a member. The
  global `editor` role grants nothing yet and behaves as `user`: the DBML review notes
  that the owner has not replaced `can_edit_products` with a role, so the boolean
  stays the only Product-edit authority.
- **Membership roles** are ordered `viewer` < `editor` < `owner`; a procedure names
  its minimum (AU-09).
- **Exceptional privileges (D06).** No role holds exceptional correction authority
  (for example corrections after a Purchase's permanent lock). When D06 decides one,
  it becomes a named capability checked like the others; until then nobody has it.
- **Future extensibility (ORG-003).** Several Memberships per User already work: the
  header selects one, and the active-Organization persistence waits for W5's deferred
  decision.

### AU-09 Procedure classes and cross-Organization rejection

**Recommendation:**

| Class | Requires | Context it adds | Used by |
| --- | --- | --- | --- |
| Public (module-private builders, as `diagnostics` today) | Nothing; never reads the token | — | `diagnostics.echo`; the catalog later, which returns only allowlisted fields (ORG-007) |
| Identity | A valid token | `identity` (uid, email, provider, `auth_time`) | `session.get` only, which must answer for Google accounts without a User row |
| User | Identity, plus a User row, plus `auth_time` not before `sessions_valid_after` | `user` (id, role, `can_edit_products`) | `session.signOutEverywhere`; Product edits (with a `can_edit_products` check) |
| Organization (minimum role) | User, plus a valid `x-organization-id` header, plus a Membership in that Organization with at least the role | `organization` (id, currency), `membership` (role) | Every business procedure |
| Platform | User with `role = global_admin` | — | Nickname rename and future administration |

Only the guarded builders are exported; a public router still derives its own
module-private builder, keeping Step 5's rule that no unguarded builder is shared
(P5-06).

**Responses** (the Step 5 envelope; messages stay fixed):

| Situation | Code |
| --- | --- |
| No, malformed, expired, revoked or wrong-project token; session past 7 days; provider not allowed | `UNAUTHORIZED` (401) |
| Google's keys cannot be fetched | `INTERNAL_SERVER_ERROR` (500), so the app does not sign the person out |
| A valid identity without a User row on a User-class procedure | `FORBIDDEN` (403) |
| Missing or malformed `x-organization-id` on an Organization procedure | `BAD_REQUEST` (400) |
| No Membership in that Organization, whether it exists or not; role below the minimum; not `global_admin`; no `can_edit_products` | `FORBIDDEN` (403), with an identical body for an existing and a nonexistent Organization |
| A record ID that belongs to another Organization | `NOT_FOUND` (404), identical to a nonexistent ID |

**Cross-Organization rules:**

- The Organization comes only from the header, checked against the caller's
  Membership. Procedure inputs never carry an Organization ID.
- Business queries filter by `ctx.organization.id`, and referenced records resolve
  within it, so another Organization's IDs look nonexistent. Global Products are the
  approved exception (ORG-008, PRO-012). Same-Customer funding rules (ORG-009) are
  business rules that T01's writers enforce.
- The actor of every write and audit entry is `ctx.user.id`.
- No CORS and no cookies: the app and the API share an origin, and bearer tokens in
  headers need no CSRF defence.

### AU-10 Signed in without a Membership

**Recommendation:**

- A verified Google account that is not the bootstrap and has no User row gets **no
  row**. Nothing about the visitor is stored; only the default request log line
  (status, procedure, no email) remains. A User whose last Membership was deleted is
  treated the same way.
- `session.get` answers `{ status: "noAccess" }` with no profile data. The app signs
  out of Firebase first, so no session lingers, then shows the Login page's state 4
  with the email from the Google account: "This account doesn't have access … Ask the
  administrator to add you, or use another Google account." "Use another Google
  account" starts Google's account chooser (`prompt: "select_account"`).
- Adding people waits for invitations (TBD), so today an administrator cannot act on
  the request; the copy stays in the catalogs for that change.
- A `global_admin` without any Membership also gets `noAccess` in the app: platform
  procedures exist in the API, but no platform screen exists yet.

**Alternative:** create a User row for every Google sign-in. Rejected: anyone with a
Google account could add rows, and a row alone grants nothing.

### AU-11 Test sign-in policy

**Recommendation:**

- **Opt-in:** `AUTH_TEST_SIGN_IN=enabled` makes the API accept `custom` tokens. Only
  the committed `.env.test` sets it; `.env.development` does not need it, because
  developers sign in with Google. `compose.yaml` never maps it, so the parity stack
  and production accept Google only. Any other value is a configuration error.
- **Second lock:** the API refuses to start when the opt-in is set and `NODE_ENV` is
  `production`, or unset (the API's default is production). Playwright's API sets
  `NODE_ENV=test`.
- **Separate project:** custom tokens are signed for `storage-minis-dev`; the
  production project never accepts them, because its API never sets the opt-in.
- **Keyless minting:** only Playwright's setup mints tokens, in Node on the developer's
  machine, with `firebase-admin`'s `createCustomToken` signing through IAM as the
  dedicated service account `e2e-custom-tokens@storage-minis-dev.iam.gserviceaccount.com`.
  That account has no project roles; each developer's Google account holds
  "Service Account Token Creator" on it, and signs with Application Default
  Credentials from `gcloud auth application-default login`. No key file exists, and the
  API never mints tokens.
- **Test users** have uids starting `e2e-`, so the dev project's user list shows them
  clearly. They have no email. As defence in depth, the API accepts a `custom` token
  only when its `sub` starts with `e2e-`.
- **Web entry point:** the page-side call to `signInWithCustomToken` exists only in
  development builds (SI-17).

### AU-12 Acceptance cases

| # | Given / when | Then | Evidence (plan) |
| --- | --- | --- | --- |
| 1 | No Organization exists; the configured owner signs in with Google | User (`global_admin`, `can_edit_products`), Organization (name, nickname, BRL), owner Membership and audit rows exist; the app opens `/app` | `test:api`; manual dev sign-in |
| 2 | The owner signs in again | No new rows | `test:api` |
| 3 | Two first requests arrive at once | One bootstrap; both answer with the same session | `test:api` race |
| 4 | Another Google account signs in first | No rows; "No access"; signed out of Firebase | `test:api`; Playwright |
| 5 | An Organization exists; a token with the owner's email but a new uid arrives | No bootstrap; "No access" | `test:api` |
| 6 | A `custom` or unverified-email token claims the owner's email | No bootstrap | `test:api` |
| 7 | Active use past the 1-hour token expiry | The link's `getIdToken()` refreshes; the request succeeds without a sign-in | Prototype refresh; Playwright with a fast-forwarded clock |
| 8 | A tab stays open and idle | No refresh or API request while idle | Playwright network listener |
| 9 | Return after 3 days | The first action refreshes and works | Unit test of the age rule; Playwright clock |
| 10 | Return after 8 days | The saved session is deleted before Firebase loads it; no Google request; `/login` with "Your session ended" | Playwright clock + network listener |
| 11 | The 7 days pass while a tab is open | The next action signs out without a refresh; a token that still reaches the API gets 401 | Web unit test; `test:api` |
| 12 | Sign out | This browser and its other tabs signed out; another browser stays signed in | Playwright, two contexts |
| 13 | Sign out of all devices | Every session's next request gets 401, this one included | `test:api`; Playwright, two contexts |
| 14 | An operator sets `sessions_valid_after` | That User's sessions end at their next request | `test:api` |
| 15 | A Membership is deleted while signed in | The next Organization request gets 403; the app reloads the session and shows "No access" | `test:api`; web unit test |
| 16 | The header names another or a nonexistent Organization | 403 with identical bodies | `test:api` |
| 17 | A record ID of another Organization | 404, as for a nonexistent ID | `test:api` probe procedure; business procedures later |
| 18 | A `viewer` calls an `editor` procedure; an `editor` calls an `owner` procedure | 403; the right role succeeds | `test:api` probe procedures |
| 19 | A `global_admin` without Membership | API: no Organization data, platform procedures allowed. App: "No access" until platform screens exist | `test:api` probe procedures |
| 20 | Existing-Product edit without `can_edit_products`; new-Product registration as `editor` | 403; allowed | Enforcement helper in `test:api` now; the Product workflows' own issues later |
| 21 | A `custom` token without the opt-in; with it under `NODE_ENV=test`; the opt-in with `NODE_ENV=production` | 401; accepted; the API refuses to start | Unit and config tests |
| 22 | A lost Google account goes through the AU-06 procedure | The new account keeps role and Memberships; the old uid has no User row, so `session.get` answers `noAccess` and guarded procedures 403 | `test:api` runs the documented SQL |
| 23 | A public procedure receives an invalid token | Ignored; the procedure answers | `test:api` |
| 24 | Popup blocked; in-app browser | Redirect where allowed, otherwise an alert; the Login page's state 3 | Web unit tests; Playwright with a user-agent override |
| 25 | An `editor` without `can_edit_products` manages photos of their own Organization's unit; a member of another Organization tries | Allowed through the Organization class alone; 404 for the other Organization's unit | `test:api` probe procedure now; the photo workflow's issue later |

## 3. Impact on approved documents and issues

- **Technical direction, Authentication:** replaces "T02 still needs …" with this
  record's outcome once approved.
- **W6:** firebase 13.2.0 raised the SDK's refresh margin from 30 seconds to 5 minutes,
  so `getIdToken()` refreshes a token that expires within 5 minutes.
- **W8:**
  - the startup mechanism is AU-03's check 1; the session limit adds checks 2 and 3;
  - the custom-token opt-in narrows from "the committed development and test env
    files" to `.env.test` alone;
  - the opt-in gains a second lock: W8 said it applies "whatever `NODE_ENV` says",
    and AU-11 refuses it with `NODE_ENV` `production` or unset;
  - custom tokens are accepted only for `e2e-` uids;
  - "phones use redirect" becomes "a coarse primary pointer uses redirect" (phones
    and tablets), once `authDomain` is the app's own domain (plan SI-11).
- **P5-06:** identity is verified in the guarded builders' middleware, not in
  `createContext`; the context carries the raw header strings (plan SI-06). Step 5's
  rule that tRPC modules import only types from `@storage-minis/db` stays: the
  queries live in an identity store that the lifecycle builds and injects.
- **Implementation guide gate:** "Protected procedures or administrator bootstrap"
  becomes satisfied by this record and the plan; the nickname and currency columns
  cross the "Business schema migrations" gate by explicit exception (AU-07).
- **Requirements:** AU-08 and AU-10 refine ORG-005 and ORG-008 without changing them.
  Under the owner's rule that approved business rules get a new requirements version,
  they could be published in requirements v0.9 with the next business change. That
  question was still open at approval (2026-11-04).
- **Issues:** #22's required outputs map to AU-01–AU-12; #117 gets its columns and its
  bootstrap creation; #26 gets the authorization seam; #118's PR 3 becomes PRs 3a and
  3b (plan SI-01).

## 4. Left to others

- **Invitations, user management, a second administrator, nickname rename screens:**
  TBD until the website is developed (owner, 2026-11-01).
- **Nickname rules:** D04/E10 replace the provisional rule (plan SI-04).
- **Exceptional correction authority:** D06.
- **Typed audit for identity changes:** T01.
- **Production domain, `authDomain` switch, CSP, real phones:** T04 and frontend PR 4.
- **CI credentials:** CI is open; Workload Identity Federation can impersonate the same
  no-role service account without keys.
- **Active Organization persistence:** W5's deferred decision, once a User has several
  Memberships.

## Sources

Consulted 2026-11-03.

- Firebase: [verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens),
  [manage user sessions](https://firebase.google.com/docs/auth/admin/manage-sessions),
  [create custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens),
  [authentication state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence),
  [custom dependencies](https://firebase.google.com/docs/auth/web/custom-dependencies),
  [Google sign-in on the web](https://firebase.google.com/docs/auth/web/google-signin),
  [account linking](https://firebase.google.com/docs/auth/web/account-linking),
  [rules and auth](https://firebase.google.com/docs/rules/rules-and-auth)
  (`sign_in_provider` values), [limits](https://firebase.google.com/docs/auth/limits),
  [`BaseAuth.verifyIdToken`](https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.baseauth),
  [JavaScript SDK release notes](https://firebase.google.com/support/release-notes/js).
- Google: [OpenID Connect](https://developers.google.com/identity/protocols/oauth2/openid-connect)
  (`sub`, `prompt=select_account`),
  [account recovery](https://support.google.com/accounts/answer/7682439),
  [service account impersonation](https://docs.cloud.google.com/docs/authentication/use-service-account-impersonation),
  [service account permissions](https://docs.cloud.google.com/iam/docs/service-account-permissions).
- Package source: `@firebase/auth` 1.13.9 (`initializeCurrentUser`,
  `reloadAndSetCurrentUserOrClear`, `_reloadWithoutSaving`, `_shouldInitProactively`,
  `PersistenceUserManager`), `firebase-admin` 14.5.0 (`token-verifier.js`).
- Prototype: the plan's [research and evidence](sign-in-plan-2026-11-03.md#research-and-evidence-2026-11-03).
