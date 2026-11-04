# Web shell follow-up plan — safe areas and drawer height (2026-11-02)

**Status: approved by the owner on 2026-11-02, with the answers listed under
[Approval](#approval-2026-11-02): issue 1 is not a defect, so SF-01 is
withdrawn, and SF-02–SF-06 are approved as written. Implemented in
[PR #125](https://github.com/WilliamPhilippe/storage-minis/pull/125), which also
carries this plan; the docs-only PR #123 was closed (owner, 2026-11-03).** The
approval record, the outcome and the evidence are in
[technical direction](technical-direction.md#web-shell-follow-up-plan-approval-2026-11-02).
This plan fixes known issues in the web shell that
[PR #121](https://github.com/WilliamPhilippe/storage-minis/pull/121) delivered
under the [web shell plan](web-shell-plan-2026-11-01.md) and its
[approval record](technical-direction.md#frontend-pr-1-web-shell-plan-approval-2026-11-01).
On 2026-11-02 the owner set them aside for this separate follow-up, outside
PR 2 (Playwright), and asked that PR 2's tests not lock in today's behavior.
The [PR 2 plan](playwright-plan-2026-11-02.md#known-shell-issues-a-separate-follow-up)
lists them as known shell issues. This plan follows the planning rules in the
[implementation guide](technical-foundation-implementation-guide.md#instructions-for-every-agents-plan).
SF-01–SF-06 are references within this plan, not requirement, issue or
F-decision IDs; SF-01 is withdrawn and not reused.

The three issues raised:

1. The collapsed SideNav (768 px up to below `bp-lg`, 992 px) shows its labels
   only as hover tooltips, against the
   [brand book](../design/system/brand-book.md#principles)'s "Nothing depends
   on hover".
2. The bottom safe area. The MenuFab keeps antd's default position (24 px from
   the right, 48 px from the bottom) instead of `fab-offset` plus
   `env(safe-area-inset-bottom)`, and the drawer's footer puts the language
   switch 8 px above the viewport's bottom edge, which with
   `viewport-fit=cover` can lie under an iPhone's home indicator or Android's
   gesture bar.
3. The drawer's height on small phones. `Drawer size="auto"` grows with its
   content, about 555 px, and on a shorter screen its top, with the title and
   the close button, goes off screen.

## Approval (2026-11-02)

The owner answered each issue on 2026-11-02, then approved SF-02–SF-06 as
written. The answers are already applied in the sections below.

1. **Issue 1 is not a defect.** In the owner's words: "Nothing depends on hover
   on mobile. The sidebar doesn't appear on mobile, it's replaced by the
   floating button at the bottom-right corner." The principle covers phones,
   where the MenuFab replaces the SideNav. From `bp-md` the SideNav stays as
   built: collapsed by default up to `bp-lg`, with antd's hover tooltips, as
   SideNav.md approved. SF-01 is withdrawn, and PR 2's collapsed-SideNav test
   at 900 × 720, which expects that default, is unaffected.
2. **Issue 2:** "Should be addressed." SF-02 and SF-03.
3. **Issue 3:** "Should be addressed." SF-04.

## Recommended decisions

| ID | Recommendation |
| --- | --- |
| SF-01 | Withdrawn (owner, 2026-11-02): the collapsed SideNav is not a defect. |
| SF-02 | The MenuFab sits `fab-offset` (16 px) from the right and bottom, plus the bottom safe-area inset: the FloatButton component tokens `marginLG` and `marginXXL` set to 16, and one CSS Module class that adds the inset as a bottom margin. **Revisits the owner's 2026-11-01 decision that kept antd's position.** |
| SF-03 | The drawer's footer wraps the language switch in our own element, whose one CSS Module class adds the inset as bottom padding. |
| SF-04 | The drawer is at most the viewport's height minus `header-height-phone` (56 px), through one CSS Module class on its section (antd's `classNames.section`); the menu list scrolls between the title and the footer. Adds to the approved design. |
| SF-05 | After PR 2, Playwright checks for the FAB's offsets and the short-screen drawer, plus a safe-area check through Chrome's experimental `Emulation.setSafeAreaInsetsOverride` only if a prototype shows that it works. No new jsdom test, since the changes are layout. Real devices stay with T04. |
| SF-06 | The owner updates the Claude originals first, and the implementation PR refreshes `docs/design/`. A docs PR, then one implementation PR after PR 2, "Part of #118". |

### What approval changes in approved documents

- **Design reference (2026-11-01):** MenuFab.md's account of how the FAB is
  placed (SF-02) and two additions to its drawer bullet (SF-03, SF-04); the
  FloatButton entry in `ant-design.md`'s theme (SF-02).
- **The implementation-time decision "Hard-to-override styles" (2026-11-01):**
  its first kept default, "the MenuFab's position (24 px from the right, 48 px
  from the bottom, clear of the iPhone home indicator) instead of `fab-offset`
  plus the safe-area inset", is reversed (SF-02). The drawer menu's 14 px text
  and the drawer's square top corners stay as decided.
- **WS-08** of the web shell plan: its FAB text, which places the button
  `fab-offset` plus the inset from the bottom, becomes true again (SF-02).

## 1. Starting state

- `main` is at `a9ee97c`, the approved PR 2 plan (#122), after the web shell
  (PR #121). Nothing in `apps/web` has changed since PR #121.
- The shell, as WS-08 and the five
  [implementation-time decisions](technical-direction.md#implementation-time-decisions-2026-11-01)
  left it:
  - `MenuFab.tsx` renders a `FloatButton` at antd's own position, with no CSS
    Module, and a bottom `Drawer` (`size="auto"`) whose footer holds the
    language switch.
  - `AppShell.module.css` gives phone content `space-7` + `fab-size` +
    `env(safe-area-inset-bottom)` of bottom padding. `index.html` sets
    `viewport-fit=cover`, so the page can draw under the home indicator, and
    the insets can be above zero.
  - `theme.ts` sets the FloatButton tokens `controlHeightLG: 56`,
    `boxShadowSecondary` (`shadow-fab`) and `fontSizeIcon: 16`.
- PR 2's plan (approved 2026-11-02, not yet implemented) keeps the FAB's and
  the drawer's positions and the drawer's height out of its tests.
- No one uses the shell yet: sign-in arrives with PR 3, and nothing is
  deployed (T04).

Approvals this plan inherits (not asked again):

| Source | What it settles |
| --- | --- |
| [Design reference](technical-direction.md#frontend-pr-1-web-shell-plan-approval-2026-11-01) (2026-11-01) | The MenuFab at `fab-offset` plus the inset; StickyActionBar's `max(space-3, env(safe-area-inset-bottom))` as the design's own inset pattern |
| [Implementation-time decisions](technical-direction.md#implementation-time-decisions-2026-11-01) (2026-11-01) | antd's own styling unless a theme token or one CSS Module class reaches the design; the language switch in the drawer's footer |
| [PR 2 Playwright plan approval](technical-direction.md#frontend-pr-2-playwright-plan-approval-2026-11-02) (2026-11-02) | Two Chromium projects (Desktop Chrome, Pixel 7), portrait phones only, no iOS Simulator; iPhone and Safari checks move to T04; `@phone` and `@desktop` tags; the console policy |

Nothing blocks this work. It needs no new package, install or tool.

## 2. Scope

**Delivers:** SF-02–SF-04 in the MenuFab and the theme, the Playwright checks
once PR 2 has merged (SF-05), the design refresh and the records (SF-06).

```text
apps/web/src/
├── features/shell/
│   ├── MenuFab.tsx              SF-02 class, SF-03 footer wrapper, SF-04 section class
│   ├── MenuFab.module.css       new: three classes, one declaration each
│   └── MenuFab.module.d.css.ts  new: its class names (WS-02)
└── ui/theme.ts                  SF-02: FloatButton marginLG and marginXXL
apps/web/e2e/app/navigation.spec.ts   SF-05, after PR 2
docs/design/system/              SF-06, refreshed from the Claude originals
```

**Excluded:**

- **The collapsed SideNav (issue 1):** not a defect (owner, 2026-11-02).
- **Not reopened (2026-11-01):** the drawer menu's 14 px text and the drawer's
  square top corners. The corners would now take one class through antd's
  `classNames.wrapper`; this plan does not propose it.
- **Landscape side insets.** With `viewport-fit=cover`, a notched iPhone in
  landscape is wider than `bp-md`, so the SideNav and the content's far edge
  reach under the sensor housing; the shell pads only the bottom. Tests use
  portrait phones only (owner, 2026-11-02), but the app does not lock the
  orientation. Left to T04's device checks, or to a later follow-up if the
  owner wants it now.
- **Chrome's bottom bar and padded content.** Chrome's edge-to-edge guide
  discourages padding with `env(safe-area-inset-bottom)`, which changes as
  Chrome's bottom bar slides away: the page re-lays out, and Chrome may then
  stop sliding the bar. PR 1's content padding does this, and so does
  StickyActionBar's design. T04's Android check watches for it.
- Business screens, StickyActionBar, sign-in (PR 3) and the web image (PR 4).

### Interaction with PR 2

- PR 2's tests stay clear of the FAB's and the drawer's positions and the
  drawer's height, so this follow-up changes none of them.
- With SF-01 withdrawn, PR 2's collapsed-SideNav test keeps its expectation.
  Where the PR 2 plan sends the collapsed SideNav and touch tablets from
  `bp-md` to `bp-lg` to this follow-up, this plan's approval record applies:
  the first is not a defect, and touch tablets stay with T04.
- SF-05's Playwright checks need PR 2's harness, one reason to land this
  follow-up after PR 2 (SF-06).

## 3. Decisions

### SF-01 The collapsed SideNav — withdrawn

Withdrawn on 2026-11-02, when the owner ruled that issue 1 is not a defect
([Approval](#approval-2026-11-02)). Nothing changes: the SideNav stays
collapsed by default from `bp-md` to `bp-lg` and expanded from `bp-lg`, a
saved choice wins, collapsed items keep antd's hover tooltips, and "Expand
menu" shows the labels by tap or keyboard.

### SF-02 The MenuFab's position and the safe area

**Recommendation.** Place the FAB as MenuFab.md says: `fab-offset` (16 px) from
the right and bottom edges, plus `env(safe-area-inset-bottom)`.

```ts
// theme.ts — antd places a FloatButton marginLG from the right and marginXXL
// from the bottom (24 and 48 px by default): fab-offset.
FloatButton: {
  controlHeightLG: 56,
  boxShadowSecondary: shadowFab,
  fontSizeIcon: 16,
  marginLG: 16,
  marginXXL: 16,
},
```

```css
/* MenuFab.module.css — lifts the FAB above the home indicator or Android's
   gesture bar. antd's own `margin: 0` is a one-class rule that comes first. */
.fab {
  margin-block-end: env(safe-area-inset-bottom);
}
```

**This revisits the owner's 2026-11-01 decision.** The implementation-time
decision "Hard-to-override styles" kept antd's position, "24 px from the right,
48 px from the bottom, clear of the iPhone home indicator", because "antd
positions the FloatButton with a two-class selector and internal tokens". The
owner's rule was: "If it's not easy to overwrite, just ignore." This plan asks
again because antd 6.6.8's source shows a way within that rule:

- **The offsets are global tokens.** FloatButton's style takes its
  `inset-inline-end` from `marginLG` and its `bottom` from `marginXXL`.
  `theme.components.FloatButton` accepts global tokens, and antd scopes them to
  the button as CSS variables, the way `controlHeightLG: 56` and
  `fontSizeIcon: 16` already reach it. No other style reads these two: Button,
  Badge and antd's shared styles don't use `marginLG` or `marginXXL`.
- **The inset can't be a token,** which takes numbers only, so one CSS Module
  class adds it as a bottom margin. A fixed element's bottom margin adds to its
  `bottom` offset. antd sets the margin with a one-class rule (`margin: 0`)
  and injects its styles before the app's, so our class wins. The SideNav
  already relies on the same order: its `position: sticky` wins over antd's
  one-class `position: relative`.

**Why.**

- It reaches the design with two component tokens and one declaration.
- On an iPhone with a home indicator (a 34 px inset), the FAB sits 50 px from
  the bottom, against antd's 48. Where there is no inset, 16 px against 48.
- On Android, Chrome 135 and later draw `viewport-fit=cover` pages under the
  gesture bar and update `env(safe-area-inset-bottom)` as Chrome's bottom bar
  slides away, and Chrome's guide positions bottom-fixed elements with that
  inset. The FAB then stays `fab-offset` above the gesture bar as it moves;
  antd's fixed 48 px clears today's gesture bar but doesn't follow it.
- The content's bottom padding (`space-7` + `fab-size` + the inset) was sized
  for `fab-offset`. With it, 32 px separate the last line from the FAB
  everywhere. With antd's 48 px, the gap equals the inset: none on phones
  without one.
- At 16 px from the right, the FAB lines up with the 16 px page gutter.

**Alternatives:**

| Option | For | Against |
| --- | --- | --- |
| Keep antd's default (the 2026-11-01 decision) | No code; clears today's iPhone home indicator by 14 px | 32 px higher than designed where there is no inset, with no gap above the content's last line there; 8 px off the gutter; an inset above 48 px would overlap |
| FloatButton `styles.root` (antd 6's semantic styles) with `insetInlineEnd: "var(--fab-offset)"` and `bottom: "calc(var(--fab-offset) + env(safe-area-inset-bottom))"` | One prop; an inline style beats antd's selector without relying on order | Inline styles are not among `ant-design.md`'s styling steps, so it needs a new allowed pattern |
| A doubled class (`.fab.fab`) or `:global(.ant-float-btn)` in the CSS Module | Beats antd's two classes | Games specificity or targets antd's classes, against `ant-design.md` |
| antd's CSS layer (`StyleProvider layer`) | Every CSS Module rule beats antd's | Changes how all of antd's styles cascade, for one button |

**Changes the approved design: no, it reaches it.** MenuFab.md's account of
the mechanism changes: the position comes from the two tokens, and the class
holds only the inset. `ant-design.md`'s theme lists the two tokens, with
`fontSizeIcon`, pending since 2026-11-01.

**Verification:**

- **jsdom:** no position test, since jsdom has no layout. The existing tests
  keep covering the FAB's name and `aria-expanded`.
- **Browser pane, during implementation:** at 375 × 812, the FAB's box ends
  16 px from the viewport's right and bottom edges. Chromium reports no inset,
  so only the CDP override (SF-05) or a device shows the margin at work.
- **Playwright** (SF-05): the 16 px offsets on Pixel 7; 50 px from the bottom
  with a 34 px emulated inset.
- **T04:** an iPhone with a home indicator in Safari, with Safari's bars shown
  and collapsed; an Android phone on Chrome 135 or later with gesture
  navigation, while Chrome's bar slides, and with three-button navigation.

### SF-03 The drawer's footer

**Recommendation.** Wrap the language switch in our own element, whose one CSS
Module class adds the inset:

```tsx
footer={
  <div className={styles.drawerFooter}>
    <LanguageSwitch placement="topLeft" />
  </div>
}
```

```css
/* The language switch stays above the home indicator or the gesture bar;
   antd's footer padding (space-2) comes first. */
.drawerFooter {
  padding-block-end: env(safe-area-inset-bottom);
}
```

**Why.** antd pads the footer 8 px with a two-class selector
(`.ant-drawer .ant-drawer-footer`), so a class on the footer itself would lose.
Our own element has no antd rule to beat. The drawer's white background still
runs under the home indicator, and the switch ends 42 px above the screen's
edge on an iPhone (8 + 34), or 8 px where there is no inset.

**Alternatives:**

- `styles.footer` with `paddingBottom: "max(var(--space-2), env(safe-area-inset-bottom))"`:
  StickyActionBar's `max()` formula (34 px instead of 42), but an inline style,
  as in SF-02.
- `classNames.footer` with the same rule: loses to antd's two classes.
- The Drawer token `footerPaddingBlock`: numbers only, and it pads the top too.
- Chrome's `safe-area-max-inset-bottom` pattern: steadier while Chrome's bar
  slides, but Chrome only. antd locks the page's scroll while the drawer is
  open, so the bar should not move in the meantime.

**Changes the approved design: an addition.** MenuFab.md's drawer bullet gains
the footer: the language switch (the 2026-11-01 placement, not yet in the
design), kept above the home indicator.

**Verification:**

- **jsdom:** the existing tests keep finding and using the switch in the
  drawer.
- **Playwright** (SF-05): with a 34 px emulated inset, the switch ends at least
  34 px above the viewport's bottom.
- **T04:** as in SF-02.

### SF-04 The drawer's height

**Recommendation.** Cap the drawer at the viewport's height minus the phone top
bar's, and let the menu list scroll between the title and the footer:

```tsx
<Drawer placement="bottom" size="auto" classNames={{ section: styles.drawer }} …>
```

```css
/* On short screens the drawer stops header-height-phone below the top, and
   antd's body (flex: 1, min-height: 0, overflow: auto) scrolls the menu. */
.drawer {
  max-height: calc(100dvh - var(--header-height-phone));
}
```

**Today.**

- With `size="auto"`, antd gives the drawer's wrapper `height: auto` and
  anchors it to the bottom, with no maximum.
- From antd's styles and our theme, the drawer is about 555 px tall: a 57 px
  title row, a 436 px body (24 px padding around eight 44 px items with 4 px
  margins) and a 61 px footer around the 44 px switch.
- On a shorter screen it grows past the top edge, and nothing scrolls, because
  the section's `height: 100%` follows its auto-height wrapper. The title and
  Close go first, then the first items.
- Short screens include phones turned to landscape while still narrower than
  `bp-md`, such as an iPhone SE at 667 × 375, and short browser windows. A
  667 px-tall iPhone SE in portrait is borderline once Safari's bars take their
  share. PR 2's Pixel 7 (839 px) fits.

**Why.**

- antd's section is already a flex column with `overflow: auto`; its body has
  `flex: 1`, `min-height: 0` and `overflow: auto`, and its footer
  `flex-shrink: 0`. A maximum height on the section is enough for the body to
  shrink and scroll while the title and the footer stay.
- One declaration in one class, through antd 6's documented semantic
  `classNames.section`. The section is also the `role="dialog"` element that
  the tests find by its name, "Menu".
- The 56 px gap keeps a strip of the dimmed page above the drawer, so a tap
  outside still closes it, and the drawer never rises above the top bar's
  lower edge.
- `dvh` follows Safari's and Chrome's moving bars; `AppShell.module.css` and
  `SideNav.module.css` already use it.

**Alternatives:**

| Option | For | Against |
| --- | --- | --- |
| `100dvh`, with no gap | The most room for items | No strip to tap outside; the drawer can reach the very top |
| A `space-7` (48 px) gap | A spacing token instead of the top bar's height | Not tied to anything on screen |
| A cap on the wrapper (`classNames.wrapper`: `max-height: 100%`, plus a flex column so the section shrinks) | No `dvh` | Three declarations; the wrapper is missing from antd's documented list of semantic parts |
| Smaller items on short screens | More items fit | Breaks `control-touch` (44 px) |
| Two columns of items | Half the height | antd's Menu has no grid; needs overrides |
| No title row (`closable={false}`, no title) | 57 px more | Loses Close and the dialog's name, "Menu" |
| Leave it | No code | Landscape phones lose the title and the first items |

**Changes the approved design: yes, an addition.** MenuFab.md's drawer bullet
gains: "On short screens it stops `header-height-phone` below the top edge,
and the menu scrolls between the title and the footer."

**Verification:**

- **jsdom:** none, since jsdom has no layout.
- **Browser pane, during implementation:** at 375 × 812 the drawer keeps its
  natural height, measured and recorded; at 375 × 548 and 667 × 375 its top
  sits 56 px below the viewport's, Close and the switch show, and the list
  scrolls to Settings.
- **Playwright** (SF-05, `@phone`): at 412 × 500, Close and the switch are in
  the viewport, the dialog starts at least 56 px from the top, and "Settings"
  scrolls into view and opens its page.
- **T04:** an SE-sized iPhone in Safari; a phone in landscape below `bp-md`.

### SF-05 Tests

**Recommendation:**

- **jsdom:** no new test. SF-02–SF-04 change layout only, which jsdom can't
  measure. The existing shell tests keep covering the FAB's name and
  `aria-expanded`, the drawer, its language switch and closing it.
- **Playwright,** in `e2e/app/navigation.spec.ts` once PR 2 has merged:
  - `@phone`: the FAB's box ends 16 px from the viewport's right and bottom
    edges;
  - `@phone`: the short-screen drawer at 412 × 500 (SF-04);
  - `@phone`, safe areas: Chromium reports no insets, but the Chrome DevTools
    Protocol has an experimental `Emulation.setSafeAreaInsetsOverride`, which
    sets `env(safe-area-inset-*)`. Through `context.newCDPSession(page)`, a
    test sets a 34 px bottom inset and checks the FAB (50 px from the bottom)
    and the footer's switch (at least 34 px up). The implementation prototypes
    it first, in Chrome Headless Shell 156 with Playwright 1.64.1's types. If
    the override does not change `env()`, the test is left out and the insets
    stay with T04, with no further decision.
- **T04 checklist,** recorded in the approval record: SF-02 and SF-03's iPhone
  and Android checks, and SF-04's short screens.

**Why.** Playwright measures real layout in Chromium, which jsdom can't. The
override covers a gap that PR 2's plan lists, `env(safe-area-inset-*)`, and
because it is experimental, the test fails loudly if a Chrome update drops it.

**Alternatives:** jsdom assertions on class names or on antd's injected CSS,
which test the implementation rather than the placement; or no Playwright
checks before T04, so regressions surface late.

### SF-06 Design refresh, records and delivery

**Recommendation:**

- **Design.** As on 2026-11-01, the owner updates the Claude originals first,
  and the implementation PR refreshes `docs/design/` from them through the
  links in its README: MenuFab.md and `ant-design.md`. If the refresh changes
  `tokens.css`, `apps/web/src/ui/tokens.css` stays a byte-identical copy.
- **Pending refresh items.** The same update can carry what the 2026-11-01
  record left for a later refresh: the theme listing's Typography,
  `fontSizeIcon`, `Menu.activeBarBorderWidth`, `Tooltip.controlHeight` and
  `colorPrimaryBg` entries; the language switch's place in TopBar.md,
  SideNav.md and MenuFab.md; the Login README's "English"; and
  `ui/AppProviders.tsx` as the ConfigProvider's owner.
- **Records.** Technical direction gets this plan's approval record, then the
  outcome and evidence. It records the owner's ruling on issue 1 and notes that
  SF-02 reverses the FAB clause of "Hard-to-override styles".
- **Delivery.** A docs PR with this plan and its approval record, then one
  implementation PR, "Part of #118", after PR 2. The owner decides whether
  #118's checklist gains a line for it.

**Why after PR 2.** PR 2's harness gives SF-02 and SF-04 real-layout checks,
which jsdom can't. PR 2's tests stay clear of these behaviors, so the
follow-up changes none of them. No one uses the shell before PR 3, so waiting
costs nothing.

**Alternative:** land it before PR 2, with browser-pane checks only. PR 2 then
takes the Playwright checks above.

## 4. Implementation order

1. The owner updates the Claude originals (SF-06).
2. SF-02 and SF-03: `theme.ts`, `MenuFab.module.css` and its declaration file,
   the footer wrapper; a browser-pane check at 375 × 812.
3. SF-04: the section class; browser-pane checks at 375 × 812, 375 × 548 and
   667 × 375.
4. SF-05: the CDP prototype, then the Playwright checks; `pnpm test:e2e`
   passes.
5. SF-06: the design refresh, the approval record's outcome and evidence, and
   AGENTS.md's repository-state paragraph.

## 5. Verification

### Completion criteria

| Criterion | Evidence |
| --- | --- |
| The FAB sits `fab-offset` plus the inset from the edges | Browser pane and Playwright: 16 px offsets; with the CDP override, if adopted, 50 px |
| The drawer's footer clears the inset | Playwright with the CDP override, if adopted; otherwise T04 |
| The drawer fits short screens, and its list scrolls | Browser pane at 375 × 548 and 667 × 375; Playwright at 412 × 500 |
| The existing shell tests still pass | `pnpm check` (`web-unit`) |
| No new console output | `web-unit`'s and PR 2's console policies |
| The design copy is current | `docs/design/` refreshed from the originals; `cmp` on the token copies |

### Commands

```sh
pnpm check
pnpm test:e2e   # after PR 2: pnpm db:up first, pnpm dev stopped
cmp apps/web/src/ui/tokens.css docs/design/system/tokens.css
git diff --check
```

## 6. Handoff

- **Technical direction:** the approval record, then the outcome, the evidence
  and the T04 checklist.
- **AGENTS.md:** the repository-state paragraph names this plan beside the web
  shell plan as governing `apps/web`.
- **`docs/design/`:** refreshed from the originals (SF-06).
- **For T04:** SF-05's device checks, plus the landscape side insets and
  Chrome's bottom bar with padded content (section 2).
- **For later screens:** StickyActionBar's design pads with
  `env(safe-area-inset-bottom)`, which Chrome's guide discourages; its first
  implementation checks that on Android.

## 7. Risks

- **Stylesheet order (SF-02).** The FAB's margin wins over antd's `margin: 0`
  only because antd injects its styles first, as the SideNav's sticky class
  already relies on. If that ever changes, the FAB loses its inset; the
  Playwright check, if adopted, or T04 would show it.
- **An experimental CDP command.** `Emulation.setSafeAreaInsetsOverride` may
  change or disappear; the test then fails and is adapted or removed.
- **Safari's bars.** Reports differ on what `env(safe-area-inset-bottom)`
  returns while Safari's bottom bar is shown or collapsed. SF-02 follows that
  value, and antd's fixed 48 px ignores it; T04 checks on a device that the
  FAB clears Safari's collapsed bar.
- **Computed heights.** The drawer's heights come from antd's source, not a
  measurement; the implementation records measured values.

## Research and evidence (2026-11-02)

Nothing was installed, and the app was not run: the implementation guide asks
not to install a tool just to research it. This plan reads the installed antd
source in the worktree's `node_modules` (the versions in `pnpm-lock.yaml`) and
published documentation, so its numbers are computed, and the implementation
measures them.

**antd 6.6.8 and its packages:**

- `es/float-button/style/index.js`: `floatButtonInsetBlockEnd: marginXXL` and
  `floatButtonInsetInlineEnd: marginLG`. In `style/button.js`, the individual
  button is `position: fixed` with those insets on
  `.ant-float-btn.ant-float-btn-individual`, and `margin: 0` sits on
  `.ant-float-btn`. A search of `es/button`, `es/float-button`,
  `es/badge/style` and `es/style` finds `marginLG` and `marginXXL` only in
  FloatButton's style.
- `es/config-provider/context.d.ts` and `es/theme/interface/cssinjs-utils.d.ts`:
  `components.<Name>` accepts global tokens (`OverrideToken`).
  `@ant-design/cssinjs-utils` 2.1.2 registers them as CSS variables scoped to
  the component's root class.
- `@ant-design/cssinjs` 2.1.2: `hashPriority: "low"` puts the hash class in
  `:where()`, which adds no specificity, and styles are inserted with
  `prepend: "queue"`, ahead of the app's CSS.
- `es/layout/style/sider.js`: `position: relative` on `.ant-layout-sider`, one
  class.
- `es/drawer/style/index.js`: the bottom wrapper has `bottom: 0` and no maximum
  height. The section is a flex column with `height: 100%` and
  `overflow: auto`; the body has `flex: 1`, `min-height: 0` and
  `overflow: auto`; the footer has `flex-shrink: 0` and 8 px
  (`footerPaddingBlock`) padding under `.ant-drawer .ant-drawer-footer`; the
  header pads 16 px by 24 px around a 24 px line.
- `@rc-component/drawer` 1.4.2: `size="auto"` becomes the wrapper's inline
  `height: auto`, and the section carries `role="dialog"`. antd's
  `DrawerPanel.d.ts` lists the semantic `classNames` and `styles` parts: root,
  mask, header, title, extra, section, body, footer, wrapper, dragger and
  close.
- **Heights:** title 16 + 24 + 16 + 1 = 57 px; body 24 + 4 + 8 × 44 + 7 × 4 +
  4 + 24 = 436 px (`Menu.itemHeight` 44, `itemMarginBlock` 4, with adjacent
  margins collapsing); footer 1 + 8 + 44 + 8 = 61 px; about 555 px in all.

**Documentation:**

- Chrome's [edge-to-edge guide](https://developer.chrome.com/docs/css-ui/edge-to-edge)
  (published 2025-02-28): from Chrome 135, on small-screen Android devices, a
  `viewport-fit=cover` page extends into the gesture navigation bar.
  `env(safe-area-inset-bottom)` updates while Chrome's bottom bar slides away,
  and bottom-fixed content is offset by it. The guide advises against padding
  with the inset, which causes re-layouts and can stop the bar from sliding,
  and says its advice also applies to Chrome on iOS.
- The Chrome DevTools Protocol's
  [Emulation domain](https://chromium.googlesource.com/devtools/devtools-frontend/+/main/node_modules/devtools-protocol/pdl/domains/Emulation.pdl):
  the experimental `setSafeAreaInsetsOverride` overrides
  `env(safe-area-inset-*)` and `env(safe-area-max-inset-*)`.
- antd 6 [Drawer](https://ant.design/components/drawer): `size` takes numbers
  and strings (strings since 6.2.0); `"auto"` is not documented, and no
  maximum height is, apart from `maxSize` for resizable drawers.
  [FloatButton](https://ant.design/components/float-button): no offset prop or
  component token; its `styles.root` holds the fixed positioning.
- iOS Safari: reports differ on `env(safe-area-inset-bottom)` with Safari's
  bars shown or hidden
  ([Apple Developer Forums](https://developer.apple.com/forums/thread/699415),
  [WebKit bug 190771](https://bugs.webkit.org/show_bug.cgi?id=190771)); T04
  settles it on a device.
