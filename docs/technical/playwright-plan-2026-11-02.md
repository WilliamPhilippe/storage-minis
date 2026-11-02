# Frontend PR 2 plan — Playwright (2026-11-02)

**Status: approved by the owner on 2026-11-02 as recommended, PW-01–PW-14;
implemented in [PR #124](https://github.com/WilliamPhilippe/storage-minis/pull/124).**
The approval record, with the implemented outcome and evidence, is in
[technical direction](technical-direction.md#frontend-pr-2-playwright-plan-approval-2026-11-02).
This is the plan for PR 2 of the
[frontend foundation decisions](frontend-foundation-proposal-2026-11-01.md)
([W9](frontend-foundation-proposal-2026-11-01.md#w9-tests) and
[W11 item 2](frontend-foundation-proposal-2026-11-01.md#w11-delivery-sequence)),
delivered under [E13.02 / #118](https://github.com/WilliamPhilippe/storage-minis/issues/118).
It follows the planning rules in the
[implementation guide](technical-foundation-implementation-guide.md#instructions-for-every-agents-plan)
and the [PR 1 handoff](web-shell-plan-2026-11-01.md#6-handoff), and it settles
the item that the frontend decisions left to this plan: which database and env
file `pnpm test:e2e` uses
([section 8](frontend-foundation-proposal-2026-11-01.md#8-deferred-decisions)).
The owner's [changes to W9 and W11](#owner-changes-to-w9-and-w11-2026-11-02)
are decided, not proposals. PW-01–PW-14 are references within this plan, not
requirement, issue or F-decision IDs.

## Recommended decisions

| ID | Recommendation |
| --- | --- |
| PW-01 | `@playwright/test` 1.64.1, the newest release, in `apps/web`; `eslint-plugin-playwright` 2.12.1 at the root; `@storage-minis/db` as a workspace devDependency of `apps/web`. No release-age exclusion and no install script. |
| PW-02 | Chrome Headless Shell only: 203 MiB, plus Playwright's 2.9 MiB FFmpeg, installed once by the owner with `playwright install --only-shell chromium` into Playwright's default cache. |
| PW-03 | Two Chromium projects, `desktop-chrome` and `pixel-7`, with the full device descriptors, and `locale` and `timezoneId` pinned once for every project. The three layout-specific tests carry `@phone` or `@desktop` and run in one project only, which narrows W9. The collapsed SideNav runs at 900 × 720 inside the desktop project. |
| PW-04 | Tests in `apps/web/e2e/`, split into `signed-out/` and `app/`, beside `support/`; the config at `apps/web/playwright.config.mts`; a third TypeScript profile, `tsconfig.e2e.json`; the existing ESLint and Prettier coverage; the language names moved into a module without imports. |
| PW-05 | `eslint-plugin-playwright`'s recommended rules for `apps/web/e2e/**`. |
| PW-06 | Playwright starts both servers and never reuses a running one: the built API at `127.0.0.1:3000`, given only the test database's URL (parsed from `.env.test`) and `NODE_ENV=test`, and the Vite dev server at `http://localhost:5173`. The config refuses any database not named `*_test`. |
| PW-07 | `pnpm test:e2e` runs the uncached Turborepo task `@storage-minis/web#test:e2e` after `^build`, passing through `PLAYWRIGHT_BROWSERS_PATH` and `DATABASE_URL`. It stays outside `pnpm check`. |
| PW-08 | No retries; Playwright's default workers; traces and screenshots kept on failure; the list and HTML reporters, with the report never opened automatically; ignore entries for `test-results/`, `playwright-report/` and `**/playwright/.auth/`. |
| PW-09 | A `tapOrClick` fixture: `tap()` where the project has touch, `click()` elsewhere. Lint keeps raw clicks and taps out of the specs. |
| PW-10 | An automatic console fixture with `expectConsole`: a console error or warning, or an uncaught page error, that the test did not declare fails it. |
| PW-11 | Smoke tests that read their names from the en-US catalogs: 23 on desktop and 22 on the phone, including a pt-BR smoke test through `locale: "pt-BR"`. |
| PW-12 | The echo error path: the test answers the echo request with the Vite proxy's own 502, waits for the error, removes the route and presses "Try again". |
| PW-13 | `/app` specs take their `test` from `e2e/support/app.ts`, where PR 3 adds the saved session. PR 3's setup project, IndexedDB storage state and project dependencies then plug in without moving a file. |
| PW-14 | This docs PR first, then one implementation PR in four commit groups, "Part of #118". |

## Approval (2026-11-02)

The owner approved PW-01–PW-14 on 2026-11-02 as recommended, with no
changes. The owner's changes to W9 and W11, below, came before the plan.
Approval also adopts the changes listed under
[What approval changes in approved documents](#what-approval-changes-in-approved-documents).
The one-time browser install (PW-02) stays the owner's step during
implementation.

## Owner changes to W9 and W11 (2026-11-02)

The owner changed the approved scope on 2026-11-02, before this plan. They are
already applied below.

1. **Two projects instead of four, both in Chromium:**
   - Desktop Chrome (1280 × 720);
   - Playwright's full `devices['Pixel 7']` profile (412 × 839, touch, mobile
     mode, device scale 2.625).

   No WebKit, no iPhone and no Desktop Safari. Both projects pin `locale` and
   `timezoneId: 'America/Sao_Paulo'`.
2. **Phones are portrait only:** no landscape projects or tests.
3. **No iOS Simulator in PR 2.** Xcode with an iOS runtime takes about
   13–20 GB, and Playwright can't drive Safari on iPhone. iPhone and Safari
   checks stay with T04's real-device checks.
4. **Playwright stays before sign-in.** The harness keeps signed-out specs
   (Login, catalog) apart from the specs that will need a session (`/app`),
   and this plan says where PR 3 adds a setup project, storage state with
   IndexedDB and project dependencies (PW-13). The sign-in structure itself
   stays with PR 3 and T02 (W8).

Changes 1 and 2 replace W9's projects ("`devices['iPhone 15']` (WebKit),
`devices['Pixel 7']` (Chromium), Desktop Chrome and Desktop Safari") and define
W11 item 2's "phone and desktop projects". Change 3 takes W9's iPhone and Safari
coverage out of PR 2, Simulator included, and leaves it to T04. Change 4
refines W11 item 2. The approval record carries all four into technical
direction.

### What approval changes in approved documents

Besides the owner's changes, approving this plan changes these approved texts:

- **W9,** "Every end-to-end test runs on phones and desktops": three
  layout-specific tests run in one project only (PW-03).
- **W9,** "`playwright/.auth` is ignored by git": the root `.gitignore` entry is
  `**/playwright/.auth/`, because the folder sits in `apps/web` (PW-08).
- **W8,** "Playwright's phone projects still cover signed-in screens": one
  phone project, Pixel 7 (owner's change 1).
- **Section 8** of the frontend decisions, "Which database and env file
  `pnpm test:e2e` uses": the test database and `.env.test` (PW-06). `test:e2e`
  joins the rule that `test:db` and `test:api` run one at a time.
- **WS-10,** "Whether WebKit uses the same date separators shows up in PR 2's
  Playwright projects": that check moves to T04.

## 1. Starting state

- `main` is at `8d9e9ea`, the web shell
  ([PR #121](https://github.com/WilliamPhilippe/storage-minis/pull/121)), after
  its plan (PR #120) and requirements v0.8 (PR #116). This branch,
  `docs/playwright-plan`, starts there.
- `pnpm check` runs 9 tasks and 194 unit tests; 74 of them are the `web-unit`
  jsdom project.
- There is no Playwright: no dependency, configuration, browser, `e2e/` folder
  or `test:e2e` script.
- What PR 2 drives, from the PR 1 handoff:
  - Vite binds `127.0.0.1:5173` with `strictPort` and proxies `/trpc/` to
    `127.0.0.1:3000`. The documented URL is `http://localhost:5173`.
  - The accessible names: `nav` "Main menu", "Open menu", "Collapse" and
    "Expand menu"; the language switch "Language: English", which shows a globe
    and "EN" or "PT" at the bottom of the SideNav and in the drawer's footer;
    and on the Login page the heading "Sign in" and the inert button "Continue
    with Google".
  - The home page's API connection card, which calls `diagnostics.echo`
    through the proxy. With the API down, the proxy answers 502 with no tRPC
    envelope, and the card shows "Can't reach the server" after three retries.
- The API needs its database to start: configuration, the connection, a
  database check (name, role and `TimeZone = UTC`) and listening must finish
  within 17 s, or it exits 1. `/health/ready` returns 200 after a fresh check.
- `.env.test` names the disposable test database (`127.0.0.1:5434`,
  `storage_minis_test`). `test:db` and `test:api` share it one at a time, and
  both refuse a database whose name does not end in `_test`.
- The language names ("English", "Português") live in `src/i18n/i18n.ts`,
  which imports antd, dayjs and i18next. Playwright's Node runner can't load
  that module (PW-04).
- The jsdom helpers (`src/test/harness.ts`, `names.ts`, `renderApp.tsx`) stay
  with the component tests; they do not carry over.
- #118 still shows PR 1's box unchecked, although PR #121 has merged; the web
  shell plan's handoff asked for it to be checked.

Approvals this plan inherits (not asked again):

| Source | What it settles |
| --- | --- |
| [Frontend decisions](technical-direction.md#frontend-foundation-decisions-2026-11-01) W8, W9 and W11 (2026-11-01), with the owner's 2026-11-02 changes | Playwright right after the web shell, outside `pnpm check` like `test:stack`; role and label locators; names read from the en-US catalog; a pt-BR smoke test; `America/Sao_Paulo` in every project; a shared no-sideways-scroll check; `playwright/.auth` ignored by git; the test sign-in's structure left to PR 3; signed-out checks against the parity stack in PR 4 |
| [PR 1 plan approval](technical-direction.md#frontend-pr-1-web-shell-plan-approval-2026-11-01) and its [implementation-time decisions](technical-direction.md#implementation-time-decisions-2026-11-01) (2026-11-01) | The base URL with `strictPort`, the proxy, the accessible names and the language switch's places |
| Tooling and Turborepo setup (2026-10-23) | Root-owned ESLint and Prettier configuration, strict TypeScript flags, strict environment mode, live tasks uncached |
| Foundation restructure (2026-10-31) | Committed `.env.test` values, the test database and `pnpm db:up` |
| Release age (2026-11-01) | The newest version at least 24 hours old, with no `minimumReleaseAgeExclude` entry |

Nothing blocks PR 2. It needs no sign-in, no Firebase project, no schema change
and no migration.

## 2. Scope

**Delivers:** Playwright with two Chromium projects in `America/Sao_Paulo`;
`pnpm test:e2e`, which needs `pnpm db:up` and the headless shell; smoke tests
for the language switch and its saved choice, the phone drawer, the collapsed
and expanded SideNav, the catalog placeholder, the Login page, the echo
round-trip and its error path, a no-sideways-scroll check on every page and a
pt-BR smoke test; the `tapOrClick` and console fixtures; documentation.

```text
apps/web/
├── playwright.config.mts       projects, servers, reporters (PW-03, PW-06, PW-08)
├── tsconfig.e2e.json           Node types, DOM library, bundler resolution (PW-04)
├── tsconfig.json               references the e2e profile too
├── tsconfig.node.json          also includes playwright.config.mts
├── package.json                test:e2e, the typecheck script, two devDependencies
├── src/i18n/languages.ts       the languages and their names, no imports (PW-04)
└── e2e/
    ├── support/
    │   ├── test.ts             test and expect: tapOrClick, expectConsole,
    │   │                       expectNoSidewaysScroll
    │   ├── app.ts              the /app specs' test; PR 3 adds the session here
    │   └── names.ts            accessible names from the en-US catalogs
    ├── signed-out/             never signed in
    │   ├── pages.spec.ts       Login, catalog, page widths, the pinned settings
    │   └── language.spec.ts    en-US → pt-BR → en-US and saved; pt-BR browsers
    └── app/                    signed in from PR 3
        ├── navigation.spec.ts  drawer (@phone); SideNav expanded, collapsed (@desktop)
        ├── echo.spec.ts        the round-trip; the API down, then "Try again"
        └── pages.spec.ts       every back-office page fits; the shell in pt-BR
```

**Other files:** the root `package.json` (`test:e2e` and the lint plugin),
`pnpm-lock.yaml`, `turbo.json`, `eslint.config.mjs`, `.gitignore`,
`.prettierignore`, `src/i18n/i18n.ts` (re-exports) and the documents in
section 6.

**Excluded:**

- **PR 3:** sign-in and its test structure. PW-13 only says where the setup
  project and saved sessions go.
- **PR 4:** the signed-out run against the parity stack (section 6).
- **The shell follow-up** below: no fix, and no test that pins today's
  behavior.
- **T04:** real phones, Safari and the iPhone.
- **Not planned:** WebKit or Firefox projects, landscape, the iOS Simulator,
  screenshot comparisons, video and CI.

### What the two projects leave uncovered

| Gap | Why the projects miss it | Where it goes |
| --- | --- | --- |
| Safari and iOS WebKit: rendering, WebKit's own date and number output, `dvh` units | Both projects run Chromium | T04's real-device checks. The jsdom tests keep pinning Node's ICU output for money and dates (WS-10); PR 1's note that WebKit's date separators would show up in PR 2 moves to T04 |
| Safe areas: `env(safe-area-inset-*)` with `viewport-fit=cover` | Chromium's device emulation reports no insets | T04, on an iPhone with a home indicator; the shell follow-up |
| Safari's toolbars and the resizing visual viewport | The emulation has no browser chrome | T04 |
| The on-screen keyboard: the shrinking viewport, and the zoom on fields under 16 px | Not emulated | T04. Once forms exist, the Pixel 7 project can assert 16 px input text |
| A real Android phone: the Roboto font, touch hardware, gestures | Pixel 7 is the Mac's Chromium with the Mac's system font and emulated touch | T04. The no-sideways-scroll check measures with the Mac's font, whose widths differ |
| A touch tablet from `bp-md` to `bp-lg` | The 900 px test uses Desktop Chrome's mouse | The shell follow-up; T04 |
| Classic scrollbars (Windows, or macOS set to always show them) | Headless runs hide scrollbars, so overflow that only a scrollbar causes, such as a `100vw` element, passes the no-sideways-scroll check | T04's browser checks |
| Exact breakpoints, the language detection order, formatting rules | Each project has one size and one browser language | The `web-unit` jsdom tests, which already cover 375, 900 and 1024 px, the detection order and both languages' formats |
| In-app browsers (WhatsApp, Instagram) | Not emulated | PR 3's in-app browser notice on the Login page; T04 |
| Landscape phones | Portrait only (owner, 2026-11-02) | Not covered |

### Known shell issues: a separate follow-up

These need their own plan. PR 2 doesn't fix them, and no PR 2 test asserts
today's behavior:

1. The collapsed SideNav (768 px up to below `bp-lg`) shows its labels only as
   hover tooltips. The 900 px test checks the links' names and navigation, not
   the tooltips.
2. The bottom safe area for the menu button (antd's 48 px default instead of
   `fab-offset` plus the inset) and for the drawer. No test asserts their
   positions. This revisits the 2026-11-01 implementation-time decision that
   kept antd's own FAB position, so the follow-up's plan asks the owner again.
3. The drawer's height on small phones (`size="auto"`). No test asserts it;
   Pixel 7's 839 px viewport fits it.

## 3. Decisions

### PW-01 Packages and pins

**Recommendation.** Exact pins (`saveExact` is on):

| Where | Package | Version | Note |
| --- | --- | --- | --- |
| web dev | `@playwright/test` | 1.64.1 | `latest`, published 2026-10-14 11:58 UTC. Brings `playwright` and `playwright-core` 1.64.1 (5.0 and 13.7 MB unpacked). Node 20 or later; npm provenance. The newer `1.65.0-alpha-2026-11-02` is only a `next` prerelease |
| web dev | `@storage-minis/db` | `workspace:*` | Supplies the `*_test` guard the config runs (PW-06). Whatever `apps/web` files import is declared in `apps/web` (WS-01) |
| root dev | `eslint-plugin-playwright` | 2.12.1 | If PW-05 is approved. Published 2026-10-05; peer `eslint >=8.40.0`; its `globals ^17.3.0` resolves to the root's 17.13.0. It lives at the root beside the other ESLint plugins |

**Release age.** 2.12.2 of the plugin was published on 2026-11-02 at 10:43
UTC, less than 24 hours ago, so 2.12.1 is the pin. 2.12.2 changes only how
`expect.soft.poll` chains are read, which PR 2 does not use. No pin needs a
`minimumReleaseAgeExclude` entry.

**Verified in the prototype:**

- `pnpm add` left `pnpm-workspace.yaml` unchanged: no exclusion entry and no
  new `allowBuilds`. None of the four downloaded packages has an install
  script.
- `pnpm peers check` found no issues, and a frozen install from a clean
  `node_modules` passed.
- A frozen install with only the API image's manifests (the root, `apps/api`
  and `packages/db`) passed. It installed no `playwright`, `playwright-core` or
  `@playwright/test`; the root's lint plugin installs in the image's build
  stage only, and `pnpm deploy --prod` leaves it out. The image needs no
  change; `pnpm test:stack` confirms it during implementation.
- The TanStack and tRPC agent skills stay unapproved, as in PR 1.

**Alternatives:**

- The `next` prerelease, `1.65.0-alpha-2026-11-02`: not a release, and less
  than a day old.
- `@playwright/test` at the root beside Vitest. Vitest sits there because its
  configuration is root-owned; Playwright's configuration and tests live in
  `apps/web`, and WS-01 declares what `apps/web` files import in `apps/web`.
- The lint plugin left out (PW-05), or the guard written into the config
  instead of the `@storage-minis/db` dependency (PW-06).

**Sources:** npm registry metadata; the Playwright
[1.64 release notes](https://playwright.dev/docs/release-notes); the
`eslint-plugin-playwright` 2.12.1 and 2.12.2 packages.

### PW-02 Browser

**Recommendation.** Install only Chrome Headless Shell 156.0.8078.4, the build
Playwright 1.64.1 pins:

```sh
pnpm --filter @storage-minis/web exec playwright install --only-shell chromium
```

- **What it writes:** the shell (203 MiB unpacked) and FFmpeg (2.9 MiB), which
  Playwright installs with every browser. Both go to Playwright's default
  cache, `~/Library/Caches/ms-playwright` on macOS, outside the repository, so
  the owner runs the command once after approving it. `PLAYWRIGHT_BROWSERS_PATH`
  picks another folder, and the Turborepo task passes it through (PW-07).
- **Why it is enough:** every PR 2 run is headless. Without a `channel`,
  Playwright launches the headless shell for any headless Chromium project, so
  Pixel 7 runs in the same binary as Desktop Chrome. The prototype ran both
  projects with nothing else installed.
- **Upgrades:** the browser is tied to the Playwright version, and the packages
  download nothing on install. After a Playwright upgrade, the owner runs the
  install command again; it then deletes browsers that no installed Playwright
  uses. `playwright uninstall` removes them too.
- **What it cannot do:** headed runs, `--debug`, and `--ui` or `show-trace`
  without a port need the full Chrome for Testing. With `--ui-port 0` or
  `show-trace --port 0`, they serve on localhost and open in a tab of the
  default browser instead, and so does the HTML report
  (`pnpm --filter @storage-minis/web exec playwright show-report`).

**Alternatives:**

- **Chrome for Testing as well,** another 365 MiB (the owner's research; not
  downloaded): headed, UI and debug modes. With `channel: 'chromium'` it also
  runs Chrome's newer headless mode, which is the real browser rather than the
  separate shell.
- **The installed Google Chrome** (`channel: 'chrome'`): no download, but a
  different build from the one Playwright pins (1.64 was also tested against
  Chrome 155 stable), on Chrome's own update schedule. It uses Chrome's newer
  headless mode, which Playwright warns behaves differently from the shell in
  some cases, and the tests launch the owner's own browser.
- **The same shell inside the checkout,** instead of the default cache:
  - Playwright's hermetic install, `PLAYWRIGHT_BROWSERS_PATH=0`, puts it in
    `playwright-core`'s own folder, which pnpm keeps under
    `node_modules/.pnpm/playwright-core@1.64.1/node_modules/playwright-core/.local-browsers`.
    It goes away with `node_modules`, so a clean reinstall downloads it again.
  - A git-ignored folder in the repository, named by `PLAYWRIGHT_BROWSERS_PATH`,
    survives reinstalls. The path must be absolute: Playwright resolves a
    relative one against the folder pnpm was started from, which differs
    between a root command and the Turborepo task.

  Either keeps the download in the project folder. Every install and every run
  then needs the variable, through the package scripts, and the Turborepo task
  already passes it through (PW-07).

**Sources:** Playwright [browsers](https://playwright.dev/docs/browsers)
(headless shell, `--only-shell`, branded channels, managing binaries);
`playwright-core` 1.64.1 `browsers.json` and its registry code;
[Chrome Headless Shell](https://developer.chrome.com/blog/chrome-headless-shell).

### PW-03 Projects

**Recommendation:**

```ts
use: {
  baseURL: "http://localhost:5173",
  // Every project pins the language and the time zone (W9).
  locale: "en-US",
  timezoneId: "America/Sao_Paulo",
  // PW-08 settings
},
projects: [
  { name: "desktop-chrome", use: devices["Desktop Chrome"], grepInvert: /@phone/ },
  { name: "pixel-7", use: devices["Pixel 7"], grepInvert: /@desktop/ },
],
```

- **Descriptors, used whole:**

  | Project | Viewport | Screen | Scale | Touch | Mobile | User agent |
  | --- | --- | --- | --- | --- | --- | --- |
  | `desktop-chrome` | 1280 × 720 | 1920 × 1080 | 1 | no | no | Chrome 156 on Windows |
  | `pixel-7` | 412 × 839 | 412 × 915 | 2.625 | yes | yes | Chrome 156 on Android 14 |

  Playwright 1.64 forwards each descriptor's `screen`. In the prototype,
  `desktop-chrome` matched `(hover: hover)` and `(pointer: fine)`, and
  `pixel-7` matched `(hover: none)` and `(pointer: coarse)`.
- **Pins in the shared `use`,** so PR 3's setup project and PR 4's runs get
  them too. A check in `signed-out/pages.spec.ts` asserts that
  `navigator.language` is `en-US`, the time zone is `America/Sao_Paulo`, and
  `2026-11-01T01:00:00Z` shows as Oct 31. Only the time zone depends on the
  host: Playwright Test's own `locale` default is already en-US, so the
  `locale` pin documents the choice, and the pt-BR tests override it.
- **Portrait only:** no landscape descriptors (owner, 2026-11-02).
- **Layout-specific tests.** Every test runs in both projects, except tests
  tagged `@phone` (the menu drawer, which exists only below `bp-md`) and
  `@desktop` (the SideNav, from `bp-md`). This narrows W9's "Every end-to-end
  test runs on phones and desktops" for those three tests. The tags live in
  the specs, and each project's `grepInvert` leaves out the other layout.
- **The collapsed SideNav** (768 px up to below `bp-lg`): a `@desktop`
  describe block with `test.use({ viewport: { width: 900, height: 720 } })`,
  not a third project (owner, 2026-11-02).
- **Device scale.** 2.625 stays. A Pixel 7 failure screenshot is 1082 × 2202
  pixels (124 KB in the prototype), about 6.9 times the pixels at scale 1.
  `deviceScaleFactor: 1` is the fallback if size ever matters.

**Alternatives:**

- `test.skip(({ isMobile }) => …)` in each layout-specific describe block.
  Reports then list skipped tests, and the lint plugin's `no-skipped-test`
  rule needs its `allowConditional` option.
- Separate file names per project, such as `*.phone.spec.ts`.

**Sources:** Playwright [emulation](https://playwright.dev/docs/emulation),
[projects](https://playwright.dev/docs/test-projects) and
[annotations and tags](https://playwright.dev/docs/test-annotations); the
device descriptors in `playwright-core` 1.64.1.

### PW-04 Layout, TypeScript, lint and format coverage

**Recommendation:**

- **Files.** `apps/web/playwright.config.mts`, with `testDir: "./e2e"`, and the
  tree in section 2. Specs are `*.spec.ts`, so the `web-unit` project, which
  includes only `src/**/*.test.{ts,tsx}`, never picks them up. Playwright's
  default `testMatch` never picks up PR 3's `*.setup.ts` either.
- **TypeScript.** A third profile, `apps/web/tsconfig.e2e.json`:

  ```json
  {
    "extends": "../../tsconfig.node.json",
    "compilerOptions": {
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "lib": ["ES2024", "DOM"]
    },
    "include": ["e2e/**/*.ts"]
  }
  ```

  - It keeps the Node profile's `types: ["node"]`, because the tests run in
    Node.
  - The DOM library types the callbacks that `page.evaluate()` runs in the
    browser.
  - Bundler resolution keeps the web package's extensionless imports.
    Playwright's loader resolves them, and `.js` to `.ts`, at run time.
  - `apps/web/tsconfig.json` references the profile, so typescript-eslint's
    project service finds the e2e files (as WS-02 found for the other two).
    The `typecheck` script adds `tsc --noEmit --project tsconfig.e2e.json`.
  - `playwright.config.mts` joins `vite.config.mts` and `vitest.config.mts` in
    `tsconfig.node.json`. Playwright looks for `playwright.config.mts` by
    default.
- **ESLint.** The root config's typed block already covers `e2e/**` and the
  config; its `no-floating-promises` rule catches a missing `await`. The
  browser block for `apps/web/src/**` does not apply, because the tests are
  Node code. PW-05 adds the Playwright rules, PW-08 the ignores, and PW-09 one
  restriction.
- **Prettier.** The existing `format:check` globs already match
  `apps/web/e2e/**/*.ts` and `playwright.config.mts`.
- **The language names move** into `src/i18n/languages.ts`: `languages`,
  `Language`, `isLanguage`, `languageNames` and `languageCodes`, with no
  imports. `i18n.ts` imports and re-exports them, so no other file changes.
  The tests then read "English" and "Português" from the app's own source.
  Importing `i18n.ts` from a spec fails in Node with `Cannot find module
  '…/antd/es/locale/en_US'`: antd 6.6.8 has no `exports` map, so Node needs
  the `.js` extension that only a bundler adds.

**Alternatives:**

- A separate workspace package for the tests. It would reach into
  `apps/web/src` for the catalogs.
- NodeNext resolution with `.js` specifiers, the Node packages' convention.
  The specs import the web app's extensionless catalog files.
- Hard-coded language names in the tests, which W9 rules out.

**Sources:** Playwright [TypeScript](https://playwright.dev/docs/test-typescript);
Playwright 1.64.1 `lib/common/index.js` (config file names and import
resolution); [typescript-eslint project service](https://typescript-eslint.io/packages/parser/#projectservice).

### PW-05 Playwright lint rules

**Recommendation.** Adopt `eslint-plugin-playwright` 2.12.1 for the tests:

```js
{
  files: ["apps/web/e2e/**/*.ts"],
  extends: [playwright.configs["flat/recommended"]],
},
```

**Why.** In the prototype, one deliberately bad spec gave:

| Mistake | Typed lint alone | With the plugin |
| --- | --- | --- |
| A missing `await` before `expect(…).toBeVisible()` | `no-floating-promises` | Also `missing-playwright-await` |
| `test.only` | Nothing | `no-focused-test` |
| `expect(await locator.isVisible()).toBe(true)`, which never retries | Nothing | `prefer-web-first-assertions` |
| `page.waitForTimeout(500)` | Nothing | `no-wait-for-timeout` |
| An outer variable inside `page.evaluate()`, which the browser never sees | Nothing | `no-unsafe-references` |
| `test.skip` and a test with no assertion | Nothing | `no-skipped-test`, `expect-expect` |

The plugin ran cleanly with ESLint 10.13.0 and found nothing in the real specs.
`pnpm lint` runs with `--max-warnings 0`, so the recommended set's warnings
block too.

**Alternative:** typed lint only, plus `forbidOnly: true` in the config so a
stray `test.only` fails the run. It would also forbid `.only` while working
locally.

**Sources:** [eslint-plugin-playwright](https://github.com/mskelton/eslint-plugin-playwright)
and its 2.12.1 recommended configuration.

### PW-06 Servers, database and URLs

**Recommendation.** Playwright's `webServer` starts the API and Vite, against
the test database:

```ts
// apps/web/playwright.config.mts
// The committed local test database (R3/R9); a value already set in the real
// environment wins. Parsed, not loaded: Playwright passes its own environment
// to both servers, and the API needs only the app role's URL.
const testFile = fileURLToPath(new URL("../../.env.test", import.meta.url));
const testValues = existsSync(testFile)
  ? parseEnv(readFileSync(testFile, "utf8"))
  : {};
const databaseUrl = process.env.DATABASE_URL ?? testValues.DATABASE_URL ?? "";

// Refuse any database not named *_test before a server starts.
requireTestDatabase(readDatabaseConfig({ DATABASE_URL: databaseUrl }));

webServer: [
  {
    name: "api",
    command: "node --enable-source-maps dist/server.js",
    cwd: "../api",
    url: "http://127.0.0.1:3000/health/ready",
    env: {
      DATABASE_URL: databaseUrl,
      HOST: "127.0.0.1",
      PORT: "3000",
      LOG_LEVEL: "warn",
      NODE_ENV: "test",
      TZ: "UTC",
    },
    reuseExistingServer: false,
    stdout: "pipe",
    // Compose's 15 s, beyond the API's own 10 s shutdown bound.
    gracefulShutdown: { signal: "SIGTERM", timeout: 15_000 },
  },
  {
    name: "web",
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
],
```

- **Database:** the test database's `DATABASE_URL` from `.env.test`; a value
  already in the environment wins, as in `vitest.process.config.mts`.
  `requireTestDatabase` from `@storage-minis/db` refuses any other database
  before a server starts; its message names "Database integration tests", the
  DB package's shared wording. PR 2's tests read no tables and the API only
  checks its connection, so nothing migrates. `test:e2e` joins the rule that
  `test:db` and `test:api` run one at a time. When PR 3's tests need tables,
  its setup migrates the test database as `test:db` does.
- **Parsed with `util.parseEnv`, not loaded into `process.env`.** Playwright
  passes its own environment to each server, merged with that server's `env`,
  and every worker loads the config again. With `process.loadEnvFile`, every
  `.env.test` value, including the owner role's `MIGRATION_DATABASE_URL` and
  the PostgreSQL passwords, would reach the API, Vite and the workers. Parsed,
  the API gets only the app role's URL, like the `test:api` processes, whose
  environment is explicit. In the prototype, `DATABASE_URL` was the only
  database variable the API received.
- **API:** the built server with the same arguments as the image and the
  `test:api` processes, on port 3000 because the Vite proxy's target is fixed.
  - `NODE_ENV=test` and `TZ=UTC`, as in `test:api`.
  - `LOG_LEVEL=warn` keeps request lines out. Lifecycle lines are always
    written, so with `stdout: "pipe"` a start failure shows its reason.
  - Setting `HOST` and `PORT` keeps a shell's `PORT` from moving the API when
    Playwright runs outside Turborepo.
- **Web:** the Vite dev server through the package's `dev` script, at the base
  URL that WS-03 and W8 name. Playwright runs plugin setups in order, so the API
  is ready before Vite starts, and stops them in reverse.
- **No reuse.** A running `pnpm dev` (development database,
  `NODE_ENV=development`) or a leftover Vite server fails the run at once
  instead of being tested in its place. The README already says to stop
  `pnpm dev` before finite checks.
- **Graceful stop.** Playwright sends `SIGTERM` to each server's process group
  and `SIGKILL` after the timeout; without the option it kills at once. The API
  then drains and closes its pool within its own 10 s bound, and the 15 s
  timeout is the grace period Compose gives it.
- **A runner killed hard** leaves both servers running, because Playwright
  starts each in its own process group and stops them only in its own
  teardown or exit handler. The next run then fails with "already used" until
  they are stopped.
- **The dev server, not a built preview:**
  - the console policy (PW-10) depends on development builds: antd's warnings
    are no-ops in production builds (`antd/es/_util/warning.js`), and React's
    development checks exist only there;
  - PR 3's test sign-in entry point is compiled only into development and
    end-to-end builds (W8);
  - PR 4 tests the production build through Caddy.

  The prototype's preview run took 14 s instead of 20 s, and its error-path
  console messages differed.

**Failure modes, from the prototype:**

| Situation | Result |
| --- | --- |
| Databases stopped | After about 1 s, `[api] {"level":50,…,"msg":"database_readiness_failed",…}` with `ECONNREFUSED`, then `Process from config.webServer was not able to start. Exit code: 1` |
| `pnpm dev` running, its API answering on port 3000 | Before any server starts: `http://127.0.0.1:3000/health/ready is already used, make sure that nothing is running on the port/url or set reuseExistingServer:true in config.webServer.` (Playwright checks a server's URL before starting it; read from the 1.64.1 source, not run) |
| A server on port 5173 only, such as a leftover Vite | `[api]` reports `listening`, then the same message for `http://localhost:5173`; the API stops (prototype) |
| `DATABASE_URL` naming `storage_minis_dev` | `Database integration tests require a database whose name ends in _test.` before any server starts |

**Alternatives:**

- `process.loadEnvFile`, as `vitest.process.config.mts` does: one line, with
  the side effects above.
- `reuseExistingServer: true`, or Playwright's suggested `!process.env.CI`.
  Tests would run against whatever happens to be on the ports: with
  `pnpm dev`, the development database; in the prototype, an orphaned Vite with
  no API behind it.
- The development database (`.env.development`). PR 3's tests would write
  test users into development data.
- A third PostgreSQL service for these tests. It could run beside `test:db`
  and `test:api`, but adds a Compose service, its init, another 512 MiB tmpfs
  in Docker's memory and another env file.
- A built preview (`vite build`, then `vite preview` on port 4173): the
  production bundle, without the development warnings, away from the 5173
  origin, and with an end-to-end build mode for PR 3.
- Configurable ports, to run beside `pnpm dev`. The proxy target would become
  a variable in `vite.config.mts`.

**Sources:** Playwright [web server](https://playwright.dev/docs/test-webserver);
Playwright 1.64.1 `webServerPlugin` (the reuse check, the environment passed
to the command, the shutdown sequence); Node.js
[`util.parseEnv`](https://nodejs.org/api/util.html#utilparseenvcontent); the
[integration tests reference](local-development.md#integration-tests);
`compose.yaml` (`stop_grace_period`).

### PW-07 Turborepo task

**Recommendation:**

```json
"@storage-minis/web#test:e2e": {
  "dependsOn": ["^build"],
  "cache": false,
  "outputs": [],
  "passThroughEnv": ["PLAYWRIGHT_BROWSERS_PATH", "DATABASE_URL"]
}
```

with `"test:e2e": "turbo run test:e2e --filter=@storage-minis/web"` at the root
and `"test:e2e": "playwright test"` in `apps/web`.

- **`^build`** builds the web package's workspace dependencies first: the API
  runs from `dist`, and the config imports the DB package's compiled guard.
- **Uncached,** like `test:api`: the run depends on live servers, a database
  and a browser.
- **Strict environment mode** passes a task only the variables it lists, plus
  Turborepo's own short list. A probe task received `HOME`, `TZ`, `CI`,
  `SHELL`, `USER` and `PATH`, among others, and lost `DEBUG`, `PWDEBUG`,
  `PLAYWRIGHT_HTML_OPEN` and any unlisted name.
  - Without `PLAYWRIGHT_BROWSERS_PATH`, a browser in a custom folder is lost: in
    the prototype all 45 tests failed with `Executable doesn't exist at
    ~/Library/Caches/ms-playwright/…`. The default folder still resolves through
    `HOME`.
  - `DATABASE_URL` lets the real environment override the committed value, as
    for `test:api`; the guard still refuses anything not named `*_test`.
  - The API's `HOST`, `PORT`, `LOG_LEVEL`, `NODE_ENV` and `TZ` are set in the
    config, so they need no entry.
  - Debugging variables such as `DEBUG=pw:webserver` work in a direct run,
    `pnpm --filter @storage-minis/web exec playwright test`, once `pnpm build`
    has built the API.
- **Arguments pass through:**
  `pnpm test:e2e -- --project=pixel-7 e2e/app/echo.spec.ts` reached
  `playwright test` in the prototype.
- **Outside `pnpm check`,** like `test:api` and `test:stack` (W9).

**Alternative:** a plain `pnpm --filter` script without Turborepo, like
`test:stack`. Nothing would then build the API first.

**Sources:** Turborepo
[environment variables](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables)
and [task configuration](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks).

### PW-08 Run settings and output

**Recommendation:**

```ts
fullyParallel: true,
retries: 0,
// `open: "never"`: after a failed run in a terminal, the default serves the
// report and waits for Ctrl+C.
reporter: [["list"], ["html", { open: "never" }]],
use: {
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
},
```

- **Workers:** Playwright's default, half the logical CPU cores; 5 in the
  prototype, which ran 45 tests in 19.4–20.0 s. Two workers took 31 s and one
  took 57 s. `fullyParallel` changes nothing today; each test already has a
  fresh browser context, so files and tests can share workers safely.
- **No retries,** like `web-unit`'s `retry: 0`: a flaky test fails.
- **Traces and screenshots kept on failure only.** With no retries,
  `"on-first-retry"` would never record. Video stays off, the default. A
  failure's trace was 216 KB.
- **Reports:** the list reporter in the terminal, and the HTML report, which
  bundles each failure's trace and screenshot. Its default, `"on-failure"`,
  opens the report after a failed run when the terminal is interactive and
  neither `CI` nor a coding agent is detected, then waits for Ctrl+C. That
  would stall a direct run from the owner's terminal.
- **Output:** Playwright's default folders beside the config:
  `apps/web/test-results/`, cleared at the start of every run, and
  `apps/web/playwright-report/`, 2.4 MB with one trace, because it copies the
  trace viewer.
- **Ignores:**

  | File | Entries | Why |
  | --- | --- | --- |
  | `.gitignore` | `test-results/`, `playwright-report/`, `**/playwright/.auth/` | Git-ignored output also stays out of Turborepo's hashes: after an e2e run, `pnpm check` was 9 of 9 cached. A pattern with a slash inside it is anchored to the `.gitignore`'s folder, so W9's `playwright/.auth/` would not match `apps/web/playwright/.auth/`; in the prototype, `git check-ignore` matched only with the `**/` prefix |
  | `.prettierignore` | `**/test-results/`, `**/playwright-report/` | The file already lists generated output. Prettier 3.9.10 also reads `.gitignore` by default, so these entries repeat it |
  | `eslint.config.mjs` global ignores | `**/test-results/**`, `**/playwright-report/**` | Without them, `pnpm lint` reported 856 errors in the report's trace viewer scripts |

**Alternatives:** one retry with traces on the first retry; the list reporter
alone, reading `test-results/` directly; video on failure.

**Sources:** Playwright [reporters](https://playwright.dev/docs/test-reporters)
and [trace viewer](https://playwright.dev/docs/trace-viewer); Playwright
1.64.1's HTML reporter (`open` default, the copied trace viewer);
[gitignore pattern format](https://git-scm.com/docs/gitignore#_pattern_format);
Prettier 3.9.10's `--ignore-path` default.

### PW-09 Tap or click

**Recommendation.** A fixture in `e2e/support/test.ts`:

```ts
// Taps on touch devices and clicks elsewhere. On Pixel 7, click() still
// sends mouse events, so hover styles and tooltips would fire; tap() sends
// touch, and throws without `hasTouch`.
tapOrClick: async ({ hasTouch }, use) => {
  await use((target) => (hasTouch ? target.tap() : target.click()));
},
```

Specs call `await tapOrClick(locator)`. A lint rule for `e2e/**/*.spec.ts`
rejects direct `.click()` and `.tap()` calls with "Use the tapOrClick fixture,
so phones tap and desktops click.". The selector matches any call by those
names, so it also rejects `page.mouse.click()` and an element's `click()`
inside `page.evaluate()`. It does not cover `dblclick()`, `hover()` or
`check()`, which stay a review rule:

```js
{
  files: ["apps/web/e2e/**/*.spec.ts"],
  rules: {
    "no-restricted-syntax": ["error", {
      selector: "CallExpression[callee.property.name=/^(click|tap)$/]",
      message: "Use the tapOrClick fixture, so phones tap and desktops click.",
    }],
  },
},
```

**Evidence (prototype):**

| Call | Events on the Login button |
| --- | --- |
| `click()` on Pixel 7 | `pointerdown` (mouse), `mousedown`, `click` (mouse) |
| `tap()` on Pixel 7 | `pointerdown` (touch), `touchstart`, `mousedown`, `click` (touch) |
| `tap()` on Desktop Chrome | Throws "The page does not support tap. Use hasTouch context option to enable touch support." |

After either call the button matched `:hover`, as on a phone after a tap. A
tap therefore does not prove that a design works without hover. The brand
book's rule ("Nothing depends on hover") stays a design and review rule.

**Alternatives:** `click()` everywhere, which drives the phone project with a
mouse; or project-specific test variants.

**Sources:** Playwright [`locator.tap`](https://playwright.dev/docs/api/class-locator#locator-tap)
and [fixtures](https://playwright.dev/docs/test-fixtures);
[brand book principles](../design/system/brand-book.md#principles).

### PW-10 Console and page-error policy

**Recommendation.** An automatic fixture mirrors the `web-unit` console policy:

```ts
type ConsoleKind = "error" | "warn" | "pageerror";

// Declares console output or a page error the test expects. Anything
// undeclared fails the test, as in the web-unit harness.
expectConsole: [
  async ({ context }, use) => {
    const declared: { kind: ConsoleKind; pattern: RegExp }[] = [];
    const seen: { kind: ConsoleKind; text: string }[] = [];
    context.on("console", (message) => {
      const type = message.type();
      if (type === "error" || type === "warning") {
        seen.push({
          kind: type === "warning" ? "warn" : "error",
          text: message.text(),
        });
      }
    });
    context.on("weberror", (webError) => {
      const error = webError.error();
      seen.push({ kind: "pageerror", text: error.stack ?? error.message });
    });
    await use((kind, pattern) => {
      declared.push({ kind, pattern });
    });
    const unexpected = seen
      .filter(({ kind, text }) =>
        !declared.some((entry) => entry.kind === kind && entry.pattern.test(text)))
      .map(({ kind, text }) => `${kind}: ${text}`);
    expect(unexpected, "console output the test did not declare").toEqual([]);
  },
  { auto: true },
],
```

- **What fails a test:** `console.error` and `console.warn`, and uncaught
  errors, on every page of the test's browser context. Other levels pass.
- **Declarations** can come anywhere in the test, because the check runs when
  the test ends.
- **What fits from `web-unit`:** the function name, its `"error"` and `"warn"`
  levels (Playwright's `"warning"` type maps to `"warn"`), the declared-pattern
  model and the error-path declarations. `"pageerror"` is new, for uncaught
  errors. The browser makes real requests, so there is no fetch guard. PR 3 can add a guard against outside origins once
  sign-in traffic exists, so the catalog can prove it never loads Firebase.

**Evidence (prototype), each failing the test until declared:**

- On the echo error path, React's "The above error occurred in the
  `<MatchInnerImpl>` component" and the router's "Warning: Error in route
  match", the same pair the jsdom test declares.
- Four "Failed to load resource: the server responded with a status of 502 (Bad
  Gateway)" errors: the first request and three retries.
- A deliberate `height="auto"` on the drawer: "Warning: [antd: Drawer]
  `height` is deprecated. Please use `size` instead."
- An error thrown on purpose from a timer: `pageerror: Error: deliberate page
  error`.

No other page logged an error or a warning.

**Alternative:** no policy. Warnings would only show as noise, and only in
traces.

**Sources:** Playwright [`BrowserContext` events](https://playwright.dev/docs/api/class-browsercontext)
(`console`, `weberror`); the
[web shell plan's console policy](web-shell-plan-2026-11-01.md#ws-11-tests).

### PW-11 Smoke tests and names

**Recommendation.** Tests locate elements by role and label, and
`e2e/support/names.ts` builds every name from the en-US catalogs (`app`,
`catalog`, `common`, `login`) and `languages.ts`. It has a `fill(template,
values)` helper for `{{name}}` placeholders. The pt-BR tests read the pt-BR
catalogs the same way.

| Spec | Test | Checks | Projects | Tests per project |
| --- | --- | --- | --- | --- |
| `signed-out/pages` | The Login page | Heading "Sign in", the switch "Language: English", and right after pressing "Continue with Google" the page is still `/login`. A navigation that came later would pass unseen; PR 3 replaces the check | Both | 1 |
| `signed-out/pages` | The catalog placeholder | `/catalog/demo`: its heading, the switch, and no `nav` "Main menu" | Both | 1 |
| `signed-out/pages` | Signed-out pages fit | One test per page, `/login`, `/catalog/demo` and `/nope`: its heading, and no sideways scroll | Both | 3 |
| `signed-out/pages` | Pinned settings | en-US, `America/Sao_Paulo`, Oct 31 | Both | 1 |
| `signed-out/language` | Switch and back | English → Português: the pt-BR heading and `<html lang="pt-BR">`; a reload keeps it; back to English; a reload keeps that | Both | 1 |
| `signed-out/language` | A browser that prefers Portuguese | `locale: "pt-BR"`: the Login page and the catalog in pt-BR, with "Idioma: Português", and no sideways scroll | Both | 1 |
| `app/navigation` | The phone menu (`@phone`) | "Open menu" (`aria-expanded`), the "Menu" dialog with the switch, "Inventory" opens its page, and the drawer closes | Pixel 7 | 1 |
| `app/navigation` | The expanded SideNav (`@desktop`) | "Sales" opens its page; the switch; "Collapse" gives "Expand menu"; a reload keeps it; expand again | Desktop | 1 |
| `app/navigation` | The collapsed SideNav at 900 × 720 (`@desktop`) | "Expand menu" is shown collapsed, and the "Reports" link opens its page | Desktop | 1 |
| `app/echo` | The round-trip | The echo response is 200, and the card shows "Connected" and "The API replied: {message}" with the message from the response | Both | 1 |
| `app/echo` | The error path | PW-12 | Both | 1 |
| `app/pages` | Back-office pages fit | One test per page, `/app`, the eight sections and `/app/nope`: its heading, and no sideways scroll | Both | 10 |
| `app/pages` | The back office in Portuguese | `locale: "pt-BR"`: `/app/inventory` with the pt-BR heading and the title "Estoque · StorageMinis", built from the pt-BR catalogs; no sideways scroll | Both | 1 |

That makes 23 tests on desktop and 22 on the phone, 45 in all.

- **No sideways scroll,** shared as `expectNoSidewaysScroll(page)`, called
  once the page's heading is visible: `documentElement.scrollWidth` must not
  exceed `clientWidth`. On Pixel 7 a page that is too wide also zooms out:
  with a deliberate 480 px logo, `innerWidth` grew to 496 while `clientWidth`
  stayed 412, and the check failed with 496. Desktop Chrome passed the same
  page. Scrollbars take no width in either project, because Playwright starts
  headless Chromium with `--hide-scrollbars`: on a 3000 px tall page,
  `clientWidth` still equalled the viewport width in both.
- **pt-BR smoke tests** set `locale: "pt-BR"`, so they also exercise the
  detection from `navigator.languages`.
- **What the tests avoid:** tooltips, the FAB's and the drawer's positions, the
  drawer's height (the shell follow-up), and fixed waits.

**Alternatives:** names written into the tests, which W9 rules out; a scroll
check on the phone project only.

**Sources:** Playwright [locators](https://playwright.dev/docs/locators) and
[best practices](https://playwright.dev/docs/best-practices).

### PW-12 The echo error path

**Recommendation.** Answer the echo request the way Vite's proxy does while the
API is stopped, then recover:

```ts
await page.route(`**${echoPath}?**`, (route) =>
  route.fulfill({ status: 502, contentType: "text/plain", body: "" }),
);
expectConsole("error", /status of 502 \(Bad Gateway\)/);
expectConsole("warn", /Error in route match/);
expectConsole("error", /The above error occurred in/);
await page.goto("/app");
// The first request and TanStack's three retries at about 1, 2 and 4 s.
await expect(page.getByText(en.common.errors.network)).toBeVisible({ timeout: 15_000 });
await page.unrouteAll();
await tapOrClick(page.getByRole("button", { name: en.common.actions.tryAgain }));
await expect(page.getByText(en.app.echo.connected)).toBeVisible();
```

- **The response is Vite's own.** With the API stopped, `curl` through
  `127.0.0.1:5173` got `HTTP/1.1 502 Bad Gateway`, `Content-Type: text/plain`
  and an empty body.
- **Timing:** about 9–10 s per project, the slowest test.
- **Real recovery:** after the route goes, "Try again" reaches the real API
  through the real proxy.

**Alternatives:**

- Stopping the real API. Playwright offers no way to stop one web server
  during a run, so the test would own the API process itself, as
  `apps/api/tests/owned-process.ts` does for `test:api`. That is custom
  process code, and the run takes longer.
- Aborting the request (`route.abort()`): a network failure rather than the
  proxy's 502. Both show the same message.
- Playwright's clock to skip the retry delays. It fakes the page's timers
  everywhere, including antd's animations.

**Sources:** Playwright [network](https://playwright.dev/docs/network);
TanStack Query's retry defaults (WS-05).

### PW-13 Signed-out and signed-in specs (PR 3)

**Recommendation.** Keep the split by folder and by `test` object:

- `e2e/signed-out/**` imports `test` from `support/test.ts` and never gets a
  session.
- `e2e/app/**` imports `test` from `support/app.ts`, which today only
  re-exports `support/test.ts`:

  ```ts
  // The /app specs import their test from here. PR 3 signs it in: it sets
  // `storageState` to the session that its setup project saves.
  export { expect, expectNoSidewaysScroll, test } from "./test";
  ```

**Where PR 3 plugs in,** without moving files or restructuring the config. How
the session is created stays PR 3's and T02's decision (W8):

1. **A setup project:** `{ name: "setup", testMatch: /.*\.setup\.ts/ }`, and
   `dependencies: ["setup"]` on `desktop-chrome` and `pixel-7`. The device
   projects' default `testMatch` never runs `*.setup.ts`.
2. **Storage state with IndexedDB:** the setup test ends with
   `context.storageState({ path: "playwright/.auth/<name>.json", indexedDB: true })`.
   Firebase keeps its session in IndexedDB, which Playwright saves only with
   `indexedDB: true` (1.51 and later). `**/playwright/.auth/` is already
   ignored (PW-08).
3. **The session for `/app` specs:** `support/app.ts` becomes
   `base.extend({ storageState: "playwright/.auth/<name>.json" })`.
   Signed-out specs keep starting with empty storage.
4. **The rest stays:** the projects' `use`, the servers, the Turborepo task
   and the folders. PR 3 adds its opt-in setting to `.env.test` and passes it
   to the API's `env`, as the config passes `DATABASE_URL`, and it adds its
   `VITE_*` values for the dev server.

**Evidence (prototype).** A stand-in setup project wrote a record shaped like
Firebase's into `firebaseLocalStorageDb` and saved the state with
`indexedDB: true`. `/app` specs in both projects then found the record, and
signed-out specs found no IndexedDB database. The stand-in was removed
afterwards.

`default: false` (Playwright 1.64) is not needed here: dependencies run the
setup project anyway.

**Sources:** Playwright [authentication](https://playwright.dev/docs/auth) and
[`storageState`](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state).

### PW-14 Documentation and delivery

**Recommendation:**

1. **This docs PR,** `docs(technical): add the Playwright plan`, after approval:
   - this plan, marked approved with the date and any changes;
   - a dated "Frontend PR 2 Playwright plan approval" record in technical
     direction, with the approved PW items, the owner's 2026-11-02 changes to
     W9 and W11, and the changes under
     [What approval changes](#what-approval-changes-in-approved-documents);
   - the frontend status in the implementation guide;
   - #118's PR 2 line, rewritten for the two Chromium projects, with PR 1's
     box checked, as the web shell plan's handoff asked;
   - "Part of #118", with no closing keyword, as PR #120 did.
2. **The implementation PR** on `feat/playwright`, in section 4's order, with
   "Part of #118" and no closing keyword. It adds the outcome and the evidence
   to the record.

The implementation starts in a new session, from this plan. The prototype
behind the evidence is not part of the repository.

## 4. Implementation order

Branch `feat/playwright` from `main` after this plan's PR merges. Use
Conventional Commits. The PR as a whole must leave the repository working;
each commit should pass `pnpm check` where practical.

1. **`refactor(web): move the language names into their own module`:**
   `src/i18n/languages.ts` and the re-exports in `i18n.ts`. `pnpm check`
   passes with the same 194 tests.
2. **`build(web): add Playwright and the test:e2e task`:**
   - `pnpm add` for the three packages in PW-01, then a check that
     `pnpm-workspace.yaml` is unchanged;
   - the owner installs the headless shell (PW-02);
   - `playwright.config.mts`, `tsconfig.e2e.json` and the two tsconfig edits,
     the `typecheck` and `test:e2e` scripts;
   - `e2e/support/` and the pinned-settings test, so `pnpm test:e2e` runs from
     this commit on;
   - the ESLint, `.gitignore`, `.prettierignore` and Turborepo changes, and the
     root script.
3. **`test(web): add the end-to-end smoke tests`:** the specs in PW-11 and
   PW-12.
4. **`docs: record Playwright`:** the documents in section 6.

**Contracts consumed:** the accessible names and the base URL from PR 1; the
`/trpc` proxy; the API's start and readiness contract; `.env.test` and the DB
package's guard; the root ESLint, Prettier and Turborepo configuration.

**Contracts supplied:**

- `pnpm test:e2e` and its Turborepo task;
- `e2e/support/test.ts` (`tapOrClick`, `expectConsole`,
  `expectNoSidewaysScroll`) and `support/names.ts`;
- `support/app.ts`, where PR 3 adds the session;
- the signed-out specs that PR 4 runs against the parity stack.

## 5. Verification

### Completion criteria (#118, PR 2)

| Criterion | Evidence |
| --- | --- |
| Phone and desktop projects in `America/Sao_Paulo` (owner's two Chromium projects) | `playwright test --list` shows `desktop-chrome` and `pixel-7` only; the pinned-settings test passes in both; with `timezoneId` removed and the host on `TZ=UTC`, it fails |
| `pnpm test:e2e`, needing `pnpm db:up` | From a clean state: `pnpm db:up`, then `pnpm test:e2e`: 45 tests pass (23 and 22). With the databases stopped, it fails at once with the API's reason |
| Smoke tests: language switch, responsive navigation, catalog placeholder, echo round-trip, no sideways scroll; the Login page and pt-BR (this plan) | The PW-11 table, all passing in both projects (the `@phone` and `@desktop` tests in one) |
| Names from the en-US catalog | Specs import no hand-written UI string; `tsc` fails on a misspelled catalog key |
| Harness ready for PR 3 | The split in PW-13: for the session, PR 3 changes only `support/app.ts` among the spec files, and the config gains only the setup project and its `dependencies` |
| Supplies T06's Playwright check output (#26) | The PR records the run, the failure modes and the guards |

### Commands

| Command | Expected |
| --- | --- |
| `pnpm install --frozen-lockfile` | Succeeds; no `minimumReleaseAgeExclude` entry, no new `allowBuilds` |
| `pnpm peers check` | No issues |
| `pnpm check` | 9 tasks pass; the unit tests are unchanged (194) |
| `pnpm db:up`, then `pnpm test:e2e` three times | 45 tests pass each time, in about 20 s |
| `pnpm test:e2e -- --project=pixel-7` | Only the Pixel 7 project runs |
| `pnpm check` right after an e2e run | 9 of 9 cached |
| `pnpm lint` and `pnpm format:check` with a failure's report and trace present | Both pass |
| `pnpm test:api`, then `pnpm test:db` | 27 and 29 pass, unchanged |
| `pnpm test:stack` | 5 pass, on an image rebuilt with the new lockfile |

### Guards, each broken on purpose

| Guard | Broken by | Fails with |
| --- | --- | --- |
| Console policy | An undeclared React error-boundary message; the 502 declaration removed; `height="auto"` on the drawer; an uncaught page error | `console output the test did not declare` with the message |
| No sideways scroll | A 480 px minimum width on the Login logo | Pixel 7: `the page scrolls sideways`, 496 > 412 |
| Time zone pin | `timezoneId` removed, host `TZ=UTC` | `timeZone: "UTC"` and `day: "Nov 1"` |
| Project tags | `grepInvert` removed from Desktop Chrome | The `@phone` test fails on desktop |
| No server reuse | A server already on 5173 | Playwright's "already used" error |
| Test database only | `DATABASE_URL` naming the development database | The `_test` refusal |
| Browser path | `PLAYWRIGHT_BROWSERS_PATH` missing from `passThroughEnv` | `Executable doesn't exist` |
| Lint | `test.only`, `isVisible()` in `expect`, `waitForTimeout`, a raw `.click()` | The PW-05 rules and the PW-09 restriction |
| Ignores | The ESLint ignores removed while a report exists | 856 lint errors |
| Types | A misspelled catalog key in a spec | `TS2339` |

**Cleanup:** Playwright stops both servers at the end of every run, the web
server first. Run `pnpm db:down` when done.

**Deferred:** Safari, the iPhone and real phones (T04); signed-in tests
(PR 3); the parity stack's signed-out run (PR 4).

This is tooling evidence, not business acceptance.

## 6. Handoff

**Documentation in the implementation PR:**

- **README:**
  - local setup: the one-time headless shell install, after the owner's
    approval;
  - checks: `pnpm test:e2e` beside the live suites, with its prerequisites
    (`pnpm db:up`, the shell, ports 3000 and 5173 free, so `pnpm dev`
    stopped), the one-at-a-time rule with `test:db` and `test:api`, and how to
    pass Playwright arguments;
  - recovery: after a run that was killed hard, stop the servers it left on
    ports 3000 and 5173 before the next run. `lsof -nP -iTCP:3000
    -sTCP:LISTEN` (and `-iTCP:5173`) shows each listener's PID,
    `ps -o pid,command -p <PID>` shows whether it is the test API
    (`dist/server.js`) or Vite (`vite.js`), and `kill <PID>` stops it.
- **`local-development.md`:** a section on end-to-end tests (servers,
  database, ports, guard, output folders, failure modes); the Turborepo table;
  `apps/web/e2e` in the toolchain tree.
- **AGENTS.md:** the repository-state paragraph and the validation bullets.
- **Technical direction:** the outcome and the evidence, in this plan's
  approval record.
- **Implementation guide:** the frontend status.
- **#118:** check the PR 2 box when the PR merges.

**For PR 3 (sign-in):**

- the four plug-in points in PW-13;
- the Login test's inert-button check, which expects "Continue with Google" to
  leave the page at `/login`, changes once the button signs in;
- the test database needs its tables then: migrate it in setup as `test:db`
  does, and keep `test:e2e` one at a time with `test:db` and `test:api`;
- an outside-origin request guard can join the console fixture once Firebase
  traffic exists (PW-10);
- `VITE_*` values reach the dev server that `test:e2e` starts; PR 3 decides
  `envDir` and Turborepo's inputs (PR 1 handoff).

**For PR 4 (web image):**

- **A separate config,** for example `apps/web/playwright.stack.config.mts`,
  that imports this one and sets `testDir: "./e2e/signed-out"`,
  `webServer: []` and the parity stack's web origin as `baseURL`. A project
  with `default: false` is not enough: `webServer` belongs to the whole config,
  and in the prototype `--project=<opt-in>` still started both servers. A
  sketch with these overrides listed 16 signed-out tests and started no server.
  Importing this config also runs its database guard, which needs the DB
  package's build; a module with the shared `use` and `projects`, imported by
  both configs, avoids that.
- Production builds log less: React's error-boundary text and antd's warnings
  are absent, and declarations only allow messages, so the signed-out specs
  still pass. The echo error spec lives under `app/`.
- The parity stack runs beside `pnpm dev`; its run does not need ports 3000 or
  5173.
- If the stack config imports this one after PR 3, it also drops the setup
  project and the device projects' `dependencies`.
- `apps/web` gains two devDependencies here, `@playwright/test` and
  `@storage-minis/db` (`workspace:*`), which the web image's install and build
  graph must handle. The web shell plan already flagged that `^build` makes the
  web build wait for the API build.

**Remaining limitations:**

- Chromium only: Safari, WebKit and real phones wait for T04.
- Development builds only until PR 4's parity run.
- `pnpm test:e2e` can't run beside `pnpm dev`, and shares the test database.
- No CI.
- The shell follow-up's three issues stay open.

## 7. Risks

- **Disk space (PW-02).** 206 MiB outside the repository, again with each
  Playwright upgrade (old browsers are then deleted). Chrome for Testing would
  add 365 MiB.
- **Not the real browsers.** The headless shell is not Chrome's own headless
  mode, Pixel 7 is not a real Android phone, and Desktop Chrome claims
  Windows. The gaps table says where each difference is covered.
- **Development builds.** Production differences surface only in PR 4.
- **Vite's dependency scan.** If a future lazy import escapes Vite's first
  scan, the dev server re-optimizes and reloads every open page in the middle
  of a run. On a cold cache the prototype saw no reload (the scan found the
  pt-BR locales). The fix would be `optimizeDeps.include`.
- **The slowest test** waits about 8 s for TanStack's retries (PW-12).
- **Console declarations.** A new dependency may log development warnings;
  the policy fails loudly on purpose, and each exception is declared where it
  is expected.
- **Fixed ports and a shared database** make `test:e2e` exclusive with
  `pnpm dev`, `test:db` and `test:api`. `test:stack` can run beside it, on
  port 3100 with its own database.
- **Lint warnings block** (`--max-warnings 0`), so the plugin's recommended
  warnings act as errors.
- **Pins one release behind:** `eslint-plugin-playwright` 2.12.1, for
  release age.

## Research and evidence (2026-11-02)

The owner's research on 2026-11-02, from Playwright 1.64.1 and Chromium 156
source, set the starting facts: Pixel 7 needs no extra browser; `click()` sends
mouse events on Pixel 7 and only `tap()` sends touch; the media features of
each project; the forwarded screen size; the device-scale cost of screenshots;
the touch reset after a full-page screenshot, which Playwright 1.64.1
re-applies; scrollbars that take no width; the zoom-out of a page that is too
wide; `default: false`; and the download sizes. The prototype re-checked every
one it could reach. PR 2 takes no full-page screenshots.

**Prototype.** A copy of `main` at `8d9e9ea` in a scratch folder outside the
repository, with the owner's approval (2026-11-02) for:

- the headless shell, downloaded into the scratch folder through
  `PLAYWRIGHT_BROWSERS_PATH`;
- the Playwright packages and the lint plugin in pnpm's shared store;
- the repository's databases, started with `pnpm db:up`;
- stopping an orphaned Vite server, of unknown origin and started from the
  repository's `apps/web`, that held port 5173.

Versions: Node.js 24.22.1, pnpm 12.15.0, Turborepo 2.11.10, ESLint 10.13.0,
Vite 8.3.5, `@playwright/test` 1.64.1, `eslint-plugin-playwright` 2.12.1,
Chrome Headless Shell 156.0.8078.4 (`chromium-headless-shell` v1248) and
FFmpeg v1013.

Results:

- **Install:** PW-01's checks. The shell's download took about 6 s.
- **Runs:** `pnpm test:e2e` ran 45 tests in 19.4–20.0 s with 5 workers, three
  times in a row. On a cold Vite cache: 45 passed in 19.5 s, with Vite ready
  in 269 ms and no reload.
- **Final files:** after the review's changes (the parsed env file and the
  15 s stop in PW-06, the lint rule in PW-09, the `warn` level in PW-10),
  `pnpm check` passed from an empty cache (9 tasks, 194 tests), two more
  `pnpm test:e2e` runs passed (45 tests in 18.6 and 19.1 s), and each changed
  guard failed again when broken.
- **Busy port:** before the orphaned server was stopped, `pnpm test:e2e` failed
  at once with Playwright's "already used" error, as PW-06 describes.
- **Guards:** every row of section 5's table failed when broken and passed when
  restored.
- **Behavior probes:** the media features and screen sizes in PW-03, the events
  in PW-09, the Vite 502 in PW-12, the PR 3 stand-in in PW-13 and the PR 4
  sketch in section 6.
- **Preview comparison:** `vite build` plus `vite preview` ran in 14 s; the echo
  error test failed in both projects, because production React logs the caught
  error without "The above error occurred in".
- **Shutdown:** with or without `gracefulShutdown`, teardown took about a
  second, and PostgreSQL logged nothing either way.
- **Locale pin:** removing `locale` changed nothing, even with
  `LANG=pt_BR.UTF-8`, because Playwright Test's own `locale` default is en-US
  (`lib/index.js`). The pin keeps the choice explicit, and the pt-BR tests
  show the option works.
- **Coding agents:** Playwright never opens the HTML report under a coding
  agent, and Vite 8 forwards browser console errors to its terminal only when
  it detects one. Neither applies to the owner's own runs.

**Independent review (2026-11-02).** Two reviewers read the plan separately:
one against the source documents and the owner's request, one against the
prototype, its logs and the package sources. Each finding was checked against
those sources before it changed the plan. All 27 held. The main changes:

- the `pnpm dev` failure mode, which stops at the API's URL first;
- the test counts per row;
- the list of approved texts this plan changes;
- the env file parsed instead of loaded, so the API gets only its URL;
- Compose's 15 s grace period;
- the true cause of the en-US default;
- the hidden-scrollbar gap;
- the hermetic browser location;
- the lint rule's scope;
- web-unit's `"warn"` level;
- the handoff items for PR 3 and PR 4;
- a final run on the changed files.

## Sources

Consulted on 2026-11-02.

- Playwright 1.64 documentation:
  [browsers](https://playwright.dev/docs/browsers),
  [web server](https://playwright.dev/docs/test-webserver),
  [authentication](https://playwright.dev/docs/auth),
  [projects](https://playwright.dev/docs/test-projects),
  [emulation](https://playwright.dev/docs/emulation),
  [reporters](https://playwright.dev/docs/test-reporters),
  [trace viewer](https://playwright.dev/docs/trace-viewer),
  [annotations and tags](https://playwright.dev/docs/test-annotations),
  [fixtures](https://playwright.dev/docs/test-fixtures),
  [TypeScript](https://playwright.dev/docs/test-typescript),
  [network](https://playwright.dev/docs/network),
  [locators](https://playwright.dev/docs/locators),
  [best practices](https://playwright.dev/docs/best-practices),
  [`BrowserContext`](https://playwright.dev/docs/api/class-browsercontext),
  [`locator.tap`](https://playwright.dev/docs/api/class-locator#locator-tap),
  [release notes](https://playwright.dev/docs/release-notes).
- [Chrome Headless Shell](https://developer.chrome.com/blog/chrome-headless-shell).
- [eslint-plugin-playwright](https://github.com/mskelton/eslint-plugin-playwright).
- Turborepo:
  [environment variables](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables),
  [task configuration](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks).
- [gitignore pattern format](https://git-scm.com/docs/gitignore#_pattern_format).
- Node.js [`util.parseEnv`](https://nodejs.org/api/util.html#utilparseenvcontent).
- [typescript-eslint project service](https://typescript-eslint.io/packages/parser/#projectservice).
- Package sources:
  - `playwright` 1.64.1: `lib/runner/index.js` (`webServerPlugin`,
    `filterProjects`, the HTML reporter) and `lib/common/index.js` (config
    file names, import resolution);
  - `playwright-core` 1.64.1: `browsers.json` and `lib/coreBundle.js` (device
    descriptors, the browser registry and default folder, process shutdown,
    the trace viewer);
  - `eslint-plugin-playwright` 2.12.1 and 2.12.2, `dist/index.cjs`;
  - Vite 8.3.5, `dist/node/chunks/node.js` (`forwardConsole`);
  - antd 6.6.8, `es/_util/warning.js`;
  - Prettier 3.9.10, `internal/legacy-cli.mjs` (`ignorePath`).
- npm registry metadata for versions, dependencies, engines, provenance and
  publish dates.
