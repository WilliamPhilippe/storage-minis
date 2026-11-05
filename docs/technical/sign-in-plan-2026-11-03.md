# Sign-in plan — Google sign-in across the API and the web app (2026-11-03)

**Status: approved by the owner on 2026-11-04 as recommended; not yet
implemented.** The approval record is in
[technical direction](technical-direction.md#t02-record-and-sign-in-plan-approval-2026-11-04),
and [Approval](#approval-2026-11-04) records the owner's answers given after it. This plan delivers [T02's record](t02-authentication-record-2026-11-03.md)
(AU-01–AU-12) as one feature across the API, the database and the web app: frontend
PR 3 of the [frontend foundation decisions](frontend-foundation-proposal-2026-11-01.md)
(W11 item 3), which the owner asked on 2026-11-02 to plan end to end. It follows the
[implementation guide's planning rules](technical-foundation-implementation-guide.md#instructions-for-every-agents-plan)
and the structure of the [web shell plan](web-shell-plan-2026-11-01.md). SI-01–SI-19 are
references within this plan, not requirement, issue or F-decision IDs.

## Recommended decisions

| ID | Recommendation |
| --- | --- |
| SI-01 | Two implementation PRs after this docs PR: **3a** API identity and authorization (API, schema, bootstrap, Vitest); **3b** web sign-in (Firebase, session, Login states, a Sign out button, Playwright). Each leaves the repository working. |
| SI-02 | Pins: `jose` 6.2.15 (API), `firebase` 13.2.0 (web), `firebase-admin` 14.5.0 (web devDependency, end-to-end setup only), `zod` 4.6.7 (web devDependency, config check). Two `allowBuilds: false` entries for install scripts we don't need. |
| SI-03 | API settings `FIREBASE_PROJECT_ID` (required), `AUTH_TEST_SIGN_IN`, `BOOTSTRAP_*`; web values in committed `apps/web/.env.development` and `.env.production`, checked when Vite starts; Turborepo entries for each. |
| SI-04 | One migration: `organizations.nickname` (unique, provisional format) and `organizations.currency` (`BRL` default, `USD`), and `users.sessions_valid_after`. |
| SI-05 | The API verifies ID tokens with `jose` against Google's JWK set: RS256, issuer, audience, required claims, no future `iat` or `auth_time`, the 7-day limit, the provider allowlist and the revocation cutoff. |
| SI-06 | The tRPC context carries the raw `authorization` and `x-organization-id` headers, the verifier and an identity store that the lifecycle builds, so tRPC modules still import only types from the DB package; guarded builders in `trpc/procedures.ts` verify and authorize; public builders stay module-private. |
| SI-07 | `session.get` (query: the User, Memberships, or `noAccess`, with the bootstrap). `session.signOutEverywhere` moves to #130 (owner, 2026-11-04). |
| SI-08 | The bootstrap as one transaction under an advisory lock, with its audit rows. |
| SI-09 | Firebase loads lazily on `/login` and `/app` only; `initializeAuth` with local persistence and no resolver at startup; the popup and redirect resolver is passed per call on the Login page. |
| SI-10 | The startup check reads Firebase's saved record before `initializeAuth` and deletes it past 7 days or when unreadable. |
| SI-11 | The Login page: redirect only where `authDomain` is the page's own host and the primary pointer is coarse, otherwise popup; states 2–4; in-app browser detection; error alerts. |
| SI-12 | The `/app` guard, the session context, the token and Organization headers in the tRPC link, and the handling of `UNAUTHORIZED` and `FORBIDDEN`. |
| SI-13 | A Sign out button: top right of the TopBar on desktop, at the bottom of the menu drawer on phones. The account menu, the user badge (#1) and Sign out of all devices move to #130 (owner, 2026-11-04). |
| SI-14 | Both browser API keys restricted to their sites and to the Identity Toolkit and Token Service APIs; the owner applies them in the console during PR 3b. |
| SI-15 | Test custom tokens are signed through IAM as the no-role `e2e-custom-tokens` service account with each developer's gcloud Application Default Credentials. No key file and no Doppler locally. |
| SI-16 | API tests: unit tests with a local key set inside `pnpm check`; an auth integration file in `pnpm test:api` on the migrated test database; a shared test-database helper exported by the DB package. |
| SI-17 | Playwright: a setup project that migrates and seeds the test database, mints custom tokens, signs in through a development-only hook and saves the session with IndexedDB; new signed-out and signed-in specs. |
| SI-18 | What PR 4 (web image) must add for redirect sign-in: the Caddy `/__/auth/` proxy, the `authDomain` switch, the OAuth redirect URI, authorized domains, key referrers and the CSP. |
| SI-19 | This docs PR first, with the approval record; then PRs 3a and 3b in ordered commit groups. |

## Approval (2026-11-04)

The owner approved SI-01–SI-19, with T02's record (AU-01–AU-12), as recommended on
2026-11-04. Before approving, they asked why the API uses `jose` rather than
`firebase-admin`; the answer is SI-02's and SI-05's reasoning. The owner answered the
two questions left open at approval the same day:

1. **The development Organization** is named `wipminis`, with the nickname
   `wipminis` and BRL, in PR 3a's `.env.development` (SI-03).
2. **Requirements v0.9:** AU-08's role capabilities and AU-10's no-access rule stay
   in T02's record only for now
   ([record, section 3](t02-authentication-record-2026-11-03.md#3-impact-on-approved-documents-and-issues)).

### Owner changes after the gap review (2026-11-04)

After approval, the owner reviewed six gaps in this plan and decided:

1. **Failed token refreshes in the browser** (offline versus a session Google ended)
   become a separate feature: [#128](https://github.com/WilliamPhilippe/storage-minis/issues/128)
   under the new [Epic E14 / #127](https://github.com/WilliamPhilippe/storage-minis/issues/127).
2. **Records of revocations and identity rebinds** become
   [#129](https://github.com/WilliamPhilippe/storage-minis/issues/129) in the same epic.
3. **PR 3b adds only a Sign out button,** top right on desktop and at the bottom of the
   menu drawer on phones (SI-13). The account menu, the user badge (#1), "Sign out of
   all devices" with `session.signOutEverywhere`, and the design documents' update
   move to [#130](https://github.com/WilliamPhilippe/storage-minis/issues/130).
4. **Google outages** are accepted: the app depends on Google, which is more reliable
   than this service. `/health/ready` stays database-only.
5. **Google's consent screen** for production becomes
   [#131](https://github.com/WilliamPhilippe/storage-minis/issues/131).
6. **Translations:** every en-US string a PR creates gets its pt-BR translation in
   the same PR, written by the implementing agent. This is now a repository convention
   (AGENTS.md).

The owner also accepted the assumptions the plan listed as unverified (the
`firebaseapp.com` key referrer, redirect with the resolver passed per call, Google's
"G" mark, the popup spec, the outside-origin list, other blocked install scripts);
PR 3b's verification steps still exercise them. Deleting personal data on request is
out of scope, because the system is for internal use.

### What approval changes in approved documents

- **W11:** PR 3 becomes PRs 3a and 3b (SI-01).
- **W6:** firebase 13.2.0 raised the SDK's refresh margin from 30 seconds to 5 minutes.
- **W8:**
  - confirms the startup mechanism (SI-10); development signs in on
    `http://localhost:5173`;
  - the custom-token opt-in lives only in `.env.test`, is refused with `NODE_ENV`
    `production` or unset, and accepts only `e2e-` uids (AU-11);
  - redirect follows a coarse primary pointer (phones and tablets) rather than
    "phones" (SI-11).
- **W10:** the web values live in Vite's committed mode files, not in Turbo's `env`
  list (SI-03).
- **P5-06:** identity is verified in guarded middleware, not in `createContext`
  (SI-06). Step 5's rule that tRPC modules import only types from
  `@storage-minis/db` is kept by injecting an identity store.
- **Implementation guide gates:** "Protected procedures or administrator bootstrap"
  is met by T02's record; the nickname and currency columns cross the "Business
  schema migrations" gate by explicit exception (SI-04).
- **#117:** its schema dependency on T01 is delivered here for the two columns.
- **Login design, state 4:** a custom-token test user has no email, so the alert's
  text omits it in that case.
- **TopBar design:** PR 3b shows a Sign out button where the account menu will go;
  the account menu follows in #130 (SI-13).
- **Firebase Analytics:** both projects have it enabled; the app never loads it, and
  the config omits `measurementId`.

## 1. Starting state

- `main` is at `8933b9c` (the web shell follow-up, #125), after frontend PR 2
  (Playwright, #124), the Playwright plan (#122), the web shell (#121) and
  requirements v0.8 (#116).
- **API:** `/trpc` with one public diagnostic procedure, `diagnostics.echo`; the
  context is `{ db, requestId }`; `init.ts` exports tRPC's root object and no
  procedure builder. No token is read anywhere. Request logs already redact
  `authorization` and `cookie`.
- **Schema:** `users` (`firebase_uid` unique, `email`, `display_name`, `role` default
  `user`, `can_edit_products` default false), `organizations` (`id`, `name`,
  `created_at`; no nickname or currency), `memberships` (unique
  `(organization_id, user_id)`, `role`). `business_events` and
  `business_event_changes` exist; a change names exactly one subject, and
  `membership_user_id` is one of them.
- **Web:** `/login` renders state 1 with an inert button; `/app` is open and holds only
  placeholders; `lib/trpc.ts` has `httpLink({ url: "/trpc" })` with no headers;
  nothing imports Firebase.
- **Playwright:** 48 tests, 23 in `desktop-chrome` and 25 in `pixel-7`; the API
  server gets an explicit `env`; `/app` specs import `test` from `e2e/support/app.ts`, PR 3's plug-in point
  (PW-13). `test:e2e` does not migrate the test database.
- **Firebase (checked 2026-11-04 UTC with each web key):** `storage-minis-dev` has
  Google enabled and authorizes `localhost`, `storage-minis-dev.firebaseapp.com` and
  `storage-minis-dev.web.app`; `storage-minis` authorizes only its own two domains.
  The owner created `e2e-custom-tokens` in the dev project with no project roles, and
  holds Service Account Token Creator on it; the owner's Mac has the gcloud CLI
  (Homebrew).
- **No blocker** for PR 3a. PR 3b needs the owner's console changes in SI-14 and each
  developer's gcloud setup in SI-15.

Approvals this plan inherits are listed in
[T02's record, section 1](t02-authentication-record-2026-11-03.md#1-carried-forward-approved-not-reopened),
plus PW-01–PW-14 for Playwright and WS-01–WS-13 for the web shell.

## 2. Scope

### PR 3a — API identity and authorization

**Delivers:** token verification with the 7-day limit, the provider allowlist and
revocation; the guarded procedure classes and the Organization header check; the
session procedures with the bootstrap; the migration; configuration; unit and
integration tests; documentation. The web app is unchanged and keeps working:
nothing it calls becomes protected.

```text
.env.development  .env.test           FIREBASE_PROJECT_ID; development BOOTSTRAP_* (SI-03)
compose.yaml                          FIREBASE_PROJECT_ID only
turbo.json                            pass-through entries
apps/api/src/
├── config.ts                         auth and bootstrap settings (SI-03)
├── lifecycle.ts                      builds the verifier and the identity store
├── app.ts                            passes them to the tRPC plugin
├── auth/
│   ├── id-token.ts                   jose verifier (SI-05)
│   └── store.ts                      User, cutoff, Membership, revocation and
│                                     bootstrap queries; the only runtime DB import
└── trpc/
    ├── init.ts  context.ts           context with raw headers (SI-06)
    ├── procedures.ts                 identity, User, Organization, platform builders
    ├── router.ts                     adds `session`
    └── routers/session.ts            (SI-07)
apps/api/tests/auth.integration.test.ts   with a migrating global setup (SI-16)
apps/api/tests/fixtures, process and stack tests   FIREBASE_PROJECT_ID
apps/web/playwright.config.mts        passes FIREBASE_PROJECT_ID to its API only
packages/db/
├── src/schema/enums.ts  identity-and-access.ts
├── testing/                          shared test-database preparation, compiled
│                                     outside `files` (SI-16)
├── tests/schema.integration.test.ts  Organization fixtures gain a nickname
└── drizzle/0002_…sql, snapshot, journal
docs/database/schema.dbml
```

### PR 3b — web sign-in and the Playwright session

**Delivers:** popup sign-in and the redirect code; the startup check; the session
context with the active Organization; the token and Organization headers; the `/app`
guard; the Login page's states 2–4 and error alerts; a Sign out button; the
Playwright test sign-in behind its opt-in; documentation.

```text
pnpm-workspace.yaml                   allowBuilds: false entries (SI-02)
.gitignore  turbo.json  .env.test     web env files, inputs, opt-in, signer (SI-03, SI-15)
apps/web/
├── .env.development  .env.production VITE_FIREBASE_* (SI-03)
├── vite.config.mts                   checks them with Zod
├── playwright.config.mts             setup project, API opt-in (SI-17)
├── e2e/
│   ├── auth.setup.ts                 migrate, seed, mint, sign in, save
│   ├── support/app.ts  session.ts    storage state; seed and mint helpers
│   ├── signed-out/sign-in.spec.ts    guard, popup hand-off, states 3–4
│   └── app/session.spec.ts           sign-out, expiry, refresh, idle
└── src/
    ├── vite-env.d.ts                 the four VITE_FIREBASE_* types
    ├── lib/session/
    │   ├── config.ts                 the web config
    │   ├── firebase.ts               lazy Firebase module (SI-09)
    │   ├── savedSession.ts           startup check (SI-10)
    │   ├── signInMethod.ts           popup or redirect; in-app browser (SI-11)
    │   ├── session.ts                ensure, auth_time, sign-out, listeners (SI-12)
    │   └── testSignIn.ts             development-only hook (SI-17)
    ├── lib/trpc.ts                   headers; UNAUTHORIZED and FORBIDDEN handling
    ├── router.tsx                    session in the router context
    ├── routes/app/route.tsx  routes/login.tsx   guard; validated search params
    ├── features/login/               states 2–4, Google's mark, errors
    ├── features/shell/SignOutButton.tsx  TopBar.tsx  MenuFab.tsx   (SI-13)
    └── i18n/{en-US,pt-BR}/{login,app}.ts
```

**Excluded:**

- **PR 4 (web image):** Caddy, the `/__/auth/` proxy, the production `authDomain`, the
  CSP, signed-out Playwright against the parity stack and the manual redirect check
  (SI-18).
- **T04:** the production domain, Doppler `prd` keys, real phones and Safari.
- **Their own issues:** invitations, user and role management screens, the nickname
  rename procedure, the Organization switcher, business procedures and the catalog.
- **Not planned:** Firebase Analytics, the Auth emulator, App Check, session cookies,
  server-side Firebase Admin credentials.

## 3. Database structure

Added on 2026-11-04 at the owner's request. It collects in one place what the database
keeps for sign-in and sessions, what it does not keep, and why. It adds no decision:
everything here follows from AU-01, AU-05, SI-04 and SI-06–SI-08. Sign-in adds one
column, `users.sessions_valid_after`.

### Where session state lives

| Item | Built and signed by | Kept in | Reaches the API |
| --- | --- | --- | --- |
| **ID token:** a JWT, RS256, valid for one hour | Firebase Authentication, with Google's private keys | The browser's IndexedDB, through the Firebase SDK (AU-02) | On every guarded request, as `Authorization: Bearer`; verified, never stored or logged |
| **Refresh token:** an opaque string | Firebase Authentication | The browser's IndexedDB | Never. The SDK exchanges it at `securetoken.googleapis.com` for a new ID token |
| **Firebase user record:** uid, email, Google link, last sign-in, disabled flag | Firebase Authentication | The Firebase project (console: Authentication → Users) | Never read by the API |
| **Test custom token:** a JWT, RS256, at most one hour | The Playwright setup, signed through IAM as `e2e-custom-tokens` (SI-15) | Nowhere; exchanged once for an ID token | Never. The ID token it yields does, with `sign_in_provider: "custom"` (AU-11) |
| **User, Membership and Organization rows** | The API | PostgreSQL | Read on each guarded request (SI-06) |

### Tokens: built by Google, not by us

- **Nothing in production builds a token of ours.** Firebase fixes an ID token's
  claims. The only way to add claims is Firebase's custom claims, set through the
  Admin SDK, which this plan does not use (see below).
- **The API holds no signing key.** It checks the signature with Google's public keys
  (SI-05), so it trusts the claims without calling Firebase.
- **Claims the API reads:**

  | Claim | Content | Used for |
  | --- | --- | --- |
  | Header `alg`, `kid` | RS256; the Google key that signed it | The signature check (SI-05) |
  | `iss`, `aud` | `https://securetoken.google.com/<projectId>`; `<projectId>` | Only the configured project (AU-01) |
  | `sub` (equal to `user_id`) | The Firebase uid, 1–128 characters | The lookup key, `users.firebase_uid` |
  | `iat`, `exp` | Issue time; expiry one hour later | Token expiry; no future `iat` |
  | `auth_time` | The last Google sign-in; a refresh keeps it | The 7-day limit (AU-03) and the revocation cutoff (AU-05) |
  | `firebase.sign_in_provider` | `google.com`, or `custom` for test sign-ins | The provider allowlist (AU-01, AU-11) |
  | `email`, `email_verified` | The Google account's address | The bootstrap's one-time match (AU-07); copied to `users.email` |
  | `name` | The Google profile name | Copied to `users.display_name` |

  `picture` and `firebase.identities` arrive too and are unused. Custom-token sign-ins
  carry no `email` or `name`.
- **The test custom token** is the only token we build: `iss` and `sub` are the
  service account's email, `aud` is Identity Toolkit's URL, `uid` starts with `e2e-`,
  `exp` is at most an hour after `iat`, and it has no extra claims. It goes only to
  Firebase, which returns a normal ID token.

### What Firebase asks us to keep

Nothing is required. Firebase keeps the user records and the refresh tokens.

- **Revocation time.** Firebase's session guide suggests one optional item: a per-user
  time before which sessions count as revoked, saved where your own checks can read it
  without calling Firebase. Its example uses the Realtime Database; ours is
  `users.sessions_valid_after` (AU-05).
- **Profile and access data.** Firebase's custom-claims guide says custom claims are
  for access control only, and that profile and other data belong in your own storage.
  So email, name, role and Memberships live in PostgreSQL.

### The `users` table after PR 3a

| Column | Type | Written | Read |
| --- | --- | --- | --- |
| `id` | `integer` identity, positive | Bootstrap (later, invitations) | Actor, Membership key |
| `firebase_uid` | `text NOT NULL`, unique (`users_key_1`) | Bootstrap; AU-06 rebind (operator SQL) | Every guarded request: the token's `sub` |
| `email` | `text`, nullable | Bootstrap; `session.get` when a Google token's value differs; AU-06 rebind | `session.get`'s output; never an authorization key |
| `display_name` | `text`, nullable | As `email`, from the token's `name` | `session.get`'s output |
| `role` | `user_role`, default `user` | Bootstrap (`global_admin`) | `platformProcedure` (AU-08) |
| `can_edit_products` | `boolean`, default false | Bootstrap (true) | `requireCanEditProducts` |
| `created_at` | `timestamptz(3)`, default `now()` | Insert | — |
| **`sessions_valid_after`** (new) | `timestamptz(3)`, nullable | Operator SQL (AU-05, AU-06); "Sign out of all devices" in #130 | Every guarded request, with the row: reject `auth_time ≤ ⌈value⌉` |

- **`sessions_valid_after`:**
  - Null means never revoked.
  - Milliseconds, like every timestamp in the schema. The check rounds it up to the
    second because `auth_time` has whole seconds.
  - An operator revokes, for example, with
    `UPDATE users SET sessions_valid_after = now() WHERE id = <user id>;`.
    `local-development.md` documents the exact statement in PR 3a.
- **Per request:** one indexed read of the User by `firebase_uid`, plus one of the
  Membership for Organization procedures (SI-06). No write.
- **Writes:** the bootstrap, once per installation; the profile copy, only when Google's
  values change; the cutoff, only on revocation.
- **Other tables:** `memberships` is unchanged; `organizations` gains `nickname` and
  `currency` (SI-04); the bootstrap's audit goes to `business_events` and
  `business_event_changes` (SI-08).

### Columns not added

| Candidate | Why not |
| --- | --- |
| `token_expires_at` | The token carries `exp`, and the API checks it on every request. A stored copy would describe only one of a User's devices and need a write every hour per device. The 7-day limit comes from the token's `auth_time`, so no `session_expires_at` either. |
| `token_id` | Firebase ID tokens carry no token ID: `jti` is not among their claims, and Firebase reserves the name, so custom tokens cannot add it. Revocation works per User by time, not per token, so nothing needs one. A per-token deny list would need a write on every refresh. |
| The refresh token | It never leaves the browser and Firebase. Storing it would make the database a credential store. |
| `last_sign_in_at` | Firebase's console shows the last sign-in, and no approved requirement needs it in our database. Adding it would be a new decision. |
| A `sessions` table, one row per device | AU-01 chose none. Such a table would allow listing devices and signing out one device, which nobody asked for. Firebase gives no device ID, so the app would register each sign-in and the API would write on each. |
| Roles in Firebase custom claims | A custom claim reaches the token only when a new one is issued, up to an hour later. Claims are limited to 1,000 bytes and would copy the Memberships. A deleted Membership must apply at the next request (AU-05), so roles stay in PostgreSQL. |

## 4. Decisions

### SI-01 Delivery split

**Recommendation: two implementation PRs,** after this docs PR merges.

| PR | Contents | Works end to end because |
| --- | --- | --- |
| **3a — API identity and authorization** | SI-03 (API part), SI-04–SI-08, SI-16 | Every new procedure is covered by Vitest against real tokens' shapes and the real test database; the web app calls only `diagnostics.echo`, which stays public. |
| **3b — web sign-in** | SI-02 (web part), SI-03 (web part), SI-09–SI-15, SI-17 | Guarding `/app` and seeding a session for Playwright must land together, or PR 2's `/app` specs fail. |

**Alternatives:** one PR (W11 as written), larger to review and blocked on the owner's
console steps; three PRs with the migration alone, which would merge columns nothing
writes.

**Issue mapping:**

| Issue | This plan delivers | Still open afterwards |
| --- | --- | --- |
| [#22 T02](https://github.com/WilliamPhilippe/storage-minis/issues/22) | The record (this docs PR); AU-01–AU-12 enforced (3a, 3b) | Invitations, role management, D06 privileges |
| [#117 E01.04](https://github.com/WilliamPhilippe/storage-minis/issues/117) | The nickname and currency columns, uniqueness, the bootstrap's creation (3a) | Rename by `global_admin` with audit, catalog resolution, D04's nickname rules, a database guard on currency changes |
| [#26 T06](https://github.com/WilliamPhilippe/storage-minis/issues/26) (closed by PR #107's link) | Application authorization and Organization isolation seams with tests (3a) | Representative business transactions and races, CI |
| [#118 E13.02](https://github.com/WilliamPhilippe/storage-minis/issues/118) | PR 3 (3a + 3b) | PR 4 |
| [#1](https://github.com/WilliamPhilippe/storage-minis/issues/1) | Nothing: the badge moved to #130 | #130 closes it |
| [#127 Epic E14](https://github.com/WilliamPhilippe/storage-minis/issues/127) | The base its children build on | #128 failed refreshes, #129 revocation records, #130 the account menu, #131 Google's consent screen |

PR descriptions use "Part of" links and no closing keywords.

### SI-02 Packages and pins

Each version is the newest at least 24 hours old (pnpm 12's release age) on
2026-11-04, so no `minimumReleaseAgeExclude` entry is needed. Re-check at
implementation, and check `pnpm-workspace.yaml` after every `pnpm add`.

| Package | Version | Where | Published (UTC) | Notes |
| --- | --- | --- | --- | --- |
| `jose` | 6.2.15 | `apps/api` dependencies | 2026-11-01 22:28 | No dependencies, 0.2 MiB; JWKS caching built in |
| `firebase` | 13.2.0 | `apps/web` dependencies | 2026-11-02 18:16 | `@firebase/auth` 1.13.9. 183 MiB unpacked on disk (all Firebase products); 24–28 KiB gzip lazy chunk for Auth |
| `firebase-admin` | 14.5.0 | `apps/web` devDependencies | 2026-09-23 | `createCustomToken` in Playwright's setup only; 67 MiB with its optional Cloud Storage and Firestore dependencies; never in an image or bundle |
| `zod` | 4.6.7 | `apps/web` devDependencies | (the API's pin) | Validates the web config in `vite.config.mts` |

```sh
pnpm --filter @storage-minis/api add --save-exact jose@6.2.15
pnpm --filter @storage-minis/web add --save-exact firebase@13.2.0
pnpm --filter @storage-minis/web add --save-exact --save-dev firebase-admin@14.5.0 zod@4.6.7
```

**Install scripts.** pnpm 12 stops `pnpm add` with `ERR_PNPM_IGNORED_BUILDS` for
`@firebase/util@1.15.3` (its postinstall reads `FIREBASE_WEBAPP_CONFIG`, for Firebase
App Hosting) and `protobufjs@7.6.6` (a version check, from `firebase-admin`'s optional
Firestore). Neither is needed, so `pnpm-workspace.yaml` adds, next to the esbuild
entry:

```yaml
allowBuilds:
  "@firebase/util@1.15.3": false
  "protobufjs@7.6.6": false
```

In the prototype, a fresh `pnpm install --frozen-lockfile` with these entries
exited 0.

**Alternatives:**

- **`firebase-admin` in the API** instead of `jose`: official and checks the same
  claims (the prototype verified with only a project ID), but adds about 67 MiB to the
  API image's 45 MiB `node_modules` and buys nothing without server credentials
  (AU-05).
- **`@firebase/app` and `@firebase/auth` directly** instead of `firebase`: about
  20 MiB on disk instead of 183, but Firebase documents only the `firebase` package as
  the entry point.
- **`gcloud iam service-accounts sign-jwt`** from the setup instead of
  `firebase-admin`: no npm dependency, but our own code would assemble the custom
  token's claims.

### SI-03 Configuration

**API** (`readApiConfig`; error messages name variables, never values):

| Variable | Rule | `.env.development` | `.env.test` | `compose.yaml` | Production (T04, Doppler `prd`) |
| --- | --- | --- | --- | --- | --- |
| `FIREBASE_PROJECT_ID` | Required; Firebase project ID format | `storage-minis-dev` | `storage-minis-dev` | `${FIREBASE_PROJECT_ID:?Set FIREBASE_PROJECT_ID}` | `storage-minis` |
| `AUTH_TEST_SIGN_IN` | Unset or `enabled`; rejected with `NODE_ENV` `production` or unset | — | `enabled` (3b) | never mapped | never set |
| `BOOTSTRAP_OWNER_EMAIL` | An email; all three `BOOTSTRAP_*` or none | `ctt.williamphilippe@gmail.com` | — | not mapped until T04 | the same email |
| `BOOTSTRAP_ORGANIZATION_NAME` | 1–100 characters | `wipminis` | — | not mapped until T04 | the owner's choice |
| `BOOTSTRAP_ORGANIZATION_NICKNAME` | SI-04's provisional rule | `wipminis` | — | not mapped until T04 | the owner's choice |
| `BOOTSTRAP_ORGANIZATION_CURRENCY` | `BRL` (default) or `USD` | — | — | not mapped until T04 | — |

- `compose.yaml`'s `${FIREBASE_PROJECT_ID:?}` is interpolated for every local Compose
  command, which is why both committed files set it. The parity stack reads `.env.test`,
  so it verifies against the dev project, accepts Google only and never bootstraps.
- **`BOOTSTRAP_*` stay out of `compose.yaml`:** `${VAR:-}` would pass empty strings,
  which the config rejects as it rejects an empty `NODE_ENV`. T04 maps them with
  production's Doppler keys.
- **Turborepo:** the API's `dev`, `start` and `test:process` tasks pass through
  `FIREBASE_PROJECT_ID` and the four `BOOTSTRAP_*` names. No task passes
  `AUTH_TEST_SIGN_IN`, so a shell variable cannot enable custom tokens for
  `pnpm dev`'s API and the development database.
- **Playwright's API server** (3a) gets `FIREBASE_PROJECT_ID` from `.env.test`, as it
  gets `DATABASE_URL`; 3b adds `AUTH_TEST_SIGN_IN` the same way, read from the file,
  not from the environment.
- **Owner input (2026-11-04):** the development Organization is `wipminis`, as both
  name and nickname; it passes SI-04's rule.

**Web** (W10): `apps/web/.env.development` (the dev project) and `.env.production`
(the production project), Vite's mode files, committed:

```sh
# apps/web/.env.production: public identifiers (W10), never Doppler.
VITE_FIREBASE_API_KEY=AIzaSyAvbSTh4RONUFvo-IWspa43HCOPPXH0vy4
VITE_FIREBASE_AUTH_DOMAIN=storage-minis.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=storage-minis
VITE_FIREBASE_APP_ID=1:893489472030:web:1724dfdb84174025bc440f
```

`.env.development` holds `AIzaSyBLhvp2F6AN1sPa4KOJo-vp5w3R4m_3SJc`,
`storage-minis-dev.firebaseapp.com`, `storage-minis-dev` and
`1:267678379637:web:a7434c74b65d22a45bd23c`. No `measurementId`.

- `vite.config.mts` loads them with `loadEnv` and checks them with a Zod schema when
  serving or building, so a missing value stops `pnpm dev` and `pnpm build` with the
  variable's name. The `web-unit` Vitest project does not read `vite.config.mts`, and
  its tests mock the session module.
- **`.gitignore`:** its `!.env.development` already matches
  `apps/web/.env.development`; one line, `!apps/web/.env.production`, allows the
  other.
- **Turborepo:** both files are committed, so the web tasks' default inputs already
  hash them; `turbo.json` needs no change for them. Vite would let a shell `VITE_*`
  variable or a gitignored `.env.local` override a file value, and Turbo would not
  hash either (PR 1's handoff). Nobody sets them, the README says not to, and the
  `vite.config.mts` check validates the values whatever their source.
- **Alternative:** a typed TypeScript module with both configs, selected by
  `import.meta.env.MODE`. Simpler, but it replaces W10's `VITE_*` values.

### SI-04 Schema migration

**Recommendation:** one generated migration (`pnpm db:generate`, reviewed, committed
with its snapshot and journal):

| Change | Detail |
| --- | --- |
| `organization_currency` enum | `BRL`, `USD` |
| `organizations.currency` | `organization_currency NOT NULL DEFAULT 'BRL'` |
| `organizations.nickname` | `text NOT NULL`; unique (`organizations_key_1`); check `organizations_nickname_format` |
| `users.sessions_valid_after` | `timestamptz(3)`, nullable (AU-05) |

- **Provisional nickname rule** until D04/E10: 3–30 characters of lowercase ASCII
  letters and digits in groups joined by single hyphens
  (`^[a-z0-9]+(-[a-z0-9]+)*$`). Lowercase-only makes uniqueness case-insensitive in
  effect. D04 may widen or tighten it through a forward migration.
- **Currency immutability:** no procedure changes it. A database guard (trigger) is
  T01's choice, listed as open on #117.
- **Existing rows:** nothing creates Organizations today, so `NOT NULL` without a
  default is safe; a development database with hand-made rows needs `pnpm db:reset`.
- **Existing fixtures:** `packages/db/tests/schema.integration.test.ts` inserts
  Organizations with only a name (around lines 123–127, 327 and 467–472). Those inserts
  gain a nickname. The positive-ID check test must still fail on its own constraint,
  because PostgreSQL checks `NOT NULL` before `CHECK`.
- `docs/database/schema.dbml` gains the three columns and the enum; entity map v0.9
  already describes the nickname and currency.
- **Gate exception:** the implementation guide holds business schema migrations for
  T01. This migration adds only the two approved columns (ORG-010, ORG-011) and one
  technical column, at the owner's explicit approval.

### SI-05 Token verification

**Recommendation:** `apps/api/src/auth/id-token.ts` exports
`createIdTokenVerifier({ projectId, acceptCustomTokens, keys })`, created once by
`lifecycle.ts` from the configuration (SI-06). `keys` defaults to `createRemoteJWKSet(new
URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"))`
with jose's defaults (5 s timeout, 30 s cooldown, 10-minute cache); tests pass a local
key set.

1. **Header:** `Authorization: Bearer <three base64url segments>`, at most 4096
   characters; anything else is `token_missing`.
2. **`jwtVerify`** with `algorithms: ["RS256"]`, `issuer:
   "https://securetoken.google.com/<projectId>"`, `audience: <projectId>`,
   `requiredClaims: ["sub", "iat", "exp", "auth_time"]` and `clockTolerance: 5`
   seconds. jose matches the `kid` against Google's keys and checks `exp`.
3. **Our checks:**
   - `iat` and `auth_time` no later than now + 5 s; jose accepts a future `iat` unless
     `maxTokenAge` is set (prototype);
   - `sub` of 1–128 characters;
   - `now − auth_time ≤ 604,800` s (`session_limit`);
   - `firebase.sign_in_provider` is `google.com`, or `custom` when the opt-in is on
     and `sub` starts with `e2e-` (`provider_rejected`).
4. **Result:** `{ uid, email, emailVerified, name, provider, authTime }`.
5. **Errors:** jose's token errors become a `TRPCError` `UNAUTHORIZED` whose cause is
   an `IdentityRejected` error carrying the reason as its `code` (`token_invalid`,
   `token_expired`, …). The allowlisted serializer then logs `err.code`
   `UNAUTHORIZED` and `err.cause.code` the reason. Key-fetch failures
   (`ERR_JWKS_TIMEOUT`, a failed fetch, an invalid key set) become
   `INTERNAL_SERVER_ERROR`, so a Google outage does not sign people out. The token is
   never logged; request logs already redact `authorization`.

The revocation cutoff (AU-05) is checked where the User row is loaded (SI-06), not
here.

**Why the JWK URL:** jose reads JWK sets, not certificates. Firebase documents the
x509 URL; on 2026-11-04 both URLs served the same two RS256 key IDs.

**Alternatives:** `firebase-admin`'s `verifyIdToken` (SI-02); the x509 URL with
`importX509` and our own cache, which jose already provides.

### SI-06 tRPC context and guarded builders

**Recommendation:**

- **Context** becomes `{ db, requestId, auth }`. `auth` holds:
  - the raw `authorization` and `x-organization-id` header strings (unverified input,
    like procedure input);
  - the verifier;
  - the identity store;
  - the bootstrap settings.
- **Where they are built:** `buildApp`'s dependencies gain `auth`, which `lifecycle.ts`
  builds from the configuration and the pool. Lifecycle already imports
  `@storage-minis/db` at runtime.
- **Identity store** (`auth/store.ts`): `findUser(uid)`, `listMemberships(userId)`,
  `findMembership(userId, organizationId)`, `revokeSessions(userId)`,
  `refreshProfile(userId, email, name)` and `bootstrap(identity, settings)`, as
  Drizzle queries on the schema. It is the only API module besides the lifecycle that
  imports `@storage-minis/db` at runtime.
- **Step 5's rule stays:** the router, procedure and context modules import only types
  from `@storage-minis/db`, and `app.test.ts` and `plugin.test.ts` keep mocking the
  package to throw. Unit tests inject a fake store and a local key set; the
  integration suite injects the real store. "The context exposes `database.db`" is
  kept too.
- **`trpc/procedures.ts`** exports the four guarded builders. Each starts from
  `t.procedure.use(recordProcedure)`:

  | Builder | Middleware | Adds |
  | --- | --- | --- |
  | `identityProcedure` | verify the token | `ctx.identity` |
  | `userProcedure` | plus: load the User by `firebase_uid` (403 if none); reject an `auth_time` not later than `sessions_valid_after` rounded up to the second (401) | `ctx.user` |
  | `organizationProcedure(minRole)` | plus: parse `x-organization-id` (positive int32 in decimal, else 400); load the Membership joined with its Organization (403 if none or below `minRole`) | `ctx.organization`, `ctx.membership` |
  | `platformProcedure` | `userProcedure` plus `role = global_admin` (403) | — |

- One indexed query per class step: users by `users_key_1`, Memberships by
  `memberships_key_1`. Product-edit procedures later add a `requireCanEditProducts`
  check helper, unit-tested now.
- **Public routers** keep deriving module-private builders, as `diagnostics` does
  (P5-06). `identityProcedure` never treats a missing token as public.
- **Logs:** each rejection is one `request_failed` at info, with `category`, `status`,
  `procedure` and the reason in `err.cause.code` (SI-05). No user ID, email or header
  value is logged.

**Change to P5-06's note:** "T02 adds a verified principal in `createContext`"
becomes verification in the guarded middleware, tRPC's documented pattern. Public
procedures then never pay for, or fail on, a bad token (AU-12 case 23).

### SI-07 Session procedures

**Recommendation:** `apps/api/src/trpc/routers/session.ts`:

- **`session.get`**, a query on `identityProcedure`, no input, a strict output
  schema:

  ```ts
  | { status: "member";
      user: { id: number; displayName: string | null; email: string | null;
              role: "global_admin" | "editor" | "user"; canEditProducts: boolean };
      memberships: { role: "owner" | "editor" | "viewer";
                     organization: { id: number; name: string; nickname: string;
                                     currency: "BRL" | "USD" } }[] }
  | { status: "noAccess" }
  ```

  1. A User with this uid exists: apply the cutoff (401); for a `google.com` token,
     update `email` and `display_name` when they differ from the token's; then return
     its Memberships, or `noAccess` when there are none (a `global_admin` included,
     AU-10).
  2. Otherwise, run the bootstrap (SI-08) when AU-07's conditions hold.
  3. Otherwise return `noAccess`, without writing.
- **`session.signOutEverywhere`** moved to #130 with the account menu (owner,
  2026-11-04). When it comes, it is a mutation on `userProcedure` with no input that
  sets `sessions_valid_after = now()`. PR 3a ships the column, its check and the
  operator SQL: every token with `auth_time ≤ ⌈sessions_valid_after⌉` is refused
  (AU-05), so a session from the cutoff's own second never survives.

**Why a query may write:** the bootstrap writes once per installation and the profile
update only when Google's values changed. Both are idempotent, and failures roll
back. TanStack retries failed 5xx queries, which
is harmless here. **Alternative:** a `session.start` mutation called after sign-in and
on every app start, adding a round trip and client state for a one-time event.

### SI-08 Bootstrap

**Recommendation:** the identity store's `bootstrap`, one Drizzle transaction:

1. `SELECT pg_advisory_xact_lock(<fixed 64-bit key>)`;
2. return the existing session if a User with this uid now exists, and `noAccess` if
   any Organization exists;
3. insert the User (`global_admin`, `can_edit_products = true`, email lowercased,
   `display_name` from the token's `name`), the Organization (configured name,
   nickname and currency), the owner Membership (`granted_at = now()`);
4. insert the `organization.bootstrap` event and its Membership-grant change (AU-07);
5. commit and return the `member` session.

A unique violation (a hand-made duplicate nickname, say) rolls back and returns 500;
the configuration is then wrong, and the log carries the SQLSTATE.

### SI-09 Firebase in the web app

**Recommendation:**

- `lib/session/firebase.ts` is the only module that imports `firebase/app` and
  `firebase/auth`, loaded with `import()` by the `/login` and `/app` routes. The
  catalog never imports it.
- `initializeApp` with the four values, then `initializeAuth(app, { persistence:
  [indexedDBLocalPersistence, browserLocalPersistence] })` with **no
  `popupRedirectResolver`**. The Login page passes `browserPopupRedirectResolver` to
  `signInWithPopup`, `signInWithRedirect` and `getRedirectResult`.
- `auth.languageCode` follows the active language, so Google's account chooser
  matches the app.

**Why no resolver at startup:** with one, the SDK loads
`https://<authDomain>/__/auth/iframe` (and Google's `api.js`) during initialization on
phones and Safari (`_shouldInitProactively`). Without one, `/app` startup made no
request beyond `accounts:lookup` in the prototype, and popup sign-in with the resolver
passed per call worked in Chrome. The chunk is about 24 KiB gzip without the resolver
and 28 KiB with it.

**Risk:** the redirect path with a per-call resolver is untested until PR 4's manual
check (dev uses popup). If `getRedirectResult` misbehaves there, the fallback is the
resolver at startup, which is Firebase's default.

### SI-10 Startup check

**Recommendation:** `lib/session/savedSession.ts`, run once per page load before the
first `initializeAuth`:

1. Open IndexedDB `firebaseLocalStorageDb` without creating it: when
   `onupgradeneeded` fires, abort the upgrade, so there is no saved session.
2. Read key `firebase:authUser:<apiKey>:[DEFAULT]` from store `firebaseLocalStorage`,
   then the same key in localStorage (the fallback persistence).
3. Decode `stsTokenManager.accessToken`'s `auth_time`. If the record is unreadable or
   older than 7 days, delete it.
4. Return the `auth_time`, so SI-12 remembers it.

**Evidence (prototype, `@firebase/auth` 1.13.9):**

| Case | Result |
| --- | --- |
| No saved session | No database created; no Google request |
| Saved fresh token | `accounts:lookup` only, about 330 ms |
| Saved expired token | `securetoken…/v1/token` refresh, then `accounts:lookup`, before the app saw the user |
| Record older than the limit (a 30 s limit on a 73 s session) | Deleted before `initializeAuth`; signed out; no Google request |

**Risk:** the record's name and shape are Firebase internals. The check fails closed:
if a Firebase upgrade changes them, every saved session is discarded and people sign
in again. Every signed-in Playwright spec depends on this check accepting the
setup's fresh session, so an incompatible upgrade fails the suite at once. A
`web-unit` test pins the decoding against a recorded 13.2.0 record shape.

**Alternative:** let Firebase load the session, then sign out when `auth_time` is past
7 days. Public API only, but it refreshes an expired session once, against W8's
"the app does not refresh such a session".

### SI-11 Login page

**Recommendation:**

- **Popup or redirect** (`lib/session/signInMethod.ts`): redirect only when
  `authDomain` equals `location.host` (the proxy is in place, PR 4) **and**
  `matchMedia("(pointer: coarse)")` matches (phones and tablets); otherwise popup. In
  development and in PR 3b, `authDomain` is `storage-minis-dev.firebaseapp.com`, so
  everyone, Pixel 7 included, uses popup.
- **Popup errors:**

  | Error | Result |
  | --- | --- |
  | `auth/popup-blocked` | Redirect where allowed, otherwise "Your browser blocked the sign-in window. Allow pop-ups for this site and try again." |
  | `auth/popup-closed-by-user`, `auth/cancelled-popup-request` | "Sign-in was cancelled. Try again." |
  | `auth/network-request-failed` | "Couldn't reach Google. Check your connection and try again." |
  | Anything else | "Sign-in didn't work. Try again." |

- **Redirect return:** before `signInWithRedirect`, the page sets
  `sessionStorage["storage-minis.redirecting"]`. On the way back, it shows state 2
  while `getRedirectResult` resolves, so state 1 never flashes, then clears the flag.
  This uses our own flag, not Firebase's internal one.
- **After Firebase signs in:** remember `auth_time` from `getIdTokenResult`, load
  `session.get`; a member goes to the validated `redirect` search parameter (an
  `/app` path only) or `/app`; `noAccess` signs out and shows state 4.
- **States** from the approved design: state 2 (button loading, helper with
  `role="status"`, language switch disabled); state 3 when the user agent matches a
  short list of in-app browsers (`FBAN`, `FBAV`, `Instagram`, `Line/`, `WhatsApp`,
  `MicroMessenger`, `TikTok`, and Android's `; wv)`), with Copy link; state 4 with the
  email, or without it for a test user; "Your session ended. Sign in again." when
  sent by SI-12.
- **Google's mark:** the official "G" from Google's sign-in branding resources,
  committed as an SVG once its rules are checked (the design's open item); the
  implementation asks before downloading it.

### SI-12 Session context, guard and request headers

**Recommendation:**

- **`lib/session/session.ts`:**
  - `ensureSession()` loads Firebase (SI-09) after the startup check (SI-10), waits
    for `authStateReady()`, and loads `session.get` into the QueryClient. It returns
    `signedOut`, `noAccess` or `member`.
  - It remembers `auth_time` and listens to `onAuthStateChanged`: a sign-out in
    another tab clears the cache and goes to `/login`.
  - `signOut(reason)`.
- **`/app` guard** (`routes/app/route.tsx`, `beforeLoad`): `signedOut` redirects to
  `/login?redirect=<path>`; `noAccess` signs out and redirects to `/login` with state
  4; `member` provides the session to the router context. `/login` sends a member to
  `/app`. TanStack's note stands: the guard is not an authorization boundary; the API
  is.
- **Active Organization (W5):** the only Membership. If a User ever has several, the
  first by Organization ID, until W5's deferred switcher and persistence.
  `useSession()` exposes the User, Memberships and active Organization.
- **tRPC link:** `httpLink`'s async `headers` adds:
  - `authorization: Bearer <getIdToken()>` once Firebase is loaded and a User is
    signed in;
  - `x-organization-id` once a session is loaded.

  Before calling `getIdToken()`, it compares the remembered `auth_time` with the
  limit and signs out instead of asking for a token (AU-03 check 2). The catalog
  never loads Firebase, so its requests carry neither header.
- **Errors:** the QueryCache's and MutationCache's `onError` handle `UNAUTHORIZED` by
  signing out with "Your session ended" and `FORBIDDEN` by invalidating `session.get`.
  The guard then decides between the page and state 4. The existing rule stands: no
  retry for 4xx.
- **Sign-out** cancels in-flight queries, clears the cache, calls Firebase's
  `signOut`, then navigates.

### SI-13 Sign out button

**Owner's decision (2026-11-04):** PR 3b adds only a Sign out button. The account
menu, the user badge (#1) and "Sign out of all devices" move to
[#130](https://github.com/WilliamPhilippe/storage-minis/issues/130), with the design
documents' update.

- **Desktop** (from `bp-md`): a `Button` labelled "Sign out" with antd's
  `LogoutOutlined` icon, at the right of the TopBar, where the account menu will go.
- **Phones:** the same button at the bottom of the menu drawer, in its footer with the
  language switch. The phone TopBar keeps only the logo.
- **Behaviour:** SI-12's sign-out: cancel queries, clear the cache, Firebase's
  `signOut`, then `/login`, state 1.
- **Tests:** located by role and name ("Sign out") in `web-unit` and Playwright, on
  both projects.

**As approved before this change** (now #130's starting point):

- an antd `Avatar` (initials on `surface-sunken`) with the name from `bp-md`;
- a `Dropdown` named "Account: {name}" with the name and email, Sign out, and Sign
  out of all devices behind a confirmation;
- name and email from `session.get`, with no Google profile photo.

### SI-14 API key restrictions

**Recommendation:** the owner applies these in the Google Cloud console (APIs &
Services → Credentials → the "Browser key (auto created by Firebase)" whose value
matches the web config), in PR 3b before the manual sign-in check:

| Key | Website restrictions | API restrictions |
| --- | --- | --- |
| `storage-minis-dev` | `http://localhost:5173/*`, `https://storage-minis-dev.firebaseapp.com/*` | Identity Toolkit API, Token Service API |
| `storage-minis` | `https://storage-minis.firebaseapp.com/*` (PR 4 or T04 adds the app's domain) | Identity Toolkit API, Token Service API |

- The `firebaseapp.com` entry is our inference, not documented by Firebase: the
  popup's handler page on that domain calls the API with the same key. The
  verification below confirms it, or shows it can go.
- Custom tokens are signed through IAM, not with the key, and are exchanged by the
  browser on `localhost:5173`.
- **Verification:**
  - a popup sign-in still works;
  - a request with another referrer is refused: `curl -H 'Referer: https://example.com/' 'https://identitytoolkit.googleapis.com/v1/projects?key=<key>'`
    returns 403;
  - the dev key no longer serves the prototype's `localhost:5180`.
- Referrer checks only limit abuse by browsers; the key stays a public identifier.
  Google Cloud recommends both kinds of restriction, and Firebase calls API
  restrictions critical.

### SI-15 Test signing credential

**Recommendation: keyless IAM signing with each developer's gcloud login**, as
prototyped:

- **One-time setup per developer** (README):
  1. Install the gcloud CLI.
  2. Run `gcloud auth application-default login`.
  3. The owner grants that Google account Service Account Token Creator on
     `e2e-custom-tokens@storage-minis-dev.iam.gserviceaccount.com`.

  The IAM Service Account Credentials API is already enabled in the dev project. No
  quota project was needed in the prototype. gcloud writes one into the ADC file
  when it has a default project; if minting then fails with a quota or "API not
  enabled" error, `gcloud auth application-default set-quota-project
  storage-minis-dev` fixes it (README troubleshooting).
- **Where the login lives:** gcloud's default `~/.config/gcloud/`. Turbo's strict mode
  keeps `HOME` and drops other variables, so `@storage-minis/web#test:e2e` passes
  through `GOOGLE_APPLICATION_CREDENTIALS` and `CLOUDSDK_CONFIG` for anyone who moves
  the file. `google-auth-library` 11.3.2 reads them in that order.
- **`.env.test`** adds `E2E_SIGNER_SERVICE_ACCOUNT=e2e-custom-tokens@storage-minis-dev.iam.gserviceaccount.com`,
  an identifier, not a secret. The owner confirmed on 2026-11-04 that it stays in
  `.env.test` rather than Doppler: knowing the address grants nothing, and Doppler
  enters local development only with its first real secret.
- **Failure mode:** without the login, the setup project fails first with Google's
  message, and the README names the setup.

| Option | Why not |
| --- | --- |
| **IAM signing with the developer's login (recommended)** | — |
| A service-account key in Doppler `dev` | The first real local secret: Doppler, `doppler.yaml` and `doppler run` enter local development (2026-10-31 restructure), and a long-lived key exists |
| The `firebase-adminsdk` service account | Broad Firebase Admin roles; the prototype proved a no-role account suffices |

**CI later:** Workload Identity Federation can impersonate the same account without
keys.

### SI-16 API tests

**Recommendation:**

- **Unit, inside `pnpm check`** (`apps/api/src/auth/*.test.ts`, config tests). The
  verifier runs against a locally generated RS256 key and `createLocalJWKSet`:
  - accepted Google and opted-in custom tokens;
  - rejected: HS256, ES256 and `none`; an unknown `kid`; a bad signature; the wrong
    issuer or audience; expired; future `iat` or `auth_time`; missing claims; `sub`
    over 128 characters;
  - `auth_time` exactly 7 days old (accepted) and one second more (rejected);
  - other providers;
  - key-fetch failure (500, not 401);
  - the header formats.

  Config tests: `FIREBASE_PROJECT_ID` required; opt-in values; the opt-in with
  `NODE_ENV` `production` or unset refused; `BOOTSTRAP_*` all or none; the nickname
  rule; email normalization.
- **Integration, in `pnpm test:api`**, as a new file
  `tests/auth.integration.test.ts`. It uses `app.inject()` on the real `buildApp`
  with a pool on the migrated test database and the local key set:
  - every database-backed case in AU-12, with the bootstrap race run as two
    concurrent `session.get` requests;
  - the AU-06 SQL;
  - probe routers built only in the test, one procedure per builder and role, never
    in `appRouter`;
  - a log assertion that no token, email or header value appears.
- **Shared test database helper:** the DB package's `tests/global-setup.ts`
  preparation (guard, same-database check, reset, migrate as the owner role) moves to
  a `@storage-minis/db/testing` export. `test:db`, the new `api-process` global setup
  and Playwright's setup all use it, instead of three copies.
  - It takes both URLs as arguments, because Playwright parses `.env.test` instead of
    loading it (PW-06).
  - It compiles to a folder outside the package's `files`, so `pnpm deploy --prod`
    leaves this schema-dropping helper out of the API image. `test:stack`'s image
    listing checks that.
- **Existing suites:** the process and stack tests start the API with an explicit
  environment, so they add `FIREBASE_PROJECT_ID`.

### SI-17 Playwright sign-in

**Recommendation**, using PW-13's four plug-in points:

- **Setup project** `setup` (`testMatch: /auth\.setup\.ts/`); `desktop-chrome` and
  `pixel-7` get `dependencies: ["setup"]`. It:
  1. prepares the test database with the shared helper, reading
     `MIGRATION_DATABASE_URL` from `.env.test` inside the setup only (PW-06 keeps it
     away from the servers);
  2. seeds, as the app role:
     - the Organization "E2E Garage" (`e2e-garage`, BRL);
     - User `e2e-owner` ("E2E Owner", `user`) with an owner Membership;
     - no row for `e2e-outsider`;
     - (#130 later adds one revoker user per project for its all-devices test, so
       parallel tests and the other project keep their sessions);
  3. mints a custom token per uid with `firebase-admin` (SI-15);
  4. opens `/login`, calls the development-only hook, waits for `/app`, and saves
     `playwright/.auth/owner.json` with `indexedDB: true`.
- **Development-only hook** (`lib/session/testSignIn.ts`): imported only inside `if
  (import.meta.env.DEV)`. It sets `window.__storageMinisTest = { signIn(token) }`,
  which calls `signInWithCustomToken`. Production builds drop the branch; a
  verification step greps `dist` for the name.
- **`support/app.ts`** becomes `base.extend({ storageState:
  "playwright/.auth/owner.json" })`.
- **The saved refresh token** belongs to a dev-project test user that only an API
  with the opt-in accepts, and only `.env.test` has the opt-in. So
  `pnpm dev`'s API refuses it. The file stays under the ignored
  `**/playwright/.auth/`.
- **New specs** (about 7 tests per project):
  - **signed out:**
    - `/app` redirects to `/login?redirect=…`;
    - the button opens a popup at
      `https://storage-minis-dev.firebaseapp.com/__/auth/handler` (closed at once;
      cancelled alert);
    - state 3 with an in-app user agent;
    - state 4 for `e2e-outsider`, signed in through the hook, with the saved session
      gone afterwards;
  - **signed in:**
    - the Sign out button in the TopBar (`@desktop`) and in the drawer's footer
      (`@phone`);
    - sign-out in one tab sends a second tab to `/login`, while a second context
      stays signed in (Firebase's `signOut` touches only this browser, so parallel
      tests keep their session);
    - with `page.clock` set 8 days ahead, the saved session is discarded with no
      Google request and "Your session ended" shows;
    - 61 minutes ahead, the SDK refreshes once and `/app` loads signed in, so
      `session.get` accepted the refreshed token (`diagnostics.echo` is public and
      would prove nothing);
    - an idle half hour makes no request.
- **Outside-origin guard** (PW-10's handoff): a fixture fails any request outside
  `localhost:5173`, `identitytoolkit.googleapis.com` and
  `securetoken.googleapis.com`. The popup spec declares the origins the popup flow
  loads (`storage-minis-dev.firebaseapp.com`, `apis.google.com`, and Google's
  account and static origins it reaches). Analytics or Installations traffic would
  fail the run.
- **Existing tests:** the Login test's inert-button check is replaced. The `/app`
  specs run signed in, unchanged.
- **Turborepo:** `@storage-minis/web#test:e2e` adds `MIGRATION_DATABASE_URL`,
  `GOOGLE_APPLICATION_CREDENTIALS` and `CLOUDSDK_CONFIG` to `passThroughEnv`.
- **Limits:** first runs create two Firebase users, well under 100 new accounts per
  hour per IP.

### SI-18 PR 4 dependency: redirect sign-in

PR 3b ships the redirect code; PR 4's plan must add, for production and the parity
stack:

1. Caddy `handle /__/auth/*` → `reverse_proxy https://<project>.firebaseapp.com` with
   the upstream `Host` header (Firebase: it "cannot be done via a 302 Redirect").
2. `VITE_FIREBASE_AUTH_DOMAIN` set to the app's domain in `apps/web/.env.production`.
   SI-11's rule then turns redirect on for coarse pointers without a code change.
3. `https://<app domain>/__/auth/handler` as an authorized redirect URI on the
   project's OAuth client, and the domain in Firebase's authorized domains.
4. The app's domain in the production key's website restrictions (SI-14).
5. CSP: `script-src 'self' https://apis.google.com`; `connect-src 'self'
   https://identitytoolkit.googleapis.com https://securetoken.googleapis.com`;
   `frame-src 'self'` once the handler is same-origin.
6. A manual redirect sign-in over HTTPS through Caddy, and SI-09's fallback if it
   fails.

### SI-19 Documentation and delivery

1. **This docs PR:** T02's record, this plan, and after approval the approval record
   in the technical direction and the AGENTS.md lines that change. #22 and #118 are
   updated; "Part of" links, no closing keywords.
2. **PR 3a,** branch `feat/api-auth`, four commit groups (section 5).
3. **PR 3b,** branch `feat/web-sign-in`, after 3a merges, five commit groups.

## 5. Implementation order

Conventional Commits; each PR leaves a working state; commits pass `pnpm check` where
practical.

**PR 3a:**

1. **`build(api): add jose and the auth settings`:** the pin; `config.ts` with its
   tests; the env files, `compose.yaml` (`FIREBASE_PROJECT_ID` only), `turbo.json`;
   `FIREBASE_PROJECT_ID` for the process, stack and Playwright API environments.
2. **`feat(db): add Organization nickname and currency, and session revocation`:**
   schema, generated migration, DBML, `@storage-minis/db/testing`, the Organization
   fixtures' nickname, and DB tests for the new constraints.
3. **`feat(api): verify Firebase ID tokens and guard procedures`:** `auth/` (verifier
   and identity store), the lifecycle's wiring, `procedures.ts`, the context, the
   `session` router and the bootstrap, with unit tests on fakes.
4. **`test(api): add the auth integration suite`, `docs: record PR 3a`:** the
   `api-process` global setup and the integration file; README,
   `local-development.md` (configuration table, the AU-06 and AU-05 operator SQL), the
   technical direction's outcome and evidence.

**PR 3b:**

1. **`build(web): add Firebase and the web config`:** pins and `allowBuilds`; the mode
   files, `.gitignore`, `vite-env.d.ts`, the `vite.config.mts` check, `turbo.json`.
2. **`feat(web): add the session layer`:** `lib/session/`, the tRPC headers and error
   handling, the router context and guard, with `web-unit` tests (startup-check
   decoding, the age rule, method choice, in-app detection, link headers,
   `UNAUTHORIZED` and `FORBIDDEN` handling, cross-tab sign-out).
3. **`feat(web): sign in on the Login page and add the Sign out button`:** states
   2–4, alerts, Google's mark, the Sign out button in the TopBar and the drawer, en-US
   and pt-BR strings together, with tests.
4. **`test(web): sign in Playwright through custom tokens`:** setup project, helpers,
   `support/app.ts`, new specs, the outside-origin guard.
5. **`docs: record PR 3b`:** README (gcloud setup, `test:e2e` prerequisites),
   `local-development.md`, the technical direction, the key restrictions applied, and
   #118.

**Contracts consumed:** Step 5's envelope and builders rule; PW-13's plug-in points;
the shell's TopBar; the design's Login states.
**Contracts supplied:** the guarded builders and their context for every business
procedure; `useSession()` and the active Organization for every screen; the setup
project and storage state for every signed-in spec; SI-18 for PR 4.

## 6. Verification

### Completion criteria

| Criterion | Evidence |
| --- | --- |
| API token verification with the 7-day limit (#118) | Unit tests (SI-16); the live Google token in the manual check below; custom tokens in Playwright |
| Bootstrap from the configured email, creating the first Organization (#22, #117) | `test:api` cases 1–6; the owner's first `pnpm dev` sign-in creates the development Organization |
| Public versus protected procedures, cross-Organization rejection (#22, #26) | `test:api` probe routers, cases 15–19, 23 |
| Logout scope and revocation (#22) | Cases 12–14 in `test:api` and Playwright |
| Session expiry and recovery cases (#22) | AU-12 cases 7–11 and 22 |
| No Membership (#22) | Case 4 in `test:api`; state 4 in Playwright |
| Popup sign-in and the redirect code (#118) | Manual popup sign-in on `http://localhost:5173` as the owner; `web-unit` tests of the redirect path; the redirect itself in PR 4 |
| Session context with the active Organization (#118) | `web-unit` tests; signed-in Playwright specs |
| Sign-out (#118); the badge (#1) moved to #130 | Playwright, both projects |
| Playwright test sign-in behind its opt-in (#118) | `test:e2e`; case 21; `dist` has no `__storageMinisTest` |
| Key restrictions (SI-14) | The `curl` with a foreign referrer returns 403; sign-in still works |
| Catalog never loads Firebase | `vite build` chunk list; the catalog's network list on `vite preview` |

### Commands

| Command | Expected |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passes; only the two `allowBuilds: false` entries are new; no `minimumReleaseAgeExclude` |
| `pnpm check` | Passes; unit counts rise from 194 (API verifier and config, web session and Login) |
| `pnpm build` | Passes; the web chunk list records the Firebase chunk (about 24–28 KiB gzip) outside the catalog's path |
| `pnpm db:up`, then `pnpm test:db`, `pnpm test:api`, `pnpm test:e2e`, one at a time | 29+, 27 + the auth suite, 48 + the new specs |
| `pnpm test:stack` | 5 pass on a rebuilt image with `jose` |
| `grep -r __storageMinisTest apps/web/dist` | No match |
| Manual: `pnpm dev`, a Google popup sign-in at `http://localhost:5173/login` | Bootstrap on an empty development database, `/app` with the Sign out button; sign-out; a second account sees state 4 |

### Guards, each broken on purpose

| Guard | Broken by | Expected failure |
| --- | --- | --- |
| 7-day limit | Removing the `auth_time` check | Unit test at 604,801 s |
| Provider allowlist | Accepting any provider | Unit tests for `anonymous`, `password` |
| Opt-in second lock | `AUTH_TEST_SIGN_IN=enabled` with `NODE_ENV` unset | Config test; the API refuses to start |
| Type-only DB imports in tRPC modules | A runtime `@storage-minis/db` import in `routers/session.ts` | `app.test.ts` and `plugin.test.ts` fail on their mock |
| Same-second revocation | Comparing with `<` instead of `≤ ⌈cutoff⌉` | A unit test with a sign-in in the cutoff's second |
| Header check | Skipping the Membership lookup | Probe tests for another Organization |
| Revocation | Ignoring `sessions_valid_after` | Case 14 (the operator SQL) |
| Log policy | Logging the header | The integration log assertion |
| Startup check | Skipping it | The 8-day Playwright test sees a `securetoken` request |
| Outside origins | A request to another origin | The fixture's failure |

This is tooling and integration evidence. Business acceptance of authorization
waits for the business procedures that use it.

## 7. Handoff

**Documentation in the implementation PRs:**

- **README:**
  - the gcloud setup;
  - `test:e2e`'s new prerequisites;
  - `FIREBASE_PROJECT_ID` and the development bootstrap;
  - "sign in once with Google after a database reset";
  - no `apps/web/.env.local`.
- **`local-development.md`:**
  - the configuration table;
  - the web mode files;
  - the AU-05 and AU-06 operator SQL;
  - the end-to-end section's setup project and credential.
- **Technical direction:** each PR's outcome and evidence.
- **AGENTS.md:** the repository-state paragraph, the validation bullets, and the
  decisions table rows for T02.
- **#22, #117, #26, #118:** progress comments; boxes checked when merged. #130
  starts from SI-13's "As approved before this change".

**For PR 4:** SI-18, plus the setup project's removal from a parity-stack config, as
PW-13's handoff noted.

**For business procedures:**

- use `organizationProcedure(minRole)` and `ctx.organization.id` in every query;
- `requireCanEditProducts` for Product edits;
- `ctx.user.id` as the actor.

**Remaining limitations:**

- redirect untested until PR 4;
- one administrator;
- no user management;
- nickname rule provisional;
- identity rebinds unaudited in the database;
- Chromium only.

## 8. Risks

- **Firebase internals in the startup check (SI-10).** It fails closed, and the
  signed-in suite catches a change.
- **Disk:** `firebase` adds 183 MiB and `firebase-admin` 67 MiB to the pnpm store and
  `node_modules` (development only).
- **gcloud per developer and later CI (SI-15).** A missing login fails `test:e2e`
  early with a clear message; CI needs Workload Identity Federation.
- **Google's popup page** in the popup spec is outside our control. If it makes the
  spec flaky, the spec drops to checking the popup's URL without loading it.
- **Google outages (accepted by the owner, 2026-11-04):** sign-in, refresh and the
  API's key fetch depend on Google; a key-fetch failure answers 500 rather than signing
  people out, and `/health/ready` stays database-only.
- **Live Firebase in tests:** `test:e2e` now needs the network, Google's token
  service and the dev project. A Google outage fails the run; Vitest stays offline.
- **Provisional nickname rule** may need a forward migration after D04.
- **A query that writes once (SI-07)** surprises readers; the code comment and this
  plan explain it.
- **Configured bootstrap values stay in production's environment** after use; they
  do nothing once an Organization exists.
- **Key restrictions** can break sign-in if a referrer is missing; SI-14's check runs
  before the PR merges.
- **Pins one release behind:** none today; re-checked at implementation.

## Research and evidence (2026-11-03)

All research and prototypes ran in the session scratchpad, never in the repository.

**Registry (2026-11-04 00:42 UTC):**

- the publish times and sizes in SI-02;
- gcloud CLI 592.0.0, `google-cloud-cli-darwin-arm.tar.gz` 54.7 MB;
- `firebase-admin` 14.5.0 requires Node 22 or later and depends on
  `google-auth-library` ^11.1.0 (11.3.2 resolved).

**Firebase projects:** `GET https://identitytoolkit.googleapis.com/v1/projects?key=<web key>`
for both keys gave the authorized domains in section 1.

**Google keys:**
- The JWK and x509 URLs listed the same two RS256 key IDs.
- `Cache-Control: public, max-age` was about 21,500–24,700 s.

**Source reading:**

- `@firebase/auth` 1.13.9:
  - `initializeCurrentUser` and `reloadAndSetCurrentUserOrClear` call
    `_reloadWithoutSaving`, which calls `getIdToken()` and `getAccountInfo`;
  - `beforeStateQueue` runs only for redirect results;
  - `_shouldInitProactively`;
  - the persistence key and IndexedDB names;
  - `getAuth`'s defaults.
- `firebase-admin` 14.5.0 `token-verifier.js` checks `kid`, the algorithm, `aud`,
  `iss` and `sub` (1–128), and has no `auth_time` rule.
- jose 6.2.15: remote JWKS defaults of 5 s timeout, 30 s cooldown and 10-minute cache.
- `google-auth-library` 11.3.2: the ADC lookup order.
- `@firebase/util` 1.15.3's postinstall.

**Prototype** (a scratch Vite page on `http://localhost:5180` with firebase 13.2.0, and
a Node verifier with jose 6.2.15 and firebase-admin 14.5.0):

| Check | Result |
| --- | --- |
| Google popup sign-in, owner's Chrome, dev project, `initializeAuth` without a resolver and the resolver passed to `signInWithPopup` | Signed in; `sign_in_provider: "google.com"`, `email_verified: true`, email present, `sub` 28 characters |
| Custom token: `createCustomToken` via ADC (`authorized_user`, no quota project) and `serviceAccountId` = the no-role `e2e-custom-tokens` | Signed; RS256 without `kid`; one-hour lifetime; `signInWithCustomToken` worked; `sign_in_provider: "custom"`, no email, empty `identities` |
| Forced refresh | Same `auth_time`, new `iat` |
| `metadata.lastSignInTime` after a second sign-in (custom and Google) | Still the previous sign-in's time |
| Startup cases | SI-10's table |
| Edit of the saved record while a Firebase page was open | That page refreshed: Firebase syncs across contexts |
| jose verification (JWK URL, RS256, issuer, audience, required claims) | Accepted Google and custom tokens |
| jose: production project; ES256 only; two hours later; tampered payload; custom token as an ID token | Rejected (`iss`, alg not allowed, expired, signature, multiple matching keys) |
| jose: one hour earlier (`iat` in the future) | **Accepted**; rejected only with `maxTokenAge` |
| firebase-admin with only a project ID, empty `HOME`, no credentials | `verifyIdToken` accepted; `checkRevoked` failed with `app/invalid-credential` |
| Lazy chunk sizes (Vite 8.3.5, gzip −9) | With resolver and sign-in calls 27,985 B; without resolver 24,274 B; `getAuth` 28,898 B |
| pnpm 12.15.0 | `pnpm add` stopped with `ERR_PNPM_IGNORED_BUILDS`; with SI-02's entries a fresh frozen install exited 0 |
| Turbo 2.11.10 strict mode | Passes `HOME`; drops `CLOUDSDK_CONFIG` and `GOOGLE_APPLICATION_CREDENTIALS` unless listed |

**Not tried:** the built-in browser pane's popup (the owner signed in from Chrome); the
redirect flow (PR 4); key restrictions (SI-14, during PR 3b).

**Owner actions on 2026-11-03:**

- installed the gcloud CLI;
- created `e2e-custom-tokens` with no project roles and granted their account Service
  Account Token Creator on it;
- signed in for Application Default Credentials, stored in the scratchpad.

The prototype created three test users in the dev project: `e2e-proto`, `e2e-node`,
and the owner's own Google user.

## Sources

Consulted 2026-11-03. Google Cloud pages now redirect from `cloud.google.com` to
`docs.cloud.google.com`.

- Firebase: [verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens),
  [manage sessions](https://firebase.google.com/docs/auth/admin/manage-sessions),
  [create custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens),
  [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) and
  [rules and auth](https://firebase.google.com/docs/rules/rules-and-auth) (both
  2026-11-04, for section 3),
  [Admin setup](https://firebase.google.com/docs/admin/setup),
  [API keys](https://firebase.google.com/docs/projects/api-keys),
  [auth state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence),
  [custom dependencies](https://firebase.google.com/docs/auth/web/custom-dependencies),
  [redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices),
  [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin),
  [limits](https://firebase.google.com/docs/auth/limits),
  [security checklist](https://firebase.google.com/support/guides/security-checklist),
  [JavaScript release notes](https://firebase.google.com/support/release-notes/js).
- Google Cloud: [API keys](https://docs.cloud.google.com/docs/authentication/api-keys),
  [Application Default Credentials](https://docs.cloud.google.com/docs/authentication/application-default-credentials),
  [service account impersonation](https://docs.cloud.google.com/docs/authentication/use-service-account-impersonation),
  [service account credentials](https://docs.cloud.google.com/iam/docs/service-account-creds),
  [`signJwt`](https://docs.cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/signJwt),
  [gcloud install](https://docs.cloud.google.com/sdk/docs/install),
  [`gcloud iam service-accounts sign-jwt`](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/sign-jwt).
- Google Identity: [OpenID Connect](https://developers.google.com/identity/protocols/oauth2/openid-connect),
  [sign-in branding guidelines](https://developers.google.com/identity/branding-guidelines).
- jose: [`jwtVerify`](https://github.com/panva/jose/blob/main/docs/jwt/verify/functions/jwtVerify.md),
  [`createRemoteJWKSet`](https://github.com/panva/jose/blob/main/docs/jwks/remote/functions/createRemoteJWKSet.md).
- tRPC: [authorization](https://trpc.io/docs/server/authorization).
- TanStack Router: [authenticated routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes).
- Playwright: [authentication](https://playwright.dev/docs/auth),
  [clock](https://playwright.dev/docs/clock).
- Package source: `@firebase/auth` 1.13.9, `firebase-admin` 14.5.0, jose 6.2.15,
  `google-auth-library` 11.3.2, `@firebase/util` 1.15.3.
