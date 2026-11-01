# Frontend PR 1 plan — web shell (2026-11-01)

**Status: approved by the owner on 2026-11-01, with the changes listed under
[Approval](#approval-2026-11-01); implemented in
[PR #121](https://github.com/WilliamPhilippe/storage-minis/pull/121).** The approval record, five implementation-time decisions, the
outcome and the evidence are in
[technical direction](technical-direction.md#frontend-pr-1-web-shell-plan-approval-2026-11-01).
Where this plan's text and that record differ (heading tokens, the QueryClient's
module, antd defaults kept where an override is not simple, the selected
backgrounds, and the language switch's place in the shell), the record
applies. The plan text below is kept as approved. This is the
plan for PR 1 of the
[frontend foundation decisions](frontend-foundation-proposal-2026-11-01.md)
(W11 item 1), delivered under
[E13.02 / #118](https://github.com/WilliamPhilippe/storage-minis/issues/118). It
follows the planning rules in the
[implementation guide](technical-foundation-implementation-guide.md#instructions-for-every-agents-plan).
WS-01–WS-13 are references within this plan, not requirement, issue or
F-decision IDs.

## Recommended decisions

| ID | Recommendation |
| --- | --- |
| WS-01 | Exact pins re-verified today, each the newest version at least 24 hours old, so pnpm's release-age rule needs no exception. Adds four packages the proposal did not list, and moves i18next one minor version back. |
| WS-02 | `apps/web` as `@storage-minis/web`; a root browser TypeScript profile; extensionless imports in web code; route files that hold only route definitions; one declaration file per CSS Module. |
| WS-03 | Vite bound to `127.0.0.1:5173`, opened as `http://localhost:5173`, with `/trpc/` proxied to the API. |
| WS-04 | Route skeleton: `/` → `/app`; the Login page as a non-working copy of its approved design; a `/catalog/$nickname` placeholder; the `/app` shell with a home page and eight section placeholders. The home page calls `diagnostics.echo`. Typed page titles; pending, error and not-found pages. |
| WS-05 | A QueryClient factory and the tRPC options proxy. No retry for 4xx; no refetch on reconnect; mutations never retried and never queued offline. Loaders use `queryClient.query({ …, staleTime: "static" })`. |
| WS-06 | W3 outcome: keep antd's runtime styles. Zero-runtime mode still injects `<style>` elements, so PR 4's policy must allow inline styles either way. Light mode only. Add antd's reset and one body rule. |
| WS-07 | Ten corrections to the approved design, from antd 6.6.8's actual behavior. |
| WS-08 | The responsive shell from the design system: link-based menus in named `nav` landmarks, an accessible collapse button, the safe-area inset, and resized logo files. |
| WS-09 | i18next loaded per language and per area through `import()`; typed keys; pt-BR typed against en-US; detection and failure handling in our code. |
| WS-10 | Money formatted from integer cents through exact decimal strings; dates through `Intl` in the visitor's time zone. |
| WS-11 | A `web-unit` Vitest project with jsdom inside `pnpm check`: a fresh app per test, stubbed `fetch`, and a console policy with declared exceptions. |
| WS-12 | ESLint React and TanStack rules for web code, with Node globals forbidden there; `//#lint` waits for the API build; ignore entries for generated files. |
| WS-13 | A docs PR first: this plan, its approval record and `docs/design/`. Then one implementation PR in four commit groups. |

## Approval (2026-11-01)

The owner approved WS-01–WS-13 on 2026-11-01, with these answers and changes.
They are already applied in the sections below.

1. **Release age (WS-01).** Use the newest version of each package that is at
   least 24 hours old, rather than waiting or adding exclusion entries. In the
   owner's words: "They release new versions very frequently". Every pin can be
   installed now.
2. **Design copy (WS-07).** The owner applies the corrections to the Claude
   originals, and PR 1 refreshes `docs/design/` from them, as its README says.
3. **Login page (WS-04).** The Login page is the first UI page. PR 1 builds it
   from its approved design as a page with no working feature. PR 3 adds sign-in.
4. **Design-system direction (WS-06, WS-07).** The personal look comes mostly
   from colors that follow the logo's racing red. Everything else uses antd's
   own design, with small tweaks. The owner confirmed that the color roles stay
   as approved: ink is the primary color, and racing red is the brand color,
   kept for attention.
5. **Light mode only (WS-06).** For now the app has only a light theme.

**What approval changes in approved documents:**

- WS-07 corrects the design system.
- WS-02 adds a web import convention next to the README's `.js` rule.
- WS-05 adds offline mutation behavior to W6.
- WS-03 names the development URL that W8's authorized domain expects.

## 1. Starting state

- `main` is at `f11f99a` (requirements v0.8, PR #116), after the frontend
  decisions (PR #115) and Step 5 (PR #114).
- There is no `apps/web`. The root pins Vite 8.3.5 only as Vitest's peer. The
  root Vitest config already discovers `apps/*/vitest.config.mts`.
- The API exports `type AppRouter` from `@storage-minis/api/types` and serves
  `diagnostics.echo` at `/trpc` with plain JSON, no batching and one error
  envelope ([HTTP contract](local-development.md#trpc-http-contract)).
- `docs/design/` holds the owner's design system and Login page, approved on
  2026-11-01. It is untracked, and no tracked document points to it yet. Its
  README says that approval "doesn't authorize an implementation step", and
  that where it disagrees with an approved technical or requirements document,
  "the approved document wins".
- The API Dockerfile copies only the API and DB manifests. A simulated frozen
  install with a lockfile that includes `apps/web` succeeds without
  `apps/web` present, so the image needs no change.

Approvals this plan inherits (not asked again):

| Source | What it settles |
| --- | --- |
| [Frontend decisions](technical-direction.md#frontend-foundation-decisions-2026-11-01) W1–W11 (2026-11-01) | One SPA; Ant Design 6; theme tokens plus CSS Modules for layout; i18next with en-US and pt-BR, split by area and loaded per language; the money display; no Organization id in URLs; `@trpc/tanstack-react-query` with `httpLink`, with no refetch on reconnect and no polling; Vitest with jsdom and Testing Library inside `pnpm check`; role and label locators; `America/Sao_Paulo` in tests; a browser TypeScript profile; the four ESLint plugins; no React Compiler. |
| Step 5 (2026-11-01) | `/trpc`, `httpLink` without batching or transformer, `error.data.code`, the types-only export, and linting against Node globals. |
| Tooling and Turborepo (2026-10-23) | Strict flags, including `exactOptionalPropertyTypes`; shared `skipLibCheck`; root-owned ESLint, Prettier and Vitest configuration; strict environment mode; explicit Vitest imports. |
| Design reference (2026-11-01) | Colors, type, spacing, the antd theme, and the TopBar, SideNav and MenuFab patterns, except the corrections in WS-07. |

No prerequisite blocks PR 1. It needs no sign-in, no T02 record, no Firebase
project and no database change.

## 2. Scope

**Delivers:** `apps/web` with antd 6, the theme and the responsive shell; the
en-US and pt-BR catalogs, split by area and loaded per language, with the
language switch; money and date formatting; the route skeleton with
placeholder pages; the Login page built from its approved design, with no
working feature; tRPC over TanStack Query calling `diagnostics.echo` through
the Vite proxy; component tests and web checks inside `pnpm check`;
documentation.

```text
tsconfig.browser.json               browser profile (WS-02)
apps/web/
├── package.json  index.html  vite.config.mts  vitest.config.mts
├── tsconfig.json (solution)  tsconfig.app.json  tsconfig.node.json
└── src/
    ├── main.tsx                    boot: languages, then render (WS-09)
    ├── router.tsx                  createRouter, Register, titles (WS-04)
    ├── routeTree.gen.ts            generated, committed
    ├── routes/                     route definitions only (WS-02)
    │   ├── __root.tsx  index.tsx  login.tsx
    │   ├── app/route.tsx  app/index.tsx  app/{8 sections}.tsx
    │   └── catalog/$nickname.tsx
    ├── features/                   page components, their CSS Modules and tests
    │   ├── home/  login/  catalog/  sections/  errors/
    │   └── shell/                  AppShell, TopBar, SideNav, MenuFab
    ├── i18n/                       en-US/, pt-BR/, i18n.ts, useLocale.ts, i18next.d.ts
    ├── lib/                        trpc.ts; format/money.ts, date.ts
    ├── ui/                         theme.ts, AppProviders.tsx, LanguageSwitch.tsx,
    │                               reset/base/tokens/override CSS, assets/
    └── test/                       setup.ts, renderApp.tsx
```

**Other files:** the root `package.json`, `pnpm-lock.yaml`,
`eslint.config.mjs`, `turbo.json`, `.prettierignore` and `.gitignore`, plus
the documents in section 6.

**Excluded:**

- **PR 3, after T02's record:** Firebase, sign-in (the Login page's button
  action, its states 2–4 and Google's "G" artwork), the session context, the
  Organization header, the user badge and sign-out. PR 1 needs no credentials;
  the owner is asked for the Firebase dev project's values before PR 3.
- **PR 2:** Playwright and `pnpm test:e2e`.
- **PR 4:** Caddy, the web image, Compose and the Content-Security-Policy.
- **With the first business form:** forms, TanStack Form, Zod in the browser
  and a shared contracts package.
- **Their own issues (D04/E10):** business screens and catalog content.
- **Not planned:** devtools, a chart library, the React Compiler, and a dark
  theme (light mode only, owner 2026-11-01; WS-06).

## 3. Decisions

### WS-01 Packages and pins

**Recommendation.** Exact pins (`saveExact` is on):

| Where | Package | Version | Note |
| --- | --- | --- | --- |
| web | `react`, `react-dom` | 19.3.1 | |
| web | `antd` | 6.6.8 | |
| web | `@ant-design/icons` | 6.3.4 | Matches antd's range; one copy |
| web | `dayjs` | 1.11.23 | Needed to import its pt-BR locale. antd uses `^1.11.11`, so there is one copy |
| web | `@tanstack/react-router` | 1.170.46 | |
| web | `@tanstack/react-query` | 5.105.0 | 5.105.1 is less than 24 hours old |
| web | `@trpc/client`, `@trpc/tanstack-react-query` | 11.22.1 | |
| web | `@trpc/server` | 11.22.1 | **Added.** A required peer of both tRPC client packages; its observable code ends up in the bundle. tRPC's setup page installs it. Same store copy as the API |
| web | `i18next` | **26.5.12** | Proposal: 26.6.0, published 2026-10-31 23:19 UTC, less than 24 hours ago. 26.5.12 lacks only 26.6.0's `strictInterpolationChecks` type option (WS-09) |
| web | `react-i18next` | 17.1.9 | 17.1.10 is less than 24 hours old. It fixes `Trans` with `escapeValue: false`; PR 1 does not use `Trans`, so upgrade before the first use |
| web dev | `@storage-minis/api` | `workspace:*` | For `AppRouter` only (P5-08) |
| web dev | `@types/react`, `@types/react-dom` | 19.3.0 | **Added.** React ships no types. 19.3.0 is both `latest` and the `ts6.0` tag |
| web dev | `@vitejs/plugin-react` | 6.1.2 | |
| web dev | `@tanstack/router-plugin` | 1.168.48 | Released together with the router |
| web dev | `@testing-library/react` | 16.3.3 | |
| web dev | `@testing-library/dom` | 10.4.2 | **Added.** Required peer of `@testing-library/react` |
| web dev | `@testing-library/user-event` | 14.6.8 | **Added.** Real pointer and keyboard sequences for menu, drawer and dropdown tests |
| root dev | `jsdom` | 30.1.3 | Lives next to Vitest, which imports it as an optional peer |
| root dev | `eslint-plugin-react-hooks` | 7.1.1 | |
| root dev | `eslint-plugin-react-refresh` | 0.5.7 | |
| root dev | `@tanstack/eslint-plugin-query` | 5.105.0 | Moves with Query |
| root dev | `@tanstack/eslint-plugin-router` | 1.162.0 | |

Ownership:

- `vite`, `vitest` and `typescript` stay single root pins, and the plugins
  resolve to the root Vite. Package scripts already find root binaries:
  `apps/api` runs `tsc` and `vitest` the same way.
- The ESLint plugins and jsdom go to the root, because the ESLint and Vitest
  configurations are root-owned.
- Whatever `apps/web` files import is declared in `apps/web`.

**Release age.** pnpm 12 waits 1,440 minutes before it uses a new version, a
guard against compromised releases. For a pin newer than that, `pnpm add`
writes a `minimumReleaseAgeExclude` entry into `pnpm-workspace.yaml`. Without
that entry, `pnpm install --frozen-lockfile` fails with
`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`.

On the owner's direction, every pin above is the newest version at least 24
hours old. That skips four versions published since 2026-10-31 23:19 UTC:
i18next 26.6.0, react-i18next 17.1.10, and `@tanstack/react-query` and
`@tanstack/eslint-plugin-query` 5.105.1. The install needs no exclusion
entry. After each `pnpm add`, check `pnpm-workspace.yaml` for an entry pnpm
may have written.

**Verified:**

- Every peer and engine range accepts TypeScript 6.0.3, ESLint 10.13.0, Vite
  8.3.5, Vitest 5.0.5 (`jsdom: "*"`), Node 24.22.1 and React 19.3.1.
  `pnpm peers check` found no issues.
- No new package has an install script, so `allowBuilds` is unchanged. Vite 8
  uses rolldown, not esbuild.
- Packages without npm provenance: antd, the icons, i18next, react-i18next, the
  react-hooks plugin and the `@types` packages. The others have it.

**Alternatives:**

- Wait until 2026-11-02 10:10 UTC and install the newest versions.
- Approve exclusion entries for those four versions and install them now.
- Use `fireEvent` instead of `user-event`. It dispatches single events, not a
  user's sequence of events.
- Not proposed: `@testing-library/jest-dom` (role queries already throw when
  an element is missing), `happy-dom`, devtools and `@tanstack/router-cli`.

**Sources:** npm registry metadata; the
[pnpm 12 changelog](https://github.com/pnpm/pnpm/blob/main/pnpm/CHANGELOG.md)
(`minimumReleaseAge`); the
[tRPC setup](https://trpc.io/docs/client/tanstack-react-query/setup).

### WS-02 Package layout, TypeScript and module conventions

**Recommendation:**

- **Package scripts.** `apps/web/package.json` is `@storage-minis/web`,
  private, with `type: module` and these scripts:
  - `dev`: `vite`
  - `build`: `vite build`, without a type check, which `pnpm check` runs
  - `preview`: `vite preview`
  - `typecheck`: `tsc --noEmit --project tsconfig.app.json && tsc --noEmit
    --project tsconfig.node.json`. This matches the other packages and writes
    no build-info files.
- **Root `tsconfig.browser.json`,** beside `tsconfig.node.json`. It extends
  `tsconfig.base.json` with:
  - `module: ESNext`, `moduleResolution: Bundler`, `target: ES2024`;
  - `lib: ["ES2024", "DOM"]` (TypeScript 6 folds `DOM.Iterable` into `DOM`);
  - `jsx: react-jsx`, `types: ["vite/client"]`;
  - `allowArbitraryExtensions: true`.
- **`apps/web/tsconfig.json`** is solution-style and references two files:
  - `tsconfig.app.json`, the browser profile, for `src/**`;
  - `tsconfig.node.json`, the Node profile, for the two config files.
- **Imports:** relative imports in `apps/web` have no extension (`./lib/trpc`).
  The README's `.js` rule stays for the Node packages.
- **Route files hold only the `Route` definition.** Page components live in
  `src/features/<area>/`, next to their CSS Modules and tests, and read their
  route through `getRouteApi("<path>")`. Nothing else goes under
  `src/routes/`. Code splitting still separates the pages: the catalog chunk
  never imports the shell.
- **CSS Modules:** each `X.module.css` gets a hand-written `X.module.d.css.ts`
  declaring its class names.

**Why:**

- **Two profiles behind one `tsconfig.json`.** typescript-eslint's
  `projectService` only discovers files named `tsconfig.json`; through the
  solution file it found both profiles. With a single browser `tsconfig.json`,
  `vite.config.mts` was "not found by the project service". Browser code gets
  no Node types from its own profile, but the API's declarations still bring
  them in (`@types/pg` references `node`), so WS-12's lint rule is the guard.
- **Extensionless imports.** The bundler resolution, Vite's documentation and
  the generated `routeTree.gen.ts` all use extensionless imports. A `.js`
  specifier that points at a `.tsx` file would mislead.
- **Route definitions only.** The route generator treats every `.ts` and `.tsx`
  file under `src/routes/` as a route, including tests, CSS Module declarations
  and helpers.
- **CSS Module declarations.** Under `noUncheckedIndexedAccess`, Vite's
  wildcard type makes `styles.x` `string | undefined`, which antd props reject
  under `exactOptionalPropertyTypes` (TS2375). A per-module declaration keeps
  both flags and catches misspelled class names. Nothing checks it against the
  CSS, but CSS Modules are for layout only, so there will be few of them.

**Alternatives:**

- `.js` specifiers in web code. They resolve too, but read oddly next to
  `.tsx`.
- Local page components in route files with `-`-prefixed helpers.
- `styles.x ?? ""`, which lets typos pass silently, or a declaration-generator
  plugin, which is a new dependency.
- `tsc -b` with build-info files under `node_modules/.tmp`, as Vite's template
  does.

**Sources:** [typescript-eslint project service](https://typescript-eslint.io/packages/parser/#projectservice);
[TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/);
[TanStack file-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing);
[Vite client types](https://vite.dev/guide/features.html#client-types).

### WS-03 Vite configuration and development URL

**Recommendation:**

```ts
// apps/web/vite.config.mts
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
      semicolons: true,
    }),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/trpc/": "http://127.0.0.1:3000" },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
```

- **Plugins.** The router plugin comes first, as TanStack requires. The quote
  and semicolon options make route files the plugin scaffolds match Prettier.
- **Proxy key.** It has a trailing slash because Vite matches by prefix, so
  `'/trpc'` would also proxy `/trpcx`. `vite preview` reuses the proxy.
- **Loopback IPv4 binding,** like the API and the databases. `strictPort`
  fails instead of moving to another port. `appType` stays `spa`, so deep links
  return `index.html` in dev and preview.
- **Development URL.** The documented URL is **`http://localhost:5173`**. That
  is the origin W8 authorizes in the Firebase dev project, and PR 2 uses it
  too. A browser resolves `localhost` to the IPv4 binding.
- **Environment.** No `VITE_*` variables in PR 1.

**Alternatives:**

- Vite's default host `localhost`. Node may resolve it to `::1` only.
- Documenting `http://127.0.0.1:5173`. PR 3 would then also have to authorize
  `127.0.0.1` in Firebase, which W8 does not plan.

**Sources:** [TanStack Router with Vite](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite);
[Vite server options](https://vite.dev/config/server-options.html).

### WS-04 Routes, titles, pending and error pages

**Recommendation.** File routes:

| File | Path | Page |
| --- | --- | --- |
| `__root.tsx` | — | `createRootRouteWithContext<{ queryClient; trpc }>()`; the root error page and a not-found page without back-office links |
| `index.tsx` | `/` | `beforeLoad` redirects to `/app` |
| `login.tsx` | `/login` | The Login page built from its approved design, with no working feature (below). Its loader loads the `login` strings |
| `app/route.tsx` | `/app` | The shell (WS-08). Its loader loads the `app` strings, and it has its own not-found page inside the shell, linking to `/app` |
| `app/index.tsx` | `/app` (index) | Home: the API connection card, with its own error component |
| `app/{inventory,purchases,sales,customers,payments,reports,catalog,settings}.tsx` | `/app/<section>` | One placeholder per menu item, using antd `Empty` |
| `catalog/$nickname.tsx` | `/catalog/<nickname>` | Public placeholder: logo, "This catalog isn't available yet", language switch. Its loader loads the `catalog` strings |

- **Echo on the home page.** The loader runs
  `queryClient.query({ ...trpc.diagnostics.echo.queryOptions({ message: "ping" }), staleTime: "static" })`,
  the documented replacement for the deprecated `ensureQueryData`. The page
  reads the same entry with `useSuspenseQuery`, which refreshes stale data in
  the background on later visits. This follows the read pattern in
  [section 3 of the frontend decisions](frontend-foundation-proposal-2026-11-01.md#3-architecture).
  - A failed loader is caught by the home route's `errorComponent`. It renders
    the card's error state, and its "Try again" button calls
    `useQueryErrorResetBoundary().reset()` and then `router.invalidate()`.
  - After PR 3 the page sits behind sign-in. PR 4's signed-out parity checks
    can still call `/trpc/diagnostics.echo` through Caddy.
- **Page titles.** Route context gets an optional static field:
  `declare module "@tanstack/react-router" { interface StaticDataRouteOption { titleKey?: TitleKey } }`,
  where `TitleKey` is a key of `app:titles`.
  - The member is optional because router-core makes `staticData` required on
    every route once the interface has a required member.
  - The shell renders the deepest match's title once, as the page's `h1`: in
    the TopBar from `bp-md`, at the top of the content below it.
  - `document.title` becomes "Inventory · StorageMinis", or "StorageMinis"
    without a title. It updates on navigation and on a language switch.
  - The Login page and the catalog placeholder render their own `h1`.
- **Login page, with no working feature** (owner, 2026-11-01). It is built from
  [`docs/design/pages/login`](../design/pages/login/README.md):
  - **What is built:** state 1, "Sign in", in both layouts the design shows.
    - On phones: the header row with the language switch; the logo at 28 px;
      the title (`h1`) and lead; the "Continue with Google" button; the helper
      line; and the footer line.
    - On desktop (state 5): the same content in the 400 px card.
    - Copy, spacing and antd components follow the design's tables. The strings
      sit in a `login` namespace in both languages.
  - **No working feature:**
    - The button renders as designed but has no action, and nothing imports
      Firebase.
    - States 2–4 ("Opening Google", "In-app browser", "No access") and the error
      alerts depend on sign-in, so they arrive with PR 3.
  - **Google's "G":** the design calls for Google's official artwork, governed
    by its branding guidelines (one of the design's open items). The page shows
    the button text alone until PR 3 adds sign-in and the artwork together.
  - **Tests:**
    - the `heading` "Sign in", the `button` "Continue with Google" and the
      language switch, located by role;
    - the phone and desktop layouts;
    - no sideways scroll at 390 px.
- **Pending.** `defaultPendingComponent` is a centered antd `Spin` named
  "Loading". It replaces whichever route is still loading: the whole page for
  `/app` and the catalog, the content area for a section.
- **Errors.** `defaultErrorComponent` renders an antd `Result` with "Try again"
  where the failing route would render, so a section error keeps the shell.
  The root error page covers failures in the shell itself. Both read `error`
  as `unknown`, as router-core types it.
- **Router options:** `defaultPreload: "intent"`, `defaultPreloadStaleTime: 0`,
  `scrollRestoration: true`.
- **Generated tree.** `routeTree.gen.ts` is committed, as TanStack's FAQ
  advises. Without it, a fresh checkout's typecheck, lint and tests fail,
  because they run in parallel and only Vite generates the file. `vite build`
  regenerates it byte-identically, and the README says to commit it after
  adding a route.

**Why the eight placeholders:** they exercise navigation, the selected menu
item, titles and code splitting with the real menu. Business issues replace
them later.

**Alternatives:**

- A public `/status` page for the echo. It would stay reachable signed out,
  but it is a diagnostic page in production.
- A home page only, which leaves the menu items nowhere to go.
- TanStack's `head` option with `HeadContent` for the title. It is a second
  mechanism next to the visible `h1`.
- `@tanstack/router-cli`. TanStack recommends it only without a supported
  bundler.

**Sources:** TanStack Router
[file naming](https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions),
[FAQ](https://tanstack.com/router/latest/docs/framework/react/faq),
[external data loading](https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading),
[static route data](https://tanstack.com/router/latest/docs/framework/react/guide/static-route-data),
[not-found errors](https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors).

### WS-05 Data layer

**Recommendation.** `apps/web/src/lib/trpc.ts`:

- **`trpcClient`.** `createTRPCClient<AppRouter>({ links: [httpLink({ url: "/trpc" })] })`,
  with no batching and no transformer (P5-02).
- **`trpc`.** `createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient })`,
  as a module singleton, which tRPC documents for a Vite SPA.
- **`createQueryClient(overrides?)`.** `main.tsx` creates one instance, and
  tests create a fresh one per test. Defaults:
  - Queries never retry a `TRPCClientError` whose `data.httpStatus` is 4xx.
    Other failures (no envelope, 5xx) keep TanStack's default 3 retries at 1,
    2 and 4 s.
  - `refetchOnReconnect: false`, `refetchOnWindowFocus: true` (stated
    explicitly), `staleTime` 0.
  - Mutations: `retry: false` and `networkMode: "always"`.
- **Loaders** use `queryClient.query({ ...options, staleTime: "static" })`, and
  components use `useSuspenseQuery(options)`. Query 5.105 deprecates
  `ensureQueryData`, `fetchQuery` and `prefetchQuery` in favor of
  `query()`.
- **Errors.** `describeError(error)` maps an error to one of three messages in
  `common`:
  - no tRPC envelope (network failure, or a proxy page) → "Can't reach the
    server";
  - `httpStatus` 500 or higher → server error;
  - 4xx → request error.

**Why:**

- **Retries.** W6 rules out retrying 4xx and wants requests only while the user
  is active. TanStack pauses retries while a tab is hidden. Retrying other
  failures helps on unreliable phone networks, and the loading spinner shows
  while it runs. With the API down, the error appears after about 7 s.
- **Mutations never queued offline.** Under TanStack's default
  `networkMode: "online"`, a mutation started offline is paused and runs once
  the device reconnects and the tab has focus. That is a write the user did
  not just make, sent on reconnect, which W6 does not foresee. With
  `"always"`, it fails immediately with the network message, and the user
  decides whether to try again. Idempotency stays with T06.
- **Loaders return cached data immediately.** With `staleTime: "static"`, a
  loader resolves at once from the cache, and `useSuspenseQuery` refreshes in
  the background. Without it, `query()` behaves like `fetchQuery`: every
  navigation would wait on the network, and an intent preload followed by a
  click would fetch twice.
- **Fresh QueryClient per test.** Tests get isolated caches with no leftover
  retries.

**Deferred:** field-level `BAD_REQUEST` mapping waits for the first form. The
token and Organization headers, `UNAUTHORIZED` → `/login` and clearing the
cache wait for PR 3.

**Alternatives:**

- `retry: 1`: the error appears after about 1 s.
- No automatic retry for loader queries, with a manual "Try again": immediate
  errors.
- Keep the default `networkMode: "online"` for mutations: queued offline
  writes.
- Loaders that always wait for fresh data, without `staleTime: "static"`.

**Sources:** [tRPC setup](https://trpc.io/docs/client/tanstack-react-query/setup)
and [usage](https://trpc.io/docs/client/tanstack-react-query/usage); TanStack
Query [important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
and [network mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode);
query-core 5.105.0 `queryClient.ts` (the deprecation notes on
`ensureQueryData`).

### WS-06 Styling mode and base styles

**Recommendation:**

- Keep antd's default runtime CSS-in-JS. Do not import `antd/dist/antd.css`,
  and do not enable `theme.zeroRuntime`.
- Import `antd/dist/reset.css` (3.6 KB), then `tokens.css`,
  `antd-overrides.css` and `base.css`. `base.css` holds one body rule:
  `surface-page` background, `ink` text and the system font.
- **Light mode only** (owner, 2026-11-01):
  - antd's default light algorithm, with no dark algorithm and no
    `prefers-color-scheme` handling;
  - `<meta name="color-scheme" content="light">` in `index.html` and
    `color-scheme: light` in `base.css`, so the controls and scrollbars the
    browser draws stay light when the phone or computer is in dark mode.
- **Design direction** (owner, 2026-11-01). The personal look comes mostly
  from colors that follow the logo's racing red, inside the approved roles:
  ink is the primary color, and racing red is kept for attention. Everything
  else is antd's own design with small tweaks, the corrections in WS-07.

**Why.** W3 asked for a prototype of zero-runtime mode. The result:

- With our theme, antd 6.6.8 still injects the theme's CSS variables as
  `<style>` elements in zero-runtime mode. Its `antd.css` binds variables to
  server-render keys, which never match a client-rendered SPA.
- Both modes were built with Vite and served with
  `Content-Security-Policy: style-src 'self'` in a real browser:

  | Mode | Blocked inline styles | Result |
  | --- | --- | --- |
  | Zero-runtime | 23 | Unstyled |
  | Runtime | 75 | Unstyled |

- Neither mode meets a strict style policy, so the proposal's fallback
  applies: keep runtime styles, and PR 4's policy allows them
  (`style-src 'self' 'unsafe-inline'`).
- A nonce would need per-request templating of `index.html`. Even then, the
  scroll-lock style from `@rc-component/portal` carries no nonce.
- Zero-runtime would also add `antd.css` (+107 KB gzip) and remove no
  JavaScript.
- Without a reset, the body uses the browser's serif font and default margin.

**Alternative.** Zero-runtime plus a theme-specific CSS file extracted with
`@ant-design/static-style-extract`, a fixed `cssVar.key` and `hashed: false`.
In jsdom it rendered correctly with inline styles blocked. Against it:

- 20–22 blocked duplicate styles remain, and the scroll lock breaks.
- It adds a new dependency and a regeneration step whenever the theme or antd
  changes.
- The Vite dev server injects `<style>` anyway.

**Sources:** [antd zero-runtime](https://ant.design/docs/react/customize-theme);
[style extraction](https://ant.design/docs/react/server-side-rendering);
[MDN `style-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src).

### WS-07 Corrections to the approved design

These are the "small tweaks" of the owner's design direction (WS-06). They
keep antd's own design and the approved colors.

`ant-design.md` asks the first web PR to check every token against antd 6. The
theme type-checks, and TypeScript rejects unknown token names under the strict
flags. Rendering it, and the component guides, with antd 6.6.8 showed these
differences. Each one changes the approved design:

| # | Design | antd 6.6.8 | Change |
| --- | --- | --- | --- |
| 1 | `componentSize="middle"` on desktop | Deprecated in the types, removed in v7 | `"medium"` |
| 2 | MenuFab `Drawer height="auto"` | Logs a deprecation warning | `size="auto"` |
| 3 | `colorTextBase: ink` | Body text comes out as ink at 88% opacity | Also set `colorText: ink` |
| 4 | TopBar.md: 56 px tall on phones, 64 px on desktop. The theme sets no header height | Derived 80 px tall, 55 px padding | `Layout.headerHeight: 64`, `headerPadding: "0 24px"`; below `bp-md` the provider sets 56 px and `"0 16px"`. Add `header-height` (64) and `header-height-phone` (56) to `tokens.json` and `tokens.css` |
| 5 | `Layout.siderBg`, `triggerBg`, `triggerColor`, `triggerHeight` | The first three do nothing on a light Sider; the trigger is replaced (#6) | Remove all four |
| 6 | SideNav's built-in trigger, "labelled Collapse / Expand menu" | A `div` with no role, focus or label | A text button showing "Collapse" with its icon when expanded, and an icon-only button named "Expand menu" when collapsed, with `aria-expanded` |
| 7 | SideNav.md `breakpoint="lg"` | Overrides a restored choice on mount | Drop it; the shell sets the default collapsed state (WS-08) |
| 8 | Menu's current item at weight 600 | No Menu token for weight | The current item's label renders in a 600-weight span, so no `.ant-*` class is targeted |
| 9 | MenuFab `shadow-fab` | FloatButton uses `boxShadowSecondary` (`shadow-overlay`) | `components.FloatButton.boxShadowSecondary` set to the `shadow-fab` value, a component token. The FAB's CSS Module class keeps only its position and the safe-area inset |
| 10 | TopBar.md: "The account menu holds the language switch" | No account menu before PR 3 | A standalone language switch in the TopBar until PR 3 builds the account menu |

**Design-text fixes already settled elsewhere** (not approval items):

- `brand-book.md` and `Money.md` say money is "never `R$` or `US$`" and
  "Amounts are BRL integer centavos". W4 and requirements v0.8 put the
  Organization's symbol in the catalog and allow BRL or USD. The design text is
  corrected to match.
- `brand-book.md` limits `data-testid` to repeated records. W9 also allows it
  "where no role or label identifies the element".

**Notes for later screens (no PR 1 code):**

- `Tag bordered={false}` is deprecated; use `variant="filled"` (StatusTag).
- `List` is deprecated since 6.0 and warns on every render. Its replacement
  `Listy` (6.6.0) is a different, virtualized API, so ListRow's first
  implementation chooses between `Listy` and plain markup.
- Statistic's value defaults to 24 px, not 20.
- The Drawer uses its own `boxShadowDrawer*` tokens.

**Updating the design copy.** `docs/design/README.md`: "The editable originals
are in Claude … This folder is a copy taken on 2026-11-01. When a design
changes there, refresh its folder here in the same change." **Decided (owner,
2026-11-01):** the owner applies the approved corrections to the Claude
originals, and PR 1's docs commit refreshes `docs/design/` from them through
the links in its README. That keeps the README's direction, so a later refresh
cannot undo the corrections. The alternative, letting the repository copy lead
this time, was not chosen.

**Sources:** antd 6.6.8 `es/layout/style/sider.js`,
`es/theme/themes/default/colors.js`, `es/float-button/style/button.js`,
`es/config-provider/SizeContext.d.ts`; the
[v6 migration guide](https://ant.design/docs/react/migration-v6) and the
changelog through 6.6.8.

### WS-08 Responsive shell

**Recommendation.** The `/app` layout follows TopBar.md, SideNav.md and
MenuFab.md with WS-07's corrections.

**Below `bp-md` (768 px):**

- TopBar 56 px: the logo, 20 px tall, as a link to `/app` named
  "StorageMinis", and the language switch.
- MenuFab: antd `FloatButton type="primary"` with `aria-label="Open menu"` and
  `aria-expanded`. It sits `fab-offset` plus `env(safe-area-inset-bottom)` from
  the bottom.
- The FAB opens a bottom `Drawer` (`size="auto"`, title "Menu") holding the
  menu.
- Content gutters are `space-4`. Bottom padding is `space-7` + `fab-size` +
  the safe-area inset.

**From `bp-md`:**

- SideNav: `Layout.Sider theme="light"`, width 240, collapsed width 72. Its
  logo or mark links to `/app`.
- TopBar 64 px with the page title.
- Gutters are `space-5`. Content is at most 1200 px wide from `bp-xl`.

**Menu:**

- Items in MenuFab.md order: Inventory, Purchases, Sales, Customers, Payments,
  Reports, Catalog, Settings.
- Each label is a router `<Link>`. That gives real hrefs, intent preloading,
  and the link role for Playwright.
- Outlined icons are `aria-hidden`. Otherwise antd's icon label joins the
  name ("inbox Inventory").
- The selected item is the first path segment after `/app/`; `/app` itself
  selects none.
- Each menu sits in `<nav aria-label="Main menu">`.
- Collapsed items keep their accessible names.

**Collapsed state:**

- Collapsed by default from `bp-md` to `bp-lg`, expanded from `bp-lg`.
- A saved choice wins. It is stored as `storage-minis.sideNav` =
  `"collapsed"` or `"expanded"`; unknown values are ignored.
- The shell computes the default from `Grid.useBreakpoint()`.

**Providers.** `ui/AppProviders.tsx` wraps the whole app, including the login
and catalog pages:

- ConfigProvider with the theme, the antd locale, and `componentSize`:
  `"large"` below `bp-md` (44 px controls, 16 px input text), `"medium"` from
  `bp-md`;
- the phone header tokens from WS-07 #4;
- antd `App`, so `message` and `notification` calls get the theme.

**Storage.** All storage reads and writes are wrapped in `try`, because
private browsing can throw.

**Logo files.** The trimmed logo and mark are copied from `docs/design` into
`ui/assets/` and resized with macOS's built-in `sips` to twice their largest
documented size. The originals stay in `docs/design`.

| File | Size | Use |
| --- | --- | --- |
| Logo | 56 px tall, from 1843 × 196 (154 KB) | Its largest use is 28 px on the sign-in page |
| Mark | 64 px wide, from 305 × 196 (33 KB) | Collapsed SideNav at 32 px |
| Favicon | 64 × 64, transparent (3.7 KB) | The original mark padded to a square without a pad color (`sips` then pads transparently), then resized. Every catalog visitor downloads it |

The resized mark (3.3 KB) is under Vite's 4 KiB inline limit, so it ships
inside the shell chunk.

**Risk: breakpoint flicker.** `Grid.useBreakpoint` returns `{}` on the first
render, so the phone layout renders once before a layout effect corrects it,
before paint. If implementation sees a flicker, the fallback is a small
`matchMedia` hook on `useSyncExternalStore`, which reads the width on the
first render.

**Alternatives:**

- antd's built-in trigger, which is inaccessible (WS-07 #6).
- Sider's `breakpoint` prop, with `onCollapse` checking the event type.
- A Home item in the menu, instead of the logo link.
- Menu items that call `navigate()` in `onClick`. They have no href and no
  preloading.
- The logo files as supplied: 187 KB together.

**Sources:** [antd Layout](https://ant.design/components/layout),
[Menu](https://ant.design/components/menu),
[FloatButton](https://ant.design/components/float-button),
[Grid](https://ant.design/components/grid);
[MDN `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/env).

### WS-09 Languages

**Recommendation:**

- **Catalogs.** `src/i18n/en-US/{common,app,catalog}.ts` are `as const`
  objects. Each `src/i18n/pt-BR/*` uses `satisfies CatalogShape<typeof en>`.
  - That type widens every string to `string`, and requires a `_many` key for
    every en-US `_other` key.
  - pt-BR's plural rules add a `many` category (exact millions), and i18next
    shows the raw key when it is missing.
  - A missing, extra or non-string key fails `tsc`, and so does a missing
    `_many`.
  - PR 1 has no plural string yet. A note for translators: pt-BR's `one` form
    also covers 0.
- **Namespaces:**
  - `common`: the language switch, errors, the not-found pages and loading;
  - `app`: the shell, the menu, the titles and the echo card;
  - `login`: the Login page;
  - `catalog`: the catalog placeholder.
- **Typed keys.** `CustomTypeOptions` declares `defaultNS: "common"` and the
  en-US resources, so a wrong key fails `tsc`. The selector API stays off, as
  by default. A missing interpolation value such as `{ name }` is caught only
  by `strictInterpolationChecks`, which arrives with i18next 26.6.0. Turn it on
  when i18next is upgraded.
- **Initialization:**
  - `supportedLngs: ["en-US", "pt-BR"]`, `fallbackLng: false`,
    `resources: {}`;
  - `interpolation.escapeValue: false`, because React escapes;
  - `react.useSuspense: false`: bundles always load before rendering, and with
    no backend i18next never suspends.
- **Loading:**
  - A typed map of `import()` calls per language and namespace, plus
    `addResourceBundle`.
  - Boot and switching share one path. Before the first render, `main.tsx`
    loads the active language's `common`, its antd locale and its dayjs locale.
    The `/app` loader ensures `app`, and the catalog loader ensures `catalog`.
- **Switching, in this order:**
  1. Load, together, the new language's already loaded namespaces, its antd
     locale and its dayjs locale.
  2. Add the bundles, then call `changeLanguage` and `dayjs.locale()`.
  3. Update the ConfigProvider locale, set `<html lang>`, and save the choice.

  If loading fails, the current language stays, and a `message` from `common`
  explains it. When switches overlap, the last one requested wins.
- **Locale modules:**
  - `antd/es/locale/pt_BR`, imported lazily. The documented `antd/locale/*`
    paths are CommonJS shims. en_US is imported statically, because antd
    already bundles it as its default.
  - `dayjs/locale/pt-br`. Its `dayjs/esm/...` copy registers on a different
    dayjs instance from antd's.
- **Detection, in our code.** First the saved choice (`storage-minis.language`
  = `"en-US"` or `"pt-BR"`), then `navigator.languages` (any `pt` → pt-BR, any
  `en` → en-US), then en-US.
- **The switch,** as the Login design's shared elements describe it:
  - a text `Button` with `GlobalOutlined` and the current language's name;
  - its accessible name is "Language: English";
  - it opens an antd `Dropdown` (click trigger) with "English" and "Português",
    each written in its own language and marked with `lang`.

  The same switch appears on the Login page, in the shell and on the catalog.
- **Boot failure.** If boot cannot load, the root element shows a short plain
  message, in English and Portuguese, asking to check the connection and
  reload.

**Sources:** [i18next TypeScript](https://www.i18next.com/overview/typescript);
the i18next 26.6.0 and react-i18next 17.1.x changelogs;
[antd i18n](https://ant.design/docs/react/i18n);
[DatePicker locale](https://ant.design/components/date-picker);
[`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules).

### WS-10 Money and dates

**Recommendation:**

- **`lib/format/money.ts`.** `formatMoney(cents, language, symbol = "$")`, with
  `symbol` one of `"$" | "R$" | "US$"`:
  - it throws `RangeError` for a value that is not a safe integer;
  - integer arithmetic builds the exact decimal string, such as `"1234.50"`;
  - `Intl.NumberFormat` formats it with two fraction digits and
    `trailingZeroDisplay: "stripIfInteger"`. `format()` treats a string as an
    exact decimal, so no floating-point value is involved;
  - the sign goes before the symbol.
- **`catalogSymbol("BRL" | "USD")`** returns `"R$"` or `"US$"`. The back office
  always passes `$`.
- **`lib/format/date.ts`.** A short date ("Oct 28") and a date with time, both
  in the visitor's time zone through `Intl.DateTimeFormat`.

**Expected outputs** (unit tests):

- en-US: `$400`, `$400.50`, `$1,234.50`, `-$400.50`, `$0`, `$0.05`.
- pt-BR: `$400`, `$400,50`, `$1.234,50`, `-$400,50`.
- Catalog: `R$1.234,50` (pt-BR) and `US$1,234.50` (en-US).
- The int32 limits 2147483647 and −2147483648.
- `2026-11-01T01:00:00Z` shows as Oct 31 in `America/Sao_Paulo`, in both
  languages.

The tests assert Node's ICU output. Whether WebKit uses the same date
separators shows up in PR 2's Playwright projects.

**Alternatives:**

- `cents / 100` as a number. That is exact enough for display, but it is a
  floating-point step the proposal rules out.
- `style: "currency"` with `currencyDisplay: "narrowSymbol"`. It puts a space
  in pt-BR (`US$ 400,50`) and cannot show `$` for BRL.

**Sources:** [ECMA-402 `Intl.NumberFormat`](https://tc39.es/ecma402/#numberformat-objects),
which formats a string as an exact decimal (NumberFormat v3);
[MDN `trailingZeroDisplay`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

### WS-11 Tests

**Recommendation:**

- **`apps/web/vitest.config.mts`** defines the `web-unit` project:
  - `environment: "jsdom"`, `include: ["src/**/*.test.{ts,tsx}"]`;
  - `globals: false`, `clearMocks`, `restoreMocks`, `unstubGlobals`,
    `isolate`, `retry: 0`;
  - `setupFiles: ["./src/test/setup.ts"]`;
  - `env: { TZ: "America/Sao_Paulo" }`. The default `forks` pool applies it;
    `threads` would not.
  - No React plugin: Vite 8 compiles JSX for tests.
- **`src/test/setup.ts`:**
  - **Stubs.** A `matchMedia` stub that evaluates `min-width` and `max-width`
    against `setViewportWidth()`. A `ResizeObserver` stub, without which
    antd's Avatar and Dropdown crash. A `scrollTo` stub for the router.
  - **`fetch`.** A default stub that fails the test on any call the test did
    not expect.
  - **Before each test:** reset i18next to en-US, `<html lang>`, the dayjs
    locale and localStorage.
  - **After each test:** an explicit `cleanup()`, because Testing Library
    cleans up automatically only with Vitest globals.
  - **Console policy.** Spies are installed in `beforeEach`, because
    `restoreMocks` removes spies created earlier. After each test, any
    `console.error` or `console.warn` not declared with
    `expectConsole(level, pattern)` fails the test.
    - Error-path tests declare the router's "Error in route match" warning and
      React's "The above error occurred in" message.
    - Any antd deprecation or unexpected React warning fails.
    - jsdom's own "Not implemented" notices never reach the spies: Vitest
      routes them to the console that existed before the tests. They need no
      exception.
- **`src/test/renderApp.tsx`** renders the real route tree at a path, with a
  memory history and a fresh `createQueryClient({ retryDelay: 0 })`.
- **Timing.** The router waits `defaultPendingMs` (1 s) before it shows the
  spinner, so the spinner is tested through `PendingPage` directly rather than
  through a route.
- **Location.** Tests sit beside their source, never under `src/routes/`
  (WS-02).
- **Planned tests:**
  - money and dates (WS-10);
  - i18n: a pt-BR switch changes visible text, `<html lang>`, the saved choice
    and an antd built-in text (Empty's "Não há dados"); the detection order; a
    failed switch keeps the language;
  - shell: the MenuFab opens and closes the drawer below `bp-md`; the SideNav
    is collapsed at 900 px and expanded at 1024 px; a saved choice wins; the
    trigger's names; collapsed items keep their names; one `h1` with the right
    title on phone and desktop; `document.title`;
  - routes: `/` ends at `/app`; `/catalog/demo` renders its placeholder with
    the `catalog` strings; `/nope` and `/app/nope` render their not-found
    pages;
  - Login page (WS-04): the heading, the button and the language switch, on
    phone and desktop widths;
  - echo, with `fetch` stubbed:
    - success;
    - a 400 envelope shows the error with exactly one request (no retry);
    - a network failure shows the error after the retries;
    - "Try again" recovers once `fetch` succeeds.
- **W9 conventions,** applied everywhere:
  - role and label queries, with names read from the en-US catalog;
  - visible labels, and an `aria-label` on every icon-only button;
  - `aria-hidden` on icons inside labelled controls;
  - `data-testid` "only where no role or label identifies the element, or for
    repeated records".

**Alternative:** no console policy. Simpler, but deprecation warnings would
only show up as noise in the output.

**Sources:** [Vitest 5 migration](https://vitest.dev/guide/migration),
[`test.env`](https://vitest.dev/config/env), [pools](https://vitest.dev/config/pool),
[`unstubGlobals`](https://vitest.dev/config/unstubglobals);
[Testing Library cleanup](https://testing-library.com/docs/react-testing-library/api#cleanup).

### WS-12 Lint, formatting, ignores and Turborepo

**Recommendation:**

- **`eslint.config.mjs`:**
  - global ignores for `**/routeTree.gen.ts` and `**/.tanstack/**`;
  - for `apps/web/src/**/*.{ts,tsx}`:
    - `reactHooks.configs.flat.recommended`, which includes the React
      Compiler rules and so keeps code ready for the compiler (W10);
    - `reactRefresh.configs.vite({ extraHOCs: ["createFileRoute", "createRootRouteWithContext"] })`;
    - `pluginQuery.configs["flat/recommended"]` and
      `pluginRouter.configs["flat/recommended"]`;
    - `globals.browser`;
    - `no-restricted-globals` for `process`, `Buffer`, `global`, `__dirname`,
      `__filename`, `require`, `module`, `exports`, `setImmediate` and
      `clearImmediate`;
    - `no-restricted-properties` for `globalThis.process` and similar, and
      `no-restricted-imports` for `node:` modules;
    - `@typescript-eslint/only-throw-error` allowing router-core's `Redirect`
      and `NotFoundError`, for TanStack's documented `throw redirect(...)`.
- **`.prettierignore`:** `**/routeTree.gen.ts`, `**/.tanstack/` and
  `apps/web/src/ui/tokens.css`. The last keeps that file byte-identical to
  `docs/design/system/tokens.css`, which Prettier would rewrap.
- **`.gitignore`:** `.tanstack/`, the generator's temporary directory.
  `dist` and `.vitest/` are already ignored.
- **`turbo.json`:**
  - `//#lint` also depends on `@storage-minis/api#build`. Without
    `apps/api/dist`, typed lint of web code reported 12 `no-unsafe-*` errors.
  - New task `@storage-minis/web#dev`: `cache: false`, `persistent: true`, no
    dependencies.
  - The generic `build` (`dist/**`) and `typecheck` (`^build`) already fit.
  - No environment entries: the web build reads none in PR 1.

**Why:**

- `typescript-eslint` turns off `no-undef` for TypeScript, so the restricted
  rules are the lint guard against Node code in the browser.
- `extraHOCs` lets route files keep the documented `createFileRoute(...)({...})`
  shape without disabling react-refresh.

**Alternatives:**

- Turn react-refresh off for `src/routes/**`.
- Exclude web files from typed linting, rather than make lint wait for the API
  build.

**Sources:** the plugins' READMEs; typescript-eslint
[`only-throw-error`](https://typescript-eslint.io/rules/only-throw-error/);
[Turborepo task dependencies](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks).

### WS-13 Documentation, design folder and delivery

**Recommendation:**

1. **Plan PR,** `docs(technical): add the web shell plan`, following PR #113's
   precedent:
   - this plan, marked approved with the date and any changes;
   - a dated "Frontend PR 1 web shell plan approval" record in technical
     direction, listing the approved WS items and the owner's 2026-11-01
     design approval;
   - the frontend status in the implementation guide;
   - `docs/design/` as placed by the owner;
   - pointers to `docs/design/README.md` in README "Documentation" and in
     AGENTS.md's "Read before making changes";
   - `.DS_Store` added to `.gitignore`.
2. **Implementation PR** on `feat/web-shell`, in section 4's order, with
   "Part of #118" and no closing keyword. It adds the outcome, the evidence
   and the W3 result to the record.

The implementation starts in a new session, from this plan. The scratch
prototypes behind the evidence section are not part of the repository.

## 4. Implementation order

Branch `feat/web-shell` from `main` after the plan PR merges. Use
Conventional Commits. The PR as a whole must leave the repository working; each commit
should pass `pnpm check` where practical.

1. **`build(web): add the web package, pins and TypeScript profiles`:**
   - the `pnpm add` commands for WS-01, with the manifests and the lockfile;
   - the tsconfigs, `index.html`, and a Vite config with the React plugin only;
   - `ui/theme.ts` with WS-07's token changes, and the CSS files (WS-06);
   - a minimal `main.tsx` rendering the themed ConfigProvider;
   - the Turbo, ESLint and ignore changes.
2. **`feat(web): add languages, providers and formatting`:**
   - `i18n/`, `ui/AppProviders.tsx` with the locale hook,
     `ui/LanguageSwitch.tsx` and `lib/format/`;
   - the Vitest project and setup, with the money, date and i18n tests.
3. **`feat(web): add the router, data layer and responsive shell`:**
   - the router plugin, `routes/`, `routeTree.gen.ts` and `router.tsx`;
   - `lib/trpc.ts`, `features/` (including the Login page), and the assets;
   - the shell, route, Login and echo tests.
4. **`docs: record the web shell`:** the documents in section 6, plus the
   `docs/design/` refresh under WS-07's chosen option.

**Contracts consumed:** `@storage-minis/api/types` and the `/trpc` contract;
the root ESLint, Prettier, Vitest and Turbo configurations; the design
reference.

**Contracts supplied:**

- the route tree, router context and title mechanism;
- `createQueryClient` and `lib/trpc.ts`, where PR 3 adds headers and clears
  the cache;
- the i18n loader and language switch;
- `formatMoney` and the date helpers;
- the shell's accessible names and landmarks.

## 5. Verification

### Completion criteria (#118, PR 1)

| Criterion | Evidence |
| --- | --- |
| `apps/web` with antd 6, the theme and the responsive shell | Shell tests. In the browser pane, at 375 × 812, 900 and 1280 wide: <br>• the FAB and drawer, SideNav collapsed and expanded; <br>• no sideways scroll at 375 (`scrollWidth` equals the width); <br>• ink primary buttons and solid ink text; <br>• header 56 and 64 px; <br>• the FAB shadow; <br>• the current item at weight 600; <br>• 44 px and 40 px controls; <br>• no antd warning in the console |
| Both catalogs, split by area and loaded per language, with the switch | i18n tests. Type errors for a missing pt-BR key, an extra key and a missing `_many`, each shown and reverted. On `vite preview`, the network list shows only the active language's chunks on `/app` and on the catalog |
| Money and date formatting | WS-10 tests |
| Route skeleton with placeholder pages | Route tests; every menu item opens its placeholder, with its `h1` and `document.title` |
| Login page from its design, with no working feature (owner, 2026-11-01) | Login tests. In the browser pane, at 390 × 844 and 1280 × 800, a side-by-side comparison with `screens/1-sign-in.png` and `screens/5-desktop.png`. The button does nothing, and no Firebase request appears in the network list |
| Light mode only | Under emulated dark mode, the page and the browser-drawn controls stay light |
| tRPC over TanStack Query calling `diagnostics.echo` through the Vite proxy | **Steps:** <br>1. `pnpm db:up`, then `pnpm dev`. <br>2. Open `http://localhost:5173/app`: the card shows the echoed message. <br>3. `curl 'http://127.0.0.1:5173/trpc/diagnostics.echo?input=%7B%22message%22%3A%22ok%22%7D'` returns the API's exact body. <br>4. Stop it, then run `pnpm --filter @storage-minis/web dev` without the API. The card's error state appears within about 10 s (three retries). <br>5. Start the API with `pnpm turbo run dev --filter=@storage-minis/api`; the card's "Try again" shows the message |
| Component tests and web checks inside `pnpm check` | `pnpm check` output. `pnpm check --dry=json` lists `@storage-minis/web#typecheck`, and shows `//#lint` depending on `@storage-minis/api#build` |
| W9 testability rules | Tests use role and label queries only; the console policy passes |

### Commands

| Command | Expected |
| --- | --- |
| `pnpm install --frozen-lockfile` | Succeeds. No `minimumReleaseAgeExclude` entry and no new `allowBuilds` |
| `pnpm check` | 9 tasks pass; the unit count rises from 120 with the `web-unit` tests |
| `pnpm build` | Builds `apps/web/dist`. The chunk list with gzip sizes is recorded; no size targets exist before T04. The catalog route never loads the shell chunk |
| A copy without `routeTree.gen.ts`, then `pnpm --filter @storage-minis/web build` | Regenerates the committed file byte-identically |
| `cmp apps/web/src/ui/tokens.css docs/design/system/tokens.css` | Identical |
| `pnpm db:up`, then `pnpm test:api` and `pnpm test:db`, one at a time | 27 and 29 pass, unchanged |
| `pnpm test:stack` | 5 pass, on an image rebuilt with the new lockfile |

**Cleanup:** stop the dev and preview servers and run `pnpm db:down`. No test
listens on a port, and nothing writes outside the repository.

**Deferred:**

- Playwright on phone and desktop (PR 2);
- real phones (T04);
- the CSP (PR 4).

This is tooling evidence, not business acceptance.

## 6. Handoff

**Documentation in the implementation PR:**

- **Technical direction:** the outcome, the evidence, and the W3 result
  (runtime styles; PR 4 allows inline styles).
- **Implementation guide:** the frontend status.
- **README:**
  - the repository description;
  - the daily loop: `pnpm dev` also serves `http://localhost:5173`, and a new
    route file means committing the regenerated `routeTree.gen.ts`;
  - checks: the `web-unit` project;
  - code conventions: extensionless imports and `.tsx` tests in web code;
  - rows in "Implementing a feature" for web pages, strings and formatting.
- **`local-development.md`:** `apps/web` in the toolchain tree, ports 5173 and
  4173, the proxy, and the Turbo table.
- **AGENTS.md:** the repository-state paragraph, and the validation bullets
  (the jsdom project, the web dev server).
- **`docs/design/`:** WS-07, under the chosen option.
- **#118:** check the PR 1 box when the PR merges.

**For PR 2 (Playwright):**

- base URL `http://localhost:5173`, with `strictPort`;
- the accessible names above: `nav` "Main menu", "Open menu", "Collapse" and
  "Expand menu", "Language: English", and on the Login page the heading "Sign
  in" and the button "Continue with Google";
- the echo card;
- no sideways scroll, measured through `scrollWidth`;
- the jsdom helpers do not carry over.

**For PR 3 (sign-in):**

- the header hook in `lib/trpc.ts`;
- the language switch moving into the account menu;
- sign-in on the Login page: the button's action, states 2–4, the error
  alerts, and Google's official "G" artwork;
- `VITE_*` values declared in the web build's Turbo `env`, with a decision on
  `envDir` and inputs: Vite embeds a gitignored `.env.local` that Turbo does
  not hash;
- the owner supplies the Firebase dev project's values first.

**For PR 4 (web image):**

- `style-src 'self' 'unsafe-inline'` (WS-06);
- the SPA fallback, `/trpc/` proxied, and `/__/auth/`;
- `@storage-minis/web#build` should not wait for the API build in the image;
  today the generic `^build` makes it wait;
- stale chunks after a redeploy (Vite's `vite:preloadError`).

**Remaining limitations:**

- No sign-in: `/app` is open in development until PR 3, and it holds no data.
- Placeholder pages only.
- Formatting assumes integer cents until T03's input contract.
- Node types remain visible to the web type check; lint is the guard.

## 7. Risks

- **Release age (WS-01).** A pin younger than 24 hours makes `pnpm add` edit
  `pnpm-workspace.yaml`, and later upgrades follow the same rule.
- **Pins one release behind.**
  - react-i18next 17.1.9 lacks 17.1.10's `Trans` fix: upgrade before the
    first `Trans`.
  - eslint-plugin-query 5.105.1 widens `stable-query-client` to flag
    `new QueryClient()` inside any component or hook. The second prototype ran
    5.105.1 with no errors, because `createQueryClient` is a plain function.
- **Duplicate packages:**
  - `@typescript-eslint/utils` 8.72.0 (the root pin) and 8.72.1 (the TanStack
    plugins). Removing one needs a root bump or an override.
  - `@babel/runtime` 7 and 8, both from antd.
  - Both are harmless; neither is changed here.
- **Agent-skill prompt.** pnpm asks to approve the agent skills that the
  TanStack Router and tRPC packages ship. The plan leaves them unapproved, so
  nothing is linked into `.claude/skills`.
- **Unchecked copies.** CSS Module declarations and the design-token copy can
  drift from their sources. The `cmp` check covers the tokens.
- **Breakpoint flicker** and **WebKit date strings:** see WS-08 and WS-10.

## Research and evidence (2026-11-01)

All research ran in throwaway scratch copies outside the repository.

- **Registry check:** pins, peer and engine ranges, install scripts,
  provenance and release age.
- **First prototype,** in a copy of the repository. The proposal's pins,
  `ensureQueryData`, the React plugin in Vitest and react-refresh off for
  routes. `pnpm check` passed with 9 tasks and 145 tests (120 existing, plus
  money, date, route and shell tests). `pnpm build` passed. The browser pane
  checked:
  - the redirect;
  - the catalog with `R$` amounts in both languages;
  - the language switch on `/app`, which loaded only the pt-BR chunks;
  - the shell at 375, 900 and 1024 px;
  - the dev and preview servers.

  The first visit to the catalog came to about 284 KiB (gzip −9) of
  JavaScript and CSS.
- **Separate checks:**
  - JSX in Vitest without the React plugin, the router plugin's quote and
    semicolon options, the proxy prefix, the two-profile tsconfig with
    `projectService`, and `tsc -b` without `composite`;
  - antd: token typing, deprecations and component-token behavior, rendered in
    jsdom;
  - i18next typing, including `_many`, and loading;
  - the ESLint configs;
  - `extraHOCs` on both route shapes;
  - the API image's frozen install without `apps/web`.
- **Zero-runtime experiment:** Vite builds of each mode, measured in jsdom and
  served with a strict CSP to the browser pane (WS-06).
- **Second prototype, with this plan's configuration.** It used the WS-01
  pins (the scratch copy took the release-age exclusions) and the settings in
  WS-02 to WS-12. It added:
  - the eight section routes;
  - pages under `features/`;
  - `query()` with `staleTime: "static"` and the home error page;
  - the QueryClient factory, the `fetch` stub and the console policy;
  - titles, the link-based menus and the custom trigger;
  - the theme corrections, the resized logo files and the boot-time locales.

  Results:
  - From a clean state, `pnpm check` passed: 9 tasks, 157 tests (120
    existing). The `web-unit` project ran 37 tests in 7 files: money, dates,
    i18n boot, routes, theme variables, shell and echo.
  - `pnpm build` and `vite preview` worked, and `/trpcx` was not proxied.
  - Each choice was checked by breaking it on purpose:
    - an unannounced console message or `fetch` call failed its test;
    - a wrong title key failed `tsc`;
    - removing `aria-hidden` from an icon broke a menu-item name.
  - jsdom confirmed the theme variables: header 64 and 56 px, the FAB shadow
    scoped to the FAB, solid ink text.
  - First catalog visit: about 286 KiB (gzip −9) of JavaScript and CSS (237.7
    initial + 48.7). The shell's 54.6 KiB loads only on `/app`.
- **The final pins.** The second prototype was then switched to the final pins
  (Query and its lint plugin 5.105.0, react-i18next 17.1.9, i18next 26.5.12)
  with the exclusion entries removed:
  - a fresh resolution wrote no exclusion entry;
  - from a clean state, `pnpm install --frozen-lockfile` passed;
  - `pnpm check` passed (9 tasks, 157 tests), and so did `pnpm build`.
- **Not yet run:** the live echo through the Vite proxy with the API up, and
  the browser-pane checks of the revised shell. Both are in section 5.
