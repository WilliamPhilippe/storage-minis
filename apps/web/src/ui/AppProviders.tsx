import { App, ConfigProvider, Grid } from "antd";
import type { ReactNode } from "react";
import { useLocale } from "../i18n/useLocale";
import { phoneTheme, theme } from "./theme";

// Wraps the whole app, including the Login and catalog pages. Below bp-md,
// `large` gives 44px controls and 16px input text, which avoids iOS zoom on
// focus; from bp-md, `medium` gives 40px controls.
export function AppProviders({ children }: { children: ReactNode }) {
  const { antdLocale } = useLocale();
  const isPhone = !Grid.useBreakpoint().md;
  return (
    <ConfigProvider
      theme={isPhone ? phoneTheme : theme}
      locale={antdLocale}
      componentSize={isPhone ? "large" : "medium"}
    >
      {/* antd App gives message and notification calls the theme. */}
      <App>{children}</App>
    </ConfigProvider>
  );
}
