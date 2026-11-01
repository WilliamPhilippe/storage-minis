# Frontend foundation proposal (2026-11-01)

**Status: decided by the owner on 2026-11-01; not yet implemented.** The owner
asked for a frontend architecture with options and decided every item, W1–W11,
on 2026-11-01, then refined W4–W6 and W8–W11 in a
[follow-up review](#follow-up-review-2026-11-01) the same day.
[Section 1](#1-owner-decisions-2026-11-01) records the decisions, and the
[technical direction](technical-direction.md#frontend-foundation-decisions-2026-11-01)
holds the approval record. W7 replaces the React Hook Form choice approved on
2026-10-21 with TanStack Form. [Section 8](#8-deferred-decisions) lists what the
owner left for later. This document authorizes no installation or
implementation by itself: each delivery step in W11 gets its own plan for
approval, as the [Step 5 plan](step-5-trpc-plan-2026-11-01.md) did for tRPC.
W1–W11 are references within this document, not requirement, issue or
F-decision IDs.

The proposal draws on [requirements v0.7](../requirements/requirements-v0.7.md),
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
refined them. Sections 3–8 describe the result.

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
direction, and section 8 lists Organization invitations, TBD until the website
is developed, and the items left to the step plans.

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
├── main.tsx          ConfigProvider (theme, antd locale) → QueryClientProvider → RouterProvider
├── router.tsx        createRouter({ routeTree, context: { queryClient, trpc, session } })
├── routes/           file-based; the plugin generates routeTree.gen.ts
│   ├── __root.tsx         error and not-found pages
│   ├── catalog/…          public at /catalog/<nickname>; content waits for D04/E10
│   ├── login.tsx
│   └── app/route.tsx      guard + responsive layout (menu, user badge from #1)
├── i18n/
│   ├── en-US/        source catalogs, one namespace per area (main language)
│   └── pt-BR/        typed against en-US, so a missing key fails type checking
├── lib/
│   ├── trpc.ts       tRPC client + options proxy; adds the token and Organization
│   ├── session/      Firebase (imported lazily), user, Memberships, active Organization
│   └── format/       amounts from integer cents ($, or the catalog's symbol); UTC → local time
├── ui/               theme tokens, form fields, filterable list, shared components
└── features/<area>/  inventory, purchasing, sales… (business screens later)
```

- **Reads:** a route loader prefetches `trpc.<procedure>.queryOptions(input)`
  into the QueryClient, and the page reads the same cache entry. Links preload
  on hover or touch (`defaultPreload: 'intent'`).
- **Writes:** `useMutation(trpc.<procedure>.mutationOptions())`, then
  invalidation by `trpc.<router>.pathKey()`.
- **Session:** after sign-in, one session query loads the user, their
  Memberships and the active Organization. Components read the active
  Organization through a session hook, and route loaders through the router
  context. The tRPC link calls `getIdToken()` before each request (W6), which
  returns the cached token or refreshes one that expires within 30 seconds, and
  attaches it with the active Organization. Requests follow user activity only,
  so a token is refreshed only while the user is active, and a session ends 7
  days after the last Google sign-in (W8). Switching Organization or signing out
  cancels in-flight queries and clears the cache. TanStack's documentation is
  explicit that "A route guard is not a data authorization boundary": the API
  enforces Membership.
- **Language:** one setting drives the app strings, antd's component texts,
  dayjs, validation messages, number and date formats, and `<html lang>`. Only
  the active language's strings and locales load (W4).
- **Errors:** read `error.data.code` from the Step 5 envelope, map
  `BAD_REQUEST` issues (`path`, `code`) onto form fields, and send
  `UNAUTHORIZED` to `/login`.
- **Types:** `import type { AppRouter } from "@storage-minis/api/types"`, so no
  server code reaches the browser bundle.

## 4. Mobile-first design

- **Catalog:** designed for phones first: a two-column card grid, lazily loaded
  images and filters in a bottom drawer. Its route chunk stays small and loads
  only the catalog's strings in the visitor's language (W4). It is rendered in
  the browser, link previews stay generic (W1), and a 1–2 second load on a
  phone is acceptable until T04 sets targets (owner, 2026-11-01).
- **Back office shell:** a top bar with a drawer menu on phones and a
  collapsible side menu from tablet widths up.
- **Lists:** filterable lists are the default on phones and desktops: rows or
  cards with search and filters, with the filters in a bottom drawer on phones.
  A big table is decided for the screen that needs it, including how it behaves
  on phones.
- **Forms:** stacked fields at full width, a sticky action bar on phones, and
  touch-sized controls (antd's large size or a taller control-height token).
- **antd caveat:** antd is desktop-oriented in places (wide tables, range
  pickers, hover tooltips), so each screen designs its phone variant, and
  nothing depends on hover.
- **In-app browsers:** Google blocks OAuth in embedded webviews
  (`disallowed_useragent`), and messaging apps often open links in one. The
  catalog needs no sign-in; the login page detects an in-app browser and asks
  the user to open the page in their regular browser.
- **Verification:** Playwright runs every end-to-end test on phone and desktop
  projects (W9). Real phones first sign in on a deployed HTTPS environment
  (W8). Real-device checks and the supported browser and device list remain
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

Prototype zero-runtime mode in the first step. The antd documentation says it
"will not generate style at runtime" but does not say whether custom theme
tokens still inject styles. If the prototype shows no runtime `<style>`
injection with our theme, Caddy's Content-Security-Policy can stay strict for
styles, and phones run less JavaScript. Otherwise keep runtime styles and allow
them in the policy; antd's `ConfigProvider` accepts a `csp` nonce, which a
static SPA cannot vary per request. Zero-runtime mode loads antd's whole
`dist/antd.css`, about 1 MB or 109 KB gzipped at 6.6.8, before a first visit
renders; the owner accepts a 1–2 second catalog load on a phone, so the
Content-Security-Policy result decides (follow-up review). Dark mode is not
proposed.

### W4. Languages and money display

**Decided: i18next with react-i18next; en-US is the main language and pt-BR the
second; strings live in the frontend.**

- **What antd covers:** its locale setting (`ConfigProvider locale`, with
  `en_US` and `pt_BR` among its locales) translates only antd's own built-in
  texts: pagination, date pickers, empty states, modal buttons. It has no API
  for the app's own strings, hence the library.
- **Catalogs:** plain TypeScript objects, with no extraction or compile step;
  plurals and interpolation are built in. They are split into namespaces by
  area (`common`, `catalog`, `app`, later one per feature). Keys are
  type-checked by declaring the en-US catalogs as the resource types. Both
  packages' peer ranges include TypeScript 6, although the i18next TypeScript
  page still says v5.
- **Loading:** only the active language loads, through `import()` and
  `addResourceBundle`, with no extra package; antd's and dayjs's locales for
  that language load the same way. Catalog visitors then download only the
  catalog's strings in their language (follow-up review).
- **Language choice:** detection stays in our code (the saved choice, then the
  browser's language, then en-US), so no detector plugin. The choice is saved
  per browser in localStorage, with a switcher in the app header and on the
  catalog.
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
  server returns it and the app selects it.
- **Transport.** A request header (for example `x-organization-id`) is added by
  the tRPC link from the session context. T02's authorization middleware checks
  Membership and puts the Organization in the procedure context. Switching
  Organization cancels in-flight queries and clears the cache, which keeps
  private caches scoped by Organization as the technical direction requires.

Routing: file-based routes through `@tanstack/router-plugin` with
`autoCodeSplitting` (TanStack says v2 will default it to true). TanStack advises
excluding the generated `routeTree.gen.ts` from ESLint and Prettier. URLs: `/` →
`/app`; `/login`; `/app/…` signed in; `/catalog/<nickname>` public. Each
Organization has a unique nickname, set once when the Organization is created
and renamed only by a `global_admin` (follow-up review). The `/catalog/` prefix
keeps nicknames from colliding with `/app` or `/login`. D04/E10 specify the
nickname's other rules: characters, length, letter case, and whether old links
redirect after a rename. T01 adds the column, since `organizations` has no
nickname today. Filters and pagination live in URL search params, validated by
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
  one expires within 30 seconds, the SDK's own margin. Requests follow user
  activity only: navigation, user actions and the tab returning to view
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

**Flows:**

- Phones use `signInWithRedirect`, which Google calls "preferred on mobile
  devices". Desktops use `signInWithPopup`, and a blocked popup
  (`auth/popup-blocked`) falls back to redirect. Redirect is used only where
  `authDomain` is the page's own origin, so development always uses popup.
- Both flows open `https://<authDomain>/__/auth/handler` and a hidden
  `https://<authDomain>/__/auth/iframe`, always over `https` unless the emulator
  is configured (`@firebase/auth` 1.13.8, shipped in firebase 13.1.0). Redirect
  needs that helper on the app's own origin in browsers that block third-party
  storage, so in the parity stack and production Caddy forwards
  `https://<app domain>/__/auth/` transparently to
  `https://<project>.firebaseapp.com/__/auth/`, `authDomain` is the app's own
  domain, and `https://<app domain>/__/auth/handler` is authorized as a redirect
  URI. The popup flow works with the same setup.
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
  with their real Google account in a desktop browser. No emulator runs.
- Phones cannot sign in during development, because they cannot reach the
  developer's `localhost`. Real phones first sign in on the first deployed HTTPS
  environment: staging if T04 adds one, otherwise production. Playwright's
  phone projects still cover signed-in screens through the test sign-in.

**Session limit (follow-up review):** a session ends 7 days after the last
Google sign-in. The API rejects ID tokens whose `auth_time` is older than that,
whatever their refresh history, because a refresh keeps the original
`auth_time`. The app does not refresh such a session and sends the user to
`/login`. On startup the SDK calls `getIdToken()` on a saved session, so the
app checks the sign-in time before Firebase loads that session; PR 3's plan
confirms the mechanism. Within the 7 days there is no idle timeout: returning
after inactivity refreshes the token on the first action. This replaces the
technical direction's "No absolute or idle session timeout has been chosen".

**Tests:** Playwright cannot sign in through Google's real page reliably. Google
says it "might stop sign-ins from browsers that … Are being controlled through
software automation rather than a human", and Playwright's advice is to "Only
test what you control."

- **Approved approach:** a test-only sign-in mints a Firebase custom token for a
  test user (Admin SDK `createCustomToken(uid)`) and signs in with
  `signInWithCustomToken`, through an entry point compiled only into development
  and end-to-end builds.
- **Saved session:** Playwright can save Firebase's IndexedDB session
  (`indexedDB: true`, since 1.51) and reuse it, so the browser holds a real
  Firebase session and the API verifies a real ID token.
- **Production stays Google-only:** the API accepts custom-token sign-ins only
  when an explicit opt-in setting is present. Only the committed development
  and test env files set it, never `compose.yaml`, so production and the parity
  stack accept Google sign-ins only, whatever `NODE_ENV` says; `.env.test`
  leaves `NODE_ENV` unset, which the API treats as production. T02 confirms the
  provider claim by decoding a test token.
- **Parity stack:** Playwright against the parity stack runs signed-out checks
  only, because its API runs as production and its web image has no test entry
  point. Signed-in tests run against the local development or end-to-end build
  (follow-up review).
- **Deferred (owner, 2026-11-01):** the structure of this sign-in, meaning its
  setup project, entry point and credential. The credential is either IAM
  signing with a developer's Google login through the gcloud CLI, which Firebase
  recommends because it avoids key files, or a service-account key kept in
  Doppler. Such a key would be the first real local secret, which the 2026-10-31
  restructure said would bring Doppler into local development.

**T02 first:** [T02 / #22](https://github.com/WilliamPhilippe/storage-minis/issues/22)
settles the remaining session policies in its own approved record, merged before
PR 3's plan: browser session persistence, logout scope and revocation, account
recovery, administrator bootstrap (the owner's Organization, in BRL, with the
nickname the owner chooses), the API's token verification and the Organization
header check (W5). The record carries forward this document's token rule (W6)
and session limit. The Admin SDK route "must have a service account"; a
standard JWT library needs only the project ID and Google's public keys.

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
- Projects: `devices['iPhone 15']` (WebKit), `devices['Pixel 7']` (Chromium),
  Desktop Chrome and Desktop Safari. Every end-to-end test runs on phones and
  desktops, and a shared check asserts that phone-width pages do not scroll
  sideways.
- Sign-in follows W8; `playwright/.auth` is ignored by git.
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
  security headers including a Content-Security-Policy that allows Firebase's
  `https://apis.google.com` script, `/trpc` proxied to `api` and `/__/auth/` to
  Firebase (W8). A `web` service joins Compose and the parity stack; production
  deployment stays T04.
- Firebase's web configuration consists of public identifiers. They become
  `VITE_*` build-time values validated with Zod at startup. Both the dev-project
  and the production values are committed (follow-up review), as a recorded
  exception to the implementation guide's rule against committing production
  values: every visitor's browser receives them anyway. The web build never
  runs under Doppler, so no server secret reaches it, as D5 requires; the API
  keeps its own values, such as the project ID it checks tokens against, in
  Doppler on the VPS. Turborepo's strict environment mode must list them.
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

**Decided: four PRs, each leaving the repository working.**

1. **Web shell:**
   - `apps/web`, antd, the theme and the responsive shell.
   - Both language catalogs, split by area and loaded per language, with the
     language switch, plus money and date formatting.
   - A route skeleton with placeholder pages, and tRPC with TanStack Query
     calling `diagnostics.echo` through the Vite proxy.
   - Component tests, the testability rules from W9, and web checks inside
     `pnpm check`.
2. **Playwright:** phone and desktop projects in `America/Sao_Paulo` and
   `pnpm test:e2e`, which needs `pnpm db:up` like `test:api`. Smoke tests cover
   the language switch, responsive navigation, the public catalog placeholder,
   the echo round-trip and the no-sideways-scroll check.
3. **Sign-in end to end:** T02's approved record, the Firebase dev project,
   popup sign-in and the redirect code, API token verification with the 7-day
   session limit, the session context with the active Organization (W5), the
   user badge (#1), sign-out and the Playwright test sign-in behind its opt-in
   setting.
4. **Web image:** Caddy (the SPA, the `/trpc` and `/__/auth/` proxies and
   headers), `web` in Compose and the parity stack, Playwright's signed-out
   checks against the parity stack, and a manual redirect sign-in through Caddy
   over HTTPS.

Business screens and catalog content follow through their own issues.
Foundation Step 6 (repeatable verification and handoff) stays TBD and is
re-planned once the app is validated locally (owner, 2026-11-01).
[Epic E13 / #89](https://github.com/WilliamPhilippe/storage-minis/issues/89)
asks for a focused child issue for scaffolding work like this; one is drafted
for the owner's review after this document merges.

## 6. Candidate versions

All are npm `latest` tags on 2026-11-01. Peer and engine ranges were checked
against TypeScript 6.0.3, ESLint 10.13.0, Vite 8.3.5 and Node 24.22.1 where the
packages declare them. Each step's plan re-verifies its pins.

| Package | Version | Notes |
| --- | --- | --- |
| `react`, `react-dom` | 19.3.1 | Published 2026-10-14. |
| `vite` | 8.3.5 | Already pinned at the repository root. |
| `@vitejs/plugin-react` | 6.1.2 | Peer `vite ^8.0.0`. |
| `@tanstack/react-router` | 1.170.46 | Peer React 18 or later; Node 20.19 or later. |
| `@tanstack/router-plugin` | 1.168.48 | Peer range includes Vite 8. |
| `@tanstack/react-query` | 5.105.0 | |
| `@trpc/client`, `@trpc/tanstack-react-query` | 11.22.1 | Match the Step 5 pins; peers TypeScript 5.7.2 or later and Query `^5.80.3`. |
| `@tanstack/react-form` | 1.33.5 | Peer React 17, 18 or 19. |
| `antd` | 6.6.8 | Peer React 18 or later. |
| `@ant-design/icons` | 6.3.4 | antd 6 requires icons 6. |
| `dayjs` | 1.11.23 | antd's date library. |
| `i18next` | 26.6.0 | Peer TypeScript `^5 \|\| ^6 \|\| ^7`. |
| `react-i18next` | 17.1.9 | Peers i18next 26.2.0 or later and TypeScript `^5 \|\| ^6 \|\| ^7`. |
| `zod` | 4.6.7 | Already pinned in the API. |
| `firebase` | 13.1.0 | 13.0.0's breaking changes are all in AI Logic; 13.1.0 stops Auth clearing the persisted session on transient 5xx errors. |
| `firebase-admin` or `jose` | 14.5.0 or 6.2.14 | Test token minting and API verification; T02 chooses. |
| `@playwright/test` | 1.64.1 | Storage state with IndexedDB since 1.51. |
| `jsdom` | 30.1.3 | Requires Node `^24.15.0` on the 24 line. |
| `@testing-library/react` | 16.3.3 | Peer `@testing-library/dom` 10. |
| `eslint-plugin-react-hooks` | 7.1.1 | Peer range includes ESLint 10. |
| `eslint-plugin-react-refresh` | 0.5.7 | Peer ESLint 9 or 10. |
| `@tanstack/eslint-plugin-query` | 5.105.0 | Peer ranges include ESLint 10 and TypeScript 6. |
| `@tanstack/eslint-plugin-router` | 1.162.0 | Peer range includes ESLint 10. |
| Caddy image | 2.11.7 | Released 2026-10-03. |

## 7. Boundaries and dependencies

- **Step 5:** merged in PR #114, so the web shell can consume
  `@storage-minis/api/types` and `diagnostics.echo` from `main`.
- **T02 ([#22](https://github.com/WilliamPhilippe/storage-minis/issues/22)):**
  its own approved record before PR 3, covering the remaining session policies,
  administrator bootstrap, API token verification with the 7-day session limit,
  the Organization header check (W5) and the opt-in rule for test sign-ins (W8).
- **T03 ([#24](https://github.com/WilliamPhilippe/storage-minis/issues/24)):**
  money input and date-only semantics, for integer cents in the Organization's
  currency.
- **T04 ([#23](https://github.com/WilliamPhilippe/storage-minis/issues/23)):**
  hosting and deployment, Doppler keys, supported browsers and devices,
  performance targets, real-device checks and the production
  Content-Security-Policy.
- **D04 ([#18](https://github.com/WilliamPhilippe/storage-minis/issues/18)) and
  E10:** the nickname's rules, catalog fields, search, filters and images.
- **D05 ([#19](https://github.com/WilliamPhilippe/storage-minis/issues/19)):**
  report screens and charts. No chart library is proposed yet.
- **Firebase projects:** the owner creates the dev project (W8) and, later, the
  production project.
- **Records:** this document's PR adds the approval record to the technical
  direction, replaces React Hook Form with TanStack Form in its accepted stack
  and in AGENTS.md, records the design system, styling conventions, language,
  locale and session limit as decided, marks Step 6 TBD and points the
  implementation guide here. Requirements v0.8 and entity map v0.9 publish the
  Organization currency and nickname rules in their own PR. Each delivery
  step's plan adds its own progress entry, and the README changes with the web
  shell.

## 8. Deferred decisions

- **Playwright sign-in structure (W8):** setup project, test-only entry point
  and credential.
- **Big tables (section 4):** behavior on phones and desktops, decided for each
  screen that needs one.
- **Active Organization persistence (W5):** once users can belong to several
  Organizations (ORG-003). localStorage, validated against the Memberships on
  load, is the current recommendation.
- **Catalog (D04/E10):** the nickname's rules, fields, search, filters and
  images.
- **Organization invitations:** how Organizations beyond the bootstrap one are
  created. The owner's first outline, not decided: a `global_admin` invites a
  person to a new Organization, and that person, on signing in without one,
  creates it and sets its name, nickname and currency once. TBD until the
  website is developed (owner, 2026-11-01).
- **Remaining session policies and token verification (T02).**
- **Money input contract (T03).**
- **Foundation Step 6:** TBD until the app is validated locally.

Left to the delivery step plans (follow-up review):

- How the login page chooses popup or redirect (PR 3).
- Which database and env file `pnpm test:e2e` uses (PR 2).
- What a signed-in user with no Membership sees (PR 3 and T02).
- HTTP-referrer restrictions on the dev project's API key, since the
  repository is public and its Firebase config is committed (PR 3).

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
