# Ant Design

Every control in StorageMinis is an **Ant Design 6** component. We don't build our own buttons, inputs, tags, menus, drawers or modals. The brand lives in how antd is themed, and our own code only arranges antd components into screens.

## Where styling goes, in order

1. **Global theme tokens** in `ConfigProvider` (`theme.token`): colors, font, sizes, radii. Most of the look comes from here.
2. **Component tokens** (`theme.components.<Name>`) for what the global tokens can't express, such as a Button with no shadow or the Menu's selected background.
3. **Component props** for one-off variants: `type`, `danger`, `size`, `bordered`, `variant`.
4. **CSS Modules** for page layout only: grids, gutters, sticky bars, card grids. Use a `className` on the antd component and the `var(--…)` tokens from this system.

Don't target `.ant-*` classes globally, don't use `!important`, and don't copy antd components into the repository. If a look can't be reached through steps 1 to 3, list it in *Allowed overrides* below with the reason.

## Token mapping

| StorageMinis token | antd token |
| --- | --- |
| `ink` | `colorPrimary`, `colorTextBase` |
| `ink-hover` | `colorPrimaryHover` |
| `ink-muted` | `colorTextSecondary`, `colorTextDescription`, `colorTextPlaceholder` |
| `ink-disabled` | `colorTextDisabled` |
| `surface` | `colorBgBase`, `colorBgContainer`, `colorBgElevated` |
| `surface-page` | `colorBgLayout` |
| `surface-sunken` | `colorFillSecondary`, `colorBgContainerDisabled` |
| `line` | `colorBorderSecondary`, `colorSplit` |
| `line-strong` | `colorBorder` |
| `info`, `focus-ring` | `colorInfo`, `colorLink` |
| `info-soft` | `colorInfoBg` |
| `success`, `success-soft` | `colorSuccess`, `colorSuccessBg` |
| `warning`, `warning-soft` | `colorWarning`, `colorWarningBg` |
| `racing-red`, `racing-red-hover` | `colorError`, `colorErrorHover` |
| `racing-red-soft` | `colorErrorBg` |
| `racing-red-text` | `colorErrorText` |
| `sans`, `mono` | `fontFamily`, `fontFamilyCode` |
| `body`, `body-lg`, `caption` | `fontSize` 14, `fontSizeLG` 16, `fontSizeSM` 12 |
| `radius-sm`, `radius-md`, `radius-lg` | `borderRadiusSM` 4, `borderRadius` 6, `borderRadiusLG` 10 |
| `control-sm`, `control-md`, `control-touch` | `controlHeightSM` 32, `controlHeight` 40, `controlHeightLG` 44 |
| `shadow-overlay` | `boxShadowSecondary` |

## The theme

```ts
// apps/web/src/ui/theme.ts
import type { ThemeConfig } from "antd";

const ink = "#161b21";
const surfaceSunken = "#eef0f3";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: ink,
    colorPrimaryHover: "#2c343d",
    colorInfo: "#1d5fc2",
    colorLink: "#1d5fc2",
    colorInfoBg: "#e8f0fc",
    colorSuccess: "#1b7a43",
    colorSuccessBg: "#e5f3eb",
    colorWarning: "#94570a",
    colorWarningBg: "#fdf2df",
    colorError: "#ba0101",
    colorErrorHover: "#960000",
    colorErrorBg: "#fdeceb",
    colorErrorText: "#ba0101",
    colorTextBase: ink,
    colorTextSecondary: "#57606a",
    colorTextDescription: "#57606a",
    colorTextPlaceholder: "#57606a",
    colorTextDisabled: "#9aa1aa",
    colorBgBase: "#ffffff",
    colorBgLayout: "#f6f7f9",
    colorFillSecondary: surfaceSunken,
    colorBgContainerDisabled: surfaceSunken,
    colorBorder: "#7f8791",
    colorBorderSecondary: "#e3e6ea",
    colorSplit: "#e3e6ea",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    fontFamilyCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontWeightStrong: 600,
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 10,
    controlHeight: 40,
    controlHeightLG: 44,
    controlHeightSM: 32,
    boxShadowSecondary: "0 8px 24px rgba(22, 27, 33, 0.14), 0 2px 6px rgba(22, 27, 33, 0.08)",
  },
  components: {
    Button: { primaryShadow: "none", defaultShadow: "none", dangerShadow: "none", fontWeight: 500 },
    Input: { activeBorderColor: ink, hoverBorderColor: ink, activeShadow: "0 0 0 2px #1d5fc2" },
    Select: { activeBorderColor: ink, hoverBorderColor: ink, optionSelectedBg: surfaceSunken },
    Layout: { headerBg: "#ffffff", bodyBg: "#f6f7f9", siderBg: "#ffffff", triggerBg: "#ffffff", triggerColor: ink, triggerHeight: 48 },
    Menu: { itemSelectedBg: surfaceSunken, itemSelectedColor: ink, itemHoverBg: surfaceSunken, itemHeight: 44, iconSize: 20, collapsedIconSize: 20 },
    FloatButton: { controlHeightLG: 56 },
    Tag: { defaultBg: surfaceSunken, defaultColor: "#57606a" },
  },
};
```

- `main.tsx` wraps the app in `<ConfigProvider theme={theme} locale={…} componentSize={isPhone ? "large" : "middle"}>`. Below `bp-md`, `large` gives 44px controls and 16px input text, which avoids iOS zoom on focus.
- Keep `theme.ts` and `tokens.json` in step: a value changes in both or in neither.
- Check every token name against the antd 6 theme editor in the first web PR. antd ignores names it doesn't know without warning.

## Allowed overrides

These are the only global rules on antd classes, kept in `apps/web/src/ui/antd-overrides.css`:

```css
/* One visible focus ring everywhere: focus-ring, 2px, offset 2px (3:1+ on every surface). */
.ant-btn:focus-visible,
.ant-menu-item:focus-visible,
.ant-tag-checkable:focus-visible,
.ant-switch:focus-visible,
.ant-checkbox-input:focus-visible + .ant-checkbox-inner,
.ant-radio-input:focus-visible + .ant-radio-inner {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
/* Amounts, counts and IDs line up in columns. */
.ant-statistic-content,
.ant-table-cell,
.ant-input-number-input {
  font-variant-numeric: tabular-nums;
}
```

- **Focus:** antd's own focus outline is a soft tint of `colorPrimary` that doesn't reach 3:1 everywhere with an ink primary.
- **Tabular numbers:** antd has no token for numeric figures.

## Which antd component for what

| Need | antd | Notes |
| --- | --- | --- |
| Actions | `Button` | `type="primary"` is ink, the default type is outlined, `type="text"`. Attention is `type="primary" danger` |
| Status words | `Tag` with `bordered={false}` and `color="success" \| "warning" \| "processing" \| "error"` | See `StatusTag` |
| Records list | `List`, `List.Item`, `List.Item.Meta` | See `ListRow` |
| Catalog item | `Card` with `cover` and `Card.Meta` | See `ItemCard` |
| Money and IDs | `Typography.Text` (`strong`, `code`), `Statistic` for totals | Formatting comes from `lib/format` |
| Forms | `Form.Item` (layout `vertical`), `Input`, `InputNumber`, `Select`, `DatePicker` through our TanStack Form field wrappers | See `FormField` |
| Search and filters | `Input` (`allowClear`, prefix icon), `Button`, `Badge`, `Drawer` (`placement="bottom"` on phones) | See `SearchBar` |
| Main menu, phones | `FloatButton` (bottom right) opening a `Drawer` (`placement="bottom"`) with `Menu` | See `MenuFab` |
| Main menu, desktop | `Layout.Sider` (`collapsible`, `width` 240, `collapsedWidth` 72, `theme="light"`) with `Menu mode="inline"` | See `SideNav` |
| Header | `Layout.Header`, `Avatar`, `Dropdown` | See `TopBar` |
| Feedback | `Alert`, `message`, `notification`, `Modal.confirm`, `Result`, `Empty`, `Skeleton` | Errors use the `error` type (racing red), always with words |
| Data-heavy screens | `Table` | Only when a list won't do, and its phone layout is decided per screen |
| Icons | `@ant-design/icons` Outlined | 16px inline, 20px in bars |
