# Frontend foundation proposal (2026-11-01)

**Status: decided by the owner on 2026-11-01. Implemented by frontend PRs 1–3
([#121](https://github.com/WilliamPhilippe/storage-minis/pull/121),
[#124](https://github.com/WilliamPhilippe/storage-minis/pull/124),
[#125](https://github.com/WilliamPhilippe/storage-minis/pull/125),
[#132](https://github.com/WilliamPhilippe/storage-minis/pull/132) and
[#133](https://github.com/WilliamPhilippe/storage-minis/pull/133)); PR 4, the web
image, waits for the first deployment.** The owner
asked for a frontend architecture with options and decided every item, W1–W11,
on 2026-11-01, then refined W4–W6 and W8–W11 in a
[follow-up review](#follow-up-review-2026-11-01) the same day.
[Section 1](#1-owner-decisions-2026-11-01) records the decisions, and the
[technical direction](technical-direction.md#frontend-foundation-decisions-2026-11-01)
holds the approval record. Later approvals changed parts of W3–W6 and W8–W11:
[Later changes](#later-changes) lists them, and sections 3–6 include them. W7
replaces the React Hook Form choice approved on 2026-10-21 with TanStack Form.
[Section 6](#6-deferred-decisions) lists what is still open. This document
authorizes no installation or
implementation by itself: each delivery step in W11 gets its own plan for
approval, as the [Step 5 plan](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/technical/step-5-trpc-plan-2026-11-01.md) did for tRPC.
W1–W11 are references within this document, not requirement, issue or
F-decision IDs.

The proposal draws on [requirements v0.7](https://github.com/WilliamPhilippe/storage-minis/blob/55a61ab996b4151c5f2a5dfb6df35237287e3963/docs/requirements/requirements-v0.7.md),
the technical direction, the Step 5 plan and its implementation record, issues
[#18](https://github.com/WilliamPhilippe/storage-minis/issues/18),
[#22](https://github.com/WilliamPhilippe/storage-minis/issues/22),
[#23](https://github.com/WilliamPhilippe/storage-minis/issues/23),
[#26](https://github.com/WilliamPhilippe/storage-minis/issues/26) and
[#89](https://github.com/WilliamPhilippe/storage-minis/issues/89), npm registry
metadata on 2026-11-01, the `firebase-tools` 15.34.2 source and the official
documentation listed under [Sources](#sources).

## 1. Owner decisions (2026-11-01)

| ID | Decision |
| --- | --- |
| W1 | One SPA, `apps/web`, holding the public catalog and the signed-in back office, split by route. |
| W2 | Ant Design 6. |
| W3 | antd theme tokens plus CSS Modules; prototype antd's zero-runtime mode in the first step. |
| W4 | i18next with react-i18next. en-US is the main language and pt-BR the second; strings live in the frontend, split by area, and only the active language loads. The back office shows `$` and the amount, with separators that follow the language and cents only when not zero; the public catalog shows the Organization's currency symbol instead. |
| W5 | No Organization id in back-office URLs. A session context holds the user, their Memberships and the active Organization, and every part of the UI reads the Organization from it. Nothing is persisted while each user has one Membership. The API receives the Organization in a request header. Catalog URLs carry the Organization's unique nickname. |
| W6 | `@trpc/tanstack-react-query` with the transport defaults under W6. The ID token is fetched only when a request needs it, and requests follow user activity only. |
| W7 | TanStack Form with our own antd field components, replacing React Hook Form (approved 2026-10-21). |
| W8 | Popup and redirect sign-in, with redirect through the `/__/auth/` proxy behind Caddy; a Firebase dev project for local development, which signs in by popup; sessions that end 7 days after the last Google sign-in; a test-only custom-token sign-in for Playwright behind an explicit opt-in setting, whose structure is decided later. T02 settles the remaining session policies first, in its own record. |
| W9 | Vitest component tests inside `pnpm check`; Playwright next, on phone and desktop projects; every component built for Playwright; tests run in the `America/Sao_Paulo` time zone. |
| W10 | Build, serving and tooling as listed under W10, including a committed production Firebase web config and a web build that never runs under Doppler. |
| W11 | Four PRs: web shell, Playwright, sign-in end to end, web image. Foundation Step 6 stays TBD until the app is validated locally. |

Direction given with these decisions:

- **Mobile-first.** Most use is on phones, especially the catalog. The back
  office works fully on phones and desktops. Filterable lists are preferred over
  big tables; when a big table is needed, its behavior is decided for that
  screen ([section 4](#4-mobile-first-design)).
- **Catalog loading.** The catalog is rendered in the browser and its link
  previews stay generic. A 1–2 second load on a phone is acceptable until T04
  sets performance targets.
- **Money display.** Amounts carry no currency. Each Organization chooses its
  currency once, when it is created (BRL by default, or USD), and never changes
  it. The back office always shows `$`: `$400`, `$400.50` and `-$400.50` in
  en-US; `$400`, `$400,50` and `-$400,50` in pt-BR. The public catalog shows
  the Organization's symbol instead, `R$` or `US$`. Nothing is converted.
  Requirements v0.8 publishes the currency rule.
- **Playwright-ready components.** Unit tests come first and Playwright right
  after, so every component is built to be located and driven by Playwright.

**Why:** one SPA keeps one build, one image and one origin. antd covers the back
office's components first-party, including their en-US and pt-BR texts.
i18next is the most widely used translation library and needs no build step.
TanStack Form takes Zod schemas directly and documents how to register our antd
fields once. A Firebase dev project with custom-token test sign-ins avoids the
emulator's boilerplate while tests still use real Firebase sessions and real
token verification.

### Follow-up review (2026-11-01)

The same day the owner reviewed these decisions question by question and
refined them. Sections 3–6 describe the result, with the
[later changes](#later-changes).

| Item | Refinement |
| --- | --- |
| W4 | Translations are split into namespaces by area, and only the active language loads. Amounts carry no currency: the catalog shows the Organization's currency symbol, `R$` (the default) or `US$`, and the back office keeps `$`. |
| W5 | Back-office URLs carry no Organization id. Catalog URLs are `/catalog/<nickname>`: each Organization has a unique nickname, set once when it is created and renamed only by a `global_admin`. |
| W6 | The tRPC link calls `getIdToken()` before each request, and queries refetch only on navigation, user actions and return to the tab, never on reconnect or by polling, so tokens refresh only while the user is active. |
| W8 | Development signs in by popup through `<dev-project>.firebaseapp.com`, because the SDK always opens `https://<authDomain>/__/auth/…`; redirect and the `/__/auth/` proxy live behind Caddy. A session ends 7 days after the last Google sign-in, enforced by the API. Test sign-ins need an explicit opt-in setting, and the parity stack runs signed-out checks only. T02 gets its own approved record before PR 3. |
| W9 | Playwright projects and web component tests run in `America/Sao_Paulo`. |
| W10 | The production Firebase web config is committed as public identifiers, and the web build never runs under Doppler. |
| W11 | PR 3 delivers popup sign-in and the redirect code, PR 4 checks redirect by hand through Caddy over HTTPS, and real phones first sign in on a deployed HTTPS environment. Foundation Step 6 stays TBD until the app is validated locally. |

W1–W3 and W7 are unchanged. Section 4 adds the owner's catalog-loading
direction, and section 6 lists Organization invitations, TBD until the website
is developed.

### Later changes

Later approvals changed these decisions. Sections 3–6 include the changes, and
the [technical direction](technical-direction.md) keeps each approval record.

| Item | Change | Source |
| --- | --- | --- |
| W3 | Under `style-src 'self'` both antd modes rendered unstyled, so antd's runtime styles stay and PR 4's Content-Security-Policy allows inline styles. Light mode only. Where a design detail needs more than a theme token or one CSS Module class, antd's default stays. | [Web shell](technical-direction.md#frontend-pr-1-web-shell-plan-approval-2026-11-01) WS-06 and its implementation-time decisions (2026-11-01) |
| W4 | Namespaces `common`, `app`, `login` and `catalog`. In the back office the language switch sits at the bottom of the side menu and in the menu drawer's footer; the Login and catalog pages keep it in their header. | WS-09 and the web shell's implementation-time decisions (2026-11-01) |
| W5 | `organizations.nickname`, unique with a provisional rule until D04/E10, and `organizations.currency` exist. The header is `x-organization-id`, checked against the Membership by `organizationProcedure(minRole)`. The active Organization is the only Membership's, or the lowest Organization ID while a User has several. | [Sign-in](technical-direction.md#t02-record-and-sign-in-plan-approval-2026-11-04) SI-04 and its web session (SI-09–SI-13); AU-09 (2026-11-04) |
| W6 | firebase 13.2.0 raised the SDK's refresh margin from 30 seconds to 5 minutes. Past the 7-day limit the link signs out instead of asking for a token. Loaders call `queryClient.query({ …, staleTime: "static" })`. | The sign-in approval and AU-03 (2026-11-04); WS-05 (2026-11-01) |
| W8 | T02's record settles the session policies, and the API verifies tokens with `jose`. Redirect needs a coarse primary pointer and `authDomain` on the page's own host. The test opt-in is set in `.env.test` only, refused when `NODE_ENV` is `production` or unset, and limited to `e2e-` uids. Playwright's setup mints custom tokens through IAM with the developer's gcloud login and signs in through a development-only hook. One phone project, Pixel 7. | [T02's record](t02-authentication-record-2026-11-03.md) AU-02–AU-11; SI-02, SI-11, SI-15 and SI-17 (2026-11-04); [Playwright](technical-direction.md#frontend-pr-2-playwright-plan-approval-2026-11-02) (2026-11-02) |
| W9 | Two Chromium projects, Desktop Chrome and Pixel 7, portrait only. Tests tagged `@phone` or `@desktop` run in one of them. The saved session's ignore entry is `**/playwright/.auth/`. WebKit, iPhone and Safari checks wait for T04's real devices. | The owner's changes, PW-03 and PW-08 (2026-11-02) |
| W10 | The Firebase web values live in Vite's committed mode files, checked by `vite.config.mts`, rather than in Turborepo's `env` list. | The sign-in approval, SI-03 (2026-11-04) |
| W11 | PR 3 became PRs 3a ([#132](https://github.com/WilliamPhilippe/storage-minis/pull/132), API) and 3b ([#133](https://github.com/WilliamPhilippe/storage-minis/pull/133), web). PR 3b's sign-out is a Sign out button; the user badge ([#1](https://github.com/WilliamPhilippe/storage-minis/issues/1)) and "Sign out of all devices" go to the account menu in [#130](https://github.com/WilliamPhilippe/storage-minis/issues/130). | SI-01 and the owner's changes after the gap review (2026-11-04) |

## 2. Context

### Already decided before this proposal

- The [accepted application stack](technical-direction.md#accepted-application-stack):
  React with Vite as a separate frontend application, TanStack Router, TanStack
  Query with the tRPC integration, Zod validation, Vitest and Playwright, ESLint
  and Prettier, and strict TypeScript. Its React Hook Form entry is replaced by
  W7.
- [Authentication](technical-direction.md#authentication-and-initial-administrator):
  Firebase Authentication with Google only. The API verifies Firebase ID tokens
  and enforces Membership; tokens refresh during active use, not while
  inactive; logout is explicit.
- [Money and dates](technical-direction.md#money-and-dates): integer
  centavos, UTC storage and reporting, and visitor-local display. Amounts are
  BRL today; requirements v0.8 makes the currency a choice each Organization
  makes once (follow-up review).
- The [foundation restructure](technical-direction.md#foundation-restructure-2026-10-31)
  direction (D5): a Caddy-based `web` image for the client-side SPA, implemented
  as T04 work.
- [Step 5](technical-direction.md#step-5-trpc-and-zod-plan-approval-2026-11-01),
  merged in [PR #114](https://github.com/WilliamPhilippe/storage-minis/pull/114):
  `/trpc` with plain JSON, no batching and no transformer, one error envelope,
  `diagnostics.echo`, and a types-only `@storage-minis/api/types` export.
- Vite 8.3.5 is already pinned at the repository root as Vitest's peer.

### Product shape

- Almost everything sits behind Google sign-in. Purchases with unit-level
  payment and expense allocation, Sales of specific Item IDs, customer Payments
  split across Sales, cancellations and Returns with refunds, reassignments and
  retained income, collection metrics, reports and the spreadsheet import
  preview are list- and form-heavy screens.
- The public catalog shows one Organization's approved Available units through
  a field allowlist, with optional prices and no stock counts
  ([D04 / #18](https://github.com/WilliamPhilippe/storage-minis/issues/18)).
  Visitors cannot write anything (ORG-006). Most visitors arrive on phones.
- [#1](https://github.com/WilliamPhilippe/storage-minis/issues/1) asks for a
  signed-in user badge at the top of the app.

## 3. Architecture

```text
Browser: apps/web, one React SPA, mobile-first
  /catalog/<nickname>  public; never loads Firebase
  /login               Google sign-in: popup, or redirect on phones (W8)
  /app/…               back office, guarded by the router
     │
     │ same origin
     ├── /trpc/*     Authorization: Bearer <ID token> + active Organization (W5)
     └── /__/auth/*  Firebase's sign-in helper, parity and production only (W8)
     ▼
  dev:          Vite dev server ─── /trpc ────► Fastify API ─► PostgreSQL
  parity/prod:  Caddy `web` ─────── /trpc ────► Fastify API ─► PostgreSQL
                            └────── /__/auth ─► <project>.firebaseapp.com
```

```text
apps/web/src/
├── main.tsx          i18n, then QueryClientProvider → AppProviders (ConfigProvider) → RouterProvider
├── router.tsx        createRouter({ routeTree, context: { queryClient, trpc, session } })
├── routes/           file-based route definitions only; the plugin generates routeTree.gen.ts
│   ├── __root.tsx         error and not-found pages
│   ├── catalog/…          public at /catalog/<nickname>; content waits for D04/E10
│   ├── login.tsx
│   └── app/route.tsx      the /app guard and the shell's layout route
├── i18n/
│   ├── en-US/        source catalogs, one namespace per area (main language)
│   └── pt-BR/        typed against en-US, so a missing key fails type checking
├── lib/
│   ├── trpc.ts       tRPC client + options proxy; adds the token and Organization
│   ├── session/      Firebase (imported lazily), the startup check, user, Memberships, active Organization
│   └── format/       amounts from integer cents ($, or the catalog's symbol); UTC → local time
├── ui/               AppProviders, theme and tokens, shared components; form fields and lists later
└── features/<area>/  pages: login, shell, home, sections, catalog, errors; business screens later
```

- **Reads:** a route loader runs
  `queryClient.query({ ...trpc.<procedure>.queryOptions(input), staleTime: "static" })`
  (WS-05), and the page reads the same cache entry. Links preload on hover or
  touch (`defaultPreload: 'intent'`).
- **Writes:** `useMutation(trpc.<procedure>.mutationOptions())`, then
  invalidation by `trpc.<router>.pathKey()`.
- **Session:** after sign-in, `session.get` loads the user and their
  Memberships, and the app picks the active Organization (W5). Components read
  them with `useSession()`, and route loaders through the router context. The
  tRPC link calls `getIdToken()` before each request (W6), which returns the
  cached token or refreshes one that expires within 5 minutes, and attaches it
  with the active Organization's `x-organization-id`. Requests follow user
  activity only, so a token is refreshed only while the user is active, and a
  session ends 7 days after the last Google sign-in; past that, the link signs
  out instead of refreshing (W8). Switching Organization or signing out cancels
  in-flight queries and clears the cache. TanStack's documentation is explicit
  that "A route guard is not a data authorization boundary": the API enforces
  Membership.
- **Language:** one setting drives the app strings, antd's component texts,
  dayjs, validation messages, number and date formats, and `<html lang>`. Only
  the active language's strings and locales load (W4).
- **Errors:** read `error.data.code` from the Step 5 envelope and map
  `BAD_REQUEST` issues (`path`, `code`) onto form fields. `UNAUTHORIZED` signs
  out with "Your session ended"; `FORBIDDEN` reloads the session, and the guard
  shows the page or the "No access" state; a 5xx or a network failure never
  signs anyone out ([web session](local-development.md#web-session)).
- **Types:** `import type { AppRouter } from "@storage-minis/api/types"`, so no
  server code reaches the browser bundle.

## 4. Mobile-first design

- **Catalog:** designed for phones first: a two-column card grid, lazily loaded
  images and filters in a bottom drawer. Its route chunk stays small and loads
  only the catalog's strings in the visitor's language (W4). It is rendered in
  the browser, link previews stay generic (W1), and a 1–2 second load on a
  phone is acceptable until T04 sets targets (owner, 2026-11-01).
- **Back office shell:** a top bar; on phones, a floating menu button that
  opens the menu in a bottom drawer; from `bp-md`, a collapsible side menu,
  collapsed by default up to `bp-lg` (WS-08).
- **Lists:** filterable lists are the default on phones and desktops: rows or
  cards with search and filters, with the filters in a bottom drawer on phones.
  A big table is decided for the screen that needs it, including how it behaves
  on phones.
- **Forms:** stacked fields at full width, a sticky action bar on phones, and
  touch-sized controls: antd's large size on phones, 44 px high.
- **antd caveat:** antd is desktop-oriented in places (wide tables, range
  pickers, hover tooltips), so each screen designs its phone variant, and
  nothing depends on hover.
- **In-app browsers:** Google blocks OAuth in embedded webviews
  (`disallowed_useragent`), and messaging apps often open links in one. The
  catalog needs no sign-in; the login page detects an in-app browser and asks
  the user to open the page in their regular browser.
- **Verification:** Playwright runs each end-to-end test in a phone and a
  desktop project, apart from tests tagged for one layout (W9). Real phones
  first sign in on a deployed HTTPS environment (W8). Real-device checks,
  including iPhone and Safari, and the supported browser and device list remain
  T04 ([#23](https://github.com/WilliamPhilippe/storage-minis/issues/23)) and
  E12.03 ([#73](https://github.com/WilliamPhilippe/storage-minis/issues/73)).

## 5. Decisions

### W1. One app or several

**Decided: one SPA split by route.** One build, one image, one origin. Catalog
visitors download only the catalog's route code and the shared core; Firebase
loads only from `/login` and `/app`.

Accepted limitation: a catalog link shared on WhatsApp or Instagram shows the
same preview for every page, because preview crawlers do not run JavaScript.
TanStack Start is built on TanStack Router, so the catalog could move to server
rendering later without changing the data layer. Two SPAs and a server-rendered
catalog (TanStack Start or Next.js, which would need a Node web server in
production) were not chosen.

### W2. Design system

**Decided: Ant Design 6.**

- First-party components for the whole back office: Table (sorting, filtering,
  fixed columns, virtual scrolling, summary rows), List, Form layout,
  InputNumber, DatePicker and RangePicker, Select, Upload, Image, Descriptions,
  Statistic, Timeline, Steps, Drawer, Modal and notifications.
- antd 6 "requires React >= 18" and supports React 19 by default. CSS variables
  are on by default. Styles are generated at runtime by `@ant-design/cssinjs`
  unless zero-runtime mode (6.0+) is enabled with `antd/dist/antd.css` and
  `theme.zeroRuntime`.
- `@ant-design/pro-components` 2.8.10 (ProTable, ProLayout, ProForm) declares
  `antd ^4.24.15 || ^5.11.2`, so layouts are built from base components.
  Deprecated v5 APIs still work with warnings and are removed in v7.
- Phone layouts need per-screen design work ([section 4](#4-mobile-first-design)).

Considered and not chosen: Mantine 9.7 (static CSS, no first-party data table),
shadcn/ui with Tailwind 4 (components copied into the repository) and MUI 9.5
(Material look; advanced grid features and the date-range picker in paid MUI X
tiers).

### W3. Styling

**Decided: antd theme tokens through `ConfigProvider`, plus CSS Modules (built
into Vite) for page layout; no other styling library.**

The first step prototyped antd's zero-runtime mode, which could have let
Caddy's Content-Security-Policy stay strict for styles; antd's `ConfigProvider`
accepts a `csp` nonce, which a static SPA cannot vary per request. In a real
browser under `style-src 'self'`, both modes rendered unstyled, so antd's
runtime styles stay and PR 4's policy allows inline styles (WS-06). Light mode
only.

Where a design detail needs more than a theme token or one CSS Module class,
antd's default stays (owner, 2026-11-01). The look comes mostly from colors
that follow the logo's racing red, with antd's own design and small tweaks for
everything else: ink is the primary color, and racing red is kept for
attention. [`docs/design/`](../design/README.md) holds the approved design
system.

### W4. Languages and money display

**Decided: i18next with react-i18next; en-US is the main language and pt-BR the
second; strings live in the frontend.**

- **What antd covers:** its locale setting (`ConfigProvider locale`, with
  `en_US` and `pt_BR` among its locales) translates only antd's own built-in
  texts: pagination, date pickers, empty states, modal buttons. It has no API
  for the app's own strings, hence the library.
- **Catalogs:** plain TypeScript objects, with no extraction or compile step;
  plurals and interpolation are built in. They are split into namespaces by
  area (`common`, `app`, `login` and `catalog`, later one per feature). Keys are
  type-checked by declaring the en-US catalogs as the resource types. Both
  packages' peer ranges include TypeScript 6, although the i18next TypeScript
  page still says v5.
- **Loading:** only the active language loads, through `import()` and
  `addResourceBundle`, with no extra package; antd's and dayjs's locales for
  that language load the same way. Catalog visitors then download only the
  catalog's strings in their language (follow-up review).
- **Language choice:** detection stays in our code (the saved choice, then the
  browser's language, then en-US), so no detector plugin. The choice is saved
  per browser in localStorage. The switch sits in the Login and catalog pages'
  headers and, in the back office, at the bottom of the side menu and in the
  menu drawer's footer.
- **What switches:** the app strings, antd's `locale`, the dayjs locale,
  validation messages, `Intl` number and date formats and `<html lang>`.
- **Tests** use the en-US catalog (W9).
- **Considered and not chosen:** use-intl, Lingui and Paraglide (message macros
  or a compiler add a build transform and an extraction step), and react-intl.

**Money display:** amounts are integers in the Organization's currency and
carry no currency themselves (follow-up review). Each Organization chooses its
currency once, when it is created: BRL by default, or USD. Both have cents, so
integer amounts stay exact. The back office shows `$` and the amount for every
Organization, with cents only when they are not zero, and separators that follow
the language: en-US `$1,234.50`, pt-BR `$1.234,50`. Negative amounts put the
sign before `$`: `-$400.50` in en-US, `-$400,50` in pt-BR. The public catalog
shows the Organization's symbol in place of `$`: `R$` for BRL and `US$` for
USD, as in `R$1.234,50` or `US$1,234.50`. Amounts are formatted from integer
cents without floating-point drift; `Intl.NumberFormat`'s
`trailingZeroDisplay: "stripIfInteger"` removes "the fraction digits if they
are all zero". Nothing is converted; requirements v0.8 publishes the currency
rule.

### W5. Routing, URLs and the active Organization

**Decided:**

- No Organization id in back-office URLs.
- **Session context.** Loaded after sign-in from one session procedure (user,
  Memberships, active Organization) and kept in TanStack Query. Many screens
  need the active Organization, so components read it through a session hook,
  and route loaders read it through the router context. No extra state library
  is needed.
- **Persistence.** Nothing is stored while each user has one Membership: the
  server returns it and the app selects it. While a user has several, the app
  takes the lowest Organization ID (sign-in plan).
- **Transport.** The tRPC link adds `x-organization-id` from the session
  context, and `organizationProcedure(minRole)` checks the Membership and puts
  the Organization in the procedure context (AU-09). Switching Organization
  cancels in-flight queries and clears the cache, which keeps private caches
  scoped by Organization as the technical direction requires.

Routing: file-based routes through `@tanstack/router-plugin` with
`autoCodeSplitting` (TanStack says v2 will default it to true). TanStack advises
excluding the generated `routeTree.gen.ts` from ESLint and Prettier. URLs: `/` →
`/app`; `/login`; `/app/…` signed in; `/catalog/<nickname>` public. Each
Organization has a unique nickname, set once when the Organization is created
and renamed only by a `global_admin` (follow-up review). The `/catalog/` prefix
keeps nicknames from colliding with `/app` or `/login`. D04/E10 specify the
nickname's other rules: characters, length, letter case, and whether old links
redirect after a rename. Sign-in PR 3a added the column, with a provisional
rule until then (SI-04). Filters and pagination live in URL search params, validated by
Zod 4 schemas passed directly to `validateSearch`.

Considered and not chosen: an `organizationId` field in every procedure input,
and an Organization derived on the server from the user's single Membership.

### W6. Data layer

**Decided: `@trpc/tanstack-react-query` 11.22.1.** tRPC: "We think it's the
future and recommend using this over the classic client." Its documented SPA
setup applies: "When building an SPA using only client-side rendering with
something like Vite, you can create the QueryClient and tRPC client outside of
React context as singletons."

- `httpLink` to `/trpc` with no batching and no transformer (P5-02). The Vite
  dev server proxies `/trpc` to the API, and Caddy does the same in the parity
  stack and production, so every environment is same-origin and needs no CORS.
- Router: `defaultPreload: 'intent'` and `defaultPreloadStaleTime: 0`. TanStack:
  with an external cache, "the only change you'll need to make is to set the
  defaultPreloadStaleTime option on the router to 0".
- Tokens (follow-up review): the tRPC link calls `getIdToken()` before each
  request, so a token is refreshed only when a request needs it and the cached
  one expires within 5 minutes, the SDK's own margin since firebase 13.2.0 (it
  was 30 seconds). Past the 7-day limit the link signs out instead (AU-03).
  Requests follow user activity only: navigation, user actions and the tab
  returning to view
  (`refetchOnWindowFocus`). `refetchOnReconnect` is off and nothing polls, so an
  idle tab never refreshes. The SDK refreshes in the background only when
  another Firebase product, such as Firestore, registers a token listener, so
  adding one means revisiting this rule.
- Query: no automatic retry for 4xx tRPC errors; mutations are never retried
  automatically, because mutation retry and idempotency conventions remain T06
  design work; the cache is cleared on sign-out and on Organization switch.

### W7. Forms

**Decided: TanStack Form 1.33, with our own antd field components.** This
replaces the React Hook Form choice approved on 2026-10-21.

- It "natively supports all libraries following the Standard Schema
  specification", so Zod schemas go straight to its validators, with no resolver
  package.
- `createFormHook` registers our antd field components once ("pre-bound custom
  UI components"), so our adapter follows the library's documented pattern.
  Field names are type-checked.
- Server errors land on fields by returning `{ fields }` from `onSubmitAsync`,
  and array fields cover allocation lines.
- Stable since 1.0.0 (2025-03-02), with about 5.9 million weekly downloads.
- Caveats: its UI-library guide has no antd example, and validation does not
  transform values, so `onSubmit` parses with the schema.

Forms that reuse API input schemas need a runtime package (for example
`packages/contracts`), created with the first business form. Money inputs edit
integer centavos and arrive with the first money form, following T03's input
contract and the display rule in W4.

Considered and not chosen: React Hook Form 7.91 with `@hookform/resolvers`. It
is the most adopted option, at about 60 million weekly downloads, but version 8
has been in beta since December 2025, and the resolvers package released two
major versions in two weeks (6.0.0 on 2026-10-19, 7.0.0 on 2026-10-31).

### W8. Sign-in

**Decided: both flows, a Firebase dev project for local development, and a
test-only custom-token sign-in for Playwright.**
[T02's record](t02-authentication-record-2026-11-03.md) (AU-01–AU-12) settles
the session policies, and sign-in PRs 3a and 3b implement them; the
[local development reference](local-development.md#sign-in-and-authorization)
describes the contracts.

**Flows:**

- Redirect (`signInWithRedirect`, which Google calls "preferred on mobile
  devices") is used only where the primary pointer is coarse (phones and
  tablets) and `authDomain` is the page's own host; everything else uses
  `signInWithPopup` (SI-11). A blocked popup (`auth/popup-blocked`) falls back
  to redirect where it is allowed, and otherwise an alert asks the user to allow
  pop-ups. Development always uses popup.
- Both flows open `https://<authDomain>/__/auth/handler` and a hidden
  `https://<authDomain>/__/auth/iframe`, always over `https` unless the emulator
  is configured (`@firebase/auth` 1.13.8, shipped in firebase 13.1.0). Redirect
  needs that helper on the app's own origin in browsers that block third-party
  storage, so in the parity stack and production Caddy forwards
  `https://<app domain>/__/auth/` transparently to
  `https://<project>.firebaseapp.com/__/auth/`, `authDomain` is the app's own
  domain, and `https://<app domain>/__/auth/handler` is authorized as a redirect
  URI. The popup flow works with the same setup. PR 4 adds the proxy and the
  `authDomain` switch (SI-18).
- Development keeps `authDomain` at `<dev-project>.firebaseapp.com` and signs
  in by popup, which Firebase's redirect guide lists as a fix when third-party
  storage is blocked. The Vite dev server has no `/__/auth/` proxy and needs no
  certificate (follow-up review).
- The Firebase SDK is imported lazily, so catalog visitors never download it.
  Both flows load `https://apis.google.com/js/api.js`, which the
  Content-Security-Policy allows (W10).

**Local development:**

- Firebase "recommends using a separate Firebase project for each environment".
- Projects created after April 28, 2025 no longer authorize `localhost` by
  default, and Google "strongly discourages" it in production projects. So
  `localhost` is authorized only in the dev project, where developers sign in
  with their real Google account in a desktop browser at
  `http://localhost:5173`. No emulator runs.
- Phones cannot sign in during development, because they cannot reach the
  developer's `localhost`. Real phones first sign in on the first deployed HTTPS
  environment: staging if T04 adds one, otherwise production. Playwright's
  phone project still covers signed-in screens through the test sign-in.

**Session limit (follow-up review):** a session ends 7 days after the last
Google sign-in. The API rejects ID tokens whose `auth_time` is older than that,
whatever their refresh history, because a refresh keeps the original
`auth_time`. The app does not refresh such a session and sends the user to
`/login`. On startup the SDK calls `getIdToken()` on a saved session, so the
app checks the sign-in time before Firebase loads that session (AU-03). Within
the 7 days there is no idle timeout: returning after inactivity refreshes the
token on the first action. This replaces the technical direction's "No absolute
or idle session timeout has been chosen".

**Tests:** Playwright cannot sign in through Google's real page reliably. Google
says it "might stop sign-ins from browsers that … Are being controlled through
software automation rather than a human", and Playwright's advice is to "Only
test what you control."

- **Test sign-in (SI-15, SI-17):** Playwright's setup project mints a Firebase
  custom token for a test user with an `e2e-` uid (`firebase-admin`'s
  `createCustomToken`), signed through IAM as a no-role service account with the
  developer's gcloud Application Default Credentials, so no key file exists. It
  signs in through a hook that only development builds contain.
- **Saved session:** Playwright saves Firebase's IndexedDB session
  (`indexedDB: true`, since 1.51) and reuses it, so the browser holds a real
  Firebase session and the API verifies a real ID token.
- **Production stays Google-only (AU-11):** the API accepts `custom` tokens
  only with `AUTH_TEST_SIGN_IN=enabled`, which only `.env.test` sets and
  `compose.yaml` never maps. It refuses to start with that setting when
  `NODE_ENV` is `production` or unset, and accepts only `e2e-` uids. Production
  and the parity stack accept Google sign-ins only.
- **Parity stack:** Playwright against the parity stack runs signed-out checks
  only, because its API runs as production and its web image has no test entry
  point. Signed-in tests run against the Vite dev server (PW-06).

**T02:** [T02's record](t02-authentication-record-2026-11-03.md) settles local
browser persistence (AU-02), the three checks of the 7-day limit (AU-03),
sign-out of this browser only (AU-04), revocation through
`users.sessions_valid_after` (AU-05), Google-only recovery (AU-06), the
configured administrator bootstrap (AU-07), role capabilities and procedure
classes (AU-08, AU-09), the "No access" state (AU-10) and the test sign-in
policy (AU-11). The API verifies tokens with `jose` against Google's public
keys, which needs no service account (SI-02, SI-05).

Considered and not chosen: the Firebase Auth emulator (the `firebase-tools` CLI,
its configuration and a long-running process: the boilerplate the owner wants
to avoid), a saved manual sign-in with a real Google test account, an API test
bypass that accepts fake tokens, an HTTPS dev server with a locally trusted
certificate so that development uses the proxy (a host install, and phones
still could not sign in locally), and a 7-day idle timeout enforced only by the
app (follow-up review).

### W9. Tests

**Decided: Vitest with jsdom and Testing Library inside `pnpm check`;
Playwright follows right after the web shell, outside `pnpm check` like
`test:stack`.** antd needs a small `matchMedia` stub in the component-test
setup.

Every component is built for Playwright from the start:

- Locate by role and label first (`getByRole`, `getByLabel`), as Playwright
  recommends. Use `data-testid` only where no role or label identifies the
  element, or for repeated records such as an item card keyed by its Item ID.
- Every form field has a visible label, and every icon-only button has an
  accessible name.
- Tests read accessible names from the en-US catalog instead of repeating text,
  so copy changes do not break them; a pt-BR smoke test checks the second
  language. Each Playwright project pins `locale` and
  `timezoneId: 'America/Sao_Paulo'` (UTC−03:00, no daylight saving since 2019),
  and the web Vitest configuration sets the same `TZ`, so a UTC instant late in
  the evening shows on the previous local day in every run (follow-up review).
- Projects: Desktop Chrome (1280 × 720) and Playwright's full
  `devices['Pixel 7']` profile, both in Chromium and portrait only (owner,
  2026-11-02). Tests that depend on one layout are tagged `@phone` or
  `@desktop` and run in that project only; every other test runs in both, and a
  shared check asserts that pages do not scroll sideways. WebKit, iPhone and
  Safari checks wait for T04's real devices.
- Sign-in follows W8; the `**/playwright/.auth/` entry keeps the saved session
  out of git.
- Component tests use the same role and label queries through Testing Library.

### W10. Build, serving and tooling

**Decided as listed:**

- `apps/web` becomes the workspace package `@storage-minis/web`, with
  `@storage-minis/api` as a `workspace:*` devDependency for its types (P5-08),
  so Turborepo builds the API declarations before the web type check.
- A browser TypeScript profile (bundler resolution, DOM libraries,
  `jsx: react-jsx`, Vite client types, the shared strict flags) matches the
  Step 5 consumer test. Step 5's record says the browser type check loads no
  Fastify declarations, but the context's database type can still bring Node
  declarations into scope (P5-08 note), so lint flags Node globals in web code.
- `docker/web.Dockerfile` builds with pnpm and serves `dist/` with Caddy: SPA
  fallback, long-lived caching for hashed assets, a revalidated `index.html`,
  security headers including a Content-Security-Policy that allows inline
  styles (W3) and Firebase's `https://apis.google.com` script, `/trpc` proxied
  to `api` and `/__/auth/` to Firebase (W8). Its build must let
  `apps/web/.env.production` in, although `.dockerignore` keeps every `.env*`
  file out of images today. A `web` service joins Compose and the parity stack;
  production deployment stays T04.
- Firebase's web configuration consists of public identifiers: four
  `VITE_FIREBASE_*` values in Vite's committed mode files,
  `apps/web/.env.development` (the dev project) and `.env.production`
  (production), which `vite.config.mts` checks with Zod whenever Vite serves,
  builds or previews (SI-03). Committing both is a recorded exception to the
  rule that production values live only in Doppler
  ([local setup](../../README.md#local-setup)): every visitor's browser receives
  them anyway. The web build never runs under Doppler, so no server secret
  reaches it, as D5 requires; the API keeps its own values, such as the project
  ID it checks tokens against, in Doppler on the VPS. Turborepo hashes the
  committed files as inputs, so `turbo.json` lists nothing for them.
- ESLint: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `@tanstack/eslint-plugin-query` and `@tanstack/eslint-plugin-router`, all
  declaring ESLint 10 support, with browser globals for web files.
  `eslint-plugin-jsx-a11y` 6.10.2 is left out because its peer range stops at
  ESLint 9; Playwright's role-based locators and the labelling rules in W9 cover
  part of that ground.
- React Compiler: not now. `@vitejs/plugin-react` 6 marks its native compiler
  as experimental, and the Babel route adds `@rolldown/plugin-babel`,
  `@babel/core` and `babel-plugin-react-compiler`. The react-hooks rules keep
  code ready for it.

### W11. Delivery sequence

**Decided: four PRs, each leaving the repository working.** PR 3 became two,
3a and 3b (SI-01), and
[#118](https://github.com/WilliamPhilippe/storage-minis/issues/118) tracks them
all.

1. **Web shell**, delivered in
   [#121](https://github.com/WilliamPhilippe/storage-minis/pull/121) and its
   follow-up [#125](https://github.com/WilliamPhilippe/storage-minis/pull/125):
   - `apps/web`, antd, the theme and the responsive shell.
   - Both language catalogs, split by area and loaded per language, with the
     language switch, plus money and date formatting.
   - A route skeleton with placeholder pages, and tRPC with TanStack Query
     calling `diagnostics.echo` through the Vite proxy.
   - Component tests, the testability rules from W9, and web checks inside
     `pnpm check`.
2. **Playwright**, delivered in
   [#124](https://github.com/WilliamPhilippe/storage-minis/pull/124): phone and
   desktop projects in `America/Sao_Paulo` and `pnpm test:e2e`, which needs
   `pnpm db:up` like `test:api`. Smoke tests cover the language switch,
   responsive navigation, the public catalog placeholder, the echo round-trip
   and the no-sideways-scroll check.
3. **Sign-in end to end**, delivered as PR 3a, API identity and authorization
   ([#132](https://github.com/WilliamPhilippe/storage-minis/pull/132)), and
   PR 3b, web sign-in and the Playwright session
   ([#133](https://github.com/WilliamPhilippe/storage-minis/pull/133)): T02's
   approved record, the Firebase dev project, popup sign-in and the redirect
   code, API token verification with the 7-day session limit, the session
   context with the active Organization (W5), a Sign out button and the
   Playwright test sign-in behind its opt-in setting. The user badge
   ([#1](https://github.com/WilliamPhilippe/storage-minis/issues/1)) moved to the
   account menu in [#130](https://github.com/WilliamPhilippe/storage-minis/issues/130).
4. **Web image**, waiting for the first deployment: Caddy (the SPA, the `/trpc`
   and `/__/auth/` proxies and headers), `web` in Compose and the parity stack,
   Playwright's signed-out checks against the parity stack, and a manual
   redirect sign-in through Caddy over HTTPS (SI-18).

Business screens and catalog content follow through their own issues.
Foundation Step 6 (repeatable verification and handoff) stays TBD and is
re-planned once the app is validated locally (owner, 2026-11-01).

## 6. Deferred decisions

Still open:

- **Big tables (section 4):** behavior on phones and desktops, decided for each
  screen that needs one.
- **Active Organization persistence (W5):** once users can belong to several
  Organizations (ORG-003). localStorage, validated against the Memberships on
  load, is the current recommendation.
- **Catalog ([D04 / #18](https://github.com/WilliamPhilippe/storage-minis/issues/18) and E10):**
  the nickname's rules, which replace the provisional one, and the catalog's
  fields, search, filters and images.
- **Organization invitations:** how Organizations beyond the bootstrap one are
  created. The owner's first outline, not decided: a `global_admin` invites a
  person to a new Organization, and that person, on signing in without one,
  creates it and sets its name, nickname and currency once. TBD until the
  website is developed (owner, 2026-11-01).
- **Money input ([T03 / #24](https://github.com/WilliamPhilippe/storage-minis/issues/24)):**
  money input and date-only semantics, for integer cents in the Organization's
  currency.
- **Reports ([D05 / #19](https://github.com/WilliamPhilippe/storage-minis/issues/19)):**
  report screens and charts; no chart library is proposed yet.
- **Production ([T04 / #23](https://github.com/WilliamPhilippe/storage-minis/issues/23)):**
  hosting and deployment, supported browsers and devices, performance targets,
  real-device checks and the production Content-Security-Policy.
- **Foundation Step 6:** TBD until the app is validated locally.

Decided since 2026-11-01: the Playwright sign-in structure (SI-15, SI-17), the
remaining session policies and token verification (T02's record), how the Login
page chooses popup or redirect (SI-11), the database and env file of
`pnpm test:e2e` (PW-06), what a signed-in user with no Membership sees (AU-10)
and the browser API keys' restrictions (SI-14).

## Sources

Consulted on 2026-11-01.

- TanStack Router:
  [installation with Vite](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite),
  [file-based routing API](https://tanstack.com/router/latest/docs/framework/react/api/file-based-routing),
  [data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading),
  [search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params),
  [authenticated routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes).
- TanStack Form: [overview](https://tanstack.com/form/latest/docs/overview),
  [comparison](https://tanstack.com/form/latest/docs/comparison),
  [validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation),
  [form composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition),
  [UI libraries](https://tanstack.com/form/latest/docs/framework/react/guides/ui-libraries),
  [arrays](https://tanstack.com/form/latest/docs/framework/react/guides/arrays).
- tRPC: [TanStack React Query setup](https://trpc.io/docs/client/tanstack-react-query/setup),
  [usage](https://trpc.io/docs/client/tanstack-react-query/usage).
- Ant Design: [v6 migration](https://ant.design/docs/react/migration-v6),
  [theme customization](https://ant.design/docs/react/customize-theme),
  [internationalization](https://ant.design/docs/react/i18n),
  [ConfigProvider](https://ant.design/components/config-provider),
  [changelog](https://ant.design/changelog).
- Mantine: [9.0.0 changelog](https://mantine.dev/changelog/9-0-0/),
  [8.x to 9.x guide](https://mantine.dev/guides/8x-to-9x/),
  [extensions](https://mantine.dev/x/extensions/).
- i18next: [TypeScript](https://www.i18next.com/overview/typescript).
- Playwright: [authentication](https://playwright.dev/docs/auth),
  [release notes](https://playwright.dev/docs/release-notes),
  [`storageState`](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state),
  [emulation](https://playwright.dev/docs/emulation),
  [best practices](https://playwright.dev/docs/best-practices),
  [locators](https://playwright.dev/docs/locators).
- Firebase:
  [redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices),
  [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin),
  [custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens),
  [custom-token sign-in on the web](https://firebase.google.com/docs/auth/web/custom-auth),
  [verifying ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens),
  [managing user sessions](https://firebase.google.com/docs/auth/admin/manage-sessions),
  [project best practices](https://firebase.google.com/docs/projects/dev-workflows/general-best-practices),
  [Authentication FAQ](https://firebase.google.com/docs/auth/faq-and-troubleshooting),
  [JavaScript SDK release notes](https://firebase.google.com/support/release-notes/js),
  [CLI release notes](https://firebase.google.com/support/release-notes/cli),
  [Emulator Suite installation](https://firebase.google.com/docs/emulator-suite/install_and_configure),
  [connecting to the Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth).
- Google: [signing in with a supported browser](https://support.google.com/accounts/answer/7675428),
  [OAuth in embedded webviews (2021)](https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html).
- MDN: [`Intl.NumberFormat` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).
- Package sources: the `@vitejs/plugin-react` 6.1.2 README, the
  `firebase-tools` 15.34.2 source (`lib/emulator/downloadableEmulators.js`), the
  `@firebase/auth` 1.13.8 source (`getHandlerBase`, `getIframeUrl`,
  `_reloadWithoutSaving`, `StsTokenManager.getToken`, `AuthInterop`), antd
  6.6.8's `dist/antd.css`, and npm registry metadata and weekly download counts
  for versions, peer dependencies and publish dates.
