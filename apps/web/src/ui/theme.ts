import type { ThemeConfig } from "antd";

// Values from docs/design/system/tokens.json, with the web shell plan's
// corrections (WS-07). Keep this file and tokens.json in step: a value changes
// in both or in neither.
const ink = "#161b21";
const inkMuted = "#57606a";
const surface = "#ffffff";
const surfacePage = "#f6f7f9";
const surfaceSunken = "#eef0f3";
const focusRing = "#1d5fc2";
const shadowOverlay =
  "0 8px 24px rgba(22, 27, 33, 0.14), 0 2px 6px rgba(22, 27, 33, 0.08)";
const shadowFab =
  "0 6px 16px rgba(22, 27, 33, 0.24), 0 2px 4px rgba(22, 27, 33, 0.12)";

const token: ThemeConfig["token"] = {
  colorPrimary: ink,
  colorPrimaryHover: "#2c343d",
  colorInfo: focusRing,
  colorLink: focusRing,
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
  // WS-07 #3: colorTextBase alone renders body text as ink at 88% opacity.
  colorText: ink,
  colorTextSecondary: inkMuted,
  colorTextDescription: inkMuted,
  colorTextPlaceholder: inkMuted,
  colorTextDisabled: "#9aa1aa",
  colorBgBase: surface,
  colorBgLayout: surfacePage,
  colorFillSecondary: surfaceSunken,
  colorBgContainerDisabled: surfaceSunken,
  colorBorder: "#7f8791",
  colorBorderSecondary: "#e3e6ea",
  colorSplit: "#e3e6ea",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  fontFamilyCode:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
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
  boxShadowSecondary: shadowOverlay,
};

const components = {
  Button: {
    primaryShadow: "none",
    defaultShadow: "none",
    dangerShadow: "none",
    fontWeight: 500,
  },
  Input: {
    activeBorderColor: ink,
    hoverBorderColor: ink,
    activeShadow: `0 0 0 2px ${focusRing}`,
  },
  Select: {
    activeBorderColor: ink,
    hoverBorderColor: ink,
    optionSelectedBg: surfaceSunken,
  },
  // WS-07 #4 and #5: header-height (64) from bp-md; the Sider's background and
  // trigger tokens do nothing on a light Sider, so they are not set.
  Layout: {
    headerBg: surface,
    bodyBg: surfacePage,
    headerHeight: 64,
    headerPadding: "0 24px",
  },
  Menu: {
    itemSelectedBg: surfaceSunken,
    itemSelectedColor: ink,
    itemHoverBg: surfaceSunken,
    itemHeight: 44,
    iconSize: 20,
    collapsedIconSize: 20,
  },
  // WS-07 #9: the FAB's shadow-fab through the token FloatButton reads. Its
  // icon is fontSizeIcon x 1.5: 24px, as MenuFab.md asks.
  FloatButton: {
    controlHeightLG: 56,
    boxShadowSecondary: shadowFab,
    fontSizeIcon: 16,
  },
  Tag: { defaultBg: surfaceSunken, defaultColor: inkMuted },
  // Every h1 is a page title in title-lg (22/30/600), and spacing comes from
  // layout gaps (owner, 2026-11-01).
  Typography: {
    fontSizeHeading1: 22,
    lineHeightHeading1: 30 / 22,
    titleMarginBottom: 0,
  },
} satisfies ThemeConfig["components"];

export const theme: ThemeConfig = { token, components };

// Below bp-md: header-height-phone (56) and the phone gutter (WS-07 #4).
export const phoneTheme: ThemeConfig = {
  token,
  components: {
    ...components,
    Layout: { ...components.Layout, headerHeight: 56, headerPadding: "0 16px" },
  },
};
